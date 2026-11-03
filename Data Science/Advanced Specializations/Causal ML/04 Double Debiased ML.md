# Double / Debiased Machine Learning (DML)

Double ML provides a framework for estimating causal parameters with high-dimensional nuisance parameters using machine learning, with valid inference.

## 1. The DML Framework (Chernozhukov et al., 2018)

### Core Idea
Separate estimation of **nuisance parameters** (high-dimensional) from **target parameter** (low-dimensional) using **cross-fitting** and **Neyman orthogonality**.

### Target Parameter
$$\theta_0 = \arg\min_{\theta \in \Theta} \mathbb{E}[m(W; \theta, \eta_0)]$$
where $\eta_0 = (\eta_{01}, ..., \eta_{0k})$ are nuisance parameters.

### Neyman Orthogonality
$$\partial_\eta \mathbb{E}[m(W; \theta_0, \eta)]|_{\eta=\eta_0} = 0$$
The moment condition is insensitive to first-order errors in nuisance estimation.

---

## 2. Key Examples

### 2.1 Partially Linear Model (ATE)
$$Y = D \theta_0 + g_0(X) + U, \quad D = m_0(X) + V$$
- Target: $\theta_0$ (ATE)
- Nuisance: $g_0(X) = \mathbb{E}[Y|X]$, $m_0(X) = \mathbb{E}[D|X]$
- Orthogonal score: $\psi(W; \theta, \eta) = (D - m(X))(Y - g(X) - (D - m(X))\theta)$

### 2.2 Partially Linear IV Model (LATE)
$$Y = D \theta_0 + g_0(X) + U, \quad D = Z \alpha_0 + m_0(X) + V$$
- Target: $\theta_0$ (LATE)
- Nuisance: $g_0, m_0, r_0 = \mathbb{E}[Z|X]$

### 2.3 Interactive Model (ATET)
$$Y = D \theta_0 + g_0(X) + U, \quad D = m_0(X) + V$$
- Target: $\theta_0$ (ATET)
- Nuisance: $g_0, m_0$

---

## 3. DML Algorithm (Algorithm 1)

```python
def dml_algorithm(y, d, x, score='partial_linear', n_folds=5, 
                  learner_y=None, learner_d=None, n_rep=1):
    """
    Generic DML implementation
    
    Parameters:
    - score: 'partial_linear', 'IV', 'interactive'
    - learner_y: ML model for E[Y|X] 
    - learner_d: ML model for E[D|X]
    - n_rep: Number of cross-fitting repetitions
    """
    from sklearn.model_selection import KFold
    import numpy as np
    
    n = len(y)
    thetas = []
    ses = []
    
    for rep in range(n_rep):
        kf = KFold(n_splits=n_folds, shuffle=True, random_state=42+rep)
        
        # Cross-fitted nuisance estimates
        g_hat = np.zeros(n)
        m_hat = np.zeros(n)
        
        for train_idx, test_idx in kf.split(x):
            x_train, x_test = x[train_idx], x[test_idx]
            d_train, d_test = d[train_idx], d[test_idx]
            y_train, y_test = y[train_idx], y[test_idx]
            
            # Fit nuisance models
            if learner_y:
                learner_y.fit(x_train, y_train)
                g_hat[test_idx] = learner_y.predict(x_test)
            
            if learner_d:
                learner_d.fit(x_train, d_train)
                m_hat[test_idx] = learner_d.predict(x_test)
        
        # Orthogonal score function
        if score == 'partial_linear':
            # psi = (d - m)(y - g - (d - m)*theta)
            # theta = sum((d-m)(y-g)) / sum((d-m)^2)
            numerator = np.sum((d - m_hat) * (y - g_hat))
            denominator = np.sum((d - m_hat)**2)
            theta = numerator / denominator
            
            # Score
            psi = (d - m_hat) * (y - g_hat - (d - m_hat) * theta)
            psi_deriv = -(d - m_hat)**2
            
        elif score == 'IV':
            # IV score
            # r = E[Z|X], psi = (d - r)(y - g - d*theta)
            pass
        
        # Standard error
        se = np.sqrt(np.mean(psi**2) / (np.mean(psi_deriv)**2 * len(psi)))
        
        thetas.append(theta)
        ses.append(se)
    
    # Aggregate across repetitions
    theta_med = np.median(thetas)
    se_med = np.sqrt(np.median(ses)**2 + np.median((thetas - theta_med)**2))
    
    return theta_med, se_med
```

---

## 4. DML for Partially Linear Model (PLR)

### Implementation with EconML
```python
from econml.dml import LinearDML, SparseLinearDML, KernelDML

# Linear DML (PLIV for continuous treatment)
dml = LinearDML(
    model_y=RandomForestRegressor(n_estimators=500, max_depth=10),
    model_t=RandomForestRegressor(n_estimators=500, max_depth=10),
    cv=5,
    featurizer=None
)

dml.fit(y, d, X=x)

# ATE
ate = dml.ate()
print(f"ATE: {ate}")

# CATE
cate = dml.effect(x)
ci = dml.ate_interval(alpha=0.05)
```

### Sparse Linear DML (High-dimensional)
```python
from econml.dml import SparseLinearDML

sparse_dml = SparseLinearDML(
    model_y=LassoCV(cv=5),
    model_t=LassoCV(cv=5),
    cv=5,
    n_folds=5
)

sparse_dml.fit(y, d, X=x)
ate = sparse_dml.ate()
```

---

## 5. DML for Instrumental Variables (PLIV)

### Partially Linear IV Model
```python
from econml.iv.dml import LinearDMLIV, NonParamDMLIV

# Linear IV
iv_dml = LinearDMLIV(
    model_y=RandomForestRegressor(),
    model_t=RandomForestRegressor(),
    model_z=RandomForestRegressor(),
    cv=5
)

# y = d*theta + g(x) + u
# d = z*alpha + m(x) + v
iv_dml.fit(y, d, Z=z, X=x)
late = iv_dml.ate()
```

### Nonparametric IV
```python
# For nonlinear first stage
niv = NonParamDMLIV(
    model_y=RandomForestRegressor(),
    model_t=RandomForestRegressor(),
    model_z=RandomForestRegressor(),
    cv=5
)
```

---

## 6. DML for Heterogeneous Effects (CATE)

### Linear DML with CATE
```python
# Effect modification by covariates
dml_cate = LinearDML(
    model_y=RandomForestRegressor(n_estimators=500),
    model_t=RandomForestRegressor(n_estimators=500),
    cv=5,
    discrete_treatment=False
)

dml_cate.fit(y, d, X=x)

# CATE for new samples
cate = dml_cate.effect(x_new)

# Confidence intervals
ci = dml_cate.effect_interval(x_new, alpha=0.05)
```

### DML with Effect Modification
```python
# Include effect modifiers explicitly
dml_het = LinearDML(
    model_y=RandomForestRegressor(),
    model_t=RandomForestRegressor(),
    cv=5
)

# Fit with effect modifiers W
dml_het.fit(y, d, X=x, W=w)  # W are effect modifiers

cate = dml_het.effect(x_new, w_new)
```

---

## 7. Double ML for Treatment Effects (DR-Learner)

### Implementation
```python
from econml.dr import DRLearner
from econml.orf import DMLOrthoForest

# DR-Learner (Kennedy et al.)
dr = DRLearner(
    model_regression=RandomForestRegressor(n_estimators=500),
    model_propensity=RandomForestClassifier(n_estimators=500),
    cv=5
)
dr.fit(y, d, X=x)

cate = dr.effect(x_new)

# Orthogonal Forest (DML + Random Forest)
orf = DMLOrthoForest(
    n_trees=500,
    min_leaf_size=10,
    max_depth=20,
    model_Y=RandomForestRegressor(),
    model_T=RandomForestClassifier(),
    model_Y_final=RandomForestRegressor(),
    model_T_final=RandomForestRegressor()
)
orf.fit(y, d, X=x, W=None)
cate = orf.predict(x_new)
```

---

## 8. Cross-Fitting (Essential)

### Why Cross-Fitting?
- Avoids overfitting bias in high-dimensional settings
- Uses sample splitting to ensure independence between nuisance estimates and scores
- Enables $\sqrt{n}$-consistency and asymptotic normality

### Implementation
```python
def cross_fit_predictions(x, y, w, model_y, model_t, n_folds=5):
    """
    Returns cross-fitted predictions for nuisance parameters
    """
    from sklearn.model_selection import KFold
    
    kf = KFold(n_splits=n_folds, shuffle=True, random_state=42)
    n = len(y)
    
    y_pred = np.zeros(n)
    t_pred = np.zeros(n)
    
    for train_idx, test_idx in kf.split(x):
        # Fit on training fold
        model_y.fit(x[train_idx], y[train_idx])
        model_t.fit(x[train_idx], w[train_idx])
        
        # Predict on test fold
        y_pred[test_idx] = model_y.predict(x[test_idx])
        t_pred[test_idx] = model_t.predict(x[test_idx])
    
    return y_pred, t_pred
```

---

## 9. Inference and Confidence Intervals

### Asymptotic Normality
```python
def dml_inference(theta_hat, psi, psi_deriv):
    """
    Compute standard error and confidence interval
    """
    n = len(psi)
    se = np.sqrt(np.mean(psi**2) / (np.mean(psi_deriv)**2 * n))
    
    from scipy.stats import norm
    z = norm.ppf(1 - 0.05/2)
    
    ci_lower = theta_hat - z * se
    ci_upper = theta_hat + z * se
    
    return se, (ci_lower, ci_upper)

# For CATE
def cate_inference(cate_hat, psi_cate, psi_deriv_cate):
    # For each point
    se = np.sqrt(np.mean(psi_cate**2, axis=0) / (np.mean(psi_deriv_cate, axis=0)**2))
    return se
```

### Bootstrap (Alternative)
```python
def dml_bootstrap(y, d, x, n_bootstrap=500, **dml_kwargs):
    thetas = []
    for i in range(n_bootstrap):
        idx = np.random.choice(len(y), len(y), replace=True)
        y_b, d_b, x_b = y[idx], d[idx], x[idx]
        
        dml = LinearDML(**dml_kwargs)
        dml.fit(y_b, d_b, X=x_b)
        thetas.append(dml.ate())
    
    theta_hat = np.median(thetas)
    ci = np.percentile(thetas, [2.5, 97.5])
    return theta_hat, ci
```

---

## 9. Inference with High-Dimensional Confounders

### Sparse DML (Lasso-based)
```python
from econml.dml import SparseLinearDML

sparse_dml = SparseLinearDML(
    model_y=LassoCV(cv=5),
    model_t=LassoCV(cv=5),
    cv=5,
    n_folds=5
)

sparse_dml.fit(y, d, X=x)

# Debiased lasso coefficients
coef = sparse_dml.coef_
```

### Debiased Lasso
```python
# For high-dimensional linear models
# theta = theta_hat + 1/n * sum Theta * X' (y - X*theta_hat)
# where Theta approximates (X'X/n)^{-1}

def debiased_lasso(X, y, lambda_hat):
    # nodewise regression to estimate precision matrix
    # then debias
    pass
```

---

## 10. Practical Implementation Checklist

### Pre-estimation
- [ ] Define causal parameter (ATE, ATET, LATE, CATE)
- [ ] Choose score function (PLR, IV, Interactive)
- [ ] Select ML learners (RF, XGBoost, Lasso, NN)
- [ ] Set cross-fitting folds (typically 2-5)

### Estimation
- [ ] Cross-fit nuisance parameters
- [ ] Use orthogonal scores
- [ ] Check moment condition $\mathbb{E}[\psi] \approx 0$

### Inference
- [ ] Compute standard errors via score variance
- [ ] Median of repetitions for final estimate
- [ ] Check $\theta$ stability across folds

### Diagnostics
```python
def dml_diagnostics(dml_model, y, d, x):
    # Check moment condition
    g_hat = dml_model.predict_y(x)
    m_hat = dml_model.predict_t(x)
    
    psi = (d - m_hat) * (y - g_hat - (d - m_hat) * dml_model.ate_)
    print(f"Mean psi: {np.mean(psi):.6f} (should be ~0)")
    print(f"Std psi: {np.std(psi):.6f}")
    
    # Check overlap
    e_hat = m_hat  # propensity score
    print(f"Min e: {e_hat.min():.4f}, Max e: {e_hat.max():.4f}")
```

---

## 10. Key Takeaways

1. **DML = Orthogonality + Cross-fitting + ML** → Valid inference with ML
2. **Neyman orthogonality** makes estimator insensitive to nuisance errors
3. **Cross-fitting** removes overfitting bias from using same data for nuisance and target
4. **LinearDML** for ATE; **DRLearner/OrthoForest** for CATE
5. **Cross-fitting with $K \geq 2$** is essential for ML nuisance estimators
6. **Asymptotic normality** holds under mild conditions (ML rate $n^{-1/4}$)
6. **EconML** provides production-ready implementations
7. **Multiple repetitions** ($R \geq 50$) recommended for stable estimates