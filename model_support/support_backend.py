"""
Support Chat Backend for Amal App
Uses Qwen2.5-7B-Instruct with LoRA adapter fine-tuned for drug recovery support.
"""

import os
import warnings
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from peft import PeftModel
from typing import Optional, List, Dict
from pathlib import Path

warnings.filterwarnings("ignore")


class SupportBackend:
    """
    Support chat backend using Qwen2.5-7B-Instruct with LoRA adapter.
    Provides empathetic, supportive responses for drug recovery assistance.
    """
    
    # Base model from HuggingFace
    BASE_MODEL = "Qwen/Qwen2.5-7B-Instruct"
    
    # System prompt for the support assistant
    DEFAULT_SYSTEM_PROMPT = """أنت مساعد دعم متخصص في مساعدة الأشخاص الذين يعانون من الإدمان على المخدرات في الجزائر.
أنت متعاطف، صبور، وغير حكمي. تقدم الدعم النفسي والمعلومات المفيدة.
تتحدث العربية، الفرنسية، والدارجة الجزائرية.
في حالات الطوارئ أو الأفكار الانتحارية، وجه المستخدم للاتصال بخط الأزمات 3033 (مجاني وسري).

You are a support assistant specialized in helping people struggling with drug addiction in Algeria.
You are empathetic, patient, and non-judgmental. You provide psychological support and helpful information.
You speak Arabic, French, and Algerian Darija.
In emergencies or suicidal thoughts, direct the user to call crisis line 3033 (free and confidential)."""

    def __init__(
        self, 
        adapter_path: Optional[str] = None,
        load_in_8bit: bool = True,
        load_in_4bit: bool = False,
        device_map: str = "auto"
    ):
        """
        Initialize the Support Backend.
        
        Args:
            adapter_path: Path to LoRA adapter. Defaults to 'working/phase3-final' in same folder.
            load_in_8bit: Load model in 8-bit quantization (recommended for ~8GB VRAM).
            load_in_4bit: Load model in 4-bit quantization (for ~4GB VRAM).
            device_map: Device mapping strategy ('auto', 'cuda', 'cpu').
        """
        if adapter_path is None:
            adapter_path = Path(__file__).parent / "working" / "phase3-final"
        else:
            adapter_path = Path(adapter_path)
        
        self.adapter_path = adapter_path
        
        # Check if adapter exists
        if not (adapter_path / "adapter_model.safetensors").exists():
            raise FileNotFoundError(f"Adapter not found at {adapter_path}")
        
        # Set device
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")
        
        # Configure quantization
        self.quantization_config = None
        if load_in_4bit and torch.cuda.is_available():
            self.quantization_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_compute_dtype=torch.float16,
                bnb_4bit_quant_type="nf4",
                bnb_4bit_use_double_quant=True
            )
            print("Using 4-bit quantization")
        elif load_in_8bit and torch.cuda.is_available():
            self.quantization_config = BitsAndBytesConfig(load_in_8bit=True)
            print("Using 8-bit quantization")
        
        # Load model and tokenizer
        self._load_model(device_map)
        
        print("✓ Support Backend initialized successfully")
    
    def _load_model(self, device_map: str):
        """Load base model with LoRA adapter."""
        print(f"Loading base model: {self.BASE_MODEL}")
        print("This may take a few minutes on first run...")
        
        # Load tokenizer from adapter (has the same config)
        self.tokenizer = AutoTokenizer.from_pretrained(
            str(self.adapter_path),
            trust_remote_code=True
        )
        
        # Ensure pad token is set
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
        
        print("✓ Tokenizer loaded")
        
        # Load base model
        model_kwargs = {
            "trust_remote_code": True,
            "torch_dtype": torch.float16 if torch.cuda.is_available() else torch.float32,
        }
        
        if self.quantization_config:
            model_kwargs["quantization_config"] = self.quantization_config
            model_kwargs["device_map"] = device_map
        elif torch.cuda.is_available():
            model_kwargs["device_map"] = device_map
        
        self.model = AutoModelForCausalLM.from_pretrained(
            self.BASE_MODEL,
            **model_kwargs
        )
        print("✓ Base model loaded")
        
        # Load LoRA adapter
        print(f"Loading LoRA adapter from {self.adapter_path}")
        self.model = PeftModel.from_pretrained(
            self.model,
            str(self.adapter_path)
        )
        self.model.eval()
        print("✓ LoRA adapter loaded")

    def generate_response(
        self,
        user_message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        system_prompt: Optional[str] = None,
        max_new_tokens: int = 512,
        temperature: float = 0.7,
        top_p: float = 0.9,
        do_sample: bool = True
    ) -> str:
        """
        Generate a supportive response to user message.
        
        Args:
            user_message: The user's input message.
            conversation_history: List of previous messages [{"role": "user/assistant", "content": "..."}]
            system_prompt: Custom system prompt (uses default if None).
            max_new_tokens: Maximum tokens to generate.
            temperature: Sampling temperature (higher = more creative).
            top_p: Nucleus sampling parameter.
            do_sample: Whether to use sampling (False = greedy decoding).
            
        Returns:
            Generated response string.
        """
        # Build messages list
        messages = []
        
        # Add system prompt
        system = system_prompt or self.DEFAULT_SYSTEM_PROMPT
        messages.append({"role": "system", "content": system})
        
        # Add conversation history
        if conversation_history:
            messages.extend(conversation_history)
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        # Apply chat template
        prompt = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        
        # Tokenize
        inputs = self.tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=4096
        )
        
        # Move to device
        if torch.cuda.is_available():
            inputs = {k: v.to(self.model.device) for k, v in inputs.items()}
        
        # Generate
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                temperature=temperature,
                top_p=top_p,
                do_sample=do_sample,
                pad_token_id=self.tokenizer.pad_token_id,
                eos_token_id=self.tokenizer.eos_token_id
            )
        
        # Decode response (only the new tokens)
        response = self.tokenizer.decode(
            outputs[0][inputs['input_ids'].shape[1]:],
            skip_special_tokens=True
        )
        
        return response.strip()
    
    def chat(
        self,
        user_message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        **kwargs
    ) -> tuple:
        """
        Chat with the support assistant and return updated history.
        
        Args:
            user_message: User's message.
            conversation_history: Previous conversation history.
            **kwargs: Additional generation parameters.
            
        Returns:
            Tuple of (response, updated_history)
        """
        if conversation_history is None:
            conversation_history = []
        
        # Generate response
        response = self.generate_response(
            user_message,
            conversation_history,
            **kwargs
        )
        
        # Update history
        updated_history = conversation_history.copy()
        updated_history.append({"role": "user", "content": user_message})
        updated_history.append({"role": "assistant", "content": response})
        
        return response, updated_history


if __name__ == "__main__":
    print("=" * 60)
    print("Support Chat Backend Test")
    print("=" * 60)
    print("\nNote: This requires ~8GB VRAM (8-bit) or ~16GB VRAM (full precision)")
    print("First run will download Qwen2.5-7B-Instruct (~15GB)\n")
    
    try:
        # Initialize backend
        backend = SupportBackend(load_in_8bit=True)
        
        # Test messages
        test_messages = [
            "راني تعبت من الإدمان، حاب نبرا",
            "ما هي أعراض انسحاب الكحول؟",
            "je me sens seul et déprimé",
        ]
        
        print("\nRunning test conversations:")
        print("-" * 60)
        
        for msg in test_messages:
            print(f"\nUser: {msg}")
            response = backend.generate_response(msg)
            print(f"Assistant: {response}")
        
        print("\n" + "=" * 60)
        print("Test completed successfully!")
        
    except Exception as e:
        print(f"\nError: {e}")
        print("\nRequirements:")
        print("  - pip install transformers peft torch bitsandbytes accelerate")
        print("  - CUDA GPU with sufficient VRAM (8GB+ recommended)")
        print("  - Internet connection to download base model on first run")
