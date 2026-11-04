# Machine Learning Cheatsheet

A comprehensive reference for machine learning in Python using scikit-learn, XGBoost, LightGBM, and related libraries.

---

## 1. ML Workflow Overview

```
Data → Preprocessing → Feature Engineering → Model Selection → Tuning → Evaluation → Deployment
```

---

## 1. Data Preprocessing

### 1.1 Scaling & Encoding
```python
from sklearn.preprocessing import (
    StandardScaler, MinMaxScaler, RobustScaler,
    OneHotEncoder, OrdinalEncoder, LabelEncoder,
    PowerTransformer, QuantileTransformer,
    PolynomialFeatures, KBinsDiscretizer
)
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# ColumnTransformer for mixed types
preprocessor = ColumnTransformer([
    ('num', StandardScaler(), num_features),
    ('cat', OneHotEncoder(handle_unknown='ignore'), cat_features),
    ('text', TfidfVectorizer(), text_features),
])

# Pipeline
pipe = Pipeline([
    ('preprocessor', preprocessor),
    ('model', RandomForestClassifier())
])
```

### 2.2 Handling Missing Values
```python
from sklearn.impute import SimpleImputer, KNNImputer, IterativeImputer
from sklearn.experimental import enable_iterative_imputer

# Simple
SimpleImputer(strategy='mean')           # mean/median/most_frequent/constant
KNNImputer(n_neighbors=5)                # KNN imputation
IterativeImputer(estimator=BayesianRidge())  # MICE

# Per column
ColumnTransformer([
    ('num', SimpleImputer(strategy='median'), num_cols),
    ('cat', SimpleImputer(strategy='most_frequent'), cat_cols)
])
```

### 3. Feature Engineering
```python
from sklearn.feature_selection import (
    SelectKBest, f_classif, f_regression, mutual_info_classif, mutual_info_regression,
    RFE, RFECV, SelectFromModel
)
from sklearn.decomposition import PCA, TruncatedSVD, FastICA, KernelPCA
from sklearn.manifold import TSNE, UMAP

# Feature selection
SelectKBest(f_classif, k=10)
RFECV(estimator, cv=5, step=1)
SelectFromModel(RandomForestClassifier(), threshold='median')

# Dimensionality reduction
PCA(n_components=0.95)          # 95% variance
TruncatedSVD(n_components=50)   # For sparse data
UMAP(n_components=2)            # Visualization
TSNE(n_components=2, perplexity=30)
```

---

## 2. Scikit-learn Quick Reference

### 1. Model Training
```python
from sklearn.model_selection import train_test_split, cross_val_score, cross_validate
from sklearn.metrics import classification_report, confusion_matrix

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model.fit(X_train, y_train)
y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:, 1]

# Cross-validation
cv_scores = cross_val_score(model, X, y, cv=5, scoring='roc_auc')
cv_results = cross_validate(model, X, y, cv=5, 
                            scoring=['accuracy', 'roc_auc', 'f1'],
                            return_train_score=True)
```

### 2. Common Models
```python
# Classification
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB

# Regression
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
```

### 3. Evaluation Metrics
```python
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, roc_curve, precision_recall_curve,
    confusion_matrix, classification_report,
    mean_squared_error, mean_absolute_error, r2_score,
    mean_absolute_percentage_error, mean_squared_error
)

# Classification
y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:, 1]

metrics = {
    'accuracy': accuracy_score(y_test, y_pred),
    'precision': precision_score(y_test, y_pred),
    'recall': recall_score(y_test, y_pred),
    'f1': f1_score(y_test, y_pred),
    'roc_auc': roc_auc_score(y_test, y_proba),
    'pr_auc': average_precision_score(y_test, y_proba)
}

# Regression
metrics = {
    'mae': mean_absolute_error(y_test, y_pred),
    'mse': mean_squared_error(y_test, y_pred),
    'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
    'r2': r2_score(y_test, y_pred),
    'mape': mean_absolute_percentage_error(y_test, y_pred)
}
```

---

## 3. Hyperparameter Tuning

### 3.1 Grid & Random Search
```python
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV
from scipy.stats import loguniform, randint

param_grid = {
    'n_estimators': [100, 200, 500],
    'max_depth': [3, 5, 7, None],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4]
}

grid = GridSearchCV(
    estimator=RandomForestClassifier(),
    param_grid=param_grid,
    cv=5,
    scoring='roc_auc',
    n_jobs=-1,
    verbose=1
)

param_dist = {
    'n_estimators': randint(100, 500),
    'max_depth': [3, 5, 7, 10, None],
    'min_samples_split': randint(2, 20),
    'learning_rate': loguniform(0.01, 0.3)
}

random_search = RandomizedSearchCV(
    estimator=XGBClassifier(),
    param_distributions=param_dist,
    n_iter=50,
    cv=5,
    scoring='roc_auc',
    n_jobs=-1
)
```

### 2.2 Bayesian Optimization
```python
# Optuna
import optuna

def objective(trial):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 100, 1000),
        'max_depth': trial.suggest_int('max_depth', 3, 15),
        'learning_rate': trial.suggest_loguniform('learning_rate', 1e-3, 0.3),
        'subsample': trial.suggest_float('subsample', 0.6, 1.0),
        'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0)
    }
    model = XGBClassifier(**params, random_state=42)
    return cross_val_score(model, X, y, cv=5, scoring='roc_auc').mean()

study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=100)
best_params = study.best_params
```

### 2.3 Bayesian Optimization (scikit-optimize)
```python
from skopt import BayesSearchCV
from skopt.space import Real, Integer, Categorical

search = BayesSearchCV(
    estimator=XGBClassifier(),
    search_spaces={
        'n_estimators': Integer(100, 1000),
        'max_depth': Integer(3, 15),
        'learning_rate': Real(0.01, 0.3, prior='log-uniform'),
        'subsample': Real(0.6, 1.0),
        'colsample_bytree': Real(0.6, 1.0)
    },
    n_iter=50,
    cv=5,
    scoring='roc_auc',
    n_jobs=-1
)
```

---

## 4. Advanced Models

### 4.1 XGBoost / LightGBM / CatBoost
```python
import xgboost as xgb
import lightgbm as lgb
import catboost as cb

# XGBoost
xgb_clf = xgb.XGBClassifier(
    n_estimators=500,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    eval_metric='logloss',
    early_stopping_rounds=50,
    random_state=42
)
model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)

# LightGBM
lgb_clf = lgb.LGBMClassifier(
    n_estimators=500,
    max_depth=-1,
    learning_rate=0.05,
    num_leaves=64,
    subsample=0.8,
    colsample_bytree=0.8
)

# CatBoost (handles categorical natively)
cat_clf = cb.CatBoostClassifier(
    iterations=500,
    depth=6,
    learning_rate=0.1,
    cat_features=cat_features,
    eval_metric='AUC'
)
```

---

## 3. Advanced Ensembles

### 2.1 Stacking
```python
from sklearn.ensemble import StackingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression

# Stacking
stack = StackingClassifier(
    estimators=[
        ('rf', RandomForestClassifier(n_estimators=200)),
        ('xgb', XGBClassifier(n_estimators=200)),
        ('lgb', LGBMClassifier(n_estimators=200))
    ],
    final_estimator=LogisticRegression(),
    cv=5,
    stack_method='predict_proba'
)

# Voting
voting = VotingClassifier(
    estimators=[
        ('rf', rf), ('xgb', xgb_clf), ('lgb', lgb)
    ],
    voting='soft',
    weights=[1, 1, 1]
)
```

### 2. Blending / Stacking with Meta-learner
```python
from mlxtend.classifier import StackingCVClassifier

stack = StackingCVClassifier(
    classifiers=[rf, xgb, lgb],
    meta_classifier=LogisticRegression(),
    cv=5,
    use_probas=True
)
```

---

## 4. Model Evaluation

### 3.1 Classification Metrics
```python
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score,
    precision_recall_curve, roc_curve,
    confusion_matrix, classification_report,
    confusion_matrix, ConfusionMatrixDisplay
)

y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:, 1]

metrics = {
    'accuracy': accuracy_score(y_test, y_pred),
    'precision': precision_score(y_test, y_pred),
    'recall': recall_score(y_test, y_pred),
    'f1': f1_score(y_test, y_pred),
    'roc_auc': roc_auc_score(y_test, y_proba),
    'pr_auc': average_precision_score(y_test, y_proba)
}

# Curves
fpr, tpr, _ = roc_curve(y_test, y_proba)
precision, recall, _ = precision_recall_curve(y_test, y_proba)

# Plot
from sklearn.metrics import RocCurveDisplay, PrecisionRecallDisplay
RocCurveDisplay.from_estimator(model, X_test, y_test)
PrecisionRecallDisplay.from_estimator(model, X_test, y_test)
```

### 2. Regression Metrics
```python
from sklearn.metrics import (
    mean_squared_error, mean_absolute_error, r2_score,
    mean_absolute_percentage_error, mean_squared_log_error
)

metrics = {
    'MAE': mean_absolute_error(y_true, y_pred),
    'MSE': mean_squared_error(y_true, y_pred),
    'RMSE': np.sqrt(mean_squared_error(y_true, y_pred)),
    'R2': r2_score(y_true, y_pred),
    'MAPE': mean_absolute_percentage_error(y_true, y_pred),
    'SMAPE': 100 * np.mean(2 * np.abs(y_pred - y_true) / (np.abs(y_true) + np.abs(y_pred)))
}
```

---

## 3. Cross-Validation

### 3.1 Cross-Validation Strategies
```python
from sklearn.model_selection import (
    KFold, StratifiedKFold, TimeSeriesSplit,
    GroupKFold, LeaveOneGroupOut, LeavePGroupsOut
)

# Standard
cv = KFold(n_splits=5, shuffle=True, random_state=42)

# Stratified (classification)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# Time series
tscv = TimeSeriesSplit(n_splits=5, gap=0, test_size=30)

# Group-aware
cv = GroupKFold(n_splits=5)
groups = df['patient_id']
cv.split(X, y, groups=groups)

# Cross-validation
cv_results = cross_validate(
    model, X, y,
    cv=tscv,
    scoring=['accuracy', 'roc_auc', 'f1'],
    return_train_score=True,
    n_jobs=-1
)
```

### 2. Nested CV
```python
from sklearn.model_selection import cross_val_score

inner_cv = StratifiedKFold(n_splits=4, shuffle=True, random_state=42)
outer_cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

nested_scores = cross_val_score(
    GridSearchCV(pipe, param_grid, cv=inner_cv, scoring='roc_auc'),
    X, y, cv=outer_cv, scoring='roc_auc'
)
```

---

## 4. Model Interpretation

### 1. Feature Importance
```python
# Built-in
importances = model.feature_importances_
pd.Series(importances, index=feature_names).sort_values(ascending=False).plot(kind='barh')

# Permutation importance
from sklearn.inspection import permutation_importance
result = permutation_importance(model, X_test, y_test, n_repeats=10, random_state=42)

# SHAP
import shap
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)
shap.summary_plot(shap_values, X_test)

# For linear models
coef_df = pd.DataFrame({'feature': features, 'coef': model.coef_[0]})
```

---

## 4. Model Deployment

### 1. Serialization
```python
import joblib
import pickle

# Save
joblib.dump(model, 'model.pkl')
joblib.dump((model, preprocessor), 'model_pipeline.pkl')

# Load
model = joblib.load('model.pkl')
model, preprocessor = joblib.load('model_pipeline.pkl')
```

### 2. ONNX Export
```python
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

initial_type = [('float_input', FloatTensorType([None, X.shape[1]]))]
onnx_model = convert_sklearn(model, initial_types=initial_type)
with open('model.onnx', 'wb') as f:
    f.write(onnx_model.SerializeToString())
```

---

## 3. Quick Reference

### Key Functions Cheatsheet

| Task | Function |
|------|----------|
| Split data | `train_test_split(X, y, test_size=0.2, stratify=y)` |
| CV split | `StratifiedKFold(n_splits=5, shuffle=True, random_state=42)` |
| Time series CV | `TimeSeriesSplit(n_splits=5, gap=7)` |
| Grid search | `GridSearchCV(estimator, param_grid, cv=5)` |
| Random search | `RandomizedSearchCV(est, param_dist, n_iter=50)` |
| Bayes opt | `optuna.create_study(direction='maximize')` |
| Cross-val | `cross_val_score(model, X, y, cv=5, scoring='roc_auc')` |
| Nested CV | `cross_val_score(GridSearchCV(...), X, y, cv=outer_cv)` |
| Metrics | `classification_report`, `roc_auc_score`, `mean_squared_error` |
| Feature imp | `permutation_importance`, `shap`, `feature_importances_` |
| Calibration | `CalibratedClassifierCV` |
| Stacking | `StackingClassifier` / `StackingCVClassifier` |
| Voting | `VotingClassifier(voting='soft')` |
| Pipeline | `Pipeline([('pre', prep), ('model', model)])` |
| Column trans | `ColumnTransformer([('num', scaler, nums), ('cat', enc, cats)])` |

---

## Key Takeaways

1. **Always use pipelines** - prevents data leakage
2. **Stratified CV for classification** - preserves class distribution
3. **TimeSeriesSplit for temporal data** - no random shuffle
7. **Nested CV for unbiased estimates** - inner CV for tuning, outer for evaluation
7. **Entropy regularization** crucial for exploration
8. **Clipping & normalization** - prevents gradient explosion
9. **Implementation details matter** - small bugs compound
10. **Evaluation** - always test with proper metrics, not just reward

---

*Last updated: 2024-11-04*
*Part of: Python Programming Knowledge Base*