# T-Tests

T-tests are used to compare means when the population variance is **unknown** and the sample size is typically small.

## 1. Types of T-Tests

### One-Sample T-Test
- **Goal**: Compare a sample mean to a known population mean.
- **Formula**: $t = \frac{\bar{x} - \mu}{s / \sqrt{n}}$ (where $s$ is the sample standard deviation).

### Independent Two-Sample T-Test
- **Goal**: Compare the means of two independent groups (e.g., Treatment vs. Control).
- **Assumption**: Homogeneity of variance (the two groups have similar spread).

### Paired (Dependent) T-Test
- **Goal**: Compare means from the same group at different times (e.g., Before vs. After treatment).
- **Logic**: Analyzes the *difference* between pairs.

## 2. Implementation

### Python (using `scipy.stats`)
```python
from scipy import stats

group_a = [20, 22, 19, 20, 22]
group_b = [28, 30, 27, 29, 30]

# Independent T-Test
t_stat, p_val = stats.ttest_ind(group_a, group_b)
print(f"Independent T-test: t={t_stat}, p={p_val}")

# Paired T-Test
before = [10, 12, 11, 13, 12]
after = [12, 14, 13, 15, 14]
t_stat_p, p_val_p = stats.ttest_rel(before, after)
print(f"Paired T-test: t={t_stat_p}, p={p_val_p}")
```

### R
```r
group_a <- c(20, 22, 19, 20, 22)
group_b <- c(28, 30, 27, 29, 30)

# Independent T-Test
t.test(group_a, group_b, paired = FALSE)

# Paired T-Test
before <- c(10, 12, 11, 13, 12)
after <- c(12, 14, 13, 15, 14)
t.test(before, after, paired = TRUE)
```

## 3. Key Assumptions
- **Normality**: Data should be approximately normally distributed (link: [[Probability Distributions]]).
- **Independence**: Observations are independent of each other.
- **Variance**: For independent tests, variances should be similar (Levene's test is often used to check this).

## 4. Interpretation
- **Degrees of Freedom ($df$)**: $n - 1$ (for one sample).
- **T-Table**: The critical value depends on $df$ and $\alpha$.
- **Result**: If $p \leq \alpha$, reject $H_0$.

---
**See also**: [[Central Limit Theorem]], [[Hypothesis Testing Framework]]