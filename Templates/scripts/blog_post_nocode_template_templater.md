---
title: "<% tp.system.prompt('Post Title:') %>"
subtitle: "<% tp.system.prompt('Subtitle (optional):') %>"
description: "<% tp.system.prompt('SEO Description (<160 chars):') %>"
author: "Dr. Tony Dunsworth"
date: "<% tp.system.prompt('Publish Date (YYYY-MM-DD):', tp.date.now('YYYY-MM-DD')) %>"
date-modified: "<% tp.date.now('YYYY-MM-DD') %>"
categories: [<% tp.system.prompt('Categories (comma-separated, e.g., 911-dispatch, leadership, career):') %>]
tags: [<% tp.system.prompt('Tags (comma-separated, e.g., nena, psap, management, 911-career):') %>]
image: "images/posts/<% tp.system.prompt('Slug (URL-friendly):') %>-hero.png"
image-alt: "<% tp.system.prompt('Image Alt Text:') %>"
draft: true
toc: true
toc-depth: 3
number-sections: false
format:
  html:
    theme: cosmo
    highlight-style: github
    repo-url: https://github.com/tonydunsworth/drddatascience-blog
    repo-actions: [edit, issue]
---

## Introduction

**Hook.** One paragraph: why this matters to a 911 director/analyst *right now*.

**Context.** The situation, constraint, or change driving the need.

**What You'll Walk Away With.** A mental model, decision framework, checklist, or perspective shift.

---

## The Problem

Describe the pain point in concrete terms. Use a specific scenario if helpful.

> **Example**: "It's Sunday 3 AM. Your CAD shows 47 pending calls. Two call-takers just called out. The Erlang-C calculator says you need 8 — you have 4."

---

## The Insight / Framework / Argument

**Core claim.** One bold sentence stating your thesis.

### Supporting Point 1

Evidence, story, standard, or principle.

### Supporting Point 2

Evidence, story, standard, or principle.

### Supporting Point 3

Evidence, story, standard, or principle.

---

## Practical Application

### For Directors

- **Do this:** <% tp.system.prompt('Director Action:', '', true) %>
- **Ask this:** <% tp.system.prompt('Director Question:', '', true) %>
- **Measure this:** <% tp.system.prompt('Director Metric:', '', true) %>

### For Analysts

- **Build this:** <% tp.system.prompt('Analyst Build:', '', true) %>
- **Track this:** <% tp.system.prompt('Analyst Track:', '', true) %>
- **Automate this:** <% tp.system.prompt('Analyst Automate:', '', true) %>

### For Trainers / QA

- **Teach this:** <% tp.system.prompt('Trainer Teach:', '', true) %>
- **Audit this:** <% tp.system.prompt('Trainer Audit:', '', true) %>
- **Coach on this:** <% tp.system.prompt('Trainer Coach:', '', true) %>

---

## Quick Reference {.unnumbered}

| Situation | Action | Reference |
|-----------|--------|-----------|
| <% tp.system.prompt('Situation 1:', '', true) %> | <% tp.system.prompt('Action 1:', '', true) %> | <% tp.system.prompt('Reference 1:', '', true) %> |
| <% tp.system.prompt('Situation 2:', '', true) %> | <% tp.system.prompt('Action 2:', '', true) %> | <% tp.system.prompt('Reference 2:', '', true) %> |
| <% tp.system.prompt('Situation 3:', '', true) %> | <% tp.system.prompt('Action 3:', '', true) %> | <% tp.system.prompt('Reference 3:', '', true) %> |

---

## Caveats & Limits

- **Doesn't apply when:** <% tp.system.prompt('Does Not Apply When:', '', true) %>
- **Assumes:** <% tp.system.prompt('Assumes:', '', true) %>
- **Test first:** <% tp.system.prompt('Test First:', '', true) %>

---

## Further Reading

- [NENA Standard XXX](https://www.nena.org/page/Standards) — <% tp.system.prompt('NENA Standard Note:', '', true) %>
- [Prior Post: Title](URL) — <% tp.system.prompt('Prior Post Note:', '', true) %>
- [External Resource](URL) — <% tp.system.prompt('External Resource Note:', '', true) %>

---

*Published <% tp.date.now('YYYY-MM-DD') %> | drddatascience.com/blog | `<% tp.date.now('YYYY-MM-DD') %>`*

<%* tp.file.cursor() %>
