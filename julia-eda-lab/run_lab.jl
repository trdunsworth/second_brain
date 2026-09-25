# run_lab.jl — end-to-end smoke test for julia-eda-lab.
# Usage:
#   julia --project=. run_lab.jl                        # uses synthetic demo data
#   julia --project=. run_lab.jl path/to/incidents.csv  # your own CSV
#
# Phase mapping (julia_notes.md §3):
#   Phase 1 → eda_checklist!, missingness_table, numeric_profile, flag_outliers
#   Phase 2 → robust_summary, wilson_ci, p_chart_limits, boot_median_ci
#   Phase 3 → hourly_counts, seasonal_naive_forecast, rolling_backtest + metrics
import Pkg
Pkg.activate(@__DIR__)

include(joinpath(@__DIR__, "ingest.jl"))
include(joinpath(@__DIR__, "standards.jl"))
include(joinpath(@__DIR__, "eda.jl"))
include(joinpath(@__DIR__, "stats.jl"))
include(joinpath(@__DIR__, "forecast.jl"))

using DataFrames, Dates, Statistics

function demo_frame()
    n = 500
    DataFrame(
        call_start_time=[DateTime(2026, 8, 10) + Hour(i) for i in 1:n],
        dispatch_queue_seconds=abs.(50 .* randn(n) .+ 40),
        on_scene_seconds=abs.(1800 .* randn(n) .+ 2000),
        shift_label=repeat(["Day", "Night"], inner=250),
        call_disposition=vcat(fill("CLOSED", 350), fill("UNDEFINED", 150)),
        postal_code=repeat(["46201", "46202", "46203"], inner=167)[1:n],
    )
end

function main()
    ev = length(ARGS) >= 1 ? load_events(ARGS[1]) : demo_frame()

    println("== Phase 1: EDA ==")
    m = eda_checklist!(ev)
    println("\nTop missing:\n"); show(first(m, 5); allcols=true); println()
    println("\nNumeric profile:\n"); show(numeric_profile(ev); allcols=true); println()

    if "dispatch_queue_seconds" in names(ev)
        f = flag_outliers(ev[!, "dispatch_queue_seconds"])
        println("\nConsensus outliers (≥2 methods): ",
                consensus_outliers(f), " / ", nrow(ev))
    end
    if "call_disposition" in names(ev)
        println("\nDisposition profile:\n")
        show(first(cat_profile(ev, "call_disposition"), 5); allcols=true); println()
    end

    println("\n== Phase 2: advanced ==")
    if "dispatch_queue_seconds" in names(ev)
        r = robust_summary(ev[!, "dispatch_queue_seconds"])
        println("robust dispatch_queue_seconds: ", r)
        b = boot_median_ci(ev[!, "dispatch_queue_seconds"]; B=2_000)
        println("boot median CI (B=2000): ", b)
    end
    # Compliance demo: 90/100 vs NENA 90% line
    lo, hi = wilson_ci(90, 100)
    println("wilson_ci(90,100) = ($(round(lo,digits=3)), $(round(hi,digits=3)))")
    println("p_chart_limits(0.9, 100) = ", p_chart_limits(0.9, 100))
    println("nfpa check (p90=70, p95=110): ", nfpa_alarm_check(70.0, 110.0))

    println("\n== Phase 3: time series ==")
    tcol = "call_start_time" in names(ev) ? :call_start_time : Symbol(names(ev)[1])
    hc = hourly_counts(ev, tcol)
    y = Float64.(hc.n)
    println("hourly points: ", length(y))
    h = min(24, length(y) ÷ 4)
    naive = seasonal_naive_forecast(y[1:end-h], 24 <= length(y) - h ? 24 : 1, h)
    println("seasonal-naive RMSE(h=$h): ", round(rmse(y[end-h+1:end], naive), digits=3))
    bt = rolling_backtest(tr -> seasonal_naive_forecast(tr, 24 <= length(tr) ? 24 : 1, h),
                          y, h, max(length(y) - 3h, h + 1))
    println("rolling backtest mean RMSE: ", round(bt, digits=3))

    println("\nOK — lab smoke test passed.")
    return 0
end

exit(main())
