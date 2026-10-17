---
type: reference
status: active
topic: "Frankie — a procedural language stitched from Ruby syntax, Python semantics, R statistics and Fortran numerics, running on Python 3.10+ with zero external dependencies."
created: 2026-10-16
aliases:
  - Frankie
  - The Frankie Language
  - .fk
tags:
  - programming-language
  - frankie
  - tooling
  - zero-dependency
---

# The Frankie Language

> Frankie is "a procedural programming language lovingly stitched together from Ruby, Python,
> R, and Fortran. Zero dependencies. Proudly monstrous." — 🔗
> [atejada.github.io/frankielanguage](https://atejada.github.io/frankielanguage/)
>
> **Created 2026-10-16** as the reference note for the `Frankie/` folder. See
> [[Book Review]] for the review of *The Frankie Programming Language*, and
> [[Tree-sitter Grammar]] for the `.fk` parser.

---

## 1. The shape of it

| | |
|---|---|
| **Paradigm** | Procedural. Functions, data, loops, logic. No classes, no `self`, no inheritance |
| **Typing** | Dynamic. Optional gradual annotations since v1.19 (`def area(r: Float) -> Float`) |
| **Runtime** | Python 3.10+. Compiles `.fk` → Python, then runs |
| **Dependencies** | **Zero.** Nothing external, ever |
| **Licence** | GPL-3.0 |
| **Author** | Blag (Alvaro Tejada Galindo), with Claude (Anthropic) |
| **Source** | 🔗 [github.com/atejada/Frankie](https://github.com/atejada/Frankie) |
| **Current** | v1.22.3 |

### 🧊 The language freeze

**v1.22.0 was the last feature release for a while** — Blag is writing *The Book of Frankie*
against that exact version. Bug fixes and doc corrections continue; **new syntax and stdlib
features are on hold**.

> This matters for reading the book: anything in it describes v1.22, and that is the version
> the language is pinned to. Do not expect v1.23 to add features.

**The freeze history is subtler than it looks.** Per the author's 🔗
[Medium announcement](https://medium.com/@atejada/the-book-of-frankie-d2d1485899dd):

> "I decided to freeze Frankie updates on v1.21.0 and start writing the book… While writing
> the book, I found some nasty bugs as well as some improvements to be made, so right now,
> Frankie is on v1.22.2… **no new functionality will be added at all.**"

So the freeze began at **v1.21.0**, and bugs discovered *while writing* moved it to **v1.22.x**.
The frozen version is partly a product of the writing process. See [[Book Review]].

**The author:** Blag aka Alvaro Tejada Galindo — "Senior Developer Advocate, Author of the
Frankie Programming Language, Programming Languages Archaeologist, Punk Dad." Language built
with Claude (Anthropic).

---

## 2. The four donors

Frankie's design claim is that it is assembled from four languages, and it backs that with a
side-by-side comparison of the same program written five ways.

| Donor | What Frankie takes |
|---|---|
| **Ruby** | `do…end` blocks, `if`/`unless`, `#{}` interpolation, `begin`/`rescue`, iterators & blocks, postfix conditions |
| **Python** | Clean semantics, dict/list model, execution model, rich data types, stdlib, zero-dep philosophy |
| **R** | Vectors, pipe operator `\|>`, `mean`/`stdev`/`median`, `seq`/`linspace`, vectorised arithmetic, statistical mindset |
| **Fortran** | `do…while` structure, **integer division `//`**, `**` exponentiation, matrix & complex math, math intrinsics, labeled loops |

```frankie
# One line, four donors
puts (data // 20) * 20      # Fortran // , Ruby puts, Python arithmetic, R's buckets
data |> mean |> puts        # R's pipe
puts "stats: #{round(sd, 2)}"   # Ruby interpolation + Fortran-era numeric pragmatism
```

---

## 3. A tour of the language

### Variables, truthiness, control flow

```frankie
name = "Frankie"          # truthiness: nil and false are falsey
if not done and count > 0
  puts "running"
end

grade = score >= 90 ? "A" : score >= 70 ? "B" : "C"   # right-associative ternary

case user
when {role: "admin"}  puts green("Admin access granted")
when {role: "moderator"} puts yellow("Moderator tools")
end
```

### Functions — implicit return, Ruby-ish signatures

```frankie
def connect(host, port: 5432, ssl: true)   # keyword defaults
  "#{host}:#{port} ssl=#{ssl}"             # last expression returns
end

def even?(n)                               # predicate names compile to _q
  n % 2 == 0
end

double = ->(x) { x * 2 }                   # lambdas are first-class
puts double.call(7)                        # 14
```

### Vectors, hashes, records

```frankie
data = [23, 45, 12, 67]
cfg  = {db: {host: "localhost", port: 5432}}

puts cfg.dig("db", "host")                 # safe nested access
{name, role} = user                        # hash destructuring

record Point(x, y)                         # lightweight named data objects
p = Point(3, 4)
```

### Iterators

```frankie
words.select do |w| w.length > 4 end       # do…end from Ruby
[1,2,3].each do |n|
  next if n % 2 == 0
  break if n > 5
end
nums.group_by do |n| n % 2 == 0 ? "even" : "odd" end
```

### Nil safety, ranges, strings

```frankie
puts user["name"]&.upcase                 # nil instead of crashing
puts (1..10).step(3)                      # first-class ranges
puts "ha" * 3                             # string/vector repetition
sql = <<~SQL                              # heredoc, indent-stripped, interpolated
  SELECT * FROM users WHERE v = '#{v}'
SQL
```

### Fortran heritage, made explicit (v1.22)

```frankie
puts factorial(5), gcd(12, 18), lcm(4, 6)      # math intrinsics
c = complex_new(3, 4);  puts complex_abs(c)     # 5.0 — Python complex underneath
m1 = [[1,2],[3,4]];  puts matrix_multiply(m1, m1)

loop :outer do                                # labeled loops (v1.22)
  loop do
    break :outer if condition_met?()          # escapes a *named* loop from anywhere
  end
end
```

---

## 4. `frankiec` — the toolchain

Everything runs through one CLI.

| Command | Does |
|---|---|
| `frankiec run file.fk` | Run a program (`--debug` for the stepping debugger) |
| `frankiec repl` | Interactive REPL (`--no-banner` for scripts) |
| `frankiec test` | Built-in runner; `--coverage`, `--filter`, `--tag` |
| `frankiec check file.fk` | Static analysis — undefined vars, typo'd functions, wrong arity, unused locals. `--strict` for CI |
| `frankiec fmt` | Formatter (`--check` in CI; idempotent since v1.13.1) |
| `frankiec docs` | Generate Markdown or HTML API docs |
| `frankiec new myapp` | Scaffold a project (`--game` for a playable starter) |
| `frankiec lsp` | Language Server — diagnostics, completion, hover |
| `frankiec bundle app.fk -o app.py` | **Ship one self-contained `.py`** — stdlib inlined |
| `frankiec watch file.fk` | Re-run on save |

`frankiec bundle` is the sharpest tool here: it means a Frankie program can ship as a single
Python file that runs anywhere with no Frankie installed.

---

## 5. The package system — stitches

```frankie
stitch "frankiecli"     # a .fk file in ./stitches/, or in ~/.frankie/stitches/
```

Zero-dependency, zero-registry. Resolves locally first. `stitch.lock` pins by sha256
(`verify` / `update`).

**Ships with the language:** `frankiestring`, `frankieforms`, `frankietable`, `frankiecolor`,
`frankiepager`, `frankieconfig`, `frankietemplate` (Mustache), `frankiecookie`, `frankieauth`,
`frankieratelimit`, `frankiemail` (SMTP), `frankiecli`, `frankiecache`, `frankiegame`,
`frankiecanvas`.

---

## 6. What ships in the box

Sinatra-style web server with routing, path params, JSON, filters, custom 404, middleware,
async routes and hand-rolled RFC 6455 WebSockets. Plus SQLite, HTTP client, JSON/CSV, regex,
dates, SMTP, TCP/UDP sockets, `parallel_map`, `spawn`, and R-style statistics.

**Two game engines, one API:**

| Stitch | Renders to |
|---|---|
| `frankiegame` | Terminal — fixed timestep, raw arrow keys, double-buffered ANSI, sprites |
| `frankiecanvas` | HTML5 canvas over WebSockets — every browser tab is a player |

Snake in ~80 lines. Multiplayer Pong costs zero extra code. Your test suite can play it
headless.

**A browser playground** (v1.22.3) runs the real compiler through WebAssembly — no install.
Sandboxed in a Web Worker, 20 s cutoff, network and sockets disabled.

---

## 7. Showcase projects

Each is a single `.fk` file, runnable with one command and bundleable to one `.py`.

| Project | Lines | Shows |
|---|---|---|
| `zombie_chat` | ~150 | Multi-room WebSocket chat; server **and** UI in one file |
| `word_reanimator` | — | Multiplayer hangman; shared state broadcast per move |
| `frankie_ledger` | — | CLI expense tracker — stitches + SQLite + R-style stats |
| `snake` / `zombie_invaders` / `pong` | — | One engine API, two renderers |

---

## 8. Honest assessment

**Genuinely good**

- **The zero-dependency constraint is honoured, not aspirational.** WebSockets, HTTP, SQLite,
  SMTP, image decoding, a template engine, a game engine, an LSP — all hand-rolled on the
  Python stdlib. That is a real engineering achievement, not a constraint loophole.
- **`frankiec bundle` is a genuinely good idea.** Single-file deployment without a runtime is
  the kind of feature that decides whether a language gets used for real work.
- **The freeze is disciplined.** Pinning the language for a book, then shipping bug fixes
  separately, is the right call and is visible in the release table.
- **The tree-sitter grammar matches the reference compiler rather than an idealised syntax** —
  it rejects `{ }` blocks because the compiler does. See [[Tree-sitter Grammar]].

**Worth weighing**

- **GPL-3.0.** Correct for a language implementation, but it constrains embedding.
- **Zero dependencies means zero absorbed CVEs** — you inherit and fix them yourself.
- **One author.** Blag is the language, the compiler, the docs, the book and the examples.
  Bus factor one, with Claude as a co-author rather than a maintainer.
- **Yarn-style: `stitch` is not a package registry.** Fine for a language this young; a real
  ecosystem will need one.
- **The transplant is visible.** Ruby blocks + Python dicts + R vectors + Fortran numerics is a
  lot of surface, and some combinations have not settled. `record` and `hash` overlap
  conceptually; `require` vs `import "x" as y` is two mechanisms for module loading.

---

## References

1. Blag (Alvaro Tejada Galindo). *The Frankie Programming Language.* 2026. 205 pp. Local copy: `Frankie/The Frankie Programming Language.pdf`
2. Frankie homepage. 🔗 https://atejada.github.io/frankielanguage/
3. Frankie documentation. 🔗 https://atejada.github.io/frankielanguage/site/index.html
4. *The Book of Frankie* (Medium). 🔗 https://medium.com/@atejada/the-book-of-frankie-d2d1485899dd
5. Source. 🔗 https://github.com/atejada/Frankie · releases: 🔗 https://github.com/atejada/Frankie/releases
6. Grammar reference — 🔗 https://github.com/trdunsworth/frankie_tree_sitter

## Cross-links

- [[Book Review]]
- [[Tree-sitter Grammar]]
- [[Frankie/README]] — folder index