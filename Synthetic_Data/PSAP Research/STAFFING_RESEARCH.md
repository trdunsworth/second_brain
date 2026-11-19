# PSAP Research — Staffing Algorithm Testing Framework

> **Complete framework for testing, comparing, and optimizing staffing algorithms against realistic synthetic 9-1-1 workloads**

---

## Research Vision

Enable evidence-based staffing decisions by running **controlled experiments** where identical synthetic 9-1-1 workloads are processed through different staffing configurations, measuring outcomes against NFPA/NENA standards and equity metrics.

---

## Experimental Design Framework

### Core Principle: Controlled Comparison

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CONTROLLED EXPERIMENT DESIGN                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FIXED (identical across all scenarios):                                    │
│  ─────────────────────────────────────────────                              │
│  • Synthetic town geography (SynthGIS)                                     │
│  • Call volume dataset (SynthCCD) — same seed, same volumes                │
│  • Date range (e.g., 1 year)                                               │
│  • Random seed for stochastic elements                                     │
│  • Realism configuration (time profiles, problem profiles, etc.)           │
│                                                                             │
│  VARIED (one per scenario):                                                │
│  ────────────────────────────────                                           │
│  • Staffing configuration                                                  │
│  • Deployment strategy                                                     │
│  • Resource allocation rules                                               │
│  • Dynamic staffing policies                                               │
│                                                                             │
│  MEASURED (per replication):                                               │
│  ────────────────────────────                                              │
│  • Response time distributions (by priority, zone, hour)                  │
│  • Unit utilization (UHU)                                                  │
│  • Coverage gaps / uncovered incidents                                     │
│  • Cost metrics                                                            │
│  • Equity metrics                                                          │
│                                                                             │
│  STATISTICAL ANALYSIS:                                                     │
│  ────────────────────────────                                              │
│  • Paired t-tests (same call volumes = paired observations)               │
│  • Effect sizes with confidence intervals                                  │
│  • Non-inferiority / superiority testing                                   │
│  • Sensitivity analysis (what if volumes +20%?)                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Staffing Scenario Taxonomy

### Scenario Categories

| Category | Description | Example Variations |
|----------|-------------|-------------------|
| **Baseline** | Current operational staffing | Current FTE, current deployment |
| **Resource Addition** | Add units/FTEs | +1 Medic, +1 Engine, +1 Battalion Chief |
| **Resource Reallocation** | Move existing resources | Move Medic from Stn1→Stn2, cross-staff |
| **Shift Restructuring** | Change shift patterns | 24/48→48/96, 8hr→12hr, add swing shift |
| **Peak Overlay** | Add resources during peak hours | 10-22 overlay, 12-20 overlay |
| **Dynamic/ML-Driven** | Predictive positioning | Forecast-based pre-positioning |
| **Cross-Staffing** | Multi-role units | Engine+Medic, Engine+Tender |
| **Regional/Mutual Aid** | Shared resources | Auto-aid agreements, regional pools |

### Staffing Configuration Schema

```yaml
# config/staffing_scenarios/baseline.yaml
scenario:
  name: "Baseline_2024"
  version: "1.0"
  description: "Current operational staffing as of Jan 2024"
  inherits: null
  
stations:
  Station_1:
    name: "Central Station"
    location: {x: 950000, y: 200000}  # projected coords
    apparatus:
      - id: "Engine_1"
        type: "Engine"
        count: 1
        cross_staffed_with: null
        minimum_staffing: 3
      - id: "Medic_1"
        type: "Medic"
        count: 1
        cross_staffed_with: "Engine_1"  # cross-staffed
        minimum_staffing: 2
      - id: "Ladder_1"
        type: "Ladder"
        count: 1
        cross_staffed_with: null
        minimum_staffing: 3
    minimum_manning: 4
    capabilities: ["FIRE", "EMS", "RESCUE", "HAZMAT_AWARE"]
    
  Station_2:
    name: "North Station"
    location: {x: 960000, y: 210000}
    apparatus:
      - id: "Engine_2"
        type: "Engine"
        count: 1
        cross_staffed_with: null
        minimum_staffing: 3
      - id: "Medic_2"
        type: "Medic"
        count: 1
        cross_staffed_with: null
        minimum_staffing: 2
    minimum_manning: 3
    capabilities: ["FIRE", "EMS"]
    
  Station_3:
    name: "South Station"
    location: {x: 940000, y: 190000}
    apparatus:
      - id: "Engine_3"
        type: "Engine"
        count: 1
        cross_staffed_with: null
        minimum_staffing: 3
    minimum_manning: 3
    capabilities: ["FIRE"]

shifts:
  structure: "2x12h_4shift"
  description: "2x12h, 4 shifts, 14-day rotation"
  cycle_start_weekday: 0  # Monday
  rotation: [1, 1, 2, 2, 1, 1, 1, 2, 2, 1, 1, 2, 2, 2]
  
  shift_definitions:
    A:
      label: "DAY_A"
      hours: [6, 18]  # 06:00-18:00
      rotation_group: 1
      staffing:
        Station_1:
          Engine_1: {officers: 1, firefighters: 2}
          Medic_1: {paramedics: 2}
          Ladder_1: {officers: 1, firefighters: 2}
        Station_2:
          Engine_2: {officers: 1, firefighters: 2}
          Medic_2: {paramedics: 2}
        Station_3:
          Engine_3: {officers: 1, firefighters: 2}
          
    B:
      label: "DAY_B"
      hours: [6, 18]
      rotation_group: 2
      staffing: ...  # different personnel, same counts
      
    C:
      label: "NIGHT_C"
      hours: [18, 6]  # crosses midnight
      rotation_group: 1
      staffing: ...  # night staffing (typically reduced)
      
    D:
      label: "NIGHT_D"
      hours: [18, 6]
      rotation_group: 2
      staffing: ...

dispatcher_disciplines:
  mode: "auto"  # auto | combined | two_way | three_way
  min_dispatchers_for_split: 4
  # auto: 1-3 dispatchers = combined, 4-7 = LAW vs FIRE/EMS, 8+ = LAW/FIRE/EMS

cross_staffing_rules:
  - primary: "Engine_1"
    secondary: "Medic_1"
    rule: "if_engine_busy_medic_available"
    condition: "engine_busy AND medic_available AND not_both_committed"
    priority: 1
    
  - primary: "Engine_2"
    secondary: "Medic_2"
    rule: "if_engine_busy_medic_available"
    condition: "engine_busy AND medic_available"
    priority: 2

minimum_manning:
  Station_1: 4
  Station_2: 3
  Station_3: 3
  
overtime_policy:
  max_consecutive_hours: 24
  max_weekly_hours: 72
  callback_threshold: 0.8  # recall off-duty at 80% capacity
  mandatory_overtime_max: 48  # hours/week
  
fatigue_model:
  enabled: true
  fatigue_factor_per_hour: 0.005
  recovery_rate_per_hour_off: 0.01
  max_fatigue_factor: 1.5
  circadian_modifier:
    enabled: true
    low_alertness_hours: [0, 1, 2, 3, 4, 5]  # 00:00-06:00
    low_alertness_factor: 1.2  # 20% slower
    peak_alertness_hours: [10, 11, 12, 13, 14]  # 10:00-15:00
    peak_alertness_factor: 0.9  # 10% faster

dynamic_staffing:
  enabled: false
  policy_class: null  # e.g., "ml_staffing_policy.MLStaffingPolicy"
  model_path: null
  features: ["forecasted_volume", "current_utilization", "time_of_day", "weather"]
  retrain_schedule: "weekly"
  fallback: "baseline"  # if ML fails
```

---

## Staffing Algorithm Interface

### Dynamic Staffing Policy Interface

```python
# psap_research/staffing_scenarios/dynamic.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, List, Optional
from datetime import datetime

@dataclass
class StaffingContext:
    """Current state provided to dynamic policy."""
    current_time: datetime
    current_hour: int
    day_of_week: int  # 0=Monday
    active_incidents: int
    incidents_last_hour: int
    incidents_last_4_hours: int
    forecasted_volume_next_hour: float
    forecasted_volume_next_4_hours: float
    current_unit_utilization: Dict[str, float]  # unit_id -> UHU
    available_units: List[str]  # unit_ids currently AVAILABLE
    committed_units: List[str]  # unit_ids currently committed
    off_duty_personnel: List[str]  # personnel_ids off-duty but recallable
    weather: str  # clear, rain, snow, ice
    special_events: List[str]  # planned events today
    current_shift: str  # shift_id
    fatigue_levels: Dict[str, float]  # personnel_id -> fatigue_factor

@dataclass
class StaffingDecision:
    """Actions the policy can take."""
    recall_personnel: List[str] = field(default_factory=list)  # personnel_ids to recall
    release_personnel: List[str] = field(default_factory=list)  # personnel_ids to release
    reposition_units: Dict[str, str] = field(default_factory=dict)  # unit_id -> station_id
    add_overlay_units: Dict[str, int] = field(default_factory=dict)  # station_id -> count
    modify_cross_staffing: Dict[str, bool] = field(default_factory=dict)  # unit_id -> enable/disable
    confidence: float = 1.0  # 0-1, for logging/analysis
    reasoning: str = ""  # human-readable explanation

class DynamicStaffingPolicy(ABC):
    """Interface for dynamic staffing policies."""
    
    @abstractmethod
    def decide(self, context: StaffingContext) -> StaffingDecision:
        """Make staffing decisions based on current context."""
        pass
    
    @abstractmethod
    def update_model(self, historical_data: pd.DataFrame) -> None:
        """Update/retrain model with new historical data."""
        pass
    
    def get_feature_importance(self) -> Dict[str, float]:
        """Return feature importance for interpretability."""
        return {}

class RuleBasedDynamicPolicy(DynamicStaffingPolicy):
    """Simple rule-based dynamic staffing."""
    
    def __init__(self, rules: List[Dict]):
        self.rules = rules
    
    def decide(self, context: StaffingContext) -> StaffingDecision:
        decision = StaffingDecision()
        
        for rule in self.rules:
            if self._evaluate_condition(rule['condition'], context):
                for action, params in rule['actions'].items():
                    self._apply_action(decision, action, params, context)
        
        return decision
    
    def _evaluate_condition(self, condition: str, context: StaffingContext) -> bool:
        # Safe evaluation of condition string
        # e.g., "context.current_unit_utilization['Medic_1'] > 0.8"
        try:
            return eval(condition, {"context": context, "random": random})
        except:
            return False

class MLStaffingPolicy(DynamicStaffingPolicy):
    """ML-driven dynamic staffing policy."""
    
    def __init__(self, model_path: str, feature_columns: List[str]):
        self.model_path = model_path
        self.feature_columns = feature_columns
        self.model = self._load_model(model_path)
        self.scaler = self._load_scaler(model_path)
    
    def decide(self, context: StaffingContext) -> StaffingDecision:
        # Extract features
        features = self._extract_features(context)
        
        # Predict optimal staffing actions
        predictions = self.model.predict_proba([features])[0]
        
        # Convert predictions to actions
        decision = self._predictions_to_actions(predictions, context)
        decision.confidence = max(predictions)
        decision.reasoning = f"ML prediction (confidence: {decision.confidence:.2f})"
        
        return decision
    
    def _extract_features(self, context: StaffingContext) -> np.ndarray:
        features = []
        features.append(context.current_hour)
        features.append(context.day_of_week)
        features.append(context.active_incidents)
        features.append(context.incidents_last_hour)
        features.append(context.forecasted_volume_next_hour)
        features.append(np.mean(list(context.current_unit_utilization.values())))
        features.append(len(context.available_units))
        features.append(len(context.committed_units))
        features.append(1.0 if context.weather != "clear" else 0.0)
        features.append(len(context.special_events))
        features.append(np.mean(list(context.fatigue_levels.values())))
        return np.array(features).reshape(1, -1)
    
    def update_model(self, historical_data: pd.DataFrame) -> None:
        # Retrain with new data
        X = historical_data[self.feature_columns]
        y = historical_data['optimal_action']
        self.model.fit(X, y)
        self._save_model(self.model_path)
```

---

## Experiment Runner Framework

### Experiment Configuration

```yaml
# config/experiments/staffing_comparison_001.yaml
experiment:
  name: "Staffing_Comparison_2024_Q1"
  description: "Compare baseline vs added medic at Station 2 vs dynamic staffing"
  version: "1.0"
  
  # FIXED across all scenarios (controlled experiment)
  fixed:
    town_gpkg: "DATA/synthetic_towns/town_v1.gpkg"
    routing_graph: "DATA/synthetic_towns/graph.pkl"
    incidents_parquet: "DATA/synthetic_towns/incidents_50k.parquet"
    date_range: ["2024-01-01", "2024-12-31"]
    realism_config: "config/realism/my_center.yaml"
    random_seed: 4242  # fixed for all scenarios
    
  # VARIED per scenario
  scenarios:
    - name: "Baseline"
      staffing_config: "config/staffing_scenarios/baseline.yaml"
      label: "Current Staffing (Baseline)"
      color: "#1f77b4"
      
    - name: "Add_Medic_Stn2"
      staffing_config: "config/staffing_scenarios/add_medic_stn2.yaml"
      label: "Add Medic at Station 2"
      color: "#ff7f0e"
      
    - name: "Peak_Overlay_10_22"
      staffing_config: "config/staffing_scenarios/peak_overlay_10_22.yaml"
      label: "Fixed Peak Overlay 10:00-22:00"
      color: "#2ca02c"
      
    - name: "Peak_Overlay_12_20"
      staffing_config: "config/staffing_scenarios/peak_overlay_12_20.yaml"
      label: "Fixed Peak Overlay 12:00-20:00"
      color: "#d62728"
      
    - name: "Dynamic_ML"
      staffing_config: "config/staffing_scenarios/dynamic_ml.yaml"
      label: "ML-Driven Dynamic Staffing"
      color: "#9467bd"
      
    - name: "Cross_Staffing_Engine_Medic"
      staffing_config: "config/staffing_scenarios/cross_staffing_engine_medic.yaml"
      label: "Cross-Staff Engine+Medic at Stn 1"
      color: "#8c564b"
      
    - name: "Station_2_Closure"
      staffing_config: "config/staffing_scenarios/station_2_closure.yaml"
      label: "Station 2 Closure (Equity Test)"
      color: "#e377c2"
      
  # Experiment parameters
  replications: 30  # per scenario
  parallel_jobs: 8  # CPU cores to use
  
  # Output
  output_dir: "DATA/experiment_results/staffing_comp_001/"
  output_formats: ["parquet", "json", "html"]
  
  # Metrics to collect
  metrics:
    - response_time_fractiles      # p50, p90, p95 by priority/zone
    - unit_utilization             # UHU per unit
    - workload_equity              # calls per unit, high-acuity exposure
    - coverage_gaps                # uncovered incidents, simultaneous calls
    - cost_metrics                 # FTE cost, overtime, cost per incident
    - equity_metrics               # response time by demographic quintile
    - fractile_compliance          # NFPA 1710/1720
    - unit_workload_distribution   # calls per unit per shift
    - simultaneous_incidents       # peak simultaneous calls
  
  # Statistical analysis
  analysis:
    paired_test: true           # same volumes = paired observations
    confidence_level: 0.95
    effect_size_threshold: 0.2  # Cohen's d minimum for reporting
    multiple_comparison_correction: "bonferroni"
    bootstrap_samples: 10000    # for CI estimation
```

---

## Experiment Runner Implementation

```python
# psap_research/experiments/runner.py
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from pathlib import Path
import json
import pandas as pd
import numpy as np
from concurrent.futures import ProcessPoolExecutor, as_completed
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@dataclass
class ExperimentConfig:
    experiment: ExperimentSpec
    fixed: FixedConfig
    scenarios: List[ScenarioSpec]
    replications: int
    parallel_jobs: int
    output_dir: Path
    output_formats: List[str]
    metrics: List[str]
    analysis: AnalysisSpec

@dataclass
class ReplicationResult:
    scenario_name: str
    replication_id: int
    seed: int
    hourly_metrics: List[HourlyMetrics]
    incident_details: List[IncidentDetail]
    summary: SimulationSummary
    wall_time_seconds: float
    success: bool
    error: Optional[str] = None

@dataclass
class ScenarioResult:
    scenario_name: str
    label: str
    replications: List[ReplicationResult]
    aggregated_metrics: AggregatedMetrics
    
@dataclass
class ExperimentResults:
    experiment_name: str
    timestamp: datetime
    config: ExperimentConfig
    scenario_results: Dict[str, ScenarioResult]
    comparison_report: ComparisonReport
    
class ExperimentRunner:
    """Orchestrates controlled experiments across multiple staffing scenarios."""
    
    def __init__(self, config: ExperimentConfig):
        self.config = config
        self.output_dir = Path(config.output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def run(self) -> ExperimentResults:
        """Run complete experiment with all scenarios and replications."""
        
        # Save resolved config
        self._save_config()
        
        # Generate all replication tasks
        tasks = self._generate_tasks()
        logger.info(f"Running {len(tasks)} total replications across {len(self.config.scenarios)} scenarios")
        
        # Run replications in parallel
        all_results = self._run_parallel(tasks)
        
        # Organize by scenario
        scenario_results = self._organize_results(all_results)
        
        # Aggregate metrics
        for scenario_name, result in scenario_results.items():
            result.aggregated_metrics = self._aggregate_metrics(result.replications)
        
        # Generate comparison report
        comparison_report = self._generate_comparison_report(scenario_results)
        
        # Save results
        self._save_results(scenario_results, comparison_report)
        
        return ExperimentResults(
            experiment_name=self.config.experiment.name,
            timestamp=datetime.utcnow(),
            config=self.config,
            scenario_results=scenario_results,
            comparison_report=comparison_report
        )
    
    def _generate_tasks(self) -> List[Dict]:
        """Generate all replication tasks with unique seeds."""
        tasks = []
        base_seed = self.config.fixed.random_seed
        
        for scenario in self.config.scenarios:
            for rep in range(self.config.replications):
                # Deterministic seed per scenario+replication
                seed = hash((scenario.name, rep, self.config.fixed.random_seed)) % 2**32
                tasks.append({
                    'scenario': scenario,
                    'replication_id': rep,
                    'seed': seed,
                    'fixed_config': self.config.fixed,
                })
        return tasks
    
    def _run_parallel(self, tasks: List[Dict]) -> List[ReplicationResult]:
        """Run all replications in parallel."""
        results = []
        
        with ProcessPoolExecutor(max_workers=self.config.parallel_jobs) as executor:
            # Submit all tasks
            future_to_task = {
                executor.submit(self._run_single_replication, task): task 
                for task in tasks
            }
            
            # Collect results as they complete
            for future in as_completed(future_to_task):
                task = future_to_task[future]
                try:
                    result = future.result(timeout=3600)  # 1 hour timeout per replication
                    results.append(result)
                    logger.info(f"Completed: {result.scenario_name} rep {result.replication_id} "
                              f"({'OK' if result.success else 'FAILED'})")
                except Exception as e:
                    logger.error(f"Task failed: {task}, error: {e}")
                    results.append(ReplicationResult(
                        scenario_name=task['scenario'].name,
                        replication_id=task['replication_id'],
                        seed=task['seed'],
                        hourly_metrics=[],
                        incident_details=[],
                        summary=SimulationSummary(),
                        wall_time_seconds=0,
                        success=False,
                        error=str(e)
                    ))
        
        return results
    
    @staticmethod
    def _run_single_replication(task: Dict) -> ReplicationResult:
        """Run a single replication. Runs in separate process."""
        import time
        start_time = time.time()
        
        try:
            scenario = task['scenario']
            replication_id = task['replication_id']
            seed = task['seed']
            fixed = task['fixed_config']
            
            # Set seeds for reproducibility
            np.random.seed(seed)
            random.seed(seed)
            
            # Load geography
            from psap_research.integration.synthgis_loader import SynthGISLoader
            geography = SynthGISLoader(fixed.town_gpkg)
            
            # Load routing graph
            import pickle
            with open(fixed.routing_graph, 'rb') as f:
                graph_data = pickle.load(f)
            
            # Load incidents
            incidents_df = pd.read_parquet(fixed.incidents_parquet)
            incidents = incidents_df.to_dict('records')
            
            # Load staffing config
            from psap_research.staffing_scenarios.loader import load_staffing_config
            staffing = load_staffing_config(scenario.staffing_config)
            
            # Load realism config
            from psap_research.config.loader import load_realism_config
            realism = load_realism_config(Path(fixed.realism_config))
            
            # Create and run simulation
            from psap_research.simulation_engine.core import DispatchSimulationEngine
            from psap_research.simulation_engine.routing import SynthGISRouter
            from psap_research.simulation_engine.clock import SimulationClock
            from psap_research.metrics.collector import MetricsCollector
            
            router = SynthGISRouter(
                graph=graph_data['graph'],
                stations=graph_data['stations'],
                run_cards=graph_data['run_cards']
            )
            
            clock = SimulationClock()
            metrics = MetricsCollector()
            
            engine = DispatchSimulationEngine(
                geography=geography,
                staffing=staffing,
                router=router,
                clock=clock,
                metrics=metrics,
                config=EngineConfig(
                    realism=realism,
                    date_range=fixed.date_range
                )
            )
            
            engine.load_geography(geography)
            engine.load_staffing(staffing)
            engine.load_incidents(incidents)
            
            # Run simulation
            results = engine.run()
            
            wall_time = time.time() - start_time
            
            return ReplicationResult(
                scenario_name=scenario.name,
                replication_id=task['replication_id'],
                seed=seed,
                hourly_metrics=results.hourly_metrics,
                incident_details=results.incident_details,
                summary=results.summary,
                wall_time_seconds=wall_time,
                success=True
            )
            
        except Exception as e:
            import traceback
            return ReplicationResult(
                scenario_name=task['scenario'].name,
                replication_id=task['replication_id'],
                seed=task['seed'],
                hourly_metrics=[],
                incident_details=[],
                summary=SimulationSummary(),
                wall_time_seconds=time.time() - start_time,
                success=False,
                error=f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}"
            )
```

---

## Statistical Comparison Framework

```python
# psap_research/experiments/comparison.py
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from scipy import stats
from scipy.stats import bootstrap

@dataclass
class MetricComparison:
    metric_name: str
    scenario_a: str
    scenario_b: str
    
    # Descriptive stats
    mean_a: float
    mean_b: float
    std_a: float
    std_b: float
    median_a: float
    median_b: float
    
    # Difference
    mean_diff: float
    pct_change: float
    
    # Paired t-test (since same volumes)
    t_statistic: float
    p_value: float
    ci_95: Tuple[float, float]
    degrees_of_freedom: int
    
    # Effect size
    cohens_d: float
    effect_interpretation: str  # negligible, small, medium, large
    
    # Non-parametric (Wilcoxon signed-rank)
    wilcoxon_statistic: float
    wilcoxon_p_value: float
    
    # Bootstrap CI for median difference
    bootstrap_ci_95: Tuple[float, float]
    
    # Practical significance
    practically_significant: bool
    minimum_practical_effect: float

class ComparisonAnalyzer:
    """Statistical comparison of scenario results."""
    
    def __init__(self, confidence_level: float = 0.95, 
                 effect_size_threshold: float = 0.2,
                 multiple_correction: str = "bonferroni"):
        self.confidence_level = confidence_level
        self.effect_size_threshold = effect_size_threshold
        self.multiple_correction = multiple_correction
    
    def compare_scenarios(
        self, 
        results_a: ScenarioResult, 
        results_b: ScenarioResult,
        metrics: List[str]
    ) -> Dict[str, MetricComparison]:
        """Compare two scenarios across all metrics."""
        
        comparisons = {}
        
        for metric in metrics:
            # Extract paired values (same replication index = same call volumes)
            values_a = self._extract_metric_values(results_a, metric)
            values_b = self._extract_metric_values(results_b, metric)
            
            if len(values_a) != len(values_b):
                logger.warning(f"Metric {metric}: unequal replication counts")
                continue
            
            # Ensure pairing by replication index
            paired_values = list(zip(values_a, values_b))
            
            comp = self._compare_paired(paired_values, metric, 
                                        results_a.scenario_name, 
                                        results_b.scenario_name)
            comparisons[metric] = comp
        
        # Apply multiple comparison correction
        if self.multiple_correction == "bonferroni":
            self._apply_bonferroni_correction(comparisons)
        
        return comparisons
    
    def _compare_paired(self, paired_values: List[Tuple[float, float]], 
                        metric: str, name_a: str, name_b: str) -> MetricComparison:
        """Compare paired samples."""
        values_a = np.array([v[0] for v in paired_values])
        values_b = np.array([v[1] for v in paired_values])
        
        # Remove NaN pairs
        valid_mask = ~(np.isnan(values_a) | np.isnan(values_b))
        values_a = values_a[valid_mask]
        values_b = values_b[valid_mask]
        
        if len(values_a) < 2:
            return self._empty_comparison(metric, name_a, name_b)
        
        # Descriptive stats
        mean_a, mean_b = np.mean(values_a), np.mean(values_b)
        std_a, std_b = np.std(values_a, ddof=1), np.std(values_b, ddof=1)
        median_a, median_b = np.median(values_a), np.median(values_b)
        
        # Difference
        diff = values_a - values_b
        mean_diff = np.mean(diff)
        pct_change = (mean_diff / mean_b * 100) if mean_b != 0 else np.inf
        
        # Paired t-test
        t_stat, p_value = stats.ttest_rel(values_a, values_b)
        df = len(values_a) - 1
        
        # Confidence interval for mean difference
        se_diff = np.std(diff, ddof=1) / np.sqrt(len(diff))
        t_crit = stats.t.ppf((1 + 0.95) / 2, df)
        ci_95 = (mean_diff - t_crit * se_diff, mean_diff + t_crit * se_diff)
        
        # Cohen's d for paired samples
        cohens_d = mean_diff / np.std(diff, ddof=1)
        effect_interpretation = self._interpret_effect_size(abs(cohens_d))
        
        # Wilcoxon signed-rank test (non-parametric)
        wilcoxon_stat, wilcoxon_p = stats.wilcoxon(values_a, values_b, alternative='two-sided')
        
        # Bootstrap CI for median difference
        bootstrap_ci = self._bootstrap_median_ci(values_a, values_b)
        
        # Practical significance
        min_effect = 0.05 * mean_b if mean_b != 0 else 0.1  # 5% relative or 0.1 absolute
        practically_sig = abs(mean_diff) >= min_effect and p_value < 0.05
        
        return MetricComparison(
            metric_name=metric,
            scenario_a=name_a,
            scenario_b=name_b,
            mean_a=mean_a, mean_b=mean_b,
            std_a=std_a, std_b=std_b,
            median_a=median_a, median_b=median_b,
            mean_diff=mean_diff, pct_change=pct_change,
            t_statistic=t_stat, p_value=p_value,
            ci_95=ci_95, degrees_of_freedom=df,
            cohens_d=cohens_d, effect_interpretation=effect_interpretation,
            wilcoxon_statistic=wilcoxon_stat, wilcoxon_p_value=wilcoxon_p,
            bootstrap_ci_95=bootstrap_ci,
            practically_significant=practically_sig,
            minimum_practical_effect=min_effect
        )
    
    def _interpret_effect_size(self, d: float) -> str:
        if d < 0.2: return "negligible"
        elif d < 0.5: return "small"
        elif d < 0.8: return "medium"
        else: return "large"
    
    def _bootstrap_median_ci(self, a: np.ndarray, b: np.ndarray, n_bootstrap: int = 10000) -> Tuple[float, float]:
        """Bootstrap confidence interval for median difference."""
        diffs = a - b
        boot_medians = []
        for _ in range(n_bootstrap):
            sample = np.random.choice(diffs, size=len(diffs), replace=True)
            boot_medians.append(np.median(sample))
        alpha = 0.05
        return (np.percentile(boot_medians, 100*alpha/2), 
                np.percentile(boot_medians, 100*(1-alpha/2)))
    
    def _apply_bonferroni_correction(self, comparisons: Dict[str, MetricComparison]):
        """Apply Bonferroni correction for multiple comparisons."""
        m = len(comparisons)
        for comp in comparisons.values():
            comp.p_value_bonferroni = min(comp.p_value * m, 1.0)
            comp.wilcoxon_p_bonferroni = min(comp.wilcoxon_p_value * m, 1.0)
            comp.significant_bonferroni = comp.p_value_bonferroni < 0.05

class ComparisonReport:
    """Full comparison report with visualizations."""
    
    def __init__(self, experiment_name: str, analyzer: ComparisonAnalyzer):
        self.experiment_name = experiment_name
        self.analyzer = analyzer
        self.comparisons: Dict[str, MetricComparison] = {}
        self.scenario_names: List[str] = []
        self.timestamp = datetime.utcnow()
    
    def add_comparison(self, scenario_a: str, scenario_b: str, 
                       results_a: ScenarioResult, results_b: ScenarioResult,
                       metrics: List[str]):
        comps = self.analyzer.compare_scenarios(results_a, results_b, metrics)
        for metric, comp in comps.items():
            key = f"{scenario_a}_vs_{scenario_b}_{metric}"
            self.comparisons[key] = comp
    
    def to_html(self, output_path: Path) -> str:
        """Generate interactive HTML report with charts."""
        # Implementation would use Plotly/Altair for interactive viz
        pass
    
    def to_json(self, output_path: Path):
        """Export structured JSON for programmatic access."""
        data = {
            "experiment": self.experiment_name,
            "timestamp": self.timestamp.isoformat(),
            "comparisons": {
                k: {
                    "metric": v.metric_name,
                    "scenario_a": v.scenario_a,
                    "scenario_b": v.scenario_b,
                    "mean_a": v.mean_a, "mean_b": v.mean_b,
                    "mean_diff": v.mean_diff, "pct_change": v.pct_change,
                    "p_value": v.p_value, "ci_95": v.ci_95,
                    "cohens_d": v.cohens_d, "effect_interpretation": v.effect_interpretation,
                    "practically_significant": v.practically_significant,
                    "p_value_bonferroni": getattr(v, 'p_value_bonferroni', None),
                }
                for k, v in self.comparisons.items()
            }
        }
        with open(output_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
```

---

## Key Metrics for Staffing Comparison

### Primary Outcome Metrics

| Metric Category | Specific Metrics | Target/Threshold |
|-----------------|------------------|------------------|
| **Response Time Fractiles** | p50, p90, p95 by priority (1-5) | NFPA 1710: p90 ≤ 360s (fire), p90 ≤ 300s (EMS) |
| **Unit Utilization (UHU)** | Per-unit, per-shift | 0.3-0.4 (fire), 0.4-0.5 (EMS) |
| **Workload Equity** | CV of calls/unit, high-acuity exposure | CV < 0.2 |
| **Coverage** | Uncovered incidents, simultaneous calls | 0 uncovered, < 5% simultaneous |
| **Fractile Compliance** | % within target time | NFPA 1710/1720 |
| **Cost** | FTE cost, overtime, cost/incident | Budget constraints |
| **Equity** | Response time by demographic quintile | Max disparity < 20% |

### Equity Analysis Framework

```python
def analyze_equity(results: ScenarioResult, demographics: pd.DataFrame) -> EquityReport:
    """Analyze response time equity across demographic groups."""
    
    # Join incidents with demographic data
    incidents_df = pd.DataFrame(results.incident_details)
    incidents_with_demo = incidents_df.merge(demographics, on='census_tract')
    
    # Assign demographic quintiles
    incidents_with_demo['income_quintile'] = pd.qcut(
        incidents_with_demo['median_income'], 5, labels=[1,2,3,4,5]
    )
    
    # Response time by quintile and priority
    equity_data = {}
    for priority in [1,2,3,4,5]:
        priority_data = incidents_with_demo[incidents_with_demo['priority'] == priority]
        if len(priority_data) == 0:
            continue
            
        quintile_stats = priority_data.groupby('income_quintile')['response_time_seconds'].agg([
            'median', 'mean', 'std', 'count', 
            lambda x: np.percentile(x, 90)
        ]).rename(columns={'<lambda_0>': 'p90'})
        
        equity_data[f'priority_{priority}'] = quintile_stats.to_dict()
    
    # Calculate disparity metrics
    max_disparity = {}
    for priority in [1,2,3,4,5]:
        key = f'priority_{priority}'
        if key in equity_data:
            medians = [equity_data[key][q]['median'] for q in [1,2,3,4,5] if q in equity_data[key]]
            if medians:
                max_disparity[priority] = (max(medians) - min(medians)) / np.mean(medians) * 100
    
    return EquityReport(
        response_time_by_quintile=equity_data,
        max_disparity_pct=max_disparity,
        overall_equity_score=1 - np.mean(list(max_disparity.values())) / 100 if max_disparity else 1.0
    )
```

---

## Cost-Benefit Analysis Framework

```python
def analyze_cost_benefit(baseline: ScenarioResult, variant: ScenarioResult, 
                         staffing_costs: Dict[str, float]) -> CostBenefitReport:
    """Calculate cost-benefit of staffing changes."""
    
    # Calculate cost difference
    baseline_cost = calculate_total_cost(baseline, staffing_costs)
    variant_cost = calculate_total_cost(variant, staffing_costs)
    cost_difference = variant_cost - baseline_cost
    
    # Calculate benefit (response time improvement)
    baseline_p90_p1 = baseline.aggregated_metrics.p90_response_time_priority_1
    variant_p90_p1 = variant.aggregated_metrics.p90_response_time_priority_1
    time_saved_per_incident = baseline_p90_p1 - variant_p90_p1
    
    total_incidents = variant.summary.total_incidents
    total_time_saved = time_saved_per_incident * total_incidents
    
    # Cost per second saved
    cost_per_second = cost_difference / total_time_saved if total_time_saved > 0 else np.inf
    
    # Fractile compliance improvement
    baseline_compliance = baseline.aggregated_metrics.fractile_compliance_p1
    variant_compliance = variant.aggregated_metrics.fractile_compliance_p1
    compliance_improvement = variant_compliance - baseline_compliance
    
    return CostBenefitReport(
        cost_difference=cost_difference,
        time_saved_per_incident=time_saved_per_incident,
        total_time_saved_hours=total_time_saved / 3600,
        cost_per_second_saved=cost_per_second,
        compliance_improvement_pct=compliance_improvement * 100,
        cost_per_compliance_point=cost_difference / (compliance_improvement * 100) if compliance_improvement > 0 else np.inf,
        roi=total_time_saved * 100 / cost_difference if cost_difference > 0 else np.inf  # arbitrary value per hour
    )
```

---

## Experimental Validation Checklist

Before running full experiments:

- [ ] **Face Validity**: Do baseline metrics match real-world ranges?
  - UHU 0.3-0.5? Response times reasonable?
- [ ] **Internal Validity**: Do paired tests show expected directions?
  - Adding resources → better response times?
- [ ] **Statistical Power**: Can we detect meaningful effects?
  - Power analysis: n=30, effect size=0.5 → power > 0.95
- [ ] **Reproducibility**: Same seed → identical results?
- [ ] **Sensitivity**: Do results change reasonably with volume ±20%?
- [ ] **Face Validity of Dynamic Policies**: Do ML policies make sensible decisions?
  - Recall when utilization > 0.8? Position near predicted demand?

---

## Example Experiment: Station Closure Equity Analysis

```yaml
# config/experiments/station_closure_equity.yaml
experiment:
  name: "Station_2_Closure_Equity_Analysis"
  description: "Measure equity impact of closing Station 2"
  
  fixed:
    town_gpkg: "DATA/synthetic_towns/town_v1.gpkg"
    incidents_parquet: "DATA/incidents/incidents_50k.parquet"
    date_range: ["2024-01-01", "2024-12-31"]
    realism_config: "config/realism/my_center.yaml"
    random_seed: 4242
    
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
      
  replications: 30
  metrics:
    - response_time_fractiles
    - equity_metrics
    - coverage_gaps
    - cost_metrics
    
  analysis:
    paired_test: true
    equity_analysis: true
    demographic_quintiles: true
```

---

## Key Research Questions This Framework Answers

| Question | Experiment Design | Key Metric |
|----------|-------------------|------------|
| How many medics for NFPA compliance? | Add 1, 2, 3 medics incrementally | p90 response time vs medic count |
| Dynamic vs fixed peak staffing? | ML-driven vs fixed overlay | Cost per fractile point |
| Station closure equity impact? | Close station, measure by quintile | Disparity index by income |
| Cross-staffing tradeoffs? | Engine+Medic vs separate | Fire vs EMS response time tradeoff |
| Marginal benefit curve? | Add 1,2,3,4,5 units sequentially | Marginal benefit per FTE |
| Surge capacity? | Simulate +50% volume surge | Coverage gap at surge |

---

## Implementation Checklist

- [ ] Define `StaffingConfig` Pydantic models
- [ ] Implement `StaffingScenario` loader with inheritance
- [ ] Build `DynamicStaffingPolicy` abstract base class
- [ ] Implement `RuleBasedDynamicPolicy` and `MLStaffingPolicy`
- [ ] Create `ExperimentRunner` with parallel replication
- [ ] Implement `ComparisonAnalyzer` with paired t-tests
- [ ] Build `ExperimentConfig` YAML schema
- [ ] Add `equity_analysis` to metrics
- [ ] Create HTML report generator with Plotly
- [ ] Add regression baseline for CI
- [ ] Write integration tests for full pipeline

---

*This framework enables rigorous, reproducible staffing research with statistical rigor. The controlled experiment design (identical volumes, paired tests) isolates the effect of staffing changes with high internal validity.*