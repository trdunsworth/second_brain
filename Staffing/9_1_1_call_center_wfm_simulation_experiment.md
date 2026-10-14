# Experimental Design: 9-1-1 Call Center Staffing Optimization & Re-Simulation

## Overview
This document outlines the architectural blueprint, feasibility assessment, potential challenges, and mitigation strategies for evaluating workforce management (WFM) strategies in emergency dispatch environments. The experiment uses synthetic call data generation (`SynthCCD`), passes aggregated workloads through various staffing models, generates optimized shift schedules, and re-runs a discrete-event simulation to measure performance improvements.

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
* **Objective:** Generate long-term CAD/call metrics tailored to a 9-1-1 Public Safety Answering Point (PSAP), covering emergency/non-emergency inbound, outbound, abandoned volumes, shift details, and initial personnel counts.
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

## 2. Key Challenges & Mitigation Strategies

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

## 3. Scaling Roadmap: Single PSAP to Regional Centers

* **Phase A (Single PSAP):** Establish the core data pipeline, baseline validation, and single-location simulation loop.
* **Phase B (Regional Expansion):** Introduce pooled resources to evaluate the *Erlang Pooling Effect* (economies of scale requiring fewer total agents across unified centers).
* **Phase C (Multi-Jurisdictional Routing):** Implement overflow rules, cross-jurisdictional transfers, and priority queuing matrices (Class 1 Life-Threatening vs. Class 4 Admin).

---

## 4. Proposed Python Toolchain

* **Data Manipulation:** `pandas`, `numpy`
* **Queuing & Staffing Math:** Custom SciPy implementations or specialized libraries (e.g., `PyLang`)
* **Shift Optimization:** Google OR-Tools (`CP-SAT` solver) or `PuLP`