---
type: usage-note
topic: Emacs usage — install on Mac/Linux, survival keys, buffers/windows, packages, and a customization primer
date: 2026-11-26
status: active
tags:
  - editors
  - emacs
  - setup
  - customization
---

# Emacs — Usage Notes

> Goal: Emacs installed and running on **both Macs and Fedora**, the survival keys burned in, and a config you can read line-by-line. Emacs is the "one tool that grows into everything" choice — the price is a configuration you *own* forever. **Current stable: 31.1** (Aug 2026; ships Org 9.8, terminal mouse by default, built-in `which-key`, `user-lisp/` config dir).
> Related: [[Emacs_Tutorial]] (learning path) · [[Emacs_Cheatsheet]] (keys) · [[Emacs_Org_Mode]] (org deep-dive) · [[Lisp_Editor_Integrations]] (CIDER/SLIME) · [[Obsidian_CLI]] · [[Vault_Editor_Workflows]]

## How to use this note

1. **§1–§3 once** — install on each machine, run it, learn `C-h`.
2. **§4–§5** — daily survival (keys, buffers/windows, files).
3. **§6** — packages without fear.
4. **§7 customization** — the whole config surface + a starter file you can paste today.
5. **§9–§10** — decision + plan.

---

## 1. Install

| Platform | Command | Notes |
|----------|---------|-------|
| macOS | `brew install emacs-plus@31 --with-native-comp` (tap `d12frosted/emacs-plus` first) | Best macOS build: proper icon, `--with-natural-titlebar`, native compilation for speed |
| macOS (simple) | `brew install --cask emacs` | Works; occasionally PATH-ish quirks with the Cask (use `open -a Emacs` or the `emacs` shim) |
| macOS (ports) | MacPorts: `sudo port install emacs-app` | If you already run MacPorts |
| Fedora | `sudo dnf install emacs` | Fedora 45+ ships 31.x — current |
| Ubuntu/Debian | distro pkg often stale (29.x) → `sudo snap install emacs --classic`, Flatpak, or build from a GNU mirror tarball | Verify: `emacs --version` inside the snap has quirks; a source build is 10 min |
| Arch | `sudo pacman -S emacs` | |
| Any | `git clone git://git.sv.gnu.org/emacs.git` + Autotools | Trunk, if you like `M-x report-emacs-bug` rabbit holes |

Terminal-only usage: `emacs -nw` runs inside tmux ([[Tmux_Tutorial]]). Server mode for instant startups:

```bash
# GUI: run once per boot (or via launchd/systemd)
emacs --daemon
emacsclient -c        # new frame instantly (GUI)
emacsclient -t        # frame inside the terminal
```

Verify: `emacs --version` → 31.x. Health: `M-x verify-emacs-subdirs`? No — the real health check is `C-h n` (news since last release) and `M-x list-packages` opening.

## 2. First run — the self-documenting editor

Emacs is *self-documenting*; that is the onboarding. Learn these six, never need a tutorial site again:

| Keys | What |
|------|------|
| `C-h t` | The built-in interactive tutorial (do it once, ~30 min) |
| `C-h k <keys>` | What does this key do? (works for menus, mouse, anything) |
| `C-h f` / `C-h v` | Describe function / variable (the docs you actually need) |
| `C-h m` | All bindings active in the current buffer's modes |
| `C-h a` | Apropos: search commands by regex (`C-h a file` → file commands) |
| `C-h n` | News for your version — read when you upgrade |

Notation: `C-x` = Ctrl+x, `M-x` = Alt+x (or `Esc` then x), `RET` = Enter. `C-g` cancels anything — the universal undo of "stuck".

> [!tip] The stance
> You never "learn Emacs"; you learn `C-h` and discover one command at a time. People who memorize keymaps burn out; people who ask Emacs compound.

## 3. Files, buffers, windows

| Concept | Keys/commands |
|---------|---------------|
| Open/save | `C-x C-f` (find-file), `C-x C-s` (save), `C-x s` (save-some-buffers) |
| Buffers | `C-x b` switch, `C-x C-b` list, `C-x k` kill |
| Windows | `C-x 2` split below · `C-x 3` split right · `C-x 0/1` close/only · `C-x o` other window |
| Recent files | `C-x r`? No — `C-x C-r`? Use `M-x recentf-open-files` (see §7 starter) |
| Dired (file manager) | `C-x d` — browse dirs like a buffer: `d` mark delete, `R` rename, `+` mkdir, `C` copy |
| Remote files (TRAMP) | `C-x C-f /ssh:fedora-box:/home/me/notes.md<ret>` — edit remote files as if local |
| Shell | `M-x shell` or `M-x eshell` — a full shell in a buffer |
| Search | `C-s` incremental (swiper-like out of the box), `M-%` query-replace |
| Registers/marks | `C-x r SPC a` save position · `C-x r j a` jump |

Config-as-editing is the Emacs superpower: **`M-x customize`** edits your init for you, and `C-h v` on any option shows its current value.

## 4. The editor you actually type in

- **Minibuffer** (`M-x`) is almost the whole UI. Learn completion: type `M-x reci <TAB>`.
- **Region + `C-w`/`M-w`/`C-y`** (kill/yank) — Emacs' cut/copy/paste; kill-ring keeps everything (`M-y` cycles after `C-y`).
- **Undo** is a tree: `C-/` (or `C-_`) repeatedly; `C-g u`? No — `C-x u` opens `undo-tree-visualize` if you install `undo-tree`.
- **Multiple cursors**: `multiple-cursors` package (`.` while marking) — not native but solid.
- **Completion framework**: stock is fine; popular upgrade is Vertico/Consult/Orderless/Marginalia (§7).
- **LSP**: `eglot` (now maintained inside Emacs core; `M-x eglot`) or `lsp-mode` (heavier, more features). Either needs the server binary on PATH (`markdown-oxide`, `pyright`, `lua-language-server` …).
- **Markdown/Org/vault**: markdown-mode for `.md`, org-mode for `.org` (see [[Emacs_Org_Mode]]), and [[Vault_Editor_Workflows]] for the Obsidian-specific wiring.

## 5. Packages — where features come from

Emacs 31 bundles `package.el` with three archives configured by default:

| Archive | What | Enable how |
|---------|------|------------|
| GNU ELPA | Official GNU packages (incl. `use-package`, bundled since 29) | Default |
| NonGNU ELPA | Community-mainarded under GNU umbrella (`vertico`, `consult`, …) | Default |
| MELPA | The big community archive (thousands) | Add `("melpa" . "https://melpa.org/packages/")` to `package-archives` |

```elisp
;; one-time bootstrap in init.el
(require 'package)
(add-to-list 'package-archives '("melpa" . "https://melpa.org/packages/") t)
(package-initialize)              ; or :bind with use-package, which defers itself
(unless package-archive-contents  ; refresh archives once
  (package-refresh-contents))
```

`M-x package-list-packages` → browse/install; **31.1's new package-review** shows diffs before install/upgrade — read them when a package updates. The declaration layer everyone should use is **`use-package`** (bundled):

```elisp
(use-package magit
  :ensure t                       ; install if missing
  :bind (("C-x g" . magit-status)))
```

Alternatives for the brave: `straight.el` (reproducible, git-based; what Doom uses) or Nix/`guix` profiles. For a second machine, `~/.emacs.d` **is** the dotfile — commit it ([[Terminal_Fluency_Program]] Phase 0).

## 6. Customization — every file that matters

| File | Purpose | Edit when… |
|------|---------|-----------|
| `~/.emacs` or `~/.emacs.d/init.el` | The config proper | always |
| `~/.emacs.d/early-init.el` | Runs before GUI init — `package-enable-at-startup`, frame tweaks, faster startup | tuning startup/UI |
| `~/.emacs.d/user-lisp/` | **New in 31.1**: drop `.el` files here (or subdirs); auto byte-compiled and load-pathed | your own libraries/custom code |
| `M-x customize-*` | Generates `custom-set-*` blocks *inside* init.el | you'd rather click than type |
| `.mc-lists.el`, `bookmarks`, `savehist` | State files | don't hand-edit; back them up |

Principles: (1) wrap every external thing in `use-package` with `:bind`/`:hook` — lazy by default; (2) set options via `setq` near their use; (3) keep experimental stuff in a clearly-marked block you can cut; (4) **commit the whole `.emacs.d`** and tag before big changes.

### Starter init (works today, ~50 lines)

```elisp
;;; init.el — minimal first config
(setopt package-native-compile t)
(tool-bar-mode -1) (menu-bar-mode -1) (scroll-bar-mode -1)
(column-number-mode 1)
(setopt display-line-numbers-type 'relative) (global-display-line-numbers-mode 1)
(savehist-mode 1) (recentf-mode 1)              ; history + recent files
(setopt use-short-answers t)                    ; y/n instead of yes/no
(global-set-key (kbd "C-x C-r") 'recentf-open-files)
(add-hook 'prog-mode-hook #'electric-pair-mode) ; auto-close parens/quotes

(use-package vertico :init (vertico-mode))                      ; completion UI
(use-package consult :bind (("C-x b" . consult-buffer)))        ; better switchers
(use-package orderless :init (setopt completion-styles '(orderless basic)))
(use-package marginalia :init (marginalia-mode))                ; annotations in minibuffer

(use-package modus-themes
  :init (load-theme 'modus-vivendi-tinted :no-confirm))         ; accessible light+dark

(use-package magit :bind (("C-x g" . magit-status)))
(use-package markdown-mode :mode ("\\.md\\'" . gfm-mode))
(use-package which-key :init (which-key-mode))                  ; bundled in 30+, keep for older
(use-package eglot
  :hook ((python-mode rust-ts-mode markdown-mode) . eglot-ensure))
```

### First five customization moves

1. **Theme + font** (`modus-themes`, or `ef-themes`; `M-x customize-face` — try `modus-vivendi` for dark).
2. **Kill the chrome** (`tool-bar-mode -1` etc.) and turn on `display-line-numbers`.
3. **Rebind the muscle-memory blockers**: `C-x C-r` recentf, `M-g g` goto-line, and tame `C-x C-b` with Consult.
4. **Add one `use-package` you'll use hourly** — `magit` (git), `eglot` (LSP), `markdown-mode` (this vault).
5. **Start the daemon** (`emacs --daemon`, above) so Emacs is instant; put the launchd/systemd unit in dotfiles.

### If you'd rather not start from zero

Starter kits: **Doom Emacs** (fast, opinionated, huge community — but you learn *its* keys), **Spacemacs** (vim/emacs hybrid layers), **Nano Emacs** (minimal), **Backpack** (new, plain-emacs friendly). Rule: run vanilla first for a week (you can read every line of the starter file above), then adopt a kit *knowing* what it wraps. Roadmap: [[Emacs_Tutorial]].

## 7. Why Emacs beyond editing

| Use | How |
|-----|-----|
| Notes/planning/agendas | **Org mode** — bundled; see [[Emacs_Org_Mode]] |
| REPL-driven Lisp/Clojure/Common Lisp | CIDER/SLIME — [[Lisp_Editor_Integrations]] §2 |
| Git | `magit-status` (`C-x g`) — arguably the best git UI anywhere |
| Remote ops | TRAMP + `eshell` — `C-x C-f /ssh:…` edits remote files |
| Email/RSS/IRC/LaTeX/Agenda/LLM clients | All exist as packages; the joke is true — it's an OS |

## 8. Decision + learning plan

Pick Emacs if you want the highest ceiling and will actually invest; pick [[Neovim_Usage]] if you want IDE features with a shallower config; [[Helix_Usage]] if you want zero config.

| Phase | Do | Exit check |
|-------|----|-----------|
| 1 | Install on Mac + Fedora; `C-h t` tutorial once | `emacs --version` 31.x both machines |
| 2 | Survival keys §3 — open/save/split/dired without menus | Edit a note with zero mouse |
| 3 | Paste starter init §6; fix any error in `*Messages*` | Clean start, theme + completion live |
| 4 | `use-package`: add magit + markdown-mode; commit `~/.emacs.d` | Git status of your dotfiles exists |
| 5 | Org mode — [[Emacs_Org_Mode]] §1–3 | First agenda view with this vault |
| 6 | Wire for the vault — [[Vault_Editor_Workflows]] | Open `2026-*.md` in markdown-mode |

- [ ] Phase 1 · [ ] Phase 3 · [ ] Phase 5

### Quick reference

| Need | Answer |
|------|--------|
| Any key | `C-h k <keys>` |
| Run a command | `M-x name` |
| Split window | `C-x 2` / `C-x 3` |
| Remote file | `C-x C-f /ssh:host:/path` |
| Install package | `M-x package-refresh-contents` → `M-x package-list-packages` |
| Git | `C-x g` (magit) |
| Org | `C-c a` agenda · `C-c c` capture — [[Emacs_Org_Mode]] |