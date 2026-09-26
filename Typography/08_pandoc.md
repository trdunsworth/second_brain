# Pandoc Learning Guide

## Overview
Pandoc is a universal document converter that can convert between numerous markup formats including Markdown, HTML, LaTeX, Word docx, PDF, AsciiDoc, and more. Created by John MacFarlane, it's the Swiss Army knife of document conversion and can also serve as a powerful document generation system with filters, templates, and extended syntax.

## Quick Template

```yaml
# metadata.yaml
title: "My Document"
author: "Author Name"
date: "2024-01-15"
subtitle: "Using Pandoc"
abstract: "This is a document created with Pandoc."
```

```bash
# Convert Markdown to PDF via LaTeX
pandoc input.md -o output.pdf

# Convert Markdown to Word
pandoc input.md -o output.docx

# Convert with metadata
pandoc input.md -V title:"My Title" -V author:"Me" -o output.pdf

# Convert with LaTeX template
pandoc input.tex -o output.pdf --pdf-engine=xelatex
```

## Core Conversion Cheatsheet

| From → To | Command Example |
|-----------|----------------|
| Markdown → HTML | `pandoc input.md -o output.html` |
| Markdown → PDF | `pandoc input.md -o output.pdf` |
| Markdown → Word (docx) | `pandoc input.md -o output.docx` |
| HTML → PDF | `pandoc input.html -o output.pdf` |
| LaTeX → PDF | `pandoc input.tex -o output.pdf` |
| Markdown → LaTeX | `pandoc input.md -o output.tex` |
| AsciiDoc → PDF | `pandoc input.asc -o output.pdf` |
| Markdown → Jupyter Notebook | `pandoc input.md -o output.ipynb --to ipynb` |

## Practical Examples

### 1. Basic Conversion

```bash
# Markdown to PDF
pandoc article.md -o article.pdf

# Markdown to Word
pandoc resume.md -o resume.docx

# Markdown to HTML with CSS
pandoc slides.md -o slides.html --css=style.css
```

### 2. With YAML Metadata

```bash
pandoc article.md \
  -V title:"My Article" \
  -V author:"John Doe" \
  -V date:"January 2024" \
  -V subtitle:"An amazing paper" \
  -o article.pdf
```

### 3. With LaTeX Template Customization

```bash
pandoc article.md -o article.pdf \
  --pdf-engine=xelatex \
  --variable geometry:margin=1in \
  --variable fontsize=11pt
```

### 4. Creating a Slide Deck

```bash
pandoc slides.md -o slides.html --standalone --toc --css=reveal.js/css/normalize.css
```

### 5. Reference Citation (with BibTeX)

```bash
pandoc paper.md -o paper.pdf --cite-notes --bibliography references.bib
```

## Advanced Features

### Pandoc Markdown Extensions

- **Tables**: `|=` table construction
- **Fenced code blocks** with syntax highlighting
- **Footnotes**: `[^1]` style
- **Citations**: `@key` with `--bibliography`
- **Metadata**: YAML block at top of file
- **LaTeX math**: `$$...$$` and `\(...\)`
- **Emphasis**: `*italic*`, `**bold**`, `***bold italic***`

### Common Pandoc Options

| Option | Description |
|--------|-------------|
| `-f FORMAT` | Input format (default: markdown) |
| `-t FORMAT` | Output format |
| `--toc` | Add table of contents |
| `--filter FORMAT` | Run JSON filter |
| `--cite-notes` | Add citations to notes |
| `--bibliography FILE` | Bibliography file |
| `-V KEY:VAL` | Variable substitution |
| `--resource-path DIR` | Path to resources |

## When to Use Pandoc

- Converting documents between formats
- Creating publications from Markdown sources
- Generating slides/presentations
- Document generation with complex formatting
- When you need to convert between obscure formats
- Bibliography management and citation formatting
- Document templating and automation

## Awesome Pandoc Resources

- **[Pandoc Official Documentation](https://pandoc.org/README.html)** - Comprehensive user guide
- **[Pandoc User's Guide](https://pandoc.org/MANUAL.html)** - The definitive guide
- **[Pandoc GitHub](https://github.com/jgm/pandoc)** - Source code and issues
- **[Pandoc Examples](https://github.com/jgm/pandoc/tree/master/examples)** - Ready examples
- **[Pandoc Discourse](https://discourse.pandoc.org)** - Community forum
- **[awesome-pandoc](https://github.com/awesome-selfhosted/awesome-selfhosted#pandoc)** - Curated resources
- **[Pandoc Templates](https://pandoc.org/templates.html)** - Template system
- **[Pandoc Filters](https://pandoc.org/filters.html)** - Custom transformation filters

## Pandoc vs Other Tools

| Feature | Pandoc | Markdown-Only | specialized converters |
|---------|--------|---------------|----------------------|
| Format support | 30+ formats | Limited to HTML/PDF | Single format focus |
| Metadata support | YAML variables | Basic | Varies |
| Bibliography | Full citeproc support | Limited | Varies |
| Templates | Powerful template system | None | Varies |
| Filters/Extensibility | JSON filters | None | Varies |
| Slide generation | Reveal.js, Beamer | None | Varies |

## Pandoc Installation

```bash
# macOS
brew install pandoc

# Linux (Ubuntu/Debian)
sudo apt-get install pandoc

# Windows
choco install pandoc
# Or download installer from pandoc.org

# Verify installation
pandoc --version
```

## Quick Start Checklist

1. Install Pandoc
2. Create a `.md` file with YAML metadata
3. Convert: `pandoc input.md -o output.pdf`
4. Explore format-specific options
5. Use `--filter` for custom processing
6. Create templates for reusable documents
7. Manage bibliographies with BibTeX/CSL

## Pandoc File Structure Example

```
my-document/
  input.md          # Markdown source
  metadata.yaml     # YAML metadata
  template.tex      # LaTeX template (optional)
  references.bib    # Bibliography (optional)
  filters/          # Custom filters (optional)
    format.py
  output/           # Generated outputs
```

## Advanced: Pandoc Lua Filters

```lua
-- Format page numbers
function Table (tbl)
  -- Modify tables
  return tbl
end

function Meta (meta)
  -- Modify document metadata
  return meta
end
```

Run with: `pandoc input.md -o output.pdf --lua-filter myfilter.lua`

---
*Last updated: 2026. Created as part of the Typography learning series.*