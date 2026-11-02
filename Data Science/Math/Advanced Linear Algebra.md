# Advanced Linear Algebra

Advanced linear algebra extends basic matrix operations into higher-dimensional spaces and more complex decompositions, providing the mathematical architecture for modern AI.

## 1. Tensors
A tensor is a generalization of scalars, vectors, and matrices to higher dimensions.
- **Scalar**: 0th-order tensor (single number).
- **Vector**: 1st-order tensor (array of numbers).
- **Matrix**: 2nd-order tensor (grid of numbers).
- **Higher-Order Tensor**: A 3D, 4D, or $n\text{D}$ array.
- **Application**: In Deep Learning, "Tensors" (as in TensorFlow) are used to represent batches of images (Height $\times$ Width $\times$ Channels $\times$ Batch Size).

## 2. Eigen-spaces and Spectral Theory
Beyond just finding eigenvalues, spectral theory examines the properties of operators on a vector space.
- **Eigen-space**: The set of all eigenvectors associated with a specific eigenvalue.
- **Spectral Theorem**: States that a symmetric matrix can be diagonalized by an orthogonal matrix of its eigenvectors. This is the theoretical justification for PCA.

## 3. Moore-Penrose Pseudoinverse
When a matrix $\mathbf{A}$ is not square or is singular (no inverse exists), we use the pseudoinverse $\mathbf{A}^+$.
- **Formula**: $\mathbf{A}^+ = (\mathbf{A}^T\mathbf{A})^{-1}\mathbf{A}^T$ (for full column rank).
- **Application**: Used to find the "best fit" (least squares) solution to overdetermined systems $\mathbf{Ax} = \mathbf{b}$, which is the heart of Linear Regression.

---
**See also**: [[Matrix Decomposition (SVD, PCA)]], [[Linear Algebra Foundations]]