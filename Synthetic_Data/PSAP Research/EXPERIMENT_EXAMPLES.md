# PSAP Research — Experiment Examples Library

> **Ready-to-run experiment configurations for common staffing research questions**

---

## Quick Reference: Available Experiments

| Experiment | Config File | Research Question | Duration |
|------------|-------------|-------------------|----------|
| **E1** Baseline vs +1 Medic | `staffing_comparison_001.yaml` | Does adding 1 medic improve fractile compliance? | 2 hrs |
| **E2** Dose-Response | `medic_dose_response.yaml` | Marginal benefit of each additional medic | 3 hrs |
| **E3** Peak Staffing | `peak_staffing_comparison.yaml` | Fixed overlay vs ML-driven dynamic | 3 hrs |
| **E4** Station Closure Equity | `station_closure_equity.yaml` | Equity impact of station closure | 2 hrs |
| **E5** Cross-Staffing Tradeoffs | `cross_staffing_tradeoffs.yaml` | Engine+Medic vs separate units | 2 hrs |
| **E6** Volume Surge | `volume_surge_sensitivity.yaml` | Performance under 120%/150% volume | 2 hrs |
| **E7** Station Placement | `station_placement_optimization.yaml` | Optimal location for new station | 3 hrs |
| **E8** Mutual Aid Optimization | `mutual_aid_optimization.yaml` | Optimal auto-aid agreements | 3 hrs |
| **E9** Cross-Staffing vs Separate | `crossstaffing_vs_separate.yaml` | Engine+Medic combo vs separate units | 2 hrs |
| **E10** Dynamic vs Fixed | `dynamic_vs_fixed_staffing.yaml` | ML-driven vs rule-based | 3 hrs |

---

## Experiment 1: Baseline vs +1 Medic (E1)

**Research Question**: Does adding 1 medic unit at Station 2 improve Priority 1 fractile compliance?

### Configuration

```yaml
# config/experiments/staffing_comparison_001.yaml
experiment:
  name: "Staffing_Comparison_Baseline_vs_Add_Medic"
  description: "Does adding 1 medic at Station 2 improve Priority 1 fractile compliance?"
  version: "1.0"
  
  fixed:
    town_gpkg: "DATA/synthetic_towns/town_v1.gpkg"
    routing_graph: "DATA/synthetic_towns/graph.pkl"
    incidents_parquet: "DATA/synthetic_towns/incidents_50k.parquet"
    date_range: ["2024-01-01", "2024-12-31"]
    realism_config: "config/realism/my_center.yaml"
    random_seed: 4242
    
  scenarios:
    - name: "Baseline"
      staffing_config: "config/staffing_scenarios/baseline.yaml"
      label: "Current Staffing (Baseline)"
      color: "#1f77b4"
      
    - name: "Add_Medic_Stn2"
      staffing_config: "config/staffing_scenarios/add_medic_stn2.yaml"
      label: "Add Medic at Station 2"
      color: "#ff7f0e"
      
  replications: 30
  parallel_jobs: 8
  
  metrics:
    - response_time_fractiles
    - unit_utilization
    - coverage_gaps
    - cost_metrics
    - fractile_compliance
    
  analysis:
    paired_test: true
    confidence_level: 0.95
    effect_size_threshold: 0.2
    multiple_correction: "bonferroni"
```

### Staffing Config: Add Medic at Station 2

```yaml
# config/staffing_scenarios/add_medic_stn2.yaml
scenario:
  name: "Add_Medic_Stn2"
  version: "1.0"
  description: "Baseline + 1 Medic at Station 2"
  inherits: "baseline"
  
  stations:
    Station_2:
      apparatus:
        - id: "Engine_2"
          type: "Engine"
          count: 1
          cross_staffed_with: null
          minimum_staffing: 3
        - id: "Medic_2"
          type: "Medic"
          count: 2          # CHANGED: was 1
          cross_staffed_with: null
          minimum_staffing: 2
    minimum_manning: 4      # CHANGED: was 3
```

### Expected Results Template

```json
{
  "metric": "p90_response_time_priority_1",
  "Baseline": {"mean": 485.2, "std": 42.1, "median": 478.0},
  "Add_Medic_Stn2": {"mean": 421.3, "std": 38.7, "median": 415.0},
  "difference": {"mean": -63.9, "pct_change": -13.2},
  "paired_t_test": {"t_stat": -8.42, "p_value": 1.2e-9, "ci_95": [-78.3, -49.5]},
  "effect_size": {"cohens_d": -1.54, "interpretation": "large"},
  "cost_benefit": {
    "additional_annual_cost": 120000,
    "time_saved_per_incident_sec": 64,
    "annual_incidents": 15000,
    "total_time_saved_hours": 267,
    "cost_per_second_saved": 1875
  }
}
```

---

## Experiment 2: Medic Dose-Response (E2)

**Research Question**: What is the marginal benefit of each additional medic unit?

### Configuration

```yaml
# config/experiments/medic_dose_response.yaml
experiment:
  name: "Medic_Dose_Response"
  description: "Marginal benefit curve for additional medic units"
  version: "1.0"
  
  fixed:
    town_gpkg: "DATA/synthetic_towns/town_v1.gpkg"
    routing_graph: "DATA/synthetic_towns/graph.pkl"
    incidents_parquet: "DATA/synthetic_towns/incidents_50k.parquet"
    date_range: ["2024-01-01", "2024-12-31"]
    realism_config: "config/realism/my_center.yaml"
    random_seed: 4242
    
  scenarios:
    - name: "0_Medics_Added"
      staffing_config: "config/staffing_scenarios/baseline.yaml"
      label: "Baseline (0 added)"
      dose: 0
      
    - name: "1_Medic_Added"
      staffing_config: "config/staffing_scenarios/add_1_medic.yaml"
      label: "+1 Medic"
      dose: 1
      
    - name: "2_Medics_Added"
      staffing_config: "config/staffing_scenarios/add_2_medics.yaml"
      label: "+2 Medics"
      dose: 2
      
    - name: "3_Medics_Added"
      staffing_config: "config/staffing_scenarios/add_3_medics.yaml"
      label: "+3 Medics"
      dose: 3
      
    - name: "4_Medics_Added"
      staffing_config: "config/staffing_scenarios/add_4_medics.yaml"
      label: "+4 Medics"
      dose: 4
      
  replications: 20
  parallel_jobs: 8
  
  analysis:
    dose_response: true
    model: "linear"  # or "logistic", "exponential", "saturating"
    plot_marginal_benefit: true
```

### Dose-Response Analysis Output

```python
# Generated analysis includes:
# 1. Marginal benefit curve (response time improvement per added medic)
# 2. Diminishing returns detection
# 3. Optimal stopping point (cost-benefit inflection)
# 4. Confidence bands on dose-response curve

# Example output:
{
  "dose_response": {
    "model": "saturating_exponential",
    "params": {"asymptote": 350, "rate": 0.45, "baseline": 485},
    "marginal_benefits": {
      "0_to_1": {"time_saved": 64, "cost_per_sec": 1875},
      "1_to_2": {"time_saved": 32, "cost_per_sec": 3750},
      "2_to_3": {"time_saved": 16, "cost_per_sec": 7500},
      "3_to_4": {"time_saved": 8, "cost_per_sec": 15000}
    },
    "optimal_stopping": {
      "by_cost_per_sec_threshold_5000": 2,
      "by_marginal_benefit_lt_10sec": 3
    }
  }
}
```

---

## Experiment 3: Peak Staffing Comparison (E3)

**Research Question**: Does ML-driven dynamic peak staffing outperform fixed overlay shifts?

### Configuration

```yaml
# config/experiments/peak_staffing_comparison.yaml
experiment:
  name: "Peak_Staffing_Comparison"
  description: "Fixed overlay vs ML-driven dynamic peak staffing"
  version: "1.0"
  
  fixed:
    town_gpkg: "DATA/synthetic_towns/town_v1.gpkg"
    incidents_parquet: "DATA/synthetic_towns/incidents_50k.parquet"
    date_range: ["2024-01-01", "2024-12-31"]
    realism_config: "config/realism/my_center.yaml"
    random_seed: 4242
    
  scenarios:
    - name: "Baseline_No_Peak"
      staffing_config: "config/staffing_scenarios/baseline.yaml"
      label: "No Peak Overlay"
      
    - name: "Fixed_Overlay_10_22"
      staffing_config: "config/staffing_scenarios/peak_overlay_10_22.yaml"
      label: "Fixed Overlay 10:00-22:00"
      
    - name: "Fixed_Overlay_12_20"
      staffing_config: "config/staffing_scenarios/peak_overlay_12_20.yaml"
      label: "Fixed Overlay 12:00-20:00"
      
    - name: "Dynamic_ML_Peak"
      staffing_config: "config/staffing_scenarios/dynamic_ml_peak.yaml"
      label: "ML-Driven Dynamic Peak"
      
    - name: "Rule_Based_Dynamic"
      staffing_config: "config/staffing_scenarios/rule_based_dynamic.yaml"
      label: "Rule-Based Dynamic (Utilization > 0.8)"
      
  replications: 30
  metrics:
    - response_time_fractiles
    - cost_metrics
    - unit_utilization
    - coverage_gaps
    
  analysis:
    paired_test: true
    cost_effectiveness: true
    peak_hour_analysis: true  # Focus on 10-22 hours
```

### Peak Overlay Config

```yaml
# config/staffing_scenarios/peak_overlay_10_22.yaml
scenario:
  name: "Peak_Overlay_10_22"
  inherits: "baseline"
  
  overlay_shifts:
    - name: "PEAK_AM"
      label: "PEAK 10-14"
      hours: [10, 14]
      staffing:
        Station_1:
          Medic_1: {paramedics: 2}  # additional
        Station_2:
          Medic_2: {paramedics: 2}  # additional
    - name: "PEAK_PM"
      label: "PEAK 14-22"
      hours: [14, 22]
      staffing:
        Station_1:
          Medic_1: {paramedics: 2}
        Station_2:
          Medic_2: {paramedics: 2}
```

---

## Experiment 4: Station Closure Equity Analysis (E4)

**Research Question**: What is the equity impact of closing Station 2?

### Configuration

```yaml
# config/experiments/station_closure_equity.yaml
experiment:
  name: "Station_2_Closure_Equity"
  description: "Equity impact of closing Station 2"
  version: "1.0"
  
  fixed:
    town_gpkg: "DATA/synthetic_towns/town_v1.gpkg"
    incidents_parquet: "DATA/synthetic_towns/incidents_50k.parquet"
    date_range: ["2024-01-01", "2024-12-31"]
    realism_config: "config/realism/my_center.yaml"
    random_seed: 4242
    demographics_geojson: "DATA/demographics/tract_demographics.geojson"
    
  scenarios:
    - name: "Baseline_All_Stations"
      staffing_config: "config/staffing_scenarios/baseline.yaml"
      label: "All 3 Stations Open"
      
    - name: "Station_2_Closed"
      staffing_config: "config/staffing_scenarios/station_2_closure.yaml"
      label: "Station 2 Closed"
      
    - name: "Station_2_Closed_Mitigated"
      staffing_config: "config/staffing_scenarios/station_2_closure_mitigated.yaml"
      label: "Station 2 Closed + Peak Overlay"
      
    - name: "Station_2_Closed_Regional"
      staffing_config: "config/staffing_scenarios/station_2_closure_regional.yaml"
      label: "Station 2 Closed + Regional Mutual Aid"
      
  replications: 30
  metrics:
    - response_time_fractiles
    - equity_metrics
    - coverage_gaps
    - cost_metrics
    - fractile_compliance
    
  analysis:
    paired_test: true
    equity_analysis: true
    demographic_quintiles: true
    demographic_field: "median_income"
    geographic_disparity_map: true
```

### Station Closure Config

```yaml
# config/staffing_scenarios/station_2_closure.yaml
scenario:
  name: "Station_2_Closure"
  inherits: "baseline"
  
  stations:
    Station_2:
      apparatus: {}  # CLOSED
      minimum_manning: 0
      capabilities: []
      
    # Redistribute Station_2 resources
    Station_1:
      apparatus:
        - id: "Engine_1"
          type: "Engine"
          count: 1
        - id: "Medic_1"
          type: "Medic"
          count: 1
        - id: "Engine_2_Transferred"  # from Station_2
          type: "Engine"
          count: 1
          cross_staffed_with: null
          minimum_staffing: 3
      minimum_manning: 6  # Increased
      
    Station_3:
      apparatus:
        - id: "Engine_3"
          type: "Engine"
          count: 1
        - id: "Medic_2_Transferred"  # from Station_2
          type: "Medic"
          count: 1
          minimum_staffing: 2
      minimum_manning: 4
```

### Equity Analysis Output

```python
# Generated equity analysis includes:
{
  "equity_analysis": {
    "response_time_by_income_quintile": {
      "Baseline": {
        1: {"median": 485, "p90": 620, "count": 1200},
        2: {"median": 490, "p90": 630, "count": 1180},
        3: {"median": 510, "p90": 660, "count": 1150},
        4: {"median": 545, "p90": 700, "count": 1100},
        5: {"median": 580, "p90": 750, "count": 1050}
      },
      "Station_2_Closed": {
        1: {"median": 520, "p90": 680, "count": 1200},
        2: {"median": 540, "p90": 710, "count": 1180},
        3: {"median": 590, "p90": 780, "count": 1150},
        4: {"median": 650, "p90": 850, "count": 1100},
        5: {"median": 720, "p90": 920, "count": 1050}
      }
    },
    "max_disparity_pct": {
      "Baseline": {"priority_1": 19.6, "priority_2": 18.2, "priority_3": 17.8},
      "Station_2_Closed": {"priority_1": 38.5, "priority_2": 36.1, "priority_3": 33.4}
    },
    "disparity_increase_pct": {
      "priority_1": 96.4,
      "priority_2": 98.4,
      "priority_3": 87.6
    },
    "statistical_significance": {
      "priority_1": {"t_stat": 12.4, "p_value": "2.1e-15", "disparity_increase_sig": true}
    }
  }
}
```

---

## Experiment 5: Cross-Staffing Tradeoffs (E5)

**Research Question**: Engine+Medic cross-staffing vs separate units — what's the tradeoff?

### Configuration

```yaml
# config/experiments/cross_staffing_tradeoffs.yaml
experiment:
  name: "Cross_Staffing_Tradeoffs"
  description: "Engine+Medic cross-staffing vs separate units at Station 1"
  version: "1.0"
  
  fixed:
    town_gpkg: "DATA/synthetic_towns/town_v1.gpkg"
    incidents_parquet: "DATA/synthetic_towns/incidents_50k.parquet"
    date_range: ["2024-01-01", "2024-12-31"]
    realism_config: "config/realism/my_center.yaml"
    random_seed: 4242
    
  scenarios:
    - name: "Separate_Units"
      staffing_config: "config/staffing_scenarios/separate_engine_medic.yaml"
      label: "Separate Engine + Medic"
      
    - name: "Cross_Staffed_Engine_Medic"
      staffing_config: "config/staffing_scenarios/cross_staffed_engine_medic.yaml"
      label: "Cross-Staffed Engine+Medic"
      
    - name: "Hybrid_Approach"
      staffing_config: "config/staffing_scenarios/hybrid_crossstaff.yaml"
      label: "Hybrid: Cross-staff Day, Separate Night"
      
  replications: 30
  metrics:
    - response_time_fractiles
    - unit_utilization
    - fire_vs_ems_response_split
    - simultaneous_call_handling
    - cost_metrics
    
  analysis:
    paired_test: true
    fire_vs_ems_split: true  # Separate fire vs EMS response times
```

### Cross-Staffing Config

```yaml
# config/staffing_scenarios/cross_staffed_engine_medic.yaml
scenario:
  name: "Cross_Staffed_Engine_Medic"
  inherits: "baseline"
  
  stations:
    Station_1:
      apparatus:
        - id: "Engine_1"
          type: "Engine"
          count: 1
          cross_staffed_with: "Medic_1"
          minimum_staffing: 3  # 3 personnel cover both
      minimum_manning: 3
      
  cross_staffing_rules:
    - primary: "Engine_1"
      secondary: "Medic_1"
      rule: "if_engine_busy_medic_available"
      condition: "engine_committed AND medic_available"
      priority: 1
```

---

## Experiment 6: Volume Surge Sensitivity (E6)

**Research Question**: How do staffing configs perform under 120%/150% volume surge?

### Configuration

```yaml
# config/experiments/volume_surge_sensitivity.yaml
experiment:
  name: "Volume_Surge_Sensitivity"
  description: "Staffing performance under volume surge"
  version: "1.0"
  
  fixed:
    town_gpkg: "DATA/synthetic_towns/town_v1.gpkg"
    staffing_config: "config/staffing_scenarios/baseline.yaml"
    realism_config: "config/realism/my_center.yaml"
    random_seed: 4242
    
  scenarios:
    - name: "Volume_80%"
      volume_multiplier: 0.8
      label: "80% Volume (Low)"
      
    - name: "Volume_100%"
      volume_multiplier: 1.0
      label: "Baseline Volume"
      
    - name: "Volume_120%"
      volume_multiplier: 1.2
      label: "120% Volume (Surge)"
      
    - name: "Volume_150%"
      volume_multiplier: 1.5
      label: "150% Volume (Major Surge)"
      
  replications: 15
  metrics:
    - response_time_fractiles
    - coverage_gaps
    - unit_utilization
    - simultaneous_incidents
    - queue_depth
    
  analysis:
    sensitivity: true
    reference_scenario: "Volume_100%"
    surge_threshold_analysis: true  # At what volume does coverage break?
```

---

## Experiment 7: Station Placement Optimization (E7)

**Research Question**: Where should a new Station 4 be placed for optimal coverage?

### Configuration

```yaml
# config/experiments/station_placement_optimization.yaml
experiment:
  name: "Station_Placement_Optimization"
  description: "Optimal location for new Station 4"
  version: "1.0"
  
  fixed:
    town_gpkg: "DATA/synthetic_towns/town_v1.gpkg"
    incidents_parquet: "DATA/synthetic_towns/incidents_50k.parquet"
    date_range: ["2024-01-01", "2024-12-31"]
    realism_config: "config/realism/my_center.yaml"
    random_seed: 4242
    
  scenarios:
    - name: "No_New_Station"
      staffing_config: "config/staffing_scenarios/baseline.yaml"
      label: "3 Stations (Baseline)"
      
    - name: "Station_4_North"
      staffing_config: "config/staffing_scenarios/station_4_north.yaml"
      label: "New Station North"
      new_station_location: {x: 965000, y: 215000}
      
    - name: "Station_4_Southwest"
      staffing_config: "config/staffing_scenarios/station_4_southwest.yaml"
      label: "New Station Southwest"
      new_station_location: {x: 935000, y: 185000}
      
    - name: "Station_4_East"
      staffing_config: "config/staffing_scenarios/station_4_east.yaml"
      label: "New Station East"
      new_station_location: {x: 970000, y: 200000}
      
    - name: "Station_4_Optimal"
      staffing_config: "config/staffing_scenarios/station_4_optimal.yaml"
      label: "Optimized Location (Grid Search)"
      
  replications: 20
  metrics:
    - response_time_fractiles
    - coverage_gaps
    - equity_metrics
    - cost_metrics
    
  analysis:
    spatial_optimization: true
    coverage_improvement_map: true  # Generate heatmap
    cost_per_station: 2500000  # Capital + annual operating
```

---

## Experiment 8: Mutual Aid Optimization (E8)

**Research Question**: What mutual aid agreements minimize regional coverage gaps?

### Configuration

```yaml
# config/experiments/mutual_aid_optimization.yaml
experiment:
  name: "Mutual_Aid_Optimization"
  description: "Optimal auto-aid agreements for regional coverage"
  version: "1.0"
  
  fixed:
    region_gpkg: "DATA/synthetic_regions/metro_region.gpkg"
    incidents_parquet: "DATA/incidents/regional_100k.parquet"
    date_range: ["2024-01-01", "2024-12-31"]
    realism_config: "config/realism/regional.yaml"
    random_seed: 4242
    
  scenarios:
    - name: "No_Mutual_Aid"
      mutual_aid_config: "config/mutual_aid/none.yaml"
      label: "No Mutual Aid"
      
    - name: "Auto_Aid_Neighbors"
      mutual_aid_config: "config/mutual_aid/auto_aid_neighbors.yaml"
      label: "Auto-Aid Adjacent"
      
    - name: "Regional_Pool"
      mutual_aid_config: "config/mutual_aid/regional_pool.yaml"
      label: "Regional Resource Pool"
      
    - name: "Tiered_Response"
      mutual_aid_config: "config/mutual_aid/tiered_response.yaml"
      label: "Tiered (Auto-Aid → Regional → State)"
      
  replications: 20
  metrics:
    - coverage_gaps
    - mutual_aid_utilization
    - response_time_fractiles
    - regional_equity
    
  analysis:
    regional_analysis: true
    gap_reduction_per_agreement: true
```

---

## Experiment 9: Cross-Staffing vs Separate (E9)

**Research Question**: Engine+Medic cross-staffing vs separate dedicated units

### Configuration

```yaml
# config/experiments/crossstaffing_vs_separate.yaml
experiment:
  name: "CrossStaffing_vs_Separate"
  description: "Engine+Medic cross-staffed vs separate dedicated units"
  version: "1.0"
  
  fixed:
    town_gpkg: "DATA/synthetic_towns/town_v1.gpkg"
    incidents_parquet: "DATA/synthetic_towns/incidents_50k.parquet"
    date_range: ["2024-01-01", "2024-12-31"]
    realism_config: "config/realism/my_center.yaml"
    random_seed: 4242
    
  scenarios:
    - name: "Fully_Separate"
      staffing_config: "config/staffing/fully_separate.yaml"
      label: "Separate Engine + Separate Medic"
      
    - name: "Cross_Staffed_Day"
      staffing_config: "config/staffing/cross_staffed_day.yaml"
      label: "Cross-Staffed Day Only"
      
    - name: "Cross_Staffed_Always"
      staffing_config: "config/staffing/cross_staffed_always.yaml"
      label: "Cross-Staffed 24/7"
      
    - name: "Hybrid"
      staffing_config: "config/staffing/hybrid_crossstaff.yaml"
      label: "Cross-Staff Day, Separate Night"
      
  replications: 30
  metrics:
    - fire_response_times
    - ems_response_times
    - simultaneous_fire_ems
    - unit_utilization
    - cost_metrics
    
  analysis:
    fire_vs_ems_split: true
    simultaneous_call_analysis: true
```

---

## Experiment 10: Dynamic vs Fixed Staffing (E10)

**Research Question**: Does ML-driven dynamic staffing outperform fixed rules?

### Configuration

```yaml
# config/experiments/dynamic_vs_fixed_staffing.yaml
experiment:
  name: "Dynamic_vs_Fixed_Staffing"
  description: "ML-driven dynamic staffing vs rule-based fixed staffing"
  version: "1.0"
  
  fixed:
    town_gpkg: "DATA/synthetic_towns/town_v1.gpkg"
    incidents_parquet: "DATA/synthetic_towns/incidents_50k.parquet"
    date_range: ["2024-01-01", "2024-12-31"]
    realism_config: "config/realism/my_center.yaml"
    random_seed: 4242
    
  scenarios:
    - name: "Fixed_Baseline"
      staffing_config: "config/staffing_scenarios/baseline.yaml"
      label: "Fixed Baseline"
      
    - name: "Rule_Based_Dynamic"
      staffing_config: "config/staffing_scenarios/rule_based_dynamic.yaml"
      label: "Rule-Based Dynamic (Util > 0.8)"
      
    - name: "ML_Dynamic_Online"
      staffing_config: "config/staffing_scenarios/ml_dynamic_online.yaml"
      label: "ML Dynamic (Online Retrain)"
      
    - name: "ML_Dynamic_Batch"
      staffing_config: "config/staffing_scenarios/ml_dynamic_batch.yaml"
      label: "ML Dynamic (Weekly Retrain)"
      
  replications: 20
  metrics:
    - response_time_fractiles
    - cost_metrics
    - dynamic_actions_count
    - prediction_accuracy
    
  analysis:
    cost_effectiveness: true
    ml_vs_rules_comparison: true
    action_frequency_analysis: true
```

---

## Running Experiments

### Batch Run All Core Experiments

```bash
#!/bin/bash
# scripts/run_core_experiments.sh

EXPERIMENTS=(
  "staffing_comparison_001.yaml"
  "medic_dose_response.yaml"
  "peak_staffing_comparison.yaml"
  "station_closure_equity.yaml"
  "cross_staffing_tradeoffs.yaml"
  "volume_surge_sensitivity.yaml"
  "station_placement_optimization.yaml"
  "mutual_aid_optimization.yaml"
  "crossstaffing_vs_separate.yaml"
  "dynamic_vs_fixed_staffing.yaml"
)

for exp in "${EXPERIMENTS[@]}"; do
    echo "Running $exp..."
    uv run python -m psap_research.experiments.runner \
        config/experiments/$exp \
        --output-dir DATA/experiment_results/$(basename $exp .yaml)
done
```

### Sequential with Progress

```python
# scripts/run_experiments_sequential.py
import subprocess
import sys
from pathlib import Path

EXPERIMENTS = [
    "staffing_comparison_001.yaml",
    "medic_dose_response.yaml",
    "peak_staffing_comparison.yaml",
    "station_closure_equity.yaml",
    "cross_staffing_tradeoffs.yaml",
    "volume_surge_sensitivity.yaml",
    "station_placement_optimization.yaml",
    "mutual_aid_optimization.yaml",
    "crossstaffing_vs_separate.yaml",
    "dynamic_vs_fixed_staffing.yaml",
]

def run_experiment(exp_file):
    config_path = Path("config/experiments") / exp_file
    output_dir = Path("DATA/experiment_results") / exp_file.replace(".yaml", "")
    
    cmd = [
        "uv", "run", "python", "-m", "psap_research.experiments.runner",
        str(config_path),
        "--output-dir", str(output_dir)
    ]
    
    print(f"Running {exp_file}...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"  ✓ {exp_file} completed")
    else:
        print(f"  ✗ {exp_file} failed: {result.stderr[:200]}")
    return result.returncode == 0

if __name__ == "__main__":
    for exp in EXPERIMENTS:
        run_experiment(exp)
```

---

## Results Analysis Notebook Template

```python
# NOTEBOOKS/03_run_staffing_comparison.ipynb
"""
Experiment Analysis Notebook Template
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns

# Load results
results_dir = Path("../DATA/experiment_results/staffing_comparison_001")

# Load comparison report
with open(results_dir / "comparison_report.json") as f:
    report = json.load(f)

# Load replication data
def load_scenario_replications(scenario_dir):
    files = list(scenario_dir.glob("replication_*.parquet"))
    dfs = [pd.read_parquet(f) for f in files]
    return pd.concat(dfs, keys=range(len(dfs)), names=['replication'])

# Load all scenarios
scenarios = {}
for scenario_dir in (results_dir / "scenarios").iterdir():
    if scenario_dir.is_dir():
        scenarios[scenario_dir.name] = load_scenario_replications(scenario_dir)

# Quick comparison plot
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

metrics_to_plot = [
    ('p90_response_p1', 'P90 Response Time (Priority 1)'),
    ('unit_Engine_1_UHU', 'Engine 1 UHU'),
    ('uncovered_incidents', 'Uncovered Incidents'),
    ('cost_per_incident', 'Cost per Incident')
]

for ax, (metric, title) in zip(axes.flat, metrics_to_plot):
    data = []
    for name, df in scenarios.items():
        if metric in df.columns:
            # Average across replications per hour, then overall
            hourly_avg = df.groupby('hour_start')[metric].mean()
            overall_avg = hourly_avg.mean()
            data.append({'Scenario': name, metric: overall_avg})
    
    plot_df = pd.DataFrame(data)
    sns.barplot(data=plot_df, x='Scenario', y=metric, ax=ax)
    ax.set_title(title)
    ax.tick_params(axis='x', rotation=45)

plt.tight_layout()
plt.show()

# Statistical summary table
print("Statistical Comparison (Baseline vs Add_Medic_Stn2):")
print("=" * 60)
for metric in ['p90_response_p1', 'unit_Engine_1_UHU', 'uncovered_incidents']:
    if metric in report['comparisons']:
        comp = report['comparisons'][f'Baseline_vs_Add_Medic_Stn2_{metric}']
        print(f"\n{metric}:")
        print(f"  Baseline: {comp['mean_a']:.1f} ± {comp['std_a']:.1f}")
        print(f"  Treatment: {comp['mean_b']:.1f} ± {comp['std_b']:.1f}")
        print(f"  Difference: {comp['mean_diff']:.1f} ({comp['pct_change']:.1f}%)")
        print(f"  p-value: {comp['p_value']:.2e}")
        print(f"  Cohen's d: {comp['cohens_d']:.2f} ({comp['effect_interpretation']})")
        print(f"  Practically significant: {comp['practically_significant']}")
```

---

## Custom Experiment Template

```yaml
# config/experiments/my_custom_experiment.yaml
experiment:
  name: "My_Custom_Experiment"
  description: "Description of what this tests"
  version: "1.0"
  
  fixed:
    town_gpkg: "DATA/synthetic_towns/town_v1.gpkg"
    incidents_parquet: "DATA/synthetic_towns/incidents_50k.parquet"
    date_range: ["2024-01-01", "2024-12-31"]
    realism_config: "config/realism/my_center.yaml"
    random_seed: 4242
    
  scenarios:
    - name: "Control"
      staffing_config: "config/staffing_scenarios/baseline.yaml"
      label: "Control Group"
      
    - name: "Treatment_1"
      staffing_config: "config/staffing_scenarios/my_treatment.yaml"
      label: "My Treatment"
      
    - name: "Treatment_2"
      staffing_config: "config/staffing_scenarios/my_treatment2.yaml"
      label: "My Treatment 2"
      
  replications: 30
  parallel_jobs: 8
  
  metrics:
    - response_time_fractiles
    - unit_utilization
    - workload_equity
    - coverage_gaps
    - cost_metrics
    - equity_metrics
    - fractile_compliance
    
  analysis:
    paired_test: true
    confidence_level: 0.95
    effect_size_threshold: 0.2
    multiple_correction: "holm"
    bootstrap_samples: 10000
```

---

*All experiment templates are in `config/experiments/`. Copy, modify, and run with the experiment runner.*