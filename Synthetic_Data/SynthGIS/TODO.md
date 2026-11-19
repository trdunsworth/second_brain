# SynthGIS — Installation & Development TODO

## ✅ Project Status: Code Complete (Core + 3D + Services Scaffolding)

All source code, configuration, documentation, and CLI are implemented. Only environment setup remains.

> **Target Platform:** Linux / macOS (Tahoe) — Windows instructions kept for reference but not needed.

---

## 🚀 Quick Start with uv (Recommended)

### 1. Install uv
```bash
# Linux / macOS
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or via pipx (if available)
pipx install uv
```

### 2. Create Environment & Install
```bash
cd /path/to/SynthGIS

# Create virtual environment
uv venv

# Activate
source .venv/bin/activate

# Install all dependencies from pyproject.toml (including dev extras)
uv sync --extra dev

# Install SynthGIS in editable mode
uv pip install -e .
```

### 3. Verify Installation
```bash
# Test imports
uv run python -c "from synthgis import TownSpec, SeedState; print('✅ Core imports OK')"

# Test CLI
uv run synthgis --help
```

### 4. Generate First Synthetic Town
```bash
# Generate with default config (2D)
uv run synthgis generate --config config/town_spec.yaml --output output/synthetic_town.gpkg

# Generate with 3D buildings (NENA-REQ-003.1)
uv run synthgis generate --config config/town_spec.yaml --output output/synthetic_town.gpkg --3d

# Generate with routing graph export for service startup
uv run synthgis generate --config config/town_spec.yaml --output output/synthetic_town.gpkg --export-graph output/routing_graph.pkl

# Full monty: 3D + graph export
uv run synthgis generate --config config/town_spec.yaml --output output/synthetic_town.gpkg --3d --export-graph output/routing_graph.pkl

# Validate (offline topology + schema)
uv run synthgis validate output/synthetic_town.gpkg --config config/town_spec.yaml
```

### 5. Run Services
```bash
# Start routing API (FastAPI) on port 8000
uv run synthgis serve-routing output/synthetic_town.gpkg --graph-pickle output/routing_graph.pkl

# Start LoST service on port 8001
uv run synthgis serve-lost output/synthetic_town.gpkg

# Test routing API
curl -X POST http://localhost:8000/route \
  -H "Content-Type: application/json" \
  -d '{"origin": {"x": 950000, "y": 200000}, "destination": {"x": 1000000, "y": 250000}}'

# Test isochrone
curl -X POST http://localhost:8000/isochrone \
  -H "Content-Type: application/json" \
  -d '{"origin": {"x": 950000, "y": 200000}, "max_time_seconds": 300}'

# Test LoST (XML)
curl -X POST http://localhost:8001/lost/findService \
  -H "Content-Type: application/xml" \
  -d '<findService xmlns="urn:ietf:params:xml:ns:lost1"><serviceBoundary>urn:emergency:service:sos.psap</serviceBoundary><location><gml:Point xmlns:gml="http://www.opengis.net/gml"><gml:pos>40.7128 -74.0060</gml:pos></gml:Point></location></findService>'
```

---

## 🔧 Alternative: Conda/Mamba (Also Great on Linux/macOS)

```bash
# Create environment
conda create -n synthgis python=3.11
conda activate synthgis

# Install GIS stack from conda-forge (pre-compiled binaries)
conda install -c conda-forge \
    geopandas shapely networkx momepy pyproj pyogrio \
    numpy pandas pydantic pydantic-yaml typer rich \
    sqlalchemy geoalchemy2 pyyaml \
    libpysal scipy

# Install PySGN (pure Python)
pip install pysgn

# Install SynthGIS
pip install -e .
```

---

## 📋 Development Commands

### Run Tests
```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=synthgis --cov-report=term-missing

# Run specific test file
uv run pytest tests/test_topology.py -v
```

### Code Quality
```bash
# Lint with ruff
uv run ruff check src/

# Auto-fix lint issues
uv run ruff check --fix src/

# Format code
uv run ruff format src/

# Type check with mypy
uv run mypy src/
```

### Generate Documentation
```bash
# NENA schema report (Excel) - not yet implemented
uv run synthgis nena-report --schema config/nena_schema_v3.yaml --output docs/nena_schema_report.xlsx
```

---

## 🎯 Next Development Milestones

| Milestone | Task | Status |
|-----------|------|--------|
| **M1** | Config + CRS + Seeding + Boundaries | ✅ Done |
| **M2** | Street Network (arterial→collector→local) | ✅ Done |
| **M3** | Address Ranges (CLDXF) + Naming | ✅ Done |
| **M4** | Block Parcelization + Tessellation | ✅ Done |
| **M5** | Building Footprints + SSAP (full CLDXF) | ✅ Done |
| **M6** | Operational Layers (stations, zones, run cards) | ✅ Done |
| **M7** | Routing Graph + Travel-Time + pgRouting | ✅ Done |
| **M8** | PostGIS Validation + QC SQL Suite | ✅ Done |
| **M9** | GeoPackage Export + Metadata + SynthCCD Integration | ✅ Done |
| **M10** | Documentation + Notebooks + CI/CD | 🔄 In Progress |
| **M11** | **3D Buildings (NENA-REQ-003.1)** | 🟡 Scaffolding Done |
| **M12** | **Routing API (FastAPI)** | 🟡 Scaffolding Done |
| **M13** | **LoST Protocol (RFC 5222)** | 🟡 Scaffolding Done |
| **M14** | **SynthCCD Integration** | 🟡 Exploration Done |

### Remaining Tasks (M10-M14)
- [ ] Create example notebooks in `notebooks/`
  - [ ] `01_explore_morphology.ipynb` — Analyze real city morphology for parameter calibration
  - [ ] `02_design_town.ipynb` — Interactive town design with config
  - [ ] `03_validate_output.ipynb` — Validation visualization
- [ ] Add GitHub Actions CI workflow (`.github/workflows/ci.yml`)
- [ ] Add pre-commit hooks (`.pre-commit-config.yaml`)
- [ ] Publish to PyPI (optional)
- [ ] Create Dockerfile for reproducible containerized runs
- [ ] **3D Buildings**: Complete gabled/hipped roof geometry, CityJSON export, DEM integration
- [ ] **Routing API**: Add turn restrictions, multimodal (pedestrian/bike), traffic simulation
- [ ] **LoST Service**: Full RFC 5222 compliance, recursive queries, SOAP bindings
- [ ] **SynthCCD Integration**: 
  - [ ] Create `SynthGISAddressProvider` in SynthCCD
  - [ ] Add `--synthgis-town` / `--synthgis-graph` CLI flags to SynthCCD
  - [ ] Implement routing-based travel times
  - [ ] Implement service boundary dispatch
  - [ ] Implement population surface weighting
  - [ ] End-to-end integration test
  - [ ] Update both USERSGUIDE.md files

### New Milestones: Persistence & Expansion (M15-M18)

| Milestone | Task | Status |
|-----------|------|--------|
| **M15** | **Core Persistence & Versioning** | 🟡 Planned |
| **M16** | **Incremental Expansion Engine** | 🟡 Planned |
| **M17** | **Regional Assembly & Merging** | 🟡 Planned |
| **M18** | **Advanced Growth Simulation** | 🟡 Planned |

### Remaining Tasks (M15-M18)
- [ ] **M15 - Core Persistence & Versioning**
  - [ ] Metadata layer with semantic versioning in GeoPackage
  - [ ] PostGIS versioning table + migration scripts
  - [ ] `synthgis version` CLI (list, show, diff, tag)
  - [ ] Changelog schema in metadata
  - [ ] QGIS diff layer generation
  
- [ ] **M16 - Incremental Expansion Engine**
  - [ ] `TownExpander` class (radial, corridor, infill, satellite)
  - [ ] Topology-preserving layer merge logic
  - [ ] `synthgis expand` CLI with all modes
  - [ ] Expansion profiles config (suburban, urban, rural, corridor)
  - [ ] Density gradient and growth trigger configs
  
- [ ] **M17 - Regional Assembly & Merging**
  - [ ] `RegionAssembler` class
  - [ ] Connector infrastructure (highway, rail, arterial)
  - [ ] Service boundary harmonization (regional PSAP, mutual aid)
  - [ ] `synthgis assemble-region` CLI
  - [ ] Regional routing graph generation
  
- [ ] **M18 - Advanced Growth Simulation**
  - [ ] Time-travel queries (town at version X)
  - [ ] Scenario branching (what-if analysis)
  - [ ] Cellular automata / agent-based growth simulation
  - [ ] Automated calibration from OSM (inverse problem)
  - [ ] Export to CityJSON / 3D Tiles / Cesium
  - [ ] SynthCCD integration at specific versions

---

## 🔗 Integration with SynthCCD

Once SynthGIS generates `synthetic_town.gpkg`, SynthCCD can read it directly:

```python
# In SynthCCD
import geopandas as gpd

class SynthGISLoader:
    def __init__(self, gpkg_path: str):
        self.gpkg = gpkg_path

    def road_network(self) -> gpd.GeoDataFrame:
        return gpd.read_file(self.gpkg, layer="RoadCenterLine")

    def address_points(self) -> gpd.GeoDataFrame:
        return gpd.read_file(self.gpkg, layer="SiteStructureAddressPoint")

    def service_boundaries(self, service: str) -> gpd.GeoDataFrame:
        layer_map = {
            "psap": "PsapPolygon",
            "fire": "FirePolygon",
            "police": "PolicePolygon",
            "ems": "EmsPolygon",
        }
        return gpd.read_file(self.gpkg, layer=layer_map[service])

    def geocode(self, address: str) -> Point:
        # Local interpolation using RCL address ranges
        pass

    def route(self, from_pt: Point, to_pt: Point) -> LineString:
        # NetworkX routing on RoadCenterLine graph
        pass
```

---

## 📚 Key Documentation Files

| File | Description |
|------|-------------|
| `docs/NENA_NG911_GIS_Standards_Reference.md` | Complete NENA-STA-006.3 distillation |
| `docs/Synthetic_Geodata_Research_Summary.md` | 2023-2026 research survey |
| `docs/SynthGIS_Architecture_Design.md` | Technical architecture & module specs |
| `config/town_spec.yaml` | Town specification (customize this) |
| `config/nena_schema_v3.yaml` | NENA flatfile schema reference |

---

## ⚠️ Known Issues / Notes

1. **Windows pip SSL timeouts** — Use `uv` or `conda` instead of raw `pip`
2. **Executable permissions** — Windows may fail on script installs; `uv` handles this better
3. **PostGIS QC** — Requires running PostgreSQL/PostGIS instance (optional)
4. **Large dependencies** — `scipy`, `scikit-learn`, `momepy` take time to compile; conda binaries are faster

---

## 📝 Quick Config Customization

Edit `config/town_spec.yaml` to customize your synthetic town:

```yaml
metadata:
  name: "MyTown"
  state: "XX"                   # Fictional state code
  nguid_domain: "myorg.example" # Your fictional domain

extent:
  minx: 900000                  # Projected CRS coordinates (feet for EPSG:2263)
  maxx: 1050000
  miny: 180000
  maxy: 300000

seed: 12345                     # Set for reproducibility

street_hierarchy:
  arterial:
    target_length_km: 20
    spacing_m: 1000
    road_class: "SH"
  # ... collector, local, cul_de_sac

zoning:
  residential:
    proportion: 0.7
    min_parcel_sqm: 500
    # ...
```

---

*Generated with SynthGIS v0.1.0 — NENA-STA-006.3-2026 compliant synthetic city generator*