# A/B Testing Platform

A comprehensive platform for running, analyzing, and managing controlled experiments at scale.

## 1. Experiment Design Framework

### 1.1 Experiment Taxonomy
```
A/B Testing Platform
├── Experiment Types
│   ├── A/B Test (Two variants)
│   ├── A/B/n Test (Multiple variants)
│   ├── Multivariate (MVT) - Factorial design
│   ├── Bandit/Adaptive (MAB, Thompson Sampling)
│   ├── Sequential (SPRT, mSPRT, Group Sequential)
│   └── Switchback (Time-based randomization)
├── Randomization Units
│   ├── User-level
│   ├── Session-level
│   ├── Request-level
│   ├── Geo/Market-level
│   └── Cluster/Network-level
├── Analysis Methods
│   ├── Frequentist (t-test, z-test, ANOVA)
│   ├── Bayesian (HDI, ROPE, Bayes Factor)
│   ├── Sequential (SPRT, mSPRT, Group Sequential)
│   └── Causal (CUPED, Synthetic Control)
└── Variance Reduction
    ├── CUPED (Controlled Experiment Using Pre-Experiment Data)
    ├── Stratification
    ├── Winsorization/Trimming
    └── Control Variates
```

### 1.2 Experiment Lifecycle
```
┌─────────────────────────────────────────────────────────────────┐
│                    EXPERIMENT LIFECYCLE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. IDEATION          2. DESIGN          3. IMPLEMENTATION       │
│  ┌─────────────┐     ┌─────────────┐   ┌─────────────┐          │
│  │ Hypothesis  │     │ Sample Size │   │ Feature     │          │
│  │ Metrics     │     │ Power Calc  │   │ Flags       │          │
│  │ Guardrails  │     │ Randomization│  │ Assignment  │          │
│  └─────────────┘     └─────────────┘   └─────────────┘          │
│         │                  │                  │                  │
│         ▼                  ▼                  ▼                  │
│  4. LAUNCH          5. MONITOR         6. ANALYZE               │
│  ┌─────────────┐     ┌─────────────┐   ┌─────────────┐          │
│  │ Ramp Up     │     │ Health      │   │ Statistical │          │
│  │ Canary      │     │ Metrics     │   │ Tests       │          │
│  │ Rollback    │     │ Alerts      │   │ Segmentation│          │
│  └─────────────┘     └─────────────┘   └─────────────┘          │
│         │                  │                  │                  │
│         ▼                  ▼                  ▼                  │
│  7. DECIDE         8. DOCUMENT        9. ITERATE               │
│  ┌─────────────┐     ┌─────────────┐   ┌─────────────┐          │
│  │ Ship/Kill/  │     │ Knowledge   │   │ New         │          │
│  │ Iterate     │     │ Base        │   │ Hypotheses  │          │
│  └─────────────┘     └─────────────┘   └─────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Sample Size & Power Calculation

### 2.1 Frequentist Power Analysis
```python
import numpy as np
from scipy import stats

def sample_size_proportion(
    baseline_rate: float,
    minimum_detectable_effect: float,  # Relative (e.g., 0.05 = 5%)
    alpha: float = 0.05,
    power: float = 0.8,
    ratio: float = 1.0  # Treatment:Control ratio
) -> int:
    """
    Sample size for two-proportion z-test
    """
    p1 = baseline_rate
    p2 = baseline_rate * (1 + minimum_detectable_effect)
    
    # Pooled proportion
    p_pool = (p1 + ratio * p2) / (1 + ratio)
    
    # Z-scores
    z_alpha = stats.norm.ppf(1 - alpha / 2)
    z_beta = stats.norm.ppf(power)
    
    # Sample size per group
    n_per_group = (
        (z_alpha * np.sqrt(2 * p_pool * (1 - p_pool)) + 
         z_beta * np.sqrt(p1 * (1 - p1) + ratio * p2 * (1 - p2))) ** 2
    ) / ((p2 - p1) ** 2 * ratio)
    
    return int(np.ceil(n_per_group))

def sample_size_continuous(
    baseline_mean: float,
    baseline_std: float,
    minimum_detectable_effect: float,  # Absolute
    alpha: float = 0.05,
    power: float = 0.8,
    ratio: float = 1.0
) -> int:
    """Sample size for two-sample t-test (continuous metric)"""
    effect_size = minimum_detectable_effect / baseline_std
    
    z_alpha = stats.norm.ppf(1 - alpha / 2)
    z_beta = stats.norm.ppf(power)
    
    n_per_group = 2 * (z_alpha + z_beta) ** 2 / (effect_size ** 2) * (1 + 1/ratio)
    return int(np.ceil(n_per_group))
```

### 2.2 Sequential Testing Boundaries (SPRT)
```python
# Sequential Probability Ratio Test (Wald, 1945)
class SPRT:
    def __init__(self, alpha=0.05, beta=0.2, p0=0.5, p1=0.55):
        """
        H0: p = p0 (no effect)
        H1: p = p1 (minimum effect)
        """
        self.p0 = p0
        self.p1 = p1
        self.alpha = alpha
        self.beta = beta
        
        # Boundaries
        self.A = (1 - beta) / alpha      # Upper bound (accept H1)
        self.B = beta / (1 - alpha)      # Lower bound (accept H0)
        
        self.log_A = np.log(self.A)
        self.log_B = np.log(self.B)
    
    def update(self, successes: int, trials: int) -> str:
        """
        Returns: 'accept_H1', 'accept_H0', or 'continue'
        """
        # Likelihood ratio
        ll = successes * np.log(self.p1 / self.p0) + \
             (trials - successes) * np.log((1 - self.p1) / (1 - self.p0))
        
        if ll >= self.log_A:
            return 'accept_H1'  # Reject H0
        elif ll <= self.log_B:
            return 'accept_H0'  # Fail to reject H0
        else:
            return 'continue'

# Mixture SPRT (mSPRT) - for composite alternatives
class mSPRT:
    def __init__(self, alpha=0.05, prior='beta', prior_params=(1, 1)):
        self.alpha = alpha
        self.prior = prior
        self.prior_params = prior_params
    
    def update(self, x: np.ndarray, n: int) -> float:
        """Returns Bayes factor"""
        if self.prior == 'beta':
            a, b = self.prior_params
            # Marginal likelihood under H1 (beta-binomial)
            from scipy.special import betaln
            log_m1 = betaln(x + a, n - x + b) - betaln(a, b)
            log_m0 = np.log(stats.binom.pmf(x, n, 0.5))
            return np.exp(log_m1 - log_m0)
```

### 2.3 Group Sequential Design (Lan-DeMets)
```python
# Group Sequential Design with Lan-DeMets alpha spending
class GroupSequential:
    def __init__(self, alpha=0.05, k=5, spending='obf'):
        """
        spending: 'obf' (O'Brien-Fleming), 'pocock', 'power' (rho=3)
        """
        self.alpha = alpha
        self.k = k
        self.spending = spending
        self.boundaries = self._compute_boundaries()
    
    def _compute_boundaries(self):
        from scipy.stats import norm
        # Alpha spending function
        if self.spending == 'obf':
            # O'Brien-Fleming: alpha(t) = 2 - 2Φ(z_α/2/√t)
            pass
        # Returns critical z-values at each look
        return boundaries
    
    def check_boundary(self, z_stat: float, look: int) -> str:
        """Returns 'stop_reject', 'stop_accept', 'continue'"""
        upper, lower = self.boundaries[look]
        if z_stat >= upper:
            return 'stop_reject'
        elif z_stat <= lower:
            return 'stop_accept'
        return 'continue'
```

---

## 3. CUPED (Controlled Experiment Using Pre-Experiment Data)

### 3.1 CUPED Theory
```python
def cuped_adjustment(
    y: np.ndarray,           # Outcome (post-experiment)
    x: np.ndarray,           # Pre-experiment covariate
    w: np.ndarray            # Treatment indicator (0/1)
) -> tuple:
    """
    CUPED adjustment reduces variance by using pre-experiment data
    
    Y_cv = Y - θ(X - E[X])
    where θ = Cov(Y, X) / Var(X)
    """
    # Compute theta using control group only
    control_mask = (w == 0)
    x_control = x[control_mask]
    y_control = y[control_mask]
    
    theta = np.cov(y_control, x_control)[0, 1] / np.var(x_control)
    
    # Adjusted outcome
    y_cv = y - theta * (x - np.mean(x))
    
    return y_cv, theta

def cuped_variance_reduction(y, x, w):
    """Estimate variance reduction factor"""
    theta = np.cov(y[w==0], x[w==0])[0, 1] / np.var(x[w==0])
    rho = np.corrcoef(y[w==0], x[w==0])[0, 1]
    variance_reduction = 1 - (1 - rho**2)
    return variance_reduction, theta

# CUPED with multiple covariates (linear regression)
def cuped_multiple_covariates(y, X, w):
    """X: (n, p) matrix of pre-experiment covariates"""
    from sklearn.linear_model import LinearRegression
    
    control_mask = (w == 0)
    reg = LinearRegression().fit(X[control_mask], y[control_mask])
    
    y_pred = reg.predict(X)
    y_cv = y - (y_pred - np.mean(y_pred))
    
    # Variance reduction
    r2 = reg.score(X[control_mask], y[control_mask])
    return y_cv, r2
```

### 3.2 CUPED in Practice
```python
class CUPEDExperiment:
    def __init__(self, pre_period_days=14):
        self.pre_period_days = pre_period_days
    
    def prepare_data(self, experiment_data, pre_experiment_data):
        """
        experiment_data: (user_id, variant, outcome, timestamp)
        pre_experiment_data: (user_id, pre_outcome, timestamp)
        """
        # Merge pre-experiment data
        merged = experiment_data.merge(
            pre_experiment_data.groupby('user_id')['outcome'].mean()
            .reset_index().rename(columns={'outcome': 'pre_outcome'}),
            on='user_id',
            how='left'
        )
        
        # Fill missing pre-outcomes with global mean
        merged['pre_outcome'] = merged['pre_outcome'].fillna(
            pre_experiment_data['outcome'].mean()
        )
        
        return merged
    
    def analyze(self, data):
        """Analyze with CUPED adjustment"""
        y = data['outcome'].values
        x = data['pre_outcome'].values
        w = data['variant'].values
        
        y_cv, theta = cuped_adjustment(y, x, w)
        
        # Standard t-test on adjusted outcomes
        from scipy.stats import ttest_ind
        t_stat, p_val = ttest_ind(
            y_cv[data['variant']==1],
            y_cv[data['variant']==0]
        )
        
        # Also compute CUPED variance reduction
        vr = 1 - np.var(y_cv) / np.var(y)
        
        return {
            'p_value': p_val,
            'theta': theta,
            'variance_reduction': vr,
            'effect_size': np.mean(y_cv[w==1]) - np.mean(y_cv[w==0])
        }
```

---

## 4. Network Effects & Interference

### 4.1 Interference Types
```python
# Types of interference in networked experiments
class InterferenceTypes:
    """
    1. Direct spillover: Treated unit affects neighbor's outcome
    2. Congestion: Treatment increases competition for resources
    3. Social influence: Behavior spreads through network
    4. Market interference: Price/quantity effects in two-sided markets
    """
    pass

# Network interference bias
def interference_bias(y, w, adjacency_matrix):
    """
    Estimate bias from network interference
    Bias = E[Y|W, neighbors treated] - E[Y|W, no neighbors treated]
    """
    n = len(y)
    bias_estimates = []
    
    for i in range(n):
        treated_neighbors = adjacency_matrix[i] @ w
        if treated_neighbors > 0 and w[i] == 0:
            # Control unit with treated neighbors
            bias_estimates.append(y[i])
    
    return np.mean(bias_estimates) if bias_estimates else 0

# Cluster randomization (experiment at cluster level)
def cluster_randomization(units, clusters, treatment_prob=0.5):
    """Randomize at cluster level to avoid interference"""
    unique_clusters = np.unique(clusters)
    n_clusters = len(unique_clusters)
    
    treated_clusters = np.random.choice(
        unique_clusters, 
        size=int(n_clusters * treatment_prob), 
        replace=False
    )
    
    treatment = np.isin(clusters, treated_clusters)
    return treatment

# Cluster-robust standard errors
def cluster_robust_se(y, w, X, clusters):
    """Cluster-robust standard errors (Liang-Zeger)"""
    import statsmodels.api as sm
    import numpy as np
    
    model = sm.OLS(y, sm.add_constant(X)).fit()
    
    # Cluster-robust covariance
    clusters_unique = np.unique(clusters)
    n_clusters = len(clusters_unique)
    n_params = X.shape[1] + 1
    
    # Meat matrix
    u = model.resid
    meat = np.zeros((n_params, n_params))
    
    for c in clusters_unique:
        mask = (clusters == c)
        X_c = sm.add_constant(X[mask])
        u_c = u[mask]
        meat += X_c.T @ np.outer(u_c, u_c) @ X_c
    
    bread = np.linalg.inv(X.T @ X)
    vcov = bread @ meat @ bread * (n_clusters / (n_clusters - 1)) * (len(y) / (len(y) - n_params))
    
    return np.sqrt(np.diag(vcov))
```

### 4.2 Network Experiment Designs
```python
# Ego-cluster randomization (Eckles et al., 2017)
def ego_cluster_randomization(adjacency, treatment_prob=0.5):
    """
    Randomize ego networks to minimize interference
    """
    n = adjacency.shape[0]
    unassigned = set(range(n))
    clusters = []
    
    while unassigned:
        # Pick random seed
        seed = np.random.choice(list(unassigned))
        # Form ego cluster (seed + neighbors)
        ego_cluster = {seed} | set(np.where(adjacency[seed])[0])
        ego_cluster &= unassigned
        clusters.append(list(ego_cluster))
        unassigned -= ego_cluster
    
    # Randomize clusters
    n_clusters = len(clusters)
    treated = np.random.choice(n_clusters, int(n_clusters * 0.5), replace=False)
    
    treatment = np.zeros(n)
    for i, cluster in enumerate(clusters):
        treatment[cluster] = int(i in treated)
    
    return treatment

# Synthetic control for network experiments
def synthetic_control_network(treated_unit, control_units, pre_periods, adjacency):
    """
    Construct synthetic control using network structure
    """
    from sklearn.linear_model import Ridge
    
    # Features: pre-period outcomes of connected units
    X = pre_periods[control_units].T  # (T0, N_control)
    y = pre_periods[treated_unit]     # (T0,)
    
    # Ridge regression for weights
    model = Ridge(alpha=1.0, fit_intercept=False)
    model.fit(X, y)
    weights = np.maximum(model.coef_, 0)  # Non-negative
    weights = weights / weights.sum()
    
    return weights
```

---

## 5. Experiment Platform Architecture

### 5.1 Platform Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    EXPERIMENT PLATFORM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Experiment  │  │Assignment   │  │  Analysis   │             │
│  │  Registry   │──►│  Service    │──►│  Engine     │             │
│  │             │   │             │   │             │             │
│  │ • Metadata  │   │ • Random    │   │ • Frequentist│           │
│  │ • Hypothesis│   │   Assignment│   │ • Bayesian  │           │
│  │ • Power Calc│   │ • Stickiness│   │ • Sequential│           │
│  └─────────────┘   └─────────────┘   └─────────────┘           │
│         │                │                 │                   │
│         ▼                ▼                 ▼                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  DATA LAYER                               │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │   │
│  │  │Events    │  │Features  │  │Outcomes  │               │   │
│  │  │(Kafka)   │  │(Feast)   │  │(Warehouse)               │   │
│  │  └──────────┘  └──────────┘  └──────────┘               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Assignment Service
```python
class AssignmentService:
    def __init__(self, salt: str = "experiment_salt"):
        self.salt = salt
    
    def assign(self, user_id: str, experiment_id: str, 
               variants: list, weights: list = None) -> str:
        """Deterministic assignment with stickiness"""
        # Hash-based deterministic assignment
        hash_input = f"{experiment_id}:{user_id}:{self.salt}"
        hash_val = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)
        
        # Normalize to [0, 1)
        bucket = (hash_val % 10000) / 10000.0
        
        # Weighted assignment
        if weights is None:
            weights = [1.0 / len(variants)] * len(variants)
        
        cumsum = 0
        for i, w in enumerate(weights):
            cumsum += w
            if bucket < cumsum:
                return variants[i]
        
        return variants[-1]
    
    def get_assignment(self, user_id: str, experiment_id: str) -> str:
        """Retrieve existing assignment (for stickiness)"""
        # Check cache/database for existing assignment
        cached = self.cache.get(f"{experiment_id}:{user_id}")
        if cached:
            return cached
        
        # New assignment
        variant = self.assign(user_id, experiment_id)
        self.cache.set(f"{experiment_id}:{user_id}", variant)
        return variant

# Ramp-up schedule
class RampUpSchedule:
    def __init__(self, start_pct=0.01, target_pct=1.0, duration_days=14):
        self.start_pct = start_pct
        self.target_pct = target_pct
        self.duration_days = duration_days
    
    def get_allocation(self, experiment_start: datetime) -> float:
        days_elapsed = (datetime.now() - experiment_start).days
        if days_elapsed >= self.duration_days:
            return self.target_pct
        
        # Linear ramp
        progress = days_elapsed / self.duration_days
        return self.start_pct + (self.target_pct - self.start_pct) * progress
```

---

## 6. Analysis Engine

### 6.1 Frequentist Analysis
```python
class FrequentistAnalyzer:
    def __init__(self, alpha=0.05):
        self.alpha = alpha
    
    def analyze_proportion(self, control_success, control_total, 
                          treatment_success, treatment_total):
        """Two-proportion z-test"""
        from statsmodels.stats.proportion import proportions_ztest
        
        count = np.array([treatment_success, control_success])
        nobs = np.array([treatment_total, control_total])
        
        stat, pval = proportions_ztest(count, nobs, alternative='two-sided')
        
        # Effect size
        p1 = treatment_success / treatment_total
        p2 = control_success / control_total
        effect = p1 - p2
        rel_effect = effect / p2 if p2 > 0 else 0
        
        # Confidence interval
        se = np.sqrt(p1*(1-p1)/n1 + p2*(1-p2)/n2)
        ci_lower = effect - 1.96 * se
        ci_upper = effect + 1.96 * se
        
        return {
            'p_value': pval,
            'effect': effect,
            'relative_effect': rel_effect,
            'ci_lower': ci_lower,
            'ci_upper': ci_upper,
            'significant': pval < 0.05
        }
    
    def analyze_continuous(self, control_values, treatment_values):
        """Two-sample t-test (Welch's)"""
        from scipy.stats import ttest_ind
        
        stat, pval = ttest_ind(treatment, control, equal_var=False)
        
        effect = np.mean(treatment) - np.mean(control)
        se = np.sqrt(np.var(treatment)/len(treatment) + np.var(control)/len(control))
        ci_lower = effect - 1.96 * np.std(control) / np.sqrt(len(control))
        ci_upper = effect + 1.96 * np.std(treatment) / np.sqrt(len(treatment))
        
        return {
            'p_value': pval,
            'effect': effect,
            'ci_lower': ci_lower,
            'ci_upper': ci_upper
        }
    
    def analyze_cuped(self, y, x, w):
        """CUPED-adjusted analysis"""
        y_cv, theta = cuped_adjustment(y, x, w)
        
        return self.analyze_continuous(
            y_cv[w==0], y_cv[w==1]
        )
```

### 6.2 Bayesian Analysis
```python
class BayesianAnalyzer:
    def __init__(self, prior_alpha=1, prior_beta=1):
        self.prior_alpha = prior_alpha
        self.prior_beta = prior_beta
    
    def analyze_proportion(self, control_success, control_total,
                          treatment_success, treatment_total):
        """Bayesian A/B test with Beta-Binomial model"""
        # Posterior parameters
        alpha_c = self.prior_alpha + control_success
        beta_c = self.prior_beta + control_total - control_success
        
        alpha_t = self.prior_alpha + treatment_success
        beta_t = self.prior_beta + treatment_total - treatment_success
        
        # Probability treatment > control
        n_samples = 100000
        samples_c = np.random.beta(alpha_c, beta_c, n_samples)
        samples_t = np.random.beta(alpha_t, beta_t, n_samples)
        
        prob_better = np.mean(samples_t > samples_c)
        
        # Expected loss
        loss = np.maximum(samples_c - samples_t, 0).mean()
        
        # HDI
        diff = samples_t - samples_c
        hdi_lower = np.percentile(diff, 2.5)
        hdi_upper = np.percentile(diff, 97.5)
        
        return {
            'prob_treatment_better': prob_better,
            'expected_loss': loss,
            'hdi_lower': hdi_lower,
            'hdi_upper': hdi_upper,
            'recommendation': 'implement' if prob_better > 0.95 else 'continue'
        }
    
    def sequential_bayes(self, data_stream, check_interval=100):
        """Sequential Bayesian updating"""
        results = []
        for i, (success, total) in enumerate(data_stream):
            if i % check_interval == 0:
                result = self.analyze_proportion(...)
                results.append(result)
                # Early stopping if prob > 0.99 or < 0.01
                if result['prob_treatment_better'] > 0.99:
                    break
        return results
```

---

## 6. Advanced Analysis

### 6.1 Segmentation Analysis
```python
def segment_analysis(data, segment_col, min_samples=100):
    """Analyze treatment effects by segment"""
    segments = data[segment_col].unique()
    results = {}
    
    for segment in segments:
        seg_data = data[data[segment_col] == segment]
        if len(seg_data) < min_samples:
            continue
        
        # Analyze segment
        control = seg_data[seg_data['variant']==0]['outcome']
        treatment = seg_data[seg_data['variant']==1]['outcome']
        
        if len(control) > 10 and len(treatment) > 10:
            result = analyze_continuous(control, treatment)
            results[segment] = result
    
    return results

# Heterogeneous treatment effects (CATE)
def estimate_cate(data, features, treatment_col, outcome_col):
    """Estimate Conditional Average Treatment Effect"""
    from econml.dml import LinearDML
    from sklearn.ensemble import RandomForestRegressor
    
    X = data[features].values
    w = data[treatment_col].values
    y = data[outcome_col].values
    
    est = LinearDML(
        model_y=RandomForestRegressor(),
        model_t=RandomForestRegressor(),
        cv=5
    )
    est.fit(y, w, X=X)
    
    return est.effect(features)
```

### 6.2 Sensitivity Analysis
```python
def sensitivity_analysis(ate, se, gamma=1.0):
    """
    Rosenbaum sensitivity analysis for unobserved confounding
    gamma = odds ratio of treatment assignment due to unobserved confounder
    """
    from scipy.stats import norm
    
    # Bounds on ATE under confounding
    z = norm.ppf(0.975)
    ci_lower = ate - z * se
    ci_upper = ate + z * se
    
    # Sensitivity: how large must gamma be to change conclusion?
    # Using Rosenbaum bounds
    gamma_critical = 1.0
    for g in np.linspace(1.0, 3.0, 100):
        # Adjusted bounds under gamma
        # Simplified calculation
        adjusted_ci_lower = ci_lower - (g - 1) * se
        adjusted_ci_upper = ci_upper + (g - 1) * se
        
        if adjusted_ci_lower <= 0 <= adjusted_ci_upper:
            gamma_critical = g
            break
    
    return {
        'ate': ate,
        'ci': (ci_lower, ci_upper),
        'gamma_critical': gamma_critical,
        'interpretation': f'Confounding of OR={gamma_critical:.2f} would change conclusion'
    }
```

---

## 7. Experiment Platform Features

### 7.1 Feature Flags & Rollout
```python
class FeatureFlagService:
    def __init__(self):
        self.flags = {}
    
    def create_flag(self, key: str, default: bool = False, 
                    rollout_pct: float = 0.0, targeting_rules: list = None):
        self.flags[key] = {
            'default': default,
            'rollout_pct': rollout_pct,
            'targeting_rules': targeting_rules or [],
            'created_at': datetime.now()
        }
    
    def evaluate(self, flag_key: str, user_context: dict) -> bool:
        flag = self.flags.get(flag_key)
        if not flag:
            return flag.get('default', False)
        
        # Check targeting rules
        for rule in flag['targeting_rules']:
            if self._match_rule(rule, user_context):
                return rule['value']
        
        # Rollout percentage
        if random.random() < flag['rollout_pct']:
            return True
        
        return flag['default']
    
    def ramp_up(self, flag_key: str, target_pct: float, 
                duration_days: int, step_pct: float = 0.1):
        """Gradual rollout"""
        steps = int((flag['rollout_pct'] - flag['rollout_pct']) / step_pct)
        for i in range(steps):
            self.flags[flag_key]['rollout_pct'] += step_pct
            time.sleep(86400 / len(steps))  # Sleep between steps
```

### 6.3 Guardrail Metrics
```python
class GuardrailChecker:
    def __init__(self, guardrails: dict):
        """
        guardrails = {
            'revenue': {'type': 'non_inferiority', 'margin': -0.01},
            'latency_p99': {'type': 'non_inferiority', 'margin': 50},  # ms
            'error_rate': {'type': 'non_inferiority', 'margin': 0.001},
            'user_retention': {'type': 'superiority', 'margin': 0.0}
        }
        """
        self.guardrails = guardrails
    
    def check_guardrails(self, experiment_results):
        violations = []
        for metric, config in self.guardrails.items():
            if metric not in experiment_results:
                continue
            
            result = experiment_results[metric]
            effect = result['effect']
            ci_lower = result['ci_lower']
            
            if config['type'] == 'non_inferiority':
                # Check if lower bound > -margin
                if ci_lower < -config['margin']:
                    violations.append({
                        'metric': metric,
                        'type': 'guardrail_violation',
                        'message': f"{metric} degraded beyond {config['margin']}"
                    })
        
        return violations
```

---

## 8. Experiment Platform Implementation

### 7.1 Platform API
```python
# FastAPI Experiment Platform
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

app = FastAPI()

class ExperimentCreate(BaseModel):
    name: str
    hypothesis: str
    primary_metric: str
    guardrail_metrics: List[str]
    variants: List[str]
    traffic_allocation: float = 1.0
    randomization_unit: str = "user_id"
    min_detectable_effect: float
    power: float = 0.8
    alpha: float = 0.05

class ExperimentResponse(BaseModel):
    id: str
    name: str
    status: str  # draft, running, completed, stopped
    created_at: datetime
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    results: Optional[dict]

@app.post("/experiments", response_model=ExperimentResponse)
async def create_experiment(exp: ExperimentCreate):
    # Validate power calculation
    n = sample_size_proportion(...)
    
    experiment = Experiment(
        id=generate_id(),
        **exp.dict(),
        status="draft",
        created_at=datetime.now()
    )
    await db.experiments.insert(exp)
    return exp

@app.post("/experiments/{exp_id}/start")
async def start_experiment(exp_id: str):
    exp = await db.experiments.find(exp_id)
    exp.status = "running"
    exp.started_at = datetime.now()
    await db.experiments.update(exp)
    return exp

@app.get("/experiments/{exp_id}/results")
async def get_results(exp_id: str):
    exp = await db.experiments.find(exp_id)
    if exp.status != "completed":
        raise HTTPException(400, "Experiment not completed")
    
    results = await analysis_engine.analyze(exp)
    return results

@app.post("/experiments/{exp_id}/stop")
async def stop_experiment(exp_id: str, reason: str):
    exp = await db.experiments.find(exp_id)
    exp.status = "stopped"
    exp.ended_at = datetime.now()
    exp.stop_reason = reason
    await db.experiments.update(exp)
    return exp
```

---

## 9. Platform Evaluation & Monitoring

### 8.1 Platform Health Metrics
```python
class PlatformMetrics:
    def __init__(self):
        self.metrics = {}
    
    def track_experiment_health(self, experiment_id: str):
        """Monitor experiment health in real-time"""
        metrics = {
            'sample_size_per_variant': get_sample_sizes(experiment_id),
            'conversion_rates': get_conversion_rates(experiment_id),
            'srrm': compute_srrm(experiment_id),  # Sample Ratio Mismatch
            'assignment_balance': check_balance(experiment_id),
            'latency_p99': get_latency_p99(experiment_id),
            'error_rate': get_error_rate(experiment_id)
        }
        
        # Alerts
        alerts = []
        if metrics['srrm'] > 0.01:
            alerts.append("SRRM > 1% - possible assignment bug")
        if metrics['assignment_balance'] > 0.05:
            alerts.append("Assignment imbalance > 5%")
        
        return {'metrics': metrics, 'alerts': alerts}

# Sample Ratio Mismatch (SRRM)
def compute_srrm(expected_props, observed_counts):
    """Check if assignment ratios match expected"""
    total = sum(observed_counts)
    expected = [p * total for p in expected_props]
    chi2 = sum((o - e)**2 / e for o, e in zip(observed_counts, expected))
    p_value = 1 - stats.chi2.cdf(chi2, df=len(expected_props)-1)
    return p_value
```

---

## 9. Key Takeaways

1. **Power calculation first** — determine sample size before launch
2. **CUPED** can reduce variance by 20-50% using pre-experiment data
3. **Sequential testing** (SPRT/mSPRT) enables early stopping
4. **Network interference** requires cluster randomization or ego-clusters
5. **CUPED + Sequential** = Maximum efficiency
5. **Guardrails** protect against shipping harmful changes
6. **Segmentation** reveals heterogeneous effects
7. **Bayesian** provides intuitive probability statements
8. **Platform features**: Feature flags, ramp-up, guardrails, segmentation
9. **Automation** = Experiment API + Analysis Engine + Monitoring
10. **Documentation** = Knowledge base for organizational learning