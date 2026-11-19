# PSAP Research — Decision Engineering & Analytics Engineering Integration

> **Mapping modern decision engineering & analytics engineering trends to the PSAP Research simulation ecosystem**

---

## Executive Summary

This document maps current trends in **Decision Engineering** (Decision Intelligence) and **Analytics Engineering** to the PSAP Research simulation ecosystem, ensuring the platform leverages modern best practices for data-driven decision making, ML operations, and analytical rigor.

---

## 1. Decision Engineering Trends → PSAP Research Integration

### 1.1 Decision Intelligence (DI) Framework

**Trend**: *Gartner's Decision Intelligence — combining data science, social science, and managerial science to improve organizational decision making.*

**PSAP Research Application**:

```python
# psap_research/decision_engineering/intelligence.py
from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum
from datetime import datetime

class DecisionType(Enum):
    STRATEGIC = "strategic"      # Station placement, fleet sizing
    TACTICAL = "tactical"        # Shift scheduling, resource allocation
    OPERATIONAL = "operational"  # Real-time dispatch, pre-positioning
    EXPERIMENTAL = "experimental" # A/B testing, scenario analysis

@dataclass
class DecisionContext:
    """Context for a decision — the 'why' and 'when'."""
    decision_type: DecisionType
    decision_id: str
    timestamp: datetime
    decision_maker: str  # human, ml_policy, rule_engine
    constraints: Dict[str, any]
    objectives: List[Objective]
    available_actions: List[Action]
    uncertainty_estimate: float  # 0-1

@dataclass
class Objective:
    name: str
    metric: str
    target: float
    weight: float
    direction: str  # maximize, minimize, target

@dataclass
class Action:
    action_id: str
    description: str
    parameters: Dict[str, any]
    predicted_outcomes: Dict[str, float]
    confidence: float
    cost_estimate: float

@dataclass
class DecisionRecord:
    """Immutable record of a decision for audit & learning."""
    context: DecisionContext
    selected_action: Action
    rationale: str
    predicted_outcomes: Dict[str, float]
    actual_outcomes: Optional[Dict[str, float]] = None
    feedback_score: Optional[float] = None  # post-hoc evaluation
```

**Integration Points**:
- **Simulation Engine**: Every dispatch decision recorded as `DecisionRecord`
- **Staffing Scenarios**: Strategic decisions (station placement) vs tactical (shift config)
- **ML Policies**: `DynamicStaffingPolicy` implements `decide(context) → Action`
- **Experiment Framework**: Each scenario = decision, replication = observation

---

### 1.2 Causal Inference for Decision Making

**Trend**: *Moving beyond correlation to causation — do X, what happens to Y?*

**PSAP Research Application**:

```python
# psap_research/decision_engineering/causal.py
from dataclasses import dataclass
from typing import Dict, List, Optional, Callable
import numpy as np
from scipy import stats

@dataclass
class CausalQuestion:
    """What would happen if we intervene on X?"""
    treatment: str           # e.g., "add_medic_station_2"
    outcome: str             # e.g., "p90_response_time_p1"
    population: str          # "all_incidents" or "priority_1_fire"
    confounders: List[str]   # ["time_of_day", "weather", "simultaneous_incidents"]

@dataclass
class CausalEstimate:
    ate: float                    # Average Treatment Effect
    ate_ci: tuple                 # Confidence interval
    cate: Dict[str, float]        # Conditional ATE by subgroup
    method: str                   # "matching", "iv", "g_computation", "dml"
    assumptions_checked: List[str]  # ["unconfoundedness", "overlap", "positivity"]

class CausalInferenceEngine:
    """Estimate causal effects from simulation data."""
    
    def __init__(self, simulation_data: pd.DataFrame):
        self.data = simulation_data
    
    def estimate_ate(
        self, 
        question: CausalQuestion,
        method: str = "dml"  # Double ML for high-dimensional confounders
    ) -> CausalEstimate:
        """Estimate Average Treatment Effect using Double ML."""
        from sklearn.ensemble import RandomForestRegressor
        from econml.dml import DML
        
        # Prepare data
        X = self.data[question.confounders]
        T = (self.data['scenario'] == question.treatment).astype(int)
        Y = self.data[question.outcome]
        
        # Double ML with Random Forest
        model_y = RandomForestRegressor(n_estimators=100)
        model_t = RandomForestRegressor(n_estimators=100)
        
        dml = DML(model_y=model_y, model_t=model_t, n_folds=5)
        dml.fit(Y, T, X=X)
        
        ate = dml.ate(X)
        ate_ci = dml.ate_interval(X, alpha=0.05)
        
        # CATE by subgroups
        cate = {}
        for subgroup in ['hour_of_day', 'weather', 'zone']:
            cate[subgroup] = dml.ate(X).mean()  # simplified
        
        return CausalEstimate(
            ate=ate,
            ate_ci=(ate - 1.96*dml.ate_se(X), ate + 1.96*dml.ate_se(X)),
            cate=cate,
            method="dml",
            assumptions_checked=["unconfoundedness", "overlap"]
        )
    
    def sensitivity_analysis(self, estimate: CausalEstimate) -> Dict:
        """Rosenbaum bounds for unobserved confounding."""
        # How strong would unobserved confounding need to be to explain away the effect?
        from statsmodels.stats.proportion import proportion_effectsize
        gamma = 1.0
        while gamma < 5.0:
            # Rosenbaum bounds calculation
            if self._would_explain_away(estimate.ate, gamma):
                break
            gamma += 0.1
        return {"critical_gamma": gamma, "interpretation": f"Unobserved confounder would need γ={gamma:.1f} to explain away effect"}
```

**Use Cases**:
- "What's the *causal* effect of adding a medic unit on P90 response time?"
- "Is the improvement from dynamic staffing *caused* by the policy or by volume changes?"
- "Which subpopulations benefit most from Station 4 placement?"

---

### 1.3 Decision Augmentation (Human-in-the-Loop)

**Trend**: *AI recommends, human decides — with explainability and override capability.*

```python
# psap_research/decision_engineering/augmentation.py
from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum

class AugmentationLevel(Enum):
    NONE = "none"                    # Human only
    ALERTS = "alerts"                # System flags anomalies
    RECOMMENDATIONS = "recommendations"  # System suggests actions
    SEMI_AUTO = "semi_auto"          # System acts, human confirms
    FULL_AUTO = "full_auto"          # System acts, human monitors

@dataclass
class AugmentedDecision:
    """Decision with AI augmentation metadata."""
    decision_id: str
    human_decision: str
    ai_recommendation: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_rationale: Optional[str] = None
    feature_importance: Dict[str, float] = {}
    counterfactuals: List[str] = []  # "If we did X instead, Y would happen"
    augmentation_level: AugmentationLevel
    human_override: bool = False
    override_reason: Optional[str] = None

class DecisionAugmenter:
    """Provides AI augmentation for human decision makers."""
    
    def __init__(self, level: AugmentationLevel = AugmentationLevel.RECOMMENDATIONS):
        self.level = level
    
    def augment_dispatch_decision(
        self,
        incident: Incident,
        available_units: List[Unit],
        router: Router,
        context: Dict
    ) -> AugmentedDecision:
        """Augment dispatch decision with ML recommendations."""
        
        # Get ML recommendation
        ml_rec = self._get_ml_recommendation(incident, available_units)
        
        # Generate counterfactuals
        counterfactuals = self._generate_counterfactuals(incident, available_units)
        
        # Feature importance for explainability
        importance = self._compute_feature_importance(incident)
        
        return AugmentedDecision(
            decision_id=f"dispatch_{incident.incident_id}",
            human_decision="",  # To be filled by human
            ai_recommendation=ml_rec,
            ai_confidence=ml_rec.confidence if ml_rec else None,
            ai_rationale=ml_rec.rationale if ml_rec else None,
            feature_importance=importance,
            counterfactuals=counterfactuals,
            augmentation_level=self.level
        )
    
    def record_override(self, decision: AugmentedDecision, reason: str):
        """Record human override for model improvement."""
        decision.human_override = True
        decision.override_reason = reason
        # Log for active learning
        self._log_override(decision)
```

---

## 2. Analytics Engineering Trends → PSAP Research Integration

### 2.1 Modern Data Stack Patterns

**Trend**: *dbt-style transformation layer, semantic layer, data contracts, data observability.*

```python
# psap_research/analytics_engineering/data_stack.py
from dataclasses import dataclass
from typing import Dict, List, Optional
from enum import Enum
from pathlib import Path

class DataLayer(Enum):
    RAW = "raw"              # Bronze — immutable source
    STAGING = "staging"      # Bronze → Silver cleaning
    INTERMEDIATE = "intermediate"  # Silver — business logic
    MARTS = "marts"          # Gold — analytical models
    FEATURE_STORE = "feature_store"  # ML features
    METRICS_LAYER = "metrics_layer"  # Semantic layer

@dataclass
class DataContract:
    """Data contract — schema + SLA + ownership."""
    dataset_name: str
    layer: DataLayer
    schema: Dict[str, str]  # column -> type
    primary_keys: List[str]
    freshness_sla: str  # e.g., "1h", "24h"
    quality_rules: List[QualityRule]
    owner: str
    description: str
    
    def validate(self, df: pd.DataFrame) -> ValidationResult:
        """Validate dataframe against contract."""
        # Check schema
        # Check primary keys
        # Check freshness
        # Check quality rules
        pass

@dataclass
class QualityRule:
    column: str
    rule_type: str  # "not_null", "unique", "range", "regex", "custom"
    parameters: Dict
    severity: str  # "error", "warning"

class AnalyticsPipeline:
    """dbt-style transformation pipeline for PSAP Research data."""
    
    def __init__(self, project_dir: Path):
        self.project_dir = project_dir
        self.contracts: Dict[str, DataContract] = {}
    
    def register_contract(self, contract: DataContract):
        self.contracts[contract.dataset_name] = contract
    
    def run_transformation(
        self, 
        model_name: str, 
        sql: str, 
        materialization: str = "view"
    ) -> pd.DataFrame:
        """Execute SQL transformation with contract validation."""
        # Execute SQL
        # Validate output against contract
        # Write to appropriate layer
        # Update lineage
        pass
    
    def build_mart(self, mart_name: str, dependencies: List[str]) -> pd.DataFrame:
        """Build analytical mart from intermediate models."""
        # Execute DAG of transformations
        # Validate final output
        pass

# Example: PSAP Research Data Contracts
PSAP_CONTRACTS = {
    "incidents_raw": DataContract(
        dataset_name="incidents_raw",
        layer=DataLayer.RAW,
        schema={
            "incident_id": "string",
            "call_start_time": "timestamp",
            "priority": "int",
            "agency": "string",
            "latitude": "float64",
            "longitude": "float64",
            # ... all SynthCCD fields
        },
        primary_keys=["incident_id"],
        freshness_sla="1h",
        quality_rules=[
            QualityRule("incident_id", "not_null", {}, "error"),
            QualityRule("priority", "range", {"min": 1, "max": 5}, "error"),
            QualityRule("latitude", "range", {"min": -90, "max": 90}, "error"),
        ],
        owner="simulation_engine",
        description="Raw incidents from SynthCCD + simulation"
    ),
    
    "incidents_enriched": DataContract(
        dataset_name="incidents_enriched",
        layer=DataLayer.INTERMEDIATE,
        schema={...},  # enriched with travel_time, unit_assigned, etc.
        primary_keys=["incident_id"],
        freshness_sla="1h",
        quality_rules=[...],
        owner="simulation_engine",
        description="Incidents enriched with simulation outcomes"
    ),
    
    "hourly_metrics": DataContract(
        dataset_name="hourly_metrics",
        layer=DataLayer.MARTS,
        schema={
            "hour_start": "timestamp",
            "p90_response_p1": "float64",
            "unit_engine_1_uhu": "float64",
            # ...
        },
        primary_keys=["hour_start"],
        freshness_sla="1h",
        quality_rules=[...],
        owner="metrics_collector",
        description="Hourly aggregated metrics for dashboards"
    ),
}
```

---

### 2.2 Semantic Layer / Metrics Layer

**Trend**: *Unified metrics definitions — single source of truth for KPIs.*

```python
# psap_research/analytics_engineering/metrics_layer.py
from dataclasses import dataclass
from typing import Dict, List, Optional, Callable
from enum import Enum

class MetricType(Enum):
    COUNTER = "counter"           # Count of events
    GAUGE = "gauge"               # Point-in-time value
    HISTOGRAM = "histogram"       # Distribution
    FRACTILE = "fractile"         # Percentile
    RATE = "rate"                 # Per-unit-time

@dataclass
class MetricDefinition:
    """Single source of truth for a metric."""
    name: str
    display_name: str
    description: str
    metric_type: MetricType
    formula: str  # SQL or Python expression
    dimensions: List[str]  # e.g., ["priority", "zone", "hour"]
    unit: str  # "seconds", "percent", "count"
    owner: str
    tags: List[str]
    # For fractiles
    percentiles: Optional[List[int]] = None  # [50, 90, 95]
    # For SLAs
    sla_target: Optional[float] = None
    sla_direction: Optional[str] = None  # "below" or "above"

class MetricsLayer:
    """Semantic layer — single source of truth for all metrics."""
    
    def __init__(self):
        self.metrics: Dict[str, MetricDefinition] = {}
        self._register_core_metrics()
    
    def _register_core_metrics(self):
        """Register all PSAP Research standard metrics."""
        
        # Response Time Metrics
        for priority in [1, 2, 3, 4, 5]:
            self.register(MetricDefinition(
                name=f"response_time_p{priority}",
                display_name=f"Response Time Priority {priority}",
                description=f"Time from call received to first unit arrived for priority {priority}",
                metric_type=MetricType.FRACTILE,
                formula="""
                    SELECT 
                        percentile_cont(0.50) WITHIN GROUP (ORDER BY response_time) as p50,
                        percentile_cont(0.90) WITHIN GROUP (ORDER BY response_time) as p90,
                        percentile_cont(0.95) WITHIN GROUP (ORDER BY response_time) as p95
                    FROM incidents 
                    WHERE priority = {priority}
                """.format(priority=priority),
                dimensions=["priority", "zone", "hour", "shift"],
                unit="seconds",
                percentiles=[50, 90, 95],
                sla_target={1: 360, 2: 360, 3: 480, 4: 600, 5: 900}.get(priority),
                sla_direction="below",
                owner="operations",
                tags=["response_time", "nfpa_1710"]
            ))
        
        # Unit Utilization
        self.register(MetricDefinition(
            name="unit_hour_utilization",
            display_name="Unit Hour Utilization",
            description="Fraction of shift time unit is committed to incidents",
            metric_type=MetricType.GAUGE,
            formula="SUM(committed_seconds) / shift_hours / 3600",
            dimensions=["unit_id", "apparatus_type", "station", "shift"],
            unit="ratio",
            owner="operations",
            tags=["utilization", "capacity_planning"]
        ))
        
        # Equity Metric
        self.register(MetricDefinition(
            name="response_time_equity",
            display_name="Response Time Equity Index",
            description="1 - (max_quintile_median - min_quintile_median) / overall_median",
            metric_type=MetricType.GAUGE,
            formula="""
                1 - (
                    MAX(median_response_by_quintile) - MIN(median_response_by_quintile)
                ) / AVG(median_response_by_quintile)
            """,
            dimensions=["priority", "demographic_attribute"],
            unit="index",
            sla_target=0.8,  # Equity score > 0.8
            sla_direction="above",
            owner="equity_analysis",
            tags=["equity", "nfpa_1730", "environmental_justice"]
        ))
    
    def register(self, metric: MetricDefinition):
        self.metrics[metric.name] = metric
    
    def get_metric(self, name: str) -> Optional[MetricDefinition]:
        return self.metrics.get(name)
    
    def resolve(self, metric_name: str, dimensions: Dict[str, any]) -> str:
        """Resolve metric to executable SQL/Python."""
        metric = self.metrics.get(metric_name)
        if not metric:
            raise ValueError(f"Metric {metric_name} not defined")
        
        # Substitute dimension values into formula
        formula = metric.formula
        for dim, value in dimensions.items():
            formula = formula.replace(f"{{{dim}}}", str(value))
        return formula
```

---

### 2.3 Feature Store for ML

**Trend**: *Centralized feature management — consistent features for training & inference.*

```python
# psap_research/analytics_engineering/feature_store.py
from dataclasses import dataclass
from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum

class FeatureType(Enum):
    NUMERICAL = "numerical"
    CATEGORICAL = "categorical"
    TEMPORAL = "temporal"
    SPATIAL = "spatial"
    DERIVED = "derived"

@dataclass
class FeatureDefinition:
    name: str
    feature_type: FeatureType
    description: str
    source: str  # "geography", "incidents", "weather", "personnel"
    transformation: str  # SQL or Python expression
    entity_keys: List[str]  # ["incident_id"], ["station_id", "hour"]
    timestamp_key: str  # event_time
    tags: List[str]
    owner: str

class FeatureStore:
    """Centralized feature management for ML policies."""
    
    def __init__(self, store_path: str):
        self.store_path = Path(store_path)
        self.registry: Dict[str, FeatureDefinition] = {}
    
    def register_feature(self, feature: FeatureDefinition):
        self.registry[feature.name] = feature
    
    def get_features(
        self, 
        entity_keys: Dict[str, any], 
        feature_names: List[str],
        timestamp: datetime
    ) -> pd.DataFrame:
        """Retrieve features for entity at point in time."""
        # Point-in-time lookup with temporal joins
        pass
    
    def get_training_data(
        self,
        feature_names: List[str],
        label_name: str,
        start_date: datetime,
        end_date: datetime
    ) -> Tuple[pd.DataFrame, pd.Series]:
        """Generate training dataset with point-in-time correctness."""
        pass

# PSAP Research Feature Definitions
FEATURE_DEFINITIONS = [
    FeatureDefinition(
        name="incident_hour",
        feature_type=FeatureType.TEMPORAL,
        description="Hour of day (0-23)",
        source="incidents",
        transformation="EXTRACT(HOUR FROM call_start_time)",
        entity_keys=["incident_id"],
        timestamp_key="call_start_time",
        tags=["temporal", "demand_pattern"]
    ),
    
    FeatureDefinition(
        name="station_utilization_1h",
        feature_type=FeatureType.NUMERICAL,
        description="Station utilization in last hour",
        source="metrics",
        transformation="AVG(unit_utilization) OVER (PARTITION BY station_id ORDER BY hour ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)",
        entity_keys=["station_id"],
        timestamp_key="hour_start",
        tags=["utilization", "capacity"]
    ),
    
    FeatureDefinition(
        name="incidents_last_hour",
        feature_type=FeatureType.NUMERICAL,
        description="Incident count in last hour by zone",
        source="incidents",
        transformation="COUNT(*) OVER (PARTITION BY zone_id ORDER BY call_start_time RANGE BETWEEN INTERVAL '1 HOUR' PRECEDING AND CURRENT ROW)",
        entity_keys=["zone_id"],
        timestamp_key="call_start_time",
        tags=["demand", "spatial"]
    ),
    
    FeatureDefinition(
        name="weather_severity",
        feature_type=FeatureType.CATEGORICAL,
        description="Weather severity index",
        source="weather",
        transformation="CASE WHEN precip > 0.5 THEN 'heavy' WHEN precip > 0.1 THEN 'light' ELSE 'clear' END",
        entity_keys=["zone_id"],
        timestamp_key="timestamp",
        tags=["weather", "external"]
    ),
    
    FeatureDefinition(
        name="unit_availability_ratio",
        feature_type=FeatureType.NUMERICAL,
        description="Fraction of units available at station",
        source="units",
        transformation="COUNT(CASE WHEN state='AVAILABLE' THEN 1 END) / COUNT(*) OVER (PARTITION BY station_id)",
        entity_keys=["station_id"],
        timestamp_key="timestamp",
        tags=["availability", "capacity"]
    ),
]
```

---

### 2.4 Data Contracts & Quality (Data Contracts)

**Trend**: *Schema-as-contract with SLAs, ownership, and automated validation.*

```python
# psap_research/analytics_engineering/contracts.py
from dataclasses import dataclass
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

class Severity(Enum):
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"

@dataclass
class DataQualityCheck:
    name: str
    sql: str
    threshold: float
    severity: Severity
    description: str

@dataclass
class DataContract:
    """Data contract with schema, SLA, quality rules, and lineage."""
    name: str
    version: str
    description: str
    owner: str
    schema: Dict[str, str]  # column -> type
    primary_keys: List[str]
    partition_keys: List[str]
    freshness_sla: str  # e.g., "1h", "24h"
    quality_checks: List[DataQualityCheck]
    upstream_dependencies: List[str]
    downstream_consumers: List[str]
    pii_columns: List[str] = field(default_factory=list)
    retention_period: str = "2y"
    
    def validate(self, df: pd.DataFrame) -> ValidationResult:
        """Validate dataframe against contract."""
        results = []
        
        # Schema validation
        for col, expected_type in self.schema.items():
            if col not in df.columns:
                results.append(ValidationError(f"Missing column: {col}", "ERROR"))
            elif not self._check_type(df[col], expected_type):
                results.append(ValidationError(f"Column {col} type mismatch", "WARNING"))
        
        # Primary key uniqueness
        if self.primary_keys:
            dup_count = df.duplicated(subset=self.primary_keys).sum()
            if dup_count > 0:
                results.append(ValidationError(
                    f"Primary key violation: {dup_count} duplicates", "ERROR"))
        
        # Quality checks
        for check in self.quality_checks:
            # Execute check SQL against df
            pass
        
        return ValidationResult(passed=len([r for r in results if r.severity=="ERROR"])==0, issues=results)
```

---

### 2.5 Data Observability & Lineage

**Trend**: *End-to-end visibility — freshness, volume, schema, quality, lineage.*

```python
# psap_research/analytics_engineering/observability.py
from dataclasses import dataclass
from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum

class AlertSeverity(Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"

@dataclass
class DataHealthMetrics:
    """Health metrics for a dataset."""
    dataset_name: str
    timestamp: datetime
    row_count: int
    freshness_hours: float  # hours since last update
    schema_changes: int  # count since last check
    quality_score: float  # 0-1
    volume_anomaly: bool
    freshness_anomaly: bool
    schema_anomaly: bool

@dataclass
class LineageEdge:
    """Single lineage edge."""
    upstream: str
    downstream: str
    transformation: str  # SQL or function name
    column_mapping: Dict[str, str]

class DataObservability:
    """End-to-end data observability."""
    
    def __init__(self):
        self.lineage: Dict[str, List[LineageEdge]] = {}  # downstream -> edges
        self.health_history: List[DataHealthMetrics] = []
    
    def register_lineage(self, upstream: str, downstream: str, 
                         transformation: str, column_mapping: Dict[str, str]):
        """Register lineage edge."""
        if downstream not in self.lineage:
            self.lineage[downstream] = []
        self.lineage[downstream].append(LineageEdge(
            upstream=upstream,
            downstream=downstream,
            transformation=transformation,
            column_mapping=column_mapping
        ))
    
    def get_upstream_lineage(self, dataset: str, depth: int = 5) -> List[str]:
        """Get upstream dependencies up to depth."""
        visited = set()
        result = []
        
        def traverse(ds: str, d: int):
            if d >= depth or ds in visited:
                return
            visited.add(ds)
            for edge in self.lineage.get(ds, []):
                result.append(edge.upstream)
                traverse(edge.upstream, d + 1)
        
        traverse(dataset, 0)
        return result
    
    def get_downstream_impact(self, dataset: str, depth: int = 5) -> List[str]:
        """Get downstream consumers up to depth."""
        # Reverse lookup
        pass
    
    def check_health(self, dataset_name: str, df: pd.DataFrame) -> DataHealthMetrics:
        """Run health checks on dataset."""
        # Freshness
        last_update = self._get_last_update(dataset_name)
        freshness = (datetime.now() - last_update).total_seconds() / 3600
        
        # Volume
        row_count = len(df)
        expected_range = self._get_expected_volume(dataset_name)
        volume_anomaly = not (expected_range[0] <= row_count <= expected_range[1])
        
        # Schema
        schema_changes = self._detect_schema_changes(dataset_name, df)
        
        # Quality
        quality_score = self._compute_quality_score(df)
        
        return DataHealthMetrics(
            dataset_name=dataset_name,
            timestamp=datetime.now(),
            row_count=row_count,
            freshness_hours=freshness,
            schema_changes=schema_changes,
            quality_score=quality_score,
            volume_anomaly=volume_anomaly,
            freshness_anomaly=freshness > 2,  # 2 hour SLA
            schema_anomaly=schema_changes > 0
        )
```

---

## 3. ML Operations (MLOps) for Dynamic Staffing

### 3.1 ML Pipeline Architecture

```python
# psap_research/mlops/pipeline.py
from dataclasses import dataclass
from typing import Dict, List, Optional
from enum import Enum
from datetime import datetime
from pathlib import Path
import mlflow
import pandas as pd

class ModelStage(Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    ARCHIVED = "archived"

@dataclass
class ModelVersion:
    model_name: str
    version: str
    stage: ModelStage
    run_id: str
    metrics: Dict[str, float]
    parameters: Dict[str, any]
    training_data_hash: str
    created_at: datetime
    promoted_by: str
    promoted_at: Optional[datetime] = None

class MLPipeline:
    """End-to-end ML pipeline for dynamic staffing policies."""
    
    def __init__(self, experiment_name: str, feature_store: FeatureStore):
        self.experiment_name = experiment_name
        self.feature_store = feature_store
        mlflow.set_experiment(experiment_name)
    
    def train(
        self,
        model_name: str,
        training_config: Dict,
        start_date: datetime,
        end_date: datetime,
        label_name: str
    ) -> ModelVersion:
        """Train model with full MLflow tracking."""
        
        with mlflow.start_run() as run:
            # Log parameters
            mlflow.log_params(training_config)
            
            # Get training data from feature store
            X, y = self.feature_store.get_training_data(
                feature_names=training_config['features'],
                label_name=label_name,
                start_date=start_date,
                end_date=end_date
            )
            
            # Train model
            model = self._train_model(X, y, training_config)
            
            # Evaluate
            metrics = self._evaluate(model, X, y)
            
            # Log metrics
            mlflow.log_metrics(metrics)
            
            # Log model
            mlflow.sklearn.log_model(model, "model")
            
            # Register model
            model_uri = f"runs:/{run.info.run_id}/model"
            mv = mlflow.register_model(model_uri, model_name)
            
            return ModelVersion(
                model_name=model_name,
                version=mv.version,
                stage=ModelStage.DEVELOPMENT,
                run_id=run.info.run_id,
                metrics=metrics,
                parameters=training_config,
                training_data_hash=self._hash_data(X, y),
                created_at=datetime.now(),
                promoted_by="pipeline"
            )
    
    def promote(self, model_name: str, version: str, target_stage: ModelStage):
        """Promote model through stages with validation."""
        client = mlflow.MlflowClient()
        
        if target_stage == ModelStage.STAGING:
            # Run validation suite
            validation_results = self._validate_model(model_name, version)
            if not validation_results.passed:
                raise ValueError(f"Model failed validation: {validation_results.failures}")
        
        client.transition_model_version_stage(
            name=model_name,
            version=version,
            stage=target_stage.value,
            archive_existing_versions=True
        )
    
    def deploy_to_production(self, model_name: str, version: str):
        """Deploy to production with canary rollout."""
        self.promote(model_name, version, ModelStage.STAGING)
        # Run A/B test or shadow mode
        self._canary_deploy(model_name, version)
        self.promote(model_name, version, ModelStage.PRODUCTION)
```

---

### 3.2 Model Monitoring & Drift Detection

```python
# psap_research/mlops/monitoring.py
from dataclasses import dataclass
from typing import Dict, List, Optional
from datetime import datetime
import numpy as np
from scipy import stats

@dataclass
class DriftReport:
    model_name: str
    feature_name: str
    drift_type: str  # "data_drift", "concept_drift", "prediction_drift"
    severity: str  # "low", "medium", "high", "critical"
    metric_value: float
    threshold: float
    detected_at: datetime
    details: Dict

class ModelMonitor:
    """Monitor production models for drift."""
    
    def __init__(self, reference_data: pd.DataFrame):
        self.reference_data = reference_data
        self.baseline_stats = self._compute_baseline_stats(reference_data)
    
    def check_data_drift(
        self, 
        current_data: pd.DataFrame, 
        features: List[str]
    ) -> List[DriftReport]:
        """Detect data drift using PSI (Population Stability Index)."""
        reports = []
        
        for feature in features:
            if feature not in current_data.columns:
                continue
            
            ref_values = self.reference_data[feature].dropna()
            cur_values = current_data[feature].dropna()
            
            if len(ref_values) < 100 or len(cur_values) < 100:
                continue
            
            # Compute PSI
            psi = self._calculate_psi(ref_values, cur_values)
            
            severity = "low"
            if psi > 0.25:
                severity = "critical"
            elif psi > 0.1:
                severity = "medium"
            elif psi > 0.05:
                severity = "low"
            
            if severity != "low":
                reports.append(DriftReport(
                    model_name="staffing_policy",
                    feature_name=feature,
                    drift_type="data_drift",
                    severity=severity,
                    metric_value=psi,
                    threshold=0.1,
                    detected_at=datetime.now(),
                    details={"ref_mean": ref_values.mean(), "cur_mean": cur_values.mean()}
                ))
        
        return reports
    
    def check_concept_drift(
        self,
        predictions: np.ndarray,
        actuals: np.ndarray,
        features: pd.DataFrame
    ) -> List[DriftReport]:
        """Detect concept drift — P(y|x) changing."""
        # Monitor prediction accuracy over time
        # Use rolling window accuracy
        pass
    
    def _calculate_psi(self, ref: np.ndarray, cur: np.ndarray, bins: int = 10) -> float:
        """Population Stability Index."""
        # Bin reference data
        quantiles = np.percentile(ref, np.linspace(0, 100, bins + 1))
        quantiles = np.unique(quantiles)  # handle duplicates
        
        ref_hist, _ = np.histogram(ref, bins=quantiles)
        cur_hist, _ = np.histogram(cur, bins=quantiles)
        
        # Normalize
        ref_perc = ref_hist / len(ref)
        cur_perc = cur_hist / len(cur)
        
        # Avoid zeros
        ref_perc = np.where(ref_perc == 0, 0.0001, ref_perc)
        cur_perc = np.where(cur_perc == 0, 0.0001, cur_perc)
        
        psi = np.sum((cur_perc - ref_perc) * np.log(cur_perc / ref_perc))
        return psi
```

---

## 4. Real-time Analytics & Streaming

### 4.1 Event-Driven Architecture

```python
# psap_research/analytics_engineering/streaming.py
from dataclasses import dataclass
from typing import Dict, List, Optional, Callable
from datetime import datetime
from enum import Enum
import asyncio

class EventType(Enum):
    INCIDENT_CREATED = "incident_created"
    INCIDENT_DISPATCHED = "incident_dispatched"
    UNIT_ENROUTE = "unit_enroute"
    UNIT_ARRIVED = "unit_arrived"
    UNIT_CLEARED = "unit_cleared"
    UNIT_STATUS_CHANGE = "unit_status_change"
    STAFFING_DECISION = "staffing_decision"
    THRESHOLD_BREACH = "threshold_breach"

@dataclass
class Event:
    event_id: str
    event_type: EventType
    timestamp: datetime
    payload: Dict
    correlation_id: Optional[str] = None  # For tracing

class EventBus:
    """Async event bus for real-time analytics."""
    
    def __init__(self):
        self.subscribers: Dict[EventType, List[Callable]] = {}
    
    def subscribe(self, event_type: EventType, handler: Callable):
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(handler)
    
    async def publish(self, event: Event):
        if event.event_type in self.subscribers:
            await asyncio.gather(*[
                handler(event) for handler in self.subscribers[event.event_type]
            ])

class StreamProcessor:
    """Process event streams for real-time metrics."""
    
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        self.windows: Dict[str, List[Event]] = {}  # tumbling windows
    
    async def process_event(self, event: Event):
        # Update tumbling windows
        window_key = f"{event.event_type.value}_{event.timestamp.minute // 5}"  # 5-min windows
        if window_key not in self.windows:
            self.windows[window_key] = []
        self.windows[window_key].append(event)
        
        # Trigger windowed aggregations
        await self._aggregate_window(window_key)
        
        # Check thresholds
        await self._check_thresholds(event)
    
    async def _aggregate_window(self, window_key: str):
        events = self.windows.get(window_key, [])
        if not events:
            return
        
        # Compute real-time metrics
        metrics = {
            "window": window_key,
            "event_count": len(events),
            "event_types": Counter(e.event_type.value for e in events),
            "avg_response_time": self._compute_avg_response(events),
        }
        
        # Push to real-time dashboard
        await self._push_to_dashboard(metrics)
    
    async def _check_thresholds(self, event: Event):
        """Check for threshold breaches."""
        # e.g., response time > 300s, unit utilization > 0.9
        pass
```

---

## 5. Reverse ETL / Data Activation

### 5.1 Pushing Insights Back to Operations

```python
# psap_research/analytics_engineering/activation.py
from dataclasses import dataclass
from typing import Dict, List, Optional
from datetime import datetime

@dataclass
class ActivationTarget:
    """Where to push insights."""
    name: str
    type: str  # "cad", "dashboard", "alert", "api", "mobile"
    config: Dict
    schedule: str  # "realtime", "hourly", "daily"

@dataclass
class ActivationRule:
    """When to activate what data."""
    name: str
    condition: str  # SQL or expression
    target: ActivationTarget
    payload_template: Dict
    enabled: bool = True

class DataActivator:
    """Push insights from analytics back to operational systems."""
    
    def __init__(self):
        self.rules: List[ActivationRule] = []
    
    def register_rule(self, rule: ActivationRule):
        self.rules.append(rule)
    
    async def evaluate_and_activate(self, context: Dict):
        """Evaluate rules and activate matching ones."""
        for rule in self.rules:
            if not rule.enabled:
                continue
            
            if await self._evaluate_condition(rule.condition, context):
                await self._activate(rule, context)
    
    async def _activate(self, rule: ActivationRule, context: Dict):
        """Push data to target system."""
        payload = self._render_template(rule.payload_template, context)
        
        if rule.target.type == "cad":
            await self._push_to_cad(rule.target.config, payload)
        elif rule.target.type == "dashboard":
            await self._push_to_dashboard(rule.target.config, payload)
        elif rule.target.type == "alert":
            await self._send_alert(rule.target.config, payload)
        elif rule.target.type == "api":
            await self._call_api(rule.target.config, payload)

# Example Activation Rules
ACTIVATION_RULES = [
    ActivationRule(
        name="high_utilization_alert",
        condition="unit_utilization > 0.85 AND shift_remaining > 2h",
        target=ActivationTarget(
            name="dispatch_supervisor_alert",
            type="alert",
            config={"channel": "radio", "priority": "high"}
        ),
        payload_template={
            "message": "Unit {{unit_id}} at {{utilization*100}}% utilization",
            "action": "Consider recall or mutual aid"
        }
    ),
    
    ActivationRule(
        name="predicted_surge_preposition",
        condition="forecasted_volume_next_hour > 1.5 * baseline AND available_units < 3",
        target=ActivationTarget(
            name="preposition_recommendation",
            type="cad",
            config={"endpoint": "/api/v1/preposition"}
        ),
        payload_template={
            "recommended_station": "{{optimal_station}}",
            "recommended_units": "{{recommended_units}}",
            "confidence": "{{model_confidence}}"
        }
    ),
]
```

---

## 6. Architecture Decision Records (ADRs)

```markdown
# docs/adr/001-decision-engineering-framework.md
# ADR 001: Adopt Decision Intelligence Framework
## Status: Accepted
## Context
We need a structured approach to model, record, and learn from decisions in the simulation.
## Decision
Adopt Decision Intelligence framework with:
- Decision Records for audit trail
- Causal Inference for effect estimation
- Human-in-the-loop augmentation
- ML policies with explainability
## Consequences
- All dispatch decisions recorded as DecisionRecord
- Causal inference for staffing experiments
- Human-in-the-loop for critical decisions

# docs/adr/002-analytics-engineering-stack.md
# ADR 002: Modern Analytics Engineering Stack
## Status: Accepted
## Context
Need modern data practices for simulation data.
## Decision
Adopt:
- dbt-style transformation layer
- Semantic layer for metrics
- Feature store for ML
- Data contracts with SLAs
- Data observability & lineage

# docs/adr/003-mlops-for-staffing.md
# ADR 003: MLOps for Dynamic Staffing
## Status: Accepted
## Context
Dynamic staffing policies need production-grade ML.
## Decision
Implement:
- MLflow for experiment tracking
- Feature store for consistent features
- Model registry with staging
- Drift detection (PSI, concept drift)
- Canary deployment with shadow mode
```

---

## 7. Implementation Roadmap

| Phase | Decision Engineering | Analytics Engineering |
|-------|---------------------|----------------------|
| **Phase 0** | DecisionRecord schema, basic audit trail | Data contracts for core datasets |
| **Phase 1** | Causal inference for staffing experiments | dbt-style transformation layer, semantic layer |
| **Phase 2** | Human-in-the-loop dispatch augmentation | Feature store, ML pipeline |
| **Phase 3** | Causal analysis of experiment results | Feature store, ML pipeline, drift detection |
| **Phase 4** | Causal analysis of advanced ops | Streaming analytics, reverse ETL |
| **Phase 5** | Full decision audit trail | Full data observability, reverse ETL |

---

## 8. Tooling Recommendations

| Category | Recommended Tools | PSAP Research Choice |
|----------|-------------------|---------------------|
| **Experiment Tracking** | MLflow, Weights & Biases | MLflow (local, open source) |
| **Feature Store** | Feast, Tecton, Hopsworks | Custom lightweight (SQLite/Parquet) |
| **Orchestration** | Airflow, Dagster, Prefect | Prefect (Python-native) |
| **Transformation** | dbt, SQLMesh | Custom Python (SQLAlchemy + Pandas) |
| **Semantic Layer** | Cube, Metriql, dbt metrics | Custom MetricsLayer class |
| **Feature Store** | Feast, Hopsworks | Custom FeatureStore class |
| **Model Registry** | MLflow, Neptune | MLflow |
| **Monitoring** | Evidently, WhyLabs, Prometheus | Custom + Prometheus |
| **Streaming** | Kafka, Flink, RisingWave | AsyncIO + Redis Streams |
| **Reverse ETL** | Census, Hightouch, Airbyte | Custom Activator |
| **Observability** | Monte Carlo, Metaplane, Soda | Custom DataObservability |

---

## 9. Skills & Team Development

| Skill Area | Current | Target | Training |
|------------|---------|--------|----------|
| **Causal Inference** | Basic | Advanced | EconML, DoWhy tutorials |
| **MLOps** | Basic | Intermediate | MLflow, Prefect courses |
| **Analytics Engineering** | None | Intermediate | dbt Learn, Analytics Engineering cert |
| **Streaming Analytics** | None | Basic | Flink/AsyncIO tutorials |
| **Decision Intelligence** | None | Intermediate | DI frameworks, causal inference |

---

*This document ensures PSAP Research leverages cutting-edge decision engineering and analytics engineering practices, making the simulation ecosystem not just a data generator but a decision intelligence platform.*