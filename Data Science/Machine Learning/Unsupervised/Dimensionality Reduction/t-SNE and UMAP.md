# t-SNE and UMAP

Non-linear dimensionality reduction for visualization and preprocessing. Unlike PCA, these preserve **local structure** (neighborhood relationships) and can reveal complex manifolds.

## 1. t-SNE (t-Distributed Stochastic Neighbor Embedding)

### How it Works
1. **High-dimensional space**: Convert Euclidean distances to conditional probabilities $p_{j|i}$ (Gaussian kernel).
2. **Low-dimensional space**: Convert distances to probabilities $q_{j|i}$ (Student's t-distribution with 1 DoF).
3. **Optimization**: Minimize KL divergence between $P$ and $Q$ using gradient descent.

### Key Insight
- **Heavy-tailed t-distribution** in low-D space prevents "crowding problem" (moderately distant points pushed further apart).
- Preserves **local neighborhoods** - points that are close stay close.

### Hyperparameters
| Parameter | Typical Range | Effect |
|-----------|---------------|--------|
| **perplexity** | 5-50 | Effective number of neighbors. Low = local detail; High = global structure. |
| **learning_rate** | 10-1000 | Too low = stuck; Too high = overshoot. Often "auto" works. |
| **n_iter** | 250-1000+ | More iterations = better convergence. |
| **early_exaggeration** | 4-12 | Controls cluster separation in early phase. |

## 2. UMAP (Uniform Manifold Approximation and Projection)

### How it Works
- Based on Riemannian geometry and algebraic topology.
- Constructs a weighted k-nearest neighbor graph in high-D.
- Optimizes low-D layout to preserve graph topology using cross-entropy loss.

### Advantages over t-SNE
- **Much faster** (O(n log n) vs O(n²) - scales to millions of points).
- **Preserves global structure** better (inter-cluster distances meaningful).
- **Has `transform()` method** - can embed new points without refitting.
- **Deterministic** with fixed random_state.

### Hyperparameters
| Parameter | Typical Range | Effect |
|-----------|---------------|--------|
| **n_neighbors** | 5-50 | Local vs global balance (like perplexity). |
| **min_dist** | 0.0-0.5 | How tightly points are packed. Low = tight clusters. |
| **n_components** | 2-100+ | Not limited to 2-3 like t-SNE. |
| **metric** | 'euclidean', 'cosine', etc. | Distance metric for high-D space. |

## 3. Implementation

### Python
```python
from sklearn.manifold import TSNE
import umap
import numpy as np
import matplotlib.pyplot as plt

X = np.random.rand(1000, 50)  # 1000 samples, 50 features

# === t-SNE ===
tsne = TSNE(n_components=2, perplexity=30, learning_rate='auto', 
            n_iter=1000, random_state=42)
X_tsne = tsne.fit_transform(X)

# Note: No transform() method - must refit for new data!

# === UMAP ===
reducer = umap.UMAP(n_neighbors=15, min_dist=0.1, n_components=2, 
                    metric='euclidean', random_state=42)
X_umap = reducer.fit_transform(X)

# Can transform new data!
X_new = np.random.rand(10, 50)
X_new_umap = reducer.transform(X_new)

# === Visualization ===
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
axes[0].scatter(X_tsne[:, 0], X_tsne[:, 1], s=5, alpha=0.7)
axes[0].set_title('t-SNE')
axes[1].scatter(X_umap[:, 0], X_umap[:, 1], s=5, alpha=0.7)
axes[1].set_title('UMAP')
plt.show()
```

### R
```r
library(Rtsne)
library(uwot)

X <- matrix(runif(50000), ncol=50)

# t-SNE
tsne_res <- Rtsne(X, perplexity=30, check_duplicates=FALSE)
plot(tsne_res$Y, pch=20, cex=0.5)

# UMAP
umap_res <- umap(X, n_neighbors=15, min_dist=0.1)
plot(umap_res, pch=20, cex=0.5)
```

## 4. Practical Considerations

### When to Use Which
| Scenario | Recommendation |
|----------|----------------|
| **Exploratory visualization (2D/3D)** | UMAP (faster, preserves global structure) |
| **Publication-quality plots** | t-SNE (more established, familiar to reviewers) |
| **Preprocessing for downstream ML** | UMAP (has transform, preserves more info) |
| **Very large datasets (>100k)** | UMAP (or subsample + t-SNE) |
| **Need to embed new data points** | UMAP (has `transform()`) |
| **Text/word embeddings** | UMAP with `metric='cosine'` |

### Critical Preprocessing
1. **PCA First (Strongly Recommended)**
   - Reduce to ~50 components before t-SNE/UMAP.
   - Removes noise, speeds up computation dramatically.
   - `Pipeline([('pca', PCA(50)), ('umap', UMAP())])`

2. **Standardize**: Both methods use distance metrics.

3. **Remove duplicates**: t-SNE fails with duplicate points (`check_duplicates=False` skips check).

### Interpreting Results - CAUTION
| Misconception | Reality |
|---------------|---------|
| "Cluster A is far from Cluster B" | Distances between clusters are **not meaningful** (especially t-SNE). |
| "This cluster is tighter = more similar" | Cluster density reflects local density + hyperparameters, not absolute similarity. |
| "Axis 1 means X" | Axes have **no semantic meaning** - no loadings like PCA. |
| "I can compare two t-SNE plots" | Different runs = different layouts. Cannot compare across runs. |

### Proper Validation
- **Trust local neighborhoods**: k-NN in embedding ≈ k-NN in original space.
- **Don't trust global distances**: Cluster separation is algorithmic artifact.
- **Run multiple times**: With different seeds; stable structures persist.
- **Quantitative**: Use trustworthiness/continuity metrics (sklearn.manifold.trustworthiness).

### Common Pitfalls
| Pitfall | Symptom | Fix |
|---------|---------|-----|
| **Perplexity too low** | Fragmented clusters, many tiny groups | Increase perplexity (30-50) |
| **Perplexity too high** | Everything merges into one blob | Decrease perplexity |
| **No PCA preprocessing** | Slow, noisy results | Always PCA to 30-50 dims first |
| **Interpreting axes** | False conclusions | Axes are meaningless - only relative positions matter |
| **Comparing runs** | Inconsistent layouts | Fix random_state; don't compare across datasets |

### Production Use Cases
1. **Visualization dashboards**: UMAP embeddings for user-facing cluster exploration.
2. **Preprocessing for clustering**: UMAP → HDBSCAN is a powerful combo.
3. **Anomaly detection**: Points far from all others in UMAP space = anomalies.
4. **Data cleaning**: Visualize label noise - mislabeled points often appear in wrong cluster.

### Scaling to Large Data
- **UMAP**: Native O(n log n) - handles 1M+ points.
- **t-SNE**: Use `openTSNE` (multicore) or **FIt-SNE** (FFT-accelerated).
- **Subsample**: Fit on 10k-50k representative points, then `transform()` (UMAP) or approximate (t-SNE).
- **Parametric t-SNE/UMAP**: Train neural net to learn mapping (allows transform for t-SNE too).

## 5. t-SNE vs UMAP Quick Reference
| Feature | t-SNE | UMAP |
|---------|-------|------|
| Speed | Slow (O(n²)) | Fast (O(n log n)) |
| Global structure | Poor | Good |
| Transform new data | ❌ (without parametric) | ✅ |
| Deterministic | With fixed seed | With fixed seed |
| Hyperparameter sensitivity | High (perplexity) | Moderate |
| Publication standard | Established | Growing |
| Memory | High | Lower |