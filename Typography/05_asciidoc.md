# AsciiDoc Learning Guide

## Overview
AsciiDoc is a documentation markup language that's more structured than Markdown and designed for writing software documentation, books, and articles. It's the basis for many documentation systems and can be converted to multiple formats including HTML, PDF, DocBook, and more.

## Quick Template

```asciidoc
= Document Title
Author: Your Name

:done: 

== Introduction

Some content here.

=== Section

More content.
```

## Core Syntax Cheatsheet

| Element | Syntax | Example |
|---------|--------|---------|
| Title | `= Title` | `= User Guide` |
| Heading | `== Heading` | `== Introduction` |
| Subsection | `=== Subsection` | `=== Getting Started` |
| Bold | `**text**` | `**important**` |
| Italic | `*text*` | `*note*` |
| Monospace | `+text+` | `+code+` |
| Link | `<<url, text>>` | `<<http://x, example>>` |
| Image | `image::path.png[]` | `image::logo.png[]` |
| List | `* item` or `1. item` | `* Item one` |
| Table | `|=== | Col1 | Col2 | ...` | `` | `A` | `B` | `` |
| Code | `computerfont:True+...+` | `+code+` |

## Practical Example: Documentation

```asciidoc
= User Guide
Author: Jane Doe

= Introduction

Welcome to the user guide.

= Installation

Install with `pip install project`.

= Usage

```bash
project --option value
```

[link:http://example.com[More info]]
```

## AsciiDoc vs Markdown

| Feature | AsciiDoc | Markdown |
|---------|----------|----------|
| Structure | Explicit sections | Implicit headers |
| Links | `<<url, text>>` | `[text](url)` |
| Images | `image::path[]` | `![alt](url)` |
| Tables | More flexible | Basic support |
| Output formats | HTML, PDF, DocBook, etc. | HTML, PDF (via plugins) |
| Macros/Includes | Built-in | Via plugins |
| Learning curve | Medium | Easy |

## When to Use AsciiDoc

- Software documentation and API references
- Books and long-form technical content
- When you need structured, consistent formatting
- When converting to multiple formats (PDF, HTML, DocBook)
- Enterprise documentation workflows
- When using tools that natively support AsciiDoc (Antora, Asciidoctor)

## AsciiDoc Toolchain

- **Asciidoctor** - The primary Ruby implementation
- **Asciidoc.js** - JavaScript implementation for browsers
- **Antora** - Static site generator for documentation
- **Pass** - PDF generation
- **a2x** - Conversion tool

## Awesome AsciiDoc Resources

- **[AsciiDoc Official](https://asciidoc.org)** - Documentation and resources
- **[Asciidoctor](https://asciidoctor.org)** - Complete AsciiDoc ecosystem
- **[AsciiDoc.js](https://github.com/asciidoctor/js)** - JavaScript port
- **[Antora](https://antora.org)** - Documentation site generator
- **[awesome-asciidoc](https://github.com/asciidoctor/awesome-asciidoc)** - Curated list
- **[AsciiDoc 101](https://asciidoctor.org/101/)** - Getting started guide
- **[AsciiDoc Editors](https://asciidoctor.org/docs/editor/)** - Editor recommendations

## AsciiDoc Document Parts

```
= Document Title

// Document header (title, author, revision)

== Introduction

// Main content

=== Section 1

Content here.

=== Section 2

More content.

// Appendix

=== Appendix A

Additional info.
```

## AsciiDoc Metadata

```asciidoc
= My Document
Author: John Doe
Revision: 1.0
Keywords: programming, documentation
```