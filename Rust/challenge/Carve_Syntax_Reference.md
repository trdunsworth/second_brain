---
type: reference
topic: Carve syntax reference — parser-oriented spec 0.1 reference distilled from the official cheatsheet: inline spans, blocks, tables, captions, attributes and edge-case traps
date: 2026-10-06
status: active
tags:
  - carve
  - reference
  - syntax
  - parser
  - challenge
---

# Carve Syntax Reference

> Goal: the contract your parser implements — every construct, spelled the way a parser thinks about it. Distilled from the [official cheatsheet](https://github.com/markup-carve/carve/blob/main/docs/cheatsheet.md) (verified 2026-10-06). **When in doubt: the [formal grammar](https://markup-carve.github.io/carve/grammar) is the arbiter, not this note, not your tests.**
> Related: [[Carve_Parser_Challenge]] §3 (scope) · [[Carve_to_Typst_Mapping]] (emitting each construct) · [[Parser_Building_Tutorial]] §3–§5 (lexing this syntax) · [[07_carve]] (why Carve)

Legend: **✦** = opt-in extension tier (parse the syntax, handler may be missing). Core = always on.

## 1. Document skeleton

```carve
---
title: My Document
tags: [carve, markup]
---

# Heading
…body…
```

- Leading `---` block = **frontmatter, held raw** (YAML default; `---toml` / `---json` markers select other formats). Split the very first line before any block parsing.
- Then zero or more top-level blocks. Block markers start at **column 0** (§7).
- `carve` code blocks are valid documents (you can parse them as Carve).

## 2. Inline spans (the lexer's matrix)

| Write | Get | Node sketch |
|-------|-----|-------------|
| `/italic/` | italic | `Emphasis` |
| `*bold*` | bold | `Strong` |
| `/*both*/` | bold italic | `Strong+Emphasis` |
| `_underline_` | underline | `Underline` |
| `~strike~` | strike | `Strike` |
| `=highlight=` | highlight | `Highlight` |
| `` `code` `` | code | `Code` (no inner parsing) |
| `` !`literal` `` | verbatim prose, no code styling | `Literal` (`` ` `` mirrors `$`-math) |
| `{^super^}` | superscript | `Super` |
| `{,sub,}` | subscript | `Sub` |
| `[text](url)` | link | `Link{text, url}` |
| `[text][ref]` | reference link | resolve `[ref]: url` lines (anywhere) |
| `[Page Name][]` | wiki link | resolves to a heading |
| `<https://url>` | autolink | bare URLs stay **literal** (bare-URL autolink is ✦) |
| `</#section-id>` | cross-ref | link text cloned from target heading |
| `![alt](img.jpg)` | image | `Image{alt, src}` |
| `[^1]` | footnote ref | pairs with a definition |
| `^[inline note]` | inline footnote | self-contained |
| `[span]{.class}` | span w/ attrs | class/id/attributes |
| `:youtube[ID]` ✦ | extension | shape `:type[content]{attrs}` — **syntax is core**, handler opt-in |
| `@user` `#tag` | mention / tag | plain inline nodes |
| `\*esc\*` | literal | backslash + **any ASCII punctuation** |
| `--` `---` `...` `-->` `==>` `(c)` | – — … → ⇒ © | smart typography (resolved **before** emission) |
| `{--}` | – | braced en dash — converts even where the bare run refuses (flag position) |
| `\` at EOL | hard break | `\ ` also hard break here (trailing space stripped first) |
| `\ ` mid-line | no-break space | backslash-space |
| `` `<br>`{=html} `` | raw inline | HTML output only; other format names retained for converters ✦ |

### Inline traps (write tests for each)

1. **Word boundaries:** bare delimiters only at word boundaries. Intraword needs the brace form: `H{,2,}O`, `mc{^2^}`. A delimiter run glued to letters is *literal text*.
2. **Empty pairs are text:** `{^^}`, `{++}`, `{##}`, `` `` `` etc. need content — empty = literal.
3. **Smart-typos vs CLI flags:** a bare hyphen run with a space before and non-space after is a flag: `x --next` stays literal. But arrows are matched *first*: `x -->next` → `x →next`.
4. **Combined span syntax:** `/*bold italic*/` is one construct — longest-match before single delimiters.
5. **Escape beats span:** `\*not bold\*` — scan escapes before opening any delimiter.
6. **Comments:** `%% line`, `text %% trailing`, `{% hidden %}` (hides, prose resumes after closer), `%%% block %%%`. Trivia — strip before span parsing but keep offsets.
7. **CriticMarkup:** `{+ins+}` `{-del-}` `{~old~>new~}` `{#visible comment#}`. Note `{#` renders, `{%` hides. Empty pair = text.
8. **Math:** `` $`…` `` inline, ``$$`…`$$`` display — verbatim payload (challenge: pass through to Typst).

## 3. Blocks

| Construct | Syntax | Parser note |
|-----------|--------|-------------|
| Heading | `#`–`###### text` (ATX) | attrs (`{#id .class}`) go on the **line above** |
| Thematic break | `---` `***` `___` at col 0 | vs frontmatter/ATX — line-classify first |
| Unordered list | `- item` | standard |
| Ordered list | `1. item` | portable form; dialects `a.` `A.` `i.` `I.` and `)` |
| Auto list | `. item` | native preferred; counts from 1, stable deep indent |
| Task list | `- [ ] x` / `- [x] done` | |
| Styled item | `-{.c} item` | attrs abutting the marker target the `<li>` |
| List + continuation | flush-left `+` after item | attaches next flush-left block to the item (no deep indent) |
| Blockquote | `> text` | `+` at col 0 same idea for quotes |
| Attribution/caption | `^ Attribution` after `>` | wraps quote in a figure |
| Definition list | `:: term` / `: definition` | |
| `{loose}` | boolean attr | children render as blocks; **no `{tight}` twin** |
| Fenced code | ` ```lang "Header" [Label]` | standard = ```` ```lang ```` no space; "Header" → title, `[Label]` → group tab, both optional, in that order |
| Raw pass-through | ` ```=html … ``` ` | emit only when output format matches |
| Admonition | `::: note "Title"` … `:::` | types: note tip warning danger info success example quote; unknown word → generic; title must be **straight-quoted** |
| Tab group | `::: tab [Label]` … `:::` | same tokens as code fence |
| Fenced quote | `::: >` … `:::` | same block as `>`, fenced form; nests at constant width; caption `^` on **closing** fence |
| Preserved block | `::: |` … `:::` | per-line layout kept |
| Hard-break block | `::: \` … `:::` | local hard breaks, no WS preservation |
| Container nesting | closer matches opener **length exactly** | standard nesting = +1 colon per level |
| Diagram/chart ✦ | ` ``` mermaid` etc. | fence words: mermaid, d2, graphviz, wavedrom, abc, plantuml/puml, vega-lite, chart — fallback = code block |
| Line comment | `%% …` | §2.6 |
| Block comment | `%%% … %%%` | |

## 4. Tables

```carve
|= Item |= Qty |
|= Apple | 12 |
| Pear   |  3 |
^ Stock on hand
```

| Rule | Detail |
|------|--------|
| Header cell | `|=` glued to pipe + **one space**: `|=a` heads column / row; `| =a` is data text `=a` |
| First-row `|=` | heads the column |
| Body-row `|=` | heads *that row* |
| Cell marker run | glued to pipe, **terminated by the space** — the run is atomic: a rejected run takes the `=` with it |
| Merges | cell holding only `^` = rowspan-up; only `<` = colspan-left |
| Row continuation | `+` row continues the row above cell-by-cell, joined with a space |
| Alignment | horizontal `< ~ >`, vertical `^ ~ v`; vertical always needs a horizontal partner; `?` = keep column's horizontal (`?^`, `?~`, `?v`); e.g. `|=~ Item`, `|=>^ Qty`, `|<v 12`, `|?v 15` |
| Standalone run | horizontal alone OK; `| < |` alone = **colspan merge** (merge rule wins over alignment) |
| Attrs | `{aligns="right,center" valigns="top," widths="30,70"}` headerless defaults; `{header-rows=N footer-rows=N}` before the table for explicit ranges |
| Caption | `^` line after the table (§5) |

**Lexer hint:** don't tokenize cells generically — parse the pipe row as: split on unescaped `|`, then per cell check marker-run-at-start pattern `^[<~>^v?]*=?` glued-left + space.

## 5. Captions (images, quotes, tables, code, equations, figure groups)

```carve
{#fig-sun}
![A sunset](sun.jpg)
^ Figure #: A sunset

See </#fig-sun> for the view.
```

- One `^` line directly after the block = semantic caption (`figcaption`).
- `#` inside a caption = **auto number** ("Figure 1"), so cross-refs don't repeat text.
- After code fence → numbered *listing*; after `$$` math → numbered *equation*.
- `::: figure` container = composite figure: captioned children become lettered panels `(a) (b)`; `^` after closing fence captions the whole group (`</#panel-id>` → "Figure 2a").
- Caption spans multiple lines like a paragraph: fold following lines until blank line or paragraph-interrupting block (a list marker **folds in**, it doesn't end the caption).
- Attributes: `{#id .class}` on its own line attaches to the preceding/following element (images, blocks).

## 6. Attributes, semantic spans, frontmatter

```text
{#id .class key=value}     attach to preceding/following element
{loose}                    consumed structural keys (NOT emitted as attrs)
{header-rows=N footer-rows=N}
{aligns=… valigns=… widths=…}
{:fr}  {:de-CH}  {:}       language shorthand (`{:}` = unknown)
[Tab]{kbd}                 semantic spans: core kbd, abbr, time;
[HTML]{abbr="HyperText …"} samp/var/cite/dfn need ✦ SemanticSpan
[now]{time="2026-01-01"}
*[HTML]: HyperText …       abbreviation definition
```

Frontmatter: leading `---` block, **held raw** — your pipeline forwards `title:`/`author:` into `#set document(...)` and ignores the rest ([[Carve_to_Typst_Mapping]] §2).

## 7. The two rules that break parsers

> [!warning] Column-0 rule
> Block markers (`#`, `>`, `-`, `.`, `` ``` ``, `:::`, `---`, `|`) must start at **column 0** — or, inside a list, at the item's content column. An indented marker is **literal paragraph text**. Markdown tolerates 0–3 spaces of indent; **Carve does not.** This is the single biggest semantic difference from Markdown — see trap tests in [[Parser_Building_Tutorial]] §5.

> [!warning] Word-boundary rule
> Inline bare delimiters only at word boundaries (§2 trap 1); the brace form `H{,2,}O` forces intraword.

Plus: empty pairs are literal; marker runs are space-terminated; escapes preempt spans.

## 8. Parse order (recommended pipeline)

1. Split frontmatter (leading `---`).
2. Line classification pass (col-0 aware): block markers vs paragraph text — [[Parser_Building_Tutorial]] §3 `scan_line`.
3. Block assembly: containers/stack — heading, list items + `+`/`^` continuation, `:::` fences (match closer length exactly), tables (pipe rows + merge/alignment rules), captions fold onto previous block.
4. Strip comments/trivia (keep offsets) → inline span scan per text run (escapes first, word boundaries, empty pairs literal, smart typography resolved to Unicode).
5. Resolve reference links / wiki links / footnotes in a final pass (definitions can appear anywhere).

## 9. Differential anchors

Constructs where `carve-lang` v0.1.7 and your parser are most likely to disagree — test these first against the oracle ([[Carve_Parser_Challenge]] §7):

- flag-position smart typography (`x -->next`, `x --next`, `{--}`)
- marker runs in table cells (`|=a` vs `| =a`, rejected runs)
- `+` continuation attachment (list item vs quote, flush-left)
- caption fold-in vs paragraph end (list marker case)
- closer-length matching (`::::` vs `:::` nesting)
- `{loose}` on one-item lists

## Status

- [x] Distilled from official cheatsheet, verified 2026-10-06 (includes `--`→`→` arrow-vs-flag precedence, `{--}` braced en dash, `{loose}` semantics)
- [ ] Cross-check each construct against the [formal grammar](https://markup-carve.github.io/carve/grammar) during M1–M4
- [ ] Fill differential anchors §9 with oracle results
