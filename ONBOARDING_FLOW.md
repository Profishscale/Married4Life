# Onboarding Flow Documentation

## Overview

The Marriaged4Life onboarding flow collects essential user information to personalize their relationship guidance experience.

## User Flow

```
Welcome Screen → Onboarding (3 steps) → Dashboard
```

### Step 1: Basic Information
- First name
- Relationship status (Single / Dating / Engaged / Married)
- Visual option cards with emojis

### Step 2: Additional Details
- Partner's name (if not single)
- Birthday (for astrology/human design)
- Optional fields

### Step 3: Account Creation
- Email address
- Password (min 8 characters)
- Security validation

## Implementation

### Frontend (React Native)

**File**: `mobile/src/screens/OnboardingScreen.tsx`

**Features**:
- 3-step multi-step form
- Progressive disclosure
- Real-time validation
- Beautiful gradient UI with DreamBuilders branding
- Step indicators
- Back navigation between steps

**Key Components**:
- `FormData` interface for state management
- Step-by-step validation
- Error handling with user-friendly alerts
- Loading states during API calls

### Backend (Express + TypeScript)

**Files**:
- `backend/src/routes/auth.ts` - Registration endpoint
- `backend/src/services/userService.ts` - User database operations

**API Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "firstName": "John",
  "email": "john@example.com",
  "password": "secure123",
  "relationshipStatus": "married",
  "partnerName": "Jane",
  "birthday": "01/15/1990"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": null,
      "subscriptionTier": "free"
    },
    "token": "jwt_token_here"
  }
}
```

### Database

**User Table** (PostgreSQL):
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  subscription_tier VARCHAR(20) DEFAULT 'free',
  partner_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Data Storage**:
- Password hashed with bcrypt (10 rounds)
- Email validated for uniqueness
- Additional onboarding data stored in user profile fields
- JWT token generated for authentication

## Security

### Password Hashing
- Uses bcryptjs with 10 salt rounds
- Passwords never stored in plain text
- Minimum 8 characters required

### JWT Authentication
- Token expires in 7 days (configurable)
- Includes userId and email in payload
- Secure secret key in environment variables

### Input Validation
- Email format validation
- Password strength requirements
- SQL injection prevention via parameterized queries
- XSS protection in frontend

## Design System

### Colors
- Background: Navy gradient (`#0A1F44` → `#1a3d6b`)
- Buttons: Gold gradient (`#D4AF37` → `#F5DE80`)
- Text: White (`#FFFFFF`)
- Inputs: Transparent white overlay

### Typography
- Titles: 32px, bold
- Subtitles: 18px, regular
- Labels: 16px, semi-bold
- Body: 14-16px, regular

### UI Components
- Rounded corners (16px)
- Gradient backgrounds
- Touch feedback
- Loading indicators
- Step indicators
- Option cards with emoji icons

## Testing

### Manual Testing Checklist
- [ ] All form fields work correctly
- [ ] Step navigation (Next/Back)
- [ ] Validation errors display properly
- [ ] API connection successful
- [ ] User creation in database
- [ ] Token returned and stored
- [ ] Navigation to dashboard
- [ ] Loading states work
- [ ] Error handling displays alerts

### API Testing
```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "email": "test@example.com",
    "password": "testpass123",
    "relationshipStatus": "dating"
  }'
```

## Future Enhancements

1. **Social Login** - Google, Apple, Facebook
2. **Profile Pictures** - Image upload
3. **Two-Factor Auth** - SMS/Email verification
4. **Onboarding Analytics** - Track completion rates
5. **A/B Testing** - Different onboarding variations
6. **Skip Options** - Allow partial completion
7. **Progress Saving** - Resume where left off

## Troubleshooting

### Common Issues

**"Email already registered"**
- User already exists in database
- Solution: Use login instead or different email

**"Database connection failed"**
- PostgreSQL not running
- Solution: Start PostgreSQL service

**"Invalid token"**
- Token expired or malformed
- Solution: Re-register or refresh token

**"Network request failed"**
- Backend not running
- Solution: Start backend server on port 5000

## Configuration

### Environment Variables
```env
# Backend
DB_HOST=localhost
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key

# Mobile
EXPO_PUBLIC_API_URL=http://localhost:5000
```

## Code Examples

### Register New User (JavaScript)
```javascript
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    email: 'john@example.com',
    password: 'securepass123',
    relationshipStatus: 'married',
    partnerName: 'Jane',
    birthday: '01/15/1990'
  })
});

const data = await response.json();
console.log('Token:', data.data.token);
```

## Conclusion

The onboarding flow provides a smooth, secure, and beautiful experience for new users to join Marriaged4Life and begin their relationship wellness journey.

