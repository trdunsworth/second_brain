# Quarto Learning Guide

## Overview
Quarto is a universal publishing system built on Markdown that enables you to create dynamic documents, presentations, and websites. It supports multiple languages (Python, R, Julia, Observable) and output formats (HTML, PDF, Word, PowerPoint).

## Quick Template (.qmd)

```yaml
---
title: "My Quarto Document"
format:
  html: default
  pdf: default
  docx: default
---

# Introduction

This is a Quarto document.

```python
import pandas as pd
df = pd.read_csv("data.csv")
df.head()
```
```

## Hello World Examples

### Python Code Cell

```python
#| label: code-cell
print("Hello, Quarto!")
```

### R Code Cell

```{r}
#| label: r-cell
summary(cars)
```

### Julia Code Cell

```julia
#| label: julia-cell
using Pkg
Pkg.status()
```

## Output Formats

| Format | Command | Use Case |
|--------|---------|----------|
| HTML | `quarto render doc.qmd --to html` | Web publishing, blogs |
| PDF | `quarto render doc.qmd --to pdf` | Reports, documents |
| Word | `quarto render doc.qmd --to docx` | Shareable docs |
| PowerPoint | `quarto render doc.qmd --to pptx` | Presentations |
| Python/R Notebook | `quarto convert doc.qmd --to ipynb` | Jupyter compatibility |

## Advanced: Parameterized Reports

```yaml
---
title: "Weekly Report"
format:
  html: default
  docx: default
params:
  audience: "ops"
  week_start: "2024-01-15"
---
```

Use `params$audience` in code cells or `-P audience:shift` on command line.

## Publish to Quarto Publish

```bash
quarto publish publish doc.qmd
# Or with content
quarto publish gh doc.qmd
```

## When to Use Quarto

- Scientific reports and papers
- Data analysis and visualization
- Interactive documents with code
- Presentations and slides
- Books and long-form content
- When you need multiple output formats from one source
- When working with Python, R, or Julia

## Awesome Quarto Resources

- **[Quarto Documentation](https://quarto.org/docs)** - Official docs
- **[Quarto GitHub](https://github.com/quarto-dev/quarto-cli)** - Source and contributions
- **[Quarto Discuss](https://discuss.quarto.org)** - Community forum
- **[Quarto Examples](://github/quarto-examples)** - Ready examples
- **[awesome-quarto](https://github.com/quarto-dev/awesome-quarto)** - Curated list
- **[Quarto Blog](https://quarto.org/blog)** - Updates and tutorials
- **[Quarto School](https://quarto.school)** - Video courses
- **[Quarto VS Code Extension](https://marketplace.visualstudio.com/items?search=quarto)** - Editor support

## Quarto vs Jupyter vs RMarkdown

| Feature | Quarto | Jupyter | RMarkdown |
|---------|--------|---------|-----------|
| Output formats | HTML, PDF, Word, PPTX | HTML, PDF | HTML, PDF |
| Languages | Python, R, Julia, Observable | Python, R, Julia | R, Python |
| Publishing | Quarto Publish | GitHub Pages | Limited |
| Parameters | `-P` flag | Parameters tag | `params:` YAML |
| Interactivity | High | High | Medium |