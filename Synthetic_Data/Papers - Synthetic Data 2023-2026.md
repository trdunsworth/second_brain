# Papers - Synthetic Data 2023-2026 (all open-access, no paywall)

> Scope: last 3 years (Sept 2023 – Sept 2026). Every entry has a free full-text link (arXiv, MDPI, Springer OA, Nature OA, ACL/NeurIPS/ICLR/KDD open proceedings, Royal Society PDF). Accessed 2026-09-28.
> Each entry: bibliographic line + free link + **Abstract** (official, sometimes lightly condensed for length) + **Synopsis** (what it means for your book).

## How to use this list

- Start with **A. Surveys & explainers** for book Part I framing.
- Then **B. LLM + diffusion tabular SOTA** for methods chapters.
- Then **C. Privacy + evaluation** — this is your differentiator; most books under-cover it.

## A. Surveys, reviews, explainers (start here)

### 1. A Comprehensive Survey of Synthetic Tabular Data Generation (2025) — Shi et al.

- Authors/venue: Ruxue Shi, Yili Wang, Mengnan Du, Xu Shen, Yi Chang, Xin Wang — arXiv:2504.16506, 2025
- Free: https://arxiv.org/html/2504.16506v3
- Code/resources: https://github.com/ruxueshi/Awesome-Comprehensive-Survey-of-Synthetic-Tabular-Data-Generation

**Abstract (official, lightly condensed):**
Tabular data is one of the most prevalent formats in healthcare, finance, and education, but its ML use is constrained by scarcity, privacy, and imbalance. Synthetic tabular generation learns underlying distributions to produce realistic, privacy-preserving samples. Most existing surveys focus narrowly (e.g., GANs or privacy only) and miss diffusion models and LLMs. This survey gives a unified view in three parts: (1) Background — pipeline, problem definitions, post-processing, evaluation; (2) Generation Methods — traditional vs diffusion vs LLM-based, compared on architecture, quality, applicability; (3) Applications and Challenges — use cases, 20 common benchmark datasets (incl. Adult, Beijing, California Housing), and open challenges in heterogeneity, fidelity, and privacy.

**Synopsis for your book:**
Use as the TOC backbone for tabular chapters. Steal its three-bucket taxonomy (traditional / diffusion / LLM) and its two post-processing classes (sample enhancement + label enhancement). Its 20-dataset catalog solves your "which datasets for labs" problem. Limitation: evaluation section is thinner than SynMeter/npj reviews — pair with entries 17–19.

### 2. On LLMs-Driven Synthetic Data Generation, Curation, and Evaluation: A Survey (2024) — Long et al.

- Authors/venue: Lin Long, Rui Wang, Ruixuan Xiao, Junbo Zhao, Xiao Ding, Gang Chen, Haobo Wang — arXiv:2406.15126 (ACL Findings 2024)
- Free: https://arxiv.org/pdf/2406.15126

**Abstract (official):**
Within deep learning, data quantity and quality remain long-standing problems. LLMs offer a data-centric solution via synthetic generation. But current work lacks a unified framework and stays on the surface. This paper organizes studies along a generic workflow — generation, curation, evaluation — highlights gaps, and outlines future directions, aiming to push academic and industrial communities toward deeper, more methodical inquiry.

**Synopsis:**
Framing device for your LLM chapter: generate → curate → evaluate. Key facts to cite: 300+ "synthetic"-tagged Hugging Face datasets by June 2024; Alpaca/Vicuna/OpenHermes as synthetic-trained models; correctness + diversity requires tricks (not "just prompt"). Its gap analysis (curation neglected) justifies a full chapter on filtering/dedup/quality gates before training on synthetic.

### 3. A Systematic Review of Synthetic Data Generation Techniques Using Generative AI (2024) — Goyal et al.

- Venue: Electronics (MDPI, open access), 13(17), 3509
- Free: https://www.mdpi.com/2079-9292/13/17/3509

**Abstract (official):**
Synthetic data address scarcity, privacy, and bias while preserving patterns of the original dataset with altered content. Methods range from LLMs pre-trained on massive corpora to GANs and VAEs. This systematic review (77 studies after PRISMA screening of 232, May 2024 cut across MDPI/IEEE/ScienceDirect/ResearchGate/NeurIPS/arXiv) identifies limitations and future areas. Findings: technologies work for specific data types but suffer computational cost, training instability, and weak privacy preservation, limiting real-world use. Fixing these enables broader adoption.

**Synopsis:**
Your "limitations/future work" source with a citable screening count (232→77). Weaker on technical depth than Shi/KDD surveys, but useful for the intro's honest-caveats section (cost, stability, privacy). Cite for the claim that no method dominates all modalities.

### 4. Review of generative AI for synthetic data generation: a healthcare perspective (2025) — Waseem et al.

- Venue: Artificial Intelligence Review (Springer, open access), Vol. 59, Art. 55 (2026, online Dec 2025)
- Free: https://link.springer.com/article/10.1007/s10462-025-11440-2

**Abstract (official, condensed):**
Generative AI enables high-fidelity synthetic data for medical imaging, EHRs, biosignals, and drug discovery, where real data are blocked by privacy, heterogeneity, and access limits. Unlike single-model reviews, this gives a unified comparison of GANs, VAEs, Transformers, and Diffusion Models plus privacy-preserving federated-learning adaptations — variants, methodologies, healthcare performance, strengths/limits, compute feasibility — plus deployment concerns: training stability, bias mitigation, interpretability, regulatory compliance. Literature Jan 2018–Apr 2025 (mostly 2023–2024).

**Synopsis:**
Analogy engine for your 911/EMS privacy chapter: replace "patient confidentiality + HIPAA" with "CAD/PII + CJIS/state rules" and the structure transfers. Borrow its model-selection table logic (fidelity vs stability vs compute vs compliance). Good source for federated-learning-as-alternative-to-central-synthesis discussion.

### 5. Uncertainty-aware synthetic data generation: systematic review (2026) — Keyhanipour

- Venue: Int J Data Sci Anal (Springer), Vol. 22, Art. 141 (Apr 2026)
- Free: https://link.springer.com/article/10.1007/s41060-026-01120-x

**Abstract (official, condensed):**
Dependability of synthetic data hinges on uncertainty management. New taxonomy: (1) probabilistic/Bayesian (full uncertainty propagation), (2) generative with neural uncertainty quantification, (3) hybrid physics-constrained + data-driven. Evaluates handling of aleatoric vs epistemic uncertainty incl. imputation. Findings: diffusion best for images (FID 5–20), Bayesian dominates tabular (58% of studies), physics-informed 20–40% better time-series extrapolation; only 34% of studies validate uncertainty empirically. Recommends adaptive calibration + domain-aware validation.

**Synopsis:**
The angle other books skip — and your imputation chapter. For SynthCCD (missing unit timestamps, elapsed-time gaps), the Bayesian-tabular dominance claim justifies covering PrivBayes/BN alongside diffusion. The "only 34% validate" stat is a strong opening for your evaluation chapter.

### 6. Synthetic Tabular Data: Methods, Attacks and Defenses (KDD 2025) — Cormode et al.

- Venue: Proc. 31st ACM SIGKDD (KDD '25, Toronto) tutorial survey
- Free: https://arxiv.org/html/2506.06108

**Abstract (official):**
Synthetic data is often pitched as replacing sensitive fixed-size datasets with unlimited matching data free of privacy concerns. After a decade of ML-driven progress, this survey covers tabular generation from probabilistic graphical models to deep learning: background, motivation, technical deep-dive, then limitations via attacks that recover source information, defenses with formal guarantees, extensions and open problems.

**Synopsis:**
Your "how to think" chapter in one paper: statistical lens vs ML lens vs generative-AI lens, plus the fidelity/privacy/utility/expressivity/efficiency tightrope. Only survey here that treats attacks as first-class (membership/attribute inference) rather than an afterthought. Pair with Royal Society (entry 7) for intuition + this for formalism.

### 7. Synthetic Data – what, why and how? (Royal Society / Alan Turing Institute explainer)

- Authors: Jordon, Szpruch, Houssiau, Bottarelli, Cherubin, Maple, Cohen, Weller — Royal Society Privacy-Enhancing Technologies series (arXiv:2205.03257; PDF Survey-24)
- Free PDF: https://royalsociety.org/-/media/policy/projects/privacy-enhancing-technologies/Synthetic_Data_Survey-24.pdf

**Abstract / preface (official):**
Explainer for a non-technical audience (with formal definitions for specialists) on the state of synthetic-data technology with focus on privacy. Key messages: real promise for privacy, fairness, augmentation, and faster prototyping/sandboxes; NOT automatically private (vulnerable to attacks); NOT a replacement for real data (private synthetic is necessarily distorted — accelerate the pipeline on synthetic, evaluate/fine-tune final tools on real); plus fairness/robustness potential needing more research. Covers definitions, data linking, DP + limits, utility/fidelity/privacy desiderata, auditing (empirical attacks), private synthesis methods, partial synthesis, de-biasing, augmentation, per-modality models, industry notes.

**Synopsis:**
Assign as pre-read for every reader; borrow its threat-model framing ("what can a motivated attacker learn?"). Most quotable caution in the whole list: empirical similarity checks can detect flaws but cannot prove privacy — privacy is a property of the mechanism, not the dataset. That one paragraph inoculates your book against the commonest vendor overclaim.

### 8. Harnessing Synthetic Data from Generative AI for Statistical Inference (2026) — Abdel-Azim, Wang, Lin (Harvard)

- Venue: arXiv:2603.05396
- Free: https://arxiv.org/pdf/2603.05396

**Abstract (official):**
Generative AI expands synthetic-data availability across science, industry, and policy, raising fundamental statistical questions about valid, reliable, principled use. This review surveys generative-model classes, use cases, benefits, limits, and failure modes from a statistical viewpoint, plus pitfalls of treating synthetic as surrogate observations: misspecification bias, attenuated uncertainty, generalization difficulty. It organizes statistically principled paradigms with assumptions/guarantees, gives data examples, and ends with practical recommendations, open problems, and cautions for developers and applied researchers.

**Synopsis:**
Your "when NOT to use synthetic" chapter. Gives you five motivation settings and the vocabulary (misspecification, attenuated variance, TSTR vs TSTS ranking) to explain why downstream intervals/p-values from synthetic alone are overconfident. Essential balance against vendor "replace your data" hype.

## B. Tabular SOTA — diffusion, LLM, efficient (2024-2026)

### 9. TABDIFF (ICLR 2025) — Shi, Xu, Hua, Zhang, Ermon, Leskovec

- Venue: ICLR 2025. Also arXiv:2410.20626
- Free: https://proceedings.iclr.cc/paper_files/paper/2025/file/5c882988ce5fac487974ee4f415b96a9-Paper-Conference.pdf
- Code: https://github.com/MinkaiXu/TabDiff

**Abstract (official):**
Tabular synthesis is hard: heterogeneous types, inter-correlations, intricate column-wise distributions. TabDiff models all mixed-type distributions in one joint continuous-time diffusion model, with feature-wise learnable noise schedules to counter distribution disparity. A transformer handles input types end-to-end (continuous-time ELBO). A mixed-type stochastic sampler corrects accumulated decoding error; classifier-free guidance enables conditional missing-value imputation. On seven datasets it beats competitive baselines on all eight metrics, up to +22.5% on pairwise column correlation.

**Synopsis:**
Flagship diffusion method for the book's lab: original-space joint modeling (vs TabSyn's latent route) + per-feature schedules that "denoise in flexible order." Reproduce the pairwise-correlation win on a CAD-like table; contrast assumptions (handles mixed types natively) with diffusion limits Tabby calls out (integer-only numerics, no free-text strings).

### 10. TabSyn (ICLR 2024 Oral) — Zhang et al.

- Venue: ICLR 2024. arXiv:2310.09656
- Free: https://arxiv.org/abs/2310.09656
- Code: https://github.com/amazon-science/tabsyn

**Abstract (official):**
Diffusion for tables is hard due to varied distributions + mixed types. TabSyn synthesizes via diffusion inside a VAE-crafted latent space: (1) generality — unified space + inter-column relations; (2) quality — optimized latent distribution improves diffusion training; (3) speed — far fewer reverse steps than prior diffusion methods. On six datasets × five metrics it outperforms prior work: –86% error on column-wise distribution and –67% on pairwise correlation vs best baselines.

**Synopsis:**
Teach before TabDiff as the latent-space pattern (tokenizer + Transformer-VAE + score diffusion). The speed claim (few reverse steps) matters for readers without GPUs. Lab idea: TabSyn vs TabDiff on same data — latent convenience vs joint-modeling fidelity.

### 11. HARMONIC (NeurIPS 2024 Datasets & Benchmarks) — Wang et al.

- Venue: NeurIPS 2024. Also arXiv:2408.02927
- Free: https://proceedings.neurips.cc/paper_files/paper/2024/file/b5aebe9a48398525a9da27a1df827d60-Paper-Datasets_and_Benchmarks_Track.pdf
- Code: https://github.com/Wendy619/HARMONIC

**Abstract (official, condensed):**
Sensitive tabular data remain hard to obtain. HARMONIC generates + evaluates tabular data with LLMs. Generation: instruction fine-tuning (not continued pre-training) on kNN-constructed data so the LLM learns format/connections rather than memorizing rows — cutting leakage. Evaluation: new DLT metric (generator leakage via perplexity gap on real vs synthetic) and LLE metric (effectiveness on downstream LLM tasks, more credible than classifier-only TSTR). Results: parity utility with existing methods but better privacy (MLE, DCR, DLT/LLE).

**Synopsis:**
Privacy-aware LLM training pattern to teach verbatim (kNN instruction tuning). DLT + LLE are reusable in your eval chapter: DLT catches the generator itself memorizing; LLE answers "does synthetic help an LLM downstream," not just XGBoost. Notable warning inside: pre-training-based LLM synthesis leaks more; traditional metrics may be unsuitable for LLM downstream tasks.

### 12. Tabby + Plain (2025; TMLR 2026) — Cromp et al.

- Full title: Tabby: A Language Model Architecture for Tabular and Structured Data Synthesis
- Free: https://arxiv.org/pdf/2503.02152 (abs: https://arxiv.org/abs/2503.02152)

**Abstract (official):**
LLM progress lifted synthetic text but tabular lagged. Tabby is a post-training modification to a standard Transformer LM: replace blocks with Gated Mixture-of-Experts so each column gets dedicated parameters. With the dead-simple "Plain" table-training serialization, Tabby gains up to +44% over prior methods, reaches near/real-data parity (TSTR) on multiple tabular sets, and even extends to nested JSON at parity.

**Synopsis:**
Most SynthCCD-relevant LLM paper here: diffusion SOTA assumes away free-text columns (addresses, phone, narratives); Tabby handles them. Teach Plain serialization first (beats GReaT/TabuLa formatting tricks), then MoE intuition (column-specific capacity). Small Tabby beating huge non-Tabby LLMs is a great "architecture > scale" lesson.

### 13. LLM-TabLogic (2025) — Long, Xu, Brintrup (Cambridge)

- Full title: LLM-TabLogic: Preserving Inter-Column Logical Relationships via Prompt-Guided Latent Diffusion
- Free: https://arxiv.org/html/2503.02161v3
- Code: https://github.com/Yunbo-max/TabKG

**Abstract (official, condensed):**
Beyond global statistics, synthetic tables must keep domain logic (e.g., shipment dates/locations/categories consistent). Existing generators ignore inter-column relationships. LLM-TabLogic uses LLM reasoning to infer/compress column relationships, feeds them as conditions into latent score-based diffusion, and generates logically consistent tables without hand-coded domain knowledge. On industrial data vs five baselines (incl. SMOTE, CTGAN, TabDDPM, TabSyn, GReaT): 90%+ logical-inference accuracy on unseen tables, 100% consistency/dependency (HCS) scores, best fidelity/utility/privacy balance.

**Synopsis:**
Core of your "business rules" chapter. Map supply-chain examples → CAD: call_start → hour/dow/week_no, priority → response-time distribution, unit status transitions. New metrics HCS/MDI/DSI give you a grading rubric. Punchline to quote: SMOTE (2002) still beats deep models on consistency in places — but leaks privacy because it interpolates real rows.

### 14. TABGEN-ICL (ACL Findings 2025) — Fang et al.

- Full title: TABGEN-ICL: Residual-Aware In-Context Example Selection for Tabular Data Generation
- Free: https://aclanthology.org/2025.findings-acl.1027.pdf (also arXiv:2502.16414)
- Code: https://github.com/fangliancheng/TabGEN-ICL

**Abstract (official):**
Fine-tuning LLMs for tables is expensive. Alternative: prompt a frozen LLM with in-context rows — but random examples give suboptimal quality. TABGEN-ICL iteratively retrieves real subsets representing the residual between current synthetic and true distributions, prompting the LLM where it is currently worst. Locally better examples per iteration; globally converges toward the true distribution. On five datasets it cuts fidelity error up to 42.2% vs random ICL and beats CLLM/GReaT on recall/diversity. First demonstration that frozen-LLM prompting can yield high-quality tables.

**Synopsis:**
Low-compute recipe for readers (GPT-4o-mini class, temperature 1.0 in paper). Teach the residual intuition with a picture: each round aims at uncovered regions, boosting recall/diversity most. Omit CLLM's curation classifier for fair comparison in labs, then add curation back as an exercise.

### 15. DiffLM (ACL Findings 2025, ByteDance) — Zhou et al.

- Full title: DiffLM: Controllable Synthetic Data Generation via Diffusion Language Models
- Free: https://aclanthology.org/2025.findings-acl.1061.pdf (also arXiv:2411.03250)
- Code: https://github.com/bytedance/DiffLM

**Abstract (official):**
Prompting LLMs for structured data is brittle (weak distribution sense + prompt engineering). DiffLM: VAE + latent diffusion + plug-and-play latent-injection into the LLM. Diffusion repairs the VAE latent/real-distribution gap and preserves format structure; injection decouples distribution learning from generation. On seven structured sets (tabular/code/tool) downstream performance beats real data by 2–7% in cases.

**Synopsis:**
Controllable-generation pattern: learn distribution once, steer decoding per task. The "beats real" cases are good for a candid box on why (denoising + balancing can help) and when to distrust it (small test sets, leakage). Pairs well with DP-LLMTGen for "control + privacy" lab.

### 16. DP-LLMTGen (2024) — Tran & Xiong

- Full title: Differentially Private Tabular Data Synthesis using Large Language Models
- Free: https://arxiv.org/pdf/2406.01457v1.pdf (abs: https://arxiv.org/abs/2406.01457)

**Abstract (official):**
DP tabular synthesis enabling data sharing remains hard. DP-LLMTGen fine-tunes pretrained LLMs (LLaMA-2-7B in experiments) in two stages: (1) public format-learning on random tables with standard LM loss (no privacy spent); (2) DPSGD private fine-tune with tabular-specific losses — weighted cross-entropy over value vs format tokens (WCEL) + numerical-understanding loss (NUL). Sampling + text→table decoding yields synthetic rows. Beats varied DP baselines across datasets/epsilons; ablations + fairness-constrained generation included.

**Synopsis:**
DP-LLM lab exercise verbatim: stage-1/format vs stage-2/distribution split is the trick that fixes format-compliance collapse under DPSGD. Costs to flag: LoRA + LLM + DPSGD is heavy; that motivates the book's "when marginal/PrivBayes suffices" guidance. Fairness-constrained decoding gives you a de-biasing demo.

## C. Privacy, evaluation, benchmarking (your moat)

### 17. Towards Principled Assessment / SynMeter (2024/2025) — Du & Li (Purdue)

- Venue: arXiv:2402.06806; SIGMOD 2025 version as Systematic Assessment of Tabular Data Synthesis Algorithms
- Free: https://arxiv.org/html/2402.06806v2
- Tool: https://anonymous.4open.science/r/SynMeter

**Abstract (official):**
Many synthesizers exist (DP and heuristic-privacy), but fair comparison is blocked by flawed metrics and missing head-to-heads of diffusion/LLM vs marginal SOTA. This framework critiques existing metrics, adds fidelity (Wasserstein, unified across numeric/discrete/mixture marginals), privacy (Membership Disclosure Score — black-box, DP-aligned), and utility (ML Affinity for distribution shift + range-query error) metrics, plus a unified tuning objective that improves all methods. Evaluation: 8 synthesizer families × 12 datasets. No definitive winner; stark heuristic-vs-DP gap; new directions for private synthesis.

**Synopsis:**
Adopt as evaluation backbone. Teach why DCR/naive MIA mislead, then replace with MDS (per-record disclosure with holdout discipline) + MLA (relative TSTR gap, model-agnostic). The unified-tuning point is methodologically important: most papers compare untuned defaults — your labs should tune then compare.

### 18. Generating Synthetic Data with Formal Privacy Guarantees (2025) — Schlegel et al.

- Venue: arXiv:2503.20846
- Free: https://arxiv.org/pdf/2503.20846

**Abstract (official):**
Privacy-preserving synthetic data could unlock siloed high-stakes data. This survey unites generative-model + DP foundations with SOTA across tabular/image/text, plus evaluation (fidelity: JSD/KL/Wasserstein; utility: TSTR/TSTS ranking preservation; privacy: epsilon + shadow-model MIA). Gaps: no realistic specialized-domain benchmarks; thin empirical grounding of formal guarantees. Empirics (4 methods × 5 specialized datasets): sharp degradation at realistic epsilon ≤ 4 vs general-benchmark optimism. Calls for robust frameworks, domain benchmarks, better specialized techniques.

**Synopsis:**
Honest-DP chapter in one paper. Quote: don't celebrate epsilon=∞ results. Its TSTS-vs-TSTR ranking-preservation test belongs in your eval checklist (if method A beats B on real, it should on synthetic). Use its "general benchmarks flatter DP" warning to justify a 911-flavored benchmark.

### 19. Scoping review of privacy and utility metrics in medical synthetic data (npj Digital Medicine, 2025) — Kaabachi et al.

- Venue: npj Digit Med 8, 60 (Jan 2025), open access
- Free: https://www.nature.com/articles/s41746-024-01359-3

**Abstract (official):**
Synthetic data could enable health-data sharing beyond initial collection, but no consensus evaluation standard blocks adoption. Reviewing 73 studies, the authors systematize privacy + utility evaluation. Findings: many ways to assess utility, no consensus on best-in-context; most studies skip privacy evaluation, and those that do often underestimate risk.

**Synopsis + key numbers (from full text, for your taxonomy table):**
17 utility + 5 privacy families; 49 terms for utility/fairness, 22 for privacy; 95% evaluate utility, only 46% of privacy-claiming studies evaluate privacy; membership inference (28 instances) > attribute inference (9); methods: holdout-distinguishing (12), distance-to-real (9), record matching (7), match-conditioned inference (5), ML-model inference (4). Cautionary tale: same similarity metric used for both utility and privacy in one study. Adopt its taxonomy: broad (uni/bi/multi/longitudinal fidelity) vs narrow (task) utility + fairness; membership vs attribute inference.

### 20. Privacy-Preserving Generative Models (2025) — Padariya et al.

- Venue: arXiv:2502.03668
- Free: https://arxiv.org/html/2502.03668

**Abstract (official):**
Despite generative-model success, privacy/utility study is urgent. Prior surveys cover DP-GANs briefly or attacks only, and ignore utility systematics. This reviews 100+ papers on GAN/VAE privacy + utility: novel taxonomies for privacy attacks, privacy metrics (attack-based, generalization/overfitting-based, DP with DP-SGD/PATE noise), and utility (task-specific + fidelity: distributional KL/JSD/Wasserstein/MMD/FID/IS, statistical KS/mean-std, visual PCA/tSNE; sample-level distances). Closes with gaps/future directions.

**Synopsis:**
Metrics-catalog appendix source (GAN/VAE era). Useful for the overfitting-as-leakage viewpoint and PATE-vs-DPSGD design choice. Pair with entry 18 (which adds diffusion/LLM + DP-empirics) to avoid dating the book.

### 21. Benchmarking Fidelity and Utility of Synthetic Relational Data (2024) — Hudovernik, Jurkovic, Strumbelj

- Venue: arXiv:2410.03411
- Free: https://arxiv.org/html/2410.03411
- Tool: https://github.com/martinjurkovic/syntherela

**Abstract (official):**
Relational synthesis (multi-table with foreign-key structure) lags single-table work and is harder to benchmark. This reviews relational methods, datasets, and fidelity/utility measurement, then builds an open benchmark (best practices + novel robust discriminative detection with XGBoost + aggregation) and tests six methods incl. two commercial ones. Result: none produces indistinguishable data; utility shows only moderate real-vs-synthetic correlation for predictive performance and feature importance.

**Synopsis:**
Evidence that multi-table is unsolved — room for SynthCCD v2 (incident → unit-response → call-event joins). Teach its three granularity levels (column / table / multi-table) + detection-with-CIs + bootstrapped distance metrics. Tested stack to name: SDV, RC-TGAN, REaLTabFormer, ClavaDDPM, MostlyAI, Gretel (ACTGAN/TabularLSTM); datasets AirBnB/Rossmann/Walmart/Biodegradability/MovieLens/Cora.

### 22. Comparative Study of Open-Source Libraries: SDV vs Synthcity (2025) — Del Gobbo

- Venue: arXiv:2506.17847
- Free: https://arxiv.org/html/2506.17847v1
- Code: https://github.com/cris1618/syntheticData

**Abstract (official):**
Small teams struggle to get real data; synthetic tabular generators help if they preserve structure + privacy + scale. This compares six generators — SDV (GaussianCopula, CTGAN, TVAE) vs Synthcity [spelled "Synthicity" in paper] (Bayesian Network, CTGAN, TVAE) — on Belgian low-energy-house data (UCI), training on 1,000 rows and generating 1:1 (1k) and 1:10 (10k). Metrics: statistical similarity + TSTR utility with four regressors. Similarity flat across models; utility drops notably at 1:10. Synthcity BN best fidelity both settings; SDV TVAE best 1:10 utility; no significant library gap overall, but SDV wins on docs/ease.

**Synopsis:**
Tool-choice guidance + low-data lesson: 10× upsampling from 1k rows degrades utility even when marginals look fine — directly relevant to "we only have 3 months of CAD logs" scenarios. Also explains CTGAN's poor showing (hyperparameter sensitivity differs by implementation). Cite for "start with SDV for usability; add Synthcity BN for fidelity."

### 23. Syntheval (Data Mining & Knowledge Discovery, 2025) — Lautrup et al.

- Venue: Data Min Knowl Discov 39(1), 2025. DOI: https://doi.org/10.1007/s10618-024-01081-4 — Preprint: https://arxiv.org/abs/2404.15821
- Tool: https://github.com/schneiderkamplab/syntheval

**Abstract (official):**
Data scarcity, fairness, and privacy drive synthetic-data demand, but robust utility/privacy assessment tools lag. SynthEval is an open-source tabular evaluation framework that treats categorical + numerical attributes with equal care and assumes no special preprocessing, so it applies to virtually any record-level table. It combines statistical + ML techniques for fidelity and privacy-integrity checks, with independently usable or fully customizable benchmark configs and easy extension with new metrics. Paper describes the framework + versatility examples to enable better benchmarking and consistent model comparison.

**Synopsis:**
Your recommended harness alongside SDMetrics + SynMeter: easiest to drop into CI for SynthCCD outputs. Strength vs SDMetrics is equal-care categorical handling without preprocessing assumptions. Lab: run all three harnesses on one synthetic CAD sample and show where they disagree — that disagreement is the lesson.

## Reading order (4-week sprint)

- Week 1: 7 → 1 → 6 (mental models + tabular map)
- Week 2: 9 → 10 → 12 → 13 (diffusion + LLM core)
- Week 3: 11 → 14 → 15 → 16 (privacy-aware LLM + controllable + DP)
- Week 4: 17 → 18 → 19 → 21 (evaluation + relational gap + tool comparison 22, harness 23)
