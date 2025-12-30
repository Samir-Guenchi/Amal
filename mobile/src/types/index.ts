// Multilingual text support
export type Language = 'en' | 'ar' | 'fr' | 'dz';

export type LocalizedText = {
  en: string;
  ar: string;
  fr: string;
  dz: string;
};

// Theme
export type Theme = 'light' | 'dark';

// Chat types
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  intent?: string;
  source?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// LLM/RAG types (for future integration)
export interface LLMRequest {
  message: string;
  sessionId?: string;
  language: Language;
  context?: string[];
}

export interface LLMResponse {
  content: string;
  sources?: RAGSource[];
  sessionId: string;
}

export interface RAGSource {
  title: string;
  content: string;
  relevanceScore: number;
}

// Resources types
export interface EmergencyContact {
  name: LocalizedText;
  number: string;
  description: LocalizedText;
  primary: boolean;
}

export interface TreatmentCenter {
  name: LocalizedText;
  type: LocalizedText;
  location: LocalizedText;
}
