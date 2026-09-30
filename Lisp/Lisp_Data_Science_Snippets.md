---
type: reference
topic: Lisp data-science snippets — verified tablecloth, Lisp-Stat, and Racket data-frame recipes for load, wrangle, aggregate, join, plot, and write
date: 2026-09-30
status: active
tags:
  - data-science
  - snippets
  - clojure
  - cheatsheet
  - lisp
---

# Lisp Data-Science Snippets

> Goal: copy-paste recipes that are **verified against current library docs** (tablecloth 8.024, Lisp-Stat, Racket `data-frame`). Companion to the guided walkthrough in [[Clojure_Tutorial]] §6; keep [[Clojure_Cheatsheet]] §5 open too.
> Related: [[Lisp_Installation]] (REPLs must be running), [[duckdb_notes]] (the SQL versions of these same questions), `duckdb-lab/data/` files (`hourly_export.csv`, `eda_numeric_export.csv`), [[Lisp_Resources]] (library docs)

## How to use this note

1. **§1 once** — dependency setup for your dialect.
2. **§2–§8** — the standard pipeline; each section is independent.
3. **§9 plots**, **§10 output**, **§11 SQL interop**, **§12 gotchas**.
4. Examples use **virtual datasets** so they run anywhere; point them at real files (`duckdb-lab/data/*.csv`) when exercising.

---

## 1. Dependencies

### Clojure — `deps.edn`

```clojure
{:paths ["src"]
 :deps {scicloj/tablecloth {:mvn/version "8.024"}}}
;; tablecloth pulls tech.ml.dataset transitively;
;; dfn (stats) comes from tech.v3.datatype.functional — require it directly.
```

```clojure
;; REPL bootstrap
(require '[tablecloth.api :as tc]
         '[tech.v3.datatype.functional :as dfn])
```

### Common Lisp — Quicklisp

```lisp
(ql:quickload :lisp-stat)      ; data frames + dfio + stats umbrella
(ql:quickload :cl-csv)         ; raw CSV if you don't want a frame
(ql:quickload :vgplot)         ; plotting (gnuplot)
```

### Racket — raco

```bash
raco pkg install data-frame     ; alex-hhh's data-frame lib
```

```racket
#lang racket
(require data-frame
         plot)                  ; plot is part of the main distribution
```

---

## 2. Load data

### Clojure (tablecloth)

```clojure
;; files by extension: .csv .tsv .json .ndjson .parquet
(def df (tc/dataset "data/hourly_export.csv"))

;; force keyword column names (recommended — see §12)
(def df (tc/dataset "data/hourly_export.csv" {:key-fn keyword}))

;; from literals — the fastest way to test a pipeline
(def df (tc/dataset {:hour  [0 1 2 3]
                     :calls [12 8 4 9]
                     :day   [:mon :mon :tue :tue]}))

;; from a URL (tablecloth fetches it)
(def df (tc/dataset "https://example.com/data.csv"))

;; map-of-maps rows
(tc/dataset [{:a 1 :b 10} {:a 2 :b 20}])
```

### Common Lisp (Lisp-Stat)

```lisp
(defdf h (dfio:read-csv "data/hourly_export.csv"))   ; defines var h
(def h (dfio:read-csv "data/hourly_export.csv"))     ; plain def works too
;; column names arrive as symbols — use :key-fn-style options per dfio docs
```

### Racket (data-frame)

```racket
(define h (df-read-csv "data/hourly_export.csv"))
```

---

## 3. Inspect — always first

### Clojure

```clojure
(tc/head df)                 ; first rows (default 10)
(tc/head df 5)
(tc/info df)                 ; THE profiler: name, type, n-missing, unique, min/max, mean
(tc/shape df)                ; [rows cols]
(tc/row-count df)
(tc/columns df :as-map)      ; {name type} map
(tc/dataset? df)             ; predicate
```

### Common Lisp

```lisp
(rows h) (columns h)
(column h 'hour)
(describe h)                 ; if provided by the frame API
```

### Racket

```racket
(df-row-count h)
(df-names h)
(df-select h 'hour)          ; a column as a vector
(df-describe h)              ; summary stats (where supported)
```

---

## 4. Wrangle — select, rename, add, filter, sort

### Clojure

```clojure
;; columns
(tc/select-columns df [:hour :calls])
(tc/drop-columns df [:notes])
(tc/rename-columns df {:calls :volume})

;; add / derive columns
(tc/add-column df :log-calls (map #(Math/log (inc %)) (:calls df)))
(tc/add-columns df {:double  (map #(* 2 %)  (:calls df))
                    :is-peak (map #(> % 10) (:calls df))})

;; rows — predicate over the whole row map
(tc/select-rows df (fn [row] (> (:calls row) 10)))
;; rows — by column predicate (idiomatic)
(tc/select-rows df (comp #(> % 10) :calls))
;; rows — by index / range
(tc/select-rows df [0 2 5])
(tc/select-rows df (range 0 10))
(tc/drop-rows df (range 0 3))                ; drop first 3

;; sort
(tc/order-by df [:calls] :desc)
(tc/order-by df [:day :hour])                ; multi-key asc
```

### Common Lisp

```lisp
(select h (lambda (row) (> (getf row :calls) 10)) '(hour calls))
;; column-level ops are plain Lisp on (column h 'calls):
(mapcar #'1+ (coerce (column h 'calls) 'list))
```

### Racket

```racket
(df-select h 'calls (λ (v) (> v 10)))   ; select with predicate
```

---

## 5. Group & aggregate (split-apply-combine)

### Clojure

```clojure
;; group → aggregate → ungroup (the whole pandas groupby in one shape)
(-> df
    (tc/group-by :hour)
    (tc/aggregate {:n          tc/row-count
                   :mean-calls (fn [t] (dfn/mean (:calls t)))
                   :max-calls  (fn [t] (dfn/max  (:calls t)))})
    (tc/without-grouping->)
    (tc/order-by [:hour]))

;; whole-data-frame aggregate (no grouping)
(tc/aggregate df {:mean #(dfn/mean (% :calls))
                  :n    tc/row-count})

;; multiple columns at once
(tc/aggregate-columns df [:calls :agents] dfn/mean)
;; per-column different fns: pass a vector of fns
(tc/aggregate-columns df [:calls :agents] [dfn/mean dfn/max])

;; contingency table — instant crosstab
(tc/crosstab df :hour :day)

;; frequencies without grouping machinery
(frequencies (:hour df))

;; pack each group's columns into collections (one row per group);
;; use when you want raw group data, then unroll/custom-reduce
(-> df (tc/fold-by [:hour]))
;; (stats belong in aggregate — fold-by is pack, not compute)
```

**Shape to remember:** `group-by → aggregate → without-grouping->`.

### Common Lisp

```lisp
;; group-by style: CL lacks tablecloth's sugar — build with loop/hash:
(let ((acc (make-hash-table)))
  (loop for hour across (column h 'hour)
        for calls across (column h 'calls)
        do (incf (gethash hour acc) calls))
  acc)
```

### Racket

```racket
;; data-frame provides df-impl for grouping/summation patterns —
;; simplest path: vector ops on selected columns
(define calls (df-select h 'calls))
(/ (for/sum ([v (in-vector calls)]) v) (vector-length calls))
```

---

## 6. Missing data

### Clojure

```clojure
(tc/drop-missing df)                 ; any row with a missing anywhere
(tc/drop-missing df [:calls])        ; only these columns

(tc/replace-missing df :calls)                ; default strategy :nearest (nearest known value)
(tc/replace-missing df :calls :down)          ; ffill — carry last value DOWN (leading gaps → default)
(tc/replace-missing df :calls :up)            ; bfill — copy next value UP (trailing gaps → default)
(tc/replace-missing df :calls :downup)        ; ffill then bfill — handles both edges (time series)
(tc/replace-missing df :calls :lerp)          ; linear interpolation between neighbors
(tc/replace-missing df :calls :midpoint)      ; average of previous/next known
(tc/replace-missing df :calls :value 0)       ; constant …
(tc/replace-missing df :calls :value tech.v3.datatype.functional/mean)  ; … or a fn on the stripped column
```

> [!tip] Which strategy?
> `:downup` (ffill + bfill) for time series — carries the last observation forward and fills leading gaps; matches the window-fill thinking in [[duckdb_notes]]. `:value <fn>` with `dfn/mean` for roughly-symmetric numeric columns. `:lerp` when smooth interpolation matters. Drop only when the row is truly unanalyzable — dropping hides data-quality problems.

### Common Lisp / Racket

Missingness in CL frames is typically `nil`/NaN in the column vector — filter with `remove-if` / `nan?` predicates. Check your reader's docstring for frame-specific NA markers.

---

## 7. Joins

### Clojure

```clojure
;; left-join keeps ALL rows of df, matches from g
(tc/left-join df dims [:hour])            ; on [:hour]
(tc/left-join df dims [:hour :day])        ; composite key

(tc/inner-join df dims [:hour])            ; matches only
(tc/right-join df dims [:hour])
(tc/full-join  df dims [:hour])
(tc/semi-join  df dims [:hour])            ; df rows having a match (no cols from g)
(tc/anti-join  df dims [:hour])            ; df rows WITHOUT a match — great for QA
(tc/cross-join df dims)                    ; cartesian

;; overlapping column names auto-suffix :hour-1 — rename first if you care:
(-> dims (tc/rename-columns {:hour :dim-hour}) (tc/inner-join df [:dim-hour]))
```

**Mental model:** `left-join` = SQL `LEFT JOIN`, key vector = `ON` clause. Use `anti-join` to answer "which rows have no dimension match?" — a classic data-quality check.

### Common Lisp / Racket

Frame joins exist in both ecosystems (Lisp-Stat's frame ops; `data-frame` join helpers) but the ergonomic crown here is tablecloth — see [[Lisp_Resources]] if you need CL-side joins frequently.

---

## 8. Statistics

### Clojure — `tech.v3.datatype.functional` (alias `dfn`)

```clojure
(dfn/mean (:calls df))      (dfn/median (:calls df))
(dfn/std  (:calls df))      (dfn/sum (:calls df))
(dfn/min  (:calls df))      (dfn/max (:calls df))
(dfn/cum-sum (:calls df))                    ; vector out
(dfn/quotient 7 2) (dfn/remainder 7 2)

;; correlations / regressions: use fastmath (see [[Lisp_Resources]])
;; (fastmath.stats/correlation xs ys)
```

Combine with grouping (§5) for per-group stats — that's the 90% case.

### Common Lisp — Lisp-Stat / base

```lisp
;; after (ql:quickload :lisp-stat)
(mean (column h 'calls))     ; from the stats package (verify exact fn at REPL: (apropos "MEAN"))
;; Quick sanity stats with plain CL:
(let ((v (coerce (column h 'calls) 'list)))
  (/ (reduce #'+ v) (length v)))            ; mean
```

### Racket — built-in `math`

```racket
(require math/statistics)
(define calls (vector->list (df-select h 'calls)))
(mean calls) (median calls) (stddev calls)
(df-statistics h 'calls)        ; where provided by data-frame
```

---

## 9. Visualization

### Clojure — Oz (Vega-Lite rendered to browser)

```clojure
;; deps: {metasoarous/oz {:mvn/version "…"}} — version via [[Lisp_Resources]]
(require '[oz.core :as oz])

(def spec
  {:data {:values (map (juxt :hour :calls) (tc/rows df))}
   :mark "bar"
   :encoding {:x {:field "hour" :type "quantitative"}
              :y {:field "calls" :type "quantitative"}}})

(oz/view! spec)                 ; opens in browser
(oz/export! spec "chart.html")  ; file output
```

Hanami (scicloj) generates Vega-Lite specs declaratively from Clojure maps — higher-level than hand-writing `:mark`/`:encoding`. Example patterns: [clojure-data-scrapbook](https://scicloj.github.io/clojure-data-scrapbook/) (viz chapter). Oz accepts Hanami's output directly.

### Common Lisp — vgplot (gnuplot)

```lisp
(ql:quickload :vgplot)
(let* ((xs (coerce (column h 'hour) 'list))
       (ys (coerce (column h 'calls) 'list)))
  (vgplot:plot xs ys "-b")           ; gnuplot x y series
  (vgplot:save-plot-as-png "chart.png"))
```

### Racket — built-in `plot`

```racket
(plot (interval (df-select h 'hour) (df-select h 'hour) #:color "steelblue")
      #:x-label "hour" #:y-label "calls")
;; bar-style: (plot (discrete-histogram …))
```

---

## 10. Write output

### Clojure

```clojure
(tc/write! df "out.csv")
(tc/write! df "out.parquet")
(tc/write! df "out.json")            ; ndjson by extension
;; per-column type control / CSV opts: see tablecloth write! docs
```

### Common Lisp

```lisp
(dfio:write-csv h "out.csv")
```

### Racket

```racket
(df-write-csv h "out.csv")
```

### Into the vault

Write reports/exports into this repo, then let [[Obsidian_CLI]] pick them up (search/link), or just re-open Obsidian — wikilink the artifact:

```markdown
See also: ![[out.csv]]  → no — CSVs don't embed; link the file:
[exported summary](../duckdb-lab/out/summary.csv)
```

Keep generated data inside `duckdb-lab/data/` or a sibling `lisp-lab/` — don't scatter files through note folders.

---

## 11. SQL interop (duckdb from Lisp)

You already know SQL ([[duckdb_notes]]). Two bridges:

1. **Do the SQL in SQL:** generate CSV/Parquet from `duckdb` CLI, read it with tablecloth (§2). Zero interop code — **recommended**.
2. **JDBC from Clojure (same-JVM):** DuckDB ships a JDBC driver; via `next.jdbc` you can query DuckDB straight from Clojure:

```clojure
;; deps: {com.github.seancorfield/next.jdbc {:mvn/version "…"}
;;        org.duckdb/duckdb_jdbc              {:mvn/version "…"}}
(require '[next.jdbc :as jdbc])
(def db {:dbtype "duckdb" :dbname "data/warehouse.duckdb"})
(jdbc/execute! db ["SELECT hour, count(*) FROM calls GROUP BY hour ORDER BY hour"])
;; result: vector of maps → hand to tablecloth:
(tc/dataset (jdbc/execute! db ["…"]))
```

That's the full Lisp ↔ SQL loop: SQL for storage/aggregation, tablecloth for the rest.

---

## 12. Gotchas

1. **Keyword vs string columns.** Default CSV load can yield string column names; `{:key-fn keyword}` makes `(:calls df)` work. Pick one convention per project.
2. **Laziness (Clojure).** Seq expressions do nothing until consumed — tablecloth columns are eager, but hand-rolled `map` pipelines need `into []`/`doall` (see [[Clojure_Tutorial]] §4.4).
3. **`nil` ≠ missing ≠ 0.** Let tablecloth's missing machinery handle NA; don't coerce to 0 (it lies about distributions).
4. **Destructive functions in CL** (`sort`, `nreverse`) mutate in place — `copy-list` first.
5. **Column names in Lisp-Stat are symbols** (`'calls`), in tablecloth keywords (`:calls`), in Racket symbols (`'calls`) — the dialect's own flavor.
6. **Types after CSV.** Everything may arrive as strings — `tc/info` shows types; convert with `(dfn/…)`-style casts or tablecloth column ops before math.
7. **Never sum a column you haven't profiled.** `tc/info` first: missing counts, min/max, unique. Same discipline as SQL `describe`.
8. **Version drift.** Snippets target tablecloth **8.024** (2026-08); check [tablecloth docs](https://scicloj.github.io/tablecloth/) if an API moved.

---

## What's next

→ [[Lisp_Project_Ideas]] to point these recipes at real vault data, or [[Lisp_Resources]] to go deeper on scicloj / Lisp-Stat / Racket.
