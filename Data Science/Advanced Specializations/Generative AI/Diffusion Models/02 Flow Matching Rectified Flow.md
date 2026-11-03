# Flow Matching & Rectified Flow

Flow matching provides a simulation-free framework for training continuous normalizing flows. Rectified Flow straightens the probability paths for faster sampling.

## 1. Flow Matching Theory

### 1.1 Continuous Normalizing Flows (CNF)
$$\frac{dx}{dt} = v_t(x), \quad x(0) \sim p_0, \quad x(1) \sim p_1$$

**Change of variables:**
$$\log p_1(x(1)) = \log p_0(x(0)) - \int_0^1 \nabla \cdot v_t(x(t)) dt$$

### 1.2 Flow Matching Objective (Lipman et al., 2022)
Directly regress the vector field without simulating trajectories:

$$\mathcal{L}_{FM}(\theta) = \mathbb{E}_{t \sim U[0,1], x_0 \sim p_0, x_1 \sim p_1} \left[ \| v_\theta(x_t, t) - (x_1 - x_0) \|^2 \right]$$

where $x_t = \psi_t(x_0, x_1)$ is a **probability path** connecting $x_0$ to $x_1$.

### 1.3 Conditional Flow Matching
Instead of marginal $p_t$, use conditional paths $\psi_t(x|x_1)$:

$$\mathcal{L}_{CFM}(\theta) = \mathbb{E}_{t, x_0, x_1} \left[ \| v_\theta(x_t, t) - \nabla_t \psi_t(x_0|x_1) \|^2 \right]$$

**Optimal transport:** $\psi_t(x_0|x_1) = (1-t)x_0 + t x_1$ (linear interpolation)
$$\nabla_t \psi_t = x_1 - x_0$$

**Loss simplifies to:**
$$\mathcal{L} = \mathbb{E}_{t, x_0, x_1} \left[ \| v_\theta((1-t)x_0 + t x_1, t) - (x_1 - x_0) \|^2 \right]$$

---

## 2. Rectified Flow (Liu et al., 2022)

### 2.1 Core Idea
Repeatedly re-train the flow on its own generated paths to **straighten** trajectories.

### 2.2 Rectification Algorithm
```python
def rectified_flow_training(model, data_loader, n_rectifications=5, n_epochs=10):
    """
    Rectified Flow training procedure:
    1. Train initial flow on data
    2. For each rectification step:
       a. Generate trajectories using current model
       b. Re-train on straight paths from these trajectories
    """
    for rect_step in range(n_rectifications):
        print(f"Rectification step {rect_step + 1}")
        
        # Generate trajectories using current model
        trajectories = generate_trajectories(model, data_loader, n_samples=10000)
        
        # Create straight paths from trajectories
        straight_data = create_straight_paths(trajectories)
        
        # Re-train on straight paths
        train_on_straight_paths(model, straight_data, n_epochs)
```

### 2.3 Rectification Effect
- **1st rectification:** Curved paths → Straighter
- **2nd+ rectification:** Nearly straight paths
- **Result:** Near-deterministic sampling in **1 step**

```python
def rectified_flow_sampling(model, x_0, n_steps=1):
    """Sample in 1 step with rectified flow"""
    with torch.no_grad():
        t = torch.zeros(x_0.shape[0])
        v = model(x_0, t)
        x_1 = x_0 + v  # Single step!
    return x_1
```

---

## 3. Stochastic Interpolants & OT-CFM

### 3.1 Stochastic Interpolants (Albergo & Vanden-Eijnden, 2022)
Generalize deterministic paths to **stochastic paths**:

$$d x_t = b_t(x_t) dt + \sigma_t d w_t$$

**Optimal drift:** $b_t(x) = \nabla_x \log p_t(x) + \dots$ (Schrödinger bridge)

### 3.2 OT-CFM (Optimal Transport Conditional Flow Matching)
Uses **optimal transport coupling** $\pi(x_0, x_1)$:

```python
def ot_cfm_loss(model, x_0, x_1):
    """Use OT coupling instead of independent sampling"""
    # Compute OT plan (Sinkhorn)
    from geomloss import SamplesLoss
    ot_loss = SamplesLoss("sinkhorn", p=2, blur=0.05)
    pi = ot_loss(x_0, x_1)
    
    # Sample from coupling
    x_0_ot, x_1_ot = sample_from_pi(pi)
    
    # Standard CFM loss
    t = torch.rand(len(x_0_ot))
    x_t = (1-t)[:,None,None,None] * x_0_ot + t[:,None,None,None] * x_1_ot
    v_pred = model(x_t, t)
    v_target = x_1_ot - x_0_ot
    
    return F.mse_loss(v_pred, v_target)
```

### 3.3 Benefits
- **Lower variance** gradients
- **Faster convergence**
- **Better sample quality** for same compute

---

## 4. Rectified Flow Implementation Details

### 4.1 Training Pipeline
```python
class RectifiedFlowTrainer:
    def __init__(self, model, data_loader, device, 
                 n_rectifications=3, epochs_per_rect=50):
        self.model = model
        self.data_loader = data_loader
        self.device = device
        self.n_rectifications = n_rectifications
        self.epochs_per_rect = epochs_per_rect
    
    def train(self):
        optimizer = torch.optim.AdamW(self.model.parameters(), lr=1e-4)
        
        for rect in range(self.n_rectifications):
            print(f"=== Rectification {rect+1}/{self.n_rectifications} ===")
            
            if rect > 0:
                # Generate new training data from current model
                self.data_loader = self.generate_rectified_data()
            
            for epoch in range(self.epochs_per_rect):
                for batch in self.data_loader:
                    x_0, x_1 = batch
                    x_0, x_1 = x_0.to(self.device), x_1.to(self.device)
                    
                    # Random timestep
                    t = torch.rand(len(x_0), device=self.device)
                    
                    # Interpolate
                    x_t = (1-t)[:,None,None,None] * x_0 + t[:,None,None,None] * x_1
                    
                    # Predict velocity
                    v_pred = self.model(x_t, t)
                    v_target = x_1 - x_0
                    
                    loss = F.mse_loss(v_pred, v_target)
                    
                    optimizer.zero_grad()
                    loss.backward()
                    optimizer.step()
    
    def generate_rectified_data(self, n_samples=50000):
        """Generate straight paths using current model"""
        self.model.eval()
        new_data = []
        
        with torch.no_grad():
            for _ in range(n_samples // self.data_loader.batch_size):
                x_0 = torch.randn(self.data_loader.batch_size, *self.data_shape)
                
                # Use current model to generate x_1
                # Straight path: x_1 = x_0 + v(x_0, 0)
                v = self.model(x_0.to(self.device), torch.zeros(len(x_0), device=self.device))
                x_1 = x_0 + v.cpu()
                
                new_data.append((x_0, x_1))
        
        self.model.train()
        return new_data
```

### 4.2 Inference (1-Step Generation)
```python
@torch.no_grad()
def rectified_flow_sample(model, n_samples, shape, device, n_steps=1):
    """Generate samples in 1 step with rectified flow"""
    model.eval()
    
    # Sample from prior
    x = torch.randn(n_samples, *shape, device=device)
    
    if n_steps == 1:
        # Single step (fully rectified)
        t = torch.zeros(n_samples, device=device)
        v = model(x, t)
        x_1 = x + v
    else:
        # Multi-step (partially rectified)
        dt = 1.0 / n_steps
        for i in range(n_steps):
            t = torch.full((n_samples,), i * dt, device=device)
            v = model(x, t)
            x = x + v * dt
    
    return x
```

---

## 5. Advanced Variants

### 5.1 Mixture of Rectified Flows
```python
class MixtureRectifiedFlow(nn.Module):
    def __init__(self, n_components=4):
        super().__init__()
        self.flows = nn.ModuleList([
            RectifiedFlowModel() for _ in range(n_components)
        ])
        self.gate = nn.Linear(condition_dim, n_components)
    
    def forward(self, x, t, cond):
        weights = F.softmax(self.gate(cond), dim=-1)
        velocities = torch.stack([f(x, t) for f in self.flows], dim=1)
        return (weights.unsqueeze(-1) * velocities).sum(dim=1)
```

### 5.2 Conditional Rectified Flow
```python
class ConditionalRectifiedFlow(nn.Module):
    def __init__(self, base_model, condition_dim):
        super().__init__()
        self.base = base_model
        self.cond_proj = nn.Linear(condition_dim, hidden_dim)
    
    def forward(self, x, t, cond):
        # Project condition
        cond_emb = self.cond_proj(cond)
        
        # Modulate velocity
        v = self.base(x, t, cond_emb)
        return v
```

### 5.3 Rectified Flow with Guidance
```python
def guided_rectified_flow(model, x_0, cond, uncond, guidance_scale=7.5):
    """Classifier-free guidance for rectified flow"""
    with torch.no_grad():
        # Conditional velocity
        v_cond = model(x_0, torch.zeros_like(x_0[:,0]), cond)
        
        # Unconditional velocity
        v_uncond = model(x_0, torch.zeros_like(x_0[:,0]), uncond)
        
        # Guidance
        v = v_uncond + guidance_scale * (v_cond - v_uncond)
        
        x_1 = x_0 + v
    return x_1
```

---

## 6. Rectified Flow vs Other Methods

| Method | Training | Sampling Steps | Deterministic | Theory |
|--------|----------|----------------|---------------|--------|
| **DDPM** | Noise prediction | 1000 | No | ELBO |
| **DDIM** | Noise prediction | 10-50 | Yes (η=0) | Non-Markovian |
| **Score Matching** | Score prediction | 100-1000 | No/Yes (ODE) | Score matching |
| **Flow Matching** | Vector field | 10-100 | Yes | Conditional FM |
| **Rectified Flow** | Vector field | **1-4** | Yes | Simulation-free |
| **Consistency Models** | Self-consistency | **1** | Yes | Consistency |

---

## 6. Practical Implementation

### 6.1 Complete Training Script
```python
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR

def train_rectified_flow(config):
    # Setup
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = RectifiedFlowUNet(config).to(device)
    optimizer = AdamW(model.parameters(), lr=config.lr, weight_decay=1e-4)
    scheduler = CosineAnnealingLR(optimizer, T_max=config.epochs)
    
    # Data
    train_loader = DataLoader(config.train_dataset, batch_size=config.batch_size, 
                              shuffle=True, num_workers=4, pin_memory=True)
    
    # Rectification loop
    for rect_step in range(config.n_rectifications):
        print(f"Rectification {rect_step+1}/{config.n_rectifications}")
        
        if rect_step > 0:
            # Generate rectified dataset
            train_loader = generate_rectified_loader(model, config)
        
        # Train
        for epoch in range(config.epochs_per_rect):
            model.train()
            epoch_loss = 0
            
            for x_0, x_1 in train_loader:
                x_0, x_1 = x_0.to(device), x_1.to(device)
                
                t = torch.rand(len(x_0), device=device)
                x_t = (1-t)[:,None,None,None] * x_0 + t[:,None,None,None] * x_1
                
                v_pred = model(x_t, t)
                v_target = x_1 - x_0
                
                loss = F.mse_loss(v_pred, v_target)
                
                optimizer.zero_grad()
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                optimizer.step()
                
                epoch_loss += loss.item()
            
            scheduler.step()
            print(f"Rect {rect_step+1}, Epoch {epoch+1}, Loss: {epoch_loss/len(train_loader):.6f}")
    
    return model
```

### 6.2 Evaluation
```python
def evaluate_rectified_flow(model, test_loader, device):
    model.eval()
    metrics = {}
    
    # 1-step generation quality
    with torch.no_grad():
        for x_0, _ in test_loader:
            x_0 = x_0.to(device)
            x_1 = rectified_flow_sample(model, x_0, n_steps=1)
            
            # FID, IS, etc.
            fid = compute_fid(x_1, test_loader.dataset.real_images)
            metrics['fid_1step'] = fid
    
    # Multi-step for comparison
    for n_steps in [2, 4, 8]:
        with torch.no_grad():
            for x_0, _ in test_loader:
                x_1 = rectified_flow_sample(model, x_0.to(device), n_steps=n_steps)
                fid = compute_fid(x_1, test_loader.dataset.real_images)
                metrics[f'fid_{n_steps}step'] = fid
    
    return metrics
```

---

## 7. Key Takeaways

1. **Flow Matching** = Regression on vector field, no simulation needed
2. **Rectified Flow** = Re-train on own trajectories to straighten paths
3. **1-4 step sampling** = After 2-3 rectifications
3. **OT-CFM** = Optimal transport coupling for lower variance
4. **Rectified Flow** = Deterministic, exact likelihood via ODE
5. **Advantages over Diffusion**: Faster sampling, no SDE/ODE simulation, exact likelihood
6. **Implementation**: Standard U-Net, MSE loss on velocity, rectification loop
7. **Guidance**: Classifier-free guidance works identically