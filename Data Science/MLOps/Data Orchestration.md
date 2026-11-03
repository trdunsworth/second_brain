# Data Orchestration

Orchestration manages the **execution, scheduling, and monitoring** of data pipelines (ETL, feature engineering, model training, deployment).

## 1. Core Concepts

### DAG (Directed Acyclic Graph)
```
Task A ──┐
         ├──→ Task C ──→ Task E
Task B ──┘           │
                     ▼
Task D ────────────→ Task F
```

- **Nodes**: Tasks (extract, transform, load, train, validate)
- **Edges**: Dependencies (data flow, execution order)
- **No cycles**: Prevents infinite loops

### Key Properties
| Property | Description |
|----------|-------------|
| **Idempotency** | Re-running task produces same result |
| **Atomicity** | Task fully succeeds or fully fails (no partial state) |
| **Retries** | Automatic retry on transient failures |
| **Backfill** | Re-run historical dates |
| **Catchup** | Run missed scheduled runs |

---

## 2. Tool Comparison

| Tool | Paradigm | Language | Best For | Learning Curve |
|------|----------|----------|----------|----------------|
| **Airflow** | DAG as Python code | Python | General purpose, mature ecosystem | Medium |
| **Prefect** | Python-native, dynamic | Python | Modern, flexible, observability | Low |
| **Dagster** | Software-defined assets | Python | Data quality, testing, lineage | Medium |
| **dbt** | SQL-first transformations | SQL/YAML | Analytics engineering, ELT | Low |
| **Kubeflow** | K8s-native ML pipelines | YAML/Python | ML at scale on K8s | High |
| **Mage** | Notebook-like UI | Python | Fast iteration, notebook integration | Low |

---

## 3. Apache Airflow (Industry Standard)

### Architecture
- **Scheduler**: Parses DAGs, triggers tasks
- **Webserver**: UI for monitoring, triggering
- **Executor**: Runs tasks (Local, Celery, Kubernetes, LocalKubernetes)
- **Metadata DB**: PostgreSQL/MySQL (task state, logs)
- **Workers**: Execute tasks

### Basic DAG
```python
# dags/ml_pipeline.py
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from airflow.providers.docker.operators.docker import DockerOperator

default_args = {
    'owner': 'ml-team',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': True,
    'email': ['ml-alerts@company.com'],
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
    'execution_timeout': timedelta(hours=2),
}

with DAG(
    'ml_training_pipeline',
    default_args=default_args,
    schedule='0 2 * * *',  # Daily at 2 AM
    catchup=False,
    max_active_runs=1,
    tags=['ml', 'training'],
) as dag:

    # Task 1: Data validation
    def validate_data(**context):
        import pandas as pd
        df = pd.read_parquet("s3://bucket/raw/data.parquet")
        assert len(df) > 1000, "Insufficient data"
        assert df['target'].notna().all(), "Missing targets"
        return "validated"

    validate = PythonOperator(
        task_id='validate_data',
        python_callable=validate_data,
    )

    # Task 2: Feature engineering (Spark via Docker)
    feature_eng = DockerOperator(
        task_id='feature_engineering',
        image='my-spark:3.5',
        api_version='auto',
        auto_remove=True,
        command='python /app/feature_engineering.py --date {{ ds }}',
        docker_url='unix://var/run/docker.sock',
        network_mode='bridge',
        mount_tmp_dir=False,
        environment={
            'AWS_ACCESS_KEY_ID': '{{ var.value.aws_key }}',
            'AWS_SECRET_ACCESS_KEY': '{{ var.value.aws_secret }}',
        },
    )

    # Task 3: Model training
    def train_model(**context):
        from sklearn.ensemble import RandomForestClassifier
        import joblib
        import pandas as pd
        
        df = pd.read_parquet("s3://bucket/features/{{ ds }}/")
        X = df.drop('target', axis=1)
        y = df['target']
        
        model = RandomForestClassifier(n_estimators=200)
        model.fit(X, y)
        
        model_path = f"/tmp/model_{{ ds }}.pkl"
        joblib.dump(model, model_path)
        
        # Push to XCom for next task
        return model_path

    train = PythonOperator(
        task_id='train_model',
        python_callable=train_model,
    )

    # Task 4: Model validation
    def validate_model(**context):
        model_path = context['task_instance'].xcom_pull(task_ids='train_model')
        # Load model, evaluate on holdout set
        # Fail if metrics below threshold
        pass

    validate_model = PythonOperator(
        task_id='validate_model',
        python_callable=validate_model,
    )

    # Task 5: Deploy (if validation passes)
    deploy = BashOperator(
        task_id='deploy_model',
        bash_command='curl -X POST http://model-registry:8000/deploy --data "model={{ ti.xcom_pull(task_ids="train_model") }}"',
        trigger_rule='all_success',  # Only if validation passes
    )

    # Dependencies
    validate >> feature_eng >> train >> validate_model >> deploy
```

### Advanced Patterns

#### Dynamic Task Mapping (Airflow 2.3+)
```python
from airflow.decorators import task

@task
def get_partitions():
    return ["partition_1", "partition_2", "partition_3"]

@task
def process_partition(partition):
    # Process each partition
    return f"processed_{partition}"

with DAG(...) as dag:
    partitions = get_partitions()
    process_partition.expand(partition=partitions)
```

#### Task Groups (Visual Organization)
```python
from airflow.utils.task_group import TaskGroup

with TaskGroup("feature_engineering") as feat_group:
    clean = PythonOperator(...)
    aggregate = PythonOperator(...)
    encode = PythonOperator(...)

with TaskGroup("model_training") as train_group:
    split = PythonOperator(...)
    train = PythonOperator(...)
    tune = PythonOperator(...)

feat_group >> train_group
```

#### Sensors (Wait for External Events)
```python
from airflow.sensors.s3_key import S3KeySensor

wait_for_data = S3KeySensor(
    task_id='wait_for_raw_data',
    bucket_key='raw/data/{{ ds }}/_SUCCESS',
    bucket_name='my-bucket',
    poke_interval=300,  # Check every 5 min
    timeout=3600,       # Give up after 1 hour
    mode='reschedule',  # Free worker slot while waiting
)
```

---

## 4. Prefect (Modern, Pythonic)

### Philosophy
- **Code as workflows** (no DAG files)
- **Dynamic workflows** (loops, conditionals, mapping)
- **Observability built-in** (Prefect Cloud/UI)

### Basic Flow
```python
# flows/ml_pipeline.py
from prefect import flow, task, get_run_logger
from prefect.task_runners import ConcurrentTaskRunner
import pandas as pd

@task(retries=3, retry_delay_seconds=30)
def extract_data(date: str) -> pd.DataFrame:
    logger = get_run_logger()
    df = pd.read_parquet(f"s3://bucket/raw/{date}/data.parquet")
    logger.info(f"Extracted {len(df)} rows")
    return df

@task
def validate_data(df: pd.DataFrame) -> pd.DataFrame:
    assert len(df) > 1000
    assert df['target'].notna().all()
    return df

@task
def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    # Feature engineering
    df['feature_new'] = df['a'] * df['b']
    return df

@task
def train_model(df: pd.DataFrame) -> str:
    # Train and save model
    model_path = f"/tmp/model_{pd.Timestamp.now().strftime('%Y%m%d')}.pkl"
    # ... training code
    return model_path

@flow(
    name="ml-training-pipeline",
    task_runner=ConcurrentTaskRunner(),
    retries=1,
)
def ml_pipeline(date: str = None):
    if date is None:
        date = pd.Timestamp.now().strftime('%Y-%m-%d')
    
    raw_data = extract_data(date)
    validated = validate_data(raw_data)
    features = engineer_features(validated)
    model_path = train_model(features)
    
    return model_path

# Run
if __name__ == "__main__":
    ml_pipeline()
```

### Deployment
```python
from prefect.deployments import Deployment
from prefect.server.schemas.schedules import CronSchedule

deployment = Deployment.build_from_flow(
    flow=ml_pipeline,
    name="daily-training",
    schedule=CronSchedule(cron="0 2 * * *", timezone="UTC"),
    work_queue_name="ml-training",
    parameters={"date": "{{ prefect.deployment.scheduled_start_time | date('%Y-%m-%d') }}"},
)

deployment.apply()
```

### Prefect Blocks (Infrastructure as Code)
```python
from prefect_aws import S3Bucket, AwsCredentials
from prefect_docker import DockerContainer

# Store credentials securely
AwsCredentials(access_key_id="...", secret_access_key="...").save("aws-creds")
S3Bucket(bucket_name="my-bucket", credentials=AwsCredentials.load("aws-creds")).save("my-s3")

# Use in flow
@task
def read_from_s3(s3_block: S3Bucket = S3Bucket.load("my-s3")):
    return s3_block.read_path("data.parquet")
```

---

## 5. Dagster (Software-Defined Assets)

### Philosophy
- **Assets** as first-class citizens (not tasks)
- **Type checking** and **testing** built-in
- **Lineage** and **data quality** automatic

### Asset-Based Pipeline
```python
# assets/ml_assets.py
from dagster import asset, AssetIn, Output, MetadataValue
import pandas as pd

@asset(
    group_name="raw",
    compute_kind="pandas",
    io_manager_key="s3_parquet",
)
def raw_data(context) -> pd.DataFrame:
    date = context.partition_key
    return pd.read_parquet(f"s3://bucket/raw/{date}/data.parquet")

@asset(
    ins={"raw_data": AssetIn()},
    group_name="features",
    io_manager_key="s3_parquet",
)
def features(raw_data: pd.DataFrame) -> pd.DataFrame:
    df = raw_data.copy()
    df['feature_new'] = df['a'] * df['b']
    return df

@asset(
    ins={"features": AssetIn()},
    group_name="model",
    io_manager_key="model_store",
)
def trained_model(features: pd.DataFrame):
    from sklearn.ensemble import RandomForestClassifier
    import joblib
    
    X = features.drop('target', axis=1)
    y = features['target']
    
    model = RandomForestClassifier(n_estimators=200)
    model.fit(X, y)
    
    return joblib.dumps(model)

@asset(
    ins={"trained_model": AssetIn(), "features": AssetIn()},
    group_name="validation",
)
def model_validation(trained_model: bytes, features: pd.DataFrame):
    import joblib
    from sklearn.metrics import accuracy_score
    
    model = joblib.loads(trained_model)
    X = features.drop('target', axis=1)
    y = features['target']
    
    preds = model.predict(X)
    accuracy = accuracy_score(y, preds)
    
    assert accuracy > 0.8, f"Model accuracy {accuracy} below threshold"
    return accuracy
```

### Definitions & Resources
```python
# definitions.py
from dagster import Definitions, load_assets_from_modules, EnvVar
from dagster_aws.s3 import S3Resource
from dagster_pyspark import pyspark_resource
from . import assets

defs = Definitions(
    assets=load_assets_from_modules([assets]),
    resources={
        "s3": S3Resource(
            aws_access_key_id=EnvVar("AWS_KEY"),
            aws_secret_access_key=EnvVar("AWS_SECRET"),
        ),
        "pyspark": pyspark_resource.configured({
            "spark_conf": {"spark.sql.adaptive.enabled": "true"}
        }),
    },
)
```

---

## 6. dbt (Analytics Engineering)

### SQL-First Transformations
```sql
-- models/staging/stg_events.sql
{{ config(materialized='view') }}

select
    event_id,
    user_id,
    event_type,
    timestamp::timestamp as event_ts,
    json_extract(payload, '$.value') as value
from {{ source('raw', 'events') }}
where timestamp >= '{{ var("start_date") }}'
```

```sql
-- models/marts/user_features.sql
{{ config(materialized='table', partition_by='event_date') }}

with daily as (
    select
        user_id,
        date(event_ts) as event_date,
        count(*) as event_count,
        sum(case when event_type = 'purchase' then 1 else 0 end) as purchase_count,
        avg(value) as avg_value
    from {{ ref('stg_events') }}
    group by 1, 2
)

select
    user_id,
    event_date,
    event_count,
    purchase_count,
    avg_value,
    -- Rolling features
    avg(event_count) over (
        partition by user_id 
        order by event_date 
        rows between 6 preceding and current row
    ) as rolling_7d_events
from daily
```

### Testing
```yaml
# models/schema.yml
version: 2
models:
  - name: user_features
    columns:
      - name: user_id
        tests:
          - not_null
          - unique:
              config:
                where: "event_date = '{{ var("max_date") }}'"
      - name: event_count
        tests:
          - not_null
          - dbt_utils.expression_is_true:
              expression: "> 0"
```

---

## 7. Orchestration Patterns

### Incremental Processing
```python
# Airflow: Use execution_date / data interval
def process_incremental(**context):
    start = context['data_interval_start']
    end = context['data_interval_end']
    # Process only [start, end) partition

# Dagster: Partitions
@asset(partitions_def=DailyPartitionsDefinition(start_date="2024-01-01"))
def daily_features(context):
    date = context.partition_key
    ...
```

### Backfilling
```bash
# Airflow
airflow dags backfill -s 2024-01-01 -e 2024-01-31 ml_pipeline

# Prefect
prefect deployment run 'ml-pipeline/daily-training' --param date=2024-01-01

# Dagster
dagster asset materialize --select daily_features --partitions 2024-01-01:2024-01-31
```

### Data Quality Gates
```python
# Airflow: BranchPythonOperator
def check_quality(**context):
    df = pd.read_parquet(...)
    if df['target'].isna().sum() > 100:
        return 'alert_task'
    return 'continue_task'

check = BranchPythonOperator(
    task_id='quality_check',
    python_callable=check_quality,
)

alert = EmailOperator(...)
continue_task = DummyOperator(...)

check >> [alert, continue_task]
```

---

## 8. CI/CD for Pipelines

### GitHub Actions (Airflow)
```yaml
# .github/workflows/airflow-dags.yml
name: Validate DAGs

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      
      - name: Install dependencies
        run: pip install -r requirements.txt
      
      - name: Lint DAGs
        run: |
          python -m py_compile dags/*.py
          airflow dags list-import-errors
      
      - name: Test DAGs
        run: pytest tests/dags/
      
      - name: Deploy to Airflow
        if: github.ref == 'refs/heads/main'
        run: |
          # Sync DAGs to Airflow (S3, GCS, or git-sync)
          aws s3 sync dags/ s3://airflow-bucket/dags/
```

---

## 9. Monitoring & Alerting

### Key Metrics
| Metric | Alert Threshold |
|--------|-----------------|
| **DAG run duration** | > 2x historical avg |
| **Task failure rate** | > 5% in 1 hour |
| **Queue depth** | > 100 tasks waiting |
| **Scheduler heartbeat** | Missed > 2 cycles |
| **Data freshness** | Last run > schedule + 1hr |

### Prefect/Dagster UI
- Built-in dashboards for run history, duration trends, failure analysis
- Prefect Cloud: Automated notifications (Slack, Email, PagerDuty)

---

## 10. Choosing the Right Tool

| Scenario | Recommended |
|----------|-------------|
| **Existing Airflow investment** | Airflow (upgrade to 2.8+) |
| **New project, Python team** | Prefect (Cloud or OSS) |
| **Data quality critical, testing needed** | Dagster |
| **SQL-heavy, analytics team** | dbt + Airflow/Prefect |
| **ML on Kubernetes** | Kubeflow Pipelines |
| **Notebook-driven, fast iteration** | Mage |
| **Simple cron replacement** | Prefect / cron + scripts |

---

## 11. Best Practices Summary

- [ ] **Idempotent tasks** (re-runnable without side effects)
- [ ] **Explicit dependencies** (no hidden coupling)
- [ ] **Parameterize dates** (no hardcoded dates)
- [ ] **Small, focused tasks** (single responsibility)
- [ ] **Version control DAGs** (GitOps)
- [ ] **Test locally** (Airflow `airflow tasks test`, Prefect `flow()`)
- [ ] **Monitor data freshness** (not just task success)
- [ ] **Automated backfill capability**
- [ ] **Secret management** (Vault, AWS Secrets, not env vars in code)
- [ ] **Resource isolation** (separate queues for heavy vs light tasks)