# Polynomial Regression

Polynomial Regression is used when the relationship between the independent and dependent variables is non-linear. It transforms the original features into polynomial features to fit a curve instead of a straight line.

## 1. The Model
Instead of a straight line, we use a polynomial of degree $d$:
$$y = \beta_0 + \beta_1 x + \beta_2 x^2 + \dots + \beta_d x^d + \epsilon$$

While the relationship between $x$ and $y$ is non-linear, the model is still considered a **linear model** because it is linear in terms of the coefficients $\beta$.

## 2. The Trade-off: Overfitting vs. Underfitting
The choice of degree $d$ is critical:
- **Underfitting (Low $d$)**: The model is too simple to capture the pattern (High Bias).
- **Overfitting (High $d$)**: The model fits the noise in the data rather than the signal (High Variance). It looks perfect on training data but fails on new data.

## 3. Implementation

### Python (using `scikit-learn`)
```python
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
import numpy as np

X = np.array([1, 2, 3, 4, 5]).reshape(-1, 1)
y = np.array([1, 4, 9, 16, 25]) # Perfect quadratic relationship

# Create a pipeline: Transform to polynomial then run Linear Regression
degree = 2
model = make_pipeline(PolynomialFeatures(degree), LinearRegression())
model.fit(X, y)

print(f"Prediction for 6: {model.predict([[6]])}") # Should be ~36
```

### R
```r
X <- c(1, 2, 3, 4, 5)
y <- c(1, 4, 9, 16, 25)

# Using the poly() function for a 2nd degree polynomial
model <- lm(y ~ poly(X, 2, raw=TRUE))

summary(model)
```

---
**Next Step**: [[Ridge & Lasso Regression (Regularization)]] (How to stop overfitting)