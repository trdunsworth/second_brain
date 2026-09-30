---
type: reference
topic: Lisp project ideas — warmups, ports of existing vault work, build tools, reports, and stretch projects for Clojure, Common Lisp, and Racket
date: 2026-09-30
status: active
tags:
  - projects
  - ideas
  - data-science
  - clojure
  - lisp
---

# Lisp Project Ideas — What to Build Next

> Goal: concrete builds, ordered by cost, each one **grounded in assets this vault already has** (real CSVs, SQL notes, simulation notes, editor/tmux muscle). Pick one the day the smoke tests in [[Lisp_Installation]] pass — momentum beats curriculum.
> Related: [[Lisp_Data_Science_Snippets]] (the recipes each idea reuses), [[Clojure_Tutorial]] §9 (learning plan this feeds), [[Lisp_Editor_Integrations]] (wire the editor around the chosen build), [[duckdb_notes]] (the SQL baseline to port)

## How to use this note

1. **Tier 1** — day-one warmups (an hour each, pure REPL).
2. **Tier 2** — ports: redo vault work in Lisp, compare answers.
3. **Tier 3** — small tools you'd actually keep using.
4. **Tier 4** — stretch: interop, performance, reporting.
5. Tick boxes as you finish; leave the checklist honest.

---

## Tier 1 — warmups (first days)

- [ ] **CSV profiler REPL function.** One fn: given a path → `tc/shape`, `tc/info`, head, missing counts, per-column cardinality. It's `load → info → head` from [[Lisp_Data_Science_Snippets]] §2–§3 wrapped in `(defn profile [path] …)`. Run it on every CSV you own.
- [ ] **Reproduce a SQL answer in tablecloth.** Take any simple query from [[duckdb_notes]] (`GROUP BY hour ORDER BY hour`) and express it as `group-by → aggregate → order-by`. Same numbers = pipeline fluency.
- [ ] **Frequencies drill.** Load `duckdb-lab/data/hourly_export.csv`, `(frequencies (:hour df))`, print as a table — no joins, no plots, just REPL muscle.
- [ ] **50 forms from memory.** The [[Clojure_Tutorial]] §3–§4 forms typed without looking — the equivalent of typing drills from [[Terminal_Fluency_Program]].

## Tier 2 — port existing vault work (the honest test)

- [ ] **duckdb-lab → tablecloth.** Read `data/hourly_export.csv` + `data/eda_numeric_export.csv`, redo the EDA you did in SQL: shapes, missingness, aggregates, one join-worthy grouping. **Success = same summary numbers**, then note where Lisp was terser/uglier (write the diff into this note).
- [ ] **Time Series EDA, Clojure edition.** The seasonality/rolling-window analysis pattern from `duckdb_notes` window functions → `dfn/cum-sum`, group-by-hour, maybe `:downup` missing-fill ([[Lisp_Data_Science_Snippets]] §6). Rolling windows are a nice `loop`/`partition` exercise.
- [ ] **Statistical_Modeling simulation → Clojure.** Queueing or call-volume model in `Statistical_Modeling` → a `defn` + `reducer`/`loop` in Clojure. Immutable state makes the simulation pleasantly boring. Add `fastmath` distributions when you need randomness properly.
- [ ] **A ggplot2 chart → Vega-Lite.** Recreate one figure from `Visualizations` / `04_ggplot2` using Hanami/Oz ([[Lisp_Data_Science_Snippets]] §9). You'll learn the grammar-of-graphics mapping faster by *translating* than by reading.

## Tier 3 — small tools worth keeping

- [ ] **`vault-profile` CLI.** A `-main` that takes paths, runs the profiler (Tier 1), writes a Markdown summary table you can drop into a note. Project shape: `deps.edn` + `src/` + tests ([[Clojure_Tutorial]] §5).
- [ ] **Synthetic data generator.** Given column specs (types, ranges, missing-rate), emit N rows to CSV — for testing the tools above without touching real data. Add `test.check` generators for the property-based bonus.
- [ ] **Report generator with Clay.** A literate `.clj` that loads a dataset, computes a few stats, and **renders Markdown straight into this vault** (Clay's output modes; see [[Lisp_Resources]] §2). This is the "notebooks that live in Obsidian" payoff — pairs with [[Obsidian_CLI]] for filing.
- [ ] **REPL command palette.** A `tmux` script + `send-keys` wrapper: select form → send to REPL pane → capture output (the §7 pattern of [[Lisp_Editor_Integrations]] productized).
- [ ] **Quicklisp project skeleton generator.** Tiny script: name → `.asd`, `src/`, `tests/`, `README` — so CL projects start in 10 seconds.

## Tier 4 — stretch

- [ ] **Lisp ↔ SQL bridge.** DuckDB via JDBC from Clojure (`next.jdbc` + `duckdb_jdbc`, [[Lisp_Data_Science_Snippets]] §11): query SQL, hand results to tablecloth, write back. The full hybrid loop with your actual warehouse file.
- [ ] **Python escape hatch.** `libpython-clj2` to call one Python-only library from Clojure, with a thin wrapper ns — measure how painful the interop really is (curiosity tax, once).
- [ ] **Performance face-off.** The same numeric task (e.g., Monte Carlo estimate of π, rolling aggregation) in Clojure (JVM) vs Common Lisp (SBCL with type declarations, [[Common_Lisp_Tutorial]] §7) vs Python — `trivial-benchmark`/`time` each, write the numbers up. Expected lesson: declarations matter more than language.
- [ ] **CL condition-system spike.** Build a data loader that *signals* a recoverable error on bad rows and offers a restart (`skip-row` / `use-default` / `abort`) — the interactive-recovery workflow no other language has.
- [ ] **Oz notebook → static site.** A multi-plot analysis rendered with Oz export into HTML, filed in the vault (or later: Quarto shell around generated Markdown — [[quarto_notes]]).
- [ ] **Give back.** Fix a doc typo in tablecloth/scicloj, or write one cookbook entry for [[Lisp_Resources]] §2 — the community's docs are good precisely because readers patch them.

## Selection guide

| If you have… | Do this |
|--------------|---------|
| 1 hour | Tier 1 profiler (first box) |
| An evening | Tier 2 duckdb-lab port — highest signal per hour |
| A weekend | Tier 3 `vault-profile` or Clay report |
| A curiosity about speed | Tier 4 performance face-off |
| CL specifically | Tier 4 condition-system spike (nothing else exercises CL's soul) |

## Progress log

| Date | Idea | Outcome / lesson |
|------|------|------------------|
| | | |
| | | |

When one produces a reusable artifact, give it its own note and link it here (and back from [[Lisp_Resources]] §7 tooling table if it's a tool).
