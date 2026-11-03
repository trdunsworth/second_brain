# Recurrent Neural Networks (RNNs) & LSTMs

RNNs process **sequential data** by maintaining a hidden state that captures information from previous time steps.

## 1. Vanilla RNN

### Forward Pass
$$h_t = \tanh(W_{hh} h_{t-1} + W_{xh} x_t + b_h)$$
$$y_t = W_{hy} h_t + b_y$$

- $x_t \in \mathbb{R}^{d}$: Input at time $t$
- $h_t \in \mathbb{R}^{h}$: Hidden state (memory)
- $y_t$: Output at time $t$

### Unrolled Computational Graph
```
x_0 → [RNN] → h_0 → y_0
         ↓
x_1 → [RNN] → h_1 → y_1
         ↓
x_2 → [RNN] → h_2 → y_2
         ↓
        ...
```

**Problem**: Backpropagation Through Time (BPTT) multiplies gradients across time steps:
$$\frac{\partial h_t}{\partial h_{t-1}} = W_{hh}^T \text{diag}(1 - h_t^2)$$
- If $\|W_{hh}\| < 1$ → **Vanishing gradients** (can't learn long dependencies)
- If $\|W_{hh}\| > 1$ → **Exploding gradients**

---

## 2. LSTM (Long Short-Term Memory)

LSTM introduces **gates** to control information flow, solving vanishing gradients.

### Architecture
```
                    ┌──────────────────────────────┐
                    │          Cell State C_t       │  ← "Conveyor belt" (linear flow)
                    └──────────────────────────────┘
                              ↑
         ┌────────────────────┼────────────────────┐
         ↓                    ↓                    ↓
    ┌─────────┐         ┌─────────┐         ┌─────────┐
    │ Forget  │         │ Input   │         │ Output  │
    │  Gate   │         │  Gate   │         │  Gate   │
    │ f_t = σ │         │ i_t = σ │         │ o_t = σ │
    └─────────┘         └─────────┘         └─────────┘
         │                    │                    │
         ↓                    ↓                    ↓
      C_{t-1} ◄─────────── C̃_t = tanh        h_t = o_t ⊙ tanh(C_t)
```

### Equations
$$\mathbf{f}_t = \sigma(\mathbf{W}_f [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_f) \quad \text{(Forget gate)}$$
$$\mathbf{i}_t = \sigma(\mathbf{W}_i [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_i) \quad \text{(Input gate)}$$
$$\tilde{\mathbf{C}}_t = \tanh(\mathbf{W}_C [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_C) \quad \text{(Candidate values)}$$
$$\mathbf{C}_t = \mathbf{f}_t \odot \mathbf{C}_{t-1} + \mathbf{i}_t \odot \tilde{\mathbf{C}}_t \quad \text{(Cell state update)}$$
$$\mathbf{o}_t = \sigma(\mathbf{W}_o [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_o) \quad \text{(Output gate)}$$
$$\mathbf{h}_t = \mathbf{o}_t \odot \tanh(\mathbf{C}_t) \quad \text{(Hidden state)}$$

### Why It Works
- **Cell state $\mathbf{C}_t$** has **linear self-connection** ($\mathbf{f}_t \odot \mathbf{C}_{t-1}$)
- Gradient can flow unchanged when $f_t \approx 1$: $\frac{\partial C_t}{\partial C_{t-1}} = f_t$
- **Gates learn what to remember/forget**

---

## 3. GRU (Gated Recurrent Unit)

Simplified LSTM with 2 gates instead of 3.

$$\mathbf{z}_t = \sigma(\mathbf{W}_z [\mathbf{h}_{t-1}, \mathbf{x}_t]) \quad \text{(Update gate)}$$
$$\mathbf{r}_t = \sigma(\mathbf{W}_r [\mathbf{h}_{t-1}, \mathbf{x}_t]) \quad \text{(Reset gate)}$$
$$\tilde{\mathbf{h}}_t = \tanh(\mathbf{W} [\mathbf{r}_t \odot \mathbf{h}_{t-1}, \mathbf{x}_t]) \quad \text{(Candidate)}$$
$$\mathbf{h}_t = (1 - \mathbf{z}_t) \odot \mathbf{h}_{t-1} + \mathbf{z}_t \odot \tilde{\mathbf{h}}_t$$

| Aspect | LSTM | GRU |
|--------|------|-----|
| **Parameters** | 4 × (h×h + h×d) | 3 × (h×h + h×d) |
| **Memory** | Separate cell state | Merged |
| **Speed** | Slower | Faster |
| **Performance** | Slightly better on long seq | Comparable on most tasks |

---

## 4. Bidirectional RNNs

Process sequence forward and backward, concatenate hidden states.

$$\overrightarrow{h}_t = \text{RNN}_{\text{fwd}}(\overrightarrow{h}_{t-1}, x_t)$$
$$\overleftarrow{h}_t = \text{RNN}_{\text{bwd}}(\overleftarrow{h}_{t+1}, x_t)$$
$$h_t = [\overrightarrow{h}_t; \overleftarrow{h}_t]$$

**Use when**: Full sequence available (NLP classification, not real-time generation).

---

## 5. Implementation (PyTorch)

### Basic LSTM
```python
import torch
import torch.nn as nn

class LSTMModel(nn.Module):
    def __init__(self, input_dim, hidden_dim, num_layers, output_dim, dropout=0.2, bidirectional=False):
        super().__init__()
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.bidirectional = bidirectional
        self.num_directions = 2 if bidirectional else 1
        
        self.lstm = nn.LSTM(
            input_dim, hidden_dim, num_layers,
            batch_first=True, dropout=dropout if num_layers > 1 else 0,
            bidirectional=bidirectional
        )
        self.fc = nn.Linear(hidden_dim * self.num_directions, output_dim)
    
    def forward(self, x):
        # x: (batch, seq_len, input_dim)
        # h0, c0: (num_layers * num_directions, batch, hidden_dim)
        h0 = torch.zeros(self.num_layers * self.num_directions, x.size(0), self.hidden_dim).to(x.device)
        c0 = torch.zeros(self.num_layers * self.num_directions, x.size(0), self.hidden_dim).to(x.device)
        
        out, (hn, cn) = self.lstm(x, (h0, c0))
        
        # For classification: use last hidden state
        # out: (batch, seq_len, hidden_dim * num_directions)
        out = self.fc(out[:, -1, :])  # Last time step
        return out

# Usage
model = LSTMModel(input_dim=100, hidden_dim=128, num_layers=2, output_dim=10, bidirectional=True)
```

### Packed Sequences (Variable Length)
```python
from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence

def forward(self, x, lengths):
    # x: (batch, max_len, input_dim) - padded
    # lengths: (batch,) - actual lengths
    
    # Sort by length descending (required)
    lengths, sort_idx = lengths.sort(descending=True)
    x = x[sort_idx]
    
    # Pack
    packed = pack_padded_sequence(x, lengths.cpu(), batch_first=True)
    
    # LSTM
    packed_out, (hn, cn) = self.lstm(packed)
    
    # Unpack
    out, _ = pad_packed_sequence(packed_out, batch_first=True)
    
    # Unsort
    _, unsort_idx = sort_idx.sort()
    out = out[unsort_idx]
    hn = hn[:, unsort_idx, :]
    
    return out, hn
```

### Sequence Classification (Many-to-One)
```python
# Use last hidden state (or mean/max pooling over time)
def forward(self, x, lengths=None):
    out, (hn, cn) = self.lstm(x)
    
    if self.bidirectional:
        # Concatenate forward last + backward first
        hn_forward = hn[-2]  # Last layer forward
        hn_backward = hn[-1]  # Last layer backward
        last_hidden = torch.cat([hn_forward, hn_backward], dim=1)
    else:
        last_hidden = hn[-1]  # Last layer
    
    return self.fc(last_hidden)
```

### Sequence Generation (One-to-Many)
```python
def generate(self, start_token, max_len=50, temperature=1.0):
    self.eval()
    with torch.no_grad():
        hidden = None
        input_token = start_token
        generated = []
        
        for _ in range(max_len):
            out, hidden = self.lstm(input_token.unsqueeze(1), hidden)
            logits = self.fc(out.squeeze(1)) / temperature
            probs = F.softmax(logits, dim=-1)
            next_token = torch.multinomial(probs, 1)
            generated.append(next_token.item())
            input_token = next_token
            
    return generated
```

---

## 6. Training Tricks for RNNs

### Gradient Clipping (Essential!)
```python
# Clip gradient norm BEFORE optimizer step
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
# or clip value
torch.nn.utils.clip_grad_value_(model.parameters(), clip_value=1.0)
```

### Teacher Forcing
```python
# During training: feed ground truth as next input
# During inference: feed model's own prediction

use_teacher_forcing = random.random() < teacher_forcing_ratio
if use_teacher_forcing:
    next_input = target[:, t]  # Ground truth
else:
    next_input = prediction.argmax(-1)  # Model's prediction
```

### Curriculum Learning
Start with short sequences, gradually increase length.

### Dropout in RNNs
```python
# PyTorch LSTM: dropout between layers only (not on recurrent connections!)
# For recurrent dropout, use variational dropout (Gal & Ghahramani):
class VariationalDropout(nn.Module):
    def forward(self, x):
        if not self.training:
            return x
        # Same mask across time steps
        mask = x.new_empty(x.size(0), 1, x.size(2)).bernoulli_(1 - self.p)
        mask = mask / (1 - self.p)
        return x * mask.expand_as(x)
```

---

## 7. Common Pitfalls

| Issue | Symptom | Fix |
|-------|---------|-----|
| **Vanishing gradients** | Can't learn dependencies > 20 steps | LSTM/GRU, gradient clipping, residual connections |
| **Exploding gradients** | Loss = NaN | Gradient clipping (norm=1.0) |
| **Overfitting** | Train loss << Val loss | Dropout, weight decay, smaller hidden size |
| **Slow training** | GPU underutilized | Pack sequences, larger batch, cuDNN LSTM |
| **Batch norm doesn't work** | Statistics unstable across time | Use LayerNorm instead |
| **Bidirectional for generation** | Can't generate (needs future) | Use unidirectional for autoregressive tasks |

---

## 8. When NOT to Use RNNs/LSTMs

| Scenario | Better Alternative |
|----------|-------------------|
| **Long sequences (>512)** | Transformers (self-attention) |
| **Parallelizable training needed** | Transformers / CNNs (TCN) |
| **Very long-term dependencies** | Transformers with positional encoding |
| **Fixed-length input** | 1D CNN or MLP |
| **Need interpretability** | Attention weights (Transformers) |

---

## 9. Modern Replacements

### Temporal Convolutional Networks (TCN)
- 1D Dilated Convolutions with residual connections
- Parallelizable, longer receptive field, no vanishing gradients
```python
# Dilated conv: receptive field grows exponentially
# dilation=1,2,4,8,16... → receptive field = kernel_size * 2^layers
```

### Transformers (Next Section)
- Self-attention: $O(n^2)$ but fully parallel
- Global receptive field at every layer
- Standard for NLP, growing in time series

### State Space Models (S4, Mamba)
- Linear recurrence with structured state matrices
- $O(n)$ training, $O(1)$ inference
- Emerging as Transformer alternative for long sequences