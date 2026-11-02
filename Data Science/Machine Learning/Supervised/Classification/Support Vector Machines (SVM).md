# Support Vector Machines (SVM)

SVM is a powerful classifier that searches for the **Optimal Hyperplane**—the boundary that maximizes the "margin" between two classes.

## 1. Core Concepts
- **Hyperplane**: A decision boundary that separates classes. In 2D it's a line; in 3D it's a plane; in $n\text{D}$ it's a hyperplane.
- **Support Vectors**: The data points closest to the hyperplane. They are the "critical" points that define the boundary.
- **The Margin**: The distance between the hyperplane and the nearest support vectors. SVM aims to maximize this margin to improve generalization.

## 2. The "Kernel Trick"
What happens if the data is not linearly separable? SVM uses a **Kernel Function** to project the data into a higher-dimensional space where a linear boundary *can* be found.
- **Linear Kernel**: No transformation.
- **Polynomial Kernel**: Creates curved boundaries.
- **RBF (Radial Basis Function)**: Creates "circular" or "blob" boundaries. Extremely flexible.

## 3. Mathematical Foundations
- **[[Linear Algebra Foundations]]**: The hyperplane is defined as $\mathbf{w}^T\mathbf{x} - b = 0$.
- **[[Optimization basics]]**: SVM is a constrained optimization problem (maximizing the margin subject to the constraint that all points are on the correct side).
- **[[Multivariable Calculus (Partial Derivatives, Gradients)]]**: Solving for the hyperplane involves calculating gradients of the lagrangian.

## 4. Implementation

### Python (using `scikit-learn`)
```python
from sklearn import svm
import numpy as np

X = np.array([[0, 0], [1, 1], [1, 0], [0, 1]])
y = np.array([0, 1, 0, 1]) # XOR-like problem

# Use 'rbf' kernel for non-linear boundaries
clf = svm.SVC(kernel='rbf')
clf.fit(X, y)

print(f"Prediction: {clf.predict([[0.5, 0.5]])}")
```

### R
```r
library(e1071)

X <- matrix(c(0, 0, 1, 1, 1, 0, 0, 1), ncol=2, byrow=TRUE)
y <- c(0, 1, 0, 1)

# Fit SVM with RBF kernel
model <- svm(X, y, kernel = "radial")

predict(model, matrix(c(0.5, 0.5), ncol=2))
```

---
**See also**: [[Matrix Decomposition (SVD, PCA)]] (for dimensionality issues in SVM)