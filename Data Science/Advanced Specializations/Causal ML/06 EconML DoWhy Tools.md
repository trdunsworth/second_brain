# EconML, DoWhy, and Causal ML Tools

Practical guide to the main Python libraries for causal inference: EconML, DoWhy, CausalML, PyWhy, Dowhy.

## 1. Library Comparison

| Library | Focus | Strengths | Best For |
|---------|-------|-----------|----------|
| **EconML** | Heterogeneous treatment effects, DML, Forests, Orthogonal ML | Production-ready, comprehensive, Microsoft Research | CATE estimation, DML, Forests, IV |
| **DoWhy** | End-to-end causal inference workflow | Graphical model, assumption checking, refutation tests | Causal graph, assumption validation, end-to-end |
| **CausalML** | Uplift modeling, meta-learners | Marketing-focused, simple API, T/S/X/R learners | Uplift modeling, marketing campaigns |
| **PyWhy** | Causal discovery + inference | Integration of discovery + inference | Full pipeline |
| **Dowhy** | DoWhy + EconML integration | Unified API | End-to-end with modern estimators |
| **StatsModels** | Classical econometrics | OLS, IV, Panel, GMM | Classical estimation |
| **Linearmodels** | Panel/IV models | Panel, IV, GMM | Panel data |

---

## 2. EconML Deep Dive

### 2.1 Installation
```bash
pip install econml
# or with all extras
pip install econml[all]
```

### 2.2 Core Estimators

#### Double ML (DML)
```python
from econml.dml import LinearDML, SparseLinearDML, KernelDML

# Linear DML (ATE)
dml = LinearDML(
    model_y=RandomForestRegressor(n_estimators=500),
    model_t=RandomForestRegressor(n_estimators=500),
    cv=5
)
dml.fit(y, d, X=x)
ate = dml.ate()

# Sparse DML (High-dimensional)
from sklearn.linear_model import LassoCV
sparse = SparseLinearDML(
    model_y=LassoCV(cv=5),
    model_t=LassoCV(cv=5),
    cv=5
)

# Nonparametric DML (CATE)
dml_cate = LinearDML(
    model_y=RandomForestRegressor(),
    model_t=RandomForestRegressor(),
    cv=5,
    discrete_treatment=False
)
dml_cate.fit(y, d, X=x)
cate = dml_cate.effect(x_test)
```

#### Instrumental Variables (IV)
```python
from econml.iv.dml import LinearDMLIV, NonParamDMLIV

# Linear IV (LATE)
iv = LinearDMLIV(
    model_y=RandomForestRegressor(),
    model_t=RandomForestRegressor(),
    model_z=RandomForestRegressor(),
    cv=5
)
iv.fit(y, d, Z=z, X=x)
late = iv.ate()

# Nonparametric IV
npiv = NonParamDMLIV(
    model_y=RandomForestRegressor(),
    model_t=RandomForestRegressor(),
    model_z=RandomForestRegressor(),
    cv=5
)
```

#### Causal Forests & Orthogonal Forests
```python
from econml.grf import CausalForest, InstrumentalForest
from econml.orf import DMLOrthoForest

# Causal Forest
cf = CausalForest(
    n_estimators=2000,
    min_samples_leaf=10,
    max_depth=10,
    honest=True,
    inference=True
)
cf.fit(y, w, X=x)
cate = cf.predict(x_test)

# Orthogonal Forest (DML + Forest)
orf = DMLOrthoForest(
    n_trees=500,
    min_leaf_size=10,
    max_depth=20,
    model_Y=RandomForestRegressor(),
    model_T=RandomForestClassifier(),
    model_Y_final=RandomForestRegressor(),
    model_T_final=RandomForestRegressor()
)
orf.fit(y, w, X=x, W=None)
cate = orf.predict(x_test)
```

#### DR-Learner & Orthogonal Learners
```python
from econml.dr import DRLearner
from econml.meta import DRRegressor, XLearner, TLearner, SLearner

# DR-Learner
dr = DRLearner(
    model_regression=RandomForestRegressor(),
    model_propensity=RandomForestClassifier(),
    cv=5
)
dr.fit(y, w, X=x)
cate = dr.effect(x_test)

# X-Learner
xl = XLearner(
    models=[RandomForestRegressor(), RandomForestRegressor(), 
            RandomForestRegressor(), RandomForestRegressor()]
)
xl.fit(y, w, X=x)
cate = xl.effect(x_test)
```

### 2.3 Panel Data
```python
from econml.panel import DynamicCF, DynamicDML

# Dynamic Causal Forest
dcf = DynamicCF()
dcf.fit(y, w, X, unit_ids, time_ids)

# Dynamic DML
ddml = DynamicDML()
ddml.fit(y, w, X, unit_ids, time_ids)
```

### 2.4 Inference & Diagnostics
```python
# ATE with CI
ate = dml.ate()
ci = dml.ate_interval(alpha=0.05)

# CATE with CI
cate = dml_cate.effect(x_test)
ci = dml_cate.effect_interval(x_test, alpha=0.05)

# Diagnostics
dml.fit(y, d, X=x)
print(dml.summary())  # Coefficients, p-values
```

---

## 2. DoWhy Deep Dive

### 2.1 Installation
```bash
pip install dowhy
# or with graphviz
pip install dowhy[graphviz]
```

### 2.2 End-to-End Workflow
```python
import dowhy
from dowhy import CausalModel
import pandas as pd

# 1. Load data
data = pd.read_csv('data.csv')

# 2. Define causal model
model = CausalModel(
    data=data,
    treatment='treatment',
    outcome='outcome',
    common_causes=['confounder1', 'confounder2'],
    instruments=None,  # Optional
    effect_modifiers=None  # Optional
)

# 2. View causal graph
model.view_model()
# Or get DOT string
print(model.graph)

# 3. Identify causal effect
identified_estimand = model.identify_effect()
print(identified_estimand)

# 4. Estimate effect (multiple methods)
estimate = model.estimate_effect(
    identified_estimand,
    method_name="backdoor.propensity_score_matching"
)

# Other methods:
# "backdoor.propensity_score_weighting"
# "backdoor.propensity_score_stratification"
# "backdoor.linear_regression"
# "backdoor.econml.dml"
# "backdoor.econml.dr"
# "backdoor.econml.orf"
# "iv.instrumental_variable"

print(f"Estimated ATE: {estimate.value}")

# 5. Refutation tests (sensitivity analysis)
# Random placebo
refute = model.refute_estimate(
    identified_estimand, estimate,
    method_name="random_common_cause"
)
print(f"Placebo test: {refute}")

# Data subset
refute = model.refute_estimate(
    identified_estimand, estimate,
    method_name="data_subset_refuter",
    subset_fraction=0.8
)

# Add unobserved confounder
refute = model.refute_estimate(
    identified_estimand, estimate,
    method_name="add_unobserved_common_cause",
    confounders_effect_on_treatment=0.5,
    confounders_effect_on_outcome=0.5
)
```

### 2.3 Advanced DoWhy
```python
# Custom estimand
from dowhy.causal_identifier import identify_effect

# Time series
from dowhy import CausalModel
model = CausalModel(
    data=data,
    treatment='treatment',
    outcome='outcome',
    time_varying_covariates=['time_varying_confounder'],
    time_invariant_covariates=['static_confounder']
)

# Mediation analysis
# direct_effect + indirect_effect

# Counterfactuals
from dowhy.causal_model import CausalModel
# P(Y_x = y | X=x', Y=y') - what would have happened?
```

### 2.4 DoWhy + EconML Integration
```python
# Use EconML estimators within DoWhy
estimate = model.estimate_effect(
    identified_estimand,
    method_name="backdoor.econml.dml",
    method_params={
        "model_y": RandomForestRegressor(),
        "model_t": RandomForestRegressor(),
        "cv": 5
    }
)

# Causal Forest
estimate = model.estimate_effect(
    identified_estimand,
    method_name="backdoor.econml.orf",
    method_params={
        "n_trees": 500,
        "min_leaf_size": 10
    }
)
```

---

## 3. CausalML

### 3.1 Installation
```bash
pip install causalml
```

### 3.2 Meta-Learners (Uplift Modeling)
```python
from causalml.inference.meta import (
    BaseSLearner, BaseTLearner, BaseXLearner, BaseRLearner
)
from sklearn.ensemble import RandomForestRegressor

# S-Learner
s = BaseSLearner(learner=RandomForestRegressor(n_estimators=100))
s.fit(X=X, treatment=w, y=y)
uplift = s.predict(X_test)

# T-Learner
t = BaseTLearner(learner=RandomForestRegressor(n_estimators=100))
t.fit(X=X, treatment=w, y=y)
uplift = t.predict(X_test)

# X-Learner
x = BaseXLearner(learner=RandomForestRegressor(n_estimators=100))
x.fit(X=X, treatment=w, y=y)
uplift = x.predict(X_test)

# R-Learner
r = BaseRLearner(learner=RandomForestRegressor())
r.fit(X=X, treatment=w, y=y)
uplift = r.predict(X_test)
```

### 3.3 Causal Trees & Forests
```python
from causalml.inference.tree import UpliftTreeClassifier, UpliftRandomForestClassifier

# Uplift Tree
tree = UpliftTreeClassifier(
    max_depth=5,
    min_samples_leaf=100,
    evaluationFunction='KL',
    control_name='control'
)
tree.fit(X=X, treatment=w, y=y)
uplift = tree.predict(X_test)

# Uplift Random Forest
rf = UpliftRandomForestClassifier(
    n_estimators=100,
    max_depth=5,
    min_samples_leaf=100,
    evaluationFunction='KL',
    control_name='control'
)
rf.fit(X=X, treatment=w, y=y)
uplift = rf.predict(X_test)
```

### 3.4 Evaluation
```python
from causalml.metrics import auc, qini, uplift_curve

# AUUC (Area Under Uplift Curve)
auuc = auc(uplift, y_test, w_test)

# QINI coefficient
q = qini(uplift, y_test, w_test)

# Uplift curve
x_axis, y_axis = uplift_curve(uplift, y_test, w_test)
```

---

## 3. PyWhy / Dowhy Integration

### 3.1 Unified API
```python
from pywhy import CausalInference

# Unified API combining discovery + inference
ci = CausalInference(data)
ci.discover_causal_graph()
ci.estimate_effect()
ci.validate()
```

---

## 4. Choosing the Right Tool

| Task | Recommended |
|------|-------------|
| **ATE with high-dimensional confounders** | EconML DML |
| **CATE / Heterogeneous effects** | EconML (Causal Forest, OrthoForest, DR) |
| **IV / LATE** | EconML IV (DMLIV) |
| **End-to-end with assumption checks** | DoWhy |
| **Marketing uplift / A/B test analysis** | CausalML |
| **Causal Discovery + Inference** | PyWhy |
| **Panel/Longitudinal data** | EconML Panel |
| **Time series causal inference** | DoWhy + custom |

---

## 5. Complete Pipeline Example

```python
# Complete causal inference pipeline
import pandas as pd
import numpy as np
from dowhy import CausalModel
from econml.dml import LinearDML
from econml.grf import CausalForest
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

# 1. Data
df = pd.read_csv('data.csv')
X = df[['age', 'income', 'education', 'region']].values
w = df['treatment'].values
y = df['outcome'].values

# 2. DoWhy: Assumption validation
model = CausalModel(
    data=df,
    treatment='treatment',
    outcome='outcome',
    common_causes=['age', 'income', 'education', 'region']
)

# View graph
model.view_model()

# Identify
identified_estimand = model.identify_effect()

# Refutation tests
refute = model.refute_estimate(identified_estimand, None,
    method_name="random_common_cause")

# 3. EconML: Estimation
# ATE
dml = LinearDML(
    model_y=RandomForestRegressor(n_estimators=500),
    model_t=RandomForestRegressor(n_estimators=500),
    cv=5
)
dml.fit(y, w, X=X)
ate = dml.ate()
ci = dml.ate_interval(alpha=0.05)

# CATE
cf = CausalForest(n_estimators=2000, honest=True, inference=True)
cf.fit(y, w, X=X)
cate = cf.predict(X)
ci_cate = cf.predict_ci(X, alpha=0.05)

# 4. Evaluation
# Policy value
policy_val = np.mean(np.maximum(cate, 0))
print(f"Policy value: {policy_val:.4f}")

# 5. Sensitivity
from dowhy.causal_refuters import RandomCommonCauseRefuter
refuter = RandomCommonCauseRefuter()
refuter.refute_estimate(identified_estimand, ...)
```

---

## 5. Key Differences

| Feature | EconML | DoWhy | CausalML |
|---------|--------|-------|----------|
| **Primary Focus** | Heterogeneous effects, DML | End-to-end workflow | Uplift modeling |
| **Estimators** | DML, DR, Forests, IV, Panel | Wraps EconML + classical | Meta-learners, Trees |
| **Inference** | Asymptotic, Bootstrap | Via EconML | Limited |
| **Assumption Checking** | Limited | **Graphical, Refutation** | None |
| **Causal Discovery** | No | Basic | No |
| **Visualization** | Basic | **Graphs, Refutations** | Uplift curves |
| **Best For** | Production CATE | Research, Validation | Marketing |

---

## 6. Key Takeaways

1. **EconML** = Production-grade CATE estimation with modern ML
2. **DoWhy** = Assumption validation, graphical models, refutation tests
3. **CausalML** = Marketing-focused uplift modeling with meta-learners
4. **Combine**: DoWhy for validation → EconML for estimation
5. **EconML's CausalForest/OrthoForest** are state-of-the-art for CATE
4. **DML/DR/OrthoForest** provide valid inference with ML
5. **Always run refutation tests** (placebo, subset, unobserved confounder)