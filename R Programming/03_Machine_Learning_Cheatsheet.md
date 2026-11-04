# Machine Learning Cheatsheet

A comprehensive reference for machine learning in R using tidymodels, mlr3, and related packages.

---

## 1. ML Workflow Overview

### 1.1 Tidymodels Framework
```
Data ──► Recipe ──► Model ──► Workflow ──► Tune ──► Evaluate
   │        │         │          │          │        │
   │        │         │          │          │        └── yardstick
│    │        │         │          │          └── tune, dials
│    │        │         │          └──────────── workflows
│    │        │         └────────────────────── parsnip
│    │        └──────────────────────────── recipes
│    └──────────────────────────────────── rsample
```

### Core Packages
```r
library(tidymodels)
tidymodels_prefer()  # Resolve conflicts
```

---

## 2. Data Preprocessing with recipes

### 1. Recipe Basics
```r
library(recipes)

# Basic recipe
rec <- recipe(target ~ ., data = train_data) |>
  # Missing values
  step_impute_mean(all_numeric_predictors()) |>
  step_impute_mode(all_nominal_predictors()) |>
  
  # Feature engineering
  step_date(date_col, features = c("year", "month", "dow")) |>
  step_holiday(date, holidays = timeDate::holidayNYSE(2020:2024)) |>
  step_mutate(new_feat = var1 / var2) |>
  
  # Encoding
  step_dummy(all_nominal_predictors(), one_hot = TRUE) |>
  step_novel(all_nominal_predictors()) |>
  step_unknown(all_nominal_predictors()) |>
  
  # Scaling
  step_normalize(all_numeric_predictors()) |>
  step_range(all_numeric_predictors(), min = 0, max = 1) |>
  step_BoxCox(all_numeric_predictors()) |>
  
  # Feature selection
  step_corr(all_numeric_predictors(), threshold = 0.9) |>
  step_zv(all_predictors()) |>
  step_nzv(all_predictors()) |>
  
  # Dimensionality reduction
  step_pca(all_numeric_predictors(), threshold = 0.95) |>
  step_ica(all_numeric_predictors(), num_comp = 5)

# Prep and bake
prepped <- prep(recipe, training = train_data)
train_processed <- bake(recipe, new_data = NULL)
test_processed <- bake(recipe, new_data = test_data)
```

### 2. Common Recipe Steps
```r
# Missing values
step_impute_mean(all_numeric_predictors())
step_impute_median(all_numeric_predictors())
step_impute_mode(all_nominal_predictors())
step_impute_knn(all_predictors(), neighbors = 5)

# Encoding
step_dummy(all_nominal_predictors(), one_hot = TRUE)
step_integer(all_nominal_predictors())
step_ordinalscore(all_nominal_predictors())
step_targetencode(target ~ predictor)

# Text
step_tokenize(text_col) |>
  step_tokenfilter(max_tokens = 1000) |>
  step_tfidf(text_col)

# Feature extraction
step_pca(all_numeric_predictors(), threshold = 0.95)
step_ica(all_numeric_predictors(), num_comp = 5)
step_kpca(~ ., kernel = "rbfdot")

# Custom step
step_custom(
  func = my_function,
  prefix = "custom_"
)
```

---

## 2. Model Specification with parsnip

### 1. Model Specification
```r
library(parsnip)

# Classification
logistic_spec <- logistic_reg() |>
  set_engine("glm") |>
  set_mode("classification")

rf_spec <- rand_forest(
  trees = 1000,
  mtry = tune(),
  min_n = tune()
) |>
  set_engine("ranger", importance = "impurity") |>
  set_mode("classification")

xgb_spec <- boost_tree(
  trees = tune(),
  tree_depth = tune(),
  learn_rate = tune(),
  min_n = tune()
) |>
  set_engine("xgboost") |>
  set_mode("classification")

svm_spec <- svm_rbf(
  cost = tune(),
  rbf_sigma = tune()
) |>
  set_engine("kernlab") |>
  set_mode("classification")

# Regression
linear_spec <- linear_reg(
  penalty = tune(),
  mixture = tune()
) |>
  set_engine("glmnet") |>
  set_mode("regression")

rf_reg_spec <- rand_forest(
  mtry = tune(),
  min_n = tune()
) |>
  set_engine("ranger") |>
  set_mode("regression")

# Available engines
show_engines("rand_forest")
show_engines("boost_tree")
show_engines("linear_reg")
```

---

## 3. Resampling with rsample

### 1. Data Splitting
```r
library(rsample)

# Simple split
split <- initial_split(data, prop = 0.8, strata = target)
train <- training(split)
test <- testing(split)

# Cross-validation
cv_folds <- vfold_cv(train_data, v = 10, strata = target)
cv_folds <- vfold_cv(train_data, v = 10, repeats = 3, strata = target)

# Time series
ts_cv <- sliding_window(train_data, lookback = 365, assess_stop = 30)
ts_cv <- rolling_origin(train_data, initial = 365, assess = 30, cumulative = TRUE)

# Bootstrapping
boots <- bootstraps(train_data, times = 100, strata = target)

# Grouped
group_cv <- group_vfold_cv(data, group = "id", v = 5)
```

---

## 4. Hyperparameter Tuning with tune

### 1. Grid Search
```r
library(tune)

# Define parameter grid
rf_grid <- grid_regular(
  mtry(range = c(2, 50)),
  min_n(range = c(2, 40)),
  levels = 5
)

# Random grid
rf_random <- grid_random(
  mtry(range = c(2, 50)),
  min_n(range = c(2, 40)),
  size = 20
)

# Latin hypercube
rf_lhs <- grid_latin_hypercube(
  mtry(range = c(2, 50)),
  min_n(range = c(2, 40)),
  size = 20
)

# Bayesian optimization
tune_bayes(
  workflow,
  resamples = cv_folds,
  initial = 10,
  iter = 50,
  param_info = params,
  control = control_bayes(verbose = TRUE)
)
```

### 2. Tuning Workflow
```r
# Workflow with tuning
wf <- workflow() |>
  add_recipe(recipe) |>
  add_model(rf_spec)

# Tune grid
tune_results <- wf |>
  tune_grid(
    resamples = cv_folds,
    grid = rf_grid,
    metrics = metric_set(accuracy, roc_auc, f_meas),
    control = control_grid(
      save_pred = TRUE,
      save_workflow = TRUE,
      verbose = TRUE,
      allow_par = TRUE
    )
  )

# Select best
best_params <- select_best(tune_results, metric = "roc_auc")
final_wf <- finalize_workflow(wf, best_params)
```

---

## 5. Model Evaluation with yardstick

### 1. Classification Metrics
```r
library(yardstick)

# Metric sets
class_metrics <- metric_set(
  accuracy, precision, recall, f_meas,
  roc_auc, pr_auc, sens, spec,
  ppv, npv, detection_prevalence,
  balanced_accuracy, kappa
)

# Binary classification
metrics(truth, estimate, .pred_class, .pred_yes)

# Multiclass
metrics(truth, estimate, .pred_class, .pred_a, .pred_b, .pred_c)

# Confusion matrix
conf_mat(truth, estimate)
autoplot(conf_mat(truth, estimate), type = "heatmap")

# ROC curve
roc_curve(truth, .pred_yes) |> autoplot()
pr_curve(truth, .pred_yes) |> autoplot()

# Calibration
calibration_plot(truth, .pred_yes)
```

### Regression Metrics
```r
reg_metrics <- metric_set(rmse, mae, mape, rsq, huber_loss)

metrics(truth, estimate)
reg_metrics(truth, estimate, .pred)
```

---

## 6. Workflows

### 1. Complete Pipeline
```r
library(workflows)

# Create workflow
wf <- workflow() |>
  add_recipe(recipe) |>
  add_model(model_spec)

# Or with formula
wf <- workflow() |>
  add_formula(target ~ .) |>
  add_model(model_spec)

# Fit
fitted_wf <- fit(wf, data = train_data)

# Predict
predict(fitted_wf, new_data = test_data)
predict(fitted_wf, new_data = test_data, type = "prob")

# Extract components
extract_recipe(fitted_wf)
extract_fit_parsnip(fitted_wf)
extract_fit_engine(fitted_wf)

# Update components
wf |> update_recipe(new_recipe)
wf |> update_model(new_spec)
```

---

## 6. Advanced Tuning

### 1. Bayesian Optimization
```r
library(finetune)

tune_bayes(
  workflow,
  resamples = cv_folds,
  initial = 10,
  iter = 50,
  param_info = params,
  control = control_bayes(
    verbose = TRUE,
    no_improve = 10,
    uncertain = 5,
    seed = 123
  )
)
```

### 2. Racing Methods
```r
# ANOVA race
race_anova(
  workflow,
  resamples = cv_folds,
  grid = rf_grid,
  control = control_race(verbose = TRUE)
)

# Bayesian race
race_bayes(
  workflow,
  resamples = cv_folds,
  grid = rf_grid,
  control = control_bayes(verbose = TRUE)
)
```

---

## 7. Model Evaluation & Interpretation

### 1. Variable Importance
```r
library(vip)
library(DALEX)

# VIP
vip(fitted_model, num_features = 20)

# Permutation importance
vi_fitted <- vi(fitted_model)

# SHAP values
library(fastshap)
shap_values <- explain(model, X = train_data[, -1], pred_wrapper = predict)

# DALEX explainer
explainer <- explain(model, data = test_data[, -1], y = test_data$target)
mp <- model_parts(explainer)
plot(mp)
```

### 2. Partial Dependence
```r
library(pdp)

# Partial dependence
pdp <- partial(model, pred.var = "feature", train = train_data)
plotPartial(pdp)

# ICE curves
partial(model, pred.var = "feature", ice = TRUE) |> 
  plotPartial()
```

---

## 7. Model Deployment

### 1. Model Serialization
```r
library(bundle)
library(vetiver)

# Bundle workflow
bundled_wf <- bundle(fitted_wf)
saveRDS(bundled_wf, "model_bundle.rds")

# Load
bundled_wf <- readRDS("model_bundle.rds")
predict(bundled_wf, new_data = new_data)

# Vetiver for API deployment
library(vetiver)
v <- vetiver_model(fitted_wf, "my_model")
vetiver_pin_write(board, v)
```

### 2. API Deployment (Plumber)
```r
# plumber.R
#* @apiTitle ML Model API
#* @param input_data JSON input
#* @post /predict
function(input_data) {
  new_data <- jsonlite::fromJSON(input_data)
  predict(bundled_wf, new_data)
}
```

---

## 8. Quick Reference

### Key Functions Cheatsheet

| Task | Function |
|------|----------|
| Create recipe | `recipe()` |
| Add preprocessing step | `step_*()` |
| Prep recipe | `prep()` |
| Apply recipe | `bake()` |
| Specify model | `model_type()` |
| Set engine | `set_engine()` |
| Set mode | `set_mode()` |
| Create workflow | `workflow()` |
| Add recipe | `add_recipe()` |
| Add model | `add_model()` |
| Fit workflow | `fit()` |
| Predict | `predict()` |
| Cross-validate | `vfold_cv()` |
| Tune grid | `tune_grid()` |
| Select best | `select_best()` |
| Finalize | `finalize_workflow()` |
| Evaluate | `metric_set()` |

### Key Functions Cheatsheet

| Task | Function |
|------|----------|
| **Preprocessing** | |
| Create recipe | `recipe()` |
| Add step | `step_*()` |
| Prep recipe | `prep()` |
| Apply recipe | `bake()` |
| **Modeling** | |
| Specify model | `model_type()` |
| Set engine | `set_engine()` |
| Set mode | `set_mode()` |
| **Workflow** | |
| Create workflow | `workflow()` |
| Add recipe | `add_recipe()` |
| Add model | `add_model()` |
| Fit | `fit()` |
| Predict | `predict()` |
| **Resampling** | |
| Initial split | `initial_split()` |
| CV folds | `vfold_cv()` |
| Bootstrap | `bootstraps()` |
| **Tuning** | |
| Grid search | `tune_grid()` |
| Bayes opt | `tune_bayes()` |
| Select best | `select_best()` |
| Finalize | `finalize_workflow()` |
| **Evaluation** | |
| Metrics | `metric_set()` |
| Metrics calc | `metrics()` |
| Confusion matrix | `conf_mat()` |
| ROC curve | `roc_curve()` |

---

## Key Takeaways

1. **Separate concerns**: Recipe (preprocessing) + Model (parsnip) + Workflow
2. **Cross-validation** with rsample for robust estimates
3. **Tune with purpose**: Grid → Random → Bayesian → Racing
4. **Evaluate properly** - yardstick for metrics, calibration plots
6. **Monitor in production** - track performance, drift, data quality
8. **Version everything** - code, data, models, environment (renv)
10. **Document decisions** - model cards, decision records