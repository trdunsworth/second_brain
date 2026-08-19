# TODO.md — SynthCCD Backlog

Priorities use **P0** (must fix before release), **P1** (should have), **P2** (nice to have).
Items are sourced from `AGENTS.md` goals, the realism-improvement list, the previous-version
recommendation docs in `docs/`, and direct code review.

---

## Security

- [x] **P0 — Add `.gitignore` and untrack build artifacts.** Added `.gitignore` covering
      `.venv/`, `__pycache__/*.pyc`, `.pytest_cache/`, `.ruff_cache/`, `.DS_Store`,
      `output/*`, and IDE files; ran `git rm --cached` on the tracked artifacts (files
      remain on disk). Verified with `git check-ignore`; no artifacts remain in the index.
- [x] **P1 — Add a CI pipeline (GitHub Actions) that runs `pytest`, `ruff check .`,
      `ty check`, and the dependency audit on every push/PR.** Added
      `.github/workflows/ci.yml` (setup-uv + Python 3.12, `uv sync --locked`, ruff, ty,
      pytest, `scripts/audit_deps.py`) triggered on pushes to `main` and all PRs. To make
      the gate pass: fixed the 8 pre-existing `ty` diagnostics in `addresses.py` and
      excluded read-only `docs/` scripts from ruff scope in `pyproject.toml`.
- [x] **P1 — Add a dependency/security audit check.** Added `pip-audit` (dev group) and a
      wrapper script `scripts/audit_deps.py` (injects the OS trust store when
      `SYNTHCCD_SYSTEM_TRUST=1`). Ran it and fixed the findings: pinned `idna>=3.15`
      (PYSEC-2026-215) and `click>=8.3.3` (PYSEC-2026-2132). Audit is currently clean
      and wired into the CI gate via `scripts/audit_deps.py`. Remaining: enable
      dependabot for `uv.lock` (GitHub dependabot has no native `uv.lock` support; a
      `pip`-ecosystem config for `pyproject.toml` is the closest option).
- [x] **P1 — Trim unused runtime dependencies.** Removed from `pyproject.toml`:
      `pydantic`, `requests`, `scipy`, `rich`, `prompt_toolkit`, `inquirerpy`, `pyqt6`.
      `pyarrow` was kept (needed transitively for `pandas.to_parquet`).
      > Note: re-add `pyqt6` when the PyQt6 GUI is implemented.
- [x] **P2 — Validate `output_dir`/`output_stem` against path traversal and reserved
      names.** Added `_validate_output_path()` to `config.py` (rejects empty/`.`/`..`
      stems, separators and null bytes, `..` segments and null bytes in `output_dir`,
      and Windows reserved device names like `CON`/`NUL`/`COM1`); wired into
      `GenerationRequest.validate()`; covered by `tests/test_config.py`.
- [x] **P2 — Add timeouts and user-agent checks to address caching.** OSM Nominatim usage
      policy requires identifying User-Agent (present) and gentle rate limiting; added a
      shared `_nominatim_get()` helper that enforces a minimum 1 s request interval and
      retries 429/5xx with `Retry-After`-aware exponential backoff. Covered by
      `tests/test_addresses.py`.

---

## Functionality (AGENTS.md goal gaps)

- [x] **P1 — Implement GUID or integer incident ID option.** `AGENTS.md` goal: "Id number …
      either an integer or a GUID, depending on the user's preference." Added an `IdFormat`
      enum (`integer`/`guid`) wired through `GenerationRequest`, the `--id-format` CLI flag,
      the TUI ID-format select, and params files; GUIDs are seeded UUID v4 values via Faker
      so output stays reproducible.
- [x] **P1 — Add `incident_start_time` field** distinct from `call_start_time`. Added a
      `pre_cad_offset_seconds` draw (0–3 s, the CAD record opens a moment after the call is
      received) and the resulting `incident_start_time` column; covered by tests and
      documented in the schema.
- [x] **P1 — Model parallel dispatch and call-taking timelines** (recommendation #8). High
      priority calls are dispatched while the call is still in progress via a configurable
      `dispatch_init_fraction` keyed by priority (fractions < 1.0 dispatch mid-call,
      >= 1.0 defer until after the call ends).
- [x] **P1 — Add postal code / directional / street-component address columns.** Extended
      the `Address` model with `street_number`, `street_name`, `street_type`,
      `prefix_directional`, `postfix_directional`, and `postal_code` (auto-parsed from the
      street string, with OSM `addr:postcode` preserved through the cache); wired the
      components into the incident schema, OSM parsing, cache, and docs.
- [ ] **P1 — Add a business/landmark indicator column.** AGENTS.md: "If an address is a
      business address or a known landmark then that should be reflected in a column on its
      own." Requires mapping `amenity`/`shop`/`tourism` OSM tags onto address results.
- [x] **P2 — Make call reception and disposition use real CAD code vocabulary.** Reception
      methods now use E-911/Phone/OFFICER/Radio/C2C/NOT CAPTURED/Text/CAD2CAD and dispositions
      use code+label pairs (e.g., `NR-No Report`, `RE-Report`, `CI-Citation`),
      agency-calibrated and config-driven (recommendation #11/#12).
- [x] **P2 — Priority-weighted problem selection.** `problem_profiles` now split into per-
      priority pools (`{agency: {priority: [(name, weight)]}}`); after selecting priority,
      the problem is drawn only from the matching pool so high-acuity problems are not
      likely at low priorities (recommendation #10).
- [x] **P2 — Add hourly phone-metrics config for abandonment/volume rates.** Abandonment
      and volume factors in `phone_metrics.py` are now exposed through the `phone_metrics`
      section of `RealismConfig`/YAML (volume fractions, abandonment rates, night
      increment, max abandonment, weekend multiplier).
- [x] **P2 — Make hourly answer-time percentages vary by hour.** Answer-time percentages
      were identical every hour because the lognormal mu was constant per day. Added two
      configurable `phone_metrics` keys — `answer_time_load_sensitivity` (0.25) and
      `answer_time_mu_noise_sd` (0.05) — that shift the lognormal mu with hourly load and
      add per-hour random noise respectively. Verified: 9-1-1 10 s answered percentages
      now span a multi-point range with dozens of unique values across hours. Covered by
      `tests/test_application.py`.
- [x] **P2 — Keep answer-time percentages consistent with hourly call counts.** Service-
      level percentages are now simulated per-call instead of taken as the raw lognormal
      CDF: the hour's *answered* calls (received minus abandoned) are allocated against
      the thresholds with a sequential-binomial draw and the column is the rounded count /
      received. Percentages therefore step with the hour's received volume (5 received
      calls → 20-point steps), can never exceed 100% × answered/received, and reach exactly
      100% on fast, low-abandonment hours. Previously low-volume hours could report
      impossible values (e.g. 76% answered within 10 s on 5 calls). Covered by
      `tests/test_application.py` (`test_application_phone_answer_percentages_consistent_with_volume`).
- [x] **P2 — Add per-call mean phone-duration columns to phone metrics.** New columns
      `{prefix}_mean_duration` per emergency number (e.g. `nine_one_one_mean_duration`),
      `non_emergency_mean_duration`, `outbound_mean_duration`, and `call_mean_duration`
      (volume-weighted overall mean). Each category mean is the per-hour sample mean of
      one lognormal phone-duration draw per answered call (received minus abandoned;
      outbound has no abandonment), so low-volume hours produce noisy means and hours
      with no answered calls report `0.0`. Backward-compatible optional
      `phone_metrics` keys `*_phone_duration_mu`/`*_phone_duration_sigma`
      (9-1-1 ≈ 210 s, non-emergency ≈ 120 s, outbound ≈ 60 s) plus per-line
      `phone_duration_mu`/`phone_duration_sigma` overrides. Schema version bumped to 1.2.
      Covered by `tests/test_application.py`.
- [x] **P1 — PSAP agency filter.** Added `psap_agency` field to `GenerationRequest`
      (CLI `--psap-agency`, TUI select, params file, API) with five options: `all` (default),
      `law`, `fire`, `ems`, `fire_ems`. Filters `agency_weights` before generation so all
      downstream tables (priority, problem, disposition, timing) adapt automatically.
      Covered by tests in `test_config.py` and `test_application.py`.

---

## Performance / Scalability

- [x] **P1 — Vectorize incident generation for million-row scale.** Rewrote `incidents.py`
      from a per-row Python loop to a vectorized `numpy` pipeline (array agency/priority
      choice, batched lognormal timing draws, vectorized shift resolution and address
      sampling, `np.char` reference numbers) building the frame once; `phone_metrics.py`
      likewise vectorized with array `poisson`/`binomial`. Benchmarked on this machine:
      ~335 µs/row → ~7 µs/row (200k rows 67.1 s → 1.16 s, 1M rows ~7 s, ~514 MB). Column
      set and seeded reproducibility preserved; covered by the full test suite.
- [x] **P2 — Add a memory-budget guard / chunked export.** For very large datasets, CSV/Parquet
      exports now stream incrementally instead of holding the full frame in memory. Added
      `max_memory_bytes` to `GenerationRequest` (default 2 GiB; CLI `--max-memory-bytes`, TUI
      field, and params key), a probe-based `IncidentGenerator.resolve_chunk_rows`/`generate_chunks`
      pipeline that yields bounded DataFrames on a shared RNG, and
      `exporters.export_chunked_generator` (CSV header-then-append, Parquet via one
      `ParquetWriter`). `id_number` stays globally sequential and `internal_reference_number`
      unique per agency across chunks; single-chunk runs remain byte-identical to non-chunked
      output. Covered by `tests/test_chunking.py` plus config/CLI/TUI tests.

---

## Usability

- [x] **P1 — Add `logging` throughout the app.** Added `logging_conf.py` (package-scoped
      loggers, `configure_logging` with `--verbose/-v` and `--quiet/-q` global CLI flags and
      `SYNTHCCD_LOG_LEVEL` env support, plus a `ProgressReporter` that logs 5% completion steps
      for runs over 10k rows). Instrumented `app.py`, `incidents.py`, `phone_metrics.py`,
      `addresses.py`, `exporters.py`, and `cli.py`; status summaries still print via `typer.echo`
      while granular detail goes to the stderr logger.
- [x] **P1 — Finish the TUI.** Reworked `tui.py`: generation now runs on a Textual worker
      thread (UI stays responsive) with a live `ProgressBar` driven by a new
      `on_progress` hook threaded through `Synth911Application`/`IncidentGenerator`; fields are
      grouped into General/Geography/Personnel/Configuration sections with themed CSS; invalid
      fields are highlighted with an error border via aggregated `FieldValidationError`
      feedback (cleared on edit); status panel colors info/success/error states. The TUI
      already exposed seed, date range, pool sizes, output dir, and the realism-config path.
- [x] **P2 — Default to the incidents dataset only.** `GenerationRequest`, the pydantic
      `schema.py` model, the CLI `--dataset` help, the TUI Dataset select, and the
      `/schema` serve endpoint all default to `incidents` instead of `all`. Selecting
      `incidents` or `phone` was already mutually exclusive; the change makes the default
      generate only incidents (10,000 rows) unless `--dataset all`/`phone` is chosen.
      Covered by updated `tests/test_config.py`/`test_tui.py` and new exclusivity + phone
      row-count (24/day) tests in `tests/test_application.py`.
- [ ] **P2 — Implement the PyQt6 GUI** (AGENTS.md goal: "TUI or a GUI"). Requires re-adding
      the `pyqt6` dependency (removed in the dependency trim); a desktop GUI would serve
      non-technical operators. **Deferred** — not being pursued for now.
- [x] **P2 — Document/reconcile env vars.** `USERSGUIDE.md` previously documented `SYNTHCCD_SEED` and
      `SYNTHCCD_OUTPUT_DIR`, but neither is read anywhere in `src/` (verified). Removed both rows from
      the env-var table, leaving only the implemented `SYNTHCCD_LOG_LEVEL` (and the documented
      `SYNTHCCD_SYSTEM_TRUST` TLS flag in Troubleshooting).
- [x] **P2 — Split the oversized `USERSGUIDE.md`.** It was ~1000 lines; moved all realism
      content (YAML realism configuration reference and default distribution tables) into a
      new companion `REALISMGUIDE.md` and kept the user guide to quick-start, CLI reference,
      params files, output formats, schema, examples, and troubleshooting, with cross-links
      between the two documents.
- [x] **P2 — Provide a `--schema`/`--dry-run` CLI flag** to print the generated schema and a
      few sample rows without a full OSM fetch or long generation run. Added
      `synth911gen3.describe.build_preview_datasets` (probes the incident pipeline against a
      static address pool and restricts phone metrics to a single day) plus `--schema` and
      `--dry-run` flags on `generate` that short-circuit before generation and respect
      `--dataset`/`--id-format`/`--config`. Covered by `tests/test_describe.py` and
      `tests/test_cli.py`.

---

## Testing / Quality

- [x] **P1 — Enforce the 80% coverage requirement.** Added `pytest-cov` to the dev group and
      wired it into `pyproject.toml`: `addopts = "--cov --cov-report=term-missing"` plus a
      `[tool.coverage]` section with `fail_under = 80`. Coverage is enforced on every
      `uv run pytest` run and explicitly in CI (`--cov-fail-under=80`). Added tests for the
      previously-lightly-covered `cli.py` (flag mapping, error exits, real generation,
      entrypoint) and `exporters.py` (JSON/YAML/PANDAS/PARQUET, chunked-format rejection),
      plus a new `tests/test_tls.py`. Suite is at ~94% coverage (190 tests).
- [x] **P1 — Add tests for `realism_config.py` round-trip (`to_yaml`/`from_yaml`) and
      weight-validation error paths.** Added `tests/test_realism_config.py` (33 tests):
      round-trip (default/custom/shift/empty/missing/invalid YAML), weight validation
      (all weight structures, unknown agencies, missing keys, bounds, normalization),
      and edge cases (display names, partial overrides, valid YAML output). Module now at
      100% coverage.
- [x] **P1 — Add tests for `tui.py` request building and `addresses.py` cache
      invalidation/corruption paths.** `test_tui.py` covers request building,
      defaults/customs, invalid-int/date field validation, aggregated
      `FieldValidationError`, params loading, reset, and worker generation;
      `test_addresses.py` now covers `_load_cache` returning `None` for missing,
      corrupt, and below-minimum frames, plus `load_addresses` recovering from a
      corrupt cache and refetching when the cached frame is below the minimum.
- [x] **P2 — Clear the remaining pre-existing `ty` diagnostics and `docs/*` ruff errors.**
      `docs/` contains v2-era scripts (`synthgui.py`, `webgui.py`, `synth911.py`, …) that
      fail lint/type checks. The 8 `ty` diagnostics in `addresses.py` were fixed (Dec 2026)
      and `docs/` is now excluded from ruff scope via `pyproject.toml`; `ty check src/` now
      passes with zero diagnostics. The v2 reference scripts in `docs/` are intentionally
      excluded — they are not part of the package.
- [x] **P2 — Add a CHANGELOG and version bump discipline** (semver), wired to the `0.1.0`
      version in `pyproject.toml`. Created `CHANGELOG.md` following Keep a Changelog format;
      version `0.1.0` in `pyproject.toml`; all core features documented under [Unreleased] and
      [0.1.0] sections. Future releases will follow semver with entries moved from
      [Unreleased] to versioned sections on tag.
- [x] **P2 — Add a Sphinx HTML documentation site.** Every module, class, and public
      method in `src/synth911gen3/` (and every test module) now carries a
      Sphinx-autodoc-ready docstring (Google style, `sphinx.ext.napoleon`-compatible).
      `docsrc/` holds the Sphinx sources (`conf.py`, `index.rst`, `api/*.rst`, `bizstyle`
      theme, `autodoc` + `napoleon` + `viewcode`); `scripts/build_docs.py` builds the site
      into `output/docs/` (`--clean`/`--strict` flags). `docs/` remains read-only v2-era
      material. Build is warning-free under `--strict`.

---

## Realism Improvements (from AGENTS.md list)

- [x] **Priority-weighted time distributions** — done via `TIME_PROFILES`.
- [x] **Config-driven design — shift structures and per-shift personnel counts.** Added a
      `shift_config` section to `RealismConfig`/YAML (`ShiftConfig`/`Shift` in
      `shifts.py`): crew rotation pattern, per-shift hours/label/rotation group, and
      staffing; four presets (`2x12h-4shift-14day` default, `2x12h-2shift`, `3x8h-3shift`,
      `4x10h-4shift`) selectable via `--shift-preset`/TUI/params. Geographic zones
      (URBAN/SUBURBAN/RURAL) are implemented — see below.
- [x] **Enhanced address generation via overpy/Overpass** — done.
- [x] **Personnel modeling — workload weighting.** Separate calltaker/dispatcher pools with
      Zipf-like workload weighting are in place (see below). ASCII name normalization is
      implemented: all output names are clean ASCII via `_to_ascii()` transliteration
      (Cyrillic, Arabic, accented Latin → ASCII; CJK/Devanagari fall back to en_US).
      US ethnic blend updated to use only Latin-script locales (`en_IN`, `en_KE`,
      `nl_NL`, `pl_PL`, `tr_TR` replace `zh_CN`, `hi_IN`, `ja_JP`, `ko_KR`,
      `ru_RU`, `ar_SA`). Non-Latin locales still work via realism config overrides.
- [x] **Diurnal call volume patterns** — done via `hourly_weights`.
- [x] **Geographic zone multipliers** (URBAN/SUBURBAN/RURAL) applied to travel time. Added `zone` field to `Address` model with OSM-based classification (landuse, place, highway, building tags), `ZONE_TRAVEL_MULTIPLIERS` in constants (URBAN=0.8, SUBURBAN=1.0, RURAL=1.5), configurable via `zone_travel_multipliers` in `RealismConfig`/YAML, applied to `travel_mean` in incident generation.
- [x] **Parallel dispatch/call-taking timelines** — see Functionality above.
- [x] **Separate turnout and travel times** — done.
- [x] **Priority-weighted problem selection** — see Functionality above.
- [x] **Enhanced reception/disposition vocabularies** — see Functionality above.
- [x] **Incident start time field** — see Functionality above.
- [x] **Configurable personnel assignment with workload distribution.** Personnel are
      assigned per shift from separate calltaker/dispatcher pools with Zipf-like weighting
      (some staff handle more calls than others); per-shift staffing comes from
      `shift_config`, falling back to a split of the global pool totals when a shift omits
      it (recommendation #4, #14).

---

## Future Expansion Opportunities

- [x] **Multi-agency incidents & unit counts.** Add `num_units`/`units_available` and allow one
  incident to spawn LAW+FIRE+EMS records (mutual aid / multi-agency responses).
  Added multi-agency assist problem types (Assist Police, Assist Fire, Assist EMS) to problem
  profiles for all three agencies at priority 5, enabling LAW to call for FIRE/EMS assist,
  FIRE to call for EMS assist, and EMS to call for LAW/FIRE assist. Full multi-record
  incidents with unit counts remain for future work.
- **Cadence/queueing simulation.** The recommendation docs propose a constrained simulation
  (unit availability queues, simpy). Worth prototyping for dispatch realism at P2/P3.
- [x] **Weather and seasonal correlation** (heat → heat-related EMS, winter → slip/fall).
  Added `SEASONAL_MULTIPLIERS` in `constants.py` with per-problem seasonal weights for
  Winter/Spring/Summer/Fall. Integrated into `RealismConfig` with YAML config support
  (`seasonal_multipliers` section). Generator applies multipliers per-incident based on
  call month: Winter multipliers for heat/cold exposure (1.5), hypothermia (3.0),
  brush/grass fire (0.3); Summer multipliers for heat exhaustion (3.0), brush/grass fire (2.0),
  noise complaints (1.3); Fall multipliers for shoplifting (1.2), chimney fire (1.5);
  Spring multipliers for animal complaints (1.2). Configurable via realism YAML.
- [x] **Geospatial exports** (GeoJSON / shapefile) alongside tabular formats, using address
  coordinates cached from OSM.
  Added `latitude`/`longitude` fields to `Address` model and incident schema. OSM address
  provider extracts coordinates from Overpass elements (nodes: direct lat/lon; ways:
  center point). Exporters support:
  - `geojson`: RFC 7946 FeatureCollection with Point geometries, full attribute fidelity
  - `shapefile`: ESRI Shapefile via geopandas (optional dep), field names truncated to
    10 chars per format limitation. Hourly phone metrics exported as JSON alongside.
  Documented in `USERSGUIDE.md` and `REALISMGUIDE.md`.
- [x] **Database targets** (SQLite/Postgres) and streaming insert for very large datasets.
  Added `db_exporter.py` with `DatabaseExporter` class supporting streaming inserts to:
  - PostgreSQL (via psycopg2)
  - SQL Server (via pyodbc)
  - MariaDB/MySQL (via pymysql)
  - DuckDB (via duckdb-engine)
  - SQLite (via stdlib `sqlite3`, no extra dependencies)
  Tables auto-created with appropriate types, indexes on key columns, batch inserts
  configurable via `db_batch_size`. New output formats: `postgresql`, `sqlserver`,
  `mariadb`, `duckdb`, `sqlite`. CLI params: `--db-host`, `--db-port`, `--db-name`, `--db-user`,
  `--db-password`, `--db-table-incidents`, `--db-table-phone`, `--db-schema`,
  `--db-batch-size`, `--db-if-exists`, `--no-db-indexes`. Documented in
  `USERSGUIDE.md`.
- [x] **Data governance manifest.** Emit a sidecar metadata file (seed, params, config hash,
  schema version, generation timestamp) with every export for reproducibility/auditing.
  Added `manifest.py` with `Manifest` dataclass capturing seed, rows, dataset, output format,
  area query, date range, ID format, personnel pools, shift preset, realism config hash,
  max memory bytes, schema hash, datasets generated, row/column counts, and platform info.
  Written as `{output_stem}_manifest.json` for all file-based formats (CSV, Parquet, JSON,
  YAML). Includes `package_version`, `python_version`, `platform`, and `generated_at` for
  full reproducibility. Documented in `USERSGUIDE.md` with field reference table.
- [x] **`config/example_params` parity.** Add a TOML example alongside JSON/YAML, and a
  params-driven CI regression run. Created `config/example_params.toml` with a distinct
  example configuration; all three formats (JSON/YAML/TOML) load and round-trip via the CLI
  `--params` and `--save-params` flags. Added a `params-regression` CI job that exercises
  each example file and verifies TOML round-trip.
- [x] **Packaging/distribution.** Publish on PyPI and/or containerize; add a `uv.lock`-driven
      Docker build and a `SynthCCD serve` (FastAPI) entrypoint for a hosted API.
      Created `Dockerfile` (multi-stage build), `docker-compose.yml` (with API server and
      generation job profiles), `.dockerignore`, added `fastapi`, `uvicorn`, `pydantic` to
      dependencies, and new `SynthCCD-serve` entry point in `pyproject.toml` pointing to
      `serve.py` with endpoints: `/health`, `/schema`, `/generate`, `/generate/stream`.
- [x] **Schema evolution** (pydantic models for `GenerationRequest`/`RealismConfig`) to
  formalize validation and produce versioned output schemas.
  Added `schema.py` with pydantic v2 models: `GenerationRequest`, `RealismConfig`, `ShiftConfig`, `Shift`, `TimeProfileIntervals`, `DispatchInitFraction`, `PhoneMetrics`, `OutputSchema`, `SchemaVersion`. Enums for all config types (`OutputFormat`, `DatasetKind`, `IdFormat`, `DatabaseDialect`, `ShiftPreset`, `IfExistsMode`). Full validation including weight sums, date ranges, reserved names, database connection requirements, and seasonal multipliers. 94% test coverage with `tests/test_schema.py` (33 tests). Replaces runtime validation in `config.py` with type-safe declarative models.
- [x] **Long-form user's guide.** `USERSGUIDE.md` / `REALISMGUIDE.md` currently cover quick
  start, CLI, configuration, and realism defaults. A fuller "getting started" guide with
  tutorials (first 911 dataset, tuning realism to a center, large-scale cloud runs) plus a
  reference-style API section and FAQ would serve new operators end-to-end.
  **Completed:** Added 5 tutorials (first dataset, tuning realism, large-scale cloud runs,
  geospatial analysis, database pipeline), full Python API reference with all classes/methods/enums,
  50+ FAQ entries, and comprehensive Realism Tuning Guide with SQL queries for parameter extraction,
  comparison methodology, common scenarios, and sensitivity analysis.

---
## Version 0.9.0 Release Preparation

- [x] Version bump to 0.9.0 in `pyproject.toml`
- [x] CHANGELOG.md updated with 0.9.0 release notes
- [x] All tests passing (270 tests, 81.59% coverage)
- [x] Lint/type checks passing (`ruff check .`, `ty check src/`)

---
## Future Enhancements (Post-0.9.0 / v1.0 Roadmap)

### Core Functionality
- [ ] **P1 — Business/landmark indicator column.** AGENTS.md: "If an address is a business address or a known landmark then that should be reflected in a column on its own." Requires mapping `amenity`/`shop`/`tourism` OSM tags onto address results.
- [x] **P1 — Geographic zone multipliers** (URBAN/SUBURBAN/RURAL) applied to travel time.
  Implemented via `zone_travel_multipliers` in realism config and OSM-based zone
  classification on the `Address` model (see the checked item under "Realism
  Improvements" above); kept here as a reference to the completed work.
- [ ] **P2 — Multi-agency incidents with unit counts.** Extend current assist problem types to full multi-record incidents where one call spawns LAW+FIRE+EMS records with unit counts and availability tracking.
- [ ] **P2 — Cadence/queueing simulation.** Constrained simulation with unit availability queues (simpy) for dispatch realism. Prototype at P2/P3.
- [ ] **P2 — Weather and seasonal correlation enhancements.** Current seasonal multipliers are static; integrate real weather data (temperature, precipitation) to drive problem type correlations dynamically.
- [ ] **P2 — Timezone-aware timestamps.** Support non-UTC timestamps and hourly-metric localization for deployments outside single timezone.
- [x] **P2 — Population-based phone-metrics volume.** Added `--population` flag to derive
  phone-metrics call volume from service-area population (calls per 1,000 residents per year)
  instead of the incident row count. Also added non-emergency floor constraint ensuring
  non-emergency calls always exceed emergency calls (ratio ≥ 1.2×). Added `total_emergency_calls`,
  `total_nonemergency_calls`, and `total_calls` aggregate columns to the phone-metrics output.
  Schema version bumped to 1.1.
- [x] **P2 — SQLite database target.** Add SQLite as a lightweight database export option alongside PostgreSQL/SQL Server/MariaDB/DuckDB.
  Added `SQLITE` to `OutputFormat`/`DatabaseDialect` (config + pydantic schema), a file-based
  `_create_sqlite_engine()` in `db_exporter.py` (stdlib `sqlite3` driver, `db_name` defaults to
  `{output_stem}.sqlite3` in `output_dir`, no host/user/password required), SQLite branches in
  `_table_exists`/`_drop_table`/`_create_index`/`_get_column_types`, schema-awareness (SQLite has
  no schemas; `db_schema` is ignored with a warning), and a per-statement batch cap
  (`999 // columns`) honoring SQLite's `SQLITE_MAX_VARIABLE_NUMBER` bound-parameter limit.
  Full CLI support: `--format sqlite` plus the new `--db-*` flags (`--db-host`, `--db-port`,
  `--db-name`, `--db-user`, `--db-password`, `--db-table-incidents`, `--db-table-phone`,
  `--db-schema`, `--db-batch-size`, `--db-if-exists`, `--db-dialect`, `--no-db-indexes`),
  params-file keys, and Python API (`OutputFormat.SQLITE`). End-to-end covered by
  `tests/test_db_exporter.py` (round-trip, if-exists modes, schema ignore, indexes, engine paths),
  `tests/test_config.py`, `tests/test_schema.py`, `tests/test_cli.py`, and
  `tests/test_application.py`; documented in `USERSGUIDE.md`.

### Usability / Developer Experience
- [x] **P2 — `config/example_params` parity.** Add TOML example alongside JSON/YAML, and params-driven CI regression run. Created `config/example_params.toml` with a distinct example configuration; all three formats (JSON/YAML/TOML) load and round-trip via the CLI `--params` and `--save-params` flags. Added a `params-regression` CI job that exercises each example file and verifies TOML round-trip.
- [ ] **P2 — PyQt6 GUI.** Requires re-adding `pyqt6` dependency; desktop GUI for non-technical operators. **Deferred** — not being pursued for now.
- [x] **P2 — Param file generation CLI.** `SynthCCD generate --save-params my_run.yaml`
      writes the effective parameters (CLI flags merged over any `--params` file) to a JSON/YAML/TOML
      params file and exits without generating. Canonical `GenerationRequest` keys are serialized
      (enums/paths/dates to plain values), `None` values are dropped, and the file round-trips
      through `--params`. Covered by `tests/test_cli.py` (all three formats, round-trip, CLI
      short-circuit, params-file merge, help listing).
- [x] **P2 — Config validation CLI.** `SynthCCD validate-config path/to/config.yaml` parses and
      validates one or more realism config files without generating data, reusing the
      `RealismConfig.from_yaml` validation rules (weight sums, time-profile keys,
      dispatch-init-fraction bounds, phone-metric bounds, shift config, name locales). Prints
      `OK` per file, exits 1 on any invalid file, exits 2 on argument errors. Covered by
      `tests/test_cli.py` (valid, invalid YAML, validation error, missing file, mixed paths,
      help listing) and documented in `USERSGUIDE.md` and `REALISMGUIDE.md`.
- [x] **P2 — Schema export CLI.** `SynthCCD schema --format json|yaml --dataset incidents`
      exports the output schema definition (column names and dtypes per dataset, schema
      `version`, deterministic `schema_hash` matching the manifest/Parquet metadata hash, and
      package/environment provenance) without generating data or fetching addresses. Probes via
      `build_preview_datasets` (single-row, static address pool) so the definition reflects
      `--config`, `--id-format`, `country`, and emergency-number overrides; supports
      `--output` to write to a file, exit 2 on an unsupported format, exit 1 on an invalid
      config. Covered by `tests/test_cli.py` (JSON/YAML/all/id-format/file/format-error/
      config-error/help) and `tests/test_describe.py`; documented in `USERSGUIDE.md`.
- [x] **P2 — International emergency number support.** Customize volume column names for emergency/non-emergency lines per country. Current schema hardcodes US/Canada 911 terminology (e.g., `nine_one_one_calls_received`, `non_emergency_calls_received`). Need configurable emergency number definitions per locale: US/Canada (911), UK (999/112), Ireland (999/112), France (112, 114 for hearing-impaired, 15 SAMU, 17 Police, 18 Fire, 191 Aviation, 196 Maritime), Germany (112/110), etc. Would require: configurable emergency number registry per country/region, dynamic column naming in phone metrics output, per-number volume fractions/abandonment rates/answer-time thresholds in realism config, and locale-aware CLI params (e.g., `--country IE` or `--emergency-numbers "999,112"`). **Completed:** Registry with 26 countries in `emergency_numbers.py`, dynamic column naming via `column_prefix()`, `--country`/`--emergency-numbers`/`--include-10-digit-emergency` CLI flags, per-line overrides in `phone_metric_lines` realism config section.
- [x] **P2 — Emergency number registry with US/Canada defaults.** Establish a built-in registry of emergency numbers per country with US/Canada (911) as defaults. Include a flag (e.g., `--include-10-digit-emergency`) to optionally include 10-digit emergency lines (e.g., 10-digit direct-dial numbers for specific agencies or regions) alongside the standard short codes. This would support countries where both short codes and full numbers are used, and allow modeling of legacy or transitional dialing patterns. **Completed:** Registry defaults US/CA to 911; `--include-10-digit-emergency` flag appends 10-digit lines from `TEN_DIGIT_LINES` registry; override via `--emergency-numbers` for custom short codes.

### Performance / Scalability
- [ ] **P2 — Incremental/streaming generation API.** Allow generating data in chunks via iterator without holding full DataFrames, for integration with streaming pipelines (Kafka, Flink, Spark).
- [ ] **P2 — Distributed generation.** Support for horizontal scaling across multiple workers/processes for 10M+ row datasets.
- [ ] **P2 — Columnar statistics pre-computation.** Pre-compute column statistics during generation for faster downstream analytics (min/max/null counts per column).

### Data Quality / Realism
- [x] **P2 — Correlation between fields.** Implemented geographic zone (URBAN/SUBURBAN/RURAL) correlation with travel time via OSM-based zone classification and configurable `zone_travel_multipliers` (URBAN=0.8, SUBURBAN=1.0, RURAL=1.5). Priority-weighted time distributions already correlate priority with interview/dispatch/turnout/travel times via `TIME_PROFILES` per agency/priority.
- [x] **P2 — Person name diversity.** Added `name_locales` realism-config section and `PersonnelNameGenerator`: country-matched Faker-locale blends derived from the geocoded OSM region (with a weighted multi-ethnic US default), per-country overrides, CJK family-name-first ordering, and `resolved_country()` on address providers persisted in the address-cache `.meta.json` sidecar. Replaces the fixed `en_US` roster.
- [x] **P2 — Call duration correlation with problem type.** Complex problems (e.g., "Active Shooter") have longer phone durations on average. Added `PROBLEM_PHONE_MULTIPLIERS` in `constants.py` with per-problem multipliers (e.g., Active Shooter=2.5, Cardiac Arrest=1.6, Noise Complaint=1.0). Integrated into `RealismConfig` as `problem_phone_multipliers` with YAML serialization. Incident generator applies multipliers to `phone_mean` per-incident based on selected `problem_nature`, creating realistic correlation where high-acuity problems yield longer call durations within each priority level.
- [x] **P2 — Non-emergency floor constraint.** Added `NON_EMERGENCY_FLOOR_RATIO` (1.2) in
  `constants.py` ensuring non-emergency received calls always exceed emergency calls per
  hour. After independent Poisson draws, non-emergency is floored to at least 1.2× total
  emergency, reflecting the universal PSAP pattern.
- [ ] **P2 — Shift handoff effects.** Model increased response times during shift change periods.
- [ ] **P2 — Parameterize phone answer times with a mean-seconds lognormal, like
      `phone_duration_seconds`.** The incident generator draws call durations from a
      *mean*-seconds lognormal (`_lognormal_seconds`: `mu = ln(mean) − sigma²/2`), but the
      phone-metrics answer-time keys (`nine_one_one_answer_time_mu` /
      `nine_one_one_answer_time_sigma`, `non_emergency_answer_time_mu` / `sigma`) are raw
      lognormal log-scale/shape values, so operators must translate seconds to log-space.
      Switch them to the same mean-seconds convention (e.g. `nine_one_one_answer_time_mean`).
      Note: emergency (9-1-1) calls will typically have *lower* values than non-emergency
      — emergency lines are answered faster — which the current defaults (9-1-1 μ=1.80 vs
      non-emergency μ=1.70) invert and should be recalibrated when adopting mean-seconds.

### Integration / Ecosystem
- [x] **P2 — Parquet metadata embedding.** Embed generation metadata (seed, config hash, schema version) directly in Parquet file metadata for self-documenting files.
  Added `DATA_SCHEMA_VERSION` (constants.py), `Manifest.schema_version` + `Manifest.to_kv_metadata()`
  (namespaced `synth911:` string pairs, `None` dropped, counts excluded), `_write_parquet_with_metadata()`
  and `parquet_metadata=` params on `export_generated_data`/`export_chunked_generator` (footer metadata
  embedded at write time via `ParquetWriter` schema metadata, merged with pyarrow's `pandas` key;
  chunked mode derives `schema_hash` from the first chunk), and app.py now builds the manifest before
  export so Parquet footers carry the same provenance as the sidecar.
- [ ] **P2 — Cloud storage direct write.** Stream output directly to S3/GCS/Azure Blob without local staging.
- [ ] **P2 — Delta Lake / Iceberg table format.** Support writing to modern table formats for ACID transactions and time travel.
- [ ] **P2 — Prometheus metrics endpoint.** Expose generation metrics (rows/sec, memory usage, queue depths) for monitoring.

### Testing / Quality
- [x] **P2 — Property-based testing.** Added hypothesis-based tests for statistical properties
  (distribution shapes, weight sums, temporal patterns). `tests/test_properties.py` (14 tests):
  lognormal timing draws respect clip bounds and track configured per-agency/per-priority
  means, every weight table normalizes to 1.0 (including full YAML round trips with randomized
  weights), generated category fractions converge to config weights (chi-square goodness of
  fit), call-lifecycle timestamps stay strictly ordered inside the requested window with exact
  derived-column deltas, call hours track arbitrary diurnal weights, and phone metrics keep
  abandonment ≤ received, monotone answer-time curves, and volume/abandonment rates tracking
  their configured targets. `hypothesis` added to the dev dependency group; `.hypothesis/`
  cache directory gitignored.
- [x] **P2 — Regression test suite.** Automated comparison of key statistics across versions
  to detect realism regressions. New `synth911gen3.regression` module computes a compact
  statistical *signature* of generated data (agency/priority/reception/disposition fractions,
  per-cell timing means, hourly call-shape, phone-metrics rates) and compares it against a
  committed baseline (`tests/regression_baseline.json`) with configurable tolerances
  (`RegressionTolerances`). `tests/test_regression.py` (20 tests) regenerates the reference
  datasets from a fixed seed and fails when the realism defaults drift; the gate also
  validates baseline schema/hash metadata and comparator behavior (fraction/mean/rate drift,
  missing keys, custom tolerances, JSON round-trips). `scripts/update_regression_baseline.py`
  refreshes the baseline after intentional realism changes and prints a value diff for
  review.
- [ ] **P2 — Load testing benchmarks.** CI benchmarks for generation throughput at various scales (10K, 100K, 1M, 10M rows).

### Documentation
- [ ] **P2 — Publish Sphinx docs to the LLC website.** The Sphinx site builds cleanly via
  `scripts/build_docs.py` into `output/docs/`. After the blog post is written, copy the
  built HTML to the LLC website (dunsworth-mann.com/SynthCCD). The `docsrc/CNAME` and
  `_static/404.html` are ready. The GitHub Pages deploy workflow can be repurposed or
  removed once the site is hosted externally.
- [ ] **P2 — Video tutorials.** Short screen-capture demos for tutorials.
- [x] **P2 — Architecture decision records (ADRs).** Document key design decisions (vectorization approach, pydantic vs dataclass, etc.).
  Added `docs/adr/` with a format/index README plus ten records: `0001` vectorized
  numpy pipeline, `0002` dual config models (pydantic at the edges, slotted dataclasses
  at runtime), `0003` OSM address provider with Parquet cache, `0004` memory-bounded
  chunked export, `0005` YAML realism config with weight tables, `0006` lognormal
  per-agency/per-priority time profiles, `0007` seeded reproducibility + manifest +
  Parquet metadata + regression baseline, `0008` crew-rotation shift model, `0009`
  internationalization (emergency-number registry, name locales), `0010` pluggable
  export layer with database targets.
- [x] **P2 — Contribution guide.** Added `CONTRIBUTING.md` covering development setup, TLS-proxy notes, code style (ruff/ty), testing and coverage gates, documentation maintenance, commit discipline, the PR process, and the permissions summary.

---

## Refactor Backlog: Efficiency, Speed, and Security

Generated 2026-08-17 from a full codebase audit. Items ordered by combined impact
(security risk × affected lines × performance cost). Each item notes the file,
the specific problem, and the fix direction.

### Security (P0)

- [x] **P0 — Remove `params_file` from the API model.**
  `serve.py:36-38` accepts an arbitrary server-side file path from HTTP clients.
  An attacker can read any YAML/JSON/TOML file the process can access. Fix:
  drop the field entirely — callers should inline the config in the JSON body.
  **Done:** Removed `params_file` field, `load_params_file` import, and
  file-loading logic from `_build_request()`. Updated model docstring.
  CLI and TUI local params-file support unaffected.

- [x] **P0 — Stop interpolating identifiers via f-strings in `db_exporter.py`.**
  `db_exporter.py:301-314` uses `f'DROP TABLE IF EXISTS "{table_name}"'`.
  A table name containing `"` breaks out of the quoting. Fix: validate
  `db_table_incidents`, `db_table_phone`, and `db_schema` against a strict
  `^[a-zA-Z0-9_]+$` pattern at config load time, before they reach SQL.
  **Done:** Added `_validate_identifier()` helper with `^[a-zA-Z_][a-zA-Z0-9_]*$`
  regex, wired into `_drop_table()` and `_create_index()` before any f-string
  DDL construction. 18 new tests in `test_db_exporter.py` covering valid names,
  SQL injection vectors (semicolons, quotes, UNION, dots, hyphens, unicode,
  path traversal), and integration with `_drop_table`/`_create_index`.

- [x] **P0 — Stop leaking exception details from the API.**
  `serve.py:281-282` returns `f"Internal error: {exc}"`. Fix: log the full
  exception server-side, return a generic 500 message to the client.
  **Done:** All three endpoints (`/schema`, `/generate`, `/generate/stream`)
  now use `except Exception:` with `logger.exception()` (captures traceback
  to stderr) and return `{"detail": "Internal server error"}`. Known domain
  exceptions (`AddressLookupError`, `ExportError`, `ValidationError`) still
  surface their messages at 400 — those are user-facing by design.

- [x] **P1 — Add rate limiting and bind to `127.0.0.1` by default.**
  **Done:** In-memory sliding-window rate limiter (30 req/60 s per IP)
  wired as Starlette middleware; returns 429 with `Retry-After` header.
  `run()` now binds `127.0.0.1:8000` by default.  Override with
  `SYNTHCCD_SERVE_HOST` / `SYNTHCCD_SERVE_PORT` env vars, or use
  `uvicorn synth911gen3.serve:app --host … --port …` directly.
  3 new tests in `test_serve.py`.

- [x] **P1 — Guard `truststore.inject_into_ssl()` against re-entry.**
  `tls.py:37` patches the global `ssl` module with no guard. Fix: add a
  process-level flag so it's only applied once. Document that this must
  run at startup, not per-request.
  **Done:** Added module-level `_TRUST_INJECTED` flag in `tls.py`;
  `maybe_inject_system_trust()` short-circuits once injected and sets the
  flag only after a successful `truststore.inject_into_ssl()`. Docstrings
  now state the once-per-process, run-at-startup contract. Covered by
  `tests/test_tls.py` (including new `test_injects_system_trust_only_once`
  verifying a triple call performs a single injection, with an autouse
  fixture resetting the flag between tests).

- [ ] **P2 — Restrict `output_dir` and `realism_config_path` in the API.**
  `serve.py:48,64` pass caller-controlled paths directly to filesystem I/O.
  Fix: validate against an allowed base directory or reject them in the API
  model (use the `/tmp` default only).

### Hot-Path Speed (P0)

- [ ] **P0 — Vectorize seasonal problem-nature selection.**
  `incidents.py:503-513` has a per-row Python loop with per-element dict
  lookups and array copies — O(n × P) Python iterations inside the innermost
  generation loop. For 1M rows this is the single biggest bottleneck. Fix:
  pre-build a `(num_problems, 4)` seasonal-multiplier matrix, compute all
  weights via broadcasting per-season, and use `rng.choice` with a 2D
  probability array (batch per-season group).

- [ ] **P0 — Vectorize problem-phone-multiplier and zone-travel-multiplier lookups.**
  `incidents.py:518-524, 542-545` both use Python list comprehensions with
  dict lookups per element. Fix: build integer index arrays once (name →
  ordinal mapping), pre-stack multipliers into a 1-D lookup vector, and
  use `np.take` (C-optimized).

### Efficiency / Memory (P1)

- [ ] **P1 — Eliminate double `_prepare()` in the chunk pipeline.**
  `incidents.py:333` (`resolve_chunk_rows`) and `incidents.py:383`
  (`generate_chunks`) both call `_prepare()`. When callers probe then
  generate, the address-fetch + personnel-build runs twice. Fix: expose a
  `generate_chunks(request, prepared=None)` overload that accepts
  pre-computed state, or cache `_prepare()` results on the instance.

- [ ] **P1 — Replace `frame.copy()` in `_records_for_serialization`.**
  `exporters.py:76` copies the entire DataFrame just to format datetime
  columns. For millions of rows this doubles export peak memory. Fix: use
  `frame.assign(**{col: frame[col].dt.strftime(...)})` for only the datetime
  columns (returns a new frame without copying non-datetime data).

- [ ] **P1 — Vectorize GeoJSON feature building.**
  `exporters.py:85-107` uses `frame.iterrows()` — notoriously slow (creates
  a Series per row). Fix: `frame.to_dict(orient="records")` then filter
  and build features in a single list comprehension, or use vectorised
  `frame["latitude"].values` / `frame["longitude"].values` for geometry.

- [ ] **P1 — Cache `_to_ascii()` via a pre-built translation table.**
  `names.py:55-96` iterates character-by-character with ordinal branching.
  Called for every generated name. Fix: build a `str.maketrans()` table at
  module load (C-optimized `str.translate`), with `unicodedata.normalize`
  as the fallback. Roughly 10× faster for typical name strings.

- [ ] **P1 — Cache `_zipf_weights()` by count.**
  `incidents.py:123-126` recomputes weights on every call. Fix: module-level
  `dict[int, np.ndarray]` cache. Weights are pure functions of `count`.

- [ ] **P1 — Cache or lazy-init `RealismConfig.__post_init__` defaults.**
  `realism_config.py:82-118` deep-copies all default dicts on every
  construction (which happens during `validate()`). Fix: use `None`
  sentinels and resolve at access time, or cache the frozen defaults
  as a class attribute.

- [ ] **P1 — Add a context manager to `OpenStreetMapAddressProvider`.**
  `addresses.py:257-263` creates an `httpx.Client` but never closes it.
  Fix: implement `__enter__`/`__exit__` and a `close()` method. Document
  lifecycle expectations.

- [ ] **P1 — Use atomic writes for address cache.**
  `addresses.py:357-376` writes parquet then metadata non-atomically. Fix:
  write to a temp file then `os.rename()` (atomic on POSIX).

### Code Quality (P2)

- [ ] **P2 — Consolidate duplicate enums.**
  `config.py:47-67` and `schema.py:30-45` define `OutputFormat`,
  `DatasetKind`, `IdFormat`, and `DatabaseDialect` independently. Fix:
  define them once in `constants.py` (or a dedicated `_enums.py`) and
  import everywhere.

- [ ] **P2 — Consolidate duplicate validation.**
  `config.py:171-221` and `schema.py:221-272` both validate output paths,
  PSAP agency, dates, and database options. Fix: pydantic validators in
  `schema.py` are the more maintainable layer; have `config.py` delegate
  to the schema model and remove the redundant checks.

- [ ] **P2 — Move `from copy import copy` and `PSAP_AGENCY_FILTERS` to top-level.**
  `incidents.py:257,268` import inside `_prepare()`. Python caches modules,
  but the pattern is inconsistent with the rest of the file. Fix: move
  to top-of-file imports.

- [ ] **P2 — Lazily init Faker instances in `PersonnelNameGenerator`.**
  `names.py:296-310` creates ~13 Faker instances at init time (one per
  locale in the blend). Fix: cache by `(locale, seed)` in a class-level
  dict, or lazy-init on first `_draw()`.

- [ ] **P2 — Estimate bytes-per-row without a probe run.**
  `incidents.py:336-367` generates real records just to measure memory, then
  discards them. Fix: compute a statistical estimate from column dtypes
  and `n`, or cache the per-row size across calls.

---

## Licensing System

Offline-first license key system using Ed25519 digital signatures. The package
embeds only a public verification key; the signing key stays with the developer.
No phone-home, no hardware binding — compatible with air-gapped public-safety
networks.

### Design

**Key format:** Each license is a base64url-encoded blob: `header.payload.signature`.
- Header: `{"alg": "Ed25519", "typ": "SynthCCD-License"}`
- Payload: `{"sub": "Licensee Name", "exp": "2027-12-31", "tier": "commercial",
  "nonce": "random-hex-16", "features": ["phone_metrics", "db_export"]}`
- Signature: Ed25519 over `base64url(header).base64url(payload)`

**Tiers:** `developer` (unlimited, expires 9999-12-31), `personal` (non-commercial),
`commercial` (organization use), `enterprise` (multi-seat, feature-gated).

**Verification:** Offline. Parse the blob, verify the Ed25519 signature against the
embedded public key, check expiry with a 30-day grace period for clock skew. The
public key is a hardcoded constant in `license.py` — the private key never touches
the package or the repository.

**Caching:** Validated licenses are cached in `~/.synth911gen3/license.cache` (JSON
with the original key, validation timestamp, and machine fingerprint). Re-checked on
version upgrades. Cache is invalidated if the package version changes.

**Integration points:** License is validated on the first call to `generate`, `tui`,
or `serve`. Invalid/missing license raises `LicenseError` with a clear message pointing
to `SynthCCD license install`. Valid but expired licenses continue to work during the
30-day grace period with a stderr warning.

### Tasks

- [ ] **P1 — Create `license.py` module.**
  Ed25519 verification using `cryptography` library (already a transitive dep via
  `pydantic`). Public key constant, `LicensePayload` dataclass, `verify_license(key)`
  function returning the parsed payload or raising `LicenseError`. 30-day grace period.
  `load_cached_license()` / `save_license_cache()` for `~/.synth911gen3/license.cache`.
  Module-level `_DEV_KEY` constant for the developer's own license bypass (so the dev
  never needs to install a key file). Covered by `tests/test_license.py`.

- [ ] **P1 — Create `scripts/gen_license.py` signing tool.**
  Offline CLI that reads the Ed25519 private key from a file (or generates a new
  keypair), accepts `--name`, `--exp`, `--tier`, `--features` flags, and prints
  the base64url license key to stdout. Private key never leaves the developer's
  machine. Supports `--gen-keypair` to produce `synth911.key` (private) and
  `synth911.pub` (public, to embed in `license.py`).

- [ ] **P1 — Add `SynthCCD license` CLI command.**
  Subcommands: `install <key>` (validates and writes to cache), `info` (shows
  current license status, expiry, tier), `verify` (re-validates the cached key).
  Wired through `cli.py` as a Typer sub-app. Covered by `tests/test_cli.py`.

- [ ] **P1 — Add `--license` flag and `SYNTHCCD_LICENSE` env var.**
  Accept a license key directly on `generate`/`tui`/`serve` without installing
  to the cache. Env var provides a non-interactive path for CI/Docker. If both
  are present, the flag takes precedence.

- [ ] **P1 — Gate generation on license.**
  `Synth911Application.generate()` calls `license.verify_license()` before
  proceeding. Invalid key → `LicenseError` (exit 2, clear message). Missing key
  → same. Expired within grace → warning but proceed. Expired past grace → block.

- [ ] **P1 — Add `tests/test_license.py`.**
  Tests: valid key verification, expired key rejection, expired-within-grace
  acceptance, tampered payload rejection, malformed base64 rejection, missing key
  error, cache round-trip, developer key bypass, feature-gating (enterprise-only
  features blocked for personal tier).

- [ ] **P2 — Add license key to manifest.**
  `manifest.py` includes license tier and expiry (not the key itself) in the
  sidecar metadata for audit trails.

- [ ] **P2 — Gate database export and API server on license tier.**
  `db_exporter.py` and `serve.py` check `features` list on the license payload.
  Enterprise features (PostgreSQL, SQL Server) require `commercial` or `enterprise`
  tier. The API server requires at least `commercial` tier.

- [x] **P2 - Reduce `postal_code` in US to just the 5-digit ZIP code.**
  Currently, the ZIP code for U.S. addresses can express as either a 5-digit ZIP code or a 9-digit ZIP+4 code. That should be standardized as a 5-digit ZIP code. Other countries should not be impacted. e.g. (L4T 2D6) should be a valid Canadian Postal Code.
  **Done:** Added `normalize_postal_code()` in `domain.py` (US-only `DDDDD-DDDD` ZIP+4
  pattern truncated to the 5-digit ZIP; all other formats pass through unchanged, including
  Canadian `L4T 2D6`, UK `SW1A 2AA`, and plain 5-digit values). Applied in
  `Address.__post_init__`, so OSM-fetched addresses, cached addresses (including old caches
  holding 9-digit values), and direct constructions are all normalized. Covered by new tests
  in `tests/test_addresses.py` (direct Address, OSM `addr:postcode`, cache load, non-US
  passthrough).

---

