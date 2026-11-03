# Causal Forests & Heterogeneous Treatment Effects

Causal Forests (Generalized Random Forests) extend Random Forests to estimate heterogeneous treatment effects with valid confidence intervals.

## 1. From Random Forests to Causal Forests

### Standard Random Forest
- Splits minimize MSE: $\sum (Y_i - \bar{Y})^2$
- Predicts $\mathbb{E}[Y|X]$

### Causal Forest (Athey, Tibshirani, Wager, 2019)
- Splits maximize **heterogeneity in treatment effects**
- Predicts $\tau(x) = \mathbb{E}[Y(1) - Y(0) | X=x]$
- Provides **honest** trees and asymptotic confidence intervals

---

## 2. Causal Forest Algorithm

### 2.1 Honest Trees
Each tree uses **disjoint samples** for:
1. **Training sample**: Choose splits
2. **Estimation sample**: Estimate leaf treatment effects

```python
# Conceptual honest tree
def honest_tree_split(training_data, estimation_data):
    # 1. Choose split using training data
    best_split = maximize_heterogeneity(training_data)
    
    # 2. Estimate treatment effect in each leaf using estimation data
    for leaf in leaves:
        tau_leaf = mean(estimation_data[leaf].y_treated) - \
                   mean(estimation_data[leaf].y_control)
    
    return tree
```

### 2.2 Splitting Criterion (Causal Criterion)
Maximize variance of estimated treatment effects across leaves:

$$\Delta = \frac{n_L n_R}{n^2} (\hat{\tau}_L - \hat{\tau}_R)^2$$

where $\hat{\tau}_L, \hat{\tau}_R$ are treatment effects in left/right leaves estimated on **estimation sample**.

### 2.3 Local Centering
Transform outcomes to remove main effects before splitting:

$$\tilde{Y}_i = Y_i - \hat{\mu}(X_i)$$
$$\tilde{W}_i = W_i - \hat{e}(X_i)$$

where $\hat{\mu}(X) = \mathbb{E}[Y|X]$, $\hat{e}(X) = \mathbb{E}[W|X]$.

Then split on covariance: $\text{Cov}(\tilde{Y}, \tilde{W} | X \in \text{leaf})$

---

## 3. Generalized Random Forests (GRF)

### 3.1 General Framework
For any M-estimator defined by moment condition $\psi(O; \theta, \eta)$:

1. **Split** using gradient of moment condition
2. **Estimate** parameters in leaves using estimation sample
3. **Aggregate** across trees

### 3.2 Causal Forest as GRF
Moment condition for ATE:
$$\psi(O; \tau, \eta) = (W - e(X))(Y - \mu(X) - (W - e(X))\tau)$$

Score for splitting: gradient of moment w.r.t $\tau$.

---

## 4. Implementation with GRF (R) / econml (Python)

### 4.1 R (grf package) - Reference Implementation
```r
library(grf)

# Causal Forest
cf <- causal_forest(X, Y, W, num.trees = 5000, min.node.size = 10)
tau.hat <- predict(cf, X.test, estimate.variance = TRUE)

# Confidence intervals
ci <- predict(cf, X.test, estimate.variance = TRUE, alpha = 0.05)

# Variable importance
importance <- variable_importance(cf)
```

### 4.2 Python (econml)
```python
from econml.grf import CausalForest

cf = CausalForest(
    n_estimators=2000,
    min_samples_leaf=10,
    max_depth=10,
    honest=True,           # Honest trees
    inference=True,        # Enable confidence intervals
    n_jobs=-1
)

cf.fit(y, w, X=x)
cate = cf.predict(x_test)
ci = cf.predict_ci(x_test, alpha=0.05)

# Feature importance
importance = cf.feature_importances_
```

---

## 5. Causal Forest Configuration

### Key Parameters
| Parameter | Default | Recommendation |
|-----------|---------|----------------|
| `n_estimators` | 2000 | 2000-5000 for stable CI |
| `min_samples_leaf` | 10 | 5-20 (larger = more honest) |
| `max_depth` | None | 10-20 (None = full) |
| `max_features` | sqrt(p) | 0.3-0.5 * p |
| `honest` | True | **Always True** |
| `inference` | True | For CI |
| `subsample_ratio` | 0.5 | 0.5 (subsample for honesty) |

### Subsample Ratio for Honesty
```python
# subsample_ratio controls training/estimation split
# 0.5 = 50% for training splits, 50% for estimation
cf = CausalForest(
    n_estimators=2000,
    min_samples_leaf=10,
    subsample_ratio=0.5,  # 50/50 split
    honest=True
)
```

---

## 6. Confidence Intervals & Inference

### Asymptotic Normality
Under regularity conditions:
$$\sqrt{n}(\hat{\tau}(x) - \tau(x)) \overset{d}{\to} N(0, \sigma^2(x))$$

Variance estimated via **infinitesimal jackknife (IJ)**:
$$\hat{\sigma}^2(x) = \sum_{i=1}^n \text{Cov}_*(\hat{\tau}(x), \mathbb{1}_{i \in \text{leaf}(x)})$$

### Confidence Intervals
```python
# EconML
cate = cf.predict(x_test)
ci_lower, ci_upper = cf.predict_ci(x_test, alpha=0.05)

# grf (R)
pred <- predict(cf, X.test, estimate.variance = TRUE)
ci_lower <- pred$predictions - 1.96 * sqrt(pred$variance.estimates)
ci_upper <- pred$predictions + 1.96 * sqrt(pred$variance.estimates)
```

### Calibration Check
```python
def check_ci_coverage(cate_true, ci_lower, ci_upper):
    """Coverage should be ~95% for 95% CI"""
    covered = (cate_true >= ci_lower) & (cate_true <= ci_upper)
    return np.mean(covered)
```

---

## 7. Variable Importance

### Causal Variable Importance
```python
# grf: minimal depth / permutation importance
importance <- variable_importance(cf)
# Higher = more important for treatment effect heterogeneity

# econml
importance = cf.feature_importances_
```

### Interpretation
- **High importance**: Covariate strongly moderates treatment effect
- **Low importance**: Covariate doesn't affect treatment effect
- **Not the same as**: Predictive importance for outcome

---

## 8. Causal Forest for Different Estimands

### 8.1 ATE (Average Treatment Effect)
```python
cf = CausalForest()
cf.fit(y, w, X=x)
ate = cf.predict(x_test).mean()
```

### 8.2 ATT (Average Treatment Effect on Treated)
```python
# Weight by propensity score
cf_att = CausalForest()
cf_att.fit(y[w==1], w[w==1], X=x[w==1])
att = cf_att.predict(x_test).mean()
```

### 8.3 LATE (IV - Instrumental Variables)
```python
from econml.grf import InstrumentalForest

iv_forest = InstrumentalForest(
    n_estimators=2000,
    min_samples_leaf=10
)
iv_forest.fit(y, w, Z=z, X=x)
late = iv_forest.predict(x_test)
```

---

## 9. Causal Forest Diagnostics

### 9.1 Calibration Plot
```python
def calibration_plot(cate_true, cate_pred, n_bins=10):
    """Check if predicted CATE matches true CATE"""
    bins = np.percentile(cate_pred, np.linspace(0, 100, n_bins+1))
    bin_means = []
    bin_true = []
    
    for i in range(n_bins):
        mask = (cate_pred >= bins[i]) & (cate_pred < bins[i+1])
        if mask.sum() > 0:
            bin_means.append(cate_pred[mask].mean())
            bin_true.append(cate_true[mask].mean())
    
    plt.scatter(bin_means, bin_true)
    plt.plot([0, 1], [0, 1], 'r--')
    plt.xlabel('Predicted CATE')
    plt.ylabel('True CATE')
    plt.title('Calibration Plot')
    plt.show()
```

### 9.2 Rank-Weighted Average Treatment Effect (QINI)
```python
def qini_coefficient(cate_true, cate_pred, w, y):
    """Area under QINI curve"""
    n = len(cate_pred)
    order = np.argsort(cate_pred)[::-1]
    
    qini = 0
    for i in range(n):
        inc = (y[order[i]] * w[order[i]] - y[order[i]] * (1-w[order[i]]))
        qini += inc
    
    return qini / n
```

### 9.3 Policy Tree Evaluation
```python
def policy_value(cate_pred, w, y, threshold=0):
    """Value of policy: treat if CATE > threshold"""
    treat = (cate_pred > threshold).astype(int)
    # IPW estimate
    return np.mean(treat * w * y / 0.5 - (1-treat) * (1-w) * y / 0.5)
```

---

## 10. Comparison: Causal Forest vs Other Methods

| Method | CATE | CI | Honest | Non-parametric | Scalability |
|--------|------|----|--------|----------------|-------------|
| **Causal Forest** | ✅ | ✅ | ✅ | ✅ | Good |
| **BART** | ✅ | ✅ | - | ✅ | Medium |
| **Orthogonal Forest** | ✅ | ✅ | ✅ | ✅ | Good |
| **X-Learner** | ✅ | - | - | ✅ | Good |
| **R-Learner** | ✅ | - | - | ✅ | Good |
| **Neural Nets** | ✅ | - | - | ✅ | Excellent |

---

## 10. Practical Implementation

### Complete Pipeline
```python
from econml.grf import CausalForest
from sklearn.model_selection import train_test_split
import numpy as np

# 1. Data
X_train, X_test, y_train, y_test, w_train, w_test = train_test_split(
    x, y, w, test_size=0.2, random_state=42
)

# 2. Fit Causal Forest
cf = CausalForest(
    n_estimators=2000,
    min_samples_leaf=20,
    max_depth=15,
    honest=True,
    inference=True,
    n_jobs=-1,
    random_state=42
)

cf.fit(y_train, w_train, X=X_train)

# 2. Predict CATE
cate_test = cf.predict(X_test)
ci_lower, ci_upper = cf.predict_ci(X_test, alpha=0.05)

# 3. Evaluate
if hasattr(cate_test, '__len__'):  # If true CATE available
    from sklearn.metrics import mean_squared_error
    mse = mean_squared_error(cate_true_test, cate_test)
    print(f"CATE MSE: {mse:.4f}")

# 4. Policy value
policy_val = policy_value(cate_test, w_test, y_test)
print(f"Policy value: {policy_val:.4f}")

# 5. Feature importance
importance = cf.feature_importances_
top_features = np.argsort(importance)[::-1][:10]
print(f"Top features: {top_features}")

# 6. Save model
import joblib
joblib.dump(cf, 'causal_forest_model.pkl')
```

---

## 11. Extensions

### 11.1 Longitudinal Causal Forest
```python
# For panel data with time-varying treatments
from econml.panel import DynamicCF

dcf = DynamicCF()
dcf.fit(y, w, X, unit_ids, time_ids)
```

### 11.2 Multi-Treatment Causal Forest
```python
# Multiple discrete treatments
from econml.grf import MultiTreatmentCausalForest

mtcf = MultiTreatmentCausalForest(n_estimators=2000)
mtcf.fit(y, w, X=x)  # w: 0, 1, 2, 3...
cate = mtcf.predict(x_test)
```

### 11.3 Survival Causal Forest
```python
# For time-to-event outcomes
from econml.grf import SurvivalCausalForest

scf = SurvivalCausalForest()
scf.fit(T, delta, w, X=x)  # T=time, delta=event indicator
```

---

## 11. Key Takeaways

1. **Causal Forest = Honest Random Forest for treatment effects**
2. **Honesty** (sample splitting) is crucial for valid inference
3. **Local centering** removes main effects to focus on heterogeneity
4. **Infinitesimal jackknife** provides asymptotically valid CIs
5. **CATE estimation** is the primary use case; ATE is secondary
6. **Variable importance** identifies effect modifiers, not predictive features
7. **Evaluation**: Calibration plots, QINI, policy value, coverage
8. **econml** provides Python implementation; **grf** is R reference
9. **Honest trees + Local centering + Infinitesimal jackknife** = Valid CATE inference
10. **Subsample ratio 0.5** balances split selection and estimation accuracy