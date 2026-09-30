---
type: learning-note
topic: Common Lisp tutorial — SBCL REPL, core language, loop, Quicklisp, and the Lisp-Stat data-science track
date: 2026-09-30
status: active
tags:
  - common-lisp
  - data-science
  - tutorial
  - learning-plan
  - lisp
---

# Common Lisp Tutorial — The Classic Track

> Goal: get productive in **Common Lisp** — the 1984 standard that still runs production systems — enough to do data work with **Lisp-Stat**, read the scicloj-vs-CL trade-offs, and know when native compilation beats the JVM. This is the *second* dialect; take [[Clojure_Tutorial]] first unless you're specifically here for CL.
> Related: [[Lisp_Installation]] §2/§4 (SBCL + Quicklisp), [[Common_Lisp_Cheatsheet]] (syntax at a glance), [[Lisp_Data_Science_Snippets]] §3/§7/§8 (Lisp-Stat recipes), [[Clojure_Tutorial]] §3 (shared Lisp core — read §3 there first), [[Lisp_Resources]] (books: PCL, CL Cookbook)

## How to use this note

1. **Read [[Clojure_Tutorial]] §3 first** — the shared Lisp core (prefix notation, quoting, REPL) applies here verbatim.
2. **§1–§4** — what's different in CL, the REPL, the core forms, `loop`.
3. **§5–§7** — Quicklisp packages, Lisp-Stat data work, performance.
4. **§8 plan** — a compact tracker (CL is a 2-week side quest, not a second spine).

---

## 1. Why Common Lisp still matters

- **Two dimensions of evolution:** the language (ANSI-standardized in 1994, frozen and *complete*) and the implementation (SBCL's compiler keeps getting faster — native code, type inference, world-bumping hot reload). Your code doesn't rot as the runtime improves.
- **Conditions > exceptions.** CL's condition system can *restart* from errors interactively — inspect the failure at the REPL, fix it, resume. Unheard of elsewhere; transformative for long-running data jobs.
- **Performance without leaving the language.** `declaim`/`declare` types + `(optimize (speed 3))` gets you C-adjacent numeric loops. For hot numeric code this beats JVM's profile-guided warmup story.
- **The ecosystem is stable.** Quicklisp's ~2,500 libraries don't churn; CL is used in finance, CAD, chip verification, and tools like Emacs's ancestor.
- **Interoperability is a protocol.** SWANK/SLIME lets an editor drive a remote REPL — the model Neovim's Conjure and nvlime copy today.

Costs: slower iteration than Clojure's data stack, a steeper standard-library learning curve (`format`'s `~` directives are a language of their own), and the data-science ecosystem (Lisp-Stat) is smaller than scicloj.

**Choose CL when:** you need native numeric performance, you love the condition system, or you're maintaining CL systems. **Choose Clojure when** you're doing general data science ([[Clojure_Tutorial]] §1).

---

## 2. The SBCL REPL

```bash
sbcl                    # starts the REPL (Quicklisp auto-loads via ~/.sbclrc)
* (setf x 42)           ; NOTE: the prompt is *
* (* x 2)               ; 84
* (defun hi (n) (format nil "hello ~a" n))
HI
* (hi "world")
"hello world"
```

Key REPL habits:

| Key / form | Action |
|------------|--------|
| `*` prompt | you're in the Lisp image — state persists |
| `, <command>` | SLIME/SLY minibuffer commands (`apropos`, `describe`…) |
| `Ctrl-d` / `(sb-ext:quit)` | exit (SLIME: `,q` or `C-c C-4 C-z` then quit) |
| `(describe 'x)` | what is this? |
| `(apropos "parse")` | find symbols by substring |
| `(docs …)` via `C-c C-d` | editor-integrated docs ([[Lisp_Editor_Integrations]]) |

> [!tip] Image-based development
> CL programs run **inside a live image**. You define, redefine, and test at the REPL, then dump the image or save a binary with `(sb-ext:save-lisp-and-die "prog" :toplevel #'main)`. There is no "restart the process" — you *edit the running world*.

---

## 3. Core forms (the Clojure ↔ CL dictionary)

| Concept | Clojure | Common Lisp |
|---------|---------|-------------|
| Define var | `(def x 1)` | `(defparameter *x* 1)` (dynamic) / `(defvar *x* 1)` |
| Define fn | `(defn f [n] …)` | `(defun f (n) …)` |
| Locals | `(let [a 1] …)` | `(let ((a 1)) …)` — note parens around binding pair |
| Call | `(f a b)` | `(f a b)` — identical |
| If | `(if c a b)` | `(if c a b)` — identical |
| Cond | `(cond p e :else e)` | `(cond (p e) (t e))` — **`t` = true, clauses are lists** |
| Case | `(case x 1 … :else …)` | `(case x (1 …) (t …))` |
| Anonymous | `#(+ % 1)` | `(lambda (n) (+ n 1))` or `#'` reader: `(lambda (n) …)` |
| Loop | `loop/recur` | `(loop (…) … (return x))` / `dotimes` / `dolist` |
| Strings | immutable, `str` ns | mutable-safe, `(concatenate 'string …)` |
| Comments | `;;` | `;` (one `;` prose, `;;;;` section headers) |
| Keywords | `:name` | `:name` — same idea |
| Falsy | `nil` only | `nil` only — `0` and `""` are truthy (same rule in both) |

> [!note] One honest difference
> Both treat `nil` as the only false value. The *real* style differences: CL packages (`in-package`), the condition system, and `format`.

### 3.1 `format` — the print/swiss-army knife

```lisp
(format t "count: ~:d~%" n)                 ; ~:d = grouped digits: 1,234
(format nil "~{~a ~}" '(1 2 3))             ; "1 2 3 " — iteration directive
(format t "~{~a~^, ~}" '("a" "b" "c"))      ; "a, b, c" — separator on all but last
(format t "~{~a:~a~^ ~}" (list :a 1 :b 2))  ; "a:1 b:2"
```

First 30 minutes with [the `format` cheat sheet](https://www.lisper.org/format/) saves hours. For data output you'll rarely need more than `~a`, `~d`, `~f`, `~{…~}`.

### 3.2 Packages

```lisp
(defpackage #:my.analysis
  (:use #:cl)                    ; import standard CL symbols
  (:import-from #:tablecloth #:dataset)   ; selective
  (:export #:run))
(in-package #:my.analysis)
```

A "namespace" that's a symbol-mapping object. `cl:map` (function) vs `map` (your thing) — prefix with `cl:` when you shadow.

---

## 4. `loop` — iteration in one macro

CL's `loop` is a mini-language; learn these batteries:

```lisp
;; collect (the map/filter/reduce workhorse)
(loop for i from 1 to 10 collect (* i i))
;; => (1 4 9 16 … 100)

(loop for x in xs when (oddp x) collect x)      ; filter
(loop for x in xs sum x)                        ; reduce +
(loop for x across arr maximize x)              ; arrays
(loop for k being the hash-keys of h using (hash-value v) …)  ; maps
(loop repeat 5 collect (random 10))             ; repeat
(loop for i below (length xs) …)                ; index

;; accumulate + early exit
(loop for x in xs
      with total = 0
      while (< total 1000)
      do (incf total x)
      finally (return total))

;; nested, with result
(loop for row in rows
      append (loop for col in cols
                   collect (aref row col)))
```

`iterate` (Quicklisp lib) gives a cleaner `for`/`collect` syntax if you prefer declarative loops; `loop` is standard and dependency-free — start there.

---

## 5. Quicklisp — packages in one line

```lisp
* (ql:quickload :alexandria)          ; utility Swiss-army knife
* (ql:quickload :cl-csv)              ; CSV IO
* (ql:quickload :lisp-stat)           ; the data-science umbrella (pulls tablecloth-like DF lib, dfio, etc.)
* (ql:quickload :vgplot)              ; gnuplot-based plotting
* (ql:quickload :cl-ana)              ; binned data analysis / histograms (HEP-derived)
```

- Install libs: `ql:quickload` (download + compile + load).
- Find: `(ql:where-is-it "csv")`, quickdocs.org, awesome-cl.
- Local projects: put them in `~/common-lisp/` — ASDF (CL's build system, behind Quicklisp) finds them automatically via the default source registry.
- System definition = `.asd` file (like `deps.edn` + `package.json` combined).

---

## 6. Data science: Lisp-Stat

[Lisp-Stat](https://lisp-stat.dev/) is CL's data-frame + statistics environment (successor of the 1990s Stat Lisp). Umbrella package: `lisp-stat`.

```lisp
(ql:quickload :lisp-stat)

;; load a CSV → data frame
(defdf iris (read-csv "/path/to/iris.csv"))     ; "defdf" defines a frame var

;; columns & shapes
(column iris 'sepal-length)        ; note: quoted SYMBOLS as column names
(iris 'sepal-length)               ; call the frame like a function → column
(rows iris) (columns iris)

;; select: (select frame rows-predicate column-symbols)
(select iris (lambda (x) (> (car x) 5.0)) '(sepal-length petal-length))

;; build frames from literals
(make-df '(:a :b) '(#(1 2 3) #(10 20 30)))

;; IO both directions
(dfio:read-csv "data.csv")         ; explicit dfio package
(dfio:write-csv iris "out.csv")
```

Column names are **symbols** (`'sepal-length`), not keywords — the CL community convention. Missing-data handling, summary stats, and plotting live under the `lisp-stat.*` packages; docs at [lisp-stat.dev](https://lisp-stat.dev/) (see also [[Lisp_Data_Science_Snippets]] §8 for side-by-side snippets).

**Pipeline shape in CL:** data frames are mostly functional (`select`, `subset`, joins), but CL lacks `->>` threading — use `->`-style local vars or the `serapeum`/`alexandria` threading macros if you miss it.

---

## 7. Performance notes

```lisp
(defun dot-product (a b)
  (declare (type (simple-array double-float (*)) a b)
           (optimize (speed 3) (safety 1)))
  (let ((acc 0d0))
    (declare (type double-float acc))
    (loop for i below (length a)
          do (incf acc (* (aref a i) (aref b i))))
    acc))
```

- **Type declarations are the optimization.** SBCL uses them to emit unboxed SIMD-friendly loops.
- Arrays: use `(simple-array double-float (*))` — specialized, packed, no boxing.
- Benchmark honestly: **`trivial-benchmark`** or `sb-sprof` (built-in statistical profiler).
- Compile with safety 0 only in hot loops you've measured; safety 1 is the sane default.
- Data-frame heavy lifting (Lisp-Stat) is already columnar — profile before hand-tuning.

---

## 8. Learning plan + tracker

### Week 1 — language
- [ ] [[Lisp_Installation]] §2 + §4 — `sbcl` and Quicklisp working
- [ ] REPL fluency: `defun`, `let`, `cond`, `loop collect/filter/sum`
- [ ] Type 5 `loop` forms from memory (§4)
- [ ] `(ql:quickload :alexandria)` + `(ql:quickload :cl-csv)`
- [ ] Read: [Practical Common Lisp](https://gigamonkeys.com/book/) ch.1–5 + 14 (strings/paths)

### Week 2 — data
- [ ] `(ql:quickload :lisp-stat)` loads clean
- [ ] `read-csv` on a vault CSV → `column` → `select` → `make-df` round-trip ([[Lisp_Data_Science_Snippets]] §8)
- [ ] SLIME or nvlime wired ([[Lisp_Editor_Integrations]]) — eval from editor
- [ ] One `vgplot` chart
- [ ] Compare: rewrite one Clojure tablecloth step in CL — note the ergonomics difference

### Milestones
| # | Milestone | Evidence |
|---|-----------|----------|
| 1 | REPL + loop fluent | §4 from memory |
| 2 | Data-capable | CSV → frame → stats → plot in CL |
| 3 | Bilingual | can translate a tablecloth snippet to Lisp-Stat |

**Interop bridge:** keep [[Clojure_Cheatsheet]] open — for every CL form you learn, note its Clojure twin. The two languages are 80% the same thought.
