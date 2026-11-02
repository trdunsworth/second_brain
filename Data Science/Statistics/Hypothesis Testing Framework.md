# Hypothesis Testing Framework

Hypothesis testing is a formal procedure for investigating whether a claim about a population is supported by the evidence in a sample.

## 1. The Hypotheses
- **Null Hypothesis ($H_0$)**: The status quo. It assumes there is no effect, no difference, or no relationship.
- **Alternative Hypothesis ($H_a$ or $H_1$)**: The claim we are testing for. It assumes there is a significant effect or difference.

## 2. Significance Level ($\alpha$)
The threshold for rejecting the Null Hypothesis. 
- Common values: $0.05$ (5%), $0.01$ (1%), or $0.10$ (10%).
- If $\alpha = 0.05$, we are willing to accept a 5% risk of concluding a difference exists when it actually doesn't.

## 3. The P-Value
The probability of observing a result as extreme as, or more extreme than, the result obtained, assuming the Null Hypothesis is true.
- **$p \leq \alpha$**: Reject the Null Hypothesis (Statistically Significant).
- **$p > \alpha$**: Fail to Reject the Null Hypothesis (Not Statistically Significant).

## 4. Errors in Decision Making

| Actual State $\rightarrow$ | $H_0$ is True | $H_0$ is False |
| :--- | :--- | :--- |
| **Decision: Fail to Reject $H_0$** | Correct | **Type II Error ($\beta$)** (False Negative) |
| **Decision: Reject $H_0$** | **Type I Error ($\alpha$)** (False Positive) | Correct (Power) |

- **Type I Error**: Claiming a result is significant when it is actually due to chance.
- **Type II Error**: Failing to detect a significant result that actually exists.

## 5. The Workflow
1. State the $H_0$ and $H_a$.
2. Choose a significance level ($\alpha$).
3. Collect data and calculate the test statistic.
4. Determine the p-value.
5. Compare p-value to $\alpha$ and draw a conclusion.