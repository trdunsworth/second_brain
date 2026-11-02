# ANOVA (Analysis of Variance)

ANOVA is used to compare the means of **three or more** groups to see if at least one is significantly different.

## 1. Why not just use multiple T-tests?
Using multiple T-tests increases the **Family-wise Error Rate**. If you run 10 tests at $\alpha = 0.05$, the chance of at least one False Positive (Type I Error) is much higher than 5%. ANOVA controls this by performing one overall test.

## 2. Types of ANOVA
- **One-Way ANOVA**: One independent variable with 3+ levels (e.g., comparing 3 different diets).
- **Two-Way ANOVA**: Two independent variables (e.g., comparing diet AND exercise level).
- **MANOVA**: Multiple dependent variables.

## 3. The F-Statistic
ANOVA calculates the **F-ratio**:
$$F = \frac{\text{Variance BETWEEN groups}}{\text{Variance WITHIN groups}}$$
- If $F$ is large, the difference between group means is large relative to the noise within the groups.

## 4. Post-Hoc Testing
ANOVA tells you *that* a difference exists, but not *where* it is. If you reject $H_0$, you must run a Post-Hoc test to find the specific group differences:
- **Tukey's HSD**: Most common for all-pairs comparison.
- **Bonferroni Correction**: A conservative method to adjust $\alpha$.

---
**See also**: [[Hypothesis Testing Framework]] (Type I Error)