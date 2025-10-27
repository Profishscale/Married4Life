import OpenAI from 'openai';
import { config } from '../config';
import { getAIPrompt } from '../../ai/prompts';

class AICoachService {
  private openai: OpenAI | null = null;

  constructor() {
    if (config.openai.apiKey) {
      this.openai = new OpenAI({
        apiKey: config.openai.apiKey,
      });
    } else {
      console.warn('⚠️  OpenAI API key not configured. AI coach will use mock responses.');
    }
  }

  async generateResponse(
    message: string,
    userId: string,
    context?: any
  ): Promise<string> {
    if (!this.openai) {
      // Return mock response if OpenAI is not configured
      return getAICoachMockResponse(message);
    }

    try {
      const systemPrompt = getAIPrompt('coach_introduction');
      const userContext = context ? `\n\nContext: ${JSON.stringify(context)}` : '';
      
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `${message}${userContext}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || 'I apologize, I cannot respond at this time.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate AI coach response');
    }
  }

  async getSuggestions(userId: string): Promise<string[]> {
    // TODO: Implement personalized suggestions based on user data
    return [
      'Try a 5-minute gratitude exercise with your partner',
      'Read the conflict resolution course this week',
      'Play "Love Language Quiz" together',
    ];
  }
}

export const aiCoachService = new AICoachService();

// Mock response for development when OpenAI is not configured
function getAICoachMockResponse(message: string): string {
  const mockResponses = [
    'That\'s a wonderful question. Let me help you think through this together. In DreamBuilders Coaching, we often find that open communication is the foundation of any strong relationship. What specific challenge are you facing?',
    'I hear you. It\'s completely normal to experience ups and downs in relationships. Remember, every couple has their own unique journey. Can you tell me more about what you\'re hoping to achieve?',
    'Thank you for sharing with me. Building stronger connections takes time and intentional effort. What small step could you take today toward your goal?',
  ];
  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
}

