-- 00_preamble.sql — canonical ev / ph views + schema sanity checks.
-- Demo path: builds on ev_raw / ph_raw from seed_demo.sql.
-- Real path: replace FROM ev_raw with read_csv_auto('data/incidents.csv',
--   timestampformat='%m/%d/%Y %H:%M', all_varchar=false) and same for ph_raw
--   (timestampformat='%Y-%m-%d %H:%M:%S').
CREATE OR REPLACE VIEW ev AS
SELECT *,
    interview_seconds + dispatch_queue_seconds + travel_seconds + on_scene_seconds AS total_elapsed_seconds,
    CASE EXTRACT(DOW FROM call_start_time)
        WHEN 0 THEN 'Sun' WHEN 1 THEN 'Mon' WHEN 2 THEN 'Tue'
        WHEN 3 THEN 'Wed' WHEN 4 THEN 'Thu' WHEN 5 THEN 'Fri'
        WHEN 6 THEN 'Sat'
    END AS dow,
    CAST(call_start_time AS DATE) AS date,
    EXTRACT(HOUR FROM call_start_time)::INT AS hour_of_day,
    LEFT(CAST(postal_code AS VARCHAR), 5) AS zip5
FROM ev_raw;

CREATE OR REPLACE VIEW ph AS
SELECT *,
    nine_one_one_calls_received + non_emergency_calls_received AS total_calls,
    (nine_one_one_calls_received * nine_one_one_mean_duration
     + non_emergency_calls_received * non_emergency_mean_duration)
     / NULLIF(nine_one_one_calls_received + non_emergency_calls_received, 0) AS call_mean_duration,
    CASE EXTRACT(DOW FROM hour_start)
        WHEN 0 THEN 'Sun' WHEN 1 THEN 'Mon' WHEN 2 THEN 'Tue'
        WHEN 3 THEN 'Wed' WHEN 4 THEN 'Thu' WHEN 5 THEN 'Fri'
        WHEN 6 THEN 'Sat'
    END AS dow
FROM ph_raw;

DESCRIBE ev;
SELECT COUNT(*) AS ev_rows, COUNT(*) - COUNT(incident_id) AS null_ids FROM ev;
SELECT COUNT(*) AS ph_rows FROM ph;
