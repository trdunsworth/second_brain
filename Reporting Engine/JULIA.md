# JULIA.md — Analysis & Library Specification

> Status: Recommendation spec (not final code). Snippets are illustrative.
> Source data:
>   - `data/IndyMo_incidents.csv` — 1,082 incidents, 48 cols, 2026-08-10 → 2026-08-16
>   - `data/IndyMo_hourly_call_counts.csv` — 168 hourly rows (7×24)
> Companion scaffold: `base.ipynb` (Python; Julia mirrors intent).

This document specifies the **Julia** library stack, the grammar-of-graphics
approach (AlgebraOfGraphics on Makie — Goal 2), and the statistical
tests/analyses I recommend for the five target audiences. Julia is the fastest path for the heavy numeric
work and is honest about where its stats/dashboard ecosystem is still maturing.
Use it where compute matters; lean on Python/R where turnkey reporting is needed.

---

## 1. Role of Julia in the project

Julia earns its place on speed: large historical replays (monthly→yearly
aggregations, bootstrap resampling, simulation of staffing scenarios). It is
less mature for dashboards and publication tables, so treat Julia as the
analytics engine feeding results into the Python/R reporting layers.

---

## 2. Library stack

| Need | Package | Notes |
|------|---------|-------|
| Data frames | `DataFrames.jl`, `CSV.jl`, `Dates` | Core. |
| Dates / strings | `Dates`, `TimeSeries.jl`, `StringEncodings.jl` | Parsing. |
| Grammar of graphics | `AlgebraOfGraphics.jl` + `Makie.jl` | GoG on Makie (Goal 2). `Gadfly.jl` is the ggplot2-like alternative. |
| Stats base | `StatsBase.jl`, `HypothesisTests.jl` | Tests, summaries. |
| ANOVA | `ANOVA.jl` | Type I/II/III ANOVA tables. |
| Design of experiments | `ExperimentalDesign.jl` | Factorial, Plackett-Burman, Box-Behnken, CCD. |
| Regression | `GLM.jl` | OLS/GLM. |
| Mixed models | `MixedModels.jl` | Shift as random effect. |
| Distributions | `Distributions.jl` | Lognormal fitting, simulation. |
| Time series | `TimeSeries.jl`, `StateSpaceModels.jl` | Forecasting (Goals 5–6). |
| ML / outliers | `MLJ.jl`, `OutlierDetection.jl` | Clustering, isolation. |
| Tables out | `Tables.jl`, `PrettyTables.jl` | KPI tables. |
| Dashboards | `Genie.jl` / `Dash.jl` | Live views (Goal 3) — thinner than Streamlit/Shiny. |
| Validation | `DataFrames.jl` schema checks | Manual `eltypes`. |

> Honest gap: Julia has no direct `qcc`/p-chart or `fitdistrplus` equivalent that
> is as turnkey. Implement control-limit math manually (easy) or call R/Python
> via `RCall.jl` / `PyCall.jl` for those specific steps.

---

## 3. Data ingestion & cleaning

```julia
using DataFrames, CSV, Dates
using DataFrames: Not

ev = CSV.read("data/IndyMo_incidents.csv", DataFrame)
ph = CSV.read("data/IndyMo_hourly_call_counts.csv", DataFrame)

# Parse datetimes (note: source uses m/d/Y H:M)
for c in [:call_start_time, :incident_start_time, :time_phone_pickup,
          :time_call_enters_queue, :time_first_unit_assigned, :time_unit_enroute,
          :time_unit_arrived, :time_last_unit_cleared, :time_call_closed,
          :time_phone_disconnect]
    ev[!, c] = DateTime.(string.(ev[!, c]), "m/d/y H:M")
end
ph.hour_start = DateTime.(string.(ph.hour_start), "y-m-d H:M:S")

ev.dow  = dayname.(monthdayyear... )  # or use Day(evt).value -> map to abbrev
ev.date = Date.(ev.call_start_time)
ev.zip5 = string.(ev.postal_code) |> s -> first.(s, 5)
```

Flag data quality: `combine(groupby(ev,:call_disposition), nrow)` shows 331
`UNDEFINED`; `dispatch_queue_seconds`/`on_scene_seconds` are right-skewed →
use `median`/`IQR` and non-parametric tests.

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
| Missing value matrix | `% NA` per column; visualise missingness pattern | Missingness may be systematic. |
| Duplicate detection | `nonunique(ev)` or `combinedf(ev, :incident_id) |> nrow` | Duplicate rows inflate counts. |
| Constant/near-constant columns | Columns with ≤2 unique or >95% identical | Candidates for removal. |
| Schema validation | `eltypes(ev)`, ranges, allowed levels | Catch impossible values. |
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
| entropy | `−Σ p log(p)` — uniformity |
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

`AlgebraOfGraphics` expresses the same grammar as `base.ipynb` but declaratively:

```julia
using AlgebraOfGraphics, CairoMakie

# Executive circadian demand
plt = data(ph) * mapping(:hour_of_day => "Hour",
                         :nine_one_one_calls_received => "Calls (mean)") *
      visual(Lines) * mapping(; color=nothing)
draw(plt * datify)   # with a statistical mean layer: use * frequency/@mean

# Compliance heatmap (dow x hour)
heat = data(ph) * mapping(:hour_of_day => "Hour", :dow => "Day",
                          :nine_one_one_answered_20s_pct => "Ans <=20s %") *
       visual(Heatmap)
draw(heat)
```

For a ggplot2-feel alternative, `Gadfly.jl` (`Gadfly.plot(ev, x=:dow, Geom.bar)`)
mirrors the `base.ipynb` bar charts most directly.

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

Implement compliance as a boolean column, then `combine(groupby(...), ...)`.

---

## 7. Recommended analyses by audience

### 6.1 Executive staff
- `combine(groupby(ev,:date), nrow)`; rolling means via `rolling` from `TimeSeries`.
- KPI table with `PrettyTables.jl`: 10s/15s/20s answer %, abandon rate.
- Trend through `StateSpaceModels.jl` (Kalman) or `TimeSeries` decomposition.

### 6.2 Operational management (compliance)
- Compliance % per threshold; **binomial test**:
  ```julia
  using HypothesisTests
  ans10 = sum(ph.nine_one_one_answered_10s_pct ./ 100 .* ph.nine_one_one_calls_received)
  tot   = sum(ph.nine_one_one_calls_received)
  BinomialTest(round(Int, ans10), round(Int, tot); p=0.75)
  ```
- **p-chart / capability**: compute UCL/LCL manually (Julia lacks `qcc`); CL =
  `p`, `UCL = p + 3√(p(1-p)/n)`. Flag points beyond.
- **NFPA 1710 quantile**: `quantile(skipmissing(ev.turnout_seconds), 0.90) ≤ 80`.

### 6.3 Shift supervisors
- `combine(groupby(ev,:shift_label), ...)`; **Kruskal–Wallis** via
  `HypothesisTests.kruskal_wallis` (or `ApproximateKruskalWallis`) on
  `total_elapsed_seconds`; post-hoc with `HypothesisTests` pairwise Mann–Whitney.
- Personnel scorecards per `calltaker`/`dispatcher`; IQR outlier via `quantile`.
- **Chi-square** (`HypothesisTests.ChisqTest` on a contingency table).

### 6.4 QA/QI managers (quality assurance & improvement)
- **Data completeness audit**: `combine(groupby(ev, :call_disposition), nrow)` + `combine(groupby(ev, :method_of_call_reception), nrow)` to surface `UNDEFINED` and `NOT CAPTURED` rates; chi-square test across shifts.
- **First-call resolution proxy**: derive `% resolved without transfer` from disposition codes; track by `calltaker`.
- **Error rate tracking**: flag `dispatch_queue_seconds > 106s` (95th NFPA) as slow-processing; break down by `priority`, `agency`, `shift_label`.
- **p-chart** (manual UCL/LCL) on daily data-completeness rate; detect data-entry drift.
- **Pareto of defect types**: top 10 `call_disposition` categories driving rework; cumulative % via `sort(combine(groupby(...), nrow), :nrow, rev=true)`.
- **Process capability (Cpk)**: manual `cpk = min((USL-μ)/3σ, (μ-LSL)/3σ)` on `dispatch_queue_seconds` vs 64s/106s.
- **Trend test (Mann–Kendall)**: `HypothesisTests` trend or manual; detect monotonic drift in `nine_one_one_answered_20s_pct`.
- **Before/after comparison**: split mid-week; `HypothesisTests.MannWhitneyUTest` on compliance pre/post.
- **Root cause (Ishikawa)**: correlate `problem_nature` with `dispatch_queue_seconds` outliers; `combine(groupby(...), :problem_nature)`.
- **Quality scorecard**: composite metric via `PrettyTables.jl` — 20s-answer %, data completeness %, NFPA 90th-percentile pass — single KPI.

### 6.5 Analysts / researchers (test bank — Goal 4)
See §8. Plus: `fit` a `LogNormal` from `Distributions.jl` to response times,
`MixedModels.jl` for `(1|shift_label)`, `MLJ.jl` for clustering.

---

## 8. Statistical test bank (Goal 4)

| Analysis | Test / Method | Julia pkg | Audience |
|----------|---------------|-----------|----------|
| Compliance vs standard | Binomial test | `HypothesisTests` | Ops |
| Control of compliance | p-chart (manual) | manual | Ops |
| Process capability | Cp/Cpk (manual) | manual | Ops |
| Group diffs (skewed) | Kruskal–Wallis + pairwise | `HypothesisTests` | Shift |
| Group diffs (normal) | ANOVA | `HypothesisTests` / `GLM` | Shift |
| Association | Chi-square | `HypothesisTests.ChisqTest` | Analyst |
| Correlation (skew) | Spearman ρ | `HypothesisTests.CorTest` | Analyst |
| Distribution shape | KS / fit | `Distributions`, `HypothesisTests` | Analyst |
| Regression | OLS / GLM | `GLM.jl` | Analyst |
| Count regression | Poisson / NB | `GLM.jl` | Analyst |
| Mixed effects | LMM | `MixedModels.jl` | Analyst |
| Trend / seasonality | State-space / kalman | `StateSpaceModels.jl` | Exec/Analyst |
| Forecasting | ARIMA / ETS | `StateSpaceModels` / `TimeSeries` | Exec (scaling) |
| Outliers | IQR / Isolation | `OutlierDetection.jl` | Analyst |
| Spatial | KDE / K-function | `KernelDensity.jl` (basic) | Analyst |
| Clustering | k-means | `MLJ.jl` / `Clustering.jl` | Analyst |

### 8.1 Hypothesis testing with `HypothesisTests.jl`

`HypothesisTests.jl` provides clean output for common statistical tests,
including p-values, confidence intervals, and test statistics.

```julia
using HypothesisTests, Statistics, DataFrames

ev = CSV.read("data/IndyMo_incidents.csv", DataFrame)

# One-sample t-test
OneSampleTTest(ev.dispatch_queue_seconds)

# Two-sample t-test
day = ev[ev.shift .== "Day", :dispatch_queue_seconds]
night = ev[ev.shift .== "Night", :dispatch_queue_seconds]
TwoSampleTTest(day, night)

# Paired t-test
# TwoSamplePairedTTest(x, y)

# Mann-Whitney U test (non-parametric)
MannWhitneyUTest(day, night)

# Kruskal-Wallis test (non-parametric ANOVA)
# Group data by shift, then test

# Chi-square test
# ChisqTest(observed, expected)

# Correlation test
CorTest(ev.dispatch_queue_seconds, ev.on_scene_seconds)

# Binomial test (compliance)
BinomialTest(90, 100, 0.9)  # 90/100 vs 90% standard

# Proportion z-test
TwoProportionZTest(x1, n1, x2, n2)
```

### 8.2 ANOVA with `ANOVA.jl`

`ANOVA.jl` provides Type I/II/III ANOVA tables for linear models.

```julia
using ANOVA, GLM, DataFrames

# Fit linear model
model = fit(LinearModel, @formula(dispatch_queue_seconds ~ shift), ev)

# Type III ANOVA table
anova(model)

# Two-way ANOVA
model2 = fit(LinearModel,
    @formula(dispatch_queue_seconds ~ shift + call_type),
    ev)
anova(model2)
```

### 8.3 Design of experiments with `ExperimentalDesign.jl`

`ExperimentalDesign.jl` provides factorial, Plackett-Burman, Box-Behnken,
and central composite designs for systematic process optimization.

```julia
using ExperimentalDesign

# Full factorial design (2^3 = 8 runs)
design = fullfactorial(3)

# Fractional factorial (screening)
design = fractional(3, 1)  # 2^(3-1) = 4 runs

# Plackett-Burman (screening many factors)
design = plackett_burman(7)

# Box-Behnken (response surface)
design = box_behnken(3)

# Central composite design
design = central_composite(3)
```

---

## 9. Dashboards & real-time planning (Goal 3)

- **Genie.jl** or **Dash.jl** over a duckdb/SQLite mirror of the CSVs.
  Live cards: 10s/20s compliance, queue depth, volume vs forecast.
- Render `AlgebraOfGraphics` figures to the web via `WGLMakie` for interactivity.
- Real-time alert: recompute 15-min compliance; flag when `answered_20s_pct` < 90%
  for 3 consecutive intervals.
- Julia dashboards are thinner than Shiny/Streamlit — consider Julia as the
  compute layer feeding a Python/R front end.

---

## 10. Scaling to weekly / monthly / quarterly / yearly (Goals 5–6)

- Keep all aggregations as `groupby`/`combine` keyed on `call_start_time`; widen
  the window for M/Q/Y.
- `TimeSeries.jl` `TimeArray` + `StateSpaceModels` for M/Q/Y trend baselines.
- Centralise thresholds (15/20/60/80/240s) in a `const` config module.
- Pre-aggregate into duckdb so M/Q/Y reports are `SELECT … GROUP BY period`.

---

## 11. Suggested module layout

```
julia/
  ingest.jl         # read + validate
  standards.jl      # threshold constants + compliance
  eda.jl            # AlgebraOfGraphics charts
  stats.jl          # test wrappers
  app.jl            # Genie/Dash
  reports/          # (optional) call Python/R for final docs
```

---

## 12. Exploratory Data Analysis (EDA) — mirrored from `base.ipynb`

The following AlgebraOfGraphics (on Makie) analyses correspond to the plotnine/
ggplot2 prototypes in `base.ipynb`. Each maps to one or more target audiences.
Julia's GoG syntax is declarative: `data(df) * mapping(...) * visual(...)` then
`draw()`. For quick ggplot2-like code, `Gadfly.jl` is also an option.

| # | Analysis | Code sketch (AlgebraOfGraphics) | Audience | Use in deliverable |
|---|----------|--------------------------------|----------|-------------------|
| 1 | **Volume by Day of Week** | `plt = data(ev) * mapping(:dow, fill=:dow) * visual(BarPlot) + mapping(label=:dow) * visual(Annotation, ...)` (use `Gadfly.plot(ev, x=:dow, Geom.bar, Geom.label)` for direct port) | Exec, Shift | Weekly summary slide |
| 2 | **Volume by Hour of Day** | `data(ev) * mapping(:hour, fill=:hour) * visual(BarPlot)` | Exec, Ops | Circadian demand curve |
| 3 | **Volume by Shift** | `data(ev) * mapping(:shift, fill=:shift) * visual(BarPlot)` | Shift | Shift briefing |
| 4 | **Volume by Priority** | `data(ev) * mapping(:priority, fill=:priority) * visual(BarPlot)` | Ops | Resource allocation |
| 5 | **Volume by ZIP Code** | `ev.ZIP = first.(string.(ev.postal_code), 5); data(ev) * mapping(:ZIP, fill=:ZIP) * visual(BarPlot)` | Analyst | Spatial hotspot seed |
| 6 | **Volume by Agency** | `data(ev) * mapping(:agency, fill=:agency) * visual(BarPlot)` | Exec, Ops | LAW/EMS/Fire split |
| 7 | **Interview vs Dispatch Queue by DOW** | `data(ev) * mapping(:interview_seconds, :dispatch_queue_seconds, color=:dow) * visual(Scatter)` | Analyst | Process bottleneck ID |
| 8 | **Interview vs Dispatch Queue by Priority** | Same + `* visual(Smooth)` (or `visual(LinearFit)`) | Ops, Analyst | Priority queueing |
| 9 | **Interview vs Dispatch Queue by Agency** | Same + `* visual(LinearFit)` | Analyst | Agency workflow diffs |
|10| **9-1-1 Volume vs Mean Duration** | `data(ph) * mapping(:nine_one_one_calls_received, :nine_one_one_mean_duration) * visual(Scatter) * visual(Smooth)` | Ops | Capacity planning |
|11| **Non-Emergency Volume vs Mean Duration** | `mapping(:non_emergency_calls_received, :non_emergency_mean_duration)` | Ops | Non-emergency staffing |
|12| **Total Calls vs Overall Mean Duration** | `mapping(:total_calls, :call_mean_duration)` | Exec | Trend indicator |

**Implementation notes**
- `dow` as ordered categorical: use `CategoricalArrays.CategoricalArray` with ordered levels.
- Derive `ZIP` via `first.(string.(ev.postal_code), 5)`.
- For interactive output, render to `WGLMakie` (`draw(plt, WGLMakie.Screen())`).
- Join `ev` and `ph` on `hour` for cross-domain EDA.
- `Gadfly.jl` (`plot(ev, x=:dow, Geom.bar)`) is the closest 1:1 port if AoG syntax feels heavy.

---

## 13. Advanced Analyses — Beyond `base.ipynb`

These analyses address Goals 3–6. Julia excels at the numeric heavy lifting (bootstrapping, simulation, large M/Q/Y aggregations). For plotting/stats gaps, call Python/R via `PyCall`/`RCall` or implement manually.

| # | Analysis | Method / Test | Julia Implementation | Audience | Goal |
|---|----------|---------------|----------------------|----------|------|
| 13 | **Spatial Hotspots** | KDE + Ripley's K | `KernelDensity.kde((ev.latitude, ev.longitude))` + manual Ripley (no turnkey pkg) | Analyst, Ops | 4, 5 |
| 14 | **Response Time by Zone** | GroupBy zone, median/IQR + Kruskal-Wallis | `combine(groupby(ev,:zone), :travel_seconds => median => :med, :travel_seconds => x->quantile(x,0.75)-quantile(x,0.25) => :iqr)` + `HypothesisTests.kruskal_wallis` | Ops, Shift | 2, 4 |
| 15 | **Abandoned Call Rate Trend** | Hourly abandoned/received; binomial test | `ph.abandon_rate = ph.nine_one_one_calls_abandoned ./ ph.nine_one_one_calls_received` | Exec, Ops | 1, 3 |
| 16 | **Personnel Scorecards** | Per calltaker: median HT, IQR outlier | `combine(groupby(ev,:calltaker), :total_elapsed_seconds => median => :med, :total_elapsed_seconds => x->iqr(x) => :iqr)` | Shift, Ops | 1, 2 |
| 17 | **Shift Handoff Analysis** | Last vs first hour; Mann-Whitney | Filter boundary hours; `HypothesisTests.MannWhitneyUTest` | Shift, Ops | 2, 4 |
| 18 | **Weekend vs Weekday** | `dow` in Sat/Sun vs rest; proportion test | `ev.is_weekend = in.(ev.dow, Ref(["Sat","Sun"]))` + `HypothesisTests.OneSamplePropTest` | Exec, Analyst | 5 |
| 19 | **Problem Nature Pareto** | Top 20 by volume; cumulative % | `sort(combine(groupby(ev,:problem_nature), nrow), :nrow, rev=true)[1:20,:]` | Exec, Ops | 1, 6 |
| 20 | **Queueing Theory Metrics** | M/M/c: offered load, occupancy, ASA | `ph.offered = ph.nine_one_one_calls_received .* ph.nine_one_one_mean_duration ./ 3600` | Ops, Analyst | 3, 4 |
| 21 | **Correlation Matrix** | Spearman on time components | `cols = names(ev, r"_seconds$"); cors = corspearman(Matrix(ev[:,cols]))` | Analyst | 4 |
| 22 | **Survival: Time-to-Answer** | Kaplan-Meier on `pickup_delay_seconds` | `Survival.jl` (if avail) or manual KM; otherwise `RCall` to `survival` | Analyst, Ops | 4 |
| 23 | **Compliance Control Chart** | p-chart on daily 20s-compliance | Manual: `p = mean(daily); ucl = p + 3√(p(1-p)/n); lcl = max(0, p - 3√(...))` | Ops | 3, 4 |
| 24 | **Process Capability** | Cp/Cpk for `dispatch_queue_seconds` vs 64/106 | Manual: `cpk = min((USL-μ)/3σ, (μ-LSL)/3σ)` with `μ,σ = mean,std` | Ops | 2, 4 |
| 25 | **Mixed-Effects Model** | LMM: `total_elapsed ~ priority + (1|shift) + (1|calltaker)` | `MixedModels.fit(MixedModel, @formula(total_elapsed_seconds ~ priority + (1|shift_label) + (1|calltaker)), ev)` | Analyst | 4, 5 |
| 26 | **STL Decomposition** | Trend + seasonal + residual | `StateSpaceModels.stl` or `PyCall` to `statsmodels.tsa.seasonal_decompose` | Exec, Analyst | 5, 6 |
| 27 | **Forecasting Baseline** | ARIMA/ETS via `StateSpaceModels` | `StateSpaceModels.SARIMA` or `TimeSeries.jl` | Exec | 5, 6 |
| 28 | **Outlier Detection** | Isolation Forest on time components | `MLJ.jl` + `IsolationForest` or `OutlierDetection.jl` | Analyst, Shift | 4 |
| 29 | **Call Disposition Quality** | % UNDEFINED by shift/calltaker; chi-square | `combine(groupby(ev,[:shift_label,:call_disposition]), nrow)` + `HypothesisTests.ChisqTest` | Ops, Shift | 1, 2 |
| 30 | **Multi-Agency Comparison** | LAW/EMS/Fire: compliance, volume, HT | `combine(groupby(ev,:agency), robust_agg.(:total_elapsed_seconds))` | Exec, Ops | 1, 2 |

**Code Patterns for Reuse**
```julia
# Robust aggregation (skew-safe)
robust_agg(x) = (median=median(skipmissing(x)), iqr=IQR(skipmissing(x)),
                 p90=quantile(skipmissing(x),0.90), p95=quantile(skipmissing(x),0.95))

# Compliance rate with Wilson CI (manual, no deps)
function wilson_ci(successes, trials; z=1.96)
    p = successes/trials
    denom = 1 + z^2/trials
    centre = (p + z^2/(2trials)) / denom
    half = z * sqrt(p*(1-p)/trials + z^2/(4trials^2)) / denom
    return (centre - half, centre + half)
end

# Reusable p-chart
function p_chart(daily_compliance, n_per_day)
    p = mean(daily_compliance)
    ucl = p + 3*sqrt(p*(1-p)/n_per_day)
    lcl = max(0.0, p - 3*sqrt(p*(1-p)/n_per_day))
    return (p=p, ucl=ucl, lcl=lcl)
end
```

> **Note**: For spatial (13), survival (22), STL (26), forecasting (27) — Julia's ecosystem is thinner. Recommended pattern: compute core numerics in Julia, hand off to Python (`PyCall`) or R (`RCall`) for the specialized stats/plotting, then pull results back.

---

## 14. Open questions / next steps

- Confirm AHJ thresholds (some use 90% ≤ 10s busy-hour rather than 15s).
- Decide whether `total_elapsed_seconds` should split into NFPA components.
- Julia's dashboard/reporting gap: confirm we feed Python/R for final documents.
- Then we build `ingest.jl` and `standards.jl` together. The speed will be
  satisfying once the boilerplate is behind us.
