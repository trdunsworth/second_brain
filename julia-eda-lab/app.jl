# app.jl — dashboard stub. Deferred until analyses are solid.
# julia_notes.md §9 guidance: Julia dashboards are thinner than Shiny/Streamlit.
# Recommended path: Julia as compute layer (this folder) feeding a Python/R front end,
# OR a minimal Genie/Dash app below once eda.jl + stats.jl + forecast.jl are trusted.
#
# Minimal Genie sketch (needs Pkg.add("Genie")):
#   using Genie, Genie.Router, Genie.Renderer.Html
#   route("/health") do; "ok"; end
#   route("/compliance") do
#     # recompute wilson_ci / p_chart_limits from stats.jl over latest CSV
#     "see reports/ weekly PDF for auditable numbers"
#   end
#   up()
#
# Live-alert rule to implement later: recompute 15-min answer-≤20s %;
# flag when < 90% for 3 consecutive intervals (mirrors ops dashboard spec).
