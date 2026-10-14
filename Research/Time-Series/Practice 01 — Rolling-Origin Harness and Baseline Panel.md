---
type: practice
status: active
tags:
  - time-series
  - practice
  - validation
  - baselines
  - rolling-origin
  - mase
created: 2026-10-14
aliases:
  - Practice 01
  - Rolling Origin Harness
  - Baseline Panel Practice
---
---

# Practice 01 — Rolling-Origin Harness and Baseline Panel

**Goal:** build the evaluation harness every later practice depends on, and produce a
defensible baseline panel — on hourly count data if you have it, Monash otherwise.

This is the concrete implementation of §8 of [[Model Validation Strategies]] and §8 of
[[Time Series Forecasting Baselines]].

> **Nothing to install beyond the Nixtlaverse.** If you have no data yet, this runs on the
> Monash archive. When the Douglas County data arrives, only `load_series()` changes.

---

## Setup

```bash
pip install statsforecast mlforecast neuralforecast utilsforecast \
            datasetsforecast pandas numpy matplotlib
```

---

## Step 1 — Get hourly count data

```python
import pandas as pd

def load_series():
    """
    Return a long panel (unique_id, ds, y) at HOURLY frequency.

    >>> Replace with your own loader when Douglas County data is available:
    >>>   pd.read_parquet("douglas_county_911_hourly.parquet")
    """
    # Monash 'hourly' subset — real hourly counts, multiple series
    from datasetsforecast.hierarchical import load_dataset
    df, *_ = load_dataset("hourly", group="M4")
    df = df.rename(columns={"M4": "unique_id"})
    return df[["unique_id", "ds", "y"]].reset_index(drop=True)
```

---

## Step 2 — The seasonal periods

Hourly data carries three seasonalities. You must decide which one your benchmark uses.

```python
SEASONAL = {"H": 24, "h_of_week": 168, "yearly": 8766}
M = 168          # primary benchmark: seasonal naive m = 168
```

> **Why 168 and not 24.** `m=24` ("same hour yesterday") ignores day-of-week and is close to
> indefensible as a sole benchmark for 9-1-1 volume. See §3.1 of
> [[Time Series Forecasting Baselines]]. You will *measure* how weak it is in Step 6.

---

## Step 3 — MASE with a correctly-placed denominator

The single most common error in this whole area.

```python
import numpy as np

def mase(act, pred, insample, m=M):
    """
    MASE with the denominator computed on the TRAINING slice only.
    act, pred : (h,) arrays          — the forecast window
    insample  : (n,) array          — TRAINING data only, never the test window
    """
    mae_model = np.mean(np.abs(act - pred))
    denom = np.mean(np.abs(insample[m:] - insample[:-m]))   # seasonal-naive error
    if denom == 0 or np.isnan(denom):
        return np.nan                                     # guard, do not silently return 0
    return mae_model / denom
```

> ⚠️ `np.nan`, not `0`. A guard that returns 0 makes a broken model look perfect. This is
> exactly the failure [[time_series_evaluation_metrics_benchmarks]] §5 flags for percentage
> metrics.

---

## Step 4 — Build the baseline panel

```python
from statsforecast import StatsForecast
from statsforecast.models import SeasonalNaive, Naive, RandomWalkWithDrift, ADIDA, CrostonOptimized

def hour_of_week_mean(y_train, h, m=M, window=52 * 168):
    """
    Mean for that specific hour-of-week over a trailing window.
    Equivalent to 168 separate seasonal-naive series, but level-aware:
    it tracks drift that plain seasonal naive cannot.
    """
    y = np.asarray(y_train, dtype=float)
    w = y[-min(len(y), window):] if len(y) > window else y
    dow = np.arange(len(w)) % m
    means = pd.Series(w).groupby(dow).mean()
    future_pos = (np.arange(len(y), len(y) + h)) % m
    return np.array([means.get(p, np.nan) for p in future_pos])
```

And the panel:

```python
def make_forecasts(y_train, h, m=M):
    """Every model gets the same training slice and the same h."""
    sf = StatsForecast(models=[
        SeasonalNaive(season_length=m),        # primary benchmark
        SeasonalNaive(season_length=24),       # quantify how weak m=24 is
        Naive(),
        RandomWalkWithDrift(),
        ADIDA(),
        CrostonOptimized(),
    ], freq="h")

    res = {}
    stat = sf.forecast(df=pd.DataFrame({"unique_id": "s", "ds": range(len(y_train)),
                                        "y": y_train}), h=h)
    for col in stat.columns[2:]:
        res[col] = stat[col].to_numpy()

    res["HourOfWeekMean"] = hour_of_week_mean(y_train, h, m)
    res["Ensemble"] = np.nanmean([res[c] for c in
                                  ["SeasonalNaive", "HourOfWeekMean", "RandomWalkWithDrift"]],
                                 axis=0)
    return res
```

---

## Step 5 — The rolling-origin loop

```python
def rolling_origin(y, h=168, n_windows=6, step=None, m=M):
    """
    Every model refitted at every origin. Expanding window.
    Returns a DataFrame: model, origin, actual, pred, mase.
    """
    step = step or h
    rows = []
    for k in range(n_windows):
        cut = len(y) - (n_windows - k) * step
        if cut < m * 2:                       # need enough history for the denominator
            continue
        y_train, y_test = y[:cut], y[cut:cut + h]
        if len(y_test) < h:
            break

        for name, pred in make_forecasts(y_train, h, m).items():
            if np.isnan(pred).all():
                continue
            rows.append({
                "model": name, "origin": cut,
                "actual": y_test, "pred": pred,
                "mase": mase(y_test, pred, y_train, m),
                "mae": np.mean(np.abs(y_test - pred)),
                "rmse": np.sqrt(np.mean((y_test - pred) ** 2)),
            })
    return pd.DataFrame(rows)
```

> **Read the loop carefully.** `y_train = y[:cut]` and the MASE denominator uses `y_train`
> only. That is the whole point. And `refit` happens implicitly — every call re-runs the fit.

---

## Step 6 — Run it and compare

```python
y = load_series()
y = y[y["unique_id"] == y["unique_id"].iloc[0]]["y"].to_numpy()

results = rolling_origin(y, h=168, n_windows=6)

summary = (results.groupby("model")[["mase", "mae", "rmse"]]
                  .mean().sort_values("mase"))
print(summary.round(4))

# How weak is m=24, really?
sn24 = results[results["model"] == "SeasonalNaive_24"]["mase"].mean()
sn168 = results[results["model"] == "SeasonalNaive"]["mase"].mean()
print(f"\nm=24 is {sn24 / sn168:.2f}x worse than m=168")
```

### What to look for

- [ ] `Ensemble` at or near the top — M4's most robust finding
- [ ] `SeasonalNaive_24` substantially worse than `SeasonalNaive` (m=168) — quantify it
- [ ] Whether `CrostonOptimized` is even competitive — check the ADI first
      ([[Intermittent and Sparse Demand]])
- [ ] Variance of MASE **across origins** — a large spread means the ranking is unstable and
      your DM test will be underpowered

---

## Step 7 — Peak-conditional evaluation

Aggregate MASE hides what matters operationally.

```python
res_wide = results[results["model"].isin(["SeasonalNaive", "HourOfWeekMean", "Ensemble"])].copy()
res_wide["err"] = np.abs(res_wide["actual"] - res_wide["pred"])

thresh = np.percentile(res_wide["actual"], 90)      # top decile of realised volume
peak = res_wide[res_wide["actual"] >= thresh]
quiet = res_wide[res_wide["actual"] < thresh]

for label, frame in [("PEAK (top decile)", peak), ("QUIET", quiet)]:
    print(f"\n{label}")
    print(frame.groupby("model")["err"].mean().round(3))
```

> **This table is the honest presentation.** Reporting "our model MASE 0.85" without showing
> that the *baseline also fails at peaks* invites the reader to conclude the model handles
> incidents — which it demonstrably does not. See §8 of [[Time Series Forecasting Baselines]].

---

## Step 8 — Does the model actually beat the baseline?

Average error is not a significance test.

```python
# scipy.stats.permut_test, or arch.bootstrap for the Harvey-Leybourne-Newbold correction
from scipy import stats

def dm_test(e1, e2, horizon=168):
    """
    Diebold-Mariano on loss differentials, with an autocorrelation correction.
    See Model Validation Strategies §4.1 — the h-dependent truncation is the test.
    """
    d = np.asarray(e1) - np.asarray(e2)
    d = d - d.mean()
    n = len(d)
    lrv = np.sum(d ** 2) / n
    for j in range(1, min(horizon, n - 1)):      # Bartlett / Newey-West truncation
        lrv += 2 * (1 - j / horizon) * np.sum(d[j:] * d[:-j]) / n
    stat = d.mean() / np.sqrt(lrv / n)
    return stat, 2 * (1 - stats.norm.cdf(abs(stat)))    # two-sided

base_err = (res_wide[res_wide["model"] == "SeasonalNaive"]["err"].to_numpy())
ens_err  = (res_wide[res_wide["model"] == "Ensemble"]["err"].to_numpy())

stat, p = dm_test(ens_err, base_err, horizon=168)
print(f"DM  Ensemble vs SeasonalNaive:  stat={stat:.3f}  p={p:.4f}")

if p > 0.05:
    print("No significant difference — do NOT write 'beats naive'.")
```

> **Read the warning in §3 of [[Model Validation Strategies]].** At `h = 168` the loss
> differentials overlap almost completely, the effective sample size is tiny, and an
> uncorrected test is anti-conservative. The correction above matters. If `n_windows` is 6,
> say in the write-up that the test is underpowered rather than reporting the p-value as a
> null result.

---

## Exercises

- [ ] Run with `m = 24` and `m = 168`. Record the ratio.
- [ ] Add `Theta` from `statsforecast.models`. Does it beat seasonal naive?
- [ ] Increase `n_windows` to 12 and watch how the MASE variance changes
- [ ] Add DLinear and N-HiTS ([[Linear Models for Forecasting]] §6) — the baseline panel is
      currently missing trend-capable models
- [ ] Break the harness deliberately: compute MASE's denominator over the **full** series and
      confirm the numbers move. That is metric-side leakage.
- [ ] Plot MASE by origin. If the ranking flips, your conclusion is a statement about the
      window, not the model.

## References

1. Tashman, L.J. (2000). Out-of-sample tests of forecasting accuracy. *IJF* 16(4). 🔗 https://doi.org/10.1016/S0169-2070(00)00065-0
2. Hyndman, R.J. & Koehler, A.B. (2006). Another look at measures of forecast accuracy. 🔗 https://robjhyndman.com/papers/mase.pdf
3. Montero-Manso, P. & Hyndman, R.J. (2021). Attributes that define forecasting benchmarks. 🔗 https://arxiv.org/abs/2003.07823
4. Makridakis, S. et al. (2020). The M4 Competition. 🔗 https://doi.org/10.1016/j.ijforecast.2019.11.001
5. Godahewa, R. et al. (2021). Monash Time Series Forecasting Archive. 🔗 https://arxiv.org/abs/2105.06643

## Cross-links

- [[Model Validation Strategies]]
- [[Time Series Forecasting Baselines]]
- [[Nixtlaverse]]
- [[Practice 02 — Linear Models and the Baseline Question]]
- [[Practice 03 — Zero-Shot Foundation Model Bake-Off]]
- [[168-Point Forecast Comparison - Discrete vs Continuous]]
