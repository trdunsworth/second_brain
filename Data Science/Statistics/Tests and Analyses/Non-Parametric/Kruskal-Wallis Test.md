# Kruskal-Wallis Test

The Kruskal-Wallis Test is the non-parametric alternative to the One-Way ANOVA.

## 1. When to Use
- **Goal**: Compare three or more independent groups.
- **Data Type**: Ordinal or non-normal continuous data.

## 2. How it Works
Similar to Mann-Whitney, it uses **ranks** instead of means. It tests whether the samples originate from the same distribution. It is essentially an extension of the Mann-Whitney U test for $>2$ groups.

## 3. Post-Hoc Testing
Like ANOVA, Kruskal-Wallis tells you *that* a difference exists, but not *where*. 
- **Dunn's Test**: The most common post-hoc test used after a significant Kruskal-Wallis result to identify which specific groups differ.

---
**Parametric Alternative**: [[ANOVA]]
**See also**: [[Hypothesis Testing Framework]] (Type I Error / Family-wise Error)