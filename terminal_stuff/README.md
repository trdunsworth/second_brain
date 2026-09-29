---
type: index
topic: terminal_stuff folder index — terminal education notes (bash, editors, tmux, TUIs, Obsidian CLI)
date: 2026-09-29
status: active
tags:
  - moc
  - terminal
  - linux
  - terminal_stuff
---

# terminal_stuff — Index

> Goal: the map for this folder. **Start at [[Terminal_Fluency_Program]]** if you're training; everything else is lookup material the program points to.

## Start here

| You want… | Go to |
|-----------|-------|
| A structured plan to become terminal-fluent | [[Terminal_Fluency_Program]] ← **the spine** |
| One big CLI lookup table (commands, flags, recipes) | [[Linux_Terminal_Toolkit]] |
| Terminal multiplexing (panes, sessions, SSH survival) | [[Tmux_Tutorial]] → [[Tmux_Cheatsheet]] |
| Which TUI apps to install (git, files, logs, data) | [[TUI_Programs]] |
| Drive Obsidian from the shell (search, capture, daily notes) | [[Obsidian_CLI]] |

## The notes

### Training
| Note | What it is |
|------|------------|
| [[Terminal_Fluency_Program]] | 8-week calibrated curriculum: phases, drills, exercises, capstone; Week 0 environment done (WSL/Ubuntu, tools, lab, dotfiles) |

### Terminal core
| Note | What it is |
|------|------------|
| [[Linux_Terminal_Toolkit]] | The reference: coreutils, text pipeline, search, package managers, safety checklist |
| [[Tmux_Tutorial]] | Learn tmux — sessions, panes, copy mode, §7 baseline config (installed) |
| [[Tmux_Cheatsheet]] | tmux keys at a glance |
| [[TUI_Programs]] | Catalog of TUIs worth installing, with get-productive keys |

### Editors
| Note | What it is |
|------|------------|
| [[Vim_Tutorial]] | Modal editing from zero — **chosen editor path** |
| [[Vim_Cheatsheet]] | Vim keys at a glance |
| [[Neovim_Tutorial]] | Vim's modern successor: LSP, plugins, lazy.nvim |
| [[Neovim_Cheatsheet]] | Neovim keys/config at a glance |
| [[Neovim_Distributions]] | LazyVim, NvChad, AstroNvim compared + decision flowchart |
| [[Emacs_Tutorial]] | The other path: org, magit, dired |
| [[Emacs_Cheatsheet]] | Emacs keys at a glance |
| [[Helix_Tutorial]] | Selection-first path: Kakoune's model + built-in LSP, zero plugins |
| [[Helix_Cheatsheet]] | Helix keys at a glance |
| [[Kakoune_Tutorial]] | The selection-first original: noun then verb, scriptable |
| [[Kakoune_Cheatsheet]] | Kakoune keys at a glance |

### Vault from the shell
| Note | What it is |
|------|------------|
| [[Obsidian_CLI]] | Official Obsidian CLI + TUI, one-shot recipes, alternatives (`ob`, obsidian.nvim) |

## How they fit together

```
Terminal_Fluency_Program  (learn in this order)
  ├─ Phase 0 ✔ ── environment: WSL/Ubuntu, tools, ~/lab, dotfiles, tmux §7
  ├─ lookup ──── Linux_Terminal_Toolkit  (the table you keep open)
  ├─ sessions ── Tmux_Tutorial/ Cheatsheet
  ├─ tools ───── TUI_Programs  (added phase by phase, not all at once)
  ├─ editor ──── Vim_Tutorial/ Cheatsheet  (Neovim_*/Helix_*/Kakoune_* = later ladders)
  └─ capture ─── Obsidian_CLI  (drill results → daily notes)
```

## Status

- [x] Folder: 18 notes (17 content + this index), cross-linked, frontmatter verified
- [x] Week 0 environment: WSL2 Ubuntu 24.04 — bash 5.2, systemd, tmux 3.4, vim 9.1, rg/fd/bat/fzf/zoxide/jq/shellcheck/gh/delta/tldr, `~/lab` + `~/dotfiles` repos
- [ ] `gh auth login` — **manual**: run inside WSL, completes Phase 0 fully
- [ ] Program Week 1 → see [[Terminal_Fluency_Program]] §4
