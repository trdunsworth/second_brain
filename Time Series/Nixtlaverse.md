---
type: reference
status: active
updated: 2026-10-16
topic: "Nixtla's shared-data-contract ecosystem for Python time series forecasting — the seven components in the 2026 paper, plus the two libraries added since, including conformalforecast."
created: 2026-10-14
tags:
  - time-series
  - forecasting
  - python
  - frameworks
  - statsforecast
  - neuralforecast
  - mlforecast
  - conformal-prediction
aliases:
  - Nixtla Ecosystem
  - Nixtlaverse
  - StatsForecast
  - NeuralForecast
  - MLForecast
  - Nixtla
  - ConformalForecast
---
# The Nixtlaverse

An ecosystem of **seven interoperable open-source Python libraries** for time series
forecasting, built around a shared data contract rather than a shared estimator interface.
**Two more have landed since the paper** — see §2.1 — so the live ecosystem is nine.

> **Updated 2026-10-16.** The paper's seven are accurate as of its Table 1. Since then Nixtla
> has shipped **`conformalforecast`** (§2.1, §3) and, per the docs index, **`synforecast`** —
> which this note does not yet cover. The "seven" framing below describes the *paper*; treat the
> ecosystem as having grown.

- **Paper** — Sprangers, O., Mergenthaler Canseco, M., Peixeiro, M. et al. (2026).
  *The Nixtlaverse: An Open-Source Ecosystem for Forecasting.* Accepted, *International
  Journal of Forecasting*. 🔗 [arXiv:2609.39741](https://arxiv.org/abs/2609.39741)
- **Docs** — 🔗 https://nixtlaverse.nixtla.io (machine index: `/llms.txt`)
- **GitHub** — 🔗 https://github.com/Nixtla
- **Ecosystem page** — 🔗 https://www.nixtla.io/ecosystem
- **R client** — `nixtlar`, v1.0.0 on CRAN (2026-06)

---

## 1. The design idea

Most forecasting frameworks pick one of two strategies, and the Nixtlaverse paper argues for
a third:

| Strategy | Problem |
|---|---|
| One estimator interface wrapping all models | Must hide real semantic differences. A neural window-sampler and an ARIMA fitter have nothing in common; the abstraction leaks |
| Separate packages per model family | Forces you to rewrite data prep, schema and evaluation for every package |
| **Shared data contract, separate engines** ← Nixtlaverse | Every library takes the same long panel and emits the same keyed forecast frame; implementations stay specialised |

This is the same design axis Darts and sktime sit on, taken differently: the ecosystem
standardises **data and output**, not **estimators**.

---

## 2. The seven components

| Component | Role | Version* | Licence |
|---|---|---|---|
| **StatsForecast** | Local statistical/econometric models — AutoARIMA, ETS, CES, Theta, MSTL, Croston family. Compiled, parallel/distributed over series | 2.0.3 | Apache-2.0 |
| **MLForecast** | Turns any scikit-learn-compatible regressor into a forecaster — feature construction, recursive or direct multi-step | 1.0.31 | Apache-2.0 |
| **NeuralForecast** | Global neural architectures — N-HiTS, N-BEATS, PatchTST, MLP, RNN, Transformers — with point and probabilistic losses | 3.2.0 | Apache-2.0 |
| **HierarchicalForecast** | Reconciliation as a post-processing step over any engine's forecasts | 1.3.1 | Apache-2.0 |
| **UtilsForecast** | Evaluation, preprocessing (`fill_gaps`), plotting. The shared validation layer | 0.2.16 | Apache-2.0 |
| **CoreForecast** | Compiled grouped numerical operations the three engines build on | 0.0.18 | Apache-2.0 |
| **DatasetsForecast** | Benchmark dataset loaders (M5, Monash, …) | 1.0.0 | MIT |

\* Versions recorded July 2026 from the paper's Table 1.

### 2.1 Added since the paper

| Library | Role | Version* | Licence |
|---|---|---|---|
| **ConformalForecast** | Conformal prediction intervals over any of the three engines, or a plain callable. Seven methods, four online/adaptive. **§3** | 0.1.0 | Apache-2.0 |
| **SynForecast** | Synthetic time-series generation, injection, and augmentation. 32 generators. **§4** | alpha | Apache-2.0 |

\* Verified 2026-10-16 from PyPI. Both post-date the paper's Table 1.

Separately: **TimeGPT**, Nixtla's hosted foundation model — 🔗
[arXiv:2310.03589](https://arxiv.org/abs/2310.03589).

> ### ⚠️ The ecosystem is nine, not seven — and both additions are pre-1.0
>
> The docs index (`/llms.txt`) lists **nine** libraries; the paper's Table 1 has seven. The two
> newcomers are **both alpha**, and `ConformalForecast` is two days old (released 2026-10-14,
> 6 stars, 0 forks).
>
> This matters for how much weight the ecosystem carries. The seven paper components have years
> of production use behind them. These two do not. The shared data contract underneath is the
> proven part; the new libraries are untested consumers of it.
>
> Neither replaces anything already here. `SynForecast` fills a genuine gap (§4);
> `ConformalForecast` is a convenience over MAPIE on the Nixtla path (§3). Neither should be
> load-bearing in a study yet.

---

## 3. ConformalForecast

**Released 2026-10-14 — two days old at time of writing. Alpha.** It wraps any point forecaster
into one that emits calibrated intervals, and it ships the full method ladder rather than one
method. 🔗 [GitHub](https://github.com/Nixtla/conformalforecast) · 🔗
[Docs](https://nixtlaverse.nixtla.io/conformalforecast/) · 🔗
[PyPI](https://pypi.org/project/conformalforecast/)

```bash
pip install conformalforecast              # core: numpy, narwhals, pydantic, scipy
pip install "conformalforecast[nixtla]"     # + statsforecast, mlforecast, neuralforecast, utilsforecast
pip install "conformalforecast[spci]"       # + quantile-forest, for SPCI
```

### The seven methods

| Class | Method | Handles | Online | Reference |
|---|---|---|---|---|
| Static | `SplitConformal` | the exchangeable baseline | – | Papadopoulos et al. 2002 |
| Static | `ConformalizedQuantileRegression` | heteroscedastic errors, via quantile forecasts | – | Romano et al. 2019 |
| Static | `WeightedSplit` | covariate shift and transfer | – | Tibshirani et al. 2019 |
| **Online** | `AdaptiveConformalInference` | distribution shift, by adapting `alpha` | ✅ | Gibbs & Candès 2021 |
| **Online** | `AggregatedAdaptiveConformalInference` | shift without picking a learning rate | ✅ | Zaffran et al. 2022 |
| **Online** | `NonexchangeableConformalPrediction` | shift, by down-weighting stale residuals | ✅ | Barber et al. 2023 |
| **Online** | `SequentialPredictiveConformalInference` | **conditional** coverage, via a quantile regressor | ✅ | Xu & Xie 2023 |

> Note the reference attributions match this vault's corrected citations exactly — ACI is
> **Gibbs & Candès 2021**, not Romano/Patterson/Candès. Independent confirmation of the
> repairs in [[Conformal Prediction]] §"Citation errors".
>
> And note **`SPCI` is in the list.** Of the seven methods, it is the only one targeting
> conditional coverage — which is the H4 crux in [[Staffing_Forecasting_Experiment]]. The
> escalation ladder's answer is now `pip install`-able.

### Adapters and the two surfaces

Adapters are the uniform boundary: they convert long-format frames to arrays so the calibration
math never sees a DataFrame. Four ship — `StatsForecastAdapter`, `MLForecastAdapter`,
`NeuralForecastAdapter`, `CallableAdapter`.

```python
from conformalforecast import AdaptiveConformalInference
from conformalforecast.adapters import StatsForecastAdapter

forecaster = StatsForecastAdapter(sf=sf, train_df=df, horizon=168,
                                  freq="h", model_name="AutoETS")

method  = AdaptiveConformalInference(alpha=0.1, gamma=0.01)   # 90% intervals
fitted  = method.calibrate_cv(forecaster, n_windows=30, refit=True)
result  = fitted.predict(panel)

result.point       # (n_series, 1, horizon)
result.interval    # (n_series, 1, horizon, 2)  -- (lower, upper)

fitted.update(result.point, truth)   # online methods advance in place
```

Two entry points, and which one you call depends on who owns your CV loop:

| Surface | Calls | For |
|---|---|---|
| **Array** | `method.fit` → `fitted.interval` → `fitted.update` | Libraries that already own CV/predict orchestration — statsforecast, mlforecast, neuralforecast |
| **Forecaster** | `method.calibrate` / `calibrate_cv` → `fitted.predict` | Standalone users; CV dispatch goes through the adapter |

`calibrate_cv` runs the forecaster's **own** cross-validation and calibrates on the resulting
errors — which is convenient, and is precisely the thing that makes a calibration set easy to
contaminate. See §7.

### Why it matters here

> **This is the Nixtla-native answer to the whole conformal problem in this vault.** It replaces
> MAPIE (used in [[Practice 04 — Conformal Prediction on Hourly Counts]]) with something that
> speaks the same long-panel contract as your forecaster and returns intervals in the same keyed
> frame `evaluate()` already consumes. One `pivot` at the boundary instead of a bespoke adapter
> per engine.
>
> Concretely: the 168-point study's conformal arm can wrap AutoETS, LGBMRegressor and NHITS in
> the same loop, with `SPCI` available for the conditional-coverage arm. That is the
> [[Staffing_Forecasting_Experiment]] §3 escalation ladder, implemented.

### ⚠️ Cautions

- **Alpha. APIs unstable until v0.2.0, no deprecation cycle.** Do not build anything you cannot
  afford to rewrite.
- **Two days old, 6 stars, 16 commits, zero forks.** Unproven. The other six libraries have
  years of production use behind them.
- **Not the same as the paper's components.** It is a *consumer* of the data contract rather
  than an engine, which is why it belongs alongside rather than inside the seven.
- **It partly consolidates what was already scattered.** StatsForecast, MLForecast and
  NeuralForecast each already ship their own conformal tutorials and intervals
  (`mlforecast/conformal_prediction`, `neuralforecast/tutorials/conformal_prediction`,
  `statsforecast/docs/tutorials/conformalprediction`, plus a Conformal Seasonal Pool model).
  There is a compatibility shim for registering these methods into MLForecast's interval
  registry — the overlap is real and worth checking before you commit to one path.
- **Its own docs state the limit plainly**, which is worth quoting because it is the correct
  framing: *"Conformal coverage is marginal, not conditional… Adaptive methods trade
  finite-sample exactness for robustness to shift, and their guarantees are asymptotic or
  regret-based."* That is §4 of [[Conformal Prediction]], in the maintainers' own words.

---

## 4. SynForecast

**Alpha.** Synthetic time-series generation, injection, and augmentation. 🔗
[GitHub](https://github.com/Nixtla/synforecast) · 🔗
[Docs](https://nixtlaverse.nixtla.io/synforecast/) · 🔗 [Generator
reference](https://github.com/Nixtla/synforecast/blob/main/GENERATORS.md)

```bash
pip install synforecast     # prebuilt wheels carry the Rust extension
```

**32 generators** across five categories, emitting the standard `[unique_id, ds, y]` long
format. Native Rust via PyO3, seed-deterministic, and output through Narwhals to pandas,
Polars, cuDF, Modin or PyArrow.

```python
from synforecast import generate_series

df = generate_series(n_series=100, freq="h", min_length=168*12,
                     max_length=168*12, seed=42)
# -> the same frame StatsForecast / MLForecast / NeuralForecast already take
```

### The generators that matter for this vault

| Generator | Produces | Why it is here |
|---|---|---|
| **`RegimeSwitching`** | Markov regime chain, AR(1) per regime; `generate_with_regimes` returns labels | The drift **ACI/AgACI** exist to handle — and regime labels are known, so coverage under shift is directly testable |
| **`FractionalBrownianMotion`** | fBm / fGn at a chosen Hurst `H`; `estimate_hurst` available | **H > 0.5 is long memory**, which is exactly where **EnbPI's strong-mixing assumption fails**. Turns a hand-wavy caveat in [[Conformal Prediction]] §11 into a test |
| **`HawkesProcess`** | Self-exciting point process, exponential or power-law kernel, branching ratio `n < 1` | **9-1-1 call volume is self-exciting.** An incident generates follow-on calls; a branching ratio is a principled way to model that clustering. Also emits raw event times |
| **`INAR`** | Integer-valued counts | The count distribution in [[Count Distributions and Kolassa Evaluation]] |
| **`IntermittentDemand`** | Zero-inflated / lumpy demand | [[Intermittent and Sparse Demand]] |
| **`PoissonProcess`** | Counts per bin, or the counting process | The naive count baseline |
| **`EnergyLoad`** | Load-shaped series | The gap flagged in [[Time Series Reading and Practice Hub]] — energy/load is the closest structural analogue to hourly 9-1-1 |
| **`SARIMA` / `ETS` / `Seasonal`** | Textbook parametric forms | Sanity-check generators with known parameters |
| **`KernelSynth` / `TSMixup` / `MAR`** | Pretraining corpora | `TSMixup` is already referenced in [[Linear Models for Forecasting]] as a synthetic-corpus lever |

### Injection — the actual point

| Injection | Gives you |
|---|---|
| **Changepoints** | Labelled structural breaks. [[Change-Point Detection]] names no evaluation strategy without this |
| **Anomalies** | Labelled anomalies. Answers the "synthetic injection" route in [[Time Series Anomaly Detection]] §3 by name |
| **Missingness** | Known gap patterns — MCAR / MAR / MARF, block gaps |
| **Exogenous** | Covariates with known influence, so you can test whether a model *uses* them |

### Augmentation and composition

`SynAugment` fits a generator to observed series and adds synthetic siblings: fit-and-simulate,
TSMixup, moving-block bootstrap (`mbb`), DTW barycenters (`dba`). `SynSet` composes multiple
generators into one dataset.

> ⚠️ **Fit augmentation parameters on the training split only.** Fitting on validation or test
> observations leaks observed data into model training. The docs say this explicitly, and it is
> the easiest way to invalidate an otherwise clean experiment.
>
> `SynAugment` is also **not an anonymisation or DP tool** — its output deliberately resembles
> the input it was fitted to. Keep it away from the SynthCCD public-safety data.

### Why it matters here

> **This is the instrument several vault notes are missing.**
>
> The recurring blocker across the Time Series notes is the same one: **you cannot evaluate a
> detector, a coverage guarantee, or a changepoint algorithm without labels, and real data has
> none you trust.** `Time Series Anomaly Detection` §3 says so outright. `Change-Point
> Detection` names no evaluation strategy at all. `Conformal Prediction` §11 lists peak
> coverage on real call-volume data as untested.
>
> SynForecast does not dissolve the problem — synthetic structure only rewards methods that
> match the generator's assumptions, which is precisely the circularity the *"when does
> synthetic data help"* guide exists to confront. Credit to Nixtla: that guide publishes
> **negative** results alongside positive ones, which is rarer than it should be.
>
> But it makes the alternative concrete. *Known* peak structure, *known* regime boundaries,
> *known* anomaly positions. That converts an untestable question into a falsifiable one — and
> it is the only practical way to learn whether SPCI actually fixes conditional coverage
> **before** betting the study on it.

---

## 5. The data contract

Everything hinges on two things.

### Input — the long panel

Minimum three columns:

```
unique_id | ds        | y
```

plus any optional static or time-varying covariates. This is the **same shape** across all
seven libraries. It supports unequal history lengths and partitions cleanly into pandas,
polars, Spark or Dask.

> **⚠️ The contract's deliberate limitation:** a general dataframe *cannot* infer whether a
> covariate is available beyond the forecast origin. Each engine requires you to **declare**
> static vs future covariates explicitly. The paper treats this as a feature — assumptions
> are made explicit rather than silently inferred — but it is a real source of bugs, and a
> misdeclared future covariate is a silent leakage vector. See
> [[Model Validation Strategies]] §5.

### Output — the keyed forecast frame

A dataframe keyed by `(unique_id, ds)` — plus the forecast **origin** under rolling-origin
evaluation — with one numeric column per model and `h` rows per series and origin.

**Conformance rule:** any external engine that emits this frame is a conforming producer.
That is the whole integration test, and it is what makes cross-family evaluation and
reconciliation possible without the engines knowing about each other.

---

## 6. Why this matters for your work

### Cross-family evaluation is one merge and one `evaluate()` call

The paper's first use case runs SeasonalNaive and AutoETS (StatsForecast), LightGBM
(MLForecast) and NHITS (NeuralForecast) — plus Croston from sktime as a deliberately
foreign engine — through **one rolling-origin evaluation** on M5, and scores them together.

That is precisely the operation the 168-point study needs, and the piece that most
multi-framework comparisons get wrong. Different libraries default to different horizons,
different `step_size`, and different refit behaviour. The shared contract removes that class
of error entirely.

### Scalability is per-family by design

| Engine | How it scales | Bottleneck |
|---|---|---|
| StatsForecast | Partitions independent series fits; compiled routines; Spark/Dask/Ray via Fugue | Scales ~linearly in series count |
| MLForecast | Distributes feature construction over the full panel, then needs a distributed estimator | Feature construction usually dominates memory |
| NeuralForecast | Samples and batches temporal windows; accelerator, multi-device, Spark multi-node | Training time nearly **independent** of panel size under a fixed budget |
| HierarchicalForecast | Cross-series matrix operations — not independent | Dense `S × S` matrices blow up |

> **The HierarchicalForecast memory boundary is the practically useful warning.** The paper
> reconciles all 42,840 M5 series using **sparse** reconciliation, because the dense
> implementations exhausted available memory. If your hierarchy is large, you will hit the
> same wall — see [[forecast-reconciliation]].

### Downstream reuse is real, not claimed

The ecosystem is embedded in a lot of other people's code:

- **AutoGluon–TimeSeries** bases AutoARIMA, ETS, CES, Theta, ADIDA, Croston and IMAPA on
  StatsForecast, and uses MLForecast for its tabular models — all in the `best_quality`
  preset
- **Darts** wraps StatsForecast models and interfaces NeuralForecast models
- **sktime** supplies adapters for several StatsForecast and NeuralForecast models
- **fev-bench** converts evaluation data into the Nixtlaverse representation
- **Databricks Many Model Forecasting**, **TDengine TDgpt** (ETS, Theta, CES),
  **Lightwood/MindsDB** (`StatsForecast` is a *required* dependency), **PyCaret**, **KServe**

> Note the chain: PyCaret → sktime adapter → StatsForecast. Second-order reuse through
> someone else's adapter.

---

## 7. Reach (21 August 2026 snapshot)

| Library | GitHub stars | PyPI downloads (30d) | Scholar citations |
|---|---|---|---|
| StatsForecast | 4,876 | 1,942,775 | 135 |
| MLForecast | 1,269 | 505,473 | — |
| NeuralForecast | 4,248 | 285,120 | 146 |
| HierarchicalForecast | 756 | 289,221 | 29 |

> The paper is careful, and so should you be: these are **distribution events, not users**.
> They include CI builds, caches and repeated installs. Read them as evidence of sustained
> maintenance activity, not adoption. The paper makes exactly this caveat.
>
> ConformalForecast has no row here on purpose. It shipped **2026-10-14** with 6 stars, 0 forks
> and 16 commits. Any download figure would be almost entirely CI and transitive pulls. There is
> no adoption signal to report yet, and inventing one would be worse than saying so.

---

## 8. Assessment — strengths

- **Correct abstraction boundary.** Standardising data and outputs rather than estimators is
  the right call; it is the only part of the pipeline that genuinely *should* be shared.
- **Fast.** Compiled numerical routines. StatsForecast is the reason ARIMA and ETS became
  practical on large panels.
- **Composable.** Take only the pieces you need; a stats-only user never installs a deep
  learning stack.
- **Probabilistic throughout.** Quantile forecasts are native, not bolted on.
- **Reconciliation and evaluation are engine-independent** — you can reconcile forecasts from
  a library Nixtla has never heard of.
- **Apache-2.0** across the board.

## 9. Assessment — weaknesses and cautions

- **Manual cross-repo coordination.** Data conventions, frequency handling, defaults and
  output schemas are aligned by hand across seven repositories. Cross-library tests only
  cover the combinations they exercise. This is the accepted cost of the design, not a bug,
  but it is a real fragility.
- **`MLForecast` requires feature engineering.** It does not remove the feature burden; it
  automates the mechanical part. For 9-1-1 hourly counts you still choose the lags.
- **No recursive-vs-direct consistency across engines.** The paper explicitly notes the
  forecast horizon is specified *per call* in some engines and *per model* in others. In a
  study comparing direct against recursive approaches — which is exactly what
  [[168-Point Forecast Comparison - Discrete vs Continuous]] is about — this default
  difference will silently confound your comparison unless you pin it.
- **TimeGPT is API-bound.** Separate from the open-source libraries, and the only part of
  Nixtla's offering that is not permissively licensed.
- **Sparse citation practice.** `MLForecast` had no independently indexed software record on
  the snapshot date despite appearing in applied studies.
- **`ConformalForecast` is alpha and two days old.** APIs unstable until v0.2.0 with no
  deprecation cycle. 6 stars, zero forks. Treat as a serious prototype, not infrastructure.
- **The ecosystem is growing faster than its shared contracts are specified.** Two libraries in,
  neither in the paper, and `ConformalForecast` in particular *duplicates* conformal
  functionality the three engines already expose independently. The "manual cross-repo
  coordination" fragility above is being actively amplified by the release cadence.
- **`calibrate_cv` is a calibration-integrity trap.** It calibrates on the forecaster's own
  cross-validation output, which is convenient and makes it easy to calibrate on data you have
  already used for selection. The three-way `train → calibrate → test` discipline in
  [[Model Validation Strategies]] §8 still applies; the API does not enforce it.

---

## 10. Quick start

```python
from datasetsforecast.m5 import M5
from statsforecast import StatsForecast
from statsforecast.models import AutoETS, SeasonalNaive
from mlforecast import MLForecast
from neuralforecast import NeuralForecast
from neuralforecast.models import NHITS
from utilsforecast.evaluation import evaluate
from utilsforecast.losses import mase, rmse

h, season, freq = 168, 168, "h"          # hourly; weekly seasonality

df, *_ = M5.load(directory="data")        # unique_id, ds, y

sf = StatsForecast(freq=freq, models=[AutoETS(season_length=season),
                                      SeasonalNaive(season_length=season)])
mf = MLForecast(freq=freq, models=[LGBMRegressor()],
                lags=[24, 168], date_features=["hour", "dayofweek"])
nf = NeuralForecast(freq=freq, models=[NHITS(h=h, input_size=2*h, max_steps=1000)])

cv_sf = sf.cross_validation(df=df, h=h, step_size=1, n_windows=3, refit=True)
cv_mf = mf.cross_validation(df=df, h=h, step_size=1, n_windows=3, refit=True)
cv_nf = nf.cross_validation(df=df, h=h, step_size=1, n_windows=3, refit=True)

evaluate(pd.concat([cv_sf, cv_mf, cv_nf]), metrics=[mase, rmse], groupby=["unique_id"])
```

> The `season_length=168` and `lags=[24, 168]` choices are deliberate for hourly 9-1-1 data
> and follow §3.1 of [[Time Series Forecasting Baselines]] — `m=168`, not `m=24`.

---

## 11. Try it

- [ ] Run the M5 example end to end; confirm `evaluate()` joins all three frames on
      `(unique_id, ds, cutoff)`
- [ ] Change `season_length` to 24 and re-measure — quantify how much weaker the benchmark is
- [ ] Compare `refit=True` against `refit=False` on one model; this is the "testing refitting
      vs testing the model" distinction from [[Model Validation Strategies]] §2
- [ ] Add a foreign engine (e.g. an sktime model) emitting the same keyed frame — the paper's
      external-engine conformance test
- [ ] Attempt dense reconciliation on a large hierarchy and find the memory wall; then use
      the sparse path
- [ ] Install `conformalforecast[nixtla]`, wrap AutoETS and NHITS, and confirm the returned
      interval frame joins `evaluate()` without reshaping
- [ ] Run `SplitConformal` and `SequentialPredictiveConformalInference` at matched marginal
      coverage; compare **worst hour-of-week stratum**, not just mean width — this is the H4 test
- [ ] Compare `calibrate_cv` against an explicit held-out calibration split; does the
      convenient version inflate coverage?
- [ ] Read `synforecast`'s changepoint / anomaly injection generators — the synthetic control
      the conditional-coverage work needs
- [ ] Generate a `RegimeSwitching` panel with known regime labels; fit `AdaptiveConformalInference`
      and check whether coverage degrades in the transition windows specifically
- [ ] Generate fBm at `H = 0.8` and run `EnbPI` against it — the strong-mixing assumption
      should fail visibly, which is the test [[Conformal Prediction]] §11 says is missing

## References

1. Sprangers, O. et al. (2026). The Nixtlaverse: An Open-Source Ecosystem for Forecasting. *IJF*. 🔗 https://arxiv.org/abs/2609.39741
2. Garza Ramirez, A. et al. (2022). StatsForecast. 🔗 https://github.com/Nixtla/statsforecast
3. Olivares, K.G. et al. (2022). NeuralForecast. 🔗 https://github.com/Nixtla/neuralforecast
4. Olivares, K.G. et al. (2024). Hierarchical forecasting with Nixtla. 🔗 https://nixtlaverse.nixtla.io/hierarchicalforecast/
5. Garza, A., Challú, C. & Mergenthaler Canseco, M. (2023). TimeGPT-1. 🔗 https://arxiv.org/abs/2310.03589
6. Shchur, A. et al. (2023). AutoGluon-TimeSeries. 🔗 https://auto.gluon.ai/stable/tutorials/timeseries/index.html
7. Herzen, J. et al. (2022). Darts. 🔗 https://unit8co.github.io/darts/
8. Löning, J. et al. (2019). sktime. 🔗 https://www.sktime.net/
9. Hyndman, R.J. et al. (2011). Optimal hierarchical forecasts. 🔗 https://robjhyndman.com/publications/hierarchical/
10. Wickramasuriya, S.L., Athanasopoulos, G. & Hyndman, R.J. (2019). Optimal forecast reconciliation. 🔗 https://robjhyndman.com/publications/hierarchical/
11. Peixeiro, M., Caballero Ramirez, S. & Nixtla (2026). *ConformalForecast*: Adaptive conformal prediction for time series forecasting. v0.1.0, Apache-2.0. 🔗 https://github.com/Nixtla/conformalforecast · 🔗 https://pypi.org/project/conformalforecast/
12. Nixtla (2026). *SynForecast*: Synthetic time series generation, injection, and augmentation. Alpha, Apache-2.0. 🔗 https://github.com/Nixtla/synforecast · 🔗 https://pypi.org/project/synforecast/
    Generator reference: 🔗 https://github.com/Nixtla/synforecast/blob/main/GENERATORS.md

> **ConformalForecast's own method attributions**, for cross-checking citations elsewhere:
> Split → Papadopoulos et al. 2002 · CQR → Romano et al. 2019 · Weighted split → Tibshirani
> et al. 2019 · ACI → **Gibbs & Candès 2021** · AgACI → Zaffran et al. 2022 · NexCP → Barber
> et al. 2023 · SPCI → Xu & Xie 2023.

## Cross-links

- [[Conformal Prediction]] — the method ladder and the guarantees these seven implement
- [[Practice 04 — Conformal Prediction on Hourly Counts]] — the MAPIE-based exercise this replaces
- [[TimeCopilot]]
- [[forecast-reconciliation]]
- [[Time Series Foundation Models]]
- [[time-series-forecasting-models]]
- [[Forecasting Libraries and Frameworks]] — the rest of the landscape this note is one corner of: estimator-interface (Darts, sktime, Merlion) and AutoML (AutoGluon) neighbours, and where they sit on the design axes
- [[Practice 01 — Rolling-Origin Harness and Baseline Panel]]
- [[Practice 04 — Conformal Prediction on Hourly Counts]]
- [[resources]]
