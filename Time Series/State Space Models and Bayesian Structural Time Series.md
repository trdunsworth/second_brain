---
type: reference
status: active
topic: "Unobserved components, the Kalman filter, and Bayesian structural time series — a component grammar that expresses local trend, stochastic seasonality and time-varying regression in one model, and why weak identification is the standing problem."
created: 2026-10-15
tags:
  - time-series
  - forecasting
  - state-space
  - kalman-filter
  - bayesian
  - unobserved-components
aliases:
  - State Space Models
  - UCM
  - Kalman Filter
  - BSTS
  - Bayesian Structural Time Series
  - Structural Time Series
---

# State Space Models and Bayesian Structural Time Series

A state space model writes the series as **observed = signal + noise**, where the signal is a
latent state evolving over time. The **Unobserved Components Model (UCM)** is the specific case
where the latent state *is* a set of interpretable components.

> Written 2026-10-15. Previously **four sentences** in §1 of [[time-series-forecasting-models]] —
> *"Structural / state space. BSTS, Kalman filter, unobserved components"* — and nothing else in
> either folder. `Kalman` appeared once in the entire corpus.

---

## 1. Why this family is load-bearing here

UCM is **the only classical framework that natively expresses exactly the structure the 168-point
study is probing**:

$$
y_t = \underbrace{\ell_t}_{\text{local level}} + \underbrace{b_t}_{\text{local trend}} + \underbrace{\gamma_t}_{\text{seasonal, } s=168} + \underbrace{\beta_t^\top x_t}_{\text{regression}} + \underbrace{\epsilon_t}_{\text{irregular}}
$$

**Its seasonal component is literally a 168-dimensional stochastic seasonal.** That is the
deterministic-seasonal analogue of the partially-pooled model in
[[Hierarchical and Mixed-Effects Models for Forecasting]] — and it gives you something neither arm
of the current study has: **analytically derived predictive intervals** from a state space
representation.

| What the study needs | What UCM provides |
|---|---|
| A principled middle ground between 168 models and 1 | Seasonal component of period 168 + hour-of-week regressors |
| Calibrated intervals | Gaussian predictive distribution, derived not fitted |
| A changepoint/intervention mechanism | `intervention` component, or a local trend with a shock |
| A classical anchor for the comparison | Not a "sequence model" — a different family entirely |

> **A gap worth noting:** `AutoETS(season_length=168)` already appears in the Nixtlaverse quick-start
> ([[Nixtlaverse]] §8) but **is not in the Practice 01 baseline panel**. The study's classical arm
> is currently weaker than the vault's own example code.

---

## 2. The Kalman filter in one paragraph

Given $y_t = H_t z_t + \epsilon_t$ (observation) and $z_t = F_t z_{t-1} + \eta_t$ (state), the
filter runs recursively:

| Step | What happens |
|---|---|
| **Predict** | Propagate the state forward: $\hat z_{t|t-1} = F_t \hat z_{t-1|t-1}$ |
| **Update** | Correct using the new observation, weighted by the Kalman gain $K_t$ — the ratio of observation uncertainty to total uncertainty |
| **Smooth** | (Offline only) Use future observations to revise earlier estimates |

The gain is the whole idea: **when the observation is noisy relative to your uncertainty about the
state, trust the prior; when the opposite, trust the data.**

Three properties that matter in practice:

- **Missing data is free.** The update step is simply skipped. You do not impute; the filter
  handles gaps natively. `statsmodels` exposes this via `loglikeobs` / `score_obs`.
- **Smoothing ≠ filtering.** The smoother uses future data. **Using a smoother's output to forecast
  is leakage** — see [[Model Validation Strategies]] §1.
- **It is not linear regression.** The states are latent and evolve; a "coefficient" can drift.

---

## 3. Unobserved Components

### 3.1 The grammar

| Component | Model | Use when |
|---|---|---|
| **Local level** | $\ell_t = \ell_{t-1} + \eta_t$ | Series is a random walk around a drifting baseline |
| **Local linear trend** | $\ell_t = \ell_{t-1} + b_{t-1} + \eta_t$, $b_t = b_{t-1} + \zeta_t$ | Trend exists and changes slowly |
| **Stochastic seasonal** | $\gamma_t = -\sum_{j=1}^{s-1}\gamma_{t+1-j} + \omega_t$ | **Seasonal amplitude can change.** Sums to zero over a cycle |
| **Harmonic seasonal** | Sine/cosine pairs at $\lambda_j = 2\pi j/s$ | Seasonal shape is a fixed smooth wave |
| **Cycle** | Business-cycle-like oscillation | Slow waves between trend and seasonal |
| **Regression** | $\beta_t^\top x_t$, fixed or time-varying | Known covariates |
| **Intervention / shock** | One-off additive effect | A known event |
| **Irregular** | $\epsilon_t$ | Everything unexplained |

> **The deterministic → stochastic seasonal step is the important one.** Classical
> [[Time Series Decomposition]] treats seasonality as fixed. A **stochastic** seasonal lets the
> 168-hour profile itself evolve. For a PSAP volume series whose seasonal shape shifts after a
> policy or staffing change, that is the difference between a model that is right and one that is
> confidently stale.

### 3.2 In code

```python
from statsmodels.tsa.statespace.structural import UnobservedComponents

mod = UnobservedComponents(
    endog=y,
    level="local linear trend",
    freq_seasonal=[{"period": 168, "harmonics": 10}],   # harmonic seasonal, s=168
    autoregressive=1,
    exog=X,                    # weather, holidays, school terms
    mle_regression=False,      # recursive OLS vs joint estimation
)
res = mod.fit(disp=False)
pred = res.get_forecast(steps=168)
```

Verified from the `statsmodels` docs (v0.15.0):

- String specs: `'local level'`/`'llevel'`, `'local linear trend'`/`'lltrend'`, `'random walk with
  drift'`, `'smooth trend'`, `'deterministic trend'`, `'irregular'`
- **`freq_seasonal` is the parameter for $s = 168`** — harmonic pairs with configurable period and
  number of harmonics. Getting this wrong (using a string `seasonal=168` with a scalar) is the
  common error
- **`mle_regression=False`** puts regression coefficients in the state vector (recursive OLS) rather
  than estimating them jointly. **This is a genuine "how much do I want to borrow strength" dial**
- Initialization: stationary / known / approximate-diffuse (default) / **exact-diffuse**
  (`use_exact_diffuse=True`). Approximate-diffuse is a pragmatic default; exact-diffuse is more
  correct for long samples like yours

---

## 4. Estimation

| | Maximum likelihood | Bayesian (MCMC) |
|---|---|---|
| **Speed** | Seconds | Minutes to hours |
| **Uncertainty** | Standard errors / analytic intervals | Full posterior |
| **Identifiability** | Can be genuinely flat | Priors regularise — but also *hide* the problem |
| **Use when** | You want intervals and speed | You need a non-Gaussian likelihood, or complex priors |

> **⚠️ The standing problem: weak identification.** Two different component specifications can fit
> equally well. "Local level + fixed seasonal" and "random walk + stochastic seasonal" may be
> observationally near-equivalent. This is not a nuisance — it means **the data cannot always tell
> you which structure is right**, and a Bayesian posterior can mask it by averaging over both.
>
> **Practical consequence: do not report a component's variance as if it were a discovered fact.**
> Report it with its interval, and acknowledge the alternative specification. This is the same
> epistemic caution as [[Change-Point Detection]] §3.4 — do not report one specification with no
> sensitivity analysis.

---

## 5. Bayesian structural time series and CausalImpact

**Brodersen, K.H., Gallusser, F., Koehler, J., Remy, N. & Scott, S.L. (2015). "Inferring causal
impact using Bayesian structural time-series models." *The Annals of Applied Statistics* 9(1),
247–274.** 🔗 [10.1214/14-AOAS788](https://doi.org/10.1214/14-AOAS788) · preprint 🔗
[arXiv:1506.00356](https://arxiv.org/abs/1506.00356)

> **⚠️ Two citation corrections.** This is in ***The Annals of Applied Statistics*, not *JASA*** —
> a very common mis-citation. And **"Diehl" is not an author**; there are five: Brodersen,
> Gallusser, Koehler, Remy & Scott.

The method:

1. Fit a structural time series on the **pre-intervention** period, with local trend + seasonality +
   regressors.
2. Use it to construct the **counterfactual** — what would have happened without the intervention.
3. Compare observed post-intervention values to the counterfactual posterior.

**This is the machinery the vault needs to close the gap named in [[Change-Point Detection]] §6.**
You can currently *find* a break; BSTS is how you *say something about it*.

| Package | Version | Notes |
|---|---|---|
| `bsts` (R) | 0.9.11 | Scott. Dynamic linear models by MCMC. Supports **Poisson likelihood** — matters at low counts |
| `CausalImpact` (R) | 1.4.1 | Brodersen & Hauser (Google). Apache-2.0 🔗 https://google.github.io/CausalImpact/ |

> **⚠️ Do not cite the CRAN package `sts`** for BSTS — it is a Structural Topic & Sentiment model
> by Mankad & Chen. The package you want is **`bsts`**. Similarly, the `exKF` R package could not be
> verified on CRAN; cite **Durbin & Koopman (2012)** for the extended Kalman filter instead of
> naming a package.

---

## 6. Temporal hierarchies

**Athanasopoulos, G., Hyndman, R.J., Kourentzes, N. & Petropoulos, F. (2017). "Forecasting with
temporal hierarchies." *EJOR* 262(1), 60–74.** 🔗
[10.1016/j.ejor.2017.02.046](https://doi.org/10.1016/j.ejor.2017.02.046) · R: `thief`

> **⚠️ Two corrections.** The arXiv ID **2303.05647 is not this paper** — it is a condensed-matter
> physics paper on quantum wires. This is *EJOR* 2017 and has no arXiv preprint. And it is
> frequently attributed to *"Vincent, Hyndman & Kourentzes"*; **Vincent is not an author.**

Build a hierarchy by non-overlapping temporal aggregation (hourly → 4h → daily → weekly → monthly),
forecast at **every** level, then reconcile.

> **This paper's case study is Accident & Emergency departments** — the closest published precedent
> to temporal reconciliation in an emergency-demand setting. See
> [[Forecast Combination]] §6.3.

---

## 7. Tooling

| Tool | Status |
|---|---|
| `statsmodels.tsa.statespace` | `SARIMAX`, `UnobservedComponents`, `VARMAX`, `DynamicFactor`, `MLEModel`, `KalmanFilter`, `KalmanSmoother`, `SimulationSmoother`, `ExponentialSmoothing` |
| `bsts` / `CausalImpact` (R) | As above |
| PyMC / Stan | Custom state space; full control over the likelihood |
| `forecast::StructTS` (R 9.0.2) | `autoplot` method — the quick R route |

**Books:** Harvey (1989), 🔗 [10.1017/CBO9781107049994](https://doi.org/10.1017/CBO9781107049994) —
Ch. 2 for UCM, Ch. 3 for the filter, Ch. 5 for model selection. Durbin & Koopman (2012), OUP 2nd ed.
— the standard reference, including approximate/nonlinear methods. West & Harrison (1989), 🔗
[10.1007/978-1-4757-9365-9](https://doi.org/10.1007/978-1-4757-9365-9).

---

## 8. Assessment

**Strengths**
- **The component grammar matches the domain.** You can name "level + trend + 168-hour stochastic
  seasonal + event dummies" and have a model.
- **Analytically derived prediction intervals** — no conformal wrapper needed for the marginal case.
- Missing data handled natively; no imputation.
- **Interventions and shocks are first-class.**
- Fast under maximum likelihood; mature implementations.
- Genuinely a different family from both arms of the current study.

**Weaknesses and cautions**
- **Weak identification**, and the remedy (priors) can hide rather than solve it.
- **Gaussian on counts is misspecified at low counts.** Either model $\log(y + 0.5)$ with a Gaussian
  UCM, or use a Bayesian state space with a count likelihood (`bsts` supports Poisson). See
  [[Count Distributions and Kolassa Evaluation]].
- Frequentist maximum likelihood gives no posterior uncertainty about *which* component structure is
  right — only parameter standard errors.
- Slow and awkward for very long series or many components without care.
- **Do not use a smoothed/fitted state as a forecast input** — that is leakage, and the smoother's
  whole purpose is to use future data.

---

## 9. Try it

- [ ] Fit `UnobservedComponents(level='local linear trend', freq_seasonal=[{'period':168,
      'harmonics':10}])` on the Douglas County series. **This is the missing classical anchor for
      the study** — neither current arm is a state space model
- [ ] Compare `harmonics=10` against `harmonics=40` and against `seasonal=168` (stochastic). This
      *is* the weak-identification experiment: if all three fit similarly, you have demonstrated the
      problem rather than solved it
- [ ] Refit with `mle_regression=False` and check whether the event coefficients move — this is the
      borrow-strength dial
- [ ] Fit to `log(y+0.5)` and compare against a Poisson-likelihood `bsts` fit. Check rPIT
- [ ] Deliberately blank out 5% of the observations and confirm the filter's forecasts are
      unaffected — the missing-data claim, tested
- [ ] Run [[Change-Point Detection]] first, then add the detected break as an `intervention`
      component. Confirm the interval narrows
- [ ] Test the leakage trap: smooth the series, use the smoothed values as the model input, and
      watch the rolling-origin score improve *falsely*

## References

1. Harvey, A.C. (1989). *Forecasting, Structural Time Series Models and the Kalman Filter.*
   Cambridge University Press. 🔗 https://doi.org/10.1017/CBO9781107049994
2. Durbin, J. & Koopman, S.J. (2012). *Time Series Analysis by State Space Methods*, 2nd ed. Oxford
   University Press. ISBN 9780199641178
3. West, M. & Harrison, P.J. (1989). *Bayesian Forecasting and Dynamic Models.* Springer. 🔗
   https://doi.org/10.1007/978-1-4757-9365-9
4. Brodersen, K.H., Gallusser, F., Koehler, J., Remy, N. & Scott, S.L. (2015). Inferring causal
   impact using Bayesian structural time-series models. *The Annals of Applied Statistics* 9(1),
   247–274. 🔗 https://doi.org/10.1214/14-AOAS788 ⭐ (AOAS, **not** JASA)
5. Hyndman, R.J. & Athanasopoulos, G. (2021). *Forecasting: Principles and Practice*, 3rd ed.
   🔗 https://otexts.com/fpp3/
6. Athanasopoulos, G., Hyndman, R.J., Kourentzes, N. & Petropoulos, F. (2017). Forecasting with
   temporal hierarchies. *EJOR* 262(1), 60–74. 🔗 https://doi.org/10.1016/j.ejor.2017.02.046
7. Petropoulos, F. et al. (2022). Forecasting: theory and practice. *IJF* 38(3), 705–871. 🔗
   https://doi.org/10.1016/j.ijforecast.2021.11.001 — the modern field-wide survey (Harvey is a
   co-author)
8. Wickramasuriya, S.L., Athanasopoulos, G. & Hyndman, R.J. (2019). Optimal forecast reconciliation
   for hierarchical and grouped time series through trace minimization. *JASA* 114(526),
   804–819. 🔗 https://doi.org/10.1080/01621459.2018.1448825

## Cross-links

- [[time-series-forecasting-models]] §1 — where this was four sentences
- [[Hierarchical and Mixed-Effects Models for Forecasting]] — the Bayesian random-effects sibling
- [[Time Series Decomposition]] §6 — Prophet's prior is a structural trend; §8 on decomposition
- [[Change-Point Detection]] §6 — how to *evaluate* a break once found
- [[Count Distributions and Kolassa Evaluation]] — why Gaussian-on-counts fails at low counts
- [[Forecast Combination]] §6.3 — temporal hierarchies
- [[Nixtlaverse]] §8 — the AutoETS example this family should join
- [[Practice 01 — Rolling-Origin Harness and Baseline Panel]] — where the anchor model belongs
