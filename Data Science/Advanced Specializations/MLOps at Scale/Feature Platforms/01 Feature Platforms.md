# Feature Platforms

Feature platforms (feature stores) are centralized systems for managing, serving, and governing ML features across training and inference.

## 1. Feature Store Architecture

### 1.1 Core Components
```
┌─────────────────────────────────────────────────────────────────┐
│                        FEATURE PLATFORM                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Registry   │  │  Offline     │  │   Online     │           │
│  │   (Metadata) │  │  Store       │  │  Store       │           │
│  │              │  │  (Historical)│  │  (Serving)   │           │
│  │ • Definitions│  │  • Parquet/  │  │  • Redis/    │           │
│  │ • Lineage    │  │    Iceberg   │  │    DynamoDB  │           │
│  │ • Versioning │  │  • Partitioned│  │  • Low latency│          │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Feature Engineering                      │   │
│  │  • Transformations  • Aggregations  • Embeddings          │   │
│  │  • SQL/Python/DF    • Time-travel   • Point-in-time       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Concepts
| Concept | Description |
|---------|-------------|
| **Feature View** | Logical group of features with same entity + TTL |
| **Entity** | Primary key (user_id, item_id) for joins |
| **Feature Vector** | Row of features for specific entity at timestamp |
| **TTL** | Time-to-live for feature freshness |
| **Materialization** | Pre-computing features to online store |

---

## 2. Major Platforms Comparison

| Platform | Backend | Online Store | Streaming | Best For |
|----------|---------|--------------|-----------|----------|
| **Feast** | Open source | Redis/DynamoDB/Cassandra | ✅ (Kafka) | Kubernetes, self-hosted |
| **Tecton** | Managed SaaS | Custom (Redis+Cassandra) | ✅ (Kinesis/Flink) | Enterprise, complex features |
| **Hopsworks** | Open/Managed | RonDB (MySQL) | ✅ (Kafka) | End-to-end ML platform |
| **Databricks FS** | Unity Catalog | Databricks Online | ✅ (Structured Streaming) | Databricks ecosystem |
| **SageMaker FS** | S3/Glue | DynamoDB | ✅ (Kinesis) | AWS ecosystem |
| **Vertex AI FS** | Bigtable | Bigtable | ✅ (Dataflow) | GCP ecosystem |
| **Dagster+** | Dagster | Custom | ✅ | Orchestration-focused |

---

## 3. Feast (Open Source Reference)

### 3.1 Installation & Setup
```bash
pip install feast
feast init my_feature_repo
cd my_feature_repo
```

### 3.2 Feature Definitions
```python
# feature_repo/feature_definitions.py
from feast import (
    Entity, FeatureView, Field, FileSource, 
    RedisSource, PushSource, ValueType
)
from datetime import timedelta

# Entity
user = Entity(
    name="user_id",
    value_type=ValueType.INT64,
    description="User identifier",
    join_keys=["user_id"]
)

# Offline Source (Batch)
user_stats_source = FileSource(
    path="s3://bucket/features/user_stats.parquet",
    timestamp_field="event_timestamp",
    created_timestamp_column="created_timestamp"
)

# Online Source (Real-time)
user_stats_realtime = PushSource(
    name="user_stats_realtime",
    batch_source=user_stats_source,
    handler=push_handler
)

# Feature View
user_stats_fv = FeatureView(
    name="user_stats",
    entities=[user],
    ttl=timedelta(days=30),
    schema=[
        Field(name="user_id", dtype=ValueType.INT64),
        Field(name="total_orders", dtype=ValueType.INT64),
        Field(name="avg_order_value", dtype=ValueType.FLOAT),
        Field(name="days_since_last_order", dtype=ValueType.INT64),
        Field(name="preferred_category", dtype=ValueType.STRING),
    ],
    online=True,
    source=user_stats_source,
    tags={"team": "growth", "tier": "gold"}
)
```

### 3.3 Feature Engineering (Transformations)
```python
# On-demand transformations
from feast import on_demand_feature_view

@on_demand_feature_view(
    sources=[
        user_stats_fv,
        item_stats_fv,
    ],
    schema=[
        Field(name="user_item_affinity", dtype=ValueType.FLOAT),
        Field(name="price_sensitivity", dtype=ValueType.FLOAT),
    ]
)
def user_item_features(inputs: dict) -> pd.DataFrame:
    df = pd.DataFrame()
    df["user_item_affinity"] = (
        inputs["user:total_orders"] * inputs["item:popularity_score"]
    )
    df["price_sensitivity"] = (
        inputs["user:avg_order_value"] / inputs["item:price"]
    )
    return df

# SQL transformations
from feast import FeatureView, FileSource

enriched_user_fv = FeatureView(
    name="enriched_user",
    entities=[user],
    ttl=timedelta(days=7),
    source=FileSource(
        path="s3://bucket/features/enriched_user.parquet",
        timestamp_field="event_timestamp",
        # SQL transformation
        query="""
            SELECT 
                user_id,
                total_orders,
                avg_order_value,
                CASE 
                    WHEN total_orders > 10 THEN 'high'
                    WHEN total_orders > 3 THEN 'medium'
                    ELSE 'low'
                END as engagement_tier
            FROM user_stats
        """
    )
```

### 3.4 Materialization & Serving
```python
# Materialize to online store
from feast import FeatureStore

store = FeatureStore(repo_path=".")

# Materialize incremental (last 24 hours)
store.materialize_incremental(end_date=datetime.now())

# Materialize specific time range
store.materialize(
    start_date=datetime(2024, 1, 1),
    end_date=datetime(2024, 1, 31)
)

# Online serving
feature_vector = store.get_online_features(
    entity_rows=[{"user_id": 12345}],
    features=[
        "user_stats:total_orders",
        "user_stats:avg_order_value",
        "user_stats:preferred_category",
        "enriched_user:engagement_tier"
    ]
)

# Get feature vector as dict
features = feature_vector.to_dict()
```

### 3.5 Historical Retrieval (Training)
```python
# Get training data with point-in-time correctness
training_data = store.get_historical_features(
    entity_df=pd.DataFrame({
        "user_id": [12345, 67890],
        "event_timestamp": [
            datetime(2024, 1, 15),
            datetime(2024, 1, 20)
        ],
        "label": [1, 0]
    }),
    features=[
        "user_stats:total_orders",
        "user_stats:avg_order_value",
        "item_stats:category",
        "user_item_features:user_item_affinity"
    ]
)

training_df = training_data.to_df()
```

---

## 4. Tecton (Enterprise)

### 4.1 Declarative Feature Definitions
```python
# tecton/feature_views/user_features.py
from tecton import (
    FeatureView, AggregateFeatureView, 
    FeatureService, Entity, BatchSource, StreamSource
)
from tecton.types import Field, Int64, Float64, String
from datetime import timedelta

user = Entity(name="user_id", join_keys=["user_id"])

# Batch feature view with aggregations
@feature_view(
    source=BatchSource(
        path="s3://bucket/events",
        timestamp_field="timestamp",
        file_format="parquet"
    ),
    entities=[user],
    mode="spark_sql",
    aggregation_interval=timedelta(days=1),
    features=[
        Field("total_orders", Int64, "COUNT(*)"),
        Field("avg_order_value", Float64, "AVG(order_value)"),
        Field("distinct_categories", Int64, "COUNT(DISTINCT category)"),
    ],
    description="Daily user aggregations",
    tags={"domain": "growth"}
)
def user_daily_aggregations(df):
    return f"""
        SELECT 
            user_id,
            timestamp,
            COUNT(*) as total_orders,
            AVG(order_value) as avg_order_value,
            COUNT(DISTINCT category) as distinct_categories
        FROM {df}
        GROUP BY user_id, timestamp
    """

# Stream feature view (real-time)
@feature_view(
    source=StreamSource(
        kafka_topic="user_events",
        bootstrap_servers="kafka:9092",
        timestamp_field="event_time"
    ),
    entities=[user],
    mode="pyspark",
    aggregation_interval=timedelta(minutes=5),
    features=[
        Field("orders_last_5min", Int64, "COUNT(*)"),
        Field("revenue_last_5min", Float64, "SUM(order_value)"),
    ]
)
def user_realtime_aggregations(df):
    return df.groupBy("user_id", window("event_time", "5 minutes")).agg(
        F.count("*").alias("orders_last_5min"),
        F.sum("order_value").alias("revenue_last_5min")
    )

# Feature Service (bundle for serving)
user_feature_service = FeatureService(
    name="user_features_v1",
    features=[
        user_daily_aggregations,
        user_realtime_aggregations,
        "user:engagement_tier"
    ],
    description="Complete user feature set for ranking"
)
```

---

## 5. Advanced Patterns

### 5.1 Embedding Features
```python
# Store embeddings as feature vectors
from feast import FeatureView, Field, List, Float32

embedding_fv = FeatureView(
    name="item_embeddings",
    entities=[item],
    ttl=timedelta(days=7),
    schema=[
        Field(name="item_id", dtype=ValueType.INT64),
        Field(name="embedding", dtype=List(Float32), vector_size=128),
        Field(name="model_version", dtype=ValueType.STRING),
    ],
    source=FileSource(
        path="s3://bucket/embeddings/item_emb_v2.parquet",
        timestamp_field="updated_at"
    )
)

# Serving with vector similarity
def get_similar_items(store, item_id, k=10):
    # Get target embedding
    target = store.get_online_features(
        entity_rows=[{"item_id": item_id}],
        features=["item_embeddings:embedding"]
    )["item_embeddings:embedding"][0]
    
    # Query vector DB (separate) or brute force
    # ...
```

### 5.2 Time-Travel & Point-in-Time Correctness
```python
# Automatic point-in-time joins
entity_df = pd.DataFrame({
    "user_id": [1, 2, 3],
    "event_timestamp": [
        datetime(2024, 1, 15),
        datetime(2024, 1, 15),
        datetime(2024, 1, 15)
    ],
    "label": [1, 0, 1]
})

# Feast automatically:
# 1. For each entity, finds feature values at event_timestamp
# 2. Respects TTL (excludes stale features)
# 3. Handles late-arriving data
training_df = store.get_historical_features(
    entity_df=entity_df,
    features=["user_stats:*"]
).to_df()
```

### 5.3 Feature Monitoring & Drift Detection
```python
# Statistical monitoring
from feast import FeatureStore
import numpy as np

def monitor_feature_drift(store, feature_view_name, window_days=7):
    """Compare feature distributions across time windows"""
    end = datetime.now()
    start = end - timedelta(days=window_days)
    
    # Get recent features
    recent = store.get_historical_features(
        entity_df=entity_df_recent,
        features=[f"{feature_view_name}:*"]
    ).to_df()
    
    # Get baseline (older window)
    baseline = store.get_historical_features(
        entity_df=entity_df_baseline,
        features=[f"{feature_view_name}:*"]
    ).to_df()
    
    # KS test per feature
    from scipy.stats import ks_2samp
    drift_results = {}
    for col in recent.select_dtypes(include=[np.number]).columns:
        if col in baseline.columns:
            stat, p = ks_2samp(
                recent[col].dropna(), 
                baseline[col].dropna()
            )
            drift_results[col] = {"ks_stat": stat, "p_value": p}
    
    return drift_results
```

---

## 6. Online Store Comparison

| Store | Latency (p99) | Throughput | Consistency | Cost | Best For |
|-------|---------------|------------|-------------|------|----------|
| **Redis** | <5ms | 100K+/sec | Eventual | Low | High throughput, caching |
| **DynamoDB** | <10ms | 50K/sec | Strong | Medium | AWS, serverless |
| **Cassandra** | <10ms | 100K/sec | Tunable | Medium | High write throughput |
| **Bigtable** | <10ms | 100K/sec | Strong | High | GCP, wide rows |
| **RonDB (Hopsworks)** | <5ms | 200K/sec | ACID | Medium | Real-time, ACID |
| **DuckDB (embedded)** | <1ms | 1M/sec | ACID | Very Low | Edge, local dev |

---

## 7. Feature Platform Selection Checklist

### 7.1 Technical Requirements
- [ ] **Scale**: Features/sec, entities, feature dimensions
- [ ] **Latency**: Online serving SLA (p50, p99)
- [ ] **Freshness**: Batch (hourly/daily) vs Streaming (seconds)
- [ ] **Data Sources**: Warehouse, Kafka, Kinesis, DB, API
- [ ] **Transformations**: SQL, Python, Pandas, Spark, Flink
- [ ] **Online Store**: Redis, DynamoDB, Cassandra, Bigtable, Custom

### 7.2 Operational
- [ ] **GitOps/GitOps**: Git-based feature definitions
- [ ] **CI/CD**: Automated testing, deployment
- [ ] **Monitoring**: Drift alerts, latency, freshness
- [ ] **Governance**: Access control, lineage, PII tagging
- [ ] **Cost**: Storage, compute, serving costs

### 7.3 Organizational
- [ ] **Team Structure**: Centralized vs Embedded
- [ ] **Skill Set**: SQL vs Python vs Spark expertise
- [ ] **Migration Path**: From existing pipelines
- [ ] **Vendor Lock-in**: Open source vs Managed

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] Set up Feast/Tecton repo
- [ ] Define core entities (user, item, session)
- [ ] Build first 5-10 feature views
- [ ] Set up offline store (Parquet/Iceberg)
- [ ] Configure online store (Redis)

### Phase 2: Production (Weeks 5-8)
- [ ] Materialization pipelines (Airflow/Dagster)
- [ ] Online serving integration
- [ ] Training data generation (point-in-time)
- [ ] Feature monitoring dashboards
- [ ] CI/CD for feature definitions

### Phase 3: Scale (Weeks 9-16)
- [ ] Streaming features (Kafka/Flink)
- [ ] Embedding features
- [ ] Advanced transformations (on-demand)
- [ ] Feature governance (ownership, deprecation)
- [ ] Multi-region online store

---

## 8. Key Takeaways

1. **Feature Store = Contract** between data engineering and ML
2. **Feast** = Open source standard; **Tecton** = Enterprise managed
3. **Offline Store** = Training data (point-in-time correct)
4. **Online Store** = Low-latency serving (Redis/DynamoDB)
5. **Point-in-Time Correctness** = Critical for training-serving parity
6. **Streaming Features** = Real-time freshness for recsys/fraud
6. **Embeddings** = Store as vectors, serve with vector DB
7. **Monitoring** = Drift, freshness, latency, coverage
7. **Governance** = Ownership, lineage, PII, deprecation