import express, { Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../../../database/init';

const router = express.Router();

// Validation schemas
const updatePrefsSchema = z.object({
  userId: z.string(),
  reminderType: z.string(),
  enabled: z.boolean(),
  timePreference: z.string().optional(),
});

const setPushTokenSchema = z.object({
  userId: z.string(),
  pushToken: z.string(),
});

// GET /preferences/:userId - Get user notification preferences
router.get('/preferences/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT reminder_type, enabled, time_preference, push_token
       FROM notification_preferences
       WHERE user_id = $1`,
      [parseInt(userId)]
    );

    const preferences = result.rows.reduce((acc: any, row: any) => {
      acc[row.reminder_type] = {
        enabled: row.enabled,
        timePreference: row.time_preference,
        pushToken: row.push_token,
      };
      return acc;
    }, {});

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Error getting preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notification preferences',
    });
  }
});

// POST /preferences - Update notification preferences
router.post('/preferences', async (req: Request, res: Response) => {
  try {
    const validated = updatePrefsSchema.parse(req.body);
    const { userId, reminderType, enabled, timePreference } = validated;

    // Check if preference exists
    const existing = await pool.query(
      `SELECT id FROM notification_preferences 
       WHERE user_id = $1 AND reminder_type = $2`,
      [parseInt(userId), reminderType]
    );

    if (existing.rows.length === 0) {
      // Create new preference
      await pool.query(
        `INSERT INTO notification_preferences 
         (user_id, reminder_type, enabled, time_preference)
         VALUES ($1, $2, $3, $4)`,
        [parseInt(userId), reminderType, enabled, timePreference || null]
      );
    } else {
      // Update existing preference
      await pool.query(
        `UPDATE notification_preferences 
         SET enabled = $1, time_preference = $2, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $3 AND reminder_type = $4`,
        [enabled, timePreference || null, parseInt(userId), reminderType]
      );
    }

    res.json({
      success: true,
      message: 'Notification preferences updated',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notification preferences',
    });
  }
});

// POST /push-token - Set push notification token
router.post('/push-token', async (req: Request, res: Response) => {
  try {
    const validated = setPushTokenSchema.parse(req.body);
    const { userId, pushToken } = validated;

    // Update all preferences for this user with the push token
    await pool.query(
      `UPDATE notification_preferences 
       SET push_token = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [pushToken, parseInt(userId)]
    );

    res.json({
      success: true,
      message: 'Push token updated',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('Error setting push token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set push token',
    });
  }
});

export default router;

