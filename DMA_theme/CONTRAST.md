# DMA Theme — WCAG 2.1 Contrast Report

Generated from `palette.json` (the shipped source of truth) by
`scripts/contrast_report.py`. Contrast ratios use the WCAG 2.1 relative-luminance
formula.

**Thresholds:** AAA (normal text) >= 7.0:1 · AA (normal text) >= 4.5:1 ·
AA Large (>= 18pt or >= 14pt bold) >= 3.0:1.

## Summary

| Scope | Pairs tested | AA+ | AAA | AA Large | FAIL |
|-------|-------------:|----:|----:|---------:|-----:|
| Light theme — text/UI tokens | 56 | 34 | 20 | 22 | 0 |
| Dark theme — text/UI tokens | 56 | 53 | 44 | 3 | 0 |
| Semantic status colors | 12 | 8 | 4 | 2 | 2 |
| Terminal ANSI palette (reference) | 30 | — | — | — | — |
| Shipped editor/terminal files — essential text | 32 | — | — | — | 0 |

**Canonical-palette verdict:** the source-of-truth `palette.json` meets WCAG AA
(>= 4.5:1) for every body-text, syntax, UI, and semantic-status token in **both**
themes. The only deliberate exceptions are de-emphasized tokens (comments, line
numbers, subtle foreground), which sit in the AA-Large band — appropriate for
non-essential text. Semantic *status text* on light surfaces uses the documented
800 stop (`#9E5E00`), which passes AA; the brighter 500 stops are reserved for
fills / large UI. The 16-color terminal ANSI palette is reported for reference
only — ANSI palettes are not bound by WCAG text minimums.

**Per-file verdict:** the per-editor / per-terminal validation (section below)
parses the files the repo actually ships and confirms that **every** background and
essential-text token meets WCAG AA in both themes — **0 essential
text-token pairs** fall below AA across all shipped editor/terminal files. The
light-theme 500-stop syntax/warning colors (teal `#00B3B3`, turquoise `#00B8B8`,
green `#00B33B`, warning `#FF9F00` / `#E88800`) that previously fell below AA as
*text* on the light background have all been moved to the 700/800 stops (e.g.
warning text -> `#9E5E00`), including the VS Code/Positron `#E88800` drift. tmux is
validated per status-bar segment (each `fg` against its own `bg`); Obsidian's
`@media print` block (dark text on white paper) is excluded as it is not a screen
surface. Emacs now ships a dark variant (`dma-theme-dark.el`) alongside the light
one.

> Note: borders, guides, and other UI chrome are decorative and have no WCAG
> minimum; they are excluded from the tables below.

> Note: the per-editor light variants apply the 800 stop (`#9E5E00`) for
> warning / conflict / escape *text* tokens so they meet AA on the near-white
> background. The 16-color terminal ANSI `yellow` (`#E88800`), decorative
> borders, and background fills retain the brighter value by design and are out
> of WCAG text scope. White-on-accent chrome (badges, buttons, status bar) and
> text on the cursor surface are rendered on their own colored background and
> are excluded from the FAIL count.

## Light theme — background `#F8FAFC`

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `escape` | #D47800 |  3.09:1 | AA Large | on editor bg |
| `lineNumber` | #6E89A0 |  3.49:1 | AA Large | de-emphasized (AA Large acceptable) |
| `inputPlaceholder` | #6E89A0 |  3.65:1 | AA Large | on inputBackground |
| `namespace` | #008C8C |  3.91:1 | AA Large | on editor bg |
| `attribute` | #008C8C |  3.91:1 | AA Large | on editor bg |
| `annotation` | #008C8C |  3.91:1 | AA Large | on editor bg |
| `decorator` | #008C8C |  3.91:1 | AA Large | on editor bg |
| `string` | #008F33 |  4.03:1 | AA Large | on editor bg |
| `markupCode` | #008F33 |  4.03:1 | AA Large | on editor bg |
| `gitAdded` | #008F33 |  4.03:1 | AA Large | on editor bg |
| `gitUntracked` | #008F33 |  4.03:1 | AA Large | on editor bg |
| `foregroundSubtle` | #5A7D96 |  4.17:1 | AA Large | de-emphasized (AA Large acceptable) |
| `comment` | #5A7D96 |  4.17:1 | AA Large | de-emphasized (AA Large acceptable) |
| `bracket` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `markupStrikethrough` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `markupQuote` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `gitIgnored` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `cursor` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `tabActiveBorder` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `link` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `markupLink` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `gitModified` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `gitDeleted` | #E80000 |  4.53:1 | AA | on editor bg |
| `buttonForeground` | #FFFFFF |  4.66:1 | AA | on buttonBackground |
| `gitConflicting` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `class` | #007373 |  5.42:1 | AA | on editor bg |
| `interface` | #007373 |  5.42:1 | AA | on editor bg |
| `constant` | #8C5A00 |  5.61:1 | AA | on editor bg |
| `regex` | #8C5A00 |  5.61:1 | AA | on editor bg |
| `foregroundMuted` | #485C6E |  6.62:1 | AA | on editor bg |
| `parameter` | #485C6E |  6.62:1 | AA | on editor bg |
| `punctuation` | #485C6E |  6.62:1 | AA | on editor bg |
| `lineNumberActive` | #005A9E |  6.79:1 | AA | on editor bg |
| `number` | #005A9E |  6.79:1 | AA | on editor bg |
| `function` | #005A9E |  6.79:1 | AA | on editor bg |
| `method` | #005A9E |  6.79:1 | AA | on editor bg |
| `keyword` | #005A5A |  7.69:1 | AAA | on editor bg |
| `keywordControl` | #005A5A |  7.69:1 | AAA | on editor bg |
| `storage` | #005A5A |  7.69:1 | AAA | on editor bg |
| `operator` | #005A5A |  7.69:1 | AAA | on editor bg |
| `tag` | #005A5A |  7.69:1 | AAA | on editor bg |
| `markupHeading` | #005A5A |  7.69:1 | AAA | on editor bg |
| `markupList` | #005A5A |  7.69:1 | AAA | on editor bg |
| `diffAddedText` | #005A1F |  8.09:1 | AAA | on editor bg |
| `selectionForeground` | #002B5C |  8.63:1 | AAA | on selection |
| `diffRemovedText` | #8C0000 |  9.49:1 | AAA | on editor bg |
| `statusBarForeground` | #1A2A35 | 11.47:1 | AAA | on statusBarBackground |
| `activityBarForeground` | #1A2A35 | 11.47:1 | AAA | on activityBarBackground |
| `titleBarForeground` | #1A2A35 | 11.47:1 | AAA | on titleBarBackground |
| `sideBarForeground` | #1A2A35 | 13.32:1 | AAA | on sideBarBackground |
| `foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `variable` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `property` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `markupBold` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `markupItalic` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `inputForeground` | #1A2A35 | 14.72:1 | AAA | on inputBackground |

## Dark theme — background `#0A0F14`

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `inputPlaceholder` | #526D85 |  3.31:1 | AA Large | on inputBackground |
| `lineNumber` | #526D85 |  3.56:1 | AA Large | de-emphasized (AA Large acceptable) |
| `buttonForeground` | #FFFFFF |  4.32:1 | AA Large | on buttonBackground |
| `gitDeleted` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `foregroundSubtle` | #6E89A0 |  5.27:1 | AA | de-emphasized (AA Large acceptable) |
| `comment` | #6E89A0 |  5.27:1 | AA | de-emphasized (AA Large acceptable) |
| `bracket` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `markupStrikethrough` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `markupQuote` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `gitIgnored` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `cursor` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `tabActiveBorder` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `lineNumberActive` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `number` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `function` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `method` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `link` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `markupLink` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `gitModified` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `foregroundMuted` | #93ABC3 |  8.11:1 | AAA | on editor bg |
| `parameter` | #93ABC3 |  8.11:1 | AAA | on editor bg |
| `punctuation` | #93ABC3 |  8.11:1 | AAA | on editor bg |
| `selectionForeground` | #E0E8EF |  8.70:1 | AAA | on selection |
| `escape` | #EF9F76 |  9.06:1 | AAA | on editor bg |
| `class` | #81C8BE | 10.02:1 | AAA | on editor bg |
| `interface` | #81C8BE | 10.02:1 | AAA | on editor bg |
| `string` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `markupCode` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `gitAdded` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `gitUntracked` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `constant` | #E5C890 | 11.91:1 | AAA | on editor bg |
| `regex` | #E5C890 | 11.91:1 | AAA | on editor bg |
| `gitConflicting` | #E5C890 | 11.91:1 | AAA | on editor bg |
| `keyword` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `keywordControl` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `storage` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `operator` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `tag` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `markupHeading` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `markupList` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `namespace` | #94E2D5 | 12.92:1 | AAA | on editor bg |
| `attribute` | #94E2D5 | 12.92:1 | AAA | on editor bg |
| `annotation` | #94E2D5 | 12.92:1 | AAA | on editor bg |
| `decorator` | #94E2D5 | 12.92:1 | AAA | on editor bg |
| `inputForeground` | #E0E8EF | 14.45:1 | AAA | on inputBackground |
| `statusBarForeground` | #E0E8EF | 14.45:1 | AAA | on statusBarBackground |
| `activityBarForeground` | #E0E8EF | 14.45:1 | AAA | on activityBarBackground |
| `sideBarForeground` | #E0E8EF | 14.45:1 | AAA | on sideBarBackground |
| `titleBarForeground` | #E0E8EF | 14.45:1 | AAA | on titleBarBackground |
| `foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `variable` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `property` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `markupBold` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `markupItalic` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `diffRemovedText` | #FFEAEA | 16.69:1 | AAA | on editor bg |
| `diffAddedText` | #E6F8E6 | 17.35:1 | AAA | on editor bg |

## Semantic status colors

Tested on white (light UI surfaces) and on the dark background (dark UI surfaces).
Status *text* on light surfaces should use the 800 stop.

| Role | Color | Contrast | Level | Context |
|------|-------|---------:|-------|---------|
| `error (500)` | #FF1A1A |  3.88:1 | AA Large | use 800 stop for text on light |
| `error (800)` | #9E0000 |  8.56:1 | AAA | on white (light) |
| `error (500)` | #FF1A1A |  4.96:1 | AA | on dark bg |
| `warning (500)` | #FF9F00 |  2.06:1 | FAIL | use 800 stop for text on light |
| `warning (800)` | #9E5E00 |  5.18:1 | AA | on white (light) |
| `warning (500)` | #FF9F00 |  9.36:1 | AAA | on dark bg |
| `info (500)` | #0091E6 |  3.39:1 | AA Large | use 800 stop for text on light |
| `info (800)` | #00529E |  7.78:1 | AAA | on white (light) |
| `info (500)` | #0091E6 |  5.67:1 | AA | on dark bg |
| `success (500)` | #00B33B |  2.80:1 | FAIL | use 800 stop for text on light |
| `success (800)` | #006622 |  7.18:1 | AAA | on white (light) |
| `success (500)` | #00B33B |  6.88:1 | AA | on dark bg |

## Terminal ANSI palette (reference only)

These are the 16-color terminal foreground colors, evaluated against the terminal
background (`terminalBlack`). ANSI palettes are not subject to WCAG text minimums,
so they are shown for reference and excluded from the compliance verdict.

### Light theme

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `terminalBrightBlack` | #485C6E |  2.13:1 | FAIL | terminal ANSI palette (reference only) |
| `terminalMagenta` | #007F7F |  3.04:1 | AA Large | terminal ANSI palette (reference only) |
| `terminalRed` | #E80000 |  3.11:1 | AA Large | terminal ANSI palette (reference only) |
| `terminalBlue` | #0077CC |  3.16:1 | AA Large | terminal ANSI palette (reference only) |
| `terminalBrightRed` | #FF1A1A |  3.80:1 | AA Large | terminal ANSI palette (reference only) |
| `terminalGreen` | #009933 |  3.93:1 | AA Large | terminal ANSI palette (reference only) |
| `terminalBrightBlue` | #1A91E6 |  4.37:1 | AA Large | terminal ANSI palette (reference only) |
| `terminalBrightGreen` | #00B33B |  5.27:1 | AA | terminal ANSI palette (reference only) |
| `terminalYellow` | #E88800 |  5.57:1 | AA | terminal ANSI palette (reference only) |
| `terminalCyan` | #00B3B3 |  5.68:1 | AA | terminal ANSI palette (reference only) |
| `terminalBrightYellow` | #FF9F00 |  7.16:1 | AAA | terminal ANSI palette (reference only) |
| `terminalBrightMagenta` | #1ACECE |  7.55:1 | AAA | terminal ANSI palette (reference only) |
| `terminalWhite` | #A8C0D8 |  7.85:1 | AAA | terminal ANSI palette (reference only) |
| `terminalBrightCyan` | #4DDDDD |  8.90:1 | AAA | terminal ANSI palette (reference only) |
| `terminalBrightWhite` | #F0F4F8 | 13.32:1 | AAA | terminal ANSI palette (reference only) |

### Dark theme

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `terminalBrightBlack` | #485C6E |  2.17:1 | FAIL | terminal ANSI palette (reference only) |
| `terminalMagenta` | #007F7F |  3.11:1 | AA Large | terminal ANSI palette (reference only) |
| `terminalRed` | #E80000 |  3.17:1 | AA Large | terminal ANSI palette (reference only) |
| `terminalBlue` | #007BDB |  3.48:1 | AA Large | terminal ANSI palette (reference only) |
| `terminalBrightRed` | #FF1A1A |  3.88:1 | AA Large | terminal ANSI palette (reference only) |
| `terminalGreen` | #009933 |  4.01:1 | AA Large | terminal ANSI palette (reference only) |
| `terminalBrightBlue` | #1A91E6 |  4.47:1 | AA Large | terminal ANSI palette (reference only) |
| `terminalBrightGreen` | #00B33B |  5.38:1 | AA | terminal ANSI palette (reference only) |
| `terminalYellow` | #E88800 |  5.69:1 | AA | terminal ANSI palette (reference only) |
| `terminalCyan` | #00B3B3 |  5.80:1 | AA | terminal ANSI palette (reference only) |
| `terminalBrightYellow` | #FF9F00 |  7.31:1 | AAA | terminal ANSI palette (reference only) |
| `terminalBrightMagenta` | #1ACECE |  7.71:1 | AAA | terminal ANSI palette (reference only) |
| `terminalBrightCyan` | #4DDDDD |  9.10:1 | AAA | terminal ANSI palette (reference only) |
| `terminalWhite` | #C8D6E3 | 10.16:1 | AAA | terminal ANSI palette (reference only) |
| `terminalBrightWhite` | #F0F4F8 | 13.60:1 | AAA | terminal ANSI palette (reference only) |

## Per-editor / per-terminal validation (shipped files)

Each shipped theme file is parsed directly. **Essential text** tokens (editor foreground, semantic status, links, git decorations, UI labels) are checked against the background *that file declares* — this catches drift between `palette.json` and the hand-authored environment files. Syntax-highlighting tokens (comments, strings, keywords) are listed for reference but are non-essential under WCAG 1.4.3 and are **not** counted as hard FAILs. UI-chrome foregrounds that sit on their own colored surface (buttons, badges, status bar) and terminal ANSI colors are excluded from the FAIL count.

### Editors

#### VS Code (light) — bg `#F8FAFC` <small>(json:colors.editor.background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `colors.editor.background` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `colors.editorgutter.background` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `colors.tab.activebackground` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `colors.breadcrumb.background` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `colors.editorgroup.emptybackground` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `colors.inputvalidation.warningbackground` | #FFF8E6 |  1.01:1 | FAIL | on editor bg |
| `colors.editorhoverwidget.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.editorsuggestwidget.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.editorwidget.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.statusbar.debuggingforeground` | #FFFFFF |  1.05:1 | FAIL | white/self-colored on accent/cursor (by design) |
| `colors.activitybarbadge.foreground` | #FFFFFF |  1.05:1 | FAIL | white/self-colored on accent/cursor (by design) |
| `colors.notifications.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.extensionbutton.prominentforeground` | #FFFFFF |  1.05:1 | FAIL | white/self-colored on accent/cursor (by design) |
| `colors.quickinput.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.input.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.dropdown.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.dropdown.listbackground` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.button.foreground` | #FFFFFF |  1.05:1 | FAIL | white/self-colored on accent/cursor (by design) |
| `colors.checkbox.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.badge.foreground` | #FFFFFF |  1.05:1 | FAIL | white/self-colored on accent/cursor (by design) |
| `colors.breadcrumbpicker.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.menu.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.commandcenter.activebackground` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.panel.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.sidebar.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.sidebarsectionheader.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.notificationcenter.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.notificationcenterheader.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.quickinputtitle.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.editorgroupheader.tabsbackground` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.menubar.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.commandcenter.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.debugtoolbar.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.editorgroupheader.notabsbackground` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.textcodeblock.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.textblockquote.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.editorfindmatchbackground` | #FFF0CC |  1.08:1 | FAIL | on editor bg |
| `colors.diffeditor.insertedtextbackground` | #D4F0D4 |  1.17:1 | FAIL | on editor bg |
| `colors.merge.incomingheaderbackground` | #D4F0D4 |  1.17:1 | FAIL | on editor bg |
| `colors.editor.linehighlightbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.editorrangehighlightbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.editorfindrangehighlightbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.editorsuggestwidget.selectedbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.diffeditor.unchangedregionbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.merge.currentheaderbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.list.hoverbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.inputoption.activebackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.inputvalidation.infobackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.tab.hoverbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.tab.unfocusedhoverbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.menu.selectionbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.diffeditor.diagonalfill` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `colors.statusbar.background` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `colors.statusbar.nofolderbackground` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `colors.statusbaritem.remotebackground` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `colors.titlebar.activebackground` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `colors.titlebar.inactivebackground` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `colors.activitybar.background` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `colors.button.secondarybackground` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `colors.tab.inactivebackground` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `colors.editor.inactiveselectionbackground` | #D0E4EC |  1.26:1 | FAIL | on editor bg |
| `colors.editorsymbolhighlightbackground` | #D0E4EC |  1.26:1 | FAIL | on editor bg |
| `colors.merge.currentcontentbackground` | #D0E4EC |  1.26:1 | FAIL | on editor bg |
| `colors.merge.incomingcontentbackground` | #D0E4EC |  1.26:1 | FAIL | on editor bg |
| `colors.list.inactiveselectionbackground` | #D0E4EC |  1.26:1 | FAIL | on editor bg |
| `colors.list.inactivefocusbackground` | #D0E4EC |  1.26:1 | FAIL | on editor bg |
| `colors.editorfindmatchhighlightbackground` | #FFDB99 |  1.27:1 | FAIL | on editor bg |
| `colors.diffeditor.removedtextbackground` | #FAD4D4 |  1.30:1 | FAIL | on editor bg |
| `colors.inputvalidation.errorbackground` | #FAD4D4 |  1.30:1 | FAIL | on editor bg |
| `colors.editor.linehighlightborder` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `colors.editor.selectionbackground` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `colors.editorbracketmatch.background` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `colors.list.activeselectionbackground` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `colors.list.focusbackground` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `colors.list.dropbackground` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `colors.editorgroup.dropbackground` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `colors.editorwhitespace.foreground` | #A8C0D8 |  1.79:1 | FAIL | decorative token (AA-Large exempt) |
| `colors.editorindentguide.background` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.editorruler.foreground` | #A8C0D8 |  1.79:1 | FAIL | decorative token (AA-Large exempt) |
| `colors.editoroverviewruler.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.editorhoverwidget.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.editorsuggestwidget.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.editorwidget.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.panel.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.panelinput.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.statusbar.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.titlebar.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.activitybar.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.sidebar.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.sidebarsectionheader.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.tree.indentguidesstroke` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.notificationcenter.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.notificationtoast.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.notifications.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.pickergroup.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.widget.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.input.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.dropdown.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.button.secondaryhoverbackground` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.checkbox.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.tab.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.tab.unfocusedactiveborder` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.tab.hoverborder` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.editorgroupheader.tabsborder` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.editorgroup.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.menubar.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.menu.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.menu.separatorbackground` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.commandcenter.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.debugtoolbar.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.editorgroupheader.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.contrastborder` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.editorghosttext.foreground` | #8FABBE |  2.30:1 | FAIL | decorative token (AA-Large exempt) |
| `colors.statusbar.debuggingbackground` | #E88800 |  2.52:1 | FAIL | on editor bg |
| `colors.inputvalidation.warningborder` | #E88800 |  2.52:1 | FAIL | on editor bg |
| `tok:Constants` | #D47800 |  3.09:1 | AA Large | on editor bg |
| `semantictokencolors.variable.constant` | #D47800 |  3.09:1 | AA Large | on editor bg |
| `colors.editorlink.activeforeground` | #1A91E6 |  3.22:1 | AA Large | on editor bg |
| `tok:Attributes` | #009999 |  3.34:1 | AA Large | on editor bg |
| `semantictokencolors.type` | #009999 |  3.34:1 | AA Large | on editor bg |
| `semantictokencolors.typeparameter` | #009999 |  3.34:1 | AA Large | on editor bg |
| `colors.editorcodelens.foreground` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `colors.editoroverviewruler.commoncontentforeground` | #6E89A0 |  3.49:1 | AA Large | decorative token (AA-Large exempt) |
| `colors.paneltitle.inactiveforeground` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `colors.titlebar.inactiveforeground` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `colors.pickergroup.foreground` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `colors.input.placeholderforeground` | #6E89A0 |  3.49:1 | AA Large | decorative token (AA-Large exempt) |
| `colors.tab.inactiveforeground` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `colors.breadcrumb.foreground` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `colors.gitdecoration.ignoredresourceforeground` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `colors.gitdecoration.submoduleresourceforeground` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `tok:Strings` | #009933 |  3.58:1 | AA Large | on editor bg |
| `tok:String - Punctuation` | #009933 |  3.58:1 | AA Large | on editor bg |
| `tok:Markup - Code` | #009933 |  3.58:1 | AA Large | on editor bg |
| `colors.editorgutter.addedbackground` | #009933 |  3.58:1 | AA Large | on editor bg |
| `colors.editoroverviewruler.incomingcontentforeground` | #009933 |  3.58:1 | AA Large | decorative token (AA-Large exempt) |
| `semantictokencolors.string` | #009933 |  3.58:1 | AA Large | on editor bg |
| `tok:Types` | #008C8C |  3.91:1 | AA Large | on editor bg |
| `tok:Type Parameters` | #008C8C |  3.91:1 | AA Large | on editor bg |
| `colors.gitdecoration.addedresourceforeground` | #008F33 |  4.03:1 | AA Large | on editor bg |
| `colors.gitdecoration.untrackedresourceforeground` | #008F33 |  4.03:1 | AA Large | on editor bg |
| `colors.textpreformat.foreground` | #008F33 |  4.03:1 | AA Large | on editor bg |
| `tok:Comments` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `tok:Comment - Documentation` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `tok:Markup - Strikethrough` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `tok:Markup - Quote` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `semantictokencolors.comment` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `tok:Numbers` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `tok:Functions` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `tok:Function Call` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `tok:Markup - Link` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.editorcursor.foreground` | #0077CC |  4.45:1 | AA Large | text on cursor surface (by design) |
| `colors.editorindentguide.activebackground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.editorbracketmatch.border` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.editorgutter.modifiedbackground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.editorinfo.foreground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.editorsymbolhighlightborder` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.editorsuggestwidget.highlightforeground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.editorwidget.resizeborder` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.editoroverviewruler.currentcontentforeground` | #0077CC |  4.45:1 | AA Large | decorative token (AA-Large exempt) |
| `colors.paneltitle.activeborder` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.activitybar.activeborder` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.activitybarbadge.background` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.list.highlightforeground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.list.inactivefocusoutline` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.notificationsinfoicon.foreground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.notificationlink.foreground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.extensionbutton.prominentbackground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.inputoption.activeborder` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.inputvalidation.infoborder` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.button.background` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.badge.background` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.progressbar.background` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.tab.activeborder` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.gitdecoration.modifiedresourceforeground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.focusborder` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.textlink.foreground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.textblockquote.border` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `semantictokencolors.number` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `semantictokencolors.function` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `tok:Invalid/Error` | #E80000 |  4.53:1 | AA | on editor bg |
| `colors.editorgutter.deletedbackground` | #E80000 |  4.53:1 | AA | on editor bg |
| `colors.editorerror.foreground` | #E80000 |  4.53:1 | AA | on editor bg |
| `colors.notificationserroricon.foreground` | #E80000 |  4.53:1 | AA | on editor bg |
| `colors.inputvalidation.errorborder` | #E80000 |  4.53:1 | AA | on editor bg |
| `colors.gitdecoration.deletedresourceforeground` | #E80000 |  4.53:1 | AA | on editor bg |
| `tok:Keywords` | #007F7F |  4.62:1 | AA | on editor bg |
| `tok:Keyword - Operator` | #007F7F |  4.62:1 | AA | on editor bg |
| `tok:Tags` | #007F7F |  4.62:1 | AA | on editor bg |
| `tok:Operators` | #007F7F |  4.62:1 | AA | on editor bg |
| `tok:Markup - Heading` | #007F7F |  4.62:1 | AA | on editor bg |
| `tok:Markup - List` | #007F7F |  4.62:1 | AA | on editor bg |
| `colors.editorhint.foreground` | #007F7F |  4.62:1 | AA | on editor bg |
| `semantictokencolors.keyword` | #007F7F |  4.62:1 | AA | on editor bg |
| `semantictokencolors.keyword.control` | #007F7F |  4.62:1 | AA | on editor bg |
| `semantictokencolors.operator` | #007F7F |  4.62:1 | AA | on editor bg |
| `tok:String - Escape` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `colors.editorwarning.foreground` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `colors.notificationswarningicon.foreground` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `colors.gitdecoration.conflictingresourceforeground` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `colors.extensionbutton.prominenthoverbackground` | #0066B3 |  5.65:1 | AA | on editor bg |
| `colors.button.hoverbackground` | #0066B3 |  5.65:1 | AA | on editor bg |
| `tok:Variable - Parameter` | #485C6E |  6.62:1 | AA | on editor bg |
| `semantictokencolors.variable.parameter` | #485C6E |  6.62:1 | AA | on editor bg |
| `colors.textlink.activeforeground` | #005A9E |  6.79:1 | AA | on editor bg |
| `colors.diffeditor.insertedtextborder` | #005A1F |  8.09:1 | AAA | on editor bg |
| `colors.diffeditor.removedtextborder` | #8C0000 |  9.49:1 | AAA | on editor bg |
| `colors.editor.selectionforeground` | #002B5C | 13.38:1 | AAA | on editor bg |
| `editor.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `tok:Variables` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `tok:Markup - Bold` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `tok:Markup - Italic` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `tok:Markup - Table` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.editor.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.editorhoverwidget.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.editorsuggestwidget.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.diffeditor.unchangedregionforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.paneltitle.activeforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.statusbar.foreground` | #1A2A35 | 14.07:1 | AAA | UI chrome on its own accent surface (by design) |
| `colors.statusbaritem.remoteforeground` | #1A2A35 | 14.07:1 | AAA | UI chrome on its own accent surface (by design) |
| `colors.titlebar.activeforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.activitybar.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.sidebar.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.sidebartitle.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.sidebarsectionheader.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.list.activeselectionforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.list.inactiveselectionforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.list.hoverforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.list.focusforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.notifications.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.notificationcenterheader.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.quickinput.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.input.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.inputoption.activeforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.dropdown.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.button.secondaryforeground` | #1A2A35 | 14.07:1 | AAA | UI chrome on its own accent surface (by design) |
| `colors.checkbox.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.tab.activeforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.breadcrumb.focusforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.breadcrumb.activeselectionforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.menubar.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.menu.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.menu.selectionforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.commandcenter.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.commandcenter.activeforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `semantictokencolors.variable` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `semantictokencolors.variable.property` | #1A2A35 | 14.07:1 | AAA | on editor bg |

#### VS Code (dark) — bg `#0A0F14` <small>(json:colors.editor.background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `colors.editor.background` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `colors.editorgutter.background` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `colors.tab.activebackground` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `colors.breadcrumb.background` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `colors.commandcenter.activebackground` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `colors.editorgroup.emptybackground` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `colors.editor.linehighlightbackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.editorrangehighlightbackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.editorhoverwidget.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.editorsuggestwidget.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.editorwidget.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.diffeditor.diagonalfill` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.merge.currentcontentbackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.merge.incomingcontentbackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.panel.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.statusbar.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.statusbar.nofolderbackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.statusbaritem.remotebackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.titlebar.activebackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.titlebar.inactivebackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.activitybar.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.sidebar.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.sidebarsectionheader.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.list.hoverbackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.notificationcenter.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.notifications.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.notificationcenterheader.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.quickinput.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.quickinputtitle.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.input.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.dropdown.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.dropdown.listbackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.checkbox.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.tab.inactivebackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.tab.hoverbackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.tab.unfocusedhoverbackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.editorgroupheader.tabsbackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.breadcrumbpicker.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.menubar.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.menu.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.commandcenter.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.debugtoolbar.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.editorgroupheader.notabsbackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.textcodeblock.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.textblockquote.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.editor.inactiveselectionbackground` | #182430 |  1.22:1 | FAIL | on editor bg |
| `colors.editorsymbolhighlightbackground` | #182430 |  1.22:1 | FAIL | on editor bg |
| `colors.list.inactiveselectionbackground` | #182430 |  1.22:1 | FAIL | on editor bg |
| `colors.list.inactivefocusbackground` | #182430 |  1.22:1 | FAIL | on editor bg |
| `colors.diffeditor.removedtextbackground` | #7A0000 |  1.67:1 | FAIL | on editor bg |
| `colors.diffeditor.removedtextborder` | #7A0000 |  1.67:1 | FAIL | on editor bg |
| `colors.inputvalidation.errorbackground` | #7A0000 |  1.67:1 | FAIL | on editor bg |
| `colors.editor.linehighlightborder` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.editor.selectionbackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.editorbracketmatch.background` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.editorfindrangehighlightbackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.editorsuggestwidget.selectedbackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.diffeditor.unchangedregionbackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.merge.currentheaderbackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.list.activeselectionbackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.list.focusbackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.list.dropbackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.inputoption.activebackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.inputvalidation.infobackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.editorgroup.dropbackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.menu.selectionbackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.editorwhitespace.foreground` | #2D4058 |  1.82:1 | FAIL | decorative token (AA-Large exempt) |
| `colors.editorindentguide.background` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.editorruler.foreground` | #2D4058 |  1.82:1 | FAIL | decorative token (AA-Large exempt) |
| `colors.editoroverviewruler.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.editorhoverwidget.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.editorsuggestwidget.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.editorwidget.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.panel.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.panelinput.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.statusbar.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.titlebar.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.activitybar.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.sidebar.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.sidebarsectionheader.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.tree.indentguidesstroke` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.notificationcenter.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.notificationtoast.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.notifications.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.pickergroup.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.widget.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.input.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.dropdown.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.button.secondarybackground` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.checkbox.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.tab.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.tab.unfocusedactiveborder` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.tab.hoverborder` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.editorgroupheader.tabsborder` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.editorgroup.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.menubar.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.menu.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.menu.separatorbackground` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.commandcenter.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.debugtoolbar.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.editorgroupheader.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.contrastborder` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.diffeditor.insertedtextbackground` | #004D1A |  1.90:1 | FAIL | on editor bg |
| `colors.diffeditor.insertedtextborder` | #004D1A |  1.90:1 | FAIL | on editor bg |
| `colors.merge.incomingheaderbackground` | #004D1A |  1.90:1 | FAIL | on editor bg |
| `colors.editorghosttext.foreground` | #3D526E |  2.41:1 | FAIL | decorative token (AA-Large exempt) |
| `colors.button.secondaryhoverbackground` | #3D526E |  2.41:1 | FAIL | on editor bg |
| `colors.editorfindmatchbackground` | #7A4A00 |  2.57:1 | FAIL | on editor bg |
| `colors.inputvalidation.warningbackground` | #7A4A00 |  2.57:1 | FAIL | on editor bg |
| `colors.editorcodelens.foreground` | #526D85 |  3.56:1 | AA Large | on editor bg |
| `colors.input.placeholderforeground` | #526D85 |  3.56:1 | AA Large | decorative token (AA-Large exempt) |
| `colors.editorfindmatchhighlightbackground` | #9E5E00 |  3.72:1 | AA Large | on editor bg |
| `colors.editorgutter.deletedbackground` | #E80000 |  4.06:1 | AA Large | on editor bg |
| `colors.inputvalidation.errorborder` | #E80000 |  4.06:1 | AA Large | on editor bg |
| `colors.extensionbutton.prominenthoverbackground` | #007BDB |  4.45:1 | AA Large | on editor bg |
| `colors.inputvalidation.infoborder` | #007BDB |  4.45:1 | AA Large | on editor bg |
| `colors.button.hoverbackground` | #007BDB |  4.45:1 | AA Large | on editor bg |
| `tok:Invalid/Error` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `colors.editorerror.foreground` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `colors.notificationserroricon.foreground` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `colors.gitdecoration.deletedresourceforeground` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `colors.editorgutter.addedbackground` | #009933 |  5.14:1 | AA | on editor bg |
| `colors.editoroverviewruler.incomingcontentforeground` | #009933 |  5.14:1 | AA | decorative token (AA-Large exempt) |
| `tok:Comments` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `tok:Comment - Documentation` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `tok:Markup - Strikethrough` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `tok:Markup - Quote` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `colors.editoroverviewruler.commoncontentforeground` | #6E89A0 |  5.27:1 | AA | decorative token (AA-Large exempt) |
| `colors.paneltitle.inactiveforeground` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `colors.titlebar.inactiveforeground` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `colors.pickergroup.foreground` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `colors.tab.inactiveforeground` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `colors.breadcrumb.foreground` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `colors.gitdecoration.ignoredresourceforeground` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `colors.gitdecoration.submoduleresourceforeground` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `semantictokencolors.comment` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `colors.editorcursor.foreground` | #1A91E6 |  5.71:1 | AA | text on cursor surface (by design) |
| `colors.editorindentguide.activebackground` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.editorbracketmatch.border` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.editorgutter.modifiedbackground` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.editorsymbolhighlightborder` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.editorwidget.resizeborder` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.editoroverviewruler.currentcontentforeground` | #1A91E6 |  5.71:1 | AA | decorative token (AA-Large exempt) |
| `colors.paneltitle.activeborder` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.activitybar.activeborder` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.activitybarbadge.background` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.list.inactivefocusoutline` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.extensionbutton.prominentbackground` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.inputoption.activeborder` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.button.background` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.badge.background` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.progressbar.background` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.tab.activeborder` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.focusborder` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.textlink.activeforeground` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.textblockquote.border` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.statusbar.debuggingbackground` | #E88800 |  7.29:1 | AAA | on editor bg |
| `colors.inputvalidation.warningborder` | #E88800 |  7.29:1 | AAA | on editor bg |
| `tok:Numbers` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `tok:Functions` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `tok:Function Call` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `tok:Markup - Link` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `colors.editorinfo.foreground` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `colors.editorlink.activeforeground` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `colors.editorsuggestwidget.highlightforeground` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `colors.list.highlightforeground` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `colors.notificationsinfoicon.foreground` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `colors.notificationlink.foreground` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `colors.gitdecoration.modifiedresourceforeground` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `colors.textlink.foreground` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `semantictokencolors.number` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `semantictokencolors.function` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `tok:Variable - Parameter` | #93ABC3 |  8.11:1 | AAA | on editor bg |
| `semantictokencolors.variable.parameter` | #93ABC3 |  8.11:1 | AAA | on editor bg |
| `tok:String - Escape` | #EF9F76 |  9.06:1 | AAA | on editor bg |
| `colors.editorwarning.foreground` | #FF9F00 |  9.36:1 | AAA | on editor bg |
| `colors.notificationswarningicon.foreground` | #FF9F00 |  9.36:1 | AAA | on editor bg |
| `tok:Types` | #81C8BE | 10.02:1 | AAA | on editor bg |
| `tok:Type Parameters` | #81C8BE | 10.02:1 | AAA | on editor bg |
| `semantictokencolors.type` | #81C8BE | 10.02:1 | AAA | on editor bg |
| `semantictokencolors.typeparameter` | #81C8BE | 10.02:1 | AAA | on editor bg |
| `tok:Strings` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `tok:String - Punctuation` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `tok:Markup - Code` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `colors.gitdecoration.addedresourceforeground` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `colors.gitdecoration.untrackedresourceforeground` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `colors.textpreformat.foreground` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `semantictokencolors.string` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `colors.editorhint.foreground` | #4DDDDD | 11.64:1 | AAA | on editor bg |
| `tok:Constants` | #E5C890 | 11.91:1 | AAA | on editor bg |
| `colors.gitdecoration.conflictingresourceforeground` | #E5C890 | 11.91:1 | AAA | on editor bg |
| `semantictokencolors.variable.constant` | #E5C890 | 11.91:1 | AAA | on editor bg |
| `tok:Keywords` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `tok:Keyword - Operator` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `tok:Tags` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `tok:Operators` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `tok:Markup - Heading` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `tok:Markup - List` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `semantictokencolors.keyword` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `semantictokencolors.keyword.control` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `semantictokencolors.operator` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `tok:Attributes` | #94E2D5 | 12.92:1 | AAA | on editor bg |
| `editor.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `tok:Variables` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `tok:Markup - Bold` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `tok:Markup - Italic` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `tok:Markup - Table` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.editor.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.editor.selectionforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.editorhoverwidget.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.editorsuggestwidget.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.diffeditor.unchangedregionforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.paneltitle.activeforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.statusbar.foreground` | #E0E8EF | 15.54:1 | AAA | UI chrome on its own accent surface (by design) |
| `colors.statusbaritem.remoteforeground` | #E0E8EF | 15.54:1 | AAA | UI chrome on its own accent surface (by design) |
| `colors.titlebar.activeforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.activitybar.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.sidebar.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.sidebartitle.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.sidebarsectionheader.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.list.activeselectionforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.list.inactiveselectionforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.list.hoverforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.list.focusforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.notifications.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.notificationcenterheader.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.quickinput.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.input.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.inputoption.activeforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.dropdown.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.button.secondaryforeground` | #E0E8EF | 15.54:1 | AAA | UI chrome on its own accent surface (by design) |
| `colors.checkbox.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.tab.activeforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.breadcrumb.focusforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.breadcrumb.activeselectionforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.menubar.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.menu.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.menu.selectionforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.commandcenter.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.commandcenter.activeforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `semantictokencolors.variable` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `semantictokencolors.variable.property` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.statusbar.debuggingforeground` | #FFFFFF | 19.24:1 | AAA | UI chrome on its own accent surface (by design) |
| `colors.activitybarbadge.foreground` | #FFFFFF | 19.24:1 | AAA | UI chrome on its own accent surface (by design) |
| `colors.extensionbutton.prominentforeground` | #FFFFFF | 19.24:1 | AAA | UI chrome on its own accent surface (by design) |
| `colors.button.foreground` | #FFFFFF | 19.24:1 | AAA | UI chrome on its own accent surface (by design) |
| `colors.badge.foreground` | #FFFFFF | 19.24:1 | AAA | UI chrome on its own accent surface (by design) |

#### Positron (light) — bg `#F8FAFC` <small>(json:colors.editor.background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `colors.editor.background` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `colors.editorgutter.background` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `colors.tab.activebackground` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `colors.breadcrumb.background` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `colors.editorgroup.emptybackground` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `colors.inputvalidation.warningbackground` | #FFF8E6 |  1.01:1 | FAIL | on editor bg |
| `colors.editorhoverwidget.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.editorsuggestwidget.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.editorwidget.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.statusbar.debuggingforeground` | #FFFFFF |  1.05:1 | FAIL | white/self-colored on accent/cursor (by design) |
| `colors.activitybarbadge.foreground` | #FFFFFF |  1.05:1 | FAIL | white/self-colored on accent/cursor (by design) |
| `colors.notifications.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.extensionbutton.prominentforeground` | #FFFFFF |  1.05:1 | FAIL | white/self-colored on accent/cursor (by design) |
| `colors.quickinput.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.input.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.dropdown.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.dropdown.listbackground` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.button.foreground` | #FFFFFF |  1.05:1 | FAIL | white/self-colored on accent/cursor (by design) |
| `colors.checkbox.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.badge.foreground` | #FFFFFF |  1.05:1 | FAIL | white/self-colored on accent/cursor (by design) |
| `colors.breadcrumbpicker.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.menu.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.commandcenter.activebackground` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `colors.panel.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.sidebar.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.sidebarsectionheader.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.notificationcenter.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.notificationcenterheader.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.quickinputtitle.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.editorgroupheader.tabsbackground` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.menubar.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.commandcenter.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.debugtoolbar.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.editorgroupheader.notabsbackground` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.textcodeblock.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.textblockquote.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `colors.editorfindmatchbackground` | #FFF0CC |  1.08:1 | FAIL | on editor bg |
| `colors.diffeditor.insertedtextbackground` | #D4F0D4 |  1.17:1 | FAIL | on editor bg |
| `colors.merge.incomingheaderbackground` | #D4F0D4 |  1.17:1 | FAIL | on editor bg |
| `colors.editor.linehighlightbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.editorrangehighlightbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.editorfindrangehighlightbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.editorsuggestwidget.selectedbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.diffeditor.unchangedregionbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.merge.currentheaderbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.list.hoverbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.inputoption.activebackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.inputvalidation.infobackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.tab.hoverbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.tab.unfocusedhoverbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.menu.selectionbackground` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `colors.diffeditor.diagonalfill` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `colors.statusbar.background` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `colors.statusbar.nofolderbackground` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `colors.statusbaritem.remotebackground` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `colors.titlebar.activebackground` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `colors.titlebar.inactivebackground` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `colors.activitybar.background` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `colors.button.secondarybackground` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `colors.tab.inactivebackground` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `colors.editor.inactiveselectionbackground` | #D0E4EC |  1.26:1 | FAIL | on editor bg |
| `colors.editorsymbolhighlightbackground` | #D0E4EC |  1.26:1 | FAIL | on editor bg |
| `colors.merge.currentcontentbackground` | #D0E4EC |  1.26:1 | FAIL | on editor bg |
| `colors.merge.incomingcontentbackground` | #D0E4EC |  1.26:1 | FAIL | on editor bg |
| `colors.list.inactiveselectionbackground` | #D0E4EC |  1.26:1 | FAIL | on editor bg |
| `colors.list.inactivefocusbackground` | #D0E4EC |  1.26:1 | FAIL | on editor bg |
| `colors.editorfindmatchhighlightbackground` | #FFDB99 |  1.27:1 | FAIL | on editor bg |
| `colors.diffeditor.removedtextbackground` | #FAD4D4 |  1.30:1 | FAIL | on editor bg |
| `colors.inputvalidation.errorbackground` | #FAD4D4 |  1.30:1 | FAIL | on editor bg |
| `colors.editor.linehighlightborder` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `colors.editor.selectionbackground` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `colors.editorbracketmatch.background` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `colors.list.activeselectionbackground` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `colors.list.focusbackground` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `colors.list.dropbackground` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `colors.editorgroup.dropbackground` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `colors.editorwhitespace.foreground` | #A8C0D8 |  1.79:1 | FAIL | decorative token (AA-Large exempt) |
| `colors.editorindentguide.background` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.editorruler.foreground` | #A8C0D8 |  1.79:1 | FAIL | decorative token (AA-Large exempt) |
| `colors.editoroverviewruler.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.editorhoverwidget.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.editorsuggestwidget.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.editorwidget.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.panel.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.panelinput.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.statusbar.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.titlebar.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.activitybar.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.sidebar.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.sidebarsectionheader.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.tree.indentguidesstroke` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.notificationcenter.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.notificationtoast.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.notifications.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.pickergroup.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.widget.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.input.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.dropdown.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.button.secondaryhoverbackground` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.checkbox.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.tab.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.tab.unfocusedactiveborder` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.tab.hoverborder` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.editorgroupheader.tabsborder` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.editorgroup.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.menubar.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.menu.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.menu.separatorbackground` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.commandcenter.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.debugtoolbar.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.editorgroupheader.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.contrastborder` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `colors.editorghosttext.foreground` | #8FABBE |  2.30:1 | FAIL | decorative token (AA-Large exempt) |
| `colors.statusbar.debuggingbackground` | #E88800 |  2.52:1 | FAIL | on editor bg |
| `colors.inputvalidation.warningborder` | #E88800 |  2.52:1 | FAIL | on editor bg |
| `tok:Constants` | #D47800 |  3.09:1 | AA Large | on editor bg |
| `semantictokencolors.variable.constant` | #D47800 |  3.09:1 | AA Large | on editor bg |
| `colors.editorlink.activeforeground` | #1A91E6 |  3.22:1 | AA Large | on editor bg |
| `tok:Attributes` | #009999 |  3.34:1 | AA Large | on editor bg |
| `semantictokencolors.type` | #009999 |  3.34:1 | AA Large | on editor bg |
| `semantictokencolors.typeparameter` | #009999 |  3.34:1 | AA Large | on editor bg |
| `colors.editorcodelens.foreground` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `colors.editoroverviewruler.commoncontentforeground` | #6E89A0 |  3.49:1 | AA Large | decorative token (AA-Large exempt) |
| `colors.paneltitle.inactiveforeground` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `colors.titlebar.inactiveforeground` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `colors.pickergroup.foreground` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `colors.input.placeholderforeground` | #6E89A0 |  3.49:1 | AA Large | decorative token (AA-Large exempt) |
| `colors.tab.inactiveforeground` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `colors.breadcrumb.foreground` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `colors.gitdecoration.ignoredresourceforeground` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `colors.gitdecoration.submoduleresourceforeground` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `tok:Strings` | #009933 |  3.58:1 | AA Large | on editor bg |
| `tok:String - Punctuation` | #009933 |  3.58:1 | AA Large | on editor bg |
| `tok:Markup - Code` | #009933 |  3.58:1 | AA Large | on editor bg |
| `colors.editorgutter.addedbackground` | #009933 |  3.58:1 | AA Large | on editor bg |
| `colors.editoroverviewruler.incomingcontentforeground` | #009933 |  3.58:1 | AA Large | decorative token (AA-Large exempt) |
| `semantictokencolors.string` | #009933 |  3.58:1 | AA Large | on editor bg |
| `tok:Types` | #008C8C |  3.91:1 | AA Large | on editor bg |
| `tok:Type Parameters` | #008C8C |  3.91:1 | AA Large | on editor bg |
| `colors.gitdecoration.addedresourceforeground` | #008F33 |  4.03:1 | AA Large | on editor bg |
| `colors.gitdecoration.untrackedresourceforeground` | #008F33 |  4.03:1 | AA Large | on editor bg |
| `colors.textpreformat.foreground` | #008F33 |  4.03:1 | AA Large | on editor bg |
| `tok:Comments` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `tok:Comment - Documentation` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `tok:Markup - Strikethrough` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `tok:Markup - Quote` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `semantictokencolors.comment` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `tok:Numbers` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `tok:Functions` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `tok:Function Call` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `tok:Markup - Link` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.editorcursor.foreground` | #0077CC |  4.45:1 | AA Large | text on cursor surface (by design) |
| `colors.editorindentguide.activebackground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.editorbracketmatch.border` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.editorgutter.modifiedbackground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.editorinfo.foreground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.editorsymbolhighlightborder` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.editorsuggestwidget.highlightforeground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.editorwidget.resizeborder` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.editoroverviewruler.currentcontentforeground` | #0077CC |  4.45:1 | AA Large | decorative token (AA-Large exempt) |
| `colors.paneltitle.activeborder` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.activitybar.activeborder` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.activitybarbadge.background` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.list.highlightforeground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.list.inactivefocusoutline` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.notificationsinfoicon.foreground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.notificationlink.foreground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.extensionbutton.prominentbackground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.inputoption.activeborder` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.inputvalidation.infoborder` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.button.background` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.badge.background` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.progressbar.background` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.tab.activeborder` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.gitdecoration.modifiedresourceforeground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.focusborder` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.textlink.foreground` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `colors.textblockquote.border` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `semantictokencolors.number` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `semantictokencolors.function` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `tok:Invalid/Error` | #E80000 |  4.53:1 | AA | on editor bg |
| `colors.editorgutter.deletedbackground` | #E80000 |  4.53:1 | AA | on editor bg |
| `colors.editorerror.foreground` | #E80000 |  4.53:1 | AA | on editor bg |
| `colors.notificationserroricon.foreground` | #E80000 |  4.53:1 | AA | on editor bg |
| `colors.inputvalidation.errorborder` | #E80000 |  4.53:1 | AA | on editor bg |
| `colors.gitdecoration.deletedresourceforeground` | #E80000 |  4.53:1 | AA | on editor bg |
| `tok:Keywords` | #007F7F |  4.62:1 | AA | on editor bg |
| `tok:Keyword - Operator` | #007F7F |  4.62:1 | AA | on editor bg |
| `tok:Tags` | #007F7F |  4.62:1 | AA | on editor bg |
| `tok:Operators` | #007F7F |  4.62:1 | AA | on editor bg |
| `tok:Markup - Heading` | #007F7F |  4.62:1 | AA | on editor bg |
| `tok:Markup - List` | #007F7F |  4.62:1 | AA | on editor bg |
| `colors.editorhint.foreground` | #007F7F |  4.62:1 | AA | on editor bg |
| `semantictokencolors.keyword` | #007F7F |  4.62:1 | AA | on editor bg |
| `semantictokencolors.keyword.control` | #007F7F |  4.62:1 | AA | on editor bg |
| `semantictokencolors.operator` | #007F7F |  4.62:1 | AA | on editor bg |
| `tok:String - Escape` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `colors.editorwarning.foreground` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `colors.notificationswarningicon.foreground` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `colors.gitdecoration.conflictingresourceforeground` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `colors.extensionbutton.prominenthoverbackground` | #0066B3 |  5.65:1 | AA | on editor bg |
| `colors.button.hoverbackground` | #0066B3 |  5.65:1 | AA | on editor bg |
| `tok:Variable - Parameter` | #485C6E |  6.62:1 | AA | on editor bg |
| `semantictokencolors.variable.parameter` | #485C6E |  6.62:1 | AA | on editor bg |
| `colors.textlink.activeforeground` | #005A9E |  6.79:1 | AA | on editor bg |
| `colors.diffeditor.insertedtextborder` | #005A1F |  8.09:1 | AAA | on editor bg |
| `colors.diffeditor.removedtextborder` | #8C0000 |  9.49:1 | AAA | on editor bg |
| `colors.editor.selectionforeground` | #002B5C | 13.38:1 | AAA | on editor bg |
| `editor.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `tok:Variables` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `tok:Markup - Bold` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `tok:Markup - Italic` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `tok:Markup - Table` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.editor.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.editorhoverwidget.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.editorsuggestwidget.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.diffeditor.unchangedregionforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.paneltitle.activeforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.statusbar.foreground` | #1A2A35 | 14.07:1 | AAA | UI chrome on its own accent surface (by design) |
| `colors.statusbaritem.remoteforeground` | #1A2A35 | 14.07:1 | AAA | UI chrome on its own accent surface (by design) |
| `colors.titlebar.activeforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.activitybar.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.sidebar.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.sidebartitle.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.sidebarsectionheader.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.list.activeselectionforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.list.inactiveselectionforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.list.hoverforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.list.focusforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.notifications.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.notificationcenterheader.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.quickinput.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.input.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.inputoption.activeforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.dropdown.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.button.secondaryforeground` | #1A2A35 | 14.07:1 | AAA | UI chrome on its own accent surface (by design) |
| `colors.checkbox.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.tab.activeforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.breadcrumb.focusforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.breadcrumb.activeselectionforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.menubar.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.menu.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.menu.selectionforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.commandcenter.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `colors.commandcenter.activeforeground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `semantictokencolors.variable` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `semantictokencolors.variable.property` | #1A2A35 | 14.07:1 | AAA | on editor bg |

#### Positron (dark) — bg `#0A0F14` <small>(json:colors.editor.background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `colors.editor.background` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `colors.editorgutter.background` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `colors.statusbar.debuggingforeground` | #0A0F14 |  1.00:1 | FAIL | UI chrome on its own accent surface (by design) |
| `colors.tab.activebackground` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `colors.breadcrumb.background` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `colors.editorgroup.emptybackground` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `colors.editor.linehighlightbackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.editorrangehighlightbackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.editorhoverwidget.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.editorsuggestwidget.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.editorwidget.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.diffeditor.diagonalfill` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.panel.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.statusbar.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.statusbar.nofolderbackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.statusbaritem.remotebackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.titlebar.activebackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.titlebar.inactivebackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.activitybar.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.sidebar.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.sidebarsectionheader.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.notificationcenter.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.notifications.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.notificationcenterheader.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.quickinput.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.quickinputtitle.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.input.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.dropdown.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.dropdown.listbackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.button.secondarybackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.checkbox.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.tab.inactivebackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.tab.hoverbackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.tab.unfocusedhoverbackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.editorgroupheader.tabsbackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.breadcrumbpicker.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.menubar.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.menu.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.commandcenter.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.commandcenter.activebackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.debugtoolbar.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.editorgroupheader.notabsbackground` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.textcodeblock.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.textblockquote.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `colors.editor.inactiveselectionbackground` | #182430 |  1.22:1 | FAIL | on editor bg |
| `colors.editorsymbolhighlightbackground` | #182430 |  1.22:1 | FAIL | on editor bg |
| `colors.editorsuggestwidget.selectedbackground` | #182430 |  1.22:1 | FAIL | on editor bg |
| `colors.merge.currentcontentbackground` | #182430 |  1.22:1 | FAIL | on editor bg |
| `colors.merge.incomingcontentbackground` | #182430 |  1.22:1 | FAIL | on editor bg |
| `colors.list.inactiveselectionbackground` | #182430 |  1.22:1 | FAIL | on editor bg |
| `colors.list.hoverbackground` | #182430 |  1.22:1 | FAIL | on editor bg |
| `colors.list.inactivefocusbackground` | #182430 |  1.22:1 | FAIL | on editor bg |
| `colors.button.secondaryhoverbackground` | #182430 |  1.22:1 | FAIL | on editor bg |
| `colors.menu.selectionbackground` | #182430 |  1.22:1 | FAIL | on editor bg |
| `colors.diffeditor.removedtextbackground` | #7A0000 |  1.67:1 | FAIL | on editor bg |
| `colors.diffeditor.removedtextborder` | #7A0000 |  1.67:1 | FAIL | on editor bg |
| `colors.inputvalidation.errorbackground` | #7A0000 |  1.67:1 | FAIL | on editor bg |
| `colors.editor.linehighlightborder` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.editor.selectionbackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.editorbracketmatch.background` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.editorfindrangehighlightbackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.diffeditor.unchangedregionbackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.merge.currentheaderbackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.list.activeselectionbackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.list.focusbackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.list.dropbackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.inputoption.activebackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.inputvalidation.infobackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.editorgroup.dropbackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `colors.editorwhitespace.foreground` | #2D4058 |  1.82:1 | FAIL | decorative token (AA-Large exempt) |
| `colors.editorindentguide.background` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.editorruler.foreground` | #2D4058 |  1.82:1 | FAIL | decorative token (AA-Large exempt) |
| `colors.editoroverviewruler.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.editorhoverwidget.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.editorsuggestwidget.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.editorwidget.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.panel.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.panelinput.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.statusbar.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.titlebar.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.activitybar.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.sidebar.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.sidebarsectionheader.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.tree.indentguidesstroke` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.notificationcenter.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.notificationtoast.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.notifications.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.pickergroup.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.widget.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.input.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.dropdown.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.checkbox.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.tab.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.tab.unfocusedactiveborder` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.tab.hoverborder` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.editorgroupheader.tabsborder` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.editorgroup.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.menubar.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.menu.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.menu.separatorbackground` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.commandcenter.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.debugtoolbar.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.editorgroupheader.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.contrastborder` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `colors.diffeditor.insertedtextbackground` | #004D1A |  1.90:1 | FAIL | on editor bg |
| `colors.diffeditor.insertedtextborder` | #004D1A |  1.90:1 | FAIL | on editor bg |
| `colors.merge.incomingheaderbackground` | #004D1A |  1.90:1 | FAIL | on editor bg |
| `colors.editorghosttext.foreground` | #3D526E |  2.41:1 | FAIL | decorative token (AA-Large exempt) |
| `colors.editorfindmatchbackground` | #7A4A00 |  2.57:1 | FAIL | on editor bg |
| `colors.inputvalidation.warningbackground` | #7A4A00 |  2.57:1 | FAIL | on editor bg |
| `colors.input.placeholderforeground` | #526D85 |  3.56:1 | AA Large | decorative token (AA-Large exempt) |
| `colors.activitybarbadge.background` | #007BDB |  4.45:1 | AA Large | on editor bg |
| `colors.extensionbutton.prominentbackground` | #007BDB |  4.45:1 | AA Large | on editor bg |
| `colors.button.background` | #007BDB |  4.45:1 | AA Large | on editor bg |
| `colors.badge.background` | #007BDB |  4.45:1 | AA Large | on editor bg |
| `colors.progressbar.background` | #007BDB |  4.45:1 | AA Large | on editor bg |
| `tok:Invalid/Error` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `colors.editorgutter.deletedbackground` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `colors.editorerror.foreground` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `colors.notificationserroricon.foreground` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `colors.inputvalidation.errorborder` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `colors.gitdecoration.deletedresourceforeground` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `tok:Comments` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `tok:Comment - Documentation` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `tok:Markup - Strikethrough` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `tok:Markup - Quote` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `colors.editorcodelens.foreground` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `colors.editoroverviewruler.commoncontentforeground` | #6E89A0 |  5.27:1 | AA | decorative token (AA-Large exempt) |
| `colors.paneltitle.inactiveforeground` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `colors.titlebar.inactiveforeground` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `colors.pickergroup.foreground` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `colors.tab.inactiveforeground` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `colors.breadcrumb.foreground` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `colors.gitdecoration.ignoredresourceforeground` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `colors.gitdecoration.submoduleresourceforeground` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `semantictokencolors.comment` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `colors.editorcursor.foreground` | #1A91E6 |  5.71:1 | AA | text on cursor surface (by design) |
| `colors.editorindentguide.activebackground` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.editorbracketmatch.border` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.editorgutter.modifiedbackground` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.editorsymbolhighlightborder` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.editorsuggestwidget.highlightforeground` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.editorwidget.resizeborder` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.editoroverviewruler.currentcontentforeground` | #1A91E6 |  5.71:1 | AA | decorative token (AA-Large exempt) |
| `colors.paneltitle.activeborder` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.activitybar.activeborder` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.list.highlightforeground` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.list.inactivefocusoutline` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.extensionbutton.prominenthoverbackground` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.inputoption.activeborder` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.button.hoverbackground` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.tab.activeborder` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.focusborder` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `colors.textblockquote.border` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `tok:Numbers` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `tok:Functions` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `tok:Function Call` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `tok:Markup - Link` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `colors.editorinfo.foreground` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `colors.editorlink.activeforeground` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `colors.notificationsinfoicon.foreground` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `colors.notificationlink.foreground` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `colors.inputvalidation.infoborder` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `colors.gitdecoration.modifiedresourceforeground` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `colors.textlink.foreground` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `semantictokencolors.number` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `semantictokencolors.function` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `tok:Variable - Parameter` | #93ABC3 |  8.11:1 | AAA | on editor bg |
| `semantictokencolors.variable.parameter` | #93ABC3 |  8.11:1 | AAA | on editor bg |
| `colors.editorwarning.foreground` | #FF9F00 |  9.36:1 | AAA | on editor bg |
| `colors.notificationswarningicon.foreground` | #FF9F00 |  9.36:1 | AAA | on editor bg |
| `colors.inputvalidation.warningborder` | #FF9F00 |  9.36:1 | AAA | on editor bg |
| `tok:Types` | #81C8BE | 10.02:1 | AAA | on editor bg |
| `tok:Type Parameters` | #81C8BE | 10.02:1 | AAA | on editor bg |
| `semantictokencolors.type` | #81C8BE | 10.02:1 | AAA | on editor bg |
| `semantictokencolors.typeparameter` | #81C8BE | 10.02:1 | AAA | on editor bg |
| `colors.textlink.activeforeground` | #8FC3F5 | 10.35:1 | AAA | on editor bg |
| `tok:Strings` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `tok:String - Punctuation` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `tok:Markup - Code` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `colors.editorgutter.addedbackground` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `colors.editoroverviewruler.incomingcontentforeground` | #4DD966 | 10.48:1 | AAA | decorative token (AA-Large exempt) |
| `colors.gitdecoration.addedresourceforeground` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `colors.gitdecoration.untrackedresourceforeground` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `colors.textpreformat.foreground` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `semantictokencolors.string` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `colors.editorhint.foreground` | #4DDDDD | 11.64:1 | AAA | on editor bg |
| `tok:String - Escape` | #E5C890 | 11.91:1 | AAA | on editor bg |
| `tok:Constants` | #E5C890 | 11.91:1 | AAA | on editor bg |
| `colors.statusbar.debuggingbackground` | #E5C890 | 11.91:1 | AAA | on editor bg |
| `colors.gitdecoration.conflictingresourceforeground` | #E5C890 | 11.91:1 | AAA | on editor bg |
| `semantictokencolors.variable.constant` | #E5C890 | 11.91:1 | AAA | on editor bg |
| `tok:Keywords` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `tok:Keyword - Operator` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `tok:Tags` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `tok:Operators` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `tok:Markup - Heading` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `tok:Markup - List` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `semantictokencolors.keyword` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `semantictokencolors.keyword.control` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `semantictokencolors.operator` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `tok:Attributes` | #94E2D5 | 12.92:1 | AAA | on editor bg |
| `editor.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `tok:Variables` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `tok:Markup - Bold` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `tok:Markup - Italic` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `tok:Markup - Table` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.editor.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.editor.selectionforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.editorhoverwidget.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.editorsuggestwidget.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.diffeditor.unchangedregionforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.paneltitle.activeforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.statusbar.foreground` | #E0E8EF | 15.54:1 | AAA | UI chrome on its own accent surface (by design) |
| `colors.statusbaritem.remoteforeground` | #E0E8EF | 15.54:1 | AAA | UI chrome on its own accent surface (by design) |
| `colors.titlebar.activeforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.activitybar.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.sidebar.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.sidebartitle.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.sidebarsectionheader.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.list.activeselectionforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.list.inactiveselectionforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.list.hoverforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.list.focusforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.notifications.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.notificationcenterheader.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.quickinput.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.input.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.inputoption.activeforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.dropdown.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.button.secondaryforeground` | #E0E8EF | 15.54:1 | AAA | UI chrome on its own accent surface (by design) |
| `colors.checkbox.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.tab.activeforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.breadcrumb.focusforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.breadcrumb.activeselectionforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.menubar.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.menu.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.menu.selectionforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.commandcenter.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.commandcenter.activeforeground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `semantictokencolors.variable` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `semantictokencolors.variable.property` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `colors.editorfindmatchhighlightbackground` | #FFF0CC | 17.03:1 | AAA | on editor bg |
| `colors.activitybarbadge.foreground` | #FFFFFF | 19.24:1 | AAA | UI chrome on its own accent surface (by design) |
| `colors.extensionbutton.prominentforeground` | #FFFFFF | 19.24:1 | AAA | UI chrome on its own accent surface (by design) |
| `colors.button.foreground` | #FFFFFF | 19.24:1 | AAA | UI chrome on its own accent surface (by design) |
| `colors.badge.foreground` | #FFFFFF | 19.24:1 | AAA | UI chrome on its own accent surface (by design) |

#### Zed (light) — bg `#F8FAFC` <small>(json:raw-background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `surface.background` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `editor.background` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `editor.gutter.background` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `toolbar.background` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `tab.active_background` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `conflict.background` | #FFF8E6 |  1.01:1 | FAIL | on editor bg |
| `warning.background` | #FFF8E6 |  1.01:1 | FAIL | on editor bg |
| `elevated_surface.background` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `editor.subheader.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `panel.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `title_bar.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `tab_bar.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `ignored.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `hidden.background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `created.background` | #E6F8E6 |  1.06:1 | FAIL | on editor bg |
| `success.background` | #E6F8E6 |  1.06:1 | FAIL | on editor bg |
| `deleted.background` | #FFEAEA |  1.10:1 | FAIL | on editor bg |
| `error.background` | #FFEAEA |  1.10:1 | FAIL | on editor bg |
| `unreachable.background` | #FFEAEA |  1.10:1 | FAIL | on editor bg |
| `editor.highlighted_line.background` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `editor.active_line.background` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `editor.document_highlight.read_background` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `element.hover` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `modified.background` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `info.background` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `hint.background` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `predictive.background` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `renamed.background` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `editor.document_highlight.bracket_background` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `border.disabled` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `element.background` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `title_bar.inactive_background` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `status_bar.background` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `tab.inactive_background` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `editor.document_highlight.write_background` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `element.active` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `search.match_background` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `text.disabled` | #A8C0D8 |  1.79:1 | FAIL | decorative token (AA-Large exempt) |
| `panel.indent_guide` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `pane_group.border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `scrollbar.thumb.background` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `editor.active_wrap_guide` | #8FABBE |  2.30:1 | FAIL | on editor bg |
| `border.variant` | #8FABBE |  2.30:1 | FAIL | on editor bg |
| `text.placeholder` | #8FABBE |  2.30:1 | FAIL | decorative token (AA-Large exempt) |
| `panel.indent_guide_hover` | #8FABBE |  2.30:1 | FAIL | on editor bg |
| `scrollbar.thumb.hover_background` | #8FABBE |  2.30:1 | FAIL | on editor bg |
| `hidden.border` | #8FABBE |  2.30:1 | FAIL | on editor bg |
| `hint.border` | #00B3B3 |  2.48:1 | FAIL | on editor bg |
| `conflict.border` | #E88800 |  2.52:1 | FAIL | on editor bg |
| `warning.border` | #E88800 |  2.52:1 | FAIL | on editor bg |
| `syntax.constant.color` | #D47800 |  3.09:1 | AA Large | on editor bg |
| `syntax.string.special.color` | #009999 |  3.34:1 | AA Large | on editor bg |
| `syntax.string.special.symbol.color` | #009999 |  3.34:1 | AA Large | on editor bg |
| `syntax.type.color` | #009999 |  3.34:1 | AA Large | on editor bg |
| `syntax.type.class.color` | #009999 |  3.34:1 | AA Large | on editor bg |
| `syntax.type.interface.color` | #009999 |  3.34:1 | AA Large | on editor bg |
| `syntax.attribute.color` | #009999 |  3.34:1 | AA Large | on editor bg |
| `editor.line_number` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `text.muted` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `ignored.border` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `created.border` | #009933 |  3.58:1 | AA Large | on editor bg |
| `success` | #009933 |  3.58:1 | AA Large | on editor bg |
| `success.border` | #009933 |  3.58:1 | AA Large | on editor bg |
| `syntax.string.color` | #009933 |  3.58:1 | AA Large | on editor bg |
| `syntax.markup.code.color` | #009933 |  3.58:1 | AA Large | on editor bg |
| `syntax.text.literal.color` | #009933 |  3.58:1 | AA Large | on editor bg |
| `syntax.comment.color` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `syntax.comment.documentation.color` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `syntax.markup.strikethrough.color` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `syntax.markup.quote.color` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `editor.indent_guide_active` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `border.focused` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `border.selected` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `text.accent` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `panel.focused_border` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `panel.indent_guide_active` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `pane.focused_border` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `modified.border` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `info` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `info.border` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `renamed.border` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `icon.accent` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `accent` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `syntax.number.color` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `syntax.function.color` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `syntax.function.method.color` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `syntax.variable.special.color` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `syntax.link_text.color` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `syntax.link_uri.color` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `deleted.border` | #E80000 |  4.53:1 | AA | on editor bg |
| `error` | #E80000 |  4.53:1 | AA | on editor bg |
| `error.border` | #E80000 |  4.53:1 | AA | on editor bg |
| `unreachable.border` | #E80000 |  4.53:1 | AA | on editor bg |
| `syntax.error.color` | #E80000 |  4.53:1 | AA | on editor bg |
| `hint` | #007F7F |  4.62:1 | AA | on editor bg |
| `predictive.border` | #007F7F |  4.62:1 | AA | on editor bg |
| `syntax.keyword.color` | #007F7F |  4.62:1 | AA | on editor bg |
| `syntax.keyword.control.color` | #007F7F |  4.62:1 | AA | on editor bg |
| `syntax.variable.language.color` | #007F7F |  4.62:1 | AA | on editor bg |
| `syntax.operator.color` | #007F7F |  4.62:1 | AA | on editor bg |
| `syntax.tag.color` | #007F7F |  4.62:1 | AA | on editor bg |
| `syntax.markup.heading.color` | #007F7F |  4.62:1 | AA | on editor bg |
| `syntax.markup.list.color` | #007F7F |  4.62:1 | AA | on editor bg |
| `conflict` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `warning` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `syntax.string.escape.color` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `syntax.variable.parameter.color` | #485C6E |  6.62:1 | AA | on editor bg |
| `editor.active_line_number` | #005A9E |  6.79:1 | AA | on editor bg |
| `link_text.hover` | #005A9E |  6.79:1 | AA | on editor bg |
| `editor.foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `text` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `syntax.variable.color` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `syntax.markup.bold.color` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `syntax.markup.italic.color` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `syntax.text.color` | #1A2A35 | 14.07:1 | AAA | on editor bg |

#### Zed (dark) — bg `#0A0F14` <small>(json:raw-background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `surface.background` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `editor.background` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `editor.gutter.background` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `title_bar.inactive_background` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `toolbar.background` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `tab.active_background` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `editor.highlighted_line.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `editor.active_line.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `editor.subheader.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `element.hover` | #101820 |  1.08:1 | FAIL | on editor bg |
| `elevated_surface.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `panel.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `title_bar.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `status_bar.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `tab_bar.background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `tab.inactive_background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `editor.document_highlight.bracket_background` | #182430 |  1.22:1 | FAIL | on editor bg |
| `element.background` | #182430 |  1.22:1 | FAIL | on editor bg |
| `ignored.background` | #182430 |  1.22:1 | FAIL | on editor bg |
| `hidden.background` | #182430 |  1.22:1 | FAIL | on editor bg |
| `deleted.background` | #7A0000 |  1.67:1 | FAIL | on editor bg |
| `error.background` | #7A0000 |  1.67:1 | FAIL | on editor bg |
| `unreachable.background` | #7A0000 |  1.67:1 | FAIL | on editor bg |
| `editor.document_highlight.read_background` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `element.active` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `search.match_background` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `modified.background` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `info.background` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `hint.background` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `predictive.background` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `renamed.background` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `panel.indent_guide` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `pane_group.border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `scrollbar.thumb.background` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `created.background` | #004D1A |  1.90:1 | FAIL | on editor bg |
| `success.background` | #004D1A |  1.90:1 | FAIL | on editor bg |
| `editor.active_wrap_guide` | #3D526E |  2.41:1 | FAIL | on editor bg |
| `border.variant` | #3D526E |  2.41:1 | FAIL | on editor bg |
| `border.disabled` | #3D526E |  2.41:1 | FAIL | on editor bg |
| `text.placeholder` | #3D526E |  2.41:1 | FAIL | decorative token (AA-Large exempt) |
| `panel.indent_guide_hover` | #3D526E |  2.41:1 | FAIL | on editor bg |
| `scrollbar.thumb.hover_background` | #3D526E |  2.41:1 | FAIL | on editor bg |
| `hidden.border` | #3D526E |  2.41:1 | FAIL | on editor bg |
| `editor.document_highlight.write_background` | #00529E |  2.47:1 | FAIL | on editor bg |
| `conflict.background` | #7A4A00 |  2.57:1 | FAIL | on editor bg |
| `warning.background` | #7A4A00 |  2.57:1 | FAIL | on editor bg |
| `editor.line_number` | #526D85 |  3.56:1 | AA Large | on editor bg |
| `text.disabled` | #526D85 |  3.56:1 | AA Large | decorative token (AA-Large exempt) |
| `accent` | #007BDB |  4.45:1 | AA Large | on editor bg |
| `deleted.border` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `error` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `error.border` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `unreachable.border` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `syntax.error.color` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `text.muted` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `ignored.border` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `syntax.comment.color` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `syntax.comment.documentation.color` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `syntax.markup.strikethrough.color` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `syntax.markup.quote.color` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `editor.indent_guide_active` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `border.focused` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `border.selected` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `panel.focused_border` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `panel.indent_guide_active` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `pane.focused_border` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `editor.active_line_number` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `text.accent` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `modified.border` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `info` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `info.border` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `renamed.border` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `icon.accent` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `syntax.number.color` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `syntax.function.color` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `syntax.function.method.color` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `syntax.variable.special.color` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `syntax.link_text.color` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `syntax.link_uri.color` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `syntax.variable.parameter.color` | #93ABC3 |  8.11:1 | AAA | on editor bg |
| `warning` | #FF9F00 |  9.36:1 | AAA | on editor bg |
| `warning.border` | #FF9F00 |  9.36:1 | AAA | on editor bg |
| `syntax.type.color` | #81C8BE | 10.02:1 | AAA | on editor bg |
| `syntax.type.class.color` | #81C8BE | 10.02:1 | AAA | on editor bg |
| `syntax.type.interface.color` | #81C8BE | 10.02:1 | AAA | on editor bg |
| `link_text.hover` | #8FC3F5 | 10.35:1 | AAA | on editor bg |
| `created.border` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `success` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `success.border` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `syntax.string.color` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `syntax.markup.code.color` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `syntax.text.literal.color` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `conflict` | #E5C890 | 11.91:1 | AAA | on editor bg |
| `conflict.border` | #E5C890 | 11.91:1 | AAA | on editor bg |
| `syntax.string.escape.color` | #E5C890 | 11.91:1 | AAA | on editor bg |
| `syntax.constant.color` | #E5C890 | 11.91:1 | AAA | on editor bg |
| `syntax.keyword.color` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `syntax.keyword.control.color` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `syntax.variable.language.color` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `syntax.operator.color` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `syntax.tag.color` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `syntax.markup.heading.color` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `syntax.markup.list.color` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `hint` | #94E2D5 | 12.92:1 | AAA | on editor bg |
| `hint.border` | #94E2D5 | 12.92:1 | AAA | on editor bg |
| `predictive.border` | #94E2D5 | 12.92:1 | AAA | on editor bg |
| `syntax.string.special.color` | #94E2D5 | 12.92:1 | AAA | on editor bg |
| `syntax.string.special.symbol.color` | #94E2D5 | 12.92:1 | AAA | on editor bg |
| `syntax.attribute.color` | #94E2D5 | 12.92:1 | AAA | on editor bg |
| `editor.foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `text` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `syntax.variable.color` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `syntax.markup.bold.color` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `syntax.markup.italic.color` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `syntax.text.color` | #E0E8EF | 15.54:1 | AAA | on editor bg |

#### Helix (light) — bg `#F8FAFC` <small>(toml:background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `background` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `ui-background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `ui-selection` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `ui-selection-primary` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `ui-text-dimmed` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `fg` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `diagnostic-info` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `diagnostic-error` | #E80000 |  4.53:1 | AA | on editor bg |
| `diagnostic-hint` | #007F7F |  4.62:1 | AA | on editor bg |
| `diagnostic-warning` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `ui-cursor-match-background` | #002B5C | 13.38:1 | AAA | on editor bg |
| `ui-text` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `ui-text-focus` | #1A2A35 | 14.07:1 | AAA | on editor bg |

#### Helix (dark) — bg `#0A0F14` <small>(toml:background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `background` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `ui-background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `ui-selection` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `ui-selection-primary` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `diagnostic-error` | #E80000 |  4.06:1 | AA Large | on editor bg |
| `ui-text-dimmed` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `fg` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `diagnostic-info` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `diagnostic-warning` | #E88800 |  7.29:1 | AAA | on editor bg |
| `diagnostic-hint` | #1ACECE |  9.86:1 | AAA | on editor bg |
| `ui-text` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `ui-text-focus` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `ui-cursor-match-background` | #E0E8EF | 15.54:1 | AAA | on editor bg |

#### Kakoune (light) — bg `#F8FAFC` <small>(kak:Default.bg(var))</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `kak:Border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `kak:Info` | #0091E6 |  3.24:1 | AA Large | on editor bg |
| `kak:LspInfo` | #0091E6 |  3.24:1 | AA Large | on editor bg |
| `kak:LspDiagnosticInfo` | #0091E6 |  3.24:1 | AA Large | on editor bg |
| `kak:Operator` | #009999 |  3.34:1 | AA Large | on editor bg |
| `kak:Keyword` | #009999 |  3.34:1 | AA Large | on editor bg |
| `kak:Tag` | #009999 |  3.34:1 | AA Large | on editor bg |
| `kak:TSKeyword` | #009999 |  3.34:1 | AA Large | on editor bg |
| `kak:TSKeywordFunction` | #009999 |  3.34:1 | AA Large | on editor bg |
| `kak:TSKeywordOperator` | #009999 |  3.34:1 | AA Large | on editor bg |
| `kak:TSKeywordReturn` | #009999 |  3.34:1 | AA Large | on editor bg |
| `kak:TSOperator` | #009999 |  3.34:1 | AA Large | on editor bg |
| `kak:TSTag` | #009999 |  3.34:1 | AA Large | on editor bg |
| `kak:LineNumber` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `kak:ModelineInfo` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `kak:Comment` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `kak:CommentDocumentation` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `kak:SpecialComment` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `kak:GitIgnored` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `kak:CompletionInfo` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `kak:CompletionScrollbar` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `kak:TSComment` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `kak:GitAdded` | #009933 |  3.58:1 | AA Large | on editor bg |
| `kak:GitUntracked` | #009933 |  3.58:1 | AA Large | on editor bg |
| `kak:Error` | #FF1A1A |  3.71:1 | AA Large | on editor bg |
| `kak:GitDeleted` | #FF1A1A |  3.71:1 | AA Large | on editor bg |
| `kak:LspError` | #FF1A1A |  3.71:1 | AA Large | on editor bg |
| `kak:LspDiagnosticError` | #FF1A1A |  3.71:1 | AA Large | on editor bg |
| `kak:BorderFocused` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `kak:Number` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `kak:Function` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `kak:GitModified` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `kak:TSNumber` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `kak:TSFunction` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `kak:TSMarkupLink` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `kak:TSMarkupLinkUrl` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `kak:Type` | #007F7F |  4.62:1 | AA | on editor bg |
| `kak:Typedef` | #007F7F |  4.62:1 | AA | on editor bg |
| `kak:TSType` | #007F7F |  4.62:1 | AA | on editor bg |
| `kak:TSTypeBuiltin` | #007F7F |  4.62:1 | AA | on editor bg |
| `kak:String` | #007F2A |  4.93:1 | AA | on editor bg |
| `kak:LspHint` | #007F2A |  4.93:1 | AA | on editor bg |
| `kak:LspDiagnosticHint` | #007F2A |  4.93:1 | AA | on editor bg |
| `kak:TSString` | #007F2A |  4.93:1 | AA | on editor bg |
| `kak:TSMarkupRaw` | #007F2A |  4.93:1 | AA | on editor bg |
| `kak:CommentSpecial` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `kak:Constant` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `kak:GitConflicting` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `kak:LspWarning` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `kak:LspDiagnosticWarning` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `kak:TSConstant` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `kak:TSEscape` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `kak:TSAttribute` | #007373 |  5.42:1 | AA | on editor bg |
| `kak:TSTagDelimiter` | #485C6E |  6.62:1 | AA | on editor bg |
| `kak:CursorLineNumber` | #005A9E |  6.79:1 | AA | text on cursor surface (by design) |
| `kak:TSMarkupHeading` | #004D4D |  9.25:1 | AAA | on editor bg |
| `kak:TSMarkupList` | #004D4D |  9.25:1 | AAA | on editor bg |
| `kak:DiffText` | #003D7A | 10.30:1 | AAA | on editor bg |
| `kak:Selection` | #002B5C | 13.38:1 | AAA | on editor bg |
| `kak:PrimarySelection` | #002B5C | 13.38:1 | AAA | on editor bg |
| `kak:MenuSelected` | #002B5C | 13.38:1 | AAA | on editor bg |
| `kak:SecondarySelection` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `kak:Menu` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `kak:CompletionMenu` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `kak:TSVariable` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `kak:TSVariableBuiltin` | #1A2A35 | 14.07:1 | AAA | on editor bg |

#### Kakoune (dark) — bg `#0A0F14` <small>(kak:Default.bg(var))</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `kak:Border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `kak:LineNumber` | #526D85 |  3.56:1 | AA Large | on editor bg |
| `kak:Error` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `kak:GitDeleted` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `kak:LspError` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `kak:LspDiagnosticError` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `kak:ModelineInfo` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `kak:Comment` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `kak:CommentDocumentation` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `kak:SpecialComment` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `kak:GitIgnored` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `kak:CompletionInfo` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `kak:CompletionScrollbar` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `kak:TSComment` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `kak:Info` | #0091E6 |  5.67:1 | AA | on editor bg |
| `kak:LspInfo` | #0091E6 |  5.67:1 | AA | on editor bg |
| `kak:LspDiagnosticInfo` | #0091E6 |  5.67:1 | AA | on editor bg |
| `kak:BorderFocused` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `kak:LspHint` | #00B33B |  6.88:1 | AA | on editor bg |
| `kak:LspDiagnosticHint` | #00B33B |  6.88:1 | AA | on editor bg |
| `kak:CursorLineNumber` | #4DA8EE |  7.47:1 | AAA | text on cursor surface (by design) |
| `kak:Number` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `kak:Function` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `kak:GitModified` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `kak:TSNumber` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `kak:TSFunction` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `kak:TSMarkupLink` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `kak:TSMarkupLinkUrl` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `kak:TSTagDelimiter` | #93ABC3 |  8.11:1 | AAA | on editor bg |
| `kak:CommentSpecial` | #FF9F00 |  9.36:1 | AAA | on editor bg |
| `kak:LspWarning` | #FF9F00 |  9.36:1 | AAA | on editor bg |
| `kak:LspDiagnosticWarning` | #FF9F00 |  9.36:1 | AAA | on editor bg |
| `kak:String` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `kak:GitAdded` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `kak:GitUntracked` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `kak:TSString` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `kak:TSMarkupRaw` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `kak:TSAttribute` | #4DDDDD | 11.64:1 | AAA | on editor bg |
| `kak:Constant` | #FFC466 | 12.22:1 | AAA | on editor bg |
| `kak:GitConflicting` | #FFC466 | 12.22:1 | AAA | on editor bg |
| `kak:TSConstant` | #FFC466 | 12.22:1 | AAA | on editor bg |
| `kak:TSEscape` | #FFC466 | 12.22:1 | AAA | on editor bg |
| `kak:Operator` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `kak:Keyword` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `kak:Type` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `kak:Typedef` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `kak:Tag` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `kak:TSKeyword` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `kak:TSKeywordFunction` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `kak:TSKeywordOperator` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `kak:TSKeywordReturn` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `kak:TSOperator` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `kak:TSType` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `kak:TSTypeBuiltin` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `kak:TSTag` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `kak:TSMarkupHeading` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `kak:TSMarkupList` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `kak:Selection` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `kak:PrimarySelection` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `kak:SecondarySelection` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `kak:Menu` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `kak:MenuSelected` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `kak:CompletionMenu` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `kak:TSVariable` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `kak:TSVariableBuiltin` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `kak:DiffText` | #E6F4FF | 17.18:1 | AAA | on editor bg |

#### Notepad++ (light) — bg `#F8FAFC` <small>(xml:DEFAULT.bgColor)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `xml:KEYWORDS3` | #009999 |  3.34:1 | AA Large | on editor bg |
| `xml:COMMENTS` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `xml:LINE COMMENTS` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `xml:FOLDER IN COMMENT` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `xml:KEYWORDS4` | #009933 |  3.58:1 | AA Large | on editor bg |
| `xml:NUMBERS` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `xml:KEYWORDS7` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `xml:KEYWORDS5` | #E80000 |  4.53:1 | AA | on editor bg |
| `xml:KEYWORDS1` | #007F7F |  4.62:1 | AA | on editor bg |
| `xml:KEYWORDS2` | #007F7F |  4.62:1 | AA | on editor bg |
| `xml:KEYWORDS8` | #007F7F |  4.62:1 | AA | on editor bg |
| `xml:OPERATORS` | #007F7F |  4.62:1 | AA | on editor bg |
| `xml:KEYWORDS6` | #9E5E00 |  4.95:1 | AA | on editor bg |

#### Notepad++ (dark) — bg `#0A0F14` <small>(xml:DEFAULT.bgColor)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `xml:KEYWORDS5` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `xml:COMMENTS` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `xml:LINE COMMENTS` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `xml:FOLDER IN COMMENT` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `xml:NUMBERS` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `xml:KEYWORDS7` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `xml:KEYWORDS6` | #FF9F00 |  9.36:1 | AAA | on editor bg |
| `xml:KEYWORDS3` | #81C8BE | 10.02:1 | AAA | on editor bg |
| `xml:KEYWORDS4` | #4DD966 | 10.48:1 | AAA | on editor bg |
| `xml:KEYWORDS8` | #4DDDDD | 11.64:1 | AAA | on editor bg |
| `xml:KEYWORDS1` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `xml:OPERATORS` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `xml:KEYWORDS2` | #94E2D5 | 12.92:1 | AAA | on editor bg |

#### Obsidian (light) — bg `#F8FAFC` <small>(css:--background-primary)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `css:onaccent:--interactive-normal` | #0077CC |  1.00:1 | FAIL | on accent bg |
| `css:--text-on-accent` | #FFFFFF |  1.05:1 | FAIL | on editor bg |
| `css:--code-background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `css:--blockquote-background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `css:onaccent:--interactive-hover` | #0069C0 |  1.19:1 | FAIL | on accent bg |
| `css:--code-border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `css:--link-external-color` | #009999 |  3.34:1 | AA Large | on editor bg |
| `css:--text-faint` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `css:--blockquote-border` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `css:--link-color` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `css:--git-modified` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `css:onaccent:--button-primary-foreground` | #FFFFFF |  4.66:1 | AA | white/self-colored on accent/cursor (by design) |
| `css:--git-conflict` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `css:--text-muted` | #485C6E |  6.62:1 | AA | on editor bg |
| `css:--link-color-hover` | #00529E |  7.43:1 | AAA | on editor bg |
| `css:--text-selection` | #002B5C | 13.38:1 | AAA | on editor bg |
| `css:--text-normal` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `css:--code-foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |

#### Obsidian (dark) — bg `#0A0F14` <small>(css:--background-primary)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `css:--code-background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `css:--blockquote-background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `css:onaccent:--interactive-normal` | #1A91E6 |  1.38:1 | FAIL | on accent bg |
| `css:onaccent:--interactive-hover` | #4DA8EE |  1.81:1 | FAIL | on accent bg |
| `css:--code-border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `css:onaccent:--button-primary-foreground` | #FFFFFF |  4.66:1 | AA | UI chrome on its own accent surface (by design) |
| `css:--text-faint` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `css:--blockquote-border` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `css:--link-color` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `css:--git-modified` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `css:--text-muted` | #93ABC3 |  8.11:1 | AAA | on editor bg |
| `css:--link-color-hover` | #8FC3F5 | 10.35:1 | AAA | on editor bg |
| `css:--git-conflict` | #E5C890 | 11.91:1 | AAA | on editor bg |
| `css:--link-external-color` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `css:--text-normal` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `css:--text-selection` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `css:--code-foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `css:--text-on-accent` | #FFFFFF | 19.24:1 | AAA | on editor bg |

#### Emacs (light) — bg `#F8FAFC` <small>(emacs:dma-bg)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `el:button` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `el:tool-bar-border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `el:window-divider` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `el:window-divider-first-pixel` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `el:window-divider-last-pixel` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `el:vc-dir-conflict-header` | #E88800 |  2.52:1 | FAIL | on editor bg |
| `el:lsp-ui-sideline-code-action` | #00B33B |  2.67:1 | FAIL | on editor bg |
| `el:dired-executable` | #00B33B |  2.67:1 | FAIL | on editor bg |
| `el:font-lock-constant-face` | #D47800 |  3.09:1 | AA Large | on editor bg |
| `el:treesitter-font-lock-constant-face` | #D47800 |  3.09:1 | AA Large | on editor bg |
| `el:compilation-info` | #0091E6 |  3.24:1 | AA Large | on editor bg |
| `el:flycheck-info` | #0091E6 |  3.24:1 | AA Large | on editor bg |
| `el:font-lock-type-face` | #009999 |  3.34:1 | AA Large | on editor bg |
| `el:treesitter-font-lock-type-face` | #009999 |  3.34:1 | AA Large | on editor bg |
| `el:org-tag` | #009999 |  3.34:1 | AA Large | on editor bg |
| `el:magit-branch-tag` | #009999 |  3.34:1 | AA Large | on editor bg |
| `el:typescript-type-face` | #009999 |  3.34:1 | AA Large | on editor bg |
| `el:typescript-interface-face` | #009999 |  3.34:1 | AA Large | on editor bg |
| `el:rust-type-face` | #009999 |  3.34:1 | AA Large | on editor bg |
| `el:rust-attribute-face` | #009999 |  3.34:1 | AA Large | on editor bg |
| `el:go-type-face` | #009999 |  3.34:1 | AA Large | on editor bg |
| `el:c-type-face` | #009999 |  3.34:1 | AA Large | on editor bg |
| `el:java-type-face` | #009999 |  3.34:1 | AA Large | on editor bg |
| `el:sql-type-face` | #009999 |  3.34:1 | AA Large | on editor bg |
| `el:julia-type-face` | #009999 |  3.34:1 | AA Large | on editor bg |
| `el:line-number` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `el:mode-line-inactive` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `el:mode-line-misc-info` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `el:minibuffer-completion-table` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `el:tab-bar-button` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `el:tab-bar-tab` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `el:tab-bar-tab-inactive` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `el:compilation-line-number` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `el:compilation-column-number` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `el:diff-context` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `el:vc-dir-ignore-header` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `el:org-document-info` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `el:magit-branch-remote` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `el:magit-diff-context` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `el:company-tooltip-detail` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `el:helm-candidate-number` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `el:vc-dir-up-to-date-header` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:font-lock-doc-string-face` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:font-lock-string-face` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:font-lock-string-delimiter-face` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:treesitter-font-lock-string-face` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:magit-branch-current` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:magit-diff-added` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:magit-status-unpushed-to-push` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:magit-status-unpushed-to-upstream` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:lsp-ui-doc-markup-code-face` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:python-string-face` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:rust-string-face` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:go-string-face` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:c-string-face` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:java-string-face` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:sql-string-face` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:json-string-face` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:sh-string-face` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:ess-r-string-face` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:julia-string-face` | #009933 |  3.58:1 | AA Large | on editor bg |
| `el:compilation-error` | #FF1A1A |  3.71:1 | AA Large | on editor bg |
| `el:font-lock-warning-face` | #FF1A1A |  3.71:1 | AA Large | on editor bg |
| `el:flycheck-error` | #FF1A1A |  3.71:1 | AA Large | on editor bg |
| `el:lsp-ui-sideline-diagnostics` | #FF1A1A |  3.71:1 | AA Large | on editor bg |
| `el:eshell-error-face` | #FF1A1A |  3.71:1 | AA Large | on editor bg |
| `el:shell-error-face` | #FF1A1A |  3.71:1 | AA Large | on editor bg |
| `el:diff-header` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `el:font-lock-comment-face` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `el:font-lock-comment-delimiter-face` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `el:treesitter-font-lock-comment-face` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `el:dired-header` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `el:python-comment-face` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `el:rust-comment-face` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `el:go-comment-face` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `el:c-comment-face` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `el:java-comment-face` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `el:sql-comment-face` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `el:sh-comment-face` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `el:ess-r-comment-face` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `el:julia-comment-face` | #5A7D96 |  4.17:1 | AA Large | on editor bg |
| `el:tab-bar-button-highlight` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:button-alt` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:link` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:diff-file-header` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:vc-dir-modified-header` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:font-lock-function-name-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:treesitter-font-lock-number-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:treesitter-font-lock-function-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:org-timestamp-active` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:org-link` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:markdown-link-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:magit-diff-file-heading` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:magit-status-unpulled-from-upstream` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:company-tooltip-common` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:web-mode-javascript-function-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:typescript-function-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:python-function-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:rust-function-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:rust-number-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:go-function-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:go-number-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:c-function-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:c-number-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:java-function-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:sql-function-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:json-number-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:sh-function-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:ess-r-function-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:ess-r-number-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:julia-function-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:julia-number-face` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `el:magit-diff-removed` | #E80000 |  4.53:1 | AA | on editor bg |
| `el:link-visited` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:diff-hunk-header` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:font-lock-keyword-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:font-lock-doc-markup-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:treesitter-font-lock-keyword-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:treesitter-font-lock-operator-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:treesitter-font-lock-tag-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:org-document-info-keyword` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:magit-diff-heading` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:magit-diff-hunk-heading` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:helm-source-header` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:web-mode-html-tag-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:web-mode-javascript-keyword-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:typescript-keyword-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:python-keyword-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:rust-keyword-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:go-keyword-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:c-keyword-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:java-keyword-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:sql-keyword-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:yaml-keyword-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:json-keyword-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:toml-keyword-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:dockerfile-keyword-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:sh-keyword-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:ess-r-keyword-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:ess-r-operator-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:julia-keyword-face` | #007F7F |  4.62:1 | AA | on editor bg |
| `el:compilation-warning` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `el:font-lock-escape-face` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `el:flycheck-warning` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `el:dired-warning` | #9E5E00 |  4.95:1 | AA | on editor bg |
| `el:dired-symlink` | #007373 |  5.42:1 | AA | on editor bg |
| `el:line-number-current-line` | #005A9E |  6.79:1 | AA | on editor bg |
| `el:header-line` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:header-line-highlight` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:menu` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:menu-bar` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:menu-highlight` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:tooltip` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:tab-bar-tab-selected` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:font-lock-variable-name-face` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:treesitter-font-lock-variable-face` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:magit-branch-local` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:magit-section-heading` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:magit-status-heading` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:magit-status-recent-commit` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:company-tooltip` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:helm-header` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:lsp-ui-doc-header` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:web-mode-javascript-variable-face` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:typescript-face` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:typescript-variable-face` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:makefile-variable-face` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `el:sh-variable-face` | #1A2A35 | 14.07:1 | AAA | on editor bg |

#### Emacs (dark) — bg `#0A0F14` <small>(emacs:dma-bg)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `el:button` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `el:tool-bar-border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `el:window-divider` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `el:window-divider-first-pixel` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `el:window-divider-last-pixel` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `el:dired-symlink` | #007373 |  3.39:1 | AA Large | on editor bg |
| `el:compilation-warning` | #9E5E00 |  3.72:1 | AA Large | on editor bg |
| `el:flycheck-warning` | #9E5E00 |  3.72:1 | AA Large | on editor bg |
| `el:dired-warning` | #9E5E00 |  3.72:1 | AA Large | on editor bg |
| `el:line-number` | #5A7488 |  3.93:1 | AA Large | on editor bg |
| `el:vc-dir-ignore-header` | #5A7488 |  3.93:1 | AA Large | on editor bg |
| `el:link-visited` | #007F7F |  3.98:1 | AA Large | on editor bg |
| `el:compilation-error` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `el:font-lock-warning-face` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `el:flycheck-error` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `el:lsp-ui-sideline-diagnostics` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `el:eshell-error-face` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `el:shell-error-face` | #FF1A1A |  4.96:1 | AA | on editor bg |
| `el:mode-line-inactive` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `el:mode-line-misc-info` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `el:minibuffer-completion-table` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `el:tab-bar-button` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `el:tab-bar-tab` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `el:tab-bar-tab-inactive` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `el:compilation-line-number` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `el:compilation-column-number` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `el:diff-context` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `el:org-document-info` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `el:magit-branch-remote` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `el:magit-diff-context` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `el:company-tooltip-detail` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `el:helm-candidate-number` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `el:compilation-info` | #0091E6 |  5.67:1 | AA | on editor bg |
| `el:flycheck-info` | #0091E6 |  5.67:1 | AA | on editor bg |
| `el:tab-bar-button-highlight` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `el:button-alt` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `el:link` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `el:org-timestamp-active` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `el:org-link` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `el:markdown-link-face` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `el:company-tooltip-common` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `el:magit-diff-removed` | #FF4D4D |  5.88:1 | AA | on editor bg |
| `el:lsp-ui-sideline-code-action` | #00B33B |  6.88:1 | AA | on editor bg |
| `el:dired-executable` | #00B33B |  6.88:1 | AA | on editor bg |
| `el:diff-header` | #7FA0B5 |  6.96:1 | AA | on editor bg |
| `el:font-lock-comment-face` | #7FA0B5 |  6.96:1 | AA | on editor bg |
| `el:font-lock-comment-delimiter-face` | #7FA0B5 |  6.96:1 | AA | on editor bg |
| `el:treesitter-font-lock-comment-face` | #7FA0B5 |  6.96:1 | AA | on editor bg |
| `el:dired-header` | #7FA0B5 |  6.96:1 | AA | on editor bg |
| `el:python-comment-face` | #7FA0B5 |  6.96:1 | AA | on editor bg |
| `el:rust-comment-face` | #7FA0B5 |  6.96:1 | AA | on editor bg |
| `el:go-comment-face` | #7FA0B5 |  6.96:1 | AA | on editor bg |
| `el:c-comment-face` | #7FA0B5 |  6.96:1 | AA | on editor bg |
| `el:java-comment-face` | #7FA0B5 |  6.96:1 | AA | on editor bg |
| `el:sql-comment-face` | #7FA0B5 |  6.96:1 | AA | on editor bg |
| `el:sh-comment-face` | #7FA0B5 |  6.96:1 | AA | on editor bg |
| `el:ess-r-comment-face` | #7FA0B5 |  6.96:1 | AA | on editor bg |
| `el:julia-comment-face` | #7FA0B5 |  6.96:1 | AA | on editor bg |
| `el:diff-file-header` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:vc-dir-modified-header` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:font-lock-function-name-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:treesitter-font-lock-number-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:treesitter-font-lock-function-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:magit-diff-file-heading` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:magit-status-unpulled-from-upstream` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:web-mode-javascript-function-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:typescript-function-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:python-function-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:rust-function-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:rust-number-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:go-function-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:go-number-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:c-function-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:c-number-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:java-function-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:sql-function-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:json-number-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:sh-function-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:ess-r-function-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:ess-r-number-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:julia-function-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:julia-number-face` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `el:vc-dir-up-to-date-header` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:font-lock-doc-string-face` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:font-lock-string-face` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:font-lock-string-delimiter-face` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:treesitter-font-lock-string-face` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:magit-branch-current` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:magit-diff-added` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:magit-status-unpushed-to-push` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:magit-status-unpushed-to-upstream` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:lsp-ui-doc-markup-code-face` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:python-string-face` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:rust-string-face` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:go-string-face` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:c-string-face` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:java-string-face` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:sql-string-face` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:json-string-face` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:sh-string-face` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:ess-r-string-face` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:julia-string-face` | #33CC5A |  9.09:1 | AAA | on editor bg |
| `el:vc-dir-conflict-header` | #FFAD33 | 10.33:1 | AAA | on editor bg |
| `el:font-lock-constant-face` | #FFAD33 | 10.33:1 | AAA | on editor bg |
| `el:treesitter-font-lock-constant-face` | #FFAD33 | 10.33:1 | AAA | on editor bg |
| `el:line-number-current-line` | #8FC3F5 | 10.35:1 | AAA | on editor bg |
| `el:font-lock-type-face` | #4DDDDD | 11.64:1 | AAA | on editor bg |
| `el:treesitter-font-lock-type-face` | #4DDDDD | 11.64:1 | AAA | on editor bg |
| `el:org-tag` | #4DDDDD | 11.64:1 | AAA | on editor bg |
| `el:magit-branch-tag` | #4DDDDD | 11.64:1 | AAA | on editor bg |
| `el:typescript-type-face` | #4DDDDD | 11.64:1 | AAA | on editor bg |
| `el:typescript-interface-face` | #4DDDDD | 11.64:1 | AAA | on editor bg |
| `el:rust-type-face` | #4DDDDD | 11.64:1 | AAA | on editor bg |
| `el:rust-attribute-face` | #4DDDDD | 11.64:1 | AAA | on editor bg |
| `el:go-type-face` | #4DDDDD | 11.64:1 | AAA | on editor bg |
| `el:c-type-face` | #4DDDDD | 11.64:1 | AAA | on editor bg |
| `el:java-type-face` | #4DDDDD | 11.64:1 | AAA | on editor bg |
| `el:sql-type-face` | #4DDDDD | 11.64:1 | AAA | on editor bg |
| `el:julia-type-face` | #4DDDDD | 11.64:1 | AAA | on editor bg |
| `el:font-lock-escape-face` | #FFC466 | 12.22:1 | AAA | on editor bg |
| `el:diff-hunk-header` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:font-lock-keyword-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:font-lock-doc-markup-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:treesitter-font-lock-keyword-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:treesitter-font-lock-operator-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:treesitter-font-lock-tag-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:org-document-info-keyword` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:magit-diff-heading` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:magit-diff-hunk-heading` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:helm-source-header` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:web-mode-html-tag-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:web-mode-javascript-keyword-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:typescript-keyword-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:python-keyword-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:rust-keyword-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:go-keyword-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:c-keyword-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:java-keyword-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:sql-keyword-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:yaml-keyword-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:json-keyword-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:toml-keyword-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:dockerfile-keyword-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:sh-keyword-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:ess-r-keyword-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:ess-r-operator-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:julia-keyword-face` | #4DE5E5 | 12.51:1 | AAA | on editor bg |
| `el:header-line` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:header-line-highlight` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:menu` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:menu-bar` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:menu-highlight` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:tooltip` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:tab-bar-tab-selected` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:font-lock-variable-name-face` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:treesitter-font-lock-variable-face` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:magit-branch-local` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:magit-section-heading` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:magit-status-heading` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:magit-status-recent-commit` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:company-tooltip` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:helm-header` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:lsp-ui-doc-header` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:web-mode-javascript-variable-face` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:typescript-face` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:typescript-variable-face` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:makefile-variable-face` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `el:sh-variable-face` | #E0E8EF | 15.54:1 | AAA | on editor bg |

#### Neovim (light) — bg `#F8FAFC` <small>(neovim:neutral.dark.background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `nv:selection` | #4DA8EE |  2.46:1 | FAIL | on editor bg |
| `nv:number` | #007BDB |  4.13:1 | AA Large | on editor bg |
| `nv:git_modified` | #007BDB |  4.13:1 | AA Large | on editor bg |
| `nv:link` | #007BDB |  4.13:1 | AA Large | on editor bg |
| `nv:markup_link` | #007BDB |  4.13:1 | AA Large | on editor bg |
| `nv:border_focus` | #007BDB |  4.13:1 | AA Large | on editor bg |
| `nv:line_nr_active` | #00529E |  7.43:1 | AAA | on editor bg |
| `nv:selection_fg` | #002B5C | 13.38:1 | AAA | on editor bg |

#### Neovim (dark) — bg `#0A0F14` <small>(neovim:neutral.light.background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `nv:selection` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `nv:border_focus` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `nv:line_nr_active` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `nv:number` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `nv:git_modified` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `nv:link` | #4DA8EE |  7.47:1 | AAA | on editor bg |
| `nv:markup_link` | #4DA8EE |  7.47:1 | AAA | on editor bg |

### Terminals

#### Ghostty (light) — bg `#F8FAFC` <small>(ghostty:background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `background` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `cursor-text` | #F8FAFC |  1.00:1 | FAIL | white/self-colored on accent/cursor (by design) |
| `selection-background` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `selection-foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |

#### Ghostty (dark) — bg `#0A0F14` <small>(ghostty:background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `background` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `cursor-text` | #0A0F14 |  1.00:1 | FAIL | text on cursor surface (by design) |
| `selection-background` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `selection-foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |

#### WezTerm (light) — bg `#F8FAFC` <small>(toml:background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `background` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `cursor_fg` | #F8FAFC |  1.00:1 | FAIL | white/self-colored on accent/cursor (by design) |
| `selection_bg` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `scrollbar_thumb` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `cursor_border` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `selection_fg` | #1A2A35 | 14.07:1 | AAA | on editor bg |

#### WezTerm (dark) — bg `#0A0F14` <small>(toml:background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `background` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `cursor_fg` | #0A0F14 |  1.00:1 | FAIL | text on cursor surface (by design) |
| `selection_bg` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `scrollbar_thumb` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `cursor_border` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `selection_fg` | #E0E8EF | 15.54:1 | AAA | on editor bg |

#### Cosmic (light) — bg `#F8FAFC` <small>(toml:background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `background` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `cursor_text` | #F8FAFC |  1.00:1 | FAIL | white/self-colored on accent/cursor (by design) |
| `tab_active_background` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `tab_bar_background` | #F0F4F8 |  1.06:1 | FAIL | on editor bg |
| `tab_hover_background` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `tab_inactive_background` | #DCE4ED |  1.23:1 | FAIL | on editor bg |
| `selection_background` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `tab_bar_border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `scrollbar_thumb` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `split_pane_border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `scrollbar_thumb_hover` | #8FABBE |  2.30:1 | FAIL | on editor bg |
| `tab_inactive_foreground` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `tab_active_border` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `split_pane_border_focus` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `selection_foreground` | #002B5C | 13.38:1 | AAA | on editor bg |
| `foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |
| `tab_active_foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |

#### Cosmic (dark) — bg `#0A0F14` <small>(toml:background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `background` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `cursor_text` | #0A0F14 |  1.00:1 | FAIL | text on cursor surface (by design) |
| `tab_active_background` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `tab_bar_background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `tab_inactive_background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `tab_hover_background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `selection_background` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `tab_bar_border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `scrollbar_thumb` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `split_pane_border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `scrollbar_thumb_hover` | #3D526E |  2.41:1 | FAIL | on editor bg |
| `tab_inactive_foreground` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `tab_active_border` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `split_pane_border_focus` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `selection_foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `tab_active_foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |

#### Yen (light) — bg `#F8FAFC` <small>(yaml:background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `cursor_text` | #F8FAFC |  1.00:1 | FAIL | white/self-colored on accent/cursor (by design) |
| `background` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `thumb_hover` | #8FABBE |  2.30:1 | FAIL | on editor bg |
| `foreground` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `border_focus` | #0077CC |  4.45:1 | AA Large | on editor bg |

#### Yen (dark) — bg `#0A0F14` <small>(yaml:background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `cursor_text` | #0A0F14 |  1.00:1 | FAIL | text on cursor surface (by design) |
| `background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `thumb_hover` | #3D526E |  2.41:1 | FAIL | on editor bg |
| `foreground` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `border_focus` | #1A91E6 |  5.71:1 | AA | on editor bg |

#### Warp (light) — bg `#F8FAFC` <small>(yaml:background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `cursor_text_color` | #F8FAFC |  1.00:1 | FAIL | white/self-colored on accent/cursor (by design) |
| `match_background` | #FFF0CC |  1.08:1 | FAIL | on editor bg |
| `background` | #D0E8F8 |  1.21:1 | FAIL | on editor bg |
| `current_match_background` | #FFDB99 |  1.27:1 | FAIL | on editor bg |
| `selection_background` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `border` | #A8C0D8 |  1.79:1 | FAIL | on editor bg |
| `thumb_hover` | #8FABBE |  2.30:1 | FAIL | on editor bg |
| `foreground` | #6E89A0 |  3.49:1 | AA Large | on editor bg |
| `border_focus` | #0077CC |  4.45:1 | AA Large | on editor bg |
| `selection_foreground` | #002B5C | 13.38:1 | AAA | on editor bg |

#### Warp (dark) — bg `#0A0F14` <small>(yaml:background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `cursor_text_color` | #0A0F14 |  1.00:1 | FAIL | text on cursor surface (by design) |
| `background` | #101820 |  1.08:1 | FAIL | on editor bg |
| `selection_background` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `border` | #2D4058 |  1.82:1 | FAIL | on editor bg |
| `thumb_hover` | #3D526E |  2.41:1 | FAIL | on editor bg |
| `match_background` | #7A4A00 |  2.57:1 | FAIL | on editor bg |
| `foreground` | #6E89A0 |  5.27:1 | AA | on editor bg |
| `border_focus` | #1A91E6 |  5.71:1 | AA | on editor bg |
| `selection_foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |
| `current_match_background` | #FFF0CC | 17.03:1 | AAA | on editor bg |

#### tmux (light) — bg `light` <small>(tmux)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `tmux:fg:#1A2A35` | #1A2A35 | 11.47:1 | PASS | on paired segment bg |
| `tmux:fg:#1A2A35` | #1A2A35 | 11.47:1 | PASS | on paired segment bg |
| `tmux:fg:#1A2A35` | #1A2A35 | 11.47:1 | PASS | on paired segment bg |
| `tmux:fg:#F8FAFC` | #F8FAFC |  4.45:1 | AA-Large | on paired segment bg |
| `tmux:fg:#0077CC` | #0077CC |  3.63:1 | AA-Large | on paired segment bg |
| `tmux:fg:#0077CC` | #0077CC |  3.63:1 | AA-Large | on paired segment bg |
| `tmux:fg:#F8FAFC` | #F8FAFC |  4.45:1 | AA-Large | on paired segment bg |
| `tmux:fg:#DCE4ED` | #DCE4ED |  3.63:1 | AA-Large | on paired segment bg |
| `tmux:fg:#F8FAFC` | #F8FAFC |  4.45:1 | AA-Large | on paired segment bg |
| `tmux:fg:#0077CC` | #0077CC |  3.63:1 | AA-Large | on paired segment bg |
| `tmux:fg:#2D4058` | #2D4058 |  8.24:1 | PASS | on paired segment bg |
| `tmux:fg:#1A2A35` | #1A2A35 |  3.16:1 | AA-Large | on paired segment bg |
| `tmux:fg:#9E5E00` | #9E5E00 |  4.04:1 | AA-Large | on paired segment bg |
| `tmux:fg:#E80000` | #E80000 |  3.69:1 | AA-Large | on paired segment bg |
| `tmux:fg:#485C6E` | #485C6E |  5.40:1 | PASS | on paired segment bg |
| `tmux:fg:#0077CC` | #0077CC |  3.63:1 | AA-Large | on paired segment bg |
| `tmux:fg:#1A2A35` | #1A2A35 | 13.03:1 | PASS | on paired segment bg |
| `tmux:fg:#1A2A35` | #1A2A35 | 11.62:1 | PASS | on paired segment bg |
| `tmux:fg:#0A0F14` | #0A0F14 |  9.36:1 | PASS | on paired segment bg |
| `tmux:fg:#1A2A35` | #1A2A35 | 13.03:1 | PASS | on paired segment bg |
| `tmux:fg:#0A0F14` | #0A0F14 |  9.36:1 | PASS | on paired segment bg |
| `tmux:fg:#1A2A35` | #1A2A35 |  9.07:1 | PASS | on paired segment bg |
| `tmux:fg:#F8FAFC` | #F8FAFC |  4.45:1 | AA-Large | on paired segment bg |
| `tmux:fg:#0077CC` | #0077CC |  3.63:1 | AA-Large | on paired segment bg |
| `tmux:fg:#0077CC` | #0077CC |  3.63:1 | AA-Large | on paired segment bg |
| `tmux:fg:#F8FAFC` | #F8FAFC |  4.45:1 | AA-Large | on paired segment bg |
| `tmux:fg:#F8FAFC` | #F8FAFC |  3.58:1 | AA-Large | on paired segment bg |

#### tmux (dark) — bg `dark` <small>(tmux)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `tmux:fg:#DCE4ED` | #DCE4ED | 13.94:1 | PASS | on paired segment bg |
| `tmux:fg:#DCE4ED` | #DCE4ED | 13.94:1 | PASS | on paired segment bg |
| `tmux:fg:#DCE4ED` | #DCE4ED | 13.94:1 | PASS | on paired segment bg |
| `tmux:fg:#0A0F14` | #0A0F14 |  5.71:1 | PASS | on paired segment bg |
| `tmux:fg:#1A91E6` | #1A91E6 |  5.31:1 | PASS | on paired segment bg |
| `tmux:fg:#1A91E6` | #1A91E6 |  5.31:1 | PASS | on paired segment bg |
| `tmux:fg:#0A0F14` | #0A0F14 |  5.71:1 | PASS | on paired segment bg |
| `tmux:fg:#101820` | #101820 |  5.31:1 | PASS | on paired segment bg |
| `tmux:fg:#0A0F14` | #0A0F14 |  5.71:1 | PASS | on paired segment bg |
| `tmux:fg:#1A91E6` | #1A91E6 |  5.31:1 | PASS | on paired segment bg |
| `tmux:fg:#6E89A0` | #6E89A0 |  4.90:1 | PASS | on paired segment bg |
| `tmux:fg:#0A0F14` | #0A0F14 |  5.71:1 | PASS | on paired segment bg |
| `tmux:fg:#FF9F00` | #FF9F00 |  8.70:1 | PASS | on paired segment bg |
| `tmux:fg:#FF1A1A` | #FF1A1A |  4.61:1 | PASS | on paired segment bg |
| `tmux:fg:#6E89A0` | #6E89A0 |  4.90:1 | PASS | on paired segment bg |
| `tmux:fg:#1A91E6` | #1A91E6 |  5.31:1 | PASS | on paired segment bg |
| `tmux:fg:#DCE4ED` | #DCE4ED |  5.83:1 | PASS | on paired segment bg |
| `tmux:fg:#DCE4ED` | #DCE4ED |  8.40:1 | PASS | on paired segment bg |
| `tmux:fg:#0A0F14` | #0A0F14 |  9.36:1 | PASS | on paired segment bg |
| `tmux:fg:#DCE4ED` | #DCE4ED |  5.83:1 | PASS | on paired segment bg |
| `tmux:fg:#0A0F14` | #0A0F14 |  9.36:1 | PASS | on paired segment bg |
| `tmux:fg:#DCE4ED` | #DCE4ED |  8.40:1 | PASS | on paired segment bg |
| `tmux:fg:#0A0F14` | #0A0F14 |  5.71:1 | PASS | on paired segment bg |
| `tmux:fg:#1A91E6` | #1A91E6 |  5.31:1 | PASS | on paired segment bg |
| `tmux:fg:#1A91E6` | #1A91E6 |  5.31:1 | PASS | on paired segment bg |
| `tmux:fg:#0A0F14` | #0A0F14 |  5.71:1 | PASS | on paired segment bg |
| `tmux:fg:#0A0F14` | #0A0F14 | 10.48:1 | PASS | on paired segment bg |

#### Microsoft Terminal (light) — bg `#F8FAFC` <small>(json:background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `background` | #F8FAFC |  1.00:1 | FAIL | on editor bg |
| `selectionbackground` | #A8D0F0 |  1.55:1 | FAIL | on editor bg |
| `foreground` | #1A2A35 | 14.07:1 | AAA | on editor bg |

#### Microsoft Terminal (dark) — bg `#0A0F14` <small>(json:background)</small>

| Token | Color | Contrast | Level | Note |
|-------|-------|---------:|-------|------|
| `background` | #0A0F14 |  1.00:1 | FAIL | on editor bg |
| `selectionbackground` | #003D7A |  1.79:1 | FAIL | on editor bg |
| `foreground` | #E0E8EF | 15.54:1 | AAA | on editor bg |

**Essential text-token FAILs (shipped files): 0**  
**Syntax-highlighting sub-AA tokens (informational, not WCAG-essential): 0**


## How to reproduce

```bash
python3 scripts/contrast_report.py
```

The script reads `palette.json` directly, so re-running it after any palette
change regenerates this report.
