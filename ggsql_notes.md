---
type: learning-note
topic: ggsql (Grammar of Graphics for SQL) for EDA and Reporting Visuals
date: 2026-09-25
status: active
tags:
  - ggsql
  - sql
  - duckdb
  - visualization
  - grammar-of-graphics
  - learning-plan
---

# ggsql Notes — Grammar of Graphics over SQL

> Goal: get productive in ggsql for **EDA visuals → composed reporting charts → time-series displays**, without leaving SQL.
> Companion project spec: [[Reporting Engine/SQL|Reporting Engine SQL.md]] §5 + §4.7 — that file is 9-1-1-project specific. This file is your general-purpose ggsql learning system.
> Related: [[duckdb_notes|duckdb_notes]] (the data layer), [[julia_notes|julia_notes]] (the compute layer), [[Time Series/Time Series Notes|Time Series Notes]]
> Upstream docs: [ggsql syntax](https://ggsql.org/syntax/) (v0.3.0-alpha) · [Grammar intro](https://ggsql.org/get_started/grammar.html) · [Posit alpha announcement](https://opensource.posit.co/blog/2026-04-20_ggsql_alpha_release) · [R package](https://r.ggsql.org/)

## How to use this note

1. Read **§2 Setup** once (reader/writer model + knitr engine).
2. Learn the grammar-to-clause map in **§3–§4** before writing plots — it pays off immediately.
3. Copy EDA plots from **§5** verbatim, then adapt; compose reporting charts from **§6**.
4. Track progress in **§10 Tracker**.

> Mindset: ggsql splits every query at the `VISUALISE` boundary — SQL runs in the database (DuckDB), the visualisation spec compiles to a backend (Vega-Lite / ggplot2). You keep aggregation where it's fast and get composable charts without context-switching to Python/R. It is **alpha (v0.3.0)** — expect syntax drift; pin your version and validate specs (§8).

---

## 1. Why ggsql for these three areas

| Strength | What it means for you |
|----------|-----------------------|
| SQL-native GoG | Same grammar ideas as ggplot2/plotnine/AlgebraOfGraphics, expressed as SQL clauses. Your SQL skill transfers directly. |
| No context switch | `SELECT` → `VISUALISE` → `DRAW` in one file. Aggregations stay in DuckDB; no pandas round-trip for standard plots. |
| Composable layers | Scatter + smooth + reference rule, bar + threshold line, line + ribbon band — the reporting charts execs actually read. |
| Small multiples | `FACET` gives shift/agency/day panels from one query. |
| Backend flexibility | Specs render via Vega-Lite, ggplot2, SVG/PNG; works in Quarto, Jupyter, Positron, VS Code, Shiny. |
| R/Python bridge | knitr engine with bidirectional flow: prep in dplyr/pandas, visualise in ggsql, reference `r:dataset` directly. |
| Honest gaps | Alpha API (breaking changes likely); statistics are visual (bin/count/smooth/density), not inferential — no tests, no models, no forecasts. Forecasting/estimation still lives in Python/R/Julia; ggsql **displays** their outputs. |

---

## 2. Setup (do once, ~30 min)

### 2.1 R path (most mature, CRAN 2026-06)

```r
install.packages("pak")
pak::pak("ggsql")  # or posit-dev/ggsql for dev

library(ggsql)
reader <- duckdb_reader()              # in-memory DuckDB reader
ggsql_register(reader, mtcars, "cars") # push a data.frame into the reader

spec <- ggsql_execute(reader, "SELECT * FROM cars VISUALISE mpg AS x DRAW histogram")
ggsql_render(vegalite_writer(), spec)
ggsql_save(spec, "plot.png")           # or .svg / Vega-Lite JSON
```

### 2.2 Reader / writer model (the core idea)

- **Readers** connect SQL to data: `duckdb_reader()`, `odbc_reader()`. The SQL half of your query runs here.
- **Queries** split at `VISUALISE`: left side = SQL, right side = visualisation spec.
- **Writers** render specs: `vegalite_writer()` (JSON), SVG, PNG (via V8 + rsvg).
- **Two executors**: `ggsql_execute(reader, query)` → spec (plot); `ggsql_execute_sql(reader, query)` → data frame (debug the SQL half).
- **Validation**: `ggsql_validate(query)` / `ggsql_has_visual(query)` — run these when a plot misbehaves; the bug is usually in the SQL half.

### 2.3 Quarto / knitr path (recommended for reports)

````markdown
```{ggsql}
SELECT dow, COUNT(*) AS n FROM ev GROUP BY dow
VISUALISE dow AS x, n AS y, dow AS fill
DRAW bar
LABEL title => 'Service Calls per Day'
```
````

- Reference R/Python frames directly: `FROM r:mtcars` (no manual registration).
- Bidirectional flow: dplyr/pandas block → ggsql block with zero plumbing.
- Shiny: `ggsqlOutput("chart")` + `renderGgsql({ "SELECT ... VISUALISE ..." })`.

### 2.4 Python path

Python bindings exist alongside R; check the [alpha announcement](https://opensource.posit.co/blog/2026-04-20_ggsql_alpha_release) for the current install story and pin `ggsql>=0.3` in your env. When in doubt, prototype in R/Quarto and port the SQL text — the `VISUALISE` clauses are identical.

---

## 3. Learning Plan

Total: **~2–4 weeks at 3–4 hrs/week** (faster than Julia/DuckDB tracks because your SQL already covers the data half).

### Phase 0 — Grammar-to-clause map (3–4 hrs)

**Learn:** Data → Mappings → Statistics → Scales → Geometries → Facets → Coordinates → Theme, and how each maps to `VISUALISE / DRAW / MAPPING / SETTING / SCALE / FACET / PROJECT / LABEL / PLACE` (§4).

- [ ] Read the [grammar intro](https://ggsql.org/get_started/grammar.html) end-to-end once.
- [ ] Reproduce §5.1–§5.3 (bar, histogram, scatter) from memory.
- [ ] Exit check: explain what `DRAW` vs `SCALE` vs `SETTING` each control, and why `VISUALISE` comes first.

### Phase 1 — EDA Visuals (Week 1–2, core focus #1)

**Learn:** the 12-plot EDA set (§5): bars, histograms, densities, boxplots, violins, scatters, smooths, tiles.

- [ ] Render every numeric as histogram + boxplot; every categorical as bar.
- [ ] Debug with `ggsql_execute_sql` whenever counts look wrong (it's always the `GROUP BY`).
- [ ] Exit check: point ggsql at a new table and produce the full EDA panel in under 30 minutes.

See **§5 EDA Snippets**.

### Phase 2 — Composed Reporting Charts (Weeks 2–3, core focus #2)

**Learn:** multi-layer (`point + smooth + rule`), `FACET` small multiples, `SCALE` control, `LABEL` discipline, threshold reference lines (NENA/NFPA), heatmaps.

- [ ] Build one exec chart (circadian line), one ops chart (compliance heatmap + threshold), one shift chart (faceted boxplots).
- [ ] Exit check: hand a chart to a non-technical reader — title + axes + reference line explain themselves with no narration.

See **§6 Advanced Snippets**.

### Phase 3 — Time-Series Displays (Weeks 3–4, core focus #3)

**Learn:** line + `ribbon` bands, actual-vs-forecast layering (two tables, one spec), faceted seasonal panels. Remember: ggsql draws forecasts; it doesn't compute them ([[duckdb_notes|duckdb_notes]] §7 does).

- [ ] Plot raw series + trailing-mean band from DuckDB views.
- [ ] Overlay exported forecasts (ARIMA/ETS/naive) as a second layer with intervals.
- [ ] Exit check: a 7-day actual-vs-forecast chart with bands that an exec can read in 10 seconds.

See **§7 Time Series Snippets**.

---

## 4. Clause / Layer / Aesthetic Reference

### 4.1 Clauses (order: `VISUALISE` first, rest arbitrary — group `DRAW`s together)

| Clause | Role | Example |
|--------|------|---------|
| `VISUALISE` | Starts the visualisation; global mappings inherited by layers | `VISUALISE mpg AS x, disp AS y` |
| `DRAW` | Adds a layer (geometry + optional stat) | `DRAW point`, `DRAW bar`, `DRAW smooth` |
| `MAPPING` | Binds columns to aesthetics explicitly | `MAPPING x => hour, y => n` |
| `SETTING` | Layer parameters (binwidth, position, aggregate, reference) | `SETTING binwidth => 10, position => 'dodge'` |
| `SCALE` | Aesthetic scaling (continuous/discrete/binned/ordinal/identity) | `SCALE fill CONTINUOUS` |
| `FACET` | Small multiples split | `FACET shift_label` |
| `PROJECT` | Coordinate system | Rarely needed; default Cartesian |
| `LABEL` | Titles, axis/legend labels | `LABEL title => '...', x => 'Hour'` |
| `PLACE` | Annotation layer | Text/callout overlays |

Spelling: both `VISUALISE` (🇬🇧) and `VISUALIZE` (🇺🇸) are accepted — pick one per project.

### 4.2 Layers (after `DRAW`)

| Layer | Shows | EDA use |
|-------|-------|---------|
| `point` | Scatterplot marks | Bottleneck scatters, volume-vs-duration |
| `line` / `path` | Sorted / unsorted connected lines | Circadian curves, daily compliance |
| `bar` | Bars, optionally counted from rows | Volume by DOW/shift/agency/priority |
| `histogram` | Binned counts | Distribution shape |
| `density` | KDE of one variable | Skew, modality |
| `boxplot` | 5-number summary | Shift/agency comparisons |
| `violin` | Rotated KDE | Distribution overlap |
| `smooth` | Trendline following data | Scatter overlays |
| `tile` | Filled rectangles | DOW × hour compliance heatmap |
| `rule` | Reference lines | NENA 90% / NFPA 64s thresholds |
| `area` / `ribbon` | Filled series / extrema band | Forecast intervals |
| `range` | Segment between two values (+hinges) | Custom intervals |
| `segment` / `polygon` | Segments / shapes | Annotations, zones |
| `text` | Labels as marks | Bar labels, callouts |
| `spatial` | Simple features from geometry | Lat/lon (needs geometry col) |

### 4.3 Aesthetics (after `AS` in mappings)

| Family | Aesthetics |
|--------|-----------|
| Position | `x`, `y` |
| Color | `color` (stroke), `fill` |
| Stroke | `linetype`, `linewidth`, `shape`, `size` |
| Transparency | `opacity` |
| Faceting | variables in `FACET` |

### 4.4 Position adjustments + in-layer aggregates (`SETTING`)

- **Position**: `stack` (default bars), `dodge` (grouped bars), `jitter` (overplotted points), `identity`.
- **Aggregates** (`SETTING aggregate => ...`): `count`, `sum`, `mean`, `median`, `min`, `max`, `p05`–`p95`, `sdev`, `var`, `iqr`, `se`, `geomean`, `harmean`, `rms`.

---

## 5. EDA Snippets (the 12-plot set — mirrors SQL.md §12)

All queries assume the `ev` / `ph` views from [[duckdb_notes|duckdb_notes]] §5.1.

```sql
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

-- 9. Same + linear fit (Analyst: agency workflows)
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
```

Distribution trio (run on every numeric):

```sql
SELECT dispatch_queue_seconds FROM ev WHERE dispatch_queue_seconds IS NOT NULL
VISUALISE dispatch_queue_seconds AS x
DRAW histogram
SETTING binwidth => 10
LABEL title => 'Dispatch Queue Time (histogram)';

SELECT dispatch_queue_seconds FROM ev WHERE dispatch_queue_seconds IS NOT NULL
VISUALISE dispatch_queue_seconds AS x
DRAW density
LABEL title => 'Dispatch Queue Time (density)';

SELECT shift_label, dispatch_queue_seconds FROM ev WHERE dispatch_queue_seconds IS NOT NULL
VISUALISE shift_label AS x, dispatch_queue_seconds AS y, shift_label AS fill
DRAW boxplot
LABEL title => 'Dispatch Queue Time by Shift';
```

---

## 6. Advanced Compositions (reporting charts)

```sql
-- Exec: circadian demand curve (hourly means)
SELECT EXTRACT(HOUR FROM hour_start)::INT AS hod, AVG(nine_one_one_calls_received) AS mean_calls
FROM ph GROUP BY 1
VISUALISE hod AS x, mean_calls AS y
DRAW line
LABEL title => 'Mean 9-1-1 Call Volume by Hour', x => 'Hour', y => 'Calls (mean)';

-- Ops: compliance heatmap DOW x hour
SELECT dow, EXTRACT(HOUR FROM hour_start)::INT AS hod, AVG(nine_one_one_answered_20s_pct) AS compliance
FROM ph GROUP BY 1, 2
VISUALISE hod AS x, dow AS y, compliance AS fill
DRAW tile
SCALE fill CONTINUOUS
LABEL title => '9-1-1 Answered <=20s (%) by Day/Hour';

-- Ops: daily compliance vs NENA 90% line (bar + rule)
SELECT CAST(hour_start AS DATE) AS day, AVG(nine_one_one_answered_20s_pct) AS compliance
FROM ph GROUP BY 1
VISUALISE day AS x, compliance AS y
DRAW bar
DRAW rule
SETTING y => 90
LABEL title => 'Daily 20s Compliance (NENA 90% line)', y => 'Compliance %';

-- Shift: faceted queue-time distribution (one panel per shift)
SELECT shift_label, dispatch_queue_seconds FROM ev WHERE dispatch_queue_seconds IS NOT NULL
VISUALISE dispatch_queue_seconds AS x
DRAW histogram
FACET shift_label
LABEL title => 'Dispatch Queue Time by Shift (faceted)';

-- Analyst: violin + jitter (distribution overlap by agency)
SELECT agency, total_elapsed_seconds FROM ev WHERE total_elapsed_seconds IS NOT NULL
VISUALISE agency AS x, total_elapsed_seconds AS y, agency AS fill
DRAW violin
DRAW point
SETTING position => 'jitter'
LABEL title => 'Total Elapsed Time by Agency';

-- Analyst: bottleneck with NFPA reference (point + smooth + rule)
SELECT interview_seconds, dispatch_queue_seconds, agency FROM ev
WHERE interview_seconds IS NOT NULL AND dispatch_queue_seconds IS NOT NULL
VISUALISE interview_seconds AS x, dispatch_queue_seconds AS y, agency AS color
DRAW point
DRAW smooth
DRAW rule
SETTING y => 64
LABEL title => 'Interview vs Queue (NFPA 64s reference)';
```

Debugging habit — split the query when counts look wrong:

```r
# SQL half first (data frame), visualisation second (spec)
ggsql_execute_sql(reader, "SELECT dow, COUNT(*) AS n FROM ev GROUP BY dow")
ggsql_execute(reader, "SELECT dow, COUNT(*) AS n FROM ev GROUP BY dow VISUALISE dow AS x, n AS y DRAW bar")
ggsql_validate("SELECT 1 VISUALISE x AS x DRAW point")  # spec-level check
```

---

## 7. Time-Series Displays (ggsql draws; DuckDB/Python fit)

```sql
-- Daily volume line (from duckdb-lab hourly/daily views)
SELECT CAST(hour AS DATE) AS day, SUM(ncalls) AS n FROM hourly GROUP BY 1
VISUALISE day AS x, n AS y
DRAW line
LABEL title => 'Daily Call Volume', x => 'Date', y => 'Calls';

-- Hourly series with ±2σ band (mean/sd precomputed in DuckDB §7.5)
SELECT hod, mean_n, lo, hi FROM hod_bands
VISUALISE hod AS x, mean_n AS y
DRAW line
DRAW ribbon
MAPPING ymin => lo, ymax => hi
LABEL title => 'Circadian Volume with ±2σ Band', x => 'Hour', y => 'Calls';

-- Actual vs forecast: two precomputed tables, one spec
-- (forecasts from seasonal-naive / ETS / SARIMA exports; ggsql overlays them)
SELECT day, n, 'actual' AS series FROM daily_actual
UNION ALL
SELECT day, n, 'forecast' AS series FROM daily_forecast
VISUALISE day AS x, n AS y, series AS color
DRAW line
LABEL title => 'Actual vs 7-Day Forecast';

-- Seasonal panels: one line per DOW (shape stability check)
SELECT dow, EXTRACT(HOUR FROM hour)::INT AS hod, AVG(ncalls) AS mean_n
FROM hourly GROUP BY 1, 2
VISUALISE hod AS x, mean_n AS y
DRAW line
FACET dow
LABEL title => 'Circadian Shape by Day of Week';
```

> Rule: if a time-series computation needs estimation (ARIMA/ETS/STL/Prophet, ADF, ACF p-values), compute it in [[duckdb_notes|duckdb_notes]] §7 or Python/R/Julia and visualise the result here.

---

## 8. ggsql Gotchas (alpha-survival guide)

| Habit | ggsql reality |
|-------|---------------|
| Stable syntax | **Alpha (v0.3.0)** — clauses/layers may rename. Pin your version; re-run `ggsql_validate` after upgrades. |
| Spelling | `VISUALISE` and `VISUALIZE` both parse — pick one per repo and lint for it. |
| Clause order | `VISUALISE` must come first (it splits SQL from spec); remaining clauses are order-free, but group all `DRAW`s for readability. |
| Wrong counts | Bug is in the `SELECT`, not the plot. Debug with `ggsql_execute_sql` before touching `DRAW`/`SCALE`. |
| `r:` prefix | `FROM r:mtcars` pulls straight from the R session — no registration step in knitr/Quarto. |
| Reader mismatch | `duckdb_reader()` vs `odbc_reader()` changes the SQL dialect under the spec — keep DOW/timestamp idioms per-reader. |
| Backend surprise | Vega-Lite default ≠ ggplot2 pixel-identical. Fix on the writer (`vegalite_writer()` vs ggplot2 backend), not the query. |
| Statistics ≠ stats | `histogram`/`smooth`/`density` compute visual summaries only. Anything with a p-value lives outside ggsql. |
| Large data | Aggregate in SQL (`GROUP BY` hour/day) before `DRAW point` — never plot million-row scatters raw. |
| Themes | `LABEL` covers titles/axes/legends; full theming lives in the backend, not the query. |

---

## 9. Project Layout (recommended)

```
ggsql-lab/-or-sql-visuals/   # co-locate with duckdb-lab if you like
  visuals/
    eda_01_12.sql            # §5 twelve-plot set (one query per file or one file, your call)
    distributions.sql        # histogram / density / boxplot trio
    exec_circadian.sql       # exec line chart
    ops_heatmap.sql          # compliance tile + rule overlays
    shift_faceted.sql        # faceted histograms/boxplots
    forecast_overlay.sql     # actual-vs-forecast + ribbon bands
  reports/
    weekly.qmd               # Quarto doc with {ggsql} blocks querying the .duckdb
  pins.txt                   # ggsql version + writer backend (reproducibility)
```

Convention: one concern per file, `VISUALISE`-first, `LABEL` always (no untitled charts in reports).

---

## 10. Progress Tracker

- [ ] Phase 0: grammar→clause map from memory; bar/histogram/scatter without docs
- [ ] Phase 1: full 12-plot EDA set on a new table (<30 min)
- [ ] Phase 1: distribution trio on every numeric; `ggsql_execute_sql` debug habit
- [ ] Phase 2: circadian line + compliance heatmap + NENA/NFPA reference overlays
- [ ] Phase 2: faceted shift/agency panels with self-explanatory labels
- [ ] Phase 3: actual-vs-forecast overlay with ribbon bands
- [ ] Capstone: Quarto weekly page built from `{ggsql}` blocks against the `.duckdb`

## 11. Resources (short, high-signal)

- [ggsql syntax reference](https://ggsql.org/syntax/) — clauses, layers, aesthetics, scales.
- [Grammar of graphics intro](https://ggsql.org/get_started/grammar.html) — the mental model behind the clauses.
- [Posit alpha announcement](https://opensource.posit.co/blog/2026-04-20_ggsql_alpha_release) — install story, Quarto/Jupyter/Positron/VS Code support.
- [ggsql R package](https://r.ggsql.org/) + [CRAN manual (PDF, 2026-06)](https://cran.r-project.org/web/packages/ggsql/ggsql.pdf) — readers, writers, `ggsql_execute`, knitr engine, Shiny bindings.
- Data layer: [[duckdb_notes|duckdb_notes]] §5–§7 (every plot here assumes those views).

---

## 12. Open Questions

- [ ] Pin `ggsql` alpha version for the lab, or track dev (`posit-dev/ggsql`)? Decide before building reports on it.
- [ ] Primary backend: Vega-Lite (portable JSON) vs ggplot2 (publication polish)? Affects `pins.txt`.
- [ ] Capstone report: Quarto `{ggsql}` blocks live against `.duckdb`, or pre-rendered PNG/SVG checked in?
- [ ] At what row count do we mandate pre-aggregation before `DRAW point` (e.g. >50k rows → hexbin summary or sampling)?

*Created 2026-09-25. Update §10 as phases complete; promote working queries from snippets into `visuals/`.*
