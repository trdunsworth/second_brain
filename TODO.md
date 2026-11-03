# 🚀 Data Science Roadmap

This file tracks the remaining tasks to complete the foundation and advanced specializations.

## ✅ Phase 1: Unsupervised Learning - COMPLETE
*Finding hidden patterns in unlabeled data.*

### Clustering
- [x] K-Means Clustering (Centroid-based)
- [x] Hierarchical Clustering (Dendrogram)
- [x] DBSCAN (Density-based) + HDBSCAN

### Dimensionality Reduction
- [x] Principal Component Analysis (PCA)
- [x] t-SNE (Non-linear)
- [x] UMAP (Manifold learning)

---

## ✅ Phase 2: Neural Networks & Deep Learning - COMPLETE
*The culmination of Linear Algebra, Multivariable Calculus, and Information Theory.*

- [x] **Perceptrons & Multi-Layer Perceptrons (MLP)**: The basic unit and universal approximators.
- [x] **Backpropagation & Gradient Descent**: The chain rule in action - how networks actually learn.
- [x] **Convolutional Neural Networks (CNNs)**: Spatial hierarchies for image processing.
- [x] **Recurrent Neural Networks (RNNs) & LSTMs**: Handling sequential data and the "Vanishing Gradient" problem.
- [x] **Transformers & Attention**: The architecture behind GPT and BERT (Multi-head attention, positional encoding).

---

## ✅ Phase 3: Data Engineering & MLOps - COMPLETE
*Scaling and deploying models.*

- [x] **Model Deployment**: FastAPI, Docker, ONNX Runtime, Triton Inference Server
- [x] **Big Data Tools**: Spark (PySpark), Polars, DuckDB, SQL optimization
- [x] **Data Orchestration**: Airflow, Prefect, Dagster, dbt
- [x] **Experiment Tracking**: MLflow, Weights & Biases, DVC, Model Registry

---

## ✅ Phase 4: Time Series Forecasting - COMPLETE (Integrated from existing vault)
*Specialized domain at the intersection of Statistics, ML, and Domain Knowledge.*

- [x] **Foundations**: Stationarity, ACF/PACF, Decomposition, State Space Models
- [x] **Classical**: ARIMA, ETS, Structural TS, BSTS/CausalImpact
- [x] **Feature-Based ML**: Lags, Rolling, Calendar, Linear (DLinear), Gradient Boosting
- [x] **Deep Learning**: RNNs, Temporal Fusion Transformers, Foundation Models (Chronos, TimesFM)
- [x] **Probabilistic**: Quantile Regression, Conformal Prediction, Diffusion/Flow Matching
- [x] **Specialized**: Intermittent Demand, Anomaly Detection, Change-Point, Hierarchical Reconciliation
- [x] **Forecasting MLOps**: Rolling Origin Validation, Drift Monitoring, Forecast Combination
- [x] **LLM Integration**: Time-LLM, TimeCopilot, Agentic Forecasting
- [x] **Practice Series**: 5 hands-on notebooks (Harness → Linear → TSFM → Conformal → Intermittent)

---

## ✅ Phase 5.1: NLP & LLMs - COMPLETE
*Building, aligning, and deploying Large Language Models.*

- [x] **Transformer Architectures**: Encoder (BERT), Decoder (GPT), Encoder-Decoder (T5)
- [x] **Pre-training Objectives**: MLM, CLM, Span Corruption, ELECTRA
- [x] **Fine-tuning**: Full FT, LoRA/QLoRA, Adapters, Prompt Tuning
- [x] **Alignment**: RLHF (PPO), DPO, KTO, ORPO, Constitutional AI
- [x] **RAG**: Retrieval, Embeddings, Reranking, GraphRAG, Agentic RAG
- [x] **Inference Optimization**: KV Caching, Quantization (GPTQ/AWQ), Speculative Decoding, vLLM/TGI
- [x] **Evaluation**: Benchmarks (MMLU, MT-Bench), LLM-as-Judge, Red Teaming

---

## ✅ Phase 5.2: Reinforcement Learning - COMPLETE
*Sequential decision making and policy optimization.*

- [x] **Foundations**: MDPs, Bellman Equations, Value/Policy Iteration, Tabular Methods
- [x] **Policy Gradient**: REINFORCE, Actor-Critic, A2C/A3C, GAE
- [x] **Deep Value-Based**: DQN, Double DQN, Dueling, Rainbow (C51, QR-DQN, Noisy Nets)
- [x] **Policy Optimization**: PPO (Clipped, KL Penalty), TRPO, SAC (Entropy Regularization), TD3
- [x] **Multi-Agent RL**: MAPPO, QMIX, VDN, IPPO, Mean Field, MARL in Cooperative/Competitive
- [x] **Offline RL**: BCQ, CQL, IQL, TD3+BC, Decision Transformer, Trajectory Transformer
- [x] **RLHF Infrastructure**: Reward Model Training, Comparison Data Collection, Scaling Laws, Iterative DPO

---

## ✅ Phase 5.3: Causal ML - COMPLETE
*Moving beyond correlation to causal inference and decision making.*

- [x] **Potential Outcomes Framework**: SUTVA, ATE/ATT/ATC, Unconfoundedness, Positivity
- [x] **Estimation Methods**: IPW, Matching (PSM, Genetic, Coarsened Exact), Doubly Robust (AIPW, TMLE), G-Computation
- [x] **Causal Discovery**: PC Algorithm, GES, FCI, NOTEARS (DAG Learning), LiNGAM, Causal Sufficiency
- [x] **Double/Debiased ML**: DML (Chernozhukov et al.), Orthogonal Scores, Cross-fitting, Neyman Orthogonality
- [x] **Heterogeneous Treatment Effects**: Causal Forests (GRF), BART, Metalearners (S/T/X/R-Learner), CATE Estimation
- [x] **Quasi-Experiments**: IV (2SLS, LATE), RDD (Sharp/Fuzzy), DiD (TWFE, Event Study, Callaway-Sant'Anna), Synthetic Control
- [x] **Tools**: EconML, DoWhy, CausalML, PyWhy, Dowhy
- [x] **Applications**: A/B Test Analysis, Pricing, Marketing Mix, Policy Evaluation, Fairness/Recourse

---

## ✅ Phase 5.4: Generative AI (Beyond LLMs) - COMPLETE
*Diffusion, Flow Matching, and Multimodal Generation.*

- [x] **Diffusion Models**: DDPM, DDIM, Score-Based Generative Modeling, SDEs, Probability Flow ODE
- [x] **Latent Diffusion**: Stable Diffusion (LDM), VAE, Latent Consistency Models, Distillation
- [x] **Flow Matching**: Rectified Flow, Stochastic Interpolants, OT-CFM, Lightning Diffusion
- [x] **Video Generation**: SVD, Video Diffusion Models (AnimateDiff, ModelScope), Motion Control (ControlNet, MotionCtrl)
- [x] **Audio/Music**: AudioLDM, MusicLM, Stable Audio, Voice Cloning (VALL-E, XTTS), Codec Models (EnCodec, DAC)
- [x] **3D Generation**: NeRF, 3D Gaussian Splatting, LRM, TripoSR, DreamFusion, SDS
- [x] **Multimodal**: CLIP, Flamingo, LLaVA, GPT-4V, CoCa, Fuyu, Idefics
- [x] **Evaluation**: FID, CLIP Score, Human Preference, GenEval, T2I-CompBench

---

## ✅ Phase 5.5: MLOps at Scale - IN PROGRESS
*Production ML systems at enterprise scale.*

- [x] **Feature Platforms**: Feast, Tecton, Hopsworks, Online/Offline Stores, Feature Discovery, Point-in-Time Correctness
- [x] **Real-time Serving**: Triton Inference Server, BentoML, Ray Serve, vLLM, TensorRT-LLM, Batch vs Streaming Inference
- [x] **A/B Testing Platform**: Sequential Testing (SPRT, mSPRT), Interference/Network Effects, CUPED, Variance Reduction
- [x] **Model Monitoring**: Data Drift (PSI, KS, Chi2), Concept Drift (ADWIN, DDM), Performance Degradation, Evidently/WhyLabs/Fiddler
- [x] **ML Pipeline Orchestration**: Kubeflow Pipelines, Metaflow, Flyte, Dagster at Scale, Argo Workflows
- [x] **Governance & Compliance**: Model Cards, Data Lineage (OpenLineage), Audit Trails, EU AI Act, SOC2, Model Risk Management
- [x] **Cost Optimization**: GPU Utilization, Spot Instances, Model Cascading, Distillation, Quantization-Aware Training

---

## ✅ Phase 6: R Programming - COMPLETE
*Building a comprehensive R programming reference covering best practices, tidyverse, tidymodels, and ggplot2.*

- [x] **R Best Practices**: Project structure, renv, code style, testing, documentation
- [x] **Tidyverse**: dplyr, tidyr, readr, purrr, tibble, stringr, forcats, extended ecosystem
- [x] **Tidymodels**: parsnip, recipes, rsample, tune, workflows, yardstick, dials, deployment
- [x] **ggplot2**: Complete tutorial with Cedric Scherer's beautiful plotting guide

---

## 📊 Progress Summary

| Phase | Domain | Status | Notes |
|-------|--------|--------|-------|
| 1 | Math Foundations | ✅ | Linear Algebra → Calculus → Optimization → Info Theory |
| 2 | Statistics | ✅ | Descriptive → Probability → Inference → Bayesian → Causal |
| 3 | Statistical Tests | ✅ | Parametric + Non-Parametric full toolkit |
| 4 | Supervised ML | ✅ | Regression + Classification (Linear → Boosting) |
| 5 | Unsupervised ML | ✅ | Clustering + DimRed |
| 6 | Deep Learning | ✅ | MLP → CNN → RNN → Transformer |
| 7 | MLOps | ✅ | Deploy → Big Data → Orchestration → Tracking |
| 8 | Time Series | ✅ | Classical → ML → DL → Probabilistic → MLOps |
| **9** | **NLP & LLMs** | ✅ | **Arch → Pretrain → Finetune → Align → RAG → Inference → Eval** |
| **10** | **Reinforcement Learning** | ✅ **COMPLETE** | **MDP → Policy Grad → Deep RL → MARL → Offline → RLHF** |
| 11 | Causal ML | ✅ **COMPLETE** | **Potential Outcomes → Discovery → DML → Forests → Quasi-Exp** |
| 12 | Generative AI | ✅ **COMPLETE** | **Diffusion → Flow → Video/Audio/3D → Multimodal** |
| 13 | MLOps at Scale | ✅ **COMPLETE** | **Feature Stores → Real-time Serving → A/B Testing → Monitoring → Governance → Cost Optimization** |