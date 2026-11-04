# EDA (Exploratory Data Analysis) Cheatsheet

A comprehensive reference for exploratory data analysis in R using tidyverse and related packages.

---

## 1. Initial Data Inspection

### 1.1 Quick Data Overview
```r
# Load essential packages
library(tidyverse)
library(skimr)
library(visdat)
library(inspectdf)

# Load data
df <- readr::read_csv("data.csv")

# Quick overview
glimpse(df)                    # Transposed view (tibble)
skim(df)                       # Comprehensive summary (skimr)
inspect_df(df)                 # Visual inspection (inspectdf)
vis_dat(df)                    # Visualize missing data (visdat)
```

### 1.2 Data Structure & Types
```r
# Structure
str(df)
glimpse(df)

# Column types
df |> sapply(class) |> table()

# Dimensions
dim(df)
nrow(df); ncol(df)

# Column names
names(df)
colnames(df)

# Data types summary
df |> 
  summarise(across(everything(), ~ list(
    type = class(.),
    n_missing = sum(is.na(.)),
    n_unique = n_distinct(.),
    min = if(is.numeric(.)) min(., na.rm = TRUE) else NA,
    max = if(is.numeric(.)) max(., na.rm = TRUE) else NA
  )) |>
  tidyr::unnest_wider(everything())
```

---

## 2. Missing Data Analysis

### 2.1 Missing Data Summary
```r
library(naniar)
library(visdat)

# Missing data summary
vis_miss(df)                    # Visualize missing data
miss_var_summary(df)            # Missing per variable
miss_case_summary(df)           # Missing per observation
gg_miss_var(df)                 # ggplot of missingness
gg_miss_upset(df)               # Upset plot of missing patterns

# Missing by group
df %>% 
  group_by(group_var) |> 
  summarise(across(everything(), ~ mean(is.na(.)))) |>
  pivot_longer(-1, names_to = "variable", values_to = "pct_missing")
```

### 2.2 Missing Data Patterns
```r
library(naniar)

# Missing data patterns
mcar_test(df)                    # Little's MCAR test
gg_miss_upset(df)                # Upset plot of missing patterns

# Shadow matrix
df |> 
  bind_shadow() |> 
  ggplot(aes(x = .data$variable, fill = .data$missing)) +
  geom_bar() +
  facet_wrap(~ .data$variable, scales = "free")
```

---

## 3. Univariate Analysis

### 3.1 Numerical Variables
```r
library(ggplot2)
library(ggdist)

# Distribution plots
ggplot(df, aes(x = var)) +
  geom_histogram(bins = 30, fill = "steelblue", alpha = 0.7) +
  geom_density(alpha = 0.5, fill = "red", color = NA) +
  geom_vline(aes(xintercept = mean(.data[[var]], na.rm = TRUE)), 
             color = "red", linetype = "dashed") +
  geom_vline(aes(xintercept = median(.data[[var]], na.rm = TRUE)), 
             color = "blue", linetype = "dashed")

# Density with quantiles
ggplot(df, aes(x = var)) +
  stat_slab(aes(fill = stat(x)), fill_type = "segments") +
  stat_pointinterval(aes(y = 0))

# Boxplot with outliers
ggplot(df, aes(y = var)) +
  geom_boxplot(outlier.color = "red", outlier.alpha = 0.5) +
  geom_jitter(width = 0.1, alpha = 0.3, color = "gray")

# Violin + boxplot
ggplot(df, aes(x = "", y = var)) +
  geom_violin(fill = "steelblue", alpha = 0.5) +
  geom_boxplot(width = 0.1, fill = "white", alpha = 0.8)
```

### 3.2 Categorical Variables
```r
# Bar plot
ggplot(df, aes(x = fct_infreq(factor_var))) +
  geom_bar(fill = "steelblue") +
  coord_flip() +
  geom_text(stat = "count", aes(label = ..count..), hjust = -0.1)

# Proportions
ggplot(df, aes(x = factor_var)) +
  geom_bar(aes(y = ..prop.., group = 1), fill = "steelblue") +
  scale_y_continuous(labels = scales::percent) +
  geom_text(stat = "count", aes(label = scales::percent(..prop..)), 
            vjust = -0.5)

# Stacked proportions
ggplot(df, aes(x = group_var, fill = target_var)) +
  geom_bar(position = "fill") +
  scale_y_continuous(labels = scales::percent)
```

---

## 4. Bivariate Analysis

### 2.1 Numeric vs Numeric
```r
# Scatter plot with smooth
ggplot(df, aes(x = var1, y = var2)) +
  geom_point(alpha = 0.5, size = 1) +
  geom_smooth(method = "loess", se = TRUE, color = "red") +
  geom_smooth(method = "lm", se = FALSE, color = "red", linetype = "dashed")

# Hexbin for large datasets
ggplot(df, aes(x, y)) +
  geom_hex(bins = 30) +
  scale_fill_viridis_c()

# 2D density
ggplot(df, aes(x, y)) +
  geom_density_2d_filled(contour_var = "ndensity") +
  scale_fill_viridis_c()

# Marginal plots
library(ggExtra)
p <- ggplot(df, aes(x, y)) + geom_point(alpha = 0.3)
ggMarginal(p, type = "histogram", fill = "steelblue")

# Correlation matrix
library(corrplot)
cor_matrix <- df |> select(where(is.numeric)) |> cor(use = "complete.obs")
corrplot(cor_matrix, method = "color", type = "upper", 
         addCoef.col = "black", tl.cex = 0.7)

# GGally pairs
library(GGally)
ggpairs(df |> select(where(is.numeric)),
        upper = list(continuous = "cor"),
        lower = list(continuous = "points"),
        diag = list(continuous = "densityDiag"))
```

### 4.2 Categorical vs Numeric
```r
# Boxplot by group
ggplot(df, aes(x = category, y = value, fill = category)) +
  geom_boxplot(outlier.alpha = 0.3) +
  geom_jitter(width = 0.1, alpha = 0.3, size = 0.5)

# Violin plot
ggplot(df, aes(x = category, y = value, fill = category)) +
  geom_violin(alpha = 0.5) +
  geom_boxplot(width = 0.1, fill = "white", alpha = 0.8)

# Violin + box + points
ggplot(df, aes(x = category, y = value)) +
  geom_violin(aes(fill = category), alpha = 0.5) +
  geom_boxplot(width = 0.1, fill = "white") +
  geom_jitter(width = 0.1, alpha = 0.3, aes(color = category))

# Ridgeline plot
library(ggridges)
ggplot(df, aes(x = value, y = category, fill = category)) +
  geom_density_ridges(alpha = 0.7, scale = 1.5) +
  theme_ridges()

# Violin + box + points
ggplot(df, aes(x = category, y = value)) +
  geom_violin(aes(fill = category), alpha = 0.5) +
  geom_boxplot(width = 0.1, fill = "white") +
  geom_jitter(width = 0.1, alpha = 0.3, aes(color = category))
```

### 4.3 Categorical vs Categorical
```r
# Mosaic plot
library(ggmosaic)
ggplot(df) +
  geom_mosaic(aes(x = product(var1, var2), fill = var2))

# Stacked bar
ggplot(df, aes(x = var1, fill = var2)) +
  geom_bar(position = "fill") +
  scale_y_continuous(labels = scales::percent)

# Grouped bar
ggplot(df, aes(x = var1, fill = var2)) +
  geom_bar(position = "dodge")

# Heatmap
df |> 
  count(var1, var2) |> 
  ggplot(aes(x = var1, y = var2, fill = n)) +
  geom_tile() +
  scale_fill_viridis_c() +
  geom_text(aes(label = n))
```

---

## 5. Multivariate Analysis

### 5.1 Pairwise Relationships
```r
library(GGally)

# Basic pairs
ggpairs(df |> select(where(is.numeric)),
        upper = list(continuous = "cor"),
        lower = list(continuous = "points"),
        diag = list(continuous = "densityDiag"))

# Custom pairs
ggpairs(df |> select(where(is.numeric)),
        upper = list(continuous = wrap("cor", size = 3)),
        lower = list(continuous = wrap("points", alpha = 0.3, size = 0.5)),
        diag = list(continuous = "densityDiag"),
        progress = FALSE)
```

### 5.2 Parallel Coordinates
```r
library(GGally)
ggparcoord(df |> select(where(is.numeric)),
           columns = 1:ncol(df |> select(where(is.numeric))),
           groupColumn = "category",
           scale = "uniminmax",
           showPoints = TRUE,
           alphaLines = 0.3)
```

### 5.3 Heatmaps
```r
# Correlation heatmap
library(corrplot)
cor_mat <- df |> select(where(is.numeric)) |> cor(use = "complete.obs")
corrplot(cor_mat, method = "color", type = "upper",
         addCoef.col = "black", tl.cex = 0.7)

# ggplot heatmap
df |> 
  select(where(is.numeric)) |>
  cor(use = "complete.obs") |>
  as.data.frame() |>
  rownames_to_column("var1") |>
  pivot_longer(-var1, names_to = "var2", values_to = "cor") |>
  ggplot(aes(var1, var2, fill = cor)) +
  geom_tile() +
  scale_fill_gradient2(low = "blue", mid = "white", high = "red", midpoint = 0) +
  geom_text(aes(label = round(cor, 2)), size = 3)
```

---

## 6. Missing Data Visualization

```r
library(naniar)
library(visdat)

# Overview
vis_dat(df)
vis_miss(df)
gg_miss_var(df)
gg_miss_upset(df)
gg_miss_var(df, show_pct = TRUE)

# Missing by group
df %>% 
  group_by(group) |> 
  summarise(across(everything(), ~ mean(is.na(.)))) |>
  pivot_longer(-1, names_to = "variable", values_to = "pct_missing") |>
  ggplot(aes(x = variable, y = group, fill = pct_missing)) +
  geom_tile() +
  scale_fill_viridis_c() +
  geom_text(aes(label = scales::percent(pct_missing, accuracy = 0.1)))

# Shadow matrix
df %>% 
  bind_shadow() |> 
  ggplot(aes(x = variable, y = value, color = missing)) +
  geom_point(alpha = 0.5, position = position_jitter(width = 0.2)) +
  facet_wrap(~ variable, scales = "free_y") +
  coord_flip()
```

---

## 7. Outlier Detection

```r
library(outliers)

# IQR method
df |>
  group_by(group) |>
  mutate(
    Q1 = quantile(value, 0.25, na.rm = TRUE),
    Q3 = quantile(value, 0.75, na.rm = TRUE),
    IQR = Q3 - Q1,
    lower = Q1 - 1.5 * IQR,
    upper = Q3 + 1.5 * IQR,
    is_outlier = value < lower | value > upper
  )

# Visualize outliers
ggplot(df, aes(x = group, y = value)) +
  geom_boxplot(outlier.color = "red", outlier.alpha = 0.5) +
  geom_jitter(width = 0.1, alpha = 0.3)

# Multivariate outliers (Mahalanobis)
library(mvoutlier)
outlier_scores <- mahalanobis(df[, numeric_cols], 
                               colMeans(df[, numeric_cols], na.rm = TRUE),
                               cov(df[, numeric_cols], use = "complete.obs"))
df$mahal <- outlier_scores
df$outlier <- df$mahal > qchisq(0.975, df = length(numeric_cols))
```

---

## 8. Summary Statistics Tables

```r
library(gtsummary)
library(gt)

# Quick summary table
df |> 
  tbl_summary(by = group, 
              statistic = list(all_continuous() ~ "{mean} ({sd})",
                               all_categorical() ~ "{n} ({p}%)"),
              missing = "no") |>
  add_overall() |>
  add_p() |>
  bold_labels() |>
  bold_p() |>
  modify_caption("**Table 1: Summary Statistics by Group**")

# Quick skimr table
skimr::skim(df) |> 
  yank("numeric") |>
  select(skim_variable, n_missing, complete_rate, mean, sd, 
         p0, p25, p50, p75, p100, hist) |>
  gt() |>
  fmt_number(columns = c(mean, sd, p0, p25, p50, p75, p100), decimals = 2) |>
  tab_header(title = "Numeric Variable Summary")

# Correlation table
df |> 
  select(where(is.numeric)) |> 
  cor(use = "complete.obs") |> 
  as.data.frame() |> 
  rownames_to_column("Variable") |> 
  gt() |> 
  fmt_number(columns = -Variable, decimals = 3) |> 
  tab_header(title = "Correlation Matrix")
```

---

## 9. Automated EDA Reports

```r
# DataExplorer
library(DataExplorer)
create_report(df, output_file = "eda_report.html")

# SmartEDA
library(SmartEDA)
ExpData(data = df, target = "target")

# DataExplorer with config
create_report(df, 
              output_file = "eda_report.html",
              config = configure_report(
                add_plot_str = TRUE,
                add_plot_missing = TRUE,
                add_plot_histogram = TRUE,
                add_plot_density = TRUE,
                add_plot_correlation = TRUE
              ))

# DataQualityR
library(DataQualityR)
checkDataQuality(df, "report.html")
```

---

## 10. Quick Reference Functions

```r
# Quick EDA function
quick_eda <- function(df, target = NULL) {
  list(
    overview = skimr::skim(df),
    missing = naniar::miss_var_summary(df),
    correlations = if (any(sapply(df, is.numeric))) {
      cor(df %>% select(where(is.numeric)), use = "complete.obs")
    } else NULL,
    missing_plot = naniar::gg_miss_var(df),
    distributions = if (any(sapply(df, is.numeric))) {
      df %>% 
        select(where(is.numeric)) %>% 
        map(~ ggplot(data.frame(x = .x), aes(x = .x)) + 
              geom_histogram(bins = 30) + theme_minimal())
    } else NULL
  }
}

# Usage
report <- quick_eda(df)
report$overview
report$missing_plot
```

---

## Quick Reference: EDA Function Map

| Task | Function/Package |
|------|------------------|
| Quick overview | `glimpse()`, `skimr::skim()` |
| Missing data | `naniar::vis_miss()`, `visdat::vis_miss()` |
| Distributions | `geom_histogram()`, `geom_density()`, `ggdist::stat_slab()` |
| Correlation | `cor()`, `corrplot::corrplot()`, `GGally::ggpairs()` |
| Missing data | `naniar::vis_miss()`, `visdat::vis_miss()` |
| Outliers | `geom_boxplot()`, `outliers::outlier()`, `mvoutlier` |
| Correlation matrix | `cor()`, `corrplot::corrplot()`, `GGally::ggpairs()` |
| Pairwise plots | `GGally::ggpairs()`, `GGally::ggparcoord()` |
| Missing patterns | `naniar::gg_miss_upset()`, `naniar::gg_miss_var()` |
| Automated report | `DataExplorer::create_report()`, `SmartEDA::ExpData()` |

---

## Quick Reference: Plot Types by Variable Type

| Variable Types | Plot Types |
|----------------|------------|
| Numeric vs Numeric | Scatter, Hexbin, 2D Density, Corr |
| Categorical vs Numeric | Boxplot, Violin, Ridgeline, Jitter |
| Categorical vs Categorical | Mosaic, Stacked/Grouped Bar, Heatmap |
| Single Numeric | Histogram, Density, Boxplot, Violin |
| Single Categorical | Bar, Cleveland Dot, Treemap |
| Time Series | Line, Area, Horizon, Calendar |
| Spatial | Choropleth, Point map, Hexbin |

---

## Key Packages for EDA

| Category | Packages |
|----------|----------|
| **Core** | tidyverse, ggplot2, dplyr, tidyr |
| **Missing Data** | naniar, visdat, visdat |
| **Correlation** | corrplot, GGally, corrr |
| **Automated Reports** | DataExplorer, SmartEDA, DataExplorer |
| **Missing Data** | naniar, visdat |
| **Outliers** | outliers, mvoutlier |
| **Interactive** | plotly, ggiraph, highcharter |
| **Reports** | DataExplorer, SmartEDA, DataExplorer |

---

*Last updated: 2024-11-04*