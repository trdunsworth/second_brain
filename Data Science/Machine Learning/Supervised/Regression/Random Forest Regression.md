# Random Forest Regression

Random Forest is an ensemble learning method that constructs a multitude of decision trees and outputs the average prediction of the individual trees.

## 1. From Decision Trees to Forests
- **Decision Tree**: Splits data into branches based on feature thresholds. Prone to extreme overfitting.
- **Bagging (Bootstrap Aggregating)**: Creating multiple versions of the training set by sampling with replacement.
- **Random Forest**: A collection of trees where each tree is trained on a random subset of data AND a random subset of features.

## 2. Why it Works (The Wisdom of the Crowd)
By averaging the results of many "weak" (overfit) trees, the **variance** of the model is reduced without increasing the **bias**. This is a la a "committee" decision.

## 3. Key Hyperparameters
- **n_estimators**: Number of trees in the forest.
- **max_depth**: Maximum depth of each tree (controls overfitting).
- **min_samples_split**: Minimum samples required to split a node.

## 4. Implementation

### Python (using `scikit-learn`)
```python
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import numpy as np

X = np.random.rand(100, 5)
y = np.random.rand(100)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

rf = RandomForestRegressor(n_estimators=100, max_depth=5)
rf.fit(X_train, y_train)

print(f"Train Score: {rf.score(X_train, y_train)}")
print(f"Test Score: {rf.score(X_test, y_test)}")
```

### R
```r
library(randomForest)

# Using the built-in iris dataset but predicting a numeric value
data(iris)
rf_model <- randomForest(Sepal.Length ~ ., data=iris)

print(rf_model)
```

---
**See also**: [[Discrete Math Basics]] (Graph Theory/Tree structures)