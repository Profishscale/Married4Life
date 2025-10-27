# Marriaged4Life 💑✨

**Empowering Relationships Through AI and Heart**

An AI-powered relationship and family wellness app that helps couples, individuals, and families strengthen communication, connection, and emotional well-being. Inspired by DreamBuilders Coaching principles.

## 🎯 Project Overview

Marriaged4Life is a cross-platform mobile and web application designed to help couples and families build stronger, healthier relationships through:

- 🤖 **AI Relationship Coach** - Empathetic, DreamBuilders-inspired guidance
- 📚 **Courses & Lessons** - Love languages, conflict resolution, parenting, etc.
- 🎮 **Connection Games** - Daily/weekly prompts and activities
- 📊 **Progress Tracking** - Dashboard to monitor growth
- 🎬 **Media Library** - Videos, podcasts, book links
- 🔔 **Push Notifications** - Relationship reminders
- 💎 **Subscription Tiers** - Free → Plus → Pro → Pro Max

## 🏗️ Project Structure

```
married4life/
├── mobile/              # React Native app (iOS & Android)
│   ├── src/
│   │   ├── screens/     # App screens
│   │   └── types/       # TypeScript types
│   ├── App.tsx          # Main app entry
│   └── package.json
│
├── backend/             # Node.js backend (Express)
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── config.ts    # Configuration
│   └── package.json
│
├── database/            # PostgreSQL database
│   ├── init.ts          # Database initialization
│   └── schema.sql       # Database schema
│
├── ai/                  # AI coach module
│   ├── prompts.ts       # AI prompt templates
│   └── README.md
│
├── shared/              # Shared types
│   └── types/
│       └── index.ts
│
└── env.example          # Environment variables template
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL 14+
- Expo CLI (for mobile development)
- iOS Simulator / Android Studio (for mobile)

### Installation

#### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install mobile dependencies
cd ../mobile
npm install
```

#### 2. Database Setup

Create a PostgreSQL database:

```bash
# Using psql
createdb married4life

# Or using SQL
psql -U postgres -c "CREATE DATABASE married4life;"
```

#### 3. Environment Configuration

Copy the environment variables template:

```bash
cp env.example .env
```

Update `.env` with your configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=married4life
DB_USER=postgres
DB_PASSWORD=your_password

# OpenAI (for AI coach)
OPENAI_API_KEY=sk-your_api_key_here

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

#### 4. Initialize Database

```bash
cd database
npm install
node -e "require('./init.ts')"
```

#### 5. Start the Backend

```bash
cd backend
npm run dev
```

The API will be available at `http://localhost:5000`

#### 6. Start the Mobile App

```bash
cd mobile
npm start
```

Press `i` for iOS simulator or `a` for Android emulator.

## 📱 Tech Stack

### Mobile (React Native)
- **Expo** - Cross-platform development
- **React Navigation** - Navigation
- **TypeScript** - Type safety
- **Expo Linear Gradient** - Beautiful UI

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **OpenAI** - AI coach
- **Stripe** - Payments
- **Twilio** - Notifications (optional)

### Design System
- **Brand Colors**: Navy (`#0A1F44`), Gold (`#D4AF37`), White (`#FFFFFF`)
- **Tone**: Empathetic, supportive, professional
- **Philosophy**: DreamBuilders Coaching principles

## 🎨 Features

### MVP Features

✅ **Welcome Screen** - Beautiful branding with app intro  
✅ **Onboarding Flow** - 3-step user registration  
✅ **Dashboard** - User landing page with quick actions  
✅ **Backend API** - Express server with routes  
✅ **User Authentication** - Registration/login with JWT  
✅ **Database** - PostgreSQL schema with user management  
🔄 **AI Coach** - OpenAI integration (stub)  
⏳ **Courses** - Course management (stub)  
⏳ **Games** - Connection games (stub)  
⏳ **Progress** - User progress tracking  

### Future Features

⏳ **Family Mode** - Multi-family member support  
⏳ **Media Library** - Videos, podcasts, articles  
⏳ **Push Notifications** - Relationship reminders  
⏳ **Stripe Integration** - Subscription management  
⏳ **Analytics** - User engagement metrics  

## 📚 API Endpoints

### Health
- `GET /api/health` - Check API status

### Authentication (TODO)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### AI Coach (TODO)
- `POST /api/ai-coach/chat` - Send message to AI coach
- `GET /api/ai-coach/suggestions/:userId` - Get suggestions

### Courses (TODO)
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details

### Games (TODO)
- `GET /api/games` - Get all games
- `GET /api/games/:id` - Get game details

## 🎯 Development Roadmap

### Phase 1: MVP (Current)
- [x] Project scaffolding
- [x] Welcome screen
- [x] Onboarding flow
- [x] Dashboard
- [x] User authentication (registration)
- [x] Database setup
- [ ] User login
- [ ] AI Coach basic functionality

### Phase 2: Core Features
- [ ] Courses and lessons
- [ ] Connection games
- [ ] Progress dashboard
- [ ] User profiles

### Phase 3: Monetization
- [ ] Stripe integration
- [ ] Subscription tiers
- [ ] Payment processing
- [ ] Usage limits

### Phase 4: Advanced Features
- [ ] Push notifications
- [ ] Media library
- [ ] Family Mode
- [ ] Analytics

## 🤝 Contributing

This is a personal project, but contributions are welcome! Please follow the DreamBuilders Coaching philosophy when contributing.

## 📄 License

ISC

## 💡 Inspiration

This project is inspired by **DreamBuilders Coaching** and aims to make relationship coaching accessible to everyone through the power of AI.

---

**Built with ❤️ for stronger relationships**
