# Tidyverse Equivalent in Python

A comprehensive mapping of R tidyverse functions to their Python pandas/polars equivalents.

---

## 1. Data Manipulation (dplyr → pandas/polars)

### 1.1 Filter Rows
| R (dplyr) | pandas | polars |
|-----------|--------|--------|
| `filter(df, x > 5)` | `df[df['x'] > 5]` | `df.filter(pl.col('x') > 5)` |
| `filter(df, x > 5, y < 10)` | `df[(df['x'] > 5) & (df['y'] < 10)]` | `df.filter((pl.col('x') > 5) & (pl.col('y') < 10))` |
| `filter(df, x %in% c(1,2,3))` | `df[df['x'].isin([1,2,3])]` | `df.filter(pl.col('x').is_in([1,2,3]))` |
| `filter(df, between(x, 1, 10))` | `df[df['x'].between(1, 10)]` | `df.filter(pl.col('x').is_between(1, 10))` |
| `filter(df, if_any(everything(), is.na))` | `df[df.isna().any(axis=1)]` | `df.filter(pl.all_horizontal(pl.all().is_null()))` |
| `filter(df, if_all(c(x,y), ~ . > 0))` | `df[(df['x'] > 0) & (df['y'] > 0)]` | `df.filter(pl.all_horizontal(pl.col('x','y') > 0))` |

### 1.2 Select Columns
| R (dplyr) | pandas | polars |
|-----------|--------|--------|
| `select(df, x, y)` | `df[['x','y']]` | `df.select('x','y')` |
| `select(df, starts_with('x'))` | `df.filter(like='x')` | `df.select(pl.col('^x.*$'))` |
| `select(df, ends_with('id'))` | `df.filter(regex='id$')` | `df.select(pl.col('.*id$'))` |
| `select(df, contains('date'))` | `df.filter(like='date')` | `df.select(pl.col('.*date.*'))` |
| `select(df, -id)` | `df.drop('id', axis=1)` | `df.drop('id')` |
| `select(df, x:z)` | `df.loc[:, 'x':'z']` | N/A |
| `select(df, -c(x,y))` | `df.drop(['x','y'], axis=1)` | `df.drop(['x','y'])` |
| `select(df, x, y, everything())` | `df[['x','y'] + [c for c in df if c not in ['x','y']]]` | `df.select('x','y', pl.all().exclude('x','y'))` |
| `relocate(df, y, .before = x)` | `cols = df.columns.tolist(); df = df[cols]` | N/A |

### 1.3 Create/Modify Columns
| R (dplyr) | pandas | polars |
|-----------|--------|--------|
| `mutate(df, z = x + y)` | `df['z'] = df['x'] + df['y']` | `df.with_columns(z = pl.col('x') + pl.col('y'))` |
| `mutate(df, z = x * 2)` | `df['z'] = df['x'] * 2` | `df.with_columns(z = pl.col('x') * 2)` |
| `mutate(df, across(where(is.numeric), log))` | `df.select_dtypes(include='number').apply(np.log)` | `df.with_columns(pl.col(pl.NUMERIC_DTYPES).log())` |
| `mutate(df, z = case_when(x > 0 ~ 'pos', TRUE ~ 'neg'))` | `np.where(df['x'] > 0, 'pos', 'neg')` | `pl.when(pl.col('x') > 0).then('pos').otherwise('neg')` |
| `transmute(df, z = x + y)` | `df.assign(z = df['x'] + df['y'])[['z']]` | `df.select(z = pl.col('x') + pl.col('y'))` |

### 1.4 Summarise/Aggregate
| R (dplyr) | pandas | polars |
|-----------|--------|--------|
| `summarise(df, n = n())` | `len(df)` | `df.height` |
| `summarise(df, n = n(), mean = mean(x))` | `df.agg(n=('x','size'), mean=('x','mean'))` | `df.select(pl.len().alias('n'), pl.col('x').mean())` |
| `summarise(df, mean = mean(x), sd = sd(x))` | `df.agg(mean=('x','mean'), sd=('x','std'))` | `df.select(pl.col('x').mean(), pl.col('x').std())` |
| `summarise(df, .by = group)` | `df.groupby('g').agg(...)` | `df.group_by('g').agg(...)` |
| `summarise(df, n = n(), .by = group)` | `df.groupby('g').size()` | `df.group_by('g').len()` |
| `summarise(df, across(where(is.numeric), mean))` | `df.select_dtypes('number').mean()` | `df.select(pl.col(pl.NUMERIC_DTYPES).mean())` |

### 1.5 Grouped Operations
| R (dplyr) | pandas | polars |
|-----------|--------|--------|
| `group_by(df, g)` | `df.groupby('g')` | `df.group_by('g')` |
| `group_by(df, g1, g2)` | `df.groupby(['g1','g2'])` | `df.group_by(['g1','g2'])` |
| `summarise(df, n = n())` | `df.groupby('g').size()` | `df.group_by('g').len()` |
| `summarise(df, mean = mean(x))` | `df.groupby('g')['x'].mean()` | `df.group_by('g').agg(pl.col('x').mean())` |
| `mutate(df, z = mean(x))` | `df.groupby('g')['x'].transform('mean')` | `df.with_columns(pl.col('x').mean().over('g'))` |
| `group_by(df, g) %>% filter(n() > 5)` | `df.groupby('g').filter(lambda x: len(x) > 5)` | `df.filter(pl.col('g').count().over('g') > 5)` |

### 1.6 Joins
| R (dplyr) | pandas | polars |
|-----------|--------|--------|
| `inner_join(x, y, by = 'id')` | `pd.merge(x, y, on='id', how='inner')` | `x.join(y, on='id', how='inner')` |
| `left_join(x, y, by = 'id')` | `pd.merge(x, y, on='id', how='left')` | `x.join(y, on='id', how='left')` |
| `right_join(x, y, by = 'id')` | `pd.merge(x, y, on='id', how='right')` | `x.join(y, on='id', how='right')` |
| `full_join(x, y, by = 'id')` | `pd.merge(x, y, on='id', how='outer')` | `x.join(y, on='id', how='outer')` |
| `left_join(x, y, by = c('id1'='id2'))` | `pd.merge(x, y, left_on='id1', right_on='id2')` | `x.join(y, left_on='id1', right_on='id2', how='left')` |
| `semi_join(x, y, by='id')` | `x[x['id'].isin(y['id'])]` | `x.join(y, on='id', how='semi')` |
| `anti_join(x, y, by='id')` | `x[~x['id'].isin(y['id'])]` | `x.join(y, on='id', how='anti')` |

### 1.7 Pivot/Reshape
| R (tidyr) | pandas | polars |
|-----------|--------|--------|
| `pivot_longer(df, cols = c(x,y), names_to='var', values_to='val')` | `pd.melt(df, id_vars=['id'], value_vars=['x','y'], var_name='var', value_name='val')` | `df.melt(id_vars='id', value_vars=['x','y'], variable_name='var', value_name='val')` |
| `pivot_wider(df, names_from = var, values_from = val)` | `df.pivot(index='id', columns='var', values='val')` | `df.pivot(on='id', index='id', columns='var', values='val')` |
| `pivot_wider(df, names_from=var, values_from=val, values_fill=0)` | `df.pivot_table(index='id', columns='var', values='val', fill_value=0)` | `df.pivot(on='var', index='id', values='val').fill_null(0)` |
| `separate(df, col, into=c('a','b'), sep='_')` | `df['col'].str.split('_', expand=True)` | `df.with_columns(pl.col('col').str.split('_').alias('parts')).unnest('parts')` |
| `unite(df, col, a, b, sep='_')` | `df['col'] = df['a'] + '_' + df['b']` | `df.with_columns((pl.col('a') + '_' + pl.col('b')).alias('col'))` |

---

## 2. Data Import/Export (readr vs pandas/polars)

| R (readr) | pandas | polars |
|-----------|--------|--------|
| `read_csv('file.csv')` | `pd.read_csv('file.csv')` | `pl.read_csv('file.csv')` |
| `read_csv('file.csv', col_types = cols(...))` | `pd.read_csv('file.csv', dtype={'col': 'int32'})` | `pl.read_csv('file.csv', schema={'col': pl.Int32})` |
| `read_tsv('file.tsv')` | `pd.read_csv('file.tsv', sep='\t')` | `pl.read_csv('file.tsv', separator='\t')` |
| `read_rds('file.rds')` | `pd.read_pickle('file.pkl')` | `pl.read_ipc('file.arrow')` |
| `write_csv(df, 'file.csv')` | `df.to_csv('file.csv', index=False)` | `df.write_csv('file.csv')` |
| `write_rds(df, 'file.rds')` | `df.to_pickle('file.pkl')` | `df.write_parquet('file.parquet')` |
| `write_parquet(df, 'file.parquet')` | `df.to_parquet('file.parquet', compression='zstd')` | `df.write_parquet('file.parquet', compression='zstd')` |

---

## 2. String Manipulation (stringr vs stringr/stringi)

| R (stringr) | pandas | polars |
|-------------|--------|--------|
| `str_detect(string, pattern)` | `df['col'].str.contains(pattern)` | `pl.col('s').str.contains(pattern)` |
| `str_detect(string, fixed('abc'))` | `df['col'].str.contains('abc', regex=False)` | `pl.col('s').str.contains('abc', literal=True)` |
| `str_replace(string, pattern, replacement)` | `df['col'].str.replace(pattern, replacement, regex=True)` | `pl.col('s').str.replace(pattern, replacement)` |
| `str_replace_all(string, pattern, replacement)` | `df['col'].str.replace(pattern, replacement, regex=True)` | `pl.col('s').str.replace_all(pattern, replacement)` |
| `str_remove(string, pattern)` | `df['col'].str.replace(pattern, '', regex=True)` | `pl.col('s').str.replace(pattern, '')` |
| `str_extract(string, pattern)` | `df['col'].str.extract(pattern)` | `pl.col('s').str.extract(pattern)` |
| `str_extract_all(string, pattern)` | `df['col'].str.findall(pattern)` | `pl.col('s').str.extract_all(pattern)` |
| `str_replace_na(string, replacement)` | `df['col'].fillna(replacement)` | `pl.col('s').fill_null(replacement)` |
| `str_to_lower(string)` | `df['col'].str.lower()` | `pl.col('s').str.to_lowercase()` |
| `str_to_upper(string)` | `df['col'].str.upper()` | `pl.col('s').str.to_uppercase()` |
| `str_to_title(string)` | `df['col'].str.title()` | `pl.col('s').str.to_titlecase()` |
| `str_trim(string)` | `df['col'].str.strip()` | `pl.col('s').str.strip_chars()` |
| `str_squish(string)` | `df['col'].str.replace(r'\s+', ' ', regex=True).str.strip()` | `pl.col('s').str.strip_chars().str.replace_all(r'\s+', ' ')` |
| `str_pad(string, width, side, pad)` | `df['col'].str.pad(width, side='left', fillchar='0')` | `pl.col('s').str.pad_start(width, '0')` |
| `str_trunc(string, width)` | `df['col'].str.slice(0, width)` | `pl.col('s').str.slice(0, width)` |
| `str_split(string, pattern)` | `df['col'].str.split(pattern, expand=True)` | `pl.col('s').str.split(pattern)` |
| `str_split_fixed(string, pattern, n)` | `df['col'].str.split(pattern, n=n, expand=True)` | `pl.col('s').str.split_exact(pattern, n)` |
| `str_c(..., sep = '')` | `df['a'] + df['b']` | `pl.col('a') + pl.col('b')` |
| `str_glue("{x} - {y}")` | `df['a'].astype(str) + '-' + df['b'].astype(str)` | `pl.format('{} - {}', pl.col('x'), pl.col('y'))` |
| `str_glue_data(df, "{x} - {y}")` | `df.apply(lambda r: f"{r['x']} - {r['y']}", axis=1)` | `pl.format('{} - {}', pl.col('x'), pl.col('y'))` |
| `str_order(x)` | `df['col'].sort_values()` | `pl.col('x').sort()` |
| `str_sort(x)` | `sorted(df['col'])` | `pl.col('x').sort()` |

---

## 3. Factor Handling (forcats)

| R (forcats) | pandas | polars |
|-------------|--------|--------|
| `fct_reorder(f, x)` | `pd.Categorical(df['f'], categories=df.groupby('f')['x'].mean().sort_values().index)` | `pl.col('f').cast(pl.Categorical('lexical'))` |
| `fct_relevel(f, 'c', 'a')` | `pd.Categorical(df['f'], categories=['c','a','b'])` | `pl.col('f').cast(pl.Categorical(['c','a','b']))` |
| `fct_inorder(f)` | `pd.Categorical(df['f'], categories=df['f'].unique())` | `pl.col('f').cast(pl.Categorical('physical'))` |
| `fct_rev(f)` | `df['f'].cat.reorder_categories(df['f'].cat.categories[::-1])` | `pl.col('f').cast(pl.Categorical('lexical', reverse=True))` |
| `fct_lump(f, n = 2)` | `df['f'].where(df['f'].isin(top2), 'Other')` | `pl.col('f').str.replace(r'(?!^top).+', 'Other', regex=True)` |
| `fct_lump_min(f, min = 5)` | `df['f'].where(df['f'].map(df['f'].value_counts() >= 5), 'Other')` | Custom |
| `fct_count(f)` | `df['f'].value_counts()` | `pl.col('f').value_counts()` |
| `fct_explicit_na(f, na_level = 'Missing')` | `df['f'].cat.add_categories('Missing').fillna('Missing')` | `pl.col('f').fill_null('Missing')` |

---

## 4. Dates & Times (lubridate vs pandas/polars)

| R (lubridate) | pandas | polars |
|---------------|--------|--------|
| `ymd('2023-01-15')` | `pd.to_datetime('2023-01-15')` | `pl.lit('2023-01-15').str.to_date()` |
| `mdy('01/15/2023')` | `pd.to_datetime('01/15/2023', format='%m/%d/%Y')` | `pl.lit('01/15/2023').str.to_date('%m/%d/%Y')` |
| `dmy('15-01-2023')` | `pd.to_datetime('15-01-2023', format='%d-%m-%Y')` | `pl.lit('15-01-2023').str.to_date('%d-%m-%Y')` |
| `now()` | `pd.Timestamp.now()` | `pl.lit(datetime.now())` |
| `today()` | `pd.Timestamp.today()` | `pl.lit(datetime.now()).cast(pl.Date)` |
| `year(date)` | `df['date'].dt.year` | `pl.col('d').dt.year()` |
| `month(date)` | `df['date'].dt.month` | `pl.col('d').dt.month()` |
| `month(date, label=TRUE)` | `df['date'].dt.month_name()` | `pl.col('d').dt.month_name()` |
| `day(date)` | `df['date'].dt.day` | `pl.col('d').dt.day()` |
| `wday(date, label=TRUE)` | `df['date'].dt.day_name()` | `pl.col('d').dt.weekday()` |
| `quarter(date)` | `df['date'].dt.quarter` | `pl.col('d').dt.quarter()` |
| `semester(date)` | `(df['date'].dt.month-1)//6 + 1` | Custom |
| `floor_date(date, 'month')` | `df['date'].dt.to_period('M').dt.to_timestamp()` | `pl.col('d').dt.truncate('1mo')` |
| `ceiling_date(date, 'month')` | `(df['date'] + pd.offsets.MonthEnd(0)).dt.to_timestamp()` | Custom |
| `round_date(date, 'hour')` | `df['date'].dt.round('h')` | `pl.col('d').dt.round('1h')` |
| `date + days(5)` | `df['date'] + pd.Timedelta(days=5)` | `pl.col('d') + pl.duration(days=5)` |
| `date + months(3)` | `df['date'] + pd.DateOffset(months=3)` | `pl.col('d').dt.offset_by('3mo')` |
| `date %m+% months(3)` | `df['date'] + pd.DateOffset(months=3)` | `pl.col('d').dt.offset_by('3mo')` |
| `interval(start, end)` | `pd.Interval(start, end)` | Custom |
| `int_length(interval)` | `(end - start).days` | `(pl.col('end') - pl.col('start')).dt.total_days()` |
| `as.duration(3600)` | `pd.Timedelta(seconds=3600)` | `pl.duration(seconds=3600)` |
| `seconds(3600)` | `pd.Timedelta(seconds=3600)` | `pl.duration(seconds=3600)` |

---

## 5. Visualization (ggplot2 → plotnine)

| ggplot2 | plotnine |
|---------|----------|
| `ggplot(df, aes(x, y))` | `ggplot(df, aes(x='x', y='y'))` |
| `aes(x, y, color = z)` | `aes(x='x', y='y', color='z')` |
| `geom_point()` | `geom_point()` |
| `geom_line()` | `geom_line()` |
| `geom_bar()` | `geom_bar()` |
| `geom_histogram(bins = 30)` | `geom_histogram(bins=30)` |
| `geom_boxplot()` | `geom_boxplot()` |
| `geom_violin()` | `geom_violin()` |
| `geom_smooth(method = 'lm')` | `geom_smooth(method='lm', se=False)` |
| `geom_smooth(se = FALSE)` | `geom_smooth(se=False)` |
| `facet_wrap(~ var)` | `facet_wrap('~ var')` |
| `facet_grid(x ~ y)` | `facet_grid('x ~ y')` |
| `scale_color_viridis_c()` | `scale_color_viridis_c()` |
| `scale_color_brewer(palette = 'Set1')` | `scale_color_brewer(palette='Set1')` |
| `scale_x_log10()` | `scale_x_log10()` |
| `scale_y_continuous(labels = scales::percent)` | `scale_y_continuous(labels=lambda x: f'{x:.0%}')` |
| `theme_minimal()` | `theme_minimal()` |
| `theme_bw()` | `theme_bw()` |
| `theme(legend.position = 'top')` | `theme(legend_position='top')` |
| `theme(legend.title = element_blank())` | `guides(color=guide_legend(title=None))` |
| `labs(title = 'Title', x = 'X', y = 'Y')` | `labs(title='Title', x='X', y='Y')` |
| `ggtitle('Title')` | `ggtitle('Title')` |
| `theme(plot.title = element_text(hjust = 0.5))` | `theme(plot_title=element_text(hjust=0.5))` |
| `coord_flip()` | `coord_flip()` |
| `coord_fixed()` | `coord_fixed()` |
| `coord_polar()` | `coord_polar()` |
| `ggsave('plot.png', width=8, height=6, dpi=300)` | `ggsave('plot.png', width=8, height=6, dpi=300)` |

---

## 6. Modeling (caret/tidymodels → scikit-learn/tidymodels)

| R (caret/tidymodels) | Python (sklearn/tidymodels) |
|----------------------|------------------------------|
| `train(y ~ ., data, method = 'rf')` | `RandomForestClassifier().fit(X, y)` |
| `train(y ~ ., data, method = 'xgbTree')` | `XGBClassifier().fit(X, y)` |
| `train(y ~ ., data, method = 'glmnet')` | `LogisticRegression(penalty='elasticnet', solver='saga')` |
| `trainControl(method = 'cv', number = 10)` | `cross_val_score(model, X, y, cv=10)` |
| `trainControl(method = 'repeatedcv', number = 10, repeats = 3)` | `RepeatedKFold(n_splits=10, n_repeats=3)` |
| `tune_grid` | `GridSearchCV`, `RandomizedSearchCV` |
| `tune_bayes()` | `optuna` or `skopt` |
| `fit_resamples()` | `cross_validate()` |
| `collect_metrics()` | `cross_validate(..., return_train_score=True)` |
| `collect_predictions()` | `cross_val_predict()` |
| `vip::vi()` | `permutation_importance`, `shap` |
| `pull_workflow_fit() %>% vi()` | `model.feature_importances_` |
| `predict(model, new_data)` | `model.predict(X_test)` |
| `predict(model, new_data, type = 'prob')` | `model.predict_proba(X_test)` |
| `metrics::accuracy()` | `accuracy_score(y_true, y_pred)` |
| `metrics::roc_auc()` | `roc_auc_score(y_true, y_prob)` |
| `conf_mat()` | `confusion_matrix(y_true, y_pred)` |
| `roc_curve()` | `roc_curve(y_true, y_prob)` |
| `pr_curve()` | `precision_recall_curve()` |
| `conf_mat() %>% autoplot(type = 'heatmap')` | `ConfusionMatrixDisplay.from_predictions()` |

### Tidymodels → sklearn/tidymodels
```python
# Tidymodels workflow
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score

pipeline = Pipeline([
    ('preprocessor', ColumnTransformer([
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(), categorical_features)
    ])),
    ('model', RandomForestClassifier())
])

scores = cross_val_score(pipeline, X, y, cv=5, scoring='roc_auc')
```

---

## 7. Visualization (ggplot2 → plotnine)

| ggplot2 | plotnine |
|---------|----------|
| `ggplot(df, aes(x, y))` | `ggplot(df, aes(x='x', y='y'))` |
| `aes(x, y, color = z)` | `aes(x='x', y='y', color='z')` |
| `geom_point()` | `geom_point()` |
| `geom_line()` | `geom_line()` |
| `geom_bar()` | `geom_bar()` |
| `geom_histogram(bins=30)` | `geom_histogram(bins=30)` |
| `geom_boxplot()` | `geom_boxplot()` |
| `geom_violin()` | `geom_violin()` |
| `geom_smooth(method='lm')` | `geom_smooth(method='lm')` |
| `geom_smooth(se=FALSE)` | `geom_smooth(se=False)` |
| `facet_wrap(~ var)` | `facet_wrap('~ var')` |
| `facet_grid(x ~ y)` | `facet_grid('x ~ y')` |
| `scale_color_viridis_c()` | `scale_color_viridis_c()` |
| `scale_color_brewer(palette='Set1')` | `scale_color_brewer(palette='Set1')` |
| `scale_x_log10()` | `scale_x_log10()` |
| `theme_minimal()` | `theme_minimal()` |
| `theme_bw()` | `theme_bw()` |
| `theme(legend.position='top')` | `theme(legend_position='top')` |
| `coord_flip()` | `coord_flip()` |
| `coord_fixed()` | `coord_fixed()` |
| `coord_polar()` | `coord_polar()` |
| `ggsave('plot.png', width=8, height=6, dpi=300)` | `ggsave('plot.png', width=8, height=6, dpi=300)` |

---

## 8. Pipe Operator

| R (magrittr) | Python |
|--------------|--------|
| `df %>% filter(x > 5) %>% select(x, y)` | `df[df['x'] > 5][['x', 'y']]` |
| `df %>% group_by(g) %>% summarise(m = mean(x))` | `df.groupby('g')['x'].mean()` |
| `df %>% mutate(z = x + y) %>% select(x, y, z)` | `df.assign(z=lambda d: d['x'] + d['y'])[['x','y','z']]` |
| `df %>% mutate(z = case_when(x > 0 ~ 'pos', TRUE ~ 'neg'))` | `df.assign(z=np.where(df['x'] > 0, 'pos', 'neg'))` |

**Python pipe (3.10+):**
```python
df = (df
    .query('x > 5')
    .assign(z=lambda d: d['x'] + d['y'])
    .loc[:, ['x', 'y', 'z']]
)
```

---

## 9. Modeling: Tidymodels → sklearn/pyCaret

| Tidymodels | sklearn / pyCaret |
|------------|-------------------|
| `linear_reg()` | `LinearRegression()` |
| `logistic_reg()` | `LogisticRegression()` |
| `rand_forest()` | `RandomForestClassifier()` |
| `boost_tree()` | `XGBClassifier()` / `LGBMClassifier()` |
| `tune_grid()` | `GridSearchCV()` |
| `tune_bayes()` | `optuna` / `skopt` |
| `fit_resamples()` | `cross_validate()` |
| `collect_metrics()` | `cross_validate(..., return_train_score=True)` |
| `collect_predictions()` | `cross_val_predict()` |
| `show_best()` | `cv_results_` |
| `select_best()` | `clf.best_params_` |
| `last_fit()` | `fit()` on full data |
| `vip::vi()` | `permutation_importance()`, `shap` |
| `workflow()` | `Pipeline()` |
| `add_recipe()` | `ColumnTransformer` in Pipeline |
| `add_model()` | `Pipeline` final estimator |
| `tune::tune_grid()` | `GridSearchCV` / `RandomizedSearchCV` |
| `tune::tune_bayes()` | `optuna` / `skopt.BayesSearchCV` |

---

## 10. Quick Reference Card

### Data Wrangling One-Liners

| Task | pandas | polars |
|------|--------|--------|
| **Read CSV** | `pd.read_csv('f.csv')` | `pl.read_csv('f.csv')` |
| **Read Parquet** | `pd.read_parquet()` | `pl.read_parquet()` |
| **Write Parquet** | `df.to_parquet()` | `df.write_parquet()` |
| **Filter** | `df[df.c > 0]` | `df.filter(pl.col('c') > 0)` |
| **Select cols** | `df[['a','b']]` | `df.select('a','b')` |
| **Rename** | `df.rename({'a':'A'})` | `df.rename({'a':'A'})` |
| **Mutate** | `df.assign(z = df.x + df.y)` | `df.with_columns(z = pl.col('x') + pl.col('y'))` |
| **GroupBy** | `df.groupby('g').agg(...)` | `df.group_by('g').agg(...)` |
| **Join** | `pd.merge()` | `df.join()` |
| **Pivot Long** | `pd.melt()` | `df.melt()` |
| **Pivot Wide** | `df.pivot()` | `df.pivot()` |
| **GroupBy Agg** | `groupby().agg()` | `group_by().agg()` |
| **Window** | `groupby().transform()` | `.over('group')` |
| **Lag** | `shift()` | `pl.col('x').shift(1)` |
| **Rolling** | `rolling(7).mean()` | `rolling(7).mean()` |
| **Sample** | `sample(n=100)` | `sample(n=100)` |

---

## Visualization Quick Ref

| Task | Code |
|------|------|
| **Scatter** | `ggplot(df, aes(x,y)) + geom_point()` |
| **Line** | `+ geom_line()` |
| **Bar** | `+ geom_bar()` / `geom_col()` |
| **Histogram** | `+ geom_histogram(bins=30)` |
| **Boxplot** | `+ geom_boxplot()` |
| **Violin** | `+ geom_violin()` |
| **Smooth** | `+ geom_smooth(method='lm')` |
| **Facet** | `+ facet_wrap('~var')` |
| **Color Scale** | `+ scale_color_viridis_c()` |
| **Theme** | `+ theme_minimal()` |
| **Save** | `ggsave('plot.png', w=8, h=6, dpi=300)` |

---

*Last updated: 2024-11-04*