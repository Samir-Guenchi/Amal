# Amal - أمل

A Cross-Platform Multilingual LLM & Retrieval-Augmented Generation System for Drug Addiction Awareness, Prevention, and Recovery Support in Algeria.

## Overview

Amal (Arabic for "Hope") is an AI-powered platform providing:
- Multilingual support (Arabic, French, Darija, English)
- Intent classification using MarBERT
- RAG-based scientific information retrieval
- Crisis intervention with 3033 hotline integration
- Web and mobile applications

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│  ┌──────────────────┐              ┌──────────────────────────┐ │
│  │   Web Frontend   │              │    Mobile Application    │ │
│  │   React + Vite   │              │   React Native + Expo    │ │
│  │   TypeScript     │              │   TypeScript             │ │
│  │   Tailwind CSS   │              │   React Navigation       │ │
│  │   Zustand        │              │   Zustand + AsyncStorage │ │
│  └────────┬─────────┘              └───────────┬──────────────┘ │
└───────────┼────────────────────────────────────┼────────────────┘
            │              REST API              │
            └──────────────────┬─────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                    Backend API (FastAPI)                         │
│                         Port: 8000                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Amal Orchestrator                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │    Intent    │  │     RAG      │  │     Support      │  │ │
│  │  │  Classifier  │  │  Scientific  │  │      Model       │  │ │
│  │  │   MarBERT    │  │   ChromaDB   │  │   Qwen2.5-7B     │  │ │
│  │  │  + OOD Det.  │  │  + Gemini    │  │   + LoRA         │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Authentication (JWT)                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                      Database (PostgreSQL)                       │
│                    Users, Conversations, Messages                │
└─────────────────────────────────────────────────────────────────┘
```

## Repository Structure

This repository is organized into separate branches for each component:

| Branch | Description | Tech Stack |
|--------|-------------|------------|
| `main` | Complete project with all components | - |
| `frontend` | React web application | React, TypeScript, Vite, Tailwind |
| `mobile` | React Native mobile app | React Native, Expo, TypeScript |
| `backend` | FastAPI server | Python, FastAPI, JWT |
| `intent_model` | Intent classification | MarBERT, PyTorch, Transformers |
| `rag_scientific` | RAG system | ChromaDB, Gemini, Sentence Transformers |
| `model_support` | Support model | Qwen2.5-7B, LoRA, PEFT |
| `database` | PostgreSQL schema | PostgreSQL, Docker |

## Quick Start

### Prerequisites

- Python >= 3.10
- Node.js >= 18.0
- npm >= 9.0
- (Optional) GPU with 8GB+ VRAM for support model

### 1. Clone Repository

```bash
git clone https://github.com/Samir-Guenchi/Amal.git
cd Amal
```

### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp backend/.env.example backend/.env
# Edit .env with your API keys

# Start the backend server
cd backend
python server.py
```

Backend runs at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

### 4. Mobile Setup

```bash
cd mobile
npm install

# Update API URL in src/services/api.ts with your computer's IP
npx expo start
```

Scan QR code with Expo Go app on your phone.

## Component Documentation

Each component has its own README and LaTeX technical report:

### Frontend (`/frontend`)
- **README.md** - Installation and usage guide
- **docs/report.tex** - Framework selection justification (React, Vite, Tailwind, Zustand)
- **requirements.txt** - Dependencies

### Backend (`/backend`)
- **README.md** - API documentation
- **docs/report.tex** - Architecture report (FastAPI, JWT, Orchestrator pattern)
- **requirements.txt** - Python dependencies

### Mobile (`/mobile`)
- **README.md** - Setup guide for Android/iOS
- **docs/report.tex** - React Native + Expo justification
- **requirements.txt** - Dependencies

### Intent Model (`/intent_model`)
- **README.md** - Model architecture and usage
- **docs/report.tex** - MarBERT + OOD detection methodology
- **requirements.txt** - ML dependencies

### RAG Scientific (`/rag_scientific`)
- **README.md** - RAG system documentation
- **docs/report.tex** - ChromaDB + Gemini architecture
- **requirements.txt** - Dependencies

### Support Model (`/model_support`)
- **README.md** - Qwen2.5 + LoRA setup
- **docs/report.tex** - Fine-tuning methodology
- **requirements.txt** - GPU requirements

### Database (`/database`)
- **README.md** - Schema documentation
- **docs/report.tex** - PostgreSQL design decisions
- **docker-compose.yml** - Docker setup

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Intent Classification | ✅ | MarBERT + OOD detection |
| RAG Scientific | ✅ | ChromaDB + Gemini |
| Support Model | 🔄 | Qwen2.5-7B (in development) |
| Web Frontend | ✅ | React + TypeScript |
| Mobile App | ✅ | React Native + Expo |
| Authentication | ✅ | JWT-based auth |
| Multilingual | ✅ | AR, FR, DZ, EN |
| Database | ✅ | PostgreSQL schema |

## API Endpoints

### Chat
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | Send message to AI |
| `/health` | GET | Check server status |

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/signup` | POST | Register user |
| `/auth/login` | POST | User login |
| `/auth/forgot-password` | POST | Password reset request |
| `/auth/reset-password` | POST | Reset password |
| `/auth/refresh` | POST | Refresh access token |
| `/auth/me` | GET | Get current user |

## Intent Classification Flow

```
User Query
    │
    ▼
┌─────────────────┐
│ Language Detect │ → ar, fr, en, dz
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ OOD Detection   │ → Out of context?
└────────┬────────┘
         │
    ┌────┴────┬────────────┬──────────────┐
    ▼         ▼            ▼              ▼
Out of     Harm        Exact Fact    Looking for
Context    │           │              Support
│          │           │              │
▼          ▼           ▼              ▼
Polite     Crisis      RAG            Support
Rejection  Response    Scientific     Model
           (3033)      (Gemini)       (Qwen2.5)
```

## Languages Supported

| Code | Language | Script |
|------|----------|--------|
| `ar` | Arabic | العربية |
| `fr` | French | Français |
| `dz` | Darija | الدارجة الجزائرية |
| `en` | English | English |

## Crisis Support

If you or someone you know is struggling with addiction:

📞 **3033** - Free, confidential helpline available 24/7

## Research Papers

Each component includes a LaTeX technical report suitable for academic publication:

1. `frontend/docs/report.tex` - Web Frontend Architecture
2. `backend/docs/report.tex` - API Server Design
3. `mobile/docs/report.tex` - Mobile Application Development
4. `intent_model/docs/report.tex` - Intent Classification with MarBERT
5. `rag_scientific/docs/report.tex` - RAG for Drug Information
6. `model_support/docs/report.tex` - Empathetic Support Model
7. `database/docs/report.tex` - Database Schema Design

Compile with: `pdflatex report.tex`

## Contributing

1. Fork the repository
2. Create a feature branch from the relevant component branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details.

## Author

**Samir Guenchi**

---

*Amal - Bringing hope through technology*
