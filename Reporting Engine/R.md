# R.md — Analysis & Library Specification

> Status: Recommendation spec (not final code). Snippets are illustrative.
> Source data:
>   - `data/IndyMo_incidents.csv` — 1,082 incidents, 48 cols, 2026-08-10 → 2026-08-16
>   - `data/IndyMo_hourly_call_counts.csv` — 168 hourly rows (7×24)
> Companion scaffold: `base.ipynb` (Python; the R version mirrors its intent).

This document specifies the **R** library stack, the grammar-of-graphics plotting
approach (ggplot2 is the native home of GoG — Goal 2), and the statistical
tests/analyses I recommend for the five target audiences. R is, frankly, the
most turnkey environment for the classical stats and reporting in this project.

---

## 1. Role of R in the project

R owns the statistical depth and the publication pipeline. `tidyverse` for
wrangling, `ggplot2` for every chart, `broom` to tidy model output into tables,
`gt`/`gtsummary` for KPI tables, `fable`/`feasts` for forecasting, `lme4` for
mixed models, `qcc` for control charts, `spatstat` for spatial. Quarto (which
you already use) is R-native, so the weekly Word/PDF reports are smooth.

---

## 2. Library stack

| Need | Package | Notes |
|------|---------|-------|
| Wrangling | `tidyverse` (dplyr, tidyr, readr, stringr, lubridate, forcats) | Core. |
| Grammar of graphics | `ggplot2` + `scales` + `patchwork` | Native GoG (Goal 2). |
| Interactive | `plotly` (`ggplotly`) | Dashboards. |
| Tables | `gt`, `gtsummary`, `flextable` | Word/PDF KPI tables. |
| Classical stats | `stats` (base), `broom`, `car` | ANOVA, diagnostics. |
| Plain-English stats | `statease` | Auto-detects tests, prints interpretation + assumption checks + effect sizes. |
| Non-parametric | `coin`, `PMCMRplus` | Kruskal–Wallis + Dunn/Tukey. |
| Mixed models | `lme4`, `nlme` | Shift as random effect. |
| Distribution fit | `fitdistrplus`, `actuar` | Lognormal fitting for response times. |
| Survival (optional) | `survival` | Time-to-answer modeling. |
| Forecasting | `fable`, `feasts`, `tsibble` | STL, ARIMA, ETS (Goals 5–6). |
| Control charts | `qcc`, `SpcTools` | p-charts for compliance. |
| Spatial | `sf`, `spatstat`, `ggplot2` + `geom_sf` | Hotspot analysis. |
| Validation | `assertthat` / `pointblank` | Schema checks on ingest. |
| Dashboards | `shiny` + `flexdashboard` | Live exec/ops views (Goal 3). |

---

## 3. Data ingestion & cleaning

```r
library(tidyverse)
library(lubridate)

ev <- read_csv("data/IndyMo_incidents.csv") |>
  mutate(across(matches("time|call_start|incident_start"), ymd_hm),
         dow = wday(call_start_time, label = TRUE, abbr = TRUE),
         date = as_date(call_start_time),
         zip5 = str_sub(postal_code, 1, 5))

ph <- read_csv("data/IndyMo_hourly_call_counts.csv") |>
  mutate(hour_start = ymd_hms(hour_start),
         dow = wday(hour_start, label = TRUE, abbr = TRUE))

# Data-quality flags (patterns, not noise)
ev |> count(call_disposition, sort = TRUE)        # 331 UNDEFINED
ph |> summarise(abandon_rate = sum(nine_one_one_calls_abandoned) /
                              sum(nine_one_one_calls_received))
```

`dispatch_queue_seconds` and `on_scene_seconds` are right-skewed — prefer
`median`/`IQR` and non-parametric tests throughout.

---

## 4. Comprehensive EDA Protocol (common across all languages)

Before any detailed analysis, run this EDA protocol. These tests are
**language-agnostic** — implement them in Python, R, and Julia identically.
The goal: surface data quality issues, distribution shapes, outliers,
correlations, and temporal structure so downstream analyses make valid
assumptions.

### 4.1 Data quality & completeness

| Check | What to compute | Why it matters |
|-------|-----------------|----------------|
| Missing value matrix | `% NA` per column; `naniar::vis_miss()` heatmap | Missingness may be systematic. |
| Duplicate detection | `duplicated()` on `(incident_id)` or full-row | Duplicate rows inflate counts. |
| Constant/near-constant columns | Columns with ≤2 unique values or >95% identical | Candidates for removal. |
| Schema validation | Data types, ranges, allowed levels | Catch impossible values. |
| Completeness KPI | `(1 - NA_count/total) × 100` per column | Ops monitors weekly. |

### 4.2 Univariate descriptive statistics

For every numeric column, compute **all** of:

| Statistic | Formula / Note |
|-----------|----------------|
| n, n_valid | Count before/after NA removal |
| min, max | Range |
| mean, median | Central tendency — compare for skew |
| std dev, IQR | Spread — IQR robust to outliers |
| skewness | `>1` → heavy right tail |
| kurtosis | `>3` → heavier tails than normal |
| p5, p10, p25, p50, p75, p90, p95 | Quantile table |
| CV | `std/mean` — relative variability |

For every categorical column:

| Statistic | Note |
|-----------|------|
| n_levels | Cardinality |
| mode, mode_freq | Most common level + count |
| entropy | `−Σ p log(p)` — distribution uniformity |
| `% of top level` | Concentration check |

### 4.3 Distribution shape & normality

| Test | H₀ | When to use | Decision rule |
|------|----|-------------|---------------|
| **Shapiro–Wilk** | Data is normal | n < 5000 (per group) | p < 0.05 → reject |
| **Kolmogorov–Smirnov** (Lilliefors) | Data is normal | n ≥ 5000 | p < 0.05 → reject |
| **Anderson–Darling** | Data is normal | Sensitive to tails | Compare to critical values |
| **D'Agostino–Pearson** | Data is normal | Tests skew + kurtosis | p < 0.05 → reject |
| **Jarque–Bera** | Data is normal | Large samples | p < 0.05 → reject |
| **Q–Q plot** | Visual normality | Always plot | Points off line → non-normal |
| **Histogram + KDE** | Visual shape | Always plot | Modality, skew, gaps |

### 4.4 Outlier identification (multi-method)

Flag points detected by ≥2 methods:

| Method | Threshold / Rule | Sensitivity |
|--------|------------------|-------------|
| **IQR fence** | `< Q1 − 1.5×IQR` or `> Q3 + 1.5×IQR` | Robust, non-parametric |
| **Modified Z-score (MAD)** | `|0.6745×(x−median)/MAD| > 3.5` | Robust to masking |
| **Z-score** | `|x−mean|/std > 3` | Sensitive to non-normal |
| **Percentile filter** | `< p1` or `> p99` | Simple, transparent |
| **Grubbs' test** | Iterative max/min test | Parametric, assumes normality |
| **Dixon's Q** | `Q = gap/range`; compare critical Q | Small samples |
| **DBSCAN** | Density-based; noise cluster | Multivariate |
| **Isolation Forest** | Anomaly score < −0.5 | Multivariate |
| **Mahalanobis distance** | `D² > χ²(p, 0.975)` | Multivariate normal |

### 4.5 Correlation analyses

| Method | Type | Assumptions | Use case |
|--------|------|-------------|----------|
| **Pearson r** | Linear | Both continuous, ~normal | Default continuous–continuous |
| **Spearman ρ** | Monotonic | Ordinal or continuous; no normality | Skewed data |
| **Kendall τ** | Concordance | Ordinal; robust with ties | Small samples, many ties |
| **Point-biserial r** | Continuous vs binary | One binary, one continuous | Abandoned vs delay |
| **Polychoric r** | Ordinal vs ordinal | Both ordinal, latent normal | Priority vs compliance |
| **Cramér's V** | Categorical vs categorical | Both nominal | Shift vs disposition |
| **Distance correlation** | Any (non-linear) | Continuous | Non-linear dependencies |
| **Partial correlation** | Controlling confounders | Continuous | Effect controlling for third var |

### 4.6 Temporal structure

| Check | Method | Why |
|-------|--------|-----|
| **ACF** | ACF plot + Ljung–Box at lags 1–24 | Hourly/daily periodicity |
| **PACF** | PACF plot | AR order for forecasting |
| **Seasonal subseries** | Mean by hour within each day | Circadian pattern stability |
| **Runs test** | Wald–Wolfowitz above/below median | Randomness of sequence |
| **ADF** | Unit-root test on daily totals | Differencing for ARIMA |
| **Kruskal–Wallis by hour** | Group response time by hour | Systematic hourly differences |

### 4.7 Bivariate visual exploration

| Plot | Variables | Reveals |
|------|-----------|---------|
| **Scatter + LOESS** | `interview_seconds` vs `dispatch_queue_seconds` | Process bottleneck |
| **Grouped boxplot** | Response time by `shift_label` | Shift differences |
| **Violin + jitter** | `total_elapsed_seconds` by `agency` | Distribution overlap |
| **Grouped histogram** | `turnout_seconds` by `priority` | Priority-based speed |
| **Heatmap (corr)** | All `*_seconds` columns | Correlation structure |
| **Pair plot** | 4–5 key time columns | Pairwise relationships |
| **Hexbin** | Calls vs duration | Dense scatter |
| **Time-series line** | Daily compliance % | Trend, DOW effects |

### 4.8 Assumption validation before parametric tests

| Test | Assumption | EDA check |
|------|------------|-----------|
| ANOVA | Normality within groups | Shapiro–Wilk per group |
| ANOVA | Homogeneity of variances | Levene's / Brown–Forsythe |
| OLS | Residual normality | Shapiro–Wilk on residuals |
| OLS | Homoscedasticity | Breusch–Pagan / White |
| OLS | Linearity | Residuals vs fitted |
| OLS | No multicollinearity | VIF < 5 |
| Paired t-test | Difference normality | Shapiro–Wilk on differences |
| Binomial test | Independence | Check temporal autocorrelation |

### 4.9 Summary EDA checklist

1. ✅ Load → schema validate
2. ✅ Missing value matrix → completeness KPI
3. ✅ Duplicate scan → remove/flag
4. ✅ Descriptive stats (mean, median, IQR, skew, kurtosis, quantiles)
5. ✅ Frequency tables (entropy, mode, `% top`)
6. ✅ Histograms + KDE for all time columns
7. ✅ Normality tests (Shapiro–Wilk per group, D'Agostino overall)
8. ✅ Outlier flags (IQR + MAD + Z + Isolation Forest) → consensus flag
9. ✅ Spearman correlation matrix on `*_seconds`
10. ✅ Cramér's V for categorical × categorical
11. ✅ ACF/PACF on hourly call volume
12. ✅ Boxplots by shift, agency, priority
13. ✅ Scatter + LOESS for interview vs dispatch queue
14. ✅ Assumption checks (Levene, Breusch–Pagan, VIF) before parametric tests
15. ✅ Document all flags, decisions, transformations in report appendix

---

## 5. Grammar-of-graphics plotting (Goal 2)

ggplot2 *is* the grammar. Mirror `base.ipynb`'s bar/DOW chart:

```r
library(ggplot2)

bar_DOW <- ggplot(ev, aes(x = dow, fill = dow)) +
  geom_bar() +
  geom_text(stat = "count", aes(label = after_stat(count)),
            vjust = -0.1) +
  scale_fill_brewer(type = "seq", palette = "Blues") +
  labs(title = "Service Calls per Day", x = "Day", y = "Count") +
  theme_minimal()

# Executive circadian demand
p_demand <- ggplot(ph, aes(x = hour_of_day, y = nine_one_one_calls_received)) +
  stat_summary(fun = mean, geom = "line", color = "#1c5789") +
  labs(title = "Mean 9-1-1 Call Volume by Hour", x = "Hour", y = "Calls") +
  theme_minimal()

# Compliance heatmap (dow x hour)
p_heat <- ggplot(ph, aes(x = factor(hour_of_day), y = dow,
                         fill = nine_one_one_answered_20s_pct)) +
  geom_tile() +
  scale_fill_viridis_c(option = "plasma") +
  labs(title = "9-1-1 Answered <=20s (%) by Day/Hour")
```

Use `patchwork` (`+`/`/`) to compose exec dashboards; `ggplotly()` for interactivity.

---

## 6. Performance standards to benchmark against

| Standard | Threshold | Maps to column / metric |
|----------|-----------|--------------------------|
| **NENA** call answering (NENA-STA-020.1) | 90% ≤ 15s, 95% ≤ 20s | `nine_one_one_answered_15s_pct`, `..._20s_pct` |
| **APCO** PSC incident handling | 90% ≤ 20s, 75% ≤ 10s | `nine_one_one_answered_10s_pct` |
| **NFPA 1710** alarm processing | 64s (90%), 106s (95%) | `dispatch_queue_seconds` |
| **NFPA 1710** turnout (EMS / Fire) | 60s / 80s (90%) | `turnout_seconds` |
| **NFPA 1710** travel (first unit) | 240s (90%) | `travel_seconds` |
| Total response proxy | fire ≈ 5:20, EMS ≈ 5:00 | `total_elapsed_seconds` |

Use `mutate()` + `case_when()` to tag each row compliant/non-compliant, then
summarise compliance %.

---

## 7. Recommended analyses by audience

### 6.1 Executive staff
- `ev |> count(date)` and `ph` rolling means; `tsibble` + `feasts::STL()` for trend/season.
- KPI scorecard via `gt`: 10s/15s/20s answer %, abandon rate, volume vs same-period.
- One-page trend: circadian curve + weekly totals.

### 6.2 Operational management (compliance)
- Compliance % per threshold; **one-sample binomial test** (`isbinom`/ `binom.test`):
  ```r
  ans10 <- sum(ph$nine_one_one_answered_10s_pct/100 * ph$nine_one_one_calls_received)
  tot   <- sum(ph$nine_one_one_calls_received)
  binom.test(ans10, tot, p = 0.75, alternative = "greater")
  ```
- **p-chart** with `qcc::qcc()` on daily compliance to detect special causes.
- **NFPA 1710 quantile compliance**: `quantile(ev$turnout_seconds, 0.90)` ≤ 80?
- **Capability analysis**: `qcc::process.capability()` on `dispatch_queue_seconds`
  with spec limits 64/106.

### 6.3 Shift supervisors
- `ev |> group_by(shift_label)` summaries; **Kruskal–Wallis** (`kruskal.test`)
  on `total_elapsed_seconds`, post-hoc **Dunn** (`PMCMRplus::kwAllPairsDunnTest`).
- Personnel scorecards per `calltaker`/`dispatcher`; IQR outlier flag via `boxplot.stats`.
- **Chi-square** (`chisq.test`) of `shift_label` vs arrival-hour band.

### 6.4 QA/QI managers (quality assurance & improvement)
- **Data completeness audit**: `count(call_disposition)` / `count(method_of_call_reception)` to surface `UNDEFINED` and `NOT CAPTURED` rates; chi-square test across shifts.
- **First-call resolution proxy**: derive `% resolved without transfer` from disposition codes; track by calltaker.
- **Error rate tracking**: flag `dispatch_queue_seconds > 106s` (95th NFPA) as slow-processing; break down by `priority`, `agency`, `shift_label`.
- **p-chart** (`qcc::qcc`) on daily data-completeness rate; detect data-entry drift.
- **Pareto of defect types**: top 10 `call_disposition` categories driving rework; cumulative % with `cumsum` + `barplot`.
- **Process capability (Cpk)**: `qcc::process.capability()` on `dispatch_queue_seconds` vs 64s/106s.
- **Mann–Kendall trend test** (`Kendall::MannKendall` on `nine_one_one_answered_20s_pct`).
- **Before/after comparison**: split data mid-week; `wilcox.test` or `prop.test` on compliance pre/post.
- **Root cause (Ishikawa)**: correlate `problem_nature` with `dispatch_queue_seconds` outliers; `dplyr::filter(quantile(..., 0.90))` + `group_by(problem_nature)`.
- **Quality scorecard**: composite metric in `gt` — 20s-answer %, data completeness %, NFPA 90th-percentile pass — single dashboard KPI.

### 6.5 Analysts / researchers (test bank — Goal 4)
See §8. Plus: `fitdistrplus::fitdist(..., "lnorm")` for response-time distributions,
`lme4::lmer(total_elapsed ~ priority + (1|shift_label))`, `spatstat` for point patterns.

---

## 8. Statistical test bank (Goal 4)

| Analysis | Test / Method | R function / pkg | Audience |
|----------|---------------|------------------|----------|
| Compliance vs standard | One-sample binomial | `binom.test` (stats) | Ops |
| Control of compliance | p-chart | `qcc::qcc` | Ops |
| Process capability | Cp/Cpk | `qcc::process.capability` | Ops |
| Group diffs (skewed) | Kruskal–Wallis + Dunn | `kruskal.test`, `PMCMRplus` | Shift |
| Group diffs (normal) | ANOVA + Tukey HSD | `aov`, `TukeyHSD` | Shift |
| Association | Chi-square | `chisq.test` | Analyst |
| Correlation (skew) | Spearman ρ | `cor.test(method="spearman")` | Analyst |
| Distribution shape | KS / AIC fit | `fitdistrplus` | Analyst |
| Regression | OLS / GLM | `lm`, `glm` (+ `broom`) | Analyst |
| Count regression | Poisson / NB | `glm(family=poisson/negbin)` | Analyst |
| Mixed effects | LMM | `lme4::lmer` | Analyst |
| Trend / seasonality | STL | `feasts::STL` | Exec/Analyst |
| Forecasting | ARIMA / ETS | `fable` | Exec (scaling) |
| Outliers | IQR / robust | `boxplot.stats`, `mvoutlier` | Analyst |
| Spatial | K-function / KDE | `spatstat` | Analyst |
| Clustering | k-means | `kmeans` / `cluster` | Analyst |

### 8.1 Plain-English interpretation with `statease`

`statease` auto-detects the appropriate test, prints a plain-English
interpretation, computes effect sizes, and runs assumption checks — all in
one call. Ideal for reports that must be readable by non-statisticians.

```r
library(statease)

# Independent t-test with assumption checks
analyze(x = dispatch_queue_seconds ~ shift,
        data = ev,
        var_name = "Dispatch Queue Time",
        context = "observational, week of 2026-08-10")

# One-way ANOVA with Tukey post-hoc
analyze(formula = response_time ~ shift,
        data = ev,
        var_name = "Response Time")

# Correlation
analyze(x = dispatch_queue_seconds,
        y = on_scene_seconds,
        data = ev,
        var1_name = "Queue Time",
        var2_name = "On-Scene Time")

# Power analysis
analyze(test_type = "ttest.two", effect_size = 0.5)

# Standalone assumption checks
check_assumptions(response_time ~ shift, data = ev)
```

**Output includes:**
- Test statistic, p-value, effect size (Cohen's d, η², etc.)
- Plain-English interpretation ("There is a statistically significant difference...")
- Assumption checks: Normality (Shapiro-Wilk), Equal variances (Levene's)
- Labels: PASSED / WARNING / NOTE

---

## 9. Dashboards & real-time planning (Goal 3)

- **Shiny + flexdashboard** reading a duckdb/SQLite mirror of the CSVs.
  Live `valueBox`es: 10s/20s compliance, queue depth, volume vs forecast band.
- `ggplotly()` for hover detail on circadian and heatmap charts.
- Real-time alert: `reactivePoll` recomputes 15-min compliance; flash red when
  `answered_20s_pct` < 90% for 3 consecutive intervals.
- Quarto weekly PDF remains the auditable record; Shiny for the live view.

---

## 10. Scaling to weekly / monthly / quarterly / yearly (Goals 5–6)

- Model everything as a `tsibble` keyed on `call_start_time`; `index_by()` +
  `summarise()` produces any period.
- Train `fable::ARIMA()` / `ETS()` on weekly series → M/Q/Y baselines.
- Centralise thresholds (15/20/60/80/240s) in a config `.R` / `_metadata` so all
  four report cadences stay consistent.
- `knitr`/`quarto` parameterised reports: one `.qmd` rendered per period.

---

## 11. Suggested module layout

```
R/
  ingest.R         # read + validate (pointblank)
  standards.R      # threshold constants + compliance helpers
  eda.R            # ggplot2 charts
  stats.R          # test wrappers (broom output)
  app.R            # shiny dashboard
  reports/         # .qmd builders
```

---

## 12. Exploratory Data Analysis (EDA) — mirrored from `base.ipynb`

The following ggplot2 analyses correspond 1:1 to the plotnine prototypes in
`base.ipynb`. Each maps to one or more target audiences and feeds directly into
the weekly report, the test bank, or the Shiny dashboard.

| # | Analysis | Code snippet (ggplot2) | Audience | Use in deliverable |
|---|----------|------------------------|----------|-------------------|
| 1 | **Volume by Day of Week** | `ggplot(ev, aes(x = dow, fill = dow)) + geom_bar() + geom_text(stat = "count", aes(label = after_stat(count)), vjust = -0.1) + scale_fill_brewer(type = "seq", palette = "Blues") + labs(title = "Service Calls per Day") + theme_minimal()` | Exec, Shift | Weekly summary slide |
| 2 | **Volume by Hour of Day** | Same with `x = hour`, `scale_fill_manual(values = RColorBrewer::brewer.pal(9, "Blues"))` | Exec, Ops | Circadian demand curve |
| 3 | **Volume by Shift** | `x = shift`, `fill = shift` | Shift | Shift supervisor briefing |
| 4 | **Volume by Priority** | `x = priority`, `fill = priority` | Ops | Resource allocation |
| 5 | **Volume by ZIP Code** | `ev$ZIP <- substr(ev$postal_code, 1, 5); x = ZIP` + `theme(axis.text.x = element_text(angle = 45, hjust = 1))` | Analyst | Spatial hotspot seed |
| 6 | **Volume by Agency** | `x = agency`, `fill = agency` | Exec, Ops | LAW/EMS/Fire split |
| 7 | **Interview vs Dispatch Queue by DOW** | `ggplot(ev, aes(x = interview_seconds, y = dispatch_queue_seconds, color = dow)) + geom_point()` | Analyst | Process bottleneck ID |
| 8 | **Interview vs Dispatch Queue by Priority** | Same + `geom_smooth()` | Ops, Analyst | Priority-based queueing |
| 9 | **Interview vs Dispatch Queue by Agency** | Same + `geom_smooth(method = "lm")` | Analyst | Agency workflow diffs |
|10| **9-1-1 Volume vs Mean Duration** | `ggplot(ph, aes(x = nine_one_one_calls_received, y = nine_one_one_mean_duration)) + geom_point(color = "#1c5789") + geom_smooth()` | Ops | Capacity planning |
|11| **Non-Emergency Volume vs Mean Duration** | `x = non_emergency_calls_received, y = non_emergency_mean_duration` | Ops | Staffing non-emergency |
|12| **Total Calls vs Overall Mean Duration** | `x = total_calls, y = call_mean_duration` | Exec | Trend indicator |

**Implementation notes**
- `dow` as ordered factor: `factor(dow, levels = c("Sun","Mon","Tue","Wed","Thu","Fri","Sat"))`.
- Use `patchwork` (`+`/`/`) to compose multi-panel figures for exec dashboards.
- `ggplotly()` for interactive drill-down in Shiny.
- Phone data (`ph`) already has `hour_of_day`; join with `ev` on hour for cross-domain EDA.

---

## 13. Advanced Analyses — Beyond `base.ipynb`

These analyses address Goals 3–6 and fill gaps for each audience. R's `tidyverse` + `sf` + `lme4` + `fable` stack makes them concise.

| # | Analysis | Method / Test | R Implementation | Audience | Goal |
|---|----------|---------------|------------------|----------|------|
| 13 | **Spatial Hotspots** | KDE + Ripley's K on lat/lon | `sf::st_as_sf(ev, coords=c("longitude","latitude")) + spatstat::Kest` | Analyst, Ops | 4, 5 |
| 14 | **Response Time by Zone** | GroupBy zone, median/IQR + Kruskal-Wallis | `ev %>% group_by(zone) %>% summarise(across(travel_seconds, list(median=median, iqr=IQR)))` + `kruskal.test` | Ops, Shift | 2, 4 |
| 15 | **Abandoned Call Rate Trend** | Hourly abandoned/received; binomial test | `ph %>% mutate(abandon_rate = nine_one_one_calls_abandoned/nine_one_one_calls_received)` | Exec, Ops | 1, 3 |
| 16 | **Personnel Scorecards** | Per calltaker/dispatcher: median HT, IQR outlier | `ev %>% group_by(calltaker) %>% summarise(med=median(total_elapsed_seconds), iqr=IQR(total_elapsed_seconds))` | Shift, Ops | 1, 2 |
| 17 | **Shift Handoff Analysis** | Last vs first hour of shift; Mann-Whitney | `ev %>% filter(hour %in% c(6,14,22)) %>% wilcox_test(total_elapsed_seconds ~ shift_label)` | Shift, Ops | 2, 4 |
| 18 | **Weekend vs Weekday** | `dow` in Sat/Sun vs rest; proportion test | `ev %>% mutate(is_weekend = dow %in% c("Sat","Sun")) %>% prop.test` | Exec, Analyst | 5 |
| 19 | **Problem Nature Pareto** | Top 20 by volume; cumulative % | `ev %>% count(problem_nature, sort=TRUE) %>% slice_head(n=20) %>% mutate(cum=cumsum(n)/sum(n))` | Exec, Ops | 1, 6 |
| 20 | **Queueing Theory Metrics** | M/M/c: offered load, occupancy, ASA | `ph %>% mutate(offered = nine_one_one_calls_received * nine_one_one_mean_duration/3600)` | Ops, Analyst | 3, 4 |
| 21 | **Correlation Matrix** | Spearman on all time components | `ev %>% select(ends_with("_seconds")) %>% cor(method="spearman") %>% corrplot::corrplot()` | Analyst | 4 |
| 22 | **Survival: Time-to-Answer** | Kaplan-Meier on `pickup_delay_seconds` | `survival::survfit(Surv(pickup_delay_seconds, !abandoned) ~ 1, data=ev)` | Analyst, Ops | 4 |
| 23 | **Compliance Control Chart** | p-chart on daily 20s-compliance | `qcc::qcc(daily_pct, type="p", sizes=daily_n)` | Ops | 3, 4 |
| 24 | **Process Capability** | Cp/Cpk for `dispatch_queue_seconds` vs 64/106 | `qcc::process.capability(dispatch_queue_seconds, spec.limits=c(64,106))` | Ops | 2, 4 |
| 25 | **Mixed-Effects Model** | LMM: `total_elapsed ~ priority + (1|shift_label) + (1|calltaker)` | `lme4::lmer(total_elapsed_seconds ~ priority + (1|shift_label) + (1|calltaker), data=ev)` | Analyst | 4, 5 |
| 26 | **STL Decomposition** | Trend + seasonal + residual on daily totals | `ev %>% as_tsibble(index=call_start_time) %>% index_by(date) %>% summarise(n=n()) %>% model(STL(n))` | Exec, Analyst | 5, 6 |
| 27 | **Forecasting Baseline** | ARIMA/ETS on weekly; `fable` for M/Q/Y | `fable::ARIMA(n ~ pdq(1,1,1) + PDQ(0,1,1))` | Exec | 5, 6 |
| 28 | **Outlier Detection** | Isolation Forest on time components | `isotree::isolation.forest(ev %>% select(interview_seconds:on_scene_seconds))` | Analyst, Shift | 4 |
| 29 | **Call Disposition Quality** | % UNDEFINED by shift/calltaker; chi-square | `ev %>% count(shift_label, call_disposition=="UNDEFINED") %>% chisq.test()` | Ops, Shift | 1, 2 |
| 30 | **Multi-Agency Comparison** | LAW/EMS/Fire: compliance, volume, HT | `ev %>% group_by(agency) %>% summarise(across(c(total_elapsed_seconds), robust_agg))` | Exec, Ops | 1, 2 |

**Code Patterns for Reuse**
```r
# Robust aggregation (skew-safe)
robust_agg <- function(x) tibble(
  median = median(x, na.rm=TRUE),
  iqr    = IQR(x, na.rm=TRUE),
  p90    = quantile(x, 0.90, na.rm=TRUE),
  p95    = quantile(x, 0.95, na.rm=TRUE)
)

# Compliance rate with Wilson CI
compliance_ci <- function(successes, trials) {
  binom.test(successes, trials)$conf.int
}

# Reusable p-chart
p_chart <- function(daily_compliance, n_per_day) {
  p <- mean(daily_compliance)
  ucl <- p + 3*sqrt(p*(1-p)/n_per_day)
  lcl <- max(0, p - 3*sqrt(p*(1-p)/n_per_day))
  tibble(p=p, ucl=ucl, lcl=lcl)
}
```

---

## 14. Open questions / next steps

- Confirm AHJ thresholds (some use 90% ≤ 10s busy-hour rather than 15s).
- Decide if `total_elapsed_seconds` should be decomposed into NFPA components.
- Pick dashboard cadence (live vs 15-min batch).
- Then we build `ingest.R` and `standards.R` together. R's `broom` + `gt` will make
  the exec tables almost painless.
