# Logistic Regression

Despite its name, Logistic Regression is a **classification** algorithm. It predicts the probability that a given input belongs to a specific category (usually binary).

## 1. The Model
Logistic regression takes a linear combination of features and passes it through the **Sigmoid (Logistic) Function** to squash the output between 0 and 1.

### The Equation
$$z = \beta_0 + \beta_1 x_1 + \dots + \beta_n x_n$$
$$P(y=1) = \sigma(z) = \frac{1}{1 + e^{-z}}$$

- **$z$**: The "logit" or log-odds (basically a Linear Regression).
- **$\sigma(z)$**: The Sigmoid function, which converts the linear output into a probability.

## 2. Mathematical Foundations
- **[[Linear Algebra Foundations]]**: Used for the linear combination of weights and features.
- **[[Probability Distributions]]**: The output is interpreted as a Bernoulli distribution (Success/Failure).
- **[[Information Theory]]**: Unlike Linear Regression (which uses MSE), Logistic Regression uses **Cross-Entropy Loss** (Log Loss) to penalize wrong predictions.
- **[[Multivariable Calculus (Partial Derivatives, Gradients)]]**: Gradient Descent is used to find the $\beta$ values that minimize the Cross-Entropy loss.

## 3. Decision Boundary
To turn a probability into a class, we use a **threshold** (usually 0.5):
- If $P \geq 0.5 \rightarrow$ Class 1
- If $P < 0.5 \rightarrow$ Class 0

## 4. Implementation

### Python (using `scikit-learn`)
```python
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix
import numpy as np

X = np.array([[1], [2], [3], [4], [5], [6], [7], [8]])
y = np.array([0, 0, 0, 0, 1, 1, 1, 1])

model = LogisticRegression()
model.fit(X, y)

# Predict class and probability
pred = model.predict([[5.5]])
prob = model.predict_proba([[5.5]])
print(f"Prediction: {pred}, Probability: {prob[0][1]}")
```

### R
```r
X <- c(1, 2, 3, 4, 5, 6, 7, 8)
y <- c(0, 0, 0, 0, 1, 1, 1, 1)

# Use glm with family="binomial" for logistic regression
model <- glm(y ~ X, family = binomial)

# Predict probability
prob <- predict(model, data.frame(X=5.5), type="response")
cat("Probability:", prob)
```

---
**Next Step**: [[k-Nearest Neighbors (k-NN)]] (Distance-based classification)