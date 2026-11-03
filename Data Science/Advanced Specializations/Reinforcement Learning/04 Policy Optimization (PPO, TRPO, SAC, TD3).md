# Policy Optimization: PPO, TRPO, SAC, TD3

Advanced policy optimization algorithms for continuous and discrete control. These are the workhorses of modern deep RL.

## 1. Proximal Policy Optimization (PPO)

### Why PPO?
- **Trust Region Methods** (TRPO) guarantee monotonic improvement but are complex
- **PPO** uses a clipped surrogate objective → simpler, works as well or better
- **On-policy** but sample-efficient with multiple epochs
- **Default choice** for most RL tasks (OpenAI, DeepMind standard)

### Clipped Surrogate Objective

$$L^{CLIP}(\theta) = \mathbb{E}_t \left[ \min \left( r_t(\theta) \hat{A}_t, \text{clip}(r_t(\theta), 1-\epsilon, 1+\epsilon) \hat{A}_t \right) \right]$$

where $r_t(\theta) = \frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_{old}}(a_t|s_t)}$

```python
def ppo_loss(actor, old_actor, states, actions, advantages, clip_eps=0.2):
    # Current policy
    dist = actor(states)
    log_probs = dist.log_prob(actions)
    entropy = dist.entropy().mean()
    
    # Old policy (frozen)
    with torch.no_grad():
        old_log_probs = old_actor(states).log_prob(actions)
    
    # Ratio
    ratio = torch.exp(log_probs - old_log_probs)
    
    # Clipped surrogate
    surr1 = ratio * advantages
    surr2 = torch.clamp(ratio, 1 - clip_eps, 1 + clip_eps) * advantages
    
    # Actor loss (negative because we maximize)
    actor_loss = -torch.min(surr1, surr2).mean()
    
    # Entropy bonus
    loss = actor_loss - entropy_coef * entropy
    
    return loss, ratio
```

### Value Function Clipping (Optional)
```python
def clipped_value_loss(value, old_value, returns, clip_eps=0.2):
    value_pred_clipped = old_value + torch.clamp(value - old_value, -clip_eps, clip_eps)
    loss1 = F.mse_loss(value, returns)
    loss2 = F.mse_loss(value_pred_clipped, returns)
    return torch.max(loss1, loss2).mean()
```

### Complete PPO Implementation
```python
class PPO:
    def __init__(self, actor, critic, lr=3e-4, clip_eps=0.2, epochs=10, 
                 batch_size=64, gamma=0.99, gae_lambda=0.95, 
                 entropy_coef=0.01, value_coef=0.5, max_grad_norm=0.5):
        self.actor = actor
        self.critic = critic
        self.clip_eps = clip_eps
        self.epochs = epochs
        self.batch_size = batch_size
        self.gamma = gamma
        self.gae_lambda = gae_lambda
        self.entropy_coef = entropy_coef
        self.value_coef = value_coef
        self.max_grad_norm = max_grad_norm
        
        self.optimizer = torch.optim.Adam(
            list(actor.parameters()) + list(critic.parameters()), lr=lr
        )
    
    def compute_gae(self, rewards, values, dones):
        advantages = []
        gae = 0
        for t in reversed(range(len(rewards))):
            delta = rewards[t] + self.gamma * values[t+1] * (1 - dones[t]) - values[t]
            gae = delta + self.gamma * self.gae_lambda * gae * (1 - dones[t])
            advantages.insert(0, gae)
        returns = [adv + val for adv, val in zip(advantages, values[:-1])]
        return torch.tensor(advantages), torch.tensor(returns)
    
    def update(self, rollout_buffer):
        states, actions, rewards, values, log_probs, dones = rollout_buffer.get()
        
        # Compute GAE
        advantages, returns = self.compute_gae(rewards, values, rollout_buffer.dones)
        advantages = (advantages - advantages.mean()) / (advantages.std() + 1e-8)
        
        # Convert to tensors
        states = torch.stack(states)
        actions = torch.stack(actions)
        old_log_probs = torch.stack(log_probs).detach()
        old_values = torch.stack(values[:-1]).detach()
        
        # PPO Epochs
        for epoch in range(self.epochs):
            for batch in self.get_batches(states, actions, old_log_probs, 
                                          advantages, returns, old_values):
                s, a, old_lp, adv, ret, old_v = batch
                
                # Actor forward
                dist = self.actor(s)
                new_log_probs = dist.log_prob(a)
                entropy = dist.entropy().mean()
                
                # Ratio
                ratio = torch.exp(new_log_probs - old_lp)
                
                # Clipped surrogate
                surr1 = ratio * adv
                surr2 = torch.clamp(ratio, 1 - self.clip_eps, 1 + self.clip_eps) * adv
                actor_loss = -torch.min(surr1, surr2).mean()
                
                # Critic
                new_values = self.critic(s).squeeze()
                # Clipped value loss
                value_pred_clipped = old_v + torch.clamp(
                    new_values - old_v, -self.clip_eps, self.clip_eps
                )
                value_loss = torch.max(
                    F.mse_loss(new_values, ret),
                    F.mse_loss(value_pred_clipped, ret)
                ).mean()
                
                # Total loss
                loss = actor_loss + self.value_coef * value_loss - 0.01 * entropy
                
                self.optimizer.zero_grad()
                loss.backward()
                torch.nn.utils.clip_grad_norm_(
                    list(self.actor.parameters()) + list(self.critic.parameters()), 
                    0.5
                )
                self.optimizer.step()
```

### PPO Hyperparameters (Best Practices)
| Parameter | Default | Range | Notes |
|-----------|---------|-------|-------|
| **clip_eps** | 0.2 | 0.1-0.3 | Smaller = more conservative |
| **epochs** | 10 | 3-15 | More = better sample efficiency |
| **batch_size** | 64-2048 | 64-4096 | Larger = stable gradients |
| **gae_lambda** | 0.95 | 0.9-0.98 | Bias-variance tradeoff |
| **entropy_coef** | 0.01 | 0.001-0.1 | Encourages exploration |
| **value_coef** | 0.5 | 0.1-1.0 | Value loss weight |
| **lr** | 3e-4 | 1e-4 - 1e-3 | Adam optimizer |
| **max_grad_norm** | 0.5 | 0.5-1.0 | Gradient clipping |
| **n_steps** | 2048 | 1024-8192 | Rollout length per update |

---

## 2. Trust Region Policy Optimization (TRPO)

### Constrained Optimization Formulation
$$\max_\theta \mathbb{E}_t \left[ \frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_{old}}(a_t|s_t)} \hat{A}_t \right]$$
$$\text{s.t. } \mathbb{E}_t \left[ \text{KL}(\pi_{\theta_{old}}(\cdot|s_t) \| \pi_\theta(\cdot|s_t)) \right] \leq \delta$$

### Solution: Conjugate Gradient + Line Search
```python
def trpo_step(policy, states, actions, advantages, old_log_probs, max_kl=0.01, damping=0.1):
    # 1. Policy gradient
    def get_surrogate_loss():
        dist = policy(states)
        log_probs = dist.log_prob(actions)
        ratio = torch.exp(log_probs - old_log_probs)
        return (ratio * advantages).mean()
    
    loss = get_surrogate_loss()
    grads = torch.autograd.grad(loss, policy.parameters())
    flat_grad = torch.cat([g.view(-1) for g in grads])
    
    # 2. Fisher-vector product (Hessian-vector product)
    def fisher_vector_product(v):
        kl = policy.kl_divergence(states)
        grads_kl = torch.autograd.grad(kl, policy.parameters(), create_graph=True)
        flat_grad_kl = torch.cat([g.view(-1) for g in grads_kl])
        kl_v = (flat_grad_kl * v).sum()
        grads_kl_v = torch.autograd.grad(kl_v, policy.parameters())
        return torch.cat([g.view(-1) for g in grads_kl_v]) + damping * v
    
    # 3. Conjugate gradient
    step_dir = conjugate_gradient(fisher_vector_product, flat_grad)
    
    # 4. Step size
    shs = 0.5 * step_dir @ fisher_vector_product(step_dir)
    step_size = torch.sqrt(2 * max_kl / shs)
    full_step = step_size * step_dir
    
    # 5. Line search (backtracking)
    old_params = get_flat_params(policy)
    for i in range(10):
        step_frac = 0.5 ** i
        new_params = old_params + step_frac * full_step
        set_flat_params(policy, new_params)
        
        # Check KL constraint
        kl = policy.kl_divergence(states).mean()
        new_loss = get_surrogate_loss()
        
        if kl <= max_kl and new_loss > loss:
            break
    
    return policy
```

### Conjugate Gradient
```python
def conjugate_gradient(Avp, b, n_steps=10, residual_tol=1e-10):
    x = torch.zeros_like(b)
    r = b.clone()
    p = b.clone()
    rdotr = r.dot(r)
    
    for _ in range(n_steps):
        Avp_val = Avp(p)
        alpha = rdotr / (p.dot(Avp_val) + 1e-8)
        x += alpha * p
        r -= alpha * Avp_val
        new_rdotr = r.dot(r)
        if new_rdotr < residual_tol:
            break
        beta = new_rdotr / rdotr
        p = r + beta * p
        rdotr = new_rdotr
    
    return x
```

---

## 3. Soft Actor-Critic (SAC)

### Maximum Entropy RL Objective
$$\pi^* = \arg\max_\pi \mathbb{E} \left[ \sum_t \gamma^t \left( r(s_t, a_t) + \alpha \mathcal{H}(\pi(\cdot|s_t)) \right) \right]$$

where $\mathcal{H}(\pi) = -\mathbb{E}[\log \pi(a|s)]$ is entropy.

### SAC Components
1. **Actor**: Gaussian policy with reparameterization
2. **Twin Critics**: Two Q-networks for overestimation bias reduction
3. **Target Networks**: Polyak averaging for stability
4. **Automatic Entropy Tuning**: Learn $\alpha$

### SAC Implementation
```python
class SAC:
    def __init__(self, state_dim, action_dim, hidden_dim=256, 
                 lr=3e-4, gamma=0.99, tau=0.005, alpha=0.2, 
                 target_entropy=None):
        
        # Actor (Gaussian Policy)
        self.actor = GaussianPolicy(state_dim, action_dim, hidden_dim)
        
        # Twin Critics
        self.critic1 = QNetwork(state_dim, action_dim, hidden_dim)
        self.critic2 = QNetwork(state_dim, action_dim, hidden_dim)
        
        # Target Critics
        self.target_critic1 = copy.deepcopy(self.critic1)
        self.target_critic2 = copy.deepcopy(self.critic2)
        
        # Entropy temperature
        self.log_alpha = torch.nn.Parameter(torch.log(torch.tensor(alpha)))
        self.target_entropy = target_entropy or -action_dim
        
        # Optimizers
        self.actor_opt = torch.optim.Adam(self.actor.parameters(), lr=lr)
        self.critic_opt = torch.optim.Adam(
            list(self.critic1.parameters()) + list(self.critic2.parameters()), lr=lr
        )
        self.alpha_opt = torch.optim.Adam([self.log_alpha], lr=lr)
        
        self.tau = tau
        self.gamma = gamma
    
    @property
    def alpha(self):
        return self.log_alpha.exp()
    
    def select_action(self, state, deterministic=False):
        with torch.no_grad():
            state = torch.FloatTensor(state).unsqueeze(0)
            action, _ = self.actor.sample(state, deterministic)
        return action.cpu().numpy()[0]
    
    def update(self, batch, batch_size=256):
        state, action, reward, next_state, done = batch
        
        # 1. Update Critics
        with torch.no_grad():
            next_action, next_log_prob = self.actor.sample(next_state)
            target_q1 = self.target_critic1(next_state, next_action)
            target_q2 = self.target_critic2(next_state, next_action)
            target_q = torch.min(target_q1, target_q2)
            target_value = target_q - self.alpha * next_log_prob
            target_q = reward + (1 - done) * self.gamma * target_value
        
        q1 = self.critic1(state, action)
        q2 = self.critic2(state, action)
        critic_loss = F.mse_loss(q1, target_q) + F.mse_loss(q2, target_q)
        
        self.critic_opt.zero_grad()
        critic_loss.backward()
        self.critic_opt.step()
        
        # 2. Update Actor
        new_action, log_prob = self.actor.sample(state)
        q1_new = self.critic1(state, new_action)
        q2_new = self.critic2(state, new_action)
        q_new = torch.min(q1_new, q2_new)
        
        actor_loss = (self.alpha * log_prob - q_new).mean()
        
        self.actor_opt.zero_grad()
        actor_loss.backward()
        self.actor_opt.step()
        
        # 3. Update Alpha (Temperature)
        alpha_loss = -(self.log_alpha * (log_prob + self.target_entropy).detach()).mean()
        
        self.alpha_opt.zero_grad()
        alpha_loss.backward()
        self.alpha_opt.step()
        
        # 4. Soft Update Target Networks
        self.soft_update(self.target_critic1, self.critic1)
        self.soft_update(self.target_critic2, self.critic2)
        
        return {
            'critic_loss': critic_loss.item(),
            'actor_loss': actor_loss.item(),
            'alpha_loss': alpha_loss.item(),
            'alpha': self.alpha.item()
        }
    
    def soft_update(self, target, source):
        for tp, sp in zip(target.parameters(), source.parameters()):
            tp.data.copy_(self.tau * sp.data + (1 - self.tau) * tp.data)
```

### Gaussian Policy with Reparameterization
```python
class GaussianPolicy(nn.Module):
    def __init__(self, state_dim, action_dim, hidden_dim=256, log_std_bounds=(-20, 2)):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, hidden_dim), nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim), nn.ReLU(),
        )
        self.mean = nn.Linear(hidden_dim, action_dim)
        self.log_std = nn.Linear(hidden_dim, action_dim)
        self.log_std_bounds = log_std_bounds
    
    def forward(self, state):
        x = self.net(state)
        mean = self.mean(x)
        log_std = self.log_std(x).clamp(*self.log_std_bounds)
        return mean, log_std
    
    def sample(self, state, deterministic=False):
        mean, log_std = self.forward(state)
        std = log_std.exp()
        
        if deterministic:
            return torch.tanh(mean), torch.zeros_like(mean)
        
        normal = torch.distributions.Normal(mean, std)
        x_t = normal.rsample()  # Reparameterization trick
        action = torch.tanh(x_t)
        
        # Log prob correction for tanh squashing
        log_prob = normal.log_prob(x_t) - torch.log(1 - action.pow(2) + 1e-6)
        log_prob = log_prob.sum(-1, keepdim=True)
        
        return action, log_prob
```

---

## 4. Twin Delayed DDPG (TD3)

### DDPG Background
- Deterministic policy: $\mu(s)$
- Deterministic policy gradient: $\nabla_\theta J = \mathbb{E}[\nabla_a Q(s,a)|_{a=\mu(s)} \nabla_\theta \mu(s)]$
- Issues: Overestimation, brittle, sensitive to hyperparameters

### TD3 Improvements
1. **Twin Critics**: Two Q-networks, take minimum
2. **Delayed Policy Updates**: Update actor every 2 critic updates
3. **Target Policy Smoothing**: Add noise to target action

```python
class TD3:
    def __init__(self, state_dim, action_dim, hidden_dim=256, 
                 lr=3e-4, gamma=0.99, tau=0.005, policy_noise=0.2, 
                 noise_clip=0.5, policy_freq=2):
        
        self.actor = DeterministicPolicy(state_dim, action_dim, hidden_dim)
        self.critic1 = QNetwork(state_dim, action_dim, hidden_dim)
        self.critic2 = QNetwork(state_dim, action_dim, hidden_dim)
        self.target_actor = copy.deepcopy(self.actor)
        self.target_critic1 = copy.deepcopy(self.critic1)
        self.target_critic2 = copy.deepcopy(self.critic2)
        
        self.policy_noise = policy_noise
        self.noise_clip = noise_clip
        self.policy_freq = policy_freq
        self.gamma = 0.99
        self.tau = 0.005
        
        self.actor_opt = torch.optim.Adam(self.actor.parameters(), lr=lr)
        self.critic_opt = torch.optim.Adam(
            list(self.critic1.parameters()) + list(self.critic2.parameters()), lr=lr
        )
    
    def select_action(self, state, noise=0.1):
        with torch.no_grad():
            state = torch.FloatTensor(state).unsqueeze(0)
            action = self.actor(state).cpu().numpy()[0]
        return (action + np.random.normal(0, noise, size=action.shape)).clip(-1, 1)
    
    def update(self, batch, step):
        state, action, reward, next_state, done = batch
        
        with torch.no_grad():
            # Target Policy Smoothing
            noise = (torch.randn_like(action) * self.policy_noise).clamp(
                -self.noise_clip, self.noise_clip
            )
            next_action = (self.target_actor(next_state) + noise).clamp(-1, 1)
            
            # Twin Critics - take minimum
            target_q1 = self.target_critic1(next_state, next_action)
            target_q2 = self.target_critic2(next_state, next_action)
            target_q = torch.min(target_q1, target_q2)
            
            target_q = reward + (1 - done) * self.gamma * target_q
        
        # Critic Updates
        current_q1 = self.critic1(state, action)
        current_q2 = self.critic2(state, action)
        critic_loss = F.mse_loss(current_q1, target_q) + F.mse_loss(current_q2, target_q)
        
        self.critic_opt.zero_grad()
        critic_loss.backward()
        self.critic_opt.step()
        
        # Delayed Actor Update
        if step % self.policy_freq == 0:
            actor_loss = -self.critic1(state, self.actor(state)).mean()
            
            self.actor_opt.zero_grad()
            actor_loss.backward()
            self.actor_opt.step()
            
            # Soft Update Target Networks
            self.soft_update(self.target_actor, self.actor)
            self.soft_update(self.target_critic1, self.critic1)
            self.soft_update(self.target_critic2, self.critic2)
        
        return {'critic_loss': critic_loss.item()}
    
    def soft_update(self, target, source):
        for tp, sp in zip(target.parameters(), source.parameters()):
            tp.data.copy_(self.tau * sp.data + (1 - self.tau) * tp.data)
```

### Deterministic Policy
```python
class DeterministicPolicy(nn.Module):
    def __init__(self, state_dim, action_dim, hidden_dim=256):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, hidden_dim), nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim), nn.ReLU(),
            nn.Linear(hidden_dim, action_dim),
            nn.Tanh()  # Actions in [-1, 1]
        )
    
    def forward(self, state):
        return self.net(state)
```

---

## 4. Algorithm Comparison & Selection

| Algorithm | Type | Action Space | Sample Eff. | Stability | Best For |
|-----------|------|--------------|-------------|-----------|----------|
| **PPO** | On-policy | Both | Medium | High | General purpose, default choice |
| **TRPO** | On-policy | Both | Medium | Very High | Safety-critical, monotonic guarantee |
| **SAC** | Off-policy | Continuous | High | High | Continuous control, sample efficiency |
| **TD3** | Off-policy | Continuous | High | Medium | Continuous control, simpler than SAC |
| **DDPG** | Off-policy | Continuous | High | Low | Baseline (use TD3 instead) |
| **DQN/Rainbow** | Off-policy | Discrete | High | High | Discrete action spaces |

### Sample Efficiency (Env steps to convergence)
```
Continuous Control (MuJoCo):
SAC ≈ TD3 > PPO > TRPO >> DDPG

Discrete Control (Atari):
Rainbow > PPO > A2C > DQN
```

---

## 5. Practical Implementation Tips

### 1. Observation/Action Normalization
```python
class NormalizedEnv(gym.Wrapper):
    def __init__(self, env):
        super().__init__(env)
        self.obs_rms = RunningMeanStd(env.observation_space.shape)
        self.ret_rms = RunningMeanStd()
        self.clip_obs = 10.0
        self.clip_reward = 10.0
    
    def step(self, action):
        obs, reward, done, info = self.env.step(action)
        obs = self.normalize_obs(obs)
        reward = self.normalize_reward(reward)
        return obs, reward, done, info
    
    def normalize_obs(self, obs):
        self.obs_rms.update(obs)
        return np.clip((obs - self.obs_rms.mean) / np.sqrt(self.obs_rms.var + 1e-8), 
                       -self.clip_obs, self.clip_obs)
```

### 2. Reward Scaling
```python
# Scale rewards to ~[-1, 1] for stable training
reward_scale = 1.0 / (reward_std + 1e-8)
```

### 3. Gradient Clipping
```python
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=0.5)
# or
torch.nn.utils.clip_grad_value_(model.parameters(), clip_value=1.0)
```

### 4. Learning Rate Scheduling
```python
# Cosine annealing with warmup
scheduler = get_cosine_schedule_with_warmup(
    optimizer, num_warmup_steps=1000, num_training_steps=total_steps
)
```

### 5. Evaluation Protocol
```python
def evaluate_policy(policy, env, n_episodes=10, deterministic=True):
    rewards = []
    for _ in range(n_episodes):
        state = env.reset()
        total_reward = 0
        done = False
        while not done:
            action = policy.select_action(state, deterministic=deterministic)
            state, reward, done, _ = env.step(action)
            total_reward += reward
        rewards.append(total_reward)
    return np.mean(rewards), np.std(rewards)
```

---

## 6. Distributed Training

### IMPALA (Importance Weighted Actor-Learner Architecture)
```python
# Asynchronous actors, centralized learner with V-trace correction
def vtrace_loss(log_probs, target_log_probs, rewards, values, gamma=0.99, rho_bar=1.0, c_bar=1.0):
    # V-trace off-policy correction for distributed actors
    rhos = torch.exp(target_log_probs - log_probs).clamp(max=rho_bar)
    cs = torch.exp(target_log_probs - log_probs).clamp(max=c_bar)
    
    vs = values.clone()
    for t in reversed(range(len(rewards))):
        delta = rewards[t] + gamma * values[t+1] - values[t]
        vs[t] = values[t] + rhos[t] * (delta + gamma * cs[t] * (vs[t+1] - values[t+1]))
    
    return vs
```

### Ape-X (Distributed Prioritized DQN)
```python
# Many actors with prioritized replay, centralized learner
# Actors send (s, a, r, s', done, priority) to central buffer
# Learner samples from buffer, updates priorities
```

---

## 7. Hyperparameter Tuning

### Population Based Training (PBT)
```python
# Run multiple trials, periodically exploit/explore
def pbt_step(population, perturb_factors=[0.8, 1.2]):
    # Rank by performance
    population.sort(key=lambda x: x['score'], reverse=True)
    
    # Bottom half: copy top half + perturb
    for i in range(len(population)//2, len(population)):
        donor = population[i - len(population)//2]
        population[i]['config'] = {
            k: v * random.choice(perturb_factors) if isinstance(v, float) else v
            for k, v in donor['config'].items()
        }
        population[i]['model'] = copy.deepcopy(donor['model'])
```

### Optuna / Ray Tune Integration
```python
import optuna

def objective(trial):
    config = {
        'lr': trial.suggest_loguniform('lr', 1e-5, 1e-3),
        'gamma': trial.suggest_uniform('gamma', 0.9, 0.999),
        'clip_eps': trial.suggest_uniform('clip_eps', 0.1, 0.3),
        'entropy_coef': trial.suggest_loguniform('entropy_coef', 1e-4, 0.1),
    }
    score = train_and_evaluate(config)
    return score

study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=100)
```

---

## 7. Key Takeaways

1. **PPO** is the default choice: simple, stable, works across tasks
2. **TRPO** provides theoretical guarantees but is complex; use PPO instead
3. **SAC** is best for continuous control: off-policy, max entropy, auto temp
4. **TD3** is improved DDPG: twin critics, delayed updates, target smoothing
5. **On-policy** (PPO, TRPO) needs fresh samples each update; **Off-policy** (SAC, TD3) uses replay buffer
6. **Entropy regularization** is crucial for exploration and preventing premature convergence
7. **Clipping** (PPO) and **KL constraints** (TRPO) prevent destructive policy updates
7. **Twin critics** reduce overestimation bias (TD3, SAC)
8. **Target networks + Polyak averaging** stabilize training
9. **Implementation details matter**: normalization, gradient clipping, LR scheduling, reward scaling
10. **Evaluation**: Always evaluate with deterministic policy, multiple seeds, proper baselines