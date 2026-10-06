---
type: reference
topic: Carve to Typst mapping — element-by-element emission table, escaping rules, labels and figure/table strategies for the AST emitter
date: 2026-10-06
status: active
tags:
  - carve
  - typst
  - emitter
  - parser
  - challenge
  - reference
---

# Carve → Typst Mapping

> Goal: the emitter's contract — for every AST node, the exact Typst source to produce, plus the escaping rules that keep generated code compilable. Every Typst diagnostic on *your* generated file is a bug **here**, not in the engine ([[Rust_Tutorial]] §8 layer 3).
> Related: [[Carve_Syntax_Reference]] (input side) · [[Typst_PDF_Engine]] (compiling the output) · [[Typst_Engine_Cheatsheet]] §8 (the call list) · [[03_typst]] (language)

## 1. Emitter shape

```
&Document → String (Typst source)
```

- Pure function of the AST: no I/O, no `unwrap()` — returns `Result<String, EmitError>` for things like unbalanced spans.
- Text is pushed through the **escaper** (§5); everything else is emitted from templates.
- Preamble assembled once: `#set`/`#show` block (§3), then body, then optional `#outline()` if TOC requested.
- Strategy choice (generate strings vs build `Content` tree): **§4** — default **A**.

## 2. Preamble & document metadata

```typst
#set document(title: "My Document", author: "…")   // from frontmatter; call FIRST (document() can't be in a loop)
#set page(paper: "a4", margin: (x: 2cm, y: 2.4cm), numbering: "1")
#set text(font: "Libertinus Serif", size: 11pt, lang: "en")
#set par(justify: true, leading: 0.65em, first-line-indent: 0em)
#set heading(numbering: "1.1")
#show heading.where(level: 1): set text(size: 1.4em)     // tune per level
#show raw.where(block: true): set block(fill: luma(240), inset: 8pt, radius: 4pt)
#show link: set text(fill: blue)                          // or underline everywhere
#outline(title: "Contents", depth: 3, indent: auto)       // only if requested
```

Frontmatter mapping: `title:` → `document(title:)`; `author:` → `document(author:)` (string or array); `lang`/known keys → `#set text(lang:)`; everything else ignored (it's held raw, [[Carve_Syntax_Reference]] §6).

## 3. Block mapping table

| Carve | Typst emit | Notes |
|-------|-----------|-------|
| Frontmatter | preamble (§2) | YAML → typed values; escape strings |
| `# Heading` | `= Heading` | `=` × level; avoid `+` collision with escape-by-backslash approach only if you also escape `=` — see §5 |
| paragraph | text + blank line | one blank line between blocks |
| `---` break | `#line(length: 100%)` or `#hr()` (typst 0.15) | check `hr` availability; `#line` is the portable fallback |
| `- item` / `1. item` / `. item` | `- item` / `+ item` (numbered) | Carve `. auto-number` ≈ Typst `+` (auto count) — verify visual parity in M4 |
| `- [ ] / [x]` | `#box(square(size: .7em, stroke: .6pt)) item` or `#task` package | v1: box checkbox; no packages |
| task/quote continuation `+` | join child into the same list/quote block | structural, not emitted |
| `> quote` | `#quote(block: true)[ … ]` | attribution `^` → caption via §4 figures |
| fenced quote `::: >` | same `#quote` | parse as Quote node either way |
| ```` ```lang ```` | ```` ```lang … ``` ```` raw block | fence with **4+ backticks** if payload contains ``` (§5) |
| `::: note` etc. | `#block(fill: …, inset: 8pt)[ #strong[Note] \ … ]` | map known types to colors; unknown → generic block w/ title |
| `::: |` preserved | ```` ``` ```` raw block (keeps per-line layout) | or `#raw(block: true, …)` |
| `::: \` hard-break | join lines with `\` (Typst linebreak) inside block | |
| `:: term` / `: def` | `#terms([term])[definition]` | typst `terms` list (check exact name in reference) |
| `{loose}` | already blocks — emit blank lines inside children | consumed, not emitted |
| diagram/chart ✦ | fallback: code block + note | v1 per [[Carve_Parser_Challenge]] §3 |
| comments | **dropped** | `{#…}` CriticMarkup comment → optional `//` comment? No — Typst has no line comments in markup; drop or render as `#box` aside (choose render for `{#`, drop `{%`) |

## 4. Inline mapping table

| Carve | Typst | Trap |
|-------|-------|------|
| `/i/` | `_…_` or `#emph[…]` | prefer `_`…`_`; **must be at word boundaries** in Typst too — intraword → `#emph[]` |
| `*b*` | `*…*` or `#strong[…]` | same boundary caveat → `#strong[]` safest |
| `/*both*/` | `#strong[#emph[…]]` | nest |
| `_u_` | `#underline[…]` | Typst `_` is subscript — **never** emit raw `_` for underline |
| `~s~` | `#strike[…]` | Typst `~` is subscript too — use function |
| `=hl=` | `#highlight[…]` | |
| `` `code` `` | `` `…` `` raw inline | payload with backtick → longer delimiter run |
| `` !`lit` `` | `` `…` `` raw **without** styling? | Carve literal = verbatim, no code style → emit raw with `#raw(text: …)` or backticks + `#show raw: set text(…)`; simplest: backticks (style decision, record it) |
| `{^x^}` | `#sup[…]` | **not** `^x^` — caret binds to following word like markup; function form is safe |
| `{,x,}` | `#sub[…]` | not `_x_` — same reason |
| `[t](url)` | `#link("url")[t]` | escape URL string (§5.3) |
| `[t][ref]` | resolve → `#link(…)` | definitions resolved in parse pass |
| `[Page][]` wiki | resolve to heading → `#link(<label>)[Page]` | label = slug of heading (§6) |
| `<url>` | `#link("url")[url]` | |
| `</#id>` | `#link(<id>)[…]` or `#ref(<id>)` | `#ref` prints numbering ("Figure 1"); link clones text — prefer `#ref` for figures/headings, `#link` otherwise |
| `![alt](src)` | `#figure(image("src"), caption: [alt]) <label>` | caption line (§7) becomes caption; alt = default caption if no `^` |
| `[^1]` / `^[note]` | `#footnote[…]` | ref form needs footnote definitions resolved first |
| `[span]{.cls}` | `#block[…]`/custom? | v1: emit content, drop class (HTML-only concept) — record in known differences |
| `@user` `#tag` | plain text (escaped) | or `#link` if URLs known — v1 plain |
| `\x` | literal `x` | parser strips backslash; emitter re-escapes via §5 |
| smart `--`… | already Unicode (– — … → ⇒ ©) | **resolve at parse time** — then emit as literal Unicode (escape only if §5 says so; these chars are safe) |
| hard break `\` EOL | `\` (Typst linebreak) at end of line | |
| no-break space | `#h(…)`? | simplest: literal U+00A0 (NBSP) in the text stream |
| `:youtube[ID]` ✦ | v1: literal `:youtube[ID]` escaped | record; extension handlers out of scope |
| inline math `$`…`$` | `$…$` passthrough | verbatim payload — don't escape `$` inside raw math spans; trust carve-lang parity later |
| `{+ins+}` etc. CriticMarkup | v1: literal text (render as-is) | optional: `#insert`/`#delete` don't exist in core Typst — drop or literal, record choice |
| `<br>`{=html} | drop (HTML-only) | known difference |

## 5. Escaping (the correctness core)

### 5.1 Markup text (between constructs)

Conservative **backslash-prefix** escaper — escape `\` first, then ASCII punctuation that Typst treats specially:

```
\  `  *  _  #  /  $  <  >  [  ]  (  )  {  }  ,  ;  :  .  !  ?  -  +  =  ~  ^  &  @  %  |
```

- Full punctuation set is safest; at minimum the markup-trigger chars: `` \ ` * _ # / $ < > [ ] ( ) { } ``.
- Emit `\x` (backslash + char) — Typst renders the literal char.
- **Do not escape** inside raw/code/math contexts (different rules, §4 table).
- Unicode letters/digits pass through untouched.

### 5.2 Where escaping applies

| Context | Escaper |
|---------|---------|
| Paragraph/heading/quote/list text | §5.1 markup escaper |
| Raw code (inline/block) | **no markup escape**; only choose backtick run long enough to wrap payload containing backticks (≥ payload run + 1) |
| Math `$…$` | none (verbatim) |
| Link URL / image path | string-literal escaping §5.3 |
| Labels | §6 slug rules (no escaping — constrained charset) |

### 5.3 String literals (`"…"` in Typst)

Escape inside double quotes: `\"` `\\` and newline → `\n`. Used for `#link("…")`, `image("…")`, `document(title: "…")`.

### 5.4 Why function forms beat symbol forms

Typst's `_`, `*`, `^`, `~` are **word-boundary-sensitive markup** — `a_b_c` and `a*b*` change meaning mid-word. Emitting `#underline[…]`, `#strong[…]`, `#sup[…]`, `#sub[…]` (function/content form) sidesteps boundary rules entirely. Rule of thumb: **symbols only where whitespace-delimited; functions everywhere else.**

## 6. Labels, ids, cross-refs

- Carve `{#id}` → Typst label `<id>` attached to the element: `= Heading <id>` / `#figure(…) <id>`.
- Typst label charset: letters, digits, `-`, `_` (verify at M3). Slugify wiki-link targets to match: lowercase, spaces → `-`.
- Caption `#` auto-number → `#figure(..., caption: [Figure #: …])`? Typst numbers figures itself — emit `caption: [ … ]` and let `#ref(<id>)` print "Figure 1" via `supplement`. Set `#figure(supplement: [Figure])`.
- Cross-ref resolution: `</#id>` → `#ref(<id>)` when target is figure/heading/table; `#link(<id>)[text]` otherwise. Unresolved id → emit escaped literal + diagnostic (don't fail the build).
- Wiki `[Page][]` → find heading with that text (parse-time index) → its label.

## 7. Figures & captions

```typst
#figure(
  image("sun.jpg", width: 80%),
  caption: [Figure #: A sunset],
) <fig-sun>
```

- Carve `^` caption line (folds multi-line, [[Carve_Syntax_Reference]] §5) → `caption: [ … ]` content (escaped §5.1).
- Code listing caption → `#figure(placement: none, caption: […])[ ```lang … ``` ]` — figures accept content.
- Table caption → `#figure(table(…), caption: […])` or `#figure(table(…)) ` — preferred: wrap the table.
- Composite `::: figure` panels → v1: each child its own `#figure`, group note in known differences (lettered panels = advanced).

## 8. Tables

```typst
#figure(
  table(
    columns: (auto, auto),          // from widths attr if present, else auto
    align: (left, right),           // from alignment markers (|=> etc.)
    stroke: 0.5pt,
    table.header([Item], [Qty]),    // |= cells
    [Apple], [12],
    [Pear], [3],
  ),
  caption: [Stock on hand],
) <tbl-stock>
```

| Carve feature | Typst |
|---------------|-------|
| `|=` header cells | `table.header(…)` (first-row → header; body-row `|=` → emit header row where it occurs, v1 approximation) |
| rowspan (`\| ^ \|`) | `table.cell(rowspan: 2)[…]` — compute from merge markers |
| colspan (`\| < \|`) | `table.cell(colspan: 2)[…]` |
| `+` row continuation | parse-time: merge into the cell model first; only emit `rowspan` spans |
| alignment `< ~> >` + vertical | `align:` per column; vertical (`^ ~ v`) → `table.cell(align: horizon/…) `— v1: horizontal only, vertical recorded as known difference if fiddly |
| `?` keep-column | resolved during parse to concrete horizontal |
| `widths=` / `aligns=` attrs | `columns: (30%, 70%)` / `align:` |
| `header-rows/footer-rows` | `table.header` / `table.footer` ranges |

**Emit order:** resolve all merges/alignments **in the AST** (parse or pre-emit pass) → emit straight cells + explicit `table.cell` — never re-derive in templates.

## 9. Two strategies

| | **A. Generate Typst source (recommended)** | **B. Build `Content` tree directly** |
|---|---|---|
| How | templates → `String` → `Source` → `compile` | `typst-library` element structs + `layout_frame` |
| API stability | only stable parser-level API (`Source`, `compile`) | couples to internal element structs — churns every minor |
| Debuggability | `--emit-typst` output compiles in `typst watch`; diffs reviewable | opaque trees; need custom debug printer |
| Testability | golden `.typ` snapshots | in-memory content snapshots |
| Cost | you own escaping (§5) | you own layout API internals |

**Decision: A**, revisit only for exotic constructs you can't spell in source (then hybrid: A + `eval_string` of small snippets).

## 10. Emitter test matrix

| Layer | Test |
|-------|------|
| Escaper | unit: every ASCII punct round-trips; property test: random text never breaks compile |
| Per-node emit | one golden `.typ` snippet per construct (insta) |
| Round-trip sanity | generated `.typ` compiles standalone under `typst compile` (CI step) |
| Visual | M6: render corpus → PDF, extract text, compare to Carve plain-text expectations |
| Diagnostic loop | broken AST fixture → emitter returns `EmitError`, never panics |

## Status

- [x] Mapping drafted against official cheatsheet 2026-10-06 (escape set, function-form rule, table merge model)
- [ ] Verify Typst details at M2/M4: `#hr()` availability, `terms` element, label charset, `supplement` behavior
- [ ] Fill known-differences rows (span classes, CriticMarkup, vertical alignment, composite panels)
