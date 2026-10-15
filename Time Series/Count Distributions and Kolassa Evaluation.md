---
type: reference
status: active
topic: "Why point metrics are the wrong instrument for count forecasts, and how to evaluate the predictive distribution instead — Poisson/NB parameterisations, randomized PIT, Quantile Score, Variance Score, and WIS."
created: 2026-10-15
tags:
  - time-series
  - forecasting
  - count-data
  - evaluation
  - probabilistic-forecasting
  - proper-scoring-rules
aliases:
  - Count Distributions
  - Kolassa
  - Randomized PIT
  - Evaluating Count Forecasts
  - Negative Binomial
---

# Count Distributions and Kolassa Evaluation

> **⚠️ A live contradiction in this vault, flagged rather than fixed.**
> [[168-Point Forecast Comparison - Discrete vs Continuous]] §Evaluation Metrics lists **MAE,
> RMSE, MAPE, MASE**. Three other notes say never report MAPE — correctly, because it is
> undefined at `y = 0`, which for hourly 9-1-1 volume is the typical case, not the exception
> ([[Intermittent and Sparse Demand]] §1, [[Practice 05]] §Step 2,
> [[Time Series Forecasting Baselines]] §3.2). **The study note is the only artifact in the vault proposing MAPE.** I have
> left it alone as instructed; this note is the argument for removing it.

Written 2026-10-15.

---

## 1. The core argument

**Kolassa, S. (2016). "Evaluating predictive count data distributions in retail sales forecasting."
*IJF* 32(3), 788–803.** 🔗 [10.1016/j.ijforecast.2015.12.004](https://doi.org/10.1016/j.ijforecast.2015.12.004)

From the abstract, verbatim:

> *"We explore classical point forecast accuracy measures, explain why measures such as **MAD,
> MASE and wMAPE are inherently unsuitable for count data**, and use the **randomized Probability
> Integral Transform (rPIT)** and **proper scoring rules** to compare the performances of multiple
> causal and noncausal forecasting models…"*

The central claim: **if your object of study is a predictive *distribution*, then point-forecast
accuracy measures are the wrong instrument** — not merely a blunt one, but measuring something
different from what you care about.

### 1.1 Why the point metrics fail on counts

| Metric | Why it fails on counts |
|---|---|
| **MAPE** | Division by $y_t$. Undefined at $y_t = 0$; explodes as $y_t \to 1$. Routine at quiet hours |
| **wMAPE / WAPE** | Ratio form: $\sum|e| / (\epsilon + \sum|y|)$. Aggregate weighting means the ~160 low-count hours are numerically invisible against the peaks |
| **MASE** | Kolassa argues directly against it here. The scaling denominator is built from point errors of a naive method; it optimises the wrong functional for a count distribution |
| **MAE** | Not *wrong*, but minimised by the predictive **median**. For a right-skewed count distribution the median is below the mean, so MAE scoring rewards a model for under-forecasting peaks |
| **RMSE** | Minimised by the predictive **mean**. Penalises the right tail heavily, which on counts means it is driven by a handful of peak hours |

> **The functional mismatch is the point.** MAE is minimised by the median, RMSE by the mean, a
> quantile loss by that quantile. **"The best model" depends entirely on which functional your
> loss targets** — Kolassa (2020) is a short commentary devoted to exactly this observation. If
> you fit a Negative Binomial by maximum likelihood, you are implicitly optimising the **NB
> log-likelihood**, which is a proper scoring rule. Scoring that model with MAE is not
> measuring what you fitted.

---

## 2. The count models

### 2.1 Parameterisations

All are variance functions of the mean $\mu$; they differ in how dispersion grows.

| Model | $\mathrm{Var}(Y)$ | Overdispersion | Notes |
|---|---|---|---|
| **Poisson** | $\mu$ | None | Equidispersion — **assumes $\mathrm{Var} = E$**. Fails by construction for most real count series |
| **NB2** | $\mu + \alpha\mu^2$ | Quadratic | **The default.** One dispersion parameter $\alpha$ |
| **NB1** | $\mu + \alpha\mu$ | Linear | Variance proportional to mean |
| **Geometric** | $\mu + \mu^2$ | Special case of NB2 | $\alpha = 1$ |
| **Zero-inflated NB** | Mixture | Adds a structural-zero mass | Only if you have genuine structural zeros |

### 2.2 Why Poisson will fail here

Poisson's equidispersion assumption is $\mathrm{Var}(Y) = E[Y]$. For hourly call volume this fails
at **both ends** of the day:

| Hour | $\mu$ | Poisson $\mathrm{Var}$ | Reality |
|---|---|---|---|
| Sunday 03:00 | ~0.3 | 0.3 | Poisson is defensible here |
| Friday 20:00 | ~6 | 6 | Real dispatch data is **overdispersed** — incidents cluster |

**A single Poisson forces one dispersion parameter across a range of $\mu$ spanning 20×.** NB2's
$\mu + \alpha\mu^2$ is the minimum needed to fix it.

### 2.3 The refinement the vault is missing

> **Overdispersion is not constant across the day either.** At $\mu = 0.3$ Poisson is roughly right;
> at $\mu = 6$ the dispersion parameter should be much larger. **A single $\alpha$ is itself an
> averaging assumption.** A natural extension — and one that connects directly to
> [[Hierarchical and Mixed-Effects Models for Forecasting]] — is to make the NB **dispersion
> parameter** vary by hour-of-week: $\alpha_h$. That is partial pooling applied to the
> overdispersion rather than the mean.
>
> This is a genuine gap. The vault explains NB (§4.1 of [[Time Series Forecasting Baselines]] and
> §6 of [[Intermittent and Sparse Demand]]) but never asks whether one $\alpha$ fits 168 slots.

---

## 3. The evaluation instruments

### 3.1 Randomized PIT — the calibration check

The Probability Integral Transform maps a predictive CDF to a uniform:

$$u = F(y)$$

For **continuous** $F$, $u \sim \mathrm{Uniform}(0,1)$ exactly if the forecast is calibrated. For a
**discrete** count distribution $F$ takes a step function, so $F(y) \in [F(y^-), F(y)]$ — a range,
not a point. Kolassa's fix: **draw uniformly within that range.**

$$u \sim \mathrm{Uniform}\big(F(y^-),\, F(y)\big)$$

**So: a histogram of rPIT values should be flat across $[0,1]$ if the predictive distribution is
right.** Read the shapes:

| rPIT histogram | Diagnosis |
|---|---|
| **Flat** | Calibrated |
| **U-shaped** | Too much dispersion — intervals too wide |
| **∩-shaped (leaning high)** | Not enough dispersion — **overconfident intervals** |
| **U-shaped at the left edge only** | Predictions biased low relative to the true low counts |

> **This is the single most informative plot in the whole topic** and it is absent from the vault.
> `Practice 05` wraps a `NegBinomialLoss` but never inspects calibration; `Practice 04` measures
> interval coverage with conformal, which is a different (marginal) question.

For 9-1-1, plot rPIT **stratified by hour-of-week**. A single pooled histogram will look fine
while individual hours are badly miscalibrated.

### 3.2 Proper scoring rules

A scoring rule $S(y, F)$ is **proper** if it is minimised in expectation when $F$ is the true
predictive distribution. **Gneiting & Raftery (2007)**, *JASA* 102(477), 359–378 🔗
[10.1198/016214506000001437](https://doi.org/10.1198/016214506000001437) is the canonical reference.

**Quantile Score** (a.k.a. pinball / quantile / tiled loss), for level $\alpha$:

$$QS_\alpha(y, F) = 2 \int_0^1 (y - Q(\tau)) \cdot \begin{cases} \tau - 1 & y < Q(\tau) \\ \tau & y \ge Q(\tau)\end{cases} d\tau$$

Average over a quantile grid and you approach the **CRPS**. For a 168-hour forecast this is the
natural headline metric — it evaluates the whole predictive distribution at once.

**Variance Score**, for predictive mean $\mu$ and variance $\sigma^2$:

$$VS(y, \mu, \sigma^2) = (\mathbb{1}\{y \le \mu\} - 1)(y - \mu)^2 + \sigma^2$$

**WIS** (weighted interval score) — the weighted average of Quantile Scores at a set of nested
intervals; more efficient than discrete interval coverage. See Bosse et al. (2022), 🔗
[arXiv:2205.07090](https://arxiv.org/abs/2205.07090); R: `scoringutils` 2.3.0.

> **Czado, Gneiting & Held (2009), "Predictive model assessment for count data," *Biometrics*
> 65(4), 1254–1261** 🔗
> [10.1111/j.1541-0420.2009.01191.x](https://doi.org/10.1111/j.1541-0420.2009.01191.x) — **the
> most directly relevant paper for PIT on counts.** Read this before implementing rPIT yourself.

### 3.3 The practical scorecard

For an hourly 9-1-1 probabilistic forecast:

| Metric | What it answers | Priority |
|---|---|---|
| **rPIT, stratified by hour-of-week** | Is the distribution calibrated *per hour*? | **Primary** |
| **WIS / mean Quantile Score** | Overall distributional accuracy | **Primary** |
| **Variance Score** | Is the spread right? | Secondary |
| **Sharpness** (narrow intervals) | Is it useful rather than trivially safe? | **Report alongside coverage** |
| MAE / RMSE | Point accuracy only | Report, but **label them as point metrics** |
| ~~MAPE~~ | — | **Never** |

> **Calibration without sharpness is free.** You can achieve perfect coverage by predicting a very
> wide interval. **Always report a sharpness measure next to coverage** — interval width, or the
> empirical quantiles. See [[Model Validation Strategies]] §6 and Gneiting, Balabdaoui &
> Raftery (2007), 🔗 [10.1111/j.1467-9868.2007.00587.x](https://doi.org/10.1111/j.1467-9868.2007.00587.x).

---

## 4. A worked protocol

```python
# 1. Fit NB (e.g. via PyMC or statsmodels NegativeBinomial, loglike_method='nb2')
# 2. Generate predictive draws per hour-of-week
# 3. Randomized PIT, stratified by hour-of-week
def rpithist(y_true, cdf_lo, cdf_hi, n_draws=1000, seed=0):
    rng = np.random.default_rng(seed)
    return rng.uniform(cdf_lo, cdf_hi, size=n_draws)

# 4. Quantile Score averaged over a quantile grid -> WIS
qs_alpha = lambda y, q, a: np.where(y >= q, a, 1-a) * (y - q)
wis = np.mean([qs_alpha(y, np.quantile(draws, a), a)
               for a in [0.05,0.10,0.25,0.50,0.75,0.90,0.95]])

# 5. Variance Score for the predictive mean/var
vs = (np.sign(y - mu) * (y - mu)**2) + sigma2
```

---

## 5. Tooling

| Tool | Version | Notes |
|---|---|---|
| `statsmodels` | 0.15.0 | `NegativeBinomial(endog, exog, loglike_method='nb2'\|'nb1'\|'geometric')` — the parameterisation switch. Also `NegativeBinomialP`, `ZeroInflatedNegativeBinomialP`, `ZeroInflatedPoisson`, `HurdleCountModel` |
| `PyMC` | 6.3.2 | `pymc.NegativeBinomial`. Stays in Python, gives posterior draws for the scorecard above |
| `scoringutils` (R) | 2.3.0 | `variancescore()`, `quantilescore()`, `range` scores (WIS) |
| `LightGBM` | 4.7.0 | `objective="poisson"` — **gives the mean only, no predictive distribution.** Pair with `objective="quantile"` or a distributional head |
| `NeuralForecast` | 3.3.0 | See below |
| `prophet` | 1.5.0 | **Gaussian observation noise only — not a count model.** Combination component only |

> **⚠️ `NegBinomialLoss` no longer exists in NeuralForecast.** In v3.3.0 the negative-binomial loss
> is **`NBMM`** (Negative Binomial Mixture Mesh), parameterised by `n_components`, following
> Olivares et al. (2023) 🔗 [arXiv:2110.13179](https://arxiv.org/abs/2110.13179). Use `QuantileLoss`
> / `MQLoss` for quantile evaluation; `Tweedie` gives variance $\mu + \alpha\mu^2$ at `power=1`.

---

## 6. The intermittent-demand connection

Croston's method is a **point-forecast** algorithm built for zero-inflated demand. But — per
Fildes, Ma & Kolassa (2022) 🔗
[10.1016/j.ijforecast.2019.06.004](https://doi.org/10.1016/j.ijforecast.2019.06.004) — *"Kolassa
(2016) … found that **Croston's method point forecasts with a negative binomial distributional
assumption yielded competitive density forecasts**."*

**Croston, given an NB assumption, is already a probabilistic model.** This is the bridge between
[[Intermittent and Sparse Demand]] and this note, and the vault does not currently make it.

---

## 7. Assessment

**Strengths**
- **The distributional evaluation is the correct instrument for a probabilistic model**, and the
  argument is rigorous, published, and specific.
- rPIT is cheap, visual, and diagnostic in a way MASE is not.
- WIS/CRPS summarise an entire 168-quantile forecast in one number.
- NB2 is a one-parameter fix for Poisson's fatal equidispersion assumption.

**Weaknesses and cautions**
- **No mainstream library makes this the default.** `statsforecast`, `sktime` and `NeuralForecast`
  all still lead with MASE. You will be implementing the scores yourself.
- **Randomized PIT has real variance** — needs enough draws, and the histogram is noisy at small
  $n$. Do not over-read a single stratum.
- rPIT tests **marginal** calibration. A model can be marginally calibrated and miscalibrated
  *conditional on the hour* — which is exactly why §3.1 insists on stratification.
- Point metrics are not *wrong*, only mismatched. Report both; do not silently substitute.
- Choosing the count family (Poisson / NB2 / ZINB) is itself a modelling decision that this
  literature leaves under-specified.

---

## 8. Try it

- [ ] Compute the **variance-to-mean ratio by hour-of-week**. If it is not flat, one NB
      dispersion parameter is an averaging assumption you should not be making
- [ ] Fit Poisson and NB2 to the same quiet-hour slice. Confirm Poisson's equidispersion fails and
      quantify by how much
- [ ] Plot rPIT **stratified by hour-of-week**. Expect a U-shape at quiet hours — that is the
      Poisson assumption failing where it is most exposed
- [ ] Compute WIS and rPIT for the two arms of the 168-point study and check whether **the ranking
      changes**. If it does, the point-metric result was an artefact of the scoring function
- [ ] Refit with $\alpha_h$ varying by hour-of-week and check whether the rPIT flattens
- [ ] Test whether quiet hours need **zero-inflation** rather than just overdispersion — draw the
      empirical zero rate against the NB2-implied zero probability
- [ ] Add Croston-with-NB-assumption to the panel and evaluate it on rPIT/WIS rather than MASE

## References

**Core**

1. Kolassa, S. (2016). Evaluating predictive count data distributions in retail sales forecasting.
   *IJF* 32(3), 788–803. 🔗 https://doi.org/10.1016/j.ijforecast.2015.12.004 ⭐ **the key paper**
2. Kolassa, S. (2020). Why the "best" point forecast depends on the error or accuracy measure.
   *IJF* 36(1), 208–211. 🔗 https://doi.org/10.1016/j.ijforecast.2019.02.017
3. Gneiting, T. & Raftery, A.E. (2007). Strictly proper scoring rules, prediction, and estimation.
   *JASA* 102(477), 359–378. 🔗 https://doi.org/10.1198/016214506000001437 ⭐ Quantile Score &
   Variance Score
4. Czado, C., Gneiting, T. & Held, L. (2009). Predictive model assessment for count data.
   *Biometrics* 65(4), 1254–1261. 🔗 https://doi.org/10.1111/j.1541-0420.2009.01191.x ⭐ **PIT on
   counts**
5. Gneiting, T., Balabdaoui, F. & Raftery, A.E. (2007). Probabilistic forecasts, calibration and
   sharpness. *JRSS-B* 69(2), 243–268. 🔗 https://doi.org/10.1111/j.1467-9868.2007.00587.x

**Intermittent demand and practice**

6. Croston, J.D. (1972). Forecasting and stock control for intermittent demands. *ORQ* 23(3),
   289–303. 🔗 https://doi.org/10.1057/jors.1972.50
7. Fildes, R., Ma, S. & Kolassa, S. (2022). Retail forecasting: Research and practice. *IJF* 38(4),
   1283–1318. 🔗 https://doi.org/10.1016/j.ijforecast.2019.06.004
8. Teunter, R.H., Syntetos, A.A. & Babai, M.Z. (2011). Intermittent demand: Linking forecasting to
   inventory obsolescence. *EJOR* 214(3), 606–615. 🔗 https://doi.org/10.1016/j.ejor.2011.05.018
9. Nikolopoulos, K. (2021). We need to talk about intermittent demand forecasting. *EJOR* 291(2),
   549–559. 🔗 https://doi.org/10.1016/j.ejor.2019.12.046

**Probabilistic models**

10. Olivares, K.G., Meetei, O.N., Ma, R., Reddy, R., Cao, M. & Dicker, L. (2023). Probabilistic
    hierarchical forecasting with deep Poisson mixtures. *IJF*. 🔗
    https://arxiv.org/abs/2110.13179 — the `NBMM` loss in NeuralForecast
11. Bosse, G., Gruson, H., Cori, A., van Leeuwen, E., Funk, S. & Abbott, S. (2022). Evaluating
    forecasts with scoringutils in R. 🔗 https://arxiv.org/abs/2205.07090

## Cross-links

- [[Intermittent and Sparse Demand]] — Croston, Syntetos–Boylan; §6 is the bridge
- [[Hierarchical and Mixed-Effects Models for Forecasting]] — hour-of-week varying dispersion
- [[Model Validation Strategies]] §6 — marginal vs conditional coverage; sharpness
- [[Generative and Probabilistic Forecasting]] — the modelling side of the same question
- [[Practice 05 — Intermittency, Counts and Anomaly Detection]] — where the `NBMM` fit lives
- [[Time Series Forecasting Baselines]] §3.2 — the MASE denominator argument
- [[Forecast Combination]] — how to combine 169 quantile sets into one calibrated distribution
- [[Change-Point Detection]] — dispersion and autocorrelation breaks on count data
