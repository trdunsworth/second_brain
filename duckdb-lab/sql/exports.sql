-- exports.sql — narrow, typed handoffs to Python/R/Julia.
-- Run with CLI cwd = duckdb-lab/ so data/ resolves. Requires: ev, hourly.
-- Promoted from duckdb_notes.md §6.6 + §7.5.
COPY (SELECT dispatch_queue_seconds, on_scene_seconds, turnout_seconds,
             travel_seconds, total_elapsed_seconds, shift_label, agency, priority
      FROM ev WHERE dispatch_queue_seconds IS NOT NULL)
TO 'data/eda_numeric_export.csv' (HEADER);

COPY (SELECT hour, ncalls FROM hourly ORDER BY hour)
TO 'data/hourly_export.csv' (HEADER);

-- Full-table + contingency exports (uncomment for real runs):
-- COPY (SELECT * FROM ev) TO 'data/ev_full_export.csv' (HEADER);
-- COPY (SELECT shift_label, call_disposition, COUNT(*) AS observed
--       FROM ev GROUP BY 1, 2) TO 'data/contingency_export.csv' (HEADER);

SELECT 'exports written' AS status;
