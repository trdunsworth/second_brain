---
type: reference
topic: Methods for determining dispatcher staffing per time unit in a 9-1-1 centre — workload-unit, concurrency, radio loading, cognitive load, and why the calculation differs from call-takers
date: 2026-10-13
status: active
tags:
  - staffing
  - dispatch
  - psap
  - 911
  - methods
  - workload
  - concurrency
  - radio
  - human-factors
---

# Dispatcher Staffing Methods

> Goal: the menu of methods for setting dispatcher numbers per time unit, why the calculation differs from call-takers, and which one actually answers "how much can a dispatcher control safely?"
> Literature base for [[Staffing_Dispatcher_Feasibility]]. Companion to [[Staffing_Workflow_Feasibility]] (call-takers).
> Related: [[Staffing_Sources]] · [[Staffing_Model_Reference]]

## Link status

🔗 verified open (HTTP 200 on 2026-10-13) · 🔒 publisher, may need access · 📖 book

---

## 1. Why dispatch is calculated differently

Call-taker work is counted in **calls × talk time**. Dispatch work is not, and the mismatch is structural:

| Unit of work | Measured as | Why it matters |
|---|---|---|
| **Incident** | 1 per CAD record | **Undercounts.** One structure fire is many assignments |
| **Response** | 1 per unit dispatched | The industry workload unit — see below |
| **Concurrent incident** | Open at any instant | What the dispatcher actually experiences |
| **Radio transaction** | One transmission | The physical hard limit (§4) |

The City of Monroe's public safety assessment makes the distinction explicitly:

> *"Dispatches/calls = the number of times a distinct incident was created. Conversely, responses = the number of times that an individual unit (or units) responded to a call. Responses will be used on all Station and Unit level analyses, which account for all elements of workload and performance."*
> 🔗 https://cdnsm5-hosted.civiclive.com/UserFiles/Servers/Server_10126506/File/City%20Hall/Departments/Police/City%20of%20Monroe%20Public%20Safety%20Assessment%2007.15.19.pdf

A **fan-out ratio** falls straight out — responses ÷ incidents. That ratio, not incident count, is the dispatch workload driver. Note also that Maine's PUC makes the complementary point for λ: *"Answering a 9-1-1 call can generate one or more CAD incidents."* 🔗

> This is the first-order reason Erlang C transplanted onto dispatch fails: the model assumes each unit of work is one customer and one server, when the real ratio is many-to-one and one-to-many in the same shift.

---

## 2. Family A — Workload-unit methods

### A1. Response-weighted busy time

Total busy minutes ÷ staffed dispatcher-hours = utilisation.

Monroe publishes per-agency figures: **police 21.3 min/response, EMS 16.4–30.5, fire 27.4–34.5**. The spread is the point — fire and EMS episodes run 60–100% longer than police. **A single blended mean hides the discipline split that actually drives staffing.**

### A2. Task-time / job-analysis workload

Decompose dispatch into measured tasks and sum. Two foundations:

- **POST statewide job analysis** — **121 core tasks across 8 job activity areas**, from 160+ agencies. The decomposition backbone. 🔗 https://post.ca.gov/portals/0/post_docs/publications/Dispatcher-Component_1.pdf
- **Portland BOEC (2017)** — measured it directly. *"Time required to dispatch and complete a CAD record"* ran **71.7 s** mean for law enforcement, **27.9 s** for officer self-initiated activity. The study also prices in *"CAD, Radio, and other workload-related variables"* — note radio, §4. 🔗 https://www.portland.gov/budget/performance/documents/staffing-study-and-plan-bureau-emergency-communications-april-2017/download

NENA reduces the same idea to "available working man-hours per telecommunicator" in its staffing worksheet. 🔗 (see [[Staffing_Sources]] Tier 6)

> **Strength:** physically honest, and it produces a *defensible* utilisation figure a budget committee will accept.
> **Weakness:** labour-intensive; time standards drift as CAD changes; and it measures *average* work, not *concurrent* burden — which is what actually degrades a dispatcher.

### A3. Busy-hours → FTE conversion

Always through the relief factor: `FTEs = seated positions × SRF`. NENA's worked example yields a **manning ratio of 4.74** (134 days off → 231 available → 1,848 hours). Skipping this step means "we need 4 dispatchers" is half an answer and no cost comparison is possible.

---

## 3. Family B — Concurrency: what can one dispatcher *safely* hold?

This is the family closest to "traffic a dispatcher can control safely," and it turns on a single parameter:

> ### σ — the number of incidents one dispatcher simultaneously holds open

| Method | How | Strength | Weakness |
|---|---|---|---|
| **B1 Percentile rule** | `s(t) = p95(concurrent open) ÷ σ_safe` | p95 comes straight from your data | **σ_safe is unknown** |
| **B2 Regression** | slope of concurrent load on staffing, across intervals | uses the full panel; yields a CI | assumes linearity |
| **B3 Peer benchmark** | compare to statewide median | external validation | assumes comparability |

### Concurrency is not free — and NENA says why

NENA's task overload document defines the phenomenon and then immediately corrects the folk model:

> *"The ability to handle the multitude of tasks performed by a 9-1-1 dispatcher is called 'human multitasking'. While the term 'multitasking' was originally coined to refer to a computer's microprocessor… 'human multitasking' or rather 'context switching' occurs when an individual is tasked with handling more than one task at the same time."*
>
> *"The use of the term 'multi-tasking' is a misnomer. The human brain performs 'context switching', in actuality, not performing tasks simultaneously but rather performing tasks one at a time."*
> 🔗 NENA-INF-037

Two consequences that fall directly out of that sentence:

1. **A dispatcher handling *n* incidents is not *n*× as productive.** Each additional incident adds context-switch cost, so effective capacity is sublinear.
2. **The sublinearity grows with load.** That is precisely Oregon's observed high-volume failure, and it means any fixed-ratio staffing rule is wrong at one end of the range.

### ⚠️ The research gap: σ_safe is not published

**There is no established, citable σ_safe for 911 dispatch.** Oregon's programme discovered the effect empirically — Erlang over-staffs at low volume, under-staffs at high — and responded with fudge factors (ten highest busy hours, volume doubled, +60 s wrap-up, 1 supervisor per 8 consoles) rather than by parameterising concurrency. 🔗 https://apps.oregonlegislature.gov/liz/2021R1/Downloads/CommitteeMeetingDocument/240934

Nobody has published the number. **Estimating it is the strongest available research contribution in this area**, and it is derivable from the SynthCCD panel already scoped in [[Staffing_Dispatcher_Feasibility]] §5.

**Recommended design:** estimate σ three independent ways and report the spread.
- From **regression** (B2) across the staffing panel
- From **task decomposition** (A2) — total active handling minutes ÷ event duration gives the implied concurrency directly
- From **the Oregon error** — if plain Erlang over-staffs at low volume by a factor *k*, then σ ≈ *k*

Agreement across three unrelated routes is what makes the result defensible.

---

## 4. Family C — Radio / air-time loading

The only method with a **hard physical ceiling**. No amount of hiring fixes it, and it is the constraint most staffing analyses omit.

### Capacity is simultaneous transmissions, not headcount

> *"Capacity is the number of simultaneous calls the system can handle. In other words the number of independent teams that can be talking at the same time."*
> 🔗 Tait Radio Academy, *Introduction to P25* — https://www.taitradioacademy.com/courses/intro-to-p25

Trunking exists precisely to raise that ceiling: frequencies are pooled and assigned by a controller rather than dedicated by discipline, and *"more than 50 radios can potentially be handled per channel."*

### Airtime is tracked as a first-class metric

New Mexico's statewide P25 system reports **100.23 hours/day of airtime** against 52,675 daily calls across 145 dispatch consoles and 820 talkgroups. 🔗 https://www.nmlegis.gov/handouts/STTC%20111622%20Item%203%20P25%20%E2%80%93%20Digital%20Trunked%20Radio%20System.pdf

### Phase 1 vs Phase 2 doubles capacity

**P25 Phase 2 TDMA puts two talkpaths on a 12.5 kHz channel** — the same staffing number can be infeasible on Phase 1 and comfortable on Phase 2. 🔗 https://project25.org/

### System design runs formal capacity models

County design reports calculate required channels against *"a probability distribution for the random nature in which calls are placed, call duration, number of calls per unit per hour"* — i.e. **a queueing model of the radio resource**, independent of headcount. 🔗 https://cdn.prod.website-files.com/66addb9ed7cc778a70846961/66afcd1ccb30cb40dd39a2b5_Marin20County20System20Final20Design20Report202010_04_29-1.pdf

> **Why this belongs in a staffing calculation:** staffing is not only a labour question. A centre can be correctly staffed on workload and still fail because the radio system is saturated. Portland's study lists CAD, **Radio**, and other workload variables as co-equal inputs for exactly this reason.

---

## 5. Family D — Cognitive workload (the "safely" constraint, measured)

| Source | What it offers |
|---|---|
| **NASA-TLX applied to emergency dispatchers** — *"Dispatch under pressure: An investigation into the cognitive workload of emergency dispatchers"* 🔒 https://www.sciencedirect.com/science/article/pii/S2307187725000859 | Direct measurement of cognitive load by incident type, with qualitative interviews |
| **NIST PSCR — *Voices of First Responders*** 🔗 https://www.govinfo.gov/content/pkg/GOVPUB-C13-1894d4e9e1f8549992cdb62628077db0/pdf/GOVPUB-C13-1894d4e9e1f8549992cdb62628077db0.pdf | ~200 interviews across 13 states; tracks how technology changes *"cognitive loads"* |
| **NIST PSCR — *Digital Dispatch*** 🔗 https://www.nist.gov/system/files/documents/2022/04/01/PSCR%20Digital%20Dispatch%202022%20Q1.pdf | Curated tooling and research inventory |
| **POST job analysis** 🔗 (§2 A2) | The 121-task inventory that makes cognitive load decomposable |

This family supplies the **upper bound on σ_safe**. If family B says the data permits concurrency 5, family D is what tells you whether 5 is survivable. Neither alone is sufficient.

---

## 6. Family E — Empirical benchmarks (and one to distrust)

**Usable:**
- **Statewide/peer median.** Minnesota's PEI report frames efficiency as *"number of calls per full-time equivalent dispatcher is at or above the state median."* 🔗 (see [[Staffing_Sources]] Tier 6)
- **Intra-day variation.** Portland recommended *"modify dispatcher deployments during the late-night hours, reducing the number of fixed-posts from 9 to 7"* — per-interval variation is expected, not a failure.
- **Self-reported workload surveys.** Weak alone; useful as a sanity check against the quantitative result.

> [!danger] Distrust the historical ratio
> **Events per dispatcher** is an *output* of past staffing, not a capacity limit. Using it as a target guarantees you reproduce whatever you were doing before — including understaffing. Minnesota's warning applies directly:
> *"A PSAP interested in measuring only efficiency… might have a relatively high number of calls per dispatcher but be lacking in the quality of its service."*
> Keep it as a descriptor. Never optimise it.

---

## 7. Family F — Queueing, adapted

Erlang C with the σ correction (`a/σ`), square-root staffing (`s = a + β√a`), and Erlang B for ρ ≥ 1 all still apply — but as **one input among several**, not as the method. Oregon is the cautionary case: running Erlang C as *the* staffing method mis-staffed at both tails of the volume range.

---

## 8. Recommendation: staff to the max of independent constraints

A dispatcher is bounded by several different things **simultaneously**. A single-formula answer will be wrong somewhere.

```
s(t) = max(
    p95_concurrency(t) / σ_safe,   ← cognitive cap   (Family B)
    radio_concurrency_cap(t),       ← physical cap    (Family C)
    workload_target_staffing(t),    ← soft objective  (Families A + E)
)

positions(t) = ceil(s(t))
FTEs = max(positions) × relief_factor
```

Then **shift-link** the interval requirements into a legal schedule, and report the frontier — more positions buys latency, fewer buys cost.

### If you only do one thing

> **Estimate σ_safe.** Every other method is missing it, it is genuinely uncharacterised in the literature, it is derivable from the panel you are already building, and estimating it well is a defensible original contribution. See §3 for the three-route design.

### Sequencing

1. **Family A** to get a defensible utilisation baseline and the discipline split
2. **Family C** to establish the physical ceiling — do this early, it can invalidate everything
3. **Family B** to locate the binding constraint and produce σ_safe
4. **Family D** to test whether the binding constraint is survivable
5. **Family F** as a cross-check, not the answer

---

## 9. Honest gaps in this note

| Item | Status |
|---|---|
| **NTIA/911.gov "Workforce Optimization"** | 🔒 https://www.911.gov/assets/Workforce-Optimization---A-Smarter-Solution-to-Resolving-911-Staffing-Struggles.pdf — **403 to automated fetch.** The search snippet suggests it argues that *"assessing PSAPs based solely on whether calls are answered, or incidents dispatched within time-defined industry standards will be insufficient."* That framing reinforces §8, but **I have not read the document** — treat this as unverified until someone opens it manually. |
| **FRA/Duke railroad dispatcher workload model** | 🔒 https://railroads.dot.gov/sites/fra.dot.gov/files/2024-09/Systems-Theoretic%20Report.pdf — 403. A systems-theoretic model of dispatcher workload under automation using cognitive task analysis. **Strong methodological analog, different domain.** Unverified. |
| **σ_safe** | Does not exist in the literature. §3 argues it should be estimated rather than looked up. |
| **APCO staffing models** | Portland references "APCO-based staff modeling." The APCO site did not resolve; I could not confirm whether APCO publishes a formal staffing method. **Open question.** |
| **Interruption-rate literature** | NENA references systematic reviews noting *"a lack of quality evidence and inconsistency in defining and measuring task load and workload."* The base literature is weak — which is part of why this is an open problem. |

---

## Status

- [x] Six method families documented with verified links
- [x] σ_safe identified as the central open parameter, with a three-route estimation design
- [x] Composite max-of-constraints formulation proposed
- [x] Distrust case stated for the historical ratio
- [ ] **Open the NTIA/911.gov workforce document manually** and revise §8 if it changes the framing
- [ ] Confirm whether APCO publishes a formal staffing method
- [ ] Add the fan-out ratio (responses ÷ incidents) to the Phase 1 panel spec in [[Staffing_Dispatcher_Feasibility]]

## Cross-links

- [[Staffing_Dispatcher_Feasibility]] — the plan this literature supports; add fan-out ratio to Phase 1
- [[Staffing_Workflow_Feasibility]] — the call-taker contrast
- [[Staffing_Sources]] — full bibliography with per-entry link status
- [[Staffing_Model_Reference]] — the queueing formulas, for context only here