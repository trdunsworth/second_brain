# Ridge & Lasso Regression (Regularization)

Regularization is a technique used to prevent **Overfitting** by adding a penalty term to the loss function. This discourages the model from relying too heavily on any one feature (keeping coefficients small).

## 1. The Problem: Overfitting
In complex models (like high-degree Polynomial Regression), coefficients $\beta$ can become huge to "force" the line through every data point. Regularization "shrinks" these coefficients.

## 2. Ridge Regression (L2 Regularization)
Adds a penalty equal to the **square** of the magnitude of coefficients.
- **Loss Function**: $\text{SSE} + \alpha \sum \beta_j^2$
- **Effect**: Shrinks all coefficients toward zero, but never exactly to zero.
- **Use Case**: When most features contribute a small amount to the outcome.

## 3. Lasso Regression (L1 Regularization)
Adds a penalty equal to the **absolute value** of the magnitude of coefficients.
- **Loss Function**: $\text{SSE} + \alpha \sum |\beta_j|$
- **Effect**: Can shrink some coefficients **exactly to zero**.
- **Use Case**: **Feature Selection**. It automatically removes unimportant features.

## 4. The Tuning Parameter ($\alpha$)
- $\alpha = 0$: Standard Linear Regression.
- $\alpha \rightarrow \infty$: All coefficients $\rightarrow 0$ (Underfitting).

## 5. Implementation

### Python (using `scikit-learn`)
```python
from sklearn.linear_model import Ridge, Lasso
import numpy as np

X = np.random.rand(100, 10)
y = np.random.rand(100)

# Ridge
ridge = Ridge(alpha=1.0)
ridge.fit(X, y)

# Lasso
lasso = Lasso(alpha=0.1)
lasso.fit(X, y)

print(f"Lasso coefficients zeroed out: {np.sum(lasso.coef_ == 0)}")
```

### R
```r
library(glmnet)

# glmnet requires matrix input
X <- as.matrix(mtcars[, -1])
y <- mtcars$mpg

# Lasso (alpha = 1)
lasso_model <- glmnet(X, y, alpha = 1)

# Ridge (alpha = 0)
ridge_model <- glmnet(X, y, alpha = 0)
```

---
**See also**: [[Optimization basics]] (Constrained Optimization/Lagrange)