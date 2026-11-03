# Multi-Agent Reinforcement Learning (MARL)

MARL extends RL to settings with multiple interacting agents. Agents can be cooperative, competitive, or mixed.

## 1. MARL Formalisms

### 1.1 Markov Games (Stochastic Games)
$$(\mathcal{N}, \mathcal{S}, \{\mathcal{A}^i\}, P, \{r^i\}, \gamma)$$

- $\mathcal{N} = \{1, ..., N\}$: Set of agents
- $\mathcal{S}$: Global state space
- $\mathcal{A}^i$: Action space of agent $i$
- $P(s' | s, a^1, ..., a^N)$: Transition function
- $r^i(s, a^1, ..., a^N)$: Reward for agent $i$
- $\gamma$: Discount factor

### 1.2 Dec-POMDP (Decentralized POMDP)
Agents have partial observations:
- $o^i \sim O(o^i | s)$
- Policies $\pi^i(a^i | o^i)$ or $\pi^i(a^i | \tau^i)$ with history $\tau^i$

### 1.3 Cooperative vs Competitive
| Type | Reward Structure | Examples |
|------|-----------------|----------|
| **Fully Cooperative** | $r^1 = r^2 = ... = r^N$ | Multi-robot, StarCraft, Hanabi |
| **Zero-Sum** | $\sum_i r^i = 0$ | Chess, Go, Poker |
| **General-Sum** | Arbitrary | Traffic, Economics, Social Dilemmas |
| **Mixed** | Both | Team sports, Diplomacy |

---

## 2. Centralized Training Decentralized Execution (CTDE)

**Core Paradigm**: During training, agents share information (global state, other agents' actions). During execution, each agent acts based only on local observation.

```
TRAINING (Centralized)          EXECUTION (Decentralized)
┌─────────────────────┐         ┌─────┐ ┌─────┐ ┌─────┐
│   Global State      │         │ A1  │ │ A2  │ │ A3  │
│   All Actions       │   →     │ o1→a│ │ o2→a│ │ o3→a│
│   All Rewards       │         └─────┘ └─────┘ └─────┘
│   Central Critic    │
└─────────────────────┘
```

---

## 3. Value-Based MARL

### 3.1 Independent Q-Learning (IQL)
Each agent learns independently, treating others as part of environment.
```python
# Problems: Non-stationarity, convergence issues
def iql_update(agent_i, state, action, reward, next_state):
    # Standard DQN update per agent
    target = reward + gamma * max_a Q_i(next_state, a)
    Q_i(state, action) += alpha * (target - Q_i(state, action))
```

### 3.2 VDN (Value Decomposition Networks) - Sunehag et al., 2017
$$Q_{tot}(s, a_1, ..., a_N) = \sum_{i=1}^N Q_i(\tau^i, a^i)$$

```python
class VDN:
    def __init__(self, n_agents, state_dim, action_dim):
        self.agent_nets = nn.ModuleList([QNetwork(obs_dim, action_dim) for _ in range(n_agents)])
    
    def forward(self, observations):
        # observations: (batch, n_agents, obs_dim)
        q_values = [net(obs) for net, obs in zip(self.agent_nets, observations.unbind(1))]
        q_tot = sum(q_values)  # Sum over agents
        return q_tot
```

### 3.3 QMIX (Rashid et al., 2018)
**Monotonicity Constraint**: $\frac{\partial Q_{tot}}{\partial Q_i} \geq 0$ for all $i$

```python
class QMIX(nn.Module):
    def __init__(self, n_agents, state_dim, action_dim, embed_dim=32):
        super().__init__()
        self.n_agents = n_agents
        
        # Agent networks
        self.agent_nets = nn.ModuleList([
            QNetwork(obs_dim, action_dim) for _ in range(n_agents)
        ])
        
        # Mixing network (hypernetwork)
        self.hyper_w1 = nn.Linear(state_dim, n_agents * embed_dim)
        self.hyper_w2 = nn.Linear(state_dim, embed_dim)
        self.hyper_b1 = nn.Linear(state_dim, embed_dim)
        self.hyper_b2 = nn.Sequential(
            nn.Linear(state_dim, embed_dim),
            nn.ReLU(),
            nn.Linear(embed_dim, 1)
        )
    
    def forward(self, agent_qs, state):
        # agent_qs: (batch, n_agents)
        # state: (batch, state_dim)
        
        batch_size = agent_qs.size(0)
        
        # Hypernetwork weights (non-negative)
        w1 = torch.abs(self.hyper_w1(state)).view(-1, self.n_agents, embed_dim)
        b1 = self.hyper_b1(state).view(-1, 1, embed_dim)
        
        w2 = torch.abs(self.hyper_w2(state)).view(-1, embed_dim, 1)
        b2 = self.hyper_b2(state).view(-1, 1, 1)
        
        # Mixing
        hidden = F.elu(torch.bmm(agent_qs.view(-1, 1, self.n_agents), w1) + b1)
        q_tot = torch.bmm(hidden, w2) + b2
        
        return q_tot.squeeze()
```

### 3.4 QTRAN (Son et al., 2019)
Transforms individual Q-values to satisfy IGM (Individual-Global-Max) principle.
```python
# QTRAN adds a transformation network
class QTRAN:
    def __init__(self):
        self.qtran_net = QTRANNet()  # Transforms individual Qs
        self.v_net = VNet()  # State value
    
    def forward(self, agent_qs, state):
        # Compute transformed Q
        q_joint = self.qtran_net(agent_qs, state)
        v = self.v_net(state)
        return q_joint + v
```

### 3.5 QPLEX (Wang et al., 2020)
Duplex dueling architecture with advantage decomposition.
```python
# QPLEX uses dueling architecture per agent
class QPLEX:
    def __init__(self):
        self.agent_nets = ...  # Dueling: V_i + A_i
        self.mixer = ...  # Mixes V_i and A_i with state
```

---

## 4. Policy Gradient MARL

### 4.1 Independent Policy Gradient (IPG)
Each agent runs policy gradient independently.
```python
# High variance, non-stationarity issues
def ipg_update(agent_i, trajectory):
    # Standard REINFORCE/A2C per agent
    pass
```

### 4.2 COMA (Counterfactual Multi-Agent) - Foerster et al., 2018
Centralized critic with counterfactual baseline.
```python
class COMA:
    def __init__(self):
        self.actor = Actor()
        self.critic = CentralizedCritic()  # Q(s, a_1, ..., a_N)
    
    def compute_advantage(self, state, actions, agent_i):
        # Counterfactual baseline: marginalize out agent i's action
        q = self.critic(state, actions)
        baseline = sum(pi(a|o) * Q(s, a_{-i}, a) for a in actions_i)
        return q - baseline
```

### 4.3 MAPPO (Multi-Agent PPO) - Yu et al., 2021
**Key Insight**: PPO works well in MARL with proper implementation.

```python
class MAPPO:
    def __init__(self, n_agents, obs_dim, action_dim, share_obs_dim):
        self.actors = nn.ModuleList([Actor(obs_dim, act_dim) for _ in range(n_agents)])
        self.critic = CentralizedCritic(share_obs_dim)  # Shared critic
        
    def update(self, buffer):
        # Shared observations (global state)
        share_obs = buffer.share_obs
        obs = buffer.obs
        actions = buffer.actions
        rewards = buffer.rewards
        
        # Compute GAE using centralized critic
        values = self.critic(share_obs)
        advantages, returns = compute_gae(rewards, values, dones)
        
        # Update each actor with PPO
        for i in range(self.n_agents):
            dist = self.actors[i](obs[:, i])
            log_probs = dist.log_prob(actions[:, i])
            # PPO clipped objective...
```

**MAPPO Best Practices** (from Yu et al., 2021):
1. **Centralized Critic**: Uses global state
2. **GAE**: Critical for variance reduction
3. **Value Normalization**: Normalize returns
4. **ReLU Activation**: Better than Tanh for critic
5. **Separate Policy/Value Networks**: Don't share layers
6. **Proper Hyperparameters**: clip=0.05-0.2, epochs=5-15

### 4.2 HAPPO/HATRPO (Kuba et al., 2021)
Hetereogeneous-Agent PPO/TRPO with monotonic improvement guarantees.

---

## 5. QMIX Variants & Extensions

### 5.1 QMIX with Prioritized Replay
```python
class QMIXBuffer:
    def __init__(self):
        self.priorities = []
    
    def update_priorities(self, td_errors):
        # Use max TD error across agents
        max_td = max(abs(e) for e in td_errors)
        priority = (abs(max_td) + 1e-6) ** alpha
```

### 5.2 QMIX with RNN (Recurrent QMIX)
```python
class RecurrentQMIX:
    def __init__(self):
        self.agent_nets = RNNQNetwork()  # GRU/LSTM per agent
        self.mixer = QMIXMixer()
    
    def forward(self, obs, hidden_states):
        # obs: (batch, seq_len, n_agents, obs_dim)
        agent_qs, new_hidden = self.agent_nets(obs, hidden_states)
        q_tot = self.mixer(agent_qs, state)
        return q_tot, new_hidden
```

### 5.3 WQMIX (Weighted QMIX)
Learns weight for each joint action to handle non-monotonicity.

---

## 4. Mean Field MARL

For large populations ($N \to \infty$), approximate with mean field theory.

### Mean Field Approximation
$$\frac{1}{N} \sum_{j \neq i} f(a_j) \approx \mathbb{E}_{a \sim \pi}[f(a)]$$

### Mean Field Q-Learning
```python
class MeanFieldQL:
    def __init__(self):
        self.q_net = QNetwork(obs_dim + action_dim, 1)  # Q(s, a, mu)
    
    def mean_field_approx(self, actions):
        # mu = empirical distribution of actions
        return torch.mean(actions, dim=0)
    
    def update(self, state, action, reward, next_state, mu):
        # Q(s, a, mu) update
        q_val = self.q_net(torch.cat([state, action, mu]))
```

---

## 5. Emergent Communication

Agents learn communication protocols.

### Differentiable Communication (CommNet)
```python
class CommNet:
    def __init__(self, n_agents, comm_rounds=2):
        self.comm_rounds = comm_rounds
        self.encoder = nn.Linear(obs_dim, hidden_dim)
        self.comm = nn.Linear(hidden_dim * 2, hidden_dim)
        self.decoder = nn.Linear(hidden_dim, action_dim)
    
    def forward(self, obs):
        # obs: (batch, n_agents, obs_dim)
        h = self.encoder(obs)
        
        for _ in range(self.comm_rounds):
            # Communication: average of other agents' hidden states
            mean_h = h.mean(dim=1, keepdim=True).expand_as(h)
            h = F.relu(self.comm(torch.cat([h, mean_h], dim=-1)))
        
        return self.decoder(h)
```

### ATOC (Actor-Critic with Communication)
```python
# Learn when and what to communicate
class ATOC:
    def __init__(self):
        self.comm_gate = nn.Linear(hidden_dim, 1)  # Binary gate
        self.comm_content = nn.Linear(hidden_dim, comm_dim)
```

---

## 5. Social Dilemmas & Cooperation

### 5.1 Social Dilemma Matrix
| | Cooperate | Defect |
|---|---|---|
| **Cooperate** | R, R | S, T |
| **Defect** | T, S | P, P |

- **Prisoner's Dilemma**: T > R > P > S
- **Stag Hunt**: R > T > P > S
- **Chicken**: T > R > S > P

### 5.2 Learning to Cooperate
```python
# LOLA (Learning with Opponent-Learning Awareness)
def lola_update(agent_i, opponent_j):
    # Differentiate through opponent's learning step
    theta_j_next = theta_j + alpha * grad_j(L_j)
    L_i = loss_i(theta_i, theta_j_next)
    grad_i = grad_i(L_i)  # Includes opponent's learning!
```

### 5.3 Other-Regarding Preferences
```python
# Intrinsic reward for cooperation
def intrinsic_reward(own_reward, other_rewards, beta=0.1):
    # Inequity aversion (Fehr-Schmidt)
    advantageous = max(0, own_reward - max(other_rewards))
    disadvantageous = max(0, max(other_rewards) - own_reward)
    return own_reward - beta * disadvantageous - alpha * advantageous
```

---

## 6. MARL Benchmarks

| Environment | Type | Agents | Complexity |
|-------------|------|--------|------------|
| **SMAC** (StarCraft II) | Cooperative | 2-10 | Medium-High |
| **MAgent** | Cooperative/Competitive | 100+ | High |
| **PettingZoo** | Various | 2-100 | Various |
| **MA-RL** (MPE) | Cooperative/Competitive | 2-10 | Low-Medium |
| **Google Research Football** | Cooperative | 2-11 | High |
| **Hanabi** | Cooperative (Imperfect Info) | 2-5 | High |
| **Poker** (Leduc, Texas Hold'em) | Competitive | 2-6 | High |
| **Overcooked** | Cooperative | 2 | Medium |

---

## 5. MARL Libraries

| Library | Focus | Features |
|---------|-------|----------|
| **EPyMARL** | PyTorch | QMIX, VDN, COMA, MAPPO |
| **MARLlib** (Ray) | Ray | 20+ algorithms, scalable |
| **PettingZoo** | Gym-like | 60+ environments, API standard |
| **MARL** (OpenAI) | Research | Multi-agent environments |
| **SMAC** | StarCraft | Benchmark suite |
| **MAgent2** | Large-scale | 1000+ agents |

---

## 6. Key Takeaways

1. **CTDE** is the dominant paradigm: centralized critic, decentralized actors
2. **Value Factorization**: VDN (additive) → QMIX (monotonic) → QTRAN/QPLEX (general)
3. **MAPPO** is surprisingly effective for cooperative MARL
5. **Non-stationarity** is the core challenge: other agents' policies change
6. **Credit Assignment**: Who gets credit for team reward? (QMIX, COMA, counterfactuals)
6. **Scalability**: Mean field for large N, graph networks for structured interactions
7. **Communication**: Differentiable (CommNet), gated (ATOC), emergent
8. **Social Dilemmas**: Cooperation not guaranteed; need intrinsic rewards/opponent modeling
9. **Evaluation**: Must test with ad-hoc teammates, not just self-play
10. **Libraries**: EPyMARL (PyTorch), MARLlib (Ray), PettingZoo (envs)