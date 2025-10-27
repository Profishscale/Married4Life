import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ 
    success: true,
    message: 'Marriaged4Life API is running!', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;

