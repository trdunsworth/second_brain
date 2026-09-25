-- timeseries.sql — gapless hourly grid, rollups, lags, baselines, bands.
-- Requires: ev view. Promoted from duckdb_notes.md §7.
CREATE OR REPLACE VIEW hourly AS
WITH bounds AS (
    SELECT MIN(DATE_TRUNC('hour', call_start_time)) AS lo,
           MAX(DATE_TRUNC('hour', call_start_time)) AS hi FROM ev
),
grid AS (
    SELECT UNNEST(RANGE(lo, hi + INTERVAL 1 HOUR, INTERVAL 1 HOUR)) AS hour FROM bounds
)
SELECT grid.hour, COUNT(ev.call_start_time)::INT AS ncalls
FROM grid LEFT JOIN ev ON DATE_TRUNC('hour', ev.call_start_time) = grid.hour
GROUP BY 1 ORDER BY 1;

-- Daily totals + trailing 7-day average; weekly rollup
SELECT CAST(hour AS DATE) AS day, SUM(ncalls) AS n,
       AVG(SUM(ncalls)) OVER (ORDER BY CAST(hour AS DATE)
                              ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS trailing_7d_avg
FROM hourly GROUP BY 1 ORDER BY 1;
SELECT DATE_TRUNC('week', hour) AS week, SUM(ncalls) AS n
FROM hourly GROUP BY 1 ORDER BY 1;

-- Lag feature sample (full model table: export and regress downstream)
SELECT hour, ncalls,
       LAG(ncalls, 1) OVER (ORDER BY hour) AS lag1,
       LAG(ncalls, 24) OVER (ORDER BY hour) AS lag24,
       AVG(ncalls) OVER (ORDER BY hour ROWS BETWEEN 23 PRECEDING AND CURRENT ROW) AS roll24
FROM hourly ORDER BY hour LIMIT 30;

-- Backtest on last 24h: seasonal-naive (lag24) vs trailing-24 mean
WITH f AS (
    SELECT hour, ncalls,
           LAG(ncalls, 24) OVER (ORDER BY hour) AS naive24,
           AVG(ncalls) OVER (ORDER BY hour ROWS BETWEEN 24 PRECEDING AND 1 PRECEDING) AS trail24
    FROM hourly
)
SELECT ROUND(SQRT(AVG((ncalls - naive24) * (ncalls - naive24))), 2) AS rmse_naive24,
       ROUND(SQRT(AVG((ncalls - trail24) * (ncalls - trail24))), 2) AS rmse_trail24,
       ROUND(AVG(ABS(ncalls - naive24)), 2) AS mae_naive24
FROM f WHERE hour >= (SELECT MAX(hour) - INTERVAL 24 HOUR FROM hourly);

-- Dashboard bands: mean ± 2sd per hour-of-day
SELECT EXTRACT(HOUR FROM hour)::INT AS hod,
       AVG(ncalls) AS mean_n, STDDEV(ncalls) AS sd_n,
       AVG(ncalls) - 2 * STDDEV(ncalls) AS lo,
       AVG(ncalls) + 2 * STDDEV(ncalls) AS hi
FROM hourly GROUP BY 1 ORDER BY 1;
