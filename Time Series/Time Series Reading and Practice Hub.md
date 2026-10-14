---
type: reference
status: active
tags:
  - time-series
  - forecasting
  - index
  - practice
  - reading-list
created: 2026-10-14
aliases:
  - Time Series Hub
  - TS Reading Hub
  - Time Series Index
---

# Time Series Reading and Practice Hub

Entry point for the forecasting side of the vault. Created 2026-10-14.

> Reachable from [[Research MOC]] and [[Research Dashboard]]. Vault conventions and the
> frontmatter schema are in [[USERSGUIDE]] § Frontmatter Reference — these notes follow the
> core schema (`type` / `status` / `topic` / `created` / `aliases` / `tags`).

---

## What exists

| Note | What it covers | Status |
|---|---|---|
| [[time-series-forecasting-models]] | **Model families** — strengths, weaknesses, when to use each | Rewritten 2026-10-14 |
| [[Time Series Foundation Models]] | TSFM landscape, 2026 state of the art, verified arXiv links | New |
| [[Linear Models for Forecasting]] | DLinear / NLinear and the LTSF-Linear result | New |
| [[Distribution Shift and Normalization]] | RevIN and the normalisation literature | New |
| [[Generative and Probabilistic Forecasting]] | Quantile / parametric / diffusion / flow matching | New |
| [[LLM-as-Forecaster and Agentic Forecasting]] | Time-LLM, TimeCopilot, Synapse, TFR-Bench | New |
| [[Intermittent and Sparse Demand]] | Croston family, Syntetos–Boylan, metric instability | New |
| [[Time Series Anomaly Detection]] | Classical, deep, MOMENT, benchmark contamination | New |
| [[TimeCopilot]] | Dedicated page | New |
| [[Nixtlaverse]] | Dedicated page — the seven libraries | New |

### Pre-existing

| Note | Covers |
|---|---|
| [[time_series_evaluation_metrics_benchmarks]] | MAE / RMSE / MAPE / sMAPE / MASE / OWA / pinball, Botchkarev taxonomy |
| [[Time Series Forecasting Baselines]] | Baseline taxonomy, the four explicit choices, MASE denominator pathology |
| [[Model Validation Strategies]] | Leakage, rolling origin, DM test, HLN/Clark-West, marginal vs conditional coverage |
| [[forecast-reconciliation]] | Hierarchical forecasting, MinT, `W`, coherence, scalability |
| [[resources]] | Original reading list — **§1 (foundation models) is superseded by [[Time Series Foundation Models]]** |

---

## The practice series

Weighted toward hourly counts and univariate series, per the 9-1-1 / PSAP context.

| # | Note | The question it answers |
|---|---|---|
| 01 | [[Practice 01 — Rolling-Origin Harness and Baseline Panel]] | What does a defensible evaluation harness look like, and what is the baseline panel? |
| 02 | [[Practice 02 — Linear Models and the Baseline Question]] | How much does the backbone matter once normalisation is fixed? |
| 03 | [[Practice 03 — Zero-Shot Foundation Model Bake-Off]] | Are TSFMs actually better on my data — and are their **intervals** calibrated? |
| 04 | [[Practice 04 — Conformal Prediction on Hourly Counts]] | Does conformal coverage survive at peaks? |
| 05 | [[Practice 05 — Intermittency, Counts and Anomaly Detection]] | Is my data intermittent or just small? And what is my alarm burden? |

**Run them in order.** 01 produces the harness and the baseline results; 02–05 import them.

---

## The five findings that should change how you work

1. **The zero-shot advantage is narrower than advertised** — and leaderboards are contaminated.
   TSFMs beat seasonal naive, roughly match a well-built classical panel, and lose to
   tuned models on data you actually have. See [[Time Series Foundation Models]] §3.
2. **Normalisation is the load-bearing component, not the architecture.** A linear model with
   RevIN matches far more complex models. See [[Linear Models for Forecasting]] §4.
3. **Combine rather than choose.** M4, M5, and every benchmark since agree that a simple
   average of a diverse panel beats its best member. See
   [[time-series-forecasting-models]] §7.
4. **Marginal calibration is not conditional calibration.** You can have exactly 90% coverage
   overall and near-zero coverage at peaks — which is the only part that matters for staffing.
   See [[Model Validation Strategies]] §6.4.
5. **The LLM orchestration question is genuinely open.** Does an LLM router beat a learned
   router over the same model hub? Nobody has a clean answer, and it is answerable on your
   data. See [[LLM-as-Forecaster and Agentic Forecasting]] §2.

---

## Suggested reading path

**If you have two hours**
1. [[time-series-forecasting-models]] §1 and §4 — the family map
2. [Are Transformers Effective for TSF?](https://arxiv.org/abs/2205.13504) — 20 minutes, changes your baseline panel
3. [[Linear Models for Forecasting]] §2 — the direct/recursive distinction

**If you have a day**
- The above, plus [[Time Series Foundation Models]] §1–3, [[Distribution Shift and Normalization]] §1–4, and [[Model Validation Strategies]] §1 and §6

**If you have a week**
- All of the above, plus [[Generative and Probabilistic Forecasting]], [[Intermittent and Sparse Demand]], [[Time Series Anomaly Detection]], [[Nixtlaverse]], [[TimeCopilot]], and the five Practice notes end to end

---

## Known gaps

- [ ] **No R material** — everything practical is Python. Your `forecast` package and `fable`
      coverage from the FPP3 links is not written up
- [ ] **No spatiotemporal forecasting note** — GNNs get three lines in `resources.md` §3.5
- [ ] **No change-point detection note** — only mentioned under BSTS
- [ ] **No VAR / cointegration note** — listed in the taxonomy, never treated
- [ ] **No quantile regression / distributional regression note** as a standalone topic
- [ ] **No panel-data / mixed-effects treatment** — this is the real answer to the
      discrete-vs-continuous question and it is missing entirely

> ⚠️ **That last gap is the most consequential.** The [[168-Point Forecast Comparison - Discrete vs Continuous]] study pits 168 per-hour models against one continuous model. The
> established middle ground — **hierarchical Bayesian pooling, or mixed-effects models with
> hour-of-week random effects** — lets you share strength across hours while keeping
> hour-specific structure. Neither the note nor the study currently considers it, and both
> the hypothesis and the "hybrid approaches" bullet in the Limitations section would benefit.
> See [[168-Point Forecast Comparison - Discrete vs Continuous]] §Limitations.

---

## Cross-links

- [[168-Point Forecast Comparison - Discrete vs Continuous]] — the research project these notes serve
- [[Staffing_Forecasting_Experiment]] — the application
- `Statistical_Modeling/` — Stan and queueing theory (Stan, queueing game models)
- `references/`, `Readings/`, `Books/`, `Cheatsheets/` — adjacent vault folders
