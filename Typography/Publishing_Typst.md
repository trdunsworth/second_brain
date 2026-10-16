---
type: reference
status: active
topic: "Building and typesetting books with Typst — project anatomy, the Universe book-template ecosystem, POD trim sizes and cover wraps, and when Typst is the wrong choice."
created: 2026-10-16
updated: 2026-10-16
aliases:
  - Typst Books
  - Typst Publishing
tags:
  - typography
  - publishing
  - typst
  - pdf
  - print-on-demand
---

# Publishing — Typst Books

> Goal: build a book in Typst, pick a template, and produce print-ready output when print is in scope.
> Typst syntax is in [[03_typst|Typst]] — this note is about assembling a *book*, not a document.
> Related: [[Publishing|Hub]] · [[Publishing_Pandoc|Pandoc]] · [[Publishing_Quarto|Quarto]] · [[Publishing_Print_and_Distribution|Print & Distribution]]

## How to use this note

§1–§2 to get a book compiling. §3 only when print is real. Read the closing note before committing 400 pages.

> Mindset: **page setup lives in exactly one file.** Chapters own content; the `show` rule in `main.typ` owns layout. That single rule keeps a 40-chapter book restyleable in an afternoon instead of a month.

---

## 1. Anatomy

```
mybook/
├── main.typ             # entry point: #import "@preview/bookly": * then #show: bookly(...)
├── chapters/
│   ├── ch01-intro.typ
│   └── ch02-methods.typ
├── figures/
├── fonts/
├── ref.bib
└── main.pdf              # generated
```

```typst
#import "@preview/bookly:5.2.0": *

#show: bookly.with(
  title: "A Real Book",
  author: "Tony Dunsworth",
  date: datetime(year: 2026, month: 10, day: 16),
  lang: "en",
)

= Introduction <intro>
#include "chapters/ch01-intro.typ"
```

Chapter files never contain page setup. The `show` rule in `main.typ` owns layout; chapters own content. Same invariant as every other stack.

```bash
typst init @preview/bookly:5.2.0 mybook   # scaffold from a template
typst compile main.typ                   # → main.pdf
typst watch main.typ                     # sub-second rebuild loop
```

---

## 2. Template ecosystem (Typst Universe)

| Template | Best for | Notable |
|----------|----------|---------|
| [`bookly`](https://typst.app/universe/package/bookly/) | Academic books, theses, habilitations | Themes, multilingual, Tufte-style marginalia via `marginalia`, environment-based front/main/appendix matter |
| [`min-book`](https://typst.app/universe/package/min-book/) | Pure-Typst books, no new syntax | Themes, localization via Fluent, appendices/annexes, errata, draft mode |
| [`tieffiction`](https://typst.app/universe/package/tieffiction/) | Fiction and novels | ISBN, edition, blurb, dedication, license, `publisher` in metadata |
| [`orange-book`](https://typst.app/universe/package/orange-book/) | Textbook styling | This is the template Quarto uses under the hood for `format: typst` books |

Scaffold any of them with `typst init @preview/<name>:<version>`.

**Choosing between them:** if your book is a textbook or thesis, `bookly`. If you want zero new syntax to learn, `min-book`. If it is a novel, `tieffiction` — it is the only one with an ISBN/edition/publisher block designed for retail metadata. If you are coming from Quarto, `orange-book` is what you already have.

> Version pinning matters: Typst Universe packages are versioned and templates move. Pin the version in the `#import` line so a template update cannot silently restyle a book mid-draft.

---

## 3. Print and POD with Typst

Typst has working print-POD templates in the wild, which is rare for a young engine:

- **6×9 in paperback, no bleed** — interior and cover templates exist and have been tested against KDP.
- **With bleed for full-bleed illustrations** — templates add the 0.125 in bleed box and generate a separate cover PDF sized to the *final* page count via Amazon's cover calculator.
- **Pipeline shape:** one content source, three outputs — digital PDF, print interior PDF (with bleed), print cover PDF (the wrap). The cover template is the fragile part because its geometry depends on page count, which changes on every edit late in the process.

```bash
typst compile main.typ                                        # digital
typst compile main_pod.typ                                    # interior + bleed
typst compile cover.typ                                       # wrap, sized from page count
```

> Practical warning: if your book is print-first, the cover wrap depends on the final page count, which means the last chapter you write can invalidate your cover. Build the cover from a template and regenerate it as part of the release, never by hand.

Geometry and upload requirements are in [[Publishing_Print_and_Distribution#2.2 Geometry|Print & Distribution §2]].

---

## 4. When Typst is the wrong choice

Typst is the best *default* for a beautiful PDF and a bad default for a book with heavy apparatus. Reach for something else when:

| Need | Why Typst is wrong | Go to |
|------|-------------------|-------|
| **EPUB as a first-class output** | Typst emits PDF/SVG/PNG; EPUB requires Pandoc or Quarto in the middle | [[Publishing_Pandoc\|Pandoc]] or [[Publishing_Quarto\|Quarto]] |
| **A generated back-of-book index** | No index/glossary apparatus comparable to LaTeX's | [[Publishing_LaTeX\|LaTeX]] |
| **A journal requiring LaTeX source** | Typst's output is not acceptable to most journals | [[Publishing_LaTeX\|LaTeX]] |
| **Deep math typesetting** | Good, not unmatched; LaTeX's math ecosystem is thirty years deeper | [[Publishing_LaTeX\|LaTeX]] |
| **Word output as an editable deliverable** | Typst's DOCX story is indirect | [[Publishing_Pandoc\|Pandoc]] |

The canonical resolution is not "pick one" but **Markdown → Pandoc → Typst**, which keeps a convertible manuscript and still gets Typst's page design. See [[Publishing#6. A complete worked pipeline|the hub's worked pipeline]].

---

## Resources

- [Typst Universe](https://typst.app/universe/) — browse all templates
- [Typst documentation](https://typst.app/docs/) · [CLI reference](https://typst.app/docs/reference/)
- [Typst Playground](https://typst.app/playground) — try a template without installing
- [Typst Forum](https://forum.typst.app/) — the KDP/POD template threads live here
- [[03_typst|Typst syntax guide]] · [[Typst_Engine_Cheatsheet|Typst API cheatsheet]] (for embedding the compiler)

---

*Last updated: 2026-10-16. Template versions move — pin them.*
