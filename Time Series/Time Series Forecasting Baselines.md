---
title: Time Series Forecasting Baselines
tags:
  - time-series
  - forecasting
  - baselines
  - benchmarking
  - evaluation
  - mase
date_created: 2026-10-13
aliases:
  - Forecasting Baselines
  - Baseline Models
  - Benchmark Baselines
---

# Time Series Forecasting Baselines

> Created to resolve the dangling link in [[time_series_evaluation_metrics_benchmarks]] §6, which carries a four-item stub. This is the full treatment.
>
> **The framing that matters:** a baseline is not a constant you look up. It is a **design decision you make and defend**, and because scaled metrics like MASE are *ratios against a baseline*, the choice silently changes your headline number even when the model is untouched.

## 1. What a baseline is actually for

Three distinct jobs, frequently conflated:

| Job | What it does | Failure mode if skipped |
|---|---|---|
| **Floor** | Defines "better than nothing" | You report raw RMSE and nobody can interpret it |
| **Scale** | Supplies the denominator for MASE / RMSSE / OWA | Scaled metrics become incomparable across series |
| **Reference distribution** | The naive forecast generates a predictive distribution for calibration | You cannot claim calibrated intervals |

> **The point that catches people:** because MASE is `MAE_model / MAE_baseline`, the baseline is *inside the measurement instrument*. Swapping it can move a reported result by tens of percent without changing a single model. Treat baseline selection as part of the experimental design, not as boilerplate.

---

## 2. The taxonomy

| Method | Formula | Implicit assumption |
|---|---|---|
| **Naive** | $\hat{y}_{t+h} = y_t$ | Pure random walk; no trend, no seasonality |
| **Seasonal naive** | $\hat{y}_{t+h} = y_{t+h-m}$ | Seasonality of period `m`, no trend |
| **Drift** | $\hat{y}_{t+h} = y_t + h\left(\dfrac{y_t - y_1}{t-1}\right)$ | Linear trend persists |
| **Mean** | $\hat{y}_{t+h} = \frac{1}{t}\sum_{i=1}^{t} y_i$ | Stationary, structureless |
| **Seasonal mean** (climatology) | $\hat{y}_{t+h} = \bar{y}_{t+h-m}$ | Stationary *within* season |
| **Theta** | SES applied to deseasonalised series + drift | Trend + seasonality, additive |
| **Simple exponential smoothing** | $\hat{y}_{t+1} = \alpha y_t + (1-\alpha)\hat{y}_t$ | Local level |

🔗 FPP3 §5.1 — the textbook treatment: https://otexts.com/fpp3/simple-methods.html

> **⚠️ SES and Theta are models, not naive benchmarks.** They appear in the "standard baselines" list in some tooling for convenience, but they require estimated parameters. Report them separately from the zero-parameter benchmarks (naive / seasonal naive / drift / mean) — the two groups answer different questions, and mixing them makes a "beats naive" claim ambiguous.

---

## 3. Four baseline choices you must make explicitly

This is the section that separates a defensible study from a careless one.

### 3.1 Which seasonal period `m`?

**This is the single biggest lever in hourly 9-1-1 work.**

| `m` | Meaning | Strength as a benchmark |
|---|---|---|
| `24` | Same hour yesterday | Weak — ignores day-of-week |
| `168` | Same hour last week | Strong — captures both diurnal and weekly cycles |
| `8766` | Same hour last year | Strong but needs ≥2 years of history and breaks at seasonal boundaries |

A paper that reports "beats seasonal naive" without stating `m` has told you nothing. Worse: **choosing a weak baseline inflates your apparent skill.** For 168-hour-ahead hourly 9-1-1 volume, `m = 24` is close to indefensible as the sole benchmark.

### 3.2 Which benchmark method?

No single baseline transfers across datasets. See §6.

### 3.3 Where the denominator is computed

For MASE the naive MAE **must be computed on the training set only** (Hyndman & Koehler, 2006). Computing it across the full series leaks test information into the metric itself - a quiet version of the leakage problem in [[Model Validation Strategies]] §1.

### 3.4 Which metric family?

MASE (MAE-based), RMSSE (MSE-based), and relative RMSE (Theil's U) weight errors differently. RMSSE penalises peak misses harder; MASE is more robust to outliers. For **capacity decisions** — where a missed peak is far more costly than a wasted quiet hour — that difference is decision-relevant, not academic.

---

## 4. Scaled metrics inherit the baseline's weaknesses

```
MASE =  mean| y_t − ŷ_t |  ÷  mean| y_t − y_{t−m} |    (denominator: training data, in-sample)
```

MASE was proposed precisely because percentage errors are degenerate — MAPE explodes near zero and is undefined at zero, which is routine for hourly 9-1-1 volume. Hyndman & Koehler (2006) 🔗 https://robjhyndman.com/papers/mase.pdf demonstrated this and recommended MASE as the standard. It is finite and scale-free, which is exactly what it was designed to be.

But the denominator is a **naive forecast error**, and that has a consequence people miss:

> ### ⚠️ If your baseline fails, your scaled metric inherits the failure
>
> Suppose the seasonal naive baseline fails specifically during incident-driven peaks (weather, festivals, outages) because it has no exogenous information. Then:
>
> - MASE's denominator is **large**, because it absorbs those peak errors
> - Every model scores **artificially well**, including models that also fail at peaks
> - A model that *correctly* predicts an incident peak and *errs* by 50 calls looks **worse** than one that ignores the incident entirely
>
> **You are rewarded for being wrong in the same way your baseline is wrong.** This is not hypothetical — it is the direct consequence of the MASE denominator, and it applies to RMSSE and every relative metric of the same shape.

**Implication for the PSAP work.** A seasonal-naive-anchored MASE is an actively misleading metric for staffing, because the thing that matters operationally is peak-hour accuracy, which is precisely where the baseline is weakest. Report aggregate MASE **and** peak-conditional error separately. See §8.

### 4.1 The count-specific critique

Kolassa (2016), *Evaluating predictive count data distributions in retail sales forecasting*, 🔗 https://doi.org/10.1016/j.ijforecast.2015.12.004

Argues that when the object of study is a **predictive count distribution**, mean-based scaling against a point-forecast baseline is the wrong anchor, and proposes a scale anchored to the count distribution's own dispersion. Also notes that any metric requiring a divide-by-zero guard is undefined for a non-trivial fraction of hourly PSAP cells.

> Relevant because hourly call volume is counts, frequently small, frequently zero — precisely the regime Kolassa addresses.

---

## 5. Multi-seasonality: when one baseline isn't enough

Hourly data carries **three** seasonal periods simultaneously: daily (24), weekly (168), annual (8766). A single seasonal naive captures exactly one.

| Approach | How |
|---|---|
| **MSTL** | Decompose into daily → weekly → annual residuals, forecast each, recombine |
| **TBATS** | Multiple seasonal periods via trigonometric + Box-Cox + ARMA |
| **Hour-of-week baseline** | Custom: the mean for *that specific hour of that specific day* over a trailing window. Equivalent to 168 separate seasonal-naive series |

> The **hour-of-week baseline** is worth constructing explicitly for the 168-point project: it is the natural classical counterpart to the "168 discrete models" arm, and it makes the discrete-vs-continuous comparison sharper by giving both a shared, information-matched reference.

---

## 6. Benchmark selection is itself a research problem

Montero-Manso & Hyndman (2021), *Attributes that define forecasting benchmarks*, **IJF** 37(3), 1122–1137.
🔗 https://arxiv.org/abs/2003.07823

Benchelines vary across **four** attributes:

| Attribute | Meaning |
|---|---|
| **Findability** | Is the best method on this dataset among the simplest? |
| **Stability** | Does the winning method change as you move through the dataset? |
| **Robustness** | Does the ranking survive a method being removed? |
| **Cost** | Is the best method also cheap? |

Empirical findings that should change how you design the comparison:

- **No single benchmark is best across datasets.** Benchmarks that win on one series often lose on another; average performance hides which method wins where.
- **Findability matters more in small samples** — with limited data the simple method is more often the winner.
- **Robustness (leave-one-out) matters more with large samples**: removing a single method can reorder the ranking.
- In the M4 competition, **the combination of all submitted methods beat every individual method**, and robustness turned out to be a better guide than average accuracy.

> **Direct implication for [[168-Point Forecast Comparison - Discrete vs Continuous]]:** do **not** assume the M4 champion (Theta) or the conventional seasonal naive is the right benchmark for hourly 9-1-1 counts. Report the full ranking against **at least three** baselines and state which attribute you are optimising for. If your 168 discrete models beat only the `m=24` seasonal naive, that is a weak result, not a finding.

---

## 7. Is a baseline comparison significant?

Comparing two models on average error is not a significance test. The correct machinery — Diebold-Mariano, the Harvey-Leybourne-Newbold small-sample correction, Clark-West for nested models, and the multiple-comparison corrections that become essential at 168-way comparisons - is set out in [[Model Validation Strategies]] §4.

Short version: **do not write "beats naive" without a test.** With overlapping 168-hour forecasts the naive standard errors are badly anti-conservative.

---

## 8. What this means for the 9-1-1 / staffing work

The empirical finding driving this project is that **naive methods fail in every flavour to stochastic factors** (weather, incidents, events). Taken with §4, that has a hard consequence:

```
If the baseline fails at peaks, and your metric is anchored to that baseline,
then your metric will reward models for failing at peaks the same way.
```

### Recommended baseline panel

| Baseline | `m` / form | Purpose |
|---|---|---|
| Seasonal naive | `m = 168` | The honest minimum bar for hourly volume |
| Hour-of-week mean | trailing window | Captures level drift the naive ignores |
| Seasonal naive | `m = 24` | Included **only** to quantify how weak `m=24` is |
| Theta | — | Multi-seasonality-aware classical benchmark |
| **Ensemble of the above** | simple average | Hard to beat; M4's most robust finding |

### Recommended reporting

1. Aggregate MASE / RMSSE over all 168 points
2. **Peak-conditional error separately** — restrict to the top decile of realised volume, or to hours flagged as incidents
3. The baseline's own peak-conditional error, alongside yours — so the reader sees the shared failure
4. Significance test of each model vs. the strongest baseline, with HLN correction

> Point 3 is the honest presentation. Reporting "our model MASE 0.85" without showing the baseline also fails at peaks invites the reader to conclude the model handles incidents — which it demonstrably does not.

---

## 9. Honest gaps

| Item | Status |
|---|---|
| **A universally correct baseline for PSAP volume** | Does not exist. This is why §8 recommends a panel rather than a single choice |
| **Kolassa's count-based scaling** | Published 2016; adoption in mainstream libraries is limited. May need implementing yourself |
| **Hour-of-week baseline window length** | No principled rule. It is itself a tunable — and tuning it on the test set is leakage |
| **Which metric a staffing study *should* optimise** | Genuinely unsettled; see [[Staffing_Forecasting_Experiment]] — the choice is partly a business-risk decision, not a statistical one |

---

## References

**Core**
1. Hyndman, R.J. & Koehler, A.B. (2006). Another look at measures of forecast accuracy. *International Journal of Forecasting* 22(4), 679–688. 🔗 https://robjhyndman.com/papers/mase.pdf — the MASE paper; also the argument that M3/M4-era metrics are degenerate
2. Hyndman, R.J. & Athanasopoulos, G. (2021). *Forecasting: Principles and Practice*, 3rd ed., §5.1. 🔗 https://otexts.com/fpp3/simple-methods.html
3. Hyndman, R.J. (2020). *Measuring forecast accuracy*. 🔗 https://otexts.com/fpp3/accuracy.html

**Benchmark selection**
4. Montero-Manso, P. & Hyndman, R.J. (2021). Attributes that define forecasting benchmarks. *International Journal of Forecasting* 37(3), 1122–1137. 🔗 https://arxiv.org/abs/2003.07823
5. Makridakis, S., Spiliotis, E. & Assimakopoulos, V. (2020). The M4 Competition: 100,000 time series and 61 forecasting methods. *International Journal of Forecasting* 36(1), 54–74. 🔗 https://doi.org/10.1016/j.ijforecast.2019.02.001

**Counts and multi-seasonality**
6. Kolassa, S. (2016). Evaluating predictive count data distributions in retail sales forecasting. *International Journal of Forecasting* 32(3), 788–803. 🔗 https://doi.org/10.1016/j.ijforecast.2015.12.004
7. Wang, X., Smith, N.A. & Hyndman, R.J. (2006). Characterizing multiple periodicities in non-stationary time series data. 🔗 https://otexts.com/fpp3/decomposition.html — MSTL

**Testing** — see [[Model Validation Strategies]]
8. Diebold, F.X. & Mariano, R.S. (1995). Comparing predictive accuracy. *Journal of Business & Economic Statistics* 13(3), 253–263.
9. Harvey, D., Leybourne, S. & Newbold, P. (1997). Testing the equality of prediction mean squared errors. *International Journal of Forecasting* 13(2), 281–291. 🔗 https://doi.org/10.1016/S0169-2070(96)00719-4

## Status

- [x] What baselines are for — three distinct jobs
- [x] Full taxonomy, with the models/naive-benchmarks distinction made explicit
- [x] The four baseline choices, with `m` foregrounded for hourly data
- [x] How scaled metrics inherit baseline weaknesses; the PSAP consequence
- [x] Multi-seasonality and the hour-of-week baseline
- [x] Benchmark selection as a research problem; M4 robustness findings
- [x] Recommended baseline panel and reporting format for the PSAP project
- [ ] Empirical: construct the hour-of-week baseline and measure how much weaker `m=24` actually is

## Cross-links

- [[time_series_evaluation_metrics_benchmarks]] — the metrics this baseline choice feeds into
- [[Model Validation Strategies]] — testing whether a baseline was actually beaten
- [[time-series-forecasting-models]] — the models being benchmarked
- [[forecast-reconciliation]] — bottom-up *is* a baseline arm, and often a strong one
- [[168-Point Forecast Comparison - Discrete vs Continuous]] — needs this panel
- [[Staffing_Forecasting_Experiment]] — the application