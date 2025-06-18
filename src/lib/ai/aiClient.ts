const AI_WORKER_URL = process.env.EXPO_PUBLIC_AI_WORKER_URL;

export interface AIEmotionResponse {
  emotion: 'happy' | 'normal' | 'sad' | 'angry';
  confidence: number;
}

export interface AIChatResponse {
  message: string;
  followupQuestions?: string[];
}

export interface AIMessageResponse {
  emotion: AIEmotionResponse;
  response: AIChatResponse;
}

export interface AIPromptResponse {
  prompt: string;
  type: 'morning' | 'afternoon' | 'evening' | 'emotion-based';
}

export class AIClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || AI_WORKER_URL || '';
  }

  private async makeRequest<T>(endpoint: string, data: unknown): Promise<T> {
    if (!this.baseUrl) {
      throw new Error('AI Worker URL is not configured');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'AI request failed');
    }

    return response.json();
  }

  async analyzeEmotion(message: string): Promise<AIEmotionResponse> {
    return this.makeRequest<AIEmotionResponse>('/api/ai-emotion', {
      message,
    });
  }

  async generateResponse(message: string, emotion?: string): Promise<AIChatResponse> {
    return this.makeRequest<AIChatResponse>('/api/ai-chat', {
      message,
      emotion,
    });
  }

  async processMessage(message: string): Promise<AIMessageResponse> {
    return this.makeRequest<AIMessageResponse>('/api/ai-message', {
      message,
    });
  }

  async generatePrompt(type: 'morning' | 'afternoon' | 'evening' | 'emotion-based', emotion?: string): Promise<AIPromptResponse> {
    return this.makeRequest<AIPromptResponse>('/api/ai-prompt', {
      type,
      emotion,
    });
  }
}

export const aiClient = new AIClient();