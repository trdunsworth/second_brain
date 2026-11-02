# Probability Distributions

A probability distribution is a mathematical function that describes the likelihood of obtaining the possible values that a random variable can take.

## 1. Discrete Probability Distributions
Used for countable outcomes (e.g., number of heads in a coin flip).

### Bernoulli Distribution
- **Description**: The simplest distribution. A single trial with two possible outcomes: Success (1) or Failure (0).
- **Parameter**: $p$ (probability of success).
- **Example**: A single coin flip.

### Binomial Distribution
- **Description**: The sum of $n$ independent Bernoulli trials.
- **Parameters**: $n$ (number of trials), $p$ (probability of success).
- **Formula**: $P(X=k) = \binom{n}{k} p^k (1-p)^{n-k}$
- **Example**: Number of heads in 10 coin flips.

### Poisson Distribution
- **Description**: The number of events occurring within a fixed interval of time or space.
- **Parameter**: $\lambda$ (average rate of occurrence).
- **Formula**: $P(X=k) = \frac{\lambda^k e^{-\lambda}}{k!}$
- **Example**: Number of emails received per hour.

---

## 2. Continuous Probability Distributions
Used for measurable outcomes (e.g., height, time, temperature).

### Normal (Gaussian) Distribution
- **Description**: The "Bell Curve." Symmetric around the mean.
- **Parameters**: $\mu$ (mean), $\sigma$ (standard deviation).
- **Key Property**: Defined by the Probability Density Function (PDF). Most common distribution in nature.
- **Example**: Human heights, IQ scores.

### Student's t-Distribution
- **Description**: Similar to the Normal distribution but with "heavier tails." 
- **Usage**: Used when the sample size is small ($n < 30$) or the population variance is unknown.
- **Parameter**: $\nu$ (degrees of freedom).

### Exponential Distribution
- **Description**: Describes the time between events in a Poisson process.
- **Parameter**: $\lambda$ (rate).
- **Example**: Time until the next customer enters a store.

---

## 3. The Bridge: Z-Scores and Standardization

### The Z-Score
The Z-score represents how many standard deviations a data point is from the mean.
- **Formula**: $z = \frac{x - \mu}{\sigma}$
- **Purpose**: Allows us to compare data from different distributions by converting them to a common scale.

### Standard Normal Distribution
A specific Normal distribution where $\mu = 0$ and $\sigma = 1$. 
- Any Normal distribution can be converted to the Standard Normal distribution using the Z-score formula.
- **The 68-95-99.7 Rule (Empirical Rule)**:
    - $\sim 68\%$ of data falls within $\pm 1\sigma$
    - $\sim 95\%$ of data falls within $\pm 2\sigma$
    - $\sim 99.7\%$ of data falls within $\pm 3\sigma$