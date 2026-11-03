# Principal Component Analysis (PCA)

PCA is a linear dimensionality reduction technique that projects high-dimensional data onto a lower-dimensional subspace while preserving maximum variance.

## 1. The Goal
Reduce $D$ features → $K$ features ($K \ll D$) where new features (Principal Components) are:
- **Uncorrelated** (orthogonal)
- **Ordered** by variance explained (PC1 > PC2 > ...)
- **Linear combinations** of original features

## 2. Mathematical Foundation
1. **Standardize**: Center (mean=0) and scale (variance=1) each feature.
2. **Covariance Matrix**: $\Sigma = \frac{1}{n-1} X^T X$
3. **Eigen-decomposition**: $\Sigma v = \lambda v$
   - Eigenvectors $v$ = Principal Components (directions)
   - Eigenvalues $\lambda$ = Variance explained by each PC
4. **Projection**: $X_{reduced} = X V_K$ where $V_K$ = top $K$ eigenvectors

**Equivalently via SVD**: $X = U \Sigma V^T$ → PCs are rows of $V^T$.

## 3. Implementation

### Python (using `sklearn`)
```python
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import numpy as np
import matplotlib.pyplot as plt

X = np.random.rand(200, 10)  # 200 samples, 10 features

# 1. ALWAYS standardize first!
X_scaled = StandardScaler().fit_transform(X)

# 2. Fit PCA
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)

# 3. Explained variance
print(f"Variance ratio per PC: {pca.explained_variance_ratio_}")
print(f"Cumulative: {np.cumsum(pca.explained_variance_ratio_)}")

# 4. Visualize
plt.scatter(X_pca[:, 0], X_pca[:, 1])
plt.xlabel('PC1')
plt.ylabel('PC2')
plt.show()

# 5. Feature contributions (loadings)
loadings = pd.DataFrame(pca.components_.T, columns=['PC1', 'PC2'], index=feature_names)
```

### R
```r
X <- matrix(runif(2000), ncol=10)

# prcomp centers & scales with scale.=TRUE
pca_res <- prcomp(X, center=TRUE, scale.=TRUE)

# Variance explained
summary(pca_res)

# Plot
biplot(pca_res, scale=0)  # Shows both samples and variables
```

## 4. Choosing Number of Components (K)

### Methods
| Method | How it Works |
|--------|--------------|
| **Cumulative Variance** | Choose smallest K where cumulative ≥ 80-95% |
| **Elbow (Scree) Plot** | Plot eigenvalues; find where slope flattens |
| **Kaiser Rule** | Keep components with eigenvalue > 1 (only for correlation matrix) |
| **Cross-Validation** | Reconstruct data from PCs; minimize reconstruction error |
| **Downstream Task** | Choose K that maximizes downstream model performance |

```python
# Scree plot
plt.plot(range(1, 11), pca.explained_variance_ratio_, 'o-')
plt.xlabel('Component')
plt.ylabel('Explained Variance Ratio')
plt.show()

# Cumulative
plt.plot(range(1, 11), np.cumsum(pca.explained_variance_ratio_), 'o-')
plt.axhline(y=0.95, color='r', linestyle='--')
plt.show()
```

## 5. Practical Considerations

### When PCA Works Well
- **Correlated features**: Redundant information compressed efficiently.
- **Noise reduction**: Small-variance PCs often capture noise; dropping them denoises data.
- **Visualization**: 2D/3D plots of high-dimensional data.
- **Preprocessing for ML**: Reduces overfitting, speeds up training, helps with multicollinearity.

### When PCA Fails
| Scenario | Why | Alternative |
|----------|-----|-------------|
| **Non-linear structure** | PCA finds linear subspaces only | Kernel PCA, UMAP, t-SNE |
| **Class separation needed** | Maximizes variance, not class separability | LDA (Linear Discriminant Analysis) |
| **Categorical data** | Mean/covariance meaningless | MCA (Multiple Correspondence Analysis) |
| **Sparse data (text)** | Covariance matrix dense/large | TruncatedSVD (LSA) |
| **Interpretability critical** | PCs are linear combos - hard to explain | Feature selection, sparse PCA |

### Critical Preprocessing
1. **StandardScaler**: Mandatory. Features on different scales → large-scale features dominate PCs.
2. **Remove outliers**: Outliers distort covariance matrix → use RobustScaler or remove first.
3. **Handle missing values**: PCA requires complete data → impute first.
4. **Consider whitening**: `PCA(whiten=True)` scales PCs to unit variance - useful for some downstream algorithms (e.g., ICA, K-Means).

### Interpreting Principal Components
- **Loadings** (`pca.components_`): Correlation between original features and PCs.
- **High absolute loading** = feature strongly contributes to that PC.
- **Biplot**: Visualize both samples (points) and features (arrows) in PC space.

```python
# Feature importance for PC1
pc1_loadings = pd.Series(pca.components_[0], index=feature_names).sort_values(key=abs, ascending=False)
print(pc1_loadings.head(10))
```

### Common Pitfalls
| Pitfall | Consequence | Fix |
|---------|-------------|-----|
| **Skipping scaling** | Large-scale features dominate | Always StandardScaler |
| **Using PCA for feature selection** | PCs are combinations, not original features | Use loadings to guide selection, or use Lasso/Tree importance |
| **Assuming PCs are meaningful** | Mathematical constructs, not necessarily real concepts | Validate with domain experts |
| **Ignoring reconstruction error** | Information loss may hurt downstream task | Check `pca.inverse_transform()` reconstruction quality |
| **Applying to test data incorrectly** | Must use training scaler + training PCA fit | Pipeline: `Pipeline([('scaler', StandardScaler()), ('pca', PCA())])` |

### Production Pipeline
```python
from sklearn.pipeline import Pipeline
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# Correct: scaler and PCA fitted only on training data
pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('pca', PCA(n_components=0.95))  # Keep 95% variance
])

X_train_pca = pipe.fit_transform(X_train)
X_test_pca = pipe.transform(X_test)  # Only transform!
```

### Variants
- **IncrementalPCA**: For datasets larger than RAM (partial_fit).
- **KernelPCA**: Non-linear PCA using kernel trick.
- **SparsePCA**: Adds L1 penalty for interpretable components.
- **TruncatedSVD**: For sparse matrices (text data - LSA).
- **RandomizedPCA**: Approximate but faster for large n_samples.

## 6. PCA vs Other Methods
| Method | Linear? | Preserves | Use For |
|--------|---------|-----------|---------|
| **PCA** | ✅ | Global variance | Preprocessing, noise reduction, viz |
| **t-SNE** | ❌ | Local structure | Visualization only |
| **UMAP** | ❌ | Local + global | Visualization + general reduction |
| **LDA** | ✅ | Class separation | Supervised dimensionality reduction |
| **Autoencoder** | ❌ | Complex non-linear | Deep learning pipelines |