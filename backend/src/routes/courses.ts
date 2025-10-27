import express, { Request, Response } from 'express';

const router = express.Router();

// TODO: Implement courses routes
// GET / - Get all courses
// GET /:id - Get course details
// POST /:id/lessons - Get course lessons
// POST /:id/enroll - Enroll in course
// GET /progress/:userId - Get user progress

router.get('/', async (req: Request, res: Response) => {
  // TODO: Implement get all courses
  res.json({ 
    success: true, 
    data: [],
    message: 'Courses endpoint - coming soon' 
  });
});

export default router;

