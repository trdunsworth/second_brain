# Staffing-Model Evaluation: SynthCCD Demand + Independent DES

*Design draft (Option A). Status: proposed, pre-implementation.*

## 1. Purpose and background

The experiment asks whether staffing recommendations produced by different staffing models would, in theory, improve 9-1-1 call-handling performance when the recommended staffing is applied to simulated demand.

SynthCCD (https://github.com/trdunsworth/SynthCCD) can generate realistic call volumes, shift structures, and personnel counts. Reading its documentation showed three issues with using it alone as the evaluation environment:

- **Staffing is inert by default.** With `queue_model_enabled` off, staffing does not change generated outcomes, so a re-run would show no real effect.
- **The built-in queue model is Erlang-based.** It uses Erlang-C for answer time and Erlang-A for abandonment. Scoring Erlang-family staffing models against it is circular and favors them.
- **Features that distinguish better models are absent.** Arrivals are independent Poisson draws, with no redial or callback loops, no overdispersion or clustered callers, no after-call work, and no outbound-versus-inbound contention.

**Decision:** use SynthCCD as the *demand layer* and calibration source, and evaluate staffing plans in a separate discrete-event simulator (DES) whose mechanics we control.

*Caveat: these points come from SynthCCD's README and REALISMGUIDE.md, not its source code. Items 1, 2 and the dispatcher-delay behavior should be confirmed in the source (`generators/queueing.py` and the incident timing logic).*

## 2. Architecture

SynthCCD supplies the demand profile: arrival intensity λ by line, hour, day of week and season, plus durations and the priority mix. The truth engine (DES) takes that demand, a staffing roster, and scenario knobs (dispersion, redial, callback) and produces outcomes. Staffing arms see only a training-window observable log, produce a requirement curve, and a converter turns it into a roster that the DES evaluates.

SynthCCD never decides outcomes. The DES does.

## 3. Demand layer (from SynthCCD)

- Use SynthCCD's **expected** volumes (hourly profile, weekend and seasonal multipliers, per-line received volumes) as the intensity λ(t).
- Discard SynthCCD's generated abandonment and answer-time columns. The DES must produce those endogenously.
- Draw within-hour arrival times in the DES so the arrival process is a controlled experimental factor.
- Take call attributes (agency, priority, problem nature, phone duration including problem multipliers) from the incident table.
- Decide explicitly how calls map to incidents, since many calls never become incidents (non-emergency, abandoned, outbound).

## 4. Truth engine (DES)

### 4.1 Arrival scenarios (primary experimental factor)

1. **Poisson**, matching the generator.
2. **Overdispersed:** a Cox process with a gamma-distributed hourly rate multiplier; dispersion φ is the knob.
3. **Clustered:** each incident spawns 1 + Geometric(p) callers within a short window.

### 4.2 Caller behavior

- Each call gets a patience draw: exponential (matches Erlang-A) or Weibull/lognormal (realistic variant).
- Abandoned callers redial with probability p\_redial after a lognormal delay, creating feedback load.
- The PSAP calls back abandoned calls with probability p\_cb, at lower priority than inbound; callbacks consume handle time.
- Outbound calls consume calltaker time and compete with inbound.

### 4.3 Service

- Talk time is lognormal, taken from the generator's per-call durations.
- After-call work (ACW) is a separate lognormal.
- Optional load-dependent service-time compression.

### 4.4 Resources

- **Calltakers:** a pool by interval taken from the roster. Expand the rotation pattern into an on-duty schedule, then apply shrinkage (Binomial absences, breaks) and a handoff dip at shift change.
- **Dispatchers (phase 2):** a separate pool by discipline. Dispatch work follows the interview; unit travel and scene times stay exogenous from the generator.
- **Queue discipline:** 911 over non-emergency over callbacks, non-preemptive. A trunk capacity K produces blocked calls (the M/M/c/K case).

## 5. Staffing arms

Every arm implements one interface:

```python
def recommend(train_log, constraints) -> RequirementCurve   # agents per (dow, 15/30-min)
```

A shared converter turns the curve into a feasible roster using an integer program over shift templates (SynthCCD presets or custom). It either minimizes staffed hours subject to coverage ≥ requirement, or maximizes coverage under a fixed budget.

Proposed arms:

- Current baseline (null).
- Uniform or peak-hour heuristic (floor).
- Erlang C, with and without shrinkage.
- Erlang A.
- Custom queueing model with abandonment, redial and callback workload (M/M/c/K extension).
- Forecast-then-Erlang (forecasts from the training window).
- **Oracle:** simulation-optimization against the truth engine, giving the performance ceiling.

**Information fairness:** arms see only an observable log (counts, answer times, abandons). They do not see latent patience, scenario labels, or generator parameters, mirroring what a real PSAP has.

## 6. Experimental protocol

- **Data:** generate 3+ years. Train on years 1–2, test on year 3 so seasonality is held out. A rolling origin is the stronger variant.
- **Factors:** center size (rural, mid, large, using SynthCCD calibrations) × truth scenario × arm × budget level (e.g., 90%, 100%, 110% of baseline staffed hours).
- **Replications:** about 30 seeds with common random numbers. Pre-draw each call's arrival, patience, service, redial and callback decisions by call ID so arms face identical callers and differ only in staffing.
- **Metrics:**
  - NENA 90%/15 s and 95%/20 s compliance.
  - Abandonment rate, mean and p95 wait.
  - Callback backlog and time-to-callback.
  - Occupancy by interval and count of understaffed intervals.
  - **Model prediction error:** each model's predicted service level versus realized service level. This bears directly on how well Erlang-family models fit 9-1-1 data.
- **Analysis:** paired differences with confidence intervals, and rank stability across scenarios.
- **Pre-registration:** fix scenarios and metrics before viewing results so the truth engine is not tuned toward a preferred model.

## 7. Validating the engine

1. **Degenerate checks:** Poisson arrivals, exponential service, no abandonment must match Erlang C analytically. Adding exponential patience should match Erlang A, and adding K should match M/M/c/K. SynthCCD vendors scalar references in `tests/reference/` that can be reused.
2. **Plausibility:** at baseline staffing, compare the DES answer-time distribution to the generator's NENA-calibrated lognormal.
3. **Real-data anchoring:** if real PSAP logs are available, calibrate redial, callback and ACW parameters. Otherwise treat them as scenario sweeps.

## 8. Implementation notes

- **Scale:** a mid-size center is on the order of a million call events per simulated year, and the full factorial is thousands of runs. Prototype in SimPy for correctness, then port the core to numba or Rust, keeping the SimPy version as the test oracle.
- **Storage:** write call tables, plans, event logs and interval metrics to Parquet or DuckDB, keyed by run ID.

## 9. Build order

0. Harness and degenerate validation.
1. Baseline DES with Erlang C and Erlang A arms.
2. Redial and callbacks.
3. Overdispersion and clustering.
4. Dispatch stage.
5. Full factorial.

## 10. Risks and limitations

- Results describe model behavior under an assumed truth, not real PSAP performance. Calibrate against real data before generalizing.
- The generator has no trend or regime change, which makes forecast-driven staffing easy. Inject drift or surge events if forecasting is part of what is tested.
- Comparisons must be at equal staffed hours (or as a cost-versus-performance frontier), otherwise "more staff improves performance" is trivially true.
- Unvalidated claims about SynthCCD internals (section 1 caveat) should be checked in the source before design lock.

## 11. Open questions

- Are real redial and callback rates available for calibration, or should they be scenario sweeps?
