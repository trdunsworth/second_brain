# Diffusion Models: DDPM, DDIM, Score Matching

Diffusion models are a class of generative models that learn to reverse a gradual noising process. They achieve state-of-the-art sample quality and mode coverage.

## 1. Diffusion Process

### 1.1 Forward Process (Noising)
Gradually add Gaussian noise over $T$ timesteps:
$$q(x_t | x_{t-1}) = \mathcal{N}(x_t; \sqrt{1-\beta_t} x_{t-1}, \beta_t I)$$

Closed form for any $t$:
$$q(x_t | x_0) = \mathcal{N}(x_t; \sqrt{\bar{\alpha}_t} x_0, (1-\bar{\alpha}_t) I)$$
where $\alpha_t = 1 - \beta_t$, $\bar{\alpha}_t = \prod_{s=1}^t \alpha_s$

### 1.2 Reverse Process (Denoising)
Learn to reverse the noising:
$$p_\theta(x_{t-1} | x_t) = \mathcal{N}(x_{t-1}; \mu_\theta(x_t, t), \Sigma_\theta(x_t, t))$$

---

## 2. DDPM (Denoising Diffusion Probabilistic Models)

### 2.1 Parameterization
Predict noise $\epsilon$ instead of mean:
$$\mu_\theta(x_t, t) = \frac{1}{\sqrt{\alpha_t}} \left( x_t - \frac{\beta_t}{\sqrt{1-\bar{\alpha}_t}} \epsilon_\theta(x_t, t) \right)$$

### 2.2 Simplified Loss
$$L_{simple} = \mathbb{E}_{t, x_0, \epsilon} \left[ \| \epsilon - \epsilon_\theta(\sqrt{\bar{\alpha}_t} x_0 + \sqrt{1-\bar{\alpha}_t} \epsilon, t) \|^2 \right]$$

### 2.3 Implementation
```python
import torch
import torch.nn as nn

class DDPM(nn.Module):
    def __init__(self, model, timesteps=1000, beta_schedule='linear'):
        super().__init__()
        self.model = model
        self.timesteps = timesteps
        
        if beta_schedule == 'linear':
            self.betas = torch.linspace(1e-4, 0.02, timesteps)
        elif beta_schedule == 'cosine':
            self.betas = cosine_beta_schedule(timesteps)
        
        self.alphas = 1. - self.betas
        self.alphas_cumprod = torch.cumprod(self.alphas, dim=0)
        self.sqrt_alphas_cumprod = torch.sqrt(self.alphas_cumprod)
        self.sqrt_one_minus_alphas_cumprod = torch.sqrt(1. - self.alphas_cumprod)
    
    def forward(self, x_0):
        # Sample random timestep
        t = torch.randint(0, self.timesteps, (x_0.shape[0],), device=x_0.device)
        
        # Sample noise
        eps = torch.randn_like(x_0)
        
        # Forward process
        x_t = self.sqrt_alphas_cumprod[t].view(-1,1,1,1) * x_0 + \
              self.sqrt_one_minus_alphas_cumprod[t].view(-1,1,1,1) * eps
        
        # Predict noise
        eps_pred = self.model(x_t, t)
        
        # Loss
        loss = nn.MSELoss()(eps_pred, eps)
        return loss
    
    @torch.no_grad()
    def sample(self, shape, device):
        x = torch.randn(shape, device=device)
        for t in reversed(range(self.timesteps)):
            t_batch = torch.full((shape[0],), t, device=device, dtype=torch.long)
            eps_pred = self.model(x, t_batch)
            
            alpha_t = self.alphas[t]
            alpha_cumprod_t = self.alphas_cumprod[t]
            beta_t = self.betas[t]
            
            if t > 0:
                noise = torch.randn_like(x)
            else:
                noise = 0
            
            x = (1/torch.sqrt(alpha_t)) * (x - beta_t/torch.sqrt(1-alpha_cumprod_t)*eps_pred) + \
                torch.sqrt(beta_t) * noise
        return x
```

---

## 3. DDIM (Denoising Diffusion Implicit Models)

### 3.1 Key Idea
Non-Markovian reverse process with deterministic sampling:
$$x_{t-1} = \sqrt{\bar{\alpha}_{t-1}} \hat{x}_0 + \sqrt{1-\bar{\alpha}_{t-1} - \sigma_t^2} \epsilon_\theta + \sigma_t \epsilon$$

When $\sigma_t = 0$: **Deterministic** (faster sampling, 10-100x fewer steps)

### 3.2 DDIM Sampling
```python
@torch.no_grad()
def ddim_sample(self, shape, device, ddim_steps=50, eta=0.0):
    """eta=0: deterministic, eta=1: stochastic (DDPM)"""
    x = torch.randn(shape, device=device)
    
    # Subsample timesteps
    step = self.timesteps // ddim_steps
    timesteps = list(range(0, self.timesteps, step))[::-1]
    
    for i, t in enumerate(timesteps):
        t_batch = torch.full((shape[0],), t, device=device, dtype=torch.long)
        eps_pred = self.model(x, t_batch)
        
        alpha_t = self.alphas_cumprod[t]
        alpha_prev = self.alphas_cumprod[timesteps[i+1]] if i+1 < len(timesteps) else 1.0
        
        # Predict x_0
        x0_pred = (x - torch.sqrt(1 - alpha_t) * eps_pred) / torch.sqrt(alpha_t)
        
        # DDIM update
        sigma_t = eta * torch.sqrt((1 - alpha_prev) / (1 - alpha_t)) * \
                  torch.sqrt(1 - alpha_t / alpha_prev)
        
        x = torch.sqrt(alpha_prev) * x0_pred + \
            torch.sqrt(1 - alpha_prev - sigma_t**2) * eps_pred + \
            sigma_t * torch.randn_like(x)
    
    return x
```

### 3.3 Advantages
- **10-50x faster** sampling (10-50 steps vs 1000)
- **Deterministic** (reproducible, invertible)
- **Semantic interpolation** in latent space

---

## 4. Score-Based Generative Models (Score Matching)

### 4.1 Score Function
$$\nabla_x \log p_t(x) = \text{Score function}$$

### 4.2 Score Matching Objective
$$\mathcal{L} = \mathbb{E}_{p_t(x)} \left[ \| s_\theta(x, t) - \nabla_x \log p_t(x) \|^2 \right]$$

### 4.3 Denoising Score Matching (Vincent, 2011)
$$\mathcal{L} = \mathbb{E}_{p(x_0), q(x_t|x_0)} \left[ \| s_\theta(x_t, t) - \nabla_{x_t} \log q(x_t|x_0) \|^2 \right]$$

For Gaussian perturbation:
$$\nabla_{x_t} \log q(x_t|x_0) = -\frac{x_t - \sqrt{\bar{\alpha}_t} x_0}{1 - \bar{\alpha}_t} = \frac{\epsilon}{\sqrt{1-\bar{\alpha}_t}}$$

**Equivalent to DDPM noise prediction!**

### 4.4 Langevin Dynamics (Sampling)
$$x_{k+1} = x_k + \frac{\epsilon}{2} s_\theta(x_k, t) + \sqrt{\epsilon} z_k, \quad z_k \sim \mathcal{N}(0, I)$$

```python
def langevin_sampling(score_model, shape, device, n_steps=1000, step_size=1e-3):
    x = torch.randn(shape, device=device)
    for k in range(n_steps):
        t = torch.full((shape[0],), 1.0 - k/n_steps, device=device)
        score = score_model(x, t)
        x = x + 0.5 * step_size * score + torch.sqrt(step_size) * torch.randn_like(x)
    return x
```

---

## 5. Stochastic Differential Equations (SDEs)

### 5.1 Forward SDE
$$dx = f(x, t) dt + g(t) dw$$

**VP-SDE (Variance Preserving - DDPM):**
$$dx = -\frac{1}{2}\beta(t)x dt + \sqrt{\beta(t)} dw$$

**VE-SDE (Variance Exploding):**
$$dx = \sqrt{\frac{d}{dt}\sigma^2(t)} dw$$

### 5.2 Reverse SDE
$$dx = \left[ f(x, t) - g(t)^2 \nabla_x \log p_t(x) \right] dt + g(t) d\bar{w}$$

### 5.3 Probability Flow ODE (Deterministic)
$$\frac{dx}{dt} = f(x, t) - \frac{1}{2} g(t)^2 \nabla_x \log p_t(x)$$

```python
def probability_flow_ode(score_model, shape, device, n_steps=100):
    """Deterministic sampling via ODE"""
    x = torch.randn(shape, device=device)
    dt = -1.0 / n_steps
    for i in range(n_steps):
        t = torch.full((shape[0],), 1.0 + i*dt, device=device)
        score = score_model(x, t)
        # VP-SDE: f = -0.5*beta(t)*x, g = sqrt(beta(t))
        beta_t = beta_schedule(t)
        drift = -0.5 * beta_t.view(-1,1,1,1) * x - 0.5 * beta_t.view(-1,1,1,1) * score
        x = x + drift * dt
    return x
```

---

## 6. Flow Matching & Rectified Flow

### 6.1 Flow Matching (Lipman et al., 2022)
Learn vector field $v_t(x)$ that transports $p_0$ to $p_1$:
$$\frac{dx}{dt} = v_t(x), \quad x(0) \sim p_0, \quad x(1) \sim p_1$$

**Conditional Flow Matching Loss:**
$$\mathcal{L} = \mathbb{E}_{t, x_0, x_1} \left[ \| v_\theta(x_t, t) - (x_1 - x_0) \|^2 \right]$$

where $x_t = (1-t)x_0 + t x_1$ (linear interpolation)

### 6.2 Rectified Flow (Liu et al., 2022)
**Rectification:** Repeatedly re-train on generated paths to straighten trajectories.

```python
class RectifiedFlow(nn.Module):
    def __init__(self, model):
        super().__init__()
        self.model = model
    
    def forward(self, x_0, x_1, t):
        # Linear interpolation
        x_t = (1 - t) * x_0 + t * x_1
        v_target = x_1 - x_0
        v_pred = self.model(x_t, t)
        return F.mse_loss(v_pred, v_target)
    
    def rectify(self, x_0, n_steps=10):
        """Straighten the flow by re-training"""
        for _ in range(n_steps):
            # Generate trajectory
            x_t = self.sample_trajectory(x_0)
            # Re-train on straight path
            self.train_on_straight_paths(x_t)
```

### 6.3 Flow Matching Advantages
- **No SDE/ODE simulation** needed
- **Exact likelihood** via change of variables
- **Exact sampling** in 1 step (if vector field learned perfectly)
- **Flexible** interpolation paths (not just linear)

---

## 7. Improved Techniques

### 7.1 Noise Schedule
```python
def cosine_beta_schedule(timesteps, s=0.008):
    steps = timesteps + 1
    x = torch.linspace(0, timesteps, steps)
    alphas_cumprod = torch.cos(((x / timesteps) + s) / (1 + s) * torch.pi * 0.5) ** 2
    alphas_cumprod = alphas_cumprod / alphas_cumprod[0]
    betas = 1 - (alphas_cumprod[1:] / alphas_cumprod[:-1])
    return torch.clip(betas, 0, 0.999)

def sigmoid_beta_schedule(timesteps, start=-3, end=3, tau=1.0):
    steps = timesteps + 1
    t = torch.linspace(0, timesteps, steps)
    v_start = torch.tensor(start / tau).sigmoid()
    v_end = torch.tensor(end / tau).sigmoid()
    alphas_cumprod = (-((t / timesteps) * (end - start) + start) / tau).sigmoid()
    alphas_cumprod = (alphas_cumprod - v_end) / (v_start - v_end)
    betas = 1 - (alphas_cumprod[1:] / alphas_cumprod[:-1])
    return torch.clip(betas, 0, 0.999)
```

### 7.2 Classifier-Free Guidance (Ho & Salimans, 2022)
```python
def guided_sample(model, shape, device, guidance_scale=7.5, n_steps=50):
    """Classifier-free guidance: eps = eps_uncond + w * (eps_cond - eps_uncond)"""
    x = torch.randn(shape, device=device)
    
    for t in reversed(range(timesteps)):
        t_batch = torch.full((shape[0],), t, device=device)
        
        # Unconditional
        eps_uncond = model(x, t_batch, cond=None)
        
        # Conditional
        eps_cond = model(x, t_batch, cond=cond)
        
        # Guidance
        eps = eps_uncond + guidance_scale * (eps_cond - eps_uncond)
        
        # ... denoising step
```

### 7.3 Efficient Sampling
```python
# Progressive Distillation (Salimans & Ho, 2022)
# Train student to match teacher in fewer steps

# Consistency Models (Song et al., 2023)
# Directly learn one-step generation

# Adversarial Diffusion Distillation (ADD, 2024)
# Adversarial training for 1-4 step generation
```

---

## 8. Architecture: U-Net

### 8.1 Standard U-Net for Diffusion
```python
class UNet(nn.Module):
    def __init__(self, in_channels=3, out_channels=3, base_channels=128,
                 channel_mult=(1,2,4,8), num_res_blocks=2, attention_res=(16,)):
        super().__init__()
        
        # Time embedding
        self.time_mlp = nn.Sequential(
            SinusoidalPosEmb(base_channels),
            nn.Linear(base_channels, base_channels*4),
            nn.SiLU(),
            nn.Linear(base_channels*4, base_channels*4),
        )
        
        # Encoder
        self.downs = nn.ModuleList()
        ch = base_channels
        for i, mult in enumerate(channel_mult):
            out_ch = base_channels * mult
            for _ in range(num_res_blocks):
                self.downs.append(ResBlock(ch, out_ch, time_emb_dim=base_channels*4))
                ch = out_ch
            if i != len(channel_mult) - 1:
                self.downs.append(Downsample(ch))
        
        # Middle
        self.mid = nn.ModuleList([
            ResBlock(ch, ch, time_emb_dim=base_channels*4),
            AttentionBlock(ch),
            ResBlock(ch, ch, time_emb_dim=base_channels*4),
        ])
        
        # Decoder
        self.ups = nn.ModuleList()
        for i, mult in reversed(list(enumerate(channel_mult))):
            out_ch = base_channels * mult
            for _ in range(num_res_blocks + 1):
                self.ups.append(ResBlock(ch + out_ch, out_ch, time_emb_dim=base_channels*4))
                ch = out_ch
            if i != 0:
                self.ups.append(Upsample(ch))
        
        # Output
        self.final = nn.Sequential(
            nn.GroupNorm(32, ch),
            nn.SiLU(),
            nn.Conv2d(ch, out_channels, 3, padding=1)
        )
    
    def forward(self, x, t):
        t_emb = self.time_mlp(t)
        h = x
        hs = []
        
        # Down
        for layer in self.downs:
            if isinstance(layer, ResBlock):
                h = layer(h, t_emb)
            else:
                h = layer(h)
            hs.append(h)
        
        # Middle
        for layer in self.mid:
            h = layer(h, t_emb) if isinstance(layer, ResBlock) else layer(h)
        
        # Up
        for layer in self.ups:
            if isinstance(layer, ResBlock):
                h = layer(torch.cat([h, hs.pop()], dim=1), t_emb)
            else:
                h = layer(h)
        
        return self.final(h)
```

---

## 9. Evaluation Metrics

### 9.1 FID (Fréchet Inception Distance)
```python
from torchmetrics.image.fid import FrechetInceptionDistance

fid = FrechetInceptionDistance(feature=2048)
fid.update(real_images, real=True)
fid.update(fake_images, real=False)
fid_score = fid.compute()
```

### 9.2 IS (Inception Score)
```python
def inception_score(images, n_splits=10):
    """IS = exp(E[KL(p(y|x) || p(y))])"""
    pass
```

### 9.3 Precision & Recall (Kynkäänniemi et al.)
```python
def precision_recall(real_features, fake_features, k=3):
    """Based on k-NN in feature space"""
    pass
```

---

## 10. Key Takeaways

1. **DDPM** = Markov chain, noise prediction, 1000 steps, high quality
2. **DDIM** = Non-Markovian, deterministic, 10-50 steps, same quality
3. **Score Matching** = Learn $\nabla \log p$, equivalent to DDPM
4. **SDEs** = Continuous-time view, VP/VE/Sub-VP, Probability Flow ODE
5. **Flow Matching** = Learn vector field, straight paths, 1-step potential
6. **Rectified Flow** = Straighten paths via re-training
7. **Guidance** = Classifier-free (standard), classifier (original)
8. **Architecture** = U-Net with time embedding, attention at bottlenecks
8. **Evaluation** = FID, IS, Precision/Recall, human eval