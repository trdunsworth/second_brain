# Gradient Boosting Machines (XGBoost, LightGBM, CatBoost)

Gradient Boosting is a sequential ensemble method. Unlike Random Forests (which build trees in parallel), Boosting builds trees **one after another**, where each new tree tries to correct the errors of the previous one.

## 1. The Core Logic: Boosting
1. Build a simple "weak" model (usually a shallow decision tree).
2. Calculate the **Residuals** (Actual - Predicted).
3. Build a new model to predict those residuals.
4. Add the new model to the ensemble.
5. Repeat until the residuals are minimized.

## 2. Mathematical Foundations
- **[[Multivariable Calculus (Partial Derivatives, Gradients)]]**: The "Gradient" in Gradient Boosting refers to calculating the gradient of the loss function to determine how the next tree should improve the model.
- **[[Optimization basics]]**: This is essentially performing Gradient Descent in "function space."

## 3. Popular Frameworks
- **XGBoost**: Extreme Gradient Boosting. Focuses on regularization and computational speed.
- **LightGBM**: Developed by Microsoft. Uses a leaf-wise growth strategy for faster training on huge datasets.
- **CatBoost**: Developed by Yandex. Specialized in handling categorical features automatically.

## 4. Implementation

### Python (using `xgboost`)
```python
import xgboost as xgb
from sklearn.model_selection import train_test_split
import numpy as np

X = np.random.rand(100, 5)
y = np.random.randint(0, 2, 100)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Create DMatrix for XGBoost
dtrain = xgb.DMatrix(X_train, label=y_train)
dtest = xgb.DMatrix(X_test, label=y_test)

params = {'max_depth': 3, 'eta': 0.1, 'objective': 'binary:logistic'}
model = xgb.train(params, dtrain, num_boost_round=10)

preds = model.predict(dtest)
print(f"Predictions: { (preds > 0.5).astype(int) }")
```

### R
```r
library(xgboost)

# Data must be numeric matrix
X <- as.matrix(mtcars[, -1])
y <- as.numeric(mtcars$am)

# Train model
model <- xgboost(data = X, label = y, nrounds = 10, objective = "binary:logistic", verbose = 0)

# Predict
preds <- predict(model, X)
cat("Probabilities:", head(preds))
```

---
**See also**: [[Decision Trees & Random Forests]], [[Optimization basics]]