---
type: learning-note
topic: Combining two CSVs into one dataset in DuckDB — joins done correctly
date: 2026-10-23
status: active
tags:
  - duckdb
  - sql
  - csv
  - joins
  - data-quality
  - etl
---

# Combining Two CSVs in DuckDB — The Correct Way

> Goal: take **two CSV files** and produce **one trustworthy dataset**, without silently duplicating rows or dropping records.
> Related: [[duckdb_notes|duckdb_notes]] (general DuckDB system), [[ggsql_notes|ggsql_notes]] (plotting the result)
> Runnable version of everything here: `sql/join_csvs.sql` · demo inputs: `data/demo_calls.csv`, `data/demo_units.csv`

## Why this note exists

The syntax for a join is one line. Almost every real join bug is not syntax — it is one of four silent failures:

1. **Fan-out** — the "dimension" file has duplicate keys, so each matching fact row is multiplied. Row counts and `SUM()`s quietly inflate.
2. **Key mismatch** — `07` vs `7` vs `07 ` insert no error; they just produce NULLs.
3. **Type drift** — zip `01234` reads as integer `1234`; dates get guessed as strings; `N/A` becomes a type conflict.
4. **Lost rows** — an `INNER JOIN` drops orphans without telling you.

DuckDB will do exactly what you ask and report success. The discipline below is what makes the result correct. Run the checklist every time; it takes about five minutes and saves re-doing an analysis.

## 0. The 10-line version (start here)

Replace the paths, column names and key; keep the structure.

```sql
CREATE OR REPLACE VIEW a AS
SELECT *, lpad(trim(id), 4, '0') AS key FROM read_csv('data/file_a.csv', header = true,
    columns = {'id':'VARCHAR','ts':'TIMESTAMP','measure':'DOUBLE'});

CREATE OR REPLACE VIEW b AS
SELECT *, lpad(trim(id), 4, '0') AS key FROM read_csv('data/file_b.csv', header = true,
    columns = {'id':'VARCHAR','category':'VARCHAR'});

-- Prove b is one row per key. Any rows here = fan-out ahead.
SELECT key, COUNT(*) FROM b GROUP BY 1 HAVING COUNT(*) > 1;

CREATE OR REPLACE VIEW combined AS
SELECT a.*,
       COALESCE(b.category, 'UNKNOWN') AS category,          -- house policy: never drop orphans
       (b.category IS NULL)::INT       AS is_orphan          -- flag is evaluated pre-COALESCE
FROM a LEFT JOIN (
    -- one row per key; put a real tiebreaker column in the ORDER BY
    SELECT * FROM b QUALIFY ROW_NUMBER() OVER (PARTITION BY key ORDER BY key) = 1
) b USING (key);
```

Then run the three-number check: rows before, rows after, `SUM(measure)` before vs after. If any differ, stop — §3 tells you which of the four failures you have.

---

## 1. Decide what "combined" means

Two different operations get called "combine". Pick deliberately:

| You want | Operation | Shape | Signature |
|----------|-----------|-------|-----------|
| Add **columns** from a reference file (lookup) | `JOIN` | 12 rows → 12 rows | key present in both files |
| Add **rows** from a second extract (append) | `UNION ALL BY NAME` | 12 + 9 → 21 rows | same/similar columns |
| Both at once | stack, then join | — | do in that order |

```sql
-- Widen: attach unit attributes to each call
SELECT c.*, u.agency, u.unit_type
FROM calls c LEFT JOIN dim u USING (unit_key);

-- Stack: same schema, later period appended
SELECT * FROM jan_calls
UNION ALL BY NAME
SELECT * FROM feb_calls;
```

`UNION ALL BY NAME` (not plain `UNION ALL`) matches columns by **name** and fills absent columns with NULL — it survives column-order differences and extra columns. Use `UNION ALL`, never `UNION`, unless you genuinely want de-duplication (which costs a sort and hides duplicate-row problems).

The rest of this note is the join case, which is where things go wrong.

---

## 2. The checklist

Run top to bottom. Each step has its query in §3, applied end-to-end in §4.

| # | Step | Question it answers | Fail signal |
|---|------|--------------------|-------------|
| 1 | **Pin the schema** | Did the CSVs parse as the types I think? | `unit_id` is `BIGINT`, date is `VARCHAR` |
| 2 | **Profile both files** | What are the candidate keys, and are they clean? | key has 40% NULLs or 500 distinct values in 500 rows |
| 3 | **Prove the lookup key is unique** | Will this join fan out? | any key with `COUNT(*) > 1` |
| 4 | **Normalize both keys identically** | Do the same entities actually match? | match rate suddenly jumps from 60% → 99% |
| 5 | **Choose the join type on purpose** | Do I want to keep unmatched facts? | unexplained row-count change |
| 6 | **Assert the grain** | Is one output row still one call? | output rows ≠ input rows |
| 7 | **Reconcile measures** | Did the numbers survive? | `SUM()` grew |
| 8 | **Audit orphans** | What fell through, and is that acceptable? | silent NULLs in a mandatory column |
| 9 | **Persist + document** | What is the reproducible artifact? | a `:memory:` result nobody can re-run |

> Rule of thumb: **validate the many-side and the one-side separately.** Step 3 (is the lookup unique?) is the one people skip, and it is the one that causes fan-out.

---

## 3. Step details

### 3.1 Step 1 — Pin the schema

`read_csv_auto` guesses. Guessing is fine for exploration and wrong for a dataset you will build on. State the schema:

```sql
CREATE OR REPLACE VIEW calls AS
SELECT *
FROM read_csv(
    'data/demo_calls.csv',
    header = true,
    columns = {
        'incident_id':            'INTEGER',
        'call_start_time':        'TIMESTAMP',
        'unit_id':                'VARCHAR',   -- keep IDs as text: preserves 07
        'postal_code':            'VARCHAR',   -- keep zips as text: preserves 01234
        'priority':               'VARCHAR',
        'dispatch_queue_seconds': 'DOUBLE'
    }
);
```

Three type rules that prevent most CSV pain:

| Column kind | Declare as | Why |
|-------------|-----------|-----|
| Identifiers, zips, phone, case numbers | `VARCHAR` | `01234` → `1234` loses the leading zero and the join. |
| Money / measurements | `DOUBLE` or `DECIMAL(p,s)` | `DECIMAL` if exact cents matter. |
| Dates/times | `TIMESTAMP` / `DATE` | If the file is non-ISO, add `timestampformat='%m/%d/%Y %H:%M'`. |

Also worth knowing:

```sql
-- Ragged/messy files: don't fail on a bad row, collect the rejects instead
SELECT * FROM read_csv('data/messy.csv', header = true, ignore_errors = true);
-- Then check what was skipped:
SELECT * FROM read_csv('data/messy.csv', header = true, ignore_errors = true)
WHERE incident_id IS NULL;

-- Missing values in disguise: treat these tokens as NULL
read_csv('data/x.csv', nullstr = ['', 'NA', 'N/A', 'NULL', 'NOT CAPTURED'])
```

### 3.2 Step 2 — Profile both files

`SUMMARIZE` gives type, min/max, approximate distinct count, and **null percentage** per column in one statement — the fastest way to spot a key candidate and a broken column:

```sql
SUMMARIZE SELECT * FROM calls;
SUMMARIZE SELECT * FROM units_raw;
```

Row counts and key candidates:

```sql
SELECT 'calls' AS file, COUNT(*) AS rows FROM calls
UNION ALL
SELECT 'units', COUNT(*) FROM units_raw;
```

### 3.3 Step 3 — Prove the lookup key is unique (the fan-out guard)

Before joining, prove the **dimension** side is one row per key. If it is not, every fact row matching a duplicated key is duplicated. (View names below match the worked example in §4.)

```sql
-- Any row returned = this join will fan out. Fix the dimension first.
-- Check the NORMALIZED key, not the raw column: `7` and `" 07 "` are
-- different raw strings that become the same key after step 4.
SELECT unit_key, COUNT(*) AS n
FROM units_raw
GROUP BY unit_key
HAVING COUNT(*) > 1
ORDER BY n DESC;
```

On the demo data this returns `07 → 2` and `12 → 2`: two keys carry duplicates, so the normalized join inflates 12 calls to **18 rows** and `SUM(dispatch_queue_seconds)` from **733 to 1087**.

Also confirm the key is declared where you expect:

```sql
-- Cardinality of each side
SELECT COUNT(*) AS rows, COUNT(DISTINCT unit_key) AS distinct_keys FROM units_raw;
```

`rows = distinct_keys` (and no NULLs in the key) means the dimension is safe.

### 3.4 Step 4 — Normalize both keys identically

Most "the join returned NULLs" bugs are cosmetic differences. Normalize with the **same expression on both sides**, once, into a named key column:

```sql
-- Text key: trim + zero-pad to a fixed width
lpad(trim(unit_id), 2, '0') AS unit_key

-- Text key: case/whitespace-insensitive
lower(trim(agency_name)) AS agency_key

-- Numeric-looking ID stored as text
TRY_CAST(trim(unit_id) AS INTEGER) AS unit_key

-- Date key across different formats
CAST(TRY_STRPTIME(date_txt, '%m/%d/%Y') AS DATE) AS date_key

-- Zip: keep 5 characters, never as a number
lpad(trim(postal_code), 5, '0') AS zip5
```

Rules:

- **Never** join on a raw string that a human typed into either file.
- `TRY_CAST` over `CAST`: it yields NULL instead of aborting the whole query, and NULLs are then visible in your orphan audit.
- Normalize in a **view or CTE**, not inline in the `ON` clause — you want the same expression reused and re-readable.
- Verify the normalization *changed* something, otherwise you are guessing:

```sql
SELECT unit_id, lpad(trim(unit_id), 2, '0') AS unit_key, COUNT(*)
FROM units_raw GROUP BY ALL ORDER BY unit_key;
```

### 3.5 Step 5 — Choose the join type deliberately

| Join | Keeps | Use when |
|------|-------|----------|
| `LEFT JOIN` | all fact rows | **Default.** The fact file is the truth; attributes are optional enrichment. |
| `INNER JOIN` | only matched rows | You have *proven* the dimension is complete and you want hard failure of coverage. |
| `FULL JOIN` | both sides | Reconciliation — "what is on each side that the other lacks?" |
| `SEMI JOIN` | fact rows with a match | Filtering by existence, without multiplying rows. |
| `ANTI JOIN` | fact rows with no match | **Orphan audit.** This is how you find broken keys. |
| `ASOF JOIN` | nearest prior/next row | Time-aligned lookups (last known status before an event). |
| `POSITIONAL JOIN` | zips rows side by side | Almost never — only for pre-sorted, same-length exports. |

`LEFT JOIN` plus `WHERE dim.col IS NULL` is a classic footgun: that `WHERE` silently converts your `LEFT JOIN` into an `INNER JOIN`. Use `ANTI JOIN`, or put the predicate in the `ON` clause.

### 3.6 Step 6 — Assert the grain

State the grain out loud, then check it:

> "One row per `incident_id`."

```sql
SELECT COUNT(*) AS rows, COUNT(DISTINCT incident_id) AS distinct_ids
FROM combined;
-- rows must equal distinct_ids, and must equal the fact file's row count
-- (this only holds if incident_id is never NULL — check that too)
```

If you joined a **one-to-many** relationship on purpose (one call → many units responding), the grain changes, and you must say so. Then the correct check is on the pair: `COUNT(DISTINCT (incident_id, unit_key)) = COUNT(*)`.

### 3.7 Step 7 — Reconcile measures

Compare a measure before and after. This catches fan-out that a row count alone might miss (e.g. one dropped row and one duplicated row cancelling out).

```sql
SELECT
    (SELECT SUM(dispatch_queue_seconds) FROM calls) AS before_sum,
    (SELECT SUM(dispatch_queue_seconds) FROM combined) AS after_sum,
    (SELECT COUNT(*) FROM calls) AS before_rows,
    (SELECT COUNT(*) FROM combined) AS after_rows;
```

Any change in `SUM` after a `LEFT JOIN` is a bug, not a rounding issue. `COUNT(*)` may legitimately rise only if you joined to a fan-out *on purpose*.

### 3.8 Step 8 — Audit orphans

```sql
-- Fact rows whose key is absent from the dimension
SELECT c.* FROM calls c
ANTI JOIN dim u USING (unit_key);

-- Dimension rows never used by any fact row (often fine, sometimes a red flag)
SELECT u.* FROM dim u
ANTI JOIN calls c USING (unit_key);
```

#### House policy: label `UNKNOWN`, keep the row

**Decided 2026-10-23.** Unmatched fact rows are **never dropped**. Every dimension-derived column gets `COALESCE(..., 'UNKNOWN')`, and the row keeps an `is_orphan` flag so it stays auditable.

```sql
COALESCE(u.agency, 'UNKNOWN')       AS agency,
COALESCE(u.unit_type, 'UNKNOWN')    AS unit_type,
COALESCE(u.home_station, 'UNKNOWN') AS home_station,
(u.agency IS NULL)::INT             AS is_orphan   -- evaluated pre-COALESCE
```

Why this policy:

- **Totals stay honest.** Filtering orphans silently shrinks denominators; a compliance % computed on survivors is not the compliance % anyone asked for.
- **The defect is visible.** `UNKNOWN` shows up as a label in every `GROUP BY`, instead of vanishing into a filtered-out void.
- **It is reversible.** `is_orphan` lets any downstream consumer re-create the strict view with `WHERE is_orphan = 0`, so nothing is lost by keeping the row.
- **It is checkable.** `COUNT(*) WHERE agency = 'UNKNOWN'` is the orphan count, no separate audit query needed.

The consequences you must handle at report time:

| Consequence | Rule |
|-------------|------|
| `agency` now has an `UNKNOWN` level | Always show it or explicitly exclude it *and* state the excluded count. Never let it silently dominate a share-of-total chart. |
| A share-of-total denominator | Decide per chart: include `UNKNOWN` (mirrors reality) or filter with `WHERE is_orphan = 0` (describes known units only). Label which one the chart uses. |
| Orphan rate drifting upward | Treat as a data-quality signal — a rising `UNKNOWN` share usually means the reference file went stale or key formatting changed. |
| `is_orphan` evaluated after `COALESCE` | It must read the **pre-coalesce** column (`u.agency IS NULL`), otherwise it is always `0`. |

Administrative causes are still bugs, not policy:

| Orphan cause | Action |
|--------------|--------|
| Bad key formatting / whitespace | Fix normalization (§3.4) and re-run — do not let `UNKNOWN` mask it. |
| Reference file out of date | Refresh the lookup file; `UNKNOWN` is a stopgap, not a fix. |
| Genuinely missing reference data | Keep as `UNKNOWN` (this policy). |

> Test for whether the policy is working: the orphan count is **visible, small, and explainable**. If it is large, the join is broken — labelling it `UNKNOWN` made the bug legible, not acceptable.

### 3.9 Step 9 — Persist

```sql
-- 1. Materialize once, so downstream queries don't re-parse the CSVs
CREATE OR REPLACE TABLE combined AS
SELECT ... ;

-- 2. Export the artifact (Parquet: typed, compressed, columnar — ~5-10x smaller than CSV)
COPY (SELECT * FROM combined ORDER BY incident_id)
TO 'data/combined.parquet' (FORMAT parquet, COMPRESSION zstd);

-- 3. Optionally export a CSV if a human or another tool needs it
COPY (SELECT * FROM combined ORDER BY incident_id)
TO 'data/combined.csv' (HEADER, DELIMITER ',');
```

`TABLE` vs `VIEW`: a `VIEW` re-reads the CSVs on every query (fine, and good while iterating); a `TABLE` freezes a snapshot (good for reports and for reproducing a number later). Prefer `CREATE OR REPLACE TABLE AS` for datasets you will cite.

Commit the `.sql`, not the `.duckdb` binary or the generated Parquet.

---

## 4. The worked example (copy this)

Two files, on purpose imperfect:

`data/demo_calls.csv` — 12 calls, `unit_id` written inconsistently (`07` vs `7`), one unit (`99`) that does not exist in the reference file.
`data/demo_units.csv` — 7 unit rows, **duplicate** rows for `12` and for `07`, and one `unit_id` with stray whitespace (`" 07 "`).

### 4.1 Set up normalized views

```sql
CREATE OR REPLACE VIEW calls AS
SELECT *,
       lpad(trim(unit_id), 2, '0') AS unit_key
FROM read_csv('data/demo_calls.csv', header = true,
    columns = {'incident_id':'INTEGER','call_start_time':'TIMESTAMP',
               'unit_id':'VARCHAR','postal_code':'VARCHAR',
               'priority':'VARCHAR','dispatch_queue_seconds':'DOUBLE'});

CREATE OR REPLACE VIEW units_raw AS
SELECT *,
       lpad(trim(unit_id), 2, '0') AS unit_key
FROM read_csv('data/demo_units.csv', header = true,
    columns = {'unit_id':'VARCHAR','agency':'VARCHAR',
               'unit_type':'VARCHAR','home_station':'VARCHAR'});
```

### 4.2 What the three naive approaches produce

| Approach | Rows | `SUM(dispatch_queue_seconds)` | NULL `agency` |
|----------|-----:|-----:|-----:|
| Naive: join raw `unit_id` to raw `unit_id` | 14 | 855 | 3 |
| Normalized keys only, no uniqueness check | **18** | **1087** | 1 |
| Normalized + deduplicated dimension (**correct**) | **12** | **733** | 1 |

Read that table carefully — it is the whole lesson:

- The **naive** join looks plausible (14 rows) but leaves three calls unmatched (`07` vs ` 07 ` formatting, plus the missing unit `99`) while *still* duplicating unit `12`.
- **Normalizing keys alone made it worse**, because better matching multiplied the duplicate dimension rows: two defects partially masked each other before, and fixing one exposed the other.
- Only doing **both** jobs — normalize *and* prove uniqueness — gives 12 rows and the true total of 733.

### 4.3 The correct pipeline

```sql
-- One row per key. Deterministic ORDER BY is mandatory: without it,
-- which duplicate survives varies between runs.
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
    (u.agency IS NULL)::INT             AS is_orphan   -- keep the defect visible
FROM calls c
LEFT JOIN dim u USING (unit_key);
```

`QUALIFY` filters *after* window functions — it is the tidy way to deduplicate in one pass, no subquery needed. `ORDER BY` inside the `ROW_NUMBER()` is mandatory: without it, which duplicate survives is arbitrary, and your numbers change between runs.

### 4.4 Verification block (paste this every time)

```sql
-- 1. Row count preserved?
SELECT (SELECT COUNT(*) FROM calls) AS calls_rows,
       (SELECT COUNT(*) FROM combined) AS combined_rows;

-- 2. Grain intact?  (both must match calls_rows)
SELECT COUNT(*) AS rows, COUNT(DISTINCT incident_id) AS distinct_ids FROM combined;

-- 3. Measures reconciled?
SELECT (SELECT SUM(dispatch_queue_seconds) FROM calls) AS before_sum,
       (SELECT SUM(dispatch_queue_seconds) FROM combined) AS after_sum;

-- 4. Orphans, explicit
SELECT unit_key, COUNT(*) AS calls_lost FROM combined WHERE is_orphan = 1 GROUP BY 1;

-- 5. Dimension still unique after normalization?  (must be 0)
SELECT COUNT(*) AS keys_with_dupes
FROM (SELECT unit_key FROM dim GROUP BY 1 HAVING COUNT(*) > 1) d;
```

Turn the expectations into hard assertions when the query becomes a pipeline. `error()` aborts the script:

```sql
SELECT CASE
         WHEN (SELECT COUNT(*) FROM combined) = (SELECT COUNT(*) FROM calls)
         THEN 'grain OK'
         ELSE error('JOIN FAN-OUT: combined row count != calls row count')
       END AS join_check;
```

---

## 5. Reading the plan

`EXPLAIN` estimates are a free fan-out check, before you spend the compute:

```sql
EXPLAIN SELECT COUNT(*) FROM calls c JOIN units_raw u USING (unit_key);
```

Scan the output for `HASH_JOIN` and its estimated row count. On the demo data the join estimates **18 rows** from a 12-row fact side — the inflation is visible without running it. `EXPLAIN ANALYZE` (or `PROFILE`) additionally shows actual cardinalities and timing.

---

## 6. Gotchas specific to CSV joining

| Symptom | Cause | Fix |
|---------|-------|-----|
| Join returns all NULLs | Type or formatting mismatch (`07` vs `7`) | Normalize both sides; compare `typeof()` and distinct values. |
| Row count multiplied | Duplicate keys in the lookup file | Prove uniqueness (§3.3) or `QUALIFY ROW_NUMBER()`. |
| `SUM` inflated after a `LEFT JOIN` | Fan-out | Same as above — reconciliation query catches it. |
| A `LEFT JOIN` behaves like `INNER` | `WHERE dim.col IS NULL` filter | Move predicate into the `ON` clause, or use `ANTI JOIN`. |
| Leading zeros lost | Column inferred as numeric | Declare `VARCHAR` in `columns = {...}`. |
| Date parse error on one file only | Different `timestampformat` per file | Pass `timestampformat=` explicitly per `read_csv`. |
| Wrong column joined | Same-ish name (`id` / `unit_id` / `UnitID`) | Check `DESCRIBE`, join on the explicit normalized key. |
| Non-deterministic results | `ROW_NUMBER()` with no `ORDER BY` | Always add a deterministic `ORDER BY`. |
| Duplicate columns in output | `SELECT *` from both sides | Select explicit columns, or `USING` the key. |
| Encoding surprises (Â, mojibake) | Non-UTF-8 export | `read_csv(..., encoding = 'latin-1')` |

---

## 7. Adjacent tools worth knowing

```sql
-- Pivot long -> wide (reporting shape) without writing CASE expressions
PIVOT calls ON priority USING COUNT(*) GROUP BY postal_code;
-- Or aggregate values: USING SUM(dispatch_queue_seconds)

-- Unpivot wide -> long (tidy shape for plotting)
UNPIVOT monthly ON Jan, Feb, Mar INTO NAME month VALUE n;

-- Align to the most recent prior event (last known unit status before a call)
SELECT c.incident_id, s.status
FROM calls c
ASOF LEFT JOIN unit_status s
  ON c.call_start_time >= s.status_time;

-- FROM-first syntax: reads like the pipeline, handy for `SUMMARIZE`/`PIVOT`
FROM 'data/demo_calls.csv' SELECT priority, COUNT(*) GROUP BY ALL;
```

---

## 8. Sources

- DuckDB CSV docs — <https://duckdb.org/docs/stable/data/csv/overview>
- DuckDB `JOIN` docs (includes `ASOF`, `SEMI`, `ANTI`, `POSITIONAL`) — <https://duckdb.org/docs/stable/sql/query_syntax/from>
- DuckDB `QUALIFY` — <https://duckdb.org/docs/stable/sql/query_syntax/qualify>
- DuckDB `SUMMARIZE` — <https://duckdb.org/docs/stable/guides/meta/summarize>
- DuckDB `PIVOT` / `UNPIVOT` — <https://duckdb.org/docs/stable/sql/statements/pivot>
- `DuckDB in Action` (Manning) — join and data-loading chapters are the best long-form treatment. See [[duckdb_notes|duckdb_notes]] §11.
- Curated index: [awesome-duckdb](https://github.com/davidgasquez/awesome-duckdb)

---

*Created 2026-10-23. Runnable companion: `sql/join_csvs.sql` (wired into `run_lab.py`). If you adopt a new key-normalization idiom, add it to §3.4 and to the SQL file in the same commit.*
