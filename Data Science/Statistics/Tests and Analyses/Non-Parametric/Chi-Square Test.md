# Chi-Square Test ($\chi^2$)

The Chi-Square test is used for categorical data to determine if there is a significant association between two categorical variables.

## 1. Types of Chi-Square Tests

### Test of Independence
- **Goal**: Determine if two categorical variables are independent.
- **Example**: Is "Gender" independent of "Voting Preference"?
- **Logic**: Compares the **Observed** frequencies in a contingency table to the **Expected** frequencies (what we would expect if the variables were independent).

### Goodness-of-Fit Test
- **Goal**: Determine if a sample distribution fits a theoretical distribution.
- **Example**: Does a die land on each face 1/6th of the time?

## 2. Implementation

### Python (using `scipy.stats`)
```python
from scipy import stats
import numpy as np

# Contingency table: [ [Group1_Yes, Group1_No], [Group2_Yes, Group2_No] ]
observed = np.array([[10, 20], [30, 15]])

chi2, p, dof, expected = stats.chi2_contingency(observed)
print(f"Chi2: {chi2}, p-value: {p}")
```

### R
```r
# Create a contingency table
observed <- matrix(c(10, 30, 20, 15), nrow = 2)
colnames(observed) <- c("Yes", "No")
rownames(observed) <- c("Group1", "Group2")

chisq.test(observed)
```

## 3. Assumptions
- **Categorical Data**: Variables must be nominal or ordinal.
- **Expected Frequency**: Usually, all expected cell counts should be $\geq 5$ for the test to be valid.

## 4. Interpretation
- **Large $\chi^2$ value**: Significant difference between observed and expected frequencies $\rightarrow$ Reject $H_0$.

---
**See also**: [[Probability Distributions]] (Poisson/Binomial for expected counts)