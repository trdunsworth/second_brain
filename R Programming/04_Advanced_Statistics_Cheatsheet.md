# Advanced Statistics Cheatsheet

A comprehensive reference for advanced statistical methods in R.

---

## 1. Statistical Inference

### 1.1 Hypothesis Testing

#### Parametric Tests
```r
library(stats)
library(rstatix)

# One-sample t-test
t.test(x, mu = 0, alternative = "two.sided")

# Two-sample t-test
t.test(x, y, alternative = "two.sided", var.equal = FALSE)  # Welch's
t.test(x, y, var.equal = TRUE)  # Student's

# Paired t-test
t.test(x, y, paired = TRUE)

# One-way ANOVA
aov(y ~ group, data = df) |> summary()

# Two-way ANOVA
aov(y ~ factor1 * factor2, data = df) |> summary()

# Repeated measures ANOVA
library(afex)
aov_ez("id", "value", df, within = c("condition", "time"))

# ANCOVA
aov(value ~ group + covariate, data = df) |> summary()
```

#### Non-Parametric Tests
```r
# Wilcoxon rank-sum (Mann-Whitney)
wilcox.test(x, y)

# Wilcoxon signed-rank (paired)
wilcox.test(x, y, paired = TRUE)

# Kruskal-Wallis
kruskal.test(value ~ group, data = df)

# Friedman test (repeated measures)
friedman.test(value ~ time | subject, data = df)

# Post-hoc tests
library(rstatix)
dunn_test(value ~ group, data = df, p.adjust.method = "bonferroni")
pairwise.wilcox.test(value, group, p.adjust.method = "bonferroni")
```

### 1.2 Effect Sizes
```r
library(effectsize)

# Cohen's d
cohens_d(x, y)
cohens_d(formula = value ~ group, data = df)

# Hedge's g (bias-corrected)
hedges_g(x, y)

# Glass's delta
glass_delta(x, y)

# Rank-biserial correlation
rank_biserial(x, y)

# Odds ratio, Risk ratio
oddsratio(table)
riskratio(table)

# Eta-squared, Omega-squared
eta_squared(aov_model)
omega_squared(aov_model)

# Correlation effect sizes
cor_to_d(r)
d_to_r(d)
```

### 1.3 Confidence Intervals
```r
library(broom)

# Mean CI
t.test(x)$conf.int

# Proportion CI
prop.test(x, n)$conf.int

# Bootstrap CI
library(boot)
boot_ci <- boot(data, function(d, i) mean(d[i]), R = 1000)
boot.ci(boot_ci, type = "bca")

# Profile likelihood CI
confint(model, level = 0.95)
```

### 1.4 Power Analysis
```r
library(pwr)

# t-test power
pwr.t.test(d = 0.5, power = 0.8, sig.level = 0.05, type = "two.sample")

# ANOVA power
pwr.anova.test(k = 3, f = 0.25, sig.level = 0.05, power = 0.8)

# Correlation power
pwr.r.test(r = 0.3, power = 0.8, sig.level = 0.05)

# Sample size for proportions
pwr.2p.test(h = ES.h(0.5, 0.6), power = 0.8, sig.level = 0.05)
```

---

## 2. Regression Analysis

### 1. Linear Regression
```r
library(lmtest)
library(car)
library(broom)

# Basic linear model
lm_fit <- lm(y ~ x1 + x2 + x3, data = df)
summary(lm_fit)

# Robust standard errors
library(sandwich)
coeftest(lm_fit, vcov = vcovHC(lm_fit, type = "HC3"))

# Diagnostic plots
plot(lm_fit)
autoplot(lm_fit)  # ggfortify

# Assumption checks
library(performance)
check_model(lm_fit)  # All diagnostics

# Specific checks
check_normality(lm_fit)
check_heteroscedasticity(lm_fit)
check_collinearity(lm_fit)  # VIF
check_autocorrelation(lm_fit)  # Durbin-Watson
check_outliers(lm_fit)  # Cook's distance
```

### 2. Generalized Linear Models (GLM)
```r
# Logistic regression
glm_fit <- glm(y ~ x1 + x2, data = df, family = binomial)
summary(glm_fit)

# Poisson regression
glm_fit <- glm(count ~ x1 + x2, data = df, family = poisson)

# Negative binomial (overdispersion)
library(MASS)
glm_nb <- glm.nb(count ~ x1 + x2, data = df)

# Multinomial logistic
library(nnet)
multinom_fit <- multinom(y ~ x1 + x2, data = df)

# Ordinal logistic
library(MASS)
polr_fit <- polr(ordered_y ~ x1 + x2, data = df)

# Quasibinomial (overdispersion)
glm_qbin <- glm(y ~ x, family = quasibinomial, data = df)
```

### 3. Mixed Effects Models
```r
library(lme4)
library(lmerTest)

# Linear mixed model
lmm <- lmer(y ~ x + (1 | group), data = df)
summary(lmm)

# Random slopes
lmm_rs <- lmer(y ~ x + (x | group), data = df)

# Generalized linear mixed model
glmm <- glmer(y ~ x + (1 | group), data = df, family = binomial)

# Model comparison
anova(lmm1, lmm2)

# Effect sizes
effectsize::eta_squared(lmm)
```

### 4. Model Selection & Validation
```r
# Stepwise selection
step(lm_fit, direction = "both")
stepAIC(lm_fit, direction = "both")

# Cross-validation
library(caret)
train_control <- trainControl(method = "cv", number = 10)
cv_model <- train(y ~ ., data = df, method = "lm", trControl = train_control)

# Cross-validation with rsample
library(rsample)
cv_folds <- vfold_cv(data, v = 10)
cv_results <- fit_resamples(wf, resamples = cv_folds)
collect_metrics(cv_results)

# Bootstrap
boot_models <- bootstraps(data, times = 100) |>
  mutate(models = map(splits, ~ lm(y ~ x, data = analysis(.x))))
```

---

## 3. Advanced Regression

### 1. Regularization
```r
library(glmnet)
library(tidymodels)

# Ridge, Lasso, Elastic Net
cv_glmnet <- cv.glmnet(x = as.matrix(X), y = y, alpha = 0.5)  # Elastic net
plot(cv_glmnet)
coef(cv_glmnet, s = "lambda.min")

# With tidymodels
library(tidymodels)
glmnet_spec <- linear_reg(penalty = tune(), mixture = tune()) |>
  set_engine("glmnet") |>
  set_mode("regression")

# Cross-validation
cv_glmnet <- cv.glmnet(x = X, y = y, alpha = 0.5, nfolds = 10)
```

### 2. Non-linear Models
```r
# GAM
library(mgcv)
gam_fit <- gam(y ~ s(x1) + s(x2) + x3, data = df)
summary(gam_fit)
plot(gam_fit, pages = 1)

# GAM with interactions
gam_fit <- gam(y ~ s(x1, x2) + te(x3, x4), data = df)

# Splines
library(splines)
lm_fit <- lm(y ~ ns(x, df = 4) + z, data = df)

# Piecewise regression
library(segmented)
seg_fit <- segmented(lm(y ~ x, data = df), seg.Z = ~ x, psi = list(x = c(10, 20)))
```

### 3. Quantile Regression
```r
library(quantreg)

# Quantile regression
rq_fit <- rq(y ~ x, data = df, tau = c(0.1, 0.5, 0.9))
summary(rq_fit)
plot(rq_fit)

# Conditional quantiles
rq_fit <- rq(y ~ x, tau = seq(0.1, 0.9, by = 0.1), data = df)
plot(summary(rq_fit))
```

---

## 4. Multivariate Statistics

### 1. Principal Component Analysis (PCA)
```r
library(factoextra)
library(FactoMineR)

# PCA
pca_fit <- prcomp(df |> select(where(is.numeric)), scale. = TRUE)
summary(pca_fit)
fviz_eig(pca_fit)
fviz_pca_var(pca_fit)
fviz_pca_biplot(pca_fit)

# FactoMineR
pca_facto <- PCA(df, graph = FALSE)
fviz_pca_var(pca_facto, col.var = "contrib", gradient.cols = c("#00AFBB", "#E7B800", "#FC4E07"))
```

### 2. Factor Analysis
```r
library(psych)

# Factor analysis
fa_fit <- fa(df, nfactors = 3, rotate = "varimax", fm = "ml")
print(fa_fit, cut = 0.3)
fa.diagram(fa_fit)

# Parallel analysis
fa.parallel(df, fm = "ml", fa = "fa")
```

### 3. Cluster Analysis
```r
library(cluster)
library(factoextra)

# K-means
kmeans_fit <- kmeans(df_scaled, centers = 3, nstart = 25)
fviz_cluster(kmeans_fit, data = df_scaled)

# Hierarchical
hc <- hclust(dist(df_scaled), method = "ward.D2")
fviz_dend(hc, k = 3, rect = TRUE)

# Optimal clusters
fviz_nbclust(df_scaled, kmeans, method = "wss")
fviz_nbclust(df_scaled, kmeans, method = "silhouette")
fviz_nbclust(df_scaled, kmeans, method = "gap_stat")

# Model-based clustering
library(mclust)
mc <- Mclust(df_scaled)
summary(mc)
plot(mc, what = "classification")
```

### 4. Canonical Correlation
```r
library(CCA)
library(CCP)

# Canonical correlation
cc_fit <- cc(X, Y)
summary(cc_fit)
plt.cc(cc_fit)
```

---

## 5. Survival Analysis

### 1. Kaplan-Meier
```r
library(survival)
library(survminer)

# Kaplan-Meier
km_fit <- survfit(Surv(time, status) ~ group, data = df)
ggsurvplot(km_fit, data = df, pval = TRUE, conf.int = TRUE,
           risk.table = TRUE, surv.median.line = "hv")
```

### 2. Cox Proportional Hazards
```r
cox_fit <- coxph(Surv(time, status) ~ x1 + x2 + x3, data = df)
summary(cox_fit)

# Check proportional hazards
cox.zph(cox_fit)
ggcoxzph(cox.zph(cox_fit))

# Adjusted survival curves
ggadjustedcurves(cox_fit, data = df, variable = "group")
```

---

## 5. Bayesian Statistics

### 1. Bayesian Regression
```r
library(rstanarm)
library(brms)

# Stanarm
bayes_lm <- stan_glm(y ~ x1 + x2, data = df, family = gaussian(),
                     prior = normal(0, 1), prior_intercept = normal(0, 10))

# Brms (more flexible)
bayes_brm <- brm(y ~ x1 + x2, data = df, family = gaussian(),
                 prior = c(prior(normal(0, 1), class = "b"),
                          prior(normal(0, 10), class = "Intercept")))

# Summarize
summary(bayes_brm)
conditional_effects(bayes_brm)

# Hypothesis testing
hypothesis(bayes_brm, "x1 > 0")
```

### 2. Bayesian Model Comparison
```r
# Bayes factors
library(BayesFactor)
bf <- ttestBF(x, y, rscale = "medium")
bf

# Model comparison
bayes_factor(model1, model2)
```

---

## 6. Structural Equation Modeling

### 1. SEM with lavaan
```r
library(lavaan)
library(semPlot)

# Model specification
model <- '
  # Measurement model
  latent1 =~ x1 + x2 + x3
  latent2 =~ y1 + y2 + y3
  # Structural model
  latent2 ~ latent1 + x4
  latent1 ~~ latent2
'

# Fit model
fit <- sem(model, data = df, estimator = "MLR")
summary(fit, fit.measures = TRUE, standardized = TRUE)

# Fit indices
fitMeasures(fit, c("cfi", "tli", "rmsea", "srmr"))

# Path diagram
semPaths(fit, what = "std", layout = "tree2", 
         edge.label.cex = 0.8, nCharNodes = 0)
```

### 2. Mediation Analysis
```r
library(mediation)

# Mediation model
med_fit <- mediate(
  model.m = lm(mediator ~ treatment + covariates, data = df),
  model.y = lm(outcome ~ treatment + mediator + covariates, data = df),
  treat = "treatment",
  mediator = "mediator",
  sims = 5000
)
summary(med_fit)
```

---

## 7. Meta-Analysis

### 1. Meta-Analysis
```r
library(meta)
library(metafor)

# Fixed/random effects
meta_fit <- metagen(TE, seTE, studlab = study, data = meta_data)
meta_fit <- metagen(TE, seTE, data = meta_data, sm = "SMD")

# Random effects
meta_re <- rma(yi, vi, data = meta_data, method = "REML")

# Meta-regression
meta_reg <- rma(yi, vi, mods = ~ moderator, data = meta_data)

# Forest plot
forest(meta_fit)

# Funnel plot
funnel(meta_fit)
regtest(meta_fit)  # Egger's test
```

### 2. Publication Bias
```r
# Funnel plot asymmetry
funnel(meta_fit)
ranktest(meta_fit)  # Begg's test
regtest(meta_fit)   # Egger's test

# Trim and fill
tf <- trimfill(meta_fit)
funnel(tf)
```

---

## 8. Bootstrap & Permutation Methods

### 1. Bootstrap
```r
library(boot)

# Bootstrap function
boot_fn <- function(data, indices) {
  d <- data[indices, ]
  fit <- lm(y ~ x, data = d)
  return(coef(fit))
}

boot_results <- boot(data, boot_fn, R = 1000)
boot.ci(boot_results, type = "bca", index = 1)

# Bootstrap confidence intervals
boot.ci(boot_results, type = c("norm", "basic", "perc", "bca"))
```

### 2. Permutation Tests
```r
library(coin)

# Permutation test
independence_test(y ~ group, data = df, distribution = approximate(10000))

# Permutation t-test
oneway_test(value ~ group, data = df, distribution = "exact")

# Permutation ANOVA
aov_perm <- aovp(value ~ group, data = df)
```

---

## 9. Quick Reference

### Statistical Test Selection

| Question | Test | R Function |
|----------|------|------------|
| Compare 2 means (normal) | t-test | `t.test()` |
| Compare 2 means (non-normal) | Mann-Whitney | `wilcox.test()` |
| Paired samples | Paired t-test / Wilcoxon | `t.test(paired=TRUE)` / `wilcox.test(paired=TRUE)` |
| Compare 3+ means (normal) | ANOVA | `aov()` |
| Compare 3+ means (non-normal) | Kruskal-Wallis | `kruskal.test()` |
| Correlation (normal) | Pearson | `cor.test(method="pearson")` |
| Correlation (non-normal) | Spearman | `cor.test(method="spearman")` |
| Categorical association | Chi-square | `chisq.test()` |
| Regression (binary) | Logistic | `glm(family=binomial)` |
| Regression (count) | Poisson/NB | `glm(family=poisson)` / `glm.nb()` |
| Survival | Cox PH | `coxph()` |

---

## Key Packages Summary

| Domain | Key Packages |
|--------|--------------|
| **General** | stats, MASS, car, broom |
| **Model Selection** | caret, tidymodels, glmnet |
| **Mixed Models** | lme4, lmerTest, nlme |
| **GLM** | MASS, nnet, ordinal |
| **Survival** | survival, survminer, coxme |
| **Bayesian** | rstanarm, brms, BayesFactor |
| **SEM** | lavaan, semPlot, piecewiseSEM |
| **Meta-Analysis** | meta, metafor, dmetar |
| **Bayesian** | rstanarm, brms, BayesFactor |
| **Causal** | mediation, MatchIt, WeightIt |
| **Bootstrap** | boot, bootES |
| **Permutation** | coin, permuco |

---

## Key Takeaways

1. **Check assumptions** before interpreting results
2. **Use robust methods** when assumptions violated
4. **Report effect sizes** with confidence intervals
5. **Cross-validate** for predictive models
6. **Check model assumptions** systematically
7. **Report uncertainty** with confidence/credible intervals
7. **Pre-register** hypotheses when possible
8. **Reproduce** with renv and reproducible workflows
8. **Visualize** results for communication
9. **Document** all decisions and assumptions
10. **Replicate** findings when possible