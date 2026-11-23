# Aggression Spectrum - Style Selection & Switching

> **Core Concept**: Chess style is a dial (0-100), not a switch.  
> **Adjust per game, per phase, per position.**

---

## The Spectrum (7 Styles)

| Level | Name | Archetype | Core Philosophy |
|-------|------|-----------|-----------------|
| **0-20** | **Solid/Positional** | Petrosian / Karpov | "Don't lose. Squeeze." |
| **21-40** | **Classical** | Capablanca / Anand / Carlsen | "Best move. Universal." |
| **41-60** | **Active** | Kasparov / Fischer / Nakamura | "Activity > material. Initiative." |
| **61-80** | **Aggressive** | Tal / Shirov / Topalov | "Chaos favors prepared. Sacrifice." |
| **81-100** | **Wild/Sharp** | Morphy / Online Blitz | "Maximum surprise. Entertainment." |

---

## Your Baseline: **35 (Classical)**

**Why?** Principled, flexible, teaches fundamentals, scales to GM.

**Adjust from 35 based on:**

---

## Pre-Game Questionnaire

Before each game, answer and score:

| Factor | Question | Score |
|--------|----------|-------|
| **Tournament** | Must-win / Must-not-lose / Normal? | +20 / -20 / 0 |
| **Opponent Style** | Tactical / Positional / Solid / Unknown? | -10 / +10 / -5 / 0 |
| **Rating Diff** | Higher / Similar / Lower? | -15 / 0 / +15 |
| **Time Control** | Classical / Rapid / Blitz? | -10 / 0 / +15 |
| **Your Form** | Sharp / Tired / Confident / Rusty? | +10 / -15 / +10 / -10 |
| **Opening Prep** | Deep / Shallow / None? | +10 / 0 / -10 |
| **Psychology** | Calm / Anxious / Aggressive / Defensive? | 0 / -10 / +15 / -15 |

**Final Aggression = Clamp(35 + Total, 0, 100)**

---

## Example Calculations

### Scenario 1: Must-win vs lower rated in blitz
```
Baseline: 35
Tournament: +20 (must-win)
Opponent: +15 (lower rated)
Time: +15 (blitz)
Form: +10 (confident)
Prep: +10 (deep)
Psych: +15 (aggressive)
Total: +85 → 100 (Wild)
```
**Play**: King's Gambit, Evans, Benko, Wild lines

### Scenario 2: Must-not-lose vs higher rated in classical
```
Baseline: 35
Tournament: -20 (must-not-lose)
Opponent: -5 (solid)
Rating: -15 (higher)
Time: -10 (classical)
Form: 0 (calm)
Prep: 0 (shallow)
Psych: 0 (calm)
Total: -50 → 0 (Ultra-Solid)
```
**Play**: London, Caro-Kann, Slav, Berlin

### Scenario 3: Normal game, unknown opponent, rapid
```
Baseline: 35
All factors: 0
Total: 35 (Classical)
```
**Play**: Italian, Giuoco Piano, Classical main lines

---

## In-Game Adjustment Triggers

**Shift 1-2 levels MAX per phase. Drastic shifts = inconsistency.**

| Trigger | Adjustment | Reason |
|---------|------------|--------|
| Opening went well, advantage | -10 | Convert solidly |
| Opening went poorly | +15 | Complicate, create chances |
| Opponent playing passively | +10 | Seize initiative |
| Opponent playing sharply | -10 | Solidify, don't walk into prep |
| Your time low | -15 | Simplify, avoid calculation |
| Opponent time low | +15 | Complicate, create decisions |
| Must-win late tournament | +20 | All-out |
| Comfortable draw OK | -20 | Solid draw |

---

## Repertoire by Aggression

### White
| Aggression | Primary | Secondary | Situational |
|------------|---------|-----------|-------------|
| 0-20 | London, English | - | - |
| 21-40 | Italian (Giuoco Piano), London | English | - |
| 41-60 | Scotch, Italian | London, English | - |
| 61-80 | Evans, King's Gambit | Scotch, Italian | - |
| 81-100 | Danish, Center Game, Wild | Evans, King's Gambit | - |

### Black vs 1.e4
| Aggression | Primary | Secondary | Situational |
|------------|---------|-----------|-------------|
| 0-20 | Caro-Kann | - | - |
| 21-40 | 1...e5 (Berlin/Classical), Caro-Kann | - | - |
| 41-60 | Sicilian (Scheveningen/Classical) | 1...e5, Caro-Kann | - |
| 61-80 | French (Winawer), Scandinavian | Sicilian | - |
| 81-100 | From's, Borg, St. George | French, Scandinavian | - |

### Black vs 1.d4
| Aggression | Primary | Secondary | Situational |
|------------|---------|-----------|-------------|
| 0-20 | Slav | - | - |
| 21-40 | QGD, Slav | - | - |
| 41-60 | KID, Grünfeld | QGD, Slav | - |
| 61-80 | Benko, Benoni, Dutch | KID, Grünfeld | - |
| 81-100 | Englund, Wild | Benko, Dutch | - |

---

## Phase-by-Phase Style

| Phase | Solid (0-20) | Classical (21-40) | Active (41-60) | Aggressive (61-80) |
|-------|--------------|-------------------|----------------|-------------------|
| **Opening** | System lines, prophylaxis | Main lines, flexible | Active lines, initiative | Gambits, sacrifices |
| **Middlegame** | Prevent plans, squeeze | Classical piece play | Create threats, seize initiative | Attack king, sacrifices |
| **Transition** | Trade into wins | Favorable simplification | Flexible: keep pieces if attack | Avoid trades, complicate |
| **Endgame** | Technique, known wins | Excellent technique | Dynamic: activity > material | Perpetual, king walks |

---

## Position-Based Override

**Position type TRUMPS chosen style.** (See [[Position-Matcher]])

| Position Type | Required Aggression |
|---------------|---------------------|
| Opposite-side castling | 55+ (MUST attack) |
| King stuck in center | 75+ (MUST attack) |
| Development lead | 55+ (Cash in NOW) |
| Weak king shelter | 55+ (Attack) |
| Closed center | 0-40 (Maneuver) |
| IQP (you have it) | 41+ (Active) |
| IQP (opponent has) | 0-35 (Blockade) |
| Opposite-color bishops | 55+ (Middlegame) / 0-20 (Endgame) |
| Symmetrical | 0-35 (Technique) |

---

## Psychological Warfare

| Your Style | Opponent Feels | Exploit |
|------------|----------------|---------|
| Solid | Frustrated, presses | Induce errors |
| Classical | Unpredictable, respect | No weaknesses |
| Active | Pressured, reactive | Force decisions |
| Aggressive | Intimidated, exhausted | Time pressure |
| Wild | Confused, out of book | Tactical chaos |

---

## Training by Style

| Style | Model Players | Study Focus |
|-------|---------------|-------------|
| Solid | Petrosian, Karpov, Kramnik, Ding | Prophylaxis, Endgames |
| Classical | Capablanca, Smyslov, Anand, Carlsen | Universal, Technique |
| Active | Kasparov, Fischer, Nakamura, Firouzja | Calculation, Initiative |
| Aggressive | Tal, Shirov, Topalov, Neiksans | Tactics, Intuition, Sacrifices |
| Wild | Morphy, Online Blitz GMs | Tactics, Offbeat, Fun |

---

## Quick Reference Card

```
STYLE SELECTOR (pre-game):
☐ Tournament situation?
☐ Opponent style/rating?
☐ Time control?
☐ My form today?
☐ Opening prep depth?
☐ Psychological state?
☐ Calculate: 35 + adjustments
☐ Clamp 0-100
☐ Select repertoire lines
☐ Note in-game triggers

IN-GAME:
☐ Opening assessment → adjust
☐ Position type override?
☐ Time trouble → adjust
☐ Tournament situation → adjust
☐ Max 1-2 level shift per phase
```

---

## Linked Notes

- [[System-Guide]] - Master overview
- [[04-Style-System/Position-Matcher]] - Auto-classify positions
- [[01-Openings/London-System]] - Solid (0-20)
- [[01-Openings/Italian-Game]] - Classical (21-40)
- [[01-Openings/Caro-Kann]] - Solid (0-20)
- [[01-Openings/Slav-Defense]] - Solid (0-20)
- [[02-Middlegame/Center-Control]] - Structure by aggression
- [[02-Middlegame/King-Safety-Attack]] - Aggressive themes
- [[03-Endgames/King-Pawn-Basics]] - Endgame by style
- [[data/style-system/aggression-spectrum.json]] - Machine-readable
- [[data/style-system/position-matcher.json]] - Position classification

---

*Tag: #style #aggression #spectrum #selection #switching #psychology*