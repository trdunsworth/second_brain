# Decision Trees & Random Forests (Classification)

Decision Trees use a flowchart-like structure to classify data. Random Forests improve this by creating an ensemble of trees.

## 1. Decision Trees
A tree splits the data into subsets based on the feature that provides the most "information gain."

### Splitting Criteria
- **Gini Impurity**: Measures how often a randomly chosen element would be incorrectly labeled.
- **Entropy**: Measures the "disorder" or uncertainty. (Link: [[Information Theory]]).
- **Information Gain**: The decrease in entropy after a split.

## 2. Random Forest Classification
A single decision tree is prone to **Overfitting** (High Variance). A Random Forest solves this by:
1. **Bagging**: Training each tree on a random bootstrap sample of the data.
2. **Feature Randomness**: Each split only considers a random subset of features.
3. **Voting**: The final class is the one most predicted by the collective of trees.

## 3. Implementation

### Python (using `scikit-learn`)
```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import numpy as np

X = np.random.rand(100, 5)
y = np.random.randint(0, 2, 100)

rf = RandomForestClassifier(n_estimators=100, max_depth=5)
rf.fit(X, y)

print(f"Accuracy: {accuracy_score(y, rf.predict(X))}")
```

### R
```r
library(randomForest)

data(iris)
# Predict Species (Factor)
rf_model <- randomForest(Species ~ ., data=iris)

print(rf_model)
```

---
**See also**: [[Information Theory]] (Entropy), [[Discrete Math Basics]] (Tree structures)