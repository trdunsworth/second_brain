---
type: reference
topic: Neovim distributions compared — LazyVim, NvChad, AstroNvim, kickstart, LunarVim, SpaceVim, mini.nvim + Lazyman multi-config manager
date: 2026-09-29
status: active
tags:
  - neovim
  - distributions
  - lazyman
  - lazyvim
  - nvchad
  - astronvim
  - kickstart
  - terminal_stuff
---

# Neovim Distributions — Compared, and How to Use Them Properly

> Goal: pick the right starting point, install it the right way, customize **without forking the distro**, update safely, and — via **Lazyman** — audition several configs side by side before committing. Prereqs: motions from [[Neovim_Tutorial]] / [[Vim_Cheatsheet]]; the DIY baseline in [[Neovim_Tutorial]] §9 so you can read whatever you adopt.
> Links: [[Neovim_Tutorial]] · [[Neovim_Cheatsheet]]

## 1. The spectrum (know where each option sits)

```
bare nvim ── kickstart.nvim ── mini starter ── LazyVim / AstroNvim / NvChad ── Lazyman
  (nothing)   (your init.lua     (minimal       (full distros: opinionated      (meta-manager:
               written by you,    modules,       plugins + defaults, you         installs and
               heavily commented)  you assemble)  override in your layer)         switches 100+)
```

A **distribution** = a curated plugin set + defaults + conventions, meant to be *overridden*, not edited. **Lazyman** is not a distro — it's a **configuration manager** that installs and switches other people's distros.

## 2. Shared prerequisites (all distros)

| Requirement | Why |
|-------------|-----|
| Neovim (recent stable) | Minimums differ — table in §3; LazyVim currently wants **≥ 0.11.2** |
| git ≥ 2.19 | Plugin clones (partial clones) |
| A **Nerd Font** in your terminal | Icons everywhere; without it you see boxes |
| `ripgrep` | Telescope/live-grep pickers |
| C compiler | nvim-treesitter parsers |
| A clean backup | Move `~/.config/nvim` (+ `~/.local/share/nvim`) aside first |

Universal backup before any install (Linux/macOS):

```bash
mv ~/.config/nvim{,.bak} 2>/dev/null
mv ~/.local/share/nvim{,.bak} 2>/dev/null
```

Windows: config is `%LOCALAPPDATA%\nvim`, data is `%LOCALAPPDATA%\nvim-data`.

## 3. The comparison

| | **kickstart.nvim** | **LazyVim** | **AstroNvim** | **NvChad** | **SpaceVim** | **mini.nvim starter** | **LunarVim** |
|---|---|---|---|---|---|---|---|
| **Philosophy** | Learning scaffold — one commented file *you* own | "Distro that stays out of your way" | Polished, batteries-included, community extras | Blazing-fast, pretty UI defaults | Layered Vim-style config | Minimal modules you assemble | (see status) |
| **Base** | Single `init.lua` | lazy.nvim + LazyVim as a plugin | lazy.nvim + AstroNvim core as plugin | lazy.nvim + NvChad core as plugin | Own Vimscript layer system | mini.nvim modules | lazy.nvim |
| **Config where** | Directly in `init.lua` (you edit it freely) | `lua/plugins/*.lua` + `lua/config/*.lua` | `lua/plugins/*.lua` (template repo) | `lua/custom/` (`chadrc.lua`, `mappings.lua`, `plugins.lua`) | `.SpaceVim.d/`, toml layers | Your init + module opts | *deprecated path* |
| **Update** | `git pull` + manual merge (deliberate: you learn the diff) | `:Lazy sync` (plugin-level) | `:Lazy sync` + template pull | `:NvChadUpdate` / git upstream (core) + your `custom/` is separate | `:SpaceVimSync` | `:Lazy sync` | — |
| **Learning value** | ★★★★★ | ★★★☆☆ | ★★☆☆☆ | ★★☆☆☆ | ★★☆☆☆ | ★★★★☆ | — |
| **Weight / startup** | Minimal | Mid, heavily lazy-loaded | Mid | Very light claims (~0.02–0.07s) | Heavy-ish | Minimal | — |
| **Min Neovim** | current 0.10/0.11+ | **≥ 0.11.2** (current README) | check template (recent 0.10/0.11+) | check README (recent) | older-friendly | recent | — |
| **Community/docs** | Huge (most-forked starting point) | Excellent (lazyvim.org) | Very good (astronvim.com) | Large (28k+ stars) | Older but stable | Growing | **stalled** |
| **Status (2026)** | Active | Active (folke) | Active (v5) | Active (v2.5) | Maintained, niche | Active | Effectively in maintenance — widely recommended against for new setups |

> [!tip] Which column for whom
> - **Want to understand Neovim** → kickstart (§4.1). Non-negotiable if this is your first config.
> - **Want a daily-driver IDE today** → **LazyVim** (§4.2) — the 2026 consensus default: most active ecosystem, best docs, lowest floor.
> - **Want max polish + community plugins** → AstroNvim (§4.3).
> - **Want speed + a beautiful UI with minimal fuss** → NvChad (§4.4).
> - **Want to try several before choosing** → **Lazyman** (§5).
> - **LunarVim** → skip; maintenance issues, most migration guides now point elsewhere.

## 4. Install & customize — per distro, done properly

The universal rule: **the distro's core is upstream-owned; your layer is override-only.** Never edit files inside the distro's own namespace — updates will clobber you.

### 4.1 kickstart.nvim — the learning scaffold

```bash
git clone https://github.com/nvim-lua/kickstart.nvim ~/.config/nvim
nvim   # read the comments; that's the tutorial
```

- One ~600-line `init.lua`, commented section by section (options → keymaps → plugin manager → LSP → treesitter → …).
- **You own the file.** Customize directly; that's the point.
- Updating: it *is* a git repo — `git pull`, then reconcile: either commit your own changes (your fork) or reset to upstream and re-apply your diffs. Many users keep it pristine, learn from it, then graduate to their own config.
- Proper use: **change one thing at a time, comment what you changed**, and be able to delete any block you added without breaking the rest.

### 4.2 LazyVim — the productivity default

```bash
git clone https://github.com/LazyVim/starter ~/.config/nvim
cd ~/.config/nvim && rm -rf .git        # make it YOUR repo afterwards
nvim
```

Requirements: Neovim **≥ 0.11.2**, git ≥ 2.19, Nerd Font, C compiler. Run `:LazyHealth` after first start.

- Architecture: the starter sets up lazy.nvim and imports **LazyVim itself as a plugin**; *your* config is:
  - `lua/plugins/*.lua` — each file `return { … }` spec; **override by re-declaring** the same plugin with `opts = { … }` (tables are merged deep) or `config` (full control).
  - `lua/config/lazy.lua`, `options.lua`, `keymaps.lua` — your own defaults on top.
- **Extras** — curated language/tool packs (Python, LSPs, formatters, markdown, etc.): enable by importing their specs, e.g.
  ```lua
  -- lua/plugins/extras.lua
  return { { import = "lazyvim.plugins.extras.lang.python" } }
  ```
  (check current lazyvim.org extras list — it grows).
- Updating: `:Lazy sync` (updates LazyVim + plugins, respects `lazy-lock.json`). Commit the lockfile.
- Proper use: don't fight `opts` merges you don't understand — when a plugin misbehaves, read *its* docs via `:Lazy` → help, then override explicitly with `config = function()`.

### 4.3 AstroNvim — polish + community

```bash
git clone https://github.com/AstroNvim/template ~/.config/nvim
cd ~/.config/nvim && rm -rf .git
nvim
```

- v5 line; the template repo is *your* config that pulls AstroNvim core as a plugin.
- Customize in `lua/plugins/*.lua`: AstroNvim's convention is specs with `opts = require("astrocore").plugin_opts("plugin.name")`-style merging — the template's comments show the pattern; override keys in `opts`, not core files.
- **AstroCommunity** — a huge repo of extra plugin packs imported as specs (`{ import = "astrocommunity.pack.python" }`).
- Updating: `:Lazy sync` for plugins; template repo pulls core updates per AstroNvim docs (follow their migration notes between major versions — v4→v5 changed conventions).
- Proper use: treat `astrocore`/`astrolsp` option tables as your API; read `:help astrocore` before hacking.

### 4.4 NvChad — speed + themes

```bash
git clone https://github.com/NvChad/NvChad ~/.config/nvim -b v2.5
nvim   # first launch installs plugins; :NvChadUpdate later
```

- **Your layer is `lua/custom/` only** (the repo keeps `.git`, your changes live in `custom/` which is kept separate from core):
  - `chadrc.lua` — theme (90+ via base46), UI toggles, statusline/tabufline options.
  - `mappings.lua` — your keymaps.
  - `plugins.lua` — add/override plugins through NvChad's `chadrc` spec helpers.
- Updates: `:NvChadUpdate` pulls upstream core; your `custom/` survives. (Because the repo itself is the config, understand you carry an upstream remote — don't `git reset --hard` blindly.)
- Extras: built-in cheatsheet (`<leader>ch`-ish — see which-key/NvCheatsheet UI), theme switcher, terminal toggles.
- Proper use: set `chadrc` theme + your mappings first; resist rewriting their UI — it's the product.

### 4.5 SpaceVim, mini.nvim starter

- **SpaceVim**: `curl -sLf https://spacevim.org/install.sh | bash` — layered `~/.SpaceVim.d/init.toml` (`[options]`, layers like `lang#python`); Vimscript world, fine on servers, different mental model from lazy.nvim distros.
- **mini.nvim starter**: clone the starter, then assemble from `mini.*` modules (completion, pickers, snippets, surround…) — the "build your own LazyVim" middle path; great if LazyVim feels too magical but kickstart feels too bare.

## 5. Lazyman — the multi-config manager (deep dive)

**Lazyman** (doctorfree/nvim-lazyman) doesn't replace your config — it **installs, initializes, and switches among 100+ Neovim configurations** in isolated directories, so you can compare distros without destroying each other. Think of it as a package manager *for whole configs*.

### 5.1 Bootstrap

```bash
git clone https://github.com/doctorfree/nvim-lazyman $HOME/.config/nvim-Lazyman
$HOME/.config/nvim-Lazyman/lazyman.sh
```

- Installs the `lazyman` command into `~/.local/bin` (ensure it's on PATH).
- Requirements: Neovim 0.9+ (Lazyman can install one if missing), Bash 4+, git.
- Docs: `man lazyman` · in-editor `:h Lazyman` · lazyman.dev.

### 5.2 The workflow

```bash
lazyman                # interactive menu (recommended — the full UI)
lazyman -A -y          # install+init ALL supported configs (big download)
lazyman -B -y          # "Base" set only (curated, well-tested handful)
lazyman -X -y          # "Starter" configs (templates to fork)
lazyman -W -y          # "Personal" configs (famous people's setups)
lazyman -E <config>    # explore/run a specific installed config
lazyman -r -N <dir>    # remove one config (-R includes backups)
lazyman -l             # install a listed base config (see menu/flags)
```

- Flags evolve — **the no-argument menu is the authoritative UI**; `man lazyman` documents your installed version's flags.
- Categorized configs (Base / Personal / Starter / Language) are browsable in the menu, which also handles: installing tools, Bob (Neovim version manager) + version selection, health checks, status reports, Neovide toggle, and viewing the Lazyman manual.

### 5.3 How it keeps configs isolated (the mechanism you should steal)

1. Each config installs to its **own directory**: `~/.config/nvim-<Name>` (plus separate data/state).
2. Switching is done with the **`NVIM_APPNAME`** environment variable — Neovim then reads `~/.config/nvim-$NVIM_APPNAME` and its own data dir:
   ```bash
   NVIM_APPNAME=nvim-LazyVim nvim     # run LazyVim config
   NVIM_APPNAME=nvim-NvChad nvim      # run NvChad config
   echo $NVIM_APPNAME                 # verify
   ```
   (PowerShell: `$env:NVIM_APPNAME="nvim-LazyVim"; nvim`)
3. Lazyman's `lazyman -E <config>` wraps this for you — but knowing the raw variable means you can do the same trick for any config, **Lazyman or not** (see also [[Neovim_Tutorial]] §10.3).

### 5.4 When Lazyman is (and isn't) the right tool

| Use Lazyman when… | Skip Lazyman when… |
|---|---|
| You're choosing *between* distros | You already know which one you want (just install it) |
| You want a rotating "today I feel like X" setup | You want one config you fully own (that's kickstart/DIY) |
| Comparing how same task is done in 3 configs | Disk/bandwidth is tight (100+ configs is heavy with `-A`) |
| Trying famous people's configs as learning material | You dislike shell-script bootstrappers (use the distro's own installer) |

> [!warning] Lazyman hygiene
> - `-A` installs *everything* — start with `-B` (Base) or single configs.
> - Your real daily config is untouched (that's the point) — but confirm which `NVIM_APPNAME` is active before doing surgery.
> - Removed a config you liked? `-r` deletes it; keep `lazyman -E` notes on which you'd adopt.
> - Like a Lazyman-hosted config? Graduate: install it *directly* (its own installer) so its updates come from its authors, not through a third-party wrapper.

## 6. Using any distro properly — the rules

1. **Backup first** (§2). Always.
2. **Verify requirements** (Neovim version, Nerd Font, ripgrep) *before* blaming the distro. `nvim --version`, `:checkhealth`.
3. **Never edit upstream-owned files.** If you can't find your layer, find it before changing anything — that's what updates will overwrite.
4. **Override with intent**: re-declare plugin + `opts`/`config` in *your* spec file; keep a comment saying why.
5. **Learn its keymap map first** — `which-key` (or NvChad's cheatsheet) after install; give yourself 48 hours with defaults before remapping.
6. **Update through its own channel** (`:Lazy sync`, `:NvChadUpdate`, template pull) and read release notes for the *distro*, not just plugins.
7. **Commit your config + `lazy-lock.json`** — lockfile = reproducibility; `:Lazy restore` is your undo button.
8. **Trial side-by-side with `NVIM_APPNAME`** instead of overwriting your daily config; graduate only after a week of real use.
9. **Health-check after every major update**: `:checkhealth`, `:Lazy health`, `:Mason`, open a file with LSP attached.
10. **Plan your exit**: distros own your muscle memory. Your motions stay portable ([[Vim_Cheatsheet]]), but `<leader>xx` mappings are config-specific — keep a note of the handful you rely on.
11. **Don't stack distros.** One config dir per appname, period. Lazyman exists so you don't have to get clever.

## 7. Decision flowchart

```
First Neovim config, want to LEARN?  ──yes──▶ kickstart.nvim
        │no
Want to AUDITION several first?      ──yes──▶ Lazyman (-B, then explore)
        │no
Want IDE-now, best docs/ecosystem?   ──yes──▶ LazyVim          ◀── default recommendation
        │no
Want max polish + community packs?   ──yes──▶ AstroNvim
        │no
Want lightest + prettiest defaults?  ──yes──▶ NvChad
        │no
Want total control, no magic?        ──yes──▶ DIY config ([[Neovim_Tutorial]] §9)
                                             + maybe mini.nvim modules
```

## 8. Quick reference card

| Task | kickstart | LazyVim | AstroNvim | NvChad | Lazyman |
|------|-----------|---------|-----------|--------|---------|
| Install | clone → `nvim` | clone starter → `rm -rf .git` | clone template → `rm -rf .git` | clone `-b v2.5` | `git clone …nvim-Lazyman` → `lazyman.sh` |
| First-run check | read comments | `:LazyHealth` | open a file, `:Lazy` | wait for install, `:NvChadUpdate` later | `lazyman` menu |
| Your config lives in | `init.lua` | `lua/plugins/*.lua` | `lua/plugins/*.lua` | `lua/custom/` | n/a (it manages others) |
| Add a plugin | add spec to init | new file in `lua/plugins/` | new file in `lua/plugins/` | `custom/plugins.lua` | — |
| Update | git pull/merge | `:Lazy sync` | `:Lazy sync` + template | `:NvChadUpdate` | per-config channels |
| Run it alongside another | `NVIM_APPNAME=…` | `NVIM_APPNAME=…` | `NVIM_APPNAME=…` | `NVIM_APPNAME=…` | `lazyman -E <name>` |
| Docs | repo README | lazyvim.org | astronvim.com | nvchad.com + repo | `man lazyman`, `:h Lazyman`, lazyman.dev |

---

*Sources: LazyVim README/install docs (lazyvim.org), NvChad repo (v2.5), AstroNvim template, nvim-lua/kickstart.nvim, Lazyman docs (lazyman.dev — usage/install/configurations pages), daily.dev distro comparison, sumguy.com distro ramblings. Version numbers and flags drift: verify against each project's current README before installing.*
