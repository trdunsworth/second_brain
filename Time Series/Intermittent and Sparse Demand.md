---
type: reference
status: active
tags:
  - time-series
  - forecasting
  - intermittent-demand
  - sparse-data
  - counts
  - croston
created: 2026-10-14
aliases:
  - Croston
  - Intermittent Demand
  - Sparse Time Series
  - Syntetos-Boylan
  - ADIDA
---

# Intermittent and Sparse Demand

Forecasting series where **most periods have zero demand**. A large fraction of the
forecasting literature — and a large fraction of your interest — sits here.

> **Directly relevant to hourly 9-1-1 counts.** Hourly call volume for a small jurisdiction
> is frequently zero, and the intermittency problem gets *harder* as the time bucket gets
> finer. Daily counts may be dense while hourly counts are sparse — the same series can be
> one and then the other. This is the note for the regime where
> `mean ≈ 0` and `MASE` denominators get unstable.

---

## 1. What makes it hard

| Issue | Consequence |
|---|---|
| **Zeros dominate** | Standard losses are dominated by the trivial forecast "predict 0 everywhere" |
| **Demand is lumpy** | Many zeros punctuated by occasional large values — not smooth, not stationary |
| **Frequency is not the series** | The thing to forecast is *when the next event occurs* and *how much* |
| **Observed frequency ≠ true frequency** | A month of only nonzero periods misleads naive models |
| **ADIDA over-smooths** | Aggregating to "average demand interval" destroys the timing signal |

---

## 2. The Syntetos–Boylan taxonomy — the core diagnostic

Syntetos, A.A. & Boylan, J.E. (2005). *On the categorization of demand patterns.*
**Journal of the Operational Research Society** 56(5), 495–503. 🔗
[doi:10.1057/palgrave.jors.2601840]

Classify a series by two statistics:

```
ADI  = Average Demand Interval  =  n_periods / n_nonzero_periods
CV² = Squared Coefficient of Variation of non-zero demand
```

| | CV² < 0.49 | CV² ≥ 0.49 |
|---|---|---|
| **ADI < 1.32** | **Smooth** | **Erratic** |
| **ADI ≥ 1.32** | **Intermittent** | **Lumpy** |

The payoff is not academic — **the right method depends on the cell**:

| Class | Recommended | Typical method |
|---|---|---|
| Smooth | Standard forecasting | ETS, ARIMA |
| Erratic | Demand *size* is unpredictable | Naive / simple average; Croston's variants |
| Intermittent | Interval matters, size is regular | **Croston** |
| Lumpy | Both are irregular | **Croston**, **TSB**, ADIDA |

> ### ⚠️ The method-ranking myth, and what is actually true
>
> The **M5 competition** (Walmart, ~30,490 series, ~50,000 SKUs) tested the widespread claim
> that Croston is the right answer for intermittent series. The result overturned it:
>
> **Croston's method was not robust. No single method dominated. And the simple ensemble —
> averaging the naive, seasonal naive and Croston — was the most accurate single submission
> in the intermittent-demand category.**
>
> Reference: Januschowski, T. et al. (2022), *Forecasting with trees* / the M5 analysis,
> IJF 38(4). The M5 dataset and results are 🔗 https://www.kaggle.com/c/m5-forecasting-accuracy
> and the category breakdown is reproduced in the AutoGluon-TimeSeries documentation.
>
> **The takeaway is the M4/M5 pattern again:** *combining beats choosing*. An intermittent
> series deserves an ensemble at least as much as a smooth one does.

---

## 3. The method family

### Croston (1972)

Forecasts the **inter-demand interval** and the **demand size** separately, then combines:

```
x̂ = (demand size) / (interval)
```

Three variants differ in how the interval is updated:

| Variant | Update rule | Note |
|---|---|---|
| **Croston's original** | Fixed α for both | The baseline |
| **Croston's smoothing / SBA** | Separate α for size and interval | Usually better; `statsforecast` default |
| **Croston-M / TSB** 🔗 [Teunter, R.H., Syntetos, A.A. & Babai, M.Z. (2011), *IJF* 27(1)](https://doi.org/10.1016/j.ijforecast.2011.01.004) | **Demands** update every period; **interval** updates only on a demand | ⭐ The interval update is the key innovation — it detects when an item has *stopped* selling |

> **TSB is the one to reach for.** Croston's symmetric smoothing responds too slowly to a
> series going dormant. TSB's asymmetric update catches it, which matters for series with
> genuine lifecycle ends.

### ADIDA — Aggregate-Disaggregate Intermittent Demand

Smooths by aggregating, then disaggregates back down. Good when intermittency is
time-varying.
`ADIDA` is in both `statsforecast` and AutoGluon.

### IMAPA — Intermittent Multiple Aggregation Prediction Arena

Randomly picks an aggregation window and smooths. Handles multiple seasonality in the
intermittent regime. Also in `statsforecast` and AutoGluon.

### Available in the Nixtlaverse

`statsforecast.models` exposes **`Croston`, `CrostonSBA`, `CrostonOptimized`, `ADIDA`,
`IMAPA`, `TSB`** with vectorised compiled implementations, and AutoGluon–TimeSeries builds its
whole intermittent-demand model family on top of them. So the whole family is one import
away and runs at panel scale — no excuse for hand-rolling.

> ⚠️ **TimeCopilot does *not* cover this family.** Its hub
> ([model hub](https://timecopilot.dev/model-hub/), checked 2026-10-14) carries `CrostonClassic`,
> `ADIDA`, `IMAPA`, `HistoricAverage` and `ZeroModel` — but **no `CrostonSBA`, no
> `CrostonOptimized`, and no `TSB`**. So the TSB recommendation below cannot be satisfied
> through the TimeCopilot Forecaster. Go to `statsforecast` directly, and see
> [[TimeCopilot]] for the full hub listing.

---

## 4. ⚠️ Metric instability — the part that bites hardest

This is where [[time_series_evaluation_metrics_benchmarks]] and
[[Time Series Forecasting Baselines]] stop being abstract.

```
MASE = MAE_model / MAE_naive_seasonal
```

When the denominator is computed on a sparse series:

- The naive MAE is small and unstable
- MASE explodes, is undefined when the naive error is 0 (a fully-zero training period), and
  is **wildly sensitive to which window you computed it over**

**MAPE and sMAPE are undefined or explosive when `y = 0`**, which for sparse hourly data is
the *typical* case, not an edge case. Any metric needing a divide-by-zero guard is unusable.

Kolassa, S. (2016). *Evaluating predictive count data distributions in retail sales
forecasting.* **IJF** 32(3), 788–803. 🔗
[doi:10.1016/j.ijforecast.2015.12.004](https://doi.org/10.1016/j.ijforecast.2015.12.004)
— argues that when the object of study is a **predictive count distribution**, mean-based
scaling against a point-forecast baseline is the wrong anchor, and proposes scaling against
the count distribution's own dispersion.

### Recommended metric protocol for sparse series

1. **Never report MAPE / sMAPE.** Use MAE and MASE only, with the denominator guarded
2. **State the ADI and CV²** — the metrics are not interpretable without them
3. **Report the zero rate** alongside every result
4. **For counts, consider Negative Binomial likelihood** rather than Gaussian — variance
   scales with the mean, and NB gets this right by construction
   (see [[Generative and Probabilistic Forecasting]] §6)
5. **Report CRPS or pinball loss** for the distribution, not just point accuracy

---

## 5. Why this is not the right frame for 9-1-1

> **Be careful — intermittent-demand methods may be the wrong tool here.**
>
> The Croston/TSB family assumes demand arrives as **isolated events separated by silent
> periods**. 9-1-1 call volume is usually better described as a **low-count dense process**:
> small values most hours, occasional spikes driven by incidents. The ADI for a busy
> jurisdiction is close to 1.0 — every hour has a nonzero count — which puts it in the
> **smooth** or **erratic** cell, not the **intermittent** one.
>
> **The right diagnostic is to compute ADI and CV² on your actual hourly series before
> choosing a family.** Do not assume intermittency because the counts are small. Small counts
> and intermittency are different problems:
>
> | | Small counts | Intermittency |
> |---|---|---|
> | Example | hourly PSAP call volume | a slow-moving spare part |
> | Structure | dense but small | sparse and lumpy |
> | Right tool | Negative Binomial, quantile models, conformal | Croston/TSB/ADIDA |
> | Metric risk | MAPE explodes near 0 | MASE denominator unstable |

The overlap region — a small jurisdiction's 02:00–04:00 hours — may genuinely be
intermittent. Check it.

---

## 6. Quick diagnosis

```python
import numpy as np

def intermittency_diagnosis(y: np.ndarray):
    """Syntetos-Boylan (2005) classification. y must be non-negative."""
    y = np.asarray(y, dtype=float)
    n = len(y)
    nz = y[y > 0]
    n_nonzero = len(nz)
    zero_rate = 1 - n_nonzero / n

    adi = n / n_nonzero if n_nonzero else np.inf          # ADI
    cv2 = (nz.std(ddof=1) / nz.mean()) ** 2 if n_nonzero > 1 else np.inf  # CV² of nonzeros

    label = (
        "SMOOTH"      if adi < 1.32 and cv2 < 0.49 else
        "ERRATIC"     if adi < 1.32 and cv2 >= 0.49 else
        "INTERMITTENT" if adi >= 1.32 and cv2 < 0.49 else
        "LUMPY"
    )
    return {"adi": adi, "cv2": cv2, "zero_rate": zero_rate,
            "mean": y.mean(), "label": label}
```

---

## 7. Try it

- [ ] Load the Douglas County hourly series (when acquired); run the diagnosis **per
      hour-of-week**. Sunday 03:00 and Friday 20:00 will land in different cells
- [ ] Compare `ADI` at hourly vs daily aggregation on the same series — does it cross the
      1.32 boundary? If so, the two aggregations are different problems
- [ ] Reproduce the M5 finding on Monash: simple average of naive + seasonal naive + Croston
      vs Croston alone
- [ ] Compute MASE with the denominator over several training windows and show the spread
- [ ] Fit a Negative Binomial model and compare CRPS against a Gaussian quantile model

## References

1. Croston, J.D. (1972). Forecasting and stock control for intermittent demands. *Operational Research Quarterly* 23(3), 289–303. 🔗 https://doi.org/10.2307/3007885
2. Syntetos, A.A. & Boylan, J.E. (2005). On the categorization of demand patterns. *JORS* 56(5), 495–503. 🔗 https://doi.org/10.1057/palgrave.jors.2601840
3. Teunter, R.H., Syntetos, A.A. & Babai, M.Z. (2011). Intermittent demand: linking forecasting to inventory obsolescence. *IJF* 27(1). 🔗 https://doi.org/10.1016/j.ijforecast.2011.01.004
4. Kolassa, S. (2016). Evaluating predictive count data distributions. *IJF* 32(3), 788–803. 🔗 https://doi.org/10.1016/j.ijforecast.2015.12.004
5. Januschowski, T. et al. (2022). M5 accuracy competition results and analysis. *IJF* 38(4). 🔗 https://www.kaggle.com/c/m5-forecasting-accuracy
6. Hyndman, R.J. & Koehler, A.B. (2006). Another look at measures of forecast accuracy. 🔗 https://robjhyndman.com/papers/mase.pdf
7. Makridakis, S. et al. (2020). The M5 Competition. 🔗 https://doi.org/10.1016/j.ijforecast.2019.11.001
8. Godahewa, R. et al. (2021). Monash Time Series Forecasting Archive. 🔗 https://arxiv.org/abs/2105.06643

## Cross-links

- [[time_series_evaluation_metrics_benchmarks]]
- [[Time Series Forecasting Baselines]]
- [[Generative and Probabilistic Forecasting]]
- [[Time Series Anomaly Detection]]
- [[Nixtlaverse]]
- [[Practice 05 — Intermittency, Counts and Anomaly Detection]]
- [[168-Point Forecast Comparison - Discrete vs Continuous]]
- [[resources]]
