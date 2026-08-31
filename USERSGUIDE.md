---
type: guide
title: "Second Brain User Guide"
created: "2026-08-30"
tags:
  - guide
  - obsidian
---

# Second Brain User Guide

Your vault is organized around four pillars: **Daily Notes**, **Research**, **Projects**, and **Books**. Everything connects.

---

## Vault Structure

```
second_brain/
├── journal/              → Daily notes (core plugin)
├── Books/                → Book reviews
├── Research/
│   ├── Time-Series/      → Time series forecasting notes
│   ├── Data-Analytics/   → Data analytics research
│   └── Statistics/       → Statistics methods and theory
├── Projects/             → Software project tracking
├── Templates/            → All templates live here
└── references/           → Supporting materials
```

---

## Templates

Access with `Ctrl/Cmd + T` or via Command Palette → "Insert Template".

| Template | When to Use |
|----------|-------------|
| **Book Review** | Finished a book. Capture rating, takeaways, connections. |
| **Research Note** | Read a paper, article, or tutorial. Log source, methods, findings. |
| **Project Status** | New project or status update. Track phase, milestones, blockers. |
| **Meeting Note** | Any meeting. Capture agenda, decisions, action items. |
| **daily_log_template** | Your existing daily note template. |

### Creating New Notes from Templates

1. `Ctrl/Cmd + N` → new note
2. `Ctrl/Cmd + T` → pick template
3. Fill in the frontmatter fields (the `---` block at the top)
4. Write your content below

---

## Plugins Quick Reference

### Dataview

Turns your notes into queryable databases. Use in any note:

````markdown
```dataview
TABLE field1, field2
FROM "folder"
WHERE type = "note-type"
SORT field DESC
```
````

**Common queries:**

All books read:
```dataview
TABLE author, rating, date_read
FROM "Books"
WHERE type = "book-review"
SORT rating DESC
```

Active projects:
```dataview
TABLE phase, status, last_updated
FROM "Projects"
WHERE type = "project-status"
SORT last_updated DESC
```

Research by topic:
```dataview
TABLE source, method, status
FROM "Research"
WHERE type = "research-note"
SORT date DESC
```

Unfinished tasks across vault:
```dataview
TASK
WHERE !completed
SORT due ASC
```

### Tasks

Track actionable items. Syntax:

- [ ] Unfinished task
- [x] Completed task
- [ ] Task with due date ⏫ 2026-09-15
- [ ] Task with priority 🔺 high

**Query tasks in Dataview:**
```dataview
TASK
WHERE contains(text, "Uber")
SORT due ASC
```

### Kanban

Create project boards:
1. New note → Command Palette → "Kanban: Create new board"
2. Add columns: Backlog → In Progress → Review → Done
3. Drag cards between columns

### Excalidraw

Draw diagrams inside notes:
1. Command Palette → "Excalidraw: Create new drawing"
2. Save and embed in any note with `![[drawing.excalidraw]]`

### Book Search

Look up books by title or ISBN:
1. Command Palette → "Book Search: Create new note for a book"
2. Type title → select from results
3. Note created with metadata filled in

### Admonition

Styled callout boxes. Use native Obsidian syntax:

```markdown
> [!tip] Key Insight
> This method reduces forecast error by 15%.

> [!warning] Watch Out
> Multicollinearity ruins this approach.

> [!note] Method
> Steps go here.
```

---

## Workflows

### Daily Journal

1. Click "Open today's daily note" (calendar icon in ribbon)
2. Write freely — tasks, thoughts, notes
3. Link to other notes with `[[note name]]`

### Research Session

1. Create new note in appropriate `Research/` subfolder
2. Apply **Research Note** template
3. Fill frontmatter: topic, source, method
4. Write findings below
5. Link to related notes: `[[ARIMA vs Prophet]]`

### Book Review

1. Finish book → create note in `Books/`
2. Apply **Book Review** template (or use Book Search plugin)
3. Rate it, write takeaways, link to related research
4. Query all books later with Dataview

### Project Update

1. Open note in `Projects/` (or create new with **Project Status** template)
2. Update phase, blockers, next steps
3. Add log entry with today's date
4. Kanban board for visual tracking (optional)

---

## Frontmatter Reference

Every note type uses YAML frontmatter for Dataview queries.

### Book Review
```yaml
---
type: book-review
title: ""
author: ""
rating: 
date_read: ""
genre: ""
status: ""
tags:
  - book
  - review
---
```

### Research Note
```yaml
---
type: research-note
topic: ""
source: ""
method: ""
date: ""
status: ""
tags:
  - research
  - 
---
```

### Project Status
```yaml
---
type: project-status
project: ""
phase: ""
owner: ""
last_updated: ""
tags:
  - project
  - status
---
```

### Meeting Note
```yaml
---
type: meeting
title: ""
date: ""
attendees: ""
tags:
  - meeting
  - 
---
```

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New note | `Ctrl/Cmd + N` |
| Quick switcher | `Ctrl/Cmd + O` |
| Search | `Ctrl/Cmd + Shift + F` |
| Insert template | `Ctrl/Cmd + T` |
| Open daily note | Set in Daily Notes settings |
| Command palette | `Ctrl/Cmd + P` |

---

## Tagging Convention

Use tags in frontmatter for filtering:

- `#book` `#review` — book notes
- `#research` `#time-series` `#statistics` `#data-analytics` — research
- `#project` `#status` — project tracking
- `#meeting` — meeting notes

---

## Tips

1. **Link liberally.** `[[Note Name]]` creates connections. The graph view rewards this.
2. **Frontmatter matters.** Dataview queries it. Keep fields consistent.
3. **One idea per note.** Easier to link, easier to find.
4. **Review weekly.** Open Dataview queries, check what's stale, update status.
5. **Don't over-organize.** Tags and links beat deep folder hierarchies.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Dataview shows raw code | Restart Obsidian |
| Template not appearing | Check `Templates/` folder in settings |
| Plugin not loading | Settings → Community Plugins → enable it |
| Notes not syncing | Check `github-sync` plugin config |

---

*Last updated: 2026-08-30*
