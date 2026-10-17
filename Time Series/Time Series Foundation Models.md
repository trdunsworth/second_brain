---
type: reference
status: active
tags:
  - time-series
  - forecasting
  - foundation-models
  - zero-shot
  - pretraining
  - probabilistic
created: 2026-10-14
aliases:
  - TSFMs
  - Foundation Models for Time Series
  - Zero-Shot Time Series Models
  - Time Series Pretrained Models
---

# Time Series Foundation Models

Pretrained on large, cross-domain corpora of time series, then applied to a new series with
little or no fine-tuning — the forecasting analogue of an LLM.

> **All arXiv IDs below were verified 2026-10-14.** This note supersedes the 2024-era TSFM
> list in `resources.md` §1, which predates Chronos-2, TiRex, Sundial, Toto 2.0 and the
> xLSTM turn.

---

## 1. What a TSFM actually is, and the four design axes

A TSFM is a function that maps a look-back window to a forecast distribution:

$$\hat{p}\left(y_{T+1:T+h} \mid y_{1:T}\right)$$

Almost every design decision in the literature is a choice along one of four axes. If you
know which axis a model sits on, you can predict most of its properties.

### Axis 1 — How is the continuous value represented?

| Representation | Models | Note |
|---|---|---|
| **Discrete tokenization** (quantise values into a vocabulary, then autoregress over tokens) | Chronos 🔗 [2403.07815](https://arxiv.org/abs/2403.07815), Lag-Llama 🔗 [2310.08278](https://arxiv.org/abs/2310.08278), TimeGPT | Borrowed directly from NLP. Gives in-context learning for free but quantisation is lossy and cap-dependent |
| **Patching** (subseries as tokens, values stay continuous) | TimesFM 🔗 [2310.10688](https://arxiv.org/abs/2310.10688), PatchTST 🔗 [2211.14730](https://arxiv.org/abs/2211.14730), Chronos-2, TiRex, Moirai 2.0 | Current default. Retains local semantics, cuts attention cost quadratically |
| **Continuous generative** (flow matching / diffusion, no tokenisation) | Sundial 🔗 [2502.00816](https://arxiv.org/abs/2502.00816) | Generates multiple plausible futures natively. See [[Generative and Probabilistic Forecasting]] |

### Axis 2 — What is the prediction target?

- **Point + quantiles** (most common): trained with quantile/pinball loss, emits `k` quantiles.
  Chronos-2, TiRex, Moirai 2.0, Toto 2.0.
- **Distribution mixture**: Moirai 1.0 emitted a mixture density. Moirai 2.0 **abandoned
  this** — it added complexity and was empirically worse than a plain quantile loss. A
  documented negative result worth knowing.

### Axis 3 — Is there cross-series / in-context learning?

- **No**: the model sees one series at a time. TimesFM, Moirai, Toto.
- **Yes (group attention)**: Chronos-2 🔗 [2510.15821](https://arxiv.org/abs/2510.15821)
  alternates time-attention within a series with **group-attention** across a group of
  related series, enabling genuine in-context learning across items, variates, and
  target/covariate pairs.
- **Yes (covariate-conditioned)**: TiRex-2 🔗 [2607.01204](https://arxiv.org/abs/2607.01204),
  Toto 2.0.

### Axis 4 — Backbone

| Backbone | Why | Models |
|---|---|---|
| Decoder-only transformer | Autoregressive, in-context learning | TimesFM, Moirai 2.0, Toto |
| Encoder-only transformer | Parallel, masked pretraining | Chronos-2 (T5-style) |
| **xLSTM** | Keeps **state tracking** *and* gains in-context learning | **TiRex** 🔗 [2505.23719](https://arxiv.org/abs/2505.23719) |
| Hybrid conv + DeltaNet | Linear complexity, tiny parameter count | Reverso 🔗 [2602.17634](https://arxiv.org/abs/2602.17634) |

> ### The xLSTM argument is the most interesting result in this area
>
> TiRex's claim is specific and testable: transformers often **underperform LSTMs** on time
> series, because long-horizon forecasting depends on maintaining an internal process
> *state*, and self-attention is permutation-invariant and stateless in that sense.
> xLSTM gets in-context learning from transformers while retaining the recurrence that
> carries state.
>
> TiRex is **35M parameters** and beat TabPFN-TS, Chronos-Bolt, TimesFM and Moirai on both
> GIFT-Eval and Chronos-ZS — including models orders of magnitude larger. Reverso pushes
> further: 2.6M parameters, MASE 0.706 on GIFT-Eval vs 0.711 for Xihe-Max at 1.5B.
>
> **Implication for model selection: parameter count is not a proxy for quality in this
> field, and the scaling story that worked for LLMs has not transferred cleanly.**

---

## 2. The models

### Open weights, forecasting

| Model | Params | Backbone | Context / Horizon | Highlights |
|---|---|---|---|---|
| **Chronos-2** 🔗 [2510.15821](https://arxiv.org/abs/2510.15821) · [HF](https://huggingface.co/amazon/chronos-2) | 120M | T5-style encoder | 8192 / 1024 | The current reference point. Univariate + multivariate + **past-only and future-known covariates** in one architecture, via group attention. >300 forecasts/sec on one A10G. SOTA on fev-bench, GIFT-Eval, Chronos Benchmark II |
| **TiRex** 🔗 [2505.23719](https://arxiv.org/abs/2505.23719) · [HF](https://huggingface.co/NX-AI/TiRex) | 35M | xLSTM | — | Best aggregate CRPS on GIFT-Eval (0.411) among non-leaking zero-shot models. Tiny, CPU-friendly |
| **TiRex-2** 🔗 [2607.01204](https://arxiv.org/abs/2607.01204) | 38.4M univariate (+44.1M multivariate) | xLSTM | streaming | Multivariate + covariates + **streaming** inference as new data arrives |
| **Timestral** 🔗 [GH](https://github.com/mistralai/timestral) · [HF](https://huggingface.co/collections/mistralai/timestral) · [blog](https://mistral.ai/news/timestral) | 5M / 28M / 123M / 209M | Causal patch transformer + **Decoupled Horizon Forecasting (DHF)** | 32,768 / block-decoded | **Mistral AI.** Claims **#1 on all three** public benchmarks at launch — GIFT-Eval, TIME (98 tasks), fev-bench (100 tasks); all four sizes on the accuracy/size Pareto front. **Native 21 quantiles**, past + known-future + **categorical** covariates, CPU inference. See §2.1 |
| **Chronos-Bolt** 🔗 [2403.07815](https://arxiv.org/abs/2403.07815) | 9M–710M | T5 | 2048 / 64 | Older, fast, univariate. Superseded by Chronos-2 for most purposes |
| **Moirai 2.0** 🔗 [2511.11698](https://arxiv.org/abs/2511.11698) · [HF](https://huggingface.co/Salesforce/moirai-2.0-R-small) | 11M (Small) | Decoder-only | — | 30× smaller and 2× faster than Moirai-1.0-Large, and better. Performance **plateaus with parameter count** and declines at long horizons |
| **TimesFM** 🔗 [2310.10688](https://arxiv.org/abs/2310.10688) · [GH](https://github.com/google-research/timesfm) | 200M+ | Decoder-only | up to 16k (v2.5) | v3.0 adds native multivariate and covariate support |
| **Toto 2.0** 🔗 [2605.20119](https://arxiv.org/abs/2605.20119) · [HF](https://huggingface.co/Datadog/Toto-2.0-22m) | 4M → 2.5B | u-μP scaled transformer | — | **The cleanest scaling result in the field**: one recipe, five sizes, every size on the GIFT-Eval Pareto frontier. Observability-specialised (heterogeneous frequency, high dimensionality). 22M matches 1.0's 151M with ~7× fewer params |
| **Sundial** 🔗 [2502.00816](https://arxiv.org/abs/2502.00816) · [GH](https://github.com/thuml/Sundial) | — | Transformer + flow matching | 2880 | **Generative** — multiple plausible futures, no parametric density assumed. Trained on TimeBench, 1 trillion time points. ~35× faster inference than Chronos |
| **Reverso** 🔗 [2602.17634](https://arxiv.org/abs/2602.17634) | 2.6M | Conv + DeltaNet hybrid | — | Argues large transformers are unnecessary for zero-shot. GIFT-Eval MASE 0.706 at 2.6M params |
| **Lag-Llama** 🔗 [2310.08278](https://arxiv.org/abs/2310.08278) | — | LLaMA decoder + lags | — | Probabilistic, open. Largely superseded |
| **PatchTST-FM** 🔗 [2602.06909](https://arxiv.org/abs/2602.06909) · [HF](https://huggingface.co/ibm-research/patchtst-fm-r1) | ~260M | Patch transformer | 8192 / 64 | **IBM.** d_model 1024, patch 16, **99 quantile levels**. 2026 result: a *generic* patch transformer plus a good training recipe reaches SOTA on GIFT-Eval. Also `ibm-granite/granite-timeseries-patchtst-fm-r1/r2` |
| **t0** 🔗 [2609.24559](https://arxiv.org/abs/2609.24559) · [HF](https://huggingface.co/theforecastingcompany/t0-beta) | 102M (α) / 256M (β) | Decoder patch transformer, alternating time/variate attention | 1024 direct | **The Forecasting Company.** Apache-2.0. Native **past + known-future covariates**. GIFT-Eval CRPS 0.4738 / MASE 0.6865 (3rd, within 4% of best); fev skill 46.7 (3rd) |
| **MOMENT** 🔗 [2402.03885](https://arxiv.org/abs/2402.03885) | small/large | T5 encoder, masked | 512 | Not forecasting-only — also classification, imputation, **anomaly detection**. See [[Time Series Anomaly Detection]] |
| **TinyTimeMixers (TTM)** 🔗 IBM | 1M-ish | MLP mixer | — | Edge deployment. Strong per-parameter efficiency |
| **FlowState** 🔗 [arXiv:2508.05287](https://arxiv.org/abs/2508.05287) | — | Diffusion / flow | — | **Sampling-rate invariant** forecasting — trained across frequencies rather than per-frequency |
| **TabPFN (v2 for time series)** 🔗 [arXiv:2501.02945](https://arxiv.org/abs/2501.02945) | — | TabPFN backbone | — | A *tabular* foundation model repurposed for forecasting. Unexpectedly strong; one of the models TiRex had to beat |
| **TabFM** 🔗 [arXiv:2609.37959](https://arxiv.org/abs/2609.37959) | 400M | Tabular FM, in-context learning | — | Google Research. **No time-series variant exists yet** — listed because it is the strongest current claim that *synthetic-only* pretraining transfers, which is the mechanism every TSFM above relies on. Trained purely on synthetic tables from structural causal models; #1 among tabular FMs on TabArena (51 datasets) |
| **Timer** 🔗 [arXiv:2402.02368](https://arxiv.org/abs/2402.02368) · **Timer-XL** 🔗 [arXiv:2410.04803](https://arxiv.org/abs/2410.04803) | — | Decoder-only | long context | THUML; large expert counts. Weak on recent benchmarks |
| **Time-MoE** 🔗 [arXiv:2409.16040](https://arxiv.org/abs/2409.16040) | — | Decoder-only + MoE | — | Billion-scale MoE. Superseded in practice by smaller models |

### Commercial / hosted

**TimeGPT** 🔗 [arXiv:2310.03589](https://arxiv.org/abs/2310.03589) — Nixtla, API-first.
Forecast and anomaly detection from a few lines. Supports intervals, exogenous variables and
fine-tuning. See [[Nixtlaverse]] for the full ecosystem.

### 2.1 Timestral (Mistral AI) — worth its own treatment

**No paper.** The repo links a blog post and Hugging Face model cards; there is no arXiv entry
to check methodology against. That is the first thing to know about a claim of "#1 on three
benchmarks."

```bash
pip install git+https://github.com/mistralai/timestral.git   # not on PyPI; Python >=3.10, torch >=2.4
```

| Property | Value |
|---|---|
| Sizes | 5M (21 MB) · 28M (111 MB) · 123M (490 MB) · 209M (837 MB) |
| Context | up to **32,768 steps** — among the longest published |
| Probabilistic | **21 quantiles per step**, guaranteed non-crossing |
| Covariates | past-only, known-future, and **categorical** (target-encoded) |
| Inference | **CPU-only is fine** — needs just PyTorch, NumPy, `safetensors`, `huggingface_hub` |
| Licence | **code** Apache-2.0; **weights** Modified MIT (see below) |

**Architecture — DHF.** Causal patch transformer trained with **Decoupled Horizon
Forecasting**: forecasts come from separate *prediction tokens* reading a causally-encoded
context. Each variate is a target, a past-only covariate, or a known-future covariate;
covariates pass information *to* targets but never read them, and only known-future covariates
see the forecast horizon. Each forecast patch is denormalised with the context statistics and
the block's earlier predicted medians — that is instance normalisation, and it is the mechanism
behind [[Distribution Shift and Normalization]].

Horizons beyond one decode block (32 patches = 1,024 steps) are produced block by block, each
block's median fed back as context.

> ### ⚠️ Split licence — read this before deploying
>
> The **code** is Apache-2.0. The **weights are a separate Modified MIT** with a third-party
> rights clause. This is the first entry in this table where the model artefact and the code
> are licensed differently, and it is the kind of detail that gets missed until procurement asks.

> ### ⚠️ The "#1 on three benchmarks" claim needs decomposing
>
> This is finding 1 applied to a specific claim. Timestral reports #1 on **GIFT-Eval**, **TIME**
> (98 tasks) and **fev-bench** (100 tasks) among pretrained and zero-shot models.
>
> Two different things are being averaged together:
>
> - **TIME** is *designed* to be contamination-resistant (🔗 [arXiv:2602.12147](https://arxiv.org/abs/2602.12147)) — it is the most meaningful of the three, and the one to weight.
> - **GIFT-Eval** and **fev-bench** are public corpora, and Mistral's pre-training corpus is not
>   disclosed in the README. Per finding 1, **"trained on public data, evaluated on a public
>   benchmark" is not zero-shot** — TiRex documented leakage rates of 10–19% for its
>   competitors on exactly this axis.
>
> So: a genuinely strong result on TIME, plus two leaderboard positions whose independence from
> the pre-training corpus cannot be checked from the public material. Not disqualifying —
> unverifiable, which is different. Worth one run on your own data before it enters a study.

### Not strictly forecasting

| Model | Task | Link |
|---|---|---|
| **MOMENT** | forecasting, classification, imputation, anomaly detection | 🔗 [2402.03885](https://arxiv.org/abs/2402.03885) |
| **Uni2TS / Moirai** | library underpinning Moirai | 🔗 [2402.02592](https://arxiv.org/abs/2402.02592) |

---

## 3. The three findings that should change your practice

### ⚠️ 1. "Zero-shot" is often contaminated

TiRex documents explicit **zero-shot leakage**: benchmark overlap rates of Moirai 19%,
TimesFM 10%, TTM 16%. A model pretrained on a dataset's training split then evaluated
zero-shot on it is not zero-shot.

> **Always check contamination before trusting a leaderboard claim.** Models now release
> *decontaminated* checkpoints specifically for this — use them. When reading a TSFM paper,
> ask what fraction of the benchmark corpus was in pre-training.

### ⚠️ 2. There is an accuracy vs calibration trade-off

TSFM-Eval 🔗 [arXiv:2609.25788](https://arxiv.org/abs/2609.25788) (ADBIS 2026) benchmarked
six TSFMs against statistical baselines and PatchTST on unseen energy, traffic and financial
data and found a consistent structure:

- **xLSTM architectures (TiRex) — robust probabilistic calibration across horizons**
- **Patch transformers — competitive point accuracy, calibration degrades at long horizons**
- Transformer models show **context saturation**: a point beyond which more look-back hurts

> The model that forecasts best and the model whose intervals are trustworthy can be
> different models. For staffing work this is the whole question — see
> [[Model Validation Strategies]] §6.4.

> **Timestral's 21 native quantiles do not settle this.** Emitting many quantiles is a
> *sharpness* capability; it says nothing about whether the interval is *conditional* — i.e.
> whether the 90% holds at peaks specifically. The finding above is about calibration *degrading
> with horizon*, which Timestral's per-patch denormalisation (§2.1) plausibly addresses, but
> that is a mechanism, not evidence. Timestral's own reporting is CRPS/MASE on public
> benchmarks; **no peak-stratified coverage evaluation is published**. That gap is the same one
> [[Conformal Prediction]] §4 describes, and it is the thing to measure if Timestral goes into
> the 168-point study.

### ⚠️ 3. The zero-shot advantage shrinks as your data grows

The original framing in `resources.md` — "compelling for cold-start, underperforms well-tuned
SARIMAX or GBDT once you have several years" — still holds, with one refinement from
Laglil et al. 🔗 [arXiv:2607.23146](https://arxiv.org/abs/2607.23146): **fine-tuning
consistently improves over zero-shot**, and the pre-training/fine-tuning gap is the thing to
budget compute against, not zero-shot versus trained-from-scratch.

For hourly 9-1-1 data with 2–5 years of history, the ordering to expect is roughly:

```
strong TSFM  ≈  tuned linear/GBDT  >  N-HiTS  >  seasonal naive (m=168)
```
with the TSFM's edge concentrated at short horizons and on series with gaps or anomalies.

---

## 4. Benchmarks

| Benchmark | What it is | Link |
|---|---|---|
| **GIFT-Eval** | 24 datasets, 97 evaluation settings, general-purpose. The de facto standard leaderboard | 🔗 [arXiv:2410.10393](https://arxiv.org/abs/2410.10393) · [leaderboard](https://huggingface.co/spaces/Salesforce/GIFT-Eval) |
| **fev-bench** | AutoGluon leaderboard, emphasis on multivariate and covariate-informed tasks | 🔗 [arXiv:2509.26468](https://arxiv.org/abs/2509.26468) |
| **Chronos-ZS** | Chronos zero-shot benchmark, 27 datasets, short-horizon | 🔗 [autogluon/fev-leaderboard](https://huggingface.co/spaces/autogluon/fev-leaderboard) |
| **TIME** | Contamination-resistant, multi-level | 🔗 [arXiv:2602.12147](https://arxiv.org/abs/2602.12147) |
| **BOOM** | Datadog observability — 350M observations, 2,807 series | 🔗 via [2505.14766](https://arxiv.org/abs/2505.14766) |
| **TSFM-Eval** | Accuracy **and** calibration, on genuinely unseen domains | 🔗 [arXiv:2609.25788](https://arxiv.org/abs/2609.25788) · [code](https://github.com/unic-ailab/TSFM-Eval) |
| **Monash Archive** | 30+ datasets, unified long format | 🔗 [arXiv:2105.06643](https://arxiv.org/abs/2105.06643) |

### ⚠️ The benchmark contamination problem

Toto 2.0's authors make the point sharply: models pretrained *directly on public corpora*
face a weaker generalisation test on public benchmarks, because they have seen those
domains. Toto 2.0's base models were trained on Datadog observability data and had **never
seen any public evaluation domain** — making its public-benchmark numbers a cleaner
cross-domain generalisation test than most competitors.

> Practical implication: treat leaderboard position as weak evidence. Prefer a model whose
> pretraining you can inspect, or run it yourself on your own data. See
> Practice 03 — Zero-Shot Foundation Model Bake-Off.

---

## 5. Integration and deployment

| Tool | What it gives you | Link |
|---|---|---|
| **Darts** `FoundationModel` | Unified interface: Chronos-2, TimesFM 2.5, TiRex, PatchTST-FM behind one API with backtesting | 🔗 [arXiv:2606.27438](https://arxiv.org/abs/2606.27438) |
| **TimeCopilot** | Agentic layer — LLM orchestrates a model hub | see [[TimeCopilot]] |
| **StatsForecast** | Now carries TSFMs alongside statistical models | see [[Nixtlaverse]] |
| **GluonTS** | Native probabilistic and deep model support | — |

> **TimeCopilot's model hub is the most complete single listing available** and is worth
> reading as a catalogue even if you never run the framework: Chronos, Chronos-2, FlowState,
> Moirai, Sundial, TabPFN, TiRex, TimeGPT, TimesFM, Toto, plus ADIDA / AutoARIMA / AutoETS /
> Theta / SeasonalNaive / Prophet / AutoLGBM / AutoNHITS / AutoTFT, and `MedianEnsemble`
> across families. 🔗 https://timecopilot.dev/model-hub/

> **Darts is the most direct path to a foundation-model arm in an existing study.** The
> `FoundationModel` class means you can drop Chronos-2 into a backtesting pipeline with the
> same interface as anything else, which removes most of the friction of adding a zero-shot
> arm to the [[168-Point Forecast Comparison - Discrete vs Continuous]] design.

---

## 6. Open questions

| Question | Status |
|---|---|
| Does pre-training help or hurt on a *very* domain-specific series? | Under-tested. Most benchmarks are cross-domain averages |
| Why do patch transformers calibrate worse at long horizons? | Not explained. The empirical finding is solid, the mechanism is not |
| What is the right objective for a generative TSFM? | Open — Sundial's flow matching vs quantile loss is unresolved |
| Can a TSFM be *conditioned* on domain knowledge usefully? | Chronos-2's group attention is the first real answer; underexplored |
| Conditional coverage | Still unsolved — see [[Model Validation Strategies]] §6.4 |
| Is the scaling story real? | Contested. Toto 2.0 says yes; Reverso and Moirai 2.0 say parameter count is not the driver |
| Does purely-synthetic pretraining transfer to *temporal* data? | **Open, and it is the load-bearing assumption.** TabFM 🔗 [arXiv:2609.37959](https://arxiv.org/abs/2609.37959) shows it works for tables — trained only on synthetic SCM tables, #1 among tabular FMs on 51 real datasets. Every TSFM above relies on pretraining corpora nobody fully discloses. The temporal case is untested |

---

## References

**Foundation models**
1. Ansari, A.F. et al. (2024). Chronos: Learning the Language of Time Series. 🔗 https://arxiv.org/abs/2403.07815
2. Ansari, A.F. et al. (2025). Chronos-2: From Univariate to Universal Forecasting. 🔗 https://arxiv.org/abs/2510.15821
3. Auer, A. et al. (2025). TiRex. *NeurIPS 2025*. 🔗 https://arxiv.org/abs/2505.23719
4. Podest, P. et al. (2026). TiRex-2: Generalizing TiRex to Multivariate Data and Streaming. 🔗 https://arxiv.org/abs/2607.01204
5. Liu, C. et al. (2025). Moirai 2.0: When Less Is More. 🔗 https://arxiv.org/abs/2511.11698
6. Woo, G. et al. (2024). Unified Training of Universal Time Series Forecasting Transformers (Moirai/Uni2TS). 🔗 https://arxiv.org/abs/2402.02592
7. Das, A. et al. (2024). A decoder-only foundation model (TimesFM). 🔗 https://arxiv.org/abs/2310.10688
8. Cohen, B. et al. (2025). This Time is Different (Toto / BOOM). 🔗 https://arxiv.org/abs/2505.14766
9. Khwaja, E. et al. (2026). Toto 2.0: Time Series Forecasting Enters the Scaling Era. 🔗 https://arxiv.org/abs/2605.20119
10. Liu, Y. et al. (2025). Sundial. *ICML 2025*. 🔗 https://arxiv.org/abs/2502.00816
11. Fu, X. et al. (2026). Reverso: Efficient TSFMs for Zero-shot Forecasting. 🔗 https://arxiv.org/abs/2602.17634
12. Rasul, A. et al. (2023). Lag-Llama. 🔗 https://arxiv.org/abs/2310.08278
13. Goswami, M. et al. (2024). MOMENT. *ICML 2024*. 🔗 https://arxiv.org/abs/2402.03885
14. Garza, A., Challú, C. & Mergenthaler Canseco, M. (2023). TimeGPT-1. 🔗 https://arxiv.org/abs/2310.03589
15. Nguyen, H. et al. (2024). ChronosX: adapting pretrained TS models with exogenous variables. 🔗 https://arxiv.org/abs/2503.12107
16. Graf, L., Ortner, T., Woźniak, S. & Pantazi, A. (2025). FlowState: sampling rate invariant time series forecasting. 🔗 https://arxiv.org/abs/2508.05287
17. Hoo, S.B., Müller, S., Salinas, D. & Hutter, F. (2025). From tables to time: how TabPFN-v2 outperforms specialized time series forecasting models. 🔗 https://arxiv.org/abs/2501.02945
18. Liu, Y. et al. (2024). Timer: generative pre-trained transformers are large time series models. 🔗 https://arxiv.org/abs/2402.02368
19. Liu, Y. et al. (2025). Timer-XL: long-context transformers for unified time series forecasting. 🔗 https://arxiv.org/abs/2410.04803
20. Shi, X. et al. (2025). Time-MoE: billion-scale time series foundation models with mixture of experts. 🔗 https://arxiv.org/abs/2409.16040
21. Wen, Y., Gifford, W.M., Reddy, C., Nguyen, L.M., Kalagnanam, J. & Julius, A.A. (2026). Revisiting the Generic Transformer: Deconstructing a Strong Baseline for Time Series Foundation Models (PatchTST-FM). *IBM Research / RPI*. 🔗 https://arxiv.org/abs/2602.06909
22. Meyer, L. et al. (2026). $t_0$: A Time-Series Foundation Model for Forecasting with Context. *The Forecasting Company*. 🔗 https://arxiv.org/abs/2609.24559
23. **Mistral AI (2026). Timestral** — time series foundation models for multivariate probabilistic forecasting. *No paper published; blog post and model cards only.* 🔗 https://github.com/mistralai/timestral · 🔗 https://mistral.ai/news/timestral · 🔗 https://huggingface.co/collections/mistralai/timestral
24. Kong, W. et al. (2026). TabFM: A Zero-Shot Foundation Model for Tabular Data. *Google Research*. 🔗 https://arxiv.org/abs/2609.37959 — **tabular, not temporal**; pretraining on synthetic SCM tables
25. Fu, D. et al. (2026). TabFM-Auto: Self-Evolving Pipelines for Tabular Foundation Models. *Google Research / DeepMind / USC / Harvard / UT Austin*. 🔗 https://arxiv.org/abs/2609.37989

**Surveys and evaluation**
26. Liang, Y. et al. (2024). Foundation Models for Time Series Analysis: A Tutorial and Survey. (listed within 🔗 https://arxiv.org/abs/2411.05793)
27. Aksu, T. et al. (2024). Gift-Eval. 🔗 https://arxiv.org/abs/2410.10393
28. Shchur, A. et al. (2025). fev-bench. 🔗 https://arxiv.org/abs/2509.26468
29. Michael, P., Symeonides, M. & Trihinas, D. (2026). Evaluating Accuracy and Probabilistic Reliability of Zero-Shot TSFMs. *ADBIS 2026*. 🔗 https://arxiv.org/abs/2609.25788
30. Laglil, M. et al. (2026). Foundation Models and Fine-Tuning: Toward a New Generation. 🔗 https://arxiv.org/abs/2607.23146
31. Dai, Z., Bader, D. & Gysi, A. (2026). Unified Zero-Shot Time Series Forecasting: A Darts Foundation. 🔗 https://arxiv.org/abs/2606.27438
32. Garza, A. & Rosillo, R. (2025). TimeCopilot — the most complete public TSFM catalogue. 🔗 https://arxiv.org/abs/2509.00616
33. Qiao, Z. et al. (2026). It's TIME: Towards the Next Generation of Time Series Forecasting Benchmarks. *ICML 2026*. 🔗 https://arxiv.org/abs/2602.12147

## Status

- [x] Four design axes framework
- [x] Full model table with verified arXiv links and parameter counts
- [x] Contamination, calibration trade-off, scaling findings
- [x] Benchmark table with contamination caveats
- [x] Integration options

## Cross-links

- [[TimeCopilot]]
- [[Nixtlaverse]]
- [[Generative and Probabilistic Forecasting]]
- [[Linear Models for Forecasting]]
- [[Distribution Shift and Normalization]]
- [[LLM-as-Forecaster and Agentic Forecasting]]
- [[Practice 03 — Zero-Shot Foundation Model Bake-Off]]
- [[resources]]
- [[time-series-forecasting-models]]
