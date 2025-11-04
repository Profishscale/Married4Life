# Signup Code - Corrected Implementation

## ❌ Your Original Code (Using Wrong Endpoint)
```typescript
try {
  const response = await fetch(`${API_BASE_URL}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  console.log('[signup success]', data);
} catch (error) {
  console.error('[network error]', error);
  Alert.alert('Connection Issue', 'Please verify server and Wi-Fi.');
}
```

## ✅ Corrected Implementation (Using Our Centralized API)

### Option 1: Using the Centralized Register Function (Recommended)
```typescript
import { register, getApiBaseUrl } from '../utils/api';
import { Alert } from 'react-native';

try {
  // Use the centralized register function
  const data = await register({
    firstName: firstName, // Required
    email: email,
    password: password,
    relationshipStatus: relationshipStatus, // Required: 'dating' | 'engaged' | 'married'
    partnerName: partnerName || undefined, // Optional
    birthday: birthday || undefined, // Optional
  });

  if (data.success && data.data) {
    console.log('[signup success]', data);
    // Navigate to dashboard or handle success
    navigation.replace('Dashboard', { userName: data.data.user.firstName });
  } else {
    throw new Error(data.error || 'Registration failed');
  }
} catch (error: any) {
  console.error('[network error]', error);
  
  const errorMessage = error.message || 'Failed to create account. Please try again.';
  
  if (errorMessage.includes('Network Error')) {
    Alert.alert(
      'Connection Error',
      'Unable to connect to server. Please verify:\n\n' +
      '1. Backend server is running\n' +
      '2. Your phone and computer are on the same Wi-Fi\n' +
      '3. API URL is correct: ' + getApiBaseUrl()
    );
  } else if (errorMessage.includes('Email already registered')) {
    Alert.alert(
      'Email Already Registered',
      'This email is already registered. Please use the Login screen instead.'
    );
  } else {
    Alert.alert('Registration Failed', errorMessage);
  }
}
```

### Option 2: Direct Fetch (If You Need to Customize)
```typescript
import { getApiBaseUrl } from '../utils/api';
import { Alert } from 'react-native';

try {
  const API_BASE_URL = getApiBaseUrl();
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: firstName, // Required
      email: email,
      password: password,
      relationshipStatus: relationshipStatus, // Required
      partnerName: partnerName || undefined, // Optional
      birthday: birthday || undefined, // Optional
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  console.log('[signup success]', data);
  
  if (data.success && data.data) {
    // Handle success - navigate to dashboard
    navigation.replace('Dashboard', { userName: data.data.user.firstName });
  }
} catch (error: any) {
  console.error('[network error]', error);
  
  const errorMessage = error.message || 'Failed to create account. Please try again.';
  
  if (
    errorMessage.includes('Network request failed') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('Failed to fetch')
  ) {
    Alert.alert(
      'Connection Issue',
      'Unable to connect to server. Please verify:\n\n' +
      '1. Backend server is running on port 5000\n' +
      '2. Your phone and computer are on the same Wi-Fi\n' +
      '3. API URL: ' + getApiBaseUrl()
    );
  } else {
    Alert.alert('Registration Failed', errorMessage);
  }
}
```

## Key Differences:

1. **Endpoint:** `/api/auth/register` (not `/api/signup`)
2. **Required Fields:** `firstName` and `relationshipStatus` are required
3. **API URL:** Use `getApiBaseUrl()` from centralized utility
4. **Error Handling:** More comprehensive error detection and user-friendly messages
5. **Response Format:** Backend returns `{ success: boolean, data: {...} }`

## Current Implementation in OnboardingScreen:

The registration is already implemented correctly in `mobile/src/screens/OnboardingScreen.tsx` using the `register()` function from `mobile/src/utils/api.ts`.

