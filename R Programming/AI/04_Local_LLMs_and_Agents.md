# Local LLMs and Agents in R

Running models on your own machine with **Ollama**, grounding them in your documents with **ragnar**, connecting them to external tools with **mcptools**, and wrapping the whole thing in guardrails.

> **Checked:** 2026-11-05 · **Packages:** ellmer 0.5.0 · ragnar 0.3.1 · mcptools 1.0.3

---

## 1. Why run a local model?

| Reason | What it buys you |
|--------|------------------|
| **Privacy** | Text and documents never leave the machine |
| **Cost** | No per-token API bill; you pay in hardware and electricity |
| **Offline work** | No network dependency once the model is downloaded |
| **Experimentation** | Swap models freely without accounts or quotas |
| **Compliance** | Data residency and retention are under your control |

The trade-offs are real: local models are usually smaller, slower, and weaker at tool calling and long-context reasoning than frontier hosted models. Use local models when privacy or cost dominates; use hosted models when quality dominates.

---

## 2. Ollama

### Install and run

```bash
# macOS
brew install ollama

# Start the server (runs on http://localhost:11434)
ollama serve

# In another terminal
ollama pull llama3.2
ollama pull qwen3:4b
ollama pull nomic-embed-text
ollama list
ollama run llama3.2
```

Useful commands:

| Command | Purpose |
|---------|---------|
| `ollama list` | Installed models |
| `ollama ps` | Models currently loaded in memory |
| `ollama pull <model>` | Download or update a model |
| `ollama rm <model>` | Delete a model |
| `ollama run <model>` | Interactive terminal chat |
| `ollama serve` | Start the API server |

### Use it from R

```r
library(ellmer)

chat <- chat_ollama(
  system_prompt = "You are a concise R programming assistant.",
  model = "llama3.2"
)

chat$chat("Explain factors in R in three sentences.")
```

```r
models_ollama()
```

Point at a different server:

```r
chat <- chat_ollama(
  model = "llama3.2",
  base_url = "http://192.168.1.50:11434"
)
```

Or set `OLLAMA_BASE_URL` in `.Renviron`.

### Thinking models

Some models (for example Qwen 3) expose a reasoning mode. Control it with `params()`:

```r
chat <- chat_ollama(
  model = "qwen3:4b",
  params = params(reasoning_effort = "none")
)
```

Supported values depend on the model. Check the Ollama model page.

### Known limitations

The ellmer docs are explicit about `chat_ollama()`:

- **Tool calling is not supported with streaming** (`echo = "text"` or `"all"`).
- Many models can only use **2048 input tokens**, with no way to raise it except a custom model.
- **Tool calling is weak** compared with hosted models.

Design around these: keep prompts short, retrieve instead of stuffing, and test tool use carefully. For agentic work, prefer a hosted model unless privacy requires otherwise.

### Other local runtimes

| Runtime | ellmer function | Notes |
|---------|-----------------|-------|
| Ollama | `chat_ollama()` | Easiest; model management built in |
| LM Studio | `chat_lmstudio()` | GUI, OpenAI-compatible server |
| llama.cpp | `chat_openai_compatible()` | Point at its server |
| vLLM | `chat_vllm()` | High-throughput serving; GPU |
| Any OpenAI-compatible | `chat_openai_compatible()` | Generic escape hatch |

---

## 3. Choosing a local model

Rough guidance, not a benchmark:

| Model size | RAM/VRAM at 4-bit | Good for |
|------------|-------------------|----------|
| 3–4B | 4–8 GB | Classification, short summaries, autocomplete |
| 7–8B | 8–16 GB | General chat, drafting, simple extraction |
| 13–14B | 16–24 GB | Better reasoning and code |
| 30–34B | 24–32 GB | Strong local generalist |
| 70B+ | 48–64 GB+ | Closest to hosted quality; slow on CPU |

Practical notes:

- **Apple Silicon** uses unified memory; a 16 GB Mac can run 7–8B models comfortably and 13B models slowly.
- **GPU VRAM** is the hard limit for accelerated inference. CPU offloading works but is much slower.
- **Quantisation** (Q4, Q5, Q8) trades quality for size. Q4 is the usual default.
- **Context length** costs memory. A large context window can push a model that “fits” into swap.
- **Benchmark on your own task.** A 7B model fine-tuned for code can beat a 30B general model on code review.

### Local does not automatically mean private

- The model download comes from a registry; check the licence and source.
- Ollama and other runtimes may send telemetry or check for updates.
- Your prompts may still be logged by the runtime or by an IDE extension.
- If you expose the Ollama port on a network, anyone who can reach it can use it. Bind to `127.0.0.1` unless you have a reason not to.

---

## 4. RAG with ragnar

Retrieval-Augmented Generation means: find relevant passages first, put them in the prompt, then ask the model to answer **from those passages**. It is the right pattern when the model needs knowledge it was not trained on — your notes, policies, tickets, or a book.

### The pipeline

```
documents ──▶ read_as_markdown() ──▶ markdown_chunk() ──▶ embed ──▶ DuckDB store
                                                                        │
question ──▶ embed ──▶ retrieve (VSS + BM25) ──▶ de-overlap ──▶ prompt ─┘
                                                                        │
                                                                        ▼
                                                                     answer
```

### Build a store

```r
library(ragnar)

base_url <- "https://r4ds.hadley.nz"

pages <- ragnar_find_links(
  base_url,
  url_filter = \(url) url[startsWith(url, "https://r4ds.hadley.nz")]
)

store <- ragnar_store_create(
  "r4ds.ragnar.duckdb",
  embed = \(x) ragnar::embed_openai(x, model = "text-embedding-3-small")
)

for (page in pages) {
  chunks <- page |>
    read_as_markdown() |>
    markdown_chunk()
  ragnar_store_insert(store, chunks)
}

ragnar_store_build_index(store)
```

### Retrieve

```r
store <- ragnar_store_connect("r4ds.ragnar.duckdb", read_only = TRUE)

relevant <- ragnar_retrieve(
  store,
  "How do I subset a data frame with a logical vector?"
)

relevant
#> A tibble of retrieved chunks. Every row has a `text` column
#> plus metadata such as origin, document id, and chunk id.
```

`ragnar_retrieve()` combines vector similarity (`vss`) and BM25 text search, then de-overlaps the chunks. You can call the individual retrievers when tuning:

```r
ragnar_retrieve_vss(store, "logical subsetting", top_k = 5)
ragnar_retrieve_bm25(store, "logical subsetting", top_k = 5)
```

### Give the model a retrieval tool

```r
chat <- chat_openai(
  system_prompt = "
    You are an expert R mentor. Before answering, retrieve relevant material
    from the knowledge store. Cite the source URL for every claim.
    If the store does not contain the answer, say so.
  ",
  model = "gpt-5.6-terra"
)

ragnar_register_tool_retrieve(chat, store, top_k = 10)

chat$chat("How do I subset a data frame?")
```

The model decides when to call the retrieval tool. This is usually better than always stuffing the top-k chunks into the prompt: it can reformulate the query and retrieve again.

### Local embeddings

If the corpus is sensitive, embed locally too:

```bash
ollama pull nomic-embed-text
```

```r
store <- ragnar_store_create(
  "notes.duckdb",
  embed = \(x) ragnar::embed_ollama(x, model = "nomic-embed-text")
)
```

Local embeddings are slower but keep the whole pipeline on-device.

### RAG quality checklist

- **Chunk by structure.** Headings and sections beat fixed-size windows. `markdown_chunk()` preserves heading context.
- **Keep metadata.** Source URL, title, date, and section make citations and filtering possible.
- **Use hybrid retrieval.** Dense vectors miss exact identifiers; BM25 misses paraphrase. Ragnar combines both.
- **Retrieve enough, not too much.** 5–10 chunks is a common starting point. More context is not always better.
- **Cite or refuse.** Instruct the model to answer only from retrieved text and to say when it cannot.
- **Evaluate retrieval separately.** Measure recall@k and whether the right chunk appears at all, before blaming the model.
- **Rebuild when documents change.** Incremental inserts are fine; stale indexes are not.
- **Do not treat RAG as fine-tuning.** It changes what the model can see, not what it has learned.

### ragnar vs tidyllm

| | **ragnar** | **tidyllm** |
|---|-----------|-------------|
| Focus | Full RAG pipeline | LLM verbs plus embeddings |
| Storage | DuckDB with VSS + BM25 | Bring your own |
| Chunking | Markdown-aware | Basic |
| Best for | A maintained knowledge store | Ad-hoc embedding and batch work |

---

## 5. MCP with mcptools

The **Model Context Protocol** is a standard way for an agent to discover and call tools exposed by another process. `mcptools` implements both sides in R.

### R as an MCP client

Register servers in `~/.config/mcptools/config.json` using the Claude Desktop format:

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```

Then hand the tools to an ellmer chat:

```r
library(ellmer)

chat <- chat_anthropic(model = "claude-sonnet-5")
chat$set_tools(mcptools::mcp_tools())

chat$chat("What issues are open on posit-dev/mcptools?")
```

### R as an MCP server

This lets Claude Desktop, Claude Code, Copilot, or Positron call into R:

```r
mcptools::mcp_server()
```

Register a live session so the agent can see your objects:

```r
mcptools::mcp_session()
```

Claude Code setup:

```bash
claude mcp add -s "user" r-mcptools -- Rscript -e "mcptools::mcp_server()"
```

The [`btw`](https://posit-dev.github.io/btw/) package provides a ready-made set of R tools (package docs, global environment, session metadata) that works with `mcptools`.

### Security

An MCP server is **code execution by another name**. Treat every server as untrusted until reviewed:

- Prefer servers you installed and can read.
- Scope tokens to the minimum permissions.
- Do not mount a home directory or a production database.
- Log every tool call and its arguments.
- Require approval for writes, deletes, sends, and deploys.
- Remember that a malicious document can instruct the model to call a tool.

See [[MCP — Model Context Protocol Guide]] for the protocol details and [[Secure Agent Guardrails]] for threat models.

---

## 6. Agents in R

An **agent** is a model with tools, state, and a loop. It observes, decides, acts, and repeats until it reaches a goal or a stop condition.

ellmer already implements the loop for you: `chat$chat()` sends the prompt, executes requested tools, sends the results back, and repeats until the model produces a final answer. You do not need to write a `while` loop for the common case.

### A minimal agent

```r
library(ellmer)

chat <- chat_openai(
  system_prompt = "
    You are a careful analytics assistant.
    Use the database tool for facts. Never guess a number.
    Before answering, state which query you ran.
  ",
  model = "gpt-5.6-terra"
)

chat$register_tools(list(query_database, get_weather))

chat$chat("Which region had the highest revenue last month?")
```

### A research sub-agent as a tool

Multi-agent systems are often just tools that call another chat:

```r
research_agent <- function(question) {
  sub <- chat_anthropic(
    system_prompt = "
      You are a research assistant. Search the knowledge store, then answer
      with a short summary and a source URL for every claim.
    ",
    model = "claude-sonnet-5"
  )

  ragnar_register_tool_retrieve(sub, store, top_k = 8)
  sub$chat(question, echo = "none")
}

research_tool <- tool(
  research_agent,
  name = "research",
  description = "Research a question against the internal knowledge store.",
  arguments = list(
    question = type_string("A focused research question.")
  )
)

orchestrator <- chat_openai(
  system_prompt = "Delegate research to the research tool, then synthesise.",
  model = "gpt-5.6-terra"
)
orchestrator$register_tool(research_tool)

orchestrator$chat("What does our policy say about remote work?")
```

This pattern keeps each agent's context small and makes the hand-off explicit.

### Agent design checklist

| Question | Why it matters |
|----------|----------------|
| What is the goal? | Vague goals produce wandering loops |
| What tools are truly needed? | Every tool is an attack surface |
| What can the agent read? | Scope data access |
| What can the agent change? | Writes need approval |
| How does it stop? | Step, time, and cost budgets |
| How do you know it worked? | An eval set and a success criterion |
| What is logged? | Reproduce failures without storing secrets |

### Stop conditions

- **Step budget.** Reject tool calls after N rounds.
- **Time budget.** Cancel long-running chats.
- **Cost budget.** Check `chat$get_cost()` between rounds.
- **Confidence check.** Ask the model to return “insufficient evidence” rather than guess.
- **Human approval.** Pause before any irreversible action.

---

## 7. Guardrails

| Risk | Control |
|------|---------|
| Prompt injection via retrieved text | Treat retrieved content as data, not instructions; restrict tools |
| Destructive SQL | Read-only role, `SELECT`-only parser, row limit, timeout |
| Secret leakage | Redact prompts; never put keys in context; log hashes |
| Runaway loops | Step/time/cost budgets; `tool_reject()` |
| Hallucinated numbers | Compute in R; require a tool result; cite sources |
| Malformed output | Structured data with a schema; validate before use |
| PII leaving the machine | Local model or redaction; data processing agreement |
| Supply-chain risk | Pin package versions; review MCP servers; lock dependencies |
| Over-broad credentials | Per-tool scoped tokens; least privilege |
| Silent failure | Log tool calls, errors, latency, and cost; alert on anomalies |

Guardrails are not a prompt. “Please be careful” is not a control. A control is a read-only database user, a schema, a timeout, or an approval step.

---

## 8. Evaluation and deployment

### Evaluate before you ship

```r
library(vitals)

task <- Task$new(
  dataset = eval_set,
  solver = generate(chat_openai(model = "gpt-5.6-terra")),
  scorer = model_graded_qa()
)

task$eval()
```

For an agent, evaluate the **trajectory**, not just the final answer:

- Did it choose the right tool?
- Did it pass valid arguments?
- Did it stop at the right time?
- Did it cite a real source?
- How many steps and tokens did it use?

### Deploy

| Surface | Approach |
|---------|----------|
| Shiny app | `shinychat` + `ellmer`, async streaming |
| Data exploration | `querychat` for natural-language filtering |
| Posit Connect | Deploy the Shiny app or an `mcptools` HTTP server |
| Internal CLI | `live_console()` or a small script |
| Scheduled job | `parallel_chat()` / `batch_chat()` in a Quarto or R script |

Production concerns:

- Authenticate users and isolate sessions.
- Rate-limit per user and per IP.
- Cap conversation length and token spend.
- Log model, prompt version, tool calls, and outcome.
- Monitor latency, error rate, and cost.
- Have a fallback when the provider is down.
- Tell users they are talking to an AI and what it can access.

---

## 9. Exercises

1. **Local baseline.** Install Ollama, pull a 7–8B model, and run the same five prompts through it and a hosted model. Compare quality, latency, and tool-calling success.
2. **Private extraction.** Build a structured-data extractor with `chat_ollama()` over synthetic documents. Confirm no data leaves the machine (watch network traffic or use a firewall rule).
3. **RAG over your notes.** Index this vault's `R Programming` folder with ragnar and ask five questions. Measure how often the right note is retrieved.
4. **Hybrid retrieval.** Compare `ragnar_retrieve()` with `ragnar_retrieve_vss()` and `ragnar_retrieve_bm25()` on exact-identifier queries.
5. **MCP client.** Connect a filesystem or GitHub MCP server and ask a question that requires two tool calls.
6. **MCP server.** Expose one safe R function to an MCP client. Confirm the client cannot call anything else.
7. **Agent budget.** Add a three-call budget to a database tool. Verify the agent stops and reports what it has.
8. **Injection test.** Put adversarial instructions in a retrieved document and confirm the agent refuses to follow them.
9. **Trajectory eval.** Score five agent runs on tool choice, argument validity, and stop condition.

---

## Related notes

- [AI with R — Overview](01_AI_with_R_Overview.md)
- [ellmer Tutorial](02_ellmer_Tutorial.md)
- [ellmer Cheatsheet](03_ellmer_Cheatsheet.md)
- [[Building LLM Agents — R Guide]] — agent patterns and Shiny deployment
- [[RAG Systems — Retrieval-Augmented Generation]] — retrieval architecture
- [[MCP — Model Context Protocol Guide]] — protocol details
- [[Testing and Evaluation Strategies for Agents]] — evaluation design
- [[Secure Agent Guardrails]] — threat models and controls
- [[End-to-End Agent — MCP + RAG Practice]] — worked example

---

## Sources

- Ollama — <https://ollama.com>
- `chat_ollama()` reference — <https://ellmer.tidyverse.org/reference/chat_ollama.html>
- ragnar — <https://ragnar.tidyverse.org/>
- ragnar changelog — <https://ragnar.tidyverse.org/news/index.html>
- mcptools — <https://posit-dev.github.io/mcptools/>
- btw — <https://posit-dev.github.io/btw/>
- MCP specification — <https://modelcontextprotocol.io/>
- vitals — <https://vitals.tidyverse.org/>
- shinychat — <https://posit-dev.github.io/shinychat/r/>
- ellmer tool calling — <https://ellmer.tidyverse.org/articles/tool-calling.html>

---

*Last updated: 2026-11-05*
