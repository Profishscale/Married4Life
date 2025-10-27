import { pool } from '../../database/init';
import { aiCoachService } from './aiCoach';
import { coachSessionService } from './coachSessionService';

export class ScheduledCheckInService {
  /**
   * Send daily check-in messages to all active users
   */
  async sendDailyCheckIns(): Promise<void> {
    console.log('📅 Starting daily check-in...');
    
    try {
      // Get all active users
      const usersResult = await pool.query(
        `SELECT id, first_name, subscription_tier 
         FROM users 
         WHERE subscription_tier IN ('free', 'plus', 'pro', 'pro_max')
         ORDER BY id`
      );

      console.log(`Found ${usersResult.rows.length} active users`);

      let successCount = 0;
      let errorCount = 0;

      // Process each user
      for (const user of usersResult.rows) {
        try {
          // Check notification preferences
          const prefs = await this.getNotificationPreferences(user.id);
          
          if (!prefs.dailyEnabled) {
            console.log(`Skipping user ${user.id} - daily notifications disabled`);
            continue;
          }

          // Generate personalized guidance
          const guidance = await aiCoachService.generateDailyGuidance({
            userId: user.id.toString(),
            userContext: {
              firstName: user.first_name,
              relationshipStatus: 'dating', // TODO: Get from user profile
            },
          });

          // Save to coach_sessions
          await coachSessionService.createSession({
            userId: user.id.toString(),
            messageTitle: guidance.title,
            messageBody: guidance.body,
            callToAction: guidance.callToAction,
            sessionType: 'daily_checkin',
            userContext: {
              type: 'daily_checkin',
            },
          });

          // Update user streak
          await this.updateStreak(user.id, 'daily_checkin');

          // TODO: Send push notification if enabled
          // await this.sendPushNotification(user, guidance);

          successCount++;
          console.log(`✓ Daily check-in sent to user ${user.id}`);
        } catch (error) {
          console.error(`✗ Error sending to user ${user.id}:`, error);
          errorCount++;
        }
      }

      console.log(`✅ Daily check-in complete: ${successCount} sent, ${errorCount} errors`);
    } catch (error) {
      console.error('❌ Daily check-in failed:', error);
      throw error;
    }
  }

  /**
   * Send weekly reflection messages to all active users
   */
  async sendWeeklyReflections(): Promise<void> {
    console.log('📅 Starting weekly reflection...');
    
    try {
      // Get all active users
      const usersResult = await pool.query(
        `SELECT id, first_name, subscription_tier 
         FROM users 
         WHERE subscription_tier IN ('free', 'plus', 'pro', 'pro_max')
         ORDER BY id`
      );

      console.log(`Found ${usersResult.rows.length} active users`);

      let successCount = 0;
      let errorCount = 0;

      // Process each user
      for (const user of usersResult.rows) {
        try {
          // Check notification preferences
          const prefs = await this.getNotificationPreferences(user.id);
          
          if (!prefs.weeklyEnabled) {
            console.log(`Skipping user ${user.id} - weekly notifications disabled`);
            continue;
          }

          // Generate personalized weekly guidance
          const guidance = await aiCoachService.generateDailyGuidance({
            userId: user.id.toString(),
            userContext: {
              firstName: user.first_name,
              relationshipStatus: 'dating',
              topic: 'weekly_reflection',
            },
          });

          // Save to coach_sessions
          await coachSessionService.createSession({
            userId: user.id.toString(),
            messageTitle: `Weekly Reflection: ${guidance.title}`,
            messageBody: guidance.body,
            callToAction: guidance.callToAction,
            sessionType: 'weekly_reflection',
            userContext: {
              type: 'weekly_reflection',
            },
          });

          // Update user streak
          await this.updateStreak(user.id, 'weekly_reflection');

          successCount++;
          console.log(`✓ Weekly reflection sent to user ${user.id}`);
        } catch (error) {
          console.error(`✗ Error sending to user ${user.id}:`, error);
          errorCount++;
        }
      }

      console.log(`✅ Weekly reflection complete: ${successCount} sent, ${errorCount} errors`);
    } catch (error) {
      console.error('❌ Weekly reflection failed:', error);
      throw error;
    }
  }

  private async getNotificationPreferences(userId: number): Promise<{
    dailyEnabled: boolean;
    weeklyEnabled: boolean;
    timePreference?: string;
    pushToken?: string;
  }> {
    try {
      const result = await pool.query(
        `SELECT reminder_type, enabled, time_preference, push_token
         FROM notification_preferences
         WHERE user_id = $1`,
        [userId]
      );

      // Default to enabled if no preferences set
      if (result.rows.length === 0) {
        return {
          dailyEnabled: true,
          weeklyEnabled: true,
        };
      }

      const prefs = result.rows.reduce((acc: any, row: any) => {
        acc[row.reminder_type] = row.enabled;
        if (!acc.timePreference && row.time_preference) {
          acc.timePreference = row.time_preference;
        }
        if (!acc.pushToken && row.push_token) {
          acc.pushToken = row.push_token;
        }
        return acc;
      }, {});

      return {
        dailyEnabled: prefs.daily !== false,
        weeklyEnabled: prefs.weekly !== false,
        timePreference: prefs.timePreference,
        pushToken: prefs.pushToken,
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      // Default to enabled
      return {
        dailyEnabled: true,
        weeklyEnabled: true,
      };
    }
  }

  private async updateStreak(userId: number, streakType: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get or create streak record
      let result = await pool.query(
        `SELECT id, current_streak, last_activity_date
         FROM user_streaks
         WHERE user_id = $1 AND streak_type = $2`,
        [userId, streakType]
      );

      if (result.rows.length === 0) {
        // Create new streak
        await pool.query(
          `INSERT INTO user_streaks 
           (user_id, streak_type, current_streak, longest_streak, last_activity_date)
           VALUES ($1, $2, 1, 1, $3)`,
          [userId, streakType, today]
        );
      } else {
        const row = result.rows[0];
        const lastActivity = row.last_activity_date;

        if (lastActivity === today) {
          // Already updated today, skip
          return;
        }

        // Check if streak should continue or reset
        const dayDiff = this.daysBetween(lastActivity, today);
        
        if (dayDiff === 1) {
          // Continue streak
          const newStreak = row.current_streak + 1;
          await pool.query(
            `UPDATE user_streaks 
             SET current_streak = $1,
                 longest_streak = GREATEST(longest_streak, $1),
                 last_activity_date = $2,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $3 AND streak_type = $4`,
            [newStreak, today, userId, streakType]
          );
        } else {
          // Reset streak
          await pool.query(
            `UPDATE user_streaks 
             SET current_streak = 1,
                 last_activity_date = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2 AND streak_type = $3`,
            [today, userId, streakType]
          );
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }

  private daysBetween(date1: string | null, date2: string): number {
    if (!date1) return 999; // Treat null as very old
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async getUserStreak(userId: number, streakType: string): Promise<{
    currentStreak: number;
    longestStreak: number;
  } | null> {
    try {
      const result = await pool.query(
        `SELECT current_streak, longest_streak
         FROM user_streaks
         WHERE user_id = $1 AND streak_type = $2`,
        [userId, streakType]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        currentStreak: row.current_streak,
        longestStreak: row.longest_streak,
      };
    } catch (error) {
      console.error('Error getting user streak:', error);
      return null;
    }
  }
}

export const scheduledCheckInService = new ScheduledCheckInService();

