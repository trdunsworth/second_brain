---
type: guide
title: "Second Brain User Guide"
created: "2026-08-30"
tags:
  - guide
  - obsidian
---
**
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
├── Time Series/          → Forecasting reference notes (one topic per note) + Hub index
├── Statistical_Modeling/ → Stan & queueing theory (numbered stage notes)
├── Staffing/             → PSAP staffing model — feasibility → methods → forecasting
├── Synthetic_Data/       → Synthetic-data book research. See its README for scope
├── DMA_Notes/            → DMA LLC project tracking
│   └── DMA Projects MOC.md → Map of Content for DMA projects
├── ALX_Notes/            → City of Alexandria work notes
├── Toastmasters/         → Toastmasters content
├── Templates/            → All templates live here
│   └── scripts/          → Templater templates with hotkeys
├── references/           → Wisdom sources & philosophical research
│   └── Wisdom Sources MOC.md → Map of Content for wisdom traditions
├── SynthCCD/             → Synthetic CAD data generator project
├── Frankie/              → Frankie programming language, its book, and the .fk tree-sitter grammar
├── attitude_adjustment/  → Personal development project (git submodule; contains Kairos agent)
├── Reporting Engine/     → Reporting engine development notes
├── Cheatsheets/          → R/Python reference materials
├── Archive/              → Legacy content (foam_artefacts, etc.)
└── scripts/              → Templater user scripts
```

> **Folders with their own `README.md` index:** `Staffing/`, `SynthCCD/`, `Synthetic_Data/`,
> `Frankie/`, `Reporting Engine/`, `attitude_adjustment/`, plus the code-adjacent `Rust/`,
> `Linux/`, `Lisp` and `terminal_stuff/`. A folder README states that folder's **scope** — read
> one before filing a new note into an unfamiliar folder.

> ### Linking rules
>
> 1. A `[[wikilink]]` may only target a note **inside this vault**. Anything else — sibling git
>    repositories, external files, URLs — uses a markdown link (`[text](../../repo/file.md)`) or
>    a code span.
> 2. After a bulk folder move or rename, re-run the link audit. Moves break links silently;
>    writing does not. Method and current findings: [[Link Audit]].

---

## Templates

Access with `Ctrl/Cmd + T` or via Command Palette → "Insert Template". Templater templates use hotkeys for quick access.

| Template                          | When to Use                            | Hotkey                      |
| --------------------------------- | -------------------------------------- | --------------------------- |
| **daily_journal_template**        | Daily note with mood, habits, projects | Auto-triggered for journal/ |
| **daily_mood_log**                | CBT mood tracking                      | `Alt+M`                     |
| **daily_reflection**              | Evening reflection                     | `Alt+R`                     |
| **daily_tarot_reading**           | Daily card pull                        | Via command palette         |
| **habit_tracker**                 | Track daily habits                     | `Alt+H`                     |
| **personal_measurements**         | Body measurements, metrics             | `Alt+P`                     |
| **Book Review**                   | Finished a book                        | Via command palette         |
| **Research Note**                 | Read a paper/article                   | Via command palette         |
| **Research Project**              | New research project                   | Via command palette         |
| **Project Status**                | DMA project update                     | Via command palette         |
| **Meeting Note**                  | Any meeting                            | Via command palette         |
| **blog_post_template**            | Blog post with Quarto                  | `Alt+B`                     |
| **blog_idea_capture**             | Quick blog idea                        | `Shift+Alt+B`               |
| **toastmasters_meeting_template** | Toastmasters meetings                  | Via command palette         |
| **toastmasters_speech_template**  | Speech preparation                     | Via command palette         |
| **weekly_reflection**             | Weekly review                          | Via command palette         |
| **annual_progress_review**        | Yearly review                          | Via command palette         |

### Creating New Notes from Templates

1. `Ctrl/Cmd + N` → new note
2. `Ctrl/Cmd + T` → pick template
3. Fill in the frontmatter fields (the `---` block at the top)
4. Write your content below

### Which engine runs which template

Obsidian has **two** template engines and they do not understand each other's syntax. Putting a
template in the wrong one does not error — it pastes the raw markup.

| Template written in | Must be run by | Must **not** be referenced from |
| -------------------- | -------------- | -------------------------------- |
| `<% %>` / `tp.*`     | Templater      | core Daily Notes, core Templates |
| `{{ }}`              | core Templates | Templater, including startup templates |

So `daily_journal_template.md` is Templater's, and the core Daily Notes **template** field must
stay empty — Templater's folder trigger supplies it. Symmetrically, `daily_log_template.md` is
core syntax, so hotkeys should point at a `*_templater.md` twin; three still point at the core
file instead. See [[HOTKEYS]].

> ### If a daily note comes out empty
>
> Templater's **Trigger Templater on new file creation** must be on:
> *Settings → Templater → Trigger Templater on new file creation*.
>
> **This setting is not stored in the vault.** As of Templater 2.26.0 it lives in per-device
> localStorage, so it does not travel via git sync or GitHub Sync and does not survive a
> reinstall. On upgrade Templater deletes the old value from `data.json` without carrying it
> over and defaults it to **false**, so after any Templater version bump the folder trigger can
> die silently — new daily notes are created empty and nothing is reported. Check this box
> first whenever a new note fails to populate.

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

Unchecked `- [ ]` items under `## TODO` carry forward to the next day's note automatically.
Everything else starts empty. If the note opens blank, or full of literal `<% %>` / `{{ }}`
markup, see **Which engine runs which template** above.

**Weekday sections:** `## ALX Work` appears Monday–Friday only. Its absence on a weekend is
correct behaviour, not a failed template.

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

> **Rewritten 2026-10-14.** The vault previously carried three competing schemas
> (`type/status/date/topic`, `title/date_created/aliases`, `created/creator/sources`) across
> ~126 notes. This is now **one core schema with closed vocabularies**, plus type-specific
> extras. **Apply forward — do not backfill.** Older notes work fine as plain files; only a
> note you are actively editing needs converting.

### The core schema

Every vault note gets these five keys. Nothing else is universal.

```yaml
---
type: reference          # closed list, see below
status: active            # closed list, see below
topic: "One-line abstract — what this note is actually about."
created: 2026-10-14
updated: 2026-10-14       # only when you edit it
aliases:                  # only when these differ from the filename
  - Alternative Name
tags:
  - domain-tag
---
```

### Rules that matter

| Rule | Why |
|---|---|
| **No `title:`** | Obsidian already displays the filename (or H1). `title` drifts out of sync with both. The exception is a published work whose real title differs from the filename — book reviews, papers. |
| **One date field: `created:`** | Replaces both `date:` and `date_created:`. `updated:` is optional and only appears on edit. |
| **`topic:` is a full sentence** | It is the most useful field in the vault and the one most often wasted on a restatement of the filename. Compare `Staffing_Model_Reference` — good — against most others. |
| **`aliases:` is functional, not decorative** | It is what lets a differently-phrased link resolve to a real note — e.g. an alias of `Forecasting Accuracy` makes that link reach a file named `forecasting-metrics-and-botchkarev`. Omit it when the filename already works. |
| **Data tables and project READMEs get no frontmatter** | A 500 KB spells list is not a vault object. Headerless is correct there. |

### `type:` — closed list of nine

| Value | Use for |
|---|---|
| `moc` | Map of content, folder index, dashboard |
| `research-project` | An active project with a question and eventually a finding |
| `research-note` | A question you asked and answered |
| `practice` | A runnable exercise or worked example |
| `reference` | Durable lookup material you will consult repeatedly |
| `bibliography` | Annotated source list |
| `cheatsheet` | Fast lookup |
| `template` | Anything in `Templates/` |
| `capture` | Ad-hoc query result, interview note, inbox item |

Anything else is a new type — add it here first. Nineteen ad-hoc values was the old failure
mode, and it is what made the dashboards unreliable.

### `status:` — closed list of five

| Value | Meaning |
|---|---|
| `active` | Being worked on now |
| `draft` | Exists, not yet reviewed or finished |
| `parked` | Deliberately stopped, **resumable** — say where in the note body |
| `complete` | Done, no further work intended |
| `abandoned` | Killed. **Keep the note** — it records that you tried |

> `parked` and `abandoned` did not exist before this rewrite, and their absence is why
> finished work and abandoned work are indistinguishable. Adding them is the single
> cheapest improvement to how the vault reports on itself.

### Type-specific extras

These are legitimate *on top of* the core schema, not alternatives to it.

**Research project**

```yaml
hypothesis: ""
methodology: ""
data_source: ""
start_date: ""
end_date: ""
```

**Book review**

```yaml
author: ""
rating:
date_read: ""
genre: ""
```

**Ad-hoc query capture** (the `ad_hoc_query_template` family)

```yaml
creator: "LLM or person"
requestor: ""
sources: []
```

**Project status**

```yaml
project: ""
phase: ""
owner: ""
```

### Dataview queries that work under this schema

```dataview
LIST
FROM ""
WHERE type = "research-project" AND status = "active"
SORT start_date DESC
```

Note the `FROM ""` — searching the **whole vault** rather than one folder. The old
dashboard scoped to `"Research"` and therefore never saw `Staffing/`, `Synthetic_Data/`, or
anything else that mattered.

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
