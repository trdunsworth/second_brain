# Central Limit Theorem (CLT)

The Central Limit Theorem is the cornerstone of inferential statistics. It explains why the Normal Distribution is so prevalent in data science.

## 1. The Core Concept
The CLT states that if you take sufficiently large random samples from **any** population (regardless of its original distribution), the distribution of the **sample means** will be approximately Normally distributed.

## 2. Key Requirements
- **Sample Size**: Generally, $n \geq 30$ is considered sufficient for the CLT to take effect.
- **Independence**: Samples must be independent of one another.
- **Randomness**: Samples must be randomly selected.

## 3. Mathematical Implications
If the original population has a mean $\mu$ and a standard deviation $\sigma$:
1. The mean of the sample means ($\mu_{\bar{x}}$) is equal to the population mean $\mu$.
2. The standard deviation of the sample means (the **Standard Error**) is $\frac{\sigma}{\sqrt{n}}$.
3. The shape of the distribution of sample means becomes Normal as $n$ increases.

## 4. Why It Matters
The CLT allows us to use the properties of the Normal Distribution to make inferences about a population even when we don't know if the population itself is Normally distributed. This justifies the use of T-tests and ANOVA.