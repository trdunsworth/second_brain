# duckdb-lab

> Scope: DuckDB lab — SQL, joins, reports, visuals.

Start here: [[duckdb_notes|duckdb_notes]] (general DuckDB system) · [[join_two_csvs|join_two_csvs]] (two-CSV combine playbook) · [[ggsql_notes|ggsql_notes]] (plotting layer).

## Contents

| Path | What it is |
|------|-----------|
| `duckdb_notes.md` | The main learning system: setup, function map, EDA → advanced analysis → time series, gotchas, tracker. |
| `join_two_csvs.md` | Focused playbook: joining two CSVs without fan-out, key drift, or silent row loss. Includes the 9-step checklist. |
| `ggsql_notes.md` | Grammar-of-graphics-over-SQL: `VISUALISE`/`DRAW`/`FACET`, EDA plots, report charts. |
| `run_lab.py` | Smoke test. Runs `sql/` cumulatively against `:memory:` and lints `visuals/`. |
| `sql/` | Executable lab, ordered: `seed_demo` → `00_preamble` → `join_csvs` → `eda` → `outliers` → `standards` → `audiences` → `timeseries` → `exports`. |
| `data/` | Inputs + exports. `demo_calls.csv` / `demo_units.csv` are the deliberately messy pair used by the join walkthrough. |
| `visuals/` | ggsql specs (one concern per file). |
| `reports/` | Quarto output. |

## Run it

```powershell
winget install DuckDB.cli     # once
python run_lab.py             # all green = SQL order + join assertions + visual lint
```

## The two habits worth keeping

1. **Every join gets three numbers checked**: rows before, rows after, `SUM()` before vs after. If they disagree, the join is wrong — see `join_two_csvs.md` §2.
2. **Orphans are kept, labelled `UNKNOWN`, and flagged** with `is_orphan` so a strict view is still one `WHERE` clause away. Never drop unmatched fact rows. See `join_two_csvs.md` §3.8.
