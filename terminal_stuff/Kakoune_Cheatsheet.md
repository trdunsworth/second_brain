---
type: cheatsheet
topic: Kakoune key bindings — selections, motions, objects, multi-select
date: 2026-09-29
status: active
tags:
  - kakoune
  - keybindings
  - cheatsheet
  - terminal_stuff
---

# Kakoune Cheatsheet

> Companion to [[Kakoune_Tutorial]]. Notation: `<a-x>` = Alt+x, `<c-x>` = Ctrl+x, `<ret>` = Enter, `<esc>` = Escape, `<space>` = Spacebar. Model: **select → act** — motions shape visible selections, verbs (`d` `c` `y` …) act on them. In doubt: `:doc keys`, `:doc keys changes`, `:doc registers` (in-editor docs).

## 1. Modes & survival

| Key | Action |
|-----|--------|
| `<esc>` | Normal mode (home) |
| `i` / `a` | Insert before / after selection |
| `I` / `A` | Insert at start / end of each selection's line |
| `o` / `O` | New line below / above, in Insert |
| `<a-o>` / `<a-O>` | Add empty line below / above (stay Normal) |
| `:` | Command prompt (`<ret>` run, `<esc>` cancel) |
| `<space>` | User mode (your/plugin's custom commands) |
| `:w` `:q` `:wq` | Save / quit / both |
| `:q!` `:wq!` | Force quit / force save+quit |
| `u` / `U` | Undo / redo |
| `<c-c>` | Cancel a long-running operation (cannot be remapped) |
| `<a-;>` | Run **one** Normal command from Insert/prompt |

Insert completion: `<c-n>`/`<c-p>` cycle · `<c-x>` then `f` file / `w` word / `W` all-buffers word / `l` line · `<c-o>` toggle auto · `<c-r>` insert register · `<c-v>` literal key · `<c-u>` group undo.

## 2. Movement & selection

| Key | To / does |
|-----|-----------|
| `h` `j` `k` `l` | Left / down / up / right |
| `H` `J` `K` `L` | Same, extending the selection's other end |
| `w` `b` `e` | Word forward / back / end |
| `<a-w>` `<a-b>` `<a-e>` | WORD versions (whitespace-delimited) |
| `f{c}` `t{c}` | To / till next `c` |
| `<a-f>{c}` `<a-t>{c}` | To / till previous `c` |
| `<a-.>` | Repeat last `f`/`t`/object selection |
| `m` / `M` | Next matching pair: select / extend |
| `<a-m>` / `<a-M>` | Same, backwards |
| `%` | Select whole buffer |
| `<a-h>` / `<a-l>` | Line start / end (`Home` / `End`) |
| `<c-f>` / `<c-b>` | Page down / up |
| `<c-u>` / `<c-d>` | Half page up / down |
| `x` | Expand to full lines (repeat = extend down) |
| `<a-x>` | Trim selection to full lines |
| `;` | Collapse selections to cursors |
| `<a-;>` | Flip selection direction |
| `<a-:>` | Force selections forward |
| `_` | Unselect whitespace around selections |
| counts | `3w` `4j` `3W` (3 consecutive words) `2<a-a>b` |

## 3. Edits (verbs)

| Key | Action |
|-----|--------|
| `d` | Yank + delete selection |
| `c` | Yank + delete + Insert |
| `y` | Yank (copy) |
| `p` / `P` | Paste after / before selection |
| `<a-p>` / `<a-P>` | Paste all, selecting each paste |
| `r{c}` | Replace selection with char `c` |
| `R` | Replace selection with yanked text |
| `~` / `` ` `` / `<a-`>` | UPPER / lower / swap case |
| `.` | Repeat last insert change (`i`/`a`/`c` + typed text) |
| `>` / `<` | Indent / unindent (`<a->` indent incl. empty lines) |
| `<a-j>` / `<a-J>` | Join lines / join and select the space |
| `+` | Duplicate selection |
| `&` | Align selections in columns |
| `<a-&>` | Copy main selection's indent to the rest |
| `@` / `<a-@>` | Tabs → spaces / spaces → tabs |
| `u` / `U` | Undo / redo |
| `<c-j>` / `<c-k>` | Change history forward / back |
| `<a-u>` / `<a-U>` | Undo / redo selection changes |
| `\` prefix | Run next command with hooks disabled (paste-safe) |

Recipes: change word = `<a-i>w` `c` · delete in quotes = `<a-a>Q` `d` · delete line = `x` `d` · duplicate line = `x` `+` · comment lines = select + `:comment-line`.

## 4. Multi-selection toolbox

| Key | Action |
|-----|--------|
| `s` | Select every regex match **inside** current selections |
| `S` | Split selections on regex (captures work) |
| `<a-s>` | Split on line boundaries |
| `<a-S>` | Select first + last char of each selection |
| `<a-k>` / `<a-K>` | Keep / drop selections matching regex |
| `$` | Keep selections where shell command exits 0 |
| `C` / `<a-C>` | Copy selection to next / previous line (multi-cursor) |
| `,` / `<a-,>` | Keep main selection only / drop main selection |
| `)` / `(` | Rotate main selection forward / back |

Replace everywhere: `%` `s` `old` `<ret>` `c` `new` `<esc>`.

## 5. Objects (`<a-a>` whole, `<a-i>` inner)

| Then key | Object |
|----------|--------|
| `b` `(` `)` | Parens |
| `B` `{` `}` | Braces |
| `r` `[` `]` | Brackets |
| `a` `<` `>` | Angle brackets |
| `Q` `"` | Double-quoted string |
| `q` `'` | Single-quoted string |
| `g` `` ` `` | Backtick string |
| `w` / `<a-w>` | Word / WORD |
| `s` / `p` | Sentence / paragraph |
| `<space>` | Whitespace run |
| `i` | Indent block |
| `n` / `u` | Number / argument |
| `c` | Custom (prompts open/close) |

Range keys after an object trigger: `[` `]` = to start / end · `{` `}` = extend to start / end. Nest: `2<a-a>b` · repeat: `<a-.>`.

## 6. Search

| Key | Action |
|-----|--------|
| `/` | Next match (moves selections; prompt) |
| `<a-/>` | Previous match |
| `?` / `<a-?>` | Extend to next / previous match |
| `n` / `<a-n>` | Next / previous from main selection |
| `N` / `<a-N>` | Add next / previous match as a new selection |
| `*` / `<a-*>` | Pattern from selection (word-bounded) / verbatim |
| `<c-p>` / `<c-n>` | History in any prompt |

## 7. Registers, marks, macros, jumps

| Keys | Action |
|------|--------|
| `"<c>` | Select register (`"ay` yank to `a`, `"ap` paste from `a`) |
| `<c-r><c>` | Insert register (Insert/prompt) |
| `Z` / `z` | Save / restore selections (register `^`) |
| `<a-z>` / `<a-Z>` | Combine saved + current (menu: append/union/intersect…) |
| `Q` / `Q` | Start / stop macro recording (register `@`) |
| `q` | Replay macro (`"aq` records into `a`) |
| `<c-o>` / `<c-i>` | Jump list back / forward |
| `<c-s>` | Save a jump checkpoint |

Register map: `"` yank · `/` search history · `@` macros · `^` marks · `\|` shell history · `:` command history · `%` buffer name · `.` current selection · `#` selection indices · `_` null · `1`–`9` regex captures.

## 8. Menus

### `g` — goto
| Key | To |
|-----|----|
| `h` `l` `i` | Line start / end / first non-blank |
| `g` or `k` | First line |
| `j` | Last line |
| `e` | Last char of last line |
| `t` `c` `b` | Screen top / middle / bottom |
| `a` | Alternate buffer |
| `f` | Open file named in selection |
| `.` | Last modification position |
| `G` + count | Extend selection to line N |

### `v` — view
`v`/`c` center · `m` middle · `t` top · `b` bottom · `<`/`>` edges · `h` `j` `k` `l` scroll · `V` lock view (until `<esc>`).

## 9. Command mode (`:`)

| Cmd | Action |
|-----|--------|
| `:e` / `:e!` | Open file / force reload from disk |
| `:w` / `:w!` / `:wa` | Write / force / write all |
| `:wq` / `:q` / `:q!` | Save+quit / quit / force quit |
| `:waq` | Write all + quit |
| `:b n` `:bn` `:bp` `:db` | Buffer next/prev/delete |
| `:cd dir` `:pwd` | Change / show directory |
| `:source file` | Run a Kakoune script |
| `:doc topic` (`:help`) | In-editor documentation |
| `:set global/buffer/window opt val` | Options |
| `:map global normal <key> <keys>` | Bind keys |
| `:map global user <key> <keys>` | User-mode (`<space>`) bindings |
| `:declare-user-mode name` | New user mode |
| `:hook global <Hook> filter %{…}` | Event hooks |
| `:colorscheme name` | Theme |
| `:echo` / `:reg` | Message / set register |
| `:grep pattern files` | Grep into jump-able buffer (runtime) |
| `:make` | Build + error jump (runtime) |
| `:kill` | End the whole session |

Config: `~/.config/kak/kakrc` · no splits — use tmux ([[Tmux_Tutorial]]) or `kak -s session` clients · LSP via **kak-lsp**.

## 10. Emergency reference

| Problem | Fix |
|---------|-----|
| "Keys do nothing sensible" | `<esc>` — check the prompt/status line |
| "Too many selections" | `,` keep main only, or `;` collapse to cursors |
| "Wrong edit happened" | `u`, or `<c-k>` back through change history |
| "Selection grew weirdly" | `<a-;>` flip direction, `;` collapse |
| "Can't quit" | `:q!` |
| "Hung on a regex/command" | `<c-c>` (cancel), `<c-g>` (clear pending input) |
| "What does this key do?" | `:doc keys`, `:doc keys changes`, `:doc modes` |
| "Pasting mangled indentation" | Prefix command with `\` (hooks off) |
| "Need a pane" | tmux — Kakoune has no windows/splits |
