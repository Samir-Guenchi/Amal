import type { LLMRequest, LLMResponse, Language } from '../types';
import { sendChatMessage, ChatResponse } from './api';

/**
 * LLM Service for RAG-powered chat
 * Connects to Amal backend API for intent classification and RAG responses.
 */
class LLMService {
  /**
   * Send a message to the backend and get a response
   */
  async chat(request: LLMRequest): Promise<LLMResponse> {
    try {
      console.log('[LLM] Sending message to backend:', request.message);
      
      const response: ChatResponse = await sendChatMessage(request.message);
      
      console.log('[LLM] Got response from backend:', response.intent, response.source);
      
      return {
        content: response.response,
        sessionId: request.sessionId || 'session',
        sources: [],
      };
    } catch (error) {
      console.error('[LLM] Backend error, using fallback:', error);
      // Fall back to mock response if backend fails
      return this.getMockResponse(request);
    }
  }

  /**
   * Mock response generator for fallback
   */
  private async getMockResponse(request: LLMRequest): Promise<LLMResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const responses: Record<Language, string[]> = {
      en: [
        "I understand this is difficult. Recovery is a journey, and every step matters.",
        "Thank you for sharing. It takes courage to talk about these things.",
        "You're not alone in this. Many people have walked this path.",
      ],
      ar: [
        "أفهم أن هذا صعب. التعافي رحلة، وكل خطوة مهمة.",
        "شكراً لمشاركتك. يتطلب الأمر شجاعة للتحدث عن هذه الأمور.",
        "لست وحدك في هذا. كثيرون سلكوا هذا الطريق.",
      ],
      fr: [
        "Je comprends que c'est difficile. Le rétablissement est un voyage.",
        "Merci de partager. Il faut du courage pour parler de ces choses.",
        "Vous n'êtes pas seul. Beaucoup ont parcouru ce chemin.",
      ],
      dz: [
        "نفهم بلي هذا صعيب. التعافي رحلة، وكل خطوة مهمة.",
        "شكراً على المشاركة. يحتاج شجاعة باش تهدر على هاد الحوايج.",
        "ماكش وحدك في هذا. بزاف ناس داروا هاد الطريق.",
      ],
    };

    const langResponses = responses[request.language] || responses.en;
    const randomResponse = langResponses[Math.floor(Math.random() * langResponses.length)];

    return {
      content: randomResponse,
      sessionId: request.sessionId || 'mock-session',
      sources: [],
    };
  }
}

export const llmService = new LLMService();
