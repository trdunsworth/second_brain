---
type: research-note
topic: "ARIMA vs Prophet for Time Series"
source: "Hyndman & Athanasopoulos, Forecasting: Principles and Practice"
method: "Comparative analysis"
date: "2026-08-30"
status: "Draft"
tags:
  - research
  - time-series
---

# ARIMA vs Prophet for Time Series

## Source

Hyndman, R.J., & Athanasopoulos, G. (2021). *Forecasting: Principles and Practice*, 3rd ed.

## Key Question

Which approach handles seasonal decomposition better for daily data with holidays?

## Key Findings

1. ARIMA requires manual seasonal differencing
2. Prophet handles holidays natively
3. ARIMA outperforms on short, stationary series
