# SynthGIS — Installation & Development TODO

## ✅ Project Status: Code Complete

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
# Generate with default config
uv run synthgis generate --config config/town_spec.yaml --output output/synthetic_town.gpkg

# Validate (offline topology + schema)
uv run synthgis validate output/synthetic_town.gpkg --config config/town_spec.yaml
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
```powershell
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=synthgis --cov-report=term-missing

# Run specific test file
uv run pytest tests/test_topology.py -v
```

### Code Quality
```powershell
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
```powershell
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

### Remaining Tasks (M10)
- [ ] Create example notebooks in `notebooks/`
  - [ ] `01_explore_morphology.ipynb` — Analyze real city morphology for parameter calibration
  - [ ] `02_design_town.ipynb` — Interactive town design with config
  - [ ] `03_validate_output.ipynb` — Validation visualization
- [ ] Add GitHub Actions CI workflow (`.github/workflows/ci.yml`)
- [ ] Add pre-commit hooks (`.pre-commit-config.yaml`)
- [ ] Publish to PyPI (optional)
- [ ] Create Dockerfile for reproducible containerized runs

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