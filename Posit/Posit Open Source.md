---
type: reference
status: active
topic: "Posit's open-source program — the 'open source is in our DNA' position, the people and R/Python/AI work pages, and the free resources (blog, cheatsheets, videos, events, books, courses)."
created: 2026-10-30
tags:
  - posit
  - open-source
  - data-science
aliases:
  - Posit Open Source Program
  - opensource.posit.co
---

# Posit Open Source

Source: <https://opensource.posit.co> — captured 2026-10-30.

## Position

The open-source site exists as its own property, separate from posit.co, and its header claim is
literally *"Open Source is in Our DNA."* The stated belief: data science software should be free
and open for everyone. The RStudio product page quantifies the commitment — Posit has invested in
open-source data science since **2009**, and "RStudio will remain free. Using RStudio without AI
will cost nothing."

Two practical consequences:

- The flagship tools (RStudio, tidyverse, Shiny, Quarto, Positron) are free; the money is made by
  enterprise governance and training. See [[Posit Company and Platform]].
- Posit is a **Public Benefit Corporation**, so the open-source commitment is part of the corporate
  charter rather than a marketing posture.

## Site structure

| Section | URL | What is there |
|---|---|---|
| **Software** | `/software/` | The project catalog — see [[Posit Open Source Software Catalog]] |
| **People** | `/people/` | Who maintains the work |
| **Events** | `/events/` | Open-source-facing events |
| **Blog** | `/blog/` | Open Source blog; filterable per project (`/blog/q/quarto/`, `/blog/q/positron/`) |
| **Books** | `/resources/books/` | Free books (R for Data Science and the wider R Markdown/Quarto canon) |
| **Cheatsheets** | `/resources/cheatsheets/` | The Posit cheat sheet library |
| **Courses** | `/resources/courses/` | Free course material |
| **Videos** | `/resources/videos/` | Recorded talks and training |
| **About** | `/about/posit/`, `/about/ai/`, `/about/python/`, `/about/r/`, `/about/community-support/` | The three "our work" pages plus community support policy |
| **GitHub** | <https://github.com/posit-dev> | The actual source |

## The three "our work" tracks

Posit organizes its open-source story into three lanes, each with its own page. These are the
lanes to watch if you want to predict what the company funds next.

### Our R work

The historical core. RStudio IDE since 2009, and the tidyverse family — ggplot2, dplyr, tidyr,
readr, purrr, tibble, stringr, forcats, lubridate, plus the package-development toolchain
(devtools, usethis, roxygen2, testthat, pkgdown, rcmdcheck) and the publication stack (rmarkdown,
bookdown, blogdown, distill, Quarto).

### Our Python work

Posit's Python investment is substantial and increasingly the growth story. Note the pattern: it
is built on **Polars-backed tooling** rather than a wholesale tidyverse port —

- `duckplyr` — a drop-in replacement for dplyr powered by DuckDB for speed
- `Great Tables` — awesome display tables for Python (sibling of R's `gt`)
- `plotnine` — a grammar of graphics for Python
- `Great Docs` — documentation site generator for Python packages
- `chatlas` — building LLM chat apps in Python
- `Shiny for Python` — Shiny for Python, plus `py-shinywidgets`, `py-shinylive`,
  `py-shinyswatch`, `py-shiny-templates`
- `pins-python`, `vetiver-python` — MLOps tooling for Python

Also supporting: `py-yaml12` (a modern YAML 1.2 parser/emitter in Rust).

### Our AI work

A distinct lane rather than a feature, covering both the IDE-embedded assistant and the package
layer —

- **Posit Assistant / Next Edit Suggestions** (the product; see [[Posit AI]] surfaces:
  [[RStudio IDE]] and [[Positron]])
- `ellmer` — call LLM APIs from R
- `chatlas` — the Python equivalent
- `btw` — a complete toolkit for connecting R and LLMs
- `vitals` — large language model evaluation for R
- `ragnar` — RAG in R; `raghilda` — Python framework for RAG systems
- `mcptools` — Model Context Protocol for R
- `skills` — a collection of Claude Skills from Posit
- `commons` — AI Agents for Data Analysis
- `lang` — uses LLMs to translate R help docs on the fly
- `mall` — run multiple LLM predictions against a data frame, in R and Python
- `ggbot2`, `querychat` (chat with your data in R and Python), `shiny-assistant`, `shinychat`

Posit's stated AI position is worth quoting because it is a genuine differentiator: an assistant
that runs inside a governed environment and can **see the live data session**, paired with
**zero data retention** — code and data are never stored or used for training.

## Free resources worth knowing

| Resource | URL | Note |
|---|---|---|
| Cheat sheets | <https://opensource.posit.co/resources/cheatsheets/> | Also mirrored at posit.co/resources/cheatsheets. Covers RStudio IDE, ggplot2, dplyr, Shiny, R Markdown, tidymodels, and Python basics. |
| Books | `/resources/books/` | R for Data Science and the R Markdown canon, free online |
| Courses | `/resources/courses/` | Free self-paced material — the free tier of [[Posit Academy]] |
| Videos | `/resources/videos/>` | Talks and training recordings |
| Open Source blog | `/blog/` | Per-project RSS feeds (`/blog/index.xml`, and topic filters like `/blog/q/quarto/`) |
| Community forum | <https://forum.posit.co> | The support surface for everything free |
| Events | `/events/` | Includes posit::conf (<https://conf.posit.co>) |

## Relevance here

- The tidyverse + tidymodels + Shiny combination already in use across this vault
  ([[DMA_Notes/R Information for DMA projects]], [[computer_links/R Library Packages for Reporting]])
  is Posit open-source work, not third-party tooling. Upgrades and support channels follow from
  that.
- `duckplyr` and `duckdb` are directly relevant to [[duckdb-lab]] — dplyr syntax against DuckDB.
- `ellmer` / `vitals` / `ragnar` / `mcptools` are the R-side counterpart to the agent work in
  [[Agents]]; Posit maintains an MCP package for R.
- The cheat sheet library is the fastest onboarding material we have for new analysts — print, do
  not link.
