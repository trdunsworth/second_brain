---
type: reference
status: active
topic: "What to do with a time series before modelling it — the diagnostic plots, the index-integrity and value-validity checks that must run first, and the missing-data tools that actually work on a regular hourly index."
created: 2026-10-15
tags:
  - time-series
  - forecasting
  - exploratory-data-analysis
  - data-quality
  - diagnostics
  - preprocessing
aliases:
  - Time Series EDA
  - Exploratory Data Analysis
  - TS Data Quality
  - Data Quality Time Series
---

# Time Series EDA and Data Quality

Two things you do before any model, in this order: **check the series is a series** (index integrity,
value validity), then **look at it** (the diagnostic plots). Doing the second without the first is
how you end up beautifully visualising a hole in the data.

> Written 2026-10-15. The vault had **zero** hits for "exploratory" or "EDA" in either forecasting
> folder. `julia-eda-lab/eda.jl` has a good columnar profiler, but a columnar profiler has no
> notion of an index — it cannot detect a gap, an irregular frequency, or a DST artifact. §3 is the
> time-series-specific layer that fills that in.

---

## 1. The order matters

The FPP3 preface states the principle, and it is worth quoting because it is the whole reason this
note exists:

> *"We have also added some new material on time series features, and reorganised the content so
> **Chapters 2–4 discuss exploratory analysis of time series, before we introduce any forecasting
> methods.** This is because we should first have a good understanding of our time series, their
> patterns and characteristics, before we attempt to build any models and produce any forecasts."*
> — Hyndman & Athanasopoulos, *Forecasting: Principles and Practice*, 3rd ed., Preface.

But "analysis of the time series" presupposes the series is intact. **Run §3 before §4.** A DST gap
in the index will show up as a spike in every plot you draw, and you will spend a week chasing it in
the model instead of five minutes finding it in the index.

---

## 2. The canonical EDA surface

**FPP3 Chapter 2, "Time series graphics"** is the EDA chapter. The section list:

| § | What it answers |
|---|---|
| 2.1 | `tsibble` objects — the index variable, key variables, **and the seasonal period** |
| 2.2 | Time plots — the single most informative thing you can draw |
| 2.3 | Trend vs seasonal vs cyclic |
| 2.4 | **Seasonal plots** |
| 2.5 | **Seasonal subseries plots** |
| 2.6 | Scatterplots and scatterplot matrices |
| 2.7 | Lag plots |
| 2.8 | **Autocorrelation (and reading trend/seasonality out of it)** |
| 2.9 | White noise — how to know you are looking at nothing |

Ch. 3 is decomposition; Ch. 4 is time series features (§ and
[[Feature Engineering for Time Series]] §2.5).

### The single most useful authority for this vault

**FPP3 §2.1's seasonal-period table gives, for hourly data, the periods 24 (day), 168 (week), 8766
(year).** That is the cleanest citable source for the `m=168` argument in
[[Time Series Decomposition]] §4 and [[Time Series Forecasting Baselines]] §3.1 — and it is a
textbook-stated value rather than a convention someone chose.

### The plots and who is credited for them

| Plot | Verdict | Cite |
|---|---|---|
| **Seasonal plot** | ✅ | FPP3 §2.4. `forecast::seasonplot()` / `ggseasonplot()` documents itself as *"a seasonal plot as described in Hyndman and Athanasopoulos (2014, chapter 2)"* |
| **Seasonal subseries plot** | ✅ | **Cleveland (1993), *Visualizing Data*, Hobart Press** — per NIST/SEMATECH e-Handbook §6.4.4.3.1. Earlier origin: Cleveland, Dunn & Terpenning (1978), *The SABL Seasonal Analysis Package*, Bell Labs. Note the aliases "cycle plot = month plot = seasonal subseries plot" |
| **ACF / PACF** | ⚠️ | Box, Jenkins & Reinsel, *Time Series Analysis: Forecasting and Control*. **Cite the book; do not cite a page number** |
| **Periodogram** | ✅ | Schuster, A. (1898). *Terrestrial Magnetism* 3(1):13–41. ⚠️ The correct title is *"…supposed 26 day period of **meteorological** phenomena"* — many sources say "solar", which is wrong. Also Bartlett (1950), *Biometrika* 37:1–16 |
| **Lag plot** | ❌ **no primary source** | NIST e-Handbook §1.3.3.15 documents it thoroughly **without attribution**. Cite FPP3 §2.7 or NIST and say so — do not invent an originator |
| **STL plot** | ✅ | Cleveland, R.B., Cleveland, W.S., McRae, J.E. & Terpenning, I.J. (1990), *J. Official Statistics* **6(1), 3–73**. ⚠️ statsmodels' docstring cites "3–33" — **that is a typo; use 3–73** |
| **Month/year heatmap** | ❌ | No canonical source. It is an informal visual. Do not attribute it |

> **⚠️ A common mis-citation to avoid.** Cleveland & McGill (1984), *JASA* 79(387):531–554 🔗
> `10.1080/01621459.1984.10478080` is frequently cited as the origin of the seasonal subseries
> plot. It is not — it is about **elementary graphical perception** (position > length > angle >
> area). Real paper, real DOI, wrong job. **Cite it for perceptual ordering, never for subseries
> plots.** There is also no "Cleveland & Titterington" paper on time series graphics; I could not
> find it and neither can the databases.

### And the reason to plot at all

**Anscombe, F.J. (1973). "Graphs in statistical analysis." *The American Statistician* 27(1):17–21.**
🔗 `10.1080/00031305.1973.10478966`. Tukey (1977), *Exploratory Data Analysis*, Addison-Wesley
(preliminary edition 1970) is the other obligatory citation.

---

## 3. Data quality — the checks that must run first

This is a real literature, and the vault had none of it.

**The survey:** Wang, X. & Wang, C. (2020). "Time Series Data Cleaning: A Survey." *IEEE Access*
8:1866–1881. 🔗 `10.1109/ACCESS.2019.2962152` · 🔗 https://arxiv.org/abs/2004.08284

**Timestamp integrity** — the problem of a regular-interval index with delayed, missing and repeated
points: **Fang, C., Song, S. & Mei, Y. (2022). "On Repairing Timestamps for Regular Interval Time
Series." *PVLDB* 15(9):1848–1860.** 🔗 `10.14778/3538598.3538607`. Formalises repair as a
minimum-cost problem over interval determination, start determination, length determination and
match searching. Implemented in Apache IoTDB.

**Measuring DQ inside a database:** Qiu, Fang, Song, Huang, Wang & Wang (2023). "TsQuality:
Measuring Time Series Data Quality in Apache IoTDB." *PVLDB* 16(12). 🔗 `10.14778/3611540.3611601`
— completeness, consistency, timeliness, validity. And **Su, Gong & Song (2023). "Time Series Data
Validity." *PACMMOD* 1(1), SIGMOD '23.** 🔗 `10.1145/3588939`

**Visual DQ assessment — the EDA-meets-DQ intersection:** **Arbesser, C., Spechtenhauser, F.,
Mühlbacher, T. & Piringer, H. (2017). "Visplause: Visual Data Quality Assessment of Many Time
Series Using Plausibility Checks." *IEEE TVCG* 23(1):641–650.** 🔗 `10.1109/TVCG.2016.2598592`

**Others in the spine:** Grafberger, Groth, Stoyanovich & Schelter (2018), *PVLDB* 11(12):1781–1794
🔗 `10.14778/3229863.3229867` (large-scale DQ verification) · Ding et al. (2019), "CleanITS," *PVLDB*
12(12):1786–1789 · **Khayati, Lerner, Tymchenko & Cudré-Mauroux (2020). "Mind the gap: an
experimental evaluation of imputation of missing values techniques in time series." *PVLDB*
13(5).** 🔗 `10.14778/3377369.3377383` · Gao, Gisolfi & Dubrawski (2024). "Signal Quality Auditing
for Time-series Data." 🔗 https://arxiv.org/abs/2402.00803 · **Fox, A.J. (1972). "Outliers in time
series." *JRSS-B* 34(3):350–363** (the classic).

**Robust statistics underpinning the outlier tools:** Hampel (1974). "The Influence Curve and its
Role in Robust Estimation." *JASA* 69(346):383–393. 🔗 `10.1080/01621459.1974.10482962` · Hampel,
Ronchetti, Rousseeuw & Stahel (1986). *Robust Statistics: The Approach Based on Influence Functions*.
Wiley 🔗 `10.1002/9781118186435`

> **⚠️ "Hampel et al. 1977" does not exist.** The book is **1986**. This appears in a lot of
> reference lists.

### The four checks, in order

**1. Index integrity**

```python
# pandas 3.0.6 — the verified API
assert df.index.is_unique,        "duplicate timestamps"
assert df.index.is_monotonic_increasing, "out-of-order timestamps"
expected = pd.date_range(df.index.min(), df.index.max(), freq="h", tz=df.index.tz)
gaps     = expected.difference(df.index)      # missing points
extra    = df.index.difference(expected)      # unexpected points
inferred = pd.infer_freq(df.index)            # None means the index is irregular
```

> **⚠️ Two API traps.** (1) **`pd.assert_series_monotonic` does not exist** in pandas, and it does
> not exist in `great_expectations` either. It is almost certainly a misremembered GX expectation
> name. Use `s.index.is_monotonic_increasing`. (2) `Series.is_monotonic` (bare) was **deprecated in
> 1.5.0 and removed**. Also: **pandas has no single "gap detection" function** — the recipe above is
> what you write, not a named function.

**2. Frequency regularity.** `pd.infer_freq` returning `None` is the signal that the index is not
the regular grid you think it is. This is the check that catches DST, missing days and partial days
before any plot does.

**3. DST and the 23/25-hour days.** The authoritative technical reference is the pandas
`tz_localize` documentation. Its `ambiguous` parameter documents exactly the problem:

> *"When clocks moved backward due to DST, ambiguous times may arise… 02:30:00 local time occurs
> both at 00:30:00 UTC and at 01:30:00 UTC."*
> — values `'infer'`, bool or bool-ndarray, `'NaT'`, `'raise'`.

And `nonexistent`: `'shift_forward'`, `'shift_backward'`, `'NaT'`, a `timedelta`, `'raise'`.

FPP3 §2.4 handles the visual version, on half-hourly electricity data:

> *"In the first plot, the three days with 25 hours are when daylight saving ended in each year and
> so these days contained an extra hour. There were also three days with only 23 hours each (when
> daylight saving started) but these are **hidden beneath all the other lines on the plot**."*

> **For 2022–2026 that is 8 transitions.** A 168-hour period indexed on local *civil* time is not
> the same 168-hour period twice a year. This is the finding flagged in [[Forecasting MLOps]] §7
> and it is a **P1 data-quality item**, not a footnote — decide standard time vs civil time before
> you build hour-of-week.

**4. Value validity** — for a count series:

```r
# Julia, from julia-eda-lab/eda.jl — already in the vault, worth reusing
sum(x .< 0)                 # negative counts — impossible, and a sign of a bad join
sum(x .!= round.(x))        # non-integer counts — impossible for a call count
missingness_table(df)       # per-column completeness
flag_outliers(x)            # IQR / MAD / z / p01-p99, consensus vote ≥ 2 of 4
```

### Missing data — the Kalman filter handles it for free

**Durbin & Koopman (2012), §2.7 "Missing observations" (p. 28) and §4.10 (p. 110)** — verified from
the publisher table of contents. **The claim that a state-space model handles gaps natively is
exactly citable with those section numbers.** The update step is simply skipped; you do not impute.
See [[State Space Models and Bayesian Structural Time Series]] §2.

For imputation: **Moritz, S. & Bartz-Beielstein, T. (2017). "imputeTS." *The R Journal*.** Key
citable claim: *"most imputation algorithms rely on inter-attribute correlations, while univariate
time series imputation instead needs to employ time dependencies."* Also **Khayati et al. (2020)**
above for a comparative evaluation, and Rubin (1987), *Multiple Imputation for Nonresponse in
Surveys* 🔗 `10.1002/9780470316696`.

---

## 4. Tooling — and what actually changed

### R

| Package | Status | Notes |
|---|---|---|
| **`ggtime`** | **1.1.0, 12 Oct 2026** 🔗 `10.32614/CRAN.package.ggtime` | **`feasts` graphics moved here.** O'Hara-Wild, Huang, Kay, Hyndman, Wang. `gg_season()`, `gg_subseries()`, `gg_lag()`, `autoplot()` now live in `ggtime` |
| `feasts` | 0.5.0 | **No longer provides graphics.** ACF/PACF/CCF, STL features, unit-root and portmanteau tests, sliding-window features |
| `forecast` | 9.0.2 | `seasonplot()` / `ggseasonplot()` (Hyndman & O'Hara-Wild); `mstl(robust=TRUE)`; **`tsclean()`** — supsmu for non-seasonal, robust STL for seasonal, linear interpolation for missing values and outlier replacements |
| `tsrobprep` | 0.3.2 | Narajewski, Kley-Holsteg & Ziel (2021), *SoftwareX* 🔗 `10.1016/j.softx.2021.100809` — `detect_outliers`, `impute_modelled_data`, `robust_decompose` |
| `cleanTS` | 0.1.2 | Returns a report of **missing timestamps, duplicate timestamps, imputation methods, outlier counts and imputation errors** — the closest thing to an explicit TS-DQ report |
| `imputeTS` | — | Missing-data statistics plotting for time series |

> **⚠️ `ggTS` does not exist** (CRAN 404) — the real package is `ggtime`. And **do not write
> `forecast::autoplot`**: `autoplot()` is a **ggplot2 generic**, with methods from `ggtime`/`feasts`.

### Python

| Package | Provides | Does **not** provide |
|---|---|---|
| `statsmodels.graphics.tsaplots` | `plot_acf`, `plot_pacf`, `plot_ccf`, `plot_pccf`, `plot_accf_grid`, `seasonal_diagnostic_plot`, `month_plot`, `quarter_plot` | **`lag_plot`** — use `pandas.plotting.lag_plot` |
| `pandas.plotting` (3.0.6) | `lag_plot`, `autocorrelation_plot` | Seasonal / subseries plots |
| `sktime` (1.1.0) | `plot_series`, `plot_correlations`, `plot_windows`, `plot_calibration` | Seasonal / subseries plots |
| `seaborn` | Nothing time-series-specific | Any seasonal or subseries plot |

### Data-quality tooling — three caveats

> **⚠️ 1. `tsfresh` has no data-quality module.** `tsfresh.utilities` is four submodules
> (`dataframe_functions`, `distribution`, `profiling`, `string_manipulation`) with
> `check_for_nans_in_columns` and `impute()`. **No timestamp validation.** The docs also disclaim
> your use case verbatim: *"Currently, tsfresh is not suitable … for usage with highly irregular
> time series … many features are interval-agnostic … and some other features (e.g. linear trend)
> assume equal spacing in time."*

> **⚠️ 2. `great_expectations` can check monotonicity but has no time-series frequency concept.**
> Current: **1.24.0 (7 Oct 2026)**, repo now `fivetran/great_expectations`. GitHub issue **#1183
> "Expectations for time series data"** — proposing
> `expect_column_datetime_values_to_have_frequency` and `..._be_increasing` — was **closed as
> stale in 2020 and never implemented.** The `timeseriesexpectations` packaged page is marked
> legacy, last updated 2026, one contributor. Use GX for `ExpectColumnValuesToBeIncreasing` /
> `ToBeUnique` on a timestamp column; write the gap check yourself.

> **⚠️ 3. `ydata-profiling` was renamed.** The PyPI page states: *"`ydata-profiling` is now
> `fg-data-profiling`. This package has been renamed… the old package will no longer receive updates
> or bug fixes."* `pip install fg-data-profiling`; imports change to `import data_profiling` /
> `from data_profiling import ProfileReport`. Latest: **4.18.4, 22 Apr 2026**. It *does* have
> genuine time-series support — auto-correlation and seasonality statistics, ACF and PACF plots,
> and an automatic alerts list.

---

## 5. Characterising, not just cleaning

**FPP3 Chapter 4** is the ~50-feature characterisation layer, and **Wang, Smith & Hyndman (2006)**
🔗 `10.1007/s10618-005-0039-x` is its origin — note the second author is **Kate Smith / Kate A.
Smith-Miles**, not "K.A. Smith."

FPP3 §4.5 is the payoff for a panel: compute the 48 features for a set of series, PCA the matrix,
and **the outliers fall out** — four of the 304 Australian tourism series were flagged as unusual
feature combinations. For a single series this has nothing to work on. See
[[Time Series Similarity, Clustering and Motif Discovery]] §4.

---

## 6. Assessment

**Strengths**
- Index-integrity and value-validity checks are **five minutes each and catch the errors that
  silently corrupt everything downstream**.
- The DQ literature is real, recent and mostly from the systems community — you are not inventing
  checks, you are applying published ones.
- FPP3 Ch. 2–4 is a coherent, complete, free EDA curriculum.
- The state-space path makes missing data a non-problem.

**Weaknesses**
- **No mainstream EDA library does the time-series-specific part.** `ydata-profiling` /
  `fg-data-profiling` comes closest; pandas and sktime give you plots, not validation.
- `tsfresh` explicitly disclaims irregular series; `great_expectations` never implemented
  frequency checks.
- **No tool detects DST artifacts** — you have to know to look. That makes it the highest-value
  and lowest-automation item in this note.
- Some of the provenance is genuinely unattributable (lag plot, month/year heatmap). Say so rather
  than inventing a citation.

## 7. Try it

- [ ] **Run the §3 four checks on the Douglas County extract the moment it arrives, before any
      plot.** Duplicates, monotonicity, `infer_freq`, negative/non-integer counts
- [ ] `inferred = pd.infer_freq(df.index)` — if it returns `None`, stop and find out why before
      modelling anything
- [ ] Count the 23-hour and 25-hour days in the range. If non-zero, **decide and document standard
      vs civil time now**, not during evaluation
- [ ] FPP3 Ch. 2 end to end: time plot, seasonal plot on `period=168`, seasonal subseries, lag plot,
      ACF. That is the curriculum
- [ ] A seasonal plot with `period=168` will draw 168 lines. Group by day-of-week and hour-of-day
      instead and it becomes readable — this is the single most useful plot for this problem
- [ ] Time plot of the **hour-of-week profile** (168 weekly means across weeks) — this is what shows
      a regime change in the seasonal shape, which total-volume analysis misses entirely
- [ ] Reuse `julia-eda-lab/eda.jl`'s `missingness_table` and `flag_outliers` on the extract and
      record the consensus outlier count as a baseline
- [ ] Run `forecast::tsclean()` / `mstl(robust=TRUE)` on a known-spike-contaminated slice and count
      what it replaces. **Write the replaced timestamps down** — you want to inspect them, not have
      them silently smoothed away

## References

**EDA**

1. Hyndman, R.J. & Athanasopoulos, G. (2021). *Forecasting: Principles and Practice*, 3rd ed. **Ch.
   2**, "Time series graphics" (EDA); §2.1 seasonal-period table. 🔗
   https://otexts.com/fpp3/graphics.html
2. Hyndman, R.J. & Athanasopoulos, G. (2021). *Forecasting: Principles and Practice*, 3rd ed. **Ch.
   4**, "Time series features"; §4.5 PCA for anomaly detection. 🔗
   https://otexts.com/fpp3/features.html
3. Cleveland, W.S. (1993). *Visualizing Data*. Hobart Press. ISBN 9780963488404 — seasonal subseries
4. Cleveland, W.S., Dunn, D.M. & Terpenning, I.J. (1978). The SABL Seasonal Analysis Package. Bell
   Labs — cycle plot origin
5. Cleveland, W.S. & McGill, R. (1984). Graphical perception. *JASA* 79(387):531–554. 🔗
   `10.1080/01621459.1984.10478080` — **perceptual ordering, not subseries plots**
6. Cleveland, R.B., Cleveland, W.S., McRae, J.E. & Terpenning, I.J. (1990). STL. *J. Official
   Statistics* 6(1), **3–73**. (statsmodels' "3–33" is a typo)
7. Schuster, A. (1898). On the investigation of hidden periodicities with application to a supposed
   26 day period of **meteorological** phenomena. *Terrestrial Magnetism* 3(1):13–41
8. Bartlett, M.S. (1950). Periodogram analysis and continuous spectra. *Biometrika* 37:1–16
9. Tukey, J.W. (1977). *Exploratory Data Analysis*. Addison-Wesley (prelim. 1970)
10. Anscombe, F.J. (1973). Graphs in statistical analysis. *The American Statistician* 27(1):17–21. 🔗
    `10.1080/00031305.1973.10478966`
11. Wang, X., Smith, K. & Hyndman, R.J. (2006). Characteristic-based clustering for time series
    data. *DMKD* 13(3):335–364. 🔗 `10.1007/s10618-005-0039-x`

**Data quality**

12. Wang, X. & Wang, C. (2020). Time series data cleaning: A survey. *IEEE Access* 8:1866–1881. 🔗
    `10.1109/ACCESS.2019.2962152` 🔗 https://arxiv.org/abs/2004.08284 ⭐
13. Fang, C., Song, S. & Mei, Y. (2022). On repairing timestamps for regular interval time series.
    *PVLDB* 15(9):1848–1860. 🔗 `10.14778/3538598.3538607` ⭐
14. Qiu, Y., Fang, C., Song, S., Huang, X., Wang, C. & Wang, J. (2023). TsQuality. *PVLDB* 16(12).
    🔗 `10.14778/3611540.3611601`
15. Su, Y., Gong, Y. & Song, S. (2023). Time series data validity. *PACMMOD* 1(1), SIGMOD '23. 🔗
    `10.1145/3588939`
16. Arbesser, C., Spechtenhauser, F., Mühlbacher, T. & Piringer, H. (2017). Visplause. *IEEE TVCG*
    23(1):641–650. 🔗 `10.1109/TVCG.2016.2598592`
17. Khayati, M., Lerner, A., Tymchenko, Z. & Cudré-Mauroux, P. (2020). Mind the gap. *PVLDB* 13(5).
    🔗 `10.14778/3377369.3377383`
18. Grafberger, S., Groth, P., Stoyanovich, J. & Schelter, S. (2018). Automating large-scale data
    quality verification. *PVLDB* 11(12):1781–1794. 🔗 `10.14778/3229863.3229867`
19. Fox, A.J. (1972). Outliers in time series. *JRSS-B* 34(3):350–363
20. Hampel, F.R. (1974). The influence curve and its role in robust estimation. *JASA*
    69(346):383–393. 🔗 `10.1080/01621459.1974.10482962`
21. Hampel, F.R., Ronchetti, E.M., Rousseeuw, P.J. & Stahel, W.A. (1986). *Robust Statistics*.
    Wiley. 🔗 `10.1002/9781118186435` (this is **1986**, not 1977)

**Missing data and validation**

22. Durbin, J. & Koopman, S.J. (2012). *Time Series Analysis by State Space Methods*, 2nd ed. §2.7
    and §4.10 "Missing observations". 🔗 `10.1093/acprof:oso/9780199641178.001.0001`
23. Rubin, D.B. (1987). *Multiple Imputation for Nonresponse in Surveys*. Wiley. 🔗
    `10.1002/9780470316696`
24. Moritz, S. & Bartz-Beielstein, T. (2017). imputeTS. *The R Journal*
25. Bergmeir, C. & Benítez, J.M. (2012). On the use of cross-validation for time series predictor
    evaluation. *Information Sciences* 191:192–213. 🔗 `10.1016/j.ins.2011.12.028`
26. Snijders, T.A.B. (1988). On cross-validation for predictor evaluation in time series. 🔗
    `10.1007/978-3-642-61564-1_4`

**Software**

27. Narajewski, M., Kley-Holsteg, J. & Ziel, F. (2021). tsrobprep. *SoftwareX*. 🔗
    `10.1016/j.softx.2021.100809`
28. Law, S.M. (2019). STUMPY. *JOSS* 4(39):1504. 🔗 `10.21105/joss.01504` (for gap-aware
    subsequence work)
29. `ggtime` 1.1.0, CRAN 🔗 `10.32614/CRAN.package.ggtime` · `feasts` 0.5.0 · `forecast` 9.0.2

## Cross-links

- [[Feature Engineering for Time Series]] §2.5 — the ~50-feature characteristic layer
- [[Time Series Decomposition]] — STL/mstl as both EDA and feature source; §4 `m=168`
- [[Forecasting MLOps]] §7 — the DST production hazard in depth
- [[Change-Point Detection]] — once the series is clean, find out whether the process changed
- [[State Space Models and Bayesian Structural Time Series]] §2 — missing data natively
- [[Count Distributions and Kolassa Evaluation]] — value validity for counts specifically
- [[Time Series Similarity, Clustering and Motif Discovery]] — characterisation and PCA
- [[Forecasting Non-Stationary Data]] §6 — the pre-test look: diagnostics first, ADF/KPSS second
- [[Forecasting Libraries and Frameworks]] §4 — PyPOTS for the missing-data path; ggtime (2025 preprint) for the R-side plotting grammar
- `julia-eda-lab/eda.jl` — the reusable columnar profiler in this vault, whose `missingness_table` and
  `flag_outliers` pair with §3's index checks. This note's §3 does not duplicate it; it supplies the
  time-series layer it lacks
