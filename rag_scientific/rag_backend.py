import os
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
from typing import List, Dict, Tuple, Optional
import time
from dotenv import load_dotenv
from pathlib import Path

class RAGBackend:
    def __init__(self, persist_dir: str = "./full_database", collection_name: str = "improved_drug_research"):
        """
        Initialize the RAG Backend system.
        
        Args:
            persist_dir: Path to the persistent ChromaDB directory.
            collection_name: Name of the ChromaDB collection.
        """
        # Load environment variables
        load_dotenv()
        
        self.persist_dir = persist_dir
        self.collection_name = collection_name
        
        # Initialize Google GenAI
        self._init_genai()
        
        # Initialize Embedding Model
        self._init_embedding_model()
        
        # Initialize ChromaDB
        self._init_chromadb()
        
    def _init_genai(self):
        """Configure the Google Gemini API."""
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key:
            # Fallback or error - for backend integration better to raise error or rely on env
            print("Warning: GOOGLE_API_KEY not found in environment variables.")
        
        if api_key:
            genai.configure(api_key=api_key)
            
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        print("✓ Gemini 2.5 Flash configured")

    def _init_embedding_model(self):
        """Load the SentenceTransformer embedding model."""
        print("Loading embedding model...")
        # Using the same model as in the notebook
        self.embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        print("✓ Embedding model loaded")

    def _init_chromadb(self):
        """Connect to the persistent ChromaDB."""
        if not os.path.exists(self.persist_dir):
            raise FileNotFoundError(f"ChromaDB persistence directory not found at {self.persist_dir}")

        print(f"Connecting to ChromaDB at {self.persist_dir}...")
        self.chroma_client = chromadb.PersistentClient(
            path=self.persist_dir,
            settings=Settings(anonymized_telemetry=False)
        )
        
        # Check if collection exists
        existing_collections = [col.name for col in self.chroma_client.list_collections()]
        if self.collection_name not in existing_collections:
             raise ValueError(f"Collection '{self.collection_name}' not found in database. Available: {existing_collections}")
             
        self.collection = self.chroma_client.get_collection(name=self.collection_name)
        print(f"✓ Connected to collection '{self.collection_name}' with {self.collection.count()} chunks")

    def retrieve_relevant_chunks(self, query: str, n_results: int = 5) -> Tuple[List[str], List[Dict]]:
        """
        Retrieve relevant chunks for a given query using semantic search.
        """
        # Generate query embedding
        query_embedding = self.embedding_model.encode([query])[0].tolist()
        
        # Query ChromaDB
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        documents = results['documents'][0] if results['documents'] else []
        metadatas = results['metadatas'][0] if results['metadatas'] else []
        
        return documents, metadatas

    def generate_response(self, query: str, language: str = "ar", n_results: int = 5, max_retries: int = 3) -> str:
        """
        Generate a response using RAG in the specified language.
        
        Args:
            query: The user's question.
            language: Response language ('ar', 'fr', 'en', 'dz').
            n_results: Number of context chunks to retrieve.
            max_retries: Number of retries for the LLM call.
            
        Returns:
            The generated response string.
        """
        # Retrieve relevant chunks
        documents, metadatas = self.retrieve_relevant_chunks(query, n_results)
        
        if not documents:
            no_info_messages = {
                "ar": "لم يتم العثور على معلومات ذات صلة في قاعدة المعرفة.",
                "fr": "Aucune information pertinente trouvée dans la base de connaissances.",
                "en": "No relevant information found in the knowledge base.",
                "dz": "ما لقيناش معلومات في قاعدة البيانات."
            }
            return no_info_messages.get(language, no_info_messages["en"])
        
        # Build enhanced context with metadata
        context_parts = []
        for doc, meta in zip(documents, metadatas):
            context_part = f"**Context from {meta.get('category', 'Unknown')}:**\n{doc}"
            if meta.get('geographic_context') and meta.get('geographic_context') != 'unknown':
                context_part += f"\n- Geographic Context: {meta['geographic_context']}"
            if meta.get('timeframe') and meta.get('timeframe') != 'unknown':
                context_part += f"\n- Timeframe: {meta['timeframe']}"
            context_parts.append(context_part)
        
        context = "\n\n".join(context_parts)
        
        # Language-specific prompts
        prompts = {
            "ar": f"""بناءً على السياق التالي، أجب عن السؤال بدقة باللغة العربية:

السياق:
{context}

السؤال: {query}

قدم إجابة شاملة ومفصلة بناءً على المعلومات المتوفرة في السياق. إذا كانت المعلومات غير كافية، أشر إلى ذلك.
أجب باللغة العربية الفصحى.""",

            "fr": f"""En vous basant sur le contexte suivant, répondez à la question avec précision en français:

Contexte:
{context}

Question: {query}

Fournissez une réponse complète et détaillée basée sur les informations disponibles dans le contexte. Si les informations sont insuffisantes, indiquez-le.
Répondez en français.""",

            "en": f"""Based on the following context, answer the question accurately in English:

Context:
{context}

Question: {query}

Provide a comprehensive and detailed answer based on the information available in the context. If the information is insufficient, indicate that.
Answer in English.""",

            "dz": f"""بناءً على السياق التالي، جاوب على السؤال بالدارجة الجزائرية:

السياق:
{context}

السؤال: {query}

عطي إجابة كاملة ومفصلة بناءً على المعلومات الموجودة في السياق. إذا المعلومات ماكانتش كافية، قول هذا.
جاوب بالدارجة الجزائرية (مزيج من العربية والفرنسية كيما يهدرو في الجزائر)."""
        }
        
        prompt = prompts.get(language, prompts["en"])
        
        # Query LLM with retries
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                return response.text
            except Exception as e:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt
                    time.sleep(wait_time)
                else:
                    return f"Error generating response: {str(e)}"
        
        return "Failed to generate response after retries."

if __name__ == "__main__":
    # Simple test when running the file directly
    print("Initializing RAG Backend...")
    try:
        rag = RAGBackend()
        
        test_query = "ما هي معدلات استخدام القنب في شمال أفريقيا؟"
        print(f"\nTest Query: {test_query}")
        
        response = rag.generate_response(test_query)
        print("\nResponse:")
        print(response)
    except Exception as e:
        print(f"\nInitialization failed: {e}")
        print("Make sure you have run the notebook to generate the database first.")
