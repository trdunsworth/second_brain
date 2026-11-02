# Optimization Basics

Optimization is the process of finding the input values that result in the minimum or maximum value of a function (usually a Cost Function or Loss Function).

## 1. Convexity
- **Convex Function**: A function where a line segment between any two points on the graph lies above or on the graph. (Shape: a bowl).
- **Why it matters**: Convex functions are guaranteed to have a **single global minimum**. Optimization is "easy" for convex problems.
- **Non-Convex**: Functions with multiple local minima (common in Deep Learning).

## 2. Constrained Optimization
Sometimes we need to optimize a function subject to certain constraints (e.g., "maximize profit given a budget of $X$").

### Lagrange Multipliers
A strategy for finding the local maxima and minima of a function subject to equality constraints.
- **Method**: Create a Lagrangian function $\mathcal{L}(x, \lambda) = f(x) - \lambda(g(x) - c)$.
- Solve for where the gradient $\nabla \mathcal{L} = 0$.

## 3. Local vs. Global Minima
- **Local Minimum**: The lowest point in a specific neighborhood.
- **Global Minimum**: The absolute lowest point across the entire domain.
- **Saddle Point**: A point where the gradient is zero, but it is not a local extremum (it looks like a mountain pass).

## 4. Convergence
Optimization is successful when the algorithm **converges**—meaning the changes in the objective function become smaller than a predefined threshold ($\epsilon$).

---
**See also**: [[Multivariable Calculus (Partial Derivatives, Gradients)]] (Gradient Descent)