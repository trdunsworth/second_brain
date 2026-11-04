# Statistical Tests Quick Reference

A quick reference for choosing and implementing statistical tests in R.

---

## 1. Test Selection Guide

### Decision Tree: Which Test?

```
Is your data paired/repeated?
├── YES → Paired t-test / Wilcoxon signed-rank
└── NO → Are groups independent?
    ├── YES → How many groups?
    │   ├── 2 groups → Normal? → t-test / Mann-Whitney
    │   └── 3+ groups → Normal? → ANOVA / Kruskal-Wallis
    └── NO → See paired tests above
```

---

## 2. Quick Test Reference

### Comparing Means

| Scenario | Parametric | Non-Parametric | R Function |
|----------|------------|----------------|------------|
| 1 sample vs μ | One-sample t-test | Wilcoxon signed-rank | `t.test(x, mu = 0)` / `wilcox.test(x, mu = 0)` |
| 2 independent groups | Independent t-test | Mann-Whitney U | `t.test(x, y)` / `wilcox.test(x, y)` |
| 2 paired groups | Paired t-test | Wilcoxon signed-rank | `t.test(x, y, paired=TRUE)` / `wilcox.test(x, y, paired=TRUE)` |
| 3+ groups | ANOVA | Kruskal-Wallis | `aov()` / `kruskal.test()` |
| Repeated measures | Repeated measures ANOVA | Friedman | `aov_ez()` / `friedman.test()` |

### Proportions & Categorical
| Scenario | Test | R Function |
|----------|------|------------|
| 1 proportion vs p₀ | Binomial test | `binom.test()` |
| 2 proportions | z-test / Chi-square | `prop.test()` / `chisq.test()` |
| 2×2 contingency | Fisher's exact | `fisher.test()` |
| RxC contingency | Chi-square | `chisq.test()` |
| Ordinal association | Spearman/Kendall | `cor.test(method="spearman")` |

### Correlation
| Type | Assumption | Function |
|------|------------|----------|
| Pearson | Linear, normal | `cor.test(method="pearson")` |
| Spearman | Monotonic, ordinal | `cor.test(method="spearman")` |
| Kendall | Ordinal, ties | `cor.test(method="kendall")` |
| Partial | Control for vars | `ppcor::pcor.test()` |

---

## 2. R Implementation Patterns

### 1. One-Sample / Paired Tests
```r
# One-sample t-test
t.test(x, mu = 0, alternative = "two.sided")

# Paired t-test
t.test(x, y, paired = TRUE)

# Wilcoxon signed-rank (paired)
wilcox.test(x, y, paired = TRUE)

# Sign test
library(BSDA)
SIGN.test(x, md = 0)
```

### 2. Two Independent Groups
```r
# t-test (Welch default)
t.test(x, y, var.equal = FALSE)  # Welch
t.test(x, y, var.equal = TRUE)   # Student's

# Mann-Whitney U
wilcox.test(x, y)

# Effect size
library(effectsize)
cohens_d(x, y)
hedges_g(x, y)
```

### 3. Multiple Groups
```r
# One-way ANOVA
aov_fit <- aov(value ~ group, data = df)
summary(aov_fit)

# Post-hoc
TukeyHSD(aov_fit)
pairwise.t.test(value, group, p.adjust.method = "bonferroni")

# Non-parametric
kruskal.test(value ~ group, data = df)
dunn.test::dunn.test(value, group, method = "bonferroni")
```

### 4. Repeated Measures
```r
library(afex)
library(emmeans)

# Repeated measures ANOVA
aov_ez("id", "value", df, within = c("time", "condition"))

# Post-hoc
emmeans(aov_fit, pairwise ~ time | condition, adjust = "bonferroni")

# Non-parametric
friedman.test(value ~ time | subject, data = df)
```

---

## 3. Effect Sizes

```r
library(effectsize)

# Mean differences
cohens_d(x, y)
hedges_g(x, y)
glass_delta(x, y)

# Correlation
cor_to_d(r)
d_to_r(d)

# ANOVA
eta_squared(aov_model)
omega_squared(aov_model)
epsilon_squared(aov_model)

# Proportions
oddsratio(table)
riskratio(table)
cohens_h(prop1, prop2)
```

---

## 4. Assumption Checks

### Normality
```r
# Shapiro-Wilk
shapiro.test(residuals)

# Q-Q plot
qqnorm(residuals); qqline(residuals)

# Histogram
hist(residuals)
```

### Homogeneity of Variance
```r
library(car)
leveneTest(value ~ group, data = df)
bartlett.test(value ~ group, data = df)
```

### Independence / Autocorrelation
```r
library(lmtest)
dwtest(lm_fit)  # Durbin-Watson
```

### Multicollinearity
```r
library(car)
vif(lm_fit)  # VIF > 5 concerning
```

---

## 5. Post-Hoc / Multiple Comparisons

```r
library(emmeans)
library(multcomp)

# Tukey HSD
TukeyHSD(aov_fit)

# emmeans
emm <- emmeans(model, pairwise ~ group, adjust = "tukey")
summary(emm)

# Contrasts
contrast(emm, method = "trt.vs.ctrl")

# Multcomp
glht(model, linfct = mcp(group = "Tukey"))
```

---

## 6. Model Diagnostics

```r
library(performance)
library(see)

# All-in-one
check_model(lm_fit)

# Individual
check_normality(model)
check_heteroscedasticity(model)
check_collinearity(model)  # VIF
check_autocorrelation(model)
check_outliers(model)

# Plots
plot(lm_fit)
autoplot(lm_fit)  # ggfortify
```

---

## 7. Power Analysis

```r
library(pwr)

# t-test
pwr.t.test(d = 0.5, power = 0.8, sig.level = 0.05, type = "two.sample")

# ANOVA
pwr.anova.test(k = 3, f = 0.25, sig.level = 0.05, power = 0.8)

# Correlation
pwr.r.test(r = 0.3, power = 0.8, sig.level = 0.05)

# Proportions
pwr.2p.test(h = ES.h(0.5, 0.6), power = 0.8, sig.level = 0.05)
```

---

## 7. Reporting Templates

### t-test Report
```r
report_ttest <- function(x, y, paired = FALSE) {
  test <- t.test(x, y, paired = paired)
  d <- cohens_d(x, y)
  cat(sprintf(
    "t(%d) = %.2f, p = %.4f, d = %.2f [%s]",
    test$parameter, test$statistic, test$p.value, d,
    ifelse(test$p.value < 0.05, "significant", "not significant")
  ))
}
```

### ANOVA Report
```r
report_anova <- function(model) {
  aov_sum <- summary(model)
  f_stat <- aov_sum[[1]]$`F value`[1]
  p_val <- aov_sum[[1]]$`Pr(>F)`[1]
  eta2 <- eta_squared(model)
  cat(sprintf(
    "F(%d, %d) = %.2f, p = %.4f, η² = %.3f [%s]",
    aov_sum[[1]]$Df[1], aov_sum[[1]]$Df[2], f_stat, p_val, eta2,
    ifelse(p_val < 0.05, "significant", "not significant")
  ))
}
```

---

## 8. Quick Decision Tree

```
START: What type of data?
│
├─ Continuous outcome
│   ├─ 1 group vs known value → t-test / Wilcoxon
│   ├─ 2 independent groups → t-test / Mann-Whitney
│   ├─ 2 paired groups → Paired t-test / Wilcoxon
│   ├─ 3+ independent groups → ANOVA / Kruskal-Wallis
│   └─ Repeated measures → RM ANOVA / Friedman
│
├─ Binary outcome
│   ├─ 1 sample → Binomial test
│   ├─ 2 independent groups → Chi-square / Fisher's exact
│   ├─ 2 paired groups → McNemar's test
│   └─ Multiple groups → Chi-square / Logistic regression
│
├─ Count outcome
│   ├─ Poisson regression
│   └─ Negative binomial (overdispersion)
│
├─ Time-to-event
│   └─ Cox PH / Kaplan-Meier / Log-rank
│
└─ Categorical outcome (3+ levels)
    ├─ Multinomial logistic
    └─ Ordinal logistic
```

---

## 8. Common Effect Size Benchmarks

| Effect Size | Small | Medium | Large |
|-------------|-------|--------|-------|
| **Cohen's d** | 0.2 | 0.5 | 0.8 |
| **Pearson r** | 0.1 | 0.3 | 0.5 |
| **η² (eta-sq)** | 0.01 | 0.06 | 0.14 |
| **ω² (omega-sq)** | 0.01 | 0.06 | 0.14 |
| **Cohen's f** | 0.1 | 0.25 | 0.4 |
| **Odds Ratio** | 1.5 | 2.5 | 4.3 |
| **Risk Ratio** | 1.2 | 1.5 | 2.0 |

---

## 9. Common Pitfalls

| Mistake | Solution |
|---------|----------|
| Using t-test on non-normal data | Check normality; use Wilcoxon |
| Ignoring pairing | Use paired tests for matched data |
| Multiple comparisons without correction | Apply Bonferroni, Tukey, FDR |
| Interpreting p-value as effect size | Always report effect sizes + CIs |
| Checking assumptions after p-hacking | Pre-register analysis plan |
| Dropping outliers without justification | Use robust methods instead |
| Assuming equal variances | Use Welch's t-test (default in R) |
| Post-hoc without significant ANOVA | Only if planned; otherwise exploratory |

---

## 10. Quick Commands Reference

```r
# Load all essential packages
library(tidyverse)
library(broom)
library(effectsize)
library(performance)
library(emmeans)
library(rstatix)
library(ggpubr)

# Quick EDA + test
df %>% 
  group_by(group) %>% 
  summarise(n = n(), mean = mean(y), sd = sd(y)) %>%
  t_test(y ~ group, data = ., detailed = TRUE)  # rstatix

# Quick ANOVA + post-hoc
aov(y ~ group, data = df) %>% 
  tukey_hsd() %>% 
  add_significance()

# Quick correlation matrix
cor_matrix <- df %>% 
  select(where(is.numeric)) %>% 
  correlate() %>% 
  fashion()
```

---

*Last updated: 2024-11-04*
*Companion to: 04_Advanced_Statistics_Cheatsheet.md*