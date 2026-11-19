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
uv pip install -e ".[dev,services]"      # or: pip install -e ".[dev,services]"

# Generate a synthetic town (2D)
synthgis generate --config config/town_spec.yaml --output output/synthetic_town.gpkg

# Generate with 3D buildings (NENA-REQ-003.1)
synthgis generate --config config/town_spec.yaml --output output/synthetic_town.gpkg --3d

# Generate with routing graph export for service startup
synthgis generate --config config/town_spec.yaml --output output/synthetic_town.gpkg --export-graph output/routing_graph.pkl

# Validate (offline topology + schema)
synthgis validate output/synthetic_town.gpkg --config config/town_spec.yaml

# Start routing API (FastAPI) on port 8000
synthgis serve-routing output/synthetic_town.gpkg --graph-pickle output/routing_graph.pkl

# Start LoST service (RFC 5222) on port 8001
synthgis serve-lost output/synthetic_town.gpkg

# View in QGIS
qgis output/synthetic_town.gpkg
```

## Planned: Persistence & Expansion (Future)

```bash
# Version management
synthgis version list town.gpkg
synthgis version show town.gpkg --version 1.2.0
synthgis version diff town_v1.gpkg town_v2.gpkg --output diff.gpkg
synthgis version bump town.gpkg --type minor --message "Added northern corridor"

# Incremental expansion
synthgis expand town.gpkg --mode radial --rings 2 --output town_v2.gpkg
synthgis expand town.gpkg --mode corridor --corridor highway.geojson --width 2000 --output town_v2.gpkg
synthgis expand town.gpkg --mode infill --density 2.0 --output town_v2.gpkg
synthgis expand town.gpkg --mode satellite --center 100000,200000 --radius 2000 --output town_v2.gpkg

# Regional assembly
synthgis assemble-region region_spec.yaml --output metro.gpkg
synthgis connect-towns town_a.gpkg town_b.gpkg --type highway --output connected.gpkg
synthgis export-synthccd town.gpkg --version 1.2.0 --output town_for_synthccd.gpkg
```

*See [Persistence and Expansion](docs/Persistence_and_Expansion.md) for full design.*

## Installation

### Using uv (recommended)
```bash
# Core + dev dependencies
uv sync --extra dev
uv pip install -e .

# With services (FastAPI, LoST)
uv sync --extra dev --extra services
uv pip install -e .
```

### Using conda/mamba
```bash
conda create -n synthgis python=3.11
conda activate synthgis
conda install -c conda-forge geopandas shapely networkx momepy pyproj pyogrio numpy pysgn pydantic pydantic-yaml typer rich sqlalchemy geoalchemy2
pip install -e ".[services]"  # For FastAPI/LoST
```

### Using pip
```bash
pip install -e ".[dev,services]"
```

## Project Structure

```
SynthGIS/
├── config/
│   ├── town_spec.yaml          # Town specification (customize this)
│   └── nena_schema_v3.yaml     # NENA flatfile schema reference
├── docs/
│   ├── NENA_NG911_GIS_Standards_Reference.md
│   ├── Synthetic_Geodata_Research_Summary.md
│   └── SynthGIS_Architecture_Design.md
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
│   ├── buildings/              # Building footprints + sub-addresses + 3D
│   │   ├── footprints.py       # 2D footprint placement
│   │   ├── subaddress.py       # Building/Floor/Unit/Room/Seat
│   │   └── building_3d.py      # 3D extrusion (NENA-REQ-003.1)
│   ├── address_points.py       # SSAP generation
│   ├── operational.py          # Stations, zones, run cards
│   ├── routing.py              # NetworkX graph + pgRouting export
│   ├── validation/             # QC checks (topology, schema, SQL)
│   ├── export/                 # GeoPackage/PostGIS output
│   └── services/               # REST APIs
│       ├── routing_api.py      # FastAPI routing service
│       └── lost_service.py     # LoST protocol (RFC 5222)
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
| `Building3D` | **3D (NENA-REQ-003.1)** | Z-enabled building footprints with elevation |
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

## Services & APIs

### Routing API (FastAPI)

```bash
# Start service
synthgis serve-routing output/synthetic_town.gpkg --graph-pickle output/routing_graph.pkl

# Endpoints
# POST /route          - Point-to-point routing
# POST /isochrone      - Drive-time polygons
# POST /nearest        - Nearest fire/police/ems/hospital
# GET  /stats          - Network topology stats
# GET  /health         - Service health
```

**Example Requests:**
```bash
# Route from A to B
curl -X POST http://localhost:8000/route \
  -H "Content-Type: application/json" \
  -d '{"origin": {"x": 950000, "y": 200000}, "destination": {"x": 1000000, "y": 250000}}'

# 5-minute drive-time isochrone
curl -X POST http://localhost:8000/isochrone \
  -H "Content-Type: application/json" \
  -d '{"origin": {"x": 950000, "y": 200000}, "max_time_seconds": 300}'

# Nearest fire station
curl -X POST http://localhost:8000/nearest \
  -H "Content-Type: application/json" \
  -d '{"origin": {"x": 950000, "y": 200000}, "facility_type": "fire", "max_results": 3}'
```

### LoST Service (RFC 5222)

```bash
# Start service
synthgis serve-lost output/synthetic_town.gpkg

# Find PSAP for a location (XML)
curl -X POST http://localhost:8001/lost/findService \
  -H "Content-Type: application/xml" \
  -d '<findService xmlns="urn:ietf:params:xml:ns:lost1"><serviceBoundary>urn:emergency:service:sos.psap</serviceBoundary><location><gml:Point xmlns:gml="http://www.opengis.net/gml"><gml:pos>40.7128 -74.0060</gml:pos></gml:Point></location></findService>'
```

---

## Integration with SynthCCD

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
- [`docs/Persistence_and_Expansion.md`](docs/Persistence_and_Expansion.md) — Town persistence, versioning, incremental expansion, regional assembly
- [`docs/QGIS_Training_Guide.md`](docs/QGIS_Training_Guide.md) — QGIS workflow for SynthGIS data

## Dependencies

### Core GIS
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

### Services (optional, `--extra services`)
| Package | Version | Purpose |
|---------|---------|---------|
| `fastapi` | ≥0.110 | REST API framework |
| `uvicorn` | ≥0.29 | ASGI server |
| `lxml` | ≥4.9 | XML processing for LoST |

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