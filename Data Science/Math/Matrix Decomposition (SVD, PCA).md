# Matrix Decomposition (SVD, PCA)

Matrix decomposition is the process of breaking a matrix into a product of simpler matrices. This is used in data science primarily for dimensionality reduction and noise removal.

## 1. Singular Value Decomposition (SVD)
SVD is the "Swiss Army Knife" of linear algebra. It states that any $m \times n$ matrix $\mathbf{A}$ can be factored as:
$$\mathbf{A} = \mathbf{U}\mathbf{\Sigma}\mathbf{V}^T$$

- **$\mathbf{U}$ (Left Singular Vectors)**: Orthogonal matrix. Represents the relationship between rows (observations).
- **$\mathbf{\Sigma}$ (Singular Values)**: Diagonal matrix. The values (singular values) indicate the "importance" or strength of each dimension.
- **$\mathbf{V}^T$ (Right Singular Vectors)**: Orthogonal matrix. Represents the relationship between columns (features).

### Applications of SVD:
- **Image Compression**: Keeping only the top $k$ singular values to represent an image.
- **Latent Semantic Analysis (LSA)**: Finding hidden themes in text data.

## 2. Principal Component Analysis (PCA)
PCA is a statistical procedure that uses an orthogonal transformation to convert a set of observations of possibly correlated variables into a set of values of linearly uncorrelated variables called **Principal Components**.

### How it Works:
1. **Standardization**: Center the data (mean=0, variance=1).
2. **Covariance Matrix**: Calculate how variables vary together.
3. **Eigen-decomposition**: Find the **eigenvectors** (directions of maximum variance) and **eigenvalues** (magnitude of that variance).
4. **Projection**: Project the original data onto the top $k$ eigenvectors.

### PCA vs. SVD:
While PCA is often implemented *using* SVD, PCA focuses on maximizing variance and requires centering the data first.

---
**See also**: [[Linear Algebra Foundations]], [[Pearson Correlation]] (for Covariance logic)