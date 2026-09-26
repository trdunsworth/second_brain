# TeX/LaTeX Learning Guide

## Overview
TeX is a typesetting system created by Donald Knuth, and LaTeX is a macro package built on top of TeX. LaTeX is the de facto standard for scientific and mathematical document publication. It's essential for academics, researchers, and anyone needing high-quality typesetting of complex mathematics.

## Quick Template

```latex
\documentclass{article}
\usepackage[utf8]{inputenc}
\usepackage{geometry}
\geometry{a4paper, margin=1in}

\title{My Document}
\author{Author Name}
\date{\today}

\begin{document}

\maketitle

\section{Introduction}
Some introduction text.

\section{Mathematics}
The equation $E = mc^2$ is famous.

\[
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
\]

\end{document}
```

## Hello World Example

```latex
\documentclass{article}
\begin{document}
Hello, World!
\end{document}
```

## Core Components Cheatsheet

| Component | Command | Example |
|-----------|---------|---------|
| Document class | `\documentclass{article}` | `\documentclass{book}` |
| Packages | `\usepackage{package}` | `\usepackage{graphicx}` |
| Title | `\title{...}` | `\title{Report}` |
| Author | `\author{...}` | `\author{Me}` |
| Date | `\date{...}` | `\date{2024}` |
| Section | `\section{...}` | `\section{Intro}` |
| Subsection | `\subsection{...}` | `\subsection{Setup}` |
| Paragraph text | Regular text | Just type it |
| Math inline | `$...$` | `$a^2 + b^2 = c^2$` |
| Math display | `\[...\]` or `$$...$$` | `\[ \frac{a}{b} \]` |
| Command | `\newcommand{\cmd}{...}` | `\newcommand{\R}{\mathbb{R}}` |
| Environment | `\begin{env} ... \end{env}` | `\begin{enumerate} \end{enumerate}` |

## Practical Example: Report

```latex
\documentclass[12pt]{article}
\usepackage{amsmath, graphicx}

\title{Weekly Report}
\author{Your Name}
\date{\today}

\begin{document}

\maketitle

\section{Overview}
This report covers the week's activities.

\subsection{Results}
The results show that $F = ma$.

\begin{figure}[h]
\centering
\includegraphics[width=0.5\textwidth]{chart.png}
\caption{Sample chart}
\end{figure}

\section{Conclusion}
The analysis is complete.

\end{document}
```

## Mathematics in LaTeX

| Expression | Command | Rendered |
|------------|---------|----------|
| Inline $a=b$ | `$a=b$` | $a=b$ |
| Display \[ \] | `\[ a=b \]` | $$a=b$$ |
| Summation | `\sum_{i=1}^n i` | $\sum_{i=1}^n i$ |
| Integral | `\int_a^b f(x)dx` | $\int_a^b f(x)dx$ |
| Matrix | `\begin{matrix} a & b \\ c & d \end{matrix}` | $\begin{matrix} a & b \\ c & d \end{matrix}$ |
| Greek letters | `\alpha, \beta, \gamma` | $\alpha, \beta, \gamma$ |

## LaTeX Editors and Tools

- **Overleaf** - Online LaTeX editor with collaboration
- **TeXShop** (macOS) - Native LaTeX editor
- **TeX Live** - TeX distribution (cross-platform)
- **MiKTeX** - TeX distribution for Windows
- **VS Code** - With LaTeX extension
- **TeXworks** - Simple, cross-platform editor

## When to Use LaTeX

- Documents with complex mathematics
- Academic papers and journals
- Books and long-form technical content
- When precise typography is required
- Papers with many citations and references
- When standard Word/Markdown won't suffice

## LaTeX Distribution

- **TeX Live** (cross-platform, recommended)
- **MiKTeX** (Windows)
- **MacTeX** (macOS, includes TeX Live + extras)

## Package Manager

- `\usepackage{}` for packages
- CTAN (Comprehensive TeX Archive Network) for finding packages
- `tlmgr` (TeX Live) or `mpm` (MiKTeX) for package management

## Awesome LaTeX Resources

- **[CTAN](https://ctan.org)** - Comprehensive TeX Archive Network
- **[LaTeX Project](https://latex-project.org)** - Official LaTeX resources
- **[Overleaf Gallery](https://overleaf.com/gallery)** - Examples and templates
- **[TeX StackExchange](https://tex.stackexchange.com)** - Q&A site
- **[LaTeX Wikibook](https://en.wikibooks.org/wiki/LaTeX)** - Free tutorial
- **[awesome-latex](https://github.com/latex3/awesome-latex)** - Curated resources
- **[CTAN packages](https://ctan.org/pkg)** - Package listings
- **[CTAN advanced](https://ctan.org/tex-archive/macros/latex/contrib)** - Contrib packages

## LaTeX vs Word vs Markdown

| Feature | LaTeX | Word | Markdown |
|---------|-------|------|----------|
| Math quality | Excellent | Good | Limited |
| Typography | Excellent | Good | Basic |
| Learning curve | Steep | Easy | Easy |
| Output formats | DVI, PDF, PS | DOCX, PDF | HTML, PDF (via tools) |
| Customization | High (packages) | Medium | Low-Medium |
| Collaboration | Via version control | Built-in | Via services |
| Best for | Papers, books | General docs | Notes, simple docs |

## Getting Started Checklist

1. Install TeX Live/MiKTeX
2. Choose an editor (Overleaf for beginners, VS Code for developers)
3. Create your first `.tex` file
4. Compile with `pdflatex file.tex`
5. Learn basic commands and environments
6. Explore packages for your needs
7. Join LaTeX communities for help