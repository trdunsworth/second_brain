# PSAP Research — Complete Simulation Ecosystem Component Catalog

> **Comprehensive catalog of all simulation layers, components, and their implementations with pros, cons, and implementation recommendations**

---

## Layer 0: GEOGRAPHY (SynthGIS)

### Components

| Component | Status | Description | Implementation |
|-----------|--------|-------------|----------------|
| **Boundaries** | ✅ Done | Provisioning, PSAP, Fire, Police, EMS polygons | Voronoi partition of extent |
| **RoadCenterLine** | ✅ Done | Streets with CLDXF address ranges | Procedural: arterial→collector→local + momepy topology |
| **SiteStructureAddressPoint** | ✅ Done | Address points with full CLDXF sub-address | Interpolation + building sub-addresses |
| **Stations** | ✅ Done | Fire/Police/EMS/Hospital points | Voronoi within service boundaries |
| **Zones** | ✅ Done | Response zones per service | Voronoi around stations |
| **Run Cards** | ✅ Done | Alarm-level apparatus assignments | Per-zone, per-alarm-level |
| **Routing Graph** | ✅ Done | NetworkX MultiDiGraph with travel-time | momepy primal + travel-time weights |
| **Population Surface** | 🟡 Planned | Parcel/building level day/night population | Density by zone + building allocation |
| **Hydrology** | ✅ Done | Rivers/creeks constraining streets | Buffer polygons forcing bridges |
| **3D Buildings** | 🟡 Scaffolding | Z-enabled footprints with roof types | Extrusion with flat/gabled/hipped |

### Pros/Cons

| Component | Pros | Cons | Recommendation |
|-----------|------|------|----------------|
| **RoadCenterLine** | NENA-compliant, CLDXF ranges, deterministic | Limited organic complexity vs real cities | Add Perlin noise perturbations for realism |
| **Address Points** | Full CLDXF sub-address, exact placement | No interior routing (floor/room) | Add interior graph for high-rise |
| **Routing Graph** | Travel-time weights, pgRouting export | Static speeds, no dynamic traffic | Add dynamic traffic layer (Phase 4) |
| **Run Cards** | Multi-alarm, mutual aid support | Static, no conditional logic | Add conditional rules (weather, time) |

### Implementation Priority
1. **Population Surface** — Critical for spatial weighting
2. **Dynamic Traffic** — High impact on travel times
3. **3D Buildings** — Needed for high-rise sub-address realism

---

## Layer 1: WORKLOAD GENERATION (SynthCCD)

### Components

| Component | Status | Description | Key Features |
|-----------|--------|-------------|--------------|
| **Address Provider** | ✅ Done | OSM/Overpass with caching | `OpenStreetMapAddressProvider` |
| **SynthGIS Provider** | 🟡 In design | Reads SynthGIS GPKG | NENA/CLDXF native |
| **Incident Generator** | ✅ Done | Agency, priority, problem | Agency/priority-weighted |
| **Timestamp Generator** | ✅ Done | Parallel dispatch timeline | Lognormal intervals, dispatch_init_fraction |
| **Personnel Assignment** | ✅ Done | Shift-aware, Zipf-weighted | Calltaker/dispatcher pools |
| **Phone Metrics** | ✅ Done | Hourly volumes, abandonment | Population-calibrated |
| **Geospatial Export** | ✅ Done | GeoJSON/Shapefile | WGS84 coordinates |

### Pros/Cons

| Component | Pros | Cons | Recommendation |
|-----------|------|------|----------------|
| **OSM Provider** | Real addresses, free | Non-deterministic, network-dependent, no CLDXF | **Replace with SynthGIS provider** |
| **SynthGIS Provider** | Deterministic, CLDXF native, offline | Requires SynthGIS town first | **Primary provider for research** |
| **Parallel Dispatch** | Realistic timeline | Complex implementation | Keep, well-tested |
| **Population Calibration** | Realistic volumes | Tiered model approximate | Add calibration from real centers |

### Implementation Priority
1. **SynthGIS Provider** — Enables all downstream research
2. **Population-weighted address selection** — Critical for realism
3. **Sub-address support** — Building/Floor/Unit/Room/Seat

---

## Layer 2: SIMULATION ENGINE (PSAP Research Core)

### Components

| Component | Status | Description | Key Classes |
|-----------|--------|-------------|-------------|
| **Event Queue** | 🟡 Design | Priority queue by timestamp | `SimulationEvent`, `EventType` |
| **Unit State Machine** | 🟡 Design | 6-state with valid transitions | `UnitStateMachine`, `UnitState` |
| **Unit Registry** | 🟡 Design | All units + state + location | `Unit`, `UnitStateMachine` |
| **Incident Manager** | 🟡 Design | Lifecycle + parallel timeline | `Incident`, `IncidentTimestamps` |
| **Dispatch Logic** | 🟡 Design | Assignment + run cards | `Dispatcher`, `DispatchPlan` |
| **Router** | 🟡 Design | Travel time + turnout | `SynthGISRouter` |
| **Clock** | 🟡 Design | Discrete event simulation | `SimulationClock` |
| **Metrics Collector** | 🟡 Design | Hourly + per-incident | `MetricsCollector` |

### Unit State Machine

```
AVAILABLE ──► DISPATCHED ──► ENROUTE ──► ON_SCENE ──► CLEARING ──► AVAILABLE
     ▲           │            │           │            │
     │           ▼            ▼           ▼            │
     └───── OUT_OF_SERVICE ◄────────────────────────────┘
```

**Valid Transitions:**
| From | To (Valid) |
|------|------------|
| AVAILABLE | DISPATCHED, OUT_OF_SERVICE |
| DISPATCHED | ENROUTE, AVAILABLE (cancelled) |
| ENROUTE | ON_SCENE, AVAILABLE (cancelled) |
| ON_SCENE | CLEARING, ENROUTE (relocate) |
| CLEARING | AVAILABLE |
| OUT_OF_SERVICE | AVAILABLE |

### Dispatch Logic Options

| Strategy | Description | Pros | Cons | Best For |
|--------|-------------|------|------|----------|
| **Nearest Available** | Closest unit by travel time | Simple, fast | Ignores workload | Baseline |
| **Zone-Aware** | Respects service boundaries | Jurisdictional accuracy | May delay nearest | Production |
| **Workload-Balanced** | Considers unit UHU | Equity | Complex | Research |
| **Specialization-Aware** | Matches capabilities | Appropriate response | Requires capability tags | Specialized |
| **Run-Card-Driven** | Follows pre-planned cards | Policy compliance | Inflexible | Production |
| **ML-Optimized** | Predictive positioning | Optimal coverage | Requires training data | Advanced |

### Parallel Dispatch Timeline

```
CALL RECEIVED
      │
      ▼
CALL ANSWERED (pickup delay)
      │
      ├──────────────────┬──────────────────┐
      ▼                  ▼                  ▼
INTERVIEW          DISPATCH INITIATED   PHONE CONTINUES
(questioning)      (dispatch_fraction)  (continues)
      │                  │                  │
      ▼                  ▼                  ▼
INTERVIEW          FIRST UNIT          CALL ENDS
COMPLETE           ASSIGNED
      │                  │
      ▼                  ▼
      └──────────────┬──┘
                     ▼
              UNIT ENROUTE
                     │
                     ▼
              UNIT ARRIVED
                     │
                     ▼
              ON SCENE
                     │
                     ▼
              UNIT CLEARED
                     │
                     ▼
           INCIDENT CLOSED
```

**Key Parameter**: `dispatch_init_fraction` — fraction of phone duration before dispatch can begin
- Priority 1: [0.05, 0.20] — dispatch while caller on phone
- Priority 5: [1.00, 1.30] — dispatch after call ends

---

## Layer 3: OPERATIONS LAYERS (Advanced Realism)

### 3.1 Dynamic Traffic Model

| Feature | Implementation | Parameters |
|---------|----------------|------------|
| **Time-of-day profiles** | Hourly speed multipliers | Peak: 0.7x, Off-peak: 1.0x, Night: 1.2x |
| **Incident impact** | Temporary speed reduction near incidents | Radius: 500m, Reduction: 30-50% |
| **Weather effects** | Rain/snow/ice speed modifiers | Rain: 0.85x, Snow: 0.6x, Ice: 0.4x |
| **Events/Construction** | Temporary closures + detours | Planned events, road work |
| **Apparatus-specific** | Type-based speed profiles | Engine: 1.0x, Ladder: 0.85x, Medic: 1.1x |

**Implementation Approach:**
```python
class DynamicTrafficModel:
    def get_speed_modifier(
        self,
        segment: StreetSegment,
        timestamp: datetime,
        weather: WeatherCondition,
        active_incidents: List[Incident]
    ) -> float:
        modifier = 1.0
        modifier *= self._time_of_day_factor(timestamp.hour)
        modifier *= self._weather_factor(weather)
        modifier *= self._incident_proximity_factor(segment, active_incidents)
        modifier *= self._event_factor(segment, timestamp)
        return max(0.1, min(1.5, modifier))  # clamp
```

### 3.2 Personnel & Human Factors

| Model | Description | Parameters | Impact |
|-------|-------------|------------|--------|
| **Fatigue** | Circadian + shift length + overtime | `fatigue_factor = 1.0 + 0.005 * hours_on_shift + 0.01 * overtime_hours` | Slower reaction, longer interview |
| **Circadian Rhythm** | Time-of-day alertness | Low 03:00-05:00 (1.2x), Peak 10:00-14:00 (0.9x) | Pickup delay, interview quality |
| **Experience** | Tenure + certifications | `competency = min(1.0, 0.5 + 0.05 * years_experience)` | Dispatch accuracy, interview efficiency |
| **Stress/Burnout** | Cumulative high-acuity exposure | `burnout = min(1.0, high_acuity_calls * 0.01)` | Long-term performance degradation |
| **Communication Load** | Radio traffic volume | `channel_load = active_incidents * 0.15` | Dispatcher queue delay |

### 3.3 Cascading Incidents

| Trigger | Secondary Incident Types | Probability | Delay |
|---------|-------------------------|-------------|-------|
| **Structure Fire** | Traffic (rubbernecking), Medical (smoke inhalation), Hazmat | 0.3, 0.15, 0.05 | 2-10 min |
| **Major MVA** | Fire (vehicle fire), Hazmat (fuel), Secondary MVA | 0.2, 0.1, 0.15 | 1-5 min |
| **Active Shooter** | Medical (mass casualty), Fire (arson), Police (perimeter) | 0.4, 0.1, 0.3 | 1-3 min |
| **Hazmat** | Fire, Medical (exposure), Evacuation | 0.25, 0.2, 0.3 | 5-15 min |

**Implementation:**
```python
class CascadingIncidentGenerator:
    def check_cascade(self, primary: Incident, clock: datetime) -> List[Incident]:
        cascades = []
        for trigger_type, config in CASCADE_CONFIG.items():
            if primary.problem_nature in trigger_type:
                for secondary_type, prob, delay_range in config.secondaries:
                    if random.random() < prob:
                        delay = random.uniform(*delay_range)
                        cascades.append(self._create_secondary(
                            primary, secondary_type, clock + timedelta(minutes=delay)
                        ))
        return cascades
```

### 3.4 Multi-Alarm & Mutual Aid

| Alarm Level | Typical Apparatus | Typical Staffing | Mutual Aid Trigger |
|-------------|-------------------|------------------|-------------------|
| **1st Alarm** | 2 Engine, 1 Ladder, 1 BC, 1 Medic | 12-15 | — |
| **2nd Alarm** | +2 Engine, +1 Ladder, +1 BC, +1 Medic | +12-15 | 1st alarm committed |
| **3rd Alarm** | +2 Engine, +1 Ladder, +1 BC, +1 Medic | +12-15 | 2nd alarm committed |
| **4th+ Alarm** | Specialized (Hazmat, USAR, Air) | Varies | Regional request |

**Run Card Structure:**
```yaml
run_card:
  zone: "Fire_Zone_1"
  alarm_levels:
    1:
      - {station: "Stn_1", apparatus: "Engine_1", order: 1}
      - {station: "Stn_1", apparatus: "Medic_1", order: 2}
      - {station: "Stn_2", apparatus: "Engine_1", order: 3}
    2:
      - {station: "Stn_3", apparatus: "Engine_1", order: 1}
      - {station: "Stn_4", apparatus: "Engine_1", order: 2}
    3:
      - {station: "Regional_Hazmat", apparatus: "Hazmat_1", order: 1}
```

### 3.5 NG911 i3 Call Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   CALLER    │────►│   ESRP      │────►│   ECRF      │────►│    PSAP     │
│  (Phone)    │     │ (Emergency  │     │ (Emergency  │     │  (Call      │
│             │     │  Services   │     │  Call       │     │   Taker)    │
│             │     │  Routing    │     │  Routing    │     │             │
│             │     │  Proxy)     │     │  Function)  │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │
       │     SIP INVITE    │     PIDF-LO      │     PIDF-LO      │
       │◄──────────────────┤   (Location)    ◄│    (Route)      │
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │                        CALL-TAKING TIMELINE                         │
  │  Ring → Answer → Interview → Dispatch → Enroute → Arrive → Clear   │
  └─────────────────────────────────────────────────────────────────────┘
```

**Key PIDF-LO Elements:**
```xml
<presence entity="caller@domain">
  <tuple id="emergency">
    <status>
      <gp:geopriv>
        <gp:location-info>
          <gml:Point srsName="urn:ogc:def:crs:EPSG::4326">
            <gml:pos>40.7128 -74.0060</gml:pos>
          </gml:Point>
          <gp:usage-rules/>
          <gp:method>GPS</gp:method>
          <gp:confidence>95</gp:confidence>
        </gp:location-info>
        <gp:civicAddress xml:lang="en-US">
          <civic:country>US</civic:country>
          <civic:A1>NY</civic:A1>
          <civic:A3>New York</civic:A3>
          <civic:RD>Broadway</civic:RD>
          <civic:HNO>123</civic:HNO>
          <civic:LOC>Floor 5, Suite 500</civic:LOC>
        </gp:civicAddress>
      </gp:geopriv>
    </status>
  </tuple>
</presence>
```

---

## Layer 4: OUTCOMES & METRICS

### 4.1 Response Time Metrics

| Metric | Definition | NFPA Target | Measurement |
|--------|------------|-------------|-------------|
| **Pickup Delay** | Ring to answer | 90% ≤ 15s, 95% ≤ 20s | `call_answered - call_received` |
| **Interview Time** | Answer to dispatch-ready | — | `interview_complete - call_answered` |
| **Dispatch Queue** | Interview to first unit assigned | — | `first_unit_assigned - interview_complete` |
| **Turnout Time** | Assign to wheels rolling | 80s (fire), 60s (EMS) | `first_unit_enroute - first_unit_assigned` |
| **Travel Time** | Wheels rolling to on-scene | 240s (fire), 180s (EMS) | `first_unit_arrived - first_unit_enroute` |
| **Total Response** | Call received to first arrival | 360s (fire), 300s (EMS) | `first_unit_arrived - call_received` |
| **On-Scene Time** | Arrive to clear | — | `last_unit_cleared - first_unit_arrived` |

### 4.2 Unit Utilization Metrics

| Metric | Formula | Target | Use Case |
|--------|---------|--------|----------|
| **UHU (Unit Hour Utilization)** | `total_committed_time / shift_hours` | 0.3-0.4 (fire), 0.4-0.5 (EMS) | Unit workload |
| **Calls per Unit per Shift** | `incidents_assigned / shifts_worked` | Varies by agency | Workload equity |
| **High-Acuity Exposure** | `priority_1_2_calls / total_calls` | — | Burnout risk |
| **Simultaneous Calls** | `max(concurrent_incidents_in_zone)` | — | Coverage gaps |

### 4.3 Coverage & Equity Metrics

| Metric | Definition | Equity Lens |
|--------|------------|-------------|
| **Fractile Compliance** | % incidents within target time | By zone, demographic quintile |
| **Coverage Gap Area** | Sq km with response > target | Underserved areas |
| **Response Time by Quintile** | Median response by pop quintile | Environmental justice |
| **Simultaneous Call Failure** | Incidents with no available unit | Resource adequacy |
| **Mutual Aid Dependency** | % incidents needing mutual aid | Regional resilience |

### 4.4 Cost-Benefit Metrics

| Metric | Formula | Decision Support |
|--------|---------|------------------|
| **Cost per Incident** | `total_operating_cost / incidents` | Budget efficiency |
| **Cost per Second Saved** | `Δcost / Δresponse_time` | Marginal investment value |
| **FTE per 1000 Population** | `total_FTE / (population/1000)` | Staffing adequacy |
| **Overtime Rate** | `overtime_hours / total_hours` | Burnout indicator |
| **Marginal Benefit Curve** | `Δoutcome / ΔFTE` per added unit | Optimal staffing level |

---

## Implementation Recommendations by Layer

### Priority 1: Core Simulation Engine (Weeks 3-6)
```python
# Minimal viable engine
class MinimumViableEngine:
    def __init__(self, geography, staffing, incidents):
        self.geography = geography
        self.staffing = staffing
        self.incidents = sorted(incidents, key=lambda i: i.call_start_time)
        self.units = self._initialize_units()
        self.clock = SimulationClock()
        self.event_queue = []
        
    def run(self):
        while self.incidents or self.event_queue:
            self._inject_incidents()
            if not self.event_queue:
                self._advance_to_next_incident()
                continue
            event = heappop(self.event_queue)
            self.clock.advance(event.timestamp)
            self._handle_event(event)
```

### Priority 2: Staffing Scenario Framework (Weeks 7-10)
```yaml
# Config-driven, versioned, comparable
scenario:
  name: "Add_Medic_Stn2"
  inherits: "baseline"
  changes:
    Station_2:
      apparatus:
        - type: "Medic"
          count: 1
          cross_staffed_with: "Engine_2"
```

### Priority 3: Experiment Framework (Weeks 11-14)
```python
# Controlled experiments with identical volumes
experiment:
  fixed:
    town: "town_v1.gpkg"
    incidents: "incidents_50k.parquet"
    seed: 4242
  scenarios:
    - name: "Baseline"
      staffing: "baseline.yaml"
    - name: "Add_Medic"
      staffing: "add_medic.yaml"
  replications: 30
  analysis:
    paired_test: true
    confidence: 0.95
```

---

## Code Organization

```
psap_research/
├── psap_research/
│   ├── __init__.py
│   ├── config/
│   │   ├── loader.py
│   │   ├── schemas.py
│   │   └── validators.py
│   ├── integration/
│   │   ├── geography_provider.py
│   │   ├── synthgis_loader.py
│   │   ├── synthccd_loader.py
│   │   └── adapter.py
│   ├── simulation_engine/
│   │   ├── core.py
│   │   ├── events.py
│   │   ├── units.py
│   │   ├── personnel.py
│   │   ├── dispatch.py
│   │   ├── routing.py
│   │   ├── clock.py
│   │   └── metrics.py
│   ├── staffing_scenarios/
│   │   ├── base.py
│   │   ├── loader.py
│   │   ├── registry.py
│   │   └── dynamic.py
│   ├── experiments/
│   │   ├── runner.py
│   │   ├── comparison.py
│   │   ├── statistics.py
│   │   └── visualization.py
│   ├── operations_layers/
│   │   ├── traffic.py
│   │   ├── personnel.py
│   │   ├── cascading.py
│   │   ├── multialarm.py
│   │   └── ng911.py
│   ├── metrics/
│   │   ├── collector.py
│   │   ├── hourly.py
│   │   ├── equity.py
│   │   └── cost_benefit.py
│   ├── experiments/
│   │   ├── runner.py
│   │   ├── comparison.py
│   │   └── statistics.py
│   ├── data_models/
│   │   ├── incident.py
│   │   ├── units.py
│   │   ├── personnel.py
│   │   └── geography.py
│   └── utils/
│       ├── logging.py
│       ├── seeding.py
│       └── exporters.py
├── config/
│   ├── town_spec.yaml
│   ├── realism_config.yaml
│   ├── staffing_scenarios/
│   ├── experiments/
│   └── staffing_templates/
├── CODE_SKELETON/          # Reference implementations
├── TESTS/
├── NOTEBOOKS/
└── DATA/
```

---

## Pros/Cons Summary Table

| Layer | Component | Pros | Cons | Recommendation |
|-------|-----------|------|------|----------------|
| **Geography** | SynthGIS GPKG | NENA-native, deterministic, offline | Requires SynthGIS first | **Primary** |
| **Geography** | OSM/Overpass | Real-world, free | Non-deterministic, network, no CLDXF | **Deprecate** |
| **Workload** | SynthCCD + SynthGIS | Population-weighted, NENA | Requires integration | **Primary** |
| **Simulation** | Discrete event | Realistic parallel timeline | Complex implementation | **Build in-house** |
| **Routing** | NetworkX + SynthGIS | Travel-time weights, pgRouting | Static without Phase 4 | **Extend with dynamic** |
| **Dispatch** | Run-card-driven | Policy-compliant | Inflexible for research | **Hybrid: run-card + optimizer** |
| **Staffing** | Config-driven YAML | Versioned, comparable | Static without dynamic | **Add dynamic interface** |
| **Experiments** | Controlled, paired | Statistical rigor | Compute-intensive | **Parallel + cloud** |
| **Metrics** | Comprehensive | NFPA/NENA aligned | Many metrics = noise | **Focus on key fractiles** |
| **Traffic** | Dynamic model | Realistic travel times | Complex calibration | **Phase 4** |
| **Personnel** | Fatigue/experience | Human factors | Hard to calibrate | **Phase 4** |
| **Cascading** | Realistic secondary | Workload realism | Parameter uncertainty | **Phase 4** |
| **NG911** | Standards compliance | Interoperability | Complex protocol | **Phase 4 optional** |

---

## Decision Matrix for Implementation Order

| Priority | Component | Effort | Impact | Dependencies | Order |
|----------|-----------|--------|--------|--------------|-------|
| **P0** | SynthGIS→SynthCCD bridge | Medium | Critical | Phase 0 complete | 1 |
| **P0** | Simulation engine core | High | Critical | Bridge done | 2 |
| **P0** | Staffing scenario framework | Medium | High | Engine core | 3 |
| **P0** | Experiment runner + stats | Medium | High | Staffing framework | 4 |
| **P1** | Dynamic traffic model | High | High | Engine core | 5 |
| **P1** | Personnel fatigue model | Medium | Medium | Staffing framework | 6 |
| **P1** | Cascading incidents | High | Medium | Engine core | 7 |
| **P1** | Multi-alarm/mutual aid | Medium | High | Dispatch logic | 8 |
| **P2** | NG911 i3 call flow | High | Standards | Phase 0 | 9 |
| **P2** | Equity analysis framework | Medium | Research | Metrics collector | 10 |
| **P2** | ML dynamic staffing | High | Future | Staffing + experiments | 11 |

---

*This catalog is a living document. Update as components are implemented and validated.*