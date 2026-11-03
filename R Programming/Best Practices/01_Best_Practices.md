# R Programming Best Practices

A comprehensive guide to modern R programming best practices, following the tidyverse style guide and modern R development practices.

## 1. Code Style & Formatting

### 1.1 Style Guides
Follow established style guides for consistency:

| Style Guide | Focus | Key Principles |
|-------------|-------|----------------|
| **Tidyverse Style Guide** | General R | 2-space indent, snake_case, explicit returns |
| **Google R Style Guide** | Production code | 2-space indent, snake_case, explicit types |
| **Coding Club** | Academic/Teaching | Clear, readable, well-commented |

### 1.2 Naming Conventions

| Object Type | Convention | Examples |
|-------------|------------|----------|
| **Variables/Functions** | snake_case | `user_data`, `calculate_mean()` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |
| **Packages** | lowercase | `ggplot2`, `dplyr` |
| **Classes (S3/S4)** | PascalCase | `MyModel`, `DataProcessor` |
| **Booleans** | `is_`, `has_`, `can_` prefix | `is_valid`, `has_data` |

### 1.3 File Organization
```
project/
├── R/                    # R scripts
│   ├── functions/        # Reusable functions
│   ├── scripts/          # Analysis scripts
│   └── utils/            # Utility functions
├── data/                 # Data files (gitignored)
│   ├── raw/              # Raw data (immutable)
│   ├── processed/        # Processed data
│   └── external/         # External data sources
├── data-raw/             # Scripts to generate processed data
├── tests/                # Unit tests (testthat)
├── docs/                 # Documentation (pkgdown)
├── renv.lock             # Dependency lockfile (renv)
├── .Rprofile             # Project-specific settings
├── .gitignore
├── README.md
├── DESCRIPTION           # Package metadata (if package)
└── _targets.R            # Targets pipeline (if using targets)
```

## 2. Modern R Development Workflow

### 2.1 Project Setup with renv
```r
# Initialize renv for reproducibility
install.packages("renv")
renv::init()

# Install packages
renv::install(c("tidyverse", "tidymodels", "ggplot2"))

# Snapshot dependencies
renv::snapshot()

# Later: restore exact environment
renv::restore()
```

### 2.2 Package Development with usethis
```r
# Create package structure
usethis::create_package("myPackage")
usethis::use_git()
usethis::use_github()
usethis::use_mit_license("Your Name")
usethis::use_roxygen_md()
usethis::use_testthat()
usethis::use_github_actions()
usethis::use_github_actions_badge("check-standard")

# Add dependencies
usethis::use_package("dplyr")
usethis::use_package("ggplot2", min_version = "3.4.0")
usethis::use_pipe()  # Enables |> pipe
```

### 2.3 Code Quality Tools
```r
# Linting
lintr::lint_dir("R/")
lintr::lint_dir("tests/")

# Formatting
styler::style_dir("R/")
styler::style_dir("tests/")

# Static analysis
goodpractice::gp()

# Test coverage
covr::package_coverage()
covr::report()
```

## 3. Modern R Syntax & Patterns

### 3.1 Native Pipe (R 4.1+)
```r
# Base pipe (R 4.1+)
data |> 
  dplyr::filter(x > 0) |>
  dplyr::mutate(z = x * 2) |>
  dplyr::summarise(mean_z = mean(z))

# vs magrittr pipe (still works)
library(magrittr)
data %>%
  dplyr::filter(x > 0) %>%
  dplyr::mutate(z = x * 2)
```

### 3.2 Native Append Pipe (R 4.2+)
```r
# For side effects (printing, plotting, writing)
data |> 
  dplyr::filter(x > 0) |>
  \(x) { print(head(x)); x }() |>
  dplyr::mutate(z = x * 2)
```

### 3.3 Modern Function Definitions
```r
# Explicit return (preferred)
calculate_summary <- function(data, group_var) {
  data |>
    dplyr::group_by({{ group_var }}) |>
    dplyr::summarise(
      n = dplyr::n(),
      mean_val = mean(value, na.rm = TRUE),
      .groups = "drop"
    )
}

# With type hints (R 4.0+ via roxygen2)
#' @param data A data frame
#' @param group_var <data-masking> Grouping variable
#' @return A tibble with summary statistics
#' @export
calculate_summary <- function(data, group_var) { ... }
```

### 3.4 Modern Data Frame Operations
```r
library(dplyr)
library(tibble)

# Tibbles (modern data frames)
df <- tibble::tibble(
  x = 1:5,
  y = letters[1:5],
  z = c(TRUE, FALSE, TRUE, FALSE, TRUE)
)

# Row-wise operations (modern approach)
df |>
  dplyr::rowwise() |>
  dplyr::mutate(
    combined = paste(letters, collapse = "-")
  ) |>
  dplyr::ungroup()

# Column-wise operations (modern)
df |>
  dplyr::mutate(
    dplyr::across(where(is.numeric), ~ .x * 2)
  )
```

### 3.5 Error Handling Patterns
```r
# Safe execution with purrr
library(purrr)

# Safely - returns list with result/error
safe_read <- purrr::safely(readr::read_csv)
result <- safe_read("data.csv")
if (is.null(result$error)) {
  data <- result$result
} else {
  warning("Failed to read: ", result$error$message)
}

# Possibly - returns default on error
safe_read <- purrr::possibly(readr::read_csv, otherwise = tibble::tibble())

# Possibly with custom error handling
safe_read <- purrr::possibly(
  readr::read_csv, 
  otherwise = NULL,
  quiet = FALSE
)

# Try-catch pattern for complex operations
tryCatch(
  {
    result <- risky_operation()
    success_result(result)
  },
  error = function(e) {
    logger::log_error("Operation failed: {e$message}")
    failure_result(e)
  },
  finally = cleanup_resources()
)
```

---

## 4. Code Organization Patterns

### 4.1 Function Design Principles
```r
# ✅ Good: Single responsibility, explicit arguments
calculate_user_metrics <- function(user_data, date_range = NULL) {
  # Validate inputs
  checkmate::assert_data_frame(user_data)
  checkmate::assert_subset(c("user_id", "date", "value"), names(user_data))
  
  # Process
  result <- user_data |>
    dplyr::filter(
      is.null(date_range) | (date >= date_range[1] & date <= date_range[2])
    ) |>
    dplyr::summarise(
      total = dplyr::n(),
      avg_value = mean(value, na.rm = TRUE),
      .by = user_id
    )
  
  return(result)
}

# ❌ Bad: Multiple responsibilities, hidden dependencies
bad_function <- function() {
  data <- read.csv("data.csv")  # Hidden dependency
  result <- process(data)
  write.csv(result, "output.csv")  # Side effect
  return(invisible(NULL))
}
```

### 4.2 Package Structure for Analysis Projects
```r
# R/analysis_functions.R
#' Calculate cohort retention
#' @param data User activity data
#' @param cohort_col Column defining cohorts
#' @param period_col Column defining time periods
#' @param value_col Metric to track
#' @return Cohort retention table
#' @export
calculate_retention <- function(data, cohort_col, period_col, value_col) {
  # Implementation
}

# R/utils.R
#' Safe percentage calculation
#' @param numerator Numerator
#' @param denominator Denominator
#' @param digits Decimal places
#' @return Formatted percentage string
#' @export
pct <- function(numerator, denominator, digits = 1) {
  if (denominator == 0) return("N/A")
  paste0(round(100 * numerator / denominator, digits), "%")
}

# R/constants.R
# Package constants
DEFAULT_TIMEOUT <- 30
MAX_RETRIES <- 3
SUPPORTED_FORMATS <- c("csv", "parquet", "json")
```

---

## 5. Testing with testthat

### 5.1 Unit Test Structure
```r
# tests/testthat/test-calculations.R
test_that("calculate_retention handles basic case", {
  test_data <- tibble::tibble(
    user_id = c(1, 1, 2, 2),
    cohort = c("A", "A", "B", "B"),
    period = c(1, 2, 1, 2),
    value = c(10, 5, 20, 10)
  )
  
  result <- calculate_retention(test_data, "cohort", "period", "value")
  
  expect_s3_class(result, "tbl_df")
  expect_equal(nrow(result), 2)
  expect_equal(result$retention_rate[1], 0.5)
})

test_that("calculate_retention handles empty data", {
  empty_data <- tibble::tibble(
    cohort = character(),
    period = integer(),
    value = numeric()
  )
  
  result <- calculate_retention(empty_data, "cohort", "period", "value")
  expect_equal(nrow(result), 0)
})

test_that("calculate_retention handles missing values", {
  data_with_na <- tibble::tibble(
    cohort = c("A", "A", NA),
    period = c(1, 2, 1),
    value = c(10, NA, 20)
  )
  
  expect_warning(result <- calculate_retention(test_data, "cohort", "period", "value"))
  expect_true(all(!is.na(result$retention_rate)))
})
```

### 5.2 Property-Based Testing
```r
# Property-based testing with quickcheck
test_that("calculate_retention is commutative for cohort order", {
  property <- function(data) {
    result1 <- calculate_retention(data, "cohort", "period", "value")
    # Shuffle cohort order
    shuffled <- data[sample(nrow(data)), ]
    result2 <- calculate_retention(shuffled, "cohort", "period", "value")
    expect_equal(result1, result2)
  }
  quickcheck::quickcheck(property, n = 100)
})
```

---

## 5. Performance & Memory Best Practices

### 5.1 Memory-Efficient Patterns
```r
# ❌ Bad: Copies data unnecessarily
bad_function <- function(data) {
  result <- data
  result$new_col <- result$x * 2
  result$another <- result$y * 3
  return(result)
}

# ✅ Good: Modify in place with data.table or mutate
efficient_function <- function(dt) {
  data.table::setDT(dt)
  dt[, new_col := x * 2]
  dt[, another := y * 3]
  return(dt)
}

# Use data.table for large datasets
library(data.table)
dt <- data.table::fread("large_file.csv")
dt[, new_col := x * 2]  # In-place modification
```

### 4.2 Parallel Processing
```r
# Parallel processing with furrr
library(furrr)
plan(multisession, workers = 4)

results <- future_map_dfr(large_list, process_item, .progress = TRUE)

# Or with future.apply
library(future.apply)
plan(multisession, workers = 4)
results <- future_lapply(large_list, process_item)
```

---

## 6. Documentation Standards

### 6.1 roxygen2 Documentation
```r
#' Calculate cohort retention rates
#'
#' Computes retention rates for user cohorts over time periods.
#' Supports multiple cohort definitions and flexible period definitions.
#'
#' @param data A data frame containing user activity data.
#' @param cohort_col <data-masking> Column defining cohort membership.
#' @param period_col <data-masking> Column defining time periods.
#' @param value_col <data-masking> Column containing the metric to track.
#' @param min_cohort_size Minimum cohort size to include (default: 10).
#'
#' @return A tibble with columns: cohort, period, n_users, retention_rate.
#' @export
#'
#' @examples
#' \dontrun{
#' data <- tibble::tibble(
#'   user_id = 1:100,
#'   cohort = sample(c("A", "B"), 100, replace = TRUE),
#'   period = rep(1:4, 25),
#'   value = rnorm(100)
#' )
#' calculate_retention(data, "cohort", "period", "value")
#' }
calculate_retention <- function(data, cohort_col, period_col, value_col,
                                min_cohort_size = 10) {
  # Implementation
}
```

---

## 6. Git & Collaboration Workflow

### 6.1 Git Workflow
```bash
# Feature branch workflow
git checkout -b feature/new-analysis
# Make changes
git add .
git commit -m "feat: add cohort retention analysis

- Add calculate_retention() function
- Add unit tests
- Update documentation"

# Push and create PR
git push origin feature/new-analysis
# Create PR via GitHub/GitLab

# Keep branch updated
git fetch origin
git rebase origin/main
```

### 8.2 Code Review Checklist
```markdown
# Code Review Checklist

## Functionality
- [ ] Code works as intended
- [ ] Edge cases handled (empty data, NA, extremes)
- [ ] Error messages are informative

## Style & Standards
- [ ] Follows tidyverse style guide
- [ ] Functions have roxygen2 documentation
- [ ] Snake_case for variables/functions
- [ ] No hardcoded paths or magic numbers

## Testing
- [ ] Unit tests added/updated
- [ ] Edge cases covered
- [ ] Tests pass locally

## Documentation
- [ ] roxygen2 docs complete
- [ ] README updated if needed
- [ ] CHANGELOG updated
```

---

## 7. Recommended Package Ecosystem

### Core Tidyverse
```r
# Core
library(tidyverse)  # Includes: ggplot2, dplyr, tidyr, readr, purrr, tibble, stringr, forcats

# Extended tidyverse
library(tidymodels)    # Modeling framework
library(tidytext)      # Text analysis
library(tidygraph)     # Graph analysis
library(tidycensus)    # Census data
```

### Data Import/Export
```r
# Fast I/O
library(data.table)    # fread/fwrite - fastest
library(vroom)         # Fast CSV reading
library(arrow)         # Parquet/Feather
library(duckdb)        # SQL on files

# Databases
library(DBI)
library(RPostgres)
library(duckdb)
library(dbplyr)        # dplyr backend for databases
```

### Visualization
```r
# Core
library(ggplot2)
library(patchwork)      # Combine plots
library(ggrepel)        # Non-overlapping labels
library(gghighlight)    # Highlight subsets
library(ggh4x)          # Extended facets/scales
library(ggtext)         # Rich text rendering
library(ggdist)         # Distributional visualizations
library(ggdist)         # Raincloud plots, etc.

# Interactive
library(plotly)
library(ggiraph)
library(ggiraph)
```

### Modeling & ML
```r
# Tidymodels ecosystem
library(tidymodels)
library(tune)           # Hyperparameter tuning
library(finetune)       # Advanced tuning
modeltime              # Time series forecasting
tidyposterior          # Bayesian analysis

# Specialized
library(xgboost)
library(lightgbm)
library(ranger)         # Fast random forest
library(brulee)         # Neural networks
```

### Utilities
```r
# Utilities
library(janitor)        # Clean column names, tabyl
library(skimr)          # Quick data summaries
library(visdat)         # Visualize missing data
library(naniar)         # Missing data visualization
library(inspectdf)      # Quick dataframe inspection
library(correlation)    # Correlation analysis
library(performance)    # Model performance metrics
library(see)            # Visualization for easystats
library(parameters)     # Parameter extraction
library(effectsize)     # Effect size computation
```

---

## 8. Configuration Files

### 9.1 .Rprofile (Project)
```r
# .Rprofile (project root)
options(
  repos = c(CRAN = "https://cloud.r-project.org"),
  repos = c(RENV = "https://rstudio.r-universe.dev"),
  Ncpus = parallel::detectCores() - 1,
  repos = c(CRAN = "https://cloud.r-project.org"),
  download.file.method = "libcurl",
  timeout = 300,
  mc.cores = parallel::detectCores() - 1,
  # Tidyverse options
  tidyverse.quiet = TRUE,
  dplyr.summarise.inform = FALSE,
  tibble.print_max = 20,
  tibble.print_min = 10,
  pillar.sigfig = 4,
  pillar.subtle = TRUE,
  pillar.bold = TRUE
)

# Auto-load packages in interactive sessions
if (interactive()) {
  suppressPackageStartupMessages({
    library(tidyverse)
    library(conflicted)
    conflict_prefer("filter", "dplyr")
    conflict_prefer("lag", "dplyr")
    conflict_prefer("select", "dplyr")
  })
}
```

### 9.2 .Renviron
```bash
# .Renviron (project root or ~/.Renviron)
# API Keys (never commit!)
GITHUB_PAT=ghp_xxxxxxxxxxxx
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_PAT=ghp_xxxxxxxxxxxx

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=analytics
DB_USER=analyst
DB_PASSWORD=******

# Cloud
AWS_DEFAULT_REGION=us-east-1
AWS_ACCESS_KEY_ID=******
AWS_SECRET_ACCESS_KEY=******

# R Settings
R_LIBS_USER=~/R/library
R_MAX_VSIZE=100Gb
```

### 9.3 .gitignore
```gitignore
# R
.Rproj.user
.Rhistory
.RData
.Ruserdata
*.Rproj

# renv
renv/library/
renv/python/

# Data
data/
*.csv
*.parquet
*.feather
*.rds
*.RData

# Output
output/
plots/
reports/
*.html
*.pdf

# IDE
.Rproj.user/
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Secrets
*.key
*.pem
.env
.Renviron
*.pem
```

---

## 10. Key Takeaways

1. **Use renv** for reproducible environments
2. **Follow tidyverse style** - snake_case, 2-space indent, explicit returns
3. **Use native pipe (|>)** - native, faster, no dependency
7. **Write tests first** - testthat with property-based testing
8. **Document with roxygen2** - every exported function
9. **Use renv + lockfile** for reproducibility
10. **Automate** - CI/CD, linting, formatting, testing
11. **Monitor performance** - profile before optimizing
12. **Document decisions** - ADR (Architecture Decision Records)

---

## 11. Quick Reference Card

| Task | Command |
|------|---------|
| **Init project** | `renv::init()` |
| **Add package** | `renv::install("pkg")` |
| **Lock deps** | `renv::snapshot()` |
| **Restore env** | `renv::restore()` |
| **Format code** | `styler::style_dir("R/")` |
| **Lint code** | `lintr::lint_dir("R/")` |
| **Run tests** | `testthat::test_local()` |
| **Check pkg** | `devtools::check()` |
| **Build site** | `pkgdown::build_site()` |
| **Update deps** | `renv::update()` |