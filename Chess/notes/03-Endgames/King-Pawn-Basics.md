# King & Pawn Endgames - The Foundation

> **Theme**: King & Pawn Basics  
> **Priority**: #1 - Master These First  
> **Aggression**: Universal (technique only)  
> **Estimated Hours**: 8 (but practice forever)

---

## Why K+P First?

1. **All endgames simplify to K+P** - You must evaluate transitions
2. **Pure technique** - No piece confusion, clear principles
3. **High frequency** - 40%+ of endgames reach K+P
4. **Teaches calculation** - Concrete, verifiable, no intuition needed

---

## The 6 Must-Know Concepts

### 1. Rule of the Square
```
Pawn promotes if enemy king CANNOT enter the "square"
```
**Square** = Diagonal from pawn to promotion rank, extended to file edges.

```
8  . . . . . . . .
7  . . . . . . . .
6  . . . . . . . .
5  . . . P . . . .  ← Pawn on d5
4  . . . . K . . .  ← King on e4 = OUTSIDE square → PROMOTES
3  . . . . . . . .
2  . . . . . . . .
1  . . . . . . . .
   a b c d e f g h
```
**Visualize instantly.** Practice until automatic.

---

### 2. Opposition (Direct & Distant)
**Opposition** = Kings on same file/rank/diagonal with **one square between**.

```
Direct:  Ke4 vs Ke6 (file)  |  Kd4 vs Kf4 (rank)  |  Kd4 vs Kf6 (diagonal)
Distant: Ke2 vs Ke6 (3 squares, same file) - SAME PRINCIPLE
```

**Who has opposition?**
- **Direct**: Side NOT to move (can maintain)
- **Distant**: Side to move can TAKE it by moving to correct square

**Rule**: With opposition → win. Without → draw (usually).

---

### 3. Triangulation (Losing a Tempo)
**Maneuver to give opponent the move in SAME position.**

```
White to play, needs Black to move:
Ke1 → Kd2 → Kc3 → Kd3 (triangulation)
```
**Result**: Same position, Black to move → White has opposition → WIN.

**Practice pattern**: Triangle of 3 squares, king circles.

---

### 4. Outside Passed Pawn
**Passed pawn on flank (a/b/g/h file) wins by distracting enemy king.**

```
White: a-pawn passed, Black king on kingside
White king goes to queenside, Black king MUST follow
White king then crosses to kingside, wins pawns
```
**Key**: Calculate the race. King distraction = time gain.

---

### 5. Protected Passed Pawn
**Passed pawn protected by another pawn = permanent asset.**

```
White: c4 pawn protected by b3 pawn
Black king CANNOT capture (would lose b-pawn)
Black king TIED to blockade
White king free to attack elsewhere
```
**Winning method**: Activate king, create second weakness, win.

---

### 6. Breakthrough Patterns
**Sacrifice pawns to create passed pawn.**

Classic:
```
White pawns: a5, b5, c5
Black pawns: a6, b6, c6
White plays a6! bxa6 b6! cxb6 c7! → Promotion
```
**Memorize 3-4 patterns.** They appear constantly.

---

## The Reti Maneuver (King Hunts Two Pawns)
```
White K on g1, Black pawns on h5 and a5
White K moves DIAGONALLY: g1-f2-e3-d4-c5...
Threatens BOTH pawns simultaneously
Result: DRAW (catches both)
```
**Lesson**: King geometry ≠ straight lines. Diagonal = efficiency.

---

## Practical Conversion Checklist

When you reach K+P ending:

1. **Count material** - Who has more pawns?
2. **Identify passed pawns** - Any? Can you create?
3. **Apply Rule of Square** - Can opponent stop promotion?
4. **Check Opposition** - Who has it? Can you take it?
5. **Look for Triangulation** - Need to lose tempo?
6. **Calculate Races** - King vs pawn, pawn vs pawn
7. **Stalemate Alert** - Especially with Rook pawn!

---

## Common Stalemate Traps (AVOID)

| Trap | Position | Avoidance |
|------|----------|-----------|
| **Rook pawn** | K on c7, pawn a7, enemy K on a8 | Don't push to a7! Keep on a6, bring king |
| **Cornered King** | Enemy K on h8, your Q on g7 | Give escape square! |
| **Wrong King** | Your K blocks own pawn | King IN FRONT of pawn! |

---

## Practice Drills (Daily 10 min)

### Drill 1: Opposition (2 min)
Set up: `8/8/8/3k4/3P4/3K4/8/8 w - - 0 1`
- Play vs engine, win 5 in a row
- Time each: target < 15 sec

### Drill 2: Rule of Square (2 min)
Random pawn/king positions
- Instantly say: "Promotes" or "Draw"
- 20 positions, 100% accuracy

### Drill 3: Triangulation (2 min)
Set up: `8/8/8/3k4/3P4/4K3/8/8 w - - 0 1`
- Find triangulation path
- Win 5 in a row

### Drill 4: Outside Passed Pawn (2 min)
`8/1P6/8/3k4/8/3K4/8/8 w - - 0 1`
- Convert 5 in a row

### Drill 5: Breakthrough (2 min)
`8/3P4/2P1P3/3k4/8/3K4/8/8 w - - 0 1`
- Find breakthrough
- 3 patterns memorized

---

## Model Positions to Memorize (FEN + Result)

| Name | FEN | Result | Key Move |
|------|-----|--------|----------|
| Basic Opposition | `8/8/8/3k4/3P4/3K4/8/8 w - - 0 1` | Win | Kd4! |
| Distant Opposition | `8/8/8/3k4/8/3K4/8/8 w - - 0 1` | Win | Kd3! |
| Triangulation | `8/8/8/3k4/3P4/4K3/8/8 w - - 0 1` | Win | Kd2! (triangle) |
| Outside Passed | `8/1P6/8/3k4/8/3K4/8/8 w - - 0 1` | Win | Kc4! |
| Protected Passed | `8/3P4/3k4/3P4/8/3K4/8/8 w - - 0 1` | Win | Kd4! |
| Reti Maneuver | `7k/8/6P1/8/8/8/5K2/8 w - - 0 1` | Draw | Kg2! |
| Breakthrough | `8/3P4/2P1P3/3k4/8/3K4/8/8 w - - 0 1` | Win | a6! / c6! |

---

## Quick Reference Card

```
K+P ENDGAME CHECKLIST:
☐ Count pawns (material)
☐ Passed pawns? Create?
☐ Rule of Square check
☐ Opposition? Who has it?
☐ Triangulation available?
☐ King in FRONT of pawn!
☐ Outside passed = distraction
☐ Protected passed = asset
☐ Breakthrough patterns?
☐ STALEMATE ALERT (rook pawn!)
☐ Calculate, don't guess
☐ King ACTIVE in endgame!
```

---

## Study Plan (8 Hours + Ongoing)

| Session | Focus | Time |
|---------|-------|------|
| 1 | Rule of Square + Opposition (drill to mastery) | 60 min |
| 2 | Triangulation + Reti Maneuver | 60 min |
| 3 | Outside Passed Pawn + Protected Passed | 60 min |
| 4 | Breakthrough Patterns (memorize 4) | 60 min |
| 5 | Model Game 1: Capablanca endgame | 60 min |
| 6 | Model Game 2: Karpov endgame | 60 min |
| 7 | Mixed Drill: 20 random positions | 60 min |
| 8 | Timed Test: 10 positions in 5 min | 60 min |
| **Ongoing** | Daily 10 min drills (rotate) | Forever |

---

## Linked Notes

- [[03-Endgames/Rook-Endgames]] - Most common practical ending
- [[03-Endgames/Minor-Piece-Endgames]] - Bishop/Knight endings
- [[02-Middlegame/Transition-Endgame]] - When to trade into K+P
- [[04-Style-System/Aggression-Spectrum]] - Endgame approach by style
- [[data/endgames/theoretical.json]] - Machine-readable positions
- [[data/endgames/drills.json]] - Structured practice routines

---

*Tag: #endgame #king-pawn #fundamental #technique #universal #daily-drill*