# RLHF Infrastructure

Building production-grade RLHF systems: reward modeling, comparison data collection, PPO at scale, iterative DPO, and evaluation pipelines.

## 1. RLHF Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        RLHF PRODUCTION PIPELINE                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐             │
│  │   SFT Data   │    │  Pref Data   │    │  Prompt Set  │             │
│  │  Collection  │    │  Collection  │    │  Generation  │             │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘             │
│         │                   │                   │                      │
│         ▼                   ▼                   ▼                      │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │                    SFT TRAINING                              │     │
│  │  Base Model → Instruction-Tuned Model (SFT)                 │     │
│  └─────────────────────────────────────────────────────────────┘     │
│         │                                                       │     │
│         ▼                                                       │     │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │                   REWARD MODEL TRAINING                      │     │
│  │  SFT Model + Preference Data → Reward Model (RM)            │     │
│  └─────────────────────────────────────────────────────────────┘     │
│         │                                                       │     │
│         ▼                                                       │     │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │                    RLHF (PPO / DPO / KTO)                   │     │
│  │  SFT Model + RM → Aligned Model                             │     │
│  └─────────────────────────────────────────────────────────────┘     │
│         │                                                       │     │
│         ▼                                                       │     │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │                    EVALUATION & DEPLOYMENT                   │     │
│  │  MT-Bench, MMLU, Safety, Human Eval → Production Model      │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. SFT Data Collection

### Data Sources
| Source | Scale | Quality | Cost |
|--------|-------|---------|------|
| **Human Annotators** | 10K-100K | Highest | $$$$ |
| **Self-Instruct** (Wang et al.) | 100K-1M | Medium | $ |
| **Distillation** (GPT-4 → Open) | 50K-1M | High | $$ |
| **Synthetic** (Evol-Instruct) | 100K-10M | Medium | $ |
| **Open Datasets** | 10K-1M | Variable | Free |

### Quality Filters
```python
def filter_sft_data(dataset):
    filtered = []
    for ex in dataset:
        # Length
        if len(ex['instruction']) < 10 or len(ex['output']) < 10:
            continue
        # Language detection
        if detect_language(ex['instruction']) != 'en':
            continue
        # Toxicity
        if toxicity_classifier(ex['output']) > 0.5:
            continue
        # Repetition
        if repetition_score(ex['output']) > 0.5:
            continue
        # Format compliance
        if not has_proper_format(ex['output']):
            continue
        filtered.append(ex)
    return filtered
```

### Data Formats
```json
// Alpaca Format
{
  "instruction": "Write a Python function to calculate fibonacci",
  "input": "",
  "output": "def fibonacci(n):..."
}

// ShareGPT / Chat Format
{
  "messages": [
    {"role": "user", "content": "What is 2+2?"},
    {"role": "assistant", "content": "2+2=4"}
  ]
}

// System + User Format
{
  "system": "You are a helpful assistant.",
  "user": "Explain quantum computing",
  "assistant": "Quantum computing uses qubits..."
}
```

---

## 3. Preference Data Collection

### Comparison Data Format
```json
{
  "prompt": "Write a poem about cats",
  "chosen": "Cats are wonderful creatures...",
  "rejected": "Cats are animals that meow...",
  "metadata": {
    "annotator_id": "annotator_123",
    "timestamp": "2024-01-15T10:30:00Z",
    "difficulty": "easy",
    "category": "creative"
  }
}
```

### Collection Strategies

#### 1. Side-by-Side (SxS)
```python
def collect_sxs_comparison(model_a, model_b, prompts, n_annotators=3):
    comparisons = []
    for prompt in prompts:
        resp_a = model_a.generate(prompt)
        resp_b = model_b.generate(prompt)
        
        for _ in range(n_annotators):
            # Randomize order
            if random.random() < 0.5:
                first, second = resp_a, resp_b
                labels = {'first': 'A', 'second': 'B'}
            else:
                first, second = resp_b, resp_a
                labels = {'first': 'B', 'second': 'A'}
            
            pref = get_human_preference(prompt, first, second)
            
            comparisons.append({
                'prompt': prompt,
                'chosen': first if pref == 'first' else second,
                'rejected': second if pref == 'first' else first,
                'model_a': 'A' if labels['first'] == 'A' else 'B'
            })
    return comparisons
```

#### 2. Ranking (k-wise)
```python
def collect_ranking(model_outputs, prompt, n_annotators=3):
    # Annotators rank k outputs from best to worst
    pass
```

#### 3. Scoring (Pointwise)
```python
def collect_scoring(model_output, prompt, n_annotators=3):
    # Annotators score 1-5 or 1-7
    pass
```

### Quality Control
```python
def quality_control_rlhf(comparisons):
    # 1. Length bias check
    filtered = []
    for c in comparisons:
        len_ratio = len(c['chosen']) / max(len(c['rejected']), 1)
        if len_ratio > 2.0 or len_ratio < 0.5:
            continue  # Length bias
        
        # Quality: both should be reasonable
        if len(c['chosen']) < 20 or len(c['rejected']) < 20:
            continue
        
        # Diversity
        if similarity(c['chosen'], c['rejected']) > 0.95:
            continue
        
        filtered.append(c)
    
    return filtered
```

### Synthetic Preference Generation (RLAIF)
```python
def generate_synthetic_preferences(prompts, model, constitution):
    preferences = []
    for prompt in prompts:
        # Generate two responses
        resp_1 = model.generate(prompt)
        resp_2 = model.generate(prompt)
        
        # AI critique
        critique_prompt = f"""Compare these responses per the constitution:
        Constitution: {constitution}
        Prompt: {prompt}
        Response A: {resp_1}
        Response B: {resp_2}
        Which is better? Explain:"""
        
        critique = llm.generate(critique_prompt)
        preference = extract_preference(critique)
        
        preferences.append({
            'prompt': prompt,
            'chosen': resp_1 if preference == 'A' else resp_2,
            'rejected': resp_2 if preference == 'A' else resp_1,
            'critique': critique
        })
    return preferences
```

---

## 3. Reward Model Training

### Architecture
```python
class RewardModel(nn.Module):
    def __init__(self, base_model_name, pooling='last_token'):
        self.backbone = AutoModel.from_pretrained(base_model_name)
        self.score_head = nn.Linear(self.backbone.config.hidden_size, 1, bias=False)
        self.pooling = pooling
    
    def forward(self, input_ids, attention_mask=None):
        outputs = self.backbone(input_ids, attention_mask=attention_mask)
        hidden = outputs.last_hidden_state
        
        if self.pooling == 'last_token':
            # Last non-padding token
            last_idx = attention_mask.sum(-1) - 1
            pooled = hidden[torch.arange(hidden.size(0)), last_idx]
        elif self.pooling == 'mean':
            pooled = (hidden * attention_mask.unsqueeze(-1)).sum(1) / attention_mask.sum(-1, keepdim=True)
        elif self.pooling == 'cls':
            pooled = hidden[:, 0]
        
        return self.score_head(pooled).squeeze(-1)
```

### Bradley-Terry Loss
```python
def reward_loss(chosen_rewards, rejected_rewards, margin=0.0):
    # Bradley-Terry: P(chosen > rejected) = sigmoid(r_chosen - r_rejected)
    logits = chosen_rewards - rejected_rewards - margin
    loss = -F.logsigmoid(logits).mean()
    return loss

# Multi-comparison (k-wise)
def multi_comparison_loss(rewards, labels):
    # rewards: (batch, k), labels: (batch) index of best
    logits = rewards / temperature
    loss = F.cross_entropy(logits, labels)
    return loss
```

### Training Loop
```python
def train_reward_model(model, train_dataset, val_dataset, epochs=1):
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-5, weight_decay=0.01)
    scheduler = get_cosine_schedule_with_warmup(optimizer, 100, len(train_dataset) * epochs)
    
    for epoch in range(epochs):
        model.train()
        for batch in train_dataloader:
            chosen_rewards = model(batch['chosen_input_ids'], batch['chosen_attention_mask'])
            rejected_rewards = model(model['rejected_input_ids'], batch['rejected_attention_mask'])
            
            loss = reward_loss(chosen_rewards, rejected_rewards)
            
            loss.backward()
            clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()
            optimizer.zero_grad()
        
        # Validation
        eval_acc = evaluate_reward_model(model, val_dataset)
        print(f"Epoch {epoch}: Val Acc = {eval_acc:.4f}")
```

### Evaluation
```python
def evaluate_reward_model(model, dataset):
    correct = 0
    total = 0
    for ex in dataset:
        chosen_r = model(ex['chosen_input_ids'], ex['chosen_attention_mask'])
        rejected_r = model(ex['rejected_input_ids'], ex['rejected_attention_mask'])
        if chosen_r > rejected_r:
            correct += 1
        total += 1
    return correct / total
```

---

## 4. RLHF at Scale (PPO)

### Distributed PPO with vLLM
```python
# Actors (vLLM for fast generation)
class PPOActor:
    def __init__(self, model_path, tokenizer, num_gpus=1):
        self.llm = LLM(model=model_path, tensor_parallel_size=num_gpus)
        self.tokenizer = tokenizer
    
    def generate_batch(self, prompts, sampling_params):
        outputs = self.llm.generate(prompts, sampling_params)
        return [o.outputs[0].text for o in outputs]

# Learner (PPO Update)
class PPOLearner:
    def __init__(self, actor, critic, ref_model, reward_model):
        self.actor = actor
        self.critic = critic
        self.ref_model = ref_model
        self.reward_model = reward_model
    
    def compute_rewards(self, prompts, responses):
        texts = [p + r for p, r in zip(prompts, responses)]
        inputs = tokenizer(texts, return_tensors='pt', padding=True)
        with torch.no_grad():
            rewards = self.reward_model(inputs['input_ids'], inputs['attention_mask'])
        return rewards
    
    def ppo_update(self, prompts, responses, rewards):
        # Standard PPO with KL penalty
        # ...
        pass
```

### V-trace for Off-Policy Correction (IMPALA)
```python
def vtrace_loss(log_probs, old_log_probs, rewards, values, gamma=0.99, rho_bar=1.0, c_bar=1.0):
    rhos = torch.exp(log_probs - old_log_probs).clamp(max=rho_bar)
    cs = torch.exp(log_probs - old_log_probs).clamp(max=c_bar)
    
    vs = values.clone()
    for t in reversed(range(len(rewards))):
        delta = rewards[t] + gamma * values[t+1] - values[t]
        vs[t] = values[t] + rhos[t] * (delta + gamma * cs[t] * (vs[t+1] - values[t+1]))
    
    pg_loss = -(log_probs * rhos * (rewards + gamma * vs[1:] - values[:-1])).mean()
    value_loss = F.mse_loss(values[:-1], vs[:-1])
    return pg_loss + 0.5 * value_loss
```

---

## 5. Iterative DPO

### Iterative Preference Optimization
```python
def iterative_dpo(base_model, sft_data, initial_pref_data, n_iterations=3):
    model = base_model
    
    for iteration in range(n_iterations):
        print(f"Iteration {iteration + 1}")
        
        # 1. SFT on instruction data
        model = sft_train(model, sft_data)
        
        # 2. Generate comparison data using current model
        prompts = generate_diverse_prompts(n=10000)
        responses_a = model.generate(prompts)
        responses_b = model.generate(prompts)  # Or use different temp
        
        # Get preferences (human or AI)
        preferences = get_preferences(prompts, responses_a, responses_b)
        
        # 3. DPO on new preferences
        model = dpo_train(model, preferences)
        
        # 4. Evaluate
        eval_score = evaluate(model)
        print(f"Iteration {iteration} eval: {eval_score}")
    
    return model
```

---

## 6. Model Merging & Arithmetic

### Linear Merging (Model Soups)
```python
def linear_merge(models, weights=None):
    if weights is None:
        weights = [1.0 / len(models)] * len(models)
    
    merged = copy.deepcopy(models[0])
    for name, param in merged.named_parameters():
        param.data = sum(w * m.state_dict()[name] for w, m in zip(weights, models))
    return merged
```

### Task Arithmetic (Ilharco et al., 2022)
```python
# task_vector = fine_tuned - pre_trained
# new_model = pre_trained + sum(task_vectors)

def task_arithmetic(base_model, fine_tuned_models):
    task_vectors = []
    for ft_model in fine_tuned_models:
        tv = {}
        for name in base_model.state_dict():
            tv[name] = ft_model.state_dict()[name] - base_model.state_dict()[name]
        task_vectors.append(tv)
    
    # Combine
    merged = copy.deepcopy(base_model)
    for name in merged.state_dict():
        merged.state_dict()[name] += sum(tv[name] for tv in task_vectors)
    return merged
```

### TIES-Merging (TIES: Trimming, Electing Signs, Merging)
```python
def ties_merging(models, trim_rate=0.5):
    # 1. Trim: Keep top-k% parameters by magnitude
    # 2. Elect Sign: Resolve sign conflicts by majority vote
    # 3. Merge: Average parameters with same sign
    pass
```

---

## 6. Evaluation Infrastructure

### Automated Evaluation Suite
```python
class EvaluationSuite:
    def __init__(self):
        self.benchmarks = {
            'mmlu': MMLUEvaluator(),
            'gsm8k': GSM8KEvaluator(),
            'humaneval': HumanEvalEvaluator(),
            'mt_bench': MTBenchEvaluator(),
            'truthfulqa': TruthfulQAEvaluator(),
            'toxigen': ToxigenEvaluator(),
        }
    
    def run_all(self, model):
        results = {}
        for name, evaluator in self.benchmarks.items():
            results[name] = evaluator.evaluate(model)
        return results

class MTBenchEvaluator:
    def __init__(self, judge_model='gpt-4'):
        self.judge = AutoModelForCausalLM.from_pretrained(judge_model)
    
    def evaluate(self, model):
        prompts = load_mt_bench_prompts()
        responses = [model.generate(p) for p in prompts]
        
        # Pairwise vs GPT-4
        scores = []
        for prompt, resp in zip(prompts, responses):
            gpt4_resp = gpt4.generate(prompt)
            score = pairwise_judge(self.judge, prompt, resp, gpt4_resp)
            scores.append(score)
        
        return {'win_rate': sum(s=='A' for s in scores)/len(scores)}
```

### Safety Evaluation Pipeline
```python
class SafetyEvaluator:
    def __init__(self):
        self.red_team_prompts = load_red_team_dataset()
        self.safety_classifier = SafetyClassifier()
    
    def evaluate(self, model):
        results = defaultdict(lambda: {'total': 0, 'violations': 0})
        
        for category, prompt in self.red_team_prompts:
            response = model.generate(prompt)
            is_safe = self.safety_classifier.is_safe(response)
            
            results[category]['total'] += 1
            if not is_safe:
                results[category]['violations'] += 1
        
        return {cat: v['violations']/v['total'] for cat, v in results.items()}
```

---

## 7. Deployment Infrastructure

### Model Serving with vLLM
```python
# Production vLLM server
from vllm import LLM, SamplingParams
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
llm = LLM(
    model="aligned-model",
    tensor_parallel_size=4,
    gpu_memory_utilization=0.9,
    max_model_len=8192,
    quantization="awq",
)

class GenerationRequest(BaseModel):
    prompt: str
    max_tokens: int = 512
    temperature: float = 0.7
    top_p: float = 0.9
    stop: List[str] = []

@app.post("/generate")
async def generate(request: GenerationRequest):
    sampling = SamplingParams(
        temperature=request.temperature,
        top_p=request.top_p,
        max_tokens=request.max_tokens,
        stop=request.stop,
    )
    outputs = llm.generate([request.prompt], sampling)
    return {"text": outputs[0].outputs[0].text}
```

### KV Cache Optimization
```python
# PagedAttention (vLLM default)
# Continuous Batching
# Prefix Caching for system prompts
```

### Quantized Deployment
```bash
# AWQ quantization
python -m awq.entry --model_path aligned-model --quant_path awq-model --w_bit 4 --q_group_size 128

# GGUF for CPU/edge
python convert-hf-to-gguf.py aligned-model --outfile model.gguf --outtype q4_k_m
```

---

## 7. Monitoring & Observability

### Production Metrics
```python
class RLHFMonitor:
    def __init__(self):
        self.metrics = {
            'ttft': Histogram('ttft_seconds'),
            'tpot': Histogram('tpot_seconds'),
            'throughput': Counter('tokens_generated_total'),
            'error_rate': Counter('generation_errors_total'),
            'reward_score': Histogram('reward_score'),
            'safety_violations': Counter('safety_violations_total'),
        }
    
    def record_generation(self, prompt, response, reward, latency):
        self.metrics['ttft'].observe(latency.ttft)
        self.metrics['tpot'].observe(latency.tpot)
        self.metrics['throughput'].inc(len(response))
        self.metrics['reward_score'].observe(reward)
```

### Drift Detection
```python
def detect_drift(reference_embeddings, current_embeddings, threshold=0.1):
    # MMD (Maximum Mean Discrepancy)
    mmd = compute_mmd(reference_embeddings, current_embeddings)
    return mmd > threshold

# Monitor:
# - Query embedding drift
# - Response embedding drift
# - Reward score drift
# - Token distribution drift
```

---

## 8. A/B Testing Framework
```python
class ABTestFramework:
    def __init__(self, model_a, model_b, traffic_split=0.1):
        self.model_a = model_a  # Control
        self.model_b = model_b  # Treatment
        self.split = traffic_split
        self.metrics = defaultdict(lambda: {'a': [], 'b': []})
    
    def route(self, request, user_id):
        variant = 'a' if hash(user_id) % 100 < self.split * 100 else 'b'
        model = self.model_a if variant == 'a' else self.model_b
        return variant, model.generate(request.prompt)
    
    def record(self, variant, metric, value):
        self.metrics[metric][variant].append(value)
    
    def analyze(self):
        for metric, vals in self.metrics.items():
            a_vals, b_vals = vals['a'], vals['b']
            stat, p = ttest_ind(a_vals, b_vals)
            lift = (np.mean(b_vals) - np.mean(a_vals)) / np.mean(a_vals)
            yield {'metric': metric, 'lift': lift, 'p_value': p, 'significant': p < 0.05}
```

---

## 9. CI/CD for RLHF
```yaml
# .github/workflows/rlhf-pipeline.yml
name: RLHF Pipeline

on:
  push:
    tags: ['v*']

jobs:
  sft:
    runs-on: gpu-cluster
    steps:
      - uses: actions/checkout@v4
      - name: Train SFT
        run: python train_sft.py --config configs/sft.yaml
      - name: Upload Model
        uses: actions/upload-artifact@v4
        with:
          name: sft-model
          path: ./output/sft-model
  
  reward-model:
    needs: sft
    runs-on: gpu-cluster
    steps:
      - uses: actions/download-artifact@v4
        with: {name: sft-model}
      - name: Train RM
        run: python train_rm.py --config configs/rm.yaml
      - name: Upload RM
        uses: actions/upload-artifact@v4
        with:
          name: reward-model
          path: ./output/rm
  
  rlhf:
    needs: [sft, reward-model]
    runs-on: gpu-cluster
    steps:
      - uses: actions/download-artifact@v4
        with: {name: sft-model}
      - uses: actions/download-artifact@v4
        with: {name: reward-model}
      - name: PPO Training
        run: python train_ppo.py --config configs/ppo.yaml
      - name: Evaluate
        run: python evaluate.py --model ./output/rlhf-model
      - name: Deploy to Staging
        if: success()
        run: kubectl set image deployment/llm llm=my-registry/rlhf-model:${{ github.ref_name }}
```

---

## 10. Cost Optimization

### Training Cost Estimates (A100 80GB, 2024)
| Model Size | SFT | RM Training | PPO (1 epoch) | Total (est) |
|------------|-----|-------------|---------------|-------------|
| **7B** | $50 | $30 | $200 | ~$300 |
| **13B** | $100 | $60 | $400 | ~$600 |
| **70B** | $500 | $300 | $2000 | ~$3000 |

### Cost Reduction Strategies
```python
# 1. Gradient Accumulation (simulate larger batch)
accumulation_steps = 8
loss = loss / accumulation_steps
loss.backward()
if (step + 1) % accumulation_steps == 0:
    optimizer.step()
    optimizer.zero_grad()

# 2. Gradient Checkpointing
model.gradient_checkpointing_enable()

# 3. Mixed Precision (BF16)
with torch.autocast(device_type='cuda', dtype=torch.bfloat16):
    outputs = model(...)

# 4. Flash Attention
model = AutoModelForCausalLM.from_pretrained(..., attn_implementation="flash_attention_2")

# 5. LoRA for SFT (not PPO)
lora_config = LoraConfig(r=64, lora_alpha=16, target_modules=["q_proj", "v_proj"])
model = get_peft_model(model, lora_config)

# 6. Spot Instances (70-90% discount)
# 6. Model Cascading (route easy queries to small model)
```

---

## 11. Key Takeaways

1. **Data Quality > Quantity**: Curated preference data beats massive noisy data
2. **Reward Model is Critical**: Invest in RM quality; it's the bottleneck
3. **DPO > PPO for Most Cases**: Simpler, stable, matches PPO performance
4. **Iterate**: Collect preferences from best model → retrain RM → realign
5. **Eval Holistically**: Benchmarks + Human Eval + Safety + Production A/B
6. **Monitor Drift**: Embeddings, reward scores, refusal rates, latency
7. **Infrastructure Matters**: vLLM, FlashAttention, quantization, batching
8. **Iterative DPO** often beats single-round RLHF
9. **Model Merging** can combine specialized models cheaply
10. **Cost**: SFT + RM + PPO ≈ 3-5x SFT cost; plan budget accordingly