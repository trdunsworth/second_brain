---
type: reference
status: active
topic: "Reading back which engineered features earned their place — SHAP, permutation importance, PDP/ICE and ALE — and why every one of them understates importance for a collinear lag/rolling matrix unless you fix it deliberately."
created: 2026-10-15
tags:
  - time-series
  - forecasting
  - explainability
  - feature-importance
  - shap
  - machine-learning
aliases:
  - Feature Importance
  - Explainability
  - SHAP
  - Permutation Importance
  - Model Interpretability
---

# Feature Importance and Explainability

You built a feature matrix — `lag_24`, `lag_168`, `rolling(168).mean()`, `hour_of_week`, weather,
holidays — from [[Feature Engineering for Time Series]]. **Now: which of them earned their place?**

The honest answer up front: **for a collinear feature matrix, most attribution methods understate
importance, and no method fixes it by default.** This note is the method taxonomy plus the four
traps, and the traps are the more useful half.

> Written 2026-10-15. Previously **one line** in [[Gradient Boosting for Time Series]] §7
> ("Feature importance (partial dependence)") and nothing else.

---

## 1. The trap that applies directly to your matrix

`lag_24`, `lag_168` and `rolling(168).mean()` are **strongly correlated by construction** — the
rolling mean over the last week is literally a weighted average of `lag_168` and its neighbours.
And the literature is unambiguous about what that does:

> *"When two features are correlated and one of the features is permuted, the model still has access
> to the latter through its correlated feature. This results in a **lower reported importance value
> for both features, though they might actually be important**."*
> — scikit-learn user guide, §5.2.3

> *"Adding a correlated feature can decrease the importance of the associated feature by **splitting
> the importance between both features**."* — Molnar, *Interpretable Machine Learning*, Ch. 23. His
> worked example is two highly-correlated temperature readings knocking a top-ranked feature "from
> the top of the importance ladder to mediocrity" — which is **exactly the `lag_168` /
> `rolling(168)` problem**.

**So a naive importance ranking of this feature matrix will tell you that `lag_24`,
`lag_168` and `rolling(168)` are *each* mediocre, when in fact the *jointly* they carry almost all
of the signal.** Reading that ranking as "the weekly features don't matter" is the specific,
predictable, and entirely avoidable error. See §5.

---

## 2. The method taxonomy

### 2.1 Permutation importance — the one to start with

**Breiman (2001). "Random Forests." *Machine Learning* 45(1):5–32.** 🔗
`10.1023/A:1010933404324`

> **⚠️ Two citation traps.** (1) The widely-circulated DOI `10.1023/A:1010950718922` is **wrong** —
> use `10.1023/A:1010933404324`. (2) Permutation importance **is** defined in Breiman 2001, but in
> its **OOB** form, not the arbitrary-held-out-set form scikit-learn implements. Breiman's paper
> also defines *two* importance measures — OOB permutation importance **and** mean-decrease-in-impurity —
> and the impurity one carries the well-known high-cardinality bias.

Breiman §5, verbatim: *"After each tree is constructed, the values of the m$^{th}$ variable in the
out-of-bag examples are randomly permuted and the out-of-bag data is run down the corresponding
tree… the plurality of out-of-bag class votes for x$_n$ with the m$^{th}$ variable noised up is
compared with the true class label of x$_n$ to give a misclassification rate."*

**Model Class Reliance** — Fisher, Rudin & Dominici (2019), *JMLR* 20(177):1–81 🔗
https://www.jmlr.org/papers/v20/18-760.html · 🔗 https://arxiv.org/abs/1801.01489. Studies an
entire *class* of models rather than one fitted model, with probabilistic bounds.

**The fix for correlated features:** Molnar, König, Bischl & Casalicchio (2023).
"Model-Agnostic Feature Importance and Effects with Dependent Features – A Conditional Subgroup
Approach." *DMKD*. 🔗 `10.1007/s10618-022-00901-9` — **permute groups of correlated features
together rather than individually.** Also Strobl et al. (2008) *BMC Bioinformatics* 9(1):307 🔗
`10.1186/1471-2105-9-307` and Debeer & Strobl (2020) 21(1):307 🔗 `10.1186/s12859-020-03622-2`
for conditional variable importance.

### 2.2 SHAP

**Lundberg, S.M. & Lee, S.-I. (2017). "A Unified Approach to Interpreting Model Predictions."
*NIPS 2017*, 4768–4777.** 🔗 https://arxiv.org/abs/1705.07874

**Lundberg, Erion, Chen, DeGrave, Prutkin, Nair, Katz, Himmelfarb, Bansal & Lee (2020). "From local
explanations to global understanding with explainable AI for trees." *Nature Machine Intelligence*
2(1):56–67.** 🔗 `10.1038/s42256-019-0138-9` — the polynomial-time exact TreeExplainer for trees.
Note the preprint title differs: arXiv:1905.04610, *"Explainable AI for Trees."*

> **The parameter that actually decides what your SHAP values mean.** For `shap.TreeExplainer` you
> must choose `feature_perturbation`:
>
> | Value | Behaviour |
> |---|---|
> | `'interventional'` | Background dataset required (100–1000 samples). Handles correlated features "according to the rules dictated by causal inference" — **and breaks your lag correlations** |
> | `'tree_path_dependent'` | No background; follows the trees. Default when no background is given. **Ignores the correlations entirely** |
> | `'auto'` | interventional if background given, else path-dependent |
>
> **Kumar, Venkatasubramanian, Scheidegger & Friedler (2020), ICML, PMLR 119:5491–5500** 🔗
> https://arxiv.org/abs/2002.11097 argue this conditional-vs-interventional choice is **unresolved
> and yields different answers**. There is no correct default. **State which one you used.**

`shap` version **0.53.0**. Explainers: `TreeExplainer`, `GPUTreeExplainer`, `LinearExplainer`,
`PermutationExplainer`, `PartitionExplainer`, `SamplingExplainer`, `AdditiveExplainer`,
`DeepExplainer`, `KernelExplainer`, `GradientExplainer`, `ExactExplainer`, `Random`, `LimeTabular`,
`Maple`, `TreeMaple` and — newly — **`TreeGain`**, which derives contributions from split gain.

### 2.3 Partial dependence and ICE

**Friedman (2001). "Greedy Function Approximation: A Gradient Boosting Machine." *Annals of
Statistics* 29(5):1189–1232.** 🔗 `10.1214/aos/1013203451` — PDP is in the final section, "Tools for
interpreting boosting machines" (from p. 1217), defined as averaging over the **marginal**
distribution of the other inputs.

**Goldstein, A., Kapelner, A., Bleich, J. & Pitkin, E. (2015). "Peeking Inside the Black Box…"
*JCGS* 24(1):44–65.** 🔗 `10.1080/10618600.2014.907095` · R: `ICEbox`

> *"In the presence of substantial interaction effects, the partial response relationship can be
> heterogeneous. Thus, an average curve, such as the PDP, can obfuscate the complexity of the
> modeled relationship."*

**Always plot ICE alongside PDP.** A single PDP curve is a mean over heterogeneous behaviour, and
for hourly call volume the lag response is almost certainly hour-dependent.

### 2.4 ALE — the right answer for correlated features

**Apley, D.W. & Zhu, J. (2020). "Visualizing the effects of predictor variables in black box
supervised learning models." *JRSS-B* **82(4):1059–1086**.** 🔗 `10.1111/rssb.12377` · preprint 🔗
https://arxiv.org/abs/1612.08468

> **⚠️ Wrongly cited as 82(5):1059–1096. It is 82(4), ending at 1086.**

From the abstract: *"Partial dependence plots… can produce erroneous results if the predictors are
strongly correlated, because they require extrapolation of the response at predictor values that are
far outside the multivariate envelope of the training data. As an alternative… accumulated local
effects plots, which do not require this unreliable extrapolation… and are far less computationally
expensive."*

> **Their worked example is Capital Bikeshare hourly rental counts** — a strongly seasonally
> periodic hourly count series, structurally the closest published analogy to your problem. **Use
> ALE as your default effect plot.**

### 2.5 Boruta — feature selection, with a caveat

**Kursa, M.B. & Rudnicki, W.R. (2010). "Feature Selection with the Boruta Package." *Journal of
Statistical Software* **36(11), 1–13**.** 🔗 `10.18637/jss.v036.i11`

> **⚠️ Wrongly cited as JSS 33(11). It is 36(11).** And the *algorithm* paper is separate: Kursa &
> Rudnicki (2010), "Boruta – A System for Feature Selection," *Fundamenta Informaticae* 101(4):301–321
> 🔗 `10.3233/FI-2010-288`.

**Boruta is a random-forest classifier wrapper with random-probe null features.** It is
fundamentally a *classification* tool, and it applies to regression only via a PyPI port or by
binarising the target. **Its random-probe null is also fragile under strong collinearity** — which
is exactly your matrix. Prefer permuted-group PFI.

### 2.6 GBM built-in importance — the most abused method

| Library | What `importance_type` means | Where it is defined |
|---|---|---|
| XGBoost | `weight` (frequency), `gain`, `cover`, `total_gain`, `total_cover` | **The XGBoost docs**, not Chen & Guestrin (2016) |
| LightGBM | `split`, `gain` | **The LightGBM docs**, not Ke et al. (2017) |
| CatBoost | `PredictionValuesChange`, `LossFunctionChange`, `FeatureImportance`, `Interaction`, `ShapValues`, `PredictionDiff`, `ShapInteractionValues` | CatBoost docs |

> **⚠️ Do not cite Chen & Guestrin (2016) or Ke et al. (2017) as the source for "cover" or "split".**
> Those papers define the split-selection objective (gain with regularisation, GOSS/EFB); the
> reporting metrics are library API, documented separately.

> **⚠️ CatBoost's enum is not `LossChange` / `TotalSum`.** The correct member is
> **`LossFunctionChange`**; there is no `TotalSum` anywhere in the API. Also note the docs'
> combinational-feature warning: *"If the model uses a combination of some of the input features
> instead of using them individually, an average feature importance for these features is
> calculated and output… the resulting value is divided by three and is assigned to each of the
> features."* **With `hour_of_week` as a categorical, your CatBoost importances will not sum to
> the model's total gain.**

> **Impurity/gain importance is strongly biased toward high-cardinality features and toward features
> that help you overfit.** The scikit-learn docs state this directly. Treat built-in importance as
> a **ranking heuristic**, never as a measurement.

---

## 3. Time-series-specific findings

> **⚠️ This is the part the vault was missing entirely, and it contains two results that change how
> you should think about your own matrix.**

### 3.1 Importance rankings are not stable across model families

**Petelin, G., Cenikj, G. & Eftimov, T. (2023). "Towards understanding the importance of time-series
features in automated algorithm performance prediction." *Expert Systems with Applications* 213:119023.**
🔗 `10.1016/j.eswa.2022.119023`

The most directly on-point paper found: permutation importance applied to **`tsfresh` and
`catch22` meta-features** to understand which ones predict forecasting-algorithm performance. The
finding to internalise:

> *"We also found that **the importance of the meta-features changes depending on the meta-model
> that is used**."*

So if you ask "which of my 16 features matters?" **the answer is model-dependent.** XGBoost,
LightGBM and CatBoost will give you three different rankings, and none of them is wrong. **Report
importance per model, or state which model produced it.**

### 3.2 Lag selection *is* feature selection

**Leites, J., Cerqueira, V. & Soares, C. (2024). "Lag Selection for Univariate Time Series
Forecasting using Deep Learning: An Empirical Study."** 🔗
https://arxiv.org/abs/2405.11237 (preprint — flag as such)

> *"Lag selection can be framed as a particular instance of **feature selection** where the
> explanatory variables are ordered in time."*

Their empirical results, on 2,411 univariate series: *"excessively small or excessively large lag
sizes have a considerable negative impact on forecasting performance"* and *"different lag sizes
are better for different time series in a dataset."* **A useful sanity check**: they also find CV
performs about as well as simple heuristics, which is a warning against over-engineering.

### 3.3 Saliency methods fail specifically on time series

**Ismail, A.A., Gunady, M., Corrada Bravo, H. & Feizi, S. (2020). "Benchmarking Deep Learning
Interpretability in Time Series Predictions." *NeurIPS 2020*.** 🔗
https://proceedings.neurips.cc/paper/2020/hash/47a3893cc405396a5c30d91320572d6d-Abstract.html ·
🔗 https://arxiv.org/abs/2010.13924

> *"**[N]etwork architectures and saliency methods fail to reliably and accurately identify feature
> importance over time in time series data**"* — and the cause is *"mainly due to the conflation of
> time and feature domains."* Specifically: *"saliency methods tend to fail to distinguish important
> vs. non-important features in a given time step; if a feature in a given time is assigned to high
> saliency, then **almost all other features in that time step tend to have high saliency regardless
> of their actual values**."*

They propose **Temporal Saliency Rescaling (TSR)** as the fix. **This matters for the vault because
[[Time Series Foundation Models]] §2 is dominated by attention-based architectures (PatchTST,
TiRex, Chronos-2) and none of them promises usable saliency — its §6 open-questions table now
carries the explicit caveat.**

> **⚠️ The often-cited "Turricani et al., Saliency Maps for Time Series Forecasting, ICML 2019" does
> not appear to exist** — no arXiv, Crossref or discoverable record, and the author list circulated
> for it contains "Januschowski" twice. The real replacement for that slot is **Pan, Hu & Chen
> (2021). "Two Birds with One Stone: Series Saliency for Accurate and Interpretable Multivariate
> Time Series Forecasting." *IJCAI-21*, 2884–2891.** 🔗 `10.24963/ijcai.2021/397`

### 3.4 Probabilistic-model-specific attribution

- **Raykar, Jati, Mukherjee, Aggarwal, Sarpatwar, Ganapavarapu & Vaculin (2023). "TsSHAP: Robust
  model agnostic feature-based explainability for time series forecasting."** 🔗
  https://arxiv.org/abs/2303.12316 — **preprint.** TreeSHAP applied to a *surrogate* model that
  maps interpretable features → the black-box forecast. Closest published framing to "which
  engineered feature earned its place."
- **Hertel, Pütz, Mikut, Hagenmeyer & Schäfer (2026). "Explainable time-series forecasting with
  sampling-free SHAP for Transformers." *Nature Communications* 17.** 🔗
  `10.1038/s41467-026-73243-5` — SHAPformer, exact SHAP values for a transformer, validated on a
  synthetic dataset with **known ground-truth explanations**. Peer-reviewed and current.

---

## 4. Tooling

| Tool | Version | Use |
|---|---|---|
| `shap` | 0.53.0 | **TreeExplainer** for your GBM; choose `feature_perturbation` deliberately (§2.2) |
| `scikit-learn` | 1.9.1 | `sklearn.inspection.permutation_importance`, `partial_dependence`, `PartialDependenceDisplay` |
| `statsmodels` | 0.15.0 | **No attribution API.** But `variance_inflation_factor` for sizing the collinearity first, and `OLSResults.get_influence()` (observation-level, *not* feature-level) |
| `interpret` (InterpretML) | 0.7.8 | Post-hoc explainers. Long maintenance mode — pin the version |
| `imodels` | 3.0.4 | **ExplainableBoostingMachine** — an interpretable *alternative model*, not an explainer for your GBM |
| `captum` / `alibi` | 0.9.0 / 0.9.6 | Deep models only. No reason to route a GBM through these |
| `shap.TreeGain` | — | Explanation from split gain; directly relevant to GBM |

> **⚠️ `sklearn.inspection.partial_dependence` is NOT deprecated and NOT removed in 1.9.1.** It is
> live and complete. It did *gain* a `custom_values` parameter (useful for passing your own
> `hour_of_week` grid) and it *no longer accepts integer dtype* for numeric feature columns — those
> are the real API changes to note, not a deprecation.

### Run VIF before you trust any of it

`statsmodels.stats.outliers_influence.variance_inflation_factor` on the lag/rolling matrix. If
`lag_168`, `lag_24` and `rolling(168)` all have VIF well above 5, **you already know the naive
ranking will be misleading** — no attribution method needed to establish that. This is the cheapest
possible first step.

---

## 5. A protocol that survives the traps

```
1. VIF on the feature matrix        -> size the collinearity problem
2. Permutation importance on the    -> held-out set only, n_repeats ≥ 20
   held-out set
3. Repeat with GROUPS permuted      -> Molnar et al. 2023. This is the honest "does the
   (lag block, rolling block,          lag/rolling block matter" question
   calendar block, exog block)
4. ALE for each block, not each     -> correlated features need ALE not PDP
   individual feature
5. Plot ICE alongside any PDP       -> interactions
6. Report per model                -> Petelin et al. 2023: rankings are model-dependent
7. Declare SHAP feature_perturbation -> and state why
```

> **Step 3 is the one that answers the question you actually have.** "Does `lag_168` matter?" is
> nearly unanswerable in isolation, because its competence is shared with two other features. "Does
> the **entire lag/rolling block** matter?" is a well-posed question with a clean answer, and it is
> the one you want before choosing a lag set.

---

## 6. Assessment

**Strengths**
- Permutation importance with grouped permutation is honest and cheap.
- ALE is the correct effect plot for correlated features, and its published example is an hourly
  count series.
- TreeExplainer gives exact, fast SHAP for GBM.
- The literature on failure modes is unusually candid and unusually applicable.

**Weaknesses**
- **No method handles collinearity by default.** All of them understate, and the correction is
  manual.
- Importance is **model-dependent** — there is no model-free "true" ranking.
- Attributions are **not causal**, even when they look like it. Slack, Hilgard, Jia, Singh &
  Lakkaraju (2020), "Fooling LIME and SHAP," *AIES '20* 🔗 `10.1145/3375627.3375830` demonstrate
  that explanations can be **manipulated** by an adversarial model. **Do not over-read this
  citation** — it is an adversarial-robustness result, not evidence SHAP is unreliable on honest
  models. For the honest-model pitfalls, cite **Kumar et al. (2020)** §2.2 and the 2022 Springer
  chapter *General Pitfalls of Model-Agnostic Interpretation Methods for Machine Learning Models* 🔗
  `10.1007/978-3-031-04083-2_4`
- SHAP's `feature_perturbation` choice is an unresolved methodological question.
- Saliency maps on time series are **known to be unreliable** — see §3.3.
- A feature with low permutation importance might be unimportant *for this model*, not intrinsically.

---

## 7. Try it

- [ ] **VIF first** (§4). Document the values for `lag_24`, `lag_168`, `rolling(168).mean()`. This
      tells you in advance how misleading the individual rankings will be
- [ ] Permutation importance with `n_repeats=20` on a held-out set, per model — XGBoost, LightGBM
      and CatBoost. **Compare the three rankings and report the disagreement**, per Petelin et al.
- [ ] Grouped permutation importance (lag block / rolling block / calendar / exog) using the Molnar
      et al. 2023 approach. This is the honest answer to "are the weekly features worth keeping"
- [ ] ALE for each block, with `custom_values` for the `hour_of_week` grid. Confirm ALE and PDP
      disagree on the rolling block — and if they do, trust ALE
- [ ] `shap.TreeExplainer` with `feature_perturbation='tree_path_dependent'`, then repeat with
      `'interventional'` on a 200-sample background. **Quantify how much the rankings move** — that
      gap is the unresolved methodology, made visible
- [ ] **The decisive ablation.** Retrain with the whole lag/rolling block removed and re-measure.
      Attribution estimates what a feature contributes *within* one reference set; ablation is the
      closest thing to ground truth. If they disagree, believe ablation and distrust the attribution
- [ ] Run the §5 protocol end to end on the feature matrix from
      [[Feature Engineering for Time Series]] §8 and write the output down as a study artefact

## References

**Attribution methods**

1. Breiman, L. (2001). Random forests. *Machine Learning* 45(1):5–32. 🔗
   `10.1023/A:1010933404324` ⭐ *(not `...1010950718922`)*
2. Lundberg, S.M. & Lee, S.-I. (2017). A unified approach to interpreting model predictions.
   *NIPS 2017*, 4768–4777. 🔗 https://arxiv.org/abs/1705.07874
3. Lundberg, S.M. et al. (2020). From local explanations to global understanding with explainable
   AI for trees. *Nature Machine Intelligence* 2(1):56–67. 🔗 `10.1038/s42256-019-0138-9`
4. Friedman, J.H. (2001). Greedy function approximation. *Annals of Statistics* 29(5):1189–1232. 🔗
   `10.1214/aos/1013203451` — PDP
5. Goldstein, A., Kapelner, A., Bleich, J. & Pitkin, E. (2015). Peeking inside the black box.
   *JCGS* 24(1):44–65. 🔗 `10.1080/10618600.2014.907095` — ICE
6. Apley, D.W. & Zhu, J. (2020). Visualizing the effects of predictor variables in black box
   supervised learning models. *JRSS-B* **82(4):1059–1086**. 🔗 `10.1111/rssb.12377` ⭐
7. Kursa, M.B. & Rudnicki, W.R. (2010). Feature selection with the Boruta package. *JSS*
   **36(11), 1–13**. 🔗 `10.18637/jss.v036.i11` *(not 33(11))*
8. Fisher, A., Rudin, C. & Dominici, F. (2019). All models are wrong, but many are useful. *JMLR*
   20(177):1–81. 🔗 https://www.jmlr.org/papers/v20/18-760.html
9. Wei, P., Lu, Z. & Song, J. (2015). Variable importance analysis: A comprehensive review.
   *Reliability Engineering & System Safety* 142:399–432. 🔗
   `10.1016/j.ress.2015.05.018`

**Failure modes — read these**

10. Kumar, I.E., Venkatasubramanian, S., Scheidegger, C. & Friedler, S. (2020). Problems with
    Shapley-value-based explanations as feature importance measures. *ICML*, PMLR 119:5491–5500. 🔗
    https://arxiv.org/abs/2002.11097 ⭐ **the SHAP-pitfalls paper** *(not Molnar/Casalicchio/Bischl)*
11. Molnar, C. et al. (2022). General pitfalls of model-agnostic interpretation methods for machine
    learning models. In *xxAI – Beyond Explainable AI*, Springer LNCS, 39–68. 🔗
    `10.1007/978-3-031-04083-2_4`
12. Molnar, C., König, G., Bischl, B. & Casalicchio, G. (2023). Model-agnostic feature importance
    and effects with dependent features. *DMKD*. 🔗 `10.1007/s10618-022-00901-9` ⭐ **the grouped-PFI
    fix**
13. Slack, D., Hilgard, S., Jia, E., Singh, S. & Lakkaraju, H. (2020). Fooling LIME and SHAP.
    *AIES '20*. 🔗 `10.1145/3375627.3375830` *(adversarial — not evidence SHAP lies on honest models)*
14. Agarwal, C., Krishna, S., Saxena, E., Pawelczyk, M., Johnson, N., Puri, I., Zitnik, M. &
    Lakkaraju, H. (2022). OpenXAI. *NeurIPS D&B*. 🔗 https://arxiv.org/abs/2206.11104 *(no Tan, no
    Schwarzer)*
15. Strobl, C., Boulesteix, A.-L., Kneib, T., Augustin, T. & Zeileis, A. (2008). Conditional
    variable importance for random forests. *BMC Bioinformatics* 9(1):307. 🔗
    `10.1186/1471-2105-9-307`
16. Debeer, D. & Strobl, C. (2020). Conditional permutation importance revisited. *BMC
    Bioinformatics* 21(1):307. 🔗 `10.1186/s12859-020-03622-2`
17. Molnar, C. *Interpretable Machine Learning.* **3rd edition**. 🔗
    https://christophm.github.io/interpretable-ml-book/ — Ch. 18 SHAP, 19 PDP, 20 ALE, **23
    Permutation Feature Importance**, 24 LOFO. CC BY-NC-SA 4.0 *(not 2nd edition)*

**Time series specific**

18. Petelin, G., Cenikj, G. & Eftimov, T. (2023). Towards understanding the importance of
    time-series features in automated algorithm performance prediction. *Expert Systems with
    Applications* 213:119023. 🔗 `10.1016/j.eswa.2022.119023` ⭐ **rankings are model-dependent**
19. Ismail, A.A., Gunady, M., Corrada Bravo, H. & Feizi, S. (2020). Benchmarking deep learning
    interpretability in time series predictions. *NeurIPS 2020*. 🔗
    https://arxiv.org/abs/2010.13924 ⭐ **saliency fails specifically on time series**
20. Pan, Q., Hu, W. & Chen, N. (2021). Two birds with one stone: Series saliency for accurate and
    interpretable multivariate time series forecasting. *IJCAI-21*, 2884–2891. 🔗
    `10.24963/ijcai.2021/397` — the replacement for the non-existent Turricani paper
21. Raykar, V.C., Jati, A., Mukherjee, S., Aggarwal, N., Sarpatwar, K., Ganapavarapu, G. & Vaculin,
    R. (2023). TsSHAP. 🔗 https://arxiv.org/abs/2303.12316 *(preprint)*
22. Hertel, M., Pütz, S., Mikut, R., Hagenmeyer, V. & Schäfer, B. (2026). Explainable time-series
    forecasting with sampling-free SHAP for Transformers. *Nature Communications* 17. 🔗
    `10.1038/s41467-026-73243-5`
23. Leites, J., Cerqueira, V. & Soares, C. (2024). Lag selection for univariate time series
    forecasting using deep learning. 🔗 https://arxiv.org/abs/2405.11237 *(preprint)*
24. Lim, B., Arik, S.O., Loeff, N. & Pfister, T. Temporal fusion transformers. *ICLR 2020*, 🔗
    https://arxiv.org/abs/1912.09363 — and see Jain & Wallace (2019) 🔗
    https://arxiv.org/abs/1902.10186 on attention ≠ explanation
25. Barredo Arrieta, A. et al. (2020). Explainable artificial intelligence (XAI). *Information
    Fusion* 58:82–115. 🔗 `10.1016/j.inffus.2019.12.012`
26. Masini, R.P., Medeiros, M.C. & Mendes, E.F. (2023). Machine learning advances for time series
    forecasting. *Journal of Economic Surveys* 37(1):76–111. 🔗 `10.1111/joes.12429`
27. Chen, T. & Guestrin, C. (2016). XGBoost. *KDD '16*. 🔗 `10.1145/2939672.2939785` — split-selection
    objective only; the importance API is in the XGBoost docs
28. Ke, G., Meng, Q., Finley, T., Wang, T., Chen, W., Ma, W., Ye, Q. & Liu, T.-Y. (2017). LightGBM.
    *NIPS 2017*. — **2017, not 2019**; GOSS/EFB only, not the importance API

## Cross-links

- [[Feature Engineering for Time Series]] — the matrix this note reads back
- [[Gradient Boosting for Time Series]] §7 — where the previous one-line treatment lived
- [[Model Validation Strategies]] §1 — the same "declare your assumptions" discipline
- [[Count Distributions and Kolassa Evaluation]] — attribution for the *distributional* model, not the
  point one
- [[Time Series Foundation Models]] §4 — attention-based TSFMs, and why §3.3's warning applies
- [[Time Series EDA and Data Quality]] — VIF is a data-quality diagnostic too
- [[time-series-forecasting-models]] — §9's "interpretability" row; §3's GBDT block on which this note reads back
- [[Forecasting MLOps]] — after drift and retraining, the importance ranking is stale; importance re-checks are a monitoring activity
- [[Forecasting Non-Stationary Data]] — attributions rank what a model used on one reference set; on a drifting or collinear matrix those ranks do not generalise
