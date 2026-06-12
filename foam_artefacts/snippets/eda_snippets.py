import pandas as pd
import numpy as np
import json
import os
from datetime import datetime

def profile_dataset(filepath: str) -> None:
    df = pd.read_csv(filepath)

    print("=== DATASET PROFIKE ===\n")
    print(f"Rows: {df.shape[0]:,} | Columns: {df.shape[1]}")
    print(f"Memory usage: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB\n")

    summary = pd.DataFrame({
        "dtype": df.dtypes,
        "nulls": df.isnull().sum(),
        "null_%": (df.isnull().mean() * 100).round(2),
        "unique": df.nunique(),
        "sample": df.iloc[0]
    })

    print(summary.to_string())

## Call the function
profile_dataset("week20.csv")

def clean_dataset(
    df: pd.DataFrame,
    date_cols: list = None
) -> pd.DataFrame:
    """
    Clean common data type issues in a DataFrame.

    Parameters:
    df          : Input DataFrame
    date_cols   : Columns that should be parsed as datetime
    """

    # Parse date columns - invalid values become NaT instead of crashing
    if date_cols:
        for col in date_cols:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')

    # Fill numeric nulls with column median
    num_cols = df.select_dtypes(include=[np.number]).columns
    df[num_cols] = df[num_cols].fillna(df[num_cols].median())

    # Fill categorical nulls with 'Unknown'
    cat_cols = df.select_dtypes(include=['object']).columns
    df[cat_cols] = df[cat_cols].fillna('Unknown')

    return df

def flag_outliers(df: pd.DataFrame, multiplier: float = 1.5) -> pd.DataFrame:
    results = []
    numeric_cols = df.select_dtypes(include=np.number).columns

    for col in numeric_cols:
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3 - q1
        lower = q1 - multiplier * iqr
        upper = q3 + multiplier * iqr
        outlier_count = ((df[col] < lower) | (df[col] > upper)).sum()
        results.append({
            "column": col,
            "lower_bound": round(lower, 2),
            "upper_bound": round(upper, 2),
            "outlier_count": outlier_count,
            "outlier_%": round(outlier_count / len(df) * 100, 2)
        })

    return pd.DataFrame(results)

df = pd.read_csv("week20.csv")
print(flag_outliers(df).to_string(index=False))

def audo_eda(df: pd.DataFrame, corr_threshold: float = 0.8) -> pd.DataFrame:
    profile = pd.DataFrame({
        "dtype": df.dtypes,
        "nulls": df.isnull().sum(),
        "null_%": (df.isnull().mean() * 100).round(2),
        "unique": df.nunique(),
        "memory_MB": (df.memory_usage(deep=True) / 1024**2).round(4)
    })

    print("=== COLUMN PROFILE ===")
    print(profile.to_string())

    corr_matrix = df.corr(numeric_only=True).abs()
    upper_triangle = corr_matrix.where(
        np.triu(np.ones(corr_matrix.shape), k=1).astype(bool)
    )
    redundant_pairs = [
        (col, row, round(upper_triangle.loc[row, col], 3))
        for col in upper_triangle.columns
        for row in upper_triangle.index
        if upper_triangle.loc[row, col] > corr_threshold
    ]

    print(f"\n=== HIGHLY CORRELATED PAIRS (threshold: {corr_threshold}) ===")
    if redundant_pairs:
        for col_a, col_b, corr_val in redundant_pairs:
            print(f"  {col_a}  ↔  {col_b}  |  correlation: {corr_val}")
    else:
        print("  None found.")

    return profile

df = pd.read_csv("week20.csv")
auto_eda(df, corr_threshold=0.8)

def log_model_metrics(
    model_name: str,
    metrics: dict,
    log_file: str = "model_performance_log_json"
) -> None:
    entry = {
        "timestamp": datetime.now().isoformat(),
        "model": model_name,
        "metrics": metrics
    }

    if os.path.exists(log_file):
        with open(log_file, "r") as f:
            history = json.load(f)
    else:
        history = []

    history.append(entry)

    with open(log_file, "w") as f:
        json.dump(history, f, indent=2)

    print(f"Logged metrics  for '{model_name}' at {entry['timestamp']}")

# Classification model
