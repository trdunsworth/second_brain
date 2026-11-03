# Real-time Model Serving

Real-time serving infrastructure for ML models with low latency, high throughput, and high availability.

## 1. Serving Architecture Patterns

### 1.1 Architecture Overview
```
┌─────────────────────────────────────────────────────────────────────┐
│                     REAL-TIME SERVING ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Client ──► [Load Balancer] ──► [API Gateway] ──► [Model Servers]  │
│                    │              │               │                 │
│                    │              │               ├── [GPU Pod 1]   │
│                    │              │               ├── [GPU Pod 2]   │
│                    │              │               └── [GPU Pod N]   │
│                    │              │               │                 │
│                    │              │               ▼                 │
│                    │              │         [Feature Store]         │
│                    │              │         (Redis/DynamoDB)        │
│                    │              │                                 │
│                    ▼              ▼                                 │
│           [Monitoring]        [Logging/Tracing]                     │
│         (Prometheus)         (Jaeger/Zipkin)                        │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Serving Patterns

| Pattern | Use Case | Latency | Complexity |
|---------|----------|---------|------------|
| **Synchronous REST/gRPC** | Real-time inference | 10-100ms | Low |
| **Async/Queue** | Batch, async processing | 100ms-1s | Medium |
| **Streaming** | Real-time pipelines | <10ms | High |
| **Edge/Device** | Offline, privacy | <5ms | High |

---

## 2. Model Serving Frameworks

### 2.1 vLLM (High-Throughput LLM Serving)
```python
# Installation
pip install vllm

# Basic serving
from vllm import LLM, SamplingParams

llm = LLM(
    model="meta-llama/Llama-2-7b-hf",
    tensor_parallel_size=2,        # Multi-GPU
    gpu_memory_utilization=0.9,    # 90% GPU memory
    max_model_len=4096,            # Context window
    dtype="bfloat16",              # or float16
    quantization="awq",            # or "gptq", "bitsandbytes"
    enforce_eager=False,           # CUDA graphs
    max_num_batched_tokens=8192,   # Batch size control
    max_num_seqs=256,              # Concurrent sequences
)

# Sampling
sampling_params = SamplingParams(
    temperature=0.7,
    top_p=0.9,
    max_tokens=512,
    stop=["###", "User:"],
    n=1,                           # Number of completions
    best_of=1,                     # Beam search
    use_beam_search=False,
)

# Generate
outputs = llm.generate(prompts, sampling_params)
for output in outputs:
    print(output.outputs[0].text)

# Async serving
from vllm.engine.async_llm_engine import AsyncLLMEngine

engine = AsyncLLMEngine.from_engine_args(EngineArgs(...))
async for output in engine.generate(prompt, sampling_params):
    yield output
```

### 2.2 TensorRT-LLM (NVIDIA Optimized)
```python
# 1. Build TensorRT Engine
trtllm-build --checkpoint_dir ./model \
    --output_dir ./trt_engine \
    --dtype bfloat16 \
    --use_paged_kv_cache \
    --max_batch_size 256 \
    --max_input_len 2048 \
    --max_output_len 512 \
    --max_beam_width 1

# 2. Serve with Triton Inference Server
# triton_model_repo/
#   tensorrt_llm/
#     config.pbtxt
#     1/
#       model.plan

# config.pbtxt
name: "tensorrt_llm"
backend: "tensorrt"
max_batch_size: 256
input [
  {
    name: "input_ids"
    data_type: TYPE_INT32
    dims: [ -1, -1 ]
  }
  {
    name: "input_lengths"
    data_type: TYPE_INT32
    dims: [ -1 ]
  }
  {
    name: "request_output_len"
    data_type: TYPE_INT32
    dims: [ 1 ]
  }
]
output [
  {
    name: "output_ids"
    data_type: TYPE_INT32
    dims: [ -1, -1 ]
  }
  {
    name: "sequence_length"
    data_type: TYPE_INT32
    dims: [ -1 ]
  }
]
instance_group [
  {
    count: 2
    kind: KIND_GPU
    gpus: [0, 1]
  }
]
dynamic_batching {
  max_queue_delay_microseconds: 100
  preferred_batch_size: [8, 16, 32, 64, 128]
}
```

### 2.3 SGLang (Structured Generation)
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

# Runtime with RadixAttention
runtime = sgl.Runtime(
    model_path="meta-llama/Llama-2-7b-hf",
    tp_size=2,
    mem_fraction_static=0.85,
    enable_radix_attention=True  # Prefix caching
)

state = multi_hop_qa.run(
    question="Who won the 2022 World Cup?",
    temperature=0.7
)
print(state["answer"])
```

### 2.4 TGI (Text Generation Inference - Hugging Face)
```bash
# Docker
docker run --gpus all -p 8080:80 \
    ghcr.io/huggingface/text-generation-inference:latest \
    --model-id meta-llama/Llama-2-7b-hf \
    --quantize awq \
    --max-batch-prefill-tokens 4096 \
    --max-total-tokens 8192 \
    --max-concurrent-requests 128
```

```python
# Client
from text_generation import Client

client = Client("http://localhost:8080", timeout=60)

# Streaming
for token in client.generate_stream(
    "Hello, how are you?",
    max_new_tokens=100,
    temperature=0.7,
    top_p=0.9
):
    print(token, end="", flush=True)

# Batch
outputs = client.generate([
    "Prompt 1",
    "Prompt 2",
], max_new_tokens=100, temperature=0.7)
```

---

## 3. Model Optimization for Serving

### 3.1 Quantization
```python
# GPTQ (Post-training quantization)
from auto_gptq import AutoGPTQForCausalLM

model = AutoGPTQForCausalLM.from_quantized(
    "TheBloke/Llama-2-7B-GPTQ",
    device="cuda:0",
    use_triton=False
)

# AWQ (Activation-aware Weight Quantization)
from awq import AutoAWQForCausalLM

model = AutoAWQForCausalLM.from_quantized(
    "TheBloke/Llama-2-7B-AWQ",
    fuse_layers=True,
    device="cuda:0"
)

# bitsandbytes (8-bit / 4-bit)
from transformers import BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4"
)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    quantization_config=bnb_config,
    device_map="auto"
)

# GGUF (llama.cpp - CPU/Apple Silicon)
# Convert: python convert-hf-to-gguf.py model --outfile model.gguf --outtype q4_k_m
# Quantization: q2_k, q3_k, q4_k_m (recommended), q5_k, q6_k, q8_0, f16
```

### 3.2 Distillation
```python
# Knowledge Distillation (Teacher -> Student)
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

# Reverse KL (mode-seeking)
def reverse_kl_loss(student_logits, teacher_logits):
    return F.kl_div(
        F.log_softmax(teacher_logits, dim=-1),
        F.softmax(student_logits, dim=-1),
        reduction="batchmean"
    )
```

### 3.3 Compilation & Optimization
```python
# PyTorch 2.0+ Compilation
import torch

# Torch Compile (PyTorch 2.0+)
model = torch.compile(model, mode="reduce-overhead", fullgraph=True)

# TorchScript (legacy)
scripted = torch.jit.script(model)
scripted.save("model_ts.pt")

# ONNX Export
import torch.onnx
torch.onnx.export(
    model, dummy_input, "model.onnx",
    opset_version=17,
    do_constant_folding=True,
    input_names=["input_ids"],
    output_names=["logits"],
    dynamic_axes={"input_ids": {0: "batch", 1: "seq"}}
)

# TensorRT via ONNX
# trtexec --onnx=model.onnx --saveEngine=model.trt --fp16
```

### 3.4 Speculative Decoding
```python
# Medusa (Multiple decoding heads)
class MedusaModel(nn.Module):
    def __init__(self, base_model, num_heads=5):
        super().__init__()
        self.base_model = base_model
        self.medusa_heads = nn.ModuleList([
            nn.Linear(base_model.config.hidden_size, base_model.config.vocab_size)
            for _ in range(num_heads)
        )
    
    def forward(self, input_ids):
        outputs = self.base_model(input_ids, output_hidden_states=True)
        hidden = outputs.hidden_states[-1]
        
        base_logits = self.base_model.lm_head(hidden)
        medusa_logits = [head(hidden) for head in self.medusa_heads]
        
        return base_logits, medusa_logits

# EAGLE (Feature extrapolation)
class EAGLEDecoder:
    def __init__(self, base_model, eagle_model):
        self.base = base_model
        self.eagle = eagle_model
    
    def draft(self, hidden_states):
        next_hidden = self.eagle(hidden_states)
        return self.base.lm_head(next_hidden)

# Speculative Decoding Loop
def speculative_decode(model, draft_model, input_ids, max_new_tokens=50):
    for _ in range(max_new_tokens):
        # Draft model proposes K tokens
        draft_tokens = draft_model.generate(input_ids, max_new_tokens=4)
        
        # Target model verifies in parallel
        all_tokens = torch.cat([input_ids, draft_tokens], dim=-1)
        target_logits = model(all_tokens).logits
        
        # Accept/Reject
        accepted = verify_and_accept(draft_tokens, target_logits)
        input_ids = torch.cat([input_ids, accepted], dim=-1)
        
        if len(accepted) < len(draft_tokens):
            break
    
    return input_ids
```

---

## 4. Batching & Scheduling

### 4.1 Continuous Batching (vLLM/SGLang)
```python
# vLLM Continuous Batching
# Requests added/removed dynamically - no padding waste

# Scheduler Configuration
llm = LLM(
    model="meta-llama/Llama-2-7b-hf",
    max_num_batched_tokens=8192,    # Total tokens per batch
    max_num_seqs=256,               # Max concurrent sequences
    scheduler_policy="fcfs",        # fcfs, priority
    enable_chunked_prefill=True,    # Chunk long prefill
    max_num_batched_prefill=4096,   # Max prefill tokens
)

# SGLang Continuous Batching + RadixAttention
runtime = sgl.Runtime(
    model_path="model",
    enable_radix_attention=True,    # Prefix caching
    max_prefill_tokens=4096,
    chunked_prefill_size=2048,
)
```

### 4.2 Chunked Prefill
```python
# vLLM Chunked Prefill
# Split long prefill into chunks, interleave with decode

llm = LLM(
    enable_chunked_prefill=True,
    max_num_batched_tokens=8192,
    chunked_prefill_max_seq_len=4096,
)

# Benefits:
# - Reduces TTFT (Time To First Token) for long prompts
# - Better GPU utilization
# - Enables longer context
```

### 4.3 Prefix Caching (RadixAttention)
```python
# SGLang RadixAttention (Automatic Prefix Caching)
# Caches KV for common prefixes (system prompts, few-shot examples)

runtime = sgl.Runtime(
    model_path="model",
    enable_radix_attention=True,     # Enable prefix caching
    radix_attention_max_tokens=4096, # Max cached tokens
)

# vLLM (experimental)
llm = LLM(
    model="model",
    enable_prefix_caching=True,      # vLLM 0.4+
)
```

---

## 5. Deployment Infrastructure

### 5.1 Kubernetes Deployment
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: llm-serving
spec:
  replicas: 4
  selector:
    matchLabels:
      app: llm-serving
  template:
    metadata:
      labels:
        app: llm-serving
    spec:
      containers:
      - name: vllm
        image: vllm/vllm-openai:latest
        command: ["python", "-m", "vllm.entrypoints.openai.api_server"]
        args:
          - "--model=meta-llama/Llama-2-7b-hf"
          - "--tensor-parallel-size=2"
          - "--gpu-memory-utilization=0.9"
          - "--max-model-len=4096"
          - "--dtype=bfloat16"
          - "--quantization=awq"
          - "--max-num-batched-tokens=8192"
          - "--max-num-seqs=256"
        resources:
          requests:
            nvidia.com/gpu: "2"
            memory: "40Gi"
            cpu: "8"
          limits:
            nvidia.com/gpu: "2"
            memory: "45Gi"
            cpu: "16"
        ports:
        - containerPort: 8000
        env:
        - name: HF_TOKEN
          valueFrom:
            secretKeyRef:
              name: hf-token
              key: token
---
# Service
apiVersion: v1
kind: Service
metadata:
  name: llm-serving
spec:
  selector:
    app: llm-serving
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer
---
# HPA (Horizontal Pod Autoscaler)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: llm-serving-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: llm-serving
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Prometheus
    prometheus:
      queryName: gpu_utilization
      threshold:
        type: AverageValue
        averageValue: "70"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
    scaleUp:
      stabilizationWindowSeconds: 60
```

### 5.2 KServe (ModelMesh)
```yaml
# InferenceService.yaml
apiVersion: serving.kserve.io/v1beta1
kind: InferenceService
metadata:
  name: llm-service
spec:
  predictor:
    model:
      modelFormat:
        name: pytorch
      storageUri: s3://bucket/models/llama-2-7b
      runtime: vllm
      resources:
        limits:
          nvidia.com/gpu: "2"
          memory: "40Gi"
        requests:
          nvidia.com/gpu: "2"
          memory: "30Gi"
      args:
        - "--tensor-parallel-size=2"
        - "--gpu-memory-utilization=0.9"
```

### 5.3 BentoML (Framework Agnostic)
```python
# service.py
import bentoml
from bentoml.io import Text, JSON

@bentoml.service(
    resources={"gpu": "2"},
    traffic={"timeout": 300},
    workers=2
)
class LLMService:
    def __init__(self):
        self.model = bentoml.models.get("llama-2-7b").load()
        self.tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-hf")
    
    @bentoml.api
    async def generate(self, prompt: str, max_tokens: int = 512) -> str:
        inputs = self.tokenizer(prompt, return_tensors="pt").to("cuda")
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=0.7,
                do_sample=True
            )
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True)

# Build & Deploy
# bentoml build service:latest
# bentoml containerize service:latest
# kubectl apply -f bento.yaml
```

---

## 6. Monitoring & Observability

### 6.1 Key Metrics
```python
from prometheus_client import Counter, Histogram, Gauge

# Latency
TTFT = Histogram('llm_ttft_seconds', 'Time to first token', 
                 buckets=[0.01, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0])
TPOT = Histogram('llm_tpot_seconds', 'Time per output token',
                 buckets=[0.001, 0.005, 0.01, 0.02, 0.05, 0.1])

# Throughput
TOKENS_GENERATED = Counter('tokens_generated_total', 'Total tokens generated')
REQUESTS_TOTAL = Counter('requests_total', 'Total requests', ['status'])

# System
GPU_UTIL = Gauge('gpu_utilization_percent', 'GPU utilization', ['gpu_id'])
GPU_MEMORY = Gauge('gpu_memory_used_bytes', 'GPU memory used', ['gpu_id'])
QUEUE_DEPTH = Gauge('request_queue_depth', 'Requests waiting')

# Custom Metrics
TTFT.observe(ttft_seconds)
TOKENS_GENERATED.inc(num_tokens)
REQUESTS_TOTAL.labels(status='success').inc()
```

### 6.2 Distributed Tracing
```python
from opentelemetry import trace
from opentelemetry.exporter.jaeger import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Setup
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)
jaeger_exporter = JaegerExporter(agent_host_name="jaeger", agent_port=6831)
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(jaeger_exporter))

# Instrument generation
@tracer.start_as_current_span("llm_generate")
def generate(prompt):
    with tracer.start_as_current_span("prefill") as span:
        span.set_attribute("prompt_length", len(prompt))
        # ... prefill
    
    with tracer.start_as_current_span("decode") as span:
        # ... decode loop
        span.set_attribute("tokens_generated", num_tokens)
```

### 6.3 Logging
```python
import structlog

logger = structlog.get_logger()

def log_generation(request_id, prompt, response, latency, tokens):
    logger.info(
        "generation_complete",
        request_id=request_id,
        prompt_length=len(prompt),
        response_length=len(response),
        latency_ms=latency * 1000,
        tokens_generated=tokens,
        throughput=tokens/latency
    )

# Structured logging for analysis
# {"timestamp": "...", "level": "info", "event": "generation_complete", 
#  "request_id": "abc123", "latency_ms": 45.2, "tokens": 128, "throughput": 2830}
```

---

## 7. A/B Testing & Canary Deployment

### 7.1 Traffic Splitting
```python
# Canary Deployment
class CanaryRouter:
    def __init__(self, model_a, model_b, split=0.1):
        self.model_a = model_a  # Control
        self.model_b = model_b  # Canary
        self.split = split
    
    def route(self, request, user_id):
        # Consistent hashing for session stickiness
        variant = "a" if hash(user_id) % 100 < self.split * 100 else "b"
        model = self.model_a if variant == "a" else self.model_b
        return variant, model.generate(request.prompt)

# Istio VirtualService (Kubernetes)
# apiVersion: networking.istio.io/v1beta1
# kind: VirtualService
# metadata:
#   name: llm-service
# spec:
#   hosts: [llm-service]
#   http:
#   - match:
#     - headers:
#         x-canary:
#           exact: "true"
#     route:
#     - destination:
#         host: llm-service-canary
#   - route:
#     - destination:
#         host: llm-service-stable
#       weight: 90
#     - destination:
#         host: llm-service-canary
#       weight: 10
```

### 7.2 Shadow Traffic
```python
# Shadow Traffic (Mirror production traffic to new model)
class ShadowRouter:
    def __init__(self, primary_model, shadow_model, sample_rate=0.1):
        self.primary = primary_model
        self.shadow = shadow_model
        self.sample_rate = sample_rate
    
    async def generate(self, prompt, user_id):
        # Always use primary
        result = await self.primary.generate(prompt)
        
        # Shadow evaluation (async, non-blocking)
        if random.random() < self.sample_rate:
            asyncio.create_task(self._shadow_eval(prompt))
        
        return result
    
    async def _shadow_eval(self, prompt):
        try:
            shadow_result = await self.shadow.generate(prompt)
            # Log comparison metrics
            log_shadow_comparison(prompt, primary_result, shadow_result)
        except Exception as e:
            logger.warning(f"Shadow eval failed: {e}")
```

---

## 7. Cost Optimization

### 7.1 Model Cascading
```python
class CascadingRouter:
    """Route to smallest capable model"""
    
    def __init__(self, models):
        self.models = models  # [small, medium, large]
        self.thresholds = [0.9, 0.95]  # Confidence thresholds
    
    async def generate(self, prompt):
        # Try smallest model first
        for i, model in enumerate(self.models):
            result, confidence = await model.generate_with_confidence(prompt)
            
            if confidence > self.thresholds[i] or i == len(self.models) - 1:
                return result, f"model_{i}"
        
        return result, "largest"

# Usage: Small model (1B) handles 80%, Medium (7B) 15%, Large (70B) 5%
```

### 7.2 Spot Instances & Autoscaling
```yaml
# Kubernetes: Spot instances with fallback
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: llm-serving-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: llm-serving
  minReplicas: 2
  maxReplicas: 50
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
  metrics:
  - type: Prometheus
    prometheus:
      queryName: gpu_utilization
      threshold:
        type: AverageValue
        averageValue: "70"
```

---

## 8. Security & Compliance

### 8.1 Input/Output Guardrails
```python
class Guardrails:
    def __init__(self):
        self.pii_detector = PIIDetector()
        self.toxicity = ToxicityClassifier()
        self.prompt_injection = PromptInjectionDetector()
    
    def check_input(self, prompt):
        # PII detection
        pii = self.pii_detector.detect(prompt)
        if pii:
            raise SecurityError(f"PII detected: {pii}")
        
        # Prompt injection
        if self.prompt_injection.detect(prompt):
            raise SecurityError("Prompt injection detected")
        
        return True
    
    def check_output(self, response):
        # Toxicity
        toxicity = self.toxicity.score(response)
        if toxicity > 0.8:
            raise SafetyError("Toxic output detected")
        
        # PII in output
        pii = self.pii_detector.detect(response)
        if pii:
            raise SecurityError(f"PII in output: {pii}")
        
        return True
```

### 8.2 Rate Limiting & Quotas
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/generate")
@limiter.limit("10/minute")  # Per IP
@limiter.limit("100/hour", key_func=lambda r: r.headers.get("X-API-Key"))  # Per API key
async def generate(request: Request, prompt: str):
    return await llm_service.generate(prompt)
```

---

## 8. Key Takeaways

1. **vLLM/SGLang/TGI** are the production standards for LLM serving
2. **Quantization** (AWQ/GPTQ/GGUF) + **Compilation** = 2-4x speedup
3. **Continuous Batching** + **Chunked Prefill** = Max GPU utilization
4. **Speculative Decoding** (Medusa/EAGLE) = 2-3x speedup
5. **Kubernetes + HPA + vLLM** = Production-grade scaling
6. **Observability** = TTFT, TPOT, GPU utilization, queue depth
7. **Canary/Shadow** = Safe rollouts
8. **Cascading/Quantization/Spot** = Cost optimization
9. **Guardrails** = PII, toxicity, prompt injection
10. **Observability** = Metrics + Tracing + Logging = Debuggability