# Fine-tuning Strategies for LLMs

Fine-tuning adapts a pre-trained model to a specific task or domain. The choice of strategy balances performance, compute cost, and catastrophic forgetting.

## 1. Fine-tuning Taxonomy

```
Fine-tuning Strategies
├── Full Fine-tuning (FFT)
│   ├── Standard FFT
│   ├── Continued Pre-training (CPT)
│   └── Instruction Tuning (SFT)
├── Parameter-Efficient Fine-tuning (PEFT)
│   ├── LoRA / QLoRA
│   ├── Adapters (Houlsby, Pfeiffer, Parallel)
│   ├── Prefix / Prompt Tuning
│   ├── (IA)³
│   └── BitFit / Diff Pruning
└── Hybrid / Advanced
    ├── LoRA + FFT (Partial)
    ├── Mixture of LoRAs
    ├── DoRA (Weight-Decomposed LoRA)
    └── VeRA / LoRA+
```

---

## 2. Full Fine-tuning (FFT)

### Standard FFT
Update all parameters. Best performance but highest cost.

```python
# Standard FFT
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-hf")
model.train()

# All parameters trainable
for param in model.parameters():
    param.requires_grad = True

trainer = Trainer(
    model=model,
    args=TrainingArguments(
        output_dir="./fft-output",
        learning_rate=2e-5,        # Lower than pre-training
        per_device_train_batch_size=4,
        gradient_accumulation_steps=8,
        num_train_epochs=3,
        weight_decay=0.01,
        warmup_ratio=0.03,
        lr_scheduler_type="cosine",
        bf16=True,
        gradient_checkpointing=True,
        fsdp="full_shard auto_wrap",  # For multi-GPU
    ),
    train_dataset=tokenized_dataset,
)
trainer.train()
```

### Compute Requirements (BF16, 4k seq len)
| Model Size | GPU Memory (1 GPU) | Recommended Setup | Time (1B tokens) |
|------------|-------------------|-------------------|------------------|
| **1B** | ~16 GB | 1× A100 40GB | ~2 hrs |
| **7B** | ~80 GB | 2× A100 80GB (FSDP) | ~8 hrs |
| **13B** | ~130 GB | 4× A100 80GB (FSDP) | ~16 hrs |
| **70B** | ~560 GB | 8× A100 80GB (FSDP) | ~80 hrs |

### When to Use FFT
- **Domain adaptation** (code, legal, medical, finance)
- **New language** (low-resource languages)
- **Maximum performance** required
- **Sufficient compute budget**

---

## 3. Continued Pre-training (CPT)

### Purpose
Extend pre-training on domain-specific data before instruction tuning.

```python
# CPT: Continue CLM on domain corpus
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-hf")

# Domain data: code, legal, biomedical, etc.
domain_dataset = load_dataset("my-domain-corpus", split="train")

# Lower LR, longer warmup
training_args = TrainingArguments(
    learning_rate=1e-5,           # 10x lower than pre-train
    max_steps=50000,              # ~10-50B tokens
    warmup_steps=2000,
    lr_scheduler_type="cosine",
    # ... rest same as FFT
)
```

### CPT → SFT Pipeline
```
Pre-trained Base Model
       ↓
Continued Pre-training (Domain Data, CLM)
       ↓
Instruction Tuning (SFT, SFT Data)
       ↓
Alignment (RLHF/DPO)
       ↓
Production Model
```

### Best Practices
- **LR**: 1/10 to 1/100 of original pre-training LR
- **Data**: High-quality, deduplicated, domain-relevant
- **Tokenizer**: Extend if domain has new vocabulary (add tokens, re-initialize embeddings)
- **Schedule**: Cosine decay with minimal final LR

---

## 4. Instruction Tuning (Supervised Fine-tuning / SFT)

### Format
```json
// Alpaca / ShareGPT format
{
  "instruction": "Write a Python function to calculate Fibonacci numbers.",
  "input": "",
  "output": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)"
}

// Chat format (LLaMA-2, Mistral, Gemma)
{
  "messages": [
    {"role": "user", "content": "What is 2+2?"},
    {"role": "assistant", "content": "2+2=4"}
  ]
}
```

### Prompt Templates
```python
# LLaMA-2 Chat Template
def format_llama2(messages):
    prompt = ""
    for msg in messages:
        if msg['role'] == 'system':
            prompt += f"<<SYS>>\n{msg['content']}\n<</SYS>>\n\n"
        elif msg['role'] == 'user':
            prompt += f"[INST] {msg['content']} [/INST]"
        elif msg['role'] == 'assistant':
            prompt += f" {msg['content']} </s>"
    return prompt

# Mistral / Zephyr (no system prompt by default)
def format_mistral(messages):
    prompt = ""
    for msg in messages:
        if msg['role'] == 'user':
            prompt += f"<s>[INST] {msg['content']} [/INST]"
        elif msg['role'] == 'assistant':
            prompt += f" {msg['content']}</s>"
    return prompt

# ChatML (OpenAI, Gemma, Qwen)
def format_chatml(messages):
    prompt = ""
    for msg in messages:
        prompt += f"<|im_start|>{msg['role']}\n{msg['content']}<|im_end|>\n"
    prompt += "<|im_start|>assistant\n"
    return prompt
```

### SFT Trainer (TRL)
```python
from trl import SFTTrainer

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    formatting_func=format_llama2,  # or dataset_text_field="text"
    max_seq_length=4096,
    args=TrainingArguments(
        learning_rate=2e-4,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        num_train_epochs=3,
        lr_scheduler_type="cosine",
        warmup_ratio=0.03,
        bf16=True,
        gradient_checkpointing=True,
    ),
    peft_config=None,  # Add for LoRA
)
```

---

## 5. LoRA (Low-Rank Adaptation)

### Core Idea
Freeze base model, inject trainable low-rank matrices:
$$\Delta W = B A \quad \text{where } A \in \mathbb{R}^{r \times d}, B \in \mathbb{R}^{d \times r}, r \ll d$$

### Implementation
```python
from peft import LoraConfig, get_peft_model, TaskType

lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=64,                          # Rank (typical: 8, 16, 32, 64, 128)
    lora_alpha=16,                 # Scaling: alpha/r
    lora_dropout=0.05,
    target_modules=[
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj",
        # "embed_tokens", "lm_head"  # Optional
    ],
    bias="none",
    modules_to_save=None,          # For classifier heads
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# trainable params: 4,194,304 || all params: 6,738,415,616 || trainable%: 0.0622%
```

### LoRA Config Guide
| Scenario | r | alpha | target_modules |
|----------|---|-------|----------------|
| **General SFT** | 16-32 | 16-32 | q,k,v,o + gate,up,down |
| **Code/Math** | 64-128 | 32-64 | All linear layers |
| **Minimal (1-2B)** | 8-16 | 16 | q,v only |
| **Maximum Quality** | 128-256 | 64-128 | All linear + embed + lm_head |

### LoRA Scaling
$$\text{Output} = Wx + \frac{\alpha}{r} BAx$$

- **alpha/r ≈ 1**: Standard
- **alpha/r > 1**: Stronger adaptation
- **alpha/r < 1**: Weaker, more regularized

---

## 6. QLoRA (Quantized LoRA)

### 4-bit Quantization + LoRA
```python
from transformers import BitsAndBytesConfig
from peft import LoraConfig, get_peft_model

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",          # NormalFloat4
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,     # Double quantization
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    quantization_config=bnb_config,
    device_map="auto",
)

model = prepare_model_for_kbit_training(model)

lora_config = LoraConfig(
    r=64, lora_alpha=16, lora_dropout=0.05,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                    "gate_proj", "up_proj", "down_proj"],
    bias="none",
)

model = get_peft_model(model, lora_config)
```

### Memory Comparison (7B Model)
| Method | GPU Memory | Trainable Params |
|--------|------------|------------------|
| **FFT (BF16)** | ~80 GB | 7B |
| **LoRA (BF16)** | ~24 GB | ~0.5% |
| **QLoRA (4-bit)** | ~8 GB | ~0.5% |
| **QLoRA (4-bit, r=64)** | ~10 GB | ~1% |

---

## 7. Advanced LoRA Variants

### DoRA (Weight-Decomposed LoRA)
```python
# Decomposes weight into magnitude + direction
# Better performance than LoRA at same rank

from peft import DoraConfig

dora_config = DoraConfig(
    r=64, lora_alpha=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
)
# Requires PEFT >= 0.10
model = get_peft_model(model, dora_config)
```

### LoRA+ / LoRA-GA
```python
# LoRA+: Different LR for A vs B matrices
# LoRA-GA: Gradient approximation for memory efficiency

# In TrainingArguments:
learning_rate_a = 2e-4   # For LoRA A
learning_rate_b = 2e-5   # For LoRA B (10x lower)
```

### VeRA (Vector-based Random Matrix Adaptation)
```python
# Single shared frozen random matrix + learnable vectors
# Even fewer parameters than LoRA

# vera_config = VeraConfig(r=256, ...)
```

### Mixture of LoRAs (MoL)
```python
# Multiple LoRA adapters, routed by task/domain
class MoLModel(nn.Module):
    def __init__(self, base_model, lora_configs, router):
        self.base = base_model
        self.loras = nn.ModuleList([get_peft_model(base_model, c) for c in lora_configs])
        self.router = router  # Learns to select LoRA per input
    
    def forward(self, x, task_id=None):
        if task_id is not None:
            return self.loras[task_id](x)
        # Route dynamically
        weights = self.router(x)
        return sum(w * lora(x) for w, lora in zip(weights, self.loras))
```

---

## 8. Other PEFT Methods

### Adapters (Houlsby / Pfeiffer / Parallel)
```python
# Small bottleneck layers between transformer layers
from peft import AdapterConfig

adapter_config = AdapterConfig(
    mh_adapter=True,        # Attention adapter
    output_adapter=True,    # FFN adapter
    adapter_size=64,        # Bottleneck size
    adapter_act="relu",
    adapter_dropout=0.1,
)

model = get_peft_model(model, adapter_config)
```

### Prefix / Prompt Tuning
```python
# Prepend learnable vectors to input (Prefix) or each layer (Prompt)
from peft import PromptTuningConfig, PrefixTuningConfig

prompt_config = PromptTuningConfig(
    task_type=TaskType.CAUSAL_LM,
    num_virtual_tokens=20,      # Soft prompt length
    prompt_tuning_init="TEXT",  # Initialize from vocab
    prompt_tuning_init_text="Classify the sentiment: ",
)

prefix_config = PrefixTuningConfig(
    task_type=TaskType.CAUSAL_LM,
    num_virtual_tokens=30,
    prefix_projection=True,     # MLP to project prompts
)
```

### (IA)³ (Infused Adapter by Inhibiting and Amplifying Inner Activations)
```python
# Learnable rescaling vectors for keys, values, FFN
# Very few parameters (3 * d_model per layer)

from peft import IA3Config

ia3_config = IA3Config(
    task_type=TaskType.CAUSAL_LM,
    target_modules=["k_proj", "v_proj", "down_proj"],
    feedforward_modules=["down_proj"],
)
```

### Parameter Comparison
| Method | Trainable Params (7B) | Relative Performance | Inference Latency |
|--------|----------------------|---------------------|-------------------|
| **Full FT** | 7B (100%) | 100% | Baseline |
| **LoRA (r=64)** | ~4M (0.06%) | 95-99% | +0% (merged) |
| **DoRA (r=64)** | ~4M (0.06%) | 97-100% | +0% (merged) |
| **Adapters** | ~1-2% | 90-95% | +5-10% |
| **Prefix Tuning** | ~0.1% | 85-92% | +5% |
| **Prompt Tuning** | ~0.01% | 80-90% | +2% |
| **(IA)³** | ~0.01% | 85-93% | +0% (merged) |
| **BitFit** | ~0.1% | 80-88% | +0% |

---

## 9. Fine-tuning Strategy Decision Tree

```
START: What's your constraint?
│
├─ Compute: Unlimited → Full FT (or CPT → SFT)
│
├─ Compute: Limited (1-4 GPUs) → QLoRA (4-bit) or LoRA (BF16)
│
├─ Compute: Very Limited (1 GPU, <24GB) → QLoRA (r=32-64)
│
├─ Need: Maximum Quality → Full FT or DoRA (r=128-256)
│
├─ Need: Multiple Tasks/Domains → Mixture of LoRAs
│
├─ Need: Fast Switching → LoRA (merge/unmerge) or Adapters
│
├─ Need: Minimal Storage → Prompt Tuning / (IA)³
│
├─ Need: Domain Adaptation → CPT → SFT (LoRA/QLoRA)
│
└─ Need: Instruction Following → SFT (LoRA/QLoRA) → DPO
```

---

## 10. Training Recipes by Strategy

### QLoRA SFT (Standard Recipe)
```python
# 7B model, single A100 40GB or 80GB
training_args = TrainingArguments(
    output_dir="./qlora-sft",
    num_train_epochs=3,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=16,  # Effective batch = 32
    learning_rate=2e-4,
    lr_scheduler_type="cosine",
    warmup_ratio=0.03,
    weight_decay=0.0,
    bf16=True,
    tf32=True,
    gradient_checkpointing=True,
    optim="paged_adamw_32bit",       # 8-bit Adam for QLoRA
    logging_steps=10,
    save_steps=500,
    eval_steps=500,
    save_total_limit=3,
    load_best_model_at_end=True,
    metric_for_best_model="eval_loss",
    greater_is_better=False,
    report_to="wandb",
    dataloader_num_workers=4,
    remove_unused_columns=False,
)

# LoRA config
lora_config = LoraConfig(
    r=64,
    lora_alpha=16,
    lora_dropout=0.05,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                    "gate_proj", "up_proj", "down_proj"],
    bias="none",
    task_type="CAUSAL_LM",
)
```

### Full FT with FSDP (Multi-GPU)
```python
training_args = TrainingArguments(
    fsdp="full_shard auto_wrap",
    fsdp_config={
        "sharding_strategy": "FULL_SHARD",
        "backward_prefetch": "BACKWARD_PRE",
        "forward_prefetch": True,
        "cpu_offload": False,
    },
    # ... rest same
)
```

---

## 11. Merging & Exporting

### Merge LoRA into Base
```python
# After training
model = model.merge_and_unload()  # Merges LoRA weights into base
model.save_pretrained("./merged-model")
tokenizer.save_pretrained("./merged-model")

# Or for deployment
model.push_to_hub("my-org/my-finetuned-model")
```

### Convert to GGUF (llama.cpp)
```bash
# Using llama.cpp convert script
python convert-hf-to-gguf.py ./merged-model --outfile model.gguf --outtype q4_k_m

# Quantization options: q4_k_m (recommended), q5_k_m, q8_0, f16
```

### Export to ONNX / TensorRT
```python
# ONNX
torch.onnx.export(model, dummy_input, "model.onnx", opset_version=17)

# TensorRT (via ONNX)
trtexec --onnx=model.onnx --saveEngine=model.trt --fp16
```

---

## 12. Evaluation During Fine-tuning

### Metrics to Track
```python
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    
    # For generation tasks
    if is_generation:
        return {
            "bleu": bleu_score(predictions, labels),
            "rouge": rouge_score(predictions, labels),
            "bertscore": bertscore(predictions, labels),
        }
    
    # For classification
    return {
        "accuracy": accuracy_score(labels, predictions),
        "f1": f1_score(labels, predictions, average="macro"),
        "perplexity": np.exp(loss),
    }
```

### Validation Strategies
| Strategy | Description |
|----------|-------------|
| **Hold-out** | Fixed validation set (10-20%) |
| **Cross-validation** | k-fold (expensive for LLMs) |
| **Live eval** | Generate samples every N steps, human eval |
| **Benchmark** | MMLU, GSM8K, HumanEval, MT-Bench periodically |

---

## 13. Common Issues & Fixes

| Issue | Symptom | Fix |
|-------|---------|-----|
| **Overfitting** | Train loss ↓, Val loss ↑ | Increase dropout, reduce LR, more data, early stopping |
| **Catastrophic Forgetting** | Base capabilities degrade | Lower LR, shorter training, LoRA (not FFT), replay buffer |
| **Gradient Explosion** | Loss = NaN | Gradient clipping (1.0), lower LR, bf16 stability |
| **Slow Convergence** | Loss plateaus high | Increase LR, check data quality, increase batch size |
| **OOM** | CUDA OOM | Gradient accumulation, gradient checkpointing, QLoRA, FSDP |
| **LoRA Not Learning** | Val loss flat | Increase r, alpha, check target_modules, unfreeze more layers |

---

## 14. Key Takeaways

1. **QLoRA (r=64, alpha=16)** is the default starting point for most fine-tuning
2. **Full FT only when compute permits** and maximum quality needed
3. **CPT → SFT pipeline** for domain adaptation
4. **Merge LoRA before deployment** for zero latency overhead
5. **Target all linear layers** (attn + FFN) for best results
6. **BF16 + Gradient Checkpointing + FlashAttention** for memory efficiency
6. **Monitor perplexity + downstream metrics** — training loss alone is insufficient
7. **Merge and quantize (GGUF)** for edge/CPU deployment