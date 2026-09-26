# Djot Learning Guide

## Overview
Djot is a Markdown-like markup language that's more structured and strict than standard Markdown. Created by John MacFarlane, it aims to be a unambiguous, parseable format that can be translated to other formats (HTML, PDF, etc.) while maintaining strict syntax rules.

## Quick Template

```djot
# Title

## Section

Some *italic* and **bold** text.

- List item 1
- List item 2

[Link text](https://example.com)

![Alt text](image.png)
```

## Core Syntax Cheatsheet

| Element | Syntax | Example |
|---------|--------|---------|
| Heading | `# H1` to `###### H6` | `# Title` |
| Bold | `**text**` | `**bold**` |
| Italic | `*text*` | `*italic*` |
| Code | `` `code` `` | `` `func()` `` |
| Link | `[text](url)` | `[example](http://x)` |
| Image | `![alt](url)` | `![img](img.png)` |
| List | `- item` or `* item` | `- item` |
| Blockquote | `> text` | `> quote` |
| Horizontal rule | `---` | `` --- `` |
| Table | `` \| a \| b \|`` | `` \| A \| B \|`` |

## Key Differences from Markdown

1. **Strict parsing**: Djot has a more formal grammar
2. **No edge cases**: Designed to avoid ambiguous constructs
3. **Better extensibility**: Easier to add custom extensions
4. **Built-in math**: Support for math via LaTeX inline `$$` or display `$$$$`

## Practical Example: Documentation

```djot
# Project Docs

## Getting Started

Install with:

```bash
pip install project
```

## Features

- Feature one
- Feature two
- Feature three

[Read more](https://example.com/docs)
```

## Djot vs Markdown Comparison

| Feature | Markdown | Djot |
|---------|----------|------|
| Grammar | Loose/ambiguous | Strict/ formal |
| Extensions | Via plugins | Built-in |
| Math | `$$...$$` (various) | Built-in support |
| HTML output | Varies by parser | Consistent |
| Learning curve | Easy | Medium |

## Awesome Djot Resources

- **[djot](https://djot.org)** - The official Djot website and specification
- **[djot-cli](https://github.com/ralphschindler/djot-cli)** - Command-line tool for Djot
- **[djot-py](https://github.com/ralphschindler/djot-py)** - Python parser/renderer for Djot
- **[djot-to-html](https://github.com/ralphschindler/djot-to-html)** - Djot to HTML converter
- **[awesome-djot](https://github.com/ralphschindler/awesome-djot)** (if exists) - Curated Djot resources

## When to Use Djot

- When you need strict, predictable parsing
- When building tools that process Markdown-like content
- When you want consistent HTML output across implementations
- For documentation that needs to be transformed to multiple formats