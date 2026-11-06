# reticulate Tutorial - Python from R

A practical guide to calling Python from R with the **reticulate** package: environment setup, imports, type conversion, NumPy/pandas interoperability, R Markdown/Quarto integration, and reproducible project workflows.

> **Package version:** reticulate 1.47.0 · **Docs:** <https://rstudio.github.io/reticulate/> · **Checked:** 2026-11-05

---

## 1. Why reticulate?

reticulate embeds a Python session inside your R session. You get:

- Access to Python libraries with no R equivalent (PyTorch, scikit-learn, spaCy, transformers, geopandas).
- Bidirectional object access: R objects are visible from Python chunks via `r.`, Python objects via `py$`.
- Automatic conversion for vectors, lists, data frames, NumPy arrays, and pandas DataFrames.
- One workflow for scripts, R Markdown, Quarto, Shiny, and R packages.

**Mental model:** reticulate is a bridge, not a translator. Objects cross the bridge by conversion or by reference. A Python object that has no R equivalent stays a *reference* to the live Python object.

```r
library(reticulate)

os <- import("os")
os$getcwd()          # call a Python function
os$listdir(".")      # returns an R character vector
```

---

## 2. Installation

```r
# Install reticulate (uvr, pak, or base R all work)
install.packages("reticulate")
# pak::pak("r-lib/reticulate")   # development version
```

You do **not** need to install Python yourself for the modern workflow. Since reticulate 1.41, `py_require()` can download a Python interpreter and create an ephemeral virtual environment using the bundled [`uv`](https://docs.astral.sh/uv/) resolver.

```r
library(reticulate)

py_require(c("numpy", "pandas"))
py_config()          # show which Python was selected
```

The first call that touches Python (`import()`, `py_eval()`, etc.) creates and activates the environment. Expect a one-time download on a fresh machine.

### Check your setup

```r
py_available(initialize = TRUE)   # is a Python session usable?
py_version()                      # "3.12.7 (main, ...)"
py_exe()                          # path to the interpreter
py_module_available("numpy")      # is a specific module importable?
py_numpy_available()
```

> These calls initialize Python. Finish all `py_require()` declarations first, because after initialization you can only add packages.

---

## 3. Managing Python environments

### 3.1 Modern approach: `py_require()`

`py_require()` declares **requirements**, not a specific interpreter. reticulate resolves them into a managed environment.

```r
py_require(
  packages = c("numpy>=1.26", "pandas", "scikit-learn"),
  python_version = ">=3.10,<3.13"
)
```

| Argument | Purpose |
|----------|---------|
| `packages` | Character vector; supports version constraints, extras (`"jax[cpu]"`), git URLs, and local paths |
| `python_version` | Version constraint string, e.g. `">=3.9,<3.13"` |
| `exclude_newer` | Refuse package versions published after a date — a lightweight lockfile |
| `action` | `"add"` (default), `"remove"`, or `"set"` (replace the whole manifest) |

Inspect the current manifest:

```r
py_require()   # list with python_version, packages, exclude_newer, history
```

Freeze package versions by date for reproducibility:

```r
py_require(
  packages = c("numpy", "pandas"),
  python_version = "3.12",
  exclude_newer = "2025-01-01",
  action = "set"
)
```

**Important sequencing rules**

- `py_require()` must run **before** Python is initialized for full effect.
- Once Python is running, you may only **add** packages. Removing packages, changing the Python version, or changing `exclude_newer` requires a fresh R session.
- Requirements are session-scoped, so put them at the top of your script, in a setup chunk, or in `.Rprofile`.

### 3.2 Managed environment controls

| Setting | Effect |
|---------|--------|
| `Sys.setenv(RETICULATE_PYTHON = "managed")` | Force the `py_require()` ephemeral environment |
| `Sys.setenv(RETICULATE_USE_MANAGED_VENV = "yes")` | Prefer the managed env early in discovery |
| `Sys.setenv(RETICULATE_USE_MANAGED_VENV = "no")` | Disable managed environments entirely |
| `Sys.setenv(UV_OFFLINE = "1")` | Resolve from the uv cache when offline |
| `unlink(tools::R_user_dir("reticulate", "cache"), recursive = TRUE)` | Clear downloaded Python, uv, and environments |

> `unlink()` is destructive: it deletes cached interpreters, `uv`, and every ephemeral environment. Use it only when you deliberately want a clean slate.

### 3.3 Classic approach: point at an existing interpreter

Use these when your organisation supplies Python, or when you need a named conda/virtualenv shared with other tools.

```r
use_python("/usr/local/bin/python3")     # explicit binary
use_virtualenv("~/venvs/analytics")      # virtualenv name or path
use_condaenv("r-nlp", required = TRUE)   # conda env
```

Create and populate environments from R:

```r
virtualenv_create("analytics", python = "python3.12")
virtualenv_install("analytics", c("numpy", "pandas"))

conda_create("r-nlp", python_version = "3.12")
conda_install("r-nlp", c("numpy", "pandas"), channel = "conda-forge")

py_install(c("numpy", "pandas"))         # into the active env
py_list_packages()                        # inventory
```

### 3.4 Order of discovery

reticulate picks the first match:

1. `RETICULATE_PYTHON` (a binary path — prescriptive, no fallback).
2. `RETICULATE_PYTHON_ENV` (env name or path).
3. `use_python()` / `use_virtualenv()` / `use_condaenv()` with `required = TRUE`.
4. Managed env when `RETICULATE_USE_MANAGED_VENV="yes"`.
5. An activated `VIRTUAL_ENV`.
6. Poetry (`pyproject.toml`), pipenv (`Pipfile`), then a local `venv`/`.venv`.
7. Package-declared envs (`import(..., delay_load = ...)`).
8. `RETICULATE_PYTHON_FALLBACK`, then an existing `r-reticulate` env.
9. Managed env by default, then system `python`/`python3`.

This is why a stray `r-reticulate` environment can quietly override your `py_require()` calls. Inspect with `py_config()` and remove the offender:

```r
virtualenv_remove("r-reticulate")
```

---

## 4. Importing and calling Python

```r
np  <- import("numpy")
pd  <- import("pandas")
plt <- import("matplotlib.pyplot")

# Functions
np$mean(c(1, 2, 3, 4))

# Classes and methods
sk <- import("sklearn.linear_model")
model <- sk$LinearRegression()
model$fit(matrix(c(1, 2, 3, 4), ncol = 1), c(2, 4, 6, 8))
model$coef_

# Attributes use the same $ syntax
np$pi
```

### Import options

```r
# Keep everything as Python objects; convert explicitly later
np <- import("numpy", convert = FALSE)
a  <- np$arange(10L)
py_to_r(a)

# Alias a module
sk <- import("sklearn", as = "sk")

# Defer the import (useful inside packages)
tf <- import("tensorflow", delay_load = TRUE)

# Builtins and the main module
builtins <- import_builtins()
main     <- import_main()
```

`import_from_path()` loads a module from an arbitrary file:

```r
mymod <- import_from_path("helpers", path = "python/")
mymod$clean_text("  Hello  ")
```

---

## 5. Running Python code

### 5.1 `source_python()` — source a script into R

Given `python/helpers.py`:

```python
def add(x, y):
    return x + y

def scale(values, factor=2.0):
    return [v * factor for v in values]
```

```r
source_python("python/helpers.py")
add(5, 10)                 # 15
scale(c(1, 2, 3), 10)      # 10 20 30
```

Objects created at the top level of the script become available in the calling environment (control this with `envir =`).

### 5.2 `py_run_string()` / `py_run_file()`

```r
py_run_string("
import math
radius = 2.5
area = math.pi * radius ** 2
")

py$area        # access the Python main module
py$radius
```

```r
py_run_file("python/pipeline.py")
py$result
```

### 5.3 `py_eval()` — evaluate an expression

```r
py_eval("2 ** 10")
py_eval("sum([1, 2, 3])")
```

### 5.4 `repl_python()` — interactive Python console

```r
repl_python()
```

Inside the REPL, `exit` returns to R. Objects you create in the REPL persist for the session, and `r.` gives access to R objects:

```python
>>> import pandas as pd
>>> df = r.mtcars
>>> df.head()
>>> exit
```

> In RStudio, the Python console opened by `repl_python()` is separate from the R console. In VS Code and Positron, use the integrated terminal/console behaviour of the IDE.

---

## 6. Type conversion

### 6.1 Default mappings

| R | Python |
|---|--------|
| Single-element vector (`1`, `"a"`, `TRUE`) | Scalar |
| Multi-element vector (`c(1, 2, 3)`) | `list` |
| List of mixed types | `tuple` |
| Named list (`list(a = 1L)`) | `dict` |
| Matrix / array | NumPy `ndarray` |
| Data frame | pandas `DataFrame` |
| Function | Python callable |
| Raw vector | `bytearray` |
| `NULL` / `TRUE` / `FALSE` | `None` / `True` / `False` |

Going the other way, Python scalars, lists, dicts, tuples, NumPy arrays, and pandas DataFrames map back to their R equivalents. Other Python classes return an R reference to the live object.

### 6.2 The three classic gotchas

**1. Zero-based indexing**

```r
np <- import("numpy", convert = FALSE)
a  <- np$array(c("a", "b", "c"))

a$item(0L)         # "a" — first element
a$item(2L)         # "c"
```

The same applies to any Python method that takes an index: Python counts from 0, R counts from 1.

**2. Integer arguments need `L`**

R's `42` is a double; Python APIs that type-check often reject it.

```r
foo$bar(index = 42L)     # correct
foo$bar(index = 42)      # may raise TypeError
```

**3. A length-one vector becomes a scalar, not a list**

```r
# Wrong: passes the string "a"
api$call(names = "a")

# Right: passes ["a"]
api$call(names = list("a"))
```

Related helpers:

```r
tuple("a", "b", "c")             # Python tuple
dict(foo = "bar", index = 42L)   # Python dict
r_to_py(x)                       # explicit R -> Python
py_to_r(x)                       # explicit Python -> R
```

### 6.3 Preserving Python objects

Use `convert = FALSE` on `import()` when you want to stay in Python and convert only at the boundary. This is faster and avoids lossy round-trips for large objects.

```r
np <- import("numpy", convert = FALSE)
a  <- np$arange(1e6)
b  <- a$reshape(c(1000L, 1000L))
m  <- py_to_r(b$mean())
```

---

## 7. NumPy and arrays

### 7.1 Layout matters

R arrays are **column-major** (Fortran order); NumPy defaults to **row-major** (C order). reticulate maps R matrices directly to NumPy memory in Fortran order, and returns a column-ordered copy when converting back.

```r
x <- matrix(1:6, nrow = 2)
np <- import("numpy", convert = FALSE)

a <- np$array(x)                       # Fortran-order view of R memory
b <- np_array(x, dtype = "float64")    # explicit conversion, C order by default
```

### 7.2 Creating and reshaping

```r
a <- np_array(1:8, dtype = "float16")
b <- np_array(1:8, order = "C")

# Reshape R-side (note the integer dimensions)
m <- np_array(1:12, dtype = "int64")
m$reshape(c(3L, 4L))

# array_reshape() uses C order by default, like NumPy's reshape
array_reshape(1:12, dim = c(3, 4))
array_reshape(1:12, dim = c(3, 4), order = "F")
```

**Rule of thumb:** if dimensions look transposed after a round-trip, you mixed C and Fortran order. Decide once whether you are "R-shaped" or "NumPy-shaped" and reshape at the boundary.

### 7.3 NumPy in practice

With the default `convert = TRUE`, NumPy results come back as R objects:

```r
np <- import("numpy")

x <- c(1, 2, 3, 4)
np$mean(x)
np$std(x, ddof = 1L)
np$linalg$inv(matrix(c(2, 0, 0, 4), nrow = 2))
```

Use `convert = FALSE` when you want to call ndarray methods:

```r
np <- import("numpy", convert = FALSE)

a <- np$array(c(1, 2, 3, 4), dtype = "float64")
b <- a$reshape(c(2L, 2L))
py_to_r(b$sum())
```

---

## 8. pandas DataFrames

Data frames convert automatically in both directions: an R `data.frame` becomes a pandas `DataFrame`, and a pandas `DataFrame` returned to R becomes a `data.frame`.

```r
pd <- import("pandas")

df <- pd$DataFrame(dict(
  id    = c(1L, 2L, 3L),
  group = c("a", "a", "b"),
  value = c(10.5, 12.1, 7.8)
))

class(df)      # "data.frame" — converted on return
```

That automatic behaviour is convenient at a boundary but surprising in the middle of a pandas workflow: `pd$read_csv()` immediately returns an R data frame, so pandas methods are no longer available. **Import pandas with `convert = FALSE` whenever you plan to do several pandas operations.**

```r
pd <- import("pandas", convert = FALSE)

df <- pd$DataFrame(dict(
  id    = c(1L, 2L, 3L),
  group = c("a", "a", "b"),
  value = c(10.5, 12.1, 7.8)
))

df$head()
means <- df$groupby("group")$value$mean()
py_to_r(means)
```

R factors become pandas `Categorical`; `POSIXt` becomes `datetime64[ns]`. Row names become the pandas index.

### 8.1 Convert deliberately

```r
# R -> pandas
py_df <- r_to_py(mtcars)
py_df$shape

# pandas -> R (once, at the end of the pipeline)
result <- py_to_r(df$query("value > 8")$reset_index(drop = TRUE))
class(result)          # "data.frame"
```

### 8.2 Keep it as pandas

```r
pd <- import("pandas", convert = FALSE)
df <- pd$read_csv("data/sales.csv")

# ... pandas operations ...

sales <- py_to_r(df)   # convert once, at the end
```

### 8.3 Missing values

R's `NA` maps to `NaN`/`NaT` for NumPy-backed columns. For true nullable dtypes (`pd.NA`), opt in:

```r
options(reticulate.pandas_use_nullable_dtypes = TRUE)
r_to_py(data.frame(x = c(NA, 1L, 2L)))
```

### 8.4 A complete pipeline

```r
pd <- import("pandas", convert = FALSE)

sales <- pd$read_csv("data/sales.csv")
sales <- sales$assign(month = sales$date$str$slice(0L, 7L))

grouped <- sales$groupby(c("month", "region"))
monthly <- grouped$agg(dict(revenue = "sum", units = "sum"))
monthly <- monthly$reset_index()

monthly_r <- py_to_r(monthly)

library(ggplot2)
ggplot(monthly_r, aes(month, revenue, fill = region)) +
  geom_col(position = "dodge") +
  theme_minimal()
```

> reticulate does support `$` chaining across lines when the `$` ends the line, but long chains produce poor error messages. Assigning intermediate objects makes each step inspectable.

---

## 9. R Markdown and Quarto

With knitr ≥ 1.18, the reticulate Python engine is enabled automatically whenever reticulate is installed. No `library(reticulate)` call is required, though adding it to the setup chunk is harmless and explicit.

````markdown
---
title: "Mixed R and Python"
output: html_document
---

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
# Python objects are available through py$
py$df
```

```{python}
# R objects are available through r.
r.mtcars.head()
```
````

Key points:

- All Python chunks share one Python session, so objects persist across chunks.
- `py$object` accesses Python objects from R chunks; `r.object` accesses R objects from Python chunks.
- Chunk options (`echo`, `eval`, `include`, `fig.width`, ...) work as usual.
- Python exceptions fail the knit; see §13 for debugging.
- To disable the engine for a chunk: `{python, python.reticulate = FALSE}`.

### Quarto

````markdown
```{python}
#| label: load-data
#| echo: true
import pandas as pd
df = pd.read_csv("data/sales.csv")
```

```{r}
#| label: plot
library(ggplot2)
ggplot(py$df, aes(month, revenue)) + geom_col()
```
````

Quarto requires reticulate for Python chunks. Declare dependencies in the document's first Python chunk (or in a project-level setup file) with `py_require()`.

### Matplotlib output

```python
import matplotlib.pyplot as plt
plt.plot([1, 2, 3], [4, 5, 6])
plt.show()
```

In knitr/Quarto, `plt.show()` is captured as a figure. In an interactive R session, it opens a separate window (or the IDE's plot pane, depending on device configuration). Close figures with `plt$close()` when generating many plots in a loop.

---

## 10. Calling R from Python

Inside a Python chunk, the `repl_python()` REPL, or code run with `py_run_string()`, `r.` is the bridge:

```python
import pandas as pd
df = r.mtcars.copy()
df["hp_per_cyl"] = df["hp"] / df["cyl"]
df.head()
```

To pass an R **function** as a Python callback:

```r
py_run_string("def apply_twice(f, x): return f(f(x))")

double <- function(x) x * 2
py$apply_twice(double, 5)      # 20
```

For libraries that inspect callback signatures strictly, wrap with `py_func()`:

```r
wrapped <- py_func(function(a, b = 1.5) a + b)
```

For callbacks invoked from Python background threads, `py_main_thread_func()` ensures the R function is always called on R's main thread.

Generators and iterators:

```r
it <- py_eval("iter([1, 2, 3])")
iterate(it, print)       # 1 2 3
results <- iterate(py_eval("(x * x for x in range(5))"))
```

Context managers use `%as%`:

```r
builtins <- import_builtins()
with(builtins$open("output.txt", "w") %as% f, {
  f$write("Hello from R\n")
})
```

---

## 11. Worked example: scikit-learn from R

A small regression model, trained in Python, evaluated in R.

```r
library(reticulate)

py_require(c("scikit-learn", "numpy"), python_version = ">=3.10")

set.seed(42)
n <- 200
x <- rnorm(n)
y <- 3 + 2 * x + rnorm(n, sd = 0.5)

py_run_string("
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

X = np.asarray(r.x, dtype=float).reshape(-1, 1)
y = np.asarray(r.y, dtype=float)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42
)

model = LinearRegression().fit(X_train, y_train)
pred = model.predict(X_test)

mse = mean_squared_error(y_test, pred)
r2 = r2_score(y_test, pred)
coef = float(model.coef_[0])
intercept = float(model.intercept_)
")

py$coef          # close to 2
py$intercept     # close to 3
py$mse
py$r2

# Bring predictions back for R-side diagnostics
pred_df <- data.frame(
  actual = py$y_test,
  predicted = py$pred
)

head(pred_df)
```

**Why split inside Python?** It keeps array shapes and dtypes under Python's control, avoids 0-based/1-based index translation, and reduces copies. Convert only the results you need in R.

You can also keep the fitted model as a reference and call it later:

```r
new_x <- matrix(c(1.5, -0.5, 2.0), ncol = 1)
py$model$predict(np_array(new_x, dtype = "float64"))
```

---

## 12. Worked example: pandas cleaning, R plotting

```r
library(reticulate)
library(ggplot2)

py_require(c("pandas", "numpy"))

pd  <- import("pandas", convert = FALSE)
df  <- pd$read_csv("data/orders.csv")

df <- df$assign(
  order_date = pd$to_datetime(df$order_date),
  revenue = df$quantity * df$unit_price
)

summary <- df$
  query("status == 'completed'")$
  groupby(pd$Grouper(key = "order_date", freq = "MS"))$
  agg(dict(revenue = "sum", order_id = "nunique"))$
  reset_index()$
  rename(columns = dict(order_id = "orders"))

summary_r <- py_to_r(summary)

ggplot(summary_r, aes(order_date, revenue)) +
  geom_line(linewidth = 1) +
  geom_point(aes(size = orders), alpha = 0.7) +
  scale_y_continuous(labels = scales::label_dollar()) +
  labs(
    title = "Monthly revenue",
    x = NULL, y = NULL, size = "Orders"
  ) +
  theme_minimal()
```

Note the mixed style: pandas does the heavy aggregation; ggplot2 does the presentation. This is often the most productive split.

---

## 13. Debugging and troubleshooting

### Inspect the environment first

```r
py_config()                 # version, binary, env, discovered installs
py_discover_config()        # what would be used, without initializing
py_exe()
py_version()
py_module_available("torch")
```

### Read the Python error

```r
np <- import("numpy")

tryCatch(
  np$linalg$inv(np$array(matrix(c(1, 1, 1, 1), nrow = 2))),
  error = function(e) {
    print(conditionMessage(e))
    print(py_last_error())
  }
)

py_clear_last_error()
```

`py_last_error()` returns a named list with `type`, `value`, `traceback`, `message`, and `r_trace`. `message` is the full formatted exception (including the Python traceback); `r_trace` records the R call stack that led to the failing call.

### Help and introspection

```r
py_help(np$mean)            # Python docstring
py_str(obj)                 # str(obj)
py_repr(obj)                # repr(obj)
py_len(obj)
py_bool(obj)
py_list_attributes(obj)
py_has_attr(obj, "shape")
```

### Common failures

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `ModuleNotFoundError` | Package not in the *active* env | `py_install("pkg")` or add to `py_require()`; check `py_config()` |
| `TypeError: 'float' object cannot be interpreted as an integer` | Missing `L` suffix | Use `42L` |
| `IndexError` / off-by-one results | 0-based Python indexing | Subtract 1 from R indices; use `0L` for the first element |
| Dimensions transposed | C vs Fortran order | Reshape explicitly with `np_array()` / `array_reshape()` |
| Wrong Python selected | Earlier entry in discovery order (often `r-reticulate`) | `py_config()`, then `virtualenv_remove("r-reticulate")` |
| `py_require()` ignored | Python already initialized | Restart R; declare requirements first |
| Cannot remove/change a package | Python already initialized | Start a new session |
| Knit fails only in R Markdown | Python env differs from interactive session | Put `py_require()`/`use_*()` in the setup chunk |
| Matplotlib window hangs a script | Interactive backend | Use a non-interactive backend or `plt$close()` |

### Reproducible bug reports

```r
sessioninfo::session_info("reticulate")
py_config()
py_require()
```

---

## 14. Reproducibility and deployment

### 14.1 Lock the Python side

`py_require()` is declarative but not a lockfile: it resolves the newest matching versions unless constrained. Combine constraints with `exclude_newer`:

```r
py_require(
  packages = c("numpy==2.1.3", "pandas==2.2.3", "scikit-learn==1.5.2"),
  python_version = "3.12",
  action = "set"
)
```

Or pin by date, which is easier to maintain:

```r
py_require(
  packages = c("numpy", "pandas", "scikit-learn"),
  exclude_newer = "2025-06-01"
)
```

### 14.2 Use renv for R, `py_require()` for Python

```r
renv::init()   # pins R packages; Python is managed separately
```

Put the declaration in a file that every entry point sources:

```r
# R/python-setup.R
reticulate::py_require(
  packages = c("numpy", "pandas", "scikit-learn"),
  python_version = "3.12",
  exclude_newer = "2025-06-01"
)
```

```r
# script.R
source("R/python-setup.R")
library(reticulate)
```

### 14.3 Pin an interpreter in CI

Managed environments download Python at first use, which is convenient locally but slow and network-dependent in CI. For deterministic CI, create the environment once and pin it:

```r
# CI setup step
reticulate::virtualenv_create("ci-env", python = "python3.12")
reticulate::virtualenv_install("ci-env", c("numpy==2.1.3", "pandas==2.2.3"))
```

```ini
# .Renviron in CI
RETICULATE_PYTHON=/path/to/ci-env/bin/python
```

`RETICULATE_PYTHON` is prescriptive: if the path is wrong, reticulate errors instead of silently falling back. That is exactly what you want in CI.

### 14.4 In an R package

Declare Python dependencies in `.onLoad()` so they are registered before any Python call:

```r
.onLoad <- function(libname, pkgname) {
  reticulate::py_require(c("numpy>=1.26", "pandas"))
}
```

Use `delay_load = TRUE` on `import()` inside packages to avoid initializing Python at load time, and wrap optional dependencies with `py_module_available()` checks.

---

## 15. Best practices

1. **Declare requirements at the top.** Call `py_require()` before the first Python touch.
2. **Convert at the boundary, not in the middle.** Keep data in one representation for a block of work.
3. **Prefer `convert = FALSE` for big objects.** Avoid copying a 2 GB DataFrame twice.
4. **Use `L` for every Python integer argument.** Make it a habit.
5. **Remember Python is 0-based.** Translate indices at the boundary and document it.
6. **Keep Python scripts in `python/`.** `source_python()` is easier to test and review than long `py_run_string()` blocks.
7. **Do not mix environments mid-session.** Choose managed or pinned, then stay there.
8. **Record the Python version** in your README or `DESCRIPTION` comments; `sessioninfo` does not capture it fully.
9. **Handle errors explicitly** with `tryCatch()` and surface `py_last_error()`.
10. **Close resources.** Use `with(... %as% f, ...)` for files and connections.

---

## 16. Exercises

1. **Warm-up.** Import `math`, compute `sqrt(2)` and `factorial(10)`, and confirm the types returned in R.
2. **Conversion.** Create an R list `list(a = 1L, b = "x", c = TRUE)` and pass it to a Python function that prints `type(obj)`. Explain the result.
3. **Indexing.** Build a Python list of five cities. Retrieve the first and last elements with a Python expression (`cities[0]`, `cities[-1]`) and from R with NumPy's `item()`. Note where 0-based indexing appears.
4. **NumPy.** Create a 3×4 R matrix, convert it with `np_array()`, and compute row and column means in Python. Verify the shapes and explain the memory-order choice.
5. **pandas.** Read a CSV with pandas, filter rows, group and aggregate, convert the result to an R data frame, and plot it with ggplot2.
6. **R Markdown.** Write a document with an R chunk that creates a data frame, a Python chunk that fits a model on `r.df`, and an R chunk that prints `py$model$coef_`.
7. **Reproducibility.** Write a `py_require()` call that pins Python 3.12 and package versions as of a fixed date. Run it in a fresh session and inspect `py_require()`.
8. **Debugging.** Deliberately pass `42` instead of `42L` to a NumPy reshape, capture the error with `tryCatch()`, and print `py_last_error()`.

---

## 17. References

- reticulate documentation: <https://rstudio.github.io/reticulate/>
- Calling Python from R: <https://rstudio.github.io/reticulate/articles/calling_python.html>
- Python version configuration: <https://rstudio.github.io/reticulate/articles/versions.html>
- Installing Python packages: <https://rstudio.github.io/reticulate/articles/python_packages.html>
- R Markdown Python engine: <https://rstudio.github.io/reticulate/articles/r_markdown.html>
- Arrays in R and Python: <https://rstudio.github.io/reticulate/articles/arrays.html>
- `py_require()` reference: <https://rstudio.github.io/reticulate/reference/py_require.html>
- uv documentation: <https://docs.astral.sh/uv/>

---

**Related notes:** [reticulate Cheatsheet](02_reticulate_Cheatsheet.md) · [R Index](../00_Index.md) · [Free R Books](../09_Free_R_Books.md)
