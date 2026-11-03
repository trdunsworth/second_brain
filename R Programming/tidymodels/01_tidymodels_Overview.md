# Tidymodels Overview

A comprehensive guide to the tidymodels framework - a collection of packages for modeling and machine learning using tidyverse principles.

## 1. What is Tidymodels?

Tidymodels is a collection of packages for modeling and machine learning using tidyverse principles:
- **Consistent interfaces** across models
- **Tidy data** principles throughout
- **Resampling-based** validation
- **Tuning** with modern optimization
- **Interpretability** built-in

### Core Packages
| Package | Purpose | Key Functions |
|---------|---------|---------------|
| **parsnip** | Model specification | `linear_reg()`, `rand_forest()`, `boost_tree()`, `fit()`, `predict()` |
| **recipes** | Preprocessing | `recipe()`, `step_*()`, `prep()`, `bake()` |
| **rsample** | Resampling | `vfold_cv()`, `bootstraps()`, `initial_split()` |
| **tune** | Hyperparameter tuning | `tune_grid()`, `tune_bayes()`, `tune_race()` |
| **workflows** | Pipeline management | `workflow()`, `add_recipe()`, `add_model()`, `fit()` |
| **yardstick** | Model evaluation | `accuracy()`, `roc_auc()`, `rmse()`, `conf_mat()` |
| **dials** | Parameter tuning | `param_info()`, `grid_regular()`, `grid_random()` |
| **modeldata** | Example datasets | `ames`, `credit_data`, `penguins` |

### Installation
```r
install.packages("tidymodels")
library(tidymodels)
tidymodels_prefer()  # Resolve conflicts
```

---

## 2. Core Concepts

### 1. The Tidymodels Framework
```
┌─────────────────────────────────────────────────────────────────┐
│                    TIDYMODELS FRAMEWORK                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Data ──► Recipe ──► Model ──► Workflow ──► Tune ──► Evaluate  │
│    │        │         │          │          │        │          │
│    │        │         │          │          │        └── yardstick│
│    │        │         │          │          └── tune, dials      │
│    │        │         │          └──────────── workflows        │
│    │        │         └────────────────────── parsnip          │
│    │        └──────────────────────────── recipes               │
│    └──────────────────────────────────── rsample                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Key Principles
- **Separation of concerns**: Preprocessing (recipe) separate from model (parsnip)
- **Declarative syntax**: Describe what you want, not how to do it
- **Tidy data in, tidy data out**: All inputs/outputs are tibbles
- **Composable**: Mix and match components

---

## 3. Core Components Deep Dive

### 1. parsnip - Model Specification

```r
library(tidymodels)

# Classification models
logistic_spec <- logistic_reg() |>
  set_engine("glm") |>
  set_mode("classification")

rf_spec <- rand_forest(
  trees = 1000,
  mtry = tune(),
  min_n = tune()
) |>
  set_engine("ranger") |>
  set_mode("classification")

xgb_spec <- boost_tree(
  trees = tune(),
  tree_depth = tune(),
  learn_rate = tune(),
  min_n = tune()
) |>
  set_engine("xgboost") |>
  set_mode("classification")

# Regression models
linear_spec <- linear_reg(
  penalty = tune(),
  mixture = tune()
) |>
  set_engine("glmnet") |>
  set_mode("regression")

# Available engines per model type
show_engines("rand_forest")
show_engines("boost_tree")
show_engines("linear_reg")
```

### 2. recipes - Preprocessing

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
  step_mutate(new_feature = var1 / var2) |>
  
  # Encoding
  step_dummy(all_nominal_predictors(), one_hot = TRUE) |>
  step_novel(all_nominal_predictors()) |>
  step_unknown(all_nominal_predictors()) |>
  
  # Scaling/normalization
  step_normalize(all_numeric_predictors()) |>
  step_range(all_numeric_predictors(), min = 0, max = 1) |>
  step_BoxCox(all_numeric_predictors()) |>
  step_YeoJohnson(all_numeric_predictors()) |>
  
  # Feature selection
  step_corr(all_numeric_predictors(), threshold = 0.9) |>
  step_zv(all_predictors()) |>
  step_nzv(all_predictors()) |>
  
  # Dimensionality reduction
  step_pca(all_numeric_predictors(), threshold = 0.95) |>
  step_ica(all_numeric_predictors(), num_comp = 5) |>
  
  # Text
  step_tokenize(text_col) |>
  step_tokenfilter(text_col, max_tokens = 1000) |>
  step_tfidf(text_col) |>
  
  # Custom
  step_custom(
    func = my_custom_function,
    prefix = "custom_"
  )

# Prep and bake
prepped <- prep(recipe, training = train_data)
train_processed <- bake(recipe, new_data = NULL)
test_processed <- bake(recipe, new_data = test_data)
```

### 3. rsample - Resampling

```r
library(rsample)

# Initial split
split <- initial_split(data, prop = 0.8, strata = target)
train_data <- training(split)
test_data <- testing(split)

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

# Nested CV
nested_cv <- nested_cv(train_data, outside = vfold_cv(v = 5), inside = vfold_cv(v = 3))

# Extract splits
cv_folds$splits[[1]] |> analysis()  # Training data
cv_folds$splits[[1]] |> assessment() # Validation data
```

### 4. tune - Hyperparameter Tuning

```r
library(tune)

# Define parameter grid
rf_grid <- grid_regular(
  mtry(range = c(2, 20)),
  min_n(range = c(2, 40)),
  trees = 1000,
  levels = 5
)

# Random grid
rf_random <- grid_random(
  mtry(range = c(2, 20)),
  min_n(range = c(2, 40)),
  trees = 1000,
  size = 20
)

# Latin hypercube
rf_lhs <- grid_latin_hypercube(
  mtry(range = c(2, 20)),
  min_n(range = c(2, 40)),
  size = 20
)

# Bayesian optimization
library(finetune)
tune_bayes(
  workflow,
  resamples = cv_folds,
  initial = 10,
  iter = 50,
  param_info = params,
  control = control_bayes(verbose = TRUE)
)

# Racing
tune_race_anova(
  workflow,
  resamples = cv_folds,
  grid = rf_grid,
  control = control_race(verbose = TRUE)
)
```

### 5. workflows - Pipeline Management

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
extract_fit_engine(fitted_wf)  # Native model object

# Update components
wf |> update_recipe(new_recipe)
wf |> update_model(new_spec)
```

### 5. yardstick - Model Evaluation

```r
library(yardstick)

# Classification metrics
metrics <- metric_set(
  accuracy, precision, recall, f_meas,
  roc_auc, pr_auc, sens, spec,
  ppv, npv, detection_prevalence,
  balanced_accuracy, kappa
)

# Binary classification
metrics(truth, estimate, .pred_class, .pred_yes)

# Multiclass
metrics(truth, estimate, .pred_class, .pred_a, .pred_b, .pred_c)

# Regression
reg_metrics <- metric_set(rmse, rsq, mae, mape, huber_loss)

# By group
metrics_by_group <- data |>
  group_by(group) |>
  metrics(truth, estimate)

# Confusion matrix
conf_mat(truth, estimate)
autoplot(conf_mat(truth, estimate), type = "heatmap")

# ROC curve
roc_curve(truth, .pred_yes) |> autoplot()
pr_curve(truth, .pred_yes) |> autoplot()

# Calibration
calibration_plot(truth, .pred_yes)
```

### 6. dials - Parameter Tuning

```r
library(dials)

# Parameter objects
mtry_param <- mtry(range = c(1, 20))
min_n_param <- min_n(range = c(2, 40))
learn_rate_param <- learn_rate(range = c(-5, -1))
penalty_param <- penalty(range = c(-3, 0))
mixture_param <- mixture(range = c(0, 1))

# Parameter objects from model
params <- extract_parameter_set_dials(rf_spec)

# Update ranges
params |> update(mtry = mtry(c(1, 50)))

# Grid creation
grid_regular(params, levels = 5)
grid_random(params, size = 20)
grid_latin_hypercube(params, size = 20)
grid_max_entropy(params, size = 20)

# Parameter transformations
finalize(mtry(), data)  # Update ranges based on data
```

---

## 4. Complete Workflow Example

### End-to-End Classification
```r
library(tidymodels)
tidymodels_prefer()

# 1. Data preparation
data(ames)
ames <- ames |> mutate(Sale_Price = log10(Sale_Price))

# Split
set.seed(123)
split <- initial_split(ames, prop = 0.8, strata = Sale_Price)
train <- training(split)
test <- testing(split)

# 2. Recipe
ames_rec <- recipe(Sale_Price ~ ., data = train) |>
  step_log(Gr_Liv_Area, Lot_Area, base = 10) |>
  step_nzv(all_predictors()) |>
  step_corr(all_numeric_predictors(), threshold = 0.9) |>
  step_zv(all_predictors()) |>
  step_dummy(all_nominal_predictors(), one_hot = TRUE) |>
  step_normalize(all_numeric_predictors())

# 3. Model spec
rf_spec <- rand_forest(
  mtry = tune(),
  min_n = tune(),
  trees = 1000
) |>
  set_engine("ranger", importance = "impurity") |>
  set_mode("regression")

# 4. Workflow
wf <- workflow() |>
  add_recipe(ames_rec) |>
  add_model(rf_spec)

# 5. Cross-validation
set.seed(123)
cv_folds <- vfold_cv(train, v = 5, strata = Sale_Price)

# 6. Tuning
rf_grid <- grid_regular(
  mtry(range = c(2, 50)),
  min_n(range = c(2, 40)),
  levels = 5
)

tune_results <- wf |>
  tune_grid(
    resamples = cv_folds,
    grid = rf_grid,
    metrics = metric_set(rmse, rsq, mae),
    control = control_grid(
      save_pred = TRUE,
      save_workflow = TRUE,
      verbose = TRUE,
      allow_par = TRUE
    )
  )

# 5. Select best
best_params <- select_best(tune_results, metric = "rmse")
final_wf <- finalize_workflow(wf, best_params)

# 6. Final fit
final_fit <- fit(final_wf, data = train)

# 7. Evaluate
test_pred <- predict(final_fit, test) |> bind_cols(test)
metrics <- metric_set(rmse, rsq, mae)
test_pred %>% metrics(truth = Sale_Price, estimate = .pred)
```

---

## 5. Advanced Topics

### 5.1 Custom Models in parsnip
```r
# Custom model implementation
custom_rf <- function(mode = "regression") {
  new_model_spec(
    "custom_rf",
    args = list(
      mtry = new_param("mtry"),
      trees = new_param("trees"),
      min_n = new_param("min_n")
    ),
    eng_args = NULL,
    mode = mode,
    method = NULL,
    engine = NULL
  )
}

# Register methods
set_fit(
  model = "custom_rf",
  eng = "ranger",
  mode = "regression",
  value = function(object, ...) {
    ranger::ranger(...)
  }
)

set_pred(
  model = "custom_rf",
  eng = "ranger",
  mode = "regression",
  value = function(object, new_data, ...) {
    predict(object, data = new_data)$predictions
  }
)
```

### 5.2 Custom Recipes Steps
```r
# Custom step
step_my_transform <- function(recipe, ..., role = "predictor", trained = FALSE, columns = NULL) {
  add_step(recipe, step_my_transform_new(
    terms = enquos(...),
    trained = trained,
    columns = columns
  ))
}

step_my_transform_new <- function(terms, trained, columns) {
  step(
    subclass = "my_transform",
    terms = terms,
    trained = trained,
    columns = columns
  )
}

#' @export
prep.step_my_transform <- function(x, training, info = NULL) {
  col_names <- recipes_eval_select(x$terms, training, info)
  step_my_transform_new(
    terms = x$terms,
    trained = TRUE,
    columns = col_names
  )
}

#' @export
bake.step_my_transform <- function(object, new_data, ...) {
  # Transform new_data
  new_data
}

# Register
register_step(step_my_transform)
```

### 5.3 Custom Metrics in yardstick
```r
# Custom metric
my_metric <- function(truth, estimate, ...) {
  # Custom calculation
  metric_vec(truth, estimate)
}

my_metric_vec <- function(truth, estimate, na_rm = TRUE, ...) {
  # Vectorized implementation
}

# Register with yardstick
metric_set(my_metric, accuracy, roc_auc)
```

---

## 6. Advanced Tuning Strategies

### 8.1 Bayesian Optimization
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

### 8.2 Racing Methods
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

### 8.3 Multi-metric Optimization
```r
tune_grid(
  wf,
  resamples = cv_folds,
  grid = grid,
  metrics = metric_set(accuracy, roc_auc, f_meas, sens, spec),
  control = control_grid(
    save_pred = TRUE,
    parallel_over = "everything"
  )
) |>
  collect_metrics() |>
  filter(.metric == "roc_auc") |>
  arrange(desc(mean))
```

---

## 7. Production Deployment

### 9.1 Model Serialization
```r
# Save workflow
library(bundle)
bundled_wf <- bundle(fitted_wf)
saveRDS(bundled_wf, "model_bundle.rds")

# Load
bundled_wf <- readRDS("model_bundle.rds")
predict(bundled_wf, new_data = new_data)

# Or with vetiver
library(vetiver)
v <- vetiver_model(fitted_wf, "my_model")
vetiver_pin_write(board, v)
```

### 9.2 API Deployment (Plumber)
```r
# plumber.R
#* @apiTitle ML Model API
#* @param input_data JSON input
#* @post /predict
function(input_data) {
  new_data <- jsonlite::fromJSON(input_data)
  predict(bundled_wf, new_data)
}

# Dockerfile
# FROM rocker/r-ver:4.3.0
# COPY model_bundle.rds /app/
# COPY plumber.R /app/
# EXPOSE 8000
# CMD ["R", "-e", "pr <- plumber::plumb('/app/plumber.R'); pr$run(host='0.0.0.0', port=8000)"]
```

### 9.3 Docker Deployment
```dockerfile
# Dockerfile
FROM rocker/r-ver:4.3.0

# System dependencies
RUN apt-get update && apt-get install -y \
    libssl-dev libcurl4-openssl-dev libxml2-dev

# R packages
RUN R -e "install.packages(c('tidymodels', 'plumber', 'vetiver'), repos='https://cloud.r-project.org/')"

COPY model_bundle.rds /app/
COPY plumber.R /app/

EXPOSE 8000
CMD ["R", "-e", "pr <- plumber::plumb('/app/plumber.R'); pr$run(host='0.0.0.0', port=8000)"]
```

---

## 10. Key Takeaways

1. **Separate preprocessing from modeling** - recipes for preprocessing, parsnip for models
2. **Use workflows** to bundle preprocessing + model + post-processing
3. **Cross-validation** with rsample for robust estimates
7. **Tune with purpose** - grid search → random → Bayesian → racing
8. **Evaluate properly** - yardstick for metrics, calibration plots
8. **Monitor in production** - track performance, drift, data quality
9. **Version everything** - code, data, models, environment (renv)
10. **Document decisions** - model cards, decision records

---

## 10. Quick Reference

### Common Workflows
```r
# Quick classification
wf <- workflow() %>%
  add_recipe(recipe(y ~ ., data) %>% step_dummy(all_nominal())) %>%
  add_model(rand_forest() %>% set_engine("ranger") %>% set_mode("classification")) %>%
  fit(data)

# Quick regression
wf <- workflow() %>%
  add_recipe(recipe(y ~ ., data) %>% step_normalize(all_numeric())) %>%
  add_model(linear_reg() %>% set_engine("glmnet") %>% set_mode("regression")) %>%
  fit(data)

# Quick tuning
tune_grid(wf, resamples = cv_folds, grid = 20) %>% select_best("rmse")
```

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