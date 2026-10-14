---
type: practice
status: active
tags:
  - time-series
  - practice
  - deep-learning
  - linear-models
  - normalization
  - revin
created: 2026-10-14
aliases:
  - Practice 02
  - DLinear Practice
  - Linear Models Practice
  - RevIN Practice
---
---

# Practice 02 — Linear Models and the Baseline Question

**Goal:** build DLinear and NLinear from scratch, add instance normalisation, and run the
ablation that tells you how much of the architecture actually matters.

> The claim under test is not "linear beats Transformer." It is:
> **normalisation supplies most of the generalisation, and the backbone supplies relatively
> little.** If you confirm that on your data, your model-selection budget has changed
> permanently.

---

## Setup

```bash
pip install torch numpy pandas matplotlib statsforecast utilsforecast
```

---

## Step 1 — The models

Short enough to read in full. That is part of the point — see
[[Linear Models for Forecasting]] §7.

```python
import torch, torch.nn as nn

class _MovingAvg(nn.Module):
    def __init__(self, kernel_size: int = 25):
        super().__init__()
        self.k = kernel_size
        self.avg = nn.AvgPool1d(kernel_size, stride=1, padding=0)

    def forward(self, x):                       # x: (B, C, L)
        front = x[:, :, :1].repeat(1, 1, (self.k - 1) // 2)
        end = x[:, :, -1:].repeat(1, 1, self.k // 2)
        return self.avg(torch.cat([front, x, end], dim=-1))


class DLinear(nn.Module):
    """Decomposition-Linear. DIRECT multi-step: look-back L -> horizon H."""
    def __init__(self, L, H, channels=1, kernel_size=25):
        super().__init__()
        self.decomp = _MovingAvg(kernel_size)
        self.lin_trend = nn.Linear(L, H)
        self.lin_resid = nn.Linear(L, H)

    def forward(self, x):                       # (B, C, L) -> (B, C, H)
        trend = self.decomp(x)
        return (self.lin_trend(trend) + self.lin_resid(x - trend)).transpose(1, 2)


class NLinear(nn.Module):
    """Subtract the last observed value, forecast the deviation, add it back."""
    def __init__(self, L, H, channels=1):
        super().__init__()
        self.lin = nn.Linear(L, H)

    def forward(self, x):                       # (B, C, L) -> (B, C, H)
        last = x[:, :, -1:].detach()
        return (self.lin(x - last) + last).transpose(1, 2)
```

> **Both are `Direct` by construction.** That is not an implementation detail — it is the
> mechanism behind the LTSF-Linear result. See [[Linear Models for Forecasting]] §2.

---

## Step 2 — Instance normalisation (RevIN)

```python
class RevIN(nn.Module):
    """
    Normalise on the way in, denormalise on the way out.
    mu/sigma are DETACHED — see Distribution Shift and Normalization §3.
    """
    def __init__(self, num_features, eps=1e-5, affine=True):
        super().__init__()
        self.eps, self.affine = eps, affine
        if affine:
            self.affine_weight = nn.Parameter(torch.ones(num_features))
            self.affine_bias   = nn.Parameter(torch.zeros(num_features))

    def forward(self, x, mode):
        if mode == "norm":
            self.mean = x.mean(1, keepdim=True).detach()
            self.stdev = torch.sqrt(x.var(1, unbiased=False, keepdim=True) + self.eps).detach()
            x = (x - self.mean) / self.stdev
            if self.affine:
                x = x * self.affine_weight + self.affine_bias
        elif mode == "denorm":
            if self.affine:
                x = (x - self.affine_bias) / (self.affine_weight + self.eps ** 2)
            x = x * self.stdev + self.mean
        return x


def wrap(backbone, C, affine=True):
    """Wrap any backbone in RevIN."""
    class Wrapped(nn.Module):
        def __init__(self):
            super().__init__()
            self.rev, self.backbone = RevIN(C, affine=affine), backbone

        def forward(self, x):
            return self.rev(self.backbone(self.rev(x, "norm")), "denorm")
    return Wrapped()
```

> ### ⚠️ The leakage check, before you train anything
>
> RevIN computes `μ, σ` from the **look-back window**. If that window extends past the
> forecast origin, you are reading test-set statistics. Assert it:
>
> ```python
> assert X[:, -1].max() <= origin, "look-back crosses the forecast origin — leakage"
> ```
>
> See §6 of [[Distribution Shift and Normalization]].

---

## Step 3 — The ablation grid

This is the experiment. Six configurations, one question each.

```python
class _NoNorm(nn.Module):
    """Explicit identity 'normaliser' so the ablation has identical plumbing."""
    def __init__(self, backbone):
        super().__init__()
        self.backbone = backbone

    def forward(self, x):
        return self.backbone(x)


CONFIGS = {
    "DLinear":                  lambda L, H, C: _NoNorm(DLinear(L, H, C)),
    "NLinear":                  lambda L, H, C: _NoNorm(NLinear(L, H, C)),
    "DLinear+RevIN":            lambda L, H, C: wrap(DLinear(L, H, C), C, True),
    "NLinear+RevIN":            lambda L, H, C: wrap(NLinear(L, H, C), C, True),
    "DLinear+RevIN(no affine)": lambda L, H, C: wrap(DLinear(L, H, C), C, False),
}
```

> To ablate **detaching** `μ, σ`, edit `RevIN.forward` to drop `.detach()` on both lines and
> rebuild. Do it as a separate run — see the exercises.

> **Note what the grid isolates.** `DLinear` vs `DLinear+RevIN` is the normalisation effect.
> `DLinear+RevIN` vs `NLinear+RevIN` is the backbone effect *with* normalisation held
> constant. Comparing `DLinear` to `NLinear` without normalisation is uninformative —
> normalisation dominates both.

---

## Step 4 — Training loop

```python
def make_windows(y, L, H):
    """y: (n,) -> X: (n-L-H+1, 1, L), Y: (n-L-H+1, 1, H). Direct multi-step."""
    X = np.stack([y[i:i+L] for i in range(len(y) - L - H + 1)])[:, None, :]
    Y = np.stack([y[i+L:i+L+H] for i in range(len(y) - L - H + 1)])[:, None, :]
    return torch.tensor(X, dtype=torch.float32), torch.tensor(Y, dtype=torch.float32)


def train(model, X, Y, epochs=200, lr=1e-3, batch=64, seed=0):
    torch.manual_seed(seed)
    opt = torch.optim.Adam(model.parameters(), lr=lr)
    lossf = nn.L1Loss()                       # MASE's numerator; keeps scales comparable
    n = len(X)
    for ep in range(epochs):
        perm = torch.randperm(n)
        for i in range(0, n, batch):
            idx = perm[i:i+batch]
            opt.zero_grad()
            loss = lossf(model(X[idx]), Y[idx])
            loss.backward()
            opt.step()
    return model


@torch.no_grad()
def predict(model, y_recent, L, H):
    x = torch.tensor(y_recent[-L:], dtype=torch.float32).view(1, 1, L)
    return model(x).view(-1).numpy()
```

---

## Step 5 — Evaluate on rolling origin

Reuse the harness from Practice 01 rather than reinventing it.

```python
from statsforecast.models import SeasonalNaive

L = H = 168                      # one week in, one week out

def evaluate_config(name, build, y, h=H, n_windows=6, L=L, m=168):
    rows = []
    for k in range(n_windows):
        cut = len(y) - (n_windows - k) * h
        if cut < L * 3:
            continue
        y_train, y_test = y[:cut], y[cut:cut+h]

        Xtr, Ytr = make_windows(y_train, L, h)
        model = train(build(L, h, 1), Xtr, Ytr)
        pred = predict(model, y_train, L, h)

        denom = np.mean(np.abs(y_train[m:] - y_train[:-m]))
        rows.append({"config": name, "origin": cut,
                     "mase": np.mean(np.abs(y_test - pred)) / denom})
    return pd.DataFrame(rows)
```

---

## Step 6 — Run the ablation

```python
results = pd.concat([
    evaluate_config(name, build, y) for name, build in CONFIGS.items()
])

summary = results.groupby("config")["mase"].agg(["mean", "std"]).sort_values("mean")
print(summary.round(4))
```

### The three comparisons that matter

```python
s = summary["mean"]

# Q1: does normalisation help at all?
print("\nQ1  RevIN lift")
for base in ["DLinear", "NLinear"]:
    n = f"{base}+RevIN"
    print(f"  {base:>9}: {s[base]:.4f}  ->  {n}: {s[n]:.4f}"
          f"   ({(s[base]-s[n])/s[base]*100:+.1f}%)")

# Q2: does the backbone matter ONCE normalised?
print("\nQ2  DLinear vs NLinear, both normalised")
print(f"  difference: {abs(s['DLinear+RevIN'] - s['NLinear+RevIN'])/s['DLinear+RevIN']*100:.2f}%")

# Q3: does the affine layer matter?
print("\nQ3  affine on/off")
print(f"  difference: {abs(s['DLinear+RevIN'] - s['DLinear+RevIN(no affine)'])/s['DLinear+RevIN']*100:.2f}%")
```

> ### Expected outcome
>
> **Q1 large, Q2 small, Q3 small.**
>
> That is the result from [[Linear Models for Forecasting]] §4 and
> [[Distribution Shift and Normalization]] §4. If you get that, you have reproduced the
> central finding on your own data, and you can state it in your own write-up.
>
> If Q1 is *small* on your series, your series is more stationary than the literature's
> benchmarks — and Berthelier et al. found instance normalisation **detrimental** on
> already-stationary data. That is a real finding, not a failed reproduction. Report it.

---

## Step 7 — Test the leakage claim empirically

```python
def evaluate_with_leak(name, build, y, h=H, n_windows=6, L=L, m=168, leak=0):
    """leak=0: look-back ends at the origin (correct).
       leak=k: look-back extends k periods past the origin (invalid)."""
    rows = []
    for kn in range(n_windows):
        cut = len(y) - (n_windows - kn) * h
        if cut < L * 3:
            continue
        y_train = y[:cut + leak]          # <-- the deliberate flaw
        y_test = y[cut:cut + h]

        Xtr, Ytr = make_windows(y_train[:cut], L, h)
        model = train(build(L, h, 1), Xtr, Ytr)
        x = torch.tensor(y_train[-L:], dtype=torch.float32).view(1, 1, L)   # reaches past origin
        pred = model(x).view(-1).numpy()

        denom = np.mean(np.abs(y[:cut][m:] - y[:cut][:-m]))
        rows.append({"mase": np.mean(np.abs(y_test - pred)) / denom})
    return np.mean([r["mase"] for r in rows])

clean = evaluate_with_leak("DLinear+RevIN", CONFIGS["DLinear+RevIN"], y, leak=0)
dirty = evaluate_with_leak("DLinear+RevIN", CONFIGS["DLinear+RevIN"], y, leak=24)
print(f"correct look-back : {clean:.4f}")
print(f"leaked  (24 past) : {dirty:.4f}   -> {(dirty-clean)/clean*100:+.1f}%")
```

> **Run this.** Leaking 24 periods of the future into the look-back should make the model look
> *better*, which is exactly the point: you can construct a model that looks better by
> cheating, and the only defence is that you looked. See §6 of
> [[Distribution Shift and Normalization]] and §5 of [[Model Validation Strategies]].

---

## Step 8 — Compare to your baseline panel

```python
import pickle
with open("../practice01_results.pkl", "rb") as f:
    p1 = pickle.load(f)

lin = results.groupby("config")["mase"].mean()
base = p1.groupby("model")["mase"].mean()
comparison = pd.concat([lin, base], axis=0).sort_values()
print(comparison.round(4))
```

> **The question:** does your trend-capable linear model beat seasonal naive `m=168` and the
> hour-of-week mean? If it does, then the §8 baseline panel of
> [[Time Series Forecasting Baselines]] was too weak — because a seasonal-only benchmark
> cannot represent trend, so anything with trend looks good against it by construction.

---

## Exercises

- [ ] Run all five configs, three seeds each; report mean ± std
- [ ] Remove the two `.detach()` calls from `RevIN.forward` and re-run. Berthelier et al.
      found backprop-through-the-normalisation is the one component that *is* load-bearing —
      what happens when you remove it?
- [ ] Sweep `kernel_size` of the moving average (5, 13, 25, 51) — does Q2 grow with kernel?
- [ ] Set `L = 24` vs `L = 168`. Does the RevIN lift shrink with a shorter look-back? That is
      the noise-vs-signal question in [[Distribution Shift and Normalization]] §4
- [ ] Add N-HiTS from `neuralforecast` to the comparison
- [ ] Add PatchTST. If it does not clearly beat `DLinear+RevIN`, say so
- [ ] Re-run Step 7 with `leak = 168` (the full horizon). How large is the self-deception?

## References

1. Zeng, A. et al. (2023). Are Transformers Effective for Time Series Forecasting? *AAAI 2023*. 🔗 https://arxiv.org/abs/2205.13504
2. Kim, T. et al. (2022). Reversible Instance Normalization. *ICLR 2022*. 🔗 https://openreview.net/forum?id=cGDAkQo1C0p
3. Berthelier, G. et al. (2026). On the Role of RevIN. 🔗 https://arxiv.org/abs/2603.11869
4. Fu, F. et al. (2025). Noise or Signal? 🔗 https://arxiv.org/abs/2510.04667
5. Nie, Y. et al. (2023). PatchTST. 🔗 https://arxiv.org/abs/2211.14730
6. Challu, C. et al. (2023). N-HiTS. 🔗 https://arxiv.org/abs/2201.12886

## Cross-links

- [[Linear Models for Forecasting]]
- [[Distribution Shift and Normalization]]
- [[Practice 01 — Rolling-Origin Harness and Baseline Panel]]
- [[Practice 03 — Zero-Shot Foundation Model Bake-Off]]
- [[time-series-forecasting-models]]
- [[Time Series Forecasting Baselines]]
- [[Model Validation Strategies]]
