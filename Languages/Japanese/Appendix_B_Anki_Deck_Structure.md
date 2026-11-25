# Anki Deck Structure for Japanese (Ankiデッキ構造)

## Philosophy: Minimum Viable Decks

**Principle**: **Fewer decks, better cards**. One main deck + targeted filtered decks. Avoid deck proliferation.

---

## Recommended Deck Architecture

### 1. Main Deck: `Japanese::Core` (Single Deck)
**All active cards go here**. Use **tags** for filtering, not subdecks.

```
Japanese::Core
├── #vocab        (Vocabulary cards)
├── #kanji        (Kanji recognition/production)
├── #grammar      (Grammar pattern cards)
├── #sentence     (Sentence/context cards)
├── #audio        (Listening cards)
├── #production   (Output practice)
├── #leeched      (Problem cards - filtered)
└── #suspended    (On hold)
```

### 2. Filtered Decks (Dynamic, Auto-Generated)
Create via **Tools → Create Filtered Deck**

| Filtered Deck | Search Query | Purpose |
|---------------|--------------|---------|
| **Daily Reviews** | `deck:"Japanese::Core" is:due` | Main study session |
| **New Cards** | `deck:"Japanese::Core" is:new` | Limit new cards/day |
| **Kanji Focus** | `deck:"Japanese::Core" tag:#kanji` | Kanji-only session |
| **Grammar Drill** | `deck:"Japanese::Core" tag:#grammar` | Grammar patterns |
| **Listening** | `deck:"Japanese::Core" tag:#audio` | Audio-only practice |
| **Production** | `deck:"Japanese::Core" tag:#production` | Output practice |
| **Leech Crusher** | `deck:"Japanese::Core" tag:#leeched` | Problem cards |
| **Cramming** | `deck:"Japanese::Core" is:review prop:ivl<7` | Short-interval review |

---

## Note Types (Card Templates)

### 1. Basic Vocabulary (Recognition)
```
Note Type: Basic (or Custom "Japanese Vocab")
Fields:
- Expression (Kanji + Kana)     ← Front
- Reading (Hiragana only)
- Meaning (English)
- Example Sentence (Japanese)
- Example Translation
- Audio (optional)
- Tags: #vocab #N5 #food etc.

Card 1: Recognition
Front: {{Expression}}
Back: {{Reading}} | {{Meaning}} | {{Example Sentence}} | {{Example Translation}} | {{Audio}}

Card 2: Reading Recall (Optional)
Front: {{Meaning}}
Back: {{Expression}} | {{Reading}} | {{Example Sentence}}
```

### 2. Kanji Recognition
```
Note Type: Japanese Kanji
Fields:
- Kanji (Single character)
- Keyword (Heisig meaning)
- On'yomi (Katakana)
- Kun'yomi (Hiragana)
- Meaning (English)
- Example Words (3-5)
- Components (Primitive breakdown)
- Tags: #kanji #RTK500 #grade1

Card 1: Recognition
Front: {{Kanji}}
Back: {{Keyword}} | {{On'yomi}} | {{Kun'yomi}} | {{Meaning}} | {{Example Words}} | {{Components}}

Card 2: Keyword → Kanji (Optional, Production)
Front: {{Keyword}}
Back: {{Kanji}} | {{On'yomi}} | {{Kun'yomi}}
```

### 3. Sentence Card (Context-Based) - **MOST IMPORTANT**
```
Note Type: Japanese Sentence (Cloze or Basic)
Fields:
- Sentence (Full Japanese)
- Translation (English)
- Target Word (Bolded in sentence)
- Target Reading
- Target Meaning
- Audio (Sentence)
- Notes (Grammar notes, nuances)
- Tags: #sentence #grammar #N3 #conditional

Card 1: Sentence Comprehension (Cloze)
Front: {{cloze:Sentence}}  (Target word hidden)
Back: {{Sentence}} | {{Translation}} | {{Target Reading}} | {{Target Meaning}} | {{Notes}} | {{Audio}}

Card 2: Listening (Optional)
Front: {{Audio}}
Back: {{Sentence}} | {{Translation}}
```

### 4. Grammar Pattern Card
```
Note Type: Japanese Grammar
Fields:
- Pattern (e.g., 「Verb-てform + もいい」)
- Meaning (English: "May do...")
- Structure (Verb-て + も + いい)
- Example 1 (Sentence + Translation)
- Example 2
- Example 3
- Conjugation Notes
- Related Patterns
- Tags: #grammar #permission #N4

Card 1: Pattern → Meaning
Front: {{Pattern}}
Back: {{Meaning}} | {{Structure}} | {{Example 1}} | {{Example 2}} | {{Conjugation Notes}} | {{Related Patterns}}

Card 2: Meaning → Pattern (Production)
Front: {{Meaning}}
Back: {{Pattern}} | {{Structure}} | {{Example 1}}
```

### 5. Audio/Listening Card
```
Note Type: Japanese Audio
Fields:
- Audio (Front)
- Sentence (Japanese)
- Translation
- Target Word
- Notes
- Tags: #audio #listening #N3

Card 1: Audio → Text
Front: {{Audio}}
Back: {{Sentence}} | {{Translation}} | {{Notes}}

Card 2: Dictation (Optional)
Front: {{Audio}} (Type what you hear)
Back: {{Sentence}} | {{Translation}}
```

### 6. Production/Output Card
```
Note Type: Japanese Production
Fields:
- Prompt (English situation: "Ask permission to enter")
- Target Pattern (「入ってもいいですか」)
- Example Response
- Variations
- Tags: #production #speaking #permission

Card 1: Prompt → Japanese
Front: {{Prompt}}
Back: {{Target Pattern}} | {{Example Response}} | {{Variations}}

Card 2: Shadowing (Optional)
Front: {{Audio of Example}}
Back: {{Target Pattern}} | {{Example Response}}
```

---

## Tag Taxonomy (Standardized)

### Level Tags
- `#N5` `#N4` `#N3` `#N2` `#N1` `#Native`

### Source Tags
- `#Core2000` `#TangoN5` `#Tobira` `#Genki` `#Mining` `#Anime` `#Manga` `#Novel` `#News` `#JLPT`

### Category Tags
- `#vocab` `#kanji` `#grammar` `#sentence` `#audio` `#production` `#idiom` `#keigo` `#onomatopoeia` `#dialect`

### Part-of-Speech
- `#verb` `#iadj` `#nadj` `#noun` `#particle` `#adverb` `#conjunction` `#counter`

### Status Tags
- `#leeched` `#suspended` `#new` `#mature` `#young` `#relearning`

### Custom Project Tags
- `#Project_News` `#Project_Novel` `#Project_Business` `#Project_JLPT_N2`

---

## Deck Options (Settings) - Optimized for Japanese

### Main Deck Options (`Japanese::Core`)

#### New Cards
- **Steps (minutes)**: `10 1440 4320 12960` (10 min, 1 day, 3 days, 9 days)
- **New cards/day**: `15-20` (adjust to 30 min total study)
- **New card order**: `Random` (or `Order added` for structured)
- **Graduating interval**: `1` day
- **Easy interval**: `4` days

#### Reviews
- **Maximum reviews/day**: `200` (adjust to time)
- **Easy bonus**: `1.3`
- **Interval modifier**: `1.0` (default)
- **Maximum interval**: `36500` (100 years)
- **New interval** (lapse): `0.1` (reset to 10%)
- **Minimum interval** (lapse): `1` day
- **Leech threshold**: `8` lapses
- **Leech action**: `Tag only` (creates #leeched tag)

#### Display
- **Show answer timer**: `Off` (or 30 sec)
- **Auto-play audio**: `On` (for audio cards)

### Filtered Deck Options (Daily Reviews)
- **Cards**: `200` max
- **Order**: `Due date` (oldest first)
- **Reschedule**: `On` (updates main deck scheduling)

---

## Card Creation Workflow (Mining Pipeline)

### 1. Source Encounter
- Reading (novel, news, manga)
- Listening (podcast, anime, drama)
- Conversation
- Textbook

### 2. Capture (Immediate)
- **Yomichan** (browser) → `Alt+Click` → `Send to Anki` (auto-fills)
- **AnkiDroid** (mobile) → `Share` → `Add to Anki`
- **Manual** → `Add` → Paste sentence, highlight target

### 3. Card Creation (Batch - Weekly)
1. **Review** mined items
2. **Select** best 10-20 for cards
3. **Enrich**: Add audio (TTS/Forvo), translation, notes
4. **Tag** appropriately
5. **Add** to `Japanese::Core`

### 4. Maintenance (Weekly)
- **Leeches**: Review `#leeched` → simplify, split, or suspend
- **Stats**: Check retention (target 85-90%)
- **Balance**: Adjust new cards/day based on review load

---

## Specialized Deck Setups

### For JLPT Focus
```
Japanese::JLPT_N2
├── N2_Vocab (filtered from Core #N2 #vocab)
├── N2_Grammar (filtered #N2 #grammar)
├── N2_Kanji (filtered #N2 #kanji)
├── N2_Listening (filtered #N2 #audio)
└── Mock_Exams (separate deck)
```

### For Domain Specialization
```
Japanese::Business
├── Biz_Vocab (#business #vocab)
├── Biz_Keigo (#business #keigo)
├── Biz_Email_Templates (#business #production)
└── Biz_Meetings (#business #audio)

Japanese::Medical
├── Med_Vocab (#medical #vocab)
├── Med_Kanji (#medical #kanji)
└── Med_Phrases (#medical #production)
```

### For Literature Project
```
Japanese::Literature_Project
├── Novel_Vocab (#mining #novel #vocab)
├── Novel_Kanji (#mining #novel #kanji)
├── Literary_Grammar (#literary #grammar)
└── Author_Specific (#author_name)
```

---

## Anki Add-ons (Essential for Japanese)

| Add-on | Code | Function |
|--------|------|----------|
| **Japanese Support** | `3918629684` | Furigana auto, cloze, stats |
| **Yomichan Integration** | `1779096261` | Browser → Anki mining |
| **Heatmap** | `1779096261` | Visual streak calendar |
| **Review Heatmap** | `1779096261` | Alternative heatmap |
| **More Stats** | `1779096261` | Advanced analytics |
| **Cloze Overlapper** | `1779096261` | Overlapping clozes for sentences |
| **Morphman** | `1779096261` | Optimal learning order (i+1) |
| **HyperTTS** | `1779096261` | High-quality TTS audio |
| **Auto TTS** | `1779096261` | Auto-generate audio on add |
| **Image Occlusion** | `1779096261` | Image-based cards |

---

## Anki Stats Targets (Health Metrics)

| Metric | Target | Action if Off |
|--------|--------|---------------|
| **Retention (Young)** | 85-90% | Increase interval modifier / easier cards |
| **Retention (Mature)** | 90-95% | Normal |
| **Lapse Rate** | < 10% | Simplify cards, add context |
| **Leech %** | < 5% | Tag, simplify, or suspend |
| **Reviews/Day** | Sustainable (30-60 min) | Adjust new cards/day |
| **New Cards/Day** | 10-20 | Based on review load |
| **Ease Factor Avg** | 2.3-2.5 | Normal |
| **Buried/Suspended** | < 10% | Review suspended cards monthly |

---

## Backup & Sync Strategy

1. **AnkiWeb** (auto-sync) - Primary
2. **Local backup** - `File → Export → Collection package (.apkg)` - Weekly
3. **Cloud backup** - Sync `.apkg` to Google Drive/Dropbox - Monthly
4. **Export notes** - `File → Export → Notes (.txt)` - For migration safety

---

*Anki is a **tool**, not the goal. The goal is **Japanese fluency**. If Anki becomes a chore, simplify: fewer cards, more reading. The best SRS is the one you actually use.*