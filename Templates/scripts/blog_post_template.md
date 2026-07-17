---
title: "Blog Post Template — Idea to Publication Pipeline"
tags: ["template", "blog", "quarto", "911-dispatch", "data-science"]
created: "{{ CREATED_DATE }}"
modified: "{{ MODIFIED_DATE }}"
---

# Blog Post Idea Template — Quarto-Ready Pipeline

> **Purpose**: Capture → Sketch → Research → Rate → Write → Publish
> **Target**: `https://drddatascience.com/blog` (Quarto + Netlify/GitHub Pages)
> **Audience**: 911/PSAP directors, analysts, data scientists, NENA/NASNA community

---

## 1. IDEA CAPTURE (The Spark)

| Field | Entry |
|---|---|
| **Working Title** | |
| **One-Sentence Hook** | *What's the compelling claim or question?* |
| **Core Thesis** | *What will the reader understand/be able to do after reading?* |
| **Trigger** | ☐ NENA conference ☐ Client problem ☐ Paper read ☐ Data exploration ☐ Conversation ☐ Personal project ☐ Other: _____ |
| **Date Captured** | {{ CREATED_DATE }} |
| **Status** | ☐ **Raw** → ☐ **Sketching** → ☐ **Researching** → ☐ **Drafting** → ☐ **Review** → ☐ **Published** |

---

## 2. URGENCY & PRIORITY RATING

*Score each 1–5 (5 = highest). Total ≥ 15 = publish this month.*

| Dimension | Score (1–5) | Rationale |
|---|---|---|
| **Timeliness** | | *Conference deadline? Seasonal relevance (hurricane season, budget cycle)? Breaking news?* |
| **Audience Demand** | | *Asked by clients? Forum questions? Gap in existing literature?* |
| **Unique Angle** | | *Your 15-yr PSAP experience + PhD + code = what no one else has?* |
| **Code/Artifact Value** | | *Reusable module? Template? Dashboard? Benchmark?* |
| **Strategic Fit** | | *Advances DMA product? Builds authority for consulting? Recruiting?* |
| **Effort to Complete** | | *Inverse score: 5 = quick win, 1 = months of work* |
| **TOTAL** | **__/30** | |

**Decision**: ☐ **Publish Now** (≥15) → ☐ **Schedule** (10–14) → ☐ **Park** (<10) → ☐ **Kill**

**Target Publish Date**: _______________  
**Series/Category**: ☐ Staffing Models ☐ Time Series Forecasting ☐ Call Volume Analysis ☐ Predictive Modeling ☐ Geospatial/Ops ☐ Tooling/Code ☐ Career/Leadership ☐ Other: _____

---

## 3. QUARTO FRONT-MATTER (Copy to `.qmd` when drafting)

```yaml
---
title: "Your Title Here"
subtitle: "Optional subtitle"
description: "One-sentence SEO description (<160 chars)"
author: "Dr. Tony Dunsworth"
date: "{{ PUBLISH_DATE }}"
date-modified: "{{ MODIFIED_DATE }}"
categories: [911-dispatch, forecasting, staffing, python, r, sql]
tags: [nena, psap, time-series, staffing-model, duckdb, dbt]
image: "images/posts/{{ SLUG }}-hero.png"
image-alt: "Descriptive alt text"
draft: true
toc: true
toc-depth: 3
number-sections: false
code-fold: show
code-tools: true
execute:
  echo: true
  warning: false
  message: false
format:
  html:
    theme: cosmo
    highlight-style: github
    code-links: ["github", "binder"]
    repo-url: https://github.com/tonydunsworth/drddatascience-blog
    repo-actions: [edit, issue]
    include-in-header:
      - text: |
          <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
---

```

---

## 4. POST STRUCTURE OUTLINE (Quarto Sections)

*Fill in bullets → expand to prose → add code → render*

### **Abstract / TL;DR** (2–3 sentences)
> *What problem, what method, what finding, what artifact.*

### **1. Introduction** — *Why this matters to a 911 director/analyst*
- **Context**: ___________________________________
- **Pain Point**: ___________________________________
- **What You'll Get**: [ ] Code  [ ] Template  [ ] Mental Model  [ ] Decision Framework

### **2. Background / Prior Art** (2–3 paragraphs + table)
- **Key References**: 
  - [ ] NENA/APCO standards: _______________
  - [ ] Academic papers: _______________
  - [ ] Industry reports: _______________
  - [ ] Your prior posts: `[[Post Title]]`
- **Gap This Fills**: ___________________________________

| Method | Strength | Limitation | Your Twist |
|---|---|---|---|
| Erlang-C | Simple, standard | Assumes stationary arrivals | Time-varying + covariates |
| Prophet | Holiday/seasonality | Black box, no exogenous | Interpretable + exogenous |
| Your Approach | | | |

### **3. Data & Methods** — *Reproducible, code-first*
#### **3.1 Data Sources**
- [ ] CAD export (schema: _______________)
- [ ] NENA i3 / NG911: _______________
- [ ] Public: Census, NOAA, OpenStreetMap, _______________
- [ ] Synthetic: _______________

#### **3.2 Exploratory Analysis** (Quarto: `#| echo: true`)
```python
# Python: pandas + duckdb + plotly
import duckdb
con = duckdb.connect()
df = con.sql("SELECT * FROM 'data/calls.parquet'").df()
```

```r
# R: tidyverse + tsibble + fable
library(tidyverse)
library(tsibble)
calls_ts <- calls %>% as_tsibble(index = datetime, key = zone)
```

```sql
-- SQL (duckdb/dbt): feature engineering
SELECT 
  date_trunc('hour', call_time) as hour,
  zone,
  count(*) as call_volume,
  avg(priority) as avg_priority
FROM raw_calls
GROUP BY 1, 2;
```

#### **3.3 Modeling / Analysis Approach**
- **Problem Type**: ☐ Forecasting ☐ Classification ☐ Optimization ☐ Simulation ☐ Causal ☐ Descriptive
- **Target**: _______________ (e.g., hourly call volume per zone, P(ambulance needed))
- **Features**: Temporal (hour, dow, holiday, season) + Spatial (zone, population, land use) + Exogenous (weather, events, staffing)
- **Model(s)**: _______________ (e.g., LightGBM + SHAP, NeuralProphet, OR-Tools MILP, Julia/DifferentialEquations)
- **Validation**: ☐ Walk-forward ☐ Spatial CV ☐ Temporal CV ☐ Synthetic stress-test

### **4. Results** — *Visual + Narrative + Code*
- **Key Metric(s)**: MAE/RMSE/CRPS _____ | Precision/Recall _____ | Cost Savings _____
- **Main Figure**: _______________ (Quarto: `![](images/fig-main.png){fig-alt="..."}`)
- **Interactive**: [ ] Plotly [ ] Observable [ ] Shiny [ ] Quarto Live

```julia
# Julia: StatsModels + MLJ + DifferentialEquations for simulation
using MLJ, StatsModels
model = @load LightGBMClassifier pkg=MLJLightGBM
```

```rust
// Rust: polars + linfa for high-perf preprocessing
use polars::prelude::*;
let df = CsvReader::from_path("data/calls.csv")?.finish()?;
```

```go
// Go: gonum + gonum/plot for production serving
import "gonum.org/v1/gonum/stat"
```

### **5. Practical Takeaways for PSAPs**
| Role | Action | Tool/Template |
|---|---|---|
| Director | _____ | _____ |
| Analyst | _____ | _____ |
| IT/Dev | _____ | _____ |

### **6. Limitations & Future Work**
- **Data**: _______________
- **Method**: _______________
- **Generalizability**: _______________
- **Next**: _______________

### **7. Reproducibility Package**
- [ ] **GitHub Repo**: `github.com/tonydunsworth/{{ SLUG }}`
- [ ] **Data**: [ ] Public [ ] Synthetic [ ] Request access
- [ ] **Environment**: `renv.lock` / `requirements.txt` / `Project.toml` / `Cargo.lock` / `go.mod`
- [ ] **Quarto Render**: `quarto render {{ SLUG }}.qmd --to html`
- [ ] **CI**: GitHub Actions → Netlify/Pages

---

## 5. SOURCE MATERIAL & RESEARCH LOG

*Capture as you go; promotes to `references.bib` later*

| Type | Citation / Link | Key Insight | Used? |
|---|---|---|---|
| Paper | | | ☐ |
| Standard | NENA-STA-020.1-2023 | | ☐ |
| Blog/Article | | | ☐ |
| Code/Repo | | | ☐ |
| Conversation | | | ☐ |
| Your Analysis | `notebooks/explore-{{ SLUG }}.ipynb` | | ☐ |

**BibTeX Entries** (append to `references.bib`):
```bibtex
@article{key2024,
  title={},
  author={},
  journal={},
  year={},
  url={}
}
```

---

## 6. CODE ARTIFACTS INVENTORY

*What reusable pieces will this post produce?*

| Artifact | Language | Path | Status | Tests? |
|---|---|---|---|---|
| Data loader | Python/R/SQL | `src/load_calls.py` | ☐ Draft ☐ Done | ☐ |
| Feature engineering | SQL/dbt | `models/features/call_features.sql` | ☐ Draft ☐ Done | ☐ |
| Forecasting model | Python/Julia | `src/forecast_{{ model }}.py` | ☐ Draft ☐ Done | ☐ |
| Staffing optimizer | Rust/Go | `src/optimizer/` | ☐ Draft ☐ Done | ☐ |
| Visualization | Python/R | `src/viz_{{ name }}.py` | ☐ Draft ☐ Done | ☐ |
| Quarto template | .qmd | `_templates/{{ SLUG }}.qmd` | ☐ Draft ☐ Done | ☐ |
| Dashboard | Shiny/Streamlit | `apps/{{ name }}/` | ☐ Draft ☐ Done | ☐ |

**Language Strategy**:
- **Python**: Prototyping, ML (sklearn, lightgbm, pytorch), duckdb, dbt-python, viz
- **R**: Time series (fable, tsibble), statistical reporting, Quarto native
- **SQL (duckdb/dbt)**: Feature engineering, transformations, analytical queries
- **Julia**: Scientific ML, differential equations, optimization (JuMP), high-perf stats
- **Rust**: Production data pipelines (polars, arrow), CLI tools, WASM for web
- **Go**: Microservices, API serving, concurrent processing, deployment

---

## 7. BLIND-SPOT CHECKLIST

*Review before publishing*

### **Audience & Accessibility**
- [ ] No unexplained acronyms (PSAP, ECC, CAD, ANI/ALI, NENA, i3, NG911)
- [ ] Assumes analyst-level stats knowledge, not PhD
- [ ] Code runs on laptop (no GPU/cluster required) or notes cloud needs
- [ ] Synthetic data provided if real data restricted
- [ ] Visuals colorblind-safe (viridis, okabe-ito)
- [ ] Alt text on all figures

### **Technical Rigor**
- [ ] Walk-forward validation (not random split) for time series
- [ ] Baseline comparison (naïve, seasonal naïve, ARIMA, Prophet)
- [ ] Uncertainty quantification (prediction intervals, conformal)
- [ ] Leakage check: no future data in features
- [ ] Reproducible seed / environment lockfile

### **911 Domain Validity**
- [ ] Call types mapped to NENA categories (EMS/Fire/Traffic/Other)
- [ ] Priority levels (EMD/EFD/EPD) handled correctly
- [ ] Staffing model respects: min staffing, shift rules, break rules, OT limits
- [ ] Geography: PSAP boundaries, mutual aid, zone definitions
- [ ] Seasonality: holidays, weather, events, "dead week" Xmas-NY

### **Code Quality**
- [ ] Functions typed (Python: type hints; R: roxygen2; Julia: docstrings)
- [ ] Error handling (missing data, schema drift, API failures)
- [ ] Logging (not print) — structured JSON for observability
- [ ] Config-driven (YAML/TOML), no hardcoded paths
- [ ] CI passes: lint → test → render → deploy

### **Legal / Ethical / OPSEC**
- [ ] No PII / PHI / CAD narratives in examples
- [ ] Synthetic data documented as such
- [ ] Agency names anonymized unless public source
- [ ] No operational security details (shift schedules, exact staffing)
- [ ] License: Code MIT, Content CC-BY-4.0

### **Quarto-Specific**
- [ ] `execute: freeze: auto` for heavy computations
- [ ] `code-fold: show` for long blocks
- [ ] `code-tools: true` (copy, download)
- [ ] Cross-references work: `@fig-main`, `@tbl-results`, `@eq-formula`
- [ ] Bibliography renders: `[@key2024]`
- [ ] Mermaid/GraphViz diagrams render
- [ ] Math (KaTeX) renders: `$y_t = \beta_0 + \beta_1 x_t + \epsilon_t$`

### **Distribution & SEO**
- [ ] Title < 60 chars, includes keyword
- [ ] Meta description < 160 chars
- [ ] Hero image 1200×630 (og:image)
- [ ] Twitter card: `summary_large_image`
- [ ] Schema.org `BlogPosting` JSON-LD
- [ ] Internal links to 2+ prior posts
- [ ] Syndication: LinkedIn, NENA Connect, Reddit r/911dispatchers, r/datascience

---

## 8. WORKFLOW TRACKER

| Stage | Target Date | Actual Date | Notes |
|---|---|---|---|
| Idea Captured | {{ CREATED_DATE }} | | |
| Sketch Complete | | | |
| Research Done | | | |
| Code Working | | | |
| Draft Written | | | |
| Self-Review | | | |
| Peer Review | | | |
| Quarto Render ✓ | | | |
| Published | | | |
| Promoted | | | |

---

## 9. QUICK-START COMMANDS

```bash
# 1. Create post from template
cp _templates/blog-post-template.qmd posts/{{ SLUG }}.qmd

# 2. Create asset folder
mkdir -p images/posts/{{ SLUG }}

# 3. Start notebook for exploration
jupyter lab notebooks/explore-{{ SLUG }}.ipynb

# 4. Develop code in src/
# Python: uv add pandas duckdb plotly lightgbm shap
# R: renv::install(c("tidyverse","tsibble","fable","fable.prophet"))
# Julia: pkg> add MLJ LightGBM DifferentialEquations JuMP HiGHS
# Rust: cargo new --bin optimizer && cd optimizer && cargo add polars linfa
# Go: go mod init github.com/tonydunsworth/{{ SLUG }} && go get gonum.org/v1/gonum

# 5. Render locally
quarto preview posts/{{ SLUG }}.qmd

# 6. Freeze compute (optional)
quarto render posts/{{ SLUG }}.qmd --execute-freeze

# 7. Deploy (push to main → Netlify/GitHub Pages auto-deploys)
git add . && git commit -m "post: {{ SLUG }}" && git push
```

---

## 10. TEMPLATE VARIABLES (for Templater/Obsidian)

| Variable | Description | Example |
|---|---|---|
| `{{ CREATED_DATE }}` | ISO date | `2026-07-17` |
| `{{ MODIFIED_DATE }}` | ISO date | `2026-07-17` |
| `{{ PUBLISH_DATE }}` | Target publish date | `2026-08-01` |
| `{{ SLUG }}` | URL-safe slug | `staffing-model-duckdb-lightgbm` |
| `{{ TITLE }}` | Human title | `Building a 911 Staffing Model with DuckDB + LightGBM` |
| `{{ HOOK }}` | One-sentence hook | `Cut overtime 23% by forecasting hourly call volume per zone` |

---

*Template version: 1.0 | Compatible with: Quarto 1.5+, Obsidian Templater, drddatascience.com blog structure*