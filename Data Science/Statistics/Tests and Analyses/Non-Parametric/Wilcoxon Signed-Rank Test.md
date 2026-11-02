# Wilcoxon Signed-Rank Test

The Wilcoxon Signed-Rank Test is the non-parametric alternative to the Paired T-Test.

## 1. When to Use
- **Goal**: Compare two related samples, matched samples, or repeated measurements on a single sample.
- **Data Type**: Ordinal or continuous data that is not normally distributed.

## 2. How it Works
1. Calculate the **difference** between each pair of observations.
2. Rank the absolute values of these differences.
3. Apply the original sign (+ or -) to the ranks.
4. Sum the positive and negative ranks. If the sums are wildly different, the result is significant.

## 3. Hypothesis Framework
- **$H_0$**: The median difference between pairs is zero.
- **$H_a$**: The median difference is not zero.

---
**Parametric Alternative**: [[T-Tests]] (Paired)
**See also**: [[Hypothesis Testing Framework]]