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
├── journal/              → Daily notes (core plugin) + Journal Dashboard
├── Books/                → Book reviews
├── Research/
│   ├── Time-Series/      → Time series forecasting notes & papers
│   ├── Research MOC.md   → Map of Content for research
│   └── Research Dashboard.md → Dataview queries for research tracking
├── DMA_Notes/            → DMA LLC project tracking
│   └── DMA Projects MOC.md → Map of Content for DMA projects
├── ALX_Notes/            → City of Alexandria work notes
├── Toastmasters/         → Toastmasters content
├── Templates/            → All templates live here
│   └── scripts/          → Templater templates with hotkeys
├── references/           → Wisdom sources & philosophical research
│   └── Wisdom Sources MOC.md → Map of Content for wisdom traditions
├── SynthCCD/             → Synthetic CAD data generator project
├── Reporting Engine/     → Reporting engine development notes
├── Cheatsheets/          → R/Python reference materials
├── Archive/              → Legacy content (foam_artefacts, etc.)
└── scripts/              → Templater user scripts
```

---

## Templates

Access with `Ctrl/Cmd + T` or via Command Palette → "Insert Template". Templater templates use hotkeys for quick access.

| Template | When to Use | Hotkey |
|----------|-------------|--------|
| **daily_journal_template** | Daily note with mood, habits, projects | Auto-triggered for journal/ |
| **daily_mood_log** | CBT mood tracking | `Alt+M` |
| **daily_reflection** | Evening reflection | `Alt+R` |
| **daily_tarot_reading** | Daily card pull | Via command palette |
| **habit_tracker** | Track daily habits | `Alt+H` |
| **personal_measurements** | Body measurements, metrics | `Alt+P` |
| **Book Review** | Finished a book | Via command palette |
| **Research Note** | Read a paper/article | Via command palette |
| **Research Project** | New research project | Via command palette |
| **Project Status** | DMA project update | Via command palette |
| **Meeting Note** | Any meeting | Via command palette |
| **blog_post_template** | Blog post with Quarto | `Alt+B` |
| **blog_idea_capture** | Quick blog idea | `Shift+Alt+B` |
| **toastmasters_meeting_template** | Toastmasters meetings | Via command palette |
| **toastmasters_speech_template** | Speech preparation | Via command palette |
| **weekly_reflection** | Weekly review | Via command palette |
| **annual_progress_review** | Yearly review | Via command palette |

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

Active DMA projects:
```dataview
TABLE status as "Status", last_updated as "Updated"
FROM "DMA_Notes"
WHERE type = "project-status"
SORT last_updated DESC
```

Research projects:
```dataview
TABLE status, start_date, methodology
FROM "Research"
WHERE type = "research-project"
SORT start_date DESC
```

Recent journal entries:
```dataview
TABLE creation date as "Date", workday as "Workday"
FROM "journal"
SORT file.name DESC
LIMIT 14
```

### Tasks

Track actionable items using checkbox syntax:

| Syntax | Meaning |
|--------|---------|
| `- [ ]` | Unfinished task |
| `- [x]` | Completed task |
| `- [ ] ⏫ YYYY-MM-DD` | Task with due date |
| `- [ ] 🔺` | Task with high priority |

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
2. Daily template auto-triggers with mood, habits, projects sections
3. Write freely — tasks, thoughts, notes
4. Link to other notes with `[[note name]]`
5. Review [[Journal Dashboard]] for patterns

### Research Session

1. Check [[Research MOC]] for existing projects and connections
2. Create new note in `Research/` (or subfolder for domain-specific work)
3. Apply **Research Project** template (for new projects) or **Research Note** (for reading)
4. Fill frontmatter: topic, hypothesis, methodology, status
5. Write findings below
6. Link to related notes: `[[168-Point Forecast Comparison - Discrete vs Continuous]]`
7. Update [[Research Dashboard]] with progress

### DMA Project Update

1. Check [[DMA Projects MOC]] for project overview
2. Open note in `DMA_Notes/` (or create new with **Project Status** template)
3. Update status, milestones, blockers
4. Add log entry with today's date
5. Link to related research if applicable

### Book Review

1. Finish book → create note in `Books/`
2. Apply **Book Review** template (or use Book Search plugin)
3. Rate it, write takeaways, link to related research
4. Query all books later with Dataview

### Wisdom Study

1. Browse [[Wisdom Sources MOC]] for traditions of interest
2. Read or re-read reference documents in `references/`
3. Connect insights to daily practice via journal templates
4. Link to Attitude Adjustment Project if applicable

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

### Research Project
```yaml
---
type: research-project
topic: ""
hypothesis: ""
methodology: ""
data_source: ""
start_date: ""
end_date: ""
status: ""
tags:
  - research
  - project
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
- `#research` `#time-series` `#forecasting` `#queueing` `#911` `#psap` — research
- `#project` `#status` `#dma` — DMA project tracking
- `#meeting` — meeting notes
- `#moc` — Map of Content files
- `#dashboard` — Dataview dashboard files
- `#journal` `#daily` `#reflection` — journal entries
- `#cbt` `#mood` `#habits` — mental health tracking
- `#wisdom` `#philosophy` `#psychology` `#spirituality` — wisdom sources

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

*Last updated: 2026-09-02*
