---
type: reference
topic: Lisp resources — awesome lists, scicloj and Lisp-Stat stacks, books, documentation, and communities for data science in Lisp
date: 2026-09-30
status: active
tags:
  - resources
  - links
  - clojure
  - awesome-list
  - lisp
---

# Lisp Resources

> Goal: the curated link shelf — where to go deeper after [[Clojure_Tutorial]] / [[Common_Lisp_Tutorial]], organized by purpose. Everything here was checked at build time (2026-09-30); dead links rot, so flag them in Status if one goes 404.
> Related: [[Lisp_Data_Science_Snippets]] (recipes those links explain), [[Lisp_Editor_Integrations]] (tooling docs), [[Lisp_Project_Ideas]] (where to apply it)

## How to use this note

1. **§1** when you need to find a library ("is there a thing for X?").
2. **§2–§4** for the dialect-specific stacks and docs.
3. **§5–§6** for learning material and people.

---

## 1. Awesome lists & catalogs

| Resource | What it is |
|----------|------------|
| [awesome-cl](https://github.com/CodyReichert/awesome-cl) ([awesome-cl.com](https://awesome-cl.com)) | **The** Common Lisp catalog — libraries, apps, utilities, kept current |
| [awesome-clojure](https://github.com/razum2um/awesome-clojure) | Curated Clojure libraries by category (web, db, data, dev tools) |
| [lispresources](https://rentry.org/lispresources) | Community mega-list: dialects, books, schools, projects across all Lisps |
| [Clojure — Libraries](https://clojure.org/libraries) | Official Clojure.org library index |
| [quickdocs.org](https://quickdocs.org/) | Per-library Quicklisp docs (Clojure API-docs equivalent for CL) |
| [Clojars](https://clojars.org/) | Clojure package registry — find versions/coordinates here |
| [lisp-lang.org](https://lisp-lang.org/) | Common Lisp portal: news, learning, success stories |

## 2. The Clojure data-science stack (scicloj)

The scicloj community maintains the "pandas/NumPy/Seaborn" layer for Clojure.

| Resource | What it is |
|----------|------------|
| [tablecloth](https://scicloj.github.io/tablecloth/) | Data frames — the API used throughout [[Lisp_Data_Science_Snippets]] |
| [tech.ml.dataset](https://techascent.github.io/tech.ml.dataset/) | Columnar engine under tablecloth; walkthroughs at `000-getting-started.html` |
| [clojure-data-scrapbook](https://scicloj.github.io/clojure-data-scrapbook/) | **scicloj's living cookbook**: wrangling, viz, ML, notebooks — best single tutorial source |
| [hanami](https://github.com/scicloj/hanami) | Declarative Vega-Lite plots as Clojure data (used with Oz) |
| [oz](https://github.com/metasoarous/oz) | Vega-Lite/Vega rendering + notebook workflow (`oz/view!`) |
| [clay](https://github.com/scicloj/clay) | Literate-programming reports from Clojure → HTML/Markdown (fits this vault) |
| [fastmath](https://github.com/clojure2d/fastmath) | Numerics, stats, distributions, random — the scipy-ish layer |
| [scicloj.ml](https://github.com/scicloj/scicloj.ml) | Traditional ML pipelines (classification/regression/clustering) |
| [kindly](https://github.com/scicloj/kindly) | The visualization-annotation convention under Clay/Hanami |
| [scicloj community](https://scicloj.github.io/docs/community/clj-data-scrapbook/) | Docs portal → **Zulip chat** (the main scicloj room) |

Reading order: [tablecloth docs](https://scicloj.github.io/tablecloth/) → [clojure-data-scrapbook](https://scicloj.github.io/clojure-data-scrapbook/) chapters as needed → [Hanami/Oz docs](https://github.com/metasoarous/oz) for plots.

## 3. Common Lisp resources

| Resource | What it is |
|----------|------------|
| [Lisp-Stat](https://lisp-stat.dev/) | CL data frames + statistics — the Lisp-Stat API in [[Lisp_Data_Science_Snippets]] §8 |
| [Practical Common Lisp](https://gigamonkeys.com/book/) | The free classic book — strings, paths, libraries, OO (read first) |
| [Common Lisp Cookbook](https://lispcookbook.github.io/cl-cookbook/) | Task-shaped docs: CSV, dates, strings, testing, project layout |
| [Quicklisp](https://www.quicklisp.org/beta/) | Package manager docs + [bundle explorer](https://quickdocs.org/) |
| [ANSI HyperSpec](https://clhs.se-common-lisp.org/) | The standard — cold but authoritative |
| [CLHS quick reference](https://www.amath.de/CCL/HS/HS_x_intro.html) / [quickref](https://quickref.common-lisp.net/) | Printable/lookup cheat sheets |
| [SBCL manual](https://www.sbcl.org/manual/) | Implementation-specific: threads, streams, performance |
| [lisp-lang.org getting started](https://lisp-lang.org/learn/getting-started) | Install + Quicklisp path (what [[Lisp_Installation]] §4 follows) |
| [Awesome CL — data section](https://github.com/CodyReichert/awesome-cl#data-science) | `cl-csv`, `cl-ana`, plotting, DBs |

## 4. Racket & Scheme

| Resource | What it is |
|----------|------------|
| [Racket docs](https://docs.racket-lang.org/) | Full language + library reference (searchable, excellent) |
| [data-frame package](https://docs.racket-lang.org/data-frame/index.html) | `df-read-csv`, `df-select`, stats — the §2/§8 snippets |
| [How to Design Programs](https://htdp.org/) | The free Scheme-first programming book |
| [Racket reference — plot](https://docs.racket-lang.org/plot/index.html) | Built-in plotting library |
| [Guile manual](https://www.gnu.org/software/guile/manual/) | GNU Scheme for scripting/embedding |

## 5. Learning material

### Clojure
- [Clojure.org guides](https://clojure.org/guides) — official: getting started, tools.deps, spec
- [Clojure for the Brave and True](https://www.braveclojure.com/) — free, friendly book (Week 3 of [[Clojure_Tutorial]])
- [ClojureDocs](https://clojuredocs.org) — community examples for every core fn
- [cljdoc](https://cljdoc.org) — builds API docs for any library on Clojars
- [47 Degrees — Clojure](https://www.47deg.com/blog/) / [Springer Clojure in Action](https://www.manning.com/) — second-tier picks
- [Clojure style guide](https://guide.clojure.style/) — formatting norms
- [Getting Started with Clojure (MOOC, mooc.fi)](https://www.mooc.fi/en/courses/clojure-programming/) — free video course

### Common Lisp
- [Practical Common Lisp](https://gigamonkeys.com/book/) — §3 above
- [Land of Lisp](https://landoflisp.com/) / [On Lisp (Graham)](http://www.paulgraham.com/onlisp.html) — deeper macro material
- [Learn Lisp the Hard Way](https://learnlispthehardway.org/) — exercise-driven
- [SBCL tutorial (CMU)](https://www.cs.cmu.edu/~dst/LispBook/) — *Lisp Programming* course notes/book

### Dialect-spanning
- [lispresources](https://rentry.org/lispresources) — books/schools across dialects
- [Little Schemer](https://mitpress.mit.edu/9780262510875/the-little-schemer/) — recursion rite of passage

## 6. Docs, communities & news

| Kind | Clojure | Common Lisp |
|------|---------|-------------|
| API docs | [ClojureDocs](https://clojuredocs.org), [cljdoc](https://cljdoc.org) | [quickdocs](https://quickdocs.org), HyperSpec |
| Chat | **Clojurians Slack** (clojurians.net), [r/Clojure](https://reddit.com/r/Clojure) | **#lisp / #sbcl on Libera.Chat**, r/lisp |
| Mailing list | [clojure](https://groups.google.com/g/clojure) (dev) | [comp.lang.lisp](https://groups.google.com/g/comp.lang.lisp) (retro but alive) |
| News | [Planet Clojure](https://planet.clojure.in/) (blog aggregator) | [Planet Lisp](https://planet.lisp.org/) |
| Q&A | Stack Overflow `clojure` tag | Stack Overflow `common-lisp` tag |
| Weekly | — | [Lisp News? — check lisp-lang.org/news](https://lisp-lang.org/) |

scicloj-specific: the **Clojure Zulip** has a `#data-science`/scicloj stream — the place to ask tablecloth/Hanami questions and follow the notebook ecosystem.

## 7. Tooling docs

| Tool | Docs |
|------|------|
| clojure-lsp | [clojure-lsp.github.io](https://clojure-lsp.github.io/) (features, install, IDE pages) |
| clj-kondo | [clj-kondo](https://github.com/clj-kondo/clj-kondo) — lint rules, config-as-code |
| Conjure | [Olical/conjure](https://github.com/Olical/conjure/wiki) — wiki has the mapping tables |
| SLIME/SLY | [SLIME manual](https://common-lisp.net/project/slime/) |
| CIDER | [docs.cider.mx](https://docs.cider.mx/) |
| nvlime | [monakoos/nvlime](https://github.com/monakoos/nvlime) |
| vim-sexp | [guns/vim-sexp](https://github.com/guns/vim-sexp) + [tpope mappings](https://github.com/tpope/vim-sexp-mappings-for-regular-people) |
| vim-iced → Elin | vim-iced **archived Feb 2025** — successor: [liquidz/elin](https://github.com/liquidz/elin) (docs: [liquidz.github.io/elin](https://liquidz.github.io/elin/)) — still alpha |

## Status

- [x] Core links verified 2026-09-30 (awesome-cl, awesome-clojure, tablecloth, tech.ml.dataset, data-scrapbook, lisp-stat, PCL, cl-cookbook, quickdocs, clojuredocs, cljdoc, clojure-lsp, conjure, nvlime, vim-sexp, Elin)
- [ ] Add personal bookmarks here as you use them
