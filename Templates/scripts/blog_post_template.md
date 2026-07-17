---
title: "Your Post Title Here"
subtitle: "Optional subtitle — one compelling sentence"
description: "One-sentence SEO description (<160 chars) for search/social"
author: "Dr. Tony Dunsworth"
date: "{{ PUBLISH_DATE }}"
date-modified: "{{ MODIFIED_DATE }}"
categories: [911-dispatch, forecasting, staffing]
tags: [nena, psap, time-series, staffing-model, duckdb, lightgbm]
image: "images/posts/{{ SLUG }}-hero.png"
image-alt: "Descriptive alt text for social cards and accessibility"
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
  freeze: auto
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

## Abstract {.unnumbered}

> **TL;DR** — 2–3 sentences: What problem, what method, what finding, what artifact the reader gets.

---

## 1. Introduction {#sec-intro}

**Context.** Why this matters to a 911 director/analyst right now.

**Pain Point.** The specific operational or analytical gap.

**What You'll Get.** ☐ Reusable code module ☐ Quarto template ☐ Mental model ☐ Decision framework ☐ Synthetic data generator

---

## 2. Background & Prior Art {#sec-background}

### Key References

- **NENA/APCO Standards**: [NENA-STA-XXX](https://www.nena.org/page/Standards)
- **Academic**: @citationkey2024
- **Industry**: [Report Title](URL)
- **Prior Posts**: `[[Post Title]]`{.internal-link}

### Gap This Post Fills

| Method | Strength | Limitation | Your Twist |
|--------|----------|------------|------------|
| Erlang-C | Simple, standard | Assumes stationary arrivals | Time-varying + covariates |
| Prophet | Holiday/seasonality | Black box, no exogenous | Interpretable + exogenous |
| **Your Approach** | | | **Explain in one row** |

---

## 3. Data & Methods {#sec-methods}

### 3.1 Data Sources {#sec-data}

- **CAD Export**: Schema — `call_time`, `priority`, `zone`, `call_type`, `duration`
- **NENA i3 / NG911**: _______________
- **Public Data**: Census, NOAA, OpenStreetMap, _______________
- **Synthetic Data**: `data/synthetic/{{ SLUG }}.parquet` (generator in `src/{{ SLUG }}/generate_data.py`)

### 3.2 Exploratory Analysis {#sec-eda}

```{python}
#| label: load-data
#| echo: true
#| output: false
import duckdb
import pandas as pd

con = duckdb.connect()
df = con.sql("SELECT * FROM 'data/calls.parquet'").df()
print(df.shape)
df.head()
```

```{r}
#| label: eda-r
#| echo: true
library(tidyverse)
library(tsibble)

calls_ts <- calls %>% 
  as_tsibble(index = datetime, key = zone) %>% 
  fill_gaps(call_volume = 0)
```

```{sql}
--| label: feature-sql
--| echo: true
--| output: false
SELECT 
  date_trunc('hour', call_time) as hour,
  zone,
  count(*) as call_volume,
  avg(priority) as avg_priority
FROM raw_calls
GROUP BY 1, 2
ORDER BY 1, 2;
```

### 3.3 Modeling Approach {#sec-modeling}

- **Problem Type**: ☐ Forecasting ☐ Classification ☐ Optimization ☐ Simulation ☐ Causal ☐ Descriptive
- **Target**: _______________ (e.g., hourly call volume per zone)
- **Features**: Temporal (hour, dow, holiday, season) + Spatial (zone, population) + Exogenous (weather, events, staffing)
- **Model(s)**: _______________ (e.g., LightGBM + SHAP, NeuralProphet, OR-Tools MILP)
- **Validation**: ☐ Walk-forward ☐ Spatial CV ☐ Temporal CV ☐ Synthetic stress-test

```{python}
#| label: model-train
#| echo: true
#| code-fold: show
import lightgbm as lgb
from sklearn.model_selection import TimeSeriesSplit

# Example: walk-forward validation
tscv = TimeSeriesSplit(n_splits=5, test_size=168)  # 1 week ahead
for train_idx, test_idx in tscv.split(X):
    model = lgb.LGBMRegressor(n_estimators=500, random_state=42)
    model.fit(X.iloc[train_idx], y.iloc[train_idx])
    preds = model.predict(X.iloc[test_idx])
    # Score...
```

---

## 4. Results {#sec-results}

### Key Metrics

| Metric | Value | Baseline | Improvement |
|--------|-------|----------|-------------|
| MAE | ___ | ___ | ___% |
| RMSE | ___ | ___ | ___% |
| CRPS | ___ | ___ | ___% |
| Cost Savings (OT hrs) | ___ | — | — |

### Main Figure {#fig-main}

```{python}
#| label: fig-main
#| echo: false
#| fig-cap: "Hourly call volume forecast vs actual — {{ SLUG }}"
#| fig-alt: "Line chart showing predicted (blue) vs actual (orange) call volume over 4 weeks with 95% prediction intervals"
#| code-fold: show
import plotly.express as px

fig = px.line(results_df, x="datetime", y=["actual", "predicted"],
              title="Call Volume Forecast", template="plotly_white")
fig.show()
```

**Interactive**: [ ] Plotly [ ] Observable [ ] Shiny [ ] Quarto Live

---

## 5. Practical Takeaways for PSAPs {#sec-takeaways}

| Role | Action | Tool/Template |
|------|--------|---------------|
| Director | _______________ | _______________ |
| Analyst | _______________ | _______________ |
| IT/Dev | _______________ | _______________ |

---

## 6. Limitations & Future Work {#sec-limitations}

- **Data**: _______________
- **Method**: _______________
- **Generalizability**: _______________
- **Next**: _______________

---

## 7. Reproducibility Package {#sec-repro}

- **GitHub Repo**: `github.com/tonydunsworth/{{ SLUG }}`
- **Data**: ☐ Public ☐ Synthetic ☐ Request access
- **Environment**: `renv.lock` / `requirements.txt` / `Project.toml` / `Cargo.lock` / `go.mod`
- **Render**: `quarto render {{ SLUG }}.qmd --to html`
- **CI**: GitHub Actions → Netlify/Pages (auto-deploy on push to `main`)

```bash
# Local development
quarto preview {{ SLUG }}.qmd

# Freeze compute for faster re-renders
quarto render {{ SLUG }}.qmd --execute-freeze

# Deploy
git add . && git commit -m "post: {{ SLUG }}" && git push
```

---

## References {#sec-refs}

::: {#refs}
:::

---

*Template: Quarto 1.5+ | drddatascience.com/blog | `{{ CREATED_DATE }}`*