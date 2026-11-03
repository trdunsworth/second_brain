# Latent Diffusion Models (Stable Diffusion)

Latent Diffusion Models (LDM) apply diffusion in compressed latent space, making high-resolution synthesis computationally feasible.

## 1. Latent Diffusion Architecture

### 1.1 Key Idea
Compress images to latent space with autoencoder, then run diffusion in latent space:
$$x \xrightarrow{\text{Encoder}} z = \mathcal{E}(x) \xrightarrow{\text{Diffusion}} \hat{z} \xrightarrow{\text{Decoder}} \hat{x} = \mathcal{D}(\hat{z})$$

**Compression ratio:** $f = \frac{H}{h} = \frac{W}{w}$ (typically 8x)
- Image: $512 \times 512 \times 3$ = 786K pixels
- Latent: $64 \times 64 \times 4$ = 16K pixels (**48x reduction**)

### 1.2 Autoencoder (VAE)
```python
class AutoencoderKL(nn.Module):
    def __init__(self, embed_dim=4, ch=128, ch_mult=(1,2,4,4), 
                 num_res_blocks=2, resolution=256):
        super().__init__()
        
        # Encoder
        self.encoder = Encoder(ch, ch_mult, num_res_blocks, resolution)
        self.quant_conv = nn.Conv2d(2*embed_dim, 2*embed_dim, 1)
        
        # Decoder
        self.decoder = Decoder(ch, ch_mult, num_res_blocks)
        self.post_quant_conv = nn.Conv2d(embed_dim, embed_dim, 1)
    
    def encode(self, x):
        h = self.encoder(x)
        moments = self.quant_conv(h)
        mean, logvar = torch.chunk(moments, 2, dim=1)
        return mean, logvar
    
    def decode(self, z):
        z = self.post_quant_conv(z)
        return self.decoder(z)
    
    def forward(self, x, sample_posterior=True):
        mean, logvar = self.encode(x)
        if sample_posterior:
            z = mean + torch.exp(0.5 * logvar) * torch.randn_like(mean)
        else:
            z = mean
        return self.decode(z), mean, logvar

# KL loss
def kl_loss(mean, logvar):
    return -0.5 * torch.sum(1 + logvar - mean.pow(2) - logvar.exp())
```

### 1.3 VAE Training
```python
def train_vae(vae, data_loader, epochs=50):
    optimizer = torch.optim.AdamW(vae.parameters(), lr=1e-4)
    
    for epoch in range(epochs):
        for x in data_loader:
            x = x.to(device)
            
            # Forward
            recon, mean, logvar = vae(x)
            
            # Reconstruction loss
            recon_loss = F.mse_loss(recon, x)
            
            # KL loss
            kl_loss = -0.5 * torch.mean(1 + logvar - mean.pow(2) - logvar.exp())
            
            loss = recon_loss + 1e-6 * kl_loss
            
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
```

---

## 2. Stable Diffusion Pipeline

### 2.1 Components
```python
class StableDiffusionPipeline:
    def __init__(self, vae, unet, text_encoder, tokenizer, scheduler):
        self.vae = vae
        self.unet = unet
        self.text_encoder = text_encoder
        self.tokenizer = tokenizer
        self.scheduler = scheduler
    
    def encode_prompt(self, prompt, negative_prompt=""):
        # Tokenize
        tokens = self.tokenizer(prompt, padding="max_length", 
                               max_length=77, truncation=True, 
                               return_tensors="pt")
        neg_tokens = self.tokenizer(negative_prompt, padding="max_length",
                                   max_length=77, truncation=True,
                                   return_tensors="pt")
        
        # Encode
        with torch.no_grad():
            prompt_emb = self.text_encoder(tokens.input_ids)[0]
            neg_emb = self.text_encoder(neg_tokens.input_ids)[0]
        
        return prompt_emb, neg_emb
    
    def decode_latents(self, latents):
        latents = 1 / 0.18215 * latents
        with torch.no_grad():
            images = self.vae.decode(latents)
        return images
```

### 2.2 Denoising U-Net with Cross-Attention
```python
class CrossAttention(nn.Module):
    def __init__(self, query_dim, context_dim, heads=8, dim_head=64):
        super().__init__()
        self.heads = heads
        self.scale = dim_head ** -0.5
        
        self.to_q = nn.Linear(query_dim, heads * dim_head, bias=False)
        self.to_k = nn.Linear(context_dim, heads * dim_head, bias=False)
        self.to_v = nn.Linear(context_dim, heads * dim_head, bias=False)
        self.to_out = nn.Linear(heads * dim_head, query_dim)
    
    def forward(self, x, context):
        b, n, _ = x.shape
        h = self.heads
        
        q = self.to_q(x).view(b, n, h, -1).transpose(1, 2)
        k = self.to_k(context).view(b, -1, h, -1).transpose(1, 2)
        v = self.to_v(context).view(b, -1, h, -1).transpose(1, 2)
        
        # Attention
        sim = torch.einsum('b h i d, b h j d -> b h i j', q, k) * self.scale
        attn = sim.softmax(dim=-1)
        out = torch.einsum('b h i j, b h j d -> b h i d', attn, v)
        
        out = out.transpose(1, 2).contiguous().view(b, n, -1)
        return self.to_out(out)
```

### 2.3 Classifier-Free Guidance
```python
@torch.no_grad()
def guided_denoise(unet, latents, timestep, prompt_emb, neg_emb, 
                   guidance_scale=7.5):
    # Expand for guidance
    latents = torch.cat([latents] * 2)
    timestep = torch.cat([timestep] * 2)
    context = torch.cat([neg_emb, prompt_emb])
    
    # Predict noise
    noise_pred = unet(latents, timestep, context)
    
    # Split
    noise_uncond, noise_cond = noise_pred.chunk(2)
    
    # Guidance
    noise_pred = noise_uncond + guidance_scale * (noise_cond - noise_uncond)
    
    return noise_pred
```

---

## 3. Text Encoders

### 3.1 CLIP Text Encoder
```python
from transformers import CLIPTextModel, CLIPTokenizer

text_encoder = CLIPTextModel.from_pretrained("openai/clip-vit-large-patch14")
tokenizer = CLIPTokenizer.from_pretrained("openai/clip-vit-large-patch14")

# Freeze
text_encoder.requires_grad_(False)
text_encoder.eval()
```

### 3.2 T5 / FLAN-T5 (SD3, PixArt-Σ)
```python
from transformers import T5EncoderModel, T5Tokenizer

text_encoder = T5EncoderModel.from_pretrained("google/t5-v1_1-xxl")
tokenizer = T5Tokenizer.from_pretrained("google/t5-v1_1-xxl")

# Longer context (512 tokens vs 77)
# Better text understanding
```

### 3.3 Multiple Encoders (SDXL, SD3)
```python
# SDXL: Two text encoders
clip_l = CLIPTextModel.from_pretrained("openai/clip-vit-large-patch14")
clip_g = CLIPTextModel.from_pretrained("laion/CLIP-ViT-bigG-14-laion2B-39B-b160k")

# Combine embeddings
def encode_sdxl(prompt):
    tokens_l = tokenizer_l(prompt, ...)
    tokens_g = tokenizer_g(prompt, ...)
    
    emb_l = clip_l(tokens_l.input_ids)[0]
    emb_g = clip_g(tokens_g.input_ids)[0]
    
    # Pool and concatenate
    pooled = emb_g[:, 0]  # CLS token
    return torch.cat([emb_l, emb_g], dim=-1), pooled
```

---

## 4. Schedulers

### 4.1 Common Schedulers
```python
from diffusers import (
    DDPMScheduler, DDIMScheduler, PNDMScheduler,
    DEISMultistepScheduler, UniPCMultistepScheduler,
    EulerDiscreteScheduler, EulerAncestralScheduler,
    DPMSolverMultistepScheduler, DPMSolverSinglestepScheduler,
    HeunDiscreteScheduler, KDPM2DiscreteScheduler,
    KDPM2AncestralDiscreteScheduler
)

# DDPM (1000 steps, stochastic)
scheduler = DDPMScheduler(num_train_timesteps=1000, beta_schedule="scaled_linear")

# DDIM (50 steps, deterministic)
scheduler = DDIMScheduler(num_train_timesteps=1000, 
                          beta_schedule="scaled_linear",
                          clip_sample=False,
                          set_alpha_to_one=False)

# DPMSolver++ (20-30 steps, fast)
scheduler = DPMSolverMultistepScheduler(
    num_train_timesteps=1000,
    algorithm_type="dpmsolver++",
    solver_order=2
)

# UniPC (10-20 steps, unified predictor-corrector)
scheduler = UniPCMultistepScheduler(
    num_train_timesteps=1000,
    variant="bh2"
)
```

### 4.2 Sampling Loop
```python
@torch.no_grad()
def sample(pipeline, prompt, negative_prompt="", 
           num_inference_steps=50, guidance_scale=7.5, 
           height=512, width=512, generator=None):
    
    # Encode prompt
    prompt_emb, neg_emb = pipeline.encode_prompt(prompt, negative_prompt)
    
    # Prepare latents
    latents = torch.randn(
        (1, 4, height//8, width//8), 
        generator=generator, 
        device=pipeline.device
    )
    
    # Scale initial noise
    latents = latents * pipeline.scheduler.init_noise_sigma
    
    # Denoising loop
    pipeline.scheduler.set_timesteps(num_inference_steps)
    
    for t in pipeline.scheduler.timesteps:
        # Expand for guidance
        latent_input = torch.cat([latents] * 2)
        latent_input = pipeline.scheduler.scale_model_input(latent_input, t)
        
        # Predict noise
        noise_pred = pipeline.unet(
            latent_input, t, 
            encoder_hidden_states=torch.cat([neg_emb, prompt_emb])
        ).sample
        
        # Guidance
        noise_uncond, noise_cond = noise_pred.chunk(2)
        noise_pred = noise_uncond + guidance_scale * (noise_cond - noise_uncond)
        
        # Scheduler step
        latents = pipeline.scheduler.step(noise_pred, t, latents).prev_sample
    
    # Decode
    images = pipeline.decode_latents(latents)
    return images
```

---

## 5. Stable Diffusion Variants

### 5.1 SD 1.5 / 2.1
```python
# SD 1.5: 768-dim CLIP-L, 512x512
# SD 2.1: 1024-dim CLIP-G (OpenCLIP), 512x512 / 768x768

from diffusers import StableDiffusionPipeline

pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16,
    variant="fp16"
).to("cuda")
```

### 5.2 SDXL (Higher Quality)
```python
from diffusers import StableDiffusionXLPipeline

pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
    variant="fp16",
    use_safetensors=True
).to("cuda")

# Refiner for higher quality
refiner = StableDiffusionXLImg2ImgPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-refiner-1.0",
    torch_dtype=torch.float16,
    variant="fp16",
    use_safetensors=True
).to("cuda")
```

### 5.3 SD 3 / SD 3.5 (MM-DiT)
```python
# SD3: Multimodal Diffusion Transformer
# Three text encoders: CLIP-L, CLIP-G, T5-XXL
# Rectified Flow training

from diffusers import StableDiffusion3Pipeline

pipe = StableDiffusion3Pipeline.from_pretrained(
    "stabilityai/stable-diffusion-3-medium-diffusers",
    torch_dtype=torch.float16
).to("cuda")
```

---

## 6. Advanced Techniques

### 6.1 LoRA (Low-Rank Adaptation)
```python
from peft import LoraConfig, get_peft_model
from diffusers import StableDiffusionPipeline

# Add LoRA to UNet
lora_config = LoraConfig(
    r=16,
    lora_alpha=16,
    target_modules=["to_q", "to_k", "to_v", "to_out.0"],
    lora_dropout=0.05,
    bias="none"
)

pipe = StableDiffusionPipeline.from_pretrained(...)
pipe.unet = get_peft_model(pipe.unet, lora_config)

# Train LoRA
pipe.unet.train()
# ... training loop ...
```

### 6.2 DreamBooth (Subject Personalization)
```python
from diffusers import StableDiffusionPipeline
from diffusers.optimization import get_scheduler

# Instance images + class images
# "A photo of sks dog" + "A photo of dog"

# Train with prior preservation loss
def dreambooth_loss(model, instance_images, class_images):
    # Instance loss
    instance_loss = diffusion_loss(model, instance_images, "sks dog")
    
    # Class loss (preserve prior)
    class_loss = diffusion_loss(model, class_images, "dog")
    
    return instance_loss + 1.0 * class_loss
```

### 6.3 ControlNet (Spatial Control)
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

# Condition on canny edges / depth / pose / segmentation
image = pipe(prompt, image=control_image, num_inference_steps=20).images[0]
```

### 6.4 IP-Adapter (Image Prompt)
```python
from diffusers import StableDiffusionPipeline
from ip_adapter import IPAdapter

ip_adapter = IPAdapter(pipe, "ip-adapter_sd15.bin", device="cuda")

# Image + text prompt
images = ip_adapter.generate(
    prompt="A photo of a cat",
    pil_image=reference_image,
    num_samples=4,
    num_inference_steps=50
)
```

---

## 7. Optimization & Deployment

### 7.1 Memory Optimization
```python
# Enable memory efficient attention
from diffusers import UNet2DConditionModel
from xformers.ops import memory_efficient_attention

# Enable xformers
pipe.enable_xformers_memory_efficient_attention()

# Or use PyTorch 2.0+ SDPA
torch.set_default_dtype(torch.float16)
torch.backends.cuda.enable_flash_sdp(True)
torch.backends.cuda.enable_mem_efficient_sdp(True)

# VAE slicing / tiling
pipe.enable_vae_slicing()
pipe.enable_vae_tiling()

# Model offloading
pipe.enable_model_cpu_offload()  # Sequential offload
pipe.enable_sequential_cpu_offload()  # More aggressive
```

### 7.2 Compilation (PyTorch 2.0+)
```python
# Compile UNet
pipe.unet = torch.compile(pipe.unet, mode="reduce-overhead", fullgraph=True)

# Compile VAE
pipe.vae = torch.compile(pipe.vae, mode="reduce-overhead")

# First run will be slower (compilation), subsequent runs faster
```

### 7.3 Quantization
```python
# INT8 quantization
from transformers.utils.quantization_config import BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(
    load_in_8bit=True,
    llm_int8_threshold=6.0
)

# Or 4-bit (QLoRA style)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4"
)

pipe = StableDiffusionPipeline.from_pretrained(
    ..., quantization_config=bnb_config
)
```

---

## 8. Training from Scratch

### 8.1 Data Pipeline
```python
from torch.utils.data import Dataset
import json

class LaionDataset(Dataset):
    def __init__(self, metadata_path, image_dir, tokenizer, 
                 resolution=512, center_crop=True):
        with open(metadata_path) as f:
            self.metadata = json.load(f)
        self.image_dir = image_dir
        self.tokenizer = tokenizer
        self.resolution = resolution
        self.center_crop = center_crop
    
    def __len__(self):
        return len(self.metadata)
    
    def __getitem__(self, idx):
        item = self.metadata[idx]
        image = Image.open(os.path.join(self.image_dir, item['image']))
        
        # Preprocess
        if self.center_crop:
            image = center_crop(image, self.resolution)
        else:
            image = resize(image, self.resolution)
        
        image = np.array(image).astype(np.float32) / 127.5 - 1.0
        image = torch.from_numpy(image).permute(2, 0, 1)
        
        text = item['caption']
        tokens = self.tokenizer(text, max_length=77, 
                               padding="max_length", truncation=True,
                               return_tensors="pt")
        
        return {"pixel_values": image, "input_ids": tokens.input_ids[0]}
```

### 8.2 Distributed Training (FSDP / DeepSpeed)
```bash
# DeepSpeed ZeRO-3
deepspeed --num_gpus=8 train.py \
    --deepspeed ds_config.json \
    --gradient_accumulation_steps 4 \
    --mixed_precision fp16

# FSDP (PyTorch native)
torchrun --nproc_per_node=8 train.py \
    --fsdp "full_shard auto_wrap" \
    --mixed_precision bf16
```

---

## 9. Evaluation

### 9.1 Standard Metrics
```python
def evaluate_pipeline(pipe, prompts, reference_images=None):
    metrics = {}
    
    # FID
    generated = generate_images(pipe, prompts)
    metrics['fid'] = compute_fid(generated, reference_images)
    
    # CLIP Score
    metrics['clip_score'] = compute_clip_score(generated, prompts)
    
    # ImageReward / PickScore
    metrics['imagereward'] = compute_imagereward(generated, prompts)
    
    # Aesthetic Score
    metrics['aesthetic'] = compute_aesthetic(generated)
    
    return metrics
```

### 9.2 Benchmark Prompts
```python
# COCO Captions, PartiPrompts, DrawBench, T2I-CompBench
# Geneval, HPSv2, TIFA, VQAScore
```

---

## 10. Key Takeaways

1. **Latent Diffusion** = VAE encoder + diffusion in latent space (48x speedup)
2. **Stable Diffusion** = LDM + CLIP text encoder + cross-attention U-Net
3. **SDXL/SD3** = Larger models, better text encoders, Rectified Flow (SD3)
4. **Schedulers** = DPMSolver++/UniPC for 20-30 steps, DDIM for 50
5. **ControlNet/IP-Adapter/LoRA** = Control, image prompts, efficient fine-tuning
6. **Optimization** = xformers, FlashAttention, compilation, quantization, offloading
7. **Training** = LAION-scale data, FSDP/DeepSpeed, massive compute
8. **Evaluation** = FID, CLIP Score, ImageReward, human preference