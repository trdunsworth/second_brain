---
type: learning-note
topic: Neovim tutorial — Vim motions, Lua config, LSP, plugins
date: 2026-09-29
status: active
tags:
  - neovim
  - lua
  - lsp
  - modal-editing
  - tutorial
  - terminal_stuff
  - learning-plan
---

# Neovim Tutorial — Vim's Motions, Modern's Internals

> Goal: use Neovim as a daily driver — **Vim editing skills first**, then the three things that make Neovim *Neovim*: **Lua config, built-in LSP, and lazy.nvim plugins**. By §9 you'll have a working personal config; by §11 you'll know which distro to borrow from (or none).
> Related: [[Neovim_Cheatsheet]] (quick keys), [[Neovim_Distributions]] (LazyVim/NvChad/AstroNvim/Lazyman comparison), [[Vim_Tutorial]] (motion fundamentals), [[Emacs_Tutorial]] (the other path), [[Tmux_Tutorial]] / [[Linux_Terminal_Toolkit]] (terminal environment)

## How to use this note

1. **Already know Vim?** Skim §1–§3 and jump to §5 (what's different) — you already own §4.
2. **Vim newcomer?** Do [[Vim_Tutorial]] §1–§7 first; this note assumes those motions.
3. **§5–§8**: config, Lua, LSP, plugins — the Neovim value proposition.
4. **§9**: build a minimal config by hand (2 hours, worth it).
5. **§10**: daily workflows. **§11** links to [[Neovim_Distributions]] for the "I don't want to build it myself" path.

---

## 1. Install

| Platform | Command |
|----------|---------|
| Windows  | `winget install Neovim.Neovim` (or `scoop install neovim`) |
| macOS    | `brew install neovim` |
| Debian/Ubuntu | `sudo apt install neovim` — often stale; prefer the official appimage/nightly or `snap install neovim --classic` for current |
| Fedora   | `sudo dnf install neovim` |

- **Current stable: Neovim 0.11.x** (0.10 introduced `vim.lsp` consolidation; 0.11 brought `vim.lsp.config`/`enable` style server setup). Distro minimums differ — LazyVim wants ≥ 0.11.2; see [[Neovim_Distributions]].
- Check: `nvim --version`. Health check inside: `:checkhealth` (run this whenever something is weird — it's the first diagnostic, always).
- Optional but recommended everywhere: a **Nerd Font** patched for icons (e.g. JetBrainsMono Nerd Font), `git`, and `ripgrep` (for fuzzy grep pickers).

### Config locations
| OS | Config dir |
|----|-----------|
| Linux/macOS | `~/.config/nvim` |
| Windows | `~\AppData\Local\nvim` |
| Any | `:echo stdpath('config')` — the authoritative answer |

State/data: `stdpath('state')`, `stdpath('data')` (plugins live in `data/lazy/…`). `NVIM_APPNAME=nvim-test nvim` runs with a separate config/data set named `nvim-test` — see §10.3.

## 2. What Neovim gives you that Vim doesn't

| Feature | Detail |
|---------|--------|
| **Lua config** | First-class Lua (`init.lua`), faster and less awkward than vimscript; `vim.*` API everywhere |
| **Built-in LSP client** | Language servers with diagnostics, go-to-definition, hover, rename, code actions — no plugin needed for the client (you pick servers + a UI) |
| **Treesitter** | Real parser-based highlighting, indentation, text objects (`af`/`if` for functions, blocks) |
| **better defaults** | `defaults.txt`, sane options, `:h  news` lists the deltas |
| **Async everything** | Jobs, timers, LSP I/O never block the UI |
| **Terminal** | Embedded terminal (`:terminal`) with real window/pane behavior |
| **Clipboard** | System clipboard always built in (`"+y`) |
| **Headless** | `nvim --headless "+Lazy! sync" +qa` — scriptable for CI/updates |
| Extensibility | Every feature is an API you can call from Lua |

Vim compatibility is strong: your `vimrc` works (legacy support), most plugins port.

## 3. First 15 minutes

```bash
nvim file.txt          # open a file
:checkhealth           # verify installation
:help nvim             # Neovim-specific help
```

- All [[Vim_Cheatsheet|Vim keys]] work: modes, motions, operators, text objects, macros, registers, splits.
- `:term` opens a terminal in a window (`C-w` + hjkl to leave it, `exit` to close, `C-\ C-n` to Normal mode).
- `:Intro` / `:Manual` — welcome and manual.

> [!tip] Order of learning
> Editing skill (Vim) ≫ configuration skill (Lua) ≫ ecosystem skill (plugins). People who skip to step 3 get a cockpit with no pilot. Do the motions first.

## 4. Editing refresher (from the Vim cheatsheet)

The essentials you'll use hourly — full detail in [[Vim_Cheatsheet]]:

- **Grammar**: `d/c/y` + motion; counts multiply (`3dw`); text objects replace motions (`ci"`, `dap`, `yiw`).
- **Insert entry**: `i a I A o O`, change ops drop you in (`cw`).
- **Visual**: `v V Ctrl-v` block edits; `>` indent.
- **Search**: `/`, `*`, `n`, `:%s///g`, `gn`+`.` repeat-edit.
- **Files**: `:e`, `:w`, splits `:vsp`/`:sp`, `C-w` navigation.
- **Registers/macros**: `"ayy`, `qa…q`, `@a`.

### Neovim-flavored additions to your motion set
| Key | Action |
|-----|--------|
| `]d` / `[d` | Next/prev diagnostic (with LSP attached!) |
| `gd` / `gD` | Go to definition (LSP) or local declaration |
| `K` | Hover docs (LSP) — in help buffers opens help |
| `gr` | References (LSP) |
| `ciw`+Treesitter | Treesitter text objects (`af`/`if` around/inner function) if installed |

## 5. The config: `init.lua`

Neovim reads `init.lua` (or legacy `init.vim`) from the config dir. Structure it like this from day one:

```
~/.config/nvim/
├── init.lua                 -- entry point, loads everything
└── lua/
    ├── options.lua          -- vim.opt settings
    ├── keymaps.lua          -- vim.keymap.set
    ├── autocmds.lua         -- autocmds
    └── plugins/             -- one file per plugin/topic (lazy.nvim)
        ├── lsp.lua
        ├── treesitter.lua
        └── ui.lua
```

```lua
-- init.lua
require("options")
require("keymaps")
require("autocmds")
require("config.lazy")        -- §7; remove until you add plugins
```

```lua
-- lua/options.lua
local opt = vim.opt
opt.number = true
opt.relativenumber = true
opt.signcolumn = "yes"
opt.expandtab = true
opt.shiftwidth = 2
opt.tabstop = 2
opt.smartcase = true
opt.undofile = true          -- persistent undo
opt.ignorecase = true
opt.updatetime = 250
opt.clipboard = "unnamedplus" -- system clipboard
opt.splitright = true
opt.scrolloff = 5
```

```lua
-- lua/keymaps.lua
local map = vim.keymap.set
map("n", "<leader>w", ":write<CR>", { desc = "Save" })
map("n", "<leader>q", ":quit<CR>", { desc = "Quit" })
map("n", "<leader>/", ":nohlsearch<CR>", { desc = "Clear search" })
-- window navigation without <C-w> prefix
map("n", "<C-h>", "<C-w>h")
map("n", "<C-j>", "<C-w>j")
map("n", "<C-k>", "<C-w>k")
map("n", "<C-l>", "<C-w>l")
-- move lines in visual mode
map("v", "J", ":m '>+1<CR>gv=gv")
map("v", "K", ":m '<-2<CR>gv=gv")
```

Leader convention: **Space** (`vim.g.mapleader = " "` — set it *before* plugins load). Every mapping you write should have a `desc`; your future `which-key` popup needs it.

Lua survival rules: `local x = ...` declares, `require("module")` imports from `lua/`, `vim.opt` = options, `vim.g` = globals/`let g:`, `vim.keymap.set` = mappings, `:lua print(vim.inspect(t))` to dump tables, `:h vim` for the API.

## 6. LSP — the built-in superpower

Neovim ships the **client**; you choose **servers** and (optionally) a UI.

### The moving parts
| Piece | Role | Typical pick |
|-------|------|--------------|
| LSP server | Understands the language | `lua_ls`, `pyright`/`basedpyright`, `ts_ls`, `gopls`, `rust_analyzer` |
| Client (built-in) | Talks to server | `vim.lsp` — nothing to install |
| Installer | Puts servers on disk | **mason.nvim** (`:Mason`) or system packages |
| Config glue | Tells Neovim how to start each server | `vim.lsp.config` + `vim.lsp.enable` (0.11+) |
| Completion | Popup completions | nvim-cmp + cmp-nvim-lsp (or mini.completion) |
| UI | Diagnostics float, rename, actions | built-in, or `lspSaga`-style UIs |

### Manual (no-plugin) setup — Neovim 0.11 style

```lua
-- lua/config/lsp.lua
vim.lsp.config("*", {
  capabilities = vim.lsp.protocol.make_client_capabilities(),
})
vim.lsp.config("lua_ls", {
  settings = { Lua = { workspace = { checkThirdParty = false } } },
})
vim.lsp.config("pyright", {
  settings = { python = { analysis = { typeCheckingMode = "basic" } } },
})
vim.lsp.enable({ "lua_ls", "pyright", "ts_ls" })
```

Install servers with Mason (`:MasonInstall lua_ls pyright`) or your OS package manager; Neovim finds them on PATH ( Mason puts them in `data/mason/bin`, which it adds automatically when mason.nvim is used).

### Daily LSP keys (defaults, buffer-local when attached)

| Key | Action |
|-----|--------|
| `gd` / `gD` | Definition / declaration |
| `gr` | References |
| `gI` | Implementation |
| `K` | Hover documentation |
| `Ctrl-k` | Signature help |
| `<leader>rn` | Rename symbol across project |
| `<leader>ca` | Code action |
| `]d` / `[d` | Next/prev diagnostic |
| `<leader>e` | Show diagnostic float |
| `:LspInfo` (0.10) / `:checkhealth vim.lsp` | Is the client attached? |

> [!warning] "LSP doesn't work" checklist
> 1. `:checkhealth vim.lsp` — errors?
> 2. `:LspInfo` — is a client attached to *this* buffer?
> 3. Is the server binary installed and on PATH? (`:Mason` shows installed/status)
> 4. Does the project have config the server expects (`pyproject.toml`, `tsconfig.json`)?
> 5. `:messages` for startup errors.

## 7. Plugins with lazy.nvim

**lazy.nvim** (folke) is the de-facto standard plugin manager: startup lazy-loading, lockfile (`lazy-lock.json`) for reproducibility, UI (`:Lazy`), health check (`:checkhealth lazy`).

Bootstrap (structured setup):

```lua
-- init.lua
require("config.lazy")

-- lua/config/lazy.lua
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.uv.fs_stat(lazypath) then
  vim.fn.system({
    "git", "clone", "--filter=blob:none",
    "--branch=stable", "https://github.com/folke/lazy.nvim.git", lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

vim.g.mapleader = " "          -- MUST be before setup
vim.g.maplocalleader = "\\"

require("lazy").setup({
  spec = { { import = "plugins" } },   -- loads lua/plugins/*.lua
  install = { colorscheme = { "habamax" } },
  checker = { enabled = true },        -- notify about updates
})
```

Plugin spec file (`lua/plugins/ui.lua`):

```lua
return {
  { "folke/tokyonight.nvim", lazy = false, priority = 1000,
    config = function() vim.cmd.colorscheme("tokyonight-night") end },
  { "nvim-lualine/lualine.nvim", config = true },
  { "lewis6991/gitsigns.nvim", event = "BufReadPre", config = true },
}
```

### The plugin you'll actually want (starter set)
| Need | Plugin |
|------|--------|
| Fuzzy find files/grep | `nvim-telescope/telescope.nvim` (or `ibhagwan/fzf-lua`) |
| File tree | `stevearc/oil.nvim` (edit dirs like buffers) or `nvim-neo-tree/neo-tree.nvim` |
| Completion | `hrsh7th/nvim-cmp` + sources |
| Snippets | `L3MON4D3/LuaSnip` + `friendly-snippets` |
| Treesitter | `nvim-treesitter/nvim-treesitter` (`:TSUpdate`) |
| LSP install | `williamboman/mason.nvim` + `mason-lspconfig.nvim` |
| Formatting | `stevearc/conform.nvim` (black, prettier, stylua…) |
| linting | `mfussenegger/nvim-lint` |
| Git signs/diff | `gitsigns.nvim`, `sindrets/diffview.nvim`, `NeogitOrg/neogit` |
| Which key | `folke/which-key.nvim` — shows your mappings grouped |
| Commenting | `numToStr/Comment.nvim` (`gcc`, `gc` with motion) |
| Surround | `kylechui/nvim-surround` (`cs"'`, `dsi`…) |

### Managing plugins
| Command | Action |
|---------|--------|
| `:Lazy` | UI: install, update, clean, sync, check |
| `:Lazy sync` | Update + install + clean (lockfile written) |
| `:Lazy health` | Health report |
| `:Mason` | Manage LSP servers/formatters/linters |
| `:TSUpdate` | Rebuild treesitter parsers |
| Commit `lazy-lock.json` | Reproducible setup across machines |

Headless update: `nvim --headless "+Lazy! sync" +qa`.

## 8. Treesitter

```lua
-- lua/plugins/treesitter.lua
return {
  "nvim-treesitter/nvim-treesitter",
  build = ":TSUpdate",
  config = function()
    require("nvim-treesitter.configs").setup({
      ensure_installed = { "lua", "python", "markdown", "json", "bash", "r" },
      auto_install = true,
      highlight = { enable = true },
      indent = { enable = true },
    })
  end,
}
```

Pays off immediately: accurate highlighting; `yaf`/`daf` text objects for functions (with `nvim-treesitter-textobjects`); better folds.

## 9. Build-it-yourself minimal config (2-hour lab)

Goal: **no distro** — you understand every line.

1. Install Neovim + Nerd Font + ripgrep (§1).
2. Create `init.lua` + `lua/options.lua` + `lua/keymaps.lua` (§5). Verify `:lua vim.print(vim.o.number)`.
3. Add `config/lazy.lua` bootstrap (§7). `:Lazy` shows empty manager working.
4. Add `lua/plugins/ui.lua` with a colorscheme + lualine. `:Lazy sync`.
5. Add treesitter (§8) — open a `.lua` file, admire highlighting.
6. Add LSP: mason + `lua_ls` for self-hosting (`:MasonInstall lua_ls`), wire `vim.lsp.config/enable`, attach, `gd` on a function. Repeat for `pyright` on a Python file.
7. Add telescope + one mapping (`<leader>ff` find files, `<leader>fg` live grep).
8. Add nvim-cmp wired to `cmp-nvim-lsp`. Completion pops in LSP buffers.
9. `git init` your config dir, commit; tag the state you like.

**Exit check:** open a Python file — highlighting, completion, `gd`, `K`, `<leader>ca`, format-on-save (conform) all work, and you can explain every block.

## 10. Daily workflows

### 10.1 Project work
- `nvim .` — open in dir; telescope `find_files` / `live_grep`.
- Git: gitsigns hunks in-buffer; `:Git` (vim-fugitive) or Neogit; `:LazyGit` if you run lazygit in a terminal.
- Quickfix: `:grep pattern %:p:h` … or telescope `grep_string` (`<leader>sw` on word under cursor).

### 10.2 Sessions & recovery
- `:mksession` / auto-session plugins; crash recovery: swap files still work (`:recover`).
- `:checkhealth` first for any oddity.

### 10.3 Multiple configurations with NVIM_APPNAME
Run several configs side by side without clobbering:

```bash
NVIM_APPNAME=nvim-flat nvim        # uses ~/.config/nvim-flat, data in ~/.local/share/nvim-flat
NVIM_APPNAME=nvim-lazyman lazyman -E LazyVim   # Lazyman's own switching mechanism
```

On Windows (PowerShell): `$env:NVIM_APPNAME="nvim-test"; nvim`. This is the safe way to trial a distro while keeping your daily config — heavily used by [[Neovim_Distributions#5. Lazyman — the multi-config manager (deep dive)|Lazyman]].

### 10.4 Remote / servers
`nvim` over ssh works directly; alternatively `scp`-less editing with `--remote`. Vim motions mean you're productive on any box even with zero config (`ssh server` → `nvim file` or plain `vi`).

## 11. Now: distro or DIY?

You've built §9 by hand, so whatever you borrow, you can read. The comparison — LazyVim, NvChad, AstroNvim, kickstart.nvim, LunarVim's status, SpaceVim, mini.nvim, and how **Lazyman** installs/switches among 100+ configs — lives in [[Neovim_Distributions]].

Rule of thumb: **kickstart** to learn, **LazyVim** to be productive immediately, **Lazyman** to audition several before committing.

## 12. Learning plan + tracker

| Phase | Do | Exit check |
|-------|----|-----------|
| 1 | Vim motions refresher ([[Vim_Tutorial]] phases 1–5) | Edit without arrow keys |
| 2 | Install, `:checkhealth`, basic `init.lua` options/keymaps | Config loads clean, leader works |
| 3 | Manual lab §9 steps 1–4 | `:Lazy` + colorscheme live |
| 4 | Treesitter + telescope | Highlight + fuzzy find in daily use |
| 5 | LSP + mason + completion | `gd`/`K`/rename in Python or Lua |
| 6 | Format on save + gitsigns | Save formats; git hunks visible |
| 7 | Decide: keep DIY or adopt distro ([[Neovim_Distributions]]) | One config is your daily driver |
| 8 | Reproduce config on a second machine | Commit + `lazy-lock.json` restore |

- [ ] Phase 2 …
- [ ] Phase 5 …
- [ ] Phase 8 …

### When stuck

| Problem | Fix |
|---------|-----|
| Anything weird | `:checkhealth` first, `:messages` second |
| Plugin broken | `:Lazy sync`, check the plugin's issue tracker, `lazy-lock.json` rollback (`:Lazy restore`) |
| LSP silent | `:LspInfo` — attached? installed? configured? (§6 box) |
| Config error on startup | `nvim --clean` to verify; check `lua/` require paths |
| Slow startup | `:Lazy profile`; lazy-load with `event`/`cmd`/`ft` |
| Icons garbled | Install and select a Nerd Font in your terminal |
