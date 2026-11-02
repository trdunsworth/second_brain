# Z-Test

The Z-test is a parametric hypothesis test used to determine whether there is a significant difference between sample and population means in large samples.

## 1. When to Use
- **Sample Size**: Large ($n \geq 30$).
- **Population Variance**: The population standard deviation ($\sigma$) is **known**.
- **Distribution**: The data follows a Normal Distribution (or the sample size is large enough for the CLT to apply).

## 2. Hypothesis Framework
- **$H_0$**: The sample mean is equal to the population mean ($\bar{x} = \mu$).
- **$H_a$**: The sample mean is not equal to the population mean ($\bar{x} \neq \mu$).

## 3. The Formula
The Z-score is the test statistic:
$$z = \frac{\bar{x} - \mu}{\sigma / \sqrt{n}}$$

## 4. Implementation

### Python (using `statsmodels`)
```python
from statsmodels.stats.weightstats import ztest
import numpy as np

data = np.array([10, 12, 9, 11, 12, 10, 15, 11, 10, 12]) # Sample
pop_mean = 10.5 # Population mean to test against

z_stat, p_val = ztest(data, value=pop_mean)
print(f'Z-statistic: {z_stat}, p-value: {p_val}')
```

### R
```r
# For a one-sample Z-test (manual calculation as R's t.test is more common)
data <- c(10, 12, 9, 11, 12, 10, 15, 11, 10, 12)
pop_mean <- 10.5
pop_sd <- 1.2 # Population SD must be known for Z-test
n <- length(data)

z_stat <- (mean(data) - pop_mean) / (pop_sd / sqrt(n))
p_val <- 2 * (1 - pnorm(abs(z_stat)))
cat("Z-statistic:", z_stat, "p-value:", p_val)
```

## 5. Interpretation
- **Compare to Critical Value**: For $\alpha = 0.05$ (two-tailed), the critical values are $\pm 1.96$.
- **Decision**: If $|z| > 1.96$, reject $H_0$.
- **P-value**: The probability of seeing a $z$ this extreme if $H_0$ were true.

---
**See also**: [[Probability Distributions]] (Normal Distribution), [[Hypothesis Testing Framework]]