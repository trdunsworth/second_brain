---
type: learning-note
topic: Emacs tutorial — core editing, org-mode, and ESS for data science
date: 2026-09-29
status: active
tags:
  - emacs
  - org-mode
  - ess
  - r
  - data-science
  - terminal_stuff
  - learning-plan
---

# Emacs Tutorial — From Zero to Literate Data Science

> Goal: get productive in Emacs for **writing, org-mode knowledge work, and R/data-analytics via ESS**, in that order. Emacs is an operating system that happens to contain a text editor; you don't learn it all at once, you grow into it.
> Related: [[Emacs_Cheatsheet]] (quick keys), [[Neovim_Tutorial]] / [[Vim_Tutorial]] (modal-editor counterparts), [[quarto_notes|quarto_notes]] (reporting), [[duckdb_notes|duckdb_notes]] (data), [[julia_notes|julia_notes]] (compute)

## How to use this note

1. **§1–§4 once** — install, mental model, survival keys, files/buffers/windows.
2. **§5–§7 daily** — editing, navigation, Magit/git.
3. **§8 org-mode** — structure and agenda until it feels natural.
4. **§9 ESS** — the R-in-Emacs workflow; do the walkthrough with a scratch `.R` file.
5. **§10** — the full literate data-science loop (org + ESS + Babel), the actual payload.
6. Keep [[Emacs_Cheatsheet]] open in another window while you learn.

---

## 1. Install

| Platform | Command / source |
|----------|------------------|
| Windows  | `winget install GNU.Emacs` (or installer from gnu.org/software/emacs) |
| macOS    | `brew install emacs` (or `brew install --cask emacs` for the app bundle) |
| Debian/Ubuntu | `sudo apt install emacs` (often older; consider the snap or build for current) |
| Fedora   | `sudo dnf install emacs` |

- Current release series: **Emacs 30.x** (2026). ESS requires Emacs ≥ 25.1, so anything current is fine.
- Config file: `~/.emacs.d/init.el` (Windows: `%APPDATA%\.emacs.d\init.el` or wherever `M-x system-find-user-init-file` points you).
- First launch basics: `C` = Ctrl, `M` = Meta (Alt; on some terminals `Esc` substitutes). `C-g` = abort anything, always.
- `M-x` runs a command by name. `C-h ?` opens the help system. `C-h t` is the built-in tutorial — **actually do it once**.

## 2. The mental model (learn five words)

| Word | Meaning |
|------|---------|
| **Frame** | One OS window containing everything below |
| **Window** | A split pane inside the frame (yes, Emacs calls splits "windows") |
| **Buffer** | A chunk of text in memory — a file being edited, a log, a search result, anything |
| **Point** | The cursor (one character, *between* which two characters the point sits matters) |
| **Mark** | A saved location; the region is mark↔point, the basis of most editing |

Everything is a buffer. `C-x b` moves between buffers; `C-x C-f` opens a file *into* a buffer. The **mode line** at the bottom of each window tells you buffer name, major mode (`R`, `Org`, `Dired`), and line/column.

## 3. Survival keys

| Key | Action |
|-----|--------|
| `C-g` | Quit/abort the current command (press twice if confused) |
| `M-x` | Run command by name, with completion |
| `C-x C-f` | Find file (open) |
| `C-x C-s` | Save buffer |
| `C-x C-w` | Save as… |
| `C-x C-c` | Quit Emacs (it won't lose unsaved buffers without asking) |
| `C-/` or `C-x u` | Undo (redo: redo-mode, or `C-/` repeatedly walks the undo tree with undo-tree if installed) |
| `C-h t` | The tutorial |
| `C-h k` then key | What does this key do? |
| `C-h f` / `C-h v` | Describe function / variable |

> [!tip] The three-phase learning curve
> Phase 1: survive with the table above (hours). Phase 2: stop reaching for arrow keys and the mouse (days). Phase 3: `M-x` becomes muscle memory and you start writing Elisp snippets (weeks–forever).

## 4. Files, buffers, windows

### Buffers
- `C-x b` — switch buffer (completion).
- `C-x C-b` — buffer list; `d` mark, `x` kill, `RET` visit.
- `C-x k` — kill buffer.

### Windows (panes)
| Key | Action |
|-----|--------|
| `C-x 2` | Split horizontally (top/bottom) |
| `C-x 3` | Split vertically (side by side) |
| `C-x o` | Move point to the **o**ther window |
| `C-x 1` | Delete other windows (keep this one) |
| `C-x 0` | Delete this window |
| `C-x ^` / `C-x }` | Grow window taller/wider |

### Files and projects
- `C-x C-f` — find file; type `/` or `~` to jump anywhere; `M-TAB` completes paths.
- `C-x C-r` — open file read-only.
- **Projects (built-in, Emacs 28+)**: `C-x p p` project-find-file, `C-x p p`/`C-x p f`, `C-x p k` kill project buffers, `C-x p g` grep in project. Works off git/`.project` roots.

## 5. Editing the Emacs way

The grammar is **operator + object**: `C-`/`M-` prefixed commands act on the region or on units of text.

| Task | Keys |
|------|------|
| Set mark at point | `C-SPC` (or `C-@`) |
| Swap point and mark | `C-x C-x` |
| Kill (cut) region | `C-w` |
| Copy region | `M-w` |
| Paste (yank) | `C-y` |
| Cycle through older kills | `M-y` after `C-y` |
| Undo | `C-/` |
| Kill to end of line | `C-k` (repeat to kill more lines) |
| Kill whole line | `M-k` |
| Transpose characters/words/lines | `C-t` / `M-t` / `C-x C-t` |
| Uppercase/lowercase word | `M-u` / `M-l` |
| Capitalize word | `M-c` |
| Auto-fill (wrap) toggle | `M-q` |

### Search and replace
- `C-s` — incremental search forward; `C-s C-s` repeats; `C-r` searches backward; `RET` exits; `C-w` extends by word.
- `M-%` — query replace; answer `y`/`n`/`!`/`q`.
- `M-x replace-regexp` — regexp replacement.
- `M-s o` / `M-x occur` — show all matches in a buffer you can edit and jump through.

### Mark, register, bookmark
- Mark ring: `C-SPC C-SPC` pops back to the previous mark; `C-u C-SPC` walks the ring.
- Registers: `C-x r j` / `C-x r s` jump-to/save in a register; great for "this window layout, remember it".
- Bookmarks: `C-x r b` bookmark-jump, `C-x r m` set; persists across sessions.

## 6. Modes

- **Major mode** — one per buffer: `text-mode`, `org-mode`, `R-mode` (via ESS), `python-mode`, `emacs-lisp-mode`. Sets editing rules.
- **Minor modes** — toggles layered on top: `flyspell-mode`, `visual-line-mode`, `org-indent-mode`.
- `M-x describe-mode` or `C-h m` — list every key currently alive *in this buffer*. Do this often; it's the answer to "what key does X now?"

Enabling for a file type: `(add-to-list 'auto-mode-alist '("\\.md\\'" . markdown-mode))` or use `M-x auto-mode-alist`… just set it in init.el.

## 7. Dired, Magit, and not doing it in a browser

### Dired — the file manager
`C-x d` opens a directory buffer.
- `RET` visit file/dir, `^` go up, `d` mark for delete, `x` execute, `C` copy, `R` rename, `+` mkdir, `m` mark by regexp, `%` regexp-mark, `o` open in other window, `^` parent dir.
- Edit directory listings like text (yes, really) then `C-c C-c` to apply.

### Magit — git that will convert you
`M-x magit-status` (or `C-x g` if you bind it).
- `s` stage file/hunk (point on it), `u` unstage, `c c` commit (write message, `C-c C-c`), `P` push, `F` pull, `l` log, `d` diff, `b` branch, `f` file dispatch.
- Magit is the single most cited reason people stay in Emacs. Learn it incrementally — stage and commit first, the rest as needed.

## 8. Org-mode — notes, tasks, and literate documents

Org is Emacs' killer app for structured writing: headings become an outline, TODO states become a task system, tables become spreadsheets, code blocks become executable analysis.

Open any `.org` file (`org-mode` activates automatically).

### 8.1 Structure

| Key | Action |
|-----|--------|
| `M-RET` | New heading at same level |
| `M-S-RET` | New TODO heading |
| `TAB` | Cycle visibility of subtree / whole buffer |
| `S-TAB` | Cycle global visibility |
| `M-left/right` | Promote/demote heading |
| `M-S-left/right` | Move subtree up/down |
| `C-c *` | Insert plain-list / bullet |

Example:

```org
* Data Science Project
** DONE Load raw data
** TODO Join reference tables
   DEADLINE: <2026-10-03 Sat>
** TODO Fit model and write up
```

### 8.2 TODO workflow and agenda

- `C-c C-t` — cycle TODO state (`TODO` ⇄ `DONE`, configurable sequences per file via `#+TODO: TODO INPROG | DONE CANCELLED`).
- `C-c C-s` — **schedule** item (`SCHEDULED:` date), `C-c C-d` — set **deadline**.
- `C-c a` — the **agenda**: `a` agenda view, `t` todo list, `m` match tags, `s` search. This is where org becomes a GTD system.
- `C-c c` — **capture** (after configuring `org-capture-templates`): inbox a thought from anywhere in Emacs in 5 seconds.

Minimal capture config for your init.el:

```elisp
(setq org-capture-templates
      '(("t" "Task" entry (file+headline "~/org/inbox.org" "Inbox")
         "* TODO %?\n%U\n")
        ("n" "Note" entry (file+headline "~/org/notes.org" "Notes")
         "* %?\n%U\n%i\n")))
```

### 8.3 Tables

Org tables are live spreadsheets with formulas.

| Key | Action |
|-----|--------|
| `C-c \|` | Create a table (or convert region) |
| `TAB` / `RET` | Next cell / next row |
| `M-left/right` | Move column left/right |
| `C-c -` | Insert horizontal rule row |
| `C-c C-c` on `#+TBLFM:` | Recalculate all formulas |
| `C-u C-c *` | Sum column of active region |

```org
| item   | qty | price | total  |
|--------+----+-------+--------|
| apples |  4 |  1.20 | $4.80  |
#+TBLFM: $4=$2*$3;vsum($4)
```

### 8.4 Source blocks (Babel) — executable documents

```org
#+BEGIN_SRC R :results output :exports both
summary(cars)
#+END_SRC
```

- `C-c C-c` — **execute** the block under point (asks once per language to confirm).
- `:results output` prints; `:results value` stores the returned object; `:results file ./fig.png` records a file (images render inline with org-babel-inline or the display).
- `:tangle yes` — write the block into a real source file (literate programming: org file is master, `.R`/`.py` is generated).
- `C-c '` — edit block in a dedicated org-src buffer with the right major mode.
- Languages need enabling: `(org-babel-do-load-languages 'org-babel-load-languages '((R . t) (python . t) (shell . t)))`
- Security: Emacs asks before evaluating; whitelist per language with `org-confirm-babel-evaluate` or leave it on (recommended).

### 8.5 Export

`C-c C-e` opens the export dispatcher: export to HTML, LaTeX/PDF, Markdown, ODT, iCalendar (agenda → calendar), and more. For your reporting stack note that Quarto (see [[quarto_notes|quarto_notes]]) covers Word/PDF; org export covers personal docs, wikis, and static sites.

### 8.6 One killer trick: literate Emacs config

Your whole `init.el` can live in an org file with `#+BEGIN_SRC emacs-lisp` blocks, tangled to `init.el` on demand (`org-babel-tangle`, `C-c C-v C-t`). The Emacs community calls this *literate configuration*.

## 9. ESS — Emacs Speaks Statistics

**ESS 26.05.x** (May 2026) is on GNU ELPA and MELPA. It gives you: inferior R/S/S-PLUS, SAS, Stata, BUGS/JAGS/NIMBLE, and Julia processes; syntax-aware editing; object completion; help lookup; package dev tools; flymake linting.

### 9.1 Install

```elisp
;; init.el — Emacs 29+ has use-package built in
(use-package ess
  :defer t
  :init (setq ess-r-package-auto-set-ess-r-package-directory nil))
```

Or `M-x package-install RET ess RET`. Check with `M-x ess-version`. R itself must be on PATH (`R --version` in a shell).

> [!note] Underscore no longer types `<-`
> Modern ESS removed the smart underscore. If you want `_` to insert the R assignment, add:
> ```elisp
> (define-key ess-r-mode-map "_" #'ess-insert-assign)
> (define-key inferior-ess-r-mode-map "_" #'ess-insert-assign)
> ```

### 9.2 The core loop: script buffer ↔ R process

Open `analysis.R`. `M-x R` (or `C-c C-z` from the script) starts the inferior R buffer. Then evaluate code from the script buffer:

| Key | Evaluates |
|-----|-----------|
| `C-c C-c` | Region if active, else the **function/paragraph** at point — *and steps* |
| `C-M-x` | Same target, stays put |
| `C-RET` | Region or current **line**, then step |
| `C-c C-n` | Current line, then step (line-by-line debugging rhythm) |
| `C-c C-l` | Load the whole file (`source()`) |
| `C-c C-v` | Show help for object at point |
| `M-TAB` | Complete object names (and file names) |
| `C-c C-z` | Toggle between script and R buffer |
| `C-c C-q` | Quit the R process |
| `C-c C-e C-r` | Reload/restart the R process |

In the **inferior R buffer**: type commands + `RET` as if in a terminal; `C-c C-o` delete last output, `C-c C-a` beginning of line after prompt, `M-p`/`M-n` history, `C-c C-w` delete word, `C-c C-x` list objects, `C-c C-s` search list (`ls()`).

### 9.3 Help, inspection, completion

- `C-c C-v <name>` → R `help()` in a dedicated help buffer (`q` quits, `a` apropos).
- `C-c C-v` at point → R `help()` for that object in a dedicated help buffer (`q` quits, `a` apropos).
- Company/cape or built-in completion completes R symbols from the live process — you type `mod` and see `model_matrix`, `modes`, your own objects.
- `C-c C-e` prefix holds extras: package dev (`C-c C-e C-p` devtools-ish commands), roxygen helpers, reload (`C-c C-e C-r`).

### 9.4 Linting and quality

```elisp
;; needs the R package `lintr` installed
(setq ess-use-flymake t)          ; default on for Emacs 26+
```

`M-x flymake-show-buffer-diagnostics` lists lint findings. Pair with `styler`/`lintr` for house-style code.

### 9.5 Working with data frames like a pro

- `C-c C-d` (ESS data viewer) or `M-x ess-view-data`-style commands — on big frames ESS offers a sorted, scrollable view instead of flooding the console.
- `View()`/`head()` via `C-c C-v` for docs; `str()` at point.
- Long-running jobs: run via `ess-execute` (`C-c C-e C-e`) or from a shell buffer so the editor stays live; `ess-eval-visibly` defaults to `nowait` (no freeze during evaluation).

## 10. The literate data-science workflow (org + ESS + Babel)

This is the payoff: **one org file = narrative + code + results + figures**, reproducible end to end.

```org
#+TITLE: Q3 churn analysis
#+OPTIONS: toc:2 num:nil

* Setup
#+BEGIN_SRC R :results output
library(tidyverse)
library(duckdb)
con <- dbConnect(duckdb::duckdb(), "warehouse.duckdb")
#+END_SRC

* Load
#+BEGIN_SRC R :results output
churn <- dbGetQuery(con, "SELECT * FROM churn_raw")
glimpse(churn)
#+END_SRC

* Model
#+BEGIN_SRC R :results file :results output graphics :file fig-fit.png :width 900 :height 600
fit <- glm(churned ~ tenure + spend, data = churn, family = binomial)
plot(fitted(fit), residuals(fit, type = "deviance"))
#+END_SRC

* Findings
#+BEGIN_SRC R :results output
summary(fit)$coefficients
#+END_SRC
```

Workflow rules:

1. **Explore in the inferior R buffer** (fast, throwaway).
2. **Promote keepers into Babel blocks** so they're rerunnable.
3. `C-c C-c` each block while iterating; `C-u C-c C-c` re-runs with fresh results.
4. Results and figures are stored **in the org file** — the document carries its own evidence.
5. Export HTML for sharing; keep the org file in git.

Where this plugs into the vault:
- Reporting to audiences → [[quarto_notes|quarto_notes]] (render the tangled `.R`/`.qmd`, not the org file, for Word/PDF deliverables).
- Warehouse tables → [[duckdb_notes|duckdb_notes]] (connect from Babel blocks as above).
- Model work → `Statistical_Modeling/`, [[julia_notes|julia_notes]] (ESS also speaks Julia — `M-x julia` with julia-mode installed).
- Keep a `#+TBLFM:` summary table of metrics at the top of each analysis org file.

> [!warning] Pin your environment
> Babel results are only reproducible if the session is: record `sessionInfo()` in a results block per analysis, and consider `renv` for R package pinning. A doc whose numbers can't be re-derived is a story, not a result.

## 11. A sensible init.el skeleton

```elisp
;; init.el — minimal modern baseline
(require 'package)
(setq package-archives '(("gnu" . "https://elpa.gnu.org/packages/")
                         ("melpa" . "https://melpa.org/packages/")))
(package-initialize)

(use-package vertico :init (vertico-mode))        ; minibuffer completion
(use-package orderless :init (setq completion-styles '(orderless)))
(use-package marginalia :init (marginalia-mode))  ; annotations in completion
(use-package consult)                             ; unified search commands
(use-package magit :bind (("C-x g" . magit-status)))
(use-package org)
(use-package ess :defer t)
(use-package markdown-mode)

(setq inhibit-startup-screen t)
(menu-bar-mode -1)
(tool-bar-mode -1)
(scroll-bar-mode -1)
(global-display-line-numbers-mode 1)
(save-place-mode 1)                               ; remember file positions
(savehist-mode 1)                                 ; minibuffer history
```

## 12. Learning plan + tracker

| Phase | Do | Exit check |
|-------|----|-----------|
| 1 | `C-h t` tutorial; use only §3 keys for 2 days | Open, edit, save, quit without panic |
| 2 | Files/buffers/windows (§4) + editing (§5); ban arrow keys | Split windows and move with `C-x o` naturally |
| 3 | Dired + Magit (§6–§7) | Stage and commit a real change via Magit |
| 4 | Org structure + agenda + capture (§8.1–8.2) | One week of tasks tracked only in org agenda |
| 5 | Org tables + Babel with Python or R (§8.3–8.4) | A `.org` file that runs code and shows results |
| 6 | ESS loop (§9) with a real script | Send code to R from a script buffer without thinking |
| 7 | Full literate analysis (§10) | One analysis org file exported and committed |

- [ ] Phase 1 …
- [ ] Phase 4 …
- [ ] Phase 7 …

### When stuck

| Problem | Answer |
|---------|--------|
| "Something happened and I don't know what" | `C-g`, then `C-h k` the key you pressed |
| "Where are my keys for this mode?" | `C-h m` |
| "How do I get out of this buffer?" | `C-x b` |
| "Emacs is slow to start" | `M-x profiler-start`, use PCRs; defer packages (`:defer t`) |
| "Package won't install" | `M-x package-refresh-contents` first; check `*Warnings*` buffer |
