---
type: index
topic: Rust folder index — learning Rust and building the Carve → Typst → vector PDF parser challenge
date: 2026-10-06
status: active
tags:
  - moc
  - rust
  - parser
  - typst
  - carve
---

# Rust — Index

> Goal: the map for this folder. **Start at [[Rust_Installation]]** to get `cargo` running, then work [[Rust_Tutorial]] while the challenge track ([[Carve_Parser_Challenge]]) pulls you forward. Everything else is lookup material.
> The challenge: **a parser in Rust that reads a Carve markup file and emits a vector PDF, laid out by Typst, driven from Rust.** You write the parser yourself; these notes supply the terrain.

## Start here

| You want… | Go to |
|-----------|-------|
| `cargo` + toolchain on Windows/Linux/Mac | [[Rust_Installation]] ← **the gate** |
| Learn Rust through the lens of this challenge | [[Rust_Tutorial]] ← **the spine** |
| The challenge brief: pipeline, milestones, definition of done | [[Carve_Parser_Challenge]] ← **the mission** |
| What Carve syntax you actually have to parse | [[Carve_Syntax_Reference]] |
| How each Carve construct becomes a Typst "layout call" | [[Carve_to_Typst_Mapping]] |
| Embed the Typst engine in Rust and get PDF bytes out | [[Typst_PDF_Engine]] |
| Decide hand-written vs nom/chumsky/pest/lalrpop | [[Parser_Building_Tutorial]], [[Parser_Cheatsheet]] |
| Keys and syntax at a glance | [[Rust_Cheatsheet]] |
| typst/typst-pdf/typst-kit API at a glance | [[Typst_Engine_Cheatsheet]] |
| Curated links: Book, crate docs, Carve, Typst | [[Rust_Resources]] |

## The notes

### Setup
| Note | What it is |
|------|------------|
| [[Rust_Installation]] | rustup, stable ≥ 1.92 (typst 0.15 MSRV), cargo workflow, clippy/rustfmt, `carve` CLI and `typst` CLI installs |

### Learn
| Note | What it is |
|------|------------|
| [[Rust_Tutorial]] | Ownership → enums/match → Result → iterators → traits → lifetimes, every chapter tied to a parser task |
| [[Parser_Building_Tutorial]] | Lexer → parser → AST → error recovery → testing; approach decision + differential testing against `carve-lang` |

### Cheatsheets
| Note | What it is |
|------|------------|
| [[Rust_Cheatsheet]] | Rust syntax, cargo commands, testing, error crates — one page |
| [[Parser_Cheatsheet]] | nom 8 / chumsky 0.13 / pest 2.9 / logos 0.16 / lalrpop 0.23 decision table + idiom snippets + diagnostics crates |
| [[Typst_Engine_Cheatsheet]] | `typst::World` trait, `typst::compile`, `typst_pdf::pdf`, FileId/RootedPath, typst-kit features — verified against 0.15.1 |

### The challenge
| Note | What it is |
|------|------------|
| [[Carve_Parser_Challenge]] | Brief, architecture, crate manifest, milestones M0–M7, testing strategy, risks |
| [[Carve_Syntax_Reference]] | Carve 0.1 grammar distilled: inline, blocks, tables, attributes, frontmatter, edge cases |
| [[Carve_to_Typst_Mapping]] | Element-by-element Carve → Typst emit table, escaping rules, two emitter strategies |
| [[Typst_PDF_Engine]] | Full `World` impl sketch, fonts, compile → PDF bytes, diagnostics, performance |

### Resources
| Note | What it is |
|------|------------|
| [[Rust_Resources]] | The Book, Rust by Example, parser books/lists, Typst docs, Carve docs, communities |

## How they fit together

```
Rust_Installation        (cargo up, MSRV 1.92, carve + typst CLIs)
  └─ Rust_Tutorial       ──────────────── the main path
       ├─ Rust_Cheatsheet              (keep open while coding)
       └─ Parser_Building_Tutorial     (the craft: lex/parse/AST/recover)
            ├─ Parser_Cheatsheet       (pick the engine: hand-rolled vs crates)
            └─ Carve_Parser_Challenge  ── the mission
                 ├─ Carve_Syntax_Reference   (what to parse — spec 0.1)
                 ├─ Carve_to_Typst_Mapping   (AST → Typst layout calls)
                 ├─ Typst_PDF_Engine         (Typst World → PDF bytes)
                 └─ Typst_Engine_Cheatsheet  (API lookup while writing it)
  Rust_Resources         (docs/books/communities to go deeper)
```

**Mental model of the pipeline** (full version in [[Carve_Parser_Challenge]]):

```
carve file ──► lexer ──► parser ──► your AST ──► emitter ──► Typst source
                                                                  │
                                              typst::compile + typst_pdf::pdf
                                                                  ▼
                                                          vector .pdf bytes
```

## Vault cross-links

- [[07_carve]] — Carve learning guide (syntax overview, toolchain pointers)
- [[03_typst]] — Typst learning guide (language basics)
- [[01_markdown]] / [[02_djot]] — the two languages Carve sits between
- [[quarto_notes]] — Typst-as-PDF-engine experience from the Quarto side (§1, §4)
- `Typography/carve_mermaid_pdf_guide.pdf` — vault PDF on Carve → diagram → PDF workflows

## Status

- [x] Folder created: 12 notes (11 content + this index), frontmatter verified 2026-10-06
- [x] Crate versions verified live against crates.io / docs.rs on 2026-10-06 (typst 0.15.1, carve-lang 0.1.7, nom 8.0.0, chumsky 0.13.0, pest 2.9.2, logos 0.16.1, lalrpop 0.23.1)
- [ ] M0 hello-PDF smoke test — **manual**: [[Carve_Parser_Challenge]] §5
- [ ] `carve` CLI differential harness wired up — **manual**: [[Parser_Building_Tutorial]] §7
- [ ] First real `.carve` → `.pdf` end-to-end — **manual**: [[Carve_Parser_Challenge]] §6
