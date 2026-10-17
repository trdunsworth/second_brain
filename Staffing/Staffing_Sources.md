---
type: bibliography
topic: Annotated bibliography for PSAP call-centre and dispatcher staffing modelling — queueing theory, call-centre analytics, 911/PSAP standards — with verified links
date: 2026-10-13
status: active
tags:
  - staffing
  - sources
  - bibliography
  - queueing
  - call-center
  - psap
  - dispatch
  - 911
---

# Staffing Sources

> Goal: the references this project leans on, annotated with **why each one matters**, and linked wherever a public copy exists.
> Related: [[Staffing_Workflow_Feasibility]] · [[Staffing_Dispatcher_Feasibility]] · [[Staffing_Model_Reference]]

## Link status legend

Every link below was **checked by HTTP request on 2026-10-13**.

| Marker | Meaning |
|---|---|
| 🔗 | **Verified open full text** — fetched, returns HTTP 200 |
| 🔒 | Publisher landing page / DOI — **not free**; 403 here is publisher bot-blocking, not a dead link. Use institutional access |
| 📖 | Book — library / interlibrary loan. No legal open copy |

> [!warning] Three honest caveats
> 1. **A 403 from a publisher (INFORMS, DOI resolver) is not a dead link.** Those DOIs are valid and resolve normally in a browser; automated HEAD requests are refused by bot protection. I've marked those 🔒 rather than omitting them, and I have **not** invented DOIs anywhere — where I could not verify one, I've said "no open copy located" instead.
> 2. **Author-hosted PDFs are the most reliable free route.** Ward Whitt posts his own papers at `columbia.edu/~ww2040/`, and several others are on lab/author pages. Prefer those.
> 3. **Verify again at submission time.** Institutional links rot.

---

## Tier 1 — Start here

### Whitt, W. (2002). *Solutions for the Erlang B and C Formulas*
IEOR 6707, Advanced Topics in Queueing Theory: Focus on Customer Contact Centers, Columbia University, Fall 2002.
**Local:** `ErlangBandCFormulas.pdf` (19 pp.) — no external link needed.

> The document this project is anchored to, and the best worked treatment of the B and C formulas available. Definitions, the stable recursions, monotonicity and convexity properties, asymptotics for large `s`, Little's-law bounds, and the marginal-analysis cost framework.
>
> **Two things in it are load-bearing for the feasibility question:**
> 1. Erlang C is derived valid only for `0 < a < s`, and Whitt states that because loss systems can have `a ≥ s`, *"the Erlang B formula should be considered more fundamental."* This is why peak intervals are the interesting part of the study.
> 2. The convexity results (Messerli 1972; Harel 1990) are what make search-based staffing algorithms correct rather than heuristic.

### Whitt, W. (2007). *What You Should Know About Queueing Models To Set Staffing Requirements in Service Systems*
Cornell/Columbia Operations Research technical report.
🔗 https://academiccommons.columbia.edu/doi/10.7916/D84X5M8H/download

> **The best single modern overview.** Covers the standard M/M/s model, the square-root staffing formula `s = a + β√a`, the QED regime, and how to choose among models. Highly cited, readable, written for practitioners rather than theorem-proofs.

> [!note] A note on this file's text layer
> The local PDF is a 2005 dvips/Ghostscript TeX conversion whose fonts are **Type3 with anonymous `/a0`–`/a255` glyph names and no `/ToUnicode` map**. Naive text extraction returns raw glyph indices and is unreadable — it needs rendering to image or OCR. Worth knowing before anyone wastes an hour on it.

---

## Tier 2 — Queueing foundations

| Source | Link | Notes |
|---|---|---|
| **Cooper, R.B. (1981).** *Introduction to Queueing Theory*, 2nd ed., North-Holland | 📖 | Whitt's designated reference for every derivation (pp. 4–5, 7–8, 79–80, 91). The standard graduate text. No legal open copy. |
| **Kleinrock, L. (1975).** *Queueing Systems Vol. I: Theory* | 📖 | Origin of birth-death process theory; cited by Whitt for the truncated-Poisson result |
| **Feller, W. (1971).** *An Introduction to Probability Theory and its Applications*, Vol. II | 📖 | The Erlang distribution as the gamma special case (p. 11) |
| **Erlang, A.K. (1924).** "On the rational determination of the number of circuits" | 📖 | The original result. Reproduced in Brockmeyer, Halstrom & Jensen (1948), *The Life and Works of A. K. Erlang*, pp. 216–221 |
| **Jagerman, D.S. (1951).** "Simultaneous waiting queues" | 🔒 | Parallel-server origin of square-root scaling, predating Halfin–Whitt |
| **"Erlang (unit)" — Wikipedia** | 🔗 https://en.wikipedia.org/wiki/Erlang_(unit) | Quick sanity check on unit dimensional analysis. Not citable in a write-up |

> **If you need these and have no library access**, ask your interlibrary loan desk for the Whitt papers and the Gans review first — they're the highest-value items and at least two are openly linked below. For Cooper specifically, Whitt's `ErlangBandCFormulas.pdf` restates every result you actually need.

---

## Tier 3 — Staffing algorithms and asymptotics

| Source | Link | Notes |
|---|---|---|
| **Halfin, S. & Whitt, W. (1981).** "Heavy-traffic limits for queues with many exponential servers." *Operations Research* 29(3), 567–588 | 🔗 https://www.columbia.edu/~ww2040/HalfinWW1981.pdf · 🔒 https://www.jstor.org/stable/170115 | **The** square-root staffing paper. Origin of the QED regime. Free author copy verified. |
| **Harel, A. (1990).** "Convexity properties of the Erlang loss formula." *Operations Research* 38, 499–505 | 🔒 doi.org/10.1287/opre.38.3.499 | Establishes the convexity that makes marginal analysis valid |
| **Harel, A. (1988).** "Sharp bounds and simple approximations for the Erlang delay and loss formulas." *Management Science* 34, 959–972 | 🔒 | Practical closed-form approximations |
| **Messerli, J.F. (1972)** | 🔒 | Discrete convexity of B in s — the basis for optimal search |
| **Fox, B.L. (1966).** "Discrete optimization via marginal analysis." *Management Science* 13(3), 210–216 | 🔒 | The marginal-analysis method itself |
| **Dyer, M.E. & Proll, L.G. (1977).** "On the validity of marginal analysis for allocating servers in M/M/c queues." *Management Science* 23, 1019–1022 | 🔒 | **Read this before trusting marginal analysis** — it establishes the conditions |
| **Krishnan, K.R. (1988)** | — | Unpublished manuscript (cited in Whitt's Hw. 15) |
| **Borst, S., Mandelbaum, A. & Reiman, M. (2004).** "Efficiency-driven heavy-traffic approximations for many-server queues with abandonments." *Management Science* 50(10), 1449–1461 | 🔒 doi.org/10.1287/mnsc.1040.0279 | Asymptotic optimisation with abandonment |
| **Janssen, J., van Leeuwaarden, M. & Mandelbaum, A.** | 🔒 | Asymptotic analysis with abandonment |
| **Whitt, W. (2015).** "Heavy-Traffic (HT) Approximations." IEOR 4615 lecture 13 | 🔗 https://www.columbia.edu/~ww2040/4615S15/Lec_13_HT_Approximations.pdf | **Accessible statement of the Halfin–Whitt limit theorem**, with the heavy-traffic parameterisation. Better starting point than the 1981 paper if the measure theory is heavy going. |
| **Harrison, J.M., et al. (2004).** "Dynamic scheduling of a multiclass queue in the Halfin–Whitt heavy-traffic regime." *Operations Research* 52(2) | 🔗 https://business.columbia.edu/sites/default/files-efs/pubfiles/3902/dynamic_scheduling.pdf | Extends QED to **multiclass / skills-based routing** — directly relevant if dispatch pools are split by discipline |
| **van Leeuwaarden, J.S.H., Mathijsen, B.W.J. & Zwart, B. (2019).** "Economies-of-scale in many-server queueing systems." *SIAM Review* | 🔒 doi.org/10.1137/17M1133944 | Modern tutorial and partial review of the QED regime |
| **Goldberg, S., et al. (2017).** "Heavy-tailed queues in the Halfin–Whitt regime" | 🔗 https://people.orie.cornell.edu/dag369/ftp/Goldberg_Heavy_Tails_Halfin_Whitt_ARXIV.pdf | **The caveat to square-root staffing.** Shows that when service times have infinite second moment, `√` scaling is *no longer appropriate*. Relevant if SynthCCD's lognormal σ is ever large enough to matter. |

---

## Tier 4 — Call-centre reality (does the model match the world?)

| Source | Link | Notes |
|---|---|---|
| **Gans, N., Koole, G. & Mandelbaum, A. (2003).** "Telephone call centers: tutorial, review, and research prospects." *M&SOM* 5(2), 79–141 | 🔗 https://aviman.technion.ac.il/files/References/CCReview.pdf · repository https://repository.upenn.edu/handle/20.500.14332/42038 | **The standard review — start here.** Free full text verified. Covers Erlang A, abandonment, routing, and why traditional models are "fundamentally limited". |
| **Mandelbaum, A. & Zeltyn, H. (2000)** | 🔒 | The canonical call-by-call data description |
| **Zhao, L., et al. (2005).** "Statistical analysis of a telephone call center: A queueing-science perspective." *JASA* 100, 425–437 | 🔒 | **Directly on point** — tests whether Erlang C/A predictions hold empirically. *Note: the Wharton author PDF link that circulated for this is now dead (404); go through JASA.* |
| **Garnett, G., Mandelbaum, A. & Reiman, M. (2002).** "Designing a call center with impatient customers." *M&SOM* 4(3), 208–227 | 🔒 | Exact and approximate M/M/N+M (Erlang A) expressions |
| **Whitt, W. (2015).** "Review of Birth-and-Death Queueing Models — A Reference Model for Call Centers: Erlang A." IEOR 4615 lecture 5 | 🔗 http://www.columbia.edu/~ww2040/4615S15/Lec_5_BD_Review.pdf | **Concise, clear introduction to Erlang A.** Four parameters, the death-rate structure, and the θ = μ → Poisson reference case. |
| **Davis, J.L., Massey, W.A. & Whitt, W. (1995).** "Sensitivity to the service-time distribution in the nonstationary Erlang loss model." *Management Science* 41, 1107–1116 | 🔒 | **Critical caveat.** Quantifies how much the answer moves when service time departs from exponential. No open copy located. |
| **Robbins, T.R. (2018).** "Comparing Erlang A and Erlang C" (working paper) | 🔗 https://myweb.ecu.edu/robbinst/PDFs/Comparing%20Erlang%20A%20and%20Erlang%20C%20-%20WP.pdf | **Head-to-head.** Finds Erlang C staffing systems *tend to overstaff*, and that **Erlang A may lead to understaffing**. Verifies the pessimism claim with a fuller treatment than the journal version. |
| **Robbins, T.R. (2019).** "Evaluating the Performance of the Erlang Models for Call Centers." *IJAST* 9(1) | 🔗 https://ijast.thebrpi.org/journals/Vol_9_No_1_March_2019/1.pdf | Peer-reviewed version of the above. C works at low/moderate utilisation; degrades where abandonment is high. Warns about Erlang A under uncertain arrivals. |
| **Robbins, T.R. (2015).** "Experience-Based Routing in Call Center Environments." *Service Science* 7(2), 132–148 | 🔗 https://myweb.ecu.edu/robbinst/PDFs/EBR-FinalProof.pdf | Not about staffing directly, but a worked simulation methodology — useful as a template for the Step 1 Phase 3 simulator. |
| **Robbins, T.R.** "Evaluating Erlang C and Erlang A models for call center staffing" (IEEE) | 🔒 http://ieeexplore.ieee.org/document/8289839 | Conference companion |

---

## Tier 5 — Time-varying demand (the 911-specific problem)

| Source | Link | Notes |
|---|---|---|
| **Whitt, W. (2016).** "Server staffing to meet time-varying demand" | 🔗 https://www.columbia.edu/~ww2040/IIdemand.pdf | **The reference treatment.** Why pointwise-stationary staffing on diurnal demand is a known misuse, and what to do instead. |
| **He, B., Liu, Y. & Whitt, W.** "Staffing a service system with non-Poisson non-stationary arrivals" | 🔗 https://www.columbia.edu/~ww2040/HeLiuWhitt_PEIS_pub.pdf | Extends square-root staffing to MMPP arrivals via the parameter `c²_A` |
| **Kim, S.-H. & Whitt, W. (2013).** "Estimating waiting times with the time-varying Little's law" | 🔗 https://www.columbia.edu/~ww2040/Kim_Whitt_PEIS_2013.pdf | Needed if you want waiting times rather than counts |
| **Green, L.V., Kolesar, S.S. & Soares, R.A.** "Staffing of time-varying queues to achieve time-stable performance" | 🔒 | Intraday staffing that holds the delay target flat. *Management Science* 54(2), 324–338. No open copy located. |
| **Brown, E., Gans, N., et al. (2005).** "A empirical analysis of call center arrivals" | 🔒 | Empirical variability in arrival and service distributions |
| **Bassamboo, S., Harrison, J.M. & Mandelbaum, A. (2005)** | 🔒 | Optimisation with variable and uncertain arrivals |
| **Whitt, W. (2006)** | 🔒 | Staffing with arrival-rate *and* staffing uncertainty (absenteeism) |
| **Brown, L.D. & Greenspan, E.K.** "Forecasting inhomogeneous Poisson processes" | 🔗 https://arxiv.org/pdf/0807.4071 | **Directly relevant to the forecasting experiment.** Models the √-transformed counts, which are approximately normal for Poisson — the basis of a practical forecasting workflow. |
| **AEH (2005).** "Optimizing call center staffing using simulation and analytic center cutting plane methods" | 🔗 https://people.orie.cornell.edu/shane/pubs/aeh2005.pdf | Shows why traditional stationary formulas miss the shift-linking constraint, and how to solve staffing with it |

---

## Tier 6 — PSAP / 911 specifics

| Source | Link | Notes |
|---|---|---|
| **NENA (2003).** *PSAP Staff Guidelines*, NENA-REF-001-2003 | 🔗 https://cdn.ymaws.com/www.nena.org/resource/resmgr/standards/NENA-REF-001-2003_PSAP_Staff.pdf | **The authoritative PSAP staffing document.** Erlang-based worksheet, "Available Working Man-hours per Telecommunicator", the **Manning Ratio** (4.74 in the worked example), **cost per dispatch modelled separately from cost per call**, and staffing accounted per "incoming call **and** dispatch". |
| **NENA.** *PSAP Task Overload Management*, NENA-INF-037 | 🔗 https://cdn.ymaws.com/www.nena.org/resource/resmgr/standards/nena-inf-037_task_overload_m.pdf | **The concurrency source.** Defines "human multitasking" then corrects it: *"The use of the term 'multi-tasking' … is a misnomer. The human brain performs 'context switching', in actuality, not performing tasks simultaneously but rather performing tasks one at a time."* Frames **variable vs. fixed tasks**. Notes **23.5% of PSAPs do not measure workload at all**. |
| **NENA.** *PSAP Staffing Plans: How Many People Do I Really Need?* | 🔗 https://cdn.ymaws.com/www.nena.org/resource/resmgr/ignite/psap_staffing_plans.pdf | Practitioner-level framing of the same workflow |
| **Oregon Legislature (2021).** Endacott & Morris testimony on "Oregon Erlang" | 🔗 https://apps.oregonlegislature.gov/liz/2021R1/Downloads/CommitteeMeetingDocument/240934 | **The single most important empirical finding for Step 2.** Erlang **over**-staffs at low volume and **under**-staffs at high volume; corrected allocations ran **46% lower** for 71% of statewide calls. |
| **Oregon State 9-1-1 Programme (2018).** Quarterly PSAP report | 🔗 https://apps.oregonlegislature.gov/liz/2021R1/Downloads/CommitteeMeetingDocument/240934 *(testimony)* · program page: stage.oregon.gov/oem | Documents the **additional factors** Oregon layers on top of base Erlang C: ten highest busy hours over 18 months, volume doubled for abandoned calls, +60 s for transfers/referrals/wrap-up, 1 supervisor per 8 consoles. *(The quarterly PDF itself returns 401 to automated requests.)* |
| **Minnesota OLA (PEI) (1998).** *9-1-1 Dispatching Performance Measurement* | 🔗 https://www.auditor.leg.state.mn.us/ped/pedrep/9806appb.pdf | **The warning about saturation rate.** *"A PSAP interested in measuring only efficiency … might have a relatively high number of calls per dispatcher but be lacking in the quality of its service."* Efficiency measures are to be paired with outcome measures and compared to the centre's **own baseline**. |
| **UCA.** *Minimum Standards and Best Practices for PSAPs* — ECaTS Staffing Forecast Module | 🔗 https://www.uca911.org/file/93f81d78-87f8-4d52-9ed8-ec09b4294a49 | **The regulatory hook.** PSAP staffing compliance *is* Erlang C at 95% service level / 15-second answer target / 10-second wrap-up. States **dispatchers do not count in the totals** — which is exactly why Step 2 is separate. |
| **Utah (2021).** Proposed rule language | 🔗 https://www.utah.gov/pmn/files/733987.pdf | Evidence that the ECaTS/Erlang-C requirement is being **deleted** from state standards — the incumbent is not permanent |
| **FCC (2015).** *Task Force on Optimal PSAP Architectures, WG2 Final Report* | 🔒 https://transition.fcc.gov/pshs/911/TFOPA/TFOPA_WG2_FINAL_Report-121015.pdf | PSAP operational models, centralised call taking, consolidation trade-offs. *(403 to automated fetch; accessible in a browser.)* |
| **Maine PUC (2024).** *PSAP Oversight and Staffing* | 🔗 https://www.maine.gov/maine911/sites/maine.gov.maine911/files/inline-files/PUC%20PSAP%20report.pdf | Notes **one 9-1-1 call can generate one or more CAD incidents** — a fan-out ratio affecting λ |
| **CalOES (2024).** *California PSAP and Staffing Study* | 🔗 https://www.caloes.ca.gov/wp-content/uploads/PSC/Documents/CalOES-2024-Staffing-Study.pdf | Only **17%** of California PSAPs dispatch all three disciplines; cross-trained staff are scarce. Supports modelling pools explicitly. |
| **South Dakota (2025).** *PSAP Efficiency Study* | 🔗 https://boardsandcommissions.sd.gov/bcuploads/SD%20PSAP%20Efficiency%20Study%20Report%20Final%20(01-28-25).pdf | Consolidation KPIs, vacancy-rate/efficiency trade-off, statewide |
| **POST (1991).** *Public Safety Dispatcher Job Analysis* | 🔗 https://post.ca.gov/portals/0/post_docs/publications/Dispatcher-Component_1.pdf | 121 core tasks across 8 job activity areas, 160+ agencies. The task decomposition needed to separate *active handling* from *passive monitoring*. Confirms dispatchers "frequently entail handling multiple simultaneous calls". |
| **New Mexico (2012).** *Department of Public Safety Staffing Study* | 🔗 https://isr.unm.edu/reports/2012/new-mexico-department-of-public-safety-staffing-study-final-report.pdf | The **Mandelbaum–Pittel** metric family, including **"probability that all units are simultaneously busy"** — a direct concurrency measure |
| **Portland (OR) BOEC.** Dispatch staffing and CAD incident reports | 🔗 https://www.portland.gov/911/documents/directors-report-may-2023-data-only-0/download | **Real-world public data** for later validation: CAD incidents by discipline and jurisdiction, monthly |
| **Borstein, M., Mandelbaum, A. & Reiman, M. (2000).** "Dimensioning large call centers." Working paper | — | Dimensioning large contact centres. No open copy located. |

---

## Tier 7 — Implementation

| Source | Link | Notes |
|---|---|---|
| **SimPy** | 🔗 https://simpy.readthedocs.io | Discrete-event simulation for Python. The Phase 3 choice for both studies; `simpy.resources` has ready M/M/c and Store-with-capacity patterns |
| **`scipy.stats`** | 🔗 https://docs.scipy.org/doc/scipy/reference/stats.html | Distribution fitting for service time and patience characterisation |
| **pandas `groupby` + `merge_asof`** | 🔗 https://pandas.pydata.org/docs/ | For the interval arithmetic in Step 2 Phase 1 |
| **Veritext / Call Centre Helper Erlang calculators** | 🔒 | Commercial cross-checks for your own implementations against industry tools |

---

## Tier 8 — Forecasting demand (Step 3)

### 8a. Emergency demand forecasting

| Source | Link | Why it matters |
|---|---|---|
| **Setzler, Saydam & Park (2009).** "An empirical investigation of forecasting methods for ambulance calls." | 🔗 https://pmc.ncbi.nlm.nih.gov/articles/PMC8567893/ | **The direct benchmark for this experiment.** Compares ARIMA, Holt-Winters, multiple regression and SSA. Finds **ARIMA best for weekly/monthly**, with best order **(1,1,1)(2,0,0)** for emergency demand; Holt-Winters within ~14 calls. |
| **"Are EMS call volume predictions based on demand pattern analysis accurate?"** (2007) | 🔗 https://pubmed.ncbi.nlm.nih.gov/17454807/ | **Tests the vendor's method class directly.** 7 EMS systems, 73 weeks, 61,152 hourly observations. Exact accuracy only **10–19%**; **over-prediction 74–86%** of the time. *"Accurately predicted peaks and troughs… but not exact call volume."* |
| **Shane, G. et al.** "Forecasting emergency medical service call arrival rates" | 🔗 https://people.orie.cornell.edu/shane/pubs/ForecastEMSTime.pdf | Integer-valued models for hourly counts. Explicitly criticises Gaussian-on-counts because it *"conflicts with the Poisson distribution assumption used in operations research methods for optimizing staffing levels."* |
| **NYC EMS metalearner (2021)** | 🔗 https://pubmed.ncbi.nlm.nih.gov/34139474/ | 7.36M dispatches over 43,823 hours; MAE 11.5, R²≥0.91. **Hour-of-day and trailing 6-hour mean are the top features.** Strong at frequent peaks, weaker at both extremes. |
| **MEDIC benchmark** (via arXiv 1806.10873) | 🔗 https://arxiv.org/pdf/1806.10873 | The seasonal-naive benchmark: *"the prediction for a given hour is the average of the call rates observed in the same hour of the previous weeks over the past month… said to be industry practice."* |
| **Beijing hybrid demand forecasting** | 🔗 https://pmc.ncbi.nlm.nih.gov/articles/PMC13104476/ | CatBoost/LightGBM beat ARIMA/VAR/Prophet; **Prophet excels at long-horizon trend and seasonality**; ensemble averaging is robust |
| **Martin, R.J. et al. (2021).** "Predicting emergency medical service call demand" | 🔒 https://www.sciencedirect.com/science/article/abs/pii/S2211692321000011 | MLP approach; notes EMS demand *"tends to be stationary and repetitive"* at daily/hourly scale |
| **Brown & Greenspan.** "Forecasting inhomogeneous Poisson processes" | 🔗 https://arxiv.org/pdf/0807.4071 | **√-transform makes Poisson counts approximately normal** — the transform-based baseline, and the basis of the square-root staffing link |

### 8b. Conformal prediction

| Source | Link | Why it matters |
|---|---|---|
| **Xu & Xie (2021).** "Conformal Prediction Interval for Dynamic Time-Series" (**EnbPI**), PMLR 139 | 🔗 https://proceedings.mlr.press/v139/xu21h/xu21h.pdf | **Start here.** Approx. valid marginal coverage for **non-stationary, non-exchangeable** series. Works from ensemble point estimates without refitting. |
| **Xu & Xie (2023).** "Sequential Predictive Conformal Inference for Time Series" (**SPCI**), PMLR 202 | 🔗 https://proceedings.mlr.press/v202/xu23r/xu23r.pdf | **The peak-coverage answer.** Models the *conditional quantile* of residuals, giving **asymptotic conditional coverage** under temporal dependence. |
| **Gibbs, Cherian & Candès (2023).** "Conformal Prediction with Conditional Guarantees" | 🔗 https://arxiv.org/pdf/2305.12616 | **The impossibility result and the workaround.** Exact conditional coverage is impossible without assumptions; this gives *approximate* conditional validity. Essential for framing the §4 caveat honestly. |
| **Conformal Prediction Algorithms for Time Series Forecasting (benchmark)** | 🔗 https://arxiv.org/pdf/2601.18509 | Empirical comparison of conformal methods for TS — coverage vs interval efficiency trade-off |
| **A Few Observations on Sample-Conditional Coverage in Conformal Prediction** | 🔗 https://web.stanford.edu/class/stats315a/Reading/conformal-thoughts.pdf | Accessible treatment of why marginal ≠ conditional, and where quantile regression helps |
| Romano, Patterson & Candès (2019) — **CQR** | 🔒 | Conformalised quantile regression; sharper intervals than normalised split conformal |
| Vovk, Gammerman & Shafer (2005) — *Algorithmic Learning in a Random World* | 📖 | Origin of split conformal |
| Lei, G'Sell, Rinaldo, Tibshirani & Wasserman (2013) | 🔒 | The original impossibility-of-conditional-coverage result |
| Guan (2023) LCP · Hore & Barber (2025) RLCP · Gibbs et al. (2025) CC | 🔒 | Localised / randomised-local / direct-quantile routes to conditional coverage |

### 8c. Hierarchical / compositional forecasting (Step 3 multivariate design)

| Source | Link | Why it matters |
|---|---|---|
| **Athanasopoulos, Hyndman, Kourentzes & Panagiotelis (2023).** "Forecast reconciliation: A review." *International Journal of Forecasting* | 🔗 https://robjhyndman.com/papers/hf_review.pdf · 🔒 https://www.sciencedirect.com/science/article/pii/S0169207023001097 | **Read this first.** Defines coherence, the coherent subspace, and the full reconciliation method family. The reference for §6.2. |
| **Wickramasuriya, Athanasopoulos & Hyndman (2019).** "Optimal forecast reconciliation for hierarchical and grouped time series." *Foresight* | 🔗 https://robjhyndman.com/papers/Foresight-hts-final.pdf | The optimal-reconciliation estimator underlying **MinT** |
| Wickramasuriya, Athanasopoulos & Hyndman (2019). "MinT" | 🔒 | Minimum-trace reconciliation — the standard default method |
| **Discrete forecast reconciliation for counts** (2023) | 🔗 https://arxiv.org/pdf/2305.18809 | **Required here.** Shows linear reconciliation + rounding breaks coherence on counts; supplies a discrete framework via quadratic programming on the Brier score |
| **Properties of the reconciled distributions for Gaussian and count forecasts** | 🔗 https://arxiv.org/pdf/2303.15135 | **The H10 source.** *"Reconciliation decreases the variance of base forecasts that are right-skewed… lowering the expected values."* Direct staffing consequence. |
| Athanasopoulos et al. (2020) — temporal reconciliation | 🔒 | Cross-temporal (within-week) reconciliation |

### 8d. PSAP regulatory context — abandonment and callbacks

| Source | Link | Why it matters |
|---|---|---|
| **N.J.A.C. 17:24-2.1** (PSAP required equipment) | 🔗 https://www.law.cornell.edu/regulations/new-jersey/N-J-A-C-17-24-2-1 | **The most useful find.** Requires recording abandoned calls including *"the trunk line the call came in on"* — trunk-level attribution is a **recording requirement** in at least one state. Bears directly on §6.6. |
| **N.J.A.C. 17:24-1.2** (definitions) | 🔗 https://www.law.cornell.edu/regulations/new-jersey/N-J-A-C-17-24-1-2 | Defines *"Abandoned call"*, **Ringback** (*"a feature that permits the PSAP to ring the hung up telephone on a held circuit"*), and grade-of-service language |
| **New York (2025).** *Final Adopted PSAP Minimum Standards* | 🔗 https://www.dhses.ny.gov/system/files/documents/2025/02/2025-0129-final-adopted-psap-minimum-standards.pdf | Requires *"policy and procedure for handling silent, misdialed, prank, abandoned and disconnected 911 requests"* — establishes the callback obligation as **policy**, which is why it varies by state |
| **N.J.A.C. 17:24-3.2** (PSDP required staffing) | 🔒 https://www.law.cornell.edu/regulations/new-jersey/N-J-A-C-17-24-3-2 | *"Each PSDP shall, at all times, be staffed with the number of dispatchers necessary to permit the PSDP to comply with the level of dispatch performance established by the local governing agencies."* — **notice this is performance-based, not volume-based.** Direct support for §7 and C5. |
| Illinois Admin Code 1325.200 · Connecticut § 28-27a-2a · Maine 65-625 | 🔒 | Comparable minimum-standards frameworks in other states |

---

## Citation hygiene

- Prefer the **publisher or author copy**. Whitt's papers are freely posted at `columbia.edu/~ww2040/` — that is the canonical location, not a mirror.
- The local `ErlangBandCFormulas.pdf` is a course handout from Columbia's IEOR 6707. Cite it as course material; cite **Cooper (1981)** and **Halfin & Whitt (1981)** for the underlying results.
- Record **which model, which assumptions, which date range**. "Erlang C was used" is not reproducible; "Erlang C, 911 stream only, 15-min intervals, ρ<1 enforced, 2026-01-05→2026-02-01" is.

## Status

- [x] Every link HTTP-checked on 2026-10-13; status recorded per entry
- [x] Tier 1 — anchor source + modern replacement
- [x] Tier 2 — queueing foundations (books marked 📖, no open copy exists)
- [x] Tier 3 — staffing algorithms and asymptotics
- [x] Tier 4 — call-centre empirical reality
- [x] Tier 5 — time-varying demand
- [x] Tier 6 — PSAP/911 regulation and practice
- [x] Tier 7 — implementation tooling
- [ ] Re-verify links before submission
- [ ] Add Zotero/DBLP IDs once the write-up starts