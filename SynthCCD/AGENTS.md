# AGENTS.md

You are an experienced Python developer working on this project under my guidance.

## Task

The task is to build a synthetic data generator that emulates data that could be found inside dispatch archival records and in phone equipment.

### Goals

Create software that can do the following:

1. Simulate CAD incident data that consists of:
   - Id number - This can be either an integer or a GUID, depending on the user's preference
   - Internal Reference number  
   - The internal reference number should be different by agency
   - Agency The minimum agency count must be 3: LAW, FIRE, and EMS
   - Problem Nature
   - Priority
   - Full address
     - prefix directional depending on location
     - street number
     - street name
     - street type
     - postfix directional depending on location
     - city
     - state
     - postal code
   - If an address is a business address or a known landmark then that should be reflected in a column on its own
   - Time stamps for events in the call's lifecycle
     - Call Start Time
     - Time Phone Pickup
     - Time Call Enters Queue
     - Time First Unit Assigned
     - Time Unit Enroute
     - Time Unit Arrived
     - Time Last Unit Cleared
     - Time Call Closed
   - Calltaker and Dispatcher
   - Method of Call Reception
     - 911
     - Phone
     - Radio
     - Walk In
     - Flag Down
   - Call Disposition
     - Report Issued
     - No Report Issued
     - Cancelled
     - No Action Taken
   - Elapsed number of seconds between timestamps

2. Simulate hourly centre call counts of:
   - 9-1-1 calls received
   - 9-1-1 calls abandoned
   - non-emergency calls received
   - non-emergency calls abandoned
   - outbound calls placed
3. Ensure that all distributions, such as elapsed times between events, are realistic for priority and agency.
4. Export all datasets as csv, parquet, pandas dataframe, polar dataframe, or JSON/YAML depending on the user's prefernce
5. Accessible through a TUI or a GUI depending on the user's preference
6. Generate real addresses using data from [Open Street Map](https://www.openstreetmap.org/)
7. Capapble of scaling to generate from hundreds to millions of rows of data at a time.
8. Allow the user to determine how many rows to generate, how it should be outputted, and what area to use for addresses with the following defaults: 10,000 rows in a csv file, and using Kansas City, MO as the default location.

### Improvements for Realistic Data Generation

Based on analysis of real CAD data, the following improvements should be implemented to enhance realism:

1. **Priority-Weighted Time Distributions**: Implement time profiles keyed by agency and priority to create realistic elapsed times between events. Use lognormal distributions with parameters calibrated to real data for each time interval (queue, dispatch, phone, turnout, travel).

2. **Config-Driven Design**: Implement a YAML-based configuration system to allow customization of:
   - Agency display names (e.g., POLICE instead of LAW)
   - Shift structures
   - Geographic zones (URBAN, SUBURBAN, RURAL)
   - Personnel counts per shift
   - Call volume patterns

3. **Enhanced Address Generation**: Use the overpy library to fetch real addresses from OpenStreetMap dynamically rather than reusing a fixed pool of addresses.

4. **Improved Personnel Modeling**: 
   - Separate calltaker and dispatcher pools with independent staffing levels
   - Realistic name generation with ASCII normalization
   - Zipf-like workload weighting for name assignment
   - Late-shift dispatch time penalties

5. **Diurnal Call Volume Patterns**: Implement hourly weights to create realistic call arrival patterns throughout the day, with peaks during afternoon/midday and valleys during night hours.

6. **Geographic Zone Multipliers**: Implement zone-based multipliers for travel times to account for urban/suburban/rural differences.

7. **Enhanced Disposition and Call Reception Modeling**: Use real-world distributions for dispositions and call reception methods with agency-specific weights.

8. **Parallel Dispatch and Call-Taking Timelines**: Model dispatch and call-taking as separate timelines where high-priority calls can be dispatched while the call is still in progress.

9. **Separate Turnout and Travel Times**: Split enroute_time into distinct turnout_time (station response) and travel_time (wheels-rolling to on-scene) components.

10. **Priority-Weighted Problem Selection**: Weight problem selection by priority distribution rather than using uniform sampling.

11. **Enhanced Call Reception Methods**: Use real-world distributions for call reception methods with proper vocabulary (Phone, E-911, OFFICER, Radio, etc.).

12. **Improved Disposition Codes**: Use real CAD codes with human-readable labels instead of plain English strings.

13. **Incident Start Time Field**: Add a separate incident_start_time field that differs from event_time by a small offset (0-30 seconds).

14. **Configurable Personnel Assignment**: Implement separate pools for calltakers and dispatchers with realistic workload distributions.

You can examine the files in the source folder and use them as guidance. You may not alter any of these files. You may not use any names you find in these files for any dispatcher or calltaker names. You may use these files for calculations and distribution percentages to make the output data more realistic. You may not copy values over to the generated output.

You may also consult the .md files in the docs folder for recommendations that were generated from the previous version. They are suggestions and you may incorporate them if they prove valuable. You are also welcome to disregard any of them.

Version 2 of this work, that you will replace, can be found at [https://github.com/trdunsworth/synth911gen2](https://github.com/trdunsworth/synth911gen2). You may consult the files in that repo to see how the previous version has been constructed.

Please place all tests in the tests file so I can review them later.

All outputted files should go into the output folder for now. That will change after a few iterations when we prepare for deployment

Check to see if uv is installed and updated before trying to install it.

## Documentation Maintenance

Every code change that affects user-facing behavior must keep the guides in sync.
Before finishing any task, update these files to reflect the change:

- `USERSGUIDE.md` — CLI flags, TUI fields, configuration parameters, params-file keys,
  generated data schema/columns, examples, Python API usage, environment variables.
- `REALISMGUIDE.md` — YAML realism configuration sections and validation rules,
  default distributions, and realism feature behavior.
- `TODO.md` — mark completed items done (and split or note partially-completed items).

A change is not complete until the relevant guides are updated.

## Tech Stack

- Framework: Python, Faker, Numpy, SciPy, pandas, overpy, pydantic, polars,
  textual, typer, fastapi/uvicorn, httpx, pyarrow, geopandas, shapely,
  sqlalchemy, duckdb
- Language: Python
- Package Manager: uv
- Validation: ruff
- Testing: pytest

## UV Package Manager

### Initial Setup

curl -LsSf <https://astral.sh/uv/install.sh> | sh
uv venv
source .venv/bin/activate  # Linux/Mac

### Dependency Management

- `uv sync` - Install from lock file
- `uv add boto3` - Add runtime dependency
- `uv add --group dev pytest` - Add dev dependency
- `uv add "fastapi>=0.110,<1"` - Add with version constraint
- `uv lock` - Update lock file
- `uv run <command>` - Run command in venv

### Important

- Commit `uv.lock` for reproducibility
- Use `uv sync` for consistent environments

## Environment Setup

- Python 3.12+
- Initialize project: `uv init SynthCCD`
- Create environment: `uv venv && source .venv/bin/activate`
- Install dependencies: `uv sync`
- Lock environment: `uv lock`

## Local Network Notes (this machine)

This machine sits behind a TLS-inspecting proxy. Python's bundled CA list and uv's default
rustls roots do not trust the proxy's issuer, so TLS fails with `invalid peer certificate:
UnknownIssuer`. Safe workaround (verification stays on):

- `uv sync` / `uv add`: prefix with `UV_SYSTEM_CERTS=true`
- Runtime OSM lookups: set `SYNTHCCD_SYSTEM_TRUST=1` (uses the dev-only `truststore` package
  via `synth911gen3.tls.maybe_inject_system_trust()` to verify against the OS trust store)

## Commands

- Install package: `uv add` + package name
- Run tests: `uv run pytest tests/*`
- Lint files: `uv run ruff check`
- Type hinting `uv run ty check`

## Code Style

- Python: Follow PEP 8 using ruff
- Formatting: Ruff
- Type Hinting: Ty
- Never hardcode any credentials

## Testing

- Framework: pytest
- Unit Tests: `uv run pytest tests/`
- Coverage requirement: 80%+ for new code

## Project Structure

- `src/synth911gen3/` - The live package (CLI, TUI, server, generators)
- `docs/` - Read-only v2-era reference scripts (e.g., `synth911.py`, `synthgui.py`),
  architecture decision records (`docs/adr/`), and recommendation guidance
- `output/` - Location of generated files
- `tests/` - pytest suite
- `config/` - Example params and realism-config files
- `scripts/` - Developer/CI helpers

## Permissions

### Allowed without prompting

- Read files
- Write tests
- List Directories
- Single file linting, type checking, formatting
- Unit tests on specifc files

### Require approval

- Package installation outside of base files (`uv add`)
- Git operations (`git push`, `git commit`)
- File deletion
- Running full build

### Not allowed

- Alter files in `docs/` (read-only v2-era reference material)
- Delete project

## PR Requirements

- Title format: [component] Brief description
- Always run `uv run pytest && uv run ruff check .` before committing
- Keep diffs small and focused
- Tests required for new features
- All CI checks must pass
