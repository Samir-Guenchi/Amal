import { create } from 'zustand';
import type { Message, ChatSession } from '../types';

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  isTemporaryMode: boolean;
  temporaryMessages: Message[];
  
  // Actions
  createSession: () => string;
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  setCurrentSession: (sessionId: string | null) => void;
  deleteSession: (sessionId: string) => void;
  renameSession: (sessionId: string, title: string) => void;
  setLoading: (loading: boolean) => void;
  getCurrentSession: () => ChatSession | null;
  
  // Temporary mode
  setTemporaryMode: (enabled: boolean) => void;
  addTemporaryMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearTemporaryMessages: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  isLoading: false,
  isTemporaryMode: false,
  temporaryMessages: [],

  createSession: () => {
    const id = generateId();
    const newSession: ChatSession = {
      id,
      title: 'New conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      sessions: [newSession, ...state.sessions],
      currentSessionId: id,
      isTemporaryMode: false,
    }));
    return id;
  },

  addMessage: (sessionId, message) => {
    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: new Date(),
    };
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              messages: [...session.messages, newMessage],
              updatedAt: new Date(),
              title: session.messages.length === 0 && message.role === 'user'
                ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
                : session.title,
            }
          : session
      ),
    }));
  },

  setCurrentSession: (sessionId) => set({ currentSessionId: sessionId, isTemporaryMode: false }),

  deleteSession: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
      currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
    })),

  renameSession: (sessionId, title) =>
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, title } : s)),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  getCurrentSession: () => {
    const { sessions, currentSessionId } = get();
    return sessions.find((s) => s.id === currentSessionId) || null;
  },

  // Temporary mode functions
  setTemporaryMode: (enabled) => set({ 
    isTemporaryMode: enabled, 
    temporaryMessages: enabled ? [] : get().temporaryMessages,
    currentSessionId: enabled ? null : get().currentSessionId,
  }),

  addTemporaryMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: new Date(),
    };
    set((state) => ({
      temporaryMessages: [...state.temporaryMessages, newMessage],
    }));
  },

  clearTemporaryMessages: () => set({ temporaryMessages: [] }),
}));
