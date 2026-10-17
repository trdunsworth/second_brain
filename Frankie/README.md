---
type: moc
status: active
topic: "Frankie — the procedural language, its book, and the .fk tree-sitter grammar. Three notes and the review copy of the book."
created: 2026-10-16
aliases:
  - Frankie Folder
  - Frankie Index
tags:
  - frankie
  - programming-language
  - index
---

# Frankie — folder index

> Created 2026-10-16. Hosts notes on **Frankie**, a procedural programming language by Blag
> (Alvaro Tejada Galindo) — Ruby syntax, Python semantics, R statistics, Fortran numerics,
> Python 3.10+ runtime, zero external dependencies, GPL-3.0.

---

## Contents

| Note | What it covers |
|---|---|
| [[Frankie Language]] | The language itself — syntax, the four donors, `frankiec`, stitches, stdlib, and an assessment |
| [[Book Review]] | My technical review of *The Frankie Programming Language* for the author. **Active — scaffold in place, findings to come** |
| [[Tree-sitter Grammar]] | `trdunsworth/frankie_tree_sitter` — a complete `.fk` parser: highlights, indents, locals, textobjects, WASM, VS Code extension |
| `The Frankie Programming Language.pdf` | The 205-page review copy, watermarked *"To Tony Dunsworth"*. Copied from `~/Downloads/` 2026-10-16 |

---

## Why these three belong together

The grammar is not a separate interest — it is **instrumentation for the review**. Every code
sample in the book is a candidate to check, and `tree-sitter parse` gives a pass/fail on
validity that needs no installation and no network. See [[Book Review]] §"Tools available
while reviewing".

All three are for **v1.22**, which is also the language freeze — the version Blag pinned so
the book would describe a stable language. Anything that changes the answer lives outside this
folder.

---

## Open items

- [ ] Fill in the [[Book Review]] — findings are yours to write
- [ ] Fill in page numbers past p. 18 in the review note's structure table
- [ ] Flag the **`YOUR NAME HERE!`** placeholder on p. 10 of the book
- [ ] Consider batch-verifying every fenced `.fk` block in the book against the grammar
- [ ] Add a note on Frankie-vs-anything comparison once there is enough hands-on time

---

## Outside this folder

| Thing | Where |
|---|---|
| Frankie source | 🔗 https://github.com/atejada/Frankie |
| Homepage | 🔗 https://atejada.github.io/frankielanguage/ |
| Documentation | 🔗 https://atejada.github.io/frankielanguage/site/index.html |
| *The Book of Frankie* (Medium) | 🔗 https://medium.com/@atejada/the-book-of-frankie-d2d1485899dd |
| Tree-sitter grammar | 🔗 https://github.com/trdunsworth/frankie_tree_sitter |
| Browser playground | 🔗 https://atejada.github.io/frankielanguage/ — real compiler via WASM, no install |

> Per the vault's linking rule: a wikilink targets a note **inside** this vault. These
> external links are plain markdown for that reason.