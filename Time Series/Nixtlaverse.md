---
type: reference
status: active
tags:
  - time-series
  - forecasting
  - python
  - frameworks
  - statsforecast
  - neuralforecast
  - mlforecast
created: 2026-10-14
aliases:
  - Nixtla Ecosystem
  - Nixtlaverse
  - StatsForecast
  - NeuralForecast
  - MLForecast
  - Nixtla
---
# The Nixtlaverse

An ecosystem of **seven interoperable open-source Python libraries** for time series
forecasting, built around a shared data contract rather than a shared estimator interface.

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

Separately: **TimeGPT**, Nixtla's hosted foundation model — 🔗
[arXiv:2310.03589](https://arxiv.org/abs/2310.03589).

---

## 3. The data contract

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

## 4. Why this matters for your work

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

## 5. Reach (21 August 2026 snapshot)

| Library | GitHub stars | PyPI downloads (30d) | Scholar citations |
|---|---|---|---|
| StatsForecast | 4,876 | 1,942,775 | 135 |
| MLForecast | 1,269 | 505,473 | — |
| NeuralForecast | 4,248 | 285,120 | 146 |
| HierarchicalForecast | 756 | 289,221 | 29 |

> The paper is careful, and so should you be: these are **distribution events, not users**.
> They include CI builds, caches and repeated installs. Read them as evidence of sustained
> maintenance activity, not adoption. The paper makes exactly this caveat.

---

## 6. Assessment — strengths

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

## 7. Assessment — weaknesses and cautions

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

---

## 8. Quick start

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

## 9. Try it

- [ ] Run the M5 example end to end; confirm `evaluate()` joins all three frames on
      `(unique_id, ds, cutoff)`
- [ ] Change `season_length` to 24 and re-measure — quantify how much weaker the benchmark is
- [ ] Compare `refit=True` against `refit=False` on one model; this is the "testing refitting
      vs testing the model" distinction from [[Model Validation Strategies]] §2
- [ ] Add a foreign engine (e.g. an sktime model) emitting the same keyed frame — the paper's
      external-engine conformance test
- [ ] Attempt dense reconciliation on a large hierarchy and find the memory wall; then use
      the sparse path

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

## Cross-links

- [[TimeCopilot]]
- [[forecast-reconciliation]]
- [[Time Series Foundation Models]]
- [[time-series-forecasting-models]]
- [[Practice 01 — Rolling-Origin Harness and Baseline Panel]]
- [[Practice 04 — Conformal Prediction on Hourly Counts]]
- [[resources]]
