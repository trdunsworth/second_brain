---
type: assessment
topic: Feasibility assessment and implementation plan for the PSAP staffing-model comparison workflow using SynthCCD demand data
date: 2026-10-13
status: active
tags:
  - staffing
  - feasibility
  - queueing
  - erlang
  - psap
  - 911
  - synthccd
  - implementation-plan
---

# Staffing Workflow — Feasibility Assessment & Implementation Plan

> Goal: decide whether this workflow is buildable, then plan it.
> **Proposed workflow:** pull a sample dataset from SynthCCD's call volume generator for a location → supply the number of personnel on shift → point various staffing models at that dataset, distilling the necessary parameters → calculate the staff each model recommends → reapply the staffing changes against the same dataset to see if simulation shows efficiency improves with each one.
> Related: [[Staffing_Dispatcher_Feasibility]] · [[Staffing_Model_Reference]] · [[Staffing_Sources]] (all links HTTP-verified 2026-10-13) · [[Staffing/README|index]] · `ErlangBandCFormulas.pdf`

## Verdict

> [!success] Feasible — but **step 5 does not close inside SynthCCD**
> Steps 1–4 are directly supported by SynthCCD today. Step 5 — *"reapply the staffing changes and see whether simulation shows efficiency improves"* — **cannot be done with SynthCCD as it currently stands**, because SynthCCD is a **data generator, not a queueing simulator**. It draws call answer times from a lognormal distribution scaled by an hourly load proxy; it does not run a queue of `s` servers competing for calls.
>
> The fix is small and clean: **keep SynthCCD as the demand generator (that is what it is good at) and add a discrete-event queueing simulator that consumes its call trace.** That is Phase 3 of the plan below.

| # | Workflow step | Feasible | Basis / gap |
|---|---------------|:--------:|-------------|
| 1 | Generate call-volume dataset for a location | ✅ | `--dataset all`, `--population` sets volume from population, `--start-date`/`--end-date` |
| 2 | Supply number of personnel on shift | ✅ | `shift_config.shifts[].calltakers` / `.dispatchers` — staffed positions per shift |
| 3 | Distil model parameters from the dataset | ⚠️ | Doable, but requires explicit decisions (see §4) and one assumption violation (non-exponential service time) |
| 4 | Compute the staff count each model recommends | ✅ | Closed-form with stable recursions; trivial computationally |
| 5 | Reapply staffing, simulate, measure improvement | ❌ **not alone** | **SynthCCD does not simulate queueing.** Needs an external G/GI/c+M simulator |

---

## 1. The headline finding: SynthCCD is a generator, not a simulator

This is the thing that decides the shape of the whole project, so it goes first.

From `SynthCCD/REALISMGUIDE.md` (lines 669–672), describing how answer time is produced:

> "The lognormal `mu` is first adjusted by the hour's load (`busy_factor`) via `answer_time_load_sensitivity`, then given per-hour random noise scaled by `answer_time_mu_noise_sd`. The noise keeps percentages from being identical every hour while **the load term keeps busy hours slower**."

So answer time is **drawn from a distribution whose parameters depend on an hourly load scalar**. It is not computed from an `s`-server queue.

What this means concretely:

| SynthCCD feature | Consequence for this workflow |
|---|---|
| `shift_config.shifts[].calltakers: 3` | Determines **which names** appear on incidents. Does **not** shorten answer time. |
| `answer_time_load_sensitivity: 0.25` | A **single global scalar** coupling load → answer time. Not derived from staffing. |
| `nine_one_one_answer_time_mu: 1.80` | A fixed lognormal shape parameter, not an emergent queue result. |

**If you raise `calltakers` from 3 to 6 and regenerate, the answer times will not improve** — because the model that produced them never consulted the staffing level as a queueing resource. The proposed loop therefore has no closing mechanism as things stand.

> [!warning] This claim is based on the documentation, not the source
> The SynthCCD folder in this vault contains documentation only (`README`, `USERSGUIDE`, `REALISMGUIDE`, `CHANGELOG`, `AGENTS`, `TODO`) — the `src/synth911gen3/` package is not present, and the GitHub repo `trdunsworth/psap-staffing-lab` returns 404 unauthenticated.
> **Action 0 of the plan is to confirm this in the code** by reading the answer-time generator. If there *is* a queueing loop that the docs under-describe, the project gets simpler. Don't take this on faith — check it first.

### The fix, in one line

**Split the roles.** SynthCCD generates the *demand process* (arrivals, service durations, abandonment, diurnal and day-of-week structure) — which is genuinely hard to do well and which SynthCCD already does. A small standalone simulator owns the *queueing dynamics* (`s` servers, FCFS, patience, abandonment). That is a well-trodden design and the simulator is maybe 150 lines of SimPy.

---

## 2. What each step actually requires

### Step 1 — Generate the dataset ✅

SynthCCD covers this directly, and unusually well for this purpose.

```powershell
uv run SynthCCD generate --dataset all --population 250000 `
  --start-date 2026-01-05 --end-date 2026-02-15 --format parquet
```

| Knob | Why it matters here |
|------|--------------------|
| `--dataset all` | Both CAD incidents **and** the hourly phone dataset |
| `--population` | **Derives phone volume from population** (calls per 1,000 residents per year) rather than from the row count — this is the "location" scale control the workflow needs |
| `--start-date` / `--end-date` | Sets the window; phone metrics emit **one row per hour** across it |
| realism YAML | Abandonment rates, diurnal weights, answer-time parameters, `shift_config` |

The **phone dataset** (one row per hour) carries exactly the aggregate the analytic models need:

```
nine_one_one_calls_received        nine_one_one_calls_abandoned
non_emergency_calls_received      non_emergency_calls_abandoned
outbound_calls_placed             hour_of_day
```

…plus **percent-answered columns bucketed at `answer_time_thresholds: [10, 15, 20, 40]`** seconds.

> [!tip] That 15-second threshold is not a coincidence
> The **UCA/ECaTS minimum standard** for PSAPs uses a **95% service level with a 15-second answer target**. SynthCCD's default bucketing already straddles it. Keep that threshold — it makes results directly comparable to the compliance metric real PSAPs are held to.

**Location is a parameter, not a hardcode.** `--population` plus a geography/zone setting (URBAN / SUBURBAN / RURAL) gives you a defensible "location" without hand-editing data.

### Step 2 — Supply personnel on shift ✅

This is a first-class concept in the config, and it already models calltakers and dispatchers as **separate pools**:

```yaml
shift_config:
  name: "2x12h-4shift-14day"
  rotation: [1, 1, 2, 2, 1, 1, 1, 2, 2, 1, 1, 2, 2, 2]
  shifts:
    - { name: A, label: DAY,   start_hour: 6,  end_hour: 18, rotation: 1, calltakers: 3, dispatchers: 2 }
    - { name: C, label: NIGHT, start_hour: 18, end_hour: 6,  rotation: 1, calltakers: 2, dispatchers: 1 }
```

Every incident is tagged with the shift that was on duty (`shift`, `shift_label`, `shift_group`), so **per-interval staffing is recoverable from the data**. Presets available: `2x12h-4shift-14day` (default), `2x12h-2shift`, `3x8h-3shift`, `4x10h-4shift`.

> [!note] Staffing granularity vs. what the models produce
> SynthCCD staff by **12-hour shift**. The analytic models produce a requirement **per interval** (typically 15 or 30 minutes). You will need an **interval-to-shift aggregation step** (§5, Phase 2) — and that step is not trivial, because it is where interval-level efficiency and fixed-shift reality actually meet.

### Step 3 — Distil the model parameters ⚠️

**Available directly:**

| Parameter | Source | Caveat |
|---|---|---|
| λ (arrival rate) | `nine_one_one_calls_received` per interval | Aggregate only from the phone file; **get the true arrival timestamps from the CAD file** (`call_start_time`) for anything needing sub-interval resolution |
| Abandonment rate | `nine_one_one_calls_abandoned / …_received` | Ready-made. Needed for Erlang A |
| Offered load *a* | λ · E[S] | — |

**Requires a decision (this is the fiddly part):**

| Decision | Options | Recommendation |
|---|---|---|
| What counts as service time for a calltaker? | `call_closed − phone_pickup` (talk time) vs. `first_unit_assigned − enters_queue` | Use **`phone_pickup → call_closed`** for the calltaker pool. Dispatchers get a separate series. |
| Interval length | 15 min (matches ECaTS) vs. 30 min vs. 1 hour (what the phone file gives) | Generate incidents and **aggregate to 15 min** for modelling |
| Which call types | 911 only, or 911 + non-emergency | **911 only** first. Mixing streams into one pool is a multiclass problem (see §6) |

> [!danger] The assumption violation to write down up front
> Erlang B and Erlang C are **M/M/s** models: Poisson arrivals, **exponential** service. SynthCCD draws service and answer times from **lognormal** distributions (`answer_time_sigma: 0.80` and the lognormal elapsed-time family).
>
> This matters less than it sounds, and the reason is worth understanding: the **Erlang-C insensitivity property** means that for the delay probability, the *shape* of the service-time distribution has far less influence than its **mean** — provided the variance is not extreme. Real call-centre service times are typically near-lognormal, so SynthCCD's choice is *more* realistic than the exponential the formulas assume.
> **But it is still an assumption violation, and it must be stated in any writeup.** The known direction of the error is that **Erlang C over-predicts delay when service time is under-dispersed relative to exponential** — see Garnett, Mandelbaum & Reiman (2002). So expect Erlang C's staffing recommendation to be *conservative*, and expect the gap between Erlang C and the simulated truth to be systematic rather than random.

### Step 4 — Compute the recommended staff count ✅

Trivially computable, and the recursions in `ErlangBandCFormulas.pdf` are numerically stable and O(s) rather than O(s²):

```
Erlang B   B(s,a) = ρ·B(s−1,a) / (1 + ρ·B(s−1,a)),   B(0,a) ≡ 1,   ρ = a/s
Erlang C   C(s,a) = B(s,a) / [1 − ρ(1 − B(s,a))],             valid only for a < s
Square-root (Whitt 2007)   s = a + β√a
```

> [!warning] Erlang C has a hard validity boundary
> **`C(s,a)` requires `0 < a < s`** — that is, utilisation ρ = a/s < 1. A PSAP peak interval on a fixed shift will routinely exceed that, and Erlang C returns nonsense there (division by zero in the `1−ρ` terms).
>
> Whitt is explicit about this in the source PDF: *"Since we may well have a ≥ s in loss systems, the Erlang B formula should be considered more fundamental."*
>
> **This is not a bug to work around — it is one of the findings.** The workload contains the interesting regime; handle `a ≥ s` explicitly (report Erlang B there, or fall back to the square-root rule) and **record how often it occurs**. If a large share of intervals land in overload, that is a headline result about PSAP staffing, not an inconvenience.

### Step 5 — Reapply staffing and measure improvement ❌ (not alone)

**Blocked by §1.** SynthCCD will not respond to a staffing change with a queueing outcome.

Once a simulator exists, this becomes the most valuable part of the project — and also the part where **methodological care matters most** (§3).

---

## 3. How to make step 5 mean something

This is where a staffing comparison usually goes wrong, so it is worth being explicit.

### The circularity trap

> *"I set `s` using Erlang C targeting 95% service level, then simulated and found 95% service level. The model works!"*

That is arithmetic, not evidence. If you optimise a model to hit a target and then measure that same target, you recover the target. Every model will "succeed" this way, including a deliberately broken one.

### Five design rules that fix it

| # | Rule | Why |
|---|------|-----|
| 1 | **Always carry the current/actual staffing as the control arm.** Nothing is reported without a baseline. | An improvement claim needs a comparison set |
| 2 | **Optimise on one metric, judge on others.** Set `s` against a target *service level*; then report *abandonment*, *average speed of answer*, *occupancy*, and *labour cost* — which were **not** used to choose `s`. | Prevents scoring a model on its own objective function |
| 3 | **Common random numbers.** Fix the arrival and service-duration draws; re-run every staffing scenario against that identical trace. | Removes arrival noise as a confounder — variance across arms is then attributable to staffing alone |
| 4 | **Replicate with independent seeds** and report confidence intervals. | One realisation of a stochastic system is not evidence |
| 5 | **Deliberately break the assumptions.** Re-run at peak load (ρ ≥ 1), with abandonment on, and with non-Poisson arrivals. | This is where the models **diverge from each other**, and divergence is the entire information content of the comparison |

### What "efficiency" should mean

Avoid a single scalar. A defensible metric set:

| Metric | Definition | Direction |
|---|---|---|
| Service level | % answered within **15 s** | ↑ (matches the UCA standard) |
| Average speed of answer | mean answer delay | ↓ |
| Abandonment rate | abandoned / received | ↓ |
| Occupancy | busy staff / staffed staff | keep near a sane band |
| Labour cost | Σ staffed positions × wage × interval | ↓ |

Report the **Pareto frontier**, not a winner. In practice a staffing rule that wins on service level usually loses on cost, and that trade-off curve *is* the deliverable.

### The comparison that has actual information in it

Because of rule 5, the interesting result is **not** "Erlang C works". It is:

> Under fixed, realistic demand — with lognormal service times, diurnal non-Poisson arrivals, and measurable abandonment — **which analytic rule lands closest to the realised operational optimum, and where does each one break?**

Prior expectations, from the literature:

- **Erlang B** handles `a ≥ s` and so survives overload intervals; but it is a *loss* model and does not model waiting at all.
- **Erlang C** is what PSAPs actually use (via ECaTS) but is **systematically pessimistic** because it ignores abandonment — Robbins (2019) finds realised service levels always land below Erlang C's prediction.
- **Square-root (Whitt 2007)**, `s = a + β√a`, is an asymptotic rule; robust for large systems, less reliable at small PSAP scale.
- **Erlang A** (`M/M/s+M`) models abandonment properly but is harder to solve — and per Robbins, needs care at high utilisation.

---

## 4. Scope decisions to make before coding

| Question | Options | Default if undecided |
|----------|---------|----------------------|
| Which pool? | Calltakers only / dispatchers only / both | **Calltakers only** — this is what ECaTS counts, and it is the pool the formulas apply to cleanly |
| Which stream? | 911 only / 911 + non-emergency | **911 only** |
| Interval | 15 min / 30 min / 1 hour | **15 min** (aligns with the 15-second answer standard) |
| Horizon | 1 week / 1 month / 1 year | **4 weeks** — long enough to cover all day-of-week effects |
| "Location" | `--population` + zone type | One mid-size city, URBAN, ~250k population |

---

## 5. Implementation plan

Five phases. Phases 1–2 are pure analysis and need no simulator; Phase 3 is the build; Phases 4–5 are the experiment.

### Phase 0 — Verify the SynthCCD finding ⚱️ *(half a day)*

1. Read the answer-time generator in `synth911gen3` (the `phone_metrics` section). Confirm there is no `s`-server queue behind `busy_factor`.
2. Confirm the exact timestamp semantics in the CAD schema for talk time.
3. **If there is a hidden queue**, stop and re-scope — Phases 3–5 shrink dramatically.

**Exit criterion:** a written answer to "does SynthCCD answer time respond to staffed positions?" with the code path cited.

### Phase 1 — Demand characterisation 📊 *(1–2 days)*

Generate a 4-week dataset at 15-minute resolution and profile it *before* modelling:

```powershell
uv run SynthCCD generate --dataset all --population 250000 `
  --start-date 2026-01-05 --end-date 2026-02-01 --format parquet `
  --params config/staffing_lab.yaml
```

Produce, and keep as a reusable artifact:
- λ(t) per 15-min interval, by day-of-week
- Distribution of service time (calltaker talk time) — mean, **CV**, and a fit
- Observed abandonment rate, and **patience distribution** if derivable
- **Utilisation profile ρ(t) = a(t)/s(t)** under current staffing — this is the first deliverable in its own right
- **Count of intervals with a ≥ s** (the Erlang C validity boundary)

**Exit criterion:** a profile document that already tells you whether Erlang C is even applicable at peak.

### Phase 2 — Analytic model layer 📐 *(2–3 days)*

Pure functions, no dependencies beyond `scipy`:

```python
def erlang_b(s: int, a: float) -> float: ...      # B(s,a)  — valid for all a >= 0
def erlang_c(s: int, a: float) -> float | None:    # C(s,a)  — None if a >= s
def square_root(a: float, beta: float) -> int: ... # s = a + beta*sqrt(a)
def marginal_analysis(a, cost_s, cost_delay): ...  # Harel (1990)
```

Each model exposes `required_staff(intervals, target) -> list[int]`, one staffing level per interval.

**Aggregation:** per-interval requirements must be converted to shift-legal schedules. Two documented options — take the max over each shift (safe, overstaffs), or a p95/p99 rule (cheaper, occasionally understaffs). **Report both**; the difference between them is itself a finding.

**Exit criterion:** a table of recommended `s(t)` per model per interval, and the count of intervals each model had to punt on.

### Phase 3 — The simulator 🔧 *(3–5 days)*

New module in `psap-staffing-lab`. SimPy, ~150 lines:

- **Demand** is exogenous — arrival times and service durations read from the SynthCCD CAD trace and held **fixed** across every scenario (common random numbers).
- **Queueing** is the part SynthCCD lacks: `s` servers, FCFS, caller patience `θ` with abandonment.
- Model it as **G/GI/c+M**, not M/M/c+M — SynthCCD's arrivals are non-Poisson (diurnal, day-of-week), and pretending otherwise would defeat the purpose.
- Output: per-run service level, ASA, abandonment, occupancy, backlog.
- Seedable, and it must be — see rule 4.

**Exit criterion:** the simulator reproduces the published behaviour on a textbook case (e.g. match Whitt's Erlang B/C values for `B(10,10) ≈ 0.215`). This is the unit test that earns trust.

### Phase 4 — The experiment 🧪 *(3–5 days)*

```
Arms:  baseline (current staffing)
       Erlang B       → s(t)
       Erlang C       → s(t)          [record punted intervals]
       Square-root    → s(t)
       Oracle         → the s(t) minimising realised cost at target SL
                                                    ← the benchmark the others chase
```

For each arm × each of ≥ 20 seeds: run the simulator, collect the §3 metric set.

Report: mean ± 95% CI per arm, a **Pareto frontier** (service level vs. labour cost), and a per-interval breakdown showing **where each model breaks** — especially across `a ≥ s`, high-abandonment, and peak intervals.

**Exit criterion:** a results table plus a Pareto plot where each model's failure mode is visible.

### Phase 5 — Write-up 📝 *(2–3 days)*

State plainly:
- the assumption-violation log (lognormal service, non-Poisson arrivals, abandonment, multi-pool)
- the circularity controls actually applied
- **that SynthCCD is synthetic, so this validates *models against each other*, not against reality** (§6)

---

## 6. Limitations to state up front

These are not obstacles to the work — they are the boundaries of what the result can claim.

| # | Limitation | Consequence |
|---|-----------|-------------|
| 1 | **SynthCCD is a generator, so there is no independent ground truth.** It produces demand from a config you chose. | You can compare **rules against each other**. You **cannot** validate any of them against a real PSAP. Do not let the conclusion drift into "Erlang C is validated." |
| 2 | **Service time is lognormal, not exponential** | Erlang B/C are approximations. Expect a *systematic* direction of error, not noise |
| 3 | **Arrivals are non-Poisson** | Assumes independence; the diurnal + day-of-week structure violates it |
| 4 | **Single-pool simplification** | A real PSAP has calltakers *and* dispatchers with different service distributions. ECaTS counts calltakers only — say so explicitly |
| 5 | **Steady-state formulas on time-varying demand** | Erlang B/C are stationary. Applying them to a diurnal profile interval-by-interval is standard practice *and* a known misuse. Whitt (2016) covers the correct treatment |
| 6 | **Synthetic = clean** | No real-world messiness: no sick calls, no short-notice absences, no system outages, no multi-channel (text/chat) contamination |

> [!tip] Limitation 1 is the one to get right
> The honest framing is: **"Under controlled synthetic demand with known properties, the relative performance of N staffing rules can be measured and compared."** That is a real and useful result. **"Model X is the best way to staff a PSAP"** is not something this design can support, and the write-up should say so before a reader does it for you.

---

## 7. Decision log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-10-13 | Scope limited to **step one** of the broader project | Step two's plan to be built separately |
| 2026-10-13 | 5-phase plan, simulator deferred to Phase 3 | Phase 0 may invalidate the need for it |
| 2026-10-13 | 911 stream, calltaker pool, 15-min intervals as defaults | Aligns with ECaTS/UCA practice; narrow first, widen later |

## Status

- [x] Feasibility assessed per workflow step
- [x] SynthCCD capability gap identified (§1)
- [x] Implementation plan drafted (5 phases)
- [x] Limitations and circularity controls documented
- [ ] **Phase 0** — verify the answer-time generator in source
- [ ] Phase 1 — demand characterisation
- [ ] Phase 2 — analytic model layer
- [ ] Phase 3 — simulator
- [ ] Phase 4 — experiment
- [ ] Phase 5 — write-up