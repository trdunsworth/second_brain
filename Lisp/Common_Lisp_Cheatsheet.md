---
type: cheatsheet
topic: Common Lisp syntax, loop directives, Quicklisp commands, and Lisp-Stat data ops at a glance
date: 2026-09-30
status: active
tags:
  - common-lisp
  - cheatsheet
  - data-science
  - keybindings
  - lisp
---

# Common Lisp Cheatsheet

> Companion to [[Common_Lisp_Tutorial]]. Shared Lisp core: [[Clojure_Tutorial]] §3. Lisp-Stat recipes: [[Lisp_Data_Science_Snippets]] §2–§3, §8. Editor keys: [[Lisp_Editor_Integrations]].

## 1. REPL & startup

| Command | Action |
|---------|--------|
| `sbcl` | Start REPL (`~/.sbclrc` loads Quicklisp) |
| `sbcl --no-sysinit --no-userinit` | Clean image (scripts/installers) |
| `(quit)` / `(sb-ext:quit)` / `C-d` | Exit |
| `(describe x)` | What is this object? |
| `(apropos "parse")` | Find symbols containing substring |
| `(time (…))` | Benchmark a form |
| `,a` (SLIME) | Minibuffer commands: `apropos`, `who-calls`, `trace`… |
| `(trace f)` / `(untrace f)` | Function tracing |
| `(step (…))` | Single-step debugger |
| `C-c C-c` (SLIME) | Abort/interupt current evaluation |

## 2. Definitions & forms

| Form | Example |
|------|---------|
| Var (dynamic) | `(defparameter *x* 42)` — convention: earmuffs |
| Constant | `(defconstant +e+ 2.71828)` |
| Function | `(defun sq (n) (* n n))` |
| Docstring | `(defun f (n) "Doc text." n)` — `(documentation 'f 'function)` |
| Locals | `(let ((a 1) (b 2)) (+ a b))` |
| Parallel setf | `(multiple-value-bind (q r) (truncate 7 2) …)` |
| Mutate | `(setf x 1)` · `(incf n)` · `(decf n)` · `(push v lst)` · `(pop lst)` |
| Anonymous | `(lambda (n) (* n n))` — or `#'(lambda …)` |
| If | `(if test then else)` |
| When/Unless | `(when test …body)` · `(unless test …body)` |
| Cond | `(cond ((> x 10) "big") (t "small"))` — `t` = else |
| Case | `(case x (1 "one") (2 "two") (t "other"))` |
| Typecase | `(typecase v (integer …) (string …) (t …))` |
| And/Or/Not | `(and a b)` `(or a b)` `(not a)` — `nil` only false |
| Quote | `'form` |
| Comments | `;` line · `#| block |#` · `#+nil` skip next form |
| Blocks | `(block name …)` `(return-from name val)` `(tagbody …)` |
| Error/restart | `(error "msg ~a" x)` → debugger; `(restart-case …)` |
| Handler | `(handler-case (f) (error (e) (format nil "err: ~a" e)))` |
| Type decl | `(declare (type fixnum n) (optimize (speed 3)))` |

## 3. `loop` — the batteries

```lisp
(loop for i from 1 to 10 collect (* i i))       ; list comp
(loop for x in xs when (oddp x) collect x)      ; filter
(loop for x in xs sum x)                        ; sum
(loop for x in xs maximize x)                   ; max
(loop for x across arr count (plusp x))         ; count over array
(loop repeat 5 collect (random 10))             ; repeat n
(loop for i below n for x = (f i) while (< x 100) …)  ; while
(loop for k being the hash-keys of h using (hash-value v) …)  ; map iter
(loop with total = 0 … finally (return total))  ; accumulator + return
(loop for row in rows append (mapcar f row))    ; flat-map
```

Termination: `always`, `never`, `thereis`, `finally`, `return`, `do`.

## 4. Sequences & utilities

```lisp
(mapcar #'1+ '(1 2 3))            ; (2 3 4)
(remove-if-not #'oddp xs)         ; filter (remove-if = drop)
(reduce #'+ xs :initial-value 0)
(remove-duplicates xs)            ; :from-end t keeps first
(sort (copy-list xs) #'<)         ; destructive — copy first!
(subseq xs 0 10)                  ; slice (copy)
(elt xs 3) (first xs) (rest xs) (last xs) (length xs)
(find-if #'oddp xs) (position x xs) (member x xs)
(concatenate 'list a b) (append a b)
(aref arr i) (row-major-aref arr i)
(getf plist :key) (setf (getf plist :key) v)   ; property lists
(nth-value 1 (floor 7 2))         ; 2nd value of multi-value fn
;; alexandria extras: alexandria:hash-table-keys, :mappend, :if-let, :when-let
```

**Strings** (CL strings are mutable arrays of chars — don't assume immutability):

```lisp
(concatenate 'string "a" "b")
(format nil "~a-~a" a b)
(with-output-to-string (s) (format s "…~a" x))  ; build string
(let ((s (copy-seq "abc"))) (nstring-upcase s)) ; transform copy
(split-sequence:split-sequence #\, "a,b,c")      ; via Quicklisp split-sequence
```

## 5. Quicklisp / ASDF

| Form | Action |
|------|--------|
| `(ql:quickload :lib)` | Download + compile + load |
| `(ql:quickload '(:a :b))` | Several at once |
| `(ql:update-all-dists t)` | Update libraries |
| `(ql:where-is-it "csv")` | Search for a library |
| `(asdf:load-system "my-proj")` | Load a local system |
| `(asdf:test-system "my-proj")` | Run its tests |
| `~/common-lisp/my-proj/` | Auto-discovered local projects |
| `(sb-ext:save-lisp-and-die "bin" :toplevel #'main :executable t)` | Ship a binary |

## 6. Packages

```lisp
(defpackage #:my.analysis
  (:use #:cl)
  (:import-from #:alexandria #:hash-table-keys)
  (:export #:run #:report))
(in-package #:my.analysis)
;; qualify shadowed symbols: cl:map, cl:reduce
;; (in-package :cl-user)  ← back to default
```

## 7. Lisp-Stat (data ops)

```lisp
(ql:quickload :lisp-stat)
```

| Task | Call |
|------|------|
| Load CSV | `(defdf f (read-csv "data.csv"))` |
| Load (explicit) | `(dfio:read-csv "data.csv")` |
| Column | `(column f 'colname)` · `(f 'colname)` |
| Rows/cols | `(rows f)` · `(columns f)` |
| Select | `(select f predicate-or-nil '(col-a col-b))` |
| From literals | `(make-df '(:a :b) '(#(1 2 3) #(10 20 30)))` |
| Write CSV | `(dfio:write-csv f "out.csv")` |
| Column type | `(column-type f 'col)` (per dfio conventions) |

Column names are **quoted symbols**: `'sepal-length`. Related libraries: `cl-csv` (raw CSV), `cl-ana` (histograms/binned analysis), `vgplot` (gnuplot plots).

## 8. Editor eval keys (summary)

| Editor | Eval | Docs | Notes |
|--------|------|------|-------|
| Emacs SLIME | `C-c C-c` compile defun · `C-x C-e` last sexp · `C-c C-l` load file · `C-c C-z` REPL buffer | `C-c C-d d` | `,`-commands in minibuffer |
| Emacs SLY | same as SLIME (fork) | `C-c C-d d` | REPL buffer `C-c C-z` |
| Neovim nvlime | `<leader>cc` connect · `<leader>rr` run | hover LSP | needs parsley + Quicklisp |
| Vim/Neovim vim-slime | send selection to tmux REPL | — | works with `sbcl` |
| Helix / Kakoune | no built-in eval → tmux pane | `K` (LSP) | see [[Lisp_Editor_Integrations]] |

REPL ↔ editor: SLIME/SLY use SWANK; nvlime speaks the same protocol; vim-slime just pastes text into a terminal — dumb but universal.

## 9. Emergency reference

| Problem | Fix |
|---------|-----|
| `Package FOO does not exist` | `(ql:quickload :foo)` first, or wrong package name |
| Undefined function at runtime | file not loaded — `,l` / `C-c C-l` in SLIME |
| Endless debugger backtrace | `a` (abort) at the debugger prompt; `r` (retry), `c` (continue) |
| Mutated a list by accident | `sort`/`remove` are destructive — `(copy-list x)` first |
| Can't find the API docs | quickdocs.org · awesome-cl · `(describe 'sym)` |
| REPL won't start with deps | check `~/.sbclrc` has `(load "~/quicklisp/setup.lisp")` |
| Column not found | CL wants **symbols**: `'col-name`, not `:col-name` |
