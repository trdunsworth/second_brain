# GENAGENT.md — AI Assistant Guide for SynthCCD

This file provides everything an AI assistant needs to help a user generate synthetic 911 dispatch and phone-center data using SynthCCD. Share this file with your AI assistant or use it as context when asking for help.

---

## What SynthCCD Does

SynthCCD generates realistic synthetic data that emulates:
1. **CAD (Computer-Aided Dispatch) incident records** — call lifecycle timestamps, addresses, personnel, priorities, problem types
2. **Hourly phone-center metrics** — 911 calls received/abandoned, non-emergency calls, outbound calls, answer times

The output is statistically realistic and configurable for any US/Canadian location (or international areas with OSM coverage).

---

## Quick Start (AI Assistant Workflow)

### Step 1: Verify Environment

```bash
# Check if uv is installed
uv --version

# Navigate to the project
cd /path/to/synth911gen3

# Install dependencies
uv sync
```

### Step 2: Generate Default Dataset

```bash
# Generate 10,000 incidents for Kansas City, MO (default)
uv run SynthCCD generate

# Output will be in: output/incidents.csv
```

### Step 3: Generate Custom Dataset

```bash
# Generate 50,000 incidents for Alexandria, VA in Parquet format
uv run SynthCCD generate \
  --rows 50000 \
  --area "Alexandria, VA" \
  --format parquet \
  --seed 2025 \
  --start-date 2025-01-01 \
  --end-date 2025-03-31

# Output: output/incidents.parquet
```

---

## Python API

For programmatic access (e.g., inside a Jupyter notebook or script):

```python
from synth911gen3.app import Synth911Application
from synth911gen3.config import GenerationRequest, DatasetKind, OutputFormat, IdFormat

# Create a request
request = GenerationRequest(
    rows=10000,
    area_query="Kansas City, MO",
    output_format=OutputFormat.CSV,
    dataset=DatasetKind.INCIDENTS,
    id_format=IdFormat.INTEGER,
    seed=911,
    start_date=date(2025, 1, 1),
    end_date=date(2025, 12, 31),
    calltaker_pool_size=12,
    dispatcher_pool_size=10,
)

# Generate
app = Synth911Application()
result = app.generate(request)

# Access the DataFrame
df = result.incidents
print(df.head())
print(f"Generated {len(df)} rows with {len(df.columns)} columns")

# Exported files are in result.exported_artifacts
for description, path in result.exported_artifacts.items():
    print(f"{description}: {path}")
```

---

## Configuration Reference

### GenerationRequest Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `rows` | int \| None | None | Number of incident rows (10,000 if neither rows nor population set) |
| `area_query` | str | "Kansas City, MO" | Geographic area for addresses (place name or bounding box) |
| `output_format` | OutputFormat | CSV | csv, parquet, json, yaml, pandas, polars, geojson, shapefile, sqlite, duckdb, postgresql, sqlserver, mariadb |
| `dataset` | DatasetKind | INCIDENTS | incidents, phone, or all |
| `id_format` | IdFormat | INTEGER | integer or guid |
| `output_dir` | Path | output/ | Directory for output files |
| `output_stem` | str | incidents | Base filename for output |
| `start_date` | date | Jan 1 this year | Start of date range |
| `end_date` | date | Dec 31 this year | End of date range |
| `seed` | int | 911 | Random seed for reproducibility |
| `calltaker_pool_size` | int | 12 | Number of calltakers per shift |
| `dispatcher_pool_size` | int | 10 | Number of dispatchers per shift |
| `shift_preset` | str \| None | None | 2x12h-4shift-14day, 2x12h-2shift, 3x8h-3shift, 4x10h-4shift |
| `realism_config_path` | Path \| None | None | Path to YAML realism config |
| `population` | int \| None | None | Service area population (derives row count if rows is None) |
| `psap_agency` | str | all | all, law, fire, ems, fire_ems |
| `country` | str | US | ISO country code for emergency numbers |
| `include_event_counts` | bool | False | Add events_created column to phone metrics |

### Output Formats

| Format | Extension | Use Case |
|--------|-----------|----------|
| CSV | .csv | Default, easy to open in Excel |
| Parquet | .parquet | Large datasets, columnar storage |
| JSON | .json | API integration, nested data |
| YAML | .yaml | Configuration files |
| Pandas | (in-memory) | Python analysis |
| Polars | (in-memory) | Fast Python analysis |
| GeoJSON | .geojson | GIS mapping |
| Shapefile | .shp | Legacy GIS systems |
| SQLite | .sqlite3 | Lightweight database |
| DuckDB | .duckdb | Analytics database |

---

## Common Use Cases

### Use Case 1: Training Data for Machine Learning

```bash
# Generate 100,000 rows for ML training
uv run SynthCCD generate \
  --rows 100000 \
  --area "New York, NY" \
  --format parquet \
  --dataset all \
  --seed 42
```

### Use Case 2: Small Department (Police Only)

```bash
# Generate 5,000 police incidents
uv run SynthCCD generate \
  --rows 5000 \
  --area "Springfield, IL" \
  --psap-agency law \
  --format csv
```

### Use Case 3: Year-Long Analysis

```bash
# Generate a full year of data
uv run SynthCCD generate \
  --rows 50000 \
  --area "Denver, CO" \
  --start-date 2025-01-01 \
  --end-date 2025-12-31 \
  --format parquet \
  --dataset all
```

### Use Case 4: Population-Based Generation

```bash
# Auto-calculate rows from population (500,000 residents)
uv run SynthCCD generate \
  --population 500000 \
  --area "Portland, OR" \
  --format parquet
```

### Use Case 5: Database Export

```bash
# Export directly to SQLite
uv run SynthCCD generate \
  --rows 25000 \
  --area "Austin, TX" \
  --format sqlite \
  --db-name "austin_911.db"
```

### Use Case 6: Using a Params File

```bash
# Use a pre-configured params file
uv run SynthCCD generate --params config/samples/midsize_centre.yaml

# Save current settings to a params file
uv run SynthCCD generate \
  --rows 10000 \
  --area "Seattle, WA" \
  --save-params my_run.yaml
```

---

## Output Schema

### Incident Columns

| Column | Type | Description |
|--------|------|-------------|
| id_number | int/str | Incident ID (integer or GUID) |
| internal_reference_number | str | Agency-specific reference |
| agency | str | LAW, FIRE, or EMS |
| shift | str | Shift name |
| shift_label | str | Shift display label |
| problem_nature | str | Type of incident |
| priority | int | 1-5 priority level |
| prefix_directional | str | N, S, E, W, etc. |
| street_number | str | House number |
| street_name | str | Street name |
| street_type | str | St, Ave, Blvd, etc. |
| postfix_directional | str | N, S, E, W, etc. |
| street_address | str | Full street address |
| city | str | City name |
| state | str | State name |
| postal_code | str | ZIP code |
| latitude | float | GPS latitude |
| longitude | float | GPS longitude |
| zone | str | URBAN, SUBURBAN, or RURAL |
| location | str | Full location string |
| call_start_time | datetime | When the call started |
| incident_start_time | datetime | When the CAD record opened |
| time_phone_pickup | datetime | Phone answered |
| time_call_enters_queue | datetime | Call queued |
| time_first_unit_assigned | datetime | First unit dispatched |
| time_unit_enroute | datetime | Unit en route |
| time_unit_arrived | datetime | Unit on scene |
| time_last_unit_cleared | datetime | Last unit cleared |
| time_call_closed | datetime | Call closed |
| calltaker | str | Calltaker name |
| dispatcher | str | Dispatcher name |
| method_of_call_reception | str | E-911, Phone, Radio, etc. |
| call_disposition | str | NR-No Report, RE-Report, etc. |
| *_seconds | int | Elapsed time components |
| total_elapsed_seconds | int | Total call duration |

### Phone Metrics Columns (dataset=all or phone)

| Column | Type | Description |
|--------|------|-------------|
| hour_start | datetime | Hour beginning |
| nine_one_one_calls_received | int | 911 calls received |
| nine_one_one_calls_abandoned | int | 911 calls abandoned |
| non_emergency_calls_received | int | Non-emergency received |
| non_emergency_calls_abandoned | int | Non-emergency abandoned |
| outbound_calls_placed | int | Outbound calls |
| *_answer_time_* | float | Answer time statistics |
| *_mean_duration | float | Mean call duration |

---

## Realism Configuration

For fine-tuning distributions and behaviors, use a realism YAML config:

```yaml
# Example: custom_time_profiles.yaml
agency_weights:
  LAW: 0.5
  FIRE: 0.3
  EMS: 0.2

priority_weights:
  LAW: {1: 0.1, 2: 0.2, 3: 0.4, 4: 0.2, 5: 0.1}
  FIRE: {1: 0.05, 2: 0.15, 3: 0.3, 4: 0.3, 5: 0.2}
  EMS: {1: 0.1, 2: 0.2, 3: 0.4, 4: 0.2, 5: 0.1}

time_profiles:
  LAW:
    1: {interview_mean: 120, dispatch_mean: 60, turnout_mean: 45, travel_mean: 300, scene_mean: 1800, closeout_mean: 300, phone_mean: 180}
    2: {interview_mean: 150, dispatch_mean: 90, turnout_mean: 60, travel_mean: 420, scene_mean: 2400, closeout_mean: 360, phone_mean: 210}

hourly_weights:
  0: 0.3
  1: 0.25
  2: 0.2
  # ... (24 hours)
```

See `REALISMGUIDE.md` for the full configuration reference.

---

## Troubleshooting

### Common Issues

1. **"Too few usable addresses" error**
   - Try a larger area (e.g., "Kansas City, MO" instead of a specific ZIP)
   - Check internet connection for OSM access

2. **TLS certificate errors (behind proxy)**
   ```bash
   export SYNTHCCD_SYSTEM_TRUST=1
   uv run SynthCCD generate ...
   ```

3. **Slow generation for large datasets**
   - Use Parquet format for better performance
   - Use `--max-memory-bytes` for chunked export

4. **Output format not switching to Parquet**
   - Auto-switch only happens from CSV when rows > 100,000
   - Use `--format parquet` explicitly for smaller Parquet outputs

### Debug Mode

```bash
# Enable verbose logging
uv run SynthCCD -v generate --rows 1000

# Or set environment variable
SYNTHCCD_LOG_LEVEL=DEBUG uv run SynthCCD generate
```

---

## AI Assistant Tips

When helping a user:

1. **Start simple** — Use defaults first, then customize
2. **Ask about location** — The area_query is the most important parameter
3. **Ask about row count** — 10,000 is default, but ML needs more
4. **Ask about format** — CSV for Excel users, Parquet for data engineers
5. **Ask about reproducibility** — Seed ensures identical output
6. **Verify output** — Suggest `--dry-run` or `--schema` to preview

### Example Conversation

**User:** "I need synthetic 911 data for a research paper about response times in Chicago."

**Assistant:** "I'll help you generate synthetic 911 data for Chicago. A few questions:
1. How many incidents do you need? (10,000 is default, more for statistical power)
2. What date range? (Full year? Specific month?)
3. What format? (CSV for Excel, Parquet for R/Python)
4. Do you need phone metrics too, or just incidents?"

**User:** "50,000 incidents for 2025, CSV format, incidents only."

**Assistant:** "Here's the command:
```bash
uv run SynthCCD generate \
  --rows 50000 \
  --area "Chicago, IL" \
  --format csv \
  --start-date 2025-01-01 \
  --end-date 2025-12-31 \
  --seed 911
```
This will generate `output/incidents.csv` with 50,000 realistic 911 incidents for Chicago."

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| SYNTHCCD_LOG_LEVEL | Logging level (DEBUG, INFO, WARNING, ERROR) |
| SYNTHCCD_SYSTEM_TRUST | Set to 1 to use OS trust store (behind proxy) |

---

## Sample Params Files

See `config/samples/` for example configurations:
- `small_centre.json` — Small department setup
- `midsize_centre.yaml` — Mid-size center with discipline consoles
- `large_centre.toml` — Large metropolitan setup
- `realism_disciplines.yaml` — Dispatcher discipline configuration

---

## Further Documentation

- `USERSGUIDE.md` — Complete user guide with CLI reference
- `REALISMGUIDE.md` — Realism configuration reference
- `CHANGELOG.md` — Version history
- `CONTRIBUTING.md` — Development setup and contribution guide
