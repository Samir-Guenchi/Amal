import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name?: string) => Promise<boolean>;
  signOut: () => void;
  continueAsGuest: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  loadStoredAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

const AUTH_STORAGE_KEY = '@amal_auth';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isGuest: true, // Lazy login - start as guest
  isLoading: false,
  accessToken: null,
  refreshToken: null,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.login(email, password);
      
      if (response.success && response.user && response.access_token) {
        // Store tokens
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
          user: response.user,
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
        }));
        
        set({
          user: response.user,
          isAuthenticated: true,
          isGuest: false,
          isLoading: false,
          accessToken: response.access_token,
          refreshToken: response.refresh_token || null,
        });
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: response.error || 'Login failed' 
        });
        return false;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      set({ 
        isLoading: false, 
        error: 'Connection error. Please try again.' 
      });
      return false;
    }
  },

  signUp: async (email: string, password: string, name?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.signup(email, password, name);
      
      if (response.success && response.user && response.access_token) {
        // Store tokens
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
          user: response.user,
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
        }));
        
        set({
          user: response.user,
          isAuthenticated: true,
          isGuest: false,
          isLoading: false,
          accessToken: response.access_token,
          refreshToken: response.refresh_token || null,
        });
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: response.error || 'Signup failed' 
        });
        return false;
      }
    } catch (error) {
      console.error('Sign up error:', error);
      set({ 
        isLoading: false, 
        error: 'Connection error. Please try again.' 
      });
      return false;
    }
  },

  signOut: async () => {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    set({
      user: null,
      isAuthenticated: false,
      isGuest: true,
      accessToken: null,
      refreshToken: null,
      error: null,
    });
  },

  continueAsGuest: () => {
    set({ isGuest: true, isAuthenticated: false, error: null });
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.forgotPassword(email);
      set({ isLoading: false });
      return { 
        success: response.success, 
        message: response.message 
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      set({ 
        isLoading: false, 
        error: 'Connection error. Please try again.' 
      });
      return { success: false };
    }
  },

  resetPassword: async (token: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.resetPassword(token, newPassword);
      set({ isLoading: false });
      
      if (!response.success) {
        set({ error: response.error || 'Reset failed' });
      }
      return response.success;
    } catch (error) {
      console.error('Reset password error:', error);
      set({ 
        isLoading: false, 
        error: 'Connection error. Please try again.' 
      });
      return false;
    }
  },

  loadStoredAuth: async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const { user, accessToken, refreshToken } = JSON.parse(stored);
        
        // Verify token is still valid
        if (accessToken) {
          const currentUser = await api.getCurrentUser(accessToken);
          if (currentUser) {
            set({
              user: currentUser,
              isAuthenticated: true,
              isGuest: false,
              accessToken,
              refreshToken,
            });
            return;
          }
        }
        
        // Token invalid, try refresh
        if (refreshToken) {
          const response = await api.refreshTokens(refreshToken);
          if (response.success && response.access_token) {
            await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
              user,
              accessToken: response.access_token,
              refreshToken: response.refresh_token,
            }));
            set({
              user,
              isAuthenticated: true,
              isGuest: false,
              accessToken: response.access_token,
              refreshToken: response.refresh_token || null,
            });
            return;
          }
        }
        
        // All tokens invalid, clear storage
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Load stored auth error:', error);
    }
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),
  
  clearError: () => set({ error: null }),
}));
