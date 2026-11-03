# Model Deployment

Moving from notebook to production involves serving models via APIs, containerization, and infrastructure considerations.

## 1. Deployment Patterns

| Pattern | Use Case | Latency | Complexity |
|---------|----------|---------|------------|
| **REST API (Sync)** | Real-time inference, low latency needs | ~10-100ms | Medium |
| **Batch Inference** | Large datasets, scheduled, high throughput | Minutes-hours | Low |
| **Streaming** | Event-driven, real-time features | <10ms | High |
| **Edge/On-device** | Mobile, IoT, offline, privacy | <5ms | High (model size) |
| **Async/Queue** | Long-running, variable load | Seconds | Medium |

---

## 2. Model Serialization Formats

### PyTorch
```python
# Option 1: Full model (architecture + weights) - Not recommended for prod
torch.save(model, 'model.pth')

# Option 2: State dict only (RECOMMENDED)
torch.save(model.state_dict(), 'model_weights.pth')
# Load: model.load_state_dict(torch.load('model_weights.pth'))

# Option 3: TorchScript (JIT compiled)
scripted = torch.jit.script(model)  # or torch.jit.trace(model, example_input)
scripted.save('model_ts.pt')
```

### ONNX (Open Neural Network Exchange) - **Cross-framework standard**
```python
import torch.onnx

dummy_input = torch.randn(1, 3, 224, 224)
torch.onnx.export(
    model, dummy_input, 'model.onnx',
    input_names=['input'], output_names=['output'],
    dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}},
    opset_version=17, do_constant_folding=True
)

# Verify
import onnx
onnx_model = onnx.load('model.onnx')
onnx.checker.check_model(onnx_model)
```

### TensorFlow SavedModel
```python
model.save('saved_model/', save_format='tf')
# Or TensorFlow Lite for edge
converter = tf.lite.TFLiteConverter.from_saved_model('saved_model/')
tflite_model = converter.convert()
```

### Safetensors (Fast, Safe, No Pickle)
```python
from safetensors.torch import save_file
save_file(model.state_dict(), 'model.safetensors')
```

---

## 3. FastAPI Service (Production REST API)

### Basic Structure
```python
# main.py
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional
import torch
import numpy as np
import uvicorn
from contextlib import asynccontextmanager

# Global model storage
model = None
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global model
    model = MyModel()
    model.load_state_dict(torch.load('model_weights.pth', map_location=device))
    model.to(device).eval()
    print("Model loaded")
    yield
    # Shutdown
    print("Shutting down")

app = FastAPI(title="ML Inference API", lifespan=lifespan)

# Request/Response schemas
class PredictionRequest(BaseModel):
    features: List[float] = Field(..., min_length=10, max_length=10)
    return_proba: bool = False

class PredictionResponse(BaseModel):
    prediction: int
    probability: Optional[float] = None
    model_version: str = "1.0.0"

# Health check
@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": model is not None}

# Prediction endpoint
@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    if model is None:
        raise HTTPException(503, "Model not loaded")
    
    try:
        with torch.no_grad():
            x = torch.tensor([request.features], dtype=torch.float32).to(device)
            logits = model(x)
            proba = torch.sigmoid(logits).item()
            pred = int(proba > 0.5)
        
        return PredictionResponse(
            prediction=pred,
            probability=proba if request.return_proba else None
        )
    except Exception as e:
        raise HTTPException(500, f"Inference error: {str(e)}")

# Batch prediction
@app.post("/predict/batch")
async def predict_batch(requests: List[PredictionRequest]):
    if model is None:
        raise HTTPException(503, "Model not loaded")
    
    batch = torch.tensor([r.features for r in requests], dtype=torch.float32).to(device)
    with torch.no_grad():
        logits = model(batch)
        probas = torch.sigmoid(logits).cpu().numpy()
        preds = (probas > 0.5).astype(int)
    
    return [
        {"prediction": int(p), "probability": float(prob)} 
        for p, prob in zip(preds, probas)
    ]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, workers=4)
```

### Production Enhancements
```python
# 1. Request validation with custom validators
from pydantic import validator

class PredictionRequest(BaseModel):
    features: List[float]
    
    @validator('features')
    def check_feature_range(cls, v):
        if any(x < -10 or x > 10 for x in v):
            raise ValueError('Features must be in [-10, 10]')
        return v

# 2. Async inference for I/O bound preprocessing
@app.post("/predict/async")
async def predict_async(request: PredictionRequest, background_tasks: BackgroundTasks):
    # For long preprocessing, offload to background
    pass

# 3. Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)

@app.post("/predict")
@limiter.limit("100/minute")
async def predict(request: Request, payload: PredictionRequest):
    ...

# 4. Structured logging
import structlog
logger = structlog.get_logger()

@app.post("/predict")
async def predict(payload: PredictionRequest):
    logger.info("prediction_request", features_len=len(payload.features))
    ...
    logger.info("prediction_complete", prediction=pred, latency_ms=latency)
```

---

## 4. Docker Containerization

### Multi-stage Dockerfile
```dockerfile
# ---- Build Stage ----
FROM python:3.11-slim as builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ---- Runtime Stage ----
FROM python:3.11-slim

# Security: non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser
WORKDIR /app

# Copy dependencies
COPY --from=builder /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH

# Copy application
COPY --chown=appuser:appuser . .

# Model weights (consider mounting at runtime for large models)
COPY --chown=appuser:appuser model_weights.pth .

USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Requirements
```txt
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
torch==2.2.0 --index-url https://download.pytorch.org/whl/cpu
pydantic==2.5.3
numpy==1.26.0
structlog==24.1.0
slowapi==0.1.9
```

### Build & Run
```bash
docker build -t ml-api:latest .
docker run -d -p 8000:8000 --name ml-api \
    -v $(pwd)/model_weights.pth:/app/model_weights.pth:ro \
    ml-api:latest
```

---

## 5. ONNX Runtime (High-Performance Inference)

```python
import onnxruntime as ort
import numpy as np

# Session options for optimization
sess_options = ort.SessionOptions()
sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
sess_options.intra_op_num_threads = 4

# Providers: CUDAExecutionProvider, CPUExecutionProvider, TensorrtExecutionProvider
session = ort.InferenceSession(
    'model.onnx', 
    sess_options=sess_options,
    providers=['CUDAExecutionProvider', 'CPUExecutionProvider']
)

# Inference
input_name = session.get_inputs()[0].name
output_name = session.get_outputs()[0].name

def predict_onnx(features: np.ndarray) -> np.ndarray:
    # Ensure correct dtype
    features = features.astype(np.float32)
    if features.ndim == 1:
        features = features.reshape(1, -1)
    return session.run([output_name], {input_name: features})[0]
```

---

## 6. NVIDIA Triton Inference Server (Enterprise Scale)

### Model Repository Structure
```
/models
  /my_model
    /1
      model.onnx
    config.pbtxt
```

### config.pbtxt
```protobuf
name: "my_model"
backend: "onnxruntime"
max_batch_size: 32
input [
  {
    name: "input"
    data_type: TYPE_FP32
    dims: [ -1, 10 ]  # -1 = batch dimension
  }
]
output [
  {
    name: "output"
    data_type: TYPE_FP32
    dims: [ -1, 1 ]
  }
]
instance_group [
  {
    count: 2
    kind: KIND_GPU
    gpus: [0, 1]
  }
]
dynamic_batching {
  max_queue_delay_microseconds: 100
  preferred_batch_size: [8, 16, 32]
}
```

### Client Usage
```python
import tritonclient.http as httpclient

client = httpclient.InferenceServerClient(url="localhost:8000")

inputs = httpclient.InferInput("input", [1, 10], "FP32")
inputs.set_data_from_numpy(np.array([[1.0]*10], dtype=np.float32))

outputs = [httpclient.InferRequestedOutput("output")]
result = client.infer("my_model", inputs, outputs=outputs)
prediction = result.as_numpy("output")
```

---

## 7. Model Serving Comparison

| Aspect | FastAPI | ONNX Runtime | Triton |
|--------|---------|--------------|--------|
| **Setup Complexity** | Low | Low | High |
| **Throughput** | Medium | High | Very High |
| **Dynamic Batching** | Manual | Manual | Built-in |
| **Model Management** | Manual | Manual | Repository-based |
| **Multi-model** | Manual | Manual | Native |
| **Metrics** | Custom | Custom | Prometheus built-in |
| **GPU Sharing** | Manual | Manual | MIG support |
| **Best For** | Simple APIs, custom logic | High-perf single model | Enterprise, multi-model, high throughput |

---

## 8. Edge Deployment

### TensorRT (NVIDIA GPU Optimization)
```python
# Convert ONNX to TensorRT engine
import tensorrt as trt

logger = trt.Logger(trt.Logger.WARNING)
builder = trt.Builder(logger)
network = builder.create_network(1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH))
parser = trt.OnnxParser(network, logger)

with open('model.onnx', 'rb') as f:
    parser.parse(f.read())

config = builder.create_builder_config()
config.set_memory_pool_limit(trt.MemoryPoolType.WORKSPACE, 1 << 30)  # 1GB
config.set_flag(trt.BuilderFlag.FP16)  # FP16 precision

engine = builder.build_serialized_network(network, config)
with open('model.trt', 'wb') as f:
    f.write(engine)
```

### ONNX Runtime Mobile / TensorFlow Lite
```python
# TFLite with quantization
converter = tf.lite.TFLiteConverter.from_saved_model('saved_model/')
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.float16]
tflite_model = converter.convert()
```

---

## 9. Monitoring & Observability

### Prometheus Metrics in FastAPI
```python
from prometheus_client import Counter, Histogram, generate_latest
from fastapi import Response

REQUEST_COUNT = Counter('http_requests_total', 'Total requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'Request latency', ['endpoint'])
MODEL_LATENCY = Histogram('model_inference_duration_seconds', 'Model inference latency')

@app.post("/predict")
async def predict(payload: PredictionRequest):
    with REQUEST_LATENCY.labels('/predict').time():
        with MODEL_LATENCY.time():
            # ... inference
        REQUEST_COUNT.labels('POST', '/predict', '200').inc()
        return response

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### Health Checks
```python
@app.get("/health")
async def health():
    checks = {
        "model_loaded": model is not None,
        "gpu_available": torch.cuda.is_available(),
        "disk_space": check_disk_space(),
        "memory_usage": check_memory()
    }
    status = "healthy" if all(checks.values()) else "degraded"
    return {"status": status, "checks": checks}
```

---

## 10. CI/CD for Deployment

### GitHub Actions (Simplified)
```yaml
# .github/workflows/deploy.yml
name: Deploy ML API

on:
  push:
    tags: ['v*']

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build -t ${{ secrets.REGISTRY }}/ml-api:${{ github.ref_name }} .
      
      - name: Run tests
        run: docker run --rm ${{ secrets.REGISTRY }}/ml-api:${{ github.ref_name }} pytest
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push ${{ secrets.REGISTRY }}/ml-api:${{ github.ref_name }}
      
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/ml-api ml-api=${{ secrets.REGISTRY }}/ml-api:${{ github.ref_name }}
          kubectl rollout status deployment/ml-api
```

---

## 11. A/B Testing / Canary Deployment

```python
# Simple A/B routing in FastAPI
import random

@app.post("/predict")
async def predict(payload: PredictionRequest):
    # 90% traffic to v1, 10% to v2 (canary)
    use_v2 = random.random() < 0.1
    
    if use_v2:
        model = model_v2
        version = "2.0.0-canary"
    else:
        model = model_v1
        version = "1.0.0"
    
    # Track which version for analysis
    logger.info("model_version_used", version=version)
    ...
```

---

## 12. Security Checklist

- [ ] **Input validation** (Pydantic schemas, size limits)
- [ ] **Rate limiting** (prevent abuse)
- [ ] **Authentication** (API keys, JWT, OAuth2)
- [ ] **HTTPS only** (TLS termination at load balancer)
- [ ] **Non-root containers** (Docker USER directive)
- [ ] **Read-only filesystem** (Docker `--read-only`)
- [ ] **Resource limits** (CPU/Memory limits in K8s)
- [ ] **Model integrity** (checksums, signed models)
- [ ] **Audit logging** (who requested what, when)
- [ ] **Data privacy** (PII handling, encryption at rest)