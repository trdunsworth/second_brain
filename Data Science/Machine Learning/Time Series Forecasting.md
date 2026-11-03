# Time Series Forecasting & Analysis

Time Series is a distinct domain at the intersection of Statistics, ML, and Domain Knowledge. This hub integrates the existing comprehensive notes from the Time Series folder.

## 1. Foundations (Statistics/ML Prerequisites)
- [[Statistics/Time Series Analysis]] — Core concepts: trend, seasonality, stationarity, ACF/PACF
- [[Statistics/Probability Distributions]] — Count distributions (Poisson, NB) for intermittent demand
- [[Statistics/Bayesian Statistics]] — BSTS, CausalImpact, conformal prediction
- [[Statistics/Hypothesis Testing Framework]] — Model validation, DM test, HLN correction

## 2. Core Time Series Methods

### Classical / Statistical
- **ARIMA / SARIMA** — Box-Jenkins, seasonal differencing, auto.arima
- **Exponential Smoothing** — ETS, Holt-Winters, damped trends
- **State Space Models** — UCM, Kalman Filter, [[Time Series/State Space Models and Bayesian Structural Time Series]]
- **Structural Time Series** — BSTS, CausalImpact, intervention analysis
- **Decomposition** — STL, MSTL, Theta, [[Time Series/Time Series Decomposition]]

### Machine Learning (Feature-Based)
- **Feature Engineering** — Lags, rolling windows, calendar, decomposition features, leakage prevention — [[Time Series/Feature Engineering for Time Series]]
- **Linear Models** — DLinear, NLinear, RevIN normalization — [[Time Series/Linear Models for Forecasting]]
- **Gradient Boosting** — Friedman's algorithm, component-based boosting — [[Time Series/Gradient Boosting for Time Series]]
- **Hierarchical/Mixed-Effects** — Partial pooling, random effects — [[Time Series/Hierarchical and Mixed-Effects Models for Forecasting]]

### Deep Learning
- **RNNs/LSTMs** — [[Machine Learning/Neural Networks/RNNs & LSTMs]]
- **Transformers for TS** — Temporal Fusion Transformers, Autoformer, Informer
- **Foundation Models** — Zero-shot TSFMs (Chronos, TimesFM, Moirai, Lag-Llama) — [[Time Series/Time Series Foundation Models]]

### Probabilistic / Generative
- **Quantile Regression** — Pinball loss, conformal prediction — [[Time Series/Generative and Probabilistic Forecasting]]
- **Diffusion / Flow Matching** — TimeGrad, DiffusionTS, Flow Matching for forecasting
- **Count Distributions** — Poisson/NB, randomized PIT, proper scoring — [[Time Series/Count Distributions and Kolassa Evaluation]]

## 3. Specialized Topics

| Topic | Key Note |
|-------|----------|
| **Intermittent Demand** | Croston, Syntetos-Boylan, metric instability — [[Time Series/Intermittent and Sparse Demand]] |
| **Anomaly Detection** | Classical, deep, MOMENT, benchmark contamination — [[Time Series/Time Series Anomaly Detection]] |
| **Change-Point Detection** | PELT, Bai-Perron, CUSUM, Bayesian online — [[Time Series/Change-Point Detection]] |
| **Hierarchical Forecasting** | MinT, reconciliation, coherence — [[Time Series/forecast-reconciliation]] |
| **Similarity/Clustering** | DTW, Matrix Profile, k-Shape — [[Time Series/Time Series Similarity, Clustering and Motif Discovery]] |
| **Explainability** | SHAP, permutation, PDP/ICE/ALE, collinearity trap — [[Time Series/Feature Importance and Explainability]] |

## 4. MLOps for Forecasting
- **Retraining Cadence** — Drift detection, coverage monitoring, shadow deployment — [[Time Series/Forecasting MLOps]]
- **Model Validation** — Rolling origin, leakage prevention, marginal vs conditional coverage — [[Time Series/Model Validation Strategies]]
- **Forecast Combination** — Bates-Granger weights, convex combination beats best member — [[Time Series/Forecast Combination]]
- **Benchmarks** — M1-M5, Monash, GIFT-Eval, contamination awareness — [[Time Series/Benchmarks and Datasets]]

## 5. LLM Integration
- **LLM-as-Forecaster** — Time-LLM, TimeCopilot, Synapse — [[Time Series/LLM-as-Forecaster and Agentic Forecasting]]
- **Agentic Forecasting** — LLM routers over model hubs

## 6. Practice Series (Run in Order)
| # | Notebook | Question Answered |
|---|----------|-------------------|
| 01 | [[Time Series/Practice 01 — Rolling-Origin Harness and Baseline Panel]] | Defensible evaluation harness + baseline panel |
| 02 | [[Time Series/Practice 02 — Linear Models and the Baseline Question]] | Backbone importance with fixed normalization |
| 03 | [[Time Series/Practice 03 — Zero-Shot Foundation Model Bake-Off]] | TSFM vs tuned models + interval calibration |
| 04 | [[Time Series/Practice 04 — Conformal Prediction on Hourly Counts]] | Conditional coverage at peaks |
| 05 | [[Time Series/Practice 05 — Intermittency, Counts and Anomaly Detection]] | Intermittent vs small data, alarm burden |

## 7. Libraries & Frameworks
- **Nixtlaverse** — statsforecast, mlforecast, neuralforecast, tsbenchmark, utilsforecast, datasetsforecast, timegpt — [[Time Series/Nixtlaverse]]
- **Classical** — statsmodels, pmdarima, prophet, neuralprophet
- **ML/DL** — sktime, Darts, GluonTS, Merlion, AutoGluon-TS, Greykite, Orbit
- **AutoML** — ModelRadar, AutoGluon, H2O
- **Evaluation** — Conformal prediction libraries, proper scoring rules

## 8. Key Findings That Change Practice
1. **Zero-shot TSFM advantage is narrower than advertised** — Leaderboards contaminated; linear + RevIN matches complex models
2. **Normalization (RevIN) is the load-bearing component, not architecture**
3. **Combine rather than choose** — Simple average of diverse panel beats best member
4. **Marginal ≠ Conditional calibration** — 90% overall coverage can mean near-zero at peaks
5. **LLM orchestration is genuinely open** — No clean answer if LLM router beats learned router

---
**Cross-references**: [[Research/Time-Series/168-Point Forecast Comparison - Discrete vs Continuous]], [[Staffing_Forecasting_Experiment]], [[Statistical_Modeling/]]