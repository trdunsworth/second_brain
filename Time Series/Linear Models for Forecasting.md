---
type: reference
status: active
tags:
  - time-series
  - forecasting
  - linear-models
  - baselines
  - dlinear
  - normalization
created: 2026-10-14
aliases:
  - DLinear
  - LTSF-Linear
  - NLinear
  - Linear Forecasting Baselines
  - Linear Models
---

# Linear Models for Forecasting

The most practically important, most under-discussed result in modern forecasting: **a
one-layer linear model, applied directly, beats most Transformers on long-horizon
forecasting.**

---

## 1. The result

Zeng, A., Chen, M., Zhang, L. & Xu, Q. (2023). *Are Transformers Effective for Time Series
Forecasting?* **AAAI 2023**. 🔗 [arXiv:2205.13504](https://arxiv.org/abs/2205.13504) ·
[code](https://github.com/cure-lab/LTSF-Linear)

> "LTSF-Linear surprisingly outperforms existing sophisticated Transformer-based LTSF
> models in all cases, and often by a large margin."

Reported improvements over the best contemporary Transformer results on the LTSF benchmarks:
roughly **25% on Weather, ~50% on Exchange-Rate**, 20–50% across the multivariate suite.

### Why it landed so hard

The comparison was set up fairly, and that is what made it credible. Prior LTSF papers
benchmarked Transformers against *autoregressive* baselines (ARIMA, DeepAR), which suffer
error accumulation and therefore lose by construction. Zeng et al. used **direct multi-step
(DMS)** forecasting instead — emit all `h` steps in a single pass.

> ### The real claim is not "linear beats Transformer"
>
> It is: **most of the apparent superiority of LTSF Transformers came from direct
> multi-step forecasting, not from attention.** Against an equally-direct linear baseline,
> the architectural advantage largely evaporated.
>
> Read again carefully: "we question the validity of this line of research" is about
> *unfair baselines*, not about Transformers being useless.

PatchTST (Nie et al., ICLR 2023, 🔗 [arXiv:2211.14730](https://arxiv.org/abs/2211.14730)) was
the architecturally serious response. Patching plus channel independence recovered a real
advantage — ~21% MSE reduction over prior Transformers — and it now competes with the linear
family rather than with Informer. **But PatchTST's own paper reports DLinear in its
comparison table**, so the linear baseline stayed in the literature.

---

## 2. Direct vs recursive — the distinction that explains most LTSF results

| | **Iterative multi-step (IMS)** | **Direct multi-step (DMS)** |
|---|---|---|
| Mechanism | Fit a one-step model, apply `h` times | Fit one model to map context → all `h` steps |
| Error | Compounds at each step | No self-compounding |
| Horizon-specific? | One model, any `h` | One model per `h` (or a multi-output head) |
| Parallelisable | No | Yes |

```
IMS:  ŷ_{t+1} → ŷ_{t+2} → ŷ_{t+3} …   errors accumulate
DMS:  context ──────────────→ [ŷ_{t+1} … ŷ_{t+h}]   one shot
```

**This bears directly on [[168-Point Forecast Comparison - Discrete vs Continuous]].** That
study's two arms — 168 separate hourly models versus one continuous 168-point model — are
*conflated* with IMS-versus-DMS unless you pin the forecasting strategy in both arms.
Per-hour-of-week models (e.g. ARIMA on Monday-08:00 only) are naturally IMS. A single
continuous model may be either. If the continuous arm is DMS and the discrete arm is IMS,
you will measure the forecasting strategy, not the granularity.

> **Add an explicit control:** run the *same* model class in both IMS and DMS configurations
> at `h=168`. That isolates strategy from structure.

---

## 2b. The 2026 echo: PatchTST-FM

Wen, Y., Gifford, W.M., Reddy, C., Nguyen, L.M., Kalagnanam, J. & Julius, A.A. (2026).
*Revisiting the Generic Transformer: Deconstructing a Strong Baseline for Time Series
Foundation Models.* IBM Research / RPI. 🔗 [arXiv:2602.06909](https://arxiv.org/abs/2602.06909) ·
[weights](https://huggingface.co/ibm-research/patchtst-fm-r1)

Four years after LTSF-Linear, the field ran the argument again at foundation-model scale and
reached a **more uncomfortable conclusion**:

> "we demonstrate that the **generic architecture itself demonstrates excellent
> scalability**" — a standard patch transformer reaches SOTA zero-shot performance on
> GIFT-Eval given a good training protocol.

~260M parameters, d_model 1024, patch 16, context 8192, **99 quantile levels**. Released as
`ibm-research/patchtst-fm-r1` and `ibm-granite/granite-timeseries-patchtst-fm-r1/r2`.

> ### What the two papers together say
>
> | | Zeng et al. 2022 | Wen et al. 2026 |
> |---|---|---|
> | Question | Are Transformers effective for LTSF? | What makes a TSFM work? |
> | Answer | The architecture was the wrong variable; try a linear map | The architecture was the wrong variable; **scale the recipe** |
> | Levers found | Direct multi-step; normalisation | Contiguous patch masking, synthetic generator corpora (KernelSynth, TSMixup), scale |
> | Implication | Benchmark against a linear baseline | Do not attribute gains to architecture |
>
> Zeng et al. attributed LTSF performance to the **forecasting strategy**; Wen et al.
> attribute TSFM performance to the **training recipe** and explicitly warn that
> heterogeneous training setups "make it difficult to attribute improvements to
> architectural innovations versus data engineering."
>
> **The through-line: in both eras the architecture was mostly noise.** That is a strong
> claim, and it is the one your own model-selection budget should be built around. It also
> means a paper's architecture contribution is worth very little until you have seen the
> ablation on data composition.

PatchTST-FM is available through the TimeCopilot hub and through Darts' `FoundationModel`
interface. See [[TimeCopilot]] and [[Time Series Foundation Models]].

---

## 3. The three models

### Vanilla `Linear`

A single linear layer `ℝ^L → ℝ^H` applied to the (normalised) look-back window, shared across
variates. The whole model.

### `NLinear` — normalisation by last value

```
x̃ = x − x_last        subtract the final observed value
ŷ = Linear(x̃) + x_last  add it back
```

Motivated by **distribution shift between train and test**. It removes the *level* of the
window and asks the model to predict the *deviation from the last value* — a stationary
target.

### `DLinear` — decomposition

```
x̃_trend   = MovingAvg(x, kernel)
x̃_remainder = x − x̃_trend
ŷ = Linear_trend(x̃_trend) + Linear_remainder(x̃_remainder)
```

Motivated by the observation that decomposition helps Transformers, so it should help a
linear model too. Two one-layer linears instead of one; the sum is the forecast.

### Variants worth knowing

- **`RLinear`** — NLinear + RevIN. Combines the two highest-value tricks in this note.
- **`RMLP`** — residual MLP; linear skip connection plus an MLP correction.
- **`FITS`** — frequency-domain interpolation, a low-parameter linear-in-complexity
  alternative.

---

## 4. Why linear models are strong here

Three reasons, and the third is the one people miss:

1. **Inductive bias matches the problem.** Long-horizon forecasting is largely about trend
   and periodicity. A linear map from a long look-back to a long horizon is an extremely
   well-matched hypothesis class. Attention's expressiveness is mostly wasted.
2. **Direct multi-step by construction** — no error accumulation, no structural handicap.
3. **⚠️ The normalisation is doing most of the work, and it is not part of "linear".**

> ### The single most important line in this note
>
> RevIN (see [[Distribution Shift and Normalization]]) is what makes a linear model
> competitive. NLinear and RLinear are *linear models plus a normalisation layer*.
>
> This reframes the whole finding: **instance normalisation is the load-bearing component,
> and the layer underneath it barely matters.** That is also why RevIN is in essentially every
> modern forecasting architecture — and also why Berthelier et al. 🔗
> [arXiv:2603.11869](https://arxiv.org/abs/2603.11869) ablated it hard in 2026 and found
> several components redundant or detrimental on stationary data.
>
> Practical read: a linear baseline *with* normalisation is a strong baseline. A linear
> baseline *without* is not, and reporting the latter is a common and serious mistake.

---

## 5. Limits — where the linear family genuinely loses

Being fair to the approach this undercuts:

- **No nonlinear cross-variate interaction.** Channel-shared weights. Matters when variates
  interact multiplicatively (TFT's variable selection exists for this reason).
- **Cannot extrapolate beyond training support** in level, for the same reason trees cannot.
- **Short horizons underuse the capacity.** A linear map is a poor fit for regime changes
  within a short window.
- **The LTSF benchmarks are the argument's weak point.** They are 9 datasets, univariate or
  channel-shared, with a fixed look-back. The "Transformers don't work" reading is stronger
  than the evidence supports; the "DMS beats IMS" reading is well supported.

---

## 6. What to do about it

> ### This changes your baseline panel
>
> [[Time Series Forecasting Baselines]] §8 currently recommends seasonal naive, hour-of-week
> mean, seasonal naive `m=24`, Theta and an ensemble. **Add DLinear/NLinear and N-HiTS.**
>
> Both are cheap, both are in `neuralforecast` or ten lines of PyTorch, and both model
> **trend explicitly**. Seasonal naive and Theta are seasonal-only or trend-only; a
> model with an explicit trend term is the stronger classical-modern comparison.
>
> Without a trend-capable baseline, "our model beats seasonal naive" is a weak claim against
> a benchmark that cannot represent trend at all.

### Minimum viable benchmark panel

| Baseline | `m` / form | What it tests |
|---|---|---|
| Seasonal naive | 168 | The honest floor |
| Hour-of-week mean | trailing window | Captures level drift |
| Seasonal naive | 24 | Quantifies how weak `m=24` is |
| **NLinear** | direct, 168→168 | Linear + level normalisation |
| **DLinear** | direct, 168→168 | Linear + explicit trend/seasonal split |
| **N-HiTS** 🔗 [arXiv:2201.12886](https://arxiv.org/abs/2201.12886) | direct | MLP + hierarchical interpolation + quantiles |
| **Ensemble of the above** | simple average | M4's most robust finding |

> Reporting against **three or more** baselines with an explicit statement of which
> benchmark attribute you are optimising for (Montero-Manso & Hyndman 🔗
> [arXiv:2003.07823](https://arxiv.org/abs/2003.07823)).

---

## 7. Minimal implementation

`DLinear` is short enough to read in full — that is part of the point.

```python
import torch, torch.nn as nn

class DLinear(nn.Module):
    """Decomposition-Linear. Direct multi-step: look-back L -> horizon H."""
    def __init__(self, L: int, H: int, kernel_size: int = 25, channels: int = 1):
        super().__init__()
        self.L, self.H, self.C = L, H, channels
        self.decomp = _MovingAvg(kernel_size)
        self.lin_trend = nn.Linear(L, H)
        self.lin_resid = nn.Linear(L, H)

    def forward(self, x):                      # x: (B, C, L)
        trend = self.decomp(x)                 # (B, C, L)
        resid = x - trend
        return (self.lin_trend(trend) + self.lin_resid(resid)).transpose(1, 2)


class _MovingAvg(nn.Module):
    def __init__(self, kernel_size: int):
        super().__init__()
        self.k = kernel_size
        self.avg = nn.AvgPool1d(kernel_size=kernel_size, stride=1, padding=0)

    def forward(self, x):
        # replicate-pad both ends so the output keeps length L
        front = x[:, :, :1].repeat(1, 1, (self.k - 1) // 2)
        end = x[:, :, -1:].repeat(1, 1, self.k // 2)
        return self.avg(torch.cat([front, x, end], dim=-1))
```

Add instance normalisation around it and you have effectively `RLinear`:

```python
class RLinear(nn.Module):
    def __init__(self, L, H):
        super().__init__()
        self.backbone = DLinear(L, H)

    def forward(self, x):                      # x: (B, C, L)
        mu = x.mean(dim=-1, keepdim=True)
        sd = x.std(dim=-1, keepdim=True) + 1e-5
        return self.backbone((x - mu) / sd) * sd + mu
```

---

## References

1. Zeng, A., Chen, M., Zhang, L. & Xu, Q. (2023). Are Transformers Effective for Time Series Forecasting? *AAAI 2023*. 🔗 https://arxiv.org/abs/2205.13504
2. Nie, Y., Nguyen, N.H., Sinthong, P. & Kalagnanam, J. (2023). A Time Series is Worth 64 Words (PatchTST). *ICLR 2023*. 🔗 https://arxiv.org/abs/2211.14730
3. Oreshkin, B.N. et al. (2020). N-BEATS. *ICLR 2020*. 🔗 https://arxiv.org/abs/1905.10437
4. Challu, C. et al. (2023). N-HiTS. *AAAI 2023*. 🔗 https://arxiv.org/abs/2201.12886
5. Kim, T. et al. (2022). RevIN. *ICLR 2022*. 🔗 https://openreview.net/forum?id=cGDAkQo1C0p
6. Wen, Y., Gifford, W.M., Reddy, C., Nguyen, L.M., Kalagnanam, J. & Julius, A.A. (2026). Revisiting the Generic Transformer (PatchTST-FM). 🔗 https://arxiv.org/abs/2602.06909
7. Berthelier, G. et al. (2026). On the Role of Reversible Instance Normalization. 🔗 https://arxiv.org/abs/2603.11869
8. Fu, F. et al. (2025). Noise or Signal? Deconstructing Contradictions in Reversible Normalization. 🔗 https://arxiv.org/abs/2510.04667
9. Montero-Manso, P. & Hyndman, R.J. (2021). Attributes that define forecasting benchmarks. 🔗 https://arxiv.org/abs/2003.07823

## Status

- [x] The LTSF-Linear result and its correct interpretation
- [x] Direct vs recursive distinction and its bearing on the 168-point study
- [x] DLinear / NLinear / RLinear formulations
- [x] Minimal working implementation
- [ ] Empirical: add DLinear and N-HiTS to the §8 baseline panel

## Cross-links

- [[Distribution Shift and Normalization]]
- [[time-series-forecasting-models]]
- [[Time Series Forecasting Baselines]]
- [[Model Validation Strategies]]
- [[168-Point Forecast Comparison - Discrete vs Continuous]]
- [[Practice 02 — Linear Models and the Baseline Question]]
- [[Forecasting Non-Stationary Data]] §5 — NLinear minus last value *is* d=1 differencing; why linear models are the non-stationarity-native family
- [[resources]]
