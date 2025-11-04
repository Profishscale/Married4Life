# Signup Function - Corrected Implementation

## ❌ Your Code (Issues)
```typescript
async function signup(email, password) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${API_BASE_URL}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log('[signup success]', data);
  } catch (err) {
    console.error('[signup failed]', err);
    Alert.alert('Signup failed', err.message);
  }
}
```

**Issues:**
1. Wrong endpoint: `/api/signup` should be `/api/auth/register`
2. Missing required fields: `firstName` and `relationshipStatus` are required
3. Missing `clearTimeout` in catch block
4. Should use centralized API utility for consistency

## ✅ Corrected Code

### Option 1: Using Centralized Register Function (Recommended)
```typescript
import { register, getApiBaseUrl } from '../utils/api';
import { Alert } from 'react-native';

async function signup(
  firstName: string,
  email: string,
  password: string,
  relationshipStatus: 'dating' | 'engaged' | 'married',
  partnerName?: string,
  birthday?: string
) {
  try {
    const data = await register({
      firstName,
      email,
      password,
      relationshipStatus,
      partnerName,
      birthday,
    });

    if (data.success && data.data) {
      console.log('[signup success]', data);
      // Navigate to dashboard or handle success
      return data;
    } else {
      throw new Error(data.error || 'Registration failed');
    }
  } catch (err: any) {
    console.error('[signup failed]', err);
    
    const errorMessage = err.message || 'Failed to create account. Please try again.';
    
    if (errorMessage.includes('Network Error') || errorMessage.includes('timed out')) {
      Alert.alert(
        'Connection Error',
        'Unable to connect to server. Please check:\n\n' +
        '1. Backend server is running\n' +
        '2. Your phone and computer are on the same Wi-Fi\n' +
        '3. API URL: ' + getApiBaseUrl()
      );
    } else if (errorMessage.includes('Email already registered')) {
      Alert.alert('Email Already Registered', 'This email is already registered. Please use Login.');
    } else {
      Alert.alert('Signup failed', errorMessage);
    }
    
    throw err;
  }
}
```

### Option 2: Direct Fetch (If You Need Customization)
```typescript
import { getApiBaseUrl } from '../utils/api';
import { Alert } from 'react-native';

async function signup(
  firstName: string,
  email: string,
  password: string,
  relationshipStatus: 'dating' | 'engaged' | 'married',
  partnerName?: string,
  birthday?: string
) {
  const API_BASE_URL = getApiBaseUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName, // Required
        email,
        password,
        relationshipStatus, // Required
        partnerName,
        birthday,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log('[signup success]', data);
    
    if (data.success && data.data) {
      // Handle success - navigate to dashboard
      return data;
    } else {
      throw new Error(data.error || 'Registration failed');
    }
  } catch (err: any) {
    clearTimeout(timeout); // ✅ Clear timeout in catch block
    
    console.error('[signup failed]', err);
    
    const errorMessage = err.message || 'Failed to create account. Please try again.';
    
    if (err.name === 'AbortError') {
      Alert.alert(
        'Request Timeout',
        'Registration request timed out. Please check:\n\n' +
        '1. Backend server is running\n' +
        '2. Your phone and computer are on the same Wi-Fi\n' +
        '3. API URL: ' + API_BASE_URL
      );
    } else if (errorMessage.includes('Email already registered')) {
      Alert.alert('Email Already Registered', 'This email is already registered. Please use Login.');
    } else {
      Alert.alert('Signup failed', errorMessage);
    }
    
    throw err;
  }
}
```

## Key Corrections:

1. **Endpoint:** `/api/auth/register` (not `/api/signup`)
   - Backend route: `POST /api/auth/register`
   - Full URL: `${API_BASE_URL}/api/auth/register`

2. **Required Fields:**
   - `firstName` (required)
   - `email` (required)
   - `password` (required)
   - `relationshipStatus` (required: 'dating' | 'engaged' | 'married')
   - `partnerName` (optional)
   - `birthday` (optional)

3. **Timeout Cleanup:** Added `clearTimeout(timeout)` in catch block
   - Prevents memory leaks
   - Ensures timeout is cleared even on error

4. **Error Handling:**
   - Detects timeout errors (`AbortError`)
   - Provides helpful error messages
   - Handles "Email already registered" case

5. **API Base URL:** Use `getApiBaseUrl()` from centralized utility

## Current Implementation:

The registration is already implemented correctly in:
- `mobile/src/utils/api.ts` → `register()` function
- `mobile/src/screens/OnboardingScreen.tsx` → Uses `register()` function

**Recommendation:** Use the existing `register()` function from `utils/api.ts` instead of writing your own!

