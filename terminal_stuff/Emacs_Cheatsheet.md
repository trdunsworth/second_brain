---
type: cheatsheet
topic: Emacs key bindings — core, org-mode, ESS
date: 2026-09-29
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
