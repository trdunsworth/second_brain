# K-Means Clustering

K-Means is a centroid-based clustering algorithm that partitions a dataset into $K$ distinct, non-overlapping subgroups (clusters).

## 1. How it Works (The Algorithm)
1. **Initialization**: Randomly select $K$ points as initial centroids.
2. **Assignment**: Assign each data point to the nearest centroid based on Euclidean distance.
3. **Update**: Calculate the mean of all points in each cluster and move the centroid to that mean.
4. **Repeat**: Iterate steps 2 and 3 until centroids no longer significantly (convergence).

## 2. Mathematical Foundations
- **[[Linear Algebra Foundations]]**: Uses Euclidean Distance $\|\mathbf{x} - \mathbf{c}\|^2$ to measure similarity.
- **[[Optimization basics]]**: The algorithm seeks to minimize the **Inertia** (Within-Cluster Sum of Squares).

## 3. Choosing the Right $K$ (Deep Dive)

Since we must specify $K$ in advance, this is the most critical practical decision. Here are the main methods with implementation details.

### 3.1 The Elbow Method (Inertia / WCSS)

**Concept**: Plot Inertia (Within-Cluster Sum of Squares) vs K. Inertia always decreases as K increases. The "elbow" is where the rate of decrease sharply slows—adding more clusters doesn't buy much more compression.

```python
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
import numpy as np

# Compute inertia for K=1 to 10
inertias = []
K_range = range(1, 11)
for k in K_range:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init='auto')
    kmeans.fit(X_scaled)
    inertias.append(kmeans.inertia_)

# Plot
plt.figure(figsize=(8, 5))
plt.plot(K_range, inertias, 'bo-', markersize=8)
plt.xlabel('Number of clusters (K)')
plt.ylabel('Inertia (WCSS)')
plt.title('Elbow Method')
plt.grid(True, alpha=0.3)
plt.show()
```

**How to Read the Plot**:
- **Clear elbow**: Sharp bend → that K is optimal
- **No clear elbow**: Gradual curve → K-Means may not be appropriate, or data has no clear cluster structure
- **Multiple elbows**: Hierarchical structure → consider the first major elbow

**Automated Elbow Detection** (kneed package):
```python
from kneed import KneeLocator

kl = KneeLocator(K_range, inertias, curve='convex', direction='decreasing')
optimal_k = kl.elbow
print(f"Optimal K (automated): {optimal_k}")
```

---

### 3.2 Silhouette Analysis

**Concept**: For each point, compute:
- $a(i)$ = mean distance to other points in **same** cluster
- $b(i)$ = mean distance to points in **nearest other** cluster
- Silhouette coefficient: $s(i) = \frac{b(i) - a(i)}{\max(a(i), b(i))}$

Range: $[-1, 1]$
- **+1**: Well clustered (far from other clusters, close to own)
- **0**: On boundary between clusters
- **-1**: Likely assigned to wrong cluster

```python
from sklearn.metrics import silhouette_score, silhouette_samples
import matplotlib.pyplot as plt
import numpy as np

silhouette_scores = []
K_range = range(2, 11)  # Silhouette needs K >= 2

for k in K_range:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init='auto')
    labels = kmeans.fit_predict(X_scaled)
    score = silhouette_score(X_scaled, labels)
    silhouette_scores.append(score)

# Plot average silhouette per K
plt.figure(figsize=(8, 5))
plt.plot(K_range, silhouette_scores, 'go-', markersize=8)
plt.xlabel('Number of clusters (K)')
plt.ylabel('Average Silhouette Score')
plt.title('Silhouette Analysis')
plt.grid(True, alpha=0.3)
plt.show()

optimal_k = K_range[np.argmax(silhouette_scores)]
print(f"Optimal K (silhouette): {optimal_k}")
```

**Detailed Silhouette Plot** (shows distribution within each cluster):
```python
from sklearn.metrics import silhouette_samples

k = optimal_k
kmeans = KMeans(n_clusters=k, random_state=42, n_init='auto')
labels = kmeans.fit_predict(X_scaled)

sample_silhouette_values = silhouette_samples(X_scaled, labels)

fig, ax = plt.subplots(figsize=(8, 6))
y_lower = 10
for i in range(k):
    cluster_silhouette = sample_silhouette_values[labels == i]
    cluster_silhouette.sort()
    size = cluster_silhouette.shape[0]
    y_upper = y_lower + size
    
    color = plt.cm.tab10(i / k)
    ax.fill_betweenx(np.arange(y_lower, y_upper), 0, cluster_silhouette,
                     facecolor=color, edgecolor=color, alpha=0.7)
    ax.text(-0.05, y_lower + 0.5 * size, f'Cluster {i}')
    y_lower = y_upper + 10

ax.axvline(x=silhouette_score(X_scaled, labels), color="red", linestyle="--", 
           label=f'Average = {silhouette_score(X_scaled, labels):.3f}')
ax.set_xlabel('Silhouette Coefficient')
ax.set_ylabel('Cluster')
ax.legend()
plt.show()
```

**Interpretation**:
- **Wide, uniform bars** → well-separated clusters
- **Thin bars or negative values** → overlapping clusters, consider reducing K
- **Uneven cluster sizes** → some clusters may be artifacts

---

### 3.3 Gap Statistic (More Rigorous)

**Concept**: Compare log(WCSS) to expected log(WCSS) under a null reference distribution (uniform distribution in bounding box). Optimal K maximizes the gap.

```python
from sklearn.cluster import KMeans
import numpy as np

def gap_statistic(X, K_range, n_refs=10):
    """Compute Gap Statistic for K-Means"""
    gaps = []
    gap_std = []
    
    # Bounding box of data
    x_min, x_max = X.min(axis=0), X.max(axis=0)
    
    for k in K_range:
        # Fit on real data
        kmeans = KMeans(n_clusters=k, random_state=42, n_init='auto')
        kmeans.fit(X)
        wcss_real = kmeans.inertia_
        
        # Fit on reference datasets
        ref_wcss = []
        for _ in range(n_refs):
            # Generate uniform random data in same bounding box
            X_ref = np.random.uniform(x_min, x_max, X.shape)
            kmeans_ref = KMeans(n_clusters=k, random_state=None, n_init='auto')
            kmeans_ref.fit(X_ref)
            ref_wcss.append(kmeans_ref.inertia_)
        
        # Gap = E[log(WCSS_ref)] - log(WCSS_real)
        gap = np.mean(np.log(ref_wcss)) - np.log(wcss_real)
        gaps.append(gap)
        gap_std.append(np.std(np.log(ref_wcss)) * np.sqrt(1 + 1/n_refs))
    
    return np.array(gaps), np.array(gap_std)

# Usage
K_range = range(1, 11)
gaps, gap_std = gap_statistic(X_scaled, K_range)

# Plot
plt.figure(figsize=(8, 5))
plt.errorbar(K_range, gaps, yerr=gap_std, fmt='o-', capsize=5)
plt.xlabel('K')
plt.ylabel('Gap Statistic')
plt.title('Gap Statistic (higher = better)')
plt.grid(True, alpha=0.3)
plt.show()

# Optimal K: smallest k where Gap(k) >= Gap(k+1) - s_{k+1}
# (Tibshirani et al. rule)
for i, k in enumerate(K_range[:-1]):
    if gaps[i] >= gaps[i+1] - gap_std[i+1]:
        print(f"Optimal K (Gap Statistic): {k}")
        break
```

---

### 3.4 Other Internal Indices

```python
from sklearn.metrics import calinski_harabasz_score, davies_bouldin_score

ch_scores = []
db_scores = []

for k in range(2, 11):
    kmeans = KMeans(n_clusters=k, random_state=42, n_init='auto')
    labels = kmeans.fit_predict(X_scaled)
    ch_scores.append(calinski_harabasz_score(X_scaled, labels))
    db_scores.append(davies_bouldin_score(X_scaled, labels))

# Calinski-Harabasz: Higher = better (between-cluster dispersion / within-cluster)
# Davies-Bouldin: Lower = better (average similarity between clusters)

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
axes[0].plot(range(2, 11), ch_scores, 'mo-')
axes[0].set_title('Calinski-Harabasz (higher better)')
axes[1].plot(range(2, 11), db_scores, 'co-')
axes[1].set_title('Davies-Bouldin (lower better)')
plt.show()
```

---

### 3.5 Practical Decision Framework

| Scenario | Recommended Primary Method | Confirm With |
|----------|---------------------------|--------------|
| **Clear cluster structure** | Elbow (fast, intuitive) | Silhouette |
| **No clear elbow** | Silhouette (quantitative) | Gap Statistic |
| **High-dimensional data** | Gap Statistic (robust) | Silhouette |
| **Need to justify to stakeholders** | Elbow + Silhouette visual | Gap Statistic table |
| **Automated pipeline** | Gap Statistic or Silhouette max | — |

### 3.6 Decision Checklist for Production

```python
def choose_k_checklist(X, max_k=10):
    """
    Run all methods and return consensus.
    """
    results = {}
    
    # 1. Elbow (automated)
    inertias = []
    for k in range(1, max_k+1):
        km = KMeans(n_clusters=k, random_state=42, n_init='auto').fit(X)
        inertias.append(km.inertia_)
    from kneed import KneeLocator
    kl = KneeLocator(range(1, max_k+1), inertias, curve='convex', direction='decreasing')
    results['elbow'] = kl.elbow
    
    # 2. Silhouette
    sil_scores = [silhouette_score(X, KMeans(n_clusters=k, random_state=42, n_init='auto').fit_predict(X)) 
                  for k in range(2, max_k+1)]
    results['silhouette'] = range(2, max_k+1)[np.argmax(sil_scores)]
    
    # 3. Calinski-Harabasz
    ch_scores = [calinski_harabasz_score(X, KMeans(n_clusters=k, random_state=42, n_init='auto').fit_predict(X)) 
                 for k in range(2, max_k+1)]
    results['calinski_harabasz'] = range(2, max_k+1)[np.argmax(ch_scores)]
    
    # 4. Davies-Bouldin
    db_scores = [davies_bouldin_score(X, KMeans(n_clusters=k, random_state=42, n_init='auto').fit_predict(X)) 
                 for k in range(2, max_k+1)]
    results['davies_bouldin'] = range(2, max_k+1)[np.argmin(db_scores)]
    
    return results

# Usage
consensus = choose_k_checklist(X_scaled, max_k=10)
print("Method recommendations:", consensus)
# Look for agreement across methods
```

## 4. Implementation

### Python (using `scikit-learn`)
```python
from sklearn.cluster import KMeans
import numpy as np
import matplotlib.pyplot as plt

X = np.random.rand(100, 2)

# Initialize and fit model
kmeans = KMeans(n_clusters=3, random_state=42, n_init='auto')
clusters = kmeans.fit_predict(X)

# Get centroids
centroids = kmeans.cluster_centers_

plt.scatter(X[:, 0], X[:, 1], c=clusters)
plt.scatter(centroids[:, 0], centroids[:, 1], c='red', s=200, marker='X')
plt.show()
```

### R
```r
library(kmeans)
X <- matrix(runif(200), ncol=2)
km <- kmeans(X, centers = 3, nstart = 20)
plot(km)
```

## 5. Practical Considerations & Gotchas

### Data Preprocessing (Critical)
- **Standardization is Mandatory**: K-Means uses Euclidean distance. Features with larger scales will dominate the distance calculation. Always apply `StandardScaler` (zero mean, unit variance) before clustering.
- **Outlier Sensitivity**: Outliers pull centroids toward them, distorting clusters. Consider removing outliers or using RobustScaler before clustering.
- **Missing Values**: K-Means cannot handle NaN values. Impute (mean/median/KNN imputation) or drop rows/columns before fitting.

### Initialization Strategies
- **K-Means++ (Default in sklearn)**: Smart initialization that spreads initial centroids apart. Dramatically improves convergence speed and avoids poor local minima. Always use this over random initialization.
- **n_init Parameter**: Run the algorithm multiple times with different initializations and keep the best result (lowest inertia). Default `n_init=10` in sklearn.

### Choosing K in Production
- **Elbow Method Automation**: Use the "knee locator" algorithm (`kneed` package in Python) to programmatically find the elbow point.
- **Silhouette Analysis**: Compute silhouette scores for a range of K values. The K with the highest average silhouette score is optimal.
- **Gap Statistic**: Compares the total within intra-cluster variation for different values of K with their expected values under null reference distribution.

### Cluster Interpretation & Validation
- **Cluster Profiling**: After clustering, compute the mean/median of each feature per cluster. This creates a "persona" for each cluster (e.g., "High-value frequent buyers" vs "Low-value occasional browsers").
- **Internal Validation**: Silhouette Score, Davies-Bouldin Index (lower is better), Calinski-Harabasz Index (higher is better).
- **External Validation** (if labels exist): Adjusted Rand Index (ARI), Normalized Mutual Information (NMI).

### Common Failure Modes
| Failure Mode | Symptom | Fix |
|--------------|---------|-----|
| **Non-spherical clusters** | K-Means forces circular blobs | Use DBSCAN or Gaussian Mixture Models |
| **Unequal cluster sizes/densities** | Large clusters get split; small clusters merged | Use DBSCAN or Hierarchical |
| **High dimensionality** | Distance metrics become meaningless ("curse of dimensionality") | Apply PCA first, then cluster |
| **Correlated features** | Redundant features overweight certain dimensions | Remove multicollinearity or use PCA |

### Production Tips
- **MiniBatchKMeans**: For large datasets (>100k samples), use `MiniBatchKMeans` which uses mini-batches to update centroids - much faster with minimal quality loss.
- **Model Persistence**: Save the fitted model with `joblib` (not pickle) for large numpy arrays. The scaler must be saved and reapplied to new data before prediction.
- **Drift Detection**: Monitor cluster distribution over time. If new data assigns to clusters very differently, the underlying population may have shifted (concept drift).

### When NOT to Use K-Means
- Categorical data (use K-Modes or K-Prototypes)
- Non-globular shapes (crescents, concentric circles)
- When you need deterministic results without setting random_state
- When interpretability of cluster boundaries is required (use Decision Trees on cluster labels instead)