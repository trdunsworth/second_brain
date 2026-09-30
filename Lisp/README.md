---
type: index
topic: Lisp folder index — Lisp dialects for data science (install, tutorials, snippets, editors, resources)
date: 2026-09-30
status: active
tags:
  - moc
  - data-science
  - clojure
  - lisp
---

# Lisp — Index

> Goal: the map for this folder. **Start at [[Lisp_Installation]]** to get a REPL running, then [[Clojure_Tutorial]] — Clojure is the recommended primary path for data science in Lisp. Everything else is lookup material.

## Start here

| You want… | Go to |
|-----------|-------|
| A REPL running on Fedora or an Intel Mac | [[Lisp_Installation]] ← **the gate** |
| Learn Lisp for data science, from zero | [[Clojure_Tutorial]] ← **the spine** |
| A classic / performance-oriented Lisp track | [[Common_Lisp_Tutorial]] |
| Keys and syntax at a glance | [[Clojure_Cheatsheet]], [[Common_Lisp_Cheatsheet]] |
| Copy-pasteable data wrangling code | [[Lisp_Data_Science_Snippets]] |
| Hook it into Emacs / Neovim / Vim / Helix / Kakoune | [[Lisp_Editor_Integrations]] |
| Awesome lists, books, communities, docs | [[Lisp_Resources]] |
| Ideas of what to build next | [[Lisp_Project_Ideas]] |

## The notes

### Setup
| Note | What it is |
|------|------------|
| [[Lisp_Installation]] | Fedora (`dnf`) + Intel Mac (Homebrew 7 / MacPorts) install paths, Quicklisp, Clojure CLI, verify commands, gotchas |

### Learn
| Note | What it is |
|------|------------|
| [[Clojure_Tutorial]] | Lisp for data science from zero: shared core → Clojure → tablecloth walkthrough → 4-week learning plan |
| [[Common_Lisp_Tutorial]] | The classic track: SBCL REPL, `loop`, Quicklisp, Lisp-Stat |

### Use & reference
| Note | What it is |
|------|------------|
| [[Clojure_Cheatsheet]] | Clojure syntax + tablecloth one-liners at a glance |
| [[Common_Lisp_Cheatsheet]] | Common Lisp syntax + Lisp-Stat one-liners at a glance |
| [[Lisp_Data_Science_Snippets]] | Verified snippets: load, wrangle, group, join, missing data, stats, plots, write |
| [[Lisp_Editor_Integrations]] | clojure-lsp / cl-lsp, SLIME, CIDER, Conjure, vim-sexp, REPL-in-tmux patterns |
| [[Lisp_Resources]] | Awesome lists, scicloj stack, books, docs, communities |
| [[Lisp_Project_Ideas]] | Warmups → port existing vault work → stretch projects |

## How they fit together

```
Lisp_Installation  (REPL up: sbcl / clj / racket)
  └─ Clojure_Tutorial  ──────────────── the main path
       ├─ Clojure_Cheatsheet           (keep open while learning)
       ├─ Lisp_Data_Science_Snippets   (tablecloth/hanami/oz recipes)
       └─ Common_Lisp_Tutorial         (second dialect: performance/classic)
            └─ Common_Lisp_Cheatsheet
  Lisp_Editor_Integrations  (pair with [[Vim_Tutorial]] / [[Neovim_Tutorial]] / [[Emacs_Tutorial]] / [[Helix_Tutorial]] / [[Kakoune_Tutorial]])
  Lisp_Resources            (docs/books/communities to go deeper)
  Lisp_Project_Ideas        (what to build — ties to duckdb-lab, ALX, Statistical_Modeling)
```

## Ideas — what to build next

Short version (full list in [[Lisp_Project_Ideas]]):

1. Re-run the `duckdb-lab` CSVs (`hourly_export.csv`, `eda_numeric_export.csv`) through tablecloth instead of SQL — same answers, new tool.
2. A tiny CLI that profiles any CSV (`head` / `info` / `shape` / missing counts) in 30 lines of Clojure.
3. A Clay/Oz report generated straight into this vault from a dataset.
4. Port one `Statistical_Modeling` simulation (queueing or call volume) to Clojure and benchmark it.

Cross-folder: [[duckdb_notes]] (SQL versions of the same questions), [[julia_notes]] (another REPL-first language), [[quarto_notes]] (report angle), [[Tmux_Tutorial]] (editor + REPL panes).

## Status

- [x] Folder: 10 notes (9 content + this index), frontmatter verified 2026-09-30
- [x] Primary path: Clojure (tablecloth / tech.ml.dataset / hanami / oz), Common Lisp (Lisp-Stat) and Racket (data-frame) covered
- [ ] Fedora install run live — **manual**: §1 of [[Lisp_Installation]]
- [ ] Intel Mac install run live — **manual**: §2 of [[Lisp_Installation]]
- [ ] Learning plan Week 1 — see [[Clojure_Tutorial]] §9
