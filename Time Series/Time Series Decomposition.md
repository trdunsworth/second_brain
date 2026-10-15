---
type: reference
status: active
topic: "Classical, STL, MSTL, Theta and Prophet decomposition — the additive and multiplicative identities, why the seasonal period must be supplied rather than learned, and why decomposition keeps returning as a neural architecture."
created: 2026-10-15
tags:
  - time-series
  - forecasting
  - decomposition
  - seasonality
  - changepoints
  - statistics
aliases:
  - Decomposition
  - STL
  - MSTL
  - Seasonal Decomposition
---

# Time Series Decomposition

Decomposition splits a series into **trend + seasonality + remainder**. It is the oldest idea in
forecasting, the most useful diagnostic tool in the box, and — for most series — **not a
forecasting method on its own.** This note covers the identity, the algorithms, the failure
modes, and why it keeps reappearing inside modern architectures.

> Written 2026-10-15. This was previously a four-row table in
> [[time-series-forecasting-models]] §2 and scattered mentions elsewhere. It is now treated
> properly.

---

## 1. The identity

**Additive:**

$$y_t = T_t + S_t + R_t$$

**Multiplicative:**

$$y_t = T_t \times S_t \times R_t$$

### How to choose

| Use additive when | Use multiplicative when |
|---|---|
| Seasonal **amplitude is roughly constant** over time | Seasonal **amplitude grows** with the level |
| The series crosses zero | The series is strictly positive |
| Seasonal swings are the same size in a quiet week and a busy week | Peaks scale proportionally — 10% of 100 calls and 10% of 1,000 |

The diagnostic is simple and worth doing before anything else: **overlay two or three cycles of
the detrended series at different levels of `y`.** Flat humps → additive. Humps that grow with
height → multiplicative.

> **In practice: use additive.** Multiplicative handling is poorly supported across the toolchain
> — and the library discussed in §7 outright refuses it
> (`ValueError('Multiplicative Seasonality is not enabled!')`). Log-transform first and stay
> additive if you need it. On a seasonal count series you also have to remember that a
> multiplicative model forecasts `exp(x)` and will not return integers, which breaks every count
> metric you care about.

### Two normalisations

| Option | Effect |
|---|---|
| `normalize_seasonality=True` | Subtracts the mean of the seasonal component so it sums to ~zero over a cycle. **Always do this** with a regression component present, or the seasonal term and the regression term will fight over the intercept |
| Raw seasonal means | Seasonal component carries the mean level. Fine for pure decomposition, wrong the moment you add anything else |

---

## 2. Classical decomposition

The textbook method, and the one every tutorial starts with.

**Additive, period *m* (even):**

1. Trend = centred moving average of width *m* → $T_t$
2. Detrended $D_t = y_t - T_t$
3. Seasonal = mean of $D_t$ across all $t \equiv i \pmod m$, for each $i = 1..m$ → $S_t$
4. Remainder $R_t = D_t - S_t$

**Forecast:** $\hat{y}_{t+h} = T_{t+h} + S_{t+h}$, with the seasonal term looked up by phase.
$T$ is usually extrapolated by simple linear regression.

**Strengths**
- Transparent. Every number is a mean you can point at in the data.
- Fast enough to ignore.
- An excellent first diagnostic before you commit to anything else.

**Weaknesses**
- The trend smoothing window is tied to the seasonal period. `m=168` means a 168-hour centred
  moving average, which flattens real week-to-week structure.
- **Only one seasonal period, one shape, fixed forever.**
- No model for the components — you have to invent the extrapolation yourself.
- No robustness. A single spike in the remainder contaminates the seasonal means.

> **The single biggest trap.** Classical decomposition assumes the seasonal period is *known and
> constant*. For hourly 9-1-1 call volume the daily period (24) is the obvious one and it is
> almost certainly **the wrong one to lead with** — see §4.

---

## 3. STL, X-13, and MSTL

### STL — Seasonal-Trend decomposition using LOESS

Cleveland et al. (1990). Loess-smoothed trend and seasonal, fit **iteratively** with inner and
outer loops, and — critically — with **robust weights** so outliers are down-weighted rather than
averaged in.

```
loess(y, span) = local regression on the nearest `span` points,
                 with tricube weights, refit at every point
```

| Strengths | Weaknesses |
|---|---|
| Robust to outliers and to spikes in the seasonal window | **The seasonal shape must still be supplied.** `period` and `seasonal()` degree are inputs, not learned |
| `seasonal()` allows a non-periodic, slowly-varying seasonal shape | Iterative and therefore slow; not vectorised |
| Trend span and seasonal span are tunable independently | Still exactly **one** seasonal period |
| Decomposes and reassembles without loss | **Still not a forecaster** |

**The "seasonal shape must be supplied, not learned" point is the load-bearing weakness and it
is worth being blunt about.** In a neural forecaster or a boosted component model, seasonality is
a *parameter* estimated from data. In STL it is a *smoothness setting* you chose before looking.
For a series with drifting seasonal amplitude, STL will not find it.

### X-13ARIMA-SEATS

The production workhorse of official statistics agencies (US Census, Eurostat). STL plus
**outlier detection and replacement**, **trading-day and moving-day adjustment**, and **working
holiday effects**. Regulation programs exist specifically to control over-fitting when you add
calendar regressors. If your seasonal pattern is contaminated by a holiday that lands on a
different weekday some years, this is the tool — and it is the only place it is done properly.

### MSTL — Multiple Seasonal-Trino decomposition

Wang, Smith & Hyndman (2006). Decomposes **recursively, by descending period length**:

```
y → detrend(daily) → detrend(weekly) → detrend(annual) → residuals
```

| Period | Removed | Residuals model |
|---|---|---|
| Annual (8766) | Year-on-year level shifts | Long-run dynamics |
| Weekly (168) | Day-of-week structure | — |
| Daily (24) | Time-of-day structure | Noise + events |

**Strengths** — handles several seasonalities without the parameter explosion that kills SARIMA.
It is the right default for multi-seasonal hourly data.

**Weaknesses** — the *order* is fixed and the periods must be supplied; each stage's trend
estimate can absorb signal from a shorter period if the spans are badly chosen; and, like STL, it
is **not a forecaster** — you still forecast each component separately and recombine.

---

## 4. Choosing the seasonal period — the 24 / 168 problem

For hourly call volume there are at least three live periods: **24** (time of day), **168** (day of
week), **8766** (day of year). They are not independent, and the naive choice is usually wrong.

**What actually drives call volume is hour-of-week, not hour-of-day.** A Tuesday 03:00 and a
Saturday 03:00 are not the same event. If you decompose on 24 you get a daily profile that is an
*average over seven different weekday behaviours* — and you have thrown away the fact that the
weekend shape is structurally different.

| Level | Effect on the seasonal term |
|---|---|
| Seasonal only on 24 | Averages seven different regimes into one profile. Understates Friday/Saturday peaks |
| Seasonal only on 168 | Captures hour-of-week correctly, but **loses any smooth annual drift** in the seasonal term |
| MSTL on 24 + 168 + 8766 | Both regimes and annual drift, at the cost of more parameters and slower fitting |

> **The baseline-panel consequence.** This is exactly why the seasonal-naive baseline is
> specified as **$m = 168$, not $m = 24$**, in [[Time Series Forecasting Baselines]] §3.1 and why
> the Nixtlaverse example uses `season_length=168` and `lags=[24, 168]`. If you fit ThymeBoost or
> MSTL or a Prophet model on this data, `seasonal_period=168` is the setting that matches the
> benchmark you are being scored against.

> **Annual seasonality is the one to be careful with.** 8766 periods needs several years of data
> to estimate at all, and a jurisdiction's call volume drifts over years for reasons that are
> policy and demography, not season. Test whether the annual term earns its keep against a
> local-linear trend plus 168-period seasonality before you include it.

---

## 5. Theta and dynamic harmonic regression

### Theta method

Makarov & Smith (2002). The core move is remarkable in its simplicity: **decompose by simple
linear regression**, not moving averages.

1. Fit $\hat{a} + \hat{b}t$ to $y$ → $\hat{y}$
2. $\hat{y}_b = \theta/2 \cdot \hat{y} + (1 - \theta/2) \cdot y$, with $\theta = 2$ → $\hat{y}_b = y$
3. Deseasonalise $\hat{y}_b$ by dividing out the seasonal indices
4. SES the deseasonalised series → forecast
5. Reseasonalise

With $\theta = 2$ the whole method reduces to **linear trend + seasonal indices + SES on the
deseasonalised remainder**. M3 winner, and still a benchmark that is hard to beat on short,
clean, univariate series.

**Strengths** — the trend is a straight line, so there is no moving-average window to get wrong.
Fast. Robust enough in practice.
**Weaknesses** — one seasonal period; straight-line trend only (no changepoints); and the
decomposition is not exposed as an object, so you cannot inspect it.

### Dynamic harmonic regression (Fourier)

Regression on $\sin(2\pi k t/m)$ and $\cos(2\pi k t/m)$ basis functions for $k = 1..K$, plus a
trend. The seasonal profile is then **constrained to be a smooth wave** — you choose $K$.

| Trade | Detail |
|---|---|
| Small $K$ | Smooth, stable, cannot represent a spiky weekday profile |
| Large $K$ | Flexible, but $2K$ parameters per seasonal period — overfits on short series |

This is the basis ThymeBoost's `'fourier'` seasonality estimator uses (default `fourier_order=10`
→ 20 parameters per period, which for `m=168` on a few years of hourly data is *generous*).

---

## 6. Prophet's decomposition

Taylor & Letham (2018). The best-engineered decomposition in practical use, because it makes three
business requirements first-class:

$$y(t) = g(t) + s(t) + h(t) + e(t)$$

| Term | What it is |
|---|---|
| $g(t)$ | Piecewise-linear trend over changepoints, with a `linear` or `logistic` growth prior |
| $s(t)$ | Fourier seasonality, period and order supplied |
| $h(t)$ | Holiday effects — indicator regressors, one per holiday per country |
| $e(t)$ | Residuals, assumed i.i.d. Gaussian |

The changepoint prior is the genuinely novel part: a spike-and-slab L1 penalty on the slope
changes, with a tunable prior scale. Many potential changepoints, most shrunk to zero.

**Strengths** — the closest thing to a decomposition that *learns where the structure changes*.
Fully Bayesian in the Stan implementation, so the uncertainty bands are posterior draws.

**Weaknesses — and the big one:**
- **The uncertainty bands are known to be badly calibrated.** They come from simulated residual
  trends, which assume future trend variance is proportional to historical trend variance. On a
  series with event-driven spikes — i.e. all 9-1-1 data — that assumption is badly wrong. If you
  need intervals, wrap the point forecast in conformal ([[Model Validation Strategies]] §6)
  rather than trusting `yhat_lower`/`yhat_upper`.
- The "flexible trend" will happily **absorb real signal** — a changepoint with a big enough prior
  scale can eat a genuine regime.
- Frequentist; slow; no multi-seasonality support beyond what the Fourier terms can carry.

---

## 7. Decomposition inside learning systems

Decomposition did not go away when deep learning arrived — it was absorbed, three different ways.

| Where | How | Note |
|---|---|---|
| **DLinear** 🔗 [arXiv:2205.13504](https://arxiv.org/abs/2205.13504) | Explicit moving-average decomposition into trend + seasonal, then **two separate linear layers**, summed | The decomposition is the *whole model*. See [[Linear Models for Forecasting]] |
| **Autoformer / FEDformer** | Series decomposition blocks with an autocorrelation-based / frequency-enhanced seasonal term | The original motivation: *"decomposition helps Transformers"* |
| **N-BEATS / N-HiTS** | Learned **basis** decomposition — trend and seasonality are expand as learned basis functions, not fixed filters | Genuinely *learned*, not supplied. See [[time-series-forecasting-models]] §4.4 |
| **Prophet** | Statistical changepoint prior + Fourier | §6 above |
| **ThymeBoost** | **Boosts over components** — the decomposition is the boosting base learner | See §8 |

### Why decomposition keeps working

Four reasons, and they hold independently of architecture:

1. **It is a strong inductive bias with essentially no cost.** The trend and seasonal patterns of
   most real series are close to low-dimensional and smooth. Saying so up front removes a lot of
   capacity that would otherwise be spent rediscovering it.
2. **It makes the model interpretable, and interpretability is a diagnostic.** When a forecast is
   wrong you can look at which component failed. Every deep forecaster throws that away.
3. **It regularises.** Splitting a hard problem into several easy ones is a form of structural
   regularisation, and it is why a linear model with a decomposition head matches far heavier
   architectures ([[Linear Models for Forecasting]] §4).
4. **It localises the failure.** Anomaly detection on residuals of a decomposition is the single
   most reliable classical detector there is — see [[Time Series Anomaly Detection]].

---

## 8. Decomposition as a boosting base learner

The idea that motivated [[ThymeBoost]], and the natural generalisation:

> Fit a **separate, possibly different** estimator for each component, sequentially, on residuals.
> Rather than one learner correcting the whole series, each round splits responsibility: trend
> first, then seasonality, then anything exogenous. Repeat until a penalized cost stops improving.

This is structurally the same family as Prophet — small, interpretable, component-wise, fitted by
penalized residual correction. Where it differs is that the components are *chosen per round from
a menu*, and the round count is chosen by a cost function rather than a prior.

| | Classical decomposition | Prophet | Boosted decomposition |
|---|---|---|---|
| Trend | Moving average or LOESS | Piecewise linear, sparse changepoints | Menu of ~23 estimators, chosen per round |
| Seasonality | Mean by phase, or Fourier | Fourier, period + order given | Classic / Fourier / naive, period cyclable per round |
| Exogenous | None | Holiday indicators | OLS / GLM / decision tree on the residual |
| Changepoints | None | Learned via L1 prior | Binary segmentation, one per round |
| Complexity control | You choose | Prior scale | AIC / AICc / BIC-family cost + early stopping |

**The payoffs** are real: components can be *scheduled* (fit a mean once to absorb the level, then
straight lines; alternate seasonal periods on and off), continuity at changepoints is an explicit
switch, and each block gets its own learning rate so a seasonal block can be deliberately
damped to leave signal for an exogenous one.

**The costs** are equally real: single-series only, additive only in practice, and the complexity
penalty can be silently understated (see [[ThymeBoost]] §2.4).

---

## 9. Assessment — when decomposition is the right tool

**Reach for it when**

- You need a **diagnostic** before modelling. `plot_components` is the first thing to run on any
  unfamiliar series.
- You need **interpretability** as a hard requirement — staffing conversations happen, and
  "weekly seasonality rose 8% after the March policy change" is a defensible sentence.
- The seasonal period and pattern are **stable and known**, and the horizon is short.
- You need **anomaly detection**, and residual thresholds on a decomposition will beat almost
  everything else you can build cheaply.
- You want a **strong, cheap benchmark** to check more complex models against.

**Reach past it when**

- The seasonal **shape or amplitude drifts**. Classical methods cannot follow it; you need learned
  seasonality (N-BEATS basis, a TSFM, or a GBDT on calendar features).
- There are **several non-nested seasonalities**. MSTL helps, but the fixed decomposition order
  is a constraint, not a solution.
- You need **calibrated intervals** and are not prepared to wrap the output.
- The **trend is non-linear or regime-shifting** and you want that handled honestly. Prophet and
  boosted decomposition both do; moving-average decomposition does not.
- You have **rich exogenous drivers**. A decomposition will happily consume their signal in the
  seasonal block and leave the regression nothing — the seasonal-vs-exogenous ordering problem.

## 10. Try it

- [ ] Decompose a Douglas County hourly series with **both** `seasonal_period=24` and `=168` and
      look at the two seasonal components side by side. This is the single most informative plot
      in the whole folder.
- [ ] Overlay three consecutive weeks of the detrended series at different levels — confirm the
      amplitude really is constant before committing to additive
- [ ] Turn `normalize_seasonality` on and off with a regression term present and watch the
      coefficients move
- [ ] Fit STL with `robust=True` against a series containing one known spike; confirm the seasonal
      term does not bend toward it
- [ ] Fit MSTL on `[24, 168]` vs `[24, 168, 8766]` and check whether the annual term earns its
      place
- [ ] Run classical decomposition on the seasonal-naive residual from
      [[Time Series Forecasting Baselines]] — anything left in the remainder is what naive missed
- [ ] Compare `mse` vs `mae` as `split_cost` in [[ThymeBoost]] on a series with 9-1-1 incident
      spikes; the spike-resistance of the changepoint search is the interesting part

## References

**Decomposition**

1. Cleveland, R.B., Cleveland, W.S., McRae, J.E. & Terpenning, I.J. (1990). STL: A seasonal-trend
   decomposition procedure based on loess. *Journal of Official Statistics* 6(1), 3–33.
2. Wang, X., Smith, N.A. & Hyndman, R.J. (2006). Characterizing multiple periodicities in
   non-stationary time series data. 🔗 https://otexts.com/fpp3/decomposition.html — MSTL
3. Hyndman, R.J. & Athanasopoulos, G. (2021). *Forecasting: Principles and Practice*, 3rd ed.
   Chapter 6. 🔗 https://otexts.com/fpp3/decomposition.html
4. Gómez, V. & Maravall, A.G. (1996). *Seasonal Adjustment with X-13ARIMA-SEATS.*
   🔗 https://www.seasonaladjustment.org/
5. Makarov, M. & Smith, A. (2002). Theta: a decomposition forecasting approach. *IJF* 18(4).

**Decomposition inside learning systems**

6. Zeng, A. et al. (2023). Are Transformers Effective for Time Series Forecasting? 🔗
   https://arxiv.org/abs/2205.13504 — DLinear
7. Oreshkin, B.N. et al. (2020). N-BEATS. 🔗 https://arxiv.org/abs/1905.10437 — learned basis
   decomposition
8. Challu, C. et al. (2023). N-HiTS. 🔗 https://arxiv.org/abs/2201.12886
9. Wu, H. et al. (2021). Autoformer. 🔗 https://arxiv.org/abs/2106.13008
10. Taylor, S.J. & Letham, B. (2018). Forecasting at scale. *The American Statistician* 72(1). 🔗
    https://peerj.com/articles/cs-143/

## Cross-links

- [[ThymeBoost]] — decomposition as a boosting base learner
- [[Gradient Boosting for Time Series]] — the other half of that idea
- [[Linear Models for Forecasting]] — DLinear, where decomposition is the whole model
- [[time-series-forecasting-models]] §2 — where this sits in the family taxonomy
- [[Time Series Forecasting Baselines]] — the $m=168$ argument
- [[Time Series Anomaly Detection]] — residual thresholds on a decomposition
- [[forecast-reconciliation]] — decomposing a hierarchy instead of a series
