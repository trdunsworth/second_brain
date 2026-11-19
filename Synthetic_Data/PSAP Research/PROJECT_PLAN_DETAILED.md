# PSAP Research — Detailed Project Plan with Task Breakdown

> **Granular task breakdown with estimates, owners, dependencies, and acceptance criteria**

---

## Project Overview

| Metric             | Value                     |
| ------------------ | ------------------------- |
| **Total Duration** | 24 weeks (6 months)       |
| **Start Date**     | Week 1 (Jan 19, 2027)     |
| **Target End**     | Week 24 (Jun 30, 2027)    |
| **Team Size**      | 1-2 developers            |
| **Methodology**    | Iterative, 2-week sprints |
| **Review Cadence** | Bi-weekly sprint reviews  |

---

## Sprint Breakdown

### Sprint 0: Foundation (Week 1-2)

#### Goals
- Complete SynthGIS → SynthCCD integration
- Validate end-to-end data flow
- Establish CI/CD pipeline

#### Tasks

| ID | Task | Description | Effort | Owner | Dependencies | Acceptance Criteria |
|----|------|-------------|--------|-------|--------------|---------------------|
| S0-1 | SynthGISAddressProvider | Implement GPKG reader for SynthGIS layers in SynthCCD | 3 days | Dev 1 | SynthGIS GPKG output | Reads all NENA layers |
| S0-2 | CLI flags | Add `--synthgis-town` / `--synthgis-graph` to SynthCCD generate | 1 day | Dev 1 | S0-1 | Flags work, ignored when absent |
| S0-3 | Field mapping | NENA/CLDXF → SynthCCD address schema (Building/Floor/Unit/Room/Seat) | 2 days | Dev 1 | S0-1 | All sub-address fields populated |
| S0-4 | Routing graph loading | Load NetworkX graph from pickle | 1 day | Dev 1 | SynthGIS `--export-graph` | Graph loads, travel times work |
| S0-5 | Service boundaries & run cards | Load PSAP/Fire/Police/EMS polygons + run cards | 2 days | Dev 1 | SynthGIS GPKG layers | Boundaries load, point-in-polygon works |
| S0-6 | Integration test | town.gpkg → 1000 incidents → validate | 1 day | Dev 1 | S0-1 to S0-5 | `address_source='synthgis'`, boundaries attached |
| S0-7 | CI/CD pipeline | GitHub Actions: test, lint, type-check, build | 1 day | Dev 2 | - | Pipeline passes on main |
| S0-8 | Documentation update | Update both USERSGUIDE.md | 1 day | Dev 1 | S0-1 to S0-5 | Docs reflect new flags |

**Sprint 0 Deliverable**: `uv run SynthCCD generate --synthgis-town town.gpkg --rows 1000` works end-to-end

---

### Sprint 1: Simulation Engine Core (Week 3-4)

#### Goals
- Build core discrete event simulation engine
- Unit state machine with valid transitions
- Basic dispatch logic (nearest-available + run cards)

#### Tasks

| ID | Task | Description | Effort | Owner | Dependencies | Acceptance Criteria |
|----|------|-------------|--------|-------|--------------|---------------------|
| S1-1 | Event system | `SimulationEvent`, `EventType`, `EventQueue` (heapq) | 2 days | Dev 1 | - | Events ordered by timestamp |
| S1-2 | Unit state machine | 6 states, valid transitions, history | 3 days | Dev 1 | S1-1 | Invalid transitions rejected |
| S1-3 | Unit registry | All units + state + location + personnel | 2 days | Dev 1 | S1-2 | All units queryable by state |
| S1-4 | Incident manager | Lifecycle + parallel timeline | 3 days | Dev 1 | S1-1 | Call-taking + dispatch parallel |
| S1-5 | Dispatch logic | Nearest-available + run cards | 4 days | Dev 1 | S1-2, S1-3 | Units assigned per run card |
| S1-6 | Router integration | Travel time + turnout from SynthGIS graph | 2 days | Dev 2 | Phase 0 | Travel times match routing |
| S1-7 | Simulation clock | Discrete event time advancement | 1 day | Dev 1 | S1-1 | Clock advances to next event |
| S1-8 | Metrics collector | Hourly + per-incident metrics | 3 days | Dev 1 | S1-4 | Metrics match expected schema |
| S1-9 | Unit tests | 80%+ coverage on core | 3 days | Dev 2 | S1-1 to S1-8 | Coverage > 80% |
| S1-10 | Integration test | 1000 incidents end-to-end | 2 days | Dev 1 | S1-1 to S1-9 | Metrics match baseline |

**Sprint 1 Deliverable**: Engine processes 10,000 incidents in < 60 seconds with valid metrics

---

### Sprint 2: Staffing Scenario Framework (Week 5-6)

#### Goals
- Config-driven staffing scenarios (YAML)
- Scenario versioning & inheritance
- Dynamic staffing interface

#### Tasks

| ID | Task | Description | Effort | Owner | Dependencies | Acceptance Criteria |
|----|------|-------------|--------|-------|--------------|---------------------|
| S2-1 | Staffing schema | YAML schema with Pydantic validation | 2 days | Dev 1 | Sprint 1 | Schema validates all fields |
| S2-2 | Scenario loader | Parse YAML, resolve inheritance | 2 days | Dev 1 | S2-1 | `inherits` works, overrides apply |
| S2-3 | Scenario registry | Versioned scenarios, overrides | 2 days | Dev 1 | S2-2 | `registry.get('v1.2')` works |
| S2-4 | Dynamic staffing interface | `DynamicStaffingPolicy` ABC | 3 days | Dev 1 | Sprint 1 | `decide(context)` called each hour |
| S2-5 | Rule-based policy | `RuleBasedDynamicPolicy` with YAML rules | 2 days | Dev 1 | S2-4 | Rules fire at correct thresholds |
| S2-6 | ML policy scaffold | `MLStaffingPolicy` with sklearn interface | 3 days | Dev 2 | S2-4 | `model.predict()` called |
| S2-7 | Built-in templates | Baseline, peak overlay, dynamic, cross-staff | 2 days | Dev 1 | S2-2 | Templates load and run |
| S2-8 | Cross-staffing engine | Engine+Medic, Engine+Tender rules | 3 days | Dev 1 | Sprint 1 | Cross-staffing prevents double-assign |
| S2-9 | Minimum manning enforcement | Per-shift, per-station with overtime | 2 days | Dev 1 | Sprint 1 | Min manning enforced per shift |
| S2-10 | Fatigue/overtime model | Circadian + shift length + overtime | 3 days | Dev 2 | S2-4 | Fatigue affects response times |
| S2-11 | Scenario CLI | `psap compare-scenarios base.yaml variant.yaml` | 2 days | Dev 1 | S2-2 | CLI runs comparison |
| S2-12 | Validation tests | Valid transitions, no orphan units | 2 days | Dev 2 | S2-1 to S2-11 | All tests pass |

**Sprint 2 Deliverable**: Create variant scenario, run comparison, detect measurable difference

---

### Sprint 3: Experiment Runner & Statistics (Week 7-8)

#### Goals
- Controlled experiment framework
- Paired statistical comparison
- Parallel replication execution

#### Tasks

| ID | Task | Description | Effort | Owner | Dependencies | Acceptance Criteria |
|----|------|-------------|--------|-------|--------------|---------------------|
| S3-1 | Experiment class | Fixed volumes, varied staffing, n reps | 2 days | Dev 1 | Sprint 2 | `Experiment(config).run()` works |
| S3-2 | Experiment runner | Parallel replication with seed mgmt | 3 days | Dev 2 | Sprint 2 | 30 reps × 4 scenarios in < 2 hrs |
| S3-3 | Comparison report | Paired t-test, Wilcoxon, bootstrap CI | 3 days | Dev 2 | Sprint 3 | Report has paired t-tests, CI, Cohen's d |
| S3-4 | Metrics aggregation | Mean, median, percentiles, KS tests | 2 days | Dev 1 | Sprint 1 | Aggregated metrics match per-rep |
| S3-5 | Parallel execution | `ProcessPoolExecutor` with seed mgmt | 2 days | Dev 2 | Sprint 3 | Linear speedup with cores |
| S3-6 | Results serialization | Parquet + JSON metadata | 1 day | Dev 1 | Sprint 1 | Files load without error |
| S3-6 | Visualization helpers | Fractile curves, equity heatmaps | 2 days | Dev 2 | Sprint 3 | HTML report opens in browser |
| S3-7 | Experiment config schema | YAML defining volumes, scenarios, reps | 1 day | Dev 1 | Sprint 2 | Schema validates all fields |
| S3-8 | CLI command | `psap experiment run experiment.yaml` | 2 days | Dev 1 | S3-1 | CLI runs full experiment |
| S3-9 | Regression test | Baseline comparison in CI | 2 days | Dev 2 | Sprint 1 | CI catches regressions |

**Sprint 3 Deliverable**: Run `uv run psap experiment run config/experiments/staffing_comparison_001.yaml` → HTML report with paired t-tests

---

### Sprint 4: Advanced Operations Layers (Week 9-12)

#### Goals
- Dynamic traffic model
- Personnel fatigue & human factors
- Cascading incidents & multi-alarm
- NG911 i3 call flow (optional)

#### Tasks

| ID | Task | Description | Effort | Owner | Dependencies | Acceptance Criteria |
|----|------|-------------|--------|-------|--------------|---------------------|
| S4-1 | Dynamic traffic model | Time-of-day, incidents, weather, events → speed modifiers | 5 days | Dev 1 | Sprint 1 | Speed modifier ±30% realistic |
| S4-2 | Road closures/detours | Temporary closures with routing updates | 3 days | Dev 1 | S4-1 | Detour adds realistic delay |
| S4-3 | Apparatus-specific speeds | Engine vs Ladder vs Medic vs BC | 2 days | Dev 1 | Sprint 1 | Apparatus type affects travel time |
| S4-4 | Response modes | Code 3 vs Code 2 vs Routine | 2 days | Dev 1 | Sprint 1 | Mode affects travel time |
| S4-5 | Fatigue model | Circadian + shift length + overtime | 4 days | Dev 2 | Sprint 2 | Fatigue shows measurable degradation |
| S4-6 | Experience/competency model | Tenure, certifications → assignment quality | 3 days | Dev 2 | Sprint 2 | Experience affects dispatch accuracy |
| S4-7 | Stress/burnout accumulation | High-acuity exposure → long-term performance | 3 days | Dev 2 | Sprint 2 | Burnout measurable over 24h shift |
| S4-8 | Communication load model | Radio traffic, channel congestion | 3 days | Dev 1 | Sprint 1 | Channel congestion adds delay |
| S4-9 | Cascading incident generator | Primary → secondary (traffic, hazmat, medical) | 4 days | Dev 1 | Sprint 1 | Cascades generate realistic secondary load |
| S4-10 | Multi-alarm/mutual aid | Alarm levels → run cards → mutual aid | 3 days | Dev 1 | Sprint 1 | Alarm escalation follows run cards |
| S4-11 | Planned event generator | Concerts, sports, parades with pre-staffing | 2 days | Dev 1 | Sprint 1 | Events generate predictable spikes |
| S4-12 | Weather/disaster impact | Storm, flood, earthquake modifiers | 3 days | Dev 1 | S4-1 | Weather modifies volume & travel |
| S4-13 | NG911 i3 call flow | ESRP → ECRF → PSAP → Dispatch | 5 days | Dev 2 | Phase 0 | Valid PIDF-LO produced |
| S4-14 | Integration tests | All layers enabled end-to-end | 3 days | Dev 2 | S4-1 to S4-13 | Full pipeline runs without error |

**Sprint 4 Deliverable**: Full simulation with traffic, fatigue, cascades, multi-alarm produces realistic metrics

---

### Sprint 5: Experiment Library & Validation (Week 13-16)

#### Goals
- Published experiment library
- Validation against benchmarks
- Equity analysis framework

#### Tasks

| ID | Task | Description | Effort | Owner | Dependencies | Acceptance Criteria |
|----|------|-------------|--------|-------|--------------|---------------------|
| S5-1 | Baseline comparison experiment | Baseline vs +1 medic per station | 2 days | Dev 1 | Sprint 3 | Runs in < 2 hrs, 30 reps |
| S5-2 | Peak staffing comparison | Fixed overlay vs dynamic ML | 2 days | Dev 1 | Sprint 3 | Dynamic outperforms fixed |
| S5-3 | Station closure equity | Close station, measure by quintile | 2 days | Dev 1 | Sprint 4 | Disparity index by income |
| S5-4 | Cross-staffing tradeoff | Engine+Medic vs separate | 2 days | Dev 1 | Sprint 2 | Fire vs EMS response tradeoff |
| S5-4 | Dynamic vs fixed | ML-driven vs fixed rules | 2 days | Dev 2 | Sprint 2 | Cost-benefit curve |
| S5-5 | Mutual aid optimization | Regional coverage gap minimization | 2 days | Dev 1 | Sprint 4 | Gap reduction per agreement |
| S5-5 | NFPA 1710 calibration | Tune travel/turnout to hit 90/95% | 3 days | Dev 1 | Sprint 1 | Baseline hits 90/95% targets |
| S5-6 | Equity analysis framework | Demographic quintile response times | 3 days | Dev 2 | Sprint 4 | Disparity index computed |
| S5-7 | Cost-benefit curves | Marginal benefit per FTE/unit | 2 days | Dev 1 | Sprint 3 | Marginal benefit curve plotted |
| S5-8 | Sensitivity framework | Volume ±20%, weather events | 2 days | Dev 1 | Sprint 3 | Results change reasonably |
| S5-9 | Regression baseline freeze | Freeze v1.0 baseline for CI | 1 day | Dev 2 | All | Baseline frozen in repo |
| S5-10 | Documentation | USERSGUIDE.md + examples | 2 days | Dev 1 | All | All features documented |

**Sprint 5 Deliverable**: 10+ published experiment configs, all run in < 2 hrs, HTML reports generated

---

### Sprint 6: Documentation, Packaging, Release (Week 17-18)

#### Goals
- Complete documentation
- Docker container
- v1.0 release

#### Tasks

| ID | Task | Description | Effort | Owner | Dependencies | Acceptance Criteria |
|----|------|-------------|--------|-------|--------------|---------------------|
| S6-1 | USERSGUIDE.md complete | All CLI, config, API, tutorials | 3 days | Dev 1 | All | All features documented |
| S6-2 | REALISMGUIDE.md complete | Distributions, calibration guide | 2 days | Dev 1 | Sprint 5 | All params documented |
| S6-3 | API reference (Sphinx) | Autodoc from docstrings | 1 day | Dev 2 | All | `make html` builds |
| S6-4 | Dockerfile + compose | Reproducible container | 1 day | Dev 2 | All | `docker run` works |
| S6-5 | GitHub Actions CI | Test, lint, type-check, build docs | 1 day | Dev 2 | Sprint 0 | CI passes on main |
| S6-6 | Pre-commit hooks | Ruff, mypy, black | 0.5 day | Dev 1 | Sprint 0 | Hooks run on commit |
| S6-6 | PyPI packaging (optional) | `uv build && uv publish` | 1 day | Dev 1 | All | Package on PyPI |
| S6-7 | v1.0 release tag | GitHub release with changelog | 0.5 day | Dev 1 | All | Tag on GitHub |
| S6-7 | Architecture decision records | ADRs in `docs/adr/` | 1 day | Dev 1 | All | Key decisions recorded |

**Sprint 6 Deliverable**: v1.0 released, Docker image on GHCR, docs at ReadTheDocs

---

## Detailed Task Estimates Summary

| Phase | Tasks | Total Days | Weeks |
|-------|-------|------------|-------|
| Sprint 0: Foundation | 8 | 12 | 2 |
| Sprint 1: Engine Core | 10 | 22 | 2 |
| Sprint 2: Staffing Framework | 12 | 23 | 2 |
| Sprint 3: Experiment Runner | 11 | 19 | 2 |
| Sprint 4: Advanced Ops | 14 | 32 | 4 |
| Sprint 5: Experiment Library | 10 | 21 | 4 |
| Sprint 6: Release | 8 | 11.5 | 2 |
| **Total** | **75** | **140.5** | **18** |

*Buffer: 6 weeks (24 days) for integration, debugging, scope changes*

---

## Resource Allocation

### Developer 1 (Full-stack, Simulation Focus)
- Sprints 0-6: Lead on engine, staffing, experiments
- Primary: Python, Pydantic, NetworkX, GeoPandas
- Secondary: CLI, config, testing

### Developer 2 (Full-stack, ML/Stats Focus)
- Sprints 0-6: Routing, ML policies, stats, viz
- Primary: SciPy, scikit-learn, Plotly, NumPy
- Secondary: CI/CD, Docker, packaging

### Shared Responsibilities
- Code reviews (all PRs)
- Documentation updates
- Integration testing
- Sprint planning/retro

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| SynthGIS/SynthCCD API changes | Medium | High | Pin versions, integration tests in CI |
| Simulation too slow | Medium | High | Profile early, use `pandana`/`igraph` fallback |
| Insufficient statistical power | Low | High | Power analysis in Sprint 3, increase reps |
| Scope creep | High | Medium | Strict sprint gates, change control |
| SynthCCD not ready for provider swap | Medium | High | Early Phase 0 integration test |

---

## Definition of Done (Per Sprint)

- [ ] All tasks complete with acceptance criteria met
- [ ] Unit tests pass (>80% coverage)
- [ ] Integration tests pass
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] No critical/severe bugs open
- [ ] Demo to stakeholders

---

## Go/No-Go Gates

| Gate | Criteria | Decision |
|------|----------|----------|
| **Phase 0 → 1** | SynthGIS→SynthCCD bridge works, 1000 incidents generated | Go/No-Go |
| **Phase 1 → 2** | Engine processes 10k incidents/min, metrics valid | Go/No-Go |
| **Phase 2 → 3** | Scenario variants produce measurable differences | Go/No-Go |
| **Phase 3 → 4** | Experiment runner produces valid paired comparisons | Go/No-Go |
| **Phase 4 → 5** | Advanced layers integrate without breaking core | Go/No-Go |
| **Phase 5 → 6** | 10+ experiments run, HTML reports generated | Go/No-Go |
| **Release** | All CI passes, docs build, Docker builds, v1.0 tagged | Ship/No-Ship |

---

*This plan is a living document. Update at each sprint retrospective based on velocity, learnings, and stakeholder feedback.*