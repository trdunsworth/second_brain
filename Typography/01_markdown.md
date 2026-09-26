# Markdown Learning Guide

## Overview
Markdown is a lightweight markup language with plain-text formatting syntax. Its design allows it to be converted to many output formats, and it's widely used for documentation, note-taking, and content creation.

## Quick Template

```markdown
---
title: "{{title}}"
author: "{{author}}"
date: "{{date}}"
---

# {{heading}}

## Introduction

{{content}}

## Features

- Feature 1
- Feature 2
- Feature 3

## Conclusion

{{conclusion}}
```

## Core Syntax Cheatsheet

| Element | Syntax | Example |
|---------|--------|---------|
| Heading | `# H1` to `###### H6` | `# Title` |
| Bold | `**text**` or `__text__` | `**bold text**` |
| Italic | `*text*` or `_text_` | `*italic text*` |
| Code | `` `code` `` | `` `printf("hello")` `` |
| Link | `[text](url)` | `[Quarto](quarto.org)` |
| Image | `![alt](url)` | `![Logo](logo.png)` |
| Blockquote | `> text` | `> Quote` |
| List | `- item` or `1. item` | `- Apple` |
| Table | `` \| col1 \| col2 \|`` | `` \| A \| B \|`` |

## Practical Example: Documentation Page

```markdown
# Project Documentation

## Installation

```bash
pip install project-name
```

## Usage

```python
import project_name

result = project_name.do_something()
print(result)
```

## API

| Function | Description | Example |
|----------|-------------|---------|
| `do_something()` | Does something useful | `do_something()` |
| `do_other()` | Does another thing | `do_other()` |
```

## Awesome Markdown Resources

- **[awesome-markdown](https://github.com/ahmoud/awesome-markdown)** - Curated list of Markdown tools, editors, and resources
- **[Markdown-Guide](https://markdown-guide.org)** - Comprehensive guide and cheatsheet
- **[commonmark](https://commonmark.org)** - The definitive Markdown specification
- **[markdown-it](https://github.com/markdown-it/markdown-it)** - Powerful Markdown parser for JavaScript
- **[pegdown](https://github.com/pegdown/pegdown)** - Markdown processor in JavaScript

## Recommended Editors

- [Obsidian](https://obsidian.md) - Note-taking with Markdown
- [Typora](https://typora.io) - Live preview Markdown editor
- [VS Code](https://code.visualstudio.com) - With Markdown extension
- [Aud](https://audioshell.github.io/aud/) - Terminal-based Markdown viewer

## When to Use Markdown

- Documentation and README files
- Blog posts and articles
- Notes and knowledge management
- Quick prototyping of content
- When you need portability across platforms