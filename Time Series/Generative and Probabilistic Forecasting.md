---
type: reference
status: active
tags:
  - time-series
  - forecasting
  - probabilistic
  - diffusion
  - flow-matching
  - uncertainty
created: 2026-10-14
aliases:
  - Diffusion Forecasting
  - Probabilistic Forecasting
  - Flow Matching for Time Series
  - Quantile Forecasting
---

# Generative and Probabilistic Forecasting

How to produce a **distribution** over the future rather than a point, and the three
families that do it.

> Your notes are strong on conformal prediction (a *wrapper* that turns points into
> intervals — [[Model Validation Strategies]] §6, [[resources]] §3.7) and weak on models that
> *natively* output distributions. This note closes that
> gap. The distinction matters: a conformally-wrapped point forecast inherits the point
> forecast's error structure, whereas a generative model can represent **multiple plausible
> futures** and non-Gaussian, heteroscedastic shapes.

---

## 1. Three ways to get a distribution

| Family | Mechanism | Output | Cost | Calibration |
|---|---|---|---|---|
| **Quantile** | Train with pinball loss at `k` quantiles | `k` marginal quantiles | Low — one model | Good, if you score with pinball |
| **Parametric** | Assume a family (Gaussian, Negative Binomial, Student-t) and fit its parameters | Parameters → any quantile | Low | Sensitive to the assumption |
| **Generative** | Model `p(y_future \| y_past)` directly and *sample* it | Arbitrary samples | **High** — iterative sampling | Best, in principle |

Sundial 🔗 [arXiv:2502.00816](https://arxiv.org/abs/2502.00816) makes the distinction
explicitly: quantile approaches "generally fit well on a small amount of data, [but] can be
the major bottleneck for scaling." Quantile forecasting **collapses a distribution to
`k` order statistics** and cannot represent multimodality.

> ### ⚠️ Multimodality is the thing that actually matters operationally
>
> If tomorrow's 9-1-1 volume is bimodal — quiet *or* a festival surge — then a quantile
> forecast reports the **average of two incompatible futures**, which is a forecast of
> nothing. A staffing manager reading "4.2 calls" from a genuinely bimodal distribution
> will under-provision every branch.
>
> Quantile models structurally cannot surface this. Generative models can, and it is worth
> knowing whether your problem has this property before choosing.

---

## 2. Quantile forecasting — the workhorse

Train a model to output `ŷ^(τ)` for each `τ ∈ {0.1, 0.2, …, 0.9}`, minimising the pinball
loss:

$$L_\tau(y, \hat{y}^{(\tau)}) = \begin{cases} \tau (y - \hat{y}^{(\tau)}) & y \ge \hat{y}^{(\tau)} \\ (\tau - 1)(y - \hat{y}^{(\tau)}) & \text{otherwise} \end{cases}$$

**Strengths** — cheap, single forward pass, works with any backbone, easy to enforce
non-crossing quantiles, and directly optimises the loss most people score with.
**Weaknesses** — one-dimensional summary; no sample path; no multimodality.

> **Practical note:** monotonicity (quantiles must not cross) needs either cumulative-sum
> parameterisation, sorting after the fact, or an ordered architecture. Skipping it produces
> invalid intervals that look fine on a chart. Every major library handles this.

Most current TSFMs emit quantiles: **Chronos-2, TiRex, Moirai 2.0, Toto 2.0**.

### The negative result worth knowing

**Moirai 1.0** output a **mixture distribution** — theoretically richer than quantiles.
**Moirai 2.0** replaced it with a plain quantile loss and got *better* results, less
complexity, 30× smaller and 2× faster 🔗 [arXiv:2511.11698](https://arxiv.org/abs/2511.11698).

> Extra parametric richness did not pay for itself. The mixture head was "empirically less
> effective in practice." Keep that in mind before assuming a generative model beats a
> quantile model on your data.

---

## 3. Diffusion models

Su, C. et al. (2025). *Diffusion Models for Time Series Forecasting: A Survey.* 🔗
[arXiv:2507.14507](https://arxiv.org/abs/2507.14507) · earlier survey 🔗
[arXiv:2305.00624](https://arxiv.org/abs/2305.00624)

Standard DDPM: a forward process progressively noises the target series; a learned reverse
process denoises it, **conditioned on the observed history**.

```
q(x_t | x_{t-1}) = N(x_t ; √(1-β_t) x_{t-1}, β_t I)      forward (adds noise)
p_θ(x_{t-1} | x_t, history)                              reverse (learned, conditional)
```

Forecasting = conditional generation of the future block given the past block.

### Landmark models

| Model | Year | Contribution | arXiv |
|---|---|---|---|
| **DiffWave** | 2021 | Diffusion for time series generation | — |
| **TimeGrad** | 2021 | Autoregressive, samples the data distribution at each step via gradients | 🔗 [arXiv:2101.12072](https://arxiv.org/abs/2101.12072) |
| **CSDI** | 2021 | Conditional score-based diffusion; **imputation** breakthrough; 2-D attention per residual layer | 🔗 [arXiv:2107.03502](https://arxiv.org/abs/2107.03502) |
| **SSSD**, **DYffusion**, **Diffusion-TS**, **DSPD** | 2022–24 | Scalability, SDE formulations, hierarchical/masking strategies | — |

### ⚠️ The cost problem

This is the decisive practical objection, stated plainly by the surveys:

> "These models are usually associated with **very high computational costs**."

Inference requires **iterative denoising** — hundreds to thousands of forward passes per
forecast. DDIM 🔗 [arXiv:2010.02502](https://arxiv.org/abs/2010.02502) accelerates sampling
but does not remove the cost. For 168 hourly forecasts × many origins × rolling-origin
validation, this is often prohibitive. Budget it explicitly before committing.

### Current direction

**Spectral decomposition in the forward process.** Caldas, F., Kumar, S. & Soares, C.
(2026). 🔗 [arXiv:2601.21812](https://arxiv.org/abs/2601.21812) — model-agnostic; decomposes
the signal spectrally and stages noise injection by component energy, so dominant
frequencies keep high SNR longer. Improves seasonality retention with negligible overhead
and works with DiffWave / TimeGrad / CSDI unchanged.

---

## 4. Flow matching

Lipman et al., *Flow Matching for Generative Modeling*, ICLR 2023 🔗
[arXiv:2210.02747](https://arxiv.org/abs/2210.02747)

Learns a continuous-time transport between noise and data by regressing a **velocity
field**, rather than a step-by-step denoising chain.

| | Diffusion | Flow matching |
|---|---|---|
| Training | Many discrete steps | Single continuous ODE to fit |
| Sampling | Iterative, many network calls | **ODE solver — a handful of steps** |
| Structure | Fixed noise schedule | Learns the transport |

**Far fewer function evaluations at inference.** This is the property that makes generative
forecasting plausible operationally.

### Sundial 🔗 [arXiv:2502.00816](https://arxiv.org/abs/2502.00816) · *ICML 2025*

The first large TSFM to use this for forecasting:

- **TimeFlow Loss** — a parameterised loss for autoregressive conditional generation over
  arbitrary distributions
- **No discrete tokenisation** and **no assumed parametric density**
- Trained on **TimeBench** — 1 trillion time points
- **35× inference speedup** over Chronos while second on GIFT-Eval among zero-shot models
- Millisecond zero-shot forecasts

> Sundial is the concrete evidence that generative forecasting is not permanently locked out
> by inference cost. Flow matching is what changed that.

---

## 5. Where the field is going

`resources.md` §3.7 treats probabilistic forecasting as conformal. That is **half** the
picture. The other half:

```
Point forecast  →  quantile model  →  diffusion/flow generative  →  conformal wrapper
                  (cheap, 1-D)         (multimodal, costly)         (calibration guarantee)
```

These compose. A sensible production stack:

1. **A quantile or generative TSFM** for the predictive distribution
2. **Conformal calibration** on top to guarantee marginal coverage — see
   [[Model Validation Strategies]] §6, [[resources]] §3.7
   — because even a well-specified model drifts, and ACI/EnbPI/SPCI handle the drift
3. **Coverage evaluated stratified by volume decile** — marginal coverage hides peak failure
   ([[Model Validation Strategies]] §6.4)

> ⚠️ **The known tension:** patch-based transformers achieve competitive *point accuracy*
> but their *calibration degrades at long horizons*, while xLSTM architectures (TiRex)
> calibrate robustly across horizons — TSFM-Eval 🔗
> [arXiv:2609.25788](https://arxiv.org/abs/2609.25788). **At h = 168 the model with the best
> forecast may not be the model with the usable intervals.** Measure both.

---

## 6. Practical guidance for hourly count data

| Question | Recommendation |
|---|---|
| Need calibrated intervals, low compute | Quantile model + split/CQR conformal. Start here. |
| Need intervals under shift | ACI 🔗 [arXiv:1906.00130](https://arxiv.org/abs/1906.00130) or SPCI — not plain split conformal |
| Need multimodality (events, outages) | Flow-matching / Sundial; **verify multimodality exists first** |
| Long horizon, tight compute | Quantile model. Do not attempt iterative diffusion. |
| Need honest intervals at peaks | Nothing above guarantees it. Test it. See H4 in your 168-point study. |
| Counts with variance ∝ mean | **Negative Binomial** likelihood, not Gaussian. Matches the data-generating process. |

**NGBoost** 🔗 [arXiv:2002.09495](https://arxiv.org/abs/2002.09495) is worth knowing here —
it is already in your reference list for the 168-point study. It gives calibrated *distributions*
from gradient boosting, including the Negative Binomial option, without needing a neural
network. That makes it a practical middle rung between quantile regression and diffusion.

---

## References

**Quantile and parametric**
1. Koenker, R. & Bassett, G. (1978). Regression quantiles. *Econometrica*. 🔗 https://doi.org/10.2307/1913643
2. Salinas, D. et al. (2020). DeepAR. 🔗 https://arxiv.org/abs/1704.04110
3. Liu, C. et al. (2025). Moirai 2.0 — mixture → quantile negative result. 🔗 https://arxiv.org/abs/2511.11698
4. Ansari, A.F. et al. (2025). Chronos-2 — quantile output. 🔗 https://arxiv.org/abs/2510.15821
5. Zhang, L. & Chen, M. (2022). NGBoost. 🔗 https://arxiv.org/abs/2002.09495

**Diffusion**
6. Su, C. et al. (2025). Diffusion Models for Time Series Forecasting: A Survey. 🔗 https://arxiv.org/abs/2507.14507
7. Karras, T., Aittala, M., Aila, T. & Laine, S. (2022). Diffusion Models for Time Series Applications: A Survey. 🔗 https://arxiv.org/abs/2305.00624
8. Rasul, H. et al. (2021). TimeGrad. 🔗 https://arxiv.org/abs/2101.12072
9. Tashiro, Y. et al. (2021). CSDI. 🔗 https://arxiv.org/abs/2107.03502
10. Song, J., Meng, C. & Ermon, S. (2020). DDIM. 🔗 https://arxiv.org/abs/2010.02502
11. Caldas, F., Kumar, S. & Soares, C. (2026). A Decomposable Forward Process in Diffusion Models. 🔗 https://arxiv.org/abs/2601.21812

**Flow matching**
12. Lipman, J. et al. (2023). Flow Matching for Generative Modeling. *ICLR 2023*. 🔗 https://arxiv.org/abs/2210.02747
13. Liu, Y. et al. (2025). Sundial. *ICML 2025*. 🔗 https://arxiv.org/abs/2502.00816

**Calibration**
14. Romano, Y., Patterson, E. & Candès, E. (2019). Conformalized Quantile Regression. 🔗 https://arxiv.org/abs/1905.03222
15. Romano, Y., Patterson, E. & Candès, E. (2020). Adaptive Conformal Inference. 🔗 https://arxiv.org/abs/1906.00130
16. Michael, P., Symeonides, M. & Trihinas, D. (2026). TSFM-Eval. 🔗 https://arxiv.org/abs/2609.25788

## Cross-links

- [[Time Series Foundation Models]]
- [[Model Validation Strategies]]
- [[Distribution Shift and Normalization]]
- [[Practice 04 — Conformal Prediction on Hourly Counts]]
- [[time-series-forecasting-models]]
- [[resources]]
