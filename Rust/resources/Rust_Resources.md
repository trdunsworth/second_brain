---
type: reference
topic: Rust resources — books, docs, parser tooling, Typst and Carve references, communities for the Carve → PDF challenge
date: 2026-10-06
status: active
tags:
  - rust
  - resources
  - links
  - parser
  - typst
  - carve
---

# Rust Resources

> Goal: the curated link shelf — where to go deeper once [[Rust_Tutorial]] and [[Parser_Building_Tutorial]] hit a wall. **◆ = long-lived classic (not re-clicked today)**; everything else was verified live on 2026-10-06 (crate versions, docs.rs pages, Carve/Typst sites).
> Related: [[Rust_Resources]] lives beside the notes that *use* it; recipes are in [[Rust_Tutorial]] / [[Parser_Building_Tutorial]], lookup in the cheatsheets.

## How to use this note

1. **§1–§2** when learning (book-shaped needs).
2. **§3** when a parser crate won't do what you think (official docs per crate).
3. **§4–§5** when the engine or the language misbehaves — these are the challenge's two poles.
4. **§6** when you're stuck and need humans.

---

## 1. Learning Rust (free, official)

| Resource | What it is |
|----------|------------|
| [The Rust Programming Language ("The Book")](https://doc.rust-lang.org/book/) ◆ | The spine — ch. 1–10 mirrors [[Rust_Tutorial]] §1–§9 |
| [Rust by Example](https://doc.rust-lang.org/rust-by-example/) ◆ | Learn by reading short annotated examples |
| [rustlings](https://github.com/rust-lang/rustlings) ◆ | Small exercises with `cargo`-graded tests |
| [The Rust Reference](https://doc.rust-lang.org/reference/) ◆ | Grammar/lifetimes details when The Book hand-waves |
| [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/) ◆ | How crates *should* be shaped (useful when you publish yours) |
| [std docs](https://doc.rust-lang.org/std/) | Especially `str`, `iter`, `result`, `option` |
| [Performance Book](https://nnethercote.github.io/perf-book/) ◆ | If your lexer shows up in profiles |

### Paid/printed (optional)

| Book | Why |
|------|-----|
| *Programming Rust* (Blandy & Orendorff) ◆ | Best reference-shaped book on the shelf |
| *Rust for Rustaceans* (Gjengset) ◆ | Post-Book: traits, lifetimes, unsafe done properly |
| *Zero To Production in Rust* (Palmieri) ◆ | Production discipline: errors, testing, CI — the *process* transfers even though it's web-focused |

## 2. Building parsers & interpreters

| Resource | What it is |
|----------|------------|
| [Crafting Interpreters](https://craftinginterpreters.com/) ◆ | Free book; scanner/parser/AST/error-recovery chapters map 1:1 onto [[Parser_Building_Tutorial]] — read ch. 4–8 even though the code is Java/Lua |
| [Parsing Techniques: A Practical Guide](https://dickgrune.com/Books/PTAPG_2nd_Edition/) ◆ | Free, deep theory for when a construct fights you |
| [awesome-rust](https://github.com/rust-unofficial/awesome-rust) ◆ | Catalog — "is there a crate for X?" |
| [LALRPOP book](https://lalrpop.github.io/lalrpop/) | If you overrule §2 of [[Parser_Building_Tutorial]] and go LR anyway |
| [pest book](https://pest.rs/book/) | PEG approach, grammar-file syntax |
| [miette](https://docs.rs/miette) / [ariadne](https://docs.rs/ariadne) | Fancy span-based error rendering |
| [insta](https://insta.rs/) | Snapshot testing (corpus layer, [[Parser_Building_Tutorial]] §6) |
| [thiserror](https://docs.rs/thiserror) / [anyhow](https://docs.rs/anyhow) | Error plumbing for lib vs binary |

### Parser crate docs (versions pinned in [[Parser_Cheatsheet]] §1)

| Crate | Docs |
|-------|------|
| hand-written | (that's the point — use [[Carve_Syntax_Reference]] as your spec) |
| nom 8.0.0 | [docs.rs/nom](https://docs.rs/nom) · [github.com/geal/nom](https://github.com/geal/nom) |
| chumsky 0.13.0 | [docs.rs/chumsky](https://docs.rs/chumsky) · [github.com/zesterer/chumsky](https://github.com/zesterer/chumsky) |
| pest 2.9.2 | [pest.rs](https://pest.rs/) · [docs.rs/pest](https://docs.rs/pest) |
| logos 0.16.1 | [docs.rs/logos](https://docs.rs/logos) · [github.com/maciejhirsz/logos](https://github.com/maciejhirsz/logos) |
| lalrpop 0.23.1 | [docs.rs/lalrpop](https://docs.rs/lalrpop) |

## 3. Rust tooling & community

| Resource | What it is |
|----------|------------|
| [This Week in Rust](https://this-week-in-rust.org/) | Release + crate radar; skim, don't chase |
| [users.rust-lang.org](https://users.rust-lang.org/) | The official forum — good for "why won't this lifetime work" |
| [Rust Zulip](https://rust-lang.zulipchat.com/) | Real-time, #users channel |
| [crates.io](https://crates.io/) | Versions — cross-check anything a blog claims |
| [docs.rs](https://docs.rs/) | Versioned docs; the only API source you should trust for 0.x crates |
| [clippy lints](https://doc.rust-lang.org/clippy/) | Read the lint list once; write cleaner code thereafter |

## 4. Typst (the layout engine — half the challenge)

| Resource | What it is |
|----------|------------|
| [Typst docs hub](https://typst.app/docs/) | Guide + reference for the *language* you emit into ([[Carve_to_Typst_Mapping]]) |
| [Typst syntax reference](https://typst.app/docs/reference/syntax/) | **Escaping rules live here** — read before writing the emitter's escaper |
| [Typst function reference](https://typst.app/docs/reference/) | `table`, `figure`, `link`, `footnote`, `highlight`, `quote`, `outline`… |
| [typst crate](https://docs.rs/typst) · [typst-pdf](https://docs.rs/typst-pdf) · [typst-layout](https://docs.rs/typst-layout) · [typst-kit](https://docs.rs/typst-kit) | The embedded-engine API (cheatsheet: [[Typst_Engine_Cheatsheet]]) |
| [github.com/typst/typst](https://github.com/typst/typst) | Source; `crates/typst-cli` shows how a "real" World is built |
| [Typst forum](https://forum.typst.app/) | Engine questions answered by the people who wrote it |
| [Typst packages](https://typst.app/universe) | Universe packages (only relevant if you allow packages in your World) |

In-vault: [[03_typst]] (language guide), [[quarto_notes]] (§1/§4: Typst as Quarto's PDF engine — the experience that seeded this challenge), `Typography/carve_mermaid_pdf_guide.pdf`.

## 5. Carve (the language — the other half)

| Resource | What it is |
|----------|------------|
| [Carve official site](https://markup-carve.github.io/carve/) | Home: get-started, examples, playground |
| [Formal grammar](https://markup-carve.github.io/carve/grammar) | **The specification** — final arbiter for parser disputes |
| [Cheatsheet (rendered)](https://markup-carve.github.io/carve/) | Every construct one page — distilled copy in [[Carve_Syntax_Reference]] |
| [Examples](https://markup-carve.github.io/carve/examples) | Construct-by-construct input/output — ready-made test corpus |
| [carve-lang on crates.io](https://crates.io/crates/carve-lang) | v0.1.7 (2026-09-29): Rust parser + HTML/MD/text/ANSI renderer, spec 0.1 |
| [carve-rs repo + `docs/`](https://github.com/markup-carve/carve-rs) | Reference implementation source; `docs/` has cli, reference, extensions, security, conformance guides |
| [Versioning contract](https://markup-carve.github.io/carve/versioning) | What a carve-lang release may change — matters for differential-test stability |

In-vault: [[07_carve]] (learning guide), [[01_markdown]], [[02_djot]] (the two ancestors — differences table in [[07_carve]]).

## 6. Picking a next read (suggested order)

1. **Now:** The Book ch. 1–10 (fast if you program elsewhere) → [[Parser_Building_Tutorial]] alongside Crafting Interpreters ch. 4–8.
2. **During M1–M4:** keep [[Rust_Cheatsheet]] + [[Carve_Syntax_Reference]] open; dip into [Typst reference](https://typst.app/docs/reference/) only for functions your emitter emits.
3. **When stuck on errors:** miette/ariadne docs + users.rust-lang.org.
4. **After it works:** *Rust for Rustaceans* + perf book if you care about batch speed.

## Status

- [x] Core links verified live 2026-10-06 (docs.rs crate pages, Typst/Carve sites, crates.io)
- [x] ◆-marked classics not re-clicked today — flag any 404 here when found
- [ ] Re-check after typst 0.16 / carve-lang 0.2 bumps
