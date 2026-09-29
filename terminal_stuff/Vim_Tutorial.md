---
type: learning-note
topic: Vim tutorial — modal editing from zero to fluent
date: 2026-09-29
status: active
tags:
  - vim
  - modal-editing
  - tutorial
  - terminal_stuff
  - learning-plan
---

# Vim Tutorial — Modal Editing, From Panic to Fluency

> Goal: learn the **grammar of Vim** (operator + count + motion) so editing becomes composable instead of memorized. Vim is deliberately small, stable, and everywhere — it's preinstalled on most servers, so this skill travels with you.
> Related: [[Vim_Cheatsheet]] (quick keys), [[Neovim_Tutorial]] (the modern successor — Vim motions + Lua), [[Emacs_Tutorial]] (the other philosophy), [[HOTKEYS|HOTKEYS]]

## How to use this note

1. **§1–§3 once**: install, the modal model, survival keys.
2. **§4–§6 daily**: motions, operators, insert/visual — this is 80% of Vim.
3. **§7–§9**: files, search/replace, splits/tabs.
4. **§10–§12**: registers, macros, vimrc — the power tools.
5. Drills: `vimtutor` (built-in, 30 minutes), then replay every example in a scratch buffer.
6. Keep [[Vim_Cheatsheet]] open alongside.

---

## 1. Install

| Platform | Command |
|----------|---------|
| Windows  | `winget install Vim.Vim` (or install via scoop/Git for Windows) |
| macOS    | Preinstalled (`vim`); `brew install vim` for a newer build |
| Debian/Ubuntu | `sudo apt install vim` |
| Fedora   | `sudo dnf install vim-enhanced` |

- **Run `vimtutor` in your terminal first thing** — it's a guided 30-minute built-in course. It teaches §4–§6 of this note hands-on.
- Vim 9.x is current (vim9script is the modern script language; config still overwhelmingly uses legacy vimscript — this note uses the classic `set` style).
- Config: `~/.vimrc`.

## 2. The modal model (the whole idea)

Vim has **modes**. You're not typing — you're *issuing commands* until you say otherwise.

| Mode | Enter with | Leave with | You can… |
|------|-----------|-----------|----------|
| **Normal** | (home base) | — | Move, delete, copy, paste — commands |
| **Insert** | `i` `a` `o` `I` `A` `O` | `Esc` | Type text |
| **Visual** | `v` `V` `Ctrl-v` | `Esc` | Select text, then act on it |
| **Command-line** | `:` | `Esc` / `Enter` | Save, quit, substitute, config |
| Replace | `R` | `Esc` | Overwrite text |

The status line (bottom) tells you your mode. **If Vim seems frozen or typing does nothing weird: hit `Esc` twice and check the bottom-left corner.** Almost every "Vim is broken" moment is "I was in Normal mode" or "I never left Insert."

> [!tip] The single best habit
> `Esc` frequently, even right after editing. Return to Normal mode like returning to a safe, neutral state.

## 3. Survival keys

| Key (Normal mode) | Action |
|-------------------|--------|
| `i` | Insert before cursor |
| `a` | Insert after cursor |
| `Esc` | Back to Normal mode |
| `:w` | Save |
| `:q` | Quit (fails if unsaved: `:q!` to discard) |
| `:wq` or `ZZ` | Save and quit |
| `:q!` or `ZQ` | Quit without saving |
| `u` | Undo; `Ctrl-r` redo |
| `:help <topic>` | Help (`:help i` for insert keys) |
| `:q` from help | Close help window |

## 4. Motion (where you can land)

Every motion can stand alone (move) or be **combined with an operator** (§5) to act over the range.

### Basic
| Key | Moves to |
|-----|----------|
| `h` `j` `k` `l` | Left, down, up, right (prefer these over arrows) |
| `w` / `W` | Start of next word / WORD |
| `b` / `B` | Start of previous word / WORD |
| `e` / `E` | End of word / WORD |
| `0` | Line start |
| `^` | First non-blank character |
| `$` or `g_` | Line end / last non-blank |
| `gg` / `G` | First line / last line (`5G` = line 5, `G` alone = last) |
| `{` / `}` | Previous / next empty line (paragraph) |
| `(` / `)` | Previous / next sentence |
| `%` | Matching `()`, `[]`, `{}` — jump or (with operator) around them |

### Screen
| Key | Action |
|-----|--------|
| `Ctrl-d` / `Ctrl-u` | Half page down / up |
| `Ctrl-f` / `Ctrl-b` | Full page down / up |
| `zz` / `zt` / `zb` | Center / top / bottom current line |
| `H` / `M` / `L` | Top / middle / bottom of screen |

### Jumping precisely
| Key | Action |
|-----|--------|
| `f{c}` / `F{c}` | To next/prev occurrence of char `c` on this line |
| `t{c}` / `T{c}` | Till (just before) next/prev `c` |
| `;` / `,` | Repeat f/t forward / back |
| `gg` / `G` | File extremes; `5G` line 5 |
| `Ctrl-o` / `Ctrl-i` | Jump list: back / forward through your history |

## 5. Operators — the grammar

**Operator + motion = one verb.** Add a number for **count × object**.

```
d = delete, c = change (delete + insert), y = yank (copy)
+= next line, e = to end of word, $ = to end of line
```

| Combo | Meaning |
|-------|---------|
| `dw` | Delete to start of next word |
| `de` | Delete to end of this word |
| `d$` or `D` | Delete to end of line |
| `d0` | Delete to start of line |
| `cw` | Change word (delete it, enter Insert) |
| `ce` / `c$` | Change to end of word / line |
| `yw` / `y$` | Yank word / to end of line |
| `dj` / `dk` | Delete this line and the one below/above |
| `dG` | Delete from here to end of file |
| `dgg` | Delete from here to start of file |
| `dip` | Delete inner paragraph |
| `d%` | Delete across matched brackets |

### Line shortcuts (the doubled letters)
| Key | Action |
|-----|--------|
| `dd` | Delete whole line |
| `yy` | Yank whole line |
| `cc` | Change whole line |
| `>>` / `<<` | Indent / outdent line |
| `==` | Auto-indent line |
| `p` / `P` | Paste after / before (line-wise yanks go below/above) |
| `J` | Join this line with the next |

### Counts
`3dw` deletes 3 words. `d3w` also deletes 3 words. `2dd` cuts 2 lines. `y3e` yanks to end of 3rd word. Combine: `3d2w` = delete 6 words.

### Text objects — *the* Vim superpower
Text objects work **inside** visual mode too, and don't need a motion:

| Object | Meaning |
|--------|---------|
| `iw` / `aw` | Inner word / a word (with trailing space) |
| `is` / `as` | Inner/a sentence |
| `ip` / `ap` | Inner/a paragraph |
| `i(` `a(` `ib` `ab` | Inside parentheses / around parens incl. them |
| `i[` `a[` | Inside/around brackets |
| `i{` `a{` `iB` `aB` | Inside/around braces |
| `i"` `a"` `i'` `a'` `i\`` `a\`` | Inside/around quotes |
| `it` / `at` | Inside/around HTML/XML tag |

So: `ci"` = change inside the quotes (cursor anywhere inside them), `di(` = delete inside parens, `ya{` = yank a whole block including braces. **This one row is why people learn Vim.**

## 6. Insert mode entry points

| Key | Enters Insert… |
|-----|----------------|
| `i` | Before cursor |
| `a` | After cursor |
| `I` | Start of line (first non-blank) |
| `A` | End of line |
| `o` | New line below, cursor at start |
| `O` | New line above |
| `cw` | Where a change operator put you |
| `gi` | Last insert position |

While in Insert: `Ctrl-h` delete char, `Ctrl-w` delete word, `Ctrl-u` delete line, `Esc` escape. (Many users remap `jk` or `jj` to Esc — see §12.)

## 7. Visual mode

| Key | Selection |
|-----|-----------|
| `v` | Characterwise |
| `V` | Linewise |
| `Ctrl-v` | **Blockwise** (columnar — the multi-cursor of 1991) |
| `o` | Move to other end of selection |
| `iw` / `a"` / … | Extend by text object |
| `>` / `<` | Indent / outdent selection |
| `u` / `U` | Lowercase / UPPERCASE selection |
| `~` | Toggle case |
| `:` | Send range to command-line (e.g. `:'<,'>s/old/new/g`) |

Blockwise example: `Ctrl-v`, `3j`, `I//`, `Esc` — comment out 4 lines instantly (on old Vim add `Ctrl-v`+`j` instead of `3j` if multiline comment leaders misbehave; Neovim handles this better).

## 8. Files, buffers, windows

### Files & buffers
| Key | Action |
|-----|--------|
| `:e path` | Edit (open) file |
| `:e .` / `:Explore` | Built-in file browser (netrw) |
| `:bn` / `:bp` | Next / previous buffer |
| `:ls` | List buffers (`:b <tab>` to switch by name/number) |
| `:bd` | Delete (close) buffer |
| `:sav name` | Save-as (keeps old buffer too) |
| `:w path` | Write to another path |
| `:r file` / `:r !cmd` | Insert file / command output at cursor |

### Splits & tabs
| Key | Action |
|-----|--------|
| `:sp file` | Horizontal split |
| `:vsp file` | Vertical split |
| `Ctrl-w h/j/k/l` | Move between splits |
| `Ctrl-w H/J/K/L` | Move the current split |
| `Ctrl-w +`/`-`/`<`/`>` | Resize (or `Ctrl-w 10>` = by 10) |
| `Ctrl-w o` | Keep only this window |
| `Ctrl-w c` | Close window |
| `:tabe file` | New tab; `gt`/`gT` next/prev tab; `:tabc` close |

### Marks — named positions
| Key | Action |
|-----|--------|
| `m{a-z}` | Set mark `a`–`z` in this file |
| `'{a-z}` / `` `{a-z} `` | Jump to mark (line / exact position) |
| `''` / ``` `` ``` | Back to where you were before the last jump |
| `Ctrl-o` / `Ctrl-i` | Older/newer positions in jump list |

## 9. Search and replace

| Key | Action |
|-----|--------|
| `/pattern` | Search forward (`?` backward); `Enter` to go, `Esc` to cancel |
| `n` / `N` | Next / previous match (respect direction) |
| `*` / `#` | Search word under cursor fwd / back |
| `gd` | Go to local declaration of word under cursor |
| `:noh` | Clear search highlight |
| `:%s/old/new/g` | Replace all in file |
| `:%s/old/new/gc` | Replace with confirmation (`y/n/a/q`) |
| `:s/old/new/g` | Replace in current line |
| `:'<,'>s/old/new/g` | Replace in visual selection (the range appears for you) |
| `:g/pattern/d` | Delete every line matching pattern |
| `:g/pattern/normal @a` | Run macro `a` on every matching line |

Regex flavor: Vim's own magic mode — `\v` turns on "very magic" (Perl-like: `+`, `?`, `|` unescaped). Example: `/\v(\w+)@gmail\.com`.

## 10. Registers and macros

### Registers (Vim's clipboards)
| Key | Meaning |
|-----|---------|
| `"{a-z}` | Specify register: `"ayy` yanks line into `a`, `"ap` pastes it |
| `"+y` / `"+p` | System clipboard (needs `+clipboard` build; Neovim always has it) |
| `"_d` | Black hole — delete without clobbering a register |
| `:reg` | Show registers |
| `p` after numbered yank | Appends accumulate — `3yy` then `p` pastes 3 lines |

### Macros — record and replay
1. `qa` — start recording into register `a` (status line shows "recording").
2. Do your edits as normal (motions, operators, `:g` commands — anything).
3. `Esc q` — stop recording.
4. `@a` — replay; `@@` — replay last macro; `10@a` — replay 10 times.

```vim
" Delete all lines matching TODO:
:g/TODO/d
" Or manually: qq, perform one deletion, q, then 20@q
```

The classic combo: record once, verify, replay with a count. Chain with `:` commands and you have a batch ETL in 30 seconds.

## 11. Command-line mode you'll actually use

| Command | Action |
|---------|--------|
| `:w` `:q` `:wq` `:x` | Save / quit / both (x = only if changed) |
| `:e!` | Reload file from disk (discard changes) |
| `:set nu` / `:set nonu` | Line numbers |
| `:set relativenumber` | Relative numbers (great with counts) |
| `:syntax on` | Syntax highlighting |
| `:set hlsearch incsearch ignorecase smartcase` | Search behavior |
| `:set tabstop=4 shiftwidth=4 expandtab` | 4-space indentation |
| `:set paste` / `:set nopaste` | Paste mode — **on before pasting from elsewhere** or indentation mangles |
| `:!cmd` | Run any shell command, `Enter` returns |
| `:r !cmd` | Insert command output |
| `:%!sort` | Filter whole file through a command |
| `:vimgrep /pat/ ##` then `:copen` | Search across files (quickfix list) |
| `:col` / `:cnext` / `:cprev` | Quickfix navigation |

## 12. Your `.vimrc`

```vim
" ~/.vimrc — sensible baseline
set nocompatible
filetype plugin indent on
syntax enable

set number relativenumber          " hybrid line numbers
set cursorline                     " highlight current line
set wildmenu                       " better command-line completion
set showmatch                      " highlight matching bracket
set incsearch hlsearch ignorecase smartcase
set expandtab shiftwidth=4 softtabstop=4
set autoindent smartindent
set scrolloff=5                    " keep 5 lines of context
set mouse=a                        " mouse support (optional)
set clipboard=unnamedplus          " use system clipboard by default
set undofile                       " persistent undo across sessions
set backupdir=~/.vim/backup,~/.tmp
set directory=~/.vim/swap,~/.tmp

" Leader key — your personal prefix (space)
let mapleader = " "
nnoremap <leader>w :w<CR>
nnoremap <leader>q :q<CR>
nnoremap <leader>/ :nohlsearch<CR>

" Escape alternatives (optional)
inoremap jk <Esc>
inoremap jj <Esc>

" Stay indented after pasting
nnoremap p p`[

" Buffer navigation
nnoremap <leader>b :ls<CR>:b<Space>
```

Plugins: keep Vim vanilla at first; when you want more, `vim-plug` is the classic minimal manager:

```vim
" in .vimrc, then :PlugInstall
call plug#begin('~/.vim/plugged')
Plug 'tpope/vim-surround'      " cs"' changes surrounding quotes
Plug 'tpope/vim-commentary'    " gcc comments a line, gc{motion} an object
Plug 'tpope/vim-fugitive'      " :Git in-editor
Plug 'junegunn/fzf.vim'        " fuzzy finding
call plug#end()
```

## 13. Learning plan + tracker

| Phase | Do | Exit check |
|-------|----|-----------|
| 1 | `vimtutor` start to finish, no peeking | Complete it without rage-quitting |
| 2 | Motions only (§4) for a day — move without arrow keys | Navigate a code file to any line fast |
| 3 | Operators + counts (§5) | Edit a paragraph without entering Insert twice |
| 4 | Text objects (§5 bottom) | `ci"` and `di(` from muscle memory |
| 5 | Visual + search/replace (§7, §9) | Comment a block, rename a symbol with `%s` |
| 6 | Splits, marks, registers (§8, §10) | Open 3 files in splits, jump via marks |
| 7 | Record 3 macros (§10) | Batch-edit a log file with `@` |
| 8 | vimrc + plugins (§12) | Your config loads on any machine |

- [ ] Phase 1 …
- [ ] Phase 4 …
- [ ] Phase 8 …

### When stuck

| Problem | Fix |
|---------|-----|
| "It's not accepting input" | `Esc` — you're probably in Normal (or Operator-pending) mode |
| "It's in some weird mode" | Look at the bottom-left; `Esc` until it says nothing |
| "I deleted my file" | `:e!` reloads disk; see also `:undolist`, `:earlier 5f` |
| "Search highlight won't go away" | `:noh` |
| "Pasting ruined indentation" | `:set paste` before, `:set nopaste` after |
| "What does this key do?" | `:help {key}` — the help is genuinely good |
