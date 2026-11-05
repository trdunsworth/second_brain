# Data Management

**Definition**: Data management is the development, execution, and supervision of plans, policies, programs, and practices that control, protect, deliver, and enhance the value of data and information assets. (DAMA-DMBOK2)

---

## 1. Data Lifecycle Management

### 1.1 Data Lifecycle Stages
```markdown
Data Lifecycle:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   CREATE    │───▶│   STORE     │───▶│   USE       │───▶│   SHARE     │───▶│   ARCHIVE   │───▶│   DESTROY   │
│   (Generate,│    │   (Persist, │    │   (Process, │    │   (Share,   │    │   (Retain,  │    │   (Secure   │
│   Collect,  │    │   Protect,  │    │   Analyze,  │    │   Publish,  │    │   Archive,  │    │   Dispose,  │
│   Capture)  │    │   Organize) │    │   Decide)   │    │   Publish)  │    │   Retain)   │    │   Sanitize) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### 1.2 Data Lifecycle Policies
```python
class DataLifecyclePolicy:
    def __init__(self):
        self.stages = {
            'create': {
                'capture_standards': ['schema_validation', 'quality_gates', 'metadata_tagging'],
                'ingestion_sla': '15min_batch / 5min_stream',
                'validation_rules': ['schema', 'completeness', 'business_rules']
            },
            'store': {
                'tiering': {'hot': 'SSD/NVMe', 'warm': 'HDD/Object', 'cold': 'Glacier/DeepArchive'},
                'compression': 'zstd/snappy',
                'partitioning': 'time/tenant/entity',
                'replication': {'rpo': '1hr', 'rto': '4hr', 'geo': 'multi-az'}
            },
            'use': {
                'access_patterns': ['oltp', 'olap', 'ml', 'streaming'],
                'access_controls': ['rbac', 'abac', 'dynamic_masking'],
                'performance': {'latency_p99': '<100ms', 'throughput': '>10k qps'}
            },
            'share': {
                'governance': ['data_contracts', 'data_sharing_agreements', 'api_contracts'],
                'delivery': ['api', 'batch', 'stream', 'data_share', 'clean_room'],
                'contracts': ['schema_registry', 'versioning', 'slas']
            },
            'archive': {
                'criteria': ['age>365d', 'access_freq<monthly', 'legal_hold=false'],
                'tier': 'cold_storage',
                'retrieval_sla': '12-48hrs'
            },
            'destroy': {
                'trigger': ['retention_expired', 'legal_hold_released', 'consent_withdrawn'],
                'method': ['crypto_shred', 'physical_destruction', 'degaussing'],
                'verification': ['certificate', 'audit_log', 'witness']
            }
```

---

## 2. Data Architecture Patterns

### 1. Modern Data Stack Architecture
```markdown
Modern Data Architecture (2024):
┌─────────────────────────────────────────────────────────────────────┐
│                        CONSUMER LAYER                               │
│  BI (Looker, Tableau, PowerBI)  │  Notebooks  │  APIs  │  Apps    │
├─────────────────────────────────────────────────────────────────────┤
│                        SEMANTIC LAYER                               │
│  Metrics Layer (dbt, Cube, Cube.js, MetricFlow)  │  Feature Store  │
├─────────────────────────────────────────────────────────────────────┤
│                      PROCESSING / TRANSFORMATION                    │
│  dbt / SQLMesh  │  Spark/Flink  │  dlt / Airbyte  │  Dagster/Prefect │
├─────────────────────────────────────────────────────────────────────┤
│                         STORAGE LAYER                               │
│  Data Lake (Iceberg, Delta, Hudi)  │  Warehouse (Snowflake, BQ, RS) │
│  Feature Store  │  Vector DB  │  Graph DB  │  Time Series DB      │
├─────────────────────────────────────────────────────────────────────┤
│                       INGESTION / INTEGRATION                       │
│  Batch (Airflow, Dagster, Prefect)  │  Streaming (Kafka, Flink)    │
│  CDC (Debezium, Fivetran, Airbyte)  │  APIs, CDC, Events           │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. Data Lakehouse (Iceberg / Delta / Hudi)
```python
# Apache Iceberg
CREATE TABLE analytics.events (
    event_id BIGINT,
    user_id BIGINT,
    event_type STRING,
    properties MAP<STRING, STRING>,
    event_time TIMESTAMP
) USING iceberg
PARTITIONED BY (days(event_time), event_type)
TBLPROPERTIES (
    'write.target-file-size-bytes'='134217728',
    'write.metadata.compression-codec'='zstd'
);

# Time travel
SELECT * FROM events VERSION AS OF 12345;
SELECT * FROM events FOR SYSTEM_TIME AS OF '2024-01-01';

# Time travel queries
SELECT * FROM events FOR SYSTEM_TIME AS OF '2024-01-01 00:00:00';
```

### 2. Data Contracts
```python
# Data Contract (Pydantic + OpenLineage)
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class OrderEvent(BaseModel):
    event_id: str = Field(..., description="Unique event ID")
    user_id: int = Field(..., gt=0)
    event_type: str = Field(..., pattern="^(purchase|view|click)$")
    amount: Optional[float] = Field(None, ge=0)
    currency: str = Field(default="USD", pattern="^[A-Z]{3}$")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[dict] = Field(default_factory=dict)

    class Config:
        json_schema_extra = {"example": {...}}

# Schema registry (Confluent / Apicurio / custom)
SCHEMA_REGISTRY = {
    'subject': 'orders-value',
    'version': 3,
    'schema': OrderEvent.schema_json(),
    'compatibility': 'BACKWARD'
}
```

---

## 3. Data Integration Patterns

### 3.1 Ingestion Patterns
```python
# Batch Ingestion (Airflow/Dagster/Prefect)
@task
def extract_source_system():
    return extract_from_api()

@task
def transform(data):
    return transform_data(data)

@task  
def load(transformed_data):
    load_to_warehouse(transformed_data)

# Streaming (Kafka + Flink/Spark Streaming)
from pyspark.sql import SparkSession
from pyspark.sql.functions import *

spark = SparkSession.builder.appName("StreamingETL").getOrCreate()

stream = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "broker:9092") \
    .option("subscribe", "events") \
    .load()

processed = stream.select(
    from_json(col("value").cast("string"), schema).alias("data")
).select("data.*")

query = processed.writeStream \
    .format("iceberg") \
    .option("checkpointLocation", "s3://bucket/checkpoints") \
    .toTable("analytics.events")
```

### 3.2 Change Data Capture (CDC)
```python
# Debezium (MySQL/Postgres/MongoDB)
{
  "name": "inventory-connector",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "password",
    "database.dbname": "inventory",
    "table.include.list": "inventory.orders,inventory.customers",
    "database.history.kafka.bootstrap.servers": "kafka:9092",
    "database.history.kafka.topic": "dbhistory.inventory"
  }
}

# CDC to Iceberg
# Flink CDC -> Iceberg (upsert via MERGE)
```

### 3.3 Data Contracts
```python
# Data Contract (OpenLineage / custom)
DATA_CONTRACT = {
    "dataset": "orders",
    "version": "2.1.0",
    "owner": "data-engineering@company.com",
    "sla": {
        "freshness": "1h",
        "availability": "99.9%",
        "latency_p99": "5s"
    },
    "schema": {
        "fields": [
            {"name": "order_id", "type": "STRING", "required": True, "pii": False},
            {"name": "customer_id", "type": "INT64", "required": True, "pii": False},
            {"name": "amount", "type": "DECIMAL(10,2)", "required": True, "pii": False},
            {"name": "email", "type": "STRING", "required": True, "pii": True}
        ]
    },
    "quality": {
        "completeness": {"threshold": 0.99},
        "uniqueness": {"key": "order_id", "threshold": 1.0},
        "freshness": {"max_hours": 2}
    },
    "access": {
        "tier": "tier_1",
        "steward": "data-engineering@company.com"
    }
}
```

---

## 4. Data Quality Implementation

### 4.1 Great Expectations
```python
import great_expectations as ge

context = ge.get_context()

# Expectation Suite
suite = ge.ExpectationSuite(name="orders_suite")

# Expectations
suite.add_expectation(ge.expectations.ExpectColumnValuesToNotBeNull(column="order_id"))
suite.add_expectation(ge.expectations.ExpectColumnValuesToBeBetween("amount", 0, 100000))
suite.add_expectation(ge.expectations.ExpectColumnValuesToBeInSet("status", ["pending", "paid", "shipped", "cancelled"]))
suite.add_expectation(ge.expectations.ExpectColumnValuesToBeUnique("order_id"))
suite.add_expectation(ge.expectations.ExpectColumnValuesToMatchRegex("email", r"^[^@]+@[^@]+\.\w+$"))

# Checkpoint
checkpoint = ge.Checkpoint(
    name="daily_orders_check",
    run_name_template="%Y%m%d-%H%M%S",
    expectation_suite_name="orders_suite",
    action_list=[
        {"name": "store_validation_result", "action": {"class_name": "StoreValidationResultAction"}},
        {"name": "store_evaluation_params", "action": {"class_name": "StoreEvaluationParametersAction"}},
        {"name": "slack_notification", "action": {"class_name": "SlackNotificationAction", "slack_webhook": "${SLACK_WEBHOOK}"}}
    ]
)

# Run
results = checkpoint.run(batch_request=batch_request)
```

### 2.2 Soda Core / SodaCL
```yaml
# checks.yml
checks for orders:
  - schema:
      name: orders schema
      fail:
        when required column missing: [order_id, customer_id, amount]
        when column type changed: true
  
  - row_count > 0
  - freshness: updated_at < 24h
  
  - missing_count(email) = 0
  - duplicate_count(order_id) = 0
  
  - values in (status) must be: ["pending", "paid", "shipped", "cancelled", "refunded"]
  - values in (currency) must be: ["USD", "EUR", "GBP"]
  
  - mean(amount) between 0 and 10000
  - percentile(amount, 0.99) < 5000
  
  - correlation(amount, quantity) > 0.5
```

---

## 5. Data Lineage & Observability

### 1. OpenLineage Integration
```python
from openlineage.client import OpenLineageClient
from openlineage.client.facet_v2 import schema_dataset, data_source, data_quality_metrics

client = OpenLineageClient(url="http://marquez:5000")

# Emit lineage event
client.emit(
    JobEvent(
        job=Job(namespace="analytics", name="daily_etl"),
        run=Run(runId=str(uuid4())),
        inputs=[
            Dataset(namespace="warehouse", name="raw_events",
                facets={"schema": SchemaDatasetFacet(fields=[...])})
        ],
        outputs=[
            Dataset(namespace="warehouse", name="daily_agg",
                facets={"dataQuality": DataQualityMetricsFacet(rowCount=1000, bytes=1024000)})
        ],
        eventType=EventType.COMPLETE,
        eventTime=datetime.utcnow().isoformat() + "Z"
    )
```

### 2. Data Observability Stack
```yaml
# Modern Data Observability Stack
MODERN_STACK:
  catalog: [Amundsen, DataHub, OpenMetadata, Atlan, Atlan]
  lineage: [OpenLineage, Marquez, Atlas, DataHub]
  quality: [Great Expectations, Soda, dbt tests, Elementary]
  observability: [Monte Carlo, Metaplane, Metaplane, Elementary]
  alerting: [PagerDuty, Opsgenie, Slack, PagerDuty]
```

---

## 5. Data Platform Operations

### 1. Infrastructure as Code (Terraform)
```hcl
# Snowflake + dbt + Airflow
resource "snowflake_warehouse" "transform_wh" {
  name = "TRANSFORM_WH"
  warehouse_size = "MEDIUM"
  auto_suspend = 60
  auto_resume = true
  min_cluster_count = 1
  max_cluster_count = 3
  scaling_policy = "STANDARD"
}

resource "snowflake_database" "analytics" {
  name = "ANALYTICS"
  comment = "Analytics database"
}

resource "snowflake_schema" "analytics" {
  database = snowflake_database.analytics.name
  name = "ANALYTICS"
}

resource "snowflake_role" "transform_role" {
  name = "TRANSFORM_ROLE"
}

resource "snowflake_grant_privileges" "transform_grants" {
  role_name = snowflake_role.transform_role.name
  privilege = "USAGE"
  on_object_type = "WAREHOUSE"
  object_name = snowflake_warehouse.transform_wh.name
}
```

### 2. CI/CD for Data (GitHub Actions)
```yaml
# .github/workflows/data-pipeline.yml
name: Data Pipeline CI/CD

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
        with: { python-version: '3.11' }
      - run: pip install -e ".[dev]"
      - run: dbt deps && dbt parse
      - run: dbt build --target ci
      
  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - run: dbt run --target staging
      - run: dbt test --target staging
      
  deploy-prod:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - run: dbt run --target prod
      - run: dbt test --target prod
```

---

## 6. Data Mesh

### 1. Data Mesh Principles (Zhamak Dehghani)
```markdown
Four Principles of Data Mesh:
1. **Domain-Oriented Ownership** - Data owned by domain teams
2. **Data as a Product** - Data as product with SLAs, owners, consumers
3. **Self-Serve Data Platform** - Platform enables self-service
4. **Federated Computational Governance** - Standards, interoperability
```

### 2. Data Product Template
```python
from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime

@dataclass
class DataProduct:
    name: str
    domain: str
    owner: str
    description: str
    sla: SLADefinition
    schema: Schema
    quality: QualityMetrics
    lineage: LineageInfo
    access: AccessPolicy
    lifecycle: LifecycleStage
    
    # Contract
    contract: DataContract
    
    # Observability
    metrics: List[Metric]
    alerts: List[AlertRule]
    
    # Governance
    owner: str
    steward: str
    classification: DataClassification
    retention: RetentionPolicy
```

---

## 6. Modern Data Stack Components

| Layer | Technologies | Selection Criteria |
|-------|--------------|-------------------|
| **Ingestion** | Airbyte, Fivetran, Airbyte, dlt, Kafka, Kafka Connect | Volume, latency, connectors |
| **Orchestration** | Dagster, Prefect, Dagster, Airflow, Dagster | DAG complexity, Python-native |
| **Transformation** | dbt, SQLMesh, dbt + SQLMesh | SQL vs Python, incremental |
| **Warehouse** | Snowflake, BigQuery, Redshift, ClickHouse, MotherDuck | Scale, concurrency, cost |
| **Lakehouse** | Iceberg, Delta Lake, Hudi | ACID, time travel, streaming |
| **Catalog** | Polaris, Nessie, Gravitino | Iceberg/Delta/Hudi support |
| **Observability** | Monte Carlo, Metaplane, Elementary, Soda | Coverage, alerting, lineage |
| **Governance** | Unity Catalog, Purview, Atlan, Atlan | RBAC, lineage, compliance |

---

## 📚 Key References

| # | Citation | Link |
|---|----------|------|
| 1 | Kimball, R., & Ross, M. "The Data Warehouse Toolkit." 3rd Ed. Wiley, 2013. | [ISBN: 978-1118530801] |
| 2 | Inmon, W.H. "Building the Data Warehouse." 4th Ed. Wiley, 2005. | [ISBN: 978-0764567612] |
| 3 | Linstedt, D. "Data Vault 2.0." Technics Publications, 2012. | [ISBN: 978-1935504102] |
| 4 | Dehghani, Z. "Data Mesh: Delivering Data-Driven Value at Scale." O'Reilly, 2022. | [ISBN: 978-1098105534] |
| 5 | Harris, J. "Fundamentals of Data Engineering." O'Reilly, 2022. | [ISBN: 978-1098105672] |
| 6 | Ananthanarayanan, G. et al. "Delta Lake: High-Performance ACID Table Storage." CIDR 2020. | [Link](https://databricks.com/blog/2020/02/24/delta-lake-high-performance-acid-table-storage.html) |
| 7 | Armbrust, M. et al. "Delta Lake: High-Performance ACID Table Storage." CIDR 2020. | [Link](https://databricks.com/blog/2020/02/24/delta-lake-high-performance-acid-table-storage.html) |
| 6 | Thiru, V. et al. "Apache Iceberg: Open Table Format for Analytic Workloads." 2021. | [Link](https://iceberg.apache.org/) |
| 7 | Hudi. "Apache Hudi: Stream Processing Platform." 2023. | [Link](https://hudi.apache.org/) |

---

## 🔗 Cross-References

| Topic | Related Notes |
|-------|---------------|
| **Data Governance** | `Data Governance/02_Data_Governance.md` |
| **Data Security** | `Data Governance/04_Data_Security.md` |
| **Data Sovereignty** | `Data Governance/05_Data_Sovereignty.md` |
| **Data Ownership** | `Data Governance/06_Data_Ownership.md` |
| **Data Literacy** | `Data Governance/01_Data_Literacy.md` |
| **MLOps** | `Python Programming/MLOps/01_MLOps_Cheatsheet.md` |
| **Data Engineering** | `Python Programming/07_Data_Engineering_Cheatsheet.md` |
| **Time Series** | `Python Programming/Time_Series/01_Time_Series_Cheatsheet.md` |

---

*Last updated: 2024-11-05*
*Part of: 9-1-1 Data Whisperer knowledge base*