# Time Series Analysis Cheatsheet

A comprehensive reference for time series analysis in Python using pandas, statsmodels, statsforecast, and related libraries.

---

## 1. Time Series Data Structures

### 1.1 pandas DatetimeIndex
```python
import pandas as pd
import numpy as np

# Create DatetimeIndex
dates = pd.date_range('2020-01-01', periods=100, freq='D')
ts = pd.Series(np.random.randn(100), index=pd.date_range('2020-01-01', periods=100, freq='D'))

# From strings
idx = pd.to_datetime(['2020-01-01', '2020-01-02', '2020-01-03'])

# Date ranges
pd.date_range('2020-01-01', periods=100, freq='D')
pd.date_range('2020-01-01', '2020-12-31', freq='M')
pd.date_range('2020-01-01', periods=10, freq='H')
```

### 1.2 Time Series Properties
```python
ts.index.freq          # Frequency
ts.index.inferred_freq # Inferred frequency
ts.index.year          # Year component
ts.index.month         # Month
ts.index.quarter       # Quarter
ts.index.day           # Day
ts.index.dayofweek     # Day of week (0=Monday)
ts.index.dayofyear     # Day of year
ts.index.is_month_start
ts.index.is_month_end
ts.index.is_quarter_start
ts.index.is_quarter_end
```

---

## 2. Time Series Operations

### 1. Resampling & Frequency Conversion
```python
# Downsample (aggregate)
ts.resample('D').mean()      # Daily
ts.resample('W').sum()       # Weekly
ts.resample('M').sum()       # Month end
ts.resample('Q').mean()      # Quarter end
ts.resample('A').sum()       # Year end

# Custom aggregation
ts.resample('W').agg(['mean', 'sum', 'std', 'count'])

# Upsample (interpolate)
ts.resample('H').interpolate('time')
ts.resample('H').ffill()     # Forward fill
ts.resample('H').bfill()     # Backward fill
ts.resample('H').interpolate(method='time')
```

### 2. Rolling Windows
```python
# Rolling window
ts.rolling(window=7).mean()           # Simple moving average
ts.rolling(window=7, min_periods=1).mean()
ts.rolling(7).std()                   # Rolling std
ts.rolling(7).apply(lambda x: x.max() - x.min())  # Custom

# Exponential weighting
ts.ewm(span=12).mean()                # EWMA
ts.ewm(span=12, adjust=False).mean()  # Equivalent to pandas ewm

# Expanding window
ts.expanding().mean()                 # Expanding mean

# Rolling with custom function
ts.rolling(7).apply(lambda x: x.max() - x.min())
```

### 3. Shifting & Lagging
```python
# Lag/Lead
ts.shift(1)           # Lag 1
ts.shift(-1)          # Lead 1
ts.diff()             # First difference
ts.diff(2)            # Second difference
ts.pct_change()       # Percentage change
ts.pct_change(12)     # YoY change

# Shift with fill
ts.shift(1, fill_value=0)
```

---

## 2. Time Series Visualization

### 1. Basic Plots
```python
import matplotlib.pyplot as plt
import seaborn as sns

# Basic line plot
ts.plot(figsize=(12, 4))
plt.show()

# Multiple series
df.plot(subplots=True, layout=(2, 2), figsize=(12, 8))

# Seaborn
sns.lineplot(data=df, x='date', y='value', hue='category')
sns.lineplot(data=df, x='date', y='value', hue='category', style='category')
```

### 2. Seasonal Plots
```python
from statsmodels.graphics.tsaplots import month_plot, seasonal_plot

# Seasonal plot
month_plot(ts, period=12)
seasonal_plot(ts, period=12)

# Seasonal subseries
from statsmodels.graphics.tsaplots import seasonal_plot
seasonal_plot(ts, period=12)

# Month plot
ts.groupby(ts.index.month).mean().plot(kind='bar')
```

### 3. ACF/PACF
```python
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf

plot_acf(ts, lags=40, alpha=0.05)
plot_pacf(ts, lags=40, alpha=0.05, method='ywm')

# Custom
fig, axes = plt.subplots(2, 1, figsize=(12, 8))
plot_acf(ts, lags=40, ax=axes[0])
plot_pacf(ts, lags=40, ax=axes[1])
plt.tight_layout()
```

---

## 3. Stationarity & Transformation

### 1. Stationarity Tests
```python
from statsmodels.tsa.stattools import adfuller, kpss

# Augmented Dickey-Fuller
result = adfuller(ts, autolag='AIC')
print(f'ADF Statistic: {result[0]}')
print(f'p-value: {result[1]}')
print(f'Critical Values: {result[4]}')

# KPSS
stat, p, lags, crit = kpss(ts, regression='c')
print(f'KPSS Statistic: {stat}, p-value: {p}')

# Zivot-Andrews (structural break)
from statsmodels.tsa.stattools import zivot_andrews
zivot_andrews(ts)
```

### 2. Transformations
```python
# Log transformation
ts_log = np.log(ts)
ts_log = np.log1p(ts)  # log(1+x) for zeros

# Box-Cox
from scipy.stats import boxcox
ts_bc, lambda_bc = boxcox(ts + 1)  # Requires positive values

# Yeo-Johnson (handles negatives)
from scipy.stats import yeojohnson
ts_yj, lambda_yj = yeojohnson(ts)

# Differencing
ts_diff = ts.diff().dropna()
ts_diff12 = ts.diff(12).dropna()  # Seasonal diff

# Percentage change
ts.pct_change()
ts.pct_change(12)  # YoY
```

---

## 4. Decomposition

### 1. Classical Decomposition
```python
from statsmodels.tsa.seasonal import seasonal_decompose

# Additive
decomp = seasonal_decompose(ts, model='additive', period=12)
decomp.plot()

# Multiplicative
decomp = seasonal_decompose(ts, model='multiplicative', period=12)
decomp.plot()

# Access components
trend = decomp.trend
seasonal = decomp.seasonal
residual = decomp.resid
```

### 2. STL Decomposition
```python
from statsmodels.tsa.seasonal import STL

stl = STL(ts, period=12, robust=True)
res = stl.fit()
res.plot()

# Access components
trend = res.trend
seasonal = res.seasonal
resid = res.resid
```

### 3. X-13-ARIMA-SEATS
```python
from statsmodels.tsa.x13 import x13_arima_analysis
# Requires x13as installed
result = x13_arima_analysis(ts)
print(result.summary())
```

---

## 5. Forecasting Models

### 1. ARIMA/SARIMA
```python
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX

# ARIMA
model = ARIMA(ts, order=(1, 1, 1))
fit = model.fit()
print(fit.summary())

# SARIMA
model = SARIMAX(ts, order=(1, 1, 1), seasonal_order=(1, 1, 1, 12))
fit = model.fit()
print(fit.summary())

# Auto ARIMA
from pmdarima import auto_arima
model = auto_arima(ts, seasonal=True, m=12, trace=True)
```

### 2. Exponential Smoothing (ETS)
```python
from statsmodels.tsa.holtwinters import ExponentialSmoothing

# Holt-Winters
fit = ExponentialSmoothing(ts, trend='add', seasonal='add', seasonal_periods=12).fit()
forecast = fit.forecast(12)

# Damped trend
fit = ExponentialSmoothing(ts, trend='add', seasonal='add', seasonal_periods=12, damped_trend=True).fit()
```

### 3. Prophet
```python
from prophet import Prophet

df_prophet = df.reset_index().rename(columns={'date': 'ds', 'value': 'y'})
m = Prophet(yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False)
m.fit(df_prophet)

future = m.make_future_dataframe(periods=365)
forecast = m.predict(future)
m.plot(forecast)
m.plot_components(forecast)
```

### 4. NeuralProphet
```python
from neuralprophet import NeuralProphet

m = NeuralProphet()
metrics = m.fit(df_prophet, freq='D')
future = m.make_future_dataframe(df_prophet, periods=365)
forecast = m.predict(future)
m.plot(forecast)
m.plot_components(forecast)
```

### 5. Deep Learning (PyTorch/TensorFlow)
```python
# LSTM
import torch
import torch.nn as nn

class LSTMModel(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, output_size):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
    
    def forward(self, x):
        out, _ = self.lstm(x)
        out = self.fc(out[:, -1, :])
        return out

# N-BEATS, TFT, etc.
from neuralforecast import NeuralForecast
from neuralforecast.models import NBEATS, NHITS, TFT

models = [NBEATS(input_size=24, h=12), NHITS(input_size=24, h=12)]
nf = NeuralForecast(models=models, freq='D')
nf.fit(df)
forecast = nf.predict()
```

---

## 5. Model Evaluation

### 1. Metrics
```python
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error
import numpy as np

def evaluate_forecast(y_true, y_pred):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    mape = np.mean(np.abs((y_true - y_pred) / y_true)) * 100
    smape = 100 * np.mean(2 * np.abs(y_pred - y_true) / (np.abs(y_true) + np.abs(y_pred)))
    return {'MAE': mae, 'RMSE': rmse, 'MAPE': mape, 'SMAPE': smape}

# Cross-validation
from sklearn.model_selection import TimeSeriesSplit
tscv = TimeSeriesSplit(n_splits=5)
for train_idx, test_idx in tscv.split(X):
    model.fit(X[train_idx], y[train_idx])
    pred = model.predict(X[test_idx])
    # evaluate
```

### 2. Cross-Validation
```python
from sklearn.model_selection import TimeSeriesSplit
from statsmodels.tsa.model import TimeSeriesSplit

# sklearn
tscv = TimeSeriesSplit(n_splits=5, test_size=30, gap=0)
for train_idx, test_idx in tscv.split(X):
    # train and evaluate

# statsmodels
from statsmodels.tsa.model import TimeSeriesSplit
tscv = TimeSeriesSplit(n_splits=5, test_size=30)
```

---

## 6. Advanced Topics

### 1. Multivariate Time Series
```python
from statsmodels.tsa.api import VAR
from statsmodels.tsa.vector_ar.var_model import VAR

# VAR model
model = VAR(df)
lag_order = model.select_order(maxlags=12)
fit = model.fit(lag_order.aic)
forecast = fit.forecast(fit.y[-lag_order:], steps=12)

# Structural VAR
from statsmodels.tsa.vector_ar.svar_model import SVAR
svar = SVAR(fit, A=np.eye(3), B=np.eye(3))
```

### 2. State Space Models
```python
from statsmodels.tsa.statespace import MLEModel
from statsmodels.tsa.statespace.sarimax import SARIMAX

# SARIMAX with exogenous
mod = SARIMAX(endog, exog=exog, order=(1,1,1), seasonal_order=(1,1,1,12))
fit = mod.fit()
```

### 3. Dynamic Factor Models
```python
from statsmodels.tsa.dynamic_factor import DynamicFactorMQ

mod = DynamicFactorMQ(endog, k_factors=2, factor_order=2)
res = mod.fit()
```

---

## 7. Model Selection & Ensembles

### 1. Model Comparison
```python
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_absolute_error, mean_squared_error

models = {
    'ARIMA': ARIMA(...),
    'ETS': ExponentialSmoothing(...),
    'Prophet': Prophet(),
    'LSTM': LSTMModel(...)
}

results = {}
for name, model in models.items():
    scores = []
    for train_idx, test_idx in tscv.split(X):
        model.fit(X[train_idx], y[train_idx])
        pred = model.predict(X[test_idx])
        scores.append(rmse(y[test_idx], pred))
    results[name] = np.mean(scores)
```

### 2. Ensemble Forecasting
```python
# Simple average
preds = np.mean([m.predict(X_test) for m in models], axis=0)

# Weighted average
weights = [0.5, 0.3, 0.2]
preds = sum(w * m.predict(X_test) for w, m in zip(weights, models))

# Stacking
from sklearn.ensemble import StackingRegressor
stack = StackingRegressor(
    estimators=[('arima', arima), ('ets', ets), ('prophet', prophet)],
    final_estimator=LinearRegression()
)
```

---

## 8. Production Deployment

### 1. Model Serialization
```python
import joblib
import pickle

# Save
joblib.dump(model, 'model.pkl')
model.save('prophet_model.json')  # Prophet

# Load
model = joblib.load('model.pkl')
```

### 2. API Deployment
```python
# FastAPI
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ForecastRequest(BaseModel):
    periods: int = 30

@app.post("/forecast")
async def forecast(request: ForecastRequest):
    future = model.make_future_dataframe(periods=request.periods)
    forecast = model.predict(future)
    return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].to_dict('records')
```

### 3. Docker
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 9. Monitoring & Maintenance

### 1. Model Monitoring
```python
# Data drift
from evidently.dashboard import Dashboard
from evidently.dashboard.tabs import DataDriftTab

dashboard = Dashboard(tabs=[DataDriftTab()])
dashboard.calculate(reference_data=train_data, current_data=new_data)
dashboard.save('drift_report.html')

# Concept drift
from alibi_detect.cd import KSDrift
cd = KSDrift(X_train, p_val=0.05)
preds = cd.predict(X_new)
```

### 2. Performance Monitoring
```python
# Track metrics over time
metrics_log = []

def log_metrics(y_true, y_pred, model_name):
    metrics = {
        'model': model_name,
        'date': pd.Timestamp.now(),
        'mae': mean_absolute_error(y_true, y_pred),
        'rmse': np.sqrt(mean_squared_error(y_true, y_pred)),
        'mape': mean_absolute_percentage_error(y_true, y_pred)
    }
    metrics_log.append(metrics)
    
# Alert if degradation
if latest_mae > baseline_mae * 1.2:
    send_alert(f"Model degradation detected: MAE increased {latest_mae/baseline_mae:.1%}")
```

---

## Key Takeaways

1. **Start simple**: Baseline with naive/seasonal naive before complex models
2. **Validate properly** - TimeSeriesSplit, not random split
3. **Decompose first** - Understand trend/seasonality before modeling
6. **Try multiple models** - No single best model for all series
7. **Monitor in production** - Track drift, performance degradation
8. **Automate retraining** - Schedule regular retraining
9. **Document everything** - Data lineage, model cards, decisions
10. **Version everything** - Code, data, models, environments

---

*Last updated: 2024-11-04*