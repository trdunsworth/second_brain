# SynthGIS — Synthetic City GIS for NG9-1-1
## Architecture, Design & Implementation Specification

> **Goal:** Generate a deterministic, NENA-STA-006.3-compliant synthetic city as a GeoPackage/PostGIS database, suitable for SynthCCD incident generation, NG9-1-1 testing, and GIS training.
> **Philosophy:** Seed-locked procedural generation → PostGIS validation → GeoPackage distribution. No external APIs at runtime.

---

## 1. Project Structure

```
SynthGIS/
├── docs/
│   ├── NENA_NG911_GIS_Standards_Reference.md
│   ├── Synthetic_Geodata_Research_Summary.md
│   └── SynthGIS_Architecture_Design.md          (this file)
├── config/
│   ├── town_spec.yaml           # Extent, CRS, hierarchy, seed, fictional names
│   ├── nena_schema_v3.yaml      # NENA flatfile schema (from NENA templates)
│   └── clxdf_domains.yaml       # CLDXF-US domain values (street types, dirs, etc.)
├── src/
│   ├── synthgis/
│   │   ├── __init__.py
│   │   ├── config.py            # Pydantic models for config
│   │   ├── crs.py               # CRS selection, State Plane/UTM helpers
│   │   ├── seeding.py           # RNG management, seed persistence
│   │   ├── boundaries.py        # Provisioning, PSAP, ESB generation
│   │   ├── hydrology.py         # River/creek generation (constrains streets)
│   │   ├── streets/
│   │   │   ├── __init__.py
│   │   │   ├── generator.py     # Procedural street network (arterial→local)
│   │   │   ├── topology.py      # Split, snap, validate, graph conversion
│   │   │   ├── addressing.py    # Address ranges, CLDXF parity, interpolation
│   │   │   └── naming.py        # Fictional street name generator
│   │   ├── parcels/
│   │   │   ├── __init__.py
│   │   │   ├── tessellation.py  # momepy morphological tessellation
│   │   │   ├── subdivision.py   # Block → parcel (setbacks, zoning)
│   │   │   └── zoning.py        # Land use assignment
│   │   ├── buildings/
│   │   │   ├── __init__.py
│   │   │   ├── footprints.py    # Building placement per parcel
│   │   │   └── subaddress.py    # Building/Floor/Unit/Room/Seat
│   │   ├── address_points.py    # SSAP generation, placement, CLDXF fields
│   │   ├── operational.py       # Stations, response zones, run cards, hospitals
│   │   ├── routing.py           # NetworkX graph, travel-time, pgRouting export
│   │   ├── validation/
│   │   │   ├── __init__.py
│   │   │   ├── qc_sql.py        # NENA QC checks (PostGIS)
│   │   │   ├── topology.py      # Shapely/momepy topology rules
│   │   │   └── schema.py        # Field completeness, domain validation
│   │   ├── export/
│   │   │   ├── __init__.py
│   │   │   ├── geopackage.py    # pyogrio export with metadata
│   │   │   ├── postgis.py       # SQLAlchemy/GeoAlchemy2 load
│   │   │   └── lost_service.py  # Optional: point-in-polygon routing
│   │   └── cli.py               # Typer/Click CLI: generate, validate, export
│   └── tests/
│       ├── test_topology.py
│       ├── test_addressing.py
│       ├── test_nena_compliance.py
│       └── fixtures/
├── scripts/
│   ├── generate_town.py         # Main entry point
│   ├── validate_gpkg.py         # Standalone QC on .gpkg
│   └── nena_template_report.py  # Schema → Excel report
├── data/
│   ├── raw/                     # Reference OSM extracts (for morphology stats only)
│   └── output/
│       ├── synthetic_town.gpkg  # Primary artifact
│       └── synthetic_town/      # PostGIS SQL dumps
├── notebooks/
│   ├── 01_explore_morphology.ipynb
│   ├── 02_design_town.ipynb
│   └── 03_validate_output.ipynb
├── pyproject.toml
├── uv.lock / requirements.txt
└── README.md
```

---

## 2. Configuration Schema (`config/town_spec.yaml`)

```yaml
# SynthGIS Town Specification
metadata:
  name: "Synthville"
  state: "SY"                    # Fictional USPS code
  county: "Synthetic County"
  municipality: "Synthville"
  nguid_domain: "synthgis.local" # NENA NGUID domain
  disclaimer: "SYNTHETIC DATA - NOT FOR OPERATIONAL USE"
  license: "CC-BY-4.0"
  generated_by: "SynthGIS v0.1.0"
  seed: 42                       # Master seed (int or null for random)

crs:
  projected: "EPSG:2263"         # NAD83 / New York Long Island (ftUS) — example
  geographic: "EPSG:4326"        # WGS84 for export

extent:
  # Bounding box in projected CRS
  minx: 900000
  maxx: 1050000
  miny: 180000
  maxy: 300000
  # ~4.5km x 3.6km ≈ 16 km² (small town)

street_hierarchy:
  arterial:
    target_length_km: 15
    spacing_m: 800
    road_class: "SH"             # State highway
    speed_mph: 45
    lanes: 2
    divided: false
  collector:
    target_length_km: 30
    spacing_m: 300
    road_class: "CO"
    speed_mph: 35
    lanes: 2
    divided: false
  local:
    target_length_km: 80
    spacing_m: 100
    road_class: "LO"
    speed_mph: 25
    lanes: 2
    divided: false
  cul_de_sac:
    max_length_m: 150
    road_class: "LO"
    speed_mph: 15

zoning:
  residential:
    proportion: 0.65
    min_parcel_sqm: 400
    max_parcel_sqm: 2000
    setback_m: 6
    building_coverage: 0.35
    floors: [1, 2]
  commercial:
    proportion: 0.20
    min_parcel_sqm: 1000
    max_parcel_sqm: 10000
    setback_m: 10
    building_coverage: 0.50
    floors: [1, 3]
  industrial:
    proportion: 0.10
    min_parcel_sqm: 5000
    max_parcel_sqm: 50000
    setback_m: 15
    building_coverage: 0.60
    floors: [1, 2]
  civic:
    proportion: 0.05
    # schools, city hall, fire station, etc.

hydrology:
  enabled: true
  stream_count: 1
  min_width_m: 10
  max_width_m: 50
  # Forces bridges, shapes blocks

addressing:
  scheme: "grid_quadrant"        # or "mile_marker", "sequential"
  quadrant_origin: "center"      # SW/NE/etc.
  base_interval: 100             # Addresses per block face
  parity: "even_odd"             # Standard US

operational:
  psap_count: 1
  fire_stations: 2
  police_stations: 1
  ems_stations: 2
  hospitals: 1
  response_zones_per_service: 4

output:
  geopackage: "output/synthetic_town.gpkg"
  postgis_dump: "output/synthetic_town.sql"
  include_metadata_layer: true
```

---

## 3. Core Generation Modules — Detailed Design

### 3.1 `seeding.py` — Deterministic RNG Management

```python
# synthgis/seeding.py
import numpy as np
from dataclasses import dataclass
from typing import Optional
import hashlib
import json

@dataclass(frozen=True)
class SeedState:
    master_seed: int
    substreams: dict[str, int]  # module_name -> subseed

    @classmethod
    def from_master(cls, master_seed: int, modules: list[str]) -> "SeedState":
        rng = np.random.default_rng(master_seed)
        substreams = {m: int(rng.integers(2**32)) for m in modules}
        return cls(master_seed=master_seed, substreams=substreams)

    def rng(self, module: str) -> np.random.Generator:
        return np.random.default_rng(self.substreams[module])

    def to_json(self) -> str:
        return json.dumps({"master_seed": self.master_seed, "substreams": self.substreams})

    @classmethod
    def from_json(cls, data: str) -> "SeedState":
        d = json.loads(data)
        return cls(master_seed=d["master_seed"], substreams=d["substreams"])
```

**Usage:** Every module gets its own `Generator` via `seed_state.rng("streets")`. Substreams derived from master seed → fully reproducible.

---

### 3.2 `boundaries.py` — Provisioning/PSAP/ESB Polygons

```python
# synthgis/boundaries.py
import geopandas as gpd
from shapely.geometry import Polygon, MultiPolygon
from shapely.ops import unary_union, voronoi_diagram
import numpy as np

def generate_provisioning_boundary(extent: dict, seed: np.random.Generator) -> Polygon:
    """Outer boundary — slightly irregular rectangle."""
    minx, maxx = extent["minx"], extent["maxx"]
    miny, maxy = extent["miny"], extent["maxy"]
    # Add small perturbations to corners
    pts = [
        (minx + seed.uniform(-50, 50), miny + seed.uniform(-50, 50)),
        (maxx + seed.uniform(-50, 50), miny + seed.uniform(-50, 50)),
        (maxx + seed.uniform(-50, 50), maxy + seed.uniform(-50, 50)),
        (minx + seed.uniform(-50, 50), maxy + seed.uniform(-50, 50)),
    ]
    return Polygon(pts).buffer(0)  # clean

def generate_service_boundaries(
    provisioning: Polygon,
    psap_count: int,
    fire_zones: int,
    police_zones: int,
    ems_zones: int,
    seed: np.random.Generator,
) -> dict[str, gpd.GeoDataFrame]:
    """Voronoi partition of provisioning area for each service type."""
    # Generate seed points for each service
    # Clip to provisioning, ensure no gaps/overlaps
    # Assign ServiceURN per NENA
    pass
```

**NENA Compliance:**
- `ServiceURN`: `urn:emergency:service:sos.psap`, `urn:emergency:service:sos.fire`, etc.
- `DisplayName` field populated for CHE/CPE
- No gaps/overlaps within layer; coincident boundaries where services align

---

### 3.3 `streets/generator.py` — Procedural Street Network

```python
# synthgis/streets/generator.py
import networkx as nx
import geopandas as gpd
from shapely.geometry import LineString, Point
from shapely.ops import linemerge, unary_union, split
import momepy
import numpy as np
from pysgn import geo_erdos_renyi_network, geo_watts_strogatz_network

class StreetNetworkGenerator:
    def __init__(self, config, seed_state):
        self.config = config
        self.seed = seed_state.rng("streets")
        self.crs = config.crs.projected

    def generate_arterial_backbone(self) -> gpd.GeoDataFrame:
        """Grid + organic major roads."""
        # Start with regular grid spacing
        # Perturb with Perlin noise or similar
        # Ensure connectivity to boundary

    def generate_collectors(self, arterials: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
        """Connect arterials, form block structure."""
        # Use momepy.gdf_to_nx(arterials, approach="primal")
        # Add edges via PySGN geospatial Watts-Strogatz (k=4, p=0.3)
        # Constrain: edges must connect to arterial nodes

    def generate_locals(self, collectors: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
        """Subdivide blocks into local streets + cul-de-sacs."""
        # Polygonize collector network → blocks
        # For each block: recursive subdivision (quadtree-like)
        # Add cul-de-sacs at dead ends (momepy dead_ends)

    def assemble_network(self) -> gpd.GeoDataFrame:
        arterials = self.generate_arterial_backbone()
        collectors = self.generate_collectors(arterials)
        locals = self.generate_locals(collectors)
        # Merge, assign RoadClass, split at all intersections
        return self._split_at_intersections(merged)

    def _split_at_intersections(self, gdf: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
        # momepy.gdf_to_nx(approach="primal") → nx_to_gdf(lines=True)
        # Ensures every intersection is a node, segments are edges
        pass
```

**Key Topology Rules:**
1. `momepy.gdf_to_nx(approach="primal")` → `momepy.nx_to_gdf(lines=True)` round-trip enforces split-at-intersection
2. `shapely.set_precision(grid_size=0.01)` for coordinate snapping
3. `shapely.make_valid()` after every geometric operation

---

### 3.4 `streets/addressing.py` — CLDXF-Compliant Address Ranges

```python
# synthgis/streets/addressing.py
from dataclasses import dataclass
from enum import Enum
import numpy as np

class Parity(str, Enum):
    EVEN = "E"
    ODD = "O"
    BOTH = "B"
    ZERO = "Z"

@dataclass
class AddressRange:
    from_left: int
    to_left: int
    from_right: int
    to_right: int
    parity_left: Parity
    parity_right: Parity

def assign_address_ranges(
    streets: gpd.GeoDataFrame,
    config: AddressingConfig,
    seed: np.random.Generator,
) -> gpd.GeoDataFrame:
    """
    For each street segment:
    1. Determine direction (from_node → to_node)
    2. Left/Right side by geometry (shapely.ops.split + offset_curve)
    3. Assign sequential ranges per quadrant/grid
    4. Ensure parity matches CLDXF: Even→even numbers, Odd→odd
    5. No overlaps on same St_Name + Community
    """
    # Use street_name + community as range group key
    # Interpolate: address = base + (distance_along / segment_length) * interval
    pass

def interpolate_address_point(
    line: LineString,
    address_number: int,
    side: str,  # "L" or "R"
    offset_m: float = 10.0,
) -> Point:
    """Offset from centerline by side + distance along line."""
    # Project address_number to line fraction
    # offset_curve(side * offset_m)
    pass
```

**CLDXF Parity Rules:**
| Parity Code | Meaning | Address Numbers |
|-------------|---------|-----------------|
| `E` | Even | 2, 4, 6, ... |
| `O` | Odd | 1, 3, 5, ... |
| `B` | Both | Mixed (rare) |
| `Z` | Zero | No addresses |

---

### 3.5 `parcels/tessellation.py` — Morphological Blocks & Parcels

```python
# synthgis/parcels/tessellation.py
import momepy
import geopandas as gpd
from shapely.geometry import Polygon
from shapely.ops import voronoi_diagram

def blocks_from_streets(streets: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """Polygonize street network → block polygons."""
    # momepy expects LineString network
    # Use shapely.ops.polygonize on noded lines
    pass

def morphological_tessellation(
    buildings: gpd.GeoDataFrame,
    streets: gpd.GeoDataFrame,
    buffer_m: float = 50,
) -> gpd.GeoDataFrame:
    """momepy.morphological_tessellation — Voronoi cells clipped to street network."""
    limit = momepy.buffered_limit(buildings, buffer=buffer_m)
    tess = momepy.morphological_tessellation(buildings, clip=limit)
    # Attach street index: nearest street segment
    tess["street_index"] = momepy.get_network_id(tess, streets, "geometry")
    return tess

def subdivide_blocks_to_parcels(
    blocks: gpd.GeoDataFrame,
    zoning: gpd.GeoDataFrame,  # land use per block
    config: ParcelConfig,
    seed: np.random.Generator,
) -> gpd.GeoDataFrame:
    """Recursive subdivision with setbacks."""
    parcels = []
    for _, block in blocks.iterrows():
        zone = zoning.loc[block.name, "zone_type"]
        params = config.for_zone(zone)
        # Start with block polygon
        # Inward offset (setback) → buildable area
        # Subdivide: recursive split by longest axis
        # Until parcel area in [min, max]
        # Apply building_coverage ratio for footprint size
        pass
    return gpd.GeoDataFrame(parcels, crs=blocks.crs)
```

---

### 3.6 `address_points.py` — SiteStructureAddressPoint Generation

```python
# synthgis/address_points.py
import geopandas as gpd
from shapely.geometry import Point
import numpy as np

CLDXF_PLACEMENT = ["CEN", "ENT", "STR", "PAR"]  # Centroid, Entrance, Structure, Parcel
CLDXF_PLACETYPE = ["S", "ST", "B", "U"]        # Site, Structure, Building, Unit

def generate_address_points(
    parcels: gpd.GeoDataFrame,
    buildings: gpd.GeoDataFrame,
    streets: gpd.GeoDataFrame,
    config: AddressingConfig,
    seed: np.random.Generator,
) -> gpd.GeoDataFrame:
    """
    For each building:
    1. Determine address number via street interpolation
    2. Assign CLDXF street name components (denormalized from RCL)
    3. Generate sub-addresses (Building/Floor/Unit/Room/Seat)
    4. Place point: entrance > structure centroid > parcel centroid
    5. Populate all NENA-required + CLDXF fields
    """
    points = []
    for _, bldg in buildings.iterrows():
        # Find nearest street segment (with matching name)
        street = _nearest_street(bldg, streets)
        addr_num = _interpolate_address(bldg, street)
        # Sub-address logic
        for unit in _generate_units(bldg, config):
            pt = _placement_point(bldg, street, unit.placement)
            points.append({
                "NGUID": _make_nguid("ssap", len(points)),
                "AddNum": addr_num,
                "AddNumSuf": unit.suffix,
                "St_PreDir": street.St_PreDir,
                "St_Name": street.St_Name,
                "St_PosTyp": street.St_PosTyp,
                "St_PosDir": street.St_PosDir,
                "SiteName": unit.site_name,
                "Building": unit.building,
                "Floor": unit.floor,
                "Unit": unit.unit,
                "Room": unit.room,
                "Seat": unit.seat,
                "PlaceType": unit.place_type,
                "Placement": unit.placement,
                "State": config.state,
                "County": config.county,
                "Inc_Muni": config.municipality,
                "PostCode": _assign_zipcode(bldg, config),
                "ESN": _assign_esn(bldg, config),
                "DateUpdate": config.generation_date,
                "geom": pt,
            })
    return gpd.GeoDataFrame(points, crs=streets.crs)
```

---

### 3.7 `validation/qc_sql.py` — NENA QC Checks (PostGIS)

```python
# synthgis/validation/qc_sql.py
QC_CHECKS = {
    "rcl_geometry_valid": """
        SELECT rcl_id, nguid FROM ng911_road_centerlines
        WHERE NOT ST_IsValid(geom);
    """,
    "rcl_duplicate_nguid": """
        SELECT nguid, COUNT(*) FROM ng911_road_centerlines
        GROUP BY nguid HAVING COUNT(*) > 1;
    """,
    "rcl_address_range_direction": """
        SELECT rcl_id, street_name
        FROM ng911_road_centerlines
        WHERE from_address_left > to_address_left
           OR from_address_right > to_address_right;
    """,
    "rcl_parity_consistency": """
        SELECT rcl_id, street_name, parity_left, from_address_left, to_address_left
        FROM ng911_road_centerlines
        WHERE (parity_left = 'E' AND (from_address_left % 2 <> 0 OR to_address_left % 2 <> 0))
           OR (parity_left = 'O' AND (from_address_left % 2 = 0 OR to_address_left % 2 = 0))
           OR (parity_right = 'E' AND (from_address_right % 2 <> 0 OR to_address_right % 2 <> 0))
           OR (parity_right = 'O' AND (from_address_right % 2 = 0 OR to_address_right % 2 = 0));
    """,
    "ssap_geometry_valid": """
        SELECT point_id, nguid FROM ng911_address_points
        WHERE NOT ST_IsValid(geom);
    """,
    "ssap_near_street": """
        SELECT a.point_id, a.address_number, a.street_name
        FROM ng911_address_points a
        WHERE NOT EXISTS (
            SELECT 1 FROM ng911_road_centerlines r
            WHERE r.street_name = a.street_name
              AND ST_DWithin(a.geom, r.geom, 100.0)
        );
    """,
    "ssap_parity_match": """
        SELECT a.point_id, a.address_number, a.street_name,
               r.parity_left, r.parity_right
        FROM ng911_address_points a
        JOIN ng911_road_centerlines r
          ON r.street_name = a.street_name
         AND ST_DWithin(a.geom, r.geom, 50.0)
        WHERE (ST_Azimuth(ST_StartPoint(r.geom), ST_EndPoint(r.geom)) < 3.14
               AND a.address_number % 2 = 0 AND r.parity_left = 'O')
            OR (ST_Azimuth(ST_StartPoint(r.geom), ST_EndPoint(r.geom)) >= 3.14
               AND a.address_number % 2 = 0 AND r.parity_right = 'O');
    """,
    "boundary_topology_gaps": """
        -- Check for gaps in provisioning boundary
        SELECT ST_IsValid(ST_Union(geom)) as is_valid,
               ST_Area(ST_Union(geom)) as total_area
        FROM ng911_provisioning_polygon;
    """,
    "boundary_overlaps": """
        SELECT a.nguid, b.nguid
        FROM ng911_fire_polygon a, ng911_fire_polygon b
        WHERE a.nguid < b.nguid
          AND ST_Overlaps(a.geom, b.geom);
    """,
    "centerlines_split_at_boundaries": """
        SELECT r.rcl_id, r.street_name, COUNT(*) as segments
        FROM ng911_road_centerlines r
        JOIN ng911_provisioning_polygon p ON ST_Intersects(r.geom, p.geom)
        GROUP BY r.rcl_id, r.street_name
        HAVING COUNT(*) = 1 AND ST_Crosses(r.geom, ST_Boundary(p.geom));
    """,
}
```

---

### 3.8 `export/geopackage.py` — GeoPackage Export with Metadata

```python
# synthgis/export/geopackage.py
import geopandas as gpd
import pyogrio
from datetime import datetime
import json

NENA_LAYERS = [
    "RoadCenterLine",
    "SiteStructureAddressPoint",
    "PsapPolygon",
    "FirePolygon",
    "PolicePolygon",
    "EmsPolygon",
    "ProvisioningPolygon",
    "RailroadCenterLine",
    "HydrologyLine",
    "HydrologyPolygon",
    "LocationMarkerPoint",
    "DistanceMarkerPoint",
    "SiteStructureAddressPolygon",
]

def export_geopackage(
    layers: dict[str, gpd.GeoDataFrame],
    output_path: str,
    metadata: dict,
) -> None:
    """Write all layers to a single GeoPackage with NENA metadata."""
    # Ensure CRS is set on all layers
    for name, gdf in layers.items():
        if gdf.crs is None:
            gdf.set_crs(metadata["crs_projected"], inplace=True)

    # Write layers
    for name in NENA_LAYERS:
        if name in layers:
            pyogrio.write_dataframe(
                layers[name],
                output_path,
                layer=name,
                driver="GPKG",
                overwrite=True if name == NENA_LAYERS[0] else False,
            )

    # Write metadata table (non-spatial)
    meta_gdf = gpd.GeoDataFrame([{
        "key": k, "value": json.dumps(v) if not isinstance(v, str) else v
    } for k, v in metadata.items()], geometry=None, crs=None)
    pyogrio.write_dataframe(meta_gdf, output_path, layer="metadata", driver="GPKG")

    # Add spatial indexes (pyogrio does this automatically for GPKG)
```

**Metadata Layer Schema:**
| Key | Value Example |
|-----|---------------|
| `standard` | `NENA-STA-006.3-2026` |
| `crs_projected` | `EPSG:2263` |
| `crs_geographic` | `EPSG:4326` |
| `generation_date` | `2026-01-15T10:30:00Z` |
| `seed` | `42` |
| `nguid_domain` | `synthgis.local` |
| `disclaimer` | `SYNTHETIC DATA - NOT FOR OPERATIONAL USE` |
| `license` | `CC-BY-4.0` |
| `layer_count` | `13` |

---

## 4. CLI Interface (`src/synthgis/cli.py`)

```bash
# Generate synthetic town
synthgis generate --config config/town_spec.yaml --output output/synthetic_town.gpkg

# Validate existing GeoPackage
synthgis validate --input output/synthetic_town.gpkg --postgis postgresql://...

# Export to PostGIS
synthgis export-postgis --input output/synthetic_town.gpkg --dsn postgresql://...

# Generate NENA template report (Excel)
synthgis nena-report --schema config/nena_schema_v3.yaml --output docs/nena_schema_report.xlsx
```

---

## 5. Dependencies (`pyproject.toml`)

```toml
[project]
name = "synthgis"
version = "0.1.0"
description = "Synthetic city GIS generator for NG9-1-1 compliance"
requires-python = ">=3.11"
dependencies = [
    "geopandas>=1.0",
    "shapely>=2.0",
    "networkx>=3.2",
    "momepy>=0.11",
    "pyproj>=3.6",
    "pyogrio>=0.8",
    "numpy>=1.26",
    "pysgn>=0.2",           # Synthetic geospatial networks
    "pydantic>=2.0",        # Config validation
    "pydantic-yaml>=0.1",   # YAML config
    "typer>=0.9",           # CLI
    "sqlalchemy>=2.0",
    "geoalchemy2>=0.14",    # PostGIS
    "pyyaml>=6.0",
    "rich>=13.0",           # Pretty CLI output
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-cov>=4.0",
    "ruff>=0.3",
    "mypy>=1.8",
    "jupyter>=1.0",
    "matplotlib>=3.8",
    "contextily>=1.6",      # Basemaps for notebooks
    "osmnx>=2.0",           # Reference morphology (not for generation)
    "pandana>=0.3",         # Faster routing
    "igraph>=0.11",         # Alternative graph backend
]
postgis = ["psycopg2-binary>=2.9"]
```

---

## 6. Integration with SynthCCD

### 6.1 Data Contract
SynthGIS produces a **GeoPackage** that SynthCCD reads directly:
- `RoadCenterLine` → Street network for routing, address geocoding
- `SiteStructureAddressPoint` → Incident locations, caller locations
- `PsapPolygon` / `FirePolygon` / `PolicePolygon` / `EmsPolygon` → Dispatch jurisdiction
- `ProvisioningPolygon` → Data extent boundary

### 6.2 SynthCCD Reader Interface
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
        # Local interpolation geocoder using RCL address ranges
        pass

    def reverse_geocode(self, point: Point) -> str:
        # Nearest address point + street name
        pass

    def route(self, from_pt: Point, to_pt: Point) -> LineString:
        # NetworkX/pgRouting on RoadCenterLine graph
        pass
```

---

## 7. Quality Assurance Checklist

| Phase | Check | Tool |
|-------|-------|------|
| **Generation** | All RNG substreams derived from master seed | `seeding.py` unit tests |
| **Generation** | No geometry validity errors | `shapely.make_valid` + `ST_IsValid` |
| **Generation** | Topology: streets split at intersections | `momepy` round-trip test |
| **Generation** | Address ranges: parity, direction, no overlaps | `qc_sql.py` |
| **Generation** | Address points within 100m of matching street | `qc_sql.py` |
| **Generation** | Boundaries: no gaps, no overlaps | `qc_sql.py` |
| **Generation** | Centerlines split at boundary intersections | `qc_sql.py` |
| **Export** | GeoPackage opens in QGIS 3.38+ | Manual + CI |
| **Export** | All NENA required fields populated | Schema validation |
| **Export** | NGUIDs unique across all layers | SQL check |
| **Export** | Metadata layer present + complete | `pyogrio` read |
| **Integration** | SynthCCD loads all layers without error | Integration test |
| **Integration** | Geocoder finds ≥99% of address points | SynthCCD test suite |
| **Integration** | Router computes paths for all station→point pairs | Routing test |

---

## 8. Milestones

| Milestone | Deliverable | Target |
|-----------|-------------|--------|
| **M1** | Config + CRS + Seeding + Provisioning/PSAP/ESB boundaries | Week 1 |
| **M2** | Procedural street network (arterial→local) + topology cleanup | Week 2 |
| **M3** | Address ranges (CLDXF parity) + street naming | Week 3 |
| **M4** | Block parcelization + morphological tessellation | Week 4 |
| **M5** | Building footprints + SiteStructureAddressPoints (full CLDXF) | Week 5 |
| **M6** | Operational layers (stations, zones, run cards, hospitals) | Week 6 |
| **M7** | Routing graph + travel-time attributes | Week 7 |
| **M8** | PostGIS validation pipeline + QC SQL suite | Week 8 |
| **M9** | GeoPackage export + metadata + SynthCCD integration test | Week 9 |
| **M10** | Documentation + example notebooks + CI/CD | Week 10 |

---

## 9. References

- **NENA-STA-006.3-2026** — NG9-1-1 GIS Data Model (ANSI)
- **NENA-REF-006.3-2026** — GIS Data Model Templates (GeoPackage, FileGDB, Relational)
- **NENA-STA-004.2-2024** — CLDXF-US Civic Location Data Exchange Format
- **Fleischmann (2019)** — momepy: Urban Morphology Measuring Toolkit (JOSS)
- **Wang et al. (2026)** — PySGN: Synthetic Geospatial Networks (JOSS)
- **Boeing (2025)** — OSMnx v2.0 (arXiv:2505.00736)
- **Deng et al. (2025)** — CityGen (CVPR Workshop)
- **Shaw et al. (2023)** — Realism Metrics for Procedural Road Networks (IVCNZ)
- **Liu et al. (2023)** — InstantCITY (ISPRS J.)
- **Post et al. (2026)** — CityStack Framework (ISPRS Annals)