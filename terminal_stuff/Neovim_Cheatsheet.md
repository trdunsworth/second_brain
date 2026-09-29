---
type: cheatsheet
topic: Neovim key bindings, commands, and Lua API essentials
date: 2026-09-29
status: active
tags:
  - neovim
  - lua
  - keybindings
  - cheatsheet
  - terminal_stuff
---

# Neovim Cheatsheet

> Companion to [[Neovim_Tutorial]]. Includes core Vim keys (see [[Vim_Cheatsheet]] for full motion/operator detail), Neovim built-ins, LSP keys, and lazy.nvim/Mason commands. Leader `<leader>` = **Space** by convention. `:checkhealth` for everything.

## 1. Modes & survival

| Key | Action |
|-----|--------|
| `Esc` | Normal mode |
| `i` `a` `I` `A` `o` `O` | Insert entries |
| `v` `V` `Ctrl-v` | Visual char / line / block |
| `:` | Command-line |
| `:q` `:w` `:wq` `:x` | Quit / save / both |
| `u` / `Ctrl-r` | Undo / redo |
| `:checkhealth` | Diagnose install/plugins/LSP |
| `:h nvim` `:Intro` | Neovim help / welcome |

## 2. Motions, operators, text objects (Vim core)

| Keys | Action |
|------|--------|
| `h j k l` `w b e` `0 ^ $` `gg G` | Basic motion |
| `f{c}` `t{c}` `;` `,` `%` | On-line find / match bracket |
| `{ } ( )` `H M L` `Ctrl-d/u/f/b` | Paragraphs, screen, pages |
| `d/c/y` + motion | Operators: delete/change/yank |
| `dd` `cc` `yy` `>>` `<<` `J` `p` | Whole-line ops, paste, join |
| `3dw` `d3w` `2dd` | Counts |
| `ci"` `di(` `yiB` `dap` `yiw` | Text objects |
| `Ctrl-o` `Ctrl-i` `'a` `` `a `` | Jump list / marks |
| `/pat` `n` `*` `:%s///g` `:noh` | Search & replace |
| `qa`…`q` `@a` `10@a` | Macros |
| `"+y` `"+p` | System clipboard |
| `gv` `>` `<` in visual | Reselect, indent |

## 3. Windows, buffers, tabs

| Key | Action |
|-----|--------|
| `:sp` / `:vsp` | Split horiz / vert |
| `Ctrl-w h/j/k/l` or `<C-h/j/k/l>`* | Move between windows |
| `Ctrl-w H/J/K/L` | Move window to edge |
| `Ctrl-w +/-/</>` | Resize |
| `Ctrl-w o` / `Ctrl-w c` | Only / close |
| `:bn` `:bp` `:b {name}` `:bd` | Buffers |
| `:ls` | Buffer list |
| `:tabe` `gt` `gT` `:tabc` | Tabs |
| `:e {file}` `:e .` | Open file / netrw |
| `:terminal` (`:term`) | Terminal in a window |
| `C-\ C-n` (term) | Terminal → Normal mode |
| `:lua vim.print(vim.o.number)` | Inspect option |

\* if you add the §Neovim_Tutorial keymaps.

## 4. Lua config essentials

| Expression | Meaning |
|------------|---------|
| `vim.opt.x = v` | `:set x=v` |
| `vim.g.leader = " "` | `:let mapleader` |
| `vim.keymap.set("n", lhs, rhs, {desc=})` | `:nnoremap` with description |
| `vim.api.nvim_*` | Raw API (create autocmds, windows…) |
| `require("mod")` | Import `lua/mod(.lua)` |
| `vim.cmd("…")` | Run ex command |
| `vim.fn.…` | Vimscript functions |
| `vim.inspect(t)` / `vim.print(t)` | Dump table to messages |
| `:luafile %` | Reload current file |
| `:help vim` / `:h lua-guide` | API docs |

File layout: `init.lua` → `lua/{options,keymaps,autocmds}.lua` + `lua/plugins/*.lua`.

## 5. LSP (buffer-local when attached)

| Key | Action |
|-----|--------|
| `gd` / `gD` | Definition / declaration |
| `gr` | References |
| `gI` | Implementation |
| `K` | Hover documentation |
| `<C-k>` | Signature help |
| `<leader>rn` | Rename symbol |
| `<leader>ca` | Code action |
| `]d` / `[d` | Next / prev diagnostic |
| `<leader>e` (default `vim.diagnostic.open_float`) | Diagnostic float |
| `:LspInfo` / `:checkhealth vim.lsp` | Attachment status |
| `:lua vim.diagnostic.setloclist()` | Fill loclist with diagnostics |

## 6. Plugin manager (lazy.nvim)

| Command | Action |
|---------|--------|
| `:Lazy` | Plugin UI |
| `:Lazy sync` | Install + update + clean |
| `:Lazy update` / `:Lazy restore` | Update plugins / return to lockfile |
| `:Lazy check` / `:Lazy log` | Preview updates / history |
| `:Lazy profile` | Startup time breakdown |
| `:Lazy root` / `:Lazy dir` | Plugin path info |
| `:checkhealth lazy` | Manager health |
| `nvim --headless "+Lazy! sync" +qa` | Headless update (CI) |

Spec anatomy:

```lua
return {
  "author/repo",
  event = "BufReadPre",     -- lazy-load triggers: event, cmd, ft, keys
  dependencies = { "…" },
  opts = { … },             -- passed to setup (if config = true)
  config = function(_, opts) … end,
}
```

## 7. Mason (servers/tools) & Treesitter

| Command | Action |
|---------|--------|
| `:Mason` | Installer UI (LSP, formatters, linters) |
| `:MasonInstall {name}` | Install one tool |
| `:MasonUpdate` | Update registry |
| `:TSInstall {lang}` | Install a parser |
| `:TSUpdate` | Rebuild all parsers |
| `:TSInfo` | Parser status |
| `:ConformInfo` | Which formatter runs on this file |
| `:Lazy reload {plugin}` | Reload one plugin |

## 8. Telescope (if installed — defaults)

| Key | Action |
|-----|--------|
| `<leader>ff` | Find files |
| `<leader>fg` | Live grep (needs ripgrep) |
| `<leader>fb` | Buffers |
| `<leader>fh` | Help tags |
| `<leader>fr` | Recent files |
| `<leader>sw` (in visual/word) | Grep selection/word |
| `<Tab>` / `<S-Tab>` | Mark files → open in quickfix |
| `<C-q>` | Send marked to quickfix |
| `?` | Normal-mode help in picker |

## 9. Everyday commands

| Command | Action |
|---------|--------|
| `:w` `:e!` `:sav` | Save / reload from disk / save-as |
| `:%!sort` | Filter file through shell |
| `:r !cmd` | Insert command output |
| `:g/pat/d` | Delete matching lines |
| `:s/a/b/gc` (+`:'<,'>` from visual) | Substitute |
| `:noh` | Clear search highlight |
| `"+y` / `"+p` | System clipboard (always available in Neovim) |
| `:mksession session.vim` / `source` | Save/restore window layout |
| `:recover` | Recover from swap after crash |
| `:hi` / `:so $VIMRUNTIME/syntax/hitest.vim` | Inspect highlight groups |
| `:verbose set expandtab?` | Which config set this option? |
| `:version` / `:reg` | Version / registers |

## 10. NVIM_APPNAME — parallel configs

```bash
nvim                                  # default: ~/.config/nvim
NVIM_APPNAME=nvim-flat nvim           # ~/.config/nvim-flat + its own data dir
NVIM_APPNAME=nvim-lazyman lazyman -E LazyVim   # Lazyman-style switching
```
Windows PowerShell: `$env:NVIM_APPNAME="nvim-flat"; nvim`
Config path check: `:echo stdpath('config')`.

## 11. Emergency reference

| Problem | Fix |
|---------|-----|
| Anything unexpected | `:checkhealth`, then `:messages` |
| Plugin install failed | `:Lazy sync`; network/proxy; check `data/lazy/` perms |
| LSP not working | `:LspInfo` → attached? → server installed? → configured? |
| Config won't load | `nvim --clean` (bypass config), fix `lua/` requires |
| Broken update | `:Lazy restore` (lockfile rollback), pin commit in spec |
| Slow start | `:Lazy profile`; lazy-load by `event`/`ft`/`cmd` |
| Icons are boxes | Install a Nerd Font; set it in terminal emulator |
| Terminal keys swallowed | `C-\ C-n` to Normal, `C-w`+motion to leave terminal window |
