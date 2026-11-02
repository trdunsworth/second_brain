# Linear Regression (Simple & Multiple)

Linear Regression is the most fundamental supervised learning algorithm. It models the relationship between a dependent variable (target) and one or more independent variables (features) by fitting a linear equation to observed data.

## 1. The Model
### Simple Linear Regression (One Feature)
$$y = \beta_0 + \beta_1 x + \epsilon$$
- $y$: Target (Dependent variable)
- $x$: Feature (Independent variable)
- $\beta_0$: Y-intercept (Bias)
- $\beta_1$: Slope (Coefficient/Weight)
- $\epsilon$: Error term (Noise)

### Multiple Linear Regression (Many Features)
$$\mathbf{y} = \mathbf{X}\beta + \epsilon$$
This is where Linear Algebra takes over. $\mathbf{X}$ is a matrix of features, and $\beta$ is a vector of coefficients.

## 2. Mathematical Foundations
This model is the practical application of several of your foundation notes:
- **[[Linear Algebra Foundations]]**: Used for matrix multiplication $\mathbf{X}\beta$.
- **[[Optimization basics]]**: The goal is to minimize the **Sum of Squared Errors (SSE)**.
- **[[Multivariable Calculus (Partial Derivatives, Gradients)]]**: Gradient Descent is used to find the optimal $\beta$ values by calculating the partial derivative of the loss function with respect to each weight.
- **[[Inferential Statistics]]**: We use p-values to determine if a specific coefficient $\beta_i$ is statistically significant.

## 3. Key Evaluation Metrics
- **Mean Absolute Error (MAE)**: Average of absolute differences between predicted and actual.
- **Mean Squared Error (MSE)**: Average of squared differences (penalizes large outliers).
- **R-Squared ($R^2$)**: The proportion of variance in $y$ explained by $x$. (Link: [[Pearson Correlation]]).

## 4. Implementation

### Python (using `scikit-learn`)
```python
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

# Data: X must be a 2D array
X = np.array([[1], [2], [3], [4], [5]]) 
y = np.array([1.2, 1.9, 3.2, 3.8, 5.1])

model = LinearRegression()
model.fit(X, y)

predictions = model.predict(X)
print(f"Coefficient: {model.coef_[0]}, Intercept: {model.intercept_}")
print(f"R2 Score: {r2_score(y, predictions)}")
```

### R
```r
X <- c(1, 2, 3, 4, 5)
y <- c(1.2, 1.9, 3.2, 3.8, 5.1)

# Fit the model
model <- lm(y ~ X)

# Summary provides p-values for coefficients (Linking to [[Hypothesis Testing Framework]])
summary(model)

# Predictions
predictions <- predict(model, data.frame(X=X))
```

---
**Next Step**: [[Polynomial Regression]] (for non-linear relationships)