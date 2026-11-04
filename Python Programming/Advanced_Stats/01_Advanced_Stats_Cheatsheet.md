# Advanced Statistics Cheatsheet

A comprehensive reference for advanced statistical methods in Python.

---

## 1. Statistical Inference

### 1.1 Hypothesis Testing

#### Parametric Tests
```python
from scipy import stats
import statsmodels.api as sm
from statsmodels.stats.proportion import proportions_ztest, proportion_confint
from statsmodels.stats.weightstats import ttest_ind, ttest_1samp, ttest_rel

# One-sample t-test
stat, p = ttest_1samp(data, popmean=0)

# Two-sample t-test (independent)
stat, p = ttest_ind(group1, group2, alternative='two-sided', usevar='pooled')
# Welch's t-test (unequal variances)
stat, p = ttest_ind(group1, group2, alternative='two-sided', usevar='unequal')

# Paired t-test
stat, p = ttest_rel(before, after)

# Z-test for proportions
count = np.array([success1, success2])
nobs = np.array([n1, n2])
stat, p = proportions_ztest(count, nobs)
```

#### Non-Parametric Tests
```python
from scipy.stats import (
    mannwhitneyu, wilcoxon, kruskal, friedmanchisquare,
    spearmanr, kendalltau, shapiro, normaltest
)

# Mann-Whitney U (two independent samples)
stat, p = mannwhitneyu(group1, group2, alternative='two-sided')

# Wilcoxon signed-rank (paired)
stat, p = wilcoxon(before, after)

# Kruskal-Wallis (3+ groups)
stat, p = kruskal(group1, group2, group3)

# Friedman test (repeated measures)
stat, p = friedmanchisquare(treatment1, treatment2, treatment3)

# Correlation
rho, p = spearmanr(x, y)
tau, p = kendalltau(x, y)

# Normality tests
stat, p = shapiro(data)
stat, p = normaltest(data)
```

---

## 2. Regression Analysis

### 2.1 Linear Regression
```python
import statsmodels.api as sm
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet

# Statsmodels (detailed stats)
X = sm.add_constant(X)
model = sm.OLS(y, X).fit()
print(model.summary())

# Diagnostics
from statsmodels.stats.diagnostic import het_breuschpagan, het_white
from statsmodels.stats.outliers_influence import variance_inflation_factor

bp_lm, bp_p, _, _ = het_breuschpagan(residuals, X)
vif = [variance_inflation_factor(X, i) for i in range(X.shape[1])]

# sklearn
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
lr = LinearRegression().fit(X, y)
ridge = Ridge(alpha=1.0).fit(X, y)
lasso = Lasso(alpha=0.1).fit(X, y)
```

### 2.2 Generalized Linear Models
```python
import statsmodels.api as sm
import statsmodels.formula.api as smf

# Logistic regression
logit = sm.Logit(y, X).fit()
logit = smf.logit('y ~ x1 + x2', data=df).fit()

# Poisson
poisson = smf.poisson('count ~ x1 + x2', data=df).fit()

# Negative binomial
nb = smf.negativebinomial('count ~ x1 + x2', data=df).fit()

# Robust regression
rlm = sm.RLM(y, X, M=sm.robust.norms.HuberT()).fit()

# Quantile regression
from statsmodels.regression.quantile_regression import QuantReg
qreg = QuantReg(y, X).fit(q=0.5)  # median
```

### 3. Mixed Effects Models
```python
import statsmodels.formula.api as smf
from statsmodels.regression.mixed_linear_model import MixedLM

# Random intercept
model = smf.mixedlm("y ~ x1 + x2", data, groups=df["group"], re_formula="1")
result = model.fit()

# Random slopes
model = smf.mixedlm("y ~ x1", df, groups=df["group"], re_formula="~x1")
result = model.fit()

# Multiple random effects
model = MixedLM.from_formula("y ~ x1", df, groups=df["group1"], 
                              re_formula="1", vc_formula={"group2": "0 + C(group2)"})
```

---

## 3. Advanced Inference

### 3.1 Bootstrap
```python
from scipy.stats import bootstrap
import numpy as np

# Bootstrap CI
data = (sample,)
res = bootstrap(data, np.mean, n_resamples=10000, confidence_level=0.95)
ci_low, ci_high = res.confidence_interval

# Custom statistic
def stat_func(x):
    return np.median(x)

res = bootstrap((sample,), np.median, n_resamples=10000)
ci_low, ci_high = res.confidence_interval
```

### 2.2 Permutation Tests
```python
from scipy.stats import permutation_test

# Two-sample
def stat_func(x, y):
    return np.mean(x) - np.mean(y)

res = permutation_test((x, y), statfunc, permutation_type='independent', 
                       n_resamples=10000, alternative='two-sided')
```

### 2.3 Multiple Testing Correction
```python
from statsmodels.stats.multitest import multipletests
from scipy.stats import false_discovery_control

# Multiple testing correction
reject, pvals_corrected, _, _ = multipletests(pvals, alpha=0.05, method='fdr_bh')
# methods: 'bonferroni', 'holm', 'fdr_bh', 'fdr_by', 'holm', 'sidak'

# FDR control
reject, pvals_adj = fdrcorrection(pvals, alpha=0.05, method='bh')
```

---

## 3. Bayesian Statistics

### 3.1 PyMC3 / PyMC
```python
import pymc as pm
import arviz as az

with pm.Model() as model:
    # Priors
    alpha = pm.Normal('alpha', mu=0, sigma=10)
    beta = pm.Normal('beta', mu=0, sigma=10)
    sigma = pm.HalfNormal('sigma', sigma=1)
    
    # Likelihood
    mu = alpha + beta * x
    y_obs = pm.Normal('y_obs', mu=mu, sigma=sigma, observed=y)
    
    # Sample
    trace = pm.sample(2000, tune=1000, chains=4, target_accept=0.95)
    
# Diagnostics
az.summary(trace)
az.plot_trace(trace)
az.plot_forest(trace, var_names=['alpha', 'beta'])

# Model comparison
az.compare({model1: trace1, model2: trace2}, ic='loo')
az.plot_compare(compare_dict)
```

### 3.2 Bayesian Linear Regression
```python
with pm.Model() as model:
    # Priors
    alpha = pm.Normal('alpha', mu=0, sigma=10)
    beta = pm.Normal('beta', mu=0, sigma=10)
    sigma = pm.HalfNormal('sigma', sigma=1)
    
    mu = alpha + beta * x
    y_obs = pm.Normal('y_obs', mu=mu, sigma=sigma, observed=y)
    
    trace = pm.sample(2000, tune=1000, chains=4, target_accept=0.95)

# Posterior predictive
ppc = pm.sample_posterior_predictive(trace, model=model)
```

---

## 3. Causal Inference

### 3.1 Potential Outcomes Framework
```python
from causalml.inference.tree import UpliftTreeClassifier, UpliftRandomForestClassifier
from causalml.inference.meta import BaseXRegressor, BaseRClassifier
from causalml.propensity import ElasticNetPropensityModel

# Uplift modeling
uplift_model = UpliftRandomForestClassifier()
uplift_model.fit(X, treatment, y)
uplift = uplift_model.predict(X_test)

# Doubly robust
from causalml.inference.meta import BaseXRegressor
dr_learner = BaseXRegressor(learner=RandomForestRegressor())
dr_learner.fit(X, y, treatment)
cate = dr_learner.predict(X_test)
```

### 2. Propensity Score Matching
```python
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import NearestNeighbor

# Propensity score
ps_model = LogisticRegression().fit(X, treatment)
ps = ps_model.predict_proba(X)[:, 1]

# Matching
from sklearn.neighbors import NearestNeighbors
nn = NearestNeighbors(n_neighbors=1).fit(ps[treatment==0])
distances, indices = nn.kneighbors(ps[treatment==1])
matched_control = control.iloc[indices.flatten()]

# Weighting
from sklearn.utils import resample
weights = treatment / ps + (1 - treatment) / (1 - ps)
```

### 3. Causal Forests
```python
from causalml.inference.tree import UpliftRandomForestClassifier
from causalml.inference.meta import BaseXRegressor

# Causal Forest
cf = UpliftRandomForestClassifier(n_estimators=100, max_depth=5)
cf.fit(X, treatment, y)
cate = cf.predict(X_test)

# Double ML
from causalml.inference.meta import BaseXRegressor
dml = BaseXRegressor(learner=RandomForestRegressor())
dml.fit(X, y, treatment)
cate = dml.predict(X_test)
```

---

## 4. Advanced Topics

### 1. Structural Equation Modeling
```python
from semopy import Model

model_spec = """
    # Measurement model
    latent1 =~ x1 + x2 + x3
    latent2 =~ y1 + y2 + y3
    
    # Structural model
    latent2 ~ latent1 + x1
"""

model = Model(model_spec)
result = model.fit(data)
print(result.inspect())
```

### 2. Time Series Causal Inference
```python
from statsmodels.tsa.stattools import grangercausalitytests
from statsmodels.tsa.api import VAR

# Granger causality
grangercausalitytests(data[['x', 'y']], maxlag=4)

# VAR model
model = VAR(data)
lag_order = model.select_order(maxlags=12)
results = model.fit(maxlags=12)
results.forecast(steps=10)
```

---

## 5. Survival Analysis

### 1. Kaplan-Meier
```python
from lifelines import KaplanMeierFitter

kmf = KaplanMeierFitter()
kmf.fit(durations, event_observed)
kmf.plot_survival_function()
kmf.median_survival_time_
kmf.confidence_interval_

# Compare groups
kmf.fit(durations[T==1], event_observed[T==1], label='Treatment')
kmf.fit(durations[T==0], event_observed[T==0], label='Control')
```

### 2. Cox Proportional Hazards
```python
from lifelines import CoxPHFitter

cph = CoxPHFitter()
cph.fit(df, duration_col='time', event_col='event')
cph.print_summary()
cph.plot_partial_effects_on_outcome(['covariate'])
cph.check_assumptions(df)
```

### 3. Competing Risks
```python
from lifelines import CoxPHFitter
from statsmodels.duration.survfunc import SurvfuncRight

# Fine-Gray model
from lifelines import CoxPHFitter
# Use cause-specific hazards
```

---

## 6. Machine Learning Statistics

### 1. Cross-Validation
```python
from sklearn.model_selection import (
    KFold, StratifiedKFold, TimeSeriesSplit, 
    GroupKFold, LeaveOneGroupOut
)

# Nested CV
inner_cv = StratifiedKFold(n_splits=4, shuffle=True, random_state=42)
outer_cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

nested_score = cross_val_score(
    GridSearchCV(pipe, param_grid, cv=inner_cv, scoring='roc_auc'),
    X, y, cv=outer_cv, scoring='roc_auc'
)
```

### 2. Model Selection
```python
from sklearn.model_selection import cross_val_score, cross_validate
from sklearn.model_selection import cross_val_predict

# Multiple metrics
scoring = ['accuracy', 'roc_auc', 'f1', 'precision', 'recall']
scores = cross_validate(model, X, y, cv=5, scoring=scoring, return_train_score=True)

# Prediction intervals
from sklearn.utils import resample
from scipy.stats import norm

def pred_interval(model, X, confidence=0.95):
    preds = [model.predict(X) for _ in range(1000)]
    lower = np.percentile(preds, 2.5, axis=0)
    upper = np.percentile(preds, 97.5, axis=0)
    return lower, upper
```

---

## 7. Dimensionality Reduction

### 1. PCA
```python
from sklearn.decomposition import PCA, IncrementalPCA, KernelPCA
from sklearn.manifold import TSNE, UMAP, Isomap
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis

# PCA
pca = PCA(n_components=0.95)  # 95% variance
X_pca = pca.fit_transform(X)

# Incremental PCA for large data
ipca = IncrementalPCA(n_components=10, batch_size=200)
X_ipca = ipca.fit_transform(X)

# Kernel PCA
kpca = KernelPCA(n_components=2, kernel='rbf', gamma=0.1)
X_kpca = kpca.fit_transform(X)

# t-SNE / UMAP
tsne = TSNE(n_components=2, perplexity=30, random_state=42)
umap = UMAP(n_components=2, n_neighbors=15, min_dist=0.1)
```

---

## 8. Key Takeaways

1. **Always check assumptions** before interpreting results
2. **Use cross-validation** - never rely on single train/test split
3. **Report effect sizes** with confidence intervals, not just p-values
4. **Check assumptions** - normality, homoscedasticity, independence
5. **Correct for multiple testing** - FDR, Bonferroni
6. **Use bootstrapping** for complex statistics
6. **Report effect sizes** with confidence intervals
7. **Validate models** with proper cross-validation
8. **Check for causal assumptions** before causal claims
9. **Document all decisions** - preprocessing, model choices, random seeds
10. **Reproducibility** - set seeds, use virtual environments, document versions

---

*Last updated: 2024-11-04*
*Part of: Python Programming Knowledge Base*