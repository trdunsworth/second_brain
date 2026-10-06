---
type: tutorial
topic: Parser building tutorial — lexer, parser, AST, error recovery and testing for Carve, with approach decision and carve-lang differential testing
date: 2026-10-06
status: active
tags:
  - rust
  - parser
  - lexer
  - carve
  - testing
---

# Parser Building Tutorial

> Goal: the craft track — how to build *the* parser for [[Carve_Parser_Challenge]] in clean stages. Decision first (§2), then the pipeline (§3–§6), then verification against the reference implementation (§7). You write every line; this is the map.
> Related: [[Rust_Tutorial]] (language prerequisite), [[Parser_Cheatsheet]] (crate idiom lookup), [[Carve_Syntax_Reference]] (what we're parsing), [[Carve_to_Typst_Mapping]] (what comes after parsing)

## 1. What kind of thing is Carve?

Carve is a **line-oriented block structure + delimited inline spans**, with:

- **Blocks recognized by column-0 markers**: `#` headings, `-`/`1.`/`.` lists, `>` quotes, `:::` containers/fences, `|` tables, `---` breaks, fenced code.
- **Inline spans recognized inside paragraph text**: `/i/`, `*b*`, `~s~`, `=hl=`, `` `code` ``, `{^sup^}`, `{,sub,}`, links, images, escapes `\*`.
- **Deliberately un-Markdown-ish rules**: markers must start at column 0 (no 0–3 space indent tolerance); bare delimiters only at word boundaries; *empty pairs like `{^^}` are literal text* (see [[Carve_Syntax_Reference]] §7).

Consequences for you:

1. You need a **line scanner** (block level) *and* a **span parser** (inline level). Two passes, not one.
2. A pure context-free grammar over a token soup (LALR) is awkward — block context changes how lines read. **Hand-written recursive descent or a combinator parser over lines** fits best (§2).
3. Error *recovery* matters more than error *precision*: a document with one bad table shouldn't kill the whole PDF ([[Rust_Tutorial]] §8).

## 2. The approach decision (spend 10 minutes here, not 2 days)

| Approach | How it feels | Verdict for Carve |
|----------|--------------|-------------------|
| **Hand-written recursive descent** (line scanner + span parser) | Full control, best error messages, matches how the spec is written; you write every branch | ✅ **Recommended** — you said you want to write it yourself, and Carve's structure is friendly to it |
| **Parser combinators: nom 8** | Zero-copy, fast; combinator chains for nested spans get cryptic; error reporting is famously bare | ⚠️ Fine for the inline layer only |
| **Parser combinators: chumsky 0.13** | Ergonomic, built-in error recovery + labels; nightly-ish vibes, 1.0 still in alpha | ✅ Good alternative if you want recovery "for free" |
| **PEG grammar: pest 2.9** | Grammar in a `.pest` file, Rust gets a generated parser; backtracking semantics surprise people | ⚠️ Fast to start; block/inline split needs two grammars |
| **LR generator: lalrpop 0.23** | Great for expression languages; build.rs step; conflicts on contextual markup | ❌ Wrong tool for line-oriented markup |
| **Lexer generator: logos 0.16** | Not a parser — but *excellent* for the token layer if you go token-based | ⚠️ Optional companion to hand-written parser |

**Decision (record it, revisit only with evidence):** hand-written lexer + recursive-descent parser, standard library only for the parsing core; `miette` or `ariadne` for diagnostics; `insta` for snapshots. Rationale: spec 0.1 is small, control beats speed, and the reference implementation (`carve-lang`) gives you a free oracle (§7).

> [!note] You can still read the competition
> Study `carve-lang`'s source (github.com/markup-carve/carve-rs) for *grammar interpretation* — where it splits block vs inline, how it handles word boundaries — while writing your own code from scratch. Copying understanding, not code.

## 3. Stage 1 — the lexer (lines → tokens)

```rust
#[derive(Debug, PartialEq)]
enum LineKind {
    Blank,
    Heading { level: usize },
    ListItem { marker: ListMarker, rest: usize },   // byte offset of content
    Quote,
    FenceOpen { lang: Option<String> },
    FenceClose,
    ContainerOpen { colons: usize },                // ::: / :::
    TableCell,
    Rule,                                           // --- *** ___
    Paragraph,
}

fn scan_line(line: &str) -> LineKind { /* column-0 dispatch — the whole trick */ }
```

Key habits:

- **Dispatch on column 0 explicitly.** `line.strip_prefix('#')` with a count check beats a regex.
- Record **byte offsets** (`usize`) for every token — you'll need them for error spans and for slicing inline text later. Compute `line`/`column` on demand from offsets (don't store both).
- Keep the lexer dumb: no nesting decisions. Nesting (which container am I in?) is the parser's job.
- Lex **fenced code and `::: |` verbatim containers** in the lexer — their contents are not markup at all.

**Checkpoint:** `scan_line` has a unit test per `LineKind`, including the traps: ` # not a heading` (indented → Paragraph), `x --next` (flag-looking), `### seven` (still heading 3 + text).

## 4. Stage 2 — the parser (lines → AST)

Recursive descent over lines, with an explicit **container stack**:

```rust
struct Parser<'a> {
    lines: Vec<&'a str>,
    pos: usize,
    stack: Vec<Container>,      // list / quote / ::: nesting
    errors: Vec<ParseError>,    // collect, don't abort (recovery!)
}

enum Container { List { ordered: bool }, Quote, Fenced { colons: usize, kind: FenceKind } }
```

- **Block loop:** peek the next line, dispatch on `LineKind` + stack state, produce `Block`s.
- **Inline sub-parse:** when a paragraph/heading/quote body is collected, run the span parser (§5) over that slice only. Inline never sees table pipes or list markers.
- **Lazy continuation:** a paragraph continues until a blank line or a new block marker — implement as `while !at_block_boundary()`.
- **Recovery policy:** on an unexpected line, emit a `ParseError` *with span*, push an `Error` node (or skip the line), resynchronize at the next block boundary. The document must still render.

**Checkpoint:** parse a document with heading + two lists + a quote + code fence into a `Document` you can `Debug`-print, with zero `unwrap()` in the parser.

## 5. Stage 3 — inline spans (the delimiter tangle)

Inline parsing is where markup languages get hairy. Order of operations that keeps you sane:

1. **Escapes first**: `\*literal\*` — mark escaped chars so nothing else touches them.
2. **Longest/ordered delimiters**: `/*bold italic*/` before `*bold*`; `{^…^}` / `{,sub,}` as brace pairs (they're unambiguous — lucky).
3. **Leaf spans before nesting**: `` `code` `` and `` !`literal` `` contents are **verbatim** — no nesting inside.
4. **Nest everything else**: `/a *b* c/` is legal — parse recursively until the closer.
5. **Word-boundary rule**: bare delimiters (`/`, `*`, `~`, `=`, `_`) only open/close at word boundaries. `snake_case_word` must not become italic. (The spec's brace forms `H{,2,}O` exist precisely because of this.)

```rust
fn parse_spans(text: &str) -> Vec<Inline> {
    // 1. escape-mask  2. find delimiter pairs (outermost first)  3. recurse into bodies
}
```

**Checkpoint (the classic traps):** assert all of these parse as *plain text*, not spans: `a_b_c`, `5*6*7`, `**`, `{^^}`, `~~~`; and these *do* parse: `x *bold* y`, `mc{^2^}`, `H{,2,}O`.

## 6. Stage 4 — tests (build them as you go, not after)

Three layers, all in `tests/` + `#[cfg(test)]`:

| Layer | What it catches | Tool |
|-------|-----------------|------|
| **Unit** | one rule wrong (word boundary, escape) | plain `#[test]`, AST equality ([[Rust_Tutorial]] §9) |
| **Snapshot** | any regression anywhere in parse/emit | `insta` — snapshot AST `Debug` and emitted Typst |
| **Golden/corpus** | whole documents end-to-end | `tests/corpus/*.carve` + expected `.typ` files |

```powershell
cargo add --dev insta
cargo insta test --review     # accept/inspect new snapshots interactively
```

Corpus seeds (in priority order): every construct in [[Carve_Syntax_Reference]]; the official examples (markup-carve.github.io/carve/examples); **your own vault files** — this vault's `Typography/07_carve.md` contains Carve snippets worth testing against.

## 7. Stage 5 — differential testing against `carve-lang` (your unfair advantage)

The reference implementation ships as a library *and* a CLI ([[Rust_Installation]] §3). Its `carve::parse(source)` → `try_to_json(&document)` gives you a **canonical AST JSON** to diff yours against.

Harness sketch:

```powershell
# 1. What the oracle says:
carve --output-format json input.carve > oracle.json      # verify exact flag: carve --help

# 2. What your parser says (add a hidden subcommand):
carve2typst ast input.carve --json > mine.json

# 3. Diff structurally (jq, or a small Rust test that deserializes both and compares)
```

Rules of engagement:

- **Normalize before diffing**: key order, and note that Carve's annotation offsets count **Unicode codepoints** (carve-lang README) — so do yours, or strip offsets in comparison mode.
- **Classify mismatches**: (a) your bug → fix; (b) spec ambiguity → check the [formal grammar](https://markup-carve.github.io/carve/grammar); (c) intentional divergence → record in the challenge note's known-differences table.
- Run the harness over the **examples corpus** on every change — it's your regression suite.

**Checkpoint:** `cargo test differential` loops over 10 corpus files and asserts zero unclassified mismatches.

## 8. Stage 6 — hand-off to the emitter

Once `Document` is stable, the emitter ([[Carve_to_Typst_Mapping]]) becomes a pure function `&Document -> String`. Keep them decoupled: **never** let Typst concerns (escaping!) leak into the parser, and never let Carve quirks leak into the engine ([[Typst_PDF_Engine]]). That seam is what makes the whole thing testable.

## Status

- [ ] Approach recorded (§2) — hand-written (default) or reasoned alternative
- [ ] `scan_line` unit tests green, traps included (§3)
- [ ] Block parser + container stack, no `unwrap` (§4)
- [ ] Inline trap tests green (§5)
- [ ] `insta` snapshots for AST + emitted Typst (§6)
- [ ] Differential harness vs `carve-lang` on ≥ 10 corpus files (§7)
