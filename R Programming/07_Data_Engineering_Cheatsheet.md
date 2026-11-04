# Data Engineering with R Cheatsheet

A quick reference for data engineering tasks in R.

---

## 1. Fast Data I/O

### 1.1 Reading Data
```r
library(vroom)
library(arrow)
library(duckdb)
library(data.table)

# Fast CSV
vroom::vroom("large_file.csv")
data.table::fread("large_file.csv")

# Parquet
arrow::read_parquet("data.parquet")
arrow::read_parquet("s3://bucket/path/", 
                    filesystem = s3_bucket("bucket"))

# DuckDB (SQL on files)
con <- dbConnect(duckdb::duckdb())
df <- dbGetQuery(con, "SELECT * FROM 'data.parquet' WHERE year > 2020")

# Database
library(DBI)
con <- dbConnect(RPostgres::Postgres(), 
  host = "localhost", dbname = "db", user = "user", password = "pass")
dbGetQuery(con, "SELECT * FROM table WHERE date > '2024-01-01'")
```

### 1.2 Writing Data
```r
# CSV
vroom::vroom_write(df, "output.csv")
data.table::fwrite(df, "output.csv")

# Parquet
arrow::write_parquet(df, "output.parquet", compression = "zstd")

# Database
dbWriteTable(con, "table_name", df, append = TRUE)

# Partitioned
arrow::write_dataset(df, "output/", partitioning = c("year", "month"))
```

---

## 2. Data Processing with data.table

### 1. Fast Operations
```r
library(data.table)
setDT(df)  # Convert to data.table by reference

# Fast aggregation
dt[, .(mean_val = mean(value), n = .N), by = group]

# Update by reference
dt[, new_col := x * 2]
dt[condition, new_col := value]

# Rolling joins
dt1[dt2, on = .(id, date), roll = "nearest"]

# Non-equi joins
dt1[dt2, on = .(id, date >= start, date <= end), nomatch = 0]
```

### 2. Efficient Operations
```r
# Avoid copies
setDT(df)
dt[, new_col := x * 2]  # By reference

# Fast grouping
dt[, .(mean = mean(val), sd = sd(val)), by = group]

# Rolling operations
dt[, roll_mean := frollmean(value, n = 7), by = group]

# Reshape
dcast(dt, id ~ time, value.var = "value")
melt(dt, id.vars = "id", measure.vars = patterns("^q"))
```

---

## 3. Data Validation & Quality

### 1. Validation Rules
```r
library(pointblank)
library(validate)

# Pointblank
agent <- create_agent(tbl = df) |>
  col_vals_gt(vars(value), 0) |>
  col_vals_between(vars(age), 0, 120) |>
  col_vals_in_set(vars(status), c("active", "inactive")) |>
  rows_distinct() |>
  interrogate()

# validate package
rules <- validator(
  age >= 0,
  age <= 120,
  email %matches% "@",
  if (income > 0) employed == TRUE
)
confront(df, rules) |> summary()
```

### 2. Data Quality Checks
```r
library(skimr)
library(visdat)
library(naniar)

# Quick profile
skim(df)

# Missing data
vis_miss(df)
gg_miss_var(df)
miss_var_summary(df)

# Outliers
library(outliers)
outlier_test <- grubbs.test(df$value)
```

---

## 4. Pipeline Orchestration

### 1. Targets Pipeline
```r
# _targets.R
library(targets)
library(tarchetypes)

list(
  tar_target(raw_data, read_csv("data/raw.csv")),
  tar_target(clean_data, clean(raw_data)),
  tar_target(model, train_model(clean_data)),
  tar_target(predictions, predict(model, test_data)),
  tar_target(report, render_report(predictions))
)

# Run
tar_make()
tar_visnetwork()
tar_make_clustermq(workers = 4)
```

### 2. Targets with Dynamic Branching
```r
tar_target(
  model_fits,
  train_model(data),
  pattern = map(data_splits),
  iteration = "list"
)
```

---

## 5. Cloud & Big Data

### 1. AWS S3
```r
library(aws.s3)
library(paws.storage)

# Read
s3read_using(read_csv, object = "s3://bucket/file.csv")
s3read_using(vroom::vroom, object = "s3://bucket/file.csv")

# Write
s3write_using(df, write_csv, object = "s3://bucket/output.csv")

# Multipart upload for large files
put_object(file = "large_file.parquet", 
           object = "s3://bucket/large_file.parquet",
           multipart = TRUE)
```

### 2. Azure Blob / GCS
```r
# Azure
library(AzureStor)
blob_cont <- storage_container("https://account.blob.core.windows.net/container")
storage_write_csv(df, blob_cont, "output.csv")

# GCS
library(googleCloudStorageR)
gcs_upload("file.csv", bucket = "bucket", name = "output.csv")
```

### 3. Spark (sparklyr)
```r
library(sparklyr)
sc <- spark_connect(master = "yarn", config = list(
  sparklyr.shell.driver-memory = "4G",
  sparklyr.shell.executor-memory = "8G"
))

# Read
spark_df <- spark_read_parquet(sc, "s3://bucket/data/")

# Process
result <- spark_df %>%
  filter(value > 100) %>%
  group_by(category) %>%
  summarise(mean_val = mean(value)) %>%
  collect()

spark_disconnect(sc)
```

---

## 6. Streaming & Real-time

### 1. Kafka with R
```r
library(rkafka)

# Consumer
consumer <- rkafka.createConsumer("topic", "group1")
messages <- rkafka.read(consumer, max.messages = 100)

# Producer
producer <- rkafka.createProducer("localhost:9092")
rkafka.send(producer, "topic", "message")
```

### 2. Plumber API
```r
# plumber.R
#* @post /predict
function(req) {
  input <- jsonlite::fromJSON(req$postBody)
  predict(model, input)
}

# Run
# plumber::plumb("plumber.R")$run(port = 8000)
```

---

## 6. Monitoring & Logging

### 1. Structured Logging
```r
library(logger)

log_threshold(INFO)
log_info("Starting pipeline")
log_warn("Missing values in {n_missing} rows")
log_error("Model training failed: {err}")

# JSON logging for ELK
log_formatter(formatter_json)
log_appender(appender_file("pipeline.log"))
```

### 2. Metrics
```r
library(prometheus)

# Counters
requests_total <- counter("requests_total", "Total requests")
requests_total$inc(labels = list(endpoint = "/predict"))

# Histograms
latency <- histogram("request_latency_seconds", "Request latency")
latency$observe(duration, labels = list(endpoint = "/predict"))

# Gauges
active_models <- gauge("active_models", "Number of loaded models")
active_models$set(3)
```

---

## 7. Containerization

### Dockerfile
```dockerfile
FROM rocker/r-ver:4.3.0

# System deps
RUN apt-get update && apt-get install -y \
    libssl-dev libcurl4-openssl-dev libxml2-dev \
    libfontconfig1-dev libharfbuzz-dev libfribidi-dev \
    libfreetype6-dev libpng-dev libtiff5-dev libjpeg-dev

# R packages
RUN R -e "install.packages(c('tidymodels', 'plumber', 'vetiver', 'pins'), repos='https://cloud.r-project.org/')"

COPY plumber.R /app/
COPY model.rds /app/

EXPOSE 8000
CMD ["R", "-e", "pr <- plumber::plumb('/app/plumber.R'); pr$run(host='0.0.0.0', port=8000)"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  api:
    build: .
    ports: ["8000:8000"]
    environment:
      - MLFLOW_TRACKING_URI=http://mlflow:5000
    depends_on: [mlflow, redis]
  
  mlflow:
    image: mlflow/mlflow:latest
    ports: ["5000:5000"]
    command: mlflow server --host 0.0.0.0
  
  redis:
    image: redis:alpine
```

---

## 7. CI/CD for R

### GitHub Actions
```yaml
# .github/workflows/r-check.yml
name: R-CMD-check

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: r-lib/actions/setup-r@v2
        with:
          r-version: '4.3'
      - uses: r-lib/actions/setup-renv@v2
      - name: Install dependencies
        run: renv::restore()
      - name: Check
        run: R CMD check .
      - name: Test
        run: Rscript -e "testthat::test_local()"
      - name: Lint
        run: Rscript -e "lintr::lint_dir('R/')"
      - name: Style
        run: Rscript -e "styler::style_dir('R/', dry = 'fail')"
```

---

## Key Takeaways

1. **Use data.table** for large in-memory data
2. **Partition data** by time/partition keys
3. **Use targets** for reproducible pipelines
4. **Monitor** data quality, drift, performance
6. **Containerize** for consistent deployment
7. **Automate** testing, linting, deployment
8. **Monitor** latency, errors, drift in production