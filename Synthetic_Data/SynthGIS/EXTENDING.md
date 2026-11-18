# Extending SynthGIS — Developer Guide

> **Goal:** Learn GIS by building and customizing every component. This guide maps the extension points, patterns, and "where to look" for each customization.

---

## 1. Architecture Mental Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TownSpec (YAML)                              │
│  • CRS, extent, seed, hierarchy, zoning, addressing, operational   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SeedState (Deterministic RNG)                  │
│  • Master seed → substreams per module                              │
│  • Each module gets independent Generator                           │
└─────────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌──────────┐    ┌──────────┐    ┌──────────┐
       │Boundaries│    │ Streets  │    │Hydrology │  ← Independent, seeded modules
       └──────────┘    └──────────┘    └──────────┘
              │               │               │
              ▼               ▼               ▼
       ┌─────────────────────────────────────┐
       │     StreetNetwork (combined)        │
       │  • GeoDataFrame (all streets)       │
       │  • NetworkX Graph (primal)          │
       │  • Blocks (polygonized)             │
       └─────────────────────────────────────┘
              │               │
              ▼               ▼
       ┌──────────┐    ┌──────────┐
       │ Parcels  │    │Buildings │
       └──────────┘    └──────────┘
              │               │
              └───────┬───────┘
                      ▼
            ┌─────────────────┐
            │ Address Points  │  ← Combines streets + buildings + sub-addresses
            └─────────────────┘
                      │
                      ▼
            ┌─────────────────┐
            │  Operational    │  ← Stations, zones, run cards
            └─────────────────┘
                      │
                      ▼
            ┌─────────────────┐
            │   Routing       │  ← NetworkX DiGraph with travel-time
            └─────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
   ┌─────────────┐         ┌─────────────┐
   │ GeoPackage  │         │  PostGIS    │  ← Export targets
   └─────────────┘         └─────────────┘
          │                       │
          └───────────┬───────────┘
                      ▼
            ┌─────────────────┐
            │  Validation     │  ← Topology + Schema + QC SQL
            └─────────────────┘
```

**Key Insight:** Every module is a pure function: `(spec, seed_state, upstream_layers) → GeoDataFrame`. No global state, fully testable.

---

## 2. Extension Points by Category

### 2.1 Adding a New NENA Layer

**Example: Add `SchoolPolygon` layer**

1. **Add to config** (`config.py`):
```python
# In OperationalConfig or new LayerConfig
class SchoolConfig(BaseModel):
    enabled: bool = True
    count_per_zone: int = 1
    min_students: int = 100
    max_students: int = 2000
```

2. **Create generator** (`src/synthgis/schools.py`):
```python
def generate_schools(
    spec: TownSpec,
    zones: gpd.GeoDataFrame,  # Fire/Police zones for placement
    streets: gpd.GeoDataFrame,
    seed_state: SeedState,
) -> gpd.GeoDataFrame:
    """Generate school polygons within residential zones."""
    rng = seed_state.rng("schools")
    # ... placement logic near residential streets
    return gpd.GeoDataFrame(schools, crs=spec.crs.projected)
```

3. **Register in CLI** (`cli.py`):
```python
# In generate command
from .schools import generate_schools

layers["SchoolPolygon"] = generate_schools(spec, zones, streets, seed_state)
```

4. **Add to NENA_LAYER_ORDER** (`export/geopackage.py`):
```python
NENA_LAYER_ORDER = [
    # ... existing ...
    "SchoolPolygon",  # Add in Recommended section
]
```

5. **Add validation** (`validation/topology.py`):
```python
def _validate_school_polygons(self, gdf: gpd.GeoDataFrame) -> None:
    # Check within provisioning, no overlaps, etc.
```

5. **Add QC SQL** (`validation/qc_sql.py`):
```python
QC_CHECKS["school_geometry_valid"] = """
    SELECT nguid FROM ng911_school_polygon WHERE NOT ST_IsValid(geom);
"""
```

---

### 2.2 Customizing Street Generation

**The StreetNetworkGenerator is the main extension point** (`streets/generator.py`):

```python
class StreetNetworkGenerator:
    def generate(self) -> StreetNetwork:
        arterials = self._generate_arterials()      # ← Override for custom backbone
        collectors = self._generate_collectors(arterials)  # ← Custom connection logic
        locals = self._generate_locals(arterials, collectors)  # ← Custom subdivision
        combined = self._combine_and_clean(...)
        graph = momepy.gdf_to_nx(combined, approach="primal")
        blocks = self._polygonize_blocks(combined)
        combined = self._assign_address_ranges(combined, blocks)
        return StreetNetwork(...)
```

**Customization Strategies:**

| Goal | Where to Modify |
|------|-----------------|
| **Different backbone** (radial, organic, grid) | `_generate_arterials()` |
| **Custom collector logic** (Delaunay, minimum spanning tree) | `_generate_collectors()` |
| **Cul-de-sac algorithms** | `_generate_locals()` → `_subdivide_block()` |
| **Bridge/tunnel logic** | `_combine_and_clean()` (check hydrology intersections) |
| **Address range scheme** (mile-based, sequential) | `_assign_address_ranges()` or `streets/addressing.py` |
| **Street naming themes** | `streets/naming.py` → `StreetNameGenerator` |

**Example: Radial Arterial Backbone**
```python
def _generate_arterials(self) -> gpd.GeoDataFrame:
    """Radial spokes from center + ring roads."""
    rng = self.seed_state.rng("streets.arterial")
    center = Point(self.extent.width/2, self.extent.height/2)
    
    lines = []
    # Spokes
    for angle in np.linspace(0, 2*np.pi, 8, endpoint=False):
        end = center + Point(
            self.extent.width * np.cos(angle),
            self.extent.height * np.sin(angle)
        )
        lines.append(self._make_street_record(
            LineString([center, end]), config, f"Radial {angle:.1f}", rng))
    
    # Rings
    for radius_frac in [0.3, 0.6, 0.9]:
        radius = min(self.extent.width, self.extent.height) * radius_frac / 2
        ring = center.buffer(radius).boundary
        lines.append(self._make_street_record(ring, config, f"Ring {radius_frac}", rng))
    
    return gpd.GeoDataFrame(lines, crs=self.crs)
```

---

### 2.3 Customizing Parcel Subdivision

**ParcelConfig drives everything** (`parcels/subdivision.py`):

```python
@dataclass
class ParcelConfig:
    zone_type: str
    min_area_sqm: float
    max_area_sqm: float
    setback_m: float
    building_coverage: float
    max_floors: int
    min_frontage_m: float = 10.0
    max_depth_m: float = 100.0
    # ADD YOUR OWN:
    min_width_m: float = 8.0          # Minimum parcel width
    max_aspect_ratio: float = 4.0     # Depth/width ratio
    corner_premium: bool = False      # Larger corner parcels
```

**The recursive subdivision is in `_subdivide_single_block()`** — replace the splitting logic:

```python
def _split_and_recurse(self, geom: Polygon, config: ParcelConfig, rng: np.random.Generator, depth: int):
    # Current: split along longest axis of minimum rotated rectangle
    # CUSTOM: Use voronoi, k-means, or street-aligned splits
    
    # Example: Street-aligned subdivision
    nearest_street = self._find_nearest_street(geom.centroid)
    street_angle = self._get_street_angle(nearest_street)
    split_line = self._create_perpendicular_split(geom, street_angle)
    # ...
```

---

### 2.4 Adding Custom Validation Rules

**Two validation systems:**

#### A. TopologyValidator (offline, Shapely/momepy)
```python
# In validation/topology.py
class TopologyValidator:
    def validate_all(self, layers):
        # ... existing ...
        self._validate_custom_rules(layers)
    
    def _validate_custom_rules(self, layers):
        # Your rules here
        self._check_building_street_access(layers)
        self._check_fire_hydrant_spacing(layers)
        self._check_cul_de_sac_length(layers)
    
    def _check_fire_hydrant_spacing(self, layers):
        """NFPA: hydrants ≤ 500 ft apart in residential."""
        hydrants = layers.get("HydrantPoint")
        streets = layers.get("RoadCenterLine")
        if hydrants is None or streets is None:
            return
        
        for _, street in streets.iterrows():
            if street.get("RoadClass") == "LO":
                hydrants_on_street = hydrants[hydrants.geometry.distance(street.geometry) < 10]
                # Check spacing along street...
                if max_gap > 500 * 0.3048:  # feet to meters
                    self.report.add_issue(TopologyIssue(...))
```

#### B. SchemaValidator (field-level)
```python
# In validation/schema.py
CUSTOM_SCHEMA = {
    "SchoolPolygon": {
        "required": ["NGUID", "Name", "SchoolType", "GradeRange", "Capacity", "geom"],
        "domains": {
            "SchoolType": ["Elementary", "Middle", "High", "K12", "Private", "Charter"],
            "GradeRange": ["K-5", "6-8", "9-12", "K-8", "K-12"],
        },
    },
}

# Merge into NENA_SCHEMA or extend SchemaValidator
class ExtendedSchemaValidator(SchemaValidator):
    def validate_layer(self, layer_name, gdf):
        issues = super().validate_layer(layer_name, gdf)
        if layer_name in CUSTOM_SCHEMA:
            issues.extend(self._validate_custom_schema(layer_name, gdf, CUSTOM_SCHEMA[layer_name]))
        return issues
```

---

### 2.5 Extending the CLI

**Add new commands** (`cli.py`):

```python
@app.command()
def analyze_morphology(
    input: Path = typer.Argument(..., help="GeoPackage to analyze"),
    output: Path = typer.Option("morphology_report.json", "--output", "-o"),
):
    """Compute urban morphology metrics (momepy) for a synthetic town."""
    layers = {}
    for layer_name in pyogrio.list_layers(input):
        if layer_name != "metadata":
            layers[layer_name] = gpd.read_file(input, layer=layer_name)
    
    metrics = {}
    if "RoadCenterLine" in layers:
        metrics["street"] = compute_street_metrics(layers["RoadCenterLine"])
    if "SiteStructureAddressPoint" in layers:
        metrics["density"] = compute_address_density(layers["SiteStructureAddressPoint"])
    
    with open(output, "w") as f:
        json.dump(metrics, f, indent=2)
    console.print(f"[green]Morphology report saved to {output}[/green]")

@app.command()
def calibrate(
    reference_gpkg: Path = typer.Argument(..., help="Real city GeoPackage for calibration"),
    output: Path = typer.Option("calibrated_spec.yaml", "--output", "-o"),
):
    """Calibrate town_spec.yaml from real city morphology."""
    # Load reference, compute metrics, generate config
    spec = calibrate_from_reference(reference_gpkg)
    spec.to_yaml(output)
    console.print(f"[green]Calibrated spec saved to {output}[/green]")
```

---

### 2.6 Adding Export Formats

**Create new exporter** (`export/shapefile.py`):
```python
def export_shapefile(layers: dict[str, gpd.GeoDataFrame], output_dir: Path) -> None:
    """Export each layer as individual shapefile (for legacy systems)."""
    output_dir.mkdir(parents=True, exist_ok=True)
    for name, gdf in layers.items():
        if name == "metadata":
            continue
        safe_name = name.replace("Polygon", "").replace("Point", "").replace("CenterLine", "")
        path = output_dir / f"{safe_name}.shp"
        gdf.to_file(path, driver="ESRI Shapefile")
```

**Register in CLI:**
```python
from .export.shapefile import export_shapefile

@app.command()
def export_shapefile_cmd(
    input: Path = typer.Argument(..., help="Input GeoPackage"),
    output: Path = typer.Argument(..., help="Output directory"),
):
    layers = {name: gpd.read_file(input, layer=name) for name in pyogrio.list_layers(input) if name != "metadata"}
    export_shapefile(layers, output)
```

---

## 3. Learning GIS Through Code — Recommended Path

### Phase 1: Understand the Data Model
```bash
# 1. Generate a town
uv run synthgis generate --config config/town_spec.yaml --output out.gpkg

# 2. Open in QGIS and explore every layer
qgis out.gpkg

# 3. Read the NENA reference
cat docs/NENA_NG911_GIS_Standards_Reference.md
```

### Phase 2: Trace One Module End-to-End
Pick **streets** — it's the most complex:

```python
# In Python REPL or notebook
from synthgis.config import load_town_spec
from synthgis.seeding import SeedState
from synthgis.streets import StreetNetworkGenerator

spec = load_town_spec("config/town_spec.yaml")
seed_state = SeedState.from_master(spec.seed)
gen = StreetNetworkGenerator(spec, seed_state)
network = gen.generate()

# Inspect
print(f"Arterials: {len(network.arterials)}")
print(f"Collectors: {len(network.collectors)}")
print(f"Locals: {len(network.locals)}")
print(f"Combined: {len(network.combined)}")
print(f"Blocks: {len(network.blocks)}")
print(f"Graph nodes: {network.graph.number_of_nodes()}")
print(f"Graph edges: {network.graph.number_of_edges()}")

# Visualize
import matplotlib.pyplot as plt
fig, axes = plt.subplots(2, 2, figsize=(12, 12))
network.arterials.plot(ax=axes[0,0], color='red', linewidth=2); axes[0,0].set_title("Arterials")
network.collectors.plot(ax=axes[0,1], color='orange', linewidth=1); axes[0,1].set_title("Collectors")
network.locals.plot(ax=axes[1,0], color='gray', linewidth=0.5); axes[1,0].set_title("Locals")
network.blocks.plot(ax=axes[1,1], column='block_area', cmap='viridis'); axes[1,1].set_title("Blocks")
plt.tight_layout()
plt.show()
```

### Phase 3: Modify One Thing at a Time

| Experiment | File to Modify | What You'll Learn |
|------------|----------------|-------------------|
| Change street grid to radial | `streets/generator.py:_generate_arterials()` | Graph topology, momepy |
| Add cul-de-sac length limit | `streets/generator.py:_subdivide_block()` | Recursive geometry |
| Change address parity scheme | `streets/addressing.py` | CLDXF, interpolation |
| Add building height attr | `buildings/footprints.py` | 3D attributes |
| New validation rule | `validation/topology.py` | Shapely predicates |
| New export format | `export/` | OGR drivers |

### Phase 4: Calibrate from Real Data

```python
# In notebooks/01_explore_morphology.ipynb
import osmnx as ox
import momepy

# Download real neighborhood
place = "Portland, Oregon, USA"
graph = ox.graph_from_place(place, network_type="drive")
streets = ox.graph_to_gdfs(graph, nodes=False)

# Compute metrics
metrics = {
    "intersection_density": momepy.intersection_density(streets),
    "street_length_mean": streets.length.mean(),
    "street_orientation_entropy": momepy.orientation_entropy(streets),
    "block_area_median": momepy.block_area(blocks).median(),
    "meshedness": momepy.meshedness(graph),
}

# Use these to tune town_spec.yaml
```

---

## 4. Key Patterns Used in Codebase

### 4.1 Deterministic Substream Seeding
```python
# NEVER use global random state
# ALWAYS use seed_state.rng("module_name")
rng = seed_state.rng("streets.arterial")
value = rng.uniform(0, 1)
choice = rng.choice(options)
```

### 4.2 NGUID Generation
```python
# Every feature gets a NENA-compliant NGUID
from synthgis.seeding import make_nguid
nguid = make_nguid(domain="synthgis.local", layer="rcl", local_id=123)
# → "urn:emergency:uid:gid:synthgis.local:rcl-000123"
```

### 4.3 Geometry Cleaning Pipeline
```python
# Standard pattern after ANY geometric operation
from shapely import make_valid, set_precision

geom = make_valid(geom)           # Fix self-intersections, etc.
geom = set_precision(geom, 0.01)  # Snap to 1cm grid
```

### 4.4 momepy Round-Trip for Topology
```python
# The "gold standard" for cleaning street networks
graph = momepy.gdf_to_nx(streets, approach="primal")
cleaned = momepy.nx_to_gdf(graph, lines=True, points=False)
# Result: all intersections split, no overlaps, valid geometry
```

### 4.5 Spatial Index for Performance
```python
# Always use sindex for spatial queries
tree = streets.sindex
candidates = list(tree.query(point.buffer(100)))  # Fast!
for idx in candidates:
    street = streets.iloc[idx]
    # ...
```

---

## 5. Common GIS Operations Reference

### Shapely (Geometry)
```python
from shapely.geometry import Point, LineString, Polygon, box
from shapely import make_valid, set_precision, get_precision
from shapely.ops import split, polygonize, linemerge, unary_union, voronoi_diagram
from shapely.affinity import scale, rotate, translate
from shapely import buffer, centroid, distance, intersection, union, difference

# Create
pt = Point(x, y)
line = LineString([(x1, y1), (x2, y2)])
poly = Polygon([(x1, y1), (x2, y2), (x3, y3), (x1, y1)])
bbox = box(minx, miny, maxx, maxy)

# Transform
clean = make_valid(geom)
snapped = set_precision(geom, 0.01)
scaled = scale(geom, xfact=1.1, yfact=1.1, origin='center')
rotated = rotate(geom, 45, origin='centroid')

# Spatial predicates
geom.contains(other)
geom.within(other)
geom.intersects(other)
geom.touches(other)
geom.crosses(other)
geom.overlaps(other)
geom.distance(other) < threshold

# Operations
intersection = geom.intersection(other)
union = geom.union(other)
difference = geom.difference(other)
buffer = geom.buffer(10)          # Positive = expand, negative = inset
centroid = geom.centroid
envelope = geom.envelope
```

### GeoPandas (Spatial DataFrames)
```python
import geopandas as gpd
from shapely.geometry import Point

# Read/Write
gdf = gpd.read_file("file.gpkg", layer="RoadCenterLine")
gdf.to_file("out.gpkg", layer="RoadCenterLine", driver="GPKG")

# CRS
gdf.set_crs("EPSG:2263", inplace=True)
gdf_wgs84 = gdf.to_crs("EPSG:4326")

# Spatial join
joined = gpd.sjoin(points, polygons, how="left", predicate="within")

# Spatial index
tree = gdf.sindex
candidates = list(tree.query(geom.buffer(100)))

# Geometry operations
gdf.geometry.area
gdf.geometry.length
gdf.geometry.centroid
gdf.geometry.buffer(10)
gdf.geometry.make_valid()
gdf.geometry.set_precision(0.01)

# Plotting
gdf.plot(column="RoadClass", cmap="viridis", linewidth=0.5)
```

### NetworkX (Graphs)
```python
import networkx as nx
import momepy

# GeoDataFrame → Graph (primal: intersections=nodes)
graph = momepy.gdf_to_nx(streets, approach="primal")

# Graph properties
nx.number_of_nodes(graph)
nx.number_of_edges(graph)
nx.is_connected(graph)
list(nx.connected_components(graph))

# Routing
path = nx.shortest_path(graph, source, target, weight="travel_time")
length = nx.shortest_path_length(graph, source, target, weight="travel_time")

# Drive-time isochrone
reachable = nx.single_source_dijkstra_path_length(graph, source, cutoff=300, weight="travel_time")

# Node attributes
for node, data in graph.nodes(data=True):
    print(node, data)  # x, y coordinates
```

### momepy (Urban Morphology)
```python
import momepy

# Tessellation
tessellation = momepy.morphological_tessellation(buildings, clip=limit)

# Block metrics
blocks = momepy.blocks(streets)
blocks["area"] = blocks.area
blocks["perimeter"] = blocks.length

# Street metrics
streets["length"] = streets.length
streets["orientation"] = momepy.orientation(streets)

# Graph metrics
graph = momepy.gdf_to_nx(streets, approach="primal")
momepy.clustering(graph)
momepy.meshedness(graph)
momepy.orientation_entropy(graph)
```

---

## 6. Debugging Tips

### Visualize Intermediate Steps
```python
# In any generator, add debug output
def _generate_arterials(self):
    gdf = ...
    if self.debug:
        gdf.to_file("debug/arterials.gpkg", driver="GPKG")
    return gdf
```

### Check Topology at Each Stage
```python
def debug_topology(gdf, name):
    print(f"\n=== {name} ===")
    print(f"Features: {len(gdf)}")
    print(f"Valid: {gdf.geometry.is_valid.all()}")
    print(f"Empty: {gdf.geometry.is_empty.sum()}")
    print(f"Types: {gdf.geometry.geom_type.value_counts().to_dict()}")
    
    # Graph check
    try:
        graph = momepy.gdf_to_nx(gdf, approach="primal")
        print(f"Graph: {graph.number_of_nodes()} nodes, {graph.number_of_edges()} edges")
        components = list(nx.connected_components(graph))
        print(f"Components: {len(components)} (largest: {max(len(c) for c in components)})")
        dangling = sum(1 for n, d in graph.degree() if d == 1)
        print(f"Dangling ends: {dangling}")
    except Exception as e:
        print(f"Graph build failed: {e}")
```

### Profile Performance
```python
import time
from functools import wraps

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__}: {elapsed:.3f}s")
        return result
    return wrapper

@timer
def generate_streets(...):
    ...
```

---

## 7. Resources for Learning

### Core GIS Concepts
- **Shapely docs:** https://shapely.readthedocs.io/
- **GeoPandas docs:** https://geopandas.org/
- **momepy tutorial:** https://docs.momepy.org/en/stable/user_guide/getting_started.html
- **NetworkX tutorial:** https://networkx.org/documentation/stable/tutorial.html

### NENA Standards
- **NENA-STA-006.3-2026:** The GIS Data Model (authoritative)
- **NENA-STA-004.2-2024:** CLDXF-US (civic address format)
- **GitHub Templates:** https://github.com/NENA911/NG911GISDataModel

### Research Papers (in `docs/Synthetic_Geodata_Research_Summary.md`)
- Fleischmann (2019) — momepy
- Wang et al. (2026) — PySGN
- Boeing (2025) — OSMnx v2
- Deng et al. (2025) — CityGen
- Liu et al. (2023) — InstantCITY
- Post et al. (2026) — CityStack

### Practice Datasets
```python
# OSMnx for real-world reference
import osmnx as ox
graph = ox.graph_from_place("Cambridge, MA", network_type="drive")
streets = ox.graph_to_gdfs(graph, nodes=False)

# momepy built-in dataset
import momepy
buildings = gpd.read_file(momepy.datasets.get_path("bubenec"), layer="buildings")
streets = gpd.read_file(momepy.datasets.get_path("bubenec"), layer="streets")
```

---

## 8. Your Customization Checklist

When you want to customize something, ask:

| Question | Where to Look |
|----------|---------------|
| **Change town size/CRS?** | `config/town_spec.yaml` → `extent`, `crs` |
| **Different street pattern?** | `streets/generator.py` → `_generate_arterials/collectors/locals` |
| **Custom address format?** | `streets/addressing.py` + `streets/naming.py` |
| **New parcel shapes?** | `parcels/subdivision.py` → `_subdivide_single_block` |
| **Building types?** | `buildings/footprints.py` → `_determine_building_type` |
| **Sub-address complexity?** | `buildings/subaddress.py` → `SubAddressGenerator` |
| **New operational layer?** | `operational.py` + CLI registration |
| **New validation rule?** | `validation/topology.py` or `validation/schema.py` |
| **New export format?** | `export/` + CLI command |
| **Calibrate from real city?** | Create `scripts/calibrate.py` using OSMnx + momepy |

---

## 9. Testing Your Changes

```bash
# Run topology validation after any geometry change
uv run synthgis validate output/synthetic_town.gpkg --config config/town_spec.yaml

# Run full test suite
uv run pytest tests/ -v

# Test specific module
uv run pytest tests/test_topology.py -v

# Quick smoke test
uv run python -c "
from synthgis import TownSpec, SeedState
from synthgis.streets import StreetNetworkGenerator
spec = TownSpec.from_yaml('config/town_spec.yaml')
seed = SeedState.from_master(spec.seed)
gen = StreetNetworkGenerator(spec, seed)
net = gen.generate()
print(f'OK: {len(net.combined)} streets, {len(net.blocks)} blocks')
"
```

---

*Happy building! The best way to learn GIS is to generate, break, fix, and extend.*