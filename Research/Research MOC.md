---
type: moc
topic: "Research Map of Content"
created: 2026-09-02
updated: 2026-09-02
tags:
  - moc
  - research
---

# Research Map of Content

This MOC connects all research projects, papers, and analytical work in the vault.

## Active Research Projects

### [[Time-Series/168-Point Forecast Comparison - Discrete vs Continuous]]
**Status:** In Progress
**Question:** Which forecasting approach is more accurate for polystochastic 9-1-1 call volume: 168 discrete hourly forecasts or 168 continuous forecast points?
**Methods:** Comparative time series forecasting, backtesting
**Related:** [[ARIMA vs Prophet]], [[Time Series Paper Links]]

### [[PSAP Staffing Model]]
**Status:** In Progress
**Question:** Can queueing-game models or hybrid approaches replace Erlang-C/A for 9-1-1 center staffing?
**Methods:** Queueing theory, simulation, comparative analysis
**Related:** [[DMA Data Project]] (from foam_artefacts), queueing theory literature

### [[ARIMA vs Prophet]]
**Status:** Reference/Exploration
**Topic:** Comparing ARIMA and Prophet for time series forecasting
**Related:** [[168-Point Forecast Comparison - Discrete vs Continuous]], [[Time Series Paper Links]]

## Research Resources

### [[Time Series Paper Links]]
Collection of time series forecasting papers and resources, organized by date. Includes papers on:
- Interpretable ML for time series
- Deep learning architectures (SageFormer, TSMixer, DeepTSF)
- Foundation models for forecasting
- Prompt engineering for time series

## Domain Knowledge

### 9-1-1 Operations
- [[PSAP Staffing Model]] - Queueing models for call center staffing
- NENA standards (referenced in PSAP Staffing Model)
- Call center forecasting literature (Robbins, Erlang models)

### Time Series Forecasting
- [[168-Point Forecast Comparison - Discrete vs Continuous]]
- [[ARIMA vs Prophet]]
- [[Time Series Paper Links]]
- Hyndman's Forecasting: Principles and Practice

## Related Notes

- [[DMA Data Project]] - PSAP analytics infrastructure (migrated from foam_artefacts)
- [[911 Analytics]] - Blog post ideas and references (migrated from foam_artefacts)
- [[Forecasting Accuracy Project]] - Botchkarev and Sekitani & Murakami references
- [[DMA_Notes/DMA Projects MOC]] - DMA project connections

## Code & Tools

- **Python environment:** uv, pandas, polars, DuckDB, scikit-learn, statsmodels
- **Forecasting:** TimeCopilot, Prophet, ARIMA, neural networks
- **Visualization:** Plotly, matplotlib, seaborn

---

*Last updated: 2026-09-02*
