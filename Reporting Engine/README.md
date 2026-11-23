# Reporting Engine — 9-1-1 Dispatch Data Analysis

**Complete analysis framework for 9-1-1 computer-aided dispatch (CAD) and phone system data**

## Project Overview

This project provides a comprehensive analytical framework for 9-1-1 dispatch data, implementing all 12 analysis types from Dawn Choo's LinkedIn post ("12 types of data analysis everyone should know") with both frequentist and Bayesian methods, specifically tailored to emergency communications standards (NENA, APCO, NFPA).

### Data Sources
- **`oz_test_incidents.csv`** — 1,000+ individual incident records with timestamps, agencies (LAW/EMS/FIRE), priorities (1-5), response time components
- **`oz_test_hourly_call_counts.csv`** — 168 hourly rows (7 days × 24 hours) of 9-1-1 and non-emergency call volumes, answer rates, abandonment

### Target Audiences
| Audience | Focus | Key Outputs |
|----------|-------|-------------|
| **Executive Staff** | High-level trends, compliance status | KPI scorecards, weekly summaries, trend forecasts |
| **Operational Management** | Standards compliance, process capability | NFPA/NENA compliance, Cp/Cpk, control charts |
| **Shift Supervisors** | Personnel performance, shift patterns | Outlier detection, learning curves, shift comparisons |
| **Analysts/Researchers** | Deep statistical analysis, modeling | Bayesian posteriors, causal inference, clustering |

---

## 12 Analysis Types Implemented

### 1. Descriptive Analysis
**Summarizing data — median response times, compliance rates, volume totals**
- Executive KPI scorecards with NENA/NFPA/APCO standards comparison
- Process capability (Cp/Cpk) for dispatch queue, turnout, travel times
- Personnel scorecards with outlier detection (IQR consensus)
- Full distribution diagnostics (skew, kurtosis, quantiles, normality tests)
- **Bayesian**: Posterior distributions for key metrics, Beta-Binomial compliance estimation

### 2. Exploratory Data Analysis (EDA)
**Spotting patterns and outliers — circadian rhythms, shift handoffs, data quality**
- Multi-method outlier consensus (IQR, MAD, Z-score, Isolation Forest, LOF)
- Temporal structure: ACF/PACF, STL decomposition, seasonal subseries
- Missingness mechanism analysis (MCAR/MAR testing)
- Grammar-of-graphics visualizations (plotnine): circadian curves, heatmaps, Pareto charts
- **Bayesian**: Probabilistic PCA for outlier detection, Dirichlet Process mixtures

### 3. Correlation Analysis
**Measuring how variables move together — response time components, volume-compliance links**
- Pearson, Spearman, Kendall, Distance correlation with p-values
- Cramér's V for categorical associations (agency × disposition, shift × priority)
- Partial correlations controlling for confounders (priority, agency)
- Group-wise correlations (by agency, shift, priority) with Fisher r-to-z comparisons
- **Bayesian**: LKJ prior correlation matrix with full posterior HDIs

### 4. Regression Analysis
**Predicting outcomes — response times, compliance rates, volume forecasts**
- Gamma GLM (log link) for skewed response times
- Quantile regression (0.1, 0.5, 0.9, 0.95, 0.99) for tail behavior
- Mixed effects models: random intercepts for shift, calltaker
- Negative Binomial for count data, Beta regression for compliance proportions
- **Bayesian**: Bambi GLMs (brms equivalent), Bayesian mixed effects with ICC

### 5. Hypothesis Testing
**Checking statistical significance — standards compliance, group differences, trends**
- NENA/APCO/NFPA binomial tests (one-sample, exact)
- Kruskal-Wallis + Dunn post-hoc for group comparisons
- Cliff's delta effect sizes for non-parametric data
- Mann-Kendall trend tests with Sen's slope
- Equivalence testing (TOST) for shift comparisons
- **Bayesian**: ROPE-based compliance decisions, BEST group comparison, posterior probabilities

### 6. Time Series Analysis
**Spotting trends and seasonality — circadian patterns, forecasting, change points**
- STL decomposition (trend, seasonal, residual)
- SARIMA, Holt-Winters, Prophet forecasting
- Change point detection (ruptures, Bayesian online CPD)
- Bayesian Structural Time Series (BSTS) with local linear trend + Fourier seasonality
- Forecast evaluation (MAE, RMSE, MAPE) with prediction intervals

### 7. Cohort Analysis
**Comparing groups over time — calltaker learning curves, agency retention, shift cohorts**
- Calltaker experience cohorts (weeks since first shift) with learning curves
- Agency volume retention (week-over-week)
- Shift cohort performance trajectories
- Hierarchical Bayesian cohort models with partial pooling

### 8. Funnel Analysis
**Finding drop-off points — dispatch pipeline, time allocation, compliance stages**
- Incident processing funnel (Received → Picked Up → Interview → Dispatched → Enroute → Arrived → Closed)
- Time funnel (median/P90 at each stage with cumulative totals)
- Compliance funnel (NENA/NFPA standards at each stage with PASS/FAIL)
- Priority/agency/shift segmented funnels
- **Bayesian**: Beta-Binomial conversion rates with posterior stage uncertainty

### 9. Cluster Analysis
**Discovering groups — incident archetypes, hour templates, calltaker profiles**
- Incident archetypes (K-means, GMM, Hierarchical, DBSCAN on time components)
- Hourly pattern clusters for shift scheduling templates
- Calltaker performance clusters (Gaussian Mixture with soft assignments)
- **Bayesian**: Dirichlet Process GMM for infinite mixture clustering

### 10. Principal Component Analysis (PCA)
**Condensing variables — Response Time Index, Compliance PC, Volume PCs**
- Full PCA with loadings interpretation, biplots, variance decomposition
- Sparse PCA for interpretable components
- Principal Component Regression (PCR) with Ridge regularization
- **Bayesian**: Probabilistic PCA (PPCA) with ARD for component relevance

### 11. Causal Inference
**Estimating effects of changes — protocol changes, staffing, priority assignments**
- Difference-in-Differences (DiD) with parallel trends check
- Interrupted Time Series (ITS) for policy interventions
- Propensity Score Matching (PSM) for priority effects
- Regression Discontinuity Design (RDD) for staffing thresholds
- **Bayesian**: Full posterior for DiD/ITS/PSM with credible intervals

### 12. Text Analysis
**Pulling themes from text — problem nature categorization, disposition quality, location analysis**
- Problem nature n-gram analysis (bigrams, trigrams)
- Semantic categorization (Medical/Fire/Law Enforcement/Other)
- Call disposition quality audit (UNDEFINED rates by shift/calltaker/agency)
- Street/address extraction for hotspot identification
- **Bayesian**: LDA topic modeling template (for narrative text)

---

## Project Structure

```
Reporting Engine/
├── README.md                                    # This file
├── 12_Analysis_Types_From_LinkedIn_Post.md      # Initial analysis mapping
├── 12_Analysis_Types_Deep_Dive_Bayesian.md      # Comprehensive deep dive (this doc)
├── AGENTS.md                                    # Agent definitions for 4 audiences
├── Statistical Tests and Comparative Analyses.md # Reference for tests
├── PYTHON.md                                    # Python library specifications
├── Analyses Performed.md                        # Log of completed analyses
├── TODO.md                                      # Task tracking
├── oz_test_incidents.csv                        # Incident data (1000+ rows)
├── oz_test_hourly_call_counts.csv               # Hourly call data (168 rows)
├── agents/
│   ├── README.md
│   ├── executive_staff_agent.md
│   ├── operational_management_agent.md
│   ├── shift_supervisor_agent.md
│   └── analyst_researcher_agent.md
└── notebooks/
    ├── 00_master_analysis_pipeline.ipynb        # Complete end-to-end pipeline
    ├── 01_descriptive_eda_bayesian.ipynb        # Descriptive + EDA + Bayesian
    ├── 02_correlation_regression_bayesian.ipynb # Correlation + Regression + Bayesian
    ├── 03_timeseries_hypothesis_causal.ipynb    # Time Series + Hypothesis + Causal
    └── 04_clustering_pca_text.ipynb             # Clustering + PCA + Text
```

---

## Quick Start

### Prerequisites
```bash
# Core
pip install pandas numpy scipy statsmodels pingouin scikit-posthocs
# Visualization
pip install plotnine matplotlib seaborn missingno
# ML/Clustering
pip install scikit-learn
# Bayesian
pip install pymc arviz bambi
# Time Series
pip install prophet statsforecast  # optional
```

### Run Master Pipeline
```bash
cd Reporting Engine/notebooks
jupyter notebook 00_master_analysis_pipeline.ipynb
```

### Run Individual Notebooks
```bash
# Descriptive stats, EDA, Bayesian compliance
jupyter notebook 01_descriptive_eda_bayesian.ipynb

# Correlation matrices, GLMs, Bayesian mixed models
jupyter notebook 02_correlation_regression_bayesian.ipynb

# STL, forecasting, BSTS, hypothesis tests, DiD/ITS/PSM/RDD
jupyter notebook 03_timeseries_hypothesis_causal.ipynb

# Clustering, PCA, text analysis
jupyter notebook 04_clustering_pca_text.ipynb
```

---

## Standards Reference

| Standard | Metric | Target | Data Column |
|----------|--------|--------|-------------|
| **NENA-STA-020.1** | 9-1-1 Answered ≤10s | 90% | `nine_one_one_answered_10s_pct` |
| **NENA-STA-020.1** | 9-1-1 Answered ≤15s | 95% | `nine_one_one_answered_15s_pct` |
| **NENA-STA-020.1** | 9-1-1 Answered ≤20s | 95% | `nine_one_one_answered_20s_pct` |
| **APCO ANS 3.101** | 9-1-1 Answered ≤10s | 75% | `nine_one_one_answered_10s_pct` |
| **NFPA 1710** | Dispatch Queue ≤64s | 90% | `dispatch_queue_seconds` |
| **NFPA 1710** | Dispatch Queue ≤106s | 95% | `dispatch_queue_seconds` |
| **NFPA 1710** | EMS Turnout ≤60s | 90% | `turnout_seconds` (EMS) |
| **NFPA 1710** | Fire Turnout ≤80s | 90% | `turnout_seconds` (FIRE) |
| **NFPA 1710** | Travel ≤240s | 90% | `travel_seconds` |

---

## Key Bayesian Innovations

1. **ROPE-based Compliance Decisions** — Instead of binary pass/fail, compute `P(rate > target)` with Region of Practical Equivalence
2. **BEST Group Comparison** — Robust t-distribution for heavy-tailed response times, effect size posteriors
3. **BSTS Forecasting** — Structural decomposition with full prediction intervals
4. **Dirichlet Process Clustering** — Infinite mixture models for incident archetypes
5. **Bayesian Causal Inference** — Full posteriors for DiD, ITS, PSM, RDD estimates
6. **Probabilistic PCA** — Automatic relevance determination for component selection

---

## Output Examples

### Executive Summary (Auto-generated)
```
WEEKLY 9-1-1 EXECUTIVE SUMMARY
==============================
Total 9-1-1 Calls: 1,247
Total Incidents: 1,082
NENA 15s Compliance: 90.4% (Target: 90%) ✅
NENA 20s Compliance: 94.2% (Target: 95%) ❌
NFPA Dispatch Queue P90: 71s (Target: ≤64s) ❌
NFPA EMS Turnout P90: 58s (Target: ≤60s) ✅
NFPA Fire Turnout P90: 83s (Target: ≤80s) ❌
NFPA Travel P90: 234s (Target: ≤240s) ✅
```

### Operational Alert (Failed Standards)
```
OPERATIONAL: FAILED STANDARDS
==================================================
  NENA 20s Compliance: 94.2% (Target: 95%) - GAP: -0.8%
  NFPA Dispatch Queue P90: 71s (Target: ≤64s) - GAP: +7s
  NFPA Fire Turnout P90: 83s (Target: ≤80s) - GAP: +3s
```

### Shift Supervisor Personnel Alerts
```
SHIFT SUPERVISOR: PERSONNEL ALERTS
==================================================
Calltaker Outliers:
  calltaker    n  median_pickup  median_interview  median_total  pct_undef
  Smith,J         23            8               145           892       12.5
  Jones,R         18           15               210          1105       18.3

Dispatcher Outliers:
  dispatcher    n  median_queue  median_turnout  median_travel
  Brown,K         31           245              120           345
```

### Analyst Key Findings
```
ANALYST: KEY FINDINGS
==================================================
1. Dispatch Queue ↔ Travel: ρ = 0.342 (Spearman)
2. All time components HIGHLY SKEWED (skew 2.1-4.8) — use Gamma/LogN
3. Incident Clusters: K=4 archetypes (Fast Medical, Slow Fire, Complex Multi-Agency, Routine Law)
4. Response Time Index (PC1): 67.3% variance — single KPI for dashboards
5. Bayesian DiD (simulated protocol): estimate=-0.023, p=0.12 (no significant effect)
```

---

## Extending the Framework

### Adding New Analyses
1. Create new notebook in `notebooks/` following the pattern
2. Add frequentist + Bayesian implementations
3. Include audience-specific outputs
4. Document in `Analyses Performed.md`

### Adding New Data Sources
- Follow the feature engineering pattern in notebooks
- Maintain column naming conventions
- Update standards mapping if needed

### Adding New Audiences
- Create new agent definition in `agents/`
- Define specific output formats
- Add audience column to analysis summary tables

---

## Contributing

1. All analyses must include both frequentist and Bayesian versions
2. Code must be runnable with the provided data
3. Outputs must be mapped to at least one target audience
4. Standards compliance checks required for operational metrics
5. Document assumptions and limitations in each notebook

---

## License & Attribution

**Data**: Synthetic 9-1-1 dispatch data for demonstration purposes  
**Analysis Types**: Based on Dawn Choo's LinkedIn post "12 types of data analysis everyone should know"  
**Standards**: NENA-STA-020.1, APCO ANS 3.101, NFPA 1710 (referenced for compliance targets)

---

*Last updated: November 2026*  
*Framework version: 1.0*