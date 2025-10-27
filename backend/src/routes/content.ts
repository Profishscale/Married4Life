import express, { Request, Response } from 'express';
import { contentService } from '../services/contentService';

const router = express.Router();

// GET / - Get all content
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, category } = req.query;

    const content = await contentService.getContentByType(
      type as string || 'course',
      category as string
    );

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('Error getting content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get content',
    });
  }
});

// GET /courses - Get all courses
router.get('/courses', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const courses = await contentService.getContentByType('course', category as string);

    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('Error getting courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get courses',
    });
  }
});

// GET /games - Get all games
router.get('/games', async (req: Request, res: Response) => {
  try {
    const games = await contentService.getContentByType('game');

    res.json({
      success: true,
      data: games,
    });
  } catch (error) {
    console.error('Error getting games:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get games',
    });
  }
});

// GET /resources - Get all resources
router.get('/resources', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const resources = await contentService.getContentByType('resource', category as string);

    res.json({
      success: true,
      data: resources,
    });
  } catch (error) {
    console.error('Error getting resources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get resources',
    });
  }
});

// GET /:id - Get content by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const content = await contentService.getContentById(id);

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found',
      });
    }

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('Error getting content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get content',
    });
  }
});

// GET /:id/lessons - Get course lessons
router.get('/:id/lessons', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lessons = await contentService.getCourseLessons(id);

    res.json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    console.error('Error getting course lessons:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get course lessons',
    });
  }
});

// GET /:id/progress/:userId - Get course progress
router.get('/:id/progress/:userId', async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;
    const progress = await contentService.getCourseProgress(userId, id);

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Error getting course progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get course progress',
    });
  }
});

// POST /:id/progress - Update lesson progress
router.post('/:id/progress', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, lessonId, completed } = req.body;

    if (!userId || !lessonId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId and lessonId',
      });
    }

    await contentService.updateLessonProgress(userId, id, lessonId, completed);

    res.json({
      success: true,
      message: 'Progress updated successfully',
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update progress',
    });
  }
});

export default router;

