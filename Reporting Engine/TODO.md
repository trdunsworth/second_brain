# TODO — DMA Reporting Engine

> Living task list for the multi-language 9-1-1 reporting project.
> Data: synthetic CAD/phone data, week of 2026-08-10 → 2026-08-16.
> Audiences: Executive · Operational Management · Shift Supervisors · QA/QI Managers · Analysts.

## Done
- [x] Analyze `/data` (incidents 1,082×48; hourly 168×22) and `base.ipynb` EDA scaffold.
- [x] Pull governing standards: NENA (90%≤15s / 95%≤20s), APCO (90%≤20s / 75%≤10s), NFPA 1710 (alarm 64/106s, turnout 60/80s, travel 240s).
- [x] Write `PYTHON.md` — stack, plotnine GoG, test bank, snippets.
- [x] Write `R.md` — tidyverse/ggplot2, test bank, snippets.
- [x] Write `JULIA.md` — DataFrames/AlgebraOfGraphics, test bank, gaps noted.
- [x] Add concrete EDA specifications (12 analyses from `base.ipynb`) to all three language specs, mapped to four audiences with runnable code snippets.
- [x] Add **Advanced Analyses** section (18 additional analyses: spatial, survival, queueing, mixed-effects, forecasting, control charts, capability, outliers, Pareto, etc.) to all three specs with language-specific implementations.
- [x] Create language folders: `python/`, `R/`, `julia/`.
- [x] **Python**: `ingest.py` (pydantic schema, datetime parse) + `standards.py` (threshold constants + compliance fns).
- [x] **R**: `ingest.R` (pointblank) + `standards.R` (compliance helpers).
- [x] **Julia**: `ingest.jl` + `standards.jl`.
- [x] Implement the shared compliance engine (NENA/NFPA 1710 quantile + binomial tests).
- [x] Write `SQL.md` — duckdb analytics, ggsql visualization specs.
- [x] Add comprehensive EDA Protocol (Section 4) to `PYTHON.md`, `R.md`, `JULIA.md` (sections 4.1–4.9).
- [x] Add QA/QI managers as fifth audience across all language specs.
- [x] Renumber all sections (5–14) in `PYTHON.md`, `R.md`, `JULIA.md`.
- [x] Update ggsql syntax in `SQL.md` with accurate documentation (VISUALISE, DRAW, SCALE, FACET, LABEL).
- [x] Create `palettes/common/palette.json` — single source of truth for brand colors.
- [x] Create `palettes/python/dma_palette/palette_from_json.py` — Python loader from JSON.
- [x] Update `palettes/r/dma_palette.R` — R script to read from JSON (with fallback).
- [x] Create `palettes/julia/DMA_Palettes.jl` — Julia module from JSON.
- [x] Create `palettes/sql/dma_palette.sql` — SQL views for duckdb.
- [x] Create `palettes/README.md` — palette usage documentation.
- [x] Update `README.md` with comprehensive project documentation.
- [x] Update company name to "Dunsworth, Mann, and Associates, LLC" across all files.
- [x] Update contact email to drtony@dunsworth-mann.com across all files.
- [x] Add `statease` (R), `pingouin` (Python), `HypothesisTests.jl`/`ANOVA.jl`/`ExperimentalDesign.jl` (Julia) to library stacks.
- [x] Add plain-English interpretation examples to all three language specs.
- [x] Add `pingouin>=0.5.5` to `pyproject.toml` dependencies.
- [x] **Session 2026-08-28 (EDA notebook `eda_python.ipynb`)**:
  - [x] Created `sql/` folder + `sql/01_incident_overview.sql` (DuckDB), verified runs.
  - [x] Fixed `dma_palette` package: created `palette_from_json.py`; made plotnine/ggplot2 imports optional; conditional `sys.modules` registration.
  - [x] Hardened ingestion (§3/§4.1): `parse_dates`, derived `DOW`/`dow`/`date`/`zip5`, self-healing datetime coercion, range validation, completeness KPI, data-quality flags.
  - [x] Switched bar charts → sequential `scale_fill_dma_b` (Blues/Teals/Cool/Ocean); scatters → `scale_color_dma_b` (event) + `scale_color_dma_c` (phone, by `hour_of_day`).
  - [x] Fixed `plotnine_dma.py`: `scale_fill_dma_b`/`scale_color_dma_b` now use `scale_*_manual` (replaced incompatible `scale_fill_cmap(cmap=)`).
  - [x] Added §4.1 extras (constant/near-constant cols, allowed-levels, co-missingness heatmap) and §4.2 univariate descriptive stats (numeric skew/kurtosis/IQR/CV/quantiles; categorical mode/entropy).
  - [x] Verified §4.2 logic on real data; all 35 code cells syntax-clean.
  - [x] Workflow note: external `.ipynb`/package edits require **reload-from-disk + restart kernel** (cached modules/stale cells otherwise persist).

## Agent Development
- [x] Create `agents/` folder with agent definitions for all four audiences
- [x] Create Executive Staff Agent for upper management insights
- [x] Create Operational Management Agent for compliance and performance analysis
- [x] Create Shift Supervisor Agent for team-specific insights
- [x] Create Analyst & Researcher Agent for advanced statistical analysis
- [x] Update AGENTS.md to reference new agent definitions
- [ ] Develop agent integration framework for LLM-powered interfaces
- [ ] Create example queries and use cases for each agent type
- [ ] Test agent capabilities with sample analyses
- [ ] Develop agent-specific visualization templates
- [ ] Create agent training documentation and examples

## In Progress
- [ ] `eda_python.ipynb` EDA protocol — §4.1/§4.2 complete; §4.3–§4.9 pending (see Next).

## Next (coding, together)
- [ ] Finish `eda_python.ipynb` EDA protocol §4.3–§4.9 (bivariate, temporal, geospatial, compliance, outliers, distributions).
- [ ] Add markdown narrative cells to `eda_python.ipynb` (defer until coding complete).
- [ ] Reconcile `PYTHON.md` §4.1 documented domains vs actual data (priority 1–5; shift A/B/C).
- [ ] Build core GoG charts from the three specs (demand curve, DOW/shift bars, compliance heatmap).
- [ ] Create `CHANGELOG.md` with versioned entries (start at 0.1.0).
- [ ] Create R palette loader for `palette.json` (currently hardcoded fallback).
- [ ] Create Julia palette loader for `palette.json` (currently hardcoded fallback).
- [ ] Develop example agent queries and test with sample data
- [ ] Create agent-specific visualization templates for each audience
- [ ] Develop agent integration with reporting workflows

## Later
- [ ] Statistical test bank wrappers (Goal 4) per language.
- [ ] Forecasting pipeline for weekly→yearly (Goals 5–6): STL/ARIMA/ETS.
- [ ] Dashboards: Streamlit/Dash (Py), Shiny (R), Genie/Dash (Julia) — live compliance + alerts (Goal 3).
- [ ] Quarto weekly PDF report (Word/PDF) per audience with `great_tables`/`gt` KPI tables.
- [ ] Example runnable notebooks illustrating snippets.
- [ ] Deploy agents as LLM-powered chat interfaces
- [ ] Create agent API endpoints for programmatic access
- [ ] Develop agent-based automated reporting workflows
- [ ] Create agent training datasets and evaluation benchmarks
- [ ] Integrate agents with real-time data feeds for live dashboards

## Open questions
- Data domain mismatch: `priority` reaches 5 (spec said 1–4) and `shift` uses A/B/C (spec said D/N) — update `PYTHON.md` spec or treat as data quirk?
- AHJ's actual thresholds (some use 90%≤10s busy-hour, not 15s)?
- Decompose `total_elapsed_seconds` into NFPA components for capability analysis?
- Dashboard cadence: live vs 15-min batch?
- Julia's role: analytics engine feeding Py/R for final documents?
