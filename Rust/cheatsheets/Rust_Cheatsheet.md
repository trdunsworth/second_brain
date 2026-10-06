---
type: cheatsheet
topic: Rust cheatsheet — syntax, cargo, error handling, iterators, testing and common patterns at a glance
date: 2026-10-06
status: active
tags:
  - rust
  - cheatsheet
  - reference
---

# Rust Cheatsheet

> Goal: lookup while coding [[Carve_Parser_Challenge]] — one page, no prose. Learn the concepts in [[Rust_Tutorial]]; this is the keyboard beside you.
> Related: [[Parser_Cheatsheet]] (parser-specific crates), [[Typst_Engine_Cheatsheet]] (engine API), [[Rust_Installation]] (commands)

## 1. Types & declarations

```rust
let n: i64 = 42;              // integers: i8..i64, u8..u64, isize/usize (sizes/indices)
let f: f64 = 3.14;            // floats: f32, f64
let s: &str = "slice";        // borrowed string slice
let owned: String = s.into(); // heap string
let v: Vec<u8> = vec![1, 2];  // growable array
let arr: [u8; 4] = [0; 4];    // fixed array
let map: HashMap<&str, usize> = HashMap::new();
let opt: Option<usize> = None;
let r: Result<u8, String> = Ok(1);

const MAX: usize = 64;        // compile-time
static NAME: &str = "carve";  // 'static

fn add(a: i32, b: i32) -> i32 { a + b }      // last expr = return value
fn pair() -> (i32, &'static str) { (1, "x") }
fn demo(f: impl Fn(i32) -> i32) -> i32 { f(1) }   // impl Trait arg
```

## 2. Enums & matching (the AST toolkit)

```rust
enum Node { Text(String), Wrap(Vec<Node>), Pair(String, String) }

match node {
    Node::Text(t) => t.len(),
    Node::Wrap(inner) if !inner.is_empty() => 1,   // guard
    Node::Wrap(_) => 0,
    Node::Pair(a, b) => a.len() + b.len(),
}   // non-exhaustive → compile error

if let Node::Text(t) = node { … }        // single-variant destructure
while let Some(x) = iter.next() { … }    // drain an iterator
let Node::Pair(a, _) = node else { return; };   // let-else (early exit)
matches!(node, Node::Text(_))            // bool version of match
```

## 3. Option / Result / `?`

```rust
let x: Option<i32> = Some(2);
let y = x.unwrap_or(0);
let z = x.map(|v| v * 2).filter(|&v| v > 2);

fn read(path: &str) -> std::io::Result<String> { std::fs::read_to_string(path) }
fn run() -> Result<(), Box<dyn std::error::Error>> {
    let txt = read("a.carve")?;           // early-return Err
    let n: usize = txt.parse()?;
    Ok(())
}
```

| Want | Use |
|------|-----|
| panic with message | `unwrap()` / `expect("why")` — tests & prototypes only |
| default on missing | `unwrap_or(default)` / `unwrap_or_else(\|\| …)` |
| convert error types | `#[from]` with `thiserror`, or `.map_err(…)` |
| propagate | `?` (function must return `Result`) |

## 4. Iterators

```rust
.iter()  .iter_mut()  .into_iter()      // borrow / mutate / consume
.map .filter .enumerate .skip .take .chain .zip
.collect::<Vec<_>>()
.collect::<Result<Vec<_>, _>>()          // Vec<Result<T>> → Result<Vec<T>>
.find(|l| l.starts_with('#'))            // Option<&T>
.fold(String::new(), |mut acc, t| { acc.push_str(t); acc })
.peekable()  // + .peek() for lookahead
```

## 5. Structs, traits, generics

```rust
struct Lexer<'a> { src: &'a str, pos: usize }     // lifetime on borrowed field

impl<'a> Lexer<'a> {
    fn new(src: &'a str) -> Self { Lexer { src, pos: 0 } }
    fn rest(&self) -> &'a str { &self.src[self.pos..] }
}

trait Emit { fn emit(&self, out: &mut String); }
impl Emit for Node { fn emit(&self, out: &mut String) { … } }

fn render<T: Emit>(nodes: &[T]) -> String { … }
fn any_render(nodes: &[impl Emit]) -> String { … }
fn boxed(n: &dyn Emit) { … }              // dynamic dispatch
```

## 6. Lifetimes (only when confused — the compiler is right)

```rust
fn longest<'a>(a: &'a str, b: &'a str) -> &'a str { if a.len() > b.len() { a } else { b } }
struct Doc<'a> { source: &'a str }         // holds a borrow
fn leak() -> &'static str { Box::leak("forever".into()) }   // rare, deliberate
```

Elision covers `&self` methods automatically. Returning borrowed data + owning data from one fn → needs explicit `'a`.

## 7. Modules & project

```rust
mod lexer;              // src/lexer.rs
pub mod ast;            // visible outside crate
use crate::ast::{Block, Inline};
use std::collections::HashMap as Map;

// src/lib.rs → testable by tests/*.rs; src/main.rs → thin CLI
```

## 8. Cargo commands

| Command | Purpose |
|---------|---------|
| `cargo new name --lib` | library crate (parser core) |
| `cargo build` / `cargo run -- args` | build / run |
| `cargo test` / `cargo test -- --nocapture` | tests / with stdout |
| `cargo test <filter>` | run matching tests |
| `cargo clippy --all-targets -- -D warnings` | lint as error |
| `cargo fmt` | format |
| `cargo add crate` / `cargo add --dev insta` | add dep / dev-dep |
| `cargo update` / `cargo tree -i typst` | update lockfile / why-dep |
| `cargo doc --open --no-deps` | browse a crate's docs locally |
| `cargo bench` (needs criterion setup) | benchmarks |

## 9. Testing

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_heading() { assert_eq!(parse("# hi"), doc(heading(1, "hi"))); }

    #[test]
    #[should_panic(expected = "unclosed")]
    fn bad_input() { parse("*x").unwrap(); }
}
```

- Snapshot: `cargo add --dev insta` → `insta::assert_snapshot!(rendered_typst);` then `cargo insta test --review`.
- Integration tests live in `tests/*.rs` and import the library crate by name.
- Ignore temporarily: `#[ignore]` + `cargo test -- --ignored`.

## 10. Strings & escapes (emitter-critical)

```rust
format!("{name} {level:>2}")           // interpolation + width
format!("{:?} {:?}", a, b)             // Debug quoting
text.replace('\\', "\\\\")             // escape backslash FIRST
s.find(":::").map(|i| &s[..i])         // slicing by byte index
s.lines()                              // splits on \n, drops line endings
char.is_ascii_punctuation()            // conservative Typst escaper building block
```

> [!warning] Byte vs char indices
> Rust indexes are **bytes**; `s[..3]` panics on multi-byte UTF-8 boundaries. For offsets in spans prefer char-safe ops (`char_indices()`) — Carve's own offsets count Unicode codepoints.

## 11. Common parser shapes

```rust
// peek + consume
if let Some('#') = chars.peek() { … }

// take_while
let (body, rest) = input.split_once("\n\n").unwrap_or((input, ""));

// error with span
return Err(ParseError { line, column, expected: "']'".into(), found: rest.chars().take(8).collect() });
```

## Status

- [ ] Verified against Rust stable ≥ 1.92 and the challenge's crates (2026-10-06)
