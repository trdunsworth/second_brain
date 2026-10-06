---
type: tutorial
topic: Rust installation — rustup toolchain, cargo workflow, MSRV 1.92 for the typst crates, carve and typst CLIs
date: 2026-10-06
status: active
tags:
  - rust
  - installation
  - setup
  - carve
  - typst
---

# Rust Installation

> Goal: a working `cargo` on this machine, the right toolchain for the typst 0.15 crates, and both CLIs (`carve`, `typst`) installed for debugging. Everything in [[Carve_Parser_Challenge]] assumes this note is done.
> Related: [[Rust_Tutorial]] (what to learn first), [[Rust_Cheatsheet]] (command lookup), [[Rust_Resources]] (where to go deeper)

## 1. The toolchain (Windows first — this vault's machine is win32)

1. Install **rustup** from <https://rustup.rs> (Windows: download `rustup-init.exe`).
2. Accept the default **stable** toolchain and the MSVC linker (default answers are fine).
3. Verify in a **new** terminal (PATH only refreshes on restart):

```powershell
rustc --version   # expect 1.9x — see MSRV note below
cargo --version
rustup show
```

> [!important] MSRV: the typst crates need Rust ≥ 1.92
> `typst-pdf` 0.15.1 declares `rust-version = 1.92` and edition 2024 (verified 2026-10-06 on crates.io). If `cargo build` says "package requires rustc 1.92", run `rustup update stable`. `carve-lang` itself only needs 1.75, but your binary will pull typst, so **1.92+ is the real floor**.

### Linux / macOS (for later machines)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup update stable
```

## 2. The cargo workflow you will actually use

| Command | When |
|---------|------|
| `cargo new carve2typst` | scaffold the project (challenge binary) |
| `cargo run -- input.carve -o out.pdf` | the loop you live in |
| `cargo test` | unit + snapshot tests ([[Parser_Building_Tutorial]] §6) |
| `cargo clippy --all-targets -- -D warnings` | lint gate before you call anything done |
| `cargo fmt` | formatting — do it, don't argue with it |
| `cargo add <crate>` | add a dependency without hand-editing Cargo.toml |
| `cargo tree -i typst` | see why a dependency got pulled in (typst trees are deep) |
| `cargo watch -x run -- ...` | optional hot loop: `cargo install cargo-watch` |

Editor: **VS Code + rust-analyzer** or **Neovim + rust-analyzer** both work; rust-analyzer ships with rustup's default profile (`rustup component add rust-analyzer` if missing).

## 3. Companion CLIs

### `carve` — the reference implementation

The official Rust implementation of Carve is the [`carve-lang` crate](https://crates.io/crates/carve-lang) (0.1.7 as of 2026-09-29). Package name is `carve-lang`; Rust code imports it as `carve`; the CLI binary is `carve`.

```powershell
cargo install carve-lang     # binary: carve
carve --help
```

Why you want it: it is the **oracle** for your own parser — `carve` can render HTML/Markdown/text/ANSI, export its serialized AST as JSON, and format canonical source. Differential testing against it is the backbone of [[Parser_Building_Tutorial]] §7.

### `typst` — the typesetting CLI

```powershell
cargo install typst-cli     # binary: typst (large build, a few minutes)
typst compile hello.typ hello.pdf
typst watch hello.typ       # fast edit loop while designing layout
```

You do **not** strictly need it — the challenge embeds the engine ([[Typst_PDF_Engine]]) — but it is the fastest way to debug a *layout* problem ("is it my emitted Typst, or my engine wiring?") by diffing your generated `.typ` against a manual compile.

## 4. Smoke tests

Run these before starting [[Rust_Tutorial]]:

- [ ] `cargo new smoke && cd smoke && cargo run` prints `Hello, world!`
- [ ] `cargo clippy` runs clean on the fresh project
- [ ] `carve --help` prints Carve CLI usage
- [ ] `typst --version` prints a 0.x version
- [ ] A one-line Typst file compiles: `echo '#set page(width: 10cm, height: auto)
Hello' > t.typ && typst compile t.typ t.pdf` and `t.pdf` opens

## 5. Gotchas specific to this challenge

| Gotcha | What to do |
|--------|------------|
| Stale PATH after rustup install | open a **new** terminal or reboot before verifying |
| typst crates fail with "rustc version too old" | `rustup update stable` (see MSRV above) |
| First `cargo build` of typst is slow | ~1–3 min compile of the typst tree; later builds incremental. Normal. |
| Windows + system fonts | Typst doesn't auto-use your system fonts unless you wire `typst-kit` `scan-fonts` — see [[Typst_PDF_Engine]] §3 |
| `carve` crate import name confusion | dependency key is `carve-lang`, in code it is `carve::…` |

## Status

- [ ] rustup installed, `rustc` ≥ 1.92 confirmed (§1)
- [ ] cargo workflow commands run once (§2)
- [ ] `cargo install carve-lang` → `carve --help` works (§3)
- [ ] `cargo install typst-cli` → `typst compile` works (§3)
- [ ] All five smoke tests checked (§4)
