# Synthetic Data — folder index

> Research project supporting [[Synthetic Data Book Research Plan]].
> Created 2026-10-16. Folder scope was previously implicit and had drifted — this states it.

---

## What this folder holds

**The research base for a book on synthetic data**, surveyed from Sept 2023 – Sept 2026.

The organising question is the one in the project note: *what changed, what tools exist, and
what do current books miss?* Everything in this folder answers one of those three.

---

## Why this folder holds both *methods* and *applications*

This is the thing that looked like drift and is actually the design.

The obvious split would be:

```
synthetic-data METHODS   → SDV, synthcity, diffusion tabular, DP generators
synthetic-data APPLICATIONS → anything that consumes synthetic data
```

But a book on synthetic data needs **both halves in one place**, and the half that
distinguishes a good book from a methods list is the application side — specifically the
question *does it actually work when someone uses it?*

**Applications are in scope when they answer that question.** Concretely, as of 2026-10-16,
the folder holds one:

| Paper | Why it qualifies |
|---|---|
| `2609.37959v1.pdf` — **TabFM** 🔗 [arXiv:2609.37959](https://arxiv.org/abs/2609.37959) | A 400M foundation model trained **entirely on synthetic tables from structural causal models**, reaching #1 among tabular FMs on 51 real datasets. The strongest single answer to *does synthetic pretraining transfer to real data?* |
| `2609.37989v1.pdf` — **TabFM-Auto** 🔗 [arXiv:2609.37989](https://arxiv.org/abs/2609.37989) | Pairs TabFM with an LLM agent that evolves the data pipeline; discovered pipelines transfer across frozen FMs (+69–143 Elo) with no further search |

TabFM is the sharpest available case for the book's central argument — **synthesis grounded in
an explicit causal mechanism transfers; synthesis that mimics a density mostly does not.** It
is also the clean counterweight to the circularity warning that runs through
[[Nixtlaverse]] §4 and [[Conformal Prediction]] §12: a causal generator teaches structure
rather than teaching a model its own assumptions.

> These two moved here from `Time Series/` on 2026-10-16. They are **tabular, not temporal** —
> the previous location was wrong, and `Time Series/` is now PDF-free. They stay documented in
> [[Time Series Foundation Models]] §2 and §6 because "does purely-synthetic pretraining
> transfer to *temporal* data?" is an open question there, and TabFM is the closest available
> evidence.

**The test for a future addition:** does it bear on whether synthetic data works, or only on
how it is generated? Generation-only → still in scope, but it belongs in the papers list, not
as a headline corpus item.

---

## Contents

### The project

| Note | What it does |
|---|---|
| [[Synthetic Data Book Research Plan]] | The research question, methodology, and project state. `type: research-project`, in progress since 2026-09-28 |

### The three surveys

| Note | Covers |
|---|---|
| [[Papers - Synthetic Data 2023-2026]] | 23 entries + 2 (TabFM, TabFM-Auto). Grouped **A** surveys · **B** tabular SOTA · **C** privacy & evaluation — the last being the book's differentiator. All open-access, no paywall |
| [[Tools - Software Packages and Websites]] | Creation + evaluation packages. Section A is libraries, B evaluation suites, D legacy, E websites; plus a suggested lab stack |
| [[Books - Competition Scan]] | 7 competing books (2021–2026) with a verdict: *no, not worth it unless differentiated* |

### The paper corpus

Eleven PDFs. Nine are synthetic-data **methods and privacy** work. Two are the TabFM pair
described above.

---

## Deliberately not here

- **`SynthCCD/`** — the 9-1-1 synthetic data *generator*. Separate project with its own README;
  this folder cites it as the book's public-safety grounding, but does not duplicate it.
- **Synthetic time series.** The nearest tool is `synforecast` (Nixtla), documented in
  [[Nixtlaverse]] §4, not here. It is a forecasting library, not a synthetic-data research
  base — though its changepoint/anomaly injection is what [[Conformal Prediction]] §12 uses to
  get ground truth.

---

## Cross-links

- [[Research MOC]] — where this project is tracked
- [[Nixtlaverse]] §4 — `synforecast`, the time-series-adjacent tool
- [[Conformal Prediction]] §12 — synthetic data as a ground-truth instrument
- [[SynthCCD/README]] — the public-safety grounding