---
type: reference
status: active
topic: "The forecasting benchmark landscape — the M-competitions, Monash, GIFT-Eval, fev-bench — what each measures, what each cannot tell you about a single hourly series, and the contamination problem."
created: 2026-10-15
tags:
  - time-series
  - forecasting
  - benchmarks
  - datasets
  - evaluation
  - contamination
aliases:
  - Benchmarks and Datasets
  - M Competition
  - M4 Competition
  - Monash Archive
  - GIFT-Eval
  - fev-bench
---

# Benchmarks and Datasets

What the standard benchmarks actually measure, what they cannot tell you about a single hourly
series from one small jurisdiction, and why leaderboard numbers should be discounted accordingly.

> Written 2026-10-15. The vault previously had **one unreferenced line** for load forecasting, a
> few one-line mentions of "M3 winner" and "M5 result", and — more seriously — a **live
> inconsistency** flagged in §5.

---

## 1. The M-competitions

| | **M1** (1982) | **M2** (1993) | **M3** (2000) | **M4** (2018) | **M5** (2020) |
|---|---|---|---|---|---|
| **Series** | 1,001 | **29** | 3,003 | **100,000** | **42,840** hierarchical / 30,490 bottom-level |
| **Frequency** | Y, Q, M | Mostly weekly | Y, Q, M, other | Y, Q, M, W, D, **H** | **Daily** |
| **Methods** | 15 + 9 var. | 16 (**11 human!**) | 24 | **61** | ~6,400 teams |
| **Real-time?** | No | **Yes** (1987–91) | No | No | No |
| **Key data** | — | Scaled for confidentiality | 6 domains | — | Walmart; prices, promos |

### What each taught

- **M1** — complex ≠ more accurate; **ranking depends on the accuracy measure**; combinations beat
  individuals; accuracy degrades with horizon.
- **M2** — the value of real-time evaluation. **11 of 16 entrants were human** — a useful reminder
  that winning a benchmark is not the whole story for a PSAP.
- **M3** — replicated M1/M2 conclusions on 3× the data.
- **M4** — (1) combinations win; (2) [Smyl's Uber hybrid](https://www.personal.soton.ac.uk/cz1y20/Reading_Group/mlts-2023/week8/Smyl_2020.pdf) (theta + residual ARIMA + gradient-boosted
  features) won; (3) **pure ML underperformed**; (4) the first two methods got 95% PIs right.
- **M5** — **ML won this time.** LightGBM with Tweedie loss, deep nets and ensembles dominated.

> **⚠️ Citation corrections, all of which appear wrong somewhere in circulation.**
> - M4's title is *"…and **61** forecasting methods"* — not 49.
> - M5 accuracy's title is *"Results, **findings**, and conclusions"* — not "conclusions and
>   challenges".
> - **Both M5 numbers are correct** — 42,840 is the total across all hierarchy levels; 30,490 is
>   the bottom-level count you actually submit. Say which you mean.

### M4's hourly subset — the only directly relevant part

**414 hourly series, minimum 700 observations, 48-step horizon.** That is the closest thing in the
M-series to your problem, and it is **1/240th of the competition**.

> **What the numbers say about your problem.** On Monash, M4-Hourly MASE is **11.6 for SES, 11.5
> for Theta, 26.7 for ETS — versus 0.81 for TimesFM zero-shot.** A 14× gap. **Hourly seasonal-period
> modelling is the hardest subset in the archive by a wide margin**, and it is a good place to make
> a contribution.

---

## 2. Monash Time Series Forecasting Archive

**Godahewa, R., Bergmeir, C., Webb, G.I., Hyndman, R.J. & Montero-Manso, P. (2021). "Monash Time
Series Forecasting Archive." NeurIPS Datasets & Benchmarks.** 🔗
[arXiv:2105.06643](https://arxiv.org/abs/2105.06643) · 🔗 https://forecastingdata.org/

30 datasets / 58 variations. **13 baselines** (SES, Theta, TBATS, ETS, ARIMA, pooled regression,
CatBoost, FFNN, DeepAR, N-BEATS, WaveNet, Transformer, DHR-ARIMA), scored with **MASE** and RMSSE.

### The hourly subsets — the part you actually need

| Dataset | Domain | Series | Length | Freq |
|---|---|---|---|---|
| **Traffic Hourly** | Transport | 862 | 17,544 | **Hourly** |
| **KDD Cup 2018** (AQI, 59 stations) | Nature | 270 | 9,504–10,920 | **Hourly** |
| **Electricity Hourly** (UCI, 321 clients) | Energy | 321 | 26,304 | **Hourly** |
| Pedestrian Counts | Transport | 66 | 576–96,424 | Hourly |
| Aus. Electricity Demand | Energy | 5 | ~231,000 | Half-hourly |

> **⚠️ Three naming corrections**, all of which are easy to get wrong:
> - There is **no "Traffic Daily"** — only Traffic Hourly and Traffic Weekly.
> - **KDD Cup 2018 is hourly only** (with- and without-missing variants). No daily version.
> - **There is no "Electricity (Aust.)" hourly** — the Australian set is "Aus. Electricity Demand"
>   and is **half-hourly**. The hourly one is UCI's "Electricity".

### The live inconsistency

> **⚠️ `Practice 01 — Rolling-Origin Harness and Baseline Panel` runs on `load_dataset("hourly",
> group="M4")` — an M4-derived series, which is the *same corpus* TSFMs were pretrained on** per
> the leak rates in [[Time Series Foundation Models]] §3. **Every number in Practices 01–05 is
> therefore computed on known-contaminated data**, and `Practice 03` §Step 8's own advice
> ("prefer decontaminated checkpoints... use them for any reported number") is never applied upward
> to the harness that produced the comparison.

**Is a Monash stand-in informative about PSAP call volume? Partially — and the TSFM part, not at
all.** These are dominated by retail, energy, finance, tourism and weather. **None of them is
distributionally close to one small US jurisdiction's emergency call volume.** The traffic-hourly
subset is the closest in *shape* (hourly, seasonal, counts-ish); the KDD Cup AQI set is the closest
in *count behaviour* (non-negative integers, many zeros).

> **Do not cite the fallback results.** Treat Monash as a pipeline smoke test, not as evidence.
> When Douglas County data arrives, re-run — and expect the numbers to move.

---

## 3. GIFT-Eval

**Aksu, T. et al. (2024). "GIFT-Eval: A Benchmark For General Time Series Forecasting Model
Evaluation."** 🔗 [arXiv:2410.10393](https://arxiv.org/abs/2410.10393) · 🔗
https://github.com/SalesforceAIResearch/gift-eval

**23 datasets, 144,000 series, 177M points, 7 domains, 10 frequencies.** 17 baselines; 97 dataset
configurations on the live leaderboard. Also ships a **non-leaking pretraining corpus** (~230B
points).

> **The governance feature worth adopting.** The GIFT-Eval leaderboard carries a
> **`testdata_leakage` binary column** and a `model_type` taxonomy where `zero-shot` requires
> **both** no test leakage **and** no training on any GIFT-Eval split. **This is the most concrete
> decontamination standard available today.** Adopt it as a reporting convention for your own
> results.

---

## 4. fev / fev-bench

**Shchur, O. et al. (2025). "fev-bench: A Realistic Benchmark for Time Series Forecasting."** 🔗
[arXiv:2509.26468](https://arxiv.org/abs/2509.26468) — **v4, Jun 2026; pin the version.** Library:
🔗 https://github.com/autogluon/fev

**100 tasks across 7 domains, 46 with covariates.** Introduces `fev`. Aggregation uses
**bootstrapped confidence intervals**, reporting win rates and skill scores.

Its stated critique, verbatim, is the one that applies to your study:

> *"Their aggregation procedures frequently lack statistical rigor, making it unclear whether
> observed performance differences reflect true improvements or random variation."*

> **⚠️ `fev` is the library inside the paper, not a separate paper.** There is no "fev (2025)"
> citation. Cite the fev-bench paper; link the library separately.

---

## 5. Contamination

This is well covered elsewhere — [[Time Series Foundation Models]] §3 documents TiRex's measured
leakage (Moirai 19%, TimesFM 10%, TTM 16%), and `Practice 03` §Step 8 and
[[Time Series Anomaly Detection]] §4 cover the mechanism. **What was missing is the general
treatment:**

**Meyer, M. et al. (2026). "Rethinking Evaluation in the Era of Time Series Foundation Models:
(Un)known Information Leakage Challenges."** 🔗
[arXiv:2510.13654](https://arxiv.org/abs/2510.13654) — two named modes:

1. **Train–test sample overlaps** from multi-purpose dataset reuse
2. **Temporal overlap of correlated train and test series**

> *"Ignoring these forms of information leakage when benchmarking TSFMs risks producing overly
> optimistic performance estimates that fail to generalize to real-world settings."*

**Also:** `TSFMAudit` 🔗 [arXiv:2605.26161](https://arxiv.org/abs/2605.26161) for contamination
auditing; `TS-Arena` 🔗 [arXiv:2512.20761](https://arxiv.org/abs/2512.20761) for live pre-registration.

> **⚠️ Meyer's paper changed title across versions.** v1/v2 were titled differently. **Cite the
> arXiv ID, which is stable**, and the current title.

**For a non-pretrained study the risk is different but real:** temporal overlap *between your own
rolling-origin folds*. See Tashman (2000) and Bergmeir et al. (2018) in
[[Feature Engineering for Time Series]] §3.2.

---

## 6. The statistical standard you should hold yourself to

> **⚠️ This is the section that matters most for the 168-point study, and it is not in the vault
> yet.**

With 168 hour-of-week slices each having only ~50–60 observations over 3–4 years:

1. **Per-slice differences will be enormous relative to their true skill.** A MASE delta of 0.4 in
   one slice is noise.
2. **A single aggregate MASE systematically favours the pooled arm**, because the continuous model
   borrows strength across 168 slices while the separate models do not. That is *the entire point of
   the comparison* — but it means you are estimating 168× more parameters in one arm, and a
   headline number will mislead.
3. **Report both aggregate and per-slice, with bootstrapped CIs** (fev-bench method).
4. Ma & Fildes argued **against single-origin evaluation** in the M5 special issue — a direct
   warning for a one-shot train/test split.

**The combination arm has the same requirement.** A weight vector estimated on 13 test weeks is not
a stable finding; bootstrap it. See [[Forecast Combination]] §6.2.

---

## 7. Assessment

**Strengths**
- M4's combination result and M5's "ML wins" result bracket the argument honestly.
- Monash gives 30 datasets with consistent baselines and a **free precomputed feature set**.
- GIFT-Eval's leakage column is a real, adoptable standard.
- fev-bench's bootstrap-CI aggregation is the correct method for small-sample comparisons.

**Weaknesses and cautions**
- **No benchmark is distributionally close to PSAP call volume.** Treat all of them as
  methodological rehearsal.
- Monash counts drift (20 in the arXiv abstract, 25 in the record, 30/58 on the site) — cite the
  site figure or omit the count.
- fev-bench has been revised **four times**; pin a version.
- Contamination makes *any* TSFM leaderboard number an upper bound on real-world skill.
- **A benchmark win does not transfer to a staffing decision.** M2's 11 human entrants are the
  standing reminder.

---

## 8. Try it

- [ ] **Re-run the Practice 01–05 stand-ins on Traffic Hourly instead of M4 Hourly**, and on KDD Cup
      AQI (the count-shaped one). Report both alongside the M4 number — if the ranking moves, the
      M4 result was corpus-specific
- [ ] Adopt GIFT-Eval's `model_type` taxonomy as your reporting convention: is each reported number
      zero-shot, fine-tuned, or trained on a split you evaluated?
- [ ] **Bootstrap every arm of the 168-point comparison** per-slice and in aggregate, fev-bench
      style. Report CIs, not point deltas
- [ ] Report the continuous arm's advantage as a *function of training-window length* (1/2/3/5
      years). The study's own Limitations already asks for this
- [ ] Check M4-Hourly's published MASE (SES 11.6, Theta 11.5, ETS 26.7) as a sanity anchor — if your
      M4-hourly numbers come in at 1.2, something is wrong with the harness, not the model
- [ ] Record which Monash subsets you use and why, in the study note. "We used M4 Hourly because it
      was convenient" is not a reason that survives review

## References

**Competitions**

1. Makridakis, S. et al. (1982). The accuracy of extrapolation (time series) methods. *Journal of
   Forecasting* 1(2), 111–153. 🔗 https://doi.org/10.1002/for.3980010202
2. Makridakis, S. et al. (1993). The M2-Competition: A real-time judgmentally based forecasting
   study. *IJF* 9(1), 5–22. 🔗 https://doi.org/10.1016/0169-2070(93)90044-N
3. Makridakis, S. & Hibon, M. (2000). The M3-Competition. *IJF* 16(4), 451–476. 🔗
   https://doi.org/10.1016/S0169-2070(00)00057-1
4. Makridakis, S., Spiliotis, E. & Assimakopoulos, V. (2020). The M4 Competition: 100,000 time
   series and **61** forecasting methods. *IJF* 36(1), 54–74. 🔗
   https://doi.org/10.1016/j.ijforecast.2019.04.014 ⭐
5. Makridakis, S., Spiliotis, E. & Assimakopoulos, V. (2022). M5 accuracy competition: **Results,
   findings, and conclusions.** *IJF* 38(4), 1346–1364. 🔗
   https://doi.org/10.1016/j.ijforecast.2021.11.013
6. Makridakis, S. et al. (2022). The M5 uncertainty competition. *IJF* 38(4), 1365–1385. 🔗
   https://doi.org/10.1016/j.ijforecast.2021.10.009
7. Makridakis, S., Petropoulos, F. & Spiliotis, E. (2022). The M5 competition: Conclusions. *IJF*
   38(4), 1576–1582. 🔗 https://doi.org/10.1016/j.ijforecast.2022.04.006

**Archives and benchmarks**

8. Godahewa, R., Bergmeir, C., Webb, G.I., Hyndman, R.J. & Montero-Manso, P. (2021). Monash Time
   Series Forecasting Archive. 🔗 https://arxiv.org/abs/2105.06643 ⭐
9. Aksu, T. et al. (2024). GIFT-Eval. 🔗 https://arxiv.org/abs/2410.10393 ⭐
10. Shchur, O. et al. (2025). fev-bench: A realistic benchmark for time series forecasting. 🔗
    https://arxiv.org/abs/2509.26468 ⭐
11. Meyer, M. et al. (2026). Rethinking evaluation in the era of time series foundation models:
    (Un)known information leakage challenges. 🔗 https://arxiv.org/abs/2510.13654

**Evaluation method**

12. Tashman, L.J. (2000). Out-of-sample tests of forecasting accuracy. *IJF* 16(4), 437–450. 🔗
    https://doi.org/10.1016/S0169-2070(00)00065-0
13. Bergmeir, C., Hyndman, R.J. & Koo, B. (2018). A note on the validity of cross-validation for
    evaluating autoregressive time series prediction. *CSDA* 120, 70–83. 🔗
    https://doi.org/10.1016/j.csda.2017.11.003
14. Cerqueira, V., Torgo, L. & Mozetič, P. (2020). Evaluating time series forecasting models. *Machine
    Learning* 109, 1997–2028. 🔗 https://doi.org/10.1007/s10994-020-05910-7
15. Montero-Manso, P. & Hyndman, R.J. (2021). Attributes that define forecasting benchmarks. 🔗
    https://arxiv.org/abs/2003.07823

## Cross-links

- [[Time Series Foundation Models]] §3 — the measured contamination rates
- [[Practice 01 — Rolling-Origin Harness and Baseline Panel]] — the contaminated stand-in
- [[Practice 03 — Zero-Shot Foundation Model Bake-Off]] §Step 8 — its own decontamination advice
- [[Model Validation Strategies]] — rolling origin, power, multiplicity
- [[Forecast Combination]] §6 — the combination arm needs the same CIs
- [[Time Series Anomaly Detection]] §4 — benchmark contamination in a second domain
- [[resources]] §8 — the original competition listing
