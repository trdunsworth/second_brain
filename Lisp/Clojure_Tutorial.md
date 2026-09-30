---
type: learning-note
topic: Clojure tutorial — Lisp for data science from zero: shared Lisp core, Clojure language, tablecloth data pipeline, 4-week learning plan
date: 2026-09-30
status: active
tags:
  - clojure
  - data-science
  - tutorial
  - learning-plan
  - lisp
---

# Clojure Tutorial — Lisp for Data Science

> Goal: go from zero to **doing real data work in a Lisp** — read a CSV, wrangle it, group/aggregate it, join it, plot it, write it out — using Clojure, the Lisp dialect with the strongest modern data-science stack. Secondary goal: absorb the shared Lisp core so Common Lisp/Racket/Scheme feel readable afterwards.
> Related: [[Lisp_Installation]] (get `clj` running first), [[Clojure_Cheatsheet]] (keys/syntax at a glance), [[Lisp_Data_Science_Snippets]] (every API used here, copy-paste), [[Common_Lisp_Tutorial]] (the classic track), [[Lisp_Editor_Integrations]] (REPL-driven editing), [[Lisp_Project_Ideas]] (what to build)

## How to use this note

1. **§1–§3 once** — why, dialect map, the shared Lisp core (all dialects).
2. **§4–§6 daily** — the Clojure language, then the data pipeline.
3. **§7–§8** — idioms + structural editing (pairs with your editor notes).
4. **§9 the plan** — 4-week tracker; check items off as you go.
5. Keep [[Clojure_Cheatsheet]] open in the other pane.

---

## 1. Why Lisp for data science

- **The REPL is the workflow.** Data science is iterative: load → look → transform → look again. A Lisp REPL keeps your whole program state alive between edits — you don't re-run a script, you *nudge* it. This is the same reason you chose REPL-first [[julia_notes]].
- **Code is data (homoiconicity).** Programs are s-expressions you can read, write, and transform with the language itself. That's what makes macros — and expressive data DSLs (Hanami, Clay) — possible.
- **Data literals are built in.** Clojure's `{:a 1 :b [1 2 3]}` maps/vectors/sets *are* the data-science vocabulary. tablecloth rows and columns are just these values.
- **Immutability by default** (Clojure). Transformations don't surprise you mid-pipeline; every step is a new value — great for reproducible analysis.
- **Host interop.** Clojure runs on the JVM: Java's numeric libraries, JDBC, and — via interop — Python and C. Common Lisp compiles to native code for speed; both are legitimate performance stories.
- **Small core, learnable in weeks.** ~20 forms you actually need. The rest is library.

Honest costs: JVM startup (mitigated by keeping a REPL/`clj` session alive), parentheses require editor support ([[Lisp_Editor_Integrations]]), and the ecosystem is smaller than Python's — but scicloj covers the pandas/NumPy/Seaborn territory well.

---

## 2. The dialect map — which Lisp for what

| Dialect | Host | Data stack | Choose it for |
|---------|------|-----------|----------------|
| **Clojure** | JVM | tablecloth, tech.ml.dataset, hanami, oz, Clay | **Primary path here**: wrangling, visualization, literate reports |
| **Common Lisp** | native (SBCL) | Lisp-Stat, cl-ana, cl-csv | Classic path, maximum performance, full language control |
| **Racket** | native | `data-frame`, built-in `plot`, `math` | Language-oriented work, teaching, DSLs with data attached |
| **Scheme/Guile** | native | minimal | Learning, scripting, embedded scripting |
| **Emacs Lisp** | Emacs | — | Editor automation (see [[Emacs_Tutorial]]) |
| **Fennel** | Lua host | — | Lua-hosted scripting, learning Lisp with less ceremony |

**Decision:** do this folder's program in **Clojure**. Skim [[Common_Lisp_Tutorial]] so you can read CL, and know Racket exists (§6 of [[Lisp_Installation]]).

---

## 3. The shared Lisp core (§1 of every Lisp)

Everything below is true in Clojure, Common Lisp, and Racket with only notation tweaks.

### 3.1 Prefix notation

```lisp
(+ 1 2)            ; 3       — operator first
(* 2 (+ 3 4))      ; 14      — nesting is grouping
(- 10 3 2)         ; 5       — variadic
```

Read a form **inside-out**: evaluate the arguments, then apply the function.

### 3.2 Everything is a list (of forms)

The parser hands the compiler nested lists. `(+ 1 2)` is the list `(+ 1 2)` — which means **code has a data representation you can manipulate**:

```lisp
'(a b c)           ; quote: the LIST a b c, not a call  (pronounce "quote")
(list 'a 'b 'c)    ; same thing, constructed
(first '(a b c))   ; a      — functions work on code too
```

**Quoting is the one concept to nail.** `'x` = don't evaluate, give me the symbol/list itself. Clojure `quote`/`'` and CL `'` behave the same.

### 3.3 Defining things

```lisp
;; Clojure                    ;; Common Lisp
(def x 42)                    (defparameter *x* 42)
(defn square [n] (* n n))     (defun square (n) (* n n))
(square 7)      ; 49          (square 7)      ; 49
(let [y 10] (+ y 1))          (let ((y 10)) (+ y 1))   ; 11
```

### 3.4 Conditionals and recursion

```lisp
;; Clojure
(if (> x 10) "big" "small")
(cond (= x 1) "one" :else "other")

;; Common Lisp — note parens wrap condition AND value
(if (> x 10) "big" "small")
(case x (1 "one") (t "other"))
```

Recursion works but Clojure prefers **iteration via seq operations** (§4.4); common Lisp prefers **`loop`** ([[Common_Lisp_Cheatsheet]]).

### 3.5 The REPL loop

Type an expression → press Enter → the runtime evaluates it → prints the result → **state persists**. Define a function, call it, redefine it, call again — no restart. This is the entire workflow; everything else is bookkeeping.

```text
user=> (+ 1 2)
3
user=> (defn hi [n] (str "hello " n))
#'user/hi
user=> (hi "world")
"hello world"
```

### 3.6 Comments

| Dialect | Line comment | Block / discard |
|---------|--------------|-----------------|
| Clojure | `;; text` | `#_form` (discard next form), `(comment …)` |
| Common Lisp | `;` (one `;` = prose, `;;;;` = header) | `#\| … \|#` |
| Racket | `;` | `#| … |#` |

---

## 4. Clojure in one sitting

### 4.1 The four persistent data structures

```clojure
[1 2 3]            ; vector — indexed, ordered
'(1 2 3)           ; list (rarely used directly)
{:name "ada" :n 3} ; map — the workhorse (rows, options, schemas)
#{1 2 3}           ; set
```

All **immutable**: every "change" returns a new value.

```clojure
(def v [1 2 3])
(assoc v 1 99)     ; [1 99 3] — v untouched
(conj v 4)         ; [1 2 3 4]
(assoc {:a 1} :b 2); {:a 1, :b 2}
```

Keywords (`:a`) are interned strings used as keys/column names — **the single most important idiom for data work**: tablecloth columns are keywords.

### 4.2 Functions

```clojure
(defn greet [name] (str "hi " name))     ; named
#(+ % 1)                                  ; reader lambda: (fn [x] (+ x 1))
(map #(+ % 1) [1 2 3])                    ; (2 3 4)
(defn greet
  ([] "hi")
  ([name] (str "hi " name)))              ; multi-arity
```

### 4.3 Threading macros — the readability trick

Nested calls read inside-out; threading reads **top-down like a pipeline**:

```clojure
;; same result, three ways
(reduce + (filter odd? (map inc [1 2 3 4])))

(->> [1 2 3 4]          ; ->> threads as LAST arg
     (map inc)
     (filter odd?)
     (reduce +))        ; 6

(-> {:a 1}              ; -> threads as FIRST arg (for map/record pipelines)
    (assoc :b 2)
    (update :a inc))
```

**Data pipelines are almost always `->>`** (last-arg threading): the data flows down the page. This pattern maps 1:1 onto tablecloth pipelines in §6.

### 4.4 Seq operations — the vocabulary

```clojure
(map inc xs)          ; transform each
(filter odd? xs)      ; keep matches
(remove odd? xs)      ; drop matches
(reduce + 0 xs)       ; fold
(keep identity xs)    ; map + drop nils
(take 5 xs) (drop 5 xs) (take-while #(< % 10) xs)
(sort-by :age xs)     ; sort by key
(frequencies xs)      ; counts — lazy group-by
(partition-all 100 xs); chunking
(first xs) (second xs) (rest xs) (count xs)
(into {} pairs)       ; realize into a collection
```

> [!warning] Laziness
> Most seq ops return **lazy seqs** — nothing happens until you consume (`doall`, `into []`, `println`, `reduce`). Forgetting this is the classic Clojure surprise: an expression "does nothing" until something forces it. In data work, force at the end of each pipeline step (`tc/…` does this for you).

### 4.5 Namespaces and requires

```clojure
(ns my.analysis
  (:require [tablecloth.api :as tc]    ; tc/dataset, tc/select-rows …
            [tech.v3.datatype.functional :as dfn]))  ; dfn/mean …
```

`def` in one namespace isn't visible in another without `require`. REPL shortcut: `(require '[tablecloth.api :as tc])` — or use the deps alias in §6.

---

## 5. Tooling in 60 seconds

| Task | Command |
|------|---------|
| Start REPL (with deps) | `clj` |
| Run one expression | `clj -M -e '(println (+ 1 2))'` |
| Run a `-main` | `clj -M -m my.ns` |
| Run tests | `clj -X:test` (with a test alias) |
| Format | `cljfmt fix` / `zprint` |
| Lint | `clj-kondo --lint src` |
| Docs | clojuredocs.org, cljdoc.org (per-library API docs) |

Project anatomy: `deps.edn` (deps + aliases) + `src/` (namespaces as `src/my/analysis.clj` for `my.analysis`). That's it — no build step, no virtualenv.

---

## 6. Your first dataset (tablecloth)

tablecloth = the pandas of Clojure (built on tech.ml.dataset). Full recipes: [[Lisp_Data_Science_Snippets]]. This is the guided version.

```clojure
;; deps.edn: {scicloj/tablecloth {:mvn/version "8.024"}}
(require '[tablecloth.api :as tc])

;; 1 — load
(def df (tc/dataset "path/to/hourly_export.csv"))   ; or a URL, or a map of columns
(def df (tc/dataset {:hour [0 1 2] :calls [12 8 4]})) ; from literals

;; 2 — look (always do this first)
(tc/head df)          ; first rows
(tc/info df)          ; column names, types, missing counts — the profiler
(tc/shape df)         ; [rows cols]
(tc/row-count df)

;; 3 — select & transform
(tc/select-columns df [:hour :calls])
(tc/rename-columns df {:calls :volume})
(tc/add-column df :log-calls (map #(Math/log (inc %)) (:calls df)))
(tc/select-rows df (fn [row] (> (:calls row) 10)))     ; predicate filter
(tc/order-by df [:calls] :desc)

;; 4 — group & aggregate (the pandas split-apply-combine)
(-> df
    (tc/group-by :hour)
    (tc/aggregate {:mean-calls (fn [t] (dfn/mean (:calls t)))
                   :n          tc/row-count})
    (tc/without-grouping->))

(tc/crosstab df :hour :day)   ; instant contingency table

;; 5 — missing data
(tc/drop-missing df)
(tc/replace-missing df :calls :downup)   ; ffill + bfill; also :down, :lerp, :value <fn>

;; 6 — join (have two tables? left-join is the workhorse)
(tc/left-join df other-df [:hour])

;; 7 — write
(tc/write! df "out.csv")      ; also .tsv, .json, .ndjson, .parquet
```

**The shape to memorize:** `load → info → select → group → aggregate → write`, threaded with `->>`. Every data-science task is a variation.

Visualization: **Hanami** builds Vega-Lite specs from Clojure data (`hanami/plot`-style layers, via [[Lisp_Data_Science_Snippets]] §9), **Oz** renders them (`(oz/view! spec)` opens the browser), **Clay** writes literate reports straight to files. See [[Lisp_Resources]] for the scicloj docs.

---

## 7. Idioms that will trip you up

1. **`nil` is falsy, everything else truthy** (unlike most languages — `0` and `""` are truthy).
2. **Missing data ≠ 0.** `nil` in a column means missing; tablecloth has its own missing machinery (`tc/drop-missing`, `tc/replace-missing`) — don't hand-roll `nil` checks.
3. **Keyword vs string columns.** tablecloth accepts both; pick **keywords** (`:calls`) and stay consistent — `{:key-fn keyword}` when loading.
4. **`=` not `==`** for values; `==` is numeric-only.
5. **Mutating functions end in `!`** (`swap!`, `reset!`, `println` side effects) — a signal, not a rule. Data pipelines should use neither.
6. **Persistent ≠ slow.** Persistent structures share structure; they're fast enough for data work (and the real heavy lifting is in tech.ml.dataset's columnar engine).
7. **Don't reach for classes.** A map with `:type` beats a `defrecord` until you have a genuine domain model.

---

## 8. Structural editing (the enabler)

Paren-heavy code without editor support is misery; with support it's a superpower (fast navigation, safe refactoring by sexp). Minimum viable setup:

- **LSP:** `clojure-lsp` gives go-to-definition, rename, hover docs, diagnostics (clj-kondo inside).
- **Structural editing:** vim-sexp + mappings ([[Lisp_Editor_Integrations]] §4) or Parinfer — *let indentation decide paren balance*.
- **REPL in a tmux pane:** evaluate from the buffer into a live REPL ([[Tmux_Tutorial]]).

Full matrix for Emacs (CIDER/SLIME), Neovim (Conjure/nvlime), Vim (fireplace/vim-slime), Helix (built-in clojure-lsp), Kakoune (kak-lsp) → [[Lisp_Editor_Integrations]].

---

## 9. Learning plan + tracker

### Week 1 — core
- [ ] [[Lisp_Installation]] §2/§3 + §6 smoke tests pass
- [ ] REPL open; §3 forms typed by hand (no copy-paste)
- [ ] Vector/map ops: `assoc`, `update`, `merge`, `get`
- [ ] Seq ops: map/filter/reduce/`->>` until boring
- [ ] Finish with: `(->> ["a" "bb" "ccc"] (map count) (filter odd?) (reduce +))` from memory

### Week 2 — data
- [ ] §6 tablecloth walkthrough on a real CSV (`duckdb-lab/data/hourly_export.csv`)
- [ ] `tc/info` + `tc/head` on every CSV in the vault you care about
- [ ] group-by → aggregate → crosstab exercises ([[Lisp_Data_Science_Snippets]] §4–§6)
- [ ] One join between two tables
- [ ] Write a result back out as CSV

### Week 3 — viz + tooling
- [ ] A Vega-Lite chart via Hanami or Oz ([[Lisp_Data_Science_Snippets]] §9)
- [ ] `clj-kondo` + `clojure-lsp` wired into your editor ([[Lisp_Editor_Integrations]])
- [ ] A small project: `deps.edn` + `src/` + tests + a `-main`
- [ ] Read: [Clojure for the Brave and True](https://www.braveclojure.com/) ch.1–5 (free)

### Week 4 — synthesis
- [ ] Port one real question from [[duckdb_notes]] SQL to tablecloth — same answer?
- [ ] A Clay/Oz report generated into this vault
- [ ] Skim [[Common_Lisp_Tutorial]] §1–§4 — can you read the CL equivalents?
- [ ] Pick a build from [[Lisp_Project_Ideas]]

### Milestones
| # | Milestone | Evidence |
|---|-----------|----------|
| 1 | REPL fluent | §3 + seq ops from memory |
| 2 | Wrangler | real CSV profiled, grouped, joined, written |
| 3 | Reporter | one chart + one generated report |
| 4 | Bilingual | can read CL and translate a snippet |
