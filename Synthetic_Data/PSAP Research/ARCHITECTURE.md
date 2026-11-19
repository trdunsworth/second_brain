# PSAP Research — System Architecture

> **Complete system architecture for the PSAP Research simulation ecosystem**

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              PSAP RESEARCH ECOSYSTEM                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                │
│  │   SYNTHGIS      │    │   SYNTHCCD      │    │  PSAP RESEARCH  │                │
│  │  (Geography)    │    │  (Workloads)    │    │  (Simulation)   │                │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘                │
│           │                      │                      │                          │
│           ▼                      ▼                      ▼                          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │                        DATA EXCHANGE LAYER                                  │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │  │
│  │  │ GeoPackage   │ │ Parquet/CSV  │ │ Pickle/JSON  │ │ YAML Config  │      │  │
│  │  │ (Geography)  │ │ (Workloads)  │ │ (Graph/State)│ │ (Scenarios)  │      │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘      │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                    │                                              │
└────────────────────────────────────┼──────────────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        SIMULATION ENGINE CORE                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │   Event      │ │   Unit       │ │  Incident    │ │   Dispatch   │             │
│  │  Queue       │ │  Registry    │ │  Manager     │ │  Logic       │             │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘             │
│        │                │                │                │                        │
│        ▼                ▼                ▼                ▼                        │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │                         OPERATIONS LAYERS                                    │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │  │
│  │  │   Traffic   │ │  Personnel  │ │  Cascading  │ │   NG911     │            │  │
│  │  │  Model      │ │  Fatigue    │ │  Incidents  │ │  Call Flow  │            │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                    │                                              │
│                                    ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │                        METRICS & OUTCOMES LAYER                             │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │  │
│  │  │  Response   │ │  Utilization│ │   Equity    │ │   Cost/     │            │  │
│  │  │  Times      │ │  / UHU      │ │  Analysis   │ │  Cost-Benefit│           │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Architecture

### 1. Geography Generation (SynthGIS)
```
town_spec.yaml
      │
      ▼
SynthGIS Generator (seed-locked)
      │
      ├─► RoadCenterLine (CLDXF ranges)
      ├─► SiteStructureAddressPoint (full sub-address)
      ├─► PsapPolygon, FirePolygon, PolicePolygon, EmsPolygon
      ├─► FireStationPoint, PoliceStationPoint, EmsStationPoint
      ├─► FireZonePolygon, PoliceZonePolygon, EmsZonePolygon
      ├─► FireRunCard, PoliceRunCard, EmsRunCard
      ├─► Routing Graph (NetworkX MultiDiGraph)
      ├─► Population Surface (parcel/building level)
      └─► Building3D (if --3d)
            │
            ▼
      town.gpkg + graph.pkl
```

### 2. Workload Generation (SynthCCD)
```
realism_config.yaml + town.gpkg + graph.pkl
      │
      ▼
SynthCCD Generator
      │
      ├─► SynthGISAddressProvider (loads GPKG)
      ├─► Address Pool (streets + points + boundaries)
      ├─► Population-weighted address selection
      ├─► Incident Generation (agency, priority, problem)
      ├─► Timestamp Generation (parallel dispatch)
      ├─► Personnel Assignment (shift-aware)
      └─► Phone Metrics (hourly volumes)
            │
            ▼
      incidents.parquet + phone_metrics.parquet + manifest.json
```

### 3. Simulation Execution (PSAP Research)
```
incidents.parquet + town.gpkg + graph.pkl + staffing.yaml
      │
      ▼
SimulationEngine
      │
      ├─► Load geography, routing graph, staffing
      ├─► Load incidents → IncidentQueue (sorted by call_start_time)
      ├─► Initialize UnitRegistry (units + state machines)
      ├─► Initialize PersonnelPools (calltakers, dispatchers per shift)
      └─► Clock = date_range.start
            │
            ▼
      Event Loop (discrete event simulation):
      while clock < date_range.end:
          # 1. Inject new incidents whose call_start_time == clock
          inject_new_incidents()
          
          # 2. Process call-taking events (ring, answer, interview)
          process_call_taking_events()
          
          # 3. Process dispatch events (parallel with call-taking)
          process_dispatch_events()
          
          # 4. Process unit movement (enroute → arrived)
          process_unit_movement()
          
          # 5. Process scene/clear events
          process_scene_events()
          
          # 6. Advance clock to next event timestamp
          clock = next_event_timestamp()
          
          # 7. Collect metrics at hour boundaries
          if hour_boundary: collect_hourly_metrics()
```

---

## Core Component Interfaces

### 1. Geography Provider Interface

```python
# psap_research/integration/geography_provider.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional, List
from shapely.geometry import Point, Polygon

@dataclass
class ServiceBoundaries:
    psap: Optional[str]
    fire_zone: Optional[str]
    police_zone: Optional[str]
    ems_zone: Optional[str]
    provisioning: Optional[str]

@dataclass
class SynthGISAddress:
    # Core address
    street_address: str
    latitude: float
    longitude: float
    
    # NENA/CLDXF components
    add_num: int
    add_num_suf: Optional[str]
    street_name: str
    street_type: str
    pre_dir: Optional[str]
    post_dir: Optional[str]
    
    # Sub-address
    building: Optional[str]
    floor: Optional[str]
    unit: Optional[str]
    room: Optional[str]
    seat: Optional[str]
    place_type: str  # S, ST, B, U
    placement: str   # CEN, ENT, STR, PAR
    
    # Service context
    service_boundaries: ServiceBoundaries
    nearest_stations: dict[str, str]  # agency -> station_id
    population_weight: float  # for spatial weighting

@dataclass
class StreetSegment:
    segment_id: str
    geometry: LineString
    street_name: str
    street_type: str
    pre_dir: Optional[str]
    post_dir: Optional[str]
    from_addr_l: int
    to_addr_l: int
    from_addr_r: int
    to_addr_r: int
    parity_l: str  # E, O, B, Z
    parity_r: str

class GeographyProvider(ABC):
    """Abstract interface for geography providers."""
    
    @abstractmethod
    def get_address_pool(self) -> List[SynthGISAddress]:
        """Return all available addresses for incident placement."""
        pass
    
    @abstractmethod
    def get_street_segments(self) -> List[StreetSegment]:
        """Return street segments with CLDXF address ranges."""
        pass
    
    @abstractmethod
    def find_service_boundary(self, point: Point, service: str) -> Optional[str]:
        """Find which service boundary contains a point."""
        pass
    
    @abstractmethod
    def find_nearest_station(self, point: Point, agency: str) -> Optional[Station]:
        """Find nearest station for an agency."""
        pass
    
    @abstractmethod
    def get_population_weight(self, point: Point, hour: int) -> float:
        """Get population weight for spatial/temporal weighting."""
        pass
    
    @abstractmethod
    def get_routing_graph(self) -> nx.MultiDiGraph:
        """Return NetworkX routing graph with travel-time weights."""
        pass
    
    @abstractmethod
    def get_run_cards(self, agency: str) -> RunCardSet:
        """Get run cards for an agency."""
        pass
```

### 2. Simulation Engine Interface

```python
# psap_research/simulation_engine/core.py
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, List, Dict
from datetime import datetime
from heapq import heappush, heappop

class EventType(Enum):
    # Call-taking events
    CALL_RECEIVED = "call_received"
    CALL_ANSWERED = "call_answered"
    INTERVIEW_COMPLETE = "interview_complete"
    
    # Dispatch events (parallel timeline)
    DISPATCH_INITIATED = "dispatch_initiated"
    UNIT_ASSIGNED = "unit_assigned"
    UNIT_ENROUTE = "unit_enroute"
    UNIT_ARRIVED = "unit_arrived"
    
    # Scene events
    UNIT_CLEARED = "unit_cleared"
    INCIDENT_CLOSED = "incident_closed"
    
    # Unit state changes
    UNIT_STATUS_CHANGE = "unit_status_change"
    UNIT_OUT_OF_SERVICE = "unit_out_of_service"
    UNIT_BACK_IN_SERVICE = "unit_back_in_service"

@dataclass
class SimulationEvent:
    timestamp: datetime
    event_type: EventType
    incident_id: str
    unit_id: Optional[str] = None
    payload: dict = field(default_factory=dict)
    
    def __lt__(self, other):
        return self.timestamp < other.timestamp

class UnitState(Enum):
    AVAILABLE = "available"
    DISPATCHED = "dispatched"
    ENROUTE = "enroute"
    ON_SCENE = "on_scene"
    CLEARING = "clearing"
    OUT_OF_SERVICE = "out_of_service"

@dataclass
class UnitStateMachine:
    current_state: UnitState
    valid_transitions = {
        UnitState.AVAILABLE: [UnitState.DISPATCHED, UnitState.OUT_OF_SERVICE],
        UnitState.DISPATCHED: [UnitState.ENROUTE, UnitState.AVAILABLE],
        UnitState.ENROUTE: [UnitState.ON_SCENE, UnitState.AVAILABLE],
        UnitState.ON_SCENE: [UnitState.CLEARING, UnitState.ENROUTE],
        UnitState.CLEARING: [UnitState.AVAILABLE],
        UnitState.OUT_OF_SERVICE: [UnitState.AVAILABLE],
    }
    
    def can_transition(self, new_state: UnitState) -> bool:
        return new_state in self.valid_transitions[self.current_state]
    
    def transition(self, new_state: UnitState) -> bool:
        if self.can_transition(new_state):
            self.current_state = new_state
            return True
        return False

@dataclass
class ApparatusType:
    code: str
    label: str
    capabilities: set[str]
    default_speed_mph: float
    response_mode_speeds: dict  # Code3, Code2, Routine

@dataclass
class Unit:
    unit_id: str
    apparatus_type: ApparatusType
    station_id: str
    shift_id: str
    personnel: List[Personnel]
    state_machine: UnitStateMachine
    location: Point  # current GPS
    assigned_incident: Optional[str] = None
    fatigue_factor: float = 1.0
    total_shift_hours: float = 0.0

class DispatchSimulationEngine:
    """Main simulation engine."""
    
    def __init__(
        self,
        geography: GeographyProvider,
        staffing: StaffingConfig,
        router: Router,
        clock: SimulationClock,
        metrics: MetricsCollector,
        config: EngineConfig
    ):
        self.geography = geography
        self.staffing = staffing
        self.router = router
        self.clock = clock
        self.metrics = metrics
        self.config = config
        
        # Core state
        self.event_queue: List[SimulationEvent] = []
        self.units: Dict[str, Unit] = {}
        self.incidents: Dict[str, Incident] = {}
        self.incident_queue: List[Incident] = []  # sorted by call_start_time
        self.personnel_pools: Dict[str, PersonnelPool] = {}
        
        # Runtime state
        self.current_incident_idx = 0
        self.running = False
    
    def load_geography(self, geography: GeographyProvider):
        """Load geography and initialize router."""
        self.geography = geography
        self.router = Router(geography.get_routing_graph(), geography.get_stations())
    
    def load_staffing(self, staffing: StaffingConfig):
        """Load staffing config and initialize units/personnel."""
        self.staffing = staffing
        self._initialize_units()
        self._initialize_personnel_pools()
    
    def load_incidents(self, incidents: List[Incident]):
        """Load incidents sorted by call_start_time."""
        self.incident_queue = sorted(incidents, key=lambda i: i.call_start_time)
        self.current_incident_idx = 0
    
    def step(self) -> bool:
        """Process next event. Returns True if simulation continues."""
        if not self.running:
            return False
        
        # Inject new incidents whose start time has arrived
        self._inject_new_incidents()
        
        # Process next event
        if not self.event_queue:
            # No events, advance to next incident start time
            if self.current_incident_idx < len(self.incident_queue):
                next_incident = self.incident_queue[self.current_incident_idx]
                self.clock.advance_to(next_incident.call_start_time)
                continue
            else:
                return False  # No more incidents
        
        event = heappop(self.event_queue)
        self.clock.advance_to(event.timestamp)
        
        # Dispatch to handler
        handler = getattr(self, f"_handle_{event.event_type.value}", None)
        if handler:
            handler(event)
        
        return True
    
    def run(self) -> SimulationResults:
        """Run simulation to completion."""
        self.running = True
        self.clock.reset()
        
        while self.step():
            # Collect hourly metrics
            if self.clock.at_hour_boundary():
                self.metrics.collect_hourly(self.clock.current_time, self._get_current_state())
        
        self.running = False
        return self.metrics.finalize()
    
    def _inject_new_incidents(self):
        """Inject incidents whose start time <= current clock."""
        while (self.current_incident_idx < len(self.incident_queue) and 
               self.incident_queue[self.current_incident_idx].call_start_time <= self.clock.current_time):
            incident = self.incident_queue[self.current_incident_idx]
            self.incidents[incident.incident_id] = incident
            self.current_incident_idx += 1
            
            # Schedule CALL_RECEIVED event
            heappush(self.event_queue, SimulationEvent(
                timestamp=incident.call_start_time,
                event_type=EventType.CALL_RECEIVED,
                incident_id=incident.incident_id
            ))
    
    def _handle_call_received(self, event: SimulationEvent):
        """Handle incoming call - start call-taking timeline."""
        incident = self.incidents[event.incident_id]
        
        # Assign calltaker
        calltaker = self.personnel_pools['calltakers'].get_next(incident.shift)
        incident.calltaker = calltaker
        
        # Schedule CALL_ANSWERED (pickup delay)
        pickup_delay = self._sample_pickup_delay(incident)
        heappush(self.event_queue, SimulationEvent(
            timestamp=self.clock.current_time + timedelta(seconds=pickup_delay),
            event_type=EventType.CALL_ANSWERED,
            incident_id=event.incident_id
        ))
        
        # Schedule DISPATCH_INITIATED based on dispatch_init_fraction
        phone_duration = self._sample_phone_duration(incident)
        dispatch_fraction = self.config.dispatch_init_fraction[incident.priority]
        dispatch_delay = phone_duration * dispatch_fraction
        heappush(self.event_queue, SimulationEvent(
            timestamp=self.clock.current_time + timedelta(seconds=dispatch_delay),
            event_type=EventType.DISPATCH_INITIATED,
            incident_id=event.incident_id
        ))
    
    def _handle_dispatch_initiated(self, event: SimulationEvent):
        """Start dispatch process - parallel with call-taking."""
        incident = self.incidents[event.incident_id]
        
        # Get dispatch plan from run cards
        dispatch_plan = self.router.get_dispatch_plan(
            incident.location, incident.agency
        )
        
        # Assign units per run card
        for assignment in dispatch_plan.assignments:
            unit = self._find_available_unit(assignment)
            if unit:
                self._assign_unit(unit, incident, assignment)
    
    def _assign_unit(self, unit: Unit, incident: Incident, assignment: Assignment):
        """Assign unit to incident."""
        unit.state_machine.transition(UnitState.DISPATCHED)
        unit.assigned_incident = incident.incident_id
        incident.assigned_units.append(unit.unit_id)
        
        # Calculate travel time via router
        travel_time = self.router.get_travel_time(
            unit.station_id, incident.location
        )
        turnout_time = self._sample_turnout_time(unit, incident)
        
        # Schedule ENROUTE
        heappush(self.event_queue, SimulationEvent(
            timestamp=self.clock.current_time + timedelta(seconds=turnout_time),
            event_type=EventType.UNIT_ENROUTE,
            incident_id=incident.incident_id,
            unit_id=unit.unit_id,
            payload={'travel_time': travel_time}
        ))
        
        # Schedule ARRIVED
        heappush(self.event_queue, SimulationEvent(
            timestamp=self.clock.current_time + timedelta(seconds=turnout_time + travel_time),
            event_type=EventType.UNIT_ARRIVED,
            incident_id=incident.incident_id,
            unit_id=unit.unit_id
        ))
```

---

## Data Models

### Incident Data Model (extends SynthCCD)

```python
# psap_research/data_models/incident.py
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List
from enum import Enum

class Agency(Enum):
    LAW = "LAW"
    FIRE = "FIRE"
    EMS = "EMS"

class Priority(Enum):
    CRITICAL = 1
    HIGH = 2
    MEDIUM = 3
    LOW = 4
    NON_EMERGENCY = 5

@dataclass
class IncidentTimestamps:
    """Parallel timeline timestamps."""
    call_received: datetime
    call_answered: Optional[datetime] = None
    interview_complete: Optional[datetime] = None
    dispatch_initiated: Optional[datetime] = None
    first_unit_assigned: Optional[datetime] = None
    first_unit_enroute: Optional[datetime] = None
    first_unit_arrived: Optional[datetime] = None
    last_unit_cleared: Optional[datetime] = None
    incident_closed: Optional[datetime] = None

@dataclass
class ServiceBoundaries:
    psap: str
    fire_zone: str
    police_zone: str
    ems_zone: str
    provisioning: str

@dataclass
class Incident:
    incident_id: str
    internal_ref: str  # per-agency reference
    agency: Agency
    priority: Priority
    problem_nature: str
    
    # Address (CLDXF)
    prefix_directional: Optional[str]
    street_number: int
    street_name: str
    street_type: str
    postfix_directional: Optional[str]
    city: str
    state: str
    postal_code: str
    location_name: Optional[str]  # business/landmark
    
    # Sub-address
    building: Optional[str] = None
    floor: Optional[str] = None
    unit: Optional[str] = None
    room: Optional[str] = None
    seat: Optional[str] = None
    
    # Location
    latitude: float
    longitude: float
    
    # Service boundaries
    service_boundaries: ServiceBoundaries
    
    # Timestamps
    timestamps: IncidentTimestamps
    
    # Personnel
    calltaker: Optional[str] = None
    dispatcher: Optional[str] = None
    
    # Call metadata
    call_reception: str  # E-911, Phone, Radio, etc.
    disposition: str  # NR, RE, CN, etc.
    
    # Assigned units
    assigned_units: List[str] = field(default_factory=list)
    
    # Calculated fields
    elapsed_seconds: dict = field(default_factory=dict)
    
    # Metadata
    address_source: str = "synthgis"  # or "osm"
    shift_id: str
    date: datetime.date
    hour: int
```

### Unit & Personnel Models

```python
# psap_research/data_models/units.py
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Set
from shapely.geometry import Point

class ApparatusTypeCode(Enum):
    ENGINE = "Engine"
    LADDER = "Ladder"
    MEDIC = "Medic"
    TANKER = "Tanker"
    BRUSH = "Brush"
    RESCUE = "Rescue"
    BATTALION_CHIEF = "BattalionChief"
    SQUAD = "Squad"
    TENDER = "Tender"
    QUINT = "Quint"

@dataclass
class ApparatusType:
    code: ApparatusTypeCode
    label: str
    capabilities: Set[str] = field(default_factory=set)
    default_speed_mph: float = 35.0
    response_mode_speeds: dict = field(default_factory=lambda: {
        "CODE3": 1.0,   # Lights & siren
        "CODE2": 0.7,   # No lights/siren
        "ROUTINE": 0.5  # Normal traffic
    })
    requires_personnel: int = 3
    cross_staffable_with: List[str] = field(default_factory=list)

@dataclass
class Personnel:
    personnel_id: str
    name: str
    role: str  # CALLTAKER, DISPATCHER_LAW, DISPATCHER_FIRE, DISPATCHER_EMS
    shift_id: str
    station_id: Optional[str] = None
    experience_years: float = 0.0
    certifications: Set[str] = field(default_factory=set)
    fatigue_factor: float = 1.0
    total_shift_hours: float = 0.0
    zipf_weight: float = 1.0  # for workload distribution

@dataclass
class Shift:
    shift_id: str
    label: str  # DAY, NIGHT, SWING
    start_hour: int
    start_minute: int
    end_hour: int
    end_minute: int
    rotation_group: int
    calltaker_count: int
    dispatcher_count: int
    dispatcher_disciplines: dict  # LAW: 2, FIRE: 1, EMS: 1
```

### Routing Models

```python
# psap_research/simulation_engine/routing.py
from dataclasses import dataclass
from typing import Optional, List, Dict
import networkx as nx
from shapely.geometry import Point

@dataclass
class Station:
    station_id: str
    name: str
    station_num: str
    location: Point
    apparatus: List[str]  # unit_ids housed here
    agencies: List[str]  # FIRE, EMS, POLICE

@dataclass
class DispatchPlan:
    zone: str
    station_assignments: List[Dict]  # [{station_id, apparatus, alarm_level, order}]

@dataclass
class TravelTimeResult:
    travel_time_seconds: float
    distance_meters: float
    path: List[Point]
    route_geometry: LineString

class SynthGISRouter:
    """Router using SynthGIS NetworkX graph with travel-time weights."""
    
    def __init__(
        self,
        graph: nx.MultiDiGraph,
        stations: Dict[str, Station],
        run_cards: Dict[str, RunCardSet]
    ):
        self.graph = graph
        self.stations = stations
        self.run_cards = run_cards
        self._build_station_index()
    
    def get_travel_time(
        self,
        station_id: str,
        destination: Point,
        response_mode: str = "CODE3"
    ) -> float:
        """Get travel time from station to destination using routing graph."""
        station_node = self._nearest_node(self.stations[station_id].location)
        dest_node = self._nearest_node(destination)
        
        try:
            return nx.shortest_path_length(
                self.graph, station_node, dest_node, weight="travel_time"
            )
        except nx.NetworkXNoPath:
            # Fallback: straight-line distance / average speed
            return self._estimate_travel_time(
                self.stations[station_id].location, destination
            )
    
    def get_turnout_time(
        self,
        address: Point,
        agency: str,
        unit_type: str
    ) -> float:
        """Get turnout time (station to wheels rolling) for nearest station."""
        station = self.find_nearest_station(address, agency)
        # Base turnout by agency/type with variance
        base_turnout = {
            'FIRE': {'Engine': 90, 'Ladder': 100, 'Rescue': 80},
            'EMS': {'Medic': 45, 'Rescue': 60},
            'LAW': {'Patrol': 30, 'Supervisor': 45}
        }
        base = base_turnout.get(agency, {}).get(unit_type, 60)
        return base * random.uniform(0.8, 1.3)
    
    def find_nearest_station(self, point: Point, agency: str) -> Station:
        """Find nearest station by straight-line distance."""
        min_dist = float('inf')
        nearest = None
        for station in self.stations.values():
            if agency in station.agencies:
                dist = point.distance(station.location)
                if dist < min_dist:
                    min_dist = dist
                    nearest = station
        return nearest
    
    def get_dispatch_plan(
        self,
        incident_location: Point,
        agency: str
    ) -> DispatchPlan:
        """Get full dispatch plan using run cards."""
        zone = self._find_zone(incident_location, agency)
        run_card = self.run_cards[agency].get_zone_plan(zone)
        
        assignments = []
        for alarm_level, apparatus_list in run_card.items():
            for apparatus in apparatus_list:
                station = self._find_station_for_apparatus(apparatus, agency)
                travel = self.get_travel_time(station.station_id, incident_location)
                turnout = self.get_turnout_time(incident_location, agency, apparatus)
                
                assignments.append({
                    'station_id': station.station_id,
                    'station_name': station.name,
                    'apparatus': apparatus,
                    'alarm_level': alarm_level,
                    'turnout_seconds': turnout,
                    'travel_seconds': travel,
                    'total_response_seconds': turnout + travel,
                })
        
        return DispatchPlan(zone=zone, station_assignments=assignments)
```

---

## Configuration System

### Unified Configuration Hierarchy

```
config/
├── town_spec.yaml              # SynthGIS town specification
├── realism_config.yaml         # SynthCCD realism parameters
├── staffing_scenarios/
│   ├── baseline.yaml
│   ├── add_medic_stn2.yaml
│   ├── peak_overlay.yaml
│   ├── dynamic_ml.yaml
│   └── cross_staffing_variants.yaml
├── experiments/
│   ├── staffing_comparison_001.yaml
│   ├── station_closure_equity.yaml
│   ├── peak_staffing_comparison.yaml
│   └── dynamic_vs_fixed.yaml
├── staffing_templates/
│   ├── base_template.yaml
│   ├── urban_template.yaml
│   ├── rural_template.yaml
│   └── metro_template.yaml
└── realism_overrides/
    ├── kc_mo.yaml
    ├── nyc.yaml
    ├── dc.yaml
    └── rural_vt.yaml
```

### Configuration Loading Pattern

```python
# psap_research/config/loader.py
from dataclasses import dataclass
from pathlib import Path
from typing import Optional
from pydantic import BaseModel
from pydantic_yaml import parse_yaml_file_as

@dataclass
class ExperimentConfig:
    experiment: ExperimentSpec
    fixed: FixedConfig
    scenarios: List[ScenarioSpec]
    replications: int
    parallel_jobs: int
    output_dir: str
    metrics: List[str]
    analysis: AnalysisSpec

def load_experiment_config(path: Path) -> ExperimentConfig:
    """Load and validate experiment configuration."""
    return parse_yaml_file_as(ExperimentConfig, path)

def load_staffing_scenario(path: Path) -> StaffingConfig:
    """Load and validate staffing scenario."""
    return parse_yaml_file_as(StaffingConfig, path)

def load_town_spec(path: Path) -> TownSpec:
    """Load SynthGIS town specification."""
    return parse_yaml_file_as(TownSpec, path)

def load_realism_config(path: Optional[Path] = None) -> RealismConfig:
    """Load SynthCCD realism config."""
    if path:
        return parse_yaml_file_as(RealismConfig, path)
    return RealismConfig()  # defaults
```

---

## Metrics & Output Schema

### Hourly Metrics (per hour of simulation)

```python
# psap_research/metrics/hourly.py
from dataclasses import dataclass
from typing import Dict, List, Optional

@dataclass
class HourlyMetrics:
    hour_start: datetime
    hour_end: datetime
    
    # Volume
    incidents_created: int
    incidents_dispatched: int
    incidents_completed: int
    
    # By agency
    incidents_by_agency: Dict[str, int]
    incidents_by_priority: Dict[int, int]
    incidents_by_problem: Dict[str, int]
    
    # Response times (seconds)
    response_times: Dict[str, List[float]]  # key: "priority_1", "priority_2", etc.
    response_time_fractiles: Dict[str, Dict[int, float]]  # priority -> {p50, p90, p95}
    
    # Unit utilization
    unit_hour_utilization: Dict[str, float]  # unit_id -> UHU
    unit_calls: Dict[str, int]
    unit_high_acuity_calls: Dict[str, int]
    
    # Coverage
    uncovered_incidents: int
    simultaneous_incidents_peak: int
    coverage_gap_area_sqkm: float
    
    # Phone metrics (if applicable)
    nine_one_one_received: int
    nine_one_one_abandoned: int
    nine_one_one_answered_10s_pct: float
    nine_one_one_answered_15s_pct: float
    non_emergency_received: int
    non_emergency_abandoned: int
    outbound_placed: int
    
    # Cost
    fte_cost: float
    overtime_hours: float
    cost_per_incident: float
    
    # Equity
    response_time_by_demographic_quintile: Dict[int, Dict[int, float]]  # quintile -> priority -> median

@dataclass
class SimulationResults:
    hourly_metrics: List[HourlyMetrics]
    incident_details: List[IncidentDetail]  # per-incident breakdown
    summary: SimulationSummary
    
@dataclass
class SimulationSummary:
    total_incidents: int
    total_hours: int
    date_range: tuple
    scenarios_tested: List[str]
    replications_per_scenario: int
    random_seed: int
```

---

## Experiment Output Structure

```
DATA/experiment_results/
├── staffing_comparison_001/
│   ├── manifest.json                    # Experiment manifest
│   ├── config.yaml                      # Full resolved config
│   ├── scenarios/
│   │   ├── Baseline/
│   │   │   ├── replication_001.parquet
│   │   │   ├── replication_002.parquet
│   │   │   └── ...
│   │   ├── Add_Medic_Stn2/
│   │   │   └── ...
│   │   └── ...
│   ├── comparison_report.html           # Interactive HTML report
│   ├── comparison_report.json           # Structured comparison
│   ├── fractile_curves.html             # Fractile comparison charts
│   ├── equity_heatmaps.html             # Equity analysis
│   ├── cost_benefit_curve.html          # Cost-benefit visualization
│   └── statistical_summary.json         # Paired t-tests, effect sizes
```

### Comparison Report Schema

```json
{
  "experiment": "staffing_comparison_001",
  "date": "2026-01-15T10:30:00Z",
  "scenarios": ["Baseline", "Add_Medic_Stn2", "Peak_Overlay"],
  "replications": 30,
  "paired": true,
  "metrics_comparison": {
    "p90_response_time_priority_1": {
      "Baseline": {"mean": 485.2, "std": 42.1, "median": 478.0},
      "Add_Medic_Stn2": {"mean": 421.3, "std": 38.7, "median": 415.0},
      "difference": {"mean": -63.9, "pct_change": -13.2},
      "paired_t_test": {"t_stat": -8.42, "p_value": 1.2e-9, "ci_95": [-78.3, -49.5]},
      "effect_size": {"cohens_d": -1.54, "interpretation": "large"}
    },
    "unit_hour_utilization_median_1": {
      "Baseline": {"mean": 0.42, "std": 0.05},
      "Add_Medic_Stn2": {"mean": 0.31, "std": 0.04},
      "difference": {"mean": -0.11, "pct_change": -26.2}
    }
  },
  "equity_analysis": {
    "response_time_by_quintile": {
      "Baseline": {1: 485, 2: 490, 3: 510, 4: 545, 5: 580},
      "Add_Medic_Stn2": {1: 420, 2: 425, 3: 440, 4: 470, 5: 500}
    },
    "max_disparity_reduction_pct": 14.2
  },
  "cost_benefit": {
    "additional_fte_cost": 120000,
    "response_time_improvement_pct": 13.2,
    "cost_per_second_saved": 1875
  }
}
```

---

## Testing Strategy

### Unit Test Structure

```
TESTS/
├── test_simulation_core.py
│   ├── test_event_queue_ordering
│   ├── test_unit_state_machine_transitions
│   ├── test_incident_lifecycle
│   ├── test_parallel_dispatch_timeline
│   └── test_unit_assignment_logic
├── test_staffing_scenarios.py
│   ├── test_scenario_loading
│   ├── test_cross_staffing_rules
│   ├── test_minimum_manning
│   ├── test_fatigue_model
│   └── test_dynamic_staffing_interface
├── test_routing.py
│   ├── test_travel_time_calculation
│   ├── test_turnout_time
│   ├── test_dispatch_plan_generation
│   └── test_fallback_straight_line
├── test_experiment_runner.py
│   ├── test_replication_independence
│   ├── test_paired_statistics
│   ├── test_parallel_execution
│   └── test_results_serialization
├── test_integration.py
│   ├── test_synthgis_to_synthccd
│   ├── test_synthccd_to_simulation
│   ├── test_full_pipeline_1000_incidents
│   └── test_regression_baseline
└── fixtures/
    ├── test_town.gpkg
    ├── test_incidents.parquet
    ├── baseline_staffing.yaml
    └── test_routing_graph.pkl
```

### Regression Testing

```python
# tests/test_regression.py
def test_regression_baseline():
    """Ensure simulation output matches frozen baseline."""
    from psap_research.regression import build_signature, compare, load_baseline
    
    # Run standard test scenario
    result = run_standard_simulation(seed=4242)
    
    # Build signature
    current_incident_sig, current_phone_sig = build_signature(result)
    
    # Load baseline
    baseline = load_baseline("tests/regression_baseline.json")
    
    # Compare
    issues = compare(current_incident_sig, baseline["incidents"])
    
    # Allow only expected tolerances
    assert len(issues) == 0, f"Regression detected: {issues}"

def update_regression_baseline():
    """Update baseline after intentional realism changes."""
    result = run_standard_simulation(seed=4242)
    save_baseline(result, "tests/regression_baseline.json")
```

---

## Deployment Architecture

### Local Development
```bash
# Install
uv sync --extra dev --extra services

# Run tests
uv run pytest tests/ -v

# Run experiment
uv run python -m psap_research.experiments.runner config/experiments/staffing_comparison_001.yaml
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gdal-bin libgdal-dev proj-bin libproj-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen

# Copy source
COPY . .

# Default command
CMD ["python", "-m", "psap_research.experiments.runner"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  psap-research:
    build: .
    volumes:
      - ./DATA:/app/DATA
      - ./config:/app/config
      - ./output:/app/output
    environment:
      - SYNTHCCD_SYSTEM_TRUST=1
    command: python -m psap_research.experiments.runner config/experiments/staffing_comparison_001.yaml
```

### Cloud Batch (AWS/GCP)
```python
# scripts/run_on_batch.py
import boto3

def submit_experiment_batch(experiment_config, n_replications=30):
    """Submit experiment as array job to AWS Batch."""
    client = boto3.client('batch')
    
    job_definition = {
        'jobDefinitionName': 'psap-research-simulation',
        'type': 'container',
        'containerProperties': {
            'image': 'psap-research:latest',
            'vcpus': 4,
            'memory': 16384,
            'command': [
                'python', '-m', 'psap_research.experiments.runner',
                '/config/experiment.yaml',
                '--replication', '${AWS_BATCH_JOB_ARRAY_INDEX}',
                '--output', '/output/${JOB_ID}'
            ],
            'mountPoints': [{
                'sourceVolume': 'data',
                'containerPath': '/app/DATA'
            }]
        }
    }
    
    # Submit array job
    response = client.submit_job(
        jobName='psap-experiment',
        jobQueue='psap-research-queue',
        jobDefinition=job_definition,
        arrayProperties={'size': n_replications}
    )
    return response['jobId']
```

---

## Monitoring & Observability

### Structured Logging
```python
# psap_research/utils/logging.py
import structlog

logger = structlog.get_logger()

def log_event(event_type: str, **kwargs):
    logger.info(event_type, **kwargs)

# Usage in simulation engine
log_event(
    "incident_dispatched",
    incident_id=incident.incident_id,
    units=[u.unit_id for u in assigned_units],
    priority=incident.priority.value,
    travel_time_estimate=travel_time,
    timestamp=clock.current_time.isoformat()
)
```

### Metrics Export (Prometheus)
```python
# psap_research/metrics/exporters.py
from prometheus_client import Counter, Histogram, Gauge

INCIDENTS_TOTAL = Counter('psap_incidents_total', 'Total incidents', ['agency', 'priority'])
RESPONSE_TIME_SECONDS = Histogram('psap_response_time_seconds', 'Response time', ['priority', 'zone'])
UNIT_UTILIZATION = Gauge('psap_unit_utilization', 'Unit hour utilization', ['unit_id', 'shift'])
ACTIVE_INCIDENTS = Gauge('psap_active_incidents', 'Currently active incidents', ['agency'])

def record_incident_dispatched(incident, units, travel_time):
    INCIDENTS_TOTAL.labels(agency=incident.agency.value, priority=incident.priority.value).inc()
    for unit in units:
        UNIT_UTILIZATION.labels(unit_id=unit.unit_id, shift=unit.shift_id).set(unit.utilization)
```

---

## Security Considerations

| Aspect | Implementation |
|--------|----------------|
| **Data Privacy** | All synthetic - no PII. No real addresses, names, or phone numbers. |
| **Network** | Fully offline capable after initial dependency install. No external API calls in simulation. |
| **Credentials** | None required. No database passwords, API keys in simulation engine. |
| **Output** | Synthetic data only. Metadata includes `DataSource=SYNTHETIC`, `Disclaimer=NOT FOR OPERATIONAL USE`. |
| **Dependencies** | Pinned versions in `uv.lock`. Security audit via `uv run scripts/audit_deps.py`. |

---

## Extensibility Points

| Extension Point | Interface | Example Use Cases |
|-----------------|-----------|-------------------|
| **Geography Provider** | `GeographyProvider` | Real GIS data, other synthetic generators |
| **Staffing Policy** | `DynamicStaffingPolicy` | ML-driven, rule-based, optimization-based |
| **Dispatch Logic** | `DispatchStrategy` | Nearest-available, workload-balanced, specialization-aware |
| **Travel Time Model** | `TravelTimeModel` | Historical, ML-predicted, dynamic traffic |
| **Fatigue Model** | `FatigueModel` | Circadian, workload-based, recovery curves |
| **Incident Generator** | `IncidentGenerator` | Different realism profiles, seasonal patterns |
| **Metrics Collector** | `MetricsCollector` | Custom metrics, external export formats |
| **Experiment Analyzer** | `ComparisonAnalyzer` | Bayesian, bootstrap, permutation tests |

---

*This architecture is designed for extensibility, testability, and scientific rigor. Each component is independently testable and replaceable.*