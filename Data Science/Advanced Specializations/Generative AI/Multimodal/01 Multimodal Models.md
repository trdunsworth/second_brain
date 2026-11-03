# Multimodal Generative Models

Multimodal models process and generate across multiple modalities (text, image, audio, video, 3D) with unified architectures.

## 1. Multimodal Architecture Taxonomy

```
Multimodal Models
├── Unified Transformers (Single Stream)
│   ├── Flamingo (Perceiver + LM)
│   ├── GPT-4V / GPT-4o (Native multimodal)
│   ├── LLaVA / LLaVA-Next
│   ├── InstructBLIP / BLIP-2
│   ├── Qwen-VL / Qwen2-VL
│   ├── CogVLM / CogVLM2
│   └── InternVL / InternVL2
├── Dual-Encoder / Contrastive
│   ├── CLIP / OpenCLIP
│   ├── ALIGN / LiT
│   ├── SigLIP / SigLIP2
│   ├── CoCa
│   └── EVA-CLIP / EVA-02
├── Encoder-Decoder / Cross-Attention
│   ├── Flamingo (Perceiver Resampler)
│   ├── BLIP-2 (Q-Former)
│   ├── InstructBLIP
│   └── MiniGPT-4
├── Native Multimodal (Joint Training)
│   ├── GPT-4V/o (Native)
│   ├── Gemini (Native)
│   ├── Chameleon (Token-based)
│   ├── Emu3 (Token-based)
│   └── Transfusion (Joint diffusion)
├── Diffusion-Based
│   ├── Stable Diffusion (CLIP + U-Net)
│   ├── Stable Diffusion 3 (MM-DiT)
│   ├── DiT (Diffusion Transformer)
│   └── Sora (Video DiT)
└── Specialized
    ├── Audio-Language (AudioLM, Whisper, SeamlessM4T)
    ├── Video-Language (Video-LLaVA, LLaVA-Video)
    ├── 3D-Language (PointLLM, 3D-LLM)
    └── Embodied (RT-2, Octo, OpenVLA)
```

---

## 2. Core Multimodal Architectures

### 2.1 CLIP (Contrastive Language-Image Pretraining)
```python
class CLIP(nn.Module):
    def __init__(self, vision_model, text_model, embed_dim=768):
        super().__init__()
        self.visual = vision_model  # ViT or ResNet
        self.text = text_model      # Transformer
        self.logit_scale = nn.Parameter(torch.log(torch.tensor(1/0.07)))
    
    def forward(self, images, texts):
        # Image features
        img_feat = self.visual(images)
        img_feat = F.normalize(img_feat, dim=-1)
        
        # Text features
        txt_feat = self.text(texts)
        txt_feat = F.normalize(txt_feat, dim=-1)
        
        # Contrastive loss
        logit_scale = self.logit_scale.exp()
        logits_per_image = logit_scale * img_feat @ txt_feat.T
        logits_per_text = logits_per_image.T
        
        labels = torch.arange(len(images), device=images.device)
        loss = (F.cross_entropy(logits_per_image, labels) + \
                F.cross_entropy(logits_per_text, labels)) / 2
        
        return loss, img_feat, txt_feat
```

### 2.2 SigLIP (Sigmoid Loss)
```python
def siglip_loss(img_feat, txt_feat, logit_scale, logit_bias):
    """Sigmoid loss instead of softmax - no large batch needed"""
    logits = logit_scale * (img_feat @ txt_feat.T) + logit_bias
    
    # Positive pairs: diagonal
    labels = torch.eye(len(img_feat), device=img_feat.device)
    
    # Sigmoid BCE loss
    loss = F.binary_cross_entropy_with_logits(
        logits, labels, reduction='mean'
    )
    return loss
```

### 2.3 Q-Former (BLIP-2)
```python
class QFormer(nn.Module):
    def __init__(self, num_queries=32, embed_dim=768):
        super().__init__()
        self.query_tokens = nn.Parameter(torch.randn(1, num_queries, embed_dim))
        self.bert = BertModel.from_pretrained("bert-base-uncased")
        
        # Cross-attention to image features
        self.cross_attn = nn.MultiheadAttention(embed_dim, num_heads=12)
    
    def forward(self, image_features):
        # image_features: (B, L, D) from ViT
        B = image_features.shape[0]
        queries = self.query_tokens.expand(B, -1, -1)
        
        # Cross-attention: queries attend to image features
        queries, _ = self.cross_attn(
            queries, image_features, image_features
        )
        
        # Self-attention through BERT
        output = self.bert(inputs_embeds=queries).last_hidden_state
        return output  # (B, num_queries, D)
```

### 2.4 Perceiver Resampler (Flamingo)
```python
class PerceiverResampler(nn.Module):
    def __init__(self, num_latents=64, embed_dim=768, depth=6):
        super().__init__()
        self.latents = nn.Parameter(torch.randn(1, num_latents, embed_dim))
        self.cross_attn = nn.MultiheadAttention(embed_dim, 8)
        self.self_attn = nn.TransformerEncoderLayer(embed_dim, 8)
    
    def forward(self, x):
        # x: (B, L, D) - image patch features
        latents = self.latents.expand(x.shape[0], -1, -1)
        
        # Cross-attention: latents attend to input
        latents = self.cross_attn(latents, x, x)[0]
        
        # Self-attention layers
        for _ in range(depth):
            latents = self.self_attn(latents)
        
        return latents  # (B, num_latents, D)
```

---

## 3. LLaVA Family (LLM + Vision Encoder)

### 3.1 LLaVA Architecture
```python
class LLaVA(nn.Module):
    def __init__(self, vision_tower, llm, projector):
        super().__init__()
        self.vision_tower = vision_tower  # CLIP ViT-L/14
        self.llm = llm  # Vicuna / Llama-2
        self.projector = projector  # MLP: 1024 -> 4096
    
    def forward(self, images, input_ids, labels=None):
        # Encode images
        img_features = self.vision_tower(images)  # (B, 256, 1024)
        img_features = self.projector(img_features)  # (B, 256, 4096)
        
        # Concatenate with text embeddings
        text_emb = self.llm.embed_tokens(input_ids)
        inputs_embeds = torch.cat([img_features, text_emb], dim=1)
        
        return self.llm(inputs_embeds=inputs_embeds, labels=labels)

# LLaVA-1.5: MLP projector, 256 tokens
# LLaVA-Next: Higher resolution, more tokens
# LLaVA-OneVision: Video + Image unified
```

### 3.2 LLaVA Training Stages
```python
# Stage 1: Feature Alignment (freeze LLM)
def stage1_pretrain(model, data_loader):
    model.vision_tower.requires_grad_(False)
    model.llm.requires_grad_(False)
    model.projector.requires_grad_(True)
    
    # Image-text pairs (CC3M, LAION)
    for images, texts in data_loader:
        loss = model(images, texts)
        loss.backward()

# Stage 2: Instruction Tuning (unfreeze LLM + projector)
def stage2_finetune(model, data_loader):
    model.vision_tower.requires_grad_(True)
    model.llm.requires_grad_(True)
    model.projector.requires_grad_(True)
    
    # Instruction following data (LLaVA-Instruct, ShareGPT4V)
    for images, conversations in data_loader:
        loss = model(images, conversations)
        loss.backward()
```

---

## 4. Native Multimodal Models (GPT-4V/o, Gemini, Chameleon)

### 4.1 Chameleon (Token-based Unified)
```python
class Chameleon(nn.Module):
    """Early-fusion: discretize all modalities into tokens"""
    
    def __init__(self, vocab_size=65536, dim=4096):
        super().__init__()
        
        # Separate tokenizers per modality
        self.image_tokenizer = VQVAE(vocab_size=8192)  # Image tokens
        self.text_tokenizer = AutoTokenizer.from_pretrained(...)
        
        # Unified vocabulary
        # 0-31999: Text tokens
        # 32000-40999: Image tokens
        # 41000-49199: Audio tokens (optional)
        
        self.llm = LlamaModel(config)
    
    def forward(self, text=None, images=None, audio=None):
        tokens = []
        
        if text is not None:
            text_toks = self.text_tokenizer(text).input_ids
            tokens.append(text_toks)
        
        if images is not None:
            img_toks = self.image_tokenizer.encode(images)
            tokens.append(img_toks + 32000)  # Offset
        
        # Concatenate all tokens
        input_ids = torch.cat(tokens, dim=1)
        
        # Standard LLM forward
        return self.llm(input_ids)
```

### 4.2 Transfusion (Joint Diffusion + Language)
```python
class Transfusion(nn.Module):
    """Joint diffusion + autoregressive training"""
    
    def __init__(self, llm, diffusion_model):
        super().__init__()
        self.llm = llm
        self.diffusion = diffusion_model  # DiT for images
    
    def forward(self, text, images=None):
        # Mixed sequence: text tokens + image patches
        if images is not None:
            # Patchify images
            patches = patchify(images)
            patch_emb = self.patch_embed(patches)
            
            # Add to sequence
            text_emb = self.llm.embed(text)
            seq = interleave(text_emb, patch_emb)
        else:
            seq = self.llm.embed(text)
        
        return self.llm(seq)
    
    def loss(self, text, images):
        # LM loss on text
        lm_loss = self.llm.loss(text)
        
        # Diffusion loss on images
        diff_loss = self.diffusion.loss(images)
        
        return lm_loss + diff_loss
```

### 4.3 Emu3 (Token-based Multimodal)
```python
# Emu3: Unified token space for text, image, video
class Emu3(nn.Module):
    def __init__(self):
        self.vae = VideoVAE()  # Video tokenizer
        self.llm = LlamaModel()
    
    def forward(self, text=None, images=None, videos=None):
        # All modalities -> discrete tokens
        tokens = []
        if text: tokens.append(text_tokens)
        if images: tokens.append(image_tokens)
        if videos: tokens.append(video_tokens)
        
        return self.llm(torch.cat(tokens, dim=1))
```

---

## 5. Multimodal Diffusion Models

### 5.1 Stable Diffusion 3 (MM-DiT)
```python
class MMDiTBlock(nn.Module):
    """Multimodal Diffusion Transformer Block"""
    
    def __init__(self, dim, num_heads=16, num_modalities=3):
        super().__init__()
        
        # Separate LayerNorm per modality
        self.norm1_img = nn.LayerNorm(dim)
        self.norm1_txt = nn.LayerNorm(dim)
        self.norm1_vid = nn.LayerNorm(dim)
        
        # Joint attention
        self.attn = MultiheadAttention(dim, num_heads)
        
        # Modality-specific FFN
        self.ffn_img = FeedForward(dim)
        self.ffn_txt = FeedForward(dim)
        self.ffn_vid = FeedForward(dim)
    
    def forward(self, img_feat, txt_feat, vid_feat):
        # Concatenate modalities
        x = torch.cat([img_feat, txt_feat, vid_feat], dim=1)
        
        # Joint self-attention
        x = self.attn(x)
        
        # Split and modality-specific FFN
        img_feat, txt_feat, vid_feat = x.split([img_len, txt_len, vid_len], dim=1)
        img_feat = self.ffn_img(img_feat)
        txt_feat = self.ffn_txt(txt_feat)
        vid_feat = self.ffn_vid(vid_feat)
        
        return img_feat, txt_feat, vid_feat
```

### 5.2 Sora (Video DiT)
```python
# Sora: Diffusion Transformer for Video
class Sora(nn.Module):
    def __init__(self, dim=1152, depth=28, heads=16):
        super().__init__()
        
        self.patch_embed = PatchEmbed3D(patch_size=(1,2,2))
        self.pos_embed = nn.Parameter(torch.randn(1, max_tokens, dim))
        
        self.blocks = nn.ModuleList([
            DiTBlock(dim, heads, mlp_ratio=4)
            for _ in range(depth)
        ])
        
        self.final_layer = FinalLayer(dim, patch_size)
    
    def forward(self, x, t, cond):
        # x: (B, C, T, H, W) noisy video
        x = self.patch_embed(x)
        x = x + self.pos_embed
        
        # AdaLN-Zero conditioning
        for block in self.blocks:
            x = block(x, t, cond)
        
        x = self.final_layer(x, t)
        return x  # Predicted noise/velocity
```

---

## 6. Audio-Language Models

### 6.1 AudioLM / Whisper / SeamlessM4T
```python
# Whisper: ASR + Translation
from transformers import WhisperForConditionalGeneration, WhisperProcessor

model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-large-v3")
processor = WhisperProcessor.from_pretrained("openai/whisper-large-v3")

# Transcribe
inputs = processor(audio, sampling_rate=16000, return_tensors="pt")
generated_ids = model.generate(inputs.input_features)
transcription = processor.batch_decode(generated_ids, skip_special_tokens=True)
```

### 6.2 SeamlessM4T (Multilingual Speech Translation)
```python
from transformers import SeamlessM4Tv2Model

model = SeamlessM4Tv2Model.from_pretrained("facebook/seamless-m4t-v2-large")

# Speech-to-Speech Translation
inputs = processor(audios=source_audio, sampling_rate=16000, return_tensors="pt")
outputs = model.generate(**inputs, tgt_lang="eng", generate_speech=True)
translated_audio = outputs.waveforms[0]
```

---

## 7. 3D-Language Models

### 7.1 PointLLM / 3D-LLM
```python
class PointLLM(nn.Module):
    def __init__(self, point_encoder, llm, projector):
        super().__init__()
        self.point_encoder = point_encoder  # PointNet++ / PointBERT
        self.llm = llm
        self.projector = projector
    
    def forward(self, point_cloud, text):
        # point_cloud: (B, N, 3) or (B, N, 6) with color
        pc_features = self.point_encoder(point_cloud)  # (B, N, D)
        pc_features = self.projector(pc_features)  # (B, N, LLM_dim)
        
        # Prepend to text embeddings
        text_emb = self.llm.embed_tokens(text_tokens)
        inputs_embeds = torch.cat([pc_features, text_emb], dim=1)
        
        return self.llm(inputs_embeds=inputs_embeds)
```

---

## 8. Embodied AI / Robotics (VLA)

### 8.1 RT-2 / OpenVLA / Octo
```python
class RT2(nn.Module):
    """Vision-Language-Action Model"""
    
    def __init__(self, vision_encoder, llm, action_head):
        super().__init__()
        self.vision = vision_encoder  # ViT
        self.llm = llm  # PaLI-X / PaLM-E
        self.action_head = action_head  # Action tokenizer + head
    
    def forward(self, images, instructions):
        # Encode images
        img_feat = self.vision(images)
        
        # LLM reasoning
        tokens = self.llm(img_feat, instructions)
        
        # Action prediction
        actions = self.action_head(tokens)
        return actions

# Action tokenization: discretize continuous actions
# "move arm to [0.1, 0.2, 0.3], gripper open" -> tokens
```

---

## 9. Training Strategies

### 8.1 Contrastive Pretraining
```python
def contrastive_training(model, dataloader, epochs):
    for epoch in range(epochs):
        for batch in dataloader:
            images, texts = batch
            
            # Forward
            img_feat, txt_feat = model.encode(images), model.encode(texts)
            
            # Contrastive loss
            loss = clip_loss(img_feat, txt_feat)
            
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
```

### 8.2 Instruction Tuning
```python
def instruction_tuning(model, dataloader):
    for epoch in range(epochs):
        for batch in dataloader:
            images, conversations = batch
            
            # Format: <image>User: ...\nAssistant: ...
            input_ids, labels = format_conversation(conversations)
            
            # Forward
            outputs = model(images, input_ids, labels=labels)
            loss = outputs.loss
            
            loss.backward()
            optimizer.step()
```

### 8.3 RLHF for Multimodal
```python
# DPO for multimodal
def multimodal_dpo(model, ref_model, preference_data):
    for batch in preference_data:
        images, chosen, rejected = batch
        
        # Log probs under policy
        chosen_logps = get_logprobs(model, images, chosen)
        rejected_logps = get_logprobs(model, images, rejected)
        
        # Reference model
        ref_chosen = get_logprobs(ref_model, images, chosen)
        ref_rejected = get_logprobs(ref_model, images, rejected)
        
        # DPO loss
        loss = dpo_loss(chosen_logps, rejected_logps, 
                        ref_chosen, ref_rejected)
```

---

## 9. Evaluation Benchmarks

| Benchmark | Modality | Task | Metrics |
|-----------|----------|------|---------|
| **MMLU** | Text | Knowledge | Accuracy |
| **MMMU** | Image+Text | College-level reasoning | Accuracy |
| **VQAv2** | Image+Text | Visual QA | Accuracy |
| **GQA** | Image+Text | Compositional QA | Accuracy |
| **TextVQA** | Image+Text | Text reading | Accuracy |
| **COCO Caption** | Image->Text | Captioning | CIDEr, SPICE |
| **Flickr30k** | Image<->Text | Retrieval | R@1, R@5, R@10 |
| **AudioCaps** | Audio->Text | Audio captioning | SPICE |
| **MusicCaps** | Audio->Text | Music captioning | SPICE |
| **MSR-VTT** | Video->Text | Video captioning | CIDEr |
| **ActivityNet** | Video->Text | Dense captioning | METEOR |
| **EGO4D** | Video+Text | Egocentric understanding | Acc |
| **Calvin** | Robot+Lang | Manipulation | Success rate |
| **LIBERO** | Robot+Lang | Long-horizon tasks | Success rate |

---

## 10. Key Takeaways

1. **CLIP** = Contrastive dual-encoder, foundation for retrieval & guidance
2. **Q-Former / Perceiver** = Compress vision to fixed tokens for LLM
3. **LLaVA** = Projector + frozen LLM, simple but effective
4. **Native multimodal** (Chameleon, GPT-4o, Gemini) = Joint tokenization
5. **MM-DiT** = Separate norm per modality, joint attention
6. **Flamingo** = Few-shot in-context learning with Perceiver
7. **SeamlessM4T** = Unified speech/text translation
8. **Robotics VLA** = Vision + Language + Action tokens
9. **Training** = Contrastive -> Captioning -> Instruction tuning -> RLHF
10. **Evaluation** = MMMU, VQA, FID, human preference, robotics benchmarks