# Big Data Tools

Tools and techniques for processing datasets that exceed single-machine memory or compute capacity.

## 1. The Landscape

| Tool | Paradigm | Best For | Language |
|------|----------|----------|----------|
| **Pandas** | In-memory, single-threaded | < 1-5 GB | Python |
| **Polars** | In-memory, multi-threaded, lazy | 5-50 GB | Python/Rust |
| **DuckDB** | In-memory/OLAP, SQL | Analytical queries, 10-100 GB | Python/SQL |
| **Dask** | Distributed Pandas | Scaling Pandas code | Python |
| **Ray** | Distributed compute | ML workloads, heterogeneous | Python |
| **PySpark** | Distributed, JVM-based | > 100 GB, ETL pipelines | Python/Scala |
| **ClickHouse** | Columnar OLAP DB | Real-time analytics | SQL |
| **Trino/Presto** | Federated query engine | Query across sources | SQL |

---

## 2. Polars (Modern Pandas Replacement)

### Why Polars?
- **Multi-threaded** by default (uses all cores)
- **Lazy evaluation** (query optimization)
- **No GIL** (written in Rust)
- **Expressions API** (powerful, composable)
- **Streaming** for larger-than-memory

### Basic Operations
```python
import polars as pl

# Read (auto-detects format, multi-threaded)
df = pl.read_parquet("data/*.parquet")
df = pl.read_csv("large_file.csv", n_rows=1000)  # Preview

# Lazy evaluation (build query plan, execute once)
lazy_df = pl.scan_parquet("data/*.parquet")

# Expressions: composable, parallel operations
result = (
    lazy_df
    .filter(pl.col("value") > 100)
    .group_by("category")
    .agg([
        pl.col("value").mean().alias("avg_value"),
        pl.col("value").std().alias("std_value"),
        pl.col("id").count().alias("count"),
        pl.col("timestamp").max().alias("last_seen")
    ])
    .sort("avg_value", descending=True)
    .collect()  # Execute here
)

# Streaming for larger-than-memory
result = (
    pl.scan_parquet("huge_data/*.parquet")
    .filter(pl.col("value") > 0)
    .select(["id", "value", "category"])
    .sink_parquet("filtered_output.parquet")  # Stream to disk
)
```

### Key Expressions
```python
# String operations
pl.col("text").str.to_lowercase()
pl.col("text").str.contains(r"\d+")
pl.col("text").str.extract(r"(\d{4}-\d{2}-\d{2})")

# Date/time
pl.col("timestamp").dt.year()
pl.col("timestamp").dt.truncate("1h")
pl.col("timestamp").dt.offset_by("1d")

# Window functions
pl.col("value").rolling_mean(window_size=7)
pl.col("value").shift(1)
pl.col("value").cumsum()

# Conditional
pl.when(pl.col("value") > 0).then(1).otherwise(0).alias("is_positive")
pl.col("category").is_in(["A", "B", "C"])

# List/Array operations
pl.col("tags").list.contains("important")
pl.col("embeddings").arr.eval(pl.element() * 2)
```

### Joining Large Datasets
```python
# Polars joins are fast and memory-efficient
large_df = pl.scan_parquet("large/*.parquet")
small_df = pl.read_parquet("small/lookup.parquet")

# Hash join (default) - builds hash table from smaller side
result = large_df.join(small_df, on="id", how="left").collect()

# For very large: sort-merge join
result = large_df.join(small_df, on="id", how="left", 
                       join_algorithm="sort-merge").collect()
```

---

## 3. DuckDB (Embedded OLAP Database)

### Why DuckDB?
- **Zero-config** (single file or in-memory)
- **SQL interface** (familiar, powerful)
- **Columnar** (fast aggregations)
- **Parallel** (multi-threaded)
- **Direct Parquet/CSV/JSON querying** (no import needed)

### Basic Usage
```python
import duckdb

# Connect (in-memory or file)
conn = duckdb.connect()  # or duckdb.connect('analytics.db')

# Query Parquet directly (no loading!)
result = conn.execute("""
    SELECT category, 
           AVG(value) as avg_value,
           COUNT(*) as cnt
    FROM 'data/*.parquet'
    WHERE value > 100
    GROUP BY category
    ORDER BY avg_value DESC
    LIMIT 10
""").df()  # Returns pandas DataFrame

# Or Polars
result = conn.execute("SELECT * FROM 'data/*.parquet' LIMIT 5").pl()
```

### Advanced Analytics
```sql
-- Window functions
SELECT 
    id,
    timestamp,
    value,
    AVG(value) OVER (PARTITION BY category ORDER BY timestamp 
                     ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as rolling_7d_avg
FROM 'events.parquet';

-- Time-series gaps
SELECT 
    generate_series(min_ts, max_ts, INTERVAL '1 hour') as hour,
    category
FROM (SELECT MIN(timestamp) as min_ts, MAX(timestamp) as max_ts FROM events)
CROSS JOIN (SELECT DISTINCT category FROM events)
LEFT JOIN events ON events.timestamp = hour AND events.category = category
WHERE events.id IS NULL;  -- Missing hours

-- Pivot
SELECT * FROM (
    SELECT category, date_trunc('day', timestamp) as day, value
    FROM events
) PIVOT (AVG(value) FOR category IN ('A', 'B', 'C'));

-- JSON extraction
SELECT 
    json_extract(payload, '$.user.id') as user_id,
    json_extract(payload, '$.event') as event_type
FROM 'logs.jsonl';
```

### Python Integration
```python
# Register pandas/Polars DataFrame as table
conn.register("my_df", pandas_df)
conn.register("my_pl_df", polars_df)

# Query registered tables
result = conn.execute("SELECT * FROM my_df WHERE value > 100").pl()

# Export
conn.execute("COPY (SELECT * FROM my_df) TO 'output.parquet' (FORMAT PARQUET)")
```

---

## 4. Dask (Distributed Pandas)

### When to Use
- Existing Pandas code that needs to scale
- Complex custom Python logic not expressible in SQL
- Multi-machine scaling

### Basic Pattern
```python
import dask.dataframe as dd
from dask.distributed import Client

# Local cluster (uses all cores)
client = Client(n_workers=4, threads_per_worker=2, memory_limit='4GB')
# Or connect to cluster: client = Client("scheduler:8786")

# Read partitioned data
ddf = dd.read_parquet("s3://bucket/data/year=*/month=*/*.parquet")

# Pandas-like API (but lazy)
result = (
    ddf[ddf.value > 100]
    .groupby("category")
    .value.mean()
    .compute()  # Triggers execution
)

# Map custom function per partition
def custom_processing(partition):
    # Your pandas logic here
    partition['new_feature'] = partition['a'] * partition['b']
    return partition

ddf = ddf.map_partitions(custom_processing, meta=ddf)
```

### Dask ML
```python
from dask_ml.model_selection import train_test_split
from dask_ml.linear_model import LogisticRegression
from dask_ml.preprocessing import StandardScaler

X = ddf.drop('target', axis=1)
y = ddf['target']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)

model = LogisticRegression()
model.fit(X_train_scaled, y_train)
```

---

## 5. PySpark (Production ETL at Scale)

### When to Use
- **> 100 GB** data
- **Multi-node clusters** (EMR, Databricks, K8s)
- **Complex ETL** with SQL + custom logic
- **Integration** with Hadoop ecosystem

### Basic Session
```python
from pyspark.sql import SparkSession
from pyspark.sql import functions as F

spark = (SparkSession.builder
    .appName("ML-Feature-Engineering")
    .config("spark.sql.adaptive.enabled", "true")
    .config("spark.sql.shuffle.partitions", "200")
    .getOrCreate())

# Read
df = spark.read.parquet("s3://bucket/data/")

# Write
df.write.mode("overwrite").partitionBy("date").parquet("s3://bucket/output/")
```

### DataFrame API (Preferred over RDDs)
```python
from pyspark.sql import functions as F
from pyspark.sql.window import Window

# Transformations (lazy)
df = (df
    .filter(F.col("value") > 100)
    .withColumn("value_log", F.log("value"))
    .withColumn("category_idx", F.when(F.col("cat") == "A", 1).otherwise(0))
)

# Aggregations
agg = df.groupBy("category").agg(
    F.mean("value").alias("avg_value"),
    F.stddev("value").alias("std_value"),
    F.count("*").alias("count"),
    F.approx_count_distinct("user_id").alias("unique_users")
)

# Window functions
window = Window.partitionBy("user_id").orderBy("timestamp")
df = df.withColumn("prev_value", F.lag("value").over(window))
df = df.withColumn("row_num", F.row_number().over(window))

# UDFs (avoid when possible - use built-in functions)
@F.udf(returnType=StringType())
def complex_logic(x, y):
    return custom_python_function(x, y)

df = df.withColumn("result", complex_logic(F.col("a"), F.col("b")))

# Pandas UDF (vectorized - much faster)
@F.pandas_udf("double")
def vectorized_udf(x: pd.Series, y: pd.Series) -> pd.Series:
    return x * y + np.log1p(x)

df = df.withColumn("result", vectorized_udf(F.col("a"), F.col("b")))
```

### Spark MLlib
```python
from pyspark.ml import Pipeline
from pyspark.ml.feature import VectorAssembler, StandardScaler, StringIndexer
from pyspark.ml.classification import LogisticRegression
from pyspark.ml.evaluation import BinaryClassificationEvaluator

# Feature pipeline
indexer = StringIndexer(inputCol="category", outputCol="cat_idx")
assembler = VectorAssembler(
    inputCols=["cat_idx", "value_log", "other_features"],
    outputCol="features_raw"
)
scaler = StandardScaler(inputCol="features_raw", outputCol="features")
lr = LogisticRegression(featuresCol="features", labelCol="label", maxIter=100)

pipeline = Pipeline(stages=[indexer, assembler, scaler, lr])

# Train/test split
train, test = df.randomSplit([0.8, 0.2], seed=42)

model = pipeline.fit(train)
predictions = model.transform(test)

evaluator = BinaryClassificationEvaluator()
auc = evaluator.evaluate(predictions)
```

### Performance Tuning
```python
# Partitioning
df = df.repartition(200, "category")  # For joins/groupby on category
df = df.coalesce(10)  # Reduce partitions before write

# Caching
df.cache()  # Memory only
df.persist(StorageLevel.MEMORY_AND_DISK)  # Spill to disk

# Broadcast join (small table)
from pyspark.sql.functions import broadcast
large_df.join(broadcast(small_df), "id")

# Adaptive Query Execution (AQE) - Spark 3.0+
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
```

---

## 6. Data Formats Comparison

| Format | Read Speed | Write Speed | Compression | Schema Evolution | Best For |
|--------|------------|-------------|-------------|------------------|----------|
| **Parquet** | Fast | Fast | Excellent | Full | **Default for analytics** |
| **ORC** | Fast | Fast | Excellent | Full | Hive/Spark native |
| **Avro** | Medium | Fast | Good | Full | Kafka, row-based |
| **Feather** | Fastest | Fastest | None | Limited | Inter-process, temp |
| **CSV** | Slow | Slow | Poor | None | Interop, human-readable |
| **JSON/JSONL** | Slow | Slow | Poor | Flexible | Logs, semi-structured |

### Parquet Best Practices
```python
# Write with optimal settings
df.write_parquet(
    "output.parquet",
    compression="zstd",        # Best ratio/speed tradeoff
    compression_level=3,       # 1-22, 3 is sweet spot
    row_group_size=128_000,    # ~128MB row groups
    statistics=True,           # Enable predicate pushdown
    use_dictionary=True,       # Dictionary encoding for strings
)
```

---

## 7. Cloud Storage Patterns

### S3 / GCS / Azure Blob
```python
# Polars/DuckDB: Direct S3 access
pl.scan_parquet("s3://bucket/data/*.parquet")
conn.execute("SELECT * FROM 's3://bucket/data/*.parquet'")

# PySpark: Hadoop FS
spark.read.parquet("s3a://bucket/data/")

# Partitioned writes (crucial for query performance)
df.write.partitionBy("year", "month", "day").parquet("s3://bucket/output/")
```

### Partitioning Strategy
```
s3://bucket/
  events/
    year=2024/
      month=01/
        day=01/
          part-00000.parquet
          part-00001.parquet
        day=02/
      month=02/
    year=2023/
```

**Rules**:
- Partition by **high-cardinality, frequently filtered** columns
- Avoid too many partitions (< 10K files per partition)
- Target **128MB - 1GB** per file

---

## 8. Choosing the Right Tool

| Data Size | Complexity | Team Skills | Recommended |
|-----------|------------|-------------|-------------|
| < 5 GB | Any | Python | **Polars** (or Pandas) |
| 5-50 GB | SQL-friendly | SQL/Python | **DuckDB** + Polars |
| 5-100 GB | Complex Python | Python | **Polars** (streaming) or **Dask** |
| 100 GB - 10 TB | ETL pipelines | SQL/Scala | **PySpark** / **Databricks** |
| > 10 TB | Enterprise | Mixed | **Spark** + **Delta Lake** / **Iceberg** |
| Real-time analytics | Low latency | SQL | **ClickHouse** / **Druid** |
| Federated queries | Multiple sources | SQL | **Trino** |

---

## 9. Modern Table Formats (ACID on Data Lakes)

### Delta Lake
```python
from delta import configure_spark_with_delta_pip

spark = configure_spark_with_delta_pip(
    SparkSession.builder.appName("DeltaLake")
).getOrCreate()

# Write
df.write.format("delta").mode("overwrite").save("s3://bucket/delta-table/")

# Time travel
df_v1 = spark.read.format("delta").option("versionAsOf", 0).load("s3://bucket/delta-table/")

# Merge (upsert)
from delta.tables import DeltaTable
delta_table = DeltaTable.forPath(spark, "s3://bucket/delta-table/")
delta_table.alias("target").merge(
    new_data.alias("source"),
    "target.id = source.id"
).whenMatchedUpdateAll().whenNotMatchedInsertAll().execute()
```

### Apache Iceberg
```python
# Similar capabilities, different ecosystem
# Better for multi-engine (Spark, Flink, Trino)
```

---

## 10. Performance Checklist

- [ ] **Use columnar formats** (Parquet) with compression (ZSTD)
- [ ] **Partition data** by common filter columns
- [ ] **Enable predicate pushdown** (statistics in Parquet footer)
- [ ] **Avoid shuffles** (repartition before joins, broadcast small tables)
- [ ] **Use appropriate types** (Int32 vs Int64, Categorical for strings)
- [ ] **Lazy evaluation** (Polars/Dask/Spark - build plan, execute once)
- [ ] **Monitor spill** (disk spill = memory pressure)
- [ ] **Profile first** (Polars `explain()`, Spark UI, DuckDB `EXPLAIN ANALYZE`)