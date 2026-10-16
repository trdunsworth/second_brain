---
type: cheatsheet
topic: Emacs key bindings and configuration frameworks — core editing, motion, search, Dired, Magit, Org-mode, ESS, completion, and a comparison of the eight mainstream Emacs distributions.
created: 2026-09-29
updated: 2026-10-16
status: active
tags:
  - emacs
  - org-mode
  - ess
  - keybindings
  - cheatsheet
  - terminal_stuff
---

# Emacs Cheatsheet

> Companion to [[Emacs_Tutorial]]. Notation: `C-x` = Ctrl+x, `M-x` = Alt/Meta+x, `RET` = Enter, `SPC` = Spacebar. In doubt: `C-h k <key>` explains any binding, `C-h m` lists all bindings in the current buffer.

## 1. Universal / help

| Key | Action |
|-----|--------|
| `C-g` | Abort / quit current command |
| `M-x` | Run command by name |
| `C-h t` | Tutorial |
| `C-h k <key>` | Describe key |
| `C-h f` / `C-h v` | Describe function / variable |
| `C-h m` | Describe current mode's keys |
| `C-x C-c` | Quit Emacs |

## 2. Files, buffers, windows

| Key | Action |
|-----|--------|
| `C-x C-f` | Open file |
| `C-x C-s` | Save |
| `C-x C-w` | Save as |
| `C-x b` | Switch buffer |
| `C-x C-b` | Buffer list (`d` mark, `x` kill) |
| `C-x k` | Kill buffer |
| `C-x 2` / `C-x 3` | Split horiz / vert |
| `C-x o` | Other window |
| `C-x 1` / `C-x 0` | Keep this window / delete this window |
| `C-x p p` | Find file in project |
| `C-x p k` | Kill project buffers |
| `C-x C-r` | Open read-only |

## 3. Motion (Emacs native)

| Key | Action |
|-----|--------|
| `C-f` / `C-b` | Char right / left |
| `C-n` / `C-p` | Line down / up |
| `M-f` / `M-b` | Word forward / back |
| `C-a` / `C-e` | Line begin / end |
| `M-a` / `M-e` | Sentence begin / end |
| `M-}` / `M-{` | Paragraph fwd / back |
| `C-v` / `M-v` | Scroll page down / up |
| `M-<` / `M->` | Buffer begin / end |
| `C-l` | Recenter (repeat: cycle position) |
| `M-g g` | Go to line number |
| `M-g n` / `M-g p` | Next / previous error (compile, flymake) |

## 4. Editing

| Key | Action |
|-----|--------|
| `C-SPC` | Set mark |
| `C-x C-x` | Exchange point and mark |
| `C-w` / `M-w` | Kill (cut) / copy region |
| `C-y` / `M-y` | Yank (paste) / previous kill |
| `C-/` or `C-x u` | Undo |
| `C-k` / `M-k` | Kill line / sentence |
| `C-d` / `M-d` | Delete char / word forward |
| `C-t` / `M-t` | Transpose char / word |
| `M-u` / `M-l` / `M-c` | Upper / lower / capitalize word |
| `M-SPC` | Just-one-space |
| `TAB` | Indent (in code); complete (in minibuffer) |
| `M-q` | Fill paragraph (wrap) |
| `M-%` | Query replace |
| `M-x replace-regexp` | Regexp replace |
| `C-x r s a` / `C-x r j a` | Register: save / jump |
| `C-x r m` / `C-x r b` | Bookmark: set / jump |

## 5. Search

| Key | Action |
|-----|--------|
| `C-s` / `C-r` | Incremental search fwd / back |
| `C-s C-s` | Next match |
| `M-s o` | Occur (match list buffer) |
| `C-M-s` / `C-M-r` | Regexp isearch fwd / back |

## 6. Dired (file manager)

| Key | Action |
|-----|--------|
| `C-x d` | Open Dired |
| `RET` / `^` | Enter file-or-dir / parent dir |
| `d` then `x` | Mark to delete / execute marks |
| `C` / `R` | Copy / rename marked |
| `m` / `%` | Mark by regexp / mark regexp |
| `o` | Open in other window |
| `+` | Create directory |
| `g` | Revert (refresh) |

## 7. Magit (git)

| Key | Action |
|-----|--------|
| `C-x g` | Magit status |
| `s` / `u` | Stage / unstage at point |
| `c c` | Commit (write msg, `C-c C-c`) |
| `P` / `F` | Push / pull |
| `l` | Log |
| `d` | Diff |
| `b` | Branch actions |
| `f` | File dispatch (`d` diff file, `l` log file) |
| `n` / `p` | Next/prev hunk |

## 8. Org-mode

### Structure & editing
| Key | Action |
|-----|--------|
| `M-RET` | New heading |
| `M-S-RET` | New TODO heading |
| `TAB` / `S-TAB` | Cycle subtree / global visibility |
| `M-←/→` | Promote / demote heading |
| `M-S-←/→` | Move subtree down / up |
| `C-c C-o` | Open link at point |
| `C-c *` | Insert plain-list bullet |
| `M-h` | Mark element/subtree |

### Tasks & agenda
| Key | Action |
|-----|--------|
| `C-c C-t` | Cycle TODO state |
| `C-c C-s` | Schedule (`SCHEDULED:`) |
| `C-c C-d` | Set deadline |
| `C-c .` | Insert active timestamp |
| `C-c !` | Insert inactive timestamp |
| `C-c a` | Agenda dispatcher (`a` agenda, `t` todos, `m` match, `s` search) |
| `C-c c` | Capture |
| `C-c C-w` | Refile subtree |
| `C-c C-x C-i` / `C-c C-x C-o` | Clock in / clock out |

### Tables
| Key | Action |
|-----|--------|
| `C-c \|` | Create/convert table |
| `TAB` / `RET` | Next cell / next row |
| `M-←/→` | Move column |
| `C-c -` | Insert hline |
| `C-c C-c` (on `#+TBLFM:`) | Recalc formulas |
| `C-c +` | Sum of active region |
| `C-c '` | Edit table formula / src block in special buffer |

### Babel & export
| Key | Action |
|-----|--------|
| `C-c C-c` | Execute/evaluate block or set keyword at point |
| `C-u C-c C-c` | Re-execute, replace results |
| `C-c '` | Edit src block in its major mode |
| `C-c C-v C-t` | Tangle file |
| `C-c C-v C-i` | Insert src block |
| `C-c C-e` | Export dispatcher |
| `C-c C-x C-l` | Toggle LaTeX preview |
| `M-RET` (in table) | — see Tables above |

## 9. ESS (R / SAS / Stata / Julia)

### Evaluation (from script buffer)
| Key | Action |
|-----|--------|
| `C-c C-c` | Region if active, else function/paragraph — send & step |
| `C-M-x` | Send function/paragraph (no step) |
| `C-RET` | Send region or line, step |
| `C-c C-n` | Send line, step |
| `C-c C-l` | Load file (`source()`) |
| `C-c C-v` | Help for object at point |
| `M-TAB` | Complete object/file name |
| `C-c C-z` | Toggle script ↔ R buffer |
| `C-c C-q` | Quit R process |
| `C-c C-e C-r` | Reload R process |
| `C-c C-e C-e` | `ess-execute` (evaluate expression) |
| `C-c C-x` | List objects (`ls()`) |
| `C-c C-s` | Search list (`search()`) |
| `C-h m` | All ESS bindings |

### In the inferior R buffer
| Key | Action |
|-----|--------|
| `RET` | Send line |
| `C-c C-o` | Delete last output |
| `C-c C-a` | Beginning of line after prompt |
| `M-p` / `M-n` | History prev / next |
| `C-c C-w` | Delete last word |
| `C-c C-l` | List command history |
| `C-c RET` | Copy old input (recall) |
| `C-c C-z` | Most recent script buffer |

> [!tip] Modern ESS note
> `_` no longer inserts `<-`; bind `ess-insert-assign` if you want the old behavior. Default evaluation is `ess-eval-visibly = 'nowait` (no freezes). Flymake linting needs the R package `lintr`.

## 10. Completion & modern extras (if installed)

| Key | Command |
|-----|---------|
| `C-x b` with vertico | Fuzzy/wrapped buffer completion |
| `M-x consult-ripgrep` | Project-wide grep |
| `M-x consult-line` | Search current buffer |
| `M-x consult-flymake` | Jump between lint diagnostics |
| `M-x profiler-start` → use → `M-x profiler-report` | Find what's slow |

## 11. Emergency reference

| Situation | Fix |
|-----------|-----|
| Stuck in a recursive edit | `C-M-c` exits it, `C-]` aborts it |
| Keys do nothing | `C-g` first; check you're not in a read-only buffer (`C-x C-q` toggles) |
| Lost cursor / buffer | `C-x b`, pick buffer |
| Window layout wrecked | `M-x winner-undo` (if winner-mode on) or `C-x 1` then re-split |
| Init file broken | `emacs -Q` (no config), fix `init.el`, restart |

## 12. Emacs Frameworks

[Here](https://www.linuxlinks.com/best-free-configuration-frameworks-emacs/) is my starting point — the LinuxLinks roundup of eight, last reviewed May 2026 with each framework page updated October 2026.

A *configuration framework* (a.k.a. an Emacs distribution) replaces your `.emacs.d` with curated defaults, a preset package set, and its own layer/module system. You adopt one to be productive in an afternoon instead of a month, then gradually strip it back toward vanilla as you learn what you actually want.

> [!warning] Read this before adopting one
> **§1–§11 of this cheatsheet document vanilla Emacs.** Doom, Spacemacs, Prelude, Purcell, Centaur and MinEmacs all rebind large parts of that surface — `C-x b`, `C-x C-s`, `C-c C-c` in ESS, the whole `M-x` muscle memory. Adopting one invalidates a chunk of this sheet. That is the trade, not a bug: you trade your existing bindings for a coherent, complete, fast setup on day one.
> The three that *don't* rebind you are **Crafted Emacs**, **minimal-emacs.d**, and (with care) **Purcell** — they extend rather than impose.

### 12.1 The eight at a glance

| Framework | Needs Emacs | License | Mental model | Windows? | Best for |
|-----------|-------------|---------|--------------|----------|----------|
| [Doom Emacs](https://github.com/doomemacs/doomemacs) | 29.1+ | MIT | ~150 optional modules, pinned packages, own CLI | ✅ native | Power users who want control *and* speed |
| [Spacemacs](https://www.spacemacs.org) | 28.2+ (+git, tar) | GPLv3 | Mnemonic `SPC` prefixes, layer system | ✅ native | Vim refugees; biggest community + docs |
| [Prelude](https://prelude.emacsredux.com) | 29.1+ | GPLv3 | Vanilla-first, opt-in modules | ✅ native | Want modern defaults without a framework's opinions |
| [Purcell Emacs](https://github.com/purcell/emacs.d) | 28.1+ | BSD-2 | Since 2000; a bundle, not a distribution | ✅ native | Pragmatic, doesn't impose keybindings |
| [Centaur Emacs](https://github.com/seagle0128/.emacs.d) | 28.1+ | GPLv3 | Ready-to-use, opinionated, lots of extras | ⚠️ Cygwin/MSYS only | Want everything on, don't want to decide |
| [MinEmacs](https://github.com/abougouffa/minemacs) | not specified | MIT | Batteries-included, deferred loading, modules | not stated | Fast daily driver, batteries but no opinion |
| [minimal-emacs.d](https://github.com/jamescherti/minimal-emacs.d) | not specified | GPLv3 | Tiny `early-init.el` + `init.el` scaffold | ❌ Linux/macOS | Building your own config from scratch |
| [Crafted Emacs](https://github.com/SystemCrafters/crafted-emacs) | not specified | MIT | Plain Elisp modules, no layer system | ✅ | Learning Emacs *and* wanting it to work now |

### 12.2 Notes on each

**[Doom Emacs](https://github.com/doomemacs/doomemacs)** — the most engineered option. Packages are *pinned* to exact commits, so `doom upgrade` is reproducible rather than a roulette spin. Ships `doom doctor` (diagnoses a broken install), treats lazy-loading as a first-class concern, and offers ~150 modules you enable declaratively in `init.el`. Evil-mode vim emulation is a flag, not a requirement — you can use leader keys instead. The only entry here with real CLI tooling wrapped around the config. Requires Emacs 29.1+.

**[Spacemacs](https://www.spacemacs.org)** — the famous one, and the largest community by a wide margin. Every command hangs off a mnemonic prefix: `SPC b` for buffers, `SPC f` for files, `SPC p` for projects. It runs either vanilla Emacs keys or Vim modal editing and lets you switch. The `layers` system is enormous and is both its strength (whatever you need probably exists) and its cost (configuration sprawl). GPLv3.

**[Prelude](https://github.com/prelude/prelude)** — deliberately stays near vanilla. Most functionality is opt-in modules; the parts it turns on are things Emacs 29 now does natively well (tree-sitter, Eglot, use-package). Notably it can be tested *without* touching your real config via `emacs --init-dir`. A good middle path: modern capabilities, no opinionated leader key.

**[Purcell Emacs](https://github.com/purcell/emacs.d)** — refined continuously since 2000, which shows: Corfu/Corafy completion, Vertico, Flymake + Flycheck, Eglot, Magit, Projectile, Org, plus strong Haskell/Elm/PureScript/OCaml and Common Lisp (Sly) support. Keeps `init-local` files so customisation never requires editing upstream files. BSD-2, and it does **not** rebind your keys.

**[Centaur Emacs](https://github.com/seagle0128/.emacs.d)** — the maximalist entry: Pomodoro timer, MPD music control, Docker, Chinese calendar/dictionary/Pinyin. Own update commands (`M-x centaur-update`). Note for this machine: **Windows support is via Cygwin/MSYS only**, which is a real friction point on a native Windows Emacs.

**[MinEmacs](https://github.com/abougouffa/minemacs)** — batteries-included with deferred loading, organised into modules that load on demand when you open a matching file. Customisation lives in `modules.el` / `config.el` in a separate user config directory, plus machine-local files and env vars. MIT.

**[minimal-emacs.d](https://github.com/jamescherti/minimal-emacs.d)** — the opposite end: a fast, quiet *scaffold*. Provides `early-init.el` and `init.el` with hook points (`pre-early-init.el`, `post-early-init.el`, `pre-init.el`, `post-init.el`), disables the startup screen/menu/tool/scroll-bars, and otherwise forces nothing. **Linux and macOS only** — not a Windows option.

**[Crafted Emacs](https://github.com/SystemCrafters/crafted-emacs)** — modular but deliberately *not* a framework: plain Elisp, no layer model or custom DSL, preferring built-in Emacs functionality. Optional modules for completion, IDE features, Org, UI, workspaces, writing, Lisp dev, startup, modal editing. Ships examples and docs so you learn while you use it, and integrates with Guix.

### 12.3 Picking one

| Answer honestly… | Then use |
|------------------|----------|
| Do I want to learn Emacs *and* have it work today? | **Crafted Emacs** |
| Will I be on native Windows? | **Doom**, **Spacemacs**, **Prelude**, or **Purcell** — skip Centaur (Cygwin/MSYS) and minimal-emacs.d (Unix-only) |
| Am I a Vim user? | **Spacemacs** (switchable) or **Doom** (evil-mode flag) |
| Do I want reproducibility and a doctor command? | **Doom** |
| Do I refuse to relearn keybindings? | **Crafted**, **minimal-emacs.d**, or **Purcell** |
| Do I just want it fast, batteries, no decisions? | **MinEmacs** or **Centaur** |
| Am I starting from a clean slate and want to learn the craft? | **minimal-emacs.d**, then build up |

For **this machine specifically** (Windows, no Emacs installed yet): install Emacs 29.1+ first, then start with **Doom** or **Spacemacs** if you want a complete setup immediately, or **Crafted Emacs** if the point is to understand what you're running. Note that on native Windows both Magit and `consult-ripgrep` want a POSIX-ish environment — ripgrep on Windows wants its `rg.exe` on `PATH`, and file paths in shell commands need care.

### 12.4 Installing — and how to escape

Every one of these replaces `~/.emacs.d`, which means the escape hatch is the same for all of them: **move the directory aside and you are back to vanilla Emacs instantly.**

```bash
# The universal undo — works for every framework in the table
mv ~/.emacs.d ~/.emacs.d.bak      # Windows PowerShell: Rename-Item $env:USERPROFILE\.emacs.d .emacs.d.bak
emacs -Q                          # confirm you can start clean before blaming the config

# Typical clone-and-go (substitute the repo for the one you want)
git clone https://github.com/doomemacs/doomemacs     ~/.emacs.d   # Doom
git clone https://github.com/syl20bn/spacemacs        ~/.emacs.d   # Spacemacs
git clone https://github.com/purcell/emacs.d          ~/.emacs.d   # Purcell
git clone https://github.com/jamescherti/minimal-emacs.d ~/.emacs.d  # minimal-emacs.d

# Doom additionally ships its own tooling
~/.emacs.d/bin/doom install
~/.emacs.d/bin/doom upgrade        # pinned commits -> reproducible
~/.emacs.d/bin/doom doctor         # diagnose a broken install
```

Commit your existing `.emacs.d` to git *before* adopting any of these. That turns "I lost my config" from a disaster into `git checkout .emacs.d`.

> [!tip] Don't start here
> §1–§11 of this sheet are a perfectly good vanilla setup, and most of the packages named in §10 (Vertico, Corfu, Eglot, Flymake, Consult, Projectile, Magit) are exactly what these frameworks install for you. Adopting a framework is the *fast* path; learning your own config is the *portable* one. You can do the second one whenever you want — and the framework you leave will make you faster at it.