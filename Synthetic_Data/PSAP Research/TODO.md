# PSAP Research — Master Task Tracker

> **Tracking all milestones, tasks, and progress for the PSAP Research simulation ecosystem**

---

## Milestone Overview

| Milestone | Name | Status | Target Week | Description |
|-----------|------|--------|-------------|-------------|
| **M0** | Foundation & Integration | 🟡 In Progress | 1-2 | SynthGIS → SynthCCD bridge, CI/CD |
| **M1** | Simulation Engine Core | 🟡 Planned | 3-4 | Event queue, unit state machine, dispatch logic |
| **M2** | Staffing Scenario Framework | 🟡 Planned | 5-6 | Config-driven scenarios, dynamic policies |
| **M3** | Experiment Runner & Statistics | 🟡 Planned | 7-8 | Controlled experiments, paired stats |
| **M4** | Advanced Operations Layers | 🟡 Planned | 9-12 | Traffic, fatigue, cascading, multi-alarm, NG911 |
| **M5** | Experiment Library & Validation | 🟡 Planned | 13-16 | Published experiments, equity analysis |
| **M6** | Documentation, Packaging, Release | 🟡 Planned | 17-18 | Docs, Docker, v1.0 release |
| **M7** | **Decision Engineering Framework** | 🟡 Planned | 5-8 | Decision records, causal inference, human-in-the-loop |
| **M8** | **Analytics Engineering Stack** | 🟡 Planned | 5-10 | dbt-style transforms, semantic layer, feature store |
| **M9** | **MLOps for Dynamic Staffing** | 🟡 Planned | 7-12 | MLflow, feature store, drift detection, canary deploy |
| **M10** | **Real-time Analytics & Activation** | 🟡 Planned | 11-14 | Streaming analytics, reverse ETL, data activation |

---

## ✅ Completed Tasks

- [x] Create PSAP Research project structure
- [x] Define architecture (ARCHITECTURE.md)
- [x] Create simulation ecosystem catalog (SIMULATION_ECOSYSTEM.md)
- [x] Define staffing research framework (STAFFING_RESEARCH.md)
- [x] Create experiment design methodology (EXPERIMENT_DESIGN.md)
- [x] Build 10 experiment examples (EXPERIMENT_EXAMPLES.md)
- [x] Write implementation guide (IMPLEMENTATION_GUIDE.md)
- [x] Map standards compliance (STANDARDS_COMPLIANCE.md)
- [x] Create decision engineering & analytics engineering integration (DECISION_ANALYTICS_ENGINEERING.md)
- [x] Create project index (PROJECT_INDEX.md)
- [x] Create detailed project plan (PROJECT_PLAN_DETAILED.md)

---

## 🔄 In Progress

- [ ] SynthGIS → SynthCCD integration (Phase 0)
- [ ] Simulation engine core (M1)
- [ ] Staffing scenario framework (M2)
- [ ] Experiment runner (M3)

---

## 📋 Pending Tasks by Milestone

### M0: Foundation & Integration (Week 1-2)
- [ ] SynthGISAddressProvider in SynthCCD
- [ ] CLI flags: `--synthgis-town`, `--synthgis-graph`
- [ ] NENA/CLDXF → SynthCCD field mapping
- [ ] Routing graph loading from pickle
- [ ] Service boundaries & run cards loading
- [ ] Integration test: town.gpkg → 1000 incidents
- [ ] CI/CD pipeline (GitHub Actions)

### M1: Simulation Engine Core (Week 3-4)
- [ ] Event system (EventQueue, EventType, SimulationEvent)
- [ ] Unit State Machine (6 states, valid transitions)
- [ ] Unit Registry
- [ ] Incident Manager (lifecycle + parallel timeline)
- [ ] Dispatch Logic (nearest-available + run cards)
- [ ] Router integration (travel time + turnout)
- [ ] Simulation Clock
- [ ] Metrics Collector
- [ ] Unit tests (>80% coverage)
- [ ] Integration test: 1000 incidents end-to-end

### M2: Staffing Scenario Framework (Week 5-6)
- [ ] StaffingConfig schema (YAML + Pydantic)
- [ ] Scenario loader with inheritance
- [ ] Scenario registry (versioning)
- [ ] DynamicStaffingPolicy ABC
- [ ] RuleBasedDynamicPolicy
- [ ] MLStaffingPolicy scaffold
- [ ] Built-in templates (baseline, peak, dynamic, cross-staff)
- [ ] Cross-staffing rules engine
- [ ] Minimum manning enforcement
- [ ] Fatigue/overtime model
- [ ] Scenario comparison CLI
- [ ] Validation tests

### M3: Experiment Runner & Statistics (Week 7-8)
- [ ] Experiment class (fixed volumes, varied staffing)
- [ ] ExperimentRunner (parallel replication)
- [ ] ComparisonReport (paired t-test, Wilcoxon, bootstrap CI)
- [ ] Metrics aggregation (mean, median, percentiles, KS test)
- [ ] Parallel execution (ProcessPoolExecutor)
- [ ] Results serialization (Parquet + JSON)
- [ ] Visualization helpers (fractile curves, equity heatmaps)
- [ ] Experiment config schema
- [ ] CLI: `psap experiment run`
- [ ] Regression test with baseline

### M4: Advanced Operations Layers (Week 9-12)
- [ ] Dynamic traffic model (time-of-day, incidents, weather, events)
- [ ] Road closures / detours
- [ ] Apparatus-specific speeds
- [ ] Response modes (Code 3/2/Routine)
- [ ] Fatigue model (circadian + shift + overtime)
- [ ] Experience/competency model
- [ ] Stress/burnout accumulation
- [ ] Communication load model
- [ ] Cascading incident generator
- [ ] Multi-alarm / mutual aid escalation
- [ ] Planned event generator
- [ ] Weather/disaster impact
- [ ] NG911 i3 call flow
- [ ] Integration tests

### M5: Experiment Library & Validation (Week 13-16)
- [ ] Baseline vs +1 medic comparison
- [ ] Peak staffing comparison (fixed vs dynamic)
- [ ] Station closure equity analysis
- [ ] Cross-staffing tradeoff study
- [ ] Dynamic vs fixed staffing comparison
- [ ] Mutual aid optimization
- [ ] NFPA 1710 calibration
- [ ] Equity analysis framework
- [ ] Cost-benefit curves
- [ ] Sensitivity analysis
- [ ] Regression baseline freeze
- [ ] Documentation

### M7: Decision Engineering Framework (Week 5-8) ⭐ NEW
- [ ] DecisionRecord schema & audit trail
- [ ] CausalInferenceEngine (ATE, CATE, sensitivity analysis)
- [ ] DecisionAugmenter (human-in-the-loop)
- [ ] Counterfactual generation
- [ ] Feature importance for explainability
- [ ] Override logging for active learning
- [ ] Integration with dispatch engine
- [ ] Causal analysis of experiment results

### M8: Analytics Engineering Stack (Week 5-10) ⭐ NEW
- [ ] Data contracts with SLAs
- [ ] dbt-style transformation layer
- [ ] Semantic layer / MetricsLayer
- [ ] FeatureStore for ML
- [ ] Data contracts with quality checks
- [ ] Data observability & lineage
- [ ] Data quality monitoring
- [ ] Schema evolution tracking

### M9: MLOps for Dynamic Staffing (Week 7-12) ⭐ NEW
- [ ] MLflow experiment tracking
- [ ] FeatureStore implementation
- [ ] Model registry with staging
- [ ] ModelVersion management
- [ ] Training pipeline with MLflow
- [ ] Canary deployment with shadow mode
- [ ] Drift detection (PSI, concept drift)
- [ ] Model monitoring dashboard
- [ ] Automated retraining pipeline

### Key Technical Decisions
1. **Paired experiment design** — Same call volumes across scenarios for causal identification
2. **Deterministic seeding** — Single master seed → substreams per module
3. **Parallel dispatch timeline** — Call-taking and dispatch run simultaneously
4. **Config-driven everything** — YAML for scenarios, experiments, realism
5. **Paired statistical tests** — Wilcoxon + paired t-test with Bonferroni/Holm correction
6. **Feature store** — Point-in-time correct features for ML policies
8. **Drift detection** — PSI for data drift, rolling accuracy for concept drift
9. **Data integration first** — Real data seeds synthetic; synthetic fills gaps
10. **Calibration loop** — Profile → Calibrate → Generate → Validate → Iterate
11. **Hybrid generation** — Real core preserved, synthetic expansion with blending
12. **Gap filling** — Targeted synthetic fill for sparse real data

---

## 🚀 Quick Commands

### Architecture Decisions (ADRs)
- [ ] ADR 001: Decision Engineering Framework
- [ ] ADR 002: Analytics Engineering Stack
- [ ] ADR 003: MLOps for Dynamic Staffing
- [ ] ADR 004: Streaming Architecture
- [ ] ADR 005: Data Contracts & Semantic Layer

### M11: Data Integration & Real Data Seeding (Week 3-8) ⭐ NEW
- [ ] RealDataSeeder: Profile extraction from real data sources
- [ ] HybridGenerator: Real core + synthetic expansion with blending
- [ ] GapFiller: Targeted synthetic fill for sparse real data
- [ ] CalibrationEngine: Parameter optimization to match real profiles
- [ ] SyntheticDataValidator: KS, Wasserstein, correlation validation
- [ ] Pipeline orchestration: Ingest → Profile → Calibrate → Generate → Validate
- [ ] CLI commands: profile-real-data, calibrate, generate-hybrid, augment-gaps, validate
- [ ] Pipeline orchestration config (YAML)

### M12: Hybrid Data Pipeline & Quality Gates (Week 7-10) ⭐ NEW
- [ ] Data contracts with SLAs for all pipeline stages
- [ ] Data quality checks (schema, completeness, distributional)
- [ ] Data observability: freshness, volume, schema, quality
- [ ] Lineage tracking: upstream/downstream dependencies
- [ ] Calibration loop automation: Profile → Calibrate → Generate → Validate
- [ ] Validation gates: KS p>0.05, Wasserstein<0.1σ, Correlation<0.2
- [ ] Expert review workflow for validation failures
- [ ] Automated calibration report generation

### M13: Real Data Source Adapters (Week 4-6) ⭐ NEW
- [ ] OSM/Overpass adapter (existing)
- [ ] County/City GIS adapter (streets, parcels, addresses)
- [ ] 911 CAD export adapter (incidents, unit logs, phone logs)
- [ ] AVL/GPS adapter (travel time calibration)
- [ ] Demographics adapter (Census ACS, LODES)
- [ ] Weather/Events adapter (NOAA, local calendars)
- [ ] FHIR/HL7 adapter (hospital/ED data)
- [ ] Open311 adapter (non-emergency requests)

### M14: Hybrid Experiment Framework (Week 9-12) ⭐ NEW
- [ ] HybridExperimentConfig: real_data_fraction, synthetic_fraction
- [ ] HybridExperimentRunner: same volumes, mixed sources
- [ ] Provenance tracking: real vs synthetic per incident
- [ ] Sensitivity analysis: vary real data fraction (0%, 25%, 50%, 75%, 100%)
- [ ] Calibration quality vs real data volume curves
- [ ] "Gold standard" vs "minimum viable" data comparison

---

### Key Technical Decisions
1. **Paired experiment design** — Same call volumes across scenarios for causal identification
2. **Deterministic seeding** — Single master seed → substreams per module
3. **Parallel dispatch timeline** — Call-taking and dispatch run simultaneously
4. **Config-driven everything** — YAML for scenarios, experiments, realism
5. **Paired statistical tests** — Wilcoxon + paired t-test with Bonferroni/Holm correction
6. **Feature store** — Point-in-time correct features for ML policies
7. **Drift detection** — PSI for data drift, rolling accuracy for concept drift
8. **Data integration first** — Real data seeds synthetic; synthetic fills gaps
9. **Calibration loop** — Profile → Calibrate → Generate → Validate → Iterate
10. **Hybrid generation** — Real core preserved, synthetic expansion with blending
11. **Gap filling** — Targeted synthetic fill for sparse real data
11. **Calibration loop** — Profile → Calibrate → Generate → Validate → Iterate
12. **Hybrid generation** — Real core preserved, synthetic expansion with blending
12. **Gap filling** — Targeted synthetic fill for sparse real data

---

## 🚀 Quick Commands

```bash
# Run single experiment
uv run python -m psap_research.experiments.runner config/experiments/staffing_comparison_001.yaml

# Run all core experiments
for exp in config/experiments/*.yaml; do
    uv run python -m psap_research.experiments.runner "$exp"
done

# Run tests
uv run pytest tests/ -v --cov=psap_research

# Lint & format
uv run ruff check src/ && uv run ruff format src/

# Type check
uv run mypy src/

# Build docs
uv run python scripts/build_docs.py
```

---

*Last Updated: November 19, 2026*