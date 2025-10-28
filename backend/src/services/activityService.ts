import { pool } from '../../../database/init';

export interface ActivityLog {
  id: string;
  userId: string;
  date: string;
  actionType: string;
  value: number;
  metadata?: any;
  createdAt: Date;
}

export class ActivityService {
  /**
   * Log user activity
   */
  async logActivity(data: {
    userId: string;
    actionType: string;
    value?: number;
    metadata?: any;
  }): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      await pool.query(
        `INSERT INTO user_activity (user_id, date, action_type, value, metadata)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, date, action_type)
         DO UPDATE SET value = user_activity.value + $4`,
        [
          parseInt(data.userId),
          today,
          data.actionType,
          data.value || 1,
          data.metadata ? JSON.stringify(data.metadata) : null,
        ]
      );
    } catch (error) {
      console.error('Error logging activity:', error);
      throw new Error('Failed to log activity');
    }
  }

  /**
   * Get user progress metrics
   */
  async getUserProgress(userId: string): Promise<{
    totalCheckIns: number;
    daysActive: number;
    currentStreak: number;
    longestStreak: number;
    recentActivity: ActivityLog[];
    weeklyEngagement: { date: string; count: number }[];
    engagementTrend: { date: string; value: number }[];
  }> {
    try {
      // Get streak data
      const streakResult = await pool.query(
        `SELECT current_streak, longest_streak
         FROM user_streaks
         WHERE user_id = $1 AND streak_type = $2`,
        [parseInt(userId), 'daily_checkin']
      );

      const streak = streakResult.rows[0] || { current_streak: 0, longest_streak: 0 };

      // Get total check-ins
      const checkInResult = await pool.query(
        `SELECT COUNT(*) as count
         FROM coach_sessions
         WHERE user_id = $1`,
        [parseInt(userId)]
      );

      // Get days active
      const daysActiveResult = await pool.query(
        `SELECT COUNT(DISTINCT date) as count
         FROM user_activity
         WHERE user_id = $1`,
        [parseInt(userId)]
      );

      // Get recent activity (last 7 days)
      const recentActivityResult = await pool.query(
        `SELECT id, user_id, date, action_type, value, metadata, created_at
         FROM user_activity
         WHERE user_id = $1
         AND date >= CURRENT_DATE - INTERVAL '7 days'
         ORDER BY date DESC, created_at DESC
         LIMIT 20`,
        [parseInt(userId)]
      );

      // Get weekly engagement data
      const weeklyEngagementResult = await pool.query(
        `SELECT date, COUNT(*) as count
         FROM user_activity
         WHERE user_id = $1
         AND date >= CURRENT_DATE - INTERVAL '14 days'
         GROUP BY date
         ORDER BY date ASC`,
        [parseInt(userId)]
      );

      // Calculate engagement trend (last 30 days)
      const engagementTrendResult = await pool.query(
        `SELECT date, SUM(value) as value
         FROM user_activity
         WHERE user_id = $1
         AND date >= CURRENT_DATE - INTERVAL '30 days'
         GROUP BY date
         ORDER BY date ASC`,
        [parseInt(userId)]
      );

      return {
        totalCheckIns: parseInt(checkInResult.rows[0]?.count || '0'),
        daysActive: parseInt(daysActiveResult.rows[0]?.count || '0'),
        currentStreak: streak.current_streak,
        longestStreak: streak.longest_streak,
        recentActivity: recentActivityResult.rows.map(row => ({
          id: row.id.toString(),
          userId: row.user_id.toString(),
          date: row.date,
          actionType: row.action_type,
          value: row.value,
          metadata: row.metadata,
          createdAt: row.created_at,
        })),
        weeklyEngagement: weeklyEngagementResult.rows.map(row => ({
          date: row.date,
          count: parseInt(row.count),
        })),
        engagementTrend: engagementTrendResult.rows.map(row => ({
          date: row.date,
          value: parseFloat(row.value) || 0,
        })),
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw new Error('Failed to get user progress');
    }
  }

  /**
   * Get activity by date range
   */
  async getActivityByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ActivityLog[]> {
    try {
      const result = await pool.query(
        `SELECT id, user_id, date, action_type, value, metadata, created_at
         FROM user_activity
         WHERE user_id = $1
         AND date BETWEEN $2 AND $3
         ORDER BY date DESC, created_at DESC`,
        [parseInt(userId), startDate, endDate]
      );

      return result.rows.map(row => ({
        id: row.id.toString(),
        userId: row.user_id.toString(),
        date: row.date,
        actionType: row.action_type,
        value: row.value,
        metadata: row.metadata,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('Error getting activity by date range:', error);
      return [];
    }
  }
}

export const activityService = new ActivityService();

