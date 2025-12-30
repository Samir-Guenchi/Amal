"""
FastAPI Server for Amal Backend
Provides REST API endpoints for the frontend chat interface.
"""

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
import uvicorn

from amal_backend import AmalBackend
from auth import auth_backend

# Initialize FastAPI app
app = FastAPI(
    title="Amal API",
    description="Drug recovery support AI backend for Algeria",
    version="1.0.0"
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global backend instance (loaded on startup)
backend: Optional[AmalBackend] = None


# ============================================
# Request/Response Models
# ============================================

# Chat models
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    intent: str
    confidence: Dict
    response: str
    language: str
    source: str


class HealthResponse(BaseModel):
    status: str
    intent_model: bool
    rag_model: bool


# Auth models
class SignupRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class AuthResponse(BaseModel):
    success: bool
    user: Optional[Dict] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    error: Optional[str] = None
    message: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: str


@app.on_event("startup")
async def startup_event():
    """Load models on server startup."""
    global backend
    print("\n🚀 Starting Amal API Server...")
    backend = AmalBackend(load_rag=True)
    print("✓ Server ready!\n")


@app.get("/", response_model=Dict)
async def root():
    """Root endpoint."""
    return {
        "name": "Amal API",
        "version": "1.0.0",
        "description": "Drug recovery support AI for Algeria",
        "endpoints": {
            "POST /chat": "Send a message and get AI response",
            "GET /health": "Check server health status"
        }
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check if all models are loaded."""
    return HealthResponse(
        status="healthy" if backend else "initializing",
        intent_model=backend.intent_backend is not None if backend else False,
        rag_model=backend.rag_backend is not None if backend else False
    )


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process a chat message and return AI response.
    
    The backend will:
    1. Classify intent (Out of context, Harm, Exact fact, Looking for support)
    2. Route to appropriate handler
    3. Return response in user's detected language
    """
    if not backend:
        raise HTTPException(status_code=503, detail="Backend not initialized")
    
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    try:
        result = backend.process_query(request.message.strip())
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Authentication Endpoints
# ============================================

@app.post("/auth/signup", response_model=AuthResponse)
async def signup(request: SignupRequest):
    """
    Register a new user account.
    
    Returns access and refresh tokens on success.
    """
    result = auth_backend.signup(
        email=request.email,
        password=request.password,
        name=request.name
    )
    return AuthResponse(**result)


@app.post("/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Authenticate user and return tokens.
    """
    result = auth_backend.login(
        email=request.email,
        password=request.password
    )
    return AuthResponse(**result)


@app.post("/auth/forgot-password", response_model=AuthResponse)
async def forgot_password(request: ForgotPasswordRequest):
    """
    Request password reset.
    
    In production, sends email with reset link.
    For development, returns reset token in response.
    """
    result = auth_backend.forgot_password(email=request.email)
    return AuthResponse(**result)


@app.post("/auth/reset-password", response_model=AuthResponse)
async def reset_password(request: ResetPasswordRequest):
    """
    Reset password using reset token.
    """
    result = auth_backend.reset_password(
        token=request.token,
        new_password=request.new_password
    )
    return AuthResponse(**result)


@app.post("/auth/refresh", response_model=AuthResponse)
async def refresh_tokens(request: RefreshTokenRequest):
    """
    Get new access token using refresh token.
    """
    result = auth_backend.refresh_tokens(refresh_token=request.refresh_token)
    return AuthResponse(**result)


@app.get("/auth/me", response_model=UserResponse)
async def get_current_user(authorization: str = Header(None)):
    """
    Get current user info from access token.
    
    Requires Authorization header: Bearer <access_token>
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    user = auth_backend.verify_access_token(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return UserResponse(**user)


if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
