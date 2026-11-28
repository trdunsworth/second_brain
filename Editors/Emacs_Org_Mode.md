---
type: usage-note
topic: Emacs Org mode — headings, TODO, agenda, capture, tables, org-babel for R/Python/shell, export to Markdown, using org alongside this vault
date: 2026-11-26
status: active
tags:
  - editors
  - emacs
  - org-mode
  - literate-programming
  - setup
---

# Emacs Org Mode — Notes as Programs

> Goal: use Org mode for **planning, project tracking, literate data work, and export** — and keep it compatible with this Obsidian vault. Org 9.8 ships with Emacs 31.1. Everything here works in any buffer ending in `.org` (enable with `M-x org-mode`).
> Related: [[Emacs_Usage]] (install + config) · [[Emacs_Tutorial]] (learning path) · [[Vault_Editor_Workflows]] (vault integration) · [[Lisp_Editor_Integrations]] (org-babel Clojure/CL) · [[quarto_notes]] (reporting angle)

## How to use this note

1. **§1–§3** — structure: headings, TODO, tags, properties, agenda.
2. **§4** — capture: frictionless entry from anywhere.
3. **§5** — tables + formulas (spreadsheet in a text file).
4. **§6** — **org-babel**: execute R/Python/shell/Elisp blocks, results in the buffer — the "notes as programs" workflow.
5. **§7** — export to Markdown/HTML/PDF for the vault or sharing.
6. **§8** — coexistence strategy with this vault.

---

## 1. Document structure — the outline

| Syntax | Meaning |
|--------|---------|
| `* Heading` | Top-level (1 star = level 1) |
| `** Subheading` | Nested |
| `* TODO Task` | Actionable item — `C-c C-t` cycles: TODO → DONE → (custom) |
| `* DONE Task` | Completed |
| `SCHEDULED: <2026-11-28 Mon>` | Date it should be worked on (`C-c C-s`) |
| `DEADLINE: <2026-12-01 Sun>` | Hard date (`C-c C-d`) |
| `:tag1:tag2:` | Tags at line end — filter in agenda |
| `:PROPERTIES:` … `:END:` | Key:value drawer (`C-c C-x p`) |

```org
* Project: Second Brain Vault
  :PROPERTIES:
  :EFFORT:   2:00
  :ID:       20261126T083000-abc123
  :END:
  ** TODO Refactor Editors notes
     SCHEDULED: <2026-11-27 Thu>
     :writing:emacs:
  ** DONE Set up Emacs 31.1 on Fedora
     CLOSED: [2026-11-26 Sat 09:15]
```

**Visibility cycling**: `TAB` on a heading folds/unfolds; `S-TAB` cycles globally. `C-c C-r` edits the tags column in agenda.

## 2. The agenda — your dashboard

`M-x org-agenda` (`C-c a` by default) opens the agenda dispatcher:

| Key | View |
|-----|------|
| `a` | Agenda for the week (scheduled + deadlines) |
| `t` | **All TODO entries** across all org files — the master list |
| `m` | Match: filter by tag/regex (`+writing` `+emacs`) |
| `b` | Backlog (unscheduled TODOs) |
| `c` | Calendar |
| `r` | Refresh |
| `q` | Quit |

Configure the file list in your init:

```elisp
(setq org-agenda-files '("~/projects/second_brain/org" "~/projects/second_brain/journal"))
```

Or use `org-directory` + `org-agenda-file-regexp` to auto-pickup.

### Agenda customizations worth having

```elisp
(setq org-agenda-span 'week)
(setq org-agenda-start-on-weekday 1)           ; Monday start
(setq org-agenda-include-diary t)              ; include diary entries
(setq org-agenda-sorting-strategy
      '((agenda time-up priority-down)
        (todo priority-down effort-up)))
```

**Priority**: `,` on a TODO → `A` `B` `C` (high/med/low). **Effort**: `:EFFORT: 1:30` property — agenda can sort by effort.

## 3. Capture — frictionless entry

```elisp
(setq org-capture-templates
  '(("t" "Task" entry (file+headline "~/projects/second_brain/org/inbox.org" "Inbox")
     "* TODO %?\n  %i\n  %a")
    ("j" "Journal" entry (file+datetree "~/projects/second_brain/org/journal.org")
     "* %?\n  %i\n  %U")
    ("n" "Note for vault" entry (file "~/projects/second_brain/Inbox/quick-capture.md")
     "#+TITLE: %^{Title}\n#+DATE: %U\n\n%?\n\n%a")))
```

`M-x org-capture` (`C-c c`) → pick template → edit → `C-c C-c` files it.

**From anywhere**: bind globally in your WM/DE (`super-e t` → capture task). In terminal: `emacsclient -e '(org-capture)'`.

## 4. Tables — spreadsheets in plain text

| Key | Action |
|-----|--------|
| `| Name | Age |` | Type pipes, `TAB` aligns |
| `C-c C-c` | Re-align / recalc |
| `C-c ^` | Sort by column |
| `C-c |` | Convert region to table |
| `S-RET` | New row |
| `M-RET` | New row (insert) |

### Formulas (TBLFM)

```org
| Item      | Qty | Price | Total |
|-----------+-----+-------+-------|
| Apples    |  10 |  1.50 |       |
| Oranges   |   5 |  2.00 |       |
|-----------+-----+-------+-------|
| **Total** |  15 |       |  25.0 |
#+TBLFM: $4=$2*$3;%.2f :: @4$4=vsum(@I..@II);%.2f
```

`C-c C-c` on the `#+TBLFM` line recalculates. Full calc engine: `calc` syntax, `$1` = column 1, `@2` = row 2, `@I`/`@II` first/last data row.

## 5. Org-babel — literate code blocks (the killer feature)

Execute code **inside the org file**, results appear below the block. Enable languages in init:

```elisp
(org-babel-do-load-languages
 'org-babel-load-languages
 '((emacs-lisp . t)
   (python . t)
   (R . t)
   (shell . t)
   (clojure . t)       ; needs CIDER - [[Lisp_Editor_Integrations]]
   (common-lisp . t))) ; needs SLIME
```

### Block syntax

```org
#+BEGIN_SRC python :results output :exports both
import pandas as pd
df = pd.read_csv("data.csv")
print(df.describe())
#+END_SRC

#+RESULTS:
:        col1       col2
: count  100.0     100.0
: mean    42.3      17.8
```

| Header arg | Meaning |
|------------|---------|
| `:results output` | Stdout (use `value` for return value) |
| `:exports both` | Export code + results (`code`/`results`/`none`) |
| `:session session-name` | Persist state across blocks (REPL-like) |
| `:var x=5` | Pass org variable/table into block |
| `:noweb yes` | Expand `<<ref>>` references from other blocks |
| `:tangle file.py` | Extract to source file on export (`M-x org-babel-tangle`) |

### Language specifics

| Lang | Session notes |
|------|---------------|
| Python | `:session py` keeps imports/variables; `:results output drawer` hides by default |
| R | `:session R` — needs `ess` or `R` process; `:results output graphics` for plots |
| Shell | `:results output` — each block independent unless sessioned |
| Clojure | Requires CIDER REPL; `:session *cider-repl*` |
| Elisp | Runs in Emacs process — instant, no setup |

**Result handling**: `C-c C-v C-v` evaluates block at point; `C-c C-v b` evaluates all blocks in buffer.

## 6. Export — Markdown for the vault, PDF for reports

| Key | Export |
|-----|--------|
| `C-c C-e m m` | Markdown (`.md`) |
| `C-c C-e h h` | HTML |
| `C-c C-e l p` | PDF via LaTeX |
| `C-c C-e o o` | Org (clean copy) |

### Markdown export config (vault-friendly)

```elisp
(setq org-md-headline-style 'atx)       ; # Heading not * Heading
(setq org-md-footnote-format "\n[^%s]: %s")
(setq org-md-link-format "[%s](%s)")
(setq org-export-with-toc nil)
(setq org-export-with-section-numbers nil)
```

**YAML frontmatter**: Add `#+OPTIONS: toc:nil num:nil` and a `#+BEGIN_EXPORT md` block, or use a hook to prepend frontmatter on export:

```elisp
(defun my/org-md-frontmatter (backend)
  (when (eq backend 'md)
    (concat "---\ntitle: " (org-export-get-title) "\ndate: " (format-time-string "%Y-%m-%d") "\n---\n\n")))
(add-hook 'org-export-before-processing-hook #'my/org-md-frontmatter)
```

### Export subtree only

`C-c C-e m m` on a heading → exports that subtree + children. Perfect for "this note → vault".

## 7. Using Org alongside this Obsidian vault

| Strategy | How |
|----------|-----|
| **Org for planning, Markdown for vault** | Keep `.org` in `~/projects/second_brain/org/` (not in vault). Export subtree → `.md` → drop in `Inbox/` or project folder. |
| **Org files in vault** | Add `*.org` to `.gitignore` if not syncing; Obsidian ignores them. Use [[Vault_Editor_Workflows]] for editors that read org. |
| **Org-babel for data work** | Prototype in org, `C-c C-v t` tangle → `.py`/`.R` in `Python Programming/` or `R Programming/`, results commit to vault. |
| **Agenda as master TODO** | Vault has its own tasks (Dataview); org-agenda is your *personal* dashboard. Sync weekly: `org-agenda` → copy actionable to vault daily note. |

### Suggested layout

```
~/projects/second_brain/
├── org/                    # <-- your org files (NOT in vault)
│   ├── agenda.org          # master TODO + projects
│   ├── journal.org         # datetree journal (capture "j")
│   ├── inbox.org           # capture "t" lands here
│   └── projects/
│       ├── reporting.org
│       └── data-science.org
├── Inbox/                  # <-- vault folder
│   └── quick-capture.md    # capture "n" lands here
├── Python Programming/     # tangled .py files
├── R Programming/          # tangled .R files
└── ... rest of vault
```

## 8. Customization checklist (first pass)

| Item | Set in init |
|------|-------------|
| Agenda files | `setq org-agenda-files` |
| Capture templates | `setq org-capture-templates` |
| TODO keywords | `setq org-todo-keywords '((sequence "TODO" "NEXT" "WAITING" "|" "DONE" "CANCELLED"))` |
| Priority faces | `setq org-priority-faces` |
| Clocking | `(setq org-clock-persist t) (org-clock-persistence-insinuate)` |
| Refile targets | `setq org-refile-targets` |
| Archive | `C-c C-x C-s` → `archive.org`; `(setq org-archive-location "archive::")` |
| Export Markdown | `org-md-headline-style` etc. (§6) |
| Babel languages | `org-babel-do-load-languages` (§5) |
| Indent/visibility | `(setq org-startup-folded t)` |
| ID/UUID for links | `(setq org-id-link-to-org-use-id t)` |

## 9. Quick reference

| Need | Keys |
|------|------|
| Agenda | `C-c a` |
| Capture | `C-c c` |
| TODO cycle | `C-c C-t` |
| Schedule | `C-c C-s` |
| Deadline | `C-c C-d` |
| Tag | `C-c C-q` |
| Properties | `C-c C-x p` |
| Archive subtree | `C-c C-x C-s` |
| Refile | `C-c C-w` |
| Clock in/out | `C-c C-x C-i` / `C-c C-x C-o` |
| Babel eval block | `C-c C-v C-v` |
| Babel eval all | `C-c C-v b` |
| Tangle | `C-c C-v t` |
| Export Markdown | `C-c C-e m m` |
| Visibility cycle | `TAB` / `S-TAB` |
| Column view | `C-c C-x C-c` |

---

**Next**: [[Vault_Editor_Workflows]] §"Emacs + Org" for the exact wiring, or [[Emacs_Tutorial]] §Org section for the learning path.