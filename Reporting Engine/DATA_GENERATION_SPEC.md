# Synthetic Data Generation Specification

**Purpose**: Expand the current single-week datasets to 4–8 weeks for trend analysis, stability testing, and report validation.

**Date**: 2026-08-31

---

## Current State

| Dataset | File | Rows | Columns | Time Span |
|---------|------|------|---------|-----------|
| CAD Events | `IndyMo_incidents.csv` | 1,082 | 48 | 1 week (week 33) |
| Phone Volumes | `IndyMo_hourly_call_counts.csv` | 168 | 21 | 1 week (week 33) |

Both datasets use `week_no = 33` for all rows.

---

## Target State

| Dataset | File | Rows (approx.) | Columns | Time Span |
|---------|------|----------------|---------|-----------|
| CAD Events | `IndyMo_incidents.csv` | 4,000–8,000 | 48 (unchanged) | 4–8 weeks |
| Phone Volumes | `IndyMo_hourly_call_counts.csv` | 672–1,344 | 21 (unchanged) | 4–8 weeks |

**One CSV per dataset, all weeks combined.** Do not split into separate files.

---

## Schema (unchanged)

### CAD Events — `IndyMo_incidents.csv`

| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| `incident_id` | string | Unique incident identifier | Format: `INC-XXXXX` or similar |
| `call_id` | string | Associated call ID | May be null for walk-ins |
| `call_datetime` | datetime | When the call was received | ISO 8601 format |
| `dispatch_datetime` | datetime | When the call was dispatched | May be null |
| `on_scene_datetime` | datetime | When unit arrived on scene | May be null |
| `close_datetime` | datetime | When incident was closed | May be null |
| `priority` | int | 1 (highest) to 4 (lowest) | Uniform-ish distribution across shifts |
| `shift` | string | `D` (day) or `N` (night) | Derived from call_datetime |
| `shift_label` | string | `DAY` or `NIGHT` | Mirror of shift |
| `shift_group` | int | Numeric shift grouping | Derived |
| `dow` | string | Day of week | Mon–Sun |
| `hour` | int | Hour of day (0–23) | Derived from call_datetime |
| `week_no` | int | ISO week number | **This column changes across weeks** |
| `agency` | string | Responding agency | Consistent set across all weeks |
| `zip5` | string | 5-digit ZIP code | Consistent geography |
| `latitude` | float | Incident latitude | Indianapolis metro area |
| `longitude` | float | Incident longitude | Indianapolis metro area |
| `interview_seconds` | float | Time spent interviewing caller | Right-skewed, mean ~49s |
| `dispatch_queue_seconds` | float | Time in dispatch queue | Right-skewed, mean ~85s |
| `turnout_seconds` | float | Time from dispatch to en route | Right-skewed, mean ~42s |
| `travel_seconds` | float | Travel time to scene | Right-skewed, mean ~315s |
| `on_scene_seconds` | float | Time on scene | Right-skewed, mean ~2,000s |
| `closeout_seconds` | float | Time to close after on-scene | Right-skewed, mean ~320s |
| `phone_duration_seconds` | float | Total phone handling time | Right-skewed, mean ~323s |
| `total_elapsed_seconds` | float | End-to-end time | Right-skewed, mean ~3,000s |
| `pickup_delay_seconds` | float | Delay before pickup | Right-skewed, mean ~2.5s |
| `pre_cad_offset_seconds` | float | Pre-CAD offset | Near-zero mean |
| `abandoned` | int/bool | Whether caller abandoned (0/1) | ~5–10% rate |

*Include any additional columns from the current file — the schema should not shrink.*

### Phone Volumes — `IndyMo_hourly_call_counts.csv`

| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| `date` | date | Calendar date | Format: `YYYY-MM-DD` |
| `hour_of_day` | int | Hour (0–23) | |
| `nine_one_one_calls_received` | int | Emergency calls received | Mean ~17.5/hr |
| `non_emergency_calls_received` | int | Non-emergency calls received | Mean ~24/hr |
| `outbound_calls_placed` | int | Outbound calls by staff | Mean ~9.5/hr |
| `nine_one_one_calls_abandoned` | int | Emergency calls abandoned | Mean ~0.4/hr |
| `non_emergency_calls_abandoned` | int | Non-emergency calls abandoned | Mean ~1.2/hr |
| `nine_one_one_answered_10s_pct` | float | % answered within 10s | Target: >80% |
| `nine_one_one_answered_15s_pct` | float | % answered within 15s | Target: >90% |
| `nine_one_one_answered_20s_pct` | float | % answered within 20s | Target: >95% |
| `nine_one_one_answered_40s_pct` | float | % answered within 40s | Target: >99% |
| `non_emergency_answered_10s_pct` | float | % answered within 10s | |
| `non_emergency_answered_15s_pct` | float | % answered within 15s | |
| `non_emergency_answered_20s_pct` | float | % answered within 20s | |
| `non_emergency_answered_40s_pct` | float | % answered within 40s | |
| `nine_one_one_mean_duration` | float | Mean emergency call duration | Mean ~207s |
| `non_emergency_mean_duration` | float | Mean non-emergency duration | Mean ~119s |
| `outbound_mean_duration` | float | Mean outbound call duration | Mean ~61s, right-skewed |
| `call_mean_duration` | float | Mean overall call duration | Mean ~137s |
| `total_emergency_calls` | int | Sum of emergency calls | |
| `total_nonemergency_calls` | int | Sum of non-emergency calls | |
| `total_calls` | int | Grand total | Mean ~51/hr |

*Include any additional columns from the current file.*

---

## Week-over-Week Variation Guidelines

The goal is realistic synthetic data that lets the reporting engine demonstrate trend analysis. **Do not** make every week identical.

### Variation to introduce

| Element | How to vary | Why |
|---------|-------------|-----|
| **Call volume** | ±10–20% week-to-week | Tests volume trend charts |
| **Hourly patterns** | Shift peaks slightly between weeks | Tests whether hourly patterns are stable |
| **Priority mix** | Vary the P1/P2 ratio slightly | Tests priority distribution stability |
| **Dispatch queue times** | ±15% mean shift between weeks | Tests whether queue time trends are detectable |
| **Abandonment rate** | Vary between 5–12% | Tests whether abandonment spikes are visible |
| **Answered-within-X%** | Vary slightly (clamp to 0–100%) | Tests KPI stability |
| **Agency mix** | Keep consistent (same agencies) | Realistic — agencies don't change week-to-week |

### Special event week (optional but valuable)

One of the 4–8 weeks should simulate a realistic disruption:

- **Scenario options**: Heat wave, major accident, festival, severe weather
- **Effects**: Higher call volume (+30–50%), longer `on_scene_seconds` (+20–40%), higher abandonment rate, lower answered-within-10s%
- **Duration**: 2–3 days within that week (not the entire week)

This creates a detectable anomaly that the reporting engine can flag in trend analysis.

### Time span

Suggested `week_no` range: **33–36** (4 weeks) or **33–40** (8 weeks).

If using `date` or `call_datetime`, ensure:
- No gaps in the date range (every day has data)
- Weekday/weekend patterns differ (weekends: more evening calls, different priority mix)
- Hours 0–5 have lower volume than hours 10–18

---

## Constraints

1. **Same schema** — no new columns, no renamed columns, no dropped columns
2. **Same geography** — same ZIP codes, same agency names, same lat/long range
3. **Same distributions** — preserve the right-skew of time columns; do not normalize them
4. **Referential integrity** — every `incident_id` is unique; `call_id` links correctly
5. **No synthetic artifacts** — avoid round numbers, exact duplicates, or impossible combinations (e.g., `on_scene_datetime` before `dispatch_datetime`)
6. **File format** — UTF-8 CSV, no index column, consistent quoting

---

## Validation Checklist

After generating, verify:

- [ ] `week_no` has the expected number of unique values (4–8)
- [ ] Total rows ≈ (weekly row count) × (number of weeks)
- [ ] No duplicate `incident_id` values
- [ ] All datetime columns parse correctly
- [ ] Time columns are right-skewed (skewness > 0.5)
- [ ] `priority` values are in {1, 2, 3, 4}
- [ ] `shift` values are in {D, N}
- [ ] Phone volumes have exactly 168 rows per week (24 hours × 7 days)
- [ ] Percent columns are between 0 and 100
- [ ] No null values in critical columns (`incident_id`, `call_datetime`, `priority`, `shift`)

---

## Output

Replace the existing files in `data/`:

```
data/
├── IndyMo_incidents.csv          # 4–8 weeks combined
└── IndyMo_hourly_call_counts.csv # 4–8 weeks combined
```

The existing single-week files will be overwritten. No other files need to change.
