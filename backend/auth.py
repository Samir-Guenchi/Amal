"""
Authentication Backend for Amal App
Handles signup, login, forgot password, and token management.
"""

import os
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict
from pathlib import Path

# For JWT tokens
import jwt

# Load environment
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / "database" / ".env.example")

# Secret key for JWT (in production, use environment variable)
SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_hex(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = 30


class AuthBackend:
    """
    Authentication backend with in-memory storage for development.
    In production, replace with PostgreSQL database.
    """
    
    def __init__(self):
        # In-memory storage (replace with database in production)
        self.users: Dict[str, Dict] = {}
        self.reset_tokens: Dict[str, Dict] = {}
        self.sessions: Dict[str, Dict] = {}
        
        print("✓ Auth Backend initialized (in-memory mode)")
    
    def _hash_password(self, password: str) -> str:
        """Hash password using SHA-256 with salt."""
        salt = secrets.token_hex(16)
        hash_obj = hashlib.sha256((password + salt).encode())
        return f"{salt}:{hash_obj.hexdigest()}"
    
    def _verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash."""
        try:
            salt, hash_value = hashed.split(":")
            hash_obj = hashlib.sha256((password + salt).encode())
            return hash_obj.hexdigest() == hash_value
        except:
            return False
    
    def _generate_token(self, user_id: str, token_type: str = "access") -> str:
        """Generate JWT token."""
        if token_type == "access":
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        else:
            expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        payload = {
            "sub": user_id,
            "type": token_type,
            "exp": expire,
            "iat": datetime.utcnow()
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    def _verify_token(self, token: str) -> Optional[Dict]:
        """Verify and decode JWT token."""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def signup(self, email: str, password: str, name: Optional[str] = None) -> Dict:
        """
        Register a new user.
        
        Returns:
            Dict with success status, user info, and tokens
        """
        email = email.lower().strip()
        
        # Validate email
        if not email or "@" not in email:
            return {"success": False, "error": "Invalid email address"}
        
        # Check if user exists
        if email in self.users:
            return {"success": False, "error": "Email already registered"}
        
        # Validate password
        if len(password) < 6:
            return {"success": False, "error": "Password must be at least 6 characters"}
        
        # Create user
        user_id = secrets.token_hex(16)
        self.users[email] = {
            "id": user_id,
            "email": email,
            "name": name or email.split("@")[0],
            "password_hash": self._hash_password(password),
            "created_at": datetime.utcnow().isoformat(),
            "is_verified": False
        }
        
        # Generate tokens
        access_token = self._generate_token(user_id, "access")
        refresh_token = self._generate_token(user_id, "refresh")
        
        return {
            "success": True,
            "user": {
                "id": user_id,
                "email": email,
                "name": self.users[email]["name"]
            },
            "access_token": access_token,
            "refresh_token": refresh_token
        }
    
    def login(self, email: str, password: str) -> Dict:
        """
        Authenticate user and return tokens.
        
        Returns:
            Dict with success status, user info, and tokens
        """
        email = email.lower().strip()
        
        # Check if user exists
        if email not in self.users:
            return {"success": False, "error": "Invalid email or password"}
        
        user = self.users[email]
        
        # Verify password
        if not self._verify_password(password, user["password_hash"]):
            return {"success": False, "error": "Invalid email or password"}
        
        # Generate tokens
        access_token = self._generate_token(user["id"], "access")
        refresh_token = self._generate_token(user["id"], "refresh")
        
        return {
            "success": True,
            "user": {
                "id": user["id"],
                "email": email,
                "name": user["name"]
            },
            "access_token": access_token,
            "refresh_token": refresh_token
        }
    
    def forgot_password(self, email: str) -> Dict:
        """
        Generate password reset token.
        In production, send email with reset link.
        
        Returns:
            Dict with success status and reset token (for development)
        """
        email = email.lower().strip()
        
        # Check if user exists (don't reveal if email exists for security)
        if email not in self.users:
            # Return success anyway to prevent email enumeration
            return {
                "success": True,
                "message": "If the email exists, a reset link has been sent"
            }
        
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        self.reset_tokens[reset_token] = {
            "email": email,
            "expires_at": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
            "used": False
        }
        
        # In production, send email here
        # For development, return the token
        return {
            "success": True,
            "message": "If the email exists, a reset link has been sent",
            "reset_token": reset_token  # Remove in production!
        }
    
    def reset_password(self, token: str, new_password: str) -> Dict:
        """
        Reset password using reset token.
        
        Returns:
            Dict with success status
        """
        # Validate token
        if token not in self.reset_tokens:
            return {"success": False, "error": "Invalid or expired reset token"}
        
        token_data = self.reset_tokens[token]
        
        # Check if token is used
        if token_data["used"]:
            return {"success": False, "error": "Reset token already used"}
        
        # Check if token is expired
        expires_at = datetime.fromisoformat(token_data["expires_at"])
        if datetime.utcnow() > expires_at:
            return {"success": False, "error": "Reset token has expired"}
        
        # Validate new password
        if len(new_password) < 6:
            return {"success": False, "error": "Password must be at least 6 characters"}
        
        # Update password
        email = token_data["email"]
        if email in self.users:
            self.users[email]["password_hash"] = self._hash_password(new_password)
        
        # Mark token as used
        self.reset_tokens[token]["used"] = True
        
        return {"success": True, "message": "Password reset successfully"}
    
    def verify_access_token(self, token: str) -> Optional[Dict]:
        """
        Verify access token and return user info.
        
        Returns:
            User dict if valid, None if invalid
        """
        payload = self._verify_token(token)
        if not payload or payload.get("type") != "access":
            return None
        
        user_id = payload.get("sub")
        
        # Find user by ID
        for email, user in self.users.items():
            if user["id"] == user_id:
                return {
                    "id": user["id"],
                    "email": email,
                    "name": user["name"]
                }
        
        return None
    
    def refresh_tokens(self, refresh_token: str) -> Dict:
        """
        Generate new access token using refresh token.
        
        Returns:
            Dict with new tokens
        """
        payload = self._verify_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            return {"success": False, "error": "Invalid refresh token"}
        
        user_id = payload.get("sub")
        
        # Generate new tokens
        new_access_token = self._generate_token(user_id, "access")
        new_refresh_token = self._generate_token(user_id, "refresh")
        
        return {
            "success": True,
            "access_token": new_access_token,
            "refresh_token": new_refresh_token
        }


# Singleton instance
auth_backend = AuthBackend()
