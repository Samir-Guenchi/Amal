# Amal Intent Classification Model

MarBERT-based intent classifier with Out-of-Distribution (OOD) detection for multilingual drug addiction support queries.

## Model Architecture

```
Input Query (Arabic/French/Darija/English)
           │
           ▼
┌─────────────────────────┐
│   MarBERT Tokenizer     │
│   (UBC-NLP/MARBERTv2)   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   OOD Detector          │
│   (SVM + Embeddings)    │
└───────────┬─────────────┘
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
  In-Domain    Out-of-Domain
     │             │
     ▼             ▼
┌─────────────┐  "Out of context"
│ Intent      │
│ Classifier  │
│ (Fine-tuned │
│  MarBERT)   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ Intent Labels:          │
│ - Exact fact            │
│ - Looking for support   │
│ - Harm                  │
└─────────────────────────┘
```

## Intent Categories

| Intent | Description | Example |
|--------|-------------|---------|
| Exact fact | Scientific/factual questions | "ما هي أعراض انسحاب الكوكايين؟" |
| Looking for support | Emotional support requests | "راني تعبت نفسيا من هاد الإدمان" |
| Harm | Self-harm/crisis indicators | "راني حاب نشرب قاع الدوا" |
| Out of context | Off-topic queries | "كيفاش راهي حالة الطقس؟" |

## Files

```
intent_model/
├── intent_backend.py                    # Backend API class
├── incontext_marbret_approach/
│   ├── marbret_intent_classifier/       # Fine-tuned MarBERT
│   │   ├── config.json
│   │   ├── tokenizer.json
│   │   ├── vocab.txt
│   │   └── label_mapping.json
│   └── ood_detector/
│       └── detector_pipeline.joblib     # OOD detection model
├── marbret_v1/                          # Baseline SVM model
├── final.ipynb                          # Training notebook
└── compare_models.ipynb                 # Model comparison
```

## Requirements

```
torch>=2.0.0
transformers>=4.35.0
joblib>=1.3.0
numpy>=1.24.0
scikit-learn>=1.3.0
```

## Installation

```bash
pip install torch transformers joblib numpy scikit-learn
```

## Usage

```python
from intent_backend import IntentBackend

# Initialize
backend = IntentBackend()

# Predict intent
query = "ما هي أعراض انسحاب الكوكايين؟"
intent, confidence = backend.predict_intent(query)

print(f"Intent: {intent}")
print(f"Confidence: {confidence}")
```

## Output Format

```python
{
    "intent": "Exact fact",
    "confidence": {
        "stage": "intent",      # "ood" or "intent"
        "p_ood": 0.15,          # OOD probability (if stage=ood)
        "p_intent": 0.92        # Intent probability (if stage=intent)
    }
}
```

## Model Details

### MarBERT (UBC-NLP/MARBERTv2)

- Pre-trained on 1B Arabic tweets
- Handles Arabic, Darija, and code-mixed text
- Fine-tuned on drug addiction domain data

### OOD Detection

- SVM classifier on MarBERT embeddings
- Threshold-based detection (p > 0.5 = OOD)
- Prevents hallucination on off-topic queries

## Training

See `final.ipynb` for training details:

1. Data preprocessing and augmentation
2. MarBERT fine-tuning with class weights
3. OOD detector training on in/out domain samples
4. Evaluation metrics and confusion matrix

## Performance

| Metric | Value |
|--------|-------|
| Accuracy | 89.2% |
| F1 (macro) | 0.87 |
| OOD Detection | 94.1% |

## License

MIT License
