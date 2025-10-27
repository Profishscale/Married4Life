# Marriaged4Life Backend API

Node.js Express backend with TypeScript for Marriaged4Life.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Copy `env.example` to `.env` and configure:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=married4life
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-your_key
OPENAI_MODEL=gpt-4-turbo-preview

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

### Running the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start

# Type checking
npm run type-check
```

Server runs on `http://localhost:5000`

## Project Structure

```
backend/
├── src/
│   ├── routes/          # API routes
│   │   ├── auth.ts      # Authentication
│   │   ├── aiCoach.ts   # AI coach endpoints
│   │   ├── courses.ts   # Course management
│   │   ├── games.ts     # Games management
│   │   └── health.ts    # Health check
│   ├── services/        # Business logic
│   │   └── aiCoach.ts   # AI coach service
│   ├── config.ts        # Configuration
│   └── index.ts         # Main entry point
├── package.json
└── tsconfig.json
```

## API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Authentication (TODO)
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### AI Coach (TODO)
- `POST /api/ai-coach/chat` - Send message to coach
- `GET /api/ai-coach/suggestions/:userId` - Get suggestions

### Courses (TODO)
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in course

### Games (TODO)
- `GET /api/games` - List all games
- `GET /api/games/:id` - Get game details
- `POST /api/games/:id/play` - Start game

## Development

### Adding a New Route

1. Create route file in `src/routes/`
2. Implement handler functions
3. Register in `src/index.ts`

Example:

```typescript
// src/routes/example.ts
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true });
});

export default router;
```

```typescript
// src/index.ts
import exampleRoutes from './routes/example';
app.use('/api/example', exampleRoutes);
```

## Database

The backend uses PostgreSQL. See `../database/README.md` for setup instructions.

## AI Integration

The AI coach uses OpenAI's GPT models. Configure your API key in `.env`.

## Stripe Integration

Payment processing via Stripe. Configure keys in `.env`.

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Deployment

### Environment Setup

Set environment variables on your hosting platform:

- Railway
- Heroku
- AWS
- DigitalOcean

### Build

```bash
npm run build
```

### Production Considerations

- Use strong JWT secret
- Enable HTTPS
- Configure CORS properly
- Set up database backups
- Use environment variables
- Enable rate limiting
- Add logging
- Set up monitoring

## Contributing

Follow TypeScript best practices and the existing code structure.

