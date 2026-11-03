# Policy Gradient Methods

Policy Gradient methods directly optimize the policy $\pi_\theta(a|s)$ by gradient ascent on the expected return, bypassing the need for value functions (though they often use them as critics).

## 1. The Policy Gradient Theorem

### Objective Function
$$J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}[G(\tau)] = \mathbb{E}_{s_0 \sim \rho_0, a_t \sim \pi_\theta, s_{t+1} \sim P}[\sum_{t=0}^\infty \gamma^t R(s_t, a_t)]$$

### Policy Gradient Theorem (Sutton et al., 2000)
$$\nabla_\theta J(\theta) = \mathbb{E}_{s \sim d^\pi, a \sim \pi_\theta}[\nabla_\theta \log \pi_\theta(a|s) Q^\pi(s, a)]$$

where $d^\pi(s) = \sum_{t=0}^\infty \gamma^t P(s_t = s | \pi)$ is the discounted state visitation distribution.

**Key Insight**: We don't need to differentiate through the environment dynamics — only through the policy!

### Likelihood Ratio Trick
$$\nabla_\theta \mathbb{E}_{a \sim \pi_\theta}[f(a)] = \mathbb{E}_{a \sim \pi_\theta}[f(a) \nabla_\theta \log \pi_\theta(a)]$$

Proof: $\nabla \pi = \pi \nabla \log \pi$ → $\nabla \int \pi f = \int \pi f \nabla \log \pi = \mathbb{E}[f \nabla \log \pi]$

---

## 2. REINFORCE (Monte Carlo Policy Gradient)

### Algorithm
```python
def reinforce(env, policy, n_episodes, alpha, gamma):
    for _ in range(n_episodes):
        # Generate episode
        states, actions, rewards = [], [], []
        s = env.reset()
        done = False
        while not done:
            a = policy.sample_action(s)
            s_prime, r, done, _ = env.step(a)
            states.append(s)
            actions.append(a)
            rewards.append(r)
            s = s_prime
        
        # Compute returns
        returns = []
        G = 0
        for r in reversed(rewards):
            G = r + gamma * G
            returns.insert(0, G)
        
        # Optional: Normalize returns
        returns = (returns - np.mean(returns)) / (np.std(returns) + 1e-8)
        
        # Gradient ascent
        for s, a, G in zip(states, actions, returns):
            log_prob = policy.log_prob(s, a)
            loss = -log_prob * G
            loss.backward()
        
        optimizer.step()
        optimizer.zero_grad()
```

### With Baseline (Variance Reduction)
$$\nabla_\theta J(\theta) = \mathbb{E}[\nabla_\theta \log \pi_\theta(a|s) (Q^\pi(s,a) - b(s))]$$

Any baseline $b(s)$ that doesn't depend on $a$ preserves unbiasedness but reduces variance.

**Optimal Baseline** (minimizes variance):
$$b^*(s) = \frac{\mathbb{E}[(\nabla \log \pi)^2 Q]}{\mathbb{E}[(\nabla \log \pi)^2]}$$

In practice, use **state-value function** $V(s)$ as baseline:
```python
# Actor-Critic style baseline
advantage = G - V(s).detach()  # Detach to not backprop through baseline
loss = -log_prob * advantage
```

---

## 3. Actor-Critic Methods

Combine policy gradient (Actor) with value function (Critic) for lower variance.

### Architecture
```
State → [Shared Encoder] → Actor Head (π_θ) → Action
              ↓
           Critic Head (V_φ) → Value
```

### Advantage Actor-Critic (A2C)
```python
def a2c(env, actor, critic, n_steps, gamma, alpha_actor, alpha_critic):
    states, actions, rewards, log_probs, values = [], [], [], [], []
    
    s = env.reset()
    for _ in range(n_steps):
        # Actor forward
        action_dist = actor(s)
        a = action_dist.sample()
        log_prob = action_dist.log_prob(a)
        value = critic(s)
        
        # Environment step
        s_prime, r, done, _ = env.step(a)
        
        # Store
        states.append(s)
        actions.append(a)
        rewards.append(r)
        log_probs.append(log_prob)
        values.append(value)
        
        s = s_prime
        if done:
            s = env.reset()
    
    # Compute returns and advantages
    returns = []
    advantages = []
    R = 0
    for r, v, done in zip(reversed(rewards), reversed(values), reversed(dones)):
        R = r + gamma * R * (1 - done)
        returns.insert(0, R)
        advantages.insert(0, R - v.detach())
    
    # Normalize advantages
    advantages = (advantages - advantages.mean()) / (advantages.std() + 1e-8)
    
    # Losses
    actor_loss = -(log_probs * advantages).mean()
    critic_loss = F.mse_loss(torch.stack(values), torch.tensor(returns))
    
    # Update
    (actor_loss + 0.5 * critic_loss).backward()
    # Gradient clipping
    torch.nn.utils.clip_grad_norm_(actor.parameters(), 0.5)
    torch.nn.utils.clip_grad_norm_(critic.parameters(), 0.5)
    optimizer.step()
    optimizer.zero_grad()
```

### Generalized Advantage Estimation (GAE)
$$\hat{A}_t = \sum_{l=0}^\infty (\gamma \lambda)^l \delta_{t+l}$$

where $\delta_t = r_t + \gamma V(s_{t+1}) - V(s_t)$ is the TD residual.

```python
def compute_gae(rewards, values, dones, gamma=0.99, lam=0.95):
    advantages = []
    gae = 0
    for t in reversed(range(len(rewards))):
        delta = rewards[t] + gamma * values[t+1] * (1 - dones[t]) - values[t]
        gae = delta + gamma * lam * gae * (1 - dones[t])
        advantages.insert(0, gae)
    returns = [adv + val for adv, val in zip(advantages, values[:-1])]
    return advantages, returns
```

---

## 4. Asynchronous Advantage Actor-Critic (A3C)

**Key Idea**: Run multiple agents in parallel on different environment instances, update shared global network asynchronously.

```python
import torch.multiprocessing as mp

class A3CWorker(mp.Process):
    def __init__(self, global_actor, global_critic, env_fn, worker_id):
        super().__init__()
        self.global_actor = global_actor
        self.global_critic = global_critic
        self.env = env_fn()
        self.worker_id = worker_id
        self.local_actor = copy.deepcopy(global_actor)
        self.local_critic = copy.deepcopy(global_critic)
    
    def run(self):
        while not done:
            # Sync with global
            self.local_actor.load_state_dict(self.global_actor.state_dict())
            self.local_critic.load_state_dict(self.global_critic.state_dict())
            
            # Rollout
            states, actions, rewards, log_probs, values, dones = [], [], [], [], [], []
            s = self.env.reset()
            
            for _ in range(n_steps):
                dist = self.local_actor(s)
                a = dist.sample()
                log_prob = dist.log_prob(a)
                value = self.local_critic(s)
                
                s_prime, r, done, _ = self.env.step(a)
                
                states.append(s)
                actions.append(a)
                rewards.append(r)
                log_probs.append(log_prob)
                values.append(value)
                dones.append(done)
                
                s = s_prime
                if done:
                    s = self.env.reset()
            
            # Compute GAE
            advantages, returns = compute_gae(rewards, values, dones)
            
            # Compute gradients locally
            actor_loss = -(torch.stack(log_probs) * advantages).mean()
            critic_loss = F.mse_loss(torch.stack(values), returns)
            loss = actor_loss + 0.5 * critic_loss
            
            loss.backward()
            
            # Push gradients to global
            for local_p, global_p in zip(self.local_actor.parameters(), self.global_actor.parameters()):
                global_p._grad = local_p.grad
            for local_p, global_p in zip(self.local_critic.parameters(), self.global_critic.parameters()):
                global_p._grad = local_p.grad
            
            # Global optimizer step (lock-free)
            global_optimizer.step()
            global_optimizer.zero_grad()
```

**Advantages**:
- No replay buffer needed (on-policy)
- Natural exploration from asynchronous updates
- Efficient CPU utilization

---

## 5. Proximal Policy Optimization (PPO)

### Motivation
Standard policy gradient can take too large steps → policy collapse. PPO constrains policy updates.

### Clipped Surrogate Objective
$$L^{CLIP}(\theta) = \mathbb{E}_t[\min(r_t(\theta) \hat{A}_t, \text{clip}(r_t(\theta), 1-\epsilon, 1+\epsilon) \hat{A}_t)]$$

where $r_t(\theta) = \frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_{old}}(a_t|s_t)}$

```python
def ppo_update(actor, critic, old_actor, states, actions, advantages, returns, old_log_probs, 
               clip_eps=0.2, epochs=4, batch_size=64):
    
    for _ in range(epochs):
        for batch in get_batches(states, actions, advantages, returns, old_log_probs, batch_size):
            s, a, adv, ret, old_lp = batch
            
            # Current policy
            dist = actor(s)
            log_prob = dist.log_prob(a)
            entropy = dist.entropy().mean()
            value = critic(s).squeeze()
            
            # Ratio
            ratio = torch.exp(log_prob - old_lp)
            
            # Clipped surrogate
            surr1 = ratio * adv
            surr2 = torch.clamp(ratio, 1-clip_eps, 1+clip_eps) * adv
            actor_loss = -torch.min(surr1, surr2).mean()
            
            # Value loss (clipped)
            value_loss = F.mse_loss(value, ret)
            # Optional: clipped value loss
            # value_pred_clipped = old_value + torch.clamp(value - old_value, -clip_eps, clip_eps)
            # value_loss = torch.max(F.mse_loss(value, ret), F.mse_loss(value_pred_clipped, ret)).mean()
            
            # Total loss
            loss = actor_loss + 0.5 * value_loss - 0.01 * entropy
            
            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(actor.parameters(), 0.5)
            torch.nn.utils.clip_grad_norm_(critic.parameters(), 0.5)
            optimizer.step()
```

### PPO Variants
| Variant | Description |
|---------|-------------|
| **PPO-Clip** | Clipped ratio (above) |
| **PPO-Penalty** | Adaptive KL penalty: $\beta \text{KL}(\pi_{old} \| \pi)$ |
| **PPO2** | Improved implementation (OpenAI baselines) |

### Key Hyperparameters
| Param | Typical | Notes |
|-------|---------|-------|
| **clip_eps** | 0.1-0.3 | Smaller = more conservative |
| **epochs** | 3-10 | More = better sample efficiency |
| **batch_size** | 64-4096 | Larger = stable gradients |
| **entropy_coef** | 0.01-0.1 | Encourages exploration |
| **gae_lambda** | 0.95-0.98 | Bias-variance tradeoff |
| **lr** | 1e-4 to 3e-4 | Adam optimizer |

---

## 5. Trust Region Policy Optimization (TRPO)

### Constrained Optimization
$$\max_\theta \mathbb{E}[\frac{\pi_\theta(a|s)}{\pi_{\theta_{old}}(a|s)} A(s,a)] \quad \text{s.t.} \quad \mathbb{E}[\text{KL}(\pi_{\theta_{old}} \| \pi_\theta)] \leq \delta$$

### Solution: Conjugate Gradient
```python
def trpo_update(policy, states, actions, advantages, old_log_probs, max_kl=0.01, damping=0.1):
    # 1. Compute policy gradient
    def get_loss(log_probs):
        return (torch.exp(log_probs - old_log_probs) * advantages).mean()
    
    loss = get_loss(policy.log_prob(states, actions))
    grads = torch.autograd.grad(loss, policy.parameters())
    flat_grad = torch.cat([g.view(-1) for g in grads])
    
    # 2. Compute Fisher-vector product (Hessian * vector)
    def fisher_vector_product(v):
        kl = policy.kl_divergence(states)
        grads_kl = torch.autograd.grad(kl, policy.parameters(), create_graph=True)
        flat_grad_kl = torch.cat([g.view(-1) for g in grads_kl])
        kl_v = (flat_grad_kl * v).sum()
        grads_kl_v = torch.autograd.grad(kl_v, policy.parameters())
        return torch.cat([g.view(-1) for g in grads_kl_v]) + damping * v
    
    # 3. Conjugate gradient to find step direction
    step_dir = conjugate_gradient(fisher_vector_product, flat_grad)
    
    # 4. Compute step size
    shs = 0.5 * step_dir @ fisher_vector_product(step_dir)
    step_size = torch.sqrt(2 * max_kl / shs)
    full_step = step_size * step_dir
    
    # 5. Line search (backtracking)
    for i in range(10):
        new_params = old_params + (0.5**i) * full_step
        set_params(policy, new_params)
        if policy.kl_divergence(states).mean() <= max_kl and get_loss(policy.log_prob(...)) > loss:
            break
```

**TRPO vs PPO**:
- TRPO: Theoretically guaranteed monotonic improvement, complex implementation
- PPO: Heuristic approximation, simpler, works well in practice

---

## 6. Soft Actor-Critic (SAC)

### Maximum Entropy RL
$$\pi^* = \arg\max_\pi \mathbb{E}[\sum_t \gamma^t (r_t + \alpha \mathcal{H}(\pi(\cdot|s_t)))]$$

where $\mathcal{H}$ is entropy, $\alpha$ is temperature.

### SAC Algorithm
```python
class SAC:
    def __init__(self, state_dim, action_dim, alpha=0.2):
        self.actor = GaussianPolicy(state_dim, action_dim)
        self.critic1 = QNetwork(state_dim, action_dim)
        self.critic2 = QNetwork(state_dim, action_dim)
        self.target_critic1 = copy.deepcopy(self.critic1)
        self.target_critic2 = copy.deepcopy(self.critic2)
        self.log_alpha = torch.nn.Parameter(torch.log(torch.tensor(alpha)))
        self.target_entropy = -action_dim
    
    def update(self, batch):
        s, a, r, s_prime, done = batch
        
        # 1. Update critics
        with torch.no_grad():
            # Next action from current policy
            a_prime, log_prob_prime = self.actor.sample(s_prime)
            target_q = r + gamma * (1 - done) * (
                torch.min(self.target_critic1(s_prime, a_prime), 
                          self.target_critic2(s_prime, a_prime)) 
                - self.alpha * log_prob_prime
            )
        
        q1 = self.critic1(s, a)
        q2 = self.critic2(s, a)
        critic_loss = F.mse_loss(q1, target_q) + F.mse_loss(q2, target_q)
        
        # 2. Update actor
        a_new, log_prob = self.actor.sample(s)
        q1_new = self.critic1(s, a_new)
        q2_new = self.critic2(s, a_new)
        actor_loss = (self.alpha * log_prob - torch.min(q1_new, q2_new)).mean()
        
        # 3. Update alpha (temperature)
        alpha_loss = -(self.log_alpha * (log_prob + self.target_entropy).detach()).mean()
        
        # Update networks...
        self.soft_update(self.target_critic1, self.critic1)
        self.soft_update(self.target_critic2, self.critic2)
```

**Key SAC Features**:
- Off-policy (replay buffer)
- Automatic entropy tuning
- Twin critics for overestimation bias
- Gaussian policy with reparameterization

---

## 7. Deterministic Policy Gradient (DDPG / TD3)

### DDPG
$$\nabla_\theta J(\theta) = \mathbb{E}[\nabla_a Q(s,a)|_{a=\mu(s)} \nabla_\theta \mu(s)]$$

```python
class DDPG:
    def update(self, batch):
        s, a, r, s_prime, done = batch
        
        # Critic update
        with torch.no_grad():
            a_prime = self.target_actor(s_prime)
            target_q = r + gamma * (1 - done) * self.target_critic(s_prime, a_prime)
        
        critic_loss = F.mse_loss(self.critic(s, a), target_q)
        
        # Actor update (deterministic policy gradient)
        actor_loss = -self.critic(s, self.actor(s)).mean()
```

### TD3 (Twin Delayed DDPG) - Improvements
1. **Twin Critics**: Two critics, take minimum
2. **Delayed Policy Updates**: Update actor every 2 critic updates
3. **Target Policy Smoothing**: Add noise to target action

```python
class TD3:
    def update(self, batch):
        s, a, r, s_prime, done = batch
        
        with torch.no_grad():
            # Target policy smoothing
            noise = (torch.randn_like(a) * 0.2).clamp(-0.5, 0.5)
            a_prime = (self.target_actor(s_prime) + noise).clamp(-1, 1)
            
            target_q = r + gamma * (1 - done) * torch.min(
                self.target_critic1(s_prime, a_prime),
                self.target_critic2(s_prime, a_prime)
            )
        
        # Critic updates
        critic_loss = F.mse_loss(self.critic1(s, a), target_q) + \
                      F.mse_loss(self.critic2(s, a), target_q)
        
        # Delayed actor update
        if step % 2 == 0:
            actor_loss = -self.critic1(s, self.actor(s)).mean()
            # Update target networks with polyak averaging
            soft_update(self.target_actor, self.actor, tau=0.005)
```

---

## 8. Continuous vs Discrete Actions

| Aspect | Discrete (DQN, PPO) | Continuous (SAC, TD3, PPO) |
|--------|---------------------|----------------------------|
| **Policy** | Categorical (Softmax) | Gaussian / Tanh-Normal |
| **Exploration** | $\epsilon$-greedy | Noise injection / Entropy |
| **Policy Gradient** | $\nabla \log \pi(a|s) Q$ | Reparameterization trick |
| **Critic Input** | State only | State + Action |

### Gaussian Policy (Reparameterization)
```python
class GaussianPolicy(nn.Module):
    def forward(self, state):
        mean = self.mean_net(state)
        log_std = self.log_std_net(state).clamp(-20, 2)
        return mean, log_std
    
    def sample(self, state):
        mean, log_std = self.forward(state)
        std = log_std.exp()
        normal = torch.distributions.Normal(mean, std)
        x_t = normal.rsample()  # Reparameterization
        action = torch.tanh(x_t)
        log_prob = normal.log_prob(x_t) - torch.log(1 - action.pow(2) + 1e-6)
        return action, log_prob.sum(-1, keepdim=True)
```

---

## 9. Multi-Objective / Multi-Task Policy Gradient

### Multi-Objective (Linear Scalarization)
$$R = \sum_i w_i R_i$$

### Multi-Task (Contextual Policy)
$$\pi(a|s, z) \quad \text{where } z \text{ is task embedding}$$

### Hindsight Experience Replay (HER)
For sparse reward goal-conditioned tasks:
```python
def her_replay(buffer, trajectory, goal):
    for t, (s, a, r, s_prime) in enumerate(trajectory):
        # Original transition
        buffer.add(s, a, r, s_prime, goal)
        
        # Hindsight: relabel with achieved goal
        achieved_goal = s_prime['achieved_goal']
        r_hindsight = compute_reward(achieved_goal, achieved_goal)  # = 0 (success)
        buffer.add(s, a, r_hindsight, s_prime, achieved_goal)
```

---

## 10. Implementation Tips & Tricks

### Gradient Clipping
```python
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=0.5)
# or clip_grad_value_(model.parameters(), clip_value=1.0)
```

### Learning Rate Scheduling
```python
# Linear decay
scheduler = torch.optim.lr_scheduler.LinearLR(optimizer, start_factor=1.0, end_factor=0.01, total_iters=total_steps)

# Cosine annealing
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=total_steps)

# Cosine with warmup
def get_cosine_schedule_with_warmup(optimizer, num_warmup_steps, num_training_steps):
    def lr_lambda(step):
        if step < num_warmup_steps:
            return float(step) / float(max(1, num_warmup_steps))
        progress = float(step - num_warmup_steps) / float(max(1, num_training_steps - num_warmup_steps))
        return max(0.0, 0.5 * (1.0 + math.cos(math.pi * progress)))
    return torch.optim.lr_scheduler.LambdaLR(optimizer, lr_lambda)
```

### Observation Normalization
```python
class RunningMeanStd:
    def __init__(self, shape):
        self.mean = np.zeros(shape)
        self.var = np.ones(shape)
        self.count = 1e-4
    
    def update(self, x):
        batch_mean = np.mean(x, axis=0)
        batch_var = np.var(x, axis=0)
        batch_count = x.shape[0]
        self.update_from_moments(batch_mean, batch_var, batch_count)
    
    def normalize(self, x):
        return (x - self.mean) / np.sqrt(self.var + 1e-8)
```

### Reward Scaling
```python
# Normalize rewards to ~[-1, 1] range
reward_scale = 1.0 / (reward_std + 1e-8)
```

---

## 11. Algorithm Selection Guide

| Scenario | Recommended Algorithm |
|----------|----------------------|
| **Discrete actions, simple** | PPO / A2C |
| **Discrete, sample efficient** | Rainbow DQN |
| **Continuous, off-policy** | SAC (default), TD3 |
| **Continuous, on-policy** | PPO |
| **High-dim continuous, real-time** | TD3 |
| **Multi-task / Meta-RL** | PEARL, MAML |
| **Sparse reward, goal-based** | SAC + HER |
| **Safety-critical** | CPO, TRPO with constraints |
| **Distributed training** | A3C / IMPALA |

---

## 12. Key Takeaways

1. **Policy Gradient Theorem** provides unbiased gradient estimate without differentiating through environment
2. **REINFORCE** is high variance; **Actor-Critic** adds critic as baseline
3. **A2C/A3C**: Synchronous/asynchronous actor-critic with advantage estimation
4. **GAE**: $\lambda$-weighted blend of TD residuals for better bias-variance tradeoff
5. **PPO**: Clipped surrogate objective — simple, effective, default choice for most tasks
6. **TRPO**: Constrained optimization with KL constraint — theoretically sound but complex
7. **SAC**: Off-policy, maximum entropy, automatic temperature — best for continuous control
8. **TD3**: Improved DDPG with twin critics, delayed updates, target smoothing
9. **Entropy regularization** crucial for exploration and preventing premature convergence
10. **Implementation details matter**: gradient clipping, LR scheduling, observation normalization, reward scaling