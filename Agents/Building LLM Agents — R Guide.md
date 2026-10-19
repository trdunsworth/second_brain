---
type: reference
status: active
topic: "Tutorial and guide for building LLM-based agents in R — ellmer, Shiny, tool use, and embedding agents in products."
created: 2026-10-19
updated: 2026-10-19
tags:
  - agents
  - r
  - llm
  - reference
---

# Building LLM Agents — R Guide

A practical guide to building LLM-based agents in R. Covers the [ellmer](https://ellmer.tidyverse.org/) package for LLM interaction, [Shiny](https://shiny.posit.co/) for embedding agents in web apps, and patterns for both interactive and embedded agent workflows.

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

chat <- chat_anthropic(model = "claude-sonnet-4-20250514")
chat$turn("Hello! What can you help me with?")
```

### Multi-Turn Conversation

```r
chat <- chat_openai(model = "gpt-4o", system_prompt = "You are a helpful data analyst.")
chat$turn("What is the mean of c(1, 2, 3, 4, 5)?")
chat$turn("Now compute the standard deviation.")
```

### Streaming Output

```r
chat <- chat_openai()
stream <- chat$stream("Tell me about R")
for (chunk in stream) {
  cat(chunk)
}
```

---

## Basic Agent Loop in R

```r
library(ellmer)

run_agent <- function(user_input, tools = list(), max_turns = 10) {
  chat <- chat_openai(
    model = "gpt-4o",
    system_prompt = "You are a helpful assistant. Use tools when appropriate."
  )
  
  # Register tools
  for (tool in tools) {
    chat$register_tool(tool)
  }
  
  # Agent loop
  response <- chat$turn(user_input)
  turns <- 1
  
  while (!is.null(response$tool_calls) && turns < max_turns) {
    tool_results <- lapply(response$tool_calls, execute_tool)
    response <- chat$turn(tool_results)
    turns <- turns + 1
  }
  
  response$text
}
```

---

## Tool Use / Function Calling

ellmer supports OpenAI-compatible function calling. Tools are R functions with documented parameters.

### Defining a Tool

```r
query_database <- Tool$new(
  name = "query_database",
  description = "Execute a SQL query against the analytics database.",
  parameters = list(
    sql = list(type = "string", description = "SQL query to execute")
  ),
  function(sql) {
    con <- DBI::dbConnect(duckdb::duckdb())
    result <- DBI::dbGetQuery(con, sql)
    DBI::dbDisconnect(con)
    result
  }
)

# Register with chat
chat <- chat_openai()
chat$register_tool(query_database)
```

### Tool Design Principles (R-Specific)

1. **Document with roxygen2-style comments** — ellmer uses these for schema generation
2. **Return data frames** — natural R output, easy to serialize
3. **Handle errors gracefully** — return informative error strings
4. **Use `withr::defer()` for cleanup** — close connections, release resources

---

## Embedding Agents in Shiny Apps

[Shiny](https://shiny.posit.co/) is R's web framework. Embedding an agent in Shiny makes it accessible to non-technical users.

### Minimal Shiny Agent App

```r
library(shiny)
library(ellmer)

ui <- fluidPage(
  titlePanel("Analytics Assistant"),
  sidebarLayout(
    sidebarPanel(
      textInput("query", "Ask a question:"),
      actionButton("ask", "Submit")
    ),
    mainPanel(
      verbatimTextOutput("response")
    )
  )
)

server <- function(input, output, session) {
  chat <- chat_openai(
    model = "gpt-4o",
    system_prompt = "You are an analytics assistant. Answer questions about our sales data."
  )
  
  observeEvent(input$ask, {
    response <- chat$turn(input$query)
    output$response <- renderPrint({
      response$text
    })
  })
}

shinyApp(ui, server)
```

### Patterns for Shiny Agents

| Pattern | Description |
|---------|-------------|
| **Chat sidebar** | Persistent chat panel alongside data visualizations |
| **Form filler** | Agent helps users complete complex forms |
| **Report generator** | User describes report → agent generates quarto/Rmd |
| **Data explorer** | Agent writes and executes SQL based on natural language |

### Production Considerations

- **Async processing** — use `promises` + `future` to avoid blocking the Shiny session
- **Session state** — store conversation history per user session
- **Rate limiting** — throttle API calls to control costs
- **Error handling** — wrap `chat$turn()` in tryCatch with user-friendly messages

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
- [Shiny](https://shiny.posit.co/)
- [ShinyLive](https://shinylive.io/)
- [Posit Generative AI resources](https://www.rstudio.com/ai/)
- [R for Data Science (2e)](https://r4ds.hadley.nz/)
- [Shiny in Production](https://shiny.posit.co/r/articles/implement/production/)

---

*Created: 2026-10-19*
