# SynthCCD User Guide

A synthetic data generator for 9-1-1 CAD incidents and hourly phone-center metrics.

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Tutorials](#tutorials)
   - [Tutorial 1: Your First 911 Dataset](#tutorial-1-your-first-911-dataset)
   - [Tutorial 2: Tuning Realism to Your Center](#tutorial-2-tuning-realism-to-your-center)
   - [Tutorial 3: Large-Scale Cloud Runs](#tutorial-3-large-scale-cloud-runs)
   - [Tutorial 4: Geospatial Analysis with GeoJSON](#tutorial-4-geospatial-analysis-with-geojson)
   - [Tutorial 5: Database Pipeline with PostgreSQL](#tutorial-5-database-pipeline-with-postgresql)
4. [Command-Line Interface (CLI)](#command-line-interface-cli)
5. [Textual User Interface (TUI)](#textual-user-interface-tui)
6. [Configuration Parameters](#configuration-parameters)
7. [Params Files (Bundled Options)](#params-files-bundled-options)
8. [Output Formats](#output-formats)
9. [Generated Data Schema](#generated-data-schema)
10. [Python API Reference](#python-api-reference)
11. [Examples](#examples)
12. [Troubleshooting](#troubleshooting)
13. [FAQ](#faq)
14. [Advanced Configuration](#advanced-configuration)

Statistical realism details — the default distributions and the YAML realism
configuration — are documented in the companion [Realism Guide](REALISMGUIDE.md).

---

## Installation

```bash
# Clone the repository
git clone https://github.com/trdunsworth/synth911gen3.git
cd synth911gen3

# Create virtual environment and install dependencies
uv venv
uv sync

# Activate environment (Linux/macOS)
source .venv/bin/activate

# Activate environment (Windows PowerShell)
.venv\Scripts\activate
```

---

## Quick Start

Generate the default dataset (10,000 incident rows) as a CSV file in `output/`.
Pass `--dataset all` to also generate hourly phone counts, or `--dataset phone`
for phone metrics only:

```bash
uv run SynthCCD generate
```

Launch the interactive TUI:

```bash
uv run SynthCCD tui
```

---

## Tutorials

### Tutorial 1: Your First 911 Dataset

This tutorial walks you through generating your first synthetic 911 dataset.

**Step 1: Install and verify**
```bash
git clone https://github.com/trdunsworth/synth911gen3.git
cd synth911gen3
uv venv && uv sync
uv run SynthCCD generate --schema --dataset incidents
```
The `--schema` flag shows the column structure without generating data or fetching addresses.

**Step 2: Generate a small dataset**
```bash
uv run SynthCCD generate --rows 1000 --format parquet --area "Seattle, WA"
```
This generates 1,000 incidents for Seattle, WA in Parquet format. First run will fetch addresses from OpenStreetMap (cached for future runs).

**Step 3: Inspect the output**
```bash
ls output/
# synthetic_911_incidents.parquet  synthetic_911_manifest.json
```

**Step 4: Load in Python**
```python
import pandas as pd
df = pd.read_parquet("output/synthetic_911_incidents.parquet")
print(df.columns.tolist())
print(df.head())
```

**Step 5: Explore the data**
```python
# Agency distribution
print(df['agency'].value_counts())

# Priority distribution
print(df['priority'].value_counts().sort_index())

# Top problem types
print(df['problem_nature'].value_counts().head(10))

# Time range
print(f"Time range: {df['call_start_time'].min()} to {df['call_start_time'].max()}")
```

---

### Tutorial 1b: Building Your First 9-1-1 Call Volume Dataset

This tutorial focuses on generating the **hourly phone metrics dataset** — aggregated call counts by hour (911 received/abandoned, non-emergency received/abandoned, outbound calls, answer-time percentages).

**Key concept**: The phone metrics generator produces **one row per hour** based on the **date range** (`--start-date` to `--end-date`). The `--rows` parameter controls the *base hourly call volume*, not the number of output rows.

**Step 1: Generate one week of hourly data (168 rows = 7 days × 24 hours)**
```bash
uv run SynthCCD generate \
  --dataset phone \
  --start-date 2026-08-04 \
  --end-date 2026-08-10 \
  --format parquet \
  --area "Seattle, WA"
```
This generates exactly 168 rows (7 days × 24 hours = 168 hours) of call center metrics.

**Step 2: Inspect the output**
```bash
ls output/
# synthetic_911_hourly_call_counts.parquet  synthetic_911_manifest.json
```

**Step 3: Load and explore in Python**
```python
import pandas as pd

df = pd.read_parquet("output/synthetic_911_hourly_call_counts.parquet")
print(f"Rows: {len(df)}")  # Should be 168
print(df.columns.tolist())
print(df.head())
```

**Step 3b: Generate a full year (8,760 rows = 365 days × 24 hours)**
```bash
uv run SynthCCD generate \
  --dataset phone \
  --start-date 2026-01-01 \
  --end-date 2026-12-31 \
  --format parquet \
  --area "Seattle, WA"
```

**Step 4: Analyze call volume patterns**
```python
import pandas as pd

df = pd.read_parquet("output/synthetic_911_hourly_call_counts.parquet")
print(f"Rows: {len(df)}")
print(df.columns.tolist())
print(df.head())

# Daily call volume totals
daily = df.resample('D', on='hour_start').sum(numeric_only=True)
print(daily[['nine_one_one_calls_received', 'non_emergency_calls_received']].head())

# Average hourly profile (across all days)
hourly_avg = df.groupby('hour_of_day').mean(numeric_only=True)
print(hourly_avg[['nine_one_one_calls_received', 'non_emergency_calls_received']])

# 911 answer-time compliance
print(f"911 answered within 15s: {df['nine_one_one_answered_15s_pct'].mean():.1f}%")
print(f"Non-emergency answered within 10s: {df['non_emergency_answered_10s_pct'].mean():.1f}%")

# Abandonment rates
print(f"911 abandonment rate: {df['nine_one_one_calls_abandoned'].sum() / df['nine_one_one_calls_received'].sum() * 100:.2f}%")
print(f"Non-emergency abandonment rate: {df['non_emergency_calls_abandoned'].sum() / df['non_emergency_calls_received'].sum() * 100:.2f}%")
```

**Step 5: Visualize daily volume**
```python
import matplotlib.pyplot as plt

daily = df.resample('D', on='hour_start').sum(numeric_only=True)
fig, axes = plt.subplots(2, 2, figsize=(12, 8))

axes[0,0].plot(daily.index, daily['nine_one_one_calls_received'], label='911 Received')
axes[0,0].plot(daily.index, daily['nine_one_one_calls_abandoned'], label='911 Abandoned')
axes[0,0].set_title('911 Daily Volume')
axes[0,0].legend()

axes[0,1].plot(daily.index, daily['non_emergency_calls_received'], label='Non-Emerg Received')
axes[0,1].plot(daily.index, daily['non_emergency_calls_abandoned'], label='Non-Emerg Abandoned')
axes[0,1].set_title('Non-Emergency Daily Volume')
axes[0,1].legend()

axes[1,0].plot(daily.index, daily['outbound_calls_placed'])
axes[1,0].set_title('Outbound Calls Placed')

axes[1,1].plot(df.groupby('hour_start')['nine_one_one_answered_15s_pct'].mean())
axes[1,1].set_title('911 Answered within 15s (%)')

plt.tight_layout()
plt.show()
```

**Step 6: Generate with custom realism config (e.g., high-volume call center)**
```bash
# Custom config for call center with higher 911 volume
cat > config/call_center.yaml << 'EOF'
phone_metrics:
  min_hourly_volume: 5.0
  nine_one_one_received_fraction: 0.65
  non_emergency_received_fraction: 0.40
  outbound_calls_fraction: 0.20
  nine_one_one_abandonment_rate: 0.015
  non_emergency_abandonment_rate: 0.04
  max_abandonment_rate: 0.10
  weekend_multiplier: 1.10
  nine_one_one_answer_time_mu: 1.60
  nine_one_one_answer_time_sigma: 0.70
  non_emergency_answer_time_mu: 1.80
  non_emergency_answer_time_sigma: 0.80
  answer_time_thresholds: [10, 15, 20, 40]
  answer_time_load_sensitivity: 0.25
  answer_time_mu_noise_sd: 0.05
EOF

uv run SynthCCD generate \
  --dataset phone \
  --config config/call_center.yaml \
  --start-date 2026-01-01 \
  --end-date 2026-12-31 \
  --format parquet \
  --area "Denver, CO"
```

> **Note**: The `--rows` parameter for phone metrics controls the *base hourly call volume* (calls per hour), not the number of output rows. The number of output rows is determined by the date range (`--start-date` to `--end-date`, one row per hour).

**Step 7: Model non-US emergency numbers**

The registry selects emergency lines by country; see [Emergency Number Registry](#emergency-number-registry). For example, model a UK center (999 + 112):

```bash
uv run SynthCCD generate \
  --dataset phone \
  --country GB \
  --start-date 2026-08-04 \
  --end-date 2026-08-10 \
  --format parquet
```

The output columns now use `emergency_999_*` and `emergency_112_*` prefixes instead of `nine_one_one_*`:

```python
df = pd.read_parquet("output/synthetic_911_hourly_call_counts.parquet")
print(df.columns.tolist())
# ['hour_start', 'hour_of_day', 'emergency_999_calls_received', 'emergency_112_calls_received',
#  'non_emergency_calls_received', 'outbound_calls_placed', 'emergency_999_calls_abandoned', ...]
```

---

### Tutorial 2: Tuning Realism to Your Center

Learn how to customize the realism configuration to match your 9-1-1 center's characteristics.

**Step 1: Copy the example config**
```bash
cp config/example_realism.yaml config/my_center.yaml
```

**Step 2: Analyze your real CAD data**

Export your center's data and compute:
- Agency call volume ratios (LAW/FIRE/EMS)
- Priority distribution per agency
- Top problem types and their frequencies
- Average time intervals by priority
- Hourly call volume pattern
- Disposition code frequencies

**Step 3: Update the config**

Edit `config/my_center.yaml` with your computed values:
```yaml
# Adjust agency weights to match your center
agency_weights:
  LAW: 0.65   # If your center handles more police calls
  FIRE: 0.20
  EMS: 0.15

# Update priority weights per agency
priority_weights:
  LAW:
    1: 0.10   # Higher priority calls
    2: 0.20
    3: 0.30
    4: 0.25
    5: 0.15

# Customize problem types for your jurisdiction
problem_profiles:
  LAW:
    1:
      - ["Active Shooter", 0.15]
      - ["Shots Fired", 0.25]
      # ... your local problem types

# Adjust time intervals to match your center's performance
time_profiles:
  LAW:
    1:
      interview_mean: 15
      dispatch_mean: 5
      turnout_mean: 8
      travel_mean: 180
      scene_mean: 1200
      closeout_mean: 200
      phone_mean: 150
```

**Step 4: Test and iterate**
```bash
# Generate test data
uv run SynthCCD generate --config config/my_center.yaml --rows 5000 --format pandas

# Compare statistics with your real data
# Adjust config and repeat until distributions match
```

**Step 5: Save as params file for repeatability**
```yaml
# params_my_center.yaml
rows: 100000
area: "Your City, ST"
format: parquet
config: "config/my_center.yaml"
seed: 2024
```
```bash
uv run SynthCCD generate --params params_my_center.yaml
```

---

### Tutorial 3: Large-Scale Cloud Runs

Generate millions of rows efficiently using chunked exports and cloud storage.

**Prerequisites**: AWS S3 / GCS / Azure Blob access configured.

**Step 1: Use Parquet with chunked export**
```bash
# 5 million incidents with 1 GiB memory budget
uv run SynthCCD generate \
  --rows 5000000 \
  --format parquet \
  --max-memory-bytes 1073741824 \
  --area "Los Angeles County, CA" \
  --output-dir /mnt/cloud/storage/la_911_2024
```

**Step 2: Stream to cloud storage (example with AWS S3)**
```bash
# Using AWS CLI to sync output
aws s3 sync /mnt/cloud/storage/la_911_2024 s3://my-bucket/synthetic-911/la_2024/
```

**Step 3: Use params file for CI/CD**
```yaml
# ci_large_scale.yaml
rows: 5000000
area: "Los Angeles County, CA"
format: parquet
max_memory_bytes: 1073741824
output_dir: "/mnt/cloud/storage/la_911_2024"
output_stem: "la_911_2024"
seed: 20241219
```
```bash
# In CI pipeline
uv run SynthCCD generate --params ci_large_scale.yaml
```

**Step 4: Verify at scale**
```bash
# Quick row count check
uv run python -c "
import pandas as pd
df = pd.read_parquet('output/la_911_2024_incidents.parquet')
print(f'Rows: {len(df):,}')
print(f'Agencies: {df[\"agency\"].value_counts().to_dict()}')
print(f'Date range: {df[\"call_start_time\"].min()} to {df[\"call_start_time\"].max()}')
"
```

---

### Tutorial 4: Geospatial Analysis with GeoJSON

Visualize synthetic incidents on a map using GeoJSON export.

**Step 1: Generate GeoJSON**
```bash
uv run SynthCCD generate \
  --format geojson \
  --rows 20000 \
  --area "Portland, OR" \
  --output-dir output_portland
```

**Step 2: View in QGIS (Desktop GIS)**
1. Open QGIS
2. Layer → Add Layer → Add Vector Layer
3. Select `output_portland/synthetic_911_incidents.geojson`
4. Style by agency: Layer Properties → Symbology → Categorized → Column: `agency`

**Step 3: Web map with Leaflet**
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
<body>
  <div id="map" style="height: 600px;"></div>
  <script>
    const map = L.map('map').setView([45.5152, -122.6784], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    fetch('synthetic_911_incidents.geojson')
      .then(r => r.json())
      .then(data => {
        L.geoJSON(data, {
          pointToLayer: (feature, latlng) => {
            const color = feature.properties.agency === 'LAW' ? 'blue' :
                          feature.properties.agency === 'FIRE' ? 'red' : 'green';
            return L.circleMarker(latlng, {radius: 4, fillColor: color, color: '#fff', weight: 1, fillOpacity: 0.8});
          },
          onEachFeature: (feature, layer) => {
            layer.bindPopup(`<b>${feature.properties.problem_nature}</b><br>
              Priority: ${feature.properties.priority}<br>
              Time: ${feature.properties.call_start_time}`);
          }
        }).addTo(map);
      });
  </script>
</body>
</html>
```

**Step 4: Spatial analysis in Python**
```python
import geopandas as gpd

gdf = gpd.read_file("output_portland/synthetic_911_incidents.geojson")
print(f"CRS: {gdf.crs}")
print(f"Bounds: {gdf.total_bounds}")

# Incidents per agency in bounding box
print(gdf.groupby('agency').size())

# Kernel density estimation for hotspots
from geopandas.tools import sjoin
# ... spatial analysis
```

---

### Tutorial 5: Database Pipeline with PostgreSQL

Stream synthetic data directly into PostgreSQL for analytics pipelines.

> **Tip**: For a zero-setup version of this tutorial, substitute `--format sqlite`
> and drop the `--db-host`/`--db-user`/`--db-password` flags — the data lands in a
> local `*.sqlite3` file you can query with any SQLite tool (no server needed).

**Step 1: Prepare PostgreSQL**
```sql
-- Create database and user
CREATE DATABASE cad_warehouse;
CREATE USER etl_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE cad_warehouse TO etl_user;
```

**Step 2: Stream data directly**
```bash
uv run SynthCCD generate \
  --format postgresql \
  --rows 100000 \
  --area "Chicago, IL" \
  --db-host localhost \
  --db-name cad_warehouse \
  --db-user etl_user \
  --db-password secure_password \
  --db-table-incidents chicago_incidents \
  --db-batch-size 50000
```

**Step 3: Verify in PostgreSQL**
```sql
-- Check row counts
SELECT count(*) FROM chicago_incidents;
SELECT agency, count(*) FROM chicago_incidents GROUP BY agency;

-- Query with spatial index (if using PostGIS)
-- ALTER TABLE chicago_incidents ADD COLUMN geom geometry(Point, 4326);
-- UPDATE chicago_incidents SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
-- CREATE INDEX idx_chicago_geom ON chicago_incidents USING GIST (geom);
```

**Step 4: Connect to BI tools**
- Tableau / Power BI / Metabase / Superset
- Point to `cad_warehouse.chicago_incidents`
- Build dashboards: calls by hour, agency workload, response times, hotspots

---

## Command-Line Interface (CLI)

### Main Commands

| Command | Description |
|---------|-------------|
| `generate` | Generate synthetic datasets |
| `schema` | Export the output schema (columns and types) as JSON or YAML |
| `validate-config` | Validate one or more realism config YAML files without generating data |
| `tui` | Launch the Textual TUI |
| `serve` | Launch the FastAPI REST API server |

### Generate Command Options

```bash
uv run SynthCCD generate [OPTIONS]
```

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--params` | `-p` | *(none)* | Path to a JSON/YAML/TOML file specifying multiple generation parameters at once |
| `--save-params` | | *(none)* | Write the effective parameters (CLI flags merged over any `--params` file) to a JSON/YAML/TOML file and exit without generating |
| `--rows` | `-r` | `10000` | Number of incident rows to generate (minimum: 1) |
| `--area` | `-a` | `"Kansas City, MO"` | Area query for OpenStreetMap address lookup |
| `--format` | `-f` | `csv` | Output format: `csv`, `parquet`, `json`, `yaml`, `pandas`, `polars`, `geojson`, `shapefile`, `postgresql`, `sqlserver`, `mariadb`, `duckdb`, `sqlite` |
| `--dataset` | `-d` | `incidents` | Dataset to generate: `incidents`, `phone`, `all` |
| `--id-format` | | `integer` | id_number style: `integer` or `guid` |
| `--output-dir` | `-o` | `output` | Directory for exported files |
| `--output-stem` | `-s` | `synthetic_911` | Filename prefix for exported files |
| `--start-date` | | `Jan 1 current year` | Inclusive start date (YYYY-MM-DD) |
| `--end-date` | | `Dec 31 current year` | Inclusive end date (YYYY-MM-DD) |
| `--seed` | | `911` | Random seed for reproducible output |
| `--calltaker-pool-size` | | `12` | Number of unique calltaker names |
| `--dispatcher-pool-size` | | `10` | Number of unique dispatcher names |
| `--shift-preset` | | *(realism config)* | Shift structure preset: `2x12h-4shift-14day`, `2x12h-2shift`, `3x8h-3shift`, or `4x10h-4shift` |
| `--max-memory-bytes` | | `2147483648` | Approximate in-memory budget per incident chunk in bytes; CSV/Parquet exports stream in chunks to stay under it |
| `--population` | | *(none)* | Population of the service area. When set, phone-metrics volume is derived from population (calls per 1,000 residents per year) instead of the incident row count |
| `--psap-agency` | | `all` | PSAP agency filter: `all`, `law`, `fire`, `ems`, `fire_ems`. Restricts which agency types appear in the output |
| `--config` | | *(none)* | Path to YAML realism configuration file |
| `--country` | | `US` | ISO 3166-1 alpha-2 country code selecting the emergency-number registry (see [Emergency Number Registry](#emergency-number-registry)) |
| `--emergency-numbers` | | *(registry)* | Comma-separated emergency numbers to model, overriding the country registry (e.g. `"999,112"`) |
| `--include-10-digit-emergency` | | *(off)* | Include 10-digit direct-dial emergency lines from the registry |
| `--db-dialect` | | *(auto)* | Explicit database dialect: `postgresql`, `sqlserver`, `mariadb`, `duckdb`, `sqlite` (auto-detected from `--format`) |
| `--db-host` | | *(none)* | Database host (not needed for file-based `duckdb`/`sqlite`) |
| `--db-port` | | *(dialect default)* | Database port (defaults: postgresql 5432, sqlserver 1433, mariadb 3306) |
| `--db-name` | | *(none)* | Database name; for `duckdb`/`sqlite` the file path, defaulting to `{output_stem}.duckdb`/`.sqlite3` |
| `--db-user` | | *(none)* | Database username (not needed for file-based `duckdb`/`sqlite`) |
| `--db-password` | | *(none)* | Database password (not needed for file-based `duckdb`/`sqlite`) |
| `--db-table-incidents` | | `incidents` | Incidents table name |
| `--db-table-phone` | | `hourly_call_counts` | Hourly phone metrics table name |
| `--db-schema` | | *(none)* | Database schema (ignored for SQLite) |
| `--db-batch-size` | | `10000` | Rows per database insert batch |
| `--db-if-exists` | | `append` | Table-exists behavior: `append`, `replace`, or `fail` |
| `--no-db-indexes` | | *(create them)* | Skip creating indexes on key columns |
| `--schema` | | *(off)* | Print the generated schema (columns + types) for the selected datasets; no data is generated and no addresses are fetched |
| `--dry-run` | | *(off)* | Print the schema plus a few sample rows; no files are written and no addresses are fetched |

### Global Options

Global options are accepted before the subcommand (e.g. `uv run SynthCCD --verbose generate ...`).

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--verbose` | `-v` | *(off)* | Enable debug-level logging to stderr |
| `--quiet` | `-q` | *(off)* | Suppress all non-error logging |

Logging writes to stderr. The `SYNTHCCD_LOG_LEVEL` environment variable
(`DEBUG`, `INFO`, `WARNING`, `ERROR`) also controls verbosity and is used when
neither `--verbose` nor `--quiet` is given. On large runs the incident
generator reports percentage progress (5% steps) once `rows` exceeds 10,000.

```bash
uv run SynthCCD --help          # Show all commands and options
uv run SynthCCD generate --help # Show generate-specific options
uv run SynthCCD --verbose generate --rows 50000 --format parquet
```

### Schema Preview and Dry Run

Both flags inspect what would be generated **without** writing files, running a
long generation, or fetching addresses from OpenStreetMap.

| Flag | Output |
|------|--------|
| `--schema` | Column names and data types for each selected dataset (respects `--dataset`, `--id-format`, and `--config`) |
| `--dry-run` | Same schema output plus a handful of sample rows |

```bash
# Show the incident schema (1-row probe, static addresses)
uv run SynthCCD generate --schema --dataset incidents

# Show the phone-metrics schema
uv run SynthCCD generate --schema --dataset phone

# Show both schemas plus sample rows
uv run SynthCCD generate --dry-run

# Preview with a realism config and GUID ids
uv run SynthCCD generate --dry-run --config my_center.yaml --id-format guid
```

Sample rows use a small static address pool (never the OSM network) and a
single-day phone range, so previews are instant and deterministic for a given
`--seed`. Sample addresses are illustrative only — they are not the addresses a
full run would produce.

### Schema Export Command

The `schema` command exports the output schema definition (column names and
dtypes for each dataset) as JSON or YAML without generating data or fetching
addresses:

```bash
uv run SynthCCD schema --format json --dataset incidents
uv run SynthCCD schema --format yaml --dataset phone
uv run SynthCCD schema --dataset all
```

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--format` | `-f` | `json` | Output format: `json` or `yaml` |
| `--dataset` | `-d` | `incidents` | Dataset to describe: `incidents`, `phone`, or `all` |
| `--config` | | *(none)* | Path to YAML realism configuration file |
| `--id-format` | | `integer` | id_number style: `integer` or `guid` |
| `--output` | `-o` | *(stdout)* | Write the schema definition to a file instead of printing to stdout |

The exported document includes the schema `version`, a deterministic
`schema_hash` (matching the hash embedded in Parquet metadata and the
`{output_stem}_manifest.json` sidecar), the selected `dataset`, the columns and
dtypes per dataset, and package/environment provenance. The definition reflects
`--config` and `--id-format`, so it matches what a full run produces:

```bash
# Write the incidents schema to a file
uv run SynthCCD schema --format json --output schema.json

# Inspect the schema your configured center would produce
uv run SynthCCD schema --config my_center.yaml --id-format guid
```

---

## Textual User Interface (TUI)

Launch the TUI for interactive data generation:

```bash
uv run SynthCCD tui
```

### TUI Controls

| Key | Action |
|-----|--------|
| `G` | Generate data |
| `Q` | Quit |
| `Tab` | Navigate between fields |
| `Enter` | Activate focused button |

Generation runs in a background worker, so the interface stays responsive. A progress bar
tracks incident generation (updates ~0.1% granularity) and the status panel reflects each
phase; invalid inputs are highlighted with a red border and reported together in the status
panel, clearing as you edit.

The Parameters tab is scrollable, and tabbing between fields auto-scrolls the form so the
focused field is always visible — you never need to scroll manually or guess where the next
parameter sits.

### TUI Fields

Fields are grouped into sections — General, Geography, Personnel, and Configuration Files.
The status panel and help tab explain each field.

| Field | Description |
|-------|-------------|
| Rows | Number of incident rows (default: 10000) |
| Seed | Random seed for reproducible output (default: 911) |
| Area query | OpenStreetMap query (default: "Kansas City, MO") |
| Output format | All supported formats: csv, parquet, json, yaml, pandas, polars, geojson, shapefile, postgresql, sqlserver, mariadb, duckdb, sqlite |
| Dataset | incidents, phone, all |
| ID format | id_number style: integer or guid |
| Output directory | Directory for exported files (default: output) |
| Output stem | Filename prefix (default: "synthetic_911") |
| Start date | Inclusive start date, YYYY-MM-DD (optional) |
| End date | Inclusive end date, YYYY-MM-DD (optional) |
| Calltaker pool size | Unique calltaker names (default: 12) |
| Dispatcher pool size | Unique dispatcher names (default: 10) |
| Shift preset | Shift structure preset (default: 2x12h-4shift-14day) |
| Max memory (bytes) | Per-chunk memory budget for CSV/Parquet streaming (blank = 2 GiB default) |
| Country | ISO 3166-1 alpha-2 code selecting the emergency-number registry (default: US) |
| Emergency numbers | Comma-separated override of the emergency lines to model (blank uses the country registry, e.g. `999,112`) |
| 10-digit lines | Include 10-digit direct-dial emergency lines from the registry |
| Params file | JSON/YAML/TOML preset; Load Params fills the fields |
| Realism config file | YAML realism configuration (optional) |



---

## FastAPI REST API Server

Launch the REST API server for programmatic access:

```bash
uv run SynthCCD serve
```

The server runs on `http://127.0.0.1:8000` by default (local connections only)
and provides:

> **Note:** like the CLI and TUI, the server injects the OS trust store at
> startup when `SYNTHCCD_SYSTEM_TRUST=1` (see
> [TLS-inspecting proxies](#tls-errors-on-restricted-networks-corporate-proxy--mitm)), so OSM
> address lookups work behind corporate proxies. Injection happens once in the
> server lifespan, before any request.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/schema` | GET | Schema preview (no OSM fetch, no data generation) |
| `/generate` | POST | Generate data (returns JSON summary or file download) |
| `/generate/stream` | POST | Stream CSV/Parquet for large datasets |

### Rate Limiting

The server enforces a sliding-window rate limit of **30 requests per 60 seconds**
per client IP. When exceeded, the endpoint returns `429 Too Many Requests` with a
`Retry-After` header. To override, edit `_DEFAULT_RATE_LIMIT` and
`_DEFAULT_WINDOW_SECONDS` in `serve.py`, or use `uvicorn` directly with a
production reverse proxy that handles throttling.

### Bind Address

By default the server binds to `127.0.0.1:8000` (localhost only). Override with:

| Variable | Default | Description |
|----------|---------|-------------|
| `SYNTHCCD_SERVE_HOST` | `127.0.0.1` | Bind address (use `0.0.0.0` for all interfaces) |
| `SYNTHCCD_SERVE_PORT` | `8000` | Listen port |

### Schema Preview (GET `/schema`)

```bash
# Basic schema preview
curl "http://localhost:8000/schema?rows=100&dataset=all"

# With custom parameters
curl "http://localhost:8000/schema?rows=1000&dataset=incidents&area_query=Seattle,WA&seed=42&config=config/example_realism.yaml"
```

Query parameters:
- `rows` (int, default 100): Number of rows for schema probe
- `dataset` (str, default "incidents"): incidents, phone, or all
- `output_format` (str, default "pandas"): Output format for probe
- `area_query` (str, default "Kansas City, MO"): Area for addresses
- `seed` (int, default 911): Random seed
- `config` (str, optional): Path to realism config YAML

### Generate Data (POST `/generate`)

```bash
# Generate with JSON body, return summary
curl -X POST "http://localhost:8000/generate"   -H "Content-Type: application/json"   -d '{
    "rows": 50000,
    "area_query": "Denver, CO",
    "output_format": "parquet",
    "dataset": "all",
    "seed": 12345
  }'

# Generate and download single file
curl -X POST "http://localhost:8000/generate?download=true"   -H "Content-Type: application/json"   -d '{"rows": 1000, "output_format": "json", "dataset": "incidents"}'   -o incidents.json
```

Request body fields (all optional, matching CLI options):
- `rows`, `area_query`, `output_format`, `dataset`, `id_format`
- `output_dir`, `output_stem`, `start_date`, `end_date`, `seed`
- `calltaker_pool_size`, `dispatcher_pool_size`, `shift_preset`
- `max_memory_bytes`, `population`, `psap_agency`, `realism_config_path`

Query parameters:
- `download` (bool, default false): If true, return file download for single-file formats

### Stream Large Datasets (POST `/generate/stream`)

For very large datasets, stream the output to avoid loading entire files in memory:

```bash
curl -X POST "http://localhost:8000/generate/stream?dataset=incidents"   -H "Content-Type: application/json"   -d '{"rows": 1000000, "output_format": "parquet"}'   -o incidents.parquet
```

Query parameters:
- `dataset` (str, default "incidents"): incidents or phone

---

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start the API server
docker compose up -d SynthCCD

# Check health
curl http://localhost:8000/health

# Run a one-off generation job
docker compose --profile generate run SynthCCD-generate
```

### Using Docker Directly

```bash
# Build the image
docker build -t SynthCCD:0.1.0 .

# Run the API server
docker run -d   -p 8000:8000   -v SynthCCD-cache:/home/synth911/.cache/synth911gen3   -v SynthCCD-output:/app/output   --name SynthCCD-api   SynthCCD:0.1.0

# Run a one-off generation
docker run --rm   -v SynthCCD-cache:/home/synth911/.cache/synth911gen3   -v SynthCCD-output:/app/output   SynthCCD:0.1.0   SynthCCD generate --rows 50000 --format parquet
```

### Persistent Volumes

| Volume | Purpose |
|--------|---------|
| `SynthCCD-cache` | OSM address cache (speeds up subsequent runs) |
| `SynthCCD-output` | Generated output files |

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SYNTHCCD_LOG_LEVEL` | `INFO` | Logging level (DEBUG, INFO, WARNING, ERROR) |
| `SYNTHCCD_SYSTEM_TRUST` | `0` | Set to `1` to use OS trust store for TLS (corporate proxies) |
| `SYNTHCCD_SERVE_HOST` | `127.0.0.1` | Bind address for the API server |
| `SYNTHCCD_SERVE_PORT` | `8000` | Listen port for the API server |

---

## Configuration Parameters

### Core Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `rows` | int | 10000 | Number of CAD incidents to generate |
| `area_query` | str | "Kansas City, MO" | OpenStreetMap Nominatim query for address geocoding |
| `output_format` | enum | CSV | Export format (see [Output Formats](#output-formats)) |
| `dataset` | enum | INCIDENTS | Which dataset(s) to generate |
| `id_format` | enum | INTEGER | Incident id_number style: `integer` or `guid` |
| `output_dir` | Path | "output" | Output directory path |
| `output_stem` | str | "synthetic_911" | Base filename for exports |
| `start_date` | date | Jan 1 (current year) | Start of date range for incident timestamps |
| `end_date` | date | Dec 31 (current year) | End of date range for incident timestamps |
| `seed` | int | 911 | Random seed for reproducibility |
| `max_memory_bytes` | int | None (2 GiB) | Per-chunk memory budget in bytes for incident CSV/Parquet streaming; see [Memory Budget & Chunked Export](#memory-budget--chunked-export) |

### Personnel and Shift Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `calltaker_pool_size` | int | 12 | Unique calltaker names to generate |
| `dispatcher_pool_size` | int | 10 | Unique dispatcher names to generate |
| `shift_preset` | str | None | Shift structure preset name (see [Shift Structures](#shift-structures)); when None the realism config's `shift_config` is used |

### Emergency Number Registry

The phone-metrics dataset models the phone lines that carry emergency traffic in
a country. A built-in registry maps ISO 3166-1 alpha-2 country codes to the
emergency short codes dialed there; US/Canada (`911`) is the default. Selecting a
country controls which lines are modeled and how the hourly phone-metrics columns
are named.

| Parameter | CLI Flag | Default | Description |
|-----------|----------|---------|-------------|
| `country` | `--country` | `US` | ISO 3166-1 alpha-2 code selecting the registry entry (e.g. `GB`, `IE`, `DE`, `FR`, `AU`, `NZ`) |
| `emergency_numbers` | `--emergency-numbers` | *(registry)* | Comma-separated emergency numbers to model; overrides the country registry entirely (e.g. `"999,112"`) |
| `include_10_digit_emergency` | `--include-10-digit-emergency` | false | Append the country's registered 10-digit direct-dial lines alongside the short codes |

```bash
# Model UK emergency lines (999 + 112) instead of US 911
uv run SynthCCD generate --dataset phone --country GB --start-date 2026-01-01 --end-date 2026-01-07

# Override with an explicit number set
uv run SynthCCD generate --dataset phone --emergency-numbers "999,112"

# Add 10-digit direct-dial lines on top of the registry
uv run SynthCCD generate --dataset phone --country US --include-10-digit-emergency
```

The registry contains short codes for US, CA, GB, IE, FR, DE, AU, NZ, NL, IT, JP,
KR, ES, CH, SE, NO, DK, FI, BE, IN, BR, ZA, RU, CN, and HK (see the
[Realism Guide](REALISMGUIDE.md) for the full table). The optional 10-digit
direct-dial entries are illustrative placeholders reserved for fictional use and
should be replaced with real agency numbers (or an `--emergency-numbers`
override) for production datasets.

### Shift Structures

Incidents are assigned to a named shift (`shift` column) using a configurable
crew-rotation schedule. A preset selects a complete structure up front; omit it
(or set it to `None`) to use whatever `shift_config` is defined in the realism
configuration file.

Available presets:

| Preset | Structure |
|--------|-----------|
| `2x12h-4shift-14day` (default) | 2x12h, shifts A/B (day) and C/D (night), 14-day crew rotation |
| `2x12h-2shift` | 2x12h, single day and single night shift (no crew cycling) |
| `3x8h-3shift` | 3x8h, Morning / Swing / Midnight |
| `4x10h-4shift` | 4x10h, Day / Coverage / Evening / Night |

```bash
# Use a different shift structure from the CLI
uv run SynthCCD generate --shift-preset 3x8h-3shift

# Or programmatically
GenerationRequest(rows=10000, shift_preset="4x10h-4shift")
```

Each shift also carries its own staffing (calltakers/dispatchers). Shifts that
omit staffing fall back to splitting the global `calltaker_pool_size` /
`dispatcher_pool_size` totals. Custom structures — arbitrary shift hours,
overnight shifts, rotation patterns, and per-shift staffing — are defined in the
realism config's `shift_config` section; see the [Realism Guide](REALISMGUIDE.md).

### Supplying Parameters from a File

All parameters in this section can be supplied at once from a JSON, YAML, or TOML file with `--params`. See [Params Files](#params-files-bundled-options).

### Date Range Behavior

- If `start_date` and `end_date` are not specified, the full current calendar year is used
- Incidents are distributed across the date range using realistic diurnal patterns
- Hourly phone metrics cover every hour in the date range

### Address Generation

Addresses are fetched from OpenStreetMap using the `area_query` parameter. The query accepts **any valid location query** that OpenStreetMap's Nominatim API supports, which is geocoded to a bounding box. Real street addresses with `addr:housenumber` + `addr:street` tags are then pulled from that bounding box via the Overpass API (overpy). Where an area lacks mapped house numbers, the generator falls back to real named streets with synthesized house numbers so output is still produced.

Each address is emitted as individual components (`prefix_directional`, `street_number`, `street_name`, `street_type`, `postfix_directional`, `postal_code`) in addition to the combined `street_address`. Directionals are normalized to abbreviations (e.g., `NORTH` → `N`); a component is left empty when it cannot be determined from the source data. US `postal_code` values are normalized to the 5-digit ZIP: OpenStreetMap sometimes stores a 9-digit ZIP+4 (e.g. `64110-1234`), which is truncated to `64110`. Non-US postal codes (e.g. Canadian `L4T 2D6`, UK `SW1A 2AA`) are passed through unchanged.

Larger areas provide more address variety but take longer to fetch initially (addresses are cached locally after first query).

**Examples (not an exhaustive list):**

```
"Kansas City, MO"
"Seattle, WA"
"New York City, NY"
"Denver County, CO"
"London, UK"
"Chicago, IL"
"Los Angeles County, CA"
"Toronto, ON, Canada"
"Paris, France"
"Tokyo, Japan"
"Sydney, Australia"
"Berlin, Germany"
```

**Query flexibility:**

- City names: `"Portland, OR"`
- County/region: `"King County, WA"`
- State/province: `"Texas, USA"`
- Postal codes: `"90210, USA"`
- Landmarks: `"Central Park, New York, NY"`
- Bounding boxes: `"40.7128,-74.0060,40.7739,-73.9636"` (minlat,minlon,maxlat,maxlon)

Larger areas provide more address variety but may take longer to fetch initially (addresses are cached locally after first query).

---

## Realism Configuration

How the generator produces realistic statistics — agency/priority/problem
distributions, time profiles, the parallel dispatch timeline, **seasonal problem
correlations**, and hourly phone metrics — and how to override them with a YAML
realism configuration file, is documented in the dedicated [Realism Guide](REALISMGUIDE.md).

Key facts:

- No configuration is required; defaults are tuned to realistic 9-1-1 center behavior.
- A `--config path/to/realism.yaml` file overrides any or all default distributions.
- An example config ships at `config/example_realism.yaml`.
- Use `RealismConfig.from_yaml(...)` from Python (see [Python API Usage](#python-api-usage)).

### Validating a Realism Config

Validate one or more realism config files without generating any data:

```bash
uv run SynthCCD validate-config config/example_realism.yaml
uv run SynthCCD validate-config config/center_a.yaml config/center_b.yaml
```

Each file is parsed and checked against all validation rules (weight sums,
required time-profile keys, dispatch-init-fraction bounds, phone-metric bounds,
shift config, name locales, etc.). Exit codes:

| Exit code | Meaning |
|-----------|---------|
| `0` | All files valid |
| `1` | One or more files failed validation |
| `2` | Argument error (e.g., missing file) |

```bash
uv run SynthCCD validate-config my_center.yaml
# my_center.yaml: OK

uv run SynthCCD validate-config broken.yaml
# broken.yaml: Priority weights defined for unknown agency: UNKNOWN
```

---

## Params Files (Bundled Options)

Instead of typing every flag on the command line, you can store all generation parameters in a single file and pass it with `--params`. This is useful for repeatable runs, team-shared presets, and batch/CI workflows.

### Using a Params File

```bash
uv run SynthCCD generate --params config/example_params.json
```

### Supported Formats

Params files may be JSON (`.json`), YAML (`.yaml`/`.yml`), or TOML (`.toml`). Format is detected from the file extension.

### File Structure

Keys mirror the CLI option names. Canonical `GenerationRequest` field names are also accepted.

```json
{
  "rows": 50000,
  "area": "Denver, CO",
  "format": "parquet",
  "dataset": "all",
  "output_dir": "output",
  "output_stem": "denver_911",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "seed": 42,
  "calltaker_pool_size": 20,
  "dispatcher_pool_size": 15,
  "shift_preset": "3x8h-3shift",
  "max_memory_bytes": 1073741824,
  "config": "config/example_realism.yaml"
}
```

The same file in YAML:

```yaml
rows: 25000
area: "Seattle, WA"
format: csv
dataset: incidents
output_dir: "output"
output_stem: "seattle_911"
start_date: "2024-07-01"
end_date: "2024-09-30"
seed: 2024
calltaker_pool_size: 16
dispatcher_pool_size: 12
shift_preset: "4x10h-4shift"
```

### Key Reference

| Key | Accepted Alias | Type | Description |
|-----|---------------|------|-------------|
| `rows` | | int | Number of incident rows |
| `area_query` | `area` | str | OpenStreetMap area query |
| `output_format` | `format` | str | csv, parquet, json, yaml, pandas, polars, geojson, shapefile, postgresql, sqlserver, mariadb, duckdb, sqlite |
| `dataset` | | str | incidents, phone, all |
| `id_format` | | str | integer or guid |
| `output_dir` | | str | Output directory |
| `output_stem` | | str | Filename stem |
| `start_date` | | str (YYYY-MM-DD) | Inclusive start date |
| `end_date` | | str (YYYY-MM-DD) | Inclusive end date |
| `seed` | | int | Random seed |
| `calltaker_pool_size` | | int | Unique calltaker names |
| `dispatcher_pool_size` | | int | Unique dispatcher names |
| `shift_preset` | | str | Shift structure preset name |
| `max_memory_bytes` | | int | Per-chunk memory budget for CSV/Parquet streaming |
| `population` | | int | Service area population for phone-volume scaling |
| `psap_agency` | | str | PSAP agency filter: `all`, `law`, `fire`, `ems`, `fire_ems` |
| `realism_config_path` | `config` | str | Path to YAML realism config |
| `country` | | str | ISO 3166-1 alpha-2 code selecting the emergency-number registry (see [Emergency Number Registry](#emergency-number-registry)) |
| `emergency_numbers` | | str | Comma-separated emergency numbers, overriding the country registry |
| `include_10_digit_emergency` | | bool | Include 10-digit direct-dial emergency lines |
| `db_dialect` | | str | postgresql, sqlserver, mariadb, duckdb, sqlite |
| `db_host` | | str | Database host (not needed for duckdb/sqlite) |
| `db_port` | | int | Database port (defaults per dialect) |
| `db_name` | | str | Database name (file path for duckdb/sqlite) |
| `db_user` | | str | Database username (not needed for duckdb/sqlite) |
| `db_password` | | str | Database password (not needed for duckdb/sqlite) |
| `db_table_incidents` | | str | Incidents table name (default: `incidents`) |
| `db_table_phone` | | str | Phone metrics table name (default: `hourly_call_counts`) |
| `db_schema` | | str | Database schema (ignored for sqlite) |
| `db_batch_size` | | int | Rows per insert batch (default: 10000) |
| `db_if_exists` | | str | append, replace, or fail (default: append) |
| `db_create_indexes` | | bool | Create indexes on key columns (default: true) |

### Precedence

Values are merged with the following precedence (highest wins):

1. **CLI flags** (e.g., `--rows 100` overrides the file)
2. **Params file** values
3. **Built-in defaults** (10,000 rows, Kansas City, MO, csv, etc.)

Omitted keys fall through to the next source, so a params file may contain only the subset you care about:

```bash
# File sets rows/area/dates; CLI overrides format and rows
uv run SynthCCD generate --params my_run.json --format json --rows 75000
```

### Examples

```bash
# Full run from a params file
uv run SynthCCD generate --params config/example_params.json

# Override selected values on top of a file
uv run SynthCCD generate --params denver.json --rows 1000000 --format parquet

# YAML or TOML params files work too
uv run SynthCCD generate --params config/example_params.yaml
uv run SynthCCD generate --params config/example_params.toml
uv run SynthCCD generate --params run.toml
```

Three ready-made examples are included in the repo: `config/example_params.json`, `config/example_params.yaml`, and `config/example_params.toml`.

### Capturing Parameters with `--save-params`

Instead of hand-writing a params file, run `generate` with the flags you want and add
`--save-params <path>` to write them out (and exit without generating). The extension
(`.json`, `.yaml`/`.yml`, or `.toml`) selects the format. Values are written with canonical
`GenerationRequest` keys (e.g. `area_query`, `output_format`, `realism_config_path`) so the
saved file loads directly with `--params`.

```bash
# Capture a run's settings as YAML
uv run SynthCCD generate --rows 2500 --area "Denver, CO" --format parquet --seed 77 --save-params denver.yaml

# Saved file (denver.yaml)
#   rows: 2500
#   area_query: Denver, CO
#   output_format: parquet
#   seed: 77

# Reuse it later
uv run SynthCCD generate --params denver.yaml

# Combine a --params file with overrides, capturing the merged result
uv run SynthCCD generate --params config/example_params.yaml --rows 500 --save-params my_run.json
```

---

## Output Formats

| Format | Extension | Description | Use Case |
|--------|-----------|-------------|----------|
| `csv` | `.csv` | Comma-separated values | General purpose, Excel compatible |
| `parquet` | `.parquet` | Apache Parquet columnar | Analytics, big data workflows |
| `json` | `_bundle.json` | Single JSON file with all datasets | Web APIs, JavaScript |
| `yaml` | `_bundle.yaml` | Single YAML file with all datasets | Configuration, human-readable |
| `pandas` | (memory) | Returns `dict[str, pd.DataFrame]` | Python notebooks, pandas workflows |
| `polars` | (memory) | Returns `dict[str, pl.DataFrame]` | High-performance Python analytics |
| `geojson` | `.geojson` | GeoJSON FeatureCollection with Point geometries | Web mapping, GIS, spatial analysis |
| `shapefile` | `.shp` + sidecars | ESRI Shapefile (requires geopandas) | Desktop GIS (ArcGIS, QGIS), legacy systems |
| `postgresql` | (database) | Streaming insert into PostgreSQL | Production data pipelines, warehouses |
| `sqlserver` | (database) | Streaming insert into SQL Server | Enterprise Microsoft environments |
| `mariadb` | (database) | Streaming insert into MariaDB/MySQL | Open-source stack deployments |
| `duckdb` | (database) | Streaming insert into DuckDB file | Local analytics, embedded workloads |
| `sqlite` | (database) | Streaming insert into SQLite file | Local analytics, embedded/lightweight workloads, no server |

### Data Governance Manifest

For every file-based export (CSV, Parquet, JSON, YAML), a **data governance manifest** is written as a sidecar JSON file named `{output_stem}_manifest.json`. This manifest captures the complete generation context for reproducibility and auditing:

| Field | Description |
|-------|-------------|
| `version` | Manifest schema version (currently `1.0`) |
| `generated_at` | ISO 8601 timestamp of generation (UTC) |
| `package` | Package name (`synth911gen3`) |
| `package_version` | Installed package version |
| `python_version` | Python interpreter version |
| `platform` | OS/platform identifier |
| `seed` | Random seed used for generation |
| `rows_requested` | Number of incident rows requested |
| `dataset` | Which dataset(s) were generated (`incidents`, `phone`, `all`) |
| `output_format` | Output format used |
| `area_query` | OpenStreetMap area query |
| `start_date` / `end_date` | Date range for incident timestamps |
| `id_format` | ID format (`integer` or `guid`) |
| `calltaker_pool_size` / `dispatcher_pool_size` | Personnel pool sizes |
| `shift_preset` | Shift structure preset (if any) |
| `realism_config_hash` | SHA-256 hash (first 16 chars) of the realism YAML config |
| `max_memory_bytes` | Per-chunk memory budget for chunked exports |
| `schema_hash` | SHA-256 hash (first 16 chars) of the output schema |
| `schema_version` | Data schema version (`DATA_SCHEMA_VERSION` in `constants.py`) |
| `datasets_generated` | List of dataset names produced |
| `row_counts` | Row count per dataset |
| `column_counts` | Column count per dataset |

The manifest enables:
- **Reproducibility**: Regenerate identical data by reusing the seed and parameters
- **Audit trail**: Verify what configuration produced a given export
- **Schema validation**: Detect schema drift across runs
- **Config verification**: Confirm the realism config matches expectations via hash

> **Note**: The manifest is not emitted for in-memory formats (`pandas`/`polars`) since no files are written.

### Parquet Metadata Embedding

Every Parquet file (incidents, hourly call counts — both full and chunked exports) embeds the generation provenance directly in the file's **key-value footer metadata**, so each file is self-documenting and readable without the sidecar manifest. Keys are namespaced with a `synth911:` prefix (plain Parquet key-value metadata — visible to any Parquet reader, not just pyarrow):

| Key | Description |
|-----|-------------|
| `synth911:seed` | Random seed used for generation |
| `synth911:schema_version` | Data schema version (matches manifest `schema_version`) |
| `synth911:realism_config_hash` | Hash of the realism YAML config |
| `synth911:schema_hash` | Hash of the output schema (from the first chunk in chunked mode) |
| `synth911:generated_at` | ISO 8601 generation timestamp (UTC) |
| `synth911:package` / `synth911:package_version` | Generator identity |
| `synth911:python_version` / `synth911:platform` | Runtime environment |
| `synth911:rows_requested` / `synth911:dataset` / `synth911:output_format` | Request summary |
| `synth911:area_query` / `synth911:id_format` | Address area and ID scheme |
| `synth911:calltaker_pool_size` / `synth911:dispatcher_pool_size` | Personnel pools |
| `synth911:shift_preset` / `synth911:max_memory_bytes` | Shift structure / memory budget |
| `synth911:datasets_generated` | JSON list of datasets produced |
| `synth911:manifest_version` | Manifest schema version (`1.0`) |

Read it back with:

```python
import pyarrow.parquet as pq

pf = pq.ParquetFile("output/synthetic_911_incidents.parquet")
metadata = pf.metadata.metadata  # {b'synth911:seed': b'31337', ...}
```

Notes:
- `row_counts`/`column_counts` are intentionally **not** embedded (the footer row count and the sidecar manifest cover those); this keeps chunked-mode exports truthful, since final counts may be unknown at write time.
- The embedded metadata matches the sidecar manifest values on the same run.

### File Naming

- **CSV/Parquet**: `{output_stem}_{dataset}.{ext}` (e.g., `synthetic_911_incidents.csv`)
- **JSON/YAML**: `{output_stem}_bundle.{ext}` (single file containing all datasets)
- **GeoJSON**: `{output_stem}_incidents.geojson` (FeatureCollection with Point geometries)
- **Shapefile**: `{output_stem}_incidents.shp` + sidecars (`.shx`, `.dbf`, `.prj`, `.cpg`)
- **DuckDB/SQLite**: `{output_stem}.duckdb` / `{output_stem}.sqlite3` unless `--db-name` is given
- **Manifest**: `{output_stem}_manifest.json` (data governance sidecar; all file-based formats)

### Geospatial Exports

The `geojson` and `shapefile` formats export the **incidents dataset** as spatial data with Point geometries derived from the latitude/longitude coordinates fetched from OpenStreetMap.

#### GeoJSON

- Outputs a standard **GeoJSON FeatureCollection** (RFC 7946)
- Each incident becomes a `Feature` with a `Point` geometry `[longitude, latitude]`
- All incident attributes are included in `properties`
- Coordinates use WGS84 (EPSG:4326)
- Ideal for web mapping (Leaflet, Mapbox, OpenLayers), GIS software, and spatial databases

```bash
uv run SynthCCD generate --format geojson --rows 10000 --area "Seattle, WA"
```

#### Shapefile (ESRI)

- Outputs a traditional **ESRI Shapefile** with `.shp`, `.shx`, `.dbf`, `.prj`, `.cpg` files
- Uses `geopandas` and `shapely` (included in the base dependencies)
- Geometry: Point (WGS84 / EPSG:4326)
- **Note**: Shapefile format limits field names to 10 characters; long column names are automatically truncated (e.g., `internal_reference_number` → `internal_r`). For full fidelity, prefer GeoJSON or Parquet.
- Compatible with ArcGIS, QGIS, and other desktop GIS software

```bash
# Generate shapefile
uv run SynthCCD generate --format shapefile --rows 10000 --area "Denver, CO"
```

#### Coordinate Availability

Coordinates come from OpenStreetMap address data. When real addresses with `addr:housenumber` + `addr:street` are found via Overpass, their lat/lon are used. For synthesized addresses (fallback when OSM lacks house numbers), coordinates default to `0.0, 0.0` and are excluded from geospatial exports.

> **Note**: The hourly phone metrics dataset has no spatial component and is exported as JSON alongside the geospatial incidents file when using `geojson` or `shapefile` format.

### Database Exports (Streaming Insert)

The generator supports direct streaming inserts into relational databases, avoiding intermediate files entirely. This is ideal for large-scale loads and production pipelines.

| Format | Dialect | Required Dependencies | Default Port |
|--------|---------|----------------------|--------------|
| `postgresql` | PostgreSQL | `psycopg2-binary` | 5432 |
| `sqlserver` | SQL Server | `pyodbc` + ODBC Driver 17 | 1433 |
| `mariadb` | MariaDB/MySQL | `pymysql` | 3306 |
| `duckdb` | DuckDB | `duckdb-engine` | (file-based) |
| `sqlite` | SQLite | none (stdlib `sqlite3`) | (file-based) |

#### Configuration

Database exports require connection parameters. These can be provided via CLI flags, params file, or Python API:

| Parameter | CLI Flag | Description | Required |
|-----------|----------|-------------|----------|
| `db_dialect` | --db-dialect | Explicit dialect (auto-detected from --format) | No |
| `db_host` | --db-host | Database host | Yes (except DuckDB/SQLite) |
| `db_port` | --db-port | Database port | No (uses defaults) |
| `db_name` | --db-name | Database name; file path for DuckDB/SQLite | Yes (defaults to `{output_stem}.duckdb`/`.sqlite3`) |
| `db_user` | --db-user | Username | Yes (except DuckDB/SQLite) |
| `db_password` | --db-password | Password | Yes (except DuckDB/SQLite) |
| `db_table_incidents` | --db-table-incidents | Incidents table name | No (default: `incidents`) |
| `db_table_phone` | --db-table-phone | Phone metrics table name | No (default: `hourly_call_counts`) |
| `db_schema` | --db-schema | Database schema (ignored for SQLite) | No |
| `db_batch_size` | --db-batch-size | Rows per batch insert | No (default: 10000) |
| `db_if_exists` | --db-if-exists | `append`, `replace`, `fail` | No (default: `append`) |
| `db_create_indexes` | --no-db-indexes | Skip creating indexes on key columns | No (default: create them) |

#### Usage Examples

**PostgreSQL:**
```bash
uv run SynthCCD generate \
  --format postgresql \
  --rows 100000 \
  --area "Seattle, WA" \
  --db-host localhost \
  --db-name cad_db \
  --db-user etl_user \
  --db-password secret \
  --db-table-incidents cad_incidents \
  --db-batch-size 50000
```

**DuckDB (local file, no server needed):**
```bash
uv run SynthCCD generate \
  --format duckdb \
  --rows 500000 \
  --area "Portland, OR" \
  --db-name portland_cad.duckdb
```

**SQLite (local file, no server or extra dependencies):**
```bash
uv run SynthCCD generate \
  --format sqlite \
  --rows 500000 \
  --area "Kansas City, MO" \
  --output-stem kc_cad \
  --db-name kc_cad.sqlite3 \
  --db-if-exists replace
```

Query it with any SQLite tool:
```bash
sqlite3 output/kc_cad.sqlite3 "SELECT agency, priority, COUNT(*) FROM incidents GROUP BY agency, priority;"
```

**Skip index creation for faster bulk loads (all dialects):**
```bash
uv run SynthCCD generate --format sqlite --rows 100000 --no-db-indexes
```

**MariaDB with custom schema and replace mode:**
```bash
uv run SynthCCD generate \
  --format mariadb \
  --rows 200000 \
  --area "Denver, CO" \
  --db-host db.example.com \
  --db-name cad \
  --db-user loader \
  --db-password secret \
  --db-schema public \
  --db-if-exists replace
```

**Python API:**
```python
from synth911gen3 import Synth911Application
from synth911gen3.addresses import OpenStreetMapAddressProvider
from synth911gen3.config import GenerationRequest, OutputFormat, DatasetKind

request = GenerationRequest(
    rows=1000000,
    area_query="Chicago, IL",
    output_format=OutputFormat.POSTGRESQL,
    dataset=DatasetKind.ALL,
    db_host="localhost",
    db_name="cad_warehouse",
    db_user="loader",
    db_password="secret",
    db_batch_size=100000,
    db_create_indexes=True,
)

app = Synth911Application(address_provider=OpenStreetMapAddressProvider())
result = app.generate(request)
# result.exported_artifacts["database"] contains row counts per table
```

#### Behavior Notes

- **Streaming inserts**: Data is inserted in batches (`db_batch_size`) using pandas `to_sql` with `method="multi"` for efficiency.
- **Schema creation**: Tables are created automatically with appropriate column types (TIMESTAMP, BIGINT, DOUBLE PRECISION, TEXT, BOOLEAN).
- **Indexes**: By default, indexes are created on `call_start_time`, `agency`, `priority`, and `internal_reference_number` for query performance.
- **Idempotency**: With `if_exists="append"` (default), re-running with the same seed appends data. Use `replace` to drop and recreate tables.
- **DuckDB/SQLite**: Use a local file; `db_name` defaults to `{output_stem}.duckdb` / `{output_stem}.sqlite3` in `output_dir`. No host/user/password needed.
- **SQLite**: Uses the Python standard library `sqlite3` driver — no extra dependencies. Has no schema concept, so `db_schema` is ignored (a warning is logged). Because SQLite caps bound parameters at 999 per statement, the effective batch size is capped at `999 // columns` regardless of `db_batch_size`.
- **SQL Server**: Requires ODBC Driver 17 for SQL Server installed on the system.

### In-Memory Formats (pandas/polars)

When using `pandas` or `polars` format, no files are written. The generator returns DataFrame objects directly to the calling code.

### Memory Budget & Chunked Export

For very large CSV/Parquet runs, the incident generator avoids holding the full
frame in memory by **streaming records in chunks**. The per-chunk budget
(`max_memory_bytes`) defaults to 2 GiB and can be set via the CLI
(`--max-memory-bytes`), TUI, or a params file. Only the *incidents* dataset is
chunked; the hourly phone-metrics dataset is tiny and always built in one pass.

- When the estimated full frame fits in the budget, a single chunk is written and
  the file is byte-for-byte identical to a non-chunked run.
- When it does not fit, chunks are written incrementally: CSV writes a header on
  the first chunk and appends the rest; Parquet streams row groups through one
  `ParquetWriter`. Only one chunk's DataFrame is materialized at a time.
- `id_number` stays globally sequential (or globally unique for `guid`) and
  `internal_reference_number` remains unique per agency across chunk boundaries.
- Chunked output is reproducible for a given seed and chunk plan, but chunk
  boundaries cause per-chunk time sorting, so a chunked export may differ in row
  order from a non-chunked export of the same seed. In-memory formats
  (`pandas`/`polars`) always build the full frame.

```bash
# Stream a 5M-row run under a 1 GiB per-chunk budget
uv run SynthCCD generate --rows 5000000 --format parquet --max-memory-bytes 1073741824
```

---

## Generated Data Schema

### CAD Incidents Dataset

| Column | Type | Description |
|--------|------|-------------|
| `id_number` | int or str | Incident ID: sequential integer (1 to N), or UUID v4 string when `id_format` is `guid` |
| `internal_reference_number` | str | Agency-specific reference: `{AGENCY}-{YYMMDD}-{SEQ:06d}` |
| `agency` | str | Responding agency: LAW, FIRE, EMS |
| `shift` | str | Shift on duty at `call_start_time` (e.g., A, B, C, D) |
| `shift_label` | str | Shift label (e.g., DAY, NIGHT) |
| `shift_group` | int | Crew rotation group the shift belongs to (1, 2, …) |
| `problem_nature` | str | Call type (e.g., "Traffic Crash", "Chest Pain", "Assist Fire", "Assist Police", "Assist EMS") |
| `priority` | int | Priority level 1-5 (1=highest) |
| `prefix_directional` | str | Directional prefix (N/S/E/W/NE/…) or empty |
| `street_number` | str | House number (e.g., "101", "204A") |
| `street_name` | str | Street name without type (e.g., "Main", "12th") |
| `street_type` | str | Street suffix (e.g., St, Ave, Blvd) or empty |
| `postfix_directional` | str | Directional suffix (NW/SE/…) or empty |
| `street_address` | str | Full street address from OSM (all components) |
| `city` | str | City name |
| `state` | str | State/province |
| `postal_code` | str | ZIP/postal code from OSM when available. US values are normalized to the 5-digit ZIP (ZIP+4 truncates to `64110`); non-US formats pass through unchanged |
| `latitude` | float | Latitude from OSM address node; `0.0` when no coordinates available (synthesized fallback addresses) |
| `longitude` | float | Longitude from OSM address node; `0.0` when no coordinates available |
| `zone` | str | Geographic zone classification: URBAN, SUBURBAN, or RURAL (OSM-based) |
| `location` | str | `street_address, city, state` |
| `call_start_time` | datetime | Call received timestamp |
| `hour` | int | Hour of day (0–23) of `call_start_time` |
| `dow` | str | Day of week abbreviation (MON–SUN) of `call_start_time` |
| `week_no` | int | ISO week number (1–53) of `call_start_time` |
| `incident_start_time` | datetime | CAD incident record opened; 0–3 s after `call_start_time` |
| `time_phone_pickup` | datetime | Call answered by calltaker |
| `time_call_enters_queue` | datetime | Call queued for dispatch |
| `time_first_unit_assigned` | datetime | First unit assigned (parallel to call-taking for high priority) |
| `time_unit_enroute` | datetime | Unit enroute (wheels rolling) |
| `time_unit_arrived` | datetime | Unit on scene |
| `time_last_unit_cleared` | datetime | Last unit cleared scene |
| `time_call_closed` | datetime | Incident closed in CAD |
| `time_phone_disconnect` | datetime | Caller disconnected |
| `calltaker` | str | Calltaker name |
| `dispatcher` | str | Dispatcher name |
| `method_of_call_reception` | str | E-911, Phone, OFFICER, Radio, C2C, NOT CAPTURED, Text, CAD2CAD |
| `call_disposition` | str | Code+label pair, e.g., NR-No Report, RE-Report, CI-Citation, UNDEFINED |
| `pickup_delay_seconds` | int | Ring-to-answer time |
| `pre_cad_offset_seconds` | int | Call start to CAD incident open (0–3 s) |
| `interview_seconds` | int | Caller interview duration |
| `dispatch_queue_seconds` | int | Queue-to-dispatch time |
| `turnout_seconds` | int | Station-to-wheels-rolling time |
| `travel_seconds` | int | Wheels-rolling to on-scene time |
| `on_scene_seconds` | int | On-scene duration |
| `closeout_seconds` | int | Scene-clear to incident-close time |
| `phone_duration_seconds` | int | Total call duration |
| `total_elapsed_seconds` | int | Call start to incident close |

### Hourly Phone Metrics Dataset

The emergency-line columns are derived from the resolved emergency-number
registry (see [Emergency Number Registry](#emergency-number-registry)): one set
of received/abandoned/answered columns per line. With the default US registry the
column set is:

| Column | Type | Description |
|--------|------|-------------|
| `hour_start` | datetime | Hour interval start (UTC) |
| `hour_of_day` | int | Hour 0-23 |
| `nine_one_one_calls_received` | int | 9-1-1 calls received |
| `nine_one_one_calls_abandoned` | int | 9-1-1 calls abandoned |
| `non_emergency_calls_received` | int | Non-emergency calls received |
| `non_emergency_calls_abandoned` | int | Non-emergency calls abandoned |
| `outbound_calls_placed` | int | Outbound calls placed |
| `nine_one_one_answered_10s_pct` | float | % of 9-1-1 calls answered within 10 seconds |
| `nine_one_one_answered_15s_pct` | float | % of 9-1-1 calls answered within 15 seconds |
| `nine_one_one_answered_20s_pct` | float | % of 9-1-1 calls answered within 20 seconds |
| `nine_one_one_answered_40s_pct` | float | % of 9-1-1 calls answered within 40 seconds |
| `non_emergency_answered_10s_pct` | float | % of non-emergency calls answered within 10 seconds |
| `non_emergency_answered_15s_pct` | float | % of non-emergency calls answered within 15 seconds |
| `non_emergency_answered_20s_pct` | float | % of non-emergency calls answered within 20 seconds |
| `non_emergency_answered_40s_pct` | float | % of non-emergency calls answered within 40 seconds |
| `nine_one_one_mean_duration` | float | Mean phone duration (seconds) of 9-1-1 calls answered that hour |
| `non_emergency_mean_duration` | float | Mean phone duration (seconds) of non-emergency calls answered that hour |
| `outbound_mean_duration` | float | Mean phone duration (seconds) of outbound calls placed that hour |
| `call_mean_duration` | float | Volume-weighted mean of the three duration means across all calls |
| `total_emergency_calls` | int | Total emergency calls received across all emergency numbers |
| `total_nonemergency_calls` | int | Total non-emergency calls received (with floor constraint applied) |
| `total_calls` | int | Sum of all received + outbound calls |

`911` keeps the legacy `nine_one_one` column prefix for schema stability; every
other number uses an `emergency_<digits>` prefix. For example, `--country GB`
produces `emergency_999_calls_received`, `emergency_999_calls_abandoned`,
`emergency_999_answered_15s_pct`, `emergency_999_mean_duration`, and the same
set for `emergency_112`. The non-emergency line and the outbound counter are
always present regardless of country.

The `answered_Ns_pct` columns are simulated from the hour's per-call answer
times (see `REALISMGUIDE.md` → Answer Time Percentages), so they are always
consistent with the hour's received/abandoned counts: each value is a rounded
multiple of `100 / calls_received` and can never imply more answered calls than
were received and not abandoned. On fast, low-volume hours the value reaches
exactly 100.

The `*_mean_duration` columns are the per-hour sample mean of the lognormal
phone durations drawn per answered call (received minus abandoned; outbound
calls have no abandonment), and `call_mean_duration` is the volume-weighted
average of those means. An hour with no answered calls in a category reports
`0.0` for that category's mean.

---

## Realism Features

The built-in default distributions — agency split, priority weights, problem
vocabularies, lognormal time profiles, diurnal patterns, hourly phone metrics,
call reception methods, and disposition codes — are described in the
[Realism Guide](REALISMGUIDE.md).

---

## Examples

### Basic Generation

```bash
# Default: 10K incidents + hourly counts, CSV, Kansas City
uv run SynthCCD generate

# Custom row count
uv run SynthCCD generate --rows 50000

# Different area
uv run SynthCCD generate --area "Seattle, WA"
```

### Output Formats

```bash
# Parquet for analytics
uv run SynthCCD generate --format parquet --rows 100000

# JSON bundle for web API
uv run SynthCCD generate --format json

# In-memory pandas (for Jupyter/notebooks)
uv run SynthCCD generate --format pandas
```

### Dataset Selection

```bash
# Only CAD incidents
uv run SynthCCD generate --dataset incidents

# Only hourly phone metrics
uv run SynthCCD generate --dataset phone

# Both incidents and hourly phone metrics
uv run SynthCCD generate --dataset all
```

### Date Range

```bash
# Specific date range
uv run SynthCCD generate --start-date 2024-01-01 --end-date 2024-03-31

# Single day
uv run SynthCCD generate --start-date 2024-07-04 --end-date 2024-07-04
```

### Reproducibility

```bash
# Fixed seed for reproducible results
uv run SynthCCD generate --seed 42

# Different personnel pools
uv run SynthCCD generate --calltaker-pool-size 20 --dispatcher-pool-size 15
```

### Custom Output Location

```bash
# Custom directory and filename stem
uv run SynthCCD generate --output-dir /data/exports --output-stem kc_911_2024
```

### Large-Scale Generation

```bash
# 1 million incidents in Parquet (efficient for large datasets)
uv run SynthCCD generate --rows 1000000 --format parquet --output-dir /big/data

# 5 million incidents with a tighter per-chunk memory budget
uv run SynthCCD generate --rows 5000000 --format parquet --max-memory-bytes 536870912
```

### Realism Configuration

```bash
# Use custom realism config to match a specific 9-1-1 center
uv run SynthCCD generate --config config/example_realism.yaml --rows 50000 --format parquet

# With custom output location
uv run SynthCCD generate --config my_center.yaml --rows 100000 --output-dir /data/exports --output-stem my_center_2024
```

See `REALISMGUIDE.md` for the full YAML reference, including the `name_locales`
section that controls the personnel-name locale blend (by default, personnel
names follow the country of the geocoded OSM area).

### Params Files

```bash
# Run with all parameters defined in a single file
uv run SynthCCD generate --params config/example_params.json

# Override individual values on top of the file
uv run SynthCCD generate --params config/example_params.json --rows 250000 --format csv

# YAML params file
uv run SynthCCD generate --params config/example_params.yaml
```

---

## Python API Usage

```python
from synth911gen3 import Synth911Application
from synth911gen3.addresses import OpenStreetMapAddressProvider
from synth911gen3.config import GenerationRequest, OutputFormat, DatasetKind
from pathlib import Path

# Create application
app = Synth911Application(address_provider=OpenStreetMapAddressProvider())

# Configure request
request = GenerationRequest(
    rows=50000,
    area_query="Denver, CO",
    output_format=OutputFormat.PARQUET,
    dataset=DatasetKind.ALL,
    output_dir=Path("data/denver"),
    output_stem="denver_911",
    start_date=date(2024, 1, 1),
    end_date=date(2024, 12, 31),
    seed=12345,
    shift_preset="2x12h-4shift-14day",
    max_memory_bytes=2 * 1024**3,  # per-chunk budget for CSV/Parquet streaming
    psap_agency="law",  # only LAW calls (PSAP filter)
)

# Generate (returns GenerationResult with DataFrames and file paths)
result = app.generate(request)

# Access DataFrames directly
incidents_df = result.incidents
hourly_df = result.hourly_call_counts

# Access exported file paths
for dataset_name, path in result.exported_artifacts.items():
    print(f"{dataset_name}: {path}")
```

### In-Memory DataFrames

```python
request = GenerationRequest(
    rows=10000,
    output_format=OutputFormat.PANDAS,  # or POLARS
    dataset=DatasetKind.INCIDENTS,
)

result = app.generate(request)
incidents_df = result.incidents  # pd.DataFrame
```

### Regression Signatures

For a statistical fingerprint of generated data (fractions, timing means,
diurnal shape, phone-metrics rates), see `synth911gen3.regression`. It powers
the realism-regression test suite; see REALISMGUIDE for the baseline workflow.

```python
from synth911gen3.regression import build_signature, compare, load_baseline
from pathlib import Path

current, phone = build_signature()  # deterministic reference generation
baseline = load_baseline(Path("tests/regression_baseline.json"))
issues = compare(current, baseline["incidents"])  # [] = within tolerance
```

---

## Troubleshooting

### Common Issues

#### "AddressLookupError: Failed to fetch addresses"
- Check internet connectivity (required for initial OSM fetch)
- Try a simpler area query: `"Kansas City"` instead of `"Kansas City, MO, USA"`
- Addresses are cached locally after first fetch

#### TLS errors on restricted networks (corporate proxy / MITM)

On networks where a TLS-inspecting proxy intercepts HTTPS traffic, Python and `uv` may reject the
proxy's certificate with errors like `invalid peer certificate: UnknownIssuer` or
`certificate verify failed: unable to get local issuer certificate`. The safe fix is to verify
against the **operating system trust store** instead of bundled CA lists (verification stays on):

```bash
# 1. Let uv use the OS trust store for package downloads
$env:UV_SYSTEM_CERTS = "true"      # PowerShell
# export UV_SYSTEM_CERTS=true       # Linux/macOS
uv sync

# 2. Let the generator use the OS trust store for OSM lookups (dev dependency: truststore)
$env:SYNTHCCD_SYSTEM_TRUST = "1"   # PowerShell
# export SYNTHCCD_SYSTEM_TRUST=1     # Linux/macOS
uv run SynthCCD generate
```

The runtime flag is a no-op unless set, so production behavior is unchanged. The OS trust store
is injected at most once per process (guarded internally), so calling it from the CLI and TUI
entry points together is harmless. If the OS trust store does not trust the proxy's issuer,
contact your network administrator instead — do not disable TLS verification.

When address lookups fail because of a certificate problem, the generator now reports the
underlying cause and points to this workaround, e.g.:

```
Unable to reach the OpenStreetMap Nominatim service: certificate verification failed
(unable to get local issuer certificate). If you are behind a TLS-inspecting proxy, set
SYNTHCCD_SYSTEM_TRUST=1 to verify against the OS trust store.
```

These connectivity failures raise `AddressConnectionError` (a subclass of
`AddressLookupError`), so existing callers that already catch `AddressLookupError` keep working.

#### "ExportError: Unsupported output format"
- Valid formats: `csv`, `parquet`, `json`, `yaml`, `pandas`, `polars`
- Case-insensitive

#### "ValidationError: start_date must be on or before end_date"
- Ensure `--start-date` ≤ `--end-date`
- Dates must be YYYY-MM-DD format

#### Large generation is slow
- Use `--format parquet` for large datasets (faster I/O)
- First run fetches OSM addresses; subsequent runs use cache
- Consider reducing `rows` for testing
- For runs that would exceed available RAM, lower `--max-memory-bytes` so CSV/Parquet export streams in chunks instead of holding the full frame

#### TUI won't launch
- Ensure `textual` is installed: `uv add textual`
- Terminal must support ANSI colors and mouse events

### Performance Tips

| Dataset Size | Recommended Format | Notes |
|--------------|-------------------|-------|
| < 50K rows | CSV | Fast enough, human-readable |
| 50K - 500K | Parquet | Columnar, compressed, fast analytics |
| > 500K | Parquet | Essential for memory efficiency |
| Any (Python) | pandas/polars | Zero-copy, in-memory |

### Cache Location

OpenStreetMap addresses are cached in:
```
~/.cache/synth911gen3/addresses_{area_hash}.parquet
~/.cache/synth911gen3/addresses_{area_hash}.meta.json   # country code sidecar
```

The `.meta.json` sidecar stores the ISO country code of the geocoded area (used
to select personnel name locales); it is written on fetch and read back on
cache hits. Delete both files to force a re-fetch for updated area boundaries.

---

## FAQ

### General

**Q: What is SynthCCD?**
A: A synthetic data generator that creates realistic 9-1-1 CAD incident data and hourly phone-center metrics. It simulates call volumes, response times, agency distributions, and geographic patterns based on configurable statistical models.

**Q: What data does it generate?**
A: Two datasets:
- **CAD Incidents**: Individual call records with timestamps, agency, priority, problem type, location, response times, personnel, disposition
- **Hourly Phone Metrics**: Aggregated call counts (911 received/abandoned, non-emergency received/abandoned, outbound) with answer-time percentages

**Q: Is the data realistic?**
A: Yes. Defaults are calibrated from real 9-1-1 center patterns. You can fully customize distributions via YAML realism config to match your specific center.

**Q: Can I use this for production/testing?**
A: Yes. It's designed for testing CAD systems, training dispatchers, capacity planning, and research. The data is synthetic — no real PII or sensitive information.

---

### Generation

**Q: How many rows can I generate?**
A: Tested up to 10M+ rows. For large runs, use `--format parquet --max-memory-bytes 1073741824` (1 GiB chunks). The generator streams data to avoid memory issues.

**Q: How do I make results reproducible?**
A: Use the same `--seed` value. With identical parameters and seed, output is byte-for-byte identical (except chunked exports which may differ in row order).

**Q: How do I generate data for a specific date range?**
A: Use `--start-date 2024-01-01 --end-date 2024-03-31`. Incidents are distributed across the range using realistic diurnal patterns.

**Q: Can I generate data for multiple areas?**
A: One run = one area. Run multiple times with different `--area` values and combine outputs.

**Q: How do I get coordinates for mapping?**
A: Use `--format geojson` or `--format shapefile`. Coordinates come from OSM address data. Synthesized addresses (fallback when OSM lacks house numbers) get 0,0 and are excluded from geospatial exports.

---

### Realism Configuration

**Q: Do I need a realism config?**
A: No. Built-in defaults are realistic for a typical US 9-1-1 center. Use `--config` only if you want to match a specific center.

**Q: How do I create a custom realism config?**
A: 1) Copy `config/example_realism.yaml`, 2) Analyze your real CAD data, 3) Replace values with your computed statistics, 4) Test with `--rows 1000 --format pandas`, 5) Iterate.

**Q: What are the most impactful parameters to tune?**
A: In order: `agency_weights`, `priority_weights`, `problem_profiles`, `time_profiles`, `hourly_weights`, `disposition_profiles`.

**Q: Can I add custom problem types?**
A: Yes. Add entries to `problem_profiles` in your realism YAML. Weights per priority pool must sum to 1.0.

**Q: How do seasonal multipliers work?**
A: Each problem type gets 4 multipliers [Winter, Spring, Summer, Fall]. Applied per-incident based on call month, then weights re-normalized per agency/priority pool.

---

### Output Formats

**Q: Which format should I use?**
| Use Case | Recommended |
|----------|-------------|
| Quick analysis, Excel | CSV |
| Analytics, large data | Parquet |
| Web APIs, JavaScript | JSON |
| Python notebooks | pandas/polars |
| GIS, mapping | GeoJSON |
| Desktop GIS (ArcGIS/QGIS) | Shapefile |
| Database pipelines | PostgreSQL, SQL Server, MariaDB, DuckDB, SQLite |

**Q: What's the difference between `json` and `geojson`?**
A: `json` exports all data as a flat bundle. `geojson` exports only incidents as RFC 7946 FeatureCollection with Point geometries for mapping.

**Q: Why are shapefile field names truncated?**
A: ESRI Shapefile format limits field names to 10 characters. `internal_reference_number` becomes `internal_r`. Use GeoJSON or Parquet for full names.

**Q: Can I stream directly to a database?**
A: Yes. Use `--format postgresql` (or `sqlserver`, `mariadb`, `duckdb`, `sqlite`) with connection parameters. Tables auto-created with indexes. `sqlite` is the simplest option — it writes a local file with no server or extra dependencies.

---

### Troubleshooting

**Q: "AddressLookupError: Failed to fetch addresses"**
A: Check internet connectivity. Try simpler area query. Addresses cached after first fetch.

**Q: TLS errors behind corporate proxy**
A: Set `UV_SYSTEM_CERTS=true` for `uv sync`, and `SYNTHCCD_SYSTEM_TRUST=1` for OSM lookups. Uses OS trust store.

**Q: Generation is slow**
A: Use Parquet format. First run fetches OSM addresses (cached). For large runs, lower `--max-memory-bytes` to stream chunks.

**Q: TUI won't launch**
A: Install `textual` (`uv add textual`). Terminal needs ANSI colors and mouse support.

**Q: "ValidationError: start_date must be on or before end_date"**
A: Ensure `--start-date` ≤ `--end-date`. Format: YYYY-MM-DD.

**Q: Out of memory on large runs**
A: Use `--max-memory-bytes` to limit chunk size (default 2 GiB). Or use database streaming export.

---

### Python API

**Q: How do I use in a Jupyter notebook?**
A: Use `output_format=OutputFormat.PANDAS` — returns DataFrames directly, no files written.

**Q: How do I add progress reporting?**
A: Pass `on_progress=lambda d, c, t: print(f"{d}: {c}/{t}")` to `app.generate()`.

**Q: Can I use custom address data?**
A: Yes. Implement the `AddressProvider` protocol and pass to
`Synth911Application(address_provider=CustomProvider())`. Implementing
`resolved_country()` (ISO 3166-1 alpha-2, or `None` when unknown) is optional —
when it is absent, personnel name locales fall back to the request's `--country`
flag, then to `US`.

---

### License & Support

**Q: What's the license?**
A: MIT License — free for commercial and non-commercial use.

**Q: Where to report issues?**
A: [GitHub Issues](https://github.com/trdunsworth/synth911gen3/issues)

**Q: Where's the changelog?**
A: `CHANGELOG.md` in the repository root.

---

## Development and Testing

```bash
uv run pytest tests/              # Run the test suite (enforces >= 80% coverage)
uv run ruff check .               # Lint
uv run ty check src               # Type-check
uv run python scripts/build_docs.py    # Build the HTML docs site into output/docs/
```

Coverage is enforced on every test run: `pyproject.toml` configures `--cov`
with a `fail_under = 80` threshold, so a run that drops below 80% exits non-zero.
CI also runs an explicit coverage check. Run just the summary without failing
with `uv run pytest tests/ -q --no-cov`.

### Building the Documentation

The API reference is generated from docstrings with Sphinx (`autodoc` +
`napoleon`, `bizstyle` theme). Source lives in `docsrc/` (`docs/` is reserved
for read-only v2-era reference material); the built site goes to
`output/docs/` and is not tracked by git.

```bash
uv run python scripts/build_docs.py          # build (HTML)
uv run python scripts/build_docs.py --clean  # wipe output/docs/ first
uv run python scripts/build_docs.py --strict # treat warnings as errors
```

Open `output/docs/index.html` in a browser to view the site. A clean,
warning-free build is required before publishing or in CI.

---

## Advanced Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `SYNTHCCD_LOG_LEVEL` | Logging verbosity: `DEBUG`, `INFO`, `WARNING`, or `ERROR` (used when no `--verbose`/`--quiet` flag is given) |
| `SYNTHCCD_SERVE_HOST` | Bind address for the API server (default `127.0.0.1`) |
| `SYNTHCCD_SERVE_PORT` | Listen port for the API server (default `8000`) |

### Extending with Custom Providers

```python
from synth911gen3.addresses import AddressProvider, Address
from synth911gen3.app import Synth911Application

class CustomAddressProvider(AddressProvider):
    def load_addresses(self, area_query: str) -> list[Address]:
        # Return list of Address objects
        return [...]

    def resolved_country(self) -> str | None:
        # Optional: ISO 3166-1 alpha-2 code of the region (e.g. "IE"), or None
        # when unknown so the request's --country flag is used instead.
        return None

app = Synth911Application(address_provider=CustomAddressProvider())
```

---

## License

MIT License - see LICENSE file for details.

---

## Support

- Issues: [GitHub Issues](https://github.com/trdunsworth/synth911gen3/issues)
- Documentation: This guide + inline code docstrings

---
