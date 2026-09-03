# DMA Reporting Engine

Multi-language 9-1-1 dispatch analytics platform for generating performance reports, compliance analysis, and operational dashboards.

## Overview

This project analyzes synthetic CAD (Computer-Assisted Dispatch) and phone data from a 9-1-1 center, producing reports for four target audiences:

| Audience | Focus |
|----------|-------|
| Executive Staff | High-level trends, KPIs, strategic insights |
| Operational Management | Compliance standards, performance metrics, resource allocation |
| Shift Supervisors | Personnel performance, shift-specific trends |
| QA/QI Managers | Quality assurance, call handling protocols, disposition analysis |
| Analysts & Researchers | Advanced statistics, spatial analysis, forecasting, research insights |

## AI Agents

This project includes AI agents specialized for different audiences that can analyze the dispatch data using multiple programming languages:

| Agent | Audience | Focus |
|-------|----------|-------|
| [Executive Staff Agent](agents/executive_staff_agent.md) | Upper management | Strategic insights, trend identification |
| [Operational Management Agent](agents/operational_management_agent.md) | Middle management | Compliance, performance optimization |
| [Shift Supervisor Agent](agents/shift_supervisor_agent.md) | Team supervisors | Personnel performance, shift trends |
| [Analyst & Researcher Agent](agents/analyst_researcher_agent.md) | Data scientists | Advanced statistics, predictive modeling |

**Agent Capabilities:**
- Use Python, R, Julia, or SQL for analyses
- Generate reports and visualizations
- Answer questions about the dataset
- Provide actionable insights based on industry standards
- Show their work and methodology

For detailed information, see the [agents/README.md](agents/README.md) file.

## Data

| File | Description | Rows × Cols |
|------|-------------|-------------|
| `IndyMo_incidents.csv` | Individual incident records (2026-08-10 → 2026-08-16) | 1,082 × 48 |
| `IndyMo_hourly_call_counts.csv` | Hourly call volume aggregation | 168 × 22 |

## Performance Standards

| Standard | Metric | Target |
|----------|--------|--------|
| NENA | Answer time | 90% ≤ 15s, 95% ≤ 20s |
| APCO | Answer time | 90% ≤ 20s, 75% ≤ 10s |
| NFPA 1710 | Alarm processing | 64s (90th), 106s (95th) |
| NFPA 1710 | Turnout time | 60s (90th), 80s (95th) |
| NFPA 1710 | Travel time | 240s (90th) |

## Project Structure

```
DMA_reporting_engine_1/
├── data/                          # Source data (read-only)
│   ├── IndyMo_incidents.csv
│   └── IndyMo_hourly_call_counts.csv
├── agents/                        # AI agent definitions
│   ├── README.md                  # Agent overview and usage
│   ├── executive_staff_agent.md   # Executive audience agent
│   ├── operational_management_agent.md  # Middle management agent
│   ├── shift_supervisor_agent.md  # Shift supervisor agent
│   └── analyst_researcher_agent.md # Data scientist agent
├── palettes/                      # Visualization brand colors
│   ├── common/
│   │   └── palette.json           # Single source of truth
│   ├── python/dma_palette/
│   ├── r/
│   ├── julia/
│   └── sql/
├── python/                        # Python analysis code
├── R/                             # R analysis code
├── julia/                         # Julia analysis code
├── docs/                          # Documentation
├── base.ipynb                     # Scaffold notebook (EDA)
├── PYTHON.md                      # Python analysis specification
├── R.md                           # R analysis specification
├── JULIA.md                       # Julia analysis specification
├── SQL.md                         # SQL/duckdb/ggsql specification
├── TODO.md                        # Task tracking
├── CHANGELOG.md                   # Version history
├── pyproject.toml                 # Python dependencies
└── README.md                      # This file
```

## Quick Start

### Python

```bash
# Install dependencies
uv sync

# Run EDA notebook
jupyter lab base.ipynb
```

```python
import pandas as pd
import plotnine as p9
import sys
sys.path.insert(0, 'palettes/python')
import dma_palette as dma

# Load data
incidents = pd.read_csv('data/IndyMo_incidents.csv', parse_dates=['call_received_datetime'])

# Demand curve (grammar of graphics)
(p9.ggplot(incidents, p9.aes(x='call_received_datetime'))
 + p9.geom_histogram(bins=168, fill=dma.DMA_BLUE)
 + p9labs(title='Weekly Demand Curve', x='Time', y='Incidents')
 + dma.theme_dma())
```

### R

```r
source("palettes/r/dma_palette.R")
source("R/ingest.R")
source("R/standards.R")

library(ggplot2)
library(dplyr)

incidents <- ingest_incidents("data/IndyMo_incidents.csv")

ggplot(incidents, aes(x = call_received_datetime)) +
  geom_histogram(bins = 168, fill = dma_qualitative(1)[1]) +
  labs(title = "Weekly Demand Curve", x = "Time", y = "Incidents") +
  theme_minimal()
```

### Julia

```julia
include("julia/ingest.jl")
include("julia/standards.jl")
include("palettes/julia/DMA_Palettes.jl")

using .DMA_Palettes, DataFrames, AlgebraOfGraphics, CairoMakie

incidents = ingest_incidents("data/IndyMo_incidents.csv")
```

### SQL (duckdb + ggsql)

```sql
INSTALL json; LOAD json;
READ 'palettes/sql/dma_palette.sql';

-- Query with brand colors
SELECT
    DATE_TRUNC('hour', call_received_datetime) AS hour,
    COUNT(*) AS incident_count,
    CASE
        WHEN COUNT(*) > 25 THEN '#C40000'  -- error
        WHEN COUNT(*) > 15 THEN '#E88800'  -- warning
        ELSE '#009933'                      -- success
    END AS bar_color
FROM read_csv_auto('data/IndyMo_incidents.csv')
GROUP BY 1
ORDER BY 1;
```

## Analysis Specifications

Each language has a detailed specification document:

| Document | Sections | Description |
|----------|----------|-------------|
| `PYTHON.md` | 14 | Python stack, plotnine GoG, statsmodels, scikit-learn |
| `R.md` | 14 | Tidyverse/ggplot2, broom, caret, survival |
| `JULIA.md` | 14 | DataFrames.jl, AlgebraOfGraphics, Survival.jl |
| `SQL.md` | 14 | duckdb analytics, ggsql visualization |

### Key Analyses

**Exploratory Data Analysis (EDA)**
- Demand curve (hourly histogram)
- Day-of-week patterns
- Shift performance comparison
- Call type distribution
- Response time distributions
- Geographic heatmap

**Advanced Analytics**
- NENA/NFPA 1710 compliance testing
- Survival analysis (time-to-event)
- Queueing theory (M/M/c models)
- Mixed-effects modeling (shift random effects)
- STL decomposition + ARIMA/ETS forecasting
- Process capability (Cp, Cpk)
- Control charts (X-bar, R)
- Spatial hotspot analysis (Getis-Ord Gi*)
- Pareto analysis (80/20 rule)
- Outlier detection (IQR, DBSCAN)

## Palettes

All visualization colors are managed through `palettes/common/palette.json`:

```python
# Python
dma.get_palette("qualitative", n=8)
dma.get_palette("Blues", n=9)

# R
dma_qualitative(8)
dma_sequential("Blues", 9)

# Julia
qualitative(8)
sequential("Blues", 9)
```

**Brand Colors:**
| Color | Hex | Use |
|-------|-----|-----|
| Blue | `#0077CC` | Primary brand |
| Teal | `#00B3B3` | Secondary accent |
| Error | `#FF1A1A` | Errors, critical |
| Warning | `#FF9F00` | Warnings, caution |
| Success | `#00B33B` | Success, positive |

## Dependencies

### Python
- duckdb, plotnine, pandas, numpy, scipy
- statsmodels, scikit-learn, hierarchicalforecast
- matplotlib, seaborn, pydantic

### R
- tidyverse, ggplot2, broom, lubridate
- pointblank (data validation)

### Julia
- DataFrames.jl, CSV.jl, Statistics
- AlgebraOfGraphics.jl, CairoMakie.jl

### SQL
- duckdb, json extension

## TODO

See [TODO.md](TODO.md) for the full task list.

## License

Dunsworth, Mann, and Associates, LLC
