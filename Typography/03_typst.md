# Typst Learning Guide

## Overview
Typst is a modern, programmable typesetting system that's a powerful alternative to LaTeX. It features a simpler syntax, faster compilation, and built-in capabilities for creating documents, presentations, and diagrams.

## Quick Template

```typst
#show: set text(font: "Helvetica")

#title("My Document")

#subtitle("An introduction to Typst")

#text("Hello, world! This is Typst.")

#page(number: true)
```

## Hello World Example

```typst
#confirm("Hello, Typst!")
```

## Core Features Cheatsheet

| Feature | Syntax/Command | Example |
|---------|---------------|---------|
| Text | `#text("...")` | `#text("Hello")` |
| Headings | `# title`, `## subtitle` | `# My Title` |
| Math | `$$...$$` or `$(...)$` | `$E = mc^2$` |
| Images | `#image("path.png")` | `#image("fig.png")` |
| Loops | `for i in 1..3 { ... }` | `for i in 1..3 { #text(i) }` |
| Variables | `let x = 5` | `let n = 42` |
| Functions | `def myfn(x) { ... }` | `def hello() { #text("hi") }` |
| Conditional | `if cond { ... }` | `if true { #text("yes") }` |

## Practical Example: Report

```typst
#import "fonts: cm"

#set text(size: 12pt)

#title("Weekly Report")

#author("Your Name")

#date("2024-01-15")

#text("This is a report generated with Typst.")

#figure(
  #image("chart.png"),
  caption: "Sample chart"
)
```

## Advanced: Mathematical Content

```typst
#set math(font: "Libertinus Math")

$$ \int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi} $$

Inline: $E = mc^2$
```

## When to Use Typst

- Creating articles, reports, and books
- Documents requiring precise typography
- Presentations and slides
- Mathematical and scientific documents
- When you want a simpler alternative to LaTeX
- Faster compilation cycles
- Built-in graphics and diagrams

## Awesome Typst Resources

- **[Typst Documentation](https://typst.app/docs)** - Official documentation
- **[Typst GitHub](https://github.com/typst/typst)** - Source code and contributions
- **[Typst Gallery](https://github.com/typst/typst-gallery)** - Examples and templates
- **[Typst Discord](https://discord.typst.app)** - Community chat
- **[awesome-typst](https://github.com/rakhine/awesome-typst)** - Curated list of Typst resources
- **[Typst Playground](https://typst.app/playground)** - Try Typst in your browser
- **[Typst VS Code Extension](https://marketplace.visualstudio.com/items?search=typst)** - Editor support

## Typst vs LaTeX

| Aspect | Typst | LaTeX |
|--------|-------|-------|
| Syntax | Simpler, more readable | More complex |
| Learning curve | Easy | Steeper |
| Compilation | Fast | Slower |
| Features | Growing ecosystem | Mature, extensive |
| Configuration | Batteries-included | Packages required |
| Community | Growing | Large, established |