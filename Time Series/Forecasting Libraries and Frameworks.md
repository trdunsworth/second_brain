---
type: reference
status: active
topic: "The time series forecasting library landscape beyond the Nixtlaverse — general-purpose frameworks, AutoML layers, adjacent toolkits and evaluation frameworks, as represented in the local TSLibraries paper collection."
created: 2026-10-20
tags:
  - time-series
  - forecasting
  - python
  - libraries
  - frameworks
  - automl
  - tooling
aliases:
  - Time Series Libraries
  - Forecasting Libraries
  - TS Libraries
  - Library Landscape
---

# Forecasting Libraries and Frameworks

The vault treated the Nixtlaverse as the ecosystem ([[Nixtlaverse]]), but that is one vendor's
take on a much larger landscape. This note organises **the general-purpose forecasting
libraries and their paper trail**, drawn from the local `Desktop\TSLibraries` collection
(~247 PDFs, reviewed 2026-10-20). It covers the frameworks themselves, the AutoML layers on
top of them, the adjacent toolkits, and the evaluation frameworks — the model papers in that
collection are served by [[time-series-forecasting-models]] and its sisters instead.

> **Scope note.** Every entry below is backed by a paper in the collection; citation details
> were extracted from the PDFs themselves, not recalled. Where a paper's venue was not
> verifiable from the document, the entry says so rather than guessing.

---

## 1. The design axes

Four distinct philosophies, and most libraries pick exactly one:

| Axis | What it standardises | Examples |
|---|---|---|
| **Unified estimator interface** | `fit()`/`predict()` across every model — the scikit-learn pattern | Darts, sktime, Merlion |
| **Probabilistic model toolkit** | Distributional outputs and the components to build models | GluonTS |
| **AutoML / ensembling** | Model *selection* and combination, not any single model | AutoGluon-TimeSeries, auto-sktime |
| **Training-strategy layer** | Which forecasting *strategy* (global, multi-step, exogenous handling) to pair with any model | Tsururu |

[[Nixtlaverse]] §1 names its own position: shared **data contract**, separate engines. Darts
and sktime sit on the estimator-interface axis; AutoGluon sits one level up. **The axes are
not competitors** — Darts' `FoundationModel` wrapper ([[Time Series Foundation Models]] §5)
and sktime's Nixtla adapters ([[Nixtlaverse]] §3) show the frameworks composing in practice.

---

## 2. The general-purpose frameworks

| Library                       | Origin                       | Paper in collection                         | The pitch                                                                                                                                                                             |
| ----------------------------- | ---------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Darts**                     | Unit8 SA                     | Herzen et al., *JMLR* 23 (2022), 1–6        | ARIMA → deep nets behind one `fit()`/`predict()`; multidimensional series, fit on multiple series, ensembling, rich probabilistic support                                             |
| **sktime**                    | Alan Turing Institute et al. | Löning et al., 🔗 arXiv:1909.07872 (2019)   | The original scikit-learn-compatible unified interface; forecasting, classification, regression, clustering                                                                           |
| **GluonTS**                   | Amazon Web Services          | Alexandrov et al. (2022)                    | Deep-learning modelling toolkit: components to *build* probabilistic models, run experiments, evaluate — global-model-first                                                           |
| **Merlion**                   | Salesforce AI Research       | Bhatnagar et al.                            | Unified interface for **forecasting *and* anomaly detection**, plus AutoML, ensembling, and a unique evaluation framework that *simulates live deployment and retraining*             |
| **AutoGluon-TimeSeries**      | AWS                          | Shchur et al.                               | AutoML: point + quantile forecasts "in 3 lines of Python"; ensembles statistical, ML and deep models; strong on 29 benchmark datasets                                                 |
| **Greykite**                  | LinkedIn                     | Hosseini et al.                             | Flagship **Silverkite**: interpretable univariate forecasts with time-varying growth/seasonality, holidays, regressors. Sub-hourly to quarterly, 20+ production use cases at LinkedIn |
| **Orbit**                     | Uber                         | Ng et al.                                   | Bayesian exponential smoothing refined via **Stan and Pyro** — global trend options, multiplicative transforms, prior choice. The state-space/Bayesian corner                         |
| **ForeTiS**                   | TUM Straubing                | Eiglsperger et al., *MLWA* 12 (2023) 100467 | "Comprehensive time series forecasting framework in Python"                                                                                                                           |
| **Tsururu**                   | Sber AI Lab                  | Kostromina et al.                           | The **strategy layer**: flexible combinations of global/multivariate approaches and multi-step-ahead strategies, model-agnostic. 🔗 github.com/sb-ai-lab/tsururu                      |
| **NeuralProphet**             | Stanford/Monash              | Triebe et al.                               | Prophet's successor: neural components + explainability, bridging Prophet's regressor model and deep forecasting ([[Prophet and NeuralProphet]] §4)                                   |
| **DSIPTS**                    | Fondazione Bruno Kessler     | Gobbi et al., *SoftwareX*                   | High-productivity environment for forecasting models                                                                                                                                  |
| **pyFAST / pyWATTS / KnowIt** | various                      | papers in collection                        | Niche frameworks: sparse/multi-source PyTorch modelling; workflow automation (KIT); deep-model interpretation toolkit                                                                 |

> **The two entries that matter most for this vault.** **Merlion** is the only library here
> whose evaluation framework explicitly models *production retraining* — the exact concern of
> [[Forecasting MLOps]]. And **Orbit** is the closest thing to a packaged version of the
> Bayesian structural work in [[State Space Models and Bayesian Structural Time Series]],
> built on Stan the way the `Statistical_Modeling/` material is.

> **Dedup the collection:** `Merlion`/`Merlion2`, `Greykite`/`greykite(1)`,
> `sktime`/`sktime2`, `NHiTS`/`NHITS(1)`/`nhits(2)` and several others are byte-identical or
> near-identical pairs — and the `._*` entries are AppleDouble junk that fail to parse.

---

## 3. The AutoML / model-selection layer

| Paper | What it does |
|---|---|
| **auto-sktime** (Zöller, Lindauer & Huber) | AutoML hyperparameter search specialised for sktime estimators |
| **AutoForecast** (Abdallah et al.) | Fast automatic selection of the best forecasting model |
| **AutoAI-TS** (IBM) | AutoML pipeline for TSF, from the Watson group |
| **AutoXPCR** (Fischer & Saadallah) | Multi-objective model selection — accuracy *plus* interpretability and resource use |
| **Auto-TSF** (Mu et al.) | Proxy-model meta-learning for algorithm selection |
| **Can TSF be Automated?** (Sreedhara & Vanschoren) | Benchmark *and analysis* of automated forecasting — the empirical question, not a system |

> **The honest reading of this layer:** it is the busiest and least-settled corner of the
> collection. [[time-series-forecasting-models]] §9 already argues a hand-built panel plus
> combination beats most automated selection — these papers are the counterargument to
> test that claim against, not replacements for it.

---

## 4. Adjacent toolkit layers

These are not forecasters; they feed the pipeline around them.

| Layer | Libraries in collection | Where they belong in the vault |
|---|---|---|
| **Feature extraction** | **tsflex** (*SoftwareX* 17 (2022) 100971), **TSFEL** (*SoftwareX* 11 (2020) 100456) | [[Feature Engineering for Time Series]] §6 tooling table |
| **Classification / sequence learning** | **pyts** (JMLR 21 (2020)), **seglearn** (JMLR 19 (2018)), **cesium** (SciPy 2016) | Sibling toolkits to `aeon` and `sktime` in [[Time Series Similarity, Clustering and Motif Discovery]] |
| **Partially-observed data** | **PyPOTS** (JMLR 23 (2022), 1–7) — ML on partially-observed time series | [[Time Series EDA and Data Quality]] — the missing-data path |
| **Dynamical systems** | **deeptime** (Hoffmann et al., *Mach. Learn.: Sci. Technol.* 3 (2022) 015009) — Koopman/transfer operators | **Not a forecaster.** Out of scope; recorded here so it is not re-reviewed |
| **Missing-data / EDA plots** | **ggtime** (Huang, O'Hara-Wild, Hyndman & Kay, 2025) — a grammar of temporal graphics, from the FPP3 group | [[Time Series EDA and Data Quality]] references; the R-side answer to `plotly` |

---

## 5. Evaluation and landscape frameworks

| Item | What it is | Vault hook |
|---|---|---|
| **ModelRadar** | Cerqueira, Roque & Soares, *Machine Learning* 114:229 (2025), 🔗 10.1007/s10994-025-06877-z — aspect-based forecast evaluation: score models across **conditions** (stationarity, anomalies, horizon) instead of one average. 24 methods compared; PatchTST best overall *but condition-dependent* | **The direct follow-up to Cerqueira et al. 2020**, which [[Model Validation Strategies]] §2 already cites — and its thesis (averaging masks condition-dependent behaviour) is that note's §6.4 argument in another key |
| **tsMorph** | Santos, de Carvalho & Soares — semi-synthetic time series generation for robust forecasting evaluation | [[Benchmarks and Datasets]] — synthetic generation as contamination's opposite number |
| **A Review of Open Source Software Tools for Time Series Analysis** | Faniband, Ishak & Sait (2022) | The broadest landscape survey in the collection |
| **A Systematic Review of Packages for Time Series Analysis** | Siebert, Groß & Schroth (2021), 🔗 10.3390/engproc2021005022 | Package-focused systematic review |
| **Comparative Analysis of Time Series Forecasting Libraries Across Multiple Sectors** | Master's thesis, BI Norwegian Business School (2024) | Sector-by-sector library comparison — grey literature, treat as such |
| **tslib survey** | Wang, Wu, Dong, Liu, Chen, Long & Wang — "Deep Time Series Models: A Comprehensive Survey and Benchmark" | The survey behind the `tslib` benchmark framework |

> **ModelRadar is the finding worth acting on.** Its result — that a method's aggregate rank
> can invert under specific conditions — is precisely why the hub's fifth finding and
> [[Model Validation Strategies]] §6.4 demand **per-slice** reporting. Adopting ModelRadar's
> aspect vocabulary (stationarity × anomalies × horizon) is a cheap upgrade to the
> `Practice 01` harness reporting.

---

## 6. The R side and the books in the collection

**R material** remains the vault's first open gap (hub → Known gaps). The collection adds:

- **ggtime** — the grammar-of-temporal-graphics preprint above (Hyndman's group), which is
  the R answer to plotting the diagnostics [[Time Series EDA and Data Quality]] describes
- **Hands-On Time Series Analysis with R** (Packt, 9781788629157, 438 pp)

**Books** (for [[resources]] §9):

| Book | ISBN / note |
|---|---|
| Modern Time Series Forecasting with Python — **two editions in the collection**: 9781803246802 and 9781835883181 | The collection's main modern end-to-end text |
| Time Series Analysis with Python Cookbook — 9781801075541 | Recipe-style Python |
| Forecasting Time Series Data with Facebook Prophet — 9781800568532 **and** 9781837630417 | Prophet-focused, two editions |
| Python Feature Engineering Cookbook — 9781835883587 | Pairs with [[Feature Engineering for Time Series]] |
| Time Series Forecasting Using Foundation Models — MEAP (Manning, in-progress, 288 pp) | The first TSFM-focused book; pre-release, cite as MEAP |
| Mastering Modern Time Series Forecasting … | Packt title, 528 pp |

---

## 7. Assessment

**Strengths of this collection**
- The library landscape is genuinely covered — from strategy layers (Tsururu) to AutoML
  (AutoGluon, auto-sktime) to production-retraining evaluation (Merlion, ModelRadar).
- ModelRadar and tsMorph are ready-made upgrades to evaluation practice already in the vault.
- The feature toolkits (tsflex, TSFEL) close the Python-side gap beside `tsfresh`.

**Weaknesses / cautions**
- **Recency and venue vary wildly** — several are preprints, a thesis, and two MEAP-era
  books; nothing here supersedes a peer-reviewed vault entry on its own.
- Considerable duplication (~10 byte-identical pairs) and two unparseable AppleDouble files.
- The collection is **library- and model-heavy, evaluation-light**: only ModelRadar and the
  surveys address the discipline the vault cares most about.

---

## Try it

- [ ] Read the **ModelRadar** paper end to end and map its aspect vocabulary onto the
      `Practice 01` reporting slice — then decide whether "PatchTST wins but conditionally"
      reproduces on hourly PSAP counts
- [ ] Dedupe the folder: remove the ~10 duplicate pairs and `._*` AppleDouble files
- [ ] Decide the harness question: does **AutoGluon-TimeSeries** (3-line, ensembled) beat the
      hand-built baseline panel? That is directly answerable and would settle §3's argument
- [ ] Add **tsflex/TSFEL** to the feature-matrix tooling ablation in
      [[Feature Engineering for Time Series]] §8
- [ ] Skim **Merlion's** simulated-deployment evaluation against [[Forecasting MLOps]] §7's
      shadow-deployment recipe — same idea, independently arrived
- [ ] Inventory `TSLibraries` PDFs against [[resources]] §9 and promote the two *Modern Time
      Series Forecasting with Python* editions to the book table

## References

1. Herzen, J. et al. (2022). Darts: User-Friendly Modern Machine Learning for Time Series.
   *JMLR* 23, 1–6. 🔗 https://unit8co.github.io/darts/
2. Löning, M. et al. (2019). sktime: A Unified Interface for Machine Learning with Time
   Series. 🔗 https://arxiv.org/abs/1909.07872 · 🔗 https://www.sktime.net/
3. Alexandrov, A. et al. (2022). GluonTS: Probabilistic Time Series Models in Python.
   🔗 https://github.com/awslabs/gluonts
4. Bhatnagar, A. et al. (2022). Merlion: A Machine Learning Library for Time Series.
   🔗 https://github.com/salesforce/merlion
5. Shchur, O. et al. AutoGluon–TimeSeries: AutoML for Probabilistic Time Series Forecasting.
   🔗 https://auto.gluon.ai/
6. Hosseini, R. et al. Greykite: Deploying Flexible Forecasting at Scale at LinkedIn.
   🔗 https://github.com/linkedin/greykite
7. Ng, E. et al. Orbit: Probabilistic Forecast with Exponential Smoothing. 🔗
   https://github.com/uber/orbit
8. Eiglsperger, J. et al. (2023). ForeTiS: A comprehensive time series forecasting framework
   in Python. *Machine Learning with Applications* 12, 100467.
9. Kostromina, A. et al. Tsururu: A Python-based Time Series Forecasting Strategies Library.
   🔗 https://github.com/sb-ai-lab/tsururu
10. Triebe, O. et al. NeuralProphet: Explainable Forecasting at Scale. 🔗
    https://github.com/ourownstory/neural_prophet
11. Cerqueira, V., Roque, L. & Soares, C. (2025). Modelradar: aspect-based forecast
    evaluation. *Machine Learning* 114, 229. 🔗 https://doi.org/10.1007/s10994-025-06877-z
    ⭐ the evaluation framework this vault should adopt
12. Du, W. et al. (2022). PyPOTS: A Python Toolkit for Machine Learning on Partially-Observed
    Time Series. *JMLR* 23, 1–7.
13. Van Der Donckt, J. et al. (2022). tsflex: Flexible time series processing & feature
    extraction. *SoftwareX* 17, 100971.
14. Barandas, M. et al. (2020). TSFEL: Time Series Feature Extraction Library.
    *SoftwareX* 11, 100456.
15. Burns, D.M. & Whyne, C.M. (2018). seglearn: A Python Package for Learning Sequences and
    Time Series. *JMLR* 19.
16. Faouzi, J. & Janati, H. (2020). pyts: A Python Package for Time Series Classification.
    *JMLR* 21.
17. Naul, B. et al. (2016). cesium: Open-Source Platform for Time-Series Inference. *SciPy 2016*.
18. Huang, C.A., O'Hara-Wild, M., Hyndman, R.J. & Kay, M. (2025). ggtime: A Grammar of
    Temporal Graphics. 🔗 preprint
19. Faniband, Y.P., Ishak, I. & Sait, S. (2022). A Review of Open Source Software Tools for
    Time Series Analysis. 🔗 preprint
20. Siebert, J., Groß, J. & Schroth, C. (2021). A Systematic Review of Packages for Time
    Series Analysis. *Engineering Proceedings* 5(22). 🔗 https://doi.org/10.3390/engproc2021005022
21. Zöller, M.-A., Lindauer, M. & Huber, M.F. auto-sktime: Automated Time Series Forecasting.
22. Santos, M., de Carvalho, A. & Soares, C. tsMorph: Generating Semi-Synthetic Time Series
    for Robust Forecasting Evaluation.

## Cross-links

- [[Nixtlaverse]] §1 — the data-contract design axis, and how the frameworks here compose with it
- [[time-series-forecasting-models]] — the model families these libraries ship; §9's hand-built-panel argument vs §3's AutoML layer
- [[Model Validation Strategies]] §2 — Cerqueira 2020, whose follow-up is ModelRadar (§5 above)
- [[Forecasting MLOps]] — Merlion's simulated deployment/retraining evaluation, and production cadence
- [[Feature Engineering for Time Series]] §6 — where tsflex and TSFEL land in the tooling table
- [[Time Series Similarity, Clustering and Motif Discovery]] — the sibling toolkits: aeon, sktime, pyts, seglearn, cesium
- [[Time Series EDA and Data Quality]] — PyPOTS for the missing-data path; ggtime for the plots
- [[Benchmarks and Datasets]] — tsMorph's semi-synthetic generation, and the tslib/TFB benchmark frameworks
- [[Time Series Foundation Models]] §5 — Darts `FoundationModel` as the FM integration path
- [[State Space Models and Bayesian Structural Time Series]] — Orbit as the packaged Bayesian structural option
- [[Prophet and NeuralProphet]] — the Prophet ecosystem this survey compresses to one row: prophet-laplace's density repair and NeuralProphet's PyTorch successor
- [[Time Series Reading and Practice Hub]] — the entry point for the folder
