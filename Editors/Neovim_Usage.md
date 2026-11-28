---
type: usage-note
topic: Neovim usage — install, config architecture, lazy.nvim vs vim.pack, LSP/Mason/Treesitter, customization primer
date: 2026-11-26
status: active
tags:
  - editors
  - neovim
  - lua
  - lsp
  - setup
  - customization
---

# Neovim — Usage Notes

> Goal: Neovim as a daily driver on **Mac and Fedora** — Vim motions first, then the three things that make Neovim *Neovim*: **Lua config, built-in LSP, plugin manager**. You'll have a working personal config you can read line-by-line; [[Neovim_Distro_Guide]] covers the "I don't want to build it" path. **Current stable: 0.12.6** (Oct 2026; 0.12 added built-in `vim.pack`, `vim.async`, `vim.lsp.config` API).
> Related: [[Neovim_Tutorial]] (learning path) · [[Neovim_Cheatsheet]] (keys) · [[Neovim_Distro_Guide]] (distros) · [[Neovim_Distributions]] (deep comparison) · [[Lisp_Editor_Integrations]] (Conjure/nvlime) · [[Obsidian_CLI]] · [[Vault_Editor_Workflows]]

## How to use this note

1. **§1–§2** — install + config layout (do once per machine).
2. **§3** — the three pillars: Lua, LSP, plugins.
3. **§4** — **customization primer**: the first five edits to make it yours.
4. **§5–§6** — daily workflows + multiple configs (`NVIM_APPNAME`).
5. **§7** — decision: DIY vs distro → [[Neovim_Distro_Guide]].

---

## 1. Install

| Platform | Command | Notes |
|----------|---------|-------|
| macOS | `brew install neovim` | 0.12.6 current; installs `nvim` + `nvim-qt` optional |
| Fedora | `sudo dnf install neovim` | 0.12.x in updates; add `dnf copr enable atim/neovim-nightly` for pre-release |
| Ubuntu/Debian | `sudo snap install nvim --classic` or AppImage | `apt` often stale; AppImage: `chmod +x nvim.appimage` |
| Arch | `sudo pacman -S neovim` | |
| Windows | `winget install Neovim.Neovim` or `scoop install neovim` | |

**Recommended everywhere**: Nerd Font (JetBrainsMono Nerd Font), `ripgrep` (`rg`), `fd`, `git`, `make`/`cmake` (for treesitter parsers).

```bash
nvim --version          # NVIM v0.12.6
:checkhealth            # run inside nvim — first diagnostic, always
```

### Config locations

| OS | Config dir | Data dir (plugins) |
|----|-----------|-------------------|
| Linux/macOS | `~/.config/nvim` | `~/.local/share/nvim` |
| Windows | `~\AppData\Local\nvim` | `~\AppData\Local\nvim-data` |
| Any | `:echo stdpath('config')` | `:echo stdpath('data')` |

Multiple configs side-by-side:

```bash
NVIM_APPNAME=nvim-test nvim        # uses ~/.config/nvim-test, ~/.local/share/nvim-test
```

This is how [[Neovim_Distro_Guide]] §Lazyman works — safe distro auditions.

## 2. Config architecture — `init.lua` layout

Neovim reads `init.lua` from the config dir. Structure it like this from day one:

```
~/.config/nvim/
├── init.lua                 -- entry point, loads everything
└── lua/
    ├── options.lua          -- vim.opt settings
    ├── keymaps.lua          -- vim.keymap.set
    ├── autocmds.lua         -- autocommands
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
require("config.lazy")        -- bootstrap lazy.nvim (§3.3); remove until you add plugins
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
opt.undofile = true           -- persistent undo
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
-- window nav without <C-w> prefix
map("n", "<C-h>", "<C-w>h")
map("n", "<C-j>", "<C-w>j")
map("n", "<C-k>", "<C-w>k")
map("n", "<C-l>", "<C-w>l")
-- move lines in visual mode
map("v", "J", ":m '>+1<CR>gv=gv")
map("v", "K", ":m '<-2<CR>gv=gv")
```

**Leader convention**: `vim.g.mapleader = " "` (Space) — **set before plugins load**. Every mapping gets a `desc`; `which-key` needs it.

### Lua survival

| Task | Code |
|------|------|
| Declare local | `local x = ...` |
| Require module | `require("module")` — loads from `lua/` |
| Options | `vim.opt` = `:set` |
| Globals | `vim.g` = `let g:` |
| Keymaps | `vim.keymap.set(mode, lhs, rhs, opts)` |
| Inspect table | `:lua print(vim.inspect(t))` |
| API docs | `:h vim` |

## 3. The three pillars

### 3.1 Lua config — already done in §2

### 3.2 Built-in LSP (the client — you pick servers + UI)

| Piece | Role | Typical pick |
|-------|------|--------------|
| LSP server | Understands the language | `lua_ls`, `basedpyright`/`pyright`, `ts_ls`, `gopls`, `rust_analyzer`, `marksman` (Markdown), `clojure_lsp` |
| Client (built-in) | Talks to server | `vim.lsp` — nothing to install |
| Installer | Puts servers on disk | **mason.nvim** (`:Mason`) or system packages |
| Config glue | Tells Neovim how to start each server | `vim.lsp.config` + `vim.lsp.enable` (0.11+) |
| Completion | Popup completions | `blink.cmp` (fast, Lua) or `nvim-cmp` |
| UI | Diagnostics float, rename, actions | built-in, or `lspsaga.nvim` |

**Manual setup (0.11+ style):**

```lua
-- lua/plugins/lsp.lua
return {
  { "williamboman/mason.nvim", config = true },
  {
    "neovim/nvim-lspconfig",
    config = function()
      local lspconfig = require("lspconfig")
      local capabilities = require("blink.cmp").get_lsp_capabilities()
      local servers = { "lua_ls", "basedpyright", "ts_ls", "rust_analyzer", "marksman" }
      for _, server in ipairs(servers) do
        lspconfig[server].setup({ capabilities = capabilities })
      end
      -- custom config for lua_ls
      lspconfig.lua_ls.setup({
        settings = { Lua = { workspace = { checkThirdParty = false } } },
      })
    end,
  },
  {
    "saghen/blink.cmp",
    version = "*",
    opts = { keymap = { preset = "default" } },
  },
}
```

**Daily LSP keys** (buffer-local when attached):

| Key | Action |
|-----|--------|
| `gd` / `gD` | Definition / declaration |
| `gr` | References |
| `gI` | Implementation |
| `K` | Hover documentation |
| `Ctrl-k` | Signature help |
| `<leader>rn` | Rename symbol |
| `<leader>ca` | Code action |
| `]d` / `[d` | Next/prev diagnostic |
| `<leader>e` | Show diagnostic float |
| `:LspInfo` / `:checkhealth vim.lsp` | Debug |

> **LSP doesn't work?** 1) `:checkhealth vim.lsp` 2) `:LspInfo` — client attached? 3) Server binary installed? (`:Mason`) 4) Project config exists (`pyproject.toml`, `tsconfig.json`) 5) `:messages` for startup errors.

### 3.3 Plugins — lazy.nvim (de-facto standard) vs vim.pack (built-in, 0.12+)

**lazy.nvim** — startup lazy-loading, lockfile (`lazy-lock.json`), UI (`:Lazy`), health check.

```lua
-- lua/config/lazy.lua (bootstrap)
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.uv.fs_stat(lazypath) then
  vim.fn.system({ "git", "clone", "--filter=blob:none", "--branch=stable", "https://github.com/folke/lazy.nvim.git", lazypath })
end
vim.opt.rtp:prepend(lazypath)

vim.g.mapleader = " "          -- MUST be before setup
vim.g.maplocalleader = "\\"

require("lazy").setup({
  spec = { { import = "plugins" } },   -- loads lua/plugins/*.lua
  install = { colorscheme = { "habamax" } },
  checker = { enabled = true },
})
```

**vim.pack** (0.12+, experimental label dropping) — built-in, no plugin manager plugin:

```lua
-- init.lua (0.12+)
vim.pack.add({
  "https://github.com/folke/tokyonight.nvim",
  "https://github.com/nvim-treesitter/nvim-treesitter",
  "https://github.com/neovim/nvim-lspconfig",
  -- lazy-load with events:
  { src = "https://github.com/saghen/blink.cmp", version = "*" },
})
-- then require and configure as normal
```

| Factor | lazy.nvim | vim.pack |
|--------|-----------|----------|
| Maturity | production, huge ecosystem | experimental (0.12), evolving |
| Lockfile | `lazy-lock.json` (reproducible) | `pack.lock` (0.12+) |
| Lazy-loading | granular (`event`, `cmd`, `ft`, `keys`) | `load`/`opt` flags |
| UI | `:Lazy` (rich) | `:PackUpdate` etc. (minimal) |
| Migration | — | `lazy.nvim` → `vim.pack` tooling emerging |

**Starter plugin set** (lazy.nvim spec files in `lua/plugins/`):

| Need | Plugin |
|------|--------|
| Fuzzy find | `ibhagwan/fzf-lua` or `nvim-telescope/telescope.nvim` |
| File tree | `stevearc/oil.nvim` (edit dirs like buffers) |
| Completion | `saghen/blink.cmp` |
| Snippets | `L3MON4D3/LuaSnip` + `rafamadriz/friendly-snippets` |
| Treesitter | `nvim-treesitter/nvim-treesitter` (`:TSUpdate`) |
| LSP install | `williamboman/mason.nvim` + `mason-lspconfig.nvim` |
| Formatting | `stevearc/conform.nvim` (black, prettier, stylua) |
| Linting | `mfussenegger/nvim-lint` |
| Git | `lewis6991/gitsigns.nvim`, `NeogitOrg/neogit` |
| Which-key | `folke/which-key.nvim` |
| Commenting | `numToStr/Comment.nvim` |
| Surround | `kylechui/nvim-surround` |

**Managing plugins**:

| Command | Action |
|---------|--------|
| `:Lazy` | UI: install, update, clean, sync |
| `:Lazy sync` | Update + install + clean (lockfile written) |
| `:Lazy health` | Health report |
| `:Mason` | Manage LSP servers/formatters/linters |
| `:TSUpdate` | Rebuild treesitter parsers |
| Commit `lazy-lock.json` | Reproducible across machines |
| Headless update | `nvim --headless "+Lazy! sync" +qa` |

## 4. Customization — the first five edits

### 1. Theme + statusline (5 min)

```lua
-- lua/plugins/ui.lua
return {
  { "folke/tokyonight.nvim", lazy = false, priority = 1000,
    config = function() vim.cmd.colorscheme("tokyonight-night") end },
  { "nvim-lualine/lualine.nvim", config = true },
}
```

### 2. File navigation — Oil (edit dirs like buffers)

```lua
-- lua/plugins/oil.lua
return { "stevearc/oil.nvim", opts = {}, keys = { { "-", "<CMD>Oil<CR>", desc = "Open parent directory" } } }
```

### 3. Fuzzy find — fzf-lua (fast, no deps)

```lua
-- lua/plugins/fzf.lua
return {
  { "ibhagwan/fzf-lua", dependencies = { "nvim-tree/nvim-web-devicons" }, config = true },
}
-- keys (in keymaps.lua or here):
-- map("n", "<leader>ff", "<cmd>FzfLua files<CR>", { desc = "Find files" })
-- map("n", "<leader>fg", "<cmd>FzfLua live_grep<CR>", { desc = "Live grep" })
-- map("n", "<leader>fb", "<cmd>FzfLua buffers<CR>", { desc = "Buffers" })
```

### 4. Treesitter + textobjects (accurate highlighting + `af`/`if` motions)

```lua
-- lua/plugins/treesitter.lua
return {
  { "nvim-treesitter/nvim-treesitter", build = ":TSUpdate", config = function()
    require("nvim-treesitter.configs").setup({
      ensure_installed = { "lua", "python", "markdown", "json", "bash", "r", "org" },
      auto_install = true, highlight = { enable = true }, indent = { enable = true },
    })
  end },
  { "nvim-treesitter/nvim-treesitter-textobjects" },
}
```

### 5. Format on save (Conform) + git signs

```lua
-- lua/plugins/conform.lua
return {
  { "stevearc/conform.nvim", opts = {
    formatters_by_ft = { python = { "black" }, lua = { "stylua" }, markdown = { "prettier" } },
    format_on_save = { timeout_ms = 500, lsp_fallback = true },
  }},
  { "lewis6991/gitsigns.nvim", config = true },
}
```

**Exit check**: open a Python file — highlighting, completion, `gd`, `K`, `<leader>ca`, format-on-save all work, and you can explain every block.

## 5. Daily workflows

### Project work
- `nvim .` — open dir; fzf-lua `files` / `live_grep`.
- Git: gitsigns hunks in-buffer; `:Neogit` or `:Git` (fugitive); LazyGit in `:terminal`.
- Quickfix: `:grep pattern %:p:h` or fzf-lua `grep_string` (`<leader>sw` on word).

### Sessions & recovery
- `:mksession Session.vim` / `auto-session` plugin; crash recovery: swap files (`:recover`).
- `:checkhealth` first for any oddity.

### Multiple configurations with `NVIM_APPNAME`

```bash
NVIM_APPNAME=nvim-flat nvim              # your DIY config
NVIM_APPNAME=nvim-lazy nvim              # LazyVim
NVIM_APPNAME=nvim-astro nvim             # AstroNvim
lazyman -E LazyVim                       # Lazyman's own switcher
```

On Windows (PowerShell): `$env:NVIM_APPNAME="nvim-test"; nvim`.

### Remote / servers
`nvim` over ssh works directly; motions mean you're productive on any box even with zero config (`ssh server` → `nvim file`).

## 6. Learning plan + tracker

| Phase | Do | Exit check |
|-------|----|-----------|
| 1 | Vim motions refresher ([[Vim_Tutorial]]) | Edit without arrow keys |
| 2 | Install, `:checkhealth`, basic `init.lua` options/keymaps | Config loads clean, leader works |
| 3 | Add lazy.nvim + colorscheme + lualine | `:Lazy` + theme live |
| 4 | Treesitter + fzf-lua | Highlight + fuzzy find in daily use |
| 5 | LSP + Mason + blink.cmp | `gd`/`K`/rename in Python or Lua |
| 6 | Format on save + gitsigns | Save formats; git hunks visible |
| 7 | Decide: keep DIY or adopt distro ([[Neovim_Distro_Guide]]) | One config is daily driver |
| 8 | Reproduce on second machine | Commit + `lazy-lock.json` restore |

- [ ] Phase 2 · [ ] Phase 5 · [ ] Phase 8

## 7. Decision — DIY or distro?

You've built §4 by hand, so whatever you borrow, you can read. The comparison — **LazyVim, AstroNvim, NvChad, kickstart.nvim, mini.nvim, SpaceVim**, and how **Lazyman** installs/switches among 100+ configs — lives in [[Neovim_Distro_Guide]].

| You want… | Start with |
|-----------|------------|
| Learn the internals, total control | DIY (§4 lab) → commit |
| Productive IDE today, still customizable | **LazyVim** |
| IDE look + community packs (lang-specific) | **AstroNvim** |
| Speed-focused, distinct UI | **NvChad** |
| Minimal launch point, you build up | **kickstart.nvim** |
| Compose from tiny modules | **mini.nvim** |
| Try several before committing | **Lazyman** |

Rule of thumb: **kickstart to learn, LazyVim to be productive, Lazyman to audition**.

---

**Quick reference**

| Need | Answer |
|------|--------|
| Any key | `C-h k` (neovim help) or `:Telescope keymaps` |
| Health | `:checkhealth` |
| Plugins | `:Lazy` |
| LSP servers | `:Mason` |
| Treesitter | `:TSUpdate` |
| Format | `:ConformInfo` or `<leader>cf` |
| Git | `:Neogit` or gitsigns hunks |
| Config reload | `:source $MYVIMRC` or restart |