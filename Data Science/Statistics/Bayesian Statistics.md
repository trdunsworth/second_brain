# Bayesian Statistics

Bayesian statistics is an alternative to the "Frequentist" approach. While Frequentists treat parameters as fixed and data as random, Bayesians treat parameters as random variables with a probability distribution.

## 1. The Core Philosophy
In Bayesian terms, we don't just ask "Is the p-value < 0.05?", but rather "Given the data I've seen, what is the probability that my hypothesis is true?"

## 2. Bayes' Theorem
The mathematical foundation of this approach:
$$P(\theta|D) = \frac{P(D|\theta) P(\theta)}{P(D)}$$

- **$P(\theta|D)$ (The Posterior)**: The probability of the parameter $\theta$ given the data $D$. This is what we want to find.
- **$P(D|\theta)$ (The Likelihood)**: The probability of the data given the parameter.
- **$P(\theta)$ (The Prior)**: Our prior belief about the parameter before seeing the data.
- **$P(D)$ (The Evidence)**: The total probability of the data under all possible parameters.

## 3. Key Differences: Frequentist vs. Bayesian

| Feature | Frequentist | Bayesian |
| :--- | :--- | :--- |
| **Parameter** | Fixed, unknown constant | Random variable with a distribution |
| **Probability** | Long-run frequency of events | Degree of belief/certainty |
| **Conclusion** | P-values, Confidence Intervals | Posterior Distributions, Credible Intervals |
| **Prior Knowledge** | Ignored (Data speaks for itself) | Explicitly incorporated via the "Prior" |

## 4. Practical Application: Credible Intervals
Unlike a Confidence Interval (which says "if we repeated this 100 times, 95 intervals would contain the true mean"), a **Bayesian Credible Interval** says "there is a 95% probability that the true mean lies within this range."