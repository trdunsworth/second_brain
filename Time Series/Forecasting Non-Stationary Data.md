---
type: reference
status: active
tags:
  - time-series
  - forecasting
  - stationarity
  - statistics
  - diagnostics
  - machine-learning
created: 2026-10-19
aliases:
  - Non-Stationarity
  - Stationarity Testing
  - Unit Roots and Differencing
  - Difference-Stationary Series
---

# Forecasting Non-Stationary Data

Stationarity is not a property a series has or lacks — it is a **modelling decision about
which transform you hold constant while you forecast**. This note covers the tests, the
transformation ladder, the unit-root/structural-break confusion, and what each of these
costs the ML forecaster specifically.

> Written 2026-10-19. Stationarity previously existed in the vault only as scattered
> asides: the ADF caveat in [[time-series-forecasting-models]] §1, the expanding/sliding
> line in [[Model Validation Strategies]], and the R²-on-levels warning in
> [[time_series_evaluation_metrics_benchmarks]]. Nothing treated it on its own terms.

---

## 1. The operational question

Weak (covariance) stationarity: constant mean, constant variance, autocovariance that
depends only on lag distance. Strict stationarity (whole distribution invariant) is almost
never required and almost never checkable — work with the weak version.

The distinction that actually drives modelling choices:

| Type | What is wrong | Correct response |
|---|---|---|
| **Trend-stationary** | A deterministic trend over a stationary remainder | Detrend (regress out, or let the model carry the trend) — the series is I(0) around a function of time |
| **Difference-stationary** | The *level* is a random walk; differences are stationary | Difference — the series is I(1); detrending does not fix it, and inverting the wrong one has permanent consequences |

> **The question is never "is it stationary?" — it is "stationary after *what* transform,
> and is that transform forecastable at horizon `h`?"** A first difference of an I(1)
> series is stationary but destroys the level information the transform relied on; your
> forecast must then restore the level, and the restoration is where long-horizon error
> accumulates.

Hourly data adds a second axis: **variance** non-stationarity (level-dependent
variance — typical of counts) is a different problem from **mean** non-stationarity, and
is solved by a different move (a log or Box–Cox transform, not differencing).

---

## 2. The tests

| Test | Null hypothesis | Notes |
|---|---|---|
| **ADF** (Dickey & Fuller 1979) | Unit root (I(1)) | Low-powered; lag truncation affects the verdict |
| **Phillips–Perron** (1988) | Unit root | Non-parametric correction for heteroscedasticity — sensible for count data |
| **KPSS** (Kwiatkowski et al. 1992) | *Stationary* | Complementary null; designed to be run against ADF |
| **DF-GLS / ERS** (Elliott–Rothenberg–Stock 1996) | Unit root | Demeaned/detrended variant with better power |
| **Zivot–Andrews** (1992) | Unit root | With a single endogenous break — the right test when a break is suspected (see §4) |

> **Run ADF and KPSS together and require them to agree.** They have opposite nulls, so
> four outcomes exist: both say stationary, both say unit root, and two mixed cases that
> usually mean low power or short samples. A single test is a coin with a heavy edge.

**Tooling, for this vault:** `statsmodels` (`adfuller`, `kpss`) in Python; in R,
`feasts::unitroot_kpss()` / `unitroot_pp()` appear directly in the feature layer of
[[Feature Engineering for Time Series]] §2.5 — and remember the `period=168` warning
there, because a seasonal unit root at the weekly lag will masquerade as a non-seasonal
one if the period is wrong. Also `fable::ndiffs()` / `nsdiffs()` to pick `d` and `D`
mechanically.

> **⚠️ Seasonal unit roots are a real thing on hourly data.** Seasonality that walks
> (a seasonal pattern whose amplitude drifts) produces unit roots *at the seasonal lag*.
> ADF on the raw lags will not find these; you need seasonal differencing tests
> (`nsdiffs`, HEGY-style). On hourly PSAP counts, check the weekly lag, not just lag 1.

---

## 3. The transformation ladder

Applied in order, cheapest and most reversible first:

| Step | Fixes | Tool | Escalation |
|---|---|---|---|
| 1. **Box–Cox / log** | Variance drifting with the level | `stats.boxcox`, `np.log` | Choose λ from the data ([[Time Series Decomposition]] does this inside `mstl`) |
| 2. **Remove trend** | Deterministic drift | Differencing `d`, or a model that carries trend (drift naive, ETS with `trend`) | BSTS local-linear if the trend itself moves |
| 3. **Seasonal difference** `D, s` | A seasonal pattern that walks | `nsdiffs`, `D = 1, s = 24` or `168` | The seasonal-differencing trap in [[time-series-forecasting-models]] §1 — choose `D` by ACF at the seasonal lag, never by accepting an automatic result |
| 4. **Long-memory** | Deviations decaying slower than any ARMA | ARFIMA / fractional differencing | Niche; almost never the right call on a single bounded count series |

```python
from statsmodels.tsa.stattools import adfuller, kpss
from statsmodels.tsa.seasonal import MSTL

stl = MSTL(series, periods=[24, 168]).fit()
d_stationary = series.diff(1).dropna()          # removes level drift
ds_stationary = d_stationary.diff(168).dropna() # removes walking weekly pattern
```

$$\Delta y_t = y_t - y_{t-1}, \qquad \Delta_s y_t = y_t - y_{t-s}$$

> **Overdifferencing is its own disease.** Differencing an already-stationary series
> introduces an MA(1) component with $\theta = -1$ (non-invertible), inflates the
> fake negative autocorrelation at every short lag. If your ACF shows a large negative
> spike at lag 1, you probably differenced one time too many. This is why the
> tests in §2 come *before* the differences in §3, not after.

And the loop back: seasonal differences are not merely a pre-processing step — they can
enter either side of the model. As direct features they are a legitimate entry in the lag
matrix of [[Feature Engineering for Time Series]] §2.1, and on the linear side they are
the detrending device in [[Linear Models for Forecasting]].

---

## 4. Unit root or structural break? Two pathologies, one symptom

> **Perron (1989), *The Great Crash, the Oil Price Shock, and the Unit Root Hypothesis***
> found that most of the series Nelson & Plosser (1982) classified as difference-stationary
> (I(1)) are actually **trend-stationary around a single large break** (the 1929 crash,
> the 1973 oil shock). A breaking trend regressed on the wrong model yields a spurious
> unit root. The reverse is also true: a genuine unit root can hide behind a break.

**Consequence:** the test ordering matters. If a break is even plausible, a
break-robust test (Zivot–Andrews) or an explicit break search ([[Change-Point Detection]]
— PELT, binary segmentation, Bai–Perron) comes *before* concluding "this series needs
differencing."

**For the PSAP series this is not academic.** A jurisdiction boundary change, a new
dispatch protocol, or a county-wide policy shock is a **level shift**, not a unit root.
Modelling it as a unit root makes the shift permanent in your forecast forever; modelling
it as a break confines it to one historical regime. Prophet's changepoint prior,
[[ThymeBoost]] §2.3 and BSTS all handle this natively — see
[[State Space Models and Bayesian Structural Time Series]].

### The spurious-regression trap

Two independent random walks regressed on each other produce **arbitrarily high $t$
statistics and $R^2$** (Granger & Newbold 1974). In a forecasting workflow the same
mechanism shows up in three places:

1. **Evaluation**: $R^2$ on levels of a drifting series is inflated — this is already
   flagged in [[time_series_evaluation_metrics_benchmarks]], which prescribes applying
   $R^2$ to first differences. Same literature, same reason.
2. **Features**: a raw lag or rolling window of a trending series carries more "signal"
   in-sample than it will out-of-sample. Differenced or *deviation-from-recent-level*
   features generalise; absolute-level features do not.
3. **Model comparison**: if both candidate models are trained on levels and one quietly
   differences, metric deltas may rank the transformation, not the model.

> **Said plainly:** in-sample fit on a non-stationary series is close to
> meaningless for model selection. The right comparisons are out-of-sample and
> rolling-origin — see [[Model Validation Strategies]] §3.

---

## 5. What non-stationarity costs the ML pipeline

| Model family | What breaks | The standard fix |
|---|---|---|
| **GBDT and any tree** | No extrapolation past the training range. A drifting level means the tree flatlines | Difference the target, or supply recent level explicitly (rolling mean) so the tree can re-derive it |
| **Linear (DLinear / NLinear)** | None — this is where linear models shine | NLinear's subtract-last-value is exactly $\Delta_1$ differencing; see [[Linear Models for Forecasting]] §2 |
| **Deep nets with RevIN** | Removes scale shift, not level drift | RevIN ⊗ differencing — they solve different shifts; see [[Distribution Shift and Normalization]] §2 and §6 |
| **Global panel models** | Cross-series level imbalance treated as *signal* | Normalise within-series (see [[Feature Engineering for Time Series]] §4) — level differences are a nuisance parameter, not a feature |
| **Recursive multi-step** | Error compounding at long horizons compounds *non-stationarity*; each step re-noises the level | Re-fit or re-difference at each origin; see [[Model Validation Strategies]] §2 |
| **Expanding-window backtests** | Assume a stationary process; late data points get outsized weight | Sliding window / rolling-origin — see [[Model Validation Strategies]] |

> **The unified framing:** every non-stationarity you fail to model reappears downstream
> as (a) an in-sample fit that out-of-sample does not reproduce, (b) an interval that is
> calibrated on the drifting regime but consumed on a different one, or (c) a forecast
> whose **long-horizon level is the previous level** — because trees cannot extrapolate
> and many models hard-code a stationary prior. If you are going to ignore stationarity,
> pick the model that already embeds the transform (linear + RevIN, differenced ARIMA),
> not one that ignores it by construction.

---

## 6. Decision protocol (PSAP series)

1. **Look before you test.** Level plot, STL residuals, ACF at 24 and 168 — see
   [[Time Series EDA and Data Quality]]. Most non-stationarity on hourly count data is
   visible before any statistic.
2. **Box–Cox for variance first** (λ near 0 ⇒ log). Count data almost always wants it.
3. **ADF + KPSS, plus `nsdiffs` with `period = 168`** for the seasonal unit root.
4. **If tests disagree — suspect a break.** Run [[Change-Point Detection]] before
   differencing further.
5. **Decide who carries the transform.** Either the pipeline (difference as a
   pre-transform; forecast summed back) or the model (ETS trend / drift naive / BSTS).
   Do not do both — that is overdifferencing.
6. **Validate with sliding (not expanding) windows**, and confirm that the metric gaps
   you saw in-sample close out-of-sample. See [[Model Validation Strategies]].

> **One sentence version:** stabilise variance with a transform, stabilise level with a
> difference or a model that carries drift, stabilise nothing twice, and let the
> backtest decide whether the transform survived at horizon $h$.

---

## Try it

- [ ] Run `adfuller` + `kpss` on the raw hourly PSAP volume, then on the log, then on
      `log.diff(1)` — record where each first turns stationary
- [ ] Run `feasts::nsdiffs(period = 168)` logic in Python: test the seasonal lag
      separately, not just lag 1
- [ ] Verify `NLinear` on the series equals a differenced linear model — the connection
      between instance normalisation and differencing made empirical
- [ ] Deliberately overdifference: fit ARIMA with `d = 1` on an already-differenced
      series and observe the lag-1 ACF spike — build the intuition once, cheaply
- [ ] Inject a synthetic level shift and confirm that Zivot–Andrews / PELT finds it but
      plain ADF installs it as a unit root
- [ ] Compare an expanding-window and sliding-window backtest on the same model with a
      real policy change in the timeline — diverge on the far horizon

## References

1. Granger, C.W.J. & Newbold, P. (1974). Spurious regressions in econometrics. *Journal of
   Econometrics* 2(2), 111–120. 🔗 https://doi.org/10.1016/0304-4076(74)90034-7
   ⭐ the original spurious-regression demonstration
2. Box, G.E.P. & Cox, D.R. (1964). An analysis of transformations. *JRSS-B* 26(2),
   211–252. 🔗 https://doi.org/10.1111/j.2517-6161.1964.tb00553.x
3. Dickey, D.A. & Fuller, W.A. (1979). Distribution of the estimators for autoregressive
   time series with a unit root. *JASA* 74(366), 427–431.
4. Phillips, P.C.B. & Perron, P. (1988). Testing for a unit root in time series
   regression. *Biometrika* 75(2), 335–346. 🔗 https://doi.org/10.1093/biomet/75.2.335
5. Kwiatkowski, D., Phillips, P.C.B., Schmidt, P. & Shin, Y. (1992). Testing the null
   hypothesis of stationarity against the alternative of a unit root. *Journal of
   Econometrics* 54(1–3), 159–178. 🔗 https://doi.org/10.1016/0304-4076(92)90103-Y
   ⭐ the KPSS complement to ADF
6. Nelson, C.R. & Plosser, C.I. (1982). Trends and random walks in macroeconomic time
   series. *Journal of Monetary Economics* 10(2), 139–162. 🔗
   https://doi.org/10.1016/0304-3932(82)90012-5
7. Perron, P. (1989). The Great Crash, the Oil Price Shock, and the Unit Root Hypothesis.
   *Econometrica* 57(6), 1361–1401. 🔗 https://doi.org/10.2307/1913707
   ⭐ the break-masquerading-as-unit-root classic
8. Zivot, E. & Andrews, D.W.K. (1992). Further evidence on the Great Crash, the
   Oil-Price Shock, and the Unit-Root Hypothesis. *JBES* 10(3), 251–270. 🔗
   https://www.jstor.org/stable/1391541
9. Hyndman, R.J. & Athanasopoulos, G. (2021). *Forecasting: Principles and Practice*,
   3rd ed. — §Stationarity and Differencing, 🔗 https://otexts.com/fpp3/stationarity.html
   · §Backtesting (residual and backtest discipline)

## Cross-links

- [[Feature Engineering for Time Series]] §2.5 — `unitroot_kpss` / `unitroot_pp` inside
  the feature layer; §4 within-series scaling for the panel level problem
- [[Model Validation Strategies]] — expanding vs sliding windows; where non-stationarity
  silently rewards you in-sample
- [[Change-Point Detection]] — the break-detection machinery §4 borrows; the "break, not
  unit root" decision is its §6
- [[Distribution Shift and Normalization]] — RevIN as the instance-level cousin of
  differencing; §6 on the look-back-window leak
- [[Linear Models for Forecasting]] — NLinear's subtract-last-value is d=1 differencing
  in disguise
- [[Time Series Decomposition]] — STL/MSTL visual diagnosis of trend and seasonality
  before any test
- [[Time Series EDA and Data Quality]] — the pre-test diagnostics this protocol starts from
- [[time-series-forecasting-models]] §1 — where the ADF caveat lives; seasonal-differencing trap
- [[Gradient Boosting for Time Series]] — the tree extrapolation problem §5 leans on
- [[time_series_evaluation_metrics_benchmarks]] — R² on levels, and why it lies here
- [[Time Series Forecasting Baselines]] — drift naive and seasonal naive as the
  difference-stationary handles
- [[State Space Models and Bayesian Structural Time Series]] — models where a non-stationary
  level is a *state*, not a defect
- [[Feature Importance and Explainability]] — attribution ranks what a model used on one reference
  set; a drifting or collinear feature matrix makes those ranks travel badly
- [[Hierarchical and Mixed-Effects Models for Forecasting]] — partial pooling as a
  level-drift absorber across series
- [[Time Series Reading and Practice Hub]] — the entry point for the folder
- [[Prophet and NeuralProphet]] §3 — the Rosenblatt z-transform: a normal-score transform that stationarises before Prophet fits
