# Python Best Practices

A comprehensive guide to modern Python development best practices for data science, following modern Python standards and the Python Enhancement Proposals (PEPs).

---

## 1. Project Setup & Environment Management

### 1.1 Python Version & Virtual Environments
```bash
# Use Python 3.11+ for modern features
python --version  # Should be 3.11+

# Option 1: uv (fastest, recommended)
curl -LsSf https://astral.sh/uv/install.sh | sh
uv venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate  # Windows

# Option 2: Standard venv
python -m venv .venv
source .venv/bin/activate

# Option 3: conda (for heavy ML dependencies)
conda create -n ml-env python=3.11
conda activate ml-env
```

### 1.2 Dependency Management with uv (Recommended)
```bash
# Initialize project
uv init myproject
cd myproject

# Add dependencies (fast!)
uv add pandas polars numpy duckdb plotnine scikit-learn xgboost lightgbm

# Add dev dependencies
uv add --dev pytest pytest-cov ruff mypy pre-commit

# Lock & sync
uv lock
uv sync

# Add package later
uv add scikit-learn

# Export for Docker/CI
uv export --format requirements.txt > requirements.txt
```

### 1.3 Alternative: Poetry
```bash
poetry new myproject
cd myproject
poetry add pandas polars numpy duckdb plotnine scikit-learn
poetry add --group dev pytest pytest-cov ruff mypy pre-commit
poetry install
```

### 1.4 pyproject.toml Template
```toml
[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "myproject"
version = "0.1.0"
description = "Data science project"
readme = "README.md"
requires-python = ">=3.11"
dependencies = [
    "numpy>=1.26",
    "pandas>=2.1",
    "polars>=0.20",
    "duckdb>=0.9",
    "plotnine>=0.13",
    "scikit-learn>=1.3",
    "xgboost>=2.0",
    "lightgbm>=4.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4",
    "pytest-cov>=4.1",
    "ruff>=0.1",
    "mypy>=1.5",
    "pre-commit>=3.5",
]

[tool.ruff]
line-length = 88
target-version = "py311"
select = ["E", "F", "I", "UP", "W"]
ignore = ["E501"]

[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true

[tool.pytest.ini_options]
addopts = "-v --cov=src --cov-report=term-missing"
testpaths = ["tests"]

[tool.pytest.ini_options]
addopts = "-v --cov=src --cov-report=term-missing"
```

---

## 2. Modern Python Syntax & Patterns (3.11+)

### 2.1 Type Hints (PEP 484, 585, 604)
```python
from __future__ import annotations
from typing import TYPE_CHECKING
from collections.abc import Sequence, Mapping
from typing import Annotated, Literal, TypeAlias

if TYPE_CHECKING:
    import pandas as pd
    import polars as pl

# Modern type hints (Python 3.9+)
def process_data(
    df: "pd.DataFrame",
    columns: list[str],
    threshold: float = 0.5,
    method: Literal["mean", "median"] = "mean",
) -> "pd.DataFrame":
    ...

# Type aliases
DataFrame: TypeAlias = "pd.DataFrame"
NumericArray: TypeAlias = "np.ndarray[tuple[int, ...], np.dtype[np.float64]]"

# Annotated for metadata
UserID: TypeAlias = Annotated[int, "User identifier, positive integer"]
```

### 2.2 Structural Pattern Matching (Python 3.10+)
```python
def process_data(data: object) -> str:
    match data:
        case list() as items if len(items) > 0:
            return f"List with {len(items)} items"
        case {"type": "pandas", "data": pd.DataFrame() as df}:
            return f"DataFrame with {len(df)} rows"
        case {"type": "polars", "data": pl.DataFrame() as df}:
            return f"DataFrame with {df.height} rows"
        case _:
            return "Unknown format"
```

### 2.3 Modern Data Class Patterns
```python
from dataclasses import dataclass, field
from typing import Optional

@dataclass(kw_only=True, slots=True)
class ModelConfig:
    name: str
    learning_rate: float = 0.01
    epochs: int = 100
    callbacks: list[str] = field(default_factory=list)
    metadata: dict[str, str] = field(default_factory=dict)

    def __post_init__(self):
        if self.learning_rate <= 0:
            raise ValueError("learning_rate must be positive")

# Usage
config = ModelConfig(name="xgboost", learning_rate=0.1, epochs=200)
```

---

## 3. Project Structure

### 3.1 Recommended Project Layout
```
project/
├── src/
│   └── mypackage/
│       ├── __init__.py
│       ├── config.py
│       ├── data/
│       │   ├── __init__.py
│       │   ├── loader.py
│       │   └── validator.py
│       ├── features/
│       │   ├── __init__.py
│       │   └── builder.py
│       ├── models/
│       │   ├── __init__.py
│       │   ├── trainer.py
│       │   └── predictor.py
│       └── utils/
│           ├── __init__.py
│           └── metrics.py
├── tests/
│   ├── __init__.py
│   ├── unit/
│   │   ├── test_loader.py
│   │   └── test_features.py
│       └── integration/
├── data/                 # gitignored
│   ├── raw/
│   ├── processed/
│   └── external/
├── notebooks/            # Exploration only
├── scripts/              # One-off scripts
├── configs/              # YAML/JSON configs
├── docs/                 # Documentation
├── .github/workflows/    # CI/CD
├── .github/dependabot.yml
├── pyproject.toml
├── README.md
├── .gitignore
├── .pre-commit-config.yaml
├── .python-version
└── uv.lock / poetry.lock
```

---

## 4. Code Quality & Formatting

### 4.1 Ruff (Fast Linter/Formatter)
```bash
# Install
uv add --dev ruff

# Config in pyproject.toml
[tool.ruff]
line-length = 100
target-version = "py311"
select = ["E", "F", "I", "UP", "W", "C4", "N"]
ignore = ["E501", "B008"]
fixable = ["ALL"]
unfixable = []

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
skip-magic-trailing-comma = false
```

```bash
# Run
ruff check .          # Lint
ruff check --fix .    # Auto-fix
ruff format .         # Format
```

### 3.2 Type Checking with mypy
```bash
uv add --dev mypy

# pyproject.toml
[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
ignore_missing_imports = true

# Run
mypy src/
```

### 3.3 Pre-commit Hooks
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.5.0
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.10.0
    hooks:
      - id: mypy
        args: [--strict]

  - repo: https://github.com/psf/black
    rev: 24.3.0
    hooks:
      - id: black
        language_version: python3.11
```

---

## 4. Testing Strategy

### 5.1 pytest Configuration
```python
# tests/conftest.py
import pytest
import pandas as pd
import numpy as np
import polars as pl

@pytest.fixture
def sample_df() -> pd.DataFrame:
    return pd.DataFrame({
        "x": np.random.randn(100),
        "y": np.random.randn(100),
        "group": np.random.choice(["A", "B"], 100)
    })

@pytest.fixture
def pl_sample_df() -> pl.DataFrame:
    return pl.DataFrame({
        "x": np.random.randn(100),
        "group": pl.Series(["A", "B"] * 50)
    })

# tests/test_features.py
def test_feature_builder(sample_df: pd.DataFrame):
    from mypackage.features.builder import build_features
    result = build_features(sample_df)
    assert "new_feature" in result.columns
    assert len(result) == len(sample_df)

# Property-based testing
from hypothesis import given, strategies as st

@given(st.data())
def test_feature_builder_properties(data: st.DataObject):
    df = data.draw(st.data_frames(
        columns=[
            st.column("x", dtype=float),
            st.column("group", dtype=str),
        ]
    ))
    result = build_features(df)
    assert "new_feature" in result.columns
```

### 5.2 Coverage & CI
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v3
        with: {python-version: "3.11"}
      - name: Install
        run: uv sync --all-extras
      - name: Lint
        run: uv run ruff check .
      - name: Type check
        run: uv run mypy src/
      - name: Test
        run: uv run pytest --cov=src --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 5. Documentation

### 6.1 Docstrings (Google/NumPy Style)
```python
def train_model(
    X: np.ndarray,
    y: np.ndarray,
    *,
    model_type: Literal["rf", "xgb", "lgbm"] = "rf",
    n_estimators: int = 100,
    random_state: int | None = 42,
) -> tuple[BaseEstimator, dict[str, float]]:
    """Train a classification model with cross-validation.

    Args:
        X: Feature matrix of shape (n_samples, n_features).
        y: Target vector of shape (n_samples,).
        model_type: Model algorithm to use.
        n_estimators: Number of trees/iterations.
        random_state: Random seed for reproducibility.

    Returns:
        Tuple of (fitted_model, cv_scores_dict).

    Raises:
        ValueError: If model_type is not supported.

    Example:
        >>> model, scores = train_model(X, y, model_type="xgb")
        >>> print(scores["roc_auc"])
        0.92
    """
    ...
```

### 6.2 API Documentation with pdoc/mkdocstrings
```bash
# pdoc
uv add --dev pdoc
uv run pdoc -o docs/api src/mypackage

# Or mkdocs + mkdocstrings
uv add --dev mkdocs mkdocstrings[python]
# mkdocs.yml configured
uv run mkdocs serve
```

---

## 5. Data Handling Best Practices

### 5.1 Pandas vs Polars Decision Guide
```python
# Use Pandas when:
# - Small to medium data (< 1GB)
# - Complex indexing/label-based operations
# - Integration with matplotlib/seaborn
# - Mature ecosystem needed

import pandas as pd
df = pd.read_parquet("data.parquet")

# Use Polars when:
# - Large datasets (> 1GB)
# - Performance critical
# - Parallel processing needed
# - Lazy evaluation preferred

import polars as pl
df = pl.read_parquet("data.parquet")
df.lazy()  # Lazy evaluation

# Interoperability
df_pl = pl.from_pandas(pd_df)
df_pd = df_pl.to_pandas()
```

### 5.2 Data Validation
```python
from pydantic import BaseModel, Field, field_validator
from typing import Optional

class DataRecord(BaseModel):
    user_id: int = Field(gt=0)
    timestamp: datetime
    value: float = Field(ge=0, le=1000)
    category: str = Field(min_length=1, max_length=50)

    @field_validator("timestamp")
    @classmethod
    def validate_timestamp(cls, v: datetime) -> datetime:
        if v > datetime.now():
            raise ValueError("Timestamp cannot be in future")
        return v

# Validate batch
records = [DataRecord(**row) for row in df.to_dict("records")]
```

---

## 6. Performance Optimization

### 6.1 NumPy/Pandas Optimization
```python
# Vectorized operations (fast)
df["new_col"] = df["a"] * df["b"] + df["c"]

# Avoid apply with lambda (slow)
# Slow
df["result"] = df.apply(lambda row: complex_func(row.a, row.b), axis=1)

# Fast: vectorize or use numba
from numba import jit

@jit(nopython=True)
def fast_func(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    return a * b + np.sin(a)

# Polars lazy evaluation
lf = pl.scan_parquet("data.parquet")
result = (
    lf.filter(pl.col("value") > 0)
    .group_by("category")
    .agg(pl.col("value").mean())
    .collect()
)
```

### 6.2 Memory Management
```python
# Downcast dtypes
def optimize_dtypes(df: pd.DataFrame) -> pd.DataFrame:
    for col in df.select_dtypes(include=["int64"]).columns:
        col_min, col_max = df[col].min(), df[col].max()
        if col_min >= -128 and col_max <= 127:
            df[col] = df[col].astype("int8")
        elif col_min >= -32768 and col_max <= 32767:
            df[col] = df[col].astype("int16")
        # ... similarly for float32

    for col in df.select_dtypes(include=["float64"]).columns:
        df[col] = df[col].astype("float32")

    # Categorical for low cardinality
    for col in df.select_dtypes(include=["object"]).columns:
        if df[col].nunique() / len(df) < 0.5:
            df[col] = df[col].astype("category")
    return df
```

---

## 7. Configuration Management

### 7.1 Hydra/OmegaConf
```python
# config.yaml
model:
  _target_: xgboost.XGBClassifier
  n_estimators: 100
  max_depth: 6
  learning_rate: 0.1

data:
  path: "s3://bucket/data/train.parquet"
  target: "target"
  test_size: 0.2

# train.py
import hydra
from omegaconf import DictConfig, OmegaConf

@hydra.main(version_base=None, config_path="conf", config_name="config")
def train(cfg: DictConfig) -> None:
    print(OmegaConf.to_yaml(cfg))
    model = hydra.utils.instantiate(cfg.model)
    # ...
```

---

## 8. Key Takeaways

1. **Use `uv`** for fast, reliable dependency management
2. **Type hints everywhere** - catch bugs early, enable IDE support
3. **Ruff + mypy + pre-commit** = automated quality
4. **Pydantic for validation** - parse, don't validate
6. **Polars for scale** - Pandas for compatibility
7. **Type hints everywhere** - enable IDE support, catch bugs
8. **Test with hypothesis** - property-based testing finds edge cases
8. **Document with docstrings** - NumPy style, render with pdoc/mkdocs
9. **CI/CD from day one** - GitHub Actions + Ruff + MyPy + PyTest
10. **Profile before optimizing** - `cProfile`, `snakeviz`, `memray`

---

## Quick Reference Card

| Task | Command |
|------|--------|
| **Init project** | `uv init` |
| **Add package** | `uv add pkg` |
| **Add dev pkg** | `uv add --dev pkg` |
| **Lock deps** | `uv lock` |
| **Sync env** | `uv sync` |
| **Format** | `ruff format .` |
| **Lint** | `ruff check . --fix` |
| **Type check** | `mypy src/` |
| **Test** | `pytest -xvs` |
| **Coverage** | `pytest --cov=src --cov-report=term-missing` |
| **Build docs** | `pdoc -o docs src/` or `mkdocs serve` |
| **Pre-commit** | `pre-commit install && pre-commit run --all-files` |