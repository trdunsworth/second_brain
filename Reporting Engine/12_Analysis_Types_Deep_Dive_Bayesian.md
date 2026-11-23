# 12 Types of Data Analysis — Deep Dive for 9-1-1 Dispatch Data (Frequentist + Bayesian)

**Source**: LinkedIn post by Dawn Choo — "12 types of data analysis everyone should know"  
**Data Files**: 
- `oz_test_incidents.csv` — 1,000+ individual incident records with timestamps, agencies, priorities, response time components
- `oz_test_hourly_call_counts.csv` — 168 hourly rows (7 days × 24 hours) of 9-1-1 and non-emergency call volumes, answer rates, abandonment

**Target Audiences**: Executive Staff, Operational Management, Shift Supervisors, Analysts/Researchers

**Standards Referenced**: NENA-STA-020.1, APCO ANS 3.101, NFPA 1710, NFPA 1221

---

## Bayesian Analysis Framework for 9-1-1 Data

Before diving into each analysis type, here's the Bayesian toolkit we'll use throughout:

### Core Bayesian Libraries
```python
# Primary Bayesian libraries
import pymc as pm           # PyMC v5+ (formerly PyMC3)
import arviz as az          # Exploratory analysis of Bayesian models
import bambi as bmb         # Formula-based Bayesian GLMs (R's brms equivalent)
import pymc_experimental as pme  # For advanced models

# For Bayesian structural time series
import pymc_bart as pmb     # Bayesian Additive Regression Trees
# import prophet as prophet  # Has Bayesian backbone

# For causal inference
import causalpy as cp       # Bayesian causal inference (DiD, ITS, etc.)
# or use pymc directly for custom causal models
```

### Bayesian Workflow (Gelman et al.)
```python
def bayesian_workflow(model, data, draws=2000, tune=1000, chains=4):
    """
    Standard Bayesian workflow:
    1. Prior predictive checks
    2. Sampling
    3. Convergence diagnostics (R-hat, ESS)
    4. Posterior predictive checks
    5. Model comparison (LOO, WAIC)
    6. Sensitivity analysis (priors)
    """
    with model:
        # 1. Prior predictive
        prior_pred = pm.sample_prior_predictive(samples=500)
        az.plot_ppc(prior_pred, group="prior")
        
        # 2. Sampling
        trace = pm.sample(draws=draws, tune=tune, chains=chains, 
                         target_accept=0.95, random_seed=42)
        
        # 3. Convergence
        summary = az.summary(trace, hdi_prob=0.95)
        print(f"R-hat max: {summary['r_hat'].max():.3f}")
        print(f"ESS min: {summary['ess_bulk'].min():.0f}")
        
        # 4. Posterior predictive
        post_pred = pm.sample_posterior_predictive(trace, extend_inferencedata=True)
        az.plot_ppc(post_pred)
        
        # 5. Model comparison (if multiple models)
        # loo = az.loo(trace)
        
    return trace, prior_pred, post_pred
```

### Informative Priors for 9-1-1 Domain
```python
# Based on NENA/NFPA standards and historical data
PRIORS = {
    # Call answering: NENA says 90% ≤ 15s, 95% ≤ 20s
    "answer_rate_15s": pm.Beta("p", alpha=90, beta=10),  # Prior mean 0.90
    "answer_rate_20s": pm.Beta("p", alpha=95, beta=5),   # Prior mean 0.95
    
    # NFPA 1710 turnout: 60s (EMS) / 80s (Fire) at 90th percentile
    "turnout_ems": pm.LogNormal("mu", mu=np.log(45), sigma=0.5),  # Median ~45s
    "turnout_fire": pm.LogNormal("mu", mu=np.log(60), sigma=0.5), # Median ~60s
    
    # Dispatch queue: NFPA 64s (90%) / 106s (95%)
    "dispatch_queue": pm.LogNormal("mu", mu=np.log(50), sigma=0.6),
    
    # Travel time: NFPA 240s at 90%
    "travel_time": pm.LogNormal("mu", mu=np.log(180), sigma=0.7),
    
    # Call volume: Typical hourly rates
    "hourly_volume_911": pm.Gamma("alpha", alpha=5, beta=1),  # Mean ~5
    "hourly_volume_non_emerg": pm.Gamma("alpha", alpha=4, beta=1), # Mean ~4
    
    # Effect sizes (conservative)
    "effect_size": pm.Normal("mu", mu=0, sigma=0.5),  # Cohen's d scale
}
```

---

## 1. Descriptive Analysis — Deep Dive

> **Use for summarizing your data, like finding the median order value last month.**

### Frequentist Approach

#### Executive: KPI Scorecard with Standards Comparison
```python
import pandas as pd
import numpy as np
from scipy import stats
import pingouin as pg

incidents = pd.read_csv("oz_test_incidents.csv", 
    parse_dates=["call_start_time", "incident_start_time",
                 "time_phone_pickup", "time_call_enters_queue",
                 "time_first_unit_assigned", "time_unit_enroute",
                 "time_unit_arrived", "time_last_unit_cleared",
                 "time_call_closed", "time_phone_disconnect"])

calls = pd.read_csv("oz_test_hourly_call_counts.csv", parse_dates=["hour_start"])

def executive_kpi_scorecard(incidents, calls):
    """Generate executive KPI scorecard with standards comparison."""
    
    # Volume metrics
    total_911 = calls["nine_one_one_calls_received"].sum()
    total_non_emerg = calls["non_emergency_calls_received"].sum()
    total_incidents = len(incidents)
    
    # NENA Compliance
    answered_15s = int((calls["nine_one_one_answered_15s_pct"]/100 * 
                        calls["nine_one_one_calls_received"]).sum())
    answered_20s = int((calls["nine_one_one_answered_20s_pct"]/100 * 
                        calls["nine_one_one_calls_received"]).sum())
    
    pct_15s = answered_15s / total_911 * 100
    pct_20s = answered_20s / total_911 * 100
    
    # NFPA 1710 Percentiles
    nfpa_metrics = {}
    
    # Dispatch queue (64s/106s)
    dq_p90 = np.percentile(incidents["dispatch_queue_seconds"].dropna(), 90)
    dq_p95 = np.percentile(incidents["dispatch_queue_seconds"].dropna(), 95)
    nfpa_metrics["Dispatch Queue"] = {"p90": dq_p90, "p95": dq_p95, 
                                       "target_90": 64, "target_95": 106}
    
    # Turnout by agency
    for agency, target in [("EMS", 60), ("FIRE", 80)]:
        agency_data = incidents[incidents["agency"]==agency]["turnout_seconds"].dropna()
        if len(agency_data) > 0:
            nfpa_metrics[f"Turnout ({agency})"] = {
                "p90": np.percentile(agency_data, 90),
                "target_90": target
            }
    
    # Travel time (240s)
    travel_p90 = np.percentile(incidents["travel_seconds"].dropna(), 90)
    nfpa_metrics["Travel Time"] = {"p90": travel_p90, "target_90": 240}
    
    # Total response time proxy
    total_p90 = np.percentile(incidents["total_elapsed_seconds"].dropna(), 90)
    nfpa_metrics["Total Response"] = {"p90": total_p90, "target_90": 320}  # ~5:20
    
    # Build scorecard
    scorecard = {
        "Total 9-1-1 Calls": total_911,
        "Total Non-Emergency": total_non_emerg,
        "Total Incidents": total_incidents,
        "NENA 15s Compliance": f"{pct_15s:.1f}% (Target: 90%)",
        "NENA 20s Compliance": f"{pct_20s:.1f}% (Target: 95%)",
    }
    
    for metric, vals in nfpa_metrics.items():
        if "p95" in vals:
            status = "✅" if vals["p90"] <= vals["target_90"] and vals["p95"] <= vals["target_95"] else "❌"
            scorecard[f"NFPA {metric}"] = f"P90={vals['p90']:.0f}s (≤{vals['target_90']}s), P95={vals['p95']:.0f}s (≤{vals['target_95']}s) {status}"
        else:
            status = "✅" if vals["p90"] <= vals["target_90"] else "❌"
            scorecard[f"NFPA {metric}"] = f"P90={vals['p90']:.0f}s (≤{vals['target_90']}s) {status}"
    
    return pd.DataFrame(list(scorecard.items()), columns=["Metric", "Value"])

print(executive_kpi_scorecard(incidents, calls).to_string(index=False))
```

#### Operational: Process Capability Analysis (Cp/Cpk)
```python
def process_capability(data, spec_lsl=None, spec_usl=None, target=None):
    """Calculate Cp, Cpk, Cpm for a process."""
    data = data.dropna()
    mean = data.mean()
    std = data.std(ddof=1)
    
    results = {"mean": mean, "std": std, "n": len(data)}
    
    if spec_usl and spec_lsl:
        # Cp = (USL - LSL) / (6*sigma)
        cp = (spec_usl - spec_lsl) / (6 * std)
        # Cpk = min((USL - mean), (mean - LSL)) / (3*sigma)
        cpu = (spec_usl - mean) / (3 * std)
        cpl = (mean - spec_lsl) / (3 * std)
        cpk = min(cpu, cpl)
        results["Cp"] = cp
        results["Cpk"] = cpk
        results["Cpu"] = cpu
        results["Cpl"] = cpl
    
    if target:
        # Cpm = (USL - LSL) / (6*sqrt(sigma^2 + (mean-target)^2))
        tau = np.sqrt(std**2 + (mean - target)**2)
        cpm = (spec_usl - spec_lsl) / (6 * tau) if spec_usl and spec_lsl else np.nan
        results["Cpm"] = cpm
    
    # Interpretation
    def interpret_cpk(cpk):
        if cpk >= 1.67: return "Excellent (Six Sigma)"
        elif cpk >= 1.33: return "Good"
        elif cpk >= 1.0: return "Adequate"
        else: return "Inadequate"
    
    if "Cpk" in results:
        results["Interpretation"] = interpret_cpk(results["Cpk"])
    
    return results

# Dispatch queue vs NFPA 64s/106s
dq_cap = process_capability(incidents["dispatch_queue_seconds"], 
                            spec_lsl=0, spec_usl=106, target=64)
print("Dispatch Queue Capability:")
for k, v in dq_cap.items():
    print(f"  {k}: {v}")

# Turnout EMS vs 60s
ems_turnout = incidents[incidents["agency"]=="EMS"]["turnout_seconds"]
ems_cap = process_capability(ems_turnout, spec_lsl=0, spec_usl=60, target=45)
print("\nEMS Turnout Capability:")
for k, v in ems_cap.items():
    print(f"  {k}: {v}")
```

#### Shift Supervisor: Personnel Scorecards with Outlier Detection
```python
def personnel_scorecard(incidents, min_calls=10):
    """Generate per-calltaker/dispatcher scorecards."""
    
    # Calltaker metrics
    ct_stats = incidents.groupby("calltaker").agg(
        n_calls=("id_number", "count"),
        median_pickup=("pickup_delay_seconds", "median"),
        median_interview=("interview_seconds", "median"),
        pct_undefined=("call_disposition", lambda x: (x=="UNDEFINED").mean()*100),
        median_total=("total_elapsed_seconds", "median"),
    ).reset_index()
    
    ct_stats = ct_stats[ct_stats["n_calls"] >= min_calls]
    
    # Flag outliers using IQR on each metric
    for col in ["median_pickup", "median_interview", "median_total", "pct_undefined"]:
        q1 = ct_stats[col].quantile(0.25)
        q3 = ct_stats[col].quantile(0.75)
        iqr = q3 - q1
        ct_stats[f"{col}_outlier"] = (ct_stats[col] < q1 - 1.5*iqr) | (ct_stats[col] > q3 + 1.5*iqr)
    
    ct_stats["any_outlier"] = ct_stats.filter(like="_outlier").any(axis=1)
    
    # Dispatcher metrics
    disp_stats = incidents.groupby("dispatcher").agg(
        n_calls=("id_number", "count"),
        median_queue=("dispatch_queue_seconds", "median"),
        median_turnout=("turnout_seconds", "median"),
        median_travel=("travel_seconds", "median"),
    ).reset_index()
    
    disp_stats = disp_stats[disp_stats["n_calls"] >= min_calls]
    
    for col in ["median_queue", "median_turnout", "median_travel"]:
        q1 = disp_stats[col].quantile(0.25)
        q3 = disp_stats[col].quantile(0.75)
        iqr = q3 - q1
        disp_stats[f"{col}_outlier"] = (disp_stats[col] < q1 - 1.5*iqr) | (disp_stats[col] > q3 + 1.5*iqr)
    
    disp_stats["any_outlier"] = disp_stats.filter(like="_outlier").any(axis=1)
    
    return ct_stats, disp_stats

ct_stats, disp_stats = personnel_scorecard(incidents)
print("Calltaker Scorecard (outliers flagged):")
print(ct_stats[ct_stats["any_outlier"]].to_string(index=False))
print("\nDispatcher Scorecard (outliers flagged):")
print(disp_stats[disp_stats["any_outlier"]].to_string(index=False))
```

#### Analyst: Full Distribution Diagnostics Table
```python
def distribution_diagnostics_table(df, numeric_cols):
    """Comprehensive distribution diagnostics for modeling decisions."""
    
    results = []
    for col in numeric_cols:
        s = df[col].dropna()
        n = len(s)
        
        # Basic stats
        row = {
            "Variable": col,
            "N": n,
            "Missing_%": df[col].isna().mean() * 100,
            "Mean": s.mean(),
            "Median": s.median(),
            "Std": s.std(),
            "CV": s.std() / s.mean() if s.mean() != 0 else np.nan,
            "Skew": stats.skew(s),
            "Kurtosis": stats.kurtosis(s),
            "IQR": s.quantile(0.75) - s.quantile(0.25),
            "P01": s.quantile(0.01),
            "P05": s.quantile(0.05),
            "P25": s.quantile(0.25),
            "P50": s.quantile(0.50),
            "P75": s.quantile(0.75),
            "P95": s.quantile(0.95),
            "P99": s.quantile(0.99),
        }
        
        # Normality tests
        if n <= 5000:
            shapiro_stat, shapiro_p = stats.shapiro(s)
            row["Shapiro_W"] = shapiro_stat
            row["Shapiro_p"] = shapiro_p
        else:
            # Use Anderson-Darling for larger samples
            ad_result = stats.anderson(s, dist='norm')
            row["AD_stat"] = ad_result.statistic
            row["AD_crit_5%"] = ad_result.critical_values[2]  # 5% level
        
        # Distribution family suggestions
        skew = row["Skew"]
        if skew > 2:
            row["Suggested_Family"] = "Log-normal / Gamma / Weibull"
        elif skew > 1:
            row["Suggested_Family"] = "Gamma / Log-normal"
        elif skew < -1:
            row["Suggested_Family"] = "Beta (if bounded) / Reflected Gamma"
        else:
            row["Suggested_Family"] = "Normal / t-distribution"
        
        results.append(row)
    
    return pd.DataFrame(results)

time_cols = ["pickup_delay_seconds", "dispatch_queue_seconds", 
             "turnout_seconds", "travel_seconds", "on_scene_seconds",
             "total_elapsed_seconds", "interview_seconds"]

diag_table = distribution_diagnostics_table(incidents, time_cols)
pd.set_option('display.max_columns', None)
pd.set_option('display.width', 200)
print(diag_table.round(3).to_string(index=False))
```

### Bayesian Approach

#### Bayesian Descriptive: Posterior Distributions for Key Metrics
```python
import pymc as pm
import arviz as az
import numpy as np

def bayesian_descriptive(data, metric_name, prior=None):
    """
    Bayesian estimation of descriptive statistics.
    Returns posterior distributions for mean, median, sd, quantiles.
    """
    data = data.dropna().values
    
    with pm.Model() as model:
        # Weakly informative priors for location/scale
        if prior is None:
            # For positive skewed data (times), use log-normal
            if (data > 0).all() and stats.skew(data) > 1:
                mu = pm.Normal("mu", mu=np.log(data).mean(), sigma=2)
                sigma = pm.HalfNormal("sigma", sigma=1)
                likelihood = pm.LogNormal("likelihood", mu=mu, sigma=sigma, observed=data)
            else:
                mu = pm.Normal("mu", mu=data.mean(), sigma=data.std()*2)
                sigma = pm.HalfNormal("sigma", sigma=data.std()*2)
                likelihood = pm.Normal("likelihood", mu=mu, sigma=sigma, observed=data)
        else:
            # Use provided informative priors
            mu = prior["mu"]
            sigma = prior["sigma"]
            likelihood = pm.Normal("likelihood", mu=mu, sigma=sigma, observed=data)
        
        # Derived quantities
        median = pm.Deterministic("median", pm.math.exp(mu) if "LogNormal" in str(likelihood) else mu)
        
        # Quantiles (using log-normal or normal)
        if "LogNormal" in str(likelihood):
            p90 = pm.Deterministic("p90", pm.math.exp(mu + 1.282 * sigma))
            p95 = pm.Deterministic("p95", pm.math.exp(mu + 1.645 * sigma))
            p99 = pm.Deterministic("p99", pm.math.exp(mu + 2.326 * sigma))
        else:
            p90 = pm.Deterministic("p90", mu + 1.282 * sigma)
            p95 = pm.Deterministic("p95", mu + 1.645 * sigma)
            p99 = pm.Deterministic("p99", mu + 2.326 * sigma)
        
        trace = pm.sample(2000, tune=1000, chains=4, target_accept=0.95, random_seed=42)
    
    return trace, model

# Example: Dispatch queue seconds
trace_dq, model_dq = bayesian_descriptive(incidents["dispatch_queue_seconds"], "dispatch_queue")

# Summarize posterior
summary = az.summary(trace_dq, var_names=["mu", "sigma", "median", "p90", "p95", "p99"], hdi_prob=0.95)
print(summary.round(2))

# Posterior predictive check
with model_dq:
    ppc = pm.sample_posterior_predictive(trace_dq, extend_inferencedata=True)
az.plot_ppc(ppc, group="posterior")
```

#### Bayesian Compliance Estimation (Binomial with Beta Prior)
```python
def bayesian_compliance_rate(successes, trials, prior_alpha=90, prior_beta=10):
    """
    Bayesian estimation of compliance rate with Beta-Binomial model.
    Prior: Beta(alpha, beta) - default reflects NENA 90% target.
    """
    with pm.Model() as model:
        # Prior informed by NENA standard
        p = pm.Beta("p", alpha=prior_alpha, beta=prior_beta)
        
        # Likelihood
        observed = pm.Binomial("observed", n=trials, p=p, observed=successes)
        
        # Posterior predictive for future periods
        future_trials = pm.Data("future_trials", np.array([trials]))
        future_successes = pm.Binomial("future_successes", n=future_trials, p=p)
        
        trace = pm.sample(2000, tune=1000, chains=4, target_accept=0.95, random_seed=42)
    
    return trace, model

# 9-1-1 15s compliance
total_911 = calls["nine_one_one_calls_received"].sum()
answered_15s = int((calls["nine_one_one_answered_15s_pct"]/100 * 
                    calls["nine_one_one_calls_received"]).sum())

trace_comp, model_comp = bayesian_compliance_rate(answered_15s, total_911)

# Probability that true rate exceeds 90%
posterior_p = trace_comp.posterior["p"].values.flatten()
prob_exceeds_90 = (posterior_p > 0.90).mean()
prob_exceeds_95 = (posterior_p > 0.95).mean()

print(f"Posterior mean compliance: {posterior_p.mean():.3f}")
print(f"95% HDI: {az.hdi(posterior_p, hdi_prob=0.95)}")
print(f"P(rate > 90%): {prob_exceeds_90:.3f}")
print(f"P(rate > 95%): {prob_exceeds_95:.3f}")

# Decision: If P(rate > 90%) < 0.95, flag for review
if prob_exceeds_90 < 0.95:
    print("⚠️  COMPLIANCE CONCERN: <95% probability of meeting NENA 90% threshold")
```

---

## 2. Exploratory Data Analysis (EDA) — Deep Dive

> **Use for spotting patterns and outliers, like products with unusually high return rates.**

### Frequentist EDA Protocol (Extended)

#### 2.1 Missingness Mechanism Analysis
```python
def missingness_analysis(df):
    """Comprehensive missingness analysis including MAR/MCAR testing."""
    
    # Missingness matrix
    missing_pct = df.isna().mean() * 100
    missing_df = pd.DataFrame({"Column": missing_pct.index, "Missing_%": missing_pct.values})
    missing_df = missing_df[missing_df["Missing_%"] > 0].sort_values("Missing_%", ascending=False)
    
    # Little's MCAR test (requires complete cases or imputation)
    from statsmodels.imputation.mice import MICEData
    try:
        mice = MICEData(df.select_dtypes(include=[np.number]))
        # Little's test not directly in statsmodels, use custom
    except:
        pass
    
    # Missingness correlation (are missingness patterns related?)
    missing_indicators = df.isna().astype(int)
    missing_corr = missing_indicators.corr()
    
    # Missingness by groups
    group_cols = ["agency", "shift_label", "priority", "call_disposition"]
    for gcol in group_cols:
        if gcol in df.columns:
            missing_by_group = df.groupby(gcol).apply(lambda x: x.isna().mean() * 100)
            print(f"\nMissingness by {gcol}:")
            print(missing_by_group[missing_by_group > 0].round(1))
    
    return missing_df, missing_corr

missing_df, missing_corr = missingness_analysis(incidents)
print("Missingness Summary:")
print(missing_df.to_string(index=False))
```

#### 2.2 Multi-Method Outlier Detection with Consensus
```python
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from scipy.stats import jarque_bera, normaltest

def comprehensive_outlier_detection(series, name="value"):
    """Consensus outlier detection using 8 methods."""
    s = series.dropna()
    
    flags = pd.DataFrame(index=s.index)
    
    # 1. IQR (standard)
    q1, q3 = s.quantile(0.25), s.quantile(0.75)
    iqr = q3 - q1
    flags["iqr_1.5"] = (s < q1 - 1.5*iqr) | (s > q3 + 1.5*iqr)
    flags["iqr_3.0"] = (s < q1 - 3.0*iqr) | (s > q3 + 3.0*iqr)
    
    # 2. Modified Z-score (MAD)
    median = s.median()
    mad = (s - median).abs().median()
    mod_z = 0.6745 * (s - median) / mad
    flags["mad_3.5"] = mod_z.abs() > 3.5
    
    # 3. Standard Z-score
    z = (s - s.mean()) / s.std()
    flags["z_3"] = z.abs() > 3
    
    # 4. Percentile (1/99)
    flags["pct_1_99"] = (s < s.quantile(0.01)) | (s > s.quantile(0.99))
    
    # 5. Grubbs' test (max only, iterative)
    # Simplified: flag if max/min extreme
    flags["grubbs"] = False  # Placeholder
    
    # 6. Isolation Forest (multivariate would use multiple cols)
    iso = IsolationForest(contamination=0.05, random_state=42)
    flags["isoforest"] = iso.fit_predict(s.values.reshape(-1,1)) == -1
    
    # 7. Local Outlier Factor
    lof = LocalOutlierFactor(n_neighbors=20, contamination=0.05)
    flags["lof"] = lof.fit_predict(s.values.reshape(-1,1)) == -1
    
    # 8. Mahalanobis (univariate = z-score essentially)
    # For multivariate, would use covariance matrix
    
    # Consensus: flagged by >=3 methods
    flags["consensus_3"] = flags.sum(axis=1) >= 3
    flags["consensus_4"] = flags.sum(axis=1) >= 4
    
    # Summary
    summary = {
        "variable": name,
        "n": len(s),
        "n_outliers_consensus3": flags["consensus_3"].sum(),
        "n_outliers_consensus4": flags["consensus_4"].sum(),
        "methods_agreement": flags.iloc[:, :-2].sum().to_dict()
    }
    
    return flags, summary

# Run on all time columns
all_flags = {}
all_summaries = []
for col in time_cols:
    flags, summ = comprehensive_outlier_detection(incidents[col], col)
    all_flags[col] = flags
    all_summaries.append(summ)

summary_df = pd.DataFrame(all_summaries)
print("Outlier Detection Summary:")
print(summary_df.to_string(index=False))
```

#### 2.3 Temporal Structure Deep Dive
```python
def temporal_structure_analysis(calls):
    """Deep temporal analysis of hourly call data."""
    
    calls = calls.copy()
    calls["hour"] = calls["hour_start"].dt.hour
    calls["dow"] = calls["hour_start"].dt.dayofweek
    calls["week"] = calls["hour_start"].dt.isocalendar().week
    
    # 1. ACF/PACF for 911 and non-emergency
    from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
    import matplotlib.pyplot as plt
    
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    plot_acf(calls["nine_one_one_calls_received"].dropna(), lags=48, ax=axes[0,0], title="911 ACF")
    plot_pacf(calls["nine_one_one_calls_received"].dropna(), lags=48, ax=axes[0,1], title="911 PACF")
    plot_acf(calls["non_emergency_calls_received"].dropna(), lags=48, ax=axes[1,0], title="Non-Emerg ACF")
    plot_pacf(calls["non_emergency_calls_received"].dropna(), lags=48, ax=axes[1,1], title="Non-Emerg PACF")
    plt.tight_layout()
    plt.show()
    
    # 2. Seasonal decomposition
    from statsmodels.tsa.seasonal import STL
    stl_911 = STL(calls.set_index("hour_start")["nine_one_one_calls_received"], period=24, robust=True)
    res_911 = stl_911.fit()
    
    stl_non = STL(calls.set_index("hour_start")["non_emergency_calls_received"], period=24, robust=True)
    res_non = stl_non.fit()
    
    # 3. Circadian pattern stability (hourly profile correlation across days)
    hourly_profile = calls.pivot_table(index="dow", columns="hour", 
                                        values="nine_one_one_calls_received", aggfunc="mean")
    profile_corr = hourly_profile.T.corr()
    
    # 4. Day-of-week effects (ANOVA/Kruskal)
    from scipy.stats import f_oneway, kruskal
    dow_groups = [g["nine_one_one_calls_received"].values for _, g in calls.groupby("dow")]
    f_stat, f_p = f_oneway(*dow_groups)
    h_stat, h_p = kruskal(*dow_groups)
    print(f"Day-of-Week Effect: ANOVA F={f_stat:.2f}, p={f_p:.4f}; Kruskal H={h_stat:.2f}, p={h_p:.4f}")
    
    # 5. Shift change analysis (handoff hours)
    shift_hours = [6, 14, 22]  # Typical shift changes
    for sh in shift_hours:
        before = calls[calls["hour"] == sh-1]["nine_one_one_calls_received"]
        after = calls[calls["hour"] == sh]["nine_one_one_calls_received"]
        t_stat, t_p = stats.ttest_ind(before, after)
        mw_stat, mw_p = stats.mannwhitneyu(before, after)
        print(f"Shift change at {sh}:00 - t-test p={t_p:.4f}, MW p={mw_p:.4f}")
    
    return res_911, res_non, profile_corr

res_911, res_non, profile_corr = temporal_structure_analysis(calls)
```

#### 2.4 Bivariate Visual Exploration with Statistical Overlays
```python
import plotnine as p9

def eda_bivariate_plots(incidents):
    """Generate comprehensive bivariate EDA plots."""
    
    # 1. Interview vs Dispatch Queue by Priority (with LOESS)
    p1 = (p9.ggplot(incidents, p9.aes(x="interview_seconds", y="dispatch_queue_seconds", color="factor(priority)"))
         + p9.geom_point(alpha=0.3, size=0.8)
         + p9.geom_smooth(method="loess", se=True, span=0.75)
         + p9.scale_x_log10()
         + p9.scale_y_log10()
         + p9.facet_wrap("~priority", nrow=1)
         + p9.labs(title="Interview vs Dispatch Queue by Priority (log-log)", 
                   x="Interview Seconds", y="Dispatch Queue Seconds", color="Priority")
         + p9.theme_minimal())
    
    # 2. Total Elapsed by Agency and Shift (violin + box)
    p2 = (p9.ggplot(incidents, p9.aes(x="agency", y="total_elapsed_seconds", fill="shift_label"))
         + p9.geom_violin(alpha=0.5, position="dodge")
         + p9.geom_boxplot(width=0.1, position="dodge", outlier_alpha=0.3)
         + p9.scale_y_log10()
         + p9.labs(title="Total Elapsed Time by Agency and Shift", x="Agency", y="Total Elapsed (s, log)")
         + p9.theme_minimal())
    
    # 3. Turnout vs Travel by Problem Nature (top 10)
    top_problems = incidents["problem_nature"].value_counts().head(10).index
    df_top = incidents[incidents["problem_nature"].isin(top_problems)]
    
    p3 = (p9.ggplot(df_top, p9.aes(x="turnout_seconds", y="travel_seconds", color="problem_nature"))
         + p9.geom_point(alpha=0.4, size=1)
         + p9.geom_smooth(method="lm", se=False, size=0.5)
         + p9.scale_x_log10()
         + p9.scale_y_log10()
         + p9.labs(title="Turnout vs Travel by Problem Nature (Top 10)", 
                   x="Turnout (s, log)", y="Travel (s, log)")
         + p9.theme_minimal())
    
    # 4. Heatmap: Compliance by Hour and DOW
    calls["dow"] = calls["hour_start"].dt.dayofweek
    calls["hour"] = calls["hour_start"].dt.hour
    
    p4 = (p9.ggplot(calls, p9.aes(x="factor(hour)", y="factor(dow)", 
                                   fill="nine_one_one_answered_20s_pct"))
         + p9.geom_tile()
         + p9.scale_fill_cmap(name="RdYlGn", limits=(70, 100))
         + p9.geom_text(p9.aes(label="round(nine_one_one_answered_20s_pct, 1)"), size=7, color="black")
         + p9.labs(title="911 20s Compliance by Hour and Day of Week", 
                   x="Hour", y="Day of Week (0=Mon)", fill="Compliance %")
         + p9.theme_minimal())
    
    return p1, p2, p3, p4

p1, p2, p3, p4 = eda_bivariate_plots(incidents)
print(p1)
print(p2)
print(p3)
print(p4)
```

### Bayesian EDA

#### Bayesian Exploratory: Probabilistic PCA for Outlier Detection
```python
def bayesian_pca_outlier_detection(data, n_components=2):
    """
    Probabilistic PCA (PPCA) for outlier detection.
    Uses Bayesian formulation with automatic relevance determination.
    """
    from sklearn.preprocessing import RobustScaler
    
    # Prepare data
    X = data.dropna()
    scaler = RobustScaler()
    X_scaled = scaler.fit_transform(X)
    
    n_obs, n_vars = X_scaled.shape
    
    with pm.Model() as model:
        # Latent variables
        W = pm.Normal("W", mu=0, sigma=1, shape=(n_vars, n_components))
        z = pm.Normal("z", mu=0, sigma=1, shape=(n_obs, n_components))
        
        # Noise variance (per variable)
        psi = pm.HalfNormal("psi", sigma=1, shape=n_vars)
        
        # Reconstruction
        mu = pm.math.dot(z, W.T)
        
        # Likelihood
        likelihood = pm.Normal("X", mu=mu, sigma=psi, observed=X_scaled)
        
        trace = pm.sample(2000, tune=1000, chains=4, target_accept=0.95, random_seed=42)
    
    # Reconstruction error as outlier score
    with model:
        ppc = pm.sample_posterior_predictive(trace, extend_inferencedata=True)
    
    # Mean reconstruction per observation
    x_recon = ppc.posterior_predictive["X"].mean(dim=["chain", "draw"]).values
    recon_error = np.mean((X_scaled - x_recon)**2, axis=1)
    
    # Flag outliers (top 5% reconstruction error)
    threshold = np.percentile(recon_error, 95)
    outliers = recon_error > threshold
    
    return trace, model, outliers, recon_error

# Run on time components
trace_ppca, model_ppca, outliers_ppca, recon_err = bayesian_pca_outlier_detection(
    incidents[time_cols].dropna()
)

print(f"PPCA Outliers detected: {outliers_ppca.sum()} / {len(outliers_ppca)}")
```

#### Bayesian Mixture Models for Subpopulation Discovery
```python
def bayesian_gaussian_mixture(data, max_components=5):
    """
    Bayesian Gaussian Mixture Model for discovering subpopulations.
    Uses Dirichlet Process prior for automatic component selection.
    """
    from sklearn.preprocessing import RobustScaler
    
    X = data.dropna()
    scaler = RobustScaler()
    X_scaled = scaler.fit_transform(X)
    n_obs, n_vars = X_scaled.shape
    
    with pm.Model() as model:
        # Dirichlet Process prior for mixture weights
        # Using stick-breaking construction
        alpha = pm.Gamma("alpha", alpha=1, beta=1)  # Concentration parameter
        
        # Stick-breaking weights
        v = pm.Beta("v", alpha=1, beta=alpha, shape=max_components-1)
        # Compute weights
        w = pm.Deterministic("w", 
            pm.math.concatenate([[v[0]], 
                v[1:] * pm.math.cumprod(1 - v[:-1])]))
        
        # Component parameters
        mu = pm.Normal("mu", mu=0, sigma=2, shape=(max_components, n_vars))
        # LKJ prior for correlation matrices
        packed_L = pm.LKJCholeskyCov("packed_L", n=n_vars, eta=2, sd_dist=pm.HalfNormal.dist(1), 
                                      shape=max_components)
        L = pm.expand_packed_triangular(n_vars, packed_L, lower=True)
        sigma = pm.Deterministic("sigma", L @ L.transpose(0, 2, 1))
        
        # Mixture likelihood
        comp_logp = []
        for k in range(max_components):
            comp_logp.append(pm.MvNormal.logp(X_scaled, mu[k], sigma[k]))
        comp_logp = pm.math.stack(comp_logp, axis=1)
        
        # Mixture log likelihood
        logp = pm.math.logsumexp(pm.math.log(w) + comp_logp, axis=1)
        pm.Potential("likelihood", logp.sum())
        
        trace = pm.sample(2000, tune=1500, chains=4, target_accept=0.95, random_seed=42)
    
    # Posterior cluster assignments (using highest posterior probability)
    with model:
        # Compute posterior cluster probabilities
        post_w = trace.posterior["w"].mean(dim=["chain", "draw"]).values
        post_mu = trace.posterior["mu"].mean(dim=["chain", "draw"]).values
        post_sigma = trace.posterior["sigma"].mean(dim=["chain", "draw"]).values
        
        from scipy.stats import multivariate_normal
        resp = np.zeros((n_obs, max_components))
        for k in range(max_components):
            resp[:, k] = post_w[k] * multivariate_normal.pdf(X_scaled, post_mu[k], post_sigma[k])
        resp = resp / resp.sum(axis=1, keepdims=True)
        cluster_assign = resp.argmax(axis=1)
    
    return trace, model, cluster_assign, resp

# Run on incident time data
trace_gmm, model_gmm, clusters, resp = bayesian_gaussian_mixture(
    incidents[time_cols].dropna(), max_components=4
)

print("Cluster sizes:", np.bincount(clusters))
print("Cluster means (original scale):")
for k in range(4):
    mask = clusters == k
    if mask.sum() > 0:
        print(f"  Cluster {k} (n={mask.sum()}):")
        for col in time_cols:
            print(f"    {col}: {incidents.loc[incidents[col].notna() & mask, col].median():.0f}")
```

---

## 3. Correlation Analysis — Deep Dive

> **Use for measuring how strongly two variables move together, like how often customers visit and how much they spend.**

### Frequentist Correlation Suite

#### 3.1 Full Correlation Matrix with Multiple Methods
```python
def comprehensive_correlation_matrix(df, numeric_cols, categorical_cols=None):
    """Compute all correlation types with p-values and confidence intervals."""
    
    results = {}
    
    # 1. Pearson (linear, normal)
    pearson_r = df[numeric_cols].corr(method="pearson")
    pearson_p = pd.DataFrame(index=numeric_cols, columns=numeric_cols, dtype=float)
    for i in numeric_cols:
        for j in numeric_cols:
            if i != j:
                r, p = stats.pearsonr(df[i].dropna(), df[j].dropna())
                pearson_p.loc[i, j] = p
    results["pearson"] = {"r": pearson_r, "p": pearson_p}
    
    # 2. Spearman (monotonic, robust)
    spearman_r = df[numeric_cols].corr(method="spearman")
    spearman_p = pd.DataFrame(index=numeric_cols, columns=numeric_cols, dtype=float)
    for i in numeric_cols:
        for j in numeric_cols:
            if i != j:
                r, p = stats.spearmanr(df[i].dropna(), df[j].dropna())
                spearman_p.loc[i, j] = p
    results["spearman"] = {"r": spearman_r, "p": spearman_p}
    
    # 3. Kendall (concordance, robust with ties)
    kendall_r = pd.DataFrame(index=numeric_cols, columns=numeric_cols, dtype=float)
    kendall_p = pd.DataFrame(index=numeric_cols, columns=numeric_cols, dtype=float)
    for i in numeric_cols:
        for j in numeric_cols:
            if i != j:
                tau, p = stats.kendalltau(df[i].dropna(), df[j].dropna())
                kendall_r.loc[i, j] = tau
                kendall_p.loc[i, j] = p
    results["kendall"] = {"r": kendall_r, "p": kendall_p}
    
    # 4. Distance correlation (non-linear)
    from scipy.spatial.distance import pdist, squareform
    def distance_correlation(x, y):
        """Compute distance correlation."""
        x = x.values.reshape(-1, 1)
        y = y.values.reshape(-1, 1)
        # Double-centered distance matrices
        def dcor_matrix(z):
            dist = squareform(pdist(z))
            row_mean = dist.mean(axis=1, keepdims=True)
            col_mean = dist.mean(axis=0, keepdims=True)
            grand_mean = dist.mean()
            return dist - row_mean - col_mean + grand_mean
        
        A = dcor_matrix(x)
        B = dcor_matrix(y)
        
        dcov = np.sqrt((A * B).mean())
        dvar_x = np.sqrt((A * A).mean())
        dvar_y = np.sqrt((B * B).mean())
        
        return dcov / np.sqrt(dvar_x * dvar_y) if dvar_x * dvar_y > 0 else 0
    
    dcor_r = pd.DataFrame(index=numeric_cols, columns=numeric_cols, dtype=float)
    for i in numeric_cols:
        for j in numeric_cols:
            if i != j:
                dcor_r.loc[i, j] = distance_correlation(df[i].dropna(), df[j].dropna())
    results["distance"] = {"r": dcor_r}
    
    # 5. Categorical associations (Cramér's V)
    if categorical_cols:
        cramers_v_matrix = pd.DataFrame(index=categorical_cols, columns=categorical_cols, dtype=float)
        for i in categorical_cols:
            for j in categorical_cols:
                if i != j:
                    ct = pd.crosstab(df[i], df[j])
                    chi2 = stats.chi2_contingency(ct)[0]
                    n = ct.sum().sum()
                    min_dim = min(ct.shape) - 1
                    if min_dim > 0 and n > 0:
                        cramers_v_matrix.loc[i, j] = np.sqrt(chi2 / (n * min_dim))
        results["cramers_v"] = cramers_v_matrix
    
    return results

# Run comprehensive correlation
corr_results = comprehensive_correlation_matrix(incidents, time_cols, 
    categorical_cols=["agency", "shift_label", "priority", "problem_nature", "call_disposition"])

# Visualize Spearman with significance
import seaborn as sns
plt.figure(figsize=(12, 10))
mask = corr_results["spearman"]["p"] > 0.05
sns.heatmap(corr_results["spearman"]["r"], annot=True, fmt=".2f", cmap="RdBu_r", 
            center=0, mask=mask, square=True, cbar_kws={"shrink": 0.8})
plt.title("Spearman Correlation (masked: p > 0.05)")
plt.tight_layout()
plt.show()

# Distance correlation (detects non-linear)
plt.figure(figsize=(10, 8))
sns.heatmap(corr_results["distance"]["r"], annot=True, fmt=".2f", cmap="viridis", 
            center=0, square=True, cbar_kws={"shrink": 0.8})
plt.title("Distance Correlation (detects non-linear relationships)")
plt.tight_layout()
plt.show()
```

#### 3.2 Partial and Semipartial Correlations
```python
def partial_correlation_matrix(df, target_cols, control_cols):
    """Compute partial correlations controlling for covariates."""
    
    from statsmodels.regression.linear_model import OLS
    from statsmodels.tools.tools import add_constant
    
    results = pd.DataFrame(index=target_cols, columns=target_cols, dtype=float)
    pvals = pd.DataFrame(index=target_cols, columns=target_cols, dtype=float)
    
    for i in target_cols:
        for j in target_cols:
            if i != j:
                # Regress both on controls, correlate residuals
                y1 = df[i].dropna()
                y2 = df[j].dropna()
                # Align indices
                common_idx = y1.index.intersection(y2.index).intersection(df[control_cols].dropna().index)
                y1 = y1.loc[common_idx]
                y2 = y2.loc[common_idx]
                X = add_constant(df.loc[common_idx, control_cols])
                
                res1 = OLS(y1, X).fit().resid
                res2 = OLS(y2, X).fit().resid
                
                r, p = stats.pearsonr(res1, res2)
                results.loc[i, j] = r
                pvals.loc[i, j] = p
    
    return results.astype(float), pvals.astype(float)

# Partial correlations controlling for priority and agency
control_cols = ["priority"] + list(pd.get_dummies(incidents["agency"], drop_first=True).columns)
# Need numeric controls
control_data = incidents[["priority"]].copy()
control_data = pd.concat([control_data, pd.get_dummies(incidents["agency"], drop_first=True)], axis=1)

partial_r, partial_p = partial_correlation_matrix(incidents, time_cols, control_data.columns.tolist())
print("Partial Correlations (controlling for priority + agency):")
print(partial_r.round(3))
```

#### 3.3 Correlation by Groups (Moderation)
```python
def correlation_by_group(df, x_col, y_col, group_col, method="spearman"):
    """Compute correlation within each group."""
    
    groups = df[group_col].unique()
    results = []
    
    for g in groups:
        subset = df[df[group_col] == g][[x_col, y_col]].dropna()
        if len(subset) >= 10:
            if method == "spearman":
                r, p = stats.spearmanr(subset[x_col], subset[y_col])
            elif method == "pearson":
                r, p = stats.pearsonr(subset[x_col], subset[y_col])
            elif method == "kendall":
                r, p = stats.kendalltau(subset[x_col], subset[y_col])
            
            # Confidence interval via Fisher transform
            z = np.arctanh(r)
            se = 1 / np.sqrt(len(subset) - 3)
            ci_low = np.tanh(z - 1.96 * se)
            ci_high = np.tanh(z + 1.96 * se)
            
            results.append({
                "group": g,
                "n": len(subset),
                "r": r,
                "p": p,
                "ci_low": ci_low,
                "ci_high": ci_high
            })
    
    return pd.DataFrame(results)

# Dispatch queue vs Travel by Agency
for agency in incidents["agency"].unique():
    subset = incidents[incidents["agency"] == agency][["dispatch_queue_seconds", "travel_seconds"]].dropna()
    if len(subset) > 10:
        r, p = stats.spearmanr(subset["dispatch_queue_seconds"], subset["travel_seconds"])
        print(f"{agency}: ρ={r:.3f}, p={p:.4f}, n={len(subset)}")

# Formal test of difference between correlations (Fisher r-to-z)
def compare_correlations(r1, n1, r2, n2):
    """Test if two correlations differ significantly."""
    z1 = np.arctanh(r1)
    z2 = np.arctanh(r2)
    se = np.sqrt(1/(n1-3) + 1/(n2-3))
    z = (z1 - z2) / se
    p = 2 * (1 - stats.norm.cdf(abs(z)))
    return z, p

# Compare LAW vs FIRE
law_r = 0.342  # example
fire_r = 0.567
z, p = compare_correlations(law_r, 400, fire_r, 150)
print(f"Difference test: z={z:.3f}, p={p:.4f}")
```

### Bayesian Correlation Analysis

#### 3.4 Bayesian Correlation with Uncertainty Quantification
```python
def bayesian_correlation(x, y, prior_rho="uniform"):
    """
    Bayesian correlation estimation with full posterior.
    Returns posterior distribution of rho with HDI.
    """
    # Standardize
    x = (x - x.mean()) / x.std()
    y = (y - y.mean()) / y.std()
    
    # Remove NaN pairs
    valid = ~(np.isnan(x) | np.isnan(y))
    x = x[valid]
    y = y[valid]
    n = len(x)
    
    with pm.Model() as model:
        # Prior for correlation
        if prior_rho == "uniform":
            # Uniform on [-1, 1] via LKJ(1)
            rho = pm.Uniform("rho", lower=-1, upper=1)
        elif prior_rho == "weakly_informative":
            # Concentrated around 0
            rho = pm.Beta("rho_transformed", alpha=2, beta=2) * 2 - 1
            rho = pm.Deterministic("rho", rho)
        else:
            # LKJ prior
            rho = pm.LKJCorr("rho", n=2, eta=1)[0, 1]  # Not directly usable, use transformed
            # Simpler: use Fisher z transform
            z = pm.Normal("z", mu=0, sigma=1)
            rho = pm.Deterministic("rho", pm.math.tanh(z))
        
        # Covariance matrix
        cov = pm.math.stack([
            pm.math.stack([1.0, rho]),
            pm.math.stack([rho, 1.0])
        ])
        
        # Likelihood
        likelihood = pm.MvNormal("likelihood", mu=[0, 0], cov=cov, observed=np.column_stack([x, y]))
        
        trace = pm.sample(2000, tune=1000, chains=4, target_accept=0.95, random_seed=42)
    
    return trace, model

# Example: Dispatch queue vs Travel time
x = incidents["dispatch_queue_seconds"].dropna()
y = incidents["travel_seconds"].dropna()
# Align
common_idx = x.index.intersection(y.index)
x_aligned = x.loc[common_idx]
y_aligned = y.loc[common_idx]

trace_corr, model_corr = bayesian_correlation(x_aligned, y_aligned)

# Posterior summary
post_rho = trace_corr.posterior["rho"].values.flatten()
print(f"Posterior mean ρ: {post_rho.mean():.3f}")
print(f"95% HDI: {az.hdi(post_rho, hdi_prob=0.95)}")
print(f"P(ρ > 0): {(post_rho > 0).mean():.3f}")
print(f"P(ρ > 0.3): {(post_rho > 0.3).mean():.3f}")

# Plot posterior
az.plot_posterior(trace_corr, var_names=["rho"], hdi_prob=0.95)
```

#### 3.5 Bayesian Correlation Matrix (Multivariate)
```python
def bayesian_correlation_matrix(data, n_vars):
    """
    Bayesian estimation of full correlation matrix using LKJ prior.
    """
    # Standardize
    X = (data - data.mean()) / data.std()
    X = X.dropna().values
    n_obs, n_vars = X.shape
    
    with pm.Model() as model:
        # LKJ prior for correlation matrix (eta=1 = uniform over correlation matrices)
        # eta > 1 concentrates near identity
        chol = pm.LKJCholeskyCov("chol", n=n_vars, eta=2, sd_dist=pm.HalfNormal.dist(1))
        # chol is packed lower-triangular Cholesky factor
        
        # Reconstruct correlation matrix
        L = pm.expand_packed_triangular(n_vars, chol, lower=True)
        corr = pm.Deterministic("corr", L @ L.T)
        
        # Likelihood
        likelihood = pm.MvNormal("likelihood", mu=np.zeros(n_vars), chol=L, observed=X)
        
        trace = pm.sample(2000, tune=1500, chains=4, target_accept=0.95, random_seed=42)
    
    return trace, model

# Run on time components (7 variables)
trace_cormat, model_cormat = bayesian_correlation_matrix(
    incidents[time_cols].dropna(), len(time_cols)
)

# Extract posterior correlation matrix
post_corr = trace_cormat.posterior["corr"].mean(dim=["chain", "draw"]).values
print("Posterior Mean Correlation Matrix:")
print(pd.DataFrame(post_corr, index=time_cols, columns=time_cols).round(3))

# HDI for each correlation
for i in range(len(time_cols)):
    for j in range(i+1, len(time_cols)):
        corr_samples = trace_cormat.posterior["corr"].values[:, :, i, j].flatten()
        hdi = az.hdi(corr_samples, hdi_prob=0.95)
        if hdi[0] > 0 or hdi[1] < 0:  # Excludes 0
            print(f"{time_cols[i]} ↔ {time_cols[j]}: ρ = {corr_samples.mean():.3f}, 95% HDI = [{hdi[0]:.3f}, {hdi[1]:.3f}]")
```

---

## 4. Regression Analysis — Deep Dive

> **Use for predicting an outcome, like estimating a customer's next order value from their past purchases.**

### Frequentist Regression Suite

#### 4.1 Generalized Linear Models for Skewed Response Times
```python
import statsmodels.api as sm
import statsmodels.formula.api as smf
from statsmodels.genmod.families import Gamma, NegativeBinomial, InverseGaussian, Tweedie
from statsmodels.genmod.families.links import Log, Identity, InversePower

def fit_glm_suite(data, outcome_col, predictor_formula, families=None):
    """Fit multiple GLM families and compare via AIC."""
    
    if families is None:
        families = {
            "Gamma-Log": Gamma(link=Log()),
            "Gamma-Identity": Gamma(link=Identity()),
            "InvGauss-Log": InverseGaussian(link=Log()),
            "InvGauss-Identity": InverseGaussian(link=Identity()),
            "Tweedie-Log": Tweedie(link=Log(), var_power=1.5),
            "NegBin-Log": NegativeBinomial(link=Log()),
        }
    
    results = {}
    for name, family in families.items():
        try:
            model = smf.glm(formula=f"{outcome_col} ~ {predictor_formula}", 
                           data=data, family=family).fit()
            results[name] = {
                "model": model,
                "aic": model.aic,
                "bic": model.bic,
                "loglik": model.llf,
                "params": model.params,
                "pvalues": model.pvalues
            }
            print(f"{name}: AIC={model.aic:.1f}, BIC={model.bic:.1f}")
        except Exception as e:
            print(f"{name}: Failed - {e}")
            results[name] = {"error": str(e)}
    
    # Best model by AIC
    valid = {k: v for k, v in results.items() if "aic" in v}
    if valid:
        best = min(valid, key=lambda k: valid[k]["aic"])
        print(f"\nBest model (AIC): {best}")
    
    return results

# Total elapsed time (positive, skewed)
predictors = "C(priority) + C(agency) + C(shift_label) + C(problem_nature) + hour + is_weekend"
incidents["hour"] = incidents["call_start_time"].dt.hour
incidents["is_weekend"] = incidents["call_start_time"].dt.dayofweek.isin([5,6]).astype(int)

glm_results = fit_glm_suite(incidents, "total_elapsed_seconds", predictors)

# Best model diagnostics
best_model = glm_results["Gamma-Log"]["model"]
print(best_model.summary())
```

#### 4.2 Quantile Regression for Tail Analysis
```python
# Quantile regression for different percentiles
import statsmodels.formula.api as smf

def quantile_regression_suite(data, formula, quantiles=[0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99]):
    """Fit quantile regression at multiple quantiles."""
    
    results = {}
    for q in quantiles:
        try:
            model = smf.quantreg(formula, data).fit(q=q)
            results[q] = {
                "params": model.params,
                "pvalues": model.pvalues,
                "conf_int": model.conf_int()
            }
            print(f"Quantile {q}: n={model.nobs}, pseudo R²={model.prsquared:.3f}")
        except Exception as e:
            print(f"Quantile {q}: Failed - {e}")
    
    return results

# Quantile regression for dispatch queue
qr_results = quantile_regression_suite(
    incidents, 
    "dispatch_queue_seconds ~ C(priority) + C(agency) + C(shift_label) + hour",
    quantiles=[0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99]
)

# Compare coefficients across quantiles
coeff_df = pd.DataFrame({q: r["params"] for q, r in qr_results.items()}).T
print("\nCoefficient trends across quantiles:")
print(coeff_df.filter(like="priority").round(3))
```

#### 4.3 Mixed Effects Models (Hierarchical)
```python
from statsmodels.regression.mixed_linear_model import MixedLM

def mixed_effects_models(data):
    """Fit various mixed effects models."""
    
    # Log-transform skewed outcomes
    data = data.copy()
    data["log_queue"] = np.log1p(data["dispatch_queue_seconds"])
    data["log_total"] = np.log1p(data["total_elapsed_seconds"])
    data["hour"] = data["call_start_time"].dt.hour
    data["dow"] = data["call_start_time"].dt.dayofweek
    
    models = {}
    
    # 1. Random intercept for shift
    try:
        m1 = MixedLM.from_formula(
            "log_queue ~ C(priority) + C(agency) + hour",
            groups="shift_label",
            data=data
        ).fit()
        models["shift_intercept"] = m1
        print("Shift random intercept:")
        print(m1.summary())
    except Exception as e:
        print(f"Shift intercept failed: {e}")
    
    # 2. Random intercept for calltaker
    try:
        m2 = MixedLM.from_formula(
            "log_total ~ C(priority) + C(agency) + hour",
            groups="calltaker",
            data=data
        ).fit()
        models["calltaker_intercept"] = m2
        print("\nCalltaker random intercept:")
        print(m2.summary())
    except Exception as e:
        print(f"Calltaker intercept failed: {e}")
    
    # 3. Crossed random effects (shift + calltaker) - use statsmodels or pymer4
    # statsmodels doesn't easily do crossed, use formula: ~ (1|shift) + (1|calltaker)
    
    # 4. Random slopes (priority effect varies by shift)
    try:
        m4 = MixedLM.from_formula(
            "log_queue ~ C(priority) + C(agency) + hour",
            groups="shift_label",
            re_formula="~C(priority)",
            data=data
        ).fit()
        models["shift_slope"] = m4
        print("\nShift random slope (priority):")
        print(m4.summary())
    except Exception as e:
        print(f"Shift slope failed: {e}")
    
    return models

mixed_models = mixed_effects_models(incidents)
```

#### 4.4 Model Validation and Selection
```python
def regression_diagnostics_comprehensive(model, data, outcome_col, preds_col):
    """Comprehensive regression diagnostics."""
    
    residuals = data[outcome_col] - data[preds_col]
    fitted = data[preds_col]
    
    diagnostics = {}
    
    # 1. Normality of residuals
    shapiro_stat, shapiro_p = stats.shapiro(residuals.dropna()[:5000])
    diagnostics["shapiro"] = {"stat": shapiro_stat, "p": shapiro_p}
    
    # 2. Homoscedasticity (Breusch-Pagan)
    from statsmodels.stats.diagnostic import het_breuschpagan
    if hasattr(model, 'model') and hasattr(model.model, 'exog'):
        exog = model.model.exog
        bp_stat, bp_p, _, _ = het_breuschpagan(residuals.dropna(), exog[:len(residuals.dropna())])
        diagnostics["breusch_pagan"] = {"stat": bp_stat, "p": bp_p}
    
    # 3. Autocorrelation (Durbin-Watson)
    from statsmodels.stats.stattools import durbin_watson
    dw = durbin_watson(residuals.dropna())
    diagnostics["durbin_watson"] = dw
    
    # 4. Multicollinearity (VIF)
    from statsmodels.stats.outliers_influence import variance_inflation_factor
    if hasattr(model, 'model') and hasattr(model.model, 'exog'):
        exog = model.model.exog
        vif_data = pd.DataFrame()
        vif_data["variable"] = model.model.exog_names
        vif_data["VIF"] = [variance_inflation_factor(exog, i) for i in range(exog.shape[1])]
        diagnostics["vif"] = vif_data
    
    # 5. Influential points (Cook's distance)
    if hasattr(model, 'get_influence'):
        influence = model.get_influence()
        cooks_d = influence.cooks_distance[0]
        diagnostics["cooks_d_max"] = cooks_d.max()
        diagnostics["n_high_influence"] = (cooks_d > 4/len(residuals)).sum()
    
    # 6. Linearity (component-plus-residual plots)
    # Visual check needed
    
    return diagnostics

# Run on best GLM
diag = regression_diagnostics_comprehensive(
    best_model, incidents, "total_elapsed_seconds", "pred_gamma"
)
for k, v in diag.items():
    print(f"{k}: {v}")
```

### Bayesian Regression

#### 4.5 Bayesian GLM with Bambi (Formula Interface)
```python
import bambi as bmb

def bayesian_glm_bambi(data, formula, family="gamma", link="log", 
                       priors=None, draws=2000, tune=1000):
    """
    Bayesian GLM using Bambi (like R's brms).
    """
    # Specify priors
    if priors is None:
        priors = {
            "Intercept": bmb.Prior("Normal", mu=0, sigma=5),
            "common": bmb.Prior("Normal", mu=0, sigma=1),  # For all coefficients
            "sigma": bmb.Prior("HalfNormal", sigma=1),
        }
    
    # Build model
    model = bmb.Model(formula, data, family=family, link=link, priors=priors)
    
    # Fit
    trace = model.fit(draws=draws, tune=tune, chains=4, target_accept=0.95, random_seed=42)
    
    return model, trace

# Bayesian Gamma regression for total elapsed time
formula = "total_elapsed_seconds ~ C(priority) + C(agency) + C(shift_label) + C(problem_nature) + hour + is_weekend"

model_bayes, trace_bayes = bayesian_glm_bambi(
    incidents, formula, family="gamma", link="log"
)

# Summary
print(az.summary(trace_bayes, var_names=["~Intercept", "C(priority)", "C(agency)", "C(shift_label)"], hdi_prob=0.95))

# Posterior predictive checks
with model_bayes:
    ppc = model_bayes.predict(trace_bayes, kind="pps")
az.plot_ppc(ppc)

# Conditional effects (marginal effects)
import matplotlib.pyplot as plt
# Effect of priority
for p in [1, 2, 3, 4, 5]:
    subset = incidents[incidents["priority"] == p]
    if len(subset) > 10:
        pred = model_bayes.predict(trace_bayes, data=subset, kind="pps")
        print(f"Priority {p}: mean predicted = {pred['total_elapsed_seconds'].mean():.0f}s")
```

#### 4.6 Bayesian Quantile Regression
```python
def bayesian_quantile_regression(data, formula, quantiles=[0.1, 0.5, 0.9]):
    """
    Bayesian quantile regression using asymmetric Laplace likelihood.
    """
    models = {}
    traces = {}
    
    for q in quantiles:
        with pm.Model() as model:
            # Asymmetric Laplace likelihood for quantile regression
            # sigma > 0
            sigma = pm.HalfNormal("sigma", sigma=1)
            
            # Coefficients
            # Use Bambi-style formula parsing or manual
            # Simplified: manual design matrix
            import patsy
            y, X = patsy.dmatrices(formula, data, return_type="dataframe")
            
            beta = pm.Normal("beta", mu=0, sigma=2, shape=X.shape[1])
            
            # Linear predictor
            mu = pm.math.dot(X, beta)
            
            # Asymmetric Laplace (quantile regression likelihood)
            # Using mixture representation or custom likelihood
            # Simplified: use check function directly
            def check_loss(q, y, mu):
                return pm.math.switch(y >= mu, q * (y - mu), (1 - q) * (mu - y))
            
            # This is complex in PyMC; use bambi's built-in or approximate
            # Alternative: use quantile regression via expectile approximation
            
            # For now, use normal with quantile-specific sigma
            # (Not true quantile regression but useful approximation)
            likelihood = pm.Normal("y", mu=mu, sigma=sigma, observed=y)
            
            trace = pm.sample(2000, tune=1000, chains=4, target_accept=0.95, random_seed=42)
        
        models[q] = model
        traces[q] = trace
    
    return models, traces

# Use bambi for quantile regression (if available in version)
# bmb supports quantile family in newer versions
try:
    model_q = bmb.Model("total_elapsed_seconds ~ C(priority) + C(agency)", 
                       incidents, family="quantile", link="identity")
    trace_q = model_q.fit(draws=2000, tune=1000, chains=4)
    print(az.summary(trace_q, hdi_prob=0.95))
except:
    print("Quantile family not available in this bambi version")
```

#### 4.7 Bayesian Mixed Effects Models
```python
def bayesian_mixed_effects(data, formula, group_var):
    """
    Bayesian mixed effects model with random intercepts.
    """
    import patsy
    
    # Parse formula
    y, X = patsy.dmatrices(formula, data, return_type="dataframe")
    groups = data[group_var].values
    n_groups = len(np.unique(groups))
    group_idx = pd.Categorical(groups).codes
    
    with pm.Model() as model:
        # Fixed effects
        beta = pm.Normal("beta", mu=0, sigma=2, shape=X.shape[1])
        
        # Random intercepts
        sigma_group = pm.HalfNormal("sigma_group", sigma=1)
        group_offset = pm.Normal("group_offset", mu=0, sigma=sigma_group, shape=n_groups)
        
        # Linear predictor
        mu = pm.math.dot(X, beta) + group_offset[group_idx]
        
        # Likelihood (log-normal for positive skewed)
        sigma = pm.HalfNormal("sigma", sigma=1)
        likelihood = pm.LogNormal("y", mu=mu, sigma=sigma, observed=y.values.ravel())
        
        trace = pm.sample(2000, tune=1500, chains=4, target_accept=0.95, random_seed=42)
    
    return model, trace

# Bayesian mixed model: random intercept for shift
model_mixed, trace_mixed = bayesian_mixed_effects(
    incidents, 
    "total_elapsed_seconds ~ C(priority) + C(agency) + hour", 
    "shift_label"
)

# Posterior for random effects
post_group = trace_mixed.posterior["group_offset"].mean(dim=["chain", "draw"]).values
print("Random intercepts by shift:")
for i, shift in enumerate(incidents["shift_label"].unique()):
    print(f"  {shift}: {post_group[i]:.3f}")

# ICC (Intraclass Correlation)
sigma_group = trace_mixed.posterior["sigma_group"].mean().values
sigma_resid = trace_mixed.posterior["sigma"].mean().values
icc = sigma_group**2 / (sigma_group**2 + sigma_resid**2)
print(f"ICC (shift): {icc:.3f}")
```

---

## 5. Hypothesis Testing — Deep Dive

> **Use for checking whether a result is statistically significant, like a difference in conversion between two checkout designs in an A/B test.**

### Frequentist Hypothesis Testing Suite

#### 5.1 Standards Compliance Testing (NFPA/NENA)
```python
def compliance_hypothesis_tests(incidents, calls):
    """Comprehensive compliance hypothesis tests against standards."""
    
    results = {}
    
    # 1. NENA 9-1-1 Answer Time: 90% within 15s, 95% within 20s
    total_911 = calls["nine_one_one_calls_received"].sum()
    ans_15 = int((calls["nine_one_one_answered_15s_pct"]/100 * calls["nine_one_one_calls_received"]).sum())
    ans_20 = int((calls["nine_one_one_answered_20s_pct"]/100 * calls["nine_one_one_calls_received"]).sum())
    
    # Exact binomial test
    test_15 = stats.binomtest(ans_15, total_911, p=0.90, alternative="greater")
    test_20 = stats.binomtest(ans_20, total_911, p=0.95, alternative="greater")
    
    # Wilson CI
    ci_15 = statsmodels.stats.proportion.proportion_confint(ans_15, total_911, method="wilson")
    ci_20 = statsmodels.stats.proportion.proportion_confint(ans_20, total_911, method="wilson")
    
    results["NENA_15s"] = {"observed": ans_15/total_911, "target": 0.90, 
                           "p_value": test_15.pvalue, "ci": ci_15}
    results["NENA_20s"] = {"observed": ans_20/total_911, "target": 0.95, 
                           "p_value": test_20.pvalue, "ci": ci_20}
    
    # 2. APCO 10s: 75% within 10s
    ans_10 = int((calls["nine_one_one_answered_10s_pct"]/100 * calls["nine_one_one_calls_received"]).sum())
    test_10 = stats.binomtest(ans_10, total_911, p=0.75, alternative="greater")
    ci_10 = statsmodels.stats.proportion.proportion_confint(ans_10, total_911, method="wilson")
    results["APCO_10s"] = {"observed": ans_10/total_911, "target": 0.75, 
                           "p_value": test_10.pvalue, "ci": ci_10}
    
    # 3. NFPA 1710 Dispatch Queue: 90% ≤ 64s, 95% ≤ 106s
    dq = incidents["dispatch_queue_seconds"].dropna()
    pct_64 = (dq <= 64).mean()
    pct_106 = (dq <= 106).mean()
    
    test_64 = stats.binomtest(int(pct_64*len(dq)), len(dq), p=0.90, alternative="greater")
    test_106 = stats.binomtest(int(pct_106*len(dq)), len(dq), p=0.95, alternative="greater")
    
    ci_64 = statsmodels.stats.proportion.proportion_confint(int(pct_64*len(dq)), len(dq), method="wilson")
    ci_106 = statsmodels.stats.proportion.proportion_confint(int(pct_106*len(dq)), len(dq), method="wilson")
    
    results["NFPA_DQ_64"] = {"observed": pct_64, "target": 0.90, 
                             "p_value": test_64.pvalue, "ci": ci_64}
    results["NFPA_DQ_106"] = {"observed": pct_106, "target": 0.95, 
                              "p_value": test_106.pvalue, "ci": ci_106}
    
    # 4. NFPA 1710 Turnout: 90% ≤ 60s (EMS) / 80s (Fire)
    for agency, target in [("EMS", 60), ("FIRE", 80)]:
        turnout = incidents[incidents["agency"]==agency]["turnout_seconds"].dropna()
        pct = (turnout <= target).mean()
        test = stats.binomtest(int(pct*len(turnout)), len(turnout), p=0.90, alternative="greater")
        ci = statsmodels.stats.proportion.proportion_confint(int(pct*len(turnout)), len(turnout), method="wilson")
        results[f"NFPA_Turnout_{agency}"] = {"observed": pct, "target": 0.90, 
                                             "p_value": test.pvalue, "ci": ci}
    
    # 5. NFPA 1710 Travel: 90% ≤ 240s
    travel = incidents["travel_seconds"].dropna()
    pct_240 = (travel <= 240).mean()
    test_240 = stats.binomtest(int(pct_240*len(travel)), len(travel), p=0.90, alternative="greater")
    ci_240 = statsmodels.stats.proportion.proportion_confint(int(pct_240*len(travel)), len(travel), method="wilson")
    results["NFPA_Travel_240"] = {"observed": pct_240, "target": 0.90, 
                                  "p_value": test_240.pvalue, "ci": ci_240}
    
    return results

comp_results = compliance_hypothesis_tests(incidents, calls)

print("COMPLIANCE HYPOTHESIS TESTS (H₀: rate ≤ target)")
print("=" * 80)
for test, res in comp_results.items():
    status = "PASS" if res["p_value"] < 0.05 else "FAIL"
    print(f"{test}:")
    print(f"  Observed: {res['observed']:.3f}, Target: {res['target']:.2f}")
    print(f"  p-value: {res['p_value']:.6f} → {status}")
    print(f"  95% CI: [{res['ci'][0]:.3f}, {res['ci'][1]:.3f}]")
    print()
```

#### 5.2 Group Comparisons with Effect Sizes
```python
def group_comparison_suite(data, outcome_col, group_col, parametric=False):
    """Comprehensive group comparison with effect sizes."""
    
    groups = data[group_col].unique()
    group_data = [data[data[group_col]==g][outcome_col].dropna() for g in groups]
    
    results = {"groups": groups, "n_per_group": [len(g) for g in group_data]}
    
    if parametric:
        # ANOVA
        f_stat, p_val = stats.f_oneway(*group_data)
        results["anova"] = {"F": f_stat, "p": p_val}
        
        # Tukey HSD
        from statsmodels.stats.multicomp import pairwise_tukeyhsd
        tukey = pairwise_tukeyhsd(data[outcome_col].dropna(), data[group_col].dropna())
        results["tukey"] = tukey
    else:
        # Kruskal-Wallis
        h_stat, p_val = stats.kruskal(*group_data)
        results["kruskal"] = {"H": h_stat, "p": p_val}
        
        # Dunn post-hoc with Bonferroni
        import scikit_posthocs as sp
        dunn = sp.posthoc_dunn(data, val_col=outcome_col, group_col=group_col, p_adjust="bonferroni")
        results["dunn"] = dunn
    
    # Effect sizes
    # Eta-squared for ANOVA / Epsilon-squared for Kruskal
    if parametric:
        # Eta-squared
        ss_between = sum(len(g) * (g.mean() - data[outcome_col].mean())**2 for g in group_data)
        ss_total = sum((data[outcome_col] - data[outcome_col].mean())**2)
        eta_sq = ss_between / ss_total
        results["eta_squared"] = eta_sq
    else:
        # Epsilon-squared for Kruskal
        n_total = sum(len(g) for g in group_data)
        epsilon_sq = (h_stat - len(groups) + 1) / (n_total - len(groups))
        results["epsilon_squared"] = max(0, epsilon_sq)
    
    # Pairwise effect sizes (Cliff's delta for non-parametric)
    from itertools import combinations
    pairwise_effects = {}
    for (i, g1), (j, g2) in combinations(enumerate(groups), 2):
        cliff = pg.compute_effsize(group_data[i], group_data[j], eftype="cliff")
        pairwise_effects[f"{g1}_vs_{g2}"] = cliff
    results["pairwise_cliff"] = pairwise_effects
    
    return results

# Compare shifts on total elapsed time
shift_comp = group_comparison_suite(incidents, "total_elapsed_seconds", "shift_label", parametric=False)
print(f"Kruskal-Wallis: H={shift_comp['kruskal']['H']:.2f}, p={shift_comp['kruskal']['p']:.6f}")
print(f"Epsilon-squared: {shift_comp['epsilon_squared']:.4f}")
print("\nPairwise Cliff's Delta:")
for k, v in shift_comp['pairwise_cliff'].items():
    print(f"  {k}: {v:.3f}")

# Compare agencies on dispatch queue
agency_comp = group_comparison_suite(incidents, "dispatch_queue_seconds", "agency", parametric=False)
print(f"\nAgency Kruskal-Wallis: H={agency_comp['kruskal']['H']:.2f}, p={agency_comp['kruskal']['p']:.6f}")
```

#### 5.3 Trend Tests (Mann-Kendall, Cox-Stuart)
```python
def trend_tests(series, alpha=0.05):
    """Multiple trend tests for time series."""
    
    results = {}
    
    # 1. Mann-Kendall
    n = len(series)
    s = 0
    for i in range(n-1):
        for j in range(i+1, n):
            s += np.sign(series[j] - series[i])
    
    var_s = n*(n-1)*(2*n+5)/18
    if s > 0:
        z = (s - 1) / np.sqrt(var_s)
    elif s < 0:
        z = (s + 1) / np.sqrt(var_s)
    else:
        z = 0
    p_mk = 2 * (1 - stats.norm.cdf(abs(z)))
    
    # Sen's slope (median of pairwise slopes)
    slopes = []
    for i in range(n-1):
        for j in range(i+1, n):
            slopes.append((series[j] - series[i]) / (j - i))
    sen_slope = np.median(slopes)
    
    results["mann_kendall"] = {"S": s, "Z": z, "p": p_mk, "sen_slope": sen_slope}
    
    # 2. Cox-Stuart (simpler, less powerful)
    mid = n // 2
    first_half = series[:mid]
    second_half = series[-mid:]
    diff = second_half - first_half
    n_pos = (diff > 0).sum()
    n_neg = (diff < 0).sum()
    p_cs = 2 * stats.binomtest(n_pos, n_pos + n_neg, p=0.5).pvalue
    
    results["cox_stuart"] = {"n_pos": n_pos, "n_neg": n_neg, "p": p_cs}
    
    # 3. Linear regression trend
    x = np.arange(n)
    slope, intercept, r, p_lr, se = stats.linregress(x, series)
    results["linear_trend"] = {"slope": slope, "r": r, "p": p_lr, "se": se}
    
    return results

# Weekly compliance trend
calls["week"] = calls["hour_start"].dt.isocalendar().week
weekly_compliance = calls.groupby("week")["nine_one_one_answered_20s_pct"].mean()
trend_results = trend_tests(weekly_compliance.values)

print("Weekly 20s Compliance Trend:")
for test, res in trend_results.items():
    print(f"  {test}: {res}")
```

#### 5.4 Equivalence and Non-Inferiority Testing
```python
def equivalence_test(data1, data2, equivalence_margin=0.2, metric="mean"):
    """
    Two one-sided tests (TOST) for equivalence.
    H₀: |μ1 - μ2| ≥ margin vs H₁: |μ1 - μ2| < margin
    """
    if metric == "mean":
        stat1, p1 = stats.ttest_1samp(data1 - data2, -equivalence_margin, alternative="greater")
        stat2, p2 = stats.ttest_1samp(data1 - data2, equivalence_margin, alternative="less")
    elif metric == "median":
        # Use Hodges-Lehmann estimator
        from scipy.stats import wilcoxon
        # Not directly available, approximate
        stat1, p1 = wilcoxon(data1 - data2 + equivalence_margin, alternative="greater")
        stat2, p2 = wilcoxon(data1 - data2 - equivalence_margin, alternative="less")
    
    p_tost = max(p1, p2)
    equiv = p_tost < 0.05
    
    return {"p1": p1, "p2": p2, "p_tost": p_tost, "equivalent": equiv}

# Example: Is night shift equivalent to day shift within 10% median difference?
day_data = incidents[incidents["shift"]=="D"]["total_elapsed_seconds"].dropna()
night_data = incidents[incidents["shift"]=="N"]["total_elapsed_seconds"].dropna()
margin = day_data.median() * 0.10  # 10% margin

# For median equivalence, use bootstrap
def bootstrap_equivalence(d1, d2, margin, n_boot=5000):
    """Bootstrap TOST for medians."""
    diff_medians = []
    for _ in range(n_boot):
        s1 = np.random.choice(d1, len(d1), replace=True)
        s2 = np.random.choice(d2, len(d2), replace=True)
        diff_medians.append(np.median(s1) - np.median(s2))
    
    diff_medians = np.array(diff_medians)
    p_low = (diff_medians > -margin).mean()
    p_high = (diff_medians < margin).mean()
    p_tost = min(p_low, p_high)  # TOST uses max, but here we want both
    # Actually TOST: reject if CI within (-margin, margin)
    ci = np.percentile(diff_medians, [2.5, 97.5])
    equiv = ci[0] > -margin and ci[1] < margin
    
    return {"ci": ci, "equivalent": equiv, "p_low": p_low, "p_high": p_high}

eq_result = bootstrap_equivalence(day_data, night_data, margin)
print(f"Equivalence test (10% margin): CI={eq_result['ci']}, Equivalent={eq_result['equivalent']}")
```

### Bayesian Hypothesis Testing

#### 5.5 Bayesian Compliance Testing (Beta-Binomial)
```python
def bayesian_compliance_test(successes, trials, target_rate=0.90, 
                             prior_alpha=90, prior_beta=10, 
                             rope_width=0.02):
    """
    Bayesian compliance test with ROPE (Region of Practical Equivalence).
    """
    with pm.Model() as model:
        # Prior
        p = pm.Beta("p", alpha=prior_alpha, beta=prior_beta)
        
        # Likelihood
        observed = pm.Binomial("obs", n=trials, p=p, observed=successes)
        
        # Posterior
        trace = pm.sample(3000, tune=1500, chains=4, target_accept=0.95, random_seed=42)
    
    post_p = trace.posterior["p"].values.flatten()
    
    # Probability above target
    prob_above = (post_p > target_rate).mean()
    
    # ROPE: target_rate ± rope_width
    rope_low = target_rate - rope_width
    rope_high = target_rate + rope_width
    in_rope = ((post_p >= rope_low) & (post_p <= rope_high)).mean()
    below_rope = (post_p < rope_low).mean()
    above_rope = (post_p > rope_high).mean()
    
    # Decision
    if prob_above > 0.95:
        decision = "Compliant (high confidence)"
    elif below_rope > 0.95:
        decision = "Non-compliant (high confidence)"
    else:
        decision = "Uncertain - more data needed"
    
    return {
        "trace": trace,
        "posterior_mean": post_p.mean(),
        "hdi_95": az.hdi(post_p, hdi_prob=0.95),
        "prob_above_target": prob_above,
        "rope": {"low": rope_low, "high": rope_high, 
                 "in_rope": in_rope, "below": below_rope, "above": above_rope},
        "decision": decision
    }

# Test NENA 15s compliance
total_911 = calls["nine_one_one_calls_received"].sum()
ans_15 = int((calls["nine_one_one_answered_15s_pct"]/100 * calls["nine_one_one_calls_received"]).sum())

bayes_comp = bayesian_compliance_test(ans_15, total_911, target_rate=0.90)
print("Bayesian NENA 15s Compliance:")
for k, v in bayes_comp.items():
    if k != "trace":
        print(f"  {k}: {v}")

# Plot posterior with ROPE
az.plot_posterior(bayes_comp["trace"], var_names=["p"], 
                  rope=[0.88, 0.92], ref_val=0.90)
```

#### 5.6 Bayesian Group Comparison (BEST - Bayesian Estimation Supersedes the t-test)
```python
def bayesian_group_comparison(group1, group2, group_names=["Group 1", "Group 2"]):
    """
    Bayesian estimation of difference between groups (BEST procedure).
    Uses robust t-distribution for heavy tails.
    """
    y1 = group1.dropna().values
    y2 = group2.dropna().values
    
    with pm.Model() as model:
        # Group means
        mu1 = pm.Normal("mu1", mu=y1.mean(), sigma=y1.std()*2)
        mu2 = pm.Normal("mu2", mu=y2.mean(), sigma=y2.std()*2)
        
        # Group standard deviations (log scale)
        sigma1 = pm.HalfNormal("sigma1", sigma=y1.std()*2)
        sigma2 = pm.HalfNormal("sigma2", sigma=y2.std()*2)
        
        # Normality parameter (nu) - heavy tails
        nu = pm.Exponential("nu", lam=1/29) + 1  # Prior favors near-normal but allows heavy tails
        
        # Likelihoods (Student's t for robustness)
        like1 = pm.StudentT("like1", nu=nu, mu=mu1, sigma=sigma1, observed=y1)
        like2 = pm.StudentT("like2", nu=nu, mu=mu2, sigma=sigma2, observed=y2)
        
        # Derived quantities
        diff_mu = pm.Deterministic("diff_mu", mu1 - mu2)
        diff_sigma = pm.Deterministic("diff_sigma", sigma1 - sigma2)
        effect_size = pm.Deterministic("effect_size", (mu1 - mu2) / pm.math.sqrt((sigma1**2 + sigma2**2)/2))
        
        trace = pm.sample(3000, tune=1500, chains=4, target_accept=0.95, random_seed=42)
    
    # Summarize
    post_diff = trace.posterior["diff_mu"].values.flatten()
    post_eff = trace.posterior["effect_size"].values.flatten()
    
    prob_diff_pos = (post_diff > 0).mean()
    hdi_diff = az.hdi(post_diff, hdi_prob=0.95)
    hdi_eff = az.hdi(post_eff, hdi_prob=0.95)
    
    return {
        "trace": trace,
        "diff_mean": post_diff.mean(),
        "diff_hdi": hdi_diff,
        "effect_size_mean": post_eff.mean(),
        "effect_size_hdi": hdi_eff,
        "prob_diff_positive": prob_diff_pos,
        "prob_eff_gt_02": (post_eff > 0.2).mean(),  # Small effect
        "prob_eff_gt_05": (post_eff > 0.5).mean(),  # Medium effect
        "prob_eff_gt_08": (post_eff > 0.8).mean(),  # Large effect
    }

# Compare Day vs Night shift total elapsed time
day = incidents[incidents["shift"]=="D"]["total_elapsed_seconds"]
night = incidents[incidents["shift"]=="N"]["total_elapsed_seconds"]

bayes_grp = bayesian_group_comparison(day, night, ["Day", "Night"])
print("Bayesian Day vs Night Comparison:")
for k, v in bayes_grp.items():
    if k != "trace":
        print(f"  {k}: {v}")

# Plot
az.plot_posterior(bayes_grp["trace"], var_names=["diff_mu", "effect_size"], hdi_prob=0.95)
```

#### 5.7 Bayesian Equivalence Testing
```python
def bayesian_equivalence_test(group1, group2, equivalence_margin, metric="mean"):
    """
    Bayesian equivalence test using HDI+ROPE decision rule.
    """
    if metric == "mean":
        bayes_result = bayesian_group_comparison(group1, group2)
        diff_samples = bayes_result["trace"].posterior["diff_mu"].values.flatten()
    else:
        # For median, use bootstrap or Bayesian quantile
        # Simplified: bootstrap
        diff_samples = []
        for _ in range(5000):
            s1 = np.random.choice(group1.dropna(), len(group1.dropna()), replace=True)
            s2 = np.random.choice(group2.dropna(), len(group2.dropna()), replace=True)
            if metric == "mean":
                diff_samples.append(s1.mean() - s2.mean())
            else:
                diff_samples.append(np.median(s1) - np.median(s2))
        diff_samples = np.array(diff_samples)
    
    # ROPE: [-margin, margin]
    in_rope = ((diff_samples >= -equivalence_margin) & (diff_samples <= equivalence_margin)).mean()
    below = (diff_samples < -equivalence_margin).mean()
    above = (diff_samples > equivalence_margin).mean()
    
    # Decision
    if in_rope > 0.95:
        decision = "Equivalent"
    elif below > 0.95:
        decision = f"{group_names[0]} < {group_names[1]} (beyond margin)"
    elif above > 0.95:
        decision = f"{group_names[0]} > {group_names[1]} (beyond margin)"
    else:
        decision = "Uncertain"
    
    return {
        "margin": equivalence_margin,
        "in_rope": in_rope,
        "below_rope": below,
        "above_rope": above,
        "decision": decision,
        "diff_hdi": az.hdi(diff_samples, hdi_prob=0.95)
    }

# Equivalence of dispatch queue: Day vs Night within 5 seconds
eq_bayes = bayesian_equivalence_test(
    incidents[incidents["shift"]=="D"]["dispatch_queue_seconds"],
    incidents[incidents["shift"]=="N"]["dispatch_queue_seconds"],
    equivalence_margin=5,
    metric="median"
)
print("Bayesian Equivalence (Dispatch Queue, 5s margin):")
for k, v in eq_bayes.items():
    print(f"  {k}: {v}")
```

---

## 6. Time Series Analysis — Deep Dive

> **Use for spotting trends and seasonality, like identifying when orders typically spike and forecasting next month's sales.**

### Frequentist Time Series Suite

#### 6.1 Complete Time Series Diagnostics
```python
def ts_diagnostics(series, period=24, max_lag=48):
    """Complete time series diagnostic suite."""
    
    results = {}
    
    # 1. Stationarity tests
    adf = adfuller(series.dropna())
    results["adf"] = {"stat": adf[0], "p": adf[1], "critical": adf[4]}
    
    kpss_stat, kpss_p, _, kpss_crit = kpss(series.dropna(), regression='ct', nlags="auto")
    results["kpss"] = {"stat": kpss_stat, "p": kpss_p, "critical": kpss_crit}
    
    # 2. ACF/PACF
    acf_vals = acf(series.dropna(), nlags=max_lag, fft=True)
    pacf_vals = pacf(series.dropna(), nlags=max_lag)
    results["acf"] = acf_vals
    results["pacf"] = pacf_vals
    
    # 3. Ljung-Box test
    lb = acorr_ljungbox(series.dropna(), lags=[6, 12, 24, max_lag], return_df=True)
    results["ljung_box"] = lb
    
    # 4. Seasonal decomposition
    stl = STL(series, period=period, robust=True)
    decomp = stl.fit()
    results["decomposition"] = {
        "trend": decomp.trend,
        "seasonal": decomp.seasonal,
        "resid": decomp.resid
    }
    
    # Strength of trend and seasonality
    var_resid = np.var(decomp.resid.dropna())
    var_trend_resid = np.var((decomp.trend + decomp.resid).dropna())
    var_seas_resid = np.var((decomp.seasonal + decomp.resid).dropna())
    
    results["trend_strength"] = max(0, 1 - var_resid / var_trend_resid)
    results["seasonal_strength"] = max(0, 1 - var_resid / var_seas_resid)
    
    # 5. Seasonal subseries
    # Check if seasonal pattern stable
    
    return results

# Run on hourly 911 calls
ts_911 = calls.set_index("hour_start")["nine_one_one_calls_received"].asfreq("h")
diag_911 = ts_diagnostics(ts_911, period=24)

print("911 Time Series Diagnostics:")
print(f"  ADF: stat={diag_911['adf']['stat']:.3f}, p={diag_911['adf']['p']:.4f}")
print(f"  KPSS: stat={diag_911['kpss']['stat']:.3f}, p={diag_911['kpss']['p']:.4f}")
print(f"  Trend Strength: {diag_911['trend_strength']:.3f}")
print(f"  Seasonal Strength: {diag_911['seasonal_strength']:.3f}")
print(f"  Ljung-Box (lag 24): p={diag_911['ljung_box'].iloc[2]['lb_pvalue']:.4f}")
```

#### 6.2 Forecasting Model Suite
```python
def forecasting_suite(train, test=None, period=24, horizon=24):
    """Fit and compare multiple forecasting models."""
    
    models = {}
    forecasts = {}
    metrics = {}
    
    # 1. Naive (last value)
    naive_fc = np.full(horizon, train.iloc[-1])
    models["Naive"] = "Last value"
    forecasts["Naive"] = naive_fc
    
    # 2. Seasonal Naive (same hour last week)
    seas_naive = train.iloc[-period*7:].values[-horizon:] if len(train) >= period*7 else naive_fc
    models["Seasonal_Naive"] = "Same hour last week"
    forecasts["Seasonal_Naive"] = seas_naive
    
    # 3. Holt-Winters (Exponential Smoothing)
    try:
        hw = ExponentialSmoothing(train, trend="add", seasonal="add", seasonal_periods=period).fit()
        models["Holt_Winters"] = hw
        forecasts["Holt_Winters"] = hw.forecast(horizon)
    except Exception as e:
        print(f"Holt-Winters failed: {e}")
    
    # 4. ARIMA (auto)
    try:
        # Simple auto-ARIMA via AIC grid search
        best_aic = np.inf
        best_order = None
        for p in range(3):
            for d in range(2):
                for q in range(3):
                    try:
                        m = ARIMA(train, order=(p,d,q)).fit()
                        if m.aic < best_aic:
                            best_aic = m.aic
                            best_order = (p,d,q)
                    except:
                        pass
        if best_order:
            arima = ARIMA(train, order=best_order).fit()
            models["ARIMA"] = arima
            forecasts["ARIMA"] = arima.forecast(horizon)
            print(f"Best ARIMA: {best_order}, AIC={best_aic:.1f}")
    except Exception as e:
        print(f"ARIMA failed: {e}")
    
    # 5. SARIMA (seasonal ARIMA)
    try:
        best_aic = np.inf
        best_order = None
        best_seasonal = None
        for p in range(2):
            for d in range(2):
                for q in range(2):
                    for P in range(2):
                        for D in range(2):
                            for Q in range(2):
                                try:
                                    m = SARIMAX(train, order=(p,d,q), seasonal_order=(P,D,Q,period)).fit(disp=False)
                                    if m.aic < best_aic:
                                        best_aic = m.aic
                                        best_order = (p,d,q)
                                        best_seasonal = (P,D,Q,period)
                                except:
                                    pass
        if best_order:
            sarima = SARIMAX(train, order=best_order, seasonal_order=best_seasonal).fit(disp=False)
            models["SARIMA"] = sarima
            forecasts["SARIMA"] = sarima.forecast(horizon)
            print(f"Best SARIMA: {best_order}x{best_seasonal}, AIC={best_aic:.1f}")
    except Exception as e:
        print(f"SARIMA failed: {e}")
    
    # 6. Prophet (if available)
    try:
        from prophet import Prophet
        df_prophet = train.reset_index()
        df_prophet.columns = ["ds", "y"]
        m = Prophet(yearly_seasonality=False, weekly_seasonality=True, daily_seasonality=True)
        m.fit(df_prophet)
        future = m.make_future_dataframe(periods=horizon, freq="h")
        fc = m.predict(future)
        models["Prophet"] = m
        forecasts["Prophet"] = fc["yhat"].values[-horizon:]
    except Exception as e:
        print(f"Prophet failed: {e}")
    
    # Evaluate on test set if provided
    if test is not None:
        for name, fc in forecasts.items():
            if len(fc) >= len(test):
                mae = np.mean(np.abs(fc[:len(test)] - test.values))
                rmse = np.sqrt(np.mean((fc[:len(test)] - test.values)**2))
                mape = np.mean(np.abs((fc[:len(test)] - test.values) / test.values)) * 100
                metrics[name] = {"MAE": mae, "RMSE": rmse, "MAPE": mape}
    
    return models, forecasts, metrics

# Split data: first 5 days train, last 2 days test
train_len = 5 * 24
train = ts_911[:train_len]
test = ts_911[train_len:]

models, forecasts, metrics = forecasting_suite(train, test, period=24, horizon=48)

print("\nForecast Metrics (on test set):")
for name, m in metrics.items():
    print(f"  {name}: MAE={m['MAE']:.2f}, RMSE={m['RMSE']:.2f}, MAPE={m['MAPE']:.1f}%")

# Plot forecasts
plt.figure(figsize=(14, 6))
plt.plot(test.index, test.values, 'k-', label='Actual', linewidth=2)
for name, fc in forecasts.items():
    if len(fc) >= len(test):
        plt.plot(test.index, fc[:len(test)], '--', label=name, alpha=0.7)
plt.legend()
plt.title("911 Call Volume Forecasts (Last 2 Days)")
plt.show()
```

#### 6.3 Change Point Detection
```python
def changepoint_detection(series, method="bayesian"):
    """Detect structural changes in time series."""
    
    results = {}
    
    if method == "ruptures":
        # Offline change point detection
        from ruptures import Binseg, Pelt, Window, Dynp
        from ruptures.costs import CostNormal, CostL2
        
        signal = series.values
        # PELT with L2 cost
        algo = Pelt(model="l2").fit(signal)
        bkps = algo.predict(pen=10)
        results["ruptures_pelt"] = bkps[:-1]  # Last is end
        
        # Binary segmentation
        algo = Binseg(model="l2").fit(signal)
        bkps = algo.predict(n_bkps=3)
        results["ruptures_binseg"] = bkps[:-1]
    
    elif method == "bayesian":
        # Bayesian online change point detection (BOCPD)
        # Using hazard function and conjugate prior
        from scipy.stats import norm
        
        # Simplified BOCPD for normal data with known variance
        def bocpd(data, hazard=1/100, prior_mean=0, prior_var=1, obs_var=1):
            """Bayesian Online Change Point Detection."""
            n = len(data)
            # Run length distribution
            R = np.zeros((n+1, n+1))
            R[0, 0] = 1
            
            # Predictive probabilities
            pred_probs = np.zeros(n)
            
            for t in range(1, n+1):
                # Compute predictive probability for each run length
                for r in range(t):
                    # Posterior predictive for run length r
                    n_data = r
                    # Simplified: assume known variance
                    post_mean = (prior_mean/prior_var + data[t-r:t].sum()/obs_var) / (1/prior_var + n_data/obs_var)
                    post_var = 1 / (1/prior_var + n_data/obs_var)
                    pred_probs[t-1] += R[t-1, r] * norm.pdf(data[t-1], post_mean, np.sqrt(post_var + obs_var))
                
                # Growth probabilities
                R[t, 1:t+1] = R[t-1, :t] * (1 - hazard)
                # Changepoint probability
                R[t, 0] = np.sum(R[t-1, :t] * hazard)
                
                # Normalize
                R[t, :t+1] /= R[t, :t+1].sum()
            
            # Changepoint probability at each time
            cp_prob = R[1:, 0]
            return cp_prob, R
        
        # Standardize
        std_data = (series - series.mean()) / series.std()
        cp_prob, R = bocpd(std_data.values)
        results["bocpd_cp_prob"] = cp_prob
        results["changepoints"] = np.where(cp_prob > 0.5)[0]
    
    return results

# Detect changepoints in daily compliance
daily_compliance = calls.set_index("hour_start")["nine_one_one_answered_20s_pct"].resample("D").mean()
cp_results = changepoint_detection(daily_compliance, method="bayesian")

print("Changepoint Detection (Daily Compliance):")
print(f"  Changepoint probabilities: {cp_results['bocpd_cp_prob']}")
print(f"  Detected changepoints (prob > 0.5): {cp_results['changepoints']}")
```

### Bayesian Time Series

#### 6.4 Bayesian Structural Time Series (BSTS)
```python
def bayesian_structural_time_series(series, period=24, horizon=24):
    """
    Bayesian Structural Time Series with local linear trend and seasonal.
    """
    # Standardize
    y = series.values
    y_std = (y - y.mean()) / y.std()
    n = len(y_std)
    
    with pm.Model() as model:
        # Observation noise
        sigma_obs = pm.HalfNormal("sigma_obs", sigma=0.1)
        
        # Local linear trend
        # Level
        sigma_level = pm.HalfNormal("sigma_level", sigma=0.01)
        level = pm.GaussianRandomWalk("level", sigma=sigma_level, init_dist=pm.Normal.dist(0, 1), shape=n)
        
        # Slope
        sigma_slope = pm.HalfNormal("sigma_slope", sigma=0.001)
        slope = pm.GaussianRandomWalk("slope", sigma=sigma_slope, init_dist=pm.Normal.dist(0, 0.1), shape=n)
        
        # Trend = level + cumulative slope
        trend = pm.Deterministic("trend", level + pm.math.cumsum(slope))
        
        # Seasonal (period=24)
        # Dummy seasonal with sum-to-zero constraint
        sigma_seas = pm.HalfNormal("sigma_seas", sigma=0.1)
        # Use Fourier terms for seasonality (more efficient)
        n_harmonics = min(6, period // 2)
        t = np.arange(n)
        seasonal = 0
        for k in range(1, n_harmonics + 1):
            a_k = pm.Normal(f"a_{k}", mu=0, sigma=sigma_seas)
            b_k = pm.Normal(f"b_{k}", mu=0, sigma=sigma_seas)
            seasonal += a_k * np.sin(2 * np.pi * k * t / period) + b_k * np.cos(2 * np.pi * k * t / period)
        
        seasonal = pm.Deterministic("seasonal", seasonal)
        
        # Expected value
        mu = pm.Deterministic("mu", trend + seasonal)
        
        # Likelihood
        likelihood = pm.Normal("y", mu=mu, sigma=sigma_obs, observed=y_std)
        
        trace = pm.sample(2000, tune=1500, chains=4, target_accept=0.95, random_seed=42)
    
    # Forecast
    with model:
        # Extend trend and seasonal for forecast
        forecast_steps = horizon
        
        # Get posterior samples
        post_level = trace.posterior["level"][:, :, -1].values
        post_slope = trace.posterior["slope"][:, :, -1].values
        post_trend = trace.posterior["trend"][:, :, -1].values
        
        # Seasonal forecast
        t_future = np.arange(n, n + forecast_steps)
        seasonal_future = 0
        for k in range(1, n_harmonics + 1):
            a_k = trace.posterior[f"a_{k}"].mean(dim=["chain", "draw"]).values
            b_k = trace.posterior[f"b_{k}"].mean(dim=["chain", "draw"]).values
            seasonal_future += a_k * np.sin(2 * np.pi * k * t_future / period) + \
                              b_k * np.cos(2 * np.pi * k * t_future / period)
        
        # Trend forecast (local linear)
        trend_future = post_trend[:, None] + np.cumsum(post_slope[:, None] * np.ones(forecast_steps), axis=1)
        
        # Combine
        mu_future = trend_future + seasonal_future
        
        # Add observation noise
        sigma_obs_post = trace.posterior["sigma_obs"].mean().values
        forecast_samples = np.random.normal(mu_future, sigma_obs_post)
    
    # Rescale
    forecast_mean = forecast_samples.mean(axis=0) * y.std() + y.mean()
    forecast_lower = np.percentile(forecast_samples, 2.5, axis=0) * y.std() + y.mean()
    forecast_upper = np.percentile(forecast_samples, 97.5, axis=0) * y.std() + y.mean()
    
    return trace, model, forecast_mean, forecast_lower, forecast_upper

# Run BSTS on 911 calls (last 3 days for demo)
train_bsts = ts_911[-72:]  # Last 3 days
trace_bsts, model_bsts, fc_mean, fc_lower, fc_upper = bayesian_structural_time_series(train_bsts, period=24, horizon=24)

# Plot
plt.figure(figsize=(12, 5))
hist_idx = train_bsts.index
future_idx = pd.date_range(hist_idx[-1] + pd.Timedelta(hours=1), periods=24, freq="h")
plt.plot(hist_idx, train_bsts.values, 'k-', label='History', alpha=0.5)
plt.plot(future_idx, fc_mean, 'b-', label='Forecast')
plt.fill_between(future_idx, fc_lower, fc_upper, alpha=0.2, color='blue', label='95% CI')
plt.title("Bayesian Structural Time Series Forecast (911 Calls)")
plt.legend()
plt.show()
```

#### 6.5 Bayesian SARIMA (Dynamic Linear Model)
```python
def bayesian_sarima(series, order=(1,1,1), seasonal_order=(1,1,1,24)):
    """
    Bayesian SARIMA using state space representation.
    """
    y = series.values
    n = len(y)
    
    with pm.Model() as model:
        # AR coefficients
        phi = pm.Normal("phi", mu=0, sigma=1, shape=order[0])
        # MA coefficients
        theta = pm.Normal("theta", mu=0, sigma=1, shape=order[2])
        
        # Seasonal AR
        Phi = pm.Normal("Phi", mu=0, sigma=1, shape=seasonal_order[0])
        # Seasonal MA
        Theta = pm.Normal("Theta", mu=0, sigma=1, shape=seasonal_order[2])
        
        # Innovation variance
        sigma = pm.HalfNormal("sigma", sigma=1)
        
        # State space implementation is complex
        # Use PyMC's built-in ARIMA or custom
        # For simplicity, use bambi's SARIMAX if available
        pass
    
    # Alternative: Use PyMC's built-in
    from pymc_experimental.statespace import SARIMAX as PM_SARIMAX
    
    try:
        with pm.Model() as model:
            sarimax = PM_SARIMAX(
                y, 
                order=order, 
                seasonal_order=seasonal_order,
                sigma=pm.HalfNormal("sigma", 1)
            )
            trace = pm.sample(2000, tune=1500, chains=4, target_accept=0.95, random_seed=42)
        return trace, model
    except:
        print("PyMC statespace not available, using bambi fallback")
        return None, None
```

---

## 7. Cohort Analysis — Deep Dive

> **Use for comparing groups over time, like comparing 30-day repeat purchase rates for customers who first bought in May vs. June.**

### Frequentist Cohort Analysis

#### 7.1 Cohort Definition and Tracking
```python
def define_cohorts(incidents):
    """Define multiple cohort dimensions for 9-1-1 data."""
    
    incidents = incidents.copy()
    incidents["call_date"] = incidents["call_start_time"].dt.date
    incidents["week"] = incidents["call_start_time"].dt.isocalendar().week
    incidents["month"] = incidents["call_start_time"].dt.month
    incidents["dow"] = incidents["call_start_time"].dt.dayofweek
    incidents["hour"] = incidents["call_start_time"].dt.hour
    
    # Cohort 1: Day of Week of First Incident (for calltakers)
    ct_first_dow = incidents.groupby("calltaker")["dow"].min().reset_index()
    ct_first_dow.columns = ["calltaker", "cohort_dow"]
    incidents = incidents.merge(ct_first_dow, on="calltaker", how="left")
    incidents["weeks_since_first"] = incidents["week"] - incidents.groupby("calltaker")["week"].transform("min")
    
    # Cohort 2: Problem Nature (incident-level)
    # Track resolution time by problem nature across weeks
    
    # Cohort 3: Shift (shift-level weekly tracking)
    incidents["shift_week"] = incidents["shift_label"].astype(str) + "_W" + incidents["week"].astype(str)
    
    # Cohort 4: Agency-Week
    incidents["agency_week"] = incidents["agency"].astype(str) + "_W" + incidents["week"].astype(str)
    
    return incidents

incidents = define_cohorts(incidents)
```

#### 7.2 Cohort Retention/Performance Tables
```python
def cohort_retention_table(data, cohort_col, period_col, metric_col, agg_func="median"):
    """Generate cohort analysis table."""
    
    # Pivot table
    if agg_func == "median":
        table = data.pivot_table(index=cohort_col, columns=period_col, 
                                  values=metric_col, aggfunc="median")
    elif agg_func == "mean":
        table = data.pivot_table(index=cohort_col, columns=period_col, 
                                  values=metric_col, aggfunc="mean")
    elif agg_func == "count":
        table = data.pivot_table(index=cohort_col, columns=period_col, 
                                  values=metric_col, aggfunc="count")
    else:
        table = data.pivot_table(index=cohort_col, columns=period_col, 
                                  values=metric_col, aggfunc=agg_func)
    
    # Retention rate (for count metric)
    if agg_func == "count":
        first_period = table.iloc[:, 0]
        retention = table.div(first_period, axis=0) * 100
        return table, retention.round(1)
    
    return table, None

# Calltaker cohort: median handle time by weeks since first shift
ct_cohort = incidents[incidents["weeks_since_first"] >= 0].pivot_table(
    index="cohort_dow", columns="weeks_since_first", 
    values="total_elapsed_seconds", aggfunc="median"
)
print("Calltaker Cohort (DOW of first shift) - Median Handle Time by Week:")
print(ct_cohort.round(0))

# Agency cohort: volume retention
agency_table, agency_retention = cohort_retention_table(
    incidents, "agency", "week", "id_number", "count"
)
print("\nAgency Volume Retention (% of Week 1):")
print(agency_retention)

# Shift cohort: compliance by week
shift_table, shift_retention = cohort_retention_table(
    incidents, "shift_label", "week", "id_number", "count"
)
print("\nShift Volume Retention (% of Week 1):")
print(shift_retention)
```

#### 7.3 Cohort Visualization
```python
def plot_cohort_heatmap(table, title, cmap="RdYlGn", center=None):
    """Plot cohort table as heatmap."""
    plt.figure(figsize=(10, 6))
    sns.heatmap(table, annot=True, fmt=".0f", cmap=cmap, center=center, 
                cbar_kws={"label": "Value"})
    plt.title(title)
    plt.tight_layout()
    plt.show()

def plot_cohort_lines(table, title, xlabel="Period", ylabel="Metric"):
    """Plot cohort trends as lines."""
    table.T.plot(marker='o', figsize=(10, 6))
    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.legend(title="Cohort", bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.tight_layout()
    plt.show()

# Visualize
plot_cohort_heatmap(ct_cohort.fillna(0), "Calltaker Cohort: Median Handle Time by Week", cmap="YlOrRd")
plot_cohort_lines(ct_cohort, "Calltaker Learning Curves", "Weeks Since First Shift", "Median Handle Time (s)")
```

#### 7.4 Cohort Statistical Comparison
```python
def cohort_statistical_comparison(data, cohort_col, period_col, metric_col):
    """Test if cohorts differ significantly in their trajectories."""
    
    # Linear mixed model: metric ~ period * cohort + (1|subject)
    # For calltakers: handle_time ~ week * cohort_dow + (1|calltaker)
    
    from statsmodels.regression.mixed_linear_model import MixedLM
    
    # Prepare data
    df = data.dropna(subset=[cohort_col, period_col, metric_col]).copy()
    df["period_num"] = df[period_col].astype(float)
    df["cohort_num"] = pd.Categorical(df[cohort_col]).codes
    
    # Mixed model
    try:
        model = MixedLM.from_formula(
            f"{metric_col} ~ period_num * C({cohort_col})",
            groups="calltaker" if "calltaker" in df.columns else cohort_col,
            data=df
        ).fit()
        print(model.summary())
        return model
    except Exception as e:
        print(f"Mixed model failed: {e}")
        return None

# Test if calltaker learning curves differ by starting DOW
cohort_model = cohort_statistical_comparison(incidents, "cohort_dow", "weeks_since_first", "total_elapsed_seconds")
```

### Bayesian Cohort Analysis

#### 7.5 Bayesian Hierarchical Cohort Model
```python
def bayesian_cohort_model(data, cohort_col, period_col, metric_col):
    """
    Bayesian hierarchical model for cohort trajectories.
    Allows partial pooling across cohorts.
    """
    df = data.dropna(subset=[cohort_col, period_col, metric_col]).copy()
    
    cohorts = df[cohort_col].unique()
    n_cohorts = len(cohorts)
    cohort_idx = pd.Categorical(df[cohort_col]).codes
    periods = df[period_col].values
    y = df[metric_col].values
    
    # Standardize period
    period_std = (periods - periods.mean()) / periods.std()
    y_std = (y - y.mean()) / y.std()
    
    with pm.Model() as model:
        # Population-level (hyper) parameters
        mu_alpha = pm.Normal("mu_alpha", mu=0, sigma=1)
        mu_beta = pm.Normal("mu_beta", mu=0, sigma=1)
        sigma_alpha = pm.HalfNormal("sigma_alpha", sigma=1)
        sigma_beta = pm.HalfNormal("sigma_beta", sigma=1)
        
        # Cohort-specific parameters (partial pooling)
        alpha = pm.Normal("alpha", mu=mu_alpha, sigma=sigma_alpha, shape=n_cohorts)
        beta = pm.Normal("beta", mu=mu_beta, sigma=sigma_beta, shape=n_cohorts)
        
        # Observation noise
        sigma = pm.HalfNormal("sigma", sigma=1)
        
        # Expected value
        mu = alpha[cohort_idx] + beta[cohort_idx] * period_std
        
        # Likelihood
        likelihood = pm.Normal("y", mu=mu, sigma=sigma, observed=y_std)
        
        trace = pm.sample(2000, tune=1500, chains=4, target_accept=0.95, random_seed=42)
    
    # Posterior predictions for each cohort
    with model:
        ppc = pm.sample_posterior_predictive(trace, extend_inferencedata=True)
    
    return trace, model

# Run on calltaker cohorts (if enough data)
# trace_cohort, model_cohort = bayesian_cohort_model(
#     incidents[incidents["weeks_since_first"] <= 4], 
#     "cohort_dow", "weeks_since_first", "total_elapsed_seconds"
# )
```

---

## 8. Funnel Analysis — Deep Dive

> **Use for finding where people drop off, like the checkout step where you lose the most shoppers.**

### Frequentist Funnel Analysis

#### 8.1 Complete Dispatch Funnel
```python
def dispatch_funnel_analysis(incidents, calls):
    """Complete funnel from call received to call closed."""
    
    # Stage definitions with thresholds
    stages = [
        {
            "name": "1. Call Received",
            "count": len(incidents),
            "description": "Total incidents in CAD"
        },
        {
            "name": "2. Phone Picked Up",
            "count": incidents["pickup_delay_seconds"].notna().sum(),
            "threshold": "< 10s (NENA)",
            "threshold_pct": (incidents["pickup_delay_seconds"] <= 10).mean() * 100
        },
        {
            "name": "3. Interview Complete",
            "count": incidents["interview_seconds"].notna().sum(),
            "threshold": "< 60s (typical)",
            "threshold_pct": (incidents["interview_seconds"] <= 60).mean() * 100
        },
        {
            "name": "4. Unit Dispatched",
            "count": incidents["time_first_unit_assigned"].notna().sum(),
            "threshold": "Queue < 64s (NFPA 90%)",
            "threshold_pct": (incidents["dispatch_queue_seconds"] <= 64).mean() * 100
        },
        {
            "name": "5. Unit Enroute",
            "count": incidents["time_unit_enroute"].notna().sum(),
            "threshold": "Turnout < 60/80s (NFPA)",
            "threshold_pct": None  # Agency-specific
        },
        {
            "name": "6. Unit Arrived",
            "count": incidents["time_unit_arrived"].notna().sum(),
            "threshold": "Travel < 240s (NFPA 90%)",
            "threshold_pct": (incidents["travel_seconds"] <= 240).mean() * 100
        },
        {
            "name": "7. On Scene",
            "count": incidents["time_unit_arrived"].notna().sum(),
            "threshold": "On-scene time varies",
            "threshold_pct": None
        },
        {
            "name": "8. Call Closed",
            "count": incidents["time_call_closed"].notna().sum(),
            "threshold": "Total < 30 min typical",
            "threshold_pct": (incidents["total_elapsed_seconds"] <= 1800).mean() * 100
        }
    ]
    
    funnel_df = pd.DataFrame(stages)
    funnel_df["pct_of_start"] = funnel_df["count"] / funnel_df["count"].iloc[0] * 100
    funnel_df["drop_off"] = funnel_df["count"].diff().fillna(0) * -1
    funnel_df["drop_off_pct"] = funnel_df["drop_off"] / funnel_df["count"].iloc[0] * 100
    
    return funnel_df

funnel = dispatch_funnel_analysis(incidents, calls)
print("DISPATCH FUNNEL")
print("=" * 80)
print(funnel[["name", "count", "pct_of_start", "drop_off", "drop_off_pct", "threshold", "threshold_pct"]].to_string(index=False))
```

#### 8.2 Funnel by Segment (Priority, Agency, Shift)
```python
def funnel_by_segment(data, segment_col, funnel_stages=None):
    """Generate funnel for each segment value."""
    
    if funnel_stages is None:
        funnel_stages = [
            ("Call Received", lambda d: len(d)),
            ("Phone Picked Up", lambda d: d["pickup_delay_seconds"].notna().sum()),
            ("Queue Entry", lambda d: d["time_call_enters_queue"].notna().sum()),
            ("Unit Assigned", lambda d: d["time_first_unit_assigned"].notna().sum()),
            ("Unit Enroute", lambda d: d["time_unit_enroute"].notna().sum()),
            ("Unit Arrived", lambda d: d["time_unit_arrived"].notna().sum()),
            ("Call Closed", lambda d: d["time_call_closed"].notna().sum()),
        ]
    
    segments = data[segment_col].unique()
    results = {}
    
    for seg in segments:
        subset = data[data[segment_col] == seg]
        funnel = []
        for name, func in funnel_stages:
            funnel.append({"stage": name, "count": func(subset)})
        funnel_df = pd.DataFrame(funnel)
        funnel_df["pct"] = funnel_df["count"] / funnel_df["count"].iloc[0] * 100
        results[seg] = funnel_df
    
    return results

# Funnel by priority
priority_funnels = funnel_by_segment(incidents, "priority")
for p, f in priority_funnels.items():
    print(f"\nPriority {p} Funnel:")
    print(f.to_string(index=False))

# Funnel by agency
agency_funnels = funnel_by_segment(incidents, "agency")
for a, f in agency_funnels.items():
    print(f"\n{a} Funnel:")
    print(f.to_string(index=False))
```

#### 8.3 Time-Based Funnel (Where Time Is Lost)
```python
def time_funnel_analysis(data):
    """Analyze time spent at each stage."""
    
    time_stages = [
        ("Pickup Delay", "pickup_delay_seconds"),
        ("Interview", "interview_seconds"),
        ("Dispatch Queue", "dispatch_queue_seconds"),
        ("Turnout", "turnout_seconds"),
        ("Travel", "travel_seconds"),
        ("On Scene", "on_scene_seconds"),
    ]
    
    results = []
    for name, col in time_stages:
        vals = data[col].dropna()
        results.append({
            "Stage": name,
            "Count": len(vals),
            "Median": vals.median(),
            "Mean": vals.mean(),
            "P90": np.percentile(vals, 90),
            "P95": np.percentile(vals, 95),
            "P99": np.percentile(vals, 99),
            "Std": vals.std(),
        })
    
    time_funnel = pd.DataFrame(results)
    time_funnel["Cumulative_Median"] = time_funnel["Median"].cumsum()
    time_funnel["Cumulative_P90"] = time_funnel["P90"].cumsum()
    
    return time_funnel

tf = time_funnel_analysis(incidents)
print("\nTIME FUNNEL (Where Time Is Spent)")
print("=" * 80)
print(tf.to_string(index=False))

# Visualize
import plotnine as p9
(p9.ggplot(tf, p9.aes(x="Stage", y="Median"))
 + p9.geom_col(fill="#1c5789", alpha=0.8)
 + p9.geom_text(p9.aes(label="f'{Median:.0f}s'"), va="bottom")
 + p9.labs(title="Median Time per Dispatch Stage", x="", y="Seconds")
 + p9.theme_minimal())
```

#### 8.4 Compliance Funnel (Standards at Each Stage)
```python
def compliance_funnel(calls, incidents):
    """Funnel showing compliance with standards at each stage."""
    
    standards = [
        {
            "stage": "911 Answered ≤ 10s",
            "standard": "NENA: 90%",
            "actual": calls["nine_one_one_answered_10s_pct"].mean(),
            "target": 90
        },
        {
            "stage": "911 Answered ≤ 15s",
            "standard": "NENA: 95%",
            "actual": calls["nine_one_one_answered_15s_pct"].mean(),
            "target": 95
        },
        {
            "stage": "911 Answered ≤ 20s",
            "standard": "NENA: 95%",
            "actual": calls["nine_one_one_answered_20s_pct"].mean(),
            "target": 95
        },
        {
            "stage": "Dispatch Queue ≤ 64s",
            "standard": "NFPA 1710: 90%",
            "actual": (incidents["dispatch_queue_seconds"] <= 64).mean() * 100,
            "target": 90
        },
        {
            "stage": "Dispatch Queue ≤ 106s",
            "standard": "NFPA 1710: 95%",
            "actual": (incidents["dispatch_queue_seconds"] <= 106).mean() * 100,
            "target": 95
        },
        {
            "stage": "EMS Turnout ≤ 60s",
            "standard": "NFPA 1710: 90%",
            "actual": (incidents[incidents["agency"]=="EMS"]["turnout_seconds"] <= 60).mean() * 100,
            "target": 90
        },
        {
            "stage": "Fire Turnout ≤ 80s",
            "standard": "NFPA 1710: 90%",
            "actual": (incidents[incidents["agency"]=="FIRE"]["turnout_seconds"] <= 80).mean() * 100,
            "target": 90
        },
        {
            "stage": "Travel ≤ 240s",
            "standard": "NFPA 1710: 90%",
            "actual": (incidents["travel_seconds"] <= 240).mean() * 100,
            "target": 90
        }
    ]
    
    comp_df = pd.DataFrame(standards)
    comp_df["gap"] = comp_df["actual"] - comp_df["target"]
    comp_df["status"] = comp_df["gap"].apply(lambda x: "PASS" if x >= 0 else "FAIL")
    
    return comp_df

comp_funnel = compliance_funnel(calls, incidents)
print("\nCOMPLIANCE FUNNEL")
print("=" * 80)
print(comp_funnel.to_string(index=False))
```

### Bayesian Funnel Analysis

#### 8.5 Bayesian Funnel Conversion Rates
```python
def bayesian_funnel(funnel_counts, prior_alpha=1, prior_beta=1):
    """
    Bayesian estimation of funnel conversion rates.
    funnel_counts: list of counts at each stage [stage1, stage2, ...]
    """
    n_stages = len(funnel_counts)
    
    with pm.Model() as model:
        # Conversion rates between stages
        # θ_i = P(reach stage i+1 | reached stage i)
        theta = pm.Beta("theta", alpha=prior_alpha, beta=prior_beta, shape=n_stages-1)
        
        # Expected counts
        expected = [funnel_counts[0]]
        for i in range(1, n_stages):
            expected.append(expected[-1] * theta[i-1])
        expected = pm.Deterministic("expected", pm.math.stack(expected))
        
        # Likelihood: observed counts are binomial from previous stage
        for i in range(1, n_stages):
            pm.Binomial(f"stage_{i}", n=funnel_counts[i-1], p=theta[i-1], observed=funnel_counts[i])
        
        trace = pm.sample(2000, tune=1000, chains=4, target_accept=0.95, random_seed=42)
    
    # Posterior conversion rates
    post_theta = trace.posterior["theta"].mean(dim=["chain", "draw"]).values
    post_hdi = az.hdi(trace.posterior["theta"].values, hdi_prob=0.95)
    
    return trace, model, post_theta, post_hdi

# Example: 911 call funnel from hourly data
funnel_counts_911 = [
    calls["nine_one_one_calls_received"].sum(),  # Received
    calls["nine_one_one_calls_received"].sum() - calls["nine_one_one_calls_abandoned"].sum(),  # Answered
    int((calls["nine_one_one_answered_10s_pct"]/100 * calls["nine_one_one_calls_received"]).sum()),  # ≤10s
    int((calls["nine_one_one_answered_20s_pct"]/100 * calls["nine_one_one_calls_received"]).sum()),  # ≤20s
]

trace_funnel, model_funnel, theta_post, theta_hdi = bayesian_funnel(funnel_counts_911)

print("Bayesian Funnel Conversion Rates:")
for i, (theta, hdi) in enumerate(zip(theta_post, theta_hdi)):
    print(f"  Stage {i+1}→{i+2}: θ = {theta:.3f} (95% HDI: [{hdi[0]:.3f}, {hdi[1]:.3f}])")
```

---

## 9. Cluster Analysis — Deep Dive

> **Use for discovering groups with similar behaviors, like shoppers who buy frequently and spend a little each time.**

### Frequentist Clustering Suite

#### 9.1 Incident Archetype Clustering
```python
def incident_clustering(data, features, n_clusters_range=range(2, 8)):
    """Comprehensive incident clustering with validation."""
    
    from sklearn.preprocessing import RobustScaler, StandardScaler
    from sklearn.cluster import KMeans, AgglomerativeClustering, DBSCAN
    from sklearn.mixture import GaussianMixture
    from sklearn.metrics import silhouette_score, calinski_harabasz_score, davies_bouldin_score
    from sklearn.decomposition import PCA
    
    # Prepare data
    X = data[features].dropna()
    scaler = RobustScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Log transform for skewed features
    for i, col in enumerate(features):
        if stats.skew(X[col]) > 1:
            X_scaled[:, i] = np.log1p(X_scaled[:, i] - X_scaled[:, i].min() + 1)
    
    # Re-scale after log
    X_scaled = RobustScaler().fit_transform(X_scaled)
    
    results = {}
    
    # 1. K-Means with multiple k
    kmeans_results = {}
    for k in n_clusters_range:
        km = KMeans(n_clusters=k, random_state=42, n_init=20)
        labels = km.fit_predict(X_scaled)
        sil = silhouette_score(X_scaled, labels)
        ch = calinski_harabasz_score(X_scaled, labels)
        db = davies_bouldin_score(X_scaled, labels)
        kmeans_results[k] = {
            "model": km,
            "labels": labels,
            "silhouette": sil,
            "calinski_harabasz": ch,
            "davies_bouldin": db,
            "inertia": km.inertia_
        }
        print(f"K={k}: Silhouette={sil:.3f}, CH={ch:.1f}, DB={db:.3f}, Inertia={km.inertia_:.1f}")
    
    results["kmeans"] = kmeans_results
    
    # 2. Gaussian Mixture Models
    gmm_results = {}
    for k in n_clusters_range:
        gmm = GaussianMixture(n_components=k, random_state=42, n_init=10)
        labels = gmm.fit_predict(X_scaled)
        sil = silhouette_score(X_scaled, labels)
        bic = gmm.bic(X_scaled)
        aic = gmm.aic(X_scaled)
        gmm_results[k] = {
            "model": gmm,
            "labels": labels,
            "silhouette": sil,
            "bic": bic,
            "aic": aic
        }
        print(f"GMM K={k}: Silhouette={sil:.3f}, BIC={bic:.1f}, AIC={aic:.1f}")
    
    results["gmm"] = gmm_results
    
    # 3. Hierarchical Clustering
    from scipy.cluster.hierarchy import linkage, fcluster, dendrogram
    Z = linkage(X_scaled, method="ward")
    hier_results = {}
    for k in n_clusters_range:
        labels = fcluster(Z, t=k, criterion="maxclust") - 1
        sil = silhouette_score(X_scaled, labels)
        hier_results[k] = {"labels": labels, "silhouette": sil, "linkage": Z}
        print(f"Hierarchical K={k}: Silhouette={sil:.3f}")
    
    results["hierarchical"] = hier_results
    
    # 4. DBSCAN
    dbscan = DBSCAN(eps=1.5, min_samples=5)
    db_labels = dbscan.fit_predict(X_scaled)
    n_clusters_db = len(set(db_labels)) - (1 if -1 in db_labels else 0)
    n_noise = (db_labels == -1).sum()
    print(f"DBSCAN: {n_clusters_db} clusters, {n_noise} noise points")
    results["dbscan"] = {"labels": db_labels, "n_clusters": n_clusters_db}
    
    return results, X_scaled, scaler

# Run clustering on time components
features = ["pickup_delay_seconds", "dispatch_queue_seconds", 
            "turnout_seconds", "travel_seconds", "on_scene_seconds",
            "interview_seconds", "total_elapsed_seconds"]

cluster_results, X_scaled, scaler = incident_clustering(incidents, features)

# Select best K (e.g., K=4 based on silhouette)
best_k = 4
best_labels = cluster_results["kmeans"][best_k]["labels"]
incidents["incident_cluster"] = np.nan
incidents.loc[incidents[features].notna().all(axis=1), "incident_cluster"] = best_labels

# Cluster profiles
cluster_profiles = incidents.groupby("incident_cluster")[features].agg(["median", "mean", "count"])
print("\nCluster Profiles (Median):")
print(cluster_profiles.xs("median", axis=1, level=1).round(0))

# Categorical breakdown
for col in ["agency", "shift_label", "priority", "problem_nature"]:
    ct = pd.crosstab(incidents["incident_cluster"], incidents[col], normalize="index") * 100
    print(f"\nCluster × {col} (%):")
    print(ct.round(1))
```

#### 9.2 Hourly Pattern Clustering (Shift Templates)
```python
def hourly_pattern_clustering(calls):
    """Cluster hours into shift templates based on volume/compliance patterns."""
    
    # Features per hour
    hourly = calls.copy()
    hourly["hour"] = hourly["hour_start"].dt.hour
    hourly["dow"] = hourly["hour_start"].dt.dayofweek
    
    # Aggregate by hour of day (across days)
    hour_profiles = hourly.groupby("hour").agg(
        mean_911=("nine_one_one_calls_received", "mean"),
        mean_non_emerg=("non_emergency_calls_received", "mean"),
        mean_911_20s=("nine_one_one_answered_20s_pct", "mean"),
        mean_non_emerg_20s=("non_emergency_answered_20s_pct", "mean"),
        std_911=("nine_one_one_calls_received", "std"),
        cv_911=("nine_one_one_calls_received", lambda x: x.std()/x.mean() if x.mean()>0 else 0),
    ).reset_index()
    
    # Clustering features
    feat_cols = ["mean_911", "mean_non_emerg", "mean_911_20s", "mean_non_emerg_20s", "cv_911"]
    X = hour_profiles[feat_cols].fillna(0)
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # K-Means
    best_sil = -1
    best_k = 2
    for k in range(2, 6):
        km = KMeans(n_clusters=k, random_state=42, n_init=20)
        labels = km.fit_predict(X_scaled)
        sil = silhouette_score(X_scaled, labels)
        if sil > best_sil:
            best_sil = sil
            best_k = k
    
    km = KMeans(n_clusters=best_k, random_state=42, n_init=20)
    hour_profiles["cluster"] = km.fit_predict(X_scaled)
    
    print(f"Best K={best_k}, Silhouette={best_sil:.3f}")
    print("\nHour Clusters:")
    for c in range(best_k):
        subset = hour_profiles[hour_profiles["cluster"] == c]
        print(f"\nCluster {c} (hours: {subset['hour'].tolist()}):")
        print(subset[feat_cols].mean().round(2))
    
    return hour_profiles, km

hour_profiles, hour_km = hourly_pattern_clustering(calls)
```

#### 9.3 Calltaker Performance Clustering
```python
def calltaker_clustering(incidents, min_calls=20):
    """Cluster calltakers by performance profile."""
    
    ct_stats = incidents.groupby("calltaker").agg(
        n_calls=("id_number", "count"),
        median_pickup=("pickup_delay_seconds", "median"),
        median_interview=("interview_seconds", "median"),
        median_queue=("dispatch_queue_seconds", "median"),
        median_turnout=("turnout_seconds", "median"),
        median_travel=("travel_seconds", "median"),
        median_on_scene=("on_scene_seconds", "median"),
        median_total=("total_elapsed_seconds", "median"),
        pct_undefined=("call_disposition", lambda x: (x=="UNDEFINED").mean()*100),
        pct_priority12=("priority", lambda x: x.isin([1,2]).mean()*100),
    ).reset_index()
    
    ct_stats = ct_stats[ct_stats["n_calls"] >= min_calls]
    
    # Features for clustering
    feat_cols = ["median_pickup", "median_interview", "median_queue", 
                 "median_turnout", "median_travel", "median_on_scene", 
                 "median_total", "pct_undefined"]
    
    X = ct_stats[feat_cols].copy()
    # Log transform
    for col in feat_cols:
        if X[col].skew() > 1:
            X[col] = np.log1p(X[col])
    
    scaler = RobustScaler()
    X_scaled = scaler.fit_transform(X.fillna(X.median()))
    
    # Gaussian Mixture (soft clustering)
    best_bic = np.inf
    best_gmm = None
    for k in range(2, 6):
        gmm = GaussianMixture(n_components=k, random_state=42, n_init=10)
        gmm.fit(X_scaled)
        if gmm.bic(X_scaled) < best_bic:
            best_bic = gmm.bic(X_scaled)
            best_gmm = gmm
    
    ct_stats["cluster"] = best_gmm.predict(X_scaled)
    ct_stats["cluster_prob"] = best_gmm.predict_proba(X_scaled).max(axis=1)
    
    print(f"Best GMM: K={best_gmm.n_components}, BIC={best_bic:.1f}")
    print("\nCalltaker Clusters:")
    for c in range(best_gmm.n_components):
        subset = ct_stats[ct_stats["cluster"] == c]
        print(f"\nCluster {c} (n={len(subset)}, avg prob={subset['cluster_prob'].mean():.2f}):")
        print(subset[feat_cols].median().round(1))
    
    return ct_stats, best_gmm

ct_clusters, ct_gmm = calltaker_clustering(incidents)
```

### Bayesian Clustering

#### 9.4 Bayesian Gaussian Mixture Model (DP-GMM)
```python
def bayesian_dp_gmm(data, features, max_components=6, alpha_prior=1.0):
    """
    Dirichlet Process Gaussian Mixture Model for clustering.
    Automatically infers number of clusters.
    """
    X = data[features].dropna()
    # Log transform skewed
    for col in features:
        if stats.skew(X[col]) > 1:
            X[col] = np.log1p(X[col] - X[col].min() + 1)
    
    scaler = RobustScaler()
    X_scaled = scaler.fit_transform(X)
    n_obs, n_vars = X_scaled.shape
    
    with pm.Model() as model:
        # DP concentration parameter
        alpha = pm.Gamma("alpha", alpha=1, beta=1/alpha_prior)
        
        # Stick-breaking construction
        v = pm.Beta("v", alpha=1, beta=alpha, shape=max_components-1)
        # Weights
        w = pm.Deterministic("w", 
            pm.math.concatenate([[v[0]], 
                v[1:] * pm.math.cumprod(1 - v[:-1])]))
        
        # Component parameters
        mu = pm.Normal("mu", mu=0, sigma=2, shape=(max_components, n_vars))
        
        # LKJ prior for covariance
        packed_L = pm.LKJCholeskyCov("packed_L", n=n_vars, eta=2, 
                                      sd_dist=pm.HalfNormal.dist(1), shape=max_components)
        L = pm.expand_packed_triangular(n_vars, packed_L, lower=True)
        sigma = pm.Deterministic("sigma", L @ L.transpose(0, 2, 1))
        
        # Mixture likelihood
        comp_logp = []
        for k in range(max_components):
            comp_logp.append(pm.MvNormal.logp(X_scaled, mu[k], sigma[k]))
        comp_logp = pm.math.stack(comp_logp, axis=1)
        
        logp = pm.math.logsumexp(pm.math.log(w) + comp_logp, axis=1)
        pm.Potential("likelihood", logp.sum())
        
        trace = pm.sample(2000, tune=1500, chains=4, target_accept=0.95, random_seed=42)
    
    # Posterior cluster assignments
    post_w = trace.posterior["w"].mean(dim=["chain", "draw"]).values
    post_mu = trace.posterior["mu"].mean(dim=["chain", "draw"]).values
    post_sigma = trace.posterior["sigma"].mean(dim=["chain", "draw"]).values
    
    from scipy.stats import multivariate_normal
    resp = np.zeros((n_obs, max_components))
    for k in range(max_components):
        resp[:, k] = post_w[k] * multivariate_normal.pdf(X_scaled, post_mu[k], post_sigma[k])
    resp = resp / resp.sum(axis=1, keepdims=True)
    cluster_assign = resp.argmax(axis=1)
    
    # Effective number of clusters (weight > 1%)
    n_effective = (post_w > 0.01).sum()
    
    return trace, model, cluster_assign, resp, n_effective

# trace_dpgmm, model_dpgmm, clusters_dp, resp_dp, n_eff = bayesian_dp_gmm(
#     incidents, features, max_components=6
# )
# print(f"Effective clusters: {n_eff}")
```

---

## 10. Principal Component Analysis (PCA) — Deep Dive

> **Use for condensing many variables into a few components, like summarizing 20 customer metrics while keeping most of the variation.**

### Frequentist PCA Suite

#### 10.1 Comprehensive PCA with Interpretation
```python
def comprehensive_pca(data, features, n_components=None):
    """Full PCA with interpretation and validation."""
    
    X = data[features].dropna()
    # Log transform skewed
    for col in features:
        if stats.skew(X[col]) > 1:
            X[col] = np.log1p(X[col] - X[col].min() + 1)
    
    scaler = RobustScaler()
    X_scaled = scaler.fit_transform(X)
    
    # PCA
    if n_components is None:
        n_components = len(features)
    
    pca = PCA(n_components=n_components)
    X_pca = pca.fit_transform(X_scaled)
    
    # Variance explained
    var_exp = pca.explained_variance_ratio_
    cum_var = np.cumsum(var_exp)
    
    # Loadings
    loadings = pd.DataFrame(
        pca.components_.T * np.sqrt(pca.explained_variance_),
        columns=[f"PC{i+1}" for i in range(n_components)],
        index=features
    )
    
    # Component interpretation
    interpretations = {}
    for i in range(n_components):
        pc_loadings = loadings.iloc[:, i].abs().sort_values(ascending=False)
        top_features = pc_loadings.head(3).index.tolist()
        interpretations[f"PC{i+1}"] = {
            "variance": var_exp[i],
            "cum_variance": cum_var[i],
            "top_features": top_features,
            "loadings": loadings.iloc[:, i].to_dict()
        }
    
    # Quality of representation (cos2)
    cos2 = (pca.components_.T ** 2) * pca.explained_variance_
    cos2_df = pd.DataFrame(cos2, columns=[f"PC{i+1}" for i in range(n_components)], index=features)
    
    # Contributions
    contrib = (pca.components_.T ** 2) / pca.components_.T.sum(axis=0) ** 2 * 100
    contrib_df = pd.DataFrame(contrib, columns=[f"PC{i+1}" for i in range(n_components)], index=features)
    
    return {
        "pca": pca,
        "X_pca": X_pca,
        "var_exp": var_exp,
        "cum_var": cum_var,
        "loadings": loadings,
        "cos2": cos2_df,
        "contrib": contrib_df,
        "interpretations": interpretations,
        "scaler": scaler
    }

# Run PCA on time components
pca_results = comprehensive_pca(incidents, features)

print("PCA Variance Explained:")
for i, (v, c) in enumerate(zip(pca_results["var_exp"], pca_results["cum_var"])):
    print(f"  PC{i+1}: {v:.3f} ({v*100:.1f}%) - Cumulative: {c:.3f} ({c*100:.1f}%)")

print("\nComponent Interpretations:")
for pc, interp in pca_results["interpretations"].items():
    print(f"  {pc} ({interp['variance']*100:.1f}%): {interp['top_features']}")

# Scree plot
plt.figure(figsize=(10, 4))
plt.subplot(1, 2, 1)
plt.plot(range(1, len(pca_results["var_exp"])+1), pca_results["var_exp"], 'o-')
plt.xlabel("Component")
plt.ylabel("Variance Explained")
plt.title("Scree Plot")

plt.subplot(1, 2, 2)
plt.plot(range(1, len(pca_results["cum_var"])+1), pca_results["cum_var"], 'o-')
plt.axhline(0.8, color='r', linestyle='--', label='80%')
plt.axhline(0.9, color='g', linestyle='--', label='90%')
plt.xlabel("Component")
plt.ylabel("Cumulative Variance")
plt.title("Cumulative Variance")
plt.legend()
plt.tight_layout()
plt.show()

# Biplot
fig, ax = plt.subplots(figsize=(10, 8))
# Scores
for i in range(len(pca_results["X_pca"])):
    ax.scatter(pca_results["X_pca"][i, 0], pca_results["X_pca"][i, 1], 
               alpha=0.3, s=5, c=incidents.loc[incidents[features].notna().all(axis=1), "priority"].values, cmap='viridis')
# Loadings
for j, feat in enumerate(features):
    ax.arrow(0, 0, pca_results["loadings"].iloc[j, 0]*3, pca_results["loadings"].iloc[j, 1]*3, 
             head_width=0.1, head_length=0.1, fc='red', ec='red')
    ax.text(pca_results["loadings"].iloc[j, 0]*3.2, pca_results["loadings"].iloc[j, 1]*3.2, feat, 
            fontsize=9, color='red')
ax.axhline(0, color='gray', linestyle='--', alpha=0.5)
ax.axvline(0, color='gray', linestyle='--', alpha=0.5)
ax.set_xlabel(f"PC1 ({pca_results['var_exp'][0]*100:.1f}%)")
ax.set_ylabel(f"PC2 ({pca_results['var_exp'][1]*100:.1f}%)")
ax.set_title("PCA Biplot (Time Components)")
plt.tight_layout()
plt.show()
```

#### 10.2 PCA for Regression (PCR)
```python
def pcr_regression(data, features, target, n_components=None):
    """Principal Component Regression."""
    
    X = data[features].dropna()
    y = data.loc[X.index, target]
    
    # Log transform target if skewed
    if stats.skew(y) > 1:
        y = np.log1p(y)
    
    # Split
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale
    scaler = RobustScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # PCA on training
    pca = PCA(n_components=n_components or len(features))
    X_train_pca = pca.fit_transform(X_train_scaled)
    X_test_pca = pca.transform(X_test_scaled)
    
    # Regression on PCs
    from sklearn.linear_model import LinearRegression, RidgeCV
    
    results = {}
    for n_pc in range(1, len(features)+1):
        lr = LinearRegression()
        lr.fit(X_train_pca[:, :n_pc], y_train)
        y_pred = lr.predict(X_test_pca[:, :n_pc])
        
        mse = np.mean((y_test - y_pred)**2)
        r2 = 1 - mse / np.var(y_test)
        results[n_pc] = {"mse": mse, "r2": r2, "model": lr}
    
    # Best by R²
    best_n = max(results, key=lambda k: results[k]["r2"])
    
    # Ridge PCR
    ridge = RidgeCV(alphas=np.logspace(-3, 3, 20))
    ridge.fit(X_train_pca, y_train)
    y_pred_ridge = ridge.predict(X_test_pca)
    mse_ridge = np.mean((y_test - y_pred_ridge)**2)
    r2_ridge = 1 - mse_ridge / np.var(y_test)
    
    return {
        "pcr_results": results,
        "best_n_components": best_n,
        "ridge": {"model": ridge, "mse": mse_ridge, "r2": r2_ridge, "alpha": ridge.alpha_},
        "pca": pca,
        "scaler": scaler
    }

# PCR for total elapsed time
pcr_results = pcr_regression(incidents, features, "total_elapsed_seconds")
print("PCR Results:")
for n, r in pcr_results["pcr_results"].items():
    print(f"  {n} PCs: R²={r['r2']:.3f}, MSE={r['mse']:.1f}")
print(f"\nBest: {pcr_results['best_n_components']} components")
print(f"Ridge PCR: R²={pcr_results['ridge']['r2']:.3f}, alpha={pcr_results['ridge']['alpha']:.3f}")
```

#### 10.3 Sparse PCA for Interpretability
```python
def sparse_pca(data, features, n_components=3, alpha=1.0):
    """Sparse PCA for more interpretable components."""
    
    from sklearn.decomposition import SparsePCA
    
    X = data[features].dropna()
    for col in features:
        if stats.skew(X[col]) > 1:
            X[col] = np.log1p(X[col] - X[col].min() + 1)
    
    scaler = RobustScaler()
    X_scaled = scaler.fit_transform(X)
    
    spca = SparsePCA(n_components=n_components, alpha=alpha, random_state=42, max_iter=500)
    X_spca = spca.fit_transform(X_scaled)
    
    # Loadings
    loadings = pd.DataFrame(
        spca.components_.T,
        columns=[f"sPC{i+1}" for i in range(n_components)],
        index=features
    )
    
    print("Sparse PCA Loadings (near-zero = excluded):")
    print(loadings.round(3))
    
    # Non-zero loadings per component
    for i in range(n_components):
        non_zero = loadings.iloc[:, i][loadings.iloc[:, i].abs() > 0.01]
        print(f"\nsPC{i+1} non-zero loadings:")
        print(non_zero.sort_values(key=abs, ascending=False))
    
    return spca, loadings, X_spca

spca_model, spca_loadings, X_spca = sparse_pca(incidents, features, n_components=3, alpha=1.0)
```

### Bayesian PCA

#### 10.4 Probabilistic PCA (PPCA)
```python
def bayesian_pca(data, features, n_components=2):
    """
    Probabilistic PCA (Tipping & Bishop, 1999).
    Bayesian formulation with automatic relevance determination.
    """
    X = data[features].dropna()
    for col in features:
        if stats.skew(X[col]) > 1:
            X[col] = np.log1p(X[col] - X[col].min() + 1)
    
    scaler = RobustScaler()
    X_scaled = scaler.fit_transform(X)
    n_obs, n_vars = X_scaled.shape
    
    with pm.Model() as model:
        # Latent variables
        Z = pm.Normal("Z", mu=0, sigma=1, shape=(n_obs, n_components))
        
        # Weight matrix with ARD prior
        alpha = pm.Gamma("alpha", alpha=1, beta=1, shape=n_components)
        W = pm.Normal("W", mu=0, sigma=1/pm.math.sqrt(alpha), shape=(n_vars, n_components))
        
        # Noise variance
        psi = pm.HalfNormal("psi", sigma=1, shape=n_vars)
        
        # Reconstruction
        mu = pm.math.dot(Z, W.T)
        
        # Likelihood
        likelihood = pm.Normal("X", mu=mu, sigma=psi, observed=X_scaled)
        
        trace = pm.sample(2000, tune=1500, chains=4, target_accept=0.95, random_seed=42)
    
    # Relevance: alpha large → component irrelevant
    post_alpha = trace.posterior["alpha"].mean(dim=["chain", "draw"]).values
    relevance = 1 / post_alpha  # High relevance = low alpha
    
    print("Component Relevance (1/alpha):")
    for i, rel in enumerate(relevance):
        print(f"  PC{i+1}: {rel:.3f}")
    
    # Posterior loadings
    post_W = trace.posterior["W"].mean(dim=["chain", "draw"]).values
    loadings_df = pd.DataFrame(post_W, columns=[f"PC{i+1}" for i in range(n_components)], index=features)
    print("\nPosterior Loadings:")
    print(loadings_df.round(3))
    
    return trace, model, loadings_df, relevance

# trace_ppca, model_ppca, loadings_ppca, relevance = bayesian_pca(incidents, features, n_components=3)
```

---

## 11. Causal Inference — Deep Dive

> **Use for estimating the effect of a change, like how many additional orders a free shipping offer generated.**

### Frequentist Causal Inference Suite

#### 11.1 Difference-in-Differences (DiD)
```python
def did_analysis(data, treatment_col, time_col, outcome_col, group_col=None):
    """Difference-in-Differences with parallel trends check."""
    
    df = data.copy()
    df["post"] = (df[time_col] >= df[time_col].median()).astype(int)
    df["treated"] = df[treatment_col].astype(int)
    df["did"] = df["post"] * df["treated"]
    
    # Basic DiD
    import statsmodels.formula.api as smf
    
    formula = f"{outcome_col} ~ post + treated + did"
    if group_col:
        formula += f" + C({group_col})"
    
    model = smf.ols(formula, data=df).fit()
    
    # Parallel trends test (pre-period only)
    pre_data = df[df["post"] == 0]
    if len(pre_data) > 0:
        parallel_formula = f"{outcome_col} ~ treated * C({time_col})"
        if group_col:
            parallel_formula += f" + C({group_col})"
        parallel_test = smf.ols(parallel_formula, data=pre_data).fit()
        parallel_p = parallel_test.pvalues.filter(like="treated:").min() if any("treated:" in x for x in parallel_test.pvalues.index) else 1.0
    else:
        parallel_p = np.nan
    
    return {
        "model": model,
        "did_estimate": model.params.get("did", np.nan),
        "did_pvalue": model.pvalues.get("did", np.nan),
        "did_ci": model.conf_int().loc["did"] if "did" in model.conf_int().index else [np.nan, np.nan],
        "parallel_trends_p": parallel_p
    }

# Simulate: New dispatch protocol for LAW agency starting mid-week
incidents["week_day"] = incidents["call_start_time"].dt.dayofweek
incidents["post_protocol"] = (incidents["week_day"] >= 3).astype(int)  # Thu-Sun
incidents["treated_law"] = (incidents["agency"] == "LAW").astype(int)

did_result = did_analysis(
    incidents, "treated_law", "post_protocol", "log_queue", "priority"
)
print("DiD Results:")
for k, v in did_result.items():
    if k != "model":
        print(f"  {k}: {v}")
```

#### 11.2 Interrupted Time Series (ITS)
```python
def its_analysis(data, time_col, outcome_col, intervention_time, 
                 control_series=None):
    """Interrupted Time Series analysis."""
    
    df = data.copy()
    df = df.sort_values(time_col).reset_index(drop=True)
    df["time_idx"] = range(len(df))
    df["post"] = (df[time_col] >= intervention_time).astype(int)
    df["time_post"] = df["time_idx"] * df["post"]
    
    # Level + slope change model
    formula = f"{outcome_col} ~ time_idx + post + time_post"
    
    import statsmodels.formula.api as smf
    model = smf.ols(formula, data=df).fit()
    
    # If control series, do controlled ITS
    if control_series is not None:
        df_control = control_series.copy()
        df_control = df_control.sort_values(time_col).reset_index(drop=True)
        df_control["time_idx"] = range(len(df_control))
        df_control["post"] = (df_control[time_col] >= intervention_time).astype(int)
        df_control["time_post"] = df_control["time_idx"] * df_control["post"]
        
        # Combine
        df_all = pd.concat([df.assign(group="treatment"), 
                            df_control.assign(group="control")])
        df_all["treat_post"] = (df_all["group"] == "treatment") & (df_all["post"] == 1)
        
        formula_c = f"{outcome_col} ~ time_idx + post + time_post + C(group) + treat_post + time_post:C(group)"
        model_c = smf.ols(formula_c, data=df_all).fit()
        
        return {
            "model": model,
            "controlled_model": model_c,
            "level_change": model.params.get("post", np.nan),
            "slope_change": model.params.get("time_post", np.nan),
            "controlled_level": model_c.params.get("treat_post", np.nan) if "treat_post" in model_c.params else np.nan
        }
    
    return {
        "model": model,
        "level_change": model.params.get("post", np.nan),
        "slope_change": model.params.get("time_post", np.nan),
        "level_p": model.pvalues.get("post", np.nan),
        "slope_p": model.pvalues.get("time_post", np.nan)
    }

# Daily compliance ITS
daily_compliance = incidents.set_index("call_start_time").resample("D").agg(
    median_queue=("dispatch_queue_seconds", "median"),
    pct_queue_64=("dispatch_queue_seconds", lambda x: (x <= 64).mean()*100)
).reset_index()

# Simulate intervention at day 3
intervention_time = daily_compliance["call_start_time"].iloc[3]
its_result = its_analysis(daily_compliance, "call_start_time", "median_queue", intervention_time)
print("ITS Results:")
for k, v in its_result.items():
    if k != "model":
        print(f"  {k}: {v}")
```

#### 11.3 Propensity Score Matching (PSM)
```python
def propensity_score_matching(data, treatment_col, outcome_col, covariates, 
                              caliper=0.2, ratio=1):
    """Propensity score matching for causal effect estimation."""
    
    from sklearn.linear_model import LogisticRegression
    from sklearn.neighbors import NearestNeighbors
    
    df = data.dropna(subset=[treatment_col, outcome_col] + covariates).copy()
    
    # Propensity score model
    X = pd.get_dummies(df[covariates], drop_first=True)
    y = df[treatment_col]
    
    ps_model = LogisticRegression(random_state=42, max_iter=1000)
    ps_model.fit(X, y)
    df["propensity"] = ps_model.predict_proba(X)[:, 1]
    
    # Matching
    treated = df[df[treatment_col] == 1]
    control = df[df[treatment_col] == 0]
    
    nn = NearestNeighbors(n_neighbors=ratio, metric="euclidean")
    nn.fit(control[["propensity"]].values)
    
    distances, indices = nn.kneighbors(treated[["propensity"]].values)
    
    # Apply caliper
    matched_treated = []
    matched_control = []
    
    for i, (dist, idx) in enumerate(zip(distances, indices)):
        if dist[0] <= caliper * treated["propensity"].std():
            matched_treated.append(treated.iloc[i])
            matched_control.append(control.iloc[idx[0]])
    
    matched_treated = pd.DataFrame(matched_treated)
    matched_control = pd.DataFrame(matched_control)
    
    # Balance check
    balance = {}
    for cov in covariates:
        if cov in matched_treated.columns:
            std_diff = (matched_treated[cov].mean() - matched_control[cov].mean()) / \
                       np.sqrt((matched_treated[cov].var() + matched_control[cov].var()) / 2)
            balance[cov] = std_diff
    
    # ATT estimation
    att = matched_treated[outcome_col].mean() - matched_control[outcome_col].mean()
    
    # Bootstrap CI
    boot_atts = []
    for _ in range(1000):
        bt = matched_treated.sample(len(matched_treated), replace=True)
        bc = matched_control.sample(len(matched_control), replace=True)
        boot_atts.append(bt[outcome_col].mean() - bc[outcome_col].mean())
    
    ci = np.percentile(boot_atts, [2.5, 97.5])
    
    return {
        "matched_treated": matched_treated,
        "matched_control": matched_control,
        "balance": balance,
        "att": att,
        "att_ci": ci,
        "n_matched": len(matched_treated),
        "propensity_model": ps_model
    }

# Example: Effect of Priority 1 vs 2 on dispatch queue
# Treatment: Priority 1 (highest)
# Covariates: agency, problem_nature, hour, shift, dow
priority_data = incidents[incidents["priority"].isin([1, 2])].copy()
priority_data["treatment"] = (priority_data["priority"] == 1).astype(int)

covariates = ["agency", "problem_nature", "hour", "shift_label", "dow"]
covariates = [c for c in covariates if c in priority_data.columns]

psm_result = propensity_score_matching(
    priority_data, "treatment", "dispatch_queue_seconds", covariates
)

print(f"PSM ATT: {psm_result['att']:.1f}s (95% CI: {psm_result['att_ci'][0]:.1f}, {psm_result['att_ci'][1]:.1f})")
print(f"Matched pairs: {psm_result['n_matched']}")
print("Balance (std diff < 0.1 is good):")
for cov, diff in psm_result["balance"].items():
    print(f"  {cov}: {diff:.3f}")
```

#### 11.4 Regression Discontinuity Design (RDD)
```python
def rdd_analysis(data, running_var, outcome_col, cutoff, bandwidth=None):
    """Sharp Regression Discontinuity Design."""
    
    df = data.dropna(subset=[running_var, outcome_col]).copy()
    df["above"] = (df[running_var] >= cutoff).astype(int)
    df["distance"] = df[running_var] - cutoff
    
    # Bandwidth selection (Imbens-Kalyanaraman optimal)
    if bandwidth is None:
        # Simple rule of thumb
        bandwidth = 1.5 * df[running_var].std()
    
    # Local linear regression
    local = df[np.abs(df["distance"]) <= bandwidth].copy()
    local["above_dist"] = local["above"] * local["distance"]
    
    import statsmodels.formula.api as smf
    model = smf.ols(f"{outcome_col} ~ above + distance + above_dist", data=local).fit()
    
    # Robustness: different bandwidths
    bandwidths = [bandwidth * 0.5, bandwidth, bandwidth * 1.5, bandwidth * 2]
    robustness = {}
    for bw in bandwidths:
        local_bw = df[np.abs(df["distance"]) <= bw]
        if len(local_bw) > 20:
            m = smf.ols(f"{outcome_col} ~ above + distance + above_dist", data=local_bw).fit()
            robustness[bw] = {"estimate": m.params.get("above", np.nan), 
                              "p": m.pvalues.get("above", np.nan),
                              "n": len(local_bw)}
    
    # Placebo test: fake cutoff
    fake_cutoff = cutoff + bandwidth
    df["fake_above"] = (df[running_var] >= fake_cutoff).astype(int)
    df["fake_distance"] = df[running_var] - fake_cutoff
    fake_local = df[np.abs(df["fake_distance"]) <= bandwidth]
    if len(fake_local) > 20:
        fake_model = smf.ols(f"{outcome_col} ~ fake_above + fake_distance + fake_above:fake_distance", 
                             data=fake_local).fit()
        placebo = fake_model.params.get("fake_above", np.nan)
    else:
        placebo = np.nan
    
    return {
        "model": model,
        "estimate": model.params.get("above", np.nan),
        "p_value": model.pvalues.get("above", np.nan),
        "ci": model.conf_int().loc["above"] if "above" in model.conf_int().index else [np.nan, np.nan],
        "bandwidth": bandwidth,
        "n_local": len(local),
        "robustness": robustness,
        "placebo": placebo
    }

# Example: Does queue time jump when hourly 911 calls exceed 5?
calls_rdd = calls.copy()
calls_rdd["queue_proxy"] = calls_rdd["nine_one_one_calls_received"]  # Proxy for queue
calls_rdd["outcome"] = calls_rdd["nine_one_one_answered_20s_pct"]  # Compliance

rdd_result = rdd_analysis(calls_rdd, "queue_proxy", "outcome", cutoff=5)
print("RDD Results (Compliance at queue=5):")
for k, v in rdd_result.items():
    if k not in ["model", "robustness"]:
        print(f"  {k}: {v}")
print("\nRobustness across bandwidths:")
for bw, res in rdd_result["robustness"].items():
    print(f"  BW={bw:.1f}: est={res['estimate']:.2f}, p={res['p']:.4f}, n={res['n']}")
```

### Bayesian Causal Inference

#### 11.5 Bayesian DiD
```python
def bayesian_did(data, treatment_col, time_col, outcome_col, group_col=None):
    """Bayesian Difference-in-Differences."""
    
    df = data.copy()
    df["post"] = (df[time_col] >= df[time_col].median()).astype(int)
    df["treated"] = df[treatment_col].astype(int)
    df["did"] = df["post"] * df["treated"]
    
    # Log transform if skewed
    y = df[outcome_col].values
    if stats.skew(y) > 1:
        y = np.log1p(y)
    
    with pm.Model() as model:
        # Priors
        intercept = pm.Normal("intercept", mu=y.mean(), sigma=y.std()*2)
        beta_post = pm.Normal("beta_post", mu=0, sigma=1)
        beta_treated = pm.Normal("beta_treated", mu=0, sigma=1)
        beta_did = pm.Normal("beta_did", mu=0, sigma=1)  # Main effect of interest
        
        # Group controls
        if group_col:
            groups = df[group_col].unique()
            n_groups = len(groups)
            group_idx = pd.Categorical(df[group_col]).codes
            beta_group = pm.Normal("beta_group", mu=0, sigma=1, shape=n_groups)
            group_effect = beta_group[group_idx]
        else:
            group_effect = 0
        
        # Expected value
        mu = (intercept + 
              beta_post * df["post"] + 
              beta_treated * df["treated"] + 
              beta_did * df["did"] + 
              group_effect)
        
        # Likelihood
        sigma = pm.HalfNormal("sigma", sigma=y.std())
        likelihood = pm.Normal("y", mu=mu, sigma=sigma, observed=y)
        
        trace = pm.sample(2000, tune=1500, chains=4, target_accept=0.95, random_seed=42)
    
    # Posterior for DiD
    post_did = trace.posterior["beta_did"].values.flatten()
    
    return {
        "trace": trace,
        "did_mean": post_did.mean(),
        "did_hdi": az.hdi(post_did, hdi_prob=0.95),
        "prob_positive": (post_did > 0).mean(),
        "prob_neg": (post_did < 0).mean()
    }

# bayes_did = bayesian_did(incidents, "treated_law", "post_protocol", "dispatch_queue_seconds", "priority")
# print(f"Bayesian DiD: {bayes_did['did_mean']:.3f} (95% HDI: {bayes_did['did_hdi']})")
# print(f"P(DiD > 0): {bayes_did['prob_positive']:.3f}")
```

#### 11.6 Bayesian Structural Causal Model (SCM)
```python
def bayesian_scm(data, dag_edges, outcome_col):
    """
    Bayesian Structural Causal Model based on DAG.
    dag_edges: list of (cause, effect) tuples
    """
    # This is a simplified version - full SCM requires causal discovery
    # Here we specify a known causal structure
    
    # Example DAG for 911:
    # priority → dispatch_queue → total_elapsed
    # agency → dispatch_queue
    # shift → dispatch_queue
    # hour → call_volume → dispatch_queue
    
    # We'll implement a specific model for our use case
    pass
```

---

## 12. Text Analysis — Deep Dive

> **Use for pulling themes from written feedback, like finding the most common complaints in customer reviews.**

### Frequentist Text Analysis

#### 12.1 Problem Nature Text Mining
```python
def problem_nature_text_analysis(data, text_col="problem_nature"):
    """Comprehensive text analysis of problem nature codes."""
    
    from collections import Counter
    import re
    
    texts = data[text_col].dropna().astype(str)
    
    # 1. Frequency
    freq = texts.value_counts()
    print(f"Unique problem natures: {len(freq)}")
    print(f"Top 20:\n{freq.head(20)}")
    
    # 2. N-grams
    def get_ngrams(texts, n=2):
        all_ngrams = []
        for text in texts:
            words = text.lower().split()
            for i in range(len(words) - n + 1):
                all_ngrams.append(" ".join(words[i:i+n]))
        return Counter(all_ngrams)
    
    for n in [2, 3]:
        ngrams = get_ngrams(texts, n)
        print(f"\nTop 20 {n}-grams:")
        for ng, count in ngrams.most_common(20):
            print(f"  {ng}: {count}")
    
    # 3. Semantic categorization
    def categorize_problem(text):
        text = text.lower()
        medical_kw = ["breathing", "cardiac", "chest", "pain", "fall", "injury", "sick", 
                      "allergic", "seizure", "unconscious", "overdose", "pregnancy", 
                      "childbirth", "mental", "heat", "cold", "exposure", "abdominal", 
                      "traumatic", "assist fire", "medical", "emergency"]
        fire_kw = ["fire", "gas", "odor", "smoke", "brush", "grass", "vehicle fire",
                   "structure", "elevator", "co", "overheat", "water", "rescue",
                   "medical assist", "alarm", "investigation", "hazmat"]
        law_kw = ["traffic", "stop", "reckless", "dui", "impaired", "collision",
                  "theft", "vehicle", "burglary", "robbery", "assault", "harassment",
                  "trespass", "vandalism", "noise", "animal", "welfare", "suspicious",
                  "shots", "drug", "narcotic", "weapon", "missing", "disorderly",
                  "public assist", "civil", "domestic", "disturbance"]
        
        if any(kw in text for kw in medical_kw):
            return "Medical"
        elif any(kw in text for kw in fire_kw):
            return "Fire"
        elif any(kw in text for kw in law_kw):
            return "Law Enforcement"
        else:
            return "Other"
    
    data["problem_category"] = data[text_col].apply(categorize_problem)
    cat_dist = data["problem_category"].value_counts(normalize=True) * 100
    print(f"\nProblem Categories:\n{cat_dist.round(1)}")
    
    # Response times by category
    cat_metrics = data.groupby("problem_category").agg(
        count=("id_number", "count"),
        median_queue=("dispatch_queue_seconds", "median"),
        median_total=("total_elapsed_seconds", "median"),
        pct_priority12=("priority", lambda x: x.isin([1,2]).mean()*100)
    ).round(1)
    print(f"\nMetrics by Category:\n{cat_metrics}")
    
    return freq, ngrams, cat_dist, cat_metrics

freq, ngrams, cat_dist, cat_metrics = problem_nature_text_analysis(incidents)
```

#### 12.2 Call Disposition Quality Analysis
```python
def disposition_quality_analysis(data):
    """Analyze call disposition data quality."""
    
    # Overall distribution
    disp_freq = data["call_disposition"].value_counts()
    print("Call Disposition Distribution:")
    print(disp_freq)
    
    # UNDEFINED analysis
    undefined = data[data["call_disposition"] == "UNDEFINED"]
    print(f"\nUNDEFINED: {len(undefined)} ({len(undefined)/len(data)*100:.1f}%)")
    
    # By shift
    undef_by_shift = undefined.groupby("shift_label").size()
    total_by_shift = data.groupby("shift_label").size()
    undef_pct = (undef_by_shift / total_by_shift * 100).round(1)
    print(f"\nUNDEFINED % by Shift:\n{undef_pct}")
    
    # By calltaker
    undef_by_ct = undefined.groupby("calltaker").size()
    total_by_ct = data.groupby("calltaker").size()
    undef_ct_pct = (undef_by_ct / total_by_ct * 100).round(1)
    print(f"\nTop 10 Calltakers by UNDEFINED %:")
    print(undef_ct_pct.sort_values(ascending=False).head(10))
    
    # By agency
    undef_by_agency = undefined.groupby("agency").size()
    total_by_agency = data.groupby("agency").size()
    undef_agency_pct = (undef_by_agency / total_by_agency * 100).round(1)
    print(f"\nUNDEFINED % by Agency:\n{undef_agency_pct}")
    
    # NOT CAPTURED method
    not_captured = data[data["method_of_call_reception"] == "NOT CAPTURED"]
    print(f"\nNOT CAPTURED method: {len(not_captured)} ({len(not_captured)/len(data)*100:.1f}%)")
    print(f"Agencies: {not_captured['agency'].value_counts().to_dict()}")
    
    return {
        "overall": disp_freq,
        "undefined": undefined,
        "by_shift": undef_pct,
        "by_calltaker": undef_ct_pct,
        "by_agency": undef_agency_pct,
        "not_captured": not_captured
    }

disp_quality = disposition_quality_analysis(incidents)
```

#### 12.3 Location/Address Text Analysis
```python
def location_text_analysis(data):
    """Extract insights from address/location text."""
    
    # Street name extraction
    def extract_street(address):
        if pd.isna(address):
            return None
        # Pattern: number + street name + type
        match = re.search(r'\d+\s+(.+?)\s+(?:Avenue|Street|Drive|Road|Boulevard|Lane|Court|Circle)', str(address), re.IGNORECASE)
        if match:
            return match.group(1).strip()
        return None
    
    data["street_name"] = data["street_address"].apply(extract_street)
    street_freq = data["street_name"].value_counts()
    print(f"Extracted street names: {street_freq.notna().sum()}")
    print(f"Top 20 streets:\n{street_freq.head(20)}")
    
    # Incident density by street
    street_metrics = data.groupby("street_name").agg(
        count=("id_number", "count"),
        median_queue=("dispatch_queue_seconds", "median"),
        median_total=("total_elapsed_seconds", "median"),
        agencies=("agency", lambda x: x.unique().tolist())
    ).reset_index()
    street_metrics = street_metrics[street_metrics["count"] >= 5].sort_values("count", ascending=False)
    print(f"\nStreets with 5+ incidents:\n{street_metrics.head(15).to_string(index=False)}")
    
    # City analysis
    city_freq = data["city"].value_counts()
    print(f"\nCities:\n{city_freq}")
    
    return street_freq, street_metrics

street_freq, street_metrics = location_text_analysis(incidents)
```

### Bayesian Text Analysis

#### 12.4 Bayesian Topic Model (if narratives available)
```python
def bayesian_lda(texts, n_topics=5, n_words=10):
    """
    Latent Dirichlet Allocation for topic modeling.
    Requires free-text narratives (not just codes).
    """
    # This is a template for when narrative text is available
    # For coded problem_nature, use categorical analysis above
    
    from sklearn.feature_extraction.text import CountVectorizer
    import numpy as np
    
    # Vectorize
    vectorizer = CountVectorizer(max_df=0.95, min_df=2, stop_words='english')
    X = vectorizer.fit_transform(texts)
    vocab = vectorizer.get_feature_names_out()
    n_docs, n_vocab = X.shape
    
    with pm.Model() as model:
        # Topic-word distributions (Dirichlet)
        beta = pm.Dirichlet("beta", a=np.ones(n_vocab), shape=(n_topics, n_vocab))
        
        # Document-topic distributions (Dirichlet)
        alpha = pm.Gamma("alpha", alpha=1, beta=1)
        theta = pm.Dirichlet("theta", a=alpha * np.ones(n_topics), shape=(n_docs, n_topics))
        
        # Likelihood (multinomial)
        # This is computationally intensive for large corpora
        # Use collapsed Gibbs or variational inference in practice
        
        # Simplified: use pyLDAvis or gensim for production
        pass
    
    # For production, use gensim:
    """
    import gensim
    import gensim.corpora as corpora
    
    # Prepare corpus
    texts_processed = [text.split() for text in texts]
    dictionary = corpora.Dictionary(texts_processed)
    corpus = [dictionary.doc2bow(text) for text in texts_processed]
    
    # Train LDA
    lda = gensim.models.LdaModel(corpus, num_topics=n_topics, id2word=dictionary, passes=10)
    
    # Print topics
    for idx, topic in lda.print_topics(-1):
        print(f"Topic {idx}: {topic}")
    """
    
    return None
```

---

## Summary: Deep Dive Integration

### Analysis Type → 9-1-1 Specific Methods Mapping

| Analysis Type | 9-1-1 Specific Methods | Key Standards | Bayesian Added Value |
|---------------|------------------------|---------------|---------------------|
| **Descriptive** | KPI scorecards, Cp/Cpk, percentile compliance | NENA/NFPA/APCO | Full posterior distributions for compliance rates |
| **EDA** | Multi-method outliers, temporal patterns, shift handoffs | Data quality KPIs | Probabilistic PCA, Bayesian mixture models |
| **Correlation** | Time component correlations, partial correlations | Process coupling | Correlation matrix posteriors, HDIs |
| **Regression** | Gamma GLM, quantile regression, mixed effects | Response time prediction | Bayesian GLM, credible intervals, posterior predictive |
| **Hypothesis** | Standards compliance (binomial), group comparisons, trends | NENA 90/95%, NFPA 90% | ROPE, Bayes factors, posterior probabilities |
| **Time Series** | STL, SARIMA, change points, forecasting | Staffing planning | BSTS, structural models, uncertainty quantification |
| **Cohort** | Calltaker learning curves, agency retention, shift cohorts | Personnel eval | Hierarchical partial pooling |
| **Funnel** | Dispatch funnel, time funnel, compliance funnel | Stage standards | Bayesian conversion rates, stage uncertainty |
| **Cluster** | Incident archetypes, hour templates, calltaker profiles | Resource allocation | DP-GMM, infinite mixtures |
| **PCA** | Response Time Index, compliance PC, volume PCs | Dashboard KPIs | Probabilistic PCA, ARD for relevance |
| **Causal** | DiD (protocol), ITS (policy), PSM (priority), RDD (staffing) | Policy evaluation | Full posterior for causal effects |
| **Text** | Problem categorization, disposition quality, street analysis | Data quality | Topic models (if narratives) |

### Recommended Implementation Order

1. **Week 1-2**: Descriptive + EDA + Funnel (baseline reports)
2. **Week 3-4**: Correlation + Hypothesis Testing (compliance validation)
3. **Month 2**: Time Series + Regression (forecasting + prediction)
4. **Month 3**: Cohort + Cluster + PCA (deep insights)
5. **Month 4**: Causal Inference + Text Analysis (policy + quality)
6. **Ongoing**: Bayesian versions for all (uncertainty quantification)

### Unified Bayesian Workflow for All Analyses

```python
def unified_bayesian_workflow(model_func, data, *args, **kwargs):
    """
    Standardized Bayesian workflow for any analysis.
    """
    # 1. Prior predictive checks
    # 2. Fit model
    # 3. Convergence diagnostics (R-hat < 1.01, ESS > 400)
    # 4. Posterior predictive checks
    # 5. Model comparison (LOO/WAIC)
    # 6. Sensitivity analysis (prior robustness)
    # 7. Reporting: posterior summaries, HDIs, probabilities
    
    trace, model = model_func(data, *args, **kwargs)
    
    # Diagnostics
    summary = az.summary(trace, hdi_prob=0.95)
    rhat_max = summary["r_hat"].max()
    ess_min = summary["ess_bulk"].min()
    
    print(f"Convergence: R-hat max = {rhat_max:.3f}, ESS min = {ess_min:.0f}")
    
    if rhat_max > 1.01:
        print("⚠️  CONVERGENCE WARNING: R-hat > 1.01")
    if ess_min < 400:
        print("⚠️  ESS WARNING: ESS < 400")
    
    # PPC
    with model:
        ppc = pm.sample_posterior_predictive(trace, extend_inferencedata=True)
    
    return {
        "trace": trace,
        "model": model,
        "summary": summary,
        "ppc": ppc,
        "converged": rhat_max <= 1.01 and ess_min >= 400
    }
```

---

*This deep dive document provides comprehensive frequentist and Bayesian methods for all 12 analysis types, specifically tailored to 9-1-1 dispatch data with NENA/NFPA/APCO standards integration.*