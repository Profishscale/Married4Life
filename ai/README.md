# AI Coach Module

This folder contains AI-related logic and prompts for the Marriaged4Life app.

## Structure

- `prompts.ts` - AI prompt templates for different coaching scenarios
- `README.md` - This file

## AI Prompt System

The AI coach uses a prompt engineering approach inspired by DreamBuilders Coaching principles:

- **Empathetic**: Always acknowledge emotions and experiences
- **Practical**: Provide actionable advice and steps
- **Encouraging**: Celebrate progress and offer hope
- **Professional**: Evidence-based relationship guidance
- **Supportive**: Create a safe space for growth

## Available Prompts

1. `coach_introduction` - System prompt for AI coach personality
2. `coach_response` - Template for generating empathetic responses
3. `conflict_resolution` - Conflict resolution guidance
4. `love_languages` - Love languages education
5. `daily_connection` - Daily connection activity suggestions

## Usage

```typescript
import { getAIPrompt } from './ai/prompts';

const systemPrompt = getAIPrompt('coach_introduction');
```

## Future Enhancements

- Fine-tune GPT model on DreamBuilders content
- Add context-aware prompt selection
- Implement conversation memory
- Create prompt templates for different subscription tiers
- Add multilingual support

