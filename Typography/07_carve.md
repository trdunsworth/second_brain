# Carve Learning Guide

## Overview
Carve is a post-Markdown lightweight markup language with visual mnemonics and human-centered design. It builds on Markdown's basics and Djot's technical rigor while adding visual mnemonics where the markup characters suggest their output. Carve aims to combine Markdown's reach, Djot's consistency, and web-native features without turning content into a JavaScript program.

## Quick Template

```carve
---
title: "My Carve Document"
tags: [carve, markup]
---

# Introduction

Some *italic* and **bold** text.

A [link](https://example.com).

![Alt text](image.png)

A {^super^} script and {,sub,} script.

~strikethrough~

=highlight=

# Section

Some content here.
```

## Core Syntax Cheatsheet (Visual Mnemonics)

| Write | Get | Mnemonic |
|-------|-----|----------|
| `/italic/` | *italic* | slashes lean like italics |
| `*bold*` | **bold** | asterisks are heavy |
| `/*bold italic*/` | ***both*** | combined styling |
| `_underline_` | underline | the line sits below |
| `~strike~` | ~~strike~~ | tilde runs through |
| `{^super^}` | ^superscript^ | caret points up |
| `{,sub,}` | ,subscript, | commas pull down |
| `=highlight=` | ==highlight== | like a highlighter pen |
| `` `code` `` | `code` | backticks |
| `!`code`` | inline literal | verbatim prose |
| `text` | link | |
| `[Page Name][]` | wiki link | resolves to heading |
| ` ` | autolink | |
| `</#id>` | cross-reference | clones target text |
| `alt` | image | |
| `[^1]` / `^[note]` | footnote | reference/inline form |
| `[span]{.class}` | span | adds class/id attributes |
| `:youtube[ID]` | video | extension feature |

## Carve vs Markdown vs Djot Comparison

| Feature | Markdown | Djot | Carve |
|---------|----------|------|-------|
| Italic | `*text*` | `*text*` | `/text/` |
| Bold | `**text**` | `**text**` | `*text*` |
| Strikethrough | `~~text~~` | `~text~` | `~text~` |
| Highlight | (plugin) | (plugin) | `=text=` |
| Superscript | (plugin) | `^text^` | `{^text^}` |
| Subscript | (plugin) | `~text~` | `{,sub,}` |
| Visual mnemonics | No | No | **Yes** |
| Extensions | Plugins | Built-in | Tiered system |
| Render targets | HTML, etc. | HTML, etc. | HTML, Markdown, Text, ANSI |

## Practical Example: Documentation

```carve
---
title: "User Guide"
tags: [carve, documentation]
---

# Getting Started

Install with `pip install project`.

## Features

- Feature one
- Feature two
- Feature three

## Advanced

Some {^super^} script and {,sub,} script here.

~This is deleted text~

This is highlighted text.

A [link](https://example.com) and an image!

![Logo](logo.png)

### Table

| Name | Value |
|------|-------|
| A | 1 |
| B | 2 |

[^1]: This is a footnote.

[#section-id](#) cross-reference.

```

## Carve Extensions (Tier System)

- **Tier 1 (Core)**: Always available, identical across implementations
  - Headings, lists, links, basic formatting, attributes
- **Tier 2**: Opt-in extensions
  - Citations, automatic URL linking
- **Tier 3**: Diagrams, advanced features

## When to Use Carve

- When you want visual mnemonics to aid learning
- When you need consistent output across multiple formats
- When building documentation that needs HTML, Markdown, and text outputs
- When you want a "post-Markdown" experience with improved syntax
- When you need superscript/subscript without complex syntax
- For interactive web content with optional JavaScript enhancements

## Carve Toolchain

- **JavaScript/TypeScript**: `npm @markup-carve/carve`
- **PHP**: `packagist markup-carve/carve-php`
- **Rust**: `crates.io carve-lang`
- **Python**: `git` (PyPI pending)
- **Ruby**: `gem install carve-lang`
- **Go**: `go get github.com/markup-carve/carve-go`

## Awesome Carve Resources

- **[Carve Official](https://markup-carve.github.io/carve/)** - Documentation and demo
- **[Carve GitHub](https://github.com/markup-carve/carve)** - Source code and issues
- **[Carve Cheatsheet](https://github.com/markup-carve/carve/blob/main/docs/cheatsheet.md)** - Complete syntax reference
- **[Carve Examples](https://github.com/markup-carve/carve/blob/main/docs/examples/)** - Sample documents
- **[Carve Playground](https://markup-carve.github.io/carve/)** - Live demo
- **[awesome-carve]([https://github.com/ralphschindler/awesome-carve](https://github.com/markup-carve/awesome-carve))** (if exists) - Curated resources
- **[Carve Discord](https://discord.gg/carve)** - Community chat (if exists)

## Carve Installation (JavaScript)

```bash
npm install @markup-carve/carve
```

```javascript
import { carveToHtml } from "@markup-carve/carve";

const html = carveToHtml(carveSource);
console.log(html);
```

## Carve vs Markdown Migration

- Carve's core syntax is smaller and more consistent
- Visual mnemonics (`/italic/`, `*bold*`) aid memory
- Carve has a tiered extension system vs Markdown's fragmented flavors
- Cross-format rendering is built-in (HTML, Markdown, Text, ANSI)
- Some Markdown constructs don't have direct Carve equivalents