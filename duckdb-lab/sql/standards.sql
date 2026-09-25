-- standards.sql — threshold table + compliance / NFPA / Cpk views.
-- Requires: ev, ph views. Promoted from duckdb_notes.md §6.1–§6.2.
CREATE OR REPLACE TABLE standards (
    standard_name VARCHAR, metric VARCHAR, threshold DOUBLE, unit VARCHAR
);
DELETE FROM standards;
INSERT INTO standards VALUES
    ('NENA', 'answered_15s', 90, 'pct'),
    ('NENA', 'answered_20s', 95, 'pct'),
    ('APCO', 'answered_10s', 75, 'pct'),
    ('NFPA', 'dispatch_90pct', 64, 'sec'),
    ('NFPA', 'dispatch_95pct', 106, 'sec'),
    ('NFPA', 'turnout_fire', 80, 'sec'),
    ('NFPA', 'turnout_ems', 60, 'sec'),
    ('NFPA', 'travel', 240, 'sec');

-- Answering-line compliance (binomial-test inputs: successes + trials)
SELECT ROUND(100.0 * SUM((nine_one_one_answered_20s_pct >= 90)::INT) / COUNT(*), 2) AS pct_hours_20s,
       ROUND(100.0 * SUM((nine_one_one_answered_15s_pct >= 90)::INT) / COUNT(*), 2) AS pct_hours_15s,
       ROUND(100.0 * SUM((nine_one_one_answered_10s_pct >= 75)::INT) / COUNT(*), 2) AS pct_hours_10s,
       SUM((nine_one_one_answered_20s_pct >= 90)::INT) AS successes_20s,
       COUNT(*) AS trials
FROM ph;

-- NFPA quantile checks + process capability (Cpk vs 64/106s)
SELECT ROUND(QUANTILE(dispatch_queue_seconds, 0.90), 1) AS p90,
       (QUANTILE(dispatch_queue_seconds, 0.90) <= 64)::INT AS pass_64,
       ROUND(QUANTILE(dispatch_queue_seconds, 0.95), 1) AS p95,
       (QUANTILE(dispatch_queue_seconds, 0.95) <= 106)::INT AS pass_106,
       ROUND(LEAST((106 - AVG(dispatch_queue_seconds)) / (3 * STDDEV(dispatch_queue_seconds)),
                   (AVG(dispatch_queue_seconds) - 64) / (3 * STDDEV(dispatch_queue_seconds))), 3) AS cpk
FROM ev WHERE dispatch_queue_seconds IS NOT NULL;

-- p-chart dataset (UCL/LCL plotted downstream in Python/R)
CREATE OR REPLACE VIEW p_chart_data AS
SELECT CAST(hour_start AS DATE) AS day,
       AVG((nine_one_one_answered_20s_pct >= 90)::INT)::DOUBLE AS p,
       COUNT(*) AS n
FROM ph GROUP BY 1 ORDER BY 1;

SELECT * FROM p_chart_data;
