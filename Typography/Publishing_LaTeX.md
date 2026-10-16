---
type: reference
status: active
topic: "Authoring and producing books in LaTeX — document class selection, multi-pass builds, the index/glossary/bibliography apparatus, EPUB via tex4ebook, print production, and JATS for accessible output."
created: 2026-10-16
updated: 2026-10-16
aliases:
  - LaTeX Books
  - LaTeX Publishing
tags:
  - typography
  - publishing
  - latex
  - epub
  - pdf
  - accessibility
---

# Publishing — LaTeX Books

> Goal: author a book in LaTeX, choose the right document class, build it correctly, and produce EPUB, print, or JATS output when needed.
> LaTeX syntax is in [[06_latex|LaTeX]] — this note is about books, not documents.
> Related: [[Publishing|Hub]] · [[Publishing_Typst|Typst]] · [[Publishing_Pandoc|Pandoc]] · [[Publishing_Print_and_Distribution|Print & Distribution]]

## How to use this note

§1–§3 are the core of any LaTeX book. §4–§6 are for when the book must exist in more than one format.

> Mindset: LaTeX is the only stack here that publishers and journals accept without negotiation, and the only one whose index/glossary/reference apparatus has never needed replacing. That is worth a steep learning curve if your book is 400 pages — and not worth it if it is 40.

---

## 1. Choosing a document class

| Class | Character | Use when |
|-------|-----------|----------|
| `book` | The plain default | Rarely. Start from something better. |
| `report` | Standard, well-understood | Short technical monographs |
| `memoir` | An entire book-design system in one class | **Default choice for books** — page styles, chapter openers, indexes, glossaries all configurable from the preamble without fighting an external package |
| `scrbook` (KOMA-Script) | Modern, excellent typography, first-class multilingual | Bilingual or non-English books; German-speaking users' default |
| `tufte-book` | Sidenotes, wide margins, small caps epigraphs | Essayistic, data-dense, print-first books where marginalia matter |
| `tufte-handout` | | Short papers, leave-behinds |
| `extbook` | `book` with `geometry`/`titlesec` defaults | When you want the familiar structure with modern margins |

> Choosing rule: `memoir` unless you have a reason. It is the only class here where page design, chapter openers, and the index are all one coherent system rather than three packages fighting over `\chapter`.

---

## 2. The three-pass build

LaTeX's cross-references, table of contents, index, and page numbers do not exist on pass one. Build them:

```bash
latexmk -pdf  main.tex            # handles the passes for you — use this
lualatex main.tex && lualatex main.tex && makeindex && lualatex main.tex && lualatex main.tex
```

`latexmk` is not optional for a book. A manual `pdflatex` run produces a document with `??` in place of every cross-reference.

```bash
latexmk -pdf -pvc main.tex         # continuous preview: rebuilds on save
```

---

## 3. The apparatus a real book needs

| Need | Package | Note |
|------|---------|------|
| Margins | `geometry` | Also sets `\newgeometry` for part-title pages |
| Microtypography | `microtype` | The single biggest quality-per-line improvement in print |
| Running heads | `fancyhdr` (or `memoir`'s built-ins) | Verso = book title, recto = chapter title |
| Tables | `booktabs` | `\toprule`/`\midrule`/`\bottomrule` |
| Index | `makeidx` + `imakeidx` | `\index{}` in text, `makeindex` between passes |
| Glossary | `glossaries` / `acronym` | Pass **three** |
| Bibliography | `biblatex` + `biber` | Better than `bibtex` for anything modern |
| Hyperlinks | `hyperref` | Load **late**, after most packages |
| Mathematics | `amsmath`, `amssymb` | Non-negotiable for a technical book |
| Theorem environments | `amsthm` | Define once, reuse for 300 pages |
| Unicode + system fonts | `fontspec` with LuaLaTeX/XeLaTeX | Use LuaLaTeX by default in 2026 |
| Multilingual | `babel` (Latin) or `polyglossia` (Lua/Xe) | Sets hyphenation, captions, dates |

```latex
% Preamble skeleton worth stealing
\documentclass[12pt,oneside]{memoir}
\usepackage{geometry}\geometry{margin=1in}
\usepackage{microtype}
\usepackage{amsmath,amssymb,amsthm}
\usepackage{booktabs}
\usepackage{imakeidx}
\makeindex
\usepackage[backend=biber,style=apa]{biblatex}
\addbibresource{refs.bib}
\usepackage{fancyhdr}
\pagestyle{fancy}\fancyhf{}\fancyhead[LE]{\small\thepage\quad\leftmark}
```

---

## 4. EPUB from LaTeX

[`tex4ebook`](https://ctan.org/pkg/tex4ebook) (v0.4d, Feb 2026) converts LaTeX to EPUB/EPUB3/MOBI/AZW using `tex4ht` + `make4ht`:

```bash
tex4ebook -f epub3 --lua main.tex     # EPUB 3 (MathML-capable)
tex4ebook -f epub  --lua main.tex     # EPUB 2
tex4ebook -f azw3 --lua main.tex      # Kindle, via Calibre's ebook-convert
```

- **Choose `epub3` if the book has math.** EPUB 2 has no MathML, so formulas become images with broken inline alignment. EPUB 3 renders real MathML — but many e-ink readers don't support it. For a prose book, either works; for a math book, EPUB 3 on modern devices plus the PDF for e-ink is the honest answer.
- `tex4ebook` ships with TeX Live and MiKTeX. Requires a distribution that includes `tex4ht`.
- Custom CSS and fonts go in a config file passed with `-c`.

---

## 5. Print production

- **Target PDF/X, not "a PDF that prints."** `-V pdfstandard="PDF/X-4"` via [[Publishing_Pandoc#4. Archival and print standards|Pandoc]] or Ghostscript with a print profile.
- **Page geometry is a trim-size decision, not a preference.** Design for 6×9 in, not US Letter; the manuscript PDF you read on screen is not the PDF a printer wants.
- Fonts must be **embedded and subset** — check with `pdffonts`. A missing glyph is a rejected upload.
- Colors: CMYK conversion for commercial print, RGB for POD. Do it deliberately, not by accident.

Upload geometry and preflight commands are in [[Publishing_Print_and_Distribution|Print & Distribution]].

---

## 6. JATS and accessible output

```bash
latexmlpost --dest-format=jats article.tex > article.xml
```

JATS XML is what NLM/PMC and many journals want, and it is the most accessible mathematical publishing format available because the math survives as structure rather than as a picture. If accessibility is a requirement rather than a nice-to-have, LaTeXML from a LaTeX source is the shortest credible path.

> No other stack in this folder produces JATS from first principles. If a funder or journal asks for structured XML, start here and work outward.

---

## Resources

- [CTAN](https://ctan.org) — packages; [CTAN/pkg](https://ctan.org/pkg) for search
- [LaTeX Project](https://latex-project.org) · [Overleaf Gallery](https://overleaf.com/gallery)
- [LaTeX Wikibook](https://en.wikibooks.org/wiki/LaTeX) — the free tutorial
- [TeX StackExchange](https://tex.stackexchange.com) — the best Q&A for LaTeX/Typst-class problems
- [tex4ebook](https://ctan.org/pkg/tex4ebook) · [LaTeXML](https://latexml.github.io/)
- [Dante's Inferno](https://danteinferno.mit.edu/) — the canonical demonstration of what LaTeX does to a novel
- [[06_latex|LaTeX syntax guide]]

---

*Last updated: 2026-10-16.*
