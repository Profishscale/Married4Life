import express, { Request, Response } from 'express';

const router = express.Router();

// Simple health check endpoint
router.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

export default router;

