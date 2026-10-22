# Obsidian Templater Hotkeys Reference

## Daily Journal & Tracking Hotkeys

| Hotkey | Template | Description |
|--------|----------|-------------|
| `Alt+H` | `habit_tracker_template_templater.md` | Insert Habit Tracker at cursor |
| `Alt+M` | `daily_mood_log_template_templater.md` | Insert Daily Mood Log (TEAM-CBT) - configurable 1-3 entries |
| `Alt+P` | `personal_measurements_template_templater.md` | Insert Personal Measurements (5 domains, ~55 prompts) |
| `Alt+Shift+P` | `personal_measurements_quick_template_templater.md` | Insert Quick Personal Measurements (numeric only) |
| `Alt+Shift+R` | `daily_reflection_template_templater.md` | Insert Daily Reflection (goal selection + progress) |
| `Alt+T` | `daily_log_template_templater.md` | Insert Full Daily Log (comprehensive daily driver) |

## Blog & Content Hotkeys

| Hotkey | Template | Description |
|--------|----------|-------------|
| `Shift+Alt+B` | `blog_idea_capture_template_templater.md` | Insert Blog Idea Capture template |
| `Mod+Shift+B` | `blog_idea_capture_template.md` | Insert original Blog Idea Capture (Handlebars syntax) |
| `Alt+B` | `blog_post_template.md` | Insert Full Blog Post template (Quarto) |

## File Creation Hotkeys

| Hotkey | Command | Description |
|--------|---------|-------------|
| `Mod+N` | `file-explorer:new-file` | Create new file |
| `Alt+Mod+N` | `templater-obsidian:create-Templates/scripts/daily_log_template.md` | Create new file from Daily Log template |

## Notes

- All templates with `_templater.md` suffix use the **execution-block-at-top pattern** - all prompts collected before rendering, works correctly with hotkey insertion (`tp.file.include()`)
- Templates without `_templater` suffix use Handlebars `{{ }}` syntax and may not prompt correctly when inserted via hotkey
- Timeout increased to 120s to accommodate large templates (Personal Measurements = 55+ prompts)
- Only `*_templater.md` files belong in Templater's hotkey list. Legacy `{{ }}` core files are
  no longer bound (rebound to their `*_templater.md` twins on 2026-10-22). If a future edit
  re-adds a core file, it will insert unexpanded `{{ }}` markup.

## Fixed misbindings (2026-10-22)

The three previously-broken bindings are now pointed at their working twins:

| Hotkey | Now bound to | Notes |
|--------|--------------|-------|
| `Alt+Mod+N` | `daily_log_template_templater.md` (insert) | switched from `create-` to insert |
| `Alt+B` | `blog_post_template_templater.md` | was `blog_post_template.md` |
| `Mod+Shift+B` | `blog_idea_capture_template_templater.md` | was `blog_idea_capture_template.md` |

> ### These hotkeys depend on a setting that lives outside the vault
>
> Templater's **Trigger Templater on new file creation** (*Settings → Templater*) must be on for
> the auto-triggered daily journal template to fire. As of Templater 2.26.0 this flag is stored in
> per-device localStorage, **not** in `data.json`, so it does not travel via git sync and does not
> survive a reinstall. A Templater upgrade deletes the old value and defaults it to `false`
> without warning, which leaves new daily notes empty. Check it first if the journal template
> stops firing — nothing in this repo can restore it for you.

## Usage

1. Open your daily journal note (or any note)
2. Press hotkey at desired cursor position
3. Complete prompts sequentially
4. Template renders with your responses

## Template Files Location

All templates: `/Templates/scripts/`
- `*_templater.md` = Templater syntax (prompts work with hotkeys)
- `*.md` = Original Handlebars syntax (reference/legacy)

