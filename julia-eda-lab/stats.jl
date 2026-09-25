# stats.jl — robust summaries, CIs, control limits, bootstrap.
# Promoted from julia_notes.md §6. Light deps only (Statistics, Random).
# HypothesisTests / GLM / MixedModels usage stays in run_lab.jl examples
# so this file loads even in a minimal env.
using Statistics, Random

"""Robust summary: median / IQR / p90 / p95, missing-safe."""
function robust_summary(x)
    v = collect(skipmissing(x))
    @assert !isempty(v) "robust_summary: empty input"
    (median=median(v),
     iqr=quantile(v, 0.75) - quantile(v, 0.25),
     p90=quantile(v, 0.90),
     p95=quantile(v, 0.95))
end

"""
    wilson_ci(k, n; z=1.96) -> (lo, hi)

Wilson score interval for a binomial proportion. No dependencies.
"""
function wilson_ci(k::Real, n::Real; z=1.96)
    @assert n > 0 "wilson_ci: n must be > 0"
    p = k / n
    d = 1 + z^2 / n
    c = (p + z^2 / (2n)) / d
    h = z * sqrt(p * (1 - p) / n + z^2 / (4n^2)) / d
    return (max(0.0, c - h), min(1.0, c + h))
end

"""
    p_chart_limits(p, n) -> NamedTuple(p, ucl, lcl)

Shewhart p-chart limits: p ± 3√(p(1-p)/n), LCL floored at 0.
"""
function p_chart_limits(p::Real, n::Real)
    se = sqrt(max(p * (1 - p), 0.0) / max(n, 1))
    (p=p, ucl=p + 3se, lcl=max(0.0, p - 3se))
end

"""
    boot_median_ci(x; B=10_000, alpha=0.05, seed=7) -> NamedTuple

Nonparametric bootstrap CI for the median.
"""
function boot_median_ci(x; B=10_000, alpha=0.05, seed=7)
    v = collect(skipmissing(x))
    @assert !isempty(v) "boot_median_ci: empty input"
    rng = MersenneTwister(seed)
    n = length(v)
    boots = [median(rand(rng, v, n)) for _ in 1:B]
    lo, hi = quantile(boots, [alpha / 2, 1 - alpha / 2])
    return (median=median(v), lo=lo, hi=hi, B=B)
end

# --- Hypothesis-test / model recipes (need HypothesisTests.jl + GLM.jl) ---
# Run these in run_lab.jl after `using HypothesisTests, GLM`:
#
#   using HypothesisTests
#   day = collect(skipmissing(ev[ev.shift_label .== "Day", :dispatch_queue_seconds]))
#   night = collect(skipmissing(ev[ev.shift_label .== "Night", :dispatch_queue_seconds]))
#   UnequalVarianceTTest(day, night)   # Welch — default for skew
#   MannWhitneyUTest(day, night)       # non-parametric alternative
#   BinomialTest(90, 100, 0.90)        # compliance vs NENA 90% line
#
#   using GLM
#   ols = fit(LinearModel, @formula(total_elapsed_seconds ~ priority + shift_label), ev)
