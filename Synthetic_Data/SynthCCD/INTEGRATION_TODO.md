# SynthGIS → SynthCCD Integration Tasks

> **Tracking SynthCCD-side changes needed for SynthGIS integration**
> Reference: `../SynthGIS/SynthGIS_SynthCCD_Integration.md`

---

## Background: Current OSM/Overpass Architecture

### How SynthCCD Currently Fetches Addresses

**Provider:** `OpenStreetMapAddressProvider` (`src/synth911gen3/addresses/osm_provider.py`)

```python
# Uses overpy library to query Overpass API
import overpy
api = overpy.Overpass()

query = f"""
[out:json][timeout:60];
area["name"="{area_name}"]->.searchArea;
(
  node["addr:housenumber"]["addr:street"](area.searchArea);
  way["addr:housenumber"]["addr:street"](area.searchArea);
);
out center;
"""

result = api.query(query)
# Parses nodes/ways → address objects with lat/lon
```

#### Overpass API Endpoints
- Primary: `https://overpass-api.de/api/interpreter`
- Mirrors: `https://overpass.kumi.systems/api/interpreter`, `https://overpass.openstreetmap.fr/api/interpreter`

#### Caching
- Results cached as Parquet in `~/.cache/synth911gen3/addresses/`
- Cache key: normalized area query string
- Invalidated only by manual deletion

#### Current Limitations (Why We're Replacing It)

| Issue | Details |
|-------|---------|
| **Non-deterministic** | OSM edits change results over time |
| **Network required** | First run needs internet; fails behind TLS-inspecting proxies |
| **Incomplete data** | Many areas lack `addr:housenumber`; synthesizes numbers |
| **No CLDXF** | OSM tags ≠ NENA `St_PreDir`, `St_PosTyp`, `Building`, `Floor`, `Unit` |
| **No sub-addresses** | Single point per building, no floor/unit/room |
| **No boundaries** | PSAP/Fire/EMS polygons missing or incomplete in OSM |
| **Rate limits** | Overpass enforces strict rate limits; large areas timeout |
| **Licensing** | ODbL share-alike problematic for commercial derivatives |

#### Proxy/TLS Issues (Enterprise)
```bash
# Behind TLS-inspecting proxy → certificate validation fails
# Workaround:
export SYNTHCCD_SYSTEM_TRUST=1
uv run SynthCCD generate --area "Kansas City, MO"

# For uv sync:
UV_SYSTEM_CERTS=true uv sync
```

---

## Phase 1: Address Provider Bridge (Week 1-2)

### New Files
- [ ] `src/synth911gen3/addresses/synthgis_provider.py` — `SynthGISAddressProvider` class
- [ ] `src/synth911gen3/addresses/__init__.py` — Export new provider

### Address Provider Implementation
- [ ] Read `RoadCenterLine` layer → street segments with CLDXF ranges
- [ ] Read `SiteStructureAddressPoint` layer → exact address points with sub-addresses
- [ ] Read service boundaries (PSAP, Fire, Police, EMS, Provisioning)
- [ ] Read stations (Fire, Police, EMS, Hospital)
- [ ] Read zones + run cards
- [ ] Load routing graph from pickle (exported by SynthGIS)

### Field Mapping (NENA/CLDXF → SynthCCD)
| SynthGIS Field | SynthCCD Field | Notes |
|----------------|----------------|-------|
| `AddNum` + `AddNumSuf` | `street_number` | |
| `St_PreDir` | `prefix_directional` | |
| `St_Name` | `street_name` | |
| `St_PosTyp` | `street_type` | |
| `St_PosDir` | `postfix_directional` | |
| `Building` | `building` | NEW |
| `Floor` | `floor` | NEW |
| `Unit` | `unit` | NEW |
| `Room` | `room` | NEW |
| `Seat` | `seat` | NEW |
| `PlaceType` | `place_type` | NEW |
| `Placement` | `placement` | NEW |
| `geometry` | `latitude`/`longitude` | Transform to WGS84 |

### CLI Integration
- [ ] Add `--synthgis-town PATH` flag to `generate` command
- [ ] Add `--synthgis-graph PATH` flag for routing graph pickle
- [ ] When `--synthgis-town` provided:
  - [ ] Ignore `--area` (OSM query)
  - [ ] Use SynthGIS provider instead of `OpenStreetMapAddressProvider`
  - [ ] Derive population from town if `--population` not set

---

## Phase 2: Service Boundaries & Dispatch (Week 2-3)

### Boundary-Based Dispatch
- [ ] Implement `find_service_boundary(point, service)` in provider
- [ ] Replace SynthCCD's implicit single-PSAP logic with boundary lookup
- [ ] Attach `psap_boundary`, `fire_zone`, `police_zone`, `ems_zone` to each incident
- [ ] Validate: every address point falls within provisioning boundary

### Run Card Integration
- [ ] Parse `FireRunCard`, `PoliceRunCard`, `EmsRunCard` layers
- [ ] Implement `get_dispatch_plan(incident_point, agency)` using run cards
- [ ] Replace static apparatus assignment with run-card-driven assignment
- [ ] Support multi-alarm (alarm levels 1, 2, 3+)

### Zone-Aware Personnel
- [ ] Dispatchers assigned from zone-appropriate console
- [ ] Station assignments respect zone boundaries

---

## Phase 3: Routing & Travel Times (Week 3-4)

### Routing Graph Loading
- [ ] Load NetworkX graph from pickle (exported by `synthgis generate --export-graph`)
- [ ] Or build from `RoadCenterLine` if pickle not available
- [ ] Cache graph in memory for generation

### Travel Time Calculation
- [ ] Implement `SynthGISRouter` class with:
  - [ ] `get_travel_time(station_id, destination_point)` → seconds
  - [ ] `get_turnout_time(address_point, agency)` → seconds
  - [ ] `find_nearest_station(point, agency)` → station info
  - [ ] `get_dispatch_plan(incident_point, agency)` → full plan with times

### Timestamp Generation Updates
- [ ] Replace static `travel_mean` with routing-based travel time
- [ ] Replace static `turnout_mean` with station-based turnout
- [ ] Keep lognormal distribution but center on calculated values
- [ ] Preserve parallel dispatch timeline logic

---

## Phase 4: Population Surface & Demand Weighting (Week 4-5)

### Population Surface (SynthGIS-side, but consumed here)
- [ ] Add `PopulationSurface` layer to SynthGIS GPKG (parcel/building level)
- [ ] Fields: `population`, `daytime_population`, `nighttime_population`, `zone_type`
- [ ] Load in SynthGIS provider

### Spatial Weighting in Incident Generation
- [ ] Implement `_pick_address_weighted(provider, rng)` 
- [ ] Weight by `daytime_population` (6am-10pm) / `nighttime_population` (10pm-6am)
- [ ] Fallback to uniform if population surface not available
- [ ] Test: verify commercial areas have more incidents during day

### Diurnal Population Shifts
- [ ] Implement time-of-day aware population lookup
- [ ] Commercial areas: high day, low night
- [ ] Residential: inverse pattern
- [ ] Mixed-use: blended

---

## Phase 5: Phone Metrics from Population (Week 5-6)

### Base Volume Calibration
- [ ] Implement `calculate_base_volume_from_synthgis(population_surface, realism, date_range)`
- [ ] Use `population_rates.emergency_tiers` from realism config
- [ ] Formula: `emergency_annual = (pop/1000) * tier_rate(pop)`
- [ ] Derive `base_hourly_volume = emergency_annual / 8760 / total_emergency_fraction`

### Phone Metrics Generation
- [ ] Use calculated base volume instead of `--rows`-derived volume
- [ ] Keep all existing phone metric logic (abandonment, answer times, etc.)
- [ ] Population still drives volume even if `--rows` specified for incidents

---

## Phase 6: CLI & Configuration

### New CLI Flags (SynthCCD)
```bash
# In src/synth911gen3/cli.py
--synthgis-town PATH        # Path to SynthGIS GeoPackage
--synthgis-graph PATH       # Path to routing graph pickle
```

### Config Updates
- [ ] Add `synthgis_integration` section to realism config:
```yaml
synthgis_integration:
  enabled: true
  use_routing_for_travel: true
  use_population_weighting: true
  use_service_boundaries: true
  use_run_cards: true
```

### Backward Compatibility
- [ ] If `--synthgis-town` not provided → use existing OSM provider
- [ ] If `--population` provided → overrides SynthGIS population
- [ ] If `--area` provided without `--synthgis-town` → OSM (current behavior)

---

## Phase 7: Testing & Validation

### Unit Tests
- [ ] `tests/addresses/test_synthgis_provider.py`
- [ ] `tests/routing/test_synthgis_router.py`
- [ ] `tests/generators/test_incidents_with_synthgis.py`
- [ ] `tests/population/test_spatial_weighting.py`

### Integration Tests
- [ ] `tests/integration/test_synthgis_synthccd_full.py`
```python
def test_full_pipeline():
    # 1. Generate test town (small, fast)
    # 2. Generate incidents using town
    # 3. Validate:
    #    - All incidents have address_source='synthgis'
    #    - All incidents have psap_boundary, fire_zone, etc.
    #    - travel_time_calculated > 0 and reasonable
    #    - Spatial distribution matches population surface
```

### Regression Tests
- [ ] Add SynthGIS integration to regression baseline
- [ ] Fixed seed (4242) generates deterministic output with SynthGIS town

---

## Phase 8: Documentation

### USERSGUIDE.md Updates
- [ ] Add "Using SynthGIS Towns" tutorial
- [ ] Document `--synthgis-town` / `--synthgis-graph` flags
- [ ] Explain address field differences (NENA/CLDXF vs OSM)
- [ ] Document routing-based travel times
- [ ] Document population-weighted incidents

### REALISMGUIDE.md Updates
- [ ] Document `synthgis_integration` config section
- [ ] Explain how population surface affects incident distribution
- [ ] Document run card dispatch behavior

### Example Configs
- [ ] `config/synthgis_example_realism.yaml` — complete example

---

## Dependencies & Coordination

| SynthCCD Task | Requires SynthGIS |
|---------------|-------------------|
| Address Provider | GPKG with RoadCenterLine, SiteStructureAddressPoint |
| Service Boundaries | GPKG with Psap/Fire/Police/Ems/Provisioning polygons |
| Run Cards | GPKG with Fire/Police/EmsRunCard layers |
| Routing | Pickle from `synthgis generate --export-graph` OR GPKG RoadCenterLine |
| Population Weighting | GPKG with PopulationSurface layer (new) |
| 3D Buildings | GPKG with Building3D layer (optional) |

**SynthGIS must generate first** → SynthCCD consumes output.

---

## Milestone Tracking

| Milestone | Target | Status |
|-----------|--------|--------|
| Address Provider reads GPKG | Week 1 | 🟡 Planned |
| Service boundary dispatch | Week 2 | 🟡 Planned |
| Routing-based travel times | Week 3 | 🟡 Planned |
| Population weighting | Week 4 | 🟡 Planned |
| Phone metrics from population | Week 5 | 🟡 Planned |
| CLI flags & config | Week 5 | 🟡 Planned |
| Integration tests pass | Week 6 | 🟡 Planned |
| Documentation updated | Week 6 | 🟡 Planned |

---

## Notes & Decisions

- **Coordinate Transform**: SynthGIS uses projected CRS (e.g., EPSG:2263 ftUS); SynthCCD expects WGS84. Provider must transform on read: `gdf.to_crs("EPSG:4326")`.

- **Determinism**: Both use seeded RNG. SynthGIS town generation seed → town. SynthCCD incident seed → incidents. Different seeds, independent but composable.

- **Sub-addresses**: SynthGIS provides Building/Floor/Unit/Room/Seat. SynthCCD schema needs these fields added (currently only has street_address components).

- **Run Card Format**: SynthGIS generates GPKG layer with alarm levels. SynthCCD needs parser.

- **Future**: Real-time incident streaming via FastAPI (SynthGIS routing service + SynthCCD incident generator).