# Amal RAG Scientific

Retrieval-Augmented Generation system for drug addiction scientific information using ChromaDB and Google Gemini.

## Architecture

```
User Query
    │
    ▼
┌─────────────────────────────┐
│  Sentence Transformer       │
│  (paraphrase-multilingual-  │
│   MiniLM-L12-v2)           │
└───────────┬─────────────────┘
            │ Query Embedding
            ▼
┌─────────────────────────────┐
│       ChromaDB              │
│   (Vector Database)         │
│   - Drug research papers    │
│   - Scientific articles     │
│   - Treatment guidelines    │
└───────────┬─────────────────┘
            │ Top-K Chunks
            ▼
┌─────────────────────────────┐
│    Google Gemini 2.5        │
│    (Response Generation)    │
│    - Language-aware prompts │
│    - Context synthesis      │
└───────────┬─────────────────┘
            │
            ▼
    Multilingual Response
    (AR/FR/EN/DZ)
```

## Features

- Semantic search over scientific drug research
- Multilingual response generation (Arabic, French, English, Darija)
- Metadata-enriched context (geographic, temporal)
- Retry logic for API reliability

## Files

```
rag_scientific/
├── rag_backend.py       # RAG backend class
├── requirements.txt     # Python dependencies
├── full_database/       # ChromaDB persistence (not in git)
└── .env                 # API keys (not in git)
```

## Requirements

```
chromadb>=0.4.0
sentence-transformers>=2.2.0
google-generativeai>=0.3.0
python-dotenv>=1.0.0
```

## Installation

```bash
cd rag_scientific
pip install -r requirements.txt
```

## Configuration

Create a `.env` file:

```env
GOOGLE_API_KEY=your-gemini-api-key
```

Get your API key from: https://makersuite.google.com/app/apikey

## Usage

```python
from rag_backend import RAGBackend

# Initialize
rag = RAGBackend(persist_dir="./full_database")

# Generate response in Arabic
response = rag.generate_response(
    query="ما هي أعراض انسحاب الكوكايين؟",
    language="ar"
)
print(response)

# Generate response in French
response = rag.generate_response(
    query="Quels sont les effets du cannabis?",
    language="fr"
)
print(response)
```

## API Reference

### RAGBackend

```python
class RAGBackend:
    def __init__(
        self,
        persist_dir: str = "./full_database",
        collection_name: str = "improved_drug_research"
    )
```

### Methods

#### `retrieve_relevant_chunks(query, n_results=5)`

Retrieve relevant document chunks using semantic search.

**Returns:** `Tuple[List[str], List[Dict]]` - Documents and metadata

#### `generate_response(query, language="ar", n_results=5)`

Generate a response using RAG.

**Parameters:**
- `query`: User's question
- `language`: Response language (`ar`, `fr`, `en`, `dz`)
- `n_results`: Number of context chunks

**Returns:** `str` - Generated response

## Supported Languages

| Code | Language | Description |
|------|----------|-------------|
| `ar` | Arabic | Modern Standard Arabic |
| `fr` | French | Standard French |
| `en` | English | Standard English |
| `dz` | Darija | Algerian Arabic dialect |

## Database Setup

The ChromaDB database must be pre-populated with scientific documents. See the training notebooks for database creation.

Required structure:
```
full_database/
├── chroma.sqlite3
└── [collection files]
```

## Error Handling

The backend includes:
- Retry logic for Gemini API (exponential backoff)
- Graceful handling of missing documents
- Language-specific "no information" messages

## License

MIT License
