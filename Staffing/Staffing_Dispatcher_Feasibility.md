---
type: assessment
topic: Feasibility assessment and implementation plan for a dispatcher-side PSAP staffing study using SynthCCD event data — concurrency, saturation, and event replay
date: 2026-10-13
status: active
tags:
  - staffing
  - feasibility
  - dispatch
  - psap
  - 911
  - queueing
  - synthccd
  - implementation-plan
---

# Dispatcher Staffing Study — Feasibility & Implementation Plan

> Goal: assess whether SynthCCD can generate an event dataset that supports a dispatcher staffing study, identify the correct metrics, and plan the replay experiment.
> **Step 2 of the project.** Step 1 (call-takers) is [[Staffing_Workflow_Feasibility]]. Next is the forecasting experiment.
> Related: [[Staffing_Dispatcher_Methods]] (the literature base for the methods below) · [[Staffing_Model_Reference]] · [[Staffing_Sources]] (all links HTTP-verified 2026-10-13) · [[Staffing/README|index]]

## Verdict

> [!success] Feasible — and **more tractable than the call-taker study**
> All of the nine requested metrics are derivable from SynthCCD's call-by-call CAD data with deterministic group-by and interval arithmetic — no simulation required. The replay is *also* easier here, because dispatcher work is **persistent intervals**, so concurrency is computable exactly rather than stochastically.
>
> **But the headline finding is uncomfortable and worth stating plainly: the models you want to compare are the wrong shape for dispatchers, and the industry already knows it.** Erlang C assumes a queue, and dispatchers have no queue. Erlang C also assumes one server per customer, and dispatchers *share* incidents. Oregon's state 9-1-1 programme found empirically that Erlang fails at **both** ends of the volume range. That is not a bug in your plan — it is the most interesting thing the study can report.

| # | Requested step | Feasible | Basis / gap |
|---|---------------|:--------:|-------------|
| 1 | Generate a dispatch event dataset | ✅ | Full lifecycle present: `call_start` → `first_unit_assigned` → `last_unit_cleared` → `call_closed` |
| 2 | Derive the nine requested hourly metrics | ✅ | Deterministic — group-by plus interval arithmetic |
| 3 | Identify appropriate staffing metrics | ✅ | Supplied in §3, sourced |
| 4 | Replay events under recommended staffing | ⚠️ | **Split.** Interval replay works exactly; queueing dynamics still need a simulator |

---

## 1. Why dispatchers are a different problem from call-takers

The Step 1 study used Erlang B/C/A. Those are **queueing** models. Dispatch is not a queue:

| Property | Call-taking | Dispatching |
|---|---|---|
| Can work be *rejected*? | Yes — caller abandons (Erlang A's θ) | **No.** Every event gets handled |
| Is there a waiting line? | Yes | Effectively no — events are persistent work items |
| Service time | Minutes on the phone | **Hours** — the whole event duration |
| One customer : one server? | Approximately | **No** — one dispatcher watches many open incidents |
| Natural service metric | % answered within 15 s | **Max concurrent load / time-to-assign tail** |

Two consequences fall straight out:

1. **A service-level target is nearly meaningless for dispatch.** Nobody abandons because the dispatcher is busy; the event just waits. "95% within 15 seconds" was never a dispatch goal. The real measures are *how many simultaneous incidents a dispatcher can carry* and *how quickly the first unit gets assigned*.
2. **Erlang C's central assumption is violated.** It is an `M/M/s` model — one server per waiting customer. A dispatcher handling four open incidents breaks that.

> [!danger] Oregon found Erlang fails at **both** tails — this is the key external evidence
> Oregon's State 9-1-1 Programme ran its own correction ("Oregon Erlang") precisely because base Erlang C mis-staffed their centres:
>
> **Too few at low volume?** No — *too many*. Their words: *"Erlang will tell you that two ten-minute phone calls require three phones. Common sense tells you that 3 phones are not needed for 2 phone calls."* Erlang cannot see the multitasking effect.
>
> **Too few at high volume?** *"At high call volumes the probability math has less impact, and the formula simply fits as many phone calls as it can at each phone… this explained why the Erlang formula significantly reduces CPE allocations at the busiest centers."* For 71% of statewide 911 calls, their corrected allocations were **46% lower** than prior allocations.
>
> Oregon's corrections are all **fudge factors laid on top of a model that doesn't fit the domain**: average of the **ten highest busy hours** over 18 months; **call volume doubled** for abandoned calls; **+60 seconds** added for transfers, referrals and wrap-up; **one supervisor workstation per eight eligible workstations**.
>
> Read that list as a list of unmodelled phenomena. That is your study's contribution: *replace the fudge factors with parameters estimated from the data.*

---

## 2. SynthCCD data sufficiency

### Does it have the lifecycle? ✅

From `AGENTS.md`, the incident timestamps are:

```
Call Start Time
Time Phone Pickup
Time Call Enters Queue
Time First Unit Assigned      ← dispatch moment
Time Unit Enroute
Time Unit Arrived
Time Last Unit Cleared        ← field work complete
Time Call Closed              ← event end
```

Plus: `agency` (LAW / FIRE / EMS), `priority`, `dispatcher`, `calltaker`, `shift`, `shift_label`, `shift_group`, and elapsed-seconds fields. `REALISMGUIDE.md` names a `dispatch_mean` distribution — *"Queue to unit assignment"*.

Every quantity the study needs is present:

| Study quantity | SynthCCD source |
|---|---|
| New events per interval | `call_start_time` binned |
| Event open interval | `call_start_time` → `call_closed` |
| Assignment latency | `time_call_enters_queue` → `time_first_unit_assigned` |
| Field response duration | `time_first_unit_assigned` → `time_last_unit_cleared` |
| Dispatchers on shift | `shift_config.shifts[].dispatchers` |
| Discipline mix | `agency` |
| Complexity | `priority`, `problem_nature` |

### The one gap that matters ⚠️

**SynthCCD assigns exactly one dispatcher per incident.** The columns are singular (`Calltaker and Dispatcher`), so there is no representation of:

- multiple agencies on one incident (Fire + EMS + Police on a structure fire)
- two dispatchers on a single complex incident
- the **context-switching penalty** that makes concurrency non-free

This is the gap, and it is also the study's main subject. §3.2 explains why.

> [!note] Also: the shipped default is not a realistic PSAP
> The default `shift_config` staffs **2 dispatchers** on a 12-hour shift. Real centres staff considerably more (Oregon's smallest example, ~30 calls/hour at 189 s duration, still lands around 2–3 minimum seated positions, but with a 4.74 **manning ratio** on top for 24×7 coverage). Configure a realistic centre before drawing any conclusion, and state the configuration.

---

## 3. The metrics — your nine, plus what the models need

### 3.1 Your nine requested metrics ✅ all derivable

| # | Metric | Derivation | Staffing-model role |
|---|---|---|---|
| 1 | Day of year | derive from `call_start_time` | Seasonal / day-of-week structure |
| 2 | Hour | bin of `call_start_time` | Diurnal profile |
| 3 | **Open at start of hour** | running count of `start ≤ t < close` | — (stock variable) |
| 4 | **New events** | count of `call_start` in interval | **λ** |
| 5 | **Closed in hour** | count of `call_closed` in interval | **throughput** |
| 6 | **Open at end of hour** | running count | **N** — number in system |
| 7 | **Dispatchers on shift** | `shift_config` via `shift_group` | **s** |
| 8 | **Saturation rate** | new events ÷ dispatchers | ⚠️ see below |
| 9 | **Mean time open per event** | mean of (`call_closed` − `call_start`) | **E[S]** |

```
# Sketch — interval arithmetic, no simulation
open_at_start = (opened_so_far - closed_so_far) at t0
opened   = df[df.call_start .between(t0, t1)]
closed   = df[df.call_closed.between(t0, t1)]
open_end = open_at_start + len(opened) - len(closed)     # balance identity
```

> [!success] Your instinct was right — those nine metrics *are* the Erlang parameter set
> They are the standard queueing quantities packaged in event-replay form, and **Little's Law ties them together**:
> ```
> mean events open  =  λ × E[time open]  =  a
> ```
> That is, the mean number of simultaneously-open events in an interval **equals the offered load in erlangs**. So metric 6 (or the interval mean of metric 3/6) gives you `a` directly, and metric 9 gives `E[S]` from which `μ = 1/E[S]` follows.
>
> **The balance identity `open_end = open_start + new − closed` is also a free data-quality check.** Any interval where it fails to hold exactly means events have durations you have not accounted for (open-ended, merged, or duplicate). Run it before anything else.

### 3.2 The missing centrepiece: concurrency σ

The metric that no standard formula contains, and the one that decides everything:

> **σ = the mean number of incidents one dispatcher holds open simultaneously.**

With it, the corrected offered load is:

```
a_corrected = λ × E[time open] / σ
```

Oregon's "Erlang says you need 3 phones for 2 calls" complaint is precisely the error of assuming **σ = 1**.

**Estimating σ from data is the core contribution of this study.** Three candidate estimators, cheapest first:

| Method | How | Strength | Weakness |
|---|---|---|---|
| **Event-per-dispatcher ratio** | max concurrent open events ÷ dispatchers on shift | Trivial; directly interpretable | Conflates *ability* with *actual practice* |
| **Little's Law inversion** | σ = (λ·E[time open]) ÷ (mean number of dispatchers actually busy) | Uses your metric 8 directly | Needs a measure of *busy* time per dispatcher, not just open events |
| **Regression / structural** | Regress concurrent load on s across intervals; the slope *is* σ | Uses the full panel; robust to level differences | Assumes linearity; needs enough variance in s |

> [!tip] The third is the strongest and uses the panel you're building anyway
> Across many hours with varying staffing, regressing "mean concurrent open events" on "dispatchers on shift" gives an empirical σ with a confidence interval. It also degrades gracefully — if the slope comes out near 1, multitasking is negligible; near 4, dispatchers are carrying four incidents each. **Either answer is informative**, and that is what makes this a study rather than a formula plug-in.

### 3.3 ⚠️ Saturation rate is a trap as an optimisation target

You listed "saturation rate (number of events per dispatcher)" as a metric to trap. Trapping it is right. **Optimising it is wrong.**

Minnesota's Public Education and Improvement Commission, on PSAP performance measurement, warns:

> *"A PSAP interested in measuring only efficiency might have a relatively high number of calls per dispatcher but be lacking in the quality of its service."*

Events-per-dispatcher rises when staffing falls. Treating it as the objective therefore rewards understaffing — and Oregon independently found Erlang *under*-staffs exactly where workload is heaviest.

**Keep metric 8 in the dataset as a descriptor, never as the thing you optimise.** The Minnesota report's efficiency measures are explicitly meant to be paired with outcome measures and compared against a centre's *own* baseline, never across centres.

### 3.4 Metrics to add

| Metric | Why |
|---|---|
| **Max concurrent open events per interval** | The empirical staffing floor. More useful than any hourly average |
| **p95 / p99 concurrent load** | Peaks drive staffing, not means |
| **Time-to-first-unit-assigned: mean and tail** | The only true "service level" dispatch has |
| **Utilisation ρ = a/s per interval** | Locates where the model is strained; count intervals at ρ ≥ 1 |
| **Unassigned backlog** | Events open with no unit assigned — the analogue of queue depth |
| **Relief factor / Manning ratio** | Converts seated positions to hired FTEs (see §4) |
| **Per-discipline splits** | Law / Fire / EMS have different durations *and* may be separate pools |
| **Fan-out ratio** (responses ÷ incidents) | **The dispatch workload driver.** Dispatch is measured in *unit responses*, not CAD records — see [[Staffing_Dispatcher_Methods]] §1. If SynthCCD only emits one incident per call, record this explicitly as a model boundary rather than leaving it implicit |

> [!tip] The fan-out ratio deserves its own panel column
> City of Monroe separates *"dispatches"* (incidents created) from *"responses"* (units dispatched) precisely because they are different workload units — and their measured busy-minutes differ by discipline by 60–100%. If the ratio varies by hour or by discipline, that variation is a staffing driver that a per-incident count cannot see at all.

---

## 4. The staffing models that actually fit dispatch

| Model | Fit | Rationale |
|---|---|---|
| **Concurrency percentile rule** | ⭐ **best fit** | Staff to the p95 (or p99) of concurrent open events ÷ σ. Directly matches how dispatch actually works |
| **Square-root (Whitt 2007)** `s = a + β√a` | Strong | Robust, handles ρ→1 gracefully, natively time-varying. Oregon's failure mode is precisely near ρ=1 |
| **Erlang C with σ correction** | ⚠️ industry baseline | `a/σ` then Erlang C. Reproduces what PSAPs do today — **the control arm** |
| **Erlang B** | Useful at ρ ≥ 1 | Stays defined in overload, where Erlang C does not |
| **Erlang A** | Marginal | Only earns its place if assignment genuinely queues. Test it — don't assume |
| **Plain Erlang C, σ=1** | ❌ **include deliberately** | As a *falsified* arm. Quantifies how much the σ correction is worth |

> [!tip] The falsified arm is what makes this a study
> Running σ=1 Erlang C and showing it over- or under-staffs by a measurable margin, then showing σ-corrected closes most of that gap, is a defensible empirical claim. Reporting only the best-performing model would be arithmetic.

### Relief factor — the step everyone forgets

Your metric 7 is *dispatchers on shift* — **seated positions**. Real headcount is positions × a relief factor, because someone must cover breaks, leave, training and sickness.

NENA's staffing report derives a **Manning Ratio** from available working hours: 134 days off (holidays, vacation, personal, training, conference, sick) → 231 days available → ×8 h = **1,848 hours**, giving a ratio of **4.74**. Stated as:

```
Required Line FTEs = Minimum Seated Positions × SRF
   e.g.  6 × 5.41 = 32.46 ≈ 33 FTEs
```

Include this. Without it, a "we need 4 dispatchers" result is half an answer, and no comparison to a real PSAP budget is possible.

---

## 5. Implementation plan

### Phase 0 — Confirm and configure ⚙️ *(1 day)*

1. Reuse the Step 1 finding: verify SynthCCD does not couple assignment timing to staffing.
2. Verify the incident schema: confirm `call_closed` is always populated and terminal, and that no event spans outside the generation window.
3. **Set a realistic `shift_config`** — realistic seated positions, realistic discipline mix.
4. Decide: one pooled dispatcher pool, or separate Law/Fire/EMS pools. (CalOES 2024 found only 17% of California PSAPs dispatch all three disciplines, and cross-trained staff are scarce — pooling is a modelling assumption worth making explicitly.)

**Exit:** written confirmation of event-boundary semantics and the pooling decision.

### Phase 1 — Build the hourly panel 📊 *(2 days)*

This is the artifact the whole study — and the **forecasting experiment** — depends on.

Produce one row per interval with your nine metrics, plus §3.4 additions. Persist as Parquet with a documented schema.

Then run, before anything else:
- **The balance identity** (`open_end = open_start + new − closed`) per interval
- **Little's Law check**: `mean open ≈ λ × E[time open]`, and compare to the direct count
- Interval length: **15 min** (matches the 15-second answer convention from Step 1 and gives enough peak resolution)

**Exit:** a validated panel, plus a profile of concurrency by hour and day-of-week, and the count of intervals at ρ ≥ 1.

### Phase 2 — Estimate concurrency σ 🔬 *(2 days)*

The centrepiece. Produce:
- σ by each of the three methods in §3.2
- σ by hour-of-day and day-of-week — **concurrency is unlikely to be constant**, and that alone would explain why fixed-ratio staffing fails
- Confidence intervals; compare methods
- σ by discipline, if pools are separated

**Exit:** an σ estimate with an interval, and a clear statement of which method you trust and why.

### Phase 3 — Analytic model layer 📐 *(2 days)*

Reuse Step 1's Phase 2 code. Extend with the concurrency-percentile rule and the σ correction. Emit `s(t)` per model per interval.

**Exit:** recommended staffing per model per interval, side by side with the empirical concurrency floor.

### Phase 4 — Replay 🎬 *(3–4 days)*

Two layers, because they answer different questions:

**(a) Interval replay — exact, no simulation.** Given the event list and a staffing schedule `s(t)`, compute:
- max / p95 concurrent load vs. staffed positions
- **unassigned backlog** when open incidents exceed `s × σ`
- whether any interval was structurally infeasible

This is deterministic interval arithmetic. It gives the *capacity* verdict exactly.

**(b) Queueing replay — needs the simulator from Step 1.** Reuse the same SimPy harness. Queue only the **assignment step**: λ = events needing assignment, service = time-to-first-unit-assigned, `s` servers, patience θ. This measures the *latency* verdict — whether staffing changes shorten the assignment tail.

> [!note] Reuse across steps 1 and 2
> Phase 3/4 here is Phase 3/4 of [[Staffing_Workflow_Feasibility]] with a different service process. Build the simulator once, in a shared module, and parameterise the service definition. That is a real saving and it keeps the two studies comparable.

**Common random numbers:** fix the event list; vary only staffing.

**Exit:** per model, the distribution of backlog and assignment-latency across ≥20 seeds.

### Phase 5 — Experiment & write-up 🧪 *(3–4 days)*

Arms: empirical concurrency floor · concurrency percentile rule · square-root · Erlang C (σ-corrected) · Erlang C (σ=1, falsified) · oracle (the `s(t)` minimising realised cost at target latency).

Report per arm: seated positions, FTEs after relief factor, p95/p99 concurrency, backlog hours, assignment-latency tail, and cost.

**Present the frontier**, not a winner. As in Step 1, the models will trade positions against latency.

**Exit:** results table + frontier plot + a per-interval breakdown showing where each model fails.

---

## 6. Limitations

| # | Limitation | Consequence |
|---|-----------|-------------|
| 1 | **SynthCCD models 1 dispatcher per incident** | σ cannot be read off the data — it must be **estimated**, and the estimate is the study's main claim. Synthetic dispatchers never actually multitask |
| 2 | **No true queue in dispatch** | Erlang A is of marginal value; the queueing framing is largely borrowed. Be explicit that this is a capacity problem wearing queueing clothes |
| 3 | **Synthetic = no real-world messiness** | No sick calls, no overlapping radio traffic, no major incident surge, no mutual-aid collapse. Major-incident workload — precisely where dispatchers break — is absent |
| 4 | **Single event type granularity** | NENA task complexity varies hugely by incident type; SynthCCD's `priority` and `problem_nature` may not carry that |
| 5 | **Pooling vs. skill-based routing** | Modelling one pool assumes any dispatcher can take any incident. Real centres have certified specialisations and scarce cross-training |
| 6 | **Same ceiling as Step 1** | Synthetic demand has no independent ground truth. Claim *relative* model performance, not real-world validation |

> [!tip] Limitation 1 is also the opportunity
> Because SynthCCD cannot multitask, **your σ is not a number you inherited from the generator — it is something you inferred.** That makes the estimate genuinely yours, and gives the write-up a real claim: *"we estimated concurrency from event data and showed the standard correction materially changes the staffing recommendation."*

---

## 7. Forward link to the forecasting experiment

The Phase 1 panel is exactly what the forecasting step will need:

- **Target**: `s(t)` required, or one of your nine metrics
- **Features**: hour, day-of-year, day-of-week, lagged volume, rolling means
- **Horizon**: next interval, next shift

Building the panel now means step three starts from a validated artifact rather than raw events. Do not skip Phase 1's validation checks — forecasting a leaky panel wastes the whole step.

## Status

- [x] Feasibility assessed per requested step
- [x] Nine metrics confirmed derivable from SynthCCD
- [x] Appropriate model family identified (concurrency-led, not queue-led)
- [x] Implementation plan drafted (5 phases)
- [x] Literature base documented — [[Staffing_Dispatcher_Methods]]
- [x] Fan-out ratio added to the Phase 1 panel spec (§3.4)
- [ ] **Phase 0** — confirm schema, set realistic shift config
- [ ] Phase 1 — build and validate the hourly panel
- [ ] Phase 2 — estimate σ
- [ ] Phase 3 — model layer
- [ ] Phase 4 — replay
- [ ] Phase 5 — experiment and write-up
- [ ] Forecasting experiment — next, on the Phase 1 panel