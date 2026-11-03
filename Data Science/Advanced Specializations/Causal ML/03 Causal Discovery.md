# Causal Discovery

Causal discovery (structure learning) infers causal graphs from observational data. Unlike causal estimation (which assumes known structure), discovery learns the DAG structure.

## 1. Problem Setup

### Causal Graph
- **Nodes**: Variables $X_1, ..., X_p$
- **Edges**: Directed $X_i \to X_j$ (direct causal effect)
- **DAG**: Directed Acyclic Graph (no cycles)

### Structural Causal Model (SCM)
$$X_j = f_j(PA_j, U_j)$$
where $PA_j$ are parents of $X_j$, $U_j$ is exogenous noise.

### Markov Condition
$X_i \perp\!\!\!\perp \text{NonDescendants}(X_i) | \text{Parents}(X_i)$

### Faithfulness
All conditional independencies in distribution are entailed by the graph.

---

## 2. Constraint-Based Methods

### 2.1 PC Algorithm (Peter-Clark)
```python
# pc algorithm steps:
# 1. Start with complete undirected graph
# 2. Remove edges based on conditional independence tests
# 3. Orient edges using v-structures and orientation rules
```

```python
from causallearn.search.ConstraintBased.PC import pc
from causallearn.utils.cit import fisherz, chisq, gsq, kci

# For continuous data
cg = pc(data, alpha=0.05, indep_test=fisherz)

# For discrete data
cg = pc(data, alpha=0.05, indep_test=chisq)

# For mixed/nonlinear
cg = pc(data, alpha=0.05, indep_test=kci)  # Kernel-based
```

### 2.2 FCI (Fast Causal Inference)
Handles **latent confounders** and **selection bias**.
Outputs **PAG** (Partial Ancestral Graph) with edges:
- `o->` : definite cause
- `o-o` : uncertain
- `<->` : latent confounder

```python
from causallearn.search.ConstraintBased.FCI import fci

cg = fci(data, alpha=0.05, indep_test=fisherz)
```

### 2.3 Conditional Independence Tests

| Test | Data Type | Assumption |
|------|-----------|------------|
| **Fisher Z** | Continuous, Gaussian | Linear |
| **Chi-square** | Discrete | Multinomial |
| **G-square** | Discrete | Likelihood ratio |
| **KCI** | Continuous, nonlinear | Kernel (RKHS) |
| **RCIT/RCoT** | Continuous | Randomized conditional independence |

```python
# Custom CI test for non-Gaussian continuous
from causallearn.utils.cit import kci

# Kernel-based CI test (handles nonlinear)
p_value = kci(data[:, i], data[:, j], data[:, cond_set])
```

---

## 3. Score-Based Methods

### 3.1 GES (Greedy Equivalence Search)
```python
from causallearn.search.ScoreBased.GES import ges

# BIC score for continuous
ges = ges(data, score_func='local_score_BIC')

# Or use BDeu for discrete
ges = ges(data, score_func='local_score_BDeu')
```

### 3.2 NOTEARS (DAG Learning via Continuous Optimization)
**Key innovation**: DAG constraint as smooth function.

```python
# Optimization problem:
# min_W L(W; X) + λ||W||_1  s.t.  h(W) = 0
# h(W) = tr(e^{W∘W}) - d = 0  (DAG constraint)

# NOTEARS implementation
from notears import notears

W = notears(X, lambda1=0.1, loss_type='l2')

# For non-linear: NOTEARS-MLP
from notears import notears_mlp

W = notears_mlp(X, lambda1=0.1, hidden_dim=10)

# For time series: NOTEARS-TS
```

### 3.3 DAG-GNN / AVICI
```python
# Neural DAG learning
# DAG-GNN: variational autoencoder for DAG
# AVICI: amortized variational inference for causal inference

# py-causal-discovery
from causal_discovery import DAGGNN

model = DAGGNN(input_dim=d, hidden_dim=64)
model.fit(X)
W = model.get_adjacency_matrix()
```

---

## 4. Functional Causal Models (FCM)

### 4.1 Additive Noise Models (ANM)
$$Y = f(X) + N_Y, \quad N_Y \perp\!\!\!\perp X$$

Identifiable if $f$ is nonlinear and $N_Y$ non-Gaussian.

```python
from causallearn.search.FCMBased.ANM import anm

# Test X -> Y vs Y -> X
p_forward = anm(X, Y)
p_backward = anm(Y, X)

if p_forward < p_backward:
    print("X -> Y")
else:
    print("Y -> X")
```

### 4.2 LiNGAM (Linear Non-Gaussian Acyclic Model)
$$X = B X + E, \quad E \text{ non-Gaussian}$$

```python
from causallearn.search.FCMBased.LiNGAM import lingam

model = lingam.ICALiNGAM()
model.fit(X)

# Adjacency matrix
W = model.adjacency_matrix_
```

### 4.3 Post-Nonlinear (PNL)
$$Y = f_2(f_1(X) + N_1) + N_2$$

---

## 5. Causal Discovery with Interventions

### 5.1 Interventional Data
```python
# Combine observational + interventional data
# Interventional likelihood:
# P(X | do(X_S = x_S)) = ∏_{i ∉ S} P(X_i | PA_i)

# GIES (Greedy Interventional Equivalence Search)
from causallearn.search.ScoreBased.GIES import gies

gies = gies(data, intervention_targets=[[0], [1,2]], score_func='local_score_BIC')

# UT-IGSP (Union of Intervention Targets)
```

### 5.2 Active Learning / Experiment Design
```python
# Optimal experiment selection
# Maximize expected information gain
# Target edges with highest uncertainty

def select_intervention(graph, n_interventions=1):
    # Find edge with highest uncertainty
    # or maximal expected edge orientation
    pass
```

---

## 6. Causal Discovery in Time Series

### 6.1 Granger Causality (Linear)
```python
from statsmodels.tsa.stattools import grangercausalitytests

# Test if X Granger-causes Y
grangercausalitytests(data[['X', 'Y']], maxlag=4)
```

### 6.2 VAR-LiNGAM
```python
from lingam import VARLiNGAM

model = VARLiNGAM(lags=2)
model.fit(time_series_data)

# Adjacency matrices per lag
print(model.adjacency_matrices_)
```

### 6.3 PCMCI (PC Momentary Conditional Independence)
```python
from tigramite import PCMCI
from tigramite.independence_tests import ParCorr, GPDC, CMIknn

pcmci = PCMCI(dataframe, cond_ind_test=ParCorr())
results = pcmci.run_pcmci(tau_max=5, pc_alpha=0.05)
```

---

## 7. Causal Discovery Libraries

| Library | Language | Methods | Strengths |
|---------|----------|---------|-----------|
| **CausalLearn** | Python | PC, FCI, GES, LiNGAM, ANM, NOTEARS | Comprehensive |
| **CausalDiscovery Toolbox** | Python | PC, GES, CAM, NOTEARS, DAG-GNN | Easy API |
| **TIGRAMITE** | Python | PCMCI, PC, GPDC | Time series focus |
| **CD-NOD** | Python | NOTEARS, DAG-GNN, AVICI | Neural methods |
| **pcalg** | R | PC, FCI, GES, RFCI | Mature, well-tested |
| **bnlearn** | R | Score-based, Hybrid | Bayesian networks |
| **DoWhy** | Python | Causal discovery + estimation | End-to-end |

---

## 8. Evaluation Metrics

### Structural Hamming Distance (SHD)
```python
def shd(true_adj, pred_adj):
    """Number of edge additions/deletions/reversals to convert pred to true"""
    diff = true_adj != pred_adj
    # Count reversals as 1 (not 2)
    return np.sum(diff) - np.sum((true_adj == 1) & (pred_adj.T == 1))
```

### Precision / Recall / F1
```python
def edge_metrics(true_adj, pred_adj):
    # Directed edges
    true_edges = set(zip(*np.where(true_adj == 1)))
    pred_edges = set(zip(*np.where(pred_adj == 1)))
    
    tp = len(true_edges & pred_edges)
    fp = len(pred_edges - true_edges)
    fn = len(true_edges - pred_edges)
    
    precision = tp / (tp + fp) if tp + fp > 0 else 0
    recall = tp / (tp + fn) if tp + fn > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall > 0 else 0
    
    return precision, recall, f1
```

### Causal Effect Recovery
```python
# Compare estimated vs true causal effects
def effect_recovery(true_adj, pred_adj, true_effects, estimated_effects):
    # Correlation of estimated vs true ATE
    corr = np.corrcoef(true_effects, estimated_effects)[0, 1]
    return corr
```

---

## 9. Practical Pipeline

```python
def causal_discovery_pipeline(data, method='auto'):
    """
    Full causal discovery pipeline
    """
    from causallearn.utils.PCUtils.BackgroundKnowledge import BackgroundKnowledge
    
    # 1. Preprocessing
    # - Handle missing values
    # - Normalize continuous variables
    # - Encode categorical
    
    # 2. Choose method
    if method == 'pc':
        cg = pc(data, alpha=0.01, indep_test='fisherz')
    elif method == 'fci':
        cg = fci(data, alpha=0.01, indep_test='fisherz')
    elif method == 'ges':
        cg = ges(data, score_func='local_score_BIC')
    elif method == 'notears':
        W = notears(data, lambda1=0.1)
        return W
    elif method == 'lingam':
        model = lingam.ICALiNGAM()
        model.fit(data)
        return model.adjacency_matrix_
    
    # 3. Extract adjacency matrix
    adj = cg.G.graph
    
    # 4. Background knowledge (optional)
    # bk = BackgroundKnowledge()
    # bk.add_forbidden_edge(i, j)  # i cannot cause j
    # bk.add_required_edge(i, j)   # i must cause j
    
    # 5. Stability selection (bootstrap)
    stable_adj = bootstrap_stability(data, n_bootstrap=100, method=method)
    
    # 6. Output
    return {
        'adjacency': adj,
        'stable_adjacency': stable_adj,
        'method': method
    }

def bootstrap_stability(data, n_bootstrap=100, method='pc'):
    n, p = data.shape
    edge_counts = np.zeros((p, p))
    
    for _ in range(n_bootstrap):
        idx = np.random.choice(n, n, replace=True)
        sample = data[idx]
        
        if method == 'pc':
            cg = pc(sample, alpha=0.01, indep_test='fisherz')
            adj = cg.G.graph
        edge_counts += (adj == 1).astype(int)
    
    # Edge frequency
    stability = edge_counts / n_bootstrap
    return stability
```

---

## 10. Causal Discovery with Background Knowledge

```python
# Incorporate domain knowledge
bk = BackgroundKnowledge()

# Forbidden edges (known non-causes)
bk.add_forbidden_edge('age', 'gender')  # age doesn't cause gender
bk.add_forbidden_edge('outcome', 'treatment')  # no reverse causality

# Required edges (known causes)
bk.add_required_edge('smoking', 'lung_cancer')

# Temporal ordering (if known)
bk.add_temporal_order([['age', 'gender'], ['smoking'], ['lung_cancer']])

# Pass to PC/FCI/GES
cg = pc(data, alpha=0.01, background_knowledge=bk)
```

---

## 11. Challenges & Limitations

| Challenge | Description | Mitigation |
|-----------|-------------|------------|
| **Markov Equivalence** | Multiple DAGs encode same independencies | Use interventional data, background knowledge |
| **Latent Confounders** | Unmeasured variables create spurious edges | FCI, latent variable models |
| **Selection Bias** | Conditioning on colliders | FCI, selection diagrams |
| **Non-linear/Non-Gaussian** | Linear tests miss edges | KCI, NOTEARS-MLP, GNNs |
| **High-dimensional** | p >> n | Sparse regularization, variable screening |
| **Time series** | Feedback loops, lagged effects | PCMCI, VAR-LiNGAM, tsNOTEARS |
| **Measurement Error** | Attenuates dependencies | Latent variable models |

---

## 12. Key Takeaways

1. **Constraint-based** (PC, FCI): Use CI tests, handle latent confounders (FCI)
2. **Score-based** (GES, NOTEARS): Optimize score function, scalable
3. **Functional models** (LiNGAM, ANM): Identify direction from distributional asymmetry
4. **Interventional data** breaks Markov equivalence
5. **Time series**: PCMCI, VAR-LiNGAM, Granger (linear only)
6. **Evaluation**: SHD, F1, but prefer causal effect recovery
7. **Background knowledge** dramatically improves accuracy
8. **No free lunch**: No method universally best; use ensemble