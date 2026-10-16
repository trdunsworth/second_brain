---
type: reference
status: active
topic: "Publishing with AsciiDoc — Asciidoctor PDF and its YAML theme model, plus Antora Assembler for turning a versioned documentation site into a single PDF or EPUB book."
created: 2026-10-16
updated: 2026-10-16
aliases:
  - AsciiDoc Publishing
  - Antora Books
tags:
  - typography
  - publishing
  - asciidoc
  - asciidoctor
  - antora
  - pdf
---

# Publishing — AsciiDoc and Antora

> Goal: author in AsciiDoc and produce print-ready PDFs, including turning an Antora documentation site into a book.
> AsciiDoc syntax is in [[05_asciidoc|AsciiDoc]] — this note is about conversion and book assembly.
> Related: [[Publishing|Hub]] · [[Publishing_Markdown_Engines|Markdown Engines]] · [[Publishing_Print_and_Distribution|Print & Distribution]]

## How to use this note

§1 if you have one manuscript. §2 only if the manuscript is a versioned documentation set.

> Mindset: AsciiDoc's bet is that a *book* is a document with parts, chapters, sections, and cross-references as first-class structure — which is true, and which plain Markdown has no opinion about. If you find yourself fighting Markdown's lack of structure, this is the alternative that does not fight back.

---

## 1. Asciidoctor PDF — AsciiDoc straight to print

```bash
gem install asciidoctor asciidoctor-pdf
asciidoctor-pdf book.adoc -o dist/book.pdf
```

- No intermediate format — AsciiDoc goes directly to PDF (no DocBook, no LaTeX, no FO).
- Layout is controlled by a **YAML theme file**, not by markup in the document. That separation is the whole point: restyle the book by editing `theme.yml`, never by editing 300 `.adoc` files.
- `:doctype: book` is what turns on part/chapter structure, roman-numeral front matter, and the book's own TOC.
- Asciidoctor PDF 1.x is EOL — use 2.x. The theme API changed between them; a 1.x theme will not load in 2.x.

```yaml
# book.adoc
= The Book Title
:doctype: book
:author: Tony Dunsworth
:revdate: 2026-10-16
:toc:
:sectnums:
:imagesdir: images

[part]
== Getting Started

include::chapters/intro.adoc[]
```

### 1.1 The theme file

```yaml
# theme.yml — this is where book design lives
extends: default
page:
  layout: portrait
  margin: [0.75in, 0.75in, 0.75in, 0.75in]
  numbering:
    start-at: toc
base:
  font-color: #1a1a1a
  font-family: Source Serif Pro
  font-size: 10.5
  line-height-length: 15
heading:
  font-family: Source Sans Pro
  font-style: bold
title-page:
  align: center
```

Two rules that prevent most AsciiDoc book problems: never put styling in the document body, and never fork the theme file inline — extend `default` so upgrades stay possible.

---

## 2. Antora + Assembler — versioned docs that also print

Antora is a multi-repo, multi-version documentation platform. The book-relevant piece is **Assembler**, which fuses pages back into a single logical document and hands it to a converter:

```bash
npx antora -r @antora/pdf-extension playbook.yml     # site + PDF books
```

```yaml
# antora-assembler.yml
assembler:
  toc:
  pdf-theme: ./pdf-theme.yml
build:
  command: bundle exec asciidoctor-pdf
```

- Assembler resolves Antora's cross-references and resource references first — that is why you cannot run `asciidoctor-pdf` directly on Antora content.
- The official PDF extension uses Asciidoctor PDF; an official EPUB extension exists too (via Asciidoctor EPUB3).
- `section_merge_strategy: fuse` drops a page's own title and promotes its sections — exactly what you want when a documentation page becomes a book chapter.
- Overhead is real: a playbook, a component descriptor, a UI bundle, Node *and* Ruby. Justified for a versioned doc set; excessive for one book.

### 2.1 When Antora earns its overhead

| Situation | Antora? |
|-----------|---------|
| One manuscript, one edition | **No** — Asciidoctor PDF alone is enough |
| Documentation spanning multiple repos and versions | **Yes** — this is what it is for |
| Docs that must also ship as a printed/downloaded PDF | **Yes** — Assembler is the only clean path |
| A book that will never be versioned | **No** — the playbook/UI bundle is dead weight |

---

## Resources

- [Asciidoctor PDF docs](https://docs.asciidoctor.org/pdf-converter/latest/) — including the theme key reference
- [Asciidoctor](https://asciidoctor.org) — the main project
- [Antora documentation](https://docs.antora.org) and [Antora Assembler](https://docs.antora.org/assembler/latest/) · [PDF Extension](https://docs.antora.org/assembler/latest/pdf-extension/)
- [Antora UI default](https://github.com/antora/antora-ui-default) — the starting theme
- [[05_asciidoc|AsciiDoc syntax guide]]

---

*Last updated: 2026-10-16.*
