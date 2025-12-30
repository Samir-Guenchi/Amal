# Amal Backend

FastAPI server orchestrating AI models for drug addiction support in Algeria.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.104+ | REST API framework |
| Uvicorn | 0.24+ | ASGI server |
| Pydantic | 2.0+ | Data validation |
| PyJWT | 2.8+ | JWT authentication |
| Python | 3.10+ | Runtime |

## Architecture

```
backend/
├── server.py          # FastAPI application & endpoints
├── amal_backend.py    # AI model orchestrator
├── auth.py            # JWT authentication
└── requirements.txt   # Python dependencies
```

## Prerequisites

- Python >= 3.10
- pip

## Installation

```bash
cd backend
pip install -r requirements.txt
```

## Configuration

Create a `.env` file (optional):

```env
JWT_SECRET_KEY=your-secret-key-here
```

## Running the Server

```bash
python server.py
```

Server runs at `http://localhost:8000`

## API Endpoints

### Chat

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | Send message to AI |
| `/health` | GET | Check server status |

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/signup` | POST | Register new user |
| `/auth/login` | POST | User login |
| `/auth/forgot-password` | POST | Request password reset |
| `/auth/reset-password` | POST | Reset password |
| `/auth/refresh` | POST | Refresh access token |
| `/auth/me` | GET | Get current user |

## Request/Response Examples

### Chat Request

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "ما هي أعراض انسحاب الكوكايين؟"}'
```

### Response

```json
{
  "intent": "Exact fact",
  "confidence": {"stage": "intent", "p_intent": 0.95},
  "response": "أعراض انسحاب الكوكايين تشمل...",
  "language": "ar",
  "source": "rag_scientific"
}
```

## Intent Classification Flow

```
User Query
    │
    ▼
┌─────────────────┐
│ Intent Classifier│ (MarBERT + OOD)
└────────┬────────┘
         │
    ┌────┴────┬────────────┬──────────────┐
    ▼         ▼            ▼              ▼
Out of    Harm         Exact Fact    Looking for
Context   │            │              Support
│         │            │              │
▼         ▼            ▼              ▼
Polite    Crisis       RAG            Support
Rejection Response     Scientific     Model
          (3033)       (Gemini)       (In Dev)
```

## Multilingual Support

- Arabic (ar)
- French (fr)
- Darija (dz)
- English (en)

## Dependencies

See `requirements.txt` for full list.

## License

MIT License
