---
type: reference
status: active
topic: "Combining many forecasts — Bates-Granger weights, constraints, convex optimisation, dynamic weights, combining quantile sets, and the fact that reconciliation is a constrained special case of combination."
created: 2026-10-15
tags:
  - time-series
  - forecasting
  - ensembles
  - model-combination
  - forecast-reconciliation
aliases:
  - Forecast Combination
  - Ensemble of Forecasts
  - Bates and Granger
  - Model Averaging for Forecasting
  - Stacking Forecasts
---

# Forecast Combination

Combining $m$ forecasts of the same target is the highest-return operation in practical
forecasting. It has been the single most robust finding in the literature since 1969, and the
vault has been invoking it as a law without ever stating the method.

> Written 2026-10-15. Previously: three sentences in §7 of [[time-series-forecasting-models]] and
> five appearances of Bates & Granger as "the theory underneath every ensemble" — never once cited
> in support of a statement about **how** to weight forecasts.

---

## 1. The puzzle, and why averaging wins

**Bates, J.M. & Granger, C.W.J. (1969). "The Combination of Forecasts." *Operational Research
Quarterly* 20(4), 451–468.** 🔗
[10.1057/jors.1969.103](https://doi.org/10.1057/jors.1969.103) (Palgrave reprint; JSTOR
[10.2307/3008764](https://doi.org/10.2307/3008764))

The original result, and the reason this note exists:

> **A simple average of forecasts that are each individually worse can beat all of them.**

This is the **forecast combination puzzle**. It holds because forecast errors are typically
positively correlated — when one model is wrong, its competitors are usually wrong in the same
direction, and averaging cancels the idiosyncratic parts. A more complex model is not necessarily
better-informed; it is often just more exposed to its own estimation noise.

> **⚠️ A citation correction.** The paper is in ***Operational Research Quarterly*** — the
> `JORS` DOI above is the Palgrave reprint of the same article; several sources mislabel the
> journal as "Operations Research Quarterly."

**M4 confirmed it at scale:** the combination of all submitted methods beat every individual
method, and *robustness* — leave-one-out stability of the ranking — predicted performance better
than average accuracy. See Montero-Manso & Hyndman (2021), 🔗
[arXiv:2003.07823](https://arxiv.org/abs/2003.07823).

**The review citation** is Wang, X., Hyndman, R.J., Li, F. & Kang, Y. (2023). "Forecast
combinations: An over 50-year review." *IJF* 39(4), 1518–1547 🔗
[10.1016/j.ijforecast.2022.11.005](https://doi.org/10.1016/j.ijforecast.2022.11.005) · preprint 🔗
[arXiv:2205.04216](https://arxiv.org/abs/2205.04216).

> **⚠️ The paper most often cited here does not exist.** *"Timmermann, Smith & Wall (2019),
> Forecast combinations: a review and the future, IJF"* — this could not be found in Crossref,
> OpenAlex, or any author record, and it is **not** in the IJF tables of contents for 2019, 2020,
> 2022–2025. Use **Wang, Hyndman, Li & Kang (2023)** above. The economics-side review is
> Timmermann (2006), *Handbook of Economic Forecasting* Vol. 1, ch. 4 🔗
> [10.1016/S1574-0706(05)01004-9](https://doi.org/10.1016/S1574-0706(05)01004-9).

---

## 2. The method taxonomy

### 2.1 Distribution-free (no weights estimated)

| Method | Rule | When |
|---|---|---|
| **Simple average** | $\hat y = \frac{1}{m}\sum_i \hat y_i$ | **The default.** Robust, no estimation risk |
| **Median** | Central value | Robust to a divergent member |
| **Trimmed mean** | Drop top/bottom $k$ | Robust with more members |

### 2.2 Weight-estimated

| Method | Constraint | Note |
|---|---|---|
| **Unconstrained LS** | None | Bates–Granger original. **Weights need not sum to 1 and can be negative** — optimal in-sample, often poor out |
| **Inverse-error-variance** | $w \propto \Sigma_f^{-1}\mathbf{1}/(\mathbf{1}^\top\Sigma_f^{-1}\mathbf{1})$ | Only valid if errors are uncorrelated |
| **Constrained / simplex LS** | $w_i \ge 0$, $\sum_i w_i = 1$ | **The practical default.** Never worse than the average asymptotically |
| **Shrinkage / ridge** | Penalise departure from equal weights | Bridges §2.1 and §2.2 |

> **Why constrain?** Elliott & Timmermann (2004) 🔗
> [10.1016/j.jeconom.2003.10.019](https://doi.org/10.1016/j.jeconom.2003.10.019) show that the
> unconstrained optimum can violate $\sum w_i = 1$ — and in finite samples that costs accuracy. The
> constrained estimator is **asymptotically no worse than the simple average** and usually much
> better. **Ship non-negative, sum-to-one weights.**

### 2.3 Dynamic / time-varying weights

Equal forecast information coefficients, windowed OLS, exponentially weighted OLS, stochastic
gradient. See Guidolin & Timmermann (2009), *J. Econometrics* 🔗
[10.1016/j.jeconom.2008.12.004](https://doi.org/10.1016/j.jeconom.2008.12.004).

> **The honest caveat:** dynamic weights add estimation variance, and the gain is real but modest.
> They help when the *relative* skill of components genuinely changes — which for a PSAP means
> after a system change. Before you reach for them, see [[Change-Point Detection]]: the honest
> answer to "which model should I trust now?" is often "none of them, the regime moved."

### 2.4 Feature-based selection — FFORMA

**Montero-Manso, P., Athanasopoulos, G., Hyndman, R.J. & Talagala, T.S. (2020). "FFORMA: Feature-based
forecast model averaging." *IJF* 36(1), 86–92.** 🔗
[10.1016/j.ijforecast.2019.02.011](https://doi.org/10.1016/j.ijforecast.2019.02.011)

When you have many series, **weight each model's forecast by how well it has historically done on
that series**, using series-level characteristics. This is the canonical answer to "combining
*hundreds* of forecasts." For sparse weights across many correlated forecasts see Diebold & Shin
(2019), *IJF* 35(4) 🔗 [10.1016/j.ijforecast.2018.09.006](https://doi.org/10.1016/j.ijforecast.2018.09.006).

### 2.5 Bayesian model averaging / linear pooling

Yao, Vehtari, Simpson & Gelman (2018), "Using stacking to average Bayesian predictive
distributions," *Bayesian Analysis* 13(3), 917–1007 🔗
[10.1214/17-BA1091](https://doi.org/10.1214/17-BA1091) — the Bayesian answer to linear pooling
being over-dispersed.

---

## 3. The convex picture

This is the cleanest way to hold the whole thing.

The forecasts of a target form a **convex hull** in forecast space:

```
        ŷ_B (continuous)
            ●
           / \
          /   \
   ŷ_1 ●─┼─────● ŷ_C      every point inside is a combination
         \   /               every combination is "not worse than the
          \ /                average" under mild conditions
     ŵ_A ●─●  ŷ_D
```

- Any **non-negative, sum-to-one** weighting stays inside the hull. That is why constrained LS is
  asymptotically safe and unconstrained LS is not.
- For a **hierarchy** the compatible set is a **convex cone** generated by the base (bottom-up)
  forecast matrices, and the sum-to-one + non-negativity constraints are exactly the coherence
  conditions.

---

## 4. Combination vs reconciliation — the relationship

This is the part most people get backwards.

| | **Combination** | **Reconciliation** |
|---|---|---|
| **Inputs** | $m$ forecasts of the **same** target | $K$ forecasts of **different** targets in a hierarchy/grouping |
| **Goal** | **Improve accuracy**, reduce model risk | **Enforce coherence** — base forecasts sum to aggregates |
| **Constraints** | Optional (for numerical stability) | **Mandatory** — the aggregation constraints |
| **Guarantees accuracy?** | Yes, in expectation | **No** — coherence, not accuracy |
| **Relation** | General | **A constrained special case** |

**Hyndman, Ahmed, Athanasopoulos & Shang (2011)** 🔗
[10.1016/j.csda.2011.03.006](https://doi.org/10.1016/j.csda.2011.03.006) derives reconciliation
*as* a constrained combination problem. **Di Fonzo & Girolimetto (2024)** 🔗
[10.1016/j.ijforecast.2022.07.001](https://doi.org/10.1016/j.ijforecast.2022.07.001) makes the
bridge explicit: reconciliation **is** forecast combination subject to the aggregation constraints.

> **So: you cannot reconcile without first knowing how to combine.** The combination step is a
> prerequisite, not an optional extra. [[forecast-reconciliation]] §13 proposes MinT as "the hybrid"
> — MinT *is* a constrained least-squares combination. Nothing else is needed, but the vocabulary
> matters for reading the literature.

---

## 5. Combining probabilistic forecasts

For a staffing application this matters more than the point-forecast case, because **what a
manager consumes is a distribution, not a number.**

### 5.1 Linear pooling

Average the CDFs. **Ranjan & Gneiting (2010), "Combining probability forecasts," *JRSS-B* 72(1),
71–91** 🔗 [10.1111/j.1467-9868.2009.00726.x](https://doi.org/10.1111/j.1467-9868.2009.00726.x)
shows that under convexity/relative-entropy conditions **linear pooling is minimax-optimal** — the
probabilistic analogue of "averaging beats optimal weights."

### 5.2 Quantile averaging (vincentization)

Average the $\alpha$-quantiles across forecasts. Good under some conditions, degrades for heavily
skewed distributions.

### 5.3 The practical recipe

| Target | Combine | Score with |
|---|---|---|
| Point forecasts | Constrained LS (nonneg, sum-to-one) | MAE / MASE |
| Quantile sets | Quantile averaging or linear pooling | WIS / Quantile Score |
| **The full distribution** | Linear pooling, then calibrate | **rPIT + WIS** — see [[Count Distributions and Kolassa Evaluation]] |

> **⚠️ There is no machinery in the vault for combining 169 quantile sets into one calibrated
> distribution.** `forecast-reconciliation.md` §6 flags the related problem — *"a coherent point
> forecast is not the mean of a coherent predictive distribution"* — but no solution is given. This
> is a real open implementation task.

### 5.4 Count-specific

**Corani, Azzimonti & Rubattu (2024). "Probabilistic reconciliation of count time series." *IJF*
40(2), 457–469** 🔗
[10.1016/j.ijforecast.2023.04.003](https://doi.org/10.1016/j.ijforecast.2023.04.003) — reconciliation
for counts. For count **combination**, see the scoring discussion in
[[Count Distributions and Kolassa Evaluation]].

---

## 6. What this means for the 168-point study

The study produces **169 forecasts per origin** and never combines them. Three consequences:

### 6.1 The combination arm is the one you would actually ship

If you must deploy one thing, it is the combination — and the study has no data on whether the
combination beats either arm. That is a free, high-value result.

### 6.2 Nested comparison makes stacking the valid estimator

[[Model Validation Strategies]] §4 notes that with 168 models each a specialisation of a shared
architecture you are in the **nested** case, where ordinary DM tests over-reject. **Regression-based
combination (stacking the 168 discrete forecasts plus 1 continuous forecast on a rolling training
window) is the estimator that is valid under nesting.** It is also what the arms' forecasts are
naturally suited to.

### 6.3 Combine over time as well as across hours

Your hierarchy is **temporal** as well as cross-sectional: hourly → daily → weekly → annual.
Athanasopoulos, Hyndman, Kourentzes & Petropoulos (2017), "Forecasting with temporal
hierarchies," *EJOR* 262(1), 60–74 🔗
[10.1016/j.ejor.2017.02.046](https://doi.org/10.1016/j.ejor.2017.02.046) — R: `thief`.

> **Worth knowing:** that paper's case study is **Accident & Emergency departments.** Emergency
> demand with temporal aggregation is the closest published precedent to what you are doing. See
> also Spiliotis et al. (2020), *Applied Energy* 261, 114339 🔗
> [10.1016/j.apenergy.2019.114339](https://doi.org/10.1016/j.apenergy.2019.114339) on
> cross-temporal aggregation.

> **⚠️ An attribution correction.** This paper is frequently cited as *"Vincent, Hyndman &
> Kourentzes"*. **Vincent is not an author.** The correct attribution is Athanasopoulos, Hyndman,
> Kourentzes & Petropoulos (2017).

---

## 7. Assessment

**Strengths**
- **Highest expected return per unit of effort** of anything in this vault. A simple average of a
  diverse panel reliably beats its best member.
- Distribution-free options (simple average) carry **zero estimation risk**.
- Reconciliation falls out of the same machinery.
- Valid under the nested-comparison structure the 168-point study creates.
- The combination is interpretable as "how much do I trust each arm."

**Weaknesses and cautions**
- **Weights estimated on the same data you evaluate on are optimistic.** Estimate them on a rolling
  training window, never on the test set. See [[Model Validation Strategies]] §1.
- Dynamic weights add variance; the benefit is real but modest.
- Combining **badly correlated** forecasts gains nothing — diversity is the source of the benefit,
  so check the error correlation matrix before building an elaborate scheme.
- Point-forecast combination and distributional combination are different problems and the vault
  currently solves neither completely.
- **Constrained weights are not a guarantee of coherence** — you still need the aggregation
  constraints, which is the reconciliation step.

---

## 8. Try it

- [ ] Combine the study's 169 forecasts with a **simple average** as the cheapest possible arm, then
      with **constrained (nonneg, sum-to-one) LS**. Compare both to the better single arm
- [ ] Report the estimated weight vector as a heatmap over the 168 hours. A weight pattern that
      mirrors the hour-of-week profile is itself a finding about which hours the continuous model
      is good at
- [ ] **Check error correlations first.** Plot the correlation matrix of the 169 forecast errors. If
      they are all ≈1, combination gains nothing and you should say so rather than building a scheme
- [ ] Estimate weights on a rolling window and re-estimate each origin — then compare against
      static weights. This quantifies how much dynamic weighting is worth
- [ ] Combine **quantiles** rather than points, and score the result with WIS and rPIT
      ([[Count Distributions and Kolassa Evaluation]])
- [ ] Build the **temporal** hierarchy — hourly/daily/weekly/annual — and test whether
      cross-temporal reconciliation beats hour-only combination
- [ ] Check whether the combination's recommended headcount differs from either arm's. That
      question sits at the boundary with [[forecast-reconciliation]] §8

## References

1. Bates, J.M. & Granger, C.W.J. (1969). The combination of forecasts. *Operational Research
   Quarterly* 20(4), 451–468. 🔗 https://doi.org/10.1057/jors.1969.103 ⭐
2. Wang, X., Hyndman, R.J., Li, F. & Kang, Y. (2023). Forecast combinations: An over 50-year
   review. *IJF* 39(4), 1518–1547. 🔗 https://doi.org/10.1016/j.ijforecast.2022.11.005 · preprint 🔗
   https://arxiv.org/abs/2205.04216 ⭐ **the review to read first**
3. Timmermann, A. (2006). Chapter 4: Forecast combinations. In *Handbook of Economic Forecasting*
   Vol. 1, 135–196. 🔗 https://doi.org/10.1016/S1574-0706(05)01004-9
4. Elliott, G. & Timmermann, A. (2004). Optimal forecast combinations under general loss functions
   and forecast error distributions. *J. Econometrics* 122(1), 47–79. 🔗
   https://doi.org/10.1016/j.jeconom.2003.10.019 ⭐ **why the constraints exist**
5. Timmermann, A. (2005). Optimal forecast combination under regime switching. *Int. Economic
   Review* 46(4), 1081–1102. 🔗 https://doi.org/10.1111/j.1468-2354.2005.00361.x
6. Guidolin, M. & Timmermann, A. (2009). Dynamic forecast combinations. *J. Econometrics* 🔗
   https://doi.org/10.1016/j.jeconom.2008.12.004
7. Montero-Manso, P., Athanasopoulos, G., Hyndman, R.J. & Talagala, T.S. (2020). FFORMA:
   Feature-based forecast model averaging. *IJF* 36(1), 86–92. 🔗
   https://doi.org/10.1016/j.ijforecast.2019.02.011 ⭐ **combining many models**
8. Diebold, F.X. & Shin, M. (2019). Machine learning for regularized survey forecast combination.
   *IJF* 35(4), 1679–1691. 🔗 https://doi.org/10.1016/j.ijforecast.2018.09.006
9. Montero-Manso, P. & Hyndman, R.J. (2021). Attributes that define forecasting benchmarks. 🔗
   https://arxiv.org/abs/2003.07823 — the M4 robustness finding

**Reconciliation and probabilistic combination**

10. Hyndman, R.J., Ahmed, R.A., Athanasopoulos, G. & Shang, H.L. (2011). Optimal combination
    forecasts for hierarchical time series. *CSDA* 55(9), 2579–2589. 🔗
    https://doi.org/10.1016/j.csda.2011.03.006 ⭐ **reconciliation as constrained combination**
11. Wickramasuriya, S.L., Athanasopoulos, G. & Hyndman, R.J. (2019). Optimal forecast reconciliation
    for hierarchical and grouped time series through trace minimization. *JASA* 114(526),
    804–819. 🔗 https://doi.org/10.1080/01621459.2018.1448825
12. Di Fonzo, T. & Girolimetto, D. (2024). Forecast combination-based forecast reconciliation:
    Insights and extensions. *IJF* 40(2), 490–514. 🔗
    https://doi.org/10.1016/j.ijforecast.2022.07.001
13. Athanasopoulos, G., Hyndman, R.J., Kourentzes, N. & Panagiotelis, A. (2024). Forecast
    reconciliation: A review. *IJF* 40(2), 430–456. 🔗
    https://doi.org/10.1016/j.ijforecast.2023.10.010
14. Athanasopoulos, G., Hyndman, R.J., Kourentzes, N. & Petropoulos, F. (2017). Forecasting with
    temporal hierarchies. *EJOR* 262(1), 60–74. 🔗 https://doi.org/10.1016/j.ejor.2017.02.046
15. Spiliotis, E., Petropoulos, F., Kourentzes, N. & Assimakopoulos, V. (2020). Cross-temporal
    aggregation. *Applied Energy* 261, 114339. 🔗 https://doi.org/10.1016/j.apenergy.2019.114339
16. Ranjan, R. & Gneiting, T. (2010). Combining probability forecasts. *JRSS-B* 72(1), 71–91. 🔗
    https://doi.org/10.1111/j.1467-9868.2009.00726.x ⭐ **linear pooling**
17. Yao, Y., Vehtari, A., Simpson, D. & Gelman, A. (2018). Using stacking to average Bayesian
    predictive distributions. *Bayesian Analysis* 13(3), 917–1007. 🔗
    https://doi.org/10.1214/17-BA1091
18. Corani, G., Azzimonti, D. & Rubattu, N. (2024). Probabilistic reconciliation of count time
    series. *IJF* 40(2), 457–469. 🔗 https://doi.org/10.1016/j.ijforecast.2023.04.003

## Cross-links

- [[forecast-reconciliation]] — the constrained special case; §8 on the convex-hull staffing claim
- [[time-series-forecasting-models]] §7 — where this was invoked without a method
- [[Model Validation Strategies]] §4 — nested comparison; rolling-window weight estimation
- [[Hierarchical and Mixed-Effects Models for Forecasting]] — sharing information *during*
  estimation, complementary to combination
- [[Count Distributions and Kolassa Evaluation]] — scoring the combined distribution
- [[Change-Point Detection]] — when dynamic weights are worth the variance
- [[Benchmarks and Datasets]] — M4/M5 combination results
