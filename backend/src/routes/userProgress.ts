import express, { Request, Response } from 'express';
import { activityService } from '../services/activityService';

const router = express.Router();

// GET /:userId - Get user progress metrics
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const progress = await activityService.getUserProgress(userId);

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Error getting user progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user progress',
    });
  }
});

// POST /activity - Log user activity
router.post('/activity', async (req: Request, res: Response) => {
  try {
    const { userId, actionType, value, metadata } = req.body;

    if (!userId || !actionType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId and actionType',
      });
    }

    await activityService.logActivity({
      userId,
      actionType,
      value,
      metadata,
    });

    res.json({
      success: true,
      message: 'Activity logged successfully',
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log activity',
    });
  }
});

// GET /activity/:userId - Get user activity logs
router.get('/activity/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    let activity;

    if (startDate && endDate) {
      activity = await activityService.getActivityByDateRange(
        userId,
        startDate as string,
        endDate as string
      );
    } else {
      // Get last 30 days by default
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      activity = await activityService.getActivityByDateRange(
        userId,
        startDate,
        endDate
      );
    }

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error('Error getting activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get activity',
    });
  }
});

export default router;

