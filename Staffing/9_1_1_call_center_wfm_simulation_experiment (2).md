# Experimental Design: 9-1-1 Call Center Staffing Optimization & Re-Simulation

## Overview
This document outlines the architectural blueprint, feasibility assessment, potential challenges, and mitigation strategies for evaluating workforce management (WFM) strategies in emergency dispatch environments. The experiment uses synthetic call data generation (`SynthCCD`), passes aggregated workloads through various staffing models, generates optimized shift schedules, and re-runs a discrete-event simulation to measure performance improvements. It incorporates both traditional telephony metrics and a novel **concurrency-based dispatcher saturation framework** to account for multi-tasking and cognitive load in public safety answering points (PSAPs).

---

## 1. Pipeline Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌────────────────────────┐
│    SynthCCD     │     │ Aggregation & Data   │     │ Call Center Staffing   │
│ Synthetic Data  ├────►│ Processing Engine    ├────►│ Models (Erlang, MILP,  │
│ Generation      │     │ (Pandas / NumPy)     │     │ Machine Learning)      │
└─────────────────┘     └──────────┬───────────┘     └───────────┬────────────┘
         ▲                         │                             │
         │                         ▼                             │
         │              ┌──────────────────────┐                 │
         └──────────────┤ Re-run Evaluation &  │◄────────────────┘
                        │ Metric Comparison    │ Recommended Schedules
                        │ (SimPy Engine)       │ (OR-Tools / PuLP)
                        └──────────────────────┘
```

### **Phase 1: Synthetic Generation (`SynthCCD`)**
* **Source:** [`SynthCCD` Repository](https://github.com/trdunsworth/SynthCCD)
* **Objective:** Generate long-term CAD/call metrics tailored to a 9-1-1 PSAP, covering emergency/non-emergency inbound, outbound, abandoned volumes, shift details, and initial personnel counts.
* **Key Challenge:** *Data Distribution Consistency.* Synthetic call volumes typically follow non-homogeneous Poisson processes (NHPP) with time-of-day and day-of-week seasonality. Ensure baseline shift schedules mirror temporal arrival rates to avoid artificial over- or under-staffing at time zero.

### **Phase 2: Aggregation & Feature Extraction**
* **Objective:** Ingest and parse timestamps, separating emergency inbound streams from administrative/non-emergency lines.
* **Key Variable Tracking:** Initial Arrival Rate ($\lambda$), Effective Arrival Rate ($\lambda_e$), Average Handling Time (AHT), and Service Level Targets (e.g., $X\%$ of calls answered within $Y$ seconds).

### **Phase 3: Applying Staffing Models**
* **Objective:** Test multiple academic and industrial call-center staffing frameworks against the aggregated workload.
* **Literature Tiers:**
  1. *Stationary Queuing:* Erlang C, Erlang A ($M/M/N + K$ accounting for caller patience/abandonment).
  2. *Time-Varying Queuing:* Piecewise Erlang A, Modified Offered Load (MOL) to handle non-stationary call spikes.
  3. *Optimization & Scheduling:* Mixed-Integer Linear Programming (MILP) via Google OR-Tools or PuLP to resolve fractional headcounts into actionable shift structures respecting union/overtime rules.

### **Phase 4: Feedback Loop & Re-Simulation (`SimPy`)**
* **Objective:** Build a discrete-event simulation (DES) where synthetic call arrivals interact with the newly generated staffing schedules.
* **Key Metrics:** Queue lengths, wait times, service level attainment, abandonment rates, and agent utilization/burnout metrics.

---

## 2. Advanced Framework: Dispatcher Saturation & Concurrency Modeling

Traditional call-center models (like Erlang C) assume a **1-to-1 matching paradigm**: an agent handles one call at a time, hangs up, and becomes free. 

Emergency dispatching violates this assumption fundamentally. A single dispatcher often manages active concurrent incidents, radio traffic, typing CAD notes, coordinating secondary responders, and answering new voice lines. Applying conventional telephony models fails because saturation is driven by **concurrent active task load duration**, not just immediate call arrival rates.

### **Concurrency-Based Saturation Architecture**
```
┌────────────────────────┐      ┌─────────────────────────┐      ┌──────────────────────────┐
│ SynthCCD Event Stream  ├─────►│ Task-Complexity & State │─────►│ Hourly Concurrency Matrix│
│ (CAD Logs & Incidents) │      │ Profiler (Pandas/SimPy) │      │ (Simultaneous Incidents) │
└────────────────────────┘      └─────────────────────────┘      └────────────┬─────────────┘
                                                                              │
                                                                              ▼
┌────────────────────────┐      ┌─────────────────────────┐      ┌──────────────────────────┐
│ Optimal Headcount Curve│◄─────┤ Utilization Threshold & │◄─────┤ Erlang-Multiserver /     │
│ (Staffing Recommender) │      │ Saturation Indexing     │      │ Queuing-with-Interrupts  │
└────────────────────────┘      └─────────────────────────┘      └──────────────────────────┘
```

#### **1. Reformulating the Output Metric (Dispatcher Saturation Index)**
Define dispatcher workload ($W$) during an hourly block ($t$) as:
$$W_t = \sum_{i=1}^{I_t} (T_{\text{radio}, i} + T_{\text{cad}, i} + T_{\text{coord}, i}) \times \text{Complexity Weight}_i$$
Where $I_t$ is the number of active concurrent events handled by a single dispatcher during hour $t$.

#### **2. Simulating Multi-Tasking in Python (`SimPy`)**
Here is the core implementation pattern for tracking active concurrency and logging dispatcher saturation over time:

```python
import simpy
import random
import pandas as pd

class Dispatcher:
    def __init__(self, env, dispatcher_id):
        self.env = env
        self.id = dispatcher_id
        self.active_load = 0.0  # Current concurrency score
        self.saturation_log = []

    def monitor_saturation(self):
        """Continuously records the dispatcher's saturation level over time."""
        while True:
            self.saturation_log.append({
                'time': self.env.now,
                'dispatcher_id': self.id,
                'active_load': self.active_load
            })
            yield self.env.timeout(1.0)  # Check every 1 simulated minute

def dispatch_workflow(env, dispatcher, incident_id, complexity_weight):
    """Simulates a dispatcher managing a complex incident lifecycle."""
    # 1. Intake / Assignment Phase
    dispatcher.active_load += complexity_weight
    
    # 2. Active Management Duration (proportional to complexity)
    handling_time = random.normalvariate(mu=15 * complexity_weight, sigma=3)
    handling_time = max(5.0, handling_time) # Minimum floor
    
    yield env.timeout(handling_time)
    
    # 3. Resolution / Clearance Phase
    dispatcher.active_load = max(0.0, dispatcher.active_load - complexity_weight)

def incident_generator(env, dispatchers):
    """Generates synthetic CAD events coming into the dispatch center."""
    incident_counter = 0
    while True:
        inter_arrival = random.expovariate(lambda_ = 0.2) # ~12 events per hour
        yield env.timeout(inter_arrival)
        
        incident_counter += 1
        # Assign complexity weights based on historical distributions
        complexity = random.choices([1.0, 2.0, 3.5, 5.0], weights=[0.6, 0.25, 0.1, 0.05])[0]
        
        # Routing policy: Assign to the dispatcher with the lowest current workload score
        target_dispatcher = min(dispatchers, key=lambda d: d.active_load)
        
        env.process(dispatch_workflow(env, target_dispatcher, incident_counter, complexity))

# --- Running the Simulation ---
env = simpy.Environment()
num_staff = 4
dispatcher_pool = [Dispatcher(env, i) for i in range(num_staff)]

# Start monitoring loops for each dispatcher
for d in dispatcher_pool:
    env.process(d.monitor_saturation())

# Start the incoming incident stream
env.process(incident_generator(env, dispatcher_pool))

# Run for 8 hours (480 minutes)
env.run(until=480)

# Aggregate logs for analysis
all_logs = []
for d in dispatcher_pool:
    all_logs.extend(d.saturation_log)

df_results = pd.DataFrame(all_logs)
print(df_results.groupby('dispatcher_id')['active_load'].describe())
```

---

## 3. Key Challenges & Mitigation Strategies

1. **The Abandonment & Redial Effect**
   * *Challenge:* High abandonment rates in non-emergency or low-priority queues cause immediate re-dials, artificially inflating subsequent arrival rates.
   * *Mitigation:* Track both raw arrival rates and effective arrival rates, distinguishing between life-threatening emergency channels and administrative lines.
2. **Multi-Skilling and Role Separation**
   * *Challenge:* PSAPs often split dedicated call-takers and dispatchers or utilize blended agents.
   * *Mitigation:* Begin the single PSAP baseline with dedicated roles. When scaling to regional centers, incorporate skill-based routing (SBR) approximations.
3. **Fractional Staffing Realities**
   * *Challenge:* Mathematical queuing models output continuous fractional values (e.g., $4.3$ agents required at 03:00 AM) that cannot be directly scheduled.
   * *Mitigation:* Route raw requirements through an integer programming scheduling layer to enforce legally compliant shift windows (e.g., 8-hour, 10-hour, or 12-hour rotations).

---

## 4. Scaling Roadmap: Single PSAP to Regional Centers

* **Phase A (Single PSAP):** Establish the core data pipeline, baseline validation, and single-location simulation loop.
* **Phase B (Regional Expansion):** Introduce pooled resources to evaluate the *Erlang Pooling Effect* (economies of scale requiring fewer total agents across unified centers).
* **Phase C (Multi-Jurisdictional Routing):** Implement overflow rules, cross-jurisdictional transfers, and priority queuing matrices (Class 1 Life-Threatening vs. Class 4 Admin).

---

## 5. Proposed Python Toolchain
* **Data Manipulation:** `pandas`, `numpy`
* **Queuing & Staffing Math:** Custom SciPy implementations or specialized libraries (e.g., `PyLang`)
* **Shift Optimization:** Google OR-Tools (`CP-SAT` solver) or `PuLP`
* **Discrete-Event Simulation:** `SimPy` (ideal for building stateful concurrency and task-switching logic)