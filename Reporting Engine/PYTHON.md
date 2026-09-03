# PYTHON.md — Analysis & Library Specification

> Status: Recommendation spec (not final code). Snippets are illustrative.
> Source data:
>   - `data/IndyMo_incidents.csv` — 1,082 incidents, 48 cols, 2026-08-10 → 2026-08-16
>   - `data/IndyMo_hourly_call_counts.csv` — 168 hourly rows (7×24)
> Companion scaffold: `base.ipynb` (pandas + plotnine + seaborn EDA).

This document specifies the **Python** library stack, the grammar-of-graphics
plotting approach, and the statistical tests/analyses I recommend for the five
target audiences. The standards below are what turn a weekly PDF into an
accountability document.

---

## 1. Role of Python in the project

Python is the backbone: data wrangling (pandas), SQL abstraction over the raw
CSV/Parquet (duckdb + ggsql), grammar-of-graphics charts (plotnine), classical
stats (scipy + statsmodels), and dashboards (Streamlit/Dash + plotly). The
`pyproject.toml` already pins most of this, so we extend rather than invent.

---

## 2. Library stack

| Need | Package | Notes |
|------|---------|-------|
| Data frames | `pandas>=2.3`, `numpy>=2.0` | Already pinned. |
| SQL layer | `duckdb>=1.4`, `ggsql>=0.3` | ggsql gives a ggplot-like grammar **over SQL** — useful for the dashboard queries without leaving GoG semantics. |
| Grammar of graphics | `plotnine>=0.13` (+ `[extra]`) | Mirrors the `base.ipynb` `p9.ggplot(...)` style. Primary charting lib (Goal 2). |
| Supplemental plots | `matplotlib>=3.11`, `seaborn>=0.13` | Used in `base.ipynb` for palettes/heatmaps. |
| Classical stats | `scipy>=1.13`, `statsmodels>=0.14` | Tests, OLS/GLM, mixed models, decomposition. |
| Plain-English stats | `pingouin` | Effect sizes, assumption checks, power analysis; clean output. |
| Forecasting | `statsmodels` (baseline) → `prophet` or `statsforecast` | For weekly/monthly scaling (Goals 5–6). |
| Distribution fitting / ML | `scipy`, `scikit-learn` | Outlier detection, clustering. |
| Tables in docs | `great_tables` | Clean KPI tables for Quarto Word/PDF. |
| Dashboards | `streamlit` or `dash` + `plotly` | Exec/ops live views (Goal 3). |
| Validation | `pydantic>=2.13` | Already pinned; enforce schema on ingest. |

---

## 3. Data ingestion & cleaning

The `base.ipynb` reads with `pd.read_csv(r'data\IndyMo_incidents.csv')` (Windows
path). On this Linux host use forward slashes. Extend the notebook with a typed
schema and explicit datetime parsing:

```python
import pandas as pd
import pydantic

ev = pd.read_csv("data/IndyMo_incidents.csv",
                 parse_dates=["call_start_time", "incident_start_time",
                              "time_phone_pickup", "time_call_enters_queue",
                              "time_first_unit_assigned", "time_unit_enroute",
                              "time_unit_arrived", "time_last_unit_cleared",
                              "time_call_closed", "time_phone_disconnect"])
ph = pd.read_csv("data/IndyMo_hourly_call_counts.csv", parse_dates=["hour_start"])

# Derived helpers (note: base.ipynb already derives DOW; keep consistent order)
DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
ev["dow"] = ev["call_start_time"].dt.dayofweek.map(lambda i: DOW[i])
ev["date"] = ev["call_start_time"].dt.date
ev["zip5"] = ev["postal_code"].astype(str).str[:5]
```

Key data-quality flags to surface (these are patterns, not accidents):
- `call_disposition` has 331 `UNDEFINED` and 18 `method_of_call_reception == NOT CAPTURED`.
  Track as a **data-completeness KPI** for operational management.
- `dispatch_queue_seconds` (mean 85s, median 21s) and `on_scene_seconds`
  (mean 2009s, median 1751s) are heavily right-skewed → use robust/non-parametric methods.

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
| Missing value matrix | `% NA` per column; heatmap of missingness pattern | Missingness may be systematic (e.g., `call_disposition` unpopulated for certain `agency` values). |
| Duplicate detection | `duplicated()` on `(incident_id)` or full-row duplicates | Duplicate rows inflate counts and bias compliance. |
| Constant/near-constant columns | Columns with ≤2 unique values or >95% identical | Candidates for removal before modelling. |
| Schema validation | Data types, ranges (`0 ≤ dispatch_queue_seconds ≤ 86400`), allowed levels | Catch impossible values (negative times, future dates). |
| Completeness KPI | `(1 - NA_count/total) × 100` per column; report as table | Operational management monitors this weekly. |

### 4.2 Univariate descriptive statistics

For every numeric column, compute **all** of:

| Statistic | Formula / Note |
|-----------|----------------|
| n, n_valid | Count before/after NA removal |
| min, max | Range |
| mean, median | Central tendency — compare for skew |
| std dev, IQR | Spread — IQR robust to outliers |
| skewness | `>1` → heavy right tail (use log transform) |
| kurtosis | `>3` → heavier tails than normal (outlier risk) |
| p5, p10, p25, p50, p75, p90, p95 | Quantile table — reveals tail behaviour |
| CV (coefficient of variation) | `std/mean` — compare across columns for relative variability |

For every categorical column:

| Statistic | Note |
|-----------|------|
| n_levels | Cardinality |
| mode, mode_freq | Most common level + count |
| entropy | `−Σ p log(p)` — higher = more uniform distribution |
| `% of top level` | Concentration check |

### 4.3 Distribution shape & normality

| Test | H₀ | When to use | Decision rule |
|------|----|-------------|---------------|
| **Shapiro–Wilk** | Data is normal | n < 5000 (per shift/group) | p < 0.05 → reject normality |
| **Kolmogorov–Smirnov** (Lilliefors corrected) | Data is normal | n ≥ 5000 | p < 0.05 → reject |
| **Anderson–Darling** | Data is normal | Sensitive to tail departures | Compare statistic to critical values |
| **D'Agostino–Pearson** | Data is normal | Tests skewness + kurtosis jointly | p < 0.05 → reject |
| **Jarque–Bera** | Data is normal | Large samples, tests skew+kurtosis | p < 0.05 → reject |
| **Q–Q plot** | Visual normality | Always plot | Points off line → non-normal |
| **Histogram + KDE** | Visual shape | Always plot | Identify modality, skew, gaps |

**Action**: If `dispatch_queue_seconds` or `on_scene_seconds` fail normality, use
non-parametric tests (Kruskal–Wallis, Mann–Whitney) or log-transform before
parametric tests.

### 4.4 Outlier identification (multi-method)

No single method is sufficient. Use **all** of the following and flag points
detected by ≥2 methods:

| Method | Threshold / Rule | Sensitivity |
|--------|------------------|-------------|
| **IQR fence** | `x < Q1 − 1.5×IQR` or `x > Q3 + 1.5×IQR` (standard); `×3` for extreme | Robust, non-parametric |
| **Modified Z-score (MAD)** | `|0.6745×(x−median)/MAD| > 3.5` | Robust to masking |
| **Z-score** | `|x−mean|/std > 3` | Sensitive to non-normal data |
| **Percentile filter** | `x < p1` or `x > p99` | Simple, transparent |
| **Grubbs' test** | Tests if max/min is outlier; iterative | Parametric, assumes normality |
| **Dixon's Q test** | `Q = gap/range`; compare to critical Q table | Small samples (n < 30) |
| **DBSCAN** | Density-based cluster; points in noise cluster | Multivariate, no distribution assumption |
| **Isolation Forest** | Anomaly score < threshold (default: −0.5) | Multivariate, handles high-dim |
| **Mahalanobis distance** | `D² > χ²(p, 0.975)` | Multivariate normality assumed |

**Implementation pattern**:
```python
def flag_outliers(series, name="value"):
    q1, q3 = series.quantile(0.25), series.quantile(0.75)
    iqr = q3 - q1
    fence_lo, fence_hi = q1 - 1.5*iqr, q3 + 1.5*iqr
    mad = (series - series.median()).abs().median()
    mod_z = 0.6745 * (series - series.median()) / mad
    return pd.DataFrame({
        f"{name}_iqr_flag": (series < fence_lo) | (series > fence_hi),
        f"{name}_mad_flag": mod_z.abs() > 3.5,
        f"{name}_z_flag": ((series - series.mean())/series.std()).abs() > 3,
        f"{name}_pct_flag": (series < series.quantile(0.01)) | (series > series.quantile(0.99)),
    })
```

### 4.5 Correlation analyses

Compute **all** of the following; each answers a different question:

| Method | Type | Assumptions | Use case |
|--------|------|-------------|----------|
| **Pearson r** | Linear association | Both continuous, ~normal | Default for continuous–continuous |
| **Spearman ρ** | Monotonic association | Ordinal or continuous; no normality needed | skewed data (`dispatch_queue_seconds`) |
| **Kendall τ** | Concordance | Ordinal; robust with ties | Small samples, many ties |
| **Point-biserial r** | Continuous vs binary | One binary, one continuous | e.g., `abandoned` (0/1) vs `pickup_delay_seconds` |
| **Polychoric r** | Ordinal vs ordinal | Both ordinal, assumed latent normal | Priority vs compliance (both ordinal) |
| **Cramér's V** | Categorical vs categorical | Both nominal | `shift_label` vs `call_disposition` |
| **Distance correlation** | Any association (non-linear) | Continuous | Detects non-linear dependencies |
| **Partial correlation** | Controlling for confound | Continuous | Effect of `priority` on `dispatch_queue_seconds` controlling for `agency` |

**Implementation pattern**:
```python
import numpy as np
from scipy import stats

# Full correlation matrix (Spearman) for all time components
time_cols = [c for c in ev.columns if c.endswith("_seconds")]
corr_spearman = ev[time_cols].corr(method="spearman")

# Pairwise with p-values
def corr_with_pval(df, method="spearman"):
    cols = df.select_dtypes(include=[np.number]).columns
    n = len(cols)
    pmat = pd.DataFrame(np.zeros((n,n)), columns=cols, index=cols)
    rmat = df[cols].corr(method=method)
    for i in range(n):
        for j in range(i+1, n):
            stat, p = stats.spearmanr(df[cols[i]], df[cols[j]])
            pmat.iloc[i,j] = p
            pmat.iloc[j,i] = p
    return rmat, pmat
```

### 4.6 Temporal structure

| Check | Method | Why |
|-------|--------|-----|
| **Autocorrelation (ACF)** | ACF plot + Ljung–Box test at lags 1–24 | Detect hourly/daily periodicity in call volume. |
| **Partial autocorrelation (PACF)** | PACF plot | Identifies AR order for forecasting. |
| **Seasonal subseries** | Plot mean by hour within each day | Reveals if circadian pattern is stable across days. |
| **Runs test** | Wald–Wolfowitz runs above/below median | Tests randomness of temporal sequence. |
| **Augmented Dickey–Fuller** | Unit-root test on daily totals | Determines if differencing needed for ARIMA. |
| **Kruskal–Wallis by hour** | Group `dispatch_queue_seconds` by `hour_of_day` | Are some hours systematically slower? |

### 4.7 Bivariate visual exploration

| Plot | Variables | Reveals |
|------|-----------|---------|
| **Scatter + LOESS** | `interview_seconds` vs `dispatch_queue_seconds` | Process bottleneck, non-linearity |
| **Grouped boxplot** | `dispatch_queue_seconds` by `shift_label` | Shift-level differences, outliers |
| **Violin + jitter** | `total_elapsed_seconds` by `agency` | Distribution shape + overlap |
| **Grouped histogram** | `turnout_seconds` by `priority` | Are higher-priority calls faster? |
| **Heatmap (corr matrix)** | All `*_seconds` columns | Correlation structure at a glance |
| **Pair plot (SPLOM)** | 4–5 key time columns | Pairwise relationships, clusters |
| **Hexbin** | `nine_one_one_calls_received` vs `nine_one_one_mean_duration` | Dense scatter without overplotting |
| **Time-series line** | Daily compliance % over week | Trend, day-of-week effects |

### 4.8 Assumption validation before parametric tests

| Test to run later | Assumption | EDA check |
|-------------------|------------|-----------|
| One-way ANOVA | Normality within groups | Shapiro–Wilk per group; Q–Q per group |
| ANOVA | Homogeneity of variances | Levene's test or Brown–Forsythe |
| OLS regression | Residual normality | Shapiro–Wilk on residuals |
| OLS regression | Homoscedasticity | Breusch–Pagan or White test |
| OLS regression | Linearity | Residuals vs fitted plot |
| OLS regression | No multicollinearity | VIF (Variance Inflation Factor) < 5 |
| Paired t-test | Difference normality | Shapiro–Wilk on pairwise differences |
| Binomial test | Independence | Check for temporal autocorrelation |

### 4.9 Summary EDA checklist (run before every analysis)

1. ✅ Load data → schema validate (types, ranges, allowed levels)
2. ✅ Missing value matrix → completeness KPI table
3. ✅ Duplicate scan → remove or flag
4. ✅ Descriptive stats (mean, median, IQR, skew, kurtosis, quantiles) for all numerics
5. ✅ Frequency tables for all categoricals (entropy, mode, `% of top level`)
6. ✅ Histograms + KDE for all time columns
7. ✅ Normality tests (Shapiro–Wilk per group, D'Agostino overall)
8. ✅ Outlier flags (IQR + MAD + Z-score + Isolation Forest) → consensus flag
9. ✅ Spearman correlation matrix on all `*_seconds` columns
10. ✅ Cramér's V for all categorical × categorical pairs
11. ✅ ACF/PACF on hourly call volume
12. ✅ Boxplots of response times by shift, agency, priority
13. ✅ Scatter + LOESS for interview vs dispatch queue
14. ✅ Assumption checks (Levene, Breusch–Pagan, VIF) before parametric tests
15. ✅ Document all flags, decisions, and transformations in report appendix

---

## 5. Grammar-of-graphics plotting (Goal 2)

Continue the `base.ipynb` `p9.ggplot` idiom. The `after_stat`/`stage` trick used
in `bar_DOW` is correct; reuse it everywhere. Examples to build on:

```python
import plotnine as p9

# Executive: circadian demand curve from hourly data
p_demand = (
    p9.ggplot(ph, p9.aes(x="hour_of_day",
                         y="nine_one_one_calls_received"))
    + p9.stat_summary(fun_y="mean", geom="line", color="#1c5789")
    + p9.labs(title="Mean 9-1-1 Call Volume by Hour of Day",
              x="Hour", y="Calls (mean)")
    + p9.theme_minimal()
)

# Operational: compliance heatmap (dow x hour) for 20s-answer %
ph["dow"] = pd.to_datetime(ph["hour_start"]).dt.dayofweek.map(lambda i: DOW[i])
p_heat = (
    p9.ggplot(ph, p9.aes(x="factor(hour_of_day)", y="dow",
                         fill="nine_one_one_answered_20s_pct"))
    + p9.geom_tile()
    + p9.scale_fill_cmap(name="plasma")
    + p9.labs(title="9-1-1 Answered ≤20s (%) by Day/Hour")
)
```

For dashboards, render the same `p9` figure to Plotly via
`plotnine*` → `plotly` (or just use `plotly.express` directly for interactivity).

---

## 6. Performance standards to benchmark against

These are the rules the reports answer to. Map each to a column.

| Standard | Threshold | Maps to column / metric |
|----------|-----------|--------------------------|
| **NENA** call answering (NENA-STA-020.1) | 90% ≤ 15s, 95% ≤ 20s | `nine_one_one_answered_15s_pct`, `..._20s_pct` |
| **APCO** PSC incident handling | 90% ≤ 20s, 75% ≤ 10s | `nine_one_one_answered_10s_pct` |
| **NFPA 1710** alarm processing | 64s (90%), 106s (95%) | `dispatch_queue_seconds` |
| **NFPA 1710** turnout (EMS / Fire) | 60s / 80s (90%) | `turnout_seconds` |
| **NFPA 1710** travel (first unit) | 240s (90%) | `travel_seconds` |
| Total response proxy | fire ≈ 5:20, EMS ≈ 5:00 | `total_elapsed_seconds` |

The `nine_one_one_answered_20s_pct` averages **90.4%** in this week's data —
right at the NENA 90% line. That is the kind of number execs stare at.

---

## 7. Recommended analyses by audience

### 6.1 Executive staff (high-level trends)
- Volume summaries: calls/day, by `shift_label`, by `agency` (extend `bar_Shift`, `bar_agency`).
- 7-day rolling mean of total calls; annotate peak day.
- KPI scorecard: 10s/15s/20s answer compliance vs NENA thresholds (green/amber/red).
- One-page trend slide: circadian curve + weekly totals.

### 6.2 Operational management (compliance & standards)
- **Compliance rate** per threshold: `% hours meeting 90% ≤ 15s`.
- **One-sample binomial test** — is the true 10s-answer rate ≥ 0.75 (APCO)?
  ```python
  from scipy import stats
  ans10 = int((ph["nine_one_one_answered_10s_pct"]/100 * ph["nine_one_one_calls_received"]).sum())
  tot   = int(ph["nine_one_one_calls_received"].sum())
  res = stats.binomtest(ans10, tot, p=0.75, alternative="greater")
  ```
- **p-chart (control chart)** of daily compliance to flag special-cause variation
  (library: `spc`, or compute UCL/LCL manually).
- **NFPA 1710 quantile compliance**: report the 90th percentile of
  `turnout_seconds` / `travel_seconds` and test `p90 ≤ target`.
  ```python
  import numpy as np
  p90_turnout = np.percentile(ev["turnout_seconds"].dropna(), 90)
  print("Turnout p90:", p90_turnout, "<= 80s (fire)?", p90_turnout <= 80)
  ```
- **Process capability** (Cp/Cpk) of `dispatch_queue_seconds` vs 64s/106s spec.

### 6.3 Shift supervisors (shift-level)
- Volume & duration by shift: `ev.groupby("shift_label")`.
- **Kruskal–Wallis** across shifts on `total_elapsed_seconds` (non-parametric, handles skew),
  then **Tukey HSD** / Dunn post-hoc for pairs.
  ```python
  groups = [g["total_elapsed_seconds"].dropna() for _, g in ev.groupby("shift_label")]
  stats.kruskal(*groups)
  ```
- Personnel scorecards: per `calltaker` / `dispatcher` mean handle time; IQR outlier flag.
- **Chi-square** of `shift_label` vs call-arrival hour (are we staffed where demand is?).

### 6.4 QA/QI managers (quality assurance & improvement)
- **Data completeness audit**: % of records with `call_disposition == "UNDEFINED"` and `method_of_call_reception == "NOT CAPTURED"` by shift/calltaker.
- **First-call resolution proxy**: % of incidents resolved without transfer or callback (derive from disposition codes).
- **Error rate tracking**: incidents where `dispatch_queue_seconds > 106s` (95th NFPA threshold) flagged as "slow processing"; root-cause by `priority`, `agency`, `shift_label`.
- **Control chart (p-chart)** on daily data-completeness rate; UCL/LCL to detect data-entry drift.
- **Pareto of defect types**: top 10 `call_disposition` categories driving rework or incomplete data.
- **Process capability (Cpk)**: `dispatch_queue_seconds` vs 64s/106s spec limits — quantify how centered the process is.
- **Trend test (Mann–Kendall)**: non-parametric monotonic trend in `nine_one_one_answered_20s_pct` over the week; detect improvement or degradation.
- **Before/after comparison**: if a protocol change occurred mid-week, compare compliance pre/post via Mann–Whitney.
- **Root cause analysis (Ishikawa/Fishbone)**: correlate `problem_nature` with `dispatch_queue_seconds` outliers to isolate contributing factors.
- **Quality scorecard**: composite metric combining 20s-answer rate, data completeness %, and NFPA 90th-percentile compliance into a single dashboard KPI.

### 6.5 Analysts / researchers (test bank — Goal 4)
See §8. Also: distribution fitting, time-series forecasting, spatial hotspots.

---

## 8. Statistical test bank (Goal 4)

| Analysis | Test / Method | Python lib | Primary audience |
|----------|---------------|-----------|------------------|
| Compliance vs standard | One-sample binomial test | `scipy.stats.binomtest` | Ops |
| Control of compliance | p-chart (Shewhart) | `spc` / manual | Ops |
| Process capability | Cp/Cpk | manual / `capability` | Ops |
| Group diffs (skewed) | Kruskal–Wallis + Dunn | `scipy` / `scikit-posthocs` | Shift |
| Group diffs (normal) | One-way ANOVA + Tukey HSD | `scipy` / `statsmodels` | Shift |
| Association | Chi-square of independence | `scipy.stats.chi2_contingency` | Analyst |
| Correlation (skew) | Spearman ρ | `scipy.stats.spearmanr` | Analyst |
| Distribution shape | Kolmogorov–Smirnov (vs lognormal) | `scipy.stats.kstest` | Analyst |
| Regression (continuous) | OLS / GLM | `statsmodels` | Analyst |
| Count regression | Poisson / Negative Binomial | `statsmodels` | Analyst |
| Mixed effects | LMM (shift as random) | `statsmodels` `MixedLM` | Analyst |
| Trend / seasonality | STL decomposition | `statsmodels.tsa` | Exec/Analyst |
| Forecasting | ARIMA / ETS / Prophet | `statsmodels` / `prophet` | Exec (scaling) |
| Outliers | IQR / z / Isolation Forest | `scipy` / `scikit-learn` | Analyst |
| Spatial | Kernel density / Ripley K | `scipy` / ` geopandas` | Analyst |
| Clustering | k-means on temporal features | `scikit-learn` | Analyst |

### 8.1 Plain-English interpretation with `pingouin`

`pingouin` is the Python equivalent of R's `statease` — it provides effect
sizes, assumption checks, and clean output for common statistical tests.

```python
import pingouin as pg
import pandas as pd

ev = pd.read_csv("data/IndyMo_incidents.csv")

# Independent t-test with effect size and assumption checks
result = pg.ttest(
    x=ev.loc[ev["shift"] == "Day", "dispatch_queue_seconds"],
    y=ev.loc[ev["shift"] == "Night", "dispatch_queue_seconds"],
    paired=False,
    confidence=0.95
)
print(result)
# Output: T-test, Cohen's d, CI, p-value

# One-way ANOVA with effect size (partial eta-squared)
aov = pg.anova(
    data=ev,
    dv="dispatch_queue_seconds",
    between="shift",
    detailed=True
)
print(aov)

# Pairwise comparisons with Bonferroni correction
posthoc = pg.pairwise_tukey(
    data=ev,
    dv="dispatch_queue_seconds",
    between="shift"
)
print(posthoc)

# Correlation with confidence interval
corr = pg.corr(
    x=ev["dispatch_queue_seconds"],
    y=ev["on_scene_seconds"],
    method="spearman"
)
print(corr)

# Normality test
pg.normality(data=ev, dv="dispatch_queue_seconds", group="shift")

# Homogeneity of variances
pg.homoscedasticity(data=ev, dv="dispatch_queue_seconds", group="shift")

# Effect size for t-test
pg.compute_effsize(
    x=ev.loc[ev["shift"] == "Day", "dispatch_queue_seconds"],
    y=ev.loc[ev["shift"] == "Night", "dispatch_queue_seconds"],
    eftype="cohen"
)
```

**pingouin provides:**
- Effect sizes (Cohen's d, Hedges' g, partial η²)
- Assumption checks (Shapiro-Wilk, Levene's, Brown-Forsythe)
- Confidence intervals for all tests
- Bayesian factors (optional)
- Clean pandas DataFrame output

---

## 9. Dashboards & real-time planning (Goal 3)

- **Exec/ops dashboard**: Streamlit app reading `duckdb` over the CSVs.
  Live cards: current 10s/20s compliance, calls-in-queue, volume-by-hour vs forecast.
- Use `ggsql` to express the same grammar over SQL for server-side aggregation
  (cheap, fast, no pandas round-trip).
- Real-time feed design: a `call_start_time`-streaming table; recompute
  rolling 15-min compliance; trigger alert when `answered_20s_pct` < 90% for 3 consecutive intervals.
- Keep the static Quarto weekly PDF as the auditable artifact; dashboards for the live view.

---

## 10. Scaling to weekly / monthly / quarterly / yearly (Goals 5–6)

- All time aggregations key on `call_start_time`. Build a single
  `resample("1h")` / `resample("1D")` pipeline; widen the window for M/Q/Y.
- Store processed aggregates in duckdb so M/Q/Y reports are `SELECT … GROUP BY period`.
- STL/ETS models trained on weekly data become the M/Q/Y trend baselines.
- Keep threshold constants (15s/20s/60s/80s/240s) in one config module so all
  four report types stay consistent.

---

## 11. Suggested module layout

```
python/
  ingest.py        # schema, parse, validate (pydantic)
  standards.py     # threshold constants + compliance functions
  eda.py           # plotnine charts (extend base.ipynb)
  stats.py         # test bank wrappers
  dash_app.py      # streamlit/dash
  reports/         # quarto/.qmd builders
```

---

## 12. Exploratory Data Analysis (EDA) — from `base.ipynb`

The following analyses were prototyped in `base.ipynb` using plotnine. Each maps to one
or more target audiences and feeds directly into the weekly report, the test bank, or
the dashboard.

| # | Analysis | Code snippet (plotnine) | Audience | Use in deliverable |
|---|----------|------------------------|----------|-------------------|
| 1 | **Volume by Day of Week** | `p9.ggplot(df, p9.aes(x='dow', fill='dow')) + p9.geom_bar() + p9.geom_text(p9.aes(y=p9.stage(p9.after_stat('count')), label=p9.after_stat('count')), stat='count', va='bottom') + p9.scale_fill_brewer(type='seq', palette='Blues') + p9.labs(title='Service Calls per Day') + p9.theme_minimal()` | Exec, Shift | Weekly summary slide |
| 2 | **Volume by Hour of Day** | Same as above with `x='hour'`, `scale_fill_manual(values=sns.color_palette('Blues', 24).as_hex())` | Exec, Ops | Circadian demand curve |
| 3 | **Volume by Shift** | `x='shift'`, `fill='shift'` | Shift | Shift supervisor briefing |
| 4 | **Volume by Priority** | `x='priority'`, `fill='priority'` | Ops | Resource allocation |
| 5 | **Volume by ZIP Code** | `x='ZIP'` (derived: `df['ZIP'] = df['postal_code'].str[:5]`), rotate x-labels 45° | Analyst | Spatial hotspot seed |
| 6 | **Volume by Agency** | `x='agency'`, `fill='agency'` | Exec, Ops | LAW/EMS/Fire split |
| 7 | **Interview vs Dispatch Queue by DOW** | `p9.aes(x='interview_seconds', y='dispatch_queue_seconds', color='dow') + p9.geom_point()` | Analyst | Process bottleneck ID |
| 8 | **Interview vs Dispatch Queue by Priority** | Same + `p9.geom_smooth()` | Ops, Analyst | Priority-based queueing |
| 9 | **Interview vs Dispatch Queue by Agency** | Same + `p9.geom_smooth(method='lm')` | Analyst | Agency workflow diffs |
|10| **9-1-1 Volume vs Mean Duration** | `p9.aes(x='nine_one_one_calls_received', y='nine_one_one_mean_duration') + p9.geom_point(color='#1c5789') + p9.geom_smooth()` | Ops | Capacity planning |
|11| **Non-Emergency Volume vs Mean Duration** | `x='non_emergency_calls_received', y='non_emergency_mean_duration'` | Ops | Staffing non-emergency |
|12| **Total Calls vs Overall Mean Duration** | `x='total_calls', y='call_mean_duration'` | Exec | Trend indicator |

**Implementation notes**
- All plots use the `after_stat`/`stage` pattern for bar labels (see `base.ipynb` cells 23, 24, 25, 26, 28, 29).
- Derive `dow` as ordered categorical: `['Sun','Mon','Tue','Wed','Thu','Fri','Sat']`.
- Derive `ZIP` from `postal_code` for geographic grouping.
- For phone data, `df_phone` already has `hour_of_day`; join with `df_events` on hour for cross-domain EDA.

---

## 13. Advanced Analyses — Beyond `base.ipynb`

These analyses address Goals 3–6 (dashboards, test bank, trend scaling, M/Q/Y reports) and fill gaps for each audience.

| # | Analysis | Method / Test | Python Implementation | Audience | Goal |
|---|----------|---------------|----------------------|----------|------|
| 13 | **Spatial Hotspots** | Kernel density (KDE) + Ripley's K on lat/lon | `geopandas.GeoDataFrame` + `scipy.stats.gaussian_kde` + `pointpats` | Analyst, Ops | 4, 5 |
| 14 | **Response Time by Zone** | GroupBy zone, median/IQR + Kruskal-Wallis | `ev.groupby('zone')['travel_seconds'].agg(['median','iqr'])` + `scipy.stats.kruskal` | Ops, Shift | 2, 4 |
| 15 | **Abandoned Call Rate Trend** | Hourly abandoned / received; binomial test per hour | `ph['abandon_rate'] = ph['nine_one_one_calls_abandoned']/ph['nine_one_one_calls_received']` | Exec, Ops | 1, 3 |
| 16 | **Personnel Scorecards** | Per calltaker/dispatcher: median handle time, IQR outlier flag | `ev.groupby('calltaker').agg(median_ht=('total_elapsed_seconds','median'), iqr=('total_elapsed_seconds', iqr))` | Shift, Ops | 1, 2 |
| 17 | **Shift Handoff Analysis** | Compare last hour of shift vs first hour of next shift | Filter `hour` at boundaries; `ttest_ind` or Mann-Whitney | Shift, Ops | 2, 4 |
| 18 | **Weekend vs Weekday** | `dow` in ['Sat','Sun'] vs rest; compliance rate diff | `ev['is_weekend'] = ev['dow'].isin(['Sat','Sun'])` + proportion test | Exec, Analyst | 5 |
| 19 | **Problem Nature Pareto** | Top 20 problem_nature by volume; cumulative % | `ev['problem_nature'].value_counts().head(20)` | Exec, Ops | 1, 6 |
| 20 | **Queueing Theory Metrics** | M/M/c approximation: offered load, occupancy, ASA | `offered = ph['nine_one_one_calls_received'] * ph['nine_one_one_mean_duration']/3600` | Ops, Analyst | 3, 4 |
| 21 | **Correlation Matrix** | Spearman on all time components | `ev[time_cols].corr(method='spearman')` + `sns.heatmap` | Analyst | 4 |
| 22 | **Survival: Time-to-Answer** | Kaplan-Meier on `pickup_delay_seconds` (censored at abandon) | `lifelines.KaplanMeierFitter` | Analyst, Ops | 4 |
| 23 | **Compliance Control Chart** | p-chart (Shewhart) on daily 20s-compliance | `spc.pchart` or manual UCL/LCL = p ± 3√(p(1-p)/n) | Ops | 3, 4 |
| 24 | **Process Capability** | Cp/Cpk for `dispatch_queue_seconds` vs 64s/106s | `cpk = min((USL-mean)/3σ, (mean-LSL)/3σ)` | Ops | 2, 4 |
| 25 | **Mixed-Effects Model** | LMM: `total_elapsed ~ priority + (1|shift_label) + (1|calltaker)` | `statsmodels.MixedLM` | Analyst | 4, 5 |
| 26 | **STL Decomposition** | Trend + seasonal + residual on daily totals | `statsmodels.tsa.seasonal_decompose` | Exec, Analyst | 5, 6 |
| 27 | **Forecasting Baseline** | ARIMA/ETS on weekly series; Prophet for M/Q/Y | `statsmodels.tsa.arima.ARIMA` or `prophet.Prophet` | Exec | 5, 6 |
| 28 | **Outlier Detection** | Isolation Forest on [interview, queue, travel, on_scene] | `sklearn.ensemble.IsolationForest` | Analyst, Shift | 4 |
| 29 | **Call Disposition Quality** | % UNDEFINED by shift/calltaker; chi-square | `pd.crosstab(ev['shift_label'], ev['call_disposition']=='UNDEFINED')` | Ops, Shift | 1, 2 |
| 30 | **Multi-Agency Comparison** | LAW vs EMS vs Fire: compliance, volume, handle time | `ev.groupby('agency').agg(...)` + ANOVA/Kruskal | Exec, Ops | 1, 2 |

**Code Patterns for Reuse**
```python
# Robust aggregation (skew-safe)
def robust_agg(series):
    return pd.Series({'median': series.median(), 'iqr': series.quantile(0.75)-series.quantile(0.25),
                      'p90': series.quantile(0.90), 'p95': series.quantile(0.95)})

# Compliance rate with Wilson CI
from statsmodels.stats.proportion import proportion_confint
def compliance_ci(successes, trials):
    return proportion_confint(successes, trials, method='wilson')

# Reusable control chart function
def p_chart(daily_compliance, n_per_day):
    p = daily_compliance.mean()
    ucl = p + 3*np.sqrt(p*(1-p)/n_per_day)
    lcl = max(0, p - 3*np.sqrt(p*(1-p)/n_per_day))
    return p, ucl, lcl
```

---

## 14. Open questions / next steps

- Confirm the AHJ's actual thresholds (some jurisdictions use 90% ≤ 10s busy-hour, not 15s).
- Decide whether `total_elapsed_seconds` should be split into NFPA components for capability analysis.
- Confirm dashboard refresh cadence (real-time vs 15-min batch).
- Then we start coding `ingest.py` and `standards.py` together.
