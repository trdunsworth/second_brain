---
type: reference
status: active
topic: "Partial pooling as the continuum between 168 separate series models and one global model — hierarchical and mixed-effects structures for forecasting, and why shrinkage is usually the right answer to the local-vs-global question."
created: 2026-10-15
tags:
  - time-series
  - forecasting
  - hierarchical-models
  - mixed-effects
  - bayesian
  - partial-pooling
  - forecasting-benchmarks
aliases:
  - Partial Pooling
  - Hierarchical Models for Forecasting
  - Mixed Effects Forecasting
  - Pooling
---

# Hierarchical and Mixed-Effects Models for Forecasting

> **⚠️ This note closes the gap the vault flagged as most consequential.** Until now the
> [[Time Series Reading and Practice Hub]] said: *"No panel-data / mixed-effects treatment — this
> is the real answer to the discrete-vs-continuous question and it is missing entirely."*
> It also sat at P3 (lowest priority) in the 168-point study's action plan. **Both were wrong,
> and §4 explains why.**

Written 2026-10-15.

---

## 1. The question this answers

A forecasting study faces a choice that is usually framed as binary:

| Arm | Specification | Parameters | Cost |
|---|---|---|---|
| **Local** — separate models | One model per series | $n \times p$ | Slow, cannot borrow strength |
| **Global** — one model | One model across all series | $p$ | Fast, every series pays the same price |

**For the 168-point study the framing is wrong, and the correction is worth the whole note.** The
question "168 specialists or one generalist?" has a third answer that is not a compromise — it is
a **continuum**, and you can move along it continuously by choosing how much to shrink.

Montero-Manso & Hyndman (2021) formalise this as the **locality ↔ globality spectrum** and report
empirically that the best-performing methods sit *somewhere in between* rather than at either
endpoint. That is the finding, not a stylistic preference.

---

## 2. What partial pooling actually is

### 2.1 The shrinkage mechanism

Let $y_{t,h}$ be the call count at hour-of-week slot $h \in \{1,\dots,168\}$ on day $t$. A
partially-pooled model:

$$
y_{t,h} \sim \mathrm{NegBin}(\mu_{t,h}, \alpha), \qquad
\log \mu_{t,h} = \beta_0 + \beta_1 t + u_h, \qquad u_h \sim N(0, \sigma_u^2)
$$

The posterior for slot $h$'s intercept is **not** its own noisy estimate. It is a precision-weighted
compromise between that estimate and the population mean $\beta_0$:

$$
E[u_h \mid \text{data}] = \frac{n_h/\sigma^2}{n_h/\sigma^2 + 1/\tau^2}\, \hat{u}_h
$$

Read that shrinkage factor carefully — it is the entire mechanism:

| $n_h$ (history for that slot) | Shrinkage factor | Behaviour |
|---|---|---|
| Small (quiet hours, ~70 obs) | $\approx 0$ | **Pulled almost entirely to the population mean** |
| Large (busy hours, ~260 obs) | $\to 1$ | **Keeps its own estimate** |

> **This is why the question has no binary answer.** Sunday 03:00 ($\mu \approx 0.3$) and Friday
> 20:00 ($\mu \approx 6$) are not comparable estimation problems. A 168-separate-models design
> gives both of them a full independent fit; the low-count one will be almost entirely noise. A
> single global model gives neither any special treatment. **Partial pooling adapts the effective
> degrees of freedom per hour automatically** — it is the only one of the three that matches the
> heteroscedasticity to the problem.

### 2.2 The two endpoints are limiting cases

| Regime | Value | Reduces to |
|---|---|---|
| No pooling | $\sigma_u \to 0$ | 168 separate models (the study's discrete arm) |
| Complete pooling | $\sigma_u \to \infty$ | One global model (the study's continuous arm) |
| Finite $\sigma_u$ | estimated | **Partial pooling — both as special cases** |

**A single partially-pooled model nests the entire design question.** You do not have to *choose*
between the arms; you estimate $\sigma_u$ and report where it lands, with an interval. That is a
strictly better experimental design than running two arms and picking a winner, and it is why this
belongs in the study rather than in "future work."

The statistical foundation is Gelman & Hill (2007); the empirical-Bayes lineage that motivates
estimating the hyperparameters from the data rather than fixing them is Efron & Morris (1973).

### 2.3 Adding slopes: the seasonal-drift question

An intercept-only random effect says every hour-of-week has the same *drift*. It almost certainly
does not — Friday-night peaks and Sunday-morning troughs drift differently. Add a random slope:

$$
\log \mu_{t,h} = \beta_0 + \beta_1 t + u_{0,h} + u_{1,h} t, \qquad (u_{0,h}, u_{1,h}) \sim N(0, \Sigma)
$$

A **non-diagonal** $\Sigma$ additionally allows hours to drift *together* — a jurisdiction-wide
volume change (population growth, a policy change) hits all 168 slots similarly. That is a real,
modelled effect, not a nuisance.

> **⚠️ A specification trap.** `u_h` with 168 nominal levels treats hour-of-week as **unordered** —
> slots 167 and 1 are unrelated despite being adjacent in time. If the circular structure matters,
> use a **smooth pooling structure** instead: a random-walk (RW1) prior over the 168-hour profile,
> cyclic B-splines on the hour index, or Fourier seasonal terms with the random effect as a
> deviation from them. Same shrinkage behaviour, correct topology. This matters more at $s = 168$
> than it would at $s = 12$.

---

## 3. Local, global, and the taxonomy in between

Januschowski et al. (2020) classify forecasting methods by how they use cross-series information.
The practical taxonomy:

| Level | Structure | Example | Shares what |
|---|---|---|---|
| **Local** | Independent fits | `AutoETS`, `auto.arima()` per series | Nothing |
| **Panel / cross-sectional** | Common parameters, separate error terms | Hierarchical UCM, fixed-effects regression | Parameters only |
| **Cross-learning / global** | One model, series identity embedded | DeepAR, N-HiTS, TiDE, a global GBM | Everything |
| **Partially pooled** | Shrinkage between per-series and shared | The model above | Adaptively |
| **Ensembled** | Forecasts combined after the fact | See [[Forecast Combination]] | Nothing until combination |

Hewamalage, Bergmeir & Bandara (2021) survey the global-model literature; Godahewa et al. (2021)
provide the empirical backbone via the Monash archive.

> **Note the distinction that is usually missed:** [[Forecast Combination]] combines forecasts
> *after* they are produced and imposes **no** constraint that individual forecasts share
> information. Partial pooling shares information *during* estimation. They are different
> mechanisms that can coexist — and in fact should.

---

## 4. Why this belongs in the 168-point study

Four concrete reasons, in order of importance.

### 4.1 It answers the confound the study already identified

The study's own Limitations section asks (paraphrased): if continuous models win, is that
**genuine cross-hour dependency** or just **more data per model**?

$$\hat{u}_h = \underbrace{\text{signal}}_{h\text{'s true deviation from the mean}} + \underbrace{\text{noise}}_{O(1/\sqrt{n_h})}$$

Partial pooling separates these. The posterior standard deviation of $u_h$ *is* the noise
magnitude for that hour. A slot whose interval is wide was noise-dominated; a slot whose interval
is tight was genuinely different. **The model answers the confound it was built to answer.**

### 4.2 It fixes a multiplicity problem

Comparing 168 models against a baseline and then aggregating is a 169-way comparison.
[[Model Validation Strategies]] §4 notes that when each model is a specialisation of a shared
architecture you are in the **nested** case, where ordinary DM tests over-reject. One pooled model
with one set of uncertainty intervals sidesteps the 169-way multiple-comparison correction
entirely.

### 4.3 It is the classical anchor the study currently lacks

The study's two arms are "168 separate models" and "one sequence model." There is no principled
middle. A **local-linear-trend state space model with a stochastic seasonal of period 168 plus
hour-of-week dummy regression** is the deterministic-seasonal analogue of the pooled model — and
it gives analytically derived prediction intervals, which neither arm currently does. See
[[State Space Models and Bayesian Structural Time Series]].

### 4.4 It is the right model for the data, independent of the study

Douglas County has ~4 population centres, 3 universities, and a large event park (the study's own
Data section). If call type is available, emergency / non-emergency / administrative is an
intrinsic multi-series split. **Each additional series is 168 more hours of data**, and a
cross-series model borrows strength across them in exactly the way §2 describes.

---

## 5. Fitting it

### 5.1 The tools

| Tool | Version | Notes |
|---|---|---|
| **`brms`** (R) | 2.23.0 | **Recommended primary.** Full-Bayesian GLMMs on Stan; `negbinomial()` family, random effects *and* random slopes, priors, posterior predictive checks |
| **`glmmTMB`** (R) | 1.1.15.2 | Best **frequentist** NB2 GLMM. Fast (Laplace/ADVI). Zero-inflation supported |
| **`sdmTMB`** (R) | 1.1.0 | NB GLMM with spatial/temporal correlation via SPDE. Overkill unless modelling station-level structure |
| **`lme4`** (R) | 2.0-6 | Fast, mature, S4 — **but Gaussian/Gamma/binomial only. No NB family.** Cannot fit your count model directly |
| **`cmdstanr`** / CmdStan | 0.9.0 / v2.40.0 | The sampler backend behind `brms` |
| **`PyMC`** | 6.3.2 | `pymc.NegativeBinomial` present; stays in Python and gives the posterior predictive draws you need for [[Count Distributions and Kolassa Evaluation]] |

> **`lme4` will not fit this model.** It has no negative-binomial family. If you reach for it by
> default you will end up Gaussian-modelling counts, which is the specification error
> [[Count Distributions and Kolassa Evaluation]] is about.

### 5.2 Shape

```r
library(brms)

# hourly counts, hour-of-week 1..168
fit <- brm(
  count ~ trend + (1 | hour_of_week) + (trend | hour_of_week),
  family = negbinomial(),
  data = train,
  chains = 4, iter = 2000,
  prior = c(prior(normal(0, 5), class = "b"),
            prior(normal(0, 1), class = "sd"),
            prior(exponential(1), class = "shape"))
)
```

Note `family = negbinomial()` with an estimated `shape` — the dispersion parameter, discussed in
[[Count Distributions and Kolassa Evaluation]].

### 5.3 Diagnostics that matter here

| Check | What it tells you | If it fails |
|---|---|---|
| **Posterior of $\sigma_u$ vs $\sigma$** | Whether pooling is happening at all | If $\sigma_u \to 0$ you have accidentally refit 168 separate models |
| **R-hat per hour-of-week** | Whether any slot is unidentified | High R-hat at a quiet hour means that slot carries no information |
| **Posterior predictive rPIT by hour-of-week** | Whether the NB is calibrated *per slot* | See [[Count Distributions and Kolassa Evaluation]] §4 |
| **Effective sample size, quietest hours** | Whether the estimate is real | Near-noise ⇒ the hour should be shrunk hard |

> **The first check is the one to run first.** If $\sigma_u$ collapses, your "partial pooling" model
> is mathematically indistinguishable from the discrete arm and you have learned nothing.

---

## 6. Relationship to what is already in the vault

| Topic | Relationship |
|---|---|
| [[forecast-reconciliation]] | **Same statistical object, different grouping.** Reconciliation pools across aggregation levels; partial pooling across series. Reconciliation's "cheap classical version of pooling" framing is now complemented by the statistical version |
| [[Forecast Combination]] | Different mechanism (after vs during estimation), and complementary — combine a pooled model with other arms |
| [[State Space Models and Bayesian Structural Time Series]] | Deterministic vs stochastic seasonal; frequentist vs Bayesian |
| [[Time Series Anomaly Detection]] | A pool-anomaly model is a natural detector for low-count series |
| [[time-series-forecasting-models]] §6 | The multivariate framing this generalises |
| [[Benchmarks and Datasets]] | Monash and GIFT-Eval both score pooled and local methods separately |

> **⚠️ Not a reconciliation answer.** Reconciliation enforces **coherence**; it does not minimise
> error, and `forecast-reconciliation.md` says so explicitly. If your constraint is "these
> sub-totals must add up," you want reconciliation. If your constraint is "these slots share a
> common seasonal profile," you want pooling. **They solve different problems and neither
> substitutes for the other.**

---

## 7. Assessment

**Strengths**
- **It resolves the binary the study currently poses**, with an estimable parameter instead of a
  guess.
- Adapts automatically to the 20× difference in data volume between quiet and busy hours.
- Naturally yields intervals for the pooling parameter — you report *how much* sharing was
  justified, with uncertainty.
- Scales: more series means more data for the shared components.
- Directly answers the study's own stated confound.

**Weaknesses and cautions**
- **Computationally heavier than the other two arms.** 168 groups × chains × iterations. Estimate
  the runtime before committing, and it is worth reading the study's P1 item about
  infrastructure as partly about this.
- **Non-centre convergence is common** with 168 groups and long chains. Raise `iter`, check
  divergences, do not assume it converged.
- **The unordered-levels trap** in §2.3 is easy to fall into and hard to notice.
- The posterior of $\sigma_u$ can be prior-sensitive when the between-slot variance is small —
  this is exactly the empirical-Bayes pathology Efron & Morris (1973) was written about. A full
  Bayesian treatment (`brms`) handles this properly; a plug-in empirical Bayes does not.
- You need the count likelihood to be honest. Gaussian-lognormal on counts is the
  misspecification [[Count Distributions and Kolassa Evaluation]] exists to prevent.

---

## 8. Try it

- [ ] Fit `brms` with `(1 | hour_of_week)` on Douglas County hourly counts; **first check the
      posterior of $\sigma_u$** and confirm it is not collapsed toward zero
- [ ] Compare the pooled fit against the 168 separate fits and against one global model — plot the
      per-hour shrinkage factor $\hat{u}_h$ as a histogram. It **should** be bimodal-ish: quiet
      hours shrunk hard, busy hours barely at all
- [ ] Add a random slope for trend and report $\Sigma$ (the correlation between hour intercepts and
      slopes). A strong correlation means hours drift together — a jurisdiction-wide effect
- [ ] Refit with a random-walk (RW1) prior over the 168-hour profile and compare to the
      unordered specification in §2.3. Quantify how much the circular structure matters
- [ ] Use the posterior draws for [[Count Distributions and Kolassa Evaluation]]: rPIT by
      hour-of-week, and check whether quiet hours need zero-inflation
- [ ] **The decisive experiment for the study:** report $\hat{\sigma}_u$ with its credible interval
      alongside the discrete-vs-continuous comparison. If the interval is far from both 0 and
      infinity, that is the finding

## References

**Partial pooling and the locality–globality spectrum**

1. Gelman, A. & Hill, J. (2007). *Data Analysis Using Regression and Multilevel/Hierarchical
   Models.* Cambridge University Press. 🔗 https://doi.org/10.1017/CBO9780511790942
2. Efron, B. & Morris, C. (1973). Stein's estimation rule and its competitors — an empirical Bayes
   approach. *JASA* 68(341), 117–130. 🔗 https://doi.org/10.1080/01621459.1973.10481350
3. Montero-Manso, P. & Hyndman, R.J. (2021). Principles and algorithms for forecasting groups of
   time series: Locality and globality. *IJF* 37(4), 1632–1653. 🔗
   https://doi.org/10.1016/j.ijforecast.2021.03.004 ⭐ **the key citation for this note**
4. Januschowski, T., Gasthaus, J., Wang, Y., Salinas, D., Flunkert, V., Bohlke-Schneider, M. &
   Callot, L. (2020). Criteria for classifying forecasting methods. *IJF* 36(1), 167–177. 🔗
   https://doi.org/10.1016/j.ijforecast.2019.05.008
5. Hewamalage, H., Bergmeir, C. & Bandara, K. (2021). Recurrent neural networks for time series
   forecasting: Current status and future directions. *IJF* 37(1), 388–427. 🔗
   https://doi.org/10.1016/j.ijforecast.2020.06.008

**Hierarchical reconciliation — the cross-level sibling**

6. Hyndman, R.J., Ahmed, R.A., Athanasopoulos, G. & Shang, H.L. (2011). Optimal combination
   forecasts for hierarchical time series. *CSDA* 55(9), 2579–2589. 🔗
   https://doi.org/10.1016/j.csda.2011.03.006
7. Wickramasuriya, S.L., Athanasopoulos, G. & Hyndman, R.J. (2019). Optimal forecast
   reconciliation for hierarchical and grouped time series through trace minimization. *JASA*
   114(526), 804–819. 🔗 https://doi.org/10.1080/01621459.2018.1448825
8. Athanasopoulos, G., Hyndman, R.J., Kourentzes, N. & Panagiotelis, A. (2024). Forecast
   reconciliation: A review. *IJF* 40(2), 430–456. 🔗
   https://doi.org/10.1016/j.ijforecast.2023.10.010

**Models and tooling**

9. Olivares, K.G., Meetei, O.N., Ma, R., Reddy, R., Cao, M. & Dicker, L. (2023). Probabilistic
   hierarchical forecasting with deep Poisson mixtures. *IJF*. 🔗
   https://arxiv.org/abs/2110.13179 — Poisson-mixture counts + hierarchical structure
10. Banda, K., Hewamalage, H., Liu, Y.-H., Kang, Y. & Bergmeir, C. (2020). Improving the accuracy
    of global forecasting models using time series data augmentation. 🔗
    https://arxiv.org/abs/2008.02663
11. Bürkner, P.-C. (2017). brms: An R package for Bayesian multilevel models using Stan. *JSS*
    80(1). 🔗 https://doi.org/10.18637/jss.v080.i01
12. Godahewa, R., Bergmeir, C., Webb, G.I., Hyndman, R.J. & Montero-Manso, P. (2021). Monash Time
    Series Forecasting Archive. 🔗 https://arxiv.org/abs/2105.06643

## Cross-links

- [[168-Point Forecast Comparison - Discrete vs Continuous]] — the study this answers
- [[Forecast Combination]] — the other way to share information across models
- [[State Space Models and Bayesian Structural Time Series]] — the deterministic-seasonal analogue
- [[Count Distributions and Kolassa Evaluation]] — the likelihood and the scoring to pair with it
- [[forecast-reconciliation]] — pooling across levels rather than across series
- [[Model Validation Strategies]] §4 — the nested-comparison problem this avoids
- [[time-series-forecasting-models]] §6 — multivariate and panel methods
- [[Benchmarks and Datasets]]
