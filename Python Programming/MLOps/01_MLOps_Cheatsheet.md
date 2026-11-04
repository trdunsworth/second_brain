# MLOps Cheatsheet

A comprehensive reference for production ML systems: deployment, monitoring, pipelines, and governance.

---

## 1. ML Pipeline Orchestration

### 1.1 Apache Airflow
```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.docker.operators.docker import DockerOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'ml-team',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'ml_pipeline',
    default_args=default_args,
    schedule_interval='0 2 * * *',  # Daily at 2 AM
    catchup=False,
    max_active_runs=1,
)

def extract_data(**context):
    # Extract data
    return {'rows': 10000}

def train_model(**context):
    ti = context['ti']
    data = ti.xcom_pull(task_ids='extract_data')
    # Train model
    return {'model_path': 's3://bucket/model.pkl'}

def evaluate_model(**context):
    ti = context['ti']
    model_path = ti.xcom_pull(task_ids='train_model')['model_path']
    # Evaluate
    return {'accuracy': 0.92}

with dag:
    extract = PythonOperator(task_id='extract', python_callable=extract_data)
    train = PythonOperator(task_id='train', python_callable=train_model)
    evaluate = PythonOperator(task_id='evaluate', python_callable=evaluate_model)
    
    extract >> train >> evaluate
```

### 2.2 Prefect
```python
from prefect import flow, task, get_run_logger
from prefect.deployments import Deployment
from prefect.orion.schemas.schedules import CronSchedule

@task(retries=3, retry_delay_seconds=60)
def extract_data():
    logger = get_run_logger()
    # Extract logic
    return "s3://bucket/data.parquet"

@task
def train_model(data_path):
    # Training logic
    return {"model_path": "s3://bucket/model.pkl", "metrics": {"auc": 0.92}}

@task
def deploy_model(model_path):
    # Deploy to staging
    pass

@flow(name="ml-pipeline")
def ml_pipeline():
    data = extract_data()
    model = train_model(data)
    deploy_model(model)

# Deploy
deployment = Deployment.build_from_flow(
    flow=ml_pipeline,
    name="daily-training",
    schedule=CronSchedule(cron="0 2 * * *"),
    work_queue_name="ml-training"
)
deployment.apply()
```

### 2.3 Dagster
```python
from dagster import asset, repository, Definitions, ScheduleDefinition
import pandas as pd

@asset
def raw_data() -> pd.DataFrame:
    return pd.read_parquet("s3://bucket/raw/data.parquet")

@asset
def cleaned_data(raw_data: pd.DataFrame) -> pd.DataFrame:
    return raw_data.dropna()

@asset
def features(cleaned_data: pd.DataFrame) -> pd.DataFrame:
    return feature_engineering(cleaned_data)

@asset
def model(features: pd.DataFrame) -> dict:
    model = train(features)
    return {"model_path": "s3://bucket/model.pkl", "metrics": {"auc": 0.92}}

@asset
def predictions(model: dict, features: pd.DataFrame) -> pd.DataFrame:
    model = load_model(model["model_path"])
    return pd.DataFrame({"predictions": predict(model, features)})

@repository
def ml_repo():
    return [raw_data, cleaned_data, features, model, predictions]

@schedule(cron_schedule="0 2 * * *")
def daily_schedule():
    pass
```

---

## 2. Model Deployment

### 2.1 Model Serving with FastAPI
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI(title="ML Model API")

class PredictionRequest(BaseModel):
    features: list[float]
    
class PredictionResponse(BaseModel):
    prediction: float
    confidence: float

model = joblib.load("model.pkl")

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try:
        features = np.array(request.features).reshape(1, -1)
        prediction = model.predict_proba([request.features])[0][1]
        return PredictionResponse(
            prediction=float(prediction),
            confidence=0.95
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy", "model_version": "1.0.0"}
```

### 2.2 BentoML
```python
import bentoml
from bentoml.io import NumpyNdarray, JSON

@bentoml.service(
    resources={"cpu": "2", "memory": "4Gi"},
    traffic={"timeout": 30},
)
class ModelService:
    def __init__(self):
        self.model = bentoml.sklearn.get("my_model:latest").to_runner()
    
    @bentoml.api(input=JSON(), output=JSON())
    async def predict(self, input_data: dict) -> dict:
        features = np.array([input_data["features"]])
        proba = self.model.predict_proba.run(input_data)
        return {"prediction": float(prob[0][1]), "confidence": 0.95}
```

### 2.3 Triton Inference Server
```yaml
# model_repository/model/config.pbtxt
name: "model"
platform: "tensorflow_savedmodel"
max_batch_size: 0
input [
  {
    name: "input"
    data_type: TYPE_FP32
    dims: [-1, 10]
  }
]
output [
  {
    name: "output"
    data_type: TYPE_FP32
    dims: [-1, 1]
  }
]
```

```bash
# Deploy
docker run -d --gpus all -p 8000:8000 -p 8001:8001 -p 8002:8002 \
  -v /models:/models \
  nvcr.io/nvidia/tritonserver:23.10-py3 \
  tritonserver --model-repository=/models
```

---

## 3. Feature Stores

### 1. Feast
```python
# feature_repo/feature_repo/feature_definitions.py
from feast import Entity, Feature, FeatureView, FileSource, ValueType
from datetime import timedelta

user = Entity(name="user_id", value_type=ValueType.INT64, description="User ID")

user_stats = FeatureView(
    name="user_stats",
    entities=[user],
    ttl=timedelta(days=30),
    schema=[
        Field(name="total_orders", dtype=ValueType.INT64),
        Field(name="avg_order_value", dtype=ValueType.FLOAT),
        Field(name="days_since_last_order", dtype=ValueType.INT64),
    ],
    online=True,
    source=FileSource(
        path="s3://bucket/features/user_stats.parquet",
        timestamp_field="event_timestamp",
        created_timestamp_column="created_at"
    )
)

# Apply
feast apply

# Online retrieval
client = feast.Client()
features = client.get_online_features(
    entity_rows=[{"user_id": 123}, {"user_id": 456}],
    features=[
        "user_stats:total_orders",
        "user_stats:avg_order_value",
    ]
)
```

### 2. Tecton
```python
from tecton import FeatureView, FileSource, Entity

@FeatureView
def user_features():
    return {
        "user_id": int,
        "total_orders": int,
        "avg_order_value": float
    }

@FeatureView
def user_features():
    source = FileSource(path="s3://bucket/user_features/")
    return {
        "user_id": int,
        "total_orders": int,
        "avg_order_value": float,
    }
```

---

## 3. Model Monitoring

### 1. Data Drift Detection
```python
from evidently.dashboard import Dashboard
from evidently.dashboard.tabs import DataDriftTab, CatTargetDriftTab
from evidently.pipeline.column_mapping import ColumnMapping

# Data drift report
column_mapping = ColumnMapping(
    target='target',
    prediction='prediction',
    numerical_features=['age', 'income'],
    categorical_features=['category', 'region']
)

dashboard = Dashboard(tabs=[DataDriftTab(), CatTargetDriftTab()])
dashboard.calculate(reference_data=train_data, current_data=new_data, column_mapping=column_mapping)
dashboard.save("drift_report.html")

# Custom drift detection
from scipy.stats import ks_2samp, chi2_contingency

def detect_drift(ref_data, curr_data, threshold=0.05):
    drift_results = {}
    for col in numeric_features:
        stat, p = ks_2samp(ref_data[col], curr_data[col])
        drift_results[col] = {"statistic": stat, "p_value": p, "drift": p < 0.05}
    return drift_results
```

### 2.2 Model Performance Monitoring
```python
class ModelMonitor:
    def __init__(self, model, reference_data, threshold=0.05):
        self.model = model
        self.reference = reference_data
        self.threshold = threshold
    
    def check_drift(self, new_data):
        # Data drift
        drift_results = self.detect_data_drift(new_data)
        
        # Concept drift (if labels available)
        if hasattr(self, 'y_true'):
            concept_drift = self.detect_concept_drift(new_data)
        
        return {
            "data_drift": drift_results,
            "concept_drift": concept_drift
        }
    
    def detect_performance_drop(self, y_true, y_pred, threshold=0.05):
        current_auc = roc_auc_score(y_true, y_pred)
        baseline_auc = self.baseline_auc
        return (baseline_auc - current_auc) > self.threshold
```

---

## 3. Experiment Tracking

### 1. MLflow
```python
import mlflow
import mlflow.sklearn

mlflow.set_tracking_uri("http://localhost:5000")
mlflow.set_experiment("experiment-name")

with mlflow.start_run(run_name="experiment-1"):
    # Log parameters
    mlflow.log_params({
        "n_estimators": 100,
        "max_depth": 5,
        "learning_rate": 0.1
    })
    
    # Log metrics
    mlflow.log_metrics({
        "accuracy": 0.95,
        "roc_auc": 0.95,
        "f1": 0.92
    })
    
    # Log artifacts
    mlflow.log_artifact("confusion_matrix.png")
    mlflow.log_figure(fig, "feature_importance.png")
    
    # Log model
    mlflow.sklearn.log_model(model, "model", registered_model_name="my_model")
```

### 2.2 Weights & Biases
```python
import wandb

wandb.init(project="my-project", config={
    "learning_rate": 0.01,
    "batch_size": 32,
    "epochs": 100
})

wandb.config.update({"architecture": "CNN"})
wandb.log({"loss": loss, "accuracy": acc})

# Artifact
artifact = wandb.Artifact("model", type="model")
artifact.add_file("model.pkl")
wandb.log_artifact(artifact)
```

---

## 4. CI/CD for ML

### GitHub Actions
```yaml
# .github/workflows/ml-pipeline.yml
name: ML Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install uv
          uv sync --all-extras
      - name: Lint
        run: ruff check .
      - name: Type check
        run: mypy src/
      - name: Test
        run: pytest tests/ -v --cov=src --cov-report=xml

  train:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: '3.11'}
      - name: Train
        run: |
          uv sync
          python train.py
      - name: Upload model
        uses: actions/upload-artifact@v4
        with:
          name: model
          path: model.pkl

  deploy:
    needs: train
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: model
      - name: Deploy
        run: |
          docker build -t model:${{ github.sha }} .
          docker push registry.io/model:${{ github.sha }}
```

---

## 4. Cost Optimization

### 1. Spot Instances
```python
# AWS Spot Instance training
import boto3

ec2 = boto3.client('ec2')
response = ec2.request_spot_instances(
    InstanceCount=1,
    Type='one-time',
    LaunchSpecification={
        'ImageId': 'ami-12345678',
        'InstanceType': 'p3.2xlarge',
        'KeyName': 'ml-key',
        'SecurityGroups': ['sg-12345'],
        'UserData': base64.b64encode(user_data.encode()).decode()
    }
)

# Spot interruption handling
import signal
import sys

def handle_spot_termination(signum, frame):
    print("Spot interruption received, saving checkpoint...")
    model.save("checkpoint.pkl")
    sys.exit(0)

signal.signal(signal.SIGTERM, handle_spot_termination)
```

### 2. Model Optimization
```python
# ONNX Runtime optimization
from onnxruntime.quantization import quantize_dynamic, QuantType

quantize_dynamic(
    model_input="model.onnx",
    model_output="model_quantized.onnx",
    weight_type=QuantType.QInt8
)

# TensorRT
import tensorrt as trt
builder = trt.Builder(trt.Logger())
network = builder.create_network()
parser = trt.OnnxParser(network, TRT_LOGGER)
parser.parse(model.read())
config = builder.create_builder_config()
config.set_flag(trt.BuilderFlag.FP16)
engine = builder.build_engine(network, config)
```

---

## Key Takeaways

1. **Automate everything** - pipelines, testing, deployment
2. **Monitor everything** - data drift, concept drift, performance
3. **Version everything** - code, data, models, environments
6. **Automate retraining** - triggers based on drift/performance
7. **Use feature stores** - consistent features across train/serve
8. **Monitor costs** - spot instances, right-sizing, auto-scaling
8. **Security first** - secrets management, encryption, access control
9. **Document everything** - model cards, data cards, runbooks
10. **Plan for failure** - rollback strategies, canary deployments

---

*Last updated: 2024-11-04*
*Part of: Python Programming Knowledge Base*