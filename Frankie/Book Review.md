---
type: research-note
status: active
topic: "My technical review of The Frankie Programming Language for the author — findings, errors, and suggestions, chapter by chapter."
created: 2026-10-16
aliases:
  - Frankie Book Review
  - Book Review
  - Review Notes
tags:
  - frankie
  - book-review
  - writing
  - technical-editing
---

# Book Review — *The Frankie Programming Language*

> **Reviewing copy:** `Frankie/The Frankie Programming Language.pdf` — 205 pp, LaTeX via
> pandoc, dated 2026-08-02. Watermarked *"To Tony Dunsworth"*. The *Meet the Reviewers*
> section (p. 10) still carries a **`YOUR NAME HERE!`** placeholder.
>
> **This note is a scaffold.** Structure and verified reference material are set up below;
> the findings themselves are yours to write.

---

## Review scope

| | |
|---|---|
| **Book** | *The Frankie Programming Language* — Blag (Alvaro Tejada Galindo) |
| **Length** | 205 pages (author says "around 206") |
| **Language version** | v1.22.x — see the freeze history below |
| **My role** | Named reviewer; see p. 10 |
| **Status** | ☐ Not started · ☐ In progress · ☐ Drafted · ☐ Sent |

### Context that shapes the review

From 🔗 [*The Book of Frankie*](https://medium.com/@atejada/the-book-of-frankie-d2d1485899dd)
(Medium, 10 Sep 2026), in the author's own words:

> "For a programming language to become successful, or at least to be known by more than 2
> people, **a book is needed**."

> "While writing the book, **I found some nasty bugs** as well as some improvements to be made,
> so right now, Frankie is on v1.22.2, and it will remain like that for the longest time. While
> bug fixes will be applied, **no new functionality will be added at all.** I want the Book of
> Frankie to be a complete reference for Frankie developers."

> "The book is **not yet available**, as I still need some valuable input from my reviewers."

Three things follow from that:

1. **This review is on the critical path to publication.** The author is explicitly holding
   release until reviewer input lands. That raises the bar on thoroughness and makes
   turnaround worth discussing with him.
2. **The freeze history is not what the homepage implies.** The Medium post says the freeze
   began at **v1.21.0**; bugs found while writing the book then moved it to **v1.22.x**. So
   v1.22 is itself partly a product of the review process — any v1.22-specific behaviour in the
   book may not have existed when the prose was drafted.
3. **Bugs are already known.** "Nasty bugs" found mid-write. Ask which ones and what was fixed;
   the book may already have drifted from the compiler, which is the cheapest finding to check
   and the most embarrassing to miss.

**Book production:** written in Quarto on RStudio, typeset with LaTeX via pandoc (confirmed in
the PDF's producer metadata). Relevant if you find formatting or cross-reference problems —
those may be Quarto issues rather than authoring ones, and the fix belongs upstream.

---

## Structure

Five parts, 28 chapters.

| Part | Ch | Chapter | Page |
|---|---|---|---|
| **I — Why Frankie** | 1 | Why Build a Language? | 8 |
| | 2 | Installing Frankie | 14 |
| | 3 | Your First Program | 16 |
| **II — The Language** | 4 | Variables, Types, and Truthiness | 18 |
| | 5 | Control Flow | 23 |
| | 6 | Functions | 31 |
| | 7 | Strings, Numbers, and Ranges | 35 |
| | 8 | Vectors and Hashes | — |
| | 9 | Records | — |
| | 10 | Lambdas and Blocks | — |
| | 11 | Error Handling | — |
| | 12 | Organizing Code | — |
| **III — Stdlib and I/O** | 13 | Files, JSON, and CSV | — |
| | 14 | R-Style Statistics and Math | — |
| | 15 | Regex, Dates, and Encoding | — |
| | 16 | Databases with SQLite | — |
| | 17 | Concurrency | — |
| | 18 | Networking | — |
| | 19 | The Built-in Web Server | — |
| **IV — Tooling** | 20 | Stitches — Frankie's Package System | — |
| | 21 | Testing | — |
| | 22 | Debugging and Benchmarking | — |
| | 23 | Tooling | — |
| | 24 | Shipping Frankie | — |
| **V — Projects** | 25 | Building a CLI Tool | — |
| | 26 | Building a Web App | — |
| | 27 | Building a Terminal Game | — |
| | 28 | Building a Multiplayer Browser Game | — |

Front matter: *Welcome to the Book of Frankie* (p. 8) · *Meet the Author* · ***Meet the
Reviewers*** (p. 10) · *Meet Frankie* (p. 11).

> Page numbers past p. 18 are not filled in above — the PDF's table of contents renders them
> out of order to `pdftotext`. Fill them from the PDF as you work through.

---

## How to work through it

Two sections of this note are for things that are *facts*, and two are for things that are
*judgements*. Keeping them apart matters — a wrong version number is a bug report; "this
chapter drags" is an opinion, and the author may reasonably disagree.

### 1. Factual findings

Only things verifiable against the implementation.

| Location | Finding | Severity | Reported? |
|---|---|---|---|
| | | ☐ blocker ☐ major ☐ minor | ☐ |

*Categories worth checking systematically:*

- **Version drift.** Book says v1.22.x; does the shipped compiler match? Especially the
  v1.22.2→v1.22.3 fixes, which were found *while writing this book*.
- **Code that does not run.** Every snippet is a candidate — see the batch-run idea below.
- **Documented behaviour that contradicts `frankiec check`** — the static analyser is a
  free oracle for "is this snippet actually valid?"
- **The `YOUR NAME HERE!` placeholder** on p. 10. Worth flagging before publication.
- **Missing v1.22 features.** Matrix math, complex numbers, math intrinsics and labeled loops
  landed in the freeze release the book is written against. Are they covered?

### 2. Judgement and suggestions

| Location | Suggestion | Rationale |
|---|---|---|
| | | |

*Things I noticed while reading that are worth saying something about:*

- **The four-donor premise is the book's strongest idea.** Does the book actually deliver on it
  chapter by chapter, or does it front-load the comparison and never cash it in?
- **Part II has 9 chapters of language basics before anything is built.** Is that the right
  split for a reader who wants to ship something?
- **`record` vs hash.** The overlap is real — is the book clear about when to use which?
- **`require` vs `import "x" as y`.** Two module mechanisms. Does the book explain the
  division of labour, or just present both?
- **Brace blocks.** The compiler rejects `{ }`; the grammar rejects them too. Nothing in a
  Ruby-flavoured language prepares a reader for that. Worth a note.
- **Zero dependencies is both the selling point and a security posture.** Does the book
  address it? It should.

### 3. Chapters read

- [ ] Part I (1–3)
- [ ] Part II (4–12)
- [ ] Part III (13–19)
- [ ] Part IV (20–24)
- [ ] Part V (25–28)

### 4. Verdict

> *To fill in.*

---

## Tools available while reviewing

The vault is unusually well-equipped for checking claims in this book.

| Tool | Use for verifying a claim |
|---|---|
| `frankiec run` | Does the snippet actually execute |
| `frankiec check file.fk` | Static analysis — fastest oracle for "is this valid Frankie?" |
| `frankiec fmt --check` | Is the snippet in the formatter's canonical form |
| `tree-sitter parse file.fk` | Parses with **zero** `ERROR`/`MISSING` nodes if valid — see [[Tree-sitter Grammar]] |
| Browser playground 🔗 https://atejada.github.io/frankielanguage/ | No install needed; 20 s cutoff, no network |

> **Suggested batch approach.** The tree-sitter grammar was already validated against all 46
> upstream `examples/` files. Extract every fenced `.fk` block from the book, drop each into
> `tree-sitter parse`, and collect the ones that produce an `ERROR` node. That turns
> "I read every code sample carefully" into a repeatable check — and the same corpus can drive
> `frankiec check`.

---

## Questions for the author

- [ ]
- [ ]

---

## Review log

| Date | Action | Outcome |
|---|---|---|
| 2026-10-16 | Review copy filed in vault; note scaffolded | — |

## Cross-links

- [[Frankie Language]] — the language itself
- [[Tree-sitter Grammar]] — the `.fk` parser, and the source of a testing idea
- [[Frankie/README]] — folder index