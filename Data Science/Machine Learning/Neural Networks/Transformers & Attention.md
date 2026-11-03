# Transformers & Attention Mechanisms

The Transformer architecture (Vaswani et al., 2017) replaced recurrence with **self-attention**, enabling full parallelization and global context at every layer.

## 1. Scaled Dot-Product Attention

### Core Idea
For each position, compute weighted average of all positions, where weights = compatibility scores.

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{Q K^T}{\sqrt{d_k}}\right) V$$

- **$Q$ (Query)**: What I'm looking for
- **$K$ (Key)**: What I contain
- **$V$ (Value)**: What I communicate
- **$\sqrt{d_k}$**: Scaling prevents gradient vanishing for large $d_k$

### Intuition
```
For token "bank" in "river bank":
  Q_bank  •  K_river  = low  →  "river" not relevant
  Q_bank  •  K_money  = high →  "money" relevant
  V_money contributes to output representation
```

---

## 2. Multi-Head Attention

Instead of one attention, run $h$ heads in parallel, each with different learned projections.

$$\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, ..., \text{head}_h) W^O$$
$$\text{head}_i = \text{Attention}(Q W^Q_i, K W^K_i, V W^V_i)$$

- **$W^Q_i, W^K_i, W^V_i \in \mathbb{R}^{d_{model} \times d_k}$**: Projection matrices
- **$W^O \in \mathbb{R}^{h d_v \times d_{model}}$**: Output projection
- **Typical**: $h=8, d_k=d_v=d_{model}/h=64$ (for $d_{model}=512$)

**Why multiple heads?**
- Head 1: Syntactic dependencies (subject-verb)
- Head 2: Semantic relationships
- Head 3: Positional patterns
- Head 4: Coreference resolution

---

## 3. Transformer Block (Encoder)

```
Input → [Multi-Head Attention] → Add & Norm → [FFN] → Add & Norm → Output
              ↓                      ↑            ↓          ↑
           Residual              LayerNorm    Residual   LayerNorm
```

### Components

#### Layer Normalization (Not BatchNorm!)
$$\text{LN}(x) = \gamma \frac{x - \mu}{\sqrt{\sigma^2 + \epsilon}} + \beta$$
- Normalizes **per token** across feature dimension
- Works with batch size 1, variable sequence length

#### Feed-Forward Network (FFN)
$$\text{FFN}(x) = \text{ReLU}(x W_1 + b_1) W_2 + b_2$$
- Typically $d_{ff} = 4 \times d_{model}$ (expansion)
- Applied **per position** independently (position-wise)

#### Residual Connections
$$x_{out} = \text{LayerNorm}(x + \text{Sublayer}(x))$$
- **Pre-LN** (modern): $\text{Sublayer}(\text{LN}(x)) + x$ — more stable
- **Post-LN** (original): $\text{LN}(x + \text{Sublayer}(x))$

---

## 4. Positional Encoding

Self-attention is **permutation invariant** → needs position information.

### Sinusoidal (Original)
$$PE_{(pos, 2i)} = \sin(pos / 10000^{2i/d_{model}})$$
$$PE_{(pos, 2i+1)} = \cos(pos / 10000^{2i/d_{model}})$$

### Learned Positional Embeddings
```python
self.pos_embedding = nn.Parameter(torch.randn(1, max_seq_len, d_model))
x = x + self.pos_embedding[:, :seq_len, :]
```

### Rotary Positional Embeddings (RoPE) - Modern Default
```python
# Rotates query/key vectors by position-dependent angle
# Allows relative position reasoning, extrapolates to longer sequences
# Used in LLaMA, GPT-NeoX, PaLM
```

### Relative Positional Bias (T5, DeBERTa)
```python
# Adds learned bias based on relative distance i-j
attention_scores += relative_bias[i - j]
```

---

## 5. Encoder-Decoder Architecture

### Encoder (BERT-style)
- **Bi-directional attention**: All positions attend to all positions
- **Tasks**: Classification, NER, QA, embeddings

### Decoder (GPT-style)
- **Causal (masked) attention**: Position $t$ only attends to $\le t$
- **Tasks**: Generation, language modeling

### Encoder-Decoder (T5, BART)
- Encoder processes input
- Decoder generates output, cross-attends to encoder output
- **Tasks**: Translation, summarization

---

## 6. Attention Masking

### Padding Mask
```python
# True = attend, False = ignore
# src_key_padding_mask: (batch, seq_len)
# Prevents attending to padding tokens
```

### Causal Mask (Autoregressive)
```python
# Upper triangular matrix with -inf
def generate_square_subsequent_mask(sz):
    mask = torch.triu(torch.ones(sz, sz) * float('-inf'), diagonal=1)
    return mask

# In attention:
attn_scores = attn_scores + causal_mask  # Softmax → 0 for future positions
```

### Combined Mask
```python
# For encoder-decoder cross-attention
# tgt_mask: causal (decoder self-attn)
# memory_mask: padding (encoder output padding)
```

---

## 7. Implementation (PyTorch)

### Transformer Encoder Block
```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class TransformerEncoderBlock(nn.Module):
    def __init__(self, d_model, nhead, dim_feedforward=2048, dropout=0.1, activation='gelu'):
        super().__init__()
        self.self_attn = nn.MultiheadAttention(d_model, nhead, dropout=dropout, batch_first=True)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, dim_feedforward),
            nn.GELU() if activation == 'gelu' else nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(dim_feedforward, d_model),
            nn.Dropout(dropout)
        )
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, src, src_mask=None, src_key_padding_mask=None):
        # Pre-LN architecture (more stable)
        # Self-attention
        src2 = self.norm1(src)
        src2, _ = self.self_attn(src2, src2, src2, 
                                  attn_mask=src_mask,
                                  key_padding_mask=src_key_padding_mask)
        src = src + self.dropout(src2)
        
        # FFN
        src2 = self.norm2(src)
        src2 = self.ffn(src2)
        src = src + self.dropout(src2)
        return src
```

### Full Transformer Encoder
```python
class TransformerEncoder(nn.Module):
    def __init__(self, vocab_size, d_model=512, nhead=8, num_layers=6, 
                 dim_feedforward=2048, max_seq_len=512, dropout=0.1, num_classes=2):
        super().__init__()
        self.d_model = d_model
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.pos_embedding = nn.Parameter(torch.randn(1, max_seq_len, d_model))
        self.dropout = nn.Dropout(dropout)
        
        self.layers = nn.ModuleList([
            TransformerEncoderBlock(d_model, nhead, dim_feedforward, dropout)
            for _ in range(num_layers)
        ])
        self.norm = nn.LayerNorm(d_model)
        self.classifier = nn.Linear(d_model, num_classes)
    
    def forward(self, x, padding_mask=None):
        # x: (batch, seq_len)
        seq_len = x.size(1)
        
        # Embedding + Positional
        x = self.embedding(x) * math.sqrt(self.d_model)
        x = x + self.pos_embedding[:, :seq_len, :]
        x = self.dropout(x)
        
        # Transformer layers
        for layer in self.layers:
            x = layer(x, src_key_padding_mask=padding_mask)
        
        x = self.norm(x)
        
        # Classification: use [CLS] token (first) or mean pooling
        cls_token = x[:, 0]  # Assume first token is [CLS]
        # Or: cls_token = x.mean(dim=1) for mean pooling
        
        return self.classifier(cls_token)
```

### Using PyTorch's Built-in (Optimized)
```python
encoder_layer = nn.TransformerEncoderLayer(
    d_model=512, nhead=8, dim_feedforward=2048,
    dropout=0.1, activation='gelu', batch_first=True,
    norm_first=True  # Pre-LN
)
encoder = nn.TransformerEncoder(encoder_layer, num_layers=6)

# Forward
out = encoder(src, mask=src_mask, src_key_padding_mask=padding_mask)
```

---

## 8. Key Variants & Improvements

| Model | Innovation | Use Case |
|-------|------------|----------|
| **BERT** | Encoder-only, MLM + NSP pretraining | NLU tasks |
| **GPT** | Decoder-only, causal LM | Generation |
| **T5** | Encoder-decoder, text-to-text | All NLP |
| **RoBERTa** | BERT with better training | Stronger BERT |
| **DeBERTa** | Disentangled attention, enhanced mask | SOTA NLU |
| **LLaMA** | RoPE, SwiGLU, RMSNorm, no bias | Efficient LLM |
| **Mistral** | Sliding window attention, GQA | Fast inference |
| **Longformer/BigBird** | Sparse attention (local + global) | Long docs (4K-64K) |
| **FlashAttention** | IO-aware exact attention | 2-4x speedup, less memory |

---

## 9. Modern LLM Components

### SwiGLU Activation (LLaMA, PaLM)
```python
# Instead of ReLU/GELU in FFN
class SwiGLU(nn.Module):
    def forward(self, x):
        x, gate = x.chunk(2, dim=-1)
        return F.silu(x) * gate  # SiLU(x) = x * sigmoid(x)

# FFN becomes: W_2( SwiGLU( W_1(x) ) )
# Requires 2/3 more params but better performance
```

### RMSNorm (LLaMA)
```python
# Simpler than LayerNorm (no mean centering, no bias)
class RMSNorm(nn.Module):
    def __init__(self, dim, eps=1e-6):
        super().__init__()
        self.weight = nn.Parameter(torch.ones(dim))
        self.eps = eps
    
    def forward(self, x):
        rms = x.pow(2).mean(-1, keepdim=True).add(self.eps).rsqrt()
        return x * rms * self.weight
```

### Grouped Query Attention (GQA) - Mistral, LLaMA-2
```python
# Between Multi-Head (H heads) and Multi-Query (1 head)
# G groups, each group shares K,V but has own Q
# Reduces KV cache memory for inference
```

### Sliding Window Attention (Mistral)
```python
# Each token attends to W previous tokens
# Enables O(W) memory instead of O(n)
# Global tokens attend to all
```

---

## 10. Training Transformers

### Critical Hyperparameters
```python
# AdamW with cosine decay + warmup
optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.1, betas=(0.9, 0.95))

# Linear warmup (1-5% of steps) + Cosine decay
scheduler = get_cosine_schedule_with_warmup(
    optimizer, num_warmup_steps=1000, num_training_steps=100000
)

# Gradient clipping
torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)

# Mixed precision (AMP)
scaler = torch.cuda.amp.GradScaler()
with torch.cuda.amp.autocast():
    loss = criterion(output, target)
scaler.scale(loss).backward()
scaler.unscale_(optimizer)
torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
scaler.step(optimizer)
scaler.update()
```

### Regularization
| Technique | Value |
|-----------|-------|
| **Weight Decay** | 0.1 (AdamW) |
| **Dropout** | 0.1-0.3 (in FFN, attention) |
| **Label Smoothing** | 0.1 |
| **Stochastic Depth** | 0.1 (drop entire layers) |
| **Gradient Clipping** | 1.0 |

---

## 11. Inference Optimization

### KV Caching (Critical for Generation)
```python
# Store K,V for each layer to avoid recomputing
class CachedAttention(nn.Module):
    def forward(self, x, past_kv=None):
        if past_kv is not None:
            k, v = past_kv
            k = torch.cat([k, new_k], dim=2)
            v = torch.cat([v, new_v], dim=2)
        else:
            k, v = new_k, new_v
        # ... attention with cached k,v
        return out, (k, v)
```

### Quantization
```python
# Post-training quantization
model_int8 = torch.quantization.quantize_dynamic(
    model, {nn.Linear}, dtype=torch.qint8
)

# GPTQ / AWQ (weight-only 4-bit)
# BitsAndBytes (8-bit / 4-bit)
from transformers import BitsAndBytesConfig
bnb_config = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=torch.float16)
model = AutoModelForCausalLM.from_pretrained("...", quantization_config=bnb_config)
```

---

## 12. When to Use What

| Task | Architecture |
|------|--------------|
| **Text Classification** | BERT/RoBERTa/DeBERTa (Encoder) |
| **Token Classification (NER)** | BERT + CRF head |
| **Question Answering** | BERT (span prediction) |
| **Text Generation** | GPT/LLaMA/Mistral (Decoder) |
| **Translation/Summarization** | T5/BART/mT5 (Enc-Dec) |
| **Long Documents (>4K tokens)** | Longformer/BigBird/LED |
| **Efficient Inference** | Mistral (GQA, SWA), Quantized models |
| **Multimodal** | CLIP, Flamingo, LLaVA, GPT-4V |

---

## 13. Practical Checklist for Training

- [ ] **Pre-LN** (norm_first=True) for stability
- [ ] **Proper initialization** (truncated normal, std=0.02)
- [ ] **Learning rate warmup** (critical for Transformers)
- [ ] **Gradient clipping** (1.0)
- [ ] **Weight decay** (0.1 with AdamW)
- [ ] **Mixed precision** (AMP) for speed/memory
- [ ] **Gradient accumulation** for large effective batch
- [ ] **EMA weights** for evaluation
- [ ] **Tokenizer alignment** (special tokens: [CLS], [SEP], [PAD], [MASK])
- [ ] **Positional encoding matches pretraining** (if loading weights)