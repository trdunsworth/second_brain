---
type: reference
status: active
tags:
  - time-series
  - anomaly-detection
  - unsupervised
  - foundation-models
  - moment
  - operational
created: 2026-10-14
aliases:
  - Anomaly Detection
  - TSAD
  - Time Series Anomaly Detection
  - Outlier Detection
---

# Time Series Anomaly Detection

The forecasting-adjacent half of the time-series ecosystem. Your vault has almost none of
it — and for 9-1-1 work it is arguably **more operationally valuable than forecasting**.

> A PSAP manager does not mostly want a number. They want to know **"is tonight unusual?"** —
> right now, on the stream, before shift planning locks. That is an anomaly detection
> problem, and it needs a different toolset than forecasting.

---

## 1. Why it is a separate problem

| | Forecasting | Anomaly detection |
|---|---|---|
| Question | "What will `y` be at `t+h`?" | "Is the current `y` abnormal?" |
| Latency budget | Hours to days | **Real-time** |
| Output | Point / distribution | Score or label |
| Failure mode | Inaccurate forecast | **False alarms** (too many) or missed incidents |
| Cost of error | Operational inconvenience | Crew burnout, missed escalation, alarm fatigue |

> **False positives are the dominant failure mode.** An anomaly detector that fires nightly
> is switched off within a month and provides nothing after that. This is the same
> precision/coverage tension as conformal prediction
> ([[Model Validation Strategies]] §6.4), but with a much harsher budget: responders
> de-tune alarms in weeks, not quarters.

---

## 2. Method taxonomy

### 2.1 Classical statistical

| Method | Mechanism | Notes |
|---|---|---|
| **STL + residual threshold** | Decompose, flag residuals beyond `k·σ` | Simple, interpretable, strong baseline. See [[forecast-reconciliation]] decomposition tooling |
| **Z-score / MAD on residuals** | Robust location and scale on residuals | `MAD` beats `σ` against outliers |
| **EWMA control charts (CUSUM, EWMA)** | Sequential detection of mean/scale drift | Designed for this. **Shewhart charts are the industrial default** |
| **Isolation Forest** 🔗 [arXiv:0811.0172](https://arxiv.org/abs/0811.0172) | Random-axis partitioning | Fast, no density assumption |
| **Matrix Profile / discord** 🔗 [UCR](https://www.cs.ucr.edu/~eamonn/time_series_data_2018/) | Nearest-neighbour in time-pair space; finds repeated subsequences | Excellent for **motif/discord** discovery — "has this shape ever happened before?" |

The matrix-profile formulation is particularly suited to operational questions: a discord is
a subsequence with no close match in history, which is close to what a supervisor means by
"that's not normal."

### 2.2 Deep learning, reconstruction-based

Autoencoders, LSTM autoencoders, and sequence-to-sequence reconstruction. Learn normal
behaviour, flag high reconstruction error.

**Strengths** — captures complex multivariate normal structure.
**Weaknesses** — trains on mostly-normal data, so if the training window contains anomalies
they get reconstructed as normal. Threshold selection is the real problem.

### 2.3 Foundation models — MOMENT

**MOMENT** 🔗 [arXiv:2402.03885](https://arxiv.org/abs/2402.03885) · *ICML 2024* ·
[code](https://github.com/moment-timeseries-foundation-model/moment)

T5 encoder, pre-trained with **masked time-series prediction** on the **Time Series Pile**.
Covered here rather than in [[Time Series Foundation Models]] because its headline task is
*not* forecasting:

| Task | Supervision | Setup |
|---|---|---|
| Forecasting | linear probing | zero-shot or few-shot |
| **Classification** | linear probing | zero-shot or few-shot |
| **Imputation** | linear probing | zero-shot or few-shot |
| **Anomaly detection** | linear probing | zero-shot or few-shot |

> **The case for anomaly detection being the better first use of a TSFM.** There are far
> fewer unlabelled-label acquisition problems: **anomaly detection needs no labels at all**,
> whereas forecasting competitions need careful panel construction and the models need to
> compete on a common metric. For a small jurisdiction with one series and no historical
> labels, this is a much more natural fit than forecasting.
>
> MOMENT also reports on the effectiveness of pretrained models with minimal task-specific
> fine-tuning — directly relevant if labelled incident data is scarce.

⚠️ **Caveat:** MOMENT does not explicitly model temporal resolution — the paper states this
as a deliberate simplification, since that information is often unavailable outside
forecasting datasets. **For hourly data where the sampling frequency matters, that is a real
limitation**, and it is a strong argument for using it via a wrapper that supplies the
frequency explicitly.

---

## 3. The evaluation problem

> ### ⚠️ Anomaly detection benchmarks are severely compromised
>
> Nearly every public TSAD benchmark has **known data-quality problems** — mislabelled
> anomalies, semantic errors in the anomaly ranges, duplicates and constant-value segments
> misclassified as anomalies. **Accuracy numbers on public TSAD benchmarks should be treated
> as indicative only.**
>
> This is the field's equivalent of the contamination problem in TSFMs
> ([[Time Series Foundation Models]] §3). Report it whenever you cite a benchmark score.

### Metrics

| Metric | Formula | Meaning |
|---|---|---|
| **Precision / Recall / F1** | — | ⚠️ **Requires labels. Usually unavailable.** |
| **Range-based F1** 🔗 [Tatbul](https://arxiv.org/abs/2303.03241) | Overlap of predicted and true anomaly *ranges*, adjusted for range size and position | The standard when labels exist |
| **AUC-ROC / AUPRC** | — | ⚠️ **AUPRC, not AUROC** — with heavy class imbalance AUROC is misleadingly high |
| **Precision@k / Recall@k** | Best `k` detections | Useful with scarce labels |
| **Affiliation F1** 🔗 [Tatbul](https://arxiv.org/abs/2302.03885) | Point-adjusted, penalises distant false positives | |
| **Threshold-free ranking** | e.g. **USAD**, **OmniAnomaly** | No threshold selection required |

### The unsupervised evaluation trap

> **In a real deployment you have no labels — so you cannot tune the threshold on a test set.**
>
> If someone reports "we achieved 0.92 F1", ask: **on what labels?** If the answer is a
> public benchmark with documented labelling defects, the number means very little.

For genuinely unsupervised deployment, the only defensible evaluations are:
1. **Synthetic injection** — inject known anomalies into real normal data. Controllable, but
   assumes your anomaly types are representative.
2. **Expert review** — have domain experts label a sample. Slow, but this is what actually
   validates a detector.
3. **Proxy operational metrics** — alarm burden per shift, time-to-detection, and whether
   responders still trust the alarm after a month.

> For 9-1-1, **expert review is feasible and nobody has done it.** Having dispatch
> supervisors label a few hundred hours of "would you have escalated this?" is achievable and
> would produce the first real evaluation in the domain. That is a publishable contribution.

---

## 4. Practical pipeline

```
1. Resample to a fixed frequency; fill gaps explicitly (missing ≠ zero)
2. Decompose (STL) or difference; work on residuals
3. Scale per series — instance-normalise; see Distribution Shift and Normalization
4. Score with one or more detectors
5. Calibrate a threshold against an explicit, stated false-alarm budget
6. Stratify the alarm rate by hour-of-week
7. Report alarm burden per shift, not just F1
```

> **Step 6 is not optional for 9-1-1.** A detector calibrated to a 1% global false-alarm rate
> will fire every night at 03:00 if the overnight baseline is low, because low-count hours
> have high relative variance. The standard fix is to normalise by an
> **expected-variance model conditioned on hour-of-week** — i.e., model the scale as a function
> of the hour of week, not a global constant. This is exactly what a Negative Binomial or a
> [[Intermittent and Sparse Demand]]-style size–interval decomposition gives you.

### Connection to forecasting

Detection and forecasting share machinery, and the reuse is real:

| Forecasting component | Detection use |
|---|---|
| Prediction intervals | Flag points outside the interval — but only if calibrated |
| Conformal prediction | Turn intervals into a distribution-free detector. **Same calibration set serves both.** |
| Quantile forecasts | Multiple quantiles → sensitivity levels from one pass |
| Hierarchical reconciliation | Coherence violation *is* an anomaly signal |

> **The most elegant option:** if you already run a conformally-calibrated probabilistic
> forecast, you get a calibrated anomaly detector for free from the same calibration data.
> The nonconformity score is the detection statistic. See
> [[Practice 04 — Conformal Prediction on Hourly Counts]].

⚠️ **But:** [[Model Validation Strategies]] §6.4 means that marginal coverage does not imply
good detection at peaks — and peaks are exactly what you want to detect. Stratif again.

---

## 5. Datasets and tools

| Resource | Notes |
|---|---|
| **Numenta Anomaly Benchmark (NAB)** | 58 real-world streams with labelled anomalies. Real labels are a rarity — but the labels are not perfect either |
| **Yahoo Webscope S5** 🔗 [https://research.yahoo.com/datasets](https://research.yahoo.com/datasets) | Large-scale benchmark |
| **AIOps / Loghub** | The nearest analogue to observability anomaly detection |
| **TimeEval** 🔗 [https://timeeval.github.io](https://timeeval.github.io) | A rigorous *evaluation protocol* — arguably more valuable than another dataset |
| `stumpy` | Matrix profile / discord discovery in Python |
| `anomalous` | Package collection for TSAD |
| **Nixtla TimeGPT** | Hosted anomaly detection alongside forecasting |
| `statsforecast` | Includes anomaly detection utilities |

> **TimeEval is the resource to look at first.** The TSAD field's reproducibility problem is
> largely a problem of *evaluation protocol* rather than of models — and TimeEval makes the
> protocol explicit and comparable.

---

## 6. References

1. Goswami, M. et al. (2024). MOMENT: A Family of Open Time-series Foundation Models. *ICML 2024*. 🔗 https://arxiv.org/abs/2402.03885
2. Liu, F.T. et al. (2008). Isolation Forest. *ICDM 2008*. 🔗 https://arxiv.org/abs/0811.0172
3. Yeh, C.-C.M., Zhu, Y., Ulanova, L., Begum, N., Ding, Y., Dau, H.A., Silva, D.F., Mueen, A. & Keogh, E. (2016). Matrix Profile I: All Pairs Similarity Joins for Time Series. *ICDM*, 1317–1322. 🔗 https://doi.org/10.1109/ICDM.2016.0179
4. Su, Y. et al. (2019). OmniAnomaly. 🔗 https://arxiv.org/abs/1809.10341
5. Audibert, J. et al. (2020). USAD. 🔗 https://arxiv.org/abs/2009.13807
6. Tatbul, N. et al. (2023). A Range-based Metric for Anomaly Detection Benchmarking. 🔗 https://arxiv.org/abs/2303.03241
7. Kim, S. et al. (2022). Towards a rigorous evaluation of time-series anomaly detection. 🔗 https://arxiv.org/abs/2103.15239
8. Schmidl, S. et al. (2022). Anomaly Detection in Time Series: A Comprehensive Evaluation. 🔗 https://arxiv.org/abs/2209.04406
9. Sørbø, A. & Ruocco, J. (2024). Navigating the metric maze: a taxonomy of evaluation metrics for anomaly detection in time series. *Data Mining and Knowledge Discovery*. 🔗 https://arxiv.org/abs/2403.13935

## Cross-links
 
- [[Intermittent and Sparse Demand]]
- [[Generative and Probabilistic Forecasting]]
- [[Distribution Shift and Normalization]]
- [[Model Validation Strategies]]
- [[Practice 05 — Intermittency, Counts and Anomaly Detection]]
- [[Practice 04 — Conformal Prediction on Hourly Counts]]
- [[Time Series Foundation Models]]
- [[Time Series Similarity, Clustering and Motif Discovery]] — matrix profile, stumpy, discord discovery, and the z-normalisation warning that applies to motif-based detection
- [[Time Series EDA and Data Quality]] — the index-validity checks that must precede any detection
- [[168-Point Forecast Comparison - Discrete vs Continuous]]
