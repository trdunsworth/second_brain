# Mann-Whitney U Test

The Mann-Whitney U Test (also known as the Wilcoxon Rank-Sum Test) is the non-parametric alternative to the Independent Two-Sample T-Test.

## 1. When to Use
- **Goal**: Compare the differences between two independent groups.
- **Data Type**: Ordinal data or continuous data that **violates normality** assumptions.
- **Assumption**: The distributions of the two groups have a similar shape.

## 2. How it Works (The Logic)
Instead of comparing **means**, the Mann-Whitney U test compares **ranks**. 
1. All data from both groups are combined and ranked from smallest to largest.
2. The ranks for each group are summed.
3. If one group has significantly higher ranks than the other, we reject the null hypothesis.

## 3. Implementation

### Python (using `scipy.stats`)
```python
from scipy import stats

group_a = [1, 2, 3, 4, 5]
group_b = [10, 11, 12, 13, 14]

u_stat, p_val = stats.mannwhitneyu(group_a, group_b)
print(f"U-statistic: {u_stat}, p-value: {p_val}")
```

### R
```r
group_a <- c(1, 2, 3, 4, 5)
group_b <- c(10, 11, 12, 13, 14)

wilcox.test(group_a, group_b)
```

## 4. Hypothesis Framework
- **$H_0$**: The distributions of both groups are identical.
- **$H_a$**: One group tends to have higher/lower values than the other.

---
**Parametric Alternative**: [[T-Tests]] (Independent)
**See also**: [[Probability Distributions]] (Non-Normal distributions)