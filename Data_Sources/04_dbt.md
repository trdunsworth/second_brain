# dbt Learning Guide

## Overview
dbt (data build tool) is a SQL-first transformation workflow that lets teams quickly and collaboratively deploy analytics code following software engineering best practices like modularity, portability, CI/CD, and documentation. It enables data analysts and engineers to transform data in their warehouse by writing select statements, while dbt handles the DDL/DML.

## Quick Template

```yaml
# dbt_project.yml
name: 'my_project'
version: '1.0.0'
config-version: 2

profile: 'my_project'

model-paths: ["models"]
analysis-paths: ["analyses"]
test-paths: ["tests"]
seed-paths: ["seeds"]
macro-paths: ["macros"]
snapshot-paths: ["snapshots"]

target-path: "target"
clean-targets:
  - "target"
  - "dbt_packages"

models:
  my_project:
    staging:
      +materialized: view
    marts:
      +materialized: table
```

```sql
-- models/staging/stg_customers.sql
{{ config(materialized='view') }}

with source as (
    select * from {{ source('raw', 'customers') }}
),
renamed as (
    select
        id as customer_id,
        first_name,
        last_name,
        email,
        created_at
    from source
)
select * from renamed
```

## Core Syntax Cheatsheet

| Element | Syntax | Example |
|---------|--------|---------|
| Model Config | `{{ config(...) }}` | `{{ config(materialized='table') }}` |
| Ref Model | `{{ ref('model_name') }}` | `select * from {{ ref('stg_customers') }}` |
| Source | `{{ source('name', 'table') }}` | `{{ source('raw', 'orders') }}` |
| Variable | `{{ var('var_name') }}` | `{{ var('start_date') }}` |
| Jinja If | `{% if condition %}...{% endif %}` | `{% if target.name == 'prod' %}` |
| Jinja For | `{% for item in list %}...{% endfor %}` | `{% for col in columns %}` |
| Macro Call | `{{ macro_name(args) }}` | `{{ dbt_utils.surrogate_key(['id']) }}` |
| Test Config | `{{ config(severity='warn') }}` | `{{ config(severity='error') }}` |
| Snapshot | `{% snapshot name %}...{% endsnapshot %}` | See snapshots section |
| Seed Config | `{{ config(...) }}` in YAML | `+column_types: {id: bigint}` |

## Practical Examples

### 1. Staging Model with Tests

```sql
-- models/staging/stg_orders.sql
{{ config(
    materialized='view',
    tags=['staging', 'daily']
) }}

with source as (
    select * from {{ source('jaffle_shop', 'orders') }}
),
renamed as (
    select
        id as order_id,
        user_id as customer_id,
        order_date,
        status,
        {{ dbt_utils.generate_surrogate_key(['id']) }} as order_key
    from source
)
select * from renamed
```

```yaml
# models/staging/schema.yml
version: 2

models:
  - name: stg_orders
    description: "Staging model for orders"
    columns:
      - name: order_id
        description: "Primary key"
        tests:
          - unique
          - not_null
      - name: customer_id
        description: "Foreign key to customers"
        tests:
          - not_null
          - relationships:
              to: ref('stg_customers')
              field: customer_id
      - name: status
        tests:
          - accepted_values:
              values: ['placed', 'shipped', 'completed', 'return_pending', 'returned']
```

### 2. Mart Model with Incremental Materialization

```sql
-- models/marts/fct_orders.sql
{{ config(
    materialized='incremental',
    unique_key='order_key',
    incremental_strategy='merge',
    tags=['marts', 'hourly']
) }}

with orders as (
    select * from {{ ref('stg_orders') }}
),
customers as (
    select * from {{ ref('dim_customers') }}
),
final as (
    select
        o.order_key,
        o.order_id,
        o.customer_id,
        c.customer_key,
        o.order_date,
        o.status,
        case
            when o.status in ('completed', 'shipped') then 'fulfilled'
            when o.status = 'returned' then 'returned'
            else 'pending'
        end as order_status_category,
        current_timestamp as dbt_updated_at
    from orders o
    left join customers c on o.customer_id = c.customer_id
)

{% if is_incremental() %}
    where o.dbt_updated_at > (select max(dbt_updated_at) from {{ this }})
{% endif %}

select * from final
```

### 3. Macro for Reusable Logic

```sql
-- macros/date_helpers.sql
{% macro get_date_bounds(date_column, days_back=30) %}
    where {{ date_column }} >= dateadd('day', -{{ days_back }}, current_date)
{% endmacro %}

{% macro cents_to_dollars(cents_column, precision=2) %}
    round({{ cents_column }} / 100.0, {{ precision }})
{% endmacro %}

{% macro generate_surrogate_key(field_list) %}
    {{ dbt_utils.generate_surrogate_key(field_list) }}
{% endmacro %}
```

```sql
-- Usage in model
select
    {{ cents_to_dollars('amount_cents') }} as amount_usd,
    {{ get_date_bounds('created_at', 7) }}
from {{ ref('raw_payments') }}
```

### 4. Snapshot for SCD Type 2

```sql
-- snapshots/snp_customers.sql
{% snapshot snp_customers %}

{{
    config(
        target_schema='snapshots',
        unique_key='customer_id',
        strategy='check',
        check_cols=['email', 'first_name', 'last_name', 'status'],
        invalid_hard_deletes='new_record'
    )
}}

select * from {{ source('raw', 'customers') }}

{% endsnapshot %}
```

### 5. Seeds for Reference Data

```csv
-- seeds/country_codes.csv
country_code,country_name,region
US,United States,North America
CA,Canada,North America
GB,United Kingdom,Europe
DE,Germany,Europe
JP,Japan,Asia Pacific
AU,Australia,Asia Pacific
```

```yaml
# seeds/schema.yml
version: 2

seeds:
  - name: country_codes
    config:
      +column_types:
        country_code: varchar(2)
        country_name: varchar(100)
        region: varchar(50)
```

### 6. Advanced: Python Models (dbt-core v1.3+)

```python
# models/marts/python_ml_features.py
import pandas as pd
from sklearn.preprocessing import StandardScaler

def model(dbt, session):
    dbt.config(
        materialized="table",
        packages=["pandas", "scikit-learn"]
    )
    
    # Read upstream model
    customers_df = dbt.ref("dim_customers").toPandas()
    orders_df = dbt.ref("fct_orders").toPandas()
    
    # Feature engineering
    customer_features = orders_df.groupby('customer_id').agg(
        total_orders=('order_id', 'count'),
        total_revenue=('amount_usd', 'sum'),
        avg_order_value=('amount_usd', 'mean'),
        days_since_last_order=('order_date', lambda x: (pd.Timestamp.now() - x.max()).days)
    ).reset_index()
    
    # Merge with customer attributes
    result = customers_df.merge(customer_features, on='customer_id', how='left')
    result = result.fillna(0)
    
    return result
```

## Working with dbt in Different Environments

### dbt Cloud (Recommended for Teams)

```bash
# dbt Cloud CLI
dbt-cloud job run --job-id 12345
dbt-cloud run list --job-id 12345
```

### dbt Core (Local Development)

```bash
# Install
pip install dbt-core dbt-postgres  # or dbt-snowflake, dbt-bigquery, etc.

# Initialize project
dbt init my_project

# Debug connection
dbt debug

# Run models
dbt run
dbt run --select tag:daily
dbt run --select +fct_orders  # run model + children

# Test
dbt test
dbt test --select test_type:schema
dbt test --store-failures

# Docs
dbt docs generate
dbt docs serve

# Seeds
dbt seed
dbt seed --select country_codes

# Snapshots
dbt snapshot
```

### CI/CD with GitHub Actions

```yaml
# .github/workflows/dbt.yml
name: dbt CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  dbt:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          
      - name: Install dbt
        run: |
          pip install dbt-core dbt-postgres
          
      - name: Configure profiles
        run: |
          mkdir -p ~/.dbt
          echo "${{ secrets.DBT_PROFILES_YML }}" > ~/.dbt/profiles.yml
          
      - name: dbt deps
        run: dbt deps
        
      - name: dbt parse (validate)
        run: dbt parse
        
      - name: dbt test
        run: dbt test --select test_type:schema
        
      - name: dbt build (PR only)
        if: github.event_name == 'pull_request'
        run: dbt build --defer --state=prod
        
      - name: dbt docs generate
        run: dbt docs generate
```

## Common dbt Uses

- **Analytics Engineering** - Transform raw data into analytics-ready models
- **Data Testing** - Automated data quality checks (uniqueness, referential integrity, accepted values)
- **Documentation** - Auto-generated data catalog with lineage graphs
- **Version Control** - Git-based workflow for data transformations
- **CI/CD** - Automated testing and deployment of data models
- **Data Contracts** - Enforce schema and quality standards
- **Incremental Processing** - Efficient large dataset updates
- **Data Lineage** - Track data flow from source to dashboard

## dbt Advantages

- **SQL-First** - Leverages existing SQL skills, no new language required
- **Modularity** - DRY principles with ref(), macros, and packages
- **Testing Built-in** - Schema tests, data tests, and custom test blocks
- **Documentation** - Auto-generated docs with lineage visualization
- **Version Control** - Git integration for collaborative development
- **Warehouse Agnostic** - Works with Snowflake, BigQuery, Redshift, Postgres, Databricks, etc.
- **Incremental Models** - Efficient processing of large datasets
- **Package Ecosystem** - dbt-utils, dbt-expectations, dbt-audit-helper, etc.
- **Active Community** - Large ecosystem, conferences, Slack community

## dbt Pitfalls

- **Learning Curve** - Jinja templating, DAG concepts, materializations
- **Debugging** - Compiled SQL can be complex; use `dbt compile` and `target/compiled`
- **Performance** - Poor model design leads to slow runs; understand warehouse optimization
- **State Management** - `dbt defer` and `--state` require artifact management
- **Python Models** - Limited warehouse support; not available in all adapters
- **Large DAGs** - Can become unwieldy; use tags, groups, and selective runs
- **Secrets Management** - Never commit profiles.yml; use env vars or secret managers

## Awesome dbt Resources

- **[dbt Docs](https://docs.getdbt.com)** - Official comprehensive documentation
- **[dbt Learn](https://learn.getdbt.com)** - Free interactive courses and certifications
- **[dbt Discourse](https://discourse.getdbt.com)** - Community forum for questions
- **[dbt Slack](https://community.getdbt.com)** - 50k+ member community
- **[awesome-dbt](https://github.com/dbt-labs/awesome-dbt)** - Curated dbt resources
- **[dbt Packages](https://hub.getdbt.com)** - Official package hub
- **[dbt-utils](https://github.com/dbt-labs/dbt-utils)** - Essential utility macros
- **[dbt-expectations](https://github.com/calogica/dbt-expectations)** - Great Expectations-style tests
- **[dbt-audit-helper](https://github.com/dbt-labs/dbt-audit-helper)** - Model auditing macros
- **[dbt-project-evaluator](https://github.com/dbt-labs/dbt-project-evaluator)** - Project health checks
- **[dbt Cloud](https://cloud.getdbt.com)** - Managed dbt platform
- **[Coalesce Conference](https://coalesce.getdbt.com)** - Annual dbt conference recordings
- **[Analytics Engineering Certificate](https://learn.getdbt.com/certification)** - Official certification

## dbt vs Other Tools

| Feature | dbt | Airflow | SQL Scripts | Informatica |
|---------|-----|---------|-------------|-------------|
| Language | SQL + Jinja | Python | SQL | GUI/Proprietary |
| Testing | Native | Custom | Manual | Built-in |
| Lineage | Auto | Manual | None | Built-in |
| Version Control | Git-native | Git-native | Manual | Versioned objects |
| Deployment | CI/CD | DAG runs | Manual | Repository |
| Learning Curve | Medium | High | Low | High |
| Cost | Free (Core) | Free/OSS | Free | Enterprise |
| Best For | Analytics engineering | Orchestration | Simple ETL | Enterprise ETL |

## dbt Quick Checklist

1. **Project Structure** - Organize models: staging → intermediate → marts
2. **Naming Conventions** - Use prefixes: `stg_`, `int_`, `fct_`, `dim_`
3. **Materializations** - View for staging, table for marts, incremental for large facts
4. **Sources** - Define all raw data as sources with freshness checks
5. **Tests** - Add schema tests to every model; use custom tests for business logic
6. **Documentation** - Document every model and column; keep docs updated
7. **Packages** - Leverage dbt-utils, dbt-expectations, codegen
8. **Variables** - Use vars for environment-specific values (dates, schemas)
9. **CI/CD** - Run `dbt parse`, `dbt test`, and `dbt build --defer` in PRs
10. **Performance** - Monitor query history; optimize incremental strategies
11. **Governance** - Use contracts, access grants, and model governance
12. **State** - Store manifest.json artifacts for `dbt defer` and slim CI

---

*Last updated: 2024 | dbt Core v1.8+ compatible*