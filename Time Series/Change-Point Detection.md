---
type: reference
status: active
topic: "Detecting regime shifts in a series before modelling it — PELT and binary segmentation, Bai-Perron structural break tests, Chow and Quandt, CUSUM, Bayesian online detection, and Prophet's L1 changepoint prior."
created: 2026-10-15
tags:
  - time-series
  - forecasting
  - change-point-detection
  - structural-breaks
  - interventions
  - ruptures
aliases:
  - Change Point Detection
  - Structural Breaks
  - Regime Change
  - PELT
  - Changepoint Detection
---

# Change-Point Detection

Where does a series change regime? Not "what does the trend look like" — **where exactly did the
process stop generating data the way it used to, and how confident are we about the location?**

> Written 2026-10-15. The vault previously had only two passing mentions — Prophet's prior in
> [[Time Series Decomposition]] §6 and one library's binary segmentation in [[ThymeBoost]] §2.3 —
> and the hub listed *"no treatment of `ruptures`, PELT, or Bai–Perron tests"* as a gap.

---

## 1. Why this must run *before* you model

A structural break is not a modelling preference. It is a **contamination of the training data.**

For the 168-point study the consequences are concrete and severe:

1. **A mid-sample level shift means roughly half of the 168 per-hour models are fit on one regime
   and evaluated on another.** Whether that inflates the discrete arm's or the continuous arm's
   apparent accuracy depends only on where the break falls — and that is not a result, it is an
   artefact.
2. **A variance break can precede a mean break**, and on hourly call volume it may be the *earlier*
   signal of a system change. The data-processing system changed; the mean has not moved yet.
3. **A break invalidates the training window for all 169 arms simultaneously.** It is not a
   per-model problem you can handle after the fact.
4. **Prophet's "flexible trend" will absorb the break** — and in a PSAP series the regime change
   *is* the signal you want to forecast. See [[Time Series Decomposition]] §6.

> **The operational version of the same point.** A changepoint detector tells you **when to stop
> trusting a model trained on 2022 data**. That is the precondition for the ACI online-calibration
> argument in [[Practice 04]] — adaptive conformal widens its intervals as errors appear, but it
> cannot adapt to a regime it does not know has arrived.

---

## 2. The two families, and which one you need

| | **Segmentation** | **Tests / hypothesis** |
|---|---|---|
| Question | *Where* are the breaks? | *Are there* breaks? |
| Output | Change locations | Test statistic + p-value |
| Multiple breaks | Yes, by construction | Yes, via sequential/sup-Wald procedures |
| Needs a penalty | **Yes** | No (critical values instead) |
| Retrospective? | Usually offline | Both |
| Tools | `ruptures`, Prophet, ThymeBoost | Bai-Perron, Chow, Quandt |

**For a retrospective multi-year study you want segmentation** (offline, exact, multi-break,
penalty-selected). The tests are what you use when you suspect one known break and want a p-value.

---

## 3. Offline segmentation

### 3.1 PELT — the default

**Killick, Fearnhead & Eckley (2012)**, *JASA* 107(500), 1590–1598 (🔗
[arXiv:1101.1438](https://arxiv.org/abs/1101.1438)).

> **⚠️ A citation correction worth making.** This paper is in **JASA**, not *Biometrika*, and the
> title is *"...with a **linear computational cost**"* — not "with cost penalisation". Several
> secondary sources, and one widely-copied reference list, get both wrong. Use
> `10.1080/01621459.2012.737745`.

PELT solves

$$\hat\tau = \arg\min_{\tau} \sum_{k=1}^{|\tau|+1} C(y_{t_{k-1}+1:t_k}) + \beta\,|\tau|$$

over all possible segmentations $\tau$, and does it in **linear time** via a pruning argument that
discards segments which can never be optimal. That linear cost is why it is usable on multi-year
hourly data — $O(n)$ segments in $O(n)$ time.

| Symbol | Meaning | Tuning |
|---|---|---|
| $C(\cdot)$ | Cost of a segment | L2, L1, AR, rank, normal |
| $\beta$ | **Penalty per break** | The one real hyperparameter — larger = fewer breaks |
| $|\tau|$ | Number of breaks | Output |

### 3.2 Binary segmentation

The greedy, recursive predecessor (Bai 1997; see `ruptures` docs). Split at the single best point,
recurse on both halves. $O(n \log n)$ rather than $O(n)$, and it can **miss** breaks that a
global search would find.

> **Binary segmentation is exactly what [[ThymeBoost]] §2.3 implements** — one split per boosting
> round, accumulating across rounds. Its README attributes the resulting "underfitting between
> changepoints" to this design. That is the correct diagnosis: greedy per-round splitting is not
> the same as globally optimal segmentation.

### 3.3 `ruptures` — the tool

**v1.1.10**, BSD-2, Truong, Oudre & Vayatis. Docs: 🔗 https://centre-borelli.github.io/ruptures-docs/
· Repo: 🔗 https://github.com/deepcharles/ruptures

> **Cite the library as:** Truong, C., Oudre, L. & Vayatis, N. (2020). Selective review of offline
> change point detection methods. *Signal Processing* 167, 107299. 🔗
> https://doi.org/10.1016/j.sigpro.2019.107299

| Class | Method | Cost | Notes |
|---|---|---|---|
| `rpt.Pelt` | PELT (Killick 2012) | $O(CKn)$ avg | **The default.** Penalised |
| `rpt.Binseg` | Binary segmentation | $O(Cn\log n)$ | Greedy |
| `rpt.Dynp` | Dynamic programming | $O(CKn^2)$ | Exact; **must give `n_bkps` up front** |
| `rpt.KernelCPD` | Kernel CPD | — | RKHS; `model="rbf"` |
| `rpt.BottomUp` | Bottom-up | $O(n\log n)$ | Coarse-to-fine |
| `rpt.Window` | Window sliding | $O(nw)$ | |
| `rpt.L1Potts` | Penalised L1 Potts (Storath 2017) | $O(KN)$ | **New; 1-D only.** 20–30× faster than `Pelt(model="l1")`, robust to outliers |

Cost functions: `"l1"`, `"l2"`, `"linear"`, `"clinear"`, `"rbf"`, `"normal"`, `"ar"`, `"ml"`,
`"rank"`, `"cosine"`.

```python
import ruptures as rpt

# Hourly PSAP call counts, multi-year
algo = rpt.Pelt(model="l1", min_size=24 * 7, jump=5).fit(y)   # min 1 week; jump subsamples grid
bkps = algo.predict(pen=50.0)                                  # returns [0, b1, b2, ..., n]
```

`min_size` sets the shortest plausible segment in **hours** — `24*7` says "I am not interested in
anything shorter than a week." `jump` subsamples the candidate grid, which is the main cost lever
on long series.

> **⚠️ There is no Poisson or negative-binomial cost function in `ruptures`.** Options: run PELT on
> `log1p(y)` with `model="l1"` or `"normal"`, or subclass `CostCustom` (the library documents
> `docs/custom-cost-function.md`). This matters for your data — see
> [[Count Distributions and Kolassa Evaluation]] for why Gaussian-on-counts is the wrong model.

> **⚠️ `RupturesSearch` does not exist.** If you find it referenced, it is an invention.

### 3.4 Choosing the penalty

$\beta$ is a bias–variance dial. There is no universally correct value.

| Approach | How |
|---|---|
| Fixed grid | Try 3–4 values of `pen`, look at the resulting segmentation, **report the sensitivity** |
| Cross-validation | Score held-out segments; a defensible default |
| BIC-style | $\beta \propto \sigma^2 \log n$ for L2 cost |
| Leave it to the reader | Run a grid, plot all segmentations, state the range |

> **Do not report a single segmentation with no sensitivity analysis.** With $\beta$ unexamined you
> have produced one number from a continuum and you do not know which. See
> [[Model Validation Strategies]] §1 on the same principle applied to evaluation.

> **A consistency caveat worth knowing.** Zheng, Eckley & Fearnhead (2022) show that penalised
> changepoint estimators need the penalty to satisfy a *local region condition* to be consistent.
> In practice: if your penalty is badly scaled to the data, the estimator will find breaks that are
> not there. Another reason to run a grid rather than trust one value.

---

## 4. Hypothesis tests for structural breaks

| Test | Citation | Breaks | Notes |
|---|---|---|---|
| **Quandt likelihood ratio (sup-Wald)** | Quandt (1958), *JASA* 53(284), 873–880 🔗 [10.1080/01621459.1958.10501484](https://doi.org/10.1080/01621459.1958.10501484) | Unknown, single | The original break test. Unknown-break-date maximum |
| **Chow** | Chow (1960), *Econometrica* 28(3), 591–605 🔗 [10.2307/1910133](https://doi.org/10.2307/1910133) | **Exactly one, known** | The special case. Not usable when you don't know where |
| **Bai–Perron multiple-break** | Bai & Perron (1998), *Econometrica* 66(1), 47–79 🔗 [10.2307/2998540](https://doi.org/10.2307/2998540) | Multiple | The canonical sup-Wald/CUSUM-of-squares test |
| Bai & Perron (2002) | *J. Applied Econometrics* 18(1), 1–22 🔗 [10.1002/jae.659](https://doi.org/10.1002/jae.659) | Multiple | Computation and analysis |
| Bai (2003) critical values | *Econometrics Journal* 6(1), 72–78 🔗 [10.1111/1368-423X.00102](https://doi.org/10.1111/1368-423X.00102) | — | The critical-value tables |
| Bai (1997) | *Econometric Theory* 13(3), 315–352 | Sequential | The basis for binary segmentation |

> **⚠️ Two citation corrections.** (1) Chow (1960)'s title is *"Tests of Equality Between Sets of
> Coefficients in **Two Linear Regressions**"* — not "a test for structural change in some
> parameters", which is the common mis-citation. (2) Bai (1997) in *Econometric Theory* is
> **"Estimating multiple breaks one at a time"**; the frequently-cited "Estimating a change point
> in the mean of a long-run variance" (supposedly *Journal of Econometrics*) could not be verified
> and should not be cited.

### Why variance breaks are the interesting case here

Hourly call-count dispersion scales with the mean, so a process change shows up in the **variance
and autocorrelation structure** before it moves the mean. Bai–Perron's CUSUM-of-squares statistics
target exactly this. **On 9-1-1 data a variance or autocorrelation break is plausibly the earliest
detectable signature of an NG911 migration or CAD vendor change** — which makes it a better early
warning than waiting for the mean to move.

---

## 5. Online and Bayesian detection

### 5.1 CUSUM

**Page, E.S. (1954). "Continuous Inspection Schemes." *Biometrika* 41(1/2), 100–115. 🔗
[10.1093/biomet/41.1-2.100](https://doi.org/10.1093/biomet/41.1-2.100)**

> **⚠️ Two corrections:** the paper is in **Biometrika, not Technometrics**, and the author is
> **Ewan S. Page**, not Edward Page. The CUSUM statistic is the running sum of standardised
> residuals; it alarms when the sum exceeds a threshold $h$, which is chosen to give a fixed
> **average run length between false alarms** — a false-alarm-rate parameterisation, not a
> p-value.

### 5.2 Bayesian online changepoint detection

**Adams & MacKay (2007).** 🔗 [arXiv:0710.3742](https://arxiv.org/abs/0710.3742) — preprint, never
published in a journal. R: `ocp` 0.1.1 on CRAN.

Maintains a posterior over **run length** (time since the last change). Elegant, but:

| | Adams–MacKay | PELT |
|---|---|---|
| Mode | **Online** — as data arrives | **Offline** — retrospective |
| Assumption | Constant mean/variance within segments | Only your cost function |
| Breaks found | One at a time, sequentially | Globally optimal given $\beta$ |
| Right for a multi-year retrospective study? | **No** | **Yes** |

Use Adams–MacKay when the break must be detected *as it happens* — which, per
[[Forecasting MLOps]], is a production question, not a research one.

### 5.3 Prophet's L1 prior — the soft version

**Taylor & Letham (2018)**, verified in the `facebook/prophet` source:

- `n_changepoints` default **25**, placed uniformly in the first **80%** of the series
  (`changepoint_range = 0.8`)
- `changepoint_prior_scale` default **0.05** — ↑ more flexible, ↓ less
- Stan model: `real<lower=0> tau;` and `delta ~ double_exponential(0, tau);`

> **The prior is a Laplace (double-exponential) on the slope adjustments `delta` — an L1 penalty,
> which is a soft version of a spike-and-slab, not a hard spike-and-slab.** Worth stating
> precisely because the "spike-and-slab" description is common and wrong. Effectively: many
> candidate changepoints, most shrunk to zero.

Prophet's advantage is that the changepoint machinery is **fused with a forecasting model**.
Its weakness for your purpose is the one named in §1: with a large enough
`changepoint_prior_scale` the flexible trend will eat the regime you are trying to study.

---

## 6. What to do once you find a break

Detection is step one. **Step two — attributing it — is where the vault is currently empty.**

| Goal | Method | Notes |
|---|---|---|
| **Evaluate** whether a change helped | **Interrupted time series / segmented regression** | Control series, pre/post coefficients, autocorrelation-robust SEs |
| **Explain** cross-hour co-movement | Granger causality / impulse response | Tests whether one hour's value informs another's |
| **Incorporate** rather than smooth over it | Known changepoints as dummies; or recency weighting | The modelling response |

> **This is a real gap in the vault and a small one to fill.** The natural follow-on study to the
> 168-point comparison is *"did the system change help?"* — and that needs interrupted time series,
> not a forecast comparison. Right now you have everything needed to *locate* a break
> ([[Time Series Decomposition]] §6, [[ThymeBoost]] §2.3, and this note) and nothing to *evaluate*
> one. Similarly, the study's plan item *"error analysis by hour-of-week segment (traffic-driven vs.
> medical-driven calls)"* has no method attached — impulse response is the natural one.

---

## 7. Assessment

**Strengths**
- **Cheap, fast, and it changes your training window.** The highest value-per-effort item in this
  note.
- PELT is exact and linear-time — usable at multi-year hourly resolution.
- Detects structure a smooth trend will happily absorb.
- The variance-break case is specifically valuable for count data with mean-dependent dispersion.

**Weaknesses and cautions**
- **The penalty is a real hyperparameter with no free answer.** A single reported segmentation is
  not a result.
- **No count-aware cost in the main tool.** `log1p` is a workaround, not a fix.
- **Detection is not attribution.** Finding a break in 2023 tells you nothing about why.
- **Over-detection on noisy low-count series** is the default failure — the L1/Potts cost variants
  exist for a reason.
- Consistency requires the penalty to satisfy a region condition (Zheng et al. 2022), which is not
  something the library checks for you.

---

## 8. Try it

- [ ] Run `Pelt(model="l1", min_size=24*7)` on the Douglas County series **before fitting anything
      else**, with a grid of 4 penalty values. Plot all four segmentations side by side
- [ ] Run the same on `log1p(y)` and on raw `y` — if the break locations move a lot, the detector
      is responding to variance not mean, which is itself informative
- [ ] Run PELT separately on the **hour-of-week profile** (collapse to 168 weekly means and look for
      breaks across weeks). This detects changes in the *seasonal shape*, which total-volume
      analysis will miss
- [ ] Fit Prophet with `changepoint_prior_scale` at 0.001 / 0.05 / 0.5 and watch the trend absorb
      progressively more. This is the clearest demonstration of the §1 warning
- [ ] Run Bai–Perron on squared residuals to test specifically for a **variance** break
- [ ] Cross-check against known PSAP events (NG911 migration, CAD vendor change, policy change). If
      the detector fires where you already know something happened, that validates it on *your*
      data — and if it doesn't, you have learned your detector is too insensitive
- [ ] Test `rpt.L1Potts` against `rpt.Pelt(model="l1")` for speed on the full series

## References

1. Killick, R., Fearnhead, P. & Eckley, I.A. (2012). Optimal detection of changepoints with a
   linear computational cost. *JASA* 107(500), 1590–1598. 🔗
   https://doi.org/10.1080/01621459.2012.737745 · preprint 🔗 https://arxiv.org/abs/1101.1438
2. Truong, C., Oudre, L. & Vayatis, N. (2020). Selective review of offline change point detection
   methods. *Signal Processing* 167, 107299. 🔗 https://doi.org/10.1016/j.sigpro.2019.107299
3. Bai, J. & Perron, P. (1998). Estimating and testing linear models with multiple structural
   changes. *Econometrica* 66(1), 47–79. 🔗 https://doi.org/10.2307/2998540
4. Bai, J. & Perron, P. (2002). Computation and analysis of multiple structural change models.
   *J. Applied Econometrics* 18(1), 1–22. 🔗 https://doi.org/10.1002/jae.659
5. Bai, J. (2003). Critical values for multiple structural change tests. *The Econometrics Journal*
   6(1), 72–78. 🔗 https://doi.org/10.1111/1368-423X.00102
6. Quandt, R.E. (1958). The estimation of the parameters of a linear regression system obeying two
   separate regimes. *JASA* 53(284), 873–880. 🔗
   https://doi.org/10.1080/01621459.1958.10501484
7. Chow, G.C. (1960). Tests of equality between sets of coefficients in two linear regressions.
   *Econometrica* 28(3), 591–605. 🔗 https://doi.org/10.2307/1910133
8. Page, E.S. (1954). Continuous inspection schemes. *Biometrika* 41(1/2), 100–115. 🔗
   https://doi.org/10.1093/biomet/41.1-2.100
9. Adams, R.P. & MacKay, D.J.C. (2007). Bayesian online changepoint detection. 🔗
   https://arxiv.org/abs/0710.3742
10. Taylor, S.J. & Letham, B. (2018). Forecasting at scale. *The American Statistician* 72(1),
    37–45. 🔗 https://doi.org/10.1080/00031305.2017.1380080
11. Zheng, C., Eckley, I.A. & Fearnhead, P. (2022). Consistency of a range of penalised cost
    approaches for detecting multiple changepoints. *Electronic Journal of Statistics* 16(2),
    4497–4546. 🔗 https://doi.org/10.1214/22-EJS2048 · preprint 🔗
    https://arxiv.org/abs/1911.01716

## Cross-links

- [[Time Series Decomposition]] §6 — Prophet's prior; §8 on absorbing real signal
- [[ThymeBoost]] §2.3 — binary segmentation as boosting, and the continuity constraint
- [[Model Validation Strategies]] §1 — the same "don't report one setting unexamined" principle
- [[Count Distributions and Kolassa Evaluation]] — why Gaussian cost on counts is wrong
- [[Forecasting MLOps]] — online detection as a production trigger
- [[Hierarchical and Mixed-Effects Models for Forecasting]] — a joint model absorbs breaks instead of
  splitting
- [[time-series-forecasting-models]] §1 — structural/state space as the model-side alternative
