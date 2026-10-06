---
type: cheatsheet
topic: Parser crates cheatsheet — nom 8, chumsky 0.13, pest 2.9, logos 0.16, lalrpop 0.23 comparison plus diagnostics and snapshot tooling
date: 2026-10-06
status: active
tags:
  - rust
  - parser
  - cheatsheet
  - reference
  - carve
---

# Parser Cheatsheet

> Goal: pick an engine and look up its idioms without re-reading five READMEs. Versions verified on crates.io 2026-10-06. Decision table first; the snippets are shapes — **confirm exact signatures in each crate's docs** (0.x APIs move).
> Related: [[Parser_Building_Tutorial]] §2 (the decision), [[Rust_Cheatsheet]] (language basics), [[Carve_Syntax_Reference]] (what we parse)

## 1. Decision table

| Crate | Version | Kind | Strengths | Weaknesses | Fit for Carve |
|-------|---------|------|-----------|------------|---------------|
| **hand-written** | std only | recursive descent | total control, best diagnostics, spec-shaped, zero deps | you write every branch | ✅ **default choice** |
| **nom** | 8.0.0 | combinators, zero-copy | fastest runtime, huge ecosystem, byte-level | error messages are an infamously late add-on; combinator soup on nesting | ⚠️ inline layer only |
| **chumsky** | 0.13.0 (stable; 1.0.0-alpha.8 exists) | combinators + error recovery | designed for **recovery + labelled errors**, ergonomic | younger ecosystem; API has churned between 0.9 → 0.13 | ✅ best "batteries included" alt |
| **pest** | 2.9.2 | PEG, grammar file | grammar readable by non-Rust folk, generated parser | PEG backtracking surprises; block/inline needs two grammars | ⚠️ good starting point |
| **lalrpop** | 0.23.1 | LR(1)/LALR generator | great for expression languages, DRY grammar macros | grammar conflicts on contextual markup; build.rs step | ❌ wrong shape |
| **logos** | 0.16.1 | **lexer** (derive) | absurdly fast tokenizing, derive macro, integrates with any parser | not a parser — pairs with one of the above | ⚠️ optional token layer |

**Default stack for [[Carve_Parser_Challenge]]:** hand-written line lexer + recursive-descent parser (+ `miette`/`ariadne` diagnostics + `insta` snapshots). Revisit only if §7 of [[Parser_Building_Tutorial]] shows you drowning in recovery code → then chumsky.

## 2. hand-written (target shape)

```rust
struct Parser<'a> { lines: Vec<&'a str>, pos: usize, errors: Vec<ParseError> }

impl<'a> Parser<'a> {
    fn parse_document(&mut self) -> Document { while !self.at_end() { self.parse_block(); } … }
    fn parse_block(&mut self) { match self.scan_line() { LineKind::Heading{level} => …, _ => … } }
}
```
Details: [[Parser_Building_Tutorial]] §3–§5.

## 3. nom 8 — combinator shape

```rust
use nom::{IResult, bytes::complete::tag, combinator::map, multi::many0, sequence::delimited};

fn bold(input: &str) -> IResult<&str, &str> {
    delimited(tag("*"), nom::character::complete::is_not("*"), tag("*"))(input)
}
fn paragraph(input: &str) -> IResult<&str, Vec<&str>> { many0(bold)(input) }
```
Caveats: nom 8 reworked input/error plumbing vs the many nom-7 tutorials online — check <https://docs.rs/nom/8.0.0> before pasting anything from older blog posts. For rich errors add `nom::error::VerboseError` + `nom::combinator::all_consuming`.

## 4. chumsky — recovery-first shape

```rust
use chumsky::prelude::*;

type Span = std::ops::Range<usize>;
enum Tok { Bold(String), Text(String), }

fn span_parser() -> impl Parser<char, Vec<Tok>, Error = Simple<char>> {
    let text = filter(|c: &char| *c != '*' && *c != '/')
        .repeated().at_least(1).map(|v| Tok::Text(v.into_iter().collect()));
    let bold = just('*')
        .then(filter(|c: &char| *c != '*').repeated().at_least(1))
        .then(just('*'))
        .map(|(_, body, _)| Tok::Bold(body.into_iter().collect()));
    choice((map(bold, Some), map(text, Some)))
        .repeated()                       // .recover_with(...) adds error recovery
        .collect()
}
```
Chumsky's selling point: `.recover_with(...)`, labelled alternatives, and errors that point at *what you expected* — exactly the UX [[Rust_Tutorial]] §8 asks for. Check 0.13 docs for exact error/recovery builder names.

## 5. pest — grammar-file shape

`src/grammar.pest`:
```pest
heading  = { "^" ~ 6 } ~ " " ~ inline_line
emph     = { "*" ~ (!"*" ~ ANY)* ~ "*" }
inline   = { (emph | code | text)* }
text     = { (!("*" | "`") ~ ANY)+ }
```
```rust
#[derive(pest_derive::Parser)]
#[grammar = "grammar.pest"]
struct CarveParser;
```
Pairs → you still write the AST builder. Two grammars (blocks.pest / inline.pest) matches Carve's two-pass structure.

## 6. logos — lexer shape (if you tokenize)

```rust
use logos::Logos;

#[derive(Logos, Debug, PartialEq)]
enum Tok {
    #[token("#")] Hash,
    #[token("*")] Star,
    #[regex(r"[^\n*#]+")] Text,
    #[token("\n")] Newline,
}
// let mut lex = Tok::lexer(source); while let Some(tok) = lex.next() { … }
```
Logo gives you byte spans (`lex.span()`) for free — nice for error positions. Pairs with hand-written or lalrpop parsing over tokens.

## 7. Diagnostics (rendering your errors)

| Crate | What it gives you |
|-------|-------------------|
| **thiserror** | `#[derive(Error)]` enums with `#[from]`/`#[display]` — define once, `?` chains free |
| **anyhow** | `anyhow::Result` for *binaries* that just need context (`/context: "parsing table"`) |
| **miette** | fancy reports with source spans, carets, help text; `#[derive(Diagnostic)]` |
| **ariadne** | similar fancy rendering, lighter; label spans on a source snippet |

```rust
// thiserror shape
#[derive(Debug, thiserror::Error)]
pub enum ParseError {
    #[error("{line}:{column}: expected {expected}, found {found}")]
    Unexpected { line: usize, column: usize, expected: String, found: String },
    #[error(transparent)]
    Io(#[from] std::io::Error),
}
```

## 8. Testing & tooling

| Crate | Use |
|-------|-----|
| **insta** | snapshot AST/emit output; `cargo insta test --review` |
| **criterion** | benchmarks — prove your lexer isn't quadratic |
| **proptest** | random-input fuzzing: "parser never panics, always terminates" |
| **trybuild** | compile-fail tests (only if you ship macros) |

Golden-corpus + differential harness against `carve-lang`: [[Parser_Building_Tutorial]] §6–§7.

## 9. Red flags in any approach

- `unwrap()` inside parser/emitter code (panic = dead PDF) — return `Result`.
- Regex-driven whole-document parsing (Carve's column-0 rule + nested containers break regex).
- Index arithmetic on `&str` without UTF-8 checks → panics on the first emoji ([[Rust_Cheatsheet]] §10).
- Duplicating offsets as line/col everywhere — store offsets, derive line/col once at error time.
- Letting emitter escaping concerns leak into the AST ([[Carve_to_Typst_Mapping]] §5).

## Status

- [ ] Versions verified 2026-10-06: nom 8.0.0, chumsky 0.13.0, pest 2.9.2, logos 0.16.1, lalrpop 0.23.1
- [ ] Decision recorded in [[Parser_Building_Tutorial]] §2
