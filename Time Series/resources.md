---
created: 2026-09-22
updated: 2026-09-22
tags:
  - time-series
  - forecasting
  - machine-learning
  - statistics
  - evaluation-metrics
  - foundation-models
  - catboost
  - conformal-prediction
  - books
aliases:
  - Time Series Resources
  - TS Forecasting Resources
---

# Time Series Forecasting Resources

A comprehensive collection of papers, libraries, and resources for time series forecasting methods, models, and evaluation metrics.

---

## 1. Foundation Models & Pre-trained Architectures

### 1.1 TimesFM (Google)
- **Paper**: [A decoder-only foundation model for time-series forecasting](https://arxiv.org/abs/2310.10688) (Das et al., 2024)
- **GitHub**: [google-research/timesfm](https://github.com/google-research/timesfm)
- **Overview**: 200M–330M parameter decoder-only transformer trained on 100B+ time points. Uses input patching and supports zero-shot forecasting. Latest v3.0 adds native multivariate forecasting and covariate support.
- **Best for**: General-purpose univariate/multivariate forecasting, zero-shot deployment, long-context (up to 16k steps in v2.5+).
- **Key features**: Quantile forecasting, fine-tuning via LoRA, MLX backend for Apple Silicon.

### 1.2 TimeGPT (Nixtla)
- **Paper**: [TimeGPT-1](https://arxiv.org/abs/2310.03589) (Garza & Mergenthaler-Canseco, 2023)
- **GitHub**: [Nixtla/nixtla](https://github.com/Nixtla/nixtla)
- **Docs**: [nixtla.io/docs](https://docs.nixtla.io/)
- **Overview**: First foundation model for time series. Trained on 100B+ data points across diverse domains. Available via API; TimeGPT-2/2.1 supports multivariate forecasting.
- **Best for**: Quick zero-shot forecasting, anomaly detection, enterprise deployments.
- **Key features**: Uncertainty quantification, exogenous variables, fine-tuning, long-horizon model variant.

### 1.3 Chronos (Amazon)
- **Paper**: [Chronos: Learning the Language of Time Series](https://arxiv.org/abs/2403.07815) (Ansari et al., 2024)
- **Overview**: Tokenizes time series into discrete buckets and uses T5/GPT-2 architecture for autoregressive generation. Chronos-2 extends to multivariate and covariates.
- **Best for**: Probabilistic forecasting, quantile-based uncertainty, zero-shot generalization.
- **Key features**: Multiple model sizes (Mini, Small, Base, Large), competitive on GIFT-Eval benchmarks.

### 1.4 Lag-Llama
- **Paper**: [Lag-Llama: Towards Foundation Models for Probabilistic Time Series Forecasting](https://arxiv.org/abs/2310.08278) (Rasul et al., 2023)
- **GitHub**: [time-series-foundation-models/lag-llama](https://github.com/time-series-foundation-models/lag-llama)
- **Overview**: Decoder-only transformer based on LLaMA architecture using lags as covariates. First open-source foundation model for time series.
- **Best for**: Univariate probabilistic forecasting, fine-tuning on domain-specific data.
- **Key features**: Strong zero-shot capabilities, open-source weights.

### 1.5 Moirai / Moirai 2.0 (Salesforce)
- **Paper**: [Moirai 2.0: When Less Is More for Time Series Forecasting](https://arxiv.org/abs/2511.11698) (Liu et al., 2025)
- **Overview**: Decoder-only foundation model trained on 36M series. Moirai 2.0 uses quantile forecasting and multi-token prediction.
- **Best for**: Universal forecasting across domains, efficient inference (2x faster, 30x smaller than v1).
- **Key features**: Competitive on Gift-Eval, strong accuracy/speed/size tradeoff.

### 1.6 TimeCopilot
- **Paper**: [TimeCopilot](https://arxiv.org/abs/2509.00616) (Garza & Rosillo, 2025)
- **Docs**: [timecopilot.dev](https://timecopilot.dev)
- **Overview**: First open-source agentic framework combining multiple TSFMs with LLMs through a unified API. Automates feature analysis, model selection, cross-validation, and forecast generation.
- **Best for**: Automated forecasting pipelines, ensemble methods, explainable forecasting.
- **Key features**: LLM-agnostic, supports Chronos/TimesFM/TiRex/Toto ensembles, natural language explanations.

---

## 2. Traditional Statistical Methods

### 2.1 ARIMA / SARIMA
- **Resource**: [Forecasting: Principles and Practice (3rd ed.)](https://otexts.com/fpp3/) — Hyndman & Athanasopoulos
- **Chapter**: [ARIMA models](https://otexts.com/fpp3/arima.html)
- **Overview**: Autoregressive Integrated Moving Average. Models autocorrelations in stationary time series via differencing. SARIMA extends to seasonal patterns.
- **Best for**: Univariate data with trend/seasonality, short-to-medium horizons, interpretable models.
- **When to use**: Stationary or differenced-stationary series, well-understood temporal dependencies.
- **Limitations**: Struggles with nonlinear relationships, requires stationarity assumptions.

### 2.2 Exponential Smoothing (ETS / Holt-Winters)
- **Resource**: [Exponential Smoothing](https://otexts.com/fpp3/expsmooth.html) — FPP3
- **Overview**: State-space models for trend + seasonality. Includes Simple Exponential Smoothing (SES), Holt's linear trend, and Holt-Winters seasonal method.
- **Best for**: Data with clear trend and/or seasonality, fast computation, interpretable decomposition.
- **When to use**: Retail demand, economic indicators, weather data with known seasonal patterns.

### 2.3 Theta Method
- **Overview**: Decomposes series into "theta lines" focusing on curvature and drift. Winner of M3 Competition.
- **Best for**: Simple, robust baseline forecasting, competitive with complex methods.

### 2.4 TBATS
- **Overview**: Trigonometric seasonality, Box-Cox transformation, ARMA errors, Trend, Seasonal. Handles multiple seasonalities.
- **Best for**: Data with complex seasonality (e.g., hourly data with daily + weekly patterns).

### 2.5 Prophet (Meta)
- **Paper**: [Forecasting at Scale](https://peerj.com/articles/cs-143/) (Taylor & Letham, 2018)
- **GitHub**: [facebook/prophet](https://github.com/facebook/prophet)
- **Overview**: Additive regression model: y(t) = g(t) + s(t) + h(t) + ε. Handles trends, multiple seasonalities, holidays, and missing data.
- **Best for**: Business forecasting, retail sales, web traffic, data with holiday effects, non-expert users.
- **When to use**: Multiple seasonalities, known events/holidays, missing data, need for interpretable decomposition.

---

## 3. Deep Learning Architectures

### 3.1 Recurrent Neural Networks (RNNs)

#### LSTM (Long Short-Term Memory)
- **Overview**: RNN variant with gating mechanisms (input, forget, output gates) to handle long-range dependencies and vanishing gradients.
- **Best for**: Sequential data, time series with long-term dependencies, speech, NLP.
- **Limitations**: Slow training, high memory usage for long sequences.

#### GRU (Gated Recurrent Unit)
- **Overview**: Simplified LSTM with update and reset gates. Similar performance, fewer parameters.
- **Best for**: When LSTM is too complex, similar sequence modeling tasks.

#### DA-RNN (Dual-Stage Attention RNN)
- **Paper**: [A Dual-Stage Attention-Based Recurrent Neural Network for Time Series Prediction](https://arxiv.org/abs/1704.02971) (Qin et al., 2017)
- **Overview**: Seq2Seq with input and temporal attention mechanisms.
- **Best for**: Multivariate time series with exogenous variables.

#### DeepAR (Amazon)
- **Overview**: Autoregressive RNN generating probabilistic forecasts. Simultaneously learns from multiple related time series.
- **Best for**: Probabilistic forecasting, retail demand, inventory optimization.

### 3.2 Convolutional Neural Networks (CNNs)

#### Temporal Convolutional Networks (TCN)
- **Overview**: 1D convolutional networks with dilated convolutions for wide receptive fields. Causal (no future information leakage).
- **Best for**: Long sequences, parallelizable training, capturing local temporal patterns.
- **Advantages over RNNs**: Faster training, better gradient flow, fixed-size context.

#### WaveNet
- **Overview**: Dilated causal convolutions originally for speech synthesis. Demonstrated CNN potential for time series.
- **Best for**: High-resolution temporal data, audio, signals.

#### CNN-LSTM Hybrids
- **Overview**: CNN extracts local features; LSTM captures temporal dependencies.
- **Best for**: Spatiotemporal data (e.g., video, weather grids), complex pattern extraction.

### 3.3 Transformers & Attention-Based Models

#### Informer
- **Overview**: ProbSparse attention for O(L log L) complexity. Long-sequence time-series forecasting (LTSF).
- **Best for**: Long horizons (96–720 steps), high-dimensional multivariate data.

#### PatchTST
- **Overview**: Patches time series into subseries (like ViT for images) + channel-independent transformers.
- **Best for**: Long-term forecasting, multivariate data with channel independence.

#### Autoformer
- **Overview**: Autocorrelation mechanism replaces dot-product attention. Series decomposition block.
- **Best for**: Periodicity-dominant time series, long-range forecasting.

#### FEDformer
- **Overview**: Frequency Enhanced Decomposition. Uses frequency domain for attention.
- **Best for**: Data with strong periodic patterns.

### 3.4 State Space Models (SSMs)

#### Mamba
- **Overview**: Selective state space models with input-dependent gating. Linear complexity in sequence length.
- **Best for**: Very long sequences, efficient long-range dependency modeling.
- **Resource**: [Mamba-360: Survey of State Space Models](https://arxiv.org/abs/2403.12973) (Patro & Agneeswaran, 2024)

### 3.5 Graph Neural Networks (GNNs)
- **Overview**: Models spatial-temporal dependencies in graph-structured data (e.g., traffic networks, sensor grids).
- **Best for**: Spatiotemporal forecasting with relational structure.

### 3.6 CatBoost & Gradient Boosting for Time Series

#### CatBoost
- **Paper**: [CatBoost: unbiased boosting with categorical features](https://arxiv.org/abs/1706.09516) (Prokhorenkova et al., 2018)
- **GitHub**: [catboost/catboost](https://github.com/catboost/catboost)
- **Overview**: Gradient boosting on decision trees with ordered boosting to reduce target leakage. Native handling of categorical features without preprocessing. Uses symmetric (oblivious) decision trees for efficient inference.
- **Best for**: Tabular time series with mixed feature types (categorical + numerical), exogenous variables, features from lag engineering.
- **When to use**: Rich feature sets with calendar effects, weather, promotions, or other exogenous signals. Competitive with deep learning on structured data with less tuning.
- **Key applications**:
  - Power load forecasting (SO-CatBoost optimizes hyperparameters via Snake Optimization)
  - Precipitation forecasting (83% variance explained with 24 years of daily data)
  - Temperature forecasting (lowest RMSE of 0.413°C with temporal drift encoding)
  - Financial time series (outperforms TSFMs in zero-shot financial forecasting with Sharpe ratio 6.79)
  - Short-term load forecasting (combined with wavelet transforms and TCN)
- **Compared to other GBDT**: Often outperforms XGBoost and LightGBM on time series tasks due to ordered boosting and native categorical support.

#### XGBoost / LightGBM
- **XGBoost paper**: [XGBoost: A Scalable Tree Boosting System](https://arxiv.org/abs/1603.02754) (Chen & Guestrin, 2016)
- **LightGBM paper**: [LightGBM: A Highly Efficient Gradient Boosting Decision Tree](https://proceedings.neurips.cc/paper/2017/hash/6449f44a102fde848669bdd9eb6b76fa-Abstract.html) (Ke et al., 2017)
- **Overview**: XGBoost uses regularized gradient boosting; LightGBM uses histogram-based splitting and leaf-wise growth for speed.
- **Best for**: Tabular forecasting with engineered features, rapid prototyping, competitions.

### 3.7 Conformal Prediction for Time Series

#### Core Concept
Conformal prediction (CP) wraps any point forecaster to produce prediction intervals with finite-sample coverage guarantees — distribution-free and model-agnostic. The key challenge for time series is relaxing the exchangeability assumption.

#### Key Papers

| Paper | Authors | Year | Contribution |
|-------|---------|------|--------------|
| [Conformal Time-Series Forecasting](https://proceedings.neurips.cc/paper_files/paper/2021/file/312f1ba2a72318edaaa995a67835fad5-Paper.pdf) | Stankevičiūtė et al. | 2021 | Extended inductive CP to multi-horizon RNN forecasting (CF-RNN) |
| [Conformal Prediction for Time Series](https://ieeexplore.ieee.org/document/10121511) | Xu & Xie | 2023 | EnbPI algorithm — ensemble-based, no data-splitting, no retraining |
| [Adaptive Conformal Predictions for Time Series](https://arxiv.org/abs/2202.07282) | Zaffran et al. | 2022 | ACI + AgACI — parameter-free adaptive learning rate for non-exchangeable data |
| [Conformal Multistep-Ahead Multivariate Time-Series Forecasting](https://proceedings.mlr.press/v179/schlembach22a.html) | Schlembach et al. | 2022 | Weighted residual quantiles for multivariate multi-horizon |
| [ConForME: Multi-horizon conditional conformal time series forecasting](https://proceedings.mlr.press/v230/galvao-lopes24a.html) | Galvão Lopes et al. | 2024 | Leverages time dependence for efficient intervals; up to 52% improvement over CF-RNN |
| [Foundation models for time series forecasting: Application in conformal prediction](https://arxiv.org/abs/2507.08858) | Achour et al. | 2025 | TSFMs (TimeGPT, Chronos) provide better conformal intervals than classical methods, especially with limited data |
| [Conformal Prediction Algorithms for Time Series Forecasting](https://arxiv.org/pdf/2601.18509) | — | 2026 | Survey benchmarking methods that relax exchangeability, model dynamics, and adapt to distribution shifts |

#### How It Works (Simplified)
```
1. Train point forecaster on calibration set
2. Compute nonconformity scores (e.g., |actual - predicted|)
3. For new prediction: interval = [pred - q_α, pred + q_α]
   where q_α is the (1-α) quantile of calibration scores
4. Guarantee: P(y ∈ interval) ≥ 1 - α (finite sample)
```

#### When to Use
- **Critical applications** requiring calibrated uncertainty (energy, healthcare, finance)
- **Any point forecaster** that needs uncertainty wrapping
- **Data-limited scenarios** where foundation models + CP outperform classical CP
- **Multi-horizon forecasting** where prediction intervals must be jointly valid

#### Limitations
- Assumes some form of stationarity or adaptation mechanism for non-stationary data
- Intervals can be wide if calibration data is poor
- Coverage is marginal, not conditional (may vary by subgroup)

---

## 4. Model Evaluation Metrics

### 4.1 Botchkarev's Typology Framework
- **Paper**: [Performance Metrics (Error Measures) in Machine Learning Regression, Forecasting and Prognostics: Properties and Typology](https://arxiv.org/abs/1809.03006) (Botchkarev, 2018)
- **Key contribution**: Proposes a 3-dimensional typology:
  1. **Point distance method** (absolute, squared, percentage)
  2. **Normalization method** (none, scale, naive forecast)
  3. **Aggregation method** (mean, median, geometric mean)
- **Categories**: Primary metrics → Extended metrics → Composite metrics → Hybrid metric sets
- **Covers 40+ commonly used metrics** with mathematical definitions.

### 4.2 Sekitani & Murakami's Overall Weighted Average (OWA)
- **Paper**: [Framework for Comparing Accuracy of Time-Series Forecasting Methods](https://arxiv.org/abs/2403.08156) (Sekitani & Murakami, 2024)
- **Overview**: Combines sMAPE and MASE relative to a Naive2 baseline:
  ```
  OWA = ½ × (sMAPE_forecast / sMAPE_naive2 + MASE_forecast / MASE_naive2)
  ```
- **Used in M4 Competition** for ranking methods across 100,000 time series.
- **Best for**: Benchmarking across multiple series, comparing statistical vs ML methods.

### 4.3 Common Point Forecast Metrics

| Metric | Formula | Best For | Limitations |
|--------|---------|----------|-------------|
| **MAE** | Mean of \|actual - predicted\| | Interpretable, outlier-robust | Scale-dependent |
| **MSE** | Mean of (actual - predicted)² | Penalizes large errors heavily | Sensitive to outliers, scale-dependent |
| **RMSE** | √MSE | Same scale as data | Still scale-dependent |
| **MAPE** | Mean of \|error\| / \|actual\| × 100 | Percentage interpretation | Undefined for zeros, asymmetric |
| **sMAPE** | Symmetric MAPE variant | Symmetric error, percentage | Still problematic near zero |
| **MASE** | MAE / naive forecast MAE | Scale-free, cross-series comparison | Undefined for constant series |
| **RMSSE** | RMSE / naive forecast RMSE | Scale-free RMSE variant | Sensitive to outliers |

### 4.4 Probabilistic / Distributional Metrics

| Metric | Description | Best For |
|--------|-------------|----------|
| **CRPS** | Continuous Ranked Probability Score | Full distribution evaluation |
| **Pinball Loss** | Quantile-specific loss | Quantile regression evaluation |
| **WQL** | Weighted Quantile Loss | Multi-quantile probabilistic accuracy |
| **Log Score** | Log-likelihood of observed value | Sharpness and calibration |

### 4.5 Scale-Free & Relative Metrics

| Metric | Description | Best For |
|--------|-------------|----------|
| **MdRAE** | Median Relative Absolute Error | Robust cross-method comparison |
| **GMRAE** | Geometric Mean RAE | Multiplicative error structures |
| **RelMAE** | Relative MAE vs benchmark method | Forecast value added analysis |

### 4.6 Key Evaluation Resources
- **Hyndman & Koehler (2006)**: [Another look at forecast-accuracy metrics](https://robjhyndman.com/papers/foresight.pdf) — Introduced MASE
- **Cerqueira et al. (2020)**: [Evaluating time series forecasting models: an empirical study](https://doi.org/10.1007/s10994-020-05910-7) — Performance estimation methods
- **sktime metrics**: [sktime.performance_metrics](https://www.sktime.net/en/stable/api_reference/performance_metrics.html) — OWA, MASE, and more
- **AutoGluon metrics**: [Forecasting Metrics](https://auto.gluon.ai/1.1.0/tutorials/timeseries/forecasting-metrics.html) — SMAPE, WAPE, MASE, RMSE, CRPS

---

## 5. Surveys & Comprehensive Reviews

| Title | Authors | Year | Link |
|-------|---------|------|------|
| A Comprehensive Survey of Deep Learning for Time Series Forecasting | Kim et al. | 2024 | [arXiv:2411.05793](https://arxiv.org/abs/2411.05793) |
| Deep Learning for Time Series Forecasting: A Survey of Recent Advances | Liao, Xuan & Ma | 2026 | [Springer](https://doi.org/10.1007/s11704-025-50947-3) |
| Time Series Forecasting Methods: A Systematic Review | Emmert-Streib et al. | 2026 | [ACM](https://dl.acm.org/doi/10.1145/3828164) |
| A Survey of Deep Learning for Time Series Forecasting: Theories, Datasets, and State-of-the-Art | Lu et al. | 2025 | [ScienceDirect](https://doi.org/10.32604/cmc.2025.068024) |
| Time Series Analysis and Modeling to Forecast: A Survey | — | 2021 | [arXiv:2104.00164](https://arxiv.org/abs/2104.00164) |
| 25 Years of Time Series Forecasting | Hyndman | 2006 | [PDF](https://robjhyndman.com/papers/25years_forecasting.pdf) |
| Foundation Models for Time Series Analysis: A Tutorial and Survey | Liang et al. | 2024 | Listed in [arXiv:2411.05793](https://arxiv.org/abs/2411.05793) |

---

## 6. Quick Reference: Choosing a Method

### By Data Characteristics

| Data Type | Recommended Methods |
|-----------|-------------------|
| **Univariate, linear trends** | ARIMA, ETS, Holt-Winters |
| **Multiple seasonalities** | TBATS, Prophet, deep learning |
| **High-frequency / very long** | TCN, Mamba, PatchTST |
| **Multivariate with dependencies** | Transformer variants, GNNs, TimesFM v3 |
| **Sparse / intermittent demand** | Croston's method, MASE-based evaluation |
| **Unknown / zero-shot** | Foundation models (TimesFM, Chronos, TimeGPT) |
| **Need uncertainty estimates** | Conformal prediction (EnbPI, ACI), Chronos, DeepAR, TimeGPT |
| **Business with holidays/events** | Prophet, regression with calendar features |
| **Tabular with rich features** | CatBoost, XGBoost, LightGBM with lag/calendar exogenous |
| **Critical applications needing calibrated intervals** | Conformal prediction wrapping any point forecaster |

### By Use Case

| Use Case | Best Candidates |
|----------|----------------|
| **Quick baseline** | Naive, Seasonal Naive, Theta, Prophet |
| **Production at scale** | TimesFM, Chronos, TimeGPT, Nixtla suite |
| **Interpretability critical** | ETS decomposition, Prophet, ARIMA, CatBoost (feature importance) |
| **Maximum accuracy** | TimeCopilot ensemble, TimesFM 3.0, Chronos-2 |
| **Resource constrained** | ARIMA, ETS, lightweight Chronos models |
| **Multivariate forecasting** | TimesFM 3.0, Moirai 2.0, PatchTST |
| **Rich exogenous features** | CatBoost, XGBoost, LightGBM with lag/calendar encoding |
| **Calibrated uncertainty** | Conformal prediction (EnbPI, ACI, ConForME) wrapping any forecaster |

---

## 7. Libraries & Tools

| Library                                                                              | Description                                               | Language |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------- | -------- |
| [statsforecast](https://github.com/Nixtla/statsforecast)                             | Statistical forecasting (ARIMA, ETS, Theta)               | Python   |
| [neuralforecast](https://github.com/Nixtla/neuralforecast)                           | Deep learning forecasting (N-BEATS, PatchTST, etc.)       | Python   |
| [sktime](https://www.sktime.net/)                                                    | Unified ML framework for time series                      | Python   |
| [darts](https://unit8co.github.io/darts/)                                            | Time series forecasting library (stats + ML)              | Python   |
| [pmdarima](https://alkaline-ml.com/pmdarima/)                                        | Auto-ARIMA implementation                                 | Python   |
| [Prophet](https://facebook.github.io/prophet/)                                       | Meta's forecasting tool                                   | Python/R |
| [AutoGluon-TimeSeries](https://auto.gluon.ai/stable/tutorials/timeseries/index.html) | AutoML for time series                                    | Python   |
| [Nixtla](https://www.nixtla.io/)                                                     | TimeGPT API + open-source tools                           | Python   |
| [CatBoost](https://catboost.ai/)                                                     | Gradient boosting with native categorical support         | Python/R |
| [MAPIE](https://github.com/scikit-learn-contrib/MAPIE)                               | Model Agnostic Prediction Interval Estimation (conformal) | Python   |
| [crepes](https://github.com/tommartinsson/crepes)                                    | Conformal prediction via predictive intervals             | Python   |
| [Awesome Time Series](https://github.com/lmmentel/awesome-time-series)               | List of resources                                         | Agnostic |

---

## 8. Benchmarks & Competitions

| Benchmark | Description | Link |
|-----------|-------------|------|
| **M4 Competition** | 100K series, 61 methods | [Makridakis et al., 2020](https://doi.org/10.1016/j.ijforecast.2019.11.001) |
| **M5 Competition** | Walmart sales, hierarchical | [M5 challenge](https://www.kaggle.com/c/m5-forecasting-accuracy) |
| **GIFT-Eval** | General foundation model evaluation | [arXiv:2410.10393](https://arxiv.org/abs/2410.10393) |
| **TIME Benchmark** | Real-world aligned TSFM evaluation | [arXiv:2602.12147](https://arxiv.org/abs/2602.12147) |
| **fev-bench** | Realistic forecasting benchmark | [arXiv:2509.26468](https://arxiv.org/abs/2509.26468) |
| **Monash Time Series Forecasting Archive** | 30+ datasets across domains | [GitHub](https://github.com/rakshitha123/TSForecastingArchive) |

---

## 9. Books & Textbooks

### 9.1 Freely Available Online

| Title | Authors | Year | Link | Focus |
|-------|---------|------|------|-------|
| **Forecasting: Principles and Practice (3rd ed.)** | Hyndman & Athanasopoulos | 2021 | [otexts.com/fpp3](https://otexts.com/fpp3/) | Comprehensive intro to forecasting methods with R (fable). Covers ETS, ARIMA, regression, combinations, accuracy. |
| **Forecasting: Principles and Practice (2nd ed.)** | Hyndman & Athanasopoulos | 2018 | [otexts.com/fpp2](https://otexts.com/fpp2/) | Earlier edition using the forecast package. Same core material, R-focused. |
| **Time Series Analysis: Forecasting and Control (5th ed.)** | Box, Jenkins, Reinsel & Ljung | 2015 | [Internet Archive](https://archive.org/details/timeseriesanalys0000geor) | The "Bible" of time series. ARIMA, transfer functions, intervention analysis, multivariate models. Classical and foundational. |
| **Forecasting and Time Series Books (curated list)** | Hyndman | 2017 | [robjhyndman.com](https://robjhyndman.com/hyndsight/forecasting-and-time-series-books) | Annotated list of 8 recommended books spanning classical stats to modern ML. |

### 9.2 Statistical & Classical Foundations

| Title | Authors | Year | Focus | Notes |
|-------|---------|------|-------|-------|
| **Time Series Analysis: Forecasting and Control (5th ed.)** | Box, Jenkins, Reinsel & Ljung | 2015 | ARIMA, Box-Jenkins methodology, transfer functions, control | The classic reference. Updated with R code in 5th edition. |
| **Introduction to Time Series and Forecasting (3rd ed.)** | Brockwell & Davis | 2016 | ARMA/ARIMA processes, state-space models, spectral analysis, multivariate | [Springer](https://link.springer.com/book/10.1007/978-3-319-29854-2). Textbook for advanced undergrad/grad. Includes ITSM2000 software. |
| **Time-Series Forecasting** | Chatfield | 2001 | ARIMA, state-space, multivariate, model selection, prediction intervals | [Routledge](https://www.routledge.com/Time-Series-Forecasting/Chatfield/p/book/9781584880639). Concise, practical overview from the author of "Analysis of Time Series." |
| **Forecasting Using Exponential Smoothing: The State Space Approach** | Hyndman, Koehler, Ord & Snyder | 2008 | State-space formulation of exponential smoothing, ETS models | [Free PDF](https://robjhyndman.com/forecpapers/books/STATE-SPACE-BOOK.pdf). Rigorous statistical foundation for ETS. |
| **Principles of Forecasting** | Armstrong (ed.) | 2001 | Judgmental forecasting, organizational processes, model selection, combining | [Online](https://forecastingprinciples.com/). Multi-author reference; strong on non-statistical aspects. |
| **Business Forecasting (10th ed.)** | Hanke & Wichern | 2013 | Applied business forecasting, exponential smoothing, ARIMA, regression | Textbook focused on practical business applications. |

### 9.3 Machine Learning & Deep Learning

| Title | Authors | Year | Focus | Notes |
|-------|---------|------|-------|-------|
| **Deep Learning** | Goodfellow, Bengio & Courville | 2016 | Neural networks foundations, CNNs, RNNs, sequence modeling | [deeplearningbook.org](https://www.deeplearningbook.org/) (free). Background for understanding DL forecasting. |
| **Deep Learning for Time Series Forecasting (Jason Brownlee)** | Brownlee | 2018 | Practical DL for time series: LSTM, CNN, encoder-decoder, transformers | [machinelearningmastery.com](https://machinelearningmastery.com/deep-learning-for-time-series-forecasting/). Tutorial-style, Python code. |
| **Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow (3rd ed.)** | Géron | 2022 | End-to-end ML including time series chapters (RNNs, CNNs, Transformers) | O'Reilly. Excellent practical guide with modern tools. |
| **Machine Learning for Time Series Forecasting with Python** | Zafari & Muras | 2020 | Feature engineering, ML models, deep learning, evaluation for time series | Wiley. Practical Python recipes. |

### 9.4 Specialized Topics

#### Multivariate Forecasting
| Title | Authors | Focus |
|-------|---------|-------|
| **Multivariate Time Series Analysis: With R and Financial Applications** | Tsay | VAR, VARMA, cointegration, factor models, state-space |
| **Vector Autoregressive Models** | Kilian & Lütkepohl | Structural VAR, identification, impulse responses |
| **Multivariate Business Forecasting** | Leuthold, Junkus & Cordier | Applied multivariate methods for agricultural/business forecasting |

#### Exogenous Features & Regression
| Title | Authors | Focus |
|-------|---------|-------|
| **Forecasting: Principles and Practice (3rd ed.)** Ch. 7–9 | Hyndman & Athanasopoulos | Dynamic regression, ARIMA with exogenous variables, calendar effects |
| **Regression Analysis of Time Series Data** | Studenmund | Regression with time series, autocorrelation, distributed lag models |
| **Dynamic Linear Models with R** | Petris, Petrone & Campagnoli | Bayesian dynamic regression, state-space with covariates |

#### Prophet & Business Forecasting
| Title | Authors | Focus |
|-------|---------|-------|
| **Forecasting at Scale** (Prophet paper) | Taylor & Letham | Additive decomposition, holidays, changepoints |
| **Practical Time Series Analysis** | Nielsen | [O'Reilly](https://www.oreilly.com/library/view/practical-time-series/9781492041641). End-to-end: data wrangling, features, Prophet, anomaly detection, classification |

#### Model Evaluation & Selection
| Title | Authors | Focus |
|-------|---------|-------|
| **Forecasting: Principles and Practice (3rd ed.)** Ch. 5–6 | Hyndman & Athanasopoulos | Accuracy measures, time series cross-validation |
| **Evaluating time series forecasting models** | Cerqueira et al. (2020) | Performance estimation: CV, holdout, prequential methods |
| **Another Look at Forecast-Accuracy Metrics** | Hyndman & Koehler (2006) | [PDF](https://robjhyndman.com/papers/foresight.pdf). Introduced MASE, critiqued MAPE |

### 9.5 Quick Reference: Which Book to Read First

| Your Background | Recommended Starting Point |
|----------------|---------------------------|
| **Statistician / econometrician** | Box, Jenkins, Reinsel & Ljung (5th ed.) + Hyndman & Athanasopoulos |
| **Data scientist / ML engineer** | Géron (Hands-On ML) → Hyndman & Athanasopoulos (FPP3) |
| **Business analyst** | Nielsen (Practical Time Series) or Hanke & Wichern (Business Forecasting) |
| **Researcher / PhD student** | Brockwell & Davis + Hyndman & Koehler (State Space) |
| **Need multivariate / VAR** | Tsay (Multivariate Time Series Analysis) |
| **Need DL foundations** | Goodfellow et al. (Deep Learning, free online) |
