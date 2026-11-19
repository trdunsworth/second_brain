# PSAP Research — Experiment Design & Methodology

> **Controlled experiment methodology for staffing algorithm testing with statistical rigor**

---

## Core Philosophy: The Controlled Experiment

> **The Golden Rule**: *Every experiment compares scenarios against IDENTICAL call volumes. The only difference between scenarios is the staffing configuration.*

This is achieved by:
1. Generating call volumes **once** with a fixed seed
2. Reusing the **exact same incident dataset** across all scenarios
3. Running **paired replications** (same random seed per replication index)
4. Using **paired statistical tests** (Wilcoxon signed-rank, paired t-test)

---

## Experimental Design Framework

### Experimental Unit

| Concept | Definition |
|---------|------------|
| **Experimental Unit** | One replication of one scenario |
| **Treatment** | Staffing configuration (scenario) |
| **Blocking Factor** | Replication index (controls for call volume variation) |
| **Response Variables** | Response times, utilization, coverage, cost, equity |
| **Experimental Material** | Synthetic town + incident dataset |

### Design Types Supported

| Design | Use Case | Structure |
|--------|----------|-----------|
| **Paired Comparison** | A vs B (baseline vs treatment) | Same volumes, paired t-test |
| **Multi-arm Comparison** | Baseline vs Variant1 vs Variant2 | ANOVA + pairwise with correction |
| **Dose-Response** | Incremental resource addition | Regression on resource count |
| **Factorial** | Multiple factors (staffing × traffic × fatigue) | Full/fractional factorial |
| **Sensitivity** | Volume ±20%, weather, events | One-factor-at-a-time |

---

## Experiment Configuration Schema

```yaml
# config/experiments/experiment_name.yaml
experiment:
  name: "descriptive_name"
  description: "What this experiment tests"
  version: "1.0"
  author: "researcher_name"
  date: "2026-01-15"
  
  # FIXED across all scenarios (controlled)
  fixed:
    town_gpkg: "DATA/synthetic_towns/town_v1.gpkg"
    routing_graph: "DATA/synthetic_towns/graph.pkl"
    incidents_parquet: "DATA/synthetic_towns/incidents_50k.parquet"
    date_range: ["2024-01-01", "2024-12-31"]
    realism_config: "config/realism/my_center.yaml"
    random_seed: 4242  # Master seed for all scenarios
    demographics_geojson: "DATA/demographics/tract_demographics.geojson"
    
  # VARIED per scenario
  scenarios:
    - name: "Baseline"
      staffing_config: "config/staffing_scenarios/baseline.yaml"
      label: "Current Staffing"
      color: "#1f77b4"
      
    - name: "Treatment_A"
      staffing_config: "config/staffing_scenarios/variant_a.yaml"
      label: "Add Medic at Station 2"
      color: "#ff7f0e"
      
    - name: "Treatment_B"
      staffing_config: "config/staffing_scenarios/variant_b.yaml"
      label: "Dynamic Peak Staffing"
      color: "#2ca02c"
      
  # Experiment parameters
  replications: 30                    # Per scenario
  parallel_jobs: 8                    # CPU cores
  timeout_per_replication: 3600       # Seconds
  
  # Output
  output_dir: "DATA/experiment_results/experiment_name/"
  output_formats: ["parquet", "json", "html"]
  
  # Metrics to collect
  metrics:
    - response_time_fractiles
    - unit_utilization
    - workload_equity
    - coverage_gaps
    - cost_metrics
    - equity_metrics
    - fractile_compliance
    
  # Statistical analysis
  analysis:
    paired_test: true                 # Same volumes = paired
    confidence_level: 0.95
    effect_size_threshold: 0.2        # Cohen's d
    multiple_correction: "bonferroni" # or "holm", "fdr"
    bootstrap_samples: 10000
    minimum_practical_effect: 0.05    # 5% relative change
```

---

## Statistical Analysis Framework

### Paired Comparison Rationale

Since **all scenarios use identical call volumes** (same incidents, same order, same timestamps), each replication index across scenarios forms a **natural pair**:

```
Replication 1:  Scenario A (seed=1234)  vs  Scenario B (seed=1234)  vs  Scenario C (seed=1234)
Replication 2:  Scenario A (seed=5678)  vs  Scenario B (seed=5678)  vs  Scenario C (seed=5678)
...
Replication 30: Scenario A (seed=... )  vs  Scenario B (seed=... )  vs  Scenario C (seed=... )
```

**This pairing eliminates volume variance**, isolating the staffing effect.

### Statistical Tests

| Test | Use Case | Assumptions |
|------|----------|-------------|
| **Paired t-test** | Primary: response times, utilization | Normal differences, interval data |
| **Wilcoxon Signed-Rank** | Non-parametric backup | Ordinal/interval, symmetric differences |
| **Bootstrap CI** | Median difference, robust CI | No distribution assumptions |
| **McNemar's Test** | Binary outcomes (compliance yes/no) | Paired binary |
| **Permutation Test** | Small n, unknown distribution | Exchangeability under null |

### Effect Size Reporting

| Metric | Formula | Interpretation |
|--------|---------|----------------|
| **Cohen's d (paired)** | `mean_diff / sd_diff` | 0.2=small, 0.5=medium, 0.8=large |
| **Glass's Δ** | `mean_diff / sd_control` | When control SD more stable |
| **% Change** | `mean_diff / mean_baseline * 100` | Practical interpretation |
| **Number Needed to Treat (NNT)** | `1 / (p_treatment - p_control)` | Binary outcomes |

### Confidence Intervals

| Method | Use Case |
|--------|----------|
| **Parametric (t-based)** | Mean difference, normal-ish |
| **Bootstrap Percentile** | Median difference, skewed |
| **BCa Bootstrap** | Bias-corrected, accelerated |
| **Exact (Clopper-Pearson)** | Proportions (compliance rates) |

### Multiple Comparison Correction

| Method | FWER Control | Power | Use Case |
|--------|--------------|-------|----------|
| **Bonferroni** | Strong | Low | Few comparisons (<5) |
| **Holm-Bonferroni** | Strong | Medium | General purpose |
| **Benjamini-Hochberg (FDR)** | FDR | High | Many metrics (>10) |
| **None** | None | Maximum | Exploratory only |

---

## Power Analysis & Sample Size

### Power Calculation for Paired Design

```python
from statsmodels.stats.power import TTestPower
from scipy.stats import norm

def calculate_required_replications(
    effect_size: float = 0.5,      # Cohen's d
    alpha: float = 0.05,           # Type I error
    power: float = 0.80,           # 1 - beta
    paired: bool = True
) -> int:
    """Calculate required replications per scenario."""
    analysis = TTestPower()
    n = analysis.solve_power(
        effect_size=effect_size,
        nobs1=None,
        alpha=alpha,
        power=power,
        alternative='two-sided'
    )
    return int(np.ceil(n))

# Example calculations:
# Effect size 0.2 (small) → n ≈ 199
# Effect size 0.5 (medium) → n ≈ 34
# Effect size 0.8 (large) → n ≈ 15

# With paired design, needed n is smaller:
# Effect size 0.5, paired → n ≈ 27
```

### Recommended Replications

| Effect Size | Min Replications (paired) | Recommended |
|-------------|---------------------------|-------------|
| Large (0.8) | 15 | 20 |
| Medium (0.5) | 27 | **30** |
| Small (0.2) | 199 | 200+ |

**Recommendation**: **30 replications** — detects medium effects with >80% power, feasible compute time.

---

## Experiment Templates

### Template 1: Simple A/B Comparison

```yaml
# config/experiments/baseline_vs_treatment.yaml
experiment:
  name: "Baseline_vs_Add_Medic"
  description: "Does adding 1 medic at Station 2 improve response times?"
  
  fixed:
    town_gpkg: "DATA/towns/town_v1.gpkg"
    incidents_parquet: "DATA/incidents_50k.parquet"
    date_range: ["2024-01-01", "2024-12-31"]
    realism_config: "config/realism/baseline.yaml"
    random_seed: 4242
    
  scenarios:
    - name: "Control"
      staffing_config: "config/staffing/baseline.yaml"
      label: "Baseline (No Added Medic)"
      
    - name: "Treatment"
      staffing_config: "config/staffing/add_medic_stn2.yaml"
      label: "Add Medic at Station 2"
      
  replications: 30
  parallel_jobs: 8
  
  metrics:
    - response_time_fractiles
    - unit_utilization
    - coverage_gaps
    
  analysis:
    paired_test: true
    confidence_level: 0.95
```

### Template 2: Dose-Response (Incremental Resources)

```yaml
# config/experiments/medic_dose_response.yaml
experiment:
  name: "Medic_Dose_Response"
  description: "Marginal benefit of each additional medic unit"
  
  fixed:
    town_gpkg: "DATA/towns/town_v1.gpkg"
    incidents_parquet: "DATA/incidents_50k.parquet"
    random_seed: 4242
    
  scenarios:
    - name: "0_Medics_Added"
      staffing_config: "config/staffing/baseline.yaml"
      label: "Baseline (0 added)"
      dose: 0
      
    - name: "1_Medic_Added"
      staffing_config: "config/staffing/add_1_medic.yaml"
      label: "+1 Medic"
      dose: 1
      
    - name: "2_Medics_Added"
      staffing_config: "config/staffing/add_2_medics.yaml"
      label: "+2 Medics"
      dose: 2
      
    - name: "3_Medics_Added"
      staffing_config: "config/staffing/add_3_medics.yaml"
      label: "+3 Medics"
      dose: 3
      
    - name: "4_Medics_Added"
      staffing_config: "config/staffing/add_4_medics.yaml"
      label: "+4 Medics"
      dose: 4
      
  replications: 20
  analysis:
    dose_response: true
    model: "linear"  # or "logistic", "exponential"
```

### Template 3: Sensitivity Analysis

```yaml
# config/experiments/sensitivity_analysis.yaml
experiment:
  name: "Volume_Sensitivity"
  description: "How do staffing configs perform under volume surge?"
  
  fixed:
    town_gpkg: "DATA/towns/town_v1.gpkg"
    staffing_config: "config/staffing/baseline.yaml"
    realism_config: "config/realism/baseline.yaml"
    random_seed: 4242
    
  # Volume multiplier as experimental factor
  scenarios:
    - name: "Volume_80%"
      volume_multiplier: 0.8
      label: "80% Volume"
      
    - name: "Volume_100%"
      volume_multiplier: 1.0
      label: "Baseline Volume"
      
    - name: "Volume_120%"
      volume_multiplier: 1.2
      label: "120% Volume (Surge)"
      
    - name: "Volume_150%"
      volume_multiplier: 1.5
      label: "150% Volume (Major Surge)"
      
  replications: 15  # fewer reps for sensitivity sweep
  metrics:
    - response_time_fractiles
    - coverage_gaps
    - unit_utilization
    
  analysis:
    sensitivity: true
    reference_scenario: "Volume_100%"
```

---

## Experiment Execution Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXPERIMENT EXECUTION FLOW                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. LOAD CONFIG                                                             │
│     ├── Parse experiment.yaml                                               │
│     ├── Validate schema                                                     │
│     └── Resolve scenario inheritance                                        │
│                                                                             │
│  2. GENERATE TASKS                                                          │
│     For each scenario ∈ scenarios:                                          │
│       For rep in 0..replications-1:                                         │
│         seed = hash(scenario_name, rep, master_seed) % 2^32                │
│         Create task{scenario, replication_id, seed, fixed_config}          │
│                                                                             │
│  3. PARALLEL EXECUTION                                                      │
│     ProcessPoolExecutor(max_workers=parallel_jobs)                         │
│     │                                                                       │
│     ├── Submit all tasks → futures                                          │
│     │                                                                       │
│     └── as_completed(futures):                                              │
│         │                                                                   │
│         ├── result = future.result(timeout=3600)                           │
│         │                                                                   │
│         ├── if success: collect ReplicationResult                          │
│         │                                                                   │
│         └── if failed: log error, create failed ReplicationResult          │
│                                                                             │
│  4. ORGANIZE RESULTS                                                        │
│     Group by scenario_name                                                  │
│     For each scenario: aggregate_metrics(replications)                     │
│                                                                             │
│  5. STATISTICAL COMPARISON                                                  │
│     For each scenario pair (A, B):                                         │
│       For each metric:                                                      │
│         paired_values = zip(results_A[rep_i], results_B[rep_i])            │
│         paired_t_test, wilcoxon, bootstrap_ci, cohens_d                    │
│         Apply multiple comparison correction                                │
│                                                                             │
│  6. GENERATE OUTPUTS                                                        │
│     ├── Replication Parquet files (per scenario)                           │
│     ├── Aggregated metrics JSON                                             │
│     ├── Comparison report HTML/JSON                                         │
│     ├── Fractile comparison charts (Plotly)                                │
│     ├── Equity heatmaps                                                     │
│     ├── Cost-benefit curves                                                 │
│     └── Statistical summary CSV/JSON                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Replication Management

### Seed Derivation Strategy

```python
def derive_seed(master_seed: int, scenario_name: str, replication_id: int) -> int:
    """Deterministic seed derivation for reproducibility."""
    # Use hash for uniform distribution
    seed_string = f"{master_seed}:{scenario_name}:{replication_id}"
    return int(hashlib.sha256(seed_string.encode()).hexdigest()[:8], 16) % (2**32)

# Properties:
# - Deterministic: same inputs → same seed
# - Uniform: SHA256 distributes uniformly
# - Independent: different (scenario, rep) → different seeds
# - Reproducible: same inputs always produce same seed
```

### Replication Independence

Each replication is **statistically independent** because:
- Different random seeds
- Same call volumes (fixed) but different stochastic draws for:
  - Unit assignment (when multiple equally-good units)
  - Stochastic travel times (lognormal draws)
  - Personnel assignment (Zipf-weighted)
  - Abandonment draws (binomial)

### Failure Handling

```python
def run_replication_with_retry(task, max_retries=1):
    for attempt in range(max_retries + 1):
        try:
            return run_single_replication(task)
        except TransientError as e:
            if attempt == max_retries:
                raise
            wait = 2 ** attempt  # exponential backoff
            time.sleep(wait)
        except PermanentError as e:
            return FailedReplication(error=str(e))
```

---

## Output Data Structure

### Per-Replication Output

```
DATA/experiment_results/experiment_name/
├── manifest.json                          # Experiment manifest
├── config.yaml                            # Resolved full config
├── scenarios/
│   ├── Scenario_A/
│   │   ├── replication_000.parquet       # Hourly metrics
│   │   ├── replication_001.parquet
│   │   └── ...
│   ├── Scenario_B/
│   │   └── ...
│   └── ...
├── incidents/
│   ├── Scenario_A_rep000_incidents.parquet   # Per-incident detail
│   └── ...
├── comparison_report.html              # Interactive report
├── comparison_report.json              # Structured comparison
├── fractile_curves.html                # Plotly charts
├── equity_heatmaps.html                # Equity analysis
├── cost_benefit_curve.html             # Cost-benefit viz
└── statistical_summary.csv             # Summary table
```

### Replication Parquet Schema

```python
# Hourly metrics per replication
columns = [
    'scenario', 'replication', 'seed',
    'hour_start', 'hour_end',
    'incidents_created', 'incidents_dispatched', 'incidents_completed',
    'p50_response_p1', 'p90_response_p1', 'p95_response_p1',
    'p50_response_p2', 'p90_response_p2', 'p95_response_p2',
    'unit_Engine_1_UHU', 'unit_Medic_1_UHU', ...,
    'uncovered_incidents', 'simultaneous_peak',
    'nine_one_one_received', 'nine_one_one_abandoned',
    'cost_per_incident', 'overtime_hours',
    'response_time_quintile_1_p1', ..., 'response_time_quintile_5_p5',
    'fractile_compliance_p1_360s', 'fractile_compliance_p2_300s'
]
```

---

## Validation & Quality Checks

### Pre-Experiment Checks

```python
def validate_experiment_config(config: ExperimentConfig) -> ValidationResult:
    """Validate experiment config before running."""
    issues = []
    
    # Check files exist
    for path in [config.fixed.town_gpkg, config.fixed.incidents_parquet, 
                 config.fixed.routing_graph]:
        if not Path(path).exists():
            issues.append(f"Missing file: {path}")
    
    # Check scenario configs exist
    for scenario in config.scenarios:
        if not Path(scenario.staffing_config).exists():
            issues.append(f"Missing staffing config: {scenario.staffing_config}")
    
    # Check replications reasonable
    if config.replications < 10:
        issues.append("Warning: <10 replications may have low power")
    if config.replications > 100:
        issues.append("Warning: >100 replications may be excessive")
    
    # Check parallel jobs
    if config.parallel_jobs > os.cpu_count():
        issues.append(f"parallel_jobs ({config.parallel_jobs}) > CPU count")
    
    return ValidationResult(valid=len(issues)==0, issues=issues)
```

### Post-Experiment Quality Checks

```python
def validate_experiment_results(results: ExperimentResults) -> QualityReport:
    """Check experiment results for anomalies."""
    issues = []
    
    # Check all replications succeeded
    failed = [r for s in results.scenario_results.values() 
              for r in s.replications if not r.success]
    if failed:
        issues.append(f"{len(failed)} failed replications")
    
    # Check for outliers (3 IQR rule)
    for scenario_name, scenario in results.scenario_results.items():
        for metric in KEY_METRICS:
            values = [getattr(r.summary, metric) for r in scenario.replications if r.success]
            if len(values) > 4:
                q1, q3 = np.percentile(values, [25, 75])
                iqr = q3 - q1
                outliers = [v for v in values if v < q1 - 1.5*iqr or v > q3 + 1.5*iqr]
                if outliers:
                    issues.append(f"{scenario_name}.{metric}: {len(outliers)} outliers")
    
    # Check paired structure integrity
    n_reps = {s: len([r for r in res.replications if r.success]) 
              for s, res in results.scenario_results.items()}
    if len(set(n_reps.values())) > 1:
        issues.append(f"Uneven replications across scenarios: {n_reps}")
    
    return QualityReport(issues=issues, passed=len(issues)==0)
```

---

## Reporting Standards

### Minimum Reporting Requirements

Every experiment report must include:

1. **Experimental Design**
   - Design type (paired, factorial, etc.)
   - Fixed factors (town, incidents, seed)
   - Varied factors (staffing configs)
   - Replications, random seed

2. **Descriptive Statistics**
   - Mean, median, SD, IQR per scenario per metric
   - Sample sizes (successful replications)

3. **Inferential Statistics**
   - Paired test used (t-test/Wilcoxon)
   - Test statistic, df, p-value
   - 95% CI for mean difference
   - Effect size (Cohen's d) with interpretation

4. **Multiple Comparison Correction**
   - Method used (Bonferroni/Holm/FDR)
   - Adjusted significance threshold

5. **Practical Significance**
   - Minimum practically important effect
   - Whether statistical significance = practical significance

5. **Assumption Checks**
   - Normality of differences (Shapiro-Wilk)
   - Outlier analysis
   - Missing data handling

6. **Sensitivity Analyses**
   - Results with outliers removed
   - Non-parametric vs parametric agreement

---

## Example: Interpreting Results

```
Scenario A (Baseline) vs Scenario B (+1 Medic at Stn 2)
Metric: p90 Response Time Priority 1
────────────────────────────────────────────────────────────
Descriptive:
  Baseline:    Mean=485s, Median=478s, SD=42s, n=30
  Treatment:   Mean=421s, Median=415s, SD=39s, n=30

Inference:
  Mean Difference:     -64s  (95% CI: -78 to -50)
  Paired t-test:       t(29) = -8.42, p < 0.001
  Wilcoxon:            W = 0, p < 0.001
  Cohen's d:           -1.54  [LARGE effect]
  95% CI for median:   [-72, -48] seconds

Interpretation:
  ✓ Statistically significant (p < 0.001)
  ✓ Large effect size (d = -1.54)
  ✓ Practically significant (>30s improvement)
  ✓ Consistent across parametric/non-parametric tests
  
Cost-Benefit:
  Added cost: $120,000/year (1 FTE medic)
  Time saved: 64 sec/incident × 15,000 incidents = 267 hrs/year
  Cost per second saved: $1,875
  Cost per 1% fractile improvement: $8,500
```

---

*This methodology ensures rigorous, reproducible, and statistically sound staffing research. The paired design with identical call volumes provides high internal validity for causal inference about staffing effects.*