# PSAP Research — Implementation Guide

> **Code patterns, base classes, interfaces, and implementation recommendations for the PSAP Research simulation ecosystem**

---

## Project Structure

```
psap_research/
├── pyproject.toml
├── psap_research/
│   ├── __init__.py
│   ├── config/
│   │   ├── __init__.py
│   │   ├── loader.py
│   │   ├── schemas.py
│   │   └── validators.py
│   ├── integration/
│   │   ├── __init__.py
│   │   ├── geography_provider.py
│   │   ├── synthgis_loader.py
│   │   ├── synthccd_loader.py
│   │   └── adapter.py
│   ├── simulation_engine/
│   │   ├── __init__.py
│   │   ├── core.py
│   │   ├── events.py
│   │   ├── units.py
│   │   ├── personnel.py
│   │   ├── dispatch.py
│   │   ├── routing.py
│   │   ├── clock.py
│   │   └── metrics.py
│   ├── staffing_scenarios/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── loader.py
│   │   ├── registry.py
│   │   └── dynamic.py
│   ├── experiments/
│   │   ├── __init__.py
│   │   ├── runner.py
│   │   ├── comparison.py
│   │   ├── statistics.py
│   │   └── visualization.py
│   ├── operations_layers/
│   │   ├── __init__.py
│   │   ├── traffic.py
│   │   ├── personnel.py
│   │   ├── cascading.py
│   │   ├── multialarm.py
│   │   └── ng911.py
│   ├── metrics/
│   │   ├── __init__.py
│   │   ├── collector.py
│   │   ├── hourly.py
│   │   ├── equity.py
│   │   └── cost_benefit.py
│   ├── data_models/
│   │   ├── __init__.py
│   │   ├── incident.py
│   │   ├── units.py
│   │   ├── personnel.py
│   │   └── geography.py
│   └── utils/
│       ├── __init__.py
│       ├── logging.py
│       ├── seeding.py
│       └── exporters.py
├── config/
│   ├── town_spec.yaml
│   ├── realism_config.yaml
│   ├── staffing_scenarios/
│   ├── experiments/
│   └── staffing_templates/
├── CODE_SKELETON/
├── TESTS/
├── NOTEBOOKS/
└── DATA/
```

---

## Core Design Patterns

### 1. Deterministic Seeding Pattern

```python
# psap_research/utils/seeding.py
import hashlib
import numpy as np
import random
from dataclasses import dataclass, field
from typing import Dict

@dataclass(frozen=True, slots=True)
class SeedState:
    """Immutable seed state with deterministic substreams."""
    master_seed: int
    substreams: Dict[str, int] = field(default_factory=dict)
    
    MODULES = (
        "geography", "incidents", "units", "personnel",
        "dispatch", "routing", "traffic", "cascading",
        "personnel_fatigue", "metrics", "experiment"
    )
    
    @classmethod
    def from_master(cls, master_seed: int | None = None, 
                    modules: tuple[str, ...] | None = None) -> "SeedState":
        if master_seed is None:
            master_seed = int(np.random.default_rng().integers(2**32))
        
        rng = np.random.default_rng(master_seed)
        target_modules = modules or cls.MODULES
        
        substreams = {}
        for module in target_modules:
            hash_input = f"{master_seed}:{module}".encode()
            subseed = int.from_bytes(hashlib.sha256(hash_input).digest()[:8], "little")
            substreams[module] = subseed
        
        return cls(master_seed=master_seed, substreams=substreams)
    
    def rng(self, module: str) -> np.random.Generator:
        if module not in self.substreams:
            raise KeyError(f"Module '{module}' not in seed state")
        return np.random.default_rng(self.substreams[module])
    
    def fork(self, new_module: str) -> "SeedState":
        hash_input = f"{self.master_seed}:{new_module}".encode()
        subseed = int.from_bytes(hashlib.sha256(hash_input).digest()[:8], "little")
        return SeedState(
            master_seed=self.master_seed,
            substreams={**self.substreams, new_module: subseed}
        )

def make_nguid(domain: str, layer: str, local_id: int) -> str:
    """Generate NENA-compliant NGUID."""
    return f"urn:emergency:uid:gid:{domain}:{layer}-{local_id:06d}"
```

### 2. Configuration Loading Pattern (Pydantic + YAML)

```python
# psap_research/config/loader.py
from pathlib import Path
from typing import Optional, Type, TypeVar
from pydantic import BaseModel
from pydantic_yaml import parse_yaml_file_as

T = TypeVar('T', bound=BaseModel)

def load_yaml_config(path: Path, model: Type[T]) -> T:
    """Load and validate YAML configuration."""
    if not path.exists():
        raise FileNotFoundError(f"Config not found: {path}")
    return parse_yaml_file_as(model, path)

def load_experiment_config(path: Path) -> "ExperimentConfig":
    from psap_research.config.schemas import ExperimentConfig
    return load_yaml_config(path, ExperimentConfig)

def load_staffing_scenario(path: Path) -> "StaffingConfig":
    from psap_research.config.schemas import StaffingConfig
    return load_yaml_config(path, StaffingConfig)

def load_town_spec(path: Path) -> "TownSpec":
    from psap_research.config.schemas import TownSpec
    return load_yaml_config(path, TownSpec)
```

### 3. Geometry Utilities

```python
# psap_research/utils/geometry.py
from shapely.geometry import Point, LineString, Polygon
from shapely import make_valid, set_precision, get_precision
from shapely.ops import transform, split, polygonize, unary_union
import pyproj

def clean_geometry(geom, precision: float = 0.01):
    """Standard geometry cleaning pipeline."""
    if geom is None or geom.is_empty:
        return geom
    geom = make_valid(geom)
    geom = set_precision(geom, precision)
    return geom

def project_geometry(geom, from_crs: str, to_crs: str):
    """Project geometry between CRS."""
    transformer = pyproj.Transformer.from_crs(from_crs, to_crs, always_xy=True)
    return transform(transformer.transform, geom)

def interpolate_along_line(line: LineString, fraction: float) -> Point:
    """Get point at fraction along line (0-1)."""
    from shapely import line_interpolate_point
    return line_interpolate_point(line, fraction, normalized=True)

def offset_point_from_line(point_on_line: Point, line: LineString, 
                           fraction: float, offset_m: float, side: str) -> Point:
    """Offset point perpendicular to line at given fraction."""
    from shapely import line_interpolate_point
    
    # Get tangent at fraction
    delta = 0.001
    p1 = line_interpolate_point(line, max(0, fraction - delta), normalized=True)
    p2 = line_interpolate_point(line, min(1, fraction + delta), normalized=True)
    
    dx = p2.x - p1.x
    dy = p2.y - p1.y
    length = (dx**2 + dy**2)**0.5
    
    if length == 0:
        return point_on_line
    
    # Perpendicular unit vector
    perp_x = -dy / length
    perp_y = dx / length
    
    sign = 1 if side == "L" else -1
    return Point(
        point_on_line.x + sign * perp_x * offset_m,
        point_on_line.y + sign * perp_y * offset_m
    )
```

---

## Simulation Engine Core Classes

### 1. Event System

```python
# psap_research/simulation_engine/events.py
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any
from heapq import heappush, heappop

class EventType(str, Enum):
    # Call-taking timeline
    CALL_RECEIVED = "call_received"
    CALL_ANSWERED = "call_answered"
    INTERVIEW_COMPLETE = "interview_complete"
    
    # Dispatch timeline (parallel)
    DISPATCH_INITIATED = "dispatch_initiated"
    UNIT_ASSIGNED = "unit_assigned"
    UNIT_ENROUTE = "unit_enroute"
    UNIT_ARRIVED = "unit_arrived"
    
    # Scene events
    UNIT_CLEARED = "unit_cleared"
    INCIDENT_CLOSED = "incident_closed"
    
    # Unit state
    UNIT_STATUS_CHANGE = "unit_status_change"
    UNIT_OUT_OF_SERVICE = "unit_out_of_service"

@dataclass(order=True, slots=True)
class SimulationEvent:
    timestamp: datetime
    event_type: EventType
    incident_id: str
    unit_id: str | None = None
    payload: Dict[str, Any] = field(default_factory=dict)
    
    def __lt__(self, other):
        return self.timestamp < other.timestamp

class EventQueue:
    """Priority queue for simulation events."""
    
    def __init__(self):
        self._queue: list[SimulationEvent] = []
    
    def push(self, event: SimulationEvent):
        heappush(self._queue, event)
    
    def pop(self) -> SimulationEvent:
        return heappop(self._queue)
    
    def peek(self) -> SimulationEvent | None:
        return self._queue[0] if self._queue else None
    
    def __len__(self):
        return len(self._queue)
    
    def __bool__(self):
        return bool(self._queue)
```

### 2. Unit State Machine

```python
# psap_research/simulation_engine/units.py
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Set
from datetime import datetime
from shapely.geometry import Point

class UnitState(str, Enum):
    AVAILABLE = "available"
    DISPATCHED = "dispatched"
    ENROUTE = "enroute"
    ON_SCENE = "on_scene"
    CLEARING = "clearing"
    OUT_OF_SERVICE = "out_of_service"

class UnitStateMachine:
    """Enforces valid unit state transitions."""
    
    VALID_TRANSITIONS = {
        "AVAILABLE": {"DISPATCHED", "OUT_OF_SERVICE"},
        "DISPATCHED": {"ENROUTE", "AVAILABLE"},
        "ENROUTE": {"ON_SCENE", "AVAILABLE"},
        "ON_SCENE": {"CLEARING", "ENROUTE"},
        "CLEARING": {"AVAILABLE"},
        "OUT_OF_SERVICE": {"AVAILABLE"},
    }
    
    def __init__(self, initial_state: str = "AVAILABLE"):
        self.current_state = initial_state
        self.state_history: list[tuple[datetime, str]] = []
    
    def can_transition(self, new_state: str) -> bool:
        return new_state in self.VALID_TRANSITIONS.get(self.current_state, set())
    
    def transition(self, new_state: str, timestamp: datetime) -> bool:
        if self.can_transition(new_state):
            self.state_history.append((timestamp, self.current_state))
            self.current_state = new_state
            return True
        return False
    
    def force_state(self, new_state: str, timestamp: datetime):
        """Force transition (for initialization/recovery)."""
        self.state_history.append((timestamp, self.current_state))
        self.current_state = new_state

@dataclass(slots=True)
class ApparatusType:
    code: str
    label: str
    capabilities: set[str] = field(default_factory=set)
    default_speed_mph: float = 35.0
    response_mode_speeds: dict = field(default_factory=lambda: {
        "CODE3": 1.0, "CODE2": 0.7, "ROUTINE": 0.5
    })
    requires_personnel: int = 3
    cross_staffable_with: list[str] = field(default_factory=list)

@dataclass(slots=True)
class Unit:
    unit_id: str
    apparatus_type: ApparatusType
    station_id: str
    shift_id: str
    personnel_ids: list[str] = field(default_factory=list)
    state_machine: UnitStateMachine = field(default_factory=UnitStateMachine)
    location: Point | None = None
    assigned_incident: str | None = None
    fatigue_factor: float = 1.0
    total_shift_hours: float = 0.0
    response_mode: str = "CODE3"
    
    def is_available(self) -> bool:
        return self.state_machine.current_state == "AVAILABLE"
    
    def is_committed(self) -> bool:
        return self.state_machine.current_state in {"DISPATCHED", "ENROUTE", "ON_SCENE"}
```

### 3. Incident Model

```python
# psap_research/data_models/incident.py
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from enum import Enum
from shapely.geometry import Point

class Agency(str, Enum):
    LAW = "LAW"
    FIRE = "FIRE"
    EMS = "EMS"

class Priority(int, Enum):
    CRITICAL = 1
    HIGH = 2
    MEDIUM = 3
    LOW = 4
    NON_EMERGENCY = 5

@dataclass(slots=True)
class IncidentTimestamps:
    call_received: datetime
    call_answered: Optional[datetime] = None
    interview_complete: Optional[datetime] = None
    dispatch_initiated: Optional[datetime] = None
    first_unit_assigned: Optional[datetime] = None
    first_unit_enroute: Optional[datetime] = None
    first_unit_arrived: Optional[datetime] = None
    last_unit_cleared: Optional[datetime] = None
    incident_closed: Optional[datetime] = None

@dataclass(slots=True)
class ServiceBoundaries:
    psap: str
    fire_zone: str
    police_zone: str
    ems_zone: str
    provisioning: str

@dataclass(slots=True)
class Incident:
    incident_id: str
    internal_ref: str
    agency: Agency
    priority: Priority
    problem_nature: str
    
    # CLDXF Address
    prefix_directional: Optional[str]
    street_number: int
    street_name: str
    street_type: str
    postfix_directional: Optional[str]
    city: str
    state: str
    postal_code: str
    location_name: Optional[str] = None
    
    # Sub-address
    building: Optional[str] = None
    floor: Optional[str] = None
    unit: Optional[str] = None
    room: Optional[str] = None
    seat: Optional[str] = None
    
    # Location
    latitude: float
    longitude: float
    location: Point = field(init=False)
    
    # Service boundaries
    service_boundaries: ServiceBoundaries
    
    # Timestamps
    timestamps: IncidentTimestamps
    
    # Personnel
    calltaker: Optional[str] = None
    dispatcher: Optional[str] = None
    
    # Call metadata
    call_reception: str = "E-911"
    disposition: str = "NR"
    
    # Assigned units
    assigned_units: list[str] = field(default_factory=list)
    
    # Calculated
    elapsed_seconds: dict = field(default_factory=dict)
    
    # Metadata
    address_source: str = "synthgis"
    shift_id: str = ""
    date: str = ""
    hour: int = 0
    
    def __post_init__(self):
        self.location = Point(self.longitude, self.latitude)
```

### 4. Dispatch Simulation Engine

```python
# psap_research/simulation_engine/core.py
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional, List, Dict
from heapq import heappush, heappop
import numpy as np
import random

from psap_research.simulation_engine.events import EventQueue, SimulationEvent, EventType
from psap_research.simulation_engine.clock import SimulationClock
from psap_research.simulation_engine.routing import SynthGISRouter
from psap_research.simulation_engine.units import Unit, UnitStateMachine
from psap_research.simulation_engine.personnel import PersonnelPool
from psap_research.metrics.collector import MetricsCollector
from psap_research.data_models.incident import Incident, Priority
from psap_research.integration.geography_provider import GeographyProvider
from psap_research.config.schemas import EngineConfig, StaffingConfig

@dataclass
class DispatchSimulationEngine:
    """Main discrete event simulation engine for 9-1-1 dispatch."""
    
    geography: GeographyProvider
    staffing: StaffingConfig
    router: SynthGISRouter
    clock: SimulationClock
    metrics: MetricsCollector
    config: EngineConfig
    
    # Core state
    event_queue: EventQueue = field(default_factory=EventQueue)
    units: dict[str, Unit] = field(default_factory=dict)
    incidents: dict[str, Incident] = field(default_factory=dict)
    incident_queue: list[Incident] = field(default_factory=list)
    personnel_pools: dict[str, PersonnelPool] = field(default_factory=dict)
    
    # Runtime
    current_incident_idx: int = 0
    running: bool = False
    rng: np.random.Generator = field(default_factory=lambda: np.random.default_rng())
    
    def load_geography(self, geography: GeographyProvider):
        self.geography = geography
        self.router = SynthGISRouter(
            geography.get_routing_graph(),
            geography.get_stations(),
            geography.get_run_cards()
        )
    
    def load_staffing(self, staffing: StaffingConfig):
        self.staffing = staffing
        self._initialize_units()
        self._initialize_personnel_pools()
    
    def load_incidents(self, incidents: list[Incident]):
        self.incident_queue = sorted(incidents, key=lambda i: i.timestamps.call_received)
        self.current_incident_idx = 0
    
    def run(self) -> "SimulationResults":
        """Run simulation to completion."""
        self.running = True
        self.clock.reset()
        
        while self.step():
            if self.clock.at_hour_boundary():
                self.metrics.collect_hourly(self.clock.current_time, self._get_state_snapshot())
        
        self.running = False
        return self.metrics.finalize()
    
    def step(self) -> bool:
        """Process single event. Returns True if simulation continues."""
        if not self.running:
            return False
        
        # Inject new incidents
        self._inject_new_incidents()
        
        # Process next event
        if not self.event_queue:
            if self.current_incident_idx < len(self.incident_queue):
                next_incident = self.incident_queue[self.current_incident_idx]
                self.clock.advance_to(next_incident.timestamps.call_received)
                return True
            return False  # No more incidents or events
        
        event = self.event_queue.pop()
        self.clock.advance_to(event.timestamp)
        
        # Dispatch to handler
        handler = getattr(self, f"_handle_{event.event_type.value.lower()}", None)
        if handler:
            handler(event)
        else:
            # Log unhandled event type
            pass
        
        return True
    
    def _inject_new_incidents(self):
        """Inject incidents whose start time has arrived."""
        while (self.current_incident_idx < len(self.incident_queue) and 
               self.incident_queue[self.current_incident_idx].timestamps.call_received <= self.clock.current_time):
            incident = self.incident_queue[self.current_incident_idx]
            self.incidents[incident.incident_id] = incident
            self.current_incident_idx += 1
            
            # Schedule CALL_RECEIVED
            self.event_queue.push(SimulationEvent(
                timestamp=incident.timestamps.call_received,
                event_type=EventType.CALL_RECEIVED,
                incident_id=incident.incident_id
            ))
    
    def _handle_call_received(self, event: SimulationEvent):
        """Start call-taking timeline."""
        incident = self.incidents[event.incident_id]
        
        # Assign calltaker
        calltaker = self.personnel_pools['calltakers'].get_next(incident.shift_id)
        incident.calltaker = calltaker.personnel_id
        
        # Schedule CALL_ANSWERED
        pickup_delay = self._sample_pickup_delay(incident)
        self.event_queue.push(SimulationEvent(
            timestamp=self.clock.current_time + timedelta(seconds=pickup_delay),
            event_type=EventType.CALL_ANSWERED,
            incident_id=event.incident_id
        ))
        
        # Schedule DISPATCH_INITIATED (parallel timeline)
        phone_duration = self._sample_phone_duration(incident)
        dispatch_fraction = self.config.dispatch_init_fraction[incident.priority.value]
        dispatch_delay = phone_duration * dispatch_fraction
        self.event_queue.push(SimulationEvent(
            timestamp=self.clock.current_time + timedelta(seconds=dispatch_delay),
            event_type=EventType.DISPATCH_INITIATED,
            incident_id=event.incident_id
        ))
    
    def _handle_dispatch_initiated(self, event: SimulationEvent):
        """Start dispatch process (parallel with call-taking)."""
        incident = self.incidents[event.incident_id]
        
        # Get dispatch plan from run cards
        dispatch_plan = self.router.get_dispatch_plan(
            incident.location, incident.agency.value
        )
        
        # Assign units per run card
        for assignment in dispatch_plan.station_assignments:
            unit = self._find_available_unit(assignment)
            if unit:
                self._assign_unit(unit, incident, assignment)
    
    def _assign_unit(self, unit: Unit, incident: Incident, assignment: dict):
        """Assign unit to incident."""
        if not unit.state_machine.transition("DISPATCHED", self.clock.current_time):
            return
        
        unit.assigned_incident = incident.incident_id
        incident.assigned_units.append(unit.unit_id)
        
        # Calculate times
        travel_time = self.router.get_travel_time(
            unit.station_id, incident.location, unit.response_mode
        )
        turnout_time = self.router.get_turnout_time(
            incident.location, incident.agency.value, unit.apparatus_type.code
        )
        
        # Apply fatigue modifier
        turnout_time *= unit.fatigue_factor
        travel_time *= unit.fatigue_factor
        
        # Schedule ENROUTE
        self.event_queue.push(SimulationEvent(
            timestamp=self.clock.current_time + timedelta(seconds=turnout_time),
            event_type=EventType.UNIT_ENROUTE,
            incident_id=incident.incident_id,
            unit_id=unit.unit_id,
            payload={'travel_time': travel_time}
        ))
        
        # Schedule ARRIVED
        self.event_queue.push(SimulationEvent(
            timestamp=self.clock.current_time + timedelta(seconds=turnout_time + travel_time),
            event_type=EventType.UNIT_ARRIVED,
            incident_id=incident.incident_id,
            unit_id=unit.unit_id
        ))
    
    def _handle_unit_arrived(self, event: SimulationEvent):
        """Unit arrived on scene."""
        unit = self.units[event.unit_id]
        incident = self.incidents[event.incident_id]
        
        if unit.state_machine.transition("ON_SCENE", self.clock.current_time):
            # Record arrival time
            if not incident.timestamps.first_unit_arrived:
                incident.timestamps.first_unit_arrived = self.clock.current_time
            
            # Schedule scene time
            scene_time = self._sample_scene_time(incident, unit)
            self.event_queue.push(SimulationEvent(
                timestamp=self.clock.current_time + timedelta(seconds=scene_time),
                event_type=EventType.UNIT_CLEARED,
                incident_id=event.incident_id,
                unit_id=event.unit_id
            ))
    
    def _handle_unit_cleared(self, event: SimulationEvent):
        """Unit cleared from incident."""
        unit = self.units[event.unit_id]
        incident = self.incidents[event.incident_id]
        
        if unit.state_machine.transition("CLEARING", self.clock.current_time):
            # Remove assignment
            unit.assigned_incident = None
            if unit.unit_id in incident.assigned_units:
                incident.assigned_units.remove(unit.unit_id)
            
            # Transition to available
            unit.state_machine.transition("AVAILABLE", self.clock.current_time)
            
            # Check if incident fully cleared
            if not incident.assigned_units:
                incident.timestamps.last_unit_cleared = self.clock.current_time
                self._schedule_incident_closed(incident)
    
    def _schedule_incident_closed(self, incident: Incident):
        closeout_time = self._sample_closeout_time(incident)
        self.event_queue.push(SimulationEvent(
            timestamp=self.clock.current_time + timedelta(seconds=closeout_time),
            event_type=EventType.INCIDENT_CLOSED,
            incident_id=incident.incident_id
        ))
    
    def _handle_incident_closed(self, event: SimulationEvent):
        incident = self.incidents[event.incident_id]
        incident.timestamps.incident_closed = self.clock.current_time
        
        # Calculate elapsed times
        self._calculate_elapsed_times(incident)
        
        # Record metrics
        self.metrics.record_incident(incident, self.clock.current_time)
    
    # Sampling methods (use self.rng for determinism)
    def _sample_pickup_delay(self, incident: Incident) -> float:
        return self.rng.lognormal(mean=1.1, sigma=0.45)  # ~3s median
    
    def _sample_phone_duration(self, incident: Incident) -> float:
        profile = self.config.realism.time_profiles[incident.agency.value][incident.priority.value]
        return self.rng.lognormal(profile.phone_mu, profile.phone_sigma)
    
    def _sample_scene_time(self, incident: Incident, unit: Unit) -> float:
        profile = self.config.realism.time_profiles[incident.agency.value][incident.priority.value]
        return self.rng.lognormal(profile.scene_mu, profile.scene_sigma)
    
    def _sample_closeout_time(self, incident: Incident) -> float:
        profile = self.config.realism.time_profiles[incident.agency.value][incident.priority.value]
        return self.rng.lognormal(profile.closeout_mu, profile.closeout_sigma)
    
    def _calculate_elapsed_times(self, incident: Incident):
        ts = incident.timestamps
        if ts.call_received and ts.call_answered:
            incident.elapsed_seconds['pickup'] = (ts.call_answered - ts.call_received).total_seconds()
        if ts.call_answered and ts.interview_complete:
            incident.elapsed_seconds['interview'] = (ts.interview_complete - ts.call_answered).total_seconds()
        if ts.interview_complete and ts.first_unit_assigned:
            incident.elapsed_seconds['dispatch_queue'] = (ts.first_unit_assigned - ts.interview_complete).total_seconds()
        if ts.first_unit_assigned and ts.first_unit_enroute:
            incident.elapsed_seconds['turnout'] = (ts.first_unit_enroute - ts.first_unit_assigned).total_seconds()
        if ts.first_unit_enroute and ts.first_unit_arrived:
            incident.elapsed_seconds['travel'] = (ts.first_unit_arrived - ts.first_unit_enroute).total_seconds()
        if ts.first_unit_arrived and ts.last_unit_cleared:
            incident.elapsed_seconds['on_scene'] = (ts.last_unit_cleared - ts.first_unit_arrived).total_seconds()
        if ts.last_unit_cleared and ts.incident_closed:
            incident.elapsed_seconds['closeout'] = (ts.incident_closed - ts.last_unit_cleared).total_seconds()
        if ts.call_received and ts.incident_closed:
            incident.elapsed_seconds['total'] = (ts.incident_closed - ts.call_received).total_seconds()
```

---

## Staffing Scenario Implementation

```python
# psap_research/staffing_scenarios/base.py
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional
from pydantic import BaseModel, Field
from pydantic_yaml import parse_yaml_file_as
from typing import Type, TypeVar

T = TypeVar('T', bound='StaffingConfig')

@dataclass
class StationStaffing:
    station_id: str
    apparatus: dict[str, dict]  # apparatus_id -> {type, count, cross_staffed_with, min_staffing}
    minimum_manning: int
    capabilities: list[str] = field(default_factory=list)

@dataclass
class ShiftDefinition:
    shift_id: str
    label: str
    start_hour: int
    start_minute: int
    end_hour: int
    end_minute: int
    rotation_group: int
    staffing: dict[str, dict]  # station_id -> {apparatus_id: {role: count}}

@dataclass
class StaffingConfig:
    scenario_name: str
    version: str
    description: str
    inherits: Optional[str] = None
    stations: dict[str, StationStaffing] = field(default_factory=dict)
    shifts: dict = field(default_factory=dict)
    cross_staffing_rules: list = field(default_factory=list)
    minimum_manning: dict[str, int] = field(default_factory=dict)
    overtime_policy: dict = field(default_factory=dict)
    fatigue_model: dict = field(default_factory=dict)
    dynamic_staffing: dict = field(default_factory=dict)
    
    @classmethod
    def from_yaml(cls: Type[T], path: Path) -> T:
        data = parse_yaml_file_as(dict, path)
        return cls._resolve_inheritance(data, path.parent)
    
    @classmethod
    def _resolve_inheritance(cls, data: dict, base_path: Path) -> 'StaffingConfig':
        if 'inherits' in data and data['inherits']:
            parent_path = base_path / data['inherits']
            parent = cls.from_yaml(parent_path)
            # Merge parent with child (child overrides parent)
            merged = {**parent.__dict__, **data}
            return cls(**merged)
        return cls(**data)
```

---

## Experiment Runner Pattern

```python
# psap_research/experiments/runner.py
from dataclasses import dataclass
from pathlib import Path
from typing import List, Dict, Optional
from concurrent.futures import ProcessPoolExecutor, as_completed
import logging

logger = logging.getLogger(__name__)

@dataclass
class ExperimentRunner:
    config: ExperimentConfig
    
    def run(self) -> ExperimentResults:
        # Save config
        self._save_config()
        
        # Generate tasks
        tasks = self._generate_tasks()
        logger.info(f"Running {len(tasks)} replications")
        
        # Parallel execution
        all_results = []
        with ProcessPoolExecutor(max_workers=self.config.parallel_jobs) as executor:
            futures = {executor.submit(self._run_replication, task): task for task in tasks}
            
            for future in as_completed(futures):
                result = future.result(timeout=3600)
                all_results.append(result)
                logger.info(f"Completed: {result.scenario_name} rep {result.replication_id}")
        
        # Organize and analyze
        scenario_results = self._organize_results(all_results)
        comparison_report = self._generate_comparison(scenario_results)
        self._save_results(scenario_results, comparison_report)
        
        return ExperimentResults(
            experiment_name=self.config.experiment.name,
            scenario_results=scenario_results,
            comparison_report=comparison_report
        )
    
    def _generate_tasks(self) -> list:
        tasks = []
        for scenario in self.config.scenarios:
            for rep in range(self.config.replications):
                seed = self._derive_seed(scenario.name, rep)
                tasks.append({
                    'scenario': scenario,
                    'replication_id': rep,
                    'seed': seed,
                    'fixed': self.config.fixed
                })
        return tasks
    
    @staticmethod
    def _derive_seed(scenario: str, rep: int, master: int) -> int:
        import hashlib
        return int(hashlib.sha256(f"{master}:{scenario}:{rep}".encode()).hexdigest()[:8], 16) % (2**32)
    
    @staticmethod
    def _run_single_replication(task: dict) -> ReplicationResult:
        """Runs in separate process."""
        # ... implementation as shown in ARCHITECTURE.md
        pass
```

---

## Metrics Collection Pattern

```python
# psap_research/metrics/collector.py
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional
from collections import defaultdict

@dataclass
class HourlyMetrics:
    hour_start: datetime
    hour_end: datetime
    
    # Volume
    incidents_created: int = 0
    incidents_dispatched: int = 0
    incidents_completed: int = 0
    
    # Response times (collect all for fractile calculation)
    response_times_p1: list[float] = field(default_factory=list)
    response_times_p2: list[float] = field(default_factory=list)
    response_times_p3: list[float] = field(default_factory=list)
    response_times_p4: list[float] = field(default_factory=list)
    response_times_p5: list[float] = field(default_factory=list)
    
    # Unit utilization
    unit_hour_utilization: dict[str, float] = field(default_factory=dict)
    unit_calls: dict[str, int] = field(default_factory=lambda: defaultdict(int))
    unit_high_acuity: dict[str, int] = field(default_factory=lambda: defaultdict(int))
    
    # Coverage
    uncovered_incidents: int = 0
    simultaneous_peak: int = 0
    
    # Phone metrics
    nine_one_one_received: int = 0
    nine_one_one_abandoned: int = 0
    non_emergency_received: int = 0
    non_emergency_abandoned: int = 0
    outbound_placed: int = 0
    
    # Cost
    fte_cost: float = 0.0
    overtime_hours: float = 0.0
    
    def compute_fractiles(self) -> dict:
        """Compute fractiles at end of hour."""
        result = {}
        for priority, times in [
            ('p1', self.response_times_p1), ('p2', self.response_times_p2),
            ('p3', self.response_times_p3), ('p4', self.response_times_p4),
            ('p5', self.response_times_p5)
        ]:
            if times:
                result[f'p50_{priority}'] = np.percentile(times, 50)
                result[f'p90_{priority}'] = np.percentile(times, 90)
                result[f'p95_{priority}'] = np.percentile(times, 95)
        return result

class MetricsCollector:
    def __init__(self):
        self.hourly_metrics: list[HourlyMetrics] = []
        self.current_hour: Optional[HourlyMetrics] = None
        self.incident_details: list = []
    
    def collect_hourly(self, timestamp: datetime, state_snapshot: dict):
        """Called at hour boundaries."""
        if self.current_hour:
            self.current_hour.hour_end = timestamp
            self.hourly_metrics.append(self.current_hour)
        
        self.current_hour = HourlyMetrics(
            hour_start=timestamp,
            hour_end=timestamp + timedelta(hours=1)
        )
    
    def record_incident_created(self, incident):
        if self.current_hour:
            self.current_hour.incidents_created += 1
    
    def record_incident_dispatched(self, incident, units):
        if self.current_hour:
            self.current_hour.incidents_dispatched += 1
    
    def record_response_time(self, incident, response_time: float):
        if self.current_hour:
            key = f'response_times_p{incident.priority.value}'
            getattr(self.current_hour, key).append(response_time)
    
    def record_unit_utilization(self, unit_id: str, busy_hours: float):
        if self.current_hour:
            self.current_hour.unit_hour_utilization[unit_id] = busy_hours
    
    def record_incident_detail(self, incident):
        """Record per-incident detail for later analysis."""
        self.incident_details.append(incident.to_dict())
    
    def finalize(self) -> SimulationResults:
        if self.current_hour:
            self.hourly_metrics.append(self.current_hour)
        
        return SimulationResults(
            hourly_metrics=self.hourly_metrics,
            incident_details=self.incident_details,
            summary=self._compute_summary()
        )
    
    def _compute_summary(self):
        # Aggregate across all hours
        pass
```

---

## Testing Patterns

### Unit Test Structure

```python
# tests/test_simulation_core.py
import pytest
from psap_research.simulation_engine.core import DispatchSimulationEngine
from psap_research.simulation_engine.units import Unit, UnitStateMachine
from psap_research.simulation_engine.events import EventQueue, SimulationEvent, EventType
from psap_research.data_models.incident import Incident, Priority, Agency

class TestUnitStateMachine:
    def test_valid_transitions(self):
        sm = UnitStateMachine("AVAILABLE")
        assert sm.transition("DISPATCHED", datetime.now())
        assert sm.transition("ENROUTE", datetime.now())
        assert sm.transition("ON_SCENE", datetime.now())
        assert sm.transition("CLEARING", datetime.now())
        assert sm.transition("AVAILABLE", datetime.now())
    
    def test_invalid_transitions(self):
        sm = UnitStateMachine("AVAILABLE")
        assert not sm.transition("ON_SCENE", datetime.now())  # invalid
        assert sm.current_state == "AVAILABLE"

class TestEventQueue:
    def test_priority_ordering(self):
        eq = EventQueue()
        eq.push(SimulationEvent(datetime(2024,1,1,12,0,0), EventType.CALL_RECEIVED, "1"))
        eq.push(SimulationEvent(datetime(2024,1,1,11,0,0), EventType.CALL_RECEIVED, "2"))
        eq.push(SimulationEvent(datetime(2024,1,1,13,0,0), EventType.CALL_RECEIVED, "3"))
        
        assert eq.pop().incident_id == "2"  # earliest first
        assert eq.pop().incident_id == "1"
        assert eq.pop().incident_id == "3"

class TestDispatchEngine:
    @pytest.fixture
    def engine(self):
        # Minimal engine for testing
        engine = DispatchSimulationEngine(...)
        return engine
    
    def test_incident_injection(self, engine):
        incident = Incident(..., call_start_time=datetime(2024,1,1,12,0,0))
        engine.load_incidents([incident])
        engine.clock.advance_to(datetime(2024,1,1,12,0,0))
        engine.step()
        
        # Should have injected incident and scheduled CALL_RECEIVED
        assert len(engine.event_queue) == 1
        assert engine.event_queue.peek().event_type == EventType.CALL_RECEIVED
    
    def test_parallel_dispatch_timeline(self, engine):
        # Test that dispatch can initiate before call ends
        pass
```

---

## Configuration Validation

```python
# psap_research/config/validators.py
from pydantic import BaseModel, field_validator, model_validator
from typing import Optional

class StaffingConfig(BaseModel):
    scenario_name: str
    stations: dict[str, StationConfig]
    shifts: ShiftConfig
    cross_staffing_rules: list[CrossStaffingRule] = []
    minimum_manning: dict[str, int] = {}
    overtime_policy: OvertimePolicy = OvertimePolicy()
    fatigue_model: FatigueModel = FatigueModel()
    
    @model_validator(mode='after')
    def validate_staffing(self):
        # Check minimum manning achievable
        for station_id, min_manning in self.minimum_manning.items():
            station = self.stations.get(station_id)
            if station:
                max_possible = sum(
                    app.count * app.minimum_staffing 
                    for app in station.apparatus.values()
                )
                if max_possible < min_manning:
                    raise ValueError(f"Station {station_id}: min_manning {min_manning} > max possible {max_possible}")
        
        # Check cross-staffing references exist
        for rule in self.cross_staffing_rules:
            primary = rule.primary
            secondary = rule.secondary
            if not any(primary in apps for apps in self.stations.values()):
                raise ValueError(f"Cross-staffing primary '{primary}' not found in stations")
            if not any(secondary in apps for apps in self.stations.values()):
                raise ValueError(f"Cross-staffing secondary '{secondary}' not found in stations")
        
        return self
```

---

## Performance Optimization Tips

| Technique | Application |
|-----------|-------------|
| **Event queue** | Use `heapq` for O(log n) event scheduling |
| **Spatial queries** | Use `geopandas.sindex` (STRtree) for point-in-polygon |
| **Routing cache** | Cache `shortest_path_length` results with LRU |
| **Parallel replication** | `ProcessPoolExecutor` with `max_workers=cpu_count` |
| **Vectorized metrics** | Use NumPy arrays for fractile computation |
| **Lazy incident loading** | Load incidents only when needed |
| **Seed isolation** | Each replication gets independent RNG stream |

---

## Debugging & Profiling

```python
# Debug event timeline
def debug_event_timeline(engine, max_events=100):
    events = []
    while engine.event_queue and len(events) < max_events:
        event = engine.event_queue.pop()
        events.append({
            'time': engine.clock.current_time,
            'type': event.event_type.value,
            'incident': event.incident_id,
            'unit': event.unit_id
        })
    return pd.DataFrame(events)

# Profile simulation
import cProfile, pstats
profiler = cProfile.Profile()
profiler.enable()
results = engine.run()
profiler.disable()
stats = pstats.Stats(profiler).sort_stats('cumulative')
stats.print_stats(20)
```

---

*This guide provides production-ready patterns. Adapt and extend based on your specific research needs.*