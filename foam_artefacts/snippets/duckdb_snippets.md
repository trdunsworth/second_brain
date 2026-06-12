# DuckDB Snippets

## Load data

```sql
CREATE OR REPLACE TABLE week20 AS
SELECT *
FROM read_csv('week20.csv');
```
