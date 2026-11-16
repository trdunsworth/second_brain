---
type: reference
status: active
created: 2026-11-16
tags:
  - statistical tests
  - analysis
  - call data
  - incidents
  - time series
  - week over week
  - month over month
---

# Statistical Tests and Comparative Analyses for Dispatch Data

This note compiles a comprehensive set of statistical tests, metrics, and comparative methods that can be applied to the **hourly call counts** and **incident** CSV files in *Reporting Engine*. The goal is to support the four target audiences described in *AGENTS.md* and to enable quick, reproducible experimentation in Python, R, and Julia.

## 1. Descriptive Statistics

| Metric | R | Python | Julia |
|---|---|---|---|
| Mean, median, mode | `summary()`, `median()` | `DataFrame.describe()`, `np.median()` | `describe(df)`, `median(df)` |
| Standard deviation, variance | `sd()`, `var()` | `DataFrame.std()`, `DataFrame.var()` | `std`, `var` |
| Skewness & kurtosis | `moments::skewness`, `moments::kurtosis` | `scipy.stats.skew`, `scipy.stats.kurtosis` | `StatsBase.skewness`, `StatsBase.kurtosis` |
| Range, IQR | `IQR()` | `np.percentile` or `DataFrame.quantile()` | `quantile(df, [0.25, 0.75])` |

*Visualization:* box plots, violin plots, and histograms to detect outliers and distribution shape.

## 2. Time‑Series Diagnostics

| Test | Purpose | R | Python | Julia |
|---|---|---|---|---|
| Augmented Dickey–Fuller (ADF) | Test for unit root (stationarity) | `urca::ur.df()` | `statsmodels.tsa.stattools.adfuller` | `TimeSeriesAnalysis.jl: adf()` |
| KPSS | Test for stationarity benchmarked against trend‑stationary null | `kpss.test()` | `statsmodels.tsa.stattools.kpss` | `TimeSeriesAnalysis.jl: kpss()` |
| Ljung‑Box | Test for residual autocorrelation | `Box.test()` | `statsmodels.stats.diagnostic.acorr_ljungbox` | `TimeSeriesAnalysis.jl: ljung_box()` |
| Seasonal Decomposition (STL) | Extract trend, seasonality, remainder | `stats::stl()` | `statsmodels.tsa.seasonal.STL` | `TimeSeriesAnalysis.jl: STL()` |

## 3. Comparative Analysis: Week‑over‑Week (WoW)

| Comparison | Test / Method | Use Cases |
|---|---|---|
| Paired t‑test (or Wilcoxon signed‐rank) on weekly aggregates | Detect mean change between consecutive weeks | Shift‑level staffing evaluation |
| McNemar’s test on binary outcomes (e.g., call answered within 10 s: yes/no) | Evaluate change in proportions | QA for response time improvements |
| Poisson rate ratio (or negative binomial regression) on count data | Compare incident rates week‑to‑week | Detect surge or decline in emergency activity |
| Repeated measures ANOVA / Linear Mixed‑Effects model | Account for correlation across weeks | Operational performance over time |
| Change‑point detection (e.g., Bayesian online change point) | Identify abrupt changes in trend or seasonality | Trigger alerts for management |

## 4. Comparative Analysis: Month‑over‑Month (MoM)

| Comparison | Test / Method | Use Cases |
|---|---|---|
| Paired t‑test / Wilcoxon on monthly aggregates | Long‑term trend comparison | Executive dashboards |
| Seasonal Coefficient Test via Dummy Variables | Test if seasonal patterns differ month‑to‑month | Forecast model validation |
| Seasonal ARIMA (SARIMA) with period‑to‑period comparison | Compare model fit across months | Data‑driven policy impact analysis |
| Cross‑correlation function between call counts and incident metrics | Identify lagged lead/lag relationships | Real‑time alert design |

## 5. General Hypothesis Testing & Modeling

| Category | Test / Model | What to Assess |
|---|---|---|
| **Distributional checks** | Shapiro‑Wilk, Kolmogorov‑Smirnov | Verify normality for parametric tests |
| **Outlier detection** | Box‑plot fences, MAD, robust z‑score | Flag anomalous events |
| **Correlation** | Pearson, Spearman, Kendall | Measure association between continuous variables (e.g., mean duration vs. priority) |
| **Group comparisons** | One‑way ANOVA, Kruskal‑Wallis | Compare mean call counts across agencies or shift groups |
| **Regression** | Linear regression, Generalized Linear Models (Poisson / NB) | Estimate the effect of covariates (e.g., shift, day‑of‑week) on call volume or incident duration |
| **Time‑series forecasting** | ARIMA, Prophet, Exponential Smoothing, AutoGluon‑TS | Short‑term forecasting for staffing planning |
| **Classification** | Logistic regression, RandomForest, XGBoost | Predict binary outcomes (e.g., whether the first unit arrives within 5 min) |
| **Fairness checks** | Chi‑square test for independence between demographic (e.g., agency) and response times | Ensure equitable treatment across groups |

## 6. Recommended Libraries (Python/R/Julia)

| Language | Package / Module | Key Functionality |
|---|---|---|
| **Python** | `pandas`, `numpy`, `scipy`, `statsmodels`, `lifelines`, `statsforecast`, `prophet`, `pmdarima`, `autogluon-timeseries` | Data manipulation, statistical tests, survival analysis, forecasting, AutoML |
| **R** | `tidyverse`, `stats`, `forecast`, `tseries`, `nlme`, `car`, `MASS`, `lme4`, `survival`, `caret` | Comprehensive statistical modeling and diagnostics |
| **Julia** | `DataFrames`, `Statistics`, `HypothesisTests`, `StatsBase`, `TimeSeriesAnalysis`, `TSVectors`, `GLM`, `MixedModels`, `JuliaStats` | High‑performance data analysis and modeling |

## 7. Quick‑Start Code Snippets (Python only, version 3.12)

```python
import pandas as pd
from statsmodels.tsa.stattools import adfuller

# Load hourly call counts
calls = pd.read_csv(r"../Reporting Engine/ABQ_2026_APR_JUL_hourly_call_counts.csv")
# Aggregate weekly total calls
calls['date'] = pd.to_datetime(calls['hour_start'])
weekly = calls.groupby(calls['date'].dt.isocalendar().week)[["nine_one_one_calls_received", "non_emergency_calls_received"]].sum()

# Paired t-test between adjacent weeks
from scipy.stats import ttest_rel
week1, week2 = weekly.iloc[:-1][['nine_one_one_calls_received']], weekly.iloc[1:][['nine_one_one_calls_received']]
print(ttest_rel(week1.squeeze(), week2.squeeze()))
```

> The snippet can be adapted to R or Julia by swapping in the corresponding functions.

---