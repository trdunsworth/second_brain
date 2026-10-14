---
type: reference
status: active
tags:
  - time-series
  - forecasting
  - llm
  - agentic-ai
  - foundation-models
  - reasoning
created: 2026-10-14
aliases:
  - Time-LLM
  - LLM Forecasting
  - Agentic Forecasting
  - Synapse
  - TFR-Bench
---

# LLM-as-Forecaster and Agentic Forecasting

Two distinct claims get conflated here. Separating them is most of the work.

| Claim | System | Question |
|---|---|---|
| **A. LLMs can forecast directly** | Time-LLM, GPT4TS, TEMPO | Can a frozen LLM's *weights* encode time-series structure? |
| **B. LLMs can orchestrate forecasters** | TimeCopilot, Synapse, Nexus, AlphaCast | Can an LLM pick, validate, combine and explain models? |

> Claim **B** is where the evidence is. Claim **A** is far more contested, and the negative
> result is well documented.

---

## 1. Claim A — LLMs as direct forecasters

### The approach

**Time-LLM** 🔗 [arXiv:2310.01728](https://arxiv.org/abs/2310.01728) — *Time Series Forecasting
by Reprogramming Large Language Models*. Rather than retraining the LLM, **reprogram** it:

1. Patch the series into token-like segments
2. **Re-map** the numeric segments into the LLM's existing embedding space, aligning means
   and covariances so the repurposed tokens are in-distribution
3. Prompt the frozen LLM with a task description
4. Read the output embeddings back into numbers

No (or minimal) fine-tuning. The claim is that the LLM's in-context learning and world
knowledge transfer.

**GPT4TS** (2023) — supervised fine-tuning of a frozen GPT on flattened look-back/horizon
pairs. **TEMPO**, **OFA** — further variants.

### The evidence, honestly

The results are **mixed and heavily dataset-dependent**, and two structural problems keep
appearing:

1. **Tokenisation is the bottleneck.** Reprogramming is a lossy, hand-tuned hack. The LLM's
   vocabulary was not built for float arrays.
2. **Benchmarks are small and overlapping.** Results that look strong often come from
   datasets that appear in instruction-tuning corpora.

Meanwhile the counter-evidence is from the models designed *for* time series:

> MOMENT 🔗 [arXiv:2402.03885](https://arxiv.org/abs/2402.03885) benchmarks **against**
> Time-LLM and GPT4TS on forecasting, and beats them — while being purpose-built.

And the general pattern from [[Linear Models for Forecasting]]: strong normalisation plus a
trivial backbone often wins. If a linear model with RevIN can match an LLM-forecast, the LLM
is not contributing much.

### Verdict

The sceptical reference in this space, and the one worth reading first:

> **Bergmeir, C. (2024). *LLMs and Foundational Models: Not (Yet) as Good as Hoped.*
> *Foresight*, IAF, (73), 33–38.** 🔗 https://cbergmeir.com/papers/Bergmeir2024LLMs.pdf

Worth noting that TimeCopilot's own authors cite it — they did not avoid the counterweight.

| | Assessment |
|---|---|
| Provenance of value | **Ambiguous.** Hard to separate "the LLM knows something" from "the reprogramming layer is a good normaliser" |
| Published wins | Real on some datasets, not reproducible across others |
| Cost | Very high — multi-billion-parameter forward passes for a task a 100K-parameter model does |
| Reproducibility | Poor. API model versions drift, invalidating published numbers |
| **Current standing** | **Not recommended** for a project you need to defend |

Reprogramming approaches the paper and Bergmeir both question: **Time-LLM**
🔗 [arXiv:2310.01728](https://arxiv.org/abs/2310.01728), **LLMTime**
🔗 [arXiv:2310.07820](https://arxiv.org/abs/2310.07820) (*Large language models are zero-shot
time series forecasters*), **AutoTimes** 🔗 [arXiv:2402.02370](https://arxiv.org/abs/2402.02370).

> **A control you should run.** If you evaluate an LLM forecaster, include a linear model with
> identical normalisation. If the LLM does not clearly beat it, the complexity is not
> buying anything.

---

## 2. Claim B — agentic orchestration

This is where the current work is. See [[TimeCopilot]] for the full treatment of that
system.

| System | Mechanism | arXiv |
|---|---|---|
| **TimeCopilot** | LLM orchestrates a model hub: feature analysis → cross-validated selection → explained forecast | 🔗 [arXiv:2509.00616](https://arxiv.org/abs/2509.00616) |
| **Synapse** | *Adaptive arbitration of complementary expertise* — routes per instance to whichever TSFM fits | 🔗 [arXiv:2511.05460](https://arxiv.org/abs/2511.05460) |
| **Nexus** | Multi-agent framework for multimodal contextual forecasting | 🔗 [arXiv:2605.14389](https://arxiv.org/abs/2605.14389) |
| **TimeSeriesScientist**, **AlphaCast**, **Cast-R1** | Multi-step planning, tool use, reflection, memory | — |
| **Toto 2.0 FnF** 🔗 [arXiv:2605.20119](https://arxiv.org/abs/2605.20119) | **No LLM** — learned per-window weights over a pool of ten foundation models | — |
| **TFR-Bench** 🔗 [arXiv:2604.05364](https://arxiv.org/abs/2604.05364) | A reasoning benchmark for evaluating forecasting systems | — |

### ⚠️ TimeCopilot's headline result does not come from the agent

This is the most useful thing in the 2025–26 agentic literature, and it is easy to misread.

TimeCopilot reports the best overall GIFT-Eval performance (CRPS and MASE) among
reproducible submissions, for roughly **$24 of GPU-distributed inference**. But the paper is
explicit that the result comes from its `MedianEnsemble` feature combining **Chronos-2 +
TimesFM + TiRex** with **isotonic regression** for monotonic quantiles.

> **No LLM is in that number.** The agent's model selection contributes nothing to the
> reported result.

So the comparison worth running is not "agent vs no agent." It is:

```
fixed ensemble [Chronos-2, TimesFM, TiRex] + isotonic   <- the paper's reported result
        vs
LLM router over a model hub                              <- the actual unmeasured claim
```

The paper cites **Bates & Granger (1969)** and **Petropoulos & Svetunkov (2020)** for the
combination step — the same "combination beats choosing" result as M4 and M5, now applied to
foundation models. See [[time-series-forecasting-models]] §7.

### The pattern, and the question it raises

Every one of these does the same three things: **select, validate, combine, explain.**

But that is precisely what a good ensemble does. And the M4 competition established in 2020
that **the combination of all methods beat every individual method**, and that **robustness
predicted performance better than average accuracy** ([[time-series-forecasting-models]] §7).

> ### The open question
>
> Does the LLM reasoning step contribute anything beyond a well-tuned combination weight?
>
> Toto 2.0 FnF answers without an LLM: learned per-window weights over ten foundation
> models. If that matches an LLM router, the reasoning step is decoration. If the LLM
> router wins clearly, there is something there — and TFR-Bench exists to settle it.
>
> **This is a genuinely open empirical question and a defensible small research
> contribution.** Compare an LLM router against a learned router against a uniform average,
> on your own data, with your own harness.

---

## 3. Evaluation — the part that is thin

TFR-Bench 🔗 [arXiv:2604.05364](https://arxiv.org/abs/2604.05364) is the first dedicated
benchmark for forecasting *systems* rather than forecasting *models*, and its existence is
itself the finding: there was no standard way to evaluate whether a reasoning step helped.

> ### ⚠️ Three confounds to control for in any agentic comparison
>
> 1. **Non-determinism.** LLM selection is stochastic. Report seeds, temperature and model
>    version, and run multiple trials.
> 2. **Selection performed on the test set.** An agent that cross-validates using data it
>    later forecasts on is leaking — and this is the *default* failure mode, because nobody
>    writes the isolation code. See [[Model Validation Strategies]] §8.
> 3. **Unequal compute.** An agentic system that ran 40 CV evaluations per series is not
>    comparable to a single model run once. Report total evaluations, not wall-clock.

---

## 4. What to actually do

| Goal | Recommendation |
|---|---|
| Best forecast, don't care how | **Skip the agent.** Use a learned or uniform ensemble over a model hub ([[Nixtlaverse]], Darts) |
| Explainability to non-experts | TimeCopilot, with the caveat that the explanation is about *its choice*, not causal |
| Operations dashboard / exploration | TimeCopilot is genuinely good here |
| A comparative study | Drive evaluation yourself — see Practice 01 and 03 |
| A research contribution | LLM router vs learned router vs uniform average, on your data |

### For the 9-1-1 context specifically

The P0 blocker on [[168-Point Forecast Comparison - Discrete vs Continuous]] is data access,
not models. No agentic framework resolves that. Once data exists:

- 168 models × CV evaluations × LLM calls will be **slow and expensive**
- The agent's cross-validation scheme will not match your protocol unless you force it
- For a research comparison, the agent is a **variable you hold constant**, not an arm

Use TimeCopilot's **Forecaster** for model-hub access. Keep the **Agent** out of the
evaluation path.

---

## References

**Claim A — direct forecasting**
1. Jin, M. et al. (2023). Time-LLM: Time Series Forecasting by Reprogramming Large Language Models. *ICLR 2024*. 🔗 https://arxiv.org/abs/2310.01728
2. Gruver, N. et al. (2024). Large language models are zero-shot time series forecasters (LLMTime). 🔗 https://arxiv.org/abs/2310.07820
3. Liu, Y. et al. (2024). AutoTimes. 🔗 https://arxiv.org/abs/2402.02370
4. Zhou, T. et al. (2023). One Fits All: Power General Time Series Analysis by Pretrained LM. (GPT4TS) 🔗 https://openreview.net/forum?id=Je4AI8v3RM
5. Goswami, M. et al. (2024). MOMENT — benchmarks against Time-LLM/GPT4TS. 🔗 https://arxiv.org/abs/2402.03885

**Claim B — agentic**
6. Garza, A. & Rosillo, R. (2025). TimeCopilot. 🔗 https://arxiv.org/abs/2509.00616
7. Ansari, A.F. et al. (2025). Synapse: Adaptive arbitration of complementary expertise. 🔗 https://arxiv.org/abs/2511.05460
8. Dai, Z. et al. (2026). Nexus: An Agentic Framework for Time Series Forecasting. 🔗 https://arxiv.org/abs/2605.14389
9. Ahamed, M.A. et al. (2026). TFR-Bench: A reasoning benchmark for evaluating forecasting systems. 🔗 https://arxiv.org/abs/2604.05364
10. Khwaja, E. et al. (2026). Toto 2.0 — includes the non-LLM FnF learned router. 🔗 https://arxiv.org/abs/2605.20119
11. Makridakis, S., Spiliotis, E. & Assimakopoulos, V. (2020). The M4 Competition. 🔗 https://doi.org/10.1016/j.ijforecast.2019.11.001
12. Montero-Manso, P. & Hyndman, R.J. (2021). Attributes that define forecasting benchmarks. 🔗 https://arxiv.org/abs/2003.07823

**Combination theory underpinning every ensemble above**
13. Bates, J.M. & Granger, C.W.J. (1969). The combination of forecasts. *ORQ* 20(4). 🔗 https://doi.org/10.1057/jors.1969.103
14. Petropoulos, F. & Svetunkov, I. (2020). A simple combination of univariate models. *IJF* 36(1). 🔗 https://doi.org/10.1016/j.ijforecast.2019.01.006

**Scepticism**
15. Bergmeir, C. (2024). LLMs and Foundational Models: Not (Yet) as Good as Hoped. *Foresight* (73), 33–38. 🔗 https://cbergmeir.com/papers/Bergmeir2024LLMs.pdf

## Cross-links

- [[TimeCopilot]]
- [[Nixtlaverse]]
- [[Time Series Foundation Models]]
- [[Linear Models for Forecasting]]
- [[Model Validation Strategies]]
- [[Practice 03 — Zero-Shot Foundation Model Bake-Off]]
- [[168-Point Forecast Comparison - Discrete vs Continuous]]
- [[time-series-forecasting-models]]
