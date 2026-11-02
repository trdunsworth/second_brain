# Causal Inference

Causal Inference is the process of determining the actual effect of one variable on another, moving beyond simple correlation.

## 1. Correlation $\neq$ Causation
- **Correlation**: Two variables move together.
- **Causation**: A change in one variable *causes* a change in the other.
- **The Confounder**: A third variable that influences both the cause and the effect, creating a "spurious correlation."
    - *Example*: Ice cream sales and drowning incidents both increase in summer. Heat is the confounder.

## 2. Establishing Causality (The Gold Standard)
The **Randomized Controlled Trial (RCT)** or **A/B Test** is the gold standard for causal inference. By randomly assigning subjects to a treatment group and a control group, we "balance" all confounders, ensuring that any difference in outcome is caused by the treatment.

## 3. Causal Inference with Observational Data
When we cannot run an RCT (for ethical or practical reasons), we use other methods:
- **Propensity Score Matching**: Pairing similar individuals from the treatment and control groups to mimic randomization.
- **Instrumental Variables (IV)**: Using a third variable (the instrument) that affects the treatment but not the outcome directly.
- **Difference-in-Differences (Diff-in-Diff)**: Comparing the change over time between a treatment group and a control group.
- **Regression Discontinuity**: Comparing individuals just above and below a strict cutoff threshold.

## 4. The Counterfactual Framework
The core of causal thinking is the **Counterfactual**: "What would have happened to this specific unit if they had received a different treatment?" Since we can never observe both the actual and counterfactual outcome for the same person, we use statistical methods to estimate the "Average Treatment Effect" (ATE).