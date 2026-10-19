---
type: reference
status: active
tags:
  - time-series
  - forecasting
  - normalization
  - revin
  - distribution-shift
  - deep-learning
created: 2026-10-14
aliases:
  - RevIN
  - Reversible Instance Normalization
  - Distribution Shift in Forecasting
  - Normalization for Forecasting
---

# Distribution Shift and Normalization

Instance normalisation is the highest-value, least-understood component in a modern
forecasting stack. It is in almost every architecture, it is rarely explained, and it has
only recently been ablated properly.

---

## 1. The problem

A time series' mean, variance and scale drift over time. A model trained on 2022 data and
applied to 2026 is applying a learned function to inputs from a **different distribution**.

```
p_train(x) ≠ p_test(x)
```

For a pure linear map this is fatal — the layer sees coordinates it has never seen. Neural
networks are trained with normalisation layers (batch norm, layer norm) for exactly this
reason, but those use **batch** or **layer** statistics. In forecasting, a batch contains
windows from *different series at different times* — pooling their statistics is
meaningless.

## 2. The three shifts

Berthelier et al. 🔗 [arXiv:2603.11869](https://arxiv.org/abs/2603.11869) name three
distinct problems, and this taxonomy is the most useful thing in the recent literature:

| Shift | What moves | RevIN's answer |
|---|---|---|
| **Temporal input shift** | The look-back window's own statistics differ from the training windows' | Normalise by the instance's own `μ, σ` |
| **Spatial input shift** | Different *channels/variates* have different scales | Per-channel statistics |
| **Conditional output shift** | `p(y_horizon \| x_lookback)` itself varies across windows | ⚠️ **Not solved.** The regression itself is non-stationary |

> **The conditional shift is the open problem.** RevIN removes a scale difference. It
> cannot remove a change in the *relationship* between past and future. This is the real
> non-stationarity, and no normalisation scheme addresses it — see
> [[Model Validation Strategies]] §6.4 on why ACI exists to handle it online.

---

## 3. RevIN

Kim, T., Kim, J., Tae, Y., Park, C., Choi, J.H. & Choo, J. (2022). *Reversible Instance
Normalization for Accurate Time-Series Forecasting against Distribution Shift.* **ICLR
2022**. 🔗 [openreview](https://openreview.net/forum?id=cGDAkQo1C0p) ·
[code](https://github.com/ts-kim/RevIN)

Three steps, symmetrically:

```
1. STATISTICS   μ = mean(x),  σ = std(x)         computed per instance, per channel
2. NORMALIZE    x̃ = (x − μ) / σ
3. AFFINE       x̃ = γ ⊙ x̃ + β                  learnable, optional
   ─── model ───
4. DENORMALIZE  ŷ = σ ⊙ (ŷ' − β) + μ            reverse of steps 2–3
```

The name is the point: **normalise on the way in, denormalise on the way out.** The model
only ever sees approximately stationary inputs; the scale information is restored afterwards
so the forecast lands on the right scale.

```python
import torch, torch.nn as nn

class RevIN(nn.Module):
    def __init__(self, num_features: int, eps: float = 1e-5, affine: bool = True):
        super().__init__()
        self.eps, self.affine = eps, affine
        if affine:
            self.affine_weight = nn.Parameter(torch.ones(num_features))
            self.affine_bias   = nn.Parameter(torch.zeros(num_features))

    def forward(self, x, mode: str):
        if mode == "norm":
            self.mean = x.mean(1, keepdim=True).detach()
            self.stdev = torch.sqrt(x.var(1, keepdim=True, unbiased=False) + self.eps).detach()
            x = (x - self.mean) / self.stdev
            if self.affine:
                x = x * self.affine_weight + self.affine_bias
        elif mode == "denorm":
            if self.affine:
                x = (x - self.affine_bias) / (self.affine_weight + self.eps * self.eps)
            x = x * self.stdev + self.mean
        return x
```

Usage is always a matched pair around the backbone:

```python
revin = RevIN(num_features=C)
h = revin(x, "norm")
h = backbone(h)
y = revin(h, "denorm")
```

> **⚠️ Implementation discipline:** `μ` and `σ` are **detached** in the original. If you let
> gradients flow through them, backprop reaches through the normalisation into the input
> statistics and the optimisation behaves very differently — this is the "backpropagation in
> the normalized space" component Berthelier et al. found genuinely necessary.

---

## 4. The 2025–26 backlash — read this before adopting it uncritically

RevIN became near-universal without being ablated. Two 2025–26 papers questioned it.

**Berthelier, G., Nabil, T., Le Naour, E., Niamke, R., Perlaza, S. & Neglia, G. (2026).
*On the Role of Reversible Instance Normalization.* 🔗
[arXiv:2603.11869](https://arxiv.org/abs/2603.11869)**

Ablations find:
- ✅ **Input normalisation + backprop in the normalised space — necessary.** These are the
  load-bearing parts.
- ❌ **The affine layer is not required**, and in follow-up work it is often entirely dropped
  (DishTS, SAN both omit it).
- ⚠️ **On already-stationary datasets, per-instance normalisation can be *detrimental*.** If
  there is no shift to correct, you are removing real amplitude information and adding noise.

**Fu, F. et al. (2025). *Noise or Signal? Deconstructing Contradictions and an Adaptive
Remedy for Reversible Normalization.* 🔗 [arXiv:2510.04667](https://arxiv.org/abs/2510.04667)**

The title is the argument: is a window's `μ, σ` a **signal** (real regime information) or
**noise** (estimation error from a short window)? RevIN assumes signal. On short look-backs
it may be largely noise, and normalising by it discards genuine level information.

### Practical rule

| Situation | Recommendation |
|---|---|
| Non-stationary series, long look-back | RevIN with affine — full version |
| Non-stationary, short look-back | Plain normalisation (no affine); treat `μ,σ` cautiously |
| Stationary series, clean data | **Test with and without.** It may hurt |
| Any case | Make it a configurable flag and ablate it, never assume |

---

## 5. The family of alternatives

| Method | Idea | Reference |
|---|---|---|
| **RevIN** | Per-instance `μ,σ`, symmetric denormalisation | Kim et al., ICLR 2022 — 🔗 [openreview](https://openreview.net/forum?id=cGDAkQo1C0p) |
| **SAN** | Statistics-Aware Normalization — patch-level rather than window-level | Liu et al., 2023 |
| **DishTS** | Dual-scale: learns intra- and inter-segment drift; no affine | Fan et al., 2023 |
| **DAIN** | Adaptive z-norm with *learned* scale/offset functions | Passalis et al., 2019 |
| **Non-stationary Transformers** | Predict future `μ,σ` from past rather than assuming constant offset | Liu et al., NeurIPS 2022 |
| **IN-Flow** 🔗 [arXiv:2401.16777](https://arxiv.org/abs/2401.16777) | Normalizing-flow instance normalisation — a richer invertible transform than affine | 2024 |
| **APT** 🔗 [AAAI 2026](https://ojs.aaai.org/index.php/AAAI/article/view/38542) | Timestamp-conditioned affine parameters; targets the *global* shift RevIN misses | 2026 |

> **IN-Flow is the theoretically interesting one.** RevIN's normalisation is affine —
  mean-shift plus scale. A normalizing flow is an arbitrary invertible transform, so it can
  correct distributional skew and multimodality that RevIN structurally cannot. It also
  gives you invertibility for free, which matters if you want a likelihood.


### The same idea, baked into a pretrained model

Most of the row above are *layers* you add to a model you train. Several TSFMs now absorb the
idea into the architecture itself, which matters because you inherit the mechanism without
implementing it:

| Model | How it normalises |
|---|---|
| **Timestral** (Mistral) 🔗 [GH](https://github.com/mistralai/timestral) | Each forecast patch is **denormalised with the context statistics *and* the block's earlier predicted medians** — instance normalisation extended across decode blocks |
| **PatchTST-FM** (IBM) | Patch-level instance normalisation as standard practice |
| **NLinear** | Subtract the last value, add it back — the degenerate `mu`-only case |

> **Timestral's version is the interesting refinement.** Vanilla RevIN normalises by one
> `(mu, sigma)` computed over the whole context. Timestral recomputes the statistics at every
> decode block, folding in medians it has *already predicted* for that block. That is closer to
> **Non-stationary Transformers** in the table above — predicting the future normalisation
> statistics rather than assuming they are constant — implemented inside a zero-shot model.
>
> The caveat from section 2 stands regardless: this removes a **scale** difference. The
> **conditional shift** — `p(y_horizon | x_lookback)` itself moving — is untouched, and no
> normalisation scheme in this table addresses it. Timestral denormalises; it does not re-learn
> the relationship.

---

## 6. Why this matters more than it looks

> ### Normalisation is why a linear model is competitive with a Transformer
>
> See [[Linear Models for Forecasting]] §4. `RLinear` = a one-layer linear map + RevIN.
> It is competitive with far more complex architectures. The honest reading is that
> **instance normalisation supplies most of the generalisation, and the backbone supplies
> relatively little.**
>
> That has two consequences:
> 1. If you are comparing architectures, normalise all of them identically or the
>    comparison is meaningless.
> 2. If you are tuning, the normalisation is probably a higher-leverage knob than the
>    architecture.

And it has a third consequence that is easy to miss:

> ### ⚠️ Detached instance statistics are a leakage vector
>
> RevIN computes `μ, σ` from the **look-back window**. If your look-back window overlaps the
> test period — which is exactly what happens with a sliding-window split or a rolling
> feature — then instance normalisation is reading test-set statistics, even though no
> gradient flows through them.
>
> This is an *input reach* leak, not a target leak, and it is invisible to the usual checks.
> It is the same category as the long-window rolling feature in
> [[Model Validation Strategies]] §5. **Audit the look-back window length against your purge gap.**
>
> For 9-1-1 hourly counts, the practical rule is simple: if you forecast 168 hours ahead
> from a look-back that ends at the forecast origin, the look-back must end exactly at the
> origin — never extend it past.

---

## 7. Ablation checklist

Run this before you adopt a normalisation scheme:

- [ ] With and without normalisation, same backbone, same seed
- [ ] With and without the affine layer
- [ ] Detached vs non-detached `μ, σ`
- [ ] Effect of look-back length — does the benefit grow with context?
- [ ] Effect of forecast horizon — does it degrade at long `h`?
- [ ] Per-dataset: does it hurt on any stationary series?
- [ ] **Confirm the look-back never crosses the forecast origin**
- [ ] Stratified by peak vs non-peak (normalisation may hurt exactly where amplitude matters)

## References

1. Kim, T., Kim, J., Tae, Y., Park, C., Choi, J.H. & Choo, J. (2022). Reversible Instance Normalization. *ICLR 2022*. 🔗 https://openreview.net/forum?id=cGDAkQo1C0p
2. Berthelier, G. et al. (2026). On the Role of Reversible Instance Normalization. 🔗 https://arxiv.org/abs/2603.11869
3. Fu, F. et al. (2025). Noise or Signal? 🔗 https://arxiv.org/abs/2510.04667
4. Chen, S. et al. (2024). Addressing Distribution Shift with Instance Normalization Flows (IN-Flow). 🔗 https://arxiv.org/abs/2401.16777
5. Liu, S. et al. (2022). Non-stationary Transformers. 🔗 https://proceedings.neurips.cc/paper_files/paper/2022/hash/9c8895f52f2e29dca3d071bd16fda585-Abstract-Conference.html
6. Zeng, A. et al. (2023). Are Transformers Effective for Time Series Forecasting? 🔗 https://arxiv.org/abs/2205.13504
7. Fan, W. et al. (2023). DishTS. 🔗 https://openreview.net/forum?id=pHMt0SXWWz

## Cross-links

- [[Linear Models for Forecasting]]
- [[Model Validation Strategies]]
- [[time-series-forecasting-models]]
- [[Practice 02 — Linear Models and the Baseline Question]]
- [[Time Series Foundation Models]]
- [[Forecasting Non-Stationary Data]] — what normalisation removes (scale) vs what needs a transform (level drift); the conditional-shift framing §2 shares
- [[resources]]
