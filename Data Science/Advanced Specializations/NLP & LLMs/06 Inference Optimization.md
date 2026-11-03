# Inference Optimization for LLMs

Making LLMs fast, cheap, and scalable in production. Covers quantization, speculative decoding, serving engines, and hardware optimization.

## 1. The Optimization Hierarchy

```
Model Level          →  Serving Level           →  System Level
├── Quantization     →  ├── KV Caching          →  ├── Batching
├── Pruning          →  ├── Speculative Decoding →  ├── Pipeline Parallelism
├── Distillation     →  ├── Continuous Batching  →  ├── Tensor Parallelism
├── Architecture     →  ├── Paged Attention      →  ├── Expert Parallelism
└── Compilation      →  └── Prefix Caching      └── Load Balancing
```

---

## 2. Quantization

### Post-Training Quantization (PTQ)

#### GPTQ (One-Shot Weight Quantization)
```python
# Quantize weights to 4-bit using calibration data
from auto_gptq import AutoGPTQForCausalLM

model = AutoGPTQForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    quantize_config={
        "bits": 4,
        "group_size": 128,
        "desc_act": False,
    },
)

# Calibration
model.quantize(calibration_dataset, batch_size=1)
model.save_quantized("./llama-2-7b-gptq-4bit")
```

#### AWQ (Activation-Aware Weight Quantization)
```python
# Protects salient weights based on activation magnitudes
from awq import AutoAWQForCausalLM

model = AutoAWQForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    quant_config={
        "zero_point": True,
        "q_group_size": 128,
        "w_bit": 4,
        "version": "GEMM",
    },
)
model.quantize(tokenizer, calib_data=calibration_dataset)
model.save_quantized("./llama-2-7b-awq-4bit")
```

### Quantization Formats Comparison

| Format | Bits | Quality | Speed | Hardware | Use Case |
|--------|------|---------|-------|----------|----------|
| **FP16/BF16** | 16 | Baseline | Baseline | All GPUs | Training, quality-critical |
| **GPTQ** | 4/3/2 | Good | Fast | GPU (CUDA) | General inference |
| **AWQ** | 4/3 | Better | Fastest | GPU (CUDA) | Quality-sensitive |
| **GGUF** | 4/5/8 | Good | CPU/GPU | llama.cpp | Edge, CPU, Apple Silicon |
| **bitsandbytes** | 4/8 | Good | Medium | GPU (CUDA) | Training + inference |
| **FP8** | 8 | Near-FP16 | Fast | H100+ | H100/H200 inference |
| **INT8** | 8 | Good | Fast | All GPUs | General |

### GGUF (llama.cpp) - Edge/CPU Deployment
```bash
# Convert
python convert-hf-to-gguf.py ./model --outfile model.gguf --outtype q4_k_m

# Quantization options (quality → speed):
# q2_k (smallest, lowest quality)
# q3_k_m
# q4_k_m (recommended balance)
# q5_k_m
# q6_k
# q8_0 (highest quality)
# f16 (full precision)

# Run with llama.cpp
./llama-cli -m model.gguf -c 4096 -ngl 32 -p "Hello"
```

### Quantization-Aware Training (QAT)
```python
# Train with fake quantization (straight-through estimator)
from torch.ao.quantization import FakeQuantize

class QATLinear(nn.Linear):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.weight_fake_quant = FakeQuantize.with_args(
            observer=MovingAverageMinMaxObserver,
            quant_min=-8, quant_max=7,  # 4-bit signed
            dtype=torch.qint8,
            qscheme=torch.per_channel_symmetric,
        )
    
    def forward(self, x):
        w_q = self.weight_fake_quant(self.weight)
        return F.linear(x, w_q, self.bias)
```

---

## 3. KV Caching

### Standard KV Cache
```python
class KVCache:
    def __init__(self, max_batch, max_seq, n_layers, n_heads, head_dim, dtype=torch.bfloat16):
        self.k_cache = torch.zeros(max_batch, n_layers, n_heads, max_seq, head_dim, dtype=dtype)
        self.v_cache = torch.zeros(max_batch, n_layers, n_heads, max_seq, head_dim, dtype=dtype)
        self.seq_lens = torch.zeros(max_batch, dtype=torch.int32)
    
    def update(self, layer_idx, k, v):
        # k, v: (batch, n_heads, 1, head_dim) for single token
        b = k.shape[0]
        pos = self.seq_lens[b]
        self.k_cache[b, layer_idx, :, pos:pos+1] = k
        self.v_cache[b, layer_idx, :, pos:pos+1] = v
        self.seq_lens[b] += 1
    
    def get(self, layer_idx, batch_idx):
        seq_len = self.seq_lens[batch_idx]
        return self.k_cache[batch_idx, layer_idx, :, :seq_len], \
               self.v_cache[batch_idx, layer_idx, :, :seq_len]
```

### PagedAttention (vLLM)
```python
# Virtual memory for KV cache - eliminates fragmentation
class PagedKVCache:
    def __init__(self, block_size=16, num_blocks=10000):
        self.block_size = block_size
        self.blocks = []  # List of (k_block, v_block)
        self.free_blocks = list(range(num_blocks))
        self.block_tables = {}  # seq_id → list of block_ids
    
    def allocate(self, seq_id, num_tokens):
        num_blocks = (num_tokens + self.block_size - 1) // self.block_size
        blocks = [self.free_blocks.pop() for _ in range(num_blocks)]
        self.block_tables[seq_id] = blocks
    
    def append(self, seq_id, k, v):
        # Append to appropriate blocks
        pass
```

### Multi-Query / Grouped Query Attention (MQA/GQA)
```python
# Reduces KV cache size
# MHA: n_heads K,V per layer
# MQA: 1 K,V head shared across all Q heads
# GQA: n_kv_heads < n_q_heads (e.g., 8 KV for 32 Q)

# Cache size reduction:
# MHA: 2 * n_layers * n_heads * head_dim * seq_len
# GQA: 2 * n_layers * n_kv_heads * head_dim * seq_len
# Reduction factor: n_kv_heads / n_heads (e.g., 8/32 = 4x smaller)
```

---

## 4. Speculative Decoding

### Core Idea
Use a small **draft model** to generate multiple tokens, verify with **target model** in parallel.

```python
class SpeculativeDecoder:
    def __init__(self, target_model, draft_model, max_spec_tokens=4):
        self.target = target_model
        self.draft = draft_model
        self.max_spec = max_spec_tokens
    
    def generate(self, input_ids, max_new_tokens=100):
        generated = input_ids
        
        while len(generated) < max_new_tokens:
            # 1. Draft model proposes K tokens
            draft_tokens = self.draft.generate(generated, max_new_tokens=self.max_spec)
            
            # 2. Target model verifies all K+1 tokens in ONE forward pass
            # (draft tokens + 1 bonus token)
            verification_input = torch.cat([generated, draft_tokens], dim=-1)
            target_logits = self.target(verification_input).logits
            
            # 3. Accept/Reject using probability ratio
            accepted = []
            for i, draft_token in enumerate(draft_tokens):
                p_target = F.softmax(target_logits[:, -len(draft_tokens)+i], dim=-1)[0, draft_token]
                p_draft = self.draft.logits[:, i][0, draft_token]
                
                if torch.rand(1) < min(1, p_target / (p_draft + 1e-10)):
                    accepted.append(draft_token)
                else:
                    # Resample from target
                    accepted.append(torch.multinomial(target_logits[:, -len(draft_tokens)+i], 1))
                    break  # Stop at first rejection
            
            generated = torch.cat([generated] + accepted, dim=-1)
        
        return generated
```

### Draft Model Options
| Draft Model | Speedup | Quality Loss | Notes |
|-------------|---------|--------------|-------|
| **Smaller LLM** (LLaMA-68M) | 2-3x | Low | Separate model |
| **Medusa Heads** | 2-2.5x | Very Low | Extra heads on target |
| **EAGLE** | 2.5-3x | Very Low | Feature-based draft |
| **Self-Speculative** | 1.5-2x | None | Early layers of same model |
| **Lookup Decoding** | 1.5-2x | None | N-gram lookup (no model) |

### Medusa (Multiple Heads)
```python
# Add extra linear heads to predict next N tokens
class MedusaModel(nn.Module):
    def __init__(self, base_model, num_heads=5):
        super().__init__()
        self.base = base_model
        self.medusa_heads = nn.ModuleList([
            nn.Linear(base_model.config.hidden_size, base_model.config.vocab_size)
            for _ in range(num_heads)
        ])
    
    def forward(self, input_ids):
        outputs = self.base(input_ids, output_hidden_states=True)
        hidden = outputs.hidden_states[-1]
        
        # Base LM head
        base_logits = self.base.lm_head(hidden)
        
        # Medusa heads (each predicts next token)
        medusa_logits = [head(hidden) for head in self.medusa_heads]
        
        return base_logits, medusa_logits

# Training: Freeze base, train heads on tree attention
```

### EAGLE (Extrapolation)
```python
# Use feature extrapolation instead of separate model
class EAGLEDecoder:
    def __init__(self, target_model, eagle_model):
        self.target = target_model
        self.eagle = eagle_model  # Small MLP on top of hidden states
    
    def draft(self, hidden_states):
        # Predict next token's hidden state
        next_hidden = self.eagle(hidden_states)
        # Use target's LM head to get logits
        logits = self.target.lm_head(next_hidden)
        return logits
```

---

## 5. Serving Engines

### vLLM (High-Throughput)
```python
from vllm import LLM, SamplingParams

llm = LLM(
    model="meta-llama/Llama-2-7b-hf",
    tensor_parallel_size=2,      # Multi-GPU
    gpu_memory_utilization=0.9,
    max_model_len=4096,
    dtype="bfloat16",
    quantization="awq",          # or "gptq", "bitsandbytes"
    enforce_eager=False,         # Use CUDA graphs
    max_num_batched_tokens=8192,
    max_num_seqs=256,
)

sampling = SamplingParams(
    temperature=0.7,
    top_p=0.9,
    max_tokens=512,
    stop=["###"],
)

outputs = llm.generate(prompts, sampling)
```

### TensorRT-LLM (NVIDIA Optimized)
```python
# 1. Convert to TensorRT engine
trtllm-build --checkpoint_dir ./model \
    --output_dir ./trt_engine \
    --dtype bfloat16 \
    --use_paged_kv_cache \
    --max_batch_size 256 \
    --max_input_len 2048 \
    --max_output_len 512 \
    --max_beam_width 1

# 2. Serve with Triton
# triton_model_repo/
#   tensorrt_llm/
#     config.pbtxt
#     1/
#       model.plan
```

### SGLang (Structured Generation)
```python
import sglang as sgl

@sgl.function
def multi_hop_qa(s, question):
    s += f"Question: {question}\n"
    for _ in range(3):
        s += "Thought: " + sgl.gen("thought", max_tokens=100) + "\n"
        s += "Search: " + sgl.gen("search", max_tokens=50, stop="\n") + "\n"
        s += "Result: " + sgl.gen("result", max_tokens=200) + "\n"
    s += "Answer: " + sgl.gen("answer", max_tokens=100)

state = multi_hop_qa.run(question="Who won the 2022 World Cup?")
print(state["answer"])
```

### TGI (Text Generation Inference)
```bash
# Docker
docker run --gpus all -p 8080:80 \
    ghcr.io/huggingface/text-generation-inference:latest \
    --model-id meta-llama/Llama-2-7b-hf \
    --quantize awq \
    --max-batch-prefill-tokens 4096 \
    --max-total-tokens 8192
```

```python
# Client
from text_generation import Client
client = Client("http://localhost:8080", timeout=60)
response = client.generate("Hello", max_new_tokens=100, temperature=0.7)
```

### Engine Comparison
| Engine | Throughput | Latency | Features | Best For |
|--------|------------|---------|----------|----------|
| **vLLM** | High | Low | PagedAttn, Chunked Prefill, Spec Decode | General LLM serving |
| **TGI** | High | Low | Streaming, Logprobs, Watermark | HF ecosystem |
| **SGLang** | High | Low | Structured Gen, Radix Cache | Agentic/Structured |
| **TensorRT-LLM** | Highest | Lowest | FP8, INT4, Multi-GPU | Max throughput |
| **Triton + TRT-LLM** | Highest | Lowest | Multi-model, Ensemble | Enterprise |
| **llama.cpp** | Low | Medium | CPU, Apple Silicon, Quantized | Edge, Local |

---

## 6. Batching Strategies

### Continuous Batching (vLLM/SGLang)
```python
# Requests added/removed dynamically
# No padding waste - each sequence at its own position

# Traditional Static Batching (wasteful)
# [Seq1: 100 tokens] [PAD] [PAD] [PAD]
# [Seq2: 50 tokens]  [PAD] [PAD] [PAD] [PAD]

# Continuous Batching (efficient)
# [Seq1: 100] [Seq2: 50] [Seq3: 200] [Seq4: 30] ...
# Each at its own decode step
```

### Chunked Prefill
```python
# Split long prefill into chunks to interleave with decode
# Reduces TTFT (Time To First Token) for long prompts

# vLLM config
llm = LLM(
    enable_chunked_prefill=True,
    max_num_batched_tokens=8192,
    # Long prompts split into chunks, interleaved with decode
)
```

---

## 6. Distillation

### Knowledge Distillation
```python
# Teacher → Student
def distillation_loss(student_logits, teacher_logits, labels, temperature=2.0, alpha=0.5):
    # Soft targets
    soft_loss = F.kl_div(
        F.log_softmax(student_logits / temperature, dim=-1),
        F.softmax(teacher_logits / temperature, dim=-1),
        reduction="batchmean"
    ) * (temperature ** 2)
    
    # Hard targets
    hard_loss = F.cross_entropy(student_logits, labels)
    
    return alpha * soft_loss + (1 - alpha) * hard_loss

# Train smaller model (e.g., 1B) from larger (7B)
```

### MiniLLM / TinyLlama Approach
```python
# Reverse KL (mode-seeking) for better student
def reverse_kl_loss(student_logits, teacher_logits):
    return F.kl_div(
        F.log_softmax(teacher_logits, dim=-1),
        F.softmax(student_logits, dim=-1),
        reduction="batchmean"
    )
```

---

## 7. Hardware-Specific Optimization

### H100 / H200 (FP8, TMA, Cluster Launch)
```python
# FP8 GEMM (H100+)
# Native FP8 tensor cores - 2x throughput vs BF16

# Tensor Memory Accelerator (TMA)
# Async copy between global and shared memory
# Overlaps compute with data movement

# Cluster Launch (Thread Block Clusters)
# Multiple thread blocks cooperate on single GEMM
# Better SM utilization for small GEMMs (decoding)
```

### A100 / A800 (BF16, Sparsity)
```python
# BF16 Tensor Cores
# Structured Sparsity (2:4) - 2x speedup for sparse weights
# Requires weight pruning to 2:4 pattern
```

### Apple Silicon (Metal, Unified Memory)
```python
# llama.cpp with Metal
./llama-cli -m model.gguf -ngl 99  # Offload all layers to GPU

# MPS (PyTorch)
device = torch.device("mps")
model = model.to(device)
```

---

## 8. Benchmarking & Profiling

### Key Metrics
```python
def benchmark(model, prompts, sampling_params):
    import time
    
    # Warmup
    for _ in range(3):
        _ = model.generate(prompts[:1])
    
    torch.cuda.synchronize()
    start = time.time()
    
    outputs = model.generate(prompts, sampling_params)
    
    torch.cuda.synchronize()
    end = time.time()
    
    total_tokens = sum(len(o.outputs[0].token_ids) for o in outputs)
    total_time = end - start
    
    return {
        "throughput_toks_per_sec": total_tokens / total_time,
        "latency_per_token_ms": (total_time / total_tokens) * 1000,
        "ttft_ms": measure_ttft(model, prompts[0]),  # Time to first token
        "tps_per_user": total_tokens / total_time / len(prompts),
    }
```

### Profiling Tools
```bash
# NVIDIA Nsight Systems (system-level)
nsys profile --stats=true python serve.py

# NVIDIA Nsight Compute (kernel-level)
ncu --target-processes all python serve.py

# PyTorch Profiler
from torch.profiler import profile, ProfilerActivity
with profile(activities=[ProfilerActivity.CUDA], record_shapes=True) as prof:
    model.generate(...)
prof.export_chrome_trace("trace.json")
```

---

## 9. Cost Optimization

### Cost per 1M Tokens (Estimates, 2024)
| Model | Hardware | Quant | Throughput | Cost/M Tokens |
|-------|----------|-------|------------|---------------|
| **LLaMA-2-7B** | 1×A100 40GB | AWQ-4bit | 150 tok/s | ~$0.0002 |
| **LLaMA-2-13B** | 2×A100 80GB | AWQ-4bit | 120 tok/s | ~$0.0005 |
| **LLaMA-2-70B** | 4×A100 80GB | AWQ-4bit | 80 tok/s | ~$0.002 |
| **Mixtral-8x7B** | 2×A100 80GB | AWQ-4bit | 100 tok/s | ~$0.0008 |
| **GPT-4 (API)** | - | - | - | $0.03-0.06 |

### Cost Reduction Strategies
```python
# 1. Route easy queries to small models
def route_query(query):
    if is_simple(query):
        return small_model  # 1B-3B
    elif is_coding(query):
        return code_model
    else:
        return large_model

# 2. Cache frequent queries
from functools import lru_cache
@lru_cache(maxsize=10000)
def cached_generate(prompt):
    return model.generate(prompt)

# 3. Batch inference for offline workloads
# 4. Spot instances for batch jobs (70-90% discount)
# 5. Quantize to 4-bit (4x memory, 2x speed)
```

---

## 10. Production Checklist

- [ ] **Quantization**: AWQ/GPTQ 4-bit for GPU, GGUF q4_k_m for CPU
- [ ] **KV Cache**: PagedAttention (vLLM) or native (TGI)
- [ ] **Speculative Decoding**: Medusa/EAGLE for 2x speedup
- [ ] **Serving Engine**: vLLM (general), SGLang (structured), TensorRT-LLM (max throughput)
- [ ] **Batching**: Continuous batching + chunked prefill
- [ ] **Quantization**: FP8 on H100, AWQ on A100
- [ ] **Monitoring**: TTFT, TPOT, throughput, GPU utilization, queue depth
- [ ] **Autoscaling**: Scale on queue depth, not CPU
- [ ] **Caching**: Semantic cache for repeated queries
- [ ] **Fallback**: CPU offload (llama.cpp) for overflow

---

## 11. Key Takeaways

1. **AWQ 4-bit + vLLM** is the production sweet spot for A100/H100
2. **PagedAttention + Continuous Batching** eliminates KV cache fragmentation
3. **Speculative Decoding (Medusa/EAGLE)** gives 2x speedup with minimal quality loss
4. **FP8 on H100** is the next frontier (2x throughput vs BF16)
4. **Quantization + Batching + Speculative** compound multiplicatively
5. **Route queries** to smallest capable model
6. **Monitor TTFT separately** from throughput — different bottlenecks
7. **Profile before optimizing** — Nsight Compute reveals true bottlenecks