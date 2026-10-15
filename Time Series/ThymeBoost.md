---
type: reference
status: active
topic: "ThymeBoost — a Python library that runs gradient boosting over a time series decomposition (trend → seasonality → exogenous) instead of over engineered features."
created: 2026-10-15
tags:
  - time-series
  - forecasting
  - gradient-boosting
  - decomposition
  - changepoints
  - python
  - frameworks
aliases:
  - Thyme Boost
  - thymeboost
---

# ThymeBoost

A small, MIT-licensed Python library whose entire premise is that **the thing you should be
boosting is the decomposition, not a feature matrix.** You pick a trend estimator, a
seasonality estimator, and an exogenous estimator; it fits them sequentially onto residuals
until a penalized cost stops improving.

- **Docs** — 🔗 https://thymeboost.readthedocs.io/en/latest/ (thin — mostly an autodoc dump of
  class signatures, half of them with `DESCRIPTION.` left as a placeholder)
- **GitHub** — 🔗 https://github.com/tblume1992/ThymeBoost · MIT · 198 stars · 7 open issues
- **PyPI** — `pip install ThymeBoost` · latest release **0.1.18, 4 Jan 2024** (26 releases since
  Apr 2021)
- **Repo `main` branch** — last push 11 Jan 2026, HEAD commit *"Update for Pandas 2.0"*
- **Author** — Tim Blume; a single-maintainer project
- **Examples** — four notebooks in `/Examples`, including a linear-changepoint model and an
  M4 run

> **⚠️ Maintenance status, read this first.** `main` is roughly **two years ahead of the last
> PyPI release**, and the version number is declared in three places that disagree
> (`setup.py` says `0.1.16`, the class attribute says `0.1.15`, PyPI has `0.1.18`). There are
> **no Git tags and no releases** at all. The README's own closing line: *"Logging and error
> handling is still basic to non-existent."* Treat this as a readable and forkable reference
> implementation, not as a dependency you adopt. There is no test suite worth the name, no
> `python_requires` constraint, and 13 committed `__pycache__/*.cpython-37.pyc` files.

---

## 1. Why it is worth reading even if you never install it

This is the only library in the vault's forecasting stack where **boosting operates on the
components**. Every other GBDT option in [[resources]] §3.6 and
[[time-series-forecasting-models]] §3 — XGBoost, LightGBM, CatBoost — boosts over an
*engineered feature matrix* built from lags, calendar fields, and exogenous drivers. ThymeBoost
boosts over a *structural decomposition*:

```
boosting round k:   fit trend_k on residual → subtract
                    fit seasonal_k on residual → subtract
                    fit exo_k on residual → subtract
                    ŷ_k = Σ(trend) + Σ(seasonal) + Σ(exo)
```

That difference is the whole contribution, and it maps exactly onto the two gaps it exposed in
this folder: [[Time Series Decomposition]] and [[Gradient Boosting for Time Series]]. Read it as
a worked example of both.

---

## 2. The algorithm

### 2.1 Round 0 is special and always is

The first round **cannot** be changed by your parameters. It is hard-coded: `fit_type='global'`,
`split_cost='mse'`, `trend_lr=1`, and the trend estimator comes from **`init_trend` (default
`'median'`)** — *not* from `trend_estimator`. This is Friedman's weak-initial-estimator
convention, and it is why `trend_estimator=['mean'] + ['linear']*20` gives you
`median → mean → linear → linear → …`.

Every round then runs **trend → seasonality → exogenous, in that fixed order**, and components are
always summed, never multiplied.

### 2.2 Generator parameters

Every keyword passed to `fit()` is wrapped in an `itertools.cycle`. **A list means "use a
different value each boosting round."** The generators advance *after* the trend fit and
*before* the seasonality/exogenous fits.

```python
output = model.fit(
    y,
    trend_estimator=['mean'] + ['linear'] * 20,   # round 0 uses init_trend, then mean, then linear
    seasonal_estimator='fourier',
    seasonal_period=[25, 0],                     # alternate seasonal / no seasonal each round
    connectivity_constraint=[False] + [True]*10, # allow one level jump, then require continuity
    split_cost='mae',
    global_cost='maicc',
    fit_type='local',
)
```

This is the most interesting design idea in the library. It lets you express a **structured
boosting schedule** declaratively: fit a mean once to absorb the level, then fit straight lines
for the remainder, alternating seasonal periods on and off. It has no analogue in the feature-based
GBDT world, because there the base learner is always the same shape.

### 2.3 Changepoints are binary segmentation, one per round

With `fit_type='local'`, each round searches for **exactly one** split point on the current
residual, then refits the trend independently on `y[:i]` and `y[i:]`, and scores the pair with
`split_cost`. Because the next round refits on what is left, breakpoints **accumulate across
rounds** — recursive binary segmentation implemented as boosting.

| Control | Default | Effect |
|---|---|---|
| `fit_type` | `'global'` | `'local'` searches a changepoint per round; `'global'` fits once on the whole residual |
| `approximate_splits` | `True` | `False` = exhaustive search over every eligible index |
| `n_split_proposals` | `10` | Top-*n* largest \|gradient\| candidates — **only used by the `'gradient'` strategy** |
| `split_strategy` | `'gradient'` | `'gradient'` or `'histogram'`. **Any other value raises `UnboundLocalError`** |
| `connectivity_constraint` | `True` | `True` = right segment anchored to the left's last value (slope change only); `False` = own intercept (level jump allowed) |
| `smoothed_trend` | `False` | Savitzky–Golay filter over the fitted trend to remove kinks |
| `min_sample_pct` | `.01` | Floor on segment length as a fraction of *n* |

> **`connectivity_constraint` is the parameter that decides whether you can model a
> discontinuity at all.** A changepoint model that enforces continuity literally cannot represent
> a sudden level shift — which is exactly the shape a PSAP system change or a policy change
> makes in call volume. This is a real, concrete reason the library is worth reading even if you
> do not adopt it.

### 2.4 Cost functions and termination

Two separate costs, with different jobs:

| `split_cost` | Formula | Used for |
|---|---|---|
| `'mse'` | `mean((y − concat(fit1, fit2))²)` | Scoring a candidate changepoint |
| `'mae'` | `mean(|y − concat(fit1, fit2)|)` | Same; less outlier-sensitive |
| `'entropy'` | `scipy.stats.entropy(resid + min(resid) + 1)` | Same |

| `global_cost` | Formula | Used for |
|---|---|---|
| `'maic'` | `2·c^r + n·log(SSE/n)` | Deciding whether to keep boosting |
| `'maicc'` | `(2c² + 2c)/max(1, n−c−1) + 2·c^r + n·log(SSE/n)` | Same, small-sample corrected |
| `'mbic'` | `n·log(SSE/n) + c^r·log(n)` | Same |
| `'mse'` | `mean((y − ŷ)²)` | **No complexity penalty at all** |

`c` is the complexity, `r` is `regularization` (constructor default **1.2**), used purely as an
**exponent on `c`**. Bigger `c` → penalty explodes → earlier stopping.

The termination rule is the part worth internalising:

```python
if (round_cost <= self.cost and self.n_rounds == -1) or self.i < self.n_rounds:
    accept          # and tighten the bar
    self.cost = round_cost * (1 - cost_penalty)
else:
    stop
```

- **`cost_penalty` (default `.001`)** is a **minimum relative improvement gate** — a round is
  accepted only if it beats the previous by 0.1%. This is the same idea as early stopping on a
  patience counter, and it is the parameter to reach for first.
- **`n_rounds`** — **if you set it, cost is ignored entirely.** Rounds are force-accepted even
  when the cost goes *up*. The README demonstrates this deliberately (an ARIMA order ladder where
  cost rises in round 3 and is accepted anyway). Know this before you set it, or you will
  convince yourself a bad model is good.
- The README's suggested alternative to `n_rounds` is raising `regularization`.

> **A caveat that matters for interpretation:** in `get_complexity`, the seasonality complexity
> term is added under a condition (`seasonal_period != 0 and not None`) that is **always false**,
> and the ARIMA complexity branch tests for an estimator string `'ar'` that is never registered.
> Both branches are dead. So the complexity penalties in `maicc`/`mbic` are **systematically
> understated** for series with seasonality and for ARIMA. Do not read the reported cost as a
> real AIC.

---

## 3. Model inventory

### Trend estimators — 23 registered strings

| String | What it does |
|---|---|
| `'mean'` / `'median'` | Constant level. `'median'` is the default `init_trend` |
| `'linear'` | OLS / ridge / WLS polynomial via `pinv`. Supports `poly`, `l2`, `trend_weights`. Extrapolates on the last slope |
| `'ses'` / `'des'` / `'damped_des'` | statsmodels `SimpleExpSmoothing` / `Holt` / damped `Holt` |
| `'arima'` | statsmodels `ARIMA`, or pmdarima `auto_arima` when `arima_order='auto'` |
| `'loess'` | Savitzky–Golay filter; extrapolates linearly off the last slope |
| `'ewm'` | pandas `.ewm(alpha=ewm_alpha).mean()` |
| `'ransac'` | sklearn `RANSACRegressor` — outlier-robust to a level shift |
| `'moving_average'` | Rolling mean, backfilled |
| `'zero'` | Returns zeros — the trick for skipping detrending so seasonality gets the raw signal |
| `'svr'` | sklearn `SVR(rbf)` with a hard-coded inner `GridSearchCV` |
| `'naive'` | Random walk |
| `'croston'` | Croston / SBF intermittent-demand smoother |
| `'decision_tree'` | sklearn `DecisionTreeRegressor(max_depth=tree_depth)` |
| `'lbf'` | **New in 0.1.16.** Linear basis-function changepoint basis + Lasso. "A linear changepoint method with a similar vibe to Prophet" |
| `'fast_arima'`, `'fast_ets'`, `'fast_ses'`, `'fast_ces'`, `'fast_theta'`, `'fast_imapa'` | statsforecast-backed versions. **Require `statsforecast`, which is an undeclared optional dependency** |

> `'theta'` **is not registered**, despite `theta_trend.py` existing in the tree. Passing it
> raises `NotImplementedError`.

### Seasonality — 3 estimators

| String | What it does |
|---|---|
| `'fourier'` | Least squares on a `cos`/`sin` basis, `fourier_order` terms (default 10). Optional WLS via `seasonality_weights` |
| `'classic'` | Seasonal averages: `avg[i::m]` tiled |
| `'naive'` | Seasonal naive — last full season carried forward |

> A list-valued `seasonality_weights` **breaks Fourier seasonality** — the handling branch
> references a non-existent attribute and is also missing its `return`, so it raises.

### Exogenous — 3 estimators

`'ols'` (default), `'glm'`, `'decision_tree'` — all fit jointly against the round residual
*after* trend and seasonality have been removed.

> **There is no forecasting of exogenous drivers.** `predict_exogenous` returns zeros when
> `future_exogenous is None`. If you pass future exogenous values they must be exactly
> `forecast_horizon` long. And because exogenous is fit on the residual *after* seasonality,
> **your seasonality choice silently changes what the exogenous model sees** — that is exactly
> the leakage-adjacent coupling flagged in [[Nixtlaverse]] §3. Use `seasonality_lr` to
> deliberately leave signal for the exogenous block.

---

## 4. Optimization and ensembling

```python
output = model.optimize(
    y, lag=20, optimization_steps=1,
    trend_estimator=['mean', 'linear', ['mean', 'linear']],   # list-in-list = generator
    seasonal_period=[0, 25],
    fit_type=['local', 'global'],
)
```

- **All fit parameters must be passed as lists** under `optimize()`. The search space is the
  Cartesian product; a hard-coded default space (`trend_estimator=['mean','median','linear']`,
  `fit_type=['local','global']`, `seasonal_period=[None]`) is merged in first, so **if you do not
  pass `fit_type`, both values get searched anyway**.
- `lag` is both the holdout size and the number of forecast points scored.
  `optimization_steps` rolls the cutoff forward.
  `optimization_strategy` is `'rolling'` (expand and move), `'cv'`, or `'holdout'` (forces
  `optimization_steps=1`).
- **Selection is argmin of the mean error across steps, then a refit on the full series.**
  Any candidate that raises is silently scored `np.inf`.
- `ensemble()` runs every combination and takes a **plain unweighted mean of every output
  column** — including the actuals and the interval bounds. It has **no default search space**;
  you must pass every list yourself.
- `combine([...])` wraps a parameter list so the optimizer treats it as one ensembled candidate
  rather than something to iterate. Its presence flips the **whole run** to ensemble mode.
- `optimization_type` is stored and **never read**. The docstring says
  *"only 'grid_search' is implemented. TODO: add bayesian optimization."*
  (`utils/hyperoptimizer.py` exists but is 100% commented out.)

> **The optimizer's selection procedure is exactly the thing your validation note warns
> against.** See [[Model Validation Strategies]] §2 — a single winning configuration chosen by
> in-sample-ish holdout scoring is a tuned model, and the reported holdout score is optimistic.
> If you use `optimize()` as anything other than a hyperparameter *proposal* generator, you must
> score the returned model on a **third** split it never saw.

---

## 5. Assessment

**Strengths**

- **The concept is genuinely good.** Structural boosting on components is the natural way to
  combine "these are different kinds of signal, fit them in a sensible order" with boosting's
  capacity for non-linear refinement.
- **Component-specific learning rates.** `trend_lr` / `seasonality_lr` / `exogenous_lr` let you
  control how aggressively each block competes. Genuinely useful when a seasonal signal is
  soaking up exogenous variation.
- **Generator parameters** are an elegant, undocumented-in-the-docs mechanism.
- **Mixed global/local fitting** in one model — something neither ETS, ARIMA, nor Prophet offers.
- Decomposition plots (`plot_components`) are a real diagnostic, and the split log under
  `verbose=1` makes it auditable.
- MIT, tiny dependency footprint, readable source.

**Weaknesses and cautions**

- **Single series only.** Everything is coerced to 1-D. No panel, no grouped API, no
  cross-series information sharing. For a multi-jurisdiction problem this is disqualifying on its
  own.
- **Multiplicative decomposition is disabled.** `multiplicative_fit()` literally raises
  `ValueError('Multiplicative Seasonality is not enabled!')`. `fit(additive=False)` only sets a log
  scale — components are still added, and `normalize()` still subtracts a mean rather than
  dividing. Series with real proportional seasonality cannot be handled.
- **Intervals are not trustworthy.** A fixed `t.ppf(.9)` ≈ 80% two-sided band, and the standard
  error is computed as `Σ(y − mean(fitted))²` — which measures series *level* variance, not
  residual error. Almost certainly a bug. **Do not ship these bands**; wrap in conformal instead
  ([[Model Validation Strategies]] §6).
- **`trend_lr` silently does not affect forecasts** — model params are captured before the
  learning rate is applied, so the extrapolated trend ignores it (in-sample trend does not).
- **Code quality is mixed.** Dead `theta` model, `arima_order='auto'` broken by a
  `supress_warnings` typo, list-valued seasonality weights raising `AttributeError`,
  `split_strategy` raising `UnboundLocalError` on any invalid value, `update()` (online
  learning) broken on the non-additive path, module-level `warnings.filterwarnings("ignore")`.
- **Documentation is a stub.** Half the autodoc docstrings read `DESCRIPTION.`

---

## 6. Try it

- [ ] Read `ThymeBoost/fitter/decompose.py::additive_boost_round` — it is ~30 lines and is the
      entire algorithm
- [ ] Reproduce the README's three-stage changepoint example and confirm the split log matches
      `None → 200 → 174 → 274`
- [ ] Set `fit_type='local'` with `approximate_splits=False` on a ~1000-point series and time it
      against `True` — the cost is `n` refits per round
- [ ] Deliberately set `n_rounds` high and watch the cost *increase* while rounds are accepted —
      then confirm `cost_penalty` prevents that when it is unset
- [ ] Fit with `connectivity_constraint=False` on a series with a known level shift and compare
      against a changepoint model that keeps it `True`
- [ ] Try `'lbf'` (the Prophet-style linear changepoint basis) and compare its trend fit against
      `fit_type='local', trend_estimator='linear'` on the same data
- [ ] **For the 9-1-1 question:** feed it hourly counts with `seasonal_period=168` and check
      whether the changepoint mechanism finds anything at an event-calendar boundary that a plain
      ETS + Fourier fit misses

## References

1. Blume, T. *Forecasting with Gradient Boosted Time Series Decomposition.* 🔗
   https://github.com/tblume1992/ThymeBoost — MIT, 198 stars
2. ThymeBoost documentation. 🔗 https://thymeboost.readthedocs.io/en/latest/
3. Friedman, J.H. (2001). Greedy function approximation: a gradient boosting machine. *Annals of
   Statistics* 29(5). 🔗 https://doi.org/10.1214/aos/1013203451 — the algorithm this follows
4. Hyndman, R.J. & Khandakar, Y. (2008). Automatic time series forecasting: the `forecast`
   package for R. *JSS* 27(3). 🔗 https://robjhyndman.com/papers/forecast.pdf — `autofit()`'s
   AIC/AICc/BIC predecessors
5. Taylor, S.J. & Letham, B. (2018). Forecasting at scale. *The American Statistician* 72(1). 🔗
   https://peerj.com/articles/cs-143/ — the changepoint-as-basis-function idea `'lbf'` mimics

## Cross-links

- [[Gradient Boosting for Time Series]] — the algorithm underneath, properly treated
- [[Time Series Decomposition]] — the other half of the idea
- [[time-series-forecasting-models]] §2 and §3 — where this sits in the family taxonomy
- [[Nixtlaverse]] — the ecosystem it does *not* integrate with
- [[Model Validation Strategies]] §2 — why `optimize()`'s selection rule needs a third split
- [[Time Series Forecasting Baselines]] — the floor it would have to clear
