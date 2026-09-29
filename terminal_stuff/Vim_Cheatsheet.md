---
type: cheatsheet
topic: Vim key bindings — motions, operators, text objects
date: 2026-09-29
status: active
tags:
  - vim
  - keybindings
  - cheatsheet
  - terminal_stuff
---

# Vim Cheatsheet

> Companion to [[Vim_Tutorial]]. Grammar: **[count] operator [count] motion** → `d2w` = delete 2 words. Text objects (`iw`, `a(`, …) replace motions wherever an object is wanted. `Esc` always returns to Normal mode. Help: `:help {key}`.

## 1. Modes

| Key | Mode |
|-----|------|
| `Esc` | Normal (home) |
| `i` `a` `I` `A` `o` `O` | Insert (before / after / line start / line end / new line below/above) |
| `R` | Replace (overwrite) |
| `v` `V` `Ctrl-v` | Visual (char / line / block) |
| `:` | Command-line |
| `gh` `gQ` | Select / Ex mode (rare) |

## 2. Motions

### Words & lines
| Key | To |
|-----|----|
| `h` `j` `k` `l` | Left / down / up / right |
| `w` / `W` | Next word / WORD start |
| `b` / `B` | Previous word / WORD start |
| `e` / `E` | Word / WORD end |
| `0` / `^` / `$` / `g_` | Line start / first non-blank / line end / last non-blank |
| `{` / `}` | Paragraph (blank line) back / forward |
| `(` / `)` | Sentence back / forward |
| `9j` etc. | Counts: any motion takes a count (`5w`, `12j`) |

### File & screen
| Key | To |
|-----|----|
| `gg` / `G` / `5G` / `H` `M` `L` | File start / end / line 5 / screen top-mid-bottom |
| `Ctrl-d` / `Ctrl-u` | Half page down / up |
| `Ctrl-f` / `Ctrl-b` | Full page down / up |
| `zz` / `zt` / `zb` | Center / top / bottom this line |
| `Ctrl-o` / `Ctrl-i` | Jump list back / forward |
| `'a` / `` `a `` | Mark `a` (line / exact spot); `''`/``` `` ``` = previous |

### On a line
| Key | To |
|-----|----|
| `f{c}` / `F{c}` | To char `c` forward / back |
| `t{c}` / `T{c}` | Till before char `c` |
| `;` / `,` | Repeat / reverse f,t |
| `%` | Matched bracket |
| `ge` / `gE` | Backward word end |

## 3. Operators

| Op | Meaning |
|----|---------|
| `d` | Delete (into register) |
| `c` | Change — delete and enter Insert |
| `y` | Yank (copy) |
| `>` `<` | Indent / outdent |
| `=` | Auto-indent |
| `!` | Filter through command |
| `gq` | Format text to `textwidth` |
| `gu` / `gU` | Lowercase / UPPERCASE (`guu`, `gUw`, `gUiw`) |
| `~` | Toggle case |

Common combos:

| Combo | Effect |
|-------|--------|
| `dw` `de` `d$` `d0` | Delete word / to word end / to EOL / to BOL |
| `cw` `ce` `c$` | Change word / to word end / to EOL |
| `dd` `yy` `cc` | Whole line |
| `dj` `dk` | Line + line below/above |
| `dG` `dgg` | To file end / start |
| `dap` `dip` | Around / inside paragraph |
| `d%` | Across matched brackets |
| `p` `P` | Paste after / before |
| `J` | Join with next line |
| `>>` `<<` | Indent / outdent line |
| `3dd` `2yw` `4gg` | Counts anywhere: `3dw`, `d3w`, `2daw` |

## 4. Text objects (use after any operator, or in Visual)

| Object | Meaning |
|--------|---------|
| `iw` `aw` | Inner / a word |
| `is` `as` | Inner / a sentence |
| `ip` `ap` | Inner / a paragraph |
| `i(` `a(` `ib` `ab` | In / around parens |
| `i[` `a[` `i{` `a{` `iB` `aB` | In / around brackets or braces |
| `i"` `a"` `i'` `a'` `` i` `` `` a` `` | In / around quotes |
| `it` `at` | In / around tag (`<p>…</p>`) |
| `gn` | Next search match (as object: `cgn` edits it, `.` repeats) |

Power moves: `ci"` change inside quotes · `di(` delete inside parens · `yiB` yank a block · `va)` select around parens · `gUiw` UPPERCASE word.

## 5. Insert mode

| Key | Action |
|-----|--------|
| `Esc` | To Normal |
| `Ctrl-h` | Delete previous char |
| `Ctrl-w` | Delete previous word |
| `Ctrl-u` | Delete to line start |
| `Ctrl-r {reg}` | Insert register content |
| `Ctrl-o` | One Normal command then back |
| `Ctrl-x Ctrl-o` | Omni completion |
| `Ctrl-n` / `Ctrl-p` | Keyword completion next / prev |

## 6. Visual mode

| Key | Action |
|-----|--------|
| `v` / `V` / `Ctrl-v` | Char / line / block selection |
| `o` | Other end of selection |
| `iw` `a"` `ap` … | Extend by text object |
| `>` `<` `=` | Indent / outdent / reindent |
| `u` `U` `~` | Lower / UPPER / toggle case |
| `:` then `s/…/…/g` | Substitute in selection |
| `y` `d` `c` | Yank / delete / change selection |
| `gv` | Reselect last visual selection |

Block edit: `Ctrl-v` → `j j j` → `I// ` → `Esc` = comment out instantly.

## 7. Search & replace

| Key | Action |
|-----|--------|
| `/pat` `?pat` | Search fwd / back |
| `n` `N` | Next / previous match |
| `*` `#` | Word under cursor fwd / back |
| `gn` | Next match as text object (edit repeatedly: `cgn` then `.`) |
| `:noh` | Clear highlight |
| `:%s/old/new/g` | Replace all in file |
| `:%s/old/new/gc` | Confirm each |
| `:s/old/new/g` | Current line |
| `:'<,'>s/old/new/g` | Visual selection (auto-filled) |
| `:%s/\v.../…/g` | Very-magic regex (Perl-like) |
| `:g/pat/d` | Delete matching lines |
| `:g/pat/y A` | Append matching lines to register `a` |
| `:v/pat/d` | Delete non-matching lines |
| `:grep pat **/*` + `:copen` | Multi-file search (quickfix) |

## 8. Files, buffers, windows, tabs

| Key | Action |
|-----|--------|
| `:e file` | Open file |
| `:e .` | File browser (netrw) |
| `:w` `:w file` `:sav file` | Save / save-as / save-as-keep |
| `:x` `ZZ` | Save and quit (if changed) |
| `:q` `:q!` `ZQ` | Quit / force quit |
| `:e!` | Reload file, discard changes |
| `:bn` `:bp` `:b N` `:bd` | Buffer next/prev/by number/close |
| `:ls` | List buffers |
| `:sp` `:vsp` | Split horiz / vert |
| `Ctrl-w h/j/k/l` | Move between windows |
| `Ctrl-w H/J/K/L` | Move window to far edge |
| `Ctrl-w +/-/</>` `Ctrl-w 10>` | Resize |
| `Ctrl-w o` `Ctrl-w c` | Only window / close window |
| `:tabe` `gt` `gT` `:tabc` | New tab / next / prev / close |
| `:r file` `:r !cmd` | Insert file / command output |

## 9. Registers & macros

| Key | Action |
|-----|--------|
| `"{reg}` | Use register: `"ayy`, `"ap`, `"Ayy` (append to `a`) |
| `"+y` `"+p` | System clipboard |
| `"_d` | Black hole (delete, keep registers) |
| `:reg` | Show registers |
| `qa` … `q` | Record macro into `a` |
| `@a` `@@` `10@a` | Replay macro / last / ten times |
| `:g/pat/normal @a` | Run macro on every match |

## 10. Command-line essentials

| Cmd | Action |
|-----|--------|
| `:set nu` `:set nonu` | Line numbers |
| `:set rnu` | Relative numbers |
| `:set paste` / `nopaste` | Paste-safe mode |
| `:set expandtab ts=4 sw=4 sts=4` | 4-space indent |
| `:syntax on` | Highlighting |
| `:noh` | Kill search highlight |
| `:!cmd` | Shell escape |
| `:%!sort` | Filter file through command |
| `:h topic` / `:h gui-keys` | Help |
| `:earlier 5f` / `:later 5f` | Undo/redo through file versions |
| `:s/x/y/` on range | See Search above |
| `:normal @{reg}` | Run macro as a command |

## 11. Operator-pending chart (cheat by row)

```
         w/e/b/0/$/G/gg/{/}/fX/%   ← motions
   d  c  y  >  <  =                 ← operators
   dd cc yy >> << ==                ← doubled = whole line
   d  +  text object (iw, a(, …)    ← objects
   count anywhere: 3dw, d3w, 2dap
```

## 12. Emergency reference

| Problem | Fix |
|---------|-----|
| "Typing does nothing sensible" | `Esc` — check mode in status line |
| "It says —NORMAL—" and won't type | You're in Normal; press `i` to type |
| "Weird `d`/`y` pending state" | `Esc` cancels an operator in progress |
| "I broke the file" | `:e!` from disk, or `u` / `:undolist` |
| "Search won't stop highlighting" | `:noh` |
| "Mangled paste" | `:set paste` → paste → `:set nopaste` |
| "What was that key?" | `:help {key}` |
