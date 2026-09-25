-- eda.sql — missingness, descriptives, categorical profile, bins, temporal rollups.
-- Requires: ev, ph views (00_preamble.sql). Promoted from duckdb_notes.md §5.
-- Missingness / completeness (data-quality KPI)
SELECT 'call_disposition' AS col,
       SUM((call_disposition IS NULL OR call_disposition IN ('', 'UNDEFINED'))::INT) AS n_bad,
       COUNT(*) AS n,
       ROUND(100.0 * SUM((call_disposition IS NULL OR call_disposition IN ('', 'UNDEFINED'))::INT) / COUNT(*), 2) AS pct_bad
FROM ev
UNION ALL
SELECT 'method_of_call_reception',
       SUM((method_of_call_reception IS NULL OR method_of_call_reception = 'NOT CAPTURED')::INT),
       COUNT(*),
       ROUND(100.0 * SUM((method_of_call_reception IS NULL OR method_of_call_reception = 'NOT CAPTURED')::INT) / COUNT(*), 2)
FROM ev;

-- Duplicates on business key
SELECT incident_id, COUNT(*) AS dup_count
FROM ev GROUP BY incident_id HAVING COUNT(*) > 1;

-- Numeric profile (mean vs median = skew signal)
SELECT COUNT(dispatch_queue_seconds) AS n_valid,
       MIN(dispatch_queue_seconds) AS min_v,
       MAX(dispatch_queue_seconds) AS max_v,
       ROUND(AVG(dispatch_queue_seconds), 2) AS mean_v,
       ROUND(MEDIAN(dispatch_queue_seconds), 2) AS median_v,
       ROUND(STDDEV(dispatch_queue_seconds), 2) AS sd_v,
       ROUND(QUANTILE(dispatch_queue_seconds, 0.25), 2) AS q25,
       ROUND(QUANTILE(dispatch_queue_seconds, 0.75), 2) AS q75,
       ROUND(QUANTILE(dispatch_queue_seconds, 0.90), 2) AS p90,
       ROUND(QUANTILE(dispatch_queue_seconds, 0.95), 2) AS p95,
       ROUND(QUANTILE(dispatch_queue_seconds, 0.99), 2) AS p99
FROM ev;

-- Categorical profile with %
SELECT call_disposition, COUNT(*) AS freq,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS pct
FROM ev GROUP BY call_disposition ORDER BY freq DESC;

-- Histogram bins for skew inspection
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

-- Circadian demand
SELECT EXTRACT(HOUR FROM hour_start)::INT AS hod,
       ROUND(AVG(nine_one_one_calls_received), 2) AS mean_calls,
       ROUND(STDDEV(nine_one_one_calls_received), 2) AS sd_calls
FROM ph GROUP BY 1 ORDER BY 1;

-- Day-of-week profile
SELECT dow, COUNT(*) AS n,
       ROUND(MEDIAN(total_elapsed_seconds), 1) AS med_elapsed
FROM ev GROUP BY dow ORDER BY MIN(EXTRACT(DOW FROM call_start_time));
