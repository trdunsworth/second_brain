# Chess Education System

A complete, multi-format chess improvement system designed for a beginner (800-1000) to challenge a 1500+ player with 2-3 hours/week study time.

## Quick Start

```bash
# In Obsidian: Open the Chess folder as a vault
# Or browse the Markdown files directly
```

## System Architecture

```
Chess/
├── data/                    # JSON - machine-readable, filterable
│   ├── openings/
│   │   ├── white-repertoires.json
│   │   ├── black-repertoires.json
│   │   └── eco-index.json
│   ├── middlegame/
│   │   ├── themes.json
│   │   ├── plans.json
│   │   └── patterns.json
│   └── endgames/
│       ├── theoretical.json
│       ├── practical.json
│       └── drills.json
│
├── notes/                   # Obsidian-flavored Markdown
│   ├── 00-System/          # System guides, methodology
│   ├── 01-Openings/        # Opening repertoire notes
│   ├── 02-Middlegame/      # Theme & plan notes
│   ├── 03-Endgames/        # Endgame technique notes
│   ├── 04-Style-System/    # Aggression spectrum, style switching
│   ├── 05-Study-Plans/     # Weekly schedules, spaced repetition
│   ├── 06-Practice/        # Positions, puzzles, review
│   └── 07-Game-Analysis/   # Templates, your games
│
├── tools/                   # Simple viewers, converters
│   ├── repertoire-viewer.html
│   └── style-selector.html
│
└── exports/                 # PDF-ready, printable guides
```

## Aggression Spectrum (0-100)

| Level | Name | Description | Best Against |
|-------|------|-------------|--------------|
| 0-20 | **Solid/Positional** | Minimal risk, squeeze slowly | Tactical players, higher rated |
| 21-40 | **Classical** | Principled, flexible, standard theory | Most opponents |
| 41-60 | **Active** | Seize initiative, create problems | Passive players |
| 61-80 | **Aggressive** | Sacrifices, complications, attack | Weaker defenders |
| 81-100 | **Wild/Sharp** | Maximum chaos, computer lines | Unprepared opponents |

## Study Plan (2-3 hrs/week)

| Day | Focus | Time | Method |
|-----|-------|------|--------|
| Mon | Opening Repertoire | 45m | Review 1 line + 5min blitz practice |
| Wed | Middlegame Theme | 45m | Study 1 theme + find 3 examples |
| Fri | Endgame Technique | 45m | 1 theoretical + 2 practical drills |
| Weekend | Game Analysis | 30-60m | Analyze 1 game (yours or model) |

## Style Switching Protocol

1. **Pre-game**: Assess opponent tendencies → pick aggression level
2. **Opening**: Choose repertoire line matching level
3. **Middlegame**: Follow theme/plan for that style
4. **Transition**: Recognize when to shift (simplify vs complicate)
5. **Endgame**: Convert advantage per style

## Quick Commands

- **Obsidian**: `Ctrl+P` → "Chess: Open Repertoire" (after plugin setup)
- **Browser**: Open `tools/repertoire-viewer.html` for interactive filtering
- **CLI**: `python tools/query.py --style 70 --phase opening --color white`

## Progress Tracking

- Each note has `mastery: 0-5` property
- Weekly review updates mastery
- Target: 80% of repertoire at mastery ≥ 3 before tournament

---

*Built for Tony (57, PhD) vs Grandson (14, 1500+). May the best mind win.*