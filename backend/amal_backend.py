"""
Amal General Backend - Orchestrates all AI models for drug recovery support.

Flow:
1. Intent classification (MarBERT + OOD detection)
2. Route to appropriate handler based on intent:
   - Out of context → polite rejection message
   - Harm → crisis intervention with 3033 hotline
   - Exact fact → RAG scientific backend
   - Looking for support → Support model (in development)
"""

import sys
import re
from pathlib import Path
from typing import Dict, Tuple, Optional

# Add parent directories to path for imports
ROOT_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT_DIR / "intent_model"))
sys.path.insert(0, str(ROOT_DIR / "rag_scientific"))

# Load environment variables from rag_scientific/.env
from dotenv import load_dotenv
load_dotenv(ROOT_DIR / "rag_scientific" / ".env")

from intent_backend import IntentBackend


class AmalBackend:
    """
    Main backend orchestrator for Amal drug recovery support app.
    Routes queries to appropriate AI models based on intent classification.
    """
    
    # Crisis hotline
    CRISIS_LINE = "3033"
    
    # Multilingual responses for out of context
    OUT_OF_CONTEXT_RESPONSES = {
        "ar": "عذراً، سؤالك خارج نطاق تخصصي. أنا هنا لمساعدتك في مواضيع التعافي من الإدمان فقط.",
        "fr": "Désolé, votre question est hors sujet. Je suis ici pour vous aider uniquement sur les sujets liés à la récupération de l'addiction.",
        "dz": "سمحلي، سؤالك خارج الموضوع. راني هنا باش نعاونك غير في مواضيع التعافي من الإدمان.",
        "en": "Sorry, your question is off-topic. I'm here to help you only with addiction recovery topics."
    }
    
    # Multilingual crisis responses for harm intent
    HARM_RESPONSES = {
        "ar": """أنا قلق عليك. ما تقوله يبدو خطيراً.

🆘 إذا كنت تفكر في إيذاء نفسك، يرجى الاتصال فوراً بخط الأزمات:
📞 {crisis_line} (مجاني وسري، متاح 24/7)

أنت لست وحدك. هناك أشخاص يريدون مساعدتك.""",
        
        "fr": """Je suis inquiet pour vous. Ce que vous dites semble grave.

🆘 Si vous pensez à vous faire du mal, veuillez appeler immédiatement la ligne de crise:
📞 {crisis_line} (gratuit et confidentiel, disponible 24/7)

Vous n'êtes pas seul. Il y a des gens qui veulent vous aider.""",
        
        "dz": """راني قلقان عليك. واش راك تقول يبان خطير.

🆘 إذا راك تفكر تضر روحك، عيط دوك للخط تاع الأزمات:
📞 {crisis_line} (مجاني وسري، متوفر 24/7)

ماكش وحدك. كاين ناس حابين يعاونوك.""",
        
        "en": """I'm concerned about you. What you're saying sounds serious.

🆘 If you're thinking about harming yourself, please call the crisis line immediately:
📞 {crisis_line} (free and confidential, available 24/7)

You are not alone. There are people who want to help you."""
    }
    
    # Looking for support response (in development)
    SUPPORT_IN_DEV_RESPONSES = {
        "ar": "أنا أفهم أنك تبحث عن الدعم. نظام الدعم النفسي قيد التطوير حالياً. في الوقت الحالي، يمكنك الاتصال بخط المساعدة {crisis_line} للتحدث مع متخصص.",
        "fr": "Je comprends que vous cherchez du soutien. Le système de soutien psychologique est actuellement en développement. En attendant, vous pouvez appeler la ligne d'aide {crisis_line} pour parler à un spécialiste.",
        "dz": "فاهم أنك تحوس على الدعم. نظام الدعم النفسي راه في التطوير دوك. في الوقت الحالي، تقدر تعيط لخط المساعدة {crisis_line} باش تهدر مع متخصص.",
        "en": "I understand you're looking for support. The psychological support system is currently under development. In the meantime, you can call the helpline {crisis_line} to speak with a specialist."
    }

    def __init__(self, load_rag: bool = True):
        """
        Initialize the Amal Backend.
        
        Args:
            load_rag: Whether to load RAG backend (requires ChromaDB + embeddings).
        """
        print("=" * 60)
        print("Initializing Amal Backend")
        print("=" * 60)
        
        # Load intent classifier
        print("\n[1/2] Loading Intent Classifier...")
        self.intent_backend = IntentBackend()
        
        # Load RAG backend (optional)
        self.rag_backend = None
        if load_rag:
            print("\n[2/2] Loading RAG Backend...")
            try:
                from rag_backend import RAGBackend
                # Use correct path to database
                db_path = str(ROOT_DIR / "rag_scientific" / "full_database")
                self.rag_backend = RAGBackend(persist_dir=db_path)
            except Exception as e:
                print(f"⚠ RAG Backend not loaded: {e}")
                print("  Exact fact queries will return a fallback message.")
        else:
            print("\n[2/2] RAG Backend skipped (load_rag=False)")
        
        print("\n" + "=" * 60)
        print("✓ Amal Backend initialized")
        print("=" * 60)

    def detect_language(self, text: str) -> str:
        """
        Detect the primary language of the text.
        
        Returns:
            'ar' for Arabic, 'fr' for French, 'dz' for Darija, 'en' for English
        """
        # Count Arabic characters
        arabic_chars = len(re.findall(r'[\u0600-\u06FF]', text))
        # Count Latin characters
        latin_chars = len(re.findall(r'[a-zA-Z]', text))
        
        total = arabic_chars + latin_chars
        if total == 0:
            return "ar"  # Default to Arabic
        
        arabic_ratio = arabic_chars / total
        
        # Mostly Arabic script
        if arabic_ratio > 0.7:
            return "ar"
        # Mostly Latin script
        elif arabic_ratio < 0.3:
            # Check for French indicators
            french_words = ['je', 'tu', 'il', 'elle', 'nous', 'vous', 'est', 'sont', 
                          'le', 'la', 'les', 'un', 'une', 'des', 'pour', 'avec',
                          'dans', 'sur', 'que', 'qui', 'comment', 'pourquoi']
            text_lower = text.lower()
            french_count = sum(1 for w in french_words if f' {w} ' in f' {text_lower} ')
            
            if french_count >= 2:
                return "fr"
            return "en"
        # Mixed (likely Darija - Arabic + French/Latin mix)
        else:
            return "dz"
    
    def get_response(self, text: str, lang: str, response_dict: Dict[str, str]) -> str:
        """Get response in appropriate language with crisis line substitution."""
        response = response_dict.get(lang, response_dict["en"])
        return response.format(crisis_line=self.CRISIS_LINE)
    
    def process_query(self, query: str) -> Dict:
        """
        Process a user query through the full pipeline.
        
        Args:
            query: User's input text.
            
        Returns:
            Dict with keys:
                - intent: classified intent label
                - confidence: confidence scores from intent model
                - response: generated response text
                - language: detected language
                - source: which backend generated the response
        """
        # Step 1: Detect language
        language = self.detect_language(query)
        
        # Step 2: Classify intent
        intent_label, confidence = self.intent_backend.predict_intent(query)
        
        # Step 3: Route based on intent
        response = ""
        source = ""
        
        if intent_label == "Out of context":
            response = self.get_response(query, language, self.OUT_OF_CONTEXT_RESPONSES)
            source = "out_of_context_handler"
            
        elif intent_label == "Harm":
            response = self.get_response(query, language, self.HARM_RESPONSES)
            source = "harm_crisis_handler"
            
        elif intent_label == "Exact fact":
            if self.rag_backend:
                try:
                    response = self.rag_backend.generate_response(query, language=language)
                    source = "rag_scientific"
                except Exception as e:
                    response = f"Error generating response: {e}"
                    source = "rag_error"
            else:
                # Fallback if RAG not loaded
                fallback = {
                    "ar": "عذراً، نظام المعلومات العلمية غير متاح حالياً. يرجى المحاولة لاحقاً.",
                    "fr": "Désolé, le système d'information scientifique n'est pas disponible actuellement. Veuillez réessayer plus tard.",
                    "dz": "سمحلي، نظام المعلومات العلمية ماشي متوفر دوك. عاود حاول من بعد.",
                    "en": "Sorry, the scientific information system is not available at the moment. Please try again later."
                }
                response = fallback.get(language, fallback["en"])
                source = "rag_unavailable"
                
        elif intent_label == "Looking for support":
            response = self.get_response(query, language, self.SUPPORT_IN_DEV_RESPONSES)
            source = "support_in_development"
        
        return {
            "intent": intent_label,
            "confidence": confidence,
            "response": response,
            "language": language,
            "source": source
        }


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("Amal Backend Test")
    print("=" * 60)
    
    # Initialize without RAG for quick testing
    backend = AmalBackend(load_rag=False)
    
    # Test queries for each intent
    test_queries = [
        # Out of context
        ("كيفاش راهي حالة الطقس في وهران؟", "Out of context (Arabic)"),
        ("match l'algérie lyoum wa9tach?", "Out of context (Darija)"),
        
        # Harm
        ("راني حاب نشرب قاع الدوا لي عندي باش نرقد وما نوضش", "Harm (Arabic)"),
        ("je veux me faire du mal", "Harm (French)"),
        
        # Exact fact
        ("ما هي أعراض انسحاب الكوكايين؟", "Exact fact (Arabic)"),
        ("win kayen centre d'addictologie f dzayer?", "Exact fact (Darija)"),
        
        # Looking for support
        ("حاب نبرا من لادروك عاونوني", "Looking for support (Arabic)"),
        ("راني تعبت نفسيا من هاد الإدمان", "Looking for support (Arabic)"),
    ]
    
    print("\nProcessing test queries:")
    print("-" * 60)
    
    for query, description in test_queries:
        print(f"\n📝 Query: {query}")
        print(f"   Expected: {description}")
        
        result = backend.process_query(query)
        
        print(f"   Intent: {result['intent']}")
        print(f"   Language: {result['language']}")
        print(f"   Source: {result['source']}")
        print(f"   Response: {result['response'][:100]}...")
    
    print("\n" + "=" * 60)
    print("Test completed!")
