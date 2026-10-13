---
type: reference
topic: Forecast reconciliation — coherent subspace, summing matrices, MinT and its W-estimators, temporal/cross-temporal variants, counts and discreteness, scalability, and probabilistic reconciliation
date: 2026-10-13
status: active
tags:
  - time-series
  - forecasting
  - hierarchical-forecasting
  - reconciliation
  - mint
  - coherence
  - probabilistic-forecasting
---

# Forecast Reconciliation

> Goal: the theory and practice of making forecasts **add up** — the projection framework, the MinT family, the choice of `W` (which is where all the practical decisions live), temporal and cross-temporal variants, and the two cases that break the classical theory: **counts** and **very large hierarchies**.
> Written to fill the gap flagged in [[time-series-forecasting-models]], where reconciliation currently sits as one bullet. Assumes forecasting fundamentals; does not re-teach ARIMA/ETS.
> Applied in [[Staffing_Forecasting_Experiment]] §6 and connected to [[168-Point Forecast Comparison - Discrete vs Continuous]].

## Link status

🔗 verified open (HTTP 200 on 2026-10-13) · 🔒 publisher, may need access · 📖 book

**Reading order:** Athanasopoulos et al. (2023) review first — it is the entry point and everything below is a specialisation of it. MinT second if you want the estimator. The rest is reference.

---

## 1. The problem, stated exactly

Forecasting each series in a hierarchy **independently** produces forecasts that do not add up.

```
            Total            base forecast:        1200
           /    \                                1100     ← incoherent, 1100 ≠ 1200
          A      B
        /  \    /  \
      AA  AB  BA  BB      base forecasts:  300 280 310 290
```

Sum of children = 1180. Total says 1200. **One of these is wrong, and nothing in the independent forecasts tells you which.**

Reconciliation is the post-hoc projection of the vector of base forecasts onto the **coherent subspace** — the set of forecast vectors satisfying the same aggregation identities as the data.

> **Three things reconciliation is NOT.** It is not a forecasting model (base forecasts come from anywhere — ARIMA, ETS, GBM). It is not a heuristic patch. And it is **not guaranteed to improve accuracy** — it is guaranteed to produce *coherent* forecasts, and improved accuracy is a separate, empirical question (see §9 — the answer is more nuanced than the textbooks imply).

---

## 2. Notation and the summing matrix

| Symbol | Meaning | Dimension |
|---|---|---|
| `b_t` | **bottom-level** series vector at time `t` | `n_b` |
| `y_t` | **all** series (every aggregation level) at time `t` | `n` (> n_b) |
| **S** | **summing matrix** — encodes the aggregation | `n × n_b` |
| `ŷ_T` | base forecasts for all series, all horizons, stacked | `n` per horizon |
| `W_h` | covariance matrix of **base forecast errors**, horizon `h` | `n × n` |
| `P` | **reconciliation matrix** (base → bottom level) | `n_b × n` |
| `ỹ_T` | reconciled (coherent) forecasts, all levels | `n` |

The structure is:

```
y_t = S b_t                                  (1)
```

**`S` is sparse and integer-valued** with a 1 in position `(i,j)` when series `i` includes bottom-level series `j`. Every reconciliation method needs only `S` — you never need the hierarchy described in words.

**Coherence** means `ỹ = S b̃` for some `b̃`. Equivalently, `ỹ` lies in the **coherent subspace** `col(S)`.

> **Practical note.** In every mainstream implementation you build `S`, not a list of levels. `hierarchicalforecast` and `statsforecast` (Python) and `hts` (R) all take a summing matrix or generate one from a category/codes frame. Getting `S` right is most of the implementation work.

---

## 3. The projection framework

All reconciliation methods share one skeleton. The only question is **how the projection weights errors**.

### 3.1 The optimisation

Choose the coherent forecast minimising a weighted distance from the base forecasts:

```
minimise   (ỹ − ŷ)' W⁻¹ (ỹ − ŷ)
subject to ỹ ∈ col(S)
```

The solution is the `W`-weighted projection onto `col(S)`:

```
ỹ = G ŷ ,      G = S [S'W⁻¹S]⁻¹ S'W⁻¹                  (2)
```

and, at the bottom level,

```
b̃ = P ŷ ,      P = [S'W⁻¹S]⁻¹ S'W⁻¹   ∈ R^{n_b × n}   (3)
```

with `ỹ = S b̃` recovered by aggregation.

**Sanity check:** `G S = S`, so if the base forecasts are *already* coherent, reconciliation is the identity. That is the property you should verify first — if `G ŷ ≠ ŷ` when `ŷ = S b`, you have a bug, not a method.

### 3.2 GLS with known covariance

If the true covariance `Σ` of base errors were known, the GLS estimator (Hyndman, Ahmed, Athanasopoulos & Shang, 2011) is minimum-variance unbiased:

```
ỹ = S (S'Σ⁻¹S)⁻¹ S'Σ⁻¹ ŷ
```

**It is never known.** Everything else is about handling this.

### 3.3 MinT — minimum trace

**Wickramasuriya, Athanasopoulos & Hyndman (2019)** 🔗 https://robjhyndman.com/papers/mint.pdf

Rather than choosing `W` heuristically, **choose it so the projection minimises total reconciled error variance** — the trace of `Var(y_T − ỹ_T)`:

```
P = argmin_P  tr( Var( y_T − SP ŷ_T ) )     subject to SP unbiased
```

This is the **GLS solution with a different `W`** — specifically `W⁻¹` plays the role of `Σ⁻¹`. MinT is *not* a new estimator family; it is a **principled way to choose the weighting**, and it drops the assumptions the 2011 paper needed.

**Why this is the right criterion.** Trace minimisation is minimax-optimal for a *shrunk* class of true covariance matrices — no single choice of `W` is uniformly best, but the trace-minimising choice minimises the worst case. That is a stronger justification than any heuristic.

> **If you remember one thing:** `W` carries the entire problem. (2) is linear algebra; the research programme *is* the search for a good `W`.

---

## 4. Choosing `W` — where the practical decisions live

| Variant | `W` | Notes |
|---|---|---|
| **OLS** (Hyndman et al. 2011) | `I` | Treats all series errors as equally sized. `P = (S'S)⁻¹S'` |
| **WLSᵥ / variance scaling** (Athanasopoulos et al. 2017) | `diag(ŵᵢ²)` | Weights by base-forecast error variances. Assumes errors **uncorrelated** |
| **WLSₛ / structural scaling** (Wickramasuriya et al. 2019) | `k_h · Λ`, `Λ = diag(S·1_{n_b})` | Depends **only on the grouping structure**, not on estimated variances. Weights upper levels by how many series they subsume |
| **MinT(sample)** | unbiased sample covariance of in-sample 1-step base errors | Standard, but can be singular with many series |
| **MinT(shrink)** | Schäfer & Strimmer (2005) shrinkage | **Scale- and location-invariant**; shrinks off-diagonals toward zero. Best in small samples |
| **MinT(ols)** | `I` | Often competitive, occasionally wins |

### Empirical guidance from the MinT paper

- **MinT(shrink) ≈ 30% lower RMSE than base forecasts at the top level** when bottom-level error correlation is −0.8.
- **Estimating a non-diagonal covariance with shrinkage gives a substantial accuracy improvement** over any diagonal choice.
- **MinT(sample) converges toward MinT(shrink) as sample size grows.**
- **Bottom-up is competitive at small sample sizes** — precisely because covariance estimation is unreliable there. Do not reach for MinT by reflex when you have 18 months of data.

### The practical decision tree

```
How many series, how much history?
├── Few series / short history → MinT(shrink), or bottom-up
├── Many series / long history → MinT(shrink) or MinT(sample)
├── You cannot estimate a covariance reliably → structural scaling WLSₛ
└── Never start with OLS unless series are on comparable scales
```

> **Unnormalised series break OLS.** If one series runs at 10,000 and another at 5, OLS treats their errors as equally important, which is rarely what you want. Normalise first, or use variance scaling.

---

## 5. Aggregation strategies

| Strategy | Rule | When it wins |
|---|---|---|
| **Bottom-up (BU)** | Forecast only the bottom level; aggregate up | Few series, short history, unstable bottom-level estimates. **Provably optimal in some temporal cases (§7)** |
| **Top-down (TD)** | Forecast only the top level; disaggregate by historical proportions | Many series with no bottom-level history |
| **Middle-out (MO)** | Middle level → aggregate up and down | Best level is known and in the middle |
| **Optimal reconciliation** | MinT / OLS across all levels | Sufficient data to estimate `W`. Usually best overall |

Hyndman et al. (2011) reported MAPE 5.35% (optimal) vs 5.58% (bottom-up) vs 5.70% (unreconciled) on Australian tourism data — the gains are **real but modest**. 🔗 https://robjhyndman.com/papers/Foresight-hts-final.pdf

---

## 6. Beyond the tree: grouped, degenerate, non-aggregatable

### Grouped structures
Some series aggregate but do not form a tree. A grouped structure is a **union of trees with common bottom and top levels**. `S` may no longer be `0/1` — real-valued weights appear. The framework is unchanged; only `S` differs.

### Degenerate hierarchies
Hierarchies where some series are linear combinations of others, or where sub-hierarchies are **disjoint** (no shared total). The R package `htsDegenerateR` 🔗 https://cran.r-project.org/package=htsDegenerateR takes an explicit `S` matrix rather than a `nodes` list, which is the general and safer route.

### Non-aggregatable series ⚠️
Sometimes two series that *look* like they should sum **do not** — demand forecast ≠ sales forecast; national total ≠ sum of regions for a period where boundaries changed.

Standard remedies:
1. **Reconcile only the coherently-related subset.** Keep the non-aggregatable series outside the hierarchy.
2. **Introduce a "dummy" balancing series** so the identity holds, then discard the dummy after reconciliation.
3. **Use a time-varying `S`** when the structure itself changes (reorganisation, boundary change).

> For 9-1-1 work this matters if you ever reconcile across **jurisdictions with boundary changes** — a real risk in consolidation studies. Model it explicitly rather than letting the identity silently break.

---

## 7. Temporal and cross-temporal reconciliation

The hierarchy need not be cross-sectional. It can be **temporal**: hourly → daily → weekly → monthly.

- Athanasopoulos et al. (2017), *Forecasting with temporal hierarchies*, **EJOR** 262(1), 60–74 — the foundational treatment.
- **Cross-temporal** (Kourentzes & Athanasopoulos, 2019) reconciles an arbitrary set of aggregation levels simultaneously, including mixed frequencies.

Nystrup et al. (2020) add autocorrelation-aware estimators: **autocovariance scaling, Markov scaling, GLASSO for inverse cross-correlation, cross-correlation shrinkage.**

> ### ⚠️ The "Rediscovering Bottom-Up" result — read this before assuming reconciliation helps
> For the **aggregated AR(1)** model, a recent result (2024) establishes that **bottom-up is the optimal unbiased reconciliation** — the aggregated forecast is discarded entirely, and reconciliation cannot improve bottom-level accuracy at all.
>
> Empirically, across their settings:
> - *"most improvements occur at the top level of the hierarchy"*
> - *"reconciliation at the bottom level yields worse results, especially out-of-sample"*
> - bottom-up matches sophisticated methods **once sample size is sufficiently large**
> 🔗 https://arxiv.org/pdf/2407.02367
>
> **Practical reading:** reconciliation mostly buys you a better **aggregate**, not better **bottom-level** forecasts. If you care about bottom-level accuracy (and for PSAP staffing you mostly care about aggregates — good), check the trade rather than assuming.

---

## 8. Counts and discreteness — the case that breaks classical theory ⚠️

This is the section that matters for [[Staffing_Forecasting_Experiment]].

### 8.1 The problem

Classical reconciliation is linear algebra over reals. Real-world demand is **integer counts**, often small, often zero. Three failures follow:

**(a) Rounding breaks coherence.** The canonical illustration: `X = 0.4`, `Y = 0.4`, `Z = 0.8` are coherent, but rounding gives `X = 0`, `Y = 0`, `Z = 1` — which is **not** (`0 + 0 ≠ 1`). With hourly PSAP volumes most cells are small integers, so this is the *normal* case, not an edge case.

**(b) Distributions are not preserved in a simple way.** If base forecasts are Poisson, the reconciled forecast generally is not Poisson. Projection mixes count distributions into something undefined.

**(c) The sign/direction of the effect is unexpected** — see §8.2.

### 8.2 The count-specific finding

Reconciling right-skewed count forecasts:

> *"Reconciliation decreases the variance of base forecasts that are right-skewed, which is often the case with count variables: the right tail is shortened, lowering the expected values."*
> 🔗 https://arxiv.org/pdf/2303.15135

**Reconciliation systematically lowers expected count forecasts.** For PSAP work this has a direct consequence: feed reconciled counts through a convex staffing map and **you will recommend fewer staff than unreconciled forecasts do** — deliberately, for a statistical reason, not because demand fell.

### 8.3 The discrete framework

Panagiotelis et al. 🔗 https://arxiv.org/pdf/2305.18809 recast the problem: define **probabilistic coherence** for counts, then solve the reconciliation as an **assignment problem via quadratic programming optimising the Brier score**. This yields coherent **joint** probabilistic forecasts without rounding artifacts. The same paper notes that naive alternatives — continuous reconciliation plus rounding — "all of these components break down in a discrete data setting."

**Also worth knowing:** the reconciled distribution's properties have been worked out in closed form for Gaussian and Poisson bases, which is where the variance/mean results in §8.2 come from.

---

## 9. What actually wins — a synthesis

| Claim | Verdict |
|---|---|
| Independent forecasts are incoherent | ✅ Always true when a hierarchy exists |
| Reconciliation **guarantees** coherence | ✅ True |
| Reconciliation **guarantees** accuracy | ❌ **False** |
| MinT beats bottom-up | ⚠️ Usually with enough data; **not** in short samples, and not for bottom-level accuracy |
| Reconciliation improves bottom-level forecasts | ❌ Often **worse** out-of-sample (§7) |
| Reconciliation helps most at aggregates | ✅ Consistently |
| Errors are correlated across hierarchy | ✅ Hence shrinkage beats diagonal `W` |

> **The honest one-line summary:** reconciliation trades bottom-level fidelity for aggregate coherence and, in most settings, for better top-level accuracy. If your evaluation metric is computed on bottom-level series, you will conclude reconciliation fails — and that conclusion may be an artefact of where you are measuring.

---

## 10. Scalability

MinT requires inverting an `n_b × n_b` matrix; `n` series means estimating `n(n+1)/2` covariance parameters. At retail scale this is the binding constraint.

| Approach | Idea |
|---|---|
| **Sub-hierarchies** | Partition into random or cluster-based groups; reconcile within each. Works with **any** reconciliation method 🔗 https://www.tandfonline.com/doi/full/10.1080/01605682.2025.2599394 |
| **Sparse hierarchical loss** | Skip post-processing; train end-to-end with a loss that enforces coherence. ~10% RMSE/MAE improvement over reconciliation on M5 🔗 https://arxiv.org/html/2310.12809v2 |
| **Factor models** | Low-rank covariance to shrink dimensionality of `W` |
| **Robust / minimax reconciliation** | Account for *uncertainty in the estimated covariance* rather than treating it as known; semidefinite optimisation 🔗 https://arxiv.org/pdf/2510.20383 |
| **Learned projection** | ICML 2024: learn an **oblique** projection matrix end-to-end inside a neural forecaster, instead of fixing `W` a priori 🔗 https://proceedings.mlr.press/v235/tsiourvas24b.html |

> For the PSAP project the hierarchy is **tiny** — around five series. Scalability is a non-issue; the relevant question is purely statistical quality of `W`, and with 5 series you can likely afford the **full sample covariance** with shrinkage. Do not over-engineer this.

---

## 11. Reconciled probabilistic forecasts

Reconciling point forecasts is the easy case. Reconciling **distributions** is harder and was later to arrive.

- Kourentzes & Athanasopoulos (2019), Spiliotis et al. (2020) — first cross-temporal and energy-demand work
- Panagiotelis et al. (2023) — properties of reconciled distributions, Gaussian and count
- Girolimetto & Di Fonzo (2023), Girolimetto et al. (2024) — heuristics for cross-temporal
- Jeon et al. (2019), Taieb et al. (2021) — predictive distributions

The key structural fact: **a coherent point forecast is not the mean of a coherent predictive distribution.** Projecting the mean and projecting the distribution are different operations, and only the second gives calibrated intervals that respect coherence.

> **Relevance:** your conformance target `U_α` is a quantile, not a mean. Reconciling the mean and then reading off a quantile is not the same as reconciling the quantile distribution. If you combine reconciliation with conformal intervals, decide explicitly which operation you are performing — see [[Staffing_Forecasting_Experiment]] §6.

---

## 12. Software

| Tool | Notes |
|---|---|
| **Python `hierarchicalforecast`** | Nixtla. The reference implementation; MinT, shrink, OLS, structural, temporal. Works with `statsforecast` models |
| **Python `statsforecast`** | Fast base forecasters; hierarchical entry point |
| **Python `sktime`** — `ReconcilerForecaster` | 🔗 https://www.sktime.net/en/latest/api_reference/auto_generated/sktime.forecasting.reconcile.ReconcilerForecaster.html — methods `mint_cov`, `mint_shrink`, `ols`, `wls_var`, `wls_str`, `bu`, `td_fcst`. Notably offers `predict_proba`, `predict_quantiles`, `predict_var` — i.e. **probabilistic reconciliation out of the box** |
| **R `hts`** | 🔗 https://cran.r-project.org/web/packages/hts/hts.pdf — `MinT(covariance = c("shr","sam"))`, `nonnegative`, `hts`/`gts` classes |
| **R `htsDegenerateR`** | General `S`-matrix MinT for degenerate hierarchies |
| **FPP3 ch. 15** | 🔗 https://otexts.com/fpp3/hierarchical.html — gentlest textbook introduction, with runnable R |

---

## 13. Connection to the 168-point project

[[168-Point Forecast Comparison - Discrete vs Continuous]] asks whether **168 separate hour-of-week models** beat **one continuous sequence model**. That is *not* the same axis as reconciliation, and the two compose:

| Axis | Question | Method family |
|---|---|---|
| **Model structure** | 168 specialists vs. one generalist? | Discrete vs. continuous / panel |
| **Cross-series structure** | Do the series agree on the total? | Reconciliation |

They interact in two useful ways:

1. **A discrete (168-model) approach naturally yields a hierarchy** — the 168 hour-of-week slots aggregate into daily and weekly totals. Reconciliation is then directly applicable, and `S` is fixed and trivial.
2. **Reconciliation is a natural hybrid.** Fit 168 specialised models, then reconcile up to weekly totals. This directly addresses the project's stated "hybrid / hierarchical Bayesian pooling" opportunity — **reconciliation is the cheap, classical version of that pooling.**

> **A concrete suggestion for that project:** add a reconciled arm. If the continuous model wins on level accuracy but loses on weekly total accuracy, reconciliation fixes the second without retraining anything. That is a cheap, high-value experiment, and the bottom-up arm is literally free — you already have the bottom-level forecasts from the discrete models.

---

## 14. Honest gaps

| Item | Status |
|---|---|
| **Discrete reconciliation for counts** | Active research, limited software support. No mainstream package implements the Brier-score/quadratic-programming formulation — expect to implement it yourself or approximate |
| **Interaction of reconciliation with conformal intervals** | Not settled. Whether to reconcile the predictive distribution or derive intervals from reconciled point forecasts is, as far as this note establishes, unresolved |
| **`htsDegenerateR`** | Version 0.1.0 — early-stage |
| **Non-aggregatable series** | Remedies exist in the literature but no clean automatic handling; typically requires manual structure |
| **Probabilistic reconciliation** | Maturing but fragmented across packages; `sktime` is currently the most complete |

---

## References

**Foundations**
1. Hyndman, R.J., Ahmed, R.A., Athanasopoulos, G. & Shang, H.L. (2011). Optimal combination forecasts for hierarchical time series. *Computational Statistics & Data Analysis* 55(9), 2579–2589. 🔗 https://robjhyndman.com/publications/hierarchical/
2. Wickramasuriya, S.L., Athanasopoulos, G. & Hyndman, R.J. (2019). Optimal forecast reconciliation for hierarchical and grouped time series through trace minimization. *JASA* 114(526), 804–819. 🔗 https://robjhyndman.com/papers/mint.pdf
3. Athanasopoulos, G., Hyndman, R.J., Kourentzes, N. & Panagiotelis, A. (2024). Forecast reconciliation: A review. *International Journal of Forecasting* 40(2), 430–456. 🔗 https://robjhyndman.com/papers/hf_review.pdf · 🔗 https://ideas.repec.org/a/eee/intfor/v40y2024i2p430-456.html

**Variants and extensions**
4. Hyndman, R.J. & Athanasopoulos, G. (2014). Optimal reconciliation in a hierarchy. *Foresight*. 🔗 https://robjhyndman.com/papers/Foresight-hts-final.pdf
5. Athanasopoulos, G., Hyndman, R.J., Kourentzes, N. & Petropoulos, F. (2017). Forecasting with temporal hierarchies. *EJOR* 262(1), 60–74.
6. Athanasopoulos, G., Ahmed, R.A. & Hyndman, R.J. (2009). Hierarchical forecasts for Australian domestic tourism. *IJF* 25(1), 146–166.
7. Nystrup, Ø. et al. (2020). Autocorrelation-based temporal reconciliation.
8. Kourentzes, N. & Athanasopoulos, G. (2019). Cross-temporal forecast reconciliation.

**Counts and discreteness**
9. **Discrete forecast reconciliation for counts** (2023). 🔗 https://arxiv.org/pdf/2305.18809 — probabilistic coherence, Brier score, quadratic programming
10. **Properties of the reconciled distributions for Gaussian and count forecasts.** 🔗 https://arxiv.org/pdf/2303.15135 — the lower-expected-values result

**Contemporary**
11. **Rediscovering Bottom-Up: Effective Forecasting in Temporal Hierarchies** (2024). 🔗 https://arxiv.org/pdf/2407.02367
12. **Hierarchical Time Series Forecasting with Robust Reconciliation** (2025). 🔗 https://arxiv.org/pdf/2510.20383
13. Tsiourvas, A., Sun, W., Perakis, G., Chen, P.-Y. & Zhu, Y. (2024). Learning optimal projection for forecast reconciliation. *ICML* 41, PMLR 235. 🔗 https://proceedings.mlr.press/v235/tsiourvas24b.html
14. **Scalable forecast reconciliation through (un)guided sub-hierarchies** (2025). 🔗 https://www.tandfonline.com/doi/full/10.1080/01605682.2025.2599394
15. **Hierarchical Forecasting at Scale.** 🔗 https://arxiv.org/html/2310.12809v2 — sparse hierarchical loss
16. Panagiotelis, A., Kourentzes, N., Giannakopoulos, B. & Hyndman, R.J. (2023). Reconciliation via CoDA. 🔗 https://arxiv.org/pdf/2210.02503

**Software and textbooks**
17. Hyndman, R.J. & Athanasopoulos, G. (2021). *Forecasting: Principles and Practice*, 3rd ed., ch. 15. 🔗 https://otexts.com/fpp3/hierarchical.html
18. R `hts`. 🔗 https://cran.r-project.org/web/packages/hts/hts.pdf · R `htsDegenerateR`. 🔗 https://cran.r-project.org/package=htsDegenerateR
19. sktime `ReconcilerForecaster`. 🔗 https://www.sktime.net/en/latest/api_reference/auto_generated/sktime.forecasting.reconcile.ReconcilerForecaster.html

## Status

- [x] Projection framework, summing matrix, coherent subspace
- [x] GLS → MinT derivation and the `W` family, with empirical guidance
- [x] Aggregation strategies; grouped, degenerate, non-aggregatable
- [x] Temporal and cross-temporal, including the bottom-up optimality result
- [x] Counts and discreteness — the staffing-relevant case
- [x] Scalability, learned projections, probabilistic reconciliation
- [x] Software survey with verified links
- [x] Connection to [[168-Point Forecast Comparison - Discrete vs Continuous]]
- [ ] Experiment: add a reconciled arm to the 168-point comparison
- [ ] Decide reconciliation-then-interval vs interval-then-reconciliation for the conformal layer

## Cross-links

- [[time-series-forecasting-models]] — the taxonomy this note expands
- [[time_series_evaluation_metrics_benchmarks]] — how to evaluate reconciled forecasts
- [[Staffing_Forecasting_Experiment]] §6 — the application
- [[168-Point Forecast Comparison - Discrete vs Continuous]] — the related project
- [[Staffing_Sources]] — the project bibliography