---
title: Time Series Evaluation Metrics, Benchmarks, and Taxonomy
tags:
  - data-science
  - time-series
  - forecasting
  - machine-learning
  - evaluation-metrics
date_created: 2026-09-23
aliases:
  - Forecast Metrics Reference
  - Time Series Evaluation
---

# Time Series Evaluation Metrics, Benchmarks, and Taxonomy

Evaluation metrics and baseline models form the cornerstone of time series forecasting and model validation. Choosing the appropriate metric depends on scale invariance, resilience to zero values, penalty asymmetry, and whether evaluation targets single-point or probabilistic forecasts.

---

## 1. Scale-Dependent Metrics

Scale-dependent metrics express error in the original physical units of the underlying data. 

> [!NOTE] 
> **Key Characteristic:** Scale-dependent metrics are easily interpretable by domain experts but **cannot** be directly compared across time series with different scales or magnitudes.

### Mean Absolute Error (MAE)
Calculates the average absolute magnitude of errors across all time steps.

* **Formula:**
  $$\text{MAE} = \frac{1}{N} \sum_{t=1}^{N} |y_t - \hat{y}_t|$$

* **Properties:**
  * **When to use:** When error penalties scale linearly and intuitive physical-unit interpretation is required.
  * **Limitations:** Incomparable across different series (e.g., comparing store sales vs. nationwide sales).

---

### Root Mean Squared Error (RMSE)
Measures the square root of averaged squared errors, placing heavier penalties on larger deviations.

* **Formula:**
  $$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{t=1}^{N} (y_t - \hat{y}_t)^2}$$

* **Properties:**
  * **When to use:** When large forecast errors or extreme misses carry severe real-world costs.
  * **Limitations:** Highly sensitive to individual outliers.

---

## 2. Percentage-Based Metrics

Percentage metrics scale errors relative to observed values, allowing comparison across different products or domains.

### Mean Absolute Percentage Error (MAPE)
Expresses average forecast error as a percentage of actual values.

* **Formula:**
  $$\text{MAPE} = \frac{100\%}{N} \sum_{t=1}^{N} \left| \frac{y_t - \hat{y}_t}{y_t} \right|$$

* **Properties:**
  * **When to use:** Executive reporting where stakeholders require intuitive percentage figures.
  * **Limitations:** 
    * **Fails on zero values ($y_t = 0$):** Causes division by zero.
    * **Asymmetric penalty:** Heavily penalizes over-forecasting compared to under-forecasting.

---

### Symmetric Mean Absolute Percentage Error (sMAPE)
Bounds percentage error between $0\%$ and $200\%$ by using the average of actual and predicted values in the denominator.

* **Formula:**
  $$\text{sMAPE} = \frac{100\%}{N} \sum_{t=1}^{N} \frac{|y_t - \hat{y}_t|}{(|y_t| + |\hat{y}_t|) / 2}$$

* **Properties:**
  * **When to use:** When equal treatment of over- and under-predictions is desired.
  * **Limitations:** Can become unstable when both $y_t$ and $\hat{y}_t$ approach zero simultaneously.

---

## 3. Scaled & Benchmark-Relative Metrics

Scaled metrics normalise evaluation results against a simple historical baseline calculated on training data.

### Mean Absolute Scaled Error (MASE)
Normalises forecast MAE against the in-sample MAE of a 1-step Naïve baseline.

* **Non-Seasonal Formula:**
  $$\text{MASE} = \frac{\frac{1}{N} \sum_{t=1}^{N} |y_t - \hat{y}_t|}{\frac{1}{T-1} \sum_{i=2}^{T} |y_i - y_{i-1}|}$$

* **Seasonal Formula (period $m$):**
  $$\text{MASE} = \frac{\frac{1}{N} \sum_{t=1}^{N} |y_t - \hat{y}_t|}{\frac{1}{T-m} \sum_{i=m+1}^{T} |y_i - y_{i-m}|}$$
  *(Where $T$ is the total number of historical training observations).*

* **Interpretation:**
  * $\text{MASE} < 1.0$: Model outperforms the simple baseline.
  * $\text{MASE} > 1.0$: Model performs worse than the simple baseline.

* **Properties:**
  * **When to use:** Standard for multi-series benchmarking across diverse scales, including intermittent or sparse data.

---

### Root Mean Squared Scaled Error (RMSSE)
The squared counterpart to MASE, popularized in large-scale forecasting competitions such as the M5 challenge.

* **Formula:**
  $$\text{RMSSE} = \sqrt{ \frac{\frac{1}{N} \sum_{t=1}^{N} (y_t - \hat{y}_t)^2}{\frac{1}{T-m} \sum_{i=m+1}^{T} (y_i - y_{i-m})^2} }$$

---

### Sekitani & Murakami's Overall Weighted Average (OWA)
Popularized in the **M4 Competition**, OWA provides a single composite relative score across multiple error perspectives.

* **Formula:**
  $$\text{OWA}_{a, b} = \frac{1}{2} \left( \frac{\text{sMAPE}_a}{\text{sMAPE}_b} + \frac{\text{MASE}_a}{\text{MASE}_b} \right)$$
  *(Where $a$ is the candidate model and $b$ is the reference baseline, typically Naïve2).*

* **Properties:**
  * Combines scale-independent percentage bounds ($\text{sMAPE}$) with baseline-scaled error ($\text{MASE}$).
  * An $\text{OWA} < 1.0$ indicates overall superior performance compared to the benchmark.

---

## 4. Probabilistic & Correlation Metrics

### Coefficient of Determination ($R^2$)
Measures the proportion of variance in the target variable explained by the forecast model.

* **Formula:**
  $$R^2 = 1 - \frac{\sum_{t=1}^{N} (y_t - \hat{y}_t)^2}{\sum_{t=1}^{N} (y_t - \bar{y})^2}$$

> [!WARNING]
> **Time Series Pitfall:** Non-stationary trends cause $\sum (y_t - \bar{y})^2$ to explode, generating artificially high $R^2$ values ($>0.95$) even for poor forecasts. Apply $R^2$ to the **first-differenced series** ($\Delta y_t = y_t - y_{t-1}$) to obtain meaningful evaluations.

---

### Pinball / Quantile Loss
Evaluates interval or probabilistic forecasts by applying asymmetric penalties for specific quantiles $\tau \in (0, 1)$.

* **Formula:**
  $$L_\tau(y_t, \hat{y}_t^{(\tau)}) = \max \left( \tau (y_t - \hat{y}_t^{(\tau)}), \, (\tau - 1)(y_t - \hat{y}_t^{(\tau)}) \right)$$

* **Properties:**
  * **When to use:** Supply chain safety-stock calculations, capacity planning, and risk management where over/under-prediction costs are unbalanced.

---

## 5. Summary Matrix of Metrics

| Metric | Scale-Independent? | Handles $y_t = 0$? | Outlier Sensitive? | Primary Use Case |
| :--- | :---: | :---: | :---: | :--- |
| **MAE** | ❌ No | Yes | Low | Direct unit-based error estimation |
| **RMSE** | ❌ No | Yes | High | Penalizing large misses |
| **MAPE** |  Yes | ❌ No | Moderate | Executive reporting |
| **sMAPE** |  Yes | Partial | Moderate | Percentage error bounded to $[0, 200\%]$ |
| **MASE** |  Yes | Yes | Low | Cross-series evaluation across scales |
| **OWA** |  Yes | Partial | Moderate | Benchmark competition overall scoring |
| **Pinball** | ❌ No | Yes | Variable | Quantile & probabilistic forecasts |

---

## 6. Standard Benchmark Baselines

Before evaluating statistical or neural network models, benchmark performance against standard non-parametric baselines:

1. **Naïve Baseline:**
   $$\hat{y}_{t+h} = y_t$$
   Assumes future values equal the most recent observation.

2. **Seasonal Naïve Baseline:**
   $$\hat{y}_{t+h} = y_{t+h-m}$$
   Assumes future forecasts equal observations from the corresponding previous seasonal period $m$.

3. **Drift Baseline:**
   $$\hat{y}_{t+h} = y_t + h \left( \frac{y_t - y_1}{t - 1} \right)$$
   Extrapolates the historical trend linear slope.

4. **Simple Exponential Smoothing (SES):**
   $$\hat{y}_{t+1} = \alpha y_t + (1-\alpha)\hat{y}_t$$
   Applies exponentially decreasing weights to older observations; ideal for stationary level series.

---

## 7. Botchkarev's Taxonomy of Performance Metrics

Alexei Botchkarev (2018/2019) proposed a structured taxonomy to systematically categorize performance metrics based on mathematical design and aggregation methods rather than intuitive groupings.

### Metric Categories

```
                      Botchkarev Framework Categories
                                    │
  ┌─────────────────┬───────────────┴───────────────┬─────────────────┐
  │                 │                               │                 │
Primary          Extended                       Composite         Hybrid Sets
Metrics          Metrics                         Metrics           of Metrics
  │            (e.g., RMSE)                    (e.g., OWA)       (e.g., Dashboard)
  │
  └── Structural Dimensions:
      ├── 1. Point Distance (Error expression)
      ├── 2. Normalization / Scale
      └── 3. Aggregation Operator
```

1. **Primary Metrics:** Direct aggregations of fundamental point distances (e.g., MAE, MSE, MAPE).
2. **Extended Metrics:** Monotonic transformations of primary metrics (e.g., $\text{RMSE} = \sqrt{\text{MSE}}$).
3. **Composite Metrics:** Mathematical combinations of two or more distinct primary or extended metrics (e.g., **Sekitani & Murakami's OWA**).
4. **Hybrid Sets of Metrics:** Dashboards or vectors reporting complementary metrics simultaneously without collapsing them into a single scalar (e.g., $[\text{MAE}, \text{sMAPE}, \text{MASE}]$).

---

### Three Structural Dimensions of Primary Metrics

Botchkarev establishes that any primary metric is uniquely defined by three mathematical choices:

1. **Point Distance Function:** Measures individual deviation $e_t = y_t - \hat{y}_t$.
   * Absolute distance ($|e_t|$)
   * Squared distance ($e_t^2$)
   * Asymmetric/Quantile distance ($\max(\tau e_t, (\tau-1)e_t)$)

2. **Normalization / Scaling:** Adjusts point distances relative to scale.
   * Unnormalized (Raw units)
   * Target-normalized (Divided by $y_t$)
   * Midpoint-normalized (Divided by $\frac{|y_t| + |\hat{y}_t|}{2}$)
   * Benchmark-normalized (Divided by historical baseline error)

3. **Aggregation Operator:** Summarizes normalized point distances across observations.
   * Arithmetic Mean ($\frac{1}{N}\sum$)
   * Median ($\text{Median}$)
   * Total Sum ($\sum$)

---

### Structural Breakdown Table

| Metric | Category | Point Distance | Normalization | Aggregation |
| :--- | :--- | :--- | :--- | :--- |
| **MAE** | Primary | Absolute $|e_t|$ | Unnormalized | Mean |
| **MSE** | Primary | Squared $e_t^2$ | Unnormalized | Mean |
| **RMSE** | Extended | Squared $e_t^2$ | Post-transformation ($\sqrt{\cdot}$) | Mean |
| **MAPE** | Primary | Absolute $|e_t|$ | Target Value ($y_t$) | Mean |
| **MASE** | Primary | Absolute $|e_t|$ | Historical Naïve MAE | Mean |
| **OWA** | Composite | Hybrid | Baseline Relative | Weighted Average |

---

## References & Related Notes
* [[Time Series Forecasting Baselines]]
* [[Model Validation Strategies]]
* Botchkarev, A. (2018). *Performance Metrics in Machine Learning Regression, Forecasting and Prognostics*. arXiv preprint arXiv:1809.03006.
* Hyndman, R. J., & Koehler, A. B. (2006). *Another look at measures of forecast accuracy*. International Journal of Forecasting, 22(4), 679-688.