# PSAP Research Project — Master Index

> **Complete navigation index for the PSAP Research ecosystem**

---

## 📁 Repository Structure

```
Synthetic_Data/
├── SynthGIS/                    # Synthetic Geography Generator
│   ├── docs/
│   │   ├── NENA_NG911_GIS_Standards_Reference.md
│   │   ├── Synthetic_Geodata_Research_Summary.md
│   │   ├── SynthGIS_Architecture_Design.md
│   │   ├── Persistence_and_Expansion.md
│   │   └── QGIS_Training_Guide.md
│   ├── config/
│   │   ├── town_spec.yaml
│   │   └── nena_schema_v3.yaml
│   ├── src/synthgis/            # Core generation engine
│   ├── pyproject.toml
│   ├── TODO.md
│   └── README.md
│
├── SynthCCD/                    # Synthetic 9-1-1 Workload Generator
│   ├── AGENTS.md
│   ├── REALISMGUIDE.md
│   ├── USERSGUIDE.md
│   ├── TODO.md
│   ├── README.md
│   └── INTEGRATION_TODO.md      # ← SynthGIS integration tasks
│
├── PSAP Research/               # ← NEW: Complete Simulation Ecosystem
│   ├── README.md                 # Project overview & quick start
│   ├── PROJECT_INDEX.md          # ← THIS FILE
│   ├── PROJECT_PLAN.md           # High-level 24-week plan
│   ├── PROJECT_PLAN_DETAILED.md  # Granular task breakdown
│   ├── ARCHITECTURE.md           # System architecture & data flows
│   ├── SIMULATION_ECOSYSTEM.md   # Component catalog with pros/cons
│   ├── STAFFING_RESEARCH.md      # Staffing algorithm testing framework
│   ├── MISSING_LAYERS.md         # Gap analysis of missing layers
│   ├── EXPERIMENT_DESIGN.md      # Controlled experiment methodology
│   ├── EXPERIMENT_EXAMPLES.md    # 10 ready-to-run experiments
│   ├── IMPLEMENTATION_GUIDE.md   # Code patterns, base classes, interfaces
│   ├── STANDARDS_COMPLIANCE.md   # NENA/NFPA/NIMS standards mapping
│   ├── TODO.md                   # Master task tracker (M1-M18)
│   ├── CODE_SKELETON/            # Reference implementations
│   ├── CONFIG_TEMPLATES/         # YAML templates
│   ├── TESTS/                    # Test suite
│   ├── NOTEBOOKS/                # Analysis notebooks
│   └── DATA/                     # Synthetic towns, configs, results
│
└── CLAUDE.md                     # Project instructions for Claude
```

---

## 🎯 Quick Navigation by Goal

### I want to...

| Goal | Start Here |
|------|------------|
| **Generate my first synthetic town** | `SynthGIS/README.md` → Quick Start |
| **Understand NENA standards** | `SynthGIS/docs/NENA_NG911_GIS_Standards_Reference.md` |
| **Learn QGIS for visualization** | `SynthGIS/docs/QGIS_Training_Guide.md` |
| **Generate 9-1-1 incidents** | `SynthCCD/README.md` → Quick Start |
| **Integrate SynthGIS + SynthCCD** | `SynthCCD/INTEGRATION_TODO.md` |
| **Run staffing experiments** | `PSAP Research/EXPERIMENT_EXAMPLES.md` |
| **Build custom simulation** | `PSAP Research/IMPLEMENTATION_GUIDE.md` |
| **Plan the project** | `PSAP Research/PROJECT_PLAN.md` → `PROJECT_PLAN_DETAILED.md` |
| **Understand the architecture** | `PSAP Research/ARCHITECTURE.md` |
| **Find missing pieces** | `PSAP Research/MISSING_LAYERS.md` |
| **Check standards compliance** | `PSAP Research/STANDARDS_COMPLIANCE.md` |
| **Run specific experiment** | `PSAP Research/EXPERIMENT_EXAMPLES.md` |
| **Implement code** | `PSAP Research/IMPLEMENTATION_GUIDE.md` |
| **Integrate real data + synthetic** | `PSAP Research/DATA_INTEGRATION.md` |
| **Decision Intelligence patterns** | `PSAP Research/DECISION_ANALYTICS_ENGINEERING.md` |

---

## 📚 Document Categories

### 📖 **Foundational References**
| Document | Purpose |
|----------|---------|
| `SynthGIS/docs/NENA_NG911_GIS_Standards_Reference.md` | Complete NENA-STA-006.3 distillation |
| `SynthGIS/docs/Synthetic_Geodata_Research_Summary.md` | 2023-2026 research survey |
| `PSAP Research/STANDARDS_COMPLIANCE.md` | NENA/NFPA/NIMS/FHIR mapping |
| `PSAP Research/DECISION_ANALYTICS_ENGINEERING.md` | Decision Intelligence & Analytics Engineering trends integration |
| `PSAP Research/DATA_INTEGRATION.md` | Real data seeding, synthetic augmentation, hybrid generation patterns |

### 🏗️ **Architecture & Design**
| Document | Purpose |
|----------|---------|
| `SynthGIS/docs/SynthGIS_Architecture_Design.md` | SynthGIS technical architecture |
| `PSAP Research/ARCHITECTURE.md` | Full ecosystem architecture |
| `PSAP Research/SIMULATION_ECOSYSTEM.md` | Component catalog with pros/cons |
| `PSAP Research/MISSING_LAYERS.md` | Gap analysis of simulation layers |
| `PSAP Research/DECISION_ANALYTICS_ENGINEERING.md` | Modern Decision Intelligence & Analytics Engineering integration |
| `PSAP Research/DATA_INTEGRATION.md` | Real data seeding, synthetic augmentation, hybrid generation patterns |

### 📋 **Project Management**
| Document | Purpose |
|----------|---------|
| `PSAP Research/PROJECT_PLAN.md` | 24-week high-level plan |
| `PSAP Research/PROJECT_PLAN_DETAILED.md` | Granular task breakdown |
| `PSAP Research/TODO.md` | Master task tracker (M1-M18) |
| `SynthCCD/INTEGRATION_TODO.md` | SynthCCD-side integration tasks |

### 🔬 **Research & Experiments**
| Document | Purpose |
|----------|---------|
| `PSAP Research/EXPERIMENT_DESIGN.md` | Controlled experiment methodology |
| `PSAP Research/STAFFING_RESEARCH.md` | Staffing algorithm testing framework |
| `PSAP Research/EXPERIMENT_EXAMPLES.md` | 10 ready-to-run experiments |
| `PSAP Research/EXPERIMENT_DESIGN.md` | Controlled experiment methodology |

### 💻 **Implementation**
| Document | Purpose |
|----------|---------|
| `PSAP Research/IMPLEMENTATION_GUIDE.md` | Code patterns, base classes, interfaces |
| `PSAP Research/CODE_SKELETON/` | Reference implementations |
| `SynthGIS/src/synthgis/` | SynthGIS source code |
| `SynthCCD/src/synth911gen3/` | SynthCCD source code |
| `PSAP Research/DECISION_ANALYTICS_ENGINEERING.md` | Decision Intelligence & Analytics Engineering implementation patterns |
| `PSAP Research/DATA_INTEGRATION.md` | Data integration patterns, hybrid generation, calibration patterns |

---

## 🚀 Quick Start Paths

### Path 1: Generate First Town (30 min)
```bash
cd Synthetic_Data/SynthGIS
uv venv && source .venv/bin/activate
uv sync --extra dev
uv pip install -e .
uv run synthgis generate --config config/town_spec.yaml --output output/town.gpkg
qgis output/town.gpkg
```

### Path 2: Generate Incidents with SynthGIS Town (45 min)
```bash
cd Synthetic_Data/SynthGIS
uv run synthgis generate --config config/town_spec.yaml --output output/town.gpkg --export-graph output/graph.pkl

cd ../SynthCCD
uv run SynthCCD generate \
  --synthgis-town ../SynthGIS/output/town.gpkg \
  --synthgis-graph ../SynthGIS/output/graph.pkl \
  --config config/realism/my_center.yaml \
  --rows 10000 \
  --format parquet
```

### Path 3: Run Staffing Experiment (2 hrs)
```bash
cd Synthetic_Data/PSAP Research
uv run python -m psap_research.experiments.runner \
  config/experiments/staffing_comparison_001.yaml
# Open DATA/experiment_results/staffing_comparison_001/comparison_report.html
```

### Path 4: Custom Experiment (1 hr setup)
```bash
# 1. Copy template
cp config/experiments/staffing_comparison_001.yaml config/experiments/my_experiment.yaml

# 2. Edit staffing configs
vim config/staffing_scenarios/my_treatment.yaml

# 3. Run
uv run python -m psap_research.experiments.runner \
  config/experiments/my_experiment.yaml
```

### Path 5: Real Data Integration (45 min)
```bash
# 1. Profile real data
uv run psap-integrate profile-real-data \
  streets.gpkg addresses.gpkg incidents.parquet \
  -o real_profile.json

# 2. Calibrate town spec to match real data
uv run psap-integrate calibrate \
  real_profile.json ../SynthGIS/config/town_spec.yaml \
  -o calibrated_spec.yaml

# 3. Generate hybrid town (real core + synthetic expansion)
uv run psap-integrate generate-hybrid \
  real_core.gpkg \
  -o hybrid_town.gpkg --rings 2 --ring-width 1000

# 4. Augment any remaining gaps
uv run psap-integrate augment-gaps \
  hybrid_town.gpkg -o complete_town.gpkg

# 5. Validate synthetic output
uv run psap-integrate validate \
  complete_town.gpkg real_profile.json
```

---

## 🔗 Cross-Repository Dependencies

```
SynthGIS (Geography Provider)
       │
       ▼
SynthCCD (Workload Consumer)
       │
       ▼
PSAP Research (Simulation Engine)
       │
       ├── Experiments (Staffing, Equity, Surge, etc.)
       ├── Advanced Ops (Traffic, Fatigue, Cascading, NG911)
       └── Metrics (Response Times, Utilization, Equity, Cost)
```

### Data Flow
```
SynthGIS town.gpkg
    ├── RoadCenterLine (CLDXF ranges)
    ├── SiteStructureAddressPoint (sub-addresses)
    ├── PsapPolygon / FirePolygon / etc. (boundaries)
    ├── FireStationPoint / PoliceStationPoint / etc.
    ├── FireZonePolygon / PoliceZonePolygon / etc.
    ├── FireRunCard / PoliceRunCard / EmsRunCard
    ├── Routing Graph (NetworkX pickle)
    └── Population Surface (parcel level)
            │
            ▼
SynthCCD reads GPKG → SynthGISAddressProvider
    ├── Address pool (streets + points)
    ├── Service boundaries (point-in-polygon)
    ├── Routing graph (travel times)
    ├── Run cards (dispatch plans)
    └── Population surface (spatial weighting)
            │
            ▼
PSAP Research Simulation Engine
    ├── Discrete event simulation
    ├── Unit state machines
    ├── Parallel dispatch timeline
    ├── Staffing scenarios
    └── Experiment runner
```

---

## 📋 Current Status Summary

| Component | Status | Location |
|-----------|--------|----------|
| **SynthGIS Core** | ✅ Complete | `Synthetic_Data/SynthGIS/` |
| **SynthCCD Core** | ✅ Complete | `Synthetic_Data/SynthCCD/` |
| **SynthGIS→SynthCCD Bridge** | 🟡 In Design | `SynthCCD/INTEGRATION_TODO.md` |
| **Simulation Engine** | 🟡 In Design | `PSAP Research/ARCHITECTURE.md` |
| **Staffing Scenarios** | 🟡 In Design | `PSAP Research/STAFFING_RESEARCH.md` |
| **Experiment Runner** | 🟡 In Design | `PSAP Research/EXPERIMENT_DESIGN.md` |
| **Advanced Ops Layers** | 🟡 Planned | `PSAP Research/MISSING_LAYERS.md` |
| **Documentation** | ✅ Complete | All `docs/` folders |

---

## 🎯 Next Steps Priority

### Immediate (Week 1-2)
1. **Complete SynthGIS→SynthCCD bridge** (`SynthCCD/INTEGRATION_TODO.md` Phase 1)
2. **Build minimal simulation engine** (`PSAP Research/ARCHITECTURE.md` Sprint 1)
3. **Validate end-to-end**: town.gpkg → incidents → basic metrics

### Short-term (Week 3-6)
1. **Complete simulation engine core** (events, units, dispatch, routing)
2. **Build staffing scenario framework** (YAML configs, inheritance, dynamic interface)
3. **Implement experiment runner** (parallel replications, paired stats)

### Medium-term (Week 7-14)
1. **Advanced operations layers** (traffic, fatigue, cascading, multi-alarm)
2. **Experiment library** (10+ published configs)
3. **Equity analysis framework** (demographic quintiles)

### Long-term (Week 15-24)
1. **Validation & calibration** (NFPA/NENA benchmarks)
2. **Documentation & packaging** (Docker, PyPI, docs)
3. **v1.0 release**

---

## 📞 Getting Help

| Question Type | Where to Look |
|---------------|---------------|
| **How to generate a town?** | `SynthGIS/README.md` |
| **How to generate incidents?** | `SynthCCD/README.md` |
| **How to run experiments?** | `PSAP Research/EXPERIMENT_EXAMPLES.md` |
| **How to customize staffing?** | `PSAP Research/STAFFING_RESEARCH.md` |
| **What standards apply?** | `PSAP Research/STANDARDS_COMPLIANCE.md` |
| **What's missing?** | `PSAP Research/MISSING_LAYERS.md` |
| **How to implement X?** | `PSAP Research/IMPLEMENTATION_GUIDE.md` |
| **Project timeline?** | `PSAP Research/PROJECT_PLAN_DETAILED.md` |

---

## 📝 Contributing

1. **Fork** the repository
2. **Create feature branch**: `git checkout -b feature/my-feature`
3. **Follow code style**: `uv run ruff check . && uv run ruff format .`
4. **Run tests**: `uv run pytest tests/ -v`
5. **Update docs**: Keep `USERSGUIDE.md`, `REALISMGUIDE.md` in sync
6. **Submit PR** with description of changes

---

*Last Updated: November 19, 2026 | Project Version: 0.1.0 (Pre-Alpha)*