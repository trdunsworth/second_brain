# CHANGELOG

All notable changes to the Reporting Engine project are documented here.

## [1.0.0] - 2026-11-23

### Added
- **Complete 12 Analysis Types Framework** — All 12 analysis types from Dawn Choo's LinkedIn post mapped to 9-1-1 dispatch data
- **Dual Paradigm Implementation** — Every analysis includes both frequentist and Bayesian approaches
- **Four Audience Targeting** — Executive, Operational, Shift Supervisor, Analyst outputs for each analysis

### Analysis Types Implemented
1. **Descriptive Analysis** — KPI scorecards, process capability (Cp/Cpk), personnel scorecards, distribution diagnostics
2. **Exploratory Data Analysis** — Multi-method outliers, temporal patterns, missingness, circadian visualizations
3. **Correlation Analysis** — Pearson/Spearman/Kendall/Distance, Cramér's V, partial correlations
4. **Regression Analysis** — Gamma GLM, quantile regression, mixed effects, Bayesian Bambi GLMs
5. **Hypothesis Testing** — NENA/NFPA/APCO compliance tests, Kruskal-Wallis, Mann-Kendall, equivalence tests
6. **Time Series Analysis** — STL, SARIMA, Holt-Winters, BSTS, change point detection
7. **Cohort Analysis** — Calltaker learning curves, agency retention, shift cohorts, Bayesian hierarchical
8. **Funnel Analysis** — Dispatch pipeline, time funnel, compliance funnel, Bayesian conversion rates
9. **Cluster Analysis** — Incident archetypes, hourly templates, calltaker profiles, DP-GMM
10. **PCA** — Response Time Index, sparse PCR, probabilistic PCA with ARD
11. **Causal Inference** — DiD, ITS, PSM, RDD with Bayesian posteriors
12. **Text Analysis** — Problem nature n-grams, disposition quality, location extraction, LDA template

### Standards Integration
- **NENA-STA-020.1** — 9-1-1 answer time compliance (10s/15s/20s)
- **APCO ANS 3.101** — Call answering benchmarks
- **NFPA 1710** — Dispatch queue (64s/106s), turnout (60s/80s), travel (240s)

### Deliverables
- **`12_Analysis_Types_From_LinkedIn_Post.md`** — Initial mapping of 12 types to 9-1-1 data
- **`12_Analysis_Types_Deep_Dive_Bayesian.md`** — Comprehensive deep dive with all code
- **`README.md`** — Complete project documentation
- **4 Executable Notebooks**:
  - `00_master_analysis_pipeline.ipynb` — End-to-end pipeline
  - `01_descriptive_eda_bayesian.ipynb` — Descriptive + EDA + Bayesian
  - `02_correlation_regression_bayesian.ipynb` — Correlation + Regression + Bayesian
  - `03_timeseries_hypothesis_causal.ipynb` — Time Series + Hypothesis + Causal
  - `04_clustering_pca_text.ipynb` — Clustering + PCA + Text

### Bayesian Innovations
- ROPE-based compliance decisions with decision thresholds
- BEST robust group comparison (t-distribution likelihood)
- BSTS forecasting with structural decomposition
- Dirichlet Process GMM for infinite clustering
- LKJ prior correlation matrices with full posteriors
- Probabilistic PCA with automatic relevance determination

---

## Future Releases

### [1.1.0] Planned
- [ ] Quarto report templates for each audience
- [ ] Streamlit dashboard for real-time monitoring
- [ ] Automated weekly report generation pipeline
- [ ] R and Julia implementations (per PYTHON.md specifications)

### [1.2.0] Planned
- [ ] Integration with live CAD data feeds
- [ ] Advanced causal discovery (PC algorithm, FCI)
- [ ] Spatial analysis with geopandas (station placement)
- [ ] Survival analysis for time-to-answer (Kaplan-Meier, Cox)

### [2.0.0] Planned
- [ ] Multi-jurisdiction comparative framework
- [ ] Predictive staffing optimization
- [ ] Automated anomaly detection alerts
- [ ] API for external system integration