# Basic Calculus

Calculus is the study of continuous change. In data science, it is primarily used to optimize models (e.g., Gradient Descent).

## 1. Limits and Continuity
- **Limit**: The value a function approaches as the input approaches some value.
- **Continuity**: A function is continuous if there are no jumps or holes in its graph.

## 2. Derivatives (Differential Calculus)
A derivative measures the **instantaneous rate of change** of a function.

### Key Concepts
- **The Derivative**: $f'(x)$ or $\frac{dy}{dx}$ represents the slope of the tangent line at a point.
- **Power Rule**: $\frac{d}{dx}(x^n) = nx^{n-1}$.
- **Chain Rule**: Used for composite functions: $\frac{d}{dx} f(g(x)) = f'(g(x))g'(x)$.
- **Partial Derivatives**: In multivariable functions, the derivative with respect to one variable while keeping others constant. This is critical for training neural networks.

### Optimization
- **Critical Points**: Where the derivative is zero ($f'(x) = 0$).
- **Local Minimum/Maximum**: Found by analyzing the first and second derivatives.

---

## 3. Integrals (Integral Calculus)
An integral calculates the **accumulated area** under a curve.

### Key Concepts
- **Indefinite Integral**: The antiderivative of a function.
- **Definite Integral**: The area under the curve between two points $a$ and $b$.
- **Fundamental Theorem of Calculus**: Connects differentiation and integration.

### Relation to Statistics
The area under a Probability Density Function (PDF) is an integral. For a valid probability distribution, the total area under the curve must equal 1.

---
**See also**: [[Multivariable Calculus (Partial Derivatives, Gradients)]] (Intermediate Math), [[Probability Distributions]] (Normal Curve area)