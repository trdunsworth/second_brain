---
type: learning-note
topic: DuckDB for EDA, Advanced Analysis, and Time Series Forecasting
date: 2026-09-25
status: active
tags:
  - duckdb
  - sql
  - eda
  - data-analysis
  - time-series
  - learning-plan
---

# DuckDB Notes — EDA, Advanced Data Analysis & Time Series Forecasting

> Goal: get productive in DuckDB for **Exploratory Data Analysis → Advanced Analysis → Time Series Forecasting**, leaning on your SQL skills and working around SQL's statistical limits with pure-SQL approximations + a clean export handoff.
> Companion project spec: [[Reporting Engine/SQL|Reporting Engine SQL.md]] — that file is 9-1-1-project specific. This file is your general-purpose DuckDB learning system.
> Related: [[julia_notes|julia_notes]], [[ggsql_notes|ggsql_notes]], [[Time Series/Time Series Notes|Time Series Notes]], [[Time Series/time-series-forecasting-models|Forecasting Models Taxonomy]]

## How to use this note

1. Work top-to-bottom through **§2 Setup** once.
2. Then follow **§3 Learning Plan** in order — each phase has an exit checklist.
3. Copy snippets from §5–§7 into a scratch project (`duckdb-lab/`) and run them against any CSV.
4. Track progress in **§10 Tracker**.

> Mindset: DuckDB is the **aggregation engine**. It owns descriptive stats, compliance math, outlier flags, temporal rollups, and feature tables. Hypothesis tests, regression, and formal forecasting live in Python/R/Julia — DuckDB prepares their inputs with `COPY ... TO` and audits their outputs. Your SQL skill closes 80% of the gap; the handoff pattern (§6.6, §7.5) closes the rest.

---

## 1. Why DuckDB for these three areas

| Strength | What it means for you |
|----------|-----------------------|
| In-process OLAP, zero server | `read_csv_auto` / `read_parquet` straight from files. No pandas round-trip for aggregations. |
| Full window-function support | `LAG`/`LEAD`, rolling `AVG`/`MEDIAN` over frames, `RANK`, running totals — the time-series feature factory. |
| Rich aggregates | `MEDIAN`, `QUANTILE`, `STDDEV`, `CORR`, `STRING_AGG`, `HISTOGRAM` family — most EDA descriptives in one `SELECT`. |
| `COPY ... TO` handoff | One line exports any CTE to CSV/Parquet for scipy/statsmodels/R/`StateSpaceModels`. |
| Views + persistent DB | Promote ad-hoc CTEs to `VIEW`s, then to tables in a `.duckdb` file for M/Q/Y reports. |
| Honest gaps | No native Shapiro–Wilk, Kruskal–Wallis, ANOVA, GLM, ARIMA, or STL. Spearman/Kendall/Cramér's V need rank approximations or export. Plotting is not native — that's [[ggsql_notes|ggsql_notes]]. |

---

## 2. Setup (do once, ~30 min)

### 2.1 Install

```powershell
# Option A: CLI (fastest for learning SQL)
winget install DuckDB.cli

# Option B: Python binding (matches your Positron setup)
pip install "duckdb>=1.4" pandas plotnine

# Option C: R binding
# install.packages("duckdb")
```

Verify:

```sql
-- duckdb CLI or any client
SELECT version();
```

### 2.2 Project pattern (always use files, not :memory:, for real work)

```python
import duckdb
con = duckdb.connect("duckdb-lab/analytics.duckdb")  # persistent; use ":memory:" for scratch
con.execute("CREATE OR REPLACE VIEW ev AS SELECT * FROM read_csv_auto('data/incidents.csv')")
print(con.execute("SELECT COUNT(*) FROM ev").fetchall())
```

```sql
-- Standard preamble for every session (adjust paths + timestamp formats)
CREATE OR REPLACE VIEW ev AS
SELECT *,
       CAST(call_start_time AS DATE) AS date,
       EXTRACT(HOUR FROM call_start_time) AS hour_of_day
FROM read_csv_auto('data/incidents.csv',
                   timestampformat='%m/%d/%Y %H:%M',
                   all_varchar=false);
```

> Tip: commit your `.sql` files to git, not the `.duckdb` binary. The SQL rebuilds the DB deterministically.

### 2.3 Extensions worth knowing

| Extension | Use | Load |
|-----------|-----|------|
| Built-in `parquet`/`csv` | Fast IO, predicate pushdown | No install — native |
| `httpfs` | Read from S3/HTTP | `INSTALL httpfs; LOAD httpfs;` |
| `json` | Semi-structured fields | `INSTALL json; LOAD json;` |
| `spatial` | Lat/lon hotspots, `ST_*` funcs | `INSTALL spatial; LOAD spatial;` |
| `iceberg` / `delta` | Lakehouse tables | Installable (see DuckDB docs) |

---

## 3. Learning Plan

Designed for a strong SQL user. Total: **~3–5 weeks at 3–5 hrs/week**.

### Phase 0 — Dialect calibration (2–3 hrs)

**Learn:** DuckDB's `EXTRACT(DOW ...)` numbering (0=Sunday), `DATE_TRUNC`, `QUANTILE` vs `PERCENTILE_CONT`, `MEDIAN`, `CORR`, `read_csv_auto` type guessing, `COPY ... TO`, window `OVER` syntax.

- [ ] Run every snippet in §5.1–§5.2 on a familiar CSV.
- [ ] Exit check: explain why `AVG(int_col)` truncates in some DBs but not DuckDB, and when to cast explicitly anyway.

### Phase 1 — EDA Toolkit (Weeks 1–2, core focus #1)

**Learn:** missingness matrix, `describe`-equivalent query, histogram bins, IQR/Z/MAD/p01–p99 flags + consensus view, rank-correlation approximation, circadian/DOW rollups.

- [ ] Build a reusable `eda.sql` (see §5.7) you can point at any table.
- [ ] Produce: missingness table → descriptives → histogram bins → outlier-flag view → hourly/DOW summaries.
- [ ] Exit check: on a new CSV, find the worst-missing column, the most skewed numeric, and the top outlier group without leaving SQL.

See **§5 EDA Snippets**.

### Phase 2 — Advanced Analysis (Weeks 2–3, core focus #2)

**Learn:** compliance % vs thresholds, quantile-vs-spec checks, Cpk math, personnel scorecards, Pareto with cumulative window, p-chart data views, queueing offered-load, contingency tables for chi-square, and the export pattern for everything SQL can't test.

- [ ] Reproduce one compliance KPI, one Pareto, one scorecard, one control-chart dataset purely in SQL.
- [ ] Export one matrix for a Mann-Whitney / chi-square / correlation run elsewhere; document the handoff.
- [ ] Exit check: answer "what % of hours met the 20s line, and which shift/zone drove the misses?" with SQL + one chart.

See **§6 Advanced Snippets**.

### Phase 3 — Time Series in SQL (Weeks 3–5, core focus #3)

**Learn:** regular-grid generation (`range` + `LEFT JOIN` zero-fill), `DATE_TRUNC` rollups, rolling aggregates over frames, `LAG` feature columns, seasonal-naive baseline, moving-average forecast, naive backtest scaffolding, forecast-band views for dashboards.

- [ ] Build hourly → daily → weekly aggregates from event timestamps with no gaps.
- [ ] Implement seasonal-naive + trailing-mean forecasts and compare RMSE (computed in SQL or one export).
- [ ] Exit check: 7-day-ahead baseline with intervals + a backtest table, all reproducible from `.sql` files.

See **§7 Time Series Snippets**.

### Phase 4 — Capstone (ongoing)

1. **Weekly ops pack in SQL**: EDA views + compliance KPIs + 7-day baseline, rendered via Quarto or [[ggsql_notes|ggsql_notes]].
2. **Forecast bake-off prep**: DuckDB builds identical feature tables for Python/R/Julia models — compare RMSE fairly.
3. **M/Q/Y promotion**: turn weekly CTEs into persistent tables keyed on `DATE_TRUNC`.

---

## 4. Function / Extension Map

### 4.1 EDA

| Need | DuckDB construct | Notes |
|------|------------------|-------|
| IO | `read_csv_auto`, `read_parquet`, `COPY ... TO` | `timestampformat` param avoids misparsed datetimes. |
| Schema | `DESCRIBE tbl`, `PRAGMA table_info('ev')` | Run on every new file. |
| Descriptives | `COUNT`, `AVG`, `MEDIAN`, `QUANTILE(x, q)`, `STDDEV`, `MIN`, `MAX` | Missing-safe (NULLs ignored except `COUNT(*)`. |
| Modes / levels | `GROUP BY` + `COUNT(*)` + window `SUM(...) OVER ()` for % | Basis for Pareto. |
| Dates | `EXTRACT`, `DATE_TRUNC`, `DATE_PART`, `AGE`, `strftime` | DOW: 0=Sunday — wrap in a `CASE` label once. |
| Windows | `ROW_NUMBER`, `RANK`, `LAG`, `LEAD`, `AVG(...) OVER (ORDER BY t ROWS BETWEEN N PRECEDING AND CURRENT ROW)` | Rolling + lag features. |
| Dashboard feed | Views + `COPY (SELECT ...) TO 'x.parquet'` | Parquet for downstream speed. |

### 4.2 Advanced (SQL-native vs handoff)

| Need | SQL-native | Handoff to Python/R/Julia |
|------|-----------|---------------------------|
| Compliance % | ✅ `SUM(CASE WHEN ...)` / `COUNT(*)` | p-value for binomial test |
| Quantile-vs-spec | ✅ `QUANTILE(x, 0.90) <= spec` | Formal capability report |
| Cpk | ✅ arithmetic on `AVG`/`STDDEV` | — |
| Outlier flags | ✅ IQR / Z / MAD / p01–p99 (§5.4) | Isolation Forest, DBSCAN |
| Pareto | ✅ `GROUP BY` + cumulative window | — |
| Control-chart data | ✅ daily `p`, `n` view | UCL/LCL plot + rules |
| Correlation | ⚠️ `CORR` (Pearson) + rank approximation | Spearman p, Kendall, Cramér's V |
| Tests / models | ❌ | t, Mann-Whitney, Kruskal, chi-square, ANOVA, OLS/Poisson/LMM |
| Forecasting | ⚠️ baselines only (§7) | ARIMA/ETS/STL/Prophet |

---

## 5. EDA Snippets

### 5.1 Load + derive (session preamble)

```sql
CREATE OR REPLACE VIEW ev AS
SELECT *,
       CASE EXTRACT(DOW FROM call_start_time)
           WHEN 0 THEN 'Sun' WHEN 1 THEN 'Mon' WHEN 2 THEN 'Tue'
           WHEN 3 THEN 'Wed' WHEN 4 THEN 'Thu' WHEN 5 THEN 'Fri'
           WHEN 6 THEN 'Sat'
       END AS dow,
       CAST(call_start_time AS DATE) AS date,
       LEFT(CAST(postal_code AS VARCHAR), 5) AS zip5
FROM read_csv_auto('data/incidents.csv',
                   timestampformat='%m/%d/%Y %H:%M',
                   all_varchar=false);

DESCRIBE ev;  -- schema check: run on every new file
```

### 5.2 Missingness + completeness KPI

```sql
-- Per-column worst offenders (repeat pattern per column of interest)
SELECT 'call_disposition' AS col,
       SUM(CASE WHEN call_disposition IS NULL OR call_disposition IN ('', 'UNDEFINED') THEN 1 ELSE 0 END) AS n_bad,
       COUNT(*) AS n,
       ROUND(100.0 * SUM(CASE WHEN call_disposition IS NULL OR call_disposition IN ('', 'UNDEFINED') THEN 1 ELSE 0 END) / COUNT(*), 2) AS pct_bad
FROM ev
UNION ALL
SELECT 'method_of_call_reception',
       SUM(CASE WHEN method_of_call_reception IS NULL OR method_of_call_reception = 'NOT CAPTURED' THEN 1 ELSE 0 END),
       COUNT(*),
       ROUND(100.0 * SUM(CASE WHEN method_of_call_reception IS NULL OR method_of_call_reception = 'NOT CAPTURED' THEN 1 ELSE 0 END) / COUNT(*), 2)
FROM ev;

-- Duplicates
SELECT incident_id, COUNT(*) AS dup_count
FROM ev GROUP BY incident_id HAVING COUNT(*) > 1;

-- Completeness KPI (ops-friendly)
SELECT COUNT(*) AS total_rows,
       ROUND(100.0 * SUM(CASE WHEN call_disposition NOT IN ('UNDEFINED', '') AND call_disposition IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS completeness_pct
FROM ev;
```

### 5.3 Descriptives (numeric + categorical)

```sql
-- Full numeric profile in one pass
SELECT COUNT(dispatch_queue_seconds) AS n_valid,
       MIN(dispatch_queue_seconds) AS min_v,
       MAX(dispatch_queue_seconds) AS max_v,
       ROUND(AVG(dispatch_queue_seconds), 2) AS mean_v,
       ROUND(MEDIAN(dispatch_queue_seconds), 2) AS median_v,
       ROUND(STDDEV(dispatch_queue_seconds), 2) AS sd_v,
       ROUND(QUANTILE(dispatch_queue_seconds, 0.25), 2) AS q25,
       ROUND(QUANTILE(dispatch_queue_seconds, 0.75), 2) AS q75,
       ROUND(QUANTILE(dispatch_queue_seconds, 0.75) - QUANTILE(dispatch_queue_seconds, 0.25), 2) AS iqr,
       ROUND(QUANTILE(dispatch_queue_seconds, 0.90), 2) AS p90,
       ROUND(QUANTILE(dispatch_queue_seconds, 0.95), 2) AS p95,
       ROUND(QUANTILE(dispatch_queue_seconds, 0.99), 2) AS p99
FROM ev;

-- Categorical profile with % (compare mean vs median above for skew signal)
SELECT call_disposition, COUNT(*) AS freq,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS pct
FROM ev GROUP BY call_disposition ORDER BY freq DESC;
```

### 5.4 Outlier flags (all four + consensus view)

```sql
-- One reusable view: IQR + Z + MAD + p01/p99, votes, consensus flag
CREATE OR REPLACE VIEW ev_outliers AS
WITH q AS (
    SELECT QUANTILE(dispatch_queue_seconds, 0.25) AS q1,
           QUANTILE(dispatch_queue_seconds, 0.75) AS q3,
           MEDIAN(dispatch_queue_seconds) AS med,
           AVG(dispatch_queue_seconds) AS mu,
           STDDEV(dispatch_queue_seconds) AS sigma,
           QUANTILE(dispatch_queue_seconds, 0.01) AS p01,
           QUANTILE(dispatch_queue_seconds, 0.99) AS p99
    FROM ev WHERE dispatch_queue_seconds IS NOT NULL
),
mad AS (
    SELECT MEDIAN(ABS(dispatch_queue_seconds - q.med)) AS mad_v FROM ev, q
    WHERE dispatch_queue_seconds IS NOT NULL
)
SELECT ev.*,
       ((dispatch_queue_seconds < q.q1 - 1.5*(q.q3-q.q1)) OR
        (dispatch_queue_seconds > q.q3 + 1.5*(q.q3-q.q1)))::INT AS f_iqr,
       (ABS((dispatch_queue_seconds - q.mu) / NULLIF(q.sigma,0)) > 3)::INT AS f_z,
       (ABS(0.6745 * (dispatch_queue_seconds - q.med) / NULLIF(mad.mad_v,0)) > 3.5)::INT AS f_mad,
       ((dispatch_queue_seconds < q.p01) OR (dispatch_queue_seconds > q.p99))::INT AS f_p01_99
FROM ev, q, mad;

SELECT f_iqr + f_z + f_mad + f_p01_99 AS votes, COUNT(*)
FROM ev_outliers GROUP BY 1 ORDER BY 1;  -- consensus = votes >= 2
```

### 5.5 Correlation (Pearson + Spearman approximation)

```sql
-- Pearson on time components (native)
SELECT CORR(interview_seconds, dispatch_queue_seconds) AS r_interview_queue,
       CORR(dispatch_queue_seconds, travel_seconds) AS r_queue_travel,
       CORR(travel_seconds, on_scene_seconds) AS r_travel_onscene
FROM ev;

-- Spearman rho approximation via ranks (for skewed columns)
WITH ranked AS (
    SELECT RANK() OVER (ORDER BY interview_seconds) AS r1,
           RANK() OVER (ORDER BY dispatch_queue_seconds) AS r2
    FROM ev WHERE interview_seconds IS NOT NULL AND dispatch_queue_seconds IS NOT NULL
)
SELECT (COUNT(*)*SUM(r1*r2) - SUM(r1)*SUM(r2))
     / SQRT((COUNT(*)*SUM(r1*r1) - SUM(r1)*SUM(r1))
          * (COUNT(*)*SUM(r2*r2) - SUM(r2)*SUM(r2))) AS spearman_rho
FROM ranked;
```

### 5.6 Temporal structure (circadian + DOW)

```sql
-- Circadian demand from hourly table
SELECT EXTRACT(HOUR FROM hour_start)::INT AS hod,
       ROUND(AVG(nine_one_one_calls_received), 2) AS mean_calls,
       ROUND(STDDEV(nine_one_one_calls_received), 2) AS sd_calls
FROM ph GROUP BY 1 ORDER BY 1;

-- DOW profile (stable circadian? compare shapes per day in ggsql/Python)
SELECT dow, COUNT(*) AS n,
       ROUND(MEDIAN(total_elapsed_seconds), 1) AS med_elapsed
FROM ev GROUP BY dow ORDER BY MIN(EXTRACT(DOW FROM call_start_time));

-- Histogram bins for a skewed column (distribution shape in SQL)
SELECT CASE WHEN dispatch_queue_seconds < 10 THEN '0-10'
            WHEN dispatch_queue_seconds < 20 THEN '10-20'
            WHEN dispatch_queue_seconds < 40 THEN '20-40'
            WHEN dispatch_queue_seconds < 64 THEN '40-64'
            WHEN dispatch_queue_seconds < 106 THEN '64-106'
            WHEN dispatch_queue_seconds < 200 THEN '106-200'
            ELSE '200+' END AS bin,
       COUNT(*) AS freq
FROM ev WHERE dispatch_queue_seconds IS NOT NULL
GROUP BY 1 ORDER BY MIN(dispatch_queue_seconds);
```

### 5.7 Reusable EDA checklist (save as `eda.sql`)

```sql
-- eda.sql: point at any table by replacing `ev` in these 5 blocks:
DESCRIBE ev;                                            -- 1. schema
SELECT COUNT(*) AS rows,                                -- 2. dupes + nulls
       COUNT(*) - COUNT(incident_id) AS null_ids,
       (SELECT COUNT(*) FROM (SELECT incident_id FROM ev GROUP BY incident_id HAVING COUNT(*) > 1)) AS dupe_keys
FROM ev;
-- 3. descriptives (§5.3)  4. outlier votes (§5.4)  5. hod/dow rollups (§5.6)
```

---

## 6. Advanced Analysis Snippets

### 6.1 Compliance vs standard (binomial inputs)

```sql
-- % of hours meeting each answering line (p-value computed downstream)
SELECT ROUND(100.0*SUM((nine_one_one_answered_20s_pct >= 90)::INT)/COUNT(*), 2) AS pct_hours_20s,
       ROUND(100.0*SUM((nine_one_one_answered_15s_pct >= 90)::INT)/COUNT(*), 2) AS pct_hours_15s,
       ROUND(100.0*SUM((nine_one_one_answered_10s_pct >= 75)::INT)/COUNT(*), 2) AS pct_hours_10s,
       SUM((nine_one_one_answered_20s_pct >= 90)::INT) AS successes_20s,
       COUNT(*) AS trials
FROM ph;
```

### 6.2 NFPA quantile checks + Cpk

```sql
SELECT ROUND(QUANTILE(dispatch_queue_seconds, 0.90), 1) AS p90,
       (QUANTILE(dispatch_queue_seconds, 0.90) <= 64)::INT AS pass_64,
       ROUND(QUANTILE(dispatch_queue_seconds, 0.95), 1) AS p95,
       (QUANTILE(dispatch_queue_seconds, 0.95) <= 106)::INT AS pass_106,
       ROUND(LEAST((106 - AVG(dispatch_queue_seconds)) / (3*STDDEV(dispatch_queue_seconds)),
                   (AVG(dispatch_queue_seconds) - 64) / (3*STDDEV(dispatch_queue_seconds))), 3) AS cpk
FROM ev WHERE dispatch_queue_seconds IS NOT NULL;
```

### 6.3 Personnel scorecards + shift handoff prep

```sql
-- Scorecard: median handle time + IQR per call-taker
SELECT calltaker, COUNT(*) AS calls,
       ROUND(MEDIAN(total_elapsed_seconds), 1) AS median_ht,
       ROUND(QUANTILE(total_elapsed_seconds, 0.75) - QUANTILE(total_elapsed_seconds, 0.25), 1) AS iqr_ht
FROM ev WHERE calltaker IS NOT NULL AND total_elapsed_seconds IS NOT NULL
GROUP BY calltaker ORDER BY median_ht DESC;

-- Shift-handoff boundary hours (Mann-Whitney inputs downstream)
SELECT hour_of_day, shift_label, total_elapsed_seconds
FROM (SELECT *, EXTRACT(HOUR FROM call_start_time)::INT AS hour_of_day FROM ev) s
WHERE hour_of_day IN (5, 6, 7, 13, 14, 15, 21, 22, 23);
```

### 6.4 Pareto + control-chart data + queueing

```sql
-- Pareto top 10 with cumulative % (window over ordered counts)
SELECT call_disposition, freq,
       ROUND(100.0*freq / SUM(freq) OVER (), 2) AS pct,
       ROUND(100.0*SUM(freq) OVER (ORDER BY freq DESC) / SUM(freq) OVER (), 2) AS cum_pct
FROM (SELECT call_disposition, COUNT(*) AS freq FROM ev GROUP BY 1) t
ORDER BY freq DESC LIMIT 10;

-- p-chart dataset: daily compliance + n (UCL/LCL plotted downstream)
CREATE OR REPLACE VIEW p_chart_data AS
SELECT CAST(hour_start AS DATE) AS day,
       AVG((nine_one_one_answered_20s_pct >= 90)::INT)::DOUBLE AS p,
       COUNT(*) AS n
FROM ph GROUP BY 1 ORDER BY 1;

-- Queueing offered load (M/M/c input)
SELECT AVG(nine_one_one_calls_received) AS lambda_per_hr,
       AVG(nine_one_one_mean_duration) AS mean_svc_sec,
       AVG(nine_one_one_calls_received) * AVG(nine_one_one_mean_duration) / 3600 AS erlangs
FROM ph;
```

### 6.5 Contingency prep (chi-square inputs)

```sql
-- shift x disposition observed counts (test in Python/R/Julia)
SELECT shift_label, call_disposition, COUNT(*) AS observed
FROM ev GROUP BY 1, 2 ORDER BY 1, 3 DESC;
```

### 6.6 Export pattern (the handoff you will use constantly)

```sql
-- Narrow, typed exports: one file per downstream test family
COPY (SELECT dispatch_queue_seconds, on_scene_seconds, turnout_seconds,
             travel_seconds, total_elapsed_seconds, shift_label, agency, priority
      FROM ev WHERE dispatch_queue_seconds IS NOT NULL)
TO 'data/eda_numeric_export.csv' (HEADER);

COPY (SELECT hour_start, nine_one_one_calls_received FROM ph ORDER BY hour_start)
TO 'data/eda_hourly_export.csv' (HEADER);
```

```python
# Downstream: normality + correlation in Python (example, not DuckDB)
import pandas as pd
from scipy import stats
df = pd.read_csv("data/eda_numeric_export.csv")
print(stats.shapiro(df["dispatch_queue_seconds"].sample(5000, random_state=7)))
print(stats.spearmanr(df["dispatch_queue_seconds"], df["on_scene_seconds"]))
```

---

## 7. Time Series Snippets

### 7.1 Regular hourly grid (zero-filled — never skip this)

```sql
-- Event timestamps -> complete hourly series (gaps become 0, not NULL)
CREATE OR REPLACE VIEW hourly AS
WITH bounds AS (SELECT MIN(DATE_TRUNC('hour', call_start_time)) AS lo,
                       MAX(DATE_TRUNC('hour', call_start_time)) AS hi FROM ev),
grid AS (SELECT UNNEST(RANGE(lo, hi + INTERVAL 1 HOUR, INTERVAL 1 HOUR)) AS hour FROM bounds)
SELECT grid.hour, COUNT(ev.call_start_time)::INT AS ncalls
FROM grid LEFT JOIN ev ON DATE_TRUNC('hour', ev.call_start_time) = grid.hour
GROUP BY 1 ORDER BY 1;
```

### 7.2 Rollups (daily / weekly) + rolling means

```sql
SELECT DATE_TRUNC('day', hour)::DATE AS day, SUM(ncalls) AS n,
       AVG(SUM(ncalls)) OVER (ORDER BY DATE_TRUNC('day', hour)
                              ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS trailing_7d_avg
FROM hourly GROUP BY 1 ORDER BY 1;

SELECT DATE_TRUNC('week', hour) AS week, SUM(ncalls) AS n FROM hourly GROUP BY 1 ORDER BY 1;
```

### 7.3 Lag features (model-ready table)

```sql
-- Lags 1,2,3,24,168 as columns (regression/ML input downstream)
SELECT hour, ncalls,
       LAG(ncalls, 1) OVER (ORDER BY hour) AS lag1,
       LAG(ncalls, 2) OVER (ORDER BY hour) AS lag2,
       LAG(ncalls, 24) OVER (ORDER BY hour) AS lag24,
       LAG(ncalls, 168) OVER (ORDER BY hour) AS lag168,
       AVG(ncalls) OVER (ORDER BY hour ROWS BETWEEN 23 PRECEDING AND CURRENT ROW) AS roll24
FROM hourly;
```

### 7.4 Baselines: seasonal-naive + trailing mean (pure SQL)

```sql
-- 24h seasonal-naive "forecast" evaluated on the last day (backtest in SQL)
WITH f AS (
    SELECT hour, ncalls,
           LAG(ncalls, 24) OVER (ORDER BY hour) AS naive24,
           AVG(ncalls) OVER (ORDER BY hour ROWS BETWEEN 24 PRECEDING AND 1 PRECEDING) AS trail24
    FROM hourly
)
SELECT ROUND(SQRT(AVG((ncalls - naive24)^2)), 2) AS rmse_naive24,
       ROUND(SQRT(AVG((ncalls - trail24)^2)), 2) AS rmse_trail24,
       ROUND(AVG(ABS(ncalls - naive24)), 2) AS mae_naive24
FROM f WHERE hour >= (SELECT MAX(hour) - INTERVAL 24 HOUR FROM hourly);
```

### 7.5 Forecast bands for dashboards + formal-model handoff

```sql
-- Mean ± 2σ band per hour-of-day (dashboard overlay; plotted via ggsql/Python)
SELECT EXTRACT(HOUR FROM hour)::INT AS hod,
       AVG(ncalls) AS mean_n,
       STDDEV(ncalls) AS sd_n,
       AVG(ncalls) - 2*STDDEV(ncalls) AS lo,
       AVG(ncalls) + 2*STDDEV(ncalls) AS hi
FROM hourly GROUP BY 1 ORDER BY 1;

-- Formal models (ARIMA/ETS/STL) have no SQL equivalent: export and fit elsewhere
COPY (SELECT hour, ncalls FROM hourly ORDER BY hour) TO 'data/hourly_export.csv' (HEADER);
```

---

## 8. DuckDB Gotchas for Experienced SQL Users

| Habit | DuckDB reality |
|-------|---------------|
| `DOW` numbering | `EXTRACT(DOW ...)` returns **0=Sunday..6=Saturday** (Postgres-style). Wrap in a `CASE` label view once. |
| Timestamps | `read_csv_auto` guesses formats; pass `timestampformat` explicitly (`%m/%d/%Y %H:%M` vs `%Y-%m-%d %H:%M:%S`). Verify with `DESCRIBE`. |
| Integer math | DuckDB does float division for `INT/INT`, but cast explicitly in shared SQL (`100.0 * ...`) for portability. |
| NULLs | Aggregates ignore NULLs (except `COUNT(*)`); `MEDIAN`/`QUANTILE` skip them silently — audit missingness first (§5.2). |
| `QUANTILE` vs friends | `QUANTILE(x, q)` + `MEDIAN(x)` are native; other DBs use `PERCENTILE_CONT` — don't port blindly. |
| Booleans | `SUM((cond)::INT)` idiom counts truths; `FILTER (WHERE cond)` also works on aggregates. |
| Windows | Window functions go in `SELECT` only; reuse specs with a `WINDOW w AS (...)` clause. They buffer input — partition large series. |
| CSV types | `all_varchar=false` (default inference) can misread IDs/zips — force `VARCHAR` for codes, re-derive `zip5` as string. |
| Persistence | `:memory:` is scratch; named `.duckdb` files + committed `.sql` rebuilds are the M/Q/Y path. |
| Statistics ceiling | `CORR` is Pearson only; anything with a p-value (t, chi-square, ADF, Ljung-Box) is an export, not a query. |

---

## 9. Project Layout (recommended)

```
duckdb-lab/
  analytics.duckdb      # local only (gitignore); rebuilt from sql/
  sql/
    00_preamble.sql     # read_csv views + dow/date/zip5 derivations (§5.1)
    eda.sql             # §5.2–§5.6 checklist queries
    outliers.sql        # ev_outliers view (§5.4)
    standards.sql       # threshold table + compliance views (§6.1–§6.2)
    audiences.sql       # exec / ops / shift / qa-qi / analyst blocks
    timeseries.sql      # hourly grid + rollups + lags + baselines (§7)
    exports.sql         # COPY statements (§6.6, §7.5)
  data/                 # CSV/Parquet inputs + export outputs (gitignore large files)
  reports/              # Quarto .qmd that queries the .duckdb directly
```

---

## 10. Progress Tracker

- [ ] Phase 0: preamble view + `DESCRIBE` + DOW/hour derivations on a new CSV
- [ ] Phase 1: `eda.sql` runs unassisted (missingness → descriptives → bins → outlier view → hod/DOW)
- [ ] Phase 2: compliance KPI + Pareto + scorecard + p-chart view in pure SQL
- [ ] Phase 2: one export → downstream test (Mann-Whitney / chi-square / Spearman) documented
- [ ] Phase 3: gapless hourly grid + daily/weekly rollups + lag table
- [ ] Phase 3: seasonal-naive vs trailing-mean backtest table in SQL
- [ ] Capstone: weekly ops pack or M/Q/Y promotion finished

## 11. Resources (short, high-signal)

- DuckDB docs: [Aggregate functions](https://duckdb.org/docs/current/sql/functions/aggregates), [Window functions](https://duckdb.org/docs/current/sql/functions/window_functions), [CSV reading](https://duckdb.org/docs/current/data/csv/overview.html), [COPY](https://duckdb.org/docs/current/sql/statements/copy.html).
- ggsql: [Syntax reference](https://ggsql.org/syntax/) (v0.3.0-alpha), [Grammar of graphics intro](https://ggsql.org/get_started/grammar.html), [Posit alpha announcement](https://opensource.posit.co/blog/2026-04-20_ggsql_alpha_release).
- Standards (9-1-1 context): NENA-STA-020.1 (90% ≤15s, 95% ≤20s), NFPA 1710 alarm 64s/106s, turnout 60s/80s, travel 240s.
- Forecasting theory: [[Time Series/time-series-forecasting-models|Forecasting Models Taxonomy]] — DuckDB builds the tables; the models live elsewhere.

---

## 12. Open Questions

- [ ] Capstone dataset: 9-1-1 week (thin seasonality) vs a longer public series for richer lag/seasonality practice?
- [ ] Report target: Quarto doc querying `.duckdb` directly vs dashboard fed by views — which first?
- [ ] Confirm AHJ thresholds before freezing `standards.sql` (some use 90% ≤10s busy-hour).
- [ ] `spatial` extension: needed for hotspot work, or do lat/lon exports suffice?

*Created 2026-09-25. Update §10 as phases complete; promote working CTEs from snippets into `duckdb-lab/sql/`.*
