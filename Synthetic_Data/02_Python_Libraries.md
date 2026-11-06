# Python Libraries for Synthetic Data Generation

A comprehensive reference for Python libraries, tools, and platforms for synthetic data generation.

---

## 1. Library Landscape Overview

```
Synthetic Data Python Ecosystem
├── Tabular
│   ├── SDV (MIT)           │  General purpose, mature
│   ├── Synthcity           │  │  Many models, benchmarks
│   ├── ydata-synthetic     │  │  GAN-based, good for tabular
│   ├── MOSTLY AI (comm.)   │  │  Commercial, high quality
│   ├── Gretel (comm.)      │  │  Privacy-focused, APIs
│   ├── Hazy (comm.)        │  │  Enterprise, referential integrity
│   └── Syntheticus         │  │  Open source, tabular focus
│
├── Text/NLP
│   ├── Faker               │  Simple fake data
│   ├── LangChain + LLMs    │  Contextual, conditional
│   ├── Gretel (LLM)        │  Privacy-preserving text
│   └── Synthetic-text      │  Specialized libraries
│
├── Time Series
│   ├── NeuralForecast (Nixtla)
│   ├── NeuralProphet
│   ├── StatsForecast
│   ├── GluonTS
│   ├── Sktime
│   └── GluonTS / GluonTS-MXNet
│
├── Images/Video
│   ├── Stable Diffusion
│   ├── ControlNet
│   ├── Diffusers (HF)
│   ├── Stable Video Diffusion
│   └── AnimateDiff
│
├── Text/NLP
│   ├── Faker (simple)
│   ├── LangChain + LLMs
│   ├── Gretel Synthetics
│   └── LLMs (LLaMA, GPT, etc.)
│
├── Time Series (Specialized)
│   ├── NeuralForecast
│   ├── NeuralProphet
│   ├── GluonTS
│   ├── StatsForecast
│   └── sktime
│
├── Privacy-Preserving
│   ├── DP-SGD (Opacus)
│   ├── PATE
│   ├── Private Synthetic Data (DP-SGD + GAN)
│   ├── Opacus / Opacus-TensorFlow
│   ├── TensorFlow Privacy
│   └── PyTorch DP (DP-SGD)
│
└── Evaluation
    ├── SDV Evaluation
    ├── Synthcity Metrics
    ├── Synthetic Data Quality (SDQ)
    └── Custom metrics (utility, privacy, fidelity)
```

---

## 1. Core Libraries Quick Reference

| Library | Category | License | Best For | Maturity |
|---------|----------|---------|----------|----------|
| **Faker** | Basic fake data | MIT | Simple PII, prototypes | Mature |
| **SDV** | Tabular GAN/TVAE | BSD-3 | General tabular | Mature |
| **Synthcity** | Benchmarking + models | Apache 2.0 | Research, comparison | Active |
| **ydata-synthetic** | GANs for tabular | BSD-3 | CTGAN, CGAN, WGAN | Active |
| **SDV (Main)** | GaussianCopula, CTGAN, TVAE | BSD-3 | Production tabular | Mature |
| **Gretel** | Commercial | Proprietary | Privacy, PII, text | Commercial |
| **MOSTLY AI** | Commercial | Proprietary | High-fidelity, referential integrity | Commercial |
| **Gretel** | Commercial | Proprietary | Privacy, text, PII | Commercial |
| **Hazy** | Commercial | Proprietary | Enterprise, referential integrity | Commercial |
| **Syntheticus** | Open Source | Apache 2.0 | Tabular, referential integrity | Active |
| **Gretel Synthetics** | Privacy-preserving | Proprietary | Text, PII, structured | Commercial |
| **MOSTLY AI** | Platform | Commercial | High-fidelity, referential integrity | Commercial |

---

## 2. Quick Start Examples

### 1. Faker (Simple Fake Data)
```python
# pip install faker
from faker import Faker
import pandas as pd

fake = Faker()

# Single records
fake.name()           # 'John Doe'
fake.email()          # 'john.doe@example.com'
fake.address()        # '123 Main St, City, State'
fake.date_between(start_date='-1y', end_date='today')
fake.credit_card_number()
fake.ssn()
fake.company()
fake.job()

# Bulk generation
def generate_fake_users(n=1000):
    return pd.DataFrame([{
        'name': fake.name(),
        'email': fake.email(),
        'phone': fake.phone_number(),
        'address': fake.address(),
        'company': fake.company(),
        'job': fake.job(),
        'ssn': fake.ssn(),
        'credit_card': fake.credit_card_number(),
        'dob': fake.date_of_birth(minimum_age=18, maximum_age=90),
        'income': round(np.random.lognormal(10, 0.5), 2)
    } for _ in range(n)]

df = generate_fake_users(1000)
```

### 2. Localization (Locales)
```python
from faker import Faker

# Multiple locales
fake_en = Faker('en_US')
fake_ja = Faker('ja_JP')
fake_de = Faker('de_DE')
fake_zh = Faker('zh_CN')

# Locale-specific data
fake_ja.name()      # '田中太郎'
fake_de.address()   # 'Musterstraße 123, 12345 Musterstadt'
fake_zh.company()   # '北京科技有限公司'
```

### 3. Providers & Custom Providers
```python
from faker.providers import BaseProvider
from faker import Faker

class MedicalProvider(BaseProvider):
    def diagnosis_code(self):
        return self.random_element(['I10', 'E11.9', 'J44.1', 'Z23', 'J18.9'])
    
    def medication(self):
        return self.random_element(['Metformin', 'Lisinopril', 'Atorvastatin', 'Levothyroxine'])

fake = Faker()
fake.add_provider(MedicalProvider)

fake.diagnosis_code()  # 'E11.9'
fake.medication()      # 'Metformin'
```

---

## 2. SDV (Synthetic Data Vault)

### Installation & Setup
```bash
pip install sdv
# or with extras
pip install sdv[all]  # includes all dependencies
```

### Basic Usage (GaussianCopula - Fast, Statistical)
```python
from sdv.single_table import GaussianCopulaSynthesizer
from sdv.metadata import SingleTableMetadata
import pandas as pd

# 1. Prepare data
df = pd.read_csv('data.csv')

# 2. Create/Detect Metadata
metadata = SingleTableMetadata()
metadata.detect_from_dataframe(df)

# 3. Create Synthesizer
synthesizer = GaussianCopulaSynthesizer(metadata)

# 4. Fit
synthesizer.fit(df)

# 5. Generate
synthetic_data = synthesizer.sample(num_rows=10000)

# Evaluate
from sdv.evaluation.single_table import evaluate_quality
quality_report = evaluate_quality(real_data, synthetic_data, metadata)
print(quality_report.get_score())
```

### 2. CTGAN (Deep Learning for Tabular)
```python
from sdv.single_table import CTGANSynthesizer

# CTGAN for complex distributions
synthesizer = CTGANSynthesizer(
    metadata,
    enforce_min_max_values=True,
    enforce_rounding=True,
    epochs=300,
    batch_size=500,
    generator_lr=2e-4,
    discriminator_lr=2e-4
)

synthesizer.fit(df)
synthetic = synthesizer.sample(num_rows=10000)
```

### 3. TVAE (Variational Autoencoder)
```python
from sdv.single_table import TVAESynthesizer

synthesizer = TVAESynthesizer(
    metadata,
    epochs=300,
    batch_size=512,
    compress_dim=(128, 128),
    decompress_dim=(128, 128),
    l2scale=1e-3
)
```

### 4. Metadata & Constraints
```python
from sdv.metadata import SingleTableMetadata

metadata = SingleTableMetadata()
metadata.detect_from_dataframe(df)

# Override types
metadata.update_column('user_id', sdtype='id')
metadata.update_column('email', sdtype='email')
metadata.update_column('ssn', pii=True, regex='^\d{3}-\d{2}-\d{4}$')
metadata.update_column('age', sdtype='numerical', 
                       computer_representation='Int64')

# Constraints
from sdv.constraints import Unique, GreaterThan, ScalarRange

metadata.add_constraint(Unique(column='user_id'))
metadata.add_constraint(ScalarRange(column='age', low=0, high=120))
metadata.add_constraint(GreaterThan(column='end_date', reference='start_date'))
```

### 4. Relational / Multi-table (SDV Relational)
```python
from sdv.metadata import Metadata
from sdv.relational import HMA1Synthesizer

# Multi-table metadata
metadata = Metadata()
metadata.detect_from_dataframes({
    'users': users_df,
    'orders': orders_df,
    'items': items_df
})

# Relationships
metadata.add_relationship(
    parent_table='users',
    child_table='orders',
    parent_key='user_id',
    child_key='user_id'
)

# Synthesize
synthesizer = HMA1Synthesizer(metadata)
synthesizer.fit({'users': users_df, 'orders': orders_df, 'items': items_df})
synthetic = synthesizer.sample(scale=2.0)  # 2x data
```

---

## 3. Synthcity

### Installation
```bash
pip install synthcity
```

### Usage
```python
from synthcity.plugins import Plugins
from synthcity.plugins.core.dataloader import GenericDataLoader

# List available plugins
Plugins().list()

# Quick generation
from synthcity.plugins import Plugins
from synthcity.plugins.core.dataloader import GenericDataLoader

X, y = load_data()
loader = GenericDataLoader(X, y)

# List models
Plugins().list()  # Shows all available models

# Train
model = Plugins().get('ctgan')
model.fit(X, y)

# Generate
synthetic = model.generate(1000)

# Benchmarking
from synthcity.benchmark import Benchmark
benchmark = Benchmark()
results = benchmark.run(models=['ctgan', 'tvae', 'gaussian'], 
                        datasets=[train_data])
```

---

## 3. ydata-synthetic

```bash
pip install ydata-synthetic
```

```python
from ydata_synthetic.synthesizers import TrainParameters
from ydata_synthetic.synthesizers.regular import RegularSynthesizer

# CTGAN
train_params = TrainParameters(
    epochs=300,
    batch_size=500,
    lr=2e-4,
    beta_1=0.5,
    beta_2=0.9
)

synth = RegularSynthesizer(modelname='ctgan', parameters=train_params)
synth.fit(df, num_cols=num_cols, cat_cols=cat_cols)
synthetic = synth.sample(10000)

# Also supports: WGAN, WGAN-GP, CGAN, Vanilla GAN
```

---

## 5. Gretel Synthetics (Commercial)

```python
# pip install gretel-client
import gretel_client

# Configure
gretel_client.configure_session(api_key="YOUR_API_KEY")

# Create project
project = gretel_client.create_project(name="my-project")

# Create model
model = gretel_client.create_model(
    project=project,
    model_type="transformer",  # or "lstm", "gan"
    params={
        "epochs": 100,
        "batch_size": 64,
        "learning_rate": 0.001
    }
)

# Train
model = gretel_client.submit_model(project, model)

# Generate
records = gretel_client.generate(model, num_records=10000)
```

---

## 3. Time Series Generation

### 1. NeuralForecast (Nixtla)
```python
# pip install neuralforecast
from neuralforecast import NeuralForecast
from neuralforecast.models import NBEATS, NHITS, TFT, TimesNet
from neuralforecast.losses.pytorch import MAE, MSE

models = [
    NBEATS(input_size=24, h=12, loss=MAE()),
    NHITS(input_size=24, h=12, loss=MAE()),
    TFT(input_size=24, h=12, loss=MAE())
]

nf = NeuralForecast(models=models, freq='H')
nf.fit(df)
forecasts = nf.predict(futr_df)
```

### 2. NeuralProphet
```python
# pip install neuralprophet
from neuralprophet import NeuralProphet

m = NeuralProphet(
    n_forecasts=12,
    n_lags=24,
    yearly_seasonality=True,
    weekly_seasonality=True,
    daily_seasonality=True
)
m.fit(df, freq='D')
future = m.make_future_dataframe(df, periods=30)
forecast = m.predict(future)
```

### 3. GluonTS (Amazon)
```python
# pip install gluonts
from gluonts.model.deepar import DeepAREstimator
from gluonts.trainer import Trainer

estimator = DeepAREstimator(
    freq='D',
    prediction_length=30,
    trainer=Trainer(epochs=100)
)
predictor = estimator.train(training_data)
forecasts = list(predictor.predict(test_data))
```

### 4. StatsForecast (Fast Statistical)
```python
# pip install statsforecast
from statsforecast import StatsForecast
from statsforecast.models import AutoARIMA, ETS, MSTL, SeasonalNaive

sf = StatsForecast(
    models=[AutoARIMA(season_length=12), ETS()],
    freq='M',
    n_jobs=-1
)
forecast = sf.forecast(df, h=12)
```

### 4. TimeGPT / Nixtla
```python
# pip install nixtla
from nixtla import NixtlaClient

client = NixtlaClient(api_key="YOUR_KEY")
forecast = client.forecast(df, h=12, freq='M')
```

---

## 5. Time Series Synthetic Generation

### 1. Synthetic Time Series (General)
```python
# Synthetic TS with trend + seasonality + noise
def generate_ts(n=1000, trend='linear', seasonality='yearly', noise=0.1):
    t = np.arange(n)
    trend = 0.01 * t
    seasonal = 10 * np.sin(2 * np.pi * t / 365.25)
    noise = np.random.normal(0, noise, n)
    return trend + seasonal + noise

# With trend changes
def regime_switching_ts(n, n_regimes=3):
    regimes = np.random.choice(n_regimes, n, p=[0.5, 0.3, 0.2])
    params = np.random.randn(n_regimes, 2)  # (mean, std) per regime
    return np.array([np.random.normal(*params[r]) for r in regimes])
```

### 2. Synthetic Time Series Libraries
```python
# synthcity (has time series models)
from synthcity.plugins import Plugins
from synthcity.plugins.core.dataloader import GenericDataLoader

# TimeGAN
from synthcity.plugins import Plugins
Plugins().list()  # includes 'timegan'

# TimeGAN
from synthcity.plugins.generic import TimeGAN

# DoubleGAN, TimeVAE, etc.
```

---

## 5. Text & NLP Synthetic Data

### 1. Faker for Text
```python
from faker import Faker

fake = Faker()

# Sentences
fake.sentence()           # 'Lorem ipsum dolor sit amet.'
fake.paragraph(nb_sentences=3)  # 3 sentences
fake.text(max_nb_chars=200)

# Structured text
fake.email()
fake.url()
fake.user_agent()
fake.isbn13()
fake.uuid4()

# Structured
fake.json()
fake.xml()
fake.csv(header=True, columns=5, num_rows=100)
```

### 2. LLM-Based Generation (LangChain)
```python
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.llms import OpenAI

prompt = PromptTemplate(
    input_variables=["topic", "style"],
    template="Write a {style} article about {topic}."
)

llm = OpenAI(temperature=0.7)
chain = LLMChain(llm=llm, prompt=prompt)

result = chain.run(topic="climate change", style="journalistic")
```

### 2. Gretel Synthetics (Text)
```python
# Gretel for text
import gretel_client
gretel_client.configure_session(api_key="API_KEY")

project = gretel_client.create_project("text-synthesis")
model = gretel_client.create_model(
    project=project,
    model_type="transformer",  # LLM-based
    params={"epochs": 50, "batch_size": 32}
)
model = gretel_client.submit_model(project, model)

# Generate
records = gretel_client.generate(model, num_records=1000)
```

### 2. Synthetic Text with LLMs
```python
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.llms import OpenAI

# Structured synthetic data
prompt = PromptTemplate(
    input_variables=["schema", "n"],
    template="""
Generate {n} synthetic records matching this JSON schema:
{schema}

Output as valid JSON array.
"""
)

chain = LLMChain(llm=OpenAI(temperature=0.7), prompt=prompt)
result = chain.run(schema=json_schema, n=100)
```

### 3. Structured Text (JSON/JSONL)
```python
from faker import Faker
import json

fake = Faker()

def generate_json_records(n=100):
    records = []
    for _ in range(n):
        record = {
            "user_id": fake.uuid4(),
            "name": fake.name(),
            "email": fake.email(),
            "address": {
                "street": fake.street_address(),
                "city": fake.city(),
                "state": fake.state_abbr(),
                "zip": fake.zipcode()
            },
            "orders": [
                {"id": fake.uuid4(), "amount": round(random.uniform(10, 500), 2)}
                for _ in range(random.randint(1, 5))
            ]
        }
        records.append(record)
    return records
```

---

## 6. Image & Video Generation

### 1. Stable Diffusion (Diffusers)
```python
# pip install diffusers transformers accelerate
from diffusers import StableDiffusionPipeline
import torch

pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16,
    variant="fp16"
).to("cuda")

# Text-to-image
images = pipe(
    prompt="A photorealistic photo of a futuristic city at sunset",
    num_inference_steps=50,
    guidance_scale=7.5,
    num_images_per_prompt=4
).images

# ControlNet (conditional)
from diffusers import ControlNetModel, StableDiffusionControlNetPipeline

controlnet = ControlNetModel.from_pretrained(
    "lllyasviel/sd-controlnet-canny", torch_dtype=torch.float16
)
pipe = StableDiffusionControlNetPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    controlnet=controlnet,
    torch_dtype=torch.float16
).to("cuda")

# Control with Canny edges
from PIL import Image
import cv2
image = Image.open("input.png").convert("RGB")
canny = cv2.Canny(np.array(image), 100, 200)
canny = Image.fromarray(canny)

images = pipe(prompt, image=canny, num_inference_steps=20).images
```

### 2. Stable Video Diffusion
```python
from diffusers import StableVideoDiffusionPipeline
from diffusers.utils import load_image, export_to_video

pipe = StableVideoDiffusionPipeline.from_pretrained(
    "stabilityai/stable-video-diffusion-img2vid-xt",
    torch_dtype=torch.float16,
    variant="fp16"
).to("cuda")

image = load_image("input.png")
frames = pipe(image, num_frames=25, decode_chunk_size=8).frames[0]
export_to_video(frames, "output.mp4", fps=7)
```

### 2. Stable Video Diffusion / AnimateDiff
```python
# AnimateDiff
from diffusers import AnimateDiffPipeline, MotionAdapter, DDIMScheduler

adapter = MotionAdapter.from_pretrained("guoyww/animatediff-motion-adapter-v1-5-2")
pipe = AnimateDiffPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    motion_adapter=adapter,
    torch_dtype=torch.float16
).to("cuda")

# Text-to-video
frames = pipe("A cat playing piano", num_frames=16, guidance_scale=7.5).frames[0]
export_to_video(frames, "output.mp4", fps=8)
```

---

## 7. Geospatial & Graph Synthetic Data

### 1. Geospatial (Point Patterns)
```python
import geopandas as gpd
from shapely.geometry import Point, Polygon
import numpy as np

# Random points in polygon
def random_points_in_polygon(polygon, n):
    minx, miny, maxx, maxy = polygon.bounds
    points = []
    while len(points) < n:
        p = Point(np.random.uniform(minx, maxx), np.random.uniform(miny, maxy))
        if polygon.contains(p):
            points.append(p)
    return points

# Clustered points (Thomas process)
def thomas_process(polygon, n_clusters=5, points_per_cluster=50, sigma=0.01):
    centroids = [random_point_in_polygon(polygon) for _ in range(n_clusters)]
    points = []
    for cx, cy in centroids:
        for _ in range(points_per_cluster):
            angle = np.random.uniform(0, 2*np.pi)
            r = np.random.normal(0, sigma)
            x = cx + r * np.cos(angle)
            y = cy + r * np.sin(angle)
            if polygon.contains(Point(x, y)):
                points.append((x, y))
    return points
```

### 2. Graph/Network Data
```python
import networkx as nx

# Synthetic graphs
# Erdos-Renyi
G = nx.erdos_renyi_graph(n=1000, p=0.01)

# Barabasi-Albert (scale-free)
G = nx.barabasi_albert_graph(1000, 3)

# Watts-Strogatz (small world)
G = nx.watts_strogatz_graph(1000, 6, 0.3)

# Stochastic Block Model (communities)
G = nx.stochastic_block_model([100, 100, 100], 
    [[0.1, 0.01, 0.01], [0.01, 0.1, 0.01], [0.01, 0.01, 0.1]])

# Attribute-rich graphs
for n in G.nodes():
    G.nodes[n]['features'] = np.random.randn(10)
    G.nodes[n]['label'] = np.random.choice(['A', 'B', 'C'])
```

### 3. Synthetic Graphs (GraphRNN, GraphRNN)
```python
# GraphRNN (requires graph-rnn package)
# pip install graphrnn
from graphrnn import GraphRNN

model = GraphRNN(max_nodes=50, hidden_size=128)
model.fit(graphs)
synthetic_graphs = model.sample(100)
```

---

## 2. Audio & Speech

### 1. Text-to-Speech (TTS)
```python
# Coqui TTS
# pip install TTS
from TTS.api import TTS

tts = TTS("tts_models/en/ljspeech/vits")
tts.tts_to_file(text="Hello world", file_path="output.wav")

# Multi-speaker
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
tts.tts_to_file(text="Hello", speaker_wav="speaker.wav", language="en", file_path="out.wav")
```

### 2. Voice Cloning
```python
# Coqui XTTS v2
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
tts.tts_to_file(
    text="Hello world",
    speaker_wav="speaker_reference.wav",
    language="en",
    file_path="output.wav"
)
```

### 2. Audio Synthesis (Diffusion)
```python
# AudioLDM
# pip install audioldm
from audioldm import AudioLDM

model = AudioLDM()
audio = model.generate("A bird singing in the forest", duration=10)

# AudioLDM 2
from audioldm import AudioLDM2
model = AudioLDM2()
audio = model.generate("Piano music with jazz style", duration=30)
```

---

## 6. Evaluation & Quality Metrics

### 1. Fidelity Metrics
```python
from sdv.evaluation.single_table import evaluate_quality
from sdv.evaluation.single_table import run_diagnostic

# Statistical fidelity
quality_report = evaluate_quality(
    real_data=real_df,
    synthetic_data=synthetic_df,
    metadata=metadata
)

# Scores
print(f"Overall Score: {report.get_score()}")
print(f"Column Shapes: {report.get_property('Column Shapes')}")
print(f"Column Pair Trends: {report.get_property('Column Pair Trends')}")

# Column-wise
for col in df.columns:
    print(f"{col}: {report.get_column_plot(col)}")
```

### 2. Privacy Metrics
```python
from sdv.evaluation.single_table import run_diagnostic

# Diagnostic
diagnostic = run_diagnostic(real_data, synthetic_data, metadata)
print(diagnostic.get_details())

# Privacy
from sdv.evaluation import privacy

# Risk assessment
privacy_report = privacy.evaluate(real_data, synthetic_data, metadata)
print(f"High risk records: {privacy_report.get_high_risk_count()}")
```

### 2. Privacy Metrics (Custom)
```python
# Membership Inference Attack
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

def membership_inference_attack(model, train_data, test_data, synthetic):
    # Train attack model
    X_train = np.vstack([train_data, synthetic])
    y_train = np.hstack([np.ones(len(train)), np.zeros(len(synthetic))])
    
    clf = RandomForestClassifier()
    clf.fit(np.vstack([train_data, synthetic]), 
            np.hstack([np.ones(len(train)), np.zeros(len(synthetic))]))
    
    # Evaluate on held-out
    pred = model.predict_proba(test_data)[:, 1]
    return roc_auc_score(y_true, y_pred)

# Attribute Inference
def attribute_inference(model, X_test, target_col):
    # Train attack model to predict sensitive attr from other features
    pass
```

### 3. Utility Metrics
```python
# TSTR (Train on Synthetic, Test on Real)
def tstr_score(synth_data, real_train, real_test, model_class, **kwargs):
    synth_model = model_class().fit(synth_data)
    score = model.score(X_test, y_test)
    return score

# TRTS (Train Real, Test Synthetic)
def trts_score(model, synth_test, real_test):
    return model.score(synth_test, real_test)

# Comparison
tstr = train_synthetic_test_real(synth, real_train, real_test)
trts = train_real_test_synth(model, synth_test)
```

---

## 8. Evaluation Metrics Cheatsheet

| Aspect | Metric | Function | Target |
|--------|--------|----------|--------|
| **Fidelity** | KS Test | `ks_2samp(real, synth)` | p > 0.05 |
| | JS Divergence | `jensenshannon(p, q)` | < 0.1 |
| | Wasserstein | `wasserstein_distance()` | < 0.1 |
| | Correlation | `np.corrcoef()` | r > 0.9 |
| **Utility** | TSTR (Train Synth, Test Real) | `train_synth_test_real()` | Match real performance |
| | TRTS | `train_real_test_synth()` | Match real performance |
| | ML Utility | Train on synth, test real | Match real accuracy |
| **Privacy** | Membership Inference | AUC < 0.55 | < 0.55 |
| | Attribute Inference | `attribute_inference()` | AUC < 0.6 |
| | k-Anonymity | `k_anonymity()` | k ≥ 5 |
| | l-Diversity | distinct values per quasi-id | l ≥ 3 |

---

## 11. Tools & Platforms Comparison

| Platform | Type | Key Features | Pricing |
|----------|------|--------------|---------|
| **MOSTLY AI** | Platform | High-fidelity, referential integrity, PII | Enterprise |
| **Gretel** | Platform + SDK | Privacy, PII, text, structured | Free tier / Enterprise |
| **MOSTLY AI** | Platform | High-fidelity, referential integrity | Enterprise |
| **Gretel** | Platform + SDK | Privacy, PII, text | Freemium |
| **Hazy** | Platform | Referential integrity, GDPR | Enterprise |
| **Syntheticus** | Open Source | Tabular, referential | Open Source |
| **Syntheticus** | Open Source | Apache 2.0 | Active |
| **Gretel Synthetics** | SDK + Platform | Text, PII, privacy | Freemium |
| **YData Synthetic** | SDK | GAN-based tabular | Freemium |
| **Synthcity** | Open Source | Benchmarking, many models | Open Source |
| **SDV** | Open Source | Comprehensive, mature | MIT |
| **ydata-synthetic** | GANs for tabular | BSD-3 | Active |
| **Synthcity** | Benchmarking + models | Apache 2.0 | Active research |
| **Datacebo/SDV** | Open Core | Tabular, relational | BSD-3 |

---

## 12. Best Practices Checklist

```markdown
## Pre-Generation
- [ ] Profile real data (distributions, correlations, missingness)
- [ ] Define quality thresholds (fidelity, utility, privacy)
- [ ] Define privacy requirements (DP, k-anon, etc.)
- [ ] Split data: train/val/test + holdout for evaluation

### Generation
- [ ] Choose appropriate model for data type
- [ ] Handle constraints (foreign keys, ranges, logic)
- [ ] Handle class imbalance (stratified sampling)
- [ ] Handle temporal dependencies (time series)

### Validation
- [ ] Statistical fidelity (KS, KS-test, correlation)
- [ ] Utility: TSTR / TRTS
- [ ] Privacy: membership inference, attribute inference
- [ ] Domain expert review

### Deployment
- [ ] Version control (data + model)
- [ ] Monitoring (drift, quality drift)
- [ ] Automated retraining pipeline
- [ ] Documentation (model card)
```

---

## Quick Reference Commands

```bash
# Install core stack
pip install sdv synthcity ydata-synthetic faker plotnine

# Commercial (require API keys)
pip install gretel-client mostlyai gretel-client

# Time series
pip install neuralforecast neuralprophet gluonts statsforecast

# Visualization
pip install plotnine plotly seaborn

# Evaluation
pip install sdv-evaluation synthcity ydata-profiling

# Privacy
pip install opacus opacus-tensorflow tensorflow-privacy
```

---

*Last updated: 2024-11-05*
*Part of: Synthetic Data Knowledge Base*