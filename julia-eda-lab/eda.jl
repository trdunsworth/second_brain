# eda.jl — reusable EDA toolkit. Promoted from julia_notes.md §5.
# Requires: DataFrames, Statistics, StatsBase.
using DataFrames, Statistics, StatsBase

"""
    missingness_table(df) -> DataFrame

Per-column nmissing / pct_missing / completeness, sorted worst-first.
"""
function missingness_table(df::DataFrame)
    n = nrow(df)
    out = DataFrame(
        col=[string(c) for c in names(df)],
        nmissing=[count(ismissing, df[!, c]) for c in names(df)],
    )
    out.pct_missing = 100 .* out.nmissing ./ max(n, 1)
    out.completeness = 100 .- out.pct_missing
    sort!(out, :pct_missing, rev=true)
    return out
end

"""
    numeric_profile(df) -> DataFrame

mean/median/std/min/max + skew/kurtosis/p90/p95 for numeric columns.
"""
function numeric_profile(df::DataFrame)
    numcols = names(df, Number)
    rows = map(numcols) do c
        v = collect(skipmissing(df[!, c]))
        isempty(v) && return (col=c, n=0, mean=missing, median=missing, std=missing,
                             min=missing, max=missing, skew=missing, kurt=missing,
                             p90=missing, p95=missing)
        (col=c, n=length(v), mean=mean(v), median=median(v), std=std(v),
         min=minimum(v), max=maximum(v), skew=skewness(v), kurt=kurtosis(v),
         p90=quantile(v, 0.90), p95=quantile(v, 0.95))
    end
    return DataFrame(rows)
end

"""
    cat_profile(df, col) -> DataFrame

Frequency table with pct + cumulative pct, sorted by count desc.
`col` may be Symbol or String.
"""
function cat_profile(df::DataFrame, col)
    g = combine(groupby(df, col), nrow => :n)
    g.pct = 100 .* g.n ./ max(nrow(df), 1)
    sort!(g, :n, rev=true)
    g.cum_pct = cumsum(g.pct)
    return g
end

"""
    flag_outliers(x; z_thresh=3.0, mad_thresh=3.5) -> DataFrame

Four boolean flag columns (iqr, mad, z, p01_99). Consensus = row sum ≥ 2.
Missing inputs propagate as missing flags.
"""
function flag_outliers(x::AbstractVector; z_thresh=3.0, mad_thresh=3.5)
    v = collect(skipmissing(x))
    @assert !isempty(v) "flag_outliers: empty input after skipmissing"
    q1, q3 = quantile(v, 0.25), quantile(v, 0.75)
    iqr = q3 - q1
    med = median(v)
    mad = median(abs.(v .- med))
    m, s = mean(v), std(v)
    lo, hi = q1 - 1.5iqr, q3 + 1.5iqr
    p1, p99 = quantile(v, 0.01), quantile(v, 0.99)
    _gt(a, b) = ismissing(a) ? missing : a > b
    _lt(a, b) = ismissing(a) ? missing : a < b
    DataFrame(
        iqr=(x .< lo) .| (x .> hi),
        mad=abs.(coalesce.(0.6745 .* (coalesce.(x, med) .- med) ./ max(mad, eps()), 0.0)) .> mad_thresh,
        z=abs.((coalesce.(x, m) .- m) ./ max(s, eps())) .> z_thresh,
        p01_99=(_lt.(x, p1) .| _gt.(x, p99)) .|> coalesce .|> x -> (x === missing ? false : x),
    )
end

"""Consensus outlier count: rows flagged by ≥ `min_votes` methods."""
function consensus_outliers(flags::DataFrame; min_votes=2)
    votes = sum.(eachrow(coalesce.(Matrix(flags), false)))
    count(>=(min_votes), votes)
end

"""
    spearman_matrix(df, cols) -> Matrix

Spearman correlation on pairwise-complete numeric columns.
Drops rows with any missing in `cols` (simple + transparent).
"""
function spearman_matrix(df::DataFrame, cols::AbstractVector)
    sub = dropmissing(df[:, string.(cols)])
    return corspearman(Matrix(sub))
end

"""
    eda_checklist!(df) -> missingness_table

One-call EDA smoke test: dims, dupes, worst missing, skew scan.
Prints to stdout; returns the missingness table for further use.
"""
function eda_checklist!(df::DataFrame)
    println("rows=$(nrow(df))  cols=$(ncol(df))  dupes=$(count(!nonunique(df)))")
    m = missingness_table(df)
    println("worst missing:"); show(first(m, min(5, nrow(m))); allcols=true); println()
    println("numeric skew scan (mean vs median):")
    for c in names(df, Number)
        v = collect(skipmissing(df[!, c])); isempty(v) && continue
        println("  ", c, " mean=", round(mean(v), digits=1),
                " med=", round(median(v), digits=1),
                " skew=", round(skewness(v), digits=2))
    end
    return m
end
