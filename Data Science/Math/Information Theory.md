# Information Theory

Information Theory quantifies the amount of information in a signal or a dataset. It provides the objective functions (loss functions) used to train most machine learning models.

## 1. Entropy ($H$)
Entropy measures the average amount of "surprise" or uncertainty in a random variable.
- **Formula**: $H(X) = -\sum P(x_i) \log P(x_i)$
- **Intuition**: High entropy means high uncertainty (uniform distribution). Low entropy means high predictability.

## 2. Cross-Entropy
Cross-entropy measures the difference between two probability distributions: the true distribution $P$ and the predicted distribution $Q$.
- **Formula**: $H(P, Q) = -\sum P(x_i) \log Q(x_i)$
- **Application**: The most common loss function for classification tasks in Neural Networks. Minimizing cross-entropy maximizes the likelihood of the correct class.

## 3. Kullback-Leibler (KL) Divergence
KL Divergence measures how much one probability distribution diverges from a second, reference distribution.
- **Insight**: Unlike cross-entropy, KL divergence is a measure of "distance" (though it is not a symmetric distance metric).
- **Application**: Used in Variational Autoencoders (VAEs) and t-SNE to ensure a learned distribution matches a target distribution.

---
**See also**: [[Probability Theory Basics]], [[Optimization basics]] (Minimizing Loss)