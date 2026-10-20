---
type: reference
status: active
topic: "Constructing the lag, rolling, calendar and exogenous feature matrix for tabular and ML forecasters — the design choices that matter, the leakage traps, and where the scaling burden actually sits."
created: 2026-10-15
tags:
  - time-series
  - forecasting
  - feature-engineering
  - machine-learning
  - leakage
  - python
aliases:
  - Feature Engineering
  - Time Series Features
  - Lag Features
  - tsfeatures
  - feasts
---

# Feature Engineering for Time Series

A tree does not know that `lag_168` means "the same hour last week." Every lag, rolling window and
calendar flag in a tabular forecaster is a decision you made. This note is the framework for making
those decisions — and it is currently **four lines of code** in the vault.

> Written 2026-10-15. The entire prior treatment was a 4-line `lags/rollings/time_idx/exog` dict in
> §5 of [[Gradient Boosting for Time Series]] plus three passing sentences in [[Nixtlaverse]] §4.

---

## 1. Why this is a first-class topic

For a GBDT, a global neural model, or any ML forecaster, **the feature set is the model.** There is
no architecture to fall back on. And:

1. The study's covariates (weather, events, population, university sports) are slated to be
   *required*, not optional.
2. Feature construction is **exactly where time-series leakage enters** — see
   [[Model Validation Strategies]] §1.
3. The cost does not scale to many series, which is why
   [[Hierarchical and Mixed-Effects Models for Forecasting]] exists as the alternative.

> **The framing to hold:** this is a *bias-variance decision under a leakage constraint*, not a
> checklist. More features is not better — it is more ways to overfit and more ways to leak.

---

## 2. The taxonomy

### 2.1 Lags

$$\text{lag}_k(y)_t = y_{t-k}$$

| Choice | Reasoning |
|---|---|
| **Which lags** | `lag_1`, `lag_24`, `lag_168` cover hour, day, week. Skip the ones between — they are collinear |
| **Why `lag_168` matters most** | Hour-of-week is the dominant structure for PSAP volume. See [[Time Series Decomposition]] §4 |
| **Seasonal differences** | $\Delta_s y_t = y_t - y_{t-s}$ is a *detrending* device, not just a feature — it feeds linear models directly ([[Linear Models for Forecasting]]) |

> **For hourly 9-1-1: `lags=[1, 2, 3, 24, 48, 168]`.** Note the *gap* between 24 and 168. A model
> that sees only `lag_24` cannot distinguish Tuesday 03:00 from Saturday 03:00.

### 2.2 Rolling windows

$$\text{roll}_{k,m}(y)_t = \text{agg}(y_{t-k+1..t})$$

| Feature | Why |
|---|---|
| `rolling(24).mean()` | Recent daily level |
| `rolling(168).mean()` | **The continuous model's answer to "how much does the surrounding week matter?"** — a smooth version of `lag_168` |
| `rolling(168).std()` | Local volatility. Rises before incidents |
| `expanding().mean()` | Long-run level; drift indicator |
| `rolling(k).shift(1)` | **Usually what you want** — a window *including* $y_t$ leaks |

> **The `lag_168` vs `rolling(168).mean()` distinction is a real modelling choice, not a detail.**
> The lag says "exactly one week ago." The rolling mean says "the general level of recent weeks."
> **Including both is a different hypothesis class from either** — the first encodes exact weekly
> recurrence, the second encodes a slowly-varying baseline. Both together let the model use one for
> level and the other for shape.

### 2.3 Calendar

| Feature | Encoding | Trap |
|---|---|---|
| `hour_of_day` | 0–23 or cyclical | Use `sin`/`cos` for periodicity |
| `day_of_week` | 0–6 | Must interact with hour for hour-of-week |
| `hour_of_week` | 0–167 | **The single most important categorical for this problem** |
| `day_of_year` | 0–365 | Beware leap years |
| `is_holiday` | 0/1 | From a real calendar, not guessed |
| `is_school_day` | 0/1 | Term boundaries, not just weekends |
| `week_of_year` | 1–52 | |

> **Encode cyclical features as `sin`/`cos`, not as integers.** A tree splitting on `hour` treats
> 23 and 0 as far apart, which they are not. On the **linear** side this is exactly the Fourier
> argument in [[Time Series Decomposition]] §5.

### 2.4 Decomposition-derived

Trend, seasonal and residual components from [[Time Series Decomposition]] as columns. This
sits between decomposition-based and feature-based models and is under-used — the seasonal component
alone is a strong feature.

### 2.5 Series-characteristic features (for *selection*, not forecasting)

`feasts` / `tsfeatures` compute ~50 summary statistics per series:

| Group | Features |
|---|---|
| ACF | `acf1`, `acf10` (sum of squares of first 10), `diff1_acf1`, `season_acf1` |
| STL | `trend_strength`, `seasonal_strength`, `seasonal_peak_year`, `spikiness`, `linearity`, `curvature` |
| Others | `entropy`, `stability`, `flat_spots`, `crossing_points`, `hurst`, `unitroot_kpss`, `ljung_box`, `spectral` |

$$F_T = \max\left(0,\ 1 - \frac{\mathrm{Var}(R_t)}{\mathrm{Var}(T_t + R_t)}\right)$$

> **These are for choosing *which model* to use, not for forecasting.** Their main use is
> **FFORMA** ([[Forecast Combination]] §2.4) and for characterising a panel. With a **single**
> univariate series they are far less useful — you would be selecting between models on one data
> set, which is thin. Their real value arrives when you have many series, which you may not.

**Tooling:** `feasts` 0.5.0 (2026) is the current package and what FPP3 uses; `tsfeatures` 1.1.1
(CRAN) is superseded. In Python, `tsfresh` and `sktime` handle the forecasting-feature case.

> **⚠️ Setting `period=168` matters.** The `acf`/`seasonal_strength` features default to a
> quarterly period. **For your data every seasonal feature must be told `period=168`** or it will
> measure the wrong seasonality and return near-zero strength.

---

## 3. Leakage — the part that will bite

### 3.1 The three classic failures

| Failure | Mechanism | Fix |
|---|---|---|
| **Window includes $y_t$** | `rolling(168).mean()` computed without `.shift(1)` sees the target | `.shift(1)` |
| **Fit/serve skew** | Features computed one way at fit time, another at predict time | Log the features actually served, and retrain on those — Google Rules of ML **#29** |
| **Target encoding leakage** | Encoding a categorical by its mean target over the whole set | Ordered/permutation-invariant encoding — this is **exactly what CatBoost does** |

### 3.2 Why CV can be invalid here

**Bergmeir, Hyndman & Koo (2018), *CSDA* 120, 70–83** 🔗
[10.1016/j.csda.2017.11.003](https://doi.org/10.1016/j.csda.2017.11.003) — for some autoregressive
models, **ordinary k-fold CV is invalid** and blocked/rolling CV *overestimates* error relative to
true out-of-sample.

**Tashman (2000), *IJF* 16(4), 437–450** 🔗
[10.1016/S0169-2070(00)00065-0](https://doi.org/10.1016/S0169-2070(00)00065-0) — the rolling-origin
standard.

**Kaufman, Rosset, Perlich & Stitelman (2012), *ACM TKDD* 6(4)** 🔗
[10.1145/2382577.2382579](https://doi.org/10.1145/2382577.2382579) — the canonical treatment of
aggregate/target-encoding leakage.

### 3.3 The purge arithmetic for rolling features

This is concrete and the vault has not worked it out:

> A rolling feature with window $k$ at forecast horizon $h$ depends on data from $[t - k, t]$.
> Your validation fold boundary is at $t_0$. **If $k > h$, the feature at a test point draws on the
> test period itself.**

With `rolling(168)` and `h = 168`, the window exactly reaches the forecast horizon. **You must
either shift by the window length or purge at least $k$ samples at each fold boundary.** This
interacts with the purge/embargo in [[Model Validation Strategies]] §5 — the feature window *adds*
to the required gap. Get this wrong and your rolling features silently carry the answer.

### 3.4 Availability: known-future covariates

A covariate is usable at forecast time only if its future values are actually available. See
[[Nixtlaverse]] §3 — the long-panel contract deliberately requires you to **declare** static vs
future covariates, and a misdeclared future covariate is a leakage vector.

**Known in advance:** calendar, holidays, scheduled events. **Not known:** weather beyond a
forecast horizon, emergency events.

> For `h = 168` (a week ahead), **weather forecasts do not reach.** Either use a weather forecast
> as a covariate — which changes the problem to "forecast given a forecast" — or drop it. Do not
> silently use observed future weather; that is the single most common and most embarrassing leak
> in this kind of work.

---

## 4. Scaling

| Scope | Approach | Note |
|---|---|---|
| **Single series** | Raw counts, local scaling | Mostly moot |
| **Panel / global model** | Standardise features **within series** | Removes level differences between a quiet and a busy series |
| **Cross-series feature model** | Global scaling across the panel | For FFORMA-style selection |

**Local vs global scaling** is a real choice with no canonical answer. With `hour_of_week` dummies
in a global model, within-series normalisation mostly matters for count magnitudes. **Run the
sensitivity check; do not assume.**

---

## 5. Embeddings: useful for exploration, rarely for features

**t-SNE** (van der Maaten & Hinton 2008, *JMLR* 9(86) — JMLR mints **no DOI**) and **UMAP**
(McInnes et al. 2018, *JOSS* 3(29), 861 🔗
[10.21105/joss.00861](https://doi.org/10.21105/joss.00861)) project a series-feature matrix to 2-D.

**Kang, Hyndman & Smith-Miles (2017), *IJF* 33(2), 345–358** 🔗
[10.1016/j.ijforecast.2016.09.004](https://doi.org/10.1016/j.ijforecast.2016.09.004) is the right
citation: they embed series into an instance space precisely **to explore where methods work**. Full
coverage in [[Time Series Similarity, Clustering and Motif Discovery]] §6.

> **Use embeddings for exploration and diagnosis, not as model inputs.** t-SNE has no
> out-of-sample transform — you cannot embed a new series into an existing t-SNE map and get a
> meaningful position. **That alone disqualifies it from a production feature pipeline.**
> Wang, Smith & Hyndman (2006), *DMKD* 13(3), 335–364 🔗
> [10.1007/s10618-005-0039-x](https://doi.org/10.1007/s10618-005-0039-x) is the feature-space
> foundation; Hyndman, Wang & Laptev (2015), 🔗
> [10.1109/ICDMW.2015.104](https://doi.org/10.1109/ICDMW.2015.104) extends it to outlier detection.

**`tslearn`** 🔗 https://www.jmlr.org/papers/v21/20-091.html — useful toolkit, but
`TimeSeriesResampler` does **linear resampling in the time axis**, which **destroys the peakiness
of a count series**. Never use it on raw hourly counts.

---

## 6. Tooling

| Tool | Status | Use |
|---|---|---|
| `tsfresh` | 9,473★, MIT, active (pushed 2026-07) | Automated extraction. **Christ, Braun, Neuffer & Kempa-Liehr (2018), *Neurocomputing* 307, 72–77** 🔗 [10.1016/j.neucom.2018.03.067](https://doi.org/10.1016/j.neucom.2018.03.067) |
| `sktime` | 10,068★, very active | Feature transformers; `.tsf` format used by Monash |
| `feature_engine` | 2,290★, active | Generic feature engineering with leakage-aware transformers |
| `tsflex` | *SoftwareX* 17 (2022) 100971 | Flexible chunked processing and multi-set feature extraction — Van Der Donckt et al. |
| `TSFEL` | *SoftwareX* 11 (2020) 100456 | Standalone feature-extraction library — Barandas et al. |
| `feasts` (R) | 0.5.0 | FPP3's ~50 series characteristics |
| `tsfeatures` (R) | 1.1.1 | Superseded by `feasts` |

> **⚠️ `tsfresh` has two papers and they are frequently conflated.** The **journal** paper is
> Christ, **Braun, Neuffer & Kempa-Liehr** (2018) — *Feindt is not an author*. The **conference**
> paper (AMLC 2016, 🔗 [arXiv:1610.07717](https://arxiv.org/abs/1610.07717)) is Christ, Kempa-Liehr
> **& Feindt**. Cite the 2018 Neurocomputing one; it is the one with the DOI.

---

## 7. Assessment

**Strengths**
- Turns an opaque model into an inspectable design.
- Rolling and lag features capture the structure the domain actually has.
- Cheap, fast, well understood.
- Feature-characteristics enable principled model *selection* (FFORMA).

**Weaknesses**
- **The burden is manual and does not scale to many series.** This is the honest reason
  [[Hierarchical and Mixed-Effects Models for Forecasting]] and global neural models exist.
- **Leakage is easy and silent**, and the rolling-window/purge interaction is arithmetic that must
  be done deliberately.
- **No out-of-sample transform** for embedding-based features.
- Availability of covariates at forecast time is a domain question, not a technical one.
- Curse of dimensionality: 168 dummies + lags + rolling stats is a lot of columns for a few years
  of hourly data.

---

## 8. Try it

- [ ] Build the matrix for hourly PSAP volume: `lags=[1,2,3,24,48,168]`, `rolling(24,168)` mean
      and std, `hour_of_week` (sin/cos or categorical), holidays, school terms
- [ ] **Test the §3.3 arithmetic explicitly.** Compute `rolling(168).mean()` with and without
      `.shift(1)` and confirm the unshifted version scores better in-sample and worse on
      rolling-origin. That gap is the leak, made visible
- [ ] Ablate `lag_24` against `lag_168`. Quantify what the weekly lag is worth — this is the single
      most informative feature experiment available. Note that importance attribution will
      *understate* this: see [[Feature Importance and Explainability]] §5 — grouped permutation is
      the honest version of this experiment, and ablation is its ground truth
- [ ] Test `lag_168` alone vs `rolling(168).mean()` alone vs both. Confirm they are a different
      hypothesis class
- [ ] Check which covariates are actually available at `h=168`. If weather is not, either use a
      weather forecast or drop it — and write down which you did
- [ ] Compute the `feasts` characteristics **with `period=168`** and see whether the seasonal
      strength is even non-trivial
- [ ] Run the global-scaling vs local-scaling sensitivity check on the panel

## References

1. Hyndman, R.J. & Athanasopoulos, G. (2021). *Forecasting: Principles and Practice*, 3rd ed.
   **Chapter 4**, "Time series features." 🔗 https://otexts.com/fpp3/features.html
2. Wang, X., Smith, K.A. & Hyndman, R.J. (2006). Characteristic-based clustering for time series
   data. *Data Mining and Knowledge Discovery* 13(3), 335–364. 🔗
   https://doi.org/10.1007/s10618-005-0039-x
3. Hyndman, R.J., Wang, X. & Laptev, N. (2015). Large-scale unusual time series detection. *ICDMW*.
   🔗 https://doi.org/10.1109/ICDMW.2015.104
4. Kang, Y., Hyndman, R.J. & Smith-Miles, K. (2017). Visualising forecasting algorithm performance
   using time series instance spaces. *IJF* 33(2), 345–358. 🔗
   https://doi.org/10.1016/j.ijforecast.2016.09.004 ⭐ **what embeddings are for**
5. Christ, M., Braun, N., Neuffer, J. & Kempa-Liehr, A.W. (2018). Time series featuRe extraction on
   basis of scalable hypothesis tests (tsfresh). *Neurocomputing* 307, 72–77. 🔗
   https://doi.org/10.1016/j.neucom.2018.03.067
6. Tavenard, R. et al. (2020). tslearn, a machine learning toolkit for time series data. *JMLR*
   21(118). 🔗 https://www.jmlr.org/papers/v21/20-091.html
7. Bergmeir, C., Hyndman, R.J. & Koo, B. (2018). A note on the validity of cross-validation for
   evaluating autoregressive time series prediction. *CSDA* 120, 70–83. 🔗
   https://doi.org/10.1016/j.csda.2017.11.003 ⭐ **leakage/CV validity**
8. Tashman, L.J. (2000). Out-of-sample tests of forecasting accuracy: an analysis and review. *IJF*
   16(4), 437–450. 🔗 https://doi.org/10.1016/S0169-2070(00)00065-0
9. Kaufman, S., Rosset, S., Perlich, C. & Stitelman, O. (2012). Leakage in data mining:
   Formulation, detection, and avoidance. *ACM TKDD* 6(4). 🔗
   https://doi.org/10.1145/2382577.2382579
10. Cerqueira, V., Torgo, L. & Mozetič, P. (2020). Evaluating time series forecasting models: An
    empirical study on performance estimation methods. *Machine Learning* 109, 1997–2028. 🔗
    https://doi.org/10.1007/s10994-020-05910-7
11. McInnes, L., Healy, J., Saul, N. & Großberger, L. (2018). UMAP. *JOSS* 3(29), 861. 🔗
    https://doi.org/10.21105/joss.00861
12. van der Maaten, L. & Hinton, G. (2008). Visualizing data using t-SNE. *JMLR* 9(86),
    2579–2605. 🔗 https://www.jmlr.org/papers/v9/vandermaaten08a.html
13. Google. *Rules of Machine Learning.* 🔗 https://developers.google.com/machine-learning/guides/rules-of-ml
    — #29 feature logging, #33 test on later data, #36 positional-feature leakage

## Cross-links

- [[Gradient Boosting for Time Series]] §5 — where the previous four-line treatment lived
- [[Model Validation Strategies]] §1 and §5 — leakage, purge and embargo
- [[Nixtlaverse]] §3 — the declared static vs future covariate contract
- [[Time Series Decomposition]] §5 — Fourier encoding of cyclical features
- [[Forecast Combination]] §2.4 — FFORMA, the main consumer of series characteristics
- [[Hierarchical and Mixed-Effects Models for Forecasting]] — the alternative that removes the burden
- [[Linear Models for Forecasting]] — seasonal differences as a feature, not just a plot
- [[Forecasting Non-Stationary Data]] §2 — the stationarity tests behind §2.5's `unitroot_kpss`/`unitroot_pp` features; §3 on why differenced features generalise
- [[Forecasting Libraries and Frameworks]] §4 — tsflex and TSFEL, the other two extraction libraries in the tooling table
- [[Feature Importance and Explainability]] — the read-back side of this note: which of the constructed features earned their place, and the collinearity trap that makes naive rankings lie
