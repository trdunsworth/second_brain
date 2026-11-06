# Synthetic Data Tools & Platforms

A comprehensive reference for synthetic data generation tools, platforms, and frameworks.

---

## 1. Open Source Libraries

### 1.1 Core Synthetic Data Libraries

| Library | Language | Category | Key Features | License | Status |
|---------|----------|---------|------------|---------|--------|
| **SDV** | Python | Tabular, Relational | GaussianCopula, CTGAN, TVAE, CopulaGAN, PARSynthesizer | BSD-3 | Mature |
| **Synthcity** | Python | Benchmarking, many models | CTGAN, TVAE, GReaT, REaLTabFormer, DPGAN, PATEGAN | Apache 2.0 | Active |
| **ydata-synthetic** | Python | GAN-based tabular | CTGAN, WGAN, CGAN, vanilla | BSD-3 | Active |
| **SDV (Datacebo)** | Python | Relational, sequential, single-table | GaussianCopula, CTGAN, TVAE, PARSynthesizer | BSD-3 | Mature |
| **Gretel Synthetics** | Python + SaaS | Privacy-preserving, LLM-based | Navigator, Transform, Classify | Proprietary | Active |
| **MOSTLY AI** | Platform + SDK | High-fidelity, referential integrity | Enterprise | Commercial |
| **Gretel Synthetics** | Python + SaaS | Privacy-preserving, LLM-based | Transform, Classify, Navigator | Proprietary | Active |
| **Syntheticus** | Python | Open source, tabular | Open Source | Active |
| **ydata-synthetic** | Python | GAN-based tabular | BSD-3 | Active |
| **Synthcity** | Python | Benchmarking, many models | Apache 2.0 | Active |

### 1.2 Installation Quick Reference

```bash
# Core open source stack
pip install sdv synthcity ydata-synthetic faker plotnine

# Specialized
pip install gretel-client mostlyai-sdk  # Commercial
pip install neuralforecast neuralprophet gluonts statsforecast  # Time series
pip install diffusers transformers accelerate  # Diffusion/Images
pip install diffusers[torch] accelerate  # Stable Diffusion
pip install gretel-client  # Gretel
pip install mostlyai  # MOSTLY AI SDK

# Privacy
pip install opacus opacus-tensorflow tensorflow-privacy  # DP
pip install smartnoise-sdk  # OpenDP / SmartNoise
```

---

## 2. Python Libraries Deep Dive

### 1. SDV (Synthetic Data Vault) - Most Mature

```python
# Installation
pip install sdv

# Core components
from sdv.metadata import SingleTableMetadata, MultiTableMetadata
from sdv.single_table import (
    GaussianCopulaSynthesizer,  # Fast, statistical
    CTGANSynthesizer,           # GAN, complex distributions
    TVAESynthesizer,            # VAE-based
    CopulaGANSynthesizer        # Copula + GAN
)
from sdv.sequential import PARSynthesizer  # Time series
from sdv.relational import HMA1Synthesizer  # Multi-table
from sdv.evaluation.single_table import evaluate_quality, run_diagnostic
from sdv.evaluation.multi_table import evaluate_quality as eval_multi

# Constraints
from sdv.constraints import (
    Unique, GreaterThan, LessThan,
    ScalarRange, GreaterThan, LessThan,
    Inequality, ScalarInequality, CustomConstraint
)
```

### 2. Synthcity (Benchmarking & Research)

```bash
pip install synthcity
```

```python
from synthcity.plugins import Plugins
from synthcity.plugins.core.dataloader import GenericDataLoader
from synthcity.benchmark import Benchmark

# List all available models
Plugins().list()

# Benchmark multiple models
benchmark = Benchmark()
results = benchmark.run(
    models=['ctgan', 'tvae', 'gaussian_copula', 'ctabgan', 'dpgan'],
    datasets=[train_data],
    metrics=['fidelity', 'privacy', 'utility'],
    n_iter=3
)

results.table()
results.plot()
```

### 3. ydata-synthetic (GAN-focused)
```bash
pip install ydata-synthetic
```

```python
from ydata_synthetic.synthesizers import TrainParameters
from ydata_synthetic.synthesizers.regular import RegularSynthesizer

train_params = TrainParameters(
    epochs=300,
    batch_size=500,
    lr=2e-4,
    beta_1=0.5,
    beta_2=0.9
)

synth = RegularSynthesizer(
    modelname='ctgan',  # 'ctgan', 'wgan', 'wgan-gp', 'cgan', 'vanilla'
    parameters=TrainParameters(epochs=300, batch_size=500)
)

synth.fit(df, num_cols=num_cols, cat_cols=cat_cols)
synthetic = synth.sample(10000)
```

### 4. Gretel Synthetics (Commercial, Free Tier)
```python
# pip install gretel-client
import gretel_client

gretel_client.configure_session(api_key="YOUR_API_KEY")

project = gretel_client.create_project(name="my-project")

# Model types: "transformer", "lstm", "gan"
model = gretel_client.create_model(
    project=project,
    model_type="transformer",  # or "lstm", "gan"
    params={
        "epochs": 50,
        "batch_size": 32,
        "learning_rate": 0.001,
        "dp": True,  # Differential privacy
        "dp_noise_multiplier": 1.1,
        "dp_l2_norm_clip": 1.0
    }
)

model = gretel_client.submit_model(project, model)
records = gretel_client.generate(model, num_records=10000)
```

---

## 2. Commercial Platforms

### 1. MOSTLY AI
```python
# MOSTLY AI Python SDK
# pip install mostlyai

from mostlyai.sdk import MostlyAI

mostly = MostlyAI(api_key="YOUR_API_KEY")

# Create synthetic data job
job = mostly.create_job(
    name="customer-data-synthesis",
    source_connector="s3://bucket/data.csv",
    target_connector="s3://bucket/synthetic/",
    generator_config={
        "model": "tabular",
        "privacy": {"epsilon": 1.0},
        "model_config": {"epochs": 100}
    }
)

# Monitor
job.wait_for_completion()
synthetic_data = mostly.download_results(job.id)
```

### 2. Gretel
```python
# pip install gretel-client
import gretel_client

gretel_client.configure_session(api_key="YOUR_API_KEY")

project = gretel_client.create_project(name="my-project")

# Model types: "transformer", "lstm", "gan"
model = gretel_client.create_model(
    project=project,
    model_type="transformer",
    params={
        "epochs": 50,
        "batch_size": 32,
        "dp": True,
        "dp_noise_multiplier": 1.1
    }
)

model = gretel_client.submit_model(project, model)
records = gretel_client.generate(model, num_records=10000)
```

### 3. MOSTLY AI Platform
```python
# Enterprise features:
# - Referential integrity across tables
# - Conditional generation
# - Fairness/bias mitigation
# - PII detection & handling
# - GDPR/CCPA compliance reports
# - SOC2 Type II certified
```

### 4. Hazy
```python
# Enterprise synthetic data platform
# Focus: Referential integrity, enterprise scale
# Features: Database subsetting, referential integrity, PII detection
```

### 4. Syntheticus (Open Source)
```bash
pip install syntheticus
```

```python
from syntheticus import Syntheticus

synth = Syntheticus(
    model="tabular",  # or "timeseries", "text"
    privacy="dp",  # or "none"
    epsilon=1.0
)

synth.fit(df)
synthetic = synth.sample(10000)
```

### 5. ydata-synthetic
```bash
pip install ydata-synthetic
```

```python
from ydata_synthetic.synthesizers import TrainParameters
from ydata_synthetic.synthesizers.regular import RegularSynthesizer

train_params = TrainParameters(
    epochs=300,
    batch_size=500,
    lr=2e-4,
    beta_1=0.5,
    beta_2=0.9
)

synth = RegularSynthesizer(
    modelname='ctgan',  # 'ctgan', 'wgan', 'wgan-gp', 'cgan', 'vanilla'
    parameters=train_params
)

synth.fit(df, num_cols=num_cols, cat_cols=cat_cols)
synthetic = synth.sample(10000)
```

---

## 2. Time Series Specific

### 1. NeuralForecast (Nixtla)
```bash
pip install neuralforecast
```

```python
from neuralforecast import NeuralForecast
from neuralforecast.models import NBEATS, NHITS, TFT, TimesNet, TiDE
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
```bash
pip install neuralprophet
```

```python
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

### 3. StatsForecast (Fast Statistical)
```python
from statsforecast import StatsForecast
from statsforecast.models import AutoARIMA, ETS, MSTL, SeasonalNaive

sf = StatsForecast(
    models=[AutoARIMA(), ETS(), MSTL(season_length=12)],
    freq='M',
    n_jobs=-1
)

sf.fit(df)
forecasts = sf.forecast(h=12, level=[80, 95])
```

### 3. GluonTS (Amazon)
```python
# pip install gluonts mxnet
from gluonts.model.deepar import DeepAREstimator
from gluonts.trainer import Trainer
from gluonts.dataset.common import ListDataset

estimator = DeepAREstimator(
    freq='D',
    prediction_length=30,
    trainer=Trainer(epochs=100, device='cuda')
)

train_data = ListDataset([{"start": df.index[0], "target": df.values}], freq='D')
predictor = estimator.train(train_data)
forecasts = list(predictor.predict(test_data))
```

---

## 3. Time Series Specific Tools

### 1. statsforecast (Fast Statistical)
```python
from statsforecast import StatsForecast
from statsforecast.models import AutoARIMA, ETS, MSTL, SeasonalNaive

sf = StatsForecast(
    models=[AutoARIMA(season_length=12), ETS(), MSTL()],
    freq='M',
    n_jobs=-1
)

sf.fit(df)
forecasts = sf.forecast(h=12, level=[80, 95])
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

### 3. Statsmodels / StatsForecast
```python
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.holtwinters import ExponentialSmoothing

# Classical statistical models
model = ARIMA(data, order=(1,1,1)).fit()
model = SARIMAX(data, order=(1,1,1), seasonal_order=(1,1,1,12)).fit()
```

---

## 3. Deep Learning for Images/Video

### 1. Stable Diffusion (diffusers)
```python
# pip install diffusers transformers accelerate accelerate
from diffusers import (
    StableDiffusionPipeline,
    StableDiffusionXLPipeline,
    StableDiffusionXLPipeline,
    StableVideoDiffusionPipeline,
    ControlNetModel,
    StableDiffusionControlNetPipeline,
    StableDiffusionInpaintPipeline,
    StableVideoDiffusionPipeline
)
import torch

# SD 1.5
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16,
    variant="fp16"
).to("cuda")

# SDXL
pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
    variant="fp16"
).to("cuda")

# SDXL + Refiner
pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16, variant="fp16"
).to("cuda")

refiner = StableDiffusionXLImg2ImgPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-refiner-1.0",
    torch_dtype=torch.float16, variant="fp16"
).to("cuda")
```

### 2. ControlNet
```python
from diffusers import ControlNetModel, StableDiffusionControlNetPipeline

controlnet = ControlNetModel.from_pretrained(
    "lllyasviel/sd-controlnet-canny",
    torch_dtype=torch.float16
)

pipe = StableDiffusionControlNetPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    controlnet=controlnet,
    torch_dtype=torch.float16
).to("cuda")

# Canny edge control
from diffusers.utils import load_image
import cv2

image = load_image("input.png")
canny = cv2.Canny(np.array(image), 100, 200)
canny = Image.fromarray(canny)

images = pipe(
    prompt="A modern living room",
    image=canny,
    num_inference_steps=20,
    controlnet_conditioning_scale=0.5
).images
```

### 3. Video Generation
```python
# Stable Video Diffusion
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

# AnimateDiff
from diffusers import AnimateDiffPipeline, MotionAdapter, DDIMScheduler

adapter = MotionAdapter.from_pretrained("guoyww/animatediff-motion-adapter-v1-5-2")
pipe = AnimateDiffPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    motion_adapter=adapter,
    torch_dtype=torch.float16
).to("cuda")

pipe.scheduler = DDIMScheduler.from_pretrained(
    "runwayml/stable-diffusion-v1-5", subfolder="scheduler"
)

frames = pipe("A cat running in the park", num_frames=16).frames[0]
export_to_video(frames, "output.mp4", fps=8)
```

### 4. AnimateDiff / Motion Control
```python
# AnimateDiff
from diffusers import AnimateDiffPipeline, MotionAdapter

adapter = MotionAdapter.from_pretrained("guoyww/animatediff-motion-adapter-v1-5-2")
pipe = AnimateDiffPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    motion_adapter=adapter
).to("cuda")

pipe.scheduler = DDIMScheduler.from_pretrained(
    "runwayml/stable-diffusion-v1-5", subfolder="scheduler"
)

frames = pipe("A cat running", num_frames=16, guidance_scale=7.5).frames[0]
```

---

## 3. Commercial Platforms Comparison

| Platform | Type | Key Features | Pricing |
|----------|------|--------------|---------|
| **MOSTLY AI** | Enterprise Platform | High-fidelity, referential integrity, fairness, PII detection | Enterprise |
| **Gretel** | Platform + SDK | Privacy, PII, text, synthetic text | Free tier / Enterprise |
| **MOSTLY AI** | Platform | High-fidelity, referential integrity, fairness | Enterprise |
| **Gretel** | Platform + SDK | Privacy, PII, text, structured | Freemium / Enterprise |
| **Hazy** | Platform | Referential integrity, GDPR | Enterprise |
| **Syntheticus** | Open Source | Tabular, referential integrity | Open Source |
| **ydata-synthetic** | Python Lib | GAN-based tabular | Open Source |
| **Synthcity** | Python Lib | Benchmarking, many models | Apache 2.0 |
| **SDV** | Python Lib | Comprehensive, mature | BSD-3 |
| **ydata-synthetic** | Python Lib | GAN-based tabular | BSD-3 |
| **Synthcity** | Python Lib | Benchmarking, many models | Apache 2.0 |

### Cloud Provider Services
| Provider | Service | Key Features |
|----------|-----------|--------------|
| **AWS** | SageMaker Ground Truth Synthetics | Synthetic data labeling |
| **GCP** | Vertex AI Synthetic Data | Tabular, image, text |
| **Azure** | Azure AI Synthetic Data | Tabular, text, privacy |
| **Azure** | Azure Confidential Computing | Confidential computing |

---

## 4. Evaluation & Benchmarking Tools

### 1. Synthcity Benchmark
```python
from synthcity.benchmark import Benchmark
from synthcity.plugins import Plugins

benchmark = Benchmark()
results = benchmark.run(
    models=['ctgan', 'tvae', 'gaussian_copula', 'ctabgan', 'dpgan'],
    datasets=[train_data],
    metrics=['fidelity', 'privacy', 'utility'],
    n_iter=3
)
results.table()
results.plot()
```

### 2. SDV Evaluation
```python
from sdv.evaluation.single_table import evaluate_quality, run_diagnostic
from sdv.evaluation.multi_table import evaluate_quality as eval_multi

# Single table
quality_report = evaluate_quality(
    real_data=real_df,
    synthetic_data=synthetic_df,
    metadata=metadata
)

# Metrics
print(f"Quality Score: {quality_report.get_score()}")
print(quality_report.get_details())
print(quality_report.get_visualization('Column Shapes'))
print(quality_report.get_visualization('Column Pair Trends'))

# Diagnostic
diag = run_diagnostic(real_data, synthetic_data, metadata)
print(diag)
```

### 3. Synthcity Evaluation
```python
from synthcity.metrics import (
    eval_fidelity, eval_utility, eval_privacy,
    alpha_precision, beta_recall, authenticity
)

fidelity = eval_fidelity(real_data, synthetic_data)
utility = eval_utility(
    real_train, synth_train, real_test,
    task='classification', model=XGBClassifier()
)
privacy = eval_privacy(real_data, synthetic_data)
```

### 4. MLflow Tracking
```python
import mlflow

mlflow.set_experiment("synthetic-data-experiments")

with mlflow.start_run():
    mlflow.log_params(params)
    mlflow.log_metrics(metrics)
    mlflow.log_artifact("synthetic_data.parquet")
    mlflow.log_artifact("evaluation_report.html")
    mlflow.sklearn.log_model(model, "model")
```

---

## 6. Commercial Platforms Detail

### 1. MOSTLY AI
```python
# pip install mostlyai
from mostlyai.sdk import MostlyAI

mostly = MostlyAI(api_key="YOUR_API_KEY")

# Create generator
generator = mostly.create_generator(
    name="customer-data",
    config={
        "model_type": "tabular",
        "privacy": {"epsilon": 1.0},
        "model_config": {"epochs": 100}
    }
)

# Train
job = mostly.train(generator_id=generator.id, data="s3://bucket/data.csv")

# Generate
synthetic = mostly.generate(generator_id=gen.id, num_records=100000)

# Features:
# - Referential integrity across tables
# - Fairness/bias mitigation
# - PII detection & handling
# - Fairness metrics
# - GDPR/CCPA compliance reports
# - Model cards
```

### 2. Gretel
```python
# pip install gretel-client
import gretel_client

gretel_client.configure_session(api_key="YOUR_API_KEY")

project = gretel_client.create_project(name="my-project")

# Model types: "transformer", "lstm", "gan"
model = gretel_client.create_model(
    project=project,
    model_type="transformer",
    config={
        "epochs": 50,
        "batch_size": 32,
        "dp": True,
        "dp_noise_multiplier": 1.1
    }
)

model = gretel_client.submit_model(project, model)
records = gretel_client.generate(model, num_records=10000)
```

### 3. MOSTLY AI Platform
```python
# Enterprise features:
# - Multi-table referential integrity
# - Fairness & bias mitigation
# - PII detection & handling
# - GDPR/CCPA compliance reports
# - Model cards & documentation
# - SOC2 Type II certified
# - Role-based access control
# - Audit logs
```

---

## 5. Cloud Provider Services

### AWS
```python
# SageMaker Synthetic Data
# SageMaker Ground Truth for synthetic labeling
# SageMaker Ground Truth Synthetics

# SageMaker Ground Truth Synthetics
import boto3
client = boto3.client('sagemaker')
response = client.create_labeling_job(
    JobName='synthetic-data-gen',
    InputConfig={'DataSource': {'S3DataSource': {'ManifestS3Uri': 's3://...'}}},
    OutputConfig={'S3OutputPath': 's3://bucket/output/'},
    RoleArn='arn:aws:iam::123456789:role/SageMakerRole',
    LabelingJobAlgorithmsConfig={
        'InitialActiveLearningModelArn': 'arn:aws:sagemaker:...:algorithm/synthetic-data-generation'
    }
)
```

### 2. Azure
```python
# Azure AI Synthetic Data
from azure.ai.ml import MLClient
from azure.ai.ml.entities import Data

ml_client = MLClient(...)
data_asset = Data(
    path="azureml://datastores/workspaceblobstore/paths/data/",
    type="uri_folder"
)
ml_client.data.create_or_update(data_asset)
```

### 3. GCP
```python
# Vertex AI Synthetic Data
from google.cloud import aiplatform

aiplatform.init(project='project-id', location='us-central1')
dataset = aiplatform.TabularDataset.create(
    display_name="synthetic-data",
    gcs_source="gs://bucket/data.csv"
)
```

---

## 7. MLOps Integration

### 1. MLflow Tracking
```python
import mlflow
import mlflow.sklearn

mlflow.set_experiment("synthetic-data-experiments")

with mlflow.start_run(run_name="ctgan-experiment"):
    mlflow.log_params(params)
    mlflow.log_metrics(metrics)
    mlflow.log_artifact("synthetic_data.parquet")
    mlflow.log_artifact("evaluation_report.html")
    mlflow.sklearn.log_model(model, "model")
```

### 2. Weights & Biases
```python
import wandb

wandb.init(project="synthetic-data-experiments", config=config)

wandb.log({
    "fidelity_score": fidelity_score,
    "utility_score": utility_score,
    "privacy_score": privacy_score
})

wandb.log_artifact("synthetic_data.parquet", type="dataset")
wandb.log_artifact("evaluation_report.html")
```

---

## 6. Cost Optimization

### 1. Spot Instances / Preemptible VMs
```bash
# AWS Spot
aws ec2 run-instances \
  --instance-market-options '{"MarketType":"spot"}' \
  --instance-type p3.2xlarge \
  --spot-price "0.50"

# GCP Preemptible
gcloud compute instances create training-vm \
  --preemptible \
  --machine-type=n1-standard-8 \
  --accelerator=type=nvidia-tesla-v100,count=1
```

### 2. Spot Interruption Handling
```python
import signal
import sys

class SpotInterruptionHandler:
    def __init__(self, checkpoint_interval=300):
        self.checkpoint_interval = checkpoint_interval
        self.last_checkpoint = time.time()
        signal.signal(signal.SIGTERM, self.handle_termination)
    
    def handle_termination(self, signum, frame):
        print("Spot interruption received, saving checkpoint...")
        self.save_checkpoint()
        sys.exit(0)
    
    def should_checkpoint(self):
        return time.time() - self.last_checkpoint > self.checkpoint_interval
```

---

## 7. Key Takeaways

1. **Start with SDV** for tabular - most mature, well-documented
2. **Use Synthcity** for benchmarking multiple models
3. **GreTel / MOSTLY AI** for enterprise privacy/compliance needs
4. **Stable Diffusion / ControlNet** for images
4. **NeuralForecast / NeuralProphet** for time series
5. **Differential Privacy** - OpenDP, OpenDP/SmartNoise, Opacus
6. **Evaluate** with SDV evaluation, Synthcity metrics, Evidently
6. **Monitor** - MLflow, W&B, Evidently, WhyLabs
7. **Cost optimize** - Spot instances, quantization, distillation

---

*Last updated: 2024-11-05*
*Part of: Synthetic Data Knowledge Base*