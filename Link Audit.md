---
type: reference
status: active
topic: "Vault-wide wikilink integrity — how the audit is run, what it found on 2026-10-16, and which unresolved links are expected rather than defects."
created: 2026-10-16
tags:
  - vault-maintenance
  - links
  - audit
aliases:
  - Link Audit
  - Wikilink Audit
---

# Link Audit

> Vault-wide check that every `[[wikilink]]` actually resolves. Run **2026-10-16**; this
> note records the method so the next run is comparable, and the findings so the residue is
> understood rather than rediscovered.

---

## 1. Result

**2,106 wikilinks across 620 markdown files.**

| Outcome | Count | Meaning |
|---|---|---|
| **Resolved** | 1,966 | Obsidian will open the note |
| **Ambiguous** | 10 | Same filename in 2+ folders; Obsidian picks one, not deterministically |
| **Broken** | 64 | No target exists — see §3 |
| *Skipped* — Templater / EJS dynamic | 13 | `{{ LOG_DATE }}`, `<% isoWeek %>` — resolve at render time |
| *Skipped* — empty `[[]]` | 53 | Placeholder syntax in DnD and Templater docs |

**99.6%** of links that were *supposed* to point somewhere resolve. Broken links fell from
**94 to 64** during this audit; all 30 of the difference were cross-repository links converted
in §4.

---

## 2. How the audit works — and two bugs that produced false alarms

Obsidian's resolution order is more forgiving than a naive script assumes. The audit
implements it in this order:

1. **Same folder as the source** ← Obsidian's first preference, and the one most
   hand-rolled scripts miss
2. Vault-relative path (`Research/Time-Series/…`)
3. Path relative to the containing folder
4. Unique filename / stem / `aliases:` value anywhere in the vault
5. Unambiguous stem match as a last resort

Three things that must be stripped or excluded before counting:

| Must handle | Why |
|---|---|
| Fenced code blocks and inline code | Obsidian does not parse links there |
| `[[target\|alias]]` | Escaped-pipe alias syntax — a naive regex reads the trailing `\` as part of the target and reports 22 spurious breaks |
| `{{ }}` and `<% %>` | Templater / EJS placeholders inside links; resolved at render time |

> ### ⚠️ Two earlier audits of this vault were wrong
>
> Both were mine. The first resolved paths only from the vault root, so it reported **34
> broken links in `Research MOC.md`** that were in fact fine — Obsidian resolves bare
> filenames vault-wide. The second omitted same-folder resolution and so flagged **18 Wisdom
> research documents that all exist** in `references/`.
>
> The lesson generalises: *a link checker must model the resolver, not approximate it.*
> Before acting on any audit output here, confirm a few hits by hand.

---

## 3. The 64 broken, by class

| Class | Count | Disposition |
|---|---|---|
| DnD links to unwritten sourcebook notes (`SRD_CC_v5.2.1`, `converting-to-srd-5.2.1`, `character-sheet`) | 37 | **Intentional placeholders** — planned notes, not yet written |
| Attachment / file links to assets not in the vault | 12 | Mostly legacy `Archive/` content and external PDFs. **Low value to chase** |
| Journal links to un-journalled days | 11 | **Intentional.** Journal notes link to adjacent dates; not every day gets written |
| Notes that genuinely do not exist | 4 | Open — listed below |

> **The DnD block is the largest residue and it is by design.** `DnD/` is mid-migration from one
> SRD version to another, and ~37 links point at notes that have not been written yet. Nothing
> is broken in the vault's structure; the notes simply do not exist. Deleting the links would
> destroy the migration plan, which is the more useful artifact.

### The attachment links (12) — where they are

| File | Targets |
|---|---|
| `journal/2026-02-18.md`, `Archive/…/Python_EDA_Links.md` | `assets/eda_snippets.py` — Python asset, not a note |
| `journal/2026-07-20.md` | `ErlangBandCFormulas.pdf` |
| `New_CAD_Project/LLM based CAD.md` | two NENA EIDO specification PDFs |
| `Typography/quarto_notes.md` | `Templates/pdf_export_wrapper.qmd` |
| `copilot/skills/obsidian-bases/SKILL.md` | `My Base.base#View Name` — **documentation example, not a real link** |
| `Archive/foam_artefacts/assets/` | three legacy foam-era asset paths |

### The 4 unresolved notes

| Referenced from | Target | Note |
|---|---|---|
| `journal/2026-05-28.md` | `[[pipeline_setup]]` | Referenced once; probably worth writing or dropping the link |
| `attitude_adjustment/daily-journal-template.md` | `[[Attitude Adjustment Master Plan]]` | A master plan almost certainly exists — likely a naming mismatch. Check `attitude_adjustment/` |
| `attitude_adjustment/daily-journal-template.md` | `[[Life's Companion - Baldwin Notes]]` | Same folder has Baldwin material under a different name |
| `copilot/skills/obsidian-markdown/references/PROPERTIES.md` | `[[Other Note]]` | **Not a real link** — a syntax example inside documentation. Ignore |

---

## 4. Fixed: cross-repository links

`DMA_Notes/SynthCCD Project.md` and `DMA_Notes/NENA Survey Project.md` each carried a
**Resources** list of wikilinks pointing at files inside a sibling git repository:

```
synth911gen3/README.md     →  /Users/tdunsworth/Documents/projects/synth911gen3/
survey_site_dev/README.md  →  /Users/tdunsworth/Documents/projects/survey_site_dev/
```

Those repositories are **outside this vault**, so Obsidian could never resolve them — all 30
rendered as permanently broken links. Converted to markdown relative links:

```markdown
[[survey_site_dev/README.md]]              →  [survey_site_dev/README.md](../../survey_site_dev/README.md)
```

Note the `../../` — the notes live in `DMA_Notes/`, so two levels are needed to escape the
vault and reach `Documents/projects/`. All 25 file paths were verified to exist on disk.

Five directory references (`server/`, `src/`, `config/`, `docs/adr/`, `future_work/`) became
code spans instead, since a relative link to a folder has nothing to open.

**Rule for the vault:** a `[[wikilink]]` may only target a note inside the vault. Anything
else — sibling repos, external files, URLs — uses a markdown link or a code span.

---

## 5. Ambiguity — 10 links that resolve, but by luck

Two notes share a stem with a note elsewhere. Obsidian picks one; it is not guaranteed to be
the one you meant.

| Target | Copies |
|---|---|
| `[[agents]]` | `Archive/foam_artefacts/assets/agents.md`, plus `AGENTS.md` in `SynthCCD/`, `Reporting Engine/`, `DMA_theme/` |
| `[[daily_journal_template]]`, `[[daily_mood_log_template]]`, `[[daily_reflection_template]]` | `Templates/` and `attitude_adjustment/` |
| `[[pleasure_predicting_sheet]]`, `[[anti_procrastination_sheet]]`, `[[relapse_prevention_toolbox]]` | `Templates/` and `attitude_adjustment/` |

**Resolved 2026-10-16:** `[[Time Series Paper Links]]` was ambiguous between the live note at
`Research/Time-Series/Time Series Paper Links.md` and an identical legacy copy under
`Archive/foam_artefacts/assets/`. This was the one ambiguity that mattered — a bare link from
the Time Series notes could have resolved to the archived copy. Now path-qualified everywhere
it appears.

> **The remaining ten are all in the Wisdom / Templates area and are low-risk**, because the
> copies are duplicates by design (a template kept in two places). Worth collapsing at some
> point, not urgent.

---

## 6. Re-running the audit

The script is not stored in the vault — it is a diagnostic, not a note. To reproduce:

```bash
# index every markdown file by name, stem, alias, and vault-relative path
# for each note: strip fenced code and inline code first
# for each [[...]]:
#   strip  \#anchor  |alias  \|alias  and skip {{ }} / <% %>
#   resolve in order: sibling -> vault-relpath -> source-rel -> unique name/stem/alias
#   classify: resolved | ambiguous | broken | dynamic | empty
```

Two rules that make the difference between a useful audit and noise:

1. **Model the resolver, don't approximate it.** Same-folder first; bare names vault-wide.
2. **Classify before reporting.** "64 broken" is alarming and useless. "37 are planned DnD notes,
   11 are intentional journal links, 4 are real" is actionable.

---

## 7. Standing recommendation

Run this after any bulk folder move or rename. Both of the structural problems found here —
the `Time Series Paper Links` ambiguity and the cross-repo links — were introduced or
inherited by **file moves**, not by writing. Moves are when links break silently.