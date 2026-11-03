# Causal Estimation Methods

Comprehensive guide to estimating causal effects: IPW, Matching, Doubly Robust, G-Computation, and modern ML-based approaches.

## 1. Taxonomy of Estimators

```
Causal Estimators
├── Design-Based (Weighting)
│   ├── IPW (Inverse Probability Weighting)
│   ├── AIPW (Augmented IPW / Doubly Robust)
│   ├── Hajek Estimator (Normalized IPW)
│   └── Overlap Weights
├── Model-Based (Outcome Regression)
│   ├── G-Computation (Standardization)
│   ├── Bayesian Additive Regression Trees (BART)
│   └── Causal Forests (GRF)
├── Hybrid (Doubly Robust)
│   ├── AIPW
│   ├── TMLE (Targeted Maximum Likelihood)
│   ├── DR-Learner (Kennedy et al.)
│   └── R-Learner (Nie & Wager)
├── Matching / Subclassification
│   ├── Propensity Score Matching
│   ├── Mahalanobis Distance Matching
│   ├── Coarsened Exact Matching (CEM)
│   ├── Genetic Matching
│   └── Optimal Matching
└── Meta-Learners (CATE Estimation)
    ├── S-Learner (Single model)
    ├── T-Learner (Two models)
    ├── X-Learner (Künzel et al.)
    ├── R-Learner (Robinson transformation)
    └── DR-Learner (Doubly robust)
```

---

## 2. Inverse Probability Weighting (IPW)

### Basic IPW (Horvitz-Thompson)
$$\hat{\tau}_{IPW} = \frac{1}{N} \sum_{i=1}^N \left[ \frac{W_i Y_i}{\hat{e}(X_i)} - \frac{(1-W_i) Y_i}{1-\hat{e}(X_i)} \right]$$

### Stabilized IPW (Hájek Estimator)
Normalize weights to reduce variance:

$$\hat{\tau}_{SIPW} = \frac{\sum W_i Y_i / \hat{e}(X_i)}{\sum W_i / \hat{e}(X_i)} - \frac{\sum (1-W_i) Y_i / (1-\hat{e}(X_i))}{\sum (1-W_i) / (1-\hat{e}(X_i))}$$

### Overlap Weights (Li et al., 2018)
Optimal for ATE with best balance:

$$w_i = W_i (1-\hat{e}(X_i)) + (1-W_i) \hat{e}(X_i)$$

```python
def compute_weights(w, e_hat, method='ipw'):
    if method == 'ipw':
        return w / e_hat + (1 - w) / (1 - e_hat)
    elif method == 'stabilized':
        sw1 = np.sum(w / e_hat)
        sw0 = np.sum((1 - w) / (1 - e_hat))
        return w / e_hat / sw1 + (1 - w) / (1 - e_hat) / sw0
    elif method == 'overlap':
        return w * (1 - e_hat) + (1 - w) * e_hat
    elif method == 'matching_weights':
        return np.minimum(e_hat, 1 - e_hat) / (w * e_hat + (1 - w) * (1 - e_hat))
    elif method == 'entropy_weights':
        # Minimize entropy subject to balance
        pass
```

### Weight Truncation
```python
def truncate_weights(weights, percentile=99):
    cap = np.percentile(weights, percentile)
    return np.minimum(weights, cap)
```

---

## 3. Matching Methods

### 3.1 Propensity Score Matching
```python
from sklearn.neighbors import NearestNeighbors

def psm_att(y, w, e_hat, k=1, caliper=None, replace=False):
    treated = np.where(w == 1)[0]
    control = np.where(w == 0)[0]
    
    nn = NearestNeighbors(n_neighbors=1, metric='euclidean')
    nn.fit(e_hat[control].reshape(-1, 1))
    
    distances, indices = nn.kneighbors(e_hat[treated].reshape(-1, 1))
    
    if caliper:
        mask = distances.flatten() <= caliper
        treated = treated[mask]
        indices = indices[mask]
    
    matched_control = control[indices.flatten()]
    att = np.mean(y[treated] - y[matched_control])
    
    return att, treated, matched_control
```

### 3.2 Mahalanobis Distance Matching
```python
def mahalanobis_matching(y, w, X, k=1):
    from scipy.spatial.distance import mahalanobis
    
    treated = np.where(w == 1)[0]
    control = np.where(w == 0)[0]
    
    # Covariance matrix
    VI = np.linalg.inv(np.cov(X.T))
    
    matched = []
    for t in treated:
        dists = [mahalanobis(X[t], X[c], VI) for c in control]
        idx = np.argsort(dists)[:k]
        matched.append(control[idx[0]])
    
    matched = np.array(matched)
    att = np.mean(y[treated] - y[matched])
    return att
```

### 3.3 Coarsened Exact Matching (CEM)
```python
def cem_matching(y, w, X, n_bins=10):
    # Coarsen covariates
    X_binned = X.copy()
    for col in X.columns:
        X_binned[col] = pd.qcut(X[col], q=n_bins, labels=False, duplicates='drop')
    
    # Exact matching on coarsened vars
    X_binned['w'] = w
    grouped = X_binned.groupby(list(X_binned.columns)).size().reset_index(name='count')
    
    # Keep strata with both treated and control
    treated_strata = grouped[grouped['w'] == 1]
    control_strata = grouped[grouped['w'] == 0]
    
    # Match on strata
    matched = pd.merge(treated_strata, control_strata, on=list(X.columns))
    
    # Weight by stratum size
    weights = matched['count_x'] * matched['count_y'] / (matched['count_x'] + matched['count_y'])
    
    return weights
```

### 3.3 Genetic Matching (Diamond & Sekhon)
```python
# Uses genetic algorithm to optimize balance
from rpy2.robjects.packages import importr
# MatchIt::GenMatch() in R
```

---

## 4. Outcome Regression / G-Computation

### Basic G-Computation
```python
def g_computation_ate(y, w, X, model_class=RandomForestRegressor, **kwargs):
    # Fit models
    m1 = model_class(**kwargs).fit(X[w==1], y[w==1])
    m0 = model_class(**kwargs).fit(X[w==0], y[w==0])
    
    # Predict for all
    mu1 = m1.predict(X)
    mu0 = m0.predict(X)
    
    return np.mean(mu1 - mu0)

def g_computation_att(y, w, X, **kwargs):
    m1 = RandomForestRegressor().fit(X[w==1], y[w==1])
    m0 = RandomForestRegressor().fit(X[w==0], y[w==0])
    
    mu1 = m1.predict(X[w==1])
    mu0 = m0.predict(X[w==1])
    
    return np.mean(mu1 - mu0)
```

### Bayesian Additive Regression Trees (BART)
```python
# Excellent for causal inference - handles non-linearity, interactions, uncertainty
from bartpy.sklearnmodel import BART

def bart_g_computation(y, w, X):
    bart = BART()
    bart.fit(np.column_stack([X, w]), y)
    
    # Predict under treatment and control
    X1 = np.column_stack([X, np.ones(len(X))])
    X0 = np.column_stack([X, np.zeros(len(X))])
    
    mu1 = bart.predict(X1)
    mu0 = bart.predict(X0)
    
    return np.mean(mu1 - mu0), mu1 - mu0  # ATE + CATE
```

---

## 5. Doubly Robust Estimation

### 5.1 Augmented IPW (AIPW)
$$\hat{\tau}_{AIPW} = \frac{1}{N} \sum \left[ \hat{\mu}_1(X) - \hat{\mu}_0(X) + \frac{W(Y - \hat{\mu}_1(X))}{\hat{e}(X)} - \frac{(1-W)(Y - \hat{\mu}_0(X))}{1-\hat{e}(X)} \right]$$

```python
def aipw_ate(y, w, X, propensity_model, outcome_model, cross_fit=True):
    if cross_fit:
        return cross_fit_aipw(y, w, X, propensity_model, outcome_model)
    
    # Simple version (no cross-fitting)
    e_hat = propensity_model.predict_proba(X)[:, 1]
    mu1 = outcome_model.mu1.predict(X)
    mu0 = outcome_model.mu0.predict(X)
    
    ipw_term = w * (y - mu1) / e_hat - (1 - w) * (y - mu0) / (1 - e_hat)
    reg_term = mu1 - mu0
    
    return np.mean(reg_term + ipw_term)

def cross_fit_aipw(y, w, X, propensity_model, outcome_model, n_folds=5):
    from sklearn.model_selection import KFold
    
    kf = KFold(n_splits=n_folds, shuffle=True, random_state=42)
    aipw_estimates = []
    
    for train_idx, test_idx in kf.split(X):
        # Fit on training fold
        propensity_model.fit(X[train_idx], w[train_idx])
        outcome_model.fit(X[train_idx], y[train_idx], w[train_idx])
        
        # Predict on test fold
        e_hat = propensity_model.predict_proba(X[test_idx])[:, 1]
        mu1 = outcome_model.mu1.predict(X[test_idx])
        mu0 = outcome_model.mu0.predict(X[test_idx])
        
        ipw_term = (w[test_idx] * (y[test_idx] - mu1) / e_hat - 
                    (1 - w[test_idx]) * (y[test_idx] - mu0) / (1 - e_hat))
        reg_term = mu1 - mu0
        
        aipw_estimates.append(np.mean(reg_term + ipw_term))
    
    return np.mean(aipw_estimates), np.std(aipw_estimates) / np.sqrt(len(aipw_estimates))
```

### 5.2 Targeted Maximum Likelihood Estimation (TMLE)
```python
class TMLE:
    def __init__(self, propensity_model, outcome_model):
        self.g = propensity_model  # P(W=1|X)
        self.Q = outcome_model     # E[Y|W,X]
    
    def fit(self, X, w, y):
        # 1. Initial outcome estimates
        mu1 = self.Q.mu1.predict(X)
        mu0 = self.Q.mu0.predict(X)
        
        # 2. Propensity scores
        g = self.g.predict_proba(X)[:, 1]
        
        # 3. Clever covariate
        H = w / g - (1 - w) / (1 - g)
        
        # 4. Fluctuation submodel: logit(Q*) = logit(Q) + epsilon * H
        # For continuous Y: linear fluctuation
        epsilon = np.sum(H * (y - (w * mu1 + (1-w) * mu0))) / np.sum(H**2)
        
        # 5. Updated predictions
        Q1_star = mu1 + epsilon / g
        Q0_star = mu0 - epsilon / (1 - g)
        
        # 6. ATE
        self.ate = np.mean(Q1_star - Q0_star)
        return self.ate
```

### 5.3 Doubly Robust Learners (Kennedy et al., 2017)
```python
class DRLearner:
    """
    Doubly robust CATE estimation
    """
    def __init__(self, propensity_model, outcome_model):
        self.propensity = propensity_model
        self.outcome = outcome_model
    
    def fit(self, X, w, y):
        # Cross-fitted nuisance estimates
        mu1, mu0, e = self._cross_fit_nuisance(X, w, y)
        
        # Pseudo-outcome (doubly robust)
        pseudo = (mu1 - mu0) + w * (y - mu1) / e - (1 - w) * (y - mu0) / (1 - e)
        
        # Regress pseudo-outcome on X
        self.cate_model = RandomForestRegressor(n_estimators=500, max_depth=5)
        self.cate_model.fit(X, pseudo)
    
    def predict(self, X):
        return self.cate_model.predict(X)
    
    def _cross_fit_nuisance(self, X, w, y, n_folds=5):
        kf = KFold(n_splits=n_folds)
        mu1 = np.zeros(len(X))
        mu0 = np.zeros(len(X))
        e = np.zeros(len(X))
        
        for train, test in kf.split(X):
            # Fit on train
            self.propensity.fit(X[train], w[train])
            m1 = RandomForestRegressor().fit(X[train][w[train]==1], y[train][w[train]==1])
            m0 = RandomForestRegressor().fit(X[train][w[train]==0], y[train][w[train]==0])
            
            # Predict on test
            e[test] = self.propensity.predict_proba(X[test])[:, 1]
            mu1[test] = m1.predict(X[test])
            mu0[test] = m0.predict(X[test])
        
        return mu1, mu0, e
```

---

## 6. Meta-Learners for CATE

### 6.1 S-Learner (Single Model)
```python
class SLearner:
    def __init__(self, model=RandomForestRegressor(n_estimators=500)):
        self.model = model
    
    def fit(self, X, w, y):
        X_aug = np.column_stack([X, w])
        self.model.fit(X_aug, y)
    
    def predict_cate(self, X):
        X1 = np.column_stack([X, np.ones(len(X))])
        X0 = np.column_stack([X, np.zeros(len(X))])
        return self.model.predict(X1) - self.model.predict(X0)
```

### 6.2 T-Learner (Two Models)
```python
class TLearner:
    def __init__(self, model=RandomForestRegressor()):
        self.m1 = clone(model)
        self.m0 = clone(model)
    
    def fit(self, X, w, y):
        self.m1.fit(X[w==1], y[w==1])
        self.m0.fit(X[w==0], y[w==0])
    
    def predict_cate(self, X):
        return self.m1.predict(X) - self.m0.predict(X)
```

### 6.3 X-Learner (Künzel et al., 2019)
```python
class XLearner:
    def __init__(self, model=RandomForestRegressor()):
        self.m1 = clone(model)
        self.m0 = clone(model)
        self.tau1 = clone(model)
        self.tau0 = clone(model)
        self.propensity = LogisticRegression()
    
    def fit(self, X, w, y):
        # Stage 1: T-Learner
        self.m1.fit(X[w==1], y[w==1])
        self.m0.fit(X[w==0], y[w==0])
        
        # Stage 2: Impute counterfactuals
        tau1 = y[w==1] - self.m0.predict(X[w==1])
        tau0 = self.m1.predict(X[w==0]) - y[w==0]
        
        self.tau1.fit(X[w==1], tau1)
        self.tau0.fit(X[w==0], tau0)
        
        # Propensity score for weighting
        self.propensity.fit(X, w)
    
    def predict_cate(self, X):
        e = self.propensity.predict_proba(X)[:, 1]
        tau1 = self.tau1.predict(X)
        tau0 = self.tau0.predict(X)
        return e * tau0 + (1 - e) * tau1
```

### 6.4 R-Learner (Robinson Transformation)
```python
class RLearner:
    def __init__(self, model=RandomForestRegressor()):
        self.m = clone(model)  # m(X) = E[Y|X]
        self.e = clone(model)  # e(X) = E[W|X]
        self.tau = clone(model)
    
    def fit(self, X, w, y):
        # Stage 1: Estimate nuisance
        self.m.fit(X, y)
        self.e.fit(X, w)
        
        # Stage 2: Orthogonalized
        m_hat = self.m.predict(X)
        e_hat = self.e.predict_proba(X)[:, 1]
        
        # Robinson transformation
        y_tilde = y - m_hat
        w_tilde = w - e_hat
        
        # Stage 3: Regress residual on residual
        self.tau.fit(w_tilde.reshape(-1, 1), y_tilde)
    
    def predict_cate(self, X):
        return self.tau.predict(np.ones((len(X), 1)))
```

---

## 7. Modern ML-Based Methods

### 7.1 Causal Forests (Generalized Random Forests)
```python
from econml.grf import CausalForest

cf = CausalForest(n_estimators=2000, min_samples_leaf=10, 
                  max_depth=10, honest=True)
cf.fit(X, w, y)

# CATE estimates
cate = cf.predict(X)
ci = cf.predict_ci(X, alpha=0.05)
```

### 7.2 Orthogonal Random Forests
```python
from econml.orf import DMLOrthoForest

orf = DMLOrthoForest(
    n_trees=500,
    min_leaf_size=10,
    max_depth=20,
    model_Y=RandomForestRegressor(),
    model_T=RandomForestClassifier(),
    model_Y_final=RandomForestRegressor(),
    model_T_final=RandomForestRegressor()
)
orf.fit(y, w, X=X, W=None)

cate = orf.predict(X)
```

### 7.3 Double ML (Chernozhukov et al.)
```python
from econml.dml import LinearDML, SparseLinearDML, KernelDML

dml = LinearDML(
    model_y=RandomForestRegressor(),
    model_t=RandomForestClassifier(),
    discrete_treatment=True,
    cv=5
)
dml.fit(y, w, X=X)

cate = dml.effect(X)
ci = dml.effect_interval(X, alpha=0.05)
```

### 7.4 DR-Learner (Kennedy, 2020)
```python
from econml.dr import DRLearner

dr = DRLearner(
    model_regression=RandomForestRegressor(),
    model_propensity=RandomForestClassifier(),
    cv=5
)
dr.fit(y, w, X=X)

cate = dr.effect(X)
```

---

## 8. Evaluating CATE Estimators

### Metrics
```python
def evaluate_cate(cate_true, cate_pred, w, y):
    # MSE on CATE (if ground truth available)
    mse = np.mean((cate_true - cate_pred)**2)
    
    # QINI coefficient (ranking quality)
    from sklearn.metrics import auc
    n = len(cate_pred)
    order = np.argsort(cate_pred)[::-1]
    qini = auc(range(n+1), [0] + np.cumsum(y[order] * w[order] - y[order] * (1-w[order])))
    
    # AUUC (Area Under Uplift Curve)
    # ...
    
    return {'mse': mse, 'qini': qini}

# Policy-based evaluation
def policy_value(cate_pred, w, y, threshold=0):
    treat = (cate_pred > threshold).astype(int)
    # IPW estimate of policy value
    return np.mean(treat * w * y / 0.5 - (1-treat) * (1-w) * y / 0.5)
```

---

## 9. Implementation with EconML

```python
# Install: pip install econml

from econml.dml import LinearDML, SparseLinearDML
from econml.dr import DRLearner
from econml.orf import DMLOrthoForest
from econml.grf import CausalForest
from econml.meta import DRRegressor, XLearner, TLearner, SLearner

# Quick comparison
estimators = {
    'DML': LinearDML(cv=5),
    'DR': DRLearner(cv=5),
    'OrthoForest': DMLOrthoForest(),
    'CausalForest': CausalForest(),
    'XLearner': XLearner(models=[RandomForestRegressor()]*4),
    'TLearner': TLearner(models=[RandomForestRegressor()]*2),
    'SLearner': SLearner(RandomForestRegressor()),
}

results = {}
for name, est in estimators.items():
    est.fit(y, w, X=X)
    cate = est.effect(X)
    results[name] = cate
```

---

## 9. Practical Guidelines

### Choosing an Estimator
| Scenario | Recommended |
|----------|-------------|
| **ATE, good overlap** | AIPW / TMLE / CQL |
| **ATE, poor overlap** | Overlap weights / Matching |
| **CATE, large sample** | Causal Forest / Orthogonal Forest / DR-Learner |
| **CATE, small sample** | BART / X-Learner |
| **High-dimensional X** | Sparse DML / Lasso-based |
| **Time-varying treatment** | Longitudinal TMLE / SNMM |
| **Instrumental Variables** | IV-DML / DeepIV |

### Cross-Fitting (Essential for ML-based estimators)
```python
def cross_fit(nu, X, w, y, model, n_folds=5):
    kf = KFold(n_splits=n_folds)
    pred = np.zeros(len(X))
    for train, test in kf.split(X):
        model.fit(X[train], w[train], y[train])
        pred[test] = model.predict(X[test])
    return pred
```

---

## 10. Key Takeaways

1. **IPW** is simple but unstable with poor overlap
2. **Doubly Robust (AIPW, TMLE)** is gold standard — consistent if either propensity or outcome model is correct
3. **Cross-fitting** is essential for ML-based nuisance estimation to avoid overfitting bias
4. **Meta-learners** (X, R, DR) enable CATE estimation with any base learner
5. **Causal Forests / Orthogonal Forests** provide honest inference and confidence intervals
6. **Balance checking** (SMD < 0.1) is non-negotiable for any weighting/matching method
6. **Sensitivity analysis** should accompany every causal estimate
7. **EconML** provides production-ready implementations of modern methods