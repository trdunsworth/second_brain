---
title: "Daily Log - <% tp.date.now('YYYY-MM-DD') %>"
tags: ["daily-log", "journal", "reflection", "notes", "cbt", "attitude-adjustment"]
date: "<% tp.date.now('YYYY-MM-DD') %>"
created: "<% tp.date.now('YYYY-MM-DD') %>"
# Calendar plugin compatibility
workday: true
all_day: false
---

# Daily Log - <% tp.date.now('dddd, MMMM DD, YYYY') %>

> **Comprehensive daily driver for Obsidian** — integrates workspaces, CBT/TEAM-CBT, attitude adjustment goals, wisdom sources, and reflection
>
> **Mode:** ☐ **Full** (complete all sections) &nbsp;|&nbsp; ☐ **Minimal** (morning intentions, workspace highlights, evening 3-line review, CBT spot-check only)
> **Day Type:** ☐ Weekday &nbsp;|&nbsp; ☐ Weekend &nbsp;|&nbsp; ☐ Holiday/PTO
> **Weekend Note:** If Weekend/Holiday → skip Workspaces or treat as "Personal Projects" only

---

## 📋 Template Variables Reference
*For Templater / manual fill — copy this block to a snippet if helpful*

```
LOG_DATE           → <% tp.date.now('YYYY-MM-DD') %>
MORNING_START      → e.g., 05:30
MORNING_END        → e.g., 08:30
ALX_START          → e.g., 08:30
ALX_END            → e.g., 17:00
DMA_START          → e.g., 17:30
DMA_END            → e.g., 20:00
TM_TIME            → e.g., "Tue/Thu 19:00-20:30"
AREA_NUM           → e.g., 42
MIDDAY_TIME        → e.g., 12:30
AFTERNOON_START    → e.g., 13:00
EVENING_END        → e.g., 21:00
EVENING_REFLECTION_START → e.g., 21:00
EVENING_REFLECTION_END   → e.g., 21:30
SLEEP_TARGET       → e.g., 22:30
PRE_DAWN_ACTIVITIES     → free text
MORNING_ROUTINE         → free text
INITIAL_THOUGHTS        → free text
ALX_NOTES               → free text
DMA_NOTES               → free text
TM_NOTES                → free text
PERSONAL_NOTES          → free text
AFTERNOON_WORK          → free text
PERSONAL_DEV_SECTION    → free text
SOCIAL_SECTION          → free text
WELLNESS_SECTION        → free text
DAY_ACCOMPLISHMENTS     → free text
EMOTIONAL_STATE         → free text
KEY_LEARNINGS           → free text
TOMORROWS_PRIORITIES    → free text
WIND_DOWN_ROUTINE       → free text
FUTURE_NOTES            → free text
LINKS                   → free text (wiki-links, URLs)
```

> **🎤 Voice Capture Tip:** Dictate sections marked with 🎤 — works well with Obsidian Mobile + iOS/Android voice input

---

## Morning (<% tp.system.prompt('Morning Start (HH:MM):', '05:30') %> – <% tp.system.prompt('Morning End (HH:MM):', '08:30') %>)

### Pre-Dawn / Early Morning 🎤
<% tp.system.prompt('Pre-Dawn Activities:', '', true) %>

### Morning Routine 🎤
<% tp.system.prompt('Morning Routine:', '', true) %>

### Medication / Supplements / Physical Check
| Item | Dose | Time Taken | Notes |
|---|---|---|---|
| | | | |
| | | | |

**Physical Symptoms (1-10):** Sleep ___ | Energy ___ | Appetite ___ | Tension ___ | Focus ___

### Intentions & Initial Thoughts 🎤
**Top 3 Priorities Today:**
1. 
2. 
3. 

**Energy Budget for Today (allocate 100%):**
- Deep Work: ___% | Meetings: ___% | Admin: ___% | Personal: ___% | Recovery: ___%

**Immediate Thoughts / Goals:**
<% tp.system.prompt('Initial Thoughts / Goals:', '', true) %>

### CBT/TEAM-CBT Morning Spot-Check
| Check | Status | Notes |
|---|---|---|
| Mood check-in (0-100%): Sad__ Anxious__ Angry__ Guilty__ Hopeless__ | | |
| Anticipated challenges / triggers today | | |
| Values-aligned intention | | |
| One behavioral experiment / exposure planned | | Prediction — Difficulty: __% Satisfaction: __% |

---

## Workspaces
*Use consistent structure: **Meetings → Key Tasks (☐) → Accomplishments → Blockers/Follow-ups → Notes → Shutdown Ritual***
*Weekend/Holiday: skip or rename to "Personal Projects"*

### 🏛️ ALX Work (City of Alexandria)
**Role:** ________________________  
**Hours:** <% tp.system.prompt('ALX Start (HH:MM):', '08:30') %> – <% tp.system.prompt('ALX End (HH:MM):', '17:00') %>

#### Meetings / Calls 🎤
- 

#### Key Tasks
- [ ] 
- [ ] 
- [ ] 

#### Accomplishments
- 

#### Blockers / Follow-ups
- 

#### Notes 🎤
<% tp.system.prompt('ALX Notes:', '', true) %>

#### 🔚 Shutdown Ritual (ALX)
- [ ] Inbox zero / flagged emails handled
- [ ] Tomorrow's top 3 identified
- [ ] Physical transition: ________________________ (walk, breath, stretch, change location)

---

### 🏢 DMA Work (LLC — Reporting, Research, Modeling for 911 Centers)
**Role:** Co-founder / ________________________  
**Hours:** <% tp.system.prompt('DMA Start (HH:MM):', '17:30') %> – <% tp.system.prompt('DMA End (HH:MM):', '20:00') %>

#### Meetings / Calls 🎤
- 

#### Key Tasks
- [ ] 
- [ ] 
- [ ] 

#### Accomplishments
- 

#### Blockers / Follow-ups
- 

#### Notes 🎤
<% tp.system.prompt('DMA Notes:', '', true) %>

#### 🔚 Shutdown Ritual (DMA)
- [ ] Client comms cleared
- [ ] Tomorrow's top 3 identified
- [ ] Physical transition: ________________________

---

### 🎤 Toastmasters (District Statistician / Area Director)
**Role:** District Statistician, Area <% tp.system.prompt('Area Number:', '42') %> Director  
**Time Allocation:** <% tp.system.prompt('Toastmasters Time:', 'Tue/Thu 19:00-20:30') %>

#### Meetings / Calls 🎤
- 

#### Key Tasks
- [ ] District Statistics: 
- [ ] Area Director: Club visits/reports ____ | Area Council ____ | Contests/Events ____
- [ ] Communication/Correspondence: 

#### Accomplishments
- 

#### Blockers / Follow-ups
- 

#### Notes 🎤
<% tp.system.prompt('Toastmasters Notes:', '', true) %>

#### 🔚 Shutdown Ritual (TM)
- [ ] Comms cleared
- [ ] Next actions captured
- [ ] Physical transition: ________________________

---

### 🧘 Personal Notes & Wellness 🎤
<% tp.system.prompt('Personal Notes:', '', true) %>

#### Card of the Day (Tarot)
**Card:** ________________________  
**Reflection:** ________________________

#### Relationship Check-In (Goal: Good Husband)
**Connection moment today:** ________________________  
**Appreciation expressed:** ________________________  
**Repair needed?:** ________________________

---

## Projects & Creative

### Active Projects
| Project | Type (Work/Personal) | Status | Next Action | Time Spent |
|---|---|---|---|---|
| | | | | |
| | | | | |

### Blog Post Ideas / Writing
- 

### Research Interests Progress
- **AI / Agent Dev:** 
- **Time Series Forecasting:** 
- **AI Reporting Engines:** 
- **Constructed Languages:** 
- **Synthetic Data:** 
- **CAD Product:** 
- **Queueing Theory:** 

---

## Midday Check-In (<% tp.system.prompt('Midday Time (HH:MM):', '12:30') %>)

### Energy & Focus
**Energy (1-10):** __ | **Focus (1-10):** __ | **Mood (1-10):** __

### Quick Wins So Far
- 

### Course Corrections Needed
- 

### Transition Note 🎤
*How did morning → afternoon go? Any boundary needed?*
<% tp.system.prompt('Midday Transition Note:', '', true) %>

---

## Afternoon / Evening (<% tp.system.prompt('Afternoon Start (HH:MM):', '13:00') %> – <% tp.system.prompt('Evening End (HH:MM):', '21:00') %>)

### Continued Work / Deep Work Blocks 🎤
<% tp.system.prompt('Afternoon Work:', '', true) %>

### Personal Development 🎤
<% tp.system.prompt('Personal Development:', '', true) %>

### Social / Relationship Activities 🎤
<% tp.system.prompt('Social Activities:', '', true) %>

### Wellness Practices 🎤
<% tp.system.prompt('Wellness Practices:', '', true) %>

---

## CBT/TEAM-CBT Daily Spot-Check (Evening)
*See [[daily_mood_log_template]] for full mood log | [[pleasure_predicting_sheet]] | [[anti_procrastination_sheet]] | [[relapse_prevention_toolbox]]*

| Check | Status | Details |
|---|---|---|
| Completed Daily Mood Log (1+ entries) | [ ] Yes / [ ] No | Link: [[daily_mood_log_<% tp.date.now('YYYY-MM-DD') %>]] |
| Identified top distortion today | | |
| Used evidence-based challenge | [ ] Yes / [ ] No | |
| Practiced positive reframe | [ ] Yes / [ ] No | |
| Behavioral experiment / exposure done | [ ] Yes / [ ] No | |
| Values-aligned action taken | | |
| Pleasure-Predicting entry made | [ ] Yes / [ ] No | |

---

## Evening Reflection (<% tp.system.prompt('Evening Reflection Start (HH:MM):', '21:00') %> – <% tp.system.prompt('Evening Reflection End (HH:MM):', '21:30') %>)

### Day Review
**What I accomplished today:**
<% tp.system.prompt('Day Accomplishments:', '', true) %>

**What didn't get done (and why):**
- 

### Emotional State Summary
**Overall mood trend:** ⬆️ Improved  ➡️ Stable  ⬇️ Declined  
**Dominant emotions:** ________________________  
**Mood range (1-10):** __ – __
<% tp.system.prompt('Emotional State:', '', true) %>

### Key Learnings & Insights 🎤
<% tp.system.prompt('Key Learnings:', '', true) %>

### Wisdom Source Application — *Top 3 Today*
| Source | Applied? | How? |
|---|---|---|
| | [ ] | |
| | [ ] | |
| | [ ] | |

*Full list for reference: CBT/Burns, Stoicism, Buddhism, Taoism, Freemasonry, Morals & Dogma, Takeuchi, Moore, Webb, Brown, Tarot, Other*

### Gratitude (3 things)
1. 
2. 
3. 

### Win Celebration
**One thing I handled well today:** ________________________

---

## Tomorrow's Setup

### Top 3 Priorities
1. 
2. 
3. 

### Scheduled Commitments
*Syncs with Obsidian Calendar plugin via frontmatter `date` + this table*
| Time | Commitment | Workspace | Prep Needed |
|---|---|---|---|
| | | | |
| | | | |

### Tomorrow's Plan 🎤
<% tp.system.prompt("Tomorrow's Plan:", '', true) %>

### CBT Intention for Tomorrow
**One behavioral experiment / exposure:** ________________________  
**Prediction — Difficulty:** __% | **Satisfaction:** __%  
**Values connection:** ________________________

---

## Wind-Down Routine 🎤
<% tp.system.prompt('Wind-Down Routine:', '', true) %>

### Sleep Target
**Lights out:** <% tp.system.prompt('Sleep Target (HH:MM):', '22:30') %> | **Hours planned:** __

**Pre-sleep transition:** ________________________ (no screens, reading, breath, etc.)

---

## Notes for Future Reference
<% tp.system.prompt('Future Notes:', '', true) %>

---

## Links & References
<% tp.system.prompt('Links & References:', '', true) %>

---

## Quick Capture (Parking Lot)
*Ideas, tasks, thoughts to process later*
- 
- 
- 

---

## 📋 Quick Reference: 10 Cognitive Distortions (Burns)
1. **All-or-Nothing** — Black/white; perfect or failure
2. **Overgeneralization** — Single event = endless pattern ("always/never")
3. **Mental Filter** — Focus on negative; ignore positive
4. **Disqualifying Positive** — Positives "don't count"
5. **Jumping to Conclusions** — Mind reading / Fortune telling
6. **Magnification/Minimization** — Blow up negatives; shrink positives
7. **Emotional Reasoning** — "I feel it → it's true"
8. **Should Statements** — Rigid rules → guilt (self) / anger (others)
9. **Labeling** — Global label vs. specific behavior
10. **Personalization** — Blame self for external events not primarily your responsibility

---

*Template version: Unified Daily Log v2.1 | Sources: Daily Note Template + daily_log_template + CBT/TEAM-CBT integration + Attitude Adjustment goals | Variables documented for Templater/manual use | Voice-capture ready | Calendar-plugin compatible*

<%* tp.file.cursor() %>
