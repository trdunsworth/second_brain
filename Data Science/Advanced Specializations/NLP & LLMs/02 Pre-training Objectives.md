# Pre-training Objectives for LLMs

Pre-training objectives determine what the model learns from raw text. The choice of objective shapes the model's capabilities, efficiency, and downstream performance.

## 1. Objective Taxonomy

```
Pre-training Objectives
├── Autoregressive / Causal
│   ├── CLM (Causal Language Modeling) — GPT, LLaMA
│   ├── Prefix LM — GPT-1, some T5 variants
│   └── Permutation LM — XLNet
├── Masked / Denoising
│   ├── MLM (Masked Language Modeling) — BERT, RoBERTa
│   ├── Span Corruption — T5, mT5, UL2
│   ├── Document Denoising — BART, PEGASUS
│   └── Replaced Token Detection — ELECTRA
└── Hybrid / Multi-Objective
    ├── Mixture of Denoisers — UL2, T5 variants
    ├── Encoder-Decoder with Causal Decoder — BART, T5
    └── Fused Objectives — RETRO, Atlas
```

---

## 2. Causal Language Modeling (CLM)

### Standard Next-Token Prediction
$$\mathcal{L}_{\text{CLM}} = -\sum_{t=1}^T \log P(x_t | x_{<t}; \theta)$$

### Implementation
```python
def clm_loss(logits, labels, ignore_index=-100):
    # logits: (batch, seq_len, vocab_size)
    # labels: (batch, seq_len) - typically same as input_ids shifted
    shift_logits = logits[:, :-1, :].contiguous()
    shift_labels = labels[:, 1:].contiguous()
    
    loss_fct = nn.CrossEntropyLoss(ignore_index=ignore_index)
    loss = loss_fct(
        shift_logits.view(-1, shift_logits.size(-1)),
        shift_labels.view(-1)
    )
    return loss
```

### Properties
| Aspect | Detail |
|--------|--------|
| **Direction** | Left-to-right (causal) |
| **Context** | Only past tokens |
| **Efficiency** | Full parallel training (teacher forcing) |
| **Generation** | Native autoregressive |
| **Best For** | Decoder-only models (GPT, LLaMA) |

### Variants
- **Prefix LM**: Bidirectional attention on prefix, causal on suffix (GPT-1)
- **Permutation LM**: Random factorization order (XLNet) - captures bidirectional context but complex

---

## 3. Masked Language Modeling (MLM)

### Standard BERT MLM
$$\mathcal{L}_{\text{MLM}} = -\sum_{i \in M} \log P(x_i | x_{\setminus M}; \theta)$$

**Masking Strategy (BERT)**:
- 15% of tokens selected
  - 80% → `[MASK]`
  - 10% → Random token
  - 10% → Unchanged

### Implementation
```python
def mlm_loss(logits, labels, mask_token_id=103, ignore_index=-100):
    # labels: (batch, seq_len) with -100 for non-masked positions
    loss_fct = nn.CrossEntropyLoss(ignore_index=ignore_index)
    loss = loss_fct(
        logits.view(-1, logits.size(-1)),
        labels.view(-1)
    )
    return loss

# Dynamic masking (RoBERTa style)
def dynamic_masking(input_ids, mask_token_id, vocab_size, mlm_prob=0.15):
    labels = input_ids.clone()
    probability_matrix = torch.full(labels.shape, mlm_prob)
    
    # Don't mask special tokens
    special_tokens_mask = get_special_tokens_mask(input_ids)
    probability_matrix.masked_fill_(special_tokens_mask, 0.0)
    
    masked_indices = torch.bernoulli(probability_matrix).bool()
    labels[~masked_indices] = ignore_index
    
    # 80% MASK
    indices_replaced = torch.bernoulli(torch.full(labels.shape, 0.8)).bool() & masked_indices
    input_ids[indices_replaced] = mask_token_id
    
    # 10% Random
    indices_random = torch.bernoulli(torch.full(labels.shape, 0.5)).bool() & masked_indices & ~indices_replaced
    random_words = torch.randint(vocab_size, labels.shape, dtype=torch.long)
    input_ids[indices_random] = random_words[indices_random]
    
    # 10% Keep (already correct)
    
    return input_ids, labels
```

### Properties
| Aspect | Detail |
|--------|--------|
| **Direction** | Bidirectional |
| **Context** | Full sequence (both sides) |
| **Efficiency** | Only computes loss on masked positions (~15%) |
| **Generation** | Not native (need iterative masking or separate decoder) |
| **Best For** | Encoder-only models (BERT, RoBERTa, DeBERTa) |

### Variants
- **Whole Word Masking**: Mask entire words (not subwords)
- **N-gram Masking**: Mask contiguous spans
- **Dynamic Masking**: Different mask each epoch (RoBERTa)

---

## 4. Span Corruption (T5 Style)

### Objective
Mask contiguous spans of tokens, replace with single sentinel tokens.

### T5 Span Corruption
- **Span length**: ~3 tokens (geometric distribution)
- **Corruption rate**: 15% of tokens
- **Sentinels**: `<extra_id_0>`, `<extra_id_1>`, ... for each span

### Example
```
Input:  "The quick brown fox jumps over the lazy dog"
Corrupted: "The <X> fox <Y> over the <Z>"
Target: "<X> quick brown <Y> jumps <Z> lazy dog"
```

### Implementation
```python
def span_corruption(input_ids, sentinel_start_id, mask_prob=0.15, mean_span_len=3):
    batch_size, seq_len = input_ids.shape
    labels = input_ids.clone()
    
    # Generate span lengths from geometric distribution
    # p = 1/mean_span_len
    p = 1.0 / mean_span_len
    
    # Create corruption mask
    num_masked = int(seq_len * mask_prob)
    mask = torch.zeros_like(input_ids, dtype=torch.bool)
    
    for b in range(batch_size):
        masked = 0
        while masked < num_masked:
            span_len = max(1, int(np.random.geometric(p)))
            start = np.random.randint(0, seq_len - span_len)
            end = min(start + span_len, seq_len)
            
            if not mask[b, start:end].any():
                mask[b, start:end] = True
                masked += span_len
    
    # Replace spans with sentinels
    sentinel_id = sentinel_start_id
    for b in range(batch_size):
        in_span = False
        for i in range(seq_len):
            if mask[b, i] and not in_span:
                in_span = True
                labels[b, i] = sentinel_id
                sentinel_id -= 1
            elif mask[b, i] and in_span:
                labels[b, i] = -100  # Ignore in loss
            elif not mask[b, i] and in_span:
                in_span = False
                labels[b, i] = sentinel_id
                sentinel_id -= 1
    
    # Input: replace masked spans with sentinels
    input_ids[mask] = ...  # Insert sentinel tokens appropriately
    
    return input_ids, labels
```

### Properties
| Aspect | Detail |
|--------|--------|
| **Efficiency** | Fewer target tokens (1 per span vs 1 per token) |
| **Difficulty** | Harder - must predict variable-length spans |
| **Best For** | Encoder-decoder (T5, mT5, UL2) |

---

## 5. Document Denoising (BART / PEGASUS)

### BART: Document Rotation + Token Masking/Deletion
1. **Token Masking**: Like BERT MLM
2. **Token Deletion**: Randomly delete tokens
3. **Text Infilling**: Replace spans with single `[MASK]`
4. **Sentence Permutation**: Shuffle sentences
5. **Document Rotation**: Rotate document to start at random token

### PEGASUS: Gap-Sentence Generation
- **Mask important sentences** (ROUGE-based selection)
- **Generate masked sentences** from remaining context
- **Optimized for summarization**

### Properties
| Aspect | BART | PEGASUS |
|--------|------|---------|
| **Noise Types** | Multiple (mask, delete, permute, rotate) | Gap-sentence |
| **Best For** | General NLU + Generation | Summarization |
| **Architecture** | Enc-Dec | Enc-Dec |

---

## 6. Replaced Token Detection (ELECTRA)

### Discriminator-Generator Framework
```
Generator (small MLM) → Generates replacements for masked positions
                                    ↓
Discriminator (main model) → Binary classification: Real vs Generated
```

### Loss
$$\mathcal{L}_{\text{ELECTRA}} = \mathcal{L}_{\text{MLM}}(G) + \lambda \mathcal{L}_{\text{Disc}}(D)$$

### Advantages
- **Sample efficiency**: Uses all tokens (not just masked)
- **Compute efficiency**: Generator 1/4 - 1/2 size of discriminator
- **Better representations**: Discriminator learns bidirectional context

### Implementation
```python
class ElectraModel(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.generator = AutoModelForMaskedLM.from_config(small_config)
        self.discriminator = AutoModel.from_config(config)
    
    def forward(self, input_ids, attention_mask=None):
        # Generator forward
        gen_logits = self.generator(input_ids).logits
        
        # Sample from generator (Gumbel-Softmax for differentiability)
        gen_probs = F.softmax(gen_logits, dim=-1)
        sampled_tokens = torch.multinomial(gen_probs.view(-1, vocab_size), 1).view_as(input_ids)
        
        # Create discriminator input: replace masked positions
        disc_input = input_ids.clone()
        mask = (input_ids == mask_token_id)
        disc_input[mask] = sampled_tokens[mask]
        
        # Discriminator predicts: is each token original?
        disc_logits = self.discriminator(disc_input).logits
        disc_labels = (~mask).float()  # 1 = original, 0 = replaced
        
        # Losses
        gen_loss = F.cross_entropy(gen_logits[mask], input_ids[mask])
        disc_loss = F.binary_cross_entropy_with_logits(disc_logits.squeeze(-1), disc_labels)
        
        return gen_loss + 50 * disc_loss  # λ=50 typical
```

---

## 7. Mixture of Denoisers (UL2 / T5 Variants)

### UL2: Unified Language Learning
Combine multiple denoising objectives with different schedules:

| Objective | Weight | Description |
|-----------|--------|-------------|
| **R-Denoising** | 0.5 | Regular span corruption (T5-style) |
| **S-Denoising** | 0.25 | Sequential denoising (prefix LM) |
| **X-Denoising** | 0.25 | Extreme denoising (long spans, high corruption) |

### Implementation
```python
class UL2Loss(nn.Module):
    def __init__(self):
        super().__init__()
        self.objectives = {
            'R': SpanCorruption(mean_span_len=3, corruption_rate=0.15),
            'S': PrefixLM(prefix_ratio=0.5),
            'X': ExtremeDenoising(mean_span_len=20, corruption_rate=0.5),
        }
        self.weights = {'R': 0.5, 'S': 0.25, 'X': 0.25}
    
    def forward(self, model, input_ids):
        total_loss = 0
        for name, obj in self.objectives.items():
            corrupted_input, targets = obj.corrupt(input_ids)
            logits = model(corrupted_input)
            loss = F.cross_entropy(logits.view(-1, vocab_size), targets.view(-1), ignore_index=-100)
            total_loss += self.weights[name] * loss
        return total_loss
```

---

## 8. Contrastive / Retrieval Objectives

### Contrastive Pre-training (for Embeddings)
$$\mathcal{L}_{\text{contrastive}} = -\log \frac{e^{\text{sim}(q, k^+)/\tau}}{\sum_{k} e^{\text{sim}(q, k)/\tau}}$$

**Used in**: E5, BGE, GTE, Contriever, SimCSE

### Implementation (In-batch Negatives)
```python
def contrastive_loss(query_emb, doc_emb, temperature=0.02):
    # query_emb: (batch, dim), doc_emb: (batch, dim)
    # Positive pairs are diagonal
    sim_matrix = torch.matmul(query_emb, doc_emb.T) / temperature
    labels = torch.arange(query_emb.size(0), device=query_emb.device)
    
    loss_q2d = F.cross_entropy(sim_matrix, labels)
    loss_d2q = F.cross_entropy(sim_matrix.T, labels)
    return (loss_q2d + loss_d2q) / 2
```

---

## 9. Multi-Modal Objectives

### CLIP: Contrastive Language-Image Pre-training
$$\mathcal{L}_{\text{CLIP}} = \frac{1}{2N} \sum_{i=1}^N \left[ \mathcal{L}_{\text{img2text}} + \mathcal{L}_{\text{text2img}} \right]$$

### FLAVA / ALIGN / BLIP: Various combinations
- **Image-Text Contrastive** (ITC)
- **Image-Text Matching** (ITM) - binary classification
- **Masked Language Modeling** (MLM)
- **Image-Text Masked Modeling** (ITMM)

---

## 10. Objective Comparison Summary

| Objective | Architecture | Context | Efficiency | Best For |
|-----------|--------------|---------|------------|----------|
| **CLM** | Decoder | Left-only | High (parallel) | Generation, LLM |
| **MLM** | Encoder | Bidirectional | Medium (15% tokens) | NLU, Embeddings |
| **Span Corruption** | Enc-Dec | Bidirectional (enc) | High (few targets) | Seq2Seq, T5 |
| **Document Denoising** | Enc-Dec | Bidirectional | Medium | Generation + Understanding |
| **RTD (ELECTRA)** | Encoder | Bidirectional | High (all tokens) | Efficient Encoder |
| **Mixture (UL2)** | Enc-Dec | Mixed | Medium | Best of all worlds |
| **Contrastive** | Encoder | Bidirectional | High (in-batch) | Embeddings, Retrieval |

---

## 11. Practical: Choosing Objective for Your Use Case

### For a New Encoder Model (Embeddings/Classification)
```python
# Modern best practice: ELECTRA-style RTD + Contrastive
# Or: MLM + Contrastive (SimCSE style)

objective_config = {
    "primary": "MLM",           # or "RTD" for efficiency
    "mlm_probability": 0.15,
    "contrastive_weight": 0.5,  # Add contrastive for embeddings
    "whole_word_mask": True,
    "dynamic_masking": True,
}
```

### For a New Decoder Model (LLM)
```python
# Standard: CLM with massive data
objective_config = {
    "primary": "CLM",
    "sequence_length": 4096,    # or 8192, 32768, 128k
    "packing": True,            # Pack multiple docs to seq_len
    "use_document_boundaries": True,  # Don't cross doc boundaries
}
```

### For Encoder-Decoder (Seq2Seq)
```python
# UL2 mixture recommended for best results
objective_config = {
    "primary": "Mixture",
    "R_weight": 0.5,    # Span corruption
    "S_weight": 0.25,   # Prefix LM
    "X_weight": 0.25,   # Extreme denoising
    "span_corruption_rate": 0.15,
    "mean_span_length": 3,
}
```

---

## 12. Pre-training Data Considerations

| Factor | Impact on Objective |
|--------|---------------------|
| **Data Quality** | Noisy data → need more robust objectives (ELECTRA, UL2) |
| **Data Quantity** | Small data → MLM/ELECTRA better; Massive data → CLM scales best |
| **Domain** | Code → CLM; Biomedical → MLM + Domain vocab; Multilingual → mT5 span corruption |
| **Sequence Length** | Long context → CLM with RoPE/ALiBi; Short → MLM fine |

---

## 13. Key Takeaways

1. **CLM is the default for LLMs** — scales best with data/compute, native generation
2. **MLM/RTD for encoders** — bidirectional context crucial for understanding tasks
3. **Span corruption for Enc-Dec** — efficient training, good for seq2seq
4. **Mixture of denoisers (UL2)** — state-of-the-art for Enc-Dec, combines strengths
5. **Contrastive objectives** — essential for retrieval/embedding models
6. **Objective + Architecture co-design** — don't mix CLM with encoder, MLM with decoder
7. **Data quality > Objective cleverness** — better data beats better objectives