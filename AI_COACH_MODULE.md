# AI Coach Module Documentation 🤖

## Overview

The AI Relationship Coach module provides users with personalized daily, weekly, and monthly relationship insights, advice, and action steps — written in the warm, empathetic, and encouraging tone of DreamBuilders Coaching (Martez & Woodrina Layton).

## Features

### Core Functionality
1. **Personalized Guidance** - AI-generated relationship advice tailored to user context
2. **DreamBuilders Tone** - Compassionate, nonjudgmental, spiritually aware coaching
3. **Session History** - View and revisit past coaching sessions
4. **Structured Responses** - Title, body, and call-to-action format
5. **Database Storage** - All sessions saved for reference

### Design
- Gradient background: Navy → Charcoal
- Gold accent highlights
- Rounded card containers
- Fade-in animations for new messages
- Chat-bubble style layout

## Architecture

### Backend (Express + TypeScript)

**Endpoint**: `POST /api/ai-coach/`
```json
Request:
{
  "userId": "1",
  "relationshipStatus": "married",
  "birthdate": "01/15/1990",
  "recentMood": "grateful",
  "topic": "communication"
}

Response:
{
  "success": true,
  "data": {
    "title": "Connection Begins with Presence",
    "body": "Today, take a moment to truly be present...",
    "callToAction": "Set aside 10 minutes today for undistracted connection."
  }
}
```

**Additional Endpoints**:
- `GET /api/ai-coach/sessions/:userId` - Get user's session history
- `GET /api/ai-coach/session/:id` - Get specific session

### Database

**Table**: `coach_sessions`

```sql
CREATE TABLE coach_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message_title VARCHAR(255),
  message_body TEXT NOT NULL,
  call_to_action TEXT,
  user_context JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Frontend (React Native)

**File**: `mobile/src/screens/AICoachScreen.tsx`

**Components**:
- Main guidance card (displayed prominently)
- Session history (scrollable list)
- "New Guidance" button (fixed at bottom)
- Back navigation
- Loading states and animations

## AI Prompt System

### DreamBuilders Coaching Principles

The AI coach is inspired by DreamBuilders Coaching and embodies:

1. **Compassion** - Warm, nonjudgmental support
2. **Spiritual Awareness** - Grounded, practical wisdom
3. **Realism** - Practical, achievable guidance
4. **Encouragement** - Life-giving, hopeful language
5. **Empathy** - Deep understanding and validation

### Prompt Templates

**Location**: `ai/prompts.ts`

```typescript
coach_introduction: {
  personality: "Compassionate, nonjudgmental, spiritually aware",
  mission: "Help strengthen relationships through wisdom",
  tone: "Warm, heartfelt, encouraging"
}

coach_daily_guidance: {
  format: "JSON with title, body, callToAction",
  style: "First-person, empathetic, practical",
  topics: "Communication, growth, healing, connection"
}
```

### Mock Responses

When OpenAI API is not configured, the system provides 5 beautiful mock guidance messages in the DreamBuilders style:

1. Connection Begins with Presence
2. Every Interaction Matters
3. Embrace Your Journey Together
4. Love is a Daily Choice
5. Your Needs Matter Too

## Implementation Details

### Backend Services

**File**: `backend/src/services/aiCoach.ts`

**Methods**:
- `generateDailyGuidance()` - Generate AI coaching response
- `getSuggestions()` - Get personalized suggestions
- `buildUserContext()` - Build context string
- `structureResponse()` - Parse and structure AI response
- `getMockGuidance()` - Fallback to mock responses

**File**: `backend/src/services/coachSessionService.ts`

**Methods**:
- `createSession()` - Save coaching session to database
- `getSessionsByUserId()` - Get user's session history
- `getSessionById()` - Get specific session

### Frontend Components

**File**: `mobile/src/screens/AICoachScreen.tsx`

**State Management**:
```typescript
- currentGuidance: CoachSession | null
- sessionHistory: CoachSession[]
- loading: boolean
- fadeAnim: Animated.Value
```

**Key Functions**:
- `loadSessionHistory()` - Fetch past sessions
- `handleNewGuidance()` - Request new guidance from API
- Animated fade-in for new guidance

### Navigation

**File**: `mobile/App.tsx`

Added AI Coach screen to navigation stack:
```typescript
<Stack.Screen name="AICoach" component={AICoachScreen} />
```

## Usage

### Testing the AI Coach

1. **Start the backend**:
```bash
cd backend
npm run dev
```

2. **Start the mobile app**:
```bash
cd mobile
npm start
```

3. **Navigate to AI Coach**:
   - From Dashboard, tap "AI Coach" card
   - Tap "New Guidance" button
   - View personalized guidance

### API Testing

```bash
# Generate new guidance
curl -X POST http://localhost:5000/api/ai-coach \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "1",
    "relationshipStatus": "married"
  }'

# Get session history
curl http://localhost:5000/api/ai-coach/sessions/1

# Get specific session
curl http://localhost:5000/api/ai-coach/session/1
```

## Design Specifications

### Colors
- **Background**: Navy gradient (`#0A1F44` → `#1a3d6b` → `#2a1f44`)
- **Cards**: White (`#FFFFFF`) with 95% opacity
- **Headers**: Gold gradient (`#D4AF37` → `#F5DE80`)
- **Text**: Navy (`#0A1F44`) on white cards
- **Buttons**: Gold gradient with navy text

### Typography
- **Title**: 22px, bold, gold header
- **Body**: 17px, normal, navy on white
- **Call to Action**: 16px, bold italic, navy
- **Section Titles**: 20px, bold, white

### Animations
- **Fade-in**: 600ms duration for new guidance
- **Shadow**: Elevation 8 for cards
- **Border radius**: 20px for main card, 12px for history

## Features

### Current Implementation ✅

- [x] AI guidance generation (OpenAI or mock)
- [x] Session storage in database
- [x] Session history display
- [x] Beautiful UI with DreamBuilders branding
- [x] Animations and loading states
- [x] Navigation integration
- [x] Backend API endpoints
- [x] Database schema and operations

### Future Enhancements 🔄

- [ ] OpenAI API integration with real responses
- [ ] Fine-tuned model on DreamBuilders content
- [ ] Personalized suggestions based on user history
- [ ] Multiple guidance types (daily/weekly/monthly)
- [ ] Share guidance feature
- [ ] Favorite/unfavorite sessions
- [ ] Export sessions to PDF
- [ ] Voice narration option
- [ ] Interactive Q&A mode

## Configuration

### Environment Variables

```env
# OpenAI (for real AI responses)
OPENAI_API_KEY=sk-your_api_key_here
OPENAI_MODEL=gpt-4-turbo-preview

# Database
DB_HOST=localhost
DB_PASSWORD=your_password
```

### Without OpenAI

The AI Coach works with beautiful mock responses even without OpenAI API key. Simply omit the `OPENAI_API_KEY` and the system will automatically use mock guidance.

## Philosophy

The AI Coach embodies the DreamBuilders Coaching approach:

> "Relationships aren't meant to be perfect—they're meant to grow. You're on a journey of learning, healing, and growing together."

The guidance focuses on:
- **Connection over perfection**
- **Presence over performance**
- **Healing over hiding**
- **Growth over comfort**
- **Love as a daily choice**

## Success Metrics

✅ **Guidance Generation** - Personalized responses ready  
✅ **Session Storage** - All guidance saved to database  
✅ **History Display** - Users can revisit past advice  
✅ **Beautiful UI** - DreamBuilders branding throughout  
✅ **Smooth Animations** - Professional user experience  
✅ **API Endpoints** - Full backend integration  
✅ **Mock Responses** - Works without OpenAI key  

## Conclusion

The AI Coach module is a core feature of Marriaged4Life, providing users with personalized, empathetic relationship guidance inspired by DreamBuilders Coaching principles.

---

**Built with ❤️ for stronger relationships**

