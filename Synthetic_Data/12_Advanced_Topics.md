# Advanced Topics in Synthetic Data Generation

Cutting-edge techniques, emerging research, and future directions in synthetic data generation.

---

## 1. Diffusion Models for Structured Data

### 1.1 Tabular Diffusion Models
```python
# TabDDPM / TabDiff / TabDiffusion
# Diffusion models applied to tabular data

# TabDDPM (Diffusion for Tabular Data)
# pip install tabddpm
from tabddpm import TabDDPM

model = TabDDPM(
    num_numerical=n_num,
    num_categories=cat_cards,
    num_classes=n_classes,
    num_timesteps=1000,
    hidden_dim=256,
    num_layers=4
)

model.fit(X_train, y_train)
synthetic = model.sample(n_samples=10000)
```

### 1.2 Diffusion for Tabular (TabDDPM / TabDiff)
```python
# TabDDPM: Denoising Diffusion Probabilistic Models for Tabular Data
# arXiv:2210.07564

from tabddpm import TabDDPM

model = TabDDPM(
    num_numerical=n_num,
    num_categories=cat_cards,
    num_classes=n_classes,
    num_timesteps=1000,
    hidden_dim=256,
    num_layers=4,
    dropout=0.1
)

model.fit(X_train, y_train, epochs=500, batch_size=512)
synthetic = model.sample(n_samples=10000)
```

### 2. Diffusion for Tabular (TabDiff)
```python
# TabDiff: Diffusion Models for Tabular Data
# arXiv:2301.01305

from tabdiff import TabDiff

model = TabDiff(
    num_numerical=n_num,
    categories=cat_cards,
    num_timesteps=1000,
    hidden_dim=256,
    num_layers=4,
    dropout=0.1
)

model.fit(X_train, epochs=500)
synthetic = model.sample(n_samples=10000)
```

### 2. Diffusion for Mixed-Type Data
```python
# Mixed-type diffusion (continuous + categorical)
from diffusers import DDPMPipeline
from diffusers.schedulers import DDPMScheduler

# Continuous + Categorical diffusion
class TabularDiffusion:
    def __init__(self, num_numerical, categories):
        self.num_numerical = n_num
        self.num_categories = cat_cards
        
        # Continuous diffusion
        self.num_diffusion = GaussianDiffusion(
            model=MLP(num_features),
            seq_length=n_num,
            timesteps=1000,
            loss_type='l2'
        )
        
        # Categorical diffusion (multinomial diffusion)
        self.cat_diffusion = MultinomialDiffusion(
            num_categories=cat_cards,
            timesteps=1000
        )
    
    def forward(self, x_num, x_cat, t):
        # Joint diffusion
        x_num_noisy = self.num_diffusion.q_sample(x_num, t)
        x_cat_noisy = self.cat_diffusion.q_sample(x_cat, t)
        return x_num_noisy, x_cat_noisy
```

---

## 2. Flow Matching & Rectified Flow

### 1. Flow Matching (Lipman et al., 2022)
```python
# Flow Matching for Synthetic Data
# arXiv:2210.02747

class FlowMatchingSynthesizer:
    """
    Flow Matching: Learn vector field v_t(x) that transports
    prior p_0 (noise) to target p_1 (data) via ODE:
    dx/dt = v_t(x), x(0) ~ N(0,I), x(1) ~ p_data
    """
    
    def __init__(self, dim, hidden_dim=256, num_layers=4):
        self.vector_field = MLP(
            input_dim=dim + 1,  # x + t
            hidden_dim=512,
            output_dim=dim,
            num_layers=4
        )
        self.ode_solver = 'dopri5'  # or 'rk4', 'euler'
    
    def train(self, data, epochs=1000):
        for epoch in range(epochs):
            x1 = batch  # Real data
            x0 = torch.randn_like(batch)  # Noise
            t = torch.rand(batch_size)  # Time ~ U[0,1]
            
            # Conditional flow: x_t = (1-t)*x0 + t*x1
            x_t = (1-t)*x0 + t*x1
            v_t = x1 - x0  # True velocity
            
            # Predict velocity
            v_pred = self.v_field(torch.cat([x_t, t], dim=-1))
            loss = F.mse_loss(v_pred, v_t)
            
        self.optimizer.step()

    def sample(self, n_samples, n_steps=100):
        x = torch.randn(n, dim)
        dt = 1.0 / n_steps
        for i in range(n_steps):
            t = i / n_steps
            v = self.v_field(x, t)
            x = x + v * dt
        return x
```

### 2. Rectified Flow (Liu et al., 2022)
```python
# Rectified Flow: Straightening the ODE trajectories
# arXiv:2209.12568

class RectifiedFlow:
    """
    Rectified Flow: Straighten the probability flow ODE
    for faster sampling (1-4 steps vs 1000+ for DDPM)
    """
    
    def __init__(self, model, n_steps=10):
        self.model = model  # Velocity predictor v_t(x)
        self.n_steps = n_steps
    
    def sample(self, n_samples):
        x = torch.randn(n_samples, dim)
        dt = 1.0 / self.n_steps
        
        for i in range(self.n_steps):
            t = i / self.n_steps
            v = self.model(x, t)
            x = x + dt * v
        
        return x
    
    def train(self, data, epochs=1000):
        # Rectification: re-train to straighten paths
        for epoch in range(epochs):
            x0 = torch.randn_like(batch)
            x1 = batch
            t = torch.rand(batch_size)
            x_t = (1-t)*x0 + t*x1
            v_true = x1 - x0
            v_pred = model(x_t, t)
            loss = F.mse_loss(v_pred, v_true)

# Rectified Flow benefits:
# - 1-4 sampling steps vs 1000+ for DDPM
# - Straight trajectories = easier to learn
# - Deterministic sampling
```

### 3. OT-CFM (Optimal Transport Conditional Flow Matching)
```python
# OT-CFM: Optimal Transport Conditional Flow Matching
# arXiv:2302.00684

class OTCFM:
    """
    OT-CFM: Uses optimal transport coupling for better coupling
    between source and target distributions
    """
    
    def __init__(self, sigma=0.1):
        self.sigma = sigma  # Noise for OT coupling
    
    def train_step(self, x0, x1):
        # Sample from OT coupling
        t = torch.rand(batch_size)
        x0, x1 = ot_coupling(x0, x1)  # OT coupling
        
        xt = (1-t)*x0 + t*x1 + self.sigma * torch.randn_like(x0) * torch.sqrt(t*(1-t))
        v_target = x1 - x0
        
        v_pred = self.v_field(xt, t)
        loss = F.mse_loss(v_pred, v_target)
        
        return loss
```

---

## 2. Causal Synthetic Data

### 1. Causal Synthetic Data
```python
# Causal Synthetic Data Generation
# Preserve causal relationships in synthetic data

from causalml.inference.tree import UpliftTreeClassifier
from causalml.inference.meta import BaseXRegressor, BaseRClassifier

# Causal structure preservation
class CausalSynthesizer:
    def __init__(self, causal_graph):
        self.causal_graph = causal_graph  # DAG
        self.causal_model = self.learn_causal_model()
    
    def generate(self, n_samples, interventions=None):
        """
        Generate data respecting causal structure
        interventions: dict {var: value} for do-interventions
        """
        # Sample from causal model
        # Respect causal mechanisms
        # Handle interventions via do-calculus
        pass

# Causal discovery + generation
from causalml.inference.meta import BaseXRegressor
from causalml.dataset import make_uplift_classification

# Causal discovery + synthesis
from cdt.causality.graph import PC, GES, GIES
from causalnex.structure import StructureModel

# Learn structure
sm = StructureModel()
sm.fit(df)
dag = sm.get_dag()

# Generate respecting causal structure
synthetic = generate_from_dag(dag, n_samples=10000)
```

### 2. Causal Fairness in Synthetic Data
```python
# Fair Synthetic Data Generation
# Ensure synthetic data satisfies fairness constraints

from aif360.datasets import BinaryLabelDataset
from aif360.algorithms.preprocessing import Reweighing, DisparateImpactRemover

def fair_synthetic_generation(df, sensitive_attr, target, epsilon=0.01):
    """
    Generate synthetic data satisfying fairness constraints:
    - Demographic parity
    - Equalized odds
    - Equal opportunity
    """
    # 1. Learn fair representation
    from aif360.algorithms.preprocessing import DisparateImpactRemover
    
    di = DisparateImpactRemover(repair_level=1.0)
    df_fair = di.fit_transform(df)
    
    # Generate synthetic from fair representation
    synthetic = synthesize(df_fair)
    
    # Verify fairness
    from aif360.metrics import BinaryLabelDatasetMetric
    metric = BinaryLabelDatasetMetric(synth_df, 
        privileged_groups=[{'sex': 1}], unprivileged_groups=[{'sex': 0}])
    
    return {
        'statistical_parity': metric.statistical_parity_difference(),
        'equal_opportunity': metric.equal_opportunity_difference(),
        'average_odds': metric.average_odds_difference()
    }
```

---

## 2. Foundation Models for Synthetic Data

### 1. Foundation Models for Tabular Data
```python
# Tabular Foundation Models
# TabPFN, TabPFN v2, TabPFN-Gen

# TabPFN: Tabular Prior-Fitted Networks
# pip install tabpfn
from tabpfn import TabPFNClassifier, TabPFNRegressor

# TabPFN: In-context learning for tabular data
clf = TabPFNClassifier(device='cuda')
clf.fit(X_train, y_train)
preds = clf.predict_proba(X_test)

# TabPFN for synthetic generation (via conditional sampling)
# Use as feature extractor + conditional generation
```

### 2. Large Language Models for Tabular Data
```python
# LLMs for tabular synthesis (GReaT, REaLTabFormer, CLAM)
# GReaT: Generation of Realistic Tabular data
# pip install great

from great import GReaT

model = GReaT(
    model_name="gpt2",
    epochs=100,
    batch_size=32,
    logging_steps=10
)

# Fine-tune on tabular data
trainer = Trainer(
    model=model,
    args=TrainingArguments(
        output_dir="./great-model",
        num_train_epochs=100,
        per_device_train_batch_size=16,
        warmup_steps=500,
        weight_decay=0.01
    )
)
trainer.train()

# Generate
synthetic = great.generate(n=10000)
```

### 2. REaLTabFormer
```python
# REaLTabFormer: Relational Table Transformer
# pip install realtabformer

from realtabformer import REaLTabFormer

model = REaLTabFormer(
    max_sequence_length=512,
    sample_len=10000,
    epochs=50
)

model.fit(df)
synthetic = model.sample(n=10000)
```

### 3. CLAM (Conditional Latent Action Model)
```python
# CLAM: Conditional Latent Action Model
# For sequential/relational data
from clam import CLAM

model = CLAM(
    max_seq_len=100,
    hidden_dim=256,
    num_layers=4
)
model.fit(sequences)
synthetic = model.sample(n=1000)
```

---

## 2. Diffusion Models for Structured Data

### 1. Diffusion for Tabular (TabDDPM, TabDiff)
```python
# TabDDPM: Denoising Diffusion for Tabular Data
# arXiv:2210.07564

from tabddpm import TabDDPM

model = TabDDPM(
    num_numerical=n_num,
    num_categories=cat_cards,
    num_classes=n_classes,
    num_timesteps=1000,
    hidden_dim=256,
    num_layers=4,
    dropout=0.1
)

model.fit(X_train, y_train, epochs=500, batch_size=512)
synthetic = model.sample(n_samples=10000)

# TabDiff (improved)
# arXiv:2301.01305
from tabdiff import TabDiff

model = TabDiff(
    num_numerical=n_num,
    categories=cat_cards,
    num_timesteps=1000,
    hidden_dim=256,
    num_layers=4
)
```

### 2. Diffusion for Mixed-Type Data
```python
# Mixed-type diffusion (continuous + categorical)
class MixedDiffusion:
    def __init__(self, num_numerical, categories):
        self.num_numerical = num_numerical
        self.categories = categories
        
        # Continuous diffusion
        self.num_diffusion = GaussianDiffusion(
            model=MLP(num_features),
            seq_length=num_numerical,
            timesteps=1000,
            loss_type='l2'
        )
        
        # Categorical diffusion (multinomial diffusion)
        self.cat_diffusion = MultinomialDiffusion(
            num_categories=categories,
            timesteps=1000
        )
    
    def forward(self, x_num, x_cat, t):
        x_num_noisy = self.num_diffusion.q_sample(x_num, t)
        x_cat_noisy = self.cat_diffusion.q_sample(x_cat, t)
        return x_num_noisy, x_cat_noisy
```

---

## 2. Retrieval-Augmented Generation (RAG) for Synthetic Data

### 1. RAG for Synthetic Data Generation
```python
# RAG-Enhanced Synthetic Data Generation
class RAGSynthesizer:
    def __init__(self, knowledge_base, llm, retriever):
        self.knowledge_base = knowledge_base
        self.llm = llm
        self.retriever = retriever
    
    def generate(self, context, n_samples):
        # 1. Retrieve relevant examples from knowledge base
        docs = self.retriever.retrieve(context, top_k=10)
        
        # 2. Construct prompt with retrieved examples
        prompt = self.build_prompt(context, retrieved_docs, n_samples)
        
        # 3. Generate with LLM
        synthetic = self.llm.generate(prompt, n_samples=n_samples)
        
        # 4. Validate & filter
        validated = self.validate(synthetic)
        return validated

# RAG for Tabular Data
class RAGTabularSynthesizer:
    def __init__(self, reference_data, llm):
        self.kb = self.build_knowledge_base(reference_data)
        self.llm = llm
    
    def generate(self, context, n_samples):
        # Retrieve similar records
        similar = self.kb.search(context, top_k=20)
        
        # Generate with context
        prompt = self.build_prompt(context, similar_records)
        return self.llm.generate(prompt, n_samples=n_samples)
```

---

## 3. Federated Synthetic Data

### 1. Federated Synthetic Data Generation
```python
# Federated Synthetic Data Generation
# Each client trains local generator, server aggregates

class FederatedSynthesizer:
    def __init__(self, n_clients, epsilon=1.0):
        self.clients = [LocalSynthesizer() for _ in range(n_clients)]
        self.server = ServerSynthesizer()
        self.epsilon = epsilon
    
    def federated_round(self):
        # 1. Local training
        local_models = [c.train(local_data) for c in self.clients]
        
        # 2. Server aggregates (FedAvg + DP)
        global_model = self.server.aggregate(local_models, dp=True)
        
        # 3. Distribute global model
        for c in self.clients:
            c.update(global_model)
        
        # 4. Local generation
        synthetic = [c.generate() for c in self.clients]
        return self.aggregate(synthetic)

# Cross-silo (enterprise) federated synthesis
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

## 3. Generative AI for Synthetic Data

### 1. LLM-Based Synthetic Data
```python
# LLM-Based Synthetic Data Generation
class LLMSynthesizer:
    def __init__(self, model_name="gpt-4", api_key=None):
        self.llm = OpenAI(model=model_name, api_key=api_key)
    
    def generate(self, schema, n_samples, context=""):
        prompt = f"""
        Generate {n_samples} synthetic records matching this schema:
        {json.dumps(schema, indent=2)}
        
        Context: {context}
        Constraints: {constraints}
        
        Output as valid JSON array.
        """
        
        response = self.llm.complete(prompt)
        return self.parse_json(response)

# Structured output with instructor
import instructor
from pydantic import BaseModel

client = instructor.patch(OpenAI())

class CustomerRecord(BaseModel):
    customer_id: str
    age: int = Field(ge=18, le=100)
    income: float = Field(ge=0)
    category: str

records = []
for _ in range(1000):
    record = client.chat.completions.create(
        model="gpt-4",
        response_model=CustomerRecord,
        messages=[{"role": "user", "content": "Generate a realistic customer record"}]
    )
    records.append(record)
```

### 2. Instructor for Structured Output
```python
# pip install instructor
import instructor
from pydantic import BaseModel, Field

client = instructor.patch(OpenAI())

class PatientRecord(BaseModel):
    patient_id: str
    age: int = Field(ge=0, le=120)
    diagnosis: str = Field(description="ICD-10 code")
    medications: List[str]
    lab_results: dict

# Generate with validation
records = []
for _ in range(1000):
    record = client.chat.completions.create(
        model="gpt-4",
        response_model=PatientRecord,
        messages=[{
            "role": "user",
            "content": "Generate a realistic patient record for a diabetes study."
        }]
    )
    records.append(record)
```

### 3. RAG for Synthetic Data
```python
# RAG-Enhanced Synthetic Data Generation
class RAGSynthesizer:
    def __init__(self, knowledge_base, llm, retriever):
        self.kb = knowledge_base
        self.llm = llm
        self.retriever = retriever
    
    def generate(self, context, n_samples):
        # 1. Retrieve relevant examples
        docs = self.retriever.retrieve(context, top_k=10)
        
        # 2. Build prompt with retrieved examples
        prompt = self.build_prompt(context, docs, n_samples)
        
        # 3. Generate with LLM
        synthetic = self.llm.generate(prompt, n_samples)
        
        # 4. Validate
        validated = self.validate(synthetic)
        return validated
```

---

## 5. Frontier Research Areas

### 1. Consistency Models (Consistency Models, 2023)
```python
# Consistency Models: Fast one-step generation
# arXiv:2303.01469

class ConsistencyModel:
    """
    Consistency Models: Fast one-step generation
    Distillation of diffusion models
    """
    
    def __init__(self, model, sigma_min=0.002, sigma_max=80.0):
        self.model = model
        self.sigma_min = sigma_min
        self.sigma_max = sigma_max
    
    def sample(self, x, steps=1):
        # One-step generation (or few steps)
        t = torch.ones(x.shape[0]) * self.sigma_max
        x = x + self.model(x, t) * (self.sigma_min - t)
        return x

# Consistency Trajectory Models (CTM)
# arXiv:2310.05542
```

### 2. Consistency Trajectory Models (CTM)
```python
# Consistency Trajectory Models
# arXiv:2310.05542

class CTM:
    """
    Consistency Trajectory Models: 
    Learn the entire ODE trajectory in one step
    """
    pass
```

### 3. Score-Based Generative Models (SDE)
```python
# Score-based Generative Modeling (Song et al., 2021)
# arXiv:2011.13456

class ScoreSDE:
    """
    Score-based Generative Modeling through SDEs
    dx = f(x,t)dt + g(t)dw
    Score: ∇_x log p_t(x)
    """
    
    def __init__(self, score_model, sde='VESDE'):
        self.score_model = score_model
        self.sde = sde
    
    def sample(self, n_samples):
        # Reverse SDE sampling
        x = torch.randn(n_samples, dim)
        for t in reversed(timesteps):
            score = self.score_model(x, t)
            x = self.sde.reverse_step(x, score, t)
        return x
```

---

## 5. Evaluation Frontiers

### 1. Next-Gen Evaluation
```python
# Next-Gen Evaluation Metrics
class NextGenEvaluation:
    """
    Beyond traditional metrics
    """
    
    def semantic_fidelity(self, real, synth):
        """Semantic fidelity using LLM judge"""
        pass
    
    def causal_fidelity(self, real, synth):
        """Preserve causal relationships"""
        pass
    
    def temporal_fidelity(self, real, synth):
        """For time series: preserve temporal dynamics"""
        pass
    
    def adversarial_robustness(self, model, real, synth):
        """Robustness to adversarial examples"""
        pass

# LLM-as-Judge for synthetic data
def llm_as_judge(real_sample, synth_sample):
    prompt = f"""Compare these two records for similarity:
    Real: {real}
    Synthetic: {synth}
    Rate similarity 1-10.
    """
    return llm_judge(prompt)
```

### 2. LLM-as-a-Judge for Synthetic Data
```python
def llm_as_judge(real_samples, synth_samples, criteria):
    """Use LLM as judge for synthetic data quality"""
    judge_prompt = f"""
    Evaluate the synthetic data quality:
    Real: {real_samples}
    Synthetic: {synth_samples}
    
    Rate on: {criteria}
    Score 1-10 each.
    """
    return llm_judge(prompt)
```

---

## 5. Emerging Paradigms

### 1. Text-to-Data (Text2Data)
```python
# Natural Language to Synthetic Data
class Text2Data:
    """Generate data from natural language description"""
    
    def generate(self, description: str, n_samples: int):
        """
        "Generate 1000 customer records for an e-commerce platform 
        with fields: user_id, age, gender, purchase_history, 
        where 20% are high-value customers"
        """
        pass
```

### 2. Data-Centric AI
```python
# Data-centric AI: Improve data, not model
class DataCentricAI:
    def improve_data(self, model_performance, data):
        """Iteratively improve data quality to boost model"""
        while not target_performance:
            # Identify weak spots
            weak_spots = self.analyze_weaknesses(model, data)
            
            # Generate synthetic data to fill gaps
            synthetic = self.generate_for_weakness(weak_spots)
            
            # Retrain
            model = retrain(real + synthetic)
            
            if performance_target_met:
                break
```

### 3. Synthetic Data for Foundation Models
```python
# Synthetic pretraining data for LLMs
class SyntheticPretrainingData:
    """
    Generate synthetic pretraining data for LLMs
    - Deduplication
    - Quality filtering
    - Diversity promotion
    - Toxicity removal
    """
    
    def curate_pretraining_data(self, raw_corpus):
        # Quality filtering
        filtered = self.quality_filter(raw_corpus)
        
        # Deduplication
        deduped = self.deduplicate(filtered)
        
        # Quality filtering
        quality = self.quality_filter(deduped)
        
        # Domain balancing
        balanced = self.balance_domains(quality)
        
        return balanced
```

---

## 6. Industry-Specific Frontiers

### 1. Healthcare / Clinical
```python
# Synthetic EHR
class ClinicalSynthesizer:
    """Synthetic EHR respecting clinical constraints"""
    
    def generate_patient_journey(self, n_patients):
        """Generate realistic patient journeys with:
        - Temporal consistency
        - Clinical logic (diagnosis → treatment → outcome)
        - Comorbidity patterns
        - Medication adherence
        - Lab value trajectories
        """
        pass
    
    def synthetic_trial(self, protocol, n_patients):
        """Generate synthetic clinical trial data"""
        pass

# Synthetic clinical trials
class SyntheticClinicalTrial:
    def simulate_trial(self, protocol, n_arms, n_per_arm):
        """Generate synthetic clinical trial data"""
        pass
```

### 2. Financial Services
```python
class FinancialSynthesizer:
    """Synthetic financial data with regulatory compliance"""
    
    def generate_transaction_network(self, n_entities, n_transactions):
        """Generate realistic transaction networks with:
        - Money laundering patterns
        - Fraud rings
        - Normal business transactions
        """
        pass
    
    def stress_test_portfolio(self, portfolio, scenarios):
        """Generate stress scenarios for risk modeling"""
        pass
```

### 3. Autonomous Vehicles / Robotics
```python
# Sensor data synthesis
class SensorDataSynthesizer:
    def generate_lidar(self, scenario, n_frames):
        """Generate synthetic LiDAR point clouds"""
        pass
    
    def generate_camera(self, scenario, n_frames):
        """Generate synthetic camera footage"""
        pass
    
    def generate_scenarios(self, scenario_config):
        """Generate diverse driving scenarios"""
        pass
```

---

## 8. Resources & Next Steps

### Key Repositories to Watch
| Repo | Stars | Description |
|------|-------|-------------|
| sdv | 4k+ | Synthetic Data Vault |
| synthcity | 1k+ | Benchmarking framework |
| ydata-synthetic | 500+ | GAN-based tabular |
| gretel-synthetics | 1k+ | Privacy-preserving |
| mostlyai | - | Enterprise platform |
| synthcity | 1k+ | Benchmarking framework |
| gretel-synthetics | 1k+ | Privacy-preserving |

### Papers to Watch (2024)
| Paper | Venue | Topic |
|-------|-------|-------|
| "TabDDPM" | ICML 2023 | Diffusion for tabular |
| "Rectified Flow" | ICML 2023 | Fast flow matching |
| "Consistency Models" | ICML 2023 | Fast sampling |
| "Rectified Flow" | ICLR 2023 | Straightening flows |
| "Flow Matching" | ICML 2022 | Simulation-free training |
| "TabPFN" | ICML 2024 | Prior-fitted networks |
| "REaLTabFormer" | ICML 2024 | Relational transformers |
| "GReaT" | NeurIPS 2023 | LLM for tabular |

### Key Conferences
| Conference | Focus |
|----------|-------|
| ICML / NeurIPS / ICLR | Core ML |
| AISTATS | Statistics/ML |
| KDD / SIGMOD | Data systems |
| VLDB / ICDE | Databases |
| AAAI / IJCAI | AI general |
| PrivEnhance / PETS | Privacy |

---

## 🎯 Your Next Steps

1. **Start Simple**: `pip install sdv faker` → run basic examples
2. **Pick Your Domain**: Tabular → SDV/Synthcity | Time Series → NeuralForecast | Text → LLM/Gretel | Images → Diffusers
3. **Add Privacy** → Opacus (DP-SGD), Gretel (DP), SmartNoise
4. **Evaluate** → SDV evaluation, Synthcity benchmarks, Evidently
5. **Deploy** → MLflow, BentoML, vLLM, Triton, FastAPI
6. **Monitor** → Evidently, WhyLabs, MLflow
7. **Scale** → Ray, Dask, Spark, Kubernetes

---

*Last updated: 2024-11-05*
*Part of: Synthetic Data Knowledge Base*