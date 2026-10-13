---
title: Model Validation Strategies
tags:
  - time-series
  - forecasting
  - validation
  - cross-validation
  - diebold-mariano
  - backtesting
  - conformal-prediction
  - leakage
date_created: 2026-10-13
aliases:
  - Validation Strategies
  - Forecast Validation
  - Backtesting and Model Comparison
---

# Model Validation Strategies

> Created to resolve the dangling link in [[time_series_evaluation_metrics_benchmarks]], which has **no coverage of validation at all** — only metric definitions.
>
> **Framing:** validation design changes conclusions more than model choice does. A well-specified model validated badly loses to a naive model validated honestly, and — worse — publishes the wrong conclusion while looking rigorous. For a study whose contribution is a *comparative* claim, validation design **is** the method.

---

## 1. The leakage principle

Forecast accuracy is only estimable from **genuine forecasts**.

> "It is invalid to look at how well a model fits the historical data; the accuracy of forecasts can only be determined by examining genuine forecasts."
> — Hyndman, *Measuring forecast accuracy* 🔗 https://otexts.com/fpp3/accuracy.html

Three ways studies leak, in descending order of how often they occur:

| Leak | Mechanism | Consequence |
|---|---|---|
| **Random k-fold** | Training folds contain observations *later* than the test fold | Model sees the future; error is optimistically biased, often severely for trending series |
| **In-sample fit** | Reporting R² or RMSE on training data | Almost meaningless — every overparameterised model wins |
| **Metric-side leakage** | Computing the MASE denominator over the full series | Test information enters the measurement instrument — see [[Time Series Forecasting Baselines]] §3.3 |

Random k-fold is the one to watch. It is the default in most ML libraries and it is **invalid** for forecasting. scikit-learn's `TimeSeriesSplit` 🔗 https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html exists precisely because the default `KFold` does the wrong thing.

> For autocorrelated series, blocked splits can still be wrong if the block structure lets training data touch observations adjacent to the test window. The failure is not only about time ordering — it is about **information reach**.

---

## 2. Resampling schemes

| Scheme | Mechanism | Verdict |
|---|---|---|
| **Single hold-out** | Last `k` observations as test, train once | Weakest. One draw; no variance estimate |
| **Rolling origin / walk-forward** | Successive origins; train, forecast `h`, advance | **Default for forecasting.** Forecast error at each origin is genuinely out-of-sample |
| **Expanding vs. sliding window** | All history vs. fixed-length history | Expanding suits stable series; sliding suits non-stationary ones |
| **Fixed window, multiple origins** | Same window re-forecast at each origin | Tests *refitting*, not the model. A model not refitted at each origin is a different experiment |

Tashman (2000), *Out-of-sample tests of forecasting accuracy: an analysis and review*, **IJF** 16(4), 437–450. 🔗 https://doi.org/10.1016/S0169-2070(00)00065-0 — the standard taxonomy; also introduces leave-one-out and variants for seasonal data.

Supporting evidence:

- Bergmeir, C. & Benítez, J.M. (2012). On the use of cross-validation for evaluating time series predictor evaluation. *CSDA* 56(3), 929–944. 🔗 https://doi.org/10.1016/j.csda.2011.11.003
- Bergmeir, C., Hyndman, R.J. & Koo, B. (2018). A note on the validity of cross-validation for evaluating autoregressive time series prediction. *CSDA* 120, 70–83. 🔗 https://doi.org/10.1016/j.csda.2017.11.003 — **k-fold can be valid for AR processes** under specific conditions (large sample, low noise-to-signal, block length rules). So the honest statement is "random k-fold is wrong", not "k-fold is always wrong".
- Cerqueira, V., Torgo, L. & Mozetič, M. (2020). Evaluating time series forecasting models: an empirical study on performance estimation methods. *Machine Learning* 109, 1997–2028. 🔗 https://arxiv.org/abs/2003.13867 — rolling-origin is the most reliable across horizons
- Hyndman, R.J. & Koehler, A.B. (2006), for the 2015 correction adding rolling-origin backtesting to the `forecast` package. 🔗 https://robjhyndman.com/papers/mase.pdf

> **Practical default:** rolling-origin, expanding window, origins spaced by one period, every model refitted at every origin. State the number of origins and the total forecast origin span — both are load-bearing and both are usually omitted.

---

## 3. Horizon and origin count ⚠️

This is where the PSAP study becomes genuinely hard, and where most of the literature's defaults break.

### 3.1 Long horizons break the standard test

At `h = 168`, forecast errors **overlap almost completely**. The loss differential

```
d_t = L1(e_{1,t}) − L2(e_{2,t})
```

is then strongly autocorrelated, and the effective sample size is far smaller than the nominal count of forecast origins. **Every significance test that assumes independent loss differentials is anti-conservative** — it will declare differences significant that are not.

Diebold-Mariano handles this explicitly by estimating the **long-run variance** of `d_t` with an autocorrelation correction over `h−1` lags (formula in §4.1). At `h = 168` that sum has 167 terms, and it is not a small-sample nicety — it is the test.

### 3.2 Number of origins

- More origins → tighter estimate of average error. There is no downside except compute.
- But **more origins at `h=168` on the same series does not buy independence** — it buys correlated replicates.
- The useful quantity is the effective sample size after accounting for autocorrelation of `d_t`.

> **For the 168-point study:** with weekly blocks and whole-week splits, a 4-month dataset gives roughly 17 test weeks. With `h = 168`, the loss differential between any two forecast origins is near-perfectly correlated. **Power will be low, and that is a property of the problem, not a defect in the design.** Say so in the write-up rather than reporting an underpowered p-value as a null result.

---

## 4. Testing whether one model beats another

### 4.1 The Diebold-Mariano test

Diebold, F.X. & Mariano, R.S. (1995). Comparing predictive accuracy. *JBES* 13(3), 253–263. 🔗 https://www.jstor.org/stable/2118554 (publisher; 🔒)

Define the loss differential and its mean, then estimate the long-run variance with the horizon-dependent truncation:

$$
DM = \frac{\bar{d}}{\sqrt{\hat{V}^2(\bar{d})/n}}
$$

$$
\hat{V}^2(\bar{d}) = \frac{1}{n}\left[\sum_{t=1}^{n}(d_t-\bar{d})^2 + 2\sum_{j=1}^{h-1}\left(1-\frac{j}{h}\right)\sum_{t=j+1}^{n}(d_t-\bar{d})(d_{t-j}-\bar{d})\right]
$$

`H₀`: the two models have equal expected loss. **Two-sided by default**; for a superiority claim, use one-sided — but see §4.2, because one-sided DM is exactly where the corrections bite.

**Choosing the loss function is a substantive decision**, not a formality. MAE-based DM asks "which is closer on average"; squared-loss DM asks something dominated by the largest errors. For capacity planning, the large errors are the ones that matter.

### 4.2 Corrections — mandatory, not optional

| Correction | Problem it fixes |
|---|---|
| **Harvey, Leybourne & Newbold (1997)** 🔗 https://doi.org/10.1016/S0169-2070(96)00719-4 | Small-sample bias when `h` is not negligible relative to `n` |
| **Clark & West (2007)** 🔗 https://doi.org/10.1016/j.jeconom.2006.05.023 | **Nested models.** Uncorrected DM has very low power against a nested alternative; the nested model can look worse than it is. CW correction restores power |
| **Diebold (2015)** | DM's size distortions in the M4 context — argues for caution even in well-powered settings |

Implementation: the R `forecast` package's `dm.test(f1, f2, y, loss.type, h, c, H1)` — the `c` argument applies the HLN correction. 🔗 https://cran.r-project.org/web/packages/forecast/forecast.pdf

> **Clark-West is the one people forget.** If one model is a restricted version of another (a special case, a subset of covariates, fewer hyperparameters), the standard DM test will systematically understate the nested model's performance. With a 168-model family where each model is a specialisation of a shared architecture, **you are in the nested case for essentially every comparison.**

### 4.3 Multiple comparisons ⚠️⚠️

**This is a first-order design constraint, not a footnote.**

Comparing 168 discrete models against a continuous model is a 169-way comparison. Under a naive procedure with a 5% level, the expected number of false positives is **≈ 8 models declared "better" that are not.**

| Tool | Reference |
|---|---|
| **Corrected resampled t-test** | Nadeau, C. & Bengio, Y. (2003). Inference for the generalization error. *Machine Learning* 52(3), 239–281. 🔗 https://link.springer.com/article/10.1023/A:1024068626366 |
| **Multivariate DM** | Mariano, R.S. & Preve, D. (2012). 🔗 https://cran.r-project.org/web/packages/multDM/multDM.pdf |
| **SPA test** | Hansen, P.R. (2005). A test for superior predictive ability |
| **Stepdown procedures** | Romano, Y. & Wolf, M. — control FWER directly, more power than Bonferroni |

> **Recommendation for the 168-point study:** treat it as a **single composite hypothesis** — "does the discrete/continuous distinction matter at all?" — and test that first. Only descend to per-hour or per-model comparisons if the composite is rejected, with a stepdown procedure controlling FWER across the family. Reporting 169 individual p-values is the single most likely way this study gets a reviewer to reject it.

---

## 5. Purging and embargo

López de Prado, M. (2018). *Advances in Financial Machine Learning*, Wiley. 🔒 https://onlinelibrary.wiley.com/doi/book/10.1002/9781119482086

Two ideas, both about **information reach** rather than calendar ordering:

- **Purging** — remove training observations whose *label window* extends into the test period
- **Embargo** — drop a gap after the test set to prevent serial dependence from leaking

**The forecasting analogue:** truncate the training window so that no training observation's influence extends into the test period. For an AR(`p`) model, drop the last `p` training points. For a model with an `h`-step recursive forecast, the reach is longer than `p` — it scales with `h`.

Purge volume at `h=168` is not negligible. When it matters: at long horizons, for event-driven covariates that persist across days (a festival, an outage, a weather system), and for any model with a long moving-average or rolling-window feature.

> For the PSAP study the concrete risk is the **event calendar**. A model using "days since incident started" or a rolling 168-hour mean sees across the train/test boundary in a way a naive model does not. Audit feature construction explicitly for window lengths exceeding the purge gap.

---

## 6. Evaluating probabilistic forecasts

### 6.1 Two criteria, never one

| Criterion | Question | Failure mode |
|---|---|---|
| **Coverage** | How often does truth fall inside the interval? | Intervals can be perfect by being infinitely wide |
| **Sharpness** | How tight are they? | Tight intervals can miss constantly |

Any evaluation reporting coverage without sharpness — or sharpness without coverage — is not a result.

### 6.2 Proper scoring rules

- **Pinball / quantile loss** — the workhorse; evaluate at each quantile you actually deploy
- **WIS** (weighted interval score) — the natural scalar summary of a full quantile set
- **CRPS** — for a single predictive density

FPP3 §5.8 🔗 https://otexts.com/fpp3/prediction-intervals.html

### 6.3 Coverage testing

Botchkarev (2018) 🔗 https://www.ijikm.org/Volume14/IJIKMv14p045-076Botchkarev5064.pdf — the Kolmogorov–Smirnov–style approach to testing empirical coverage against a nominal level, with the sample-size dependence handled properly. This is the tool for the coverage component.

### 6.4 Marginal vs conditional coverage ⚠️

**The distinction that decides whether the conformal layer is operationally useful.**

```
Marginal coverage:    P( Y ∈ C(X) )        ≥ 1 − α     (averaged over all X)
Conditional coverage: P( Y ∈ C(X) | X = x ) ≥ 1 − α   (for every x)
```

Conformal prediction delivers **marginal** coverage. It says nothing about *where* in the input space coverage holds.

The failure mode is fully achievable and operationally total:

> A predictor can achieve exactly 90% marginal coverage while achieving **0% coverage at peaks**, by being very wide during quiet hours and very narrow during busy ones.

For 9-1-1 capacity planning this is the whole ball game. A staffing interval that is correct on average and worthless at 20:00 on a Friday is worse than no interval, because it will be used.

**Remedies**, escalating in sophistication:

| Method | Guarantee |
|---|---|
| Split conformal | Marginal only, distribution-free |
| Normalised split conformal | Marginal, scale-adaptive |
| **CQR** — Romano, Patterson & Candès (2019) 🔗 https://arxiv.org/abs/1905.03222 | Score-function based; adapts to local difficulty |
| **ACI** — Romano, Patterson & Candès (2020) 🔗 https://arxiv.org/abs/1906.00130 | Adaptive under distribution shift — the variance-based companion |

Neither CQR nor ACI guarantees conditional coverage. That remains open, and it is exactly the finding this project is positioned to report: **test conditional coverage at peaks directly**, and treat the result as a contribution rather than a failure.

> This is hypothesis **H4** in [[Staffing_Forecasting_Experiment]]. The validation design must therefore include a **peak-stratified coverage** evaluation — coverage computed separately over volume strata — or the study cannot answer its own central question.

---

## 7. Evaluate at the level you consume

Reconciliation literature result: accuracy gains concentrate at the **aggregate** level, and reconciliation at the **bottom** can be *worse* out-of-sample. 🔗 [[forecast-reconciliation]] §7, §9

Applied to validation: if the staffing recommendation is computed from **weekly totals**, then weekly-total error is the decision-relevant metric. Evaluating hourly `MASE` and reporting weekly aggregates derived from it inverts the correct order.

State the decision-relevant aggregation level **before** running the evaluation, and report that one as primary.

---

## 8. Practical protocol

For a comparative forecasting study of the type in [[168-Point Forecast Comparison - Discrete vs Continuous]]:

**Splits**
1. Whole-block splits only. For one-shot 168-hour forecasts, split on week boundaries; never split inside a forecast block
2. Three-way: `train → calibrate → test`. The **calibrate** split is for conformal — never reuse the test set for it
3. Freeze the split before any model is fitted. Document it

**Tuning**
4. All hyperparameter selection happens on the training/calibration data, inside the rolling-origin loop
5. Refit at every origin. A model tuned once and evaluated at many origins is a different experiment

**Metrics**
6. Primary: one scale-free metric (MASE) **and** its squared-error counterpart (RMSSE)
7. Peak-conditional accuracy reported separately — see [[Time Series Forecasting Baselines]] §8
8. Decision-relevant aggregation level reported as primary — see §7

**Inference**
9. One composite significance test first; stepdown only if rejected — see §4.3
10. HLN correction on every DM test; Clark-West on every nested comparison
11. Report effect sizes and power, not p-values alone. If `n_eff` is small, say the test is underpowered

**Probabilistic**
12. Coverage **and** sharpness, always together
13. Coverage stratified by volume decile — this is the H4 test — see §6.4

**Audit**
14. Feature construction checked for windows exceeding the purge gap — see §5

---

## 9. Common failure modes

| Failure | Consequence |
|---|---|
| Random k-fold | Trains on the future; optimistic errors |
| Reporting in-sample fit | Not a forecast |
| Single hold-out, no repeats | High-variance conclusion presented as firm |
| Full-sample MASE denominator | Test data inside the metric |
| Uncorrected DM at `h=168` | Anti-conservative; false significance |
| Uncorrected DM on nested models | Systematic under-power against the nested alternative |
| 169 comparisons, no FWER control | ≈ 8 false positives expected under the null |
| Coverage reported without sharpness | Infinitely wide intervals "win" |
| Marginal coverage only | Perfect average, useless at peaks |
| No purge/embargo audit | Leakage through long-window features |
| Evaluating bottom level, deploying at aggregate | Optimises the wrong quantity |

---

## 10. Honest gaps

| Item | Status |
|---|---|
| **Conditional coverage** | No method guarantees it. Genuinely open — the project's research contribution |
| **Effective sample size at `h=168`** | Computable in principle from the autocorrelation of `d_t`, rarely reported |
| **Power in the 168-point comparison** | Almost certainly low with ~17 test weeks. Not fixable by design; must be acknowledged |
| **Purging in forecasting** | Imported from financial ML by analogy. The right purge gap for a given model class is not established |
| **Multiplicity across aggregation levels** | If weekly and hourly are both tested, they are not independent tests. No standard procedure |

---

## References

**Forecast evaluation framework**
1. Hyndman, R.J. & Athanasopoulos, G. (2021). *Forecasting: Principles and Practice*, 3rd ed., §5.8 and §5.9. 🔗 https://otexts.com/fpp3/accuracy.html · 🔗 https://otexts.com/fpp3/prediction-intervals.html
2. Tashman, L.J. (2000). Out-of-sample tests of forecasting accuracy: an analysis and review. *International Journal of Forecasting* 16(4), 437–450. 🔗 https://doi.org/10.1016/S0169-2070(00)00065-0
3. Cerqueira, V., Torgo, L. & Mozetič, M. (2020). Evaluating time series forecasting models: an empirical study on performance estimation methods. *Machine Learning* 109, 1997–2028. 🔗 https://arxiv.org/abs/2003.13867

**Cross-validation for time series**
4. Bergmeir, C. & Benítez, J.M. (2012). On the use of cross-validation for evaluating time series predictor evaluation. *CSDA* 56(3), 929–944. 🔗 https://doi.org/10.1016/j.csda.2011.11.003
5. Bergmeir, C., Hyndman, R.J. & Koo, B. (2018). A note on the validity of cross-validation for evaluating autoregressive time series prediction. *CSDA* 120, 70–83. 🔗 https://doi.org/10.1016/j.csda.2017.11.003
6. Nadeau, C. & Bengio, Y. (2003). Inference for the generalization error. *Machine Learning* 52(3), 239–281. 🔗 https://link.springer.com/article/10.1023/A:1024068626366
7. scikit-learn `TimeSeriesSplit`. 🔗 https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html

**Testing predictive accuracy**
8. Diebold, F.X. & Mariano, R.S. (1995). Comparing predictive accuracy. *JBES* 13(3), 253–263. 🔗 https://www.jstor.org/stable/2118554 (publisher)
9. Harvey, D., Leybourne, S. & Newbold, P. (1997). Testing the equality of prediction mean squared errors. *International Journal of Forecasting* 13(2), 281–291. 🔗 https://doi.org/10.1016/S0169-2070(96)00719-4
10. Clark, T.E. & West, M.J. (2007). Approximately normal tests for equal predictive accuracy in nested models. *Journal of Econometrics* 141(2), 767–794. 🔗 https://doi.org/10.1016/j.jeconom.2006.05.023
11. Mariano, R.S. & Preve, D. (2012). `multDM`: multivariate Diebold-Mariano test. 🔗 https://cran.r-project.org/web/packages/multDM/multDM.pdf
12. Hyndman, R.J. & Koehler, A.B. (2006). Another look at measures of forecast accuracy. *IJF* 22(4), 679–688. 🔗 https://robjhyndman.com/papers/mase.pdf

**Purging and leakage**
13. López de Prado, M. (2018). *Advances in Financial Machine Learning*. Wiley. 🔗 https://onlinelibrary.wiley.com/doi/book/10.1002/9781119482086 (publisher)

**Probabilistic evaluation**
14. Botchkarev, A. (2018). Evaluating accuracy of probabilistic forecasting methods. *Int. J. Inform. Decision Sciences* 14(1). 🔗 https://www.ijikm.org/Volume14/IJIKMv14p045-076Botchkarev5064.pdf
15. Romano, Y., Patterson, E. & Candès, E. (2019). Conformalized quantile regression. *NeurIPS*. 🔗 https://arxiv.org/abs/1905.03222
16. Romano, Y., Patterson, E. & Candès, E. (2020). Adaptive conformal inference under distribution shift. *NeurIPS*. 🔗 https://arxiv.org/abs/1906.00130

## Status

- [x] Leakage principle, three leak modes
- [x] Resampling scheme comparison with evidence
- [x] Long-horizon overlap and its effect on test validity
- [x] DM test with the long-run variance formula; HLN and Clark-West corrections
- [x] Multiple comparisons — framed as a first-order constraint
- [x] Purging and embargo, with the forecasting analogue
- [x] Probabilistic evaluation: two criteria, proper scoring rules, marginal vs conditional
- [x] Aggregation-level alignment
- [x] 14-point practical protocol and a failure-mode table
- [ ] Empirical: compute effective sample size of `d_t` at `h=168` before committing to per-model tests

## Cross-links

- [[time_series_evaluation_metrics_benchmarks]] — the metrics this note validates
- [[Time Series Forecasting Baselines]] — the comparison targets, and why the baseline choice affects validity
- [[forecast-reconciliation]] — §7 on evaluating at the level you consume
- [[168-Point Forecast Comparison - Discrete vs Continuous]] — the study this protocol is built for
- [[Staffing_Forecasting_Experiment]] — §6.4 maps to hypothesis H4
- [[resources]] — §3.7 conformal prediction, §4.4 probabilistic metrics