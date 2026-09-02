---
type: research-project
topic: "168-Point Forecast Comparison: Discrete vs Continuous"
hypothesis: "Discrete hourly forecasts (168 individual points for Sunday 0000, Sunday 0100, etc.) will be more accurate than continuous 168-point forecasts for polystochastic 9-1-1 call volume data"
methodology: "Comparative time series forecasting"
data_source: "9-1-1 call volume data (polystochastic)"
start_date: "2026-09-02"
end_date: 
status: "In Progress"
tags:
  - research
  - project
  - forecasting
  - 911
  - time-series
---

# 168-Point Forecast Comparison: Discrete vs Continuous

## Research Question

Which forecasting approach produces more accurate predictions for weekly 9-1-1 call volume data: **168 discrete hourly forecasts** (one model per hour-of-week, e.g., Sunday 0000, Sunday 0100, ... Saturday 2300) or **168 continuous forecast points** (a single model generating a sequence of 168 hourly predictions)?

## Hypothesis

**Discrete hourly forecasts will not outperform continuous forecasts** for polystochastic 9-1-1 call volume data.

### Rationale
- 9-1-1 call volume exhibits strong **hour-of-week seasonality** (e.g., Monday morning rush vs Sunday night lull)
- A polystochastic process may have different underlying dynamics at different times
- Discrete models can capture time-specific patterns without confounding from other hours
- Continuous models may smooth over important local variations

## Background & Motivation

9-1-1 call volumes are inherently polystochastic - driven by multiple overlapping stochastic processes (human behavior, traffic patterns, weather, events). Understanding which forecasting approach works better has practical implications for:
- Staffing and resource allocation
- Shift planning
- Budget forecasting
- Emergency response optimization

Additionally, this will provide information about which models perform better in univariate and multivariate environments, with and without exogenous factors.

## SWOT Analysis

### Strengths
- **Clear hypothesis & methodology** — Null hypothesis is well-framed ("discrete will NOT outperform continuous"), with a structured 10-step analysis plan and four evaluation metrics (MAE, RMSE, MAPE, MASE)
- **Domain authority** — Author authored a dissertation on 9-1-1 forecasting (Reference 14), bringing direct subject-matter expertise
- **Rich dataset selection** — Douglas County, KS offers 4 population centres, 3 universities, 1 community park with special events — ideal for polystochastic signal
- **Statistical rigor** — Diebold-Mariano significance testing, walk-forward validation, and cross-validation planned from the start
- **Comprehensive references** — 19 citations spanning foundations, hierarchical forecasting, ML, foundation models, and domain applications
- **Practical relevance** — Direct implications for PSAP staffing (links to [[PSAP Staffing Model]]), shift planning, and budget forecasting

### Weaknesses
- **Data not yet acquired** — All 10 analysis steps are unchecked; data access is the critical-path blocker
- **Sample size asymmetry** — Discrete models get ~1/168th of the data per model; with only 2 years minimum, that's ~104 points per hour — potentially insufficient for complex models
- **Heavy compute burden** — 168 models × multiple algorithms × walk-forward folds could be computationally expensive with no resource plan documented
- **Missing covariates** — Weather, events, and population data are listed as "optional" — but polystochastic analysis arguably requires exogenous variables to be meaningful
- **Limited model scope** — Only ARIMA, Prophet, and LSTM named; XGBoost, neural nets, and hybrid approaches deferred to "Future Work"
- **No runtime or environment plan** — No mention of compute infrastructure, estimated runtime, or reproducibility setup (e.g., `requirements.txt`, Docker)

### Opportunities
- **Foundation model benchmarking** — TimesFM, TimeGPT-1, and TimeCopilot are available — comparing classical vs. foundation models would be novel
- **Hybrid/pooling approaches** — Hierarchical Bayesian pooling across discrete models could combine strengths of both paradigms
- **Probabilistic forecasting** — Adding prediction intervals (NGBoost, quantile regression) would make findings directly actionable for staffing decisions
- **Publication potential** — Polystochastic 9-1-1 forecasting with this methodology doesn't appear in existing literature
- **Cross-domain generalizability** — If successful, the framework applies to other emergency services, healthcare, or queueing systems
- **Partnership with Douglas County** — A formal collaboration could unlock multi-year data access and validate real-world utility

### Threats
- **Data access risk** — 9-1-1 data is sensitive; bureaucratic or political barriers could delay or block acquisition entirely
- **IRB requirements** — If classified as human-subjects research (even secondary data), IRB review could add months
- **"No difference" result** — If the hypothesis is confirmed (discrete ≠ continuous), the contribution may be seen as less publishable
- **Rapid model evolution** — Foundation models are advancing fast — results could be partially obsolete before publication
- **Data quality** — Missing values, format inconsistencies, or COVID-era anomalies (even post-2022) could require extensive preprocessing
- **Scope creep** — The project is already large; adding multivariate, probabilistic, or hybrid dimensions could dilute focus

## Action Plan

### P0 — Critical Path (blocks all downstream work)
- [ ] Initiate data access agreement with Douglas County, KS
- [ ] Determine IRB requirements for secondary 9-1-1 data use

### P1 — High Priority (should be resolved before model implementation)
- [ ] Document compute infrastructure and environment (requirements.txt, estimated runtime, Docker/reproducibility setup)
- [ ] Add foundation models (TimesFM, TimeGPT-1, TimeCopilot) to comparison scope
- [ ] Elevate weather, special events, and population density from "optional" to required covariates
- [ ] Update hypothesis in frontmatter to reflect inclusion of foundation models

### P2 — Medium Priority (should be addressed during analysis design)
- [ ] Define sample-size sensitivity analysis thresholds (1-year, 2-year, 3-year training windows) with specific accuracy degradation criteria
- [ ] Add NGBoost or quantile regression for probabilistic interval forecasting
- [ ] Draft data quality assessment checklist (missing values, format inconsistencies, COVID-era anomalies)
- [ ] Define scope guardrails: document what is in-scope vs. deferred to future work

### P3 — Lower Priority (address during write-up or future work)
- [ ] Research hierarchical Bayesian pooling for hybrid discrete models
- [ ] Outline publication target venue and cross-domain generalizability plan
- [ ] Plan error analysis by hour-of-week segment (traffic-driven vs. medical-driven calls)

## SWOT Tracking

| SWOT Category | Item | Mitigation | Status |
|---------------|------|------------|--------|
| Weakness | Data not yet acquired | P0: Data access agreement with Douglas County | Pending |
| Threat | IRB requirements | P0: Determine IRB classification early | Pending |
| Weakness | No runtime or environment plan | P1: Document compute infrastructure | Pending |
| Weakness | Limited model scope | P1: Add foundation models to comparison | Pending |
| Weakness | Missing covariates | P1: Elevate covariates to required | Pending |
| Weakness | Sample size asymmetry | P2: Define sensitivity thresholds | Pending |
| Weakness | Heavy compute burden | P1: Document infrastructure, estimate runtime | Pending |
| Opportunity | Foundation model benchmarking | P1: Include TimesFM/TimeGPT-1/TimeCopilot | Pending |
| Opportunity | Probabilistic forecasting | P2: Add NGBoost/quantile regression | Pending |
| Opportunity | Publication potential | P3: Identify target venue | Pending |
| Threat | Data access risk | P0: Data access agreement | Pending |
| Threat | "No difference" result | P3: Plan framing for confirmatory result | Pending |
| Threat | Scope creep | P2: Define scope guardrails | Pending |
| Threat | Data quality | P2: Draft data quality checklist | Pending |

## Data

### Source
9-1-1 call volume data (specify database/file location)

Preferably from a jurisdiction like Douglas County, KS because of the various additional frameworks that allow for an interesting dataset. 4 population centres, 3 universities, 1 large community park with special events. 

### Variables
- **Timestamp**: Hourly call counts
- **Temporal features**: Hour of day, day of week, holidays
- **Optional covariates**: Weather, special events, population density, university sporting events as additional pressure.

### Time Period
- **Minimum:** 2 years (~104-106 data points per hour-of-week, ~17,472 rows continuous)
- **Preferred:** 5 years (~260-262 points per hour, ~87K rows continuous) if available
- **Start date:** 2022 or later to avoid COVID-19 anomalous patterns (2020-2021)
- Validation: 3 months
- Test: 3 months

### Sample Size Considerations
- Discrete models: 104+ points per hour is sufficient for ARIMA, Prophet, exponential smoothing
- Continuous models: 17K-87K rows is well within standard tool capabilities
- Sensitivity analysis planned: test on 1-year, 2-year, and 3-year training windows

### Preprocessing
- [ ] Aggregate to hourly call counts
- [ ] Handle missing values
- [ ] Identify and treat outliers
- [ ] Create hour-of-week encoding (0-167)

## Methodology

### Approach: Discrete (Hour-Specific) Models
- Train **168 separate models**, one for each hour-of-week position
- Each model only sees data from its specific hour (e.g., all Monday 8am historical values)
- Generate forecast by running all 168 models

### Approach: Continuous (Sequential) Model
- Train **one model** on the full 168-point weekly sequence
- Generate all 168 forecast points in a single pass
- Models: ARIMA, Prophet, LSTM, or similar sequence models

### Evaluation Metrics
| Metric | Description |
|--------|-------------|
| MAE | Mean Absolute Error |
| RMSE | Root Mean Squared Error |
| MAPE | Mean Absolute Percentage Error |
| MASE | Mean Absolute Scaled Error |

### Validation Strategy
- Time series cross-validation (rolling origin)
- Walk-forward validation with 1-week horizon
- Compare metrics across both approaches

## Analysis Plan

- [ ] Step 1: Acquire and explore 9-1-1 call volume data
- [ ] Step 2: Preprocess and create hourly aggregates
- [ ] Step 3: Engineer temporal features (hour-of-week encoding)
- [ ] Step 4: Split data into train/validation/test sets
- [ ] Step 5: Implement discrete (hour-specific) forecasting models
- [ ] Step 6: Implement continuous (sequential) forecasting model
- [ ] Step 7: Run backtesting/walk-forward validation
- [ ] Step 8: Calculate evaluation metrics for both approaches
- [ ] Step 9: Statistical significance testing (Diebold-Mariano test)
- [ ] Step 10: Analyze results and document findings

## Progress Log

### 2026-09-02
- Created research project
- Defined hypothesis and methodology
- Outlined analysis plan
- Completed SWOT analysis (strengths, weaknesses, opportunities, threats)
- Created prioritized Action Plan (P0-P3) addressing all SWOT items
- Added SWOT Tracking table for mitigation status

## Results

### Summary Statistics
<!-- To be filled after analysis -->

### Key Findings
<!-- To be filled after analysis -->

1. 
2. 
3. 

### Visualizations
<!-- Charts comparing forecast accuracy -->

## Interpretation

<!-- What do the results mean for polystochastic forecasting? -->

## Conclusions

<!-- Final takeaways and implications for 9-1-1 operations -->

## Limitations & Future Work

- [ ] Data quality assessment
- [ ] Consider non-hourly seasonalities (daily, weekly, annual)
- [ ] Test additional models (XGBoost, neural networks)
- [ ] Explore hybrid approaches
- [ ] Test on other polystochastic datasets

### Considerations & Extensions

**Cross-hour dependencies:** If continuous models outperform discrete, investigate whether this is driven by genuine temporal dependencies (e.g., rush hour building over several hours) or by the larger sample size per model. This distinction matters for model selection.

**Sample size effect:** Discrete models use ~1/168th of the data per model. If history is short, discrete models may underperform due to limited data rather than methodological inferiority. Consider reporting accuracy as a function of training data length.

**Hybrid approaches:** Hierarchical or Bayesian pooling across discrete models could combine the strengths of both approaches - capturing hour-specific dynamics while sharing information across hours. This may outperform either pure method.

**Uniformity of accuracy:** Neither approach may dominate uniformly. Accuracy may vary by time of week or by which stochastic driver is dominant (e.g., traffic-driven vs. medical-driven calls). Consider analyzing error by hour-of-week segment.

## Connections

- [[Research Note]]
- [[Research Project]]
- [Douglas County 9-1-1](https://www.dgcoks.gov/emergency-communications-911)
- [TimesFM 3](https://github.com/google-research/timesfm)
- [Decoder-Only foundation model for time series forecasting](https://arxiv.org/abs/2310.10688)
- [Nixtla.io Forecasting Models](https://www.nixtla.io/)
- [TimeCopilot](https://timecopilot.dev/#hello-world-example)
- [Pydantic configuration for TimeCopilot](https://pydantic.dev/docs/ai/models/overview/)
- [CatBoost](https://catboost.ai/)
- 

## References

### Forecasting Foundations
1. Hyndman, R.J., & Athanasopoulos, G. (2021). [*Forecasting: Principles and Practice*](https://otexts.com/fpp3/)
2. Hyndman, R.J., Athanasopoulos, G., et. al. (2026). [*Forecasting: Principles and Practice, the Pythonic Way*](https://otexts.com/fpppy/)
3. Manokhin V. (2025). [*Mastering Modern Time Series Forecasting*](https://gumroad.com/d/5ca65d64a93b3a7452090286ef7635b7)
4. Manokhin V. (2026). *Forecasting Metrics That Don't Lie*
5. Sekitani J., & Murakami H. (2022). [*Framework for comparing accuracy of time-series forecasting methods*](https://omu.repo.nii.ac.jp/record/2000461/files/2023000392.pdf)

### Hierarchical & Multiple Seasonality
6. Hyndman, R.J., Athanasopoulos, G., et al. (2011). [*Optimal hierarchical forecasts for hierarchical time-series*](https://robjhyndman.com/publications/hierarchical/) - Directly addresses discrete vs continuous forecasting
7. Hyndman, R.J., et al. (2011). [*Forecasting with seasonality and trend using TBATS*](https://robjhyndman.com/publications/tbats/) - Handles multiple overlapping seasonalities
8. Athanasopoulos, G., et al. (2017). [*Hierarchical forecasting*](https://www.robjhyndman.com/publications/hierarchical-forecasting-part1/) - Bottom-up, top-down, and middle-out approaches

### Gradient Boosting & ML Approaches
9. Manokhin V. (2026). *Mastering CatBoost*
10. Manokhin V. (2026). *Applied Conformal Prediction*

### Foundation Models & Neural Architectures
11. Taylor, S.J., & Letham, B. (2018). Forecasting at Scale. *The American Statistician*
12. Garza A., Cahllu C., & Mergenthaler-Canseco M. (2024). [*TimeGPT-1*](https://arxiv.org/pdf/2310.03589)
13. Garza A. & Rosillo R. (2025). [*TimeCopilot*](https://arxiv.org/pdf/2509.00616?)

### Domain-Specific Applications
14. Dunsworth T. (2024). [*Determining the Efficacy of Automated Forecasting Models for Primary 9-1-1 Public Safety Answering Points*](https://www.proquest.com/openview/ae5915030ac635120b2c4a8207022e65/1?pq-origsite=gscholar&cbl=18750&diss=y)
15. Hong, T., et al. (2016). [*The M4 Competition: 100,000 time series and 49 forecasting methods*](https://www.sciencedirect.com/science/article/pii/S0169207019301129) - Lessons from hierarchical retail forecasting
16. Short-term load forecasting literature - Structural similarity to 9-1-1 arrival rate forecasting
17. Wang Jinting (2026). [*Fundamentals of Queueing-Game Models*](https://doi.org/10.1007/978-981-95-0261-5)
18. Queueing theory arrival rate forecasting - Stochastic arrival process modeling

### Probabilistic Forecasting
18. Duan, T., et al. (2020). [*NGBoost: Natural Gradient Boosting for Probabilistic Prediction*](https://arxiv.org/pdf/2002.09495) - Prediction intervals for staffing decisions
19. Quantile regression approaches for interval forecasting

## Code & Notebooks

- [[]]
