# Hierarchical Clustering

Hierarchical Clustering builds a hierarchy of clusters either by merging small clusters into larger ones (Agglomerative) or splitting large clusters (Divisive). It does not require specifying K upfront.

## 1. Agglomerative Clustering (Bottom-Up)
The most common approach:
1. Every data point starts as its own cluster.
2. Find the two closest clusters and merge them.
3. Repeat until only one large cluster remains.

## 2. Linkage Criteria
The "distance" between two clusters depends on the linkage method:
- **Ward's Method**: Minimizes the increase in total within-cluster variance after merging. **Default recommendation** - produces compact, balanced clusters.
- **Complete Linkage**: Maximum distance between points in two clusters. Produces compact clusters, sensitive to outliers.
- **Average Linkage**: Average distance between all pairs of points. Good compromise.
- **Single Linkage**: Minimum distance between points in two clusters. Can cause "chaining" (elongated clusters).

## 3. The Dendrogram
The output is a **Dendrogram** (tree-like diagram).
- Y-axis: Distance at which clusters were merged.
- To find optimal K: "Cut" the dendrogram horizontally at the largest vertical distance without crossing a merge line.

## 4. Implementation

### Python (using `scipy` and `sklearn`)
```python
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster
from sklearn.cluster import AgglomerativeClustering
import matplotlib.pyplot as plt
import numpy as np

X = np.random.rand(30, 2)

# 1. Visualize with Dendrogram
Z = linkage(X, method='ward')
plt.figure(figsize=(10, 5))
dendrogram(Z, truncate_mode='level', p=5)
plt.title('Dendrogram (Ward Linkage)')
plt.show()

# 2. Fit Agglomerative Clustering
# Option A: Specify n_clusters
agg = AgglomerativeClustering(n_clusters=3, linkage='ward')
labels = agg.fit_predict(X)

# Option B: Use distance threshold (no need to specify K)
agg_auto = AgglomerativeClustering(n_clusters=None, distance_threshold=1.5, linkage='ward')
labels_auto = agg_auto.fit_predict(X)
```

### R
```r
X <- as.matrix(iris[, 1:4])
d <- dist(X, method = "euclidean")
hc <- hclust(d, method = "ward.D2")

# Plot dendrogram
plot(hc, hang = -1, cex = 0.6)

# Cut tree into 3 clusters
clusters <- cutree(hc, k = 3)
table(clusters)
```

## 5. Practical Considerations

### When to Use Hierarchical Over K-Means
- **Small to medium datasets** (< 10k samples): Computationally expensive (O(n²) to O(n³)).
- **When you need the hierarchy**: Understanding nested cluster structure (e.g., biological taxonomy).
- **When K is unknown**: Dendrogram provides visual guidance for K selection.
- **Non-spherical clusters**: With appropriate linkage, can capture more complex shapes.

### Scalability Solutions
- **AgglomerativeClustering with `connectivity`**: Constrain merging to nearest neighbors using a KNN graph - reduces complexity.
- **BIRCH / CLUSTER**: For large datasets, use BIRCH (Balanced Iterative Reducing and Clustering using Hierarchies) as an approximation.
- **MiniBatchKMeans → Hierarchical**: Run K-Means first to get ~100 centroids, then run hierarchical on centroids.

### Distance Metrics Matter
- **Euclidean**: Default, assumes isotropic clusters.
- **Cosine**: For text/document clustering (high-dimensional sparse data).
- **Correlation**: For time-series or gene expression data.
- **Precomputed**: Pass a custom distance matrix for domain-specific metrics.

### Cluster Validation
- **Cophenetic Correlation Coefficient**: Correlation between original distances and dendrogram-implied distances. > 0.75 indicates good structure preservation.
- **Silhouette Score**: Works here too.
- **Dendrogram Visual Inspection**: Look for long vertical lines (distinct clusters) vs short lines (forced merges).

### Common Pitfalls
| Issue | Cause | Solution |
|-------|-------|----------|
| **Chaining** | Single linkage + noise | Use Ward or Complete linkage |
| **Memory Error** | O(n²) distance matrix | Use connectivity constraints or sampling |
| **Sensitivity to scaling** | Same as K-Means | Standardize features first! |
| **Arbitrary cut height** | No clear K | Use silhouette across range of cuts |

### Production Tips
- **No `predict()` method**: Unlike K-Means, you cannot easily assign new points to existing clusters without refitting or using a classifier trained on cluster labels.
- **Deterministic**: No random initialization (except tie-breaking), so results are reproducible.
- **Save Linkage Matrix**: `Z` from `linkage()` is compact and contains full hierarchy - save this instead of full model.

## 6. Divisive Clustering (Top-Down)
Rarely used in practice. Starts with all data in one cluster and recursively splits. Computationally harder (2^n possible splits). DIANA (DIvisive ANAlysis) is the classic algorithm.