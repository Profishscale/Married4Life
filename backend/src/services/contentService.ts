import { pool } from '../../database/init';

export interface Content {
  id: string;
  type: 'course' | 'game' | 'resource';
  title: string;
  description: string;
  url?: string;
  thumbnailUrl?: string;
  difficulty?: string;
  duration?: number;
  tags?: string[];
  category?: string;
  requiredTier: string;
  orderIndex: number;
  createdAt: Date;
}

export interface CourseLesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl?: string;
  reflectionQuestion?: string;
  orderIndex: number;
  createdAt: Date;
}

export interface CourseProgress {
  courseId: string;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessed?: Date;
}

export class ContentService {
  /**
   * Get all content by type
   */
  async getContentByType(type: string, category?: string): Promise<Content[]> {
    try {
      let query = `SELECT id, type, title, description, url, thumbnail_url, 
                   difficulty, duration, tags, category, required_tier, 
                   order_index, created_at 
                   FROM content WHERE type = $1`;
      const params = [type];

      if (category) {
        query += ` AND category = $2`;
        params.push(category);
      }

      query += ` ORDER BY order_index ASC, created_at DESC`;

      const result = await pool.query(query, params);

      return result.rows.map(row => ({
        id: row.id.toString(),
        type: row.type,
        title: row.title,
        description: row.description,
        url: row.url,
        thumbnailUrl: row.thumbnail_url,
        difficulty: row.difficulty,
        duration: row.duration,
        tags: row.tags,
        category: row.category,
        requiredTier: row.required_tier,
        orderIndex: row.order_index,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('Error getting content by type:', error);
      return [];
    }
  }

  /**
   * Get content by ID
   */
  async getContentById(id: string): Promise<Content | null> {
    try {
      const result = await pool.query(
        `SELECT id, type, title, description, url, thumbnail_url, 
         difficulty, duration, tags, category, required_tier, 
         order_index, created_at 
         FROM content WHERE id = $1`,
        [parseInt(id)]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id.toString(),
        type: row.type,
        title: row.title,
        description: row.description,
        url: row.url,
        thumbnailUrl: row.thumbnail_url,
        difficulty: row.difficulty,
        duration: row.duration,
        tags: row.tags,
        category: row.category,
        requiredTier: row.required_tier,
        orderIndex: row.order_index,
        createdAt: row.created_at,
      };
    } catch (error) {
      console.error('Error getting content by id:', error);
      return null;
    }
  }

  /**
   * Get course lessons
   */
  async getCourseLessons(courseId: string): Promise<CourseLesson[]> {
    try {
      const result = await pool.query(
        `SELECT id, course_id, title, content, video_url, 
         reflection_question, order_index, created_at 
         FROM course_lessons 
         WHERE course_id = $1 
         ORDER BY order_index ASC`,
        [parseInt(courseId)]
      );

      return result.rows.map(row => ({
        id: row.id.toString(),
        courseId: row.course_id.toString(),
        title: row.title,
        content: row.content,
        videoUrl: row.video_url,
        reflectionQuestion: row.reflection_question,
        orderIndex: row.order_index,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('Error getting course lessons:', error);
      return [];
    }
  }

  /**
   * Get user's course progress
   */
  async getCourseProgress(userId: string, courseId: string): Promise<CourseProgress | null> {
    try {
      const lessonsResult = await pool.query(
        `SELECT COUNT(*) as total FROM course_lessons WHERE course_id = $1`,
        [parseInt(courseId)]
      );
      const totalLessons = parseInt(lessonsResult.rows[0].total);

      const progressResult = await pool.query(
        `SELECT COUNT(*) as completed, MAX(last_accessed) as last_accessed
         FROM course_progress 
         WHERE user_id = $1 AND course_id = $2 AND completed = true`,
        [parseInt(userId), parseInt(courseId)]
      );

      const completedLessons = parseInt(progressResult.rows[0].completed || '0');
      const progressPercentage = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100) 
        : 0;

      return {
        courseId,
        progressPercentage,
        completedLessons,
        totalLessons,
        lastAccessed: progressResult.rows[0].last_accessed,
      };
    } catch (error) {
      console.error('Error getting course progress:', error);
      return null;
    }
  }

  /**
   * Update course lesson progress
   */
  async updateLessonProgress(
    userId: string,
    courseId: string,
    lessonId: string,
    completed: boolean
  ): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO course_progress 
         (user_id, course_id, lesson_id, completed, last_accessed)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, course_id, lesson_id)
         DO UPDATE SET 
           completed = EXCLUDED.completed,
           completed_at = CASE WHEN EXCLUDED.completed THEN CURRENT_TIMESTAMP ELSE course_progress.completed_at END,
           last_accessed = CURRENT_TIMESTAMP`,
        [parseInt(userId), parseInt(courseId), parseInt(lessonId), completed]
      );
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      throw new Error('Failed to update lesson progress');
    }
  }
}

export const contentService = new ContentService();

