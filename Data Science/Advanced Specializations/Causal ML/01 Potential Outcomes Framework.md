# Potential Outcomes Framework (Rubin Causal Model)

The Potential Outcomes Framework (Neyman-Rubin) provides the mathematical foundation for causal inference. It defines causal effects as comparisons between potential outcomes under different treatments.

## 1. Core Definitions

### Units, Treatments, and Outcomes
- **Unit**: Individual entity (person, firm, region, etc.) indexed by $i = 1, ..., N$
- **Treatment**: Binary $W_i \in \{0, 1\}$ (control=0, treatment=1)
- **Potential Outcomes**: $Y_i(0)$ and $Y_i(1)$ — outcomes under control and treatment
- **Observed Outcome**: $Y_i = W_i Y_i(1) + (1-W_i) Y_i(0)$

### Fundamental Problem of Causal Inference
> **We never observe both $Y_i(1)$ and $Y_i(0)$ for the same unit.**

Only one potential outcome is realized; the other is counterfactual.

---

## 2. Causal Estimands

### Individual Treatment Effect (ITE)
$$\tau_i = Y_i(1) - Y_i(0)$$
*Never directly observable.*

### Average Treatment Effect (ATE)
$$\tau_{ATE} = \mathbb{E}[Y_i(1) - Y_i(0)] = \mathbb{E}[Y(1)] - \mathbb{E}[Y(0)]$$

### Average Treatment Effect on the Treated (ATT)
$$\tau_{ATT} = \mathbb{E}[Y_i(1) - Y_i(0) | W_i = 1]$$

### Average Treatment Effect on the Control (ATC)
$$\tau_{ATC} = \mathbb{E}[Y_i(1) - Y_i(0) | W_i = 0]$$

### Conditional Average Treatment Effect (CATE)
$$\tau(x) = \mathbb{E}[Y(1) - Y(0) | X = x]$$
*Heterogeneous treatment effects conditional on covariates.*

---

## 3. Identification Assumptions

### 3.1 Stable Unit Treatment Value Assumption (SUTVA)
1. **No Interference**: $Y_i(w_1, ..., w_N) = Y_i(w_i)$ — one unit's treatment doesn't affect others' outcomes
2. **Consistency**: $Y_i = Y_i(W_i)$ — observed outcome equals potential outcome under assigned treatment
3. **No Hidden Variations**: Single version of each treatment

### 3.2 Unconfoundedness (Ignorability / Exchangeability)
$$Y(1), Y(0) \perp\!\!\!\perp W | X$$
Treatment assignment is independent of potential outcomes given covariates $X$.
- **Also called**: Selection on observables, Conditional Independence Assumption (CIA)

### 3.3 Positivity (Overlap / Common Support)
$$0 < P(W=1 | X=x) < 1 \quad \text{for all } x \in \mathcal{X}$$
Every unit has non-zero probability of receiving each treatment.

### 3.4 Consistency (Already part of SUTVA)
$$Y = W \cdot Y(1) + (1-W) \cdot Y(0)$$

---

## 4. Identification of ATE

Under Unconfoundedness + Positivity + SUTVA:

$$\tau_{ATE} = \mathbb{E}_X[\mathbb{E}[Y | W=1, X] - \mathbb{E}[Y | W=0, X]]$$

**Proof**:
$$\mathbb{E}[Y(1)] = \mathbb{E}[\mathbb{E}[Y(1) | X]] = \mathbb{E}[\mathbb{E}[Y(1) | W=1, X]] = \mathbb{E}[\mathbb{E}[Y | W=1, X]]$$
(Same for $Y(0)$)

---

## 5. Estimation Methods

### 5.1 Inverse Probability Weighting (IPW)
Weight each unit by inverse probability of treatment:

$$\hat{\tau}_{IPW} = \frac{1}{N} \sum_{i=1}^N \left[ \frac{W_i Y_i}{\hat{e}(X_i)} - \frac{(1-W_i) Y_i}{1-\hat{e}(X_i)} \right]$$

where $\hat{e}(X) = P(W=1 | X)$ is the **propensity score**.

```python
def ipw_ate(y, w, propensity_scores):
    ipw_treated = (w * y) / propensity_scores
    ipw_control = ((1 - w) * y) / (1 - propensity_scores)
    return np.mean(ipw_treated - ipw_control)
```

### 5.2 Propensity Score Matching
Match treated and control units with similar propensity scores.

```python
from sklearn.neighbors import NearestNeighbors

def propensity_score_matching(y, w, propensity_scores, k=1):
    treated_idx = np.where(w == 1)[0]
    control_idx = np.where(w == 0)[0]
    
    # Match each treated to k nearest controls
    nn = NearestNeighbors(n_neighbors=k)
    nn.fit(propensity_scores[control_idx].reshape(-1, 1))
    distances, indices = nn.kneighbors(propensity_scores[treated_idx].reshape(-1, 1))
    
    # ATT estimate
    matched_controls = control_idx[indices.flatten()]
    att = np.mean(y[treated_idx] - np.mean(y[matched_controls].reshape(-1, k), axis=1))
    return att
```

### 5.3 Outcome Regression (G-Computation)
Model outcome directly:

$$\hat{\tau}_{REG} = \frac{1}{N} \sum_{i=1}^N [\hat{\mu}_1(X_i) - \hat{\mu}_0(X_i)]$$

where $\hat{\mu}_w(x) = \mathbb{E}[Y | W=w, X=x]$.

```python
from sklearn.ensemble import RandomForestRegressor

def g_computation(y, w, X):
    # Fit separate models for treated and control
    m1 = RandomForestRegressor().fit(X[w==1], y[w==1])
    m0 = RandomForestRegressor().fit(X[w==0], y[w==0])
    
    # Predict counterfactuals for all units
    pred_1 = m1.predict(X)
    pred_0 = m0.predict(X)
    
    return np.mean(pred_1 - pred_0)
```

### 5.4 Doubly Robust (AIPW / Augmented IPW)
Combines IPW + Outcome Regression — consistent if **either** model is correct.

$$\hat{\tau}_{DR} = \frac{1}{N} \sum_{i=1}^N \left[ \hat{\mu}_1(X_i) - \hat{\mu}_0(X_i) + \frac{W_i(Y_i - \hat{\mu}_1(X_i))}{\hat{e}(X_i)} - \frac{(1-W_i)(Y_i - \hat{\mu}_0(X_i))}{1-\hat{e}(X_i)} \right]$$

```python
def doubly_robust_ate(y, w, X, propensity_model, outcome_model):
    e_hat = propensity_model.predict_proba(X)[:, 1]
    mu1_hat = outcome_model.mu1.predict(X)
    mu0_hat = outcome_model.mu0.predict(X)
    
    ipw_term = (w * (y - mu1_hat) / e_hat) - ((1 - w) * (y - mu0_hat) / (1 - e_hat))
    reg_term = mu1_hat - mu0_hat
    
    return np.mean(reg_term + ipw_term)
```

### 5.5 Targeted Maximum Likelihood Estimation (TMLE)
Semi-parametric efficient estimator; updates initial outcome estimate to solve efficient influence function.

```python
# Simplified TMLE concept
def tmle_ate(y, w, X):
    # 1. Initial outcome regression
    Q = initial_outcome_model(y, w, X)
    
    # 2. Propensity score
    g = propensity_model(X)
    
    # 3. Clever covariate
    H = w / g - (1 - w) / (1 - g)
    
    # 4. Fluctuation: logistic regression of Y on H with offset logit(Q)
    epsilon = logistic_regression(y ~ H, offset=logit(Q)).coef_
    
    # 5. Updated prediction
    Q_star = expit(logit(Q) + epsilon * H)
    
    # 6. ATE
    return np.mean(Q_star[w=1] - Q_star[w=0])
```

---

## 6. Propensity Score Estimation

### Methods
```python
# Logistic Regression (classic)
from sklearn.linear_model import LogisticRegression
ps_model = LogisticRegression(max_iter=1000)
e_hat = ps_model.fit(X, w).predict_proba(X)[:, 1]

# Gradient Boosting (better for complex relationships)
from sklearn.ensemble import GradientBoostingClassifier
ps_model = GradientBoostingClassifier(n_estimators=100, max_depth=3)
e_hat = ps_model.fit(X, w).predict_proba(X)[:, 1]

# Neural Network
import torch
ps_model = torch.nn.Sequential(
    nn.Linear(X.shape[1], 64), nn.ReLU(),
    nn.Linear(64, 1), nn.Sigmoid()
)
```

### Diagnostics
```python
def propensity_score_diagnostics(e_hat, w):
    # Overlap check
    print(f"Min e_hat: {e_hat.min():.4f}, Max e_hat: {e_hat.max():.4f}")
    print(f"Effective sample size: {1 / np.mean((w/e_hat)**2 + ((1-w)/(1-e_hat))**2):.1f}")
    
    # Balance check
    from sklearn.metrics import roc_auc_score
    print(f"Propensity score AUC: {roc_auc_score(w, e_hat):.4f}")
    
    # Common support
    common_support = (e_hat > 0.01) & (e_hat < 0.99)
    print(f"Units in common support: {common_support.mean():.3f}")
```

---

## 7. Covariate Balance Assessment

### Standardized Mean Difference (SMD)
$$\text{SMD} = \frac{\bar{X}_1 - \bar{X}_0}{\sqrt{(s_1^2 + s_0^2)/2}}$$

```python
def compute_smd(X, w, weights=None):
    smds = {}
    for col in X.columns:
        x1 = X.loc[w==1, col]
        x0 = X.loc[w==0, col]
        if weights is not None:
            w1 = weights[w==1]
            w0 = weights[w==0]
            mean1 = np.average(x1, weights=w1)
            mean0 = np.average(x0, weights=w0)
            var1 = np.average((x1 - mean1)**2, weights=w1)
            var0 = np.average((x0 - mean0)**2, weights=w0)
        else:
            mean1, mean0 = x1.mean(), x0.mean()
            var1, var0 = x1.var(), x0.var()
        smd = (mean1 - mean0) / np.sqrt((var1 + var0) / 2)
        smds[col] = smd
    return smds

# Good balance: |SMD| < 0.1 for all covariates
```

### Love Plot
```python
def love_plot(smd_before, smd_after=None):
    import matplotlib.pyplot as plt
    vars = list(smd_before.keys())
    y = range(len(vars))
    
    plt.figure(figsize=(8, 6))
    plt.axvline(x=0, color='black', linewidth=0.5)
    plt.axvline(x=0.1, color='red', linestyle='--', alpha=0.5)
    plt.axvline(x=-0.1, color='red', linestyle='--', alpha=0.5)
    plt.scatter([smd_before[v] for v in vars], y, label='Before', alpha=0.7)
    if smd_after:
        plt.scatter([smd_after[v] for v in vars], y, label='After', alpha=0.7)
    plt.yticks(y, vars)
    plt.xlabel('Standardized Mean Difference')
    plt.legend()
    plt.title('Covariate Balance')
    plt.show()
```

---

## 7. Sensitivity Analysis

### Rosenbaum Bounds
How strong must an unmeasured confounder be to change conclusions?

```python
def rosenbaum_bounds(att, se, gamma_range=np.linspace(1, 3, 21)):
    """
    Gamma = 1: no hidden bias
    Gamma > 1: hidden bias of that magnitude
    """
    from scipy.stats import norm
    
    bounds = []
    for gamma in gamma_range:
        # Upper bound on p-value
        z = norm.ppf(1 - 0.05/2)
        # Simplified: adjust standard error
        gamma_se = se * gamma
        ci_lower = att - z * gamma_se
        ci_upper = att + z * gamma_se
        bounds.append((gamma, ci_lower, ci_upper))
    return bounds
```

### E-Value (VanderWeele & Ding, 2017)
Minimum strength of unmeasured confounder needed to explain away effect.

```python
def e_value(rr, ci_lower=None):
    """
    RR = risk ratio (or OR for rare outcomes)
    E-value = RR + sqrt(RR * (RR - 1))
    """
    if rr < 1:
        rr = 1 / rr
    e_val = rr + np.sqrt(rr * (rr - 1))
    if ci_lower:
        if ci_lower < 1:
            ci_lower = 1 / ci_lower
        e_val_ci = ci_lower + np.sqrt(ci_lower * (ci_lower - 1))
        return e_val, e_val_ci
    return e_val
```

---

## 8. Practical Implementation Checklist

### Before Estimation
- [ ] Define causal question (ATE vs ATT vs CATE)
- [ ] Verify SUTVA plausibility (no interference)
- [ ] Collect sufficient covariates for unconfoundedness
- [ ] Check positivity (overlap in propensity scores)

### Estimation
- [ ] Estimate propensity scores with flexible model
- [ ] Check overlap (trim if necessary)
- [ ] Assess covariate balance (SMD < 0.1)
- [ ] Try multiple estimators (IPW, Matching, DR, TMLE)

### Sensitivity
- [ ] Rosenbaum bounds / E-value
- [ ] Trim extreme propensity scores
- [ ] Check robustness to model specification

### Reporting
- [ ] Report balance tables (Love plots)
- [ ] Report overlap diagnostics
- [ ] Report sensitivity analysis
- [ ] Distinguish ATE vs ATT clearly

---

## 9. Key Takeaways

1. **Potential outcomes** define causal effects as counterfactual contrasts
2. **Fundamental problem**: only one potential outcome observed per unit
3. **Three pillars**: SUTVA + Unconfoundedness + Positivity = Identification
4. **Propensity score** $e(X) = P(W=1|X)$ summarizes all confounding info
5. **Doubly robust** estimators (AIPW, TMLE) are gold standard — consistent if either propensity or outcome model is correct
6. **Balance diagnostics** are essential — check SMD < 0.1
6. **Sensitivity analysis** quantifies robustness to unmeasured confounding
7. **ATE ≠ ATT** — know which you're estimating
7. **No free lunch**: unconfoundedness is untestable assumption