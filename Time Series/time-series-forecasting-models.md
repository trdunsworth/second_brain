# Time Series Forecasting Models — Taxonomy

A reference taxonomy of forecasting model families, organized by approach.

## Classical Statistical Models

- **Naive / baseline**: naive, seasonal naive, drift method
- **Exponential smoothing**: SES, Holt's linear trend, Holt-Winters (additive/multiplicative), ETS (error-trend-seasonal state space framework)
- **ARIMA family**: AR, MA, ARMA, ARIMA, SARIMA, SARIMAX (with exogenous regressors), ARIMAX
- **Regression-based**: TBATS (trig regressors, Box-Cox, ARMA errors, trend, seasonal), dynamic regression, harmonic regression
- **State space / structural**: Kalman filter models, unobserved components models (UCM), Bayesian structural time series (BSTS)
- **GARCH family** (volatility modeling): ARCH, GARCH, EGARCH, TGARCH — finance-oriented, relevant for variance/uncertainty modeling

## Decomposition-Based

- Classical decomposition (additive/multiplicative)
- STL (Seasonal-Trend decomposition using Loess)
- X-11 / X-13ARIMA-SEATS (Census Bureau methods)
- Prophet (Meta) — additive model with trend, seasonality, holidays

## Machine Learning Approaches

- Tree-based: gradient boosting (XGBoost, LightGBM, CatBoost) with lagged/rolling features, Random Forest
- Support Vector Regression (SVR)
- Gaussian Processes

## Deep Learning

- **RNN-based**: LSTM, GRU, seq2seq
- **CNN-based**: TCN (Temporal Convolutional Networks), WaveNet-style dilated convolutions
- **Attention/Transformer-based**: Temporal Fusion Transformer (TFT), Informer, Autoformer, FEDformer, PatchTST
- **Hybrid**: DeepAR (probabilistic, autoregressive RNN, Amazon), N-BEATS, N-HiTS

## Foundation / Zero-Shot Forecasting Models

Pretrained on massive, cross-domain time series corpora, then applied to a new series with little or no fine-tuning — analogous to how LLMs generalize across text domains.

- **TimeGPT** (Nixtla) — first commercially available foundation model for forecasting; API-based, zero-shot and fine-tunable
- **Chronos** (Amazon) — tokenizes time series values and trains a language-model-style transformer (T5 architecture) on the tokenized sequences
- **Lag-Llama** — decoder-only transformer, probabilistic, open-source, built for zero-shot univariate forecasting
- **Moirai** (Salesforce) — masked encoder architecture, trained on a large open time series archive (LOTSA); handles multivariate data and arbitrary frequencies
- **TimesFM** (Google) — decoder-only, patched-transformer foundation model
- **MOMENT** — open family of pretrained models for multiple time series tasks (forecasting, classification, imputation, anomaly detection), not just forecasting
- **UniTime / TTM (Tiny Time Mixers, IBM)** — smaller, more efficient entries aimed at edge/low-resource deployment

> Tradeoff: compelling for cold-start series (limited history), but tend to underperform well-tuned SARIMAX or gradient-boosted models once several years of clean historical data are available — the zero-shot advantage shrinks as own-data volume grows.

## Multivariate / Panel Methods

- VAR, VARMA, VARMAX (vector autoregression)
- Dynamic Factor Models
- Panel / hierarchical forecasting (reconciliation methods: bottom-up, top-down, MinT)

## Probabilistic / Ensemble

- Quantile regression forecasting
- Ensemble/combination approaches (simple averaging, stacking, Bayesian Model Averaging)

## Conformal Prediction Methods

Not a forecasting model itself — a distribution-free, model-agnostic wrapper that converts any point forecast into a calibrated prediction interval with finite-sample coverage guarantees. Composes with any model above.

- **Split conformal prediction** — base version; hold out a calibration set, compute nonconformity scores, use their quantile to set interval width
- **CQR (Conformalized Quantile Regression)** — combines conformal calibration with quantile regression forecasts for tighter, better-calibrated intervals
- **EnbPI (Ensemble batch Prediction Intervals)** — designed for time series, avoids the exchangeability assumption plain split conformal violates in sequential data
- **NexCP / Adaptive Conformal Inference (ACI)** — online/adaptive variants that update interval width as new data arrives, correcting for distribution shift over time
- **SPCI (Sequential Predictive Conformal Inference)** — models sequential dependence in nonconformity scores directly; generally the strongest performer for autocorrelated series
- **Jackknife+ and CV+** — conformal variants built on leave-one-out / cross-validation resampling rather than a single split

> Note: standard split-conformal assumes exchangeability, which is often violated by autocorrelated, non-stationary series — EnbPI, ACI, or SPCI are the more defensible choices in that case.
