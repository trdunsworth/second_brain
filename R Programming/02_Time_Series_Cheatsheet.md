# Time Series Analysis Cheatsheet

A comprehensive reference for time series analysis in R using tidyverse, tsibble, fable, and related packages.

---

## 1. Time Series Data Structures

### 1.1 tsibble - Tidy Time Series
```r
library(tsibble)
library(tsibbledata)
library(lubridate)

# Create tsibble from tibble
tsbl <- tibble(
  date = seq.Date(ymd("2020-01-01"), ymd("2023-12-31"), by = "day"),
  value = rnorm(1461)
) |> 
  as_tsibble(index = date)

# From data frame
df <- tibble(
  date = seq.Date(ymd("2020-01-01"), ymd("2023-12-31"), by = "day"),
  value = rnorm(1461),
  group = rep(c("A", "B"), each = 730)
)
tsbl <- df |> as_tsibble(index = date, key = group)

# Key functions
tsbl |> index_var()        # Index variable
tsbl |> key_vars()         # Key variables
tsbl |> interval()         # Time interval
tsbl |> time_vars()        # Time variables
tsbl |> measured_vars()    # Measured variables
```

### 1.2 Time Series Data Import
```r
library(readr)
library(lubridate)

# Parse dates
df <- read_csv("data.csv") |>
  mutate(date = ymd(date)) |>  # or mdy, dmy, ymd_hms
  arrange(date)

# Handle missing dates
tsbl <- df |> 
  as_tsibble(index = date) |> 
  fill_gaps()  # Fill missing time points with NA

# Regularize irregular series
tsbl |> 
  fill_gaps(.full = TRUE)  # Fill to regular interval
```

---

## 2. Time Series Visualization

### 1. Basic Time Series Plots
```r
library(ggplot2)
library(feasts)

# Basic time series plot
autoplot(tsbl, value) +
  labs(title = "Time Series", y = "Value")

# Multiple series
autoplot(tsbl, .vars = c(value1, value2)) +
  facet_grid(vars(.variable), scales = "free_y")

# Seasonal plots
tsbl |> 
  gg_season(value, period = "year", labels = "both")

# Seasonal subseries
tsbl |> 
  gg_subseries(value)

# Lag plots
tsbl |> 
  gg_lag(value, geom = "point", lags = 1:9)

# Autocorrelation
tsbl |> 
  ACF(value, lag_max = 50) |> 
  autoplot()

# Partial autocorrelation
tsbl |> 
  PACF(value, lag_max = 50) |> 
  autoplot()
```

### 2. Seasonal Decomposition
```r
library(feasts)

# STL decomposition
dcmp <- tsbl |> 
  model(STL(value ~ trend(window = 13) + season(window = "periodic")))

components(dcmp) |> 
  autoplot() +
  theme_minimal()

# Extract components
components(dcmp) |>
  as_tibble() |>
  select(date, value, trend, season_year, remainder)
```

---

## 2. Time Series Feature Engineering

### 1. Date/Time Features
```r
library(tsibble)
library(lubridate)

# Date features
df <- df |> 
  mutate(
    year = year(date),
    quarter = quarter(date),
    month = month(date, label = TRUE),
    week = week(date),
    day = day(date),
    wday = wday(date, label = TRUE),
    day_of_year = yday(date),
    is_weekend = wday(date) %in% c(1, 7),
    is_month_end = day(date) == days_in_month(date),
    quarter = quarter(date),
    semester = semester(date)
  )

# Cyclical encoding
df <- df |>
  mutate(
    month_sin = sin(2 * pi * month / 12),
    month_cos = cos(2 * pi * month / 12),
    day_sin = sin(2 * pi * day / 31),
    day_cos = cos(2 * pi * day / 31),
    hour_sin = sin(2 * pi * hour / 24),
    hour_cos = cos(2 * pi * hour / 24)
  )
```

### 2. Lag Features
```r
library(dplyr)
library(slider)

# Lag features
df <- df |>
  mutate(
    lag_1 = lag(value, 1),
    lag_7 = lag(value, 7),
    lag_30 = lag(value, 30)
  )

# Rolling statistics
df <- df |>
  mutate(
    roll_mean_7 = slide_dbl(value, mean, .before = 6, .after = 0, .complete = TRUE),
    roll_mean_30 = slide_dbl(value, mean, .before = 29, .after = 0, .complete = TRUE),
    roll_sd_7 = slide_dbl(value, sd, .before = 6, .after = 0, .complete = TRUE),
    roll_min_7 = slide_dbl(value, min, .before = 6, .after = 0, .complete = TRUE),
    roll_max_7 = slide_dbl(value, max, .before = 6, .after = 0, .complete = TRUE)
  )

# Expanding window
df <- df |>
  mutate(
    exp_mean = slide_dbl(value, mean, .before = Inf, .complete = TRUE),
    exp_sd = slide_dbl(value, sd, .before = Inf, .complete = TRUE)
  )
```

### 3. Fourier Terms
```r
library(forecast)

# Fourier terms for seasonality
K <- 6  # Number of Fourier terms
fourier_terms <- fourier(ts(data$value, frequency = 365), K = 6)
df <- bind_cols(data, as_tibble(fourier_terms))
```

---

## 3. Time Series Modeling

### 1. ARIMA / SARIMA
```r
library(fable)
library(tsibble)

# ARIMA model
fit_arima <- tsbl |> 
  model(ARIMA(value ~ pdq(2,1,1) + PDQ(1,1,1, period = "year")))

# Auto ARIMA
fit_auto <- tsbl |> 
  model(ARIMA(value))

# Forecast
fc <- fit_auto |> forecast(h = "1 year")
fc |> autoplot(tsbl) + theme_minimal()

# Check residuals
fit_auto |> gg_tsresiduals()
```

### 2. ETS (Exponential Smoothing)
```r
fit_ets <- tsbl |> 
  model(ETS(value ~ error("A") + trend("A") + season("A")))

# Automated ETS
fit_ets_auto <- tsbl |> model(ETS(value))
```

### 3. Prophet
```r
library(prophet)

# Prepare data for Prophet
df_prophet <- df |> 
  select(ds = date, y = value) |> 
  as.data.frame()

# Fit Prophet
m <- prophet(df_prophet, 
             yearly.seasonality = TRUE,
             weekly.seasonality = TRUE,
             daily.seasonality = FALSE)

# Forecast
future <- make_future_dataframe(m, periods = 365)
forecast <- predict(m, future)

# Plot
plot(m, forecast)
prophet_plot_components(m, forecast)
```

### 4. State Space Models (ETS, ARIMA)
```r
# ETS with automatic selection
fit_ets <- tsbl |> 
  model(ETS(value))

# Compare models
models <- tsbl |> 
  model(
    arima = ARIMA(value),
    ets = ETS(value),
    snaive = SNAIVE(value)
  )

# Accuracy comparison
accuracy(models)
```

---

## 4. Machine Learning for Time Series

### 1. Feature Engineering Pipeline
```r
library(recipes)
library(rsample)
library(tune)

# Time series recipe
ts_recipe <- recipe(target ~ ., data = train_data) |>
  step_timeseries_signature(date) |>
  step_rm(ends_with(".iso"), ends_with(".xts"), contains("am.pm"), 
          contains("hour12"), contains("minute"), contains("second")) |>
  step_zv(all_predictors()) |>
  step_normalize(all_numeric_predictors()) |>
  step_rm(date)

# Time series cross-validation
cv_folds <- time_series_cv(train_data, 
                           assess = "3 months", 
                           initial = "1 year",
                           slice_limit = 5,
                           cumulative = TRUE)
```

### 2. Modeltime Framework
```r
library(modeltime)
library(tidymodels)

# Multiple models
model_fit_arima <- arima_reg() |> 
  set_engine("auto_arima") |>
  fit(value ~ date, data = training_data)

model_fit_prophet <- prophet_reg() |> 
  set_engine("prophet") |>
  fit(value ~ date, data = training_data)

model_fit_glmnet <- linear_reg(penalty = 0.1, mixture = 0.5) |>
  set_engine("glmnet") |>
  fit(value ~ ., data = training_data |> select(-date))

# Modeltime table
models_tbl <- modeltime_table(
  model_fit_arima,
  model_fit_prophet,
  model_fit_glmnet
)

# Calibration
calibration_tbl <- models_tbl |>
  modeltime_calibrate(new_data = testing_data)

# Forecast
forecast_tbl <- calibration_tbl |>
  modeltime_forecast(
    new_data = testing_data,
    actual_data = full_data
  )

# Plot
forecast_tbl |> 
  plot_modeltime_forecast(.interactive = FALSE)
```

### 3. Cross-Validation for Time Series
```r
library(rsample)

# Time series CV
ts_cv <- time_series_cv(
  data, 
  date_var = date,
  initial = "2 years",
  assess = "6 months",
  skip = "3 months",
  slice_limit = 6
)

# Rolling origin
rolling_cv <- rolling_origin(
  data, 
  initial = "2 years", 
  assess = "6 months",
  skip = "3 months",
  cumulative = TRUE
)

# Sliding window
sliding_cv <- sliding_window(data, lookback = "1 year", assess = "3 months")
```

---

## 5. Model Evaluation

### 1. Accuracy Metrics
```r
library(yardstick)

# Regression metrics
metrics <- metric_set(rmse, mae, mape, rsq, huber_loss)

# Evaluate
results <- test_data |> 
  bind_cols(predictions) |> 
  metrics(truth = actual, estimate = .pred)

# By group
results |> group_by(group) |> metrics(truth, estimate)
```

### 2. Forecast Visualization
```r
# Prediction intervals
forecast |> 
  ggplot(aes(x = date)) +
  geom_ribbon(aes(ymin = .lower, ymax = .upper), alpha = 0.3, fill = "blue") +
  geom_line(aes(y = .mean), color = "blue") +
  geom_point(data = test_data, aes(x = date, y = actual), color = "red") +
  theme_minimal()

# Coverage
mean(test_data$actual >= forecast$.lower & test_data$actual <= forecast$.upper)
```

---

## 3. Advanced Topics

### 1. Hierarchical Time Series
```r
library(fable)
library(tsibble)

# Hierarchical structure
hts_data <- tsbl |> 
  aggregate_key(region * category, value = sum(value))

# Hierarchical reconciliation
fit_hier <- hts_data |> 
  model(base = ARIMA(value), 
        reconciled = reconciliation(bu, 
          ARIMA(value) ~ reconciliate(bu)
        )
  )

# Reconciled forecasts
fc <- fit_hier |> forecast(h = "1 year")
```

### 2. Transfer Learning / Transfer Learning
```r
# Pre-trained model fine-tuning
library(modeltime)
library(parsnip)

# Use pre-trained model as feature extractor
# Then fine-tune on target domain
```

---

## 5. Advanced Visualization

### 1. Interactive Plots
```r
library(plotly)
library(ggiraph)

# Interactive plotly
p <- ggplot(tsbl, aes(date, value)) + geom_line()
ggplotly(p)

# ggiraph interactive
library(ggiraph)
gg <- ggplot(tsbl, aes(date, value, tooltip = date, data_id = date)) +
  geom_line_interactive()
girafe(ggobj = p)
```

### 2. Forecast Visualization
```r
# Fan chart
library(fanplot)
fan(forecast_matrix, probs = c(0.1, 0.25, 0.5, 0.75, 0.9, 0.95))

# Fan chart with ggplot
forecast_df %>% 
  ggplot(aes(x = date)) +
  geom_ribbon(aes(ymin = .lower, ymax = .upper, fill = factor(.level)), 
              alpha = 0.3) +
  geom_line(aes(y = .mean), color = "blue") +
  geom_line(data = test_data, aes(date, actual), color = "red") +
  scale_fill_brewer(palette = "Blues") +
  theme_minimal()
```

---

## 6. Production Deployment

### 1. Model Serialization
```r
library(vetiver)
library(pins)

# Save model
v <- vetiver_model(fitted_model, "model_name")
vetiver_pin_write(board, v)

# API deployment
library(plumber)
#* @post /predict
function(req) {
  new_data <- jsonlite::fromJSON(req$postBody)
  predict(v, new_data)
}
```

### 2. Monitoring
```r
# Data drift monitoring
library(evidently)

# Data drift report
report <- Report(metrics=[DataDriftPreset()])
report.run(reference_data=ref_data, current_data=curr_data)
report.save_html("drift_report.html")

# Performance monitoring
monitor_performance <- function(predictions, actuals) {
  metrics <- yardstick::metrics(
    data.frame(actual = actuals, predicted = predictions),
    truth = actual, estimate = predicted
  )
  # Alert if metrics degrade
  if (metrics$.estimate < threshold) alert()
}
```

---

## Quick Reference: Time Series Function Map

| Task | Function/Package |
|------|------------------|
| **Create tsibble** | `as_tsibble()`, `build_tsibble()` |
| **Fill gaps** | `fill_gaps()`, `fill_na()` |
| **Resample** | `index_by() + summarise()` |
| **Rolling windows** | `slider::slide_*()`, `slider::slide_period()` |
| **Lag/lead** | `lag()`, `lead()`, `slide()` |
| **Rolling stats** | `slider::slide_dbl()`, `RcppRoll::roll_mean()` |
| **Decomposition** | `feasts::STL()`, `decompose()`, `stl()` |
| **ACF/PACF** | `ACF()`, `PACF()`, `forecast::Acf()` |
| **ARIMA** | `fable::ARIMA()`, `forecast::auto.arima()` |
| **ETS** | `fable::ETS()` |
| **Prophet** | `prophet::prophet()` |
| **Forecast** | `forecast()`, `modeltime::modeltime_forecast()` |
| **Cross-validation** | `rsample::time_series_cv()`, `sliding_window()` |
| **Metrics** | `yardstick::metric_set()`, `accuracy()` |
| **Visualization** | `autoplot()`, `gg_season()`, `gg_subseries()`, `gg_lag()` |

---

## Key Packages for Time Series

| Category | Packages |
|----------|----------|
| **Core** | tsibble, fable, feasts, tsibbledata |
| **Modeling** | fable, forecast, prophet, modeltime |
| **Preprocessing** | recipes, slider, lubridate, timetk |
| **Resampling** | rsample, timetk |
| **Metrics** | yardstick, accuracy |
| **Visualization** | feasts, ggplot2, patchwork, plotly |
| **Monitoring** | evidently, whyLogs |

---

*Last updated: 2024-11-04*