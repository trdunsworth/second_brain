# R Programming Learning Path

A structured path to mastering R for data science, from fundamentals to advanced applications.

## 1. R Programming Fundamentals
*Building a solid foundation in modern R development.*

### Core R
- [x] **Best Practices**: Project structure, renv, code style, testing, documentation
- [x] **Modern R Syntax**: Native pipe (|>), append pipe (R 4.2+), roxygen2, modern data frames

### Tidyverse Ecosystem
- [x] **Core Packages**: dplyr, tidyr, readr, purrr, tibble, stringr, forcats
- [x] **Extended**: data.table, vroom, arrow, duckdb, janitor, skimr

### Visualization
- [x] **ggplot2**: Complete tutorial with Cedric Scherer's beautiful plotting guide

---

# Machine Learning Learning Path

This path bridges the gap between the mathematical foundations and practical AI implementation.

## 1. Supervised Learning
*Learning from labeled data.*

### Regression (Predicting Continuous Values)
- [x] Linear Regression (Simple & Multiple)
- [x] Polynomial Regression
- [x] Ridge & Lasso Regression (Regularization)
- [x] Decision Tree Regression & Random Forest Regression

### Classification (Predicting Discrete Labels)
- [x] Logistic Regression
- [x] k-Nearest Neighbors (k-NN)
- [x] Support Vector Machines (SVM)
- [x] Decision Trees & Random Forests
- [x] Gradient Boosting Machines (XGBoost, LightGBM, CatBoost)

## 2. Unsupervised Learning
*Finding hidden patterns in unlabeled data.*

### Clustering
- [x] K-Means Clustering
- [x] Hierarchical Clustering
- [x] DBSCAN (Density-Based Spatial Clustering)

### Dimensionality Reduction
- [x] Principal Component Analysis (PCA)
- [x] t-SNE (t-Distributed Stochastic Neighbor Embedding)
- [x] UMAP (Uniform Manifold Approximation and Projection)

## 3. Neural Networks & Deep Learning
*Inspired by the human brain.*

- [x] Perceptrons & Multi-Layer Perceptrons (MLP)
- [x] Backpropagation & Gradient Descent
- [x] Convolutional Neural Networks (CNNs) - Image Data
- [x] Recurrent Neural Networks (RNNs) & LSTMs - Sequential Data
- [x] Transformers & Attention Mechanisms (The core of LLMs)

## 4. MLOps & Data Engineering
*Taking models from notebook to production.*

- [x] **Model Deployment**: FastAPI, Docker, ONNX Runtime, Triton Inference Server
- [x] **Big Data Tools**: Polars, DuckDB, PySpark, Dask, Data formats (Parquet, Delta Lake)
- [x] **Data Orchestration**: Airflow, Prefect, Dagster, dbt, CI/CD for pipelines
- [x] **Experiment Tracking**: MLflow, Weights & Biases, DVC, Model Registry

---

## 5. Time Series Forecasting
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

## 6. Advanced Specializations (Roadmap)
*Domain-specific deep dives building on the foundation.*

### 6.1 NLP & LLMs (COMPLETE)
- [x] **Transformer Architectures**: Encoder (BERT), Decoder (GPT), Encoder-Decoder (T5)
- [x] **Pre-training Objectives**: MLM, CLM, Span Corruption, ELECTRA
- [x] **Fine-tuning**: Full FT, LoRA/QLoRA, Adapters, Prompt Tuning
- [x] **Alignment**: RLHF (PPO), DPO, KTO, ORPO, Constitutional AI
- [x] **RAG**: Retrieval, Embeddings, Reranking, GraphRAG, Agentic RAG
- [x] **Inference Optimization**: KV Caching, Quantization (GPTQ/AWQ), Speculative Decoding, vLLM/TGI
- [x] **Evaluation**: Benchmarks (MMLU, MT-Bench), LLM-as-Judge, Red Teaming

### 6.2 Reinforcement Learning
- [x] **Foundations**: MDPs, Bellman Equations, Value/Policy Iteration
- [x] **Policy Gradient**: REINFORCE, Actor-Critic, A2C/A3C
- [x] **Deep RL**: DQN, Rainbow, C51, QR-DQN
- [x] **Policy Optimization**: PPO, TRPO, SAC, TD3
- [x] **Multi-Agent**: MAPPO, QMIX, Independent Learning, Mean Field
- [x] **Offline RL**: BCQ, CQL, IQL, Decision Transformer
- [x] **RLHF Infrastructure**: Reward Modeling, Comparison Data, Scaling Laws

### 6.3 Causal ML (COMPLETE)
- [x] **Potential Outcomes**: SUTVA, ATE/ATT/ATC, IPW, Matching, Doubly Robust
- [x] **Causal Discovery**: PC, GES, FCI, NOTEARS, LiNGAM
- [x] **Double/Debiased ML**: DML, Orthogonal Scores, Cross-fitting
- [x] **Causal Forests**: Generalized Random Forests, Heterogeneous Treatment Effects
- [x] **EconML/DoWhy**: IV, RDD, DiD, Synthetic Control
- [x] **Counterfactual Explanations**: Recourse, Algorithmic Fairness
- [x] **Quasi-Experiments**: IV, RDD, DiD, Synthetic Control, Staggered Adoption

### 6.4 Generative AI (Beyond LLMs) (COMPLETE)
- [x] **Diffusion Models**: DDPM, DDIM, Score Matching, Flow Matching, Rectified Flow
- [x] **Latent Diffusion**: Stable Diffusion, VAE, Latent Consistency Models
- [x] **Video Generation**: SVD, Video Diffusion Models, Motion Control
- [x] **Audio/Music**: AudioLDM, MusicLM, Stable Audio, Voice Cloning
- [x] **3D Generation**: NeRF, 3D Gaussian Splatting, LRM, TripoSR
- [x] **Multimodal**: CLIP, Flamingo, LLaVA, GPT-4V, CoCa

### 6.5 MLOps at Scale
- [x] **Feature Platforms**: Feast, Tecton, Hopsworks, Online/Offline Stores
- [x] **Real-time Serving**: Triton, BentoML, Ray Serve, vLLM, Batch vs Streaming
- [x] **A/B Testing**: Experiment Platform, Sequential Testing, Interference, Network Effects
- [x] **Model Monitoring**: Data Drift, Concept Drift, Performance Degradation, Evidently/WhyLabs
- [x] **ML Pipeline Orchestration**: Kubeflow, Metaflow, Flyte, Dagster at Scale
- [x] **Governance**: Model Cards, Lineage, Audit Trails, Regulatory Compliance
- [x] **Cost Optimization**: GPU Utilization, Spot Instances, Model Cascading, Distillation

---

### 6.6 R Programming
*Building a comprehensive R programming reference for data science, from fundamentals to advanced applications.*

#### R Programming Fundamentals
*Building a solid foundation in modern R development.*

- [x] **Best Practices**: Project structure, renv, code style, testing, documentation
- [x] **Modern R Syntax**: Native pipe (|>), append pipe (R 4.2+), roxygen2, modern data frames

#### Tidyverse Ecosystem
- [x] **Core Packages**: dplyr, tidyr, readr, purrr, tibble, stringr, forcats
- [x] **Extended**: data.table, vroom, arrow, duckdb, janitor, skimr

#### Visualization
- [x] **ggplot2**: Complete tutorial with Cedric Scherer's beautiful plotting guide

---

### 6.7 Python Programming
*Building a comprehensive Python programming reference for data science, from fundamentals to advanced applications.*

#### Python Fundamentals
*Building a solid foundation in modern Python development.*

- [x] **Best Practices**: Project structure, uv/poetry, code style, testing, documentation
- [x] **Modern Python Syntax**: Native pipe (|>), match-case (3.10+), pattern matching, structural pattern matching

#### Core Libraries
- [x] **Core Libraries**: NumPy, Pandas, Polars, DuckDB, PyArrow
- [x] **Core Libraries Cheatsheet**: Quick reference for daily use
- [x] **Tidyverse Equivalent**: pandas/polars vs R tidyverse mapping

#### Visualization
- [x] **plotnine**: Complete tutorial with Cedric Scherer's beautiful plotting guide (ggplot2 equivalent)
- [x] **plotnine Cheatsheet**: Quick reference for plotnine
- [x] **Tidyverse Equivalent**: pandas/polars vs R tidyverse mapping

#### Machine Learning
- [x] **ML Overview**: scikit-learn, XGBoost, LightGBM, CatBoost
- [x] **ML Cheatsheet**: Quick ML reference
- [x] **Advanced ML Cheatsheet**: Advanced ML techniques

#### Time Series
- [x] **Time Series**: ARIMA, Prophet, NeuralForecast, DeepAR, statsforecast

#### EDA
- [x] **EDA Cheatsheet**: Comprehensive EDA reference

#### Advanced Statistics
- [x] **Advanced Stats**: Bayesian, causal inference, SEM, meta-analysis, survival analysis

#### MLOps
- [x] **MLOps**: Deployment, monitoring, pipelines, governance

---

**Foundational Prerequisites**: 
- [[Linear Algebra Foundations]]
- [[Multivariable Calculus (Partial Derivatives, Gradients)]]
- [[Probability Distributions]]
- [[Hypothesis Testing Framework]]
- [[Optimization basics]]
- [[Information Theory]]
- [[Statistics/Time Series Analysis]]