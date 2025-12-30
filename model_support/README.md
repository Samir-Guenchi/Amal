# Amal Support Model

Qwen2.5-7B-Instruct with LoRA adapter for empathetic psychological support in drug addiction recovery.

## Status

**In Development** - The support model is currently under development and not yet integrated into the main backend.

## Model Architecture

```
┌─────────────────────────────────┐
│     Qwen2.5-7B-Instruct         │
│     (Base Model)                │
│     ~15GB download              │
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│     LoRA Adapter                │
│     (phase3-final)              │
│     ~50MB                       │
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│   Empathetic Response           │
│   Generation                    │
└─────────────────────────────────┘
```

## Requirements

### Hardware

- GPU with 8GB+ VRAM (recommended)
- 16GB+ RAM
- 20GB disk space for model

### Software

```
torch>=2.0.0
transformers>=4.35.0
peft>=0.6.0
bitsandbytes>=0.41.0  # For 4-bit quantization
```

## Files

```
model_support/
├── support_backend.py           # Backend class
├── requirements.txt             # Dependencies
└── working/
    └── phase3-final/            # LoRA adapter
        ├── adapter_config.json
        ├── adapter_model.safetensors
        ├── tokenizer.json
        └── ...
```

## Installation

```bash
cd model_support
pip install -r requirements.txt
```

## Usage

```python
from support_backend import SupportBackend

# Initialize (downloads ~15GB base model on first run)
backend = SupportBackend()

# Generate supportive response
response = backend.generate_response(
    query="راني تعبت نفسيا من هاد الإدمان",
    language="dz"
)
print(response)
```

## Configuration

### 4-bit Quantization (Recommended)

For GPUs with limited VRAM:

```python
backend = SupportBackend(load_in_4bit=True)
```

### CPU Mode (Slow)

```python
backend = SupportBackend(device="cpu")
```

## LoRA Adapter

The adapter was fine-tuned on:
- Empathetic dialogue datasets
- Drug addiction counseling transcripts
- Multilingual support conversations

### Training Configuration

```json
{
  "r": 16,
  "lora_alpha": 32,
  "target_modules": ["q_proj", "v_proj"],
  "lora_dropout": 0.05
}
```

## Response Style

The model generates:
- Empathetic, non-judgmental responses
- Validation of user feelings
- Gentle encouragement
- Crisis referral when appropriate (3033 hotline)

## Limitations

- Requires significant GPU resources
- First load takes several minutes
- Not suitable for real-time chat without GPU
- Should not replace professional counseling

## Future Work

- [ ] Model quantization for faster inference
- [ ] Streaming response generation
- [ ] Integration with main backend
- [ ] Fine-tuning on more Algerian dialect data

## License

MIT License

## Disclaimer

This model provides supportive responses but is not a substitute for professional mental health care. Users in crisis should contact the 3033 helpline.
