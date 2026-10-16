---
type: reference
status: active
topic: "The book and article publishing hub — the five-stage pipeline, toolchain selection, a dispatch index to the per-engine satellites, build automation, a worked end-to-end pipeline, and release checklists."
created: 2026-10-16
updated: 2026-10-16
aliases:
  - Book Publishing
  - Self-Publishing
  - Typesetting and Publishing
tags:
  - typography
  - publishing
  - markdown
  - typst
  - quarto
  - latex
  - pandoc
  - self-publishing
---

# Publishing — Writing, Compiling, and Distributing

> Goal: pick a toolchain, write a book or article in it, build it into every format you need, and ship it — without ever editing a generated file by hand.
> This is the **hub** for the Typography folder. It holds the model, the selection logic, and the release gate. Everything engine-specific lives in a satellite.
> Syntax notes: [[01_markdown|Markdown]] · [[02_djot|Djot]] · [[03_typst|Typst]] · [[04_quarto|Quarto]] · [[05_asciidoc|AsciiDoc]] · [[06_latex|LaTeX]] · [[07_carve|Carve]] · [[08_pandoc|Pandoc]]

## The satellites

| Note | Covers |
|------|--------|
| [[Publishing_Markdown_Engines\|Markdown Book Engines]] | mdBook, Sphinx+MyST, MkDocs Material, HonKit, Quartz, Jupyter Book, Manubot, Bookdown |
| [[Publishing_Pandoc\|Pandoc]] | The conversion hub: PDF engines, PDF/A·X·UA, EPUB splitting, citations, Lua filters |
| [[Publishing_Typst\|Typst]] | Book templates, project anatomy, POD trim sizes, when Typst is wrong |
| [[Publishing_Quarto\|Quarto]] | Book projects, `_quarto.yml`, HTML vs single-file renders, publishing |
| [[Publishing_LaTeX\|LaTeX]] | Document classes, multi-pass builds, index/glossary apparatus, tex4ebook, JATS |
| [[Publishing_AsciiDoc\|AsciiDoc]] | Asciidoctor PDF, YAML theme model, Antora Assembler books |
| [[Publishing_Djot_and_Carve\|Djot and Carve]] | The two post-Markdown languages and how each reaches real output |
| [[Publishing_Print_and_Distribution\|Print and Distribution]] | Output formats, POD geometry and preflight, ISBN rules, sales channels |

## How to use this hub

1. Read **§1–§3** once. They are the model everything else hangs off, and they are short on purpose.
2. Open the satellite for your language from the table above.
3. Copy **§5** (automation) and **§7** (checklists) into your book project on day one — retrofitting a build system onto 20 finished chapters is miserable.
4. Do not open [[Publishing_Print_and_Distribution|Print & Distribution]] until the manuscript is real. Distribution decisions made before the book exists are usually wrong, and the ISBN choices there are hard to reverse.

> Mindset: **the manuscript is the source, the toolchain is the compiler, the build artifacts are disposable.** Every rule below is a consequence of that one idea. The moment you hand-edit a PDF, you have created a second, divergent manuscript that no amount of tooling will reconcile.

---

## 1. The pipeline: five stages

Every publishing stack — Markdown, Typst, LaTeX, Djot, Carve — is these five stages wearing different clothes.

| # | Stage | What happens | What goes wrong here | Details |
|---|-------|--------------|---------------------|--------|
| 1 | **Author** | Write prose in an editor you like | Picking the toolchain per-chapter instead of per-book | This note |
| 2 | **Compose** | Structure: chapters as files, one TOC, shared metadata, assets | Manual chapter ordering; duplicated title/author strings in 30 files | [[Publishing_Print_and_Distribution#3.1 One metadata file\|metadata]] |
| 3 | **Build** | Engine compiles source → PDF/HTML/EPUB/DOCX | Non-deterministic builds; "works on my machine" fonts | §5 |
| 4 | **Preflight** | Validate against the *target's* rules, not "does it open" | Shipping a PDF that fails a print shop's bleed check | [[Publishing_Print_and_Distribution#2.3 Preflight\|commands]] · §7 |
| 5 | **Distribute** | Upload, version, announce, update | Distributing from a directory with six stale builds in it | [[Publishing_Print_and_Distribution#4. Distribution channels\|channels]] |

### 1.1 The one invariant

**Never edit a built artifact. Rebuild instead.**

The moment you fix a typo in the generated PDF rather than the `.md`/`.typ`/`.tex` source, the build is no longer reproducible and you have lost the ability to change anything else safely. This is the single most common way a self-publishing toolchain dies — not a bad tool, just one hand-edit in month seven.

Corollary: the build output directory should be safe to delete at any moment. `rm -rf dist` (or `Remove-Item -Recurse dist`) must be a boring, non-scary operation.

### 1.2 The second invariant

**One source of truth for metadata.** Title, author, date, ISBN, language, and rights live in exactly one file — usually `metadata.yaml`, `_quarto.yml`, or the top of your master document. Every other file reads from it. Hardcoding your name in twelve chapter files is how a second edition becomes a two-day archaeological dig.

---

## 2. Choose the toolchain before you write Chapter 1

### 2.1 Decision matrix

| Source language | Engine(s) | Outputs | Strongest at | Cost |
|-----------------|-----------|---------|--------------|------|
| **Markdown** | [mdBook](https://rust-lang.github.io/mdBook/) | HTML, PDF (via LaTeX) | Programming books, tutorials | Tiny binary, Rust-flavored conventions |
| **Markdown** | [Sphinx + MyST + `sphinx-book-theme`](https://sphinx-book-theme.readthedocs.io/) | HTML, PDF, LaTeX, EPUB-ish | Scientific/technical books with cross-refs + index | Python + a TeX distro for PDF |
| **Markdown** | [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) | HTML (print via headless browser) | Docs-as-website, beautiful out of the box | Python, big plugin ecosystem |
| **Markdown** | [HonKit](https://github.com/HonKit/HonKit) | HTML, PDF, EPUB, MOBI | Legacy GitBook migration; one-stop ebook | Node |
| **Markdown** | [Quarto](https://quarto.org/docs/books/) | HTML, PDF, Typst, DOCX, EPUB | Books with live code, figures, cross-refs | Bundles Pandoc; engines optional |
| **Markdown** | [Manubot](https://manubot.org/) | HTML, PDF, DOCX | Scholarly manuscripts, cite-by-DOI, CI-published | Python + git + CI |
| **R Markdown** | [Bookdown](https://bookdown.org/) | HTML, PDF, EPUB, Word | R-centric books with computed figures | R toolchain |
| **Any** | [Pandoc](https://pandoc.org/MANUAL.html) | 40+ formats incl. LaTeX/Typst/EPUB/PDF | Being the glue between everything else | One binary, huge surface |
| **Typst** | [`typst compile`](https://typst.app/docs/reference/) | PDF, SVG, PNG, HTML (experimental) | Beautiful PDFs in seconds; POD trim sizes | Rust binary; template ecosystem maturing |
| **LaTeX** | `latexmk` / LuaLaTeX | PDF, DVI, EPUB (tex4ebook), JATS (LaTeXML) | Math-heavy, journal-mandated, print | The steepest setup; unmatched control |
| **AsciiDoc** | [Asciidoctor PDF](https://docs.asciidoctor.org/pdf-converter/latest/) | PDF, HTML, EPUB | Structured technical manuals, corporate publishing | Ruby; YAML theme files |
| **AsciiDoc** | [Antora + Assembler](https://docs.antora.org/assembler/latest/) | Site, then PDF/EPUB books | Versioned documentation that also prints | Node + Ruby |
| **Djot** | Pandoc (`-f djot`) | Everything Pandoc does | Technically clean specs; spec-first writing | Very young ecosystem |
| **Carve** | `carve-pdf`, [`pandoc-carve`](https://github.com/markup-carve/pandoc-carve) | PDF, Typst, LaTeX, DOCX, EPUB, HTML | Web-native authoring with real print output | New — see [[Publishing_Djot_and_Carve\|Djot & Carve]] |

### 2.2 Three rules for choosing

1. **Pick the most demanding output first, then work backwards.** If the book must exist as a print PDF *and* an EPUB *and* a web page, the print PDF constrains your margins, your figure resolution, and your font embedding. Choose a toolchain that can do the hard one; the easy ones come along for free. Do not start from HTML and discover at month six that Typst needed a different float placement.
2. **The markup language sets ergonomics; the engine sets capability.** Typst the *language* cannot produce an EPUB by itself. Pandoc the *engine* can produce almost anything from almost anything. Ask "what do I have to read and write daily?" (markup) separately from "what must come out the other end?" (engine). They are different questions and often have different answers — see §6 below for the canonical hybrid.
3. **Pick for the maintenance burden, not the demo.** Every tool above can produce a beautiful book. The differentiator is what happens when you need to add a cross-reference in chapter 40, re-render, and diff two PDFs. Mature ecosystems (LaTeX, Pandoc, Quarto) win here; brand-new ones ([[Publishing_Djot_and_Carve|Djot and Carve]]) are worth watching and prototyping, not worth a 400-page commitment.

---

## 3. Toolchain index

If you know what you want, go straight to the note:

| I want… | Read |
|---------|------|
| The lightest possible book from Markdown | [[Publishing_Markdown_Engines#1. mdBook\|mdBook]] |
| A back-of-book index and journal-grade cross-refs | [[Publishing_Markdown_Engines#2. Sphinx + MyST + sphinx-book-theme\|Sphinx + MyST]] |
| The best-looking web book with the least work | [[Publishing_Markdown_Engines#3. MkDocs Material\|MkDocs Material]] |
| PDF **and** EPUB from one Markdown tool | [[Publishing_Markdown_Engines#4. HonKit\|HonKit]] |
| A book published from this Obsidian vault | [[Publishing_Markdown_Engines#5. Quartz and Jupyter Book\|Quartz]] |
| Figures that regenerate from live code | [[Publishing_Quarto\|Quarto]] or [[Publishing_Markdown_Engines#5. Quartz and Jupyter Book\|Jupyter Book]] |
| Cite by DOI, deploy from CI | [[Publishing_Markdown_Engines#6. Manubot\|Manubot]] |
| Figures computed in R | [[Publishing_Markdown_Engines#7. Bookdown (R)\|Bookdown]] |
| One source → every format, with citations | [[Publishing_Pandoc\|Pandoc]] |
| A beautiful PDF in seconds | [[Publishing_Typst\|Typst]] |
| Novels and narrative nonfiction with retail metadata | [[Publishing_Typst#2. Template ecosystem (Typst Universe)\|Typst + tieffiction]] |
| Math, theorem environments, a generated index | [[Publishing_LaTeX\|LaTeX]] |
| A journal that demands LaTeX source | [[Publishing_LaTeX\|LaTeX]] |
| Accessible math that survives as structure (JATS) | [[Publishing_LaTeX#6. JATS and accessible output\|LaTeX + LaTeXML]] |
| Structured technical manuals, corporate publishing | [[Publishing_AsciiDoc\|AsciiDoc]] |
| Versioned documentation that also prints | [[Publishing_AsciiDoc#2. Antora + Assembler — versioned docs that also print\|Antora]] |
| Predictable rendering for specs and notes | [[Publishing_Djot_and_Carve#1. Djot\|Djot]] |
| Web-native authoring with honest conversion diagnostics | [[Publishing_Djot_and_Carve#2. Carve\|Carve]] |
| Which file formats to build at all | [[Publishing_Print_and_Distribution#1. Output formats: what to actually build\|Output formats]] |
| Print-ready files, ISBNs, and where to sell | [[Publishing_Print_and_Distribution\|Print and Distribution]] |

---

## 4. Articles and shorter forms

A book is an article with a TOC and a spine. The pipeline is identical; only the composition stage changes.

### 4.1 Journal articles and preprints

| Target | Route | Notes |
|--------|-------|-------|
| arXiv preprint | LaTeX → PDF; or LaTeX → LaTeXML → JATS | Include source in the submission — arXiv runs TeX |
| Journal with LaTeX requirement | LaTeX + the publisher's `elsarticle`/`IEEEtran`/`acmart` class | Start from the template; do not fight it |
| Journal wanting DOCX | Markdown → Pandoc → `docx`, or Quarto `format: docx` | Use `reference-doc` to control styles |
| Open-access journal (Biorxiv, PsyArXiv…) | Same as arXiv | |
| Scholarly manuscript with reproducible build | [[Publishing_Quarto\|Quarto]] or [[Publishing_Markdown_Engines#6. Manubot\|Manubot]] | Figures regenerate; CI deploys a DOI-able version |

### 4.2 Blog posts and web-native articles

| Engine | Why |
|--------|-----|
| Quarto blog (`type: blog` in `_quarto.yml`) | One click to HTML + PDF of the same post; renders code |
| Hugo / Zola | Fast, template-driven, best for a publication you control |
| Jekyll + Obsidian | Publish a subfolder of this vault as a site |
| Quart | Quarto's Python API — programmatic publishing, scheduled posts |

Articles are where a **single source → many formats** loop pays off most: write the Markdown, get the blog post, the PDF for email subscribers, the summary for social, and the slide deck, all from one file.

### 4.3 Reports, newsletters, and hand-outs

- **Quarto parameterized reports** (`params:` + `-P`) — the pattern is in [[quarto_notes|quarto_notes]]; one template renders per audience per period.
- **`tufte-handout`** for leave-behinds, or Typst with a single-page template — faster than either for a two-page brief.
- **For recurring documents**, keep the report as *code in git* even when the output is a PDF someone emails. Version history is free; "which version did I send in March?" is not.

---

## 5. Build automation

Retrofitting automation is the expensive path. Put a `Makefile` (or `justfile`) in the book directory before chapter one.

### 5.1 A working Makefile

```makefile
# Makefile — Markdown -> Typst -> PDF + EPUB, via Pandoc
PANDOC  := pandoc
TYPST   := typst
META    := metadata.yaml
SRC     := $(sort $(wildcard contents/*.md))
DIST    := dist
TITLE   := my-book

.PHONY: all pdf epub watch clean

all: pdf epub

$(DIST):
	mkdir -p $(DIST)

# One merged Typst source, built from the numbered chapter files
$(DIST)/$(TITLE).typ: $(SRC) $(META) | $(DIST)
	$(PANDOC) $(SRC) \
	  --metadata-file=$(META) \
	  --citeproc --bibliography=bibliography.bib \
	  --number-sections --toc \
	  -o $@

pdf: $(DIST)/$(TITLE).pdf
$(DIST)/$(TITLE).pdf: $(DIST)/$(TITLE).typ
	$(TYPST) compile $<

epub: $(DIST)/$(TITLE).epub
$(DIST)/$(TITLE).epub: $(SRC) $(META) | $(DIST)
	$(PANDOC) $(SRC) --metadata-file=$(META) \
	  --toc --split-level=2 --epub-cover-image=cover.jpg -o $@

watch:
	fswatch -o contents metadata.yaml | while read -r _; do $(MAKE) all; done

clean:
	rm -rf $(DIST)
```

`make watch` is the single highest-value line in that file. Typst compiles in under a second, so a live feedback loop changes how you *write*, not just how you ship.

### 5.2 Watch loops per toolchain

| Tool | Watch command |
|------|---------------|
| Typst | `typst watch main.typ` |
| mdBook | `mdbook serve` |
| Sphinx | `sphinx-autobuild docs docs/_build` |
| MkDocs | `mkdocs serve` |
| Quarto | `quarto preview` |
| Jupyter Book | `jupyter-book watch .` |
| HonKit | `honkit serve` |
| Raw LaTeX | `latexmk -pdf -pvc main.tex` |
| Pandoc pipeline | `fswatch` + `make`, as above |

### 5.3 CI

Publishing from CI is what makes the build *auditable*: it proves the book can be rebuilt from source by someone who has never seen your machine.

```yaml
# .github/workflows/book.yml
name: build-book
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm install -g @pandoc/markdown-pandoc  # or apt-get install pandoc
      - run: npm install -g @myriaddreamin/typst-cli
      - run: make all
      - uses: actions/upload-artifact@v4
        with: { name: book, path: dist/ }
```

- Pin tool versions in the workflow (`pandoc --version` must match locally, or the "same build" claim is false).
- Cache the TeX/typst/font downloads or every build is 4 minutes of downloads.
- The `dist/` upload gives you a downloadable PDF on every commit — a free artifact trail for free.

For Quarto projects use the maintained workflow in [[Publishing_Quarto#3.1 CI|Quarto §3.1]] instead of hand-rolling this.

### 5.4 Windows notes

The commands above are POSIX. On Windows: Git Bash or WSL run them as-is; PowerShell needs `New-Item -ItemType Directory dist` instead of `mkdir -p` and `Remove-Item -Recurse -Force dist` instead of `rm -rf`. MiKTeX's on-the-fly package install and TeX Live's `tlmgr` behave differently enough that a **build that works in one shell may not work in the other** — pick one and standardize.

---

## 6. A complete worked pipeline

**Markdown → Pandoc → Typst → PDF, plus a parallel EPUB.** This is the reference architecture: Markdown for speed of writing, Pandoc as the format hub, Typst for the quality of the PDF, and one `make` for everything.

```
my-book/
├── Makefile
├── metadata.yaml
├── bibliography.bib
├── contents/
│   ├── 001-intro.md
│   ├── 002-background.md
│   └── 003-methods.md
├── templates/
│   └── book.typ            # Pandoc template: page setup, cover, running heads
├── img/
│   └── cover.jpg
└── dist/                   # generated — safe to delete at any time
    ├── my-book.typ
    ├── my-book.pdf
    └── my-book.epub
```

The Pandoc template is where Typst's page design lives, so every chapter stays pure prose:

```typ
// templates/book.typ — consumed by pandoc as a template ($body$ = merged content)
#import "@preview/orange-book:0.7.1": book

#set page(
  paper: "a4",
  margin: (top: 2.5cm, bottom: 2.5cm, inside: 2.5cm, outside: 2cm),
  header: context {
    if counter(page).get().first() > 1 [#h(0.5fr) #h(1fr) *Book Title*]
  },
)

#show: book.with(
  title: "$title$",
  subtitle: "$subtitle$",
  author: "$for(author)$$author$$sep$, $endfor$",
  date: "$date$",
  lang: "$lang$",
  copyright: [Copyright © $date$ $author$. $rights$],
  cover: image("img/cover.jpg"),
)

$body$

// citations resolved by pandoc --citeproc from bibliography.bib
#bibliography("bibliography.bib", style: "apa", title: "References")
```

```bash
make all        # dist/my-book.pdf + dist/my-book.epub
make watch      # rebuild on every save
```

Why this shape and not a Typst-native book: chapters stay in Markdown (fast to write, diffable, greppable, convertible later), while the page design gets Typst's full control. The cost is one extra translation layer — which is exactly what Pandoc's template system is for.

---

## 7. Preflight checklists

### 7.1 Before any release

- [ ] Clean build from a fresh clone succeeds (`git clean -xdf && make all`)
- [ ] TOC, index, cross-references, and page numbers are all resolved — no `??`, no "Error! Reference source not found"
- [ ] Figures are crisp at 100% zoom and legible in grayscale
- [ ] Every link in the HTML build resolves; every internal reference in the PDF does too
- [ ] The metadata file is the only place title/author/ISBN appear
- [ ] Copyright page and license are present and correct
- [ ] Version number and date updated
- [ ] `dist/` is reproducible: build twice, compare (timestamps in PDF metadata aside)

### 7.2 Print edition

- [ ] Trim size matches the POD listing
- [ ] Interior PDF has fonts embedded (`pdffonts`) and no crop marks
- [ ] Bleed correct, or explicitly not needed
- [ ] Spine is blank where the platform requires it
- [ ] Cover wrap generated from the **final** page count, correct platform template
- [ ] Barcode zone correct, or left clear for the printer
- [ ] PDF/X validated — commands in [[Publishing_Print_and_Distribution#2.3 Preflight\|Print §2.3]]
- [ ] Proof ordered and read

### 7.3 Ebook

- [ ] EPUBCheck passes with zero errors *and* zero warnings
- [ ] Opens on a real device (Kindle Previewer for Amazon; Calibre for a sanity read)
- [ ] Math renders (EPUB 3 / MathML) or is acceptable as images
- [ ] Cover is front-only, RGB, high resolution
- [ ] No page numbers baked in
- [ ] Metadata (title, author, description, language) reads correctly in the store listing

---

## 8. Failure modes and fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| Generated file edited by hand, changes keep reverting | Broke §1.1 | Find the source file, edit that, rebuild. Delete stale copies in `dist/` |
| `??` or "Error! Reference source not found" | Single-pass LaTeX | Use `latexmk`, or run 3–4 passes |
| Cross-references wrong in Pandoc output | Filters or divs breaking the AST | Round-trip to the AST and inspect: `pandoc in.md -t native` |
| PDF looks different from the preview | Different PDF engine, or missing font | Pin the engine and install the exact fonts in CI |
| Fonts missing in the PDF | Not embedded | `pdffonts`; use `fontspec` (LuaLaTeX/Typst) or embed manually |
| Chapter order is wrong | Filesystem order is not alphabetical in your shell | Numeric filename prefixes + `$(sort ...)` |
| Build is slow enough to discourage writing | Rebuilding everything every save | Use the tool's watch server; only rebuild on save |
| EPUB rejected by a retailer | Warnings in EPUBCheck, or missing metadata | Run EPUBCheck locally *before* uploading |
| Cover wrap wrong after final edits | Page count changed | Regenerate the wrap at release from final page count |
| Math broken in EPUB 2 | No MathML support | Use EPUB 3, or accept image math knowingly |
| Citations render as `[@key]` | Missing `--citeproc` or `--bibliography` | Add both; verify the CSL style loads |
| Upload rejected by POD | Bleed, margin, or font-embedding violation | Read the platform's *current* file-requirements page, not a blog post |
| Two ISBNs for the same book | Took a platform's free ISBN, then added a second platform | Buy your own ISBN up front |
| Book "rebuilt" on another machine looks different | Unpinned tool versions | Pin pandoc/typst/TeX versions in CI and locally |

---

## 9. Recommended starting stacks

| If you are… | Start with | Why | Escape hatch when |
|-------------|-----------|-----|-------------------|
| Writing a **technical book** from a vault of notes | [[Publishing_Markdown_Engines#1. mdBook\|mdBook]] or [[Publishing_Markdown_Engines#3. MkDocs Material\|MkDocs Material]] | Fastest path from notes to a real website; the least ceremony | You need a PDF with real page geometry → [[Publishing_Quarto\|Quarto]] or Pandoc+Typst |
| Writing a **science/technical textbook** with figures and code | [[Publishing_Quarto\|Quarto]] | Executes code, strong cross-refs, PDF + Typst + EPUB + DOCX from one source | You need a back-of-book index → Sphinx or LaTeX |
| Writing a **math-heavy** book | [[Publishing_LaTeX\|LaTeX]] + `memoir` | Unmatched math, index, glossary, and journal-acceptable output | The setup fights you → Typst, accepting feature gaps |
| Writing a **novel or narrative nonfiction** | [[Publishing_Typst\|Typst]] + `tieffiction`, or [[Publishing_LaTeX\|LaTeX]] + `memoir` | Templates handle page furniture, scene breaks, dedication, ISBN block | You need EPUB → tex4ebook (LaTeX) or Pandoc (Typst) |
| Writing a **report that repeats weekly** | [[quarto_notes\|Quarto parameterized report]] | One template × audience × period; never hand-edit output | You need PDF/A → add `-V pdfstandard` |
| Writing a **spec or reference doc** | [[Publishing_Djot_and_Carve#1. Djot\|Djot]] through Pandoc, or [[Publishing_Djot_and_Carve#2. Carve\|Carve]] | Predictable rendering, real structure, no surprises | You need print → add the Typst or LaTeX stage |
| Publishing **for POD retail** | [[Publishing_Typst\|Typst]] or [[Publishing_LaTeX\|LaTeX]] at the target trim size, + a design tool for the wrap | The interior is the hard part; the wrap is arithmetic | Nothing — but validate before every upload |
| Already on **Obsidian** | [[Publishing_Markdown_Engines#5. Quartz and Jupyter Book\|Quartz]] or a direct Obsidian→site pipeline | Zero-migration: publish a folder | |

---

## 10. Resources

**Per-toolchain docs** live at the bottom of each satellite. The ones worth bookmarking generally:

- [Pandoc User's Guide](https://pandoc.org/MANUAL.html) — the reference behind half of this hub
- [Typst Universe](https://typst.app/universe/) — book templates
- [Quarto: Creating a Book](https://quarto.org/docs/books/)
- [sphinx-book-theme docs](https://sphinx-book-theme.readthedocs.io/)
- [Manubot](https://manubot.org/) and the [Rootstock template](https://github.com/manubot/rootstock)

**Production and distribution** are collected in [[Publishing_Print_and_Distribution|Print and Distribution]]: [EPUBCheck](https://www.w3.org/publishing/epubcheck/), [Kindle Previewer](https://kdp.amazon.com/en_US/help), [Ghostscript PDF/X](https://www.ghostscript.com/doc/current/UsePDFX.html), [Calibre](https://calibre-ebook.com/), and the [ISBN agency directory](https://www.isbn-international.org/agencies).

**Pattern reference**

- [Write the Docs — guides on documentation tooling](https://writethedocs.org/guide/)
- [LaTeX Wikibook](https://en.wikibooks.org/wiki/LaTeX) — the free tutorial linked from [[06_latex|06_latex]]
- [TeX StackExchange](https://tex.stackexchange.com/) — the best Q&A for LaTeX/Typst-class problems
- [Dante's Inferno](https://danteinferno.mit.edu/) — what LaTeX does to a novel

---

*Last updated: 2026-10-16. Tool versions and POD program terms drift — verify against each project's current documentation before committing.*
