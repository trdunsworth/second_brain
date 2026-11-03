# ML Pipeline Orchestration

Production-grade ML pipeline orchestration covering Kubeflow, Metaflow, Flyte, Dagster, and Argo Workflows at scale.

## 1. Orchestration Platform Comparison

| Platform | Paradigm | Language | Best For | Scalability |
|----------|----------|----------|----------|-------------|
| **Kubeflow Pipelines** | K8s-native, DSL | Python SDK / YAML | K8s-native orgs, large scale | Very High (K8s) |
| **Metaflow** | Python-first, notebook-friendly | Python | Data science teams, AWS | High (AWS Batch/K8s) |
| **Flyte** | Type-safe, K8s-native | Python/Protobuf | Strong typing, reproducibility | High (K8s) |
| **Dagster** | Asset-based, software-defined | Python | Data engineering, testing | High (K8s/ECS) |
| **Argo Workflows** | K8s-native, YAML/DSL | YAML/Python | K8s-native, GitOps | Very High (K8s) |
| **Airflow** | DAG-based, Python | Python | General ETL, mature ecosystem | Medium (Celery/K8s) |
| **Prefect** | Python-first, hybrid | Python | Modern Python teams | High (K8s/Cloud) |

---

## 2. Kubeflow Pipelines (KFP)

### 2.1 Core Concepts
```python
# KFP v2 SDK
from kfp import dsl, compiler
from kfp.dsl import component, pipeline, Input, Output, Dataset, Model, Metrics

# Component definition
@component(
    base_image="python:3.10",
    packages_to_install=["pandas", "scikit-learn", "boto3"]
)
def train_model(
    training_data: Input[Dataset],
    model_output: Output[Model],
    metrics_output: Output[Metrics],
    n_estimators: int = 100,
    max_depth: int = 5
):
    import pandas as pd
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.metrics import accuracy_score
    import joblib
    
    # Load data
    df = pd.read_parquet(training_data.path)
    X = df.drop('target', axis=1)
    y = df['target']
    
    # Train
    model = RandomForestClassifier(n_estimators=n_estimators, max_depth=max_depth)
    model.fit(X, y)
    
    # Save model
    joblib.dump(model, model_output.path)
    
    # Log metrics
    metrics = {"accuracy": 0.95}  # Compute actual
    with open(metrics_output.path, 'w') as f:
        json.dump(metrics, f)

# Pipeline definition
@pipeline(name="training-pipeline", description="Train RF model")
def training_pipeline(
    data_path: str = "s3://bucket/data/train.parquet",
    n_estimators: int = 100,
    max_depth: int = 5
):
    train_task = train_model(
        training_data=dsl.importer(artifact_uri=data_path, artifact_class=Dataset),
        n_estimators=n_estimators,
        max_depth=max_depth
    )
    train_task.set_cpu_limit("4").set_memory_limit("16G").set_gpu_limit("1")

# Compile
compiler.Compiler().compile(training_pipeline, "pipeline.yaml")
```

### 2.2 Advanced KFP Patterns
```python
# Conditional execution
@dsl.component
def evaluate_model(
    metrics: Input[Metrics],
    threshold: float = 0.8,
    deploy_decision: Output[Model]
):
    import json
    with open(metrics.path) as f:
        metrics = json.load(f)
    
    if metrics['accuracy'] >= threshold:
        deploy_decision.metadata = {"deploy": "true"}
    else:
        deploy_decision.metadata = {"deploy": "false"}

@pipeline
def conditional_pipeline():
    train_task = train_model(...)
    
    eval_task = evaluate_model(
        metrics=train_task.outputs["metrics"],
        threshold=0.85
    )
    
    # Conditional deployment
    with dsl.Condition(eval_task.outputs["deploy_decision"].metadata["deploy"] == "true"):
        deploy_task = deploy_model(model=train_task.outputs["model"])

# Parallel execution with loops
@pipeline
def hyperparameter_tuning():
    params = [
        {"n_estimators": 100, "max_depth": 5},
        {"n_estimators": 200, "max_depth": 10},
        {"n_estimators": 500, "max_depth": 15},
    ]
    
    with dsl.ParallelFor(params) as param:
        train_task = train_model(
            n_estimators=param.n_estimators,
            max_depth=param.max_depth
        )

# Caching
@dsl.component
def cached_component(input_data: Input[Dataset], 
                     cache_key: str = "v1") -> Output[Dataset]:
    # Enable caching
    return output_dataset

# Pipeline with caching
@pipeline
def cached_pipeline():
    task = cached_component().set_caching_options(enable_caching=True)
```

### 2.3 KFP on Kubernetes
```yaml
# KFP deployment - Argo-based
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: ml-pipeline-
spec:
  entrypoint: main
  templates:
  - name: train
    container:
      image: my-training-image:latest
      command: [python, train.py]
      resources:
        limits:
          nvidia.com/gpu: "1"
          memory: "16Gi"
          cpu: "4"
        env:
        - name: DATA_PATH
          value: "s3://bucket/data"
    outputs:
      artifacts:
      - name: model
        path: /output/model
        archive: none
  - name: evaluate
    container:
      image: my-eval-image
      command: [python, eval.py]
    inputs:
      artifacts:
      - name: model
        from: "{{workflow.uid}}/train"
```

---

## 3. Metaflow

### 3.1 Metaflow Basics
```python
from metaflow import FlowSpec, step, Parameter, card, resources, 
                    batch, kubernetes, conda, pypi, retry, catch, timeout

class TrainingFlow(FlowSpec):
    data_path = Parameter('data_path', default='s3://bucket/data/train.parquet')
    n_estimators = Parameter('n_estimators', default=100)
    max_depth = Parameter('max_depth', default=5)
    
    @step
    def start(self):
        import pandas as pd
        self.df = pd.read_parquet(self.data_path)
        self.next(self.train)
    
    @resources(cpu=4, memory=16000)
    @retry(times=2)
    @timeout(3600)
    @step
    def train(self):
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.model_selection import train_test_split
        import joblib
        
        X = self.df.drop('target', axis=1)
        y = self.df['target']
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2)
        
        self.model = RandomForestClassifier(
            n_estimators=self.n_estimators, 
            max_depth=self.max_depth
        )
        self.model.fit(X_train, y_train)
        
        self.val_accuracy = self.model.score(X_val, y_val)
        self.model_bytes = joblib.dumps(self.model)
        self.next(self.evaluate)
    
    @step
    def evaluate(self):
        self.accuracy = self.val_accuracy
        print(f"Validation accuracy: {self.accuracy}")
        self.next(self.end)
    
    @step
    def end(self):
        print("Training complete!")

if __name__ == '__main__':
    TrainingFlow()
```

### 3.2 Metaflow Advanced Features
```python
from metaflow import FlowSpec, step, Parameter, IncludeFile, 
                    current, namespace, S3, metadata, profile

class AdvancedFlow(FlowSpec):
    data_file = IncludeFile('data', default='data.csv')
    
    @step
    def start(self):
        # Access flow metadata
        print(f"Run ID: {current.run_id}")
        print(f"Run name: {current.run_name}")
        self.next(self.process)
    
    @resources(cpu=8, memory=32000)
    @batch(queue="ml-training", image="my-docker-image:latest")
    @conda(libraries={'scikit-learn': '1.3', 'pandas': '2.0'})
    @step
    def process(self):
        import pandas as pd
        self.df = pd.read_csv(self.data_file)
        self.next(self.train)
    
    @catch(var='error')
    @retry(times=3, minutes_between=5)
    @timeout(3600)
    @step
    def train(self):
        try:
            # Training logic
            self.model = train_model(self.df)
            self.next(self.end)
        except Exception as e:
            self.error = str(e)
            self.next(self.end)
    
    @step
    def end(self):
        if hasattr(self, 'error'):
            print(f"Failed: {self.error}")
        else:
            print("Success!")

# Run with different configs
# python flow.py run --with batch --with kubernetes
# python flow.py run --with kubernetes --namespace ml-prod
```

### 3.3 Metaflow Cards & Artifacts
```python
from metaflow import step, card, current, JSONType, Artifact
import matplotlib.pyplot as plt

class ReportingFlow(FlowSpec):
    @card(type='html')
    @step
    def visualize(self):
        import matplotlib.pyplot as plt
        
        # Create visualization
        fig, ax = plt.subplots()
        ax.plot(self.metrics_history)
        
        # Save to card
        current.card.append(
            Image.from_matplotlib(fig, format='png')
        )
        
        # JSON artifact
        current.card.append(
            JSONType({"metrics": self.final_metrics})
        )
        self.next(self.end)

# Access artifacts across runs
from metaflow import Run, Flow

run = Run('TrainingFlow/123')
model_artifact = run.data.model_artifact  # Access model artifact
```

---

## 4. Flyte

### 4.1 Flyte Basics
```python
from flytekit import task, workflow, Resources, ImageSpec, 
                      Deck, ImageSpec, Secret, SecretGroup
from flytekit.types.file import FlyteFile
from flytekit.types.directory import FlyteDirectory

# Custom image
image = ImageSpec(
    name="ml-training",
    base_image="python:3.10",
    packages=["pandas", "scikit-learn", "boto3"],
    python_version="3.10"
)

@task(
    container_image=image,
    requests=Resources(cpu="4", mem="16Gi", gpu="1"),
    limits=Resources(cpu="4", mem="16Gi", gpu="1"),
    cache=True,
    cache_version="1.0",
    retries=2,
    timeout=3600
)
def train_task(
    data: FlyteFile[TypeVar("parquet")],
    n_estimators: int = 100,
    max_depth: int = 5
) -> (FlyteFile[TypeVar("joblib")], dict):
    import pandas as pd
    from sklearn.ensemble import RandomForestClassifier
    import joblib
    import json
    
    df = pd.read_parquet(data)
    X = df.drop('target', axis=1)
    y = df['target']
    
    model = RandomForestClassifier(n_estimators=n_estimators, max_depth=max_depth)
    model.fit(X, y)
    
    # Save model
    model_path = "model.joblib"
    joblib.dump(model, model_path)
    
    metrics = {"accuracy": 0.95}
    return FlyteFile(path=model_path), metrics

@workflow
def training_workflow(
    data_path: str = "s3://bucket/data/train.parquet",
    n_estimators: int = 100,
    max_depth: int = 5
) -> (FlyteFile[TypeVar("joblib")], dict):
    model_file, metrics = train_task(
        data=FlyteFile(path=data_path),
        n_estimators=n_estimators,
        max_depth=max_depth
    )
    return model_file, metrics
```

### 4.2 Flyte Advanced Features
```python
# Dynamic workflows
@dynamic
def dynamic_workflow(data_paths: list[str]) -> list:
    results = []
    for path in data_paths:
        result = train_task(data=FlyteFile(path=path))
        results.append(result)
    return results

# Map tasks (parallel execution)
@task
def map_task(items: list) -> list:
    return [process_item(item) for item in items]

@workflow
def map_workflow(items: list):
    return map_task(items=items)

# Decks for visualization
@task
def train_with_deck(data: FlyteFile) -> (FlyteFile, dict):
    deck = Deck("Training Metrics")
    
    # Add markdown
    deck.append(Markdown("# Training Metrics"))
    
    # Add plots
    deck.append(Image.from_matplotlib(fig))
    
    # Add markdown table
    deck.append(Markdown("| Metric | Value |\n|--------|-------|\n| Acc | 0.95 |"))
    
    return model, metrics

# Secrets management
@task(
    secret_requests=[Secret(group="aws", key="s3_access")],
    secret_requests=[Secret(group="db", key="password")]
)
def task_with_secrets() -> str:
    import os
    s3_key = os.environ.get("AWS_ACCESS_KEY_ID")
    db_pass = os.environ.get("DB_PASSWORD")
    return "done"
```

### 4.3 Flyte Deployment
```yaml
# Flyte deployment - flyte-binary helm chart
# values.yaml
flyte:
  admin:
    # ...
  propeller:
    # ...
  datacatalog:
    # ...
  
# FlyteCluster CRD
apiVersion: flyte.org/v1alpha1
kind: FlyteCluster
metadata:
  name: flyte-cluster
spec:
  admin:
    replicas: 2
  propeller:
    replicas: 2
  datacatalog:
    replicas: 1
```

---

## 5. Dagster

### 5.1 Dagster Assets & Jobs
```python
from dagster import asset, job, op, AssetIn, AssetOut, 
                      Config, Definitions, ScheduleDefinition
from dagster_aws.s3 import S3Resource
from dagster_k8s import k8s_job_op

# Assets (software-defined assets)
@asset(
    key_prefix="ml",
    group_name="training",
    description="Train ML model",
    metadata={"owner": "ml-team"},
    required_resource_keys={"s3"}
)
def trained_model(context, training_data: pd.DataFrame) -> dict:
    from sklearn.ensemble import RandomForestClassifier
    import joblib
    
    X = training_data.drop('target', axis=1)
    y = training_data['target']
    
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X, y)
    
    # Save to S3
    model_bytes = joblib.dumps(model)
    context.resources.s3.upload_fileobj(
        io.BytesIO(model_bytes), 
        "my-bucket", 
        "models/model.joblib"
    )
    
    return {"model_path": "s3://bucket/models/model.joblib", "accuracy": 0.95}

@asset(
    ins={"model_info": AssetIn("trained_model")},
    group_name="evaluation"
)
def model_evaluation(context, model_info: dict) -> dict:
    # Load model from S3 and evaluate
    return {"test_accuracy": 0.94}

# Job definition
@job(
    resource_defs={"s3": S3Resource()},
    config=RunConfig(
        ops={
            "trained_model": OpConfig(config={"n_estimators": 200})
        }
    )
)
def training_job():
    model_info = trained_model()
    model_evaluation(model_info)

# Schedules
daily_schedule = ScheduleDefinition(
    job=training_job,
    cron_schedule="0 2 * * *",  # 2 AM daily
    execution_timezone="UTC"
)

# Resources
defs = Definitions(
    assets=[training_data, trained_model, model_evaluation],
    jobs=[training_job],
    schedules=[daily_schedule],
    resources={
        "s3": S3Resource(region_name="us-east-1"),
        "db": PostgresResource(connection_string=os.getenv("DB_URL"))
    }
)
```

### 5.2 Dagster Pipes & External Execution
```python
# Dagster Pipes for external execution (K8s, Spark, etc.)
from dagster_pipes import open_dagster_pipes
from dagster import PipesK8sClient, PipesK8sContext

# K8s job with Dagster Pipes
k8s_job = PipesK8sClient(
    namespace="ml-pipelines",
    base_image="my-training-image:latest",
    env_vars={"ENV": "prod"}
)

@asset
def k8s_training(context, data: pd.DataFrame) -> dict:
    with open_dagster_pipes(context) as pipes:
        # Submit K8s job
        k8s_client = PipesK8sClient(...)
        k8s_client.run(
            context=context,
            namespace="ml-pipelines",
            image="my-training-image",
            command=["python", "train.py"],
            env_vars={"DATA_PATH": "s3://bucket/data/train.parquet"},
            resources={"cpu": "4", "memory": "16Gi", "nvidia.com/gpu": "1"},
            context=PipesK8sContext(pipes=pipes)
        )
        
        # Get results from pipes
        return pipes.get_results()

# Materialization with metadata
@asset
def materialized_asset(context) -> MaterializeResult:
    return MaterializeResult(
        metadata={
            "rows": MetadataValue.int(10000),
            "accuracy": MetadataValue.float(0.95),
            "model_path": MetadataValue.path("s3://bucket/model.joblib"),
            "dashboard": MetadataValue.url("http://grafana/d/ml-model")
        }
    )
```

### 5.3 Dagster Testing & CI/CD
```python
# Unit testing assets
from dagster import build_asset_context, materialize

def test_trained_model():
    test_data = pd.DataFrame({
        'feature1': [1, 2, 3],
        'feature2': [4, 5, 6],
        'target': [0, 1, 0]
    })
    
    context = build_asset_context(
        resources={"s3": MockS3Resource()},
        partition_key="2024-01-01"
    )
    
    result = trained_model(context, test_data)
    
    assert "model_path" in result
    assert result["accuracy"] > 0.8

# CI/CD with GitHub Actions
# .github/workflows/dagster.yml
# name: Dagster CI
# on: [push, pull_request]
# jobs:
#   test:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v3
#       - uses: actions/setup-python@v4
#         with: {python-version: '3.10'}
#       - run: pip install -e ".[test]"
#       - run: pytest tests/
#       - run: dagster dev --check
```

---

## 6. Argo Workflows

### 6.1 Argo Workflows Basics
```yaml
# workflow.yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: ml-training-
spec:
  entrypoint: main
  volumes:
  - name: workdir
    emptyDir: {}
  templates:
  - name: main
    dag:
      tasks:
      - name: preprocess
        template: preprocess
      - name: train
        template: train
        dependencies: [preprocess]
      - name: evaluate
        template: evaluate
        dependencies: [train]
  
  - name: preprocess
    container:
      image: my-preprocess-image:latest
      command: [python, preprocess.py]
      resources:
        limits:
          memory: "8Gi"
          cpu: "2"
    outputs:
      artifacts:
      - name: processed-data
        path: /output/data.parquet
  
  - name: train
    inputs:
      artifacts:
      - name: processed-data
        from: "{{tasks.preprocess.outputs.artifacts.processed-data}}"
    container:
      image: my-training-image:latest
      command: [python, train.py]
      resources:
        limits:
          nvidia.com/gpu: "1"
          memory: "16Gi"
          cpu: "4"
    outputs:
      artifacts:
      - name: model
        path: /output/model.joblib
  
  - name: evaluate
    inputs:
      artifacts:
      - name: model
        from: "{{tasks.train.outputs.artifacts.model}}"
    container:
      image: my-eval-image:latest
      command: [python, evaluate.py]
```

### 6.2 Argo Advanced Patterns
```yaml
# Parameter sweep with matrix
apiVersion: argoproj.io/v1alpha1
kind: Workflow
spec:
  entrypoint: hyperparam-sweep
  templates:
  - name: hyperparam-sweep
    steps:
    - - name: train
        template: train
        parameters:
        - name: n_estimators
          value: "{{item.n_estimators}}"
        - name: max_depth
          value: "{{item.max_depth}}"
        withParam: "{{workflow.parameters.hyperparams}}"
  
  - name: train
    inputs:
      parameters:
      - name: n_estimators
      - name: max_depth
    container:
      image: training-image
      command: [python, train.py]
      args: [
        "--n_estimators", "{{inputs.parameters.n_estimators}}",
        "--max_depth", "{{inputs.parameters.max_depth}}"
      ]
    outputs:
      artifacts:
      - name: model
        path: /output/model.joblib

# Workflow parameters
  arguments:
    parameters:
    - name: hyperparams
      value: |
        [
          {"n_estimators": 100, "max_depth": 5},
          {"n_estimators": 200, "max_depth": 10},
          {"n_estimators": 500, "max_depth": 15}
        ]

# Exit handlers (cleanup)
spec:
  entrypoint: main
  onExit: cleanup
  templates:
  - name: cleanup
    container:
      image: cleanup-image
      command: [python, cleanup.py]
```

---

## 7. Cross-Platform Patterns

### 7.1 Pipeline Portability
```python
# Abstract pipeline definition
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass
class PipelineSpec:
    name: str
    steps: List["StepSpec"]
    parameters: Dict[str, Any]

@dataclass
class StepSpec:
    name: str
    image: str
    command: List[str]
    inputs: Dict[str, Any]
    outputs: Dict[str, Any]
    resources: Dict[str, str]
    dependencies: List[str]

class PipelineCompiler(ABC):
    @abstractmethod
    def compile(self, spec: PipelineSpec) -> str:
        """Compile to platform-specific format"""
        pass

class KFPCompiler(PipelineCompiler):
    def compile(self, spec: PipelineSpec) -> str:
        # Generate KFP YAML
        pass

class ArgoCompiler(PipelineCompiler):
    def compile(self, spec: PipelineSpec) -> str:
        # Generate Argo Workflow YAML
        pass

class FlyteCompiler(PipelineCompiler):
    def compile(self, spec: PipelineSpec) -> str:
        # Generate Flyte Python code
        pass

class DagsterCompiler(PipelineCompiler):
    def compile(self, spec: PipelineSpec) -> str:
        # Generate Dagster Python code
        pass
```

### 7.2 CI/CD Pipeline Template
```yaml
# .github/workflows/ml-pipeline.yml
name: ML Pipeline CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [staging, production]

jobs:
  lint-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: '3.10'}
      - run: pip install -e ".[dev,test]"
      - run: pytest tests/ -v --cov=src
      - run: ruff check src/
      - run: mypy src/
  
  build-image:
    needs: lint-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: |
          docker build -t ${{ secrets.REGISTRY }}/ml-pipeline:${{ github.sha }} .
          docker push ${{ secrets.REGISTRY }}/ml-pipeline:${{ github.sha }}
  
  deploy-staging:
    needs: build-image
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to Staging
        run: |
          kubectl set image deployment/ml-pipeline \
            ml-pipeline=${{ secrets.REGISTRY }}/ml-pipeline:${{ github.sha }} \
            -n ml-staging
  
  deploy-production:
    needs: build-image
    if: github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'production'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to Production
        run: |
          kubectl set image deployment/ml-pipeline \
            ml-pipeline=${{ secrets.REGISTRY }}/ml-pipeline:${{ github.sha }} \
            -n ml-prod
```

---

## 8. Observability & Debugging

### 8.1 Pipeline Observability
```python
# Structured logging for pipelines
import structlog
from contextvars import ContextVar

pipeline_context: ContextVar[dict] = ContextVar("pipeline_context", default={})

def get_logger():
    return structlog.get_logger().bind(
        pipeline_id=pipeline_context.get().get("pipeline_id"),
        run_id=pipeline_context.get().get("run_id"),
        step=pipeline_context.get().get("step")
    )

@contextmanager
def pipeline_step(step_name: str):
    ctx = pipeline_context.get().copy()
    ctx["step"] = step_name
    pipeline_context.set(ctx)
    
    logger = get_logger()
    logger.info("step_started", step=step_name)
    
    start = time.time()
    try:
        yield
        logger.info("step_completed", duration=time.time() - start)
    except Exception as e:
        logger.error("step_failed", error=str(e), duration=time.time() - start)
        raise

# Usage in any orchestrator
def train_step():
    with pipeline_step("train"):
        logger = get_logger()
        logger.info("training_started")
        model = train_model()
        logger.info("training_completed", metrics={"accuracy": 0.95})
```

### 8.2 Pipeline Debugging
```python
# Debugging utilities
class PipelineDebugger:
    def __init__(self, pipeline_name: str):
        self.pipeline_name = pipeline_name
    
    def inspect_failed_run(self, run_id: str) -> dict:
        """Inspect failed run details"""
        # Implementation depends on platform
        pass
    
    def replay_from_failure(self, run_id: str, from_step: str):
        """Replay pipeline from failure point"""
        pass
    
    def compare_runs(self, run_id_1: str, run_id_2: str) -> dict:
        """Compare two runs for regression detection"""
        pass
    
    def lineage_trace(self, artifact_id: str) -> dict:
        """Trace artifact lineage upstream/downstream"""
        pass

# Data quality checks in pipeline
from great_expectations import DataContext

def validate_data(context, data_asset):
    """Run Great Expectations validation in pipeline"""
    context = DataContext()
    checkpoint = context.get_checkpoint("my_checkpoint")
    result = checkpoint.run(batch_request={"data_asset": data_asset})
    
    if not result.success:
        raise ValueError(f"Data validation failed: {result}")
    
    return True
```

---

## 9. Cost Optimization

### 9.1 Resource Optimization
```python
# Spot instance handling
@task(
    container_image=image,
    requests=Resources(cpu="4", mem="16Gi"),
    spot_instance=True,  # Use spot instances
    interruptible=True
)
def spot_tolerant_task():
    """Task that can run on spot instances"""
    pass

# Preemption handling
@task(
    container_image=image,
    preemption_grace_period=300  # 5 min grace period
)
def preemptible_task():
    # Save checkpoints frequently
    pass

# Resource profiling
def profile_resources(func):
    """Profile CPU, memory, GPU usage"""
    import psutil
    import GPUtil
    
    process = psutil.Process()
    gpus = GPUtil.getGPUs()
    
    start_time = time.time()
    start_cpu = process.cpu_percent()
    start_mem = process.memory_info().rss / 1024**2  # MB
    start_gpu = gpus[0].memoryUsed if gpus else 0
    
    result = func()
    
    end_time = time.time()
    end_cpu = process.cpu_percent()
    end_mem = process.memory_info().rss / 1024**2
    end_gpu = gpus[0].memoryUsed if gpus else 0
    
    return {
        "result": result,
        "duration": end_time - start_time,
        "cpu_usage": end_cpu - start_cpu,
        "memory_delta_mb": end_mem - start_mem,
        "gpu_usage_mb": end_gpu - start_gpu
    }
```

---

## 10. Key Takeaways

1. **Choose platform based on team & infra**: K8s-native → KFP/Flyte/Argo; Python-first → Metaflow; Data eng → Dagster
2. **Assets > Tasks** for modern orchestration (Dagster, Flyte)
3. **Version everything**: Code, data, models, environments
4. **Idempotency** = Safe retries, exactly-once semantics
5. **Observability** = Structured logs + Metrics + Traces + Lineage
6. **Testing** = Unit tests for assets, integration tests for pipelines
6. **CI/CD** = Automated testing → Image build → Staging → Production
7. **Cost control**: Spot instances, resource profiling, auto-scaling
8. **Debugging** = Structured logs + Artifact lineage + Replay capability
9. **Platform choice** = Team skills + Infra + Scale requirements
10. **Start simple**: Single workflow → Modular pipelines → Platform