# Multivariable Calculus (Partial Derivatives, Gradients)

In data science, we rarely deal with functions of a single variable. Most models have thousands or millions of parameters, requiring multivariable calculus.

## 1. Partial Derivatives
A partial derivative is the derivative of a multivariable function with respect to one variable, while all other variables are held constant.
- **Notation**: $\frac{\partial f}{\partial x}$
- **Intuition**: It tells you the slope of the function if you move only in the $x$-direction.

## 2. The Gradient ($\nabla$)
The gradient is a vector containing all the partial derivatives of a function.
$$\nabla f = \begin{bmatrix} \frac{\partial f}{\partial x_1} \\ \frac{\partial f}{\partial x_2} \\ \vdots \\ \frac{\partial f}{\partial x_n} \end{bmatrix}$$

- **Key Property**: The gradient vector always points in the direction of the **steepest ascent**.
- **Negative Gradient**: $-\nabla f$ points in the direction of the **steepest descent**.

## 3. Gradient Descent
The most famous algorithm in ML. It uses the gradient to iteratively find the minimum of a cost function $J(\theta)$.
- **Update Rule**: $\theta_{new} = \theta_{old} - \eta \nabla J(\theta)$
- **$\eta$ (Learning Rate)**: Controls the size of the step we take.

## 4. The Hessian Matrix
The Hessian is a square matrix of second-order partial derivatives.
- It describes the **curvature** of the function.
- Used to determine if a critical point is a local minimum, maximum, or saddle point.

---
**See also**: [[Basic Calculus]] (Chain Rule), [[Optimization basics]]