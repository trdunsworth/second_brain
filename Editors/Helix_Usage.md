---
type: usage-note
topic: Helix usage — install, select→act model, built-in LSP/DAP/pickers, zero plugins, config.toml/languages.toml, shell integration
date: 2026-11-26
status: active
tags:
  - editors
  - helix
  - modal-editing
  - lsp
  - setup
  - customization
---

# Helix — Usage Notes

> Goal: Helix running on **Mac and Fedora**, the select→act model burned in, built-in LSP/DAP/pickers working with **zero plugin config**, and a `config.toml` you can read. Helix 25.07.1 (July 2025 tag) is the last release; master is active (commits through Sep 2026). No plugin system — by design. You extend via shell integration, not Lua. **Current: 25.07.1 tag, master active**.
> Related: [[Helix_Tutorial]] (learning path) · [[Helix_Cheatsheet]] (keys) · [[Kakoune_Tutorial]] (the ancestor: same model, client/server) · [[Tmux_Tutorial]] (splits/panes) · [[Lisp_Editor_Integrations]] (built-in LSP for Lisp) · [[Vault_Editor_Workflows]]

## How to use this note

1. **§1–§2** — install + survival keys (do once per machine).
2. **§3** — the select→act model + multiple selections (the "why Helix").
3. **§4** — built-in LSP/DAP/pickers (works out of the box).
4. **§5** — config: `config.toml` + `languages.toml` + themes.
5. **§6** — customization primer (no plugins, so config IS the extension).
6. **§7** — daily workflows + shell/tmux integration.
6. **§8** — release cadence reality check.

---

## 1. Install

| Platform | Command | Notes |
|----------|---------|-------|
| macOS | `brew install helix` | 25.07.1 current; `brew install --HEAD helix` for master |
| Fedora | `sudo dnf copr enable atim/helix && sudo dnf install helix` | Copr often newer than main repo |
| Ubuntu/Debian | `deb.griffo.io` apt repo (25.07.1) or AppImage | `apt` often stale; see `deb.griffo.io` |
| Arch | `sudo pacman -S helix` | |
| Build from source | `cargo install --locked helix-term --git https://github.com/helix-editor/helix --branch master` | Needs Rust 1.78+; gets master |

Verify: `hx --version` → `helix 25.07.1` (or `helix 25.07.1-xxx` for master).

### Health check

```bash
hx --health              # shows LSP status per language
hx --health clojure      # example: clojure-lsp found? OK
hx --tutor               # built-in interactive tutorial
```

---

## 2. First run — survival keys

| Keys | Action |
|------|--------|
| `Esc` | Normal mode (home) |
| `i` `a` | Insert before / after selection |
| `I` `A` | Insert at line start (first non-blank) / line end |
| `o` `O` | Open new line below / above selection |
| `v` | Select/extend mode — motions extend the selection |
| `:` | Command mode |
| `:w` `:q` `:wq`/`:x` | Save / quit / both |
| `:q!` `:qa!` | Quit discarding / quit all discarding |
| `u` `U` | Undo / redo (`Alt-u` / `Alt-U` = step history earlier/later) |
| `.` | Repeat last insert/change |
| `:tutor` | Built-in tutorial |

**Insert mode**: `Ctrl-w` delete word back · `Ctrl-u`/`Ctrl-k` kill to line start/end · `Ctrl-h` delete char · `Ctrl-r` insert register · `Ctrl-x` completion · `Ctrl-s` undo checkpoint · `Esc` normal.

**Model**: **select → act** — motions shape a visible selection, verbs (`d` `c` `y` …) act on it. `Esc` always returns to Normal. Prefix keys `g` `m` `z` `v` `Space` `Ctrl-w` each open a minor mode that ends after one key (or `Esc`).

---

## 3. Motion, edits, multiple selections

### Motion (selections extend in select mode `v`)

| Key | To |
|-----|----|
| `h` `j` `k` `l` | Left / down / up / right |
| `w` `b` `e` | Next word start / prev word start / word end |
| `W` `B` `E` | Same on WORDs (whitespace-delimited) |
| `0` / `Home` / `End` | Line start / line end |
| `{` `}` | Paragraph back / forward |
| `(` `)` | Sentence back / forward |
| `f{c}` `t{c}` `F{c}` `T{c}` | To char / till char (forward & back; **not line-limited**) |
| `Alt-.` | Repeat last `f`/`t`/`m` motion |
| `5G` | Line 5 (`G` takes a count) |
| `Ctrl-d` `Ctrl-u` | Half page down / up |
| `Ctrl-f` `Ctrl-b` | Page down / up |
| `Ctrl-o` `Ctrl-i` | Jumplist back / forward |
| `Ctrl-s` | Save selection to jumplist (checkpoint) |

### Edits (verbs act on selection)

| Key | Action |
|-----|--------|
| `d` | Delete selection (yanks it) |
| `Alt-d` | Delete without yanking |
| `c` | Change — delete, enter Insert |
| `Alt-c` | Change without yanking |
| `y` | Yank (copy) |
| `p` / `P` | Paste after / before selection |
| `"` `{reg}` | Choose register for next `y`/`d`/`p` |
| `x` | Select line; repeat to extend down |
| `X` / `Alt-x` | Extend to line bounds / shrink to line bounds |
| `r{c}` / `R` | Replace with char / replace with yanked text |
| `~` / `` ` `` / `Alt-`` ` | Toggle / lowercase / UPPERCASE |
| `J` / `Alt-J` | Join lines (Alt keeps/selected the space) |
| `>` `<` | Indent / unindent |
| `=` | Format (LSP/formatter) |
| `Ctrl-c` | Toggle comments |
| `Ctrl-a` / `Ctrl-x` | Increment / decrement number |
| `_` | Trim whitespace from selections |
| `&` | Align selections in columns |

**Recipes**: change word = `miw` `c` · delete in parens = `mi(` `d` · comment 5 lines = `x`×5 `Ctrl-c` · replace all = `%` `s` `old` `Enter` `c`.

### Multiple selections (central to the model)

| Key | Action |
|-----|--------|
| `s` | Select all regex matches **inside** selections |
| `S` | Split selection on regex matches |
| `Alt-s` | Split selection on newlines (one per line) |
| `K` / `Alt-K` | Keep / remove selections matching regex |
| `C` / `Alt-C` | Copy selection to next / previous line (multi-cursor) |
| `%` | Select entire file |
| `;` | Collapse selection to cursor |
| `Alt-;` | Flip selection direction |
| `,` / `Alt-,` | Keep primary selection / remove primary selection |
| `(` / `)` | Rotate selections |
| `Alt-minus` / `Alt-_` | Merge selections / merge consecutive |
| `Alt-o` / `Alt-i` | Expand / shrink tree-sitter node |
| `Alt-p` / `Alt-n` | Prev / next sibling node |
| `Alt-a` / `Alt-I` | All siblings / all children |

---

## 4. Built-in LSP, DAP, pickers (zero config)

### LSP — works out of the box

Helix ships language configs. Install the server binary; Helix detects and starts it.

```bash
hx --health              # list all languages + server status
hx --health python       # pyright/basedpyright found? OK
```

| Language | Server (install one) |
|----------|---------------------|
| Python | `basedpyright` or `pyright` (`pip install basedpyright`) |
| TypeScript/JS | `typescript-language-server` (`npm i -g typescript-language-server`) |
| Rust | `rust-analyzer` (`rustup component add rust-analyzer`) |
| Go | `gopls` (`go install golang.org/x/tools/gopls@latest`) |
| Lua | `lua-language-server` |
| C/C++ | `clangd` |
| Markdown | `marksman` |
| Clojure | `clojure-lsp` |
| Common Lisp | `cl-lsp` |
| 50+ more | see `hx --health` |

**Daily LSP keys** (buffer-local when attached):

| Key | Action |
|-----|--------|
| `gd` `gy` `gr` `gi` | Definition / type / references / implementation |
| `]d` `[d` / `]D` `[D` | Next/prev diagnostic; last/first |
| `]f` `[f` | Next/prev function |
| `]p` `[p` | Next/prev paragraph |
| `]t` `[t` / `]c` `[c` | Next/prev type definition / comment |
| `Space k` | Hover documentation |
| `Space a` | Code action |
| `Space r` | Rename symbol |
| `=` / `:format` | Format buffer/selection |

**No config needed** for standard projects. Customize per-language in `languages.toml` (§5).

### DAP (Debug Adapter Protocol) — experimental

```toml
# config.toml
[debugger]
# enabled = true  # uncomment to enable
```

Then `Space d` opens debug picker. Requires debug adapter binaries (e.g., `codelldb` for Rust/C++, `debugpy` for Python).

### Pickers (built-in, `Space` prefix)

| Key | Opens |
|-----|-------|
| `Space f` / `F` | File picker (workspace / cwd) |
| `Space b` / `j` / `g` | Buffer / jumplist / changed-files picker |
| `Space /` | Global search · `Space ?` command palette |
| `Space k` | Hover docs · `Space s`/`S` symbols · `Space d`/`D` diagnostics |
| `Space r` / `a` / `h` | Rename / code action / references |
| `Space c` | Toggle comments |
| `Space y` / `Y` / `p` / `P` | Yank to / paste from system clipboard |
| `Space w` | Window mode |

**Picker nav**: `Tab`/`Shift-Tab` move · `Enter` open · `Alt-Enter` background · `Ctrl-s`/`Ctrl-v` split · `Ctrl-t` preview · `Esc` close.

---

## 5. Configuration — `config.toml` + `languages.toml` + themes

### Config locations

| OS | Config dir |
|----|-----------|
| Linux/macOS | `~/.config/helix/` |
| Windows | `%APPDATA%\helix\` |

```
~/.config/helix/
├── config.toml          -- main config (keys, editor behavior, LSP overrides)
├── languages.toml       -- per-language LSP/formatter/linter settings
├── themes/              -- custom themes (optional)
│   └── my-theme.toml
└── runtime/             -- custom queries/grammars (advanced)
```

### `config.toml` — the main file

```toml
# ~/.config/helix/config.toml

[editor]
theme = "tokyonight_night"        # built-in themes: run :theme to list
line-number = "relative"
mouse = true
cursorline = true
cursor-shape = "bar"
soft-wrap = true
tab-width = 2
indent-width = 2
true-color = true
# statusline = { left = ["mode", "spinner"], right = ["position", "diagnostics"] }

[editor.lsp]
display-messages = true
display-inlay-hints = true
code-lens = true

[editor.completion]
auto-insert = true
max-items = 20

[keys.normal]
# Custom mappings (see §6)
# "C-h" = "h"  # unmap
# "C-j" = "h"  # remap

[keys.insert]
# "C-h" = "backspace"

# Shell integration: send selection to tmux pane
# [keys.normal."C-Enter"]
#     { command = "sh", args = ["-c", "tmux send-keys -t repl '$(cat /tmp/hx-send)' Enter"] }

# Window splits
[keys.normal."C-w"]
    v = "vsplit"
    s = "hsplit"
    w = "wnext"
    q = "close"
    o = "only"
    h = "wleft"
    j = "wdown"
    k = "wup"
    l = "wright"
```

### `languages.toml` — per-language overrides

```toml
# ~/.config/helix/languages.toml

[[language]]
name = "python"
language-servers = ["basedpyright", "ruff"]
auto-format = true
formatter = { command = "black" }
linter = { command = "ruff" }

[[language]]
name = "rust"
language-servers = ["rust_analyzer"]
auto-format = true
formatter = { command = "rustfmt" }

[[language]]
name = "lua"
language-servers = ["lua_ls"]
auto-format = true
formatter = { command = "stylua" }

[[language]]
name = "markdown"
language-servers = ["marksman"]
auto-format = true
formatter = { command = "prettier" }

# Add custom language
[[language]]
name = "my-lang"
extensions = ["ml"]
language-servers = ["my-lsp"]
roots = ["project.clj"]
```

### Themes

Built-in: `:theme` lists them. Popular: `tokyonight_night`, `tokyonight_day`, `catppuccin_mocha`, `dracula`, `gruvbox_dark`, `one_dark`.

Custom theme: drop `.toml` in `~/.config/helix/themes/` and set `theme = "my-theme"`.

---

## 6. Customization — no plugins, so config IS the extension

### First five edits

1. **Theme + UI** (`config.toml`):
   ```toml
   [editor]
   theme = "catppuccin_mocha"
   line-number = "relative"
   soft-wrap = true
   ```

2. **Indent + format on save** (`languages.toml`):
   ```toml
   [[language]]
   name = "python"
   auto-format = true
   formatter = { command = "black" }
   ```

3. **Window navigation without `C-w` prefix** (`config.toml`):
   ```toml
   [keys.normal]
   "C-h" = "wleft"
   "C-j" = "wdown"
   "C-k" = "wup"
   "C-l" = "wright"
   ```

4. **System clipboard** (already default in 25.07+):
   ```toml
   [editor]
   clipboard = "external"  # uses `wl-copy`/`xclip`/`pbcopy`
   ```

5. **Shell integration — send to tmux REPL** (`config.toml`):
   ```toml
   [keys.normal]
   "C-Enter" = { command = "sh", args = ["-c", "tmux send-keys -t repl '$(cat /tmp/hx-send)' Enter"] }
   ```
   Then in normal mode: select code → `y` → `Ctrl-Enter` sends to tmux pane named `repl`.

### Extending without plugins

| Need | How |
|------|-----|
| Custom command | Define in `config.toml` `[keys.normal]` with `command = "sh", args = [...]` |
| Run formatter | `=` (uses LSP) or `:format` or shell command in key mapping |
| Project-specific config | Not supported yet; use direnv + shell wrappers |
| Fuzzy finder customization | Built-in picker; filter with `Space /` then type |
| Git integration | Terminal: `git` in tmux pane; no built-in signs (unlike gitsigns) |
| Statusline | Configure `[editor.statusline]` in `config.toml` |
| Snippets | Not built-in; use LSP snippets or shell expansion |

### Adding a language not in `hx --health`

```toml
# languages.toml
[[language]]
name = "gleam"
extensions = ["gleam"]
language-servers = ["gleam"]
roots = ["gleam.toml"]
```

Install `gleam` binary; Helix picks it up.

---

## 7. Daily workflows

### Project work
- `hx .` — open directory; `Space f` file picker, `Space /` global search.
- LSP: `gd`/`K`/`Space a` work immediately for configured languages.
- Multiple cursors: `s` (select matches) → `c` (change all) → `Esc`.

### Git
- No built-in git UI. Use tmux: `git` in adjacent pane, or `:sh git status`.
- Diff: `:sh git diff %:p` opens in new buffer.

### Terminal / REPL
- `:terminal` opens embedded terminal in a window (`C-w` to navigate, `Esc` to normal).
- **Better**: tmux pane for REPL ([[Tmux_Tutorial]] §7) + shell integration key (`Ctrl-Enter` above) to send selection.

### Remote / servers
`hx` over ssh works directly; single binary, no config needed on remote. `hx /ssh:host:/path` not supported — ssh to host, run `hx` there.

### Session persistence
No built-in session save. Workaround: tmux session holds open files; or `:mksession` not available.

---

## 8. Release cadence reality check

| Signal | Status (Nov 2026) |
|--------|-------------------|
| Last tagged release | **25.07.1** (18 Jul 2025) |
| Master branch | Active (commits through Sep 2026) |
| Release rhythm | ~2/year per maintainer thread (not guaranteed) |
| Package managers | Often lag (Fedora Copr, deb.griffo.io, Homebrew track master better) |
| To get latest | Build from source: `cargo install --locked helix-term --git https://github.com/helix-editor/helix --branch master` |

**Implication**: If you want the latest LSP config / tree-sitter queries / bug fixes, build from master. If you want stability, use 25.07.1 and accept that new language support arrives slowly.

---

## 9. Learning plan + tracker

| Phase | Do | Exit check |
|-------|----|-----------|
| 1 | Install on Mac + Fedora; `hx --tutor` | `hx --version` 25.07.1+ |
| 2 | Survival keys §2; select→act motion | Edit without arrow keys, select→act |
| 3 | Multi-select §3; `s` `S` `Alt-s` `K` | Replace all occurrences in file |
| 4 | LSP §4; install servers for your langs | `gd`/`K`/`Space a` work in Python/Rust |
| 5 | `config.toml` + `languages.toml` §5/§6; commit | Format on save, theme, window nav |
| 6 | Picker fluency `Space f` `/` `b` `?` | Find file/grep/buffer without thought |
| 7 | Tmux + REPL integration | Send selection to REPL pane |
| 8 | Vault workflow — [[Vault_Editor_Workflows]] | Open/edit vault notes from Helix |

- [ ] Phase 2 · [ ] Phase 4 · [ ] Phase 7

---

## 10. Quick reference

| Need | Answer |
|------|--------|
| Any key | `Space ?` (command palette) or `:doc keys` |
| Health | `hx --health` / `hx --health <lang>` |
| Tutor | `hx --tutor` / `:tutor` |
| Theme | `:theme` (lists built-in) |
| Config | `~/.config/helix/config.toml` |
| Languages | `~/.config/helix/languages.toml` |
| Themes dir | `~/.config/helix/themes/` |
| LSP keys | `gd` `gr` `gy` `gi` `Space k` `Space a` `Space r` `[d` `]d` |
| Format | `=` or `:format` |
| Picker | `Space f` `/` `b` `?` `k` `s` `d` `r` `a` `h` `c` `y` `w` |
| Multi-select | `s` `S` `Alt-s` `K` `C` `%` `;` `,` `(` `)` |
| Window | `C-w` then `v`/`s`/`w`/`q`/`o`/`h`/`j`/`k`/`l` |
| Quit | `:q` / `:qa` / `:q!` |
| Reload config | `:config-reload` |

---

**Next**: [[Vault_Editor_Workflows]] §Helix for vault integration, or [[Helix_Tutorial]] for the learning path.