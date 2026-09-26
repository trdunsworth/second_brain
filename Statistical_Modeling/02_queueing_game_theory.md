# Queueing Theory & Game Theory for Call Centers — Learning Guide

## Overview
Queueing theory studies waiting-line systems: arrivals, service, capacity, and congestion. Game theory models strategic decision-making among agents. In call centers — and especially 9-1-1 emergency call centers — these fields converge: callers abandon, agents route strategically, supervisors staff against uncertain demand, and callers with different priorities compete for scarce resources. This guide covers both fields with a focus on telephony/call-center application, and shows where Stan fits for Bayesian estimation of queue and game parameters.

## Quick Template: An M/M/c Call Center

```stan
// call_center_mmc.stan — Bayesian M/M/c arrival & service estimation
data {
  int<lower=1> N;                       // observed call records
  vector<lower=0>[N] interarrival;       // time between arrivals (min)
  vector<lower=0>[N] service_times;      // service times (min)
  int<lower=1> c;                       // number of agents
}
parameters {
  real<lower=0> lambda;                 // arrival rate (calls/min)
  real<lower=0> mu;                     // service rate (calls/min/agent)
}
model {
  // Priors
  lambda ~ gamma(2, 10);
  mu ~ gamma(2, 5);

  // Likelihood: exponential interarrival & service times
  interarrival ~ exponential(lambda);
  service_times ~ exponential(mu);
}
generated quantities {
  real rho = lambda / (mu * c);         // server utilization
  real p0;                              // P(no calls in system)
  real pw;                              // Erlang C: P(wait)
  {
    real sum_term = 0;
    for (k in 0:(c - 1)) {
      sum_term += pow(lambda / mu, k) / tgamma(k + 1);
    }
    real erlang_c_denom = sum_term
      + pow(lambda / mu, c) / (tgamma(c + 1) * (1 - rho));
    p0 = 1.0 / erlang_c_denom;
    pw = (pow(lambda / mu, c) / (tgamma(c + 1) * (1 - rho))) * p0;
  }
}
```

## Queueing Theory Fundamentals

### 1. The Kendall Notation (A/B/s)

Every queue is classified as **A/B/s** (plus optional modifiers):

| Symbol | Position | Options |
|--------|----------|---------|
| **A** | Arrival process | `M` = Markov (Poisson), `D` = Deterministic, `G` = General |
| **B** | Service process | `M` = Markov (Exponential), `D` = Deterministic, `G` = General, `H` = Hyperexponential |
| **s** | Servers | integer (1, 2, c, ...) |
| **K** | System capacity (optional) | integer or ∞ |
| **N** | Population size (optional) | integer or ∞ |

**Examples:**
- `M/M/1` — Poisson arrivals, exponential service, 1 server (textbook baseline)
- `M/M/c` — Poisson arrivals, exponential service, c servers (call center standard)
- `M/M/c/c` — loss system: blocked calls leave immediately (no waiting)
- `M/M/∞` — infinite servers (all calls answered instantly)
- `M/G/1` — general service times (Pollaczek–Khinchine formula)
- `M/M/c + GI` — c servers + general abandonment (call center model)
- `M/M/c/K` — finite buffer (callers get busy signal after K)

### 2. Core Performance Metrics

For **M/M/1** (single server):

```
ρ = λ / μ                    # utilization (must be < 1 for stability)
L = ρ / (1 - ρ)              # avg number in system
Lq = ρ² / (1 - ρ)            # avg number in queue
W = 1 / (μ - λ)              # avg time in system (Little's Law: W = L/λ)
Wq = ρ / (μ - λ)             # avg wait in queue (Wq = Lq/λ)
P0 = 1 - ρ                   # P(system empty)
P(W > t) = ρ · e^(-μ(1-ρ)t)  # P(wait > t) — Erlang delay formula
```

For **M/M/c** (multi-server):

```
ρ = λ / (cμ)                       # server utilization (must be < 1)

# Erlang C formula: P(wait > 0)
a = λ / μ                           # offered load (Erlangs)
P0 = [Σ(k=0 to c-1) a^k/k! + a^c/(c!(1-ρ))]^-1
Pw = [a^c/(c!(1-ρ))] · P0           # P(call waits)

# Key metrics
Lq = Pw · ρ / (1 - ρ)              # avg queue length
Wq = Lq / λ                         # avg wait in queue
W  = Wq + 1/μ                       # avg time in system
P(W > t) = Pw · e^(-(cμ-λ)t)       # P(wait > t)
```

### 3. Erlang Formulas (Call Center Workhorse)

| Formula | Use case | Input |
|---------|----------|-------|
| **Erlang B (Erlang loss)** | No queue: blocked calls leave | a (offered load), c (servers) |
| **Erlang C** | Queue with patience (infinite) | a, c |
| **Erlang A** | Queue with abandonment (finite patience) | a, c, A (patience) |
| **Erlang R** | Time-to-abandon distribution | a, c, A |
| **Erlang X** | Extended: retrials, prioritization | various |

```python
# Erlang B — probability of blocking (no queue)
import math

def erlang_b(a, c):
    """a = offered load (Erlangs), c = servers. Returns P(blocked)."""
    inv_b = 1.0
    for k in range(1, c + 1):
        inv_b = 1.0 + inv_b * k / a
    return 1.0 / inv_b

# Erlang C — probability of waiting
def erlang_c(a, c):
    """Returns P(wait > 0) for M/M/c queue."""
    rho = a / c
    if rho >= 1:
        return 1.0
    sum_term = sum(a**k / math.factorial(k) for k in range(c))
    tail = a**c / (math.factorial(c) * (1 - rho))
    return tail / (sum_term + tail)

# Erlang A (Palm) — with abandonment
def erlang_a(a, c, A):
    """a = offered load, c = servers, A = avg patience (min).
    Returns P(wait > 0) with abandonment."""
    rho = a / c
    if rho >= 1:
        return 1.0
    # Approximation: Erlang C adjusted for abandonment
    # (Brown et al. 2005 approximation)
    w0 = erlang_c(a, c) * (1 - rho) / (a * (1 - (1 - rho) * math.exp(-rho * (1 - rho) / A * (1 / (1 - rho)))))  # simplified
    # More accurate: use fixed-point iteration
    e_c = erlang_c(a, c)
    # Effective patience adjustment
    return e_c  # placeholder — use callcenterlib or R queueing package for exact

# Example
a = 8.0   # 8 Erlangs of offered load
c = 10    # 10 agents
print(f"Erlang B (a={a}, c={c}): {erlang_b(a, c):.4f}")
print(f"Erlang C (a={a}, c={c}): {erlang_c(a, c):.4f}")
```

### 4. Little's Law

```
L = λ · W

# The universal queueing identity:
# Average number in system = Arrival rate × Average time in system
# Applies to ANY stable queue (no distributional assumptions)

# Useful derivations:
Lq = λ · Wq              # queue length = rate × queue wait
N_agents = λ · AHT        # agents needed = rate × avg handle time
```

### 5. Queueing Network Models

```python
# Jackson Network — open network of M/M/1 queues
# Each node: arrival = external + routed from other nodes
# Product-form solution: each node behaves as independent M/M/1

# Nodes: 1 → 2 → 3, with routing probabilities
# λ_1 = λ_ext + p_31·λ_3 + p_21·λ_2  (arrival rate at node 1)
# ρ_i = λ_i / μ_i < 1  for all i

# Gordon-Newman Network — closed (finite population)
# Used for: technicians moving between jobs, agents cycling states

# Whittle Networks — for heavy traffic approximations
```

### 6. Priority Queues

```python
# Non-preemptive priority: running job finishes before switching
# M/G/1 with 2 priority classes:
#
# Wq_high = Wq0 / [(1 - ρ_high)(1 - ρ_high - ρ_low)]
# Wq_low  = Wq0 / [(1 - ρ)]
# where Wq0 = Pollaczek-Khinchine for M/G/1 without priorities

# Preemptive priority: higher priority interrupts lower
# Wq_high = Wq0 / (1 - ρ_high)
# Wq_low  = Wq0 / [(1 - ρ_high)(1 - ρ_high - ρ_low)]

# For call centers: priority classes map to:
# - 9-1-1 vs. non-emergency (preemptive or strict priority)
# - VIP vs. standard (non-preemptive)
# - Abandonment-aware priority (high-value callers first)
```

## Game Theory Fundamentals

### 1. Core Concepts

| Concept | Definition | Call Center Application |
|---------|-----------|------------------------|
| **Players** | Decision-makers | Callers, agents, supervisors, routing systems |
| **Strategies** | Action sets | Call, abandon, retry; route to skill group; staff level |
| **Payoffs** | Utility from outcomes | Wait cost, service value, agent workload, SLA compliance |
| **Nash Equilibrium** | No player can improve unilaterally | Stable routing/staffing configuration |
| **Stackelberg** | Leader-follower | Supervisor sets staffing → callers respond |
| **Bayesian Game** | Incomplete information | Agents don't know true call type/caller patience |
| **Mechanism Design** | Design the rules | Design routing/allocation rules for social optimum |

### 2. Game Types Relevant to Call Centers

#### Strategic Abandonment Game
```
Players: Callers deciding whether to wait or abandon
Strategy: Wait (remaining time) or Abandon (leave now)
Payoff: Service value - wait cost

# Each caller has type: patience θ ~ F(θ)
# Caller waits if: V - c·t ≥ 0  →  t ≤ V/c
# Abandonment time: min(θ, V/c)

# Equilibrium: abandonment rate depends on queue length
# → Erlang A emerges as equilibrium abandonment behavior
```

#### Strategic Routing Game
```
Players: Callers choosing which queue/skill group to enter
Strategy: Join queue 1, queue 2, or abandon
Payoff: -wait_time(q) + service_quality(q) - 0

# Wardrop Equilibrium (traffic assignment analogue):
# In equilibrium, all used routes have equal generalized cost
# c_1(q_1) = c_2(q_2) for all used queues

# Application: If callers can choose between "general" and
# "expert" queues, equilibrium splits traffic to equalize wait
```

#### Supervisor Staffing Game (Stackelberg)
```
Leader: Supervisor chooses staffing level c
Followers: Callers decide to call/abandon based on observed wait

# Leader payoff: -staffing_cost(c) + SLA_bonus(observed_service)
# Follower payoff: service_value - wait_cost(t)

# Supervisor anticipates caller response:
# c* = argmin [ c·wage + E[caller_abandonment(c)] ]
```

#### Agent Effort Game
```
Players: Agents choosing effort level
Strategy: e_i ∈ [0, 1] (effort)
Payoff: wage - effort_cost(e_i) + peer_effect(e_j)

# If agents are monitored by SLA:
# e* = f(monitoring_intensity, peer_pressure, wage)
# → moral hazard problem in call centers
```

#### Bayesian Signaling Game
```
Caller knows type (true emergency vs. non-emergency)
9-1-1 dispatcher observes signal (caller's report)
Goal: Separate types efficiently (screening)

# Signaling equilibrium:
# - High-type (true emergency) signals "urgently"
# - Low-type cannot profitably mimic (cost too high)
# - Dispatcher uses signal + posterior to prioritize
```

### 3. Key Equilibrium Concepts

```python
# Nash Equilibrium
# For players i = 1..n with strategies s_i and payoffs u_i:
# u_i(s_i*, s_{-i}*) >= u_i(s_i, s_{-i}*)  for all s_i, all i
#
# No player can improve by unilaterally changing strategy.

# Bayesian Nash Equilibrium
# Players have types θ_i ~ F_i
# Strategy: s_i(θ_i) maps type → action
# u_i(s_i, s_{-i} | θ_i) >= u_i(s_i', s_{-i} | θ_i)  for all s_i', all θ_i

# Wardrop Equilibrium (continuum of players — best for call centers)
# Used when many identical callers: traffic flow / queue assignment
# Cost on each used path is equal and minimal.

# Price of Anarchy (PoA)
# Ratio of worst Nash equilibrium cost to optimal social cost
# PoA = max_{NE} cost / cost(optimal)
# Measures inefficiency of selfish routing
# For M/M/c queues with selfish callers: PoA often close to 1
```

## 9-1-1 / Emergency Call Center Special Considerations

### What Makes 9-1-1 Different

| Standard Call Center | 9-1-1 Emergency Center |
|---------------------|----------------------|
| Service level target (e.g., 80% in 20s) | Answer target: 90% in 5s (NENA i3) |
| Abandonment = lost customer | Abandonment = potential lost life |
| Revenue-driven | Life-safety-driven |
| Caller patience (seconds-minutes) | Caller patience: variable, often very short |
| Uniform priority (mostly) | Strict priority tiers (Level 1 vs Level 3) |
| Staffing: cost optimization | Staffing: minimum safety mandates |
| SLA = business KPI | SLA = regulatory/public safety requirement |

### Priority Structure (NENA / APCO Standards)

```python
# Typical 9-1-1 priority levels:
PRIORITY = {
    "P1": "Immediate threat to life (active emergency, violence, medical)",
    "P2": "Urgent — potential threat, police needed soon",
    "P3": "Non-urgent — report, information, delayed response ok",
    "P4": "Administrative — non-emergency line, callback, telematics"
}

# Queue discipline for 9-1-1:
# 1. Strict priority (not just preference)
# 2. P1 preempts or is answered before ALL P2+ calls
# 3. Within P1: FIFO by arrival time (or by location severity)
# 4. Abandonment triggers: automatic callback + supervisor alert
# 5. Overflow: mutual aid, neighboring PSAPs, backup centers
```

### Queueing Model for 9-1-1

```
M/M/c with:
  - Multiple priority classes (P1, P2, P3)
  - Abandonment (Erlang A per class)
  - Skill-based routing (different call types need different agents)
  - Overflow to neighboring PSAPs (network of queues)
  - Bursty arrivals (accidents, storms → not Poisson; use MMPP)

Arrival process:
  - Baseline: Poisson (M)
  - Incidents: Markov-Modulated Poisson Process (MMPP)
  - Spikes: Hawkes process (self-exciting — accident causes more calls)
  - Daily/weekly patterns: non-homogeneous Poisson

Service process:
  - Generally not exponential (log-normal or Weibull)
  - Varies by call type (medical dispatch vs. noise complaint)
  - M/G/c or M/G/c + GI abandonment
```

```stan
// psap_priority.stan — Bayesian priority queue model for 9-1-1
data {
  int<lower=1> N;                         // observed calls
  int<lower=1> P;                         // priority levels
  array[N] int<lower=1, upper=P> priority;
  vector<lower=0>[N] wait_time;           // observed wait (min)
  vector<lower=0>[N] service_time;        // service duration (min)
  array[N] int<lower=0, upper=1> abandoned; // 1 = abandoned before answer
  int<lower=1> c;                         // total agents
}
parameters {
  vector<lower=0>[P] lambda;              // arrival rate per priority
  real<lower=0> mu;                       // base service rate
  vector<lower=0>[P] patience_scale;      // avg patience per priority
  vector<lower=-2, upper=2>[P] service_adj; // service time modifier
}
model {
  // Priors
  lambda ~ gamma(2, 10);
  mu ~ gamma(2, 5);
  patience_scale ~ lognormal(0, 1);       // minutes
  service_adj ~ normal(0, 0.5);

  // Likelihood: wait times (conditional on not abandoning)
  for (n in 1:N) {
    real eff_mu = mu * exp(service_adj[priority[n]]);
    if (abandoned[n] == 0) {
      // Answered: exponential wait (simplified M/M/c)
      wait_time[n] ~ exponential(eff_mu * c);
      service_time[n] ~ exponential(eff_mu);
    } else {
      // Abandoned: censored at patience threshold
      wait_time[n] ~ exponential(eff_mu * c);
      // (real model would use proper Erlang-A likelihood)
    }
  }
}
generated quantities {
  real<lower=0, upper=1>[] sl_answer_5s;   // P(answered in 5s) per priority
  for (p in 1:P) {
    sl_answer_5s[p] = 1 - exp(-mu * c * exp(service_adj[p]) * (5.0/60.0));
  }
}
```

### Call Center Network Model (Multiple PSAPs)

```
                    ┌──────────────┐
  Callers ──────→   │  PSAP 1      │ ──overflow──→ ┌──────────────┐
       │            │  (primary)   │               │  PSAP 2      │
       │            └──────────────┘ ←──overflow───│  (backup)    │
       │                                            └──────────────┘
       │            ┌──────────────┐
       └────────→   │  PSAP 3      │ ←── mutual aid
                    │  (regional)  │
                    └──────────────┘

# Jackson-network approximation:
# Each PSAP is an M/M/c queue
# Overflow follows routing probabilities p_ij
# Equilibrium: λ_i = λ_i_ext + Σ_j λ_j · p_ji

# Game-theoretic routing:
# Callers (or auto-routing) choose PSAP to minimize:
# c_i = wait_time_i + overflow_penalty_i
# Wardrop equilibrium: all used PSAPs have equal c_i
```

## Stan Applications in Queueing & Game Theory

### 1. Estimating Queue Parameters (Bayesian)

```stan
// arrivals.stan — Bayesian estimation of arrival & service rates
data {
  int<lower=1> N;
  vector<lower=0>[N] interarrival;
  vector<lower=0>[N] service;
}
parameters {
  real<lower=0> lambda;         // arrival rate
  real<lower=0> mu;             // service rate
  real<lower=1> arrival_shape;  // shape=1 → exponential; >1 → Erlang
  real<lower=1> service_shape;
}
model {
  lambda ~ gamma(2, 10);
  mu ~ gamma(2, 5);
  arrival_shape ~ lognormal(0, 1);
  service_shape ~ lognormal(0, 1);

  // Weibull generalizes exponential (shape=1)
  interarrival ~ weibull(arrival_shape, lambda^(-1/arrival_shape));
  service ~ weibull(service_shape, mu^(-1/service_shape));
}
generated quantities {
  real rho = lambda / mu;
  real offered_load = lambda / mu;         // Erlangs
}
```

### 2. Estimating Patience Distribution (Erlang A)

```stan
// patience.stan — infer abandonment/patience distribution
data {
  int<lower=1> N;                          // observed abandoned calls
  vector<lower=0>[N] patience_time;        // time until abandonment (min)
}
parameters {
  real<lower=0> patience_mean;             // mean patience
  real<lower=0.5> patience_shape;          // Weibull shape
}
model {
  patience_mean ~ lognormal(0, 1);
  patience_shape ~ lognormal(0, 0.5);

  // Weibull patience distribution
  patience_time ~ weibull(patience_shape,
                          patience_mean / tgamma(1 + 1.0 / patience_shape));
}
generated quantities {
  real p_abandon_30s = 1 - exp(-pow(30.0 / 60.0 / (patience_mean /
                        tgamma(1 + 1.0 / patience_shape)),
                        patience_shape));
}
```

### 3. Bayesian A/B Test for Routing Strategies

```stan
// routing_ab.stan — compare two routing policies
data {
  int<lower=1> N_A;
  int<lower=1> N_B;
  vector<lower=0>[N_A] wait_A;             // policy A wait times
  vector<lower=0>[N_B] wait_B;             // policy B wait times
}
parameters {
  real<lower=0> mu_A;
  real<lower=0> mu_B;
  real<lower=0> sigma_A;
  real<lower=0> sigma_B;
}
model {
  mu_A ~ normal(0, 5);
  mu_B ~ normal(0, 5);
  sigma_A ~ exponential(1);
  sigma_B ~ exponential(1);

  wait_A ~ lognormal(log(mu_A), sigma_A);
  wait_B ~ lognormal(log(mu_B), sigma_B);
}
generated quantities {
  real prob_B_better = mu_B < mu_A;        // P(B has lower mean wait)
  real ratio = mu_B / mu_A;                // wait time ratio
}
```

### 4. Staffing Optimization (Bayesian)

```stan
// staffing.stan — optimal agents given service-level target
data {
  int<lower=1> N;
  vector<lower=0>[N] interarrival;
  vector<lower=0>[N] service;
  real<lower=0> target_answer_prob;        // e.g., 0.90
  real<lower=0> target_seconds;            // e.g., 5 seconds
}
parameters {
  real<lower=0> lambda;
  real<lower=0> mu;
}
model {
  lambda ~ gamma(2, 10);
  mu ~ gamma(2, 5);
  interarrival ~ exponential(lambda);
  service ~ exponential(mu);
}
generated quantities {
  // Evaluate staffing levels 1..30
  array[30] real sl;                       // service level at each c
  int optimal_c = 1;
  real rho;
  for (c in 1:30) {
    rho = lambda / (mu * c);
    if (rho < 1) {
      // Erlang C based P(wait > t)
      real a = lambda / mu;
      real sum_term = 0;
      for (k in 0:(c - 1)) {
        sum_term += pow(a, k) / tgamma(k + 1);
      }
      real pw = (pow(a, c) / (tgamma(c + 1) * (1 - rho)))
                / (sum_term + pow(a, c) / (tgamma(c + 1) * (1 - rho)));
      sl[c] = 1 - pw * exp(-(c * mu - lambda) * (target_seconds / 60.0));
    } else {
      sl[c] = 0;
    }
    if (sl[c] >= target_answer_prob && optimal_c == 1) {
      optimal_c = c;
    }
  }
}
```

### 5. Game-Theoretic: Bayesian Signaling for Emergency Triage

```stan
// triage_signaling.stan — separate true emergencies from non-emergencies
data {
  int<lower=1> N;
  array[N] int<lower=0, upper=1> is_true_emergency;  // ground truth (retrospective)
  vector[N] caller_report_score;                      // dispatcher's assessment 0-1
  vector[N] dispatch_time;                            // time to dispatch (min)
  array[N] int<lower=0, upper=1> bad_outcome;         // adverse outcome
}
parameters {
  real alpha_emergency;              // baseline report score for true emergencies
  real alpha_non;                    // baseline for non-emergencies
  real<lower=0> sigma_emergency;
  real<lower=0> sigma_non;
  real<lower=0, upper=1> sensitivity; // P(dispatch | true emergency)
  real<lower=0, upper=1> specificity; // P(no dispatch | non-emergency)
}
model {
  alpha_emergency ~ normal(0.7, 0.2);
  alpha_non ~ normal(0.3, 0.2);
  sigma_emergency ~ exponential(2);
  sigma_non ~ exponential(2);
  sensitivity ~ beta(8, 2);          // prior: ~80% sensitivity
  specificity ~ beta(7, 3);          // prior: ~70% specificity

  for (n in 1:N) {
    if (is_true_emergency[n] == 1) {
      caller_report_score[n] ~ normal(alpha_emergency, sigma_emergency);
    } else {
      caller_report_score[n] ~ normal(alpha_non, sigma_non);
    }
  }
}
generated quantities {
  // Classification performance
  real auc_approx =Phi(
    (alpha_emergency - alpha_non) /
    sqrt(square(sigma_emergency) + square(sigma_non))
  );
}
```

## Practical Workflows

### Erlang Staffing Calculation (Python)

```python
import math
from scipy.optimize import brentq

def erlang_c_prob(a, c):
    """Probability a call waits (Erlang C)."""
    if a / c >= 1:
        return 1.0
    s = sum(a**k / math.factorial(k) for k in range(c))
    t = a**c / (math.factorial(c) * (1 - a/c))
    return t / (s + t)

def service_level(a, c, target_sec, aht_sec):
    """P(answered within target_sec)."""
    rho = a / c
    if rho >= 1:
        return 0.0
    pw = erlang_c_prob(a, c)
    return 1 - pw * math.exp(-(c - a) * (target_sec / aht_sec))

def find_agents(offered_load, target_sl, target_sec, aht_sec, max_c=200):
    """Smallest c meeting service level target."""
    for c in range(1, max_c + 1):
        if service_level(offered_load, c, target_sec, aht_sec) >= target_sl:
            return c
    return None

# Example: 9-1-1 center
offered_load = 12.0    # 12 Erlangs
target_sl = 0.90       # 90% answered
target_sec = 5         # within 5 seconds
aht_sec = 180          # 3 minutes average handle time

agents = find_agents(offered_load, target_sl, target_sec, aht_sec)
print(f"Agents needed: {agents}")
print(f"Service level: {service_level(offered_load, agents, target_sec, aht_sec):.4f}")
print(f"Utilization: {offered_load / agents:.4f}")
```

### Queue Simulation (Python)

```python
import heapq
import random
from dataclasses import dataclass, field
from typing import List

@dataclass(order=True)
class Call:
    arrival_time: float
    priority: int = field(compare=False)        # 1 = highest
    service_time: float = field(compare=False)
    id: int = field(compare=False)

    def __lt__(self, other):
        # Priority first, then FIFO within priority
        if self.priority != other.priority:
            return self.priority < other.priority
        return self.arrival_time < other.arrival_time

class CallCenterSim:
    def __init__(self, num_agents, arrival_rate, mean_service,
                 mean_patience=None, num_priorities=3, seed=42):
        self.c = num_agents
        self.arrival_rate = arrival_rate
        self.mean_service = mean_service
        self.mean_patience = mean_patience
        self.num_priorities = num_priorities
        self.rng = random.Random(seed)
        self.queue: List[Call] = []
        self.agents_free = num_agents
        self.stats = {"answered": 0, "abandoned": 0,
                      "total_wait": 0, "by_priority": {}}

    def simulate(self, duration=8 * 3600):       # 8-hour shift in seconds
        t = 0
        call_id = 0
        events = []                               # (time, type, call)

        # Schedule arrivals
        while t < duration:
            t += self.rng.expovariate(self.arrival_rate)
            prio = self.rng.choices(
                range(1, self.num_priorities + 1),
                weights=[0.3, 0.4, 0.3]           # P1, P2, P3 mix
            )[0]
            service = self.rng.expovariate(1.0 / self.mean_service)
            call = Call(t, prio, service, call_id)
            events.append((t, "arrival", call))
            call_id += 1

        events.sort()

        # Process events (discrete-event simulation)
        # ... (simplified: track wait times and abandonment)

        return self.stats
```

### Game-Theoretic Routing Simulation (Python)

```python
import numpy as np
from scipy.optimize import minimize_scalar

# Wardrop Equilibrium for two-queue routing
# Cost function: c_i(q_i) = base_i + alpha * q_i^2
# (increasing cost = congestion)

def wardrop_two_queue(total_arrivals, base1, base2, alpha=0.1):
    """Find equilibrium split between two queues."""
    # In Wardrop equilibrium: c_1(q_1) = c_2(q_2), q_1 + q_2 = total
    def cost_diff(q1):
        q2 = total_arrivals - q1
        c1 = base1 + alpha * q1**2
        c2 = base2 + alpha * q2**2
        return c1 - c2

    # Solve for q1 where costs equalize
    from scipy.optimize import brentq
    q1_eq = brentq(cost_diff, 0.01, total_arrivals - 0.01)
    q2_eq = total_arrivals - q1_eq
    c1 = base1 + alpha * q1_eq**2
    c2 = base2 + alpha * q2_eq**2

    return {
        "q1": q1_eq, "q2": q2_eq,
        "cost1": c1, "cost2": c2,
        "equal_cost": abs(c1 - c2) < 1e-6
    }

# Find social optimum (minimize total cost)
def social_optimum(total_arrivals, base1, base2, alpha=0.1):
    def total_cost(q1):
        q2 = total_arrivals - q1
        return (base1 + alpha * q1**2) * q1 + (base2 + alpha * q2**2) * q2

    res = minimize_scalar(total_cost, bounds=(0, total_arrivals), method="bounded")
    return {"q1": res.x, "q2": total_arrivals - res.x, "total_cost": res.fun}

# Compare
total = 100
eq = wardrop_two_queue(total, base1=5, base2=8)
opt = social_optimum(total, base1=5, base2=8)

eq_cost = (eq["cost1"] * eq["q1"] + eq["cost2"] * eq["q2"])
print(f"Equilibrium: q1={eq['q1']:.1f}, q2={eq['q2']:.1f}, total_cost={eq_cost:.1f}")
print(f"Optimum:     q1={opt['q1']:.1f}, q2={opt['q2']:.1f}, total_cost={opt['total_cost']:.1f}")
print(f"Price of Anarchy: {eq_cost / opt['total_cost']:.4f}")
```

## Common Applications

### Call Center Applications
- **Staffing** — Erlang C/A for agent counts per interval
- **Service Level Prediction** — Forecast SLA before shift starts
- **Abandonment Modeling** — Erlang A, patience distributions
- **Skill-Based Routing** — Match call type to agent skill (queueing network)
- **Overflow Design** — Neighboring PSAP routing, callback systems
- **Workforce Management** — Forecast → schedule → adherence
- **SLA Compliance** — Real-time monitoring vs. targets

### 9-1-1 Specific Applications
- **Priority Dispatch** — Multi-level priority queues with preemption
- **Burst Modeling** — MMPP/Hawkes for incident-driven arrival spikes
- **Mutual Aid** — Network of PSAPs with overflow protocols
- **Callback Systems** — Abandoned calls trigger automatic retry/callback
- **Capacity Planning** — Minimum staffing mandates, surge capacity
- **Performance Auditing** — Post-incident analysis of wait/dispatch times

### Game-Theoretic Applications
- **Caller Behavior** — Strategic abandonment under congestion
- **Routing Games** — Wardrop equilibrium for multi-queue assignment
- **Incentive Design** — SLA mechanisms that align agent/supervisor goals
- **Triage Signaling** — Bayesian screening of emergency vs. non-emergency
- **Contract Design** — Agent effort incentives (principal-agent)
- **Mechanism Design** — Auction-based dispatch for non-urgent calls

## Key References

### Queueing Theory
- **[Queueing Networks and Markov Chains](https://www.wiley.com/en-us/Queueing+Networks+and+Markov+Chains-p-9780471193687)** — Bolch et al.
- **[Introduction to Queueing Theory](https://www.routledge.com/Introduction-to-Queueing-Theory/Bhat/p/book/9780849384387)** — Bhat
- **[Applied Probability and Queues](https://www.springer.com/gp/book/9780387000091)** — Asmussen
- **[Performance Modeling and Design of Computer Systems](https://www.cs.cmu.edu/~harchol/PerformanceModeling/)** — Harchol-Balter (free online)

### Call Center Queueing
- **[Call Centers with Recall](https://link.springer.com/book/10.1007/978-1-4614-8809-9)** — Avenali et al.
- **[Efficient Customer Activation](https://www.researchgate.net/publication/227455433)** — Akiya et al.
- **[The Queueing Guide](http://dimacs.rutgers.edu/~gurvich/queueing/)** — Google's call center queueing papers
- **[Brown et al. (2005) — The Telephone Call Center](https://pubsonline.informs.org/doi/10.1287/orms.1050.0172)** — Erlang A, survey

### Game Theory
- **[Game Theory: An Introduction](https://press.princeton.edu/books/paperback/9780691174174/game-theory)** — Watson
- **[Game Theory for Applied Economists](https://press.princeton.edu/books/paperback/9780691043012/game-theory-for-applied-economists)** — Gibbons
- **[Mechanism Design](https://www.mechanism-design.org/)** — Krishna
- **[Traffic Assignment (Wardrop)](https://www.sciencedirect.com/science/article/pii/0022249652900344)** — Wardrop (1952)

### 9-1-1 / Emergency Services
- **[NENA i3 Standard](https://www.nena.org/page/NG911i3)** — Next Generation 9-1-1
- **[APCO Standards](https://www.apcointl.org/standards/)** — Public safety communications
- **[FCC 9-1-1 Rules](https://www.fcc.gov/general/911-services)** — Regulatory framework
- **[9-1-1 Reliability](https://www.fcc.gov/public-safety-and-homeland-security/9-1-1-and-universal-service)** — Reliability requirements

### Stan Applications
- **[Bayesian Data Analysis (BDA3)](https://stat.columbia.edu/gelman/bda/)** — Gelman et al.
- **[Statistical Rethinking](https://xcelab.net/rm/statistical-rethinking/)** — McElreath (has queueing examples)
- **[Stan User Guide — Time Series](https://mc-stan.org/docs/reference-guide/time-series.html)** — For arrival modeling
- **[Bayesian Workflow](https://arxiv.org/abs/2011.01808)** — Gelman et al. (2020)

### Software & Packages
- **[Erlang C Calculator](https://www.erlang.com/calculators/erlang-c/)** — Online calculator
- **[callcenterlib (Python)](https://github.com/carlosqueiroz/callcenterlib)** — Queueing metrics
- **[queueing (R)](https://cran.r-project.org/package=queueing)** — R queueing package
- **[simmer (R)](https://cran.r-project.org/package=simmer)** — Discrete-event simulation
- **[SimPy (Python)](https://simpy.readthedocs.io/)** — Discrete-event simulation
- **[CmdStan / cmdstanpy](https://mc-stan.org/cmdstanpy/)** — Bayesian estimation
- **[Axelrod (Python)](https://axelrod.readthedocs.io/)** — Game theory simulation
- **[gambit (Python/C)](http://gambitproject.org/)** — Game theory solver

## Quick Checklist

1. **Classify the queue** — A/B/s notation before choosing formulas
2. **Check stability** — ρ < 1 (arrival rate < capacity)
3. **Use Erlang C** — Standard call center baseline (no abandonment)
4. **Use Erlang A** — When callers abandon (realistic for 9-1-1)
5. **Little's Law** — L = λW is universal; use it to cross-check
6. **Model priorities** — Strict priority for 9-1-1 P1 calls
7. **Abandonment is data** — Patience distribution is a key parameter
8. **Networks for overflow** — Jackson/Wardrop for multi-PSAP systems
9. **Game theory for routing** — Wardrop equilibrium for caller decisions
10. **Bayesian estimation with Stan** — Posterior over λ, μ, patience, staffing
11. **Simulate before deploying** — SimPy/simmer for complex scenarios
12. **Check diagnostics** — Always verify ρ, ESS, R-hat in Bayesian models

---

*Last updated: 2024 | Companion to: Statistical_Modeling/01_stan.md*
