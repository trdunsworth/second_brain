# SynthCCD Realism Guide

A companion to the [User Guide](USERSGUIDE.md) describing how the generator produces
realistic CAD and hourly phone-center statistics, the YAML realism configuration
file, and the default distribution parameters baked in at build time.

- User-facing interface, CLI reference, schema, and quick start: see [[USERSGUIDE]]
- Default statistical distributions and how they are tuned: this document

---

## Realism Configuration

For users who want to emulate a specific 9-1-1 center with known operational
characteristics, SynthCCD supports a **YAML realism configuration file** that
overrides all default statistical distributions.

### Using a Config File

```bash
# Generate with custom realism config
uv run SynthCCD generate --config path/to/realism_config.yaml --rows 50000
```

### Validating a Config File

Validate a realism config without generating data. The same validation rules
described below (weight sums, required time-profile keys, dispatch-init-fraction
bounds, phone-metric bounds, shift config, name locales) are applied:

```bash
uv run SynthCCD validate-config path/to/realism_config.yaml
```

Prints `OK` for valid files and exits non-zero (1) if any file fails validation,
listing the offending section. Validate several files in one call by passing
multiple paths.

### Config File Structure

An example config file is provided at `config/example_realism.yaml`. Copy and modify
it to match your center's data:

```yaml
# Agency distribution (must sum to 1.0)
agency_weights:
  LAW: 0.52
  FIRE: 0.20
  EMS: 0.28

# Agency display names (used in output)
agency_names:
  LAW: "POLICE"
  FIRE: "FIRE"
  EMS: "EMS"

# Priority weights per agency (each agency must sum to 1.0)
# Priority 1 = highest, 5 = lowest
priority_weights:
  LAW:
    1: 0.12
    2: 0.18
    3: 0.28
    4: 0.26
    5: 0.16
  FIRE:
    1: 0.18
    2: 0.24
    3: 0.24
    4: 0.20
    5: 0.14
  EMS:
    1: 0.16
    2: 0.26
    3: 0.28
    4: 0.18
    5: 0.12

# Problem natures per agency and priority (weights must sum to 1.0 per priority pool)
# The problem is drawn only from the pool matching the incident's selected priority
problem_profiles:
  LAW:
    1:
      - ["Shots Fired", 0.20]
      - ["Burglary In Progress", 0.15]
      # ... more entries
    2:
      - ["Domestic Disturbance", 0.18]
      # ... more entries
  FIRE:
    1:
      - ["Structure Fire", 0.30]
      # ... more entries
  EMS:
    3:
      - ["Fall Injury", 0.18]
      # ... more entries

# Call reception methods (must sum to 1.0)
call_reception_weights:
  "E-911": 0.33
  "Phone": 0.38
  "OFFICER": 0.14
  "Radio": 0.06
  "C2C": 0.05
  "NOT CAPTURED": 0.02
  "Text": 0.01
  "CAD2CAD": 0.01

# Disposition codes per agency (must sum to 1.0 per agency)
disposition_profiles:
  LAW:
    - ["NR-No Report", 0.40]
    - ["RE-Report", 0.15]
    # ... more entries
  FIRE:
    - ["NR-No Report", 0.45]
    - ["UNDEFINED", 0.29]
    # ... more entries
  EMS:
    - ["NR-No Report", 0.45]
    - ["UNDEFINED", 0.38]
    # ... more entries

# Time profiles per agency and priority (mean seconds for lognormal distribution)
time_profiles:
  LAW:
    1:
      interview_mean: 12
      dispatch_mean: 4
      turnout_mean: 10
      travel_mean: 220
      scene_mean: 1500
      closeout_mean: 240
      phone_mean: 170
    # ... priorities 2-5
  FIRE:
    # ... all 5 priorities
  EMS:
    # ... all 5 priorities

# Fraction of the phone window that must elapse before dispatch can begin,
# per priority (lo, hi). Fractions < 1.0 dispatch while the caller is still on
# the phone (parallel dispatch); >= 1.0 defer dispatch until after the call ends.
dispatch_init_fraction:
  1: [0.05, 0.20]
  2: [0.20, 0.50]
  3: [0.40, 0.80]
  4: [0.90, 1.10]
  5: [1.00, 1.30]

# Phone-metric factors for hourly call counts (volume fractions of base hourly
# volume, abandonment rates, weekend multiplier, and answer-time distributions)
phone_metrics:
  min_hourly_volume: 2.0
  nine_one_one_received_fraction: 0.48
  non_emergency_received_fraction: 0.58
  outbound_calls_fraction: 0.26
  nine_one_one_abandonment_rate: 0.02
  night_abandonment_increment: 0.03
  non_emergency_abandonment_rate: 0.05
  max_abandonment_rate: 0.12
  weekend_multiplier: 1.12
  nine_one_one_answer_time_mu: 1.80
  nine_one_one_answer_time_sigma: 0.80
  non_emergency_answer_time_mu: 1.70
  non_emergency_answer_time_sigma: 0.80
  answer_time_thresholds: [10, 15, 20, 40]
  answer_time_load_sensitivity: 0.25
  answer_time_mu_noise_sd: 0.05

# Diurnal call volume pattern (24 values for hours 0-23, will be normalized)
hourly_weights:
  - 0.030
  - 0.025
  # ... 24 values total

# Shift structure: crew rotation pattern plus the shifts on the clock.
# rotation: one crew-group id per calendar day, repeating. Day 1 is the weekday
#   given by cycle_start_weekday (0 = Monday).
# shifts: each entry lists a shift name, a human label, its on-duty hours, its
#   crew rotation group, and staffing. Omit calltakers/dispatchers to fall back
#   to the global --calltaker-pool-size / --dispatcher-pool-size split.
shift_config:
  name: "2x12h-4shift-14day"
  cycle_start_weekday: 0
  rotation: [1, 1, 2, 2, 1, 1, 1, 2, 2, 1, 1, 2, 2, 2]
  shifts:
    - name: A
      label: DAY
      start_hour: 6
      start_minute: 0
      end_hour: 18
      end_minute: 0
      rotation: 1
      calltakers: 3
      dispatchers: 2
    - name: B
      label: DAY
      start_hour: 6
      start_minute: 0
      end_hour: 18
      end_minute: 0
      rotation: 2
      calltakers: 3
      dispatchers: 2
    - name: C
      label: NIGHT
      start_hour: 18
      start_minute: 0
      end_hour: 6
      end_minute: 0
      rotation: 1
      calltakers: 3
      dispatchers: 2
    - name: D
      label: NIGHT
      start_hour: 18
      start_minute: 0
      end_hour: 6
      end_minute: 0
      rotation: 2
      calltakers: 3
      dispatchers: 2
```

### Customizable Parameters

| Section | Description | Validation |
|---------|-------------|------------|
| `agency_weights` | Relative frequency of LAW/FIRE/EMS incidents | Must sum to 1.0 |
| `agency_names` | Display names for agencies in output | Must cover all agencies in `agency_weights` |
| `priority_weights` | Priority 1-5 distribution per agency | Each agency sums to 1.0 |
| `problem_profiles` | Call type distribution per agency | Each agency sums to 1.0 |
| `call_reception_weights` | How calls are received (911, Phone, etc.) | Must sum to 1.0 |
| `disposition_profiles` | Outcome codes per agency | Each agency sums to 1.0 |
| `time_profiles` | Mean seconds for 7 time intervals per agency/priority | All 7 intervals required per priority |
| `dispatch_init_fraction` | (lo, hi) fraction of the phone window before dispatch can begin, per priority | All 5 priorities, lo >= 0 and hi >= lo |
| `phone_metrics` | Volume fractions, abandonment rates, weekend multiplier, and answer-time distributions for hourly call counts | All required keys; max_abandonment_rate in [0, 1] |
| `hourly_weights` | 24-hour call volume pattern | 24 values, auto-normalized |
| `shift_config` | Crew rotation pattern and per-shift hours/rotation/staffing | Unique shift names, every rotation group covers all 24 hours |
| `name_locales` | Faker locale blend for personnel rosters, per country | Valid Faker locales, positive weights, uppercase ISO country keys |
| `problem_phone_multipliers` | Per-problem-type phone duration multipliers | Positive floats; unlisted problems default to 1.0 |

The `psap_agency` field on `GenerationRequest` (not the realism config) filters which
agencies appear in the output. Valid values: `all`, `law`, `fire`, `ems`, `fire_ems`.
This filters `agency_weights` before generation, so all downstream tables (priority,
problem, disposition, timing) adapt automatically.

> Note: the config key is `problem_profiles` (not `problem_problems`).

### Time Profile Intervals

Each agency/priority combination requires these 7 intervals (mean seconds):

| Interval | Description |
|----------|-------------|
| `interview_mean` | Caller questioning duration |
| `dispatch_mean` | Queue to unit assignment |
| `turnout_mean` | Station to wheels rolling |
| `travel_mean` | Wheels rolling to on-scene |
| `scene_mean` | On-scene duration |
| `closeout_mean` | Scene clear to incident close |
| `phone_mean` | Total call duration |

Dispatch runs on a parallel timeline to call-taking. `dispatch_init_fraction` controls
how far through the phone window dispatch may begin, per priority: values below 1.0
mean a unit can be dispatched while the caller is still on the phone (high-priority
calls), and values of 1.0+ defer dispatch until after the call ends (low-priority
calls).

### Problem-Type Phone Duration Multipliers

Call duration varies significantly by problem nature. A cardiac arrest or active shooter
incident typically involves a much longer caller interaction than a noise complaint or
traffic stop. The `problem_phone_multipliers` section applies a per-problem multiplier
to the base `phone_mean` (from `time_profiles`) for each incident, creating realistic
correlation between problem type and call duration.

```yaml
problem_phone_multipliers:
  "Active Shooter": 2.5
  "Cardiac Arrest": 1.6
  "Structure Fire": 1.5
  "Noise Complaint": 1.0
  "Traffic Stop": 1.0
```

- **Multiplier > 1.0**: Increases the expected phone duration for that problem type
- **Multiplier < 1.0**: Decreases the expected phone duration
- **Unlisted problems**: Default to 1.0 (no adjustment)

The multiplier is applied to the agency/priority `phone_mean` at incident generation
time, after the problem nature is selected. This means high-acuity problems (which
tend to appear at higher priorities) receive longer call durations on top of their
priority-based `phone_mean`.

| Problem Type | Default Multiplier | Rationale |
|--------------|-------------------|-----------|
| Active Shooter | 2.5 | Extended caller interaction, tactical coordination |
| Cardiac Arrest | 1.6 | Pre-arrival instructions, prolonged caller engagement |
| Structure Fire | 1.5 | Multiple caller reports, evolving situation updates |
| Shots Fired | 1.6 | Caller safety, suspect tracking |
| Domestic Disturbance | 1.4 | Volatile situation, ongoing risk assessment |
| Stroke | 1.5 | Time-critical medical instructions |
| Burglary In Progress | 1.5 | Caller hiding, real-time updates |
| Noise Complaint | 1.0 | Brief informational call |
| Traffic Stop | 1.0 | Officer-initiated, minimal caller interaction |

### Shift Structures

Every incident is tagged with the shift on duty at its call time (`shift`,
`shift_label`, and `shift_group` columns). The default is a **2x12h center with
four shifts and a 14-day crew rotation**; `shift_preset` selects a built-in
structure, and `shift_config` in the realism YAML defines a fully custom one.
When `shift_preset` is omitted, the realism config's `shift_config` is used.

Built-in presets (selectable via `--shift-preset`):

| Preset | Structure |
|--------|-----------|
| `2x12h-4shift-14day` (default) | Shifts A/B (day 06:00-18:00) and C/D (night 18:00-06:00) on a repeating 14-day rotation `1,1,2,2,1,1,1,2,2,1,1,2,2,2` starting Monday; group 1 = A day + C night, group 2 = B day + D night |
| `2x12h-2shift` | Single day and single night shift, no crew cycling |
| `3x8h-3shift` | Morning (06-14), Swing (14-22), Midnight (22-06) |
| `4x10h-4shift` | Day (06-16), Coverage (10-21), Evening (16-02), Night (21-07) |

Each shift in the YAML defines:

| Key | Description |
|-----|-------------|
| `name` | Short identifier, written to the `shift` column (must be unique) |
| `label` | Human label (e.g., DAY, NIGHT), written to `shift_label` |
| `start_hour` / `start_minute` | On-duty start time (24-hour clock) |
| `end_hour` / `end_minute` | On-duty end time; an end before the start means the shift crosses midnight |
| `rotation` | Crew-group id; the day's active group is `rotation[days_since_cycle_start % len(rotation)]` |
| `calltakers` / `dispatchers` | Staffed positions on this shift; omit to split the global pool totals |

`rotation` is a repeating list of crew-group ids, one per calendar day, starting
on `cycle_start_weekday` (0 = Monday). Validation requires unique shift names,
at least one shift per rotation group, and that each rotation group's shifts
together cover all 24 hours. Overnight shifts and shifts with overlapping hours
(used to model peak coverage) are supported; when multiple shifts in the active
group are on duty, the one that started most recently is assigned.

Example custom structure (2x12h, one day shift and one night shift, no cycling):

```yaml
shift_config:
  name: "my-center"
  cycle_start_weekday: 0
  rotation: [1]
  shifts:
    - name: A
      label: DAY
      start_hour: 6
      end_hour: 18
      rotation: 1
      calltakers: 4
      dispatchers: 3
    - name: B
      label: NIGHT
      start_hour: 18
      end_hour: 6
      rotation: 1
      calltakers: 3
      dispatchers: 2
```

### Personnel Name Locales

The `name_locales` section controls the pool of names used for `calltaker` and
`dispatcher` columns, so personnel rosters match the region being modeled.

**Country resolution.** The country is derived from the geocoded OSM/Nominatim
area (`resolved_country()` on the address provider, persisted in the address
cache as a sidecar `.meta.json`). When the provider cannot determine a country
(for example static address pools or an area with no country data), the
request's `--country` flag is used, falling back to `US`.

**Resolution order per country:**

1. A `name_locales` override for that country in the realism config.
2. The built-in country → locale map (`COUNTRY_LOCALES`; multi-language
   countries such as Canada use `en_CA`/`fr_CA` with equal weight).
3. For the default country (`US`), a weighted multi-ethnic blend approximating
   a typical large American call center:

```yaml
name_locales:
  US:
    en_US: 0.64
    es_MX: 0.16
    en_NG: 0.07
    zh_CN: 0.03
    fil_PH: 0.03
    fr_CA: 0.02
    hi_IN: 0.02
    de_DE: 0.02
    it_IT: 0.02
    pt_BR: 0.02
    ja_JP: 0.01
    ko_KR: 0.01
    ru_RU: 0.01
    ar_SA: 0.01
```

4. The fallback locale (`en_US`) for countries with no profile.

Each value is either a **list** of Faker locales (equal weight) or a **mapping**
of locale to positive weight (normalized at generation time):

```yaml
name_locales:
  # Canadian center, equal English/French weight
  CA:
    - en_CA
    - fr_CA
  # Irish center, weighted English/Irish-Gaelic roster
  IE:
    en_IE: 0.7
    ga_IE: 0.3
```

Names are generated per shift from a weighted, seeded multi-locale pool;
locales are drawn proportionally to their weights and names are never repeated
within a run. All output names are normalized to clean ASCII via transliteration
(accented Latin, Cyrillic, and Arabic are romanized; CJK and Devanagari names
fall back to the default locale). Non-Latin locales (e.g. `zh_CN`, `ja_JP`,
`ru_RU`, `ar_SA`) still work via realism config overrides — the fallback ensures
ASCII output regardless of source script. The US ethnic blend uses only
Latin-script locales for diversity (`en_IN`, `en_KE`, `nl_NL`, `pl_PL`, etc.).

> Note: locale choices favor Faker providers with reliable name data. Non-Latin
> locales (CJK, Devanagari, Cyrillic, Arabic) are supported via transliteration
> tables and a fallback mechanism, so any valid Faker locale can be used in
> `name_locales` overrides without garbled output.

### Creating a Config from Your Data

1. **Analyze your CAD data** to compute:
   - Agency call volumes
   - Priority distribution per agency
   - Problem type frequencies
   - Average times for each interval by priority
   - Hourly call volume pattern
   - Disposition code frequencies
   - Call reception method breakdown

2. **Copy `config/example_realism.yaml`** and replace values with your computed statistics

3. **Validate** by running a small test generation:
   ```bash
   uv run SynthCCD generate --config your_config.yaml --rows 1000 --format pandas
   ```

4. **Iterate** until generated statistics match your real data

### Python API Usage

```python
from synth911gen3 import Synth911Application, RealismConfig
from synth911gen3.addresses import OpenStreetMapAddressProvider
from synth911gen3.config import GenerationRequest, OutputFormat, DatasetKind
from pathlib import Path

# Load custom realism config
realism = RealismConfig.from_yaml(Path("config/my_center.yaml"))

# Or create programmatically
realism = RealismConfig(
    agency_weights={"LAW": 0.65, "FIRE": 0.20, "EMS": 0.15},
    agency_names={"LAW": "POLICE", "FIRE": "FIRE", "EMS": "EMS"},
    # ... other parameters
)

request = GenerationRequest(
    rows=50000,
    area_query="Denver, CO",
    output_format=OutputFormat.PARQUET,
    dataset=DatasetKind.ALL,
    realism_config=realism,
)

app = Synth911Application(address_provider=OpenStreetMapAddressProvider())
result = app.generate(request)
```

### Regression Signature (Realism Baseline)

The generators are deterministic for a given seed, which makes the realism
knobs testable as a frozen *signature*. `synth911gen3.regression` computes a
compact statistical summary of generated data and compares it against the
committed baseline at `tests/regression_baseline.json`:

- `incident_signature(frame)` — agency, priority, reception, and
  disposition fractions; per-agency/per-priority timing means; per-agency
  problem fractions; the 24-hour call-shape; total elapsed mean/median.
- `phone_signature(frame)` — received/outbound volumes per hour,
  abandonment rates, and answer-time percentage means.
- `compare(current, baseline, tolerances)` — returns a list of human-readable
  mismatches (empty means the signature is within tolerance).
- `RegressionTolerances` — absolute bounds for fractions/rates/percentages and
  a relative bound (with absolute floor) for timing means. Defaults sit at
  roughly 4–6 sampling standard errors for the default baseline sizes.

The regression suite (`tests/test_regression.py`) regenerates the reference
datasets from a fixed seed (`4242`) and fails when the output drifts from the
baseline. Tune the realism defaults and the suite will tell you what moved:

```bash
# After an *intentional* realism change, refresh the baseline:
uv run python scripts/update_regression_baseline.py
# Review the printed value diff, then commit baseline + code together.
```

Run the update script only when the drift is deliberate. If the suite fails
and you did not intend to change realism, the drift is a regression — fix it.

```python
from synth911gen3.regression import build_signature, compare, load_baseline

current, phone = build_signature()
baseline = load_baseline(Path("tests/regression_baseline.json"))
issues = compare(current, baseline["incidents"])
```

Baseline metadata records the seed, row counts, date window, package version,
schema version, and the realism-config hash, so a stale baseline (e.g. after a
schema bump) is detected by the suite rather than silently compared.

---

## Realism Features (Default Distributions)

The values below are the **built-in defaults**, which is exactly what you get when no
`--config` file is supplied. Override any of them through the realism configuration.

### Agency Distribution

- **LAW**: 52% of incidents
- **FIRE**: 20% of incidents
- **EMS**: 28% of incidents

### Shift Structure (Default)

The default shift structure is **2x12h-4shift-14day**: shifts A/B on day
(06:00-18:00) and C/D on night (18:00-06:00), rotating on the 14-day pattern
`1,1,2,2,1,1,1,2,2,1,1,2,2,2` (starting Monday), where group 1 = A day + C
night and group 2 = B day + D night. Each shift is staffed with 3 calltakers
and 2 dispatchers. This same structure is used when no `--shift-preset` or
`shift_config` is supplied. See [Shift Structures](#shift-structures) above.

### Priority Weights (by Agency)

| Priority | LAW | FIRE | EMS |
|----------|-----|------|-----|
| 1 (Highest) | 12% | 18% | 16% |
| 2 | 18% | 24% | 26% |
| 3 | 28% | 24% | 28% |
| 4 | 26% | 20% | 18% |
| 5 (Lowest) | 16% | 14% | 12% |

### Problem Natures (Weighted by Agency)

**LAW** (32): Shots Fired, Burglary In Progress, Vehicle Collision w/ Injury, Assault, Reckless Driving, Weapons Violation, DUI / Impaired Driver, Domestic Disturbance, Missing Person, Burglary, Drug/Narcotic Violation, Motor Vehicle Theft, Robbery, Disorderly Conduct, Theft Report, Burglary Alarm, Traffic Crash, Fraud, Harassment, Shoplifting, Vandalism, Trespass, Suspicious Person, Welfare Check, Noise Complaint, Traffic Stop, Animal Complaint, Found Property, Animal Bite, Public Assist, **Assist Fire**, **Assist EMS**

**FIRE** (22): Fire Alarm, Smoke Investigation, Medical Assist, Structure Fire, Vehicle Fire, Cooking Fire, Chimney Fire, Brush/Grass Fire, Gas Leak, CO Investigation, Hazardous Condition, Rescue Call, Mutual Aid, Odor Investigation, Overheat Investigation, Electrical Wiring Problem, Lockout / Public Service, Water Rescue, Vehicle Extrication, Assist Police, Elevator Rescue, **Assist EMS**

**EMS** (25): Chest Pain, Difficulty Breathing, Fall Injury, Motor Vehicle Crash, Sick Person, Unconscious Person, Cardiac Arrest, Seizure, Altered Mental Status, Abdominal Pain, Overdose, Psychiatric Emergency, Stroke, Diabetic Problem, Heart Problems, Allergic Reaction, Hemorrhage / Bleeding, Traumatic Injury, Head Injury, Choking, Heat/Cold Exposure, Pregnancy / Childbirth, Animal Bite, **Assist Police**, **Assist Fire**

> The problem vocabulary is keyed by agency and **priority pool**, so low-acuity
> problems do not appear at urgent priorities (and vice versa).

### Time Profiles (Lognormal Distributions)

Each agency/priority combination has calibrated time profiles (mean seconds):

| Interval | Description | Distribution |
|----------|-------------|--------------|
| Pickup Delay | Ring to answer | Lognormal(3s, σ=0.45) |
| Interview | Caller questioning | Lognormal(12-105s by priority) |
| Dispatch Queue | Queue to dispatch | Lognormal(4-330s by priority) |
| Turnout | Station to wheels rolling | Lognormal(10-84s by priority) |
| Travel | Wheels rolling to on-scene | Lognormal(220-560s by priority) |
| On Scene | On-scene duration | Lognormal(1380-3060s by priority) |
| Closeout | Scene clear to incident close | Lognormal(240-420s by priority) |

### Diurnal Call Patterns

Hourly weights follow real 9-1-1 center patterns:
**Peak**: 12:00-14:00 (5.7-5.8% per hour). **Valley**: 03:00-05:00 (1.9-2.1% per hour).
A weekend multiplier (+12% Fri/Sat) is configurable via `phone_metrics.weekend_multiplier`.

### Hourly Phone Metrics

Hourly call counts are driven by a base volume (`rows / hours`, floored at
`min_hourly_volume`) split by fractions per call type, with abandonment drawn
binomial on the received counts:

| Key | Default | Meaning |
|-----|---------|---------|
| `min_hourly_volume` | 2.0 | Floor on base calls-per-hour |
| `nine_one_one_received_fraction` | 0.48 | Share of base volume received as 9-1-1 |
| `non_emergency_received_fraction` | 0.58 | Share received as non-emergency |
| `outbound_calls_fraction` | 0.26 | Share placed as outbound |
| `nine_one_one_abandonment_rate` | 0.02 | Baseline 9-1-1 abandonment rate |
| `night_abandonment_increment` | 0.03 | Added to 9-1-1 rate during 00:00-05:59 |
| `non_emergency_abandonment_rate` | 0.05 | Non-emergency abandonment rate |
| `max_abandonment_rate` | 0.12 | Cap applied to abandonment draws |
| `weekend_multiplier` | 1.12 | Volume multiplier on Fri/Sat |
| `nine_one_one_answer_time_mu` | 1.80 | Lognormal μ for 9-1-1 answer time (seconds) |
| `nine_one_one_answer_time_sigma` | 0.80 | Lognormal σ for 9-1-1 answer time |
| `non_emergency_answer_time_mu` | 1.70 | Lognormal μ for non-emergency answer time (seconds) |
| `non_emergency_answer_time_sigma` | 0.80 | Lognormal σ for non-emergency answer time |
| `answer_time_thresholds` | [10, 15, 20, 40] | Seconds thresholds for % answered columns |
| `answer_time_load_sensitivity` | 0.25 | How strongly the answer-time lognormal μ shifts with hourly load (busy hours answer slower) |
| `answer_time_mu_noise_sd` | 0.05 | Std-dev of per-hour random noise applied to lognormal μ, so answer-time percentages vary hour-to-hour |
| `nine_one_one_phone_duration_mu` | 5.10 | Lognormal μ for 9-1-1 phone duration (mean ≈ 210 s) |
| `nine_one_one_phone_duration_sigma` | 0.70 | Lognormal σ for 9-1-1 phone duration |
| `non_emergency_phone_duration_mu` | 4.54 | Lognormal μ for non-emergency phone duration (mean ≈ 120 s) |
| `non_emergency_phone_duration_sigma` | 0.70 | Lognormal σ for non-emergency phone duration |
| `outbound_phone_duration_mu` | 3.85 | Lognormal μ for outbound phone duration (mean ≈ 60 s) |
| `outbound_phone_duration_sigma` | 0.70 | Lognormal σ for outbound phone duration |

### Population-Based Volume Scaling

When the `--population` flag (or `population` params-file key) is set, phone-metrics
volume is derived from the service area population instead of the incident row count.
The formula is:

```
total_annual_calls = (population / 1000) × CALLS_PER_1000_POPULATION_YEARLY
base_hourly_volume = total_annual_calls / hours_in_year × hours_in_date_range
```

The default `CALLS_PER_1000_POPULATION_YEARLY` is 2,500 (NFPA/NAEM data for US
PSAPs). This constant is defined in `constants.py` and can be overridden by editing
the source.

When `population` is not set (the default), the legacy behaviour is preserved:
`base_hourly_volume = rows / total_hours`.

### Non-Eergency Floor

To guarantee that non-emergency calls always exceed emergency calls — the
real-world norm for every PSAP — a floor constraint is applied after the
independent Poisson draws:

```
non_emergency_received ≥ ceil(total_emergency_received × NON_EMERGENCY_FLOOR_RATIO)
```

The default `NON_EMERGENCY_FLOOR_RATIO` is 1.2 (non-emergency must be at least
20% higher than emergency). This constant is defined in `constants.py`.

### Answer Time Percentages

For each hour the generator simulates the call-answering process at the level of
individual calls so the service-level percentages stay consistent with the
hour's call counts. The calls actually answered that hour (received minus
abandoned) are allocated against the answer-time thresholds with a
sequential-binomial draw from the lognormal answer-time distribution, and each
`answered_Ns_pct` column is the rounded percentage `100 × count_answered_within_Ns
/ received`. This means the percentages step with the hour's received volume
(e.g. 5 received calls can only produce 0/20/40/…/100%), can never report more
answered calls than were received and not abandoned, and reach exactly 100% on
fast, low-abandonment hours.

The lognormal `mu` is first adjusted by the hour's load (`busy_factor`) via
`answer_time_load_sensitivity`, then given per-hour random noise scaled by
`answer_time_mu_noise_sd`. The noise keeps percentages from being identical
every hour while the load term keeps busy hours slower. Defaults produce
approximately these average answer rates:

| Threshold | Default 9-1-1 % | Default Non-Emergency % |
|-----------|-----------------|-------------------------|
| 10 s | ~70% | ~74% |
| 15 s | ~85% | ~85% |
| 20 s | ~91% | ~90% |
| 40 s | ~96% | ~94% |

These defaults target ≥85% of 9-1-1 calls answered within 15 seconds and ≥74%
of non-emergency calls answered within 10 seconds. National standards
recommend ≥90% of 9-1-1 calls answered within 15 seconds and ≥95% within
20 seconds; the 9-1-1 default is slightly below the 15-second standard but
exceeds it at 20 seconds. Adjust `nine_one_one_answer_time_mu`/`sigma` to
match your center's performance. Non-emergency standards are in development;
the defaults model a faster answer profile than previous versions.

### Mean Phone Duration

Each `*_mean_duration` column is the per-hour sample mean of the lognormal
phone durations drawn per answered call — one draw per call from
`N(<mu>, <sigma>)` for the category — so the values are consistent with the
hour's call counts: an hour with no answered calls in a category reports `0.0`.
The 9-1-1 duration uses each emergency number's own line overrides
(`phone_duration_mu`/`phone_duration_sigma` under `phone_metric_lines`), the
non-emergency column uses `non_emergency_phone_duration_mu`/`sigma`, and the
outbound column uses `outbound_phone_duration_mu`/`sigma`. `call_mean_duration`
is the volume-weighted average of the three category means, weighted by the
answered call counts (received minus abandoned for 9-1-1 and non-emergency;
`outbound_calls_placed` for outbound).

Default population means are `e^(mu + sigma^2 / 2)`: ≈210 s for 9-1-1, ≈120 s
for non-emergency, and ≈60 s for outbound calls. Adjust the `*_mu`/`*_sigma`
keys to match your center's average handle times.

### Call Reception Methods

| Method | Weight |
|--------|--------|
| E-911 | 33% |
| Phone | 38% |
| OFFICER | 14% |
| Radio | 6% |
| C2C | 5% |
| NOT CAPTURED | 2% |
| Text | 1% |
| CAD2CAD | 1% |

### Disposition Codes (by Agency)

| Disposition | LAW | FIRE | EMS |
|-------------|-----|------|-----|
| NR-No Report | 40% | 45% | 45% |
| UNDEFINED | 28% | 29% | 38% |
| RE-Report | 15% |    |   |
| CI-Citation | 10% |   |   |
| FALSE-False Alarm |   | 15% | 10% |
| RAF-Reassign FD Call |   | 5% |   |
| CN-Cancellation | 4% | 5% | 5% |
| SUP-Supplement | 1% | 1% | 2% |
| ACOR-Animal Control | 2% |   |   |

### Seasonal Multipliers

Problem type likelihood varies by season (Winter/Spring/Summer/Fall) through configurable multipliers applied per-incident based on call month. Default multipliers:

| Problem Type | Winter | Spring | Summer | Fall |
|--------------|--------|--------|--------|------|
| **EMS** | | | | |
| Heat/Cold Exposure | 1.5 | 0.8 | 2.0 | 0.8 |
| Hypothermia | 3.0 | 0.5 | 0.1 | 1.0 |
| Heat Exhaustion | 0.1 | 0.5 | 3.0 | 0.5 |
| Sick Person | 1.2 | 1.0 | 0.9 | 1.1 |
| Fall Injury | 1.3 | 0.9 | 0.8 | 1.1 |
| Motor Vehicle Crash | 1.2 | 1.0 | 1.1 | 1.1 |
| Cardiac Arrest | 1.1 | 1.0 | 0.9 | 1.0 |
| **FIRE** | | | | |
| Structure Fire | 1.3 | 0.9 | 0.8 | 1.1 |
| Brush/Grass Fire | 0.3 | 1.2 | 2.0 | 1.5 |
| Cooking Fire | 1.2 | 1.0 | 0.9 | 1.3 |
| Chimney Fire | 2.5 | 0.5 | 0.1 | 1.5 |
| Vehicle Fire | 1.1 | 1.0 | 1.1 | 1.0 |
| Mutual Aid | 1.1 | 1.0 | 1.2 | 1.1 |
| **LAW** | | | | |
| DUI / Impaired Driver | 1.3 | 1.0 | 1.2 | 1.1 |
| Domestic Disturbance | 1.1 | 1.0 | 1.0 | 1.1 |
| Burglary | 1.1 | 0.9 | 1.0 | 1.1 |
| Motor Vehicle Theft | 1.1 | 1.0 | 1.1 | 1.0 |
| Reckless Driving | 1.2 | 1.0 | 1.1 | 1.1 |
| Disorderly Conduct | 1.0 | 1.1 | 1.2 | 1.0 |
| Noise Complaint | 0.8 | 1.0 | 1.3 | 1.1 |
| Suspicious Person | 1.0 | 1.0 | 1.1 | 1.0 |
| Shots Fired | 1.1 | 1.0 | 1.2 | 1.1 |
| Shoplifting | 1.3 | 0.9 | 0.9 | 1.2 |
| Vandalism | 0.9 | 1.1 | 1.2 | 1.1 |
| Trespass | 0.9 | 1.0 | 1.1 | 1.2 |
| Animal Complaint | 0.8 | 1.2 | 1.3 | 1.1 |
| Animal Bite | 0.8 | 1.2 | 1.3 | 1.0 |
| Welfare Check | 1.2 | 1.0 | 0.9 | 1.1 |
| Missing Person | 1.1 | 1.0 | 1.1 | 1.0 |

> Multipliers > 1.0 increase likelihood in that season; < 1.0 decrease it. The generator applies multipliers per-incident based on the call's month, then re-normalizes weights within each agency/priority pool. Override via the `seasonal_multipliers` section in the realism YAML (mapping problem name → list of 4 multipliers). Unlisted problem types default to `[1.0, 1.0, 1.0, 1.0]`.

---

## Geospatial Exports

Incident data can be exported with geographic coordinates (latitude/longitude) derived from OpenStreetMap address data for use in GIS and mapping applications.

### Coordinate Sources

- **Real OSM addresses**: When Overpass returns elements with `addr:housenumber` + `addr:street`, their native lat/lon coordinates are captured (nodes have direct lat/lon; ways use their center point).
- **Synthesized addresses**: When OSM lacks house numbers, the generator falls back to named streets with synthesized house numbers. These receive `0.0, 0.0` coordinates and are excluded from geospatial exports.

### Output Formats

| Format | Extension | Geometry | CRS | Notes |
|--------|-----------|----------|-----|-------|
| `geojson` | `.geojson` | Point | EPSG:4326 (WGS84) | Full attribute fidelity; RFC 7946 compliant |
| `shapefile` | `.shp` + sidecars | Point | EPSG:4326 (WGS84) | Field names truncated to 10 chars; requires `geopandas` + `shapely` |

### Usage

```bash
# GeoJSON (no extra dependencies)
uv run SynthCCD generate --format geojson --rows 50000 --area "Portland, OR"

# Shapefile (uses geopandas + shapely, included in the base dependencies)
uv run SynthCCD generate --format shapefile --rows 50000 --area "Portland, OR"
```

### Schema

Each exported feature contains:

- **Geometry**: Point `[longitude, latitude]` in WGS84
- **Properties**: All incident columns except `latitude`/`longitude` (moved to geometry)

The hourly phone metrics dataset has no spatial component and is exported as JSON alongside the geospatial incidents file.

---

## Realism Tuning Guide

This section provides a systematic approach to calibrating SynthCCD to match your specific 9-1-1 center's operational characteristics.

### Tuning Workflow

```
┌─────────────────┐
│ 1. Export real  │
│    CAD data     │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 2. Compute      │
│    statistics   │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 3. Create       │
│    config YAML  │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 4. Generate     │
│    test data    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 5. Compare &    │
│    iterate      │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 6. Save final   │
│    config       │
└─────────────────┘
```

### Step 1: Export Real CAD Data

Export at least 6 months of incident data (1+ year preferred for seasonal patterns) with these fields:

| Field | Purpose |
|-------|---------|
| `incident_id` | Row count verification |
| `agency` | Agency distribution |
| `priority` | Priority distribution per agency |
| `problem_nature` | Problem type frequencies |
| `call_received_ts` | Diurnal/seasonal patterns |
| `call_answered_ts` | Pickup delay |
| `queue_ts` | Interview duration |
| `dispatch_ts` | Dispatch queue time |
| `enroute_ts` | Turnout time |
| `arrived_ts` | Travel time |
| `cleared_ts` | On-scene duration |
| `closed_ts` | Closeout time |
| `disposition` | Disposition frequencies |
| `call_reception` | Reception method breakdown |
| `call_taker` | Personnel workload (optional) |
| `dispatcher` | Personnel workload (optional) |

### Step 2: Compute Statistics

#### Agency Distribution
```sql
SELECT agency, COUNT(*) * 1.0 / SUM(COUNT(*)) OVER() AS weight
FROM incidents
GROUP BY agency;
```
Target: `agency_weights` dict (sum = 1.0)

#### Priority Distribution per Agency
```sql
SELECT agency, priority, COUNT(*) * 1.0 / SUM(COUNT(*)) OVER(PARTITION BY agency) AS weight
FROM incidents
GROUP BY agency, priority
ORDER BY agency, priority;
```
Target: `priority_weights[agency][priority]` (each agency sum = 1.0)

#### Problem Type Frequencies per Agency/Priority
```sql
SELECT agency, priority, problem_nature, COUNT(*) * 1.0 / SUM(COUNT(*)) OVER(PARTITION BY agency, priority) AS weight
FROM incidents
GROUP BY agency, priority, problem_nature
ORDER BY agency, priority, weight DESC;
```
Target: `problem_profiles[agency][priority]` = list of [name, weight] (each priority pool sum = 1.0)

#### Time Intervals (Mean Seconds) per Agency/Priority
```sql
SELECT agency, priority,
  AVG(EXTRACT(EPOCH FROM call_answered_ts - call_received_ts)) AS pickup_delay,
  AVG(EXTRACT(EPOCH FROM queue_ts - call_answered_ts)) AS interview,
  AVG(EXTRACT(EPOCH FROM dispatch_ts - queue_ts)) AS dispatch_queue,
  AVG(EXTRACT(EPOCH FROM enroute_ts - dispatch_ts)) AS turnout,
  AVG(EXTRACT(EPOCH FROM arrived_ts - enroute_ts)) AS travel,
  AVG(EXTRACT(EPOCH FROM cleared_ts - arrived_ts)) AS on_scene,
  AVG(EXTRACT(EPOCH FROM closed_ts - cleared_ts)) AS closeout
FROM incidents
GROUP BY agency, priority;
```
Target: `time_profiles[agency][priority]` with 7 interval means

#### Dispatch Init Fraction
```sql
-- Fraction of call duration when first unit dispatched
SELECT priority,
  MIN(EXTRACT(EPOCH FROM dispatch_ts - call_answered_ts) / 
      NULLIF(EXTRACT(EPOCH FROM closed_ts - call_answered_ts), 0)) AS lo,
  MAX(EXTRACT(EPOCH FROM dispatch_ts - call_answered_ts) / 
      NULLIF(EXTRACT(EPOCH FROM closed_ts - call_answered_ts), 0)) AS hi
FROM incidents
WHERE closed_ts > call_answered_ts
GROUP BY priority;
```
Target: `dispatch_init_fraction[priority] = [lo, hi]`

#### Hourly Weights
```sql
SELECT EXTRACT(HOUR FROM call_received_ts) AS hour, COUNT(*)
FROM incidents
GROUP BY hour
ORDER BY hour;
```
Normalize to sum = 1.0 → `hourly_weights`

#### Seasonal Multipliers
```sql
SELECT 
  problem_nature,
  CASE WHEN EXTRACT(MONTH FROM call_received_ts) IN (12,1,2) THEN 'Winter'
       WHEN EXTRACT(MONTH FROM call_received_ts) IN (3,4,5) THEN 'Spring'
       WHEN EXTRACT(MONTH FROM call_received_ts) IN (6,7,8) THEN 'Summer'
       ELSE 'Fall' END AS season,
  COUNT(*) * 1.0 / SUM(COUNT(*)) OVER(PARTITION BY problem_nature) AS season_weight
FROM incidents
GROUP BY problem_nature, season;
```
Compute multiplier = season_weight / (1/4) → `seasonal_multipliers[problem] = [winter, spring, summer, fall]`

#### Disposition Frequencies per Agency
```sql
SELECT agency, disposition, COUNT(*) * 1.0 / SUM(COUNT(*)) OVER(PARTITION BY agency) AS weight
FROM incidents
GROUP BY agency, disposition;
```
Target: `disposition_profiles[agency]` (sum = 1.0)

#### Call Reception Methods
```sql
SELECT call_reception, COUNT(*) * 1.0 / COUNT(*) OVER() AS weight
FROM incidents
GROUP BY call_reception;
```
Target: `call_reception_weights` (sum = 1.0)

### Step 3: Create Config YAML

Copy `config/example_realism.yaml` and replace with your computed values. Key tips:

1. **Start with agency_weights** — this drives the overall mix
2. **Then priority_weights** — shapes urgency profile
3. **Then problem_profiles** — most visible in output
4. **Then time_profiles** — affects response time realism
5. **Then hourly_weights & seasonal_multipliers** — temporal patterns
6. **Finally disposition, call_reception, dispatch_init_fraction** — secondary realism

### Step 4: Generate Test Data

```bash
# Small test for quick iteration
uv run SynthCCD generate \
  --config config/my_center.yaml \
  --rows 2000 \
  --format pandas \
  --dataset incidents
```

### Step 5: Compare & Iterate

Compare key statistics between real and synthetic data:

| Metric | Target Tolerance |
|--------|------------------|
| Agency weights | ±2% |
| Priority weights (per agency) | ±3% |
| Top 10 problem types (per agency) | ±5% |
| Mean time intervals (per agency/priority) | ±20% |
| Hourly pattern correlation | r > 0.9 |
| Seasonal pattern (major types) | Qualitative match |
| Disposition distribution | ±5% |

Use Python for automated comparison:
```python
import pandas as pd
from scipy.stats import ks_2samp

real = pd.read_parquet("real_data.parquet")
synth = pd.read_parquet("synth_data.parquet")

# Agency distribution
print("Agency:", real['agency'].value_counts(normalize=True))
print("Agency:", synth['agency'].value_counts(normalize=True))

# KS test on time intervals
for col in ['interview_seconds', 'travel_seconds', 'on_scene_seconds']:
    stat, p = ks_2samp(real[col], synth[col])
    print(f"{col}: KS={stat:.3f}, p={p:.3f}")
```

### Step 6: Save Final Config

Once satisfied, commit your config:
```bash
git add config/my_center.yaml
git commit -m "Add realism config for My Center"
```

---

## Common Tuning Scenarios

### Rural Center (Low Volume, Long Travel)
```yaml
agency_weights:
  LAW: 0.65
  FIRE: 0.15
  EMS: 0.20

time_profiles:
  LAW:
    3:  # Typical priority
      travel_mean: 600    # 10 min average travel
      turnout_mean: 120   # 2 min turnout (volunteer)
```

### Urban Center (High Volume, Short Travel)
```yaml
agency_weights:
  LAW: 0.55
  FIRE: 0.20
  EMS: 0.25

time_profiles:
  EMS:
    2:
      travel_mean: 180    # 3 min average travel
      turnout_mean: 30    # 30 sec turnout (career)
```

### College Town (Seasonal Population)
```yaml
seasonal_multipliers:
  "Noise Complaint": [0.8, 1.0, 1.5, 1.2]  # Summer peak
  "Alcohol Violation": [0.7, 1.2, 1.4, 1.1]
  "Medical Assist": [1.1, 1.0, 0.9, 1.0]
```

### Tourist Destination (Summer Peak)
```yaml
hourly_weights:  # Higher daytime weights in summer
  # ... adjust seasonally via separate configs per quarter
  
seasonal_multipliers:
  "Water Rescue": [0.1, 0.5, 3.0, 0.3]
  "Heat Exhaustion": [0.1, 0.5, 3.0, 0.5]
```

---

## Parameter Sensitivity Guide

| Parameter | Impact | Sensitivity | Recommendation |
|-----------|--------|-------------|----------------|
| `agency_weights` | Overall call mix | High | Tune first, use real volume ratios |
| `priority_weights` | Urgency profile | High | Critical for response time realism |
| `problem_profiles` | Call type mix | High | Most visible in output |
| `time_profiles.travel_mean` | Response time | High | Calibrate from CAD timestamps |
| `time_profiles.turnout_mean` | Dispatch efficiency | Medium | Varies by career/volunteer mix |
| `dispatch_init_fraction` | Parallel dispatch | Medium | Key for high-priority realism |
| `hourly_weights` | Temporal pattern | High | 24 values, auto-normalized |
| `seasonal_multipliers` | Seasonal variation | Medium | 4 values per problem type |
| `name_locales` | Personnel roster diversity | Low | Per-country locale blends |
| `disposition_profiles` | Outcome realism | Low | Fine-tune last |
| `call_reception_weights` | Source realism | Low | Often similar across centers |

The `psap_agency` field (on `GenerationRequest`, not the realism config) is a top-level
filter that restricts which agencies appear in the output. It is applied before generation
so all downstream tables adapt automatically.

---

## Validation Checklist

Before deploying a custom config:

- [ ] All weight sections sum to 1.0 (within 0.001)
- [ ] All 5 priorities defined for each agency in `priority_weights`
- [ ] All 5 priorities have `time_profiles` for each agency
- [ ] All 5 priorities have `dispatch_init_fraction` entries
- [ ] `hourly_weights` has exactly 24 values
- [ ] `seasonal_multipliers` entries have exactly 4 values
- [ ] `name_locales` uses valid Faker locales with positive weights and uppercase ISO country keys
- [ ] `shift_config` validates (unique names, 24hr coverage)
- [ ] Test generation completes without errors
- [ ] Output statistics match real data within tolerances
- [ ] Config committed to version control

---
