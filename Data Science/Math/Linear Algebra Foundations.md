# Linear Algebra Foundations

Linear Algebra is the language of data science. It allows us to represent large datasets as matrices and perform operations on them efficiently.

## 1. Vectors
A vector is an ordered list of numbers, representing a point in space or a magnitude and direction.

### Vector Operations
- **Addition**: $\mathbf{v} + \mathbf{w}$ (Element-wise addition).
- **Scalar Multiplication**: $c\mathbf{v}$ (Scaling the vector).
- **Dot Product**: $\mathbf{v} \cdot \mathbf{w} = \sum v_i w_i$.
    - **Insight**: The dot product measures how much one vector aligns with another. If the dot product is 0, the vectors are **orthogonal** (perpendicular).
- **Vector Norm**: The magnitude or length of a vector (usually the L2 norm: $\|\mathbf{v}\| = \sqrt{\sum v_i^2}$).

---

## 2. Matrices
A matrix is a rectangular array of numbers, which can be viewed as a collection of vectors.

### Matrix Operations
- **Matrix Addition**: Element-wise addition (matrices must be the same size).
- **Matrix Multiplication**: The dot product of rows of the first matrix and columns of the second.
    - **Condition**: The number of columns in the first matrix must equal the number of rows in the second.
- **Transpose**: Switching rows and columns ($\mathbf{A}^T$).

### Special Matrices
- **Identity Matrix ($\mathbf{I}$)**: A square matrix with 1s on the diagonal and 0s elsewhere. Acting as the "1" of matrix algebra.
- **Symmetric Matrix**: A matrix that is equal to its transpose ($\mathbf{A} = \mathbf{A}^T$).
- **Inverse Matrix ($\mathbf{A}^{-1}$)**: A matrix such that $\mathbf{A}\mathbf{A}^{-1} = \mathbf{I}$. Not all matrices have an inverse (singular matrices).

---

## 3. Systems of Linear Equations
Linear algebra allows us to solve systems of equations like:
$$\mathbf{Ax} = \mathbf{b}$$
Where $\mathbf{A}$ is a matrix of coefficients, $\mathbf{x}$ is the vector of unknowns, and $\mathbf{b}$ is the result vector. This is the basis for **Linear Regression**.

---
**See also**: [[Matrix Decomposition (SVD, PCA)]] (Intermediate Math)