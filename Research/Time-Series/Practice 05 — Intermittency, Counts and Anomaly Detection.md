---
type: practice
status: active
tags:
  - time-series
  - practice
  - intermittent-demand
  - counts
  - anomaly-detection
  - negative-binomial
created: 2026-10-14
aliases:
  - Practice 05
  - Intermittency Practice
  - Anomaly Detection Practice
  - Counts Practice
---
---

# Practice 05 — Intermittency, Counts and Anomaly Detection

**Goal:** diagnose whether your data is actually intermittent, choose the right count
model, and build an anomaly detector whose alarm burden is survivable in production.

> **Read [[Intermittent and Sparse Demand]] §5 first.** Small counts and intermittency are
> *different problems*, and 9-1-1 hourly volume is usually the former. This practice
> establishes which one you have before choosing anything.

---

## Setup

```bash
pip install statsforecast neuralforecast pytorch-lightning numpy pandas matplotlib
```

---

## Step 1 — Diagnose before you model

```python
import numpy as np, pandas as pd

def intermittency_diagnosis(y):
    """Syntetos-Boylan (2005). y: 1-D array of non-negative values."""
    y = np.asarray(y, dtype=float)
    nz = y[y > 0]
    n_nonzero = len(nz)

    adi = len(y) / n_nonzero if n_nonzero else np.inf
    cv2 = ((nz.std(ddof=1) / nz.mean()) ** 2) if n_nonzero > 1 else np.inf

    label = ("SMOOTH"      if adi < 1.32 and cv2 < 0.49 else
             "ERRATIC"     if adi < 1.32 and cv2 >= 0.49 else
             "INTERMITTENT" if adi >= 1.32 and cv2 < 0.49 else "LUMPY")

    return {"adi": round(adi, 3), "cv2": round(cv2, 3),
            "zero_rate": round(1 - n_nonzero / len(y), 3),
            "mean": round(y.mean(), 2), "label": label}
```

```python
print("hourly:", intermittency_diagnosis(y))
print("daily :", intermittency_diagnosis(y_daily))
print("weekly:", intermittency_diagnosis(y_weekly))
```

> ### ⚠️ The aggregation-crossing check
>
> **If `ADI` crosses 1.32 between hourly and daily, the two aggregations are different
> problems** and should not share a model or a metric. A series that is intermittent at
> hourly resolution is usually smooth at daily resolution, because aggregation fills zeros.
>
> This is a genuinely useful diagnostic to run before you commit to a design, and it costs
> nothing.

### Per hour-of-week

```python
how = pd.DataFrame({"dow": np.arange(len(y)) % 168, "y": y})
diag = how.groupby("dow")["y"].apply(intermittency_diagnosis).apply(pd.Series)
diag_sorted = diag.sort_values("adi", ascending=False)
print(diag_sorted[["adi", "zero_rate", "label"]].head(20))
```

> **Sunday 03:00 and Friday 20:00 will be in different cells.** If so, the right question is
> whether a *single* model across all 168 hours can serve both regimes — which is, in fact,
> the discrete-vs-continuous question your
> [[168-Point Forecast Comparison - Discrete vs Continuous]] is asking. This diagnostic gives
> it a concrete mechanism: **per-hour intermittency heterogeneity is a reason discrete models
> might genuinely help.**

---

## Step 2 — Metric safety

```python
def safe_mase(act, pred, insample, m=168):
    denom = np.mean(np.abs(insample[m:] - insample[:-m]))
    if denom <= 0 or np.isnan(denom):
        return np.nan, denom           # return the denominator so you can SEE the instability
    return np.mean(np.abs(act - pred)) / denom, denom
```

```python
vals, denoms = [], []
for k in range(n_windows):
    cut = len(y) - (n_windows - k) * h
    v, d = safe_mase(y[cut:cut+h], pred_k, y[:cut])
    vals.append(v); denoms.append(d)

pd.DataFrame({"mase": vals, "denominator": denoms}).round(4)
```

> **Always report the denominator alongside MASE on sparse data.** If it varies a lot across
> windows, the MASE numbers are not comparable and the comparison is unsound. See §4 of
> [[Intermittent and Sparse Demand]].

**Never report MAPE or sMAPE here.** They are undefined at `y = 0`, which for sparse hourly
data is the typical case. Use MAE + MASE + CRPS.

---

## Step 3 — The Croston family, benchmarked

All in `statsforecast`, all vectorised, all fast.

```python
from statsforecast import StatsForecast
from statsforecast.models import (SeasonalNaive, Naive, Croston,
                                  CrostonSBA, CrostonOptimized, ADIDA, IMAPA, TSB)

sf = StatsForecast(models=[
    Naive(season_length=168),
    SeasonalNaive(season_length=168),
    Croston(season_length=168),
    CrostonSBA(season_length=168),
    CrostonOptimized(season_length=168),
    ADIDA(season_length=168),
    IMAPA(season_length=168),
    TSB(season_length=168),
], freq="h")
```

> ⚠️ **Check names against your installed version** — `statsforecast` model names and
> constructor arguments shift between releases. `print([m for m in dir(statsforecast.models)])`.

### The M5 lesson, reproduced

```python
# The ensemble was M5's most accurate submission in the intermittent category.
preds = sf.forecast(df=panel, h=168)
point_cols = ["Naive", "SeasonalNaive", "CrostonOptimized"]
preds["Ensemble"] = preds[point_cols].mean(axis=1)

# Compare Ensemble vs CrostonOptimized alone across origins
```

> **Expected: the simple average wins or ties.** That is the M5 result and the M4 result
> (combination beats every individual method). If Croston alone wins on your data, say so —
> but check you have not just overfit the ensemble choice to the test set.

---

## Step 4 — Negative Binomial: the right default for counts

If the diagnosis says "small counts, dense" rather than "intermittent", Negative Binomial
beats Gaussian by construction, because `Var(Y) = μ + μ²/k` matches count data.

```python
from neuralforecast import NeuralForecast
from neuralforecast.losses import DistributionLoss
from neuralforecast.losses.pytorch import MultivariateLoss
import torch.nn as nn

class NegBinomialLoss(nn.Module):
    """
    Negative Binomial NLL via Gamma reparameterisation.
    Total variance mu + mu^2/k  -> overdispersion handled correctly.
    """
    def __init__(self):
        super().__init__()
        self.distribution_loss = DistributionLoss(
            loss=nn.GammaPoisson(),                 # mu = exp(link_mu), log-link
            return_loss=True,
        )

    def forward(self, y_true, y_pred, futr_exog=None, hist_exog=None):
        return self.distribution_loss(y_pred, y_true)
```

```python
nf_nb = NeuralForecast(models=[NHITS(h=168, input_size=336, loss=NegBinomialLoss())])
nf_nb.fit(df=df_train)

nf_q = NeuralForecast(models=[NHITS(h=168, input_size=336,
                                    loss=QuantileLoss(quantiles=[0.05,0.25,0.5,0.75,0.95]))])
nf_q.fit(df=df_train)
```

### Score them properly

```python
from utilsforecast.losses import crps, mae, mase

def crps_from_quantiles(y_true, q_pred, levels=np.linspace(0.05, 0.95, 19)):
    """
    CRPS approximated by integrating the pinball loss over the quantile range.
    Lower is better; unlike MAE it rewards sharp, calibrated distributions.
    """
    grid = np.linspace(0.001, 0.999, 100)
    total = 0.0
    for lev in levels:
        q = q_pred[f"{lev:.2f}"]
        total += np.maximum(lev * (y_true - q), (lev - 1) * (y_true - q)) * 0.05
    return total
```

> **Report CRPS alongside MAE.** MAE cannot distinguish a sharp correct distribution from a
> vague one; CRPS can. See [[Generative and Probabilistic Forecasting]].

---

## Step 5 — A detector that survives production

### Step 5a — Residual-based, with the scale conditioned on hour-of-week

```python
from statsforecast import StatsForecast
from statsforecast.models import SeasonalNaive

def hour_week_residuals(y, h=168, m=168):
    """Residuals of the seasonal-naive baseline, keyed by hour-of-week."""
    sf = StatsForecast(models=[SeasonalNaive(season_length=m)], freq="h")
    fitted = sf.forecast(df=pd.DataFrame({"unique_id":"s","ds":range(len(y)),"y":y}),
                         h=0, X_df=None)
    resid = y[m:] - y[:-m]                # naive h-step residual series
    return pd.Series(resid, index=np.arange(len(resid)))
```

```python
resid = hour_week_residuals(y_train)

# Scale per hour-of-week, not globally. This is the key to a survivable alarm burden.
dow = np.arange(len(resid)) % 168
scale = pd.Series(np.abs(resid)).groupby(dow).quantile(0.75)     # robust to peaks
scale = scale.replace(0, np.nan).ffill().bfill()

z = pd.Series(resid).to_numpy() / scale.to_numpy()[dow]
threshold = 3.0
flags = np.abs(z) > threshold
```

> ### ⚠️ Why global scaling fails
>
> A fixed absolute threshold fires every night at 03:00, because the overnight baseline is
> low even though 03:00 is perfectly normal *for 03:00*. Conditioning the scale on hour-of-week
> removes that entirely.
>
> This is the single highest-leverage change to any operational detector. See
> [[Time Series Anomaly Detection]] §4.

### Step 5b — Measure alarm burden, not F1

```python
flags_series = pd.Series(flags, index=dow)

print(f"alarms per day: {flags.sum() / (len(flags) / 168):.2f}")
print("\nby hour of day:")
h24 = flags_series.index % 24
print(flags_series.groupby(h24).sum().to_string())
```

> **The acceptance criterion is alarms per shift.** A detector producing 2 alarms per 12-hour
> shift gets ignored within two weeks. Target something an operator would tolerate — probably
> under one per shift for a routine advisory channel.
>
> This is the metric nobody reports, and it is the only one that determines whether the
> detector exists next quarter.

---

## Step 6 — Free detection from Practice 04's calibration

If you already have a conformally-calibrated forecaster, the nonconformity score is a
detection statistic — no new model needed.

```python
cal_scores   = np.load("cal_scores.npy")       # from Practice 04
test_scores  = np.abs(y_test - point_preds)

for pct in (95, 99, 99.5):
    thr = np.percentile(cal_scores, pct)
    fired = test_scores > thr
    per_shift = fired.sum() / max(1, len(fired) / 168)
    print(f"p{pct}: thr={thr:.2f}  alarms={fired.sum():>3}  per-shift={per_shift:.2f}")
```

⚠️ **The alarm-burden caveat from Practice 04 Step 9 applies.** A global threshold produces a
low alarm count precisely *because* it is wide where the data is noisy, which is exactly where
you do not care. Use the hour-of-week conditioned version from Step 5a instead.

---

## Exercises

- [ ] Run the diagnosis at hourly, daily and weekly aggregation. Does `ADI` cross 1.32?
- [ ] Run the per-hour-of-week diagnosis. How many of the 168 cells are intermittent? Is the
      heterogeneity large enough to favour per-hour models?
- [ ] Report MASE **and its denominator** across origins for all intermittent methods
- [ ] Reproduce the M5 ensemble result on Monash. Does simple averaging beat Croston alone?
- [ ] Compare Negative Binomial vs Gaussian vs quantile CRPS. How much does the
      distribution assumption buy?
- [ ] Build the hour-of-week conditioned detector and a globally-thresholded one. Compare
      alarms per shift and the hour-of-day distribution
- [ ] If you have labelled data (even 200 hours a dispatcher labelled): compute range-based
      F1. If you do not, read the contamination caveats in
      [[Time Series Anomaly Detection]] §3 before trusting any F1

## References

1. Croston, J.D. (1972). Forecasting and stock control for intermittent demands. *ORQ* 23(3). 🔗 https://doi.org/10.2307/3007885
2. Syntetos, A.A. & Boylan, J.E. (2005). On the categorization of demand patterns. *JORS* 56(5). 🔗 https://doi.org/10.1057/palgrave.jors.2601840
3. Teunter, R.H., Syntetos, A.A. & Babai, M.Z. (2011). Intermittent demand. *IJF* 27(1). 🔗 https://doi.org/10.1016/j.ijforecast.2011.01.004
4. Kolassa, S. (2016). Evaluating predictive count data distributions. *IJF* 32(3). 🔗 https://doi.org/10.1016/j.ijforecast.2015.12.004
5. Januschowski, T. et al. (2022). M5 accuracy competition results. *IJF* 38(4). 🔗 https://www.kaggle.com/c/m5-forecasting-accuracy
6. Gneiting, T. & Raftery, A.E. (2007). Strictly proper scoring rules. *JASA*. 🔗 https://doi.org/10.1198/016214506000001437
7. Gneiting, T. (2011). Making predictions with Bayesian hierarchical Additive Regression Trees. 🔗 https://arxiv.org/abs/1010.0079
8. Hyndman, R.J. & Koehler, A.B. (2006). 🔗 https://robjhyndman.com/papers/mase.pdf
9. Godahewa, R. et al. (2021). Monash archive. 🔗 https://arxiv.org/abs/2105.06643

## Cross-links

- [[Intermittent and Sparse Demand]]
- [[Time Series Anomaly Detection]]
- [[Generative and Probabilistic Forecasting]]
- [[time_series_evaluation_metrics_benchmarks]]
- [[Time Series Forecasting Baselines]]
- [[Practice 01 — Rolling-Origin Harness and Baseline Panel]]
- [[Practice 04 — Conformal Prediction on Hourly Counts]]
- [[168-Point Forecast Comparison - Discrete vs Continuous]]
