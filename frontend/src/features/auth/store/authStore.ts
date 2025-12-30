import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as api from '../../../services/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  clearError: () => void;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.login(email, password);

          if (response.success && response.user && response.access_token) {
            set({
              user: response.user,
              accessToken: response.access_token,
              refreshToken: response.refresh_token || null,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          } else {
            set({
              error: response.error || 'Login failed',
              isLoading: false,
            });
            return false;
          }
        } catch (error) {
          set({
            error: 'Connection error. Please try again.',
            isLoading: false,
          });
          return false;
        }
      },

      signup: async (email: string, password: string, name?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.signup(email, password, name);

          if (response.success && response.user && response.access_token) {
            set({
              user: response.user,
              accessToken: response.access_token,
              refreshToken: response.refresh_token || null,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          } else {
            set({
              error: response.error || 'Signup failed',
              isLoading: false,
            });
            return false;
          }
        } catch (error) {
          set({
            error: 'Connection error. Please try again.',
            isLoading: false,
          });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.forgotPassword(email);
          set({ isLoading: false });
          return {
            success: response.success,
            message: response.message,
          };
        } catch (error) {
          set({
            error: 'Connection error. Please try again.',
            isLoading: false,
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
          set({
            error: 'Connection error. Please try again.',
            isLoading: false,
          });
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      loadStoredAuth: async () => {
        const { accessToken, refreshToken, user } = get();
        
        if (accessToken) {
          // Verify token is still valid
          const currentUser = await api.getCurrentUser(accessToken);
          if (currentUser) {
            set({ user: currentUser, isAuthenticated: true });
            return;
          }
        }
        
        // Try refresh token
        if (refreshToken) {
          const response = await api.refreshTokens(refreshToken);
          if (response.success && response.access_token) {
            set({
              accessToken: response.access_token,
              refreshToken: response.refresh_token || null,
              isAuthenticated: true,
            });
            return;
          }
        }
        
        // All tokens invalid
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'amal-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
