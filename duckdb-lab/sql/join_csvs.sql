-- join_csvs.sql — combine two CSVs into one trustworthy dataset.
-- Companion to join_two_csvs.md. Run with CLI cwd = duckdb-lab/.
-- Demo inputs: data/demo_calls.csv (12 rows) + data/demo_units.csv (7 rows).
--
-- Expected findings on the demo data (this is the lesson, not a bug):
--   raw key join ................ 14 rows, SUM(queue) 855, 3 NULL agency
--   normalized, no dedup ........ 18 rows, SUM(queue) 1087, 1 NULL agency  <- FAN-OUT
--   normalized + dedup .......... 12 rows, SUM(queue) 733, 1 orphan       <- CORRECT

-- ---------------------------------------------------------------------------
-- Step 1 — pin the schema. Never join on auto-inferred IDs.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW calls AS
SELECT *,
       lpad(trim(unit_id), 2, '0') AS unit_key
FROM read_csv('data/demo_calls.csv', header = true,
    columns = {
        'incident_id':            'INTEGER',
        'call_start_time':        'TIMESTAMP',
        'unit_id':                'VARCHAR',   -- text: preserves 07
        'postal_code':            'VARCHAR',   -- text: preserves 01234
        'priority':               'VARCHAR',
        'dispatch_queue_seconds': 'DOUBLE'
    });

CREATE OR REPLACE VIEW units_raw AS
SELECT *,
       lpad(trim(unit_id), 2, '0') AS unit_key
FROM read_csv('data/demo_units.csv', header = true,
    columns = {
        'unit_id':      'VARCHAR',
        'agency':       'VARCHAR',
        'unit_type':    'VARCHAR',
        'home_station': 'VARCHAR'
    });

-- ---------------------------------------------------------------------------
-- Step 2 — profile before you trust. SUMMARIZE = type, min/max, distinct, % null.
-- ---------------------------------------------------------------------------
SUMMARIZE SELECT * FROM units_raw;

-- ---------------------------------------------------------------------------
-- Step 3 — prove the lookup side is unique. Rows here = fan-out ahead.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW dim_dupes AS
SELECT unit_key, COUNT(*) AS n
FROM units_raw
GROUP BY 1
HAVING COUNT(*) > 1;

-- ---------------------------------------------------------------------------
-- Step 4/5 — deduplicate deterministically, then LEFT JOIN (fact side wins).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW dim AS
SELECT *
FROM units_raw
QUALIFY ROW_NUMBER() OVER (PARTITION BY unit_key ORDER BY home_station, unit_id) = 1;

CREATE OR REPLACE VIEW combined AS
SELECT
    c.incident_id,
    c.call_start_time,
    c.unit_key,
    c.postal_code,
    c.priority,
    c.dispatch_queue_seconds,
    COALESCE(u.agency, 'UNKNOWN')       AS agency,
    COALESCE(u.unit_type, 'UNKNOWN')    AS unit_type,
    COALESCE(u.home_station, 'UNKNOWN') AS home_station,
    (u.agency IS NULL)::INT             AS is_orphan
FROM calls c
LEFT JOIN dim u USING (unit_key);

-- ---------------------------------------------------------------------------
-- Step 6/7/8 — the audit that makes the result defensible.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW join_audit AS
SELECT
    (SELECT COUNT(*) FROM calls)                        AS calls_rows,
    (SELECT COUNT(*) FROM combined)                     AS combined_rows,
    (SELECT COUNT(DISTINCT incident_id) FROM combined)  AS combined_distinct_ids,
    (SELECT SUM(dispatch_queue_seconds) FROM calls)     AS calls_sum_queue,
    (SELECT SUM(dispatch_queue_seconds) FROM combined)  AS combined_sum_queue,
    (SELECT COUNT(*) FROM combined WHERE is_orphan = 1) AS orphan_rows,
    (SELECT COUNT(*) FROM dim_dupes)                    AS dup_keys_before_dedup;

SELECT * FROM join_audit;

-- Orphans, named (the demo's unit 99).
SELECT * FROM combined WHERE is_orphan = 1;

-- ---------------------------------------------------------------------------
-- Step 9 — persist. Parquet for machines, CSV for humans.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE TABLE combined_snapshot AS
SELECT * FROM combined ORDER BY incident_id;

COPY (SELECT * FROM combined_snapshot)
TO 'data/combined.parquet' (FORMAT parquet, COMPRESSION zstd);

-- ---------------------------------------------------------------------------
-- Hard assertions: fail the lab run if the join ever regresses.
-- ---------------------------------------------------------------------------
SELECT CASE WHEN (SELECT COUNT(*) FROM combined) = (SELECT COUNT(*) FROM calls)
            THEN 'grain OK'
            ELSE error('JOIN FAN-OUT: combined row count != calls row count')
       END AS check_grain;

SELECT CASE WHEN (SELECT combined_sum_queue FROM join_audit)
               = (SELECT calls_sum_queue FROM join_audit)
            THEN 'measures OK'
            ELSE error('MEASURE DRIFT: SUM changed across the join')
       END AS check_measures;

SELECT CASE WHEN (SELECT dup_keys_before_dedup FROM join_audit) > 0
             AND (SELECT COUNT(*) FROM (SELECT unit_key FROM dim GROUP BY 1 HAVING COUNT(*) > 1)) = 0
            THEN 'dedup OK (raw defects detected and resolved)'
            ELSE error('DEDUP FAILED')
       END AS check_dedup;

-- Orphan policy (duckdb_notes.md §12): keep the row, label UNKNOWN, flag it.
SELECT CASE
         WHEN (SELECT COUNT(*) FROM combined
               WHERE agency IS NULL OR unit_type IS NULL OR home_station IS NULL) = 0
         THEN 'orphan labelling OK'
         ELSE error('ORPHAN POLICY: dimension columns contain NULLs, not UNKNOWN')
       END AS check_orphan_labels;

SELECT CASE
         WHEN (SELECT COUNT(*) FROM combined WHERE is_orphan = 1)
            = (SELECT COUNT(*) FROM calls c ANTI JOIN dim u USING (unit_key))
         THEN 'orphan count OK'
         ELSE error('ORPHAN FLAG: is_orphan disagrees with the ANTI JOIN count')
       END AS check_orphan_flag;

SELECT 'join_csvs complete' AS status;
