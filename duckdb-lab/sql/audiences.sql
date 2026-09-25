-- audiences.sql — exec / ops / shift / QA-QI / analyst blocks.
-- Requires: ev, ph views. Promoted from duckdb_notes.md §6.3–§6.5.
-- Exec: daily volume + agency split + answering KPI card
SELECT date, COUNT(*) AS daily_calls FROM ev GROUP BY date ORDER BY date;
SELECT agency, COUNT(*) AS calls,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS pct
FROM ev GROUP BY agency ORDER BY calls DESC;
SELECT ROUND(AVG(nine_one_one_answered_10s_pct), 2) AS mean_10s,
       ROUND(AVG(nine_one_one_answered_15s_pct), 2) AS mean_15s,
       ROUND(AVG(nine_one_one_answered_20s_pct), 2) AS mean_20s
FROM ph;

-- Shift: robust summaries + personnel scorecards
SELECT shift_label, COUNT(*) AS calls,
       ROUND(MEDIAN(total_elapsed_seconds), 1) AS median_elapsed,
       ROUND(QUANTILE(total_elapsed_seconds, 0.75) - QUANTILE(total_elapsed_seconds, 0.25), 1) AS iqr_elapsed
FROM ev GROUP BY shift_label ORDER BY calls DESC;
SELECT calltaker, COUNT(*) AS calls,
       ROUND(MEDIAN(total_elapsed_seconds), 1) AS median_ht,
       ROUND(QUANTILE(total_elapsed_seconds, 0.75) - QUANTILE(total_elapsed_seconds, 0.25), 1) AS iqr_ht
FROM ev WHERE calltaker IS NOT NULL AND total_elapsed_seconds IS NOT NULL
GROUP BY calltaker ORDER BY median_ht DESC;

-- QA/QI: completeness by shift + Pareto of dispositions
SELECT shift_label,
       ROUND(100.0 * SUM((call_disposition = 'UNDEFINED')::INT) / COUNT(*), 2) AS pct_undefined,
       ROUND(100.0 * SUM((method_of_call_reception = 'NOT CAPTURED')::INT) / COUNT(*), 2) AS pct_not_captured
FROM ev GROUP BY shift_label;
SELECT call_disposition, COUNT(*) AS freq,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS pct,
       ROUND(100.0 * SUM(COUNT(*)) OVER (ORDER BY COUNT(*) DESC) / SUM(COUNT(*)) OVER (), 2) AS cum_pct
FROM ev GROUP BY 1 ORDER BY freq DESC LIMIT 10;

-- Analyst: Pearson correlations + queueing load + chi-square contingency prep
SELECT CORR(interview_seconds, dispatch_queue_seconds) AS r_interview_queue,
       CORR(dispatch_queue_seconds, travel_seconds) AS r_queue_travel,
       CORR(travel_seconds, on_scene_seconds) AS r_travel_onscene
FROM ev;
SELECT AVG(nine_one_one_calls_received) AS lambda_per_hr,
       AVG(nine_one_one_mean_duration) AS mean_svc_sec,
       AVG(nine_one_one_calls_received) * AVG(nine_one_one_mean_duration) / 3600 AS erlangs
FROM ph;
SELECT shift_label, call_disposition, COUNT(*) AS observed
FROM ev GROUP BY 1, 2 ORDER BY 1, 3 DESC;
