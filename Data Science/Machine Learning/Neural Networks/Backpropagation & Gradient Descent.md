# Backpropagation & Gradient Descent

Backpropagation is the algorithm for computing gradients in neural networks. It's the **chain rule of calculus** applied recursively through the computational graph.

## 1. The Computational Graph Perspective

Every operation in a neural network is a node in a directed acyclic graph (DAG).

```
x → [Linear: w*x + b] → z → [ReLU: max(0,z)] → a → [Loss] → L
```

**Forward Pass**: Compute values from inputs to loss.
**Backward Pass**: Compute gradients from loss to inputs (reverse topological order).

## 2. Chain Rule Refresher

For a composite function $y = f(g(x))$:
$$\frac{dy}{dx} = \frac{dy}{dg} \cdot \frac{dg}{dx}$$

For multiple variables:
$$\frac{\partial L}{\partial x} = \sum_i \frac{\partial L}{\partial y_i} \frac{\partial y_i}{\partial x}$$

**Backprop is just repeated application of this rule.**

---

## 3. Backpropagation Step by Step

### Single Neuron Example
$$z = w x + b$$
$$a = \sigma(z) = \max(0, z) \quad \text{(ReLU)}$$
$$L = \frac{1}{2}(a - y)^2 \quad \text{(MSE Loss)}$$

**Forward**:
1. $z = w x + b$
2. $a = \max(0, z)$
3. $L = \frac{1}{2}(a - y)^2$

**Backward** (compute $\frac{\partial L}{\partial w}, \frac{\partial L}{\partial b}$):

```
dL/da = (a - y)                           # ∂L/∂a
da/dz = 1 if z > 0 else 0                 # ∂a/∂z (ReLU derivative)
dz/dw = x                                 # ∂z/∂w
dz/db = 1                                 # ∂z/∂b

dL/dw = dL/da * da/dz * dz/dw
dL/db = dL/da * da/dz * dz/db
```

### General Layer Backward Pass

For layer $l$ with input $\mathbf{A}^{[l-1]}$, weights $\mathbf{W}^{[l]}$, output $\mathbf{A}^{[l]}$:

**Forward**:
$$\mathbf{Z}^{[l]} = \mathbf{W}^{[l]} \mathbf{A}^{[l-1]} + \mathbf{b}^{[l]}$$
$$\mathbf{A}^{[l]} = \sigma(\mathbf{Z}^{[l]})$$

**Backward** (given upstream gradient $d\mathbf{A}^{[l]}$):
$$d\mathbf{Z}^{[l]} = d\mathbf{A}^{[l]} \odot \sigma'(\mathbf{Z}^{[l]}) \quad \text{(element-wise)}$$
$$d\mathbf{W}^{[l]} = d\mathbf{Z}^{[l]} (\mathbf{A}^{[l-1]})^T$$
$$d\mathbf{b}^{[l]} = \sum_{\text{batch}} d\mathbf{Z}^{[l]}$$
$$d\mathbf{A}^{[l-1]} = (\mathbf{W}^{[l]})^T d\mathbf{Z}^{[l]} \quad \text{(pass to previous layer)}$$

---

## 4. Automatic Differentiation (Autograd)

Modern frameworks (PyTorch, TensorFlow, JAX) build the computational graph dynamically and compute gradients automatically.

### PyTorch Autograd Mechanics
```python
import torch

# Leaf tensors (inputs/parameters) - track history
w = torch.tensor(2.0, requires_grad=True)
b = torch.tensor(1.0, requires_grad=True)
x = torch.tensor(3.0)

# Forward pass builds the graph
z = w * x + b
a = torch.relu(z)
L = (a - 5.0) ** 2  # Target y=5

# Backward pass computes all gradients
L.backward()

print(f"w.grad = {w.grad}")  # ∂L/∂w
print(f"b.grad = {b.grad}")  # ∂L/∂b
# x.grad is None (not a leaf with requires_grad=True)
```

**Key Rules**:
- Only leaf tensors with `requires_grad=True` accumulate gradients
- `torch.no_grad()` context disables gradient tracking
- `.detach()` removes tensor from graph
- Gradients **accumulate** by default → must call `optimizer.zero_grad()` or `w.grad.zero_()`

---

## 5. Gradient Descent Optimizers

### Vanilla SGD
$$\theta_{t+1} = \theta_t - \eta \nabla_\theta L$$

```python
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)
```

### SGD with Momentum
$$v_{t+1} = \gamma v_t + \eta \nabla_\theta L$$
$$\theta_{t+1} = \theta_t - v_{t+1}$$

```python
optimizer = torch.optim.SGD(model.parameters(), lr=0.01, momentum=0.9, nesterov=True)
```
- **Momentum ($\gamma$)**: Accumulates velocity in consistent gradient directions
- **Nesterov**: "Look ahead" gradient evaluation (slightly better)

### Adam (Adaptive Moment Estimation) - **Default Choice**
$$m_t = \beta_1 m_{t-1} + (1-\beta_1) g_t \quad \text{(1st moment / momentum)}$$
$$v_t = \beta_2 v_{t-1} + (1-\beta_2) g_t^2 \quad \text{(2nd moment / variance)}$$
$$\hat{m}_t = m_t / (1-\beta_1^t), \quad \hat{v}_t = v_t / (1-\beta_2^t) \quad \text{(bias correction)}$$
$$\theta_{t+1} = \theta_t - \eta \frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon}$$

```python
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3, betas=(0.9, 0.999), eps=1e-8, weight_decay=1e-4)
```
- **Per-parameter adaptive learning rates**
- **Weight decay**: L2 regularization (but see AdamW below)

### AdamW (Decoupled Weight Decay) - **Recommended for Transformers**
```python
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=0.01)
```
- Weight decay applied **before** adaptive scaling (not mixed with gradient)
- Better generalization for Transformers

### Learning Rate Schedulers
```python
# Cosine annealing with warm restarts
scheduler = torch.optim.lr_scheduler.CosineAnnealingWarmRestarts(optimizer, T_0=10, T_mult=2)

# Reduce on plateau
scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=5)

# OneCycle (super-convergence)
scheduler = torch.optim.lr_scheduler.OneCycleLR(optimizer, max_lr=1e-2, steps_per_epoch=len(loader), epochs=50)

# In training loop:
scheduler.step()  # or scheduler.step(val_loss) for ReduceLROnPlateau
```

---

## 6. Gradient Flow Issues & Solutions

### Vanishing Gradients
**Cause**: Repeated multiplication of small derivatives ($<1$) through many layers.
$$\frac{\partial L}{\partial W^{[1]}} = \frac{\partial L}{\partial A^{[L]}} \prod_{l=2}^L \frac{\partial A^{[l]}}{\partial A^{[l-1]}} \frac{\partial A^{[1]}}{\partial W^{[1]}}$$

**Symptoms**:
- Early layers learn extremely slowly
- Gradients near zero for first layers
- Loss plateaus early

**Solutions**:
| Solution | How it Helps |
|----------|--------------|
| **ReLU / Leaky ReLU / GELU** | Derivative = 1 for positive inputs (no shrinking) |
| **Residual Connections** | Gradient flows through identity shortcut: $x + F(x)$ |
| **Batch Normalization** | Normalizes activations → stable gradient distribution |
| **Proper Initialization** | He init keeps variance ~1 across layers |
| **Gradient Clipping** | Prevents explosion, but doesn't fix vanishing |

### Exploding Gradients
**Cause**: Repeated multiplication of large derivatives ($>1$).
**Symptoms**: Loss = NaN, weights become huge.

**Solutions**:
```python
# Gradient clipping (norm or value)
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
# or
torch.nn.utils.clip_grad_value_(model.parameters(), clip_value=1.0)
```

### Dead Neurons (ReLU)
**Cause**: Neuron output always 0 → gradient always 0 → never recovers.
**Fix**: Leaky ReLU, PReLU, or better initialization + lower LR.

---

## 7. Practical Debugging Checklist

```python
def debug_gradients(model, loss):
    """Print gradient statistics for each layer."""
    print(f"Loss: {loss.item():.6f}")
    for name, param in model.named_parameters():
        if param.grad is not None:
            grad = param.grad.data
            print(f"{name:40s} | grad: mean={grad.mean():.2e} "
                  f"std={grad.std():.2e} max={grad.max():.2e} "
                  f"norm={grad.norm():.2e}")
        else:
            print(f"{name:40s} | NO GRADIENT")

# Usage in training loop
loss.backward()
debug_gradients(model, loss)
optimizer.step()
optimizer.zero_grad()
```

### What to Look For
| Pattern | Meaning |
|---------|---------|
| **Grad norms decreasing exponentially** | Vanishing gradients |
| **Grad norms increasing exponentially** | Exploding gradients |
| **Many zero gradients** | Dead ReLUs, or frozen layers |
| **Gradients all same magnitude** | Healthy flow (roughly) |
| **First layer grads << last layer grads** | Vanishing (common in deep nets) |

---

## 8. Advanced: Gradient Accumulation (Large Batch Simulation)

```python
accumulation_steps = 4
optimizer.zero_grad()

for i, (X_batch, y_batch) in enumerate(loader):
    logits = model(X_batch)
    loss = criterion(logits, y_batch) / accumulation_steps  # Normalize
    loss.backward()
    
    if (i + 1) % accumulation_steps == 0:
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        optimizer.zero_grad()
        scheduler.step()
```

---

## 9. Second-Order Methods (Rarely Used in Deep Learning)

| Method | Idea | Why Not Used |
|--------|------|--------------|
| **Newton's Method** | Use Hessian $\nabla^2 L$ | $O(n^2)$ memory, $O(n^3)$ compute |
| **L-BFGS** | Approximate inverse Hessian | Memory heavy, line search needed |
| **K-FAC** | Kronecker-factored approx | Complex, marginal gains vs Adam |

**First-order methods (SGD, Adam) dominate because:**
- Stochastic gradients are noisy → Hessian estimates unreliable
- High-dimensional non-convex landscapes → saddle points more problematic than curvature
- Compute/memory efficiency critical for large models

---

## 10. Summary: Optimizer Selection Guide

| Scenario | Recommended Optimizer |
|----------|----------------------|
| **General default** | AdamW (lr=1e-3 to 3e-4, wd=0.01-0.1) |
| **Transformers / LLMs** | AdamW + cosine warmup + linear decay |
| **CNNs (Vision)** | SGD + momentum (0.9) + cosine annealing |
| **Reinforcement Learning** | Adam (often with lower lr) |
| **Sparse gradients (embeddings)** | Adam / AdaGrad |
| **Simple convex problems** | L-BFGS (full batch) |
| **Memory constrained** | SGD (no momentum buffer) |