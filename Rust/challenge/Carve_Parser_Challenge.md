---
type: project
topic: Carve parser challenge — brief, architecture, crate manifest, milestones M0–M7 and definition of done for carve → Typst → vector PDF in Rust
date: 2026-10-06
status: active
tags:
  - rust
  - parser
  - carve
  - typst
  - pdf
  - project
  - challenge
---

# Carve Parser Challenge

> Goal: the mission brief. One paragraph you can recite, one pipeline you can draw, one checklist that says "done". You write the parser yourself — these notes exist so the *terrain* (language spec, engine API, escaping rules) never blocks the *walk*.
> Related: [[Carve_Syntax_Reference]] (what to parse) · [[Carve_to_Typst_Mapping]] (what to emit) · [[Typst_PDF_Engine]] (how the engine runs) · [[Parser_Building_Tutorial]] (how to build it) · [[Rust_Installation]] (before M0)

## 1. The brief

**Input:** a file written in Carve (post-Markdown markup, spec 0.1 — [[07_carve]]).
**Output:** a **vector PDF** — text as embedded font glyphs, rules and shapes as path operators, nothing rasterized — laid out by the **Typst** typesetting engine, driven **from Rust**.
**Constraint:** you write the parser (lexer + AST builder) yourself. The existing [`carve-lang`](https://crates.io/crates/carve-lang) crate is an *oracle for testing*, not a dependency of the pipeline.

```text
doc.carve ──► [your lexer] ──► [your parser] ──► your AST
                                                       │
                                              [your emitter]  (AST → Typst source, with escaping)
                                                       ▼
                                    Typst source ──► typst::compile ──► PagedDocument
                                                       ▼
                                        typst_pdf::pdf ──► out.pdf (vector bytes)
```

**Why this shape (not "just render HTML → PDF"):** Typst gives real typography — line breaking, hyphenation, page geometry, headings/outline, footnotes, figures with captions — at compile speeds measured in milliseconds, without a browser in the loop. Your parser does *language understanding*; Typst does *layout*. Clean seam, testable halves.

## 2. The seams (four artifacts, four tests)

| # | Artifact | In → Out | Test oracle |
|---|----------|----------|-------------|
| 1 | **Lexer** | `&str` → `Vec<Token>`/line kinds | unit tests + edge traps ([[Parser_Building_Tutorial]] §3) |
| 2 | **Parser** | lines → `Document` (AST) | `insta` snapshots + **differential vs `carve-lang`** (§7) |
| 3 | **Emitter** | `&Document` → Typst `String` | snapshot + escaping unit tests ([[Carve_to_Typst_Mapping]]) |
| 4 | **Engine** | Typst `String` → PDF bytes | hello-world PDF (M0) + corpus render (M6) |

Rule: **dependencies point right only.** Engine never knows Carve; parser never knows Typst ([[Parser_Building_Tutorial]] §8).

## 3. Scope: what's in and what's out

**In (must work for "done"):**

- Frontmatter (`---` block → document metadata)
- Headings 1–6, paragraphs, thematic breaks
- All core inline spans: `/italic/`, `*bold*`, `/*both*/`, `_underline_`, `~strike~`, `=highlight=`, `` `code` ``, `` !`literal` ``, `{^sup^}`, `{,sub,}`
- Links (inline, reference, wiki-style, autolink), images, footnotes (both forms), escapes
- Lists: unordered, ordered, task, auto-numbered, nested; blockquotes with `+` continuation
- Fenced code blocks (with language → Typst raw), `:::` containers/admonitions (`note/tip/warning/…`)
- Pipe tables incl. header cells `|=`, alignment markers, colspan/rowspan merges
- Captions (`^` lines) on images/quotes/tables/code → `#figure(...)`
- Smart typography resolved to Unicode (– — … → ©)
- Column-0 rule + word-boundary rule enforced exactly ([[Carve_Syntax_Reference]] §7)

**Out (v1 — record, don't half-build):**

| Deferred | First cut |
|----------|-----------|
| Diagrams (`mermaid`, `d2`, `chart`…) | render as monospace code block + TODO note |
| Math `$…$` / `$$…$$` | pass through verbatim to Typst `$…$`; verify cases later |
| Extensions (Tier 2/3: `:youtube[…]`, citations) | parse as `Extension` node, emit as raw/literal |
| File inclusion, packages in the World | `FileError::NotFound` with a clear diagnostic |
| HTML/ANSI/Markdown output formats | Typst/PDF only (the other formats are carve-lang's job) |
| `--safe`-style profiles, sandboxing | trusted input assumed; note in README |

## 4. Project shape & manifest

Start **one crate**; split only when compile times hurt (typst already dominates build time anyway).

```text
carve2typst/
├── Cargo.toml
├── src/
│   ├── main.rs      # clap CLI: carve2typst in.carve [-o out.pdf] [--emit-typst] [--dump-ast]
│   ├── lib.rs
│   ├── ast.rs       # Document, Block, Inline, spans
│   ├── lexer.rs
│   ├── parser.rs
│   ├── emit.rs      # AST → Typst source (escaper lives here)
│   └── engine.rs    # World impl → compile → pdf bytes
├── tests/
│   ├── corpus/      # *.carve + expected *.typ (golden)
│   └── differential.rs   # vs carve-lang oracle
└── out/             # generated .typ/.pdf (gitignored)
```

```toml
[dependencies]
clap = { version = "4", features = ["derive"] }
thiserror = "2"
typst = "0.15"
typst-layout = "0.15"
typst-pdf = "0.15"
typst-kit = { version = "0.15", features = ["embedded-fonts", "scan-fonts", "datetime"] }

[dev-dependencies]
insta = "1"
carve-lang = "0.1"     # oracle only — never used by the pipeline
```

Versions verified 2026-10-06; MSRV 1.92 ([[Rust_Installation]] §1).

**CLI flags worth having from day one:** `--emit-typst` (stop after the emitter, print/save `.typ` — your main debugging window), `--dump-ast` (JSON/debug AST for differential diffs), `--keep-typst` (save the generated source next to the PDF).

## 5. Milestones (each ends with something you can run)

| Milestone | Deliverable | Smoke test |
|-----------|-------------|------------|
| **M0 — engine hello** | Hardcoded Typst string → `out.pdf` via [[Typst_PDF_Engine]] | open the PDF; text renders (not tofu boxes) |
| **M1 — lexer + AST, subset** | headings/paragraphs/emphasis parse | `--dump-ast` shows the tree |
| **M2 — emitter subset** | AST → Typst; pipeline end-to-end on subset | `in.carve` subset → openable PDF |
| **M3 — full inline** | all spans, links, images, escapes, super/sub | inline trap tests + corpus green |
| **M4 — block structure** | lists, quotes, code, `:::`, tables, captions/figures | full official examples parse |
| **M5 — diagnostics** | span errors, recovery, miette/ariadne rendering | bad input prints caret report; good parts still render |
| **M6 — verification** | differential harness + golden corpus + render test | `cargo test` green; zero unclassified mismatches |
| **M7 — polish** | CLI UX, batch mode, PDF/A option, outline check, README | `carve2typst *.carve` batch; PDF has bookmarks |

> [!tip] Do M0 *first*, before writing any parser
> The engine is the scariest unknown (World impl, fonts, MSRV). 60 lines of hardcoded Typst → PDF de-risks everything downstream, and every later milestone inherits a working endpoint.

## 6. Definition of done

- [ ] `cargo run -- examples/demo.carve -o demo.pdf` produces a PDF that **opens, selects text, and zooms crisply** (vector: zoom 800% shows no rasterization)
- [ ] All **In-scope §3** constructs render sensibly (spot-check against [official examples](https://markup-carve.github.io/carve/examples))
- [ ] `cargo test` green: unit + `insta` snapshots + golden corpus + differential harness
- [ ] Zero `unwrap()`/`panic!` in `src/` outside `#[cfg(test)]` (a malformed file yields a diagnostic, not a crash)
- [ ] Generated `.typ` debuggable: `--emit-typst` output compiles standalone under `typst watch`
- [ ] PDF has heading bookmarks/outline (Typst generates them from headings — verify in a viewer)
- [ ] Known-differences table filled (§7) — honest divergences documented

## 7. Differential testing (the standing desk item)

```powershell
carve --output-format json input.carve > oracle.json    # confirm flags: carve --help
carve2typst input.carve --dump-ast > mine.json
# structural diff — normalize key order; offsets count Unicode codepoints
```

| Mismatch class | Action |
|----------------|--------|
| Your bug | fix parser; add regression test |
| Spec ambiguity | [formal grammar](https://markup-carve.github.io/carve/grammar) decides; note it |
| Intentional divergence | add row to **known differences** table below |

**Known differences (maintain this table):**

| Construct | carve-lang behavior | yours | why |
|-----------|--------------------|-------|-----|
| (start recording here) | | | |

## 8. Risks & how each is answered

| Risk | Answer |
|------|--------|
| Engine API churn (typst moves fast) | [[Typst_Engine_Cheatsheet]] verified per version; pin exact `0.15.x`; re-verify on bump |
| Escaping bugs (emitted Typst won't compile) | Typst diagnostics *point into your generated source* — treat as emitter bugs ([[Rust_Tutorial]] §8); golden `.typ` files keep diffs small |
| Fonts silently missing | M0 smoke test = eyeball the PDF; [[Typst_PDF_Engine]] §3 |
| Word-boundary / column-0 rules wrong | trap tests from [[Parser_Building_Tutorial]] §5 + oracle diffs |
| Tables are a swamp | tables last inside M4; ship a "renders as monospace fallback" escape hatch |
| Scope creep (diagrams/math/extensions) | §3 out-list is binding until "done" is checked |
| PDF byte-comparison flaky in tests | pin `Timestamp` in `PdfOptions`, or assert page count + extracted text instead |

## 9. Day-by-day entry point

1. [[Rust_Installation]] smoke tests (§4).
2. **M0** today: copy the skeleton from [[Typst_PDF_Engine]] §2, get `hello.pdf`.
3. Read [[Carve_Syntax_Reference]] with a highlighter — that's your contract.
4. Then [[Parser_Building_Tutorial]] §3 onward, milestone by milestone.

## Status

- [ ] M0 engine hello-PDF
- [ ] M1 lexer + AST subset
- [ ] M2 emitter subset (end-to-end)
- [ ] M3 full inline set
- [ ] M4 block structure incl. tables/captions
- [ ] M5 diagnostics + recovery
- [ ] M6 differential + golden tests green
- [ ] M7 polish + batch + bookmarks — **definition of done §6 fully checked**
