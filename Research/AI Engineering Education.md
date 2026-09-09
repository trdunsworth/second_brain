---
title: Data Science & Analytics Education
date: 2026-09-09
status: planning
tags:
  - data-science
  - data-analytics
  - time-series
  - forecasting
  - foundation-models
  - zero-shot
  - multivariate
  - call-center
  - erlang-c
  - python
  - 9-1-1
---

# Data Science & Analytics Education

## Overview

A self-paced education plan focused on **Data Analytics**, **Time-Series Forecasting** (classical + zero-shot foundation models), and **Data Science** using Python. Primary application domain: **multivariate call volume forecasting for 9-1-1 centers** — six interdependent hourly time series (911 inbound, 911 abandoned, non-emergency inbound, non-emergency abandoned, CAD events created, outbound calls) with shared server pools creating a polystochastic, resource-constrained environment. Combines foundational math/ML with targeted free courses in analytics, visualization, statistical modeling, and forecasting — including emerging time series foundation models like Chronos, TimesFM, and Moirai. Goal: build a job-ready skill set with a portfolio of real projects.

---

## Steps / Task List

- [ ] Step 1: Set up Python environment — install Anaconda, Jupyter, pandas, NumPy, matplotlib, seaborn, scikit-learn, statsmodels. 📅 2026-09-14
- [ ] Step 2: Complete **Python & Pandas fundamentals** — IBM Data Analysis with Python (Coursera audit) or Udacity Intro to Data Analysis. 📅 2026-10-05
- [ ] Step 3: Complete **Data Visualization** — matplotlib, seaborn, Plotly. Kaggle "Data Visualization" micro-course. 📅 2026-10-19
- [ ] Step 4: Complete **Statistics for Data Science** — probability, distributions, hypothesis testing, confidence intervals, A/B testing. Khan Academy Statistics + Simplilearn Statistics course. 📅 2026-11-09
- [ ] Step 5: Complete **Exploratory Data Analysis (EDA)** — work through 3 real datasets end-to-end (clean, explore, visualize, summarize). 📅 2026-11-30
- [ ] Step 6: Complete **SQL for Data Analytics** — queries, joins, window functions, CTEs. Mode Analytics SQL Tutorial or Khan Academy SQL. 📅 2026-12-14
- [ ] Step 7: Complete **Machine Learning Fundamentals** — regression, classification, clustering, evaluation metrics. Scikit-learn full course (freeCodeCamp) + Kaggle Intro to ML. 📅 2027-01-11
- [ ] Step 8: Complete **Time Series Analysis foundations** — trend, seasonality, stationarity, ACF/PACF, ARIMA, SARIMA. 365 Data Science Time Series course + Kaggle Time Series course. 📅 2027-02-01
- [ ] Step 9: Complete **Advanced Time Series Forecasting** — Prophet, Holt-Winters, LSTM for time series, ensemble methods. Analytics Vidhya + Coursera Prophet course. 📅 2027-02-22
- [ ] Step 10: Explore **Time Series Foundation Models** — install TimeCopilot, run zero-shot forecasts with Chronos, TimesFM, and Moirai on real datasets. Compare against ARIMA/Prophet baselines. 📅 2027-03-08
- [ ] Step 11: Complete **Applied Data Science Project** — end-to-end project: business question → data acquisition → EDA → modeling → forecasting (classical + foundation model) → dashboard/report. 📅 2027-03-22
- [ ] Step 12: Build **portfolio** — GitHub repo with 3+ polished projects: EDA, classical time series forecast, and foundation model comparison. 📅 2027-04-05
- [ ] Step 13: Review and **apply** — update resume, LinkedIn, begin applying or presenting findings. 📅 2027-04-12

---

## Resources & Links

### Core Curriculum (Free, Self-Paced)

| Resource                                           | Type          | Link / Notes                                                                                                           |
| -------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| ai-engineering-from-scratch (Phases 0–2)           | Full Curriculum | https://github.com/rohitg00/ai-engineering-from-scratch (Math Foundations + ML Fundamentals — free, Python)            |
| IBM Data Analysis with Python (Coursera audit)     | Course        | https://www.coursera.org/learn/data-analysis-with-python (pandas, NumPy, data wrangling, visualization — free audit)  |
| Microsoft Data Analysis & Visualization with Python | Course       | https://www.coursera.org/learn/microsoft-data-analysis-visualization-with-python (pandas, Matplotlib, Plotly)         |
| Udacity Intro to Data Analysis                     | Course        | https://www.udacity.com/course/intro-to-data-analysis--ud170 (free, Pandas, NumPy, Matplotlib)                        |

### Data Visualization

| Resource                                           | Type          | Link / Notes                                                                                                           |
| -------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Kaggle — Data Visualization                        | Micro-course  | https://www.kaggle.com/learn/data-visualization (matplotlib, seaborn, interactive plots — free)                        |
| Kaggle — Intermediate Data Visualization           | Micro-course  | https://www.kaggle.com/learn/intermediate-data-visualization (Plotly, faceting, animation — free)                      |
| freeCodeCamp — Data Visualization with Python       | Course        | https://www.freecodecamp.org/learn/data-analysis-with-python/ (embedded in Data Analysis cert — free)                  |

### Statistics & Probability

| Resource                                           | Type          | Link / Notes                                                                                                           |
| -------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Khan Academy — Statistics & Probability            | Course        | https://www.khanacademy.org/math/statistics-probability (full course, free)                                           |
| Simplilearn — Statistics for Data Science          | Course        | https://www.simplilearn.com/skillup-free-online-courses/data-science (free, 1–4 hrs, certificate)                      |
| StatQuest with Josh Starmer (YouTube)              | Video Series  | https://www.youtube.com/c/joshstarmer (statistics, ML, data science — free, highly visual)                             |
| 365 Data Science — Statistics for Data Science     | Course        | https://365datascience.com/courses/ (free tier available, probability through regression)                              |

### SQL for Data Analytics

| Resource                                           | Type          | Link / Notes                                                                                                           |
| -------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Mode Analytics — SQL Tutorial                      | Tutorial      | https://mode.com/sql-tutorial/ (free, real-world queries, progressive difficulty)                                     |
| Khan Academy — Intro to SQL                        | Course        | https://www.khanacademy.org/computing/computer-programming/sql (free)                                                 |
| SQLZoo                                              | Interactive   | https://sqlzoo.net/ (free, interactive exercises)                                                                      |
| W3Schools SQL                                       | Reference     | https://www.w3schools.com/sql/ (free, quick reference + exercises)                                                     |

### Time-Series Analysis & Forecasting

| Resource                                           | Type          | Link / Notes                                                                                                           |
| -------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Kaggle — Time Series                                | Micro-course  | https://www.kaggle.com/learn/time-series (ML-based forecasting, free)                                                 |
| 365 Data Science — Time Series Analysis with Python | Course        | https://365datascience.com/courses/time-series-analysis-with-python (ARMA, ARIMA, ARCH, GARCH — free tier)            |
| Coursera — Sequences, Time Series & Prediction      | Course        | https://www.coursera.org/learn/adding-value-business-competencies-google-bigquery (TensorFlow, deep learning TS)      |
| Analytics Vidhya — Time Series Forecasting in Python| Tutorial      | https://www.analyticsvidhya.com/2018/10/practical-machine-learning-guide-facebook-prophet-using-python/ (free, ARIMA/Prophet) |
| Open Time Series — Free Course Directory           | Directory     | https://opentimeseries.com/tutorials/online_courses (curated list of free TS courses)                                  |
| Prophet Documentation                              | Docs/Examples | https://facebook.github.io/prophet/ (free, code examples, Python/R)                                                   |
| Skforecast                                          | Library/Tutorial | https://skforecast.org/ (ML-based forecasting with LightGBM/XGBoost — free, actively maintained)                     |

### Machine Learning (Applied)

| Resource                                           | Type          | Link / Notes                                                                                                           |
| -------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| freeCodeCamp — ML with Scikit-Learn                | Course        | https://www.youtube.com/watch?v=0B5eIE_1vpU (full course — free)                                                       |
| Kaggle — Intro to Machine Learning                 | Micro-course  | https://www.kaggle.com/learn/intro-to-machine-learning (decision trees, forests — free)                                |
| Kaggle — Intermediate Machine Learning             | Micro-course  | https://www.kaggle.com/learn/intermediate-machine-learning (XGBoost, pipelines — free)                                 |
| Simplilearn — Scikit-Learn for Beginners           | Course        | https://www.simplilearn.com/skillup-free-online-courses/machine-learning (free, 1 hr, certificate)                     |
| Simplilearn — ML using Python                      | Course        | https://www.simplilearn.com/skillup-free-online-courses/machine-learning (free, supervised/unsupervised — certificate)  |
| Anaconda — Intro to ML                             | Course        | https://www.anaconda.com/learning (free tier, scikit-learn based)                                                      |

### Data Science General

| Resource                                           | Type          | Link / Notes                                                                                                           |
| -------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| DataCamp — Data Analyst in Python Track            | Track         | https://www.datacamp.com/tracks/data-analyst-with-python (36 hrs, free intro courses available)                        |
| DataCamp — Data Scientist in Python Track          | Track         | https://www.datacamp.com/tracks/data-scientist-in-python (26 hrs, free intro courses available)                        |
| Simplilearn — Data Science Free Courses            | Courses       | https://www.simplilearn.com/skillup-free-online-courses/data-science (multiple free courses with certificates)         |
| IBM SkillsBuild — Data Analyst Learning Path       | Learning Path | https://www.skillsbuild.org/ (self-paced, 15–20 hrs, free)                                                            |
| Great Learning — Data Analytics Courses            | Courses       | https://www.mygreatlearning.com/academy/ (free courses, instant certificates — Excel, SQL, Python, visualization)     |
| HCL GUVI — Data Science & Analytics Program        | Program       | https://www.guvii.in/ (Python, SQL, Tableau/BI, free)                                                                 |

### Time Series Foundation Models (Zero-Shot & Pretrained)

| Resource                                           | Type          | Link / Notes                                                                                                           |
| -------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **TimeCopilot**                                    | Framework     | https://github.com/TimeCopilot/timecopilot (MIT, unified API for 30+ TSFMs: Chronos, Moirai, TimesFM, TimeGPT — free) |
| **Google TimesFM 3.0**                             | Model         | https://huggingface.co/google/timesfm-3.0-pytorch (330M params, zero-shot multivariate, released Aug 2026 — free)    |
| Google TimesFM 2.5                                 | Model         | https://huggingface.co/google/timesfm-2.5-200m-pytorch (200M params, univariate zero-shot — free)                     |
| Google Research Blog — TimesFM                     | Blog/Paper    | https://research.google/blog/a-decoder-only-foundation-model-for-time-series-forecasting (ICML 2024)                 |
| Google Research Blog — TimesFM-3                   | Blog/Paper    | https://research.google/blog/timesfm-3-a-zero-shot-foundation-model-for-multivariate-forecasting (Aug 2026)           |
| **Amazon Chronos (v1 + v2)**                       | Model         | https://github.com/amazon-science/chronos-forecasting (T5-based, tokenized TS, zero-shot — free, Apache 2.0)         |
| Chronos-2 Blog Post                                | Blog          | https://www.amazon.science/blog/introducing-chronos-2-from-univariate-to-universal-forecasting (Jan 2026)             |
| Chronos HuggingFace                                | Model Card    | https://huggingface.co/amazon/chronos-t5-base (sizes: 8M to 710M params — free)                                      |
| **Salesforce Moirai (1.0 → 2.0)**                 | Model         | https://huggingface.co/Salesforce/moirai-1.0-R-large (encoder-only, universal forecaster — free, CC BY-NC 4.0)       |
| Moirai 2.0 (Decoder-Only)                          | Paper         | https://arxiv.org/pdf/2511.11698v3 (36M series pretraining, multi-token prediction — Feb 2026)                        |
| MoiraiAgent                                        | Framework     | https://www.salesforce.com/blog/moiraiagent (agentic forecasting, expert selection via LLM — Jan 2026)               |
| **Nixtla TimeGPT**                                 | API/Model     | https://nixtla.io/ (first TS foundation model, hosted API with free trial — forecasting + anomaly detection)          |
| Nixtla TimeGPT Quickstart                          | Docs          | https://nixtla.io/docs/forecasting/timegpt_quickstart (Python SDK, few lines of code)                                |
| **Lag-Llama**                                      | Model         | https://github.com/time-series-foundation-models/lag-llama (first open-source TS foundation model, probabilistic — free) |
| **IBM Granite-TSFM**                               | Model         | https://github.com/ibm-granite/granite-tsfm (foundation models for time series — free, Apache 2.0)                   |
| **DataDog Toto**                                   | Model         | https://github.com/DataDog/toto (time-series-optimized transformer for observability — free)                          |
| **TiRex / TiRex-2**                                | Model         | https://github.com/NX-AI/tirex (zero-shot across long/short horizons — free)                                         |
| **ByteDance Timer-S1**                             | Model         | https://huggingface.co/bytedance-research/Timer-S1 (8.3B MoE, 0.75B activated — SOTA on GIFT-Eval, Apr 2026)        |
| **Unified TS Model Directory**                     | Reference     | https://github.com/TimeCopilot (forks of Chronos, TimesFM, Moirai, Granite, Toto, TiRex — all accessible in one place) |
| Manning — Time Series Forecasting Using Foundation Models | Book (Preview) | https://www.manning.com/preview/time-series-forecasting-using-foundation-models (covers Moirai, Chronos, evaluation) |
| GIFT-Eval Benchmark                                | Benchmark     | https://huggingface.co/spaces/Salesforce/GIFT-Eval (24 datasets, 144k+ series — standard TSFM evaluation)            |

### Multivariate Time Series & Shared-Resource Forecasting

| Resource                                           | Type          | Link / Notes                                                                                                           |
| -------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **NeuralForecast** (Nixtla)                        | Library       | https://github.com/Nixtla/neuralforecast (AutoNHITS, AutoTFT, multivariate — free, Python)                            |
| **StatsForecast** (Nixtla)                         | Library       | https://github.com/Nixtla/statsforecast (AutoARIMA, AutoETS, Theta, multivariate stats — free, Python)                |
| **MvTS Library**                                   | Library       | https://github.com/MTS-BenchMark/MvTS (open multivariate TS library — VAR, LSTM, Transformer, TCN, GRU)              |
| **VAR / VECM (statsmodels)**                       | Library       | https://www.statsmodels.org/stable/vector_ar.html (vector autoregression, multivariate Granger causality)             |
| **Temporal Fusion Transformer (TFT)**              | Model         | https://pytorch-forecasting.readthedocs.io/ (multi-horizon, multi-covariate, attention-based — free)                   |
| **Microsoft FinnTS**                               | Library       | https://github.com/microsoft/finnts (automated multivariate TS forecasting, R — free)                                  |
| **FoCo2** (R)                                      | Library       | https://github.com/danigiro/foco2 (coherent forecasting for linearly constrained multiple time series — free)         |
| **Erlang C Staffing Calculator**                   | Reference     | https://github.com/tathiap/Call-Center-Staffing-Calculator (workforce capacity planning from call volume — free)       |
| Comprehensive Survey of Deep Learning for MTS      | Paper         | https://arxiv.org/abs/2502.10721 (2025, 80 citations — covers LSTM, Transformer, TCN for multivariate TS)             |
| TIME Benchmark                                     | Benchmark     | https://huggingface.co/spaces/Real-TSF/TIME-leaderboard (50 datasets, 98 tasks — next-gen TSFM evaluation)            |

### Books & References

#### AI Engineering & LLM Fundamentals

| Book                                           | Publisher    | Focus / Notes                                                                                           |
| ---------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| **AI Engineering** (Chip Huyen)                | O'Reilly     | THE book on building apps with foundation models. Most-read O'Reilly book of 2025. Covers LLMs, RAG, eval, deployment. |
| **Build a Large Language Model (From Scratch)** (Sebastian Raschka) | Manning | From-scratch LLM building — pretraining, fine-tuning, RLHF. Paired code on GitHub.                     |
| **Build a Reasoning Model (From Scratch)** (Sebastian Raschka) | Manning | Deep dive into reasoning/chain-of-thought architecture. 2026 release.                                   |
| **LLM Engineer's Handbook** (Packt)            | Packt        | End-to-end LLM system: fine-tuning, RAG, evaluation, deployment. Production-focused.                    |
| **Rearchitecting LLMs** (Pere Martra)          | Manning      | New LLM architectures beyond the standard transformer.                                                  |
| **Domain-Specific Small Language Models** (Guglielmo Iozzia) | Manning | Fine-tuning small models for specialized domains — cost-effective alternative to large LLMs.            |
| **LLM Customization and Fine-Tuning** (Amit Bahree & Weehyong Tok) | Manning | Practical fine-tuning guide — LoRA, QLoRA, RLHF, DPO.                                                  |

#### Agent Development & Multi-Agent Systems

| Book                                           | Publisher    | Focus / Notes                                                                                           |
| ---------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| **AI Agents in Action, 2nd Edition** (Micheal Lanham) | Manning | Covers LLMs, MCP, A2A, cognitive agents, multi-agent orchestration, deployment strategies. 392 pages.  |
| **AI Agents and Applications** (Roberto Infante) | Manning     | LangChain, LangGraph, MCP, RAG, tool-based agents, multi-agent systems. Production-ready focus.        |
| **AI Agents: The Definitive Guide** (Nicole Koenigstein) | O'Reilly | Agent architectures (ReAct, Reflexion), MCP, security, evaluation, production deployment. Oct 2026.    |
| **30 Agents Every AI Engineer Must Build** (Imran Ahmad) | Packt | 30 production agent architectures with LangChain/LangGraph. Finance, healthcare, legal use cases.      |
| **AI Agents in Practice** (Valentina Alto)     | Packt        | Single/multi-agent systems, memory, tool integration, guardrails. LangChain-focused.                   |
| **Building AI Agents with LLMs, RAG, and Knowledge Graphs** (Raieli & Iuculano) | Packt | 560 pages — transformers, RAG, knowledge graphs, agent planning/reasoning, Streamlit deployment.       |
| **Agent Design Patterns** (Peter Belcak)        | Manning      | Design patterns for agent architecture — reusable solutions for common agent problems.                  |
| **Build an AI Agent (From Scratch)** (Jungjun Hur & Younghee Song) | Manning | Step-by-step agent construction from first principles.                                                  |
| **Build a Multi-Agent System (From Scratch)** (Val Andrei Fajardo) | Manning | Multi-agent orchestration patterns — collaboration, delegation, communication.                          |
| **Designing AI Agents** (Jia Huang)             | Manning      | Agent design methodology — architecture, evaluation, production considerations.                         |
| **Architecting for Autonomy** (Anjali Jain & Philip O'Shaughnessy) | Manning | Autonomous agent architecture — systems-level design for self-directed AI.                              |

#### RAG & Context Engineering

| Book                                           | Publisher    | Focus / Notes                                                                                           |
| ---------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| **Build an Advanced RAG Application (From Scratch)** (Hamza Farooq) | Manning | Advanced RAG patterns — hybrid search, re-ranking, evaluation.                                          |
| **Enterprise RAG** (Tyler Suard)               | Manning      | Production RAG at enterprise scale — architecture, monitoring, cost management.                         |
| **Retrieval Augmented Generation: The Foundational Ideas** (Ben Auffarth) | Manning | RAG fundamentals — retrieval, generation, evaluation.                                                   |
| **Building an Agentic RAG Application** (Matteus Tanha) | Manning | Agentic RAG — combining agents with retrieval for autonomous knowledge systems.                         |
| **Context Engineering for Multi-Agent Systems** (Packt) | Packt | Context Engine architecture — replacing fragile prompts with structured context management.              |

#### Specialized / Advanced Topics

| Book                                           | Publisher    | Focus / Notes                                                                                           |
| ---------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| **Context Engineering** (Boni García)           | Manning      | Context engineering vs prompt engineering — architecting what the model sees.                           |
| **Building LLM Applications with DSPy** (Serj Smorodinsky & Brett Kennedy) | Manning | DSPy framework — programmatic LLM optimization instead of manual prompting.                            |
| **LLM Evaluation and Alignment** (Han Lee)     | Manning      | Evaluation methodologies — benchmarks, alignment, red-teaming.                                          |
| **AI Governance** (Engin Bozdag & Stefano Bennati) | Manning   | Responsible AI — policy, compliance, ethical frameworks for production systems.                         |
| **Vibe Engineering** (Tomasz Lelek & Artur Skowroński) | Manning | Engineering practices for LLM-powered development workflows.                                            |
| **CUDA for LLMs** (Elliot Arledge)             | Manning      | GPU programming for LLM inference — performance optimization.                                           |
| **GPU Programming with Triton** (Harshwardhan Fartale) | Manning | Triton kernel programming for efficient LLM inference.                                                   |

#### Recommendations by Reading Order

If you're starting from scratch, read in this order:
1. **AI Engineering** (Chip Huyen) — foundation for everything
2. **AI Agents in Action, 2nd Ed** — agent fundamentals + MCP + multi-agent
3. **AI Agents: The Definitive Guide** (O'Reilly) — architecture deep-dive
4. Pick one "from scratch" book (Raschka's LLM or Reasoning Model) for depth
5. Pick a Packt book (30 Agents or LLM Engineer's Handbook) for breadth of patterns

#### Free Reference Books (Online)

| Book                                           | Link / Notes                                                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Python for Data Analysis (Wes McKinney)        | https://wesmckinney.com/book/ (author of pandas — free online, 3rd edition)                            |
| Forecasting: Principles and Practice (Hyndman) | https://otexts.com/fpp3/ (free online, THE textbook for time series forecasting, R-based)               |
| An Introduction to Statistical Learning (ISLR) | https://www.statlearning.com/ (free PDF, ML foundations with R/Python — 2nd edition)                    |
| Hands-On Machine Learning (Aurélien Géron)    | https://github.com/ageron/handson-ml3 (Jupyter notebooks, scikit-learn/TF/Keras — companion code free)  |
| scikit-learn User Guide                        | https://scikit-learn.org/stable/user_guide.html (comprehensive reference — free)                        |

---

## SWOT Analysis

### Strengths
- **Python ecosystem dominance** — pandas, NumPy, scikit-learn, matplotlib, and Prophet are industry-standard and completely free
- **Foundation model access is free** — Chronos (Apache 2.0), TimesFM (Google, free), Moirai (CC BY-NC), Granite-TSFM, TiRex, and TimeCopilot are all open-source and downloadable
- **Multivariate-native TSFMs exist** — TimesFM 3.0, Chronos 2, and Moirai 2.0 all support multivariate forecasting natively, directly applicable to the 6-series 911 call volume problem
- **Massive free course availability** — Kaggle micro-courses, Khan Academy, freeCodeCamp, Simplilearn SkillUp, and 365 Data Science provide structured paths at zero cost
- **Hands-on project emphasis** — every recommended course includes real datasets and runnable code, building portfolio-ready artifacts
- **Transferable skills** — SQL, Python, and statistical thinking apply across industries (finance, healthcare, marketing, ops)
- **Strong job market demand** — Data Analyst, Data Scientist, and Time Series Engineer roles consistently rank among top-hiring positions
- **Public safety domain is high-impact** — 911 workforce optimization directly affects emergency response quality and lives saved

### Weaknesses
- **Fragmented learning path** — no single course covers analytics + time series + multivariate + foundation models end-to-end; requires stitching together multiple sources
- **Self-discipline required** — free courses lack deadlines, grading, or cohorts, making it easy to stall
- **No formal credential** — most free courses offer certificates of completion but not industry-recognized certifications (e.g., Google Data Analytics, IBM Data Science)
- **Time investment** — building proficiency across SQL, Python, statistics, ML, classical TS, multivariate methods, and foundation models requires 200+ hours of focused study
- **Tooling complexity** — managing Jupyter environments, database connections, and library versions can be frustrating for beginners
- **Foundation models are bleeding-edge** — TSFMs are evolving rapidly (Chronos-2, TimesFM-3, Moirai 2.0 all released in 2026); best practices are still forming
- **911 data sensitivity** — emergency call data may have privacy/security constraints that limit what can be shared publicly in a portfolio

### Opportunities
- **911 workforce forecasting is underserved** — most call center forecasting tools are built for commercial BPOs, not public safety; domain-specific solutions are rare and valuable
- **Polystochastic shared-resource problem is novel** — overlapping server pools across 6 interdependent series is a research-grade problem; few published solutions exist
- **Multivariate TSFMs are the answer** — TimesFM 3.0, Chronos 2, and Moirai 2.0 handle exactly this kind of multi-series, covariate-informed forecasting natively
- **Erlang C + ML hybrid** — combining classical queueing theory (Erlang C staffing) with ML-based volume forecasts creates a more robust staffing model than either alone
- **Foundation models are the new frontier** — zero-shot TSFMs are early-stage; getting in now positions you ahead of the curve
- **TimeCopilot as a unifier** — the open-source TimeCopilot framework lets you compare 30+ models in one API, lowering the barrier to entry significantly
- **Portfolio differentiation** — a polished 911 call volume forecasting project (classical vs. TSFM with Erlang C staffing integration) is a rare and impressive portfolio piece
- **Cross-functional value** — multivariate time series skills apply to operations, supply chain, finance, and marketing — opening doors beyond public safety
- **Free certification stacking** — completing multiple free certifications (Kaggle, Simplilearn, Google, IBM SkillsBuild) builds a credible profile without tuition cost
- **GIFT-Eval leaderboard literacy** — understanding how to read and interpret TSFM benchmarks makes you a more informed practitioner and hiring candidate
- **Public sector demand** — 911 centers, hospitals, and government agencies increasingly need data science talent for operational optimization

### Threats
- **AutoML and no-code tools** — platforms like DataRobot, H2O, and cloud AutoML reduce demand for basic modeling skills
- **Foundation models may commoditize classical forecasting** — if Chronos/TimesFM become good enough zero-shot, deep ARIMA/SARIMA expertise may matter less
- **Rapidly evolving libraries** — pandas API changes (e.g., pandas 2.0+ with nullable dtypes), statsmodels updates, and Prophet's maintenance mode require constant learning
- **Offshoring of entry-level roles** — basic data analysis tasks are increasingly handled by cheaper labor markets, pushing value toward advanced skills
- **Credential inflation** — employers increasingly require master's degrees for data science roles, making self-taught paths harder to break through
- **911 data complexity** — real call volume data has irregular patterns (mass incidents, holidays, weather events) that tutorial datasets don't capture
- **Model licensing ambiguity** — some TSFMs (Moirai: CC BY-NC; TimesFM-3: non-commercial license) restrict commercial use — important to check before deploying
- **Server pool coupling** — the polystochastic shared-resource nature of the problem means univariate forecasting will systematically underperform; multivariate methods are essential but harder to implement

---

## SMART Goals

| Goal | Specific | Measurable | Achievable | Relevant | Time-bound | Status |
|------|----------|------------|------------|----------|------------|--------|
| Master data analytics foundations | Complete Python/pandas, SQL, statistics, and EDA courses; work through 5 real datasets end-to-end including 911 call volume data | 5 completed EDA projects with code and visualizations on GitHub, including one 911 multivariate EDA | 2 courses/week with 15+ hrs/week study time | Foundation for all data science and forecasting work | 2026-12-31 | ☐ Not Started |
| Build multivariate time series forecasting proficiency | Complete VAR/VECM, SARIMAX, Prophet, and deep learning TS courses; build 6-series forecasting model for 911 call volumes | Multivariate forecasting model for 911 call volume with cross-series correlation analysis; deploy 2 forecasting models | After analytics foundations, concepts build sequentially | Multivariate is essential for the polystochastic shared-resource problem | 2027-02-28 | ☐ Not Started |
| Evaluate time series foundation models | Install TimeCopilot, run zero-shot multivariate forecasts with Chronos 2, TimesFM 3.0, and Moirai on 911 data; benchmark against classical baselines | Comparison notebook with metrics (MASE, MAPE, CRPS) and visualizations for each model; Erlang C staffing overlay showing impact of forecast accuracy on headcount | After classical TS proficiency, foundation models build on prior knowledge | Positions you at the cutting edge of TS forecasting — directly applicable to 911 workforce planning | 2027-03-31 | ☐ Not Started |
| Ship a data science portfolio | Create GitHub portfolio with 3+ polished projects: EDA, multivariate 911 forecast (classical + TSFM), and Erlang C staffing model; write blog posts for 2 projects | Public GitHub repo with README, notebooks, and results; 2 published blog posts (one on 911 forecasting specifically) | Capstone leverages all prior coursework including foundation models and queueing theory | Tangible proof of capability for public safety data science roles or consulting | 2027-04-12 | ☐ Not Started |

---

*Created: 2026-09-09*
*Focused on: Data Analytics, Time-Series Forecasting, Data Science, Time Series Foundation Models*
*Primary Domain: Multivariate 911 call volume forecasting with shared server pool resource constraints*
