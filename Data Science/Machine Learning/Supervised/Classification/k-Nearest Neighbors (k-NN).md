# k-Nearest Neighbors (k-NN)

k-NN is a non-parametric, "lazy learning" algorithm. It does not learn a mathematical function; instead, it stores the entire training dataset and makes predictions based on similarity.

## 1. How it Works
To classify a new data point:
1. Calculate the **distance** between the new point and all points in the training set.
2. Pick the **k** closest points (the nearest neighbors).
3. Perform a "majority vote"—the new point is assigned to the class most common among its neighbors.

## 2. Mathematical Foundations
- **[[Linear Algebra Foundations]]**: Distance is the core of k-NN. Common metrics include:
    - **Euclidean Distance**: $d = \sqrt{\sum(x_i - y_i)^2}$ (Straight line).
    - **Manhattan Distance**: $d = \sum|x_i - y_i|$ (City block).
    - **Cosine Similarity**: Measures the angle between vectors (useful for text data).
- **[[Probability Theory Basics]]**: The "majority vote" is essentially calculating the conditional probability $P(\text{Class} | \text{Nearest Neighbors})$.

## 3. The "k" Hyperparameter
- **Small k (e.g., k=1)**: Very sensitive to noise and outliers. High variance (**Overfitting**).
- **Large k**: Smoother boundaries, but can include points from other classes. High bias (**Underfitting**).

## 4. Implementation

### Python (using `scikit-learn`)
```python
from sklearn.neighbors import KNeighborsClassifier
import numpy as np

X = np.array([[1, 2], [1, 1], [5, 8], [6, 9]])
y = np.array([0, 0, 1, 1])

knn = KNeighborsClassifier(n_neighbors=3)
knn.fit(X, y)

print(f"Prediction for [2, 2]: {knn.predict([[2, 2]])}")
```

### R
```r
library(class)

train_X <- matrix(c(1, 2, 1, 1, 5, 8, 6, 9), ncol=2, byrow=TRUE)
train_y <- c(0, 0, 1, 1)
test_X <- matrix(c(2, 2), ncol=2)

knn.predict <- knn(train = train_X, test = test_X, cl = train_y, k = 3)
print(knn.predict)
```

---
**See also**: [[Pearson Correlation]] (for distance-related concepts)