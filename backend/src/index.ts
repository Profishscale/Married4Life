import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config';
import { initializeCronJobs } from './services/cron';

// Import routes
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import aiCoachRoutes from './routes/aiCoach';
import coursesRoutes from './routes/courses';
import gamesRoutes from './routes/games';
import notificationsRoutes from './routes/notifications';
import userProgressRoutes from './routes/userProgress';
import contentRoutes from './routes/content';
import subscriptionsRoutes from './routes/subscriptions';
import promoRoutes from './routes/promo';

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

// Initialize cron jobs for scheduled check-ins
initializeCronJobs();

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai-coach', aiCoachRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/user-progress', userProgressRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/promo', promoRoutes);

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Marriaged4Life API is running on http://localhost:${PORT}`);
  console.log(`🌐 Network accessible at http://0.0.0.0:${PORT}`);
  console.log(`📊 Environment: ${config.environment}`);
});

