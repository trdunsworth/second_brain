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
| [[Conformal Prediction]] | Split → CQR → ACI/AgACI → EnbPI → SPCI; the guarantees ladder; why conditional coverage is impossible | New |
| [[Time Series Anomaly Detection]] | Classical, deep, MOMENT, benchmark contamination | New |
| [[Time Series Decomposition]] | Additive/multiplicative, STL, MSTL, Theta, Prophet, decomposition as a base learner | New |
| [[Gradient Boosting for Time Series]] | Friedman's algorithm, feature-based vs component-based boosting, the three TS failure modes | New |
| [[Hierarchical and Mixed-Effects Models for Forecasting]] | Partial pooling, the locality–globality continuum, hour-of-week random effects | New |
| [[Change-Point Detection]] | PELT, binary segmentation, Bai–Perron, Chow/Quandt, CUSUM, Bayesian online, Prophet's prior | New |
| [[Count Distributions and Kolassa Evaluation]] | Poisson/NB, randomized PIT, Quantile Score, Variance Score, WIS | New |
| [[Forecast Combination]] | Bates–Granger weights, constraints, convex picture, combination vs reconciliation | New |
| [[State Space Models and Bayesian Structural Time Series]] | UCM, Kalman filter, BSTS/CausalImpact, temporal hierarchies | New |
| [[Feature Engineering for Time Series]] | Lags, rolling, calendar, decomposition features, leakage, scaling | New |
| [[Forecasting MLOps]] | Retraining cadence, drift, coverage monitoring, shadow deployment, the ACI hazard | New |
| [[Benchmarks and Datasets]] | M1–M5, Monash, GIFT-Eval, fev-bench, contamination | New |
| [[Time Series EDA and Data Quality]] | Diagnostic plots, index integrity, DST and value validity checks, missing data | New |
| [[Feature Importance and Explainability]] | SHAP, permutation importance, PDP/ICE/ALE, and the collinearity trap | New |
| [[Time Series Similarity, Clustering and Motif Discovery]] | DTW, matrix profile, stumpy, k-Shape, PCA on features | New |
| [[TimeCopilot]] | Dedicated page | New |
| [[Nixtlaverse]] | Dedicated page — the seven libraries | New |
| [[ThymeBoost]] | Dedicated page — gradient boosting over a decomposition | New |
| [[Forecasting Non-Stationary Data]] | Stationarity tests (ADF/KPSS/PP), differencing, unit root vs structural break, what non-stationarity costs an ML pipeline | New |

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
   See [[Model Validation Strategies]] §6.4 and [[Conformal Prediction]] §4–§5. Reproduced
   empirically in §8.1 of the latter.
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
- All of the above, plus [[Generative and Probabilistic Forecasting]], [[Intermittent and Sparse Demand]], [[Time Series Anomaly Detection]], [[Nixtlaverse]], [[TimeCopilot]], [[Time Series Decomposition]], [[Gradient Boosting for Time Series]], [[Forecasting Non-Stationary Data]], and the five Practice notes end to end

---

## Known gaps

> **Refreshed 2026-10-15.** An audit of both folders closed eight gaps and found this list stale
> - it still claimed a quantile-regression note was missing when
> [[Generative and Probabilistic Forecasting]] §2 covers it properly, and it under-weighted
> several gaps that are real. Re-derived
> rather than transcribed.

**Still open**

- [ ] **No R material** — everything practical is Python. `forecast`, `fable` and `hts` are the
      prescribed implementations in [[Model Validation Strategies]] §4 and
      [[forecast-reconciliation]] §13, and none of them is written up. Consequence: `Practice 01`
      hand-rolls the HLN correction in NumPy instead of calling `dm.test(..., c=H1)`
- [ ] **No VAR / cointegration note** — listed in the taxonomy §6, never treated. Note the
      taxonomy argues *against* it for univariate call volume; that argument should be revisited
      given Douglas County's 4 population centres and any call-type split
- [ ] **No spatiotemporal forecasting note** — GNNs get three lines in `resources.md` §3.5. The
      realistic version for this vault is *spatial aggregation and boundary consistency* (model the
      county directly, or model the sub-jurisdictions and sum?), which is a data-construction
      question that will bite before the data arrives
- [ ] **No interrupted-time-series / intervention analysis note** — [[Change-Point Detection]] §6
      names this. You can now *find* a break; you still cannot *evaluate* one
- [ ] **No energy / load-forecasting treatment** — the closest structural analogue in existence
      (hourly, 24h + 168h seasonality, weather covariates, overdispersed counts, national
      competitions). One unreferenced line in the study's reference list
- [ ] **No forecast → staffing translation layer** — the queueing material lives in
      `Statistical_Modeling/` and `Staffing/` and is barely linked. The sensitivity of recommended
      headcount to forecast error is the right objective for the study and is nowhere derived
- [ ] **No practice note for the combination arm** — `Practice 01`–`05` never combine anything,
      despite [[Forecast Combination]] being the highest-return operation available

**Closed in the 2026-10-15 pass**

- [x] ~~Change-point detection~~ → [[Change-Point Detection]] (PELT, `ruptures`, Bai–Perron, CUSUM)
- [x] ~~Panel-data / mixed-effects~~ → [[Hierarchical and Mixed-Effects Models for Forecasting]]
- [x] ~~Count distributions / distributional evaluation~~ → [[Count Distributions and Kolassa Evaluation]]
- [x] ~~Forecast combination as a method~~ → [[Forecast Combination]]
- [x] ~~State space / UCM / BSTS~~ → [[State Space Models and Bayesian Structural Time Series]]
- [x] ~~Feature engineering~~ → [[Feature Engineering for Time Series]]
- [x] ~~Forecasting MLOps~~ → [[Forecasting MLOps]]
- [x] ~~Benchmarks and datasets~~ → [[Benchmarks and Datasets]]
- [x] ~~Time series EDA~~ → [[Time Series EDA and Data Quality]]
- [x] ~~Feature importance / explainability~~ → [[Feature Importance and Explainability]]
- [x] ~~Similarity, clustering, motifs~~ → [[Time Series Similarity, Clustering and Motif Discovery]]
- [x] ~~Quantile regression~~ — already covered by [[Generative and Probabilistic Forecasting]] §2;
      the entry above was simply out of date

> ⚠️ **Three unresolved contradictions this pass surfaced, flagged but not fixed.**
> 1. **MAPE.** The [[168-Point Forecast Comparison - Discrete vs Continuous]] metrics table still
>    lists MAPE; [[Intermittent and Sparse Demand]] §1, [[Practice 05]] and
>    [[Time Series Forecasting Baselines]] §3.2 all say never report it. It is undefined at
>    `y = 0`. See [[Count Distributions and Kolassa Evaluation]].
> 2. **Contaminated stand-in data.** `Practice 01`–`05` run on M4-Hourly, which is the corpus
>    TSFMs were pretrained on. See [[Benchmarks and Datasets]] §2.
> 3. **Practice 04 and 05 re-implement the harness** rather than importing it, contrary to the hub's
>    "run them in order" instruction — the unpinned-defaults failure mode the vault flags elsewhere.

---

## Cross-links

- [[168-Point Forecast Comparison - Discrete vs Continuous]] — the research project these notes serve
- [[Staffing_Forecasting_Experiment]] — the application
- `Statistical_Modeling/` — Stan and queueing theory (Stan, queueing game models)
- `references/`, `Readings/`, `Books/`, `Cheatsheets/` — adjacent vault folders
