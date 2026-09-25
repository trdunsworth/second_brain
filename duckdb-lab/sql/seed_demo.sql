-- seed_demo.sql — synthetic ev_raw / ph_raw for offline smoke tests.
-- Run first: duckdb :memory: < sql/seed_demo.sql
-- Real use: skip this file; point 00_preamble.sql at read_csv_auto() instead.
CREATE OR REPLACE TABLE ev_raw AS
SELECT
    i AS incident_id,
    TIMESTAMP '2026-08-10 00:00:00' + (i * INTERVAL 7 MINUTE) AS call_start_time,
    '4620' || ((i % 5) + 1)::VARCHAR AS postal_code,
    CASE WHEN i % 3 = 0 THEN 'Day' WHEN i % 3 = 1 THEN 'Evening' ELSE 'Night' END AS shift_label,
    (['LAW', 'EMS', 'FIRE'])[(i % 3) + 1] AS agency,
    (['P1', 'P2', 'P3', 'P4'])[(i % 4) + 1] AS priority,
    CASE WHEN i % 4 = 0 THEN 'UNDEFINED' WHEN i % 4 = 1 THEN 'CLOSED' ELSE 'ASSIST' END AS call_disposition,
    CASE WHEN i % 50 = 0 THEN 'NOT CAPTURED' ELSE '911 TRUNK' END AS method_of_call_reception,
    'OP-' || ((i % 12) + 1)::VARCHAR AS calltaker,
    30 + random() * 150 AS interview_seconds,
    20 + random() * 160 AS dispatch_queue_seconds,
    60 + random() * 300 AS travel_seconds,
    1200 + random() * 1600 AS on_scene_seconds,
    30 + random() * 90 AS turnout_seconds
FROM range(500) AS t(i);

CREATE OR REPLACE TABLE ph_raw AS
SELECT
    TIMESTAMP '2026-08-10 00:00:00' + (h * INTERVAL 1 HOUR) AS hour_start,
    (4 + (random() * 10))::INT AS nine_one_one_calls_received,
    (random() * 2)::INT AS nine_one_one_calls_abandoned,
    90 + random() * 60 AS nine_one_one_mean_duration,
    70 + random() * 25 AS nine_one_one_answered_10s_pct,
    85 + random() * 12 AS nine_one_one_answered_15s_pct,
    88 + random() * 10 AS nine_one_one_answered_20s_pct,
    (2 + random() * 6)::INT AS non_emergency_calls_received,
    60 + random() * 40 AS non_emergency_mean_duration
FROM range(168) AS t(h);

SELECT 'seed rows' AS check, (SELECT COUNT(*) FROM ev_raw) AS ev_n, (SELECT COUNT(*) FROM ph_raw) AS ph_n;
