# PSAP Research — Missing Simulation Layers (Gap Analysis)

> **Comprehensive gap analysis of simulation layers needed for a complete public safety simulation ecosystem**

---

## The Simulation Stack — Current vs. Complete

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE PUBLIC SAFETY SIMULATION ECOSYSTEM                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   GEOGRAPHY  │  │    EVENTS    │  │  OPERATIONS  │  │   OUTCOMES   │            │
│  │  (SynthGIS)  │  │  (SynthCCD)  │  │   (MISSING)  │  │   (MISSING)  │            │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘            │
│        │                │                │                │                          │
│        ▼                ▼                ▼                ▼                          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                    SIMULATION ENGINE & ANALYSIS LAYER                       │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: OPERATIONS LAYER (Real-time Dispatch & Resource Management)

### Current Gap
SynthCCD generates static incident records with timestamps, but **no real-time dispatch simulation** exists. Incidents are generated with pre-computed timestamps, but there's no dynamic dispatch logic, unit state management, or real-time resource contention.

### Missing Components

| Component | Priority | Description | Implementation Complexity |
|-----------|----------|-------------|---------------------------|
| **CAD Simulation Engine** | Critical | Real-time incident queue, unit assignment, status tracking, preemption | High |
| **Unit State Machine** | Critical | `AVAILABLE → DISPATCHED → ENROUTE → ON_SCENE → CLEARED → AVAILABLE` with valid transitions | Medium |
| **Preemption & Reassignment** | High | Higher priority calls bump lower priority units; cross-staffing conflicts | High |
| **Cross-Staffing Logic** | High | Same personnel staff multiple apparatus (Engine + Medic) | Medium |
| **Mutual Aid / Auto-Aid** | High | Automatic resource requests across jurisdictional boundaries | High |
| **Staging & Resource Pools** | Medium | Unassigned units held in staging for major incidents | Medium |
| **AVL / GPS Simulation** | Medium | Simulated unit positions moving on road network | High |
| **Unit Availability Calendar** | Medium | Planned maintenance, training, out-of-service scheduling | Medium |

### Current SynthCCD Limitation
```python
# Current: Static timestamps generated once
incident.timestamps = {
    'call_received': ...,
    'call_answered': ...,
    'dispatch_ts': ...,     # pre-computed
    'enroute_ts': ...,      # pre-computed
    'arrived_ts': ...,      # pre-computed
    'cleared_ts': ...       # pre-computed
}

# Needed: Dynamic timestamps based on real-time simulation
incident.timestamps = {
    'call_received': ...,           # fixed from SynthCCD
    'call_answered': ...,           # simulated: ring → answer
    'dispatch_initiated': ...,      # simulated: parallel with call-taking
    'first_unit_assigned': ...,     # simulated: dispatch logic
    'first_unit_enroute': ...,      # simulated: turnout time
    'first_unit_arrived': ...,      # simulated: travel time
    'last_unit_cleared': ...,       # simulated: on-scene time
    'incident_closed': ...          # simulated: closeout
}
```

### Implementation Recommendation
Build a **Discrete Event Simulation (DES) Engine** with:
- Priority queue event scheduler (heapq)
- Unit state machines with valid transitions
- Parallel timeline processing (call-taking + dispatch simultaneous)
- Event handlers for each event type

---

## Layer 2: PERSONNEL & HUMAN FACTORS LAYER

### Current Gap
SynthCCD assigns personnel to shifts with Zipf-weighted workload, but **no human factors modeling** exists. No fatigue, experience, stress, or communication load modeling.

### Missing Components

| Component | Priority | Description | Parameters |
|-----------|----------|-------------|------------|
| **Fatigue Model** | High | Circadian + shift length + overtime → reaction time modifier | `fatigue = 1.0 + 0.005*hours + 0.01*overtime` |
| **Circadian Rhythm** | High | Time-of-day alertness variation | Low 03-05 (1.2x), Peak 10-14 (0.9x) |
| **Experience Model** | Medium | Tenure + certifications → dispatch accuracy | `competency = min(1.0, 0.5 + 0.05*years)` |
| **Stress/Burnout** | Medium | Cumulative high-acuity exposure | `burnout = min(1.0, high_acuity_calls * 0.01)` |
| **Communication Load** | Medium | Radio traffic → dispatcher queue delay | `channel_load = active_incidents * 0.15` |
| **Competency Decay** | Low | Skills atrophy without practice | `decay = 0.99^months_since_training` |

### Implementation Approach

```python
class PersonnelModel:
    def __init__(self, personnel: Personnel):
        self.personnel = personnel
        self.fatigue = 1.0
        self.burnout = 0.0
        self.last_shift_end = None
    
    def update_fatigue(self, hours_worked: float, hours_off: float):
        """Update fatigue based on work/rest cycle."""
        self.fatigue = max(1.0, 
            1.0 + 0.005 * hours_worked 
            - 0.01 * hours_off
        )
        # Circadian modifier
        current_hour = datetime.now().hour
        if 0 <= current_hour <= 5:
            self.fatigue *= 1.2  # 20% slower at night
        elif 10 <= current_hour <= 14:
            self.fatigue *= 0.9  # 10% faster mid-day
    
    def get_reaction_modifier(self) -> float:
        """Return multiplier for reaction times."""
        return self.fatigue * (1.0 + self.burnout)
    
    def update_burnout(self, incident_acuity: str):
        """Accumulate burnout from high-acuity incidents."""
        acuity_weights = {'P1': 0.02, 'P2': 0.01, 'P3': 0.005, 'P4': 0.002}
        self.burnout = min(1.0, self.burnout + acuity_weights.get(incident_acuity, 0))
```

### Impact on Simulation
- **Calltaker**: Fatigue → longer pickup delay, longer interview
- **Dispatcher**: Fatigue → slower dispatch decisions, more errors
- **Firefighter/Paramedic**: Fatigue → slower turnout, slower on-scene

---

## Layer 3: TELEPHONY & COMMUNICATIONS LAYER

### Current Gap
SynthCCD generates hourly call volumes with abandonment rates, but **no real-time call queue simulation** with real-time queue dynamics, multi-channel handling, or NG911 i3 call flow.

### Missing Components

| Component | Priority | Description |
|-----------|----------|-------------|
| **Real-time Call Queue** | Critical | Real-time queue with priorities, abandonment, callbacks |
| **Multi-channel Handling** | High | Separate 911, admin, radio, CAD-to-CAD, text-to-911 |
| **ANI/ALI Simulation** | High | Automatic Number/Location Identification with errors |
| **Text-to-911 / RTT** | High | Session-based, longer duration, higher abandonment |
| **CAD-to-CAD Transfers** | Medium | Transfers between PSAPs with data handoff |
| **NG911 i3 Call Flow** | High | ESRP → ECRF → PSAP → Policy Routing → Dispatch |
| **Call Recording/Logging** | Medium | Simulated recordings for QA |

### NG911 i3 Call Flow (Critical for Standards Compliance)

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

**Key PIDF-LO Elements Needed:**
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

## Layer 4: INCIDENT COMPLEXITY & CASCADING EFFECTS

### Current Gap
SynthCCD generates independent incidents. **No cascading effects, multi-alarm escalation, or planned events.**

### Missing Components

| Component | Priority | Description | Probability/Delay |
|-----------|----------|-------------|-------------------|
| **Incident Escalation** | High | Single call → multi-unit → alarm levels → mutual aid | — |
| **Cascading Incidents** | High | Primary → secondary (traffic, hazmat, medical) | Fire: 30% traffic, 15% medical, 5% hazmat |
| **Planned Events** | High | Concerts, sports, parades with pre-planned staffing | Calendar-based |
| **Weather/Disaster Impact** | High | Storm, flood, earthquake modifying volumes & travel | Surge capacity |
| **Mass Casualty/Active Assailant** | High | Special protocols, unified command, hospital coord | Rare but critical |

### Cascading Incident Probabilities

| Primary Incident | Secondary Type | Probability | Typical Delay |
|------------------|----------------|-------------|---------------|
| Structure Fire | Traffic (rubbernecking) | 0.30 | 2-10 min |
| Structure Fire | Medical (smoke inhalation) | 0.15 | 5-15 min |
| Structure Fire | Hazmat | 0.05 | 10-30 min |
| Major MVA | Vehicle Fire | 0.20 | 1-5 min |
| Major MVA | Hazmat (fuel) | 0.10 | 5-15 min |
| Active Shooter | Medical (mass casualty) | 0.40 | 1-3 min |
| Active Shooter | Fire (arson) | 0.10 | 5-10 min |
| Hazmat | Fire | 0.25 | 5-15 min |
| Hazmat | Medical (exposure) | 0.20 | 5-10 min |

### Multi-Alarm Escalation Logic

```python
class MultiAlarmManager:
    ALARM_RESOURCES = {
        1: {'engines': 2, 'ladders': 1, 'battalion_chiefs': 1, 'medics': 1},
        2: {'engines': 2, 'ladders': 1, 'battalion_chiefs': 1, 'medics': 1},
        3: {'engines': 2, 'ladders': 1, 'battalion_chiefs': 1, 'medics': 1},
        4: {'specialized': ['hazmat', 'usar', 'air']},
    }
    
    def escalate(self, incident: Incident, current_alarm: int) -> int:
        """Determine if incident should escalate to next alarm."""
        if current_alarm >= 4:
            return current_alarm
        
        # Escalation criteria
        committed_units = len(incident.assigned_units)
        total_units = sum(self.ALARM_RESOURCES.get(i, {}).get('engines', 0) 
                         for i in range(1, current_alarm + 1))
        
        if committed_units >= total_units * 0.9:  # 90% committed
            return current_alarm + 1
        
        # Time-based escalation
        elapsed = (datetime.now() - incident.timestamps.first_unit_assigned).total_seconds()
        if current_alarm == 1 and elapsed > 1200:  # 20 min
            return 2
        if current_alarm == 2 and elapsed > 2400:  # 40 min
            return 3
        
        return current_alarm
```

---

## Layer 5: TRANSPORTATION & TRAVEL TIME REALISM

### Current Gap
SynthGIS provides static routing graph with travel-time weights. **No dynamic traffic, road closures, apparatus-specific speeds, or response modes.**

### Missing Components

| Component | Priority | Description | Parameters |
|-----------|----------|-------------|------------|
| **Dynamic Traffic** | High | Time-of-day, incidents, weather, events affecting speeds | Peak: 0.7x, Off-peak: 1.0x, Night: 1.2x |
| **Road Closures** | High | Temporary closures + detours | Construction, accidents, events |
| **Apparatus Speeds** | High | Engine vs Ladder vs Medic vs BC speeds | Engine: 1.0x, Ladder: 0.85x, Medic: 1.1x |
| **Response Modes** | High | Code 3 vs Code 2 vs Routine | Code3: 1.0x, Code2: 0.7x, Routine: 0.5x |
| **Turnout Variability** | Medium | Station design, crew readiness, time-of-day | Station-specific + time-of-day |
| **Dynamic Re-routing** | Medium | Re-route enroute units for higher priority | Real-time optimization |

### Dynamic Traffic Model

```python
class DynamicTrafficModel:
    def get_speed_modifier(
        self,
        segment: StreetSegment,
        timestamp: datetime,
        weather: WeatherCondition,
        active_incidents: List[Incident],
        planned_events: List[PlannedEvent]
    ) -> float:
        """Return speed multiplier (1.0 = free flow)."""
        modifier = 1.0
        
        # Time of day
        modifier *= self._time_of_day_factor(timestamp.hour)
        
        # Weather
        modifier *= self._weather_factor(weather)
        
        # Incident proximity
        modifier *= self._incident_proximity_factor(segment, active_incidents)
        
        # Planned events (construction, parades)
        modifier *= self._event_factor(segment, planned_events)
        
        # Clamp to reasonable range
        return max(0.1, min(1.5, modifier))
    
    def _time_of_day_factor(self, hour: int) -> float:
        # Peak hours slower
        if 7 <= hour <= 9: return 0.7      # AM peak
        if 16 <= hour <= 18: return 0.65   # PM peak
        if 22 <= hour <= 5: return 1.2     # Night (faster)
        return 1.0
    
    def _weather_factor(self, weather: WeatherCondition) -> float:
        factors = {
            WeatherCondition.CLEAR: 1.0,
            WeatherCondition.RAIN: 0.85,
            WeatherCondition.HEAVY_RAIN: 0.75,
            WeatherCondition.SNOW: 0.6,
            WeatherCondition.HEAVY_SNOW: 0.4,
            WeatherCondition.ICE: 0.3,
            WeatherCondition.FOG: 0.8,
        }
        return factors.get(weather, 1.0)
    
    def _incident_proximity_factor(self, segment: StreetSegment, 
                                   incidents: List[Incident]) -> float:
        """Reduce speed near active incidents."""
        for incident in incidents:
            dist = segment.geometry.distance(incident.location)
            if dist < 500:  # within 500m
                return 0.7  # 30% reduction
            elif dist < 1000:
                return 0.85
        return 1.0
```

---

## Layer 6: OUTCOMES & METRICS LAYER

### Current Gap
SynthCCD produces incident records and phone metrics, but **no comprehensive outcome metrics** aligned with NFPA/NENA standards, equity analysis, or cost-benefit analysis.

### Missing Components

| Metric Category | Specific Measures | Standard | Research Value |
|-----------------|-------------------|----------|----------------|
| **Response Time Distributions** | Fractiles (p50, p90, p95) by priority/zone | NFPA 1710/1720 | Staffing optimization |
| **Unit Utilization** | UHU, workload balance | NFPA 1710 | Station placement, unit count |
| **Workload Equity** | CV of calls/unit, high-acuity exposure | — | Burnout prevention |
| **Service Reliability** | Coverage gaps, simultaneous calls | NFPA 1720 | Station placement |
| **Cost Metrics** | Cost/incident, cost/FTE, overtime | Budget | Cost-benefit analysis |
| **Clinical Outcomes** | Cardiac survival, fire confinement | — | Outcome-based staffing |
| **Equity Metrics** | Response by demographic quintile | NFPA 1730 | Environmental justice |

### Equity Analysis Framework (Missing)

```python
def analyze_equity(incidents_df: pd.DataFrame, demographics: pd.DataFrame) -> EquityReport:
    """Analyze response time equity across demographic groups."""
    
    # Join incidents with demographic data
    incidents_with_demo = incidents_df.merge(demographics, on='census_tract')
    
    # Assign demographic quintiles
    incidents_with_demo['income_quintile'] = pd.qcut(
        incidents_with_demo['median_income'], 5, labels=[1,2,3,4,5]
    )
    
    # Response time by quintile and priority
    equity_data = {}
    for priority in [1,2,3,4,5]:
        priority_data = incidents_with_demo[incidents_with_demo['priority'] == priority]
        if len(priority_data) == 0:
            continue
            
        quintile_stats = priority_data.groupby('income_quintile')['response_time_seconds'].agg([
            'median', 'mean', 'std', 'count', 
            lambda x: np.percentile(x, 90)
        ]).rename(columns={'<lambda_0>': 'p90'})
        
        equity_data[f'priority_{priority}'] = quintile_stats.to_dict()
    
    # Calculate disparity metrics
    max_disparity = {}
    for priority in [1,2,3,4,5]:
        key = f'priority_{priority}'
        if key in equity_data:
            medians = [equity_data[key][q]['median'] for q in [1,2,3,4,5] if q in equity_data[key]]
            if medians:
                max_disparity[priority] = (max(medians) - min(medians)) / np.mean(medians) * 100
    
    return EquityReport(
        response_time_by_quintile=equity_data,
        max_disparity_pct=max_disparity,
        overall_equity_score=1 - np.mean(list(max_disparity.values())) / 100 if max_disparity else 1.0
    )
```

---

## Layer 7: DATA & INTEROPERABILITY STANDARDS

### Missing Standards Integration

| Standard | Purpose | Integration Point |
|----------|---------|-------------------|
| **NENA NG9-1-1 i3** | Call routing, location validation | SynthGIS boundaries + SynthCCD calls |
| **NENA 020.1** | Answer time standards | Phone metrics validation |
| **NFPA 1710/1720** | Response time benchmarks | Outcome metrics |
| **NIMS/ICS** | Incident command structure | Multi-agency incidents |
| **FHIR / HL7** | Hospital/patient data exchange | EMS outcome tracking |
| **Open311** | Non-emergency service requests | Non-emergency volume realism |

---

## Layer 8: MACHINE LEARNING INTEGRATION

### Missing ML Applications

| Application | Data Source | Output | Complexity |
|-------------|-------------|--------|------------|
| **Demand Forecasting** | Historical SynthCCD + weather/events | Hourly volume predictions | Medium |
| **Travel Time Prediction** | SynthGIS routing + historical | Real-time ETA | Medium |
| **Optimal Station Placement** | SynthGIS + demand surface | Greenfield locations | High |
| **Unit Pre-positioning** | Predicted demand + current locations | Dynamic deployment (SSM) | High |
| **Anomaly Detection** | Real-time call patterns | Surge detection | Medium |
| **Optimal Staffing** | Historical + forecasted demand | Dynamic staffing policies | High |

---

## Summary: Implementation Priority Matrix

| Layer | Missing Component | Effort | Impact | Dependencies | Phase |
|-------|-------------------|--------|--------|--------------|-------|
| **Ops** | Dispatch Simulation Engine | High | Critical | SynthGIS+SynthCCD bridge | 1 |
| **Ops** | Unit State Machine | Medium | Critical | Dispatch engine | 2 |
| **Ops** | Staffing Scenario Framework | Medium | High | Dispatch engine | 3 |
| **Ops** | Experiment Runner + Stats | Medium | High | Staffing framework | 4 |
| **Ops** | Dynamic Traffic | High | High | Routing graph | 5 |
| **Personnel** | Fatigue Model | Medium | Medium | Shift config | 5 |
| **Ops** | Cascading Incidents | High | Medium | Dispatch engine | 6 |
| **Ops** | Multi-alarm/Mutual Aid | Medium | High | Dispatch logic | 6 |
| **Telephony** | NG911 i3 Call Flow | High | Standards | SynthCCD phone | 7 |
| **Transport** | Apparatus-specific speeds | Medium | High | Routing graph | 7 |
| **Outcomes** | Equity Analysis | Medium | Research | Demographics | 8 |
| **ML** | Demand Forecasting | Medium | Future | Historical data | 8 |
| **ML** | Dynamic Staffing Policy | High | Future | Staffing + Experiments | 9 |

---

## Quick Wins (Can Implement Immediately)

1. **Unit State Machine** — Core of simulation engine
2. **Event Queue + Clock** — Discrete event simulation foundation
3. **Basic Dispatch Logic** — Nearest-available + run cards
4. **Staffing Scenario YAML** — Config-driven scenarios
5. **Experiment Runner** — Paired replication framework
6. **Paired t-test Framework** — Statistical rigor
4. **Equity Metrics** — Demographic quintile analysis
5. **Cost-Benefit Framework** — Marginal benefit curves

---

## Dependencies Between Layers

```
SynthGIS (Geography)
       │
       ▼
SynthCCD (Workloads) ◄───┐
       │                  │
       ▼                  │
┌───────────────────────┘
│  PSAP Research        │
│  Simulation Engine    │
├───────────────────────┤
│ Ops Layer             │
│  ├─ Dispatch Engine   │
│  ├─ Unit State Machine│
│  ├─ Routing           │
│  └─ Clock/Events      │
├───────────────────────┤
│ Personnel Layer       │
│  ├─ Fatigue Model     │
│  ├─ Experience Model  │
│  └─ Stress Model      │
├───────────────────────┤
│ Advanced Ops          │
│  ├─ Dynamic Traffic   │
│  ├─ Cascading Inc.    │
│  ├─ Multi-Alarm       │
│  └─ NG911 i3          │
├───────────────────────┤
│ Outcomes Layer        │
│  ├─ Response Times    │
│  ├─ Utilization       │
│  ├─ Equity            │
│  └─ Cost-Benefit      │
```

---

*Each layer builds on the previous. The foundation (Geography + Workload + Core Simulation) must be solid before advanced layers add value.*