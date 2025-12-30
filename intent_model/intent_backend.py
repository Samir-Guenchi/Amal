"""
Intent Classification Backend for Amal App
Uses MarBERT model with OOD (Out-of-Domain) detection for Arabic/French/Darija text.
"""

import os
import re
import json
import warnings
import joblib
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from typing import Dict, Tuple, Optional
from pathlib import Path

warnings.filterwarnings("ignore")


class IntentBackend:
    """Intent classification backend using MarBERT with OOD detection."""
    
    # Intent labels
    INTENT_LOOKING_FOR_SUPPORT = "Looking for support"
    INTENT_EXACT_FACT = "Exact fact"
    INTENT_HARM = "Harm"
    INTENT_OUT_OF_CONTEXT = "Out of context"
    
    # Default OOD threshold (best found during training)
    DEFAULT_OOD_THRESHOLD = 0.09
    
    def __init__(self, base_dir: Optional[str] = None):
        """
        Initialize the Intent Backend.
        
        Args:
            base_dir: Base directory containing model files. 
                      Defaults to 'incontext_marbret_approach' in the same folder.
        """
        if base_dir is None:
            base_dir = Path(__file__).parent / "incontext_marbret_approach"
        else:
            base_dir = Path(base_dir)
        
        self.base_dir = base_dir
        self.model_dir = base_dir / "marbret_intent_classifier"
        self.detector_path = base_dir / "ood_detector" / "detector_pipeline.joblib"
        
        # Set device
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {self.device}")
        
        # Load models
        self._load_ood_detector()
        self._load_marbert_model()
        self._load_label_mapping()
        
        print("✓ Intent Backend initialized successfully")
    
    def _load_ood_detector(self):
        """Load the OOD (Out-of-Domain) detector."""
        if not self.detector_path.exists():
            raise FileNotFoundError(f"OOD detector not found at {self.detector_path}")
        
        print("Loading OOD detector...")
        self.ood_detector = joblib.load(self.detector_path)
        print("✓ OOD detector loaded")
    
    def _load_marbert_model(self):
        """Load MarBERT tokenizer and model."""
        if not self.model_dir.exists():
            raise FileNotFoundError(f"MarBERT model not found at {self.model_dir}")
        
        print("Loading MarBERT model...")
        self.tokenizer = AutoTokenizer.from_pretrained(str(self.model_dir))
        self.model = AutoModelForSequenceClassification.from_pretrained(str(self.model_dir))
        self.model.to(self.device)
        self.model.eval()
        print("✓ MarBERT model loaded")
    
    def _load_label_mapping(self):
        """Load label mapping from JSON file."""
        mapping_path = self.model_dir / "label_mapping.json"
        if not mapping_path.exists():
            raise FileNotFoundError(f"Label mapping not found at {mapping_path}")
        
        with open(mapping_path, "r", encoding="utf-8") as f:
            mapping = json.load(f)
        
        self.id_to_label = {int(k): v for k, v in mapping["id_to_label"].items()}
        print(f"✓ Label mapping loaded: {list(self.id_to_label.values())}")
    
    @staticmethod
    def clean_text(text: str) -> str:
        """
        Clean and normalize text for Arabic/French/Darija.
        
        Args:
            text: Input text to clean.
            
        Returns:
            Cleaned and normalized text.
        """
        if not isinstance(text, str):
            return ""
        
        # Lowercase Latin characters
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove emojis and special chars (keep basic punctuation and Arabic)
        text = re.sub(r'[^\w\s\u0600-\u06FF]', ' ', text)
        
        # Arabic normalization
        text = re.sub("[إأآا]", "ا", text)
        text = re.sub("ى", "ي", text)
        text = re.sub("ؤ", "ء", text)
        text = re.sub("ئ", "ء", text)
        text = re.sub("ة", "ه", text)
        text = re.sub("گ", "ك", text)
        
        # Remove Tashkeel (Arabic diacritics)
        tashkeel = re.compile(r'[\u064B-\u0652]')
        text = re.sub(tashkeel, "", text)
        
        # Remove longation (repeated characters)
        text = re.sub(r'(.)\1+', r'\1\1', text)
        
        # Remove multiple spaces
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text

    def predict_intent(
        self, 
        text: str, 
        ood_threshold: Optional[float] = None
    ) -> Tuple[str, Dict]:
        """
        Predict intent for given text with confidence scores.
        
        Uses a two-stage pipeline:
        1. OOD detector checks if text is out-of-domain
        2. If in-domain, MarBERT classifies the intent
        
        Args:
            text: Input text to classify.
            ood_threshold: Threshold for OOD detection. 
                          Defaults to 0.09 (best found during training).
        
        Returns:
            Tuple of (intent_label, confidence_dict)
            - intent_label: One of "Looking for support", "Exact fact", "Harm", "Out of context"
            - confidence_dict: Contains 'stage', 'p_ood', and optionally 'p_intent'
        """
        if ood_threshold is None:
            ood_threshold = self.DEFAULT_OOD_THRESHOLD
        
        # Clean the text
        cleaned = self.clean_text(text)
        
        # Stage 1: OOD detection
        p_ood = None
        if hasattr(self.ood_detector, "predict_proba") and ood_threshold is not None:
            probs = self.ood_detector.predict_proba([cleaned])[0]
            classes = list(self.ood_detector.classes_)
            idx_ood = classes.index("out_of_domain")
            p_ood = float(probs[idx_ood])
            
            if p_ood >= ood_threshold:
                return self.INTENT_OUT_OF_CONTEXT, {
                    "stage": "ood",
                    "p_ood": round(p_ood, 2)
                }
        
        # Stage 2: MarBERT intent classification
        encoding = self.tokenizer(
            text,
            add_special_tokens=True,
            max_length=128,
            truncation=True,
            padding="max_length",
            return_tensors="pt"
        )
        encoding = {k: v.to(self.device) for k, v in encoding.items()}
        
        with torch.no_grad():
            logits = self.model(**encoding).logits
            probs = torch.softmax(logits, dim=-1)[0].cpu().numpy()
        
        pred_id = int(np.argmax(probs))
        pred_label = self.id_to_label[pred_id]
        p_intent = float(probs[pred_id])
        
        return pred_label, {
            "stage": "intent",
            "p_ood": round(p_ood, 2) if p_ood is not None else None,
            "p_intent": round(p_intent, 2)
        }
    
    def is_harm_intent(self, text: str) -> bool:
        """
        Quick check if text indicates self-harm intent.
        
        Args:
            text: Input text to check.
            
        Returns:
            True if classified as "Harm" intent.
        """
        label, _ = self.predict_intent(text)
        return label == self.INTENT_HARM
    
    def get_all_intents(self) -> list:
        """Return list of all possible intent labels."""
        return [
            self.INTENT_LOOKING_FOR_SUPPORT,
            self.INTENT_EXACT_FACT,
            self.INTENT_HARM,
            self.INTENT_OUT_OF_CONTEXT
        ]


if __name__ == "__main__":
    # Test the backend
    print("=" * 60)
    print("Intent Classification Backend Test")
    print("=" * 60)
    
    try:
        backend = IntentBackend()
        
        # Test sentences
        test_sentences = [
            "حاب نبرا من لادروك عاونوني",  # Looking for support
            "ما هي أعراض انسحاب الكوكايين؟",  # Exact fact
            "راني حاب نشرب قاع الدوا لي عندي باش نرقد وما نوضش",  # Harm
            "كيفاش راهي حالة الطقس في وهران؟",  # Out of context
            "win kayen centre d'addictologie f dzayer?",  # Exact fact (Darija/French)
            "ma3andich l'espoir f lhayat, nhab nmout",  # Harm (Darija/French)
        ]
        
        print("\nRunning predictions:")
        print("-" * 60)
        
        for sentence in test_sentences:
            label, confidence = backend.predict_intent(sentence)
            print(f"\nInput: {sentence}")
            print(f"Intent: {label}")
            print(f"Confidence: {confidence}")
        
        print("\n" + "=" * 60)
        print("Test completed successfully!")
        
    except Exception as e:
        print(f"\nError: {e}")
        print("\nMake sure the model files exist in:")
        print("  - intent_model/incontext_marbret_approach/marbret_intent_classifier/")
        print("  - intent_model/incontext_marbret_approach/ood_detector/detector_pipeline.joblib")
