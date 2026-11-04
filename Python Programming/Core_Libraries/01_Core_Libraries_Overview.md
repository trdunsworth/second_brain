# Core Libraries Overview

A comprehensive guide to the essential Python libraries for data science: NumPy, Pandas, Polars, DuckDB, PyArrow, and related tools.

---

## 1. NumPy - Numerical Computing Foundation

### 1.1 Array Creation & Basics
```python
import numpy as np

# Array creation
arr = np.array([1, 2, 3, 4, 5])
arr = np.array([[1, 2], [3, 4]])  # 2D
arr = np.zeros((3, 4))           # Zeros
arr = np.ones((2, 3))            # Ones
arr = np.full((3, 3), 7)         # Fill value
arr = np.eye(3)                  # Identity
arr = np.arange(0, 10, 2)        # [0, 2, 4, 6, 8]
arr = np.linspace(0, 1, 5)       # [0, 0.25, 0.5, 0.75, 1.0]

# Random arrays
np.random.seed(42)
np.random.rand(3, 3)             # Uniform [0, 1)
np.random.randn(3, 3)            # Standard normal
np.random.randint(0, 10, (3, 3)) # Integers
np.random.choice([1,2,3], size=10, p=[0.2, 0.5, 0.3])

# Array properties
arr.shape       # (rows, cols)
arr.ndim        # Dimensions
arr.dtype       # Data type
arr.size        # Total elements
arr.nbytes      # Memory usage
```

### 1.2 Array Manipulation
```r
# Reshaping
arr.reshape(2, 6)           # Reshape
arr.ravel()                 # Flatten
arr.flatten()               # Copy flattened
arr.T                       # Transpose
arr.swapaxes(0, 1)          # Swap axes

# Stacking
np.vstack([a, b])           # Vertical stack
np.hstack([a, b])           # Horizontal stack
np.column_stack([a, b])     # Column stack
np.row_stack([a, b])        # Row stack

# Splitting
np.split(arr, 3)            # Equal split
np.hsplit(arr, 2)           # Horizontal split
np.vsplit(arr, 2)           # Vertical split
```

### 1.3 Indexing & Slicing
```python
# Basic indexing
arr[0]           # First element
arr[0, 1]        # Row 0, col 1
arr[1:4]         # Slice
arr[1:5:2]       # Step slice
arr[::-1]        # Reverse

# Boolean indexing
arr[arr > 5]                 # Filter
arr[(arr > 5) & (arr < 10)]  # Compound
arr[(arr > 5) | (arr < 2)]   # OR condition

# Fancy indexing
arr[[0, 2, 4]]               # Specific indices
arr[[True, False, True]]     # Boolean mask

# Where
np.where(arr > 5, arr, 0)    # Replace conditionally
np.where(arr > 5)[0]         # Indices where True
```

### 1.4 Operations & Broadcasting
```r
# Arithmetic
a + b, a - b, a * b, a / b
a // b, a % b, a ** b

# Universal functions (ufuncs)
np.sqrt(arr)
np.exp(arr)
np.log(arr)
np.sin(arr)
np.mean(arr), np.std(arr), np.var(arr)
np.sum(arr), np.min(arr), np.max(arr)
np.median(arr), np.percentile(arr, 75)

# Axis operations
arr.sum(axis=0)      # Column sums
arr.mean(axis=1)     # Row means
np.apply_along_axis(func, 1, arr)

# Broadcasting
a = np.array([1, 2, 3])      # (3,)
b = np.array([[1], [2], [3]]) # (3, 1)
a + b  # Broadcasting: (3, 3)
```

### 1.5 Linear Algebra
```r
# Matrix operations
A @ B              # Matrix multiplication
A @ B.T            # A @ B.T
np.dot(A, B)       # Dot product
np.linalg.inv(A)   # Inverse
np.linalg.det(A)   # Determinant
np.linalg.eig(A)   # Eigenvalues/vectors
np.linalg.svd(A)   # SVD
np.linalg.solve(A, b)  # Solve Ax = b
np.linalg.lstsq(A, b)  # Least squares
```

---

## 2. Pandas - Data Manipulation

### 1.1 DataFrame Basics
```r
import pandas as pd
import numpy as np

# Creation
df = pd.DataFrame({
    'A': [1, 2, 3],
    'B': ['a', 'b', 'c'],
    'C': [1.1, 2.2, 3.3]
})

# From various sources
pd.read_csv('file.csv')
pd.read_parquet('file.parquet')
pd.read_json('file.json')
pd.read_sql('SELECT * FROM table', conn)
pd.read_excel('file.xlsx', sheet_name='Sheet1')

# Inspection
df.head(), df.tail()
df.info()
df.describe()
df.dtypes
df.shape
df.columns
df.index
```

### 1.2 Selection & Filtering
```r
# Column selection
df['col']              # Series
df[['A', 'B']]         # DataFrame
df.loc[:, 'A':'C']     # Label-based slice
df.iloc[0:5, 0:2]      # Position-based

# Filtering
df[df['col'] > 5]
df[df['col'].isin(['A', 'B'])]
df.query('A > 5 and B == "X"')
df.loc[df['A'] > 5, ['B', 'C']]

# Boolean indexing
df[df['col'].notna()]
df[df['col'].between(1, 10)]
df[df['cat'].isin(['A', 'B'])]
```

### 1.3 Data Transformation
```r
# Column operations
df['new_col'] = df['A'] * 2
df = df.assign(new_col = df['A'] * 2)  # Immutable
df = df.rename(columns={'old': 'new'})
df.columns = df.columns.str.lower().str.replace(' ', '_')

# Type conversion
df['col'] = df['col'].astype('int32')
df['col'] = pd.to_numeric(df['col'], errors='coerce')
df['date'] = pd.to_datetime(df['date'])
df['cat'] = df['cat'].astype('category')

# Apply functions
df['new'] = df['col'].apply(lambda x: x * 2)
df['new'] = df['col'].map({'a': 1, 'b': 2})
df['new'] = np.where(df['col'] > 0, 'pos', 'neg')
df['new'] = np.where(df['A'] > 0, df['B'], df['C'])
```

### 1.4 Aggregation & GroupBy
```r
# Basic aggregation
df.groupby('group')['value'].sum()
df.groupby('group')['value'].agg(['mean', 'std', 'count'])
df.groupby(['g1', 'g2']).agg({'val1': 'mean', 'val2': 'sum'})

# Multiple aggregations
df.groupby('group').agg(
    mean_val=('value', 'mean'),
    sum_val=('value', 'sum'),
    count=('value', 'count')
)

# Transform (same shape)
df['group_mean'] = df.groupby('group')['value'].transform('mean')
df['zscore'] = df.groupby('group')['value'].transform(
    lambda x: (x - x.mean()) / x.std()
)

# Multiple functions
df.groupby('group').agg(
    mean=('value', 'mean'),
    std=('value', 'std'),
    min=('value', 'min'),
    max=('value', 'max')
).reset_index()
```

### 1.5 Merging & Joining
```r
# Merge types
pd.merge(left, right, on='key', how='inner')    # inner
pd.merge(left, right, on='key', how='left')     # left
pd.merge(left, right, on='key', how='outer')    # outer
pd.merge(left, right, on='key', how='right')    # right

# Different column names
pd.merge(left, right, left_on='id', right_on='user_id')

# Multiple keys
pd.merge(left, right, on=['key1', 'key2'])

# Concat
pd.concat([df1, df2], ignore_index=True)
pd.concat([df1, df2], axis=1)  # Column-wise

# Cross join (cartesian)
df1.merge(df2, how='cross')  # pandas 1.2+
```

### 1.6 Time Series
```r
# Datetime index
df['date'] = pd.to_datetime(df['date'])
df = df.set_index('date')

# Resampling
df.resample('D').mean()      # Daily
df.resample('W').sum()       # Weekly
df.resample('M').last()      # Month end

# Rolling windows
df.rolling('7D').mean()
df.rolling(7).std()
df.expanding().mean()

# Shifting
df['lag_1'] = df['value'].shift(1)
df['diff'] = df['value'].diff()
df['pct_change'] = df['value'].pct_change()
```

---

## 3. Polars - Fast DataFrames

### 1.1 Basics
```r
import polars as pl

# Creation
df = pl.DataFrame({
    'A': [1, 2, 3],
    'B': ['a', 'b', 'c'],
    'C': [1.1, 2.2, 3.3]
})

# From pandas
df_pl = pl.from_pandas(pd_df)
df_pd = df_pl.to_pandas()

# Reading
pl.read_csv('file.csv')
pl.read_parquet('file.parquet')
pl.read_ndjson('file.json')
pl.read_ipc('file.arrow')
pl.scan_csv('file.csv')        # Lazy
pl.scan_parquet('*.parquet')   # Lazy, partitioned
```

### 2. Expressions & Contexts
```r
# Expressions
pl.col('A') + 1
pl.col('A') + pl.col('B')
pl.col('A').mean()
pl.col('A').filter(pl.col('B') > 0).mean()

# Contexts
df.select(
    pl.col('A'),
    (pl.col('A') + pl.col('B')).alias('sum_AB'),
    pl.when(pl.col('A') > 0).then(1).otherwise(0).alias('flag')
)

# Select/filter
df.select(pl.col('A'), pl.col('B'))
df.filter(pl.col('A') > 0)
df.filter((pl.col('A') > 0) & (pl.col('B') == 'x'))
```

### 3. GroupBy & Aggregation
```r
df.group_by('group').agg(
    pl.col('value').mean().alias('mean'),
    pl.col('value').std().alias('std'),
    pl.col('value').count().alias('count')
)

# Multiple aggregations
df.group_by('group').agg(
    pl.col('value').mean().alias('mean'),
    pl.col('value').std().alias('std'),
    pl.col('value').min().alias('min'),
    pl.col('value').max().alias('max'),
    pl.col('value').count().alias('count')
)

# Window functions
df.with_columns([
    pl.col('value').mean().over('group').alias('group_mean'),
    pl.col('value').rank().over('group').alias('rank'),
    pl.col('value').cum_sum().over('group').alias('cumsum')
])
```

### 4. Lazy Evaluation
```r
# Lazy frame
lf = pl.scan_parquet('data.parquet')

# Operations are lazy
result = (
    lf
    .filter(pl.col('value') > 0)
    .group_by('category')
    .agg(pl.col('value').mean())
    .collect()  # Execute here
)

# Sink to file
lf.sink_parquet('output.parquet')
```

### 5. Expressions Cheatsheet
```r
# Comparison
pl.col('a') == pl.col('b')
pl.col('a') > 5
pl.col('a').is_in([1, 2, 3])
pl.col('a').is_null()
pl.col('a').is_not_null()

# String
pl.col('text').str.to_lowercase()
pl.col('text').str.contains('pattern')
pl.col('text').str.extract(r'(\d+)')

# Date/time
pl.col('date').dt.year()
pl.col('date').dt.month()
pl.col('date').dt.weekday()

# List/Array
pl.col('arr').list.len()
pl.col('arr').list.get(0)
pl.col('arr').list.eval(pl.element() * 2)

# Struct
pl.struct(a=pl.col('a'), b=pl.col('b'))
```

---

## 3. DuckDB - SQL on DataFrames

### 1. Basic Usage
```python
import duckdb

# Query pandas/polars directly
df = pd.DataFrame({'x': [1,2,3], 'y': [4,5,6]})
duckdb.sql("SELECT * FROM df WHERE x > 1").df()

# Register table
con = duckdb.connect()
con.register('my_table', df)
con.execute("SELECT * FROM my_table WHERE x > 1").df()

# SQL on files
duckdb.sql("SELECT * FROM 'data.parquet' WHERE x > 1").df()
duckdb.sql("SELECT * FROM 's3://bucket/data.parquet'").df()
```

### 2. Advanced SQL
```r
# Window functions
duckdb.sql("""
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY category ORDER BY value DESC) as rn,
           AVG(value) OVER (PARTITION BY category) as cat_avg
    FROM df
""").df()

# Pivot/Unpivot
duckdb.sql("""
    PIVOT df ON category USING SUM(value)
""").df()
```

### 3. Performance Tips
```r
# Use parallel
duckdb.sql("PRAGMA threads=4")

# Memory limit
duckdb.sql("PRAGMA memory_limit='4GB'")

# Presort
duckdb.sql("PRAGMA preserve_insertion_order=false")
```

---

## 4. PyArrow - Columnar Data

### 1. Tables & Arrays
```r
import pyarrow as pa
import pyarrow.parquet as pq

# Arrays
arr = pa.array([1, 2, 3, None, 5])
arr = pa.array([1, 2, 3], type=pa.int64())

# Tables
table = pa.table({
    'a': [1, 2, 3],
    'b': ['a', 'b', 'c']
})

# Convert
table.to_pandas()
table.to_polars()
table.to_numpy()

# Schema
schema = pa.schema([
    ('id', pa.int64()),
    ('name', pa.string()),
    ('value', pa.float64())
])
```

### 2. Parquet I/O
```r
# Write
pq.write_table(table, 'output.parquet', compression='zstd')
pq.write_table(table, 'output.parquet', 
               compression='zstd',
               compression_level=3,
               row_group_size=100000)

# Read
table = pq.read_table('file.parquet')
pf = pq.ParquetFile('file.parquet')
pf.metadata
pf.schema

# Read partitioned
dataset = ds.dataset('data/', format='parquet', partitioning='hive')
```

### 3. Compute
```r
import pyarrow.compute as pc

# Arithmetic
pc.add(arr1, arr2)
pc.multiply(arr1, arr2)

# String
pc.utf8_upper(arr)
pc.match_substring(arr, 'pattern')

# Aggregation
pc.mean(arr)
pc.sum(arr)
pc.stddev(arr)

# Filter
pc.filter(arr, pc.greater(arr, 5))
```

---

## 5. DuckDB + Polars + PyArrow Integration

```python
# Seamless interoperability
import duckdb
import polars as pl
import pyarrow as pa

# DuckDB -> Polars
df_pl = duckdb.sql("SELECT * FROM df").pl()

# Polars -> DuckDB
duckdb.sql("SELECT * FROM df_pl")

# PyArrow -> Polars
df_pl = pl.from_arrow(pa_table)

# Polars -> PyArrow
pa_table = df_pl.to_arrow()

# DuckDB -> Arrow
arrow_table = duckdb.sql("SELECT * FROM df").arrow()

# Zero-copy conversions
df_pl = pl.from_arrow(arrow_table, rechunk=False)
```

---

## 5. Quick Reference: Library Selection

| Task | Recommended |
|------|-------------|
| **< 1GB, complex ops** | Pandas |
| **> 1GB, speed critical** | Polars |
| **SQL analytics** | DuckDB |
| **Columnar storage** | PyArrow + Parquet |
| **Large scale analytics** | Polars + DuckDB |
| **Interop** | PyArrow (zero-copy) |
| **ML features** | Polars expressions + sklearn |
| **Time series** | Pandas + Polars lazy |
| **Big data SQL** | DuckDB + Parquet |

---

## Quick Reference Card

| Task | Pandas | Polars | DuckDB | PyArrow |
|------|--------|--------|--------|---------|
| Read CSV | `pd.read_csv()` | `pl.read_csv()` | `duckdb.read_csv()` | `csv.read_csv()` |
| Read Parquet | `pd.read_parquet()` | `pl.read_parquet()` | `duckdb.read_parquet()` | `pq.read_table()` |
| Filter | `df[df.c > 0]` | `df.filter(pl.col > 0)` | `duckdb.sql("WHERE c > 0")` | `pc.filter()` |
| GroupBy | `df.groupby().agg()` | `df.group_by().agg()` | `duckdb.sql("GROUP BY")` | `pc.group_by()` |
| Join | `merge()` | `join()` | `duckdb.sql("JOIN")` | N/A |
| Apply func | `apply()` | `map_elements()` | N/A | `pc.map()` |
| Write Parquet | `to_parquet()` | `write_parquet()` | `COPY TO` | `pq.write_table()` |

---

*Last updated: 2024-11-04*