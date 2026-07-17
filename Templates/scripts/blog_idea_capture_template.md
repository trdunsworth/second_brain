---
title: "Blog Idea Capture - {{ CREATED_DATE }}"
tags: ["blog-idea", "capture", "draft"]
created: "{{ CREATED_DATE }}"
modified: "{{ MODIFIED_DATE }}"
status: "idea" # idea | sketching | researching | coding | drafting | reviewing | ready | published
urgency: 3 # 1=urgent (news/peg), 2=soon (series), 3=evergreen, 4=backlog
---

# {{ TITLE }}

> **One-liner hook**: {{ HOOK }}
> **Target publish**: {{ PUBLISH_DATE }} | **Slug**: `{{ SLUG }}`

---

## 1. Core Idea (2-3 sentences)

{{ CORE_IDEA }}

---

## 2. Why Now? (Urgency Rationale)

- [ ] **News peg**: _________________________________
- [ ] **Conference/Event**: NENA _____ / APCO _____ / Other _____
- [ ] **Seasonal**: Hurricane season / Holiday surge / Budget cycle
- [ ] **Series continuation**: Part ___ of ___________________
- [ ] **Reader request**: _________________________________
- [ ] **Personal milestone**: PhD chapter / Tool release / Job change
- [ ] **Evergreen**: No deadline, publish when ready

**Urgency Score (1-4)**: __ → **Why**: _________________________________

---

## 3. Target Audience & Outcome

| Dimension | Detail |
|---|---|
| **Primary Reader** | 911 analysts / PSAP managers / Data scientists in public safety / NENA committee |
| **Skill Level** | Analyst (SQL + basic stats) / Senior Analyst (ML) / Manager (no-code) / Researcher |
| **Desired Action** | Copy-paste code → Adapt to their data → Reduce OT / Improve forecast / Pass audit |
| **Success Metric** | "I used this to _____" / PR to repo / Citation in NENA doc / LinkedIn share |

---

## 4. Technical Approach (Code-First)

### **Primary Language(s)**: ☐ Python ☐ R ☐ SQL (DuckDB/dbt) ☐ Julia ☐ Rust ☐ Go

### **Key Libraries**: _________________________________

### **Code Artifacts to Deliver**

- [ ] **Exploratory notebook**: `notebooks/explore-{{ SLUG }}.ipynb`
- [ ] **Reusable module**: `src/{{ SLUG }}/` (typed, tested, documented)
- [ ] **CLI tool**: `cargo build --release` / `uv build` / `go build`
- [ ] **Quarto-ready chunks**: `chunks/{{ SLUG }}-*.qmd` (with `code-fold: show`)
- [ ] **Synthetic data generator**: `data/synthetic/{{ SLUG }}.parquet`
- [ ] **Benchmark script**: `scripts/benchmark-{{ SLUG }}.py`

### **911 Domain Specifics**

- **Call Types**: EMS / Fire / Traffic / Admin / Transfer / Text-to-911
- **Priority**: EMD (Echo/Delta/Charlie/Bravo/Alpha) / EFD / EPD
- **Geography**: PSAP boundary / Zone / Grid / H3 hex / Census tract
- **Time Grain**: 15-min / Hourly / Shift / Daily / Weekly
- **Seasonality**: Hour-of-week / Holiday / Weather / Event / School calendar

---

## 5. Source Material & References

| Type | Source | Key Insight | Link / Path |
|---|---|---|---|
| Paper | | | |
| NENA Doc | | | |
| Blog Post | | | |
| GitHub Repo | | | |
| Dataset | | | |
| Internal Doc | | | |
| Conversation | | | |

---

## 6. Sketch / Outline (Bullet points → sections)

1. **Hook** (1 para): _________________________________
2. **Problem** (2-3 paras): _________________________________
3. **Data & Setup** (code): _________________________________
4. **Method** (code + explanation): _________________________________
5. **Results** (figs + table): _________________________________
6. **Limitations** (honest): _________________________________
7. **Reproducibility** (code + data): _________________________________
8. **Next Steps** (reader + you): _________________________________

---

## 7. Blind-Spot Pre-Check (Quick)

- [ ] No PII/PHI in examples
- [ ] Synthetic data documented
- [ ] Baseline comparison planned
- [ ] Walk-forward validation (not random split)
- [ ] Colorblind-safe palette chosen
- [ ] Code runs on laptop (< 16GB RAM, < 10 min)
- [ ] Config-driven (no hardcoded paths)
- [ ] License headers on code files

---

## 8. Next Action & Blockers

| Action | Owner | Due | Status | Blocker |
|---|---|---|---|---|
| | | | ☐ | |
| | | | ☐ | |
| | | | ☐ | |

---

## 9. Promotion Plan (Post-Publish)

- [ ] NENA Connect post
- [ ] LinkedIn article (native + link)
- [ ] Reddit: r/911dispatchers, r/datascience, r/PublicSafety
- [ ] Twitter/X thread with code screenshots
- [ ] Internal DMA newsletter
- [ ] Conference talk proposal (NENA/APCO/URISA)
- [ ] Guest on _______________ podcast

---

*Idea captured: {{ CREATED_DATE }} | Last updated: {{ MODIFIED_DATE }} | Template v1.0*
