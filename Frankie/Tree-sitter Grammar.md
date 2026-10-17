---
type: reference
status: active
topic: "My tree-sitter grammar for Frankie — a complete .fk parser with highlights, indents, locals and textobjects, validated against all 46 upstream examples."
created: 2026-10-16
aliases:
  - frankie_tree_sitter
  - tree-sitter-frankie
  - Frankie Grammar
tags:
  - frankie
  - tree-sitter
  - parsing
  - editor-tooling
---

# Tree-sitter Grammar for Frankie

> 🔗 [github.com/trdunsworth/frankie_tree_sitter](https://github.com/trdunsworth/frankie_tree_sitter) —
> MIT licensed. Targets **Frankie v1.22**.

A complete parser for `.fk` files, providing the parser core for syntax highlighting,
indentation, folding and structural editing across Neovim, Helix, Zed, Emacs, Kakoune and VS
Code. Status: **P0–P4 complete**, WASM build complete, VS Code extension complete.

---

## 1. Status

| Phase | State |
|---|---|
| P0 scaffold | ✅ config, tests wiring, corpus |
| P1 grammar | ✅ **all 46 files** in `examples/` parse with zero `ERROR`/`MISSING` nodes; 29 unit tests pass |
| P2 queries | ✅ `highlights.scm`, `indents.scm` |
| P3 editor integration | ✅ query files drop-in ready |
| P4 structural queries | ✅ `locals.scm` (scopes, definitions, references), `textobjects.scm` |
| Heredoc interpolation | ✅ `#{expr}` inside `<<~DELIM` parses as `(interpolation)`, verified against the reference compiler |
| WASM build | ✅ `npm run build:wasm` → `tree-sitter-frankie.wasm`; `test:wasm` proves identical trees and captures |
| VS Code extension | ✅ `.vsix` with semantic highlighting + TextMate fallback, tested headlessly and in a real VSCodium |

---

## 2. Design decisions worth knowing

### Match the compiler, not the idea of the language

> **Brace blocks (`.each { ... }`) are deliberately not in the grammar.** The reference compiler
> rejects them, with or without `|x|` — so excluding them *matches the language* rather than
> deviating from it.

That is the right call and it is the kind of decision that is easy to get wrong. A grammar
that accepts syntax the compiler rejects will let you write code that fails at run time; a
grammar that rejects what the compiler accepts breaks every existing file. **The compiler is
the spec.** `SPEC.md`, `compiler/lexer.py` and `compiler/parser.py` in `atejada/Frankie` were
the ground truth alongside the upstream docs.

### The custom scanner

`src/scanner.c` handles what context-free rules cannot:

- **Interpolated strings** — `"#{expr}"`, single- and triple-quoted
- **Heredocs** — `<<~DELIM … DELIM`, *including* `#{expr}` inside the body. The scanner splits
  a body line at each `#{` so the expression parses as an ordinary `(interpolation)` node.

### GLR conflicts

Declared for the statement-level ambiguities the language genuinely has:

- destructuring vs. comma list
- command vs. paren call
- postfix control

### Block bodies stay visible

A block body is a visible `(statements)` node rather than being flattened into its construct.
That is what makes `@function.inner` and friends work, and it stops body expressions being
misread as part of a signature.

---

## 3. Known limitations

Chosen deliberately — each is a case where a *plausible* implementation would select the wrong
region, so the feature was left out rather than faked.

**No text object spans more than one node.** Everything selecting a single node is exact.

| Missing | Why |
|---|---|
| `@class.inner` | `record Point(x, y)` has no body — only a field list |
| `@call.inner` | `f(a, b)` has no node spanning just the arguments |
| `@assignment.lhs` / `@rhs` | `x = a ? b : c` is a run of sibling nodes (`x` `=` `a` `?` `b` `:` `c`), so `@rhs` would select only `a` |
| `@comment.inner` | Needs a range directive; `#make-range!`/`#offset!` are Neovim-only and can fail to load in Helix |
| full-span `@parameter.outer` | `v: Int = 0` has no node covering the whole parameter |

Other limits:

- **Identifier-argument postfix chains** in keyword commands attach outside the command node
  (`puts a.b` → `(call puts a)` + `(dot_call b)`). Tokens and highlight captures are unaffected.
- **`!` is not an operator** — use `not`. Matches the reference lexer.
- **ASCII-only identifiers.**

---

## 4. ⚠️ tree-sitter query-compiler pitfalls

Two failure modes worth knowing, both reproducible with `scripts/check-query.sh`, which
compiles a query under a timeout and fails on a hang:

**Hangs at compile time** — even against an empty file:

- Two chained `.` anchors between named siblings of the *same type*.
  `(rescue_clause "rescue" . (identifier) . (identifier) @v)` **hangs**;
  `(rescue_clause "rescue" . (_) . (identifier) @v)` does not.
- A `[ … ]` alternation of anonymous tokens following a captured sibling.
  `(assignment (identifier) @v . ["=" "+=" …])` **hangs**.

**Slow at compile time**, by parent and pattern shape rather than match volume:

- `(lambda "(" . (identifier) @v)` takes **2.9 s** on its own.
- Giving the pattern a concrete or bracketed continuation (`… @v . [")" "," "="]`) cuts that
  to **0.1 s**.

> These are **compile** costs, so they are identical for an empty file and a large one — which
> is why a query can be *correct* and still freeze an editor on open. A query that works fine
> interactively can be a denial-of-service in a plugin.

---

## 5. Development commands

```bash
npm install
tree-sitter generate        # regenerate src/parser.c from grammar.js
tree-sitter test            # test/corpus unit tests
tree-sitter test -u         # regenerate expected trees after a grammar change
npm run test:examples       # parse examples/*.fk, fail on any ERROR node
npm run build:wasm          # tree-sitter-frankie.wasm — no emscripten needed
npm run test:wasm           # build it, then diff against the native parser
npm run test:vscode         # headless VS Code extension tests
npm run test:integration    # the same provider, inside a real VSCodium
tree-sitter playground      # interactive (builds wasm)
```

Emscripten is **not** required: since CLI 0.27, `tree-sitter build --wasm` fetches its own
WASI-SDK clang and `wasm-opt` into `~/.cache/tree-sitter/`. The `.wasm` and copied query are
git-ignored on both sides, so the extension cannot ship a stale copy of the grammar.

### Verifying a query

```bash
scripts/check-query.sh queries/locals.scm            # all examples
scripts/check-query.sh queries/locals.scm file.fk    # one file
QUERY_TIMEOUT=8 scripts/check-query.sh q.scm /dev/null
```

---

## 6. Editor integration

| Editor | Route |
|---|---|
| **Neovim** 0.10+ | `nvim-treesitter.parsers`.frankie, pointing at this repo; symlink `queries/*` into `~/.config/nvim/queries/frankie/` |
| **Helix** | `languages.toml` entry + copy `highlights`, `indents`, `textobjects` to `runtime/queries/frankie/`. Does not read `locals.scm` |
| **Zed** | `extension.toml` + `languages/frankie/config.json` + `highlights.scm` |
| **Emacs** 29+ | `treesit-extra-load-path` + `frankie-ts-mode` for `.fk` |
| **VS Code** | `vscode/` in this repo — `npm run assets && npm install && npm test`, then package the `.vsix` |
| **Kakoune** | `kak-tree-sitter` with the same `highlights.scm`, or the built-in regexp highlighter |

`locals.scm` is a Neovim convention (rename, "highlight usages"). `textobjects.scm` carries
both `@function.outer` and `@function.around` captures on the same node, so one file serves
Neovim and Helix.

---

## Cross-links

- [[Frankie Language]] — the language this parses
- [[Book Review]] — the grammar is a verification tool for the book's code samples
- [[Frankie/README]] — folder index