# Tidyverse Cheatsheet - Quick Reference

A quick reference for the most commonly used tidyverse functions and patterns.

---

## 1. Core Philosophy

**Tidy Data Principles:**
- Each variable is a column
- Each observation is a row
- Each value is a cell

**Pipe Operator:** `|>` (native R 4.1+) or `%>%` (magrittr)

---

## 1. dplyr - Data Manipulation

### Core Verbs (Single Table)

```r
# Filter rows
filter(df, condition)
filter(df, between(x, 1, 10))
filter(df, if_any(everything(), is.na))
filter(df, if_all(c(x, y), ~ . > 0))

# Select columns
select(df, starts_with("x"))
select(df, where(is.numeric))
select(df, -contains("id"))
select(df, name, everything())  # move to front
select(df, any_of(c("a", "b")))  # silent if missing

# Create/modify columns
mutate(df, z = x * 2)
mutate(df, across(where(is.numeric), ~ . * 2))
mutate(df, .by = group, mean_x = mean(x))

# Summarise
summarise(df, n = n(), mean = mean(x), .by = group)
summarise(df, across(where(is.numeric), list(mean = mean, sd = sd)))

# Arrange
arrange(df, desc(value))
arrange(df, group, desc(value))

# Slice
slice_head(df, n = 5)
slice_tail(df, n = 5)
slice_sample(df, n = 10)
slice_min(df, x, n = 3)
slice_max(df, y, n = 5, with_ties = FALSE)
```

### Grouped Operations
```r
# Group by
df |> group_by(g1, g2) |> summarise(n = n(), .groups = "drop")

# Multiple aggregations
df |>
  group_by(g) |>
  summarise(
    across(where(is.numeric), list(
      mean = ~ mean(.x, na.rm = TRUE),
      sd = ~ sd(.x, na.rm = TRUE)
    ), .names = "{.col}_{.fn}"),
    .groups = "drop"
  )

# Rowwise
df |> rowwise() |> mutate(mean = mean(c(x, y))) |> ungroup()
```

### Joins
```r
# Mutating joins
left_join(x, y, by = "id")
inner_join(x, y, by = "id")
full_join(x, y, by = "id")
right_join(x, y, by = "id")

# Filtering joins
semi_join(x, y, by = "id")   # keep only matches
anti_join(x, y, by = "id")   # keep non-matches

# Multiple keys / different names
left_join(x, y, by = c("id1" = "id1", "id2" = "id2"))
left_join(x, y, by = c("id" = "user_id"))
```

### Window Functions
```r
df |>
  group_by(group) |>
  mutate(
    row_num = row_number(),
    lag_val = lag(value),
    lead_val = lead(value),
    cum_sum = cumsum(value),
    rank_val = rank(value),
    pct_rank = percent_rank(value)
  )
```

---

## 2. tidyr - Data Tidying

### Pivoting
```r
# Wide to long
pivot_longer(
  cols = starts_with("q"),
  names_to = "question",
  values_to = "response",
  names_prefix = "q_",
  names_transform = list(question = as.integer)
)

# Long to wide
pivot_wider(
  names_from = question,
  values_from = response,
  values_fill = 0,
  values_fn = list(response = mean)
)

# Multiple value columns
pivot_wider(
  names_from = metric,
  values_from = c(estimate, se),
  names_glue = "{metric}_{.value}"
)
```

### Separating/Uniting
```r
separate(col, into = c("year", "month", "day"), sep = "-", convert = TRUE)
unite(col = "date", year, month, day, sep = "-")
extract(col, into = c("year", "month"), regex = "(\\d{4})-(\\d{2})", convert = TRUE)
```

### Missing Values
```r
fill(col1, col2, .direction = "downup")
replace_na(list(x = 0, y = "missing"))
drop_na(col1, col2)
```

### Nesting
```r
nest(data = c(x, y))           # nest
unnest(data)                   # unnest

# With purrr
nest(data = c(x, y)) |>
  mutate(model = map(data, ~ lm(y ~ x, data = .x)))
```

---

## 3. readr - Data Import/Export

### Reading
```r
read_csv("file.csv")
read_csv("file.csv", col_types = cols(
  id = col_integer(),
  name = col_character(),
  date = col_date(format = "%Y-%m-%d"),
  value = col_double()
))

# Multiple files
files <- list.files("data/", pattern = "*.csv", full.names = TRUE)
map_dfr(files, read_csv, .id = "source_file")

# Other formats
read_tsv("file.tsv")
read_delim("file.txt", delim = "|")
read_excel("file.xlsx", sheet = 1)
read_rds("model.rds")
```

### Writing
```r
write_csv(df, "output.csv")
write_tsv(df, "output.tsv")
write_rds(model, "model.rds")
write_parquet(df, "data.parquet")  # via arrow
```

---

## 4. purrr - Functional Programming

### Map Family
```r
map(1:10, ~ .x * 2)
map2(x, y, ~ .x + .y)
pmap(list(x, y, z), ~ ..1 + ..2 + ..3)

map_dbl(1:10, ~ .x * 2)
map_chr(1:10, ~ as.character(.x))
map_lgl(1:10, ~ .x > 5)
map_df(1:10, ~ tibble(x = .x))

# Variants
map_if(1:10, is_even, ~ .x * 2)
map_at(1:10, c(1, 3, 5), ~ .x * 2)
modify(1:10, ~ .x * 2)
```

### Error Handling
```r
safe_read <- safely(read_csv)
result <- safe_read("file.csv")
if (is.null(result$error)) data <- result$result

safe_read <- possibly(read_csv, otherwise = tibble())
quiet_read <- quietly(read_csv)
```

### Iteration Helpers
```r
reduce(1:10, `+`)        # 55
accumulate(1:10, `+`)    # 1, 3, 6, 10, 15, ...

keep(1:10, ~ .x > 5)     # 6, 7, 8, 9, 10
discard(1:10, ~ .x > 5)  # 1, 2, 3, 4, 5

compose(log, exp, sqrt)
partial(mean, na.rm = TRUE)
```

---

## 4. tibble - Modern Data Frames

```r
# Create
tibble(x = 1:5, y = letters[1:5])
tribble(~x, ~y, 1, "a", 2, "b")

# Convert
as_tibble(data.frame(x = 1:3))

# Properties
glimpse(df)
df[1, ]        # first row
df[[1]]        # first column
df$x           # column by name

# Row/column operations
add_row(df, x = 6, y = "f")
add_column(df, z = 1:5, .before = 1)
rowid_to_column(df, "id")
column_to_rownames(df, "id")
```

---

## 5. stringr - String Manipulation

```r
str_detect("hello world", "world")       # TRUE
str_which(c("a", "b", "c"), "b")         # 2
str_count("ababab", "ab")                # 3

str_extract("abc123", "[0-9]+")          # "123"
str_extract_all("a1b2c3", "[0-9]")       # "1", "2", "3"
str_match("abc123", "([a-z]+)([0-9]+)")  # matrix with groups

str_replace("hello world", "world", "R")     # "hello R"
str_replace_all("ababab", "a", "X")          # "XbXbXb"
str_replace_all(text, c("a" = "X", "b" = "Y"))

str_split("a,b,c", ",")
str_split_fixed("a,b,c", ",", n = 3)

str_to_lower("HELLO")
str_to_upper("hello")
str_to_title("hello world")
str_to_sentence("hello world. how are you?")

str_pad("123", 5, "left", "0")        # "00123"
str_trim("  hello  ")                 # "hello"
str_squish("  hello   world  ")       # "hello world"
```

---

## 5. forcats - Factor Handling

```r
fct_reorder(f, c(3, 1, 2))
fct_relevel(f, "c", "a")
fct_inorder(f)
fct_rev(f)

fct_lump(f, n = 2)           # keep top 2, lump rest as "Other"
fct_lump_min(f, min = 5)     # lump levels with < 5 obs
fct_lump_prop(f, prop = 0.1) # lump levels < 10%

fct_recode(f, new_a = "a", new_b = "b")
fct_collapse(f, new_group = c("a", "b"))

fct_na_value_to_level(f, "Missing")
fct_explicit_na(f, na_level = "Missing")

fct_count(f)
fct_unique(f)
```

---

## 6. ggplot2 Quick Reference

### Basic Structure
```r
ggplot(data, aes(x, y, color = group)) +
  geom_point() +
  scale_color_viridis_d() +
  labs(title = "Title", x = "X", y = "Y") +
  theme_minimal()
```

### Geoms
```r
geom_point(alpha = 0.6, size = 2)
geom_line(linewidth = 1, linetype = "dashed")
geom_col(fill = "steelblue")  # stat = "identity"
geom_bar(fill = "steelblue")  # counts
geom_histogram(bins = 30, fill = "steelblue")
geom_boxplot(outlier.shape = NA) + geom_jitter(width = 0.2)
geom_violin(fill = "steelblue", alpha = 0.5)
geom_smooth(method = "lm", se = FALSE, color = "red")
```

### Scales
```r
scale_color_viridis_d()       # discrete
scale_color_viridis_c()       # continuous
scale_color_brewer(palette = "Set1")
scale_fill_brewer(palette = "Set2")
scale_color_manual(values = c("A" = "red", "B" = "blue"))
scale_x_log10()
scale_y_continuous(labels = scales::percent)
scale_x_date(date_labels = "%b %Y", date_breaks = "1 month")
```

### Themes
```r
theme_bw()
theme_minimal()
theme_classic()
theme_void()

theme(
  plot.title = element_text(face = "bold", size = 16, hjust = 0.5),
  axis.text.x = element_text(angle = 45, hjust = 1),
  legend.position = "top",
  panel.grid.minor = element_blank()
)

theme_set(theme_minimal(base_size = 12, base_family = "Roboto Condensed"))
```

### Save
```r
ggsave("plot.png", width = 8, height = 6, dpi = 300)
ggsave("plot.pdf", width = 8, height = 6, device = cairo_pdf)
```

---

## Quick Reference: Key Functions by Task

| Task | Function |
|------|----------|
| **Filter rows** | `filter()`, `slice_*()` |
| **Select columns** | `select()`, `relocate()` |
| **Create columns** | `mutate()`, `across()`, `transmute()` |
| **Summarize** | `summarise()`, `count()`, `tally()` |
| **Group** | `group_by()`, `ungroup()`, `.by` |
| **Join** | `left_join()`, `inner_join()`, `bind_rows()` |
| **Reshape** | `pivot_longer()`, `pivot_wider()` |
| **Missing** | `fill()`, `replace_na()`, `drop_na()` |
| **Split/Combine** | `separate()`, `unite()`, `extract()` |
| **Nest/Unnest** | `nest()`, `unnest()` |
| **Read** | `read_csv()`, `read_parquet()`, `read_rds()` |
| **Write** | `write_csv()`, `write_parquet()`, `write_rds()` |
| **Map** | `map()`, `map2()`, `pmap()`, `imap()` |
| **Safe** | `safely()`, `possibly()`, `quietly()` |
| **Plot** | `ggplot() + geom_*() + scale_*() + theme_*()` |

---

*Last updated: 2024-11-04*
*Full tutorials available in: `Best Practices/`, `tidyverse/`, `tidymodels/`, `ggplot2/`*