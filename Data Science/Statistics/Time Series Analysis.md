# Time Series Analysis

Time Series Analysis deals with data collected sequentially over time. Unlike cross-sectional data, the order of observations matters because they are often autocorrelated.

## 1. Components of a Time Series
A time series is typically decomposed into four components:
- **Trend**: The long-term increase or decrease in the data (e.g., global temperature rise).
- **Seasonality**: Patterns that repeat at fixed intervals (e.g., ice cream sales increasing every summer).
- **Cyclicity**: Fluctuations that are not of a fixed period (e.g., economic boom-and-bust cycles).
- **Noise (Irregularity)**: Random variations that cannot be explained.

## 2. Stationarity
A time series is **Stationary** if its statistical properties (mean, variance, autocorrelation) do not change over time.
- **Why it matters**: Most statistical forecasting models (like ARIMA) require the data to be stationary to make reliable predictions.
- **How to achieve it**: "Differencing" (subtracting the previous value from the current value) is the most common way to remove trends and make a series stationary.

## 3. Key Concepts
- **Autocorrelation (ACF)**: The correlation of a signal with a delayed version of itself. It helps identify seasonality.
- **Partial Autocorrelation (PACF)**: The correlation between a point and a lag, removing the effect of intervening lags.
- **White Noise**: A series that is purely random, stationary, and has zero mean. If your residuals are white noise, your model has captured all available information.