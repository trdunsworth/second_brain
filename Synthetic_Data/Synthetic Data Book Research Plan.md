---
type: research-project
topic: "Synthetic Data - Book Research"
hypothesis: "There is an unfilled niche for a practical, tabular-first, LLM-era synthetic data book grounded in real public-safety experience (SynthCCD), despite 6-7 existing books."
methodology: "Systematic survey of open-access papers (2023-2026), hands-on tool evaluation, competition scan of books"
data_source: "arXiv, MDPI, Springer Open Access, Nature, ACM/IEEE open proceedings, Royal Society, GitHub, vendor docs"
start_date: "2026-09-28"
end_date:
status: "In Progress"
tags:
  - research
  - project
  - synthetic-data
  - book
---

# Synthetic Data - Book Research

## Research Question

Is there a viable, non-redundant book to be written on synthetic data, grounded in experience building https://github.com/trdunsworth/SynthCCD (synthetic 9-1-1 CAD incidents + hourly phone-center counts)? Specifically: what has changed in 2023-2026 (diffusion + LLM tabular synthesis, privacy/evaluation rigor), what tools exist, and what do current books miss?

## Hypothesis

Existing books (2021-2026) skew toward vision/simulators or general ML intros and predate the 2024-2026 wave of LLM/diffusion tabular methods (TabSyn, TabDiff, HARMONIC, Tabby, LLM-TabLogic, DP-LLMTGen, TabularARGN). A practitioner book focused on tabular + relational + sequential public-sector data, with evaluation (fidelity/utility/privacy), differential privacy, and reproducible Python/R workflows, fills a real gap. You are not wasting your time — but you must differentiate.

## Background & Motivation

- Author experience: SynthCCD — TUI-first generator for 9-1-1 CAD incidents (agency, priority, lifecycle timestamps, personnel, elapsed seconds, full street-address columns, hour/dow/week_no derivatives) and hourly phone counts, with exports to CSV/Parquet/JSON/YAML/pandas/polars/GeoJSON/Shapefile/PostgreSQL/SQL Server/MariaDB/DuckDB/SQLite, OSM-backed address provider, Typer CLI + Textual TUI.
- Field shift: 2023 = GAN/VAE + simulators/games; 2024-2026 = diffusion + LLM tabular synthesis, TabularARGN efficiency gains, formal DP synthesis, principled evaluation (SynMeter, Syntheval, SDMetrics).
- Demand drivers: data scarcity, privacy regulation (GDPR/CCPA), bias/de-biasing, augmentation, digital sandboxes/hackathons, 9-1-1/public-safety data sharing constraints.
- Key tension from literature: fidelity vs. privacy vs. utility vs. expressivity vs. efficiency. No single synthesizer wins. Marginal-based DP methods still beat deep methods on utility recovery under strict epsilon, but diffusion/LLM methods lead on high-dimensional fidelity.

See detailed findings:
- [[Papers - Synthetic Data 2023-2026]]
- [[Tools - Software Packages and Websites]]
- [[Books - Competition Scan]]

## Data

### Source

- Papers: arXiv + open-access journals/proceedings (all links verified free, no paywall as of 2026-09-28)
- Tools: GitHub repos, docs sites, benchmarks (AIMultiple 2025, mltechniques multi-table comparison)
- Books: publisher pages (Springer, Packt/O'Reilly, Elsevier, Wiley, Apress, BPB)
- Own artefact: SynthCCD repo + docs/adr, USERSGUIDE, REALISMGUIDE

### Variables

- Paper: method class (traditional / GAN / VAE / diffusion / LLM / hybrid), modality (tabular/relational/sequential/text/image), privacy claim (heuristic vs DP epsilon), evaluation (fidelity/utility/privacy metrics), code availability
- Tool: license, data support (single/multi/sequential), models, DP support, CPU/GPU, maturity/docs
- Book: year, pages, audience, tabular depth, LLM/diffusion coverage, privacy/evaluation coverage, hands-on code

### Time Period

- Papers/tools: Sept 2023 – Sept 2026 (last 3 years)
- Books: 2021–2026 (to judge competition; focus 2023+)

### Preprocessing

- Exclude paywalled-only papers; prefer arXiv + open-access versions + ACL/NeurIPS/ICLR/KDD open proceedings
- Normalize evaluation language to fidelity / utility (broad vs narrow) / privacy per npj Digital Medicine 2025 taxonomy
- Track TSTR (train-synthetic-test-real) as standard utility probe

## Methodology

### Approach

1. Survey reviews first (tabular survey, LLM-driven survey, healthcare review, Royal Society explainer, KDD tutorial survey), then SOTA methods, then privacy/evaluation.
2. Hands-on tool test: SDV vs Synthcity vs MOSTLY AI SDK vs YData on a small 911-like table; report quality with SDMetrics/Syntheval.
3. Competition matrix of 7 books vs proposed TOC.
4. Draft TOC + sample chapter using SynthCCD as running example.

### Tools & Libraries

- Python: SDV, Synthcity, mostlyai, mostlyai-engine, ydata-synthetic (fg-data-synthetic), gretel-synthetics, SDMetrics, syntherela, TabSyn/TabDiff/TabDDPM reference impls
- R: SynthCCD-adjacent R workflows; Generative AI in R (2026) code patterns; synthpop-adjacent comparison
- Eval: DCR, MDS, MLA, alpha-precision/beta-recall, Shape/Trend, MLE/TSTR, DLT/LLE (HARMONIC), FID/MAUVE where relevant

### Model Specifications

- Baselines: GaussianCopula, Bayesian Network, CTGAN, TVAE
- Diffusion: TabDDPM, TabSyn (latent VAE + score diffusion), TabDiff (joint continuous-time mixed-type + learnable schedules), Forest Diffusion, CoDi, STaSy
- LLM: GReaT-style fine-tune, REaLTabFormer, TabuLa, HARMONIC (kNN instruction tuning), Tabby (MoE + Plain training), LLM-TabLogic (LLM reasoning + latent diffusion), TABGEN-ICL (training-free residual ICL), DiffLM (VAE + latent diffusion + plug-in injection), DP-LLMTGen (2-stage LoRA + DPSGD)
- SOTA efficient: TabularARGN (MOSTLY AI)

### Validation Strategy

- Fidelity: univariate/bivariate/multivariate similarity (Wasserstein, JSD, KS), Shape/Trend, detection (indistinguishability)
- Utility: TSTR ML efficacy + ML affinity (rank preservation), range queries, business-rule checks (e.g., new_balance > 0, inter-column consistency HCS/MDI/DSI)
- Privacy: DCR (with holdout baseline, not alone), membership disclosure score (MDS), attribute inference, DP epsilon reporting, DLT for LLM leakage
- Reproducibility: seeds, code links, dataset versions (Adult, Beijing, California Housing, etc.)

## Analysis Plan

- [x] Step 1: Instantiate this plan + initial paper/tool/book sweep (2026-09-28)
- [ ] Step 2: Deep-read 5 anchor surveys + Royal Society explainer; extract taxonomy for book Part I
- [ ] Step 3: Install + benchmark SDV / Synthcity / MOSTLY AI / YData on SynthCCD-like sample; record fidelity/utility/privacy + runtime
- [ ] Step 4: Build book competition matrix + draft differentiated TOC + write sample chapter outline
- [ ] Step 5: Decision gate: proposal vs. blog-series vs. SynthCCD docs expansion

## Progress Log

### 2026-09-28

- Created folder structure + 4 notes (plan, papers, tools, books)
- SynthCCD reviewed: TUI-first 911 CAD + phone counts generator, OSM addresses, multi-format exports
- Initial sweep: 15+ open papers, 12+ tools/packages, 7 books identified; all paper links open-access
- Early signal: 2023 books miss 2024-2026 diffusion/LLM + evaluation rigor; tabular-relational gap remains

## Results

### Summary Statistics

- Papers collected: 16 (all free: arXiv / MDPI / Springer OA / Nature OA / ACL / NeurIPS / ICLR / KDD / Royal Society PDF)
- Tools/packages: 14 + 5 evaluation suites + 4 websites/benchmarks
- Books found: 7 (2021×1, 2023×2, 2024×1, 2025×1, 2026×2)

### Key Findings

1. Tabular synthesis is now diffusion + LLM led, but no winner: TabDiff/TabSyn top fidelity; TabularARGN top efficiency (1-2 orders faster); marginal methods still most stable under DP epsilon ≤ 4.
2. Evaluation is the mess: 49 terms for utility, 22 for privacy; only ~46% of privacy-claiming health studies evaluate privacy; similarity metrics (DCR) alone mislead — need holdout baselines + MDS + MI attacks + epsilon.
3. Book gap is real: Kerim (2023) = vision/simulators/GANs; Granville (2024) = ML foundations; Wiley (2025) = edited survey; BPB (2026) = closest (LLM/diffusion/TSTR/DP) but generic AI-training framing — none does practitioner tabular-relational-sequential with public-safety running example + inter-column logic + Dübendorf-style realism configs.

### Visualizations

- TODO: add fidelity/utility/privacy trade-off diagram; timeline 2023→2026 method waves; tool matrix heatmap

## Interpretation

The hypothesis holds conditionally: don't write "another synthetic data intro." Write the tabular-practitioner book the field lacks — evaluation-first, privacy-honest, running on a realistic 911/CAD domain where business rules and inter-column logic matter more than photorealism.

## Conclusions

- Not a waste of time if scoped to: tabular/relational/sequential, 2024-2026 methods, evaluation + DP done right, Python (+R notes), SynthCCD as case study.
- Avoid head-on rematch with Kerim (vision) or BPB Kumar (generic LLM pipeline); differentiate on public-sector constraints, address realism, multi-table integrity, and auditability.

## Limitations & Future Work

- [ ] Verify DP claims by rerunning epsilon sweeps; don't trust reported numbers alone
- [ ] Check licenses (SDV BSL vs Apache/MIT) before recommending for commercial readers
- [ ] Expand non-health domains (public safety, energy, finance) — current surveys are 59% health-skewed
- [ ] Interview 2-3 practitioners (911, health, finance) for requirements chapter

## Connections

- [[Papers - Synthetic Data 2023-2026]]
- [[Tools - Software Packages and Websites]]
- [[Books - Competition Scan]]
- [SynthCCD](https://github.com/trdunsworth/SynthCCD)

## References

See [[Papers - Synthetic Data 2023-2026]] for full open-access list with URLs.

## Code & Notebooks

- [SynthCCD](https://github.com/trdunsworth/SynthCCD)
- TODO: add benchmark notebook link once Step 3 runs
