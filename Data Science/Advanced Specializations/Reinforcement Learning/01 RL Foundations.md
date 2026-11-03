# Reinforcement Learning Foundations

Reinforcement Learning (RL) is a framework for sequential decision making where an agent learns to interact with an environment to maximize cumulative reward.

## 1. The RL Framework

### Markov Decision Process (MDP)
An MDP is a tuple $(S, A, P, R, \gamma)$:

- **$S$**: State space (finite or continuous)
- **$A$**: Action space (finite or continuous)
- **$P(s' | s, a)$**: Transition probability - probability of next state $s'$ given current state $s$ and action $a$
- **$R(s, a, s')$**: Reward function - scalar reward for transition
- **$\gamma \in [0, 1)$**: Discount factor - importance of future rewards

### Partially Observable MDP (POMDP)
When the agent doesn't observe the full state, only observations $o \sim O(o | s)$.

### Key Assumptions
- **Markov Property**: $P(s_{t+1} | s_t, a_t, s_{t-1}, ...) = P(s_{t+1} | s_t, a_t)$
- **Stationarity**: Transition and reward functions don't change over time
- **Single Agent**: One decision maker (multi-agent = Stochastic Games)

---

## 2. Core Concepts

### Return (Cumulative Discounted Reward)
$$G_t = R_{t+1} + \gamma R_{t+2} + \gamma^2 R_{t+3} + ... = \sum_{k=0}^{\infty} \gamma^k R_{t+k+1}$$

### Value Functions

#### State Value Function $V^\pi(s)$
Expected return starting from state $s$ following policy $\pi$:
$$V^\pi(s) = \mathbb{E}_\pi[G_t | S_t = s]$$

#### Action Value Function $Q^\pi(s, a)$
Expected return starting from state $s$, taking action $a$, then following $\pi$:
$$Q^\pi(s, a) = \mathbb{E}_\pi[G_t | S_t = s, A_t = a]$$

### Policy $\pi(a | s)$
Probability distribution over actions given state:
- **Deterministic**: $\pi(s) = a$
- **Stochastic**: $\pi(a | s) = P(A_t = a | S_t = s)$

### Optimal Value Functions
$$V^*(s) = \max_\pi V^\pi(s) \quad \text{and} \quad Q^*(s, a) = \max_\pi Q^\pi(s, a)$$

Optimal policy: $\pi^*(s) = \arg\max_a Q^*(s, a)$

---

## 3. Bellman Equations

### Bellman Expectation Equations (for a given policy $\pi$)

**State Value**:
$$V^\pi(s) = \sum_a \pi(a|s) \sum_{s'} P(s'|s,a) [R(s,a,s') + \gamma V^\pi(s')]$$

**Action Value**:
$$Q^\pi(s,a) = \sum_{s'} P(s'|s,a) [R(s,a,s') + \gamma \sum_{a'} \pi(a'|s') Q^\pi(s', a')]$$

### Bellman Optimality Equations (for optimal policy)

**Optimal State Value**:
$$V^*(s) = \max_a \sum_{s'} P(s'|s,a) [R(s,a,s') + \gamma V^*(s')]$$

**Optimal Action Value**:
$$Q^*(s,a) = \sum_{s'} P(s'|s,a) [R(s,a,s') + \gamma \max_{a'} Q^*(s', a')]$$

### Bellman Operator
Define operator $\mathcal{T}^\pi$ for policy $\pi$:
$$(\mathcal{T}^\pi V)(s) = \sum_a \pi(a|s) \sum_{s'} P(s'|s,a) [R + \gamma V(s')]$$

And optimal Bellman operator $\mathcal{T}^*$:
$$(\mathcal{T}^* V)(s) = \max_a \sum_{s'} P(s'|s,a) [R + \gamma V(s')]$$

**Contraction Property**: $\mathcal{T}^*$ is a $\gamma$-contraction in max-norm → unique fixed point $V^*$

---

## 4. Dynamic Programming (Tabular Methods)

Assume finite MDP with known $P$ and $R$. These are **planning** algorithms, not learning.

### 4.1 Policy Evaluation
Compute $V^\pi$ for a fixed policy $\pi$.

**Iterative Policy Evaluation**:
```python
def policy_evaluation(policy, P, R, gamma, theta=1e-6):
    V = np.zeros(n_states)
    while True:
        delta = 0
        for s in range(n_states):
            v = V[s]
            # Bellman expectation backup
            V[s] = sum(policy[s, a] * sum(P[s, a, s_prime] * (R[s, a, s_prime] + gamma * V[s_prime]) 
                       for s_prime in range(n_states)) for a in range(n_actions))
            delta = max(delta, abs(v - V[s]))
        if delta < theta:
            break
    return V
```

### 4.2 Policy Improvement
Given $V^\pi$, improve policy:
$$\pi'(s) = \arg\max_a \sum_{s'} P(s'|s,a) [R(s,a,s') + \gamma V^\pi(s')]$$

### 4.3 Policy Iteration
```python
def policy_iteration(P, R, gamma):
    policy = np.random.randint(0, n_actions, n_states)
    while True:
        # Policy Evaluation
        V = policy_evaluation(policy, P, R, gamma)
        
        # Policy Improvement
        policy_stable = True
        for s in range(n_states):
            old_action = policy[s]
            # Greedy w.r.t V
            q_values = np.array([sum(P[s, a, s_prime] * (R[s, a, s_prime] + gamma * V[s_prime]) 
                                   for s_prime in range(n_states)) for a in range(n_actions)])
            policy[s] = np.argmax(q_values)
            if old_action != policy[s]:
                policy_stable = False
        
        if policy_stable:
            break
    return policy, V
```

### 4.4 Value Iteration
Combines evaluation and improvement in one step:
$$V_{k+1}(s) = \max_a \sum_{s'} P(s'|s,a) [R(s,a,s') + \gamma V_k(s')]$$

```python
def value_iteration(P, R, gamma, theta=1e-6):
    V = np.zeros(n_states)
    while True:
        delta = 0
        for s in range(n_states):
            v = V[s]
            # Bellman optimality backup
            V[s] = max(sum(P[s, a, s_prime] * (R[s, a, s_prime] + gamma * V[s_prime]) 
                          for s_prime in range(n_states)) for a in range(n_actions))
            delta = max(delta, abs(v - V[s]))
        if delta < theta:
            break
    
    # Extract optimal policy
    policy = np.zeros(n_states, dtype=int)
    for s in range(n_states):
        q_values = np.array([sum(P[s, a, s_prime] * (R[s, a, s_prime] + gamma * V[s_prime]) 
                               for s_prime in range(n_states)) for a in range(n_actions)])
        policy[s] = np.argmax(q_values)
    return policy, V
```

### 4.5 Asynchronous Dynamic Programming
- **In-place updates**: Update states in any order, using latest values
- **Prioritized sweeping**: Update states whose values changed most
- **Real-time DP**: Update only states relevant to current trajectory

---

## 5. Monte Carlo Methods (Model-Free)

Learn from **complete episodes** without knowing $P$ or $R$.

### 5.1 First-Visit vs Every-Visit MC
```python
def mc_prediction(env, policy, n_episodes, gamma):
    returns_sum = defaultdict(float)
    returns_count = defaultdict(int)
    V = defaultdict(float)
    
    for _ in range(n_episodes):
        episode = generate_episode(env, policy)  # [(s, a, r), ...]
        G = 0
        visited = set()
        
        for t in reversed(range(len(episode))):
            s, a, r = episode[t]
            G = gamma * G + r
            
            if (s, a) not in visited:  # First-visit
                visited.add((s, a))
                returns_sum[(s, a)] += G
                returns_count[(s, a)] += 1
                V[(s, a)] = returns_sum[(s, a)] / returns_count[(s, a)]
    
    return V
```

### 5.2 Monte Carlo Control (GLIE)
Generalized Policy Iteration with MC evaluation:
```python
def mc_control(env, n_episodes, gamma, epsilon=0.1):
    Q = defaultdict(lambda: np.zeros(n_actions))
    returns_sum = defaultdict(float)
    returns_count = defaultdict(int)
    
    for i in range(n_episodes):
        # Epsilon-greedy policy
        policy = lambda s: epsilon_greedy(Q[s], epsilon)
        
        episode = generate_episode(env, policy)
        G = 0
        visited = set()
        
        for t in reversed(range(len(episode))):
            s, a, r = episode[t]
            G = gamma * G + r
            
            if (s, a) not in visited:
                visited.add((s, a))
                returns_sum[(s, a)] += G
                returns_count[(s, a)] += 1
                Q[s][a] = returns_sum[(s, a)] / returns_count[(s, a)]
        
        # Decay epsilon for GLIE
        epsilon = max(0.01, epsilon * 0.999)
    
    return Q
```

---

## 6. Temporal Difference (TD) Learning

Learn from **incomplete episodes** by bootstrapping.

### 6.1 TD(0) / TD Prediction
$$V(S_t) \leftarrow V(S_t) + \alpha [R_{t+1} + \gamma V(S_{t+1}) - V(S_t)]$$

```python
def td_prediction(env, policy, n_episodes, alpha, gamma):
    V = np.zeros(n_states)
    for _ in range(n_episodes):
        s = env.reset()
        done = False
        while not done:
            a = policy(s)
            s_prime, r, done, _ = env.step(a)
            # TD(0) update
            V[s] += alpha * (r + gamma * V[s_prime] * (1 - done) - V[s])
            s = s_prime
    return V
```

### 6.2 TD Control Methods

#### SARSA (On-policy)
$$Q(S_t, A_t) \leftarrow Q(S_t, A_t) + \alpha [R_{t+1} + \gamma Q(S_{t+1}, A_{t+1}) - Q(S_t, A_t)]$$

```python
def sarsa(env, n_episodes, alpha, gamma, epsilon):
    Q = np.zeros((n_states, n_actions))
    for _ in range(n_episodes):
        s = env.reset()
        a = epsilon_greedy(Q[s], epsilon)
        done = False
        while not done:
            s_prime, r, done, _ = env.step(a)
            a_prime = epsilon_greedy(Q[s_prime], epsilon) if not done else 0
            # SARSA update
            Q[s, a] += alpha * (r + gamma * Q[s_prime, a_prime] * (1 - done) - Q[s, a])
            s, a = s_prime, a_prime
    return Q
```

#### Q-Learning (Off-policy)
$$Q(S_t, A_t) \leftarrow Q(S_t, A_t) + \alpha [R_{t+1} + \gamma \max_a Q(S_{t+1}, a) - Q(S_t, A_t)]$$

```python
def q_learning(env, n_episodes, alpha, gamma, epsilon):
    Q = np.zeros((n_states, n_actions))
    for _ in range(n_episodes):
        s = env.reset()
        done = False
        while not done:
            a = epsilon_greedy(Q[s], epsilon)
            s_prime, r, done, _ = env.step(a)
            # Q-learning update (max over next actions)
            Q[s, a] += alpha * (r + gamma * np.max(Q[s_prime]) * (1 - done) - Q[s, a])
            s = s_prime
    return Q
```

#### Expected SARSA
$$Q(S_t, A_t) \leftarrow Q(S_t, A_t) + \alpha [R_{t+1} + \gamma \sum_a \pi(a|S_{t+1}) Q(S_{t+1}, a) - Q(S_t, A_t)]$$

### 6.3 TD($\lambda$) and Eligibility Traces
Blend MC and TD:
```python
def td_lambda(env, policy, n_episodes, alpha, gamma, lam):
    V = np.zeros(n_states)
    for _ in range(n_episodes):
        s = env.reset()
        E = np.zeros(n_states)  # Eligibility traces
        done = False
        while not done:
            a = policy(s)
            s_prime, r, done, _ = env.step(a)
            delta = r + gamma * V[s_prime] * (1 - done) - V[s]
            E[s] += 1
            V += alpha * delta * E
            E *= gamma * lam
            s = s_prime
    return V
```

---

## 7. Comparison: MC vs TD vs DP

| Method | Model Required | Bootstrapping | Variance | Bias | Use Case |
|--------|----------------|---------------|----------|------|----------|
| **DP** | Yes ($P, R$) | Full | 0 | 0 (exact) | Planning, known MDP |
| **MC** | No | None | High | 0 | Episodic, no bootstrapping needed |
| **TD(0)** | No | 1-step | Low | Some | Online, continuing tasks |
| **TD($\lambda$)** | No | $\lambda$-step | Medium | Some | Best of both worlds |
| **SARSA** | No | 1-step | Low | Some | On-policy control |
| **Q-Learning** | No | 1-step | Low | Some | Off-policy control (optimal) |

---

## 8. Exploration Strategies

### $\epsilon$-Greedy
```python
def epsilon_greedy(Q, epsilon):
    if np.random.random() < epsilon:
        return np.random.randint(len(Q))
    return np.argmax(Q)
```

### Decay Schedules
```python
# Linear
epsilon = max(eps_min, eps_start - (eps_start - eps_min) * step / total_steps)

# Exponential
epsilon = eps_min + (eps_start - eps_min) * np.exp(-step / decay_rate)

# Polynomial
epsilon = eps_min + (eps_start - eps_min) * (1 - step/total_steps)^power
```

### Upper Confidence Bound (UCB)
```python
def ucb_action(Q, N, c=2.0):
    # N: visit counts per action
    ucb = Q + c * np.sqrt(np.log(np.sum(N) + 1) / (N + 1e-8))
    return np.argmax(ucb)
```

### Thompson Sampling (Bayesian)
```python
# Maintain Beta(alpha, beta) for each action (Bernoulli rewards)
alpha = np.ones(n_actions)
beta = np.ones(n_actions)

def thompson_action():
    samples = np.random.beta(alpha, beta)
    return np.argmax(samples)

# Update after reward r (0 or 1)
alpha[a] += r
beta[a] += 1 - r
```

---

## 9. Function Approximation (Beyond Tabular)

For large/continuous state spaces, replace table with function approximator $\hat{V}(s, w)$ or $\hat{Q}(s, a, w)$.

### Linear Function Approximation
$$\hat{V}(s, w) = w^T \phi(s)$$
$$\hat{Q}(s, a, w) = w^T \phi(s, a)$$

### Neural Network Approximation (Deep RL)
$$\hat{Q}(s, a; \theta) = \text{NN}(s, a; \theta)$$

**Key Challenge**: Deadly triad = Function Approximation + Bootstrapping + Off-policy → Divergence

---

## 10. Key Equations Summary

| Concept | Equation |
|---------|----------|
| **Return** | $G_t = \sum_{k=0}^\infty \gamma^k R_{t+k+1}$ |
| **Bellman Expectation (V)** | $V^\pi(s) = \sum_a \pi(a|s) \sum_{s'} P(s'|s,a)[R + \gamma V^\pi(s')]$ |
| **Bellman Optimality (V)** | $V^*(s) = \max_a \sum_{s'} P(s'|s,a)[R + \gamma V^*(s')]$ |
| **Bellman Optimality (Q)** | $Q^*(s,a) = \sum_{s'} P(s'|s,a)[R + \gamma \max_{a'} Q^*(s', a')]$ |
| **TD(0) Update** | $V(S_t) \leftarrow V(S_t) + \alpha [R_{t+1} + \gamma V(S_{t+1}) - V(S_t)]$ |
| **SARSA Update** | $Q(S_t,A_t) \leftarrow Q + \alpha [R + \gamma Q(S',A') - Q]$ |
| **Q-Learning Update** | $Q(S_t,A_t) \leftarrow Q + \alpha [R + \gamma \max_a Q(S',a) - Q]$ |
| **Policy Gradient** | $\nabla J(\theta) = \mathbb{E}[\nabla \log \pi(A|S) Q^\pi(S,A)]$ |

---

## 11. Implementation: GridWorld Example

```python
import numpy as np

class GridWorld:
    def __init__(self, size=4):
        self.size = size
        self.n_states = size * size
        self.n_actions = 4  # up, down, left, right
        self.start = 0
        self.goal = size * size - 1
        self.obstacles = []
    
    def reset(self):
        self.state = self.start
        return self.state
    
    def step(self, action):
        row, col = divmod(self.state, self.size)
        
        if action == 0: row = max(0, row - 1)      # up
        elif action == 1: row = min(self.size-1, row + 1)  # down
        elif action == 2: col = max(0, col - 1)    # left
        elif action == 3: col = min(self.size-1, col + 1)  # right
        
        next_state = row * self.size + col
        
        if next_state in self.obstacles:
            next_state = self.state  # Bounce back
        
        self.state = next_state
        reward = 1.0 if next_state == self.goal else -0.01
        done = (next_state == self.goal)
        
        return next_state, reward, done, {}

# Train Q-Learning
env = GridWorld(4)
Q = q_learning(env, n_episodes=5000, alpha=0.1, gamma=0.99, epsilon=0.1)

# Extract policy
policy = np.argmax(Q, axis=1).reshape(4, 4)
print("Optimal Policy (0=up, 1=down, 2=left, 3=right):")
print(policy)
```

---

## 12. Convergence Guarantees

| Algorithm | Convergence | Conditions |
|-----------|-------------|------------|
| **Policy Iteration** | Finite iterations to optimal | Finite MDP, exact evaluation |
| **Value Iteration** | Asymptotic to $V^*$ | $\gamma < 1$ or proper policies |
| **MC (GLIE)** | $Q \to Q^*$ | Infinite episodes, $\epsilon \to 0$, $\sum \epsilon = \infty$ |
| **TD(0)** | $V \to V^\pi$ | $\sum \alpha = \infty$, $\sum \alpha^2 < \infty$ |
| **SARSA** | $Q \to Q^*$ | GLIE, same as MC |
| **Q-Learning** | $Q \to Q^*$ | $\sum \alpha = \infty$, $\sum \alpha^2 < \infty$, all state-actions visited infinitely |

---

## 13. Key Takeaways

1. **MDP** is the foundational framework — states, actions, transitions, rewards, discount
2. **Bellman Equations** characterize value functions recursively
3. **Dynamic Programming** (Policy/Value Iteration) solves known MDPs exactly
4. **Monte Carlo** learns from complete episodes, high variance, no bootstrapping
5. **TD Learning** learns from incomplete episodes, bootstraps, lower variance
6. **SARSA** (on-policy) vs **Q-Learning** (off-policy) — different convergence properties
7. **Exploration** is critical: $\epsilon$-greedy, UCB, Thompson Sampling
8. **Tabular methods don't scale** — need function approximation (Deep RL)
9. **Deadly Triad**: Function Approximation + Bootstrapping + Off-policy = Instability