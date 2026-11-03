# Deep Value-Based Reinforcement Learning

Deep Q-Learning and its modern variants for discrete action spaces. These methods approximate the action-value function $Q(s,a)$ with deep neural networks.

## 1. Deep Q-Network (DQN)

### Original DQN (Mnih et al., 2015)
```python
class DQN(nn.Module):
    def __init__(self, input_shape, n_actions):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(input_shape[0], 32, kernel_size=8, stride=4),
            nn.ReLU(),
            nn.Conv2d(32, 64, kernel_size=4, stride=2),
            nn.ReLU(),
            nn.Conv2d(64, 64, kernel_size=3, stride=1),
            nn.ReLU(),
        )
        self.fc = nn.Sequential(
            nn.Linear(self._get_conv_out(input_shape), 512),
            nn.ReLU(),
            nn.Linear(512, n_actions),
        )
    
    def forward(self, x):
        x = self.conv(x.float() / 255.0)
        x = x.view(x.size(0), -1)
        return self.fc(x)
```

### DQN Loss
$$\mathcal{L}(\theta) = \mathbb{E}_{(s,a,r,s') \sim \mathcal{D}} \left[ \left( r + \gamma \max_{a'} Q(s', a'; \theta^-) - Q(s, a; \theta) \right)^2 \right]$$

### Key Innovations
1. **Experience Replay** $\mathcal{D}$: Breaks correlation, enables off-policy learning
2. **Target Network** $\theta^-$: Frozen copy of $\theta$, updated periodically → stable targets
3. **Frame Stacking**: 4 frames → captures temporal information (velocity)
4. **Reward Clipping**: $r \leftarrow \text{clip}(r, -1, 1)$ for stability

### DQN Training Loop
```python
def train_dqn(env, q_net, target_net, replay_buffer, optimizer, gamma=0.99, 
              batch_size=32, target_update_freq=1000):
    
    for step in range(total_steps):
        # Epsilon-greedy action
        if random.random() < epsilon:
            action = env.action_space.sample()
        else:
            with torch.no_grad():
                action = q_net(state).argmax().item()
        
        # Environment step
        next_state, reward, done, _ = env.step(action)
        reward = np.clip(reward, -1, 1)
        
        # Store transition
        replay_buffer.add(state, action, reward, next_state, done)
        state = next_state
        
        # Train
        if len(replay_buffer) >= batch_size:
            batch = replay_buffer.sample(batch_size)
            s, a, r, s_prime, done = batch
            
            # Current Q
            q_values = q_net(s).gather(1, a.unsqueeze(1)).squeeze()
            
            # Target Q (Double DQN uses online net for action selection)
            with torch.no_grad():
                next_q = target_net(s_prime).max(1)[0]
                target = r + gamma * next_q * (1 - done)
            
            loss = F.mse_loss(q_values, target)
            
            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(q_net.parameters(), 10)
            optimizer.step()
        
        # Update target network
        if step % target_update_freq == 0:
            target_net.load_state_dict(q_net.state_dict())
```

---

## 2. DQN Improvements (Rainbow Components)

### 2.1 Double DQN (van Hasselt et al., 2016)
**Problem**: DQN overestimates Q-values due to $\max$ operator.
**Solution**: Decouple action selection from evaluation.

```python
# Double DQN
with torch.no_grad():
    # Online network selects action
    next_actions = q_net(s_prime).argmax(1, keepdim=True)
    # Target network evaluates
    next_q = target_net(s_prime).gather(1, next_actions).squeeze()
    target = r + gamma * next_q * (1 - done)
```

### 2.2 Dueling DQN (Wang et al., 2016)
**Idea**: Separate state value $V(s)$ and advantage $A(s,a)$.
$$Q(s,a) = V(s) + A(s,a) - \frac{1}{|A|} \sum_{a'} A(s,a')$$

```python
class DuelingDQN(nn.Module):
    def __init__(self, input_shape, n_actions):
        super().__init__()
        self.conv = ...  # Same as DQN
        
        # Value stream
        self.value_fc = nn.Sequential(
            nn.Linear(conv_out, 512), nn.ReLU(), nn.Linear(512, 1)
        )
        # Advantage stream
        self.adv_fc = nn.Sequential(
            nn.Linear(conv_out, 512), nn.ReLU(), nn.Linear(512, n_actions)
        )
    
    def forward(self, x):
        x = self.conv(x)
        x = x.view(x.size(0), -1)
        v = self.value_fc(x)
        a = self.adv_fc(x)
        # Combine: Q = V + A - mean(A)
        return v + a - a.mean(1, keepdim=True)
```

### 2.3 Prioritized Experience Replay (Schaul et al., 2016)
**Idea**: Sample important transitions more frequently.

```python
class PrioritizedReplayBuffer:
    def __init__(self, capacity, alpha=0.6, beta=0.4, beta_increment=1e-5):
        self.capacity = capacity
        self.alpha = alpha  # Prioritization exponent
        self.beta = beta    # Importance sampling exponent
        self.beta_increment = beta_increment
        self.buffer = []
        self.priorities = np.zeros(capacity, dtype=np.float32)
        self.pos = 0
    
    def add(self, transition, error=None):
        priority = (abs(error) + 1e-6) ** self.alpha if error else self.max_priority()
        if len(self.buffer) < self.capacity:
            self.buffer.append(transition)
        else:
            self.buffer[self.pos] = transition
        self.priorities[self.pos] = priority
        self.pos = (self.pos + 1) % self.capacity
    
    def sample(self, batch_size):
        # Sample proportional to priority^alpha
        probs = self.priorities[:len(self.buffer)] ** self.alpha
        probs /= probs.sum()
        indices = np.random.choice(len(self.buffer), batch_size, p=probs)
        
        # Importance sampling weights
        weights = (len(self.buffer) * probs[indices]) ** (-self.beta)
        weights /= weights.max()
        self.beta = min(1.0, self.beta + self.beta_increment)
        
        samples = [self.buffer[i] for i in indices]
        return samples, indices, weights
    
    def update_priorities(self, indices, errors):
        for idx, error in zip(indices, errors):
            self.priorities[idx] = (abs(error) + 1e-6) ** self.alpha
```

### 2.4 Noisy Networks (Fortunato et al., 2017)
**Idea**: Parameter noise for exploration instead of $\epsilon$-greedy.

```python
class NoisyLinear(nn.Module):
    def __init__(self, in_features, out_features, std_init=0.5):
        super().__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.std_init = std_init
        
        self.weight_mu = nn.Parameter(torch.empty(out_features, in_features))
        self.weight_sigma = nn.Parameter(torch.empty(out_features, in_features))
        self.register_buffer('weight_epsilon', torch.empty(out_features, in_features))
        
        self.bias_mu = nn.Parameter(torch.empty(out_features))
        self.bias_sigma = nn.Parameter(torch.empty(out_features))
        self.register_buffer('bias_epsilon', torch.empty(out_features))
        
        self.reset_parameters()
    
    def reset_parameters(self):
        mu_range = 1 / math.sqrt(self.in_features)
        self.weight_mu.data.uniform_(-mu_range, mu_range)
        self.weight_sigma.data.fill_(self.std_init / math.sqrt(self.in_features))
        self.bias_mu.data.uniform_(-mu_range, mu_range)
        self.bias_sigma.data.fill_(self.std_init / math.sqrt(self.out_features))
    
    def forward(self, x):
        if self.training:
            self.weight_epsilon.normal_()
            self.bias_epsilon.normal_()
            weight = self.weight_mu + self.weight_sigma * self.weight_epsilon
            bias = self.bias_mu + self.bias_sigma * self.bias_epsilon
        else:
            weight = self.weight_mu
            bias = self.bias_mu
        return F.linear(x, weight, bias)
    
    def reset_noise(self):
        self.weight_epsilon.normal_()
        self.bias_epsilon.normal_()
```

### 2.5 Distributional RL (C51 - Bellemare et al., 2017)
**Idea**: Model full distribution of returns $Z(s,a)$ instead of expectation $Q(s,a)$.

```python
class C51Network(nn.Module):
    def __init__(self, input_shape, n_actions, n_atoms=51, v_min=-10, v_max=10):
        super().__init__()
        self.n_atoms = n_atoms
        self.v_min = v_min
        self.v_max = v_max
        self.support = torch.linspace(v_min, v_max, n_atoms)
        
        self.conv = ...
        self.fc = nn.Linear(conv_out, n_actions * n_atoms)
    
    def forward(self, x):
        x = self.conv(x)
        x = x.view(x.size(0), -1)
        logits = self.fc(x).view(-1, self.n_actions, self.n_atoms)
        return F.softmax(logits, dim=2)  # Probability distribution
```

**Projection (Categorical)**:
```python
def categorical_loss(current_dist, target_dist):
    # Cross-entropy between distributions
    return -(target_dist * torch.log(current_dist + 1e-8)).sum(-1).mean()

def project_distribution(next_dist, rewards, dones, gamma, support):
    """Project next state distribution onto current support"""
    batch_size = next_dist.size(0)
    n_atoms = support.size(0)
    v_min, v_max = support[0], support[-1]
    delta_z = (v_max - v_min) / (n_atoms - 1)
    
    # Target values
    Tz = rewards.unsqueeze(1) + gamma * support.unsqueeze(0) * (1 - dones.unsqueeze(1))
    Tz = Tz.clamp(v_min, v_max)
    
    # Project onto support
    b = (Tz - v_min) / delta_z
    l = b.floor().long()
    u = b.ceil().long()
    
    proj_dist = torch.zeros_like(next_dist)
    for i in range(n_atoms):
        # Distribute probability mass
        proj_dist.scatter_add_(1, l[:, i:i+1], next_dist[:, i:i+1] * (u[:, i:i+1].float() - b[:, i:i+1]))
        proj_dist.scatter_add_(1, u[:, i:i+1], next_dist[:, i:i+1] * (b[:, i:i+1] - l[:, i:i+1].float()))
    
    return proj_dist
```

### 2.6 Quantile Regression DQN (QR-DQN - Dabney et al., 2018)
**Idea**: Learn quantiles of return distribution directly.

```python
class QRNetwork(nn.Module):
    def __init__(self, input_shape, n_actions, n_quantiles=200):
        super().__init__()
        self.n_quantiles = n_quantiles
        self.tau = (torch.arange(n_quantiles) + 0.5) / n_quantiles  # Quantile midpoints
        
        self.conv = ...
        self.fc = nn.Linear(conv_out, n_actions * n_quantiles)
    
    def forward(self, x):
        x = self.conv(x)
        x = x.view(x.size(0), -1)
        return self.fc(x).view(-1, self.n_actions, self.n_quantiles)

def quantile_huber_loss(current_quantiles, target_quantiles, tau, kappa=1.0):
    # current: (batch, n_quantiles), target: (batch, n_quantiles)
    u = target_quantiles - current_quantiles  # (batch, n_quantiles)
    huber = torch.where(u.abs() <= kappa, 0.5 * u**2, kappa * (u.abs() - 0.5 * kappa))
    loss = (tau - (u < 0).float()) * huber
    return loss.mean()
```

### 2.7 Multi-step Bootstrap (n-step DQN)
```python
# n-step return
R_t^(n) = r_t + gamma*r_{t+1} + ... + gamma^{n-1}r_{t+n-1} + gamma^n * max_a Q(s_{t+n}, a)

# In replay buffer: store (s, a, r, s', done, n_step_return, n_step_done, s_n)
```

---

## 3. Rainbow DQN (Hessel et al., 2018)

Combines all improvements into one algorithm:

| Component | Implementation |
|-----------|----------------|
| **Double DQN** | Decouple selection/evaluation |
| **Dueling** | Value + Advantage streams |
| **Prioritized Replay** | TD-error based sampling |
| **Noisy Nets** | Factorized Gaussian noise |
| **Distributional (C51)** | 51 atoms, categorical projection |
| **Multi-step** | 3-step returns |
| **Target Network** | Hard update every 10k steps |

### Rainbow Architecture
```python
class RainbowNetwork(nn.Module):
    def __init__(self, input_shape, n_actions, n_atoms=51, v_min=-10, v_max=10):
        super().__init__()
        self.n_atoms = n_atoms
        self.support = torch.linspace(v_min, v_max, n_atoms)
        
        # Shared conv
        self.conv = nn.Sequential(
            nn.Conv2d(4, 32, 8, 4), nn.ReLU(),
            nn.Conv2d(32, 64, 4, 2), nn.ReLU(),
            nn.Conv2d(64, 64, 3, 1), nn.ReLU(),
        )
        
        # Dueling streams with NoisyLinear
        self.value_stream = nn.Sequential(
            NoisyLinear(conv_out, 512), nn.ReLU(),
            NoisyLinear(512, n_atoms)
        )
        self.adv_stream = nn.Sequential(
            NoisyLinear(conv_out, 512), nn.ReLU(),
            NoisyLinear(512, n_actions * n_atoms)
        )
    
    def forward(self, x):
        x = self.conv(x.float() / 255.0)
        x = x.view(x.size(0), -1)
        
        v = self.value_stream(x).view(-1, 1, self.n_atoms)
        a = self.adv_stream(x).view(-1, self.n_actions, self.n_atoms)
        
        q = v + a - a.mean(1, keepdim=True)
        return F.softmax(q, dim=-1)  # Distribution over atoms
```

### Rainbow Training Loop
```python
def train_rainbow(env, net, target_net, buffer, optimizer, gamma=0.99, n_step=3):
    for step in range(total_steps):
        # Epsilon not needed with NoisyNets (or use small epsilon for safety)
        with torch.no_grad():
            action = net(state).argmax().item()  # Greedy w.r.t. mean Q
        
        # n-step collection
        trajectory = []
        for _ in range(n_step):
            s_prime, r, done, _ = env.step(action)
            trajectory.append((state, action, r, next_state, done))
            state = next_state
            if done:
                state = env.reset()
                break
        
        # Compute n-step return
        n_step_return = sum(r * (gamma**i) for i, (_, r, _, _, _) in enumerate(trajectory))
        final_state = trajectory[-1][3]
        final_done = trajectory[-1][4]
        
        buffer.add(state, action, n_step_return, final_state, final_done)
        
        # Sample from prioritized buffer
        batch, indices, weights = buffer.sample(batch_size)
        s, a, r, s_prime, done = batch
        
        # Current distribution
        current_dist = net(s)
        current_dist = current_dist[range(batch_size), a]  # (batch, n_atoms)
        
        # Target distribution (Double DQN + Categorical projection)
        with torch.no_grad():
            # Next action from online net
            next_dist_online = net(s_prime)
            next_actions = (next_dist_online * support).sum(-1).argmax(-1)
            
            # Evaluate with target net
            next_dist_target = target_net(s_prime)
            next_dist = next_dist_target[range(batch_size), next_actions]
            
            # Project
            target_dist = project_distribution(next_dist, r, done, gamma**n_step, support)
        
        # Weighted loss
        loss = -(target_dist * torch.log(current_dist + 1e-8)).sum(-1)
        loss = (loss * weights).mean()
        
        optimizer.zero_grad()
        loss.backward()
        clip_grad_norm_(net.parameters(), 10)
        optimizer.step()
        
        # Update priorities
        td_errors = (current_dist * support).sum(-1) - (target_dist * support).sum(-1)
        buffer.update_priorities(indices, td_errors.abs().detach().cpu().numpy())
        
        # Update target
        if step % target_update_freq == 0:
            target_net.load_state_dict(net.state_dict())
        
        # Reset noise
        net.reset_noise()
        target_net.reset_noise()
```

---

## 4. Other Notable Variants

### 4.1 Implicit Quantile Networks (IQN)
```python
# Sample quantiles from uniform, embed via cosine basis
class IQN(nn.Module):
    def forward(self, x, n_samples=32):
        taus = torch.rand(x.size(0), n_samples)  # Sample quantiles
        tau_emb = self.cosine_embedding(taus)    # Embed quantiles
        return self.quantile_network(x, tau_emb)
```

### 4.2 FQF (Fully Parameterized Quantile Function)
```python
# Learn quantile function directly via quantile embedding network
class FQF(nn.Module):
    def forward(self, x):
        # Fraction proposal network
        taus = self.fraction_net(x)  # Learned quantile positions
        return self.quantile_net(x, taus)
```

### 4.3 REM (Random Ensemble Mixture)
```python
# Ensemble of Q-networks, aggregate via mixture
class REM(nn.Module):
    def __init__(self, n_ensemble=5):
        self.ensemble = nn.ModuleList([DQN() for _ in range(n_ensemble)])
    
    def forward(self, x):
        return torch.stack([net(x) for net in self.ensemble]).mean(0)
```

---

## 5. Exploration Strategies for Deep RL

| Strategy | Pros | Cons |
|----------|------|------|
| **$\epsilon$-greedy** | Simple | Non-adaptive, uniform |
| **Noisy Nets** | State-dependent, no schedule | Slightly more complex |
| **Parameter Noise** | Persistent exploration | Requires noisy layers |
| **Bootstrapped DQN** | Thompson sampling | Multiple heads |
| **Random Network Distillation (RND)** | Intrinsic curiosity | Extra forward pass |
| **ICM (Intrinsic Curiosity Module)** | Learnable exploration | Two extra networks |

### RND (Random Network Distillation)
```python
class RND:
    def __init__(self, state_dim):
        self.target = RandomNetwork(state_dim)  # Fixed random weights
        self.predictor = PredictorNetwork(state_dim)  # Trainable
    
    def intrinsic_reward(self, state):
        with torch.no_grad():
            target_feat = self.target(state)
        pred_feat = self.predictor(state)
        return (target_feat - pred_feat).pow(2).mean(-1)
    
    def update(self, state):
        loss = self.intrinsic_reward(state).mean()
        loss.backward()
```

---

## 6. Offline RL (Batch RL)

Learn from fixed dataset $\mathcal{D}$ without environment interaction.

### Challenges
- **Distributional Shift**: OOD actions → overestimated Q-values
- **Extrapolation Error**: Unseen state-action pairs

### Solutions

#### BCQ (Batch-Constrained Q-learning)
```python
# Learn behavior policy, constrain to high-probability actions
class BCQ:
    def __init__(self):
        self.vae = VAE(state_dim, action_dim)  # Generative model of behavior
        self.q_net = QNetwork()
    
    def select_action(self, state):
        # Sample actions from VAE
        actions = self.vae.decode(state, n_samples=100)
        q_values = self.q_net(state.repeat(100), actions)
        return actions[q_values.argmax()]
```

#### CQL (Conservative Q-Learning)
```python
# Add regularization to push down Q-values of OOD actions
def cql_loss(q_values, actions, dataset_actions):
    # Standard Bellman error
    bellman_loss = F.mse_loss(q_values, targets)
    
    # Conservative regularization
    logsumexp = torch.logsumexp(q_values, dim=1)
    q_dataset = q_values.gather(1, dataset_actions)
    cql_loss = (logsumexp - q_dataset).mean()
    
    return bellman_loss + alpha * cql_loss
```

#### IQL (Implicit Q-Learning)
```python
# Expectile regression for value function
def iql_loss(v, q, actions, expectile=0.7):
    # Asymmetric L2 loss for value
    diff = q - v
    weight = torch.where(diff > 0, expectile, 1 - expectile)
    v_loss = (weight * diff**2).mean()
    
    # Policy extraction via advantage weighting
    adv = q - v
    policy_loss = -(adv.exp() * log_pi).mean()
```

---

## 6. Benchmarking & Evaluation

### Atari 2600 (ALE)
```python
# Standard evaluation
env = gym.make('ALE/Pong-v5', frameskip=4)
# Metrics: Mean episode reward over 100 episodes
# Human normalized score: (Agent - Random) / (Human - Random)
```

### Evaluation Protocol
```python
def evaluate_agent(agent, env, n_episodes=100, epsilon=0.001):
    rewards = []
    for _ in range(n_episodes):
        state = env.reset()
        total_reward = 0
        done = False
        while not done:
            action = agent.act(state, epsilon=epsilon)
            state, reward, done, _ = env.step(action)
            total_reward += reward
        rewards.append(total_reward)
    return np.mean(rewards), np.std(rewards)
```

---

## 7. Key Takeaways

1. **DQN** introduced Experience Replay + Target Network → stable deep RL
2. **Double DQN** fixes overestimation bias via decoupled selection/evaluation
3. **Dueling DQN** separates value/advantage → better state-value estimation
4. **Prioritized Replay** focuses on important transitions → sample efficiency
5. **Noisy Nets** replace $\epsilon$-greedy with parametric noise
5. **Distributional RL (C51, QR-DQN)** models full return distribution
6. **Rainbow** combines all improvements → SOTA on Atari (2018)
7. **n-step returns** bridge MC and TD → faster propagation
6. **Offline RL** (BCQ, CQL, IQL) enables learning from fixed datasets
7. **Exploration**: Noisy Nets > $\epsilon$-greedy for deep RL
8. **Key challenge**: Overestimation bias, distributional shift, extrapolation error