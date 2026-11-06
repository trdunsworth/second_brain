# AI with R — Overview

A map of the R + LLM landscape: which packages do what, how to choose a provider and model, how to handle keys, cost, and privacy, and where to start.

> **Checked:** 2026-11-05 · **Core package:** ellmer 0.5.0 · **Docs:** <https://ellmer.tidyverse.org/>

---

## 1. Where LLMs fit in an R workflow

LLMs are strongest at **ambiguous language and code-shaped work**:

- Drafting and refactoring R code, explaining errors, converting code between languages.
- Extracting structured data from messy text, PDFs, screenshots, and web pages.
- Classifying, tagging, summarising, and de-duplicating text.
- Generating first drafts of reports, documentation, tests, and slide outlines.
- Acting as a natural-language interface to data and tools.

They are weak at **exact computation, reproducibility, and accountability**:

- Arithmetic, joins, filtering, and statistical tests should run in R, not in the model.
- The same prompt can produce different output on different days or models.
- Models hallucinate names, numbers, citations, and function arguments.
- They do not know your private data, current package versions, or this week's events unless you provide them.

**Rule of thumb:** let the model decide *what* to do or *how to phrase it*; let R decide *what is true*. When accuracy matters, put a deterministic check between the model and the output.

### Three levels of use

| Level | Pattern | Typical package |
|-------|---------|-----------------|
| **Assistant** | You chat, copy results into your script | ellmer, Posit Assistant |
| **Component** | A script calls a model and consumes the result | ellmer, tidyllm |
| **Product** | Users interact through an app or API | ellmer + shinychat, querychat |

---

## 2. The package landscape

The Posit-adjacent R ecosystem is deliberately modular: one package for chatting, one for retrieval, one for evaluation, one for UI.

| Package | Version | Role | Reach for it when… |
|---------|---------|------|--------------------|
| **ellmer** | 0.5.0 | Chat/provider abstraction; tools; structured data; streaming | You need an LLM inside an R script, app, or package |
| **tidyllm** | 0.7.2 | Pipeline-style LLM verbs; batch jobs; embeddings; media | You want `data |> llm_message() |> chat()` in a data workflow |
| **ragnar** | 0.3.1 | Retrieval-augmented generation over documents | The model must answer from your own corpus |
| **vitals** | 0.4.0 | Evaluation framework for LLM products | You need to compare prompts, models, cost, or latency |
| **shinychat** | 0.5.0 | Chat UI and streaming components for Shiny | You are shipping a chatbot to other people |
| **mcptools** | 1.0.3 | Model Context Protocol client and server for R | You want R to call MCP tools, or an agent to call R |
| **chatlas** | — (Python) | Python analogue of ellmer | You work across R and Python |
| **ollamar**, **rollama** | — | Ollama-specific model management | You only need local Ollama control |
| **querychat** | — | Natural-language querying of data frames in Shiny | Non-technical users need to query a table |

### ellmer vs tidyllm

They overlap, but the design centres differ:

| | **ellmer** | **tidyllm** |
|---|-----------|-------------|
| Core object | Mutable `Chat` R6 object | Stateless message/verb pipeline |
| Best at | Interactive chat, tools, structured output, Shiny | Batch classification, embeddings, media, pipelines |
| Conversation | Retained automatically | Explicit message history |
| Provider coverage | Wide, official + community | Wide, with a uniform verb interface |
| Interop | — | `chat(ellmer(.ellmer_chat = ...))` bridges to ellmer |

Use ellmer as the default. Add tidyllm when you want tidyverse-shaped batch work or its embedding/file helpers.

### The rest of the stack

```
                 ┌──────────────┐
   documents ───▶│   ragnar     │──▶ retrieved chunks
                 └──────────────┘            │
                                             ▼
   user ───▶ shinychat / querychat ───▶ ellmer Chat ───▶ provider
                                             │
                                             ├──▶ tools (R functions)
                                             ├──▶ MCP servers (mcptools)
                                             └──▶ structured output
                                             │
                                             ▼
                                        vitals (evaluation)
```

---

## 3. Providers and models

A **provider** is the API you call; a **model** is the thing that answers. One provider can host many models, and the same model can be available through several providers.

### Official ellmer providers

| Provider | Function | Notes |
|----------|----------|-------|
| OpenAI | `chat_openai()` | Responses API; strong general/code models |
| Anthropic | `chat_anthropic()` / `chat_claude()` | Strong code and long-document work; prompt caching on by default |
| Google Gemini | `chat_google_gemini()` | Generous free tier; check data-use terms |
| Google Vertex | `chat_google_vertex()` | Enterprise Google Cloud auth and controls |
| Posit AI | `chat_posit()` | OAuth device flow; curated models for Posit subscribers |
| Azure OpenAI | `chat_azure_openai()` | Enterprise deployment and data controls |
| AWS Bedrock | `chat_aws_bedrock()` | AWS-hosted models, including Claude and GPT families |
| Databricks | `chat_databricks()` | Models inside a Databricks workspace |
| Snowflake | `chat_snowflake()` | Models inside Snowflake |
| Ollama | `chat_ollama()` | Local models; no per-token API cost |
| DeepSeek | `chat_deepseek()` | Low-cost hosted models |

### Community providers

`chat_cloudflare()`, `chat_groq()`, `chat_huggingface()`, `chat_lmstudio()`, `chat_mistral()`, `chat_openai_compatible()`, `chat_openrouter()`, `chat_perplexity()`, `chat_portkey()`, `chat_vllm()`.

`chat_openai_compatible()` is the escape hatch for any service that speaks the OpenAI Chat Completions API. `chat()` is a generic entry point that accepts `"provider/model"` strings:

```r
chat <- chat("anthropic/claude-sonnet-5", system_prompt = "Be concise.")
chat <- chat("ollama/llama3.2")
```

### Choosing a model

There is no single best model. Optimise for the task, not the leaderboard.

| Priority | Sensible default |
|----------|------------------|
| Best code quality | Anthropic Claude or a frontier OpenAI model |
| Lowest cost for simple text | A small/“nano”/“flash” model from the same family |
| Free experimentation | Google Gemini free tier (read the data-use terms) |
| Data must stay on-device | Ollama or LM Studio with a local model |
| Enterprise compliance | Azure OpenAI, Vertex AI, Bedrock, or Posit AI |
| Long documents | A model with a large context window; prefer retrieval over stuffing |
| High-volume classification | Small model + batch API + a measured eval set |

Practical selection loop:

1. Build a 20–50 example eval set with expected outputs.
2. Run a cheap model first.
3. If quality is short, move up one tier before rewriting the prompt.
4. Compare cost and latency, not just accuracy.
5. Pin the model name in code; defaults change between releases.

```r
# List what a provider currently offers
models_openai()
models_anthropic()
models_google_gemini()
models_ollama()
```

> **Pin your model.** ellmer updates provider defaults regularly. `chat_openai()` without `model` is convenient for a first experiment and a liability in production.

---

## 4. API keys and credentials

Keys belong in environment variables, never in a script, notebook, or Git repository.

### One-time setup

```r
# Opens ~/.Renviron for editing
usethis::edit_r_environ()
```

Add lines such as:

```text
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
GEMINI_API_KEY=...
OLLAMA_BASE_URL=http://localhost:11434
```

Restart R after editing `.Renviron`. Check that a key is visible without printing it:

```r
nzchar(Sys.getenv("OPENAI_API_KEY"))
```

### Rules

- **Never** commit `.Renviron`, `.env`, or keys in code. Add them to `.gitignore`.
- Do not print keys in logs, error messages, screenshots, or chat transcripts.
- Use separate keys per project or team; rotate them if exposed.
- In CI, inject secrets through the CI provider's secret store.
- In Shiny or other hosted apps, keep keys server-side. Never ship a key to the browser.
- For shared machines, prefer a credential helper or short-lived token over a long-lived key.

### Provider-specific notes

| Provider | Credential |
|----------|------------|
| OpenAI | `OPENAI_API_KEY` |
| Anthropic | `ANTHROPIC_API_KEY`; optional `ANTHROPIC_BASE_URL` |
| Google Gemini | `GOOGLE_API_KEY` or `GEMINI_API_KEY`; Vertex uses Google Cloud credentials |
| Posit AI | OAuth device flow on first use; tokens cached and refreshed |
| Ollama | None for local use; `OLLAMA_API_KEY` only behind an authenticated proxy |
| Azure / Bedrock / Databricks / Snowflake | Provider SDK or cloud credential chain; see the provider docs |

`credentials =` exists on most `chat_*()` functions for custom auth, but you should rarely need it.

---

## 5. Cost and tokens

Providers bill per **token** — roughly ¾ of a word in English. Input and output are priced separately, and output usually costs several times more.

### Why long conversations get expensive

Every request resends the whole conversation. With `n` turns, the model processes the system prompt and all previous turns again:

```
turn 1: system + prompt 1
turn 2: system + prompt 1 + reply 1 + prompt 2
turn 3: system + prompt 1 + reply 1 + prompt 2 + reply 2 + prompt 3
```

Cost grows faster than linearly with conversation length. For a long task, start a fresh chat with a better prompt rather than arguing with the model for 40 turns.

### Measure it

```r
chat$get_tokens()          # per-turn input, output, cached input, cost
chat$get_cost()            # cumulative cost
chat$get_cost("last")      # cost of the most recent turn
chat$token_count("...")    # estimate input tokens before sending
token_usage()              # session-wide usage across chats
```

`token_count()` is supported by OpenAI, Anthropic, Gemini, Vertex, and Posit. `models_update_prices()` refreshes cached price data between ellmer releases.

### Ways to cut cost

| Technique | Saving | Trade-off |
|-----------|--------|-----------|
| Short conversations / reset turns | Large | Lose context |
| Smaller model | Large | Lower quality |
| Prompt caching | Up to ~90% on repeated prefixes | Provider-specific; cache expiry |
| Batch API (`batch_chat()`) | ~50% | Up to 24 hours |
| Retrieval instead of a giant prompt | Large | Retrieval pipeline to maintain |
| `max_tokens` cap | Bounds worst case | May truncate |
| Cache results locally | Avoids repeat calls | Staleness; key design |

### A rough budget

A typical short R question might use 500–2,000 input tokens and 200–800 output tokens. At frontier-model prices that is fractions of a cent; at small-model prices it is effectively free. Even \$10 of credit supports a lot of experimentation. The expensive mistakes are large document batches, long agent loops, and accidentally sending a whole database extract.

---

## 6. Privacy, security, and governance

Sending text to an API is a data transfer. Treat it like one.

### Questions to answer before sending data

1. **What data is leaving?** Names, addresses, health data, case notes, credentials, proprietary code?
2. **Where does it go?** Which provider, region, and subprocessors?
3. **Is it retained?** For how long? Is it used for training? Can you opt out?
4. **Who can see it?** Provider staff, model vendors, logging systems?
5. **What is the legal basis?** Consent, contract, public task, or something else?
6. **What happens on error?** Are prompts and responses logged into a system with different retention?

### Provider data posture

| Option | Data leaves your machine? | Typical posture |
|--------|---------------------------|-----------------|
| **Ollama / LM Studio** | No (model download aside) | Strongest local control; you manage the model |
| **Azure OpenAI / Bedrock / Vertex** | Yes, to your cloud tenant | Enterprise controls, regional processing, private networking |
| **Posit AI** | Yes, to Posit's gateway | OAuth, subscription terms; check retention details |
| **Public OpenAI / Anthropic / Gemini APIs** | Yes | Check retention, training, and zero-retention options |
| **Gemini free tier** | Yes | Free tier may use data to improve products; not for sensitive data |

Do not assume “the API” is private because the model is popular. Read the current terms for the tier you are using.

### Practical controls

- **Redact before sending.** Replace names, IDs, emails, and free-text identifiers with stable pseudonyms. Keep the mapping local.
- **Send the minimum.** A schema and 20 sample rows usually beat a full extract.
- **Do not paste secrets.** Keys, tokens, connection strings, and private URLs should never enter a prompt.
- **Treat retrieved text as untrusted.** Documents and web pages can contain prompt injection. Never let retrieved content grant permissions or trigger destructive tools.
- **Least-privilege tools.** Read-only database users, allowlisted SQL, no shell by default, explicit timeouts.
- **Human approval for side effects.** Sending email, writing files, deploying, or deleting data should require a confirmation step.
- **Log decisions, not secrets.** Record model, prompt version, tool calls, and outcome; hash or omit sensitive inputs.
- **Set a budget.** Cap tokens, requests, and wall-clock time per run.

> **Prompt injection is the new SQL injection.** If a tool can act, assume untrusted text will try to make it act. Validate arguments and restrict what the tool can reach.

---

## 7. What to use for what

| Task | Start with | Then add |
|------|-----------|----------|
| Ask questions about R while coding | ellmer + `live_console()` | Posit Assistant for session-aware help |
| Generate or refactor R code | ellmer + a strong code model | A prompt file + eval examples |
| Extract a table from 500 PDFs | ellmer structured data | `parallel_chat_structured()` or `batch_chat_structured()` |
| Classify free-text survey responses | ellmer or tidyllm | A labelled eval set + vitals |
| Answer questions over your notes | ragnar + ellmer | A retrieval eval set |
| Build a chatbot for colleagues | shinychat + ellmer | Auth, rate limits, logging |
| Let an agent query a database | ellmer tools + DBI | Read-only role, SQL validation, approval |
| Connect Claude/Copilot to a live R session | mcptools | `btw` for a ready-made tool set |
| Run privately on a laptop | Ollama + `chat_ollama()` | A larger local model or a GPU |
| Compare two prompts or models | vitals | Cost and latency columns |
| Use R from Python or vice versa | reticulate / chatlas | — |

---

## 8. A minimal first script

```r
library(ellmer)

chat <- chat_openai(
  system_prompt = "
    You are an expert R programmer who prefers the tidyverse.
    Give code first, then at most three bullet points of explanation.
    Never invent functions or packages.
  ",
  model = "gpt-5.6-terra"
)

chat$chat("How do I compute grouped means for every numeric column in a data frame?")
```

That is the whole core loop: create a chat with a system prompt, send a user prompt, read the reply. Everything else in ellmer is an elaboration of this.

Next: the [ellmer tutorial](02_ellmer_Tutorial.md) builds the full workflow; the [cheatsheet](03_ellmer_Cheatsheet.md) is the command reference; [local LLMs and agents](04_Local_LLMs_and_Agents.md) covers Ollama, RAG, MCP, and guardrails.

---

## 9. Learning path

```
1. This overview
   ↓
2. ellmer Tutorial — chat, prompts, streaming, structured data, tools
   ↓
3. ellmer Cheatsheet — keep open while coding
   ↓
4. Local LLMs and Agents — Ollama, ragnar, mcptools, guardrails
   ↓
5. Evaluation with vitals — prove the thing works
   ↓
6. shinychat / querychat — ship it to other people
```

---

## Related vault notes

- [[Posit AI]] — the commercial product family: Posit Assistant, Next Edit Suggestions, Posit AI Pass.
- [[Posit Open Source Software Catalog]] — where ellmer, ragnar, vitals, and shinychat sit in the wider stack.
- [[Building LLM Agents — R Guide]] — agent-specific patterns and Shiny deployment.
- [[RAG Systems — Retrieval-Augmented Generation]] — retrieval architecture beyond the R helpers.
- [[MCP — Model Context Protocol Guide]] — the protocol behind `mcptools`.
- [[Testing and Evaluation Strategies for Agents]] — evaluation design.
- [[Secure Agent Guardrails]] — threat models and controls.

---

## Sources

- ellmer documentation — <https://ellmer.tidyverse.org/>
- ellmer 0.5.0 release post — <https://opensource.posit.co/blog/2026-09-14_ellmer-0-5-0/>
- tidyllm — <https://edubruell.github.io/tidyllm/>
- ragnar — <https://ragnar.tidyverse.org/>
- vitals — <https://vitals.tidyverse.org/>
- shinychat — <https://posit-dev.github.io/shinychat/>
- mcptools — <https://posit-dev.github.io/mcptools/>
- chatlas — <https://posit-dev.github.io/chatlas/>
- Posit AI — <https://posit.ai/>

---

*Last updated: 2026-11-05*
