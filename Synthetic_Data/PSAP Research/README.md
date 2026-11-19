# PSAP Research — Complete Simulation Ecosystem Project

> **Goal**: Build a comprehensive public safety simulation ecosystem enabling researchers to test staffing algorithms, dispatch policies, resource allocation, and operational protocols against realistic synthetic 9-1-1 workloads in NENA-compliant synthetic geographies.

---

## Project Vision

Create a **complete public safety simulation ecosystem** where researchers can:

1. **Generate** deterministic, NENA-compliant synthetic communities (SynthGIS)
2. **Produce** realistic 9-1-1 call volumes and CAD incidents (SynthCCD)
3. **Simulate** real-time dispatch operations with configurable staffing
4. **Test** staffing algorithms, dispatch policies, and resource allocation
5. **Measure** outcomes against NFPA/NENA standards and equity metrics
5. **Compare** scenarios statistically with controlled experiments

---

## Repository Structure

```
PSAP Research/
├── README.md                          # This file
├── PROJECT_PLAN.md                    # Complete project plan with milestones
├── ARCHITECTURE.md                    # System architecture & data flows
├── SIMULATION_ECOSYSTEM.md            # Complete ecosystem component catalog
├── STAFFING_RESEARCH.md               # Staffing algorithm testing framework
├── MISSING_LAYERS.md                  # Gap analysis of missing simulation layers
├── EXPERIMENT_DESIGN.md               # Controlled experiment methodology
├── IMPLEMENTATION_GUIDE.md            # Code patterns, base classes, interfaces
├── STANDARDS_COMPLIANCE.md            # NENA/NFPA/NIMS standards mapping
├── EXPERIMENT_EXAMPLES.md             # Concrete experiment designs
├── PROJECT_PLAN_DETAILED.md           # Detailed task breakdown with estimates
├── CODE_SKELETON/                     # Base code structure
│   ├── simulation_engine/
│   │   ├── __init__.py
│   │   ├── core.py
│   │   ├── events.py
│   │   ├── units.py
│   │   ├── personnel.py
│   │   ├── dispatch.py
│   │   ├── routing.py
│   │   └── metrics.py
│   ├── staffing_scenarios/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── scenarios.py
│   │   └── runner.py
│   ├── experiments/
│   │   ├── __init__.py
│   │   ├── runner.py
│   │   ├── comparison.py
│   │   └── statistics.py
│   └── integration/
│       ├── __init__.py
│       ├── synthgis_loader.py
│       ├── synthccd_loader.py
│       └── adapter.py
├── CONFIG_TEMPLATES/
│   ├── staffing_scenario_template.yaml
│   ├── experiment_template.yaml
│   └── realism_overrides.yaml
├── TESTS/
│   ├── test_simulation_core.py
│   ├── test_staffing_scenarios.py
│   ├── test_experiment_runner.py
│   └── fixtures/
├── NOTEBOOKS/
│   ├── 01_explore_synthetic_town.ipynb
│   ├── 02_configure_staffing_scenario.ipynb
│   ├── 03_run_staffing_comparison.ipynb
│   ├── 04_analyze_results.ipynb
│   └── 05_equity_analysis.ipynb
└── DATA/
    ├── synthetic_towns/
    ├── staffing_configs/
    └── experiment_results/
```

---

## Quick Start

```bash
# 1. Generate synthetic town
cd ../SynthGIS
uv run synthgis generate --config config/town_spec.yaml --output ../PSAP\ Research/DATA/synthetic_towns/town_v1.gpkg --3d --export-graph ../PSAP\ Research/DATA/synthetic_towns/graph.pkl

# 2. Generate incidents using that town
cd ../SynthCCD
uv run SynthCCD generate \
  --synthgis-town ../PSAP\ Research/DATA/synthetic_towns/town_v1.gpkg \
  --synthgis-graph ../PSAP\ Research/DATA/synthetic_towns/graph.pkl \
  --config config/my_center_realism.yaml \
  --rows 50000 \
  --format parquet \
  --output ../PSAP\ Research/DATA/synthetic_towns/incidents/

# 3. Run staffing comparison experiment
cd ../PSAP\ Research
uv run python -m CODE_SKELETON.experiments.runner \
  --town ../DATA/synthetic_towns/town_v1.gpkg \
  --incidents ../DATA/synthetic_towns/incidents/ \
  --scenarios CONFIG_TEMPLATES/staffing_scenario_template.yaml \
  --replications 30 \
  --output ../DATA/experiment_results/comparison_001/
```

---

## Core Research Questions This Enables

| # | Research Question | Method |
|---|-------------------|--------|
| 1 | How many additional medic units meet NFPA 1710 in Zone 3? | Add units incrementally, measure fractile compliance |
| 2 | Does dynamic peak staffing outperform fixed overlay? | Compare ML-driven vs fixed overlay scenarios |
| 3 | What's the equity impact of closing Station 4? | Simulate closure, measure by demographic quintile |
| 4 | Marginal benefit of each additional FTE? | Cost-benefit curve from scenario sweep |
| 5 | Cross-staffing Engine+Medic: fire vs EMS tradeoffs? | Test cross-staffing rule variations |
| 6 | Mutual aid agreements minimizing coverage gaps? | Regional assembly + run card simulation |
| 7 | Predict surge 2hr out for dynamic pre-positioning? | ML on synthetic historical data |

---

## Key Documents

| Document | Purpose |
|----------|---------|
| [PROJECT_PLAN.md](PROJECT_PLAN.md) | Complete project plan with milestones & timeline |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture, data flows, component interfaces |
| [SIMULATION_ECOSYSTEM.md](SIMULATION_ECOSYSTEM.md) | Complete component catalog with pros/cons |
| [STAFFING_RESEARCH.md](STAFFING_RESEARCH.md) | Staffing algorithm testing framework |
| [MISSING_LAYERS.md](MISSING_LAYERS.md) | Gap analysis of simulation layers |
| [EXPERIMENT_DESIGN.md](EXPERIMENT_DESIGN.md) | Controlled experiment methodology |
| [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) | Code patterns, base classes, interfaces |
| [EXPERIMENT_EXAMPLES.md](EXPERIMENT_EXAMPLES.md) | Concrete experiment designs |
| [PROJECT_PLAN_DETAILED.md](PROJECT_PLAN_DETAILED.md) | Detailed task breakdown with estimates |

---

## Dependencies

| Component | Repository | Status |
|-----------|------------|--------|
| **SynthGIS** | `../SynthGIS` | ✅ Core complete |
| **SynthCCD** | `../SynthCCD` | ✅ Core complete |
| **Simulation Engine** | `CODE_SKELETON/simulation_engine/` | 🟡 In design |
| **Staffing Scenarios** | `CODE_SKELETON/staffing_scenarios/` | 🟡 In design |
| **Experiment Runner** | `CODE_SKELETON/experiments/` | 🟡 In design |

---

## Citation

If you use this research framework in publications:

```bibtex
@misc{psap-research-2026,
  title = {PSAP Research: A Synthetic Public Safety Simulation Ecosystem},
  author = {Dunsworth, Tony},
  year = {2026},
  note = {Synthetic NENA-compliant geography (SynthGIS) + Synthetic 9-1-1 workloads (SynthCCD) + Dispatch simulation engine},
  url = {https://github.com/trdunsworth/PSAP-Research}
}
```

---

## License

MIT License — see individual component repositories for details.

**Synthetic Data Disclaimer**: All generated data is explicitly synthetic. Not for operational 9-1-1 use.