# Tidymodels Cheatsheet - Quick Reference

A concise reference for the tidymodels framework.

---

## 1. The Tidymodels Workflow

```
Data → Recipe → Model → Workflow → Tune → Evaluate → Deploy
```

```r
library(tidymodels)
tidymodels_prefer()
```

---

## 1. Recipes (Preprocessing)

```r
library(recipes)

rec <- recipe(target ~ ., data = train) |>
  # Missing values
  step_impute_mean(all_numeric_predictors()) |>
  step_impute_mode(all_nominal_predictors()) |>
  
  # Feature engineering
  step_date(date_col, features = c("year", "month", "dow")) |>
  step_holiday(date, holidays = timeDate::holidayNYSE(2020:2024)) |>
  step_mutate(ratio = var1 / var2) |>
  
  # Encoding
  step_dummy(all_nominal_predictors(), one_hot = TRUE) |>
  step_novel(all_nominal_predictors()) |>
  step_unknown(all_nominal_predictors()) |>
  
  # Scaling
  step_normalize(all_numeric_predictors()) |>
  step_range(all_numeric_predictors(), min = 0, max = 1) |>
  
  # Feature selection
  step_corr(all_numeric_predictors(), threshold = 0.9) |>
  step_zv(all_predictors()) |>
  step_nzv(all_predictors()) |>
  
  # Dimensionality reduction
  step_pca(all_numeric_predictors(), threshold = 0.95) |>
  
  # Text
  step_tokenize(text_col) |>
  step_tokenfilter(text_col, max_tokens = 1000) |>
  step_tfidf(text_col)

# Prep & Bake
prepped <- prep(rec, training = train_data)
train_proc <- bake(rec, new_data = NULL)
test_proc  <- bake(rec, new_data = test_data)
```

### Common Step Functions

| Category | Step Functions |
|--------|----------------|
| **Missing** | `step_impute_mean()`, `step_impute_median()`, `step_impute_mode()`, `step_impute_knn()` |
| **Encoding** | `step_dummy()`, `step_integer()`, `step_ordinalscore()`, `step_targetencode()` |
| **Feature Eng** | `step_date()`, `step_holiday()`, `step_mutate()`, `step_poly()` |
| **Scaling** | `step_normalize()`, `step_range()`, `step_BoxCox()`, `step_YeoJohnson()` |
| **Dim Reduction** | `step_pca()`, `step_ica()`, `step_kpca()` |
| **Feature Sel** | `step_corr()`, `step_zv()`, `step_nzv()`, `step_select()` |
| **Text** | `step_tokenize()`, `step_tokenfilter()`, `step_tfidf()`, `step_word_embeddings()` |
| **Custom** | `step_custom(func = my_fn)` |

---

## 2. Parsnip - Model Specification

```r
library(parsnip)

# Classification
logistic_reg() |> set_engine("glm") |> set_mode("classification")
rand_forest(trees = 1000, mtry = tune(), min_n = tune()) |> set_engine("ranger") |> set_mode("classification")
boost_tree(trees = tune(), tree_depth = tune(), learn_rate = tune()) |> set_engine("xgboost") |> set_mode("classification")
svm_rbf(cost = tune(), rbf_sigma = tune()) |> set_engine("kernlab") |> set_mode("classification")

# Regression
linear_reg(penalty = tune(), mixture = tune()) |> set_engine("glmnet") |> set_mode("regression")
rand_forest(mtry = tune(), min_n = tune()) |> set_engine("ranger") |> set_mode("regression")
boost_tree(trees = tune(), tree_depth = tune(), learn_rate = tune()) |> set_engine("xgboost") |> set_mode("regression")

# Engines per model
show_engines("rand_forest")
show_engines("boost_tree")
show_engines("linear_reg")
```

### Common Engines

| Model | Engines |
|-------|---------|
| `rand_forest()` | `ranger`, `randomForest`, `spark` |
| `boost_tree()` | `xgboost`, `lightgbm`, `C5.0` |
| `linear_reg()` | `glmnet`, `lm`, `stan`, `keras` |
| `logistic_reg()` | `glm`, `glmnet`, `keras`, `stan` |
| `svm_rbf()` | `kernlab`, `LiblineaR` |
| `mlp()` | `nnet`, `keras`, `brulee` |

---

## 3. RsampLe - Resampling

```r
library(rsample)

# Simple split
split <- initial_split(data, prop = 0.8, strata = target)
train <- training(split)
test <- testing(split)

# Cross-validation
vfold_cv(data, v = 10, strata = target)
vfold_cv(data, v = 10, repeats = 3, strata = target)

# Time series
sliding_window(data, lookback = 365, assess_stop = 30)
rolling_origin(data, initial = 365, assess = 30, cumulative = TRUE)

# Bootstrap
bootstraps(data, times = 100, strata = target)

# Grouped
group_vfold_cv(data, group = "id", v = 5)
```

---

## 4. Tune - Hyperparameter Tuning

```r
library(tune)

# Grid types
grid_regular(params, levels = 5)
grid_random(params, size = 20)
grid_latin_hypercube(params, size = 20)
grid_max_entropy(params, size = 20)

# Bayesian
tune_bayes(
  workflow,
  resamples = cv_folds,
  initial = 10,
  iter = 50,
  param_info = params,
  control = control_bayes(verbose = TRUE)
)

# Racing
tune_race_anova(workflow, resamples = cv_folds, grid = grid, control = control_race(verbose = TRUE))
race_bayes(workflow, resamples = cv_folds, grid = grid, control = control_bayes(verbose = TRUE))
```

### Parameter Objects
```r
library(dials)

mtry(range = c(1, 50))
min_n(range = c(2, 40))
learn_rate(range = c(-5, -1))
penalty(range = c(-3, 0))
mixture(range = c(0, 1))
trees(range = c(100, 2000))
tree_depth(range = c(3, 15))
min_n(range = c(2, 40))

# Update ranges
params <- extract_parameter_set_dials(rf_spec)
params |> update(mtry = mtry(c(1, 20)))
finalize(mtry(), data)  # Auto-range based on data
```

---

## 5. Workflows

```r
library(workflows)

# Create
wf <- workflow() |> add_recipe(recipe) |> add_model(model_spec)
# or
wf <- workflow() |> add_formula(target ~ .) |> add_model(model_spec)

# Fit
fitted_wf <- fit(wf, data = train_data)

# Predict
predict(fitted_wf, new_data = test_data)
predict(fitted_wf, new_data = test_data, type = "prob")

# Extract
extract_recipe(fitted_wf)
extract_fit_parsnip(fitted_wf)
extract_fit_engine(fitted_wf)  # native model object

# Update
wf |> update_recipe(new_recipe)
wf |> update_model(new_spec)
```

---

## 6. Yardstick - Evaluation

```r
library(yardstick)

# Classification
metrics <- metric_set(accuracy, precision, recall, f_meas, roc_auc, pr_auc, sens, spec)
metrics(truth, estimate, .pred_class, .pred_yes)

# Multiclass
metrics(truth, estimate, .pred_class, .pred_a, .pred_b, .pred_c)

# Regression
reg_metrics <- metric_set(rmse, mae, mape, rsq, huber_loss)
reg_metrics(truth, estimate)

# Confusion matrix
conf_mat(truth, estimate)
autoplot(conf_mat(truth, estimate), type = "heatmap")

# ROC/PR curves
roc_curve(truth, .pred_yes) |> autoplot()
pr_curve(truth, .pred_yes) |> autoplot()

# Calibration
calibration_plot(truth, .pred_yes)

# By group
data |> group_by(group) |> metrics(truth, estimate)
```

---

## 7. Dials - Parameters

```r
library(dials)

# Parameter objects
mtry(range = c(1, 50))
min_n(range = c(2, 40))
learn_rate(range = c(-5, -1))
penalty(range = c(-3, 0))
mixture(range = c(0, 1))

# From model
params <- extract_parameter_set_dials(rf_spec)
params |> update(mtry = mtry(c(1, 20)))

# Grids
grid_regular(params, levels = 5)
grid_random(params, size = 20)
grid_latin_hypercube(params, size = 20)
grid_max_entropy(params, size = 20)
```

---

## 8. Complete Example

```r
library(tidymodels)
tidymodels_prefer()

# Data
data(ames)
ames <- ames |> mutate(Sale_Price = log10(Sale_Price))
split <- initial_split(ames, prop = 0.8, strata = Sale_Price)
train <- training(split)
test <- testing(split)

# Recipe
rec <- recipe(Sale_Price ~ ., data = train) |>
  step_log(Gr_Liv_Area, Lot_Area, base = 10) |>
  step_nzv(all_predictors()) |>
  step_corr(all_numeric_predictors(), threshold = 0.9) |>
  step_dummy(all_nominal_predictors(), one_hot = TRUE) |>
  step_normalize(all_numeric_predictors())

# Model
rf_spec <- rand_forest(mtry = tune(), min_n = tune(), trees = 1000) |>
  set_engine("ranger", importance = "impurity") |>
  set_mode("regression")

# Workflow
wf <- workflow() |> add_recipe(rec) |> add_model(rf_spec)

# CV
cv_folds <- vfold_cv(train, v = 5, strata = Sale_Price)

# Tune
rf_grid <- grid_regular(mtry(range = c(2, 50)), min_n(range = c(2, 40)), levels = 5)
tune_res <- wf |> tune_grid(cv_folds, grid = rf_grid, metrics = metric_set(rmse, rsq))

# Finalize
best <- select_best(tune_res, metric = "rmse")
final_wf <- finalize_workflow(wf, best)

# Final fit & evaluate
final_fit <- fit(final_wf, data = train)
test_pred <- predict(final_fit, test) |> bind_cols(test)
test_pred %>% metrics(truth = Sale_Price, estimate = .pred)
```

---

## Quick Reference Card

| Task | Function |
|------|----------|
| **Recipe** | `recipe()`, `step_*()`, `prep()`, `bake()` |
| **Model** | `model_type()`, `set_engine()`, `set_mode()` |
| **Workflow** | `workflow()`, `add_recipe()`, `add_model()`, `fit()` |
| **Resample** | `vfold_cv()`, `bootstraps()`, `sliding_window()` |
| **Tune** | `tune_grid()`, `tune_bayes()`, `select_best()` |
| **Finalize** | `finalize_workflow()`, `fit()` |
| **Evaluate** | `metric_set()`, `metrics()`, `conf_mat()`, `roc_curve()` |

---

## Key Resources

- [Tidymodels Website](https://www.tidymodels.org/)
- [Tidy Modeling with R](https://www.tmwr.org/) - Free online book
- [Tidymodels Reference](https://www.tidymodels.org/reference/)

---

*Last updated: 2024-11-04*