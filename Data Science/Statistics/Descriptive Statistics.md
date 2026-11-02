# Descriptive Statistics

Descriptive statistics summarize and describe the features of a dataset. They provide simple summaries about the sample and the measures.

## 1. Measures of Central Tendency
These measures describe the "center" of a data distribution.

### Mean (Average)
- **Definition**: The sum of all values divided by the number of values.
- **Formula**: $\bar{x} = \frac{\sum x_i}{n}$
- **When to use**: Best for symmetric distributions without extreme outliers.
- **Sensitivity**: Highly sensitive to outliers.

### Median (Middle Value)
- **Definition**: The middle value when data is sorted in ascending order.
- **When to use**: Best for skewed distributions or data with outliers.
- **Sensitivity**: Robust to outliers.

### Mode (Most Frequent)
- **Definition**: The value that appears most frequently in a dataset.
- **When to use**: Useful for categorical data (nominal scale).

---

## 2. Measures of Dispersion (Variability)
These measures describe how spread out the data is.

### Range
- **Definition**: The difference between the maximum and minimum values.
- **Formula**: $Range = Max - Min$
- **Limitation**: Only considers the two most extreme values.

### Variance ($\sigma^2$ or $s^2$)
- **Definition**: The average of the squared differences from the Mean.
- **Formula (Sample)**: $s^2 = \frac{\sum (x_i - \bar{x})^2}{n-1}$
- **Insight**: A higher variance indicates data is more spread out.

### Standard Deviation ($\sigma$ or $s$)
- **Definition**: The square root of the variance.
- **Formula**: $s = \sqrt{s^2}$
- **Insight**: Expresses the spread in the same units as the original data.

### Interquartile Range (IQR)
- **Definition**: The difference between the third quartile (Q3) and the first quartile (Q1).
- **Formula**: $IQR = Q3 - Q1$
- **Usage**: Used to identify outliers (typically values $1.5 \times IQR$ above Q3 or below Q1).

---

## 3. Measures of Shape

### Skewness
- **Positive (Right) Skew**: Tail extends to the right; Mean > Median.
- **Negative (Left) Skew**: Tail extends to the left; Mean < Median.
- **Zero Skew**: Perfectly symmetric distribution.

### Kurtosis
- **Leptokurtic**: Sharp peak, heavy tails (outliers are more likely).
- **Platykurtic**: Flat peak, light tails (outliers are less likely).
- **Mesokurtic**: Normal distribution.