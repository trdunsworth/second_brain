# setup.jl — one-time environment bootstrap for julia-eda-lab.
# Usage: julia setup.jl
# This populates Project.toml / Manifest.toml with UUIDs + versions.
# Re-run on a new machine as: julia --project=. -e 'using Pkg; Pkg.instantiate()'
import Pkg

Pkg.activate(@__DIR__)

core = [
    "DataFrames", "CSV", "DataFramesMeta", "Chain",
    "Statistics", "StatsBase", "Missings",
    "CategoricalArrays", "Dates",
    "HypothesisTests", "GLM", "Distributions",
    "TimeSeries", "StateSpaceModels",
    "PrettyTables",
]

plotting = [
    "AlgebraOfGraphics", "CairoMakie", "Gadfly",
]

ml_extra = [
    "MLJ", "Clustering", "OutlierDetection",
    "MixedModels", "ANOVA",
]

io_extra = [
    "Arrow", "Parquet2", "DuckDB",
]

println("Installing core deps (fast)...")
Pkg.add(core)

println("Installing plotting deps (slow first precompile, be patient)...")
Pkg.add(plotting)

println("Installing ML + IO extras...")
Pkg.add(ml_extra)
Pkg.add(io_extra)

Pkg.add("Revise")  # REPL auto-reload; add to ~/.julia/config/startup.jl: using Revise
Pkg.status()
println("\nDone. Commit Project.toml + Manifest.toml to git.")
