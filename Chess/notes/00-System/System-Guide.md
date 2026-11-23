# Chess Education System - Master Guide

> **Target**: Tony (57, PhD, ~800-1000) vs Grandson (14, 1500+)
> **Time**: 2-3 hours/week
> **Formats**: Obsidian notes + JSON data + HTML tools + PDF exports

---

## System Overview

This system gives you a **complete chess education** from openings through endgames, with a unique **aggression spectrum (0-100)** that lets you dial your style to match any position or opponent.

### The Aggression Spectrum

| Level | Name | When to Use |
|-------|------|-------------|
| **0-20** | Solid/Positional | Higher rated, must-not-lose, tactical opponents |
| **21-40** | Classical | Most games, standard tournament play |
| **41-60** | Active | Passive opponents, must-win, initiative opportunities |
| **61-80** | Aggressive | Unprepared opponents, psychological pressure, blitz |
| **81-100** | Wild/Sharp | Desperate, surprise, entertainment |

**Key Insight**: You don't pick ONE style. You **shift 1-2 levels per phase** based on position.

---

## Weekly Routine (2.5 hrs)

| Day | Focus | Time | What You Do |
|-----|-------|------|-------------|
| **Mon** | White Repertoire | 45m | Review 1 line → 2 blitz games → quick analysis |
| **Tue** | Middlegame Theme | 45m | Study 1 theme → 3 model games → 1 training game |
| **Wed** | Black vs 1.e4 | 45m | Review 1 line → 2 blitz games → quick analysis |
| **Thu** | Endgame Drills | 45m | 3 drill types (theoretical, conversion, defense) |
| **Fri** | Black vs 1.d4/Other | 45m | Review 1 line → 2 blitz games → quick analysis |
| **Sat** | **Your Game Analysis** | 60m | Deep analysis of 1 recent game (no engine first!) |
| **Sun** | Model Game + Review | 60m | Play through 1 master game → weekly metrics review |

---

## Your Repertoire (Beginner-Optimized)

### As White
1. **Primary**: **London System** (1.d4 d5 2.Bf4) - Solid, low theory, scales to 2000+
2. **Secondary**: **Italian Game** (1.e4 e5 2.Nf3 Nc6 3.Bc4) - Classical, teaches fundamentals
3. **Situational**: **English Opening** (1.c4) - Flexible, avoids prep

### As Black
1. **vs 1.e4**: **Caro-Kann** (1...c6) - Rock solid, world champion approved
2. **vs 1.d4**: **Slav Defense** (1...d5 2.c4 c6) - Solid, flexible, avoids QGA issues
3. **Situational**: **1...e5** (Classical) - When you want open play

### Avoid Until 1400+
- Sicilian Defense (too much theory)
- King's Indian/Grünfeld (too complex)
- Gambits (King's Gambit, Evans, Benko) - high risk
- Wild/offbeat lines

---

## Style Selection Protocol

### Before Each Game
Ask yourself:
1. Tournament situation? (must-win / must-not-lose / normal)
2. Opponent style? (tactical / positional / solid / unknown)
3. Rating difference? (higher / similar / lower)
4. Time control? (classical / rapid / blitz)
5. My form today? (sharp / tired / confident / rusty)
6. Opening prep? (deep / shallow / none)

**Baseline = 35 (Classical)**. Adjust ± from there.

### During Game - Shift Triggers
| Situation | Adjustment |
|-----------|------------|
| Opening went well, advantage | -10 (convert solidly) |
| Opening went poorly | +15 (complicate) |
| Opponent passive | +10 (seize initiative) |
| Opponent sharp | -10 (solidify) |
| My time low | -15 (simplify) |
| Opponent time low | +15 (complicate) |
| Must-win late tournament | +20 |
| Comfortable draw OK | -20 |

---

## Learning Methodology

### 1. Active Recall > Passive Reading
- **Don't just read** lines. Cover moves, predict, verify.
- **Don't just watch** games. Predict each move.

### 2. Spaced Repetition
- Review at: 1 day → 3 days → 1 week → 1 month → 3 months
- Use Obsidian flashcards or Anki for:
  - Critical opening branches
  - Theoretical endgame positions
  - Middlegame theme keywords
  - Your game errors

### 3. Interleaving
- Mix openings, middlegame, endgame each week
- Don't block study (all openings Monday, all endings Tuesday)

### 4. Your Games = Highest ROI
- Analyze **without engine first** (20 min)
- Then check with engine (20 min)
- Extract **3 lessons** per game
- Update repertoire if opening issue

---

## Data Files (Machine-Readable)

All structured data in `Chess/data/`:
- `openings/white-repertoires.json` - Your White lines with aggression tags
- `openings/black-repertoires.json` - Your Black lines with aggression tags
- `openings/eco-index.json` - ECO code reference
- `middlegame/themes.json` - 8 core themes with aggression mapping
- `middlegame/plans.json` - Concrete plans linked to openings
- `endgames/theoretical.json` - 25 must-know positions
- `endgames/practical.json` - Decision guides, scenarios
- `endgames/drills.json` - Structured practice routines
- `style-system/aggression-spectrum.json` - 7 styles with mappings
- `style-system/position-matcher.json` - Position classification
- `study-plans/weekly-schedule.json` - Optimized schedule
- `practice/positions.json` - Curated practice positions

---

## Tools

| Tool | Location | Use |
|------|----------|-----|
| Repertoire Viewer | `tools/repertoire-viewer.html` | Filter lines by style/color/ECO |
| Style Selector | `tools/style-selector.html` | Pre-game questionnaire → aggression level |
| Position Matcher | `tools/position-matcher.html` | Paste FEN → get style recommendation |

---

## Progress Tracking

### Weekly (Sunday)
- [ ] Hours studied (target: 2.5-3)
- [ ] Opening lines reviewed (target: 3-4)
- [ ] Middlegame theme studied (target: 1)
- [ ] Endgame drills done (target: 5)
- [ ] Game analyzed (target: 1)
- [ ] Model game studied (target: 1)

### Monthly (Last Sunday)
- Repertoire mastery % (target: 80% at level 3+)
- Theoretical endgames mastered (target: 25/25)
- Conversion rate from +1 positions
- Defense hold rate
- Transition accuracy
- Tournament results

### Quarterly
- 5 classical games (30+ min)
- Full analysis
- Major plan revision

---

## Emergency Mode (< 1 hr/week)

**Minimum viable study:**
1. 10 min: 1 theoretical endgame drill
2. 10 min: Review 1 opening line
3. 10 min: 5 tactics (middlegame themes)

*Consistency maintains neural pathways. Something > nothing.*

---

## Next Steps

1. **Open `Chess/data/openings/white-repertoires.json`** → Start with London System
2. **Open `Chess/data/openings/black-repertoires.json`** → Start with Caro-Kann
3. **Read `Chess/notes/01-Openings/London-System.md`** → First opening guide
4. **Try `tools/style-selector.html`** → Before next game
5. **Schedule Week 1** in your calendar

---

*Remember: The goal isn't to become a GM. It's to give your 1500+ grandson a genuine challenge and enjoy the journey. Every hour invested compounds.*

**Good luck, Tony. May the best mind win.** ♟️