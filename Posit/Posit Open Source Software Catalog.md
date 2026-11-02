---
type: reference
status: active
topic: "Posit's open-source software catalog — the ~387 curated open-source projects in the Posit ecosystem and how to search, filter, and sort them on opensource.posit.co/software."
created: 2026-11-01
tags:
  - posit
  - open-source
  - data-science
  - reference
---

# Posit Open Source Software Catalog

Source: <https://opensource.posit.co/software> — captured 2026-11-01.

## What this is

The Open Source Software catalog at <https://opensource.posit.co/software> is Posit's browsable
inventory of **~387 open-source projects** from the Posit ecosystem — each linked to its GitHub
repository, with topic and language metadata.

The catalog is the discovery layer behind the open-source story in [[Posit Open Source]] ("Open
Source is in Our DNA"). The flagship tools — RStudio, the tidyverse, Shiny, Quarto, Positron — live
in the catalog alongside the long tail of packages Posit maintains, funds, or stewards.

## How to search

| Syntax | Description |
|---|---|
| `shiny` | Search all fields |
| `title:shiny` | Title only |
| `author:"jane doe"` | Author name |
| `topic:visualization` | Topic |
| `language:python` | Language |
| `stars:>100` | At least 100 stars |
| `language:python OR language:r` | Either value |
| `language:python AND language:r` | Both values |
| `NOT language:python` | Exclude matches |
| `(a OR b) AND c` | Group with parentheses |

Combine freely with AND (default), OR, NOT, and parentheses.

## Filters and sort

- **Topics:** Artificial Intelligence, Best Practices, Community, Data Wrangling, Interactive
  Apps, Machine Learning, MLOps and Admin, Publishing, Visualization.
- **Languages:** R, Python, Rust, JavaScript, TypeScript, C, C++.
- **Sorts:** Title, Most Stars, Newest (first commit).

## Flagship projects by lane

The catalog holds ~387 projects and the set shifts over time; treat this table as the named
highway, not an exhaustive list.

| Lane | Representative projects |
|---|---|
| **R work** | `dplyr`, `ggplot2`, `tidyr`, `Shiny`, `Quarto` / `rmarkdown`, `learnr`, `air`, `callr` |
| **Python work** | `duckplyr`, `Great Tables`, `plotnine`, `chatlas`, `Shiny for Python` |
| **AI work** | `ellmer`, `chatlas`, `btw`, `vitals`, `ragnar`, `mcptools`, `lang`, `mall` |

## Relevance here

- The tidyverse + Shiny + Quarto stack in use across this vault is exactly the catalog's core — each
  is open-source Posit-ecosystem work rather than third-party tooling.
- It is also the fastest way to check whether a tool (e.g. the `ggsql` alpha noted in
  [[duckdb-lab/ggsql_notes]]) is a real, maintained Posit-ecosystem project before adopting it.

## Sources

- <https://opensource.posit.co/software>
- <https://github.com/posit-dev>
