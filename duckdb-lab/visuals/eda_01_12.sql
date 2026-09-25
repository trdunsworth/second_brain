-- eda_01_12.sql — the 12-plot EDA set as ggsql queries.
-- Render with R ggsql (ggsql_execute) or a {ggsql} Quarto block.
-- Assumes ev / ph views from duckdb-lab/sql. Promoted from ggsql_notes.md §5.

-- 1. Volume by Day of Week (Exec, Shift)
SELECT dow, COUNT(*) AS n FROM ev GROUP BY dow
VISUALISE dow AS x, n AS y, dow AS fill
DRAW bar
LABEL title => 'Service Calls per Day', x => 'Day', y => 'Count';

-- 2. Volume by Hour of Day (Exec, Ops)
SELECT EXTRACT(HOUR FROM call_start_time)::INT AS hod, COUNT(*) AS n
FROM ev GROUP BY 1
VISUALISE hod AS x, n AS y
DRAW bar
LABEL title => 'Volume by Hour of Day', x => 'Hour', y => 'Calls';

-- 3. Volume by Shift (Shift briefing)
SELECT shift_label, COUNT(*) AS n FROM ev GROUP BY 1
VISUALISE shift_label AS x, n AS y, shift_label AS fill
DRAW bar
LABEL title => 'Volume by Shift';

-- 4. Volume by Priority (Ops resourcing)
SELECT priority, COUNT(*) AS n FROM ev GROUP BY 1
VISUALISE priority AS x, n AS y, priority AS fill
DRAW bar
LABEL title => 'Volume by Priority';

-- 5. Volume by ZIP (Analyst hotspot seed)
SELECT zip5, COUNT(*) AS n FROM ev GROUP BY 1 ORDER BY n DESC LIMIT 20
VISUALISE zip5 AS x, n AS y
DRAW bar
LABEL title => 'Top 20 ZIP Codes by Volume';

-- 6. Volume by Agency (Exec, Ops)
SELECT agency, COUNT(*) AS n FROM ev GROUP BY 1
VISUALISE agency AS x, n AS y, agency AS fill
DRAW bar
LABEL title => 'Volume by Agency';

-- 7. Interview vs Queue by DOW (bottleneck ID)
SELECT interview_seconds, dispatch_queue_seconds, dow FROM ev
WHERE interview_seconds IS NOT NULL AND dispatch_queue_seconds IS NOT NULL
VISUALISE interview_seconds AS x, dispatch_queue_seconds AS y, dow AS color
DRAW point
SETTING position => 'jitter'
LABEL title => 'Interview vs Dispatch Queue by Day';

-- 8. Same + trendline (Ops: priority queueing)
SELECT interview_seconds, dispatch_queue_seconds, priority FROM ev
WHERE interview_seconds IS NOT NULL AND dispatch_queue_seconds IS NOT NULL
VISUALISE interview_seconds AS x, dispatch_queue_seconds AS y, priority AS color
DRAW point
DRAW smooth
LABEL title => 'Interview vs Dispatch Queue by Priority';

-- 9. Same + fit (Analyst: agency workflows)
SELECT interview_seconds, dispatch_queue_seconds, agency FROM ev
WHERE interview_seconds IS NOT NULL AND dispatch_queue_seconds IS NOT NULL
VISUALISE interview_seconds AS x, dispatch_queue_seconds AS y, agency AS color
DRAW point
DRAW smooth
LABEL title => 'Interview vs Dispatch Queue by Agency';

-- 10. 9-1-1 Volume vs Mean Duration (capacity planning)
SELECT nine_one_one_calls_received, nine_one_one_mean_duration FROM ph
VISUALISE nine_one_one_calls_received AS x, nine_one_one_mean_duration AS y
DRAW point
DRAW smooth
LABEL title => '9-1-1 Volume vs Mean Duration';

-- 11. Non-emergency volume vs duration (staffing)
SELECT non_emergency_calls_received, non_emergency_mean_duration FROM ph
VISUALISE non_emergency_calls_received AS x, non_emergency_mean_duration AS y
DRAW point
DRAW smooth
LABEL title => 'Non-Emergency Volume vs Mean Duration';

-- 12. Total calls vs mean duration (exec trend)
SELECT total_calls, call_mean_duration FROM ph
VISUALISE total_calls AS x, call_mean_duration AS y
DRAW point
DRAW smooth
LABEL title => 'Total Calls vs Mean Duration';
