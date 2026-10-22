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

Your vault is organized around four pillars: **Daily Notes**, **Research**, **Projects**, and **Books**. Everything connects. Over time it has also grown project, code, and reference folders (see **Vault Structure** below).

---

## Vault Structure

```text
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
├── Inbox/                → Lightweight capture area + weekly triage
│   └── scripts/          → Templater templates with hotkeys
├── references/           → Wisdom sources & philosophical research
│   └── Wisdom Sources MOC.md → Map of Content for wisdom traditions
├── SynthCCD/             → Synthetic CAD data generator project
├── Frankie/              → Frankie programming language, its book, and the .fk tree-sitter grammar
├── Attitude Adjustment/  → Personal development project (goals, master plan, system analysis)
├── Agents/               → LLM agent development guides (Python, R, guardrails, personality)
├── Reporting Engine/     → Reporting engine development notes
├── Cheatsheets/          → R/Python reference materials
├── Archive/              → Legacy content (foam_artefacts, etc.)
├── Scripts/              → Templater user scripts, export helpers, Ollama utilities
├── Data_Sources/         → Data format notes (JSON, YAML, TOML, dbt, Databricks)
├── DnD/                  → D&D 5e reference, worldbuilding templates, SRD migration
├── Linux/                → Linux+ study notes
├── Lisp/                 → Lisp notes
├── Rust/                 → Rust notes
├── terminal_stuff/       → Terminal/shell reference
├── Typography/           → Publishing/typography pipeline notes
├── blog/                 → Blog posts
├── Readings/             → Reading notes
├── Reflections/          → Reflection notes
├── Politics/             → Politics notes
├── Visualizations/       → Visualization notes
├── StatLang/             → Statistical language notes
├── New_CAD_Project/      → New CAD project notes
├── DECC Reporting Project/→ DECC reporting project notes
├── duckdb-lab/           → DuckDB lab (SQL, reports, visuals)
├── julia-eda-lab/        → Julia EDA lab
├── quarto-lab/           → Quarto lab
├── computer_links/       → Computer/link reference notes
├── copilot/              → Copilot skills and notes
├── DMA_theme/            → DMA theme assets
└── .agents/, .claude/, .copilot/, .opencode/ → Agent/tooling configuration (not vault content)
```

> **Folders with their own `README.md` index:** every top-level folder now has a `README.md`
> stating its scope (added 2026-10-22). Read one before filing a new note into an unfamiliar
> folder. Folders that already had richer indexes (`Agents/`, `DMA_theme/`, `Frankie/`,
> `Linux/`, `Lisp/`, `Reporting Engine/`, `Rust/`, `Staffing/`, `SynthCCD/`,
> `Synthetic_Data/`, `terminal_stuff/`) keep their original content.

> ### Linking rules
>
> 1. A `[[wikilink]]` may only target a note **inside this vault**. Anything else — sibling git
>    repositories, external files, URLs — uses a markdown link (`[text](../../repo/file.md)`) or
>    a code span.
> 2. After a bulk folder move or rename, re-run the link audit. Moves break links silently;
>    writing does not. Method and current findings: [[Link Audit]].

---

## Templates

Access with `Ctrl/Cmd + T` or via Command Palette → "Insert Template". Templater templates use hotkeys for quick access. Hotkeys below come from [[HOTKEYS]].

| Template                          | When to Use                            | Hotkey / Access |
| --------------------------------- | -------------------------------------- | --------------- |
| **daily_journal_template**        | Daily note with mood, habits, projects | Auto-triggered for `journal/` |
| **daily_log_template** (templater) | Full daily driver (comprehensive)      | `Alt+T` |
| **daily_mood_log**                | CBT mood tracking                      | `Alt+M` |
| **daily_reflection**              | Evening reflection                     | `Alt+Shift+R` |
| **daily_tarot_reading**           | Daily card pull                        | Via command palette |
| **one_card_tarot_reading**         | Single-card pull                       | Via command palette |
| **habit_tracker**                 | Track daily habits                     | `Alt+H` |
| **personal_measurements**         | Body measurements, metrics             | `Alt+P` |
| **personal_measurements (quick)** | Numeric-only quick capture             | `Alt+Shift+P` |
| **Book Review**                   | Finished a book                        | Via command palette |
| **Research Note**                 | Read a paper/article                   | Via command palette |
| **Research Project**              | New research project                   | Via command palette |
| **Project Status**                | DMA project update                     | Via command palette |
| **Meeting Note**                  | Any meeting                            | Via command palette |
| **blog_post_template**            | Blog post with Quarto                  | `Alt+B` (core syntax — see note) |
| **blog_post_nocode_template**     | Blog post without code                 | Via command palette |
| **blog_idea_capture**             | Quick blog idea                        | `Shift+Alt+B` (templater) / `Mod+Shift+B` (core) |
| **toastmasters_meeting_template** | Toastmasters meetings                  | Via command palette |
| **toastmasters_speech_template**  | Speech preparation                     | Via command palette |
| **toastmasters_training_attendance_report_template** | Training attendance report | Via command palette |
| **weekly_reflection**             | Weekly review                          | Via command palette |
| **annual_progress_review**        | Yearly review                          | Via command palette |
| **ad_hoc_query_template**         | Ad-hoc query capture                   | Via command palette |
| **anti_procrastination_sheet**    | Anti-procrastination worksheet          | Via command palette |
| **pleasure_predicting_sheet**     | Pleasure prediction worksheet          | Via command palette |
| **relapse_prevention_toolbox**    | Relapse prevention toolbox             | Via command palette |
| **attitude_adjustment_goals**     | Attitude Adjustment goal list          | Via command palette |

> **Hotkey status (updated 2026-10-22):** the three previously-broken bindings
> (`Alt+Mod+N`, `Alt+B`, `Mod+Shift+B`) have been rebound to their `*_templater.md` twins.
> Legacy core `{{ }}` files are no longer bound. If you add a new binding, point it at a
> `*_templater.md` file.

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

## Daily Journal Template — Sections and Prompts

The daily journal template (`Templates/scripts/daily_journal_template.md`) is Templater-driven and
auto-triggers for new notes in `journal/`. It asks a short set of questions up front, then
optionally embeds other templates (each with its own prompts). Unchecked `- [ ]` items under
`## TODO` carry forward from the previous day's note automatically.

### Top-level sections

| Section | Notes |
|---|---|
| Frontmatter | `creation date`, `modification date`, `author`, `title`, `workday` (default false), `tags` |
| Tag prompt | `Select primary tag for today:` → work, personal, research, dma, toastmasters, reflection, wins, challenges |
| `# <date>` | Heading with full weekday/date |
| `## Starting Notes` | Cursor placed here for free writing |
| `## ALX Work` | **Weekdays only** (Mon–Fri). Its absence on a weekend is correct. |
| `## DMA Work` | Empty — fill in |
| `## TI Work` | Empty — fill in |
| `## NENA Work` | Empty — fill in |
| `## TODO` | Carried-forward unchecked items + one blank `- [ ]` |
| `## Daily Mood Log` | Optional embed (prompt: `Include Daily Mood Log?` Yes/No) |
| `## Project Updates` | Empty — fill in |
| `## Research Projects` | Empty — fill in |
| `## Habit Tracker` | Optional embed (prompt: `Include Habit Tracker?` Yes/No) |
| `## Daily Reflection` | Optional embed (prompt: `Include Daily Reflection?` Yes/No) |
| `## Daily Tarot Reading - <date>` | Optional embed (prompt: `Include full Tarot reading template?` Yes/No) |
| `## Blog Post Ideas` | Optional embed (prompt: `Include Blog Idea Capture template?` Yes/No) |
| `## Personal Measurements` | Optional embed (prompt: `Include Personal Measurements?` Yes/No) |
| `### Interesting Links.` | Empty — fill in |

### Optional embed prompts

**Daily Mood Log** (`daily_mood_log_template_templater.md`) — TEAM-CBT (Burns). Prompts:
- `Number of entries (1-3):` (suggester)
- Per entry (×1–3):
  - `Entry N Time (HH:MM):`
  - `Entry N Situation:`
  - `Entry N Sad/Anxious/Angry/Guilty/Hopeless/Ashamed/Other Emotion (0-100%):`
  - `Entry N Automatic Thoughts (one per line):`
  - `Entry N Select distortions (multiple):` (11 distortions)
  - `Entry N Positive Reframe:`
  - `Entry N Evidence For:` / `Evidence Against:` / `Balanced Alternative:`
  - `Entry N Re-rated Sad/… (0-100%):`
- Daily Summary: `Total Entries:`, `Avg Pre-Mood (%):`, `Avg Post-Mood (%):`, `Avg Improvement (%):`, `Most Frequent Distortion:` (suggester), `Most Helpful Technique:`, `Values Touched Today:`
- Resistance Check: `Resistance Exploration:`
- Tomorrow's Intention: `Tomorrow's Behavioral Experiment:`, `Predicted Difficulty (0-100%):`, `Predicted Satisfaction (0-100%):`

**Habit Tracker** (`habit_tracker_template_templater.md`) — prompts:
- `Core Habits (one per line with status):`
- `Personal Growth Habits (one per line with status):`
- `Wellness Habits (one per line with status):`
- `Professional Habits (one per line with status):`
- `Daily Goals Table Rows (format: | Habit Name | [ ] | Notes | 5 |):`
- `Detailed Habit Notes:`
- `Today's Focus:`
- `Challenges:` / `Wins:`
- `Energy Level:` (suggester) / `Mood:` (suggester) / `Energy & Mood Notes:`
- `Priority 1:` / `Priority 2:` / `Priority 3:`
- `Gratitude Notes:`
- `Tomorrow's Habits:`

**Daily Reflection** (`daily_reflection_template_templater.md`) — prompts:
- `Select Goal:` (from `Templates/scripts/attitude_adjustment_goals.md`)
- `Progress Level:` (Low/Medium/High/Complete)
- `Daily Tasks (one per line):`
- `This Week's Focus:`
- `Weekly Actions (one per line):`
- `Challenges:` / `Wins:`
- `Future Notes:`
- `Related Goals & Sources:`

**Daily Tarot Reading** (`daily_tarot_reading_template_templater.md`) — prompts:
- `Today's Core Question:`
- `Theme Card:` / `Theme Meaning:` / `Select relevant goals (multiple):`
- `Guidance Card:` / `Guidance Meaning:` / `Action Required:`
- `Challenge Card:` / `Challenge Meaning:` / `Prevention Strategy:`
- `Opportunity Card:` / `Opportunity Meaning:` / `How to Capture:`
- `Immediate Insights:` / `Action Steps:` / `Meditation Integration:`
- `Tomorrow's Focus 1:` / `Tomorrow's Focus 2:`
- `Journal Entry:`

**Blog Idea Capture** (`blog_idea_capture_template_templater.md`) — prompts:
- `Blog Post Title:` (used in frontmatter + heading)
- `Additional Tags (comma-separated):`
- `Hook / Opening Angle:`
- `Core Idea:`
- `Urgency Rationale:`
- `Section 1 - Hook:` … `Section 8 - Next Steps:`
- `Immediate Next Actions:`
- `Target Publish Date (YYYY-MM-DD):`
- `Estimated Word Count:`
- `Series (if any):`

**Personal Measurements** (`personal_measurements_template_templater.md`) — prompts by domain:
- Husband: `Husband - Emotional Connection Weekly Target:`, `Husband - Communication Improvements:`, `Husband - Quality Time Current/Goal (hours/week):`, `Husband - Quality Time Activities:`, `Husband - Balance Assessment Method:`
- Patience: `Patience Stressors:`, `Patience Response Techniques:`
- Focus: `Focus Capacity Current/Goal (minutes):`, `Focus Daily Average:`, `Focus Distraction Management:`
- Meditation: `Meditation Current/Goal (minutes/day):`, `Meditation Methods:`, `Meditation Progress Indicators:`
- Mood: `Mood Triggers:`, `Mood Boosters:`
- Empathy: `Empathy Practices:`
- Leadership: `Leadership Skills to Develop:`, `Leadership Delegation:`, `Speaking Opportunities:`, `Feedback Approaches:`
- Technical: `Technical Skills to Master:`, `Industry Knowledge Sources:`, `Networking Activities:`
- Learning: `Learning Capacity Current/Goal (hours/week):`, `Learning Methods:`, `Research Areas of Focus:`, `Application Examples:`

> Tip: you can re-run any single template later with its hotkey or via Command Palette → "Insert Template"
> without re-running the whole daily journal.

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

### Other installed plugins

`calendar`, `templater-obsidian`, `github-sync`, `markdown-blogger`, `open-vscode`,
`obsidian-linter`, `obsidian-pandoc`, `obsidian-timestamper`, `code-styler`,
`obsidian-advanced-codeblock`, `obsidian-booknote-plugin`, `epub-reader-highlighter`,
`obsidian-enhancing-export`, `harper`, `awesome-format-bar`, `carve`,
`obsidian-style-settings`. See each plugin's settings for configuration; most need no
vault-level documentation.

---

## Workflows

### Daily Journal

1. Click "Open today's daily note" (calendar icon in ribbon)
2. Daily template auto-triggers with mood, habits, projects sections
3. Complete the optional Yes/No prompts (mood log, habit tracker, reflection, tarot, blog ideas, measurements)
4. Write freely — tasks, thoughts, notes
5. Link to other notes with `[[note name]]`
6. Review [[Journal Dashboard]] for patterns

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

### Capture & Triage

1. Drop quick notes/clippings into `Inbox/` (use **ad_hoc_query_template** for structured captures)
2. Once a week, open `Inbox/Weekly Triage.md`
3. File, promote, or delete each item; add frontmatter before filing

---

1. After any bulk folder move or rename, re-run the audit described in [[Link Audit]]
2. Keep `[[wikilink]]` targets inside the vault; use markdown links for sibling repos/external files
3. Confirm ambiguous filename matches by hand before acting on audit output

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

### Finding legacy / non-conforming notes

```dataview
TABLE file.link AS "Note", type, status
FROM ""
WHERE !type OR !status OR !topic OR !created
SORT file.mtime DESC
```

And for notes still carrying the old schemas:

```dataview
TABLE file.link AS "Note", title, date, date_created
FROM ""
WHERE title OR date OR date_created
SORT file.mtime DESC
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
| Insert Habit Tracker | `Alt+H` |
| Insert Daily Mood Log | `Alt+M` |
| Insert Personal Measurements | `Alt+P` |
| Insert Daily Reflection | `Alt+Shift+R` |
| Insert Full Daily Log | `Alt+T` |
| Insert Blog Idea Capture | `Shift+Alt+B` (templater) |

See [[HOTKEYS]] for the full hotkey table and known misbindings.

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
- `#agents` — LLM agent notes

---

## Tips

1. **Link liberally.** `[[Note Name]]` creates connections. The graph view rewards this.
2. **Frontmatter matters.** Dataview queries it. Keep fields consistent.
3. **One idea per note.** Easier to link, easier to find.
4. **Review weekly.** Open Dataview queries, check what's stale, update status.
5. **Don't over-organize.** Tags and links beat deep folder hierarchies.
6. **Check the Templater trigger flag** after any Templater upgrade (see Troubleshooting).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Dataview shows raw code | Restart Obsidian |
| Template not appearing | Check `Templates/` folder in settings |
| Plugin not loading | Settings → Community Plugins → enable it |
| Notes not syncing | Check `github-sync` plugin config |
| New daily note comes out empty | Settings → Templater → enable **Trigger Templater on new file creation** (per-device; not synced) |
| Raw `<% %>` or `{{ }}` in a new note | Wrong engine ran it — see **Which engine runs which template** |
| A hotkey inserts raw `{{ }}` | It is bound to a core-syntax file; rebind to the `*_templater.md` twin (see [[HOTKEYS]]) |

---

*Last updated: 2026-10-22*
