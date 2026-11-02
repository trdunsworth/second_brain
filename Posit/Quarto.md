---
type: reference
status: active
topic: "Quarto — the open-source scientific and technical publishing system from Posit: authoring engines, output formats, extensions, and licensing."
created: 2026-11-01
tags:
  - posit
  - quarto
  - publishing
  - data-science
  - reference
---

# Quarto

Source: <https://quarto.org> — captured 2026-11-01.

## Positioning

Quarto is an **open-source scientific and technical publishing system** from Posit Software, PBC
(formerly RStudio, PBC) — the makers of RStudio, the tidyverse, and Shiny. Its tagline:
*"Analyze. Share. Reproduce. You have a story to tell with data — tell it with Quarto."*

It is the **multi-language, next-generation version of R Markdown**, with many new features; like
R Markdown it uses **knitr** to execute R code and renders most existing R Markdown documents without
modification.

## The publishing system

- **Author** using Jupyter notebooks or plain Markdown in your favorite editor; dynamic content via
  the Python, R, Julia, and Observable engines.
- **Publish** reproducible, production-quality articles, presentations, dashboards, websites, blogs,
  and books in HTML, PDF, MS Word, ePub, and more — to Posit Connect, Confluence, or other publishing
  systems.
- **Write** using Pandoc Markdown: equations, citations, cross-references, figure panels, callouts,
  advanced page layout.
- **Add interactivity** via Jupyter Widgets, htmlwidgets for R, Observable JS, and Shiny.

## Authoring tools

Editor-agnostic by design: author in Positron, VS Code, RStudio, Jupyter Lab, or any text editor; use
the Quarto visual Markdown editor for long-form documents.

## Licensing

Quarto is open source; see the license page (<https://quarto.org/docs/license.html>) for the terms.

## Scope of this note

This note is the Posit-ecosystem reference for the publishing system. Day-to-day authoring practice —
books, parameterized reports, publishing pipelines — lives in the Typography notes:
[[Typography/04_quarto]], [[Typography/Publishing_Quarto]], [[Typography/quarto_notes]], and the
[[quarto-lab/README]] lab.

## Relevance here

- Quarto is the publishing engine of the vault's reporting stack — the "Quarto weekly PDF report per
  audience" item in [[Reporting Engine/TODO|TODO.md]] and the workflow in
  [[Typography/quarto_notes|quarto_notes]].

## Sources

- <https://quarto.org>
- <https://quarto.org/docs/license.html>
- <https://github.com/quarto-dev/quarto-cli>
