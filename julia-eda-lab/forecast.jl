# forecast.jl — metrics, lag features, baselines, generic backtester.
# Promoted from julia_notes.md §7. Light deps only (DataFrames, Dates, Statistics).
# StateSpaceModels.jl is used via dependency injection (pass a fit/forecast
# closure) so this file loads without the heavy dep. See run_lab.jl.
using DataFrames, Dates, Statistics

"""Mean absolute error."""
mae(a, b) = mean(abs.(a .- b))
"""Root mean squared error."""
rmse(a, b) = sqrt(mean((a .- b) .^ 2))
"""Guarded MAPE (denominator floored at 1 to avoid /0)."""
mape(a, b) = 100 * mean(abs.((a .- b) ./ max.(abs.(a), 1)))
"""Symmetric MAPE."""
smape(a, b) = 100 * mean(2 .* abs.(a .- b) ./ (abs.(a) .+ abs.(b) .+ 1e-8))

"""
    lagframe(y, lags=[1,2,3,24,25,168]) -> (X, target)

Build a lag-feature matrix. Returns `X` (rows aligned) and `target`.
Example: `X, z = lagframe(y); coef = X \\ z`.
"""
function lagframe(y::AbstractVector, lags=[1, 2, 3, 24, 25, 168])
    yv = collect(y)
    m = maximum(lags)
    @assert length(yv) > m "lagframe: series shorter than max lag $m"
    X = hcat([yv[m-l+1:end-l] for l in lags]...)
    return (X=X, y=yv[m+1:end])
end

"""
    seasonal_naive_forecast(y, season, h) -> Vector

Repeat the last `season` observations as the next-`h` forecast.
`season=24` for hourly-with-daily-season, `7` for daily-with-weekly-season.
"""
function seasonal_naive_forecast(y::AbstractVector, season::Int, h::Int)
    @assert length(y) >= season "series shorter than season $season"
    template = collect(y)[end-season+1:end]
    return [template[mod(i - 1, season) + 1] for i in 1:h]
end

"""
    rolling_backtest(fit_forecast, y, h, train_min) -> mean RMSE

Generic rolling-origin backtest. `fit_forecast(train) -> forecast::Vector`
is any closure — e.g. wrapping StateSpaceModels, a linear model on
`lagframe`, or `seasonal_naive_forecast`.
"""
function rolling_backtest(fit_forecast::Function, y::AbstractVector, h::Int, train_min::Int)
    yv = collect(y)
    @assert train_min + h <= length(yv) "series too short for train_min=$train_min, h=$h"
    errs = Float64[]
    for t in train_min:length(yv)-h
        fc = fit_forecast(yv[1:t])
        @assert length(fc) >= h "fit_forecast returned $(length(fc)) < h=$h"
        push!(errs, rmse(yv[t+1:t+h], fc[1:h]))
    end
    return mean(errs)
end

"""
    hourly_counts(df, timecol) -> DataFrame(hour, n)

Aggregate event timestamps to a complete hourly grid with zero-filled gaps.
"""
function hourly_counts(df::DataFrame, timecol::Union{Symbol,String}=:hour)
    col = string(timecol) in names(df) ? string(timecol) : string(:call_start_time)
    t = df[!, col]
    @assert eltype(t) <: Union{Missing,DateTime} "expected DateTime column, got $(eltype(t))"
    hrs = floor.(coalesce.(t, DateTime(2000)), Hour(1))
    g = combine(groupby(DataFrame(h=hrs), :h), nrow => :n)
    full = minimum(g.h):Hour(1):maximum(g.h)
    out = leftjoin(DataFrame(h=collect(full)), g, on=:h)
    out.n = coalesce.(out.n, 0)
    rename!(out, :h => :hour)
    sort!(out, :hour)
    return out
end

# --- StateSpaceModels recipe (run in run_lab.jl after `using StateSpaceModels`) ---
#   using StateSpaceModels
#   m = SARIMA(y; order=(1,1,1), seasonal_order=(0,1,1,24)); fit!(m)
#   fc = forecast(m, 24).forecast
#   m_ets = ExponentialSmoothing(y; trend=true, seasonal=24); fit!(m_ets)
