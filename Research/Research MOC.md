---
type: moc
topic: "Research Map of Content"
created: 2026-09-02
updated: 2026-10-14
status: active
tags:
  - moc
  - research
---

# Research Map of Content

This MOC connects all research projects, papers, and analytical work in the vault.

> **Updated 2026-10-14** — the time-series reference set and practice series were added, and
> the `Staffing/` folder is now linked. See [[USERSGUIDE]] § Frontmatter Reference for the
> schema these notes follow.

---

## Active Research Projects

### [[Time-Series/168-Point Forecast Comparison - Discrete vs Continuous]]

**Status:** In Progress
**Question:** Which forecasting approach is more accurate for polystochastic 9-1-1 call volume: 168 discrete hourly forecasts or 168 continuous forecast points?
**Methods:** Comparative time series forecasting, backtesting
**Related:** [[ARIMA vs Prophet]] · [[Time Series Paper Links]]

### [[PSAP Staffing Model]]

**Status:** In Progress
**Question:** Can queueing-game models or hybrid approaches replace Erlang-C/A for 9-1-1 centre staffing?
**Methods:** Queueing theory, simulation, comparative analysis
**Related:** [[Staffing/README]] · queueing theory literature

### [[Synthetic Data/Synthetic Data Book Research Plan]]

**Status:** In Progress
**Question:** When does a finding established on synthetic data transfer to real data?
**Methods:** Literature review, methodological assessment
**Related:** [[SynthCCD/USERSGUIDE]]

### [[ARIMA vs Prophet]]

**Status:** Reference/Exploration
**Topic:** Comparing ARIMA and Prophet for time series forecasting
**Related:** [[168-Point Forecast Comparison - Discrete vs Continuous]] · [[Time Series Paper Links]]

---

## The Staffing Track — `Staffing/`

A five-step feasibility sequence, all built on SynthCCD data. Read in order.

| Step | Note | Question |
|---|---|---|
| — | [[Staffing/README]] | Folder index |
| 1 | [[Staffing_Workflow_Feasibility]] | Is the staffing-model comparison workflow buildable? |
| 2 | [[Staffing_Dispatcher_Feasibility]] · [[Staffing_Dispatcher_Methods]] | How do dispatcher staffing methods differ from call-taker? |
| 3 | [[Staffing_Forecasting_Experiment]] | Can we test a vendor's 168-hour forecast claim? |
| — | [[Staffing_Model_Reference]] | Erlang B/C/A, square-root, marginal analysis — and how each breaks |
| — | [[Staffing_Sources]] | Annotated bibliography |

> **The missing synthesis.** [[Staffing_Forecasting_Experiment]] and
> [[Statistical_Modeling/02_queueing_game_theory]] touch at one idea — staffing is superlinear
> in volume, so forecast error propagates more than proportionally. That idea is currently a
> bullet, not a note. It is the most publishable object in the vault and it does not exist yet.

---

## Time Series Forecasting — reference set

**Start here:** [[Time Series Reading and Practice Hub]]

| | |
|---|---|
| [[time-series-forecasting-models]] | Model families — strengths, weaknesses, when to use each |
| [[Time Series Foundation Models]] | TSFM landscape 2026, verified arXiv links |
| [[Linear Models for Forecasting]] | DLinear/NLinear and the LTSF-Linear result |
| [[Distribution Shift and Normalization]] | RevIN and the normalisation literature |
| [[Generative and Probabilistic Forecasting]] | Quantile / parametric / diffusion / flow matching |
| [[LLM-as-Forecaster and Agentic Forecasting]] | Time-LLM, TimeCopilot, Synapse, TFR-Bench |
| [[Intermittent and Sparse Demand]] | Croston family, Syntetos–Boylan, metric instability |
| [[Time Series Anomaly Detection]] | Classical, deep, MOMENT, benchmark contamination |
| [[TimeCopilot]] | Agentic framework — paper + complete model hub |
| [[Nixtlaverse]] | The seven Nixtla libraries |

### Methodology and evaluation

- [[time_series_evaluation_metrics_benchmarks]] — metric definitions and Botchkarev's taxonomy
- [[Time Series Forecasting Baselines]] — the four explicit baseline choices
- [[Model Validation Strategies]] — leakage, rolling origin, DM test, marginal vs conditional coverage
- [[forecast-reconciliation]] — hierarchical forecasting and coherence

### Practice series — run in order

1. [[Practice 01 — Rolling-Origin Harness and Baseline Panel]] — the harness everything else imports
2. [[Practice 02 — Linear Models and the Baseline Question]] — normalisation vs backbone
3. [[Practice 03 — Zero-Shot Foundation Model Bake-Off]] — and their *calibration*
4. [[Practice 04 — Conformal Prediction on Hourly Counts]] — does coverage survive at peaks?
5. [[Practice 05 — Intermittency, Counts and Anomaly Detection]] — intermittent or just small?

---

## Research Resources

- [[Time Series Paper Links]] — papers by theme, arXiv IDs verified 2026-10-14
- [[Staffing_Sources]] — annotated staffing bibliography
- [[USERSGUIDE]] — vault conventions and the frontmatter schema

---

## Domain Knowledge

### 9-1-1 Operations

- [[PSAP Staffing Model]] — queueing models for call centre staffing
- [[Staffing/README]] — the five-step feasibility track
- NENA standards (referenced in [[PSAP Staffing Model]])

### Synthetic data

- [[SynthCCD/USERSGUIDE]] — the generator
- [[SynthCCD/REALISMGUIDE]] — realism constraints
- [[Synthetic Data/Synthetic Data Book Research Plan]]

### Queueing theory

- [[Statistical_Modeling/01_stan]] · [[Statistical_Modeling/02_queueing_game_theory]] · [[Statistical_Modeling/03_wang_queueing_game_models]]

---

## Code & Tools

- **Python:** uv, pandas, polars, DuckDB, scikit-learn, statsmodels, PyTorch
- **Forecasting:** Nixtlaverse (StatsForecast / NeuralForecast / MLForecast), Darts, TimeCopilot
- **LLM:** OpenCode with Ollama (local), OpenAI/Anthropic (remote)
- **Data:** Databricks, dbt, Spark
- **Docs:** Quarto

---

*Last updated: 2026-10-14*