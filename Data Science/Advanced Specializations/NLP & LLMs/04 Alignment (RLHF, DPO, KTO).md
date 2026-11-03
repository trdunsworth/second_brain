# Alignment: RLHF, DPO, KTO, and Beyond

Alignment makes models helpful, harmless, and honest. This note covers the three main paradigms: RLHF (PPO), Direct Preference Optimization (DPO), and Kahneman-Tversky Optimization (KTO).

## 1. The Alignment Pipeline

```
Pre-trained Base Model
       ↓
Continued Pre-training (Optional, Domain Data)
       ↓
Supervised Fine-tuning (SFT) → Instruction-following model
       ↓
Reward Model Training (RM) ← Human Preference Data
       ↓
RLHF (PPO) / DPO / KTO → Aligned Model
       ↓
Evaluation (MT-Bench, MMLU, Safety, Human Eval)
```

---

## 2. Reward Model Training

### Data Format
```json
// Comparison data (pairwise)
{
  "prompt": "Write a poem about cats",
  "chosen": "Cats are wonderful creatures...",    // Human preferred
  "rejected": "Cats are animals that meow..."     // Human dispreferred
}

// Or with scores
{
  "prompt": "Explain quantum computing",
  "responses": [
    {"text": "Quantum computing uses qubits...", "score": 4.5},
    {"text": "It's like regular computing but...", "score": 2.0}
  ]
}
```

### Reward Model Architecture
```python
class RewardModel(nn.Module):
    def __init__(self, base_model, hidden_size):
        super().__init__()
        self.base = base_model
        self.score_head = nn.Linear(hidden_size, 1, bias=False)
    
    def forward(self, input_ids, attention_mask=None):
        outputs = self.base(input_ids, attention_mask=attention_mask)
        last_hidden = outputs.last_hidden_state
        # Use last token (or pooled)
        rewards = self.score_head(last_hidden[:, -1, :]).squeeze(-1)
        return rewards
```

### Bradley-Terry Loss (Pairwise)
```python
def reward_loss(chosen_rewards, rejected_rewards, margin=0.0):
    # Bradley-Terry: P(chosen > rejected) = sigmoid(r_chosen - r_rejected)
    loss = -F.logsigmoid(chosen_rewards - rejected_rewards - margin).mean()
    return loss

# Or with multiple comparisons
def multi_comparison_loss(rewards, labels):
    # rewards: (batch, n_responses), labels: (batch) index of best
    logits = rewards / temperature
    loss = F.cross_entropy(logits, labels)
    return loss
```

### Training
```python
from trl import RewardTrainer

trainer = RewardTrainer(
    model=reward_model,
    tokenizer=tokenizer,
    train_dataset=pref_dataset,
    args=TrainingArguments(
        learning_rate=1e-5,
        per_device_train_batch_size=16,
        gradient_accumulation_steps=4,
        num_train_epochs=1,
        bf16=True,
        gradient_checkpointing=True,
    ),
)
trainer.train()
```

---

## 3. RLHF with PPO

### PPO Algorithm for LLMs
```python
# Simplified PPO update
def ppo_step(model, ref_model, reward_model, batch, kl_coef=0.1):
    # 1. Generate responses
    responses = model.generate(batch["input_ids"])
    
    # 2. Get rewards
    rewards = reward_model(responses)
    
    # 3. KL penalty (prevent divergence from SFT model)
    with torch.no_grad():
        ref_logprobs = ref_model(responses).logprobs
    logprobs = model(responses).logprobs
    kl_div = (logprobs - ref_logprobs).mean()
    
    # 4. PPO objective
    # Advantage = reward - kl_coef * kl_div
    advantage = rewards - kl_coef * kl_div
    
    # PPO clip
    ratio = torch.exp(logprobs - old_logprobs)
    clipped = torch.clamp(ratio, 1-clip_eps, 1+clip_eps) * advantage
    policy_loss = -torch.min(ratio * advantage, clipped).mean()
    
    # Value loss (critic)
    value_loss = F.mse_loss(values, returns)
    
    # Entropy bonus
    entropy_loss = -entropy_coef * entropy.mean()
    
    return policy_loss + value_loss + entropy_loss
```

### TRL PPOTrainer
```python
from trl import PPOTrainer, AutoModelForCausalLMWithValueHead

# Add value head to model
ppo_model = AutoModelForCausalLMWithValueHead.from_pretrained(sft_model)

ppo_trainer = PPOTrainer(
    model=ppo_model,
    ref_model=ref_model,           # Frozen SFT model
    tokenizer=tokenizer,
    dataset=prompt_dataset,
    args=PPOConfig(
        learning_rate=1e-5,
        batch_size=32,
        mini_batch_size=4,
        gradient_accumulation_steps=4,
        ppo_epochs=4,
        cliprange=0.2,
        cliprange_value=0.2,
        vf_coef=0.1,
        kl_penalty="kl",           # "kl" or "abs"
        kl_coef=0.1,               # Adaptive KL control
        target_kl=0.1,
        gamma=1.0,
        lam=0.95,
    ),
)

# PPO Loop
for epoch, batch in enumerate(ppo_trainer.dataloader):
    # 1. Generate
    query_tensors = batch["input_ids"]
    response_tensors = ppo_trainer.generate(query_tensors, max_new_tokens=128)
    
    # 2. Compute rewards
    texts = [tokenizer.decode(q + r) for q, r in zip(query_tensors, response_tensors)]
    rewards = reward_model(texts)
    
    # 3. PPO Step
    stats = ppo_trainer.step(query_tensors, response_tensors, rewards)
```

### PPO Hyperparameters
| Param | Typical Range | Notes |
|-------|---------------|-------|
| **learning_rate** | 1e-6 - 1e-5 | Lower than SFT |
| **kl_coef** | 0.05 - 0.2 | Start low, adapt |
| **target_kl** | 0.05 - 0.15 | Per token |
| **cliprange** | 0.1 - 0.3 | PPO clip epsilon |
| **vf_coef** | 0.1 - 1.0 | Value loss weight |
| **batch_size** | 32 - 256 | Total prompts per step |
| **mini_batch_size** | 4 - 16 | For multiple PPO epochs |
| **ppo_epochs** | 1 - 4 | Epochs per batch |

### PPO Challenges
| Challenge | Solution |
|-----------|----------|
| **Training instability** | Adaptive KL, reward normalization, gradient clipping |
| **Reward hacking** | KL penalty, diverse prompts, ensemble RM |
| **Slow (sequential)** | Batched generation, vLLM for inference |
| **Memory** | FSDP + activation checkpointing + offload |
| **Reference model drift** | Keep frozen, periodic sync |

---

## 4. Direct Preference Optimization (DPO)

### Key Insight
DPO optimizes the policy directly from preferences **without** a separate RL loop.

### Theoretical Foundation
Under Bradley-Terry, the optimal policy is:
$$\pi^*(y|x) \propto \pi_{\text{ref}}(y|x) \exp\left(\frac{1}{\beta} r(x,y)\right)$$

Solving for reward:
$$r(x,y) = \beta \log \frac{\pi(y|x)}{\pi_{\text{ref}}(y|x)} + \beta \log Z(x)$$

Plugging into BT loss yields DPO loss:
$$\mathcal{L}_{\text{DPO}} = -\mathbb{E}_{(x,y_w,y_l) \sim D} \left[ \log \sigma \left( \beta \log \frac{\pi(y_w|x)}{\pi_{\text{ref}}(y_w|x)} - \beta \log \frac{\pi(y_l|x)}{\pi_{\text{ref}}(y_l|x)} \right) \right]$$

### DPO Loss Implementation
```python
def dpo_loss(policy_chosen_logps, policy_rejected_logps, 
             ref_chosen_logps, ref_rejected_logps, beta=0.1):
    """
    policy_chosen_logps: log probs of chosen response under policy
    ref_chosen_logps: log probs of chosen response under reference (SFT) model
    """
    # Log ratios
    chosen_logratios = policy_chosen_logps - ref_chosen_logps
    rejected_logratios = policy_rejected_logps - ref_rejected_logps
    
    # DPO loss
    logits = beta * (chosen_logratios - rejected_logratios)
    loss = -F.logsigmoid(logits).mean()
    
    return loss

# With length normalization
def get_logprobs(model, input_ids, attention_mask=None):
    logits = model(input_ids).logits
    logprobs = F.log_softmax(logits, dim=-1)
    # Gather logprobs for actual tokens
    token_logprobs = logprobs.gather(-1, input_ids.unsqueeze(-1)).squeeze(-1)
    # Mask padding
    if attention_mask is not None:
        token_logprobs = token_logprobs * attention_mask
    return token_logprobs.sum(-1) / attention_mask.sum(-1).clamp(min=1)
```

### TRL DPOTrainer
```python
from trl import DPOTrainer

dpo_trainer = DPOTrainer(
    model=model,
    ref_model=ref_model,          # Frozen SFT model
    tokenizer=tokenizer,
    train_dataset=pref_dataset,   # Columns: prompt, chosen, rejected
    args=TrainingArguments(
        learning_rate=5e-6,       # Lower than SFT
        per_device_train_batch_size=4,
        gradient_accumulation_steps=16,
        num_train_epochs=3,
        bf16=True,
        gradient_checkpointing=True,
        lr_scheduler_type="cosine",
        warmup_ratio=0.1,
    ),
    beta=0.1,                     # KL regularization strength
    max_length=1024,
    max_prompt_length=512,
)

dpo_trainer.train()
```

### DPO Hyperparameters
| Param | Typical | Notes |
|-------|---------|-------|
| **beta** | 0.1 - 0.5 | KL regularization (higher = closer to ref) |
| **learning_rate** | 1e-6 - 5e-6 | Lower than SFT |
| **max_length** | 1024 - 4096 | Total sequence length |
| **max_prompt_length** | 512 - 1024 | Prompt only |

### DPO Advantages vs PPO
| Aspect | DPO | PPO |
|--------|-----|-----|
| **Complexity** | Simple (single stage) | Complex (RM + PPO loop) |
| **Stability** | High | Can be unstable |
| **Speed** | Fast (no RM inference) | Slow (generation + RM) |
| **Memory** | 2 models (policy + ref) | 4 models (policy, ref, RM, critic) |
| **Performance** | Comparable or better | Slightly better in some cases |

### DPO Variants

#### IPO (Identity Preference Optimization)
```python
# IPO: Replace sigmoid with identity, no regularization needed
def ipo_loss(policy_chosen_logps, policy_rejected_logps, 
             ref_chosen_logps, ref_rejected_logps, beta=0.1):
    logratios = (policy_chosen_logps - ref_chosen_logps) - (policy_rejected_logps - ref_rejected_logps)
    loss = (logratios - 1/(2*beta))**2
    return loss.mean()
```

#### KTO (Kahneman-Tversky Optimization) — Next Section

---

## 5. Kahneman-Tversky Optimization (KTO)

### Key Idea
Use **Kahneman-Tversky prospect theory** value function instead of BT.
- **Gains** (desirable): Concave value function → diminishing sensitivity
- **Losses** (undesirable): Convex value function → loss aversion

### KTO Loss
```python
def kto_loss(policy_logps, ref_logps, labels, beta=0.1):
    """
    labels: 1 for desirable (chosen), 0 for undesirable (rejected)
    """
    logratios = policy_logps - ref_logps
    
    # Prospect theory value function
    def value_fn(x):
        # Asymmetric: losses hurt more than gains help
        return torch.where(x >= 0, x, 2 * x)  # lambda=2 loss aversion
    
    # KTO loss
    desirable_mask = (labels == 1)
    undesirable_mask = (labels == 0)
    
    # For desirable: maximize value
    desirable_loss = -value_fn(logratios[desirable_mask]).mean()
    
    # For undesirable: minimize value (push negative)
    undesirable_loss = value_fn(logratios[undesirable_mask]).mean()
    
    # Balance
    loss = (desirable_loss * desirable_mask.float().mean() + 
            undesirable_loss * undesirable_mask.float().mean())
    
    return loss
```

### KTO Advantages
| Advantage | Detail |
|-----------|--------|
| **No pairwise data needed** | Works with binary (good/bad) labels |
| **More data efficient** | Uses all data, not just pairs |
| **Psychologically grounded** | Models human loss aversion |
| **Simpler than DPO** | Single forward pass per example |

### TRL KTOTrainer
```python
from trl import KTOTrainer

kto_trainer = KTOTrainer(
    model=model,
    ref_model=ref_model,
    tokenizer=tokenizer,
    train_dataset=kto_dataset,  # Columns: prompt, completion, label (0/1)
    args=TrainingArguments(
        learning_rate=5e-6,
        per_device_train_batch_size=8,
        num_train_epochs=3,
        bf16=True,
    ),
    beta=0.1,
    desirable_weight=1.0,
    undesirable_weight=1.0,
)
kto_trainer.train()
```

---

## 6. Other Alignment Methods

### ORPO (Odds Ratio Preference Optimization)
```python
# Combines SFT + Alignment in single stage
# L_ORPO = L_SFT + λ * L_OR
# L_OR = -log( odds_ratio(chosen) / odds_ratio(rejected) )

def orpo_loss(sft_loss, policy_chosen_logps, policy_rejected_logps, alpha=1.0):
    # Odds ratio
    odds_chosen = torch.exp(policy_chosen_logps) / (1 - torch.exp(policy_chosen_logps))
    odds_rejected = torch.exp(policy_rejected_logps) / (1 - torch.exp(policy_rejected_logps))
    odds_ratio = odds_chosen / odds_rejected
    
    or_loss = -F.logsigmoid(torch.log(odds_ratio)).mean()
    return sft_loss + alpha * or_loss
```

### RLAIF (RL from AI Feedback)
```python
# Use LLM as reward model instead of human
# Constitutional AI: LLM critiques its own outputs per constitution

constitution = [
    "Be helpful, harmless, and honest.",
    "Avoid biased, discriminatory, or toxic content.",
    "Respect user privacy and intellectual property."
]

def rlaif_reward(prompt, response):
    critique_prompt = f"""Review this response per the constitution:
Constitution: {constitution}
Prompt: {prompt}
Response: {response}
Critique:"""
    
    # LLM generates critique and score
    critique = llm.generate(critique_prompt)
    score = extract_score(critique)
    return score
```

### Constitutional AI
```python
# Two phases:
# 1. Supervised: Critique → Revise → Finetune on revised
# 2. RL: AI feedback (RLAIF) with preference model

# Phase 1: Critique & Revision
def constitutional_supervised(model, prompt):
    response = model.generate(prompt)
    critique = model.generate(f"Critique: {constitution}\nResponse: {response}")
    revision = model.generate(f"Revise based on critique: {critique}\nResponse: {response}")
    return revision  # Train on (prompt, revision) pairs

# Phase 2: RLAIF with preference model trained on AI comparisons
```

---

## 7. Alignment Data Quality

### Preference Data Best Practices
```python
# Quality filters for preference pairs
def filter_preferences(dataset):
    filtered = []
    for ex in dataset:
        # Length filter (avoid length bias)
        len_ratio = len(ex['chosen']) / max(len(ex['rejected']), 1)
        if len_ratio > 2.0 or len_ratio < 0.5:
            continue
        
        # Quality: both responses should be reasonable
        if len(ex['chosen']) < 10 or len(ex['rejected']) < 10:
            continue
        
        # Diversity: not too similar
        if similarity(ex['chosen'], ex['rejected']) > 0.9:
            continue
        
        filtered.append(ex)
    return filtered

# Balance: ensure equal chosen/rejected lengths on average
```

### Data Sources
| Source | Scale | Quality | Cost |
|--------|-------|---------|------|
| **Human (RLHF)** | 10K-1M | Highest | $$$$ |
| **Synthetic (Self-Instruct)** | 100K-10M | Medium | $ |
| **Distillation (GPT-4 → Open)** | 50K-1M | High | $$ |
| **AI Feedback (RLAIF)** | 100K-10M | Medium-High | $$ |
| **Open Datasets** | 10K-1M | Variable | Free |

**Key Open Datasets**: HH-RLHF, UltraFeedback, UltraChat, OpenAssistant, PKU-SafeRLHF, Nectar, HelpSteer

---

## 8. Evaluation of Aligned Models

### Automatic Benchmarks
```python
# MT-Bench (multi-turn conversation)
# MMLU (knowledge)
# GSM8K (reasoning)
# HumanEval / MBPP (coding)
# TruthfulQA (hallucination)
# ToxiGen / RealToxicityPrompts (safety)
# AlpacaEval / MT-Bench (win rate vs GPT-4)
```

### Human Evaluation
```python
# Side-by-side comparison
def human_eval(model_a, model_b, prompts, n_annotators=3):
    results = {"a_wins": 0, "b_wins": 0, "ties": 0}
    for prompt in prompts:
        resp_a = model_a.generate(prompt)
        resp_b = model_b.generate(prompt)
        # Randomize order, get preferences
        for _ in range(n_annotators):
            pref = annotator.choose(prompt, resp_a, resp_b)
            if pref == "a": results["a_wins"] += 1
            elif pref == "b": results["b_wins"] += 1
            else: results["ties"] += 1
    return results
```

### Safety Evaluation
```python
# Red teaming
def red_team_evaluation(model, attack_prompts):
    safety_violations = 0
    for prompt in attack_prompts:
        response = model.generate(prompt)
        if safety_classifier.is_unsafe(response):
            safety_violations += 1
    return safety_violations / len(attack_prompts)

# Refusal rate on harmful prompts
# Helpfulness on benign prompts (avoid over-refusal)
```

---

## 9. Alignment Recipe Summary

### Standard RLHF (Best Quality, High Cost)
```
1. SFT on high-quality instruction data (50K-100K)
2. Train RM on human preferences (10K-100K pairs)
3. PPO with adaptive KL (target_kl=0.1)
4. Iterate: collect new prefs from PPO model → retrain RM → PPO
```

### DPO (Best Balance, Recommended)
```
1. SFT on instruction data
2. DPO on preference data (beta=0.1-0.5)
3. Optional: Iterate with new DPO model as ref
```

### KTO (When Only Binary Labels)
```
1. SFT on instruction data
2. KTO on binary feedback (good/bad)
```

### ORPO / RLAIF (Low Compute / No Human Labels)
```
1. SFT + ORPO (single stage)
2. Or: Constitutional AI → RLAIF
```

---

## 10. Key Takeaways

1. **DPO is the new default** — simpler, faster, stable, matches PPO
2. **KTO for binary feedback** — no pairwise data needed, psychologically grounded
3. **Reward model quality > RL algorithm** — invest in preference data
4. **KL regularization is critical** — prevents reward hacking, preserves base capabilities
5. **SFT quality determines ceiling** — alignment can't fix broken SFT
6. **Iterate** — collect preferences from best model, retrain RM, re-align
7. **Evaluate holistically** — helpfulness + harmlessness + honesty + reasoning
8. **DPO beta ≈ 0.1-0.5** — tune per model size and data