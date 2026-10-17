---
type: practice
status: active
tags:
  - time-series
  - practice
  - conformal-prediction
  - uncertainty
  - calibration
  - intervals
created: 2026-10-14
aliases:
  - Practice 04
  - Conformal Practice
  - Interval Calibration Practice
---

# Practice 04 — Conformal Prediction on Hourly Counts

**Goal:** turn any forecaster into a calibrated interval, then **discover whether that
calibration survives at peaks.** The peak-stratified result is the point of the whole
exercise.

---

## Setup

```bash
pip install mapie numpy pandas statsforecast utilsforecast matplotlib
```

---

## Step 1 — Why conformal, and what it does not promise

```
Split conformal:
  1. Train the point forecaster on TRAIN
  2. Compute nonconformity scores on CALIBRATE   <- a third split, never the test set
  3. q <- the ⌈(n+1)(1-α)⌉ / n empirical quantile of those scores
  4. Interval(x) = [f(x) - q, f(x) + q]

  GUARANTEE:  P(Y ∈ Interval(X)) >= 1 - α     (marginal)
```

> ### ⚠️ Three guarantees that do NOT hold
>
> 1. **Not conditional.** Nothing is said about coverage at a particular `X` — including
>    at peaks. This is the central limitation.
> 2. **Not exact under time dependence.** The exchangeability assumption fails for
>    autocorrelated series.
> 3. **Not a constant width.** `q` is one global number, so a quiet 03:00 series and a
>    busy Friday-evening series get the same absolute width. For heteroscedastic counts
>    that is badly wrong in both directions.
>
> Points 2 and 3 are what EnbPI, ACI and SPCI exist to fix. See [[Conformal Prediction]]
> §3 for the method ladder and what each one actually guarantees, and
> [[Model Validation Strategies]] §6 for the validation protocol.

---

## Step 2 — The three-way split

```python
def split_forecast(y, h=168, n_cal=168, n_test=168):
    """
    Three non-overlapping blocks, split on WEEK boundaries for hourly data.
    See Model Validation Strategies §8 — never split inside a forecast block.
    """
    assert (len(y) % 24 == 0)
    y_train = y[:-(n_cal + n_test)]
    y_cal   = y[-(n_cal + n_test):-n_test]
    y_test  = y[-n_test:]
    return y_train, y_cal, y_test
```

> ⚠️ **The calibrate split is for conformal only. Never reuse the test set for it.** That is
> the most common conformal error and it silently invalidates the coverage guarantee.

---

## Step 3 — Nonconformity scores

```python
import numpy as np

def abs_residuals(y_cal, y_cal_pred):
    """The simplest valid score. Symmetric, hence a symmetric interval."""
    return np.abs(y_cal - y_cal_pred)


def cqr_scores(y_cal, lo_pred, hi_pred):
    """
    Conformalized Quantile Regression score (Romano, Patterson & Candes, 2019).
    Uses the candidate interval directly, so width adapts to local difficulty.
    arXiv:1905.03222
    """
    return np.maximum(lo_pred - y_cal, y_cal - hi_pred)
```

---

## Step 4 — Split conformal

```python
def split_conformal(cal_scores, alpha=0.1):
    """
    The (1-alpha) empirical quantile, with the finite-sample correction.
    Returns q such that the interval is [pred - q, pred + q].
    """
    n = len(cal_scores)
    k = int(np.ceil((n + 1) * (1 - alpha)))       # finite-sample correction, NOT n*alpha
    k = min(k, n)
    return np.sort(cal_scores)[k - 1]


q = split_conformal(cal_scores, alpha=0.10)
interval = (point_pred - q, point_pred + q)
```

> ⚠️ **Use the finite-sample correction.** `np.quantile(scores, 0.9)` is the common shortcut
> and it does *not* give the nominal guarantee. The correction is one line.

---

## Step 5 — CQR, the tighter version

```python
lo_train, hi_train = quantile_model(y_train, q_lo=0.05, q_hi=0.95)
scores = cqr_scores(y_cal, lo_cal, hi_cal)

alpha = 0.1
n = len(scores)
k = int(np.ceil((n + 1) * (1 - alpha)))
q_cqr = np.sort(scores)[min(k, n) - 1]

lo_final = lo_test - q_cqr
hi_final = hi_test + q_cqr
```

> CQR adapts width to local difficulty because the score is built from a candidate interval
> rather than an absolute residual. On heteroscedastic hourly counts this is usually a real
> improvement over split conformal — **but** it still guarantees only marginal coverage.

For a quantile forecaster from `neuralforecast`, use its built-in quantile outputs directly:

```python
from neuralforecast import NeuralForecast
from neuralforecast.models import NHITS

nf = NeuralForecast(models=[NHITS(h=168, input_size=336,
                                  loss=__import__("neuralforecast.losses",
                                                  fromlist=["QuantileLoss"]).QuantileLoss(
                                  quantiles=[0.05, 0.5, 0.95]))])
nf.fit(df=df_train)
fc = nf.predict(df=df_cal)          # gives lo-0.05, NHITS, hi-0.95 columns
```

---

## Step 6 — Adaptive: ACI, for drifting data

Gibbs & Candès (2021), 🔗 [arXiv:2106.00170](https://arxiv.org/abs/2106.00170).
Updates the interval width online as new data arrives — which is what you need when the
calibration set goes stale.

```python
width = q                     # initialise from the split-conformal width
intervals = []

for pt, yt in zip(point_preds, y_test):
    # 1. record the interval at the CURRENT width ...
    lo, hi = pt - width, pt + width
    intervals.append((lo, hi, pt))

    # 2. ... then update using the error we just observed
    err = 1.0 if not (lo <= yt <= hi) else 0.0
    gamma_t = 0.005 + 0.1 - err            # gamma + alpha_t - err_t
    width = max(width + gamma_t * (err - 0.1), 1e-6)

lo_aci = np.array([i[0] for i in intervals])
hi_aci = np.array([i[1] for i in intervals])
```

> **Update *after* recording the interval.** Updating first would let the current observation
> influence its own interval — a small leak that quietly breaks the accounting.

> **ACI guarantees long-run coverage under drift**, not per-step coverage. That is a
> different and weaker statement than split conformal's — and the right one for a system
> running live. State which one you are relying on.

---

## Step 7 — ⚠️ The stratified evaluation — the actual experiment

This is the part the whole note is for.

```python
def coverage_report(y_true, lo, hi, label=""):
    inside = (y_true >= lo) & (y_true <= hi)
    coverage = inside.mean()
    width    = np.mean(hi - lo)

    # Conditional: stratify by realised volume decile
    deciles = pd.qcut(pd.Series(y_true), 10, labels=False, duplicates="drop")
    by_dec = pd.DataFrame({"ok": inside, "dec": deciles}).groupby("dec")["ok"].mean()

    print(f"\n{label}")
    print(f"  overall coverage : {coverage:.3f}   mean width: {width:.2f}")
    print(f"  coverage by realised-volume decile:")
    for d, c in by_dec.items():
        bar = "#" * int(c * 40)
        flag = "  <-- WEAK" if c < 0.70 else ""
        print(f"    decile {d}: {c:.3f}  {bar}{flag}")
    return {"coverage": coverage, "width": width, "by_decile": by_dec}
```

```python
coverage_report(y_test, split_lo, split_hi, "Split conformal")
coverage_report(y_test, cqr_lo,   cqr_hi,   "CQR")
coverage_report(y_test, aci_lo,   aci_hi,   "ACI")
```

> ### ⚠️ What you are looking for
>
> If `overall coverage ≈ 0.90` but `decile 9 ≈ 0.4`, you have reproduced the failure in
> [[Model Validation Strategies]] §6.4:
>
> > A predictor can achieve exactly 90% marginal coverage while achieving **0% coverage at
> > peaks**, by being very wide during quiet hours and very narrow during busy ones.
>
> That is the failure mode. **A staffing interval that is correct on average and worthless at
> 20:00 on a Friday is worse than no interval, because it will be used.**
>
> Note also that the width is a single number, so the method is *forced* to be uniform — the
> marginal/conditional gap here is structural, not a tuning failure.

---

## Step 8 — Show that no method fixes it

```python
# CQR adapts to local difficulty; does it help conditional coverage?
report_cqr = coverage_report(y_test, cqr_lo, cqr_hi, "CQR")

# Compare quantile spreads across deciles
np.save("coverage_reports.npy", {
    "split": report_split, "cqr": report_cqr, "aci": report_aci,
})
```

> Neither CQR nor ACI guarantees conditional coverage. That remains open — and it is exactly
> the finding your 168-point study is positioned to report. **Test it directly and treat the
> result as a contribution, not a failure.** See §6.4 of [[Model Validation Strategies]].

---

## Step 9 — Free anomaly detection from the same calibration

The nonconformity score *is* a detection statistic.

```python
scores_test = np.abs(y_test - point_preds)

for thr_pct in (90, 95, 99):
    thr = np.percentile(cal_scores, thr_pct)
    flags = scores_test > thr
    print(f"threshold p{thr_pct}: {flags.sum()} alarms in {len(y_test)} hours")

# Stratif by hour-of-day — the alarm-burden check from Time Series Anomaly Detection §4
alarm_hours = pd.Series(np.where(flags)[0] % 24)
print("\nalarms by hour of day:")
print(alarm_hours.value_counts().sort_index().to_string())
```

> ⚠️ **If alarms concentrate in low-count overnight hours, that is a scale artefact, not
> detection.** A fixed absolute threshold fires wherever the baseline is low. Fix: normalise
> by an expected-variance model conditioned on hour-of-week, or work on a Negative Binomial
> scale. See [[Time Series Anomaly Detection]] §4.

---

## Exercises

- [ ] Run split conformal and CQR on the same forecaster; compare **width** at matched
      marginal coverage. CQR should be tighter — by how much?
- [ ] Run the stratified report for **all three**. Produce the decile-coverage table.
- [ ] Try `α = 0.05` and `α = 0.2`. Does the gap between marginal and conditional coverage
      widen as intervals get wider?
- [ ] Implement **EnbPI** — it avoids the data-split entirely and handles autocorrelation.
      Compare its coverage.
- [ ] Use the ACI loop over a long rolling window (several weeks) and plot cumulative
      empirical coverage against the nominal line. Does it converge?
- [ ] Conditional coverage on **hour-of-week** rather than volume decile — which
      stratification is more informative operationally?
- [ ] Feed the same pipeline a *deliberately misspecified* forecaster. Does coverage still
      hold? (It should — that is the point.)

## References

1. Vovk, V., Gammerman, A. & Shafer, G. (2005). *Algorithmic Learning in a Random World*. 🔗 https://doi.org/10.1007/0-387-25040-6
2. Romano, Y., Patterson, E. & Candès, E. (2019). Conformalized Quantile Regression. *NeurIPS*. 🔗 https://arxiv.org/abs/1905.03222
3. Gibbs, I. & Candès, E. (2021). Adaptive conformal inference under distribution shift. *NeurIPS 2021*. 🔗 https://arxiv.org/abs/2106.00170
4. Xu, C. & Xie, Y. (2021). Conformal prediction interval for dynamic time-series (EnbPI). *ICML 2021*, PMLR 139, 11559–11569. 🔗 https://proceedings.mlr.press/v139/xu21h.html
5. Zaffran, M. et al. (2022). Adaptive conformal predictions for time series. 🔗 https://arxiv.org/abs/2202.07282
6. Galvão Lopes, R. et al. (2024). ConForME. *AISTATS 2024*. 🔗 https://proceedings.mlr.press/v230/galvao-lopes24a.html
7. MAPIE documentation. 🔗 https://mapie.readthedocs.io/en/stable/
8. Hyndman, R.J. & Athanasopoulos, G. (2021). FPP3 §5.8. 🔗 https://otexts.com/fpp3/prediction-intervals.html

## Cross-links

- [[Conformal Prediction]] — the theory note behind this exercise: method ladder, guarantees, impossibility results
- [[Model Validation Strategies]]
- [[Generative and Probabilistic Forecasting]]
- [[Time Series Anomaly Detection]]
- [[Intermittent and Sparse Demand]]
- [[Practice 01 — Rolling-Origin Harness and Baseline Panel]]
- [[Practice 03 — Zero-Shot Foundation Model Bake-Off]]
- [[Practice 05 — Intermittency, Counts and Anomaly Detection]]
- [[168-Point Forecast Comparison - Discrete vs Continuous]]
- [[resources]]
