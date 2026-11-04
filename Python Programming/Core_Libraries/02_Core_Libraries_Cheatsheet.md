# Core Libraries Cheatsheet - Quick Reference

Quick reference for NumPy, Pandas, Polars, DuckDB, and PyArrow.

---

## NumPy Quick Reference

### Array Creation
```python
import numpy as np

np.array([1,2,3])              # From list
np.zeros((3,4))                # Zeros
np.ones((2,3))                 # Ones
np.full((2,2), 7)              # Fill value
np.eye(3)                      # Identity
np.arange(0, 10, 2)            # [0,2,4,6,8]
np.linspace(0, 1, 5)           # [0, 0.25, 0.5, 0.75, 1]
np.random.rand(3,3)            # Uniform [0,1)
np.random.randn(3,3)           # Normal
np.random.randint(0,10,(3,3))  # Integers
```

### Array Properties
```python
arr.shape      # (rows, cols)
arr.ndim       # Dimensions
arr.dtype      # Data type
arr.size       # Total elements
arr.T          # Transpose
arr.ravel()    # Flatten view
arr.flatten()  # Flatten copy
```

### Indexing & Slicing
```python
arr[0]              # First element
arr[0, 1]          # Row 0, col 1
arr[1:4]           # Slice rows
arr[1:5:2]         # Step slice
arr[::-1]          # Reverse
arr[arr > 5]       # Boolean filter
arr[[0, 2, 4]]     # Fancy indexing
arr[arr > 5]       # Boolean mask
np.where(arr > 5)  # Indices
```

### Operations
```python
# Math
a + b, a - b, a * b, a / b
a @ b                 # Matrix multiply
a ** 2                # Power

# Ufuncs
np.sqrt(x), np.exp(x), np.log(x)
np.sin(x), np.cos(x)
np.mean(x), np.std(x), np.var(x)
np.sum(x), np.min(x), np.max(x)
np.median(x), np.percentile(x, 75)

# Axis operations
x.sum(axis=0)      # Column sums
x.mean(axis=1)     # Row means
x.sum(axis=(0,1))  # All elements

# Linear algebra
A @ B                # Matrix multiply
np.linalg.inv(A)     # Inverse
np.linalg.det(A)     # Determinant
np.linalg.eig(A)     # Eigenvalues/vectors
np.linalg.svd(A)     # SVD
np.linalg.solve(A, b) # Solve Ax=b
```

### Broadcasting
```python
# (3,) + (3,1) -> (3,3)
a = np.array([1,2,3])      # (3,)
b = np.array([[1],[2],[3]]) # (3,1)
a + b  # Result: (3,3)
```

---

## Pandas Quick Reference

### IO
```python
# Read
pd.read_csv('file.csv')
pd.read_parquet('file.parquet')
pd.read_json('file.json')
pd.read_sql('SELECT * FROM t', conn)
pd.read_excel('file.xlsx')

# Write
df.to_csv('out.csv', index=False)
df.to_parquet('out.parquet', compression='zstd')
df.to_sql('table', conn, if_exists='replace')
```

### Selection & Filtering
```python
# Selection
df['col']                 # Series
df[['A', 'B']]            # Multiple columns
df.loc[:, 'A':'C']        # Label slice
df.iloc[0:5, 0:2]         # Position slice

# Filtering
df[df['col'] > 5]
df[df['col'].isin(['A','B'])]
df.query('A > 5 and B == "X"')
df.loc[df['A'] > 5, ['B','C']]

# Boolean
df[df['col'].notna()]
df[df['col'].between(1, 10)]
df[df['col'].isin(['A','B'])]
```

### Mutation
```python
# New columns
df['new'] = df['A'] * 2
df = df.assign(new=df['A']*2)          # Immutable
df = df.rename(columns={'old':'new'})
df.columns = df.columns.str.lower()

# Type conversion
df['col'] = df['col'].astype('int32')
df['col'] = pd.to_numeric(df['col'], errors='coerce')
df['date'] = pd.to_datetime(df['date'])
df['cat'] = df['cat'].astype('category')

# Apply
df['new'] = df['col'].apply(lambda x: x*2)
df['new'] = df['col'].map({'a':1, 'b':2})
df['new'] = np.where(df['A']>0, 'pos', 'neg')
```

### GroupBy
```python
# Basic
df.groupby('g')['val'].sum()
df.groupby('g')['val'].agg(['mean','std','count'])

# Named aggregation
df.groupby('g').agg(
    mean_val=('value', 'mean'),
    sum_val=('value', 'sum'),
    count=('value', 'count')
)

# Transform (same shape)
df['group_mean'] = df.groupby('g')['val'].transform('mean')
df['zscore'] = df.groupby('g')['val'].transform(
    lambda x: (x - x.mean()) / x.std()
)
```

### Joins
```python
# Types
pd.merge(left, right, on='key', how='inner')
pd.merge(left, right, on='key', how='left')
pd.merge(left, right, on='key', how='outer')

# Different column names
pd.merge(left, right, left_on='id', right_on='user_id')

# Multiple keys
pd.merge(left, right, on=['k1','k2'])

# Concat
pd.concat([df1, df2], ignore_index=True)
```

---

## Polars Quick Reference

### Basics
```python
import polars as pl

# Creation
df = pl.DataFrame({'A': [1,2,3], 'B': ['a','b','c']})
df = pl.from_pandas(pd_df)
df_pd = df.to_pandas()

# Reading
pl.read_csv('file.csv')
pl.read_parquet('file.parquet')
pl.scan_csv('file.csv')      # Lazy
pl.scan_parquet('*.parquet') # Lazy, partitioned
```

### Expressions
```python
pl.col('A') + 1
pl.col('A') + pl.col('B')
pl.col('A').mean()
pl.col('A').filter(pl.col('B') > 0).mean()

# Selection
df.select(pl.col('A'), pl.col('B'))
df.select((pl.col('A') + pl.col('B')).alias('sum'))

# Filter
df.filter(pl.col('A') > 0)
df.filter((pl.col('A') > 0) & (pl.col('B') == 'x'))
```

### GroupBy & Aggregation
```python
df.group_by('group').agg(
    pl.col('value').mean().alias('mean'),
    pl.col('value').std().alias('std'),
    pl.col('value').count().alias('count')
)

# Window functions
df.with_columns([
    pl.col('value').mean().over('group').alias('group_mean'),
    pl.col('value').rank().over('group').alias('rank'),
])
```

### Lazy Evaluation
```python
lf = pl.scan_parquet('data.parquet')
result = (
    lf
    .filter(pl.col('value') > 0)
    .group_by('category')
    .agg(pl.col('value').mean())
    .collect()  # Execute
)
```

---

## DuckDB Quick Reference

```python
import duckdb

# Query DataFrames directly
duckdb.sql("SELECT * FROM df WHERE x > 1").df()

# Register table
con = duckdb.connect()
con.register('my_table', df)
con.execute("SELECT * FROM my_table WHERE x > 1").df()

# File queries
duckdb.sql("SELECT * FROM 'data.parquet' WHERE x > 1").df()
duckdb.sql("SELECT * FROM 's3://bucket/data.parquet'").df()

# Window functions
duckdb.sql("""
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY cat ORDER BY val DESC) as rn,
           AVG(val) OVER (PARTITION BY cat) as cat_avg
    FROM df
""").df()
```

---

## Polars Expressions Cheatsheet

| Operation | Expression |
|---------|------------|
| **Comparison** | `pl.col('a') == pl.col('b')` |
| **Greater than** | `pl.col('a') > 5` |
| **In list** | `pl.col('a').is_in([1,2,3])` |
| **Null check** | `pl.col('a').is_null()` |
| **String lower** | `pl.col('s').str.to_lowercase()` |
| **Contains** | `pl.col('s').str.contains('pat')` |
| **Extract** | `pl.col('s').str.extract(r'(\d+)')` |
| **Date year** | `pl.col('d').dt.year()` |
| **List len** | `pl.col('arr').list.len()` |
| **Struct** | `pl.struct(a=pl.col('a'), b=pl.col('b'))` |

---

## DuckDB SQL Quick Reference

```sql
-- Query DataFrame
SELECT * FROM df WHERE x > 1;

-- File query
SELECT * FROM 'data.parquet' WHERE x > 1;

-- Window functions
SELECT *,
       ROW_NUMBER() OVER (PARTITION BY cat ORDER BY val DESC) as rn,
       AVG(val) OVER (PARTITION BY cat) as cat_avg
FROM df;

-- Pivot
PIVOT df ON category USING SUM(value);

-- Unpivot
UNPIVOT df ON category USING SUM(value);

-- Sample
SELECT * FROM df USING SAMPLE 10%;

-- Export
COPY (SELECT * FROM df) TO 'out.parquet' (FORMAT PARQUET);
```

---

## Plotnine Quick Reference

```python
from plotnine import *

# Basic
ggplot(df, aes(x='x', y='y')) + geom_point()

# Aesthetics
aes(x='x', y='y', color='group', size='size', shape='cat', alpha=0.6)

# Geoms
geom_point(alpha=0.6, size=2)
geom_line(linewidth=1, linetype='dashed')
geom_col(fill='steelblue')
geom_histogram(bins=30, fill='steelblue')
geom_boxplot(outlier_shape='')
geom_violin(fill='steelblue', alpha=0.5)
geom_smooth(method='lm', se=False, color='red')

# Scales
scale_color_viridis_d()
scale_fill_viridis_c()
scale_x_log10()
scale_y_continuous(labels=lambda x: f'{x:.0%}')

# Themes
theme_minimal()
theme_bw()
theme(legend.position='top',
      plot.title=element_text(face='bold', size=16, hjust=0.5))

# Faceting
facet_wrap('~ category', ncol=2)
facet_grid('row ~ col')

# Save
ggsave('plot.png', width=8, height=6, dpi=300)
```

---

## Performance Tips

| Task | Best Practice |
|------|---------------|
| **Large data** | Use Polars + DuckDB |
| **String ops** | Polars expressions |
| **GroupBy** | Polars or DuckDB |
| **Joins** | DuckDB or Polars |
| **Large CSV** | `pl.scan_csv()` + `collect()` |
| **Parquet** | `pyarrow.parquet` + `zstd` compression |
| **SQL on files** | DuckDB |
| **GPU** | `cudf` (RAPIDS) |
| **Distributed** | `dask`, `pyspark`, `ray` |

---

## Package Versions (2024)

```txt
numpy>=1.26
pandas>=2.1
polars>=0.20
duckdb>=0.9
pyarrow>=14
plotnine>=0.13
scikit-learn>=1.3
xgboost>=2.0
lightgbm>=4.0
catboost>=1.2
optuna>=3.4
mlflow>=2.8
prefect>=2.10
```

---

*Last updated: 2024-11-04*
*Companion to: Core Libraries Overview*