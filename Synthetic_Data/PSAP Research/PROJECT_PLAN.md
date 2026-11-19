# PSAP Research — Complete Project Plan

> **Timeline**: 24 weeks (6 months) | **Team**: 1-2 developers | **Scope**: Complete simulation ecosystem

---

## Phase Overview

| Phase | Weeks | Focus | Deliverable |
|-------|-------|-------|-------------|
| **Phase 0** | 1-2 | Foundation & Integration | SynthGIS ↔ SynthCCD bridge working |
| **Phase 1** | 3-6 | Simulation Engine Core | Dispatch simulation engine v1 |
| **Phase 2** | 7-10 | Staffing Scenario Framework | Config-driven staffing scenarios |
| **Phase 3** | 11-14 | Experiment Runner & Statistics | Controlled experiment framework |
| **Phase 4** | 15-18 | Advanced Operations Layers | Traffic, personnel, cascading incidents |
| **Phase 5** | 19-22 | Experiment Examples & Validation | Published experiment library |
| **Phase 6** | 23-24 | Documentation, Packaging, Release | v1.0 release |

---

## Phase 0: Foundation & Integration (Weeks 1-2)

### Goals
- Bridge SynthGIS → SynthCCD data flow
- Implement `SynthGISAddressProvider` in SynthCCD
- Validate end-to-end: town → incidents → basic metrics

### Tasks

| Task | Description | Effort | Owner | Dependencies |
|------|-------------|--------|-------|--------------|
| 0.1 | Create `SynthGISAddressProvider` in SynthCCD | Read GPKG layers, map NENA→SynthCCD fields | 3 days | SynthGIS GPKG output |
| 0.2 | Add `--synthgis-town` / `--synthgis-graph` CLI flags | SynthCCD CLI integration | 1 day | 0.1 |
| 0.3 | Implement NENA/CLDXF → SynthCCD field mapping | Building/Floor/Unit/Room/Seat support | 2 days | 0.1 |
| 0.4 | Load routing graph from pickle | NetworkX graph loading with travel-time weights | 1 day | SynthGIS `--export-graph` |
| 0.4 | Load service boundaries & run cards | PSAP/Fire/Police/EMS polygons + run cards | 2 days | SynthGIS GPKG layers |
| 0.5 | Integration test: town → 1000 incidents | Validate address_source='synthgis', boundaries attached | 1 day | 0.1-0.4 |
| 0.6 | Document integration in both USERSGUIDE.md | Update SynthGIS & SynthCCD docs | 1 day | 0.5 |

### Exit Criteria
- [ ] `uv run SynthCCD generate --synthgis-town town.gpkg --rows 1000` works
- [ ] All incidents have `psap_boundary`, `fire_zone`, `travel_time_calculated`
- [ ] Routing graph loads and computes travel times
- [ ] Integration test passes in CI

---

## Phase 1: Simulation Engine Core (Weeks 3-6)

### Goals
- Build core dispatch simulation engine
- Unit state machine with realistic transitions
- Parallel dispatch timeline (call-taking + dispatch simultaneous)
- Basic metrics collection

### Architecture

```
SimulationEngine
├── EventQueue (priority queue by timestamp)
├── UnitRegistry (all units + state machines)
├── IncidentQueue (pending incidents)
├── Dispatcher (assignment logic)
├── Router (travel time calculator)
├── Clock (simulation time)
└── MetricsCollector
```

### Tasks

| Task | Description | Effort | Owner | Dependencies |
|------|-------------|--------|-------|--------------|
| 1.1 | Design `SimulationEvent` hierarchy | `CallReceived`, `CallAnswered`, `Dispatched`, `Enroute`, `Arrived`, `Cleared`, `UnitStatusChange` | 2 days | - |
| 1.2 | Implement `UnitStateMachine` | States: `AVAILABLE`, `DISPATCHED`, `ENROUTE`, `ON_SCENE`, `CLEARING`, `OUT_OF_SERVICE` | 3 days | 1.1 |
| 1.3 | Implement `Incident` lifecycle | Parallel call-taking + dispatch timelines | 3 days | 1.1 |
| 1.2 | Implement `Dispatcher` assignment logic | Nearest-available, zone-aware, run-card-driven | 4 days | 1.2 |
| 1.3 | Integrate `SynthGISRouter` | Travel time from routing graph + turnout time | 2 days | Phase 0 |
| 1.4 | Implement `Unit` class | Apparatus type, station, shift, personnel, capabilities | 2 days | 1.2 |
| 1.5 | Implement `Personnel` pools | Calltakers, dispatchers per shift, Zipf-weighted assignment | 2 days | - |
| 1.6 | Implement `SimulationClock` | Discrete event simulation with configurable speed | 1 day | 1.1 |
| 1.7 | Implement `MetricsCollector` | Response times, utilization, coverage, equity | 3 days | 1.1 |
| 1.8 | Unit tests for core engine | 80%+ coverage on state transitions | 3 days | 1.1-1.7 |
| 1.9 | Integration test: 1000 incidents end-to-end | Validate metrics against known baselines | 2 days | 1.1-1.8 |

### Core Classes (from IMPLEMENTATION_GUIDE.md)

```python
# simulation_engine/core.py
class SimulationEvent:
    timestamp: datetime
    event_type: EventType
    incident_id: str
    unit_id: Optional[str]
    payload: dict

class UnitStateMachine:
    states = ['AVAILABLE', 'DISPATCHED', 'ENROUTE', 'ON_SCENE', 'CLEARING', 'OUT_OF_SERVICE']
    valid_transitions = {...}
    
class Unit:
    unit_id: str
    apparatus_type: ApparatusType
    station_id: str
    shift: Shift
    personnel: list[Personnel]
    state: UnitState
    location: Point  # current GPS
    capabilities: set[Capability]
    
class Incident:
    incident_id: str
    priority: int
    agency: Agency
    problem_nature: str
    location: Point
    service_boundaries: ServiceBoundaries
    assigned_units: list[Unit]
    timestamps: IncidentTimestamps  # parallel timeline
    
class DispatchSimulationEngine:
    def __init__(self, geography, staffing, router, clock, metrics):
        ...
    def load_incidents(self, incidents): ...
    def step(self) -> bool:  # process next event, return True if running
    def run(self) -> SimulationResults: ...
    def get_metrics(self) -> MetricsReport: ...
```

### Exit Criteria
- [ ] Engine processes 10,000 incidents in < 60 seconds
- [ ] Unit state transitions valid (no invalid transitions)
- [ ] Parallel dispatch timeline working (dispatch can start before call ends)
- [ ] Metrics match SynthCCD regression baseline for baseline staffing

---

## Phase 2: Staffing Scenario Framework (Weeks 7-10)

### Goals
- Config-driven staffing scenarios (YAML)
- Scenario versioning & comparison
- Support for dynamic/ML-driven staffing

### Tasks

| Task | Description | Effort | Owner | Dependencies |
|------|-------------|--------|-------|--------------|
| 2.1 | Design `StaffingScenario` schema (YAML) | Stations, units, shifts, cross-staffing, dynamic rules | 2 days | Phase 1 |
| 2.2 | Implement `StaffingScenario` loader | Parse YAML, validate, create `StaffingConfig` objects | 2 days | 2.1 |
| 2.3 | Implement scenario registry | Versioned scenarios, inheritance, overrides | 2 days | 2.2 |
| 2.4 | Implement dynamic staffing interface | `DynamicStaffingPolicy` interface for ML-driven | 3 days | Phase 1 |
| 2.5 | Built-in scenario templates | Baseline, peak overlay, dynamic, cross-staffing variants | 2 days | 2.2 |
| 2.6 | Cross-staffing rules engine | Engine+Medic, Engine+Tender, Quint combinations | 3 days | Phase 1 |
| 2.7 | Minimum manning enforcement | Per-shift, per-station minimums with overtime | 2 days | Phase 1 |
| 2.8 | Fatigue/overtime model | Cumulative hours, fatigue factor on response times | 3 days | Phase 1 |
| 2.9 | Scenario comparison CLI | `uv run psap compare-scenarios base.yaml variant.yaml` | 2 days | 2.2 |
| 2.10 | Scenario validation tests | Ensure valid transitions, no orphan units | 2 days | 2.2 |

### Staffing Scenario Schema (YAML)

```yaml
# config/staffing_scenarios/baseline.yaml
scenario:
  name: "Baseline_2024"
  version: "1.0"
  description: "Current operational staffing"
  inherits: null  # or "base_template"
  
stations:
  Station_1:
    apparatus:
      - type: "Engine"
        count: 1
        cross_staffed_with: "Medic_1"
      - type: "Medic"
        count: 1
        cross_staffed_with: "Engine_1"
    minimum_manning: 3
    
  Station_2:
    apparatus:
      - type: "Engine"
        count: 1
    minimum_manning: 2
    
shifts:
  structure: "2x12h_4shift"
  rotation: [1, 1, 2, 2, 1, 1, 1, 2, 2, 1, 1, 2, 2, 2]
  cycle_start_weekday: 0  # Monday
  
  shift_definitions:
    A:
      label: "DAY"
      hours: [6, 18]
      rotation_group: 1
      staffing:
        Station_1: {Engine_1: 3, Medic_1: 2}
        Station_2: {Engine_1: 3}
    B:
      label: "DAY"
      hours: [6, 18]
      rotation_group: 2
      staffing: ...
    C:
      label: "NIGHT"
      hours: [18, 6]
      rotation_group: 1
      staffing: ...
    D:
      label: "NIGHT"
      hours: [18, 6]
      rotation_group: 2
      staffing: ...

cross_staffing_rules:
  - primary: "Engine_1"
    secondary: "Medic_1"
    rule: "if_engine_busy_medic_available"
    priority: 1
    
minimum_manning:
  Station_1: 3
  Station_2: 2
  
overtime_policy:
  max_consecutive_hours: 24
  max_weekly_hours: 72
  callback_threshold: 0.8  # recall off-duty at 80% capacity

fatigue_model:
  enabled: true
  fatigue_factor_per_hour: 0.005
  recovery_rate_per_hour_off: 0.01
  max_fatigue_factor: 1.5  # 50% slower at max fatigue
  
dynamic_staffing:
  enabled: false
  # If enabled, uses DynamicStaffingPolicy interface
  # policy_class: "ml_staffing_policy.MLStaffingPolicy"
  # model_path: "models/staffing_model.pkl"
  # features: ["forecasted_volume", "current_utilization", "time_of_day"]
  # retrain_schedule: "weekly"
```

### Exit Criteria
- [ ] Load baseline scenario, generate 1000 incidents, validate metrics
- [ ] Create variant scenario (add medic), run comparison, detect difference
- [ ] Cross-staffing rules correctly prevent double-assignment
- [ ] Fatigue model affects response times measurably

---

## Phase 3: Experiment Runner & Statistics (Weeks 11-14)

### Goals
- Controlled experiment framework with identical volumes
- Statistical comparison with confidence intervals
- Replication management & parallel execution

### Tasks

| Task | Description | Effort | Owner | Dependencies |
|------|-------------|--------|-------|--------------|
| 3.1 | Design `Experiment` class | Fixed volumes, varied staffing, n replications | 2 days | Phase 2 |
| 3.2 | Implement `ExperimentRunner` | Parallel replication with seed management | 3 days | Phase 2 |
| 3.3 | Implement `ComparisonReport` | Paired t-tests, effect sizes, confidence intervals | 3 days | Phase 2 |
| 3.3 | Implement metrics aggregation | Mean, median, percentiles, KS tests, effect sizes | 2 days | Phase 1 |
| 3.4 | Parallel execution support | `joblib`/`multiprocessing` for replications | 2 days | Phase 2 |
| 3.5 | Results serialization | Parquet + JSON metadata, reproducible | 1 day | Phase 1 |
| 3.6 | Visualization helpers | Matplotlib/Plotly: fractile curves, equity heatmaps | 2 days | Phase 1 |
| 3.6 | Experiment config schema | YAML defining volumes, scenarios, replications | 1 day | 2.1 |
| 3.7 | CLI: `psap experiment run experiment.yaml` | Full experiment execution | 2 days | 3.1 |
| 3.8 | Regression test: known baseline comparison | Ensure no regressions in engine | 2 days | Phase 1 |

### Experiment Config Schema

```yaml
# config/experiments/staffing_comparison_001.yaml
experiment:
  name: "Staffing_Comparison_2024_Q1"
  description: "Compare baseline vs added medic at Station 2"
  version: "1.0"
  
  # FIXED across all scenarios (controlled)
  fixed:
    town_gpkg: "DATA/synthetic_towns/town_v1.gpkg"
    routing_graph: "DATA/synthetic_towns/graph.pkl"
    incidents_parquet: "DATA/incidents/incidents_50k.parquet"
    date_range: ["2024-01-01", "2024-12-31"]
    realism_config: "config/realism/my_center.yaml"
    random_seed: 4242  # fixed for all scenarios
    
  # VARIED per scenario
  scenarios:
    - name: "Baseline"
      staffing_config: "config/staffing_scenarios/baseline.yaml"
      label: "Current Staffing"
      
    - name: "Add_Medic_Stn2"
      staffing_config: "config/staffing_scenarios/add_medic_stn2.yaml"
      label: "Add Medic at Station 2"
      
    - name: "Peak_Overlay"
      staffing_config: "config/staffing_scenarios/peak_overlay.yaml"
      label: "Fixed Peak Overlay 10-22"
      
    - name: "Dynamic_ML"
      staffing_config: "config/staffing_scenarios/dynamic_ml.yaml"
      label: "ML-Driven Dynamic Staffing"
      
  # Experiment parameters
  replications: 30  # per scenario
  parallel_jobs: 8  # CPU cores
  
  # Output
  output_dir: "DATA/experiment_results/staffing_comp_001/"
  output_formats: ["parquet", "json", "html"]
  
  # Metrics to collect (from MetricsCollector)
  metrics:
    - response_time_fractiles  # p50, p90, p95 by priority/zone
    - unit_utilization  # UHU per unit
    - workload_equity  # calls per unit, high-acuity exposure
    - coverage_gaps  # uncovered incidents, simultaneous calls
    - cost_metrics  # FTE cost, overtime, cost per incident
    - equity_metrics  # response time by demographic quintile
    - fractile_compliance  # NFPA 1710/1720
    
  # Statistical analysis
  analysis:
    paired_test: true  # same volumes = paired observations
    confidence_level: 0.95
    effect_size_threshold: 0.2  # Cohen's d
    multiple_comparison_correction: "bonferroni"
```

### Exit Criteria
- [ ] Run 4 scenarios × 30 reps = 120 simulations in < 2 hours
- [ ] Comparison report shows paired t-tests with 95% CI
- [ ] Effect sizes reported with confidence intervals
- [ ] HTML report generated with fractile curves, equity heatmaps

---

## Phase 4: Advanced Operations Layers (Weeks 15-18)

### Goals
- Dynamic traffic & travel times
- Personnel fatigue & human factors
- Cascading incidents & multi-alarm
- NG911 i3 call flow simulation

### Tasks

| Task | Description | Effort | Owner | Dependencies |
|------|-------------|--------|-------|--------------|
| 4.1 | Dynamic traffic model | Time-of-day, incidents, weather, events → speed modifiers | 5 days | Phase 1 |
| 4.2 | Road closure / construction events | Temporary network modifications with detours | 3 days | 4.1 |
| 4.3 | Apparatus-specific travel | Engine vs Ladder vs Medic vs BC speeds | 2 days | Phase 1 |
| 4.4 | Response mode modeling | Code 3 vs Code 2 vs Routine risk/time tradeoffs | 2 days | Phase 1 |
| 4.5 | Personnel fatigue model | Circadian, shift length, overtime → reaction time modifier | 4 days | Phase 2 |
| 4.6 | Experience/competency model | Tenure, certifications → assignment quality | 3 days | Phase 2 |
| 4.7 | Stress/burnout accumulation | High-acuity exposure → long-term performance | 3 days | Phase 2 |
| 4.8 | Communication load model | Radio traffic, channel congestion → dispatcher workload | 3 days | Phase 1 |
| 4.9 | Cascading incident generator | Primary → secondary (traffic, hazmat, medical) | 4 days | Phase 1 |
| 4.10 | Multi-alarm / mutual aid escalation | Alarm levels → run cards → mutual aid requests | 3 days | Phase 1 |
| 4.11 | Planned event generator | Concerts, sports, parades with pre-planned staffing | 2 days | Phase 1 |
| 4.12 | Weather/disaster impact | Storm, flood, earthquake → volume & travel modifiers | 3 days | Phase 1 |
| 4.13 | NG911 i3 call flow | ESRP → ECRF → PSAP → Policy Routing → Dispatch | 5 days | Phase 0 |
| 4.14 | Integration tests for all layers | End-to-end with all layers enabled | 3 days | 4.1-4.13 |

### Exit Criteria
- [ ] Dynamic traffic changes travel times ±30% realistically
- [ ] Fatigue model shows measurable degradation over 24h shift
- [ ] Cascading incidents generate realistic secondary workload
- [ ] Multi-alarm escalation follows run cards correctly
- [ ] NG911 call flow produces valid PIDF-LO locations

---

## Phase 5: Experiment Library & Validation (Weeks 19-22)

### Goals
- Published experiment library with known-good configs
- Validation against real-world benchmarks
- Equity analysis framework

### Tasks

| Task | Description | Effort | Owner | Dependencies |
|------|-------------|--------|-------|--------------|
| 5.1 | Baseline staffing comparison experiment | Baseline vs +1 medic per station | 2 days | Phase 3 |
| 5.2 | Peak staffing comparison | Fixed overlay vs dynamic ML | 2 days | Phase 3 |
| 5.3 | Station closure equity analysis | Close station, measure by demographic | 2 days | Phase 4 |
| 5.4 | Cross-staffing tradeoff study | Engine+Medic vs separate units | 2 days | Phase 2 |
| 5.5 | Dynamic staffing vs fixed comparison | ML-driven vs fixed rules | 2 days | Phase 2 |
| 5.6 | Mutual aid agreement optimization | Regional coverage gap minimization | 2 days | Phase 4 |
| 5.7 | NFPA 1710 compliance calibration | Tune travel/turnout to hit 90/95% | 3 days | Phase 1 |
| 5.8 | Equity analysis framework | Demographic quintile response times | 3 days | Phase 4 |
| 5.9 | Cost-benefit curve generation | Marginal benefit per FTE/unit | 2 days | Phase 3 |
| 5.10 | Sensitivity analysis framework | Volume +20%, -20%, weather events | 2 days | Phase 3 |
| 5.11 | Regression baseline update | Freeze v1.0 baseline for CI | 1 day | All |
| 5.12 | Documentation: Experiment Library | USERSGUIDE.md + examples | 2 days | All |

### Exit Criteria
- [ ] 10+ published experiment configs in `config/experiments/`
- [ ] Each runs in < 2 hours with 30 reps
- [ ] HTML reports generated automatically
- [ ] Regression baseline frozen in `tests/regression_baseline.json`

---

## Phase 6: Documentation, Packaging, Release (Weeks 23-24)

### Goals
- Complete documentation
- PyPI package (optional)
- Docker container
- v1.0 release

### Tasks

| Task | Description | Effort | Owner | Dependencies |
|------|-------------|--------|-------|--------------|
| 6.1 | Complete USERSGUIDE.md | All CLI, config, API, tutorials | 3 days | All |
| 6.2 | Complete REALISMGUIDE.md | All distributions, calibration guide | 2 days | Phase 5 |
| 6.3 | API reference (Sphinx) | Autodoc from docstrings | 1 day | All |
| 6.3 | Dockerfile + docker-compose | Reproducible container | 1 day | All |
| 6.4 | GitHub Actions CI | Test, lint, type-check, build docs | 1 day | All |
| 6.5 | Pre-commit hooks | Ruff, mypy, black | 0.5 day | All |
| 6.6 | PyPI packaging (optional) | `uv build && uv publish` | 1 day | All |
| 6.6 | v1.0 release tag | GitHub release with changelog | 0.5 day | All |
| 6.7 | Architecture decision records | ADRs in `docs/adr/` | 1 day | All |

### Exit Criteria
- [ ] All docs build without errors
- [ ] CI passes on main branch
- [ ] Docker image builds and runs
- [ ] v1.0 tagged on GitHub

---

## Resource Requirements

### Compute
| Phase | Estimated CPU Hours | Storage | Notes |
|-------|---------------------|---------|-------|
| Phase 0 | 10 | 1 GB | Light |
| Phase 1 | 50 | 5 GB | Medium |
| Phase 2 | 30 | 2 GB | Medium |
| Phase 3 | 200 | 20 GB | Heavy (30 reps × scenarios) |
| Phase 4 | 100 | 10 GB | Heavy |
| Phase 5 | 150 | 15 GB | Heavy |
| **Total** | **~540 CPU hrs** | **~53 GB** | |

### Recommended Hardware
- **Development**: 16+ core CPU, 32 GB RAM, 500 GB SSD
- **CI/CD**: GitHub Actions (Ubuntu-latest, 4 cores)
- **Experiments**: Can run locally or on cloud (AWS Batch, GCP Batch)

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SynthGIS/SynthCCD API changes | Medium | High | Pin versions, integration tests |
| Simulation performance too slow | Medium | High | Profile early, use `pandana`/`igraph` |
| Statistical power insufficient | Low | High | Power analysis in Phase 3 |
| Scope creep | High | Medium | Strict phase gates |
| SynthCCD API not ready for provider swap | Medium | High | Early Phase 0 integration test |

---

## Success Metrics

| Metric | Target |
|----------|--------|
| Simulation throughput | 10,000 incidents/minute |
| Experiment turnaround (30 reps) | < 2 hours |
| Statistical power (α=0.05, β=0.2) | Detect 10% response time change |
| Code coverage | > 80% |
| Documentation coverage | 100% public API |
| Regression baseline stability | 0 drift over 10 releases |

---

## Next Steps

1. **Week 1**: Clone SynthGIS & SynthCCD, run Phase 0 integration test
2. **Week 2**: Complete Phase 0, begin Phase 1 engine design
3. **Week 3-6**: Build simulation engine core
4. **Week 7**: Begin staffing scenario framework
...

---

*This plan is a living document. Update with each sprint retrospective.*