# DBSCAN (Density-Based Spatial Clustering of Applications with Noise)

DBSCAN finds clusters of arbitrary shape by identifying high-density regions separated by low-density regions. It explicitly labels outliers as noise (-1).

## 1. Core Concepts
- **eps (ε)**: Maximum radius to search for neighbors.
- **min_samples (MinPts)**: Minimum points required to form a dense region (core point).
- **Core Point**: ≥ min_samples within ε-radius.
- **Border Point**: < min_samples within ε-radius, but in neighborhood of a core point.
- **Noise Point**: Neither core nor border.

## 2. Algorithm
1. Pick an unvisited point.
2. If it has ≥ min_samples neighbors → start new cluster, expand to all reachable points.
3. If not → mark as noise (may be reclassified as border later).
4. Repeat until all points visited.

## 3. Implementation

### Python (using `sklearn`)
```python
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import numpy as np
import matplotlib.pyplot as plt

X = np.random.rand(200, 2)
X = StandardScaler().fit_transform(X)  # Critical!

dbscan = DBSCAN(eps=0.3, min_samples=5)
labels = dbscan.fit_predict(X)

n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
n_noise = list(labels).count(-1)
print(f"Clusters: {n_clusters}, Noise points: {n_noise}")

# Visualize
plt.scatter(X[:, 0], X[:, 1], c=labels, cmap='tab10', s=10)
plt.show()
```

### R
```r
library(dbscan)
X <- scale(matrix(runif(400), ncol=2))  # Scale first!
res <- dbscan(X, eps = 0.3, minPts = 5)
plot(X, col = res$cluster + 1L, pch = 20)
```

## 4. Parameter Selection (The Hard Part)

### Choosing min_samples
- **Rule of thumb**: `min_samples = 2 * n_features` (or `n_features + 1`).
- Higher min_samples → more noise, fewer/sparser clusters.
- For noisy data: increase min_samples.

### Choosing eps (The K-Distance Graph)
1. Compute distance to k-th nearest neighbor for all points (k = min_samples).
2. Sort distances descending.
3. Plot - look for the "knee" (elbow).
4. That distance = optimal eps.

```python
from sklearn.neighbors import NearestNeighbors
import matplotlib.pyplot as plt

k = 5  # min_samples
nbrs = NearestNeighbors(n_neighbors=k).fit(X)
distances, _ = nbrs.kneighbors(X)
distances = np.sort(distances[:, k-1])  # k-th neighbor distance
plt.plot(distances)
plt.ylabel(f"Distance to {k}-th nearest neighbor")
plt.xlabel("Points sorted by distance")
plt.show()
```

## 5. Practical Considerations

### Strengths
- **Arbitrary shapes**: Handles crescents, rings, nested clusters.
- **Outlier detection**: Built-in noise identification (-1 label).
- **No K required**: Finds natural number of clusters.
- **Robust to outliers**: Outliers don't distort cluster centers.

### Weaknesses & Fixes
| Weakness | Cause | Fix |
|----------|-------|-----|
| **Varying density** | Single eps can't handle both dense & sparse clusters | Use **HDBSCAN** (Hierarchical DBSCAN) |
| **High dimensions** | Distance metrics break down (curse of dimensionality) | Reduce dimensions first (PCA/UMAP) |
| **Sensitive to eps** | Small eps changes → dramatically different results | K-distance plot + domain knowledge |
| **Border point instability** | Border points flip between clusters/noise | Use HDBSCAN (probabilistic membership) |

### HDBSCAN (Highly Recommended)
```python
import hdbscan
clusterer = hdbscan.HDBSCAN(min_cluster_size=5, min_samples=3)
labels = clusterer.fit_predict(X)

# Probabilities of membership (0 = noise, 1 = core)
probs = clusterer.probabilities_
```
**Advantages**: 
- No eps needed (uses min_cluster_size instead)
- Handles variable density
- Provides cluster membership probabilities
- Faster on large datasets (approx. O(n log n))

### Scaling is Non-Negotiable
DBSCAN uses Euclidean distance. Features **must** be standardized. Even then, correlated features distort distances → consider PCA/whitening first.

### Cluster Interpretation
- **Noise points (-1)**: Investigate! Often the most interesting points (anomalies, fraud, sensor errors).
- **Cluster profiles**: Same as K-Means - compute feature means per cluster.
- **Cluster stability**: Run with slightly different eps/min_samples; stable clusters persist.

### When to Use DBSCAN
- Unknown number of clusters
- Non-globular shapes
- Explicit outlier detection needed
- Spatial/geospatial data
- When you suspect noise in data

### When NOT to Use DBSCAN
- High-dimensional data without reduction
- Clusters with widely varying densities (use HDBSCAN)
- Need to assign new points easily (no predict method)
- Very large datasets without approximation (use HDBSCAN or subsample)

### Production Tips
- **No predict()**: Train a classifier (Random Forest) on cluster labels to assign new points.
- **Distance matrix**: For non-Euclidean metrics, pass `metric='precomputed'` and a condensed distance matrix.
- **Parallelization**: `n_jobs=-1` in sklearn for pairwise distance computation.
- **Memory**: Stores full distance matrix in memory for large datasets → use HDBSCAN or approximate neighbors.