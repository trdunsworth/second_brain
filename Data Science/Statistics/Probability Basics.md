# Probability Theory Basics

Probability is the foundation of all statistical inference. It quantifies the likelihood that an event will occur.

## 1. Fundamental Concepts

### Sample Space ($S$)
The set of all possible outcomes of a random experiment.

### Event ($E$)
A subset of the sample space.

### Probability Formula
$P(E) = \frac{\text{Number of favorable outcomes}}{\text{Total number of outcomes in sample space}}$

---

## 2. Types of Probability

### Marginal Probability
The probability of a single event occurring, independent of other events.
Example: $P(A)$

### Joint Probability
The probability of two or more events occurring simultaneously.
Example: $P(A \cap B)$

### Conditional Probability
The probability of an event occurring given that another event has already occurred.
- **Formula**: $P(A|B) = \frac{P(A \cap B)}{P(B)}$

---

## 3. Key Probability Rules

### Addition Rule
- **For mutually exclusive events**: $P(A \cup B) = P(A) + P(B)$
- **For non-mutually exclusive events**: $P(A \cup B) = P(A) + P(B) - P(A \cap B)$

### Multiplication Rule
- **For independent events**: $P(A \cap B) = P(A) \times P(B)$
- **For dependent events**: $P(A \cap B) = P(A) \times P(B|A)$

---

## 4. Independence vs. Mutual Exclusivity

| Term | Meaning | Mathematical Condition |
| :--- | :--- | :--- |
| **Independent** | Occurrence of A does not affect B | $P(A|B) = P(A)$ |
| **Mutually Exclusive** | A and B cannot happen at the same time | $P(A \cap B) = 0$ |