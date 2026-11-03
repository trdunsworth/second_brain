# Tidyverse Overview

A comprehensive guide to the tidyverse ecosystem - a collection of R packages designed for data science with a consistent philosophy and grammar.

## 1. What is the Tidyverse?

The tidyverse is an opinionated collection of R packages designed for data science. All packages share:
- **Common philosophy**: Tidy data principles (each variable a column, each observation a row)
- **Common grammar**: Consistent function naming and argument structure
- **Common data structures**: Tibbles as the primary data structure
- **Interoperability**: Designed to work together seamlessly

### Core Packages (loaded with `library(tidyverse)`)
| Package | Purpose | Key Functions |
|---------|---------|---------------|
| **ggplot2** | Visualization | `ggplot()`, `geom_*()`, `aes()` |
| **dplyr** | Data manipulation | `filter()`, `mutate()`, `select()`, `summarise()`, `group_by()` |
| **tidyr** | Data tidying | `pivot_longer()`, `pivot_wider()`, `separate()`, `unite()` |
| **readr** | Data import | `read_csv()`, `read_tsv()`, `read_rds()` |
| **purrr** | Functional programming | `map()`, `walk()`, `reduce()`, `safely()` |
| **tibble** | Modern data frames | `tibble()`, `as_tibble()`, `glimpse()` |
| **stringr** | String manipulation | `str_detect()`, `str_replace()`, `str_extract()` |
| **forcats** | Factor handling | `fct_reorder()`, `fct_lump()`, `fct_recode()` |

### Extended Ecosystem (install separately)
```r
# Data import/export
library(vroom)      # Fast CSV reading
library(arrow)      # Parquet/Feather
library(duckdb)     # SQL on files
library(data.table) # High-performance data manipulation

# Specialized tidyverse
library(tidymodels)    # Modeling framework
library(tidytext)      # Text analysis
library(tidygraph)     # Graph analysis
library(tidycensus)    # Census data
library(tidytext)      # Text mining
library(modeltime)     # Time series forecasting
```

---

## 2. Core Package Deep Dives

### 2.1 dplyr - Data Manipulation Grammar

#### Core Verbs (Single Table)
```r
library(dplyr)

# Filter rows
df |> filter(condition)
df |> filter(between(x, 1, 10))
df |> filter(if_any(everything(), is.na))
df |> filter(if_all(c(x, y), ~ . > 0))

# Select columns
df |> select(starts_with("x"))
df |> select(where(is.numeric))
df |> select(-contains("id"))
df |> relocate(name, .before = 1)

# Create/modify columns
df |> mutate(
  new_col = x * 2,
  across(where(is.numeric), ~ . * 2),
  .by = group_var
)

# Summarise
df |> summarise(
  n = n(),
  mean_val = mean(x, na.rm = TRUE),
  .by = group_var
)

# Arrange
df |> arrange(desc(value))
df |> arrange(group, desc(value))

# Slice
df |> slice_head(n = 5)
df |> slice_tail(n = 5)
df |> slice_sample(n = 10)
df |> slice_min(x, n = 3)
df |> slice_max(y, n = 5, with_ties = FALSE)
```

#### Grouped Operations
```r
# Group by
df |> 
  group_by(group1, group2) |>
  summarise(
    n = n(),
    mean_val = mean(value, na.rm = TRUE),
    .groups = "drop"
  )

# Multiple aggregations
df |> 
  group_by(group) |>
  summarise(
    across(where(is.numeric), list(
      mean = ~ mean(.x, na.rm = TRUE),
      sd = ~ sd(.x, na.rm = TRUE),
      n = ~ sum(!is.na(.x))
    ), .names = "{.col}_{.fn}"),
    .groups = "drop"
  )

# Rowwise operations
df |>
  rowwise() |>
  mutate(
    row_mean = mean(c_across(where(is.numeric))),
    n_missing = sum(is.na(c_across(everything())))
  ) |>
  ungroup()
```

#### Joins
```r
# Mutating joins
df1 |> left_join(df2, by = "id")
df1 |> right_join(df2, by = "id")
df1 |> inner_join(df2, by = "id")
df1 |> full_join(df2, by = "id")

# Filtering joins
df1 |> semi_join(df2, by = "id")    # Keep only matches
df1 |> anti_join(df2, by = "id")    # Keep only non-matches

# Multiple keys
df1 |> left_join(df2, by = c("id1" = "id1", "id2" = "id2"))

# Join with different column names
df1 |> left_join(df2, by = c("id" = "user_id"))
```

#### Window Functions
```r
df |>
  group_by(group) |>
  mutate(
    row_num = row_number(),
    lag_val = lag(value),
    lead_val = lead(value),
    cum_sum = cumsum(value),
    rolling_mean = slider::slide_dbl(value, mean, .before = 2),
    rank_val = rank(value),
    pct_rank = percent_rank(value)
  )
```

### 2.2 tidyr - Data Tidying

#### Pivoting
```r
# Wide to long
df_wide |> 
  pivot_longer(
    cols = starts_with("q"),
    names_to = "question",
    values_to = "response",
    names_prefix = "q_",
    names_transform = list(question = as.integer)
  )

# Long to wide
df_long |> 
  pivot_wider(
    names_from = question,
    values_from = response,
    values_fill = 0,
    values_fn = list(response = mean)
  )

# Multiple value columns
df |> 
  pivot_wider(
    names_from = metric,
    values_from = c(estimate, std_error),
    names_glue = "{metric}_{.value}"
  )
```

#### Separating/Uniting
```r
# Separate one column into multiple
df |> 
  separate(
    col = date,
    into = c("year", "month", "day"),
    sep = "-",
    convert = TRUE
  )

# Unite multiple columns into one
df |> 
  unite(
    col = "date",
    year, month, day,
    sep = "-",
    remove = FALSE
  )

# Extract with regex
df |> 
  extract(
    col = "date",
    into = c("year", "month", "day"),
    regex = "(\\d{4})-(\\d{2})-(\\d{2})",
    convert = TRUE
  )
```

#### Missing Values
```r
# Fill missing values
df |> 
  fill(col1, col2, .direction = "downup")

# Replace missing
df |> 
  replace_na(list(x = 0, y = "unknown"))

# Drop missing
df |> 
  drop_na(col1, col2)

# Replace with specific values
df |> 
  replace_na(list(
    numeric_col = 0,
    character_col = "missing",
    factor_col = "Unknown"
  ))
```

#### Nesting/Unnesting
```r
# Nest data frames
df |> 
  nest(data = c(x, y))

# Unnest
df |> 
  unnest(data)

# With purrr integration
df |> 
  nest(data = c(x, y)) |>
  mutate(
    model = map(data, ~ lm(y ~ x, data = .x)),
    tidied = map(model, broom::tidy)
  ) |>
  unnest(tidied)
```

### 2.3 readr - Data Import

#### Reading Files
```r
library(readr)

# CSV
df <- read_csv("file.csv")
df <- read_csv("file.csv", 
  col_types = cols(
    id = col_integer(),
    name = col_character(),
    date = col_date(format = "%Y-%m-%d"),
    value = col_double()
  ))

# Multiple files
files <- list.files("data/", pattern = "*.csv", full.names = TRUE)
df <- map_dfr(files, read_csv, .id = "source_file")

# Other formats
read_tsv("file.tsv")
read_delim("file.txt", delim = "|")
read_fwf("file.txt", fwf_widths(c(10, 20, 10)))
read_excel("file.xlsx", sheet = 1)
read_rds("model.rds")
```

#### Writing Files
```r
write_csv(df, "output.csv")
write_tsv(df, "output.tsv")
write_rds(model, "model.rds")
write_parquet(df, "data.parquet")  # via arrow
```

### 2.4 purrr - Functional Programming

#### Map Family
```r
library(purrr)

# Basic mapping
1:10 |> map(~ .x * 2)
list(a = 1, b = 2) |> map(~ .x * 2)

# Variants
map_dbl(1:10, ~ .x * 2)        # Returns double vector
map_chr(1:10, ~ as.character(.x))  # Returns character vector
map_lgl(1:10, ~ .x > 5)        # Returns logical vector
map_df(1:10, ~ tibble(x = .x))   # Returns data frame

# Map over multiple arguments
map2(x, y, ~ .x + .y)
pmap(list(x, y, z), ~ ..1 + ..2 + ..3)

# Walk (for side effects)
walk(1:5, print)
walk2(files, names, ~ write_csv(.x, .y))

# Iterate with index
imap(1:5, ~ paste(.y, .x))
imap_chr(named_list, ~ paste(.y, "=", .x))
```

#### Error Handling
```r
# Safe version
safe_read <- safely(read_csv)
result <- safe_read("file.csv")
if (is.null(result$error)) {
  data <- result$result
}

# Possibly - returns default on error
safe_read <- possibly(read_csv, otherwise = tibble())

# Quietly - captures output, messages, warnings
quiet_read <- quietly(read_csv)
result <- quiet_read("file.csv")
result$result
result$warnings
result$messages
result$output
```

#### Iteration Helpers
```r
# Reduce/accumulate
reduce(1:10, `+`)           # Sum: 55
accumulate(1:10, `+`)       # Cumulative: 1, 3, 6, 10, ...

# Keep/discard
keep(1:10, ~ .x > 5)        # 6, 7, 8, 9, 10
discard(1:10, ~ .x > 5)     # 1, 2, 3, 4, 5

# Compose/partial
fn <- compose(log, exp, sqrt)
partial(mean, na.rm = TRUE)
```

### 2.5 tibble - Modern Data Frames

```r
library(tibble)

# Create tibble
df <- tibble(
  x = 1:5,
  y = letters[1:5],
  z = c(TRUE, FALSE, TRUE, FALSE, TRUE)
)

# Convert
as_tibble(data.frame(x = 1:3))

# Row/column access
df[[1]]        # First column
df[[1, 1]]     # First row, first column
df$x           # Column by name
df[["x"]]      # Column by name (robust)

# Row operations
df[1, ]        # First row
slice(df, 1:3) # First 3 rows

# Printing
print(df, n = 10, width = Inf)
glimpse(df)    # Transposed view
```

### 2.6 stringr - String Manipulation

```r
library(stringr)

# Detection
str_detect("hello world", "world")      # TRUE
str_which(c("a", "b", "c"), "b")        # 2
str_count("ababab", "ab")               # 3

# Extraction
str_extract("abc123def", "[0-9]+")      # "123"
str_extract_all("a1b2c3", "[0-9]")      # "1", "2", "3"
str_match("abc123", "([a-z]+)([0-9]+)") # Matrix with groups

# Replacement
str_replace("hello world", "world", "R")      # "hello R"
str_replace_all("ababab", "a", "X")           # "XbXbXb"
str_replace_all(text, c("a" = "X", "b" = "Y"))

# Splitting
str_split("a,b,c", ",")
str_split_fixed("a,b,c", ",", n = 3)

# Case
str_to_lower("HELLO")
str_to_upper("hello")
str_to_title("hello world")
str_to_sentence("hello world. how are you?")

# Padding/trimming
str_pad("123", 5, "left", "0")      # "00123"
str_trim("  hello  ")               # "hello"
str_squish("  hello   world  ")     # "hello world"

# Case conversion
str_to_lower("HELLO")
str_to_upper("hello")
str_to_title("hello world")
str_to_sentence("hello world. how are you?")

# Regular expressions
str_detect(text, "\\d+")
str_replace_all(text, "\\s+", " ")
str_extract_all(text, "\\b\\w+\\b")
```

### 2.7 forcats - Factor Handling

```r
library(forcats)

# Reordering
f <- factor(c("a", "b", "c"))
fct_reorder(f, c(3, 1, 2))
fct_relevel(f, "c", "a")
fct_inorder(f)
fct_rev(f)

# Lumping
fct_lump(f, n = 2)           # Keep top 2, lump rest as "Other"
fct_lump_min(f, min = 5)     # Lump levels with < 5 obs
fct_lump_prop(f, prop = 0.1) # Lump levels < 10%

# Recoding
fct_recode(f, new_a = "a", new_b = "b")
fct_collapse(f, new_group = c("a", "b"))

# Missing values
fct_na_value_to_level(f, "Missing")
fct_explicit_na(f, na_level = "Missing")

# Inspection
fct_count(f)
fct_unique(f)
levels(f)
```

---

## 3. Extended Ecosystem

### 3.1 Data Import/Export
```r
# Fast I/O
library(data.table)    # fread/fwrite - fastest for large files
library(vroom)         # Fast CSV reading
library(arrow)         # Parquet/Feather (Apache Arrow)
library(duckdb)        # SQL on files
library(duckplyr)      # dplyr interface to DuckDB

# Databases
library(DBI)
library(RPostgres)
library(duckdb)
library(dbplyr)        # dplyr backend for databases
```

### 3.2 Data Quality & Validation
```r
library(janitor)        # Clean column names, tabyl
library(skimr)          # Quick data summaries
library(visdat)         # Visualize missing data
library(naniar)         # Missing data visualization
library(inspectdf)      # Quick dataframe inspection
library(pointblank)     # Data validation/testing
library(validate)       # Data validation rules
library(assertr)        # Assertive data validation
```

### 3.3 Visualization Extensions
```r
library(ggplot2)
library(patchwork)      # Combine plots
library(ggrepel)        # Non-overlapping labels
library(gghighlight)    # Highlight subsets
library(ggh4x)          # Extended facets/scales
library(ggtext)         # Rich text rendering
library(ggdist)         # Distributional visualizations
library(ggbeeswarm)     # Beeswarm plots
library(ggridges)       # Ridge plots
library(ggbeeswarm)     # Beeswarm plots
library(ggforce)        # Sina plots, hulls, etc.
library(ggh4x)          # Advanced faceting
library(ggtext)         # Rich text rendering
```

### 3.4 Statistical & Modeling
```r
# Tidymodels ecosystem
library(tidymodels)
library(tune)           # Hyperparameter tuning
library(finetune)       # Advanced tuning
library(modeltime)      # Time series forecasting
library(tidyposterior)  # Bayesian analysis

# Specialized
library(xgboost)
library(lightgbm)
library(ranger)         # Fast random forest
library(brulee)         # Neural networks

# Explainability
library(DALEX)          # Model explainability
library(vip)            # Variable importance
library(flashlight)     # Model agnostic explanations
library(DALEXtra)       # Extensions for DALEX
```

### 3.4 Specialized Domains
```r
# Text analysis
library(tidytext)       # Text mining
library(textdata)       # Text datasets
library(textrecipes)    # Text preprocessing for tidymodels

# Spatial
library(sf)             # Simple features
library(stars)          # Spatiotemporal arrays
library(tmap)           # Thematic maps
library(mapview)        # Interactive maps

# Time series
library(tsibble)        # Tidy time series
library(feasts)         # Feature extraction
library(fable)          # Forecasting
library(modeltime)      # Tidymodels for time series

# Networks
library(tidygraph)      # Graph manipulation
library(ggraph)         # Graph visualization

# Text
library(tidytext)       # Text mining
library(textdata)       # Text datasets
library(textrecipes)    # Text preprocessing for tidymodels
```

---

## 4. Best Practices & Patterns

### 4.1 Tidy Data Principles
```r
# Tidy data: each variable a column, each observation a row
# Example transformation pipeline
raw_data |> 
  read_csv() |>
  clean_names() |>
  pivot_longer(cols = -id, names_to = "variable", values_to = "value") |>
  mutate(
    value = as.numeric(value),
    category = factor(category)
  ) |>
  drop_na() |>
  group_by(category) |>
  summarise(mean_value = mean(value), .groups = "drop")
```

### 4.2 Piping Best Practices
```r
# Good: Clear, readable pipeline
data |> 
  filter(!is.na(x)) |>
  mutate(z = x * 2) |>
  group_by(group) |>
  summarise(mean_z = mean(z), .groups = "drop")

# Avoid: Overly long pipelines without intermediate variables
# Better: Break into logical steps with intermediate variables
clean_data <- raw_data |> 
  filter(!is.na(x)) |>
  mutate(z = x * 2)

summary_stats <- clean_data |> 
  group_by(group) |>
  summarise(mean_z = mean(z), .groups = "drop")
```

### 4.3 Error Handling in Pipelines
```r
# Use safely/possibly for robust pipelines
safe_model <- possibly(lm, otherwise = NULL)
models <- data |> 
  nest_by(group) |> 
  mutate(model = map(data, safely(lm, otherwise = NULL)))

# Extract successful models
successful <- models |> 
  filter(map_lgl(model, ~ !is.null(.x$result))) |>
  mutate(model = map(model, "result"))
```

---

## 5. Performance Tips

### 5.1 Efficient tidyverse Code
```r
# Use .by instead of group_by + summarise (dplyr 1.1+)
df |> summarise(mean = mean(x), .by = group)

# Use .by in mutate (dplyr 1.1+)
df |> mutate(mean_x = mean(x), .by = group)

# Vectorized operations instead of loops
# Slow
for (i in 1:nrow(df)) df$result[i] <- df$x[i] + df$y[i]

# Fast
df$result <- df$x + df$y

# Use data.table for very large data
library(data.table)
setDT(df)
dt[, new_col := x + y]
```

---

## 6. Migration Guides

### 6.1 From Base R to Tidyverse
| Base R | Tidyverse |
|--------|-----------|
| `subset(df, x > 0)` | `df %>% filter(x > 0)` |
| `df[df$x > 0, ]` | `df %>% filter(x > 0)` |
| `transform(df, z = x + y)` | `mutate(df, z = x + y)` |
| `aggregate(x ~ group, df, mean)` | `df %>% group_by(group) %>% summarise(mean = mean(x))` |
| `merge(df1, df2, by = "id")` | `left_join(df1, df2, by = "id")` |
| `reshape(data, direction = "long")` | `pivot_longer()` |
| `reshape(data, direction = "wide")` | `pivot_wider()` |

### 6.2 Common Gotchas
```r
# 1. Grouping persists!
df %>% group_by(g) %>% summarise(n = n())
# Still grouped! Use .groups = "drop" or ungroup()

# 2. Column names with spaces/special chars
df %>% select(`column name`)  # Backticks
df %>% .data[["column name"]] # .data pronoun

# 3. Column selection with strings
cols <- c("a", "b", "c")
df %>% select(all_of(cols))      # Error if missing
df %>% select(any_of(cols))      # Silent if missing

# 4. Rowwise vs vectorized
df %>% rowwise() %>% mutate(mean = mean(c(x, y)))  # Slow
df %>% mutate(mean = (x + y) / 2)                    # Fast
```

---

## 8. Resources & Learning

### Official Resources
- [Tidyverse website](https://www.tidyverse.org/)
- [R for Data Science (2nd ed.)](https://r4ds.hadley.nz/) - Free online book
- [Tidyverse Design Principles](https://design.tidyverse.org/)
- [Tidyverse Style Guide](https://style.tidyverse.org/)

### Package Documentation
- [ggplot2 Reference](https://ggplot2.tidyverse.org/reference/)
- [dplyr Reference](https://dplyr.tidyverse.org/reference/)
- [tidyr Reference](https://tidyr.tidyverse.org/reference/)
- [purrr Reference](https://purrr.tidyverse.org/reference/)

### Community
- [RStudio Community](https://community.rstudio.com/)
- [Stack Overflow - R](https://stackoverflow.com/questions/tagged/r)
- [R Weekly](https://rweekly.org/)
- [Tidyverse Twitter](https://twitter.com/tidyverse)

---

## Quick Reference Card

### dplyr One-Liners
```r
# Filter
filter(df, x > 0)
filter(df, between(x, 1, 10))
filter(df, if_any(everything(), is.na))

# Select
select(df, starts_with("x"))
select(df, where(is.numeric))
select(df, -ends_with("_id"))

# Mutate
mutate(df, z = x + y)
mutate(df, across(where(is.numeric), log))
mutate(df, .by = group, mean_x = mean(x))

# Summarise
summarise(df, n = n(), mean = mean(x), .by = group)
summarise(df, across(where(is.numeric), mean))

# Join
left_join(x, y, by = "id")
inner_join(x, y, by = c("id1", "id2"))

# Pivot
pivot_longer(df, cols = -id, names_to = "var", values_to = "val")
pivot_wider(df, names_from = var, values_from = val)

# Missing
fill(df, col, .direction = "downup")
drop_na(df, col)
replace_na(df, list(x = 0, y = "missing"))
```

---

## 9. Key Takeaways

1. **Tidy data first** - Each variable a column, each observation a row
2. **Use the pipe** (`|>`) for readable pipelines
3. **Prefer dplyr verbs** over base R equivalents
4. **Use tidyr** for reshaping data
7. **Leverage purrr** for iteration instead of loops
8. **Use tibbles** - modern, strict data frames
8. **Use readr/vroom** for fast I/O
9. **Combine with patchwork** for multi-panel plots
10. **Profile before optimizing** - premature optimization is the root of all evil