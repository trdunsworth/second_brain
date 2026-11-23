# 12 Types of Data Analysis — Applied to 9-1-1 Dispatch Data

**Source**: LinkedIn post by Dawn Choo — "12 types of data analysis everyone should know"  
**Data Files**: 
- `oz_test_incidents.csv` — 1,000+ individual incident records with timestamps, agencies, priorities, response time components
- `oz_test_hourly_call_counts.csv` — 168 hourly rows (7 days × 24 hours) of 9-1-1 and non-emergency call volumes, answer rates, abandonment

**Target Audiences**: Executive Staff, Operational Management, Shift Supervisors, Analysts/Researchers

---

## Table of Contents

1. [Descriptive Analysis](#1-descriptive-analysis)
2. [Exploratory Data Analysis (EDA)](#2-exploratory-data-analysis-eda)
3. [Correlation Analysis](#3-correlation-analysis)
4. [Regression Analysis](#4-regression-analysis)
5. [Hypothesis Testing](#5-hypothesis-testing)
6. [Time Series Analysis](#6-time-series-analysis)
7. [Cohort Analysis](#7-cohort-analysis)
8. [Funnel Analysis](#8-funnel-analysis)
9. [Cluster Analysis](#9-cluster-analysis)
10. [Principal Component Analysis (PCA)](#10-principal-component-analysis-pca)
11. [Causal Inference](#11-causal-inference)
12. [Text Analysis](#12-text-analysis)

---

## 1. Descriptive Analysis

> **Use for summarizing your data, like finding the median order value last month.**

### Purpose
Summarize central tendency, dispersion, and shape of key metrics for each audience.

### Recommended Metrics by Audience

| Audience | Key Metrics | Why |
|----------|-------------|-----|
| **Executive** | Weekly total calls, mean/median response times, NENA compliance % | High-level KPIs |
| **Operational** | 90th percentile turnout/travel times, process capability (Cp/Cpk) | Standards compliance |
| **Shift Supervisor** | Shift-level volume, median handle time per calltaker/dispatcher | Personnel evaluation |
| **Analyst** | Full distribution stats (skew, kurtosis, quantiles), missingness rates | Foundation for modeling |

### Python Examples

```python
import pandas as pd
import numpy as np
from scipy import stats

# Load data
incidents = pd.read_csv("oz_test_incidents.csv", 
    parse_dates=["call_start_time", "incident_start_time",
                 "time_phone_pickup", "time_call_enters_queue",
                 "time_first_unit_assigned", "time_unit_enroute",
                 "time_unit_arrived", "time_last_unit_cleared",
                 "time_call_closed", "time_phone_disconnect"])

calls = pd.read_csv("oz_test_hourly_call_counts.csv", parse_dates=["hour_start"])

# ── EXECUTIVE: Weekly KPI Summary ──────────────────────────────────────
weekly_calls = calls.groupby(calls["hour_start"].dt.isocalendar().week).agg(
    total_911=("nine_one_one_calls_received", "sum"),
    total_non_emergency=("non_emergency_calls_received", "sum"),
    mean_911_20s_pct=("nine_one_one_answered_20s_pct", "mean"),
    mean_non_emergency_20s_pct=("non_emergency_answered_20s_pct", "mean")
)
print("Weekly Executive Summary:")
print(weekly_calls)

# ── OPERATIONAL: NFPA/NENA Compliance Percentiles ──────────────────────
time_cols = ["pickup_delay_seconds", "dispatch_queue_seconds", 
             "turnout_seconds", "travel_seconds", "on_scene_seconds",
             "total_elapsed_seconds"]

for col in time_cols:
    p90 = np.percentile(incidents[col].dropna(), 90)
    p95 = np.percentile(incidents[col].dropna(), 95)
    median = incidents[col].median()
    print(f"{col}: median={median:.0f}s, p90={p90:.0f}s, p95={p95:.0f}s")

# ── SHIFT SUPERVISOR: Per-Shift Volume & Handle Time ──────────────────
shift_summary = incidents.groupby("shift_label").agg(
    n_incidents=("id_number", "count"),
    median_total_elapsed=("total_elapsed_seconds", "median"),
    median_dispatch_queue=("dispatch_queue_seconds", "median"),
    median_on_scene=("on_scene_seconds", "median")
)
print("\nShift Supervisor Summary:")
print(shift_summary)

# ── ANALYST: Full Distribution Diagnostics ────────────────────────────
def distribution_diagnostics(series, name):
    """Comprehensive distribution summary for modeling decisions."""
    s = series.dropna()
    return {
        "name": name,
        "n": len(s),
        "missing_pct": series.isna().mean() * 100,
        "mean": s.mean(),
        "median": s.median(),
        "std": s.std(),
        "cv": s.std() / s.mean() if s.mean() != 0 else np.nan,
        "skew": stats.skew(s),
        "kurtosis": stats.kurtosis(s),
        "iqr": s.quantile(0.75) - s.quantile(0.25),
        "p01": s.quantile(0.01),
        "p05": s.quantile(0.05),
        "p25": s.quantile(0.25),
        "p50": s.quantile(0.50),
        "p75": s.quantile(0.75),
        "p95": s.quantile(0.95),
        "p99": s.quantile(0.99),
        "shapiro_p": stats.shapiro(s[:5000]).pvalue if len(s) <= 5000 else np.nan,
        "normality": "normal" if len(s) <= 5000 and stats.shapiro(s[:5000]).pvalue > 0.05 else "non-normal"
    }

for col in time_cols:
    diag = distribution_diagnostics(incidents[col], col)
    print(f"\n{diag['name']}: skew={diag['skew']:.2f}, kurt={diag['kurtosis']:.2f}, "
          f"normality={diag['normality']}, missing={diag['missing_pct']:.1f}%")
```

### Key Outputs to Generate
- **Executive**: One-page KPI scorecard (weekly totals, compliance %)
- **Operational**: Percentile table vs. NENA/NFPA thresholds
- **Shift Supervisor**: Shift comparison table with outlier flags
- **Analyst**: Distribution diagnostic table for all time columns

---

## 2. Exploratory Data Analysis (EDA)

> **Use for spotting patterns and outliers, like products with unusually high return rates.**

### Purpose
Uncover structure, anomalies, and relationships before formal modeling.

### EDA Protocol for 9-1-1 Data

```python
import pandas as pd
import numpy as np
import plotnine as p9
from scipy import stats
import missingno as msno
import seaborn as sns
import matplotlib.pyplot as plt

incidents = pd.read_csv("oz_test_incidents.csv", 
    parse_dates=["call_start_time", "incident_start_time",
                 "time_phone_pickup", "time_call_enters_queue",
                 "time_first_unit_assigned", "time_unit_enroute",
                 "time_unit_arrived", "time_last_unit_cleared",
                 "time_call_closed", "time_phone_disconnect"])

calls = pd.read_csv("oz_test_hourly_call_counts.csv", parse_dates=["hour_start"])

# ── 2.1 Missingness Pattern ────────────────────────────────────────────
print("Missing value % per column:")
print((incidents.isna().mean() * 100).sort_values(ascending=False))

# Visual missingness heatmap
msno.matrix(incidents)

# ── 2.2 Categorical Distributions ──────────────────────────────────────
cat_cols = ["agency", "shift", "shift_label", "shift_group", 
            "problem_nature", "priority", "call_disposition",
            "method_of_call_reception", "calltaker", "dispatcher"]

for col in cat_cols:
    print(f"\n{col} — Top 10:")
    print(incidents[col].value_counts().head(10))
    print(f"  Unique values: {incidents[col].nunique()}")
    print(f"  Entropy: {stats.entropy(incidents[col].value_counts(normalize=True)):.3f}")

# ── 2.3 Outlier Detection (Multi-Method Consensus) ────────────────────
def consensus_outlier_flag(series, name="value"):
    """Flag outliers detected by ≥2 methods."""
    q1, q3 = series.quantile(0.25), series.quantile(0.75)
    iqr = q3 - q1
    iqr_flag = (series < q1 - 1.5*iqr) | (series > q3 + 1.5*iqr)
    
    mad = (series - series.median()).abs().median()
    mad_flag = (0.6745 * (series - series.median()) / mad).abs() > 3.5
    
    z_flag = ((series - series.mean()) / series.std()).abs() > 3
    
    pct_flag = (series < series.quantile(0.01)) | (series > series.quantile(0.99))
    
    consensus = (iqr_flag.astype(int) + mad_flag.astype(int) + 
                 z_flag.astype(int) + pct_flag.astype(int)) >= 2
    
    return pd.DataFrame({
        f"{name}_iqr": iqr_flag,
        f"{name}_mad": mad_flag,
        f"{name}_z": z_flag,
        f"{name}_pct": pct_flag,
        f"{name}_consensus": consensus
    })

# Apply to all time columns
time_cols = ["pickup_delay_seconds", "dispatch_queue_seconds", 
             "turnout_seconds", "travel_seconds", "on_scene_seconds",
             "total_elapsed_seconds", "interview_seconds"]

outlier_flags = pd.concat([consensus_outlier_flag(incidents[c], c) for c in time_cols], axis=1)
print("\nOutlier consensus counts:")
print(outlier_flags.filter(like="consensus").sum())

# ── 2.4 Temporal Patterns ──────────────────────────────────────────────
# Hourly call volume by day of week
calls["dow"] = calls["hour_start"].dt.dayofweek.map(
    lambda i: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i])
calls["hour"] = calls["hour_start"].dt.hour

# Circadian demand curve
(p9.ggplot(calls, p9.aes(x="hour", y="nine_one_one_calls_received"))
 + p9.stat_summary(fun_y="mean", geom="line", color="#1c5789", size=1.2)
 + p9.stat_summary(fun_data="mean_cl_boot", geom="ribbon", alpha=0.2, fill="#1c5789")
 + p9.facet_wrap("~dow", nrow=2)
 + p9.labs(title="9-1-1 Call Volume by Hour and Day of Week", x="Hour", y="Calls")
 + p9.theme_minimal())

# ── 2.5 Response Time Distributions by Priority ────────────────────────
(p9.ggplot(incidents, p9.aes(x="factor(priority)", y="dispatch_queue_seconds", fill="factor(priority)"))
 + p9.geom_violin(alpha=0.6)
 + p9.geom_boxplot(width=0.15, outlier_alpha=0.3)
 + p9.scale_y_log10()
 + p9.labs(title="Dispatch Queue Seconds by Priority (log scale)", x="Priority (1=Highest)", y="Seconds")
 + p9.theme_minimal())

# ── 2.6 Bivariate Scatter with LOESS ───────────────────────────────────
(p9.ggplot(incidents, p9.aes(x="interview_seconds", y="dispatch_queue_seconds"))
 + p9.geom_point(alpha=0.3, size=0.8)
 + p9.geom_smooth(method="loess", color="red", se=True)
 + p9.scale_x_log10()
 + p9.scale_y_log10()
 + p9.labs(title="Interview vs Dispatch Queue (log-log)", x="Interview Seconds", y="Dispatch Queue Seconds")
 + p9.theme_minimal())

# ── 2.7 Correlation Heatmap (Spearman) ────────────────────────────────
time_matrix = incidents[time_cols].corr(method="spearman")
plt.figure(figsize=(10, 8))
sns.heatmap(time_matrix, annot=True, fmt=".2f", cmap="RdBu_r", center=0, 
            square=True, cbar_kws={"shrink": 0.8})
plt.title("Spearman Correlation: Response Time Components")
plt.tight_layout()
plt.show()

# ── 2.8 Problem Nature Pareto ─────────────────────────────────────────
problem_counts = incidents["problem_nature"].value_counts()
problem_pareto = (problem_counts.cumsum() / problem_counts.sum() * 100).reset_index()
problem_pareto.columns = ["problem_nature", "cumulative_pct"]
problem_counts_df = problem_counts.reset_index()
problem_counts_df.columns = ["problem_nature", "count"]
problem_merged = problem_counts_df.merge(problem_pareto, on="problem_nature")

(p9.ggplot(problem_merged.head(20), p9.aes(x="problem_nature", y="count"))
 + p9.geom_col(fill="#1c5789")
 + p9.geom_line(p9.aes(y="cumulative_pct * count.max() / 100", group=1), color="red", size=1)
 + p9.coord_flip()
 + p9.labs(title="Top 20 Problem Natures (Pareto)", x="", y="Count")
 + p9.theme_minimal())
```

### EDA Checklist (Run Before Every Analysis)
- [ ] Missing value matrix & completeness KPI
- [ ] Duplicate detection
- [ ] Univariate descriptives (mean, median, skew, kurtosis, quantiles)
- [ ] Categorical frequency tables (entropy, mode concentration)
- [ ] Histogram + KDE for all time columns
- [ ] Normality tests per group (Shapiro-Wilk)
- [ ] Multi-method outlier flags (consensus ≥2 methods)
- [ ] Spearman correlation matrix on time components
- [ ] Cramér's V for categorical × categorical
- [ ] ACF/PACF on hourly call volume
- [ ] Boxplots by shift, agency, priority
- [ ] Scatter + LOESS for interview vs dispatch queue
- [ ] Assumption checks (Levene, Breusch-Pagan, VIF) before parametric tests

---

## 3. Correlation Analysis

> **Use for measuring how strongly two variables move together, like how often customers visit and how much they spend.**

### Purpose
Quantify associations between variables; choose the right correlation for data types.

### Correlation Methods for 9-1-1 Data

| Variable Pair | Method | Why |
|---------------|--------|-----|
| `dispatch_queue_seconds` vs `travel_seconds` | **Spearman ρ** | Both skewed, monotonic relationship |
| `priority` (ordinal) vs `total_elapsed_seconds` | **Spearman ρ** / **Kendall τ** | Ordinal vs continuous |
| `shift_label` vs `call_disposition` | **Cramér's V** | Both nominal |
| `nine_one_one_calls_received` vs `nine_one_one_answered_20s_pct` | **Pearson r** | ~Normal, linear-ish |
| `abandoned` (binary) vs `pickup_delay_seconds` | **Point-biserial r** | Binary vs continuous |
| `priority` vs `compliance` (both ordinal) | **Polychoric r** | Latent normal assumption |

### Python Examples

```python
import pandas as pd
import numpy as np
from scipy import stats
from scipy.stats import spearmanr, kendalltau, pearsonr
import pingouin as pg

incidents = pd.read_csv("oz_test_incidents.csv", 
    parse_dates=["call_start_time", "incident_start_time",
                 "time_phone_pickup", "time_call_enters_queue",
                 "time_first_unit_assigned", "time_unit_enroute",
                 "time_unit_arrived", "time_last_unit_cleared",
                 "time_call_closed", "time_phone_disconnect"])

calls = pd.read_csv("oz_test_hourly_call_counts.csv", parse_dates=["hour_start"])

# ── 3.1 Continuous vs Continuous (Spearman) ────────────────────────────
time_cols = ["pickup_delay_seconds", "dispatch_queue_seconds", 
             "turnout_seconds", "travel_seconds", "on_scene_seconds",
             "total_elapsed_seconds", "interview_seconds"]

# Full correlation matrix with p-values
def corr_matrix_with_pvals(df, cols, method="spearman"):
    n = len(cols)
    rmat = pd.DataFrame(np.zeros((n, n)), columns=cols, index=cols)
    pmat = pd.DataFrame(np.zeros((n, n)), columns=cols, index=cols)
    for i in range(n):
        for j in range(i, n):
            if method == "spearman":
                stat, p = spearmanr(df[cols[i]], df[cols[j]])
            elif method == "kendall":
                stat, p = kendalltau(df[cols[i]], df[cols[j]])
            elif method == "pearson":
                stat, p = pearsonr(df[cols[i]], df[cols[j]])
            rmat.iloc[i, j] = stat
            rmat.iloc[j, i] = stat
            pmat.iloc[i, j] = p
            pmat.iloc[j, i] = p
    return rmat, pmat

r_spearman, p_spearman = corr_matrix_with_pvals(incidents, time_cols, "spearman")
print("Spearman Correlation Matrix:")
print(r_spearman.round(3))
print("\nP-values:")
print(p_spearman.round(4))

# ── 3.2 Ordinal vs Continuous (Kendall's τ) ───────────────────────────
# Priority is ordinal (1-5), test against response times
for col in time_cols:
    tau, p = kendalltau(incidents["priority"], incidents[col])
    print(f"Priority vs {col}: τ={tau:.4f}, p={p:.4f}")

# ── 3.3 Nominal vs Nominal (Cramér's V) ───────────────────────────────
from scipy.stats import chi2_contingency

def cramers_v(confusion_matrix):
    chi2 = chi2_contingency(confusion_matrix)[0]
    n = confusion_matrix.sum()
    min_dim = min(confusion_matrix.shape) - 1
    return np.sqrt(chi2 / (n * min_dim))

# Shift vs Disposition
ct = pd.crosstab(incidents["shift_label"], incidents["call_disposition"])
print(f"Shift vs Disposition Cramér's V: {cramers_v(ct.values):.4f}")

# Agency vs Method of Reception
ct2 = pd.crosstab(incidents["agency"], incidents["method_of_call_reception"])
print(f"Agency vs Method Cramér's V: {cramers_v(ct2.values):.4f}")

# ── 3.4 Binary vs Continuous (Point-Biserial) ─────────────────────────
# Create binary: abandoned call
calls["any_abandoned"] = ((calls["nine_one_one_calls_abandoned"] > 0) | 
                           (calls["non_emergency_calls_abandoned"] > 0)).astype(int)

for col in ["nine_one_one_calls_received", "non_emergency_calls_received"]:
    r_pb, p = stats.pointbiserialr(calls["any_abandoned"], calls[col])
    print(f"Abandoned vs {col}: r_pb={r_pb:.4f}, p={p:.4f}")

# ── 3.5 Partial Correlation (Controlling for Confounders) ─────────────
# Effect of priority on dispatch_queue controlling for agency
import statsmodels.api as sm

# Regress both on agency dummies, correlate residuals
agency_dummies = pd.get_dummies(incidents["agency"], drop_first=True)
X = sm.add_constant(agency_dummies)

y1 = incidents["priority"]
y2 = incidents["dispatch_queue_seconds"]

res1 = sm.OLS(y1, X).fit().resid
res2 = sm.OLS(y2, X).fit().resid

partial_r, partial_p = pearsonr(res1, res2)
print(f"Partial corr (priority vs dispatch_queue | agency): r={partial_r:.4f}, p={partial_p:.4f}")

# ── 3.6 Pingouin for Clean Output with Effect Sizes ───────────────────
# Correlation with confidence intervals
corr_result = pg.corr(
    x=incidents["dispatch_queue_seconds"],
    y=incidents["travel_seconds"],
    method="spearman"
)
print(corr_result)

# Multiple correlations at once
corr_matrix = pg.pairwise_corr(incidents[time_cols], method="spearman")
print(corr_matrix.round(4))
```

### Key Insights to Extract
- Which response time components are most tightly coupled?
- Does higher priority actually correlate with faster response?
- Are certain shifts associated with specific dispositions?
- Does call volume predict compliance rates?

---

## 4. Regression Analysis

> **Use for predicting an outcome, like estimating a customer's next order value from their past purchases.**

### Purpose
Model relationships to predict, explain, or quantify effects.

### Regression Types for 9-1-1 Data

| Outcome | Model | Predictors | Audience |
|---------|-------|------------|----------|
| `total_elapsed_seconds` (continuous, skewed) | **Gamma GLM** / **Log-normal OLS** | priority, agency, shift, problem_nature, hour, dow | Analyst, Ops |
| `dispatch_queue_seconds` (count-like, skewed) | **Negative Binomial** / **Poisson GLM** | priority, agency, shift, hour | Ops, Analyst |
| `nine_one_one_answered_20s_pct` (proportion) | **Beta Regression** / **Binomial GLM** | hour, dow, call_volume | Exec, Ops |
| `call_disposition` (categorical) | **Multinomial Logistic** | priority, agency, shift, problem_nature | Analyst |
| `abandoned` (binary) | **Logistic Regression** | wait_time, hour, dow, volume | Ops |

### Python Examples

```python
import pandas as pd
import numpy as np
import statsmodels.api as sm
import statsmodels.formula.api as smf
from statsmodels.genmod.families import Gamma, NegativeBinomial, Binomial
from statsmodels.genmod.families.links import Log, Logit
import pingouin as pg

incidents = pd.read_csv("oz_test_incidents.csv", 
    parse_dates=["call_start_time", "incident_start_time",
                 "time_phone_pickup", "time_call_enters_queue",
                 "time_first_unit_assigned", "time_unit_enroute",
                 "time_unit_arrived", "time_last_unit_cleared",
                 "time_call_closed", "time_phone_disconnect"])

# Feature engineering
incidents["hour"] = incidents["call_start_time"].dt.hour
incidents["dow"] = incidents["call_start_time"].dt.dayofweek
incidents["is_weekend"] = incidents["dow"].isin([5, 6]).astype(int)
incidents["log_total_elapsed"] = np.log1p(incidents["total_elapsed_seconds"])

# ── 4.1 Gamma GLM for Total Elapsed Time (Skewed Continuous) ──────────
# Gamma with log link handles positive skewed data well
gamma_model = smf.glm(
    formula="total_elapsed_seconds ~ C(priority) + C(agency) + C(shift_label) + C(problem_nature) + hour + is_weekend",
    data=incidents,
    family=Gamma(link=Log())
).fit()

print(gamma_model.summary())
print(f"AIC: {gamma_model.aic:.2f}")

# Predictions
incidents["pred_gamma"] = gamma_model.predict(incidents)
print(f"Mean Absolute Error: {np.mean(np.abs(incidents['total_elapsed_seconds'] - incidents['pred_gamma'])):.1f}s")

# ── 4.2 Negative Binomial for Dispatch Queue (Count-like) ─────────────
# dispatch_queue_seconds is integer, overdispersed
nb_model = smf.glm(
    formula="dispatch_queue_seconds ~ C(priority) + C(agency) + C(shift_label) + hour + is_weekend",
    data=incidents,
    family=NegativeBinomial(link=Log())
).fit()

print(nb_model.summary())

# ── 4.3 Logistic Regression: Will Call Be Answered Within 20s? ────────
# Use hourly data - binary outcome per hour (meets 90% threshold?)
calls = pd.read_csv("oz_test_hourly_call_counts.csv", parse_dates=["hour_start"])
calls["meets_20s"] = (calls["nine_one_one_answered_20s_pct"] >= 90).astype(int)
calls["hour"] = calls["hour_start"].dt.hour
calls["dow"] = calls["hour_start"].dt.dayofweek
calls["total_calls"] = calls["nine_one_one_calls_received"] + calls["non_emergency_calls_received"]

logit_model = smf.logit(
    formula="meets_20s ~ hour + C(dow) + total_calls + nine_one_one_calls_received",
    data=calls
).fit()

print(logit_model.summary())

# Odds ratios
odds_ratios = np.exp(logit_model.params)
print("\nOdds Ratios:")
print(odds_ratios.round(3))

# ── 4.4 Linear Mixed Model (Shift as Random Effect) ───────────────────
# For analyst/researcher: account for shift-level clustering
from statsmodels.regression.mixed_linear_model import MixedLM

# Log-transform for normality
incidents["log_dispatch_queue"] = np.log1p(incidents["dispatch_queue_seconds"])

mixed_model = MixedLM.from_formula(
    "log_dispatch_queue ~ C(priority) + C(agency) + hour",
    groups="shift_label",
    data=incidents
).fit()

print(mixed_model.summary())

# ── 4.5 Beta Regression for Compliance Proportions ────────────────────
# For operational management: model compliance rate as continuous proportion
from statsmodels.genmod.families import Beta

calls["compliance_20s"] = calls["nine_one_one_answered_20s_pct"] / 100
# Adjust 0/1 for Beta
calls["compliance_20s_adj"] = (calls["compliance_20s"] * (len(calls) - 1) + 0.5) / len(calls)

beta_model = smf.glm(
    formula="compliance_20s_adj ~ hour + C(dow) + total_calls",
    data=calls,
    family=Beta(link=Logit())
).fit()

print(beta_model.summary())

# ── 4.6 Model Diagnostics (Assumption Checks) ─────────────────────────
def regression_diagnostics(model, data, outcome_col, preds_col):
    """Comprehensive regression diagnostics."""
    residuals = data[outcome_col] - data[preds_col]
    
    print("=== Residual Diagnostics ===")
    print(f"Mean residual: {residuals.mean():.4f}")
    print(f"Residual std: {residuals.std():.4f}")
    
    # Normality
    stat, p = stats.shapiro(residuals.dropna()[:5000])
    print(f"Shapiro-Wilk: W={stat:.4f}, p={p:.4f}")
    
    # Heteroscedasticity (Breusch-Pagan)
    from statsmodels.stats.diagnostic import het_breuschpagan
    if hasattr(model, 'model'):
        exog = model.model.exog
        bp_stat, bp_p, _, _ = het_breuschpagan(residuals.dropna(), exog[:len(residuals.dropna())])
        print(f"Breusch-Pagan: stat={bp_stat:.4f}, p={bp_p:.4f}")
    
    # Autocorrelation (Durbin-Watson)
    from statsmodels.stats.stattools import durbin_watson
    dw = durbin_watson(residuals.dropna())
    print(f"Durbin-Watson: {dw:.4f}")
    
    # Residual plots
    import matplotlib.pyplot as plt
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    axes[0,0].scatter(data[preds_col], residuals, alpha=0.3, s=5)
    axes[0,0].axhline(0, color='red', linestyle='--')
    axes[0,0].set_xlabel("Predicted")
    axes[0,0].set_ylabel("Residual")
    axes[0,0].set_title("Residuals vs Fitted")
    
    axes[0,1].hist(residuals.dropna(), bins=50, edgecolor='black')
    axes[0,1].set_title("Residual Histogram")
    
    stats.probplot(residuals.dropna(), dist="norm", plot=axes[1,0])
    axes[1,0].set_title("Q-Q Plot")
    
    axes[1,1].plot(residuals.dropna().values[:200])
    axes[1,1].set_title("Residuals Order (first 200)")
    
    plt.tight_layout()
    plt.show()

# Run diagnostics on Gamma model
regression_diagnostics(gamma_model, incidents, "total_elapsed_seconds", "pred_gamma")
```

### Model Selection Guidance
| Situation | Recommended Model |
|-----------|-------------------|
| Positive skewed continuous (time) | Gamma GLM (log link) or Log-normal OLS |
| Count data with overdispersion | Negative Binomial |
| Proportion/rate (0-1) | Beta Regression |
| Binary outcome | Logistic Regression |
| Hierarchical/clustering | Mixed Effects (LMM/GLMM) |
| Many categories (problem_nature) | Regularized (LASSO/Ridge) or Target Encoding |

---

## 5. Hypothesis Testing

> **Use for checking whether a result is statistically significant, like a difference in conversion between two checkout designs in an A/B test.**

### Purpose
Formal statistical inference with p-values, confidence intervals, and effect sizes.

### Key Hypothesis Tests for 9-1-1 Data

| Question | Test | H₀ | Audience |
|----------|------|-----|----------|
| Is 90th percentile turnout time ≤ 80s (NFPA)? | **One-sample quantile test** / Bootstrap CI | p90 ≥ 80s | Ops |
| Does compliance differ by shift? | **Kruskal-Wallis** (non-parametric) | All shifts equal | Shift, Ops |
| Is 10s answer rate ≥ 75% (APCO)? | **One-sample binomial test** | p ≤ 0.75 | Ops |
| Do LAW vs EMS differ in handle time? | **Mann-Whitney U** | Distributions equal | Ops, Exec |
| Is there a trend in weekly compliance? | **Mann-Kendall** | No monotonic trend | Exec, Analyst |
| Before/after protocol change? | **Mann-Whitney** / **Permutation test** | No difference | QA/QI |
| Association: shift × disposition? | **Chi-square independence** | Independent | Analyst |

### Python Examples

```python
import pandas as pd
import numpy as np
from scipy import stats
from scipy.stats import mannwhitneyu, kruskal, chi2_contingency
import pingouin as pg
from statsmodels.stats.proportion import proportion_confint, binom_test

incidents = pd.read_csv("oz_test_incidents.csv", 
    parse_dates=["call_start_time", "incident_start_time",
                 "time_phone_pickup", "time_call_enters_queue",
                 "time_first_unit_assigned", "time_unit_enroute",
                 "time_unit_arrived", "time_last_unit_cleared",
                 "time_call_closed", "time_phone_disconnect"])

calls = pd.read_csv("oz_test_hourly_call_counts.csv", parse_dates=["hour_start"])

# ── 5.1 NFPA 1710 Compliance: Turnout Time 90th Percentile ────────────
# H₀: 90th percentile turnout ≥ 80s (fire) / 60s (EMS)
# Use bootstrap CI for quantile

def bootstrap_quantile_ci(data, quantile=0.9, n_bootstrap=10000, alpha=0.05):
    """Bootstrap confidence interval for a quantile."""
    data = data.dropna().values
    boot_quantiles = []
    n = len(data)
    for _ in range(n_bootstrap):
        sample = np.random.choice(data, size=n, replace=True)
        boot_quantiles.append(np.percentile(sample, quantile * 100))
    lower = np.percentile(boot_quantiles, alpha/2 * 100)
    upper = np.percentile(boot_quantiles, (1 - alpha/2) * 100)
    return lower, upper

# Fire turnout (priority 1-2, agency FIRE)
fire_turnout = incidents[(incidents["agency"] == "FIRE") & 
                          (incidents["priority"].isin([1, 2]))]["turnout_seconds"]
p90_fire = np.percentile(fire_turnout, 90)
ci_lower, ci_upper = bootstrap_quantile_ci(fire_turnout, 0.9)
print(f"Fire Turnout p90: {p90_fire:.1f}s (95% CI: {ci_lower:.1f} - {ci_upper:.1f})")
print(f"NFPA 1710 target (80s): {'PASS' if ci_upper <= 80 else 'FAIL'}")

# EMS turnout
ems_turnout = incidents[(incidents["agency"] == "EMS") & 
                         (incidents["priority"].isin([1, 2]))]["turnout_seconds"]
p90_ems = np.percentile(ems_turnout, 90)
ci_lower, ci_upper = bootstrap_quantile_ci(ems_turnout, 0.9)
print(f"EMS Turnout p90: {p90_ems:.1f}s (95% CI: {ci_lower:.1f} - {ci_upper:.1f})")
print(f"NFPA 1710 target (60s): {'PASS' if ci_upper <= 60 else 'FAIL'}")

# ── 5.2 One-Sample Binomial: 10s Answer Rate ≥ 75% (APCO) ─────────────
total_911 = calls["nine_one_one_calls_received"].sum()
answered_10s = int((calls["nine_one_one_answered_10s_pct"] / 100 * 
                    calls["nine_one_one_calls_received"]).sum())

# Exact binomial test
result = stats.binomtest(answered_10s, total_911, p=0.75, alternative="greater")
print(f"10s Answer Rate: {answered_10s}/{total_911} = {answered_10s/total_911:.3f}")
print(f"Binomial test (H₀: p ≤ 0.75): p-value = {result.pvalue:.6f}")
print(f"95% CI (Wilson): {proportion_confint(answered_10s, total_911, method='wilson')}")

# ── 5.3 Shift Comparison: Kruskal-Wallis + Post-hoc ──────────────────
# H₀: All shifts have same distribution of total_elapsed_seconds
shift_groups = [g["total_elapsed_seconds"].dropna() 
                for _, g in incidents.groupby("shift_label")]

kw_stat, kw_p = kruskal(*shift_groups)
print(f"Kruskal-Wallis: H={kw_stat:.2f}, p={kw_p:.6f}")

# Post-hoc Dunn's test with Bonferroni
import scikit_posthocs as sp
dunn_result = sp.posthoc_dunn(incidents, val_col="total_elapsed_seconds", 
                               group_col="shift_label", p_adjust="bonferroni")
print("\nDunn's Post-hoc (Bonferroni):")
print(dunn_result.round(4))

# ── 5.4 Pingouin: Clean Output with Effect Sizes ─────────────────────
# Mann-Whitney with effect size (Cohen's d equivalent)
day_data = incidents[incidents["shift"] == "D"]["total_elapsed_seconds"].dropna()
night_data = incidents[incidents["shift"] == "N"]["total_elapsed_seconds"].dropna()

mw_result = pg.mwu(day_data, night_data, alternative="two-sided")
print("Mann-Whitney U (Day vs Night):")
print(mw_result)

# Effect size for non-parametric
# Cliff's delta (probability superiority)
cliffs_delta = pg.compute_effsize(day_data, night_data, eftype="cliff")
print(f"Cliff's Delta: {cliffs_delta:.3f}")

# ── 5.5 Chi-Square: Shift × Disposition ───────────────────────────────
ct = pd.crosstab(incidents["shift_label"], incidents["call_disposition"])
chi2, p, dof, expected = chi2_contingency(ct)
print(f"Chi-square: χ²={chi2:.2f}, p={p:.6f}, df={dof}")

# Effect size: Cramér's V
n = ct.sum().sum()
min_dim = min(ct.shape) - 1
cramers_v = np.sqrt(chi2 / (n * min_dim))
print(f"Cramér's V: {cramers_v:.3f}")

# ── 5.6 Mann-Kendall Trend Test (Weekly Compliance) ──────────────────
calls["week"] = calls["hour_start"].dt.isocalendar().week
weekly_compliance = calls.groupby("week")["nine_one_one_answered_20s_pct"].mean()

# Manual Mann-Kendall
def mann_kendall(x):
    n = len(x)
    s = 0
    for i in range(n-1):
        for j in range(i+1, n):
            s += np.sign(x[j] - x[i])
    var_s = n*(n-1)*(2*n+5)/18
    if s > 0:
        z = (s - 1) / np.sqrt(var_s)
    elif s < 0:
        z = (s + 1) / np.sqrt(var_s)
    else:
        z = 0
    p = 2 * (1 - stats.norm.cdf(abs(z)))
    return s, z, p

s, z, p = mann_kendall(weekly_compliance.values)
print(f"Mann-Kendall: S={s}, Z={z:.3f}, p={p:.4f}")
print(f"Trend: {'Increasing' if z > 0 else 'Decreasing'}")

# ── 5.7 Permutation Test (Before/After) ───────────────────────────────
# Simulate a protocol change at mid-week
mid_week = incidents["call_start_time"].dt.dayofweek.median()
before = incidents[incidents["call_start_time"].dt.dayofweek < mid_week]["dispatch_queue_seconds"]
after = incidents[incidents["call_start_time"].dt.dayofweek >= mid_week]["dispatch_queue_seconds"]

obs_diff = after.median() - before.median()

# Permutation
combined = np.concatenate([before.values, after.values])
n_before = len(before)
perm_diffs = []
for _ in range(10000):
    np.random.shuffle(combined)
    perm_diffs.append(np.median(combined[n_before:]) - np.median(combined[:n_before]))

p_perm = (np.abs(perm_diffs) >= np.abs(obs_diff)).mean()
print(f"Permutation test: observed diff={obs_diff:.1f}s, p={p_perm:.4f}")
```

### Reporting Template
```markdown
## Hypothesis Test Report

**Question**: [Business question]
**H₀**: [Null hypothesis]
**H₁**: [Alternative hypothesis]
**Test**: [Test name]
**Assumptions Checked**: [Normality, independence, etc.]
**Result**: [Test statistic, p-value, CI]
**Effect Size**: [Cohen's d, Cliff's delta, Cramér's V, etc.]
**Practical Significance**: [Does the effect size matter operationally?]
**Decision**: [Reject/Fail to reject H₀]
**Recommendation**: [Actionable insight for audience]
```

---

## 6. Time Series Analysis

> **Use for spotting trends and seasonality, like identifying when orders typically spike and forecasting next month's sales.**

### Purpose
Model temporal dynamics, forecast, detect anomalies, decompose signals.

### Time Series Structure in Our Data

| Series | Frequency | Length | Key Features |
|--------|-----------|--------|--------------|
| Hourly 9-1-1 calls | Hourly | 168 (7 days) | Strong daily seasonality, day-of-week effects |
| Hourly non-emergency | Hourly | 168 | Different circadian pattern |
| Daily compliance % | Daily | 7 | Short, but trend detectable |
| Incident response times | Event-based | 1000+ | Irregular intervals, can aggregate to hourly/daily |

### Python Examples

```python
import pandas as pd
import numpy as np
import statsmodels.api as sm
from statsmodels.tsa.seasonal import STL, seasonal_decompose
from statsmodels.tsa.stattools import adfuller, kpss, acf, pacf
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
import matplotlib.pyplot as plt
import plotnine as p9

calls = pd.read_csv("oz_test_hourly_call_counts.csv", parse_dates=["hour_start"])
calls = calls.set_index("hour_start").asfreq("h")

# ── 6.1 Stationarity Tests ────────────────────────────────────────────
series = calls["nine_one_one_calls_received"]

# ADF Test
adf_result = adfuller(series.dropna())
print(f"ADF: stat={adf_result[0]:.4f}, p={adf_result[1]:.4f}")
print(f"Critical values: {adf_result[4]}")

# KPSS Test
kpss_result = kpss(series.dropna(), regression='ct')
print(f"KPSS: stat={kpss_result[0]:.4f}, p={kpss_result[1]:.4f}")

# ── 6.2 ACF/PACF ──────────────────────────────────────────────────────
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
plot_acf(series.dropna(), lags=48, ax=axes[0,0], title="ACF - 911 Calls")
plot_pacf(series.dropna(), lags=48, ax=axes[0,1], title="PACF - 911 Calls")
plot_acf(calls["non_emergency_calls_received"].dropna(), lags=48, ax=axes[1,0], title="ACF - Non-Emergency")
plot_pacf(calls["non_emergency_calls_received"].dropna(), lags=48, ax=axes[1,1], title="PACF - Non-Emergency")
plt.tight_layout()
plt.show()

# ── 6.3 STL Decomposition ─────────────────────────────────────────────
# Period = 24 (daily seasonality)
stl = STL(series, period=24, robust=True)
result = stl.fit()

fig = result.plot()
fig.set_size_inches(14, 10)
plt.suptitle("STL Decomposition: 911 Call Volume (Period=24h)")
plt.tight_layout()
plt.show()

# Extract components
trend = result.trend
seasonal = result.seasonal
residual = result.resid

print(f"Trend strength: {1 - np.var(residual.dropna()) / np.var((trend + residual).dropna()):.3f}")
print(f"Seasonal strength: {1 - np.var(residual.dropna()) / np.var((seasonal + residual).dropna()):.3f}")

# ── 6.4 Seasonal Subseries Plot ───────────────────────────────────────
calls["hour"] = calls.index.hour
calls["dow"] = calls.index.dayofweek

(p9.ggplot(calls, p9.aes(x="factor(dow)", y="nine_one_one_calls_received"))
 + p9.geom_boxplot(aes(fill="factor(dow)"), outlier_alpha=0.3)
 + p9.facet_wrap("~hour", nrow=4)
 + p9.labs(title="Seasonal Subseries: 911 Calls by Hour Across Days", x="Day of Week", y="Calls")
 + p9.theme_minimal())

# ── 6.5 Forecasting: ARIMA ────────────────────────────────────────────
# Fit ARIMA with seasonal order (24h period)
# For hourly data with daily seasonality: SARIMA(p,d,q)(P,D,Q)_24
# Start with simple ARIMA on daily aggregates for demo
daily_calls = calls["nine_one_one_calls_received"].resample("D").sum()

# Auto-ARIMA via AIC search (simplified)
best_aic = np.inf
best_order = None
for p in range(3):
    for d in range(2):
        for q in range(3):
            try:
                model = ARIMA(daily_calls, order=(p,d,q)).fit()
                if model.aic < best_aic:
                    best_aic = model.aic
                    best_order = (p,d,q)
            except:
                continue

print(f"Best ARIMA order: {best_order}, AIC: {best_aic:.2f}")

model = ARIMA(daily_calls, order=best_order).fit()
forecast = model.forecast(steps=7)  # Next week
print(f"7-day forecast: {forecast.values.round(1)}")

# ── 6.6 Exponential Smoothing (Holt-Winters) ──────────────────────────
# With daily seasonality (period=7 for daily data)
hw_model = ExponentialSmoothing(
    daily_calls, 
    trend="add", 
    seasonal="add", 
    seasonal_periods=7
).fit()

hw_forecast = hw_model.forecast(7)
print(f"Holt-Winters 7-day forecast: {hw_forecast.values.round(1)}")

# ── 6.7 Change Point Detection ────────────────────────────────────────
# Detect structural breaks in compliance
compliance_series = calls["nine_one_one_answered_20s_pct"].resample("D").mean()

from ruptures import Binseg
# Penalized change point detection
model = Binseg(model="l2").fit(compliance_series.values)
bkps = model.predict(pen=10)
print(f"Change points at days: {bkps}")

# Visualize
plt.figure(figsize=(12, 4))
plt.plot(compliance_series.index, compliance_series.values, 'o-')
for bp in bkps[:-1]:  # Last is end of series
    plt.axvline(compliance_series.index[bp], color='red', linestyle='--', alpha=0.7)
plt.title("Daily 20s Compliance with Change Points")
plt.show()

# ── 6.8 Forecasting for Staffing (Operational) ────────────────────────
# Hourly forecast for next 24h using SARIMA
# Note: Need more data for reliable SARIMA(_,_,_)_(_,_,_)_24
# This is a template for when we have 4+ weeks

# Template for future use:
"""
sarima_model = sm.tsa.SARIMAX(
    calls["nine_one_one_calls_received"],
    order=(1, 1, 1),
    seasonal_order=(1, 1, 1, 24),  # Daily seasonality
    enforce_stationarity=False,
    enforce_invertibility=False
).fit()

hourly_forecast = sarima_model.forecast(steps=24)
print(hourly_forecast)
"""
```

### Forecasting Maturity Path
| Phase | Data Needed | Method | Use Case |
|-------|-------------|--------|----------|
| **Week 1** (now) | 1 week | Descriptive, STL, naive/seasonal naive | Baseline understanding |
| **Month 1** | 4 weeks | SARIMA, Holt-Winters | Weekly staffing forecast |
| **Quarter 1** | 13 weeks | Prophet, ETS with covariates | Monthly planning |
| **Year 1** | 52 weeks | SARIMAX with holidays/events, ML | Annual budget, long-term trends |

---

## 7. Cohort Analysis

> **Use for comparing groups over time, like comparing 30-day repeat purchase rates for customers who first bought in May vs. June.**

### Purpose
Track behavior of defined groups (cohorts) across time periods.

### Cohort Definitions for 9-1-1 Data

| Cohort Dimension | Cohorts | Time Metric | Audience |
|------------------|---------|-------------|----------|
| **Shift start week** | Mon, Tue, Wed... | Weekly compliance trend | Exec, Ops |
| **Calltaker hire month** | Jan, Feb, Mar... | Handle time improvement | Shift, Ops |
| **Problem nature** | Cardiac, Trauma, Fire... | Resolution time trend | Analyst, Ops |
| **Agency** | LAW, EMS, FIRE | Volume & compliance by week | Exec, Ops |
| **Priority** | 1, 2, 3, 4, 5 | Response time by week | Ops, Analyst |

### Python Examples

```python
import pandas as pd
import numpy as np
import plotnine as p9

incidents = pd.read_csv("oz_test_incidents.csv", 
    parse_dates=["call_start_time", "incident_start_time",
                 "time_phone_pickup", "time_call_enters_queue",
                 "time_first_unit_assigned", "time_unit_enroute",
                 "time_unit_arrived", "time_last_unit_cleared",
                 "time_call_closed", "time_phone_disconnect"])

calls = pd.read_csv("oz_test_hourly_call_counts.csv", parse_dates=["hour_start"])

# ── 7.1 Cohort: Day-of-Week of Incident (Weekly Compliance) ───────────
incidents["week"] = incidents["call_start_time"].dt.isocalendar().week
incidents["dow"] = incidents["call_start_time"].dt.dayofweek

# For each DOW cohort, track weekly median response time
cohort_metric = incidents.groupby(["dow", "week"]).agg(
    median_dispatch_queue=("dispatch_queue_seconds", "median"),
    median_total_elapsed=("total_elapsed_seconds", "median"),
    n_incidents=("id_number", "count")
).reset_index()

# Cohort heatmap: DOW (cohort) × Week
(p9.ggplot(cohort_metric, p9.aes(x="factor(week)", y="factor(dow)", 
                                  fill="median_dispatch_queue"))
 + p9.geom_tile()
 + p9.scale_fill_cmap(name="viridis")
 + p9.geom_text(p9.aes(label="median_dispatch_queue"), color="white", size=8)
 + p9.labs(title="Cohort Analysis: Median Dispatch Queue by Day-of-Week Cohort", 
           x="Week", y="Day of Week (0=Mon)", fill="Median Queue (s)")
 + p9.theme_minimal())

# ── 7.2 Cohort: Calltaker Experience (Handle Time Improvement) ────────
# Simulate calltaker "cohort" by first appearance week
calltaker_first_week = incidents.groupby("calltaker")["week"].min().reset_index()
calltaker_first_week.columns = ["calltaker", "cohort_week"]
incidents = incidents.merge(calltaker_first_week, on="calltaker")
incidents["weeks_experience"] = incidents["week"] - incidents["cohort_week"]

# Track median handle time by experience week
experience_curve = incidents.groupby(["cohort_week", "weeks_experience"]).agg(
    median_handle=("total_elapsed_seconds", "median"),
    n_calls=("id_number", "count")
).reset_index()

(p9.ggplot(experience_curve[experience_curve["n_calls"] >= 5], 
           p9.aes(x="weeks_experience", y="median_handle", color="factor(cohort_week)"))
 + p9.geom_line(size=1)
 + p9.geom_point(size=2)
 + p9.labs(title="Calltaker Learning Curve: Handle Time by Experience Week",
           x="Weeks Since First Shift", y="Median Handle Time (s)", color="Cohort Week")
 + p9.theme_minimal())

# ── 7.3 Cohort: Problem Nature (Resolution Time Trend) ────────────────
problem_cohort = incidents.groupby(["problem_nature", "week"]).agg(
    median_total=("total_elapsed_seconds", "median"),
    p90_total=("total_elapsed_seconds", lambda x: np.percentile(x, 90)),
    count=("id_number", "count")
).reset_index()

# Focus on top 10 problem natures
top_problems = incidents["problem_nature"].value_counts().head(10).index
problem_cohort_top = problem_cohort[problem_cohort["problem_nature"].isin(top_problems)]

(p9.ggplot(problem_cohort_top, p9.aes(x="week", y="median_total", color="problem_nature"))
 + p9.geom_line(size=1)
 + p9.geom_point(size=2)
 + p9.labs(title="Cohort Trend: Median Response Time by Problem Nature", 
           x="Week", y="Median Total Elapsed (s)", color="Problem Nature")
 + p9.theme_minimal())

# ── 7.4 Cohort Retention Style: Agency Weekly Volume ──────────────────
agency_weekly = incidents.groupby(["agency", "week"]).agg(
    volume=("id_number", "count"),
    median_queue=("dispatch_queue_seconds", "median")
).reset_index()

# Volume retention: % of week 1 volume retained each week
week1_volume = agency_weekly[agency_weekly["week"] == 1].set_index("agency")["volume"]
agency_weekly["retention_pct"] = agency_weekly.apply(
    lambda row: row["volume"] / week1_volume[row["agency"]] * 100 if row["agency"] in week1_volume.index else np.nan, axis=1
)

(p9.ggplot(agency_weekly, p9.aes(x="week", y="retention_pct", color="agency"))
 + p9.geom_line(size=1.2)
 + p9.geom_point(size=3)
 + p9.geom_hline(yintercept=100, linetype="dashed", color="gray")
 + p9.labs(title="Agency Volume Retention (Week 1 = 100%)", 
           x="Week", y="Volume % of Week 1", color="Agency")
 + p9.theme_minimal())

# ── 7.5 Cohort Comparison Table ───────────────────────────────────────
def cohort_comparison_table(df, cohort_col, time_col, metric_col, agg_func="median"):
    """Generate cohort comparison table."""
    cohorts = df[cohort_col].unique()
    periods = sorted(df[time_col].unique())
    
    table = pd.DataFrame(index=cohorts, columns=periods, dtype=float)
    for cohort in cohorts:
        for period in periods:
            subset = df[(df[cohort_col] == cohort) & (df[time_col] == period)]
            if len(subset) > 0:
                if agg_func == "median":
                    table.loc[cohort, period] = subset[metric_col].median()
                elif agg_func == "mean":
                    table.loc[cohort, period] = subset[metric_col].mean()
                elif agg_func == "count":
                    table.loc[cohort, period] = len(subset)
    return table

# Example: Dispatch queue by shift cohort across weeks
shift_cohort_table = cohort_comparison_table(
    incidents, "shift_label", "week", "dispatch_queue_seconds", "median"
)
print("Shift Cohort × Week (Median Dispatch Queue):")
print(shift_cohort_table.round(1))
```

### Cohort Analysis Outputs
- **Executive**: Cohort retention heatmap (agency volume week-over-week)
- **Operational**: Calltaker learning curves (handle time vs experience)
- **Shift Supervisor**: Shift cohort performance trends
- **Analyst**: Problem nature cohort trends, statistical tests for cohort differences

---

## 8. Funnel Analysis

> **Use for finding where people drop off, like the checkout step where you lose the most shoppers.**

### Purpose
Identify drop-off points in a sequential process.

### 9-1-1 Dispatch Funnel

```
Call Received
    ↓
Phone Picked Up (pickup_delay_seconds)
    ↓
Call Enters Queue (interview_seconds)
    ↓
Unit Assigned (dispatch_queue_seconds)
    ↓
Unit Enroute (turnout_seconds)
    ↓
Unit Arrived (travel_seconds)
    ↓
On Scene (on_scene_seconds)
    ↓
Call Closed
```

### Drop-off Points to Analyze
1. **Abandonment before pickup**: `nine_one_one_calls_abandoned` / `nine_one_one_calls_received`
2. **Long pickup delay**: `pickup_delay_seconds` > threshold
3. **Long interview**: `interview_seconds` > threshold
4. **Dispatch queue bottleneck**: `dispatch_queue_seconds` > NFPA 106s (95th)
5. **Slow turnout**: `turnout_seconds` > NFPA 60/80s
6. **Slow travel**: `travel_seconds` > NFPA 240s

### Python Examples

```python
import pandas as pd
import numpy as np
import plotnine as p9

incidents = pd.read_csv("oz_test_incidents.csv", 
    parse_dates=["call_start_time", "incident_start_time",
                 "time_phone_pickup", "time_call_enters_queue",
                 "time_first_unit_assigned", "time_unit_enroute",
                 "time_unit_arrived", "time_last_unit_cleared",
                 "time_call_closed", "time_phone_disconnect"])

calls = pd.read_csv("oz_test_hourly_call_counts.csv", parse_dates=["hour_start"])

# ── 8.1 Incident-Level Funnel ────────────────────────────────────────
# Define funnel stages with thresholds
stages = [
    ("Call Received", len(incidents), None),
    ("Phone Picked Up", incidents["pickup_delay_seconds"].notna().sum(), 
     lambda x: x["pickup_delay_seconds"].notna()),
    ("Queue Entry", incidents["time_call_enters_queue"].notna().sum(),
     lambda x: x["time_call_enters_queue"].notna()),
    ("Unit Assigned", incidents["time_first_unit_assigned"].notna().sum(),
     lambda x: x["time_first_unit_assigned"].notna()),
    ("Unit Enroute", incidents["time_unit_enroute"].notna().sum(),
     lambda x: x["time_unit_enroute"].notna()),
    ("Unit Arrived", incidents["time_unit_arrived"].notna().sum(),
     lambda x: x["time_unit_arrived"].notna()),
    ("On Scene", incidents["time_unit_arrived"].notna().sum(),  # Same as arrived
     lambda x: x["time_unit_arrived"].notna()),
    ("Call Closed", incidents["time_call_closed"].notna().sum(),
     lambda x: x["time_call_closed"].notna()),
]

funnel_df = pd.DataFrame(stages, columns=["Stage", "Count", "Condition"])
funnel_df["Pct_of_Start"] = funnel_df["Count"] / funnel_df["Count"].iloc[0] * 100
funnel_df["Drop_Off"] = funnel_df["Count"].diff().fillna(0) * -1
funnel_df["Drop_Off_Pct"] = funnel_df["Drop_Off"] / funnel_df["Count"].iloc[0] * 100

print("Incident Funnel:")
print(funnel_df[["Stage", "Count", "Pct_of_Start", "Drop_Off", "Drop_Off_Pct"]].to_string(index=False))

# Funnel Chart
(p9.ggplot(funnel_df, p9.aes(x="Stage", y="Count"))
 + p9.geom_col(fill="#1c5789", alpha=0.8)
 + p9.geom_text(p9.aes(label=f"{funnel_df['Count']} ({funnel_df['Pct_of_Start']:.1f}%)"), 
                va="bottom", size=10)
 + p9.coord_flip()
 + p9.labs(title="9-1-1 Dispatch Funnel: Incident Processing Stages", 
           x="", y="Count")
 + p9.theme_minimal())

# ── 8.2 Time-Based Funnel (Where Time Is Spent) ──────────────────────
time_components = [
    ("Pickup Delay", "pickup_delay_seconds"),
    ("Interview", "interview_seconds"),
    ("Dispatch Queue", "dispatch_queue_seconds"),
    ("Turnout", "turnout_seconds"),
    ("Travel", "travel_seconds"),
    ("On Scene", "on_scene_seconds"),
]

time_funnel = []
for label, col in time_components:
    median_val = incidents[col].median()
    p90_val = np.percentile(incidents[col].dropna(), 90)
    time_funnel.append({"Stage": label, "Median": median_val, "P90": p90_val})

time_funnel_df = pd.DataFrame(time_funnel)
time_funnel_df["Cumulative_Median"] = time_funnel_df["Median"].cumsum()
time_funnel_df["Cumulative_P90"] = time_funnel_df["P90"].cumsum()

print("\nTime Funnel (Median & P90):")
print(time_funnel_df.to_string(index=False))

# Waterfall chart of median times
(p9.ggplot(time_funnel_df, p9.aes(x="Stage", y="Median"))
 + p9.geom_col(fill="#1c5789", alpha=0.8)
 + p9.geom_text(p9.aes(label=f"{time_funnel_df['Median']:.0f}s"), va="bottom")
 + p9.labs(title="Median Time per Dispatch Stage", x="", y="Seconds")
 + p9.theme_minimal())

# ── 8.3 Compliance Funnel (NENA/NFPA Standards) ──────────────────────
# At each stage, what % meet the standard?
compliance_funnel = [
    ("911 Answered ≤10s (NENA 90%)", 
     calls["nine_one_one_answered_10s_pct"].mean(),
     90),
    ("911 Answered ≤15s (NENA 95%)", 
     calls["nine_one_one_answered_15s_pct"].mean(),
     95),
    ("911 Answered ≤20s (NENA 95%)", 
     calls["nine_one_one_answered_20s_pct"].mean(),
     95),
    ("Dispatch Queue ≤64s (NFPA 90%)", 
     (incidents["dispatch_queue_seconds"] <= 64).mean() * 100,
     90),
    ("Dispatch Queue ≤106s (NFPA 95%)", 
     (incidents["dispatch_queue_seconds"] <= 106).mean() * 100,
     95),
    ("Turnout ≤60s EMS / ≤80s Fire (NFPA 90%)", 
     None,  # Need agency-specific
     90),
    ("Travel ≤240s (NFPA 90%)", 
     (incidents["travel_seconds"] <= 240).mean() * 100,
     90),
]

comp_df = pd.DataFrame(compliance_funnel, columns=["Standard", "Actual_Pct", "Target_Pct"])
comp_df["Gap"] = comp_df["Actual_Pct"] - comp_df["Target_Pct"]
comp_df["Status"] = comp_df["Gap"].apply(lambda x: "PASS" if x >= 0 else "FAIL")

print("\nCompliance Funnel:")
print(comp_df.to_string(index=False))

# Agency-specific turnout compliance
fire_turnout_pct = (incidents[incidents["agency"]=="FIRE"]["turnout_seconds"] <= 80).mean() * 100
ems_turnout_pct = (incidents[incidents["agency"]=="EMS"]["turnout_seconds"] <= 60).mean() * 100
print(f"\nFire Turnout ≤80s: {fire_turnout_pct:.1f}% (Target 90%)")
print(f"EMS Turnout ≤60s: {ems_turnout_pct:.1f}% (Target 90%)")

# ── 8.4 Funnel by Priority ───────────────────────────────────────────
priority_funnel = incidents.groupby("priority").agg(
    n=("id_number", "count"),
    median_pickup=("pickup_delay_seconds", "median"),
    median_interview=("interview_seconds", "median"),
    median_queue=("dispatch_queue_seconds", "median"),
    median_turnout=("turnout_seconds", "median"),
    median_travel=("travel_seconds", "median"),
    median_on_scene=("on_scene_seconds", "median"),
).reset_index()

print("\nFunnel by Priority:")
print(priority_funnel.to_string(index=False))

# ── 8.5 Funnel by Shift ──────────────────────────────────────────────
shift_funnel = incidents.groupby("shift_label").agg(
    n=("id_number", "count"),
    median_total=("total_elapsed_seconds", "median"),
    p90_queue=("dispatch_queue_seconds", lambda x: np.percentile(x, 90)),
    pct_queue_64s=("dispatch_queue_seconds", lambda x: (x <= 64).mean() * 100),
    pct_queue_106s=("dispatch_queue_seconds", lambda x: (x <= 106).mean() * 100),
).reset_index()

print("\nFunnel by Shift:")
print(shift_funnel.to_string(index=False))

# ── 8.6 Hourly Call Center Funnel (from hourly data) ──────────────────
hourly_funnel = pd.DataFrame({
    "Stage": ["911 Received", "911 Answered", "911 Answered ≤10s", "911 Answered ≤20s",
              "Non-Emerg Received", "Non-Emerg Answered", "Non-Emerg Answered ≤20s"],
    "Count": [
        calls["nine_one_one_calls_received"].sum(),
        calls["nine_one_one_calls_received"].sum() - calls["nine_one_one_calls_abandoned"].sum(),
        int((calls["nine_one_one_answered_10s_pct"]/100 * calls["nine_one_one_calls_received"]).sum()),
        int((calls["nine_one_one_answered_20s_pct"]/100 * calls["nine_one_one_calls_received"]).sum()),
        calls["non_emergency_calls_received"].sum(),
        calls["non_emergency_calls_received"].sum() - calls["non_emergency_calls_abandoned"].sum(),
        int((calls["non_emergency_answered_20s_pct"]/100 * calls["non_emergency_calls_received"]).sum()),
    ]
})
hourly_funnel["Pct_of_Prev"] = hourly_funnel["Count"] / hourly_funnel["Count"].shift(1) * 100
hourly_funnel.loc[0, "Pct_of_Prev"] = 100
hourly_funnel.loc[4, "Pct_of_Prev"] = 100  # Non-emergency starts fresh

print("\nHourly Call Center Funnel:")
print(hourly_funnel.to_string(index=False))
```

### Funnel Analysis Outputs
- **Executive**: Compliance funnel (PASS/FAIL vs standards)
- **Operational**: Time funnel with NFPA thresholds highlighted
- **Shift Supervisor**: Shift-specific funnel comparison
- **Analyst**: Priority/agency funnel breakdowns, bottleneck identification

---

## 9. Cluster Analysis

> **Use for discovering groups with similar behaviors, like shoppers who buy frequently and spend a little each time.**

### Purpose
Find natural groupings in the data without predefined labels.

### Clustering Opportunities in 9-1-1 Data

| Entity to Cluster | Features | Use Case |
|-------------------|----------|----------|
| **Incidents** | Time components, priority, agency, problem_nature | Identify incident archetypes |
| **Hours** | Call volumes, compliance rates, abandonment | Shift scheduling templates |
| **Calltakers** | Handle time, pickup delay, volume, dispositions | Performance profiling |
| **Locations** | Incident frequency, problem types, response times | Station placement, resource allocation |
| **Shifts** | Volume patterns, compliance, staffing | Shift equivalence classes |

### Python Examples

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.mixture import GaussianMixture
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score, calinski_harabasz_score
import plotnine as p9
import matplotlib.pyplot as plt

incidents = pd.read_csv("oz_test_incidents.csv", 
    parse_dates=["call_start_time", "incident_start_time",
                 "time_phone_pickup", "time_call_enters_queue",
                 "time_first_unit_assigned", "time_unit_enroute",
                 "time_unit_arrived", "time_last_unit_cleared",
                 "time_call_closed", "time_phone_disconnect"])

calls = pd.read_csv("oz_test_hourly_call_counts.csv", parse_dates=["hour_start"])

# ── 9.1 Incident Clustering (Time Components) ─────────────────────────
# Use robust scaling for skewed time data
time_cols = ["pickup_delay_seconds", "dispatch_queue_seconds", 
             "turnout_seconds", "travel_seconds", "on_scene_seconds",
             "interview_seconds", "total_elapsed_seconds"]

incident_features = incidents[time_cols].copy()
# Log transform for skew
for col in time_cols:
    incident_features[col] = np.log1p(incident_features[col])

# Robust scaling (median/IQR)
scaler = RobustScaler()
X_scaled = scaler.fit_transform(incident_features.fillna(incident_features.median()))

# Find optimal k using silhouette
silhouettes = []
inertias = []
K_range = range(2, 10)
for k in K_range:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)
    silhouettes.append(silhouette_score(X_scaled, labels))
    inertias.append(kmeans.inertia_)

# Plot elbow and silhouette
fig, axes = plt.subplots(1, 2, figsize=(12, 4))
axes[0].plot(K_range, inertias, 'o-')
axes[0].set_xlabel("k")
axes[0].set_ylabel("Inertia")
axes[0].set_title("Elbow Method")

axes[1].plot(K_range, silhouettes, 'o-')
axes[1].set_xlabel("k")
axes[1].set_ylabel("Silhouette Score")
axes[1].set_title("Silhouette Analysis")
plt.tight_layout()
plt.show()

# Fit final model (say k=4 based on silhouette)
kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
incidents["incident_cluster"] = kmeans.fit_predict(X_scaled)

# Cluster profiles
cluster_profiles = incidents.groupby("incident_cluster")[time_cols].agg(["median", "mean", "count"])
print("Cluster Profiles (Median):")
print(cluster_profiles.xs("median", axis=1, level=1).round(1))

# Add categorical context
for col in ["agency", "shift_label", "priority", "problem_nature"]:
    print(f"\nCluster × {col}:")
    ct = pd.crosstab(incidents["incident_cluster"], incidents[col], normalize="index") * 100
    print(ct.round(1))

# Visualize clusters in PCA space
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)
incidents["pca1"] = X_pca[:, 0]
incidents["pca2"] = X_pca[:, 1]

(p9.ggplot(incidents, p9.aes(x="pca1", y="pca2", color="factor(incident_cluster)"))
 + p9.geom_point(alpha=0.5, size=1)
 + p9.labs(title="Incident Clusters (PCA)", color="Cluster")
 + p9.theme_minimal())

# ── 9.2 Hourly Pattern Clustering (Shift Templates) ───────────────────
hourly_features = calls.copy()
hourly_features["hour"] = hourly_features["hour_start"].dt.hour
hourly_features["dow"] = hourly_features["hour_start"].dt.dayofweek

# Aggregate hourly profile per day
daily_profiles = hourly_features.groupby("dow").agg(
    mean_911=("nine_one_one_calls_received", "mean"),
    mean_non_emerg=("non_emergency_calls_received", "mean"),
    mean_911_20s=("nine_one_one_answered_20s_pct", "mean"),
    mean_non_emerg_20s=("non_emergency_answered_20s_pct", "mean"),
    total_911=("nine_one_one_calls_received", "sum"),
    total_non_emerg=("non_emergency_calls_received", "sum"),
).reset_index()

# Or cluster individual hours
hour_cluster_features = hourly_features[["nine_one_one_calls_received", 
                                          "non_emergency_calls_received",
                                          "nine_one_one_answered_20s_pct",
                                          "non_emergency_answered_20s_pct",
                                          "hour", "dow"]].copy()

scaler = RobustScaler()
X_hour = scaler.fit_transform(hour_cluster_features)

# DBSCAN for density-based (finds unusual hours)
dbscan = DBSCAN(eps=1.5, min_samples=3)
hourly_features["hour_cluster"] = dbscan.fit_predict(X_hour)

print("\nHour Clusters (DBSCAN):")
print(hourly_features["hour_cluster"].value_counts().sort_index())

# Characterize clusters
cluster_char = hourly_features.groupby("hour_cluster").agg(
    n_hours=("hour_start", "count"),
    mean_911=("nine_one_one_calls_received", "mean"),
    mean_compliance=("nine_one_one_answered_20s_pct", "mean"),
    typical_hours=("hour", lambda x: list(x.unique()))
).reset_index()
print(cluster_char.to_string(index=False))

# ── 9.3 Calltaker Performance Clustering ──────────────────────────────
calltaker_stats = incidents.groupby("calltaker").agg(
    n_calls=("id_number", "count"),
    median_pickup=("pickup_delay_seconds", "median"),
    median_interview=("interview_seconds", "median"),
    median_queue=("dispatch_queue_seconds", "median"),
    median_total=("total_elapsed_seconds", "median"),
    pct_undefined=("call_disposition", lambda x: (x == "UNDEFINED").mean() * 100),
    unique_problems=("problem_nature", "nunique"),
).reset_index()

# Filter active calltakers
calltaker_stats = calltaker_stats[calltaker_stats["n_calls"] >= 10]

ct_features = calltaker_stats[["median_pickup", "median_interview", "median_queue", 
                                "median_total", "pct_undefined"]].copy()
for col in ct_features.columns:
    ct_features[col] = np.log1p(ct_features[col])

scaler = RobustScaler()
X_ct = scaler.fit_transform(ct_features.fillna(ct_features.median()))

# Gaussian Mixture Model (soft clustering)
gmm = GaussianMixture(n_components=3, random_state=42)
calltaker_stats["performance_cluster"] = gmm.fit_predict(X_ct)
calltaker_stats["cluster_prob"] = gmm.predict_proba(X_ct).max(axis=1)

print("\nCalltaker Clusters:")
for cl in sorted(calltaker_stats["performance_cluster"].unique()):
    subset = calltaker_stats[calltaker_stats["performance_cluster"] == cl]
    print(f"\nCluster {cl} (n={len(subset)}):")
    print(subset[["median_pickup", "median_interview", "median_queue", 
                   "median_total", "pct_undefined"]].median().round(1))

# ── 9.4 Hierarchical Clustering (Dendrogram for Analysts) ─────────────
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster

# Use daily aggregates for manageable size
daily_incidents = incidents.set_index("call_start_time").resample("D").agg({
    "dispatch_queue_seconds": "median",
    "turnout_seconds": "median",
    "travel_seconds": "median",
    "total_elapsed_seconds": "median",
    "id_number": "count"
}).rename(columns={"id_number": "volume"})

daily_features = daily_incidents[["dispatch_queue_seconds", "turnout_seconds", 
                                   "travel_seconds", "total_elapsed_seconds", "volume"]]
daily_features = np.log1p(daily_features.fillna(daily_features.median()))
X_daily = RobustScaler().fit_transform(daily_features)

# Linkage
Z = linkage(X_daily, method="ward")

# Plot dendrogram
plt.figure(figsize=(12, 6))
dendrogram(Z, labels=daily_incidents.index.strftime("%m-%d").tolist(), 
           leaf_rotation=90, leaf_font_size=10)
plt.title("Hierarchical Clustering of Days (Ward Linkage)")
plt.tight_layout()
plt.show()

# Cut tree at k=3
daily_incidents["hcluster"] = fcluster(Z, t=3, criterion="maxclust")
print("\nDaily Clusters:")
print(daily_incidents.groupby("hcluster").agg(
    n_days=("volume", "count"),
    median_queue=("dispatch_queue_seconds", "median"),
    median_total=("total_elapsed_seconds", "median"),
    mean_volume=("volume", "mean")
).round(1))
```

### Clustering Outputs by Audience
- **Executive**: 3-4 high-level incident archetypes (e.g., "Fast Medical", "Slow Fire", "Complex Multi-Agency")
- **Operational**: Hour templates for scheduling ("Peak Compliant", "Off-Peak Risk", "Anomalous")
- **Shift Supervisor**: Calltaker performance profiles ("Speed Stars", "Thorough Documenters", "Needs Coaching")
- **Analyst**: Full cluster diagnostics, silhouette scores, stability analysis

---

## 10. Principal Component Analysis (PCA)

> **Use for condensing many variables into a few components, like summarizing 20 customer metrics while keeping most of the variation.**

### Purpose
Dimensionality reduction, noise reduction, feature extraction for modeling.

### PCA Applications in 9-1-1 Data

| Application | Variables | Components to Keep | Use Case |
|-------------|-----------|-------------------|----------|
| **Response Time Index** | All 7 time components | 1-2 | Single KPI for dashboards |
| **Call Volume Profile** | 24 hourly volumes | 2-3 | Circadian pattern classification |
| **Compliance Multi-Metric** | 8 answer rate columns | 1-2 | Overall compliance score |
| **Incident Complexity** | Time components + priority + agency | 2-3 | Resource prediction |

### Python Examples

```python
import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import RobustScaler, StandardScaler
import plotnine as p9
import matplotlib.pyplot as plt

incidents = pd.read_csv("oz_test_incidents.csv", 
    parse_dates=["call_start_time", "incident_start_time",
                 "time_phone_pickup", "time_call_enters_queue",
                 "time_first_unit_assigned", "time_unit_enroute",
                 "time_unit_arrived", "time_last_unit_cleared",
                 "time_call_closed", "time_phone_disconnect"])

calls = pd.read_csv("oz_test_hourly_call_counts.csv", parse_dates=["hour_start"])

# ── 10.1 Response Time PCA (Incident-Level) ───────────────────────────
time_cols = ["pickup_delay_seconds", "dispatch_queue_seconds", 
             "turnout_seconds", "travel_seconds", "on_scene_seconds",
             "interview_seconds", "total_elapsed_seconds"]

# Log transform + robust scale
X_time = incidents[time_cols].copy()
for col in time_cols:
    X_time[col] = np.log1p(X_time[col])

scaler = RobustScaler()
X_scaled = scaler.fit_transform(X_time.fillna(X_time.median()))

# PCA
pca = PCA()
X_pca = pca.fit_transform(X_scaled)

# Variance explained
var_exp = pca.explained_variance_ratio_
cum_var = np.cumsum(var_exp)

print("PCA Variance Explained:")
for i, (v, c) in enumerate(zip(var_exp, cum_var)):
    print(f"  PC{i+1}: {v:.3f} ({v*100:.1f}%) — Cumulative: {c:.3f} ({c*100:.1f}%)")

# Component loadings
loadings = pd.DataFrame(
    pca.components_.T,
    columns=[f"PC{i+1}" for i in range(len(time_cols))],
    index=time_cols
)
print("\nComponent Loadings (Correlations with Original Variables):")
print(loadings.round(3))

# Scree plot
(p9.ggplot(pd.DataFrame({"PC": range(1, len(var_exp)+1), "Variance": var_exp, "Cumulative": cum_var}), 
           p9.aes(x="PC", y="Variance"))
 + p9.geom_col(fill="#1c5789", alpha=0.7)
 + p9.geom_line(p9.aes(y="Cumulative"), color="red", size=1)
 + p9.geom_point(p9.aes(y="Cumulative"), color="red", size=2)
 + p9.geom_hline(yintercept=0.8, linetype="dashed", color="gray")
 + p9.labs(title="PCA Scree Plot: Response Time Components", 
           x="Principal Component", y="Variance Explained")
 + p9.theme_minimal())

# Add PC scores to incidents
incidents["RT_PC1"] = X_pca[:, 0]
incidents["RT_PC2"] = X_pca[:, 1]

# PC1 = Overall response time magnitude (all positive loadings)
# PC2 = Pre-dispatch vs On-scene contrast

# Visualize
(p9.ggplot(incidents, p9.aes(x="RT_PC1", y="RT_PC2", color="factor(priority)"))
 + p9.geom_point(alpha=0.4, size=1)
 + p9.labs(title="Incidents in PC Space (Response Time)", 
           x="PC1 (Overall Magnitude)", y="PC2 (Pre-dispatch vs On-scene)", color="Priority")
 + p9.theme_minimal())

# ── 10.2 Compliance PCA (Hourly Data) ─────────────────────────────────
compliance_cols = ["nine_one_one_answered_10s_pct", "nine_one_one_answered_15s_pct",
                   "nine_one_one_answered_20s_pct", "nine_one_one_answered_40s_pct",
                   "non_emergency_answered_10s_pct", "non_emergency_answered_15s_pct",
                   "non_emergency_answered_20s_pct", "non_emergency_answered_40s_pct"]

X_comp = calls[compliance_cols].copy()
scaler = StandardScaler()
X_comp_scaled = scaler.fit_transform(X_comp)

pca_comp = PCA()
X_comp_pca = pca_comp.fit_transform(X_comp_scaled)

var_exp_comp = pca_comp.explained_variance_ratio_
print("\nCompliance PCA Variance:")
for i, v in enumerate(var_exp_comp):
    print(f"  PC{i+1}: {v:.3f} ({v*100:.1f}%)")

# PC1 = Overall compliance level (all thresholds highly correlated)
# Add to calls
calls["Compliance_PC1"] = X_comp_pca[:, 0]

# ── 10.3 Hourly Volume PCA (24-Hour Profile) ──────────────────────────
# Pivot: each day = 24 features (hourly 911 volume)
volume_pivot = calls.pivot_table(
    index=calls["hour_start"].dt.date, 
    columns="hour_of_day", 
    values="nine_one_one_calls_received"
).fillna(0)

scaler = StandardScaler()
X_vol_scaled = scaler.fit_transform(volume_pivot)

pca_vol = PCA(n_components=5)
X_vol_pca = pca_vol.fit_transform(X_vol_scaled)

print("\nHourly Volume PCA Variance:")
for i, v in enumerate(pca_vol.explained_variance_ratio_):
    print(f"  PC{i+1}: {v:.3f} ({v*100:.1f}%)")

# PC1 = Overall volume level
# PC2 = Morning vs Evening contrast
# PC3 = Midday vs Night contrast

volume_pivot["PC1"] = X_vol_pca[:, 0]
volume_pivot["PC2"] = X_vol_pca[:, 1]

# Plot daily scores
vol_scores = volume_pivot[["PC1", "PC2"]].reset_index()
vol_scores["dow"] = pd.to_datetime(vol_scores["hour_start"]).dt.dayofweek

(p9.ggplot(vol_scores, p9.aes(x="PC1", y="PC2", color="factor(dow)"))
 + p9.geom_point(size=3)
 + p9.labs(title="Days in Volume PC Space", 
           x="PC1 (Overall Volume)", y="PC2 (AM vs PM)", color="DOW")
 + p9.theme_minimal())

# ── 10.4 PCA for Regression (Dimensionality Reduction) ────────────────
# Use PC scores as predictors instead of correlated time components
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score

# Target: total_elapsed_seconds (log)
y = np.log1p(incidents["total_elapsed_seconds"])

# Original features (multicollinear)
X_orig = X_scaled
lr_orig = LinearRegression()
cv_orig = cross_val_score(lr_orig, X_orig, y, cv=5, scoring="neg_mean_squared_error")
print(f"\nOriginal 7 features CV RMSE: {np.sqrt(-cv_orig.mean()):.4f}")

# PCA features (orthogonal)
X_pca_2 = X_pca[:, :2]  # First 2 PCs explain ~90%+
lr_pca = LinearRegression()
cv_pca = cross_val_score(lr_pca, X_pca_2, y, cv=5, scoring="neg_mean_squared_error")
print(f"First 2 PCs CV RMSE: {np.sqrt(-cv_pca.mean()):.4f}")

# Compare coefficients interpretability
print("\nOriginal coefficients:")
for name, coef in zip(time_cols, lr_orig.fit(X_orig, y).coef_):
    print(f"  {name}: {coef:.4f}")

print("\nPCA coefficients (on PC1, PC2):")
for i, coef in enumerate(lr_pca.fit(X_pca_2, y).coef_):
    print(f"  PC{i+1}: {coef:.4f}")
```

### PCA Outputs by Audience
- **Executive**: Single "Response Time Index" (PC1) for dashboards
- **Operational**: Compliance PC1 as overall health metric
- **Shift Supervisor**: Daily volume PC scores for shift classification
- **Analyst**: Full component analysis, loadings interpretation, regression use

---

## 11. Causal Inference

> **Use for estimating the effect of a change, like how many additional orders a free shipping offer generated.**

### Purpose
Estimate causal effects, not just associations. Requires careful design.

### Causal Questions in 9-1-1 Context

| Question | Treatment | Outcome | Confounders | Design |
|----------|-----------|---------|-------------|--------|
| Does new dispatch protocol reduce queue time? | Protocol (before/after) | `dispatch_queue_seconds` | Priority, agency, hour, volume | Diff-in-Diff, ITS |
| Does adding a calltaker improve 10s answer rate? | Staffing level | `nine_one_one_answered_10s_pct` | Volume, hour, dow | Regression discontinuity |
| Does priority upgrade reduce response time? | Priority assignment | `total_elapsed_seconds` | Problem nature, location, time | IV, Matching |
| Does shift overlap reduce handoff delays? | Overlap period | Handoff incident queue time | Volume, complexity | RDD |

### Python Examples

```python
import pandas as pd
import numpy as np
import statsmodels.api as sm
import statsmodels.formula.api as smf
from scipy import stats
import pingouin as pg

incidents = pd.read_csv("oz_test_incidents.csv", 
    parse_dates=["call_start_time", "incident_start_time",
                 "time_phone_pickup", "time_call_enters_queue",
                 "time_first_unit_assigned", "time_unit_enroute",
                 "time_unit_arrived", "time_last_unit_cleared",
                 "time_call_closed", "time_phone_disconnect"])

# Feature engineering
incidents["hour"] = incidents["call_start_time"].dt.hour
incidents["dow"] = incidents["call_start_time"].dt.dayofweek
incidents["is_weekend"] = incidents["dow"].isin([5, 6]).astype(int)
incidents["log_queue"] = np.log1p(incidents["dispatch_queue_seconds"])

# ── 11.1 Difference-in-Differences (Simulated Protocol Change) ────────
# Assume protocol change at mid-week (day 3)
incidents["post"] = (incidents["call_start_time"].dt.dayofweek >= 3).astype(int)
incidents["treated"] = (incidents["agency"] == "LAW").astype(int)  # LAW gets new protocol
incidents["did"] = incidents["post"] * incidents["treated"]

# DiD regression
did_model = smf.ols(
    formula="log_queue ~ post + treated + did + C(priority) + hour + is_weekend",
    data=incidents
).fit()

print("Difference-in-Differences:")
print(did_model.summary().tables[1])
print(f"\nDiD Estimate (treated×post): {did_model.params['did']:.4f}")
print(f"  p-value: {did_model.pvalues['did']:.4f}")

# Parallel trends check (pre-period only)
pre_data = incidents[incidents["post"] == 0]
parallel_check = smf.ols(
    formula="log_queue ~ treated * C(call_start_time.dt.dayofweek) + C(priority)",
    data=pre_data
).fit()
print("\nParallel Trends Test (pre-period interaction):")
print(parallel_check.summary().tables[1].filter(like="treated"))

# ── 11.2 Interrupted Time Series (Policy Change) ──────────────────────
# Aggregate to daily compliance
daily = incidents.set_index("call_start_time").resample("D").agg(
    median_queue=("dispatch_queue_seconds", "median"),
    volume=("id_number", "count"),
    pct_queue_64s=("dispatch_queue_seconds", lambda x: (x <= 64).mean() * 100)
).reset_index()

daily["time"] = range(len(daily))
daily["post"] = (daily["time"] >= 3).astype(int)  # Change at day 3
daily["time_post"] = daily["time"] * daily["post"]

# ITS model: Y = β0 + β1*time + β2*post + β3*time_post + ε
its_model = smf.ols(
    formula="median_queue ~ time + post + time_post + volume",
    data=daily
).fit()

print("\nInterrupted Time Series:")
print(its_model.summary().tables[1])
print(f"\nLevel change (post): {its_model.params['post']:.2f}")
print(f"  p-value: {its_model.pvalues['post']:.4f}")
print(f"Slope change (time_post): {its_model.params['time_post']:.4f}")
print(f"  p-value: {its_model.pvalues['time_post']:.4f}")

# ── 11.3 Propensity Score Matching (Priority Effect) ──────────────────
# Does being assigned Priority 1 vs 2 cause faster response?
# Match on: agency, problem_nature, hour, dow, location proxies

from sklearn.neighbors import NearestNeighbor

# Binary treatment: Priority 1 (highest) vs Priority 2
priority_data = incidents[incidents["priority"].isin([1, 2])].copy()
priority_data["treatment"] = (priority_data["priority"] == 1).astype(int)

# Propensity score model
ps_model = smf.logit(
    formula="treatment ~ C(agency) + C(problem_nature) + hour + C(dow) + C(shift_label)",
    data=priority_data
).fit()

priority_data["propensity"] = ps_model.predict(priority_data)

# 1:1 Nearest neighbor matching
treated = priority_data[priority_data["treatment"] == 1]
control = priority_data[priority_data["treatment"] == 0]

matched_pairs = []
for _, t_row in treated.iterrows():
    # Find closest control
    distances = np.abs(control["propensity"] - t_row["propensity"])
    idx = distances.idxmin()
    matched_pairs.append((t_row.name, idx))

matched_treated = priority_data.loc([pair[0] for pair in matched_pairs])
matched_control = priority_data.loc([pair[1] for pair in matched_pairs])

# Balance check
for covar in ["agency", "problem_nature", "hour", "dow", "shift_label"]:
    print(f"\nBalance check: {covar}")
    print(f"  Treated: {matched_treated[covar].value_counts(normalize=True).head(3).to_dict()}")
    print(f"  Control: {matched_control[covar].value_counts(normalize=True).head(3).to_dict()}")

# ATT estimation
att = matched_treated["log_queue"].mean() - matched_control["log_queue"].mean()
print(f"\nATT (Priority 1 vs 2 on log queue): {att:.4f}")

# Bootstrap CI
boot_atts = []
for _ in range(1000):
    sample = np.random.choice(len(matched_pairs), len(matched_pairs), replace=True)
    t_sample = matched_treated.iloc[sample]["log_queue"].mean()
    c_sample = matched_control.iloc[sample]["log_queue"].mean()
    boot_atts.append(t_sample - c_sample)

ci_lower, ci_upper = np.percentile(boot_atts, [2.5, 97.5])
print(f"95% Bootstrap CI: [{ci_lower:.4f}, {ci_upper:.4f}]")

# ── 11.4 Regression Discontinuity (Staffing Threshold) ────────────────
# If we had a staffing rule: "Add calltaker when queue > 5 calls"
# Simulate running variable: queue length at hour start
calls = pd.read_csv("oz_test_hourly_call_counts.csv", parse_dates=["hour_start"])
calls["queue_proxy"] = calls["nine_one_one_calls_received"]  # Proxy

# Simulate threshold at 5 calls
calls["above_threshold"] = (calls["queue_proxy"] > 5).astype(int)
calls["distance"] = calls["queue_proxy"] - 5

# Local linear regression around cutoff
rd_data = calls[np.abs(calls["distance"]) <= 3].copy()
rd_model = smf.ols(
    formula="nine_one_one_answered_20s_pct ~ above_threshold + distance + above_threshold:distance",
    data=rd_data
).fit()

print("\nRegression Discontinuity (at queue=5):")
print(rd_model.summary().tables[1])
print(f"\nTreatment effect at cutoff: {rd_model.params['above_threshold']:.2f} pct points")

# ── 11.5 Instrumental Variables (IV) ──────────────────────────────────
# Example: Does higher call volume CAUSE longer queue times?
# IV: Exogenous weather event (not in our data, but template)
# This is a template for when external instruments are available

"""
# 2SLS Template
from statsmodels.sandbox.regression.gmm import IV2SLS

# First stage: volume ~ instrument + controls
# Second stage: queue_time ~ predicted_volume + controls

iv_model = IV2SLS(
    dependent=incidents["dispatch_queue_seconds"],
    exog=incidents[["priority", "hour", "is_weekend"]],  # Controls
    endog=incidents["nine_one_one_calls_received"],      # Endogenous
    instrument=weather_instrument                        # Exogenous
).fit()
"""
```

### Causal Inference Checklist
- [ ] Clearly define treatment, outcome, population
- [ ] Identify confounders (draw DAG)
- [ ] Choose design: RCT, DiD, ITS, RDD, IV, Matching
- [ ] Check identification assumptions (parallel trends, exclusion restriction, etc.)
- [ ] Sensitivity analysis (E-value, Rosenbaum bounds)
- [ ] Report: ATT/ATE, CI, p-value, assumption checks

---

## 12. Text Analysis

> **Use for pulling themes from written feedback, like finding the most common complaints in customer reviews.**

### Purpose
Extract insights from unstructured text fields.

### Text Fields in Our Data

| Field | Type | Analysis Potential |
|-------|------|-------------------|
| `problem_nature` | Categorical (short text) | Frequency, n-grams, categorization |
| `call_disposition` | Categorical (codes) | Code analysis, UNDEFINED investigation |
| `street_address` / `location` | Address text | Geocoding, neighborhood clustering |
| `method_of_call_reception` | Categorical | Channel analysis |

### Python Examples

```python
import pandas as pd
import numpy as np
import re
from collections import Counter
import plotnine as p9

incidents = pd.read_csv("oz_test_incidents.csv", 
    parse_dates=["call_start_time", "incident_start_time",
                 "time_phone_pickup", "time_call_enters_queue",
                 "time_first_unit_assigned", "time_unit_enroute",
                 "time_unit_arrived", "time_last_unit_cleared",
                 "time_call_closed", "time_phone_disconnect"])

# ── 12.1 Problem Nature Text Analysis ─────────────────────────────────
# These are short codes but we can analyze patterns

# Frequency
problem_freq = incidents["problem_nature"].value_counts()
print("Top 20 Problem Natures:")
print(problem_freq.head(20))

# N-gram analysis (word level)
def extract_ngrams(text_series, n=2):
    """Extract n-grams from text series."""
    all_ngrams = []
    for text in text_series.dropna():
        words = str(text).lower().split()
        for i in range(len(words) - n + 1):
            all_ngrams.append(" ".join(words[i:i+n]))
    return Counter(all_ngrams)

# Bigrams
bigrams = extract_ngrams(incidents["problem_nature"], 2)
print("\nTop 20 Bigrams in Problem Nature:")
for bg, count in bigrams.most_common(20):
    print(f"  {bg}: {count}")

# Trigrams
trigrams = extract_ngrams(incidents["problem_nature"], 3)
print("\nTop 15 Trigrams:")
for tg, count in trigrams.most_common(15):
    print(f"  {tg}: {count}")

# ── 12.2 Problem Nature Categorization ────────────────────────────────
# Group into semantic categories
def categorize_problem(nature):
    nature = str(nature).lower()
    if any(w in nature for w in ["breathing", "cardiac", "chest", "pain", "fall", "injury", 
                                  "sick", "allergic", "seizure", "unconscious", "overdose", 
                                  "pregnancy", "childbirth", "mental", "heat", "cold", "exposure",
                                  "abdominal", "traumatic", "assist fire"]):
        return "Medical"
    elif any(w in nature for w in ["fire", "gas", "odor", "smoke", "brush", "grass", "vehicle fire",
                                    "structure", "elevator", "co", "overheat", "water", "rescue",
                                    "medical assist", "alarm"]):
        return "Fire"
    elif any(w in nature for w in ["traffic", "stop", "reckless", "dui", "impaired", "collision",
                                    "theft", "vehicle", "burglary", "robbery", "assault", "harassment",
                                    "trespass", "vandalism", "noise", "animal", "welfare", "suspicious",
                                    "shots", "drug", "narcotic", "weapon", "missing", "disorderly",
                                    "public assist", "civil"]):
        return "Law Enforcement"
    else:
        return "Other"

incidents["problem_category"] = incidents["problem_nature"].apply(categorize_problem)

cat_dist = incidents["problem_category"].value_counts(normalize=True) * 100
print("\nProblem Category Distribution:")
print(cat_dist.round(1))

# Response times by category
cat_times = incidents.groupby("problem_category").agg(
    n=("id_number", "count"),
    median_queue=("dispatch_queue_seconds", "median"),
    median_total=("total_elapsed_seconds", "median"),
    pct_priority12=("priority", lambda x: x.isin([1, 2]).mean() * 100)
).round(1)
print("\nResponse Times by Category:")
print(cat_times)

# ── 12.3 Call Disposition Analysis ────────────────────────────────────
# UNDEFINED is a data quality issue
disp_freq = incidents["call_disposition"].value_counts()
print("\nCall Disposition Distribution:")
print(disp_freq)

# UNDEFINED by shift/calltaker
undefined_by_shift = incidents[incidents["call_disposition"] == "UNDEFINED"].groupby("shift_label").size()
total_by_shift = incidents.groupby("shift_label").size()
undefined_pct = (undefined_by_shift / total_by_shift * 100).round(1)
print("\n% UNDEFINED by Shift:")
print(undefined_pct)

# ── 12.4 Location/Address Text Analysis ───────────────────────────────
# Extract street names for hotspot analysis
def extract_street(address):
    if pd.isna(address):
        return None
    # Simple extraction: first word after number
    match = re.search(r'\d+\s+(.+?)\s+(?:Avenue|Street|Drive|Road|Boulevard)', str(address))
    if match:
        return match.group(1).strip()
    return None

incidents["street_name"] = incidents["street_address"].apply(extract_street)
street_freq = incidents["street_name"].value_counts()
print("\nTop 20 Street Names:")
print(street_freq.head(20))

# ── 12.5 Method of Call Reception Text ────────────────────────────────
method_freq = incidents["method_of_call_reception"].value_counts()
print("\nMethod of Call Reception:")
print(method_freq)

# NOT CAPTURED analysis
not_captured = incidents[incidents["method_of_call_reception"] == "NOT CAPTURED"]
print(f"\nNOT CAPTURED: {len(not_captured)} incidents ({len(not_captured)/len(incidents)*100:.1f}%)")
print("Agencies:", not_captured["agency"].value_counts().to_dict())

# ── 12.6 Text Visualization ───────────────────────────────────────────
# Word cloud alternative: horizontal bar chart of top problems
top_problems = problem_freq.head(15).reset_index()
top_problems.columns = ["problem", "count"]

(p9.ggplot(top_problems, p9.aes(x="count", y="problem"))
 + p9.geom_col(fill="#1c5789")
 + p9.labs(title="Top 15 Problem Natures", x="Count", y="")
 + p9.theme_minimal())

# Category distribution
(p9.ggplot(incidents, p9.aes(x="problem_category", fill="problem_category"))
 + p9.geom_bar()
 + p9.geom_text(p9.aes(label=p9.after_stat("count")), stat="count", va="bottom")
 + p9.labs(title="Problem Category Distribution", x="", y="Count")
 + p9.theme_minimal())

# ── 12.7 Advanced: TF-IDF on Problem Narratives (if available) ────────
# If we had free-text narratives, we'd use:
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF

tfidf = TfidfVectorizer(max_features=1000, stop_words='english', ngram_range=(1,2))
X_tfidf = tfidf.fit_transform(narratives)

nmf = NMF(n_components=5, random_state=42)
topics = nmf.fit_transform(X_tfidf)

# Print top words per topic
for i, topic in enumerate(nmf.components_):
    top_words = [tfidf.get_feature_names_out()[j] for j in topic.argsort()[-10:]]
    print(f"Topic {i}: {', '.join(top_words[::-1])}")
"""
```

### Text Analysis Outputs
- **Executive**: Top problem categories, UNDEFINED disposition rate
- **Operational**: Data quality report on NOT CAPTURED methods
- **Shift Supervisor**: Shift-specific UNDEFINED rates by calltaker
- **Analyst**: N-gram patterns, street-level hotspots, topic models (if narratives exist)

---

## Summary: Analysis Type → Audience Mapping

| Analysis Type | Executive | Operational | Shift Supervisor | Analyst |
|---------------|-----------|-------------|------------------|---------|
| **Descriptive** | KPI scorecards | Percentile compliance | Shift summaries | Full diagnostics |
| **EDA** | Trend visualizations | Compliance heatmaps | Personnel outliers | Correlation matrices |
| **Correlation** | Volume-compliance link | Queue-turnout coupling | Shift-disposition | Partial correlations |
| **Regression** | Forecast models | Compliance predictors | Handle time models | Mixed effects, GLMs |
| **Hypothesis Testing** | Trend significance | Standards compliance | Shift differences | Effect sizes, power |
| **Time Series** | Weekly/monthly forecasts | Daily control charts | Shift patterns | STL, SARIMA, change points |
| **Cohort** | Agency retention | Calltaker learning curves | Shift cohort trends | Problem nature trajectories |
| **Funnel** | Standards compliance | Stage bottlenecks | Shift funnel comparison | Priority/agency funnels |
| **Cluster** | Incident archetypes | Hour templates | Calltaker profiles | Full cluster diagnostics |
| **PCA** | Response Time Index | Compliance PC1 | Daily volume PCs | Orthogonal predictors |
| **Causal Inference** | Policy impact estimates | Protocol DiD | Staffing RDD | IV, Matching, Sensitivity |
| **Text Analysis** | Top problems, data quality | Disposition audit | Calltaker data quality | N-grams, categorization |

---

## Implementation Priority (Quick Wins First)

1. **Week 1**: Descriptive + EDA + Funnel (baseline reports for all audiences)
2. **Week 2**: Correlation + Hypothesis Testing (compliance validation)
3. **Week 3**: Time Series + Cohort (trend detection, learning curves)
4. **Week 4**: Regression + PCA (predictive models, dimensionality reduction)
5. **Month 2**: Cluster + Causal Inference (archetypes, policy evaluation)
6. **Ongoing**: Text Analysis (data quality monitoring)

---

## Library Requirements Summary

```python
# Core
pandas>=2.3, numpy>=2.0, scipy>=1.13, statsmodels>=0.14

# Visualization
plotnine>=0.13, matplotlib>=3.11, seaborn>=0.13, missingno

# Statistics
pingouin, scikit-posthocs, ruptures

# ML/Clustering
scikit-learn>=1.5

# Time Series
prophet (optional), statsforecast (optional)

# Causal Inference
causalml (optional), econml (optional)

# Text
nltk, spacy (if narratives available)
```

---

*Document created from LinkedIn post analysis types applied to 9-1-1 dispatch data in Reporting Engine folder.*