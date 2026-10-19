---
type: reference
status: active
topic: "Gradient boosting — the stagewise additive algorithm, its two distinct uses in forecasting (over engineered features vs over decomposition components), and the leakage and extrapolation traps that make it fail quietly on time series."
created: 2026-10-15
tags:
  - time-series
  - forecasting
  - gradient-boosting
  - machine-learning
  - xgboost
  - statistics
aliases:
  - Gradient Boosting
  - GBDT
  - XGBoost
  - Boosted Trees
---

# Gradient Boosting for Time Series

Gradient boosting fits an **additive ensemble of weak learners by stagewise residual correction**.
It is the strongest single model family in tabular forecasting when you have good features, and
it is badly suited to time series in three specific, predictable ways.

> Written 2026-10-15. Previously a subsection in [[time-series-forecasting-models]] §3 and a
> paragraph in [[resources]] §3.6. Now treated properly.

---

## 1. The algorithm

### 1.1 Friedman's formulation

Initialize with a constant $\hat{f}_0(x) = \arg\min_c \sum_i L(y_i, c)$. Then for $m = 1..M$:

$$
\begin{aligned}
r_{im} &= -\left[\frac{\partial L(y_i, f(x_i))}{\partial f(x_i)}\right]_{f = \hat{f}_{m-1}} &&\text{(negative gradient = pseudo-residual)}\\
\hat{f}_m(x) &= \hat{f}_{m-1}(x) + \sum_j \gamma_{mj} h_j(x) &&\text{(stagewise additive expansion)}\\
\gamma_{mj} &= \arg\min_\gamma \sum_i L(y_i, \hat{f}_{m-1}(x_i) + \gamma h_j(x_i)) &&\text{(line search)}
\end{aligned}
$$

Three pieces, and they are the whole thing:

| Piece | What it is | Time series analogue |
|---|---|---|
| **Pseudo-residual** | Not the raw error — the negative gradient of the loss w.r.t. the prediction. For squared error it *is* the residual | Where a changepoint model fits its next segment |
| **Weak learner** | A shallow tree, or in [[ThymeBoost]] a trend/seasonal estimator | Which component of the signal is being corrected |
| **Line search / shrinkage** | A per-leaf step size, $\nu \in (0,1]$ | `trend_lr`, `seasonality_lr`, `exogenous_lr` |

### 1.2 Why the shrinkage rate is the important knob

$\nu$ scales each new tree's contribution. $\nu = 1$ overfits fast; $\nu = 0.05$ for 500 rounds
usually beats $\nu = 1$ for 50. The theoretical justification is that shrinking each step converts
an aggressive stagewise search into something closer to gradient descent with a small step size —
same direction, slower, more stable.

> **The distinction that trips people up:** $\nu$ (shrinkage) and $M$ (number of rounds) are *not*
> interchangeable in practice, though both regularize. Lower $\nu$ and more rounds is nearly
> always better than higher $\nu$ and fewer. Tune them as a pair, or tune $M$ and let early
> stopping find it — do not fix $M$ and tune only $\nu$.

### 1.3 Model selection criteria

The `$M$`-vs-`$M$` trade is a bias–variance trade, so AIC/BIC applies directly. ThymeBoost's
`global_cost` implements exactly these (`r` = complexity exponent, default 1.2):

| Option | Penalty | In ThymeBoost |
|---|---|---|
| **AIC** | `2c + n·log(SSE/n)` | `'maic'` |
| **AICc** | `(2c² + 2c)/(n−c−1) + 2c + n·log(SSE/n)` | `'maicc'` — **the default** |
| **BIC** | `c·log(n) + n·log(SSE/n)` | `'mbic'` |

| Variant | When |
|---|---|
| AICc / `'maicc'` | **Default.** Big correction for small $n$ |
| BIC / `'mbic'` | Heavier penalty — correct when you believe the model is misspecified and want fewer rounds |
| Plain MSE | **No complexity penalty at all.** Boosting becomes unbounded; you must set `n_rounds` yourself |

> **A real gotcha in the ThymeBoost implementation:** the complexity counter has a dead branch
> that means **seasonal terms are never counted** toward `c`. So the AICc penalty is
> systematically understated and the model will over-round on seasonal data. Do not trust the
> reported cost as a real AIC — set `n_rounds` yourself. See [[ThymeBoost]] §2.4.

---

## 2. Two different things people mean

This is the distinction that matters, and it is usually blurred.

### (A) Boosting over an engineered feature matrix

XGBoost / LightGBM / CatBoost applied to a lag-and-calendar design matrix. The base learner is a
**tree over features**; each round corrects the previous ensemble's predictions.

**This is the mainstream interpretation** and what [[resources]] §3.6 and
[[time-series-forecasting-models]] §3 describe.

### (B) Boosting over a structural decomposition

[[ThymeBoost]] — each base learner is a **trend, seasonal, or exogenous estimator**; each round
corrects the previous components' sum, in a fixed component order.

**This is a different algorithm wearing the same name.** The trees are gone; the model structure
is back. See [[Time Series Decomposition]] §8.

| | (A) Feature-based | (B) Component-based |
|---|---|---|
| Base learner | Shallow decision tree | Trend / seasonal / exog estimator |
| Regularisation | Tree depth, `min_child_weight`, column subsampling | Which estimator, and its own params |
| Structure imposed | **None** — you hand it a matrix | **Strong** — trend → seasonality → exog, additive |
| Feature engineering | **The entire cost of the approach** | Largely avoided — seasonality is not a feature |
| Extrapolation | Impossible | Possible if a trend estimator extrapolates |
| Interpretability | Feature importance (partial dependence) — **but see [[Feature Importance and Explainability]] on why every method understates on a lag matrix** | Direct component plots |
| Scales to many series | Yes — global model with series ID | No — single series only |

> **Neither is strictly better.** (A) wins when you have rich, genuinely informative exogenous
> features. (B) wins when the series is clean, the structure is known, and you want the forecast
> to be explainable to a staffing audience. For most 9-1-1 work, **both belong in the panel** —
> which is the general argument of [[time-series-forecasting-models]] §7.

---

## 3. The three ways it fails on time series

These are not implementation details. They are the reasons GBDT is not the default answer.

### 3.1 No extrapolation

**A tree cannot predict outside the range of its training targets.** Splits are comparisons
`x_j < t`; beyond the maximum observed target, every point falls in the same leaf.

```
Training targets max = 100  →  no path in the tree yields > 100
```

If a GBDT was trained on a period with no major incidents, it will never forecast an incident
peak. **This is disqualifying for any series with genuine trend or level drift**, and it is exactly
the wrong failure mode for emergency call volume.

**Mitigations:** fit the model on the *detrended* residual and re-add an extrapolating trend
(component-based boosting does this natively); clip/pad the target range; or use a model class
that extrapolates by construction.

### 3.2 Error accumulation in recursive multi-step

Most GBDT forecasting implementations are **recursive** — fit a one-step model, predict one step,
append the prediction to the history, predict again, repeat `h` times. Each prediction is a
contaminated input to the next.

```
true:          y₁ y₂ y₃ y₄ y₅ y₆
predicted:     y₁ y₂ y₃ ŷ₄ ŷ₅ ŷ₆
                              ↑ ŷ₄ is an input to predicting ŷ₅
```

Horizon-dependent error growth, and it is the single largest driver of GBDT's poor long-horizon
performance relative to direct models. This is the "error-accumulation question" in
[[time-series-forecasting-models]] §1, and the reason [[Linear Models for Forecasting]] §2
exists.

> **If you build a GBDT panel, pin the direct-vs-recursive setting explicitly and record it.** The
> Nixtlaverse note flags that different libraries default differently here, and an unpinned
> comparison will silently confound the result.

### 3.3 The feature engineering burden, and the leakage it invites

Nothing in a tree knows that `lag_168` means "same hour last week". Every lag, rolling window,
calendar flag, and encoding is your decision. And the dangerous part is not the effort — it is
that **feature construction is exactly where time-series leakage enters**, because the rolling
window has to be computed identically at fit time and at predict time or the model silently reads
the future. See [[Model Validation Strategies]] §1.

---

## 4. The main implementations

| | XGBoost | LightGBM | CatBoost |
|---|---|---|---|
| Paper | Chen & Guestrin (2016) 🔗 [arXiv:1603.02754](https://arxiv.org/abs/1603.02754) | Ke et al. (2017) 🔗 [NeurIPS](https://proceedings.neurips.cc/paper/2017/hash/6449f44a102fde848669bdd9eb6b76fa-Abstract.html) | Prokhorenkova et al. (2018) 🔗 [arXiv:1706.09516](https://arxiv.org/abs/1706.09516) |
| Tree growth | **Level-wise** (depth-limited) | **Leaf-wise** — grows the highest-gain leaf, unbounded depth | **Symmetric (oblivious)** — same split at every depth |
| Split finding | Exact, weighted quantiles | **Histogram-based** — bin once, then reuse | Histogram + ordered boosting |
| Ordered boosting | No | No | **Yes** — the distinguishing feature |
| Native categoricals | No | No (needs encoding) | **Yes** |
| Regularisation | L1/L2 on leaf weights, `gamma`, subsampling | `min_data_in_leaf`, `lambda` | Ordered boosting, `l2_leaf_reg` |

### The distinctions that actually matter for forecasting

**Level-wise vs leaf-wise** (XGBoost vs LightGBM). Leaf-wise trees grow greedily to whatever
single split helps most, so they reach high accuracy fast and **overfit on small, noisy data**.
Level-wise trees honour the depth cap. For a few years of hourly call volume, leaf-wise with a
tight `min_data_in_leaf` is fine; leaf-wise with the default 20 on a sparse series is not.

**Ordered boosting** (CatBoost only). Standard GBDT splits on the target statistics of a feature
across the training set, which leaks target information into the split. Ordered boosting computes
statistics from a **permutation-invariant prefix** instead, and handles categorical features
natively without target encoding. This is why CatBoost tends to win on time series with calendar
and location features — it removes a whole class of leakage rather than just performing well.

> **The honest summary:** CatBoost's ordered boosting is the substantive engineering advantage;
> "oblivious trees are fast" is a throughput claim. The **staged/ordered** implementation in
> CatBoost is what reduces target-statistic leakage. If you only remember one thing from this
> table, make it that.

### Survey of applications to time series

The literature and competition record is consistent: **GBDTs are at or near the top whenever the
problem is genuinely tabular** — power load with weather, precipitation, retail demand with
promotions and holidays, financial series with engineered factors. They are **weaker on
long-horizon forecasting of clean univariate series**, where the LTSF-Linear result applies and a
linear model matches or beats them ([[Linear Models for Forecasting]]).

---

## 5. Fitting a GBDT for time series

### The feature set that actually works

```python
lags        = [1, 2, 3, 24, 48, 168]        # daily + weekly; 168 is the important one
rollings    = {"mean": [24, 168], "std": [168]}
time_idx    = {"hour", "dayofweek", "weekofyear"}
exog        = ["temperature", "precip", "holiday_flag", "is_school_day"]
```

For hourly PSAP call volume: **include `lag_168` and rolling statistics over 168, not 24.** The
hour-of-week profile is the dominant structure and a model that only sees `lag_24` is blind to
weekday/weekend differences.

### Practical settings

| Parameter | Start at | Why |
|---|---|---|
| `n_estimators` | 200–1000 | With early stopping, set high and let it stop |
| `learning_rate` | 0.02–0.05 | **Low.** Pair with many rounds |
| `max_depth` | 3–6 | Depth is capacity; do not tune it last |
| `min_child_weight` / `min_data_in_leaf` | Raise it | Your series is short and noisy |
| `subsample` | 0.7–0.9 | Mild stochasticity helps |
| Early stopping | **On, always** | It *is* the `n_rounds` control ThymeBoost lacks |
| Objective | `reg:squarederror` (point) or quantile | Quantile loss → native quantiles; score with pinball ([[Generative and Probabilistic Forecasting]]) |

### The evaluation rule

**Use rolling-origin cross-validation with `refit` semantics you record explicitly**, and check
that `shift`/window construction never lets a lag feature read past the fold boundary. The
"test the model vs test the refit" distinction is in [[Model Validation Strategies]] §2; GBDTs
are unusually sensitive to it because early stopping is itself a fitted quantity.

---

## 6. Assessment

**Strengths**
- Best-in-class when there are **rich exogenous features**.
- Nonlinearity and interactions for free — no basis function specification.
- Fast to iterate, well-understood failure modes, enormous practical literature.
- CatBoost removes target-statistic leakage, which matters more here than it does in most domains.
- Quantile loss gives native probabilistic output.

**Weaknesses**
- **No extrapolation** — disqualifying for trend and level drift.
- **Error accumulation** under recursive multi-step, severe at long horizons.
- **Manual feature engineering** is the entire cost, and it does not scale to many series.
- Scaling to a panel means either per-series fits (slow) or a global model with series IDs.
- **The complexity is invisible.** You have no decomposition to plot, no changepoint list, and no
  component to explain. For a staffing conversation this is a real liability.
- Intervals from quantile loss are only *marginal* — conditional coverage at peaks is the open
  problem ([[Model Validation Strategies]] §6.4).

> **Where this leaves model choice.** GBDT belongs in the panel for exogenous-driven problems and
> should be *absent* from any panel evaluating clean-structure extrapolation. The right instinct
> is the one the whole vault keeps arriving at: **build the diverse panel and average it**
> ([[time-series-forecasting-models]] §7).

## 7. Try it

- [ ] Fit CatBoost with `lags=[24, 168]` + calendar + exog and compare to the same feature set
      with `lags=[24]` only — quantify what the weekly lag is worth
- [ ] Plot a LightGBM default-settings fit against a `min_data_in_leaf=200` fit on a sparse
      hourly series and watch leaf-wise growth overfit
- [ ] **Demonstrate §3.1 directly:** train on a period with no incidents, ask for a forecast
      above the training maximum, and confirm the model flatlines
- [ ] Fit the same model direct vs recursive at `h=168` and plot the two error curves
- [ ] Add a `trend_estimator`-style feature (a linear time index) and show that the model still
      will not extrapolate — trees cannot use it, which is the point of §3.1
- [ ] In [[ThymeBoost]], run `n_rounds=10` with cost tracking and confirm cost *rises* while
      rounds are accepted; then compare against leaving `n_rounds` unset
- [ ] Cross-read [[Time Series Decomposition]] §8 against this §2 — the two framings are the same
      idea from opposite ends

## References

**Boosting**

1. Friedman, J.H. (2001). Greedy function approximation: a gradient boosting machine. *Annals of
   Statistics* 29(5), 1189–1232. 🔗 https://doi.org/10.1214/aos/1013203451
2. Friedman, J.H. (2002). Stochastic gradient boosting. *Annals of Statistics* 30(1).
3. Bühlmann, P. & Yu, B. (2003). Boosting with the L2 loss: regression and classification.
   *JASA* 98(463).
4. Hastie, T., Tibshirani, R. & Friedman, J. (2009). *The Elements of Statistical Learning*, 2nd ed.
   §10 — https://hastie.su.domains/ElemStatLearn/

**Implementations**

5. Chen, T. & Guestrin, C. (2016). XGBoost: A scalable tree boosting system. 🔗
   https://arxiv.org/abs/1603.02754
6. Ke, G. et al. (2017). LightGBM: A highly efficient gradient boosting decision tree. 🔗
   https://proceedings.neurips.cc/paper/2017/hash/6449f44a102fde848669bdd9eb6b76fa-Abstract.html
7. Prokhorenkova, L. et al. (2018). CatBoost: unbiased boosting with categorical features. 🔗
   https://arxiv.org/abs/1706.09516

**Time series context**

8. Zeng, A. et al. (2023). Are Transformers Effective for Time Series Forecasting? 🔗
   https://arxiv.org/abs/2205.13504 — the result that constrains when GBDT is worth reaching for
9. Montero-Manso, P. & Hyndman, R.J. (2021). Attributes that define forecasting benchmarks. 🔗
   https://arxiv.org/abs/2003.07823

## Cross-links

- [[Time Series Decomposition]] — the other boosting formulation
- [[ThymeBoost]] — the component-based implementation
- [[time-series-forecasting-models]] §3 — where this sits in the family taxonomy
- [[Model Validation Strategies]] — rolling origin, leakage, conditional coverage
- [[Linear Models for Forecasting]] — the result that limits when this family is worth it
- [[Nixtlaverse]] §4 — `MLForecast` and its feature-construction burden
- [[Feature Importance and Explainability]] — reading the fitted model back: built-in importances, SHAP, and why they mislead on a lag matrix
- [[resources]] §3.6 — the application survey
