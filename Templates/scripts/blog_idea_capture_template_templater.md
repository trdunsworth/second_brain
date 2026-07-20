---
title: "<% tp.system.prompt('Blog Post Title:') %>"
tags: ["blog-idea", "<% tp.system.prompt('Additional Tags (comma-separated):') %>"]
created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
updated: <% tp.date.now("YYYY-MM-DD HH:mm") %>
status: idea
urgency: 3
---

# Blog Idea: <% tp.system.prompt('Blog Post Title:') %>

## Hook / Opening Angle
<% tp.system.prompt("Hook / Opening Angle:", "", true) %>

## Core Idea (2-3 sentences)
<% tp.system.prompt("Core Idea:", "", true) %>

## Why Now? (Urgency Rationale)
**Score:** 3 (Evergreen)
**Rationale:** <% tp.system.prompt("Urgency Rationale:", "", true) %>

## Outline

### 1. Hook
<% tp.system.prompt("Section 1 - Hook:", "", true) %>

### 2. Problem Statement
<% tp.system.prompt("Section 2 - Problem:", "", true) %>

### 3. Data & Setup
<% tp.system.prompt("Section 3 - Data & Setup:", "", true) %>

### 4. Method / Approach
<% tp.system.prompt("Section 4 - Method:", "", true) %>

### 5. Results / Findings
<% tp.system.prompt("Section 5 - Results:", "", true) %>

### 6. Limitations & Caveats
<% tp.system.prompt("Section 6 - Limitations:", "", true) %>

### 7. Reproducibility / Code
<% tp.system.prompt("Section 7 - Reproducibility:", "", true) %>

### 8. Next Steps / Future Work
<% tp.system.prompt("Section 8 - Next Steps:", "", true) %>

## Immediate Next Actions
<% tp.system.prompt("Immediate Next Actions:", "", true) %>

## Meta
- **Target Publish Date:** <% tp.system.prompt("Target Publish Date (YYYY-MM-DD):", tp.date.now("YYYY-MM-DD")) %>
- **Estimated Word Count:** <% tp.system.prompt("Estimated Word Count:") %>
- **Series:** <% tp.system.prompt("Series (if any):") %>
- **Draft Location:** 
- **Code Repository:** 

---
*Idea captured via daily journal template*
