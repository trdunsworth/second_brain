# Cost Optimization for ML Systems

Comprehensive strategies for reducing ML infrastructure and operational costs while maintaining performance.

## 1. Cost Analysis Framework

### 1.1 Cost Breakdown
```
ML System Cost Breakdown
├── Training Costs (15-30%)
│   ├── GPU/TPU Compute
│   ├── Data Processing
│   ├── Hyperparameter Search
│   └── Experiment Tracking
├── Inference Costs (50-70%)
│   ├── Real-time Serving (GPU)
│   ├── Batch Inference
│   ├── Edge Deployment
│   └── Cold Start / Scale-up
├── Data Costs (10-20%)
│   │   ├── Storage (S3, Feature Store)
│   │   ├── Data Transfer (Egress)
│   │   ├── Labeling / Annotation
│   │   └── Feature Computation
├── Platform & Ops (10-15%)
│   ├── Orchestration (Airflow, K8s)
│   ├── Monitoring (Prometheus, Grafana)
│   ├── CI/CD
│   └── Feature Store / Registry
└── Personnel (20-40%)
    ├── ML Engineers
    ├── Data Scientists
    ├── Platform Engineers
    └── MLOps Engineers
```

### 1.2 Cost Attribution Model
```python
class CostAttribution:
    def __init__(self, cloud_provider='aws'):
        self.provider = cloud_provider
        self.pricing = self._load_pricing()
    
    def calculate_training_cost(self, job_spec: dict) -> dict:
        """Estimate training job cost"""
        gpu_type = job_spec.get('gpu_type', 'A100-40GB')
        gpu_count = job_spec.get('gpu_count', 8)
        hours = job_spec.get('estimated_hours', 24)
        
        gpu_hourly = self.pricing['gpu'][gpu_type]['hourly']
        compute_cost = gpu_hourly * gpu_count * hours
        
        # Storage
        storage_gb = job_spec.get('storage_gb', 500)
        storage_cost = storage_gb * self.pricing['storage']['s3']['per_gb_month']
        
        # Data transfer
        data_gb = job_spec.get('data_gb', 1000)
        egress_cost = data_gb * self.pricing['network']['egress_per_gb']
        
        return {
            'compute': compute_cost,
            'storage': storage_cost,
            'network': egress_cost,
            'total': compute_cost + storage_cost + egress_cost,
            'per_epoch': compute_cost / job_spec.get('epochs', 100)
        }
    
    def calculate_inference_cost(self, model_spec: dict, traffic: dict) -> dict:
        """Estimate monthly inference cost"""
        # Instance sizing
        model_size_gb = model_spec.get('model_size_gb', 14)  # 7B params
        concurrent_requests = traffic.get('concurrent_requests', 100)
        avg_tokens = traffic.get('avg_tokens_per_request', 512)
        requests_per_day = traffic.get('requests_per_day', 1_000_000)
        
        # Instance sizing
        gpu_memory_needed = model_size_gb * 1.2  # 20% overhead
        gpu_type = self._select_gpu(gpu_memory_needed)
        gpus_per_instance = max(1, int(np.ceil(gpu_memory_needed / self.gpu_memory[gpu_type])))
        instances_needed = max(1, int(np.ceil(concurrent_requests / 8)))  # ~8 concurrent per GPU
        
        # Monthly compute
        gpu_hourly = self.pricing['gpu'][gpu_type]['hourly']
        monthly_compute = gpu_hourly * gpus_per_instance * instances_needed * 24 * 30
        
        # Token-based pricing (if using API)
        tokens_per_month = requests_per_day * avg_tokens * 30
        api_cost = self._estimate_api_cost(tokens_per_month, model_spec.get('size', '7B'))
        
        return {
            'self_hosted': {
                'gpu_type': gpu_type,
                'instances': instances_needed,
                'gpus_per_instance': gpus_per_instance,
                'monthly_compute': monthly_compute
            },
            'api_estimate': api_cost,
            'recommendation': 'self_hosted' if monthly_compute < api_cost else 'api'
        }
```

---

## 2. GPU Optimization

### 2.1 GPU Selection Guide
```python
GPU_SPECS = {
    'A100-40GB': {'memory': 40, 'fp16_tflops': 312, 'hourly_ondemand': 3.06, 'hourly_spot': 0.92},
    'A100-80GB': {'memory': 80, 'fp16_tflops': 312, 'hourly_ondemand': 4.10, 'hourly_spot': 1.23},
    'H100-80GB': {'memory': 80, 'fp16_tflops': 989, 'hourly_ondemand': 8.50, 'hourly_spot': 2.55},
    'H100-80GB-SXM': {'memory': 80, 'fp16_tflops': 1979, 'hourly_ondemand': 9.50, 'hourly_spot': 2.85},
    'V100-32GB': {'memory': 32, 'fp16_tflops': 125, 'hourly_ondemand': 2.48, 'hourly_spot': 0.74},
    'T4-16GB': {'memory': 16, 'fp16_tflops': 65, 'hourly_ondemand': 0.53, 'hourly_spot': 0.16},
    'L4-24GB': {'memory': 24, 'fp16_tflops': 242, 'hourly_ondemand': 0.75, 'hourly_spot': 0.23},
}

def select_optimal_gpu(model_size_gb: int, batch_size: int, 
                       latency_requirement_ms: int, budget: float) -> str:
    """Select optimal GPU based on requirements"""
    
    # Minimum memory needed (model + KV cache + activations)
    min_memory = model_size_gb * 1.5  # 50% overhead
    
    # Filter GPUs with sufficient memory
    candidates = {k: v for k, v in GPU_SPECS.items() if v['memory'] >= min_memory}
    
    if not candidates:
        raise ValueError(f"No GPU with sufficient memory for {model_size_gb}GB model")
    
    # Score by cost-effectiveness
    best_gpu = None
    best_score = float('inf')
    
    for name, spec in candidates.items():
        # Estimate throughput (tokens/sec)
        throughput = spec['fp16_tflops'] * 0.6  # 60% utilization
        tokens_per_sec = throughput / (model_params * 2)  # 2 FLOPs per param per token
        
        # Latency check
        latency_per_token = 1000 / tokens_per_sec  # ms
        if latency_per_token > latency_requirement_ms:
            continue
        
        # Cost per 1M tokens
        hourly = spec['hourly_spot']  # Use spot pricing
        tokens_per_hour = tokens_per_sec * 3600
        cost_per_million = (hourly / tokens_per_hour) * 1_000_000
        
        if cost_per_million < budget:
            score = cost_per_million
            if score < best_score:
                best_score = score
                best_gpu = name
    
    return best_gpu or min(candidates.keys(), key=lambda k: candidates[k]['hourly_spot'])
```

### 2.2 Multi-GPU Optimization
```python
# Tensor Parallelism vs Pipeline Parallelism vs Data Parallelism

PARALLELISM_STRATEGIES = {
    'data_parallel': {
        'description': 'Replicate model across GPUs, split batch',
        'best_for': 'Small models, large batches',
        'scaling': 'Linear with GPUs',
        'communication': 'All-reduce gradients',
        'memory_per_gpu': 'Full model + batch/K'
    },
    'tensor_parallel': {
        'description': 'Split model layers across GPUs',
        'best_for': 'Large models (>20B params)',
        'scaling': 'Sub-linear (communication overhead)',
        'communication': 'All-reduce per layer',
        'memory_per_gpu': 'Model/GPUs + batch'
    },
    'pipeline_parallel': {
        'description': 'Split layers into pipeline stages',
        'best_for': 'Very large models, sequential layers',
        'scaling': 'Good with many GPUs',
        'communication': 'Point-to-point between stages',
        'memory_per_gpu': 'Model/GPUs + micro-batches'
    },
    'sequence_parallel': {
        'description': 'Split sequence length across GPUs',
        'best_for': 'Long context (>32k tokens)',
        'scaling': 'Linear with sequence length',
        'communication': 'All-gather per layer',
        'memory_per_gpu': 'Activations/GPUs'
    }
}

# 3D Parallelism (Megatron-LM style)
def configure_3d_parallelism(model_params: int, num_gpus: int, 
                              seq_length: int) -> dict:
    """Configure optimal 3D parallelism"""
    
    # Heuristics for parallelism degrees
    # Tensor parallelism: split attention heads and MLP
    max_tp = min(8, num_gpus)  # Usually 1-8
    
    # Pipeline parallelism: split layers
    num_layers = estimate_layers(model_params)
    max_pp = min(num_layers // 2, num_gpus // max_tp)
    
    # Data parallelism: remaining GPUs
    dp = num_gpus // (max_tp * max_pp)
    
    return {
        'tensor_parallel': max_tp,
        'pipeline_parallel': max_pp,
        'data_parallel': dp,
        'sequence_parallel': max_tp > 1 and seq_length > 4096
    }
```

### 2.3 Mixed Precision & Quantization
```python
# Mixed Precision Training (AMP)
from torch.cuda.amp import autocast, GradScaler

scaler = GradScaler()

def train_step(model, batch, optimizer):
    optimizer.zero_grad()
    
    with autocast(dtype=torch.bfloat16):  # or float16
        outputs = model(**batch)
        loss = outputs.loss
    
    scaler.scale(loss).backward()
    scaler.unscale_(optimizer)
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    scaler.step(optimizer)
    scaler.update()
    
    return loss.item()

# Quantization-Aware Training (QAT)
def prepare_qat(model):
    from torch.ao.quantization import QConfig, prepare_qat
    
    qconfig = QConfig(
        activation=torch.ao.quantization.observer.HistogramObserver.with_args(
            qscheme=torch.per_tensor_symmetric, dtype=torch.quint8
        ),
        weight=torch.ao.quantization.observer.PerChannelMinMaxObserver.with_args(
            dtype=torch.qint8, qscheme=torch.per_channel_symmetric
        )
    )
    
    model.qconfig = qconfig
    model = prepare_qat(model, inplace=True)
    return model

# Post-Training Quantization (PTQ)
def quantize_model(model, calibration_data, method='gptq'):
    if method == 'gptq':
        from auto_gptq import AutoGPTQForCausalLM
        model = AutoGPTQForCausalLM.from_pretrained(
            model_name,
            quantize_config={'bits': 4, 'group_size': 128, 'desc_act': False}
        )
        model.quantize(calibration_data, batch_size=1)
    elif method == 'awq':
        from awq import AutoAWQForCausalLM
        model = AutoAWQForCausalLM.from_pretrained(model_name)
        model.quantize(tokenizer, calib_data=calibration_data)
    elif method == 'bnb':
        from transformers import BitsAndBytesConfig
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.bfloat16,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type='nf4'
        )
        model = AutoModelForCausalLM.from_pretrained(
            model_name, quantization_config=bnb_config
        )
    return model
```

---

## 3. Inference Optimization

### 3.1 Speculative Decoding
```python
# Medusa: Multiple decoding heads
class MedusaModel(nn.Module):
    def __init__(self, base_model, num_heads=5):
        super().__init__()
        self.base_model = base_model
        self.medusa_heads = nn.ModuleList([
            nn.Linear(base_model.config.hidden_size, base_model.config.vocab_size, bias=False)
            for _ in range(num_heads)
        ])
    
    def forward(self, input_ids, **kwargs):
        outputs = self.base_model(input_ids, output_hidden_states=True, **kwargs)
        hidden_states = outputs.hidden_states[-1]
        
        # Base model logits
        base_logits = self.base_model.lm_head(hidden_states)
        
        # Medusa head logits
        medusa_logits = [head(hidden_states) for head in self.medusa_heads]
        
        return base_logits, medusa_logits

# EAGLE: Feature extrapolation
class EAGLEDecoder:
    def __init__(self, base_model, eagle_model):
        self.base = base_model
        self.eagle = eagle_model  # Small MLP on hidden states
    
    def draft(self, hidden_states):
        # Predict next hidden state
        next_hidden = self.eagle(hidden_states)
        # Use base LM head to get logits
        logits = self.base.lm_head(next_hidden)
        return logits

# Speculative Decoding Loop
def speculative_decode(model, draft_model, input_ids, max_new_tokens=50, 
                       max_draft_tokens=4):
    """
    2-3x speedup with minimal quality loss
    """
    generated = input_ids
    
    for _ in range(max_new_tokens):
        # 1. Draft model generates K tokens
        draft_tokens = draft_model.generate(generated, max_new_tokens=max_draft_tokens)
        
        # 2. Target model verifies all K+1 tokens in ONE forward pass
        verification_input = torch.cat([generated, draft_tokens], dim=-1)
        target_logits = model(verification_input).logits
        
        # 3. Accept/Reject using probability ratio
        accepted = []
        for i, draft_token in enumerate(draft_tokens[0]):
            p_target = F.softmax(target_logits[0, len(generated[0])-1+i], dim=-1)
            p_draft = draft_model.logits[0, i]  # From draft model
            
            # Acceptance probability
            alpha = min(1, p_target[draft_token] / (p_draft[draft_token] + 1e-10))
            
            if torch.rand(1) < alpha:
                accepted.append(draft_token)
            else:
                # Resample from target distribution
                accepted.append(torch.multinomial(p_target, 1))
                break  # Stop at first rejection
        
        generated = torch.cat([generated, torch.tensor([accepted]).to(generated.device)], dim=-1)
        
        if len(accepted) < max_draft_tokens:
            break  # Rejection occurred
    
    return generated
```

### 3.2 Continuous Batching & Chunked Prefill
```python
# vLLM-style continuous batching
class ContinuousBatchingScheduler:
    def __init__(self, max_num_batched_tokens=8192, max_num_seqs=256):
        self.max_tokens = max_num_batched_tokens
        self.max_seqs = max_num_seqs
        self.waiting_queue = []
        self.running_seqs = {}
        self.finished_seqs = {}
    
    def add_request(self, request_id, prompt_tokens, sampling_params):
        self.waiting_queue.append({
            'id': request_id,
            'tokens': prompt_tokens,
            'params': sampling_params,
            'state': 'waiting'
        })
    
    def schedule(self):
        """Select requests to run this iteration"""
        # 1. Prefill waiting requests (new sequences)
        prefill_budget = self.max_tokens * 0.3
        running_budget = self.max_tokens - prefill_budget
        
        # 2. Continue running sequences (decoding)
        # Sort by priority / arrival time
        running = sorted(self.running_seqs.values(), key=lambda x: x['arrival_time'])
        
        # 3. Pack into batch
        batch = self._pack_batch(running, prefill_budget, running_budget)
        return batch
    
    def _pack_batch(self, running, prefill_budget, decode_budget):
        """Pack sequences into continuous batch"""
        # Implementation handles variable-length sequences
        # with proper padding and attention masks
        pass

# Chunked Prefill for long contexts
def chunked_prefill(model, input_ids, chunk_size=2048):
    """Split long prefill into chunks to interleave with decode"""
    seq_len = input_ids.shape[1]
    
    if seq_len <= chunk_size:
        return model(input_ids)
    
    # Process in chunks
    kv_cache = None
    for i in range(0, seq_len, chunk_size):
        chunk = input_ids[:, i:i+chunk_size]
        
        with torch.no_grad():
            outputs = model(chunk, past_key_values=kv_cache, use_cache=True)
        
        kv_cache = outputs.past_key_values
    
    return kv_cache
```

---

## 4. Model Compression & Cascading

### 4.1 Model Cascading
```python
class CascadingRouter:
    """Route requests to smallest capable model"""
    
    def __init__(self, models: dict, thresholds: dict):
        """
        models: {'small': model_1b, 'medium': model_7b, 'large': model_70b}
        thresholds: {'small': 0.9, 'medium': 0.95}  # confidence thresholds
        """
        self.models = models
        self.thresholds = thresholds
        self.routing_stats = defaultdict(int)
    
    def route(self, prompt: str) -> tuple:
        """Route to appropriate model based on complexity"""
        
        # Quick complexity estimation (cheap)
        complexity_score = self._estimate_complexity(prompt)
        
        # Route based on complexity
        if complexity_score < 0.3:
            model_name = 'small'
        elif complexity_score < 0.7:
            model_name = 'medium'
        else:
            model_name = 'large'
        
        # Generate with selected model
        model = self.models[model_name]
        response, confidence = model.generate_with_confidence(prompt)
        
        # Check confidence threshold
        threshold = self.thresholds.get(model_name, 0.9)
        if confidence < threshold and model_name != 'large':
            # Escalate to larger model
            self.routing_stats['escalations'] += 1
            return self._escalate(prompt, model_name)
        
        self.routing_stats[model_name] += 1
        return response, model_name
    
    def _estimate_complexity(self, prompt: str) -> float:
        """Quick complexity estimation using heuristics"""
        # Length-based
        length_score = min(len(prompt) / 2000, 1.0)
        
        # Keyword-based
        complex_keywords = ['analyze', 'compare', 'explain', 'reason', 'prove', 'derive']
        keyword_score = sum(1 for kw in complex_keywords if kw in prompt.lower()) / len(complex_keywords)
        
        # Structure
        structure_score = 1.0 if any(c in prompt for c in ['?', ':', ';']) else 0.5
        
        return (length_score + keyword_score + structure_score) / 3
```

### 4.2 Knowledge Distillation
```python
def distillation_loss(student_logits, teacher_logits, labels, 
                      temperature=2.0, alpha=0.5):
    """
    Knowledge Distillation Loss
    """
    # Soft targets (teacher)
    soft_loss = F.kl_div(
        F.log_softmax(student_logits / temperature, dim=-1),
        F.softmax(teacher_logits / temperature, dim=-1),
        reduction='batchmean'
    ) * (temperature ** 2)
    
    # Hard targets (ground truth)
    hard_loss = F.cross_entropy(student_logits, labels)
    
    return alpha * soft_loss + (1 - alpha) * hard_loss

# Progressive Distillation
def progressive_distillation(teacher, student, data_loader, epochs=10):
    """Progressively distill from large to small model"""
    
    # Stage 1: Feature matching
    for epoch in range(epochs // 3):
        for batch in data_loader:
            with torch.no_grad():
                teacher_feats = teacher.extract_features(batch)
            student_feats = student.extract_features(batch)
            loss = F.mse_loss(student_feats, teacher_feats)
            loss.backward()
    
    # Stage 2: Logits matching
    for epoch in range(epochs // 3, 2 * epochs // 3):
        for batch in data_loader:
            with torch.no_grad():
                teacher_logits = teacher(batch)
            student_logits = student(batch)
            loss = distillation_loss(student_logits, teacher_logits, batch['labels'])
            loss.backward()
    
    # Stage 3: Hard labels + soft labels
    for epoch in range(2 * epochs // 3, epochs):
        for batch in data_loader:
            student_logits = student(batch)
            with torch.no_grad():
                teacher_logits = teacher(batch)
            loss = distillation_loss(student_logits, teacher_logits, batch['labels'], alpha=0.3)
            loss.backward()
```

---

## 5. Spot Instances & Preemption Handling

### 5.1 Spot Instance Strategy
```python
class SpotInstanceManager:
    def __init__(self, max_spot_ratio=0.8, fallback_ondemand=True):
        self.max_spot_ratio = max_spot_ratio
        self.fallback_ondemand = fallback_ondemand
        self.spot_fleet = SpotFleetManager()
    
    def create_training_cluster(self, config: dict) -> Cluster:
        """Create mixed spot/on-demand cluster"""
        
        total_gpus = config['total_gpus']
        spot_gpus = int(total_gpus * self.max_spot_ratio)
        ondemand_gpus = total_gpus - spot_gpus
        
        # Create spot fleet
        spot_fleet = self.spot_fleet.create_fleet(
            instance_types=config['instance_types'],
            target_capacity=spot_gpus,
            allocation_strategy='diversified',  # Spread across pools
            max_price=config.get('max_spot_price'),  # Optional cap
            allocation_strategy='capacityOptimized'
        )
        
        # Create on-demand ASG for fallback
        if self.fallback_ondemand and ondemand_gpus > 0:
            asg = AutoscalingGroup(
                min_size=ondemand_gpus,
                max_size=total_gpus,
                desired=ondemand_gpus,
                instance_types=config['instance_types'],
                mixed_instances_policy={
                    'instances_distribution': 'balanced',
                    'on_demand_base_capacity': 0,
                    'on_demand_percentage_above_base': 0
                }
            )
        
        return Cluster(spot_fleet=spot_fleet, ondemand_asg=asg)

# Spot interruption handling
class SpotInterruptionHandler:
    def __init__(self, checkpoint_interval=300):  # 5 min
        self.checkpoint_interval = checkpoint_interval
        self.last_checkpoint = time.time()
    
    def handle_interruption(self, signal):
        """Handle spot interruption notice (2 min warning on AWS)"""
        logger.warning("Spot interruption notice received!")
        
        # 1. Save checkpoint immediately
        self.save_checkpoint()
        
        # 2. Signal graceful shutdown to training loop
        self.shutdown_requested = True
        
        # 3. Re-queue work
        self.requeue_work()
    
    def should_checkpoint(self):
        return time.time() - self.last_checkpoint > self.checkpoint_interval
```

---

## 6. Data Cost Optimization

### 6.1 Storage Optimization
```python
class DataCostOptimizer:
    def __init__(self):
        self.storage_classes = {
            'S3 Standard': {'cost_per_gb_month': 0.023, 'access': 'frequent'},
            'S3 Intelligent-Tiering': {'cost_per_gb_month': 0.0125, 'access': 'variable'},
            'S3 Standard-IA': {'cost_per_gb_month': 0.0125, 'access': 'infrequent'},
            'S3 Glacier Instant': {'cost_per_gb_month': 0.004, 'access': 'archive'},
            'S3 Glacier Flexible': {'cost_per_gb_month': 0.0036, 'access': 'archive'},
            'S3 Glacier Deep Archive': {'cost_per_gb_month': 0.00099, 'access': 'deep_archive'}
        }
    
    def optimize_storage_lifecycle(self, dataset_info: dict) -> dict:
        """Recommend optimal storage lifecycle"""
        age_days = (datetime.now() - dataset_info['last_accessed']).days
        size_gb = dataset_info['size_gb']
        access_frequency = dataset_info.get('access_frequency', 'unknown')
        
        if age_days < 30 and access_frequency == 'frequent':
            return {'class': 'S3 Standard', 'reason': 'Hot data'}
        elif age_days < 90 and access_frequency in ['frequent', 'occasional']:
            return {'class': 'S3 Intelligent-Tiering', 'reason': 'Auto-optimize'}
        elif age_days < 365:
            return {'class': 'S3 Standard-IA', 'reason': 'Warm data'}
        elif age_days < 365 * 3:
            return {'class': 'S3 Glacier Instant', 'reason': 'Cool data'}
        else:
            return {'class': 'S3 Glacier Deep Archive', 'reason': 'Cold data'}
    
    def estimate_savings(self, current_class: str, recommended_class: str, size_gb: float) -> float:
        current_cost = self.storage_classes[current_class]['cost_per_gb_month'] * size_gb
        new_cost = self.storage_classes[recommended_class]['cost_per_gb_month'] * size_gb
        return (current_cost - new_cost) * 12  # Annual savings
```

### 6.2 Data Format Optimization
```python
def optimize_data_format(df: pd.DataFrame) -> pd.DataFrame:
    """Optimize DataFrame memory usage"""
    
    # Downcast numeric types
    for col in df.select_dtypes(include=['int64']).columns:
        col_min, col_max = df[col].min(), df[col].max()
        if col_min >= -128 and col_max <= 127:
            df[col] = df[col].astype('int8')
        elif col_min >= -32768 and col_max <= 32767:
            df[col] = df[col].astype('int16')
        elif col_min >= -2147483648 and col_max <= 2147483647:
            df[col] = df[col].astype('int32')
    
    for col in df.select_dtypes(include=['float64']).columns:
        df[col] = df[col].astype('float32')
    
    # Categorical encoding
    for col in df.select_dtypes(include=['object']).columns:
        if df[col].nunique() / len(df) < 0.5:  # Low cardinality
            df[col] = df[col].astype('category')
    
    # Sparse arrays for high-cardinality categorical
    for col in df.select_dtypes(include=['category']).columns:
        if df[col].nunique() > 1000:
            df[col] = df[col].astype('string').astype('category')
    
    return df

# Parquet optimization
def write_optimized_parquet(df, path, compression='zstd', 
                            row_group_size=128000, 
                            partition_cols=None):
    """Write optimized Parquet file"""
    table = pa.Table.from_pandas(df)
    
    pq.write_table(
        table, path,
        compression=compression,
        compression_level=3,
        row_group_size=row_group_size,
        partition_cols=partition_cols,
        use_dictionary=True,
        write_statistics=True
    )
```

---

## 7. Training Cost Optimization

### 7.1 Efficient Training Strategies
```python
# Gradient Accumulation (simulate large batch)
def train_with_accumulation(model, dataloader, optimizer, accumulation_steps=4):
    model.train()
    total_loss = 0
    
    for i, batch in enumerate(dataloader):
        loss = model(**batch).loss / accumulation_steps
        loss.backward()
        
        if (i + 1) % accumulation_steps == 0:
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            optimizer.zero_grad()
        
        total_loss += loss.item() * accumulation_steps
    
    return total_loss / len(dataloader)

# Gradient Checkpointing (activation checkpointing)
def enable_gradient_checkpointing(model):
    """Trade compute for memory - saves 30-50% memory"""
    model.gradient_checkpointing_enable()
    # Or manually for specific modules:
    # from torch.utils.checkpoint import checkpoint
    # def checkpointed_forward(module, *inputs):
    #     return checkpoint(module, *inputs, use_reentrant=False)

# Flash Attention (2-3x speedup, 50% memory reduction)
def enable_flash_attention(model):
    """Enable Flash Attention 2"""
    # Requires: pip install flash-attn
    from flash_attn import flash_attn_func
    
    # Replace attention modules
    for name, module in model.named_modules():
        if isinstance(module, (nn.MultiheadAttention,)):
            # Replace with flash attention
            pass

# DeepSpeed ZeRO Optimization
from deepspeed import DeepSpeedEngine

ds_config = {
    "train_batch_size": 32,
    "gradient_accumulation_steps": 4,
    "optimizer": {
        "type": "AdamW",
        "params": {"lr": 2e-5, "weight_decay": 0.01}
    },
    "fp16": {"enabled": True},
    "bf16": {"enabled": True},
    "zero_optimization": {
        "stage": 3,  # Stage 3 = full sharding
        "offload_optimizer": {"device": "cpu"},
        "offload_param": {"device": "cpu"},
        "overlap_comm": True,
        "contiguous_gradients": True,
        "reduce_bucket_size": 5e7
    },
    "gradient_clipping": 1.0,
    "gradient_accumulation_steps": 4
}

model_engine, optimizer, _, _ = deepspeed.initialize(
    model=model,
    model_parameters=model.parameters(),
    config=ds_config
)
```

---

## 7. Key Takeaways

1. **Right-size GPUs**: Match GPU memory to model size + overhead (1.5x)
2. **Quantization**: 4-bit (AWQ/GPTQ) = 4x memory reduction, minimal quality loss
3. **Speculative Decoding** = 2-3x inference speedup with Medusa/EAGLE
4. **Continuous Batching** = Maximize GPU utilization, eliminate padding waste
5. **Spot Instances** = 70-90% cost reduction with checkpointing + fallback
6. **Model Cascading** = Route to smallest capable model (80% on small models)
7. **Quantization-Aware Training** = Better quality than PTQ
8. **Flash Attention + BF16 + torch.compile** = 2-3x training speedup
9. **Storage Tiering** = Intelligent tiering saves 50-80% on storage
10. **Monitor Everything** = Cost per 1M tokens, GPU utilization, queue depth