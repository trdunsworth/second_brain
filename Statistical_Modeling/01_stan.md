# Stan Learning Guide

## Overview
Stan is a probabilistic programming language for Bayesian statistical modeling and probabilistic machine learning. It defines probability models through log probability density functions, then uses Hamiltonian Monte Carlo (HMC) and the No-U-Turn Sampler (NUTS) to draw samples from posterior distributions. Stan is accessed through interfaces in R (rstan, cmdstanr), Python (cmdstanpy, pystan), Julia (Turing.jl uses similar math), MATLAB, Stata, and the shell (CmdStan).

## Quick Template

```stan
// model.stan — Minimal Bayesian linear regression
data {
  int<lower=1> N;                       // number of observations
  int<lower=1> K;                       // number of predictors
  matrix[N, K] X;                       // design matrix
  vector[N] y;                          // response
}
parameters {
  vector[K] beta;                       // regression coefficients
  real<lower=0> sigma;                  // residual standard deviation
}
model {
  // Priors
  beta ~ normal(0, 5);
  sigma ~ exponential(1);

  // Likelihood
  y ~ normal(X * beta, sigma);
}
generated quantities {
  vector[N] y_rep;                      // posterior predictive draws
  y_rep = normal_rng(X * beta, sigma);
}
```

```bash
# Compile and run with CmdStan
./model sample data file=model.json output file=output.csv
```

## Core Syntax Cheatsheet

| Element | Syntax | Example |
|---------|--------|---------|
| **Comments** | `//` or `/* */` | `// this is a comment` |
| **Types** | `real`, `int`, `vector`, `matrix`, `row_vector` | `vector[N] y;` |
| **Declarations** | `<constraints> name;` | `real<lower=0> sigma;` |
| **Arrays** | `type[N] name;` or `array[N] type name;` | `array[N] int z;` |
| **Blocks** | `data`, `parameters`, `model`, `generated quantities` | See template |
| **Sampling** | `target += log_lik;` or `y ~ distribution(params);` | `y ~ normal(0, 1);` |
| **Distributions** | `*_lpdf` / `*_lpmf` | `normal_lpdf(y \| mu, sigma)` |
| **RNG** | `*_rng()` | `normal_rng(0, 1)` |
| **Transforms** | `to_vector()`, `to_matrix()` | `to_vector(X)` |
| **Math** | Standard functions | `exp()`, `log()`, `fabs()`, `pow()` |
| **Reductions** | `sum()`, `mean()`, `min()`, `max()` | `sum(y)` |
| **Matrix ops** | `*`, `transposed`, `inverse()` | `X * beta` |
| **Control flow** | `for`, `if`, `while` | `for (n in 1:N) {...}` |
| **Functions** | `functions { ... }` block | See functions section |

## Block Structure

```stan
functions {
  // User-defined functions
  real my_lpdf(real y, real mu, real sigma) {
    return normal_lpdf(y | mu, sigma);
  }
}

data {
  // Observed data (input from file/interface)
  int<lower=0> N;
  vector[N] y;
}

transformed data {
  // Deterministic transformations of data
  real y_mean = mean(y);
  vector[N] y_centered = y - y_mean;
}

parameters {
  // Unknown parameters to be sampled
  real mu;
  real<lower=0> sigma;
}

transformed parameters {
  // Deterministic functions of parameters
  real sigma_sq = square(sigma);
}

model {
  // Log posterior (priors + likelihood)
  mu ~ normal(0, 10);
  sigma ~ exponential(1);
  y ~ normal(mu, sigma);
}

generated quantities {
  // Posterior predictive draws, log-likelihood, etc.
  vector[N] log_lik;
  vector[N] y_rep;
  for (n in 1:N) {
    log_lik[n] = normal_lpdf(y[n] | mu, sigma);
    y_rep[n] = normal_rng(mu, sigma);
  }
}
```

## Types & Distributions Reference

### Data Types

| Type | Constraints | Example Declaration |
|------|-------------|-------------------|
| `int` | `lower=`, `upper=` | `int<lower=1, upper=10> k;` |
| `real` | `lower=`, `upper=` | `real<lower=0> sigma;` |
| `vector[N]` | elementwise | `vector[N] y;` |
| `row_vector[N]` | elementwise | `row_vector[N] x;` |
| `matrix[N, K]` | elementwise | `matrix[N, K] X;` |
| `array[N] int` | elementwise | `array[N] int z;` |
| `array[N] real` | elementwise | `array[N] real theta;` |
| `array[N] vector[K]` | nested | `array[N] vector[K] beta;` |
| `cholesky_factor_corr[K]` | positive definite | `matrix[K, K] L_Omega;` |

### Probability Distributions (common)

#### Continuous

| Distribution | Sampling statement | Support | Parameters |
|-------------|-------------------|---------|------------|
| Normal | `y ~ normal(mu, sigma)` | (-∞, ∞) | location, scale |
| Log-normal | `y ~ lognormal(mu, sigma)` | (0, ∞) | log-location, log-scale |
| Exponential | `y ~ exponential(lambda)` | [0, ∞) | rate |
| Gamma | `y ~ gamma(alpha, beta)` | (0, ∞) | shape, rate |
| Beta | `y ~ beta(alpha, beta)` | [0, 1] | shape, shape |
| Uniform | `y ~ uniform(a, b)` | [a, b] | lower, upper |
| Cauchy | `y ~ cauchy(mu, sigma)` | (-∞, ∞) | location, scale |
| Student-t | `y ~ student_t(nu, mu, sigma)` | (-∞, ∞) | dof, location, scale |
| Laplace | `y ~ double_exponential(mu, beta)` | (-∞, ∞) | location, scale |
| Weibull | `y ~ weibull(alpha, beta)` | (0, ∞) | shape, scale |
| Chi-squared | `y ~ chi_square(nu)` | [0, ∞) | dof |
| Pareto | `y ~ pareto(y_min, alpha)` | [y_min, ∞) | scale, shape |
| Gumbel | `y ~ gumbel(mu, beta)` | (-∞, ∞) | location, scale |
| Logistic | `y ~ logistic(mu, sigma)` | (-∞, ∞) | location, scale |
| Logit-normal | `y ~ logit_normal(mu, sigma)` | [0, 1] | log-location, log-scale |
| Kumaraswamy | `y ~ kumaraswamy(a, b)` | [0, 1] | shape, shape |

#### Discrete

| Distribution | Sampling statement | Support |
|-------------|-------------------|---------|
| Bernoulli | `y ~ bernoulli(theta)` | {0, 1} |
| Bernoulli-logit | `y ~ bernoulli_logit(alpha)` | {0, 1} (logit scale) |
| Categorical | `y ~ categorical(theta)` | {1, ..., K} |
| Categorical-logit | `y ~ categorical_logit(alpha)` | {1, ..., K} |
| Binomial | `y ~ binomial(n, theta)` | {0, ..., n} |
| Binomial-logit | `y ~ binomial_logit(n, alpha)` | {0, ..., n} |
| Poisson | `y ~ poisson(lambda)` | {0, 1, 2, ...} |
| Neg-binomial | `y ~ neg_binomial(alpha, beta)` | {0, 1, 2, ...} |
| Neg-binomial-2 | `y ~ neg_binomial_2(mu, phi)` | {0, 1, 2, ...} |
| Geometric | `y ~ geometric(p)` | {0, 1, 2, ...} |
| Hypergeometric | `y ~ hypergeometric(Ns, Nr, n)` | bounded |

## Practical Examples

### 1. Bayesian Linear Regression

```stan
// linear_regression.stan
data {
  int<lower=1> N;
  int<lower=1> K;
  matrix[N, K] X;
  vector[N] y;
}
parameters {
  vector[K] beta;
  real<lower=0> sigma;
}
transformed parameters {
  vector[N] mu = X * beta;
}
model {
  // Weakly informative priors
  beta ~ normal(0, 10);
  sigma ~ exponential(1);

  // Likelihood
  y ~ normal(mu, sigma);
}
generated quantities {
  vector[N] log_lik;
  vector[N] y_rep;
  for (n in 1:N) {
    log_lik[n] = normal_lpdf(y[n] | mu[n], sigma);
    y_rep[n] = normal_rng(mu[n], sigma);
  }
}
```

```python
# Python: run with cmdstanpy
from cmdstanpy import CmdStanModel
import numpy as np

model = CmdStanModel(stan_file="linear_regression.stan")
data = {"N": 100, "K": 3, "X": np.random.randn(100, 3), "y": np.random.randn(100)}
fit = model.sample(data=data, chains=4, parallel_chains=4)
print(fit.summary())
```

### 2. Hierarchical / Multilevel Model

```stan
// hierarchical.stan — Partial pooling for group-level effects
data {
  int<lower=1> N;                       // observations
  int<lower=1> J;                       // groups
  array[N] int<lower=1, upper=J> group; // group index
  vector[N] y;
  vector[N] x;
}
parameters {
  real alpha;                           // population intercept
  real beta;                            // population slope
  vector[J] alpha_j;                    // group intercepts
  real<lower=0> sigma;                  // observation noise
  real<lower=0> tau;                    // between-group SD
}
model {
  // Hyperpriors
  alpha ~ normal(0, 10);
  beta ~ normal(0, 5);
  sigma ~ exponential(1);
  tau ~ exponential(1);

  // Group-level priors (partial pooling)
  alpha_j ~ normal(alpha, tau);

  // Likelihood
  for (n in 1:N) {
    y[n] ~ normal(alpha_j[group[n]] + beta * x[n], sigma);
  }
}
generated quantities {
  vector[N] y_rep;
  for (n in 1:N) {
    y_rep[n] = normal_rng(alpha_j[group[n]] + beta * x[n], sigma);
  }
}
```

```stan
// hierarchical.stan — Vectorized version (faster)
data {
  int<lower=1> N;
  int<lower=1> J;
  array[N] int<lower=1, upper=J> group;
  vector[N] y;
  vector[N] x;
}
parameters {
  real alpha;
  real beta;
  vector[J] alpha_j;
  real<lower=0> sigma;
  real<lower=0> tau;
}
model {
  alpha ~ normal(0, 10);
  beta ~ normal(0, 5);
  sigma ~ exponential(1);
  tau ~ exponential(1);
  alpha_j ~ normal(alpha, tau);

  // Vectorized likelihood using group index
  y ~ normal(alpha_j[group] + beta * x, sigma);
}
```

### 3. Logistic Regression

```stan
// logistic_regression.stan
data {
  int<lower=1> N;
  int<lower=1> K;
  matrix[N, K] X;
  array[N] int<lower=0, upper=1> y;
}
parameters {
  vector[K] beta;
}
model {
  beta ~ normal(0, 2.5);               // weakly informative prior
  y ~ bernoulli_logit(X * beta);       // efficient logit link
}
generated quantities {
  vector[N] log_lik;
  array[N] int y_rep;
  for (n in 1:N) {
    log_lik[n] = bernoulli_logit_lpmf(y[n] | X[n] * beta);
    y_rep[n] = bernoulli_logit_rng(X[n] * beta);
  }
}
```

### 4. Gaussian Mixture Model

```stan
// mixture_model.stan
data {
  int<lower=1> N;
  vector[N] y;
  int<lower=1> K;                       // number of components
}
parameters {
  simplex[K] theta;                     // mixture weights (sum to 1)
  ordered[K] mu;                        // component means (ordered for identifiability)
  vector<lower=0>[K] sigma;             // component scales
}
model {
  // Priors
  theta ~ dirichlet(rep_vector(2.0, K));
  mu ~ normal(0, 10);
  sigma ~ exponential(1);

  // Marginalize over mixture assignments (efficient)
  for (n in 1:N) {
    vector[K] log_prob;
    for (k in 1:K) {
      log_prob[k] = log(theta[k]) + normal_lpdf(y[n] | mu[k], sigma[k]);
    }
    target += log_sum_exp(log_prob);
  }
}
generated quantities {
  array[N] int<lower=1, upper=K> z;     // cluster assignments
  vector[N] y_rep;
  for (n in 1:N) {
    vector[K] probs;
    for (k in 1:K) {
      probs[k] = log(theta[k]) + normal_lpdf(y[n] | mu[k], sigma[k]);
    }
    z[n] = categorical_logit_rng(log_softmax(probs));
    y_rep[n] = normal_rng(mu[z[n]], sigma[z[n]]);
  }
}
```

### 5. Time Series: Random Walk + Seasonal

```stan
// time_series.stan — Local level model
data {
  int<lower=1> N;
  vector[N] y;
  int<lower=1> n_seasons;               // e.g., 12 for monthly
}
parameters {
  real mu;                              // initial level
  real<lower=0> sigma_level;            // level innovation SD
  real<lower=0> sigma_obs;              // observation noise
  vector[n_seasons] season_raw;         // raw seasonal effects
  real<lower=0> sigma_season;           // seasonal SD
}
transformed parameters {
  vector[n_seasons] season;
  vector[N] level;

  // Non-centered seasonal effects
  season = sigma_season * season_raw;

  // Random walk level
  level[1] = mu;
  for (t in 2:N) {
    level[t] = level[t - 1] + normal_rng(0, sigma_level);
  }
}
model {
  mu ~ normal(mean(y), 10);
  sigma_level ~ exponential(1);
  sigma_obs ~ exponential(1);
  sigma_season ~ exponential(1);
  season_raw ~ std_normal();

  // Likelihood with seasonal component
  for (t in 1:N) {
    int s = ((t - 1) % n_seasons) + 1;
    y[t] ~ normal(level[t] + season[s], sigma_obs);
  }
}
```

### 6. Ordinal Regression (Proportional Odds)

```stan
// ordinal_regression.stan
data {
  int<lower=1> N;
  int<lower=1> K;                       // number of ordinal categories
  int<lower=1> P;                       // number of predictors
  matrix[N, P] X;
  array[N] int<lower=1, upper=K> y;
}
parameters {
  vector[P] beta;
  ordered[K - 1] c;                     // cutpoints (ordered)
}
model {
  beta ~ normal(0, 2.5);
  c ~ normal(0, 5);

  for (n in 1:N) {
    real log_p[K];
    real linpred = X[n] * beta;
    for (k in 1:K) {
      if (k == 1) {
        log_p[k] = -c[1] - linpred;
      } else if (k == K) {
        log_p[k] = c[K - 1] + linpred;
      } else {
        log_p[k] = log_inv_logit(c[k] + linpred)
                   - log_inv_logit(c[k - 1] + linpred);
      }
    }
    y[n] ~ categorical_logit(log_p);
  }
}
// Or use the built-in cumulative_logit:
// y[n] ~ ordered_logistic(X[n] * beta, c);
```

### 7. Gaussian Process Regression

```stan
// gp_regression.stan
data {
  int<lower=1> N;
  vector[N] x;
  vector[N] y;
  int<lower=1> N_pred;
  vector[N_pred] x_pred;
}
transformed data {
  real delta = 1e-6;                    // jitter for numerical stability
}
parameters {
  real alpha;                           // marginal SD
  real<lower=0> rho;                    // length-scale
  real<lower=0> sigma;                  // noise SD
  vector[N] eta;                        // non-centered GP
}
model {
  // Priors
  alpha ~ normal(0, 2);
  rho ~ inv_gamma(5, 5);
  sigma ~ exponential(1);
  eta ~ std_normal();

  // Non-centered GP: y = alpha * L * eta + sigma * eps
  vector[N] f = alpha * gp_exp_quad_cov(x, 1.0 / rho) * eta;
  // Simpler: use multi_normal with covariance matrix
  // matrix[N, K] cov = gp_exp_quad_cov(x, alpha, rho) + diag_matrix(rep_vector(delta, N));
  y ~ normal(f, sigma);
}
generated quantities {
  vector[N_pred] f_pred;
  // Predict at new points (requires joint distribution)
  {
    vector[N + N_pred] all_x = append_row(x, x_pred);
    matrix[N + N_pred, N + N_pred] cov = gp_exp_quad_cov(all_x, alpha, rho)
      + diag_matrix(rep_vector(delta, N + N_pred));
    matrix[N, N] cov_xx = cov[1:N, 1:N];
    matrix[N, N] L_xx = cholesky_decompose(cov_xx);
    vector[N] alpha_vec = mdivide_left_tri_low(L_xx, y);
    matrix[N, N_pred] cov_xxp = cov[1:N, (N + 1):(N + N_pred)];
    vector[N_pred] mu_pred = cov_xxp' * mdivide_left_tri_low(L_xx, alpha_vec);
    matrix[N_pred, N_pred] cov_pred = cov[(N + 1):(N + N_pred), (N + 1):(N + N_pred)];
    matrix[N_pred, N_pred] v = mdivide_left_tri_low(L_xx, cov_xxp);
    cov_pred = cov_pred - v' * v + diag_matrix(rep_vector(delta, N_pred));
    f_pred = multi_normal_rng(mu_pred, cov_pred);
  }
}
```

### 8. Survival Analysis (Weibull AFT)

```stan
// survival.stan — Weibull accelerated failure time
data {
  int<lower=1> N;
  vector[N] time;
  array[N] int<lower=0, upper=1> censored;  // 1 = right-censored
  int<lower=1> K;
  matrix[N, K] X;
}
parameters {
  vector[K] beta;
  real<lower=0> shape;                   // Weibull shape (alpha)
  real mu;                               // intercept for log-time
}
model {
  vector[N] log_time = log(time);

  // Priors
  beta ~ normal(0, 1);
  shape ~ exponential(0.5);
  mu ~ normal(0, 10);

  // Weibull AFT: log(time) ~ normal(X*beta + mu, 1/shape)
  // Equivalently, use weibull with shape and scale
  for (n in 1:N) {
    if (censored[n] == 0) {
      target += weibull_lpdf(time[n] | shape,
                             exp(-(mu + X[n] * beta) / shape) * shape);
    } else {
      target += weibull_lccdf(time[n] | shape,
                              exp(-(mu + X[n] * beta) / shape) * shape);
    }
  }
}
```

### 9. Custom Functions Block

```stan
functions {
  // Custom log-likelihood for a specialized model
  real student_t_lpdf_custom(vector y, real nu, real mu, real sigma) {
    real log_lik = 0;
    for (n in 1:size(y)) {
      log_lik += student_t_lpdf(y[n] | nu, mu, sigma);
    }
    return log_lik;
  }

  // Softmax (numerically stable)
  vector softmax_stable(vector x) {
    int K = size(x);
    vector[K] result;
    real max_x = max(x);
    for (k in 1:K) {
      result[k] = exp(x[k] - max_x);
    }
    return result / sum(result);
  }

  // Effective sample size (for diagnostics)
  real ess(array[] real draws) {
    int N = size(draws);
    real mean_draw = mean(draws);
    real var_draw = variance(draws);
    real acf_sum = 0;
    for (t in 1:(N - 1)) {
      real cov_t = 0;
      for (n in 1:(N - t)) {
        cov_t += (draws[n] - mean_draw) * (draws[n + t] - mean_draw);
      }
      acf_sum += cov_t / (N - t) / var_draw;
    }
    return N / (1 + 2 * acf_sum);
  }

  // Linear interpolation
  real interpolate(real x, vector x_grid, vector y_grid) {
    int K = size(x_grid);
    if (x <= x_grid[1]) return y_grid[1];
    if (x >= x_grid[K]) return y_grid[K];
    for (k in 1:(K - 1)) {
      if (x >= x_grid[k] && x <= x_grid[k + 1]) {
        real t = (x - x_grid[k]) / (x_grid[k + 1] - x_grid[k]);
        return y_grid[k] + t * (y_grid[k + 1] - y_grid[k]);
      }
    }
    return negative_infinity();  // should not reach
  }
}
```

### 10. Zero-Inflated Poisson

```stan
// zip.stan
data {
  int<lower=1> N;
  array[N] int<lower=0> y;
  int<lower=1> K;
  matrix[N, K] X;
}
parameters {
  vector[K] beta_logit;                 // logit of zero-inflation probability
  vector[K] beta_count;                 // log-link for count mean
}
model {
  beta_logit ~ normal(0, 2.5);
  beta_count ~ normal(0, 2.5);

  for (n in 1:N) {
    real logit_pi = X[n] * beta_logit;
    real log_lambda = X[n] * beta_count;
    real log_pi = log_inv_logit(logit_pi);
    real log_one_minus_pi = log1m_inv_logit(logit_pi);

    if (y[n] == 0) {
      // P(y=0) = pi + (1-pi) * exp(-lambda)
      target += log_sum_exp(log_pi, log_one_minus_pi + (-exp(log_lambda)));
    } else {
      target += log_one_minus_pi + poisson_log_lpmf(y[n] | log_lambda);
    }
  }
}
```

## Working with Stan in Different Environments

### CmdStan (C++ backend, most flexible)

```bash
# Compile
stanc model.stan --o=model.o
# or with make
make model

# Sample
./model sample num_samples=2000 num_warmup=1000 \
  data file=model_data.json \
  output file=model_output.csv diagnostic_file=diag.csv

# Diagnose
stansummary model_output.csv
diagnose model_output.csv

# Optimize (MAP)
./model optimize data file=model_data.json

# Variational (ADVI)
./model variational data file=model_data.json

# Generate quantities
./model generate_quantities fitted_params=model_output.csv data file=model_data.json
```

### CmdStanR (R interface, recommended)

```r
library(cmdstanr)
set_cmdstan_path("/path/to/cmdstan")

# Compile
model <- cmdstan_model("model.stan")

# Sample
fit <- model$sample(
  data = list(N = 100, y = rnorm(100)),
  chains = 4,
  parallel_chains = 4,
  iter_warmup = 1000,
  iter_sampling = 2000,
  adapt_delta = 0.95,
  max_treedepth = 12
)

# Diagnostics
fit$summary()
fit$diagnose()
fit$loo()                    # requires log_lik in generated quantities
fit$cmdstan_diagnose()

# Extract draws
draws <- fit$draws()         # posterior::draws_array
mcmc_areas(draws, pars = "mu")

# Save / load
fit$save_object("fit.rds")
fit <- readRDS("fit.rds")
```

### cmdstanpy (Python interface)

```python
import cmdstanpy
from cmdstanpy import CmdStanModel
import numpy as np

# Compile
model = CmdStanModel(stan_file="model.stan")

# Sample
fit = model.sample(
    data={"N": 100, "y": np.random.randn(100)},
    chains=4,
    parallel_chains=4,
    iter_warmup=1000,
    iter_sampling=2000,
    adapt_delta=0.95,
    max_treedepth=12
)

# Diagnostics
summary = fit.summary()
fit.diagnose()
fit.save_csvfiles("output/")

# Extract
draws = fit.draws()          # numpy array (draws, chains, columns)
fit.stan_variable("mu")      # named access

# LOO-CV
import arviz as az
az.loo(fit.draws_pd(), var_name="log_lik")
```

### rstan (legacy R interface)

```r
library(rstan)
options(mc.cores = 4)
rstan_options(auto_write = TRUE)

# Compile
stan_model <- stan_model("model.stan")

# Sample
fit <- sampling(
  stan_model,
  data = list(N = 100, y = rnorm(100)),
  chains = 4,
  iter = 2000,
  warmup = 1000,
  control = list(adapt_delta = 0.95, max_treedepth = 12)
)

# Summary
print(fit, pars = c("mu", "sigma"))
traceplot(fit, pars = c("mu", "sigma"))
shinystan::launch_shinystan(fit)
```

### PyStan (legacy Python interface)

```python
import pystan

# Deprecated — use cmdstanpy instead
# pystan 3.x is a thin wrapper around httpstan
```

### Stata / MATLAB / Julia

```stata
// Stata (statastan package)
stanbayes model.stan, data(N=100 y=y) chains(4)
```

```matlab
% MATLAB (stanematlab)
stan_model = StanModel('model.stan');
stan_model.compile();
fit = stan_model.sample('data', data_struct);
```

## Diagnostics & Convergence

### Key diagnostics

```r
library(cmdstanr)
fit <- model$sample(data = ...)

# 1. R-hat (should be < 1.01)
fit$summary(variables = "mu")$rhat

# 2. Effective sample size (bulk & tail)
fit$summary(variables = "mu")$ess_bulk
fit$summary(variables = "mu")$ess_tail

# 3. Divergences (should be 0)
fit$diagnose()

# 4. Treedepth warnings
# "Transitions exceeded max_treedepth" → increase max_treedepth

# 5. Bayesian p-values (posterior predictive check)
y_rep <- fit$draws("y_rep", format = "matrix")
y_obs <- data$y
ppc_stat(y_obs, y_rep, stat = "mean")   # bayesplot

# 6. LOO-CV
library(loo)
log_lik <- fit$draws("log_lik", format = "matrix")
loo_result <- loo(log_lik)
print(loo_result)
```

### Common issues & fixes

| Issue | Symptom | Fix |
|-------|---------|-----|
| **Divergences** | "divergent transitions" | Increase `adapt_delta`; reparameterize (non-centered) |
| **High R-hat** | `rhat > 1.01` | More iterations; check identifiability; better priors |
| **Low ESS** | `ess_bulk < 400` | More iterations; simplify model; reparameterize |
| **Max treedepth** | "treedepth exceeded" | Increase `max_treedepth` (e.g., 12 → 15) |
| **BFMI low** | "E-BFMI < 0.3" | Funnel geometry; use non-centered parameterization |
| **Posterior is prior** | Data not informing | Check likelihood coding; check data scale |

### Non-centered parameterization (funnel fix)

```stan
// Centered (problematic for hierarchical models)
parameters {
  real mu;
  real<lower=0> tau;
  vector[J] theta;
}
model {
  mu ~ normal(0, 10);
  tau ~ exponential(1);
  theta ~ normal(mu, tau);         // funnel geometry → divergences
}

// Non-centered (recommended)
parameters {
  real mu;
  real<lower=0> tau;
  vector[J] theta_raw;
}
transformed parameters {
  vector[J] theta = mu + tau * theta_raw;
}
model {
  mu ~ normal(0, 10);
  tau ~ exponential(1);
  theta_raw ~ std_normal();         // well-conditioned
}
```

## Common Stan Uses

- **Bayesian Regression** — Linear, logistic, ordinal, multilevel
- **A/B Testing** — Bayesian hypothesis testing with ROPE/HDI
- **Time Series** — State-space models, GP regression, ARIMA
- **Mixtures & Clustering** — Gaussian mixtures, latent class models
- **Survival Analysis** — Hazard models, AFT models
- **Item Response Theory** — Psychometrics, educational testing
- **Hierarchical Models** — Partial pooling, group-level variation
- **Bayesian Neural Networks** — Deep learning with uncertainty
- **Causal Inference** — Bayesian causal models, sensitivity analysis
- **Ecology** — Species abundance, occupancy-detection models
- **Epidemiology** — Disease spread, meta-analysis

## Stan Advantages

- **HMC/NUTS** — Efficient sampling for complex posteriors
- **Automatic Differentiation** — Gradients computed automatically (C++)
- **Constrained Parameters** — `<lower=0>` etc. handled via transforms
- **Type System** — Compile-time error checking
- **Vectorized** — Matrix operations are fast
- **Generated Quantities** — Posterior predictive, log_lik for LOO
- **Ecosystem** — CmdStan, R, Python, Julia, Stata, MATLAB interfaces
- **Community** — Stan Forum, Bayesian workshops, textbooks
- **Diagnose** — Built-in diagnostics (R-hat, ESS, divergences)

## Stan Pitfalls

- **Compile Time** — C++ compilation can be slow (cache with CmdStanR/Py)
- **Divergences** — Common with hierarchical models; need non-centered parameterization
- **Funnel Geometry** — Posterior geometry can trap HMC; diagnose and reparameterize
- **Discrete Parameters** — Cannot sample discrete latent variables directly; marginalize
- **Identifiability** — Label switching in mixtures; use `ordered` or constraints
- **Learning Curve** — Different syntax from R/Python; Stan-specific concepts (lpdf vs sampling)
- **Convergence** — Not automatic; must check R-hat, ESS, divergences every time

## Awesome Stan Resources

- **[Stan Documentation](https://mc-stan.org/docs/)** — Official reference (language, user guide, function reference)
- **[Stan Forums](https://discourse.mc-stan.org/)** — Active community, very responsive
- **[CmdStanR](https://mc-stan.org/cmdstanr/)** — Recommended R interface
- **[cmdstanpy](https://mc-stan.org/cmdstanpy/)** — Recommended Python interface
- **[CmdStan](https://mc-stan.org/cmdstan/)** — C++ backend
- **[Bayesian Data Analysis (BDA3)](https://stat.columbia.edu/gelman/bda/)** — Gelman et al. textbook (the Stan textbook)
- **[Statistical Rethinking](https://xcelab.net/rm/statistical-rethinking/)** — Richard McElreath (free lectures + book, Stan code)
- **[Bayes Rules!](https://www.bayesrulesbook.com/)** — Johnson et al. (free online book)
- **[Stan User Guide](https://mc-stan.org/docs/reference-guide/)** — Distributions, algorithms, advanced topics
- **[Bayesian Workflow](https://arxiv.org/abs/2011.01808)** — Gelman et al. (2020) — best practices paper
- **[posterior](https://mc-stan.org/posterior/)** — R package for posterior summaries
- **[bayesplot](https://mc-stan.org/bayesplot/)** — R package for MCMC diagnostics
- **[loo](https://mc-stan.org/loo/)** — Leave-one-out cross-validation
- **[shinystan](https://mc-stan.org/shinystan/)** — Interactive MCMC exploration
- **[tidybayes](https://mjskay.github.io/tidybayes/)** — Tidy posterior analysis
- **[brms](https://paul-buerkner.github.io/brms/)** — Bayesian regression models via Stan (formula interface)
- **[rstanarm](https://mc-stan.org/rstanarm/)** — Bayesian applied regression via Stan
- **[awesome-stan](https://github.com/stan-dev/awesome-stan)** — Curated Stan resources

## Stan vs Other Probabilistic Languages

| Feature | Stan | PyMC | Turing.jl | NumPyro | BUGS/JAGS |
|---------|------|------|-----------|---------|-----------|
| Sampling | HMC/NUTS | NUTS (PyMC3+) | HMC/NUTS | NUTS | Gibbs/MH |
| Gradients | Auto-diff (C++) | Auto-diff (JAX/PyTensor) | Auto-diff | Auto-diff (JAX) | Not required |
| Discrete params | Marginalize only | Marginalize | Supported | Marginalize | Supported |
| Speed | Very fast (C++) | Fast | Fast (Julia) | Very fast (JAX) | Slow |
| Syntax | Standalone Stan | Python | Julia | Python | Declarative |
| Compile | C++ compilation | JIT | JIT | JIT/JAX | None |
| Interfaces | R, Python, Julia, Stata, MATLAB | Python only | Julia only | Python only | R, WinBUGS |
| Best for | Production, speed | Python ecosystems | Julia users | Large-scale, GPU | Teaching, simple models |

## Stan Quick Checklist

1. **Declare constraints** — `<lower=0>`, `<upper=1>`, `simplex`, `ordered`
2. **Priors first** — Always specify priors before likelihood; use weakly informative
3. **Vectorize** — Use `y ~ normal(X * beta, sigma)` not loops when possible
4. **Non-centered parameterization** — For hierarchical/funnel models
5. **Marginalize discrete latents** — Cannot sample discrete parameters directly
6. **Use `target +=`** — For mixture models, censored data, custom likelihoods
7. **`generated quantities`** — Always include `log_lik` for LOO-CV and `y_rep` for PPC
8. **Check diagnostics** — R-hat < 1.01, ESS > 400, 0 divergences
9. **`adapt_delta`** — Increase (0.95, 0.99) if divergences occur
10. **Compare models** — Use LOO-CV, WAIC, or Bayes factors
11. **Posterior predictive checks** — Compare `y_rep` to `y` visually and statistically
12. **Report properly** — Credible intervals, posterior probabilities, not just point estimates

---

*Last updated: 2024 | Stan 2.33+ / CmdStan compatible*
