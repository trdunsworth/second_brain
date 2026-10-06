---
type: tutorial
topic: Rust tutorial — ownership, enums, Result, iterators, traits and lifetimes taught through the Carve parser challenge
date: 2026-10-06
status: active
tags:
  - rust
  - tutorial
  - parser
  - learning-path
---

# Rust Tutorial

> Goal: enough Rust to write a real parser and an emitter — **every chapter is framed as a task from [[Carve_Parser_Challenge]]**, not as language trivia. Skim §1–§3 fast if you've shipped code before; slow down at §6 (lifetimes) and §8 (error design).
> Related: [[Rust_Installation]] (toolchain first), [[Rust_Cheatsheet]] (syntax lookup), [[Parser_Building_Tutorial]] (the craft this enables), [[Rust_Resources]] (The Book etc.)

**How to use:** each section = concept → why the parser needs it → a snippet → a checkpoint exercise. Do the exercises; Rust is learned by fighting the borrow checker in your own code, not by reading about it.

---

## 1. Ownership — the one thing to internalize

Every value has one owner; when the owner goes out of scope, the value is dropped. References (`&T`, `&mut T`) borrow — many immutable borrows **or** one mutable borrow, never both at once.

Why a parser cares: your lexer will hand out slices of the input (`&str`), your AST will own its strings (`String` when you must copy). Getting this split right is 80% of parser design in Rust.

```rust
fn first_word(s: &str) -> &str {          // borrows; caller still owns s
    let end = s.find(' ').unwrap_or(s.len());
    &s[..end]
}

fn main() {
    let source = std::fs::read_to_string("doc.carve").unwrap(); // source owns the text
    let heading = first_word(&source);                           // temporary borrow
    println!("{heading}");
}   // source dropped here — heading must be gone by then, or it wouldn't compile
```

**Checkpoint:** write `fn word_count(s: &str) -> usize` that borrows without copying, then try to return a `&str` slice *and* a `usize` from the same function — notice the signature needs both lifetimes/values.

## 2. Enums + pattern matching = your AST

An AST is a sum type. In Rust that's an `enum`, and `match` destructures it exhaustively (the compiler *forces* you to handle every node — this is the feature you came for).

```rust
enum Inline {
    Text(String),
    Bold(Vec<Inline>),
    Italic(Vec<Inline>),
    Code(String),
    Link { text: Vec<Inline>, href: String },
    Super(Vec<Inline>),          // Carve {^super^}
    Sub(Vec<Inline>),            // Carve {,sub,}
    Highlight(Vec<Inline>),      // Carve =highlight=
    Strike(Vec<Inline>),         // Carve ~strike~
}

enum Block {
    Heading { level: u8, content: Vec<Inline> },
    Paragraph(Vec<Inline>),
    CodeBlock { lang: Option<String>, body: String },
    List { ordered: bool, items: Vec<Vec<Block>> },
    Table { rows: Vec<Vec<Cell>> },
    BlockQuote(Vec<Block>),
}

fn render_inline(node: &Inline) -> String {
    match node {
        Inline::Text(t) => t.clone(),
        Inline::Bold(inner) => format!("*{}*", join(inner)),
        Inline::Super(inner) => format!("{{^{}^}}", join(inner)),
        Inline::Link { text, href } => format!("[{}]({})", join(text), href),
        // forget a variant? compiler error: "match on incomplete enum"
    }
}

fn join(nodes: &[Inline]) -> String {
    nodes.iter().map(render_inline).collect()
}
```

Patterns you will live in: `if let Some(x) = opt`, `while let Ok(x) = iter.next()`, destructuring `let Block::Heading { level, content } = block;`, and `..` to ignore the rest.

**Checkpoint:** add `Inline::Footnote(String)` and a `Block::ThematicBreak` to the enums above; watch `cargo build` list every `match` that must be updated.

## 3. Result and `?` — errors are data

Parsers fail constantly (unexpected token, bad table row). Rust's rule: **never panic in a library; return `Result`**. The `?` operator early-returns the `Err` and lets you attach context.

```rust
#[derive(Debug)]
struct ParseError {
    line: usize,
    column: usize,
    expected: String,
    found: String,
}

type ParseResult<T> = Result<T, ParseError>;

fn parse_heading(input: &str) -> ParseResult<(u8, &str, usize)> {
    let hashes = input.chars().take_while(|&c| c == '#').count();
    if hashes == 0 || hashes > 6 {
        return Err(ParseError {
            line: 1, column: 1,
            expected: "heading level 1–6".into(),
            found: input.chars().take(10).collect(),
        });
    }
    Ok((hashes as u8, input[hashes..].trim(), hashes))
}
```

Two crates make errors *pretty*: `thiserror` (define error enums declaratively) and `miette`/`ariadne` (render with source spans and carets). Comparison in [[Parser_Cheatsheet]] §4.

**Checkpoint:** convert your §1 exercise into `fn parse(input: &str) -> ParseResult<Document>` and make `main` print the error with line/column instead of unwrapping.

## 4. Iterators — process token streams without indexing bugs

`map`, `filter`, `collect`, `peekable`, `take_while`, `fold`. Parsers are iterator algebra; hand-rolled index juggling (`i += 1; if buf[i] == …`) is where off-by-one bugs breed.

```rust
// Split a source into logical lines, dropping comments (`%% …` in Carve)
let lines: Vec<&str> = source
    .lines()
    .map(str::trim_end)
    .filter(|l| !l.trim_start().starts_with("%%"))
    .collect();

// A token stream you can peek at
let mut toks = tokens.iter().peekable();
while let Some(tok) = toks.next() {
    if matches!(toks.peek(), Some(Token::Pipe)) { /* table cell boundary */ }
}
```

`collect::<Result<Vec<_>, _>>()` turns an iterator of `Result`s into `Result<Vec>` — the single most useful trick when lexing.

**Checkpoint:** lex `"a *b* c"` into `Vec<Token>` using only iterators (no `while` with manual index).

## 5. Generics + traits — write it once, use it everywhere

Traits are Rust's interfaces; generics are parameterized over them.

```rust
trait Emit {
    fn emit(&self, out: &mut String);
}

impl Emit for Inline {
    fn emit(&self, out: &mut String) { /* … */ }
}

fn render_all<T: Emit>(nodes: &[T]) -> String {
    let mut out = String::new();
    for n in nodes { n.emit(&mut out); }
    out
}
```

You will meet trait objects (`&dyn World` in [[Typst_PDF_Engine]] — "any environment that can feed the compiler") and trait bounds on functions (`T: Output` in `typst::compile`). `impl Trait` in argument/return position keeps signatures readable.

**Checkpoint:** give your AST an `Emit` impl that writes **Typst** markup instead of Carve (this is literally the emitter from [[Carve_to_Typst_Mapping]]).

## 6. Lifetimes — for slices that outlive the function

Only needed when a reference's lifetime is *not* obvious to the compiler. Input slicing is the classic case.

```rust
// The returned &str points into `input`, so both share lifetime 'a
fn take_until<'a>(input: &'a str, delim: char) -> (&'a str, &'a str) {
    match input.find(delim) {
        Some(i) => (&input[..i], &input[i + delim.len_utf8()..]),
        None => (input, ""),
    }
}
```

Rules of thumb: elision usually "just works" for `&self` methods; annotate when returning multiple references or when a struct holds references (`struct Span<'a> { text: &'a str }`). If lifetimes get gnarly, own the data (`String`) and pay the copy — premature zero-copy is a trap.

**Checkpoint:** write `fn strip_bold(s: &str) -> Option<(&str, &str, &str)>` returning (before, inside, after) for `*bold*` — three borrows of one input.

## 7. Modules, crates, cargo layout

```text
carve2typst/
├── Cargo.toml
└── src/
    ├── main.rs        # CLI (clap) — thin
    ├── lib.rs         # pub mod … — everything testable lives here
    ├── lexer.rs
    ├── ast.rs
    ├── parser.rs
    ├── emit.rs        # AST → Typst source
    └── engine.rs      # Typst World → PDF bytes
```

- `mod lexer;` + `pub mod` controls visibility; `use crate::ast::Block;` imports.
- One crate is right for M0–M5; split into a workspace only when compile times bite (see [[Carve_Parser_Challenge]] §4).
- Tests go in `src/*.rs` under `#[cfg(test)] mod tests` and in `tests/` for integration/golden tests.

**Checkpoint:** `cargo new carve2typst --lib`, create the file tree above with stub `pub fn` in each, and get `cargo test` to run zero tests cleanly.

## 8. Error design for a parser (the chapter that matters)

Three layers, keep them separate:

1. **Lexer/parser errors** — `{ line, column, expected, found }` on *your* types ([[Parser_Building_Tutorial]] §5).
2. **Emitter errors** — almost never happen (any AST can be printed); if it does, it's a bug → `unreachable!`-style with a real message.
3. **Engine errors** — Typst's `SourceResult`/`SourceDiagnostic` on *its* generated source; a failure here means **your emitter emitted invalid Typst** — surface the Typst snippet + span, because that's the bug you need.

```rust
pub enum AppError {
    Io(std::io::Error),
    Parse(ParseError),               // layer 1
    Typst(Vec<typst::diag::SourceDiagnostic>),  // layer 3
}
```

`thiserror` gives you `#[from]` conversions so `?` chains all three layers into one `Result`.

**Checkpoint:** wire `fn run(path: &str) -> Result<(), AppError>` that reads a file, parses it (return `ParseError`), emits Typst, and compiles — with `From` impls doing the conversion.

## 9. Testing reflexes

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_bold() {
        let doc = parse("a *b* c").unwrap();
        assert_eq!(doc, expected_ast());   // build AST with helpers, not strings
    }

    #[test]
    fn rejects_unclosed_bold() {
        assert!(parse("a *b").is_err());
    }
}
```

- Compare **ASTs**, not source text (source formatting is an emitter concern).
- Snapshot tests with `insta`: `cargo insta` reviews pretty diffs of ASTs and emitted Typst ([[Parser_Building_Tutorial]] §6).
- Golden files: corpus of `.carve` inputs + expected outputs in `tests/corpus/`.

**Checkpoint:** one passing test, one failing-by-design test, and `cargo test` output you can read.

## 10. Where to go next

| Need | Go to |
|------|-------|
| Full language reference | [[Rust_Resources]] §1 — The Book, ch. 1–10 maps onto §1–§9 here |
| Parser strategy decision | [[Parser_Building_Tutorial]] §2, [[Parser_Cheatsheet]] §1 |
| The actual mission plan | [[Carve_Parser_Challenge]] |
| Syntax lookup while coding | [[Rust_Cheatsheet]] |

## Status

- [ ] §1–§3 exercises done (ownership, enum AST, Result)
- [ ] §4–§6 exercises done (iterators, traits, lifetimes)
- [ ] §7 scaffold exists: `cargo new carve2typst --lib` with module stubs
- [ ] §8 error enum compiles across all three layers
- [ ] §9 `cargo test` green with ≥ 2 tests
