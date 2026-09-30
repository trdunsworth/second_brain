---
type: learning-note
topic: Julia for EDA, Advanced Analysis, and Time Series Forecasting
date: 2026-09-25
status: active
tags:
  - julia
  - eda
  - data-analysis
  - time-series
  - learning-plan
---

# Julia Notes — EDA, Advanced Data Analysis & Time Series Forecasting

> Goal: get productive in Julia for **Exploratory Data Analysis → Advanced Analysis → Time Series Forecasting**.
> Companion project spec: [[Reporting Engine/JULIA|Reporting Engine JULIA.md]] — that file is 9-1-1-project specific. This file is your general-purpose Julia learning system.
> Related: [[Time Series/Time Series Notes|Time Series Notes]], [[Time Series/time-series-forecasting-models|Forecasting Models Taxonomy]]

## How to use this note

1. Work top-to-bottom through **§2 Setup** once.
2. Then follow **§3 Learning Plan** in order — each phase has an exit checklist.
3. Copy snippets from §5–§7 into a scratch project (`julia-eda-lab/`) and run them.
4. Track progress in **§10 Tracker**.

---

## 1. Why Julia for these three areas

| Strength | What it means for you |
|----------|-----------------------|
| Speed without Cython/Rcpp | Loops, bootstraps, rolling windows, and simulations are fast in plain Julia. Ideal for large M/Q/Y replays. |
| `DataFrames.jl` is pandas-like but stricter | `missing` propagation forces you to handle data quality explicitly — good for EDA discipline. |
| Grammar of Graphics exists | `AlgebraOfGraphics.jl + Makie.jl` mirrors ggplot2/plotnine. `Gadfly.jl` is the closest 1:1 ggplot port. |
| Stats are first-class | `HypothesisTests.jl`, `GLM.jl`, `MixedModels.jl`, `Distributions.jl` cover 90% of R's core tests. |
| Time series is state-space native | `StateSpaceModels.jl` gives you ETS / SARIMA / structural models + Kalman filter in one package. |
| Honest gaps | Dashboards (`Genie.jl`/`Dash.jl`) and publication tables (`PrettyTables.jl`) are thinner than Shiny/Streamlit and `gt`/`great_tables`. Plan to hand off final reports to Python/R/Quarto when needed. Use `RCall.jl` / `PythonCall.jl` as a bridge, not a crutch. |

---

## 2. Setup (do once, ~1 hour)

### 2.1 Install

- Install Julia 1.10+ LTS from [julialang.org](https://julialang.org/downloads/) (use `juliaup` if available — it manages versions like `rustup`).
- VS Code + `Julia` extension (best REPL + notebook + debugger experience). Alternative: `Pluto.jl` notebooks for reactive EDA.

```powershell
# Windows (PowerShell) — if using juliaup
winget install julia -s msstore
julia --version
```

### 2.2 Project environments (always use these)

Julia installs packages **per-environment**, not globally. Never work in the default `@v1.10` env for analysis.

```julia
# In PowerShell: mkdir julia-eda-lab; cd julia-eda-lab; julia
import Pkg

# Create + activate a project in the current folder
Pkg.activate(".")       # creates Project.toml / Manifest.toml here
Pkg.add([
    "DataFrames", "CSV", "DataFramesMeta", "Chain",
    "Statistics", "StatsBase", "Missings",
    "CategoricalArrays",
    "AlgebraOfGraphics", "CairoMakie", "Gadfly",
    "HypothesisTests", "GLM", "MixedModels", "Distributions",
    "TimeSeries", "StateSpaceModels",
    "MLJ", "Clustering", "OutlierDetection",
    "PrettyTables", "Arrow", "Parquet2", "DuckDB"
])

Pkg.status()   # verify
Pkg.instantiate() # on a new machine, reproduces exact env from Manifest.toml
```

> Tip: commit `Project.toml` + `Manifest.toml` to git. That is your `requirements.txt` + lockfile in one.

### 2.3 REPL workflow

```julia
using Revise  # add to startup: Pkg.add("Revise") — auto-reloads edited .jl files
# VS Code: Ctrl+Enter sends line/selection to REPL, Alt+Enter runs file
```

---

## 3. Learning Plan

Designed for someone who already knows Python/R + pandas/ggplot. Total: **~4–6 weeks at 4–6 hrs/week**. Skip Phase 1 if Julia syntax already feels natural.

### Phase 0 — Foundations (Week 1, 3–4 hrs)

**Learn:** 1-indexing, types, `missing` vs `nothing`, broadcasting with `.`, `!` mutating convention, `|>` pipes.

- [ ] Read: Julia docs — *Getting Started* + *Noteworthy Differences from Python/R*.
- [ ] Practice: vectors, `DataFrame` construction, `CSV.read`, `describe`, `select`/`filter`/`groupby`/`combine`.
- [ ] Exit check: load any CSV, parse dates, produce grouped medians without looking up syntax.

```julia
using DataFrames, CSV, Dates, Statistics

df = DataFrame(a=[1,2,3], b=["x","y","x"])
describe(df)              # n, eltypes, missing counts, extrema
eltypes(df)               # schema check — run this on every new file
names(df)
```

### Phase 1 — EDA Toolkit (Weeks 2–3, core focus #1)

**Learn:** `DataFramesMeta.jl` + `Chain.jl`, missingness audit, descriptive stats, distribution plots, correlation, grouped visuals.

- [ ] Build a reusable `eda.jl` (see §5.7) you can `include()` on any dataset.
- [ ] Plot every numeric as histogram + boxplot; every categorical as bar chart.
- [ ] Compute Spearman matrix + Cramér's V equivalent (see §5.5).
- [ ] Exit check: take `IndyMo_incidents.csv` (or any messy CSV) and produce: missingness table → descriptives → 4 plots → outlier flag table.

See **§5 EDA Snippets**.

### Phase 2 — Advanced Data Analysis (Weeks 3–4, core focus #2)

**Learn:** hypothesis tests, effect sizes, ANOVA, GLM/Poisson, mixed models, bootstrap CIs, clustering/outliers.

- [ ] Reproduce one t-test, one Mann-Whitney, one chi-square, one Kruskal-Wallis by hand.
- [ ] Fit `OLS → Poisson → MixedModel` on the same response; compare with AIC/LR test.
- [ ] Bootstrap a median + compliance proportion; report percentile CIs.
- [ ] Exit check: answer "is Group A slower than Group B, and by how much?" with test + effect size + CI + plot.

See **§6 Advanced Snippets**.

### Phase 3 — Time Series Forecasting (Weeks 5–6, core focus #3)

**Learn:** `TimeArray`, resampling to regular grids, ACF/PACF, stationarity (ADF), STL decomposition, SARIMA/ETS via `StateSpaceModels.jl`, backtesting, error metrics (MAE/RMSE/MAPE/sMAPE).

- [ ] Build hourly → daily → weekly aggregates from event-level timestamps.
- [ ] Diagnose: trend? daily/weekly seasonality? need differencing?
- [ ] Fit Seasonal Naive (baseline) → ETS → SARIMA; backtest with rolling origin; keep the simplest winner.
- [ ] Exit check: 7-day-ahead forecast with prediction intervals + backtest table.

See **§7 Time Series Snippets**.

### Phase 4 — Capstone (ongoing)

Pick one:

1. **Weekly ops report in Julia**: EDA + compliance tests + 7-day forecast on your 9-1-1 data, tables via `PrettyTables.jl`, figures via `CairoMakie`.
2. **Forecast bake-off**: same series in Julia (`StateSpaceModels`) vs Python (`statsmodels`) vs R (`fable`) — compare RMSE/MAPE.
3. **Speed demo**: bootstrap 10k medians in Julia vs Python — feel the reason Julia earns its keep.

---

## 4. Library Map (what to reach for)

### 4.1 EDA

| Need | Package | Notes |
|------|---------|-------|
| Frames + IO | `DataFrames.jl`, `CSV.jl`, `Arrow.jl`, `Parquet2.jl`, `DuckDB.jl` | `Arrow` for fast local cache; `DuckDB` for larger-than-RAM pre-aggregation. |
| Ergonomic wrangling | `DataFramesMeta.jl`, `Chain.jl` | `@chain df begin @filter ... @groupby ... @combine ... end` — closest to dplyr/pandas pipe. |
| Stats helpers | `Statistics` (stdlib), `StatsBase.jl`, `Missings.jl` | `skipmissing`, `quantile`, `skewness`, `kurtosis`, `cor`. |
| Categoricals | `CategoricalArrays.jl` | Ordered levels for `dow`, `priority`, `shift`. Essential for correct plot order. |
| Grammar of Graphics | `AlgebraOfGraphics.jl` + `CairoMakie.jl` (static) / `WGLMakie.jl` (interactive) | Declarative: `data(df) * mapping(...) * visual(...) |> draw`. |
| ggplot-like quick plots | `Gadfly.jl` | `plot(df, x=:dow, Geom.bar)` — fastest port from ggplot2/plotnine. |
| Tables | `PrettyTables.jl` | KPI tables in terminal / HTML / LaTeX. |
| Dates | `Dates` (stdlib), `TimeSeries.jl` | Parsing + `TimeArray` for regular series. |

### 4.2 Advanced analysis

| Need | Package | Notes |
|------|---------|-------|
| Hypothesis tests | `HypothesisTests.jl` | t, Mann-Whitney, Kruskal-Wallis, chi-square, binomial, correlation, ADF-adjacent checks. |
| ANOVA | `ANOVA.jl` | Type I/II/III tables on `GLM` fits. |
| Regression / GLM | `GLM.jl` | OLS, logistic, Poisson/NB. Formula syntax via `@formula`. |
| Mixed models | `MixedModels.jl` | `(1\|shift)` random effects. Gold standard implementation. |
| Distributions + simulation | `Distributions.jl` | `fit(LogNormal, x)`, `rand`, `quantile`. |
| Effect sizes / bootstrap | Manual + `StatsBase` / `Bootstrap.jl` | Julia culture favors writing the 10-line bootstrap yourself (see §6.5). |
| ML / clustering / outliers | `MLJ.jl`, `Clustering.jl`, `OutlierDetection.jl` | k-means, isolation forest, DBSCAN. Heavier API than sklearn — budget learning time. |
| Experimental design | `ExperimentalDesign.jl` | Factorial, Plackett-Burman, Box-Behnken, CCD. |
| Bridge | `RCall.jl`, `PythonCall.jl` | Call `survival`, `prophet`, `statsmodels` when Julia has no turnkey equivalent. |

### 4.3 Time series forecasting

| Need | Package | Notes |
|------|---------|-------|
| Container | `TimeSeries.jl` | `TimeArray(dates, values)`; `lag`, `lead`, moving windows. Lightweight by design. |
| Classical forecasting | `StateSpaceModels.jl` | **Start here.** ETS, SARIMA, structural/unobserved-components, Kalman filter/smoother, `forecast(model, h)`, Monte Carlo simulation. |
| Volatility | `ARCHModels.jl` | ARCH/GARCH family — mostly finance, useful for variance modeling. |
| Feature engineering for ML | `MLJ.jl` + manual lags | No `fable`-style one-liner; build lag/rolling features yourself, then regress. |
| Deep learning | `Flux.jl` / `Lux.jl` | Only if classical baselines fail. Heavy investment — defer. |
| Dates/plotting | `Dates`, `CairoMakie` | No built-in `autoplot`; plot `TimeArray.values` against `timestamp` manually. |

---

## 5. EDA Snippets

### 5.1 Load + parse + derive

```julia
using DataFrames, CSV, Dates, Statistics

ev = CSV.read("data/IndyMo_incidents.csv", DataFrame)
# Source uses m/d/y H:M — adjust format to your file
for c in [:call_start_time, :incident_start_time, :time_phone_pickup,
          :time_first_unit_assigned, :time_unit_arrived, :time_call_closed]
    if eltype(ev[!, c]) <: AbstractString
        ev[!, c] = DateTime.(string.(ev[!, c]), "m/d/y H:M")
    end
end

ev.date = Date.(ev.call_start_time)
ev.dow  = dayname.(ev.call_start_time)  # or map to ["Sun",...] abbreviations
ev.zip5 = first.(string.(ev.postal_code), 5)
```

### 5.2 Schema + missingness audit (run on every file)

```julia
using DataFrames

eltypes(ev)                       # types — catch Int read as String, etc.
describe(ev, :nmissing, :eltype, :nunique)  # needs StatsBase for :nunique in some versions

# Completeness KPI table (ops-friendly)
miss = DataFrame(
    col = names(ev),
    nmissing = [count(ismissing, ev[!, c]) for c in names(ev)],
)
miss.pct_missing = 100 .* miss.nmissing ./ nrow(ev)
miss.completeness = 100 .- miss.pct_missing
sort!(miss, :pct_missing, rev=true)
first(miss, 10)

# Duplicates
count(!nonunique(ev))             # n duplicate rows
combine(groupby(ev, :incident_id), nrow => :n) |> x -> filter(:n => >(1), x)
```

### 5.3 Descriptive stats (numeric + categorical)

```julia
using Statistics, StatsBase

numcols = names(ev, Number)  # numeric columns
desc = describe(ev[:, numcols], :mean, :median, :std, :min, :max,
                :q25 => (x -> quantile(skipmissing(x), 0.25)),
                :q75 => (x -> quantile(skipmissing(x), 0.75)))
# Add skew/kurtosis manually — describe doesn't include them by default
for c in numcols
    x = collect(skipmissing(ev[!, c]))
    println(c, "  skew=", round(skewness(x), digits=2),
            "  kurt=", round(kurtosis(x), digits=2),
            "  p90=", round(quantile(x, 0.90), digits=1),
            "  p95=", round(quantile(x, 0.95), digits=1))
end

# Categorical frequency + concentration
function cat_profile(df, col)
    g = combine(groupby(df, col), nrow => :n)
    g.pct = 100 .* g.n ./ nrow(df)
    sort!(g, :n, rev=true)
    g.cum_pct = cumsum(g.pct)
    return g
end
cat_profile(ev, :call_disposition) |> x -> first(x, 10)
```

### 5.4 Outlier flags (consensus of ≥2 methods)

```julia
using Statistics

function flag_outliers(x::AbstractVector; z_thresh=3.0, mad_thresh=3.5)
    v = collect(skipmissing(x))
    q1, q3 = quantile(v, 0.25), quantile(v, 0.75)
    iqr = q3 - q1
    med = median(v)
    mad = median(abs.(v .- med))
    m = mean(v); s = std(v)
    DataFrame(
        iqr = (x .< (q1 - 1.5iqr)) .| (x .> (q3 + 1.5iqr)),
        mad = abs.(0.6745 .* (x .- med) ./ mad) .> mad_thresh,
        z   = abs.((x .- m) ./ s) .> z_thresh,
        p01_99 = (x .< quantile(v, 0.01)) .| (x .> quantile(v, 0.99)),
    )
end

flags = flag_outliers(ev.dispatch_queue_seconds)
ev.outlier_votes = sum.(eachrow(coalesce.(flags, false)))
filter(:outlier_votes => >=(2), ev)  # consensus outliers
```

### 5.5 Correlations (Spearman default for skew)

```julia
using Statistics

timecols = filter(c -> endswith(c, "_seconds"), names(ev))
M = Matrix(coalesce.(ev[:, timecols], NaN))
# Pairwise Spearman ignoring missings per-pair (simple version: drop incomplete rows)
Mclean = ev[:, timecols] |> dropmissing |> Matrix
R = corspearman(Mclean)  # StatsBase
# For p-values / Kendall / Cramér's V on categoricals, use HypothesisTests (§6)
```

### 5.6 Plots — AlgebraOfGraphics (primary) + Gadfly (quick)

```julia
using AlgebraOfGraphics, CairoMakie

# Bar: volume by day of week
plt = data(ev) * mapping(:dow) * visual(BarPlot)
draw(plt; axis=(title="Volume by Day of Week", xlabel="Day", ylabel="Calls"))

# Scatter + smooth: bottleneck check
plt2 = data(dropmissing(ev[:, [:interview_seconds, :dispatch_queue_seconds, :priority]])) *
    mapping(:interview_seconds => "Interview (s)",
            :dispatch_queue_seconds => "Queue (s)",
            color=:priority => "Priority") *
    (visual(Scatter) + visual(Smooth))
draw(plt2)

# Boxplot: response time by shift
plt3 = data(ev) * mapping(:shift_label => "Shift",
                          :total_elapsed_seconds => "Total elapsed (s)") *
    visual(BoxPlot)
draw(plt3)
```

```julia
# Gadfly — fastest ggplot2-feel sketch
using Gadfly
plot(ev, x=:dow, Geom.bar, Guide.title("Volume by Day of Week"))
plot(ev, x=:interview_seconds, y=:dispatch_queue_seconds, color=:priority,
     Geom.point, Geom.smooth, Guide.title("Interview vs Queue"))
```

### 5.7 Reusable EDA checklist function

```julia
# include("eda.jl") at the start of every new dataset
function eda_checklist!(df::DataFrame)
    println("rows=$(nrow(df))  cols=$(ncol(df))")
    println("dupes=$(count(!nonunique(df)))")
    m = sort(DataFrame(col=names(df),
        pct_missing=[100*count(ismissing, df[!,c])/nrow(df) for c in names(df)]), :pct_missing, rev=true)
    println("worst missing:"); show(first(m, 5))
    println("\nSkew check (numeric):")
    for c in names(df, Number)
        v = collect(skipmissing(df[!, c])); isempty(v) && continue
        println("  ", c, " mean=", round(mean(v), digits=1),
                " med=", round(median(v), digits=1),
                " skew=", round(skewness(v), digits=2))
    end
end
```

---

## 6. Advanced Analysis Snippets

### 6.1 Hypothesis tests (`HypothesisTests.jl`)

```julia
using HypothesisTests, DataFrames, CSV

day   = collect(skipmissing(ev[ev.shift_label .== "Day", :dispatch_queue_seconds]))
night = collect(skipmissing(ev[ev.shift_label .== "Night", :dispatch_queue_seconds]))

OneSampleTTest(day)                    # H0: mean == 0 (sanity, not compliance)
TwoSampleTTest(day, night)             # equal-variance t
UnequalVarianceTTest(day, night)       # Welch — prefer this by default
MannWhitneyUTest(day, night)           # non-parametric — prefer for skew
KruskalWallisTest(day, night)          # ≥2 groups (pass groups as separate vectors)

# Chi-square: shift × disposition
using FreqTables
ct = freqtable(ev.shift_label, ev.call_disposition) |> Matrix
ChisqTest(ct)

# Correlation test (Spearman for skew)
x = collect(skipmissing(ev.dispatch_queue_seconds))
y = collect(skipmissing(ev.on_scene_seconds))
CorTest(x[1:min(length(x),length(y))], y[1:min(length(x),length(y))])  # Pearson default
# Spearman: use corspearman + permutation/manual p, or RCall for exact Spearman p
```

### 6.2 Compliance vs standard (binomial)

```julia
using HypothesisTests
# e.g. 90 of 100 calls answered ≤20s vs 90% NENA line
BinomialTest(90, 100, 0.90)
# APCO 75% ≤10s example from hourly aggregates:
# ans10 = sum(ph.calls .* ph.pct10 ./ 100); tot = sum(ph.calls)
# BinomialTest(round(Int, ans10), round(Int, tot); p=0.75, tail=:right)
```

### 6.3 ANOVA + post-hoc

```julia
using GLM, ANOVA, DataFramesMeta

model = fit(LinearModel, @formula(dispatch_queue_seconds ~ shift_label), ev)
anova(model)   # Type III table via ANOVA.jl
# Two-way
model2 = fit(LinearModel, @formula(dispatch_queue_seconds ~ shift_label + priority), ev)
anova(model2)
```

### 6.4 Regression → count → mixed (the escalation ladder)

```julia
using GLM, MixedModels

# 1. OLS baseline
ols = fit(LinearModel, @formula(total_elapsed_seconds ~ priority + shift_label), ev)

# 2. Count outcome (e.g. calls per hour): Poisson, check overdispersion → NegativeBinomial via GLM.jl
# glm(@formula(ncalls ~ hour + dow), ph_daily, Poisson())

# 3. Mixed: shift/call-taker as random intercepts
lmm = fit(MixedModel,
    @formula(total_elapsed_seconds ~ priority + (1|shift_label) + (1|calltaker)), ev)

# 4. LogNormal fit for right-skewed response times
using Distributions
fit(LogNormal, filter(>(0), collect(skipmissing(ev.dispatch_queue_seconds))))
```

### 6.5 Bootstrap CI (write it yourself — 10 lines, no package needed)

```julia
using Statistics, Random
Random.seed!(7)

function boot_median_ci(x; B=10_000, alpha=0.05)
    v = collect(skipmissing(x))
    n = length(v)
    boots = [median(rand(v, n)) for _ in 1:B]
    lo, hi = quantile(boots, [alpha/2, 1-alpha/2])
    return (median=median(v), lo=lo, hi=hi)
end
boot_median_ci(ev.dispatch_queue_seconds)

# Wilson CI for a compliance proportion (no deps)
function wilson_ci(k, n; z=1.96)
    p = k/n; d = 1 + z^2/n
    c = (p + z^2/(2n))/d
    h = z*sqrt(p*(1-p)/n + z^2/(4n^2))/d
    (c-h, c+h)
end
```

### 6.6 Clustering + anomaly detection

```julia
using Clustering, Statistics

X = Matrix(dropmissing(ev[:, [:interview_seconds, :dispatch_queue_seconds,
                              :travel_seconds, :on_scene_seconds]]))'
kmeans(X, 3)  # k-means; standardize first for mixed scales!

# Isolation forest via OutlierDetection.jl (API mirrors MLJ):
# using MLJ, OutlierDetection — fit IsolationForestDetector on X
```

### 6.7 Reusable: compliance + control-limit helpers

```julia
using Statistics
robust(x) = (median=median(skipmissing(x)),
             iqr=quantile(skipmissing(x),0.75)-quantile(skipmissing(x),0.25),
             p90=quantile(skipmissing(x),0.90),
             p95=quantile(skipmissing(x),0.95))

function p_chart_limits(p, n)
    se = sqrt(p*(1-p)/n)
    (p=p, ucl=p+3se, lcl=max(0.0, p-3se))
end
```

---

## 7. Time Series Snippets

### 7.1 Build a regular series from events

```julia
using DataFrames, Dates, TimeSeries, Statistics

# Hourly call counts from event timestamps
ev.hour = floor.(ev.call_start_time, Hour(1))
hourly = combine(groupby(ev, :hour), nrow => :ncalls)
sort!(hourly, :hour)

# Fill missing hours with 0 (critical — models assume regular spacing)
full_hours = minimum(hourly.hour):Hour(1):maximum(hourly.hour)
hc = leftjoin(DataFrame(hour=full_hours), hourly, on=:hour)
hc.ncalls = coalesce.(hc.ncalls, 0)

ta = TimeArray(hc.hour, hc.ncalls)  # TimeSeries.jl container
```

### 7.2 Diagnose: ACF/PACF, trend, day-of-week

```julia
# Hourly means by hour-of-day + day-of-week (circadian check)
hc.hour_of_day = hour.(hc.hour)
hc.dow = dayname.(hc.hour)
combine(groupby(hc, :hour_of_day), :ncalls => mean => :mean_calls)

# Lag-1..24 autocorrelation by hand (no single canonical acf() — this is transparent)
y = Float64.(ta.values)
[cor(y[1:end-k], y[k+1:end]) for k in 1:24]

# For formal ACF/PACF plots + Ljung-Box + ADF, bridge to Python/R initially:
# using PythonCall; sm = pyimport("statsmodels.tsa.stattools")  # acf, pacf, adfuller
```

### 7.3 Baseline → ETS → SARIMA (`StateSpaceModels.jl`)

```julia
using StateSpaceModels

y = Float64.(hc.ncalls[1:168])  # one clean week, hourly

# 1. Seasonal naive baseline (hand-rolled, 24h season): yesterday-same-hour
pred_naive = y[end-24+1:end]  # last day as "forecast" template for next day

# 2. ETS (exponential smoothing)
m_ets = ExponentialSmoothing(y; trend=true, seasonal=24)
fit!(m_ets)
f_ets = forecast(m_ets, 24)

# 3. SARIMA — e.g. (1,1,1)x(0,1,1,24) for hourly-with-daily-season
m_sarima = SARIMA(y; order=(1,1,1), seasonal_order=(0,1,1,24))
fit!(m_sarima)
print_results(m_sarima)
f = forecast(m_sarima, 24)          # point forecasts
# Monte Carlo intervals:
# simulate(m_sarima, 24, 1000) |> intervals

# 4. Structural / unobserved-components alternative
m_uc = StructuralModel(y; trend=true, seasonal=24)
fit!(m_uc)
f_uc = forecast(m_uc, 24)
```

### 7.4 Backtest + score (rolling origin — the honest evaluation)

```julia
using Statistics

mae(a,b)  = mean(abs.(a .- b))
rmse(a,b) = sqrt(mean((a .- b).^2))
mape(a,b) = 100*mean(abs.((a .- b) ./ max.(abs.(a), 1)))  # guarded vs /0
smape(a,b)= 100*mean(2*abs.(a.-b) ./ (abs.(a).+abs.(b) .+ 1e-8))

function rolling_backtest(y, h, train_min; order=(1,1,1), seasonal_order=(0,1,1,24))
    errs = Float64[]
    for t in train_min:length(y)-h
        m = SARIMA(y[1:t]; order=order, seasonal_order=seasonal_order)
        fit!(m)
        push!(errs, rmse(y[t+1:t+h], forecast(m, h).forecast))
    end
    mean(errs)
end
# Compare: naive RMSE vs ETS RMSE vs SARIMA RMSE — keep simplest winner
```

### 7.5 ML-flavored forecasting (lags + regression)

```julia
# When seasonality is irregular (events, staffing changes), lag features + regression
# often beat pure SARIMA. Build them explicitly:
function lagframe(y, lags=[1,2,3,24,25,168])
    n = length(y)
    m = maximum(lags)
    X = hcat([y[m-l+1:n-l] for l in lags]...)
    (X=X, y=y[m+1:n])
end
# Then: GLM.lm / MLJ regressor on (X,y); evaluate with §7.4 metrics
```

---

## 8. Julia Gotchas for Python/R Users

| Habit | Julia reality |
|-------|---------------|
| 0-indexing | **1-indexed.** `x[1]` is first. Off-by-ones bite in lag code — test with tiny vectors. |
| `NaN`/`None`/`NA` | **`missing` propagates**: `1 + missing == missing`. Use `skipmissing`, `coalesce.(x, 0)`, `dropmissing`. `nothing` is different (absence of value, not NA). |
| Copy vs view | `df[:, :col]` copies; `df[!, :col]` is a **view/mutation**. Use `!` when you intend to mutate. |
| Broadcasting | Dot everything elementwise: `f.(x)`, `a .+ b`, `df.x .> 5`. Forgetting `.` is the #1 beginner error. |
| Strings | Single quotes are `Char` (`'a'`), double quotes are `String` (`"a"`). `first.(s, 5)` works on strings. |
| Factors | Plain `String` columns don't order plots. Wrap with `CategoricalArray(x, ordered=true, levels=[...])`. |
| Package slowness | First `using`/`plot` triggers precompilation (slow once, fast after). Don't judge speed on first run. |
| Type stability | Avoid growing vectors in loops (`push!` into pre-sized or comprehension). Use `@code_warntype` when something is inexplicably slow. |
| Datetimes | `DateTime` format codes are `m/d/y H:M` (check `Dates.format` docs — they differ from Python `strftime`). Test-parse 3 rows before parsing 1M. |
| Plotting backends | `CairoMakie` = static files (PDF/PNG for reports). `WGLMakie`/`GLMakie` = interactive. `Gadfly` = quick ggplot sketches. Pick per task. |

---

## 9. Project Layout (recommended)

```
julia-eda-lab/
  Project.toml / Manifest.toml
  ingest.jl      # CSV → typed DataFrame + validation
  standards.jl   # threshold consts + compliance helpers (§6.7)
  eda.jl         # eda_checklist! + flag_outliers + cat_profile (§5)
  stats.jl       # boot_median_ci + wilson_ci + p_chart_limits (§6)
  forecast.jl    # lagframe + rolling_backtest + metrics (§7)
  app.jl         # (later) Genie/Dash stub — defer until analyses are solid
  reports/       # Quarto .qmd that calls Julia via `jupyter: julia-1.10` engine
```

---

## 10. Progress Tracker

- [ ] Phase 0: env + `describe` + grouped medians
- [ ] Phase 1: `eda.jl` runs on a new CSV unassisted
- [ ] Phase 2: t / Mann-Whitney / chi-square / Kruskal-Wallis reproduced
- [ ] Phase 2: OLS → Poisson → MixedModel on same response
- [ ] Phase 3: hourly series built, gaps filled, ACF inspected
- [ ] Phase 3: Naive vs ETS vs SARIMA backtest table
- [ ] Capstone: one report / bake-off / speed demo finished

## 11. Resources (short, high-signal)

- Julia docs: *Getting Started*, *DataFrames.jl* docs, *AlgebraOfGraphics* gallery.
- Books: *Julia for Data Analysis* (Bogumił Kamiński); *Think Julia* (free, for syntax).
- Time series: `StateSpaceModels.jl` docs (Air Passengers quickstart); Durbin & Koopman *Time Series Analysis by State Space Methods* (theory behind the package).
- Standards (for 9-1-1 context): NENA-STA-020.1 (90% ≤15s, 95% ≤20s), NFPA 1710 alarm-processing 64s/106s, turnout 60s/80s, travel 240s.
- Bridge docs: `RCall.jl` (for `survival`, `fable` ideas), `PythonCall.jl` (for `statsmodels` ACF/ADF until fluent in Julia-native equivalents).

---

## 12. Open Questions

- [ ] Which dataset is the capstone — 9-1-1 week, or a longer public series (e.g. Air Passengers → M3) for richer seasonality practice?
- [ ] Report target: Quarto PDF/Word (auditable) vs dashboard (live) — which first?
- [ ] Confirm AHJ thresholds before hard-coding `standards.jl` (some use 90% ≤10s busy-hour).

*Created 2026-09-25. Update §10 as phases complete; promote reusable functions from snippets into `julia-eda-lab/*.jl`.*
