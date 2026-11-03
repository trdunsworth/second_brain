# 3D Generation Models

3D generation covers 3D asset creation (meshes, NeRFs, Gaussian Splats) from text, images, or other 3D data.

## 1. 3D Generation Taxonomy

```
3D Generation
├── Representation
│   ├── Explicit: Meshes, Point Clouds, Voxels
│   ├── Implicit: NeRFs, SDFs, Occupancy Networks
│   ├── Hybrid: 3D Gaussian Splatting, Tri-planes
│   └── Generative Primitives: Tetrahedra, Cuboids
├── Conditioning
│   ├── Text-to-3D (DreamFusion, SJC, MVDream)
│   ├── Image-to-3D (Zero123, LRM, TripoSR)
│   ├── Text-to-Mesh (GET3D, MeshDiffusion)
│   ├── Image-to-Mesh (Sparse Fusion, FlexiCubes)
│   └── 3D-to-3D (Completion, Stylization)
├── Methodology
│   ├── Score Distillation Sampling (SDS)
│   ├── Variational Score Distillation (VSD)
│   ├── Direct Generation (LRM, TripoSR, LGM)
│   ├── Diffusion in 3D Space (3D Diffusion)
│   └── Gaussian Splatting Optimization
└── Output Format
    ├── NeRF / Mip-NeRF
    ├── 3D Gaussian Splatting (3DGS)
    ├── Textured Mesh (.obj, .glb, .usdz)
    ├── Point Cloud
    ├── Voxel Grid
    └── Implicit Fields (SDF, Occupancy)
```

---

## 2. Score Distillation Sampling (SDS)

### 2.1 Core Idea (DreamFusion)
Use pre-trained 2D diffusion model as prior to optimize 3D representation:
$$\nabla_\theta \mathcal{L}_{SDS} = \mathbb{E}_{t,\epsilon} \left[ w(t) (\epsilon_\theta(x_t; y, t) - \epsilon) \frac{\partial x_t}{\partial \theta} \right]$$

```python
class ScoreDistillationSampling:
    def __init__(self, diffusion_model, guidance_scale=7.5):
        self.diffusion = diffusion_model
        self.guidance_scale = guidance_scale
    
    def compute_sds_loss(self, renderers, camera_poses, prompt_emb, 
                         neg_prompt_emb, timestep):
        """
        renderers: differentiable renderers (NeRF, 3DGS, etc.)
        camera_poses: (B, 4, 4) camera matrices
        """
        # 1. Render from multiple views
        images = []
        for pose in camera_poses:
            img = renderers(pose)  # Differentiable rendering
            images.append(img)
        images = torch.stack(images)  # (V, 3, H, W)
        
        # 2. Add noise
        t = timestep
        noise = torch.randn_like(images)
        noisy_images = self.add_noise(images, noise, t)
        
        # 3. Predict noise with diffusion model
        with torch.no_grad():
            eps_pred = self.diffusion(unet(noisy_images, t, prompt_emb))
            eps_uncond = self.diffusion(unet(noisy_images, t, neg_prompt_emb))
        
        # Guidance
        eps = eps_uncond + self.guidance_scale * (eps_pred - eps_uncond)
        
        # 4. SDS Gradient
        loss = (eps - noise).detach() * images
        return loss.mean()
```

### 2.2 Variational Score Distillation (VSD)
```python
# VSD: Add KL regularization to prevent overfitting
def vsd_loss(renderer, camera_poses, prompt_emb, timestep, 
             posterior_kl_weight=0.1):
    # Standard SDS
    sds_loss = sds_loss_fn(renderer, camera_poses, prompt_emb, timestep)
    
    # KL regularization (match prior)
    kl_loss = kl_divergence(renderer, prior)
    
    return sds_loss + posterior_kl_weight * kl_loss
```

---

## 3. Direct 3D Generation (Feed-Forward)

### 3.1 Large Reconstruction Models (LRM)
```python
# LRM: Large Reconstruction Model (single image -> 3D in 0.5s)
class LRM(nn.Module):
    def __init__(self, encoder, triplane_decoder):
        super().__init__()
        self.encoder = encoder  # ViT encoder
        self.triplane_decoder = triplane_decoder
    
    def forward(self, image):
        # image: (B, 3, H, W)
        features = self.encoder(image)  # (B, N, D)
        triplane = self.triplane_decoder(features)  # (B, 3, C, H, W)
        return triplane

# Tri-plane representation: 3 orthogonal planes (XY, YZ, ZX)
# Each plane: (C, H, W) feature map
# Query: sample from 3 planes, sum features, decode via MLP
```

### 3.2 TripoSR (Fast Feed-Forward)
```python
# TripoSR: Sparse Tri-plane Reconstruction (sub-second)
class TripoSR(nn.Module):
    def __init__(self, encoder, sparse_decoder):
        super().__init__()
        self.encoder = encoder  # ViT-L/14
        self.sparse_decoder = sparse_decoder  # Sparse tri-plane
    
    def forward(self, image):
        # Sparse tri-plane: only allocate voxels near surface
        sparse_triplane = self.sparse_decoder(self.encoder(image))
        return sparse_triplane

# Inference: ~0.5s for full 3D reconstruction
```

### 3.3 LGM (Large Gaussian Model)
```python
# LGM: Large Gaussian Model (direct 3D Gaussian prediction)
class LGM(nn.Module):
    def __init__(self, encoder, gaussian_head):
        super().__init__()
        self.encoder = encoder
        self.gaussian_head = gaussian_head  # Predicts 3D Gaussians
    
    def forward(self, image):
        # Predict 3D Gaussians directly: (B, N, 14)
        # [xyz, rgb, opacity, scale_xyz, rot_quat]
        gaussians = self.gaussian_head(self.encoder(image))
        return gaussians
```

---

## 4. 3D Gaussian Splatting (3DGS)

### 4.1 3D Gaussian Representation
```python
class GaussianModel:
    def __init__(self, num_points=100000):
        self.xyz = nn.Parameter(torch.randn(num_points, 3))  # Position
        self.features_dc = nn.Parameter(torch.randn(num_points, 3))  # DC color
        self.features_rest = nn.Parameter(torch.randn(num_points, 15, 3))  # SH coeffs
        self.opacity = nn.Parameter(torch.zeros(num_points, 1))
        self.scale = nn.Parameter(torch.zeros(num_points, 3))
        self.rotation = nn.Parameter(torch.zeros(num_points, 4))  # quaternion
    
    def get_covariance(self):
        # Scale + Rotation -> Covariance matrix
        S = torch.diag_embed(torch.exp(self.scale))
        R = quat_to_rotmat(self.rotation)
        return R @ S @ S.transpose(-1, -2) @ R.transpose(-1, -2)
```

### 4.2 Differentiable Rasterization
```python
# Gaussian Rasterization (CUDA kernel)
def rasterize_gaussians(gaussians, cameras):
    """
    Project 3D Gaussians to 2D, sort by depth, alpha blend
    """
    # 1. Project to screen space
    # 2. Compute 2D covariance
    # 3. Sort by depth (back to front)
    # 4. Alpha blend
    return rendered_image, depth_map, alpha_map

# Differentiable: gradients flow to Gaussian parameters
```

### 4.3 3DGS Optimization
```python
def train_3dgs(images, cameras, iterations=30000):
    gaussians = GaussianModel()
    optimizer = torch.optim.Adam([
        {'params': gaussians.xyz, 'lr': 1.6e-4},
        {'params': gaussians.features_dc, 'lr': 2.5e-3},
        {'params': gaussians.opacity, 'lr': 5e-3},
        {'params': gaussians.scale, 'lr': 5e-3},
        {'params': gaussians.rotation, 'lr': 1e-3},
    ])
    
    for iter in range(iterations):
        # Random camera
        cam = random_camera(cameras)
        
        # Render
        render = rasterize_gaussians(gaussians, cam)
        
        # Loss
        loss = F.l1_loss(render, target_image) + \
               0.01 * F.l1_loss(render, target_image)  # SSIM
        
        loss.backward()
        optimizer.step()
        
        # Densification / Pruning
        if iter % 100 == 0:
            gaussians.densify_and_prune()
```

---

## 5. NeRF & Implicit Representations

### 5.1 NeRF (Neural Radiance Fields)
```python
class NeRF(nn.Module):
    def __init__(self, D=8, W=256, skips=[4]):
        super().__init__()
        self.pos_enc = PositionalEncoding(10)  # 3D pos -> 60D
        self.dir_enc = PositionalEncoding(4)   # View dir -> 24D
        
        # Coarse network
        self.pts_linears = nn.ModuleList(
            [nn.Linear(W, W)] * D
        )
        self.views_linears = nn.ModuleList([nn.Linear(W, W)])
        
        self.output = nn.Linear(W, 4)  # RGB + density
    
    def forward(self, x, d):
        # x: (N, 3), d: (N, 3)
        x_enc = self.pos_enc(x)
        d_enc = self.dir_enc(d)
        
        h = x_enc
        for i, l in enumerate(self.pts_linears):
            h = F.relu(l(h))
            if i in self.skips:
                h = torch.cat([h, x_enc], -1)
        
        sigma = self.output[:, :1]
        rgb = self.output[:, 1:]
        return rgb, sigma

# Volume rendering
def render_rays(nerf, rays_o, rays_d, near, far, N_samples=64):
    # Sample points along rays
    t = torch.linspace(near, far, N_samples)
    pts = rays_o[:,None] + rays_d[:,None] * t[:,None]
    
    # Query NeRF
    rgb, sigma = nerf(pts, rays_d)
    
    # Volume rendering
    weights = compute_weights(sigma)
    rgb_map = (weights * rgb).sum(-2)
    return rgb_map
```

### 5.2 Mip-NeRF 360 (Unbounded Scenes)
```python
# Mip-NeRF: Conical frustums instead of rays
# 360: Contraction function for unbounded scenes

def contract(x):
    """Contract unbounded space to bounded ball"""
    norm = torch.norm(x, dim=-1, keepdim=True)
    return torch.where(norm <= 1, x, (2 - 1/norm) * x / norm)

# Integrated positional encoding (IPE)
def integrated_pos_enc(x, cov):
    # Expected value of positional encoding under Gaussian
    pass
```

---

## 6. Direct Mesh Generation

### 6.1 FlexiCubes (Mesh Extraction)
```python
# FlexiCubes: Differentiable isosurface extraction
class FlexiCubes:
    def __init__(self, resolution=64):
        self.resolution = resolution
    
    def extract_mesh(self, sdf, deform=None):
        """
        sdf: (R, R, R) signed distance field
        Returns: vertices, faces
        """
        # Dual contouring with flexible vertices
        # Differentiable w.r.t. SDF and deformation
        pass

# Usage with SDS
def sds_flexicubes(sdf_network, camera_poses, prompt):
    sdf = sdf_network.query_grid()
    mesh = flexicubes.extract_mesh(sdf)
    render = differentiable_renderer(mesh, camera_poses)
    loss = sds_loss(render, prompt)
```

### 6.2 GET3D (Generative Explicit Textured 3D)
```python
class GET3D(nn.Module):
    def __init__(self, latent_dim=512):
        super().__init__()
        self.shape_gen = ShapeGenerator(latent_dim)
        self.texture_gen = TextureGenerator(latent_dim)
    
    def forward(self, z):
        # z: latent code
        vertices, faces = self.shape_gen(z)
        texture = self.texture_gen(z)
        return vertices, faces, texture

# Adversarial training with 2D discriminators
def train_get3d(generator, discriminator, data_loader):
    for real_mesh in data_loader:
        z = torch.randn(batch_size, latent_dim)
        fake = generator(z)
        
        # Render from multiple views
        fake_views = render(fake)
        real_views = render(real_mesh)
        
        # Adversarial loss
        d_loss = gan_loss(discriminator, fake_views, real_views)
        g_loss = -d_loss
```

---

## 7. Large-Scale 3D Generative Models

### 7.1 Shap-E (OpenAI)
```python
# Shap-E: Text-to-3D with implicit function
# Two-stage: Text -> Parameters -> Implicit function

class ShapE(nn.Module):
    def __init__(self, transmitter, encoder):
        super().__init__()
        self.transmitter = transmitter  # Text -> latent
        self.encoder = encoder  # Latent -> implicit params
    
    def forward(self, text):
        latent = self.transmitter(text)
        params = self.encoder(latent)
        return ImplicitFunction(params)

# Implicit function: MLP(SDF) + MLP(Color)
```

### 7.2 DreamFusion / Magic3D / ProlificDreamer
```python
# Progressive training strategy
def progressive_sds_training(renderer, prompt, stages):
    """
    stages = [
        {'res': 64, 'lr': 1e-3, 'steps': 5000},
        {'res': 128, 'lr': 5e-4, 'steps': 10000},
        {'res': 256, 'lr': 2e-4, 'steps': 20000},
    ]
    """
    for stage in stages:
        renderer.set_resolution(stage['res'])
        optimizer = torch.optim.Adam(renderer.parameters(), lr=stage['lr'])
        
        for step in range(stage['steps']):
            loss = sds_loss(renderer, prompt)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

# Magic3D: Two-stage (coarse NeRF -> fine mesh)
# ProlificDreamer: VSD + Prolific Dreamer loss
```

---

## 8. Evaluation Metrics

### 8.1 3D Quality Metrics
```python
def mesh_metrics(pred_mesh, gt_mesh):
    metrics = {}
    
    # Chamfer Distance
    metrics['cd'] = chamfer_distance(pred_mesh, gt_mesh)
    
    # F-Score (threshold-based)
    metrics['f1'] = f_score(pred_mesh, gt_mesh, thresh=0.01)
    
    # Normal Consistency
    metrics['nc'] = normal_consistency(pred_mesh, gt_mesh)
    
    # IoU (volumetric)
    metrics['iou'] = compute_iou(pred_mesh, gt_mesh)
    
    # Texture quality (if textured)
    metrics['texture_psnr'] = texture_psnr(pred_mesh, gt_mesh)
    
    return metrics

def nerf_metrics(pred_nerf, gt_nerf, cameras):
    metrics = {}
    
    # PSNR / SSIM / LPIPS (rendered views)
    for cam in cameras:
        pred_img = render(pred_nerf, cam)
        gt_img = render(gt_nerf, cam)
        metrics['psnr'] += psnr(pred_img, gt_img)
        metrics['ssim'] += ssim(pred_img, gt_img)
        metrics['lpips'] += lpips(pred_img, gt_img)
    
    return {k: v/len(cameras) for k, v in metrics.items()}
```

### 8.2 Text-to-3D Evaluation
```python
def text_to_3d_metrics(generator, prompts, metrics_fn):
    """CLIP-based similarity, user studies"""
    
    # CLIP similarity
    clip_scores = []
    for prompt in prompts:
        mesh = generator(prompt)
        views = render_multiview(mesh)
        clip_score = clip_similarity(views, prompt)
        clip_scores.append(clip_score)
    
    # User study (human preference)
    # pairwise comparison vs baselines
    
    return {
        'clip_score': np.mean(clip_scores),
        'human_pref': user_study_results
    }
```

---

## 9. Applications & Tools

### 9.1 3D Asset Pipeline
```python
def generate_3d_asset(prompt, pipeline="text-to-3d"):
    if pipeline == "text-to-3d":
        # DreamFusion / Magic3D / ProlificDreamer
        mesh = text_to_3d_sds(prompt)
    elif pipeline == "image-to-3d":
        # LRM / TripoSR / LGM
        mesh = image_to_3d_feedforward(image)
    elif pipeline == "text-to-mesh":
        # GET3D / MeshDiffusion / FlexiCubes
        mesh = text_to_mesh_direct(prompt)
    
    # Post-process
    mesh = clean_mesh(mesh)  # Remove artifacts
    mesh = simplify_mesh(mesh, target_faces=10000)
    mesh = uv_unwrap(mesh)
    mesh = bake_textures(mesh)
    
    # Export
    export_obj(mesh, "output.obj")
    export_gltf(mesh, "output.glb")
    export_usdz(mesh, "output.usdz")
    
    return mesh
```

### 9.2 3D Gaussian Splatting Pipeline
```python
def gaussian_splatting_pipeline(images, cameras):
    # 1. Structure from Motion (COLMAP)
    sparse_model = colmap_reconstruction(images)
    
    # 2. Initialize Gaussians from SfM points
    gaussians = init_from_sfm(sparse_model)
    
    # 3. Optimize
    gaussians = train_3dgs(images, cameras, gaussians)
    
    # 4. Compress
    compressed = compress_gaussians(gaussians)
    
    # 5. Export
    export_ply(gaussians, "scene.ply")
    export_splat(gaussians, "scene.splat")
    
    return gaussians
```

---

## 10. Key Takeaways

1. **SDS** = Optimize 3D via 2D diffusion prior (slow, high quality)
2. **VSD** = Adds KL regularization, faster convergence
3. **Feed-forward** (LRM, TripoSR, LGM) = Sub-second, lower quality
4. **3D Gaussian Splatting** = Fast rendering, explicit representation
5. **NeRF** = Implicit, high quality, slow rendering
6. **FlexiCubes** = Differentiable mesh extraction
6. **Direct Mesh** = GET3D, MeshDiffusion for textured meshes
7. **Representation matters**: NeRF (quality), 3DGS (speed), Mesh (compatibility)
8. **SDS is slow** (hours); Feed-forward is fast (seconds)
9. **Evaluation**: Chamfer, F-score, PSNR/SSIM/LPIPS on rendered views
10. **Pipeline**: Text/Image -> 3D representation -> Mesh -> UV/Texture -> Export