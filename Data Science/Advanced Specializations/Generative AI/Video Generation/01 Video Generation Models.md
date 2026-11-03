# Video Generation Models

Video generation extends image diffusion to temporal dimension, requiring spatiotemporal coherence.

## 1. Video Diffusion Taxonomy

```
Video Generation
├── Pixel-Space Diffusion
│   ├── Video Diffusion Models (VDM)
│   ├── Imagen Video
│   └── Phenaki
├── Latent Video Diffusion
│   ├── Stable Video Diffusion (SVD)
│   ├── Video LDM (VideoLDM)
│   └── LVDM
├── Autoregressive / Transformer
│   ├── VideoGPT
│   ├── CogVideo
│   └── VideoPoet
├── Flow Matching / Rectified Flow
│   ├── Video Flow Matching
│   └── Rectified Flow for Video
└── Hybrid / Other
    ├── AnimateDiff (Motion modules)
    ├── MotionCtrl (ControlNet for video)
    └── Video Compositing
```

---

## 2. Latent Video Diffusion (SVD / VideoLDM)

### 2.1 Stable Video Diffusion (SVD)
```python
# SVD: Image-to-Video (14 frames, 576x1024)
from diffusers import StableVideoDiffusionPipeline

pipe = StableVideoDiffusionPipeline.from_pretrained(
    "stabilityai/stable-video-diffusion-img2vid-xt",
    torch_dtype=torch.float16,
    variant="fp16"
).to("cuda")

# Generate video from image
frames = pipe(image, num_frames=14, fps=7, 
              motion_bucket_id=127, noise_aug_strength=0.02).frames[0]

# Save as GIF/MP4
export_to_gif(frames, "output.gif")
export_to_video(frames, "output.mp4", fps=7)
```

### 2.2 Video LDM Architecture
```python
class VideoLDM(nn.Module):
    def __init__(self, unet, vae, text_encoder, tokenizer):
        super().__init__()
        self.vae = vae  # 3D VAE (spatiotemporal)
        self.unet = unet  # 3D U-Net with temporal attention
        self.text_encoder = text_encoder
        self.tokenizer = tokenizer
    
    def forward(self, x, timestep, context):
        # x: (B, C, F, H, W) - video latents
        # 3D U-Net processes spatiotemporal features
        return self.unet(x, timestep, context)
```

### 2.3 3D VAE (Spatiotemporal Compression)
```python
class VideoAutoencoderKL(nn.Module):
    def __init__(self, embed_dim=4, ch=128, ch_mult=(1,2,4,4),
                 num_res_blocks=2, temporal_compression=4):
        super().__init__()
        
        # 3D Encoder (spatiotemporal)
        self.encoder = Encoder3D(ch, ch_mult, num_res_blocks, 
                                 temporal_compression)
        self.quant_conv = nn.Conv3d(2*embed_dim, 2*embed_dim, 1)
        
        # 3D Decoder
        self.decoder = Decoder3D(ch, ch_mult, num_res_blocks)
        self.post_quant_conv = nn.Conv3d(embed_dim, embed_dim, 1)
```

---

## 3. Temporal Modeling in U-Net

### 3.1 Temporal Attention
```python
class TemporalAttention(nn.Module):
    def __init__(self, dim, heads=8, dim_head=64):
        super().__init__()
        self.heads = heads
        self.scale = dim_head ** -0.5
        
        self.to_q = nn.Linear(dim, heads * dim_head, bias=False)
        self.to_k = nn.Linear(dim, heads * dim_head, bias=False)
        self.to_v = nn.Linear(dim, heads * dim_head, bias=False)
        self.to_out = nn.Linear(heads * dim_head, dim)
    
    def forward(self, x):
        # x: (B, F, H, W, C) -> (B*H*W, F, C)
        b, f, h, w, c = x.shape
        x = x.permute(0, 2, 3, 1, 4).reshape(b*h*w, f, -1)
        
        q, k, v = self.to_q(x), self.to_k(x), self.to_v(x)
        # ... attention over temporal dimension
        out = self.to_out(out)
        
        # Reshape back
        out = out.reshape(b, h, w, f, -1).permute(0, 3, 1, 2, 4)
        return out
```

### 3.2 Temporal Transformer Block
```python
class TemporalTransformerBlock(nn.Module):
    def __init__(self, dim, num_heads=8):
        super().__init__()
        self.spatial_attn = SpatialAttention(dim)
        self.temporal_attn = TemporalAttention(dim)
        self.ffn = FeedForward(dim)
        
        self.norm1 = nn.LayerNorm(dim)
        self.norm2 = nn.LayerNorm(dim)
        self.norm3 = nn.LayerNorm(dim)
    
    def forward(self, x):
        # x: (B, F, H, W, C)
        x = x + self.spatial_attn(self.norm1(x))
        x = x + self.temporal_attn(self.norm2(x))
        x = x + self.ffn(self.norm3(x))
        return x
```

---

## 4. AnimateDiff (Motion Modules)

### 4.1 Motion Module Injection
```python
class MotionModule(nn.Module):
    def __init__(self, in_channels, out_channels=None):
        super().__init__()
        if out_channels is None:
            out_channels = in_channels
        
        self.norm = nn.LayerNorm(in_channels)
        self.temporal_attn = TemporalAttention(in_channels)
        self.ffn = FeedForward(in_channels)
        self.norm_out = nn.LayerNorm(in_channels)
    
    def forward(self, x):
        # x: (B, F, H, W, C)
        residual = x
        x = self.norm(x)
        x = self.temporal_attn(x)
        x = self.ffn(x)
        return x + residual

def inject_motion_modules(unet, motion_modules):
    """Inject motion modules into pre-trained U-Net"""
    for name, module in unet.named_modules():
        if isinstance(module, ResNetBlock):
            # Insert motion module after spatial attention
            pass
```

### 4.2 AnimateDiff Pipeline
```python
from diffusers import AnimateDiffPipeline, MotionAdapter
from diffusers import DDIMScheduler

# Load motion adapter
adapter = MotionAdapter.from_pretrained(
    "guoyww/animatediff-motion-adapter-v1-5-2",
    torch_dtype=torch.float16
)

pipe = AnimateDiffPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    motion_adapter=adapter,
    torch_dtype=torch.float16
).to("cuda")

pipe.scheduler = DDIMScheduler.from_config(pipe.scheduler.config,
                                           beta_schedule="linear",
                                           clip_sample=False)

# Generate
frames = pipe(
    prompt="A cat running in the park",
    negative_prompt="blurry, low quality",
    num_frames=16,
    guidance_scale=7.5,
    num_inference_steps=25
).frames[0]

export_to_gif(frames, "animated.gif")
```

---

## 5. Video Generation with Control (MotionCtrl)

### 5.1 MotionCtrl Architecture
```python
class MotionCtrlNet(nn.Module):
    def __init__(self, unet, control_type="camera"):
        super().__init__()
        self.unet = unet
        self.control_type = control_type
        
        # Camera trajectory encoder
        if control_type == "camera":
            self.camera_encoder = CameraTrajectoryEncoder()
        elif control_type == "object":
            self.object_encoder = ObjectTrajectoryEncoder()
    
    def forward(self, x, timestep, context, control_signal):
        # Encode control signal
        control_emb = self.encode_control(control_signal)
        
        # Inject into U-Net via cross-attention or AdaLN
        return self.unet(x, timestep, context, control_emb)
```

### 5.2 Camera Control
```python
def generate_with_camera_control(pipe, prompt, camera_trajectory):
    """
    camera_trajectory: (T, 6) - [tx, ty, tz, rx, ry, rz] per frame
    """
    # Encode camera trajectory
    camera_emb = encode_camera_trajectory(camera_trajectory)
    
    # Generate with control
    frames = pipe(
        prompt=prompt,
        camera_trajectory=camera_trajectory,
        num_frames=16,
        guidance_scale=7.5
    ).frames[0]
    
    return frames
```

---

## 6. Text-to-Video Models (CogVideo, VideoPoet)

### 6.1 CogVideo (Transformer-based)
```python
class CogVideoModel(nn.Module):
    def __init__(self, vocab_size=50257, dim=1024, depth=24, heads=16):
        super().__init__()
        
        self.token_emb = nn.Embedding(vocab_size, dim)
        self.pos_emb = nn.Parameter(torch.randn(1, max_seq_len, dim))
        
        self.transformer = nn.ModuleList([
            TransformerBlock(dim, heads=16, dim_head=64)
            for _ in range(depth)
        ])
        
        self.to_logits = nn.Linear(dim, vocab_size)
    
    def forward(self, video_tokens, text_tokens):
        # Concatenate text + video tokens
        tokens = torch.cat([text_tokens, video_tokens], dim=1)
        x = self.token_emb(tokens) + self.pos_emb
        
        for block in self.transformer:
            x = block(x)
        
        return self.to_logits(x)
```

### 6.2 VideoPoet (Large Language Model for Video)
```python
class VideoPoet(nn.Module):
    """Large Language Model for Video Generation"""
    def __init__(self, llm_dim=4096, video_vocab=8192):
        super().__init__()
        
        # Video tokenizer (VQ-VAE)
        self.video_tokenizer = VQVAE()
        
        # LLM backbone
        self.llm = LLaMA(dim=llm_dim)
        
        # Video detokenizer
        self.video_detokenizer = VQVAEDecoder()
    
    def generate(self, prompt, num_frames=16):
        # Encode prompt
        text_tokens = self.tokenizer(prompt)
        
        # Autoregressive generation
        video_tokens = self.llm.generate(text_tokens, 
                                         max_length=num_frames*tokens_per_frame)
        
        # Decode
        video = self.video_detokenizer(video_tokens)
        return video
```

---

## 7. Video Super-Resolution & Interpolation

### 7.1 Video Super-Resolution (VSR)
```python
class VideoSRModel(nn.Module):
    def __init__(self, scale=4):
        super().__init__()
        
        # Recurrent or sliding window approach
        self.feat_extract = FeatureExtractor()
        self.align = AlignmentModule()
        self.reconstruct = ReconstructionModule()
    
    def forward(self, lr_video):
        # lr_video: (B, T, C, H, W)
        feats = [self.feat_extract(f) for f in lr_video.unbind(1)]
        
        # Align neighboring frames
        aligned = self.align(feats)
        
        # Reconstruct HR
        hr = self.reconstruct(aligned)
        return hr
```

### 7.2 Frame Interpolation (FILM / RIFE)
```python
# FILM: Frame Interpolation for Large Motion
from film import FilmInterpolator

interpolator = FilmInterpolator()

def interpolate_frames(frame1, frame2, num_interpolated=8):
    frames = [frame1]
    for i in range(1, num_interpolated + 1):
        t = i / (num_interpolated + 1)
        interp = interpolator(frame1, frame2, t)
        frames.append(interp)
    frames.append(frame2)
    return frames
```

---

## 8. Evaluation Metrics

### 8.1 FVD (Fréchet Video Distance)
```python
from torchmetrics.image.fid import FrechetInceptionDistance

def compute_fvd(real_videos, fake_videos, i3d_model):
    """FVD using I3D features"""
    real_features = extract_i3d_features(real_videos, i3d_model)
    fake_features = extract_i3d_features(fake_videos, i3d_model)
    
    mu_real, sigma_real = real_features.mean(0), np.cov(real_features.T)
    mu_fake, sigma_fake = fake_features.mean(0), np.cov(fake_features.T)
    
    fid = np.sum((mu_real - mu_fake)**2) + \
          np.trace(sigma_real + sigma_fake - 2*sqrtm(sigma_real @ sigma_fake))
    return fid
```

### 8.2 Other Metrics
```python
def video_metrics(real, fake):
    metrics = {}
    
    # FVD
    metrics['fvd'] = compute_fvd(real, fake)
    
    # CLIP Score (frame-level)
    metrics['clip_score'] = clip_score(real, fake)
    
    # Temporal Consistency
    metrics['temp_consistency'] = temporal_consistency(fake)
    
    # Motion Quality
    metrics['motion_quality'] = motion_quality(fake)
    
    # FVD-Temporal (different time scales)
    metrics['fvd_16'] = compute_fvd(real[:,:16], fake[:,:16])
    metrics['fvd_64'] = compute_fvd(real[:,:64], fake[:,:64])
    
    return metrics
```

---

## 9. Training Strategies

### 9.1 Progressive Training
```python
def progressive_training(model, data_loader, stages):
    """
    stages = [
        {'resolution': (256, 256), 'frames': 8, 'batch': 32, 'epochs': 10},
        {'resolution': (512, 512), 'frames': 16, 'batch': 16, 'epochs': 10},
        {'resolution': (576, 1024), 'frames': 16, 'batch': 8, 'epochs': 5},
    ]
    """
    for stage in stages:
        print(f"Stage: {stage}")
        # Adjust model resolution
        model.set_resolution(stage['resolution'])
        model.set_frames(stage['frames'])
        
        # Adjust data loader
        loader = DataLoader(dataset, batch_size=stage['batch'], ...)
        
        # Train
        for epoch in range(stage['epochs']):
            train_epoch(model, loader)
```

### 9.2 Mixed Precision & Gradient Accumulation
```python
from torch.cuda.amp import GradScaler, autocast

scaler = GradScaler()
accumulation_steps = 4

for epoch in range(epochs):
    for i, batch in enumerate(loader):
        with autocast():
            loss = model(batch)
            loss = loss / accumulation_steps
        
        scaler.scale(loss).backward()
        
        if (i + 1) % accumulation_steps == 0:
            scaler.step(optimizer)
            scaler.update()
            optimizer.zero_grad()
```

---

## 10. Key Takeaways

1. **Latent Video Diffusion** = 3D VAE + 3D U-Net with temporal attention
2. **SVD** = State-of-the-art Image-to-Video (14 frames, 2-4s)
3. **AnimateDiff** = Motion modules injected into frozen U-Net
4. **Temporal Attention** = Key for temporal coherence
5. **Motion Control** = Camera/object trajectory control
6. **Evaluation** = FVD, CLIP Score, temporal consistency
6. **Training** = Progressive resolution/frames, mixed precision
7. **Text-to-Video** = Still challenging; Image-to-Video more mature
8. **Control** = MotionCtrl, CameraCtrl, sparse control signals