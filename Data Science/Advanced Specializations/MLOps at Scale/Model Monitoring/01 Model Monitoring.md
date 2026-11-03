# Model Monitoring

Comprehensive monitoring for production ML systems covering data drift, concept drift, performance degradation, and automated alerting.

## 1. Monitoring Taxonomy

```
Model Monitoring
├── Data Drift (Input Distribution Shift)
│   ├── Feature Drift (Univariate)
│   │   ├── Numerical: PSI, KS, Wasserstein, KL
│   │   ├── Categorical: Chi-square, Jensen-Shannon, TV
│   │   └── High-dim: PCA reconstruction, MMD
│   ├── Covariate Shift (Multivariate)
│   │   ├── Classifier-based (Domain Classifier)
│   │   ├── Density Ratio Estimation
│   │   └── MMD / Energy Distance
│   └── Label Drift (Prior Probability Shift)
├── Concept Drift (P(Y|X) Change)
│   ├── Sudden (Abrupt)
│   ├── Gradual (Incremental)
│   ├── Recurring (Seasonal)
│   └── Detection: ADWIN, DDM, EDDM, HDDM, Page-Hinkley
├── Prediction Drift (Output Distribution Shift)
│   ├── Score Distribution Shift
│   ├── Calibration Drift (Reliability Diagrams)
│   └── Prediction Interval Coverage
├── Performance Degradation
│   ├── Metric Decay (Accuracy, AUC, F1, RMSE)
│   ├── Business Metric Impact (Revenue, Conversion)
│   ├── Slice-level Performance (Segments)
│   └── Prediction Latency / Throughput
└── Infrastructure Health
    ├── Latency (p50, p95, p99)
    ├── Error Rates (5xx, timeouts)
    ├── GPU/CPU Utilization
    └── Queue Depth / Throughput
```

---

## 2. Data Drift Detection

### 2.1 Univariate Drift Metrics

#### Population Stability Index (PSI)
```python
def psi(expected: np.ndarray, actual: np.ndarray, bins=10, 
        quantile_bins=True) -> float:
    """
    Population Stability Index
    PSI = Σ (actual_i - expected_i) * log(actual_i / expected_i)
    
    Interpretation:
    - PSI < 0.1: No significant drift
    - 0.1 ≤ PSI < 0.2: Moderate drift
    - PSI ≥ 0.2: Significant drift
    """
    if quantile_bins:
        # Use quantile bins from expected distribution
        breakpoints = np.percentile(expected, np.linspace(0, 100, bins + 1))
        breakpoints = np.unique(breakpoints)
    else:
        breakpoints = np.linspace(expected.min(), expected.max(), bins + 1)
    
    expected_hist, _ = np.histogram(expected, bins=breakpoints)
    actual_hist, _ = np.histogram(actual, bins=breakpoints)
    
    # Avoid division by zero
    expected_pct = expected_hist / len(expected)
    actual_pct = actual_hist / len(actual)
    
    # Add small epsilon
    eps = 1e-10
    expected_pct = np.maximum(expected_pct, eps)
    actual_pct = np.maximum(actual_pct, eps)
    
    psi_val = np.sum((actual_pct - expected_pct) * 
                     np.log(actual_pct / expected_pct))
    return psi_val
```

#### Kolmogorov-Smirnov (KS) Test
```python
from scipy.stats import ks_2samp

def ks_drift(reference: np.ndarray, current: np.ndarray) -> dict:
    """Two-sample KS test for distribution shift"""
    stat, p_value = ks_2samp(reference, current)
    return {
        'ks_statistic': stat,
        'p_value': p_value,
        'drift_detected': p_value < 0.05
    }
```

#### Jensen-Shannon Divergence (Categorical)
```python
def js_divergence(p: np.ndarray, q: np.ndarray) -> float:
    """Jensen-Shannon Divergence for categorical distributions"""
    p = np.asarray(p, dtype=float)
    q = np.asarray(q, dtype=float)
    
    # Normalize
    p = p / p.sum()
    q = q / q.sum()
    
    m = 0.5 * (p + q)
    kl_pm = np.sum(p * np.log(p / m + 1e-10))
    kl_qm = np.sum(q * np.log(q / m + 1e-10))
    
    return 0.5 * (kl_pm + kl_qm)

def categorical_drift(reference_counts: dict, current_counts: dict) -> dict:
    """Chi-square + JS divergence for categorical features"""
    all_categories = set(reference_counts.keys()) | set(current_counts.keys())
    
    ref_vec = np.array([reference_counts.get(c, 0) for c in all_categories])
    cur_vec = np.array([current_counts.get(c, 0) for c in all_categories])
    
    # Chi-square
    from scipy.stats import chisquare
    chi2, p_chi = chisquare(cur_vec, ref_vec)
    
    # JS divergence
    jsd = js_divergence(ref_vec, cur_vec)
    
    return {
        'chi2_stat': chi2,
        'chi2_p': p_chi,
        'js_divergence': jsd,
        'new_categories': list(set(current_counts.keys()) - set(reference_counts.keys())),
        'missing_categories': list(set(reference_counts.keys()) - set(current_counts.keys()))
    }
```

### 2.2 Multivariate Drift Detection

#### Domain Classifier Approach
```python
class DomainClassifierDrift:
    """Train classifier to distinguish reference vs current data"""
    
    def __init__(self, model=None, test_size=0.3):
        self.model = model or RandomForestClassifier(
            n_estimators=100, max_depth=5, random_state=42
        )
        self.test_size = test_size
        self.baseline_auc = 0.5
    
    def fit_reference(self, X_ref: np.ndarray):
        """Store reference distribution"""
        self.X_ref = X_ref
    
    def detect_drift(self, X_cur: np.ndarray) -> dict:
        # Create domain labels
        X = np.vstack([self.X_ref, X_cur])
        y = np.hstack([np.zeros(len(self.X_ref)), np.ones(len(X_cur))])
        
        # Train/test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=self.test_size, stratify=y, random_state=42
        )
        
        self.model.fit(X_train, y_train)
        
        # AUC-ROC
        y_pred_proba = self.model.predict_proba(X_test)[:, 1]
        auc = roc_auc_score(y_test, y_pred_proba)
        
        # Feature importance (which features drift most)
        importances = pd.Series(
            self.model.feature_importances_,
            index=self.feature_names if hasattr(self, 'feature_names') else range(X.shape[1])
        ).sort_values(ascending=False)
        
        return {
            'auc': auc,
            'drift_detected': auc > 0.55,  # Threshold
            'feature_importance': importances.head(10).to_dict(),
            'baseline_auc': 0.5
        }
```

#### Maximum Mean Discrepancy (MMD)
```python
def mmd_rbf(X: np.ndarray, Y: np.ndarray, sigma=None) -> float:
    """Maximum Mean Discrepancy with RBF kernel"""
    from scipy.spatial.distance import cdist
    
    if sigma is None:
        # Median heuristic
        distances = cdist(X, Y, 'sqeuclidean')
        sigma = np.median(distances)
    
    gamma = 1.0 / (2 * sigma**2)
    
    XX = np.exp(-gamma * cdist(X, X, 'sqeuclidean'))
    YY = np.exp(-gamma * cdist(Y, Y, 'sqeuclidean'))
    XY = np.exp(-gamma * cdist(X, Y, 'sqeuclidean'))
    
    mmd2 = XX.mean() + YY.mean() - 2 * XY.mean()
    return np.sqrt(max(mmd2, 0))

def mmd_drift(reference: np.ndarray, current: np.ndarray, 
              n_permutations=100) -> dict:
    """MMD with permutation test for p-value"""
    mmd_stat = mmd_rbf(reference, current)
    
    # Permutation test
    combined = np.vstack([reference, current])
    n_ref = len(reference)
    
    perm_stats = []
    for _ in range(n_permutations):
        np.random.shuffle(combined)
        perm_ref = combined[:n_ref]
        perm_cur = combined[n_ref:]
        perm_stats.append(mmd_rbf(perm_ref, perm_cur))
    
    p_value = np.mean(np.array(perm_stats) >= mmd_stat)
    
    return {
        'mmd': mmd_stat,
        'p_value': p_value,
        'drift_detected': p_value < 0.05
    }
```

### 2.2 High-Dimensional Drift (Embeddings)
```python
def embedding_drift_detection(ref_embeddings: np.ndarray, 
                               cur_embeddings: np.ndarray,
                               n_components=50) -> dict:
    """
    Drift detection for high-dimensional embeddings
    using PCA reconstruction error
    """
    # Fit PCA on reference
    pca = PCA(n_components=n_components)
    pca.fit(ref_embeddings)
    
    # Reconstruction error
    ref_recon = pca.inverse_transform(pca.transform(ref_embeddings))
    cur_recon = pca.inverse_transform(pca.transform(cur_embeddings))
    
    ref_error = np.mean((ref_embeddings - ref_recon) ** 2, axis=1)
    cur_error = np.mean((cur_embeddings - cur_recon) ** 2, axis=1)
    
    # KS test on reconstruction errors
    ks_stat, p_val = ks_2samp(ref_error, cur_error)
    
    # Also check embedding shift (mean cosine similarity)
    ref_mean = ref_embeddings.mean(axis=0)
    cur_mean = cur_embeddings.mean(axis=0)
    cos_sim = np.dot(ref_mean, cur_mean) / (
        np.linalg.norm(ref_mean) * np.linalg.norm(cur_mean)
    )
    
    return {
        'reconstruction_error_ks': ks_stat,
        'reconstruction_error_p': p_val,
        'mean_cosine_similarity': cos_sim,
        'drift_detected': p_val < 0.05 or cos_sim < 0.95
    }
```

---

## 3. Concept Drift Detection

### 3.1 Streaming Drift Detectors

#### ADWIN (Adaptive Windowing)
```python
class ADWIN:
    """Adaptive Windowing for concept drift detection"""
    
    def __init__(self, delta=0.002, max_buckets=5, min_window=10):
        self.delta = delta
        self.max_buckets = max_buckets
        self.min_window = min_window
        self.buckets = []  # List of (sum, count, variance)
        self.total_sum = 0
        self.total_count = 0
        self.total_variance = 0
    
    def add(self, value: float) -> bool:
        """Add new observation, return True if drift detected"""
        # Add new bucket
        self.buckets.append([value, 1, 0.0])
        self.total_sum += value
        self.total_count += 1
        
        # Merge buckets if needed
        self._compress_buckets()
        
        # Check for drift
        return self._detect_drift()
    
    def _compress_buckets(self):
        """Merge buckets using geometric progression"""
        while len(self.buckets) > self.max_buckets:
            # Merge two oldest buckets
            b1 = self.buckets.pop(0)
            b2 = self.buckets.pop(0)
            merged = [
                b1[0] + b2[0],  # sum
                b1[1] + b2[1],  # count
                b1[2] + b2[2] + b1[1]*b2[1]*(b1[0]/b1[1] - b2[0]/b2[1])**2 / (b1[1]+b2[1])
            ]
            self.buckets.insert(0, merged)
    
    def _detect_drift(self) -> bool:
        """Check if any split point shows significant difference"""
        if self.total_count < 2 * self.min_window:
            return False
        
        # Check all possible splits
        for i in range(1, len(self.buckets)):
            w0 = sum(b[1] for b in self.buckets[:i])
            w1 = sum(b[1] for b in self.buckets[i:])
            
            if w0 < self.min_window or w1 < self.min_window:
                continue
            
            mean0 = sum(b[0] for b in self.buckets[:i]) / w0
            mean1 = sum(b[0] for b in self.buckets[i:]) / w1
            
            # Hoeffding bound
            eps = np.sqrt(np.log(2/self.delta) / (2 * min(w0, w1)))
            
            if abs(mean0 - mean1) > eps:
                # Drift detected - drop old buckets
                self.buckets = self.buckets[i:]
                return True
        
        return False
```

#### DDM (Drift Detection Method)
```python
class DDM:
    """Drift Detection Method (Gama et al., 2004)"""
    
    def __init__(self, warning_level=2.0, drift_level=3.0, min_instances=30):
        self.warning_level = warning_level
        self.drift_level = drift_level
        self.min_instances = min_instances
        
        self.n = 0
        self.errors = 0
        self.error_rate = 0.0
        self.std_dev = 0.0
        self.min_error_rate = float('inf')
        self.min_std_dev = 0.0
        
        self.in_warning = False
        self.in_drift = False
    
    def add(self, prediction_correct: bool) -> dict:
        """Add prediction result (True=correct, False=error)"""
        self.n += 1
        
        if not prediction_correct:
            self.errors += 1
        
        # Update statistics
        old_error_rate = self.error_rate
        self.error_rate = self.errors / self.n
        self.std_dev = np.sqrt(
            self.error_rate * (1 - self.error_rate) / self.n
        )
        
        # Update minimums
        if self.error_rate + self.std_dev < self.min_error_rate + self.min_std_dev:
            self.min_error_rate = self.error_rate
            self.min_std_dev = self.std_dev
            self.in_warning = False
            self.in_drift = False
        
        # Check warning/drift levels
        if self.n >= self.min_instances:
            level = (self.error_rate - self.min_error_rate) / self.min_std_dev
            
            if level > self.drift_level:
                self.in_drift = True
                return {'drift': True, 'warning': False}
            elif level > self.warning_level:
                self.in_warning = True
                return {'drift': False, 'warning': True}
        
        return {'drift': False, 'warning': False}
```

#### EDDM (Early Drift Detection Method)
```python
class EDDM:
    """Early Drift Detection Method - better for gradual drift"""
    
    def __init__(self, warning_level=0.9, drift_level=0.95, min_instances=30):
        self.warning_level = warning_level
        self.drift_level = drift_level
        self.min_instances = min_instances
        
        self.n = 0
        self.errors = 0
        self.last_error_pos = 0
        self.mean_distance = 0.0
        self.std_distance = 0.0
        self.max_mean_distance = 0.0
        
        self.in_warning = False
        self.in_drift = False
    
    def add(self, prediction_correct: bool) -> dict:
        self.n += 1
        
        if not prediction_correct:
            distance = self.n - self.last_error_pos - 1
            self.last_error_pos = self.n - 1
            self.errors += 1
            
            # Update mean/std of distances
            old_mean = self.mean_distance
            self.mean_distance = old_mean + (distance - old_mean) / self.errors
            self.std_distance = np.sqrt(
                (self.errors - 1) / self.errors * self.std_distance**2 + 
                (distance - old_mean)**2 / self.errors
            )
            
            # Update max
            if self.mean_distance + 2 * self.std_distance > self.max_mean_distance:
                self.max_mean_distance = self.mean_distance + 2 * self.std_distance
                self.in_warning = False
                self.in_drift = False
            
            # Check levels
            if self.errors >= self.min_instances:
                ratio = (self.max_mean_distance - self.mean_distance - 
                         2 * self.std_distance) / self.max_mean_distance
                
                if ratio < self.drift_level:
                    self.in_drift = True
                    return {'drift': True, 'warning': False}
                elif ratio < self.warning_level:
                    self.in_warning = True
                    return {'drift': False, 'warning': True}
        
        return {'drift': False, 'warning': False}
```

---

## 3.2 Performance Degradation Monitoring

### 3.2.1 Online Metric Tracking
```python
class PerformanceMonitor:
    def __init__(self, window_size=1000, min_samples=100):
        self.window_size = window_size
        self.min_samples = min_samples
        
        self.predictions = deque(maxlen=window_size)
        self.labels = deque(maxlen=window_size)
        self.latencies = deque(maxlen=window_size)
    
    def add(self, prediction, label, latency_ms):
        self.predictions.append(prediction)
        self.labels.append(label)
        self.latencies.append(latency_ms)
    
    def compute_metrics(self) -> dict:
        if len(self.predictions) < self.min_samples:
            return {'status': 'insufficient_data'}
        
        y_true = np.array(self.labels)
        y_pred = np.array(self.predictions)
        
        metrics = {}
        
        # Classification metrics
        if len(np.unique(self.labels)) <= 10:  # Classification
            metrics['accuracy'] = accuracy_score(y_true, y_pred)
            metrics['f1_macro'] = f1_score(y_true, y_pred, average='macro')
            metrics['f1_weighted'] = f1_score(y_true, y_pred, average='weighted')
            metrics['roc_auc'] = roc_auc_score(self.labels, self.predictions) \
                if len(np.unique(self.labels)) == 2 else None
            
            # Calibration
            metrics['ece'] = expected_calibration_error(self.labels, self.predictions)
        
        else:  # Regression
            metrics['rmse'] = np.sqrt(mean_squared_error(self.labels, self.predictions))
            metrics['mae'] = mean_absolute_error(self.labels, self.predictions)
            metrics['r2'] = r2_score(self.labels, self.predictions)
        
        # Latency
        metrics['latency_p50'] = np.percentile(self.latencies, 50)
        metrics['latency_p95'] = np.percentile(self.latencies, 95)
        metrics['latency_p99'] = np.percentile(self.latencies, 99)
        
        return metrics
    
    def detect_degradation(self, baseline_metrics: dict, 
                           threshold: float = 0.05) -> dict:
        """Compare current metrics to baseline"""
        current = self.compute_metrics()
        alerts = []
        
        for metric, baseline_val in baseline_metrics.items():
            if metric not in current:
                continue
            
            current_val = current[metric]
            if isinstance(current_val, (int, float)) and isinstance(baseline_val, (int, float)):
                rel_change = (current_val - baseline_val) / (baseline_val + 1e-10)
                
                if abs(rel_change) > threshold:
                    alerts.append({
                        'metric': metric,
                        'baseline': baseline_val,
                        'current': current_val,
                        'relative_change': rel_change,
                        'direction': 'degraded' if rel_change < 0 else 'improved'
                    })
        
        return {'alerts': alerts, 'current_metrics': current}
```

### 3.2.2 Calibration Monitoring
```python
def expected_calibration_error(y_true, y_prob, n_bins=10):
    """Expected Calibration Error (ECE)"""
    bin_boundaries = np.linspace(0, 1, n_bins + 1)
    bin_lowers = bin_boundaries[:-1]
    bin_uppers = bin_boundaries[1:]
    
    ece = 0.0
    for bin_lower, bin_upper in zip(bin_lowers, bin_uppers):
        in_bin = (y_prob >= bin_lower) & (y_prob < bin_upper)
        prop_in_bin = in_bin.mean()
        
        if prop_in_bin > 0:
            accuracy_in_bin = y_true[in_bin].mean()
            avg_confidence = y_prob[in_bin].mean()
            ece += np.abs(avg_confidence - accuracy_in_bin) * prop_in_bin
    
    return ece

def calibration_monitoring(y_true, y_prob, n_bins=10):
    """Monitor calibration over time"""
    ece = expected_calibration_error(y_true, y_prob, n_bins)
    
    # Reliability diagram data
    bin_boundaries = np.linspace(0, 1, n_bins + 1)
    bin_lowers = bin_boundaries[:-1]
    bin_uppers = bin_boundaries[1:]
    
    reliability_data = []
    for bin_lower, bin_upper in zip(bin_lowers, bin_uppers):
        in_bin = (y_prob >= bin_lower) & (y_prob < bin_upper)
        if in_bin.sum() > 0:
            reliability_data.append({
                'bin_center': (bin_lower + bin_upper) / 2,
                'accuracy': y_true[in_bin].mean(),
                'confidence': y_prob[in_bin].mean(),
                'count': in_bin.sum()
            })
    
    return {
        'ece': ece,
        'reliability_diagram': reliability_data,
        'well_calibrated': ece < 0.05
    }
```

---

## 4. Prediction Drift Monitoring

### 4.1 Score Distribution Shift
```python
class PredictionDriftMonitor:
    def __init__(self, reference_scores: np.ndarray, bins=50):
        self.reference_scores = reference_scores
        self.bins = bins
        self.breakpoints = np.percentile(reference_scores, 
                                         np.linspace(0, 100, bins + 1))
        self.ref_hist, _ = np.histogram(reference_scores, bins=self.breakpoints)
        self.ref_pct = self.ref_hist / len(reference_scores)
    
    def check_drift(self, current_scores: np.ndarray) -> dict:
        cur_hist, _ = np.histogram(current_scores, bins=self.breakpoints)
        cur_pct = cur_hist / len(current_scores)
        
        # PSI
        eps = 1e-10
        ref_pct = np.maximum(self.ref_pct, eps)
        cur_pct = np.maximum(cur_pct, eps)
        psi = np.sum((cur_pct - ref_pct) * np.log(cur_pct / ref_pct))
        
        # KL divergence
        kl = np.sum(cur_pct * np.log(cur_pct / ref_pct))
        
        # Jensen-Shannon
        m = 0.5 * (ref_pct + cur_pct)
        js = 0.5 * (np.sum(ref_pct * np.log(ref_pct / m + 1e-10)) + 
                    np.sum(cur_pct * np.log(cur_pct / m + 1e-10)))
        
        return {
            'psi': psi,
            'kl_divergence': kl,
            'js_divergence': js,
            'drift_detected': psi > 0.2,
            'shift_direction': 'higher' if np.mean(current_scores) > np.mean(self.reference_scores) else 'lower'
        }
```

### 4.2 Prediction Interval Coverage
```python
def prediction_interval_coverage(y_true, y_pred_lower, y_pred_upper, 
                                 confidence=0.95):
    """Monitor prediction interval coverage"""
    covered = (y_true >= y_pred_lower) & (y_true <= y_pred_upper)
    coverage = covered.mean()
    
    # Expected coverage
    expected = confidence
    
    # Statistical test (binomial)
    from scipy.stats import binomtest
    test = binomtest(covered.sum(), len(covered), confidence)
    
    return {
        'coverage': coverage,
        'expected': expected,
        'difference': coverage - expected,
        'p_value': test.pvalue,
        'well_calibrated': test.pvalue > 0.05
    }
```

---

## 5. Monitoring Platforms

### 5.1 Evidently AI
```python
# Evidently AI - Open source ML monitoring
from evidently.report import Report
from evidently.metric_preset import (
    DataDriftPreset, TargetDriftPreset, 
    RegressionPreset, ClassificationPreset,
    DataQualityPreset
)
from evidently.test_suite import TestSuite
from evidently.tests import *

# Data Drift Report
data_drift_report = Report(metrics=[DataDriftPreset()])
data_drift_report.run(reference_data=ref_df, current_data=cur_df)
data_drift_report.save_html("data_drift_report.html")

# Test Suite with thresholds
test_suite = TestSuite(tests=[
    TestNumberOfDriftedColumns(threshold=0.3),
    TestColumnDrift(column_name="feature_1", stattest="psi", threshold=0.2),
    TestColumnDrift(column_name="target", stattest="ks", threshold=0.05),
    TestAccuracyScore(threshold=0.8),
    TestPrecisionScore(threshold=0.7),
    TestRecallScore(threshold=0.7),
])

test_suite.run(reference_data=ref_df, current_data=cur_df)
test_suite.save_html("test_suite.html")

# Get results
results = test_suite.as_dict()
for test in results['tests']:
    print(f"{test['name']}: {'PASSED' if test['status'] == 'SUCCESS' else 'FAILED'}")
```

### 5.2 WhyLabs (Managed)
```python
# WhyLabs integration
import whylogs as why
from whylabs.logs import WhyLabsWriter

# Initialize logger
logger = why.logger(mode="rolling", interval=5)

# Log dataset
results = logger.log_dataframe(df)
results.writer("whylabs", writer=WhyLabsWriter(
    api_key="YOUR_API_KEY",
    dataset_id="model-monitoring"
))

# Profile
profile = results.view()
print(profile.summary())
```

### 5.3 Custom Monitoring Stack
```python
# Custom Prometheus + Grafana Stack
from prometheus_client import Counter, Histogram, Gauge, start_http_server

# Metrics
DRIFT_SCORE = Gauge('model_drift_score', 'Current drift score', ['model', 'feature'])
DRIFT_ALERT = Counter('model_drift_alerts_total', 'Drift alerts', ['model', 'severity'])
PERFORMANCE_METRIC = Gauge('model_performance', 'Model performance', ['model', 'metric'])
LATENCY = Histogram('inference_latency_seconds', 'Inference latency', ['model'])

def monitor_model(model_name, features, predictions, labels):
    """Comprehensive monitoring function"""
    
    # 1. Data drift per feature
    for feat in features.columns:
        psi = psi_score(ref_data[feat], features[feat])
        DRIFT_SCORE.labels(model=model_name, feature=feat).set(psi)
        
        if psi > 0.2:
            DRIFT_ALERT.labels(model=model_name, severity='high').inc()
        elif psi > 0.1:
            DRIFT_ALERT.labels(model=model_name, severity='medium').inc()
    
    # 2. Performance metrics
    if len(np.unique(labels)) <= 10:
        acc = accuracy_score(labels, predictions)
        PERFORMANCE_METRIC.labels(model=model_name, metric='accuracy').set(acc)
        
        if acc < 0.8:  # Threshold
            DRIFT_ALERT.labels(model=model_name, severity='critical').inc()
    
    # 3. Latency
    # (measured in inference code)
```

---

## 6. Alerting & Automation

### 6.1 Alerting Rules
```python
class AlertManager:
    def __init__(self):
        self.rules = []
        self.notification_channels = {
            'slack': SlackNotifier(),
            'pagerduty': PagerDutyNotifier(),
            'email': EmailNotifier()
        }
    
    def add_rule(self, name, condition, severity='warning', 
                 cooldown_minutes=60, channels=['slack']):
        self.rules.append({
            'name': name,
            'condition': condition,  # Callable returning bool
            'severity': severity,
            'cooldown_minutes': cooldown_minutes,
            'channels': channels,
            'last_fired': None
        })
    
    def evaluate(self, metrics: dict):
        for rule in self.rules:
            if rule['condition'](metrics):
                if self._should_fire(rule):
                    self._fire_alert(rule, metrics)
    
    def _should_fire(self, rule):
        if rule['last_fired'] is None:
            return True
        elapsed = (datetime.now() - rule['last_fired']).total_seconds() / 60
        return elapsed >= rule['cooldown_minutes']

# Default alert rules
def setup_default_alerts(alert_manager):
    # Data drift
    alert_manager.add_rule(
        'high_psi_drift',
        lambda m: any(m.get(f'psi_{f}', 0) > 0.2 for f in m.get('features', [])),
        severity='critical',
        channels=['pagerduty', 'slack']
    )
    
    alert_manager.add_rule(
        'moderate_psi_drift',
        lambda m: any(m.get(f'psi_{f}', 0) > 0.1 for f in m.get('features', [])),
        severity='warning',
        channels=['slack']
    )
    
    # Performance degradation
    alert_manager.add_rule(
        'accuracy_drop',
        lambda m: m.get('accuracy', 1.0) < 0.8,
        severity='critical',
        channels=['pagerduty', 'slack']
    )
    
    alert_manager.add_rule(
        'auc_drop',
        lambda m: m.get('roc_auc', 1.0) < 0.75,
        severity='warning',
        channels=['slack']
    )
    
    # Latency
    alert_manager.add_rule(
        'high_latency_p99',
        lambda m: m.get('latency_p99', 0) > 1000,  # ms
        severity='warning',
        channels=['slack']
    )
    
    # Concept drift
    alert_manager.add_rule(
        'concept_drift_detected',
        lambda m: m.get('concept_drift', False),
        severity='critical',
        channels=['pagerduty', 'slack']
    )
```

### 6.2 Automated Retraining Trigger
```python
class AutoRetrainer:
    def __init__(self, model_registry, feature_store, 
                 retraining_pipeline, alert_manager):
        self.model_registry = model_registry
        self.feature_store = feature_store
        self.pipeline = retraining_pipeline
        self.alert_manager = alert_manager
    
    def check_and_retrain(self, model_name: str, metrics: dict):
        """Check if retraining needed and trigger pipeline"""
        
        triggers = []
        
        # Performance degradation
        if metrics.get('accuracy', 1.0) < 0.85:
            triggers.append('accuracy_below_threshold')
        
        # Data drift
        if any(psi > 0.2 for psi in metrics.get('psi_scores', {}).values()):
            triggers.append('data_drift')
        
        # Concept drift
        if metrics.get('concept_drift_detected', False):
            triggers.append('concept_drift')
        
        # Time-based (staleness)
        model_info = self.model_registry.get_model(model_name)
        days_since_train = (datetime.now() - model_info.trained_at).days
        if days_since_train > 30:
            triggers.append('model_stale')
        
        if triggers:
            # Trigger retraining pipeline
            run_id = self.pipeline.trigger({
                'model_name': model_name,
                'triggers': triggers,
                'priority': 'high' if 'critical' in triggers else 'normal'
            })
            
            # Alert
            self.alert_manager.notify(
                f"Auto-retraining triggered for {model_name}",
                details={'triggers': triggers, 'run_id': run_id},
                severity='info'
            )
            
            return run_id
        
        return None
```

---

## 7. Dashboard & Visualization

### 7.1 Grafana Dashboard Panels
```json
{
  "dashboard": {
    "title": "ML Model Monitoring",
    "panels": [
      {
        "title": "Data Drift (PSI)",
        "type": "timeseries",
        "targets": [
          {"expr": "model_drift_score{model=\"my_model\"}", "legendFormat": "{{feature}}"}
        ],
        "thresholds": [
          {"value": 0.1, "color": "yellow", "label": "Moderate"},
          {"value": 0.2, "color": "red", "label": "High"}
        ]
      },
      {
        "title": "Model Performance",
        "type": "timeseries",
        "targets": [
          {"expr": "model_performance{model=\"my_model\",metric=\"accuracy\"}", "legendFormat": "Accuracy"},
          {"expr": "model_performance{model=\"my_model\",metric=\"roc_auc\"}", "legendFormat": "ROC-AUC"}
        ]
      },
      {
        "title": "Prediction Drift (PSI)",
        "type": "timeseries",
        "targets": [
          {"expr": "model_drift_score{model=\"my_model\",feature=\"prediction_score\"}", "legendFormat": "Prediction Score"}
        ]
      },
      {
        "title": "Latency",
        "type": "timeseries",
        "targets": [
          {"expr": "histogram_quantile(0.95, rate(inference_latency_seconds_bucket[5m]))", "legendFormat": "p95"},
          {"expr": "histogram_quantile(0.99, rate(inference_latency_seconds_bucket[5m]))", "legendFormat": "p99"}
        ]
      },
      {
        "title": "Throughput & Errors",
        "type": "timeseries",
        "targets": [
          {"expr": "rate(requests_total[5m])", "legendFormat": "RPS"},
          {"expr": "rate(errors_total[5m])", "legendFormat": "Error Rate"}
        ]
      },
      {
        "title": "Drift Alerts",
        "type": "stat",
        "targets": [
          {"expr": "model_drift_alerts_total", "legendFormat": "Alerts"}
        ]
      }
    ]
  }
}
```

---

## 8. Key Takeaways

1. **Monitor at multiple levels**: Data drift → Concept drift → Prediction drift → Performance
2. **PSI** for feature drift (threshold: 0.1 warning, 0.2 critical)
3. **KS/JS/Chi-square** for distribution comparison
4. **Domain Classifier** for multivariate drift (AUC > 0.55 = drift)
5. **ADWIN/DDM/EDDM** for streaming concept drift detection
5. **CUPED** reduces variance in experiment monitoring
6. **Performance monitoring**: Accuracy, AUC, calibration (ECE), latency
6. **Calibration monitoring**: ECE + reliability diagrams
7. **Prediction drift**: Score distribution shift (PSI/KL/JS)
7. **Evidently/WhyLabs/Fiddler** for managed monitoring
8. **Alert hierarchy**: Info → Warning → Critical → PagerDuty
8. **Automated retraining** on drift/performance thresholds
9. **Dashboards**: Real-time PSI, performance, latency, alerts
10. **Key principle**: Monitor what matters for business outcomes