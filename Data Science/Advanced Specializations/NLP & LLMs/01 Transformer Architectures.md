# Transformer Architectures for LLMs

The Transformer architecture (Vaswani et al., 2017) is the foundation of all modern LLMs. Understanding the three main architectural patterns is essential for model selection, fine-tuning, and inference optimization.

## 1. Core Building Blocks (Recap)

### Multi-Head Self-Attention
```python
# Simplified attention computation
def attention(Q, K, V, mask=None):
    # Q, K, V: (batch, seq_len, n_heads, head_dim)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(head_dim)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    attn_weights = F.softmax(scores, dim=-1)
    return torch.matmul(attn_weights, V)
```

### Feed-Forward Network (FFN)
```python
# Standard (BERT/GPT-2)
class FFN(nn.Module):
    def __init__(self, d_model, d_ff, dropout=0.1):
        super().__init__()
        self.linear1 = nn.Linear(d_model, d_ff)
        self.linear2 = nn.Linear(d_ff, d_model)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x):
        return self.linear2(self.dropout(F.gelu(self.linear1(x))))

# SwiGLU (LLaMA, PaLM, Mistral) - Better performance
class SwiGLU(nn.Module):
    def __init__(self, d_model, d_ff, dropout=0.1):
        super().__init__()
        self.gate = nn.Linear(d_model, d_ff, bias=False)
        self.up = nn.Linear(d_model, d_ff, bias=False)
        self.down = nn.Linear(d_ff, d_model, bias=False)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x):
        return self.down(self.dropout(F.silu(self.gate(x)) * self.up(x)))
```

### Normalization
| Variant | Formula | Used In |
|---------|---------|---------|
| **LayerNorm** | $\gamma \frac{x - \mu}{\sigma} + \beta$ | BERT, GPT-2, T5 |
| **RMSNorm** | $\gamma \frac{x}{\sqrt{\text{mean}(x^2) + \epsilon}}$ | LLaMA, Mistral, Gemma, PaLM |
| **No Norm** | — | Some recent architectures |

### Positional Encoding
| Method | Description | Models |
|--------|-------------|--------|
| **Absolute (Sinusoidal)** | Fixed sine/cosine frequencies | Original Transformer, BERT |
| **Learned Absolute** | Trainable embeddings per position | GPT-2, GPT-3 |
| **RoPE (Rotary)** | Rotate Q/K in complex plane by position | LLaMA, Mistral, Gemma, PaLM, Qwen |
| **ALiBi** | Linear bias added to attention scores | BLOOM, MPT |
| **Relative (T5)** | Learned bias based on relative distance | T5, DeBERTa |
| **YaRN / PI** | RoPE extension for long context | LLaMA-2 Long, CodeLLaMA |

---

## 2. Encoder-Only (BERT Family)

### Architecture
```
Input → [Embedding + PosEnc] → [Encoder × N] → Output Representations
```

### Encoder Block
```
x → [LayerNorm] → [Multi-Head Self-Attention] → [+ Residual] → [LayerNorm] → [FFN] → [+ Residual] → Output
     (Pre-LN)                                                          (Pre-LN)
```

### Key Characteristics
- **Bi-directional attention**: Every token attends to all tokens
- **No causal mask**: Full sequence visibility
- **Pre-training**: Masked Language Modeling (MLM) + optionally Next Sentence Prediction
- **Output**: Dense representations for every token (and [CLS] for classification)

### Variants
| Model | Innovation | Parameters |
|-------|------------|------------|
| **BERT** | MLM + NSP, Learned pos enc | Base: 110M, Large: 340M |
| **RoBERTa** | Remove NSP, dynamic masking, more data | Base: 125M, Large: 355M |
| **DeBERTa** | Disentangled attention, enhanced mask decoder | V3 Large: 300M |
| **ELECTRA** | Replaced Token Detection (RTD) - discriminator/generator | Base: 110M |
| **ModernBERT** | RoPE, GeGLU, alternating attention, better tokenizer | Base: 150M, Large: 400M |

### Use Cases
- **Classification**: [CLS] token → Linear head
- **Token Classification (NER)**: Per-token linear head
- **QA**: Span prediction (start/end logits)
- **Embeddings**: Mean/CLS pooling for semantic similarity
- **Feature Extraction**: Frozen backbone for downstream tasks

---

## 3. Decoder-Only (GPT Family)

### Architecture
```
Input → [Embedding + PosEnc] → [Decoder × N] → [LayerNorm] → [LM Head] → Logits
```

### Decoder Block (Causal Self-Attention)
```
x → [LayerNorm] → [Causal Multi-Head Self-Attention] → [+ Residual] 
   → [LayerNorm] → [FFN] → [+ Residual] → Output
```

### Causal Masking
```python
# Upper triangular mask (1 = attend, 0 = mask)
def causal_mask(seq_len):
    mask = torch.triu(torch.ones(seq_len, seq_len), diagonal=1).bool()
    return mask  # True positions are masked (set to -inf)
```

### Key Characteristics
- **Uni-directional (causal)**: Token $t$ only attends to $\le t$
- **Autoregressive generation**: Predict next token given history
- **Pre-training**: Causal Language Modeling (CLM) - next token prediction
- **KV Caching**: Store K,V for past tokens during generation

### Variants
| Model | Key Innovation | Parameters |
|-------|----------------|------------|
| **GPT-1** | Decoder-only, CLM pre-training | 117M |
| **GPT-2** | LayerNorm tweaks, larger scale | 124M - 1.5B |
| **GPT-3** | Few-shot prompting, massive scale | 125M - 175B |
| **GPT-Neo/X** | Open replication, mesh tensor parallelism | 125M - 20B |
| **LLaMA 1/2/3** | RoPE, SwiGLU, RMSNorm, no bias, Grouped Query Attention | 7B - 405B |
| **Mistral** | Sliding Window Attention, GQA, RoPE | 7B, 8x7B (MoE) |
| **Gemma** | Similar to LLaMA, optimized for small scale | 2B, 7B |
| **Qwen** | RoPE, SwiGLU, RMSNorm, improved tokenizer | 0.5B - 110B |
| **Phi** | High-quality synthetic data, small models | 1.3B - 14B |
| **Falcon** | Multi-Query Attention, parallel attention+FFN | 7B - 180B |

### Inference: KV Caching
```python
class CachedAttention(nn.Module):
    def forward(self, x, past_kv=None):
        # x: (batch, 1, d_model) - single token at generation time
        Q = self.q_proj(x)
        K = self.k_proj(x)
        V = self.v_proj(x)
        
        if past_kv is not None:
            K = torch.cat([past_kv[0], K], dim=1)
            V = torch.cat([past_kv[1], V], dim=1)
        
        # Attention with full K,V history
        attn_out = self.attention(Q, K, V)
        return attn_out, (K, V)  # Return updated cache
```

### Use Cases
- **Text Generation**: Completion, chat, code generation
- **Few-shot Prompting**: In-context learning
- **Instruction Following**: After SFT/RLHF
- **Reasoning**: Chain-of-thought, tree-of-thought

---

## 4. Encoder-Decoder (T5 Family)

### Architecture
```
Encoder Input → [Encoder × N] → Encoder Output
                                         ↓
Decoder Input → [Decoder × N] → [Cross-Attention to Encoder] → LM Head → Logits
```

### Decoder Block (with Cross-Attention)
```
x → [LayerNorm] → [Causal Self-Attention] → [+ Residual]
   → [LayerNorm] → [Cross-Attention] → [+ Residual]  # Key difference!
   → [LayerNorm] → [FFN] → [+ Residual] → Output
```

### Cross-Attention
```python
# Q from decoder, K,V from encoder output
def cross_attention(Q_dec, K_enc, V_enc, mask=None):
    scores = torch.matmul(Q_dec, K_enc.transpose(-2, -1)) / math.sqrt(head_dim)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    attn_weights = F.softmax(scores, dim=-1)
    return torch.matmul(attn_weights, V_enc)
```

### Key Characteristics
- **Encoder**: Bi-directional (like BERT)
- **Decoder**: Causal + Cross-attention to encoder
- **Pre-training**: Span Corruption (T5), Prefix LM, or Denoising
- **Flexible I/O**: Text-to-text framework

### Variants
| Model | Pre-training | Key Features |
|-------|--------------|--------------|
| **T5** | Span Corruption (15% masked, variable spans) | Text-to-text, 60M - 11B |
| **mT5** | Multilingual T5 (101 languages) | mC4 corpus |
| **BART** | Document denoising (shuffle + mask) | Encoder-decoder, 140M - 400M |
| **Pegasus** | Gap-sentence generation (summary-like) | Summarization focused |
| **UL2** | Mixture of denoisers (R-denoising, S-denoising, X-denoising) | 20B |
| **FLAN-T5** | Instruction-tuned T5 | Zero-shot generalization |

### Use Cases
- **Translation**: Source → Target
- **Summarization**: Long → Short
- **Question Answering**: Context + Question → Answer
- **Data-to-Text**: Structured input → Natural language
- **Any Text-to-Text Task**: Unified framework

---

## 5. Modern Architectural Enhancements

### Grouped Query Attention (GQA)
```python
# Between Multi-Head (H heads) and Multi-Query (1 head)
# G groups, each group shares K,V but has own Q
# H = 32, G = 8 → 8 K,V heads shared across 4 Q heads each

class GQA(nn.Module):
    def __init__(self, d_model, n_heads, n_kv_heads):
        super().__init__()
        self.n_heads = n_heads
        self.n_kv_heads = n_kv_heads
        self.head_dim = d_model // n_heads
        
        self.q_proj = nn.Linear(d_model, n_heads * head_dim, bias=False)
        self.k_proj = nn.Linear(d_model, n_kv_heads * head_dim, bias=False)
        self.v_proj = nn.Linear(d_model, n_kv_heads * head_dim, bias=False)
        self.o_proj = nn.Linear(d_model, d_model, bias=False)
```

**Benefits**: Reduces KV cache memory (critical for long context), minimal quality loss.

### Sliding Window Attention (SWA)
```python
# Each token attends to W previous tokens (local) + global tokens
# Mistral: W = 4096, global tokens every 256 positions

def sliding_window_mask(seq_len, window_size, global_stride):
    mask = torch.ones(seq_len, seq_len, dtype=torch.bool)
    for i in range(seq_len):
        # Local window
        start = max(0, i - window_size + 1)
        mask[i, start:i+1] = False
        # Global tokens
        global_positions = torch.arange(0, seq_len, global_stride)
        mask[i, global_positions] = False
    return mask
```

### Mixture of Experts (MoE)
```python
# Sparse activation: only k experts per token
class MoE(nn.Module):
    def __init__(self, d_model, n_experts, expert_capacity, top_k=2):
        super().__init__()
        self.gate = nn.Linear(d_model, n_experts, bias=False)
        self.experts = nn.ModuleList([
            SwiGLU(d_model, d_model * 4) for _ in range(n_experts)
        ])
        self.top_k = top_k
    
    def forward(self, x):
        # x: (batch * seq_len, d_model)
        gate_logits = self.gate(x)
        weights, indices = torch.topk(gate_logits, self.top_k, dim=-1)
        weights = F.softmax(weights, dim=-1)
        
        # Dispatch to experts
        out = torch.zeros_like(x)
        for i in range(self.top_k):
            expert_idx = indices[:, i]
            expert_weight = weights[:, i:i+1]
            for e in range(len(self.experts)):
                mask = (expert_idx == e)
                if mask.any():
                    out[mask] += expert_weight[mask] * self.experts[e](x[mask])
        return out
```

**Used in**: Mixtral (8x7B), GPT-4 (rumored), DeepSeek-V2, Qwen-MoE.

---

## 6. Architecture Comparison Table

| Aspect | Encoder (BERT) | Decoder (GPT) | Enc-Dec (T5) |
|--------|----------------|---------------|--------------|
| **Attention** | Bi-directional | Causal | Enc: Bi, Dec: Causal + Cross |
| **Pre-training** | MLM | CLM | Span Corruption / Denoising |
| **Generation** | ❌ (need decoder) | ✅ Native | ✅ Native |
| **Representation** | Rich contextual | Contextual (left-only) | Both |
| **Typical Size** | 100M - 1B | 100M - 1T+ | 60M - 11B |
| **Fine-tuning** | Add head | Continue CLM / SFT | Continue denoising / SFT |
| **Inference Speed** | Fast (parallel) | Slow (sequential) | Medium |
| **Best For** | NLU, Embeddings, Classification | Generation, Reasoning, Chat | Translation, Summarization, QA |

---

## 7. Choosing the Right Architecture

| Your Task | Recommended Architecture | Base Model Examples |
|-----------|-------------------------|---------------------|
| **Text Classification** | Encoder | BERT, RoBERTa, DeBERTa, ModernBERT |
| **NER / Token Classification** | Encoder | BERT, DeBERTa |
| **Semantic Search / Embeddings** | Encoder | BERT, E5, BGE, GTE |
| **Text Generation / Chat** | Decoder | LLaMA, Mistral, Gemma, Qwen |
| **Code Generation** | Decoder | CodeLLaMA, DeepSeek-Coder, StarCoder |
| **Reasoning / Math** | Decoder | LLaMA, Mistral, Qwen (math-tuned) |
| **Translation** | Enc-Dec | mT5, NLLB, M2M-100 |
| **Summarization** | Enc-Dec | BART, Pegasus, FLAN-T5 |
| **QA with Long Context** | Enc-Dec / Decoder (long) | FLAN-T5, LongLLaMA, MPT |
| **Few-shot Prompting** | Decoder | LLaMA, GPT-3, Mistral |
| **Multi-task (Unified)** | Enc-Dec | T5, FLAN-T5, UL2 |

---

## 8. Model Cards & Sources

| Model Family | License | Hub |
|--------------|---------|-----|
| **BERT/RoBERTa/DeBERTa** | Apache 2.0 / MIT | `google-bert/bert-base-uncased`, `FacebookAI/roberta-base`, `microsoft/deberta-v3-base` |
| **LLaMA 1/2/3** | Custom (Meta) | `meta-llama/Llama-2-7b-hf`, `meta-llama/Meta-Llama-3-8B` |
| **Mistral** | Apache 2.0 | `mistralai/Mistral-7B-v0.3`, `mistralai/Mixtral-8x7B-v0.1` |
| **Gemma** | Gemma License | `google/gemma-2b`, `google/gemma-7b` |
| **Qwen** | Tongyi Qianwen License | `Qwen/Qwen2-7B`, `Qwen/Qwen2.5-7B` |
| **T5/mT5/FLAN-T5** | Apache 2.0 | `google-t5/t5-base`, `google/flan-t5-base` |
| **BART/Pegasus** | Apache 2.0 | `facebook/bart-base`, `google/pegasus-large` |
| **Phi** | MIT | `microsoft/phi-2`, `microsoft/Phi-3-mini-4k-instruct` |
| **Falcon** | TII License | `tiiuae/falcon-7b`, `tiiuae/falcon-180b` |

---

## 9. Practical: Loading Any Architecture

```python
from transformers import AutoModel, AutoModelForCausalLM, AutoModelForSeq2SeqLM, AutoModelForMaskedLM

# Encoder (BERT-style)
encoder = AutoModel.from_pretrained("bert-base-uncased")
# Or for classification
encoder_cls = AutoModelForMaskedLM.from_pretrained("bert-base-uncased")

# Decoder (GPT-style)
decoder = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-hf")

# Encoder-Decoder (T5-style)
enc_dec = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-base")

# Generic (loads config to determine architecture)
model = AutoModel.from_pretrained("any-model-name")
print(model.config.architectures)  # ['BertModel'] or ['LlamaForCausalLM'] etc.
```

---

## 10. Key Takeaways

1. **Three paradigms** cover 99% of use cases: Encoder (understand), Decoder (generate), Enc-Dec (translate)
2. **Decoder-only dominates LLM space** due to generative flexibility and scaling laws
3. **Modern enhancements** (RoPE, SwiGLU, RMSNorm, GQA, SWA, MoE) are now standard in new models
3. **Architecture choice** should match your task: NLU→Encoder, Generation→Decoder, Seq2Seq→Enc-Dec
4. **Fine-tuning strategy** depends on architecture: Add head (Enc), Continue CLM/SFT (Dec), Continue denoising/SFT (Enc-Dec)