# standards.jl — threshold constants + compliance helpers. No dependencies.
# Maps to NENA / APCO / NFPA 1710 rules referenced in julia_notes.md.

"90% of 911 calls answered within 15s (NENA-STA-020.1)."
const NENA_ANSWER_15S_PCT = 90.0
"95% of 911 calls answered within 20s (NENA-STA-020.1)."
const NENA_ANSWER_20S_PCT = 95.0
"75% answered within 10s (APCO PSC handling benchmark used in this lab)."
const APCO_ANSWER_10S_PCT = 75.0

"NFPA 1710 alarm processing: 64s at 90th percentile."
const NFPA_ALARM_P90 = 64.0
"NFPA 1710 alarm processing: 106s at 95th percentile."
const NFPA_ALARM_P95 = 106.0
"NFPA 1710 turnout EMS / Fire at 90th percentile."
const NFPA_TURNOUT_EMS_P90 = 60.0
const NFPA_TURNOUT_FIRE_P90 = 80.0
"NFPA 1710 travel (first unit) at 90th percentile."
const NFPA_TRAVEL_P90 = 240.0

"""compliance_rate(n_met, n_total) -> % meeting a threshold."""
compliance_rate(n_met::Real, n_total::Real) = 100 * n_met / max(n_total, 1)

"""meets_standard(pct, threshold) -> Bool."""
meets_standard(pct::Real, threshold::Real) = pct >= threshold

"""nfpa_alarm_check(p90, p95) -> NamedTuple with pass/fail vs 64s/106s."""
function nfpa_alarm_check(p90::Real, p95::Real)
    (p90=p90, p95=p95,
     pass_p90=p90 <= NFPA_ALARM_P90,
     pass_p95=p95 <= NFPA_ALARM_P95)
end
