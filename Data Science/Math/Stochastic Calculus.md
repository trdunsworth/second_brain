# Stochastic Calculus

Stochastic calculus is the study of integration and differentiation of stochastic processes (random variables that evolve over time). It is the primary tool for quantitative finance and complex physics.

## 1. Random Walks and Brownian Motion
- **Random Walk**: A process where the next state is a random step from the current state.
- **Brownian Motion (Wiener Process)**: The continuous-time limit of a random walk.
    - Characterized by: $W_0 = 0$, independent increments, and $W_t - W_s \sim N(0, t-s)$.

## 2. Itô's Lemma
The "Fundamental Theorem of Calculus" for stochastic processes. Since Brownian motion is nowhere differentiable in the classical sense, Itô's Lemma provides a way to find the derivative of a function of a stochastic process.
- **Insight**: It adds a second-order term (involving the second derivative) that accounts for the volatility of the random process.

## 3. Stochastic Differential Equations (SDEs)
SDEs describe systems that evolve with a deterministic "drift" and a random "diffusion" (noise).
- **General Form**: $dX_t = \mu(X_t, t)dt + \sigma(X_t, t)dW_t$
- **Drift ($\mu$)**: The predictable trend.
- **Diffusion ($\sigma$)**: The random noise/volatility.

---
**See also**: [[Time Series Analysis]] (Statistics), [[Basic Calculus]]