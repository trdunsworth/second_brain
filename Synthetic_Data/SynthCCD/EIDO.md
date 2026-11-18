# Emergency Incident Data Object (EIDO) - Synthetic Generator Design Document

## Overview

This document outlines the NENA standards related to Emergency Incident Data Objects (EIDO) and provides a comprehensive design for building a synthetic EIDO generator that can create realistic test data for NG9-1-1 systems.

## NENA Standards Reference

### Primary Standards

| Standard | Title | Status | Reference |
|----------|-------|--------|-----------|
| **NENA-STA-021.1b-2021** | Standard for Emergency Incident Data Object (EIDO) | ANSI Approved, Currently Under Revision | [NENA Site](https://www.nena.org/resource/resmgr/standards/NENA-STA-021.1b-2021_2024121.pdf) / [GitHub](https://github.com/NENA911/EIDO-JSON) |
| **NENA-STA-024.1.1-2025** | Conveyance of Emergency Incident Data Objects (EIDO) between NG9-1-1 Systems and Applications | ANSI Approved | [NENA Site](https://www.nena.org/resource/resmgr/standards/NENA-STA-024.1.1-2025_EIDO_C.pdf) / [GitHub](https://github.com/NENA911/EIDO-Conveyance-Incident-Data-API) |

### Related Standards

| Standard | Title | Relevance |
|----------|-------|-----------|
| NENA-STA-010.3f-2021 | NENA i3 Standard for Next Generation 9-1-1 | Core NG9-1-1 architecture that EIDO operates within |
| **NENA-STA-019.2-2022** | **NG9-1-1 Call Processing Metrics Standard** | **Defines 30+ metrics derived from EIDO timestamps/events for analytics** |
| NENA-STA-004 | NG9-1-1 GIS Data Model (CLDXF-US) | Location data formats used in EIDO |
| NENA-STA-012 | NG9-1-1 Additional Data Standard | Additional data components referenced in EIDO |

## NENA-STA-019.2-2022 Metrics Mapping to EIDO

The NG9-1-1 Call Processing Metrics Standard defines standardized metrics for NG9-1-1 call processing analysis. **Synthetic EIDOs must contain sufficient timestamp granularity and event data to compute all these metrics.**

### Call-Related Metrics (3.3) - EIDO Field Mapping

| Metric | Definition | EIDO Fields Required | LogEvent Source |
|--------|------------|---------------------|-----------------|
| **Call Network Transit** | Ingress to egress time within ESInet | `callComponent[].callStartTimestamp` at ingress/egress FEs | CallStartLogEvent |
| **Inter-Network Transit** | ESInet ingress to next network ingress | `callComponent[].callStartTimestamp` across networks | CallStartLogEvent |
| **Session Duration** | INVITE to BYE/error for SIP Call-ID | `callComponent[].callStartTimestamp` + session end | SessionStartLogEvent, SessionEndLogEvent |
| **Successful Session Request Delay (SSRD)** | INVITE to 180/183 response | `callComponent[].callStartTimestamp` + provisional response | SessionStartLogEvent, CallSignalingMessageLogEvent |
| **Session Disconnect Delay (SDD)** | BYE to final response | Session end + response timestamp | SessionEndLogEvent, CallSignalingMessageLogEvent |
| **Call Answered Delay** | INVITE to 200 OK (call answered) | `callComponent[].callStartTimestamp` → `callComponent[].answerDate` | CallStartLogEvent, CallStateChangeLogEvent(callAnswered) |
| **Session Answered Delay** | INVITE to 200 OK (session answered) | `callComponent[].callStartTimestamp` → session answered | SessionStartLogEvent, SessionStateChangeLogEvent |
| **Call Failed Delay** | INVITE to error response/timeout | `callComponent[].callStartTimestamp` → error | CallStartLogEvent, CallSignalingMessageLogEvent(error) |
| **Session Failed Delay** | Session INVITE to error | Session start → error for callIdSip | SessionStartLogEvent, CallSignalingMessageLogEvent |
| **Call Alerting Delay** | callAlerting to callAnswered | `callComponent` state transitions | CallStateChangeLogEvent(callAlerting→callAnswered) |
| **Session Alerting Delay** | 180/182/183 to 200 OK | Session provisional → 200 OK | SessionStateChangeLogEvent |
| **Time to Invite Third-Party** | callAnswered to third-party INVITE | `callComponent[].answerDate` → transfer callStartTimestamp | CallStateChangeLogEvent, CallStartLogEvent(transfer) |
| **Location Dereference Query Response** | Location query to response | `locationComponent[].locationByReferenceUrl` timing | LocationQueryLogEvent, LocationResponseLogEvent |
| **Location Inter-Notification Delay** | Consecutive location updates | Multiple `locationComponent` timestamps | LocationResponseLogEvent sequence |
| **LoST Dereference Query/Response** | LoST query to response | Routing location timing | LoSTQueryLogEvent, LoSTResponseLogEvent |
| **Hold Time** | callHold to next state change | `callComponent` state transitions | CallStateChangeLogEvent(callHold→next) |
| **Park Time** | callPark to next state change | `callComponent` state transitions | CallStateChangeLogEvent(callPark→next) |
| **Call Queued Delay** | callQueued to next state change | `callComponent[].queueIdentifier` + timestamps | CallStateChangeLogEvent(callQueued→next) |
| **Announcement Duration** | AnnouncementStart to AnnouncementEnd | `additionalDataComponent` or call annotations | AnnouncementStartLogEvent, AnnouncementEndLogEvent |
| **Total Call Duration** | CallStart to CallEnd | `callComponent[].callStartTimestamp` → callEnd | CallStartLogEvent, CallEndLogEvent |
| **Call Media Quality** | Jitter, delay, packet loss | `additionalDataComponent` with MediaEndLogEvent data | MediaEndLogEvent |
| **Route Determination Time** | ESRP entry to route determined | `callComponent` at ESRP + route time | CallStartLogEvent/CallProcessLogEvent, RouteLogEvent |
| **MSRP Automated Response Delay** | Caller MSRP to PSAP auto-response | Text/media session timing | NonRtpMediaMessageLogEvent |
| **MSRP Response Message Delay** | Caller MSRP to agent MSRP | Text/media session turn timing | NonRtpMediaMessageLogEvent |
| **Additional Data Query Response** | AdditionalData query to response | `additionalDataComponent` timing | AdditionalDataQueryLogEvent, AdditionalDataResponseLogEvent |
| **EIDO Dereference Factory Query Response** | EIDO dereference query to response | `incidentComponent` + dereference timing | EidoDereferenceFactoryQueryLogEvent, EidoDereferenceFactoryQueryResponseLogEvent |
| **Subscription Request Response** | Subscribe to subscribeResponse | `incidentComponent` + subscription timing | SubscriptionRequestedLogEvent, SubscriptionRequestedResponseLogEvent |
| **Subscription Duration** | Subscribe to terminate | Subscription start → end | SubscriptionRequestedLogEvent, SubscriptionTerminatedLogEvent |
| **WebSocket Duration** | WS established to terminated | WebSocket lifecycle | WebSocketEstablishedLogEvent, WebSocketTerminatedLogEvent |
| **ALI Query Response Delay** | ALI query to response | Legacy ALI timing | AliLocationQueryLogEvent, AliLocationResponseLogEvent |

### Agent-Related Metrics (3.4) - EIDO Field Mapping

| Metric | Definition | EIDO Fields Required |
|--------|------------|---------------------|
| **Agent Availability Metric** | Time in primary agent state (Available/Not Available) | `agentComponent[].agentRoleRegistryText` + state timestamps |
| **Agent Secondary State Metric** | Time in secondary state (LoggedOut, Break, Waiting, Active, Hold, Reserved) | `agentComponent` + secondary state timestamps |

### Required LogEvent Types for Metrics Computation

To support all NENA-STA-019 metrics, synthetic EIDOs should be accompanied by or embed these LogEvent types (per NENA-STA-010 Logging Service):

| LogEvent Type | Purpose | EIDO Correlation |
|---------------|---------|------------------|
| `CallStartLogEvent` | Call ingress at FE | `callComponent.callStartTimestamp` |
| `CallEndLogEvent` | Call termination | Derived from call timeline |
| `CallStateChangeLogEvent` | callBegin, callAlerting, callAnswered, callQueued, callHold, callPark, callCancel, callEnd | `callComponent.callStateRegistryText` + timestamps |
| `SessionStartLogEvent` | SIP session start | `callComponent` + sessionId |
| `SessionEndLogEvent` | SIP session end | `callComponent` + sessionId |
| `SessionStateChangeLogEvent` | Session state changes | `callComponent` + sessionId |
| `CallSignalingMessageLogEvent` | SIP messages (INVITE, 180, 200, CANCEL, BYE, errors) | `callComponent` signaling |
| `LocationQueryLogEvent` / `LocationResponseLogEvent` | Location dereference | `locationComponent.locationByReferenceUrl` |
| `LoSTQueryLogEvent` / `LoSTResponseLogEvent` | LoST routing queries | `locationComponent` routing |
| `RouteLogEvent` | ESRP route determination | `callComponent` + routing |
| `MediaEndLogEvent` | Media quality stats | `additionalDataComponent` |
| `AnnouncementStartLogEvent` / `AnnouncementEndLogEvent` | Announcement playback | `callComponent` + announcements |
| `NonRtpMediaMessageLogEvent` | MSRP/text messages | `callComponent` + text sessions |
| `AdditionalDataQueryLogEvent` / `AdditionalDataResponseLogEvent` | Additional data queries | `additionalDataComponent` |
| `EidoDereferenceFactoryQueryLogEvent` / `EidoDereferenceFactoryQueryResponseLogEvent` | EIDO dereference | `incidentComponent` + conveyance |
| `SubscriptionRequestedLogEvent` / `SubscriptionRequestedResponseLogEvent` / `SubscriptionTerminatedLogEvent` | EIDO subscriptions | `incidentComponent` + conveyance |
| `WebSocketEstablishedLogEvent` / `WebSocketTerminatedLogEvent` | WebSocket lifecycle | Conveyance layer |
| `AliLocationQueryLogEvent` / `AliLocationResponseLogEvent` | Legacy ALI queries | `locationComponent` (legacy) |
| `AgentStateChangeLogEvent` | Agent primary/secondary state | `agentComponent` + state timestamps |
| `DiscrepancyReportLogEvent` | Misrouted call detection | `incidentComponent` + routing |

### EIDO Generator Enhancements for NENA-STA-019 Compliance

#### Additional Timestamp Fields Needed in Generated EIDOs

```python
# Enhanced CallInformationType for metrics
class CallInformationType(BaseModel):
    # Existing fields...
    callStartTimestamp: datetime           # CallStartLogEvent
    answerDate: Optional[datetime]         # callAnswered
    callEndTimestamp: Optional[datetime]   # CallEndLogEvent (NEW)
    
    # State transition timestamps for metrics
    callAlertingTimestamp: Optional[datetime]    # callAlerting (NEW)
    callQueuedTimestamp: Optional[datetime]      # callQueued (NEW)
    callHoldTimestamp: Optional[datetime]        # callHold (NEW)
    callParkTimestamp: Optional[datetime]        # callPark (NEW)
    callCancelTimestamp: Optional[datetime]      # callCancel (NEW)
    
    # Session-level timestamps
    sessionId: Optional[str]             # SIP Call-ID
    sessionStartTimestamp: Optional[datetime]    # SessionStartLogEvent (NEW)
    sessionEndTimestamp: Optional[datetime]      # SessionEndLogEvent (NEW)
    sessionAnsweredTimestamp: Optional[datetime] # Session answered (NEW)
    sessionProvisionalTimestamp: Optional[datetime] # 180/183 (NEW)
    
    # Media quality
    mediaQualityStats: Optional[MediaQualityStats]  # MediaEndLogEvent (NEW)
    
    # Announcements
    announcementStartTimestamp: Optional[datetime] # AnnouncementStartLogEvent (NEW)
    announcementEndTimestamp: Optional[datetime]   # AnnouncementEndLogEvent (NEW)
    announcementType: Optional[str]                # AutoAnswerGreeting, etc. (NEW)
    
    # Routing
    routeDeterminationTimestamp: Optional[datetime] # RouteLogEvent (NEW)
    lostQueryTimestamp: Optional[datetime]          # LoSTQueryLogEvent (NEW)
    lostResponseTimestamp: Optional[datetime]       # LoSTResponseLogEvent (NEW)
    
    # Additional data queries
    additionalDataQueryTimestamp: Optional[datetime]
    additionalDataResponseTimestamp: Optional[datetime]
    
    # EIDO conveyance
    eidoDereferenceQueryTimestamp: Optional[datetime]
    eidoDereferenceResponseTimestamp: Optional[datetime]
    
    # Subscription
    subscriptionRequestedTimestamp: Optional[datetime]
    subscriptionResponseTimestamp: Optional[datetime]
    subscriptionTerminatedTimestamp: Optional[datetime]
    
    # WebSocket
    websocketEstablishedTimestamp: Optional[datetime]
    websocketTerminatedTimestamp: Optional[datetime]
    
    # Legacy ALI
    aliQueryTimestamp: Optional[datetime]
    aliResponseTimestamp: Optional[datetime]
```

#### Agent State Tracking for Agent Metrics

```python
# Enhanced AgentType for agent metrics
class AgentType(BaseModel):
    # Existing fields...
    
    # Agent state timeline (for Agent Availability & Secondary State metrics)
    stateTimeline: List[AgentStateEvent] = Field(default_factory=list)

class AgentStateEvent(BaseModel):
    timestamp: datetime
    primaryAgentState: Optional[str]      # Available, NotAvailable
    secondaryAgentState: Optional[str]    # LoggedOut, Break, Waiting, Active, Hold, Reserved
    stateChangeReason: Optional[str]
    callId: Optional[str]                 # Associated call
    incidentId: Optional[str]             # Associated incident
```

### Metrics Computation Engine

The generator should include a metrics computation module that can derive all NENA-STA-019 metrics from generated EIDOs:

```python
# src/synth911gen3/eido/metrics.py
class NENAMetricsComputer:
    """Compute NENA-STA-019 metrics from EIDO data."""
    
    def compute_call_metrics(self, eido: EmergencyIncidentDataObjectType) -> CallMetrics:
        """Compute all 30 call-related metrics from single EIDO."""
        pass
    
    def compute_agent_metrics(self, eido: EmergencyIncidentDataObjectType) -> AgentMetrics:
        """Compute agent availability and secondary state metrics."""
        pass
    
    def compute_batch_metrics(self, eidos: List[EmergencyIncidentDataObjectType]) -> AggregatedMetrics:
        """Compute aggregate statistics (mean, median, percentiles) across batch."""
        pass
    
    def export_metrics_report(self, metrics: Metrics, format: str = "parquet") -> Path:
        """Export metrics for analysis."""
        pass
```

### Configuration for Metrics Generation

Add to `config/eido_realism.yaml`:

```yaml
metrics:
  # Enable/disable specific metric generation
  enable_call_metrics: true
  enable_agent_metrics: true
  enable_media_quality: true
  enable_announcements: true
  enable_text_sessions: true
  enable_eido_conveyance: true
  enable_subscriptions: true
  enable_websocket: true
  enable_legacy_ali: false
  
  # Metric distribution parameters (lognormal for delays)
  metric_distributions:
    call_answered_delay:
      priority_1: {mu: 1.5, sigma: 0.4}   # ~4.5 sec median
      priority_2: {mu: 2.0, sigma: 0.5}   # ~7.4 sec
      priority_3: {mu: 2.5, sigma: 0.6}   # ~12.2 sec
      priority_4: {mu: 3.0, sigma: 0.7}   # ~20.1 sec
      priority_5: {mu: 3.5, sigma: 0.8}   # ~33.1 sec
    
    call_queued_delay:
      mu: 2.8
      sigma: 0.8
    
    route_determination_time:
      mu: 0.5
      sigma: 0.2
    
    location_dereference_time:
      mu: 1.0
      sigma: 0.3
    
    lost_query_time:
      mu: 0.3
      sigma: 0.15
    
    additional_data_query_time:
      mu: 1.2
      sigma: 0.4
    
    eido_dereference_time:
      mu: 0.8
      sigma: 0.25
    
    session_duration:
      voice: {mu: 5.0, sigma: 1.0}      # ~148 sec median
      text: {mu: 6.0, sigma: 1.2}       # ~403 sec
      video: {mu: 5.5, sigma: 1.1}      # ~245 sec
    
    media_quality:
      jitter_ms: {mean: 15, std: 8}
      delay_ms: {mean: 45, std: 20}
      packet_loss_pct: {mean: 0.1, std: 0.05}
    
    announcement_duration:
      auto_answer_greeting: {mu: 2.0, sigma: 0.3}  # ~7.4 sec
      no_agents_available: {mu: 2.5, sigma: 0.4}   # ~12.2 sec
      standard: {mu: 3.0, sigma: 0.5}              # ~20.1 sec
  
  # Agent state durations (minutes)
  agent_state_durations:
    available:
      primary: {mu: 45, sigma: 15}
    not_available:
      primary: {mu: 15, sigma: 10}
    break:
      secondary: {mu: 15, sigma: 5}
    waiting:
      secondary: {mu: 5, sigma: 3}
    active:
      secondary: {mu: 8, sigma: 4}
    hold:
      secondary: {mu: 3, sigma: 2}
    reserved:
      secondary: {mu: 2, sigma: 1}
```

### Validation for Metrics Readiness

```python
# tests/test_nena_sta_019_metrics.py
def test_all_call_metrics_computable():
    """Verify generated EIDO has all timestamps for 30 call metrics."""
    eido = generator.generate_incident(enable_metrics=True)
    missing = find_missing_metric_fields(eido)
    assert not missing, f"Missing fields for metrics: {missing}"

def test_metric_values_realistic():
    """Verify computed metrics fall within realistic ranges."""
    eido = generator.generate_incident()
    metrics = computer.compute_call_metrics(eido)
    assert 0 < metrics.call_answered_delay < 300  # < 5 min
    assert 0 < metrics.call_queued_delay < 600    # < 10 min
    assert metrics.session_duration > 0

def test_agent_metrics_computable():
    """Verify agent state timeline supports agent metrics."""
    eido = generator.generate_incident()
    for agent in eido.agentComponent:
        assert len(agent.stateTimeline) >= 2
        assert all_valid_state_transitions(agent.stateTimeline)
```

## EIDO Data Structure (from NENA-STA-021.1b)

### Core Components

The EIDO is a JSON-based data structure with the following top-level components:

```
EmergencyIncidentDataObjectType
├── Prologue (common to all components)
│   ├── $id (globally unique identifier)
│   ├── lastUpdateTimeStamp (ISO 8601)
│   ├── updatedByAgencyReference (ReferenceType)
│   └── updatedByAgentReference (ReferenceType)
├── eidoVersion: "1.0"
├── issuingElementIdentification: string
├── incidentComponent: IncidentInformationType (required)
├── callComponent[]: CallInformationType
├── callbackComponent[]: CallbackType
├── dispatchComponent[]: DispatchInformationType
├── alarmsSensorsComponent[]: AlarmsSensorsType
├── agencyComponent[]: AgencyType
├── agentComponent[]: AgentType
├── notesComponent[]: NotesType
├── additionalDataComponent[]: AdditionalDataType
├── locationComponent[]: LocationInformationType
├── personComponent[]: PersonInformationType
├── vehicleComponent[]: VehicleInformationType
├── emergencyResourceComponent[]: EmergencyResourceType
├── mergeComponent[]: MergeInformationType
├── linkComponent[]: LinkInformationType
└── @context: JSON-LD context reference
```

### Key Data Types

#### 1. IncidentInformationType
- `incidentTypeCommonRegistryText` (required) - from IANA registry
- `incidentTypeInternalCode` / `incidentTypeInternalText` - local codes
- `incidentStatusCommonRegistryText[]` - from Incident Status registry
- `incidentCommonPriorityNumber` - globally unique priority (int32)
- `incidentPriorityInternalText` - local priority
- `beatOrDispatchGroupText` - dispatch group
- `internalIncidentId` - local incident ID
- `dispositionComponent[]` - DispositionType
- References to: agents, locations, persons, vehicles, notes

#### 2. CallInformationType
- `callStateRegistryText` (required) - from IANA CallStates registry
- `standardPrimaryCallType` (required) - from LogEvent CallTypes registry
- `direction` (required): incoming | outgoing | internal
- `callStartTimestamp` (required) - ISO 8601
- `answerDate` - when answered
- `standardSecondaryCallType`
- `localCallType`
- `queueIdentifier`
- `verstat`, `sipIdentity`, `sipIdentities`
- References to: agents, locations, persons, additionalData, notes, callback

#### 3. LocationInformationType
- `locationTypeDescriptionRegistryText` (required) - from Location Type registry
- `locationByValue` - PIDF-LO XML format
- `locationByReferenceUrl` - dereferenceable URL
- `locationDescriptionText`
- `crossStreetByValue[]` / `crossStreetByReferenceUrl[]`
- `intersectingStreetByValue[]` / `intersectingStreetByReferenceUrl[]`
- `cellTowerSectorId`
- References to: additionalData, notes

#### 4. AgencyType
- `agencyRoleDescriptionRegistryText[]` (required) - from Agency Role registry
- `agencyType[]` (required) - from IANA urn:emergency:service:responder
- `agencyJcard` - contact info in jCard format
- `incidentOwningAgencyIndicator` - boolean
- References to: notes

#### 5. AgentType
- `agentRoleRegistryText[]` (required) - from Agent Role registry
- `agencyReference` (required) - ReferenceType
- `agentJcard` - contact info
- `agentWorkstationPositionIdentification`
- References to: notes

#### 6. EmergencyResourceType
- `emergencyResourceTypeCommonRegistryText` (required) - from registry
- `primaryUnitStatusRegistryText` (required) - from Primary Unit Status registry
- `secondaryUnitStatusRegistryText[]` (required) - from Secondary Unit Status registry
- `resourceAttributeRegistryText[]` (required) - from Resource Attribute registry
- `emergencyResourceTypeInternalText`
- `emergencyResourceName`
- `eta` - estimated time of arrival
- `unitStatusInternal[]`
- References to: agents, location, destination, persons, vehicles, notes

#### 7. DispatchInformationType
- References to: agency, agent, emergencyResource[], notes

#### 8. DispositionType
- `dispositionCommonRegistryCode` (required) - from Common Disposition Code registry
- `dispositionPrimaryIndicator` - boolean
- `dispositionCategoryText`
- `dispositionDescriptionText`
- References to: notes

#### 9. CallbackType
- `callBackInformationUri[]` - SIP/TEL URIs
- `deviceContactHeader`
- `updatedCbn` - UpdatedCBNType

#### 10. AdditionalDataType
- `additionalDataByReferenceUrl`
- `additionalDataByValue` - XML data (ServiceInfo, ProviderInfo, Comment, etc.)
- `urlPurpose`
- References to: notes

#### 11. PersonInformationType
- `personIncidentRoleRegistryText[]` (required) - from Person Role registry
- `ncPersonComponent` - NIEM person type
- `callIdentifier[]`
- References to: additionalData, location, notes, callback

#### 12. VehicleInformationType
- `vehicleRelationshipType[]` (required) - from Vehicle Relationship Type registry
- `vehicleRelationshipTimeStamp` (required)
- `ncVehicleComponent` - NIEM vehicle type
- References to: additionalData, location, notes

#### 13. AlarmsSensorsType
- `csaaAlarmInformation` - CSAA data
- `alarmUrl` - URL to CSAA data
- References to: agent, notes

#### 14. MergeInformationType / LinkInformationType
- For incident merge/split and linking operations

## Registry Values (Critical for Realistic Generation)

### IANA Registries Referenced
1. **urn:emergency:service:responder** - Agency types (police, fire, ems, etc.)
2. **CallStates** - callBegin, callAnswered, callEnd, partyAdd, etc.
3. **LogEvent CallTypes** - Primary/Secondary classifications
4. **Incident Type Registry** - Standard incident categories
5. **Incident Status Registry** - Standard status values
6. **Agency Role Registry** - CallReceiving, Dispatch, etc.
7. **Agent Role Registry** - Call Taking, Dispatching, Supervisor, etc.
8. **Location Type Registry** - RoutingLocation, Caller, etc.
9. **Person Role Registry** - Caller, Victim, Suspect, Witness, etc.
10. **Common Disposition Code Registry** - Standard dispositions
11. **Emergency Resource Type Registry** - Engine, Medic, Patrol, etc.
12. **Primary/Secondary Unit Status Registries** - Available, Enroute, OnScene, etc.
13. **Resource Attribute Registry** - ALS, BLS, Hazmat, etc.
14. **Vehicle Relationship Type Registry** - Suspect, Victim, Evidence, etc.

## Synthetic EIDO Generator Design

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Synthetic EIDO Generator                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Configuration│  │  Data Sources│  │   Generation Engine  │  │
│  │   (YAML)     │  │              │  │                      │  │
│  │ - Registries │  │ - OSM Address│  │ - Incident Builder   │  │
│  │ - Distributions│ │ - Names      │  │ - Call Timeline Gen  │  │
│  │ - Weights    │  │ - Unit Data  │  │ - Resource Allocator │  │
│  └──────────────┘  └──────────────┘  │ - Reference Linker   │  │
│         │               │            └──────────┬───────────┘  │
│         └───────────────┼───────────────────────┘              │
│                         ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Output Adapters                         │  │
│  │  JSON (EIDO) │ JSON-LD │ Parquet │ CSV │ Pandas │ Polars  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Steps

#### Phase 1: Foundation (Week 1-2)

1. **Create Registry Data Models**
   - Load all IANA/NENA registry values from configuration YAML
   - Create enums/validated types for each registry
   - Implement registry versioning support

2. **Build Core Data Types (Pydantic Models)**
   - Map OpenAPI schema to Pydantic models
   - Include all required/optional fields
   - Add validation for cross-references
   - Support JSON-LD context

3. **Reference Management System**
   - UUID/URN generation for `$id` fields
   - Reference resolution and linking
   - Component deduplication (shared agencies, agents, locations)

#### Phase 2: Data Generation (Week 2-3)

4. **Incident Generation Pipeline**
   ```
   Incident Generator
   ├── Select incident type (weighted by registry)
   ├── Select priority (1-5, weighted by type)
   ├── Select agency(s) (LAW/FIRE/EMS + others)
   ├── Generate location (OSM + PIDF-LO)
   ├── Generate caller/person data
   ├── Generate call timeline (realistic timestamps)
   ├── Generate dispatch sequence
   ├── Generate resource assignments
   ├── Generate dispositions
   └── Link all components with references
   ```

5. **Realistic Timestamp Generation**
   - Call start → answer → queue → dispatch → enroute → arrive → clear → close
   - Priority-weighted lognormal distributions (from existing synth911gen3)
   - Separate turnout vs travel time
   - Diurnal patterns for call volume

6. **Location Generation (PIDF-LO)**
   - Fetch real addresses from OpenStreetMap via overpy
   - Convert to PIDF-LO civicAddress XML
   - Support RoutingLocation vs Caller location types
   - Cross streets and intersecting streets

#### Phase 3: Advanced Features (Week 3-4)

7. **Call Component Generation**
   - Multiple calls per incident (transfers, callbacks)
   - SIP/TEL URI generation for callbacks
   - Additional data (ServiceInfo, ProviderInfo XML)
   - verstat, sipIdentity simulation

8. **Resource & Dispatch Modeling**
   - Unit status state machines
   - Multi-unit dispatch
   - Unit location tracking (station → enroute → scene → hospital → available)
   - ETA calculations

9. **Merge/Link Simulation**
   - Duplicate call merging
   - Related incident linking
   - Parent/child relationships

10. **Alarms/Sensors**
    - CSAA alarm data simulation
    - AACN (Automatic Crash Notification) data

#### Phase 4: Output & Integration (Week 4)

11. **Serialization Adapters**
    - JSON (strict EIDO schema)
    - JSON-LD with @context
    - Parquet/Arrow for analytics
    - CSV (flattened)
    - Pandas/Polars DataFrames

12. **Validation & Testing**
    - Schema validation against OpenAPI
    - Reference integrity checks
    - Registry value compliance
    - Round-trip serialization tests

### Configuration Schema (YAML)

```yaml
# config/eido_realism.yaml
registries:
  # Override or extend NENA standard registries
  agency_types:
    - "psap"
    - "police"
    - "fire"
    - "ems"
    - "poison_control"
  incident_types:
    - "Traffic Accident"
    - "Medical Emergency"
    - "Fire"
    - "Crime"
  # ... all registries

distributions:
  # Priority weights by incident type
  incident_priority_weights:
    "Traffic Accident": [0.1, 0.2, 0.4, 0.2, 0.1]
    "Medical Emergency": [0.05, 0.15, 0.3, 0.3, 0.2]
  
  # Time interval distributions (lognormal params)
  time_intervals:
    queue_time:
      "1": {mu: 2.5, sigma: 0.5}  # Priority 1
      "2": {mu: 3.0, sigma: 0.6}
      # ...
    dispatch_time:
      # ...
    turnout_time:
      # ...
    travel_time:
      # ...

  # Agency mix
  agency_mix:
    LAW: 0.6
    FIRE: 0.2
    EMS: 0.15
    OTHER: 0.05

  # Call volume by hour (0-23)
  hourly_call_weights:
    0: 0.3
    1: 0.2
    # ... peak at 14-18

  # Geographic zone multipliers
  zone_travel_multipliers:
    URBAN: 1.0
    SUBURBAN: 1.5
    RURAL: 2.5

personnel:
  calltakers_per_shift:
    day: 8
    swing: 6
    night: 4
  dispatchers_per_shift:
    day: 6
    swing: 4
    night: 3
  name_weight_distribution: "zipf"  # Realistic workload

location:
  default_area: "Kansas City, MO"
  osm_query: "boundary=administrative"
  address_pool_size: 10000
```

### Generator API Design

```python
# src/synth911gen3/eido/generator.py
from synth911gen3.eido import EIDOGenerator, EIDOConfig

config = EIDOConfig.from_yaml("config/eido_realism.yaml")
generator = EIDOGenerator(config)

# Generate single EIDO
eido = generator.generate_incident(
    incident_type="Traffic Accident",
    priority=2,
    area="Kansas City, MO"
)

# Generate batch
eidos = generator.generate_batch(
    count=10000,
    output_format="parquet",
    output_path="output/eidos/"
)

# Generate with specific constraints
eidos = generator.generate_batch(
    count=1000,
    agencies=["LAW", "FIRE"],
    priority_range=(1, 3),
    time_range=("2024-01-01", "2024-12-31"),
    output_format="json"
)
```

### Integration with Existing synth911gen3

The EIDO generator should leverage existing components:

| Existing Component | EIDO Usage |
|-------------------|------------|
| `AddressGenerator` (overpy/OSM) | LocationInformationType.locationByValue |
| `PersonnelGenerator` | AgentType, EmergencyResourceType.agentReference |
| `CallTimelineGenerator` | CallInformationType timestamps |
| `PriorityTimeDistributions` | All time intervals |
| `ProblemNatureSelector` | IncidentInformationType.incidentType* |
| `DispositionSelector` | DispositionType |
| `CallReceptionSelector` | CallInformationType.direction, standardPrimaryCallType |

### Output Formats

| Format | Use Case | Implementation |
|--------|----------|----------------|
| **JSON (EIDO)** | NG9-1-1 system testing | Direct model.dump_json() |
| **JSON-LD** | Semantic web / linked data | Add @context, use jsonld lib |
| **Parquet** | Analytics / ML training | pyarrow.Table.from_pydantic() |
| **CSV** | Spreadsheet / simple import | Flatten references to IDs |
| **Pandas DataFrame** | Python analysis | pd.DataFrame([eido.model_dump()]) |
| **Polars DataFrame** | High-perf analysis | pl.DataFrame([eido.model_dump()]) |

### Validation Requirements

1. **Schema Validation**: All output must validate against NENA-STA-021.1b OpenAPI schema
2. **Reference Integrity**: All `$ref` values must resolve to existing components
3. **Registry Compliance**: All registry-text fields must use valid registry values
4. **Temporal Consistency**: Timestamps must be logically ordered
5. **Cardinality**: Required fields present, array minimums met

### Testing Strategy

```python
# tests/test_eido_generator.py
def test_eido_schema_validation():
    eido = generator.generate_incident()
    validate_against_openapi(eido, "Schema/openapi.yaml")

def test_reference_integrity():
    eido = generator.generate_incident()
    assert all_refs_resolve(eido)

def test_registry_compliance():
    eido = generator.generate_incident()
    assert all_values_in_registries(eido)

def test_temporal_ordering():
    eido = generator.generate_incident()
    assert timestamps_ordered(eido)

def test_output_formats():
    for fmt in ["json", "parquet", "csv", "pandas", "polars"]:
        output = generator.generate_batch(100, output_format=fmt)
        assert validate_format(output, fmt)
```

## Dependencies

### New Dependencies Needed
```toml
# pyproject.toml additions
dependencies = [
    # ... existing ...
    "pydantic>=2.0",
    "pydantic-xml",  # For PIDF-LO parsing/generation
    "jsonschema",    # Schema validation
    "jsonld",        # JSON-LD support
    "lxml",          # XML handling for additionalData
]

[tool.uv.sources]
# NENA schemas as local references
nena-eido-schema = {path = "schemas/NENA-EIDO"}
```

### Schema Management
- Vendor NENA OpenAPI schemas in `schemas/NENA-EIDO/`
- Use `pydantic-settings` for config management
- Generate models with `datamodel-code-generator` from OpenAPI

## File Structure

```
src/synth911gen3/eido/
├── __init__.py
├── config.py           # EIDOConfig, RealismConfig
├── models/
│   ├── __init__.py
│   ├── prologue.py     # PrologueType
│   ├── incident.py     # IncidentInformationType
│   ├── call.py         # CallInformationType, CallbackType
│   ├── dispatch.py     # DispatchInformationType
│   ├── resource.py     # EmergencyResourceType
│   ├── agency.py       # AgencyType
│   ├── agent.py        # AgentType
│   ├── location.py     # LocationInformationType (PIDF-LO)
│   ├── person.py       # PersonInformationType
│   ├── vehicle.py      # VehicleInformationType
│   ├── additional.py   # AdditionalDataType
│   ├── notes.py        # NotesType
│   ├── disposition.py  # DispositionType
│   ├── alarms.py       # AlarmsSensorsType
│   ├── merge.py        # MergeInformationType
│   ├── link.py         # LinkInformationType
│   └── eido.py         # EmergencyIncidentDataObjectType
├── registries/
│   ├── __init__.py
│   ├── loader.py       # Load from YAML
│   └── values.py       # Registry enums/constants
├── generator/
│   ├── __init__.py
│   ├── incident.py     # IncidentBuilder
│   ├── timeline.py     # CallTimelineGenerator
│   ├── location.py     # LocationGenerator (OSM + PIDF-LO)
│   ├── personnel.py    # Agent/Resource generator
│   ├── dispatch.py     # DispatchSequenceGenerator
│   └── reference.py    # ReferenceManager
├── output/
│   ├── __init__.py
│   ├── json.py         # JSON/JSON-LD output
│   ├── parquet.py      # Parquet output
│   ├── csv.py          # CSV output
│   └── dataframe.py    # Pandas/Polars output
├── validation/
│   ├── __init__.py
│   ├── schema.py       # OpenAPI validation
│   ├── references.py   # Reference integrity
│   └── registries.py   # Registry compliance
└── cli.py              # Typer CLI commands
```

## CLI Interface

```bash
# Generate EIDOs
synth911gen3 eido generate \
  --count 10000 \
  --output output/eidos/ \
  --format parquet \
  --area "Kansas City, MO" \
  --config config/eido_realism.yaml \
  --priority-range 1-3 \
  --agencies LAW,FIRE,EMS

# Validate existing EIDO files
synth911gen3 eido validate \
  --input output/eidos/ \
  --schema schemas/NENA-EIDO/openapi.yaml

# Convert between formats
synth911gen3 eido convert \
  --input output/eidos/incident_001.json \
  --output output/eidos/incident_001.parquet \
  --format parquet
```

## TUI/GUI Integration

Add EIDO generation to existing TUI:
- New "EIDO Generator" tab
- Real-time preview of generated EIDO JSON
- Registry value editors
- Batch generation progress bar
- Export format selector

## Future Enhancements

1. **NG9-1-1 i3 Integration**: Generate EIDOs that flow through simulated i3 functional elements (ECRF, ESRP, BCF)
2. **Real-time Streaming**: WebSocket/HTTP streaming of EIDO updates (per NENA-STA-024 conveyance)
3. **Scenario Templates**: Pre-built scenarios (multi-alarm fire, active shooter, mass casualty)
4. **Historical Replay**: Generate EIDO sequences matching real CAD data patterns
5. **Interoperability Testing**: Generate EIDOs for specific vendor implementations

## References

- [NENA-STA-021.1b EIDO Standard](https://www.nena.org/resource/resmgr/standards/NENA-STA-021.1b-2021_2024121.pdf)
- [NENA-STA-024.1.1 EIDO Conveyance](https://www.nena.org/resource/resmgr/standards/NENA-STA-024.1.1-2025_EIDO_C.pdf)
- [NENA-STA-019.2-2022 Call Processing Metrics](https://cdn.ymaws.com/www.nena.org/resource/resmgr/standards/NENA-STA-019.2-2022_CallProc.pdf)
- [EIDO-JSON GitHub](https://github.com/NENA911/EIDO-JSON)
- [EIDO Conveyance API GitHub](https://github.com/NENA911/EIDO-Conveyance-Incident-Data-API)
- [NENA i3 Standard (NENA-STA-010)](https://www.nena.org/resource/resmgr/standards/NENA-STA-010.3f-2021_i3_Stan.pdf)
- [IANA Emergency Services Registries](https://www.iana.org/assignments/emergency-services/emergency-services.xhtml)
- [PIDF-LO RFC 4119](https://datatracker.ietf.org/doc/rfc4119/)
- [NIEM Model](https://niem.github.io/)