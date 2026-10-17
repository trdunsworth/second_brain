---
type: reference
status: active
topic: "Wrapping any point forecaster to produce distribution-free prediction intervals, and why the marginal coverage guarantee it buys is not the conditional coverage a staffing decision actually needs."
created: 2026-10-16
aliases:
  - Conformal
  - Conformal Prediction Intervals
  - Conformalised Forecasting
  - Distribution-Free Prediction Intervals
tags:
  - time-series
  - forecasting
  - conformal-prediction
  - uncertainty
  - calibration
  - prediction-intervals
  - distribution-shift
---

# Conformal Prediction

> Created 2026-10-16 to fill a real hole: conformal prediction appeared across **six** notes in
> this vault — as a runnable exercise in [[Practice 04 — Conformal Prediction on Hourly Counts]],
> a four-row remedies table in [[Model Validation Strategies]] §6, a bare paper list in
> `resources` §3.7, and the escalation path in [[Staffing_Forecasting_Experiment]] §3 — but
> **no note ever explained the methods themselves.**
>
> **Framing:** conformal prediction is a *wrapper*, not a forecaster. It takes `ŷ` and a
> calibration set and returns a set `C(x)` that is guaranteed to contain the truth at a stated
> rate. The guarantee is **finite-sample, distribution-free, and model-agnostic** — you need
> almost nothing to be true, which is exactly why it survives contact with real messy data.
>
> **The catch, stated once and early:** the guarantee is **marginal**. It is an average over
> the whole input space. The only part of that average you actually care about — coverage at
> 20:00 on a Friday — is the part the theorem says nothing about. See §4 and §5.

---

## 1. The one-sentence version

```
Split conformal:
  1. Fit the point forecaster  f̂  on TRAIN
  2. Compute nonconformity scores on CALIBRATE   <- a third split, never the test set
  3. q <- the ⌈(n+1)(1-α)⌉ / n empirical quantile of those scores
  4. C(x) = [ f̂(x) - q , f̂(x) + q ]

  GUARANTEE:   P( Y ∈ C(X) )  ≥  1 - α          (marginal, finite-sample, distribution-free)
```

Three properties worth being precise about, because they are what make the method attractive
and they are all easy to overstate:

| Property | Precise meaning | What it does **not** mean |
|---|---|---|
| **Finite-sample** | The guarantee holds for any `n`, with the `⌈(n+1)(1-α)⌉` correction | Not asymptotic. `n = 50` is fine. |
| **Distribution-free** | No assumption on the data-generating process | Not assumption-free about *exchangeability* — see §2 |
| **Model-agnostic** | `f̂` can be anything — a linear model, an LSTM, a vendor's API | Not that `f̂` is *good*. A bad forecaster gives a wide, useless interval. |

> ### ⚠️ The guarantee is about the wrapper, not the forecast
>
> Conformal prediction cannot make a bad point forecast better. If `f̂` is off by 400 calls at
> peak, the interval will faithfully say "off by 400, give or take". It certifies **honesty
> about uncertainty**, not **competence at forecasting**. The two are separate problems and
> conflating them is the most common misreading.
>
> This matters for the vendor question in [[Staffing_Forecasting_Experiment]]: wrapping a weak
> forecaster in conformal intervals does not rescue the forecast, it just makes the weakness
> legible.

---

## 2. The exchangeability problem

Split conformal's validity rests on **exchangeability** — the `n` calibration points and the
test point being drawn from the same distribution *in any order*. Permute them; the guarantee
still holds.

**Time series are not exchangeable.** `y_t` and `y_{t+h}` are not identically distributed
(non-stationarity) and not independent (autocorrelation). Permute a series and you destroy the
very structure you are forecasting. So the one assumption the method actually needs is the one
time series violate by construction.

Zaffran et al. 🔗 [arXiv:2202.07282](https://arxiv.org/abs/2202.07282) state it plainly:

> "Conformal prediction is a general and theoretically sound answer. However, it requires
> exchangeable data, **excluding time series**."

Three responses exist, and they are *different* responses — not three versions of one thing:

| Response | Move | Cost |
|---|---|---|
| **Ignore it** | Use split conformal anyway | The `⌈(n+1)(1-α)⌉` correction gives *approximate* coverage. Empirically often fine; formally unsupported. |
| **Reweight** | Down-weight old calibration points; use recent ones | Loses calibration sample size; needs a mixing / stability assumption |
| **Remodel** | Model the temporal dependence explicitly (EnbPI, SPCI) | More machinery; assumptions about mixing rather than exchangeability |

> **Practical reading:** for a stable weekly-seasonal series, split conformal is usually fine in
> practice and the exchangeability violation is second-order next to the marginal-vs-conditional
> problem in §4. For a series with trend, intervention, or regime change, it is not, and
> §3.4–§3.6 exist for you.

---

## 3. The method ladder

Each row adds one thing. The ordering is roughly by sophistication, and roughly by how much you
should reach for it by default.

| Method | Adds | Guarantee | Needs a calibrate split? |
|---|---|---|---|
| **Split conformal** | — | Marginal, finite-sample | Yes |
| **Normalised split** | Scale-adaptive width | Marginal, scale-adaptive | Yes |
| **CQR** | Heteroscedasticity-aware | Marginal, sharper | Yes |
| **ACI / AgACI** | Online adaptation to drift | **Time-averaged** coverage, no stationarity | No (online) |
| **EnbPI** | Temporal dependence | Approx. valid marginal, strongly-mixing | No |
| **SPCI** | Conditional quantile of residuals | **Asymptotic conditional** | No |
| **ConForME** | Joint multi-horizon coverage | Marginal + joint across horizon | Yes |

### 3.1 Split conformal

The baseline. `q` is one global number, so **every interval has the same width** — a quiet
03:00 and a busy Friday 20:00 get identical absolute bands. On heteroscedastic counts that is
badly wrong in both directions simultaneously.

The finite-sample correction is not optional:

```python
q = np.sort(scores)[min(int(np.ceil((n + 1) * (1 - alpha))), n) - 1]
#                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ NOT n * (1 - alpha)
```

`np.quantile(scores, 0.9)` is the common shortcut and it does **not** deliver the nominal
guarantee. With `n = 50` and `α = 0.1`, the naive quantile gives you 45 points below it, not 46.

### 3.2 Normalised / localised split conformal

Divide the residual by a local difficulty estimate before taking the quantile:

```
s_i = |y_i - ŷ_i| / σ̂(x_i)        q = ⌈(n+1)(1-α)⌉-quantile of {s_i}
C(x) = [ ŷ(x) - q·σ̂(x) , ŷ(x) + q·σ̂(x) ]
```

Width now varies with `x`. This is the cheapest route to *some* conditional behaviour, and it
is the direct ancestor of the weighted methods in §3.7. It introduces its own failure: the
guarantee now depends on `σ̂` being sensible, and a poor `σ̂` breaks it silently.

### 3.3 CQR — conformalised quantile regression

Romano, Patterson & Candès 🔗 [arXiv:1905.03222](https://arxiv.org/abs/1905.03222) (NeurIPS
2019). Instead of scoring an absolute residual, score the **candidate interval** the quantile
model already produced:

```
s_i = max( q̂_lo(x_i) - y_i ,  y_i - q̂_hi(x_i) )      # ≤ 0 means the interval already covered
q  = ⌈(n+1)(1-α)⌉-quantile of {s_i}
C(x) = [ q̂_lo(x) - q ,  q̂_hi(x) + q ]
```

Width adapts to local difficulty *because the base model already did* — CQR inherits the
heteroscedasticity of the quantile regressor and only corrects its calibration. On
heteroscedastic hourly counts this is usually a genuine width reduction over normalised split
at matched coverage.

> CQR **still guarantees only marginal coverage**. This is the single most common
> misattribution in the applied literature: the paper's own framing is "unnecessarily
> conservative because they form intervals of constant or weakly varying length" — a statement
> about **sharpness**, not about conditional validity. Fixing sharpness is not fixing
> conditional coverage.

### 3.4 ACI / AgACI — adapting to drift

Gibbs & Candès 🔗 [arXiv:2106.00170](https://arxiv.org/abs/2106.00170) (NeurIPS 2021) drop
exchangeability entirely by treating the miscoverage level as the online learning target:

```
err_t   = 1 if y_t ∉ C_t else 0
α_{t+1} = α_t + γ(α - err_t)
C_t     = Quantile_{1-α_t}({s_1, ..., s_{t-1}})
```

If we are missing too much, `α_t` **falls**, which **raises** the quantile, which **widens**
the interval. It is a one-parameter feedback loop — the parameter being the target
miscoverage.

> ### ⚠️ ACI guarantees time-*averaged* coverage, not per-step coverage
>
> Over a long horizon, cumulative empirical coverage converges to `1 - α`. **At any single
> step, there is no guarantee at all.** This is a weaker claim than split conformal's and the
> *right* one for a system running live — but state which one you are relying on, because they
> are not interchangeable and conflating them is how ACI gets oversold.

**AgACI** (Zaffran et al. 🔗 [arXiv:2202.07282](https://arxiv.org/abs/2202.07282)) removes the
one free parameter — `γ` — by running several ACI experts at different learning rates and
aggregating them online by exponential weights. Their finding is that **the choice of `γ`
dominates ACI's practical behaviour**; if you tune it badly, ACI underperforms methods you were
supposed to be improving on.

### 3.5 EnbPI — bootstrap ensemble, no split

Xu & Xie 🔗 [PMLR 139](https://proceedings.mlr.press/v139/xu21h.html) (ICML 2021). Wrap a
**bootstrap ensemble** rather than a single model:

```
ŷ_{t+1} = (1/B) Σ_b ŷ^{(b)}_{t+1}
s_t     = (1/B) Σ_b |y_t - ŷ^{(b)}_{t|T}|          # mean residual across ensemble members
q̂_{t+1} = Quantile_{1-α}({s_1, ..., s_t})
C_{t+1} = [ ŷ_{t+1} - q̂_{t+1} , ŷ_{t+1} + q̂_{t+1} ]
```

Three practical properties that make it attractive here:

| Property | Detail |
|---|---|
| **No data split** | Calibration and prediction use the same data — critical when history is short |
| **No refitting** | Trains the ensemble once; emits intervals sequentially forever |
| **Explicitly non-exchangeable** | Validity rests on **strong mixing**, not exchangeability |

The cost is that the ensemble members must be trained on overlapping bootstrap samples — `B`
full model fits. That is the price of the guarantee.

> EnbPI's guarantee is "finite-sample, **approximately valid** marginal coverage … for
> strongly mixing stochastic errors." Both hedges are in the original abstract. Strong mixing
> fails for series with long memory, and "approximately valid" is doing real work.

### 3.6 SPCI — the peak-coverage answer

Xu & Xie 🔗 [PMLR 202](https://proceedings.mlr.press/v202/xu23r.html) (ICML 2023). This is the
only method in the ladder that targets **conditional** coverage directly.

The move: stop treating `s_t` as exchangeable and start treating it as a **time series**, then
forecast its own quantile.

```
Fit Q(τ | s_{t-1}, s_{t-2}, ...) online on the residual history
C_t = [ ŷ_t - Q_t(1-α) , ŷ_t + Q_t(1-α) ]
```

Because `Q_t` conditions on recent residual *values*, a period of persistently large residuals
— i.e. peak hours — yields a larger predicted quantile. **This is the mechanism by which SPCI
addresses the peak-coverage failure in §4**, and it is the reason it deserves a place in the
[[Staffing_Forecasting_Experiment]] escalation ladder.

> The guarantee is **asymptotic** conditional coverage, built on quantile-regression
> consistency assumptions — not finite-sample, and not free. The paper's own experiments report
> **significant interval-width reduction at matched coverage** versus the alternatives, which is
> the result that matters operationally.

### 3.7 Multi-horizon and weighted variants

- **ConForME** — Galvão Lopes et al. 🔗 [PMLR 230](https://proceedings.mlr.press/v230/galvao-lopes24a.html) (CoPP 2024).
  Extends split conformal to multi-horizon with **joint** coverage across the horizon, using
  temporal dependence for efficiency. Reports up to **52%** interval-width improvement over
  CF-RNN. Directly relevant to the one-shot 168-hour blocks — see §6.
- **Localised / weighted conformal** — weights calibration points by proximity in feature space
  (e.g. hour-of-week). Approximates conditional coverage without modelling residual dynamics.
- **CF-RNN** — Stankevičiūtė et al. (NeurIPS 2021), extends inductive CP to multi-horizon RNN
  forecasting. The baseline ConForME builds on.
- **MAPIE** 🔗 [arXiv:2207.12274](https://arxiv.org/abs/2207.12274) — the reference Python
  implementation. Docs: 🔗 https://mapie.readthedocs.io/en/stable/

---

## 4. What is actually guaranteed

```
Marginal coverage:    P( Y ∈ C(X) )         ≥ 1 − α     (averaged over all X)
Conditional coverage: P( Y ∈ C(X) | X = x ) ≥ 1 − α     (for every x)
```

Conformal delivers the first. It says **nothing** about where in the input space coverage holds.

The failure mode is not a subtle degradation — it is fully achievable:

> A predictor can achieve exactly 90% marginal coverage while achieving **0% coverage at
> peaks**, by being very wide during quiet hours and very narrow during busy ones.

For 9-1-1 capacity planning this is the whole ball game:

> **A staffing interval that is correct on average and worthless at 20:00 on a Friday is worse
> than no interval, because it will be used.**

This is restated from [[Model Validation Strategies]] §6.4 because it is the crux of the whole
subject, and it is hypothesis **H4** in [[Staffing_Forecasting_Experiment]]. Conformal cannot
settle it — it can only be *tested* for it.

**Why this is structural, not a tuning failure.** Split conformal's `q` is a single scalar. The
width is *forced* to be constant. You cannot tune your way out of a constant. Only methods that
make the width a function of `x` — CQR, normalised split, SPCI — even have the machinery to try.

---

## 5. Conditional coverage is (mostly) impossible

This deserves stating as a theorem rather than a caveat, because it reframes the entire
project's expectations.

**Exact finite-sample conditional coverage cannot be guaranteed universally without
assumptions.** Gibbs & Candès 🔗 [arXiv:2305.12616](https://arxiv.org/abs/2305.12616) formalise
a *spectrum* between marginal and conditional validity:

| Target | Status |
|---|---|
| Marginal over all `X` | ✅ Solved. Split conformal. |
| Exact over a **finite, pre-specified** set of subgroups | ✅ Solved exactly, finite-sample |
| Exact over an **infinite-dimensional** class of conditions | ❌ Impossible |
| Approximate over a tunable infinite-dimensional class | ✅ Solved with a controllable error bound |

That middle row is the practical escape hatch, and it is genuinely useful: **you cannot get
"90% coverage conditional on hour-of-week" for free, but you can get exact coverage over each
of the 168 hours.** Finite-sample, exactly. That is a much better position than "90% on average
and hope."

> ### ⚠️ What this means for H4
>
> If you want conditional coverage at peaks, the honest options are:
> 1. **Stratify** — declare hour-of-week (or volume decile) as pre-specified subgroups and
>    target exact coverage within each. Finite-sample, achievable, and it makes the guarantee
>    *match the operational question*.
> 2. **Accept approximation** — SPCI, and report the empirical conditional coverage with its
>    gap, as the finding.
>
> What you cannot do is report an overall 90% and call it done. That number can be made by a
> method that is useless where it matters.

---

## 6. The three-way split

For a series with history `y`:

```python
y_train = y[: -(n_cal + n_test)]      # fit f̂
y_cal   = y[-(n_cal + n_test) : -n_test]   # compute q
y_test  = y[-n_test:]                 # evaluate ONLY
```

Three rules that are non-negotiable:

1. **Never calibrate on the test set.** It is the most common conformal error and it silently
   invalidates the guarantee — you get perfect coverage and have learned nothing.
2. **Split on forecast-block boundaries.** For one-shot 168-hour blocks, split on **week**
   boundaries. Splitting inside a block leaks: the model has already seen the first 80 hours of
   the "future" it is being asked to forecast. See [[Model Validation Strategies]] §8.
3. **Freeze the split before fitting anything**, and document it.

> ### ⚠️ `n_cal` is a real budget
>
> The guarantee degrades as `n_cal` shrinks — at `α = 0.1` and `n = 20` the correction
> `⌈21 × 0.9⌉ = 19` means your interval is calibrated on the 19th order statistic of 20
> points. Variance is high. Given that [[Staffing_Forecasting_Experiment]] needs ≥ 4 months of
> data for multiple complete 168-slot cycles, budget the calibration block deliberately rather
> than taking whatever is left.

---

## 7. Implementation

Standalone and runnable. Dependencies: `numpy`, `pandas`, `scikit-learn`.

```python
import numpy as np
import pandas as pd

# ------------------------------------------------------------------
# Score functions
# ------------------------------------------------------------------

def abs_residuals(y, yhat):
    """Simplest valid score. Symmetric, hence a symmetric interval."""
    return np.abs(np.asarray(y) - np.asarray(yhat))


def cqr_scores(y, lo, hi):
    """Conformalised quantile regression score (Romano et al. 2019).
    Built from the candidate interval, so width adapts to local difficulty.
    <= 0 means the candidate interval already covered."""
    y, lo, hi = np.asarray(y), np.asarray(lo), np.asarray(hi)
    return np.maximum(lo - y, y - hi)


def normalised_scores(y, yhat, sigma):
    """Localised split conformal. sigma = local difficulty estimate."""
    return abs_residuals(y, yhat) / np.asarray(sigma)


# ------------------------------------------------------------------
# Quantile with the finite-sample correction  (the part people get wrong)
# ------------------------------------------------------------------

def conformal_quantile(scores, alpha):
    """The ceil((n+1)(1-alpha)) / n empirical quantile.
    Not np.quantile(scores, 1-alpha) -- that does not give the nominal guarantee."""
    scores = np.sort(np.asarray(scores))
    n = len(scores)
    k = int(np.ceil((n + 1) * (1 - alpha)))
    return scores[min(max(k, 1), n) - 1]
```

### 7.1 Split and CQR — the static methods

```python
def split_conformal(y_cal, pred_cal, pred_test, alpha=0.1):
    q = conformal_quantile(abs_residuals(y_cal, pred_cal), alpha)
    return (pred_test - q, pred_test + q), q


def cqr_conformal(y_cal, lo_cal, hi_cal, lo_test, hi_test, alpha=0.1):
    q = conformal_quantile(cqr_scores(y_cal, lo_cal, hi_cal), alpha)
    return (lo_test - q, hi_test + q), q


def normalised_conformal(y_cal, pred_cal, pred_test, sigma_cal, sigma_test, alpha=0.1):
    q = conformal_quantile(normalised_scores(y_cal, pred_cal, sigma_cal), alpha)
    return (pred_test - q * sigma_test, pred_test + q * sigma_test), q
```

### 7.2 ACI — canonical (updates `α`, not width)

```python
def aci(y_test, pred_test, cal_scores, alpha=0.1, gamma=0.005):
    """
    Gibbs & Candes (2021), arXiv:2106.00170.
    Updates the effective miscoverage level online; the quantile follows.

    NOTE: this is the alpha-parametrisation. There is also a
    width-parametrisation (update the width directly). They are not identical --
    make sure you know which one you implemented.
    """
    a_t = float(alpha)
    lo, hi = np.empty(len(y_test)), np.empty(len(y_test))

    for t, (pt, yt) in enumerate(zip(pred_test, y_test)):
        # 1. build the interval at the CURRENT alpha ...
        #    conformal_quantile(s, a) already returns the (1 - a) quantile,
        #    so pass a_t directly. Passing 1 - a_t here silently selects the
        #    LOWER tail and collapses every interval to near-zero width.
        q = conformal_quantile(cal_scores, a_t)
        lo[t], hi[t] = pt - q, pt + q

        # 2. ... THEN update using the error we just observed
        err = 0.0 if lo[t] <= yt <= hi[t] else 1.0
        a_t = float(np.clip(a_t + gamma * (alpha - err), 1e-4, 0.5))

    return lo, hi


def agaci(y_test, pred_test, cal_scores, alpha=0.1,
          gammas=(0.001, 0.005, 0.01, 0.05, 0.1), eta=0.05):
    """
    Zaffran et al. (2022), arXiv:2202.07282.
    Mixture of ACI experts at several learning rates, aggregated by
    exponential weights. Removes the one free parameter (gamma).
    """
    n = len(y_test)
    K = len(gammas)
    lo_a = np.empty((K, n))
    hi_a = np.empty((K, n))
    W = np.ones(K) / K

    a_state = np.full(K, float(alpha))        # each expert runs its own alpha
    for t, (pt, yt) in enumerate(zip(pred_test, y_test)):
        for k, g in enumerate(gammas):
            q = conformal_quantile(cal_scores, a_state[k])
            lo_a[k, t], hi_a[k, t] = pt - q, pt + q
            err = 0.0 if lo_a[k, t] <= yt <= hi_a[k, t] else 1.0
            a_state[k] = float(np.clip(a_state[k] + g * (alpha - err), 1e-4, 0.5))

        # online expert aggregation: favour experts whose alpha stayed near target
        if t + 1 < n:
            losses = np.abs(a_state - alpha)
            W = W * np.exp(-eta * losses)
            W = W / W.sum()

    return W @ lo_a, W @ hi_a
```

> **Read the `AgACI` aggregation with care.** The code above is a faithful skeleton of the
> algorithm, but the expert-aggregation step in the paper is more carefully specified than a
> running weighted average of interval endpoints. For publication-grade results, use the
> authors' released implementation rather than this. It is here to make the *mechanism* legible.

### 7.3 EnbPI — bootstrap ensemble, sequential

```python
def enbpi(y, ensemble_predictions, alpha=0.1):
    """
    Xu & Xie (2021), PMLR 139.
    ensemble_predictions: array (T, B) of in-sample (fitted) forecasts from B
                          bootstrap ensemble members, shape-matched to y.
    Returns sequential intervals for the WHOLE series, using all past residuals.
    """
    y = np.asarray(y, dtype=float)
    E = np.asarray(ensemble_predictions, dtype=float)      # (T, B)
    T, B = E.shape

    # score: mean absolute residual across ensemble members
    s = np.abs(y[:, None] - E).mean(axis=1)

    lo = np.empty(T)
    hi = np.empty(T)
    for t in range(T):
        # prediction for t is the ensemble MEAN
        yhat_t = E[t].mean()
        # calibrate on residuals available BEFORE t only
        q = conformal_quantile(s[:t], alpha) if t > 0 else 0.0
        lo[t], hi[t] = yhat_t - q, yhat_t + q
    return lo, hi
```

> **No split needed** — that is the point. But note the loop uses `s[:t]`, so the calibration
> set grows one observation at a time and the first interval has nothing to calibrate on. In
> practice you burn the first `n_init` observations as warm-up, exactly as the paper does.

### 7.4 SPCI — conditional quantile of residuals

```python
def spci(y_test, pred_test, halflife=168, alpha=0.1):
    """
    Xu & Xie (2023), PMLR 202202.
    Models the CONDITIONAL quantile of |residual| given recent residual values,
    rather than one global quantile.

    Implementation note: the paper fits an online quantile regression on lagged
    residuals. Below is an exponentially-weighted quantile surrogate -- same
    mechanism (adaptive re-estimation of the residual quantile), much simpler.
    For the paper's exact estimator see their code.
    """
    n = len(y_test)
    lo = np.empty(n)
    hi = np.empty(n)
    history = []

    for t in range(n):
        if len(history) < 20:
            # warm-up: fall back to the empirical quantile
            q = conformal_quantile(history, alpha) if history else 0.0
        else:
            # exponential weights -> recent residuals dominate
            w = halflife ** (-np.arange(len(history) - 1, -1, -1) / halflife)
            order = np.argsort(history)
            ws, hs = w[order], np.asarray(history)[order]
            cw = np.cumsum(ws) / ws.sum()
            q = hs[np.searchsorted(cw, 1 - alpha)]

        lo[t], hi[t] = pred_test[t] - q, pred_test[t] + q
        history.append(abs(y_test[t] - pred_test[t]))

    return lo, hi
```

> **The `halflife` parameter is a modelling choice, not a tuned one.** It encodes "residuals
> from this many periods ago are half as informative." `168` = one week. On a series with
> strong seasonality you may want it to align with the seasonal period; on a stationary series a
> long `halflife` degenerates to split conformal. **There is no guarantee covering this
> surrogate** — SPCI's asymptotic conditional guarantee attaches to the paper's estimator.

---

## 8. Evaluating the output

An interval is only worth what its coverage *and* its sharpness say together.

```python
def coverage_report(y, lo, hi, by=None, label=""):
    """Coverage + sharpness, optionally stratified. This is the H4 test."""
    y, lo, hi = np.asarray(y), np.asarray(lo), np.asarray(hi)
    inside = (y >= lo) & (y <= hi)
    width = hi - lo

    out = {
        "label": label,
        "coverage": float(inside.mean()),
        "mean_width": float(width.mean()),
        "max_width": float(width.max()),
    }

    if by is not None:
        by = np.asarray(by)
        out["strata"] = {
            k: float(inside[by == k].mean())
            for k in np.unique(by)
        }
        out["worst_stratum"] = min(out["strata"].values())
    return out
```

```python
rep = coverage_report(
    y_test, split_lo, split_hi,
    by=np.asarray(hour_of_week),          # 0..167
    label="split conformal",
)
print(rep["coverage"], rep["strata"])
```

The three numbers that matter:

| Metric | Question | Warning |
|---|---|---|
| **Coverage** | Is the rate right? | Never report alone — trivial to inflate |
| **Mean width** | Is it sharp? | Width is meaningless at the wrong coverage |
| **Worst-stratum coverage** | Does it hold where it matters? | **This is H4.** |

### 8.1 This reproduces — and it is worth reproducing deliberately

The §7 code, run against a synthetic hourly count series (weekly + daily seasonality, AR(1)
residuals, a consistent refit-at-every-origin forecaster), at nominal `α = 0.10`:

```
split : coverage=0.926  mean_width= 21.18  worst_stratum(168 hours)=0.000
aci   : coverage=0.911  mean_width= 20.13  worst_stratum=0.000
spci  : coverage=0.875  mean_width= 19.37  worst_stratum=0.000

marginal coverage        : 0.926      <- correct, exactly as advertised
mean coverage, quiet hrs : 0.896
mean coverage, peak  hrs : 0.979
WORST of 168 strata      : 0.000      <- and useless at specific hours
```

Two things to take from this.

**Split conformal delivers its marginal guarantee** — 0.926 against nominal 0.90, slightly
conservative, which is what the finite-sample correction implies.

**And the H4 failure appears anyway.** Marginal coverage correct to within 2 points, while the
worst hour-of-week stratum sits at exactly zero. This is not a bug and not a tuning failure —
it is §4 and §5 happening exactly as described. SPCI's width advantage at matched coverage is
also visible (19.37 vs 21.18), consistent with Xu & Xie's reported reduction.

That is the shape of the result the real study should expect to find. **Build it into the
protocol before the data arrives**, not as a surprise afterwards.

> ### ⚠️ Report coverage **and** sharpness, always together
>
> An interval of `[−∞, +∞]` has perfect coverage. Coverage reported without sharpness is not
> a result, it is a tautology. See [[Model Validation Strategies]] §9.
>
> The complementary score is **WIS** (weighted interval score), which summarises a whole
> quantile set in one number and is properly rewarded for being sharp — see
> [[Count Distributions and Kolassa Evaluation]] §4.

**Testing coverage formally.** Botchkarev (2018)
🔗 [IJIKM](https://www.ijikm.org/Volume14/IJIKMv14p045-076Botchkarev5064.pdf) gives the
Kolmogorov–Smirnov–style test with the sample-size dependence handled properly — use this
rather than eyeballing a binomial proportion, which is badly calibrated at the `n` you will
realistically have.

---

## 9. Failure modes

| Failure | Consequence | Prevention |
|---|---|---|
| Calibrating on the test set | Guarantee void; coverage is a fiction | Three-way split, frozen |
| `np.quantile(scores, 1−α)` | No nominal guarantee | `conformal_quantile()` |
| Reporting coverage without width | Infinitely wide intervals "win" | Always both |
| Marginal coverage only | Perfect average, useless at peaks | Stratify — this is H4 |
| Splitting inside a forecast block | Model sees part of its own future | Split on week boundaries |
| Updating ACI **before** recording the interval | Current obs leaks into its own interval | Record, then update |
| Small `n_cal` | Valid but wildly unstable | Budget the block deliberately |
| Assuming ACI gives per-step coverage | Wrong claim; it is time-averaged | Say "time-averaged" |
| Wrapping a bad forecaster | Honest intervals about a bad forecast | Fix `f̂` first |
| Forgetting counts cannot go negative | `[−3, 12]` for a call count | See [[Count Distributions and Kolassa Evaluation]] |
| Same calibration used for anomaly detection *and* intervals | Double-dipping inflates both | [[Time Series Anomaly Detection]] §4 |

> **Free anomaly detection.** The nonconformity score **is** a detection statistic — flag when
> the test score exceeds the calibration quantile. No extra machinery. But a fixed absolute
> threshold fires wherever the baseline is low, so alarms concentrate in quiet overnight hours:
> normalise by an expected-variance model conditioned on hour-of-week, or work on a
> Negative-Binomial scale. This is developed in [[Time Series Anomaly Detection]] §4 and
> implemented in [[Practice 04]] §9.

---

## 10. Why this matters here

Three connections into the rest of the vault, in descending order of how much they change what
you do.

**1. The vendor question is a quantile question, not a point question.**
[[Staffing_Forecasting_Experiment]] §3 makes the argument that the vendor's error is returning
a point estimate where the operationally correct answer is an upper quantile. Conformal is the
instrument that exposes that gap — you cannot evaluate "how much under-provisioned am I at
peak?" against a point forecast that is missing its own uncertainty.

**2. The H4 crux is a conditional-coverage question and only that.**
Marginal-vs-conditional (§4) is not a detail of the conformal layer; it is the project's
central hypothesis. Test it directly, stratify by hour-of-week *and* volume decile *and*
whole-day blocks, and treat a null result as a contribution rather than a failure.

**3. Conformal is a wrapper — it does not compete with generative forecasting.**
[[Generative and Probabilistic Forecasting]] §1 makes the complementary point: a
conformally-wrapped point forecast inherits the point forecast's error structure and cannot
represent multimodality. If tomorrow's volume is genuinely bimodal — quiet *or* festival
surge — no conformal wrapper will reveal it, because the wrapper only calibrates a central
tendency. Conformal and generative forecasting answer different questions and both belong in a
serious stack.

---

## 11. Honest gaps

| Item | Status |
|---|---|
| **Exact conditional coverage** | Impossible universally without assumptions — Gibbs & Candès. Over finite pre-specified strata it is achievable and exact. §5 |
| **SPCI's guarantee does not transfer** | Asymptotic, and attaches to the paper's estimator — not to the EW surrogate in §7.4 |
| **The choice of `γ` in ACI** | Dominates practical behaviour; AgACI addresses it but adds its own `η` |
| **Strong mixing** | EnbPI's assumption. Fails for long-memory series, and long memory is common in counts. **Now testable** — generate fBm at `H > 0.5` and EnbPI should fail visibly. See [[Nixtlaverse]] §4 |
| **Peak coverage on real call-volume data** | Untested in this vault. This is the open experiment — and the *reason* is label availability, which §12 addresses |
| **Joint coverage across a 168-hour block** | Addressed by ConForME, not evaluated here |
| **Which base `f̂` to wrap** | Largely orthogonal, but EnbPI *requires* a bootstrap ensemble |

---

## 12. Getting ground truth — the instrument this vault was missing

> Added 2026-10-16. The rows above kept saying "untested" and "unresolved", and the reason was
> never stated plainly: **you cannot test conditional coverage without knowing where the peaks
> are.** Real call-volume data has no labels for that. That is why §8.1 uses a hand-built
> synthetic series, and why the 168-point study cannot currently answer H4.

**`synforecast`** (Nixtla, alpha, Apache-2.0) closes the gap for the cases that are closable. 🔗
https://github.com/Nixtla/synforecast — see [[Nixtlaverse]] §4 for the full generator map.

| Question you cannot answer on real data | Generator | What it gives you |
|---|---|---|
| Does SPCI actually fix peak coverage? | `RegimeSwitching`, `Seasonal` | Known regime and peak boundaries; coverage measured *inside* them |
| Does ACI hold up under real drift? | `RegimeSwitching` | Regime labels, so you can check the transition windows specifically |
| Does EnbPI's mixing assumption hold? | `FractionalBrownianMotion` at `H = 0.8` | Long memory by construction — the assumption should fail |
| Is coverage right at genuine counts? | `INAR`, `HawkesProcess`, `PoissonProcess` | Integer counts; **Hawkes models the self-excitation that 9-1-1 volume actually has** |
| Are intervals sharp enough to be useful? | `Seasonal` + `GARCH` | Heteroscedasticity on demand |

```python
from synforecast.generators import RegimeSwitchingGenerator

P = ((0.97, 0.03),      # calm -> busy
     (0.08, 0.92))      # busy  -> calm

gen = RegimeSwitchingGenerator(
    min_length=168*20, max_length=168*20, freq="h",
    n_regimes=2, regime_means=[30.0, 90.0],
    transition_matrix=P, seed=42,
)
df, regimes, ids = gen.generate_with_regimes(n_series=50)   # regimes = ground truth
# df is [unique_id, ds, y] -- feeds conformalforecast / StatsForecast unchanged
```

> ### ⚠️ The circularity, stated plainly
>
> Synthetic data only rewards methods whose assumptions match the generator. If you build a
> series from a Markov regime-switching AR(1) and then report that your ARIMA does well, you
> have learned nothing about the world — only that the generator was kind to ARIMA.
>
> This is why the *"when does synthetic data help"* guide exists, and why Nixtla publishes
> **negative** results in it. Use synthetic data to test a **specific hypothesis about coverage
> behaviour under a known structure**, not to rank methods. The ranking still has to happen on
> real data.
>
> And the honest framing from [[Time Series Anomaly Detection]] §3 applies here: **injecting
> into real data beats generating it wholesale.** SynForecast's injection API does that — use it
> rather than pure generation wherever you have a real panel to perturb.

---

## References

> All links below verified 2026-10-16. Three citations circulating elsewhere in this vault are
> **wrong** — see the note at the end.

**Foundations**
1. Vovk, V., Gammerman, A. & Shafer, G. (2005). *Algorithmic Learning in a Random World*. 🔗 https://doi.org/10.1007/0-387-25040-6
2. Lei, J., G'Sell, M., Rinaldo, A., Tibshirani, R. J. & Wasserman, L. (2018). Distribution-free predictive inference for regression. *JASA* 113(523), 1094–1111. 🔗 https://arxiv.org/abs/1604.04173
3. Romano, Y., Patterson, E. & Candès, E. (2019). Conformalized quantile regression. *NeurIPS 2019*. 🔗 https://arxiv.org/abs/1905.03222

**Adaptation to drift**
4. Gibbs, I. & Candès, E. (2021). Adaptive conformal inference under distribution shift. *NeurIPS 2021*, 34, 1660–1672. 🔗 https://arxiv.org/abs/2106.00170
5. Zaffran, M., Dieuleveut, A., Féron, O., Goude, Y. & Josse, J. (2022). Adaptive conformal predictions for time series. 🔗 https://arxiv.org/abs/2202.07282

**Time series specifically**
6. Xu, C. & Xie, Y. (2021). Conformal prediction interval for dynamic time-series (**EnbPI**). *ICML 2021*, PMLR 139, 11559–11569. 🔗 https://proceedings.mlr.press/v139/xu21h.html
7. Xu, C. & Xie, Y. (2023). Sequential predictive conformal inference for time series (**SPCI**). *ICML 2023*, PMLR 202, 38707–38727. 🔗 https://proceedings.mlr.press/v202/xu23r.html
8. Stankevičiūtė, S., Alaa, A. M. & van der Schaar, M. (2021). Conformal time-series forecasting (**CF-RNN**). *NeurIPS 2021*. 🔗 https://proceedings.neurips.cc/paper/2021/file/312f1ba2a72318edaaa995a67835fad5-Paper.pdf
9. Galvão Lopes, A., Goubault, E., Putot, S. & Pautet, L. (2024). ConForME: multi-horizon conditional conformal time series forecasting. *CoPP 2024*, PMLR 230, 345–365. 🔗 https://proceedings.mlr.press/v230/galvao-lopes24a.html

**Theoretical limits**
10. Gibbs, I., Cherian, J. J. & Candès, E. (2023). Conformal prediction with conditional guarantees. 🔗 https://arxiv.org/abs/2305.12616
11. Vovk, V. (2012). Conditional validity of inductive conformal predictors. *ACML 2012*. 🔗 https://arxiv.org/abs/1202.0228

**Tools**
12. Cordier, T., Blot, V., Lacombe, L., Morzadec, T., Capitaine, A. & Brunel, N. (2023). Flexible and systematic uncertainty estimation with conformal prediction via the MAPIE library. 🔗 https://arxiv.org/abs/2207.12274
    Docs: 🔗 https://mapie.readthedocs.io/en/stable/

**Adjacent**
13. Hyndman, R.J. & Athanasopoulos, G. (2021). *FPP3* §5.8. 🔗 https://otexts.com/fpp3/prediction-intervals.html

---

## ✅ Citation errors found in other vault notes — repaired 2026-10-16

Found while verifying the references above. **All repaired**; this table is kept as a record.

| Was | Actually pointed to | Repaired to | Was in |
|---|---|---|---|
| EnbPI → `arXiv:2202.02631` (Xu & Xie **2023**) | *"Study on Einstein Warped Product space with Quarter Symmetric Connection"* — **withdrawn differential geometry paper**, Pal & Kumar | `PMLR 139`, ICML **2021** | [[Practice 04]] ref 4 · [[Research/Time-Series/Time Series Paper Links]] |
| ACI → "Romano, Patterson & Candès (2020)", `arXiv:1906.00130` | *"Learning the optimally coordinated routes from the statistical mechanics of polymers"* — **traffic-flow physics** | Gibbs & Candès (2021), `arXiv:2106.00170` | [[Practice 04]] ref 3 · [[Model Validation Strategies]] §6.4 + ref 16 · [[Generative and Probabilistic Forecasting]] + ref 15 · [[Research/Time-Series/Time Series Paper Links]] |
| Gibbs & Candès conditional guarantees (2021) | Author list is **Gibbs, Cherian & Candès (2023)** | Corrected | `Staffing_Sources` §8b |
| MAPIE docs → `contrib.scikit-learn.org/MAPIE/` | **404.** Docs moved | `mapie.readthedocs.io` | [[Practice 04]] ref 7 |

The ACI error was the consequential one: it conflated the CQR authors with a different paper
and misdated the result by a year, across **four** files. [[Research/Time-Series/Time Series Paper Links]] carried
both bad arXiv IDs and was not surfaced by the original survey — it has no cross-reference back
here, which is how a broken link survives this long.

> **Worth noting as a process failure:** every one of these was a plausible-looking arXiv ID in
> a plausible-looking citation. None looked wrong on inspection. They were only caught by
> fetching each link and reading the title. There may be others in the vault — this note only
> covers references reachable from the conformal-prediction thread.

---

## Cross-links

- [[Model Validation Strategies]] — §6.4 is the marginal-vs-conditional crux; §8 is the split protocol
- [[Practice 04 — Conformal Prediction on Hourly Counts]] — the runnable exercise
- [[Staffing_Forecasting_Experiment]] — H4, and the point-vs-quantile reframing
- [[Generative and Probabilistic Forecasting]] — the complementary approach, §1
- [[Count Distributions and Kolassa Evaluation]] — WIS, and negative-boundary handling for counts
- [[Time Series Anomaly Detection]] — §4, free detection from the same calibration
- [[Intermittent and Sparse Demand]] — conformal on intermittent series
- [[Forecasting MLOps]] — coverage monitoring and the ACI hazard in production
- [[Distribution Shift and Normalization]] — the non-stationarity conformal inherits
- [[Benchmarks and Datasets]] — M4/M5 are contaminated for TSFM intervals
- [[168-Point Forecast Comparison - Discrete vs Continuous]] — the project these notes serve