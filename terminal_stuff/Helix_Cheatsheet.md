---
type: cheatsheet
topic: Helix key bindings — motions, selections, minor modes, pickers
date: 2026-09-29
status: active
tags:
  - helix
  - keybindings
  - cheatsheet
  - terminal_stuff
---

# Helix Cheatsheet

> Companion to [[Helix_Tutorial]]. Model: **select → act** — motions shape a visible selection, verbs (`d` `c` `y` …) act on it. `Esc` always returns to Normal. Prefix keys `g` `m` `z` `v` `Space` `Ctrl-w` each open a minor mode that ends after one key (or `Esc`). Reference: `hx --tutor`, `:tutor`, [docs.helix-editor.com/keymap.html](https://docs.helix-editor.com/keymap.html).

## 1. Modes & survival

| Key | Action |
|-----|--------|
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

Insert mode: `Ctrl-w` delete word back · `Ctrl-u`/`Ctrl-k` kill to line start/end · `Ctrl-h` delete char · `Ctrl-r` insert register · `Ctrl-x` completion · `Ctrl-s` undo checkpoint · `Esc` normal.

## 2. Motion

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
| `g` then `…` | Goto mode — see §6 |

## 3. Edits (verbs)

| Key | Action |
|-----|--------|
| `d` | Delete selection (yanks it) |
| `Alt-d` | Delete without yanking |
| `c` | Change — delete, enter Insert |
| `Alt-c` | Change without yanking |
| `y` | Yank (copy) |
| `p` / `P` | Paste after / before selection |
| `"` `{reg}` | Choose register for the next `y`/`d`/`p` |
| `x` | Select line; repeat to extend down |
| `X` / `Alt-x` | Extend to line bounds / shrink to line bounds |
| `r{c}` / `R` | Replace with char / replace with yanked text |
| `~` / `` ` `` / ``Alt-` `` | Toggle / lowercase / UPPERCASE |
| `J` / `Alt-J` | Join lines (Alt keeps/selected the space) |
| `>` `<` | Indent / unindent |
| `=` | Format (LSP/formatter) |
| `Ctrl-c` | Toggle comments |
| `Ctrl-a` / `Ctrl-x` | Increment / decrement number |
| `_` | Trim whitespace from selections |
| `&` | Align selections in columns |
| `Q` / `q` | Record macro to register / replay macro (experimental) |

Recipes: change word = `miw` `c` · delete in parens = `mi(` `d` · comment 5 lines = `x`×5 `Ctrl-c` · replace all = `%` `s` `old` `Enter` `c`.

## 4. Multiple selections

| Key | Action |
|-----|--------|
| `s` | Select all regex matches inside selections |
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

## 5. Search

| Key | Action |
|-----|--------|
| `/` `?` | Search forward / backward (regex) |
| `n` `N` | Next / previous match (selects it) |
| `*` / `Alt-*` | Selection as pattern (word-bounded) / verbatim |
| `Space /` | Global search across workspace (picker) |
| `Space '` | Re-open last picker |
| `\|` | Pipe selections through shell command (replace) |
| `Alt-\|` | Pipe into command, ignore output |
| `!` / `Alt-!` | Insert / append command output |
| `$` | Keep selections where command exits 0 |

## 6. Minor modes

### `g` — goto
| Key | To |
|-----|----|
| `g` | File start (`5g` + `g` = line 5) |
| `e` | File end |
| `h` / `l` | Line start / end |
| `s` | First non-blank |
| `t` / `c` / `b` | Screen top / middle / bottom |
| `d` `y` `r` `i` | LSP: definition / type / references / implementation |
| `a` / `m` | Alternate file / last modified file |
| `n` / `p` | Next / previous buffer |
| `.` | Last modification in file |
| `f` | Open file under selection |
| `w` | Two-char word labels (screen jump) |

### `m` — match, surround, objects
| Key | Action |
|-----|--------|
| `m` | Matching bracket (tree-sitter) |
| `s{c}` / `r{a}{b}` / `d{c}` | Surround add / replace / delete |
| `i{obj}` / `a{obj}` | Select inside / around object |

Objects: `w` `W` word/WORD · `p` paragraph · `m` closest pair · any bracket/quote char (`(` `[` `{` `<` `"` `'` `` ` ``) · tree-sitter: `f` function, `t` class, `a` parameter, `c` comment, `T` test, `x` XML element, `g` diff change.

### `z` — view (scroll only)
`zz`/`zc` center · `zt` top · `zb` bottom · `zj`/`zk` scroll · `Z` sticky (until `Esc`).

### `v` — select mode
Motions extend (`vw`, `vgg`, `vG`). Toggle with `Esc`. Use with `n`/`N` to accumulate search matches.

### `Ctrl-w` — windows
| Key | Action |
|-----|--------|
| `v` / `s` | Vertical / horizontal split |
| `w` | Next window · `q` close · `o` only |
| `h` `j` `k` `l` | Focus window |
| `H` `J` `K` `L` | Swap window |

### `Space` — pickers & actions
| Key | Opens |
|-----|-------|
| `f` / `F` | File picker (workspace / cwd) |
| `b` / `j` / `g` | Buffer / jumplist / changed-files picker |
| `/` | Global search · `?` command palette |
| `k` | Hover docs · `s`/`S` symbols · `d`/`D` diagnostics |
| `r` / `a` / `h` | Rename / code action / references |
| `c` | Toggle comments |
| `y` / `Y` / `p` / `P` | Yank to / paste from system clipboard |
| `w` | Window mode |

Picker: `Tab`/`Shift-Tab` move · `Enter` open · `Alt-Enter` background · `Ctrl-s`/`Ctrl-v` split · `Ctrl-t` preview · `Esc` close.

## 7. LSP & diagnostics

| Key | Action |
|-----|--------|
| `gd` `gy` `gr` `gi` | Definition / type / references / implementation |
| `]d` `[d` / `]D` `[D` | Next / prev diagnostic; last / first |
| `]f` `[f` | Next / prev function |
| `]p` `[p` | Next / prev paragraph |
| `]t` `[t` / `]c` `[c` | Next / prev type definition / comment |
| `Space k` | Hover documentation |
| `Space a` | Code action |
| `Space r` | Rename symbol |
| `=` / `:format` | Format buffer/selection |

## 8. Command mode (`:`)

| Cmd | Action |
|-----|--------|
| `:w` `:w!` `:wq`/`:x` `:wa` | Save / force / both / all |
| `:q` `:q!` `:qa` `:qa!` | Quit / force / all / all force |
| `:e file` (`:o`, `:open`, `:edit`) | Open file |
| `:bn` `:bp` `:bc` | Buffer next / prev / close |
| `:new` | New scratch buffer |
| `:vsplit`/`:vs` `:hsplit`/`:sp` | Splits |
| `:cd path` `:pwd` | Change / show directory |
| `:set option value` `:get` `:toggle` | Options |
| `:theme name` | Colorscheme |
| `:set-language rust` (`:lang`) | Force filetype |
| `:sort` `:sort reverse` `:sort insensitive` | Sort selections |
| `:earlier 5f` `:later 5f` | History versions |
| `:reload` (`:rl`) `:reload-all` | Re-read from disk |
| `:sh cmd` / `:! cmd` | Run shell command |
| `:lsp-workspace-command` `:lsp-restart` | LSP |
| `:tutor` `:config-open` `:config-reload` | Tutor / config |

Config: `~/.config/helix/config.toml`, `languages.toml`, `themes/`.

## 9. Emergency reference

| Problem | Fix |
|---------|-----|
| "Keys do nothing sensible" | `Esc` — check mode in status line |
| "It won't let me type" | You're in Normal: `i` |
| "I picked the wrong text" | Nothing happened yet — `Esc`/`;` and reselect |
| "Undo it" | `u` (history: `Alt-u`) |
| "Quit without saving" | `:q!` / `:qa!` |
| "Search jumped somewhere odd" | `Ctrl-o` back on the jumplist |
| "Selection went haywire" | `Esc` then `u` (selections undo), or `;` collapse to cursor |
| "LSP dead" | `:lsp-restart`, check `:set-language` |
| "What is this key?" | `:tutor`, `Space ?`, or the [keymap reference](https://docs.helix-editor.com/keymap.html) |
