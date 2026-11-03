# Convolutional Neural Networks (CNNs)

CNNs exploit **spatial locality** and **translation invariance** in image data through weight sharing and local receptive fields.

## 1. Core Operations

### Convolution
- **Kernel/Filter**: Learnable weights $\mathbf{K} \in \mathbb{R}^{C_{out} \times C_{in} \times k_h \times k_w}$
- **Stride**: Step size of filter sliding
- **Padding**: Zeros added around input to control output size
- **Dilation**: Spacing between kernel elements (atrous convolution)

**Output Size Formula**:
$$H_{out} = \left\lfloor \frac{H_{in} + 2P - D(k_h-1) - 1}{S} + 1 \right\rfloor$$

### Pooling
- **Max Pooling**: Takes maximum in window (preserves strong features)
- **Average Pooling**: Takes average (smoother)
- **Global Average Pooling (GAP)**: Reduces each channel to single number (replaces FC layers)

---

## 2. Architecture Evolution

| Architecture | Year | Key Innovation | Params |
|--------------|------|----------------|--------|
| **LeNet-5** | 1998 | First CNN (digits) | 60K |
| **AlexNet** | 2012 | ReLU, Dropout, GPU, Data Aug | 60M |
| **VGG** | 2014 | 3×3 conv stacks, depth | 138M |
| **GoogLeNet** | 2014 | Inception modules, 1×1 conv | 7M |
| **ResNet** | 2015 | **Residual connections** | 25M |
| **DenseNet** | 2017 | Dense skip connections | 20M |
| **EfficientNet** | 2019 | Compound scaling (depth/width/res) | 5-66M |
| **ConvNeXt** | 2022 | Modernized ResNet (LayerNorm, large kernels) | 28-600M |

---

## 3. Residual Blocks (The Critical Innovation)

```python
class BasicBlock(nn.Module):
    def __init__(self, in_channels, out_channels, stride=1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, 3, stride, 1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3, 1, 1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)
        
        # Shortcut connection (identity or projection)
        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, 1, stride, bias=False),
                nn.BatchNorm2d(out_channels)
            )
    
    def forward(self, x):
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += self.shortcut(x)  # Residual addition
        return F.relu(out)
```

**Why Residuals Work**:
- Gradient flows through identity path: $\frac{\partial L}{\partial x_l} = \frac{\partial L}{\partial x_{l+1}} (1 + \frac{\partial F}{\partial x_l})$
- Enables 1000+ layer networks
- Solves vanishing gradient in deep nets

---

## 4. Modern CNN Building Blocks

### Depthwise Separable Convolution (MobileNet)
```python
# Standard: C_in × C_out × K × K params
# Depthwise: C_in × K × K  (per channel)
# Pointwise: C_in × C_out × 1 × 1
# Total: C_in × K² + C_in × C_out  (massive reduction)

nn.Sequential(
    nn.Conv2d(in_ch, in_ch, 3, padding=1, groups=in_ch, bias=False),  # Depthwise
    nn.BatchNorm2d(in_ch),
    nn.ReLU(),
    nn.Conv2d(in_ch, out_ch, 1, bias=False),  # Pointwise
    nn.BatchNorm2d(out_ch),
    nn.ReLU()
)
```

### Inverted Residual (MobileNetV2)
```python
# Expand → Depthwise → Project
# Expansion ratio t (typically 6)
expand = in_ch * t
project = out_ch
```

### Squeeze-and-Excitation (SE Block)
```python
class SEBlock(nn.Module):
    def __init__(self, channels, reduction=16):
        super().__init__()
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Sequential(
            nn.Linear(channels, channels // reduction),
            nn.ReLU(),
            nn.Linear(channels // reduction, channels),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        b, c, _, _ = x.shape
        w = self.pool(x).view(b, c)
        w = self.fc(w).view(b, c, 1, 1)
        return x * w.expand_as(x)
```

---

## 5. Implementation (PyTorch)

### Custom CNN from Scratch
```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            # Block 1
            nn.Conv2d(3, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(),
            nn.Conv2d(32, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(),
            nn.MaxPool2d(2), nn.Dropout2d(0.1),
            
            # Block 2
            nn.Conv2d(32, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(),
            nn.Conv2d(64, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(),
            nn.MaxPool2d(2), nn.Dropout2d(0.2),
            
            # Block 3
            nn.Conv2d(64, 128, 3, padding=1), nn.BatchNorm2d(128), nn.ReLU(),
            nn.Conv2d(128, 128, 3, padding=1), nn.BatchNorm2d(128), nn.ReLU(),
            nn.AdaptiveAvgPool2d(1),  # GAP replaces FC
        )
        self.classifier = nn.Linear(128, num_classes)
    
    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)
```

### Using Pretrained Models (Transfer Learning)
```python
import torchvision.models as models

# 1. Load pretrained
model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)

# 2. Freeze backbone (optional)
for param in model.parameters():
    param.requires_grad = False

# 3. Replace head
num_features = model.fc.in_features
model.fc = nn.Sequential(
    nn.Dropout(0.5),
    nn.Linear(num_features, 512),
    nn.ReLU(),
    nn.BatchNorm1d(512),
    nn.Dropout(0.3),
    nn.Linear(512, num_classes)
)

# 4. Train only head first, then unfreeze
optimizer = torch.optim.Adam(model.fc.parameters(), lr=1e-3)
# ... train few epochs ...
# Unfreeze
for param in model.parameters():
    param.requires_grad = True
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4, weight_decay=1e-4)
```

---

## 6. Data Augmentation (Critical for CNNs)

```python
import torchvision.transforms as T
from torchvision.transforms import AutoAugment, AutoAugmentPolicy

# Training transforms
train_transform = T.Compose([
    T.RandomResizedCrop(224, scale=(0.08, 1.0)),
    T.RandomHorizontalFlip(),
    T.ColorJitter(0.4, 0.4, 0.4, 0.1),
    T.RandomApply([T.GaussianBlur(3)], p=0.5),
    T.RandomRotation(15),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    T.RandomErasing(p=0.25),  # Cutout
])

# Advanced: AutoAugment / RandAugment / TrivialAugment
train_transform = T.Compose([
    T.RandomResizedCrop(224),
    T.RandomHorizontalFlip(),
    AutoAugment(AutoAugmentPolicy.IMAGENET),
    T.ToTensor(),
    T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

# Validation transforms (deterministic)
val_transform = T.Compose([
    T.Resize(256),
    T.CenterCrop(224),
    T.ToTensor(),
    T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])
```

### Mixup / CutMix (Regularization)
```python
def mixup_data(x, y, alpha=1.0):
    lam = np.random.beta(alpha, alpha)
    batch_size = x.size(0)
    index = torch.randperm(batch_size).to(x.device)
    mixed_x = lam * x + (1 - lam) * x[index]
    y_a, y_b = y, y[index]
    return mixed_x, y_a, y_b, lam

def mixup_criterion(criterion, pred, y_a, y_b, lam):
    return lam * criterion(pred, y_a) + (1 - lam) * criterion(pred, y_b)

# In training loop:
mixed_x, y_a, y_b, lam = mixup_data(X_batch, y_batch)
logits = model(mixed_x)
loss = mixup_criterion(criterion, logits, y_a, y_b, lam)
```

---

## 7. Common Architectures for Tasks

| Task | Architecture | Head |
|------|--------------|------|
| **Classification** | ResNet/EfficientNet/ConvNeXt | GAP + FC |
| **Detection** | Faster R-CNN, YOLO, DETR | RPN + Box Head |
| **Segmentation** | U-Net, DeepLabV3+, Mask R-CNN | Decoder + Pixel-wise |
| **Pose Estimation** | HRNet, SimpleBaseline | Heatmap Regression |

---

## 8. Practical Tips

### Training Recipes
| Component | Recommendation |
|-----------|----------------|
| **Optimizer** | AdamW (lr=3e-4) or SGD (lr=0.1, momentum=0.9) |
| **Scheduler** | Cosine annealing + warmup (5-10 epochs) |
| **Batch Size** | 128-512 (larger = better BN stats, adjust LR) |
| **Epochs** | 100-300 (with early stopping) |
| **Weight Decay** | 1e-4 to 0.1 (AdamW: 0.05-0.1) |
| **Label Smoothing** | 0.1 (helps calibration) |
| **EMA** | Exponential Moving Average of weights (eval) |

### Debugging CNN Training
```python
# 1. Check gradient flow
def check_grad_flow(model):
    for n, p in model.named_parameters():
        if p.grad is not None:
            print(f"{n:40s} | grad norm: {p.grad.norm().item():.2e}")

# 2. Visualize filters
filters = model.features[0].weight.data.cpu()
plt.imshow(filters[0, 0].numpy(), cmap='gray')  # First filter, first channel

# 3. Check BatchNorm running stats
for m in model.modules():
    if isinstance(m, nn.BatchNorm2d):
        print(f"BN: mean={m.running_mean.mean():.3f}, var={m.running_var.mean():.3f}")
```

### Common Pitfalls
| Issue | Fix |
|-------|-----|
| **Train acc high, val acc low** | More augmentation, dropout, weight decay, less capacity |
| **Loss NaN** | Gradient clipping, lower LR, check data normalization |
| **BN error at eval** | Call `model.eval()` (uses running stats, not batch stats) |
| **Slow training** | Larger batch, mixed precision (`torch.cuda.amp`), compile (`torch.compile`) |
| **OOM** | Gradient accumulation, smaller batch, gradient checkpointing |

---

## 9. Modern CNN: ConvNeXt (2022) - "ResNet Modernized"
```python
# Key changes from ResNet:
# - Larger kernels (7×7) → mimics Vision Transformer patches
# - LayerNorm instead of BatchNorm
# - Inverted bottleneck (like MobileNetV2)
# - GELU instead of ReLU
# - Less downsampling stages
# - Stochastic depth regularization

import timm  # PyTorch Image Models library
model = timm.create_model('convnext_base', pretrained=True, num_classes=1000)
```

---

## 10. When NOT to Use CNNs
- **Global context needed** → Transformers (self-attention sees whole image)
- **Variable resolution/size** → ViT handles arbitrary patch counts
- **Very limited data** → Pretrained ViT often transfers better
- **Multi-modal (text+image)** → Transformers unify modalities