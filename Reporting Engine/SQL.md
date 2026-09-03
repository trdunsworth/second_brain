# SQL.md — Analysis & Library Specification (duckdb + ggsql)

> Status: Recommendation spec (not final code). Snippets are illustrative.
> Source data:
>   - `data/IndyMo_incidents.csv` — 1,082 incidents, 48 cols, 2026-08-10 → 2026-08-16
>   - `data/IndyMo_hourly_call_counts.csv` — 168 hourly rows (7×24)
> Companion scaffold: `base.ipynb` (pandas + plotnine + seaborn EDA).
>
> Documentation references:
>   - ggsql: https://ggsql.org/syntax/ (v0.3.0-alpha)
>   - duckdb: https://duckdb.org/docs/current/

This document specifies the **SQL** layer (duckdb for analytics, ggsql for
grammar-of-graphics over SQL), and the statistical tests/analyses I recommend
for the five target audiences. SQL is the fastest path for aggregation,
compliance checks, and dashboard queries — it runs inside the database with
no pandas round-trip. Where SQL lacks native statistical tests, we call out
to Python/R/Julia via attached extensions or application-layer code.

---

## 1. Role of SQL in the project

duckdb is the **analytics engine**: it reads CSV/Parquet directly, executes
window functions, CTEs, and aggregations at C速度, and stores processed
aggregates for M/Q/Y reports. ggsql (https://ggsql.org/) bridges the
grammar-of-graphics world with SQL — you write a `SELECT` plus `VISUALISE`
and `DRAW` clauses and get a plotnine-compatible data frame ready for
rendering. The SQL layer sits between raw data and the Python/R/Julia
reporting layers, handling all heavy aggregation before results leave
the database.

---

## 2. Library / extension stack

| Need | Package / Extension | Notes |
|------|---------------------|-------|
| OLAP engine | `duckdb>=1.4` | In-process, zero-dependency, reads CSV/Parquet directly. [Docs](https://duckdb.org/docs/current/) |
| GoG over SQL | `ggsql>=0.3` (Python/R) | Grammar-of-graphics clauses (`VISUALISE`, `DRAW`, `SCALE`, `FACET`, `LABEL`) over SQL. [Docs](https://ggsql.org/syntax/) |
| SQL client | `duckdb` Python/R/Julia bindings | `import duckdb` / `library(duckdb)` / `DuckDB.jl` |
| HTTP API (optional) | `duckdb` + `flask` / `fastapi` | Serve pre-aggregated results to dashboards. |
| Aggregate functions | Built-in: `AVG`, `MEDIAN`, `QUANTILE`, `STDDEV`, `CORR`, `COUNT`, `SUM`, `MIN`, `MAX` | [Full list](https://duckdb.org/docs/current/sql/functions/aggregates) |
| Window functions | Built-in: `ROW_NUMBER`, `RANK`, `LAG`, `LEAD`, rolling aggregates | [Docs](https://duckdb.org/docs/current/sql/functions/window_functions) |
| Date/time | `EXTRACT`, `DATE_TRUNC`, `AGE`, `strftime` | [Docs](https://duckdb.org/docs/current/sql/functions/date) |

> **ggsql clause reference** (from https://ggsql.org/syntax/):
> - `VISUALISE` — initiates plot; global mappings inherited by layers
> - `DRAW <layer-type>` — adds a layer (point, bar, line, histogram, boxplot, density, violin, smooth, tile, etc.)
> - `MAPPING` — binds data columns to aesthetics (x, y, fill, color, size, etc.)
> - `SETTING` — configures layer parameters (binwidth, position, aggregate)
> - `SCALE` — controls aesthetic scaling (continuous, discrete, binned, ordinal, identity)
> - `FACET` — creates small multiples
> - `LABEL` — adds titles, axis labels, legend labels
>
> **Aggregate functions** (in `SETTING aggregate =>`): count, sum, mean,
> median, min, max, p05–p95, sdev, var, iqr, se, geomean, harmean, rms.
>
> **Position adjustments**: stack, dodge, jitter, identity.

> **Note**: duckdb does not ship with hypothesis tests (Shapiro–Wilk,
> Kruskal–Wallis, etc.). Those live in Python/R/Julia. The SQL layer
> handles aggregation, compliance calculations, and data shaping — then
> hands results to the stats layer.

---

## 3. Data ingestion & cleaning

duckdb reads CSVs directly with `read_csv_auto` or explicit typed imports.
Use CTEs to derive columns and flag data-quality issues.

```sql
-- Load events
CREATE OR REPLACE VIEW ev AS
SELECT *,
       EXTRACT(DOW FROM call_start_time) AS dow_num,
       CASE EXTRACT(DOW FROM call_start_time)
           WHEN 0 THEN 'Sun' WHEN 1 THEN 'Mon' WHEN 2 THEN 'Tue'
           WHEN 3 THEN 'Wed' WHEN 4 THEN 'Thu' WHEN 5 THEN 'Fri'
           WHEN 6 THEN 'Sat'
       END AS dow,
       CAST(call_start_time AS DATE) AS date,
       LEFT(CAST(postal_code AS VARCHAR), 5) AS zip5
FROM read_csv_auto('data/IndyMo_incidents.csv',
                   timestampformat='%m/%d/%Y %H:%M',
                   all_varchar=false);

-- Load hourly phone counts
CREATE OR REPLACE VIEW ph AS
SELECT *,
       EXTRACT(DOW FROM hour_start) AS dow_num,
       CASE EXTRACT(DOW FROM hour_start)
           WHEN 0 THEN 'Sun' WHEN 1 THEN 'Mon' WHEN 2 THEN 'Tue'
           WHEN 3 THEN 'Wed' WHEN 4 THEN 'Thu' WHEN 5 THEN 'Fri'
           WHEN 6 THEN 'Sat'
       END AS dow
FROM read_csv_auto('data/IndyMo_hourly_call_counts.csv',
                   timestampformat='%Y-%m-%d %H:%M:%S');
```

Key data-quality flags (same patterns as §3 in PYTHON.md):
- `call_disposition` has 331 `UNDEFINED` — track as data-completeness KPI.
- `method_of_call_reception` has 18 `NOT CAPTURED`.
- `dispatch_queue_seconds` (mean 85s, median 21s) and `on_scene_seconds`
  (mean 2009s, median 1751s) are heavily right-skewed → use `median`/`IQR`.

---

## 4. Comprehensive EDA Protocol (SQL implementation)

This section implements the language-agnostic EDA protocol (§4 in PYTHON.md)
entirely in duckdb SQL. Where a test has no SQL equivalent, we note the
handoff to Python/R/Julia.

### 4.1 Data quality & completeness

```sql
-- Missing value matrix (% NULL per column)
-- duckdb: use information_schema or iterate columns manually
SELECT
    'call_disposition' AS column_name,
    SUM(CASE WHEN call_disposition IS NULL OR call_disposition = '' THEN 1 ELSE 0 END) AS null_count,
    COUNT(*) AS total,
    ROUND(100.0 * SUM(CASE WHEN call_disposition IS NULL OR call_disposition = '' THEN 1 ELSE 0 END) / COUNT(*), 2) AS pct_null
FROM ev
UNION ALL
SELECT
    'method_of_call_reception',
    SUM(CASE WHEN method_of_call_reception IS NULL OR method_of_call_reception = 'NOT CAPTURED' THEN 1 ELSE 0 END),
    COUNT(*),
    ROUND(100.0 * SUM(CASE WHEN method_of_call_reception IS NULL OR method_of_call_reception = 'NOT CAPTURED' THEN 1 ELSE 0 END) / COUNT(*), 2)
FROM ev;

-- Duplicate detection
SELECT incident_id, COUNT(*) AS dup_count
FROM ev
GROUP BY incident_id
HAVING COUNT(*) > 1;

-- Constant/near-constant columns (cardinality check)
SELECT COUNT(DISTINCT call_disposition) AS n_levels,
       COUNT(*) AS total,
       ROUND(100.0 * COUNT(DISTINCT call_disposition) / COUNT(*), 2) AS unique_pct
FROM ev;

-- Completeness KPI (all columns at once)
SELECT
    COUNT(*) AS total_rows,
    SUM(CASE WHEN call_disposition IS NOT NULL AND call_disposition != 'UNDEFINED' THEN 1 ELSE 0 END) AS disposition_complete,
    ROUND(100.0 * SUM(CASE WHEN call_disposition IS NOT NULL AND call_disposition != 'UNDEFINED' THEN 1 ELSE 0 END) / COUNT(*), 2) AS completeness_pct
FROM ev;
```

### 4.2 Univariate descriptive statistics

```sql
-- Numeric columns: full descriptive stats
SELECT
    COUNT(dispatch_queue_seconds) AS n_valid,
    MIN(dispatch_queue_seconds) AS min_val,
    MAX(dispatch_queue_seconds) AS max_val,
    ROUND(AVG(dispatch_queue_seconds), 2) AS mean_val,
    ROUND(MEDIAN(dispatch_queue_seconds), 2) AS median_val,
    ROUND(STDDEV(dispatch_queue_seconds), 2) AS std_val,
    ROUND(QUANTILE(dispatch_queue_seconds, 0.25), 2) AS q25,
    ROUND(QUANTILE(dispatch_queue_seconds, 0.75), 2) AS q75,
    ROUND(QUANTILE(dispatch_queue_seconds, 0.75) - QUANTILE(dispatch_queue_seconds, 0.25), 2) AS iqr,
    ROUND(QUANTILE(dispatch_queue_seconds, 0.05), 2) AS p05,
    ROUND(QUANTILE(dispatch_queue_seconds, 0.10), 2) AS p10,
    ROUND(QUANTILE(dispatch_queue_seconds, 0.90), 2) AS p90,
    ROUND(QUANTILE(dispatch_queue_seconds, 0.95), 2) AS p95
FROM ev
WHERE dispatch_queue_seconds IS NOT NULL;

-- Categorical columns: frequency + mode
SELECT
    call_disposition,
    COUNT(*) AS freq,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM ev), 2) AS pct
FROM ev
GROUP BY call_disposition
ORDER BY freq DESC;

-- Cardinality check for all categoricals
SELECT
    COUNT(DISTINCT shift_label) AS shift_levels,
    COUNT(DISTINCT agency) AS agency_levels,
    COUNT(DISTINCT priority) AS priority_levels,
    COUNT(DISTINCT call_disposition) AS disposition_levels
FROM ev;
```

### 4.3 Distribution shape & normality

**SQL limitation**: Shapiro–Wilk, Anderson–Darling, D'Agostino–Pearson,
Jarque–Bera, and KS tests have no native duckdb implementation.

**Handoff to Python/R/Julia**:
```sql
-- Export cleaned data for normality testing
COPY (SELECT dispatch_queue_seconds, on_scene_seconds, turnout_seconds,
             travel_seconds, total_elapsed_seconds
      FROM ev
      WHERE dispatch_queue_seconds IS NOT NULL)
TO 'data/eda_numeric_export.csv' (HEADER, DELIMITER ',');
```
Then run Shapiro–Wilk per group in Python (`scipy.stats.shapiro`) or R
(`shapiro.test`).

**What SQL can do** — histogram bins via `CASE`:
```sql
-- Histogram bins for dispatch_queue_seconds
SELECT
    CASE
        WHEN dispatch_queue_seconds < 10 THEN '0-10'
        WHEN dispatch_queue_seconds < 20 THEN '10-20'
        WHEN dispatch_queue_seconds < 40 THEN '20-40'
        WHEN dispatch_queue_seconds < 64 THEN '40-64'
        WHEN dispatch_queue_seconds < 106 THEN '64-106'
        WHEN dispatch_queue_seconds < 200 THEN '106-200'
        ELSE '200+'
    END AS bin,
    COUNT(*) AS freq
FROM ev
WHERE dispatch_queue_seconds IS NOT NULL
GROUP BY bin
ORDER BY MIN(dispatch_queue_seconds);
```

### 4.4 Outlier identification (SQL implementation)

```sql
-- IQR fence method
WITH quartiles AS (
    SELECT
        QUANTILE(dispatch_queue_seconds, 0.25) AS q1,
        QUANTILE(dispatch_queue_seconds, 0.75) AS q3
    FROM ev
    WHERE dispatch_queue_seconds IS NOT NULL
),
bounds AS (
    SELECT q1, q3,
           q3 - q1 AS iqr,
           q1 - 1.5 * (q3 - q1) AS fence_lo,
           q3 + 1.5 * (q3 - q1) AS fence_hi
    FROM quartiles
)
SELECT
    ev.*,
    CASE WHEN ev.dispatch_queue_seconds < bounds.fence_lo
          OR ev.dispatch_queue_seconds > bounds.fence_hi
         THEN 1 ELSE 0 END AS iqr_outlier_flag
FROM ev, bounds;

-- Z-score method
WITH stats AS (
    SELECT AVG(dispatch_queue_seconds) AS mu,
           STDDEV(dispatch_queue_seconds) AS sigma
    FROM ev
    WHERE dispatch_queue_seconds IS NOT NULL
)
SELECT
    ev.*,
    CASE WHEN ABS((ev.dispatch_queue_seconds - stats.mu) / stats.sigma) > 3
         THEN 1 ELSE 0 END AS zscore_outlier_flag
FROM ev, stats;

-- Percentile method (p1 / p99)
WITH percentiles AS (
    SELECT
        QUANTILE(dispatch_queue_seconds, 0.01) AS p01,
        QUANTILE(dispatch_queue_seconds, 0.99) AS p99
    FROM ev
    WHERE dispatch_queue_seconds IS NOT NULL
)
SELECT
    ev.*,
    CASE WHEN ev.dispatch_queue_seconds < percentiles.p01
          OR ev.dispatch_queue_seconds > percentiles.p99
         THEN 1 ELSE 0 END AS pct_outlier_flag
FROM ev, percentiles;

-- Modified Z-score (MAD) — requires manual MAD calculation
WITH med AS (
    SELECT MEDIAN(dispatch_queue_seconds) AS med_val
    FROM ev
    WHERE dispatch_queue_seconds IS NOT NULL
),
mad_calc AS (
    SELECT MEDIAN(ABS(dispatch_queue_seconds - med.med_val)) AS mad_val
    FROM ev, med
    WHERE dispatch_queue_seconds IS NOT NULL
)
SELECT
    ev.*,
    CASE WHEN ABS(0.6745 * (ev.dispatch_queue_seconds - med.med_val) / mad_calc.mad_val) > 3.5
         THEN 1 ELSE 0 END AS mad_outlier_flag
FROM ev, med, mad_calc;

-- Consensus outlier flag (≥2 methods)
-- Combine the above into a single view, then:
-- SELECT *, (iqr_outlier_flag + zscore_outlier_flag + pct_outlier_flag + mad_outlier_flag) AS outlier_votes
-- CASE WHEN outlier_votes >= 2 THEN 1 ELSE 0 END AS consensus_outlier
```

### 4.5 Correlation analyses

**SQL limitation**: Pearson, Spearman, Kendall, Cramér's V, distance
correlation, and partial correlation have no native duckdb implementation.

**Handoff**:
```sql
-- Export for correlation matrix
COPY (SELECT interview_seconds, dispatch_queue_seconds, travel_seconds,
             on_scene_seconds, turnout_seconds, total_elapsed_seconds
      FROM ev
      WHERE dispatch_queue_seconds IS NOT NULL)
TO 'data/eda_corr_export.csv' (HEADER, DELIMITER ',');
```
Then compute Spearman ρ in Python/R/Julia.

**What SQL can do** — rank-based Spearman approximation via window functions:
```sql
-- Spearman rho approximation (rank correlation) for two columns
WITH ranked AS (
    SELECT
        RANK() OVER (ORDER BY interview_seconds) AS r1,
        RANK() OVER (ORDER BY dispatch_queue_seconds) AS r2
    FROM ev
    WHERE interview_seconds IS NOT NULL
      AND dispatch_queue_seconds IS NOT NULL
)
SELECT
    (COUNT(*) * SUM(r1 * r2) - SUM(r1) * SUM(r2)) /
    SQRT((COUNT(*) * SUM(r1*r1) - SUM(r1)*SUM(r1)) *
         (COUNT(*) * SUM(r2*r2) - SUM(r2)*SUM(r2))) AS spearman_rho
FROM ranked;
```

### 4.6 Temporal structure

```sql
-- Hourly call volume pattern (circadian)
SELECT
    EXTRACT(HOUR FROM hour_start) AS hour_of_day,
    ROUND(AVG(nine_one_one_calls_received), 2) AS mean_calls,
    ROUND(STDDEV(nine_one_one_calls_received), 2) AS sd_calls,
    MIN(nine_one_one_calls_received) AS min_calls,
    MAX(nine_one_one_calls_received) AS max_calls
FROM ph
GROUP BY EXTRACT(HOUR FROM hour_start)
ORDER BY hour_of_day;

-- Day-of-week pattern
SELECT
    dow,
    dow_num,
    ROUND(AVG(nine_one_one_calls_received), 2) AS mean_calls,
    SUM(nine_one_one_calls_received) AS total_calls
FROM ph
GROUP BY dow, dow_num
ORDER BY dow_num;

-- Ljung-Box autocorrelation approximation (lag 1–24)
-- Requires window functions; export to Python/R for full ACF/PACF
COPY (SELECT hour_start, nine_one_one_calls_received
      FROM ph ORDER BY hour_start)
TO 'data/eda_hourly_export.csv' (HEADER, DELIMITER ',');

-- Runs test (above/below median)
WITH med AS (
    SELECT MEDIAN(nine_one_one_calls_received) AS med_val FROM ph
),
classified AS (
    SELECT
        nine_one_one_calls_received,
        CASE WHEN nine_one_one_calls_received > med.med_val THEN 1 ELSE 0 END AS above_median
    FROM ph, med
),
runs AS (
    SELECT
        above_median,
        LAG(above_median) OVER (ORDER BY (SELECT NULL)) AS prev
    FROM classified
)
SELECT
    COUNT(*) AS n_runs
FROM runs
WHERE above_median != prev OR prev IS NULL;
```

### 4.7 Bivariate visual exploration (ggsql)

ggsql enables grammar-of-graphics plotting directly from SQL queries.
The `ggsql` package wraps duckdb results into plotnine-compatible data frames.

```sql
-- Scatter + LOESS: interview vs dispatch queue
SELECT
    interview_seconds,
    dispatch_queue_seconds,
    dow
FROM ev
WHERE interview_seconds IS NOT NULL
  AND dispatch_queue_seconds IS NOT NULL
VISUALISE interview_seconds AS x, dispatch_queue_seconds AS y, dow AS color
DRAW point
DRAW smooth
LABEL TITLE 'Interview vs Dispatch Queue by Day';

-- Grouped boxplot: dispatch_queue_seconds by shift_label
SELECT shift_label, dispatch_queue_seconds
FROM ev
WHERE dispatch_queue_seconds IS NOT NULL
VISUALISE shift_label AS x, dispatch_queue_seconds AS y, shift_label AS fill
DRAW boxplot
LABEL TITLE 'Dispatch Queue Time by Shift';

-- Violin + jitter: total_elapsed_seconds by agency
SELECT agency, total_elapsed_seconds
FROM ev
WHERE total_elapsed_seconds IS NOT NULL
VISUALISE agency AS x, total_elapsed_seconds AS y, agency AS fill
DRAW violin
DRAW point
SETTING position => 'jitter'
LABEL TITLE 'Total Elapsed Time by Agency';

-- Grouped histogram: turnout_seconds by priority
SELECT priority, turnout_seconds
FROM ev
WHERE turnout_seconds IS NOT NULL
VISUALISE turnout_seconds AS x, priority AS fill
DRAW histogram
SETTING binwidth => 5, position => 'dodge'
LABEL TITLE 'Turnout Time by Priority';

-- Correlation heatmap data (export for plotting in Python/R)
SELECT
    'interview_vs_queue' AS pair,
    CORR(interview_seconds, dispatch_queue_seconds) AS pearson_r
FROM ev
WHERE interview_seconds IS NOT NULL AND dispatch_queue_seconds IS NOT NULL
UNION ALL
SELECT
    'queue_vs_travel',
    CORR(dispatch_queue_seconds, travel_seconds)
FROM ev
WHERE dispatch_queue_seconds IS NOT NULL AND travel_seconds IS NOT NULL
UNION ALL
SELECT
    'travel_vs_onscene',
    CORR(travel_seconds, on_scene_seconds)
FROM ev
WHERE travel_seconds IS NOT NULL AND on_scene_seconds IS NOT NULL;

-- Pair plot data (export for SPLOM in Python/R)
COPY (
    SELECT interview_seconds, dispatch_queue_seconds, travel_seconds,
           on_scene_seconds, total_elapsed_seconds
    FROM ev
    WHERE dispatch_queue_seconds IS NOT NULL
) TO 'data/pairplot_export.csv' (HEADER, DELIMITER ',');

-- Hexbin data: nine_one_one_calls_received vs mean_duration
SELECT
    nine_one_one_calls_received,
    nine_one_one_mean_duration
FROM ph
VISUALISE nine_one_one_calls_received AS x, nine_one_one_mean_duration AS y
DRAW point
SETTING position => 'identity'
LABEL TITLE '9-1-1 Volume vs Mean Duration';

-- Time-series line: daily compliance %
SELECT
    CAST(call_start_time AS DATE) AS day,
    AVG(nine_one_one_answered_20s_pct) AS daily_compliance
FROM ev
GROUP BY day
ORDER BY day
VISUALISE day AS x, daily_compliance AS y
DRAW line
LABEL TITLE 'Daily 20s Compliance %' X 'Date' Y 'Compliance %';

-- Compliance heatmap: dow x hour (tile)
SELECT
    dow,
    EXTRACT(HOUR FROM hour_start) AS hour_of_day,
    AVG(nine_one_one_answered_20s_pct) AS mean_compliance
FROM ph
GROUP BY dow, EXTRACT(HOUR FROM hour_start)
VISUALISE hour_of_day AS x, dow AS y, mean_compliance AS fill
DRAW tile
SCALE fill CONTINUOUS
LABEL TITLE '9-1-1 Answered <=20s (%) by Day/Hour';

-- Faceted boxplot by agency
SELECT agency, dispatch_queue_seconds
FROM ev
WHERE dispatch_queue_seconds IS NOT NULL
VISUALISE dispatch_queue_seconds AS y
DRAW boxplot
FACET agency
LABEL TITLE 'Dispatch Queue Time by Agency (Faceted)';

-- Multi-layer: bar + rule (reference at NENA 90% threshold)
SELECT
    dow,
    AVG(nine_one_one_answered_20s_pct) AS mean_compliance
FROM ph
GROUP BY dow
VISUALISE dow AS x, mean_compliance AS y, dow AS fill
DRAW bar
DRAW rule
SETTING y => 90
LABEL TITLE 'Mean 20s Compliance by Day (NENA 90% Threshold)';
```

### 4.8 Assumption validation (SQL limitation)

Most assumption tests (Levene, Breusch–Pagan, VIF, residual normality) have
no SQL implementation. Export data to Python/R/Julia for these checks.

```sql
-- Levene's test data: response times by group
SELECT shift_label, total_elapsed_seconds
FROM ev
WHERE total_elapsed_seconds IS NOT NULL;

-- VIF data: export full model matrix
COPY (SELECT priority, agency, shift_label, dispatch_queue_seconds,
             travel_seconds, total_elapsed_seconds
      FROM ev
      WHERE dispatch_queue_seconds IS NOT NULL)
TO 'data/eda_assumption_export.csv' (HEADER, DELIMITER ',');
```

### 4.9 EDA checklist (SQL implementation)

1. ✅ Load → schema validate (`read_csv_auto` with type hints)
2. ✅ Missing value matrix → completeness KPI (§4.1)
3. ✅ Duplicate scan → `GROUP BY incident_id HAVING COUNT(*) > 1`
4. ✅ Descriptive stats via `AVG`, `MEDIAN`, `STDDEV`, `QUANTILE` (§4.2)
5. ✅ Frequency tables via `GROUP BY` + `COUNT` (§4.2)
6. ✅ Histogram bins via `CASE` or ggsql `DRAW histogram` (§4.3)
7. ⚠️ Normality tests → **handoff to Python/R/Julia** (§4.3)
8. ✅ Outlier flags via IQR, Z, MAD, percentile in SQL (§4.4)
9. ⚠️ Spearman correlation → SQL rank approximation or **handoff** (§4.5)
10. ⚠️ Cramér's V → **handoff to Python/R/Julia**
11. ✅ Temporal pattern queries (§4.6)
12. ✅ Boxplot/scatter/heatmap via ggsql `VISUALISE` + `DRAW` (§4.7)
13. ⚠️ Assumption checks → **handoff to Python/R/Julia** (§4.8)
14. ✅ Document all flags, decisions, transformations in report appendix

---

## 5. Grammar-of-graphics plotting (ggsql + plotnine)

ggsql (v0.3.0-alpha) augments SQL with grammar-of-graphics clauses:
`VISUALISE`, `DRAW`, `PLACE`, `SCALE`, `FACET`, `PROJECT`, `LABEL`.
Write a `SELECT`, add `VISUALISE` + `DRAW`, and get a plotnine-compatible
data frame. This keeps aggregation in the database and plotting in Python.

**Key ggsql syntax** (from https://ggsql.org/syntax/):
```sql
-- VISUALISE initiates the plot; global mappings are inherited by layers
-- DRAW <layer-type> adds a layer (point, bar, line, histogram, boxplot, etc.)
-- MAPPING defines aesthetic bindings (x, y, fill, color, size, etc.)
-- SETTING configures layer parameters (binwidth, position, etc.)
-- SCALE controls aesthetic scaling
-- FACET creates small multiples
-- LABEL adds titles/axis labels
```

**Layer types**: point, line, path, segment, rule, area, ribbon, polygon,
text, bar, density, violin, histogram, boxplot, range, smooth, spatial, tile.

**Position adjustments**: stack, dodge, jitter, identity.

**Aggregate functions** (in `SETTING aggregate =>`): count, sum, mean,
median, min, max, p05–p95, sdev, var, iqr, se, geomean, harmean, rms.

```sql
-- Executive: circadian demand curve
SELECT hour_of_day, AVG(nine_one_one_calls_received) AS mean_calls
FROM ph
GROUP BY hour_of_day
ORDER BY hour_of_day
VISUALISE hour_of_day AS x, mean_calls AS y
DRAW line
LABEL TITLE 'Mean 9-1-1 Call Volume by Hour of Day'
      X 'Hour' Y 'Calls (mean)';

-- Operational: compliance heatmap (dow x hour)
SELECT
    dow,
    EXTRACT(HOUR FROM hour_start) AS hour_of_day,
    AVG(nine_one_one_answered_20s_pct) AS mean_compliance
FROM ph
GROUP BY dow, EXTRACT(HOUR FROM hour_start)
VISUALISE hour_of_day AS x, dow AS y, mean_compliance AS fill
DRAW tile
SCALE fill CONTINUOUS
LABEL TITLE '9-1-1 Answered <=20s (%) by Day/Hour';

-- Volume by Day of Week (bar chart with count)
SELECT dow, COUNT(*) AS n
FROM ev
GROUP BY dow, EXTRACT(DOW FROM call_start_time) AS dow_num
ORDER BY dow_num
VISUALISE dow AS x, n AS y, dow AS fill
DRAW bar
SETTING position => 'stack'
LABEL TITLE 'Service Calls per Day' X 'Day' Y 'Count';

-- Interview vs Dispatch Queue scatter (with jitter)
SELECT
    interview_seconds,
    dispatch_queue_seconds,
    dow
FROM ev
WHERE interview_seconds IS NOT NULL
  AND dispatch_queue_seconds IS NOT NULL
VISUALISE interview_seconds AS x, dispatch_queue_seconds AS y, dow AS color
DRAW point
SETTING position => 'jitter'
LABEL TITLE 'Interview vs Dispatch Queue by Day';

-- Compliance heatmap with smooth trendline
SELECT
    interview_seconds,
    dispatch_queue_seconds,
    priority
FROM ev
WHERE interview_seconds IS NOT NULL
  AND dispatch_queue_seconds IS NOT NULL
VISUALISE interview_seconds AS x, dispatch_queue_seconds AS y, priority AS color
DRAW point
DRAW smooth
LABEL TITLE 'Interview vs Dispatch Queue by Priority';

-- Boxplot of dispatch_queue_seconds by shift
SELECT shift_label, dispatch_queue_seconds
FROM ev
WHERE dispatch_queue_seconds IS NOT NULL
VISUALISE shift_label AS x, dispatch_queue_seconds AS y
DRAW boxplot
LABEL TITLE 'Dispatch Queue Time by Shift';

-- Histogram of dispatch_queue_seconds
SELECT dispatch_queue_seconds
FROM ev
WHERE dispatch_queue_seconds IS NOT NULL
VISUALISE dispatch_queue_seconds AS x
DRAW histogram
SETTING binwidth => 10
LABEL TITLE 'Distribution of Dispatch Queue Time';

-- Density plot of total_elapsed_seconds
SELECT total_elapsed_seconds
FROM ev
WHERE total_elapsed_seconds IS NOT NULL
VISUALISE total_elapsed_seconds AS x
DRAW density
LABEL TITLE 'Density of Total Elapsed Time';

-- Faceted histogram by shift_label
SELECT shift_label, dispatch_queue_seconds
FROM ev
WHERE dispatch_queue_seconds IS NOT NULL
VISUALISE dispatch_queue_seconds AS x
DRAW histogram
FACET shift_label
LABEL TITLE 'Dispatch Queue Time by Shift (Faceted)';

-- Multi-layer: scatter + smooth + rule (reference line at 64s)
SELECT
    interview_seconds,
    dispatch_queue_seconds,
    agency
FROM ev
WHERE interview_seconds IS NOT NULL
  AND dispatch_queue_seconds IS NOT NULL
VISUALISE interview_seconds AS x, dispatch_queue_seconds AS y, agency AS color
DRAW point
DRAW smooth
DRAW rule
SETTING y => 64
LABEL TITLE 'Interview vs Queue (NFPA 64s Reference)';
```

For direct plotnine without ggsql, export duckdb results to pandas:
```python
import duckdb
con = duckdb.connect()
df = con.execute("SELECT * FROM read_csv_auto('data/IndyMo_incidents.csv')").fetchdf()
# Then use plotnine as usual
```

---

## 6. Performance standards to benchmark against

| Standard | Threshold | SQL metric / column |
|----------|-----------|---------------------|
| **NENA** call answering (NENA-STA-020.1) | 90% ≤ 15s, 95% ≤ 20s | `nine_one_one_answered_15s_pct`, `..._20s_pct` |
| **APCO** PSC incident handling | 90% ≤ 20s, 75% ≤ 10s | `nine_one_one_answered_10s_pct` |
| **NFPA 1710** alarm processing | 64s (90%), 106s (95%) | `dispatch_queue_seconds` |
| **NFPA 1710** turnout (EMS / Fire) | 60s / 80s (90%) | `turnout_seconds` |
| **NFPA 1710** travel (first unit) | 240s (90%) | `travel_seconds` |
| Total response proxy | fire ≈ 5:20, EMS ≈ 5:00 | `total_elapsed_seconds` |

```sql
-- Compliance check: % answering ≤20s
SELECT
    ROUND(100.0 * SUM(CASE WHEN nine_one_one_answered_20s_pct >= 90 THEN 1 ELSE 0 END)
          / COUNT(*), 2) AS pct_hours_meeting_20s
FROM ph;

-- NFPA 1710 quantile compliance
SELECT
    ROUND(QUANTILE(turnout_seconds, 0.90), 2) AS p90_turnout,
    CASE WHEN QUANTILE(turnout_seconds, 0.90) <= 80 THEN 'PASS' ELSE 'FAIL' END AS fire_turnout_compliance,
    ROUND(QUANTILE(travel_seconds, 0.90), 2) AS p90_travel,
    CASE WHEN QUANTILE(travel_seconds, 0.90) <= 240 THEN 'PASS' ELSE 'FAIL' END AS travel_compliance
FROM ev
WHERE agency = 'FIRE';
```

---

## 7. Recommended analyses by audience

### 7.1 Executive staff (high-level trends)

```sql
-- Volume summaries
SELECT date, dow, COUNT(*) AS daily_calls
FROM ev
GROUP BY date, dow
ORDER BY date;

-- Shift-level volume
SELECT shift_label, COUNT(*) AS calls, ROUND(AVG(total_elapsed_seconds), 2) AS mean_elapsed
FROM ev
GROUP BY shift_label
ORDER BY calls DESC;

-- Agency split
SELECT agency, COUNT(*) AS calls,
       ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM ev), 2) AS pct
FROM ev
GROUP BY agency;

-- KPI scorecard (10s/15s/20s answer %)
SELECT
    ROUND(AVG(nine_one_one_answered_10s_pct), 2) AS mean_10s_pct,
    ROUND(AVG(nine_one_one_answered_15s_pct), 2) AS mean_15s_pct,
    ROUND(AVG(nine_one_one_answered_20s_pct), 2) AS mean_20s_pct
FROM ph;
```

### 7.2 Operational management (compliance & standards)

```sql
-- Compliance rate per threshold
SELECT
    ROUND(100.0 * SUM(CASE WHEN nine_one_one_answered_20s_pct >= 90 THEN 1 ELSE 0 END)
          / COUNT(*), 2) AS pct_hours_meeting_20s,
    ROUND(100.0 * SUM(CASE WHEN nine_one_one_answered_15s_pct >= 90 THEN 1 ELSE 0 END)
          / COUNT(*), 2) AS pct_hours_meeting_15s,
    ROUND(100.0 * SUM(CASE WHEN nine_one_one_answered_10s_pct >= 75 THEN 1 ELSE 0 END)
          / COUNT(*), 2) AS pct_hours_meeting_10s
FROM ph;

-- p-chart data (daily compliance for control chart)
SELECT
    CAST(call_start_time AS DATE) AS day,
    ROUND(AVG(nine_one_one_answered_20s_pct), 2) AS daily_compliance,
    COUNT(*) AS n_hours
FROM ev
GROUP BY day
ORDER BY day;

-- NFPA process capability data
SELECT
    ROUND(AVG(dispatch_queue_seconds), 2) AS mean_queue,
    ROUND(STDDEV(dispatch_queue_seconds), 2) AS sd_queue,
    ROUND(QUANTILE(dispatch_queue_seconds, 0.90), 2) AS p90_queue,
    -- Cpk calculation (USL=106, LSL=64 for dispatch)
    ROUND(LEAST((106 - AVG(dispatch_queue_seconds)) / (3 * STDDEV(dispatch_queue_seconds)),
                (AVG(dispatch_queue_seconds) - 64) / (3 * STDDEV(dispatch_queue_seconds))), 3) AS cpk
FROM ev
WHERE dispatch_queue_seconds IS NOT NULL;
```

### 7.3 Shift supervisors (shift-level)

```sql
-- Volume & duration by shift
SELECT
    shift_label,
    COUNT(*) AS calls,
    ROUND(AVG(total_elapsed_seconds), 2) AS mean_elapsed,
    ROUND(MEDIAN(total_elapsed_seconds), 2) AS median_elapsed,
    ROUND(QUANTILE(total_elapsed_seconds, 0.25), 2) AS q25,
    ROUND(QUANTILE(total_elapsed_seconds, 0.75), 2) AS q75
FROM ev
GROUP BY shift_label;

-- Personnel scorecards
SELECT
    calltaker,
    COUNT(*) AS calls,
    ROUND(MEDIAN(total_elapsed_seconds), 2) AS median_ht,
    ROUND(QUANTILE(total_elapsed_seconds, 0.75) - QUANTILE(total_elapsed_seconds, 0.25), 2) AS iqr_ht
FROM ev
WHERE calltaker IS NOT NULL
GROUP BY calltaker
ORDER BY median_ht DESC;

-- Chi-square data: shift vs arrival hour band
SELECT
    shift_label,
    CASE
        WHEN EXTRACT(HOUR FROM call_start_time) BETWEEN 6 AND 13 THEN 'Day (6-14)'
        WHEN EXTRACT(HOUR FROM call_start_time) BETWEEN 14 AND 21 THEN 'Evening (14-22)'
        ELSE 'Night (22-6)'
    END AS hour_band,
    COUNT(*) AS freq
FROM ev
GROUP BY shift_label, hour_band;
```

### 7.4 QA/QI managers (quality assurance & improvement)

```sql
-- Data completeness audit
SELECT
    shift_label,
    ROUND(100.0 * SUM(CASE WHEN call_disposition = 'UNDEFINED' THEN 1 ELSE 0 END)
          / COUNT(*), 2) AS pct_undefined,
    ROUND(100.0 * SUM(CASE WHEN method_of_call_reception = 'NOT CAPTURED' THEN 1 ELSE 0 END)
          / COUNT(*), 2) AS pct_not_captured
FROM ev
GROUP BY shift_label;

-- Error rate tracking (slow processing)
SELECT
    priority,
    agency,
    shift_label,
    COUNT(*) AS total,
    SUM(CASE WHEN dispatch_queue_seconds > 106 THEN 1 ELSE 0 END) AS slow_count,
    ROUND(100.0 * SUM(CASE WHEN dispatch_queue_seconds > 106 THEN 1 ELSE 0 END) / COUNT(*), 2) AS pct_slow
FROM ev
WHERE dispatch_queue_seconds IS NOT NULL
GROUP BY priority, agency, shift_label
ORDER BY pct_slow DESC;

-- Pareto of defect types (top 10 call_dispositions)
SELECT
    call_disposition,
    COUNT(*) AS freq,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM ev), 2) AS pct,
    ROUND(SUM(COUNT(*)) OVER (ORDER BY COUNT(*) DESC) / (SELECT COUNT(*) FROM ev) * 100, 2) AS cumulative_pct
FROM ev
GROUP BY call_disposition
ORDER BY freq DESC
LIMIT 10;

-- p-chart data for data completeness (daily UNDEFINED rate)
SELECT
    CAST(call_start_time AS DATE) AS day,
    ROUND(100.0 * SUM(CASE WHEN call_disposition = 'UNDEFINED' THEN 1 ELSE 0 END)
          / COUNT(*), 2) AS daily_undefined_pct,
    COUNT(*) AS n_records
FROM ev
GROUP BY day
ORDER BY day;

-- Quality scorecard (composite)
SELECT
    ROUND(AVG(nine_one_one_answered_20s_pct), 2) AS avg_20s_pct,
    ROUND(100.0 * SUM(CASE WHEN call_disposition != 'UNDEFINED' THEN 1 ELSE 0 END)
          / COUNT(*), 2) AS data_completeness_pct,
    ROUND(100.0 * SUM(CASE WHEN dispatch_queue_seconds <= 106 THEN 1 ELSE 0 END)
          / NULLIF(SUM(CASE WHEN dispatch_queue_seconds IS NOT NULL THEN 1 ELSE 0 END), 0), 2) AS nfpa_p90_pass_pct
FROM ev, ph
WHERE 1=1;
```

### 7.5 Analysts / researchers

```sql
-- Export full dataset for advanced analytics in Python/R/Julia
COPY (SELECT * FROM ev) TO 'data/ev_full_export.csv' (HEADER, DELIMITER ',');
COPY (SELECT * FROM ph) TO 'data/ph_full_export.csv' (HEADER, DELIMITER ',');

-- Queueing theory metrics (M/M/c approximation)
SELECT
    AVG(nine_one_one_calls_received) AS avg_calls_per_hour,
    AVG(nine_one_one_mean_duration) AS avg_handle_time_sec,
    AVG(nine_one_one_calls_received) * AVG(nine_one_one_mean_duration) / 3600 AS offered_load_erlangs
FROM ph;

-- Correlation matrix data (all *_seconds columns)
SELECT
    CORR(interview_seconds, dispatch_queue_seconds) AS r_interview_queue,
    CORR(dispatch_queue_seconds, travel_seconds) AS r_queue_travel,
    CORR(travel_seconds, on_scene_seconds) AS r_travel_onscene,
    CORR(turnout_seconds, travel_seconds) AS r_turnout_travel,
    CORR(dispatch_queue_seconds, total_elapsed_seconds) AS r_queue_total
FROM ev
WHERE dispatch_queue_seconds IS NOT NULL
  AND travel_seconds IS NOT NULL;
```

---

## 8. Statistical test bank (Goal 4)

| Analysis | Test / Method | SQL capability | Handoff to |
|----------|---------------|----------------|------------|
| Compliance vs standard | One-sample binomial test | ✅ Compliance % via `SUM/COUNT` | Python/R for binomial test p-value |
| Control of compliance | p-chart (Shewhart) | ✅ Daily compliance data | Python/R for UCL/LCL plot |
| Process capability | Cp/Cpk | ✅ Mean, stddev, quantiles | Python/R for formal capability report |
| Group diffs (skewed) | Kruskal–Wallis + Dunn | ❌ Not in SQL | Python/R/Julia |
| Group diffs (normal) | ANOVA + Tukey HSD | ❌ Not in SQL | Python/R/Julia |
| Association | Chi-square | ❌ Not in SQL | Python/R/Julia |
| Correlation (skew) | Spearman ρ | ⚠️ Rank approximation | Python/R for exact test + p-value |
| Distribution shape | KS / AIC fit | ❌ Not in SQL | Python/R/Julia |
| Regression | OLS / GLM | ❌ Not in SQL | Python/R/Julia |
| Count regression | Poisson / NB | ❌ Not in SQL | Python/R/Julia |
| Mixed effects | LMM | ❌ Not in SQL | Python/R/Julia |
| Trend / seasonality | STL decomposition | ❌ Not in SQL | Python/R/Julia |
| Forecasting | ARIMA / ETS | ❌ Not in SQL | Python/R/Julia |
| Outliers | IQR / Z / MAD | ✅ Full implementation (§4.4) | — |
| Spatial | Kernel density | ❌ Not in SQL | Python/R/Julia |
| Clustering | k-means | ❌ Not in SQL | Python/R/Julia |

**Key insight**: SQL excels at aggregation, compliance calculations, outlier
detection (univariate), and data shaping. Hypothesis tests, regression, time
series, and multivariate methods live in Python/R/Julia.

---

## 9. Dashboards & real-time planning (Goal 3)

```sql
-- Live compliance card (for Streamlit/Dash)
SELECT
    ROUND(AVG(nine_one_one_answered_20s_pct), 1) AS current_20s_pct,
    SUM(nine_one_one_calls_received) AS total_calls,
    SUM(nine_one_one_calls_abandoned) AS total_abandoned,
    ROUND(100.0 * SUM(nine_one_one_calls_abandoned) / NULLIF(SUM(nine_one_one_calls_received), 0), 1) AS abandon_rate
FROM ph
WHERE hour_start >= NOW() - INTERVAL '24 hours';

-- Rolling 15-min compliance (real-time alert)
-- Requires streaming table; duckdb supports `read_csv` with polling
SELECT
    date_trunc('minute', call_start_time) AS interval_start,
    COUNT(*) AS calls,
    ROUND(AVG(CASE WHEN time_phone_pickup - call_start_time <= INTERVAL '20 seconds' THEN 100.0 ELSE 0 END), 1) AS compliance_20s
FROM ev
WHERE call_start_time >= NOW() - INTERVAL '1 hour'
GROUP BY interval_start
ORDER BY interval_start;

-- Volume-by-hour vs forecast band (for dashboard)
SELECT
    EXTRACT(HOUR FROM hour_start) AS hour_of_day,
    ROUND(AVG(nine_one_one_calls_received), 1) AS mean_calls,
    ROUND(STDDEV(nine_one_one_calls_received), 1) AS sd_calls,
    ROUND(AVG(nine_one_one_calls_received) - 2 * STDDEV(nine_one_one_calls_received), 0) AS lower_band,
    ROUND(AVG(nine_one_one_calls_received) + 2 * STDDEV(nine_one_one_calls_received), 0) AS upper_band
FROM ph
GROUP BY EXTRACT(HOUR FROM hour_start)
ORDER BY hour_of_day;
```

---

## 10. Scaling to weekly / monthly / quarterly / yearly (Goals 5–6)

```sql
-- Weekly aggregation
SELECT
    date_trunc('week', call_start_time) AS week_start,
    COUNT(*) AS total_calls,
    ROUND(AVG(total_elapsed_seconds), 2) AS mean_elapsed,
    ROUND(MEDIAN(total_elapsed_seconds), 2) AS median_elapsed,
    ROUND(100.0 * SUM(CASE WHEN dispatch_queue_seconds <= 64 THEN 1 ELSE 0 END)
          / NULLIF(SUM(CASE WHEN dispatch_queue_seconds IS NOT NULL THEN 1 ELSE 0 END), 0), 2) AS nfpa_64s_pass_pct
FROM ev
GROUP BY week_start;

-- Monthly aggregation
SELECT
    date_trunc('month', call_start_time) AS month_start,
    COUNT(*) AS total_calls,
    ROUND(AVG(nine_one_one_answered_20s_pct), 2) AS avg_20s_pct
FROM ev, ph
WHERE 1=1
GROUP BY month_start;

-- Store aggregates in duckdb for M/Q/Y reports
CREATE TABLE IF NOT EXISTS weekly_aggregates AS
SELECT * FROM (/* weekly query above */);

-- M/Q/Y reports are then:
-- SELECT * FROM weekly_aggregates WHERE month_start BETWEEN '2026-07-01' AND '2026-09-30';
```

Centralise thresholds in a config table:
```sql
CREATE TABLE IF NOT EXISTS standards (
    standard_name VARCHAR,
    metric VARCHAR,
    threshold NUMERIC,
    unit VARCHAR
);
INSERT INTO standards VALUES
    ('NENA', 'answered_15s', 90, 'pct'),
    ('NENA', 'answered_20s', 95, 'pct'),
    ('APCO', 'answered_10s', 75, 'pct'),
    ('NFPA', 'dispatch_90pct', 64, 'sec'),
    ('NFPA', 'dispatch_95pct', 106, 'sec'),
    ('NFPA', 'turnout_fire', 80, 'sec'),
    ('NFPA', 'turnout_ems', 60, 'sec'),
    ('NFPA', 'travel', 240, 'sec');
```

---

## 11. Suggested module layout

```
sql/
  ingest.sql          -- view definitions, CSV loading, datetime parsing
  standards.sql       -- threshold constants table + compliance helpers
  eda.sql             -- descriptive stats, outlier flags, temporal queries
  compliance.sql      -- NENA/APCO/NFPA compliance calculations
  audience/           -- audience-specific query files
    exec.sql
    ops.sql
    shift.sql
    qa_qi.sql
    analyst.sql
  dashboards/         -- real-time alert queries
    live_compliance.sql
    rolling_15min.sql
  reports/            -- M/Q/Y aggregation queries
    weekly.sql
    monthly.sql
    quarterly.sql
  exports/            -- COPY statements for Python/R/Julia handoff
    eda_numeric_export.sql
    eda_corr_export.sql
    full_export.sql
```

---

## 12. Exploratory Data Analysis (EDA) — SQL queries

The following queries mirror the plotnine/ggplot2 EDA in §12 of PYTHON.md.
Each produces a data frame that feeds directly into ggsql or plotnine.

| # | Analysis | SQL query | Audience | Use in deliverable |
|---|----------|-----------|----------|-------------------|
| 1 | **Volume by Day of Week** | `SELECT dow, dow_num, COUNT(*) AS n FROM ev GROUP BY dow, dow_num ORDER BY dow_num` | Exec, Shift | Weekly summary slide |
| 2 | **Volume by Hour of Day** | `SELECT EXTRACT(HOUR FROM call_start_time) AS hour, COUNT(*) AS n FROM ev GROUP BY hour ORDER BY hour` | Exec, Ops | Circadian demand curve |
| 3 | **Volume by Shift** | `SELECT shift_label, COUNT(*) AS n FROM ev GROUP BY shift_label ORDER BY n DESC` | Shift | Shift briefing |
| 4 | **Volume by Priority** | `SELECT priority, COUNT(*) AS n FROM ev GROUP BY priority ORDER BY n DESC` | Ops | Resource allocation |
| 5 | **Volume by ZIP Code** | `SELECT zip5, COUNT(*) AS n FROM ev GROUP BY zip5 ORDER BY n DESC LIMIT 20` | Analyst | Spatial hotspot seed |
| 6 | **Volume by Agency** | `SELECT agency, COUNT(*) AS n FROM ev GROUP BY agency ORDER BY n DESC` | Exec, Ops | LAW/EMS/Fire split |
| 7 | **Interview vs Dispatch Queue by DOW** | `SELECT dow, interview_seconds, dispatch_queue_seconds FROM ev WHERE interview_seconds IS NOT NULL` | Analyst | Process bottleneck ID |
| 8 | **Interview vs Dispatch Queue by Priority** | `SELECT priority, interview_seconds, dispatch_queue_seconds FROM ev WHERE interview_seconds IS NOT NULL` | Ops, Analyst | Priority queueing |
| 9 | **Interview vs Dispatch Queue by Agency** | `SELECT agency, interview_seconds, dispatch_queue_seconds FROM ev WHERE interview_seconds IS NOT NULL` | Analyst | Agency workflow diffs |
| 10 | **9-1-1 Volume vs Mean Duration** | `SELECT nine_one_one_calls_received, nine_one_one_mean_duration FROM ph` | Ops | Capacity planning |
| 11 | **Non-Emergency Volume vs Mean Duration** | `SELECT non_emergency_calls_received, non_emergency_mean_duration FROM ph` | Ops | Non-emergency staffing |
| 12 | **Total Calls vs Overall Mean Duration** | `SELECT total_calls, call_mean_duration FROM ph` | Exec | Trend indicator |

---

## 13. Advanced Analyses — SQL + handoff

| # | Analysis | Method / Test | SQL step | Handoff to |
|---|----------|---------------|----------|------------|
| 13 | **Spatial Hotspots** | KDE + Ripley's K | Export lat/lon | Python/R/Julia |
| 14 | **Response Time by Zone** | GroupBy zone, median/IQR | ✅ SQL aggregation | Python/R for Kruskal–Wallis |
| 15 | **Abandoned Call Rate Trend** | Hourly abandoned/received | ✅ SQL | Python/R for binomial test |
| 16 | **Personnel Scorecards** | Per calltaker median, IQR | ✅ SQL | — |
| 17 | **Shift Handoff Analysis** | Last vs first hour | ✅ SQL filter | Python/R for Mann–Whitney |
| 18 | **Weekend vs Weekday** | Compliance diff | ✅ SQL | Python/R for proportion test |
| 19 | **Problem Nature Pareto** | Top 20 + cumulative % | ✅ SQL | — |
| 20 | **Queueing Theory Metrics** | M/M/c approximation | ✅ SQL | — |
| 21 | **Correlation Matrix** | Spearman on time cols | ⚠️ Rank approximation | Python/R for exact ρ + p |
| 22 | **Survival: Time-to-Answer** | Kaplan-Meier | ❌ Export | Python/R/Julia |
| 23 | **Compliance Control Chart** | p-chart | ✅ Daily compliance data | Python/R for UCL/LCL plot |
| 24 | **Process Capability** | Cp/Cpk | ✅ Mean, stddev, quantiles | Python/R for capability report |
| 25 | **Mixed-Effects Model** | LMM | ❌ Export | Python/R/Julia |
| 26 | **STL Decomposition** | Trend + seasonal | ❌ Export | Python/R/Julia |
| 27 | **Forecasting Baseline** | ARIMA/ETS | ❌ Export | Python/R/Julia |
| 28 | **Outlier Detection** | IQR + Z + MAD | ✅ Full SQL (§4.4) | — |
| 29 | **Call Disposition Quality** | % UNDEFINED by shift | ✅ SQL | — |
| 30 | **Multi-Agency Comparison** | LAW vs EMS vs Fire | ✅ SQL aggregation | Python/R for ANOVA |

**Code Patterns for Reuse (SQL)**
```sql
-- Robust aggregation (skew-safe)
CREATE OR REPLACE VIEW robust_agg AS
SELECT
    shift_label,
    MEDIAN(dispatch_queue_seconds) AS median_queue,
    QUANTILE(dispatch_queue_seconds, 0.75) - QUANTILE(dispatch_queue_seconds, 0.25) AS iqr_queue,
    QUANTILE(dispatch_queue_seconds, 0.90) AS p90_queue,
    QUANTILE(dispatch_queue_seconds, 0.95) AS p95_queue
FROM ev
WHERE dispatch_queue_seconds IS NOT NULL
GROUP BY shift_label;

-- Compliance rate with Wilson CI (data prep; CI computed in Python/R)
SELECT
    SUM(CASE WHEN nine_one_one_answered_20s_pct >= 90 THEN 1 ELSE 0 END) AS successes,
    COUNT(*) AS trials,
    ROUND(100.0 * SUM(CASE WHEN nine_one_one_answered_20s_pct >= 90 THEN 1 ELSE 0 END)
          / COUNT(*), 2) AS compliance_pct
FROM ph;

-- Reusable p-chart data
CREATE OR REPLACE VIEW p_chart_data AS
SELECT
    CAST(call_start_time AS DATE) AS day,
    ROUND(AVG(CASE WHEN nine_one_one_answered_20s_pct >= 90 THEN 1.0 ELSE 0.0 END), 4) AS p,
    COUNT(*) AS n
FROM ev
GROUP BY day;
-- UCL/LCL computed in Python/R: p ± 3*sqrt(p*(1-p)/n)
```

---

## 14. Open questions / next steps

- ggsql is v0.3.0-alpha — confirm stability before building dashboards on it.
- Decide whether duckdb `stats` extension covers skewness/kurtosis natively
  or if those stay in Python/R.
- Confirm dashboard refresh cadence (duckdb supports `read_csv` polling but
  not true streaming — consider `duckdb` + `flask` for periodic refresh).
- Assess whether to use `duckdb` Python binding directly in Streamlit or
  keep a separate SQL layer.
- Then we start coding `ingest.sql` and `standards.sql` together.
