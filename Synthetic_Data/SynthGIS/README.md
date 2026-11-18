# SynthGIS — Synthetic City GIS for NG9-1-1

> **Deterministic, NENA-STA-006.3-compliant synthetic city generation for NG9-1-1 testing, training, and SynthCCD incident simulation.**

## Overview

SynthGIS generates a complete, fictional city as a **GeoPackage** (`.gpkg`) or **PostGIS** database containing all NENA NG9-1-1 GIS Data Model layers. The generation is **seed-locked** — identical seed produces identical output — making it ideal for reproducible testing, CI/CD pipelines, and offline distribution.

**Key Features:**
- ✅ NENA-STA-006.3-2026 compliant (all Required, Strongly Recommended, Recommended layers)
- ✅ CLDXF-US (NENA-STA-004.2-2024) address format
- ✅ Seed-locked deterministic generation (NumPy PCG64)
- ✅ Single-file GeoPackage output (offline, portable, QGIS-native)
- ✅ PostGIS authoring/validation pipeline with automated QC
- ✅ Routing graph with travel-time weights (NetworkX/pgRouting)
- ✅ Operational layers for CAD/Dispatch (stations, zones, run cards)
- ✅ Extensible Python architecture (shapely, geopandas, networkx, momepy, PySGN)

## Quick Start

```bash
# Install dependencies (recommended: uv or conda)
uv pip install -e ".[dev]"      # or: pip install -e ".[dev]"

# Generate a synthetic town
synthgis generate --config config/town_spec.yaml --output output/synthetic_town.gpkg

# Validate with PostGIS (optional)
synthgis generate --config config/town_spec.yaml --output output/synthetic_town.gpkg \
    --postgis postgresql://user:pass@localhost/synthgis --qc

# View in QGIS
qgis output/synthetic_town.gpkg
```

## Installation

### Using uv (recommended)
```bash
uv sync                    # Install all dependencies
uv pip install -e .        # Install SynthGIS in editable mode
```

### Using conda/mamba
```bash
conda create -n synthgis python=3.11
conda activate synthgis
conda install -c conda-forge geopandas shapely networkx momepy pyproj pyogrio numpy pysgn pydantic pydantic-yaml typer rich sqlalchemy geoalchemy2
pip install -e .
```

### Using pip
```bash
pip install -e ".[dev]"
```

## Project Structure

```
SynthGIS/
├── config/
│   └── town_spec.yaml          # Town specification (customize this)
├── src/synthgis/
│   ├── config.py               # Pydantic config models
│   ├── seeding.py              # Deterministic RNG management
│   ├── boundaries.py           # Provisioning/PSAP/ESB polygons
│   ├── streets/                # Street network generation
│   │   ├── generator.py        # Procedural hierarchy (arterial→local)
│   │   ├── topology.py         # momepy graph cleaning
│   │   ├── addressing.py       # CLDXF address ranges
│   │   └── naming.py           # Fictional street names
│   ├── parcels/                # Block→parcel subdivision
│   │   ├── tessellation.py     # momepy morphological tessellation
│   │   ├── subdivision.py      # Recursive splitting with setbacks
│   │   └── zoning.py           # Land use assignment
│   ├── buildings/              # Building footprints + sub-addresses
│   ├── address_points.py       # SSAP generation
│   ├── operational.py          # Stations, zones, run cards
│   ├── routing.py              # NetworkX graph + pgRouting export
│   ├── validation/             # QC checks
│   └── export/                 # GeoPackage/PostGIS output
├── scripts/                    # Utility scripts
├── notebooks/                  # Exploration notebooks
└── output/                     # Generated artifacts
```

## Configuration

Edit `config/town_spec.yaml` to customize your town:

```yaml
metadata:
  name: "MyTown"
  state: "XX"                   # Fictional state code
  nguid_domain: "myorg.example" # Your fictional domain

extent:
  minx: 900000                  # Projected CRS coordinates
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

## NENA Layers Generated

| Layer | NENA Category | Description |
|-------|---------------|-------------|
| `RoadCenterLine` | **Required** | Street centerlines with CLDXF address ranges |
| `SiteStructureAddressPoint` | **Required** | Address points with full sub-address (Building/Floor/Unit/Room/Seat) |
| `PsapPolygon` | **Required** | PSAP service boundaries |
| `FirePolygon` | **Required** | Fire service boundaries |
| `PolicePolygon` | **Required** | Law enforcement boundaries |
| `EmsPolygon` | **Required** | EMS boundaries |
| `ProvisioningPolygon` | **Required** | Data authority extent |
| `*ZonePolygon` | **Strongly Rec.** | Response zones per service |
| `*StationPoint` | **Operational** | Fire/Police/EMS/Hospital stations |
| `*RunCard` | **Operational** | Zone→apparatus dispatch rules |
| `RailroadCenterLine` | **Recommended** | Rail infrastructure |
| `HydrologyLine/Polygon` | **Recommended** | Water features |
| `LocationMarkerPoint` | **Recommended** | Mile markers, call boxes |

## Validation

### Topology & Schema (offline, no PostGIS required)
```bash
synthgis validate output/synthetic_town.gpkg --config config/town_spec.yaml
```

### NENA QC Checks (requires PostGIS)
```bash
# Load to PostGIS and run QC
synthgis generate --config config/town_spec.yaml --output out.gpkg \
    --postgis postgresql://user:pass@db/synthgis --qc
```

Checks include:
- Geometry validity (`ST_IsValid`)
- NGUID uniqueness
- Address range direction & parity consistency
- Address point proximity to streets (< 100m)
- Boundary topology (no gaps/overlaps)
- Centerlines split at boundaries
- Required field completeness
- CLDXF domain compliance

## Integration with SynthCCD

SynthGIS outputs a GeoPackage that SynthCCD reads directly:

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

## Documentation

- [`docs/NENA_NG911_GIS_Standards_Reference.md`](docs/NENA_NG911_GIS_Standards_Reference.md) — Complete NENA schema distillation
- [`docs/Synthetic_Geodata_Research_Summary.md`](docs/Synthetic_Geodata_Research_Summary.md) — Contemporary research survey
- [`docs/SynthGIS_Architecture_Design.md`](docs/SynthGIS_Architecture_Design.md) — Technical architecture & module specs

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `geopandas` | ≥1.0 | Spatial DataFrames, I/O |
| `shapely` | ≥2.0 | Geometry ops, STRtree |
| `networkx` | ≥3.2 | Graph topology, routing |
| `momepy` | ≥0.11 | Urban morphology, tessellation |
| `pyproj` | ≥3.6 | CRS handling |
| `pyogrio` | ≥0.8 | Fast GeoPackage I/O |
| `pysgn` | ≥0.2 | Synthetic geospatial networks |
| `numpy` | ≥1.26 | Seeded RNG (`default_rng`) |
| `sqlalchemy` + `geoalchemy2` | ≥2.0 | PostGIS ORM |

## License

MIT License — see [LICENSE](LICENSE)

**Synthetic Data Disclaimer:** All generated data is explicitly marked as synthetic (`DataSource=SYNTHETIC`, `Disclaimer=NOT FOR OPERATIONAL USE`) and uses fictional jurisdictions/NGUID domains. Not for operational 9-1-1 use.

## References

- NENA-STA-006.3-2026: NG9-1-1 GIS Data Model
- NENA-STA-004.2-2024: CLDXF-US Civic Location Data Exchange Format
- NENA Templates: https://github.com/NENA911/NG911GISDataModel
- momepy: Fleischmann (2019), JOSS
- PySGN: Wang et al. (2026), JOSS
- OSMnx: Boeing (2025)