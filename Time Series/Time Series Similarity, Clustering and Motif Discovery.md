---
type: reference
status: active
topic: "Time series similarity, clustering, motif discovery and dimensionality reduction — DTW, the matrix profile, k-Shape, and the two results that make naive sliding-window clustering meaningless."
created: 2026-10-15
tags:
  - time-series
  - similarity
  - clustering
  - motif-discovery
  - matrix-profile
  - dimensionality-reduction
aliases:
  - Time Series Clustering
  - Matrix Profile
  - Motif Discovery
  - DTW
  - stumpy
  - k-Shape
---

# Time Series Similarity, Clustering and Motif Discovery

Three questions live here, and they are related but not the same:

1. **Are these series alike?** — clustering and distance measures
2. **What shapes recur inside one series?** — motif and discord discovery
3. **Can I see many series at once?** — dimensionality reduction

> Written 2026-10-15. Previously: `DTW` had **0 hits** anywhere in the vault; Matrix Profile had
> one line in [[Time Series Anomaly Detection]]; clustering had 20 hits, none in the forecasting
> folders and none about time series.

> **This note is front-loaded with two results that invalidate the obvious approaches.** §2 and §4
> are not decoration — if you skip them you will produce output that looks like clusters and is
> actually noise.

---

## 1. Distances: Euclidean, DTW, and when each is wrong

### 1.1 Euclidean

$d(x, y) = \sqrt{\sum_i (x_i - y_i)^2}$. Assumes the two series are **aligned index-to-index**. For
periodic hourly data with a stable period, this is often exactly right and it is **much** cheaper.

### 1.2 DTW

**Berndt, D.J. & Clifford, J. (1994). "Using Dynamic Time Warping to Find Patterns in Time Series."
Papers from the AAAI Workshop on Knowledge Discovery in Databases, Technical Report WS-94-03,
359–370.**

> **⚠️ It is 1994, not 1993.** This is one of the most commonly miscited papers in time series mining.

The canonical textbook treatment is **Müller (2007), *Information Retrieval for Music and Motion*,
Springer, Chapter 4, pp. 69–84.** 🔗 `10.1007/978-3-540-74048-3`

DTW allows the alignment itself to be optimised. This is what you want when the same *shape*
appears at slightly different speeds — a rush-hour build-up that takes 40 minutes one day and 55
the next.

**Cost:** $O(n \times m)$ versus $O(n)$ for Euclidean. The mitigations, in order of importance:

| Mitigation | Citation | Note |
|---|---|---|
| **LB_Keogh** lower bound + Sakoe–Chiba band | Keogh & Pazzani (2000), *KDD*, 🔗 `10.1145/347090.347153` | The standard pruning. **Use this.** |
| Derivative DTW | Keogh & Pazzani (2001), *SDM* 🔗 `10.1137/1.9781611972719.1` | |
| Learned/constrained warping window | Tan, Herrmann, Forestier, Webb & Petitjean (2018), *SDM* 🔗 `10.1137/1.9781611975321.26` | **Best choice for 168-periodic data** — you can constrain warping to well under one day |
| "Three myths about DTW" | Ratanamahatana & Keogh (2005), *SDM* 🔗 `10.1137/1.9781611972757.50` | Read this before tuning any warping parameter |
| FastDTW | Salvador & Chan (2007), ***Intelligent Data Analysis* 11(5):561–580**, 🔗 `10.3233/IDA-2007-11508` | **See the warning below** |

> **⚠️ FastDTW's citation is usually wrong.** The co-author is **Philip Chan** — not "Whatm" — and
> the journal is ***Intelligent Data Analysis***, not *Journal of Intelligent Information Systems*.
> Those two journals have confusingly similar names. The DOI `10.1007/s10844-006-0059-9` does not
> resolve.

> **⚠️ And do not use FastDTW in production without this:** **Wu, R. & Keogh, E.J. (2021). "FastDTW
> is approximate and Generally Slower than the Algorithm it Approximates (Extended Abstract)."
> *ICDE 2021*, 2327–2328.** 🔗 `10.1109/ICDE51399.2021.00249`. They show it is slower than the
> LB_Keogh-pruned exact algorithm it approximates. **Use LB_Keogh instead.**

---

## 2. ⚠️ Matrix Profile z-normalises — and for call volume that destroys the signal

This is the most important technical trap in the note, and it is specific to this vault's data.

`stumpy.stump` computes the **z-normalised** Euclidean distance between every subsequence and its
nearest non-trivial neighbour. So a normal-looking Tuesday 03:00 and a 40-call anomaly hour with the
same *shape* are at distance ≈ 0, because both get scaled to mean 0 and variance 1 first.

> **For 9-1-1 call volume, absolute level carries meaning.** A 40-call hour at 03:00 is not
> remotely the same event as a 40-call hour at 19:00. **z-normalisation throws away exactly the
> information you care about.**

**Options:**
- `stumpy.aamp` / `stumpy.scraamp` — the **non-z-normalised** Euclidean variants
- `aeon`'s search estimators with `normalize=False`
- Write a custom cost, which is documented for `ruptures` and stumpy

> **Say which you used and why, every time.** A motif discovered on z-normalised distances is a
> statement about shape; a motif on raw distances is a statement about shape *and level*. They are
> different findings.

---

## 3. ⚠️ Clustering sliding-window subsequences is meaningless

**Keogh, E. & Lin, J. (2005). "Clustering of time-series subsequences is meaningless: implications
for previous and future research." *Knowledge and Information Systems* 8(2):154–177.** 🔗
`10.1007/s10115-004-0172-7`

Preceded by ICDM 2003 (with Truppel) 🔗 `10.1109/ICDM.2003.1250910`.

The result, stated plainly: **if you take a long series, extract every sliding window of some fixed
length, and run k-means on them, you will get cluster centres that are all essentially the same
sinusoid.** The algorithm finds trivial matches (a sliding window of a sine wave is highly similar
to its neighbour, and the next, and the next), not genuine structure. It looks exactly like
successful clustering. It is not.

This is a **theorem**, not a warning about tuning. It invalidates the most intuitive thing a
practitioner would try.

> **The fix is motif-based clustering with trivial-match exclusion, which is functionally what the
> matrix profile gives you for free** — plus always reporting window size, which is a free
> parameter with no default. For variable-length motifs, **Linardi, M., Zhu, Y., Palpanas, T. &
> Keogh, E. (2020). "Matrix profile goes MAD." *DMKD* 34(4):1022–1071.** 🔗
> `10.1007/s10618-020-00685-w`

---

## 4. The methods

### 4.1 Matrix Profile — the practical workhorse

**Matrix Profile I: Yeh, Zhu, Ulanova, Begum, Ding, Dau, Silva, Mueen & Keogh (2016). "Matrix
Profile I: All Pairs Similarity Joins for Time Series: A Unifying View That Includes Motifs,
Discords and Shapelets." *ICDM 2016*, 1317–1322.** 🔗 `10.1109/ICDM.2016.0179`

Journal version (the one people actually read): Yeh et al. (2018). "Time series joins, motifs,
discords and shapelets: a unifying view that exploits the matrix profile." *DMKD* 32(1):83–123. 🔗
`10.1007/s10618-017-0519-9`

| Paper | Correct title | Venue | DOI |
|---|---|---|---|
| **Matrix Profile II** | *Exploiting a **Novel Algorithm and GPUs** to Break the One Hundred Million Barrier…* | ICDM 2016, 739–748 | `10.1109/ICDM.2016.0085` |
| **Matrix Profile III** | *The Matrix Profile Allows **Visualization** of Salient Subsequences in Massive Time Series* | ICDM **2016**, 579–588 | `10.1109/ICDM.2016.0069` |
| **Matrix Profile XI** | *SCRIMP++: Time Series Motif Discovery at Interactive Speeds* | ICDM 2018, 837–846 | `10.1109/ICDM.2018.00099` |

> **⚠️ "Matrix Profile III: Time Series Motif Discovery with Application to Monitoring" does not
> exist.** There is no such paper in Crossref, on the web, or in Keogh's own publication list. The
> real MP III is the 2016 visualisation paper above. "AOMP" is also **not** a matrix-profile
> algorithm — it is AMD's OpenMP compiler.

### 4.2 stumpy — the tool

**v1.14.1, BSD-3-Clause, NumFOCUS-affiliated.** 🔗 https://github.com/stumpy-dev/stumpy

> **Law, S.M. (2019). "STUMPY: A Powerful and Scalable Python Library for Time Series Data Mining."
> *JOSS* 4(39):1504.** 🔗 `10.21105/joss.01504`

| Function | What it gives you |
|---|---|
| `stump` / `stumped` / `gpu_stump` | Exact z-normalised matrix profile; distributed; GPU |
| `scrump` | **SCRIMP** — approximate, anytime. `pre_scrump=True` is *documented as equivalent to SCRIMP++* |
| `stumpi` | **Online / streaming** — a class with `.update()`, for live monitoring |
| `aamp` / `scraamp` | **Non-z-normalised** — use these for call volume (§2) |
| `stimp` | **Pan Matrix Profile** — the profile across *many* window sizes, so you do not guess it |
| `mass` | MASS distance profile via FFT |
| `mstump` | Multivariate / multi-dimensional profile |
| `motifs` / `mmotifs` | Top-k motif discovery |
| `fluss` / `floss` / `atsc` | Semantic segmentation, chains |
| `mpdist` / `snippets` | Whole-series distance; long-series summarisation |

### 4.3 Motif and discord discovery

The lineage (all verified, all real — the frequently-cited *"Keogh, Lonardi & Lee (2004),
Efficiently Identifying Interesting Motifs and Discordances in Time Series Databases, ICDM 2004"*
**could not be found in any database**):

| Paper | Venue | DOI |
|---|---|---|
| Patel, Keogh, Lin & Lonardi (2002), *Mining motifs in massive time series databases* | ICDM 2002, 370–377 | `10.1109/ICDM.2002.1183925` |
| Chiu, Keogh & Lonardi (2003), *Probabilistic discovery of time series motifs* | SIGKDD 2003, 493–498 | `10.1145/956750.956808` |
| Keogh, Lin, Lee & Van Herle (2006), *Finding the most unusual time series subsequence* | *KAIS* 11(1):1–27 | `10.1007/s10115-006-0034-6` |
| Keogh, Lin & Fu (2005), *HOT SAX* | ICDM 2005, 226–233 | `10.1109/ICDM.2005.79` |
| Linardi et al. (2020), *Matrix profile goes MAD* — variable-length motifs | *DMKD* 34(4) | `10.1007/s10618-020-00685-w` |

**SAX** — symbolic aggregate approximation, the discretisation that makes motif search cheap:
**Lin, J., Keogh, E., Wei, L. & Lonardi, S. (2007). "Experiencing SAX: a novel symbolic
representation of time series." *Data Mining and Knowledge Discovery* 15(2):107–144.** 🔗
`10.1007/s10618-007-0064-z`

> **⚠️ It is *DMKD*, not SDM.** Conference precursor: Lin, Keogh, Lonardi & Chiu (2003) 🔗
> `10.1145/882082.882086`. R: `jmotif`; Python: `tslearn.piecewise.SymbolicAggregateApproximation`.

### 4.4 Clustering — and the one that is actually safe here

**k-Shape: Paparrizos, J. & Gravano, L. (2015). "k-Shape: Efficient and Accurate Clustering of Time
Series." *SIGMOD 2015*, 1855–1870.** 🔗 `10.1145/2723372.2737793`

> **⚠️ The co-author is Luis Gravano, not Likas.** Also: k-Shape is correlation-based — it is
> scale- and shift-invariant, which for call volume means it clusters *shape* and discards level.
> Same caveat as §2.

**DBA / barycenter averaging: Petitjean, F., Ketterlin, A.-L. & Gançarski, P. (2011). "A global
averaging method for dynamic time warping, with applications to clustering." *Pattern Recognition*
44(3):678–693.** 🔗 `10.1016/j.patcog.2010.09.013`. Note Jain (2019) contests its optimality: 🔗
`10.1016/j.patrec.2019.05.022`

### 4.5 The libraries

| Library | Version | Licence | Provides |
|---|---|---|---|
| **`aeon`** | **1.6.0** | BSD-3 | `TimeSeriesKMeans`, `TimeSeriesKMedoids`, `CLARA`, `CLARANS`, `TimeSeriesKernelKMeans`, `KASBA`, `KShape`, `KSpectralCentroid`, `ElasticSOM`, `TimeSeriesAgglomerative`. Averaging: `petitjean_barycenter_average`, `subgradient_barycenter_average`, `elastic_barycenter_average`. **Plus `Catch22Clusterer`, `SummaryClusterer`, `TSFreshClusterer`.** `MatrixProfileTransformer` wraps stumpy |
| **`tslearn`** | **0.9.0** | BSD-2-Clause | `TimeSeriesKMeans` (euclidean/dtw/softdtw), `KernelKMeans`, **`KShape`**, `TimeSeriesDBSCAN`, `dtw_barycenter_averaging`, SAX, `MatrixProfile` |
| `stumpy` | 1.14.1 | BSD-3 | Matrix profile and its variants |
| `sktime` | 1.2.0 | BSD-3 | The forecasting/estimation library; `MatrixProfileTransformer` via aeon |

**Canonical citations:** **Middlehurst, M., Ismail-Fawaz, A., Guillaume, A., Holder, C., Guijo-Rubio,
D., Bulatova, G., Tsaprounis, L., Mentel, L., Walter, M., Schäfer, P. & Bagnall, A. (2024). "aeon: a
Python Toolkit for Learning from Time Series." *JMLR* 25(289):1–10** 🔗
https://www.jmlr.org/papers/v25/23-1444.html (JMLR does not mint DOIs.)

**On the sktime/aeon split**, because it is usually misremembered: aeon forked from **sktime
v0.16.0**. **The classification / regression / clustering / transformation line went to aeon;
sktime continued as the forecasting and estimation library.** Both are alive and both actively
release. It is not accurate to say the sklearn time-series work "moved to aeon/sktime."

---

## 5. Clustering that avoids all three traps

The z-normalisation problem (§2), the meaningfulness problem (§3), and the window-size problem are
all avoided simultaneously by clustering **series on feature vectors**, not on raw series or on
windows.

**Wang, X., Smith, K. & Hyndman, R.J. (2006). "Characteristic-Based Clustering for Time Series
Data." *DMKD* 13(3):335–364.** 🔗 `10.1007/s10618-005-0039-x`

**Hyndman, R.J., Wang, E. & Laptev, N. (2015). "Large-Scale Unusual Time Series Detection." *ICDMW
2015*, 1616–1619.** 🔗 `10.1109/ICDMW.2015.104` — feature vector per series → PCA → bivariate
outlier detection on PC1/PC2 with highest-density regions.

**Kang, Y., Hyndman, R.J. & Smith-Miles, K. (2017). "Visualising forecasting algorithm performance
using time series instance spaces." *IJF* 33(2):345–358.** 🔗
`10.1016/j.ijforecast.2016.09.004` — **this is the canonical citation for PCA on time-series
features for dimension reduction and anomaly detection.**

**catch22: Lubba, C.H., Sethi, S.S., Knaute, P., Schultz, S.R., Fulcher, B.D. & Jones, N.S. (2019).
"catch22: CAnonical Time-series CHaracteristics." *DMKD* 33(6):1821–1852.** 🔗
`10.1007/s10618-019-00647-x`

> **⚠️ This citation is frequently fabricated.** The commonly-cited *"Wild, Stepka & Escaida (2021),
> Catch22: A Univariate Time Series Classification Toolbox, *Chaos* 31(10)"* — I enumerated all 40
> papers in *Chaos* 31(10)–31(11) and there is no such paper, and no authors by those names anywhere
> in this literature. The real paper is **Lubba, Sethi, Knaute, Schultz, Fulcher & Jones (2019),
> *DMKD* 33(6)** — 22 features distilled from 4,791 `hctsa` features, calibrated on 93 datasets.
> Note **`pycatch22` is GPL-3.0**, not BSD, which matters if you plan to redistribute.

`aeon`'s `Catch22Clusterer` is the direct bridge: feature-vector clustering sidesteps z-normalisation,
the meaningless-subsequence theorem, and the window-size choice **all at once**.

---

## 6. Dimensionality reduction

**FPP3 Chapter 4 §4.5, "Exploring Australian tourism data"**: compute 48 features across 304 series,
`prcomp(scale = TRUE)`, plot PC1 vs PC2 — and **four series fall out as anomalies** with unusual
feature combinations. The chapter's own Further Reading attributes the approach to **Kang, Hyndman &
Smith-Miles (2017)**.

> **t-SNE** — van der Maaten & Hinton (2008), *JMLR* 9(86):2579–2605 🔗
> https://www.jmlr.org/papers/v9/vandermaaten08a.html (**JMLR mints no DOIs — do not invent one**).
> Known limitations: no out-of-sample extension, cluster sizes are not meaningful, global structure
> distorted.
>
> **UMAP** — McInnes, Healy, Saul & Großberger (2018), *JOSS* 3(29):861 🔗
> `10.21105/joss.00861`. ⚠️ Do not accidentally cite the R wrapper `uwot` DOI as the paper DOI.
>
> **Functional PCA** — Ramsay, J.O. & Silverman, B.W. (2005). *Functional Data Analysis*, Springer 🔗
> `10.1007/b98888`; **FPCA is Chapter 8, pp. 147–172** 🔗 `10.1007/0-387-22751-2_8`; regularised
> FPCA is Ch. 9.

> **⚠️ A filing correction.** Cerqueira, Torgo & Mozetič (2020), *Machine Learning* 109(11):1997–2028
> 🔗 `10.1007/s10994-020-05910-7` is often filed under dimensionality reduction. **It is not** — it
> is a comparative study of *performance estimation methods* (11 resampling protocols, 174 series).
> Read it for evaluation protocol, not dimension reduction.

**Benchmark:** **Dau, H.A., Keogh, E., Kamgar, K., Yeh, C.-C.M., Zhu, Y., Gharghabi, S.,
Ratanamahatana, C.A., Chen, Y., Hu, B., Begum, N., Bagnall, A., Mueen, A., Batista, G. & Hexagon-ML
(2019). "The UCR Time Series Archive." *IEEE/CAA Journal of Automatica Sinica* 6(6):1293–1305.** 🔗
`10.1109/JAS.2019.1911747` — **128 datasets** (verified by downloading `DataSummary.csv`). The 2015
version (Chen et al., 85 datasets) is a **`@misc` website citation with no DOI** — do not give it
one.

---

## 7. Assessment

**Strengths**
- Matrix Profile + stumpy is the only scalable, principled way to find recurring subsequences in a
  long hourly series.
- `stumpi` gives you online motif/discord monitoring if you ever want it in production — a genuine
  fit with [[Forecasting MLOps]] §2.
- `stimp` solves the window-size guess.
- Feature-vector clustering (`Catch22Clusterer`) sidesteps every trap in this note at once.
- The failure-mode literature is strong, exact, and citable — you can prove the obvious approach is
  wrong rather than just asserting it.

**Weaknesses**
- **All the elastic distances and the matrix profile discard level by default.** For count volume
  with meaningful absolute levels, this is disqualifying unless you deliberately switch it off.
- **Sliding-window clustering is provably meaningless.** There is no tuning that fixes it.
- Window size, distance choice, and normalisation are three interlocking choices with no defaults.
- **For a single univariate series, clustering has very little to work on** — the methods here earn their
  place when you have a panel (Douglas County's sub-jurisdictions, a call-type split).
- k-Shape and DBA both have contested optimality claims.

## 8. Try it

- [ ] `stumpy.stump` on the Douglas County series **with `normalize=False`** (or use `aamp`), across
      a grid of window sizes via `stimp`. Confirm the motifs change when you switch normalisation on
      — that is §2, demonstrated
- [ ] **Deliberately reproduce §3.** Run k-means on sliding windows of a single year of hourly counts
      and plot the centroids. You should get sine-wave-like centroids. Knowing what that failure
      looks like on your own data is worth the hour
- [ ] Find the discords with `stumpy.motifs`/`stumpy.mpdist` and check whether they land on known
      incident events. A discord detector that agrees with your incident log is validated on *your*
      data
- [ ] Run `aeon.MatrixProfileTransformer` and `aeon.` `Catch22Clusterer` side by side; confirm the
      feature-based clusters are interpretable
- [ ] If you ever get a multi-series panel: compute `feasts`/catch22 features with **`period=168`**,
      PCA the matrix, and flag outliers — this is FPP3 §4.5 exactly
- [ ] Compare `k-Shape` against `TimeSeriesKMedoids` on the same feature vectors and quantify the
      disagreement. Two clustering algorithms disagreeing is itself a finding
- [ ] If you use DTW, start with a **constrained window from Tan et al. (2018)** rather than an
      unconstrained one, and read Ratanamahatana & Keogh (2005) first

## References

**Distances**

1. Berndt, D.J. & Clifford, J. (1994). Using dynamic time warping to find patterns in time series.
   *AAAI Workshop on KDD, Tech. Report WS-94-03*, 359–370 — **1994, not 1993**
2. Müller, M. (2007). *Information Retrieval for Music and Motion.* Springer. DTW is Ch. 4, 69–84. 🔗
   `10.1007/978-3-540-74048-3`
3. Keogh, E.J. & Pazzani, M.J. (2000). Scaling up dynamic time warping for datamining applications.
   *KDD*, 285–289. 🔗 `10.1145/347090.347153` — LB_Keogh
4. Keogh, E.J. & Pazzani, M.J. (2001). Derivative dynamic time warping. *SDM*. 🔗
   `10.1137/1.9781611972719.1`
5. Tan, C.W., Herrmann, M., Forestier, G., Webb, G.I. & Petitjean, F. (2018). Efficient search of the
   best warping window for dynamic time warping. *SDM*, 225–233. 🔗
   `10.1137/1.9781611975321.26`
6. Ratanamahatana, C.A. & Keogh, E. (2005). Three myths about dynamic time warping data mining.
   *SDM*, 506–510. 🔗 `10.1137/1.9781611972757.50`
7. Salvador, S. & Chan, P. (2007). Toward accurate dynamic time warping in linear time and space.
   ***Intelligent Data Analysis* 11(5):561–580**. 🔗 `10.3233/IDA-2007-11508`
8. **Wu, R. & Keogh, E.J. (2021). FastDTW is approximate and generally slower than the algorithm it
   approximates. *ICDE*, 2327–2328.** 🔗 `10.1109/ICDE51399.2021.00249` ⭐ **cite alongside FastDTW**

**Matrix profile and motifs**

9. Yeh, C.-C.M. et al. (2016). Matrix Profile I. *ICDM*, 1317–1322. 🔗
   `10.1109/ICDM.2016.0179` ⭐
10. Yeh, C.-C.M. et al. (2018). Time series joins, motifs, discords and shapelets. *DMKD*
    32(1):83–123. 🔗 `10.1007/s10618-017-0519-9` — the journal version
11. Zhu, Y. et al. (2016). Matrix Profile II. *ICDM*, 739–748. 🔗 `10.1109/ICDM.2016.0085`
12. Yeh, C.-C.M., Van Herle, H. & Keogh, E. (2016). Matrix Profile III. *ICDM 2016*, 579–588. 🔗
    `10.1109/ICDM.2016.0069`
13. Zhu, Y., Yeh, C.-C.M., Zimmerman, Z., Kamgar, K. & Keogh, E. (2018). Matrix Profile XI: SCRIMP++.
    *ICDM*, 837–846. 🔗 `10.1109/ICDM.2018.00099`
14. Linardi, M., Zhu, Y., Palpanas, T. & Keogh, E. (2020). Matrix profile goes MAD. *DMKD*
    34(4):1022–1071. 🔗 `10.1007/s10618-020-00685-w`
15. Lin, J., Keogh, E., Wei, L. & Lonardi, S. (2007). Experiencing SAX. ***DMKD* 15(2):107–144**. 🔗
    `10.1007/s10618-007-0064-z` *(not SDM)*
16. **Keogh, E. & Lin, J. (2005). Clustering of time-series subsequences is meaningless.** *KAIS*
    8(2):154–177. 🔗 `10.1007/s10115-004-0172-7` ⭐ **read before clustering anything**
17. Patel, Keogh, Lin & Lonardi (2002). Mining motifs in massive time series databases. *ICDM*. 🔗
    `10.1109/ICDM.2002.1183925`
18. Chiu, Keogh & Lonardi (2003). Probabilistic discovery of time series motifs. *SIGKDD*. 🔗
    `10.1145/956750.956808`
19. Keogh, Lin, Lee & Van Herle (2006). Finding the most unusual time series subsequence. *KAIS*
    11(1):1–27. 🔗 `10.1007/s10115-006-0034-6`

**Clustering**

20. Paparrizos, J. & **Gravano, L.** (2015). k-Shape. *SIGMOD*, 1855–1870. 🔗
    `10.1145/2723372.2737793`
21. Petitjean, F., Ketterlin, A.-L. & Gançarski, P. (2011). A global averaging method for dynamic time
    warping. *Pattern Recognition* 44(3):678–693. 🔗 `10.1016/j.patcog.2010.09.013`
22. Jain, B. (2019). Revisiting inaccuracies of time series averaging under dynamic time warping.
    *Pattern Recognition Letters* 125:418–424. 🔗 `10.1016/j.patrec.2019.05.022`

**Features, clustering and dimension reduction**

23. Wang, X., Smith, K. & Hyndman, R.J. (2006). Characteristic-based clustering for time series data.
    *DMKD* 13(3):335–364. 🔗 `10.1007/s10618-005-0039-x`
24. Hyndman, R.J., Wang, E. & Laptev, N. (2015). Large-scale unusual time series detection. *ICDMW*,
    1616–1619. 🔗 `10.1109/ICDMW.2015.104`
25. Kang, Y., Hyndman, R.J. & Smith-Miles, K. (2017). Visualising forecasting algorithm performance
    using time series instance spaces. *IJF* 33(2):345–358. 🔗
    `10.1016/j.ijforecast.2016.09.004` ⭐ **PCA on TS features**
26. **Lubba, C.H., Sethi, S.S., Knaute, P., Schultz, S.R., Fulcher, B.D. & Jones, N.S. (2019).
    catch22: CAnonical time-series characteristics. *DMKD* 33(6):1821–1852.** 🔗
    `10.1007/s10618-019-00647-x` ⭐ *(not Wild/Stepka/Escaida 2021 Chaos)*
27. Fulcher, B.D. & Jones, N.S. (2014). Highly comparative feature-based time-series classification.
    *IEEE TKDE* 26(12):3026–3037. 🔗 `10.1109/TKDE.2014.2316504`
28. Middlehurst et al. (2024). aeon: a Python toolkit for learning from time series. *JMLR*
    25(289):1–10. 🔗 https://www.jmlr.org/papers/v25/23-1444.html
29. Tavenard, R. et al. (2020). tslearn. *JMLR* 21(118). 🔗
    https://www.jmlr.org/papers/v21/20-091.html
30. Law, S.M. (2019). STUMPY. *JOSS* 4(39):1504. 🔗 `10.21105/joss.01504`
31. Dau, H.A. et al. (2019). The UCR Time Series Archive. *IEEE/CAA JAS* 6(6):1293–1305. 🔗
    `10.1109/JAS.2019.1911747` — **128 datasets**
32. Ramsay, J.O. & Silverman, B.W. (2005). *Functional Data Analysis.* Springer 🔗
    `10.1007/b98888`; FPCA = Ch. 8, 147–172 🔗 `10.1007/0-387-22751-2_8`
33. van der Maaten, L. & Hinton, G. (2008). Visualizing data using t-SNE. *JMLR* 9(86):2579–2605.
    (**no DOI**)
34. McInnes, L., Healy, J., Saul, N. & Großberger, L. (2018). UMAP. *JOSS* 3(29):861. 🔗
    `10.21105/joss.00861`
35. Montero-Manso, P., Athanasopoulos, G., Hyndman, R.J. & Talagala, T.S. (2020). FFORMA. *IJF*
    36(1):86–92. 🔗 `10.1016/j.ijforecast.2019.02.011`
36. Cerqueira, V., Torgo, L. & Mozetič, P. (2020). Evaluating time series forecasting models. *Machine
    Learning* 109(11):1997–2028. 🔗 `10.1007/s10994-020-05910-7` — **performance estimation, not
    dimension reduction**

## Cross-links

- [[Time Series EDA and Data Quality]] §5 — characterisation, and the FPP3 §4.5 PCA-on-features workflow
- [[Feature Engineering for Time Series]] §5 — t-SNE/UMAP for exploration only; catch22 components
- [[Feature Importance and Explainability]] — attribution within one model, vs clustering across models
- [[Time Series Anomaly Detection]] — discord discovery, matrix profile, and the benchmark
  contamination problem
- [[Change-Point Detection]] — matrix profile's semantic segmentation is the continuous cousin
- [[Forecasting MLOps]] §2 — `stumpi` for online motif monitoring
- [[Forecast Combination]] §2.4 — FFORMA, the feature-vector clustering payoff for forecasting
- [[Nixtlaverse]] §4 — `mlforecast`'s feature-construction burden, which this note partly addresses

