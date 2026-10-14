---
type: reference
status: active
tags:
  - time-series
  - forecasting
  - agentic-ai
  - llm
  - foundation-models
  - frameworks
created: 2026-10-14
updated: 2026-10-14
aliases:
  - timecopilot
  - Agentic Forecasting
  - TimeCopilot Framework
---

# TimeCopilot

An open-source **agentic** framework for forecasting. Not a model — a layer that puts an LLM
in charge of a hub of forecasting models.

- **Paper** — Garza, A. & Rosillo, R. (2025). *TimeCopilot*. **CC BY 4.0**.
  🔗 [arXiv:2509.00616](https://arxiv.org/abs/2509.00616) — v1 30 Aug 2025, **v3 7 Nov 2025**
- **Authors** — Azul Garza, Renée Rosillo (San Francisco). Garza is also an author of
  [TimeGPT-1](https://arxiv.org/abs/2310.03589), which is why the framework leans on the
  Nixtla stack. Acknowledgments: Martín Juárez, Rodrigo Mendoza-Smith, Salomón Márquez
- **Docs** — 🔗 https://timecopilot.dev
- **Model hub** (complete catalogue) — 🔗 https://timecopilot.dev/model-hub/
- **GitHub** — 🔗 https://github.com/TimeCopilot/timecopilot (was `AzulGarza/timecopilot`)
- **Foundation model package** — 🔗 https://github.com/TimeCopilot/foundationforecast
- **Install** — `uv add timecopilot` or `pip install timecopilot`
- **GIFT-Eval reproduction** — 🔗 https://timecopilot.dev/experiments/gift-eval
- **fev experiments** — 🔗 https://timecopilot.dev/experiments/fev/

---

## 1. The paper in brief

### The problem it names

The TSFM field had exploded into at least six architectural families by mid-2025 — the
paper's own introduction enumerates them:

| Family | Models the paper cites |
|---|---|
| Non-Transformer | TinyTimeMixers |
| Encoder-only | MOMENT, Moirai |
| Decoder-only | Timer-XL, Time-MoE, Toto, Timer, TimesFM, Lag-Llama |
| LLM-adapted | Chronos, AutoTimes, LLMTime, Time-LLM, FPT |
| API-deployed | TimeGPT-1 |

Each is built by a different lab with **its own API, training pipeline, evaluation
conventions, and input requirements** (univariate vs multivariate, patch vs non-patch
tokenization) and different compute requirements. The paper's claim is that this
fragmentation "makes it difficult to compare models fairly, and even harder to integrate
them seamlessly into production forecasting systems," citing GIFT-Eval as evidence that these
design differences actively complicate reproducibility.

### The contribution

TimeCopilot is positioned as **the first open-source framework designed specifically for
agentic forecasting**. LLMs are used in two distinct ways, and the paper separates them
cleanly:

1. **To decide how to act** at each step of a classical forecasting pipeline — orchestrate
   tools, reason over signals
2. **To explain** both the model-selection decisions and the forecasts in natural language

### The two entry points

```
┌──────────────────────────────────────────────────┐
│  TimeCopilot AGENT                                │
│  LLM as reasoning engine                          │
│  1. Feature Analysis        → diagnostics         │
│  2. Model Selection + Eval  → candidates + CV     │
│  3. Final Selection + Forecast → explanation      │
└───────────────────────┬──────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────┐
│  TimeCopilot FORECASTER                           │
│  Unified API over the model hub                   │
│  TSFMs · statistical · classical ML · neural      │
│  + MedianEnsemble across families                │
└──────────────────────────────────────────────────┘
```

The **Agent** orchestrates. The **Forecaster** executes. The paper stresses you can use
either alone — and given §4, you probably should.

### The agent's three steps, precisely

1. **Time Series Feature Analysis** — computes focused diagnostics on **trend, seasonality,
   stationarity** to inform model choice. These come from `tsfeatures` — both the Nixtla
   Python package and Hyndman's R package.
2. **Model Selection and Evaluation** — proposes candidates **starting from simple
   statistical baselines**, *documents their assumptions*, evaluates via cross-validation,
   and **escalates to more complex models only when needed**
3. **Final Model Selection and Forecasting** — picks the best model on the metrics,
   generates forecasts, and interprets patterns, uncertainty, and reliability

> ⚠️ **"Escalates only when needed" is a greedy search with a stopping rule, not an
> exhaustive search.** The agent's candidate path depends on where it decides to stop. That
> makes the selection *path* — not just the winner — a thing you would need to log to
> reproduce it.

### The model hub — complete live list

🔗 **https://timecopilot.dev/model-hub/** — retrieved 2026-10-14.

> **⚠️ The live hub has drifted from the paper.** Paper v3 (Nov 2025) listed ten TSFMs.
> The hub today has **eleven**, with **PatchTST-FM** and **t0** added and Chronos-2 folded
> into the Chronos family. Treat the site as authoritative for what you can actually call.

Foundation models now live in a **separate `foundationforecast` PyPI package** and are
re-exported at `timecopilot.models.foundation.*` for backward compatibility. Docstrings
live in 🔗 https://github.com/TimeCopilot/foundationforecast

#### Foundation models (11)

| Model | Paper / weights | Notes |
|---|---|---|
| **Chronos** | 🔗 [arXiv:2403.07815](https://arxiv.org/abs/2403.07815) | Family notebook covers Chronos-2 |
| **FlowState** | 🔗 [arXiv:2508.05287](https://arxiv.org/abs/2508.05287) | Sampling-rate invariant |
| **Moirai** | 🔗 [arXiv:2402.02592](https://arxiv.org/abs/2402.02592) | |
| **PatchTST-FM** | 🔗 [arXiv:2602.06909](https://arxiv.org/abs/2602.06909) | IBM. ~260M params, 8192 context, **99 quantiles**. `ibm-research/patchtst-fm-r1`, `ibm-granite/granite-timeseries-patchtst-fm-r1/r2`. Python 3.11–3.13 |
| **Sundial** | 🔗 [arXiv:2502.00816](https://arxiv.org/abs/2502.00816) | Generative / flow matching |
| **t0** | 🔗 [arXiv:2609.24559](https://arxiv.org/abs/2609.24559) | The Forecasting Company. `t0-alpha` 102M / `t0-beta` 256M. Apache-2.0. Requires `tfc-t0>=0.5.0`. Python 3.11–3.13 |
| **TabPFN** | 🔗 [arXiv:2501.02945](https://arxiv.org/abs/2501.02945) | TabPFN-2 default, TabPFN-3 via `model_path`. **Non-commercial licence** |
| **TiRex / TiRex-2** | 🔗 [arXiv:2505.23719](https://arxiv.org/abs/2505.23719) · [arXiv:2607.01204](https://arxiv.org/abs/2607.01204) | |
| **TimeGPT** | 🔗 [arXiv:2310.03589](https://arxiv.org/abs/2310.03589) | API-based |
| **TimesFM** | 🔗 [arXiv:2310.10688](https://arxiv.org/abs/2310.10688) | **3.0 weights now shipped** |
| **Toto** | 🔗 [arXiv:2505.14766](https://arxiv.org/abs/2505.14766) | |

#### Statistical & classical (11 + Prophet)

`ADIDA` · `AutoARIMA` · `AutoCES` · `AutoETS` · `CrostonClassic` ·
`DynamicOptimizedTheta` · `HistoricAverage` · `IMAPA` · `SeasonalNaive` · `Theta` ·
`ZeroModel` · plus `Prophet`

> ⚠️ **The intermittent-demand coverage is thinner than `statsforecast`.** You get
> **CrostonClassic only** — no `CrostonSBA`, no `CrostonOptimized`, and **no TSB**.
> TSB is the variant my [[Intermittent and Sparse Demand]] §3 recommends on the grounds that
> its asymmetric interval update catches a series going dormant. Use `statsforecast`
> directly for that; see Practice 05.
>
> `HistoricAverage` and `ZeroModel` are also useful and easy to overlook — `ZeroModel` is
> exactly the "predict 0 everywhere" reference that intermittent forecasts need.

#### Machine learning (8)

`AutoCatboost` · `AutoElasticNet` · `AutoLasso` · `AutoLGBM` · `AutoLinearRegression` ·
`AutoRandomForest` · `AutoRidge` · `AutoXGBoost`

> ⚠️ **These are *Auto*-wrapped**, meaning `MLForecast` tunes them per series. `AutoCatboost`
> is the one relevant to you — it is the same CatBoost-on-lags configuration described in
> your `resources.md` §3.6. See [[time-series-forecasting-models]] §3.

#### Neural networks (5)

`AutoDeepAR` · `AutoNBEATS` · `AutoNHITS` · `AutoPatchTST` · `AutoTFT`

> Note the split: `AutoPatchTST` (supervised, via NeuralForecast) is a **different model**
> from `PatchTST-FM` (foundation, via `foundationforecast`). Easy to confuse, easy to
> accidentally benchmark the wrong one.

#### Also available

- **`MedianEnsemble`** — the combination across heterogeneous families used in §2
- **Anomaly detection** — dedicated forecaster example, 🔗
  https://timecopilot.dev/examples/anomaly-detection-forecaster-quickstart/
- **sktime adapters** — bring in external engines, 🔗 https://timecopilot.dev/examples/sktime/
- **Fine-tuning** for foundation models, 🔗 https://timecopilot.dev/examples/finetuning/
- **fev experiments** alongside GIFT-Eval, 🔗 https://timecopilot.dev/experiments/fev/

### LLM-agnostic

Commercial APIs (OpenAI, Anthropic) or open-source (DeepSeek-R1, LLaMA), chosen by cost,
availability, or deployment constraint.

---

## 2. The GIFT-Eval result — and what it actually measures

**This is the part most likely to be misread, including by me on the first pass.**

GIFT-Eval spans **24 datasets, 144k+ time series, 177M data points**. The paper reports
TimeCopilot achieving the best overall performance on both probabilistic (CRPS) and point
(MASE) accuracy among publicly reproducible submissions, at approximately **$24 of
GPU-distributed inference**, with the full experiment reproducible from the docs.

But the paper is explicit about the mechanism:

> "The TimeCopilot results rely on its `MedianEnsemble` feature, used to combine **three
> state-of-the-art foundation models (Chronos-2, TimesFM, and TiRex)** with an **isotonic
> regression** to ensure monotonic quantiles for probabilistic forecasting."

> ### ⚠️ The SOTA number comes from the Forecaster, not the Agent
>
> **No LLM is involved in the reported GIFT-Eval result.** The ensemble is a fixed,
> hand-specified combination of three named models plus a monotonicity projection. The
> agent's model *selection* contributes nothing to that number.
>
> This is actually useful information rather than a flaw in the paper — it gives you a
> clean, cheap, reproducible baseline you can reproduce in an afternoon without any LLM:
>
> ```
> MedianEnsemble([Chronos-2, TimesFM, TiRex]) + isotonic regression
> ```
>
> And it sharpens the open question in [[LLM-as-Forecaster and Agentic Forecasting]] §2:
> does the LLM reasoning step beat *this* — a well-specified ensemble of the same models —
> or does it just arrive at a similar place more expensively and less reproducibly?
>
> Note the MedianEnsemble lineage the paper cites: **Bates & Granger (1969)**,
> *The combination of forecasts*, and **Petropoulos & Svetunkov (2020)**, *A simple
> combination of univariate models*. This is the same "combination beats choosing" result
> that showed up in M4, M5, and every benchmark since — now applied to foundation models.
> See [[time-series-forecasting-models]] §7.

---

## 3. Usage

```python
from timecopilot import TimeCopilot

tc = TimeCopilot(llm="openai:gpt-4o")

result = tc.forecast(
    df=df,
    query="how many air passengers are expected in the next 12 months?",
)

print(result.output.user_query_response)
# "The total expected air passengers for the next 12 months is approximately 5,919."
```

Bypassing the agent entirely:

```python
from timecopilot import TimeCopilotForecaster
from timecopilot.models.foundation.toto import Toto
from timecopilot.models.ml import AutoLGBM
from timecopilot.models.neural import AutoNHITS
from timecopilot.models.prophet import Prophet
from timecopilot.models.stats import AutoARIMA, SeasonalNaive

tcf = TimeCopilotForecaster(models=[
    AutoARIMA(), AutoLGBM(), AutoNHITS(), Prophet(), SeasonalNaive(), Toto(),
])

fcst_df = tcf.forecast(df=df, h=12)
cv_df   = tcf.cross_validation(df=df, h=12)
```

> ⚠️ `cross_validation()` defaults will not match your protocol. See §4.

### Local LLM

For 9-1-1 work where call records cannot leave the environment, a local LLM behind the agent
keeps the pipeline on-premise:

```python
tc = TimeCopilot(llm="ollama:llama3")
```

---

## 4. Assessment — strengths

- **Genuinely useful model selection.** Picking the right model per series is the single
  most valuable thing in forecasting. Cross-validated candidate selection is real work.
- **The Forecaster is the strongest part.** The hub solves a real dependency-hell problem,
  and the median ensemble is a credible default.
- **Ensemble as the default, not an afterthought** — and the paper backs it with a
  benchmark result and two classical combination references.
- **LLM-agnostic and open source.** No vendor lock-in on the reasoning layer.
- **Genuinely cheap.** ~$24 of GPU inference for a full GIFT-Eval-scale run is a striking
  number and makes large-scale experimentation practical.
- **The design intent is the right one.** Automation *and* explainability together, with
  the explanation surfaced as a first-class query rather than a log line.

## 5. Assessment — weaknesses and cautions

> ### ⚠️ The agent's selection is a validation-design decision, and it makes it for you
>
> This is the most important caution for a research context.
> [[Model Validation Strategies]] argues that **validation design changes conclusions more
> than model choice does**. TimeCopilot's agent chooses the cross-validation scheme, the
> candidate set, and the stopping point *autonomously*.
>
> For exploration and production dashboards that is an asset. For a comparative study it is
> a problem: an agent that silently picks the validation scheme cannot be held to §8 of
> that note — frozen splits, rolling origin, refit at every origin, HLN and Clark-West
> corrections, three-way train/calibrate/test.
>
> **Recommendation: use the Forecaster, drive the evaluation yourself.** The agent is a
> convenience layer; the Forecaster is the infrastructure.

Additional cautions:

- **The reported SOTA is not the agent's.** Per §2 — quote the mechanism, not the headline,
  or you will misrepresent the paper.
- **Non-determinism.** LLM-driven selection is stochastic. Two runs on the same data may
  pick different models, or different stopping points. Any benchmark of the agent needs
  multiple trials, and reproducibility requires pinning model, temperature, and prompt.
- **Cost scales with series count.** ~$24 is for a benchmark run over a hub; per-series
  agentic reasoning at 168 series × many origins will be materially slower and pricier.
- **The explanation is not an explanation of the data.** It explains the agent's reasoning
  about its choice. It is not a causal account of what drives the series and should never be
  presented as one in a PSAP briefing.
- **The agent's CV may not respect a purge gap.** See §5 of [[Model Validation Strategies]] —
  this is precisely where it would go wrong.
- **The framework is narrow where you will need it.** No hierarchical forecasting, no
  multivariate-with-explanations, no cross-aggregation-level coherence — the paper lists all
  three as **future work**. If your problem is hierarchical, this does not cover it today.
  See [[forecast-reconciliation]].

---

## 6. Where it sits among agentic forecasting

| System | Mechanism |
|---|---|
| **TimeCopilot** 🔗 [2509.00616](https://arxiv.org/abs/2509.00616) | LLM orchestrates a model hub; feature analysis → validated selection → explained forecast |
| **Synapse** 🔗 [2511.05460](https://arxiv.org/abs/2511.05460) | Adaptive arbitration of complementary TSFMs |
| **Nexus** 🔗 [2605.14389](https://arxiv.org/abs/2605.14389) | Multi-agent, multimodal contextual forecasting |
| **TimeSeriesScientist**, **AlphaCast**, **Cast-R1** | Multi-step planning, tool use, reflection, memory |
| **TFR-Bench** 🔗 [2604.05364](https://arxiv.org/abs/2604.05364) | A reasoning benchmark for forecasting *systems* |
| **Toto 2.0 FnF** 🔗 [2605.20119](https://arxiv.org/abs/2605.20119) | Learned per-window weights over ten FMs — no LLM |

The common shape: an LLM or learned router arbitrating across engines. TimeCopilot's own
contribution is the **unification layer** — and the open question it does *not* answer is
whether the LLM reasoning step contributes anything beyond a well-specified combination
weight. TFR-Bench exists to test exactly that.

### The skeptical citation the paper itself includes

The paper cites **Bergmeir, C. (2024). *LLMs and Foundational Models: Not (Yet) as Good as
Hoped*. *Foresight*, IAF, (73), 33–38.** 🔗 https://cbergmeir.com/papers/Bergmeir2024LLMs.pdf

Worth reading directly — it is the counterweight to the enthusiasm, and it comes from
someone the TimeCopilot authors chose to cite rather than avoid.

---

## 7. Future work (per the paper)

1. **MCP integration** — standardized interfaces to external tools and services
2. **Beyond academic benchmarks** — energy, climate, finance, supply chain
3. **Hierarchical forecasting**, **multivariate with multivariate explanations**, and
   **coherence across aggregation levels**

For your context, item 3 is the one to watch if a hierarchical PSAP structure emerges.

---

## 8. Try it

- [ ] `uv add timecopilot`; run the hello-world on a Monash dataset
- [ ] **Reproduce the paper's ensemble yourself** — `MedianEnsemble([Chronos-2, TimesFM,
      TiRex])` + isotonic regression — and confirm you land near their GIFT-Eval numbers.
      No LLM required. This is the reproducible core.
- [ ] Run the agent on the same series 5× with the same seed; record how often the selected
      model *and the escalation point* change
- [ ] Inspect the cross-validation scheme the agent chose — does it match
      [[Model Validation Strategies]] §8?
- [ ] Replace the agent's evaluation with an explicit rolling-origin harness and re-measure
- [ ] Compare the agent's pick against the fixed ensemble's pick. How often does reasoning
      beat specification?
- [ ] Test with a local LLM (`ollama:...`) to confirm the on-prem configuration works

## References

**Primary**
1. Garza, A. & Rosillo, R. (2025). TimeCopilot. *arXiv* 2509.00616v3. CC BY 4.0. 🔗 https://arxiv.org/abs/2509.00616
2. TimeCopilot documentation. 🔗 https://timecopilot.dev
3. GIFT-Eval reproduction. 🔗 https://timecopilot.dev/experiments/gift-eval

**Models in the hub**
4. Ansari, A.F. et al. (2025). Chronos-2. 🔗 https://arxiv.org/abs/2510.15821
5. Ansari, A.F. et al. (2024). Chronos. 🔗 https://arxiv.org/abs/2403.07815
6. Das, A. et al. (2024). TimesFM. 🔗 https://arxiv.org/abs/2310.10688
7. Auer, A. et al. (2025). TiRex. 🔗 https://arxiv.org/abs/2505.23719
8. Liu, C. et al. (2025). Moirai 2.0. 🔗 https://arxiv.org/abs/2511.11698
9. Liu, Y. et al. (2025). Sundial. 🔗 https://arxiv.org/abs/2502.00816
10. Cohen, B. et al. (2024). Toto. 🔗 https://arxiv.org/abs/2407.07874
11. Graf, L. et al. (2025). FlowState. 🔗 https://arxiv.org/abs/2508.05287
12. Hoo, S.B. et al. (2025). From tables to time: TabPFN-v2. 🔗 https://arxiv.org/abs/2501.02945
13. Garza, A., Challú, C. & Mergenthaler Canseco, M. (2023). TimeGPT-1. 🔗 https://arxiv.org/abs/2310.03589

**Underlying stack**
14. Garza Ramirez, A. et al. (2022). StatsForecast. 🔗 https://github.com/Nixtla/statsforecast
15. Olivares, K.G. et al. (2022). NeuralForecast. 🔗 https://github.com/Nixtla/neuralforecast
16. Nixtla contributors (2023). MLForecast. 🔗 https://github.com/Nixtla/mlforecast
17. Garza, A. et al. (2023). tsfeatures. 🔗 https://github.com/Nixtla/tsfeatures
18. Challu, C. et al. (2023). N-HiTS. 🔗 https://arxiv.org/abs/2201.12886
19. Lim, B. et al. (2021). Temporal Fusion Transformers. *IJF* 37(4).

**Combination and combination theory**
20. Bates, J.M. & Granger, C.W.J. (1969). The combination of forecasts. *ORQ* 20(4), 451–468. 🔗 https://doi.org/10.1057/jors.1969.103
21. Petropoulos, F. & Svetunkov, I. (2020). A simple combination of univariate models. *IJF* 36(1), 110–115. 🔗 https://doi.org/10.1016/j.ijforecast.2019.01.006
22. Barlow, R.E. & Brunk, H.D. (1972). The isotonic regression problem and its dual. *JASA* 67(337), 140–147.

**Evaluation and scepticism**
23. Aksu, T. et al. (2024). GIFT-Eval. 🔗 https://arxiv.org/abs/2410.10393
24. Hyndman, R.J. & Koehler, A.B. (2006). MASE. 🔗 https://robjhyndman.com/papers/mase.pdf
25. Gneiting, T. & Katzfuss, M. (2014). Probabilistic forecasting. *Annual Review of Statistics* 1, 125–151.
26. Bergmeir, C. (2024). LLMs and Foundational Models: Not (Yet) as Good as Hoped. *Foresight* (73), 33–38. 🔗 https://cbergmeir.com/papers/Bergmeir2024LLMs.pdf
27. Makridakis, S. et al. (2020). The M4 Competition. 🔗 https://doi.org/10.1016/j.ijforecast.2019.11.001
28. Hyndman, R.J. et al. (2024). *Forecasting: Principles and Practice, the Pythonic Way*. 🔗 https://otexts.com/fpppy

## Cross-links

- [[LLM-as-Forecaster and Agentic Forecasting]]
- [[Nixtlaverse]]
- [[Time Series Foundation Models]]
- [[Model Validation Strategies]]
- [[forecast-reconciliation]]
- [[Practice 03 — Zero-Shot Foundation Model Bake-Off]]
- [[168-Point Forecast Comparison - Discrete vs Continuous]]
- [[resources]]
