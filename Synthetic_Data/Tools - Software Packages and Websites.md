# Tools - Software, Packages and Websites

> Focus: creation + evaluation + use of synthetic data, Sept 2023 – Sept 2026 relevant. Licenses noted where they matter for book recommendations.

## A. Core Python libraries (tabular / relational / sequential)

1. **SDV – Synthetic Data Vault (DataCebo, MIT-origin 2016, now BSL)**
   - GitHub: https://github.com/sdv-dev/sdv — Docs: https://docs.sdv.dev/sdv
   - Models: GaussianCopula, CTGAN, TVAE, CopulaGAN, PAR (sequential), HMA (multi-table ≤5), HSA/Independent (enterprise multi-table), DPGC/DPGCFlex (DP, enterprise)
   - Evals: SDMetrics (quality + diagnostic reports)
   - Why for book: one-stop shop, best docs/ease (per 2025 SDV-vs-Synthcity study); start readers here. Flag BSL for commercial use.
   - Install: `pip install sdv`

2. **Synthcity (van der Schaart Lab)**
   - GitHub: https://github.com/vanderschaarlab/synthcity
   - Models: Bayesian Network, CTGAN, TVAE, DDPM, NFlow, GOGGLE, ARF, RTVAE + plugins
   - Why: only mainstream lib with BN (best fidelity in 2025 comparison); great for teaching graphical vs deep trade-offs.

3. **MOSTLY AI Synthetic Data SDK + Engine (Apache 2.0, open source)**
   - SDK: https://github.com/mostly-ai/mostlyai — Engine: https://github.com/mostly-ai/mostlyai-engine — Site: https://mostly.ai/synthetic-data-sdk
   - Core: TabularARGN (arXiv:2501.12012) — SOTA quality at 1–2 orders lower cost; CPU-viable for millions of rows; LSTM-from-scratch + HF-LM fine-tune for text; DP, fairness controls, connectors
   - Why: efficiency story + permissive license; `mostly.train / generate / probe / connect` API is book-friendly.
   - Paper to cite: arXiv:2508.00718 (Democratizing Tabular Data Access with an Open-Source Synthetic-Data SDK)

4. **YData Synthetic – fg-data-synthetic (MIT, community)**
   - GitHub: https://github.com/ydataai/ydata-synthetic/ (moved to Data-Centric-AI-Community/fg-data-synthetic)
   - Models: CGAN/WGAN/WGAN-GP/DRAGAN/Cramer/CTGAN + TimeGAN/DoppelGANger + Gaussian-Mixture fast path + Streamlit UI
   - Why: time-series coverage + low-code entry; AIMultiple 2025 top statistical accuracy; mltechniques multi-table winner on business rules/dates in one independent test.
   - Install: `pip install fg-data-synthetic`

5. **Gretel Synthetics (permissive, Gretel.ai)**
   - Docs: https://synthetics.docs.gretel.ai/en/latest/
   - Models: ACTGAN (CTGAN superset, better memory/typing), Timeseries DGAN (DoppelGANger/PyTorch)
   - Note: needs `sdv<0.18` + `torch==2.0` for respective paths; free tier limited to small datasets.

6. **Research reference implementations (clone for labs)**
   - TabDiff: https://github.com/MinkaiXu/TabDiff
   - HARMONIC: https://github.com/Wendy619/HARMONIC
   - TabKG / LLM-TabLogic: https://github.com/Yunbo-max/TabKG
   - DiffLM (ByteDance): https://github.com/bytedance/DiffLM
   - Awesome tabular survey list: https://github.com/ruxueshi/Awesome-Comprehensive-Survey-of-Synthetic-Tabular-Data-Generation
   - Benchmark harness: https://github.com/dsaidgovsg/benchmarking-synthetic-data-generators (SDV/Gretel/Synthcity runner)

## B. Evaluation suites (teach these, not just generators)

- **SDMetrics** (part of SDV ecosystem) — quality + diagnostic reports; range/coverage checks
- **Syntheval** (Lautrup et al. 2025) — detailed utility + privacy harness
- **SynMeter** (Du & Li) — https://anonymous.4open.science/r/SynMeter — fidelity (Wasserstein) + MDS privacy + MLA utility + unified tuning
- **syntherela** (Jurkovic et al.) — https://github.com/martinjurkovic/syntherela — relational fidelity (column/table/multi-table) + ML utility with CIs
- **TAPAS / Table Evaluator** — lightweight audit alternatives mentioned across health reviews

Core metrics glossary for book appendix: Shape, Trend, α-precision/β-recall, Detection, DCR (with holdout), MDS, MLA, TSTR/TSTS, DLT/LLE, HCS/MDI/DSI (inter-column logic), FID/MAUVE (image/text), epsilon (DP).

## D. Foundational / legacy tools (older than 3 years, still in common use)

> Include in book Chapter 1–2 so readers can do rule-based fakes and baselines before touching deep models. All below predate Sept 2023 but remain standard.

- **Faker (Python, MIT, since 2012)**
  - https://github.com/joke2k/faker — Docs: https://faker.readthedocs.io — PyPI: https://pypi.org/project/Faker/
  - Providers: name, address, phone, email, credit-card, dates, lorem, internet, etc.; many locales; seeding, unique values, pytest fixture, CLI, custom providers.
  - Why: de-facto bootstrap/anonymization standard; underlies factory_boy, pydbgen; ideal for SynthCCD address/phone/name columns before statistical modeling. `pip install Faker`
- **Mimesis (Python, MIT, since 2016)**
  - https://github.com/lk-geimfari/mimesis — https://mimesis.name
  - Fast multilingual fakes + schema-based generation; lighter/faster than Faker in benchmarks.
  - Why: performance-sensitive tests, teaching alternative.
- **CTGAN standalone + TVAE (NeurIPS 2019, MIT)**
  - https://github.com/sdv-dev/CTGAN — Paper arXiv:1907.00503
  - Mode-specific normalization (VGM), conditional generator, training-by-sampling, WGAN-GP + PacGAN; TVAE twin with same preprocessing. `pip install ctgan`
  - Why: universal baseline in every benchmark (entries 17, 22); techniques copied by CTAB-GAN+ etc.
- **SDV origins (MIT Data-to-AI Lab 2016; DataCebo from 2020)**
  - https://sdv.dev — https://docs.sdv.dev
  - GaussianCopula / CopulaGAN / PAR / HMA lineage; SDMetrics evaluation.
  - Why: teaches copula baseline that still wins on speed/transparency.
- **synthpop (R, GPL, since 2016)**
  - CRAN: https://cran.r-project.org/package=synthpop — https://www.synthpop.org.uk/
  - `syn()` sequential conditional synthesis (CART, parametric, randomForest/ranger) + utility/disclosure functions.
  - Why: official-statistics / disclosure-control standard; CART baseline vs deep methods; R readers' entry point.
- **DataSynthesizer (Python, MIT, since 2017 — PrivBayes lineage)**
  - https://github.com/DataResponsibly/DataSynthesizer
  - Modes: random / independent / correlated (Bayesian network, PrivBayes Zhang et al. SIGMOD 2014/2017) with optional Laplace DP; notebooks + web UI.
  - Why: earliest practical open DP tabular synthesizer; teaches select-measure-generate; still a DP baseline.
- **Synthea (MITRE, Apache 2.0, since 2016–2017)**
  - https://github.com/synthetichealth/synthea — https://synthetichealth.github.io/synthea/
  - Generic Module Framework over CDC/NIH stats → longitudinal synthetic EHRs (FHIR/C-CDA/CSV) with no PHI.
  - Why: only realistic open longitudinal-health generator; model for a public-safety equivalent (your SynthCCD thesis).
- **Mockaroo (SaaS/API, proprietary freemium, circa 2013)**
  - https://www.mockaroo.com/ — https://www.mockaroo.com/mock_apis
  - 100+ types, formula/AI fields, CSV/JSON/SQL/Excel/XML, mock APIs, de-identification; free 1k rows.
  - Why: zero-setup choice for non-programmers/QA/demos; fastest teaching example.
- **pydbgen (Python, MIT, since 2018 — Faker wrapper)**
  - https://github.com/tirthajyoti/pydbgen — https://pydbgen.readthedocs.io/en/latest/
  - One-liner pandas/DB-table/Excel fakes (`gen_dataframe`, `gen_table`).
  - Why: simplest pandas-testing path; legacy convenience — prefer Faker directly for new work (small, unmaintained since 1.0.5).

## E. Websites, docs, benchmarks

- SDV docs: https://docs.sdv.dev/sdv — DataCebo ecosystem: https://datacebo.com/sdv-dev/
- MOSTLY AI docs/site: https://mostly.ai/synthetic-data-sdk
- YData benchmarks blog: https://ydata.ai/resources/synthetic-data-benchmarks-aimultiple.html
- Gretel docs: https://synthetics.docs.gretel.ai/en/latest/
- Independent multi-table vendor comparison (mltechniques, June 2024): https://mltechniques.com/2024/06/15/synthesizing-multi-table-databases-model-evaluation-vendor-comparison/
- Royal Society explainer (free PDF, pre-read): https://royalsociety.org/-/media/policy/projects/privacy-enhancing-technologies/Synthetic_Data_Survey-24.pdf
- SynthCCD (your running example): https://github.com/trdunsworth/SynthCCD

## Suggested book lab stack

- Ch 1–3 (baselines): SDV GaussianCopula → CTGAN → TVAE on Adult/CAD sample; SDMetrics report
- Ch 4 (diffusion): TabSyn → TabDiff; compare pairwise-correlation gain
- Ch 5 (LLM): HARMONIC pattern → Tabby/Plain → TABGEN-ICL (no-GPU path)
- Ch 6 (logic): LLM-TabLogic HCS/MDI/DSI on CAD timestamps + address rules
- Ch 7 (privacy): DP-LLMTGen epsilon sweep {∞, 4, 2, 1, 0.5}; DCR vs MDS vs MIA
- Ch 8 (relational): syntherela on parent–child (incident → unit-response) tables
- Ch 9 (efficiency): TabularARGN via MOSTLY AI SDK for million-row scale
