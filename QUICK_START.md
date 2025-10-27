# Quick Start Guide 🚀

Get Marriaged4Life up and running in minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed
- [ ] npm or yarn installed
- [ ] Expo CLI installed (`npm install -g expo-cli`)
- [ ] iOS Simulator (Mac) or Android Studio

## Step 1: Database Setup (5 minutes)

### Create PostgreSQL Database

```bash
# Using psql
psql -U postgres
CREATE DATABASE married4life;
\q

# Or using command line
createdb -U postgres married4life
```

### Initialize Schema

```bash
# Run the schema SQL
psql -U postgres -d married4life -f database/schema.sql

# Or use the init script (coming soon)
# cd database && npm install && node init.ts
```

## Step 2: Environment Configuration (2 minutes)

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
# At minimum, update:
# - DB_PASSWORD (your PostgreSQL password)
# - OPENAI_API_KEY (optional, for AI coach)
```

### Minimum Required Variables

```env
DB_PASSWORD=your_postgres_password
```

## Step 3: Install Dependencies (3 minutes)

### Backend

```bash
cd backend
npm install
cd ..
```

### Mobile

```bash
cd mobile
npm install
cd ..
```

## Step 4: Start the Application (1 minute)

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

✅ Backend running on `http://localhost:5000`

### Terminal 2: Mobile

```bash
cd mobile
npm start
```

✅ Mobile app will open in Expo Go or simulator

## Step 5: Test It Out! 🎉

### Test Backend API

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Marriaged4Life API is running!",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

### Test Mobile App

1. Open the Expo Dev Tools in your browser
2. Scan QR code with Expo Go app (iOS/Android)
3. Or press `i` for iOS simulator
4. Or press `a` for Android emulator

## Next Steps

### For Development

1. **Explore the Codebase**
   - Mobile: `mobile/src/`
   - Backend: `backend/src/`
   - Database: `database/`

2. **Add Your OpenAI Key**
   ```env
   OPENAI_API_KEY=sk-your_actual_key
   ```

3. **Add Stripe Keys** (for payments)
   ```env
   STRIPE_SECRET_KEY=sk_test_your_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_key
   ```

### Common Tasks

#### Run Type Checks

```bash
# Backend
cd backend && npm run type-check

# Mobile
cd mobile && npx tsc --noEmit
```

#### Clear Cache

```bash
# Mobile Metro bundler
cd mobile && npm start -- --reset-cache
```

#### Database Reset

```bash
dropdb married4life
createdb married4life
psql -U postgres -d married4life -f database/schema.sql
```

## Troubleshooting

### Database Connection Failed

**Error**: `Database connection failed`

**Solution**: 
1. Make sure PostgreSQL is running
2. Check `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` in `.env`
3. Verify password is correct

```bash
# Test connection manually
psql -U postgres -d married4life
```

### Port Already in Use

**Error**: `Port 5000 is already in use`

**Solution**: 
```bash
# Change port in .env
PORT=5001
```

### Expo CLI Not Found

**Error**: `expo: command not found`

**Solution**:
```bash
npm install -g expo-cli
```

### Module Not Found

**Error**: `Cannot find module`

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## Architecture Overview

```
Marriaged4Life/
├── mobile/          # React Native app
├── backend/         # Express API
├── database/        # PostgreSQL setup
├── ai/              # AI prompts
└── shared/          # Shared types
```

## Get Help

- Check the README in each folder
- Backend docs: `backend/README.md`
- Mobile docs: `mobile/README.md`
- Database docs: `database/README.md`

## You're Ready! 🎊

Start building your features and watch Marriaged4Life come to life!

---

**Need Help?** Open an issue or check the main README.

