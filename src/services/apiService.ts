import { Message } from '../types';

const BASE_URL = '/api';

export interface ChatRequest {
  message: string;
  behavioural_summary: string;
  concerns: string[];
  conversation_history: Message[];
  cbt_context?: string;
}

export interface ChatResponse {
  reply: string;
  updatedSummary: string;
  suggestedTags: string[];
}

export const apiService = {
  async ping() {
    try {
      const response = await fetch(`${BASE_URL}/ping`);
      return response.ok;
    } catch (error) {
      console.error('Ping failed:', error);
      return false;
    }
  },

  async query(data: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = typeof errorData.detail === 'object' 
          ? JSON.stringify(errorData.detail) 
          : (errorData.detail || errorData.error || JSON.stringify(errorData));
      } catch {
        try {
          errorMessage = await response.text() || response.statusText;
        } catch {
          // Fallback
        }
      }
      throw new Error(`Chat request failed: ${errorMessage}`);
    }

    return response.json();
  }
};
