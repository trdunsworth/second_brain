---
type: reference
status: active
topic: "Tutorial and guide for building LLM-based agents in R — ellmer, Shiny, tool use, and embedding agents in products."
created: 2026-10-19
updated: 2026-11-05
tags:
  - agents
  - r
  - llm
  - reference
---

# Building LLM Agents — R Guide

A practical guide to building LLM-based agents in R. Covers the [ellmer](https://ellmer.tidyverse.org/) package for LLM interaction, [Shiny](https://shiny.posit.co/) for embedding agents in web apps, and patterns for both interactive and embedded agent workflows.

> **Canonical R notes:** see [AI with R — Overview](../R%20Programming/AI/01_AI_with_R_Overview.md), the [ellmer Tutorial](../R%20Programming/AI/02_ellmer_Tutorial.md), and [Local LLMs and Agents](../R%20Programming/AI/04_Local_LLMs_and_Agents.md). This guide focuses on agent architecture; those notes cover the current ellmer API in depth.

---

## Table of Contents

1. [Why R for Agents?](#why-r-for-agents)
2. [ellmer — The Core LLM Interface](#ellmer--the-core-llm-interface)
3. [Basic Agent Loop in R](#basic-agent-loop-in-r)
4. [Tool Use / Function Calling](#tool-use--function-calling)
5. [Embedding Agents in Shiny Apps](#embedding-agents-in-shiny-apps)
6. [Shinylive — Browser-Based Agents](#shinylive--browser-based-agents)
7. [Markdown as Agent I/O](#markdown-as-agent-io)
8. [Sources & Further Reading](#sources--further-reading)

---

## Why R for Agents?

R excels at data analysis, statistics, and reporting — domains where many domain experts already work. An R-based agent can:

- Query databases directly (DBI, duckdb)
- Generate reports and visualizations (ggplot2, gt, quarto)
- Perform statistical analysis as a "tool"
- Serve interactive agents via Shiny

**Best for:** Data-heavy agents, internal analytics assistants, statistical copilots, research assistants.

---

## ellmer — The Core LLM Interface

[ellmer](https://ellmer.tidyverse.org/) is Posit's package for interfacing with LLMs from R. It supports OpenAI, Anthropic, Google, Ollama, and many more providers.

### Installation

```r
install.packages("ellmer")
```

### Basic Usage

```r
library(ellmer)

chat <- chat_anthropic(
  system_prompt = "You are a helpful data analyst.",
  model = "claude-sonnet-5"
)

chat$chat("Hello! What can you help me with?")
```

`$chat()` returns the assistant's reply as a string and keeps the conversation. The old `$turn()` method was removed; do not copy it from older tutorials.

### Multi-Turn Conversation

```r
chat <- chat_openai(
  system_prompt = "You are a helpful data analyst.",
  model = "gpt-5.6-terra"
)

chat$chat("What is the mean of c(1, 2, 3, 4, 5)?")
chat$chat("Now compute the standard deviation.")
```

The chat object resends the whole history on every call. For long agent runs, start fresh with a better prompt or compact the history with `chat$set_turns()`.

### Streaming Output

```r
chat <- chat_openai(model = "gpt-5.6-terra")
stream <- chat$stream("Tell me about R")

coro::loop(for (chunk in stream) {
  cat(chunk)
})
```

---

## Basic Agent Loop in R

ellmer already implements the agent loop. `chat$chat()` sends the prompt, runs any tools the model requests, sends the tool results back, and repeats until the model produces a final answer. You do not need to write a `while` loop for the common case.

```r
library(ellmer)

run_agent <- function(user_input, tools = list()) {
  chat <- chat_openai(
    system_prompt = "You are a helpful assistant. Use tools when appropriate.",
    model = "gpt-5.6-terra"
  )

  chat$register_tools(tools)
  chat$chat(user_input, echo = "none")
}
```

What you *do* need to control is when the loop stops. Use a budget counter and `tool_reject()`:

```r
calls <- 0L

budgeted_tool <- tool(
  function(query) {
    calls <<- calls + 1L
    if (calls > 5L) {
      tool_reject("Tool budget used up. Answer with what you have.")
    }
    run_query(query)
  },
  name = "query",
  description = "Run a read-only query.",
  arguments = list(query = type_string("The query to run."))
)
```

For a fully custom loop — for example, a planner/executor split — use separate chat objects and pass structured hand-offs between them. Do not try to reimplement ellmer's tool loop on a single chat object.

---

## Tool Use / Function Calling

ellmer supports OpenAI-compatible function calling. Tools are R functions with documented parameters.

### Defining a Tool

```r
con <- DBI::dbConnect(duckdb::duckdb(), "analytics.duckdb", read_only = TRUE)

query_database <- tool(
  function(sql) {
    if (!grepl("^\\s*SELECT\\b", sql, ignore.case = TRUE)) {
      tool_reject("Only SELECT statements are allowed.")
    }
    result <- DBI::dbGetQuery(con, sql)
    jsonlite::toJSON(result, auto_unbox = TRUE)
  },
  name = "query_database",
  description = "Execute a read-only SQL SELECT against the analytics database.",
  arguments = list(
    sql = type_string("A single SELECT statement. Use LIMIT 100 unless aggregating.")
  )
)

# Register with chat
chat <- chat_openai(model = "gpt-5.6-terra")
chat$register_tool(query_database)
```

### Tool Design Principles (R-Specific)

1. **Describe arguments with `type_*()`** — names, types, units, and formats shape the model's call.
2. **Return a string, atomic vector, JSON string, or `Content` object.** Data frames and bare lists are deprecated; convert with `jsonlite::toJSON()`.
3. **Compute exact results inside the tool.** The model can read JSON but cannot calculate with it.
4. **Validate arguments as untrusted input.** Prefer a read-only database role over regex-only SQL checks.
5. **Handle errors gracefully** — return an informative message or call `tool_reject()`.
6. **Use `withr::defer()` or `on.exit()` for cleanup** — close connections, release resources.
7. **Keep tool count small.** Every tool is an attack surface and a source of confusion.

---

## Embedding Agents in Shiny Apps

[Shiny](https://shiny.posit.co/) is R's web framework. Embedding an agent in Shiny makes it accessible to non-technical users.

### Minimal Shiny Agent App

Use [shinychat](https://posit-dev.github.io/shinychat/r/) for the chat UI. It handles streaming, markdown, and async correctly.

```r
library(shiny)
library(shinychat)
library(ellmer)

ui <- page_chat("Analytics Assistant", id = "chat")

server <- function(input, output, session) {
  chat <- chat_openai(
    system_prompt = "You are an analytics assistant. Answer questions about our sales data.",
    model = "gpt-5.6-terra"
  )

  observeEvent(input$chat_user_input, {
    stream <- chat$stream_async(input$chat_user_input)
    chat_append("chat", stream)
  })
}

shinyApp(ui, server)
```

Create the chat **inside** the server function so each user gets an isolated history. Use `$stream_async()` and `chat_append()`; a synchronous `$chat()` blocks every other user for the duration of the response.

### Patterns for Shiny Agents

| Pattern | Description |
|---------|-------------|
| **Chat sidebar** | Persistent chat panel alongside data visualizations |
| **Form filler** | Agent helps users complete complex forms |
| **Report generator** | User describes report → agent generates quarto/Rmd |
| **Data explorer** | Agent writes and executes SQL based on natural language |

### Production Considerations

- **Async processing** — use `$chat_async()` / `$stream_async()` or `shiny::ExtendedTask`; never block the session.
- **Session state** — one chat object per user session; cap history length.
- **Rate limiting** — throttle API calls per user and per IP.
- **Error handling** — wrap model calls with `tryCatch()` and show a useful fallback.
- **Secrets** — keep keys server-side; never send them to the browser.
- **Cost** — log `chat$get_tokens()` and `chat$get_cost()`; set budgets.
- **Observability** — log model, prompt version, tool calls, latency, and outcome.
- **Evaluation** — run a [vitals](https://vitals.tidyverse.org/) task before changing prompts or models.

---

## Shinylive — Browser-Based Agents

[Shinylive](https://shinylive.io/) runs Shiny apps entirely in the browser via WebAssembly. This enables:

- **Zero-backend agents** — LLM calls happen client-side
- **Static hosting** — deploy to GitHub Pages or any static host
- **Privacy** — data never leaves the user's browser

```r
# Deploy a Shiny app with shinylive
shinylive::export("app_dir", "site_dir")
# Then host site_dir on any static server
```

> **Note:** LLM API keys must be embedded or user-supplied. Never hard-code secrets in client-side apps.

---

## Markdown as Agent I/O

Markdown is the lingua franca of LLM agents. Use it for:

- **Structured input** — system prompts, tool descriptions
- **Formatted output** — tables, code blocks, headers
- **Human-readable logs** — agent reasoning traces

### Generating Markdown from R

```r
# Using gt for tables
library(gt)
result <- data.frame(
  Metric = c("MAE", "RMSE", "MAPE"),
  Value = c(2.3, 3.1, 4.5)
)
gt(result) |> as_raw_html()

# Using knitr for markdown output
knitr::kable(result, format = "markdown")
```

### Parsing Markdown in R

```r
# Using commonmark
library(commonmark)
markdown_html <- markdown_commonmark("# Hello\n\nWorld")

# Extract code blocks
library(stringr)
code_blocks <- str_extract_all(text, "```r\\n(.*?)```")[[1]]
```

---

## Sources & Further Reading

- [ellmer documentation](https://ellmer.tidyverse.org/)
- [ellmer tool/function calling](https://ellmer.tidyverse.org/articles/tool-calling.html)
- [shinychat documentation](https://posit-dev.github.io/shinychat/r/)
- [vitals — LLM evaluation](https://vitals.tidyverse.org/)
- [ragnar — retrieval-augmented generation](https://ragnar.tidyverse.org/)
- [mcptools — Model Context Protocol in R](https://posit-dev.github.io/mcptools/)
- [Shiny](https://shiny.posit.co/)
- [ShinyLive](https://shinylive.io/)
- [Posit Generative AI resources](https://www.rstudio.com/ai/)
- [R for Data Science (2e)](https://r4ds.hadley.nz/)
- [Shiny in Production](https://shiny.posit.co/r/articles/implement/production/)

### Related vault notes

- [[01_AI_with_R_Overview|AI with R — Overview]]
- [[02_ellmer_Tutorial|ellmer Tutorial]]
- [[03_ellmer_Cheatsheet|ellmer Cheatsheet]]
- [[04_Local_LLMs_and_Agents|Local LLMs and Agents]]
- [[RAG Systems — Retrieval-Augmented Generation]]
- [[MCP — Model Context Protocol Guide]]
- [[Testing and Evaluation Strategies for Agents]]
- [[Secure Agent Guardrails]]

---

*Created: 2026-10-19 · Updated: 2026-11-05*
