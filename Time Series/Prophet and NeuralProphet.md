---
type: reference
status: active
topic: "Prophet as a system — the additive model, its miscalibrated uncertainty, and the two orthogonal repairs: prophet-laplace's calibrated densities and NeuralProphet's PyTorch successor."
created: 2026-10-20
tags:
  - time-series
  - forecasting
  - prophet
  - uncertainty
  - deep-learning
  - python
aliases:
  - Prophet
  - Facebook Prophet
  - fbprophet
  - prophet-laplace
  - SandwichedProphet
  - NeuralProphet
---

# Prophet and NeuralProphet

Prophet is referenced across a dozen notes in this folder — decomposition, change points,
counts, model taxonomies — but had no note of its own. This one covers the model as a system
(Taylor & Letham's *Forecasting at Scale*), the uncertainty problem that dominates every
practical use of it, and the two independent repairs now available.

> **The framing: two repairs for orthogonal weaknesses.** Prophet cannot *see* local context
> and cannot be extended past its Stan backend — **NeuralProphet** rebuilds the design in
> PyTorch. Prophet cannot *say* honest probabilities — **prophet-laplace** repairs the density
> around it without touching the model. One changes the structure; the other changes what the
> output means. Neither is a replacement for the other.

> **Scope.** The decomposition treatment lives in [[Time Series Decomposition]] §6, the L1
> changepoint prior in [[Change-Point Detection]] §5.3 — this note does not repeat them.
> Sources: the PeerJ paper and the Triebe et al. paper (both PDFs in the `TSLibraries`
> collection), both GitHub READMEs, and neuralprophet.com — read 2026-10-20.

---

## 1. The model

**Taylor, S.J. & Letham, B. (2018). "Forecasting at Scale." *PeerJ Computer Science* 143.**
Facebook (Meta). Built for analysts who are not time series specialists: capacity planning,
goal setting, anomaly detection — configurable models with the analyst in the loop.

$$y(t) = g(t) + s(t) + h(t) + \epsilon(t)$$

| Term | What it is | Main knobs |
|---|---|---|
| $g(t)$ | Piecewise **linear or logistic** trend over changepoints | `changepoint_prior_scale` (L1 on slope changes), `n_changepoints`, `growth` |
| $s(t)$ | Fourier seasonality, period and order **supplied** | `yearly/weekly/daily_seasonality`, `seasonality_mode` |
| $h(t)$ | Holiday / event indicator regressors, per country or custom | `holidays` frame, `holiday_prior_scale` |
| regressors | Extra known-in-advance columns | `add_regressor()` |
| $\epsilon$ | i.i.d. **Gaussian** observation noise | — |

Fitted in **Stan (MAP)** — one optimizer, one series, no native multi-series concept. Where it
earns its reputation is the parts that are *not* the model: holiday calendars for dozens of
countries, regressor plumbing, and output a business person can read component by component
([[resources]] §2.5 — best for business/retail/web-traffic series with holiday effects).

> **Where it sits.** The decomposition-family row in [[time-series-forecasting-models]] §2;
> `Prophet` as an estimator inside [[TimeCopilot]]; a combination component in
> [[Forecast Combination]]; and — see §2 — **not** a count model in
> [[Count Distributions and Kolassa Evaluation]].

---

## 2. The uncertainty problem

The vault's standing finding, stated twice already (models note §2 and Decomposition §6):

> **Prophet's uncertainty bands are the thing to watch.** They come from simulated residual
> trends, which assume future trend variance is proportional to historical trend variance. On
> a series with an event-driven spike, that assumption is badly wrong.

Mechanically: the bands are **simulated trend paths under the MAP fit**, not posterior
predictive draws. On PSAP-style data — event-driven, spiky, everything the vault models — the
proportionality assumption is false by construction.

Two remedies have existed; they are *not* interchangeable:

| Remedy | What it gives you | What it does not |
|---|---|---|
| **Conformal wrap** ([[Model Validation Strategies]] §6, [[Conformal Prediction]]) | Distribution-free marginal coverage; a guarantee | No density — no `logpdf`, no PIT, no proper scoring rule, no likelihood combination |
| **prophet-laplace** (§3, added 2026-10-20) | A full predictive density, PIT-testable, tail-aware | No coverage *guarantee*; young code; still not a count model |

If all you consume is an interval, conformal stays the default. If you score, combine, or
compute value-at-risk levels from the forecast, an interval is not enough — you need the
density, and that is exactly the gap §3 closes.

---

## 3. prophet-laplace: the density repair

**github.com/microprediction/prophet-laplace** — MIT, v0, 5★ / 12 commits (research-grade,
read 2026-10-20). Tagline: *"Prophet in a laplace sandwich: the same Prophet API, with
calibrated predictive densities."* Live demo: 🔗 https://prophet.microprediction.org/demo.html

### 3.1 The mechanism

`SandwichedProphet` fits Prophet in the **z-coordinates** of the `skaters` `laplace`
forecaster and maps every forecast back through the exact inverse:

```
z_t = Phi^{-1}( F_t(y_t) )          # Rosenblatt transform, F_t = laplace's predictive CDF
```

- Prophet keeps its calendar decomposition, holidays and extra regressors — kwargs pass
  straight through (`seasonality_mode`, `add_regressor`, …).
- Under calibration the z-stream is ≈ i.i.d. standard normal, so **Prophet is handed a
  stationarised, unit-scale series** — a normal-score transform doing the stationarising that
  [[Forecasting Non-Stationary Data]] argues for, as a side effect of the construction.
- Mapping back uses exact change of variables, no approximation:

```
log f_Y(y) = log f_Z(z) + log f_t(y) - log phi(z)
```

- `predict` returns Prophet's usual frame; the band defaults to `interval_width=0.6827` — the
  **central 68.27% band of the sandwiched predictive**, reflecting the volatility clock and
  tails rather than Prophet's Gaussian assumption.

### 3.2 The measured gap

921 non-price FRED series, **pre-registered protocol** (statements filed before results,
frozen universe, harness committed in the `skaters` repo), one-step log-likelihood vs
`laplace` alone:

| | median (921 series) | family-weighted (120 families) |
|---|---|---|
| Prophet raw | −0.755 nats | −4.60 nats |
| Prophet sandwiched | **−0.020 nats** | **−0.025 nats** |

> **The sandwich closes 97% of Prophet's density gap without retraining anything.** The
> residual ~0.02 nats is the epsilon: conditional structure neither model captures. On FRED-30
> with rolling refits, Prophet's calendar machinery adds a *small positive* epsilon over
> laplace alone — so on calendar-driven series the sandwich can exceed laplace by itself.

### 3.3 What you actually get: the predictive object

`predictive(step, z_mu, z_sigma)` returns a y-space distribution with three methods:

| Method | Vault use |
|---|---|
| `logpdf(y)` | Proper log score — [[Model Validation Strategies]] §6.2 scoring rules |
| `cdf(y)` | **PIT value**; uniform under calibration — exactly what §6.3 coverage testing asks for |
| `quantile(p)` | Tail / value-at-risk levels that account for skew and tails |

### 3.4 Caveats

- **v0 demonstrates interoperability.** It maps *future frames only*; `predict` raises unless
  the frame is strictly after training; horizons past `k` reuse the k-step transport — a
  **disclosed approximation**.
- 12 commits, 5★: a construction *demonstrated*, not a battle-tested dependency. The repo's own
  aim is to "propose it as an option upstream".
- It repairs calibration, **not distributional family** — the observation model is still
  Gaussian-in-z, and the y-space shape comes from laplace's transport, not a count-aware
  likelihood. For PSAP counts, [[Count Distributions and Kolassa Evaluation]] still applies.
- The README opens by quoting the classic critique of Prophet ("He's not the messiah…") — the
  package's premise is that the *model* is fine and the *density* was the problem.

---

## 4. NeuralProphet: the PyTorch successor

**Triebe, O., Hewamalage, H., Pilyugina, P., Laptev, N., Bergmeir, C. & Rajagopal, R. (2021).
"NeuralProphet: Explainable Forecasting at Scale." arXiv:2111.15397** —
🔗 10.48550/arXiv.2111.15397. Stanford / Monash / Skoltech / Facebook affiliations. The paper
PDF is in the `TSLibraries` collection (40 pp — filed as `Nueralprophet.pdf`, filename typo).
Docs: 🔗 https://neuralprophet.com · Repo: 🔗 github.com/ourownstory/neural_prophet (MIT,
4.3k★ / 517 forks).

The paper's stated motivation: Prophet **lacks local context** (essential for near-term
forecasting) and is **hard to extend because of its Stan backend**. NeuralProphet keeps
Prophet's design philosophy and components, but trains with standard deep learning methods —
inspired by Prophet and by [AR-Net](https://github.com/ourownstory/AR-Net) for the
autoregressive part.

### 4.1 What changes

| | Prophet | NeuralProphet |
|---|---|---|
| Backend | Stan (MAP, single series) | **PyTorch**, SGD — developers can extend it |
| Trend | Piecewise linear/logistic + changepoints | Same, changepoint detection retained |
| Seasonality | Fourier terms | Fourier (yearly, weekly, daily, hourly) |
| **Local context** | **None** — trend + season only | **Autoregression**: linear regression or NN (AR-Net) |
| Covariates | Future regressors only | **Lagged regressors** (e.g. sensor) *and* future regressors, each linear or NN |
| Events | Country holidays + custom events | Same |
| Multi-series | No | **Global / 'glocal'** models — shared or regularised-local parameters |
| Uncertainty | Simulated trend bands | **Quantile regression** |
| Fit target | Interpretable components | Interpretable components, human-in-the-loop iteration |

Framework extras (README): cross-validation utility, model checkpointing/validation,
regularisation of individual components, component/coefficient plotting, `make_future_dataframe`.

### 4.2 The paper's claims

- Interpretable components of **equivalent or superior quality** to Prophet on generated series.
- Outperforms Prophet on a diverse collection of real-world datasets.
- **55–92% accuracy improvement for short-to-medium-term forecasts.**

> **Read the claim with its denominator.** The 55–92% is *vs Prophet specifically*, from a
> 2021 preprint — not vs the modern field, and not on any benchmark this vault would cite as
> primary evidence ([[Benchmarks and Datasets]] §6's standard). It is a reason to put
> NeuralProphet in the panel, not a reason to believe it wins.

### 4.3 Practical status (README, 2026-10-20)

- **Still beta.** Explicitly: *"may not be the most accurate model out-of-the-box — adjust and
  iterate until you like your results."* Designed for iterative, human-in-the-loop building.
- **Sweet spot**: sub-daily (high-frequency) series of longer duration — *at least two full
  periods/years*. That describes hourly PSAP data with ≥2 years of history exactly.
- Docs page "may not be entirely up to date" — **docstrings are the reliable source**.
- Windows users: use **WSL2**. Install: `pip install neuralprophet`.

---

## 5. Choosing between them

| | Prophet | Prophet + prophet-laplace | NeuralProphet |
|---|---|---|---|
| **Fixes** | — | Calibration of the density | Local context + extensibility |
| **Uncertainty** | Simulated trend bands, badly calibrated | Full density; `logpdf`/`cdf`/`quantile`; PIT-uniform under calibration | Quantile regression |
| **Local context (lags)** | No | No (inherits Prophet) | **Yes** — AR, linear or NN |
| **Covariates** | Future-only | Future-only | Lagged **and** future |
| **Multi-series** | No | No | Global / glocal |
| **Fit** | Stan MAP | laplace transport + Prophet on z | PyTorch SGD |
| **Maturity** | Battle-tested | v0 research demo (12 commits) | Beta, 4.3k★ |

**Decision rules**

1. Need Prophet-shaped explainability **plus** an honest density (scoring, PIT, tails) →
   sandwich, with conformal still in front of it for guarantees (§2's table).
2. Need lagged covariates, multi-series, or a near-term model that can be extended →
   NeuralProphet, on its stated sweet spot (sub-daily, ≥2 years).
3. Need a count likelihood → neither; both stay Gaussian-family
   ([[Count Distributions and Kolassa Evaluation]]).
4. Need distribution-free coverage and nothing else → conformal alone remains the vault default
   ([[Practice 04 — Conformal Prediction on Hourly Counts]]).

---

## 6. Assessment

**Strengths**
- prophet-laplace is the first *vault-native* answer to the Prophet-interval finding that has
  sat in two notes: it makes the density the deliverable, measurable with the scoring rules
  and PIT checks the vault already prescribes.
- NeuralProphet is the only Prophet-lineage model with lagged covariates and global fitting —
  it covers the two features the decomposition family lacks.
- Both keep the component-wise explainability that puts Prophet in the §2 family table in the
  first place.

**Cautions**
- Both are secondary sources to their own claims: v0 repo with a pre-registered-but-single-lab
  benchmark; beta framework with a 2021 preprint's headline number.
- The sandwich's `k`-step transport reuse is a real approximation for horizons past `k` — the
  vault's 168-hour horizon must set `k` accordingly, not the default `k=1`.
- Nothing here changes the *point* model: trend absorption of real regimes
  ([[Change-Point Detection]] §5.3) and supplied seasonal periods
  ([[Time Series Decomposition]] §4) are untouched by either repair.

---

## Try it

- [ ] Fit `SandwichedProphet(k=168)` on the same hourly split as `Practice 01`, then check PIT
      uniformity from `predictive(...).cdf()` against the conformal intervals of
      `Practice 04` — same series, three interval philosophies
- [ ] Score both with `logpdf` under [[Model Validation Strategies]] §6.2 — does the 97%
      density-gap claim survive on call-volume data rather than FRED?
- [ ] Set `k` to the full horizon (168) and verify the disclosed "past-k reuse" approximation
      is outside your operating range
- [ ] Head-to-head on `Practice 01` origins: Prophet vs NeuralProphet at its stated sweet spot
      (sub-daily, ≥2 years) — reproduce the paper's 55–92% or fail to
- [ ] Three-route interval ablation on one series: simulated trend bands vs NeuralProphet
      quantile regression vs conformal — plot all three against realised coverage
- [ ] Read the sandwich page's full table (🔗 skaters.microprediction.org/sandwich.html) to see
      which other vault models the same construction lifts

## References

1. Taylor, S.J. & Letham, B. (2018). Forecasting at Scale. *PeerJ Computer Science* 143.
   🔗 https://peerj.com/articles/cs-143/ · code: 🔗 https://github.com/facebook/prophet
   *(PDF in `TSLibraries`: `Prophet_paper.pdf`, 25 pp)*
2. Triebe, O., Hewamalage, H., Pilyugina, P., Laptev, N., Bergmeir, C. & Rajagopal, R. (2021).
   NeuralProphet: Explainable Forecasting at Scale. 🔗 https://arxiv.org/abs/2111.15397 ·
   🔗 https://doi.org/10.48550/arXiv.2111.15397 · code: 🔗
   https://github.com/ourownstory/neural_prophet · docs: 🔗 https://neuralprophet.com
   *(PDF in `TSLibraries`: `Nueralprophet.pdf`, 40 pp)*
3. prophet-laplace: Prophet in a laplace sandwich — same API, calibrated densities.
   🔗 https://github.com/microprediction/prophet-laplace (MIT) · demo: 🔗
   https://prophet.microprediction.org/demo.html *(README read 2026-10-20)*
4. skaters — the online forecasting core and the `laplace` forecaster; the sandwich
   construction and full results table. 🔗 https://github.com/microprediction/skaters · 🔗
   https://skaters.microprediction.org/sandwich.html

## Cross-links

- [[Time Series Decomposition]] §6 — Prophet's additive structure; §4 on supplied seasonal periods
- [[Change-Point Detection]] §5.3 — the L1 changepoint prior, verified in the Prophet source
- [[time-series-forecasting-models]] — the decomposition-family row and the uncertainty quote §2 opens with
- [[Model Validation Strategies]] §6 — conformal vs density-level repair; §6.2 scoring rules and §6.3 PIT that the sandwich's `predictive` feeds
- [[Conformal Prediction]] — the distribution-free alternative the vault still defaults to
- [[Count Distributions and Kolassa Evaluation]] — why neither repair makes Prophet a count model
- [[Forecasting Non-Stationary Data]] — the Rosenblatt z-transform as stationarisation §3 inherits
- [[Forecasting Libraries and Frameworks]] §2 — NeuralProphet's row in the library landscape
- [[Forecast Combination]] — a repaired density is what combination actually needs
- [[Practice 04 — Conformal Prediction on Hourly Counts]] — the interval baseline to beat
- [[Time Series Reading and Practice Hub]] — the entry point for the folder
