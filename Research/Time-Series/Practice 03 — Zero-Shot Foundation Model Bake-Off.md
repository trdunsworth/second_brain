---
type: practice
status: active
tags:
  - time-series
  - practice
  - foundation-models
  - zero-shot
  - benchmarking
  - calibration
created: 2026-10-14
aliases:
  - Practice 03
  - TSFM Bake-Off
  - Foundation Model Practice
  - Zero-Shot Practice
---

# Practice 03 — Zero-Shot Foundation Model Bake-Off

**Goal:** put real zero-shot foundation models head to head against your own baseline
panel on hourly count data — and measure **calibration**, not just point accuracy.

> The second half matters more. TSFM-Eval 🔗 [arXiv:2609.25788](https://arxiv.org/abs/2609.25788)
> found that patch-transformer TSFMs achieve competitive **point accuracy** but their
> calibration **degrades at long horizons**, while xLSTM models calibrate robustly. At
> `h = 168`, the best forecast and the best intervals may be different models.

---

## Setup

```bash
pip install statsforecast utilsforecast pandas numpy matplotlib \
            timesfm chronos-forecasting        # core
# optional extras
pip install tirex toto-2                        # NX-AI / Datadog
```

GPU strongly recommended for Chronos-2 and TimesFM. TiRex and Toto-2.0-22m run on CPU.

---

## Step 1 — The models

| Model | Package | Size | Why in the bake-off |
|---|---|---|---|
| **Chronos-2** | `chronos-forecasting` | 120M | Current reference point; covariates + multivariate |
| **Chronos-Bolt** | `chronos-forecasting` | 9M | The fast univariate incumbent |
| **TimesFM 2.5** | `timesfm` | — | Google's line; strong long context |
| **TiRex** | `tirex` | 35M | xLSTM — the calibration result you are testing |
| **Toto-2.0-22m** | `toto-2` | 22M | Observability-specialised, 7× smaller than 1.0 |
| **Reverso** | `reverso` | 2.6M | The "transformers are unnecessary" claim |

> **Start with two or three.** Running all six on rolling origin will take longer than you
> expect, and the point is to learn the harness, not to maximise the leaderboard.

---

## Step 2 — A uniform adapter

Different APIs. One interface. Write this once.

```python
import numpy as np, pandas as pd

def load_zero_shot(name, context_len=512, horizon=168):
    """
    Returns a callable  f(context: np.ndarray) -> dict with 'point' (H,) and
                                       optionally 'quantiles' (k, H).
    """
    if name == "chronos2":
        import torch
        from chronos import Chronos2Pipeline
        pipe = Chronos2Pipeline.from_pretrained("amazon/chronos-2", device_map="cpu")
        def f(ctx):
            t = torch.tensor(ctx, dtype=torch.float32)
            out = pipe.predict_quantiles(t.unsqueeze(0), prediction_length=horizon)
            qs = out[0].quantiles.squeeze(0).numpy()     # (k, H)
            return {"point": qs[len(qs) // 2], "quantiles": qs}
        return f

    if name == "chronosbolt":
        import torch
        from chronos import ChronosBoltPipeline
        pipe = ChronosBoltPipeline.from_pretrained("amazon/chronos-bolt", device_map="cpu")
        def f(ctx):
            t = torch.tensor(ctx, dtype=torch.float32)
            out = pipe.predict_quantiles(t.unsqueeze(0), prediction_length=horizon)
            qs = out[0].quantiles.squeeze(0).numpy()
            return {"point": qs[len(qs) // 2], "quantiles": qs}
        return f

    if name == "timesfm":
        import timesfm
        model = timesfm.TimesFM_2p5_200M()
        model.load_checkpoint()
        def f(ctx):
            fc, q = model.forecast(
                horizon=horizon, inputs=[ctx.astype(np.float32)],
                get_quantiles=True, return_numpy=True)
            return {"point": fc[0], "quantiles": np.asarray(q[0]).T}   # (k, H)
        return f

    if name == "tirex":
        from tirex import load_model
        model = load_model("NX-AI/TiRex")
        import torch
        LEVELS = [0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9]
        def f(ctx):
            q, mean = model.forecast(context=torch.tensor(ctx).unsqueeze(0),
                                     prediction_length=horizon)
            q = q.squeeze(0).squeeze(-1).T.numpy() if q.ndim > 2 else q.squeeze(0).T.numpy()
            return {"point": q[LEVELS.index(0.5)], "quantiles": q}
        return f

    raise ValueError(f"unknown model: {name}")
```

> **⚠️ Check each library's current API before running.** These packages move fast — check
> the model card for the version you `pip install`. Write the adapter so a signature change
> is a one-line fix.

---

## Step 3 — Zero-shot means NO fitting

That is the entire appeal and the entire point.

```python
def zero_shot_forecast(y_train, h=168, model="chronos2", context_len=512):
    """The model NEVER sees y_train during fitting. Context only."""
    ctx = y_train[-min(context_len, len(y_train)):]
    return load_zero_shot(model, len(ctx), h)(ctx)
```

Contrast with every model in Practice 01 and 02, which are **refitted at every origin**.
> That asymmetry is not a defect in your design — it is the thing you are measuring. Record
> it explicitly in whatever you write up.

---

## Step 4 — Rolling origin, same protocol

```python
H, M = 168, 168

def bake_off(y, models=("chronos2", "tirex"), n_windows=6, context_len=512):
    rows = []
    for k in range(n_windows):
        cut = len(y) - (n_windows - k) * H
        if cut < context_len * 2:
            continue
        y_train, y_test = y[:cut], y[cut:cut + H]

        for name in models:
            try:
                out = zero_shot_forecast(y_train, H, name, context_len)
            except Exception as e:
                print(f"  skip {name} @ {cut}: {e}")
                continue

            pred = out["point"]
            denom = np.mean(np.abs(y_train[M:] - y_train[:-M]))   # TRAIN slice only
            rows.append({
                "model": name, "origin": cut,
                "actual": y_test, "pred": pred,
                "mase": np.mean(np.abs(y_test - pred)) / denom,
                "mae":  np.mean(np.abs(y_test - pred)),
                "quantiles": out.get("quantiles"),
            })
    return pd.DataFrame(rows)
```

---

## Step 5 — Point accuracy

```python
zs = bake_off(y)

# Concatenate the Practice 01 baseline panel
import pickle
with open("../practice01_results.pkl", "rb") as f:
    p1 = pickle.load(f)

zero_shot_summary = zs.groupby("model")[["mase", "mae"]].agg(["mean", "std"])
baseline_summary   = p1.groupby("model")[["mase", "mae"]].agg(["mean", "std"])

comparison = pd.concat([baseline_summary["mase"], zero_shot_summary["mase"]],
                       axis=1).sort_values(("mean", 1))
print(comparison.round(4))
```

> **The result to expect:** TSFMs land roughly level with a well-built classical baseline and
> ahead of plain seasonal naive. They are **not** dramatically better on clean, dense data
> with several years of history. If you see a huge margin, check for contamination — see
> Step 8.

---

## Step 6 — Calibration, the half that matters

```python
def coverage_table(zs, nominal_levels=(0.8, 0.9)):
    """
    Coverage AND sharpness, always together.
    Marginal coverage hides peak failure — see Model Validation Strategies §6.4.
    """
    out = []
    for (model, origin), g in zs.groupby(["model", "origin"]):
        qs = g["quantiles"].iloc[0]
        if qs is None:
            continue
        act = g["actual"].iloc[0]
        for lev in nominal_levels:
            lo_i = int(np.argmin(np.abs(LEVELS - (1 - lev) / 2)))
            hi_i = int(np.argmin(np.abs(LEVELS - 1 - (1 - lev) / 2)))
            inside = ((act >= qs[lo_i]) & (act <= qs[hi_i])).mean()
            width = float(np.mean(qs[hi_i] - qs[lo_i]))
            out.append({"model": model, "origin": origin, "level": lev,
                        "coverage": inside, "width": width, "actual": act})
    return pd.DataFrame(out)
```

⚠️ `LEVELS` must be the same ordering your adapter returned. Define it once, globally.

### Step 6b — Stratified by volume

```python
cov = coverage_table(zs)
cov = cov.merge(zs[["model", "origin", "actual"]].drop_duplicates(),
                on=["model", "origin"], how="left")

# Re-evaluate coverage restricted to high-volume periods
for model, g in cov.groupby("model"):
    hi = g[g["actual"] >= np.percentile(g["actual"], 90)]
    print(f"{model:>14}  overall {g[g.level==0.9]['coverage'].mean():.3f}"
          f"   top-decile {hi[hi.level==0.9]['coverage'].mean():.3f}")
```

> ### ⚠️ This is the finding that matters
>
> If overall coverage is on target and top-decile coverage is poor, the model is **exactly**
> the failure described in [[Model Validation Strategies]] §6.4: perfect on average, useless
> at peaks. For a staffing application that is the whole ball game.
>
> This is hypothesis **H4** in your 168-point study. Running it on a zero-shot model is a
> cheap, publishable-adjacent result and it does not require the Douglas County data.

---

## Step 7 — Context-length sensitivity

TSFM-Eval reports **context saturation**: transformer models have a point past which more
look-back *hurts*.

```python
for cl in (168, 336, 512, 1024, 2048):
    if cl >= len(y) - H:
        continue
    r = bake_off(y, models=("chronos2",), n_windows=4, context_len=cl)
    print(f"context {cl:>5}: MASE {r['mase'].mean():.4f}")
```

> **Expect a U-shape for the transformer models and a flat-or-rising curve for TiRex.** If
> you reproduce that, you have independently confirmed the saturation finding and the
> xLSTM state-tracking argument, on your data.

---

## Step 8 — Contamination check

⚠️ The models were pretrained on public corpora. Did they see your benchmark?

```python
from datasetsforecast.hierarchical import load_dataset
monash = load_dataset("hourly", group="M4")[0]

def contamination_probe(y, model="chronos2", context_len=512):
    """
    Heuristic: if a model has effectively memorised a series, the FIRST window of an
    entirely unfamiliar series should be no worse than the best windows of familiar ones.
    A large first-window advantage over familiar mid-series windows is a red flag.
    """
    out = zero_shot_forecast(y[-context_len - H:], H, model, context_len)
    denom = np.mean(np.abs(y[-H-M:-H] - y[-H-M:-H][:-M]))
    return np.mean(np.abs(y[-H:] - out["point"])) / denom

# A series you have never looked at
unseen = monash[monash["unique_id"] == monash["unique_id"].iloc[-1]]["y"].to_numpy()
print("unseen series MASE:", round(contamination_probe(unseen), 4))
```

Better: **prefer decontaminated checkpoints.** TiRex releases them explicitly for exactly
this reason. Use them for any reported number.

---

## Step 9 — Fine-tuning, if you have the data

Fine-tuning consistently improves over zero-shot (Laglil et al. 🔗
[arXiv:2607.23146](https://arxiv.org/abs/2607.23146)). Note this is the gap to budget
against — not zero-shot versus trained-from-scratch.

```python
# Chronos fine-tuning uses LoRA on a copy of the pre-trained weights.
# Moirai uses `uni2ts` fine-tuning scripts.
# Darts' FoundationModel interface exposes fine-tuning uniformly:
from darts.models import Chronos2Model     # FoundationModel subclass
m = Chronos2Model(input_chunk_length=512, output_chunk_length=168)
m.fit(train_series)                        # now this is no longer zero-shot
```

---

## Exercises

- [ ] Run Chronos-2 and TiRex on the same protocol; compare MASE **and** stratified coverage
- [ ] Sweep context length (Step 7). Did you reproduce context saturation? Did TiRex differ?
- [ ] Add Toto-2.0-22m — smallest and fastest; does parameter count track accuracy?
- [ ] Compare `h = 24` vs `h = 168` calibration. Does the degradation with horizon appear?
- [ ] Fine-tune one model and re-measure the gap
- [ ] Run the decontaminated TiRex checkpoint vs the standard one — quantify the contamination
- [ ] Add an ensemble of the TSFMs; does combination still beat the best member?

## References

1. Ansari, A.F. et al. (2025). Chronos-2. 🔗 https://arxiv.org/abs/2510.15821
2. Ansari, A.F. et al. (2024). Chronos: Learning the Language of Time Series. 🔗 https://arxiv.org/abs/2403.07815
3. Auer, A. et al. (2025). TiRex. *NeurIPS 2025*. 🔗 https://arxiv.org/abs/2505.23719
4. Podest, P. et al. (2026). TiRex-2. 🔗 https://arxiv.org/abs/2607.01204
5. Das, A. et al. (2024). TimesFM. 🔗 https://arxiv.org/abs/2310.10688
6. Khwaja, E. et al. (2026). Toto 2.0. 🔗 https://arxiv.org/abs/2605.20119
7. Fu, X. et al. (2026). Reverso. 🔗 https://arxiv.org/abs/2602.17634
8. Michael, P., Symeonides, M. & Trihinas, D. (2026). TSFM-Eval. 🔗 https://arxiv.org/abs/2609.25788
9. Laglil, M. et al. (2026). Foundation Models and Fine-Tuning. 🔗 https://arxiv.org/abs/2607.23146
10. Dai, Z., Bader, D. & Gysi, A. (2026). Unified Zero-Shot Forecasting: A Darts Foundation. 🔗 https://arxiv.org/abs/2606.27438

## Cross-links

- [[Time Series Foundation Models]]
- [[TimeCopilot]]
- [[Nixtlaverse]]
- [[Generative and Probabilistic Forecasting]]
- [[Model Validation Strategies]]
- [[Practice 01 — Rolling-Origin Harness and Baseline Panel]]
- [[Practice 04 — Conformal Prediction on Hourly Counts]]
- [[168-Point Forecast Comparison - Discrete vs Continuous]]
