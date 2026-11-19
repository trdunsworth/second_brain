# SynthGIS ↔ SynthCCD Integration Exploration

> **Goal**: Enable SynthCCD to use SynthGIS-generated synthetic towns for 9-1-1 CAD incident generation, replacing OSM address fetching with deterministic, NENA-compliant synthetic geography.

---

## 1. Current Architecture Comparison

### SynthGIS (Producer)
```
config/town_spec.yaml
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Deterministic Generation Pipeline                       │
├─────────────────────────────────────────────────────────┤
│ 1. Boundaries (Provisioning, PSAP, Fire, Police, EMS)  │
│ 2. Streets (Arterial → Collector → Local + CLDXF)      │
│ 3. Blocks & Parcels (momepy tessellation + subdivision)│
│ 4. Buildings (footprints + sub-addresses)              │
│ 5. Address Points (CLDXF SiteStructureAddressPoint)    │
│ 6. Operational (stations, zones, run cards)            │
│ 7. Routing Graph (NetworkX + travel-time weights)      │
│ 8. Validation (topology + schema + QC SQL)             │
└─────────────────────────────────────────────────────────┘
       │
       ▼
output/synthetic_town.gpkg  ──►  QGIS / PostGIS / Services
```

**Key Outputs (NENA Layers):**
- `RoadCenterLine` — with CLDXF address ranges (FromAddr_L/R, ToAddr_L/R, Parity_L/R)
- `SiteStructureAddressPoint` — full sub-address (Building/Floor/Unit/Room/Seat)
- `PsapPolygon`, `FirePolygon`, `PolicePolygon`, `EmsPolygon`, `ProvisioningPolygon`
- `FireStationPoint`, `PoliceStationPoint`, `EmsStationPoint`, `HospitalPoint`
- `FireZonePolygon`, `PoliceZonePolygon`, `EmsZonePolygon`
- `FireRunCard`, `PoliceRunCard`, `EmsRunCard`
- Routing graph (NetworkX) + pgRouting SQL export

### SynthCCD (Consumer)
```
config/realism_config.yaml
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Incident Generation Pipeline                            │
├─────────────────────────────────────────────────────────┤
│ 1. Address Provider (OSM/Overpass → real addresses)    │
│ 2. Population/Volume Calibration                       │
│ 3. Incident Generation (agency, priority, problem)     │
│ 4. Address Assignment (from provider pool)             │
│ 5. Time Profile Assignment (agency/priority)           │
│ 6. Personnel Assignment (shift-aware, Zipf-weighted)   │
│ 7. Timestamp Generation (parallel dispatch timeline)   │
│ 8. Phone Metrics (hourly volumes, abandonment)         │
└─────────────────────────────────────────────────────────┘
       │
       ▼
output/*.parquet/csv/geojson
```

**Current Address Provider:** `OpenStreetMapAddressProvider` (Overpass API → caches to disk)

**Key Gap:** SynthCCD relies on **real OSM addresses** which:
- Are non-deterministic (OSM changes)
- Require network access
- May have licensing/attribution concerns
- Don't match NENA CLDXF structure perfectly
- Lack sub-address granularity (Building/Floor/Unit)
- No service boundaries for dispatch logic

---

## OpenStreetMap & Overpass API — Current Usage in SynthCCD

> **Note:** The user mentioned "Overland API" — this refers to the **Overpass API**, the read-only API for querying OpenStreetMap data.

### How SynthCCD Currently Uses OSM/Overpass

SynthCCD's `OpenStreetMapAddressProvider` (in `src/synth911gen3/addresses/osm_provider.py`) uses the **Overpass API** to fetch real-world addresses from OpenStreetMap.

#### Overpass Query Pattern

```python
# Simplified example of the Overpass QL query used
query = f"""
[out:json][timeout:60];
area["name"="{area_name}"]->.searchArea;
(
  node["addr:housenumber"]["addr:street"](area.searchArea);
  way["addr:housenumber"]["addr:street"](area.searchArea);
);
out center;
"""

# Executed via HTTP POST to https://overpass-api.de/api/interpreter
# Or via the `overpy` Python library
```

#### What Gets Fetched

| OSM Element | Address Fields Extracted |
|-------------|-------------------------|
| **Nodes** with `addr:housenumber` + `addr:street` | `housenumber`, `street`, `postcode`, `city`, `lat`, `lon` |
| **Ways** (building polygons) with address tags | Center point used for coordinates |

#### Caching Strategy

1. **First run**: Queries Overpass API, stores results in local cache (`~/.cache/synth911gen3/addresses/`)
2. **Subsequent runs**: Loads from cache (Parquet files), no network calls
3. **Cache key**: Based on area query string (e.g., "Kansas City, MO")

#### Current Limitations for NG9-1-1

| Limitation | Impact on SynthCCD |
|------------|-------------------|
| **Non-deterministic** | OSM data changes over time; same query → different results months later |
| **Network dependency** | First run requires internet; blocked by firewalls/proxies |
| **Incomplete address data** | Many areas lack `addr:housenumber`; falls back to street-only with synthesized numbers |
| **No CLDXF structure** | OSM tags don't map cleanly to NENA `St_PreDir`, `St_PosTyp`, `Building`, `Floor`, `Unit`, etc. |
| **No sub-addresses** | Multi-unit buildings (apartments, offices) typically have single address point |
| **No service boundaries** | PSAP/Fire/EMS polygons not in OSM (or incomplete) |
| **Licensing** | OSM is ODbL; derivative works must share alike — problematic for commercial use |
| **Rate limits** | Overpass API has strict rate limits; large areas may timeout |

#### How SynthCCD Handles Missing Data

```python
# In OpenStreetMapAddressProvider._synthesize_addresses()
# When OSM lacks house numbers:
for street in streets_without_numbers:
    # Generate synthetic house numbers along street
    for i in range(1, num_addresses):
        address = SynthesizedAddress(
            street_name=street.name,
            street_type=street.type,
            housenumber=str(i * 100),  # 100, 200, 300...
            lat=interpolated_lat,
            lon=interpolated_lon,
            is_synthesized=True  # flag for later filtering
        )
```

Synthesized addresses get `0.0, 0.0` coordinates and are **excluded from geospatial exports** (GeoJSON/Shapefile).

#### Real-World Deployment: TLS/Proxy Issues

Per the SynthCCD `AGENTS.md`, many enterprise environments sit behind **TLS-inspecting proxies** that break certificate validation:

```bash
# Overpass API calls fail with:
# "invalid peer certificate: UnknownIssuer"

# Workaround for Overpass API calls (uses truststore package):
export SYNTHCCD_SYSTEM_TRUST=1
uv run SynthCCD generate --area "Kansas City, MO"

# Or for uv sync (uses system certs):
UV_SYSTEM_CERTS=true uv sync
```

**SynthGIS advantage**: Zero network calls at generation time — completely offline after initial dependency install. No proxy/TLS issues.

---

## 2. Integration Vision

### Target User Workflow
```bash
# 1. Design synthetic town (one-time or per scenario)
uv run synthgis generate --config config/my_town.yaml \
  --output output/my_town.gpkg --3d --export-graph graph.pkl

# 2. Generate incidents using THAT town's geography
uv run SynthCCD generate \
  --synthgis-town output/my_town.gpkg \
  --config config/my_center_realism.yaml \
  --rows 50000 \
  --format parquet

# 3. Optional: Start services for real-time dispatch simulation
uv run synthgis serve-routing output/my_town.gpkg --graph-pickle graph.pkl
uv run SynthCCD serve  # (future: FastAPI for incident streaming)
```

### Data Flow
```
SynthGIS GeoPackage                    SynthCCD
┌─────────────────────────────────────────────────────────────┐
│  RoadCenterLine          ──►  Address Pool (street + range) │
│  SiteStructureAddressPoint ─►  Address Pool (exact points)  │
│  Service Boundaries       ──►  Dispatch Logic (PSAP/EMS/etc)│
│  Stations                 ──►  Travel Time / Turnout        │
│  Zones + Run Cards        ──►  Dispatch Rules               │
│  Routing Graph            ──►  Travel Time Calculator       │
│  Population/Demand Surface ──► Incident Density Weighting   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Integration Points — Detailed

### 3.1 Address Provider Replacement

**Current:** `OpenStreetMapAddressProvider` → fetches from Overpass, caches locally

**New:** `SynthGISAddressProvider` → reads from SynthGIS GeoPackage

```python
# synth911gen3/addresses/synthgis_provider.py (NEW)
class SynthGISAddressProvider:
    """Address provider that reads from SynthGIS-generated GeoPackage."""
    
    def __init__(self, gpkg_path: Path, seed: int = 42):
        self.gpkg_path = gpkg_path
        self.seed = seed
        self._load_layers()
    
    def _load_layers(self):
        # Read NENA layers
        self.streets = gpd.read_file(self.gpkg_path, layer="RoadCenterLine")
        self.address_points = gpd.read_file(self.gpkg_path, layer="SiteStructureAddressPoint")
        self.boundaries = {
            'psap': gpd.read_file(self.gpkg_path, layer="PsapPolygon"),
            'fire': gpd.read_file(self.gpkg_path, layer="FirePolygon"),
            'police': gpd.read_file(self.gpkg_path, layer="PolicePolygon"),
            'ems': gpd.read_file(self.gpkg_path, layer="EmsPolygon"),
            'provisioning': gpd.read_file(self.gpkg_path, layer="ProvisioningPolygon"),
        }
        self.stations = {
            'fire': gpd.read_file(self.gpkg_path, layer="FireStationPoint"),
            'police': gpd.read_file(self.gpkg_path, layer="PoliceStationPoint"),
            'ems': gpd.read_file(self.gpkg_path, layer="EmsStationPoint"),
        }
        self.zones = {
            'fire': gpd.read_file(self.gpkg_path, layer="FireZonePolygon"),
            'police': gpd.read_file(self.gpkg_path, layer="PoliceZonePolygon"),
            'ems': gpd.read_file(self.gpkg_path, layer="EmsZonePolygon"),
        }
        self.run_cards = {
            'fire': gpd.read_file(self.gpkg_path, layer="FireRunCard"),
            # ...
        }
        self.routing_graph = self._load_routing_graph()
    
    def get_address_pool(self) -> list[SynthGISAddress]:
        """Return all address points as structured address objects."""
        addresses = []
        for _, row in self.address_points.iterrows():
            addresses.append(SynthGISAddress(
                street_address=row['street_address'],  # computed from CLDXF
                latitude=row.geometry.y,
                longitude=row.geometry.x,
                # NENA fields:
                add_num=row['AddNum'],
                add_num_suf=row['AddNumSuf'],
                street_name=row['St_Name'],
                street_type=row['St_PosTyp'],
                pre_dir=row['St_PreDir'],
                post_dir=row['St_PosDir'],
                building=row['Building'],
                floor=row['Floor'],
                unit=row['Unit'],
                room=row['Room'],
                seat=row['Seat'],
                place_type=row['PlaceType'],
                placement=row['Placement'],
                # Service boundary context:
                psap=self._find_boundary(row.geometry, 'psap'),
                fire_zone=self._find_boundary(row.geometry, 'fire'),
                police_zone=self._find_boundary(row.geometry, 'police'),
                ems_zone=self._find_boundary(row.geometry, 'ems'),
            ))
        return addresses
    
    def get_street_segments(self) -> list[StreetSegment]:
        """Return street segments with CLDXF address ranges for interpolation."""
        segments = []
        for _, row in self.streets.iterrows():
            segments.append(StreetSegment(
                geometry=row.geometry,
                street_name=row['St_Name'],
                street_type=row['St_PosTyp'],
                pre_dir=row['St_PreDir'],
                post_dir=row['St_PosDir'],
                from_addr_l=row['FromAddr_L'],
                to_addr_l=row['ToAddr_L'],
                from_addr_r=row['FromAddr_R'],
                to_addr_r=row['ToAddr_R'],
                parity_l=row['Parity_L'],
                parity_r=row['Parity_R'],
            ))
        return segments
    
    def find_service_boundary(self, point: Point, service: str) -> str:
        """Find which service boundary contains a point."""
        gdf = self.boundaries[service]
        containing = gdf[gdf.geometry.contains(point)]
        if len(containing) > 0:
            return containing.iloc[0]['Name']
        return None
    
    def find_nearest_station(self, point: Point, service: str) -> Station:
        """Find nearest station with travel time."""
        stations = self.stations[service]
        # Use routing graph for travel time, fallback to straight-line
        ...
```

### 3.2 Incident Generation with Synthetic Geography

**Current Flow:** SynthCCD picks random address from OSM pool → assigns agency/priority/problem → generates timestamps

**New Flow with SynthGIS:**
```python
# synth911gen3/generators/incidents.py (MODIFIED)

def generate_incident_with_synthgis(
    self, 
    address_provider: SynthGISAddressProvider,
    realism: RealismConfig,
    rng: np.random.Generator
) -> Incident:
    """Generate incident using SynthGIS geography."""
    
    # 1. Pick address weighted by population/demand surface
    address = self._pick_address_weighted(address_provider, rng)
    
    # 2. Determine service boundaries from address
    psap = address.psap or address_provider.find_service_boundary(
        Point(address.longitude, address.latitude), 'psap')
    fire_zone = address.fire_zone or address_provider.find_service_boundary(...)
    police_zone = ...
    ems_zone = ...
    
    # 3. Select agency (constrained by available boundaries)
    agency = self._select_agency(realism, available_agencies)
    
    # 4. Select priority, problem nature (existing logic)
    priority = self._select_priority(realism, agency, rng)
    problem = self._select_problem(realism, agency, priority, rng)
    
    # 5. Get time profile for agency/priority
    time_profile = realism.time_profiles[agency][priority]
    
    # 6. Generate timestamps with PARALLEL DISPATCH
    #    - Use routing graph for travel_time
    #    - Use station locations for turnout
    timestamps = self._generate_timestamps_parallel(
        call_start=rng.uniform(date_start, date_end),
        time_profile=time_profile,
        dispatch_init_fraction=realism.dispatch_init_fraction[priority],
        # NEW: use routing for travel time
        travel_time=address_provider.routing_graph.get_travel_time(
            address_provider.find_nearest_station(address, agency),
            Point(address.longitude, address.latitude)
        ),
        # NEW: use station location for turnout
        turnout_time=address_provider.get_turnout_time(address, agency),
        rng=rng
    )
    
    # 7. Assign personnel (shift-aware, Zipf-weighted)
    calltaker = self._pick_calltaker(shift, rng)
    dispatcher = self._pick_dispatcher(shift, agency, rng)
    
    return Incident(
        # ... all existing fields ...
        # NEW: SynthGIS-specific fields
        psap_boundary=psap,
        fire_zone=fire_zone,
        police_zone=police_zone,
        ems_zone=ems_zone,
        nearest_fire_station=address.nearest_fire_station,
        nearest_police_station=address.nearest_police_station,
        nearest_ems_station=address.nearest_ems_station,
        travel_time_calculated=timestamps.travel_time,
        turnout_time_calculated=timestamps.turnout_time,
        # Geographic context
        latitude=address.latitude,
        longitude=address.longitude,
        address_source='synthgis',  # vs 'osm'
    )
```

### 3.3 Travel Time Calculation (Routing Integration)

```python
# synthgis/routing.py (EXTENDED)

class SynthGISRouter:
    """Router using SynthGIS NetworkX graph with travel-time weights."""
    
    def __init__(self, graph: nx.MultiDiGraph, stations: dict[str, gpd.GeoDataFrame]):
        self.graph = graph
        self.stations = stations
        self._build_station_index()
    
    def get_travel_time(self, station_id: str, destination: Point) -> float:
        """Get travel time from station to destination using routing graph."""
        station_node = self._nearest_node(self.station_coords[station_id])
        dest_node = self._nearest_node(destination)
        
        try:
            path = nx.shortest_path(self.graph, station_node, dest_node, weight='travel_time')
            return nx.shortest_path_length(self.graph, station_node, dest_node, weight='travel_time')
        except nx.NetworkXNoPath:
            # Fallback: straight-line distance / average speed
            return self._estimate_travel_time(station_coords[station_id], destination)
    
    def get_turnout_time(self, address: Point, agency: str) -> float:
        """Get turnout time (station to wheels rolling) for nearest station."""
        station = self.find_nearest_station(address, agency)
        # Turnout is time from dispatch to wheels rolling
        # Based on agency type and station type
        base_turnout = {'LAW': 60, 'FIRE': 90, 'EMS': 45}  # seconds
        return base_turnout[agency] * random.uniform(0.8, 1.3)
    
    def find_nearest_station(self, point: Point, agency: str) -> str:
        """Find nearest station by straight-line distance."""
        stations = self.stations[agency]
        min_dist = float('inf')
        nearest = None
        for _, station in stations.iterrows():
            dist = point.distance(station.geometry)
            if dist < min_dist:
                min_dist = dist
                nearest = station['StationNum']
        return nearest
    
    def get_dispatch_plan(self, incident_point: Point, agency: str) -> DispatchPlan:
        """Get full dispatch plan using run cards + routing."""
        zone = self._find_zone(incident_point, agency)
        run_card = self.run_cards[agency][zone]
        stations = []
        for alarm_level, apparatus in run_card.items():
            station = self.stations[agency].loc[station_id]
            travel = self.get_travel_time(station['StationNum'], incident_point)
            turnout = self.get_turnout_time(incident_point, agency)
            stations.append({
                'station': station['StationName'],
                'apparatus': apparatus,
                'turnout_seconds': turnout,
                'travel_seconds': travel,
                'total_response_seconds': turnout + travel,
            })
        return DispatchPlan(zone=zone, stations=stations)
```

### 3.4 Population/Demand Surface for Incident Density

SynthGIS can generate a synthetic population surface that SynthCCD uses for spatial weighting:

```python
# synthgis/operational.py (EXTENDED)

def generate_population_surface(
    parcels: gpd.GeoDataFrame,
    buildings: gpd.GeoDataFrame,
    spec: TownSpec,
    seed_state: SeedState,
) -> gpd.GeoDataFrame:
    """Generate synthetic population per parcel/building for incident weighting."""
    rng = seed_state.rng("population")
    
    population = []
    for _, parcel in parcels.iterrows():
        zone_type = parcel.get('zone_type', 'residential')
        
        # Population density by zone (people per sq km)
        density = {
            'residential': rng.uniform(2000, 8000),
            'commercial': rng.uniform(500, 3000),  # Daytime population
            'industrial': rng.uniform(100, 500),
            'civic': rng.uniform(1000, 5000),  # Schools, govt buildings
        }[zone_type]
        
        parcel_pop = int(parcel.geometry.area / 1_000_000 * density)  # area in sq km
        
        # Distribute to buildings
        parcel_buildings = buildings[buildings['parcel_id'] == parcel['parcel_id']]
        for _, bldg in parcel_buildings.iterrows():
            bldg_pop = int(parcel_pop * (bldg.geometry.area / parcel.geometry.area))
            population.append({
                'parcel_id': parcel['parcel_id'],
                'building_id': bldg['building_id'],
                'geometry': bldg.geometry.centroid,
                'population': bldg_pop,
                'zone_type': zone_type,
                'daytime_population': bldg_pop * (1.5 if zone_type == 'commercial' else 1.0),
                'nighttime_population': bldg_pop * (0.3 if zone_type == 'commercial' else 1.0),
            })
    
    return gpd.GeoDataFrame(population, crs=parcels.crs)
```

**SynthCCD uses this for spatial weighting:**
```python
# synth911gen3/generators/incidents.py

def _pick_address_weighted(self, provider: SynthGISAddressProvider, rng: np.random.Generator) -> SynthGISAddress:
    """Pick address weighted by population/demand surface."""
    addresses = provider.get_address_pool()
    
    if not hasattr(provider, 'population_surface') or provider.population_surface is None:
        # Uniform fallback
        return rng.choice(addresses)
    
    # Weight by population at address location
    weights = []
    for addr in addresses:
        pt = Point(addr.longitude, addr.latitude)
        # Find containing population cell
        containing = provider.population_surface[
            provider.population_surface.geometry.contains(pt)
        ]
        if len(containing) > 0:
            # Weight by time-of-day appropriate population
            hour = self._get_current_hour()  # or pass as param
            pop = containing.iloc[0].get('daytime_population' if 6 <= hour < 22 else 'nighttime_population', 1)
        else:
            pop = 1
        weights.append(pop)
    
    # Normalize and pick
    weights = np.array(weights)
    weights = weights / weights.sum()
    return rng.choice(addresses, p=weights)
```

### 3.5 Phone Metrics Calibration from Synthetic Population

SynthGIS population drives SynthCCD phone volume calibration:

```python
# synth911gen3/generators/phone_metrics.py (MODIFIED)

def calculate_base_volume_from_synthgis(
    population_surface: gpd.GeoDataFrame,
    realism: RealismConfig,
    date_range: tuple[datetime, datetime]
) -> float:
    """Calculate base hourly volume from SynthGIS population."""
    total_population = population_surface['population'].sum()
    
    # Use population_rates from realism config
    tier_rate = _get_tier_rate(total_population, realism.population_rates)
    emergency_annual = (total_population / 1000) * tier_rate
    
    # Convert to hourly base
    total_emergency_fraction = (
        realism.phone_metrics.nine_one_one_received_fraction +
        realism.phone_metrics.non_emergency_received_fraction +
        realism.phone_metrics.sms_rtt_received_fraction
    )
    
    base_hourly = (emergency_annual / 8760) / total_emergency_fraction
    return max(base_hourly, realism.phone_metrics.min_hourly_volume)
```

---

## 4. CLI Integration

### SynthGIS → New Commands
```bash
# Already added:
synthgis generate --3d --export-graph graph.pkl
synthgis serve-routing town.gpkg --graph-pickle graph.pkl
synthgis serve-lost town.gpkg
synthgis export-graph town.gpkg -o graph.pkl
synthgis buildings_3d in.gpkg -o out.gpkg
```

### SynthCCD → New Flags
```bash
# New SynthCCD flags:
uv run SynthCCD generate \
  --synthgis-town output/town.gpkg \
  --synthgis-graph graph.pkl \
  --config config/my_center.yaml \
  --rows 50000 \
  --format parquet

# If --synthgis-town provided, ignore --area (OSM) flag
# --synthgis-graph enables routing-based travel times
# Population derived from town if --population not specified
```

---

## 5. Implementation Phases

### Phase 1: Address Provider Bridge (Week 1-2)
- [ ] Create `SynthGISAddressProvider` in SynthCCD
- [ ] Read `RoadCenterLine` + `SiteStructureAddressPoint` from GPKG
- [ ] Map NENA/CLDXF fields to SynthCCD address schema
- [ ] Add `--synthgis-town` CLI flag
- [ ] Test: generate incidents using synthetic addresses only

### Phase 2: Service Boundaries & Dispatch (Week 2-3)
- [ ] Load PSAP/Fire/Police/EMS boundaries from GPKG
- [ ] Implement point-in-polygon service boundary lookup
- [ ] Replace SynthCCD's implicit dispatch with boundary-based dispatch
- [ ] Load run cards, generate dispatch plans

### Phase 3: Routing & Travel Times (Week 3-4)
- [ ] Load routing graph from pickle/GPKG
- [ ] Implement `SynthGISRouter` with travel-time weights
- [ ] Replace SynthCCD's static travel time with routing-based
- [ ] Add turnout time from station locations
- [ ] Validate against known travel times

### Phase 4: Population Surface & Demand Weighting (Week 4-5)
- [ ] Generate population surface in SynthGIS (extend operational.py)
- [ ] Export population surface as GPKG layer
- [ ] Implement spatial weighting in SynthCCD incident picker
- [ ] Add diurnal population shifts (day/night)

### Phase 5: Phone Metrics from Population (Week 5-6)
- [ ] Derive base hourly volume from synthetic population
- [ ] Calibrate phone metrics using population_rates tier
- [ ] Test end-to-end: town → incidents + phone metrics

### Phase 5: Polish & Documentation (Week 6-7)
- [ ] Update USERSGUIDE.md / REALISMGUIDE.md for both projects
- [ ] Add integration tutorial
- [ ] Regression tests for integration
- [ ] Example configs for common scenarios

---

## 6. Configuration Files

### SynthGIS Config Extension (town_spec.yaml)
```yaml
# Add to existing town_spec.yaml
population_surface:
  enabled: true
  residential_density_range: [2000, 8000]    # people/sq km
  commercial_day_density_range: [500, 3000]
  commercial_night_multiplier: 0.3
  industrial_density_range: [100, 500]
  civic_density_range: [1000, 5000]
  daytime_hours: [6, 22]  # 6am-10pm

routing:
  graph_weights:
    speed_limit_factor: 1.0
    turn_penalty_seconds: 5
    one_way_compliance: 0.95
```

### SynthCCD Realism Config Extension
```yaml
# In realism_config.yaml
synthgis_integration:
  enabled: true
  use_routing_for_travel: true
  use_population_weighting: true
  use_service_boundaries: true
  use_run_cards: true
  
# Override population if using SynthGIS
# population: null  # Will be derived from SynthGIS town
```

---

## 7. Testing Strategy

### Unit Tests
```python
# tests/test_synthgis_integration.py

def test_synthgis_address_provider():
    provider = SynthGISAddressProvider("tests/fixtures/test_town.gpkg")
    addresses = provider.get_address_pool()
    assert len(addresses) > 0
    assert all(hasattr(a, 'street_address') for a in addresses)
    assert all(hasattr(a, 'building') for a in addresses)

def test_routing_travel_time():
    router = SynthGISRouter(graph, stations)
    time = router.get_travel_time("FIRE-01", Point(x, y))
    assert time > 0
    assert time < 3600  # reasonable

def test_incident_with_synthgis():
    provider = SynthGISAddressProvider("tests/fixtures/test_town.gpkg")
    incident = generator.generate_incident_with_synthgis(provider, realism, rng)
    assert incident.psap_boundary is not None
    assert incident.travel_time_calculated > 0

def test_population_weighting():
    provider = SynthGISAddressProvider("tests/fixtures/test_town.gpkg")
    # Pick 10000 addresses, verify distribution matches population surface
    picks = [provider._pick_address_weighted(rng) for _ in range(10000)]
    # Verify commercial areas picked more during day
```

### Integration Tests
```bash
# tests/integration/test_synthgis_synthccd.py

def test_full_pipeline():
    # 1. Generate town
    uv run synthgis generate --config test_town.yaml --output test.gpkg --export-graph graph.pkl
    
    # 2. Generate incidents using town
    uv run SynthCCD generate \
      --synthgis-town test.gpkg \
      --synthgis-graph graph.pkl \
      --rows 1000 \
      --format parquet \
      --output test_output/
    
    # 3. Validate output
    df = pd.read_parquet("test_output/synthetic_911_incidents.parquet")
    assert len(df) == 1000
    assert df['address_source'].eq('synthgis').all()
    assert df['psap_boundary'].notna().all()
    assert df['travel_time_calculated'].gt(0).all()
```

---

## 8. Backward Compatibility

| Feature | Current (OSM) | With SynthGIS | Fallback |
|---------|---------------|---------------|----------|
| Address Source | OSM/Overpass | SynthGIS GPKG | `--area` still works |
| Travel Time | Static dist/speed | Routing graph | Straight-line |
| Service Boundaries | Implicit (PSAP = area) | Explicit polygons | Single PSAP |
| Population | `--population` flag | Derived from town | `--population` wins |
| Sub-addresses | Limited | Full CLDXF | N/A |
| Determinism | Seed + OSM cache | Full seed-lock | Seed still works |

---

## 9. Open Questions / Decisions Needed

1. **Coordinate Systems**: SynthGIS uses projected CRS (e.g., EPSG:2263 ftUS); SynthCCD expects WGS84 lat/lon. Handle in provider (transform on read).

2. **Address Schema Mapping**: SynthGIS NENA/CLDXF → SynthCCD address fields. Need explicit mapping table.

3. **Run Card Format**: SynthGIS generates run cards as GPKG layer; SynthCCD needs to parse and use.

4. **3D Buildings**: If `--3d` used, SynthCCD could get floor-level address precision for high-rises.

5. **Temporal Alignment**: SynthGIS town has no inherent date; SynthCCD needs date range. Town is timeless; incidents have dates.

6. **Multi-Town**: Support multiple SynthGIS towns in one SynthCCD run (regional PSAP)?

7. **Streaming/Real-time**: Future: SynthGIS routing service + SynthCCD incident stream = real-time dispatch simulation.

---

## 10. Next Steps

1. **Create `SynthGISAddressProvider`** in SynthCCD repo (new file)
2. **Add `--synthgis-town` / `--synthgis-graph` flags** to SynthCCD CLI
3. **Test with minimal town** (100 addresses, 10 streets)
4. **Iterate on routing integration**
5. **Document in both USERSGUIDE.md files**

The foundation is solid — both projects use deterministic seeding, NENA standards, and modern Python GIS stack. The integration is primarily data plumbing with rich semantic payoff.