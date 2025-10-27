import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config';

// Import routes
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import aiCoachRoutes from './routes/aiCoach';
import coursesRoutes from './routes/courses';
import gamesRoutes from './routes/games';

dotenv.config();

const app = express();
const PORT = config.port;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database (async, non-blocking)
import('../database/init').then(({ initializeDatabase }) => {
  initializeDatabase().catch(console.error);
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai-coach', aiCoachRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/games', gamesRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Welcome to Marriaged4Life API',
    version: '1.0.0',
    docs: '/api/health'
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: () => void) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Marriaged4Life API is running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${config.environment}`);
});

