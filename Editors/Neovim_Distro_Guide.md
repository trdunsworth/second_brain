---
type: usage-note
topic: Neovim distributions — LazyVim, AstroNvim, NvChad, kickstart, mini.nvim, SpaceVim, Lazyman; install, customize without forking, update safely, audition with NVIM_APPNAME
date: 2026-11-26
status: active
tags:
  - editors
  - neovim
  - distributions
  - lazyvim
  - astronvim
  - nvchad
  - lazyman
  - setup
---

# Neovim Distributions — Pick, Install, Customize, Update

> Goal: choose the right starting point, install it the right way, **customize without forking the distro**, update safely, and — via **Lazyman** — audition several configs side-by-side before committing. Prereqs: motions from [[Neovim_Tutorial]] / [[Vim_Cheatsheet]]; the DIY baseline in [[Neovim_Usage]] §4 so you can read whatever you adopt.
> Related: [[Neovim_Usage]] (DIY baseline) · [[Neovim_Tutorial]] · [[Neovim_Cheatsheet]] · [[Neovim_Distributions]] (deep comparison) · [[Vault_Editor_Workflows]] (obsidian.nvim)

## How to use this note

1. **§1** — decision tree (30 seconds).
2. **§2–§5** — each major distro: install, customize, update.
3. **§6** — **Lazyman**: the multi-config manager (try before you buy).
4. **§7** — customization patterns that work across distros.
5. **§8** — migration checklist.

---

## 1. Decision tree (pick one)

| You want… | Start with |
|-----------|------------|
| Largest community, most tutorials, granular lazy-loading | **LazyVim** |
| IDE look out of the box + AstroCommunity language packs | **AstroNvim** |
| Speed-focused, distinct UI, batteries included | **NvChad** |
| Minimal launch point, you build up | **kickstart.nvim** |
| Compose from tiny independent modules | **mini.nvim** |
| Try 5+ configs before committing | **Lazyman** |
| Vim + Neovim shared config | **SpaceVim** |

**Current status (Nov 2026)**:
- **LazyVim** — active, folke maintains, largest Discord/GitHub Discussions
- **AstroNvim** — v6.x active, v6.1.1 Oct 2026, strong Discord, AstroCommunity packs
- **NvChad** — v2.5 active, UI-centric, smaller core team
- **LunarVim** — **stalled**, no active maintainer, lags Neovim 0.12+ — avoid for new setups
- **SpaceVim** — Vim+Neovim, less active, larger footprint

---

## 2. LazyVim — the community default

### Install

```bash
# Backup first
mv ~/.config/nvim ~/.config/nvim.bak
mv ~/.local/share/nvim ~/.local/share/nvim.bak
mv ~/.local/state/nvim ~/.local/state/nvim.bak
mv ~/.cache/nvim ~/.cache/nvim.bak

# Clone starter
git clone https://github.com/LazyVim/starter ~/.config/nvim
rm -rf ~/.config/nvim/.git
nvim
```

First run: lazy.nvim boots, installs plugins, opens `:Lazy` UI. **Requires Neovim ≥ 0.11.2** (0.12.6 recommended).

### Structure

```
~/.config/nvim/
├── lua/
│   ├── config/           -- LazyVim core (don't edit directly)
│   │   ├── autocmds.lua
│   │   ├── keymaps.lua
│   │   ├── lazy.lua      -- bootstrap
│   │   └── options.lua
│   ├── lazyvim/          -- distro internals (read-only)
│   └── plugins/          -- YOUR customizations go here (auto-loaded)
│       ├── example.lua
│       └── ...
├── lazy-lock.json        -- commit this!
└── stylua.toml
```

### Customize without forking

**Never edit `lua/config/` or `lua/lazyvim/`** — they're overwritten on update. Instead:

| What | How |
|------|-----|
| Change options | `lua/config/options.lua` → but better: create `lua/plugins/options.lua` returning a spec with `opts = {}` for the plugin |
| Add keymaps | `lua/config/keymaps.lua` → or `lua/plugins/keymaps.lua` with `keys = {}` in a spec |
| Add a plugin | Create `lua/plugins/my-plugin.lua` returning a lazy.nvim spec |
| Override a distro plugin | Create `lua/plugins/ui.lua` returning `{ "folke/tokyonight.nvim", opts = { style = "storm" } }` — **merged** with distro spec |
| Disable a distro plugin | `{ "plugin/name", enabled = false }` in your spec |

**Example: add obsidian.nvim**

```lua
-- lua/plugins/obsidian.lua
return {
  "epwalsh/obsidian.nvim",
  version = "*",
  lazy = true,
  ft = "markdown",
  dependencies = { "nvim-lua/plenary.nvim" },
  opts = {
    workspaces = { { name = "second_brain", path = "~/projects/second_brain" } },
    daily_notes = { folder = "journal", template = "Templates/scripts/daily_journal_template.md" },
    completion = { nvim_cmp = true, min_chars = 2 },
  },
  keys = {
    { "<leader>on", "<cmd>ObsidianNew<CR>", desc = "New note" },
    { "<leader>os", "<cmd>ObsidianSearch<CR>", desc = "Search vault" },
    { "<leader>ot", "<cmd>ObsidianToday<CR>", desc = "Today's daily note" },
  },
}
```

### Update safely

```bash
# Inside nvim
:Lazy sync          -- updates plugins, writes lazy-lock.json
:Lazy check         -- shows available updates without applying
```

```bash
# Headless (CI / script)
nvim --headless "+Lazy! sync" +qa
```

**Commit `lazy-lock.json`** — reproducible across machines. To rollback: `:Lazy restore` (uses lockfile).

### LazyVim extras (opt-in features)

```lua
-- In any plugin spec file, or :LazyExtras
{ import = "lazyvim.plugins.extras.lang.python" },
{ import = "lazyvim.plugins.extras.lang.rust" },
{ import = "lazyvim.plugins.extras.coding.blink" },  -- blink.cmp instead of nvim-cmp
{ import = "lazyvim.plugins.extras.editor.oil" },
```

Run `:LazyExtras` to browse/enable. They're just plugin specs — you can copy-paste into your own `lua/plugins/`.

---

## 3. AstroNvim — IDE feel + community packs

### Install (template method)

```bash
mv ~/.config/nvim ~/.config/nvim.bak
mv ~/.local/share/nvim ~/.local/share/nvim.bak
mv ~/.local/state/nvim ~/.local/state/nvim.bak
mv ~/.cache/nvim ~/.cache/nvim.bak

git clone --depth 1 https://github.com/AstroNvim/template ~/.config/nvim
rm -rf ~/.config/nvim/.git
nvim
```

**Requires Neovim ≥ 0.11**, C compiler, tree-sitter CLI, clipboard tool.

### Structure

```
~/.config/nvim/
├── lua/
│   ├── astronvim/        -- distro core (read-only)
│   ├── community.lua     -- AstroCommunity imports (your packs)
│   ├── plugins/          -- YOUR specs (auto-loaded)
│   └── user/             -- init.lua, options, keymaps, autocmds
├── lazy-lock.json
└── stylua.toml
```

### Customize without forking

| What | How |
|------|-----|
| User config | Edit `lua/user/init.lua`, `lua/user/options.lua`, `lua/user/keymaps.lua` |
| Add plugin | Create `lua/plugins/*.lua` (same lazy.nvim spec) |
| Override | Same merge semantics as LazyVim |
| Community packs | Edit `lua/community.lua`: `{ import = "astrocommunity.pack.python" }` |

**AstroCommunity packs** (v6+): language-specific bundles (LSP, DAP, treesitter, formatters). Browse: `:AstroCommunity` or https://github.com/AstroNvim/astrocommunity.

```lua
-- lua/community.lua
return {
  { import = "astrocommunity.pack.python" },
  { import = "astrocommunity.pack.rust" },
  { import = "astrocommunity.completion.blink-cmp" },
  { import = "astrocommunity.editor.oil" },
}
```

### Update

```bash
# Inside nvim
:AstroUpdate        -- updates plugins + Mason packages (bound to <leader>pa)
:Lazy sync          -- also works
```

---

## 4. NvChad — speed + UI

### Install

```bash
git clone https://github.com/NvChad/starter ~/.config/nvim && nvim
```

### Structure

```
~/.config/nvim/
├── lua/
│   ├── chadrc.lua        -- main user config (THE file to edit)
│   ├── plugins/          -- your specs
│   └── nvchad/           -- distro core (read-only)
├── lazy-lock.json
```

### Customize

**`chadrc.lua` is the single config entry point** — returns a table merging with defaults:

```lua
-- chadrc.lua
local M = {}

M.ui = { theme = "tokyonight", transparency = true }
M.plugins = "custom.plugins"  -- loads lua/custom/plugins/init.lua

return M
```

Add plugins in `lua/custom/plugins/init.lua` (lazy.nvim specs). Disable: `M.plugins = { default = false }`.

### Update

`:Lazy sync` — same lazy.nvim workflow.

---

## 5. kickstart.nvim — minimal launch point

### Install

```bash
git clone https://github.com/nvim-lua/kickstart.nvim ~/.config/nvim
```

No lockfile, no opinionated plugin set — just LSP, treesitter, telescope, nvim-cmp, and a clean `init.lua` you **own completely**. Best for learning; you become the maintainer.

---

## 6. Lazyman — the multi-config manager (try them all)

Lazyman installs and manages **100+ configs** side-by-side using `NVIM_APPNAME`. You keep your daily driver while auditioning.

### Install

```bash
# One-liner (Linux/macOS)
bash <(curl -s https://raw.githubusercontent.com/doctorfree/nvim-lazyman/main/scripts/install_lazyman.sh)

# Or manually
git clone https://github.com/doctorfree/nvim-lazyman ~/.config/nvim-Lazyman
~/.config/nvim-Lazyman/lazyman.sh -I
```

### Usage

```bash
lazyman -L                 # list available configs
lazyman -S                 # search
lazyman -i lazyvim         # install LazyVim as ~/.config/nvim-LazyVim
lazyman -E LazyVim         # RUN LazyVim (sets NVIM_APPNAME=nvim-LazyVim)
lazyman -E AstroNvim       # RUN AstroNvim
lazyman -E NvChad          # RUN NvChad
lazyman -c                 # create a new custom config from template
```

**Installed configs live in**: `~/.config/nvim-<Name>`, data in `~/.local/share/nvim-<Name>`. Your original `~/.config/nvim` is untouched.

### Lazyman configs included (subset)

| Config | Command | Notes |
|--------|---------|-------|
| LazyVim | `lazyman -i lazyvim` | |
| AstroNvim | `lazyman -i astronvim` | |
| NvChad | `lazyman -i nvchad` | |
| kickstart | `lazyman -i kickstart` | |
| mini.nvim | `lazyman -i mini` | |
| SpaceVim | `lazyman -i spacevim` | Vim+Neovim |
| NormalNvim | `lazyman -i normalnvim` | AstroNvim fork |
| CosmicNvim | `lazyman -i cosmicnvim` | |

### Why this matters

You can **spend a week in each** with real work, same vault, same muscle memory, zero risk. When you decide, `lazyman -c` creates your own config from the one you liked, or just keep using it via `lazyman -E`.

---

## 7. Customization patterns that work across distros

| Pattern | lazy.nvim spec snippet |
|---------|------------------------|
| Override plugin opts | `{ "owner/repo", opts = { key = "value" } }` |
| Add keymaps to plugin | `{ "owner/repo", keys = { { "<leader>x", "<cmd>Action<CR>", desc = "Do thing" } } }` |
| Disable distro plugin | `{ "owner/repo", enabled = false }` |
| Add new plugin | `{ "owner/repo", event = "VeryLazy", config = function() ... end }` |
| Run code after plugin loads | `{ "owner/repo", config = function(_, opts) require("plugin").setup(opts) your_extra() end }` |
| Conditional load | `{ "owner/repo", cond = function() return vim.fn.executable("rg") == 1 end }` |

**Key rule**: Create `lua/plugins/*.lua` files (or `lua/user/plugins/` in AstroNvim, `lua/custom/plugins/` in NvChad). The distro's lazy.nvim `spec = { { import = "plugins" } }` picks them up automatically.

---

## 8. Migration checklist (DIY → distro or distro → distro)

- [ ] Backup current `~/.config/nvim` + `~/.local/share/nvim` + `~/.local/state/nvim`
- [ ] Install target distro (template method)
- [ ] Run `:checkhealth` — verify LSP, treesitter, Mason
- [ ] Port **your** customizations:
  - [ ] Keymaps → `lua/plugins/keymaps.lua` or user config
  - [ ] Options → `lua/plugins/options.lua` or user config
  - [ ] Custom plugins → `lua/plugins/*.lua`
  - [ ] Autocmds → `lua/plugins/autocmds.lua`
- [ ] Test vault workflow: [[Vault_Editor_Workflows]] §Neovim
- [ ] Commit new `lazy-lock.json`
- [ ] Tag the working state: `git tag distro-migration-2026-11-26`

---

## 9. Quick reference

| Task | LazyVim | AstroNvim | NvChad | kickstart |
|------|---------|-----------|--------|-----------|
| Install | `git clone starter` | `git clone template` | `git clone starter` | `git clone kickstart` |
| User config dir | `lua/plugins/` | `lua/user/` + `lua/plugins/` | `chadrc.lua` + `lua/custom/plugins/` | edit `init.lua` directly |
| Override plugin | merge via spec | merge via spec | `chadrc.lua` merge | edit spec in `init.lua` |
| Community features | `:LazyExtras` | `lua/community.lua` | NvChad plugins | manual |
| Update | `:Lazy sync` | `:AstroUpdate` / `:Lazy sync` | `:Lazy sync` | `:Lazy sync` (if added) |
| Lockfile | `lazy-lock.json` | `lazy-lock.json` | `lazy-lock.json` | none by default |
| Multi-config | `NVIM_APPNAME` | `NVIM_APPNAME` | `NVIM_APPNAME` | `NVIM_APPNAME` |
| Audition tool | **Lazyman** | **Lazyman** | **Lazyman** | **Lazyman** |

---

**Next**: [[Neovim_Usage]] §4 for the DIY baseline, or [[Vault_Editor_Workflows]] to wire obsidian.nvim into whichever distro you pick.