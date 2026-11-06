# reticulate Cheatsheet - Quick Reference

Command-first reference for the **reticulate** package (R ↔ Python bridge).

> **Version:** reticulate 1.47.0 · **Docs:** <https://rstudio.github.io/reticulate/> · **Checked:** 2026-11-05

---

## 1. Setup & Environment

### Install and declare requirements

```r
install.packages("reticulate")
library(reticulate)

# Modern: declarative requirements, resolved with uv
py_require(c("numpy", "pandas", "scikit-learn"), python_version = ">=3.10,<3.13")
```

| Call | Purpose |
|------|---------|
| `py_require(packages, python_version, exclude_newer, action)` | Declare Python packages/version for the session |
| `py_require()` | Print the current manifest |
| `py_require(..., action = "set")` | Replace the manifest |
| `py_require(..., action = "remove")` | Remove exact entries |
| `py_require(exclude_newer = "2025-01-01")` | Refuse versions newer than a date |

```r
# Everything at once
py_require(
  packages = c("numpy>=1.26", "pandas", "scikit-learn"),
  python_version = "3.12",
  exclude_newer = "2025-06-01",
  action = "set"
)
```

**Rules**

- Declare before Python starts; requirements apply for the whole session.
- After initialization you can only **add** packages.
- Managed env is created on first `import()` / `py_eval()`.
- `RETICULATE_PYTHON="managed"` forces it; `RETICULATE_USE_MANAGED_VENV="no"` disables it.

### Point at an existing interpreter

```r
use_python("/usr/local/bin/python3")
use_virtualenv("~/venvs/analytics")
use_condaenv("r-nlp", required = TRUE)
```

| Function | Notes |
|----------|-------|
| `use_python(path)` | Specific binary |
| `use_virtualenv(name_or_path)` | `WORKON_HOME` defaults to `~/.virtualenvs` |
| `use_condaenv(name, conda = NULL)` | Uses conda on `PATH` unless `conda=` given |
| `required = FALSE` | Treat as a hint; no error if missing |

### Create and populate environments

```r
virtualenv_create("analytics", python = "python3.12")
virtualenv_install("analytics", c("numpy", "pandas"))
virtualenv_list()
virtualenv_remove("analytics")

conda_create("r-nlp", python_version = "3.12")
conda_install("r-nlp", c("numpy", "pandas"), channel = "conda-forge")
conda_list()

py_install(c("numpy", "pandas"))   # active env
py_list_packages()
```

### Discovery order (first match wins)

```
1. RETICULATE_PYTHON             (binary path; prescriptive)
2. RETICULATE_PYTHON_ENV         (env name/path)
3. use_*() with required = TRUE
4. RETICULATE_USE_MANAGED_VENV="yes"
5. VIRTUAL_ENV
6. Poetry / Pipfile / local venv / .venv
7. Package delay_load environments
8. RETICULATE_PYTHON_FALLBACK
9. r-reticulate env
10. Managed env (default), then system python/python3
```

> A stray `r-reticulate` env beats the default managed env. Check `py_config()` first when imports fail.

---

## 2. Diagnostics

```r
py_config()                  # active Python: version, binary, env, discovered installs
py_discover_config()         # what would be used, without initializing
py_available(initialize = TRUE)
py_numpy_available()
py_module_available("torch")
py_version()
py_exe()
```

> `py_config()`, `py_available(initialize = TRUE)`, and `py_module_available()` start Python. Call `py_require()` before any of them.

```r
py_require()                 # current requirements
sessioninfo::session_info("reticulate")
```

| Environment variable | Effect |
|----------------------|--------|
| `RETICULATE_PYTHON` | Pin a binary (errors if unusable) |
| `RETICULATE_PYTHON_ENV` | Pin an env name/path |
| `RETICULATE_PYTHON_FALLBACK` | Last-resort binary |
| `RETICULATE_USE_MANAGED_VENV` | `"yes"` prefer / `"no"` disable managed env |
| `UV_OFFLINE=1` | Resolve from uv cache |
| `UV_INDEX` | Extra package index (space-separated) |
| `UV_DEFAULT_INDEX` | Replace the default index |
| `UV_PRERELEASE=allow` | Allow prerelease resolution |

```r
# Clear the managed cache (destructive)
unlink(tools::R_user_dir("reticulate", "cache"), recursive = TRUE)
```

---

## 3. Imports

```r
np  <- import("numpy")
pd  <- import("pandas")
plt <- import("matplotlib.pyplot")
sk  <- import("sklearn.linear_model")

np$mean(c(1, 2, 3, 4))            # function
model <- sk$LinearRegression()    # class
model$fit(X, y)                   # method
np$pi                             # attribute
```

| Call | Purpose |
|------|---------|
| `import("mod")` | Import, convert results to R by default |
| `import("mod", convert = FALSE)` | Keep Python objects; convert with `py_to_r()` |
| `import("mod", as = "alias")` | Alias (mainly for package development) |
| `import("mod", delay_load = TRUE)` | Lazy import |
| `import_main()` | `__main__` module |
| `import_builtins()` | Python builtins (`len`, `open`, `print`, ...) |
| `import_from_path("mod", "path/")` | Import a module from a directory |

```r
np <- import("numpy", convert = FALSE)
a  <- np$arange(10L)
py_to_r(a)
```

---

## 4. Running Python Code

```r
source_python("python/helpers.py")     # objects into the calling env
add(5, 10)

py_run_file("python/pipeline.py")
py$result

py_run_string("
import math
area = math.pi * 2.5 ** 2
")
py$area

py_eval("2 ** 10")
py_eval("sum([1, 2, 3])")

repl_python()                          # interactive; type `exit` to return
```

| Function | Returns |
|----------|---------|
| `source_python(file)` | Side effect: objects in R env |
| `py_run_string(code)` | Side effect: objects in `py` |
| `py_run_file(file)` | Side effect: objects in `py` |
| `py_eval(expr)` | Evaluated result |
| `repl_python()` | Interactive console |

---

## 5. Accessing Objects

| Syntax | Where | Meaning |
|--------|-------|---------|
| `py$obj` | R code | Object from Python `__main__` |
| `r.obj` | Python code | R object from the calling environment |
| `mod$fn()` | R code | Python function/method |
| `mod$attr` | R code | Python attribute |
| `%as%` | R code | Alias for context managers |

```r
py$x                       # Python object in main module
py$model$coef_             # attribute of a Python object
```

```python
# In a Python chunk / REPL / py_run_string()
df = r.mtcars.copy()
```

Context manager:

```r
builtins <- import_builtins()
with(builtins$open("out.txt", "w") %as% f, {
  f$write("hello\n")
})
```

Iterators:

```r
it <- py_eval("iter([1, 2, 3])")
iterate(it, print)
results <- iterate(py_eval("(x * x for x in range(5))"))

while (!is.null(item <- iter_next(it))) {
  print(item)
}
```

---

## 6. Type Conversion

### Default mappings

| R → Python | Python → R |
|------------|------------|
| Length-1 vector → scalar | Scalar → length-1 vector |
| Multi-element vector → `list` | `list` → vector/list |
| Mixed-type list → `tuple` | `tuple` → list |
| Named list → `dict` | `dict` → named list |
| Matrix/array → NumPy `ndarray` | `ndarray` → matrix/array |
| `data.frame` → pandas `DataFrame` | `DataFrame` → `data.frame` |
| Function → callable | Custom class → R reference |
| Raw → `bytearray` | `None` → `NULL` |
| `TRUE`/`FALSE` → `True`/`False` | `bytes` → raw |

Special cases: factor → `Categorical`; `POSIXt` → `datetime64[ns]`; row names → pandas index.

### Explicit conversion

```r
r_to_py(x)          # R -> Python
py_to_r(x)          # Python -> R
tuple("a", "b")     # Python tuple
dict(a = 1L, b = 2) # Python dict
```

### Three gotchas

```r
# 1. Python is 0-based
np <- import("numpy", convert = FALSE)
a  <- np$array(c(10, 20, 30))
a$item(0L)                  # 10
a$item(2L)                  # 30

# 2. Integer arguments need L
foo$bar(index = 42L)        # correct
foo$bar(index = 42)         # TypeError risk

# 3. Length-1 vector is a scalar, not a list
api$call(names = "a")           # "a"
api$call(names = list("a"))     # ["a"]
```

### `convert = FALSE`

```r
pd <- import("pandas", convert = FALSE)
df <- pd$read_csv("data.csv")     # stays pandas
df$head()
out <- py_to_r(df)                # convert once
```

> With the default `convert = TRUE`, `pd$read_csv()` returns an R data frame immediately, so pandas methods are unavailable. Use `convert = FALSE` for multi-step Python work.

---

## 7. NumPy

```r
np <- import("numpy", convert = FALSE)

a <- np_array(1:8, dtype = "float16")
b <- np_array(1:8, order = "C")        # C order
c <- np_array(1:8, order = "F")        # Fortran order

m <- np_array(1:12, dtype = "int64")
m$reshape(c(3L, 4L))

array_reshape(1:12, dim = c(3, 4))              # C order
array_reshape(1:12, dim = c(3, 4), order = "F") # Fortran order
```

| Task | Code |
|------|------|
| Create from R vector | `np_array(x, dtype = "float64")` |
| Reshape (R side) | `array_reshape(x, dim = c(3, 4))` |
| Reshape (Python side) | `a$reshape(c(3L, 4L))` |
| Element | `a$item(0L)` |
| Sum / mean | `np$sum(a)`, `np$mean(a)` |
| Matrix inverse | `np$linalg$inv(A)` |
| Dot product | `np$dot(A, B)` |

**Memory order:** R is column-major; NumPy defaults to row-major. R matrices map to NumPy in Fortran order without a copy. If shapes look transposed, you mixed orders.

```r
# Pure computation: default conversion returns R objects
np <- import("numpy")
np$mean(c(1, 2, 3, 4))
np$std(c(1, 2, 3, 4), ddof = 1L)
```

---

## 8. pandas

```r
pd <- import("pandas", convert = FALSE)

df <- pd$DataFrame(dict(
  id    = c(1L, 2L, 3L),
  group = c("a", "a", "b"),
  value = c(10.5, 12.1, 7.8)
))

df$head()
df$shape
df$columns$tolist()
df$dtypes
```

| Task | Code |
|------|------|
| Read CSV | `pd$read_csv("file.csv")` |
| Write CSV | `df$to_csv("out.csv", index = FALSE)` |
| Filter | `df$query("value > 8")` |
| Select columns | `df$filter(items = c("a", "b"))` |
| New column | `df$assign(total = df$a + df$b)` |
| Group + aggregate | `df$groupby("g")$value$mean()` |
| Named aggregation | `df$groupby("g")$agg(dict(value = "sum"))` |
| Sort | `df$sort_values("value", ascending = FALSE)` |
| Reset index | `df$reset_index(drop = TRUE)` |
| Rename | `df$rename(columns = dict(old = "new"))` |
| Missing values | `df$dropna()`, `df$fillna(0)` |
| To R | `py_to_r(df)` |

```r
# R data frame -> pandas
py_df <- r_to_py(mtcars)
py_df$shape
```

```r
# Nullable dtypes (pd.NA instead of NaN)
options(reticulate.pandas_use_nullable_dtypes = TRUE)
```

---

## 9. R Markdown & Quarto

````markdown
```{r setup}
library(reticulate)
py_require(c("pandas", "matplotlib"))
```

```{python}
import pandas as pd
df = pd.DataFrame({"x": [1, 2, 3], "y": [4, 5, 6]})
df.describe()
```

```{r}
py$df          # Python -> R
```

```{python}
r.mtcars.head()   # R -> Python
```
````

| Item | Value |
|------|-------|
| Engine enabled | knitr ≥ 1.18 + reticulate installed |
| Python chunk | `{python}` |
| Python → R | `py$object` in R chunks |
| R → Python | `r.object` in Python chunks |
| Disable engine | `{python, python.reticulate = FALSE}` |
| Session | All Python chunks share one session |
| Errors | Fail the knit; debug with `py_last_error()` |

**Quarto:** same chunk syntax; add `#|` options. Declare dependencies in the first Python chunk or a project setup file.

**Matplotlib:** call `plt$show()` to emit a figure; use `plt$close()` in loops.

---

## 10. Functions, Callbacks & Pickles

```r
# R function as a Python callback
py_run_string("def apply_twice(f, x): return f(f(x))")
double <- function(x) x * 2
py$apply_twice(double, 5)         # 20

# Strict signature checking
wrapped <- py_func(function(a, b = 1.5) a + b)

# Background-thread callbacks
safe <- py_main_thread_func(function(x) x + 1)

# Generators from R
i <- 0
gen <- py_iterator(function() {
  i <<- i + 1
  if (i <= 3) i else NULL
})

# Pickle
py_save_object(obj, "model.pkl")
obj <- py_load_object("model.pkl")
```

| Function | Purpose |
|----------|---------|
| `py_func(f)` | Wrap R function with matching Python signature |
| `py_main_thread_func(f)` | Marshal callbacks onto R's main thread |
| `py_iterator(f, completed = NULL)` | R function → Python iterator |
| `py_save_object(x, file)` | Pickle a Python object |
| `py_load_object(file)` | Unpickle |

---

## 11. Output, Seeds & Low-Level Access

```r
np <- import("numpy", convert = FALSE)

out <- py_capture_output(print(py$df))
py_suppress_warnings(np$array(c(1, 2)) / 0)

py_set_seed(42)                    # Python + NumPy seeds
py_help(np$mean)
py_str(obj)
py_repr(obj)
py_len(obj)
py_bool(obj)
py_id(obj)
```

| Function | Purpose |
|----------|---------|
| `py_capture_output(expr)` | Capture stdout/stderr as a character vector |
| `py_suppress_warnings(expr)` | Silence Python warnings |
| `py_set_seed(seed)` | Set Python and NumPy RNG seeds |
| `py_help(x)` | Print Python docs |
| `py_str(x)` / `py_repr(x)` | `str()` / `repr()` |
| `py_len(x)` / `py_bool(x)` | `len()` / `bool()` |
| `py_has_attr(x, "a")` | Attribute check |
| `py_get_attr(x, "a")` | Get attribute |
| `py_set_attr(x, "a", v)` | Set attribute |
| `py_list_attributes(x)` | List attributes |
| `py_call(f, ...)` | Call a Python callable |

---

## 12. Debugging

```r
py_config()
py_last_error()
py_last_error()$message
py_last_error()$traceback
py_last_error()$r_trace$full_call
py_clear_last_error()
```

```r
tryCatch(
  risky_python_call(),
  error = function(e) {
    message(conditionMessage(e))
    print(py_last_error())
  }
)
```

| Symptom | Fix |
|---------|-----|
| `ModuleNotFoundError` | `py_install("pkg")` or add to `py_require()`; check `py_config()` |
| `TypeError: ... integer` | Add `L` to the argument |
| `IndexError` / off-by-one | Python is 0-based |
| Transposed dimensions | Fix C vs Fortran order |
| Wrong interpreter | `py_config()`; remove `r-reticulate` if unwanted |
| `py_require()` ignored | Python already initialized; restart R |
| Can't change/remove package | Start a new session |
| Knit-only failure | Put setup in the document's first chunk |
| Matplotlib hangs | Non-interactive backend or `plt$close()` |

---

## 13. Common Patterns

### Call a Python script from R

```r
source_python("python/clean.py")
clean_df(raw_df)
```

### Keep data in Python, plot in R

```r
pd <- import("pandas", convert = FALSE)
df <- pd$read_csv("sales.csv")
agg <- df$groupby("region")$revenue$sum()$reset_index()
ggplot(py_to_r(agg), aes(region, revenue)) + geom_col()
```

### Pass a scalar where a list is required

```r
api$predict(features = list(1.0, 2.0, 3.0))
```

### Pass an integer index

```r
model$predict(X, n = 1L)
```

### Suppress Python startup noise in a report

```r
invisible(py_require(c("numpy", "pandas")))
```

### Reproducible header for a script

```r
library(reticulate)
py_require(
  packages = c("numpy==2.1.3", "pandas==2.2.3", "scikit-learn==1.5.2"),
  python_version = "3.12",
  action = "set"
)
```

---

## 14. Do / Don't

| ✅ Do | ❌ Don't |
|-------|---------|
| Call `py_require()` before first Python use | Add requirements after Python starts and expect a rebuild |
| Use `convert = FALSE` for multi-step pandas/NumPy work | Call pandas methods on auto-converted data frames |
| Use `42L` for integer arguments | Rely on doubles being accepted |
| Translate indices at the boundary | Mix 0-based and 1-based indexing silently |
| Convert once at the end of a pipeline | Round-trip large objects repeatedly |
| Keep Python code in `python/*.py` | Bury logic in long `py_run_string()` blocks |
| Pin versions/date for reproducibility | Depend on "latest" in production |
| Use `with(... %as% f, ...)` for resources | Leave files/connections open |

---

## 15. Quick Reference Card

```r
# Setup
library(reticulate)
py_require(c("numpy", "pandas"), python_version = "3.12")
py_config()

# Import
np <- import("numpy", convert = FALSE)
pd <- import("pandas", convert = FALSE)

# Run
source_python("script.py")
py_run_string("x = 1 + 1")
py_eval("2 ** 10")

# Access
py$x
py$model$coef_

# Convert
r_to_py(df)
py_to_r(obj)
np_array(x, dtype = "float64")

# Debug
py_last_error()
py_help(np$mean)
```

---

**Related notes:** [reticulate Tutorial](01_reticulate_Tutorial.md) · [R Index](../00_Index.md) · [Free R Books](../09_Free_R_Books.md)
