---
type: reference
status: active
topic: "Running a forecaster in production — retraining cadence, drift detection, coverage and pinball monitoring, shadow deployment, and why adaptive conformal intervals can shrink exactly when they should widen."
created: 2026-10-15
tags:
  - time-series
  - forecasting
  - mlops
  - monitoring
  - deployment
  - production
aliases:
  - Forecasting MLOps
  - MLOps
  - Production Forecasting
  - Forecast Monitoring
  - Retraining
---

# Forecasting MLOps

Everything in the vault so far is about producing a forecast. This note is about what happens
after: how often to refit, what to monitor, when to stop trusting the model, and how to know the
pipeline is lying to you.

> Written 2026-10-15. Previously **one empty section header** — *"## 5. Integration and deployment"*
> in [[Time Series Foundation Models]], containing a table of integration libraries and nothing
> about operations. `MLOps`, `retrain cadence`, `champion/challenger` and `shadow` appeared zero
> times across both folders.

---

## 1. The specific hazard in forecasting

This is not a generic MLOps note. Forecasting has one failure mode that does not apply to
classification or ranking, and it is worth stating plainly:

> **An adaptive conformal interval whose model has gone stale gets *narrower* over time exactly
> when it should widen.**

ACI (Adaptive Conformal Inference, Zaffran et al. 2021 🔗
[arXiv:2206.00101](https://arxiv.org/abs/2206.00101)) updates its quantile level $\alpha_t$ based
on observed coverage:

$$\alpha_{t+1} = \alpha_t + \gamma\left(\alpha - \mathbb{1}\{y_t \in \hat C_{t | \alpha_t}(X_{t+1})\}\right)$$

If the model starts missing, $\alpha_t$ rises and the interval **widens** — correct. But if the
model is simply *trained on the wrong regime* and its errors are structurally wrong (not
temporarily elevated), the adaptation chases an error signal that has a different structure, and
**coverage can sit near nominal while the intervals are uselessly narrow and badly placed.**

[[Practice 04]] §Step 8 correctly identifies ACI as "the right one for a system running live." **It
then drops the argument.** This note is the rest of it.

---

## 2. Retraining cadence

### 2.1 There is no paper that tells you

> **⚠️ Honest gap.** No peer-reviewed source gives a numeric retraining-frequency recommendation
> for forecasting models. I looked. If you cite one, it is probably a blog post. **Frame cadence as
> a design decision and justify it from the seasonal period.**

The best available anchor is Google Rules of ML **#8** ("Know the freshness requirements of your
system"): *"How much does performance degrade if you have a model that is a day old? A week old? A
quarter old?"* — i.e. **measure the decay curve rather than guessing the number.**

### 2.2 The argument from the seasonal period

For $h = 168$ with period $s = 168$:

| Cadence | Verdict |
|---|---|
| **Hourly** | **Wrong.** Re-learns parameters from data that is almost entirely the same seasonal position as 23 hours ago. Pure churn. |
| **Daily** | Defensible, and the finest granularity that changes anything |
| **Weekly, aligned to Sunday 00:00** | **The natural default.** One full seasonal cycle of new information per refit |
| **Monthly** | Too slow. Carries a 4-week-old view of a series whose trend may have moved |
| **Trigger-based** | **Better than fixed.** See §2.3 |

> **PSAPs plan shifts on a weekly cycle**, so the weekly/Sunday boundary is not arbitrary — it
> matches how the output is consumed. Fit and publish on the same schedule the forecast is used.

### 2.3 Trigger-based beats fixed

Instead of (or in addition to) a schedule, rebuild when the model stops earning its keep:

$$\text{rebuild} \iff \frac{\mathrm{MASE}_{h, t}}{\mathrm{MASE}_{\text{seasonal-naive}, h, t}} > \tau$$

This is cheap: you already have the rolling-origin harness from
[[Practice 01 — Rolling-Origin Harness and Baseline Panel]]. The `feasts` shift-detection features
(`shift_level_max`, `shift_kl_max`) from [[Feature Engineering for Time Series]] §2.5 are the
sensible trigger inputs — and see [[Change-Point Detection]] for the sharper version of this idea.

---

## 3. What to monitor

### 3.1 The forecast metrics

| Metric | Why | Source |
|---|---|---|
| **Pinball / Quantile Score**, averaged over a quantile grid | The production-native score. CRPS if you average properly | Petropoulos et al. (2022) 🔗 [10.1016/j.ijforecast.2021.11.001](https://doi.org/10.1016/j.ijforecast.2021.11.001) |
| **Coverage per horizon step** | Intervals that are fine at $h=1$ and useless at $h=168$ are common | [[Model Validation Strategies]] §6 |
| **Coverage vs sharpness** | **Never one without the other** — wide intervals give free coverage | Gneiting, Balabdaoui & Raftery (2007) 🔗 [10.1111/j.1467-9868.2007.00587.x](https://doi.org/10.1111/j.1467-9868.2007.00587.x) |
| **rPIT drift** | Calibration drift specifically — see [[Count Distributions and Kolassa Evaluation]] §3.1 | Czado et al. (2009) |
| **MASE ratio vs seasonal-naive** | The rebuild trigger from §2.3 | [[Time Series Forecasting Baselines]] |

### 3.2 The pipeline metrics

These are boring and they are the ones that actually page you:

| Metric | Failure it catches |
|---|---|
| **Data freshness** — timestamp of newest observation | The pipeline silently stopped. **This is the most common production failure** |
| **Row count / gap check** | Missing hours dropped rather than nulled |
| **Feature staleness** — max age of each covariate | A weather feed that died and nobody noticed |
| **Forecast latency** | Training blocking the weekly publish window |
| **Actual-arrival lag** | You cannot score a forecast until actuals land — monitor *that* lag |

> **Google Rules of ML #10, "Watch for silent failures."** Their worked example is a table that
> was six months stale; refreshing it gave a 2% lift in install rate. A stale 9-1-1 extract is the
> same failure, and it is silent.

### 3.3 Drift

| Concept | Source |
|---|---|
| **Concept drift survey** | Gama, Žliobaitė, Bifet, Pechenizkiy & Bouchachia (2014), *ACM Computing Surveys* 46(4) 🔗 [10.1145/2523813](https://doi.org/10.1145/2523813) |
| **Learning under drift** | Lu et al. (2018), *IEEE TKDE* 🔗 [10.1109/TKDE.2018.2876857](https://doi.org/10.1109/TKDE.2018.2876857) |

> ⚠️ **Neither paper is about forecasting specifically.** They are the general concept-drift
> canon, and the transfer to forecast models is by analogy, not by citation. Say so if you use them.

---

## 4. Deploying a new model

### 4.1 Shadow / dark launch

**Fowler, M. (2020). "Dark Launching."** 🔗
https://martinfowler.com/bliki/DarkLaunching.html — practitioner, not peer-reviewed, and the
right citation for the *pattern*:

> *"Dark launching can also enable **parallel running of a re-implemented feature**. The old and
> new code can both be called and their results checked to see if there are changes with the new
> algorithm, but only one answer returned to the interface."*

**This is safe for a PSAP specifically**, because a forecast does not directly steer a call-taker.
You can run the candidate every week, log both, compare, and serve the incumbent until the
candidate wins on a pre-declared metric.

### 4.2 Champion/challenger has a better statistical answer

> **There is no peer-reviewed champion/challenger literature specific to forecasting** — I looked.
> And the statistical alternative is better anyway: **just combine them.**
> [[Forecast Combination]] §1 is the finding that averaging beats selecting, and M4 confirmed it at
> scale. If you cannot confidently pick between two forecasters, **don't pick — average them**,
> and the problem disappears.

So the deployment ladder is:

```
candidate → shadow (log, don't serve) → combined (serve both, average) → champion
```

### 4.3 The pre-declared metric matters

Decide the promotion criterion **before** seeing the candidate's numbers. This is
[[Model Validation Strategies]] §1 in an operational costume, and it is where most A/B tests of
forecasters go wrong — you will find a metric that flatters the new model if you look long enough.

---

## 5. Storage: metrics vs forecasts

**Do not put these in the same database.** It is the most common MLOps mistake here.

| Layer | Store | Tool |
|---|---|---|
| **Service metrics** — pipeline lag, row counts, latency, freshness | Prometheus. Cardinality-bounded numeric series; designed to survive outages | 🔗 https://prometheus.io/docs/introduction/overview/ |
| **Forecasts** — values, intervals, feature vectors, and the **actuals to join against** | A real TSDB | InfluxDB 3 Core · TimescaleDB (**now "Tiger Data"**) · QuestDB |

> **Prometheus explicitly says it is not for 100%-accurate per-request accounting** — it
> downsamples and has cardinality limits. Storing 168 hourly forecasts × intervals × every series
> × every origin in it will fail or, worse, silently drop data.

**QuestDB's `ASOF JOIN`** is unusually well-suited to the forecast→actual join with a variable lag
(you do not know when an actual will land). **TimescaleDB** continuous aggregates handle the daily
rollup for dashboards. Note TimescaleDB has been **rebranded to Tiger Data**.

---

## 6. Assessment

**Strengths**
- The cadence argument follows from the seasonal period rather than from convention.
- Trigger-based rebuilding uses machinery the vault already has.
- Shadow deployment is genuinely safe here because forecasts are advisory.
- "Just combine it" dissolves most of the champion/challenger problem.

**Weaknesses and cautions**
- **Almost no forecasting-specific MLOps literature exists.** The canon is generic ML and borrowed
  by analogy. Say so when you cite it.
- Monitoring calibration requires enough scored forecasts to be meaningful — at weekly cadence you
  accumulate evidence slowly.
- ACI's failure mode in §1 is subtle and needs its own explicit test.
- **A 168-hour seasonal period is brittle in production** — see §7.

---

## 7. The DST caveat — the most likely production failure

> **If your multi-year data crosses DST transitions, "hour of week" is not hour of week.**

A 168-slot model indexed on *local civil time* has its slots shifting by an hour twice a year. The
effects:
- 2022–2026 data contains 8 DST transitions
- Each one silently misaligns the seasonal profile
- **The effect is small enough to hide inside the noise and large enough to bias every hour-specific
  estimate**

**Options:** define hour-of-week against **local standard time** (not civil time) and say so
explicitly; or add explicit DST/holiday features; or use 24-hour periods plus a day-of-week factor.

> This belongs in the study as a **sensitivity check**, not just a production concern. It is the
> single most likely way the 168-vs-1 comparison could mislead, because it disadvantages precisely
> the arm that relies on hour-of-week alignment.

---

## 8. Try it

- [ ] Stand up the §3.2 pipeline metrics **before** anything else. Freshness and row-count checks
      catch more real failures than any model work
- [ ] Measure the **decay curve** (Rule #8): MASE ratio at 1, 7, 14, 28, 56, 112 days stale. Let
      the data pick the cadence
- [ ] Implement the trigger-based rebuild rule from §2.3 and compare it to a fixed weekly schedule
- [ ] **Explicitly test the §1 hazard.** Take a model trained on pre-change data, run ACI on it
      post-change, and plot interval width and coverage over time. Confirm whether width shrinks
      while coverage falls
- [ ] Run a candidate forecaster in **shadow** for 8 weeks against the incumbent and log both.
      Pre-declare the promotion metric now
- [ ] **Check the timezone of your series right now.** If it is local civil time and spans DST, this
      is a P1 finding, not a footnote
- [ ] Re-verify the rPIT and WIS from [[Count Distributions and Kolassa Evaluation]] §4 monthly, not
      just at evaluation time — calibration drifts
- [ ] Split metrics and forecasts into separate storage and confirm the forecast-actual join works
      with variable actual-arrival lag

## References

1. Gama, J., Žliobaitė, I., Bifet, A., Pechenizkiy, A. & Bouchachia, A. (2014). A survey on concept
   drift adaptation. *ACM Computing Surveys* 46(4). 🔗 https://doi.org/10.1145/2523813
2. Lu, J., Liu, A., Dong, F., Gu, F., Gama, J. & Zhang, G. (2018). Learning under concept drift:
   A review. *IEEE TKDE*. 🔗 https://doi.org/10.1109/TKDE.2018.2876857
3. Kreuzberger, D., Kühl, N. & Hirschl, A. (2023). Machine learning operations (MLOps): Overview,
   definition, and architecture. *IEEE Access* 11, 31866–31879. 🔗
   https://doi.org/10.1109/ACCESS.2023.3262138 · preprint 🔗 https://arxiv.org/abs/2205.02302
4. Sculley, D. et al. (2015). Hidden technical debt in machine learning systems. *NIPS 2015*. 🔗
   https://papers.nips.cc/paper/5656-hidden-technical-debt-in-machine-learning-systems
5. Breck, E., Cai, S., Nielsen, E., Salib, M. & Sculley, D. (2017). The ML test score. *IEEE Big
   Data*, 1123–1132. 🔗 https://doi.org/10.1109/BigData.2017.8258038 — the "features and data"
   group includes testing for training/serving skew and pipeline reproducibility
6. Petropoulos, F. et al. (2022). Forecasting: theory and practice. *IJF* 38(3), 705–871. 🔗
   https://doi.org/10.1016/j.ijforecast.2021.11.001
7. Gneiting, T., Balabdaoui, F. & Raftery, A.E. (2007). Probabilistic forecasts, calibration and
   sharpness. *JRSS-B* 69(2), 243–268. 🔗 https://doi.org/10.1111/j.1467-9868.2007.00587.x
8. Fowler, M. (2020). Dark launching. 🔗 https://martinfowler.com/bliki/DarkLaunching.html
9. Zaffran, M. et al. (2021). Adaptive conformal predictions for time series. 🔗
   https://arxiv.org/abs/2206.00101
10. Google. *Rules of Machine Learning.* 🔗
    https://developers.google.com/machine-learning/guides/rules-of-ml — #8 freshness, #10 silent
    failures, #29 feature logging, #33 test on later data, #37–39 training-serving skew
11. Gneiting, T. & Raftery, A.E. (2007). Strictly proper scoring rules, prediction, and estimation.
    *JASA* 102(477), 359–378. 🔗 https://doi.org/10.1198/016214506000001437
12. Hyndman, R.J. & Athanasopoulos, G. (2021). *Forecasting: Principles and Practice*, 3rd ed. 🔗
    https://otexts.com/fpp3/features.html — the `shift_*` detection features

## Cross-links

- [[Practice 04 — Conformal Prediction on Hourly Counts]] — ACI, and the §1 hazard
- [[Practice 01 — Rolling-Origin Harness and Baseline Panel]] — the MASE-ratio trigger machinery
- [[Change-Point Detection]] — the sharper rebuild signal
- [[Forecast Combination]] — "just combine it" instead of champion/challenger
- [[Count Distributions and Kolassa Evaluation]] §3 — rPIT and WIS monitoring
- [[Model Validation Strategies]] §6 — marginal vs conditional coverage
- [[Feature Engineering for Time Series]] §3.4 — covariate availability and freshness
- [[Time Series Foundation Models]] §5 — where the empty section header was
