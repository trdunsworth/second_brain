# EDA (Exploratory Data Analysis) Cheatsheet

A comprehensive reference for exploratory data analysis in Python using pandas, polars, and visualization libraries.

---

## 1. Initial Data Inspection

### 1.1 Quick Overview
```python
import pandas as pd
import polars as pl
import numpy as np

# Load data
df = pd.read_csv('data.csv')
# or
df = pl.read_csv('data.csv')

# Quick overview
df.head()
df.tail()
df.shape
df.columns
df.dtypes
df.info()
```

### 1.2 Comprehensive Summary
```python
# Pandas
df.describe(include='all')
df.describe(include=['object', 'category'])

# Polars
df.describe()

# Detailed summary
import skimr
skimr.skim(df)

# Visual inspection
import visdat
visdat.vis_dat(df)
```

---

## 2. Missing Data Analysis

### 2.1 Missing Data Summary
```python
import missingno as msno
import naniar

# Pandas
df.isnull().sum()
df.isnull().mean()

# Polars
df.null_count()
df.null_count() / df.height

# Visualizations
import missingno as msno
msno.matrix(df)
msno.bar(df)
msno.heatmap(df)
msno.dendrogram(df)

# naniar (for polars/pandas)
import naniar
naniar.miss_var_summary(df)
naniar.vis_miss(df)
```

### 2.2 Missing Data Patterns
```python
# Missingness patterns
import missingno as msno
msno.matrix(df)
msno.dendrogram(df)

# Missing by group
df.groupby('group').apply(lambda x: x.isnull().mean())

# Visualize
import missingno as msno
msno.heatmap(df)
msno.dendrogram(df)
```

---

## 2. Univariate Analysis

### 2.1 Numerical Variables
```python
# Summary stats
df['col'].describe()
df['col'].describe(percentiles=[.01, .05, .25, .5, .75, .95, .99])

# Distribution plots
import seaborn as sns
import matplotlib.pyplot as plt

# Histogram
sns.histplot(data=df, x='col', bins=30, kde=True)
plt.show()

# Density
sns.kdeplot(data=df, x='col', fill=True)

# Box plot
sns.boxplot(data=df, x='col')
sns.boxplot(data=df, x='group', y='value')

# Violin plot
sns.violinplot(data=df, x='group', y='value')

# ECDF
sns.ecdfplot(data=df, x='col')
```

### 2.2 Categorical Variables
```python
# Value counts
df['col'].value_counts()
df['col'].value_counts(normalize=True)

# Visualizations
sns.countplot(data=df, x='cat', order=df['cat'].value_counts().index)
sns.countplot(data=df, x='cat', hue='group')

# Proportions
df['cat'].value_counts(normalize=True).plot(kind='barh')
```

---

## 3. Bivariate Analysis

### 3.1 Numeric vs Numeric
```python
# Scatter plot
sns.scatterplot(data=df, x='x', y='y', hue='group', alpha=0.6)

# Hexbin for large datasets
plt.hexbin(df['x'], df['y'], gridsize=30, cmap='viridis')

# Regression
sns.regplot(data=df, x='x', y='y', ci=95)
sns.lmplot(data=df, x='x', y='y', hue='group')

# Correlation
df[['x', 'y', 'z']].corr()
sns.heatmap(df.corr(), annot=True, cmap='RdBu_r', center=0)
```

### 3.2 Categorical vs Numeric
```python
# Box plot
sns.boxplot(data=df, x='category', y='value')
sns.boxplot(x='category', y='value', hue='group', data=df)

# Violin plot
sns.violinplot(data=df, x='category', y='value', inner='quartile')

# Strip/Swarm
sns.stripplot(data=df, x='category', y='value', jitter=0.2)
sns.swarmplot(data=df, x='category', y='value')

# Point plot
sns.pointplot(data=df, x='category', y='value', hue='group')

# Bar plot with error bars
sns.barplot(data=df, x='category', y='value', ci=95)
```

### 3.3 Categorical vs Categorical
```python
# Crosstab
pd.crosstab(df['cat1'], df['cat2'], normalize='index')

# Heatmap
ct = pd.crosstab(df['cat1'], df['cat2'])
sns.heatmap(ct, annot=True, fmt='d', cmap='Blues')

# Mosaic plot
from statsmodels.graphics.mosaicplot import mosaic
mosaic(df, ['cat1', 'cat2'])

# Stacked bar
pd.crosstab(df['cat1'], df['cat2'], normalize='index').plot(kind='bar', stacked=True)
```

---

## 4. Correlation Analysis

### 4.1 Correlation Matrix
```python
# Correlation matrix
corr = df.select_dtypes(include=[np.number]).corr()

# Visualize
sns.heatmap(corr, annot=True, cmap='RdBu_r', center=0, square=True)
sns.clustermap(corr, annot=True, cmap='RdBu_r', center=0)

# Correlation with target
df.corr()['target'].sort_values(ascending=False)
```

### 4.2 Correlation Tests
```python
from scipy.stats import pearsonr, spearmanr, kendalltau

pearsonr(df['x'], df['y'])
spearmanr(df['x'], df['y'])
kendalltau(df['x'], df['y'])

# For multiple comparisons
from scipy.stats import pearsonr
corrs = df.corr(method='pearson')
pvals = df.corr(method=lambda x, y: pearsonr(x, y)[1])
```

---

## 5. Outlier Detection

### 1. Univariate Outliers
```python
# IQR method
Q1 = df['col'].quantile(0.25)
Q3 = df['col'].quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR
outliers = df[(df['col'] < lower) | (df['col'] > upper)]

# Z-score
from scipy import stats
z_scores = np.abs(stats.zscore(df['col']))
outliers = df[np.abs(stats.zscore(df['col'])) > 3]
```

### 2. Multivariate Outliers
```python
# Isolation Forest
from sklearn.ensemble import IsolationForest
iso = IsolationForest(contamination=0.1)
outliers = iso.fit_predict(df[['x', 'y', 'z']])

# Local Outlier Factor
from sklearn.neighbors import LocalOutlierFactor
lof = LocalOutlierFactor(n_neighbors=20)
outliers = lof.fit_predict(df[['x', 'y']])

# Mahalanobis distance
from scipy.spatial.distance import mahalanobis
from scipy.linalg import inv
cov = np.cov(df[['x', 'y', 'z']].T)
inv_cov = np.linalg.inv(cov)
mahal = [mahalanobis(row, df.mean(), inv_cov) for row in df.values]
```

---

## 3. Time Series EDA

### 1. Time Series Plots
```python
# Line plot
df.set_index('date')['value'].plot(figsize=(12, 4))
plt.show()

# Seasonal decomposition
from statsmodels.tsa.seasonal import seasonal_decompose
decomp = seasonal_decompose(df.set_index('date')['value'], period=12)
decomp.plot()

# ACF/PACF
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
plot_acf(df['value'], lags=40)
plot_pacf(df['value'], lags=40)
```

### 2. Seasonal Analysis
```python
# Seasonal plot
df['month'] = df.index.month
df.boxplot(column='value', by='month')

# Seasonal subseries
for month in range(1, 13):
    subset = df[df.index.month == month]['value']
    plt.plot(subset.values, alpha=0.3, color='gray')
plt.plot(df.groupby(df.index.month).mean(), color='red', linewidth=2)
```

---

## 5. Feature Analysis

### 1. Feature Importance
```python
from sklearn.ensemble import RandomForestRegressor
from sklearn.inspection import permutation_importance

rf = RandomForestRegressor(n_estimators=100, random_state=42)
rf.fit(X, y)

# Built-in importance
importances = pd.Series(rf.feature_importances_, index=X.columns)
importances.sort_values(ascending=False).plot(kind='barh')

# Permutation importance
result = permutation_importance(model, X_test, y_test, n_repeats=10)
pd.Series(result.importances_mean, index=X.columns).sort_values().plot(kind='barh')
```

### 2. SHAP Values
```python
import shap

explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

shap.summary_plot(shap_values, X_test)
shap.dependence_plot('feature', shap_values, X_test)
shap.force_plot(explainer.expected_value, shap_values[0], X_test.iloc[0])
```

### 3. Partial Dependence
```python
from sklearn.inspection import PartialDependenceDisplay

PartialDependenceDisplay.from_estimator(model, X, ['feature1', 'feature2'])
plt.show()
```

---

## 6. Data Quality Checks

### 1. Data Quality Report
```python
import pandas_profiling
profile = df.profile_report()
profile.to_file("report.html")

# Or with ydata-profiling
from ydata_profiling import ProfileReport
profile = ProfileReport(df, title="EDA Report")
profile.to_file("report.html")
```

### 2. Data Quality Checks
```python
# Check for duplicates
df.duplicated().sum()
df.drop_duplicates()

# Check for constant columns
df.nunique()
df.loc[:, df.nunique() == 1]

# Check for high cardinality
df.nunique()
df.select_dtypes(include='object').apply(lambda x: x.nunique())

# Check for skewed distributions
df.skew()
df.skew().abs().sort_values(ascending=False)
```

---

## 7. Quick Reference Functions

```python
# Complete EDA function
def quick_eda(df, target=None):
    print("=== Shape ===")
    print(df.shape)
    print("\n=== Dtypes ===")
    print(df.dtypes)
    print("\n=== Missing ===")
    print(df.isnull().sum().sort_values(ascending=False))
    print("\n=== Describe ===")
    print(df.describe(include='all').T)
    print("\n=== Correlations ===")
    if len(df.select_dtypes(include=np.number).columns) > 1:
        print(df.corr()['target'].sort_values(ascending=False) if 'target' in df.columns else df.corr())
    
    # Visualizations
    if len(df.select_dtypes(include=np.number).columns) > 1:
        sns.heatmap(df.corr(), annot=True, cmap='RdBu_r', center=0)
        plt.show()
    
    # Missing
    import missingno as msno
    msno.matrix(df)
    plt.show()
    
    if target and target in df.columns:
        print(f"\n=== Target: {target} ===")
        print(df[target].value_counts(normalize=True))

# Usage
quick_eda(df, target='target')
```

---

## Quick Reference: EDA Function Map

| Task | Function/Package |
|------|------------------|
| **Quick overview** | `df.info()`, `df.describe()`, `skimr.skim()` |
| **Missing data** | `df.isnull().sum()`, `missingno.matrix()`, `naniar.vis_miss()` |
| **Distributions** | `sns.histplot()`, `sns.kdeplot()`, `df.hist()` |
| **Box/Violin** | `sns.boxplot()`, `sns.violinplot()`, `sns.boxenplot()` |
| **Correlation** | `df.corr()`, `sns.heatmap()`, `sns.clustermap()` |
| **Pairwise** | `sns.pairplot()`, `sns.pairplot()` |
| **Categorical** | `sns.countplot()`, `sns.catplot()`, `pd.crosstab()` |
| **Time series** | `df.plot()`, `seasonal_decompose()`, `plot_acf()` |
| **Outliers** | `zscore()`, `IsolationForest`, `LocalOutlierFactor` |
| **Feature importance** | `RandomForest`, `permutation_importance`, `shap` |
| **Profiling** | `pandas_profiling`, `ydata_profiling`, `DataExplorer` |

---

## Key Packages for EDA

| Category | Packages |
|----------|----------|
| **Core** | pandas, polars, numpy |
| **Visualization** | matplotlib, seaborn, plotly, plotnine, altair |
| **Missing Data** | missingno, naniar, visdat |
| **Profiling** | ydata_profiling, pandas_profiling, DataExplorer |
| **Outliers** | scipy.stats, sklearn.ensemble, sklearn.neighbors |
| **Feature Importance** | shap, eli5, pdpbox |
| **Profiling** | ydata_profiling, pandas_profiling |

---

## Quick Reference: EDA Function Map

| Task | pandas | polars | Visualization |
|------|--------|--------|---------------|
| Load | `pd.read_csv()` | `pl.read_csv()` | - |
| Overview | `df.info()`, `df.describe()` | `df.describe()`, `df.glimpse()` | `df.hist()`, `sns.pairplot()` |
| Missing | `df.isnull().sum()` | `df.null_count()` | `msno.matrix()`, `naniar.vis_miss()` |
| Distributions | `df.hist()`, `sns.histplot()` | `df.hist()`, `pl.hist()` | `sns.histplot()`, `sns.kdeplot()` |
| Correlation | `df.corr()` | `df.corr()` | `sns.heatmap()`, `sns.clustermap()` |
| Categorical | `value_counts()`, `pd.crosstab()` | `value_counts()`, `pl.col().value_counts()` | `sns.countplot()`, `sns.catplot()` |
| GroupBy | `groupby().agg()` | `group_by().agg()` | `sns.boxplot()`, `sns.violinplot()` |
| Time Series | `resample()`, `rolling()` | `group_by_dynamic()`, `rolling()` | `decompose()`, `plot_acf()` |
| Outliers | `zscore()`, `IQR` | `pl.col().quantile()` | `IsolationForest`, `LOF` |
| Feature Imp | `feature_importances_` | N/A | `shap`, `permutation_importance` |

---

*Last updated: 2024-11-04*
*Part of: Python Programming Knowledge Base*