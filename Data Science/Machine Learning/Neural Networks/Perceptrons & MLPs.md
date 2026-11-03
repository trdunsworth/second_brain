# Perceptrons & Multi-Layer Perceptrons (MLP)

The Perceptron is the atomic unit of neural networks. An MLP stacks perceptrons into layers to approximate any continuous function (Universal Approximation Theorem).

## 1. The Perceptron (Single Neuron)

### Mathematical Model
$$z = \mathbf{w}^T \mathbf{x} + b$$
$$\hat{y} = \sigma(z)$$

- **$\mathbf{x} \in \mathbb{R}^n$**: Input feature vector
- **$\mathbf{w} \in \mathbb{R}^n$**: Weights (learnable)
- **$b \in \mathbb{R}$**: Bias (learnable)
- **$\sigma$**: Activation function (non-linearity)
- **$\hat{y}$**: Output (scalar for binary classification, probability)

### Activation Functions
| Function | Formula | Range | Use Case |
|----------|---------|-------|----------|
| **Sigmoid** | $\frac{1}{1+e^{-z}}$ | (0, 1) | Binary classification output |
| **Tanh** | $\frac{e^z - e^{-z}}{e^z + e^{-z}}$ | (-1, 1) | Hidden layers (legacy) |
| **ReLU** | $\max(0, z)$ | [0, ∞) | **Default for hidden layers** |
| **Leaky ReLU** | $\max(0.01z, z)$ | (-∞, ∞) | Avoids "dead neurons" |
| **GELU** | $z \cdot \Phi(z)$ | (-∞, ∞) | Transformers, modern architectures |
| **Softmax** | $\frac{e^{z_i}}{\sum_j e^{z_j}}$ | (0, 1), sums to 1 | Multi-class output |

**Why ReLU?** Computationally cheap, mitigates vanishing gradient, sparse activation.

---

## 2. Multi-Layer Perceptron (MLP) Architecture

### Structure
- **Input Layer**: $n$ features (no computation, just passes data)
- **Hidden Layers**: $L$ layers with $h_1, h_2, ..., h_L$ neurons each
- **Output Layer**: $k$ neurons (1 for regression/binary, $k$ for $k$-class)

### Forward Pass (Matrix Form)
For layer $l$:
$$\mathbf{Z}^{[l]} = \mathbf{W}^{[l]} \mathbf{A}^{[l-1]} + \mathbf{b}^{[l]}$$
$$\mathbf{A}^{[l]} = \sigma(\mathbf{Z}^{[l]})$$

- $\mathbf{W}^{[l]} \in \mathbb{R}^{h_l \times h_{l-1}}$: Weight matrix
- $\mathbf{b}^{[l]} \in \mathbb{R}^{h_l}$: Bias vector
- $\mathbf{A}^{[0]} = \mathbf{X}$: Input data (batch size $m$, features $n$)
- $\mathbf{A}^{[L]} = \hat{\mathbf{Y}}$: Predictions

### Universal Approximation Theorem
> A feedforward network with **one hidden layer** containing a finite number of neurons can approximate **any continuous function** on compact subsets of $\mathbb{R}^n$, given appropriate weights.

**Implication**: Depth (multiple hidden layers) isn't theoretically necessary for expressivity, but **deep networks learn hierarchical representations more efficiently** (exponential parameter savings).

---

## 3. Implementation

### Python (PyTorch - Recommended for Learning)
```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# 1. Define MLP
class MLP(nn.Module):
    def __init__(self, input_dim, hidden_dims, output_dim, dropout=0.1):
        super().__init__()
        layers = []
        prev_dim = input_dim
        
        for h_dim in hidden_dims:
            layers.append(nn.Linear(prev_dim, h_dim))
            layers.append(nn.ReLU())
            layers.append(nn.BatchNorm1d(h_dim))  # Stabilizes training
            layers.append(nn.Dropout(dropout))
            prev_dim = h_dim
        
        layers.append(nn.Linear(prev_dim, output_dim))
        self.network = nn.Sequential(*layers)
    
    def forward(self, x):
        return self.network(x)

# 2. Hyperparameters
input_dim = 20
hidden_dims = [128, 64, 32]
output_dim = 1  # Binary classification
batch_size = 64
learning_rate = 1e-3
epochs = 50

# 3. Data
X_train = torch.randn(1000, input_dim)
y_train = torch.randint(0, 2, (1000, 1)).float()
train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=batch_size, shuffle=True)

# 4. Model, Loss, Optimizer
model = MLP(input_dim, hidden_dims, output_dim)
criterion = nn.BCEWithLogitsLoss()  # Combines Sigmoid + BCE (numerically stable)
optimizer = optim.Adam(model.parameters(), lr=learning_rate, weight_decay=1e-4)

# 5. Training Loop
model.train()
for epoch in range(epochs):
    epoch_loss = 0
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        logits = model(X_batch)
        loss = criterion(logits, y_batch)
        loss.backward()
        optimizer.step()
        epoch_loss += loss.item()
    
    if epoch % 10 == 0:
        print(f"Epoch {epoch}: Loss = {epoch_loss/len(train_loader):.4f}")

# 6. Inference
model.eval()
with torch.no_grad():
    logits = model(X_test)
    probs = torch.sigmoid(logits)
    preds = (probs > 0.5).int()
```

### Python (TensorFlow/Keras - Production Friendly)
```python
import tensorflow as tf
from tensorflow.keras import layers, models, regularizers

def build_mlp(input_dim, hidden_dims, output_dim, dropout=0.1):
    inputs = tf.keras.Input(shape=(input_dim,))
    x = inputs
    
    for h_dim in hidden_dims:
        x = layers.Dense(h_dim, 
                         kernel_regularizer=regularizers.l2(1e-4))(x)
        x = layers.BatchNormalization()(x)
        x = layers.ReLU()(x)
        x = layers.Dropout(dropout)(x)
    
    outputs = layers.Dense(output_dim, activation='sigmoid')(x)
    return models.Model(inputs, outputs)

model = build_mlp(20, [128, 64, 32], 1)
model.compile(optimizer=tf.keras.optimizers.Adam(1e-3),
              loss='binary_crossentropy',
              metrics=['accuracy', tf.keras.metrics.AUC()])

history = model.fit(X_train, y_train, 
                    batch_size=64, epochs=50, 
                    validation_split=0.2,
                    callbacks=[tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True)])
```

### R (torch package)
```r
library(torch)

# Define model
mlp <- nn_module(
  "MLP",
  initialize = function(input_dim, hidden_dims, output_dim) {
    layers <- list()
    prev_dim <- input_dim
    for (h_dim in hidden_dims) {
      layers <- append(layers, list(
        nn_linear(prev_dim, h_dim),
        nn_relu(),
        nn_batch_norm1d(h_dim),
        nn_dropout(0.1)
      ))
      prev_dim <- h_dim
    }
    layers <- append(layers, list(nn_linear(prev_dim, output_dim)))
    self$network <- nn_sequential(!!!layers)
  },
  forward = function(x) {
    self$network(x)
  }
)

model <- mlp(20, c(128, 64, 32), 1)
criterion <- nn_bce_with_logits_loss()
optimizer <- optim_adam(model$parameters, lr = 1e-3)

# Training loop similar to PyTorch
```

---

## 4. Practical Design Guidelines

### Hidden Layer Sizing
| Heuristic | Formula | Notes |
|-----------|---------|-------|
| **Rule of thumb** | $h \approx \frac{2}{3}(n_{in} + n_{out})$ | Starting point |
| **Power of 2** | 32, 64, 128, 256, 512 | Hardware friendly (GPU memory alignment) |
| **Funnel** | Decreasing: 512 → 256 → 128 → 64 | Compresses representation |
| **Bottleneck** | Small middle layer | Forces feature learning (autoencoder style) |

### Depth vs Width
- **Wide + Shallow**: More parameters, harder to optimize, memorizes
- **Narrow + Deep**: Fewer parameters, better generalization, hierarchical features
- **Modern default**: 3-5 hidden layers, decreasing width

### Regularization (Critical for MLPs)
| Technique | Implementation | When to Use |
|-----------|----------------|-------------|
| **Dropout** | `nn.Dropout(p=0.1-0.5)` | Always in hidden layers |
| **BatchNorm** | `nn.BatchNorm1d` | After Linear, before ReLU |
| **Weight Decay** | `optimizer(..., weight_decay=1e-4)` | L2 regularization |
| **Early Stopping** | Monitor val loss, patience=5-10 | Always |
| **Label Smoothing** | `BCEWithLogitsLoss(label_smoothing=0.1)` | Noisy labels |

### Common Failure Modes
| Symptom | Diagnosis | Fix |
|---------|-----------|-----|
| **Loss = NaN** | Exploding gradients | Gradient clipping (`clip_grad_norm_`), lower LR |
| **Loss flat, accuracy 50%** | Dead ReLU (all weights negative) | Leaky ReLU, better init (He init), lower LR |
| **Train loss << Val loss** | Overfitting | More dropout, weight decay, less capacity |
| **Train loss = Val loss = high** | Underfitting | More layers/width, longer training, higher LR |
| **Oscillating loss** | LR too high | Reduce LR, add LR scheduler |

---

## 5. Initialization Matters

```python
def init_weights(m):
    if isinstance(m, nn.Linear):
        # He initialization for ReLU
        nn.init.kaiming_normal_(m.weight, nonlinearity='relu')
        if m.bias is not None:
            nn.init.zeros_(m.bias)

model.apply(init_weights)
```

| Activation | Initialization | PyTorch |
|------------|----------------|---------|
| ReLU / Leaky ReLU | He (Kaiming) Normal | `kaiming_normal_` |
| Tanh / Sigmoid | Xavier (Glorot) Normal | `xavier_normal_` |
| GELU | He or Xavier | `kaiming_normal_` |

---

## 6. MLP for Different Tasks

| Task | Output Layer | Loss Function |
|------|--------------|---------------|
| **Binary Classification** | 1 neuron, Sigmoid | `BCEWithLogitsLoss` |
| **Multi-class Classification** | $k$ neurons, Softmax | `CrossEntropyLoss` |
| **Multi-label Classification** | $k$ neurons, Sigmoid | `BCEWithLogitsLoss` |
| **Regression** | 1 neuron, Linear | `MSELoss` / `HuberLoss` |
| **Ordinal Regression** | $k$ neurons, custom | Ordinal loss (CORAL) |

---

## 7. When NOT to Use MLPs
- **Image data** → Use CNNs (spatial invariance, parameter sharing)
- **Sequential data** → Use RNNs/Transformers (temporal modeling)
- **Graph data** → Use GNNs (structure awareness)
- **Very high-dimensional sparse data** → Use Embeddings + MLP (e.g., NLP, Recommenders)
- **Tabular data with complex interactions** → **MLPs work well!** (often beat tree-based models with proper tuning)

## 8. Modern MLP Variants
- **Residual MLP**: Add skip connections (`x + layer(x)`) for very deep MLPs
- **GLU/GeGLU Variants**: Gated Linear Units (used in Transformers)
- **Kolmogorov-Arnold Networks (KANs)**: Learnable activation functions on edges
- **Tabular Transformers**: Treat features as tokens, use attention (TabTransformer, FT-Transformer)