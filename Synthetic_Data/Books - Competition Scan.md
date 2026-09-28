# Books - Competition Scan (are you wasting your time?)

> Verdict up front: **No — but only if you differentiate.** 7 books found (2021–2026). None combines LLM-era tabular/diffusion SOTA + principled evaluation + DP-honest privacy + public-safety running example. Closest risks are Kerim (2023, vision) and Kumar (2026, generic LLM pipeline).

## 1. Sergey I. Nikolenko — Synthetic Data for Deep Learning (Springer, 2021, XII+348pp)

- Page: https://link.springer.com/book/10.1007/978-3-030-75178-4
- Scope: first book; vision (optical flow, detection, segmentation, driving/indoor/aerial/robotics) + GANs + domain adaptation + DP intro + optimization sinews.
- Gap vs you: pre-diffusion/LLM-tabular wave; no TabSyn/TabDiff/HARMONIC/Tabby/TabularARGN; vision-heavy, thin on tabular business rules.
- Takeaway: cite as default reference; position yours as tabular-practitioner successor.

## 2. Gürsakal, Çelik, Birişçi — Synthetic Data for Deep Learning: Generate Synthetic Data for Decision Making with Python and R (Apress, Jan 2023, 220pp)

- Page: https://www.harvard.com/book/9781484285862 (publisher: Apress, ISBN 9781484285862)
- Scope: need-for-synthetic → ML/CV role → driving-system study → Python + R tabular examples → GANs → domain randomization/adaptation.
- Gap vs you: short, GAN-era, no LLM/diffusion tabular SOTA, light evaluation/privacy formalism.
- Takeaway: overlaps your Python+R angle but dated; beat it on depth + 2024-2026 methods.

## 3. Abdulrahman Kerim — Synthetic Data for Machine Learning (Packt/O'Reilly, Oct 2023, 208pp)

- Pages: https://www.packtpub.com/en-ca/product/synthetic-data-for-machine-learning-9781803232607 — https://www.oreilly.com/library/view/synthetic-data-for/9781803245409/
- Scope (17 ch): real-data pain → what-is-synthetic → simulators/renderers (AirSim/CARLA) → GANs (cGAN/CycleGAN/CTGAN/WGAN) → video games → diffusion/DDPM → CV/NLP/predictive case studies → TSTR-adjacent best practices, domain adaptation, diversity, photorealism.
- Strength: most hands-on competitor; GitHub repo; covers text/image/numeric/RLHF.
- Gap vs you: vision/simulator weight; tabular is one GAN variant, not TabDiff/TabSyn/Tabby/LLM-TabLogic/ARGN; evaluation/DP less rigorous than 2024-2026 literature demands.
- Takeaway: **do not rematch head-on.** Differentiate on tabular-relational-sequential + inter-column logic + auditability.

## 4. Vincent Granville — Synthetic Data and Generative AI (Elsevier, Jan 2024)

- Page: https://shop.elsevier.com/books/synthetic-data-and-generative-ai/granville/978-0-443-21857-6
- Scope (18 ch): ML regression/optimization → ensembles → linear algebra → image/video → synthetic clusters/GMM alternatives → explainable AI → fuzzy/interpolation → tabular copulas vs enhanced GANs → RNGs/random walks → terrain (diamond-square) → star clusters → number theory → text/sound.
- Strength: breadth + interpretability + scalability/testing emphasis; tabular copulas vs GANs chapter directly relevant.
- Gap vs you: idiosyncratic (terrain, astro, number theory); no LLM-tabular/DP-evaluation system of 2025-2026.
- Takeaway: borrow explainability stance; outflank on focused practitioner narrative.

## 5. Nidhya et al. (eds.) — Synthetic Data: Generation Methods, Challenges and Real-time Applications (Wiley, Sept 2025, 400pp, Industry 5.0 series)

- Page: https://www.wiley.com/en-us/Synthetic+Data%3A+Generation+Methods%2C+Challenges+and+Real-time+Applications-p-9781394346516
- Scope: edited survey volume (methods/challenges/applications).
- Gap vs you: surveys age fast; lacks single-author practitioner voice + running codebase (SynthCCD).
- Takeaway: cite, don't fear; edited volumes rarely teach workflows end-to-end.

## 6. Singh & Singh — Generative AI in R: Transforming Data Science with Synthetic Data (Apress/Springer, Jan 2026, XVI+580pp)

- Page: https://link.springer.com/book/10.1007/979-8-8688-1763-2
- Scope: GenAI in R — GANs/VAEs in R, synthetic for robustness, ethics/privacy/scarcity framing (health/finance/social).
- Gap vs you: R-centric, foundations-level GenAI; not a tabular-synthesis methods + evaluation manual.
- Takeaway: complementary; consider R appendix or cross-reference rather than compete.

## 7. Ashutosh Kumar — Synthetic Data Generation: Creating Privacy-Safe Datasets for AI Training (BPB, 2026)

- Page (Perlego listing): https://www.perlego.com/book/5541078/synthetic-data-generation-creating-privacysafe-datasets-for-ai-training-and-data-innovation-for-responsible-machine-learning-english-edition-pdf
- Scope (14 ch): probability/rule-based → GAN/VAE/diffusion/LLM → hybrid → quality eval → TSTR pipelines → industry cases → DP/security → compliance/ethics → future. Math + hands-on Python throughout.
- Strength: **closest to your proposal** — modern stack + TSTR + DP + compliance.
- Gap vs you: generic AI-training framing; no public-safety domain depth, no address/CAD realism configs, no multi-table integrity + inter-column logic focus, no SynthCCD-scale open running project.
- Takeaway: main comp to beat on specificity + reproducibility. Read Ch 10–13 first to avoid duplication.

## Positioning matrix (1-line)

| Book | Year | Tabular depth | LLM/Diffusion | Eval/DP rigor | Hands-on | Your edge |
|---|---|---|---|---|---|---|
| Nikolenko | 2021 | Low | None | Low | Med | 5 years of methods |
| Gürsakal et al. | 2023 | Med (R/Python) | None | Low | Med | SOTA + eval |
| Kerim | 2023 | Med (CTGAN) | Early diffusion | Med | High | Tabular-first + logic + audit |
| Granville | 2024 | Med (copula/GAN) | Low | Med | Med | Focus + 2025-26 SOTA |
| Wiley eds. | 2025 | Varies | Partial | Varies | Low | Single voice + code |
| Singh (R) | 2026 | Low | Med (GAN/VAE) | Med | Med | Python-first + relational |
| Kumar (BPB) | 2026 | Med | High | High | High | Domain (911) + rules + realism |

## Recommended differentiation (proposed subtitle angle)

**Practical Synthetic Tabular Data: Evaluation-First Generation with Diffusion + LLMs — A 911/CAD Case Study**

- Part I: thinking (Royal Society + KDD survey framing; fidelity/utility/privacy)
- Part II: baselines that still matter (copula, BN, CTGAN, TVAE) — when cheap wins
- Part III: diffusion + LLM SOTA with code (TabSyn, TabDiff, HARMONIC, Tabby, LLM-TabLogic, TABGEN-ICL, ARGN)
- Part IV: privacy done honestly (DP epsilon sweeps, DCR vs MDS vs MIA, DLT)
- Part V: relational + sequential + geospatial (CAD → unit response; hourly phone counts; OSM addresses)
- Appendices: metrics glossary, license guide (BSL vs Apache/MIT), dataset catalog

Next: draft TOC + non-overlap check against Kumar Ch 10–13 before proposal.
