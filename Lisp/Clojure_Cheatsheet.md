---
type: cheatsheet
topic: Clojure syntax, seq operations, tablecloth data ops, and REPL/CLI commands at a glance
date: 2026-09-30
status: active
tags:
  - clojure
  - cheatsheet
  - data-science
  - keybindings
  - lisp
---

# Clojure Cheatsheet

> Companion to [[Clojure_Tutorial]]. Keep this open while working. General lookup: [[Lisp_Data_Science_Snippets]] (full recipes), [[Lisp_Editor_Integrations]] (eval keys per editor), [[Common_Lisp_Cheatsheet]] (the classic-track equivalent).

## 1. REPL & CLI

| Command | Action |
|---------|--------|
| `clj` | Start REPL (deps from `deps.edn`, needs `rlwrap`) |
| `clojure` | Same tooling, no rlwrap (scripts/CI) |
| `clj -M -e '(…)'` | Evaluate one expression and exit |
| `clj -M -m my.ns` | Run `-main` |
| `clj -X:alias` | Run exec fn (data-map args) |
| `clj -Ttools …` | Run a tool |
| `clj -X:test` | Run tests (with `:test` alias) |
| `clj -P` | Prefetch deps only (CI warm-up) |
| `clj-kondo --lint src` | Lint |
| `cljfmt fix` / `zprint` | Format |

REPL inside: `(require '[tablecloth.api :as tc])` · `(in-ns 'user)` · `(doc map)` · `(source map)` · `(use 'clojure.repl)` first time for `doc`/`source`.

## 2. Data structures & core forms

| Form | Example / meaning |
|------|-------------------|
| Vector | `[1 2 3]` — ordered, indexed |
| Map | `{:a 1 :b 2}` — the workhorse; keywords are column names |
| Set | `#{1 2 3}` |
| List (quoted) | `'(a b c)` — mostly for code |
| Define | `(def x 42)` · `(defn f [n] …)` · `(defmulti/defmethod)` |
| Multi-arity | `(defn f ([] …) ([a] …))` |
| Let (local) | `(let [a 1 b 2] (+ a b))` |
| Anonymous | `#(+ % 1)` = `(fn [x] (+ x 1))`; `%1 %2`, `%&` rest |
| If | `(if test then else)` — `nil`/`false` falsy |
| Cond | `(cond p1 e1 p2 e2 :else e3)` |
| When (no else) | `(when test …body)` |
| Case | `(case x 1 "one" 2 "two" "other")` |
| Quote | `'form` — don't evaluate |
| Comment | `;; line` · `#_form` discard · `(comment …)` |
| Threading | `(-> x (f 1) (g 2))` first-arg · `(->> x (f 1) (g 2))` last-arg |
| Loop/recur | `(loop [n 5 acc 1] (if (zero? n) acc (recur (dec n) (* acc n))))` |
| Try | `(try (…) (catch Exception e …) (finally …))` |
| Deref/atoms | `(atom v)` · `(swap! a f args)` · `@a` |

## 3. Seq operations

| Function | Example |
|----------|---------|
| `map` | `(map inc [1 2 3])` → `(2 3 4)` |
| `filter` / `remove` | `(filter odd? xs)` / `(remove odd? xs)` |
| `reduce` | `(reduce + 0 xs)` |
| `keep` | `(keep f xs)` — map, drop `nil`s |
| `mapv` / `filterv` | eager vector versions |
| `take` / `drop` | `(take 5 xs)` · `(take-while #(< % 10) xs)` |
| `sort` / `sort-by` | `(sort-by :age xs)` |
| `frequencies` | `(frequencies xs)` → counts map |
| `group-by` | `(group-by :hour xs)` → map of seqs |
| `distinct` / `dedupe` | unique (all) / adjacent-dedupe |
| `interpose` / `interleave` | join/zip seqs |
| `partition-all` / `partition-by` | chunking |
| `into` | `(into [] xs)`, `(into {} pairs)` — **realizes laziness** |
| `first`/`second`/`rest`/`next` | head/tail |
| `count` / `empty?` / `seq` | predicates |
| `flatten` / `tree-seq` | nested structures |
| `doseq` / `dotimes` | side-effecting iteration (returns nil) |
| `run!` | `(run! println xs)` |
| `comp` / `partial` / `juxt` | function algebra |
| `apply` | `(apply max xs)` |

> Force lazy seqs: `doall`, `into []`, `run!`, `reduce`, or a terminal `println`.

## 4. Strings, numbers, maps

```clojure
(str/join ", " xs)              ; require clojure.string :as str
(str/split "a,b,c" #",")
(str/replace s #"\d+" "#")
(str/lower-case s) (str/trim s)
(parse-long "42") (parse-double "3.1")   ; nil on failure
(Math/round 3.6) (Math/log 10) (Math/sqrt 2)
(inc/dec + - * /) (quot 7 2) (rem 7 2) (mod -7 2)
(get m :k "default") (:k m) (get-in m [:a :b])
(merge m1 m2) (select-keys m [:a :b]) (dissoc m :a)
(update m :n inc) (assoc-in m [:a :b] 1) (get-in m [:a :b])
(keys m) (vals m) (merge-with + m1 m2)
```

## 5. tablecloth (data ops)

```clojure
(require '[tablecloth.api :as tc]
         '[tech.v3.datatype.functional :as dfn])
```

| Task | Call |
|------|------|
| Load CSV/JSON/parquet | `(tc/dataset "f.csv")` · `(tc/dataset "u.csv" {:key-fn keyword})` |
| Load from literals | `(tc/dataset {:col [1 2 3]})` |
| First rows / profile | `(tc/head df)` · `(tc/info df)` |
| Dimensions | `(tc/shape df)` · `(tc/row-count df)` |
| Column names | `(tc/columns df :as-map)` |
| Pick columns | `(tc/select-columns df [:a :b])` · drop: `tc/drop-columns` |
| Rename | `(tc/rename-columns df {:old :new})` |
| Add column | `(tc/add-column df :c (map f (:a df)))` |
| Keep rows | `(tc/select-rows df idxs-or-fn)` — `(comp f :col)` or `(fn [row] …)` |
| Drop rows | `(tc/drop-rows df n)` |
| Sort | `(tc/order-by df [:a] :desc)` |
| Group + aggregate | `(-> df (tc/group-by :k) (tc/aggregate {:n tc/row-count :m #(dfn/mean (% :v))}) (tc/without-grouping->))` |
| Aggregate whole df | `(tc/aggregate df {:mean #(dfn/mean (% :v))})` |
| Contingency table | `(tc/crosstab df :a :b)` |
| Unique rows | `(tc/unique-by df [:a])` |
| Pack/unpack rows | `(tc/fold-by df [:k])` group → collection columns · `(tc/unroll df [:col])` explode collections back to rows |
| Reshape | `(tc/pivot->longer df [:w1 :w2] {:value-column-name :v})` · `(tc/pivot->wider df :variable :value)` |
| Join | `(tc/left-join df g [:k])` — right/inner/full/semi/anti/cross |
| Missing | `(tc/drop-missing df)` · `(tc/replace-missing df :c :downup)` — strategies `:down` `:up` `:lerp` `:value` |
| Write | `(tc/write! df "out.csv")` |
| Stats (dfn) | `dfn/mean` `dfn/median` `dfn/std` `dfn/sum` `dfn/min` `dfn/max` `dfn/cum-sum` |

Details + plots: [[Lisp_Data_Science_Snippets]].

## 6. Project layout

```text
myproj/
├─ deps.edn      {:paths ["src"] :deps {scicloj/tablecloth {:mvn/version "8.024"}}}
├─ src/my/core.clj   (ns my.core (:require …))
├─ test/my/core_test.clj
└─ data/
```

## 7. Editor eval keys (summary)

| Editor | Eval | Docs | Structure |
|--------|------|------|-----------|
| Emacs CIDER | `C-c C-e` expr · `C-c C-k` compile | `C-c C-d d` | paredit |
| Neovim Conjure | `:ConjureEvalCurrentForm` (+ `<leader>e…` maps) | `K` | vim-sexp |
| Vim fireplace | `cpp` inner form · `cqq` cmdline | `K` | vim-sexp |
| Helix | none built-in → tmux REPL pane | `K` (LSP) | `%` matching |
| Kakoune | pipe selection to tmux REPL | `K` (kak-lsp) | `%` matching |

Full setup: [[Lisp_Editor_Integrations]].

## 8. Emergency reference

| Problem | Fix |
|---------|-----|
| REPL has no history | `rlwrap` missing — install it, use `clj` |
| Form does nothing | lazy seq not forced — `into []` / `doall` |
| `Unable to resolve symbol` | missing `require` / wrong namespace |
| Unbalanced parens | editor structural edit; or REPL `Ctrl-c Ctrl-c` to abort |
| Find a function's docs | `(doc f)` · `(source f)` · clojuredocs.org |
| Exit REPL | `Ctrl-d` or `(System/exit 0)` / `:repl/quit` |
| Deps won't resolve | wrong coordinate format — deps.edn uses `{:mvn/version "…"}` |
| Column name not found | keyword vs string — load with `{:key-fn keyword}` |
