---
type: learning-note
topic: Helix tutorial — selection-first modal editing with built-in LSP
date: 2026-09-29
status: active
tags:
  - helix
  - modal-editing
  - tutorial
  - terminal_stuff
  - learning-plan
---

# Helix Tutorial — Selection First, Zero Plugins

> Goal: learn **selection → action** editing: you always see and shape *what* you're acting on first, then press the verb. Helix keeps Vim's motion vocabulary, borrows Kakoune's philosophy, and ships LSP + fuzzy pickers **in the binary** — no plugin manager, no Lua, just TOML.
> Related: [[Helix_Cheatsheet]] (quick keys), [[Kakoune_Tutorial]] (the ancestor that invented this model), [[Vim_Tutorial]] / [[Neovim_Tutorial]] (the operator-first alternative), [[Tmux_Tutorial]]

## How to use this note

1. **§1–§3 once**: install, the model, survival keys.
2. **§4–§6 daily**: motions, edits, multi-selection — this is 80% of Helix.
3. **§7–§9**: search, modes (`g` `m` `z` `Space` `Ctrl-w`), pickers.
4. **§10–§12**: LSP, config, learning plan.
5. Drill: run `hx --tutor` (or `:tutor` inside Helix) — the built-in interactive course.
6. Keep [[Helix_Cheatsheet]] open alongside.

---

## 1. Install

| Platform | Command |
|----------|---------|
| Windows  | `winget install Helix.Helix` |
| macOS    | `brew install helix` |
| Debian/Ubuntu | `sudo apt install helix` (universe) |
| Fedora   | `sudo dnf install helix` |
| Arch     | `sudo pacman -S helix` |
| Latest   | build from source: clone [helix-editor/helix](https://github.com/helix-editor/helix), `cargo install --path helix-term` (needs Rust + `cargo fetch` for parsers) |

- Binary is **`hx`**: `hx file.py`, `hx file1 file2`, `hx .` (open directory = file picker).
- Config lives in `~/.config/helix/`: `config.toml` (keys/theme/options), `languages.toml` (LSP/formatters per language), `themes/*.toml`.
- `:config-open` edits your config, `:config-reload` applies it without restarting.
- No plugin manager by design — everything you get ships in the binary (LSP client, tree-sitter, pickers, snippets).

## 2. The model (the whole idea)

| Concept | What it means |
|---------|---------------|
| **Selection → action** | Select the text *first*, then press the verb (`d` delete, `c` change, `y` yank). Vim does verb → motion; Helix/Kakoune do noun → verb. |
| **Cursor = a 1-char selection** | Nothing special to learn: the cursor is just a selection of width 1. |
| **See it, then act** | Because the selection is visible before you act, you don't have to *predict* what `dw` would hit — you look at the highlighted range and commit. |
| **Multiple selections** | The real payoff: `s` (select all matches) turns "search and replace" into "select everywhere → type once". |

> [!tip] The one habit
> Select with motions until the highlight looks right — **then** press the verb. If the highlight is wrong, you haven't acted yet.

### Modes

| Mode | Enter with | Leave with | You can… |
|------|-----------|-----------|----------|
| **Normal** | (home base) | — | Move, select, edit — commands |
| **Insert** | `i` `a` `I` `A` `o` `O` | `Esc` | Type text |
| **Select/extend** | `v` | `Esc` | Motions extend instead of replace |
| **Command** | `:` | `Esc` / `Enter` | `:w`, `:q`, config |
| Minor: goto / match / view / window / space | `g` `m` `z` `Ctrl-w` `Space` | `Esc` or one command | Jump, surround, scroll, split, pick |

The status line (bottom) shows your mode. **If Helix "ignores" you: `Esc` and look at the status line.**

## 3. Survival keys

| Key | Action |
|-----|--------|
| `i` / `a` | Insert before / after selection |
| `Esc` | Back to Normal |
| `:w` | Save |
| `:q` | Quit (blocked if unsaved → `:q!`) |
| `:wq` or `:x` | Save and quit |
| `:qa!` | Quit all, discard changes |
| `u` / `U` | Undo / redo |
| `:tutor` (or `hx --tutor`) | Built-in interactive tutorial |
| `:e path` (`:open`, `:o`) | Open file |
| `:bn` / `:bp` | Next / previous buffer |

## 4. Motion — where selections can land

Motions move the **cursor end** of the selection; in Normal mode the selection collapses to the landing point (cursor = 1-char selection). Press `v` (select mode) and the same motions **extend** instead.

### Words & lines
| Key | To |
|-----|----|
| `h` `j` `k` `l` | Left / down / up / right |
| `w` / `b` / `e` | Next word start / prev word start / word end |
| `W` / `B` / `E` | Same on WORDs (whitespace-delimited) |
| `0` / `Home` / `End` | Line start / line end |
| `{` / `}` | Previous / next paragraph (blank line) |
| `(` / `)` | Previous / next sentence |
| `f{c}` `t{c}` `F{c}` `T{c}` | Find char — **not line-confined** in Helix (unlike Vim) |
| `Alt-.` | Repeat last `f`/`t`/`m` motion |

### File & screen
| Key | To |
|-----|----|
| `5G` | Line 5 (`G` takes a count) |
| `gg` | File start (goto mode `g` then `g`) |
| `ge` | File **end** — note: not Vim's "end of previous word" |
| `gs` | First non-whitespace char of line |
| `Ctrl-d` / `Ctrl-u` | Half page down / up |
| `Ctrl-f` / `Ctrl-b` | Page down / up |
| `Ctrl-o` / `Ctrl-i` | Jumplist back / forward |
| `Ctrl-s` | Save current selection to jumplist (checkpoint) |

## 5. Edits — the verbs

| Key | Action |
|-----|--------|
| `d` | Delete selection (yanks to register) |
| `c` | Change — delete and enter Insert |
| `y` | Yank (copy) |
| `p` / `P` | Paste after / before selection |
| `x` | Select current line; press again to extend down |
| `X` | Extend selection to line bounds |
| `J` | Join lines inside selection |
| `>` / `<` | Indent / unindent |
| `r{c}` | Replace selection with char `c` |
| `R` | Replace selection with yanked text |
| `~` / `` ` `` / ``Alt-` `` | Toggle case / lowercase / UPPERCASE |
| `.` | Repeat last insert/change |
| `u` / `U` | Undo / redo (`Alt-u` / `Alt-U` step through history) |
| `Ctrl-a` / `Ctrl-x` | Increment / decrement number under cursor |
| `"` then `{reg}` | Select register before `y`/`d`/`p` |
| `_` | Trim whitespace from selections |
| `&` | Align selections in columns |

Common recipes — in Helix you select (or use a text object) first, then act:

| Want | Press |
|------|-------|
| Change the word under cursor | `m` `i` `w` then `c` |
| Change inside quotes | `m` `i` `"` then `c` |
| Delete inside parens | `m` `i` `(` then `d` |
| Delete a line | `x` then `d` |
| Comment out 5 lines | `x` ×5 then `Ctrl-c` (or `Space c`) |
| Uppercase the word under cursor | `m` `i` `w` then ``Alt-` `` |

## 6. Multiple selections — the superpower

| Key | Action |
|-----|--------|
| `s` | **Select all regex matches** inside current selection (prompts) |
| `S` | Split selection into sub-selections on regex matches |
| `Alt-s` | Split selection on newlines (one selection per line) |
| `K` / `Alt-K` | Keep / remove selections matching a regex |
| `C` / `Alt-C` | Copy selection onto next / previous line → **multi-cursor** |
| `,` / `Alt-,` | Keep only primary selection / remove primary |
| `;` | Collapse selection to a single cursor |
| `Alt-;` | Flip selection direction (cursor ↔ anchor) |
| `(`/`)` | Rotate selections |
| `Alt-minus` / `Alt-_` | Merge selections / merge consecutive |
| `%` | Select entire file |
| `Alt-o` / `Alt-i` | Expand / shrink to tree-sitter node |
| `Alt-p` / `Alt-n` | Previous / next sibling node |

The classic rename loop: `Space /` (or `s`) → select every occurrence → `c` → type once → `Esc`. **One edit, N cursors.**

## 7. Search

| Key | Action |
|-----|--------|
| `/` | Search forward (regex) |
| `?` | Search backward |
| `n` / `N` | Next / previous match (selects it) |
| `*` | Use current selection as pattern (auto word-boundaries) |
| `Alt-*` | Use selection verbatim |
| `Space /` | **Global search** across the workspace — fuzzy picker of hits |
| `Space '` | Re-open the last picker (e.g. global search results) |

> [!tip] Replace everywhere
> `%` then `s` then `old` `Enter` → every match is selected → `c` → type `new` → `Esc`. Regex style: select file (`%`), press `\|`, type `sed 's/old/new/g'` — shell does the work.

## 8. Minor modes (the prefixes)

### `g` — goto
| Key | To |
|-----|----|
| `g` | File start (`5g g` = line 5) |
| `e` | File end |
| `h` / `l` | Line start / end |
| `s` | First non-blank |
| `t` / `c` / `b` | Screen top / center / bottom |
| `d` `y` `r` `i` | LSP: definition / type def / references / implementation |
| `a` | Alternate (last accessed) file |
| `m` | Last modified file |
| `n` / `p` | Next / previous buffer |
| `.` | Last modification in this file |
| `f` | Open file under selection |
| `w` | **Word labels** — two-key jump to any word on screen |

### `m` — match (brackets, surround, text objects)
| Key | Action |
|-----|--------|
| `m` | Go to matching bracket (tree-sitter) |
| `s{c}` | Surround selection with char `c` (`s"` wraps in quotes) |
| `r{from}{to}` | Replace surrounding pair char |
| `d{c}` | Delete surrounding char |
| `i{obj}` / `a{obj}` | Select **inside** / **around** object |

Objects: `w`/`W` word/WORD · `p` paragraph · `m` closest pair · any bracket/quote char for pairs (`(`, `[`, `{`, `<`, `"`, `'`, `` ` ``) · tree-sitter: `f` function, `t` class, `a` parameter, `c` comment, `T` test, `x` XML element, `g` diff change.

So `mi"` = select inside quotes, `ma(` = select around parens — same power as Vim text objects, with a visible selection.

### `z` — view (scroll only, selection untouched)
`zc`/`zz` center · `zt` top · `zb` bottom · `jm`/`k` scroll · `Z` = sticky version (stays until `Esc`).

### `Ctrl-w` — windows (splits)
| Key | Action |
|-----|--------|
| `v` / `s` | Vertical / horizontal split |
| `w` | Next window |
| `h` `j` `k` `l` | Focus left / down / up / right |
| `q` | Close window · `o` keep only this |
| `H` `J` `K` `L` | Swap window in that direction |

### `Space` — the picker menu
| Key | Opens |
|-----|-------|
| `f` / `F` | File picker (workspace root / current directory) |
| `b` | Buffer picker |
| `j` | Jumplist picker |
| `g` | Changed-file picker (git-aware) |
| `/` | Global search |
| `k` | Hover documentation (LSP) |
| `s` / `S` | Document / workspace symbols |
| `d` / `D` | Document / workspace diagnostics |
| `r` | Rename symbol · `a` code action · `h` references |
| `c` | Toggle comments |
| `y` / `p` | Yank to / paste from **system clipboard** |
| `w` | Window mode · `?` command palette |

Picker keys: `Tab`/`Shift-Tab` move · `Enter` open · `Alt-Enter` open in background · `Ctrl-s`/`Ctrl-v` open in split · `Ctrl-t` toggle preview · `Esc` close.

## 9. Buffers, files, splits

| Key / cmd | Action |
|-----------|--------|
| `hx a.py b.py` | Open both as buffers |
| `:e path` | Open file (aliases `:o`, `:open`, `:edit`) |
| `Space f` / `Space b` | Fuzzy find file / buffer |
| `:bn` / `:bp` | Next / previous buffer |
| `:bc` | Close buffer (`:bc!` force) |
| `:new` | New scratch buffer |
| `:vsplit` / `:hsplit` | Split (same as `Ctrl-w v` / `Ctrl-w s`) |
| `:cd path` | Change working directory |
| `:reload` | Reload buffer from disk (`:reload-all` for all) |

## 10. LSP, diagnostics, formatting (all built in)

| Key | Action |
|-----|--------|
| `gd` / `gy` / `gr` / `gi` | Definition / type / references / implementation |
| `]d` / `[d` | Next / previous diagnostic |
| `]D` / `[D` | Last / first diagnostic |
| `Space k` | Hover docs |
| `Space a` | Code action (lightbulb list) |
| `Space r` | Rename symbol across files |
| `Space s` / `Space S` | Symbols in document / workspace |
| `Space d` / `Space D` | Diagnostics pickers |
| `=` or `:format` | Format via LSP/formatter |
| `:lsp-workspace-command` | Run any server command |
| `:lsp-restart` | Restart crashed server |
| `]f` `[f` / `]p` `[p` | Next/prev function / paragraph (unimpaired-style) |

Language servers come from `languages.toml` — Helix auto-downloads/configures for common languages; override per-project in `.helix/` or `:config-open-workspace`.

## 11. Command mode & shell

| Cmd | Action |
|-----|--------|
| `:w` `:wq` `:q` `:q!` `:qa!` | Save / both / quit / force / quit-all force |
| `:wqa` | Write all and quit |
| `:set option value` | Set option (`:get`, `:toggle` too) |
| `:theme nord` | Switch theme |
| `:set-language rust` (`:lang`) | Force filetype |
| `:sort` `:sort reverse` `:sort insensitive` | Sort selections |
| `:earlier 5f` / `:later 5f` | Step back/forward in file history |
| `:sh echo hi` (`:!`) | Run shell command |
| `:tutor` `:config-open` `:config-reload` | Tutorial / config |
| `\|` | Pipe selections **through** command, replace with output |
| `Alt-\|` | Pipe selections into command, ignore output |
| `!` / `Alt-!` | Insert / append command output at selections |
| `$` | Keep only selections where command exits 0 |

`%` then `\|` `sort` sorts the file; `%` then `\|` `sed 's/x/y/g'` is your global replace.

## 12. Learning plan + tracker

| Phase | Do | Exit check |
|-------|----|-----------|
| 1 | `hx --tutor` start to finish | Completed without rage |
| 2 | Motions only (§4) for a day | Jump anywhere in a code file using `g w` and `f` |
| 3 | Select-then-act (§5) | Edit a paragraph without ever guessing what `d` will hit |
| 4 | Multi-selection (§6) | Rename a symbol across a file with `s` + `c` |
| 5 | Text objects + surround (§8 `m`) | `mi(` and `s"` from muscle memory |
| 6 | Pickers + search (§7, `Space`) | Navigate a repo without ever typing a path |
| 7 | LSP loop (§10) | Definition → diagnostics → rename, hands never leave home row |
| 8 | `config.toml` + `languages.toml` (§1) | Your theme/options follow you across machines |

- [ ] Phase 1 …
- [ ] Phase 4 …
- [ ] Phase 8 …

### When stuck

| Problem | Fix |
|---------|-----|
| "Keys do nothing" | `Esc` — check the mode in the status line |
| "I can't type" | You're in Normal: `i` (insert before selection) |
| "Selection looks wrong" | `Esc`/`;` collapse, or `u` — nothing was applied until you pressed a verb |
| "How do I quit without saving" | `:q!` or `:qa!` |
| "What does this key do" | `Space ?` (command palette), `:tutor`, or the [keymap reference](https://docs.helix-editor.com/keymap.html) |
| "LSP not working" | `:lsp-restart`; check `:set-language` and `languages.toml` |
| "Config change ignored" | `:config-reload`; path is `~/.config/helix/config.toml` |
| "Pasting mangled indentation" | Paste, then `=` (format), or put multi-line text via `p` from a yank (yank/paste are block-aware) |
