---
type: reference
status: active
topic: "Quarto book projects — creating a book, configuring _quarto.yml for multi-format output, understanding the HTML vs single-file render split, and publishing the result."
created: 2026-10-16
updated: 2026-10-16
aliases:
  - Quarto Books
  - Quarto Book Projects
tags:
  - typography
  - publishing
  - quarto
  - pandoc
  - epub
---

# Publishing — Quarto Books

> Goal: create a Quarto book project that renders to HTML, PDF, Typst, DOCX, and EPUB from one source, then publish it.
> Quarto syntax is in [[04_quarto|Quarto]]. The parameterized-report workflow is in [[quarto_notes|quarto_notes]] — **that is a different note**: reports that repeat on a schedule, not books that get written once.
> Related: [[Publishing|Hub]] · [[Publishing_Pandoc|Pandoc]] · [[Publishing_Typst|Typst]] · [[Publishing_Print_and_Distribution|Print & Distribution]]

## How to use this note

§1–§2 to build the book. §3 to ship it. If your book is prose with no code, Quarto is heavier than you need — see [[Publishing#9. Recommended starting stacks|the hub's stack table]] first.

> Mindset: Quarto is Pandoc with a project system, a theme system, and computational engines bolted on. Everything the chapters can do is executable — which is either the feature you came for or the thing you should turn off.

---

## 1. Create and configure

```bash
quarto create project book mybook
cd mybook
quarto preview          # live preview
quarto render           # all formats → _book/
```

```yaml
# _quarto.yml
project:
  type: book

book:
  title: "A Real Book"
  author: "Tony Dunsworth"
  date: "2026-10-16"
  chapters:
    - index.qmd
    - intro.qmd
    - methods.qmd
    - references.qmd

bibliography: references.bib

format:
  html:
    theme: cosmo
    downloads: [pdf, epub]     # download buttons in the navbar
  pdf:
    documentclass: scrreprt    # or: typst
  epub:
    cover-image: cover.png

downloads: [pdf, epub, docx]
```

---

## 2. What to know about the outputs

- **One `quarto render` produces everything.** Chapters are executed individually, then merged into a single Pandoc document for single-file formats (PDF, EPUB, DOCX, Typst). HTML is built multi-file for navigation.
- **Output lands in `_book/`** (not `_site/`). Single-file artifacts are named from `output-file` or the book title.
- **Typst output** uses the bundled `orange-book` extension for textbook styling — you get Typst-speed PDFs with zero TeX install, which is the single strongest argument for Quarto in a Python/Julia book.
- **Format options live in `_quarto.yml`, not in chapters**, because single-file formats are rendered as one document with one set of options.

### 2.1 The HTML/single-file split

| Format type | Formats | How it builds |
|-------------|---------|---------------|
| Multi-file | HTML, AsciiDoc | Each chapter rendered on its own; sidebar, search, and nav built per chapter |
| Single-file | PDF, EPUB, DOCX, Typst | Chapters executed separately, merged into one markdown stream, then **one** Pandoc call |

Practical consequence: page-geometry decisions (margins, figure sizing, heading breaks) apply to the single-file render and *cannot* vary per chapter. Decide them once in `_quarto.yml`.

---

## 3. Publish

```bash
quarto publish gh          # push _book/ to GitHub Pages via a workflow
quarto publish netlify
```

Or commit the rendered `_book/` yourself and let CI do it — which is what you want when the build is expensive and the site is the artifact.

### 3.1 CI

```yaml
# .github/workflows/book.yml
name: render-book
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  render:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: quarto-dev/quarto-actions/setup@v2
      - uses: quarto-dev/quarto-actions/publish@v2
        with:
          target: gh-pages
```

The Quarto action handles the PDF toolchain (TinyTeX or Typst) and the Pages deployment, so the workflow stays short. Pin the Quarto version if reproducibility across releases matters.

---

## 4. When Quarto is the wrong choice

| Situation | Go to |
|-----------|-------|
| No executable content, and you want the lightest possible book build | [[Publishing_Markdown_Engines\|Markdown engines]] |
| The book *is* a LaTeX document in disguise (math, theorem environments, journal format) | [[Publishing_LaTeX\|LaTeX]] |
| You want Typst-speed PDFs but no project/config layer | [[Publishing_Typst\|Typst]] directly |
| You need a generated index or glossary | [[Publishing_LaTeX\|LaTeX]] or [[Publishing_Markdown_Engines#2. Sphinx + MyST + sphinx-book-theme\|Sphinx]] |

---

## Resources

- [Quarto: Creating a Book](https://quarto.org/docs/books/) — the primary walkthrough
- [Book Structure](https://quarto.org/docs/books/structure.html) · [Book Crossrefs](https://quarto.org/docs/books/crossrefs.html) · [Customizing Book Output](https://quarto.org/docs/books/book-output.html)
- [Book Options reference](https://quarto.org/docs/reference/projects/books.html) — every key in `_quarto.yml`
- [quarto-dev/quarto-actions](https://github.com/quarto-dev/quarto-actions)
- [[04_quarto|Quarto syntax guide]] · [[quarto_notes|Quarto parameterized reports]]

---

*Last updated: 2026-10-16.*
