---
type: assessment
topic: Feasibility and experimental design for testing a vendor 168-hour telecommunicator staffing forecast — point-forecast benchmarking and conformal prediction on SynthCCD volume data
date: 2026-10-13
status: active
tags:
  - staffing
  - forecasting
  - conformal-prediction
  - erlang
  - psap
  - 911
  - experiment-design
  - feasibility
---

# Forecasting Experiment — Feasibility & Design

> Goal: test a vendor claim — *168 per-hour telecommunicator forecasts derived from call volume alone* — using SynthCCD data, standard point-forecast methods, and conformal prediction.
> **Step 3 of the project.** Step 1: [[Staffing_Workflow_Feasibility]]. Step 2: [[Staffing_Dispatcher_Feasibility]] / [[Staffing_Dispatcher_Methods]]. Next: build.
> Related: [[Staffing_Sources]] · [[Staffing_Model_Reference]]

## Verdict

> [!success] Feasible, with one reframing
> Every mechanical piece works: SynthCCD produces volume, standard methods produce 168-slot forecasts, and conformal prediction calibrates them. **The one change is conceptual: conformal prediction is not a better *point* forecast — it is an uncertainty layer, and it is the right tool for the job your vendor is getting wrong.**
>
> Their error is not a bad point forecast. It is **returning a point estimate where the answer requires an upper quantile.** Conformal is exactly the instrument that exposes that gap.

| # | Component | Feasible | Gate |
|---|-----------|:--------:|------|
| 1 | SynthCCD volume set for a location | ✅ | `--dataset phone`; hourly, 911 + non-emergency + abandoned |
| 2 | 168-slot forecasting harness | ✅ | Rolling-origin CV, never a random split |
| 3 | Standard point-forecast methods | ✅ | Well-benchmarked in EMS/ED literature |
| 4 | Conformal layer | ✅ | Split → EnbPI → SPCI, escalating |
| 5 | **Conditional coverage at peaks** | ⚠️ | **The hard part.** Marginal guarantees are easy; peak coverage is the finding |
| 6 | Staffing back-translation | ⚠️ | Inherits Step 1's SynthCCD limitation; analytical only is fine here |

**Horizon: resolved** — the vendor emits **one-shot 168-hour weekly blocks**, so this is the harder, fairer test. Split blocks are whole weeks throughout.

**Added from prior operational data:** ~77% of calls arrive on non-emergency lines, ~73% from portable devices. These sharpen the critique (C6) and add a testable structural claim about error correlation (C7).

---

## 1. The vendor claim, restated precisely

> Forecasts, per hour across a 7-day cycle (**168 predictions**), the **number of telecommunicators needed**, using **only call volume received (including abandoned)**, translating each volume prediction into personnel via **proprietary formulae**.

Decomposed into testable components:

| Component | Claim | Where it can break |
|---|---|---|
| V1 | 168-slot cycle is a sufficient output granularity | Fine structurally — but 168 *independent* points ignore shift-linking and relief factor |
| V2 | Volume **received incl. abandoned** is the right predictor | Workload heterogeneity; abandoned calls consume partial service |
| V3 | Volume → personnel is a well-defined translation | **Convexity** — staffing is superlinear in volume |
| V4 | A **point** forecast is a sufficient output | Staffing needs an upper quantile; under-forecast at peak = failed service level |

---

## 2. Seven testable critiques

### C1 — Volume is not workload 🔬

Workload is `λ × E[S]`, and **E[S] is not constant across calls.** A priority-1 multi-agency call with transfers and a long CAD entry consumes far more than a simple non-emergency call. Any volume→personnel map must assume a service time; if it uses a single historical mean, it silently discards:

- priority and problem-nature mix (SynthCCD carries both)
- transfers and referrals (Oregon adds **+60 s** explicitly for this)
- wrap-up time (ECaTS uses **10 s**)
- disposition differences (traffic stop vs. working fire)

**Test:** stratify workload by priority and disposition; show the spread. If it is wide, a volume-only mapping is mis-specified by construction. Oregon's explicit +60 s and ECaTS's 10 s wrap-up are the industry admitting the same thing.

### C2 — Staffing is superlinear in volume 🔬📐

This is the strongest and most rigorous critique, and **it is provable from the PDF already in this folder.**

`ErlangBandCFormulas.pdf` **Problem 13** asks: *"Show that C(s,a) is a convex function of a for 0 < a < s."* (proved via Lee & Cohen 1983; Grassman 1983).

Convexity of `C(s,a)` in `a` means the **elasticity of staffing with respect to volume exceeds 1**. A 10% volume over-forecast produces *more than* a 10% staff over-forecast, and the penalty grows as you approach saturation. Any volume→personnel translation inherits this curvature.

**Test:** plot `s(v)` for the vendor's mapping family and report `d log s / d log a` at representative loads. If it's > 1, small volume errors are amplified — which is the opposite of the "close enough" intuition vendors sell.

> This also means the critique is *not* "your forecasts are inaccurate." Even a perfect volume forecast mapped through a convex function produces a staffing number with the curvature baked in.

### C3 — Volume-only methods over-forecast systematically 🔬

A study of exactly this method class, across **7 EMS systems, 73 weeks, 61,152 hourly observations**, testing three "demand pattern analysis" constructs (average peak, smoothed average peak, 90th-percentile rank):

| Construct | Accurate (±1 call) | Overestimated | Median over-estimate |
|---|---:|---:|---:|
| Average peak demand | **13%** | **83%** | 4 calls (IQR 2–6) |
| Smoothed average peak | **10%** | **86%** | 4 calls (IQR 2–6) |
| 90th-percentile rank | **19%** | **74%** | 3 calls (IQR 2–5) |

The authors' conclusion is the quotable line:

> *"All three constructs accurately predicted peaks and troughs in call volume but **not exact call volume**… Call volumes were overestimated 83% of the time."*

🔗 https://pubmed.ncbi.nlm.nih.gov/17454807/

**Test:** if the vendor's approach is in this class, its 168 forecasts will over-forecast far more often than they will miss. That is directly measurable on SynthCCD data.

### C4 — Outbound is a multi-purpose channel, not a derived series 📐 *(revised twice — see the audit note)*

> [!warning] Correction history — read this before using anything below
> This critique has been revised **twice**, and both revisions were substantive rather than cosmetic. The revision history is recorded deliberately so the reasoning can be audited:
>
> - **v1 (withdrawn).** *Abandoned calls are not full load* — they consume only the capacity busy while the caller waited. **Wrong mechanism.** An abandoned call generates a callback, so it costs more, not less.
> - **v2 (withdrawn).** *The doubling models the callback obligation 1:1.* **Wrong model.** It treated outbound as a derived quantity from abandonment.
> - **v3 (current).** Outbound is a **multi-driver channel**. The callback link is real but is *one of several*, and Oregon's constant doubling is a crude aggregate heuristic rather than a callback model.

#### The corrected picture

Abandoned-call callbacks are **real and codified** — but they are one of at least four sources of outbound traffic:

| Driver of outbound | Coupling to inbound | Notes |
|---|---|---|
| **Abandoned-call callback** | Direct, lagged | Policy requirement in several states; the mechanism Oregon's doubling nominally targets |
| **Transfer within jurisdiction** | Direct | Often one call that becomes two legs |
| **Transfer to another jurisdiction** | Direct + **bidirectional** | A region-wide conservation relationship: transfers out ≈ transfers in + net |
| **Information-gathering calls** | Weak | Canon checks, records requests, agency verification, supervisor contact |
| Other | — | Paging, alerting, welfare checks, interfacility |

> **This breaks the causal structure I built §6 around.** Outbound is **not** derived from abandonment. It is a *separate target with its own drivers*, one of which is abandonment.

#### What this means for Oregon's doubling

If outbound is multi-driver, then doubling does not model the callback obligation — it is a **workload-scaling heuristic** that implicitly assumes the outbound burden *per call* is stable. That assumption is exactly what fails under load:

| Condition | Why a constant multiplier breaks |
|---|---|
| **Multi-jurisdiction / mutual-aid days** | Transfer volume rises sharply — a structure fire with three agencies is three transfers |
| **Major incidents** | The highest-complexity events generate the most transfers, information calls, and callbacks simultaneously |
| **Non-emergency surge** | Administrative callbacks rise, but transfers may not — the ratio shifts |

> **The original instinct was right; it just arrived by a different door.** A constant fudge factor is crude — but the reason is **incident-mix heterogeneity**, not abandoned-call service time. Transfers scale with *incident complexity*, which is a **C1-type heterogeneity argument**: a volume-only model cannot see it.

#### The revised test — and why my previous one would have failed

> [!danger] My v2 test would have produced a false negative
> I proposed regressing outbound volume on **lagged abandonment**. With outbound driven by four sources, that regression would show poor fit — and I would have wrongly concluded *"the multiplier is unstable, so the doubling is wrong."* The instability would have reflected **omitted drivers**, not an unstable callback rate.

**The correct test is incremental, not raw:**

```
outbound_t  ~  total_volume_t  +  abandoned_t  +  …
```

> **Does abandonment carry explanatory power for outbound *after controlling for volume*?** Both are high on busy days, so a raw correlation is confounded by volume. Only the **partial** relationship isolates the callback mechanism.
>
> - Abandonment significant given volume → **callback mechanism is real and quantifiable**; estimate the incremental multiplier
> - Abandonment not significant given volume → **outbound is dominated by transfers/information calls**, and the callback link is second-order

Either outcome is a finding. The second one is arguably more interesting.

#### Regulatory context

New York's adopted minimum standards require a PSAP to hold *"policy and procedure for handling silent, misdialed, prank, abandoned and disconnected 911 requests for service."* New Jersey additionally requires **ringback** — the ability to ring a hung-up telephone on a held circuit. The callback obligation is real and codified, but enforced as **policy rather than a blanket rule**, which is why states must state the adjustment explicitly.

> ### ⚠️ Measurement limitation — and this one is structural
> Decomposing outbound into its four drivers requires **call-type taxonomy on outbound calls**. That is precisely the granularity centres generally do *not* receive (§6.6). SynthCCD exposes `outbound_calls_placed` as a **count with no purpose taxonomy**.
>
> **So outbound cannot be decomposed in either dataset.** Treat outbound as a single aggregate target with abandonment as one available covariate — and say so as a stated boundary rather than implying a decomposition you cannot support.

### C5 — A point forecast is the wrong output 🔬

Staffing must be set for a **bad** day, not an average one. A point forecast plus a proprietary mapping returns a number with **no coverage guarantee**. On the day that matters — the peak — an under-forecast is a failed service level, and there is no way to see it coming.

**This is the gap conformal prediction closes, and it is where your instinct is right.**

### C6 — The line-type mixture compounds variance 📐 *(added from prior empirical work)*

Two measured priors from your own operational data, both of which make naive forecasts structurally rather than incidentally fragile:

| Priors | Share |
|---|---:|
| Calls arriving on **non-emergency** lines | **~77%** |
| Calls received from **portable (wireless)** devices | **~73%** |

Your reasoning — *"each layer of stochasticity compounds"* — is correct, and it is worth stating precisely why. Each layer adds variance, and **variance adds across layers rather than averaging**:

```
arrival dispersion (Poisson is already approximate; real PSAP arrivals are overdispersed)
  × mixture composition (the 27/73 landline-wireless split itself shifts within the week —
                          more wireless away from home, more landline overnight)
  × service-time heterogeneity (differs by line type, priority, disposition)
  × abandonment behaviour (wireless callers differ — mobile, in a vehicle, battery-limited)
  → then AMPLIFIED by the convexity of C(s,a) in a   ← C2
```

**The 73% wireless figure is the one with real forecasting bite, for a reason that is easy to miss:**

> [!danger] Wireless congestion censors the forecast target itself
> During a mass-casualty event the **radio access network saturates**. Call setup times lengthen and some attempts fail outright, so the **observed call count is a truncated version of true demand** — precisely when accuracy matters most. No forecaster, naive or otherwise, can recover demand that was never successfully signalled.
>
> So the failure is not only in the model. It is in the **measurement instrument**, and it is worst exactly at the peak.

Three further consequences worth testing:

| Consequence | Mechanism |
|---|---|
| **The stable component is smaller than it looks** | The forecastable ~27% landline share carries the clean home/work diurnal signature; 73% mobile dilutes it |
| **Location-accuracy tax on service time** | Wireless coordinates are less precise → more verification work per call → service time drifts upward. That is a *service-time* effect invisible in a volume-only model (C1) |
| **The two mixes are correlated, not independent** | Non-emergency calls are disproportionately cellular/VoIP. So the 77% and 73% layers are **correlated**, and correlated layers compound *worse* than independent ones |

**Design consequence:** model the **components, not the total.** Forecast 911 and non-emergency separately; forecast by line type if the data permits. A single series on the total is fitting a mixture whose composition and variance both drift inside the week.

> [!note] Does SynthCCD carry this?
> The phone dataset exposes 911 and non-emergency volumes separately 🔗, but a **line-type / wireless indicator is not evident in the documented schema.** If it is absent, that is a **model boundary to state explicitly**, not to paper over — and it means C6 can only be partially tested on synthetic data. Worth confirming in the source before committing to the design.

### C7 — The 168 points are not 168 independent forecasts 📐

This one falls directly out of the vendor's confirmed product design, and it changes the evaluation.

If the vendor forecasts **one-week blocks with each day/hour a separate forecast**, then errors arrive **correlated within the day**. A storm on Tuesday does not miss Tuesday's 00:00 and Tuesday's 09:00 independently — it misses **all 24 hours of Tuesday in the same direction**, and usually drags Wednesday too.

> **Therefore the 168 predictions are really ~7 correlated daily blocks, not 168 independent draws.** Aggregated MAE across 168 points systematically understates operational risk, because it averages away exactly the co-movement that destroys a roster.

This also tightens §4: conformal's **marginal** guarantee is further weakened when errors are serially correlated *and* the mixture regime shifts between the calibration and test blocks. It is an independent reason to prefer EnbPI/SPCI over plain split conformal.

**Test design:** report error at three levels — per-hour, **per-day block**, and **per-week total** — and stratify coverage by hour *and* by day. A method with acceptable per-hour error and unacceptable per-day error is a roster failure.

---

## 3. One reframing: what conformal prediction actually is

> [!warning] It is not a better point forecast
> Conformal prediction does not improve `ŷ`. It produces a **prediction interval or set** `[L(x), U(x)]` with a coverage guarantee. The user's framing — "combining all of the point forecasts" — is half right, and worth sharpening into three legitimate roles:

| Role | How it works | Value here |
|---|---|---|
| **1. Uncertainty wrapper** | Split conformal: pool residuals across a calibration set, take the (1−α) quantile, add to the point forecast | Cheap; gives a calibrated band on the incumbent model |
| **2. Calibrated combination** | Fit quantile regressors, conformalise the residuals (CQR) — or pool residuals *across the ensemble* | Uses the whole model set rather than picking one |
| **3. Quantile selection for staffing** | Staff to `U(x)` — the upper quantile — not to `ŷ` | **The decisive one.** Converts forecast error into an explicit, defensible policy |

> The strongest framing for the write-up: **the vendor returns `ŷ`; the operationally correct answer is `U_{0.95}(x)`. Conformal is how you get it.**

---

## 4. The hard part: marginal coverage is not peak coverage

This is the single most important technical caveat, and it decides whether the experiment succeeds.

Standard conformal guarantees **marginal** coverage:

```
P( Y ∈ C(X) ) ≥ 1 − α          averaged over the whole distribution
```

Exact **conditional** coverage `P( Y ∈ C(X) | X = x ) ≥ 1 − α` is **provably impossible** without strong assumptions. 🔗 https://arxiv.org/pdf/2305.12616

> [!danger] Why this is fatal for staffing specifically
> Error grows with volume, so the predictive distribution is widest exactly where the **peak** hours are. A method with 90% *marginal* coverage can easily deliver **60% coverage in the top decile** while over-covering quiet hours to compensate. Staffing decisions are made on peak. **An interval that under-covers at peaks is worse than no interval**, because it looks rigorous.
>
> So the experiment's central measurement is not overall coverage. It is **empirical coverage stratified by hour-of-day and by volume decile.** If stratified peak coverage tracks nominal, conformal is the win. If it collapses, that is the finding — and it means no distribution-free method can be trusted at peak without a conditional-coverage method.

### Conformal methods to escalate through

| Method | Guarantees | Note |
|---|---|---|
| **Split conformal** (Vovk et al. 2005) | Finite-sample **marginal** | Simplest baseline. Exchangeability assumption |
| **Normalised split** | Marginal, heteroscedasticity-aware | Divides residuals by an estimated conditional MAD |
| **CQR** (Romano et al. 2019) | Marginal, sharper | Conformalises fitted conditional quantiles |
| **EnbPI** (Xu & Xie 2021) 🔗 https://proceedings.mlr.press/v139/xu21h/xu21h.pdf | Approx. marginal; **handles non-exchangeability and non-stationarity** | Ensemble bootstrap; suits this data directly |
| **SPCI** (Xu & Xie 2023) 🔗 https://proceedings.mlr.press/v202/xu23r/xu23r.pdf | **Asymptotic conditional** | Sequential quantile model of residuals — the peak-coverage answer |
| **Localised / weighted conformal** (Guan 2023; Hore & Barber 2025; Gibbs et al. 2025) | Approx. conditional | Weights by proximity in hour-of-week feature space |

> **Why the non-exchangeable methods matter here:** time series violate the exchangeability assumption that split conformal rests on. Rescoring sequentially with a *conditional quantile model of past residuals* (SPCI) is the principled fix and is the direct answer to the peak-coverage problem. If you test one conformal method, test SPCI; if you test one beyond that, compare against EnbPI as the incumbent-friendly alternative.

---

## 5. Experimental design

### 5.1 Data (Phase 0)

```powershell
uv run SynthCCD generate --dataset all --population 250000 `
  --start-date 2026-01-05 --end-date 2026-05-04 --format parquet
```

**At least 4 months.** Reason: 168-slot cycles need multiple complete weeks, and conformal needs a *calibration* split disjoint from training and test.

| Series | Source | Use |
|---|---|---|
| `v_911` | `nine_one_one_calls_received` | Primary target — **~23% of volume** on your priors |
| `v_nonemg` | `non_emergency_calls_received` | **~77% of volume** — must be forecast separately, not folded in (C6) |
| `v_total` | sum | Aggregate only for comparability with the vendor's framing |
| `v_aband` | `*_calls_abandoned` | For the C4 experiment |
| *line type* | **likely absent** | Confirm in source. If unavailable, C6 is partially untestable and that is a stated boundary |

### 5.2 Horizon — ✅ **RESOLVED**

> [!success] Confirmed: one-shot weekly blocks, each day/hour a separate forecast
> The vendor emits a **168-slot block forecast for the coming week**, with each day/hour combination predicted independently *within* that block. This is interpretation **(b)** — the harder and fairer test. The rolling 1-hour-ahead case is no longer the primary target; if you want it, run it as a secondary comparison.

**What this changes about the design:**

- **Every method must be scored on its 168-hour block output**, not on incremental updates. No method may peek at data inside the block.
- **Seasonal-naive is the natural comparator** (same hour, previous week) — and on your priors it will fail, which is the prediction, not the surprise.
- **Errors must be aggregated at block level** — see C7. Per-hour error alone will flatter every method.

### 5.3 Point-forecast menu

| # | Method | Why it's on the list |
|---|---|---|
| 1 | **Seasonal naive** (same hour, previous week) | **The mandatory baseline.** The MEDIC benchmark — *"average of call rates in the same hour of previous weeks over the past month… said to be industry practice"* 🔗 https://arxiv.org/pdf/1806.10873 |
| 2 | Hour-of-week historical mean | The pure demand-pattern-analysis baseline |
| 3 | **Holt-Winters / ETS** (period 24 and 168) | Standard; Setzler et al. found Holt-Winters within ~14 calls of actual |
| 4 | **SARIMA** with seasonal period 168 | Setzler et al. found **ARIMA best for weekly** forecasting; best order for emergency demand was **(1,1,1)(2,0,0)** 🔗 https://pmc.ncbi.nlm.nih.gov/articles/PMC8567893/ |
| 5 | **Poisson / NegBin GLM**, hour-of-week effects | **The count-respecting baseline.** Beats Gaussian-on-counts, which Setzler et al. explicitly criticise: modelling counts as normal *"conflicts with the Poisson distribution assumption used in OR methods for optimizing staffing levels"* 🔗 https://people.orie.cornell.edu/shane/pubs/ForecastEMSTime.pdf |
| 6 | **√-transform + ARIMA** | √ of Poisson counts is approximately normal — Brown & Greenspan 🔗 https://arxiv.org/pdf/0807.4071 |
| 7 | **Prophet** | Good at long-horizon trend/seasonality decomposition |
| 8 | **LightGBM / XGBoost** | NYC EMS: MAE 11.5, R²≥0.91 over 7.36M dispatches; **hour-of-day and trailing 6-hour mean were the top features** 🔗 https://pubmed.ncbi.nlm.nih.gov/34139474/ |
| 9 | **Ensemble** (mean / weighted / stacking) | The base point forecast that conformal will wrap |
| 10 | **Mixture-aware** (forecast 911 and non-emergency separately, then aggregate) | **Added by C6.** Directly tests whether decomposing the 77/23 split beats modelling the total |

> Also worth including: **the vendor's method class reproduced as a baseline** — smoothed average peak demand. Setzler et al. provide the benchmark design, and it is the honest way to compare rather than to strawman.

> [!tip] Features that follow from the priors
> Given 77% non-emergency and 73% wireless, the feature set should carry **hour-of-week as a categorical interaction**, a **trailing 24 h and 168 h** total (the NYC finding), and — where the data permits — **the wireless share itself as a regressor**, since it is the drift term that breaks naive. Check SynthCCD's schema for a line-type field first.

### 5.4 Evaluation

**Point accuracy:** MAE, RMSE, **MASE** (scale-free; mandatory when comparing across volumes), WAPE. Avoid MAPE at low counts.

**Report at three levels — the block level is the one that matters** (C7):
```
per_hour    : error on each of the 168 slots
per_day     : aggregate error over each 24-hour day      ← rosters are built per day
per_week    : total weekly volume error
```

**The decisive measurement — stratified coverage:**

```
coverage_by_volume_decile(1..10)
coverage_by_hour_of_day(0..23)
coverage_by_day_of_week
coverage_of_whole_day_blocks(1..7)      ← C7: catches correlated day-level failure
```

Plus interval width (an interval covering everything is useless).

**Then the staffing back-translation:** for each method, feed `ŷ` and `U_α` through the same Erlang C mapping, and report the **service level actually achieved** and **staff cost** as you sweep the quantile α. Because staffing is convex in volume (C2), this sweep is where a modest forecast improvement turns into a staffing improvement — or fails to.

> ### ⚠️ Circularity guard — same trap as Step 1
> Optimising a forecast against MAE and then reporting MAE proves nothing. Use **rolling-origin cross-validation** with a held-out final block, never a random split on a time series. And report **calibration and test coverage separately** — a conformal method tuned on the test block is not a conformal method.
>
> Concretely: `train → calibrate → test`, strictly sequential, with the calibration block sandwiched in time. **Calibration and test blocks must be whole weeks**, matching the vendor's block structure.

---

## 6. Multivariate component forecasting — good idea, but it needs reconciliation

The proposal to forecast **911 answered, 911 abandoned, non-emergency answered, non-emergency abandoned, and outbound** separately is well-motivated. Different components have genuinely different drivers — weather hits 911, the academic calendar hits non-emergency, the callback obligation ties outbound to abandonment. A single total-volume series cannot represent that structure.

**But forecasting the five independently will fail, and C4 says why.**

### 6.1 The components are not independent — the hierarchy

```
Total received
├── 911 received
│   ├── 911 answered
│   └── 911 abandoned ──┐
├── Non-emergency received│
│   ├── NE answered      ├─┬──▶ Outbound   ──┬─ callbacks
│   └── NE abandoned ────┘ │   (own target)  ├─ transfers within jurisdiction
                          │                  ├─ transfers to other jurisdictions
Transfers IN ◀─────────────┘                  ├─ information-gathering
(other jurisdiction)                          └─ other
```

> [!important] Outbound is a **sibling** of inbound, not a child of it
> An earlier draft of this note drew outbound as a function of abandonment alone. **That was wrong** (C4 v3): outbound has at least four drivers, only one of which is the callback obligation. It carries **partial** coupling to inbound volume and abandonment — not derivation.
>
> **What still holds from the original reasoning:**
> - The **coherence constraint** is unaffected. `Σ received components = Total` is an identity, and independent forecasts will violate it. Reconciliation is still required.
> - Outbound is **not statistically independent** of the inbound series, so a joint model still beats five independent ones — but the relationship is weaker and noisier than "outbound = f(abandoned)".
>
> **What changes:** the causal direction I asserted, and the two formulations that assumed derivation (M5, M7 below).

### 6.2 The correct tool: forecast reconciliation

This is a solved problem — **forecast reconciliation** for hierarchical/grouped time series.

| Method | Reference | Note |
|---|---|---|
| **MinT** (Minimum Trace) | Wickramasuriya et al. (2019) | Projects independent base forecasts onto the coherent subspace with minimum total variance. The standard default |
| **Optimal reconciliation** | Wickramasuriya, Athanasopoulos & Hyndman (2019) | 🔗 https://robjhyndman.com/papers/Foresight-hts-final.pdf |
| **Forecast reconciliation: a review** | Athanasopoulos, Hyndman, Kourentzes & Panagiotelis (2023), *IJF* | 🔗 https://robjhyndman.com/papers/hf_review.pdf — **read this first.** The standard reference; defines coherence, the coherent subspace, and the full method family |
| **Discrete reconciliation for counts** | Panagiotelis et al. (2023) | 🔗 https://arxiv.org/pdf/2305.18809 — **required here**, see below |

> **📖 Full treatment: [[forecast-reconciliation]]** — projection framework, the `W` family and when each wins, temporal/cross-temporal variants, the bottom-up optimality result, scalability, and software. Start there; this table is only the applied subset.

> [!warning] Counts need the discrete framework, not linear reconciliation + rounding
> Linear reconciliation produces real-valued forecasts; rounding breaks coherence. The canonical illustration: `X = 0.4`, `Y = 0.4`, `Z = 0.8` are coherent, but rounding to integers gives `X = 0`, `Y = 0`, `Z = 1` — no longer coherent. With hourly PSAP counts, many cells are small integers or zero, so this is the normal case, not an edge case.

### 6.3 A finding-in-waiting about reconciliation and counts ⚠️

Reconciliation does something specific to right-skewed count data that has a **direct staffing consequence**:

> *"Reconciliation decreases the variance of base forecasts that are right-skewed, which is often the case with count variables: the right tail is shortened, lowering the expected values."*
> 🔗 https://arxiv.org/pdf/2303.15135

So reconciled count forecasts have **systematically lower expected values** than unreconciled base forecasts. Feeds through convexity (C2), that means **reconciliation lowers the recommended staffing level** — deliberately and for a statistical reason, not because the data changed.

That is a genuinely interesting, testable, and slightly counter-intuitive result: *the reconciliation that makes your five component forecasts add up correctly will predict fewer calls than forecasting them independently.* Worth isolating as its own hypothesis.

### 6.4 The target should be workload, not counts

One more correction to the framing. Decomposing counts is only useful **weighted by component service time**, because staffing consumes effort, not calls:

```
workload_t = Σ_c  n_c,t × E[S_c]
```

Non-emergency calls are plausibly much longer than 911 calls — report takes, warrant checks, in-custody calls. If the components differ in duration, **counting them equally understates non-emergency load**, and 77% of volume at a lower weight could still be the majority of the work.

> **Recommendation:** the primary forecasting target is **component-weighted workload** (or at minimum, separate forecasts per component *and* a workload total). Component counts alone answer a question staffing does not ask.

### 6.5 Practical formulations to test

| # | Formulation | Tests |
|---|-------------|-------|
| M1 | Independent component forecasts, **unreconciled** (the naive version of the proposal) | The baseline to beat |
| M2 | Independent + **MinT reconciliation** | Does coherence help accuracy? |
| M3 | Independent + **discrete reconciliation** (counts) | Does it help *more* at small counts? |
| M4 | **Top-down**: forecast total, disaggregate by historical share | Cheaper; how much accuracy is lost? |
| M5 | Forecast total + **abandonment rate**, derive answered components | Exploits the *identity* `received = answered + abandoned` — **still valid** |
| M6 | **Workload-weighted** components (§6.4) | The one staffing actually needs |
| M7 | **Outbound as its own target** with volume + abandonment as covariates | Replaces the withdrawn "derive outbound from abandonment" version |
| M8 | **Joint/vector** model across the inbound components, with outbound modelled separately | Whether a multivariate count model beats reconciliation of univariate ones |

> **Corrected from the previous draft.** M5 previously read "forecast total + abandonment rate, **derive components**" and M7 read "forecast abandonment first, **condition outbound on it**" — both assumed outbound was derivable. Only M5 survives, because it relies on the **identity** `received = answered + abandoned`, which is a hard constraint rather than a causal guess.
>
> **M5, M7 and M8 are the ones with structure.** M1–M4 are reconciliation machinery; they buy coherence, not mechanism. If a method wins on accuracy rather than arithmetic consistency, it will be one of the three.

### 6.6 The data-granularity problem — and one useful find

You are right that CHFEs distinguish 9-1-1 from non-emergency trunks but centres are not *reported* at that level. Two things soften it:

- **The data may be captured even when it is not reported.** New Jersey requires each PSAP to record abandoned calls *"indicating the caller's telephone number, the time the call was answered, the time the call was transferred (if applicable), the time the call was disconnected, **the trunk line the call came in on**, and the call-taker position in the PSAP."* 🔗 https://www.law.cornell.edu/regulations/new-jersey/N-J-A-C-17-24-2-1 — trunk-level attribution of abandoned calls is a **regulatory recording requirement** in at least one state. **Ask whether the CHFE/CDR export carries it even if the monthly report does not.**
- **SynthCCD exposes the full split** (911 / non-emergency × received / abandoned / outbound). So the multivariate design is **fully testable on synthetic data** even if real data arrives coarser.

> **The asymmetry is useful, not a problem:** run the multivariate study on SynthCCD where you have full granularity, then validate the *conclusions* against Douglas County at whatever granularity it provides. If the reconciled-vs-independent conclusion holds at coarser granularity too, it travels.

> ### ⚠️ One expectation to set before running it
> Reconciliation is often sold as an accuracy improvement. **It is not guaranteed to be one.** Recent results show improvements concentrate at the **aggregate** level, while reconciliation at the **bottom level can be worse out-of-sample** — and for temporally aggregated models, bottom-up is sometimes *provably* optimal. Measure accuracy **at the level you care about**; if you evaluate on bottom-level series you may conclude reconciliation fails when it has in fact delivered what you needed at the aggregate. Details in [[forecast-reconciliation]] §7 and §9.

---

## 7. Data acquisition — the Douglas County opportunity

In progress via the Kansas 9-1-1 administrator. **Douglas County, Kansas** PSAP.

### 7.1 Why this jurisdiction is well-chosen

| Characteristic | What it stresses |
|---|---|
| **4 population centres** | Heterogeneous spatial demand mix |
| **Class I research university** | **Academic calendar** — registration, midterms, finals, graduation, move-in/out |
| **Two further universities** | Compounding calendar effects at different scales |
| **Rural areas** | Low-volume, high-dispersion regimes; the regime-switching case |
| **Clinton Lake** | **Tourist/seasonal** gathering area; summer weekends and events |

> [!tip] The academic calendar is the most valuable feature — and it cuts against your priors
> Your own prior work establishes that **naive methods fail on stochastic factors** (line-type mix, wireless, weather, congestion). A university calendar is **not stochastic** — it is deterministic, published months ahead, and perfectly known at forecast time.
>
> So this is the one place where naive should *not* be blamed for failing, and where a method that ingests known calendar covariates should genuinely win. It produces a sharp, falsifiable hypothesis:
>
> **H9: exogenous calendar covariates beat univariate methods — and the gain concentrates at term boundaries, not in baseline periods.**
>
> If true, it reframes the whole vendor critique from *"your forecast is bad"* to *"your forecast ignores information you could have had for free."*

### 7.2 Ask for aggregates first

> [!danger] Request hourly aggregates before any call-by-call data
> 9-1-1 CAD and CDR records carry names, addresses, medical information and other regulated identifiers. Call-by-call data brings a data-sharing agreement, de-identification obligations, and often a review process.
>
> **Hourly aggregate counts are largely de-identified** — no caller, no location, no incident — and they are *all this study needs* as the target series. Ask for those first. Escalate to call-by-call only if a specific hypothesis requires it, and only with an agreement in place.

### 7.3 What to request

| Series | Granularity | Why |
|---|---|---|
| Hourly counts by trunk class (911 / non-emergency) | hourly, 24 months | Primary target |
| Hourly abandoned counts, same split | hourly | Drives the callback regression (C4 revised test) |
| Hourly outbound count | hourly | **Its own target** — multi-driver channel (C4 v3), not derived from abandonment |
| **Outbound call-purpose taxonomy** (callback / transfer / info / other) | if available | Would enable the C4 decomposition. **Expect this to be unavailable** — see §7.4 |
| **Transfers received from other jurisdictions** | if available | Completes the bidirectional transfer picture |
| **Trunk-line attribution on abandoned calls** | if available | NJ requires it; determines whether §6.6 is testable |
| Current staffing per interval | hourly | The baseline arm |
| **Known academic calendar dates** | term start/end, exams, graduation | **The H9 covariate** |
| Known event calendar — Clinton Lake, county fair, KU events | dates | Second exogenous covariate |
| Data dictionary / CHF/CDR export documentation | — | Required to interpret fields correctly |

**24 months minimum.** The study needs multiple complete weeks for conformal calibration plus a held-out final block, and ideally enough to contain a full academic cycle.

### 7.4 Open questions and limitations of this path

| # | Issue |
|---|---|
| 1 | **Whether Kansas is a callback-policy state**, and whether the mandated multiplier is documented. Oregon's is explicit; not all states are |
| 2 | **n = 1 PSAP, single jurisdiction.** External validity is limited. Frame as a case study, not a general law |
| 3 | **Possible multi-jurisdiction structure.** If Douglas County operates a consolidated centre, comparability to single-PSAP literature is limited |
| 4 | **Governance timeline is unknown** and may exceed the study window. Do not make the whole design contingent on it |
| 5 | **SynthCCD remains the primary testbed** regardless. Real data validates; it does not gate |
| 6 | **Outbound cannot be decomposed in either dataset.** No purpose taxonomy in SynthCCD, and centres generally do not report one. The multi-driver structure of outbound is documented but not measurable here — a stated boundary |

> **The asymmetry is the right posture:** build the study on SynthCCD where you control everything, and treat Douglas County as **external validation**. If the data never arrives, you lose the validation arm — not the study.

---

## 8. Phased plan

| Phase | Work | Exit criterion |
|---|---|---|
| **0** | Generate volume series; **confirm whether a line-type field exists**; freeze whole-week `train → calibrate → test` splits | 4+ months hourly, splits aligned to week boundaries |
| **1** | Point-forecast bake-off, 168-hour blocks, rolling-origin | Ranked table at **per-hour, per-day, per-week** levels, by method |
| **2** | Conformal layer over the top 2–3 point forecasts | Coverage **stratified by decile, hour, day — and whole-day blocks** |
| **3** | **Multivariate components (§6)** — M1–M7, reconciliation variants | Coherence achieved; component error table; callback multiplier estimated (C4 revised test) |
| **4** | Staffing back-translation and frontier | Service level vs cost, per method, per α |
| **5** | **External validation (§7)** if Douglas County data lands | Real-data replication of the synthetic conclusions |
| **6** | Write-up | Critiques C1–C7 each either confirmed, refuted, or left open |

### Expected outcomes (state these before you run it)

| Hypothesis | Falsified if |
|---|---|
| H1: volume-only staffing is mis-specified | Stratified workload by priority/disposition is narrow |
| H2: staffing is superlinear in volume | Elasticity `d log s / d log a` ≤ 1 across the operating range |
| H3: demand-pattern methods over-forecast | Over-prediction rate < 50% |
| H4: conformal gives usable peak coverage | Stratified peak coverage ≥ nominal (1−α) |
| H5: `U_α` beats `ŷ` operationally | Service level/cost frontier is flat or worse for `U_α` |
| **H6** *(C6)* Mixture decomposition beats total-volume modelling | Separate 911 / non-emergency forecasts lose to a single total series |
| **H7** *(C6)* Line-type mix is a material driver | Mix-shared features add nothing over hour-of-week alone |
| **H8** *(C7)* **Errors correlate within a day** | Per-hour and per-day error profiles are statistically indistinguishable |
| **H9** *(§7.1)* **Calendar covariates beat univariate methods** | Known academic-calendar features add nothing, or the gain is uniform across the week rather than concentrated at term boundaries |
| **H10** *(§6.3)* Reconciliation **lowers** expected count forecasts | Reconciled and unreconciled expected values are indistinguishable |
| **H11** *(C4 v3)* Abandonment carries **incremental** explanatory power for outbound, controlling for volume | Abandonment adds nothing once total volume is in the model — meaning transfers/information calls dominate and the callback link is second-order |

> Writing these down **before** running anything is the difference between a test and a confirmation exercise.
>
> - **H1, H2, H8 are near-certain** — H1 and H2 are structural or provable, and C7 follows from the block structure of their own product.
> - **H6 and H7 depend on data you may not have** (§5.1). If SynthCCD carries no line-type field, H7 is untestable and must be recorded as such rather than quietly dropped.
> - **H9 depends on external data** and cannot be tested on SynthCCD at all — it needs the academic calendar.
> - **H4 remains the genuinely open one**, and it is the one that decides whether conformal is the answer you hope it is.

---

## 9. Limitations

| # | Limitation | Consequence |
|---|-----------|-------------|
| 1 | **SynthCCD is synthetic** | The vendor's *point accuracy* on this data says nothing about accuracy on a real PSAP. The critiques in §2 are structural and do transfer; the error magnitudes do not |
| 2 | **Diurnal patterns are parameterised, not estimated** | You may be testing the generator's assumptions rather than reality |
| 3 | **No major-incident surge, holiday spikes, or day-in-court effects** | Real PSAP volume has shocks these forecasts will all miss. **This is where a real vendor earns its keep** — acknowledge it |
| 4 | **Conditional coverage is impossible in general** | If H4 fails, that is a property of the problem, not a bug in your implementation |
| 5 | Back-translation inherits Step 1's SynthCCD limitation | If you want to measure realised service level, that needs the Step 1 simulator |
| 6 | **Your priors (77% non-emergency, 73% wireless) are from real operations, not from SynthCCD** | Applying them as a fixed assumption to synthetic data is an inference you are importing, not measuring. Say so in the write-up |
| 7 | **The vendor's formulae remain unknown** | You are testing the *method class*, not their code |
| 8 | **n = 1 external PSAP** | Douglas County is a case study, not a general law. External validity is limited |
| 9 | **Governance timeline unknown** | May exceed the study window. The design must not be contingent on it — see §7.4 |

---

## Status

- [x] Vendor claim decomposed into V1–V4
- [x] Seven critiques with sources; C2 provable from the local PDF; C6/C7 from prior operational data
- [x] **C4 corrected (twice)** — v1 withdrawn (wrong mechanism), v2 withdrawn (outbound modelled as derived), v3 current (multi-driver channel). Revision history recorded for audit
- [x] Conformal reframed into its three legitimate roles
- [x] Marginal-vs-conditional coverage risk identified as the crux
- [x] Point-forecast menu drawn from the EMS/ED benchmarking literature
- [x] **Horizon resolved** — one-shot 168-hour blocks; design aligned to week boundaries
- [x] **§6 Multivariate component design** — coupling, reconciliation, workload weighting, M1–M8
- [x] **§7 Data acquisition** — Douglas County rationale, request list, governance posture
- [x] 7-phase plan with eleven pre-registered hypotheses
- [ ] **Confirm whether SynthCCD carries a line-type / wireless field** — gates H7
- [ ] **Confirm whether SynthCCD carries an outbound purpose taxonomy** — expect no; gates the C4 decomposition
- [ ] **Confirm whether Kansas codifies a callback obligation**, and whether a mandated multiplier is documented
- [ ] Phase 0 — generate and freeze data
- [ ] Phase 1 — point-forecast bake-off
- [ ] Phase 2 — conformal + stratified coverage
- [ ] Phase 3 — multivariate components + reconciliation
- [ ] Phase 4 — staffing frontier
- [ ] Phase 5 — external validation (conditional on data)
- [ ] Phase 6 — write-up

## Cross-links

- [[Staffing_Workflow_Feasibility]] — Step 1; supplies the Erlang C mapping and the simulator for the back-translation
- [[Staffing_Dispatcher_Feasibility]] / [[Staffing_Dispatcher_Methods]] — Step 2
- [[Staffing_Sources]] — full bibliography with per-entry link status
