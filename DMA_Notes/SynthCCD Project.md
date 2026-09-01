---
type: project-status
project: SynthCCD
phase: Development
owner: Tony Dunsworth
last_updated: 2026-08-31
tags:
  - project
  - status
  - synth911
  - synthetic-data
  - python
  - "911"
  - 9-1-1
---

# SynthCCD

## Current Phase

Development — v0.9.5 released, working toward v1.0. Core generation pipeline is complete and production-ready. Security audit resolved, CI pipeline active, 270+ tests at ~94% coverage. Remaining work is on v1.0 roadmap items (business/landmark indicator, multi-agency incidents, queueing simulation, PyQt6 GUI, and performance optimizations).

## Status

- [x] On Track
- [ ] At Risk
- [ ] Blocked

## Objectives

Build a TUI-first synthetic data generator that emulates 9-1-1 CAD (Computer-Aided Dispatch) incident records and hourly phone-center call counts. The generator produces realistic, configurable datasets for testing analytics pipelines, training personnel, and validating reporting systems.

**Core Goals:**
1. Simulate CAD incident data with full lifecycle timestamps, agency/priority/problem profiles, realistic address generation via OpenStreetMap, and configurable personnel modeling
2. Simulate hourly call-count metrics (9-1-1 received/abandoned, non-emergency received/abandoned, outbound)
3. Ensure all distributions (elapsed times, call volumes, disposition mixes) are realistic and configurable per agency/priority/geographic zone
4. Export to CSV, Parquet, JSON, YAML, pandas, polars, GeoJSON, Shapefile, and direct database targets (PostgreSQL, SQL Server, MariaDB, DuckDB, SQLite)
5. Provide Typer CLI, Textual TUI, and FastAPI REST API entrypoints
6. Scale from hundreds to millions of rows with memory-bounded chunked export
7. Support international emergency numbers (26 countries) and country-matched personnel name generation

## Milestones

| Milestone | Due Date | Status |
|-----------|----------|--------|
| v0.1.0 — Initial release (all AGENTS.md goals) | 2026-08-09 | ✅ Complete |
| v0.9.0 — Release candidate (schema evolution, geospatial, DB exports, manifest) | 2026-08-10 | ✅ Complete |
| v0.9.5 — Realism improvements (problem-phone correlation, international names, SQLite, Parquet metadata) | 2026-08-15 | ✅ Complete |
| Security audit resolution (path traversal, SQL injection, exception leakage, rate limiting) | 2026-08-17 | ✅ Complete |
| CI pipeline (GitHub Actions: pytest, ruff, ty, dependency audit) | 2026-08-17 | ✅ Complete |
| Answer-time calibration CLI & NENA 020.1-2020 alignment | 2026-08-31 | ✅ Complete |
| Load testing benchmarks (10K–10M row throughput) | 2026-08-31 | ✅ Complete |
| Prometheus metrics endpoint | 2026-08-31 | ✅ Complete |
| Bundled CLI samples (small/midsize/large centre personas) | 2026-08-31 | ✅ Complete |
| Sphinx HTML API documentation | 2026-08-31 | ✅ Complete |
| v1.0 — Business/landmark indicator column | TBD | ☐ Not Started |
| v1.0 — Multi-agency incidents with unit counts | TBD | ☐ Not Started |
| v1.0 — Cadence/queueing simulation (simpy) | TBD | ☐ Not Started |
| v1.0 — Vectorize hot-path seasonal/zone/phone-multiplier lookups | TBD | ☐ Not Started |
| v1.0 — PyQt6 GUI for non-technical operators | TBD | ☐ Deferred |
| v1.0 — Publish Sphinx docs to LLC website | TBD | ☐ Not Started |

## Blockers

<!-- What's preventing progress? -->

- [ ] Hot-path Python loops in seasonal problem-nature selection, problem-phone multipliers, and zone-travel multipliers (EFF-01/02/03 in REVIEW.md) — performance bottleneck at 1M+ rows
- [ ] Duplicate enum definitions and validation logic between `config.py` and `schema.py` (QA-01/QA-02 in REVIEW.md)
- [ ] `httpx.Client` not closed after use in address provider (QA-09) — connection pool leak
- [ ] TLS-inspecting proxy requires `SYNTHCCD_SYSTEM_TRUST=1` env var on this machine — affects OSM lookups and `uv sync`

## Next Steps

1. **Vectorize hot-path lookups** — Replace per-row Python loops for seasonal multipliers, problem-phone multipliers, and zone-travel multipliers with numpy broadcasting and integer-index lookup vectors (EFF-01/02/03)
2. **Consolidate enums and validation** — Move canonical enums to a shared module; have `config.py` delegate to pydantic validators in `schema.py` (QA-01/02)
3. **Implement business/landmark indicator column** — Map OSM `amenity`/`shop`/`tourism` tags onto address results (AGENTS.md goal, TODO P1)
4. **Multi-agency incidents with unit counts** — Extend assist problem types to full multi-record incidents with unit counts and availability tracking (TODO P2)
5. **Prototype queueing simulation** — Constrained simpy-based unit availability queues for dispatch realism (TODO P2)
6. **Publish Sphinx docs to dunsworth-mann.com/SynthCCD** — Copy built HTML to LLC website (TODO P2)
7. **Cache `_zipf_weights` by count** — Module-level dict to avoid recomputation (EFF-10)
8. **Add `httpx.Client` context manager** — Implement `__enter__`/`__exit__` or `close()` on `OpenStreetMapAddressProvider` (QA-09)

## Resources

- [[synth911gen3/README.md]] — Project overview, quick start, CLI reference
- [[synth911gen3/AGENTS.md]] — Agent instructions, goals, tech stack, permissions
- [[synth911gen3/TODO.md]] — Full backlog with priorities (P0/P1/P2)
- [[synth911gen3/CHANGELOG.md]] — Release history (v0.1.0 → v0.9.5)
- [[synth911gen3/REVIEW.md]] — Code audit: 28 findings (6 security, 10 efficiency, 12 quality)
- [[synth911gen3/USERSGUIDE.md]] — CLI flags, TUI fields, params files, output schema, Python API, FAQ
- [[synth911gen3/REALISMGUIDE.md]] — YAML realism config, validation rules, default distributions
- [[synth911gen3/CONTRIBUTING.md]] — Dev setup, code style, testing gates, PR process
- [[synth911gen3/pyproject.toml]] — Dependencies, entry points, coverage config
- [[synth911gen3/Dockerfile]] — Multi-stage Docker build
- [[synth911gen3/docker-compose.yml]] — API server + generation job profiles
- [[synth911gen3/config/]] — Example params (JSON/YAML/TOML) and realism configs
- [[synth911gen3/docs/adr/]] — 10 architecture decision records
- [[synth911gen3/future_work/]] — NENA/NFPA standards PDFs, compliance analysis scripts
- GitHub: https://github.com/trdunsworth/synth911gen3
- Previous version: https://github.com/trdunsworth/synth911gen2

## Log

### 2026-08-31
- Answer-time calibration CLI added (`SynthCCD calibrate-answer-time`)
- `validate-config` now checks answer times against published NENA targets
- 9-1-1 answer-time defaults recalibrated to exactly meet NENA 020.1-2020 (mean 7.44s, σ 0.79)
- Load testing benchmarks at 10K/100K/1M/10M row tiers
- Prometheus metrics endpoint (`GET /metrics`)
- Bundled CLI samples (small/midsize/large centre personas)
- DMA Theme applied to TUI (light/dark toggle)
- Agency-disciplined dispatcher consoles (auto/combined/two_way/three_way)
- Phone-metrics mean-duration columns per category

### 2026-08-17
- Full code audit completed (28 findings across security, efficiency, code quality)
- Security fixes: path traversal, SQL injection, exception leakage, rate limiting, TLS guard
- CI pipeline: GitHub Actions with pytest, ruff, ty, dependency audit
- Property-based testing (hypothesis) and regression suite added
- Sphinx HTML API documentation with autodoc + napoleon

### 2026-08-15
- v0.9.5 released: problem-phone correlation, international names, SQLite, Parquet metadata
- Answer-time config switched to mean-seconds convention
- Phone-metrics answer-time percentages now vary by hour

### 2026-08-10
- v0.9.0 released: schema evolution, geospatial exports, DB streaming, seasonal correlations
- Documentation split: USERSGUIDE.md + REALISMGUIDE.md
- 5 tutorials, full Python API reference, 50+ FAQ entries

### 2026-08-09
- v0.1.0 released: all AGENTS.md goals implemented
- Vectorized numpy pipeline (million-row scale)
- OSM address generation, YAML realism config, CLI/TUI/API entrypoints
