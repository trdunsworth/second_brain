# Databricks Learning Guide

## Overview
Databricks is a unified analytics platform built on Apache Spark that combines data engineering, data science, machine learning, and analytics in a single collaborative environment. It provides a managed Spark service with optimized performance, Delta Lake for ACID transactions, MLflow for ML lifecycle, and Unity Catalog for governance.

## Quick Template

```python
# Databricks Notebook - Basic Spark DataFrame Operations
# MAGIC %md
# MAGIC # Customer Analytics Pipeline

# COMMAND ----------

# MAGIC %pip install dbt-databricks -q

# COMMAND ----------

from pyspark.sql import functions as F
from pyspark.sql.types import *
from delta.tables import DeltaTable

# Read from Delta Lake
customers = spark.read.table("catalog.schema.customers")
orders = spark.read.table("catalog.schema.orders")

# Transform
customer_orders = (
    customers.join(orders, "customer_id")
    .groupBy("customer_id", "email", "region")
    .agg(
        F.count("order_id").alias("total_orders"),
        F.sum("amount").alias("lifetime_value"),
        F.max("order_date").alias("last_order_date")
    )
    .withColumn("customer_tier", 
        F.when(F.col("lifetime_value") > 10000, "Platinum")
        .when(F.col("lifetime_value") > 5000, "Gold")
        .when(F.col("lifetime_value") > 1000, "Silver")
        .otherwise("Bronze")
    )
)

# Write to Delta Lake with merge (upsert)
customer_orders.write \
    .format("delta") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .saveAsTable("catalog.schema.customer_360")
```

```sql
-- SQL Notebook - Delta Lake DDL
CREATE TABLE IF NOT EXISTS catalog.schema.customer_360 (
    customer_id BIGINT NOT NULL,
    email STRING,
    region STRING,
    total_orders INT,
    lifetime_value DECIMAL(18,2),
    last_order_date DATE,
    customer_tier STRING,
    created_ts TIMESTAMP DEFAULT current_timestamp(),
    updated_ts TIMESTAMP DEFAULT current_timestamp()
)
USING DELTA
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'delta.autoOptimize.optimizeWrite' = 'true',
    'delta.autoOptimize.autoCompact' = 'true'
);

-- MERGE for upsert (SCD Type 1)
MERGE INTO catalog.schema.customer_360 AS target
USING (
    SELECT * FROM staging_customer_updates
) AS source
ON target.customer_id = source.customer_id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
```

## Core Syntax Cheatsheet

| Element | Syntax | Example |
|---------|--------|---------|
| Read Table | `spark.read.table("cat.sch.tbl")` | `df = spark.read.table("main.sales.orders")` |
| Write Table | `df.write.saveAsTable("cat.sch.tbl")` | `df.write.mode("overwrite").saveAsTable(...)` |
| Delta Read | `spark.read.format("delta").load(path)` | `DeltaTable.forPath(spark, path)` |
| Delta Write | `df.write.format("delta").mode(...)` | `.option("mergeSchema", "true")` |
| SQL Magic | `%sql` | `%sql SELECT * FROM table` |
| Python Magic | `%python` | `%python df.show()` |
| Scala Magic | `%scala` | `%scala val df = spark.table("t")` |
| R Magic | `%r` | `%r df <- sql("SELECT * FROM t")` |
| FS Magic | `%fs` | `%fs ls /mnt/data/` |
| Sh Magic | `%sh` | `%sh ls -la /databricks/driver/` |
| Widgets | `dbutils.widgets.text("name", "default")` | `dbutils.widgets.get("name")` |
| Secrets | `dbutils.secrets.get(scope, key)` | `dbutils.secrets.get("prod", "db-password")` |
| Jobs API | `databricks jobs create --json-file` | See CLI section |

## Practical Examples

### 1. Delta Lake Fundamentals

```python
# Create Delta table with partitioning and Z-Ordering
df.write \
    .format("delta") \
    .partitionBy("year", "month") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .saveAsTable("catalog.schema.events")

# Optimize and Z-Order for query performance
spark.sql("OPTIMIZE catalog.schema.events ZORDER BY (user_id, event_type)")

# Vacuum old files (retention: 168 hours = 7 days default)
spark.sql("VACUUM catalog.schema.events RETAIN 168 HOURS")

# Time Travel - query historical versions
df_v1 = spark.read.format("delta") \
    .option("versionAsOf", 1) \
    .table("catalog.schema.events")

df_timestamp = spark.read.format("delta") \
    .option("timestampAsOf", "2024-01-15 10:00:00") \
    .table("catalog.schema.events")

# Change Data Feed (CDF) - capture row-level changes
cdf_df = spark.read.format("delta") \
    .option("readChangeFeed", "true") \
    .option("startingVersion", 10) \
    .table("catalog.schema.customers")

# Schema Evolution - add columns automatically
df_with_new_col.write \
    .format("delta") \
    .mode("append") \
    .option("mergeSchema", "true") \
    .saveAsTable("catalog.schema.events")
```

### 2. Structured Streaming with Delta

```python
# Auto Loader - incremental file ingestion
from pyspark.sql import functions as F

raw_stream = (
    spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/mnt/checkpoints/schema")
    .option("cloudFiles.inferColumnTypes", "true")
    .load("s3://bucket/raw/events/")
)

# Transform and write to Delta
(
    raw_stream
    .withColumn("ingestion_time", F.current_timestamp())
    .withColumn("event_date", F.to_date(F.col("timestamp")))
    .writeStream
    .format("delta")
    .option("checkpointLocation", "/mnt/checkpoints/events")
    .option("mergeSchema", "true")
    .partitionBy("event_date")
    .trigger(availableNow=True)  # or processingTime="1 minute"
    .toTable("catalog.schema.bronze_events")
)

# Streaming MERGE for upserts (foreachBatch)
def upsert_to_delta(batch_df, batch_id):
    delta_table = DeltaTable.forName(spark, "catalog.schema.silver_customers")
    (
        delta_table.alias("target")
        .merge(batch_df.alias("source"), "target.customer_id = source.customer_id")
        .whenMatchedUpdateAll()
        .whenNotMatchedInsertAll()
        .execute()
    )

(
    streaming_df
    .writeStream
    .foreachBatch(upsert_to_delta)
    .option("checkpointLocation", "/mnt/checkpoints/silver_customers")
    .start()
)
```

### 3. Unity Catalog & Governance

```sql
-- Unity Catalog: Three-level namespace (catalog.schema.table)
CREATE CATALOG IF NOT EXISTS production;
CREATE SCHEMA IF NOT EXISTS production.analytics;

-- Grant permissions
GRANT SELECT ON TABLE production.analytics.customers TO `analysts@company.com`;
GRANT MODIFY ON TABLE production.analytics.orders TO `data-engineers@company.com`;
GRANT ALL PRIVILEGES ON SCHEMA production.analytics TO `admins@company.com`;

-- Row-level security
CREATE FUNCTION production.analytics.region_filter(region STRING)
RETURN CASE 
    WHEN is_member('eu-analysts') THEN region = 'EU'
    WHEN is_member('us-analysts') THEN region = 'US'
    ELSE false
END;

ALTER TABLE production.analytics.customers
SET ROW FILTER production.analytics.region_filter ON (region);

-- Column masking
CREATE FUNCTION production.analytics.mask_email(email STRING)
RETURN CASE 
    WHEN is_member('pii-access') THEN email
    ELSE regexp_replace(email, '(.{2}).*(@.*)', '$1****$2')
END;

ALTER TABLE production.analytics.customers
ALTER COLUMN email SET MASK production.analytics.mask_email;
```

```python
# Python: Unity Catalog programmatic access
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.catalog import *

w = WorkspaceClient()

# Create catalog
w.catalogs.create(name="marketing", comment="Marketing data catalog")

# Create schema
w.schemas.create(catalog_name="marketing", name="campaigns")

# Grant privileges
w.grants.update(
    securable_type=SecurableType.TABLE,
    full_name="marketing.campaigns.performance",
    changes=[
        PermissionsChange(principal="analysts@company.com", add=[Privilege.SELECT])
    ]
)
```

### 4. MLflow & Machine Learning

```python
# MLflow Tracking
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

mlflow.set_experiment("/Users/username/customer-ltv-prediction")

with mlflow.start_run(run_name="rf-baseline") as run:
    # Load features
    features = spark.read.table("catalog.schema.customer_features").toPandas()
    X = features.drop("lifetime_value", axis=1)
    y = features["lifetime_value"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    preds = model.predict(X_test)
    mse = mean_squared_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    
    # Log params, metrics, model
    mlflow.log_params({"n_estimators": 100, "max_depth": 10})
    mlflow.log_metrics({"mse": mse, "r2": r2})
    mlflow.sklearn.log_model(model, "model", registered_model_name="customer_ltv_model")

# Model Serving - Deploy to Model Serving Endpoint
from databricks.sdk import WorkspaceClient
w = WorkspaceClient()

w.serving_endpoints.create(
    name="customer-ltv-endpoint",
    config=EndpointCoreConfigInput(
        served_entities=[
            ServedEntityInput(
                entity_name="customer_ltv_model",
                scale_to_zero_enabled=True,
                workload_size="Small"
            )
        ]
    )
)
```

```python
# Feature Store - Centralized feature management
from databricks.feature_store import FeatureStoreClient

fs = FeatureStoreClient()

# Create feature table
fs.create_table(
    name="catalog.schema.customer_features",
    primary_keys=["customer_id"],
    df=features_df,
    description="Customer behavioral features for LTV prediction"
)

# Write features
fs.write_table(
    name="catalog.schema.customer_features",
    df=new_features_df,
    mode="merge"
)

# Read features for training
training_set = fs.read_table("catalog.schema.customer_features")
# Or create training set with lookup
training_set = fs.create_training_set(
    df=labels_df,
    feature_lookups=[
        FeatureLookup(
            table_name="catalog.schema.customer_features",
            lookup_key="customer_id",
            feature_names=["total_orders", "avg_order_value", "days_since_last_order"]
        )
    ],
    label="lifetime_value"
)

# Log model with feature store
mlflow.sklearn.log_model(
    model,
    "model",
    feature_store=fs,
    training_set=training_set
)
```

### 5. Databricks Jobs & Workflows

```json
// jobs/customer_pipeline.json
{
  "name": "Customer Analytics Pipeline",
  "tags": {"environment": "production", "team": "data-engineering"},
  "tasks": [
    {
      "task_key": "bronze_ingestion",
      "notebook_task": {
        "notebook_path": "/Repos/team/ingestion/bronze_events",
        "base_parameters": {"date": "{{job.parameters.date}}"}
      },
      "job_cluster_key": "shared_cluster",
      "timeout_seconds": 3600
    },
    {
      "task_key": "silver_transform",
      "depends_on": [{"task_key": "bronze_ingestion"}],
      "notebook_task": {
        "notebook_path": "/Repos/team/transform/silver_customers"
      },
      "job_cluster_key": "shared_cluster"
    },
    {
      "task_key": "gold_marts",
      "depends_on": [{"task_key": "silver_transform"}],
      "notebook_task": {
        "notebook_path": "/Repos/team/marts/gold_customer_360"
      },
      "job_cluster_key": "shared_cluster"
    },
    {
      "task_key": "ml_training",
      "depends_on": [{"task_key": "gold_marts"}],
      "notebook_task": {
        "notebook_path": "/Repos/team/ml/train_ltv_model"
      },
      "job_cluster_key": "ml_cluster"
    }
  ],
  "job_clusters": [
    {
      "job_cluster_key": "shared_cluster",
      "new_cluster": {
        "spark_version": "14.3.x-scala2.12",
        "node_type_id": "i3.xlarge",
        "num_workers": 4,
        "autotermination_minutes": 30,
        "spark_conf": {
          "spark.databricks.delta.optimizeWrite.enabled": "true",
          "spark.databricks.delta.autoCompact.enabled": "true"
        }
      }
    },
    {
      "job_cluster_key": "ml_cluster",
      "new_cluster": {
        "spark_version": "14.3.x-cpu-ml-scala2.12",
        "node_type_id": "i3.2xlarge",
        "num_workers": 2,
        "autotermination_minutes": 60
      }
    }
  ],
  "parameters": [
    {"name": "date", "default": "{{job.start_time.date}}"}
  ],
  "schedule": {
    "quartz_cron_expression": "0 0 6 * * ?",
    "timezone_id": "UTC",
    "pause_status": "UNPAUSED"
  }
}
```

```bash
# Databricks CLI v0.200+
databricks jobs create --json-file jobs/customer_pipeline.json
databricks jobs run-now --job-id 12345 --job-parameters '{"date": "2024-01-15"}'
databricks jobs list --limit 20
databricks runs get --run-id 67890
databricks runs export --run-id 67890 --format JSON
```

### 6. Delta Live Tables (DLT) - Declarative ETL

```python
# pipelines/customer_pipeline.py
import dlt
from pyspark.sql import functions as F

# Bronze - Raw ingestion with expectations
@dlt.table(
    comment="Raw events from Kafka",
    table_properties={"quality": "bronze"}
)
@dlt.expect_or_drop("valid_event_id", "event_id IS NOT NULL")
@dlt.expect("valid_timestamp", "timestamp > '2020-01-01'")
def bronze_events():
    return (
        spark.readStream
        .format("kafka")
        .option("kafka.bootstrap.servers", "broker:9092")
        .option("subscribe", "events")
        .load()
        .select(F.from_json(F.col("value").cast("string"), schema).alias("data"))
        .select("data.*")
    )

# Silver - Cleaned and enriched
@dlt.table(
    comment="Cleaned events with sessionization",
    table_properties={"quality": "silver"}
)
@dlt.expect_or_fail("no_null_users", "user_id IS NOT NULL")
def silver_events():
    return (
        dlt.read_stream("bronze_events")
        .withColumn("event_date", F.to_date("timestamp"))
        .withColumn("session_id", 
            F.concat_ws("_", "user_id", F.date_format("timestamp", "yyyyMMddHH"))
        )
    )

# Gold - Business aggregates
@dlt.table(
    comment="Daily user engagement metrics",
    table_properties={"quality": "gold"}
)
def gold_daily_user_metrics():
    return (
        dlt.read("silver_events")
        .groupBy("event_date", "user_id")
        .agg(
            F.count("*").alias("event_count"),
            F.countDistinct("session_id").alias("session_count"),
            F.sum("value").alias("total_value")
        )
    )

# Materialized View for real-time dashboard
@dlt.view(comment="Real-time active users")
def active_users_now():
    return (
        dlt.read_stream("silver_events")
        .where(F.col("timestamp") > F.expr("current_timestamp() - interval 5 minutes"))
        .select("user_id").distinct()
    )
```

```bash
# Deploy DLT Pipeline
databricks pipelines create --json '{
  "name": "Customer Events Pipeline",
  "target": "catalog.schema",
  "storage": "s3://bucket/pipelines/customer_events",
  "configuration": {"source_path": "s3://bucket/raw/"},
  "libraries": [{"notebook": {"path": "/Repos/team/pipelines/customer_pipeline.py"}}],
  "clusters": [{"label": "default", "num_workers": 4}],
  "continuous": false
}'
```

### 7. Databricks SQL & Dashboards

```sql
-- Parameterized query for dashboard
SELECT 
    region,
    customer_tier,
    COUNT(*) as customer_count,
    SUM(lifetime_value) as total_ltv,
    AVG(lifetime_value) as avg_ltv
FROM catalog.schema.customer_360
WHERE 
    region IN ({{region_filter}})
    AND customer_tier IN ({{tier_filter}})
    AND last_order_date >= {{start_date}}
GROUP BY region, customer_tier
ORDER BY total_ltv DESC
```

```python
# Databricks SDK - Query execution
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.sql import *

w = WorkspaceClient()

# Create query
query = w.queries.create(
    query=open("queries/customer_ltv.sql").read(),
    name="Customer LTV by Region",
    description="Parameterized LTV analysis",
    data_source_id="warehouse-id"
)

# Execute and get results
result = w.queries.execute(query_id=query.id, parameters={
    "region_filter": "('US', 'EU')",
    "tier_filter": "('Gold', 'Platinum')",
    "start_date": "'2024-01-01'"
})

# Create dashboard
dashboard = w.dashboards.create(
    name="Customer Analytics",
    dashboard_filters=[...],
    widgets=[...]
)
```

## Working with Databricks in Different Environments

### Databricks CLI (v0.200+)

```bash
# Authentication
databricks auth login --host https://<workspace>.cloud.databricks.com

# Workspace operations
databricks workspace list /
databricks workspace import -o /local/notebook.py /Workspace/Users/user@domain.com/notebook.py
databricks workspace export /Workspace/Users/user@domain.com/notebook.py /local/notebook.py

# Cluster management
databricks clusters list
databricks clusters create --json-file cluster.json
databricks clusters start --cluster-id 1234-567890-abcde
databricks clusters delete --cluster-id 1234-567890-abcde

# Jobs
databricks jobs create --json-file job.json
databricks jobs run-now --job-id 12345
databricks runs list --job-id 12345

# Repos (Git integration)
databricks repos create --url https://github.com/org/repo --path /Repos/team/repo
databricks repos update --path /Repos/team/repo --branch main

# SQL Warehouses
databricks sql warehouses create --json-file warehouse.json

# Unity Catalog
databricks catalogs create --name production
databricks grants update --securable-type TABLE --full-name prod.schema.table \
  --principal analysts@company.com --privilege SELECT
```

### Databricks SDK (Python/Go)

```python
# Python SDK - WorkspaceClient
from databricks.sdk import WorkspaceClient
from databricks.sdk.service import compute, jobs, sql

w = WorkspaceClient()

# Create cluster
cluster = w.clusters.create(
    cluster_name="analytics-cluster",
    spark_version="14.3.x-scala2.12",
    node_type_id="i3.xlarge",
    num_workers=4,
    autotermination_minutes=30,
    spark_conf={
        "spark.databricks.delta.optimizeWrite.enabled": "true",
        "spark.databricks.delta.autoCompact.enabled": "true"
    }
)

# Submit job run
run = w.jobs.run_now(job_id=12345, job_parameters={"date": "2024-01-15"})

# SQL Warehouse query
warehouse = w.warehouses.get("warehouse-id")
statement = w.statement_execution.execute_statement(
    warehouse_id=warehouse.id,
    statement="SELECT * FROM catalog.schema.table LIMIT 100",
    wait_timeout="30s"
)

# Unity Catalog
w.catalogs.create(name="marketing")
w.schemas.create(catalog_name="marketing", name="campaigns")
```

### CI/CD with GitHub Actions

```yaml
# .github/workflows/databricks.yml
name: Databricks CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Databricks CLI
        uses: databricks/setup-cli@main
        with:
          version: "latest"
          
      - name: Authenticate
        run: |
          databricks auth login --host ${{ secrets.DATABRICKS_HOST }} \
            --token ${{ secrets.DATABRICKS_TOKEN }}
          
      - name: Validate notebooks (databricks labs quality)
        run: |
          pip install databricks-labs-quality
          databricks-labs-quality check /Repos/team/project
          
      - name: Run SQL linter
        run: |
          pip install sqlfluff
          sqlfluff lint /Repos/team/project --dialect databricks

  deploy-staging:
    needs: validate
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Staging
        run: |
          databricks repos update --path /Repos/staging/project --branch main
          databricks jobs reset --job-id ${{ secrets.STAGING_JOB_ID }}
          
  deploy-prod:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to Production
        run: |
          databricks repos update --path /Repos/prod/project --branch main
          databricks jobs reset --job-id ${{ secrets.PROD_JOB_ID }}
```

### Terraform Provider

```hcl
# main.tf
terraform {
  required_providers {
    databricks = {
      source  = "databricks/databricks"
      version = "~> 1.20"
    }
  }
}

provider "databricks" {
  host = var.databricks_host
  token = var.databricks_token
}

# Cluster
resource "databricks_cluster" "analytics" {
  cluster_name            = "analytics-cluster"
  spark_version           = "14.3.x-scala2.12"
  node_type_id            = "i3.xlarge"
  autotermination_minutes = 30
  num_workers             = 4
  
  spark_conf = {
    "spark.databricks.delta.optimizeWrite.enabled" = "true"
    "spark.databricks.delta.autoCompact.enabled"   = "true"
  }
  
  custom_tags = {
    Environment = "production"
    Team        = "data-engineering"
  }
}

# Job
resource "databricks_job" "customer_pipeline" {
  name = "Customer Analytics Pipeline"
  
  task {
    task_key = "bronze_ingestion"
    new_cluster_id = databricks_cluster.analytics.id
    notebook_task {
      notebook_path = "/Repos/team/ingestion/bronze_events"
    }
  }
  
  task {
    task_key = "silver_transform"
    depends_on { task_key = "bronze_ingestion" }
    new_cluster_id = databricks_cluster.analytics.id
    notebook_task {
      notebook_path = "/Repos/team/transform/silver_customers"
    }
  }
}

# SQL Warehouse
resource "databricks_sql_warehouse" "analytics" {
  name                = "Analytics Warehouse"
  cluster_size        = "Small"
  min_num_clusters    = 1
  max_num_clusters    = 5
  auto_stop_mins      = 10
  enable_serverless   = true
  tags = {
    Environment = "production"
  }
}

# Unity Catalog
resource "databricks_catalog" "production" {
  name = "production"
  comment = "Production data catalog"
}

resource "databricks_schema" "analytics" {
  name = "analytics"
  catalog_name = databricks_catalog.production.name
}
```

## Common Databricks Uses

- **Data Engineering** - ETL/ELT pipelines with Delta Lake, Auto Loader, DLT
- **Data Science** - Collaborative notebooks, MLflow, Feature Store, AutoML
- **Machine Learning** - Model training, registration, serving, monitoring
- **Analytics & BI** - Databricks SQL, dashboards, AI/BI Genie
- **Streaming** - Structured Streaming, Delta Live Tables, Kafka/Kinesis
- **Data Governance** - Unity Catalog, lineage, row/column security
- **Data Sharing** - Delta Sharing, open protocol for secure data exchange
- **Lakehouse Architecture** - Unify data warehouse + data lake

## Databricks Advantages

- **Managed Spark** - No infrastructure management, auto-scaling, Photon engine
- **Delta Lake** - ACID transactions, time travel, schema evolution, CDF
- **Unified Platform** - Engineering, Science, ML, Analytics in one place
- **Collaborative Notebooks** - Real-time co-editing, version control via Repos
- **MLflow Integration** - Native experiment tracking, model registry, serving
- **Unity Catalog** - Fine-grained governance across clouds
- **Photon Engine** - C++ vectorized engine for 10x+ SQL performance
- **Multi-Cloud** - AWS, Azure, GCP with consistent experience
- **Open Standards** - Delta Lake, Parquet, Iceberg, Hudi support
- **Serverless** - Serverless SQL, compute, and model serving

## Databricks Pitfalls

- **Cost Management** - DBUs can escalate; use auto-termination, spot instances, serverless
- **Cluster Start Time** - 3-5 min for interactive clusters; use pools or serverless
- **Vendor Lock-in** - Unity Catalog, DLT, proprietary features
- **Debugging Distributed Code** - Spark UI, driver/executor logs can be complex
- **Notebook State** - Mutable state between cells; use `%run` or packages for modularity
- **Library Conflicts** - Use `%pip` with virtual environments or cluster libraries
- **Small File Problem** - Auto Loader + OPTIMIZE + Z-ORDER needed
- **Metastore Limits** - Hive metastore vs Unity Catalog migration complexity

## Awesome Databricks Resources

- **[Databricks Documentation](https://docs.databricks.com)** - Comprehensive official docs
- **[Databricks Academy](https://academy.databricks.com)** - Free training & certifications
- **[Databricks Blog](https://www.databricks.com/blog)** - Engineering & product updates
- **[Delta Lake Docs](https://delta.io/docs/)** - Delta Lake specification & guides
- **[MLflow Docs](https://mlflow.org/docs/latest/index.html)** - ML lifecycle management
- **[Databricks SDK](https://databricks-sdk-py.readthedocs.io/)** - Python/Go/JS SDKs
- **[Databricks CLI](https://docs.databricks.com/dev-tools/cli/index.html)** - CLI v0.200+ reference
- **[awesome-databricks](https://github.com/databricks/awesome-databricks)** - Curated resources
- **[Databricks Community](https://community.databricks.com)** - Forums & knowledge base
- **[Data+AI Summit](https://www.databricks.com/dataaisummit)** - Annual conference recordings
- **[Databricks Certified](https://academy.databricks.com/certification)** - Associate/Professional certs
- **[dbt-databricks](https://github.com/databricks/dbt-databricks)** - dbt adapter for Databricks
- **[Terraform Provider](https://registry.terraform.io/providers/databricks/databricks/latest/docs)** - IaC for Databricks
- **[Databricks Labs](https://github.com/databrickslabs)** - Open-source tools (quality, remorph, etc.)

## Databricks vs Other Platforms

| Feature | Databricks | Snowflake | BigQuery | Synapse | EMR |
|---------|------------|-----------|----------|---------|-----|
| Engine | Spark + Photon | Custom | Custom | Spark + T-SQL | Spark |
| Notebooks | Native | Snowsight | Colab/Notebooks | Synapse Studio | EMR Notebooks |
| ML | MLflow, FS, Serving | Snowpark ML | Vertex AI | ML Services | SageMaker/EMR |
| Streaming | Structured + DLT | Snowpipe Streaming | Dataflow | Spark Streaming | Kinesis/MSK |
| Governance | Unity Catalog | RBAC + Tags | Policy Tags | Purview | Lake Formation |
| Open Format | Delta Lake | Iceberg (preview) | BigLake | Delta/Iceberg | Iceberg/Hudi |
| SQL Performance | Photon (10x) | Excellent | Excellent | Good | Good |
| Multi-Cloud | Native | Native | GCP only | Azure only | AWS only |
| Cost Model | DBU + Compute | Credits | Slots/TB | DWU + vCore | EC2 + EMR |

## Databricks Quick Checklist

1. **Architecture** - Use Lakehouse: Bronze (raw) → Silver (clean) → Gold (business)
2. **Delta Lake** - Enable CDF, auto-optimize, Z-ORDER on high-cardinality columns
3. **Unity Catalog** - Migrate from hive_metastore; use 3-level namespace
4. **Clusters** - Use job clusters for production; pools for interactive; serverless for SQL
5. **Workflows** - Use Jobs API + Terraform; avoid manual cluster creation
6. **Repos** - Git integration for version control; use branches for dev/staging/prod
7. **MLflow** - Track all experiments; register models; use Feature Store
8. **Monitoring** - Query history, cluster metrics, lakehouse monitoring for data quality
9. **Security** - Secret scopes, IP access lists, SCIM provisioning, row/column masks
10. **Cost** - Auto-termination, spot instances, serverless SQL, DBU budgeting alerts
11. **Testing** - Great Expectations, dbt tests, DLT expectations, notebook CI/CD
12. **Performance** - Photon, liquid clustering, predictive I/O, materialized views

---

*Last updated: 2024 | Databricks Runtime 14.3+ compatible*