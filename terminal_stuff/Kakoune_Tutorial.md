---
type: learning-note
topic: Kakoune tutorial — selection-first editing, the editor that started the model
date: 2026-09-29
status: active
tags:
  - kakoune
  - modal-editing
  - tutorial
  - terminal_stuff
  - learning-plan
---

# Kakoune Tutorial — Noun First, Then Verb

> Goal: learn the editor that **invented selection-first modal editing** (Helix borrowed it wholesale). Kakoune shows you every selection before you act, keeps Vim-flavoured motions, and is scriptable down to the key — while staying a single small C++ binary with a `kakrc`.
> Related: [[Kakoune_Cheatsheet]] (quick keys), [[Helix_Tutorial]] (the descendant: same model, built-in LSP), [[Vim_Tutorial]] (the operator-first alternative), [[Tmux_Tutorial]] (Kakoune has no splits — tmux is your window manager)

## How to use this note

1. **§1–§3 once**: install, the model, survival keys.
2. **§4–§6 daily**: movements, edits, and *why selections grow* — the whole idea.
3. **§7–§9**: the multi-selection toolbox (`s`, `C`), objects, search.
4. **§10–§12**: registers/marks/macros, commands & `kakrc`, learning plan.
5. Drills: `:doc keys` (built-in docs, no browser needed), then replay every example in a scratch buffer.
6. Keep [[Kakoune_Cheatsheet]] open alongside.

---

## 1. Install

| Platform | Command |
|----------|---------|
| Debian/Ubuntu | `sudo apt install kakoune` |
| Fedora   | `sudo dnf install kakoune` |
| Arch     | `sudo pacman -S kakoune` |
| macOS    | `brew install kakoune` (if `brew` chokes, build from source or use the WSL/Linux box) |
| Windows  | no winget build — use **WSL** (`sudo apt install kakoune`) |
| Source   | [mawww/kakoune](https://github.com/mawww/kakoune): `make && sudo make install` (needs C++ toolchain) |

- Binary is **`kak`**: `kak file.py` · `kak -s mysession file.py` starts (or joins) a named session — run it twice in two terminals and you get two clients sharing buffers (`-c name` names the client, `kak -l` lists sessions).
- Config: `~/.config/kak/kakrc` — plain Kakoune script, sourced at startup; `:source path` reloads extras.
- Help is in-editor: `:doc` lists topics, `:doc keys`, `:doc keys changes`, `:doc registers`, `:doc options`.
- LSP is **not** built in — the standard companion is **kak-lsp** (a separate daemon; see §11).

## 2. The model (learn five words)

| Word | Meaning |
|------|---------|
| **Selection** | A highlighted range with a cursor at one end — *the* unit of editing |
| **Main selection** | When you have many, one is primary (marked) and receives most commands |
| **Anchor / cursor** | Selections start at the anchor and end at the cursor; motions move the cursor end |
| **Count** | Prefix a number: `3w`, `5j`, `2<a-a>b` |
| **Register** | Named list of texts (yank, search, macro, mark…) — `"<c>` picks one |

The rule: **select first, act second.** In Kakoune even a "cursor" is a 1-char selection, so `d` on a fresh open deletes the char under you — exactly what Vim's `x` would do, minus the mental stack.

> [!tip] Selections grow
> Motions act from the **end** of each selection while the anchor stays put: `w` covers the next word, another `w` grows it, `W` chains contiguously. Watch the highlight until it covers what you want — *then* press the verb. `;` collapses back to cursors; `<a-;>` flips direction. Odd for twenty minutes, obvious forever.

### Modes

| Mode | Enter with | Leave with |
|------|-----------|-----------|
| **Normal** | (home base) | — |
| **Insert** | `i` `a` `I` `A` `o` `O` | `<esc>` |
| Command prompt | `:` | `<ret>` run / `<esc>` cancel |
| Menus (goto `g`, view `v`, object menus) | one key | pick a key or `<esc>` |
| User mode | `<space>` | `<esc>` |

## 3. Survival keys

| Key | Action |
|-----|--------|
| `i` / `a` | Insert before / after selection |
| `<esc>` | Back to Normal |
| `:w` | Save |
| `:q` | Quit (blocked if modified → `:q!`) |
| `:wq` | Save and quit (`:wq!` force) |
| `:q!` | Quit without saving |
| `u` / `U` | Undo / redo |
| `:e path` (`:edit`) | Open file (`:e!` discards changes) |
| `:doc keys` | In-editor key documentation |
| `<c-c>` | Emergency: stop a hung/long command |

## 4. Movement & selection

| Key | Moves to / does |
|-----|-----------------|
| `h` `j` `k` `l` | Left / down / up / right |
| `H` `J` `K` `L` | Same, but extend the other end (shift versions) |
| `w` `b` `e` | Word forward / back / end |
| `<a-w>` `<a-b>` `<a-e>` | Same on WORDs |
| `f{c}` `t{c}` | To / till next `c` |
| `<a-f>{c}` `<a-t>{c}` | To / till previous `c` |
| `<a-.>` | Repeat last `f`/`t`/object selection |
| `m` / `M` | Next matching pair (select / extend) |
| `<a-m>` / `<a-M>` | Same, backwards |
| `%` | **Select whole buffer** |
| `<a-h>` / `<a-l>` | Line start / end (`Home`/`End` map here) |
| `<c-f>` / `<c-b>` | Page down / up |
| `<c-u>` / `<c-d>` | Half page up / down |
| `x` | Expand selection to full lines (repeat = extend down) |
| `<a-x>` | Trim selection to full lines |
| `;` | Collapse selections to cursors |
| `<a-;>` | Flip selection direction |
| `<a-:>` | Ensure selections point forward |
| `5g` | (with count) put the **anchor on line 5**, then pick from the goto menu |

Counts: `3W` = three consecutive words; `3w` = the third word ahead of the selection end; `4j` = down four lines.

## 5. Edits (verbs act on visible selections)

| Key | Action |
|-----|--------|
| `d` | Yank and **delete** selection |
| `c` | Yank, delete, enter Insert |
| `y` | Yank (copy) |
| `p` / `P` | Paste after / before selection |
| `<a-p>` / `<a-P>` | Paste all and select each pasted chunk |
| `i` / `a` | Insert before / after selection |
| `I` / `A` | Insert at start / end of the lines of each selection |
| `o` / `O` | New line below / above selection, in Insert |
| `<a-o>` / `<a-O>` | Just add an empty line below / above |
| `r{c}` | Replace every selected char with `c` |
| `R` | Replace selections with yanked text |
| `~` / `` ` `` / `<a-`>` | UPPERCASE / lowercase / swap case |
| `.` | Repeat last insert-mode change (`i`, `a`, `c` + the text) |
| `>` / `<` | Indent / unindent (`<a->` includes empty lines) |
| `<a-j>` / `<a-J>` | Join selected lines (keep / select the space) |
| `+` | Duplicate each selection |
| `&` | Align selections (insert padding to line up) |
| `<a-&>` | Copy the main selection's indent to the others |
| `_` | Trim whitespace around selections |
| `@` / `<a-@>` | Tabs → spaces / spaces → tabs |
| `u` / `U` | Undo / redo |
| `<c-j>` / `<c-k>` | Move forward / back through change history (time travel) |
| `<a-u>` / `<a-U>` | Undo / redo *selection* changes |

Recipes:

| Want | Press |
|------|-------|
| Change the word under cursor | `<a-i>` `w` then `c` |
| Delete inside quotes | `<a-a>` `Q` then `d` |
| Delete the line | `x` `d` |
| Duplicate the line | `x` then `+` |
| Comment 4 lines | `x` ×4 (select them) then `:comment-line` (runtime `comment.kak`) |

## 6. Multi-selection — the toolbox

| Key | Action |
|-----|--------|
| `s` | **Select every match of a regex** inside current selections |
| `S` | Split selections on regex matches (capture groups matter) |
| `<a-s>` | Split selections on line boundaries |
| `<a-S>` | Select first and last char of each selection |
| `<a-k>` / `<a-K>` | Keep / discard selections matching a regex |
| `$` | Pipe each selection to a shell predicate, keep exit-0 ones |
| `C` / `<a-C>` | Duplicate selection onto the next / previous line → **multi-cursor** |
| `,` / `<a-,>` | Keep only main selection / remove main selection |
| `)` / `(` | Rotate main selection forward / backward |

The signature move — rename across a file:

```
%                    select the whole buffer (s only searches *inside* selections)
s oldword <ret>      every occurrence becomes its own selection
c                    change them all at once
newword <esc>
```

## 7. Objects (Vim's text objects, minus the grammar)

| Key | Selects |
|-----|---------|
| `<a-a>` | **Whole** surrounding object (quotes included) |
| `<a-i>` | **Inner** object (quotes excluded) |
| `[` / `]` | To the start / end of the surrounding object |
| `{` / `}` | Extend to start / end of surrounding object |

Then the object key:

| Object | Meaning |
|--------|---------|
| `b` (or `(` `)`) | Parens `()` |
| `B` (or `{` `}`) | Braces `{}` |
| `r` (or `[` `]`) | Brackets `[]` |
| `a` (or `<` `>`) | Angle `<>` |
| `Q` (or `"`) | Double-quoted string |
| `q` (or `'`) | Single-quoted string |
| `g` (or `` ` ``) | Backtick string |
| `w` / `<a-w>` | Word / WORD |
| `s` / `p` | Sentence / paragraph |
| `␣` (space) | Whitespace run |
| `i` | Current indentation block |
| `n` / `u` | Number / argument |
| `c` | Custom — prompts for open/close text |

Nesting: `2<a-a>b` = the second enclosing pair. Repeat with `<a-.>`.

So: `<a-a>Q` selects the whole `"string"`, `<a-i>w` the bare word — same coverage as Vim's `a"` / `iw`, no operator grammar.

## 8. Search & replace

| Key | Action |
|-----|--------|
| `/` | Move selections to next match (prompt) |
| `<a-/>` / `?` / `<a-?>` | Previous / extend fwd / extend back |
| `n` / `<a-n>` | Next / previous match from main selection |
| `N` / `<a-N>` | **Add** next / previous match as a new selection |
| `*` | Set search pattern from selection (auto word boundaries) |
| `<a-*>` | Same, verbatim |
| `s` + regex | Turn matches into selections (then `c` = replace) |
| `\|` `sed 's/…/…/g'` | Classic shell replace on a selection |
| `%` `\|` `sort` | Sort the buffer (no `:sort` — the shell does it) |

Search history lives in the `/` register (last 100 patterns); `<c-p>`/`<c-n>` cycle it in any prompt.

## 9. Goto, view, marks, macros

### `g` — goto menu
| Key | To |
|-----|----|
| `h` / `l` / `i` | Line start / end / first non-blank |
| `g` or `k` | First line |
| `j` | Last line |
| `e` | Last char of last line |
| `t` / `c` / `b` | Top / middle / bottom of screen |
| `a` | Alternate (previous) buffer |
| `f` | Open the file named in the selection |
| `.` | Last modification position |
| `G` (with count) | Extend selection to line N |

### `v` — view menu
`v` or `c` center · `m` middle · `t` top · `b` bottom · `<`/`>` edges · `h` `j` `k` `l` scroll. `V` = **lock** view mode until `<esc>`.

### Marks (named positions, register `^`)
| Key | Action |
|-----|--------|
| `Z` | Save selections to register |
| `z` | Restore selections from register |
| `<a-z>` / `<a-Z>` | Combine saved + current (menu: append, union, intersect…) |

### Macros (register `@`)
1. `Q` — start recording.
2. Do your edits.
3. `Q` — stop.
4. `q` — replay; pick a register with `"<reg>` first (`"aQ` … `"aq`).

### Jump list
`<c-o>` back · `<c-i>` forward · `<c-s>` save a checkpoint.

## 10. Registers

Select with `"<c>` in Normal; insert with `<c-r><c>` in Insert or prompts.

| Register | Holds |
|----------|-------|
| `"` | Default yank/delete/paste |
| `/` | Search patterns (prompt history, 100) |
| `@` | Macros |
| `^` | Marks (selections) |
| `\|` | Shell command history |
| `:` | Command prompt history |
| `%` | Current buffer name |
| `.` | Current selection contents |
| `#` | Selection indices (1, 2, 3…) |
| `_` | Null register |
| `1`–`9` | Regex capture groups from last selection-making search |

## 11. Command mode & `kakrc`

| Cmd | Action |
|-----|--------|
| `:e` / `:e!` | Open file / force reload |
| `:w` / `:w!` | Write / force write |
| `:wq` / `:q` / `:q!` | Save+quit / quit / force quit |
| `:wa` / `:waq` | Write all / write all and quit |
| `:b name` `:bn` `:bp` `:db` | Switch buffer / next / prev / delete |
| `:cd dir` `:pwd` | Change / show directory |
| `:source file` | Run a Kakoune script |
| `:doc topic` (`:help`) | In-editor documentation |
| `:set global/buffer/window opt value` | Options (`:set global tabstop 4`) |
| `:map global normal <key> <keys>` | Bind keys |
| `:declare-user-mode` + `:map … user <key>` | Custom `<space>` menus |
| `:hook global BufCreate regex %{…}` | Event hooks |
| `:colorscheme name` | Theme (ships many; `~/.config/kak/colors/` adds yours) |
| `:echo` / `:reg` | Status message / set register |
| `:grep pattern files` | Grep into a jump-able `*grep*` buffer (runtime tool) |
| `:make` | Run build, jump errors (runtime tool) |
| `:kill` | Terminate the whole session |

**No splits.** Kakoune is one window per client — get panes from [[Tmux_Tutorial|tmux]], or open a second client: `kak -s mysession otherfile`.

Minimal `~/.config/kak/kakrc`:

```kak
# ~/.config/kak/kakrc — baseline
set-option global tabstop 4
set-option global indentwidth 4
set-option global scrolloff 3

colorscheme default            # :colorscheme <tab> lists the shipped themes

map global normal <c-s> ':write<ret>'
map global normal <c-q> ':quit<ret>'
# commenting: select lines, then :comment-line (runtime comment.kak)

# example hook: react to the filetype
hook global WinSetOption filetype=markdown %{
    set-option buffer indentwidth 2
}
```

Reload with `:source ~/.config/kak/kakrc`. Keep it in your dotfiles repo ([[Terminal_Fluency_Program]] Phase 0).

**LSP** (optional): install `kak-lsp`, source its `lsp.kak` from `kakrc`, point it at your config — you get `:lsp-*` commands (definition, references, hover, diagnostics, rename) plus completion. Syntax highlighting itself is regex-based (Kakoune's built-in highlighters); tree-sitter support exists only via community modules.

## 12. Learning plan + tracker

| Phase | Do | Exit check |
|-------|----|-----------|
| 1 | Open a scratch buffer; `:doc keys` skim | Quit and reopen without panic |
| 2 | Motions only (§4) for a day | Navigate code with `w e f m %` only |
| 3 | Selections grow + `;` (§4, §5) | Grow a 3-word selection, collapse, do it blind |
| 4 | Edits + `.` (§5) | Fix a paragraph with ≤2 insertions |
| 5 | Objects (§7) | `<a-a>Q` and `<a-i>w` from muscle memory |
| 6 | `s` / `C` multi-select (§6) | Rename a symbol across a file with `%` `s` `c` |
| 7 | Search, marks, macros (§8, §9) | Batch-edit a log with `Q`/`q` |
| 8 | `kakrc` + hooks + `:map` (§11) | Config loads on any box; add one custom `<space>` command |

- [ ] Phase 1 …
- [ ] Phase 5 …
- [ ] Phase 8 …

### When stuck

| Problem | Fix |
|---------|-----|
| "Keys do nothing / weird state" | `<esc>` back to Normal; check the prompt line |
| "It deleted something I didn't mean" | `u` (undo) — or `<c-k>`/`<c-j>` to travel change history |
| "I have a dozen selections I don't want" | `,` keep only main, or `;` collapse all to cursors |
| "Can't quit" | `:q!` |
| "Where are the docs?" | `:doc keys` — genuinely complete, in-editor |
| "How do I split the screen?" | You don't — use tmux ([[Tmux_Tutorial]]) or a second client: `kak -s mysession` |
| "Pasting re-indents my text" | Prefix the command with `\` to disable hooks (e.g. `\i` then paste), or `:set …` autoindent off |
| "LSP/completion missing" | Install and source kak-lsp (§11) |
