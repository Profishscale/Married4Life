import express, { Request, Response } from 'express';
import { aiCoachService } from '../services/aiCoach';

const router = express.Router();

// POST /chat - Send message to AI coach
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, userId, context } = req.body;
    
    if (!message || !userId) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: message and userId' 
      });
    }

    const response = await aiCoachService.generateResponse(message, userId, context);
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('AI Coach error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI coach response'
    });
  }
});

// GET /suggestions - Get personalized suggestions
router.get('/suggestions/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const suggestions = await aiCoachService.getSuggestions(userId);
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('AI Coach suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suggestions'
    });
  }
});

export default router;

