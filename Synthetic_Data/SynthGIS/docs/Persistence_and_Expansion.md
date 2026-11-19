# Persistence & Expansion — SynthGIS Town Lifecycle Management

> **Goal**: Enable saving, versioning, and incremental growth of synthetic towns from villages → towns → cities → metropolitan regions.

---

## 1. Persistence Mechanisms

### 1.1 Primary: GeoPackage (`.gpkg`)

**Why GeoPackage?**
- Single-file, portable, SQLite-based
- Native QGIS/ArcGIS support
- Spatial indexes built-in
- Supports multiple layers + non-spatial tables
- Transactional (ACID) for safe writes

```bash
# SynthGIS already outputs this
uv run synthgis generate --config town.yaml --output town.gpkg

# Load in Python
import geopandas as gpd
layers = {}
for layer_name in pyogrio.list_layers("town.gpkg"):
    if layer_name != "metadata":
        layers[layer_name] = gpd.read_file("town.gpkg", layer=layer_name)
```

**Versioning via metadata layer:**
```sql
-- In town.gpkg metadata table
INSERT INTO metadata (key, value) VALUES 
  ('version', '1.0.0'),
  ('created', '2026-01-15T10:30:00Z'),
  ('seed', '42'),
  ('parent_town', 'null'),
  ('generation_notes', 'Initial village generation');
```

### 1.2 PostGIS (Multi-user, Concurrent)

```bash
# Load to PostGIS
uv run synthgis generate --config town.yaml --output town.gpkg \
    --postgis postgresql://user:pass@localhost/synthgis

# Tables created:
-- ng911_road_centerlines
-- ng911_address_points
-- ng911_psap_polygon, ng911_fire_polygon, etc.
-- ng911_building_3d (if --3d)
```

**Versioning via table:**
```sql
CREATE TABLE synthgis_town_versions (
    version_id SERIAL PRIMARY KEY,
    town_name VARCHAR(100),
    version VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    seed INTEGER,
    parent_version_id INTEGER REFERENCES synthgis_town_versions(version_id),
    changelog TEXT,
    gpkg_path TEXT,  -- optional: path to exported GPKG
    bounds GEOMETRY(Polygon, 4326)  -- town extent
);

-- Track each generation
INSERT INTO synthgis_town_versions (town_name, version, seed, changelog)
VALUES ('Synthville', '1.0.0', 42, 'Initial generation');
```

### 1.3 Serialization Formats

| Format | Use Case | Pros | Cons |
|--------|----------|------|------|
| **GeoPackage** | Primary distribution | Portable, spatial, single file | Single writer |
| **PostGIS** | Production, multi-user | Concurrent, SQL, scaling | Requires server |
| **GeoParquet** | Analytics, cloud | Columnar, partitioned, fast | No spatial index |
| **FlatGeobuf** | Web streaming | Random access, small | Less tool support |
| **Pickle (graph)** | Routing service | Fast NetworkX load | Python-only, version-fragile |

---

## 2. Expansion Strategies — Growing Towns into Cities

### 2.1 Expansion Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Radial Growth** | Add concentric rings around existing core | Organic city expansion |
| **Corridor Development** | Extend along transportation corridors | Highway/rail-oriented growth |
| **Infill** | Subdivide existing parcels, increase density | Mature urban areas |
| **Satellite Towns** | New disconnected clusters connected by corridors | Polycentric metro regions |
| **Annexation** | Absorb adjacent synthetic towns | Regional consolidation |

### 2.2 Incremental Generation API

```python
# synthgis/expansion.py (NEW MODULE)

class TownExpander:
    """Grow an existing synthetic town incrementally."""
    
    def __init__(self, existing_gpkg: Path, seed_state: SeedState):
        self.town = self._load_town(existing_gpkg)
        self.seed_state = seed_state.fork("expansion")
        self.original_seed = existing_gpkg.metadata.seed
    
    def expand_radial(
        self,
        rings: int = 1,
        ring_width_m: float = 1000,
        density_multiplier: float = 1.2,
    ) -> "TownExpander":
        """Add concentric rings around current extent."""
        
        # 1. Compute current bounding box
        current_extent = self._get_current_extent()
        
        # 2. For each ring, generate new streets/parcels/buildings
        for ring_idx in range(rings):
            ring_extent = self._compute_ring_extent(current_extent, ring_idx, ring_width_m)
            
            # Generate with higher density
            ring_config = self._adjust_config_for_density(density_multiplier ** (ring_idx + 1))
            
            # Generate ONLY in new extent (preserve existing)
            new_layers = self._generate_in_extent(ring_extent, ring_config)
            
            # Merge with topology awareness
            self.town = self._merge_layers(self.town, new_layers)
        
        return self
    
    def expand_corridor(
        self,
        corridor_centerline: LineString,
        width_m: float = 2000,
        length_km: float = 5,
    ) -> "TownExpander":
        """Extend along a transportation corridor."""
        
        # Buffer corridor to create expansion extent
        corridor_extent = corridor_centerline.buffer(width_m / 2)
        
        # Generate higher-density mixed-use along corridor
        corridor_config = self._config_for_corridor()
        new_layers = self._generate_in_extent(corridor_extent, corridor_config)
        
        # Ensure connectivity to existing network
        self._connect_to_existing_network(new_layers, corridor_centerline)
        
        self.town = self._merge_layers(self.town, new_layers)
        return self
    
    def infill(
        self,
        target_density: float = 2.0,  # multiplier
        min_parcel_size_sqm: float = 200,
    ) -> "TownExpander":
        """Increase density within existing extent (subdivide parcels)."""
        
        # Subdivide large parcels
        large_parcels = self.town.parcels[self.town.parcels.area > min_parcel_size_sqm * 4]
        for _, parcel in large_parcels.iterrows():
            new_parcels = self._subdivide_parcel(parcel, target_density)
            self._replace_parcel(parcel, new_parcels)
        
        # Add buildings to new parcels
        self._generate_buildings_for_new_parcels()
        
        # Update address points
        self._regenerate_address_points()
        
        return self
    
    def add_satellite_town(
        self,
        center: Point,
        radius_m: float = 2000,
        connector_street: bool = True,
    ) -> "TownExpander":
        """Add a disconnected satellite cluster."""
        
        satellite_config = self._config_for_satellite()
        satellite_extent = self._extent_from_center(center, radius_m)
        
        satellite_layers = self._generate_in_extent(satellite_extent, satellite_config)
        
        if connector_street:
            self._add_connector_street(self.town.extent.centroid, center)
        
        self.town = self._merge_layers(self.town, satellite_layers)
        return self
    
    def save(self, output_path: Path, version: str = None) -> Path:
        """Save expanded town with version tracking."""
        # Update metadata
        self.town.metadata.version = version or self._next_version()
        self.town.metadata.parent_seed = self.original_seed
        self.town.metadata.expansion_history.append({
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "operation": self._last_operation,
            "parameters": self._last_params,
        })
        
        # Export with version
        export_geopackage(self.town.layers, self.town.spec, self.town.seed_state, output_path)
        return output_path
```

### 2.3 Configuration for Growth

```yaml
# town_spec.yaml additions for expansion
expansion:
  enabled: true
  default_ring_width_m: 1000
  density_gradient: "decreasing"  # or "increasing", "constant"
  max_extent_km2: 100  # hard limit
  
  # Density profiles by zone
  density_profiles:
    core:
      residential: 8000    # people/sq km
      commercial: 3000
    inner_ring:
      residential: 5000
      commercial: 2000
    outer_ring:
      residential: 2000
      commercial: 500
    satellite:
      residential: 3000
      commercial: 1000
  
  # Infrastructure that triggers growth
  growth_triggers:
    highway_interchange: true
    rail_station: true
    university: true
    hospital: true
```

---

## 3. Versioning & Change Tracking

### 3.1 Semantic Versioning for Towns

```
MAJOR.MINOR.PATCH
  MAJOR: Structural change (new highway, river crossing, rezoning)
  MINOR: Expansion (new ring, satellite town, corridor)
  PATCH: Infill, bug fixes, parameter tweaks
```

### 3.2 Change Log Schema

```yaml
# In town.gpkg metadata or separate changelog.yaml
changelog:
  - version: "1.0.0"
    date: "2026-01-15T10:30:00Z"
    seed: 42
    operation: "initial_generation"
    parameters: { extent_km2: 16, population: 25000 }
    
  - version: "1.1.0"
    date: "2026-01-20T14:00:00Z"
    seed: 42  # same base seed
    operation: "radial_expansion"
    parameters: 
      rings: 1
      ring_width_m: 1000
      density_multiplier: 1.2
    extent_km2: 28
    population: 42000
    
  - version: "1.2.0"
    date: "2026-02-01T09:00:00Z"
    seed: 42
    operation: "corridor_expansion"
    parameters:
      corridor: "I-95 extension"
      width_m: 2000
      length_km: 8
    extent_km2: 42
    population: 68000
```

### 3.3 Diffing & Visualization

```python
# Compare two town versions
def diff_towns(old_gpkg: Path, new_gpkg: Path) -> DiffReport:
    """Generate diff between two town versions."""
    
    old = load_town_layers(old_gpkg)
    new = load_town_layers(new_gpkg)
    
    return DiffReport(
        streets_added=len(new.streets) - len(old.streets),
        streets_removed=...,  # unlikely but possible
        streets_modified=count_modified_geometries(old.streets, new.streets),
        parcels_added=len(new.parcels) - len(old.parcels),
        buildings_added=len(new.buildings) - len(old.buildings),
        population_change=new.total_population - old.total_population,
        extent_change_km2=new.extent_km2 - old.extent_km2,
        new_service_boundaries=...,  # new fire zones, etc.
    )

# Visualize in QGIS
def create_diff_layer(old_gpkg, new_gpkg, output_gpkg):
    """Create QGIS-ready diff layers (added/modified/removed)."""
    ...
```

---

## 4. Merging Towns into Regions

### 4.1 Metropolitan Region Assembly

```python
class RegionAssembler:
    """Combine multiple towns into a metropolitan region."""
    
    def __init__(self, region_name: str, crs: str = "EPSG:4326"):
        self.region_name = region_name
        self.towns = []
        self.crs = crs
    
    def add_town(self, gpkg_path: Path, name: str, transform: Affine = None):
        """Add a town, optionally transforming (translate/rotate)."""
        town = load_town(gpkg_path)
        if transform:
            town = self._transform_town(town, transform)
        self.towns.append({"name": name, "layers": town.layers})
    
    def add_connector_infrastructure(
        self,
        town_a: str,
        town_b: str,
        infra_type: Literal["highway", "rail", "arterial"],
    ):
        """Add connecting infrastructure between towns."""
        # Generate highway/rail between town centers
        # Update service boundaries to reflect regional PSAP
        # Merge run cards for mutual aid
    
    def harmonize_service_boundaries(self):
        """Merge adjacent PSAP/fire/police boundaries into regional ones."""
        # Create regional PSAP from union of town PSAPs
        # Adjust fire/EMS zones for mutual aid
        # Create regional run cards
    
    def create_regional_population_surface(self):
        """Aggregate population surfaces from all towns."""
    
    def export_region(self, output_path: Path) -> Path:
        """Export as single regional GeoPackage."""
        # Merge all layers with town_id prefix
        # Add regional metadata
        # Create regional routing graph
```

### 4.2 Regional Configuration

```yaml
# region_spec.yaml
region:
  name: "SynthMetro"
  crs: "EPSG:4326"
  
towns:
  - name: "Synthville_Core"
    gpkg: "synthville_core.gpkg"
    position: [0, 0]  # anchor point
    
  - name: "Synthville_North"
    gpkg: "synthville_north.gpkg"
    position: [0, 15000]  # 15km north
    connector: "highway"
    
  - name: "Synthville_East"
    gpkg: "synthville_east.gpkg"
    position: [12000, 5000]
    connector: "rail"
    
regional_infrastructure:
  highways:
    - { from: "Synthville_Core", to: "Synthville_North", type: "interstate" }
    - { from: "Synthville_Core", to: "Synthville_East", type: "freeway" }
  rail:
    - { from: "Synthville_Core", to: "Synthville_East", type: "commuter" }
    
regional_services:
  psap: "regional"  # single regional PSAP
  fire: "mutual_aid"  # shared run cards
  ems: "regional"
  police: "separate"  # each town keeps own
```

---

## 5. Implementation Roadmap

### Phase 1: Core Persistence (Week 1)
- [ ] Metadata layer with versioning in GeoPackage
- [ ] PostGIS versioning table + migration scripts
- [ ] `synthgis version` CLI command (show history, diff)

### Phase 2: Expansion Engine (Week 2-3)
- [ ] `TownExpander` class with radial/corridor/infill/satellite
- [ ] Topology-preserving merge logic
- [ ] `synthgis expand` CLI command
- [ ] Configuration-driven growth profiles

### Phase 3: Versioning & Diff (Week 3-4)
- [ ] Semantic versioning in metadata
- [ ] `synthgis version` CLI (list, show, diff)
- [ ] QGIS diff layer generation
- [ ] PostGIS versioning table + triggers

### Phase 4: Regional Assembly (Week 4-5)
- [ ] `RegionAssembler` class
- [ ] Connector infrastructure generation
- [ ] Service boundary harmonization
- [ ] `synthgis assemble-region` CLI

### Phase 5: Advanced Features (Week 5+)
- [ ] Time-travel queries (town at version X)
- [ ] Scenario branching (what-if: add highway here?)
- [ ] Automated growth simulation (cellular automata / agent-based)
- [ ] Export to CityJSON / 3D Tiles for visualization

---

## 6. CLI Command Extensions

```bash
# Version management
synthgis version list town.gpkg
synthgis version show town.gpkg --version 1.2.0
synthgis version diff town_v1.gpkg town_v2.gpkg --output diff.gpkg

# Expansion
synthgis expand town.gpkg --mode radial --rings 2 --output town_v2.gpkg
synthgis expand town.gpkg --mode corridor --corridor highway.geojson --width 2000 --output town_v2.gpkg
synthgis expand town.gpkg --mode infill --density 2.0 --output town_v2.gpkg
synthgis expand town.gpkg --mode satellite --center 100000,200000 --radius 2000 --output town_v2.gpkg

# Version management
synthgis version bump town.gpkg --type minor --message "Added northern corridor"
synthgis version tag town.gpkg v1.3.0

# Regional assembly
synthgis assemble-region region_spec.yaml --output metro.gpkg
synthgis connect-towns town_a.gpkg town_b.gpkg --type highway --output connected.gpkg

# Export for SynthCCD at specific version
synthgis export-synthccd town.gpkg --version 1.2.0 --output town_for_synthccd.gpkg
```

---

## 7. Integration with SynthCCD

```bash
# SynthCCD can now target specific town versions
uv run SynthCCD generate \
  --synthgis-town town.gpkg@v1.2.0 \
  --synthgis-graph graph.pkl \
  --rows 50000

# Or generate for entire region
uv run SynthCCD generate \
  --synthgis-region metro.gpkg \
  --config regional_realism.yaml \
  --rows 200000
```

---

## 8. Summary: Key Files to Create

| File | Purpose |
|------|---------|
| `src/synthgis/expansion.py` | `TownExpander` class, expansion modes |
| `src/synthgis/versioning.py` | Version tracking, diff, metadata |
| `src/synthgis/regional.py` | `RegionAssembler`, town merging |
| `src/synthgis/cli.py` | New commands: `expand`, `version`, `assemble-region` |
| `config/expansion_profiles.yaml` | Growth profiles (suburban, urban, rural) |
| `tests/test_expansion.py` | Expansion topology tests |
| `tests/test_versioning.py` | Version diff/merge tests |

---

*This document evolves as the persistence/expansion features are implemented. Update with each milestone.*