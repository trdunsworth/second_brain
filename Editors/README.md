---
type: index
topic: Editors folder index — practical usage notes for Emacs, Neovim, Kakoune, and Helix on Mac and Linux, incl. customization, Org mode, and vault workflows
date: 2026-11-26
status: active
tags:
  - moc
  - editors
  - emacs
  - neovim
  - kakoune
  - helix
  - org-mode
  - setup
---

# Editors — Index

> Goal: make any of the four editors below **yours** — install on Mac + Fedora, understand the model, know exactly which files to edit to customize, and use each one against **this Obsidian vault**. Depth lives in `terminal_stuff/`; this folder is the *usage* layer: install, run, customize, adopt.

## Start here

| You want… | Go to |
|-----------|-------|
| One editor, one philosophy, deep integration | [[Emacs_Usage]] |
| Org mode for planning, notes, agendas, literate data work | [[Emacs_Org_Mode]] |
| Vim motions + plugins + LSP, max control | [[Neovim_Usage]] |
| A working IDE today, distro vs DIY decided | [[Neovim_Distro_Guide]] |
| Fewer keystrokes, selections as first-class citizens | [[Kakoune_Usage]] |
| Zero plugin tax, batteries included | [[Helix_Usage]] |
| Edit **this vault** with any of them, in Markdown/Org/plain formats | [[Vault_Editor_Workflows]] |
| Learn from zero (full tutorials) | [[Emacs_Tutorial]] · [[Neovim_Tutorial]] · [[Vim_Tutorial]] · [[Kakoune_Tutorial]] · [[Helix_Tutorial]] |
| Quick keys, no prose | [[Emacs_Cheatsheet]] · [[Neovim_Cheatsheet]] · [[Vim_Cheatsheet]] · [[Kakoune_Cheatsheet]] · [[Helix_Cheatsheet]] |

## The notes

### Per editor
| Note | What it is |
|------|------------|
| [[Emacs_Usage]] | Install (Mac/Fedora), `-nw` vs GUI, survival keys, buffers/windows, packages (use-package, MELPA), **customization primer**: every file that matters + a working starter init |
| [[Emacs_Org_Mode]] | Org mode: headings/TODO/agenda/capture/tables, **org-babel** for R/Python/shell, export to Markdown, using org alongside this vault |
| [[Neovim_Usage]] | Install, config architecture (`init.lua` layout), lazy.nvim vs new built-in `vim.pack`, LSP/Mason/Treesitter, **customization primer**: the first five edits to make |
| [[Neovim_Distro_Guide]] | LazyVim · AstroNvim · NvChad · kickstart · mini.nvim · SpaceVim · Lazyman — install, customize **without forking**, update safely, audition with `NVIM_APPNAME` |
| [[Kakoune_Usage]] | Install, selection-first model, multi-select toolbox, client/server sessions, kakrc + hooks, **kak-lsp** LSP setup |
| [[Helix_Usage]] | Install, select→act model, built-in LSP/DAP/pickers, no plugins — shell integration instead, `config.toml`/`languages.toml` |

### Shared
| Note | What it is |
|------|------------|
| [[Vault_Editor_Workflows]] | Editing this Obsidian vault from each editor: obsidian.nvim, markdown LSP, clipboard/URIs, git commits, **format matrix** (Markdown ↔ Org ↔ other), capture flows, pitfalls |

## The field at a glance

| | **Emacs** | **Neovim** | **Kakoune** | **Helix** |
|---|---|---|---|---|
| Model | Non-modal, key-chord driven | Vim: verb → object | **Select → act** | **Select → act** |
| Config language | Emacs Lisp | Lua (`init.lua`) | KakouneScript (`kakrc`) | TOML |
| Extensibility | Enormous (ELPA/MELPA) | Enormous (Lua plugins) | Scriptable, small ecosystem | **None — by design** |
| Built-in LSP | via eg/lsp-mode plugin | client built-in, add servers | via **kak-lsp** plugin | **built-in, zero config** |
| Built-in treesitter | Yes (Emacs 29+ modes) | Yes (core, 0.10+) | No | Yes |
| Multi-cursor | via plugins (`multiple-cursors`) | via plugins | **native, central** | **native, central** |
| Best at | Org mode, dired, TRAMP, anything-as-a-buffer | IDE-grade dev with max control | fastest bulk multi-select edits | out-of-box IDE feel |
| Current version | **31.1** (Aug 2026) | **0.12.6** (Oct 2026) | **2026.05.21** | **25.07.1** tag (master active) |
| Install Mac | `brew install emacs-plus@31` | `brew install neovim` | `brew install kakoune` | `brew install helix` |
| Install Linux (Fedora) | `sudo dnf install emacs` | `sudo dnf install neovim` | `sudo dnf install kakoune` | distro package may lag |
| Plugin tax | medium | high (or zero, if you read the config) | low–medium | **zero** |
| Learning curve | steep, wide | steep, narrow first | moderate | **gentlest** of the four |

## How they fit together

```
Editors/
├── Emacs_Usage ───────┬─► Emacs_Org_Mode ─── vault export / org-babel
│                      └─► Lisp_Editor_Integrations (CIDER/SLIME)
├── Neovim_Usage ──────┬─► Neovim_Distro_Guide (LazyVim/AstroNvim/NvChad/Lazyman)
│                      └─► obsidian.nvim (see Vault_Editor_Workflows)
├── Kakoune_Usage ─────► kak-lsp + tmux (Tmux_Tutorial)
├── Helix_Usage ───────► zero-config LSP + pickers
└── Vault_Editor_Workflows ◄── any editor, this Markdown vault, git
```

Every note here assumes the environment built by [[Terminal_Fluency_Program]] Week 0 (Fedora/Ubuntu lab, dotfiles repo, ripgrep/fzf) and the runtime context from [[Tmux_Tutorial]] + [[Obsidian_CLI]].

## Which one? (30-second version)

- **"I want one tool that grows into everything"** → Emacs (pair with [[Emacs_Org_Mode]]). Highest ceiling, highest investment.
- **"I want Vim power + a real IDE, and I'll enjoy tinkering"** → Neovim DIY ([[Neovim_Usage]] §9 lab) or LazyVim ([[Neovim_Distro_Guide]]).
- **"I do lots of repetitive edits and hate reaching for the mouse"** → Kakoune ([[Kakoune_Usage]]) — the `<a-k>`/`s` multi-select toolbox is unreasonably good.
- **"Just make LSP work and leave me alone"** → Helix ([[Helix_Usage]]).
- **"I edit this vault all day, in any editor"** → [[Vault_Editor_Workflows]] — pick per editor, one config each.

## Status

- [x] Folder: 7 notes (this index + 6 usage/guide notes), versions verified 2026-11-26
- [ ] Install one editor end-to-end on the Intel Mac + Fedora lab (manual)
- [ ] Customization pass #1 for the chosen editor (each note's §Customization checklist)
- [ ] Vault workflow wired ([[Vault_Editor_Workflows]] §"First wiring")