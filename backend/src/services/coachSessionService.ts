import { pool } from '../../database/init';
import { AIConversation } from '../../../shared/types';

export interface CoachSession {
  id: string;
  userId: string;
  messageTitle: string;
  messageBody: string;
  callToAction: string;
  userContext?: any;
  sessionType?: string;
  createdAt: Date;
}

export class CoachSessionService {
  async createSession(data: {
    userId: string;
    messageTitle: string;
    messageBody: string;
    callToAction: string;
    userContext?: any;
    sessionType?: string;
  }): Promise<CoachSession> {
    try {
      const sessionType = data.sessionType || 'manual';
      
      const result = await pool.query(
        `INSERT INTO coach_sessions 
         (user_id, message_title, message_body, call_to_action, user_context, session_type)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, user_id, message_title, message_body, call_to_action, 
                   user_context, session_type, created_at`,
        [
          parseInt(data.userId),
          data.messageTitle,
          data.messageBody,
          data.callToAction,
          data.userContext ? JSON.stringify(data.userContext) : null,
          sessionType,
        ]
      );

      const row = result.rows[0];
      return {
        id: row.id.toString(),
        userId: row.user_id.toString(),
        messageTitle: row.message_title,
        messageBody: row.message_body,
        callToAction: row.call_to_action,
        userContext: row.user_context,
        createdAt: row.created_at,
      };
    } catch (error) {
      console.error('Error creating coach session:', error);
      throw new Error('Failed to save coach session');
    }
  }

  async getSessionsByUserId(userId: string): Promise<CoachSession[]> {
    try {
      const result = await pool.query(
        `SELECT id, user_id, message_title, message_body, call_to_action, 
                user_context, session_type, created_at
         FROM coach_sessions 
         WHERE user_id = $1 
         ORDER BY created_at DESC
         LIMIT 50`,
        [parseInt(userId)]
      );

      return result.rows.map((row) => ({
        id: row.id.toString(),
        userId: row.user_id.toString(),
        messageTitle: row.message_title,
        messageBody: row.message_body,
        callToAction: row.call_to_action,
        userContext: row.user_context,
        sessionType: row.session_type,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('Error getting coach sessions:', error);
      return [];
    }
  }

  async getSessionById(sessionId: string): Promise<CoachSession | null> {
    try {
      const result = await pool.query(
        `SELECT id, user_id, message_title, message_body, call_to_action, 
                user_context, session_type, created_at
         FROM coach_sessions 
         WHERE id = $1`,
        [parseInt(sessionId)]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id.toString(),
        userId: row.user_id.toString(),
        messageTitle: row.message_title,
        messageBody: row.message_body,
        callToAction: row.call_to_action,
        userContext: row.user_context,
        sessionType: row.session_type,
        createdAt: row.created_at,
      };
    } catch (error) {
      console.error('Error getting coach session:', error);
      return null;
    }
  }
}

export const coachSessionService = new CoachSessionService();

