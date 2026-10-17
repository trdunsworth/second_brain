# Time Series Paper Links

Anything struckthrough has been downloaded.

> **Updated 2026-10-14.** New sections appended at the end — foundation models, linear
> baselines, normalisation, generative/probabilistic, agentic, intermittent demand and
> anomaly detection. Every arXiv ID in the new sections was verified against arXiv on
> 2026-10-14.

## 2025-11-26

~~-[Interpretable_Machine_Learning_for_Time_Series_Analysis_A_Comparative_Study_with_Statistical_Models](https://www.researchgate.net/profile/Roidar-Khan-4/publication/395168353_Interpretable_Machine_Learning_for_Time_Series_Analysis_A_Comparative_Study_with_Statistical_Models/links/68daa61affdca73694b44012/Interpretable-Machine-Learning-for-Time-Series-Analysis-A-Comparative-Study-with-Statistical-Models.pdf)~~

~~-[TimePre](https://arxiv.org/pdf/2511.18539)~~

~~-[WaveTuner](https://arxiv.org/pdf/2511.18846)~~

~~-[PeriodNet](https://arxiv.org/pdf/2511.19497)~~

~~-[DDTime](https://arxiv.org/pdf/2511.16715)~~

~~-[MCANN](https://davidanastasiu.net/pdf/papers/2025-LiA-BayLearn25.pdf)~~

~~-[EMTSF](https://arxiv.org/pdf/2510.23396)~~

~~-[Multi-Horizon Time Series Forecast](https://arxiv.org/pdf/2511.13756)~~

~~-[PMTE-LLM](https://www.sciencedirect.com/science/article/pii/S0893608025012432)~~

~~-[MSOFormer](https://dl.acm.org/doi/abs/10.1145/3746252.3761143)~~

~~-[AdaPatch](https://dl.acm.org/doi/abs/10.1145/3746252.3761360)~~

~~-[TempoPFN](https://openreview.net/pdf?id=Iqex1gfnvc)~~

~~-[APT Affine Prototype-Timestamp For Time Series](https://arxiv.org/pdf/2511.12945)~~

~~-[RI-Loss](https://arxiv.org/pdf/2511.10130)~~

## 2025-12-10

- [A Framework for Time Series Analysis](https://www.researchgate.net/profile/Vladimir-Kurbalija/publication/221655998_A_Framework_for_Time-Series_Analysis/links/004635278dedd38377000000/A-Framework-for-Time-Series-Analysis.pdf#page=1.00&gsr=0)
- [Time Series Big Data](https://link.springer.com/content/pdf/10.1186/s40537-023-00760-1.pdf)
- [SageFormer](https://arxiv.org/pdf/2307.01616)
- [ForeTis](https://www.sciencedirect.com/science/article/pii/S2666827023000208)
- [LightCTS](https://arxiv.org/pdf/2302.11974)
- [SimpleTS](https://www.vldb.org/pvldb/vol16/p3741-chen.pdf)
- [Deep Learning for Time Series Forecasting](https://journals.sagepub.com/doi/pdf/10.1089/big.2020.0159)
- [An Analysis of Time Series Forecasting Analyses and Techniques](https://www.researchgate.net/profile/Pankaj-Malik-4/publication/375238697_An_Analysis_of_Time_Series_Analysis_and_Forecasting_Techniques/links/6544c6533fa26f66f4d0e70d/An-Analysis-of-Time-Series-Analysis-and-Forecasting-Techniques.pdf)
- [Auto-sktime](https://arxiv.org/pdf/2312.08528)
- [pyWatts](https://arxiv.org/pdf/2106.10157)
- [DeepTSF](https://www.sciencedirect.com/science/article/pii/S2352711024001298)
- [TSMixer](https://dl.acm.org/doi/pdf/10.1145/3580305.3599533)
- [Detecting Time Correlations in Time-Series Data Streams](https://shiftleft.com/mirrors/www.hpl.hp.com/techreports/2004/HPL-2004-103.pdf)
- [Prompt Engineering for Time Series Forecasting](https://machinelearningmastery.com/prompt-engineering-for-time-series-analysis/)

## 2026-10-14 — Foundation and Zero-Shot Models

Read first. Background on every model below is in [[Time Series Foundation Models]].

**Start here**
- [Time Series Foundation Models — survey/tutorial](https://arxiv.org/abs/2411.05793)
- [Chronos-2: From Univariate to Universal Forecasting](https://arxiv.org/abs/2510.15821) ⭐ current reference point
- [TiRex: Zero-Shot Forecasting Across Long and Short Horizons](https://arxiv.org/abs/2505.23719) ⭐ the xLSTM / state-tracking argument
- [Moirai 2.0: When Less Is More](https://arxiv.org/abs/2511.11698) ⭐ 30× smaller than 1.0 and better
- [Toto 2.0: Time Series Forecasting Enters the Scaling Era](https://arxiv.org/abs/2605.20119) ⭐ cleanest scaling result
- [Sundial: A Family of Highly Capable Time Series Foundation Models](https://arxiv.org/abs/2502.00816) ⭐ first generative TSFM
- [Reverso: Efficient TSFMs for Zero-shot Forecasting](https://arxiv.org/abs/2602.17634) — 2.6M params, challenges scaling
- [Evaluating Accuracy and Probabilistic Reliability of Zero-Shot TSFMs](https://arxiv.org/abs/2609.25788) ⭐ accuracy vs calibration trade-off
- [From tables to time: how TabPFN-v2 outperforms specialized TS models](https://arxiv.org/abs/2501.02945) — a tabular FM beating purpose-built ones
- [FlowState: sampling rate invariant time series forecasting](https://arxiv.org/abs/2508.05287) — cross-frequency training
- [Time-MoE: billion-scale TSFMs with mixture of experts](https://arxiv.org/abs/2409.16040)
- [Revisiting the Generic Transformer: Deconstructing a Strong Baseline (PatchTST-FM)](https://arxiv.org/abs/2602.06909) ⭐⭐ the 2026 echo of LTSF-Linear — architecture was noise, the recipe is the contribution
- [$t_0$: A Time-Series Foundation Model for Forecasting with Context](https://arxiv.org/abs/2609.24559) ⭐ known-future covariates + hourly energy case study
- [Timer: generative pre-trained transformers](https://arxiv.org/abs/2402.02368) / [Timer-XL](https://arxiv.org/abs/2410.04803)

**Foundations**
- [Chronos: Learning the Language of Time Series](https://arxiv.org/abs/2403.07815)
- [A decoder-only foundation model for time-series forecasting (TimesFM)](https://arxiv.org/abs/2310.10688)
- [Unified Training of Universal Time Series Forecasting Transformers (Moirai/Uni2TS)](https://arxiv.org/abs/2402.02592)
- [This Time is Different: An Observability Perspective (Toto 1.0 / BOOM)](https://arxiv.org/abs/2505.14766)
- [Toto: Time Series Optimized Transformer for Observability](https://arxiv.org/abs/2407.07874)
- [Lag-Llama](https://arxiv.org/abs/2310.08278)
- [MOMENT: A Family of Open Time-series Foundation Models](https://arxiv.org/abs/2402.03885)
- [TiRex-2: Generalizing TiRex to Multivariate Data and Streaming](https://arxiv.org/abs/2607.01204)
- [ChronosX: Adapting pretrained TS models with exogenous variables](https://arxiv.org/abs/2503.12107)
- [A Mamba Foundation Model for Time Series Forecasting](https://arxiv.org/abs/2411.02941)
- [TimeGPT-1](https://arxiv.org/abs/2310.03589)

**Evaluation and integration**
- [Gift-Eval: A benchmark for general time series forecasting model evaluation](https://arxiv.org/abs/2410.10393)
- [fev-bench](https://arxiv.org/abs/2509.26468)
- [Foundation Models and Fine-Tuning: Toward a New Generation](https://arxiv.org/abs/2607.23146)
- [Unified Zero-Shot Time Series Forecasting: A Darts Foundation](https://arxiv.org/abs/2606.27438)
- [Monash Time Series Forecasting Archive](https://arxiv.org/abs/2105.06643)

## 2026-10-14 — Linear Baselines and the LTSF Question

Read first. Background in [[Linear Models for Forecasting]].

- [Are Transformers Effective for Time Series Forecasting?](https://arxiv.org/abs/2205.13504) ⭐⭐ read this one first
- [A Time Series is Worth 64 Words: Long-term Forecasting with Transformers (PatchTST)](https://arxiv.org/abs/2211.14730) ⭐ the serious response
- [N-BEATS: Neural basis expansion analysis](https://arxiv.org/abs/1905.10437)
- [N-HiTS: Neural Hierarchical Interpolation](https://arxiv.org/abs/2201.12886)
- [Attributes that define forecasting benchmarks](https://arxiv.org/abs/2003.07823)

## 2026-10-14 — Distribution Shift and Normalization

Read first. Background in [[Distribution Shift and Normalization]].

- [Reversible Instance Normalization (RevIN)](https://openreview.net/forum?id=cGDAkQo1C0p) ⭐ ICLR 2022
- [On the Role of Reversible Instance Normalization](https://arxiv.org/abs/2603.11869) ⭐⭐ the 2026 ablation — read alongside RevIN
- [Noise or Signal? Deconstructing Contradictions in Reversible Normalization](https://arxiv.org/abs/2510.04667)
- [Addressing Distribution Shift with Instance Normalization Flows](https://arxiv.org/abs/2401.16777)
- [APT: Affine Prototype-Timestamp for Forecasting Under Distribution Shift](https://ojs.aaai.org/index.php/AAAI/article/view/38542)

## 2026-10-14 — Generative and Probabilistic Forecasting

Read first. Background in [[Generative and Probabilistic Forecasting]].

- [Diffusion Models for Time Series Forecasting: A Survey](https://arxiv.org/abs/2507.14507) ⭐
- [Diffusion Models for Time Series Applications: A Survey](https://arxiv.org/abs/2305.00624)
- [Autoregressive Denoising Diffusion Models (TimeGrad)](https://arxiv.org/abs/2101.12072)
- [CSDI: Conditional Score-based Diffusion Models](https://arxiv.org/abs/2107.03502)
- [A Decomposable Forward Process in Diffusion Models for TSF](https://arxiv.org/abs/2601.21812)
- [Flow Matching for Generative Modeling](https://arxiv.org/abs/2210.02747)
- [NGBoost: Natural Gradient Boosting for Probabilistic Prediction](https://arxiv.org/abs/2002.09495)
- [Conformalized Quantile Regression](https://arxiv.org/abs/1905.03222)
- [Adaptive Conformal Inference under Distribution Shift](https://arxiv.org/abs/2106.00170)
- [Conformal prediction interval for dynamic time-series (EnbPI)](https://proceedings.mlr.press/v139/xu21h.html)

## 2026-10-14 — Agentic and LLM Forecasting

Read first. Background in [[LLM-as-Forecaster and Agentic Forecasting]] and [[TimeCopilot]].

- [TimeCopilot](https://arxiv.org/abs/2509.00616) ⭐ Garza & Rosillo — note the reported SOTA comes from MedianEnsemble, not the agent
- [The Nixtlaverse: An Open-Source Ecosystem for Forecasting](https://arxiv.org/abs/2609.39741) ⭐
- [Synapse: Adaptive arbitration of complementary expertise](https://arxiv.org/abs/2511.05460)
- [TFR-Bench: A reasoning benchmark for evaluating forecasting systems](https://arxiv.org/abs/2604.05364)
- [Nexus: An Agentic Framework for Time Series Forecasting](https://arxiv.org/abs/2605.14389)
- [Time-LLM: Time Series Forecasting by Reprogramming LLMs](https://arxiv.org/abs/2310.01728) — read skeptically
- [Large language models are zero-shot time series forecasters (LLMTime)](https://arxiv.org/abs/2310.07820)
- [AutoTimes: autoregressive TSF via LLMs](https://arxiv.org/abs/2402.02370)
- [LLMs and Foundational Models: Not (Yet) as Good as Hoped (Bergmeir)](https://cbergmeir.com/papers/Bergmeir2024LLMs.pdf) ⭐⭐ the counterweight
- [The combination of forecasts (Bates & Granger 1969)](https://doi.org/10.1057/jors.1969.103) — the theory underneath every ensemble
- [A simple combination of univariate models (Petropoulos & Svetunkov)](https://doi.org/10.1016/j.ijforecast.2019.01.006)

## 2026-10-14 — Intermittent Demand and Anomaly Detection

Read first. Background in [[Intermittent and Sparse Demand]] and [[Time Series Anomaly Detection]].

- [On the categorization of demand patterns (Syntetos–Boylan)](https://doi.org/10.1057/palgrave.jors.2601840) ⭐
- [Intermittent demand: linking forecasting to inventory obsolescence (TSB)](https://doi.org/10.1016/j.ijforecast.2011.01.004)
- [Evaluating predictive count data distributions (Kolassa)](https://doi.org/10.1016/j.ijforecast.2015.12.004) ⭐
- [Isolation Forest](https://arxiv.org/abs/0811.0172)
- [OmniAnomaly](https://arxiv.org/abs/1809.10341)
- [USAD: UnSupervised Anomaly Detection on Multivariate Time Series](https://arxiv.org/abs/2009.13807)
- [Towards a rigorous evaluation of time-series anomaly detection](https://arxiv.org/abs/2103.15239) ⭐
- [Anomaly Detection in Time Series: A Comprehensive Evaluation](https://arxiv.org/abs/2202.03885)
- [A Range-based Metric for Anomaly Detection Benchmarking](https://arxiv.org/abs/2303.03241)
- [Navigating the metric maze: a taxonomy of evaluation metrics for TSAD](https://arxiv.org/abs/2403.13935)
