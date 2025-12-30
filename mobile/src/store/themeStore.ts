import { create } from 'zustand';
import type { Theme } from '../types';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark' as Theme,
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setTheme: (theme: Theme) => set({ theme }),
}));

// Theme colors - matching frontend exactly
export const colors = {
  dark: {
    background: '#09090b',
    surface: '#18181b',
    surfaceHover: '#27272a',
    card: '#18181b',
    text: '#ffffff',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    border: '#27272a',
    primary: '#22c55e',
    primaryDark: '#16a34a',
    primaryMuted: 'rgba(34, 197, 94, 0.2)',
    primaryLight: 'rgba(34, 197, 94, 0.1)',
    danger: '#ef4444',
    dangerMuted: 'rgba(239, 68, 68, 0.1)',
    purple: '#a855f7',
    purpleMuted: 'rgba(168, 85, 247, 0.2)',
    blue: '#3b82f6',
    blueMuted: 'rgba(59, 130, 246, 0.2)',
    amber: '#f59e0b',
    amberMuted: 'rgba(245, 158, 11, 0.1)',
  },
  light: {
    background: '#fafafa',
    surface: '#ffffff',
    surfaceHover: '#f4f4f5',
    card: '#ffffff',
    text: '#18181b',
    textSecondary: '#52525b',
    textMuted: '#71717a',
    border: '#e4e4e7',
    primary: '#16a34a',
    primaryDark: '#15803d',
    primaryMuted: 'rgba(22, 163, 74, 0.1)',
    primaryLight: 'rgba(22, 163, 74, 0.05)',
    danger: '#dc2626',
    dangerMuted: 'rgba(220, 38, 38, 0.05)',
    purple: '#9333ea',
    purpleMuted: 'rgba(147, 51, 234, 0.1)',
    blue: '#2563eb',
    blueMuted: 'rgba(37, 99, 235, 0.1)',
    amber: '#d97706',
    amberMuted: 'rgba(217, 119, 6, 0.05)',
  },
};
