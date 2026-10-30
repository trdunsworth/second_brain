---
type: moc
status: active
topic: "Index for the Posit folder — how Posit's company, enterprise platform, academy, open-source work, Quarto, Positron, and RStudio notes connect to each other and to the rest of the vault."
created: 2026-10-30
tags:
  - moc
  - posit
  - data-science
aliases:
  - Posit MOC
---

# Posit Ecosystem MOC

Map of content for everything Posit. Posit Software, PBC (formerly RStudio, PBC) is the company
behind RStudio, Positron, the tidyverse, Shiny, and Quarto. It is a **Public Benefit Corporation**
committed to open source, freedom of choice, and long-term partnership — "no vendor lock-in."

## The notes

| Note | Source URL | What it holds |
|---|---|---|
| [[Posit Company and Platform]] | <https://posit.co> | Mission, enterprise products (Workbench, Connect, Package Manager, Cloud), Posit AI, solutions by team and industry, partners |
| [[Posit Academy]] | <https://academy.posit.co> | Free learning platform; Academy Apprenticeships — courses, format, weekly structure |
| [[Posit Open Source]] | <https://opensource.posit.co> | Open-source program: people, R/Python/AI work, blog, cheatsheets, events |
| [[Posit Open Source Software Catalog]] | <https://opensource.posit.co/software> | ~387 open-source projects, search syntax, topic/language taxonomy, flagship projects |
| [[Quarto]] | <https://quarto.org> | Publishing system: engines, formats, extensions, licensing |
| [[Positron]] | <https://positron.posit.co> | The data science IDE: Posit Assistant, Data Explorer, Data Apps, Elastic License 2.0 |
| [[RStudio IDE]] | RStudio Desktop | Free AGPL IDE for R; Desktop Pro edition; embedded Posit Assistant |

## How to read the ecosystem in one pass

```text
                    ┌─────────────────────────────────────┐
                    │  Posit Software, PBC (formerly      │
                    │  RStudio, PBC) — public benefit corp │
                    └─────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
   OPEN SOURCE                 ENTERPRISE                    LEARNING
   (free)                      (paid / governed)             (free + paid)
        │                           │                           │
   Positron                  Posit Workbench              Posit Academy
   RStudio IDE               Posit Connect                 Apprenticeships
   Quarto                    Connect Cloud                 (mentor-led)
   tidyverse / tidymodels    Package Manager               Self-paced courses
   Shiny (R + Python)        Public Package Manager
   gt / Great Tables / gt    Posit Cloud
   plotnine / polars tooling shinyapps.io
   ellmer / chatlas          Posit AI Pass / Positron Pro
```

Three things make Posit unusual, and they explain most product decisions:

1. **The IDEs are free and open.** RStudio has been open source since 2009 (AGPL v3); Positron is
   source-available under the Elastic License 2.0. Neither requires an account or a subscription
   to use without AI.
2. **Open source funds the platform.** The tidyverse, Shiny, tidymodels, and Quarto are all
   open-source projects maintained by the same people who sell Workbench and Connect. See
   [[Posit Open Source Software Catalog]] for the ~387 projects.
3. **The paid layer is governance, not capability.** Workbench, Connect, and Package Manager add
   centralized management, publishing control, and package curation — not new analysis features.

## Connections inside this vault

| Vault note | Why it connects |
|---|---|
| [[Typography/04_quarto]] | Quarto format reference |
| [[Typography/quarto_notes]] | Quarto / Typst authoring notes |
| [[Typography/Publishing_Quarto]] | Quarto in the publishing pipeline |
| [[Visualizations/01_shiny]] | Shiny learning guide |
| [[Visualizations/04_ggplot2]] | ggplot2 (Posit cheatsheets cited) |
| [[Visualizations/05_grammar_of_graphics]] | The grammar ggplot2 implements |
| [[Cheatsheets/README]] | R/Python reference materials |
| [[DMA_Notes/R Information for DMA projects]] | R stack in use for DMA work (ellmer, vitals, ragnar, mcptools) |
| [[computer_links/R Library Packages for Reporting]] | R library packages for reporting |
| [[ALX_Notes/DECC reporting engine]] | Reporting engine design — Quarto + Typst |
| [[quarto-lab/README]] | Local Quarto lab for rendering practice |

## Sources

All notes in this folder were captured on **2026-10-30** from:

- <https://posit.co> (including `/products/enterprise/academy`, `/products/open-source/rstudio`)
- <https://academy.posit.co>
- <https://opensource.posit.co>, `/software/`
- <https://quarto.org>, `/license.html`
- <https://positron.posit.co>

Everything external to the vault is a markdown link, per the linking rules in [[USERSGUIDE]].
