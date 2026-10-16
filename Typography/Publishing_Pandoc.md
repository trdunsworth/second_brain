---
type: reference
status: active
topic: "Pandoc as the publishing glue layer — multi-file book structure, PDF engines, PDF/A·X·UA standards, EPUB splitting, citations, and Lua filters."
created: 2026-10-16
updated: 2026-10-16
aliases:
  - Pandoc Publishing
  - Pandoc Book Pipeline
tags:
  - typography
  - publishing
  - pandoc
  - epub
  - pdf
  - latex
  - typst
---

# Publishing — Pandoc, the Glue Layer

> Goal: use Pandoc as the conversion hub between a Markdown manuscript and every output format — PDF, EPUB, DOCX, Typst, LaTeX, JATS.
> Pandoc is not a book engine. It is the *converter* that every hybrid stack is built on. If your book needs to exist as both a typeset PDF and a reflowable EPUB, Pandoc is almost certainly in the middle of it.
> Related: [[Publishing|Hub]] · [[Publishing_Markdown_Engines|Markdown Engines]] · [[Publishing_Typst|Typst]] · [[Publishing_LaTeX|LaTeX]] · [[08_pandoc|Pandoc CLI reference]]

## How to use this note

Read §1–§3 to build a book. Read §4–§6 only when that book has to survive a printer, an archive, or a journal.

> Mindset: Pandoc normalizes everything to one AST. Every question below reduces to "what does my AST carry, and which writer can express it?" Loss happens at the writer, not the reader — which means you can diagnose it by round-tripping to `-t native`.

---

## 1. The shape of a Pandoc book

```
book/
├── metadata.yaml         # title, author, date, lang, rights — single source
├── contents/
│   ├── 001-intro.md
│   ├── 002-background.md
│   └── 003-methods.md
├── bibliography.bib
├── templates/
│   └── book.typ          # your Typst page setup, as a Pandoc template
└── dist/                 # generated; never edit
```

Numeric filename prefixes give you **declarative chapter order** that survives adding a chapter in the middle. The alternative — hand-maintaining a `# Introduction {#intro}` label and re-numbering every cross-reference — is worse in every language.

---

## 2. Concatenating and building

```bash
# Markdown -> single Typst source, in filename order, with metadata applied
pandoc contents/*.md \
  --metadata-file=metadata.yaml \
  --citeproc --bibliography=bibliography.bib \
  --number-sections --toc \
  -o dist/book.typ

# Typst -> PDF (fast; vector text, subset-embedded fonts)
typst compile dist/book.typ

# Markdown -> EPUB in one shot
pandoc contents/*.md --metadata-file=metadata.yaml \
  --toc --split-level=2 --epub-cover-image=cover.jpg \
  -o dist/book.epub
```

`--split-level=2` is the EPUB detail people miss: it controls where the file breaks into reading units. Chapter-level (2) is right for prose; sub-sections (3) are right for reference material.

---

## 3. PDF engines

```bash
pandoc book.md -o book.pdf --pdf-engine=lualatex   # typographic best (microtype, fontspec)
pandoc book.md -o book.pdf --pdf-engine=xelatex    # simpler font handling
pandoc book.md -o book.pdf --pdf-engine=typst      # no TeX distribution at all
pandoc book.md -o book.pdf --pdf-engine=wkhtmltopdf  # CSS-based layout
pandoc book.md -o book.pdf --pdf-engine=weasyprint  # CSS Paged Media, excellent for print
```

Choosing the PDF engine is choosing *who owns your layout*. LaTeX/Typst engines own it (real page geometry, float placement, running heads, microtype). `weasyprint` owns it in CSS (`@page`, margin boxes, `string-set` running headers) which is a pleasant way to get print-grade output from a Markdown book with no TeX install at all.

---

## 4. Archival and print standards

Recent Pandoc can emit **PDF/A**, **PDF/X**, and **PDF/UA** directly from LaTeX metadata — no Ghostscript post-pass:

```bash
pandoc book.md -o book.pdf --pdf-engine=lualatex -V pdfstandard=PDF/A-2b
pandoc book.md -o book.pdf --pdf-engine=lualatex -V pdfstandard="PDF/X-4"
pandoc book.md -o book.pdf --pdf-engine=lualatex -V pdfstandard=PDF/UA-1
```

This uses LaTeX's `\DocumentMetadata` and therefore **requires LuaLaTeX**. If you need a standard Pandoc does not emit, the fallback is `gs` (Ghostscript) with the right `-dPDFSETTINGS`/`PDFA_def.ps`, or `pikepdf`/`qpdf` for post-processing.

**Why you care:** PDF/A is what libraries and archives accept. PDF/X is what a commercial printer accepts. PDF/UA is what an accessibility reviewer accepts. Each is a different promise.

> Consequence worth internalizing: any book built through Pandoc + LaTeX can be made archivable without changing tools. See [[Publishing_Print_and_Distribution#2.3 Preflight|Print & Distribution §3.3]] for validating the result.

---

## 5. Citations

Pandoc's `citeproc` implementation plus a CSL style file is the single most reusable piece of the whole toolchain:

```bash
pandoc book.md --citeproc --bibliography=bibliography.bib --csl=apa.csl -o book.pdf
```

`[@doe2020]` in prose becomes "(Doe, 2020)" in the text and a formatted reference list at the end. Zotero with **Better BibTeX** exports a `.bib` on every save; [[Publishing_Markdown_Engines#6. Manubot|Manubot]] skips the `.bib` entirely by fetching from DOIs. One mechanism, three workflows.

---

## 6. Lua filters

Filters are the escape hatch when a book's structure does not fit the source language — insert a dedication page, mark first occurrences of terms, renumber figures per chapter:

```bash
pandoc contents/*.md --lua-filter=prelude.lua --lua-filter=figures.lua -o dist/book.typ
```

Filters run on Pandoc's JSON AST, so they work regardless of input language — a filter written for Markdown works on AsciiDoc and Djot input too.

### 6.1 Debugging a bad conversion

When output is wrong in a way you cannot explain, stop guessing and look at the tree:

```bash
pandoc book.md -t native | less          # or: -t json | jq '.blocks[0]'
pandoc book.md -f djot -t native         # is the reader losing it?
pandoc book.md -t typst -o -             # is the writer losing it?
```

Round-tripping `input → native → X → native` isolates which stage dropped the construct. That is also how you tell a syntax error from a writer limitation.

---

## 7. Other languages through Pandoc

Pandoc is also the bridge for the languages that have no book engine of their own:

```bash
pandoc book.djot -o book.pdf --pdf-engine=lualatex      # Djot is a first-class reader/writer
pandoc report.docx -f docx -t gfm -o report.md          # import a legacy manuscript
```

See [[Publishing_Djot_and_Carve|Djot and Carve]] for the state of those two languages, and `pandoc --list-input-formats` for the full reader list.

---

## Resources

- [Pandoc User's Guide](https://pandoc.org/MANUAL.html) — the definitive reference
- [Pandoc templates](https://pandoc.org/templates.html) — how `$title$`, `$body$`, `$for(author)$` work
- [Pandoc filters and Lua](https://pandoc.org/lua-filters.html)
- [Citations and bibliography](https://pandoc.org/MANUAL.html#citations) · [CSL styles](https://citationstyles.org/)
- [Try pandoc](https://www.pandoc.org/try/) — in-browser conversion tester
- [[08_pandoc|Pandoc CLI cheatsheet]] in this folder

---

*Last updated: 2026-10-16.*
