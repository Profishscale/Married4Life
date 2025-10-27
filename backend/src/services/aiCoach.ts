import OpenAI from 'openai';
import { config } from '../config';
import { getAIPrompt } from '../../ai/prompts';

export interface CoachingResponse {
  title: string;
  body: string;
  callToAction: string;
}

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

  async generateDailyGuidance(context: {
    userId: string;
    userContext: {
      firstName?: string;
      relationshipStatus: string;
      birthdate?: string;
      recentMood?: string;
      topic?: string;
    };
  }): Promise<CoachingResponse> {
    if (!this.openai) {
      // Return mock response if OpenAI is not configured
      return this.getMockGuidance(context.userContext);
    }

    try {
      const systemPrompt = getAIPrompt('coach_introduction');
      const dailyGuidancePrompt = getAIPrompt('coach_daily_guidance');

      // Build user context string
      const userContextStr = this.buildUserContext(context.userContext);

      const completion = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `${dailyGuidancePrompt}\n\nUser Context: ${userContextStr}`,
          },
        ],
        temperature: 0.8,
        max_tokens: 600,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Try to parse as JSON, fallback to structured response
      try {
        const parsed = JSON.parse(response);
        return {
          title: parsed.title || 'Daily Guidance',
          body: parsed.body || response,
          callToAction: parsed.callToAction || 'How will you apply this today?',
        };
      } catch {
        // If not JSON, create structured response
        return this.structureResponse(response);
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getMockGuidance(context.userContext);
    }
  }

  private buildUserContext(context: any): string {
    const parts = [];
    if (context.firstName) parts.push(`Name: ${context.firstName}`);
    if (context.relationshipStatus) parts.push(`Relationship: ${context.relationshipStatus}`);
    if (context.recentMood) parts.push(`Recent mood: ${context.recentMood}`);
    if (context.topic) parts.push(`Topic of interest: ${context.topic}`);
    return parts.join(', ') || 'New user seeking guidance';
  }

  private structureResponse(content: string): CoachingResponse {
    // Split into sentences
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Title is first sentence
    const title = sentences[0]?.substring(0, 50) || 'Daily Guidance';
    
    // Body is remaining content
    const body = sentences.slice(1).join('. ').substring(0, 400);
    
    // Call to action is last sentence or default
    const callToAction = sentences[sentences.length - 1] || 'How will you apply this today?';

    return { title, body, callToAction };
  }

  private getMockGuidance(context: any): CoachingResponse {
    const mockGuidance = [
      {
        title: 'Connection Begins with Presence',
        body: 'Today, take a moment to truly be present with your partner. Put away distractions, make eye contact, and listen—not just to respond, but to understand. Real connection happens in those quiet moments when we choose to show up fully. It\'s not about grand gestures—it\'s about being present, being seen, and seeing them. What does being present look like for you today?',
        callToAction: 'Set aside 10 minutes today for undistracted connection with your partner.',
      },
      {
        title: 'Every Interaction Matters',
        body: 'In relationships, the small moments become the foundation. That text you send, that touch on the shoulder, that moment you choose to listen instead of react—these matter. Every interaction is an opportunity to build trust, show care, and deepen connection. You don\'t need to be perfect; you just need to be intentional. Today, what small act of love can you offer?',
        callToAction: 'Write down one thing you appreciated about your partner today.',
      },
      {
        title: 'Embrace Your Journey Together',
        body: 'Relationships aren\'t meant to be perfect—they\'re meant to grow. You\'re on a journey of learning, healing, and growing together. There will be seasons of closeness and seasons that require more work. Both are valuable. Trust the process. You\'re doing better than you think. What\'s one thing you\'ve learned about yourself in this relationship?',
        callToAction: 'Share something vulnerable with your partner this week.',
      },
      {
        title: 'Love is a Daily Choice',
        body: 'Love isn\'t just a feeling—it\'s a choice you make every day. Choose to be kind when it\'s hard. Choose to understand when you disagree. Choose to forgive when you\'re hurt. These daily choices create the love story you want to live. It takes courage, but you have it in you. What choice will you make today to love better?',
        callToAction: 'Apologize for one thing that\'s been weighing on your heart.',
      },
      {
        title: 'Your Needs Matter Too',
        body: 'Taking care of yourself isn\'t selfish—it\'s necessary. You can\'t pour from an empty cup. When you\'re burned out, stressed, or running on empty, you show up differently in your relationships. Make time for rest, for your passions, for moments that fill you up. You deserve to be healthy, whole, and happy. What\'s one way you can honor yourself today?',
        callToAction: 'Schedule 30 minutes just for you this week.',
      },
    ];

    return mockGuidance[Math.floor(Math.random() * mockGuidance.length)];
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

