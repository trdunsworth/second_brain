# Chess Tools

Interactive HTML tools for the Chess Education System. Open in any modern browser.

## Tools

### 1. Repertoire Viewer (`repertoire-viewer.html`)
**Purpose**: Filter and explore your opening repertoire

**Features**:
- Filter by color (White/Black), aggression range, style, priority
- Search by name, ECO, moves, description
- Expandable rows show full details: description, best/avoid against, key ideas, main lines, model games, tags
- Statistics dashboard

**Data Source**: `../data/openings/white-repertoires.json`, `../data/openings/black-repertoires.json`

**Usage**:
```bash
# From Chess/tools directory
# Option 1: Double-click to open
# Option 2: Serve locally (required for fetch)
python -m http.server 8000
# Then open http://localhost:8000/repertoire-viewer.html
```

### 2. Style Selector (`style-selector.html`)
**Purpose**: Pre-game questionnaire → aggression level + repertoire recommendations

**Features**:
- 7 questions covering tournament situation, opponent, rating, time control, form, prep, psychology
- Real-time calculation from baseline 35 (Classical)
- Shows recommended repertoire lines for White, Black vs 1.e4, Black vs 1.d4
- In-game adjustment triggers reference

**Data Source**: Embedded (mirrors `../data/style-system/aggression-spectrum.json`)

**Usage**: Open directly in browser - no server needed.

### 3. Position Matcher (`position-matcher.html`)
**Purpose**: Analyze position → style recommendation + key themes

**Features**:
- Accepts FEN or natural language description
- Example buttons for common position types
- Detects 10 position types (opposite castling, king in center, development lead, weak king, closed/open center, IQP, symmetric, opposite bishops)
- Shows recommended aggression range, key themes to study, approaches to avoid, style warnings
- Quick reference grid

**Data Source**: Embedded (mirrors `../data/style-system/position-matcher.json`)

**Usage**: Open directly in browser - no server needed.

## Running Locally

The Repertoire Viewer uses `fetch()` to load JSON data, which requires a local server due to CORS policy.

### Quick Start (Python)
```bash
cd Chess/tools
python -m http.server 8000
# Open http://localhost:8000
```

### Quick Start (Node.js)
```bash
cd Chess/tools
npx serve .
# Open shown URL
```

### Quick Start (VS Code)
1. Install "Live Server" extension
2. Right-click `repertoire-viewer.html` → "Open with Live Server"

## Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Data Flow

```
JSON Data (../data/) 
    → Repertoire Viewer (reads white/black repertoires)
    → Style Selector (embedded copy of aggression-spectrum.json)
    → Position Matcher (embedded copy of position-matcher.json)
```

## Updating Data

1. Edit JSON files in `../data/`
2. For Style Selector & Position Matcher: Also update embedded data in HTML files
3. Or: Modify HTML to fetch from JSON (requires server)

## Troubleshooting

**Repertoire Viewer shows "Failed to load data"**
- You're opening file directly (`file://` protocol)
- **Fix**: Run local server (see above)

**Style Selector/Position Matcher not updating**
- They use embedded data, not JSON fetch
- Edit the `<script>` section in the HTML file

**Mobile display issues**
- Tools are responsive but best on desktop/tablet
- Use landscape mode on phone

## Customization

### Add New Repertoire Lines
Edit `../data/openings/white-repertoires.json` or `black-repertoires.json`:
```json
{
  "id": "my-new-line",
  "name": "My Line",
  "aggression": 45,
  "style": "Active",
  "eco": "B20",
  "moves": "1.e4 c5 2.Nf3 d6 3.d4",
  "description": "...",
  "bestAgainst": [...],
  "avoidAgainst": [...],
  "keyIdeas": [...],
  "mainLines": [...],
  "studyPriority": 3,
  "estimatedHours": 8,
  "modelGames": [...],
  "tags": [...]
}
```

### Adjust Style Scoring
Edit the `calculateResult()` function in `style-selector.html` or the scoring table in `aggression-spectrum.json`.

### Add Position Types
Edit the `positionTypes` array in `position-matcher.html` or `position-matcher.json`.

## Integration with Obsidian

Add to your vault's `tools/` folder. Can be opened via:
- `app://local/Chess/tools/repertoire-viewer.html` (with Local Server plugin)
- File → Open in browser
- Custom plugin to embed in notes

---

*Part of the Chess Education System. See `../README.md` for full documentation.*