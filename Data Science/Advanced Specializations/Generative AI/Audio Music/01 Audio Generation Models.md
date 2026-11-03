# Audio & Music Generation Models

Audio generation covers speech, music, sound effects, and general audio synthesis using diffusion, autoregressive, and flow-based approaches.

## 1. Audio Generation Taxonomy

```
Audio Generation
├── Speech Synthesis (TTS)
│   ├── Autoregressive (VALL-E, Vall-E X, Tortoise)
│   ├── Non-Autoregressive (FastSpeech2, VITS)
│   ├── Diffusion-based (Grad-TTS, DiffSpeech)
│   └── Flow Matching (VoiceFlow, Matcha-TTS)
├── Music Generation
│   ├── Symbolic (MIDI) - MusicLM, MusicGen, MuseNet
│   ├── Audio - AudioLDM, Stable Audio, MusicGen (audio)
│   ├── Diffusion - AudioLDM, Make-An-Audio, Tango
│   └── Flow Matching - VoiceFlow, Rectified Flow for Audio
├── Sound Effects / Foley
│   ├── AudioLDM, Make-An-Audio
│   └── FoleyGen
├── Voice Conversion / Cloning
│   ├── VALL-E, XTTS, VALL-E X
│   ├── So-VITS-SVC, RVC
│   └── FreeVC, YourTTS
└── Audio Codec / Compression
    ├── EnCodec, DAC, SoundStream
    ├── FunCodec, HiFi-GAN Vocoder
    └── RVQ / RVQ-VAE
```

---

## 2. Audio Codecs (Tokenization)

### 2.1 EnCodec (Meta)
```python
from transformers import EncodecModel, EncodecFeatureExtractor

model = EncodecModel.from_pretrained("facebook/encodec_24khz")
processor = EncodecFeatureExtractor.from_pretrained("facebook/encodec_24khz")

# Encode
inputs = processor(raw_audio, sampling_rate=24000, return_tensors="pt")
with torch.no_grad():
    codes = model.encode(inputs["input_values"], inputs["padding_mask"])

# codes: (B, n_q, T) - n_q codebooks, T time steps
# RVQ: Residual Vector Quantization
```

### 2.2 DAC (Descript Audio Codec)
```python
# Better quality at lower bitrates
from dac.model import DAC

model = DAC.load("descript/dac_44khz")
codes = model.encode(audio)
```

### 2.3 Codebook Details
```python
# Typical RVQ structure
n_codebooks = 8  # coarse (semantic) + fine (acoustic)
codebook_size = 1024
# Codebook 0-1: semantic (phonemes, pitch)
# Codebook 2-7: acoustic (timbre, detail)

# Flatten for LLM
# (B, n_q, T) -> (B, n_q * T) or interleave
def interleave_codes(codes):
    # codes: (B, n_q, T)
    B, n_q, T = codes.shape
    return codes.transpose(1, 2).reshape(B, n_q * T)
```

---

## 3. Text-to-Audio (AudioLDM, Make-An-Audio, Tango)

### 3.1 AudioLDM (Latent Diffusion for Audio)
```python
from diffusers import AudioLDMPipeline

pipe = AudioLDMPipeline.from_pretrained(
    "cvssp/audioldm",
    torch_dtype=torch.float16
).to("cuda")

# Generate
audio = pipe(
    prompt="Birdsong in a forest with gentle wind",
    negative_prompt="low quality, noise, static",
    num_inference_steps=50,
    audio_length_in_s=10.0
).audios[0]

# Save
import scipy.io.wavfile as wav
wav.write("output.wav", rate=16000, data=audio)
```

### 3.2 Make-An-Audio / Tango (Instruction-tuned)
```python
# Tango: Text-to-Audio with instruction tuning
from diffusers import AudioLDMPipeline

pipe = AudioLDMPipeline.from_pretrained(
    "declare-lab/tango",
    torch_dtype=torch.float16
).to("cuda")

# More precise control
audio = pipe(
    prompt="A dog barking twice, then a cat meowing",
    steps=50,
    guidance_scale=3.5
).audios[0]
```

### 3.3 Architecture (AudioLDM)
```python
# Encoder: CLAP (Contrastive Language-Audio Pretraining)
from transformers import ClapModel, ClapProcessor

clap = ClapModel.from_pretrained("laion/clap-htsat-unfused")
processor = ClapProcessor.from_pretrained("laion/clap-htsat-unfused")

# Get text embedding
inputs = processor(text=["A dog barking"], return_tensors="pt")
text_emb = clap.get_text_features(**inputs)

# Diffusion in latent space (VAE encoded audio)
# VAE: Encode audio -> latent -> diffusion -> decode
```

---

## 4. Music Generation

### 4.1 MusicGen (Meta)
```python
from transformers import MusicgenForConditionalGeneration, AutoProcessor

model = MusicgenForConditionalGeneration.from_pretrained(
    "facebook/musicgen-large"
)
processor = AutoProcessor.from_pretrained("facebook/musicgen-large")

# Generate
inputs = processor(
    text=["Upbeat electronic dance music with heavy bass"],
    padding=True,
    return_tensors="pt"
).to("cuda")

audio_values = model.generate(**inputs, max_new_tokens=256)
# audio_values: (B, 1, T) - waveform
```

### 4.2 MusicGen Architecture
```python
# EnCodec tokenizer (RVQ) -> LM over codebooks
# Stage 1: Semantic tokens (codebook 0) from EnCodec
# Stage 2: Acoustic tokens (codebooks 1-7) conditioned on semantic

class MusicGen(nn.Module):
    def __init__(self, text_encoder, encodec, lm):
        super().__init__()
        self.text_encoder = text_encoder  # T5
        self.encodec = encodec  # RVQ-VAE
        self.lm = lm  # Transformer over codebooks
    
    def forward(self, text, audio_codes=None):
        # Text conditioning
        text_emb = self.text_encoder(text)
        
        # LM over codebooks (parallel or sequential)
        if audio_codes is None:
            # Generation
            return self.lm.generate(text_emb)
        else:
            # Training
            return self.lm(audio_codes, text_emb)
```

### 4.3 Stable Audio (Stability AI)
```python
# Stable Audio Open: Text-to-Audio with timing control
from diffusers import StableAudioPipeline

pipe = StableAudioPipeline.from_pretrained(
    "stabilityai/stable-audio-open-1.0",
    torch_dtype=torch.float16
).to("cuda")

# With timing control
audio = pipe(
    prompt="Ambient electronic music, 120 BPM, 4/4 time",
    negative_prompt="low quality",
    num_inference_steps=50,
    audio_end_in_s=30.0
).audios[0]
```

### 4.4 MusicLM / AudioLM (Google)
```python
# Hierarchical codec + Language Model
# Stage 1: Semantic tokens (w2v-BERT)
# Stage 2: Acoustic tokens (SoundStream)
# Stage 3: Language model over tokens

# AudioLM: Pure audio continuation
# MusicLM: Text-to-Music with MuLan text encoder
```

---

## 4. Voice Cloning & TTS

### 4.1 VALL-E / VALL-E X (Microsoft)
```python
# Zero-shot TTS with 3-second enrollment
# Architecture: AR LM over EnCodec tokens + NAR refinement

class VALL_E(nn.Module):
    def __init__(self, encodec, ar_lm, nar_lm):
        self.encodec = encodec
        self.ar_lm = ar_lm  # Autoregressive (semantic tokens)
        self.nar_lm = nar_lm  # Non-autoregressive (acoustic tokens)
    
    def forward(self, text, prompt_audio, prompt_text):
        # 1. Encode prompt audio
        prompt_codes = self.encodec.encode(prompt_audio)
        
        # 2. AR LM: Generate semantic tokens
        semantic_codes = self.ar_lm.generate(text, prompt_codes)
        
        # 3. NAR LM: Generate acoustic tokens
        acoustic_codes = self.nar_lm.generate(semantic_codes)
        
        # 4. Decode
        return self.encodec.decode(acoustic_codes)
```

### 4.2 XTTS v2 (Coqui)
```python
from TTS.api import TTS

tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("cuda")

# Zero-shot voice cloning
tts.tts_to_file(
    text="Hello, this is a cloned voice.",
    speaker_wav="enrollment.wav",
    language="en",
    file_path="output.wav"
)
```

### 4.3 XTTS Architecture
```python
# XTTS v2: Improved VALL-E with better prosody
# - Hifi-GAN vocoder
# - Multi-lingual (16+ languages)
# - Better speaker similarity
```

### 4.4 FreeVC / YourTTS (Voice Conversion)
```python
# FreeVC: Content + Speaker disentanglement
# - Content encoder (HuBERT)
# - Speaker encoder (ECAPA-TDNN)
# - Decoder

from freevc import FreeVC

vc = FreeVC()
converted = vc.convert(
    source_audio="source.wav",
    target_speaker="target.wav"
)
```

---

## 5. Audio Diffusion Models

### 5.1 Grad-TTS / DiffSpeech
```python
# Grad-TTS: Score-based diffusion for TTS
# Score matching on mel-spectrogram

class GradTTS(nn.Module):
    def __init__(self, encoder, decoder, score_net):
        super().__init__()
        self.encoder = encoder  # Text encoder
        self.decoder = decoder  # Mel decoder
        self.score_net = score_net  # U-Net for score matching
    
    def forward(self, text, mel=None):
        # Forward diffusion on mel
        # Score matching loss
        pass
```

### 5.2 VoiceFlow / Matcha-TTS (Flow Matching)
```python
# Flow Matching for TTS (fast, high quality)
# Matcha-TTS: Fast, high-quality TTS with flow matching

from matcha import MatchaTTS

tts = MatchaTTS()
audio = tts.synthesize("Hello world", speaker_id=0)
```

---

## 6. Vocoders (Waveform Synthesis)

### 6.1 HiFi-GAN
```python
from hifi_gan import HiFiGAN

vocoder = HiFiGAN.from_pretrained("nvidia/hifigan-v1")

# Mel -> Waveform
mel = torch.randn(1, 80, 100)
with torch.no_grad():
    audio = vocoder(mel)
```

### 6.2 BigVGAN
```python
# Better quality, periodic activation
from bigvgan import BigVGAN

vocoder = BigVGAN.from_pretrained("nvidia/bigvgan_v2_24khz_100band")
audio = vocoder(mel)
```

### 6.3 Vocos (Fourier-based)
```python
# Vocos: Fourier-based vocoder, faster
from vocos import Vocos

vocos = Vocos.from_pretrained("charactr/vocos-mel-24khz")
audio = vocos.decode(mel)
```

---

## 7. Conditional Generation

### 7.1 AudioLDM with Guidance
```python
# AudioLDM with classifier-free guidance
pipe = AudioLDMPipeline.from_pretrained("cvssp/audioldm-m-full")

audio = pipe(
    prompt="Piano playing jazz",
    negative_prompt="drums, vocals",
    guidance_scale=3.5,
    num_inference_steps=50
).audios[0]
```

### 7.2 MusicGen with Melody Conditioning
```python
# MusicGen: Melody + Text conditioning
inputs = processor(
    text=["Jazz piano"],
    audio=melody_wav,
    padding=True,
    return_tensors="pt"
)

audio = model.generate(**inputs, max_new_tokens=512)
```

### 7.3 Audio Inpainting / Editing
```python
# InstructME: Instruction-based audio editing
# "Replace the piano with guitar"

# AudioLDM2: Inpainting
pipe = AudioLDMPipeline.from_pretrained("cvssp/audioldm2")
edited = pipe.inpaint(
    prompt="Add bird sounds",
    audio=audio,
    mask=mask
)
```

---

## 8. Evaluation Metrics

### 8.1 Objective Metrics
```python
def audio_metrics(generated, reference, sr=24000):
    metrics = {}
    
    # FAD (Fréchet Audio Distance)
    metrics['fad'] = compute_fad(generated, reference)
    
    # KL Divergence (distribution)
    metrics['kl'] = compute_kl(generated, reference)
    
    # IS (Inception Score) - AudioSet
    metrics['is'] = compute_is(generated)
    
    # F1 / Precision / Recall (onset detection)
    metrics['onset_f1'] = onset_f1(generated, reference)
    
    # Mel-cepstral distortion (MCD)
    metrics['mcd'] = compute_mcd(generated, reference)
    
    # PESQ / STOI (speech quality)
    metrics['pesq'] = compute_pesq(generated, reference, sr)
    metrics['stoi'] = compute_stoi(generated, reference, sr)
    
    return metrics
```

### 8.2 Subjective Metrics
```python
# MOS (Mean Opinion Score) - human evaluation
# CMOS (Comparative MOS)
# SMOS (Similarity MOS) - for voice cloning
```

---

## 9. Applications & Use Cases

### 9.1 Music Production
```python
# Stem separation + generation
# "Generate a drum track for this melody"
# "Extend this 4-bar loop to 32 bars"
```

### 9.2 Accessibility
```python
# TTS for visually impaired
# Voice cloning for ALS patients
# Real-time translation + TTS
```

### 9.3 Content Creation
```python
# Podcast intro/outro generation
# Video game adaptive music
# Foley sound effect generation
```

---

## 10. Key Takeaways

1. **Audio Codecs** (EnCodec, DAC) = RVQ tokenization for discrete audio modeling
2. **AudioLDM** = Latent diffusion with CLAP text encoder
3. **MusicGen** = EnCodec tokens + Transformer LM (state-of-the-art music)
4. **VALL-E / XTTS** = Zero-shot voice cloning with 3s enrollment
5. **Flow Matching TTS** (Matcha-TTS) = Faster, high-quality TTS
6. **Vocoders** (HiFi-GAN, BigVGAN, Vocos) = Mel → Waveform
6. **Control** = Melody, timing, style, instrumentation
7. **Evaluation** = FAD, MCD, PESQ, STOI, MOS
7. **Applications** = Music production, accessibility, content creation