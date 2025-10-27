import express, { Request, Response } from 'express';
import { aiCoachService } from '../services/aiCoach';
import { coachSessionService } from '../services/coachSessionService';
import { userService } from '../services/userService';
import { z } from 'zod';

const router = express.Router();

// Validation schema
const coachingRequestSchema = z.object({
  userId: z.string(),
  relationshipStatus: z.string().optional(),
  birthdate: z.string().optional(),
  recentMood: z.string().optional(),
  topic: z.string().optional(),
});

// POST / - Generate personalized AI coaching guidance
router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = coachingRequestSchema.parse(req.body);
    const { userId, relationshipStatus, birthdate, recentMood, topic } = validated;

    // Get user context
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Generate AI response with context
    const response = await aiCoachService.generateDailyGuidance({
      userId,
      userContext: {
        firstName: user.firstName,
        relationshipStatus: relationshipStatus || 'dating',
        birthdate,
        recentMood,
        topic,
      },
    });

    // Save session to database
    await coachSessionService.createSession({
      userId,
      messageTitle: response.title,
      messageBody: response.body,
      callToAction: response.callToAction,
      userContext: {
        relationshipStatus,
        birthdate,
        recentMood,
        topic,
      },
    });

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('AI Coach error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI guidance',
    });
  }
});

// GET /sessions/:userId - Get user's coaching session history
router.get('/sessions/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const sessions = await coachSessionService.getSessionsByUserId(userId);

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('Error getting coach sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get coaching sessions',
    });
  }
});

// GET /session/:id - Get specific coaching session
router.get('/session/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await coachSessionService.getSessionById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error getting coach session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get coaching session',
    });
  }
});

export default router;

