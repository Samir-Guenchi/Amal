/**
 * API Service for Amal Backend
 * Connects mobile app to the Python backend
 */

// IMPORTANT: Update this IP to your computer's IP address
// Find it with: ipconfig (Windows) or ifconfig (Mac/Linux)
// For Android Emulator: use 'http://10.0.2.2:8000'
// For Physical Device: use your computer's IP like 'http://192.168.x.x:8000'
const API_BASE_URL = 'http://192.168.43.220:8000';

// ============================================
// Chat Types
// ============================================

export interface ChatResponse {
  intent: string;
  confidence: {
    stage: string;
    p_ood?: number;
    p_intent?: number;
  };
  response: string;
  language: string;
  source: string;
}

export interface HealthResponse {
  status: string;
  intent_model: boolean;
  rag_model: boolean;
}

// ============================================
// Auth Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  access_token?: string;
  refresh_token?: string;
  error?: string;
  message?: string;
  reset_token?: string; // Only in development
}

// ============================================
// Chat API
// ============================================

/**
 * Send a chat message to the backend
 */
export async function sendChatMessage(message: string): Promise<ChatResponse> {
  console.log('Sending to backend:', API_BASE_URL, message);
  
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP error ${response.status}`);
  }

  const data = await response.json();
  console.log('Backend response:', data);
  return data;
}

/**
 * Check backend health status
 */
export async function checkHealth(): Promise<HealthResponse> {
  console.log('Checking backend health:', API_BASE_URL);
  
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Check if backend is available
 */
export async function isBackendAvailable(): Promise<boolean> {
  try {
    const health = await checkHealth();
    console.log('Backend health:', health);
    return health.status === 'healthy';
  } catch (error) {
    console.log('Backend not available:', error);
    return false;
  }
}

// ============================================
// Auth API
// ============================================

/**
 * Sign up a new user
 */
export async function signup(email: string, password: string, name?: string): Promise<AuthResponse> {
  console.log('Signing up:', email);
  
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await response.json();
  console.log('Signup response:', data.success ? 'success' : data.error);
  return data;
}

/**
 * Log in an existing user
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  console.log('Logging in:', email);
  
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  console.log('Login response:', data.success ? 'success' : data.error);
  return data;
}

/**
 * Request password reset
 */
export async function forgotPassword(email: string): Promise<AuthResponse> {
  console.log('Forgot password:', email);
  
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  console.log('Forgot password response:', data.message);
  return data;
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
  console.log('Resetting password');
  
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, new_password: newPassword }),
  });

  const data = await response.json();
  console.log('Reset password response:', data.success ? 'success' : data.error);
  return data;
}

/**
 * Refresh access token
 */
export async function refreshTokens(refreshToken: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  return response.json();
}

/**
 * Get current user info
 */
export async function getCurrentUser(accessToken: string): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}
