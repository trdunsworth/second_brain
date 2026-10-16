---
type: reference
status: active
topic: "The eight engines that turn Markdown into a book — mdBook, Sphinx+MyST, MkDocs Material, HonKit, Quartz, Jupyter Book, Manubot, Bookdown — with setup, tradeoffs, and a comparison table."
created: 2026-10-16
updated: 2026-10-16
aliases:
  - Markdown Book Engines
  - Book Engines
tags:
  - typography
  - publishing
  - markdown
  - sphinx
  - mdbook
  - mkdocs
  - honkit
  - manubot
  - bookdown
---

# Publishing — Markdown Book Engines

> Goal: choose and configure the right Markdown book engine. All eight below read `.md`; they differ wildly in what they add on top.
> Markdown syntax itself is in [[01_markdown|Markdown]] — this note is about the *engine*, not the language.
> Related: [[Publishing|Hub]] · [[Publishing_Pandoc|Pandoc]] · [[Publishing_Quarto|Quarto]] · [[Publishing_Print_and_Distribution|Print & Distribution]]

## How to use this note

1. Skim the comparison table in **§8** first — it is the fast path.
2. Then read only the engine you are actually considering in depth.
3. If none of them fit because you need a format none of them emits, read [[Publishing_Pandoc|Pandoc]] — it converts Markdown to everything on this list's output list.

> Mindset: the markup is the cheap, portable part; the engine is where the real decisions live (TOC mechanism, PDF engine, citation system, extension model). Pick the engine once per book and never mix.

---

## 1. mdBook

The Rust project's book tool, and the best "plain book, no ceremony" option. Single precompiled binary, no runtime dependencies.

```bash
mdbook init mybook      # scaffold: book.toml, src/, SUMMARY.md
cd mybook
mdbook serve            # live preview at localhost:3000
mdbook build            # output to book/
```

- **TOC = `SUMMARY.md`**, an explicit nested outline. Order is *declared*, not discovered from filenames — which means reordering the book is a diff in one file, not a mass rename.
- **`book.toml`** holds metadata (title, authors, description, language, output formats).
- Great extension story: preprocessors can rewrite the AST before rendering. Some require writing Rust.
- **PDF:** `mdbook-pdf` is a third-party preprocessor that routes to LaTeX (or Chromium). Unmaintained-ish; the HTML output and the PDF output are separate quality worlds.

Use it when: the book is a tutorial or reference for software; you want zero install friction for contributors.

---

## 2. Sphinx + MyST + `sphinx-book-theme`

This is the heaviest Markdown book stack and the one with the most powerful machinery — cross-references, an index, citations, and a scientific-publishing pedigree.

**Sphinx Template for Markdown Books**

[Template](https://github.com/sydasif/sphinx-book-template?source=post_page-----be02c6fa90e7-----------------------------------------) I found this from [this Medium article](https://medium.com/@sydasif78/how-to-write-a-book-in-markdown-a-complete-guide-for-everyone-be02c6fa90e7) which appears to be a good starting point.

Expanding on that starting point:

```bash
python -m venv .venv && .venv\Scripts\activate    # Windows; source .venv/bin/activate elsewhere
pip install -U sphinx myst-parser sphinx-book-theme linkify-it-py
# PDF output additionally needs a TeX distribution: TeX Live / MacTeX / MiKTeX
```

```python
# docs/conf.py — the only file you must edit to start
project  = "mybook"
author   = "Your Name"
extensions = ["myst_parser", "sphinxcontrib.bibtex"]   # myst_parser = Markdown support
html_theme = "sphinx_book_theme"
```

```bash
sphinx-build -M htmlbook docs docs/_build     # single-page HTML "book"
sphinx-build -M html     docs docs/_build     # paginated site
sphinx-build -M latex    docs docs/_build     # .tex out, then compile yourself
```

- **MyST** is Markdown with directives and roles (`{note}`, `{figure}`, `` {ref}`target` ``). This is the feature that makes Sphinx worth the weight: `(#intro)` cross-refs resolve at build time, and a broken ref is a **warning**, not a silently-wrong link.
- **The index is a real, generated index.** `\index{}`-style `(#term)` index entries plus `makeindex` produce a proper back-of-book index. No other Markdown engine on this list does this well.
- **`htmlbook`** builds one continuous scrolling document that *feels* like a book — the reason `sphinx-book-theme` exists.
- **Caveats:** reStructuredText is the native format; MyST is the Markdown front end and occasionally the two have feature gaps. The PDF path means maintaining a TeX install. The build is slow enough that `sphinx-autobuild` is effectively mandatory while drafting.
- **Related:** Jupyter Book is the maintained successor for *new* projects — it wraps Sphinx, defaults to MyST, and is far friendlier. Reach for raw Sphinx when you need an extension Jupyter Book does not carry.

---

## 3. MkDocs Material

The best-looking documentation site with the least effort, and increasingly the best-looking *book* site too.

```bash
pip install mkdocs-material
mkdocs new mybook
mkdocs serve        # live reload
mkdocs build        # output to site/
```

- **`nav:` in `mkdocs.yml` is the TOC.** No file discovery — explicit ordering.
- Enormous plugin ecosystem: Mermaid diagrams, admonitions, code annotations, tabbed content, social cards, versioning, and offline builds.
- **No native PDF.** Print comes from a headless Chromium against the built site — which is genuinely fine for screen-first books and genuinely bad for print (no page geometry, no real figure sizing).
- **Note:** MkDocs Material's own alternatives page now names **Zensical** as the successor project by the same team. Check its status before committing a long book to a stack that may be reorganizing.

Use it when: the web version *is* the product. Books that live as documentation.

---

## 4. HonKit

A maintained fork of the classic GitBook. The only stack here that emits PDF, EPUB, and MOBI from Markdown without you wiring an external converter.

```bash
npm install -g honkit
honkit init mybook
honkit serve
honkit build           # default output; pdf/epub/mobi via plugins
```

- `README.md` is the landing page; `SUMMARY.md` is the TOC; `book.json` holds config, including publication metadata.
- The GitBook/HonKit plugin ecosystem is large and much of it works unchanged.
- The catch: hundreds of plugins means hundreds of ways to break a reproducible build. Pin your dependency lockfile or accept drift.

Use it when: migrating an existing GitBook, or when "one tool emits HTML *and* EPUB" is worth the Node dependency.

---

## 5. Quartz and Jupyter Book

- **Quartz** ([quartz.jzhao.xyz](https://quartz.jzhao.xyz/)) is built *for* an Obsidian vault: wikilinks, backlinks, and callouts are first-class. Publish a subfolder of this second brain as a book-shaped website with almost no configuration. Node-based.
- **Jupyter Book** (`pip install jupyter-book jupyter-book[jupyterbook2markdown]`) is the maintainer-friendly Sphinx. `_config.yml` with `chapters:`, MyST Markdown, and `jupyter-book build .`. It is also the easiest route to a book with **executed** code cells — every figure and table regenerates on build, which is the difference between a reproducible textbook and a stale screenshot.

---

## 6. Manubot

The automated-publishing entry point. Markdown + git + CI → HTML/PDF/DOCX, deployed automatically on every push.

- **Cite by persistent identifier:** write `[https://doi.org/10.1038/nphys1170]` in prose and Manubot fetches, normalizes, and formats the reference. No reference manager, ever.
- The template (`Rootstock`) is a full journal submission: title page, authors, affiliations, ORCID, competing interests, references.
- The deploy step pushes to a chosen host on CI, so "publishing" becomes "pushing to main".

Use it when: a paper or a scientific book that must be regenerated from scratch, reproducibly, by anyone with the repository.

> Manubot's citation model is the same *mechanism* as Pandoc's `citeproc` — both resolve a key to CSL JSON and render it. Manubot just fetches the CSL JSON from the DOI for you. See [[Publishing_Pandoc#5. Citations|Pandoc §5]].

---

## 7. Bookdown (R)

`bookdown::render_book("index.Rmd")` produces a gitbook, `html_book2`, `pdf_book` (LaTeX), or `epub_book` from one R Markdown source. Cross-references, code chunks that execute on render, Shiny/HTML widgets, and LaTeX theorems that survive into every output format.

The R-native sibling of Quarto. If your book's figures come out of an R analysis, bookdown has been doing this for a decade; if not, Quarto does the same job with a Python/Julia engine and a less surprising toolchain.

---

## 8. Markdown engines compared

| | mdBook | Sphinx/MyST | MkDocs Material | HonKit | Quarto | Jupyter Book |
|---|---|---|---|---|---|---|
| Setup cost | Tiny | High | Low | Medium | Low | Medium |
| TOC source | `SUMMARY.md` | `toctree` | `nav:` | `SUMMARY.md` | `chapters:` | `chapters:` |
| PDF | Via LaTeX preprocessor | Built-in (LaTeX) | Chromium only | Via plugin | Built-in | Built-in |
| EPUB | No | Not native | No | Built-in | Built-in | No |
| Cross-refs | Basic | **Excellent** (label + ref) | Plugin | Basic | **Excellent** | **Excellent** |
| Index (back-of-book) | No | **Yes** | No | Plugin | No | No |
| Citations | No | bibtex | Plugin | Plugin | **citeproc + CSL** | citeproc |
| Executes code | No | No | Plugin | No | **Yes** | **Yes** |
| Best at | Programmer tutorials | Scientific books | Docs sites | Legacy + ebooks | Mixed-language books | Reproducible books |

### 8.1 Choosing

| If the book needs… | Pick |
|-------------------|------|
| A back-of-book index, or journal-grade cross-refs | Sphinx (or Jupyter Book) |
| The best-looking web version with minimal work | MkDocs Material |
| PDF + EPUB + MOBI from one tool, no external converter | HonKit |
| Figures and tables that regenerate from live code | Quarto or Jupyter Book |
| An Obsidian vault published as-is | Quartz |
| Cite-by-DOI and CI deployment | Manubot |
| Figures computed in R | Bookdown |
| Nothing special, fast to start | mdBook |

> None of these emits a PDF you can hand to a commercial printer. If print is in scope, the interior is built in [[Publishing_Typst|Typst]] or [[Publishing_LaTeX|LaTeX]] at the book's trim size — see [[Publishing_Print_and_Distribution|Print & Distribution]].

---

## Resources

- [mdBook Guide](https://rust-lang.github.io/mdBook/)
- [sphinx-book-theme docs](https://sphinx-book-theme.readthedocs.io/) and [MyST Parser](https://myst-parser.readthedocs.io/)
- [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) — including its [alternatives page](https://squidfunk.github.io/mkdocs-material/alternatives/) noting Zensical
- [HonKit](https://github.com/HonKit/HonKit)
- [Quartz](https://quartz.jzhao.xyz/) · [Jupyter Book](https://jupyterbook.org/)
- [Manubot](https://manubot.org/) and the [Rootstock template](https://github.com/manubot/rootstock)
- [bookdown.org](https://bookdown.org/)

---

*Last updated: 2026-10-16.*
