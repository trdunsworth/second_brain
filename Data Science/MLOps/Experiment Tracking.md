# Experiment Tracking

Systematic logging of hyperparameters, metrics, artifacts, and code versions to enable reproducibility, comparison, and collaboration.

## 1. Why Experiment Tracking?

| Problem | Solution |
|---------|----------|
| "Which model was best?" | Centralized metric comparison |
| "How did I get this result?" | Full lineage (code, data, params, env) |
| "Can I reproduce this?" | Exact environment + artifact capture |
| "What did I try last week?" | Searchable history |
| "Team collaboration" | Shared registry, reviews |

---

## 2. Tool Comparison

| Tool | Type | Best For | Cost |
|------|------|----------|------|
| **MLflow** | Open-source, self-hosted | General purpose, flexible | Free (infra) |
| **Weights & Biases** | SaaS + self-hosted | Deep learning, team collab | Free tier / Paid |
| **Neptune.ai** | SaaS | Lightweight, metadata-heavy | Free tier / Paid |
| **ClearML** | Open-source + SaaS | Auto-logging, pipelines | Free tier / Paid |
| **TensorBoard** | Local/Integrated | TensorFlow/PyTorch viz | Free |
| **DVC** | Git-based | Data + model versioning | Free |
| **Sacred** | Python library | Minimalist, MongoDB backend | Free |

---

## 3. MLflow (Industry Standard)

### Architecture
- **Tracking Server**: REST API + UI (stores runs in backend store)
- **Backend Store**: Database (PostgreSQL/MySQL) for metadata
- **Artifact Store**: S3/GCS/HDFS/MinIO for models, plots, data
- **Model Registry**: Centralized model lifecycle management

### Quick Start (Local)
```bash
# Install
pip install mlflow

# Start UI
mlflow ui --port 5000

# Or with backend store
mlflow server \
  --backend-store-uri sqlite:///mlflow.db \
  --default-artifact-root ./mlruns \
  --host 0.0.0.0 --port 5000
```

### Basic Logging
```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, roc_auc_score

# Set experiment
mlflow.set_experiment("churn-prediction")

# Start run (auto-ends on context exit)
with mlflow.start_run(run_name="rf-baseline") as run:
    # 1. Log parameters
    params = {
        "n_estimators": 200,
        "max_depth": 10,
        "min_samples_split": 5,
        "random_state": 42,
    }
    mlflow.log_params(params)
    
    # 2. Train
    model = RandomForestClassifier(**params)
    model.fit(X_train, y_train)
    
    # 3. Log metrics
    preds = model.predict(X_test)
    proba = model.predict_proba(X_test)[:, 1]
    
    metrics = {
        "accuracy": accuracy_score(y_test, preds),
        "roc_auc": roc_auc_score(y_test, proba),
    }
    mlflow.log_metrics(metrics)
    
    # 4. Log artifacts (plots, data, config)
    import matplotlib.pyplot as plt
    from sklearn.metrics import RocCurveDisplay
    
    RocCurveDisplay.from_estimator(model, X_test, y_test)
    plt.savefig("roc_curve.png")
    mlflow.log_artifact("roc_curve.png")
    
    # 5. Log model (with signature for serving)
    from mlflow.models import infer_signature
    
    signature = infer_signature(X_train, model.predict(X_train))
    mlflow.sklearn.log_model(
        model, 
        "model",
        signature=signature,
        input_example=X_train.iloc[:5],
    )
    
    # 6. Log dataset info
    mlflow.log_param("train_size", len(X_train))
    mlflow.log_param("test_size", len(X_test))
    mlflow.log_param("feature_count", X_train.shape[1])
```

### Auto-Logging (Zero Code Changes)
```python
import mlflow

# Enable auto-logging for frameworks
mlflow.sklearn.autolog()  # sklearn
mlflow.pytorch.autolog()  # PyTorch
mlflow.tensorflow.autolog()  # TF/Keras
mlflow.xgboost.autolog()  # XGBoost
mlflow.lightgbm.autolog()  # LightGBM

# Then just train normally - everything logged automatically!
with mlflow.start_run():
    model = RandomForestClassifier(n_estimators=200)
    model.fit(X_train, y_train)  # Params, metrics, model logged auto
```

### PyTorch Integration
```python
import mlflow.pytorch

with mlflow.start_run():
    # Log params
    mlflow.log_params({
        "lr": 1e-3, "batch_size": 64, "epochs": 50,
        "optimizer": "AdamW", "architecture": "ResNet50"
    })
    
    # Training loop
    for epoch in range(epochs):
        train_loss = train_one_epoch(model, loader, optimizer)
        val_metrics = evaluate(model, val_loader)
        
        # Log per-epoch metrics
        mlflow.log_metrics({
            "train_loss": train_loss,
            "val_loss": val_metrics["loss"],
            "val_acc": val_metrics["acc"],
        }, step=epoch)
    
    # Log model with PyTorch flavor
    mlflow.pytorch.log_model(
        model, "model",
        input_example=torch.randn(1, 3, 224, 224),
        pip_requirements=["torch", "torchvision"]
    )
```

### Model Registry (Lifecycle Management)
```python
# Register model from run
model_uri = f"runs:/{run.info.run_id}/model"
model_version = mlflow.register_model(model_uri, "ChurnPredictor")

# Transition stages via UI or API
client = mlflow.MlflowClient()
client.transition_model_version_stage(
    name="ChurnPredictor",
    version=model_version.version,
    stage="Staging"  # or "Production", "Archived"
)

# Load production model
prod_model = mlflow.pyfunc.load_model(
    model_uri="models:/ChurnPredictor/Production"
)
predictions = prod_model.predict(new_data)
```

### MLflow Projects (Reproducible Runs)
```yaml
# MLproject
name: churn-training

conda_env: conda.yaml

entry_points:
  main:
    parameters:
      n_estimators: {type: int, default: 200}
      max_depth: {type: int, default: 10}
    command: "python train.py --n_estimators {n_estimators} --max_depth {max_depth}"
```

```bash
# Run project
mlflow run . -P n_estimators=300
mlflow run git@github.com:user/repo.git -P n_estimators=300
```

---

## 4. Weights & Biases (Deep Learning Focus)

### Quick Start
```python
import wandb

# Initialize
wandb.init(
    project="churn-prediction",
    name="resnet50-lr1e-3",
    config={
        "learning_rate": 1e-3,
        "batch_size": 64,
        "epochs": 50,
        "architecture": "ResNet50",
        "optimizer": "AdamW",
    },
    tags=["baseline", "image"],
    notes="First run with ResNet50 backbone",
)

# Log metrics (auto-step)
wandb.log({"train_loss": loss, "val_acc": acc})

# Log model checkpoint
wandb.save("model_best.pth")

# Log dataset artifact
artifact = wandb.Artifact("training-data", type="dataset")
artifact.add_dir("data/processed/")
wandb.log_artifact(artifact)

# Finish
wandb.finish()
```

### PyTorch Integration
```python
import wandb
from wandb.integration.pytorch import wandb_watch

wandb.init(project="my-project")
wandb.watch(model, log="all", log_freq=100)  # Log gradients, parameters

# In training loop
wandb.log({
    "epoch": epoch,
    "train/loss": train_loss,
    "val/loss": val_loss,
    "val/acc": val_acc,
    "lr": scheduler.get_last_lr()[0],
})
```

### Sweeps (Hyperparameter Optimization)
```python
sweep_config = {
    'method': 'bayes',
    'metric': {'name': 'val_acc', 'goal': 'maximize'},
    'parameters': {
        'learning_rate': {'distribution': 'log_uniform', 'min': -5, 'max': -2},
        'batch_size': {'values': [32, 64, 128]},
        'optimizer': {'values': ['Adam', 'AdamW', 'SGD']},
        'dropout': {'distribution': 'uniform', 'min': 0.1, 'max': 0.5},
    },
    'early_terminate': {'type': 'hyperband', 'min_iter': 5}
}

sweep_id = wandb.sweep(sweep_config, project="my-project")

def train():
    wandb.init()
    # Use wandb.config for hyperparameters
    model = create_model(dropout=wandb.config.dropout)
    optimizer = getattr(torch.optim, wandb.config.optimizer)(model.parameters(), lr=wandb.config.learning_rate)
    # ... training

wandb.agent(sweep_id, train, count=20)
```

---

## 5. Comparison: MLflow vs W&B

| Feature | MLflow | Weights & Biases |
|---------|--------|------------------|
| **Hosting** | Self-hosted (free) | SaaS (free tier) |
| **UI** | Functional | Polished, collaborative |
| **Deep Learning** | Good (auto-log) | Excellent (gradients, graphs) |
| **Hyperparameter Sweeps** | Basic (via Optuna) | Native (Bayes, Hyperband) |
| **Model Registry** | Full lifecycle | Artifacts + aliases |
| **Data Versioning** | Limited | Artifacts (versioned) |
| **Team Features** | Basic | Reviews, reports, dashboards |
| **Cost at Scale** | Infrastructure only | Per-seat pricing |

---

## 6. DVC (Data & Model Versioning)

### Git for Data
```bash
# Initialize
dvc init
git add .dvc
git commit -m "Initialize DVC"

# Track large files
dvc add data/raw/train.parquet
git add data/raw/train.parquet.dvc .gitignore
git commit -m "Add raw training data"

# Remote storage (S3, GCS, SSH, etc.)
dvc remote add -d myremote s3://my-bucket/dvc-store
dvc push

# Pipeline (dvc.yaml)
# stages:
#   prepare:
#     cmd: python prepare.py
#     deps: [src/prepare.py, data/raw]
#     outs: [data/processed]
#   train:
#     cmd: python train.py
#     deps: [src/train.py, data/processed]
#     outs: [models/model.pkl]

dvc repro  # Run pipeline
dvc exp run  # Experiments
```

---

## 7. Structured Experiment Design

### Experiment Template
```python
# experiment_config.yaml
experiment:
  name: "churn_v2"
  description: "Testing deeper trees with class weighting"
  tags: ["v2", "class-imbalance"]

parameters:
  model:
    type: "RandomForestClassifier"
    n_estimators: 300
    max_depth: 15
    class_weight: "balanced"
    random_state: 42
  
  data:
    train_path: "s3://bucket/features/train.parquet"
    test_path: "s3://bucket/features/test.parquet"
    target_col: "churn"
    feature_cols: null  # all except target
  
  training:
    cv_folds: 5
    scoring: "roc_auc"

logging:
  mlflow_experiment: "churn-prediction"
  log_model: true
  log_feature_importance: true
  log_confusion_matrix: true
```

### Runner Script
```python
# run_experiment.py
import yaml
import mlflow
import mlflow.sklearn
import pandas as pd
from sklearn.model_selection import cross_val_score

with open("experiment_config.yaml") as f:
    config = yaml.safe_load(f)

mlflow.set_experiment(config['logging']['mlflow_experiment'])

with mlflow.start_run(run_name=config['experiment']['name']) as run:
    # Log all parameters (flattened)
    flat_params = flatten_dict(config['parameters'])
    mlflow.log_params(flat_params)
    
    # Log tags
    for tag in config['experiment'].get('tags', []):
        mlflow.set_tag(tag, "true")
    
    # Load data
    train = pd.read_parquet(config['parameters']['data']['train_path'])
    test = pd.read_parquet(config['parameters']['data']['test_path'])
    
    target = config['parameters']['data']['target_col']
    X_train, y_train = train.drop(target, axis=1), train[target]
    X_test, y_test = test.drop(target, axis=1), test[target]
    
    # Model
    model_class = getattr(__import__('sklearn.ensemble'), config['parameters']['model']['type'])
    model_params = {k: v for k, v in config['parameters']['model'].items() if k != 'type'}
    model = model_class(**model_params)
    
    # Cross-validation
    cv_scores = cross_val_score(
        model, X_train, y_train,
        cv=config['parameters']['training']['cv_folds'],
        scoring=config['parameters']['training']['scoring']
    )
    
    mlflow.log_metrics({
        "cv_mean": cv_scores.mean(),
        "cv_std": cv_scores.std(),
        **{f"cv_fold_{i}": s for i, s in enumerate(cv_scores)}
    })
    
    # Final fit
    model.fit(X_train, y_train)
    
    # Test metrics
    test_pred = model.predict(X_test)
    test_proba = model.predict_proba(X_test)[:, 1]
    
    mlflow.log_metrics({
        "test_accuracy": accuracy_score(y_test, test_pred),
        "test_roc_auc": roc_auc_score(y_test, test_proba),
    })
    
    # Feature importance
    if config['logging'].get('log_feature_importance'):
        importances = pd.Series(model.feature_importances_, index=X_train.columns)
        importances.nlargest(20).to_csv("feature_importance.csv")
        mlflow.log_artifact("feature_importance.csv")
    
    # Log model
    if config['logging'].get('log_model'):
        mlflow.sklearn.log_model(model, "model")
```

---

## 8. Hyperparameter Optimization Integration

### Optuna + MLflow
```python
import optuna
import mlflow

def objective(trial):
    with mlflow.start_run(nested=True):
        params = {
            "n_estimators": trial.suggest_int("n_estimators", 100, 500),
            "max_depth": trial.suggest_int("max_depth", 5, 20),
            "min_samples_split": trial.suggest_int("min_samples_split", 2, 20),
            "class_weight": trial.suggest_categorical("class_weight", [None, "balanced"]),
        }
        
        mlflow.log_params(params)
        
        model = RandomForestClassifier(**params, random_state=42)
        score = cross_val_score(model, X_train, y_train, cv=5, scoring="roc_auc").mean()
        
        mlflow.log_metric("cv_roc_auc", score)
        return score

study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=50)

# Best params logged in parent run
with mlflow.start_run(run_name="optuna-best"):
    mlflow.log_params(study.best_params)
    mlflow.log_metric("best_cv_score", study.best_value)
```

---

## 9. Reproducibility Checklist

| Aspect | Implementation |
|--------|----------------|
| **Code Version** | Git commit hash logged (`mlflow.log_param("git_commit", git_hash)`) |
| **Environment** | Conda env exported (`conda env export > env.yaml`) or Docker image |
| **Data Version** | DVC hash or S3 version ID logged |
| **Random Seeds** | All seeds (numpy, torch, python, sklearn) set and logged |
| **Hardware** | GPU type, CPU count logged |
| **Dependencies** | `pip freeze` or `conda list` saved as artifact |

### Auto-Capture Git Info
```python
import subprocess
import mlflow

def log_git_info():
    try:
        commit = subprocess.check_output(['git', 'rev-parse', 'HEAD']).decode().strip()
        branch = subprocess.check_output(['git', 'rev-parse', '--abbrev-ref', 'HEAD']).decode().strip()
        dirty = subprocess.check_output(['git', 'status', '--porcelain']).decode().strip()
        
        mlflow.log_params({
            "git_commit": commit,
            "git_branch": branch,
            "git_dirty": bool(dirty),
        })
    except:
        pass

with mlflow.start_run():
    log_git_info()
    # ... rest of experiment
```

---

## 10. Production Model Deployment from Registry

### MLflow Model Serving
```bash
# Serve model from registry
mlflow models serve -m "models:/ChurnPredictor/Production" -p 8080

# Or with Docker
mlflow models build-docker -m "models:/ChurnPredictor/Production" -n "churn-model"
docker run -p 8080:8080 churn-model
```

### CI/CD Promotion
```yaml
# .github/workflows/promote-model.yml
name: Promote Model

on:
  workflow_dispatch:
    inputs:
      model_name:
        required: true
      version:
        required: true
      target_stage:
        required: true
        type: choice
        options: [Staging, Production]

jobs:
  promote:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup MLflow
        run: pip install mlflow boto3
      
      - name: Transition Model Stage
        env:
          MLFLOW_TRACKING_URI: ${{ secrets.MLFLOW_URI }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_KEY }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET }}
        run: |
          python -c "
          import mlflow
          client = mlflow.MlflowClient()
          client.transition_model_version_stage(
              name='${{ github.event.inputs.model_name }}',
              version='${{ github.event.inputs.version }}',
              stage='${{ github.event.inputs.target_stage }}'
          )
          print('Model promoted successfully')
      "
```

---

## 11. Best Practices Summary

- [ ] **Every run has a purpose** (hypothesis documented in tags/notes)
- [ ] **Log parameters BEFORE training** (not after)
- [ ] **Log metrics per epoch/iteration** (not just final)
- [ ] **Log artifacts** (plots, confusion matrices, feature importance)
- [ ] **Use nested runs** for hyperparameter searches
- [ ] **Tag runs** (baseline, production-candidate, failed, deprecated)
- [ ] **Register promising models** immediately
- [ ] **Set up model staging** (Staging → Production with validation gate)
- [ ] **Monitor model performance in production** (data drift, concept drift)
- [ ] **Clean up failed runs** periodically (storage costs)
- [ ] **Backup tracking database** regularly