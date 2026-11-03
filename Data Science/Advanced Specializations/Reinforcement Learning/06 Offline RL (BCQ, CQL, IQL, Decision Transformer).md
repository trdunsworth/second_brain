# Offline Reinforcement Learning (Batch RL)

Offline RL learns policies from fixed datasets $\mathcal{D} = \{(s, a, r, s')\}$ without environment interaction. Critical for real-world applications (healthcare, robotics, recommender systems).

## 1. The Offline RL Problem

### Dataset
$$\mathcal{D} = \{(s_i, a_i, r_i, s'_i)\}_{i=1}^N \sim \pi_\beta$$
where $\pi_\beta$ is the behavior policy (unknown, possibly suboptimal).

### Core Challenge: Distributional Shift
$$\pi_\theta(a|s) \neq \pi_\beta(a|s) \implies \text{extrapolation error}$$

When policy visits $(s,a)$ pairs not in dataset, Q-values are unreliable → overestimation → policy exploits errors.

### Key Equation (Distribution Mismatch)
$$\mathbb{E}_{s \sim d^{\pi}, a \sim \pi}[Q(s,a)] = \mathbb{E}_{s \sim d^{\pi_\beta}, a \sim \pi_\beta} \left[ \frac{\pi(a|s)}{\pi_\beta(a|s)} Q(s,a) \right]$$

Importance sampling ratio $\frac{\pi}{\pi_\beta}$ can explode if $\pi_\beta(a|s) \approx 0$.

---

## 2. Behavior Regularization Methods

### 2.1 BCQ (Batch-Constrained Q-learning) - Fujimoto et al., 2019
**Idea**: Constrain policy to stay close to behavior policy using generative model.

```python
class BCQ:
    def __init__(self, state_dim, action_dim):
        # VAE for behavior policy
        self.vae = VAE(state_dim, action_dim, latent_dim=action_dim * 2)
        
        # Q-networks
        self.q1 = QNetwork(state_dim, action_dim)
        self.q2 = QNetwork(state_dim, action_dim)
        self.target_q1 = copy.deepcopy(self.q1)
        self.target_q2 = copy.deepcopy(self.q2)
        
        # Perturbation model
        self.perturb = PerturbationModel(state_dim, action_dim)
    
    def select_action(self, state):
        # Sample actions from VAE
        with torch.no_grad():
            actions = self.vae.decode(state, n_samples=100)
            # Perturb
            actions = actions + self.perturb(state, actions)
            actions = actions.clamp(-1, 1)
            
            # Evaluate with Q
            q1 = self.q1(state.repeat(100, 1), actions)
            q2 = self.q2(state.repeat(100, 1), actions)
            q = torch.min(q1, q2)
            
            return actions[q.argmax()].cpu().numpy()
    
    def update(self, batch):
        state, action, reward, next_state, done = batch
        
        # VAE update
        recon, mean, std = self.vae(state, action)
        vae_loss = F.mse_loss(recon, action) + 0.5 * (mean**2 + std**2 - 2*std.log() - 1).mean()
        
        # Critic update
        with torch.no_grad():
            next_action = self.vae.decode(next_state)
            next_action = next_action + self.perturb(next_state, next_action)
            target_q = reward + gamma * (1 - done) * torch.min(
                self.target_q1(next_state, next_action),
                self.target_q2(next_state, next_action)
            )
        
        q1 = self.q1(state, action)
        q2 = self.q2(state, action)
        critic_loss = F.mse_loss(q1, target_q) + F.mse_loss(q2, target_q)
```

### 2.2 BEAR (Kumar et al., 2019)
```python
# KL-constraint on policy
# min_π E[(Q - target)^2] + λ * D_KL(π || π_β)
def bear_loss(q, action, log_pi, log_pi_beta):
    q_loss = F.mse_loss(q, target)
    kl = (log_pi - log_pi_beta).mean()
    return q_loss + lambda_kl * kl
```

### 2.3 BRAC (Wu et al., 2019)
```python
# BRAC-p: Penalize divergence in policy loss
# BRAC-v: Penalize in value function
def brac_p_loss(actor_loss, log_pi, log_pi_beta, alpha):
    return actor_loss + alpha * (log_pi - log_pi_beta).mean()

def brac_v_loss(critic_loss, log_pi, log_pi_beta, alpha):
    return critic_loss + alpha * (log_pi - log_pi_beta).mean()
```

---

## 3. Value Regularization Methods

### 3.1 CQL (Conservative Q-Learning) - Kumar et al., 2020
**Core Idea**: Minimize Q-values for OOD actions while maximizing for in-dataset actions.

$$\min_Q \alpha \mathbb{E}_{s \sim \mathcal{D}} \left[ \log \sum_a \exp Q(s,a) - Q(s,a) \right] + \mathbb{E}_{(s,a,r,s') \sim \mathcal{D}} [(Q - \mathcal{B}^\pi Q)^2]$$

```python
class CQL:
    def __init__(self, state_dim, action_dim, alpha=5.0, n_action_samples=10):
        self.q1 = QNetwork(state_dim, action_dim)
        self.q2 = QNetwork(state_dim, action_dim)
        self.target_q1 = copy.deepcopy(self.q1)
        self.target_q2 = copy.deepcopy(self.q2)
        self.alpha = alpha
        self.n_action_samples = n_action_samples
    
    def cql_loss(self, q_values, dataset_actions):
        # q_values: (batch, action_dim)
        # Standard Bellman error
        bellman_loss = F.mse_loss(q_values.gather(1, dataset_actions), targets)
        
        # CQL regularization
        logsumexp = torch.logsumexp(q_values, dim=1, keepdim=True)
        q_dataset = q_values.gather(1, dataset_actions)
        cql_reg = (logsumexp - q_dataset).mean()
        
        return bellman_loss + self.alpha * cql_reg
```

### CQL with Lagrange Multiplier (Adaptive Alpha)
```python
class CQL_Lagrange:
    def __init__(self, target_action_gap=1.0):
        self.log_alpha = nn.Parameter(torch.log(torch.tensor(1.0)))
        self.target_action_gap = target_action_gap
    
    def cql_loss(self, q_values, dataset_actions):
        logsumexp = torch.logsumexp(q_values, dim=1)
        q_dataset = q_values.gather(1, dataset_actions).squeeze()
        cql_gap = logsumexp - q_dataset
        
        alpha = self.log_alpha.exp()
        alpha_loss = alpha * (cql_gap - self.target_action_gap).mean().detach()
        
        return alpha * cql_gap.mean(), alpha_loss
```

### 3.2 IQL (Implicit Q-Learning) - Kostrikov et al., 2021
**Key Idea**: Avoid querying Q for OOD actions by learning value function $V(s)$ via expectile regression.

```python
class IQL:
    def __init__(self, state_dim, action_dim, expectile=0.7, beta=3.0):
        self.v_net = ValueNetwork(state_dim)
        self.q1 = QNetwork(state_dim, action_dim)
        self.q2 = QNetwork(state_dim, action_dim)
        self.actor = GaussianPolicy(state_dim, action_dim)
        self.expectile = expectile
        self.beta = beta
    
    def update(self, batch):
        state, action, reward, next_state, done = batch
        
        # 1. Update Q (standard)
        with torch.no_grad():
            next_v = self.v_net(next_state)
            target_q = reward + gamma * (1 - done) * next_v
        
        q1_loss = F.mse_loss(self.q1(state, action), target_q)
        q2_loss = F.mse_loss(self.q2(state, action), target_q)
        
        # 2. Update V (Expectile Regression)
        with torch.no_grad():
            q = torch.min(self.q1(state, action), self.q2(state, action))
        v = self.v_net(state)
        v_loss = expectile_loss(v, q.detach(), self.expectile)
        
        # 3. Update Actor (Advantage Weighted Regression)
        with torch.no_grad():
            q = torch.min(self.q1(state, action), self.q2(state, action))
            v = self.v_net(state)
            adv = q - v
            weight = torch.exp(self.beta * adv).clamp(max=100)
        
        new_action, log_prob = self.actor.sample(state)
        actor_loss = -(weight * log_prob).mean()
```

### Expectile Regression Loss
```python
def expectile_loss(pred, target, expectile):
    diff = target - pred
    weight = torch.where(diff > 0, expectile, 1 - expectile)
    return (weight * diff**2).mean()
```

---

## 4. Sequence Modeling Approaches

### 4.1 Decision Transformer (Chen et al., 2021)
**Idea**: Frame RL as conditional sequence modeling: $a_t = \pi(a_t | s_t, R_t)$ where $R_t = \sum_{t'=t}^T r_{t'}$ is return-to-go.

```python
class DecisionTransformer(nn.Module):
    def __init__(self, state_dim, action_dim, hidden_dim=128, n_layers=3, n_heads=4):
        super().__init__()
        self.embed_state = nn.Linear(state_dim, hidden_dim)
        self.embed_action = nn.Linear(action_dim, hidden_dim)
        self.embed_return = nn.Linear(1, hidden_dim)
        self.embed_timestep = nn.Embedding(max_ep_len, hidden_dim)
        
        self.transformer = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(hidden_dim, n_heads, hidden_dim*4, batch_first=True),
            num_layers=n_layers
        )
        self.action_head = nn.Linear(hidden_dim, action_dim)
    
    def forward(self, states, actions, returns_to_go, timesteps):
        # states: (batch, seq_len, state_dim)
        # actions: (batch, seq_len, action_dim)
        # returns_to_go: (batch, seq_len, 1)
        # timesteps: (batch, seq_len)
        
        state_emb = self.embed_state(states)
        action_emb = self.embed_action(actions)
        return_emb = self.embed_return(returns_to_go)
        time_emb = self.embed_timestep(timesteps)
        
        # Interleave: [R_1, s_1, a_1, R_2, s_2, a_2, ...]
        inputs = torch.stack([return_emb, state_emb + time_emb, action_emb + time_emb], dim=2)
        inputs = inputs.view(inputs.size(0), -1, inputs.size(-1))
        
        # Causal mask
        mask = torch.triu(torch.ones(seq_len*3, seq_len*3), diagonal=1).bool()
        
        x = self.transformer(inputs, mask=mask)
        # Predict actions
        action_preds = self.action_head(x[:, 1::3])  # Action positions
        return action_preds
```

### Training
```python
def train_decision_transformer(model, dataset, batch_size=256):
    for batch in dataset:
        states, actions, rewards, timesteps = batch
        
        # Compute returns-to-go
        returns_to_go = compute_returns_to_go(rewards, gamma=1.0)
        
        # Forward
        action_preds = model(states, actions, returns_to_go, timesteps)
        
        # Loss
        loss = F.mse_loss(action_preds, actions)
        
        loss.backward()
        optimizer.step()
```

### Inference
```python
def dt_inference(model, env, target_return, max_ep_len=1000):
    state = env.reset()
    returns_to_go = target_return
    timestep = 0
    
    for t in range(max_ep_len):
        # Build sequence
        states = torch.stack(history_states[-context_len:])
        actions = torch.stack(history_actions[-context_len:])
        rtg = torch.tensor(history_rtg[-context_len:])
        timesteps = torch.arange(max(0, t-context_len), t+1)
        
        # Predict action
        with torch.no_grad():
            action_pred = model(states, actions, rtg, timesteps)
            action = action_pred[-1]
        
        state, reward, done, _ = env.step(action)
        history_states.append(state)
        history_actions.append(action)
        returns_to_go = returns_to_go - reward
        
        if done:
            break
```

### 4.2 Trajectory Transformer (Janner et al., 2021)
**Idea**: Model trajectory as sequence, use beam search for planning.

```python
class TrajectoryTransformer(nn.Module):
    def __init__(self, state_dim, action_dim, hidden_dim=256):
        super().__init__()
        self.embed = nn.Linear(state_dim + action_dim + 1, hidden_dim)  # s, a, r
        self.transformer = GPT2Model(config)
        self.head = nn.Linear(hidden_dim, state_dim + action_dim + 1)
    
    def forward(self, trajectory):
        # trajectory: (batch, seq_len, state+action+reward)
        return self.head(self.transformer(self.embed(trajectory)))
```

### 4.3 DT vs TT
| Aspect | Decision Transformer | Trajectory Transformer |
|--------|---------------------|------------------------|
| **Input** | (R, s, a) triplets | Full trajectory |
| **Training** | Supervised (action pred) | Generative (next token) |
| **Inference** | Autoregressive (fixed R) | Beam search / sampling |
| **Planning** | No | Yes (via beam search) |

---

## 5. Reward-Conditioned Policies

### 4.4 RvS (Reward-Conditioned Policy) - Emmons et al., 2021
```python
class RvS:
    def __init__(self):
        self.policy = RewardConditionedPolicy()
    
    def forward(self, state, target_reward):
        return self.policy(state, target_reward)

# Training: Upsample high-reward trajectories
def rvs_loss(batch):
    states, actions, rewards = batch
    target_rewards = compute_returns_to_go(rewards)
    loss = F.cross_entropy(policy(states, target_rewards), actions)
    return loss
```

### 4.5 Upside-Down RL (Srivastava et al., 2019)
```python
# Command: (desired_return, desired_horizon)
def udrl_loss(batch):
    states, actions, returns, horizons = batch
    # Supervised: π(a|s, R, H)
    return F.cross_entropy(policy(states, returns, horizons), actions)
```

---

## 6. Imitation + RL Hybrid

### 4.6 AWAC (Nair et al., 2020)
```python
# Advantage Weighted Actor-Critic
# Actor loss: -E[exp(β * A(s,a)) * log π(a|s)]

def awac_loss(actor, critic, state, action, beta=1.0):
    with torch.no_grad():
        v = critic.v(state)
        q = critic.q(state, action)
        adv = (q - v).clamp(max=10)
    
    log_prob = actor.log_prob(state, action)
    weight = torch.exp(beta * adv).clamp(max=100)
    return -(weight * log_prob).mean()
```

### 4.7 CRR (Critic Regularized Regression) - Wang et al., 2020
```python
# Policy improvement via weighted regression
def crr_loss(actor, critic, state, action, beta=1.0, n_samples=16):
    with torch.no_grad():
        v = critic.v(state)
        q = critic.q(state, action)
        adv = q - v
    
    weight = torch.exp(beta * adv).clamp(max=100)
    log_prob = actor.log_prob(state, action)
    return -(weight * log_prob).mean()
```

---

## 7. Uncertainty-Based Methods

### 7.1 MOPO (Model-based Offline Policy Optimization) - Yu et al., 2020
```python
class MOPO:
    def __init__(self, penalty_coef=1.0):
        self.dynamics = EnsembleDynamics()  # Ensemble of dynamics models
        self.policy = SAC()
        self.penalty_coef = penalty_coef
    
    def model_penalty(self, state, action):
        # Ensemble variance as uncertainty
        with torch.no_grad():
            preds = [model(state, action) for model in self.dynamics.models]
            penalty = torch.stack(preds).var(0).mean(-1)
        return penalty
    
    def update(self, batch):
        state, action, reward, next_state, done = batch
        
        # Penalized reward
        penalty = self.model_penalty(state, action)
        penalized_reward = reward - self.penalty_coef * penalty
        
        # Standard SAC update with penalized reward
        # ...
```

### 7.2 MOReL (Model-based Offline RL) - Kidambi et al., 2020
```python
# Detect OOD using model uncertainty
def morel_penalty(state, action):
    # If uncertainty > threshold: terminate episode (pessimistic)
    if uncertainty > threshold:
        return -large_penalty
    return 0
```

---

## 8. Evaluation Protocols

### 8.1 D4RL Benchmark
```python
import d4rl
import gym

env = gym.make('hopper-medium-v2')
dataset = env.get_dataset()
# Keys: observations, actions, rewards, terminals, timeouts
```

### 8.2 Metrics
```python
def evaluate_offline_policy(policy, env, n_episodes=10):
    returns = []
    for _ in range(n_episodes):
        obs = env.reset()
        total_reward = 0
        done = False
        while not done:
            action = policy(obs, deterministic=True)
            obs, reward, done, _ = env.step(action)
            total_reward += reward
        returns.append(total_reward)
    
    # Normalized score
    random_score = env.get_random_score()
    expert_score = env.get_expert_score()
    normalized = (np.mean(returns) - random_score) / (expert_score - random_score)
    return normalized * 100
```

---

## 9. Practical Guidelines

### Algorithm Selection
| Scenario | Recommended |
|----------|-------------|
| **Good coverage, near-optimal data** | BC / AWAC |
| **Suboptimal diverse data** | CQL / IQL |
| **Need to plan/plan** | Decision Transformer / TT |
| **Dynamics known/simulatable** | MOPO / MOReL |
| **High-dimensional continuous** | CQL / IQL / SAC |
| **Discrete actions** | CQL / DT |
| **Safety critical** | CQL (conservative) |

### Hyperparameters
```python
# CQL
alpha = 5.0  # Conservative weight (1-10)
n_action_samples = 10  # For expectation

# IQL
expectile = 0.7  # 0.7-0.9 (higher = more conservative)
beta = 3.0  # Advantage weight (1-10)

# Decision Transformer
context_len = 20  # K in paper
hidden_dim = 128
n_layers = 3
n_heads = 1
dropout = 0.1

# BCQ
n_samples = 100  # VAE samples for action selection
```

### Data Quality Checks
```python
def analyze_dataset(dataset):
    obs = dataset['observations']
    actions = dataset['actions']
    rewards = dataset['rewards']
    
    print(f"Episodes: {len(np.where(dataset['terminals'])[0])}")
    print(f"Steps: {len(obs)}")
    print(f"Reward mean: {rewards.mean():.3f}, std: {rewards.std():.3f}")
    print(f"Action range: [{actions.min():.3f}, {actions.max():.3f}]")
    print(f"Obs mean: {obs.mean():.3f}, std: {obs.std():.3f}")
    
    # Coverage
    if actions.ndim == 2:
        for d in range(actions.shape[1]):
            print(f"Action {d}: [{actions[:,d].min():.3f}, {actions[:,d].max():.3f}]")
```

---

## 10. Key Takeaways

1. **Offline RL = Supervised Learning + RL**: Core challenge is distributional shift
2. **CQL** is the default choice: simple, effective, conservative by design
3. **IQL** avoids Q-queries for OOD actions via expectile regression
4. **Decision Transformer** frames RL as sequence modeling → leverages Transformer
5. **Behavior Cloning (BC)** is strong baseline when data is near-optimal
6. **Conservative Q-learning** (CQL) regularizes Q-values down for OOD actions
7. **Expectile regression** (IQL) learns value function without OOD queries
8. **Sequence modeling** (DT, TT) enables planning and long-horizon credit assignment
9. **Uncertainty quantification** (MOPO, MOReL) enables model-based offline RL
10. **Evaluation**: Use D4RL benchmarks, normalized scores, multiple seeds