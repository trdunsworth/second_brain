---
type: index
topic: Staffing folder index — feasibility and implementation plans for PSAP call-taker and dispatcher staffing-model studies built on SynthCCD data
date: 2026-10-13
status: active
tags:
  - moc
  - staffing
  - queueing
  - feasibility
  - psap
  - 911
  - dispatch
  - synthccd
---

# Staffing — Index

> Goal: decide whether the proposed staffing-model comparison workflows are buildable, and plan them.
> **Start with [[Staffing_Workflow_Feasibility]]** (step 1, call-takers), then **[[Staffing_Dispatcher_Feasibility]]** (step 2, dispatchers) and **[[Staffing_Dispatcher_Methods]]** (the dispatcher literature base). [[Staffing_Model_Reference]] is the formula reference; [[Staffing_Sources]] is the annotated bibliography.

## The two workflows

**Step 1 — Call-takers** (queueing). Erlang B / C / A / square-root against a single pooled agent group.

```
SynthCCD call-volume generator, for a location
        │
        ▼  supply personnel on shift
   staffing baseline
        │
        ▼  distil λ, μ, θ from the data
   point each staffing model at it
        │
        ▼  compute recommended staff
   Erlang B │ Erlang C │ Erlang A │ square-root │ marginal
        │
        ▼  reapply against the SAME dataset
   does simulation show efficiency improving?
```

**Step 2 — Dispatchers** (capacity). Concurrency-led, not queue-led — see [[Staffing_Dispatcher_Feasibility]].

```
SynthCCD event dataset (call-by-call lifecycle)
        │
        ▼  hourly panel: open / new / closed / on-shift /
   saturation / mean time open   (your nine metrics)
        │
        ▼  estimate σ = incidents held per dispatcher
   ← THE centrepiece; SynthCCD models 1 dispatcher per incident
        │
        ▼  staff to the concurrency distribution
   concurrency rule │ square-root │ Erlang C (σ) │ Erlang C (σ=1)
        │
        ▼  replay the SAME event list
   backlog, assignment-latency tail, seated positions, cost
```

**Step 3 — Forecasting** (predictive). Point-forecast benchmarking plus conformal calibration, against a vendor claim. See [[Staffing_Forecasting_Experiment]].

```
SynthCCD volume series (911 + non-emg + abandoned, hourly)
        │
        ▼  rolling-origin CV (never a random split)
   point-forecast bake-off
   seasonal-naive │ ETS │ SARIMA │ Poisson GLM │ Prophet │ GBM │ ensemble
        │
        ▼  conformal layer
   split → normalised → CQR → EnbPI → SPCI
        │
        ▼  THE decisive measurement
   coverage stratified by hour-of-day and volume decile
        │
        ▼  staffing back-translation
   feed ŷ vs U_α through Erlang C → service level / cost frontier
```

## Verdicts

> [!success] Step 1 — feasible, with one structural change
> Steps 1–4 are directly supported by SynthCCD. **Step 5 is not** — SynthCCD generates answer times from a lognormal scaled by an hourly load proxy rather than simulating an `s`-server queue, so staffing changes do not propagate into queue outcomes.
> **Resolution:** split the roles. SynthCCD generates the *demand*; a small standalone **G/GI/c+M discrete-event simulator** owns the *queueing dynamics*.

> [!success] Step 2 — feasible, and more tractable than step 1
> All nine requested metrics are deterministic — no simulation needed to derive them. Replay splits into an **exact interval layer** (capacity, no randomness) and a **queueing layer** (assignment latency only).
> **But the models are the wrong shape for dispatch, and the industry already knows it.** Erlang C assumes a queue (dispatch has none) and one server per customer (dispatchers share incidents). Oregon's state programme found empirically that it mis-staffs at **both** ends of the volume range — over-staffing at low volume, under-staffing at high.

> [!success] Step 3 — feasible, with one reframing
> **Horizon confirmed: one-shot 168-hour blocks**, each day/hour a separate forecast. Every mechanical piece works. **The change is conceptual: conformal prediction is not a better *point* forecast — it is an uncertainty layer.** The vendor's error is returning a point estimate where the operationally correct answer is an upper quantile; conformal is precisely the instrument that exposes that gap.
> **The hard part is conditional coverage.** Marginal guarantees are easy; peak coverage is the finding — and it is genuinely open.

| # | Step 1 step | Feasible | Gate |
|---|-------------|:--------:|------|
| 1 | Generate dataset for a location | ✅ | `--population` sets location scale |
| 2 | Supply personnel on shift | ✅ | `shift_config.shifts[].calltakers/.dispatchers` |
| 3 | Distil model parameters | ⚠️ | Needs explicit talk-time and interval decisions; lognormal ≠ exponential |
| 4 | Compute recommended staff | ✅ | Closed-form + stable recursions |
| 5 | Reapply and measure improvement | ❌ alone | **Requires the external simulator** |

| # | Step 2 step | Feasible | Gate |
|---|-------------|:--------:|------|
| 1 | Generate dispatch event dataset | ✅ | Full lifecycle: start → assigned → cleared → closed |
| 2 | Derive the nine hourly metrics | ✅ | Deterministic group-by + interval arithmetic |
| 3 | Identify appropriate metrics | ✅ | Adds σ (concurrency) as the centrepiece |
| 4 | Replay under recommended staffing | ⚠️ | Interval layer exact; latency layer needs the shared simulator |

## Start here

| You want… | Go to |
|-----------|-------|
| Step 1 verdict, the SynthCCD gap, the 5-phase plan | [[Staffing_Workflow_Feasibility]] ← **start** |
| Step 2 verdict, the concurrency finding, its 5-phase plan | [[Staffing_Dispatcher_Feasibility]] |
| How to actually set dispatcher numbers — six method families, σ_safe | [[Staffing_Dispatcher_Methods]] |
| Step 3: test the vendor's 168-hour forecast claim; conformal design | [[Staffing_Forecasting_Experiment]] |
| Formulas, parameters, and where each model breaks | [[Staffing_Model_Reference]] |
| The bibliography, annotated with why each source matters | [[Staffing_Sources]] |

## The notes

| Note | What it is |
|------|------------|
| [[Staffing_Workflow_Feasibility]] | **Step 1.** Per-step verdict; why SynthCCD can't close the loop; circularity controls; 5-phase plan; limitations |
| [[Staffing_Dispatcher_Feasibility]] | **Step 2.** Why dispatch isn't a queue; the nine metrics and their derivation; σ as the centrepiece; Oregon's evidence that Erlang fails at both tails; 5-phase plan; forward link to forecasting |
| [[Staffing_Dispatcher_Methods]] | The dispatcher literature base: workload-unit, concurrency, radio loading, cognitive load — why the calculation differs from call-takers, and the composite max-of-constraints formulation |
| [[Staffing_Forecasting_Experiment]] | **Step 3.** Vendor claim decomposed into V1–V4; seven testable critiques (incl. convexity of C in *a*, provable from the local PDF; line-type mixture; correlated block errors); conformal reframed; marginal-vs-conditional coverage as the crux; point-forecast menu from the EMS literature; eight pre-registered hypotheses |
| [[Staffing_Model_Reference]] | Erlang B / C / A, square-root, marginal analysis — equations numbered to Whitt (2002), validity boundaries, parameter availability mapped to SynthCCD |
| [[Staffing_Sources]] | Eight tiers, incl. **NENA-REF-001**, **Oregon Erlang**, **EnbPI**, **SPCI**, **CQR impossibility**, **EMS demand-pattern accuracy** |
| `ErlangBandCFormulas.pdf` | Whitt (2002), IEOR 6707, Columbia — the local anchor source. ⚠️ Type3 font with no Unicode map: extract by rendering to image, not by naive parsing |

## Key findings to carry forward

1. **Erlang C is the incumbent standard, not an academic curiosity.** The UCA/ECaTS minimum standard for PSAPs *is* Erlang C at 95% service level / 15-second answer target — and it explicitly excludes dispatchers from the totals.
2. **Erlang C is undefined at ρ ≥ 1**, and PSAP peak intervals routinely exceed that. Whitt himself calls Erlang B "more fundamental" for that reason. The boundary is a finding, not an edge case.
3. **Erlang C is systematically pessimistic** because it ignores abandonment, which 911 callers exhibit in quantity (Robbins 2019).
4. **Service times here are lognormal, not exponential.** Less damaging than it sounds — Erlang C is insensitive to service-time *shape* near its mean — but it must be declared, and it biases the error in a known direction.
5. **Dispatch is a capacity problem, not a queueing one.** No rejection, no waiting line, service time measured in hours. The right metric is concurrent load, not answer speed.
6. **Concurrency σ is the missing parameter in every standard formula.** Oregon showed empirically that it dominates the staffing answer, then patched it with fudge factors. Estimating it from data is this study's contribution — and there is no published σ_safe to look up.
7. **Radio loading is a hard physical cap that headcount cannot fix.** Trunked capacity is concurrent transmissions; P25 Phase 2 doubles it. A centre can be correctly staffed on workload and still fail on airtime.
8. **Dispatch workload is counted in unit responses, not incidents.** The fan-out ratio (responses ÷ incidents) is the workload driver — see [[Staffing_Dispatcher_Methods]] §1.
9. **Saturation rate is a descriptor, never an objective.** Events-per-dispatcher rises when staffing falls; optimising it rewards understaffing. Minnesota's PEI report warns about exactly this.
10. **Seated positions ≠ headcount.** Apply the NENA relief factor / manning ratio before any cost or FTE comparison.
11. **Synthetic data has no independent ground truth.** Results can claim *"rules compared against each other"*; they cannot claim *"model X is validated."*

## Cross-links

- [[SynthCCD/README|SynthCCD]] — the demand generator both studies depend on
- `SynthCCD/REALISMGUIDE.md` — `shift_config`, `dispatch_mean`, answer-time lognormal, abandonment rates
- [[LinuxPlus_Resources]] — unrelated but the same discipline: build the environment before theorising

## Status

- [x] Folder indexed: 7 notes + the source PDF
- [x] Step 1 feasibility verdict + 5-phase plan
- [x] Step 2 feasibility verdict + 5-phase plan
- [x] Step 3 feasibility verdict + design with pre-registered hypotheses
- [ ] Step 1 Phase 0 — verify the answer-time generator in SynthCCD source
- [ ] Step 1 Phases 1–5
- [ ] Step 2 Phase 0 — confirm schema, set realistic shift config
- [ ] Step 2 Phases 1–5
- [ ] **Step 3 — confirm whether SynthCCD carries a line-type / wireless field** — gates H7
- [ ] Step 3 Phases 0–4