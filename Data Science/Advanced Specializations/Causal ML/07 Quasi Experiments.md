# Quasi-Experiments

Quasi-experimental methods estimate causal effects when random assignment is not possible, using natural or designed variations in treatment assignment.

## 1. Quasi-Experiment Taxonomy

```
Quasi-Experiments
├── Instrumental Variables (IV)
│   ├── 2SLS / 2SRI
│   ├── LATE / LATT
│   └── Weak IV / Many IV
├── Regression Discontinuity (RD)
│   ├── Sharp RD
│   ├── Fuzzy RD
│   ├── Kink RD
│   └── Geographic RD
├── Difference-in-Differences (DiD)
│   ├── Standard DiD
│   ├── Event Study
│   ├── Staggered Adoption (Callaway-Sant'Anna)
│   ├── Synthetic DiD
│   └── Matrix Completion
├── Synthetic Control
│   ├── Classic SCM
│   ├── Augmented SCM
│   └── Generalized SCM
├── Matching / Weighting
│   ├── PSM / CBPS
│   ├── Entropy Balancing
│   └── Coarsened Exact Matching
└── Natural Experiments
    ├── Policy Changes
    ├── Natural Disasters
    ├── Birth Date Cutoffs
    └── Lotteries
```

---

## 2. Instrumental Variables (IV)

### 2.1 IV Assumptions
1. **Relevance**: $Cov(Z, D) \neq 0$ (Instrument affects treatment)
2. **Exclusion**: $Z \perp\!\!\!\perp Y | D, X$ (Instrument only affects outcome through treatment)
3. **Independence**: $Z \perp\!\!\!\perp (Y(0), Y(1)) | X$ (Instrument is exogenous)
4. **Monotonicity**: $D_i(1) \geq D_i(0)$ for all $i$ (No defiers)

### 2.2 Two-Stage Least Squares (2SLS)
```python
from linearmodels.iv import IV2SLS
import statsmodels.api as sm

# First stage: D = Z*pi + X*gamma + v
# Second stage: Y = D*beta + X*alpha + u

model = IV2SLS(dependent=y, exog=X, endog=d, instruments=z)
results = model.fit()
print(results.summary)

# First stage F-statistic (weak IV check)
print(results.first_stage.f_statistic)
```

### 2.3 Weak IV Diagnostics
```python
# Rule of thumb: First-stage F > 10
# Stock-Yogo critical values
def weak_iv_diagnostics(first_stage_f, n_instruments, n_endogenous):
    from linearmodels.iv import IV2SLS
    # Returns critical values for 10%, 15%, 20%, 25% bias
    pass

# Anderson-Rubin test (robust to weak IV)
from linearmodels.iv import IV2SLS
model = IV2SLS(y, X, d, z)
ar_test = model.ar_test()
```

### 2.4 Local Average Treatment Effect (LATE)
```python
# LATE = ITT / Compliance Rate
# ITT = E[Y|Z=1] - E[Y|Z=0]
# Compliance = E[D|Z=1] - E[D|Z=0]

def late_estimate(y, d, z):
    itt = np.mean(y[z==1]) - np.mean(y[z==0])
    compliance = np.mean(d[z==1]) - np.mean(d[z==0])
    return itt / compliance

# With covariates (2SLS)
from econml.iv.dml import LinearDMLIV
iv = LinearDMLIV(model_y=..., model_t=..., model_z=..., cv=5)
iv.fit(y, d, Z=z, X=x)
late = iv.ate()
```

### 2.5 Many/Weak IV
```python
# LIML (Limited Information Maximum Likelihood)
from linearmodels.iv import IVLIML
liml = IVLIML(y, X, d, z)
results = liml.fit()

# Fuller's k-class estimator
from linearmodels.iv import IVGMM
gmm = IVGMM(y, X, d, z, weight_type='unadjusted')
```

### 2.6 IV with Heterogeneous Effects
```python
# IV for CATE
from econml.iv.dml import NonParamDMLIV

iv_cate = NonParamDMLIV(
    model_y=RandomForestRegressor(),
    model_t=RandomForestRegressor(),
    model_z=RandomForestRegressor(),
    cv=5
)
iv_cate.fit(y, d, Z=z, X=x)
cate = iv_cate.effect(x_test)
```

---

## 3. Regression Discontinuity (RD)

### 3.1 Sharp RD
Treatment determined by cutoff: $D_i = 1[X_i \geq c]$

```python
import numpy as np
from sklearn.linear_model import LinearRegression

def sharp_rd(y, x, cutoff, bandwidth=None, kernel='triangular'):
    """
    Sharp RD with local linear regression
    """
    if bandwidth is None:
        # IK bandwidth (Imbens-Kalyanaraman)
        bandwidth = ik_bandwidth(y, x, cutoff)
    
    # Local data
    mask = np.abs(x - cutoff) <= bandwidth
    x_local = x[mask].reshape(-1, 1)
    y_local = y[mask]
    treat = (x[mask] >= cutoff).astype(int)
    
    # Local linear regression
    X_design = np.column_stack([
        np.ones(len(y_local)),
        x_local - cutoff,
        treat,
        (x_local - cutoff) * treat
    ])
    
    model = LinearRegression().fit(X_design, y_local)
    rd_effect = model.coef_[2]  # Coefficient on treat
    
    # Standard errors (clustered)
    from linearmodels.panel import PanelOLS
    import pandas as pd
    df = pd.DataFrame({'y': y_local, 'treat': treat, 'x': x_local.flatten()})
    mod = PanelOLS(df['y'], df[['treat', 'x']], entity_effects=False)
    res = mod.fit(cov_type='clustered', cluster_entity=df.index)
    
    return rd_effect, res.std_errors['treat']

# Triangular kernel weights
def triangular_kernel(u):
    return np.maximum(0, 1 - np.abs(u))

def ik_bandwidth(y, x, cutoff):
    """Imbens-Kalyanaraman optimal bandwidth"""
    # Simplified - use rdrobust package for full implementation
    return 1.84 * np.std(x) * len(x)**(-1/5)
```

### 3.2 Fuzzy RD
Treatment probability jumps at cutoff: $D_i = 1[X_i \geq c]$ with non-compliance

```python
def fuzzy_rd(y, d, x, cutoff, bandwidth=None):
    """Fuzzy RD = Wald estimator = ITT / First Stage"""
    # Reduced form (ITT)
    itt = sharp_rd(y, x, cutoff, bandwidth)
    
    # First stage
    fs = sharp_rd(d, x, cutoff, bandwidth)
    
    return itt / fs

# 2SLS implementation
def fuzzy_rd_2sls(y, d, x, cutoff, bandwidth=None):
    from linearmodels.iv import IV2SLS
    mask = np.abs(x - cutoff) <= bandwidth
    z = (x[mask] >= cutoff).astype(int)
    model = IV2SLS(y[mask], x[mask], d[mask], z)
    return model.fit()
```

### 3.3 Bandwidth Selection
```python
# MSE-optimal bandwidth (Calonico, Cattaneo, Titiunik)
def mse_optimal_bandwidth(y, x, cutoff):
    from rdrobust import rdrobust
    result = rdrobust(y, x, c=cutoff)
    return result.bws[0]

# CER-optimal bandwidth (Coverage Error Rate)
def cer_bandwidth(y, x, cutoff):
    result = rdrobust(y, x, c=cutoff, bwselect='cer')
    return result.bws[0]

# Use rdrobust package for production
# pip install rdrobust
```

### 3.4 RD Validity Tests
```python
def rd_validity_tests(y, x, cutoff, covariates=None):
    """
    1. Continuity of density at cutoff (McCrary test)
    2. Continuity of covariates at cutoff
    3. Placebo cutoffs
    4. Donut RD (exclude near cutoff)
    """
    # McCrary density test
    from rddensity import rddensity
    density_test = rddensity(x, c=cutoff)
    
    # Covariate balance
    if covariates is not None:
        balance = {}
        for col in covariates.columns:
            rd_effect = sharp_rd(covariates[col].values, x, cutoff)
            balance[col] = rd_effect
    
    # Placebo cutoffs
    placebo_effects = []
    for pc in np.percentile(x, [10, 20, 30, 40, 60, 70, 80, 90]):
        if abs(pc - cutoff) > 2 * bandwidth:
            placebo_effects.append(sharp_rd(y, x, pc))
    
    return {
        'density_test': density_test,
        'covariate_balance': balance,
        'placebo_effects': placebo_effects
    }
```

---

## 4. Difference-in-Differences (DiD)

### 4.1 Standard DiD
```python
import pandas as pd
import statsmodels.formula.api as smf

def did_estimate(df, unit_col, time_col, treat_col, outcome_col):
    """
    Standard two-way fixed effects DiD
    y_it = alpha_i + gamma_t + beta * (Treat_i * Post_t) + epsilon_it
    """
    # Create post indicator
    df['post'] = (df[time_col] >= df[time_col].median()).astype(int)
    df['did'] = df[treat_col] * df['post']
    
    # Two-way FE
    formula = f"{outcome_col} ~ did + C({unit_col}) + C({time_col})"
    model = smf.ols(formula, data=df).fit(cov_type='cluster', 
                                           cov_kwds={'groups': df[unit_col]})
    
    return model.params['did'], model.bse['did']

# Alternative: linearmodels
from linearmodels.panel import PanelOLS
df = df.set_index([unit_col, time_col])
mod = PanelOLS(df[outcome_col], df[['did']], entity_effects=True, time_effects=True)
res = mod.fit(cov_type='clustered', cluster_entity=df.index.get_level_values(0))
```

### 4.2 Event Study
```python
def event_study(df, unit_col, time_col, treat_col, outcome_col, event_time=0):
    """
    Event study with leads and lags
    y_it = alpha_i + gamma_t + sum_{k!=-1} beta_k * D_{it}^k + epsilon_it
    """
    # Create relative time indicators
    df['rel_time'] = df[time_col] - df[treat_col].map(
        df[df[treat_col]==1].groupby(unit_col)[time_col].min()
    )
    
    # Create leads/lags
    for k in range(-5, 6):
        if k != -1:  # Omitted reference
            df[f'lead_lag_{k}'] = (df['rel_time'] == k).astype(int)
    
    # Estimate
    leads_lags = [f'lead_lag_{k}' for k in range(-5, 6) if k != -1]
    formula = f"{outcome_col} ~ {' + '.join(leads_lags)} + C({unit_col}) + C({time_col})"
    model = smf.ols(formula, data=df).fit(cov_type='cluster', 
                                           cov_kwds={'groups': df[unit_col]})
    
    # Extract coefficients
    coefs = {k: model.params[f'lead_lag_{k}'] for k in range(-5, 6) if k != -1}
    ses = {k: model.bse[f'lead_lag_{k}'] for k in range(-5, 6) if k != -1}
    
    return coefs, ses

# Plot
def plot_event_study(coefs, ses):
    import matplotlib.pyplot as plt
    ks = sorted(coefs.keys())
    plt.errorbar(ks, [coefs[k] for k in ks], 
                 yerr=[1.96*ses[k] for k in ks], fmt='o')
    plt.axhline(0, color='gray', linestyle='--')
    plt.axvline(-0.5, color='red', linestyle='--')
    plt.xlabel('Relative Time')
    plt.ylabel('Coefficient')
    plt.show()
```

### 4.3 Staggered Adoption (Callaway-Sant'Anna)
```python
# Callaway-Sant'Anna (2021) for staggered adoption
from did import did

# Python implementation
def csa_did(df, unit_col, time_col, treat_col, outcome_col):
    """
    Callaway-Sant'Anna DiD for staggered adoption
    """
    # Use did package
    from did import did
    
    result = did(
        y=outcome_col,
        g=treat_col,  # Group (first treatment time)
        t=time_col,
        id=unit_col,
        data=df,
        method="dr"  # Doubly robust
    )
    
    # ATT(g,t) - group-time average treatment effects
    return result

# Alternative: csdid (R) via rpy2
```

### 4.4 DiD Diagnostics
```python
def did_diagnostics(df, unit_col, time_col, treat_col, outcome_col):
    """
    1. Parallel trends test (pre-treatment)
    2. Placebo test (fake treatment time)
    3. Parallel trends plot
    """
    # Pre-trends test
    pre_periods = df[df['post']==0]
    formula = f"{outcome_col} ~ C({treat_col})*C({time_col}) + C({unit_col})"
    model = smf.ols(formula, data=pre_periods).fit()
    
    # Test joint significance of pre-trends
    from statsmodels.stats.anova import anova_lm
    anova = anova_lm(model)
    
    # Placebo
    placebo_time = df[time_col].min() - 1
    df['placebo_treat'] = (df[treat_col] == 1) & (df[time_col] >= placebo_time)
    placebo_model = smf.ols(f"{outcome_col} ~ placebo_treat + C({unit_col}) + C({time_col})", 
                            data=df).fit()
    
    return {'pre_trends': model, 'placebo': placebo_model}
```

---

## 5. Synthetic Control Methods

### 5.1 Classic SCM (Abadie et al., 2010)
```python
# pip install synthpy
from synthpy import Synth

# Prepare data
# Treated unit: 1, Control units: 0
# Pre-treatment periods: T0, Post-treatment: T1

synth = Synth(
    df,
    unit='unit',
    time='time',
    outcome='outcome',
    treated='treated',
    predictors=['covariate1', 'covariate2']
)

# Fit
synth.fit()

# Results
weights = synth.weights  # Optimal weights for control units
counterfactual = synth.counterfactual
ate = synth.ate
```

### 5.2 Augmented SCM (Ben-Michael et al., 2021)
```python
# Augmented SCM with outcome model
# pip install augsynth
import augsynth

aug_synth = augsynth.augsynth(
    y ~ treated + X1 + X2 | unit + time,
    data=df,
    progfunc="ridge",
    scm=True
)

summary(aug_synth)
```

### 5.3 Generalized Synthetic Control
```python
# pip install gsynth
from gsynth import gsynth

gsynth_result = gsynth(
    formula = outcome ~ treated | X1 + X2,
    data = df,
    index = "unit",
    time = "time",
    method = "ife",  # Interactive Fixed Effects
    CV = True
)
```

---

## 6. Matching & Weighting Methods

### 6.1 Entropy Balancing
```python
# pip install ebreg
from ebreg import eb

# Entropy balancing weights
weights = eb(
    treatment=w,
    covariates=X,
    target_moments=None  # Match all moments
)

# Weighted regression
import statsmodels.api as sm
model = sm.WLS(y, sm.add_constant(X), weights=weights).fit()
```

### 6.2 Covariate Balancing Propensity Score (CBPS)
```python
# pip install cbps
from cbps import CBPS

cbps = CBPS(
    treatment ~ X1 + X2 + X3,
    data=df,
    ATT=True  # or ATE
)
weights = cbps.weights
```

---

## 7. Modern DiD Methods

### 7.1 Synthetic DiD (Arkhangelsky et al., 2021)
```python
# pip install synthdid
from synthdid import synthdid

sdid = synthdid(
    y=y,  # N x T matrix
    N0=len(control_units),
    T0=pre_periods,
    method='sdid'
)
```

### 7.2 Matrix Completion DiD
```python
# Matrix completion for missing counterfactuals
from sklearn.impute import IterativeImputer

# Fill missing counterfactuals with matrix completion
imputer = IterativeImputer()
y_filled = imputer.fit_transform(y_matrix)

# Then standard DiD
```

### 7.3 Interactive Fixed Effects (Bai, 2009)
```python
# Did with interactive fixed effects
from linearmodels.panel import PanelOLS

# Add factor structure
mod = PanelOLS(y, X, entity_effects=True, time_effects=True, 
               other_effects='individual')
```

---

## 7. Validation & Sensitivity

### 7.1 Sensitivity Analysis for DiD
```python
# Rambachan & Roth (2023) - Sensitivity to parallel trends violation
def did_sensitivity(att_estimate, se, parallel_trends_violation):
    """
    How much violation of parallel trends would change conclusion?
    """
    # Sensitivity parameter: maximum deviation from parallel trends
    # delta = max |E[Y(0)|T=1, t] - E[Y(0)|T=0, t]| for pre-periods
    pass

# Use did package for sensitivity
from did import sensitivity
sens = sensitivity(att, se, pre_periods=5)
```

### 7.2 Placebo Tests
```python
def placebo_tests(df, unit_col, time_col, treat_col, outcome_col):
    """
    1. Fake treatment time (before actual)
    2. Fake treatment group (never treated)
    3. Fake outcome (pre-determined variable)
    """
    results = {}
    
    # 1. Fake treatment time
    fake_time = df[time_col].min() - 1
    df['fake_treat'] = (df[treat_col] == 1) & (df[time_col] >= fake_time)
    results['fake_time'] = did_estimate(df, unit_col, time_col, 'fake_treat', outcome_col)
    
    # 2. Fake treatment group
    never_treated = df[~df[unit_col].isin(treated_units)]
    df_fake = df[df[unit_col].isin(never_treated)].copy()
    df_fake['fake_treat'] = np.random.binomial(1, 0.5, len(df_fake))
    results['fake_group'] = did_estimate(df_fake, unit_col, time_col, 'fake_treat', outcome_col)
    
    return results
```

---

## 8. Summary Table

| Method | Identification | Key Assumption | Best For |
|--------|----------------|----------------|----------|
| **IV** | Exogeneity of Z | Exclusion restriction | Endogenous treatment |
| **Sharp RD** | Cutoff rule | Continuity at cutoff | Clear cutoff rule |
| **Fuzzy RD** | IV at cutoff | Monotonicity | Imperfect compliance |
| **DiD** | Parallel trends | No anticipatory effects | Policy changes over time |
| **Event Study** | Parallel trends | No anticipation | Dynamic effects |
| **Staggered DiD** | Parallel trends | No anticipation | Staggered adoption |
| **Synthetic Control** | Weighted parallel | No interpolation bias | Single treated unit |
| **Synthetic DiD** | Parallel + SCM | Parallel + SCM | Multiple treated |

---

## 9. Key Takeaways

1. **IV**: Requires valid instrument; 2SLS for LATE; check first-stage F > 10
2. **RD**: Sharp = discontinuity in treatment; Fuzzy = IV at cutoff; always test covariates
3. **DiD**: Parallel trends is key; event studies test pre-trends; staggered needs Callaway-Sant'Anna
4. **Synthetic Control**: Best for single treated unit; augmented SCM improves fit
5. **Synthetic DiD**: Combines DiD + SCM; robust to violations
6. **Always run**: Placebo tests, pre-trends, covariate balance, sensitivity
7. **Staggered adoption**: Use Callaway-Sant'Anna, not TWFE
8. **Weak IV**: Use LIML, AR test, report first-stage F
9. **Standard errors**: Cluster at treatment level; bootstrap for RD/SCM