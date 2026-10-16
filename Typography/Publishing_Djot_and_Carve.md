---
type: reference
status: active
topic: "Publishing with Djot and Carve — the two post-Markdown languages with published grammars, how each reaches real output formats through Pandoc, and an honest read on whether to bet a book on either."
created: 2026-10-16
updated: 2026-10-16
aliases:
  - Djot and Carve Publishing
  - Emerging Markup Publishing
tags:
  - typography
  - publishing
  - djot
  - carve
  - pandoc
---

# Publishing — Djot and Carve

> Goal: assess the two post-Markdown languages that have real grammars but no book engines, and get output from each anyway.
> Djot syntax is in [[02_djot|Djot]]; Carve syntax is in [[07_carve|Carve]]. This note is about *shipping* them.
> Related: [[Publishing|Hub]] · [[Publishing_Pandoc|Pandoc]] · [[Publishing_Typst|Typst]]

## How to use this note

Short note, honest note. Both languages are worth using; neither is worth a 400-page commitment yet.

> Mindset: these two are **authoring languages, not typesetting engines**. That distinction is the whole note. If you need a book, you are routing through Pandoc (Djot) or through Pandoc/Typst (Carve) regardless of how nice the source syntax is.

---

## 1. Djot

Djot is a markup language with a **published, unambiguous grammar** and no backtracking parse — the design response to two decades of "my Markdown differs from yours."

**State of the art for publishing (October 2026): use Djot *through* Pandoc, not natively.**

```bash
pandoc book.djot -o book.pdf --pdf-engine=lualatex
pandoc book.djot -o book.epub --toc
pandoc book.djot -f djot -t typst -o book.typ
```

- Pandoc has read and written Djot since 3.1.12 (February 2024). It is a first-class format in the reader/writer list, not an afterthought.
- Round-tripping Djot → native → Djot is tested by the Djot library, but pandoc's Djot writer has known divergences from canonical Djot — Pandoc's AST has concepts Djot does not. Round-trip fidelity is not guaranteed.
- Djot's own toolchain is a reference implementation plus a playground. There is no Djot book engine, no Djot theme, and no Djot POD pipeline.

**Recommendation:** Djot is an excellent *authoring* choice for a document where predictable rendering matters (specs, notes, technical writing) and a poor *typesetting* choice, because you still need Pandoc or LaTeX downstream. Adopt it for notes. Revisit when the ecosystem catches up.

---

## 2. Carve

Carve is a post-Markdown language with published EBNF grammar, conformance-tested independent implementations, built-in cross-references, captions on every block type, table rowspan/colspan, and native admonitions.

**It is the newest stack here and the only one with a complete bridge story.**

### 2.1 Why it matters for publishing

```bash
npm install @markup-carve/carve @markup-carve/pandoc-carve

npx pandoc-carve book.crv -t typst -o book.typ   # then typst compile
npx pandoc-carve book.crv -t pdf   -o book.pdf   # via pandoc's own engines
npx pandoc-carve book.crv -t epub  -o book.epub
npx pandoc-carve book.crv -t json                 # Pandoc AST, no pandoc binary needed
```

- **`pandoc-carve` is bidirectional.** Carve → Pandoc JSON unlocks every Pandoc writer (LaTeX, Typst, DOCX, PDF, EPUB, JATS, RST). Pandoc → Carve imports anything Pandoc reads (DOCX, LaTeX, RST, Org, MediaWiki, Markdown) — so a legacy manuscript converts into a Carve book.
- **Loss is reported, never silent.** `pandoc-carve --diagnostics report.json` lists `preserved`, `normalized`, and `degraded` constructs. Tier-3 extensions (mermaid, charts) arrive as degraded block forms by design, and the tool tells you so.
- **Native PDF output exists:** `carve-pdf` renders `.crv` straight to paginated PDF, with `carve-sile` (SILE typesetting) and `carve-hexapdf` (pure-Ruby) as alternatives.
- **Static-site integrations:** `mkdocs-carve`, `jekyll-carve`, `hugo-carve`, `astro-carve`, `docusaurus-carve` — Carve pages inside other people's generators.
- **Migration is a real tool, not a manual job:** `carve migrate --from markdown book.md > book.crv`, then `carve lint`. The traps it does *not* fix for you: `*italic*`/`**bold**` swapped to `/italic/`/`*bold*`, and `{#id}` on a heading (which silently becomes a tag *and* changes the anchor instead of staying inert).

### 2.2 The honest assessment

| Strengths | Gaps |
|-----------|------|
| Conformance-tested parsers in JS/PHP/Rust | Small package ecosystem; few third-party integrations |
| Pandoc bridge reaches every real output format | The spec is on its 0.x line and still moving — expect breakage |
| Loss diagnostics are unusually honest | No mature book templates, themes, or POD layouts yet |
| Bare HTML is literal text — a genuine safety property | You still choose and maintain the page layout yourself |

**Recommendation:** prototype a chapter. Use `carve-pdf` or `carve → pandoc → typst` as the build. Do not commit a long-form book to it until the spec settles — but it is the most interesting development on this list, and it is already a strictly better drafting tool than raw Markdown for documents with figures, tables, and cross-references.

---

## 3. Djot and Carve compared

| | Djot | Carve |
|---|---|---|
| Grammar | Published, unambiguous | EBNF, published |
| In Pandoc | Native reader **and** writer (since 3.1.12) | Via `pandoc-carve` bridge |
| Native PDF engine | None | `carve-pdf`, `carve-sile`, `carve-hexapdf` |
| Book templates | None | None |
| Round-trip safety | Pandoc's writer diverges from canonical Djot | Byte-identical HTML round-trip is a test gate |
| Import path | n/a | DOCX, LaTeX, RST, Org, MediaWiki, Markdown |
| Ecosystem maturity | Small | Very small |
| Verdict | Author with it, typeset through Pandoc | Prototype; watch the spec |

---

## Resources

- [djot.net](https://djot.net) — spec, playground, and the Djot vs Markdown argument
- [Pandoc Djot reader/writer](https://github.com/jgm/pandoc) — `Text.Pandoc.Readers.Djot`
- [Carve documentation](https://markup-carve.github.io/carve/) · [Format conversion](https://markup-carve.github.io/carve/format-bridges) · [Coming from Markdown](https://markup-carve.github.io/carve/migrate-from-markdown)
- [pandoc-carve](https://github.com/markup-carve/pandoc-carve) — the bridge, including `--diagnostics`
- [[02_djot|Djot syntax guide]] · [[07_carve|Carve syntax guide]]

---

*Last updated: 2026-10-16. Both ecosystems are moving fast; re-check before committing.*
