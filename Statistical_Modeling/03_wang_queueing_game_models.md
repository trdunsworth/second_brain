# Fundamentals of Queueing-Game Models — Book Companion

## Overview
*Fundamentals of Queueing-Game Models* by Jinting Wang (Springer, 2026) is the definitive monograph on queueing-game models — the intersection of queueing theory, game theory, optimization, and economics. It provides a systematic framework for analyzing strategic interactions between customers, service providers, and regulators in service systems. This page is a chapter-by-chapter companion organized to tie every concept back to emergency call centers (9-1-1 / PSAP operations).

**Book details:**
| Field | Value |
|-------|-------|
| **Title** | Fundamentals of Queueing-Game Models |
| **Author** | Jinting Wang (Central University of Finance and Economics) |
| **Publisher** | Springer Singapore |
| **Year** | 2026 |
| **Pages** | XVI + 381 (74 illustrations, 44 in color) |
| **Hardcover ISBN** | 978-981-95-0260-8 |
| **eBook ISBN** | 978-981-95-0261-5 |
| **DOI** | [10.1007/978-981-95-0261-5](https://doi.org/10.1007/978-981-95-0261-5) |
| **Series** | Mathematics and Statistics |
| **Predecessor** | 《排队博弈论基础》(The Basis of Queueing Game Theory), Science Press, 2016 (Chinese) |

---

## The Book's Framework in One Diagram

```
                    QUEUEING-GAME MODEL
                          │
          ┌───────────────┼───────────────┐
          │               │               │
      INFORMATION      INTERACTION      SYSTEM
      STRUCTURE        MECHANISMS       STRUCTURE
          │               │               │
    ┌─────┴─────┐   ┌─────┴─────┐   ┌────┴────┐
    │Observable  │   │Priority   │   │Repairable│
    │Unobservable│   │Risk-Sens. │   │Vacation  │
    │Disclosure  │   │Pricing    │   │Retrial   │
    └───────────┘   └───────────┘   └─────────┘
          │               │               │
          └───────────────┼───────────────┘
                          │
                    APPLICATIONS
              ┌───────────┼───────────┐
              │           │           │
          Wireless   Service-     Healthcare
          Comm.      Inventory     (→ 9-1-1)
```

**The three roles in every queueing-game model:**
1. **Customers** — decide to join, balk, renege, retry, or pay for priority
2. **Service Provider** — sets admission fees, capacity, information disclosure
3. **Social Planner/Regulator** — maximizes social welfare (relevant for public safety)

---

## Chapter-by-Chapter Companion with 9-1-1 Connections

### Chapter 1: Preliminaries (pp. 1–18)

**Core content:** Probability foundations, Markov chains, Poisson processes, exponential distributions, M/M/1 queue equilibrium concepts, Nash equilibrium definitions.

**Key concepts you'll use constantly:**
```
- Poisson arrivals (λ) — arrival process
- Exponential service (μ) — service times
- Utilization ρ = λ/μ — must be < 1 for stability
- Nash Equilibrium — no player improves by unilateral deviation
- Social Optimum — maximizes total welfare (may differ from Nash)
- Price of Anarchy — ratio of worst equilibrium to optimal welfare
- Threshold Strategy — join if queue length ≤ n*, balk otherwise
```

**9-1-1 tie-in:**
> The M/M/1 baseline assumes Poisson arrivals and exponential service. Emergency calls violate both (bursty arrivals, heavy-tailed service times), but the equilibrium concepts from this chapter — threshold strategies, social welfare, externalities — form the backbone of every model in the book. Your first modeling decision: *when does an arriving caller decide to hang up?* That's a threshold.

**Key equations from this chapter:**
```python
# M/M/1 stationary distribution
P(n) = (1 - ρ) · ρ^n        for n = 0, 1, 2, ...

# Expected wait in queue (M/M/1)
Wq = ρ / (μ - λ)

# Customer's expected benefit from joining when n in system:
# B(n) = R - C · E[wait | n in system]
# Join if B(n) ≥ 0 → threshold n_e = floor((R·μ - C·μ + C) / C) ... simplified

# Social benefit (externality-aware):
# S(n) = R - C · E[wait | n] - C · (external cost of delay imposed on future callers)
```

---

### Chapter 2: Observable Queueing Systems (pp. 19–35)

**Core content:** Naor's (1969) model — customers observe queue length before deciding to join or balk. Equilibrium threshold strategies, socially optimal thresholds, admission fees, revenue management.

**The foundational model:**
```
NAOR'S MODEL (1969):
- M/M/1 queue, FCFS
- Customers observe queue length n upon arrival
- Each customer: reward R from service, cost C per unit time waiting
- Strategy: join if n < n*, balk if n ≥ n*
- Equilibrium threshold: n_e = floor((R - C/μ) / C) + 1  [simplified]
- Social optimum: n* ≤ n_e  (externality: each joiner delays future callers)
- Admission fee p can bridge the gap: charge p = C·(n_e - n*)  [approx]
```

**Emergency call center connection:**

> **This is the most directly applicable chapter to 9-1-1.** In an observable queue:
> - The caller **sees** the queue (the "Estimated Wait Time" announcement, the busy signal, the callback offer)
> - The caller decides: **hang up (balk), wait, or accept callback**
> - The threshold `n_e` tells you the maximum queue length at which a caller will still wait
>
> **Critical difference for 9-1-1:** In Naor's model, balking is *rational* — the customer weighs cost vs. reward. In 9-1-1, balking can be *fatal*. The social planner's objective is NOT revenue maximization — it's minimizing adverse outcomes. This flips the model from profit to welfare.
>
> **Concrete 9-1-1 mapping:**
> - `R` = value of emergency response (potentially life-saving → very large)
> - `C` = cost per second of waiting (escalating — for medical calls, C increases with time)
> - `n` = calls in queue ahead of you
> - The observable threshold tells you: "at what queue length should we trigger overflow to neighboring PSAP?"
> - Naor's admission fee → in 9-1-1, the "fee" is the callback offer (caller waits instead of staying in queue)

```stan
// naor_threshold.stan — Bayesian estimation of caller threshold behavior
data {
  int<lower=1> N;                          // observed calls
  array[N] int<lower=0> queue_len_at_arrival; // queue length when caller arrived
  array[N] int<lower=0, upper=1> joined;      // 1 = waited, 0 = balked/hung up
  vector[N] reward_proxy;                   // call type severity (proxy for R)
}
parameters {
  real<lower=0> C;                          // caller wait cost per minute
  real<lower=0> R_scale;                    // reward scale parameter
  real<lower=0> threshold_noise;            // heterogeneity in thresholds
}
model {
  C ~ lognormal(0, 1);
  R_scale ~ lognormal(2, 1);               // high value for emergency
  threshold_noise ~ exponential(1);

  // Probabilistic threshold: join probability decreases with queue length
  // and increases with reward (call severity)
  for (n in 1:N) {
    real threshold = (reward_proxy[n] * R_scale - C) / C;
    real logit_join = (threshold - queue_len_at_arrival[n]) / threshold_noise;
    joined[n] ~ bernoulli_logit(logit_join);
  }
}
generated quantities {
  real median_threshold = (R_scale - C) / C;  // typical joining threshold
}
```

---

### Chapter 3: Unobservable Queueing Systems (pp. 37–47)

**Core content:** Edelson & Hildebrand (1975) — customers have NO queue length information. They decide based on system parameters (λ, μ) and beliefs about others' strategies. Bayesian Nash equilibrium in continuous strategies.

**Key concepts:**
```
UNOBSERVABLE QUEUE:
- Customer knows λ, μ, R, C but NOT current queue length
- Strategy: join with probability q ∈ [0, 1]
- Each customer believes others join with probability q
- Equilibrium: effective arrival rate λ_eff = λ · q
- Customer's expected wait depends on q (through λ_eff)
- Equilibrium condition: U(q*) = 0 (indifferent between joining and not)
- If R is small: q* = 0 (no one joins) — "unraveling equilibrium"
```

**Emergency call center connection:**

> **When does 9-1-1 become unobservable?**
> - **Callback system**: Caller doesn't see the queue; they're told "we'll call you back" → they decide to accept callback or hang up based on *estimated* wait
> - **IVR message**: "Estimated wait time: 5 minutes" → partial observability
> - **Overflow routing**: Caller is transferred to another PSAP and doesn't know the queue there
> - **VoIP/degraded service**: No queue visibility during network congestion
>
> **The unraveling problem is critical:** In an unobservable queue, if callers believe wait times are long, *no one joins* → queue collapses → but in 9-1-1, this means calls go unanswered. The Bayesian equilibrium here reveals a **design failure** if it unravels.
>
> **Application**: Use this chapter's models to determine when a 9-1-1 system needs to move from unobservable (callback) to observable (immediate answer) to prevent abandonment cascades.

```python
# Unobservable queue equilibrium calculation
import numpy as np
from scipy.optimize import brentq

def unobservable_equilibrium(lam, mu, R, C):
    """Find joining probability q* in unobservable M/M/1.
    
    Parameters:
        lam: arrival rate
        mu: service rate
        R: reward for service
        C: wait cost per unit time
    
    Returns:
        q: equilibrium joining probability
    """
    def expected_utility(q):
        lam_eff = lam * q
        if lam_eff >= mu:
            return -np.inf  # unstable
        Wq = lam_eff / (mu * (mu - lam_eff))  # expected queue wait
        W = 1 / (mu - lam_eff)                 # expected sojourn
        return R - C * W

    # Search for q where U(q) = 0
    try:
        q_star = brentq(expected_utility, 0.001, 0.999)
        return q_star
    except ValueError:
        # No interior equilibrium
        if expected_utility(0.001) < 0:
            return 0.0   # unraveling: no one joins
        else:
            return 1.0   # everyone joins

# Example: 9-1-1 callback system
q = unobservable_equilibrium(lam=0.5, mu=1.0, R=100, C=10)
print(f"Equilibrium joining probability: {q:.4f}")
# If q ≈ 1: callers accept callbacks (system healthy)
# If q ≈ 0: unraveling — callers hang up (system failure)
```

---

### Chapter 4: Optimal Disclosure of Information (pp. 49–78)

**Core content:** The service provider chooses what information to disclose — full queue length, partial (above/below threshold), or nothing. This is a **mechanism design** problem: the provider designs the information structure to optimize revenue or welfare.

**Key results:**
```
INFORMATION DISCLOSURE POLICIES:
1. Always disclose (fully observable) — Naor's model
2. Never disclose (fully unobservable) — Edelson-Hildebrand model
3. Threshold disclosure: disclose if n ≤ D, hide if n > D
4. Alternating observable/unobservable periods

KEY THEOREMS (from the literature reviewed):
- Informing when queue is short + hiding when long: NEVER optimal
  (Simhon et al. 2016)
- Optimal policy: inform when queue is LONG (above threshold),
  hide when short (Zhuang et al. 2018) — counterintuitive!
- Alternating structure > always observable or always unobservable
  for throughput and welfare
```

**Emergency call center connection:**

> **This chapter is the design manual for 9-1-1 queue visibility.** The critical question: *how much queue information should we give callers?*
>
> **Information disclosure options for 9-1-1:**
>
> | Disclosure Policy | What Caller Hears | Queueing-Game Effect |
> |------------------|-------------------|---------------------|
> | Full observable | "You are caller #4 in queue, est. wait: 8 min" | Callers balk if wait > threshold |
> | Full unobservable | "Please hold, your call is important" (no info) | Callers guess; may unravel |
> | Threshold | "High call volume, estimated wait > 10 min" only when congested | Partial strategic response |
> | Callback offer | "We'll call you back in ~15 min" | Caller opts into unobservable sub-queue |
> | Alternating | Observable during calm, unobservable during surge | Best of both worlds |
>
> **Counterintuitive result applied to 9-1-1:** The optimal policy often says *hide information when the queue is short, reveal when it's long*. Why? When the queue is short, revealing "only 1 caller ahead" causes overconfidence → more 9-1-1 misuse (non-emergency calls). When the queue is long, revealing the wait helps callers decide to use alternatives (non-emergency line, self-transport).
>
> **The social planner vs. service provider tension:** In 9-1-1, the "provider" (PSAP) wants to maximize answered calls (throughput), but the "social planner" (public safety agency) wants to maximize life outcomes. Information disclosure serves different objectives — the book's framework lets you formalize this.

```stan
// disclosure_policy.stan — Bayesian model for optimal information disclosure
data {
  int<lower=1> N;
  array[N] int<lower=0> queue_len;         // queue length at decision point
  array[N] int<lower=0, upper=1> disclosed; // 1 = queue info given to caller
  array[N] int<lower=0, upper=1> stayed;    // 1 = caller stayed (didn't hang up)
  vector[N] call_severity;                  // 1-10 severity score
}
parameters {
  real alpha_disclosed;    // effect of disclosure on stay probability
  real alpha_severity;     // effect of severity on stay probability
  real alpha_queue;        // effect of queue length on stay probability
  real<lower=0> threshold; // optimal disclosure threshold
}
model {
  alpha_disclosed ~ normal(0, 1);
  alpha_severity ~ normal(1, 0.5);     // severity increases willingness to stay
  alpha_queue ~ normal(-0.5, 0.3);     // longer queue decreases willingness
  threshold ~ exponential(0.5);

  for (n in 1:N) {
    real logit_p = alpha_disclosed * disclosed[n]
                 + alpha_severity * call_severity[n]
                 + alpha_queue * queue_len[n];
    stayed[n] ~ bernoulli_logit(logit_p);
  }
}
generated quantities {
  // Optimal threshold: disclose when queue > threshold
  int optimal_disclosure_threshold = ceil(threshold);
}
```

---

### Chapter 5: Risk-Sensitive Queueing Game (pp. 79–108)

**Core content:** Customers are NOT risk-neutral — they may be risk-averse or risk-seeking under uncertain wait times. Models include exponential utility, mean-variance tradeoffs, and prospect theory.

**Key concepts:**
```
RISK-SENSITIVE CUSTOMERS:
- Risk-neutral: maximize E[R - C·W]
- Risk-averse: maximize E[U(R - C·W)] where U is concave
  → dislikes uncertainty in wait times more than expected wait
- Risk-seeking: U is convex
  → may join long queues for chance of short wait

Guo & Zipkin (2007): delay-risk sensitivity parameter
- γ = 0: risk-neutral
- γ > 0: risk-averse (penalize variance in wait)
- γ < 0: risk-seeking
```

**Emergency call center connection:**

> **9-1-1 callers are overwhelmingly risk-averse**, and asymmetrically so:
>
> - A parent calling for a child in cardiac arrest is **extremely risk-averse** — they can't tolerate uncertainty about wait time
> - A noise complaint caller is **risk-neutral or mildly risk-averse** — they'll accept some uncertainty
>
> **This chapter's models explain:**
> 1. **Why estimated wait times matter even when inaccurate** — risk-averse callers value *certainty* of knowing the wait, not just the expected wait
> 2. **Why non-emergency callers use 9-1-1** — risk-seeking behavior: "the ER might be faster"
> 3. **Why callback systems fail for high-severity calls** — risk-averse callers reject uncertain callback timing
>
> **The key insight for 9-1-1 design:** Displaying "Estimated wait: 5 ± 1 min" (with confidence interval) serves risk-averse callers better than "Estimated wait: 5 min" (point estimate). The *variance* of the wait estimate affects behavior, not just the mean.

```stan
// risk_sensitive.stan — Estimate caller risk preference
data {
  int<lower=1> N;
  vector[N] observed_wait;          // actual wait experienced (min)
  vector[N] estimated_wait;         // wait estimate given to caller (min)
  vector[N] wait_variance;          // variance of the estimate
  array[N] int<lower=0, upper=1> accepted_callback; // 1 = accepted callback offer
  vector[N] severity;               // call severity 1-10
}
parameters {
  real alpha;                        // base acceptance
  real beta_wait;                    // effect of expected wait
  real<lower=0> beta_risk;           // risk aversion parameter (γ)
  real beta_severity;
}
model {
  alpha ~ normal(0, 1);
  beta_wait ~ normal(-1, 0.5);       // longer wait → less likely to accept
  beta_risk ~ exponential(1);        // positive = risk averse
  beta_severity ~ normal(0.5, 0.5);

  for (n in 1:N) {
    // Utility = alpha - beta_wait * E[W] - beta_risk * Var[W] + beta_severity * severity
    real u = alpha
           - beta_wait * estimated_wait[n]
           - beta_risk * wait_variance[n]
           + beta_severity * severity[n];
    accepted_callback[n] ~ bernoulli_logit(u);
  }
}
generated quantities {
  // Risk-averse callers: how much extra wait would they accept for certainty?
  real certainty_equivalent_gap = beta_risk / beta_wait;
}
```

---

### Chapter 6: Queueing Games with Priority (pp. 109–152)

**Core content:** Customers can purchase or earn priority. Preemptive vs. non-preemptive priority, priority purchase games, dynamic priority allocation, equilibrium under priority classes.

**Key concepts:**
```
PRIORITY QUEUEING-GAME:
- Customers choose: pay for priority or accept standard service
- Preemptive: high priority interrupts running service
- Non-preemptive: high priority waits for current service to finish
- Equilibrium: customers pay for priority iff wait savings > price
- Socially optimal priority: allocate to maximize total welfare

Key results:
- Equilibrium priority purchase often exceeds social optimum
  (too many buy priority → priority class congested)
- Admission fee for priority = Pigouvian tax on externality
```

**Emergency call center connection:**

> **This is THE chapter for 9-1-1 priority design.** Priority is the defining feature of emergency call handling.
>
> **Priority mechanisms in 9-1-1:**
>
> | Mechanism | Queueing-Game Analogue | Notes |
> |-----------|----------------------|-------|
> | P1-P4 priority levels | Exogenous priority classes | Set by call type, not caller choice |
> | VIP/administrative lines | Purchased priority | Paid priority (internal) |
> | EMD (Emergency Medical Dispatch) triage | Endogenous priority | Dispatcher-assigned priority |
> | Skill-based routing | Priority by agent capability | Not priority per se, but resource matching |
> | Callback for P3/P4 | Priority demotion | Non-urgent calls pushed to lower tier |
>
> **The critical game:** In 9-1-1, priority is NOT purchasable by callers — it's assigned by dispatchers based on triage. This is actually a **screening mechanism** (signaling game) rather than a priority purchase game. However:
>
> - **Misuse = strategic priority inflation**: Callers who know the system may overstate severity to get higher priority (they've learned the equilibrium)
> - **Dispatcher triage = mechanism design**: The dispatcher's scoring system is a mechanism that should separate true emergencies from non-emergences
> - **The book's priority purchase model** explains why: if priority were purchasable (like fast-pass), it would be over-purchased relative to social optimum
>
> **Preemptive vs. non-preemptive for 9-1-1:** P1 calls should preempt P2/P3 — but preemption in call centers means interrupting an in-progress call, which is operationally complex. Most PSAPs use non-preemptive priority with strict queue ordering.

```stan
// priority_triage.stan — Bayesian triage scoring (dispatcher priority assignment)
data {
  int<lower=1> N;
  int<lower=1> K;                       // number of triage features
  matrix[N, K] triage_features;         // dispatcher assessment features
  array[N] int<lower=1, upper=4> assigned_priority;  // P1-P4 assigned
  array[N] int<lower=0, upper=1> adverse_outcome;    // retrospective: bad outcome
}
parameters {
  matrix[K, 3] beta;                    // priority thresholds (3 cutpoints for 4 levels)
  real<lower=0> sigma;
}
model {
  to_vector(beta) ~ normal(0, 1);

  // Ordered logit for priority assignment
  for (n in 1:N) {
    real eta = dot_product(triage_features[n], beta[, assigned_priority[n] == 1 ? 1 :
                                                    assigned_priority[n] == 2 ? 2 :
                                                    assigned_priority[n] == 3 ? 3 : 3]);
    // Simplified: use cumulative logit
    assigned_priority[n] ~ ordered_logistic(eta, beta[, 1]);  // placeholder structure
  }
}
generated quantities {
  // Sensitivity: P(P1 | true emergency) — should be ~1.0
  // Specificity: P(not P1 | non-emergency) — should be high
}
```

---

### Chapter 7: Repairable Queueing Systems (pp. 153–174)

**Core content:** Servers can break down and require repair. Strategic behavior of customers when server reliability is uncertain. Queueing with breakdowns, repairs, and customer balking.

**Key concepts:**
```
REPAIRABLE QUEUE:
- Server alternates between up (serving) and down (under repair)
- Repair rate: r (server fixed at rate r)
- Breakdown rate: α (when up)
- During breakdown: customers may balk, renege, or wait
- Customer knows server state? (observable vs. unobservable breakdown)
- Equilibrium: threshold depends on breakdown probability
```

**Emergency call center connection:**

> **Server reliability in 9-1-1 takes multiple forms:**
>
> | "Server breakdown" | Meaning | Repair process |
> |-------------------|---------|----------------|
> | Agent workstation failure | Computer/phone system crash | IT repair / restart |
> | CAD system outage | Computer-Aided Dispatch unavailable | Backup paper procedures |
> | Trunk failure | T-1/E-1 line to carrier fails | Telecom repair (minutes-hours) |
> | Network outage | PSAP loses connectivity to ESB/IoT | Failover to backup center |
> | Agent unavailability | Agent on break, after-call work, training | Schedule management |
>
> **The queueing-game insight:** When the "server" is unreliable, callers face **uncertainty about service availability**, not just wait time. The book's models show:
>
> - If callers KNOW the server is down (observable breakdown), they balk immediately → no queue builds
> - If callers DON'T know (unobservable breakdown), they join and wait → queue builds during outage → wasted capacity when server recovers
>
> **For 9-1-1:** This argues for **immediate, honest disclosure** of system status. If a PSAP is degraded, telling callers "we are experiencing technical difficulties, please hold" (observable breakdown) is better than silence (unobservable breakdown) — because silence leads to queue buildup that delays recovery.
>
> **The repairable model also covers agent availability:** An agent going on break IS a server breakdown from the queue's perspective. The book's framework lets you model break scheduling as a game between agents (who want breaks) and supervisors (who want coverage).

```python
# Repairable queue: effective service rate
def repairable_effective_rate(mu, alpha, r):
    """Effective service rate for a repairable M/M/1 queue.
    
    mu: service rate when up
    alpha: breakdown rate (when up)
    r: repair rate (when down)
    
    Availability A = r / (alpha + r)
    Effective rate: mu_eff = mu * A
    """
    availability = r / (alpha + r)
    mu_eff = mu * availability
    rho = 1 / mu_eff if mu_eff > 0 else float('inf')
    return {"availability": availability, "mu_eff": mu_eff, "rho": rho}

# Example: PSAP with 99.9% availability target
result = repairable_effective_rate(mu=1/5,  # 5 min avg call
                                    alpha=0.01,  # breakdown every ~100 min
                                    r=0.5)       # repair in ~2 min
print(f"Availability: {result['availability']:.4f}")
print(f"Effective service rate: {result['mu_eff']:.4f}")
```

---

### Chapter 8: Vacation Queueing Systems (pp. 175–228)

**Core content:** Server takes "vacations" — periodic breaks from serving the queue. Exhaustive vs. gated service, multiple vacations, working vacations (server serves at reduced rate during vacation), and strategic customer behavior around vacation periods.

**Key concepts:**
```
VACATION QUEUE:
- Server takes vacation after serving N customers, or periodically
- During vacation: no service (or reduced service rate)
- Exhaustive: serve all waiting customers before vacation
- Gated: serve only those present when service starts
- Multiple vacations: repeated vacations until queue empties
- Working vacation: serve at reduced rate μ' < μ during vacation
- Strategic: customers learn vacation schedule and time arrivals
```

**Emergency call center connection:**

> **Vacations in 9-1-1 = agent breaks, shift changes, and training periods.**
>
> | Vacation Type | 9-1-1 Analogue | Model Feature |
> |--------------|----------------|---------------|
> | Exhaustive vacation | Agent takes break only when queue is empty | Ideal but rare |
> | Gated vacation | Agent takes break at scheduled time regardless | Common (scheduled breaks) |
> | Multiple vacation | Agent on break until queue empties | Uncommon |
> | Working vacation | Agent handles lower-priority calls during break | Common (P3/P4 during wrap-up) |
> | Server-initiated | Supervisor pulls agent for training/ad hoc | Random vacations |
>
> **The strategic game around vacations:**
> - If callers KNOW the break schedule, they'll avoid calling during breaks (unobservable → observable shift)
> - If agents KNOW the call pattern, they'll time breaks for low-volume periods
> - The supervisor designs the break schedule to balance welfare vs. coverage
>
> **Working vacations are particularly relevant:** An agent doing after-call work (ACW) or documentation IS on a "working vacation" — they're technically available for new calls but at reduced capacity. The book's working vacation models directly apply.
>
> **The scheduling game:** Agents choose break times → affects queue length → affects service level → supervisor penalizes agents for SLA violations → agents adjust break times. This is a Stackelberg game: supervisor sets rules (leader), agents respond (followers).

```stan
// vacation_schedule.stan — Model service level under break schedules
data {
  int<lower=1> N_intervals;              // time intervals in shift
  vector<lower=0>[N_intervals] arrival_rate;
  array[N_intervals] int<lower=0> agents_available; // after breaks
  vector<lower=0>[N_intervals] mean_service_time;
  vector<lower=0, upper=1>[N_intervals] observed_sl; // observed service level
}
parameters {
  real<lower=0> target_sl;               // target service level
  real<lower=0> sl_sensitivity;          // how sensitive SL is to staffing
}
model {
  target_sl ~ normal(0.9, 0.05);
  sl_sensitivity ~ exponential(1);

  for (t in 1:N_intervals) {
    // Approximate: SL depends on staffing ratio
    real offered_load = arrival_rate[t] * mean_service_time[t];
    real staff_ratio = agents_available[t] / offered_load;
    real expected_sl = 1 - exp(-sl_sensitivity * (staff_ratio - 1));
    observed_sl[t] ~ beta(expected_sl * 10, (1 - expected_sl) * 10 + 1e-3);
  }
}
generated quantities {
  // Identify intervals where SL drops below target
  array[N_intervals] int sl_violation;
  for (t in 1:N_intervals) {
    real offered_load = arrival_rate[t] * mean_service_time[t];
    real staff_ratio = agents_available[t] / offered_load;
    real expected_sl = 1 - exp(-sl_sensitivity * (staff_ratio - 1));
    sl_violation[t] = expected_sl < target_sl;
  }
}
```

---

### Chapter 9: Retrial Queueing Systems (pp. 229–260)

**Core content:** Blocked callers don't leave — they enter an "orbit" and retry after random delays. Retrial rate optimization, equilibrium retrial behavior, priority in retrial queues.

**Key concepts:**
```
RETRIAL QUEUE:
- No waiting space: if server busy, caller goes to orbit
- Orbit = group of customers who retry after random delays
- Retrial rate: ν (rate at which orbit customers retry)
- Equilibrium retrial rate: strategic choice by callers
- Optimal retrial rate: chosen by system operator
- Often: equilibrium retrial rate ≠ optimal (externality)
```

**Emergency call center connection:**

> **RETRIAL QUEUES ARE THE 9-1-1 CALLBACK MODEL.** This is the most directly applicable chapter after Chapter 6 (Priority).
>
> **The 9-1-1 orbit:**
> ```
> Caller dials 9-1-1
>     │
>     ├── Line free → answered (success)
>     │
>     └── Line busy → enters "orbit"
>           │
>           ├── Automatic callback (system-initiated retry)
>           ├── Manual redial (caller-initiated retry)
>           └── Abandons (leaves orbit permanently)
> ```
>
> **Strategic retrial decisions:**
> - Caller decides: retry immediately? retry after delay? try non-emergency line? drive to hospital?
> - The retrial rate ν affects system load: too fast → congestion; too slow → delayed response
> - **Equilibrium retrial rate** may be too high (selfish) or too low (panic → immediate redial → overload)
>
> **The book's key insight for 9-1-1:** The system operator can control the retrial rate by:
> 1. **Callback timing** — "We'll call you back in 2 minutes" → set ν explicitly
> 2. **Busy signal suppression** — play hold music instead of busy → caller stays in primary queue (no orbit)
> 3. **Orbit information** — "Your call is #3 in callback queue" → observable retrial queue
>
> **Wang's retrial model with priority (from his own papers):** Priority subscribers in retrial queues — some callers get priority in the orbit. This maps directly to: P1 calls get immediate callback, P3/P4 calls get delayed callback.

```stan
// retrial_callback.stan — Bayesian retrial/callback model
data {
  int<lower=1> N;                        // observed busy signals
  vector<lower=0>[N] retry_delay;        // time until caller retried (min)
  array[N] int<lower=0, upper=1> used_callback; // 1 = accepted system callback
  array[N] int<lower=0, upper=1> eventually_reached; // 1 = eventually answered
  vector[N] severity;                    // call severity 1-10
}
parameters {
  real<lower=0> retrial_rate;            // ν: caller retry rate
  real<lower=0> callback_acceptance;     // prob of accepting callback
  real beta_severity;
}
model {
  retrial_rate ~ exponential(1);
  callback_acceptance ~ beta(5, 5);
  beta_severity ~ normal(1, 0.5);

  // Retry delays ~ Exponential(retrial_rate)
  retry_delay ~ exponential(retrial_rate);

  // High-severity callers more likely to use callback
  // (they accept the tradeoff of waiting for callback vs. immediate retry)
  for (n in 1:N) {
    real logit_p = callback_acceptance + beta_severity * severity[n];
    used_callback[n] ~ bernoulli_logit(logit_p);
  }
}
generated quantities {
  real expected_retries_before_answer = retrial_rate * mean(retry_delay);
  // System-level: fraction of callers who never get through
  real abandonment_prob = exp(-retrial_rate * 5);  // 5-min window
}
```

---

### Chapter 10: Applications in Wireless Communication Systems (pp. 261–293)

**Core content:** Queueing-game models applied to wireless networks — packet queues, handoff decisions, spectrum access, cognitive radio. Customers (users) choose which network/channel to access.

**Emergency call center connection:**

> **Wireless = how 9-1-1 calls arrive.** This chapter's models apply to:
>
> - **Cell tower congestion** — packet-level queueing before call setup completes
> - **Handoff decisions** — a moving caller's call transferring between towers (queue migration)
> - **Priority access** — emergency calls get priority on wireless channels (preemption of data)
> - **Network selection** — Wi-Fi calling vs. cellular vs. landline (multi-queue routing)
>
> The **wireless handoff queue** is especially relevant: as a caller moves, their "call in progress" must be handed off — if the target cell is congested, the call drops (equivalent to balking in mid-queue).

---

### Chapter 11: Applications in Service-Inventory Systems (pp. 295–345)

**Core content:** Joint queueing and inventory control — server availability depends on inventory, customers arrive for service that requires parts/supplies.

**Emergency call center connection:**

> **Inventory = dispatch resources.** The analogy:
>
> - **Ambulance availability** = inventory. When all ambulances are dispatched (inventory = 0), new calls queue for ambulance assignment
> - **Police unit availability** = inventory. Calls queue for unit assignment
> - **Mutual aid** = inventory sharing between PSAPs
>
> The **service-inventory queue** model maps to: caller arrives → dispatch → if inventory (unit) available, service begins; if not, caller waits in dispatch queue. The game: callers' willingness to wait depends on estimated unit availability.

---

### Chapter 12: Healthcare Systems (pp. 347–381)

**Core content:** Queueing-game models in healthcare — patient choice between hospitals, physician triage, emergency department overcrowding, waiting time as a quality signal.

**Emergency call center connection:**

> **Healthcare is the closest application domain to 9-1-1.** Key parallels:
>
> | Healthcare Concept | 9-1-1 Equivalent |
> |-------------------|-------------------|
> | Patient chooses hospital | Caller chooses PSAP / non-emergency line |
> | Triage (ESI levels) | Priority assignment (P1-P4) |
> | ED overcrowding | Call center congestion |
> | Ambulance diversion | Overflow routing to neighboring PSAP |
> | Wait time as quality signal | Estimated wait affects caller trust |
> | Physician effort game | Dispatcher effort under monitoring |
> | Reimbursement policy | Funding/staffing incentives |
>
> **Wang's own healthcare papers directly apply:**
> - *Efficiency-quality trade-off in public healthcare* (Wang et al., 2022): comprehensive vs. primary hospital = 9-1-1 PSAP vs. non-emergency line
> - *Reimbursement policy with priorities* (2023): fee-for-priority vs. bundled priority = triage system design
>
> **The caller's hospital choice model:**
> ```
> Caller observes: queue lengths at nearby ERs, estimated wait, severity
> Caller decides: go to ER A, ER B, urgent care, or stay home
> → Wardrop equilibrium across hospitals
> → Same model: caller decides PSAP A, PSAP B, non-emergency, or self-transport
> ```

```stan
// hospital_choice.stan — Bayesian model for caller destination choice
data {
  int<lower=1> N;                        // observed calls
  int<lower=1> J;                        // number of destinations (PSAPs/ERs)
  array[N] int<lower=1, upper=J> chosen; // destination chosen
  matrix[N, J] wait_estimates;           // estimated wait at each destination
  matrix[N, J] distance;                 // distance/travel time to each
  vector[N] severity;                    // call severity
}
parameters {
  vector[J - 1] beta_wait;               // wait time sensitivity (relative to J)
  vector[J - 1] beta_dist;               // distance sensitivity
  real beta_severity;                    // severity × wait interaction
  real<lower=0> scale;                   // logit scale
}
model {
  to_vector(beta_wait) ~ normal(-1, 0.5);
  to_vector(beta_dist) ~ normal(-0.5, 0.5);
  beta_severity ~ normal(-0.5, 0.3);     // severe calls care more about wait
  scale ~ exponential(1);

  // Multinomial logit: utility of destination j
  for (n in 1:N) {
    vector[J] utilities;
    for (j in 1:J) {
      int jj = (j < J) ? j : J;          // reference alternative
      real u = 0;
      if (j < J) {
        u = beta_wait[j] * wait_estimates[n, j]
          + beta_dist[j] * distance[n, j]
          + beta_severity * severity[n] * wait_estimates[n, j];
      }
      utilities[j] = u;
    }
    chosen[n] ~ categorical_logit(scale * utilities);
  }
}
generated quantities {
  // Wardrop equilibrium: all chosen destinations have equal utility
  // (implies: wait + cost(distance) equalized across used destinations)
}
```

---

## Cross-Chapter Synthesis: A 9-1-1 Queueing-Game Model

Combining the book's chapters into a unified 9-1-1 model:

```
                    ┌─────────────────────────────┐
                    │   9-1-1 CALL ARRIVES         │
                    └──────────┬──────────────────┘
                               │
                    ┌──────────▼──────────────────┐
                    │  CH.4: INFORMATION DISCLOSURE │
                    │  What does caller know?        │
                    │  - Queue length? (Ch.2/3)      │
                    │  - Estimated wait?              │
                    │  - Callback offer?              │
                    └──────────┬──────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼──────┐ ┌──────▼───────┐ ┌──────▼───────┐
    │  CH.2: JOIN    │ │  CH.3: BALK  │ │  CH.9: RETRY │
    │  (observable)  │ │(unobservable)│ │  (retrial)   │
    │  threshold n_e │ │  prob q*     │ │  rate ν      │
    └─────────┬──────┘ └──────────────┘ └──────────────┘
              │
    ┌─────────▼──────────────────┐
    │  CH.6: PRIORITY TRIAGE     │
    │  Dispatcher assigns P1-P4  │
    │  (signaling game)          │
    └─────────┬──────────────────┘
              │
    ┌─────────▼──────────────────┐
    │  CH.8: VACATION SCHEDULING │
    │  Agent breaks, ACW, shifts │
    │  (Stackelberg game)        │
    └─────────┬──────────────────┘
              │
    ┌─────────▼──────────────────┐
    │  CH.7: SERVER RELIABILITY  │
    │  Workstation/CAD outages   │
    │  (repairable queue)        │
    └─────────┬──────────────────┘
              │
    ┌─────────▼──────────────────┐
    │  CH.5: RISK SENSITIVITY    │
    │  Caller risk aversion      │
    │  affects all decisions     │
    └─────────┬──────────────────┘
              │
    ┌─────────▼──────────────────┐
    │  CH.12: HEALTHCARE ANALOGY │
    │  Overflow to neighboring   │
    │  PSAP / ER diversion       │
    │  (Wardrop equilibrium)     │
    └────────────────────────────┘
```

---

## Reading Order for 9-1-1 Work

| Priority | Chapters | Why |
|----------|----------|-----|
| **Read first** | Ch. 1 → 2 → 3 | Foundations + observable/unobservable = core caller behavior |
| **Read second** | Ch. 6 → 9 | Priority + retrial = the two defining 9-1-1 queue features |
| **Read third** | Ch. 4 → 5 | Information disclosure + risk sensitivity = design decisions |
| **Read fourth** | Ch. 8 → 7 | Vacation + repairable = operational scheduling |
| **Read as needed** | Ch. 10 → 11 → 12 | Application chapters for specific subsystems |
| **Pair with** | Ch. 12 (Healthcare) + [02_queueing_game_theory.md](02_queueing_game_theory.md) | Healthcare parallels + practical code |

---

## Complementary Resources

### For the mathematics
- **Hassin & Haviv** — *Equilibrium Behavior in Queueing Systems* (the foundational reference for Ch. 2-3)
- **Naor (1969)** — *The Regulation of Queue Size by Levying Tolls*, Econometrica 37(1):15–24 (the original paper)
- **Edelson & Hildebrand (1975)** — *Congestion Models with Balking*, Econometrica 43:81–92 (unobservable queues)

### For the applications
- **Brown et al. (2005)** — *The Telephone Call Center: Review of Modeling and Research*, Queueing Systems (Erlang A)
- **Akiya et al.** — *Efficient Customer Activation* (Google's call center papers)
- **Wang, Wang, Zhang & Wang (2022)** — *Efficiency-quality trade-off in public healthcare*, Transportation Science (Wang's own paper — direct parallel to PSAP design)

### For implementation
- **[02_queueing_game_theory.md](02_queueing_game_theory.md)** — Companion guide with Stan models and code
- **[01_stan.md](01_stan.md)** — Stan programming language reference
- **[04_ggplot2.md](../Visualizations/04_ggplot2.md)** — Visualization of queueing metrics

### For simulation
- **SimPy** (Python) — Discrete-event simulation of retrial/priority queues
- **simmer** (R) — R discrete-event simulation
- **axelrod** (Python) — Game theory simulation

---

## Quick Reference: Key Equilibrium Results

| Model | Equilibrium Strategy | Social Optimum | Gap? |
|-------|---------------------|----------------|------|
| Observable (Naor) | Threshold n_e | Threshold n* ≤ n_e | Yes (externality) |
| Unobservable (Edelson-H) | Join prob q* | Higher q_s | Yes |
| Priority purchase | Pay if wait savings > price | Fewer buy priority | Yes (over-purchase) |
| Retrial | Retry rate ν_e | Lower ν_s | Yes (orbit congestion) |
| Risk-sensitive | Threshold shifted by γ | Threshold with γ=0 | Depends on risk |
| Information disclosure | N/A (provider's choice) | Maximize welfare | Design problem |
| Vacation scheduling | Agent's break choice | Supervisor's schedule | Yes (moral hazard) |

**Price of Anarchy range:** Typically 1.0–1.5 for M/M/1 queueing games (small gap), but can be larger for priority and retrial systems.

---

*Companion to: Wang, J. (2026). Fundamentals of Queueing-Game Models. Springer. ISBN 978-981-95-0260-8.*
*Cross-references: [01_stan.md](01_stan.md), [02_queueing_game_theory.md](02_queueing_game_theory.md)*
*Last updated: 2024*
