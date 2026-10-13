---
type: reference
topic: Staffing models for PSAP call-taker work — Erlang B, Erlang C, Erlang A, square-root, marginal analysis — formulas, parameters, assumptions, and how each breaks
date: 2026-10-13
status: active
tags:
  - staffing
  - queueing
  - erlang
  - reference
  - formulas
  - psap
---

# Staffing Model Reference

> Goal: the formulas, the parameters each needs, and — more importantly — **where each one stops being valid.** For PSAP call-taker staffing.
> Related: [[Staffing_Workflow_Feasibility]] · [[Staffing_Dispatcher_Feasibility]] · [[Staffing_Sources]] (all links HTTP-verified 2026-10-13) · `ErlangBandCFormulas.pdf` (Whitt 2002, IEOR 6707)

## Notation

| Symbol | Meaning | Unit |
|---|---|---|
| **λ** | Arrival rate | calls / time |
| **μ** | Individual service rate | 1 / mean service time |
| **E[S]** | Mean service time | time |
| **s** | Number of staffed servers | — |
| **a** | **Offered load** = λ/μ = λ·E[S] | erlangs |
| **ρ** | Traffic intensity = a/s | dimensionless |
| **θ** | Abandonment rate (patience rate 1/θ) | 1 / time |

> **The one distinction to keep straight:** *a* is offered load in **erlangs**; *ρ* is the **fraction of capacity consumed**. Both dimensionless, both easily confused.

---

## 1. Erlang B — the loss model (`M/M/s/s`)

`ErlangBandCFormulas.pdf` §1, eqs. (1.1)–(1.9).

```
a ≡ λ/μ                    (1.1)
ρ = a/s                    (1.2)
P(N=j) = (a^j/j!) / Σ_{k=0}^{s} a^k/k!            (1.3)
B(s,a) = P(N=s) = (a^s/s!) / Σ_{k=0}^{s} a^k/k!   (1.4)
R(s,a) ≡ 1/B(s,a)                                (1.5)
```

**Recursions — use these, not the closed form** (numerically stable, O(s) instead of O(s²)):

```
R(s,a) = s·R(s−1,a)/a + 1,        R(0,a) ≡ 1     (1.6)
B(s,a) = a·B(s−1,a) / (s + a·B(s−1,a))           (1.7)
      = ρ·B(s−1,a) / (1 + ρ·B(s−1,a))            (1.8)
```

Related quantities:
- **Carried load** `a' = a(1 − B(s,a))` — the part actually served (3.1)
- **Throughput** `θ = λ(1 − B(s,a))` (3.2)
- **Little's law bound** `B(s,a) ≥ max{0, 1 − ρ⁻¹}` (1.9)

**Monotonicity** (these are what make search algorithms work): B is **decreasing in s**, **increasing in a**, and **discretely convex in s** (Messerli 1972). Convexity in `s` is the basis for marginal analysis.

**Why it matters here:** B is the **only one of these that stays defined when a ≥ s**. Whitt's source PDF is explicit — *"Since we may well have a ≥ s in loss systems, the Erlang B formula should be considered more fundamental."* A PSAP peak interval routinely exceeds that boundary.

**Where it breaks:** it models *blocking*, not *waiting*. A 911 caller who hangs up is not a blocked server call — so B describes the wrong loss mechanism, even though it handles the arithmetic regime C cannot.

---

## 2. Erlang C — the delay model (`M/M/s/∞`)

`ErlangBandCFormulas.pdf` §2, eqs. (2.2)–(2.9).

```
C(s,a) = [a^s / (s!(1−ρ))] / [ Σ_{k=0}^{s−1} a^k/k! + a^s/(s!(1−ρ)) ]     (2.2)
```

**Relations to Erlang B** — use these, they are cheaper and better-conditioned:

```
C(s,a) = B(s,a) / [1 − ρ(1 − B(s,a))]        (2.7)   valid only 0 < a < s
B(s,a) = (1−ρ)C(s,a) / (1 − ρC(s,a))         (2.8)   ditto
C(s,a) = 1 / [R(s,a) − R(s−1,a)]             (2.9)   ← cheapest of all
C(s,a) > B(s,a)  for all s ≥ 1, 0 < a < s
```

Performance measures via Little's law (`EQ = λEW`, `EN = λES`):

```
EN = a + C(s,a)·ρ/(1−ρ)     (2.4)
EQ = C(s,a)·ρ/(1−ρ)         (2.5)
```

**The validity boundary.** `0 < a < s` — i.e. **ρ < 1**. Outside that the `1−ρ` terms diverge and the formula is meaningless. At ρ = 1 exactly, `EN → ∞`. **Track how many intervals land here**; on PSAP data it is not a rare edge case.

**Why it matters here:** this is the formula PSAPs actually deploy. The **ECaTS Staffing Forecast Module**, provided to PSAPs by the Universal Computing Alliance, is Erlang C, run at a **95% service level / 15-second answer target / 10-second wrap-up**. Note the standard also states explicitly: **the formula returns data for call-takers; dispatchers do not count in the totals.**

**Where it breaks:**
1. **ρ ≥ 1** — undefined (above).
2. **No abandonment** — the model assumes every caller waits indefinitely. Real 911 callers hang up. Robbins (2019) finds realised service levels *always* land below Erlang C's prediction — the formula is **systematically pessimistic**, not randomly wrong.
3. **Stationary** — but demand is strongly diurnal.

---

## 3. Erlang A — the abandonment model (`M/M/s+M`)

The natural reference model when abandonment is present, per Whitt's own lecture notes (IEOR 4615, 2015). Four parameters: **λ, μ, s, θ**.

Birth-death process — birth rate constant `λ_i ≡ λ`; death rate:

```
μ_i ≡ i·μ      for i ≤ s
μ_s+i ≡ s·μ + i·θ   for i > s
```

Two birth rates is the whole difficulty: the **second** one (`+i·θ`) is the abandonment of the *i*-th person waiting.

**Reference cases worth knowing:**
- **θ = μ** → identical to the infinite-server model; **number in system is exactly Poisson**. A useful sanity check.
- θ < μ → tail decays slower than Poisson
- θ > μ → tail decays faster

**Trade-off:** it models what actually happens to a 911 caller, but it is **numerically harder** — no closed form, solve the CTMC. Garnett, Mandelbaum & Reiman (2002) give exact and approximate expressions.

> **Caution, per Robbins (2019):** *"care must be taken when using the Erlang A model to make staffing decisions; particularly in cases where arrival rates [are high or uncertain]."* It is not automatically the "more realistic, therefore better" choice.

---

## 4. Square-root staffing (Halfin–Whitt)

Whitt (2007), from the normal approximation:

```
s = a + β√a
```

with β ∈ roughly [0.5, 2.0] set to hit the target quality-of-service. Related form used for non-Poisson arrivals (He, Liu & Whitt 2016):

```
s(t) = m(t) + β_α·√m(t),     β_α = β_α(z) = β·√z
```

where `m(t)` is the offered load at time *t* and `z` encodes the coefficient of variation of interarrivals.

Sanity check on β: **θ = 1 corresponds to ~22% of calls delayed** — so β is a direct service-level knob, not a fudge factor.

**Strengths:** closed-form, no iteration, degrades gracefully near ρ = 1, handles time-varying demand natively via `s(t)`.
**Where it breaks:** it is an **asymptotic** rule. Its `a + β√a` shape is derived for many-server systems; at small PSAP scale (tens of call-takers, not hundreds) the approximation is weaker. Worth measuring rather than assuming.

---

## 5. Marginal analysis

Add the s-th server; stop when the marginal reduction in delay stops justifying the marginal wage.

```
F_D(s,a) = λ[EW(s−1,a) − EW(s,a)]        (2.9)   marginal delay reduction
```

The algorithm is valid because **B(s−1,a) − B(s,a) is decreasing in s** — the classic discrete-convexity result of Messerli (1972), extended by Harel (1990) to real-valued s.

**This is the model that can actually express a cost trade-off**, which pure service-level targets cannot. Dyer & Proll (1977) test its validity for M/M/c and find conditions under which it holds — worth reading before relying on it.

---

## 6. Which model, for which pool

| Pool | Recommended model | Why |
|------|-------------------|-----|
| **Call-takers** | **Erlang C** as the incumbent baseline; **Erlang A** as the realistic challenger; **square-root** for robustness | This is the pool ECaTS counts and the pool all the formulas assume |
| **Dispatchers** | **Separate problem** | Different service distribution entirely (queue→unit assignment vs. talking to a caller). Running one pool's formula on the other is a category error |
| **Overload intervals (a ≥ s)** | **Erlang B** or **square-root** | Erlang C is undefined. Reporting "no answer" here hides a real finding |

---

## 7. The parameter table

What each model needs, and whether SynthCCD can supply it.

| Parameter | Erlang B | Erlang C | Erlang A | Square-root | SynthCCD |
|---|:-:|:-:|:-:|:-:|---|
| λ (arrivals) | ✅ | ✅ | ✅ | ✅ | `call_start_time`, hourly counts |
| E[S] (mean service) | ✅ | ✅ | ✅ | ✅ | talk time from CAD trace |
| s (staffing) | ✅ | ✅ | ✅ | ✅ | `shift_config` ✅ |
| θ (patience / abandonment) | — | — | **✅ required** | — | `*_calls_abandoned` ✅ |
| Cost of a server | — | — | — | — ✅ | *(assumption)* |
| Cost of delay | — | — | — | — ✅ | *(assumption)* |

---

## 8. Numerical implementation notes

- **Never compute the closed forms directly** for large `s` — `a^s/s!` overflows and the ratio loses all precision. Use the recursions; Whitt's §3 problem 3 on `B(10⁶, 10⁶)` is the cautionary example.
- **`R(s,a) = s·R(s−1,a)/a + 1`** is numerically the best-behaved of the three.
- For a **service-level target** (e.g. 95% answered within 15 s), note that Erlang C gives the *delay probability* C(s,a); converting to a service level and then to a *time* threshold needs the conditional delay distribution `EW|C`.
- Large-system asymptotics, for sanity-checking: `B(10,10) ≈ 0.215`, and `B(10ᵏ,10ᵏ) ≈ 0.1·B(10⁴,10⁴) ≈ 0.01·B(10²,10²)`.

## Status

- [x] Formulas transcribed from Whitt (2002) with equation numbers
- [x] Validity boundaries documented
- [x] Parameter availability mapped to SynthCCD
- [ ] Cross-check numerics against `scipy`/independent implementation
- [ ] Erlang A CTMC solver specified