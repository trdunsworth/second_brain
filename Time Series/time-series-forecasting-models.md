---
type: reference
status: active
tags:
  - time-series
  - forecasting
  - machine-learning
  - statistics
  - deep-learning
  - foundation-models
  - model-selection
created: 2026-09-22
updated: 2026-10-14
aliases:
  - Forecasting Model Families
  - Time Series Forecasting Models
  - Model Taxonomy
---

# Time Series Forecasting Models — Families, Strengths and Weaknesses

A working reference on forecasting model families: what each one assumes, what it is
good at, where it breaks, and what to reach for when.

> **Expanded 2026-10-14.** This was a bare taxonomy with no evaluation attached. It now
> carries per-family strengths/weaknesses and arXiv references, and cross-links to the
> dedicated notes added alongside it.

---

## How to read this note

Three framings run through the entries below. They are the recurring failure modes of
model selection, and they are worth applying to any family before you commit.

1. **The error-accumulation question.** Does the model forecast *directly* (emit all `h`
   steps in one pass) or *recursively* (apply a one-step model `h` times)? Direct models do
   not compound their own error; recursive ones do. This single distinction explains more
   of the LTSF results than architecture does — see [[Linear Models for Forecasting]] §2.
2. **The parameterisation question.** Is the model *local* (parameters fitted per series),
   *global* (one model across many series), or *pretrained* (fitted on a broad corpus and
   applied frozen)? These have genuinely different data requirements, not just different
   accuracy.
3. **The interval question.** Point accuracy and interval calibration are separate
   competencies. Most families produce one or the other well; few produce both. See
   [[Generative and Probabilistic Forecasting]] and [[Model Validation Strategies]] §6.

---

## 1. Classical statistical models

### Naive and drift baselines

| Strengths | Weaknesses |
|---|---|
| Zero parameters, zero tuning, no failure mode | No exogenous information; assumes no seasonality (naive) or only one season (seasonal naive) |
| Defines the floor and the MASE denominator | Cannot represent cross-series structure |

Not a modelling family so much as the measuring stick. See
[[Time Series Forecasting Baselines]] for the full treatment and the warning that scaled
metrics inherit the baseline's failure modes.

### Exponential smoothing / ETS

$y_{t+h} = \ell_t + h b_t + s_{t+h-m} + \varepsilon_t$

**Strengths**
- A *generative* model, not just an estimator — the state-space formulation gives you
  principled, analytically-derived prediction intervals
- Automated model selection (ETS error-trend-seasonal state space framework, Hyndman et al. 2002) picks the variance/trend/seasonality structure for you
- Degenerates gracefully: SES at one extreme, Holt-Winters at the other
- Extremely fast, especially in `statsforecast`

**Weaknesses**
- Additive by default; multiplicative seasonality needs a different variant
- Struggles when the seasonal pattern is unstable or when several seasonalities coexist
- Local parameterisation — one series, one fit, no cross-series borrowing

### ARIMA family

**Strengths**
- Rich theory, mature diagnostics (ACF/PACF, ADF, Ljung–Box), and a clean interpretive grammar
- SARIMAX handles exogenous regressors natively and this is genuinely hard to beat
- Differencing is a principled answer to trend and unit-root problems
- Well-understood prediction intervals

**Weaknesses**
- Parameter explosion with multiple seasonalities — an hourly series with daily + weekly +
  annual seasonality produces an order `(p,d,q)(P,D,Q,24,168,8766)` model that is not
  estimable
- Requires stationarity or explicit differencing; ADF tests are low-powered and their
  interpretation is contested — full treatment in [[Forecasting Non-Stationary Data]]
- Linear by construction — no covariates without the *X*, no interactions

> **The seasonal-differencing trap is the single most common ARIMA failure.** Choose `D`
> by inspecting the ACF at the seasonal lag, not by running `auto.arima()` on the full panel
> and accepting what it returns.

### TBATS

**Strengths** — handles multiple seasonalities and Box–Cox transforms without explosion.
**Weaknesses** — very slow to fit, prone to converging on near-duplicate models, and hard
to diagnose. Reach for MSTL first if you only need seasonal decomposition.

### Structural / state space

BSTS, Kalman filter, unobserved components.

**Strengths** — a flexible grammar for "local level + local trend + seasonal + regression
with time-varying coefficients"; Bayesian versions give proper posterior uncertainty;
changepoints and interventions are first-class.
**Weaknesses** — weakly identified; two very different component specifications can fit
equally well, and the posterior can mask that. Diagnostics are thin.

### GARCH family

**Strengths** — the right tool for volatility, not for the mean.
**Weaknesses** — irrelevant to your PSAP volume problem, and a classic source of
over-modelling if fitted to level data.

---

## 2. Decomposition-based

**Full treatment in [[Time Series Decomposition]].** Summary of the trade:

| Method | Strengths | Weaknesses |
|---|---|---|
| Classical decomposition | Transparent, fast | Two moving averages; no model for the components; one fixed seasonal period |
| STL 🔗 [otexts.com/fpp3/decomposition](https://otexts.com/fpp3/decomposition.html) | Robust to outliers (LOESS), flexible seasonal shape | Seasonal shape must be supplied, not learned; not a forecaster |
| MSTL | Handles *multiple* seasonalities cleanly — daily → weekly → annual | Same limitations as STL; decomposition order is fixed |
| Theta (Makarov & Smith 2002 — see [[Time Series Decomposition]] §5) | Linear trend + seasonal indices + SES; M3 winner, hard to beat on short clean series | One seasonal period; straight-line trend only |
| X-13ARIMA-SEATS | Trading-day, moving-day and holiday adjustment — the only place done properly | Heavily parameterised; regulation programs exist for a reason |
| Prophet 🔗 [PeerJ cs-143](https://peerj.com/articles/cs-143/) | Built for the business case: changepoints and holidays as first-class inputs; interpretable decomposition | Frequentist, point-forecast oriented; uncertainty bands are known to be badly calibrated; the "flexible trend" can absorb real signal; slower than ETS |
| Boosted decomposition ([[ThymeBoost]]) | Components scheduled per round; continuity at changepoints is an explicit switch; per-component learning rates | Single-series only; additive only; complexity penalty can be silently understated |

> **Prophet's uncertainty bands are the thing to watch.** They come from simulated
> residual trends, which assume future trend variance is proportional to historical trend
> variance. On a series with an event-driven spike, that assumption is badly wrong. If you
> need calibrated intervals, wrap it in a conformal method ([[Model Validation Strategies]] §6)
> rather than trusting them. A density-level repair now exists as well —
> [[Prophet and NeuralProphet]] §3 (prophet-laplace), which makes the band a central 68.27%
> band of a PIT-testable predictive instead of a simulated-trend band.

> **The shared failure mode across this whole family: the seasonal period and shape are inputs,
> not learned.** Classical decomposition, STL, MSTL, Theta and Prophet all require you to state
> `m` in advance. Only the learned-basis approaches (N-BEATS, N-HiTS, DLinear's learned variant)
> and GBDTs on calendar features estimate seasonality from the data. For hourly call volume that
> matters — see [[Time Series Decomposition]] §4 on why `m=168` beats `m=24`.

---

## 3. Machine learning approaches

### Gradient-boosted trees (XGBoost, LightGBM, CatBoost)

**Full treatment in [[Gradient Boosting for Time Series]].** Summary of the trade:

**Strengths**
- Strongest single family when you have **rich exogenous features** — weather, calendar,
  events, promotions. This is where GBDT genuinely outperforms deep nets.
- Handles nonlinearities and interactions without effort
- CatBoost's ordered boosting + native categoricals are a real advantage for calendar and
  location features
- Fast to iterate, robust, well-understood failure modes

**Weaknesses**
- **Requires manual feature engineering.** Nothing about a tree tells it what lag 168 means.
  This is the entire cost of the approach and it does not scale to many series.
- No native extrapolation — a tree cannot forecast beyond the range of its training targets.
  A model trained on peaks ≤ 100 will never predict 120.
- Recursive multi-step by default, so error compounds
- Scaling to many series means either per-series models (slow) or a global model with series
  IDs as features (which is basically what `mlforecast` does)

> The extrapolation limitation is not a nuisance, it is disqualifying for trend extrapolation.
> If your series has real level drift, trees will flatline.

> **There is a second, less-discussed version of this family.** [[ThymeBoost]] boosts over a
> *decomposition* rather than over a feature matrix — the base learner is a trend or seasonal
> estimator, not a tree. Different algorithm, same name, and it sidesteps both the feature
> engineering burden and (partly) the extrapolation problem. See
> [[Time Series Decomposition]] §8.

### Support vector regression, Gaussian processes

**Strengths** — GPs give principled uncertainty and work well on small, smooth, low-
dimensional data.
**Weaknesses** — kernel choice and scaling dominate; `O(n³)` for exact GPs kills them on
panel data. Niche.

---

## 4. Deep learning

### 4.1 RNN-based (LSTM, GRU, DeepAR)

DeepAR 🔗 [arXiv:1704.04110](https://arxiv.org/abs/1704.04110)

**Strengths**
- *Global* models — one network across thousands of related series, so each series benefits
  from the whole panel. Cold-start series with almost no history are forecastable.
- DeepAR produces calibrated probabilistic forecasts natively (Monte Carlo samples → quantiles)
- True state-tracking: recurrences maintain an internal state that long-horizon forecasting
  depends on

**Weaknesses**
- Sequential training — slow, and poorly suited to the long look-backs that hourly problems
  need
- Autoregressive by default → error accumulation at long `h`
- Recurrent architectures are being displaced; see TiRex below for why state-tracking
  survived while the LSTM did not

### 4.2 CNN-based (TCN, WaveNet)

**Strengths**
- Parallel training, wide receptive field via dilations, well-behaved gradients
- Causal by construction — no leakage if you order the convolutions correctly
- Strong local-pattern capture

**Weaknesses**
- Depth (not recurrence) drives receptive field; long context needs many layers
- Less naturally probabilistic than RNNs

### 4.3 Transformer-based (LTSF)

Informer, Autoformer, FEDformer, TFT, PatchTST.

PatchTST 🔗 [arXiv:2211.14730](https://arxiv.org/abs/2211.14730) · TFT 🔗
[arXiv:1912.09363](https://arxiv.org/abs/1912.09363)

**Strengths**
- Patching is the key insight — a single time step has no semantic meaning, a patch does
  (PatchTST, ICLR 2023). Patching also cuts attention cost quadratically
- PatchTST is genuinely competitive and strong as a *pretrained* representation via
  masked self-supervision
- Captures cross-variate interaction when designed to (TFT's variable-selection network)

**Weaknesses**
- **The LTSF-Linear result** ([arXiv:2205.13504](https://arxiv.org/abs/2205.13504)) showed
  a one-layer linear model beating Informer/Autoformer/FEDformer by 20–50% on the standard
  LTSF benchmarks. PatchTST was the response — patching + channel independence closed most
  of the gap. See [[Linear Models for Forecasting]].
- Quadratic attention cost
- Heavy tuning; results are unstable across random seeds without careful normalisation

> **RevIN is effectively mandatory.** Any neural forecaster you build should include
> instance normalisation — see [[Distribution Shift and Normalization]]. It is the single
> highest-value component in most neural forecasting stacks.

### 4.4 MLP basis models (N-BEATS, N-HiTS)

N-BEATS 🔗 [arXiv:1905.10437](https://arxiv.org/abs/1905.10437) · N-HiTS 🔗
[arXiv:2201.12886](https://arxiv.org/abs/2201.12886)

**Strengths**
- Pure MLP — no attention, no recurrence. Fast, low memory (< 26% of competitor params)
- N-HiTS: hierarchical interpolation + multi-rate sampling gives ~20% average accuracy
  improvement over contemporary Transformers at 50× less compute
- N-BEATS-I is genuinely interpretable (trend/seasonal basis decomposition)
- Native probabilistic output via quantile loss

**Weaknesses**
- Global models — need a reasonably large panel to pay off
- Univariate-first; multivariate handling is weaker than PatchTST
- Input length must scale with horizon, which costs memory at large `h`

> **This family is underrated and under-listed.** N-HiTS is in `neuralforecast`, is cheap,
> is interpretable, and gives calibrated quantiles out of the box. It belongs in every
> baseline panel.

### 4.5 State space models / Mamba

TSMamba 🔗 [arXiv:2411.02941](https://arxiv.org/abs/2411.02941)

**Strengths** — linear in sequence length, selective state space parameterisation.
**Weaknesses** — the Mamba results for forecasting are considerably weaker than for NLP,
and the published TSFM variants trail patch-based transformers. Low priority unless you
need very long context.

---

## 5. Foundation and zero-shot models

Full treatment in **[[Time Series Foundation Models]]**. Summary of the trade:

| Strengths | Weaknesses |
|---|---|
| No task-specific training; deploy in minutes | Pre-training corpora overlap the public benchmarks — zero-shot claims often overstated |
| Cold-start series are the *target* use case | Degrade on domain shift the corpus never saw |
| Quantile output is native, usually better calibrated than point+interval wrappers | Inference cost; closed/licensed variants (TimeGPT) need an API |
| Cross-series / in-context learning where available | The advantage shrinks as your own history grows — and it grows with `h` negatively |

---

## 6. Multivariate and panel methods

VAR / VARMA / VARMAX, dynamic factor models, panel approaches.

**Strengths** — model cross-series structure explicitly; VAR with a sensible truncation is
hard to beat on genuinely cointegrated systems; dynamic factor models scale to very wide panels.

**Weaknesses** — parameter count explodes quadratically in the number of variables; the
VARMAX likelihood is expensive and prone to local optima; structural identification requires
assumptions you usually cannot defend.

> For 9-1-1 call volume, cross-series methods are mostly the wrong call. A single
> jurisdiction's hourly call count has one series; the interesting structure is *within* the
> series (hour-of-week, incident effects), not across series. This is exactly the assumption
> the discrete-vs-continuous comparison in [[168-Point Forecast Comparison - Discrete vs Continuous]]
> turns on.

Hierarchical / grouped forecasting — see [[forecast-reconciliation]].

---

## 7. Probabilistic and ensemble methods

**Quantile regression** — train one model per quantile, or one model with a pinball loss.
Workhorse; natively calibrated if you score with pinball.

**Ensembles / combinations** — simple average, stacking, Bayesian model averaging.

> **The most robust empirical finding in the entire forecasting literature.** In M4, the
> combination of *all* submitted methods beat every individual method, and robustness
> (leave-one-out stability of the ranking) predicted performance better than average
> accuracy. See Montero-Manso & Hyndman 🔗 [arXiv:2003.07823](https://arxiv.org/abs/2003.07823)
> and §6 of [[Time Series Forecasting Baselines]]. If you build one model, you have left
> value on the table.

---

## 8. Conformal prediction

Not a model — a distribution-free wrapper that converts any point forecaster into a
calibrated interval. Full treatment in [[resources]] §3.7 and
[[Model Validation Strategies]] §6.

**Strengths** — finite-sample marginal coverage, model-agnostic, almost no assumptions.
**Weaknesses** — only *marginal* coverage; interval width scales with a single global
calibration quantile so heteroscedastic series get bad intervals exactly where they matter;
exchangeability is violated by autocorrelated series without an adaptation (EnbPI, ACI, SPCI).

> For a staffing application this is the crux. Marginal coverage can be exactly on target
> while coverage at peaks is zero.

---

## 9. Choosing a family

| Situation | Start with | Then check |
|---|---|---|
| Hourly counts, few years, no exogenous data | Seasonal naive `m=168` → N-HiTS → Chronos-2 / TiRex | Hour-of-week baseline; peak-conditional error |
| Hourly counts, weather + events available | CatBoost with lags + calendar + weather | Linear (DLinear/NLinear); whether features are worth it |
| Long horizon, multivariate | PatchTST, N-HiTS | DLinear as the honesty check |
| Multi-seasonality (24 / 168 / 8766) | MSTL + ETS, or TBATS | A global model that sees all three |
| Known level shift or policy change in the series | Prophet (L1 changepoint prior), or MSTL + local linear trend | Whether a continuous-only changepoint model is enough — see [[ThymeBoost]] §2.3 |
| Structure is known and the forecast must be explainable | ETS, Prophet, boosted decomposition | Whether the extra flexibility earns its complexity penalty |
| Small data, cold start | Zero-shot TSFM | Never report without a seasonal-naive comparison |
| Many related series, probabilistic needed | DeepAR, N-HiTS, Chronos-2 | Quantile calibration on held-out |
| Intermittent / many zeros | Croston family, TSB | See [[Intermittent and Sparse Demand]] |
| Interpretability is a hard requirement | ETS, ARIMA, Prophet, N-BEATS-I | What attribution can and cannot claim on a GBM — [[Feature Importance and Explainability]] |
| You must ship | **Ensemble of the above** | — |

---

## 10. What this note does not cover

Each is now a dedicated note:

- [[Linear Models for Forecasting]] — the DLinear/NLinear result and why it matters
- [[Distribution Shift and Normalization]] — RevIN and the normalisation literature
- [[Time Series Foundation Models]] — the 2026 TSFM landscape with arXiv links
- [[TimeCopilot]] — agentic forecasting frameworks
- [[Nixtlaverse]] — the Nixtla open-source ecosystem
- [[Generative and Probabilistic Forecasting]] — diffusion, flow matching, quantiles
- [[LLM-as-Forecaster and Agentic Forecasting]] — Time-LLM, Synapse, TFR-Bench
- [[Intermittent and Sparse Demand]] — Croston, TSB, ADIDA, IMAPA
- [[Time Series Anomaly Detection]] — MOMENT, deep AD, evaluation
- [[Time Series Decomposition]] — STL, MSTL, Theta, Prophet, decomposition as a base learner
- [[Gradient Boosting for Time Series]] — Friedman's algorithm, XGBoost/LightGBM/CatBoost, the TS failure modes
- [[ThymeBoost]] — gradient boosting over a decomposition

## References

**Classical**
1. Hyndman, R.J. & Athanasopoulos, G. (2021). *Forecasting: Principles and Practice*, 3rd ed. 🔗 https://otexts.com/fpp3/
2. Hyndman, R.J., Koehler, A.B., Ord, J.K. & Snyder, R.D. (2008). *Forecasting with Exponential Smoothing*. 🔗 https://robjhyndman.com/forecpapers/books/STATE-SPACE-BOOK.pdf
3. Hyndman, R.J. & Khandakar, Y. (2008). Automatic time series forecasting: the forecast package for R. 🔗 https://robjhyndman.com/papers/forecast.pdf
4. Taylor, S.J. & Letham, B. (2018). Forecasting at scale. *The American Statistician*. 🔗 https://peerj.com/articles/cs-143/
5. Wang, X., Smith, N.A. & Hyndman, R.J. (2006). Characterizing multiple periodicities. 🔗 https://otexts.com/fpp3/decomposition.html

**Machine learning**
6. Chen, T. & Guestrin, C. (2016). XGBoost. 🔗 https://arxiv.org/abs/1603.02754
7. Ke, G. et al. (2017). LightGBM. 🔗 https://proceedings.neurips.cc/paper/2017/hash/6449f44a102fde848669bdd9eb6b76fa-Abstract.html
8. Prokhorenkova, L. et al. (2018). CatBoost. 🔗 https://arxiv.org/abs/1706.09516
9. Friedman, J.H. (2001). Greedy function approximation. *Annals of Statistics* 29(5). 🔗 https://doi.org/10.1214/aos/1013203451

**Deep learning**
10. Salinas, D. et al. (2020). DeepAR. 🔗 https://arxiv.org/abs/1704.04110
11. Oreshkin, B.N. et al. (2020). N-BEATS. 🔗 https://arxiv.org/abs/1905.10437
12. Challu, C. et al. (2023). N-HiTS. 🔗 https://arxiv.org/abs/2201.12886
13. Nie, Y. et al. (2023). A Time Series is Worth 64 Words (PatchTST). 🔗 https://arxiv.org/abs/2211.14730
14. Zeng, A. et al. (2023). Are Transformers Effective for Time Series Forecasting? 🔗 https://arxiv.org/abs/2205.13504
15. Liu, T. et al. (2021). TSMamba. 🔗 https://arxiv.org/abs/2411.02941
16. Goswami, M. et al. (2024). MOMENT. 🔗 https://arxiv.org/abs/2402.03885

**Evaluation and combination**
17. Montero-Manso, P. & Hyndman, R.J. (2021). Attributes that define forecasting benchmarks. 🔗 https://arxiv.org/abs/2003.07823
18. Makridakis, S., Spiliotis, E. & Assimakopoulos, V. (2020). The M4 Competition. 🔗 https://doi.org/10.1016/j.ijforecast.2019.11.001

## Status

- [x] Full taxonomy preserved from the original note
- [x] Per-family strengths / weaknesses
- [x] Error-accumulation and local/global/pretrained framings
- [x] arXiv references throughout
- [x] Decision table by situation
- [x] Cross-links to the dedicated notes
- [x] §2 and §3 point at dedicated decomposition and gradient-boosting notes
- [ ] Empirical: run the decision table against the Douglas County data once acquired

## Cross-links

- [[Linear Models for Forecasting]]
- [[Distribution Shift and Normalization]]
- [[Time Series Foundation Models]]
- [[Generative and Probabilistic Forecasting]]
- [[LLM-as-Forecaster and Agentic Forecasting]]
- [[Intermittent and Sparse Demand]]
- [[Time Series Anomaly Detection]]
- [[Time Series Decomposition]]
- [[Gradient Boosting for Time Series]]
- [[ThymeBoost]]
- [[Time Series Forecasting Baselines]]
- [[Model Validation Strategies]]
- [[forecast-reconciliation]]
- [[Forecasting Non-Stationary Data]] — §1's ARIMA stationarity caveat now has a full treatment; ADF/KPSS protocol in §2
- [[Feature Importance and Explainability]] — the §9 "interpretability" row, and the collinearity caveats on GBM importances
- [[Forecasting Libraries and Frameworks]] — the frameworks that ship these families: Darts, sktime, GluonTS, Merlion, Greykite, Orbit; §3's AutoML layer as the counterargument to §9
- [[Prophet and NeuralProphet]] — Prophet's own note: the model's knobs, the band problem §2 quotes, and the two repairs (NeuralProphet, prophet-laplace)
- [[resources]]
