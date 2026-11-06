# Privacy-Preserving Synthetic Data Generation

A comprehensive guide to generating synthetic data with formal privacy guarantees (Differential Privacy, PATE, etc.).

---

## 1. Differential Privacy (DP) Fundamentals

### 1.1 Differential Privacy Definition
```markdown
**Differential Privacy (DP)**: A randomized algorithm M satisfies (ε, δ)-DP if for all neighboring datasets D, D' (differing in one record) and all measurable subsets S of outputs:

Pr[M(D) ∈ S] ≤ e^ε · Pr[M(D') ∈ S] + δ

- ε (epsilon): Privacy budget (smaller = more private)
- δ: Probability of catastrophic failure (typically 10^-5 to 10^-6)
```

### 1.1 (ε, δ)-DP vs Pure DP
| Type | Definition | ε | δ |
|------|------------|-----|-----|
| **Pure DP** | δ = 0 | ε > 0 | 0 |
| **Approximate DP** | δ > 0 | ε > 0 | > 0 (typically 10^-5 to 10^-6) |
| **Concentrated DP** | Rényi DP | ρ | - |
| **Zero-Concentrated DP** | zCDP | ρ | - |

---

## 2. Differential Privacy Mechanisms

### 1. Gaussian Mechanism
```python
def gaussian_mechanism(value, sensitivity, epsilon, delta):
    """
    Add Gaussian noise for (ε, δ)-DP
    
    Args:
        value: true value
        sensitivity: L2 sensitivity of query
        epsilon: privacy budget
        delta: failure probability
    """
    sigma = sensitivity * np.sqrt(2 * np.log(1.25 / delta)) / epsilon
    noise = np.random.normal(0, sigma)
    return value + noise

# Example: Private mean
def private_mean(data, epsilon=1.0, delta=1e-5):
    sensitivity = 1.0  # L2 sensitivity of mean (assuming bounded [0,1])
    return np.mean(data) + gaussian_mechanism(0, 1.0/len(data), epsilon, delta)
```

### 2. Gaussian Mechanism (Vector)
```python
def gaussian_mechanism_vector(query_result, sensitivity, epsilon, delta):
    """Add Gaussian noise to vector query"""
    sigma = sensitivity * np.sqrt(2 * np.log(1.25 / delta)) / epsilon
    noise = np.random.normal(0, sigma, size=query_result.shape)
    return query_result + np.random.normal(0, sigma, size=query_result.shape)
```

### 2. Laplace Mechanism (Pure ε-DP)
```python
def laplace_mechanism(value, sensitivity, epsilon):
    """Laplace mechanism for pure ε-DP"""
    scale = sensitivity / epsilon
    noise = np.random.laplace(0, scale)
    return value + noise

# Count query
def private_count(data, epsilon):
    sensitivity = 1  # L1 sensitivity of count
    return len(data) + np.random.laplace(0, 1/epsilon)

# Histogram
def private_histogram(data, bins, epsilon):
    counts, edges = np.histogram(data, bins=bins)
    sensitivity = 1  # L1 sensitivity of histogram
    noise = np.random.laplace(0, 1/epsilon, len(bins))
    return counts + noise, edges
```

### 3. Exponential Mechanism
```python
def exponential_mechanism(quality_scores, epsilon, sensitivity=1):
    """Exponential mechanism for discrete choices"""
    # Quality scores for each outcome
    scores = np.array(quality_scores)
    probs = np.exp(epsilon * scores / (2 * sensitivity))
    probs = probs / probs.sum()
    return np.random.choice(len(scores), p=probs)

# Example: Private mode selection
def private_mode(values, epsilon):
    unique, counts = np.unique(values, return_counts=True)
    # Quality = count
    return exponential_mechanism(counts, epsilon)
```

---

## 2. DP-SGD (Differentially Private SGD)

### 1. DP-SGD Algorithm (Abadi et al., 2016)
```python
import torch
import torch.nn as nn
from opacus import PrivacyEngine

# Standard training with DP-SGD
model = YourModel()
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

# Privacy Engine (Opacus)
privacy_engine = PrivacyEngine()
model, optimizer, data_loader = privacy_engine.make_private(
    module=model,
    optimizer=optimizer,
    data_loader=train_loader,
    noise_multiplier=1.0,      # σ
    max_grad_norm=1.0,         # C (clipping norm)
    poisson_sampling=True,     # Poisson subsampling
)

# Training loop
for epoch in range(epochs):
    for data, target in data_loader:
        optimizer.zero_grad()
        output = model(data)
        loss = loss_fn(output, target)
        loss.backward()
        optimizer.step()
    
    # Get privacy spent
    epsilon = privacy_engine.get_epsilon(delta=1e-5)
    print(f"ε = {epsilon:.2f}")
```

### 2. Opacus Configuration
```python
from opacus import PrivacyEngine
from opacus.accountants import RDPAccountant

privacy_engine = PrivacyEngine(
    accountant="rdp",           # RDP accountant
    secure_mode=False           # True for production
)

model, optimizer, data_loader = privacy_engine.make_private(
    module=model,
    optimizer=optimizer,
    data_loader=train_loader,
    noise_multiplier=1.0,       # σ (noise multiplier)
    max_grad_norm=1.0,          # C (clipping threshold)
    poisson_sampling=True,      # Poisson subsampling
)

# With custom accountant
privacy_engine = PrivacyEngine(
    accountant="rdp",           # RDP accountant (tighter)
    secure_mode=False,
)

# Custom accountant
from opacus.accountants import GaussianAccountant
accountant = GaussianAccountant()
privacy_engine = PrivacyEngine(accountant=accountant)
```

### 3. DP-SGD with TensorFlow Privacy
```python
# TensorFlow Privacy
# pip install tensorflow-privacy
from tensorflow_privacy.privacy.optimizers import DPKerasSGDOptimizer

optimizer = DPKerasSGDOptimizer(
    l2_norm_clip=1.0,           # Gradient clipping
    noise_multiplier=1.1,       # σ
    num_microbatches=32,        # Microbatches
    learning_rate=0.01
)

model.compile(optimizer=optimizer, loss='categorical_crossentropy')
model.fit(x_train, y_train, epochs=10, batch_size=32)
```

### 4. TensorFlow Privacy - DP-SGD
```python
from tensorflow_privacy.privacy.optimizers import DPKerasSGDOptimizer

optimizer = DPKerasSGDOptimizer(
    l2_norm_clip=1.0,
    noise_multiplier=1.1,
    num_microbatches=32,
    learning_rate=0.01
)

model.compile(optimizer=optimizer, loss='categorical_crossentropy')
model.fit(x_train, y_train, epochs=10, batch_size=256)
```

---

## 3. PATE (Private Aggregation of Teacher Ensembles)

### 1. PATE Framework
```python
# PATE: Private Aggregation of Teacher Ensembles
# papaya: "Private Aggregation of Teacher Ensembles" (Papernot et al., 2018)

class PATE:
    def __init__(self, n_teachers, noise_scale, num_classes):
        self.n_teachers = n_teachers
        self.noise_scale = noise_scale
        self.num_classes = num_classes
        self.teachers = [self._train_teacher(i) for i in range(n_teachers)]
    
    def _train_teacher(self, i):
        # Train on disjoint data partition
        teacher_data = self.partition_data(i)
        return train_teacher(teacher_data)
    
    def predict(self, x):
        # Each teacher votes
        votes = np.array([t.predict(x) for t in self.teachers])
        
        # Aggregate with noise
        votes_count = np.bincount(votes, minlength=n_classes)
        noise = np.random.laplace(0, self.noise_scale, n_classes)
        noisy_votes = votes_count + noise
        
        return np.argmax(noisy_votes)

# Confident Aggregation (Confident PATE)
def confident_aggregate(votes, threshold=200):
    """Only answer if consensus is strong enough"""
    counts = np.bincount(votes, minlength=n_classes)
    max_votes = counts.max()
    if max_votes >= threshold:
        return np.argmax(votes)
    return None  # Abstain
```

### 2. Confident GNMax
```python
def confident_gnmax(votes, threshold, sigma):
    """Confident GNMax aggregator"""
    counts = np.bincount(votes, minlength=n_classes)
    max_votes = counts.max()
    
    if max_votes < threshold:
        return None  # Abstain
    
    # Add Gaussian noise
    noise = np.random.normal(0, sigma, n_classes)
    noisy_counts = counts + noise
    return np.argmax(noisy_counts)
```

---

## 3. Private Synthetic Data Generation

### 1. DP-GAN / DP-CTGAN
```python
# DP-CTGAN (Private CTGAN)
# pip install dp-synthetic

from dp_synthetic import DPCTGAN

model = DPCTGAN(
    epsilon=1.0,
    delta=1e-5,
    epochs=300,
    batch_size=500,
    generator_lr=2e-4,
    discriminator_lr=2e-4,
    pac=10  # PacGAN
)

model.fit(df, discrete_columns=cat_cols)
synthetic = model.sample(10000)
```

### 2. Private GAN (DP-GAN)
```python
# DP-GAN with DP-SGD
class DPGAN:
    def __init__(self, epsilon, delta, noise_multiplier, max_grad_norm):
        self.epsilon = epsilon
        self.delta = delta
        self.noise_multiplier = noise_multiplier
        self.max_grad_norm = max_grad_norm
    
    def train(self, real_data, epochs=100):
        # DP-SGD for discriminator
        # Generator trained on private discriminator
        pass
```

### 3. PATE-GAN
```python
# PATE-GAN: Generating Synthetic Data with Differential Privacy
# Combines PATE with GAN

class PATEGAN:
    def __init__(self, n_teachers=10, epsilon=1.0, delta=1e-5):
        self.n_teachers = n_teachers
        self.epsilon = epsilon
        self.delta = delta
        self.teachers = []
        self.generator = Generator()
        self.discriminator = Discriminator()
    
    def train(self, real_data, epochs=100):
        # Train teacher discriminators on partitions
        # Generator learns to fool private discriminator
        pass
```

---

## 2.2 Private Synthetic Data Libraries

### 1. DP-Synthetic (Open Source)
```bash
pip install dp-synthetic
```

```python
from dp_synthetic import DPSynthesizer

synth = DPSynthesizer(
    epsilon=1.0,
    delta=1e-5,
    model='ctgan',  # or 'dgan', 'pategan'
    epochs=100
)

model.fit(df, discrete_columns=cat_cols)
synthetic = model.sample(10000)
```

### 2. SmartNoise (OpenDP / SmartNoise)
```python
# pip install opendp
from opendp.mod import enable_features
enable_features("contrib")

from opendp.measurements import make_base_gaussian
from opendp.mod import enable_features

enable_features("floating-point", "contrib")

# DP Mean
from opendp.measurements import make_base_gaussian
from opendp.mod import enable_features
enable_features("floating-point")

meas = make_base_gaussian(
    scale=1.0,
    input_domain=atom_domain(T=float),
    input_metric=absolute_distance(T=float)
)

result = meas(100.0)  # Private mean
```

### 3. SmartNoise SDK (OpenDP)
```python
# pip install opendp
from opendp.mod import enable_features
enable_features('floating-point', 'contrib')

from opendp.measurements import make_base_gaussian
from opendp.trans import make_split_dataframe, make_select_column, make_impute_constant

# Private histogram
from opendp.measurements import make_base_gaussian
from opendp.trans import make_select_column, make_impute_constant

# Private histogram
meas = make_base_gaussian(
    scale=1.0,
    input_domain=atom_domain(T=float),
    input_metric=absolute_distance(T=float)
)
```

---

## 3. Privacy-Preserving Synthetic Data Libraries

### 1. SmartNoise SDK (OpenDP)
```python
# pip install opendp smartnoise-sdk
from opendp.mod import enable_features
enable_features("floating-point", "contrib")

from opendp.measurements import make_base_gaussian
from opendp.trans import make_split_dataframe, make_select_column, make_impute_constant

# Private histogram
from opendp.measurements import make_base_gaussian
from opendp.trans import make_select_column, make_impute_constant

meas = make_base_gaussian(
    scale=1.0,
    input_domain=atom_domain(T=float),
    input_metric=absolute_distance(T=float)
)

result = meas(data_column)
```

### 2. SmartNoise SQL
```python
# pip install smartnoise-sql
from snsql import Privacy, PrivacyLevel, SQLReader

privacy = Privacy(epsilon=1.0)
reader = SQLReader(postgres_url, privacy=privacy)

# Private SQL query
result = reader.execute("SELECT AVG(salary) FROM employees WHERE dept='IT'")
# Returns differentially private result
```

---

## 4. Evaluation of Private Synthetic Data

### 1. Privacy Auditing
```python
# Membership Inference Attack
def membership_inference_attack(model, train_data, test_data, synthetic):
    # Train attack model to distinguish train vs synthetic
    train_combined = np.vstack([train_data, synthetic])
    labels = np.hstack([np.ones(len(train)), np.zeros(len(synthetic))])
    
    attack_model = RandomForestClassifier()
    attack_model.fit(train_combined, labels)
    
    # Evaluate on test
    test_combined = np.vstack([test_data, synthetic])
    test_labels = np.hstack([np.ones(len(test)), np.zeros(len(synthetic))])
    
    pred = attack_model.predict_proba(test_combined)[:, 1]
    auc = roc_auc_score(test_labels, pred)
    return auc  # Should be ~0.5 for good privacy

# Attribute Inference Attack
def attribute_inference_attack(model, X, target_col, known_cols):
    # Can we predict sensitive attribute from other features?
    pass
```

### 2. Attribute Inference Attack
```python
def attribute_inference_attack(model, X, target_col, known_cols):
    # Train attack model to predict sensitive attribute
    X_known = X[known_cols]
    y = X[target_col]
    
    attack_model = RandomForestClassifier()
    attack_model.fit(X[known_cols], X[target_col])
    
    # Evaluate
    pred = attack_model.predict(X_test[known_cols])
    return accuracy_score(y_test, pred)
```

### 3. Privacy Metrics Dashboard
```python
def privacy_audit_report(real_data, synthetic_data, metadata):
    report = {}
    
    # Membership inference
    mia_auc = membership_inference_attack(
        real_train, synthetic, real_test
    )
    report['membership_inference_auc'] = mia_auc
    
    # Attribute inference
    for sensitive_col in sensitive_columns:
        attr_auc = attribute_inference_attack(
            real_data, synthetic_data, sensitive_col
        )
        report[f'attr_inf_{col}_auc'] = attr_auc
    
    # k-anonymity
    report['k_anonymity'] = check_k_anonymity(synthetic, quasi_identifiers, k=5)
    
    # l-diversity
    report['l_diversity'] = check_l_diversity(synthetic, quasi_ids, sensitive_col, l=3)
    
    return report
```

---

## 5. Advanced Topics

### 1. Synthetic Data with Formal Privacy (DP-SGD + GAN)
```python
# DP-CTGAN (DP-SGD + CTGAN)
class DPCTGAN:
    def __init__(self, epsilon=1.0, delta=1e-5, epochs=300):
        self.epsilon = epsilon
        self.delta = delta
        self.generator = Generator()
        self.discriminator = Discriminator()
        self.privacy_engine = PrivacyEngine()
    
    def train(self, data, discrete_columns):
        # Setup DP-SGD for discriminator
        self.discriminator = self.privacy_engine.make_private(
            module=self.discriminator,
            optimizer=disc_opt,
            data_loader=train_loader,
            noise_multiplier=1.0,
            max_grad_norm=1.0
        )
        
        # Generator trained on private discriminator
        for epoch in range(epochs):
            for batch in dataloader:
                # Train discriminator with DP-SGD
                # Train generator on private discriminator
                pass
```

### 2. PATE-GAN
```python
# PATE-GAN: PATE + GAN
class PATEGAN:
    def __init__(self, n_teachers=10, epsilon=1.0):
        self.n_teachers = n_teachers
        self.epsilon = epsilon
        self.teachers = [Discriminator() for _ in range(n_teachers)]
        self.generator = Generator()
        self.student = Discriminator()
    
    def train(self, real_data, epochs=100):
        for epoch in range(epochs):
            # Train teachers on partitions
            for i, teacher in enumerate(self.teachers):
                teacher.fit(partition[i])
            
            # Student learns from teacher ensemble (PATE)
            student_loss = self.pate_loss()
            
            # Generator learns from student
            gen_loss = self.generator_loss()
```

### 3. Private Synthetic Data with PyTorch
```python
import torch
import torch.nn as nn
from opacus import PrivacyEngine

class PrivateSynthesizer:
    def __init__(self, epsilon=1.0, delta=1e-5):
        self.epsilon = epsilon
        self.delta = delta
    
    def fit(self, X, y, epochs=100):
        # Model
        self.model = Generator(...)
        self.discriminator = Discriminator(...)
        
        # Privacy engine for discriminator
        self.privacy_engine = PrivacyEngine()
        self.discriminator, self.disc_opt, self.dataloader = \
            self.privacy_engine.make_private(
                module=self.discriminator,
                optimizer=disc_opt,
                data_loader=dataloader,
                noise_multiplier=1.0,
                max_grad_norm=1.0
            )
        
        # Training loop with DP
        for epoch in range(epochs):
            # Train discriminator with DP-SGD
            # Train generator on private discriminator
            pass
```

---

## 5. Advanced Topics

### 1. Federated Synthetic Data
```python
# Federated Synthetic Data Generation
# Each client trains local generator, server aggregates

class FederatedSynthesizer:
    def __init__(self, n_clients, epsilon=1.0):
        self.clients = [LocalSynthesizer() for _ in range(n_clients)]
        self.server = ServerSynthesizer()
        self.epsilon = epsilon
    
    def federated_round(self):
        # Local training
        local_models = [c.train(local_data) for c in self.clients]
        
        # Server aggregates (FedAvg + DP)
        global_model = self.server.aggregate(local_models, dp=True)
        
        # Distribute global model
        for c in self.clients:
            c.update(global_model)
```

### 2. Cross-Silo Synthetic Data
```python
# Cross-silo federated synthetic data
# Each silo (hospital, bank) generates local synthetic data
# Server aggregates synthetic datasets

class CrossSiloSynthesizer:
    def __init__(self, silos):
        self.silos = silos
    
    def generate(self):
        # Each silo generates local synthetic data
        local_synthetic = [s.generate() for s in self.silos]
        
        # Aggregate with privacy
        global_synthetic = private_aggregate(local_synthetic)
        return global_synthetic
```

---

## 6. Compliance & Regulations

### 1. GDPR Compliance
```markdown
### GDPR Compliance Checklist for Synthetic Data

**Article 25 - Data Protection by Design**
- [ ] Data minimization: Only generate necessary fields
- [ ] Purpose limitation: Clear purpose for synthesis
- [ ] Storage limitation: Retention policy for synthetic data

**Article 25 - Data Protection by Default**
- [ ] Default privacy settings
- [ ] Minimal data generation

### Article 25 - DPIA Required When:
- [ ] Large-scale processing of special categories
- [ ] Systematic monitoring
- [ ] Innovative technologies (AI/ML)

### Article 32 - Security of Processing
- [ ] Encryption of synthetic data at rest
- [ ] Access controls on synthetic data
- [ ] Regular security testing
```

### 2. HIPAA Compliance
```python
# HIPAA Safe Harbor (18 identifiers to remove)
HIPAA_IDENTIFIERS = [
    'names', 'geographic_subdivisions', 'dates', 'phone_numbers',
    'fax_numbers', 'email_addresses', 'ssn', 'medical_record_numbers',
    'health_plan_numbers', 'account_numbers', 'certificate_numbers',
    'vehicle_ids', 'device_ids', 'web_urls', 'ip_addresses',
    'biometric_ids', 'photos', 'any_unique_identifying_number'
]

# Safe Harbor method - remove all 18 identifiers
def hipaa_safe_harbor(df):
    return df.drop(columns=HIPAA_IDENTIFIERS, errors='ignore')

# Expert Determination (Alternative)
# Statistical expert certifies re-identification risk is very small
```

### 3. CCPA/CPRA Compliance
```python
# CCPA/CPRA Requirements
CCPA_REQUIREMENTS = {
    'right_to_know': 'Consumer can request data collected',
    'right_to_delete': 'Right to deletion',
    'right_to_opt_out': 'Opt-out of sale',
    'non_discrimination': 'No discrimination for exercising rights',
    'data_minimization': 'Collect only necessary',
    'purpose_limitation': 'Use only for disclosed purposes'
}
```

---

## 6. Best Practices Checklist

```markdown
## Privacy-Preserving Synthetic Data Checklist

### Pre-Generation
- [ ] Privacy requirements defined (ε, δ, δ-PDP, etc.)
- [ ] Threat model defined (adversary capabilities)
- [ ] Privacy budget allocated (ε, δ allocation)
- [ ] Sensitivity analysis performed

### Generation
- [ ] DP mechanism chosen (DP-SGD, PATE, Exponential, etc.)
- [ ] Privacy budget allocated across queries
- [ ] Sensitivity analysis performed
- [ ] Composition accounted for (basic, advanced, RDP)

### Validation
- [ ] Membership inference attack tested (AUC < 0.55)
- [ ] Attribute inference attack tested (AUC < 0.6)
- [ ] k-anonymity ≥ 5
- [ ] l-diversity ≥ 3
- [ ] t-closeness ≤ 0.2

### Deployment
- [ ] Privacy budget tracking
- [ ] Audit logging for all accesses
- [ ] Incident response plan for privacy breaches
- [ ] Regular privacy audits scheduled

---

*Last updated: 2024-11-05*
*Part of: Synthetic Data Knowledge Base*