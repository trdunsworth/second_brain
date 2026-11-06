# ellmer Cheatsheet — Quick Reference

Command-first reference for **ellmer 0.5.0**.

> **Docs:** <https://ellmer.tidyverse.org/> · **Checked:** 2026-11-05

---

## 1. Install and authenticate

```r
install.packages("ellmer")
library(ellmer)

# Edit ~/.Renviron, then restart R
usethis::edit_r_environ()

# Check without printing the key
nzchar(Sys.getenv("OPENAI_API_KEY"))
```

| Provider | Function | Key |
|----------|----------|-----|
| OpenAI | `chat_openai()` | `OPENAI_API_KEY` |
| Anthropic | `chat_anthropic()`, `chat_claude()` | `ANTHROPIC_API_KEY` |
| Google Gemini | `chat_google_gemini()` | `GOOGLE_API_KEY` / `GEMINI_API_KEY` |
| Google Vertex | `chat_google_vertex()` | Google Cloud credentials |
| Posit AI | `chat_posit()` | OAuth device flow |
| Azure OpenAI | `chat_azure_openai()` | Azure credentials |
| AWS Bedrock | `chat_aws_bedrock()` | AWS credentials |
| Ollama | `chat_ollama()` | None locally |
| LM Studio | `chat_lmstudio()` | None locally |
| OpenRouter | `chat_openrouter()` | `OPENROUTER_API_KEY` |
| Groq | `chat_groq()` | `GROQ_API_KEY` |
| Mistral | `chat_mistral()` | `MISTRAL_API_KEY` |
| DeepSeek | `chat_deepseek()` | `DEEPSEEK_API_KEY` |
| Any OpenAI-compatible | `chat_openai_compatible()` | Provider-specific |
| Generic string | `chat("provider/model")` | Provider-specific |

---

## 2. Create a chat

```r
chat <- chat_openai(
  system_prompt = "You are a concise R programming assistant.",
  model = "gpt-5.6-terra",
  params = params(temperature = 0.2, max_tokens = 1500, seed = 42),
  echo = "none"
)
```

| Argument | Purpose |
|----------|---------|
| `system_prompt` | Durable instructions for the conversation |
| `model` | Pin the model; defaults change |
| `params` | `temperature`, `top_p`, `top_k`, `seed`, `max_tokens`, `reasoning_effort`, … |
| `api_args` | Provider-specific body fields, passed through |
| `api_headers` | Extra HTTP headers |
| `credentials` | Custom auth callback; rarely needed |
| `echo` | `"none"`, `"output"`, `"all"` |
| `base_url` | Self-hosted or proxy endpoint |

### Generic constructor

```r
chat("anthropic/claude-sonnet-5")
chat("openai/gpt-5.6-terra", system_prompt = "Be terse.")
chat("ollama/llama3.2")
```

### Discover models

```r
models_openai()
models_anthropic()
models_google_gemini()
models_ollama()
```

### Switch model or prompt

```r
chat$get_model()
chat$set_model("gpt-5.6-terra")
chat$get_system_prompt()
chat$set_system_prompt("New instructions.")
```

### Interactive helpers

```r
live_console(chat)
live_browser(chat)
```

---

## 3. Chat methods

| Method | Returns | Use |
|--------|---------|-----|
| `$chat(...)` | character | One response; history retained |
| `$chat_async(...)` | promise → character | Non-blocking chat |
| `$stream(...)` | coro generator | Stream text chunks |
| `$stream_async(...)` | async generator | Stream in Shiny |
| `$chat_structured(..., type)` | list / tibble | Schema-constrained extraction |
| `$chat_structured_async(..., type)` | promise | Async extraction |
| `$get_turns()` | list of `Turn` | Full history |
| `$set_turns(list())` | — | Clear history |
| `$get_rounds()` | list of `Round` | Grouped user/assistant/tool turns |
| `$last_turn()` | `Turn` or `NULL` | Most recent assistant turn |
| `$get_tokens()` | data frame | Per-turn tokens and cost |
| `$get_cost()` | `ellmer_dollars` | Cumulative or `"last"` cost |
| `$token_count(...)` | integer | Estimate input tokens |
| `$register_tool(tool)` | — | Add one tool |
| `$register_tools(list)` | — | Add several tools |
| `$get_tools()` | list | Inspect registered tools |
| `$set_tools(list)` | — | Replace tools (expert) |
| `$clone()` | `Chat` | Branch a conversation |
| `$get_provider()` | `Provider` | Expert use |

```r
chat$chat("Question")
chat$chat("Question", echo = "none")
chat$get_tokens()
chat$get_cost("last")
```

### Reset vs clone

```r
# Clear history, keep system prompt
chat$set_turns(list())

# Independent copy, same history
branch <- chat$clone()
```

---

## 4. Prompt helpers

```r
interpolate("Summarise {{text}} for {{audience}}")
interpolate_file("prompts/summary.md", text = text, audience = "managers")
df_schema(mtcars)
```

| Helper | Purpose |
|--------|---------|
| `interpolate()` | Glue-style string with `{{ }}` |
| `interpolate_file()` | Same, from a file |
| `interpolate_package()` | Same, from `inst/prompts` |
| `df_schema()` | Compact data-frame description for the model |

```r
prompt <- interpolate("
  Schema:
  {{schema}}

  Write dplyr code to compute monthly revenue by region.
", schema = df_schema(sales))
```

---

## 5. Streaming

```r
stream <- chat$stream("Explain the tidyverse.")

coro::loop(for (chunk in stream) {
  cat(chunk)
})
```

```r
# Rich content objects
stream <- chat$stream("Summarise this.", stream = "content")
```

```r
# Write to a file
con <- file("answer.md", open = "wt")
on.exit(close(con), add = TRUE)

stream <- chat$stream("Draft a methods section.")
coro::loop(for (chunk in stream) writeLines(chunk, con, sep = ""))
```

| `echo` | Behaviour |
|--------|-----------|
| `"none"` | Silent |
| `"output"` | Echo assistant response |
| `"all"` | Echo input and output |

Use `echo = "none"` in functions, reports, and apps.

---

## 6. Async

```r
library(promises)

chat$chat_async("Summarise this.") %...>% print()
```

```r
promises::then(
  chat$chat_async("Summarise this."),
  \(text) cat(text)
)
```

```r
stream <- chat$stream_async("Tell me a story.")

coro::async(function() {
  for (chunk in await_each(stream)) cat(chunk)
})()
```

| Rule | Reason |
|------|--------|
| One chat per concurrent session | History is shared mutable state |
| Prefer `chat_append()` in Shiny | Handles async streaming correctly |
| Wrap long tasks in `ExtendedTask` | Avoid blocking the session |

---

## 7. Structured data

```r
result <- chat$chat_structured(
  "My name is Susan and I am 13 years old.",
  type = type_object(
    name = type_string("Full name"),
    age = type_number("Age in years")
  )
)
```

### Types

| Function | R result | Notes |
|----------|----------|-------|
| `type_string()` | character | |
| `type_number()` | double | |
| `type_integer()` | integer | |
| `type_boolean()` | logical | |
| `type_enum(values)` | factor | Fixed set |
| `type_array(item)` | vector/list | Same item type |
| `type_object(...)` | named list | Fields as arguments |
| `type_ignore()` | — | Model omits an argument with a default |
| `type_from_schema()` | — | Reuse JSON schema |

Every type accepts `description` and `required`.

```r
type_person <- type_object(
  "A person mentioned in the text.",
  name = type_string("Full name"),
  age = type_integer("Age in years", required = FALSE),
  role = type_enum(c("author", "subject", "other"), "Role", required = FALSE)
)
```

### Arrays of objects → tibble

```r
type_ticket <- type_object(
  id = type_string("Ticket ID"),
  product = type_string("Product"),
  sentiment = type_enum(c("negative", "neutral", "positive"), "Sentiment"),
  urgent = type_boolean("Needs a reply within 24 hours?"),
  tags = type_array(type_string(), "Short topic tags")
)

type_tickets <- type_array(type_ticket, "All tickets")

tickets <- chat$chat_structured(ticket_text, type = type_tickets)
```

| Pattern | Result |
|---------|--------|
| `type_object()` | Named list (one record) |
| `type_array(type_object())` | Tibble (many records) |
| `type_object()` of parallel arrays | **Avoid** — uncertain lengths |

### Optional fields

```r
type_person <- type_object(
  name = type_string(required = FALSE),
  age = type_number(required = FALSE)
)
```

`required = FALSE` yields `NA` when the field is absent. With the default `required = TRUE`, the model may invent a value.

### Images, PDFs, documents

```r
chat$chat_structured(
  content_image_file("invoice.png"),
  type = type_object(
    invoice_number = type_string(),
    total = type_number(),
    currency = type_string()
  )
)

chat$chat("Summarise the findings.", content_pdf_file("report.pdf"))
chat$chat("Which columns are numeric?", content_document_file("data.md"))
```

### Upload once, reuse

```r
ref <- chat$file_upload("report.pdf")
chat$chat("Summarise section 2.", ref)
chat$file_list()
chat$file_get(id)
chat$file_delete(id)
```

File upload: OpenAI, Anthropic, Gemini. Inline content: all providers.

### Parallel structured extraction

```r
results <- parallel_chat_structured(
  chat,
  prompts,
  type = type_ticket,
  include_tokens = TRUE,
  include_cost = TRUE
)
```

### Tools + structured data

`$chat_structured()` disables tools. Use tools first, then extract:

```r
chat$chat("Look up the figures.")
result <- chat$chat_structured(type = type_figures)
```

---

## 8. Tools

```r
get_weather <- tool(
  function(city) {
    df <- data.frame(city = city, temp_c = 18, condition = "cloudy")
    jsonlite::toJSON(df, auto_unbox = TRUE)
  },
  name = "get_weather",
  description = "Return current weather for one city.",
  arguments = list(city = type_string("City name"))
)

chat$register_tool(get_weather)
chat$chat("Do I need a jacket in Auckland?")
```

### Tool anatomy

| Part | Purpose |
|------|---------|
| `fun` | R function to execute |
| `name` | Stable function name for the model |
| `description` | When and why to call it |
| `arguments` | Named list of `type_*()` specs |
| `convert = TRUE` | Convert JSON arguments to R types |
| `annotations` | MCP-style behaviour hints |

### Return types

- Character vector.
- Atomic vector.
- JSON string: `jsonlite::toJSON(df, auto_unbox = TRUE)`.
- `Content` object: `content_image_file()`, `content_pdf_file()`.
- List of `Content` objects.

Data frames and bare lists are deprecated — convert them explicitly.

### Reject a call

```r
tool_reject("Only SELECT statements are allowed.")
```

### Inspect the current call

```r
ctx <- tool_context()
ctx$request@id
ctx$turns
```

`tool_context()` is only valid before the first `await()` in an async tool.

### Multiple tools

```r
chat$register_tools(list(get_weather, query_database))
```

### Provider-side tools

```r
chat$register_tool(claude_tool_web_search())
chat$register_tool(claude_tool_web_fetch())
chat$register_tool(openai_tool_web_search())
chat$register_tool(google_tool_web_search())
chat$register_tool(google_tool_web_fetch())
```

### Generate a definition

```r
create_tool_def(my_function)
```

Review the output before using it.

### MCP tools

```r
chat$set_tools(mcptools::mcp_tools())
```

---

## 9. Parallel and batch

```r
prompts <- interpolate("Classify this review: {{reviews}}")

parallel_chat_text(chat, prompts, max_active = 5, rpm = 60)
parallel_chat(chat, prompts, max_active = 5, rpm = 60)
parallel_chat_structured(chat, prompts, type = type_review)
```

| Argument | Meaning |
|----------|---------|
| `max_active` | Simultaneous requests (default 10) |
| `rpm` | Requests per minute (default 500) |
| `on_error` | `"return"`, `"continue"`, `"stop"` |
| `include_tokens` | Add token columns |
| `include_cost` | Add a cost column |

```r
batch_chat_structured(
  chat,
  prompts,
  path = "results.json",
  type = type_review
)
```

| | `parallel_chat()` | `batch_chat()` |
|---|-------------------|----------------|
| Speed | Minutes | Up to 24 hours |
| Cost | Full price | ~50% cheaper |
| Providers | All | OpenAI, Anthropic, Gemini, Groq |
| Resume | No | Yes, via `path` |
| Interactive | Yes | No |

---

## 10. Tokens, cost, and pricing

```r
chat$get_tokens()        # input, output, cached_input, cost per turn
chat$get_cost()          # cumulative
chat$get_cost("last")    # most recent turn
chat$token_count("...")  # estimate input tokens
token_usage()            # session-wide
models_update_prices()   # refresh cached prices
```

| Lever | Effect |
|-------|--------|
| Short conversations | Avoid resending history |
| Smaller model | Large saving |
| Prompt caching | Up to ~90% on repeated prefixes |
| Batch API | ~50% |
| Retrieval | Send passages, not whole documents |
| `max_tokens` | Bounds worst case |
| Local results cache | Avoids repeat calls |

```
Cost grows superlinearly with turns:
turn n resends the system prompt + all previous turns.
```

---

## 11. Debugging and hooks

```r
chat                       # print the conversation
chat$get_turns()
chat$get_rounds()
chat$last_turn()
str(chat$last_turn())      # includes raw provider JSON
```

```r
started <- NULL

chat$on_request_start(function(turns) {
  started <<- Sys.time()
})

chat$on_request_end(function(turn) {
  message("Took ", round(as.numeric(Sys.time() - started, units = "secs"), 1), "s")
})
```

| Hook | Fires |
|------|-------|
| `$on_request_start()` | Before each model request, including tool rounds |
| `$on_request_end()` | After each request, before tool execution |
| `$on_tool_request()` | When the model requests a tool |
| `$on_tool_result()` | When a tool returns |

Record/replay for tests:

```r
contents_record(chat$last_turn(), "fixtures/answer.json")
contents_replay("fixtures/answer.json")
```

---

## 12. Shiny skeleton

```r
library(shiny)
library(shinychat)
library(ellmer)

ui <- page_chat("Assistant", id = "chat")

server <- function(input, output, session) {
  chat <- chat_openai(
    system_prompt = "You are a concise R assistant.",
    model = "gpt-5.6-terra"
  )

  observeEvent(input$chat_user_input, {
    chat_append("chat", chat$stream_async(input$chat_user_input))
  })
}

shinyApp(ui, server)
```

| Do | Don't |
|----|-------|
| Create the chat inside the server | Share one chat across users |
| Use `$stream_async()` + `chat_append()` | Block with `$chat()` |
| Keep keys server-side | Ship keys to the browser |
| Add auth and rate limits | Expose internal data by default |
| Cap history and tokens | Let sessions grow forever |

---

## 13. Gotchas

1. `$chat()`, not `$turn()` — old API.
2. `tool()`, not `Tool$new()` — old API.
3. Chats are mutable R6 objects — `$clone()` before branching.
4. Set `echo = "none"` in functions and reports.
5. `$chat_structured()` turns tools off.
6. Model an array of objects, not an object of arrays.
7. `required = TRUE` can hallucinate values; use `required = FALSE`.
8. The model cannot compute — do arithmetic in R.
9. Pin `model`; defaults change.
10. Long conversations cost more than linear.
11. Ollama: ~2048-token input cap and weak tool calling in many models.
12. Retrieved text is untrusted — prompt injection is real.
13. Never commit `.Renviron` or keys.

---

## 14. Links

| Resource | URL |
|----------|-----|
| ellmer docs | https://ellmer.tidyverse.org/ |
| Getting started | https://ellmer.tidyverse.org/articles/ellmer.html |
| Prompt design | https://ellmer.tidyverse.org/articles/prompt-design.html |
| Streaming/async | https://ellmer.tidyverse.org/articles/streaming-async.html |
| Structured data | https://ellmer.tidyverse.org/articles/structured-data.html |
| Tool calling | https://ellmer.tidyverse.org/articles/tool-calling.html |
| `Chat` reference | https://ellmer.tidyverse.org/reference/Chat.html |
| Parallel chat | https://ellmer.tidyverse.org/reference/parallel_chat.html |
| Batch chat | https://ellmer.tidyverse.org/reference/batch_chat.html |
| 0.5.0 release | https://opensource.posit.co/blog/2026-09-14_ellmer-0-5-0/ |
| vitals | https://vitals.tidyverse.org/ |
| shinychat | https://posit-dev.github.io/shinychat/r/ |
| mcptools | https://posit-dev.github.io/mcptools/ |
| ragnar | https://ragnar.tidyverse.org/ |

---

## Related notes

- [AI with R — Overview](01_AI_with_R_Overview.md)
- [ellmer Tutorial](02_ellmer_Tutorial.md)
- [Local LLMs and Agents](04_Local_LLMs_and_Agents.md)
- [R Index](../00_Index.md)

---

*Last updated: 2026-11-05*
