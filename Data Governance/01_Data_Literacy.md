# Data Literacy

**Definition**: The ability to read, write, and communicate data in context, including an understanding of data sources, constructs, analytical methods, and applied techniques — and the ability to describe the use case, application, and resulting value. (Gartner)

---

## 1. Core Competencies Framework

### 1.1 Data Literacy Competency Model (Gartner)

| Competency Level | Description | Key Skills |
|------------------|-------------|------------|
| **Level 1: Data Awareness** | Understands data as strategic asset | Identifies data sources, recognizes data quality issues |
| **Level 2: Data Consumption** | Interprets and consumes data products | Reads dashboards, interprets visualizations, spots anomalies |
| **Level 3: Data Analysis** | Performs self-service analysis | SQL/Python, statistical thinking, hypothesis testing |
| **Level 4: Data Science** | Builds models, experiments | ML/ML, causal inference, experimental design |
| **Level 5: Data Leadership** | Drives data culture | Strategy, governance, ethics, organizational change |

---

## 2. Foundational Concepts

### 2.1 Data Types & Structures
```python
# Data type hierarchy
Data Types:
├── Structured (tabular, relational)
├── Semi-structured (JSON, XML, logs)
└── Unstructured (text, images, audio, video)

# Data structure taxonomy
Structured Data:
├── Cross-sectional (point in time)
├── Time series (temporal sequence)
├── Panel/Longitudinal (entities over time)
└── Network/Graph (relationships)
```

### 2.2 Data Quality Dimensions (DAMA-DMBOK)
```python
# DAMA International - 6 Primary Dimensions
Data Quality Dimensions:
1. Completeness     → Is all required data present?
2. Accuracy         → Does data reflect reality?
3. Consistency      → No contradictions within/between datasets
4. Timeliness       → Data available when needed
5. Validity         → Conforms to syntax/format/rules
6. Uniqueness       → No duplicate entities
```

**Assessment Framework (ISO 8000-61):**
```python
def assess_data_quality(df, dimensions=['completeness', 'accuracy', 'consistency', 'timeliness', 'validity', 'uniqueness']):
    results = {}
    for dim in dimensions:
        results[dim] = assess_dimension(df, dim)
    return DataQualityReport(results)
```

---

## 3. Statistical Literacy

### 3.1 Core Statistical Concepts
```python
# Central tendency & dispersion
Central Tendency:     mean, median, mode, trimmed_mean
Dispersion:           variance, std, IQR, MAD, range
Shape:                skewness, kurtosis, modality

# Inferential concepts
Sampling:             random, stratified, cluster, systematic
Estimation:           point estimates, confidence intervals, bootstrap
Hypothesis testing:   null/alt, p-values, power, effect size, CI
Multiple testing:     FWER, FDR, Bonferroni, Benjamini-Hochberg
```

### 3.2 Common Statistical Pitfalls
```markdown
| Pitfall | Description | Mitigation |
|---------|-------------|------------|
| p-hacking | Multiple testing without correction | Pre-register, Bonferroni/FDR |
| Base rate fallacy | Ignoring prior probability | Bayesian thinking, base rates |
| Simpson's paradox | Trend reverses when aggregated | Stratify, causal diagrams |
| Correlation ≠ causation | Confounding, reverse causality | Causal inference methods |
| Overfitting | Model fits noise | CV, regularization, holdout |
| Data leakage | Test info in training features | Temporal splits, pipeline hygiene |
```

---

## 4. Data Visualization Literacy

### 4.1 Chart Selection Guide
```python
# Visualization decision tree
Decision Tree:
├── What's the question?
│   ├── Compare values      → Bar chart, dot plot
│   ├── Show distribution   → Histogram, boxplot, violin, density
│   ├── Show relationship   → Scatter, hexbin, hexbin + regression
│   ├── Show composition    → Stacked bar, treemap, sunburst
│   ├── Show change over time → Line, area, horizon chart
│   ├── Show uncertainty    → Error bars, confidence bands, fan charts
│   └── Show geo-spatial    → Choropleth, cartogram, flow map
```

### 4.2 Common Visualization Pitfalls
```markdown
| Pitfall | Problem | Fix |
|---------|---------|-----|
| Truncated axes | Exaggerates differences | Start at zero (bar charts) |
| Dual axes | Misleading correlations | Separate panels, same scale |
| 3D charts | Distorts perception | Use 2D alternatives |
| Rainbow colormaps | Non-perceptual, colorblind issues | Viridis, cividis, colorbrewer |
| Pie charts | Hard to compare angles | Bar charts, treemaps |
| Too many categories | Cognitive overload | Aggregate, facet, search |
```

---

## 5. Critical Thinking with Data

### 5.1 Questions to Ask
```markdown
When presented with data/analysis, ask:

1. **Source & Provenance**
   - Where did this data come from?
   - How was it collected? By whom? When?
   - What's missing? (selection bias, non-response)

2. **Measurement & Definitions**
   - How are key variables defined? Operationalized?
   - Are proxies used? Validity threats?

3. **Analysis Choices**
   - Why this model/specification? Alternatives tested?
   - Sensitivity analyses? Robustness checks?
   - Outliers/influential points handled?

4. **Causal Claims**
   - Is causality claimed? Design support it?
   - Confounders addressed? (DAGs, backdoor criterion)
   - Sensitivity analysis (Rosenbaum bounds, E-values)

5. **Generalizability**
   - Population, setting, time generalizable?
   - Transportability? (transportability analysis)

5. **Ethical & Societal Impact**
   - Who benefits/harms? Disparate impact?
   - Privacy, consent, bias, fairness audited?
```
---

## 6. Building Data Culture (Organizational)

### 6.1 Maturity Model (TDWI / DAMA)
```markdown
| Level | Name | Characteristics |
|-------|------|-----------------|
| 1 | Unaware | No data strategy, ad-hoc, silos |
| 2 | Opportunistic | Some projects, no governance |
| 3 | Standards | Definitions, quality, metadata |
| 4 | Enterprise | Enterprise-wide, self-service, literate |
| 5 | Transformative | Data-driven culture, AI/ML at scale |
```

### 6.2 Key Roles
```python
Roles:
├── Chief Data Officer (CDO)          → Strategy, governance, culture
├── Data Stewards                     → Domain expertise, quality, definitions
├── Data Engineers                    → Pipelines, architecture, platforms
├── Analytics Engineers               → Modeling, dbt, semantic layer
├── Data Analysts / Scientists        → Insights, models, experiments
├── Data Citizens / Ambassadors       → Business users, champions
```

### 6.3 Data Literacy Program Framework
```markdown
Components of a Data Literacy Program:
1. **Assessment** → Baseline skills, gaps, personas
2. **Curriculum** → Role-based, tiered, applied
3. **Delivery** → Workshops, sandbox, office hours, community
4. **Certification** → Badges, levels, recognition
5. **Measurement** → Pre/post assessments, project impact
6. **Sustainability** → Champions, budget, leadership buy-in
```

---

## 📚 Key References & Citations

| # | Citation | Link |
|---|----------|------|
| 1 | Gartner. "Data Literacy: The Key to Digital Transformation." 2021. | [Link](https://www.gartner.com) |
| 2 | DAMA International. "DAMA-DMBOK2: Data Management Body of Knowledge." 2nd Ed. 2017. | [Link](https://dama.org) |
| 3 | ISO 8000. "Data Quality — Part 61: Data Quality Assessment." ISO, 2019. | [ISO](https://www.iso.org/standard/36326.html) |
| 4 | Kahneman, D. "Thinking, Fast and Slow." Farrar, Straus and Giroux, 2011. | [ISBN: 978-0374533557] |
| 5 | Gelman, A., & Hill, J. "Data Analysis Using Regression and Multilevel/Hierarchical Models." Cambridge, 2007. | [Link](http://www.stat.columbia.edu/~gelman/arm/) |
| 6 | Few, S. "Show Me the Numbers: Designing Tables and Graphs to Enlighten." 2nd Ed. Analytics Press, 2012. | [ISBN: 978-0970601917] |
| 7 | Cairo, A. "The Functional Art: An Introduction to Information Graphics and Visualization." New Riders, 2012. | [ISBN: 978-0321834737] |
| 8 | Waskom, M. et al. "seaborn: statistical data visualization." JOSS, 2021. | [DOI: 10.21105/joss.00308] |
| 9 | Healy, K. "Data Visualization: A Practical Introduction." Princeton, 2019. | [ISBN: 978-0691181622] |
| 10 | Wilke, C. "Fundamentals of Data Visualization." O'Reilly, 2019. | [Link](https://clauswilke.com/dataviz/) |

---

## 🔗 Cross-References

| Topic | Related Notes |
|-------|---------------|
| **Data Governance** | `Data Governance/02_Data_Governance.md` |
| **Data Management** | `Data Governance/03_Data_Management.md` |
| **Data Security** | `Data Governance/04_Data_Security.md` |
| **Data Sovereignty** | `Data Governance/05_Data_Sovereignty.md` |
| **Data Ownership** | `Data Governance/06_Data_Ownership.md` |
| **Visualization (Python)** | `Python Programming/Visualization/01_plotnine_Tutorial.md` |
| **Visualization (R)** | `R Programming/ggplot2/01_ggplot2_Tutorial.md` |
| **Statistical Tests** | `Python Programming/06_Statistical_Tests_Reference.md` |
| **Causal Inference** | `Data Governance/07_Causal_Inference.md` |

---

*Last updated: 2024-11-05*
*Part of: 9-1-1 Data Whisperer knowledge base*