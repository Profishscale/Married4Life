# Signup Timeout Issue - Diagnosis & Fix

## 🔍 Problem Identified

**Issue:** "Registration failed: Network request timed out"

**Root Causes:**
1. ❌ **Backend server is NOT running** - Health check failed
2. ⚠️ **No timeout configured** - Fetch requests can hang indefinitely
3. ⚠️ **No timeout error handling** - Timeout errors not properly detected

---

## ✅ Fixes Applied

### 1. Added Request Timeout (30 seconds)
**File:** `mobile/src/utils/api.ts`

**Changes:**
- Added `AbortController` for timeout handling
- 30-second timeout for all API requests
- Proper cleanup of timeout on success/error

**Code:**
```typescript
// Create AbortController for timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

const response = await fetch(url, {
  ...options,
  signal: controller.signal, // Add abort signal
  headers: {
    'Content-Type': 'application/json',
    ...options.headers,
  },
});

clearTimeout(timeoutId); // Clean up timeout
```

### 2. Enhanced Timeout Error Detection
**File:** `mobile/src/utils/api.ts`

**Changes:**
- Detects `AbortError` (timeout)
- Provides helpful troubleshooting message
- Includes backend URL and connection steps

**Code:**
```typescript
catch (error: any) {
  if (error.name === 'AbortError') {
    const timeoutError = new Error(
      'Network request timed out. Please check:\n\n' +
      `1. Backend server is running: cd backend && npm run dev\n` +
      `2. Backend is accessible at: ${getApiUrl()}\n` +
      `3. Your phone and computer are on the same Wi-Fi network\n` +
      `4. Firewall allows connections on port 5000`
    );
    throw timeoutError;
  }
  // ... other error handling
}
```

### 3. Added Timeout Detection to Network Error Checks
**File:** `mobile/src/utils/api.ts`

**Changes:**
- Added "timed out" and "timeout" to network error detection
- Ensures timeout errors show proper troubleshooting

---

## 📋 Backend Route Verification

### ✅ Backend Route Exists
**Endpoint:** `POST /api/auth/register` (not `/api/signup`)

**Location:** `backend/src/routes/auth.ts`
```typescript
router.post('/register', async (req: Request, res: Response) => {
  // Registration logic
});
```

**Full URL:** `http://localhost:5000/api/auth/register` or `http://192.168.0.148:5000/api/auth/register`

### ✅ Mobile App Uses Correct Endpoint
**File:** `mobile/src/utils/api.ts`
```typescript
export async function register(data: {...}) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

---

## 🚀 Backend Startup

**Command:**
```bash
cd backend && npm run dev
```

**Expected Output:**
```
🚀 Marriaged4Life API is running on http://localhost:5000
📊 Environment: development
```

**Verification:**
- Check: `http://localhost:5000/api/health`
- Should return: `{ status: 'ok', success: true, ... }`

---

## 🧪 Testing Steps

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Verify Backend is Running
```bash
# Test health endpoint
curl http://localhost:5000/api/health
# Or
Invoke-WebRequest -Uri "http://localhost:5000/api/health"
```

### 3. Test Registration
1. Start mobile app: `cd mobile && npx expo start`
2. Navigate to onboarding
3. Complete all steps
4. Enter email and password
5. Click "Complete"
6. Should succeed (no timeout)

### 4. Expected Behavior

**If Backend is Running:**
- ✅ Registration completes in < 5 seconds
- ✅ User created successfully
- ✅ Navigates to Dashboard

**If Backend is NOT Running:**
- ❌ Timeout after 30 seconds
- ❌ Shows helpful error message with troubleshooting steps
- ❌ No infinite hang

---

## 📝 Summary

### Issues Fixed:
1. ✅ Added 30-second timeout to all API requests
2. ✅ Enhanced timeout error detection and messaging
3. ✅ Added AbortController for proper timeout handling
4. ✅ Improved error messages for troubleshooting

### Backend Status:
- ❌ **Backend was NOT running** (main issue)
- ✅ Backend route exists: `POST /api/auth/register`
- ✅ Mobile app uses correct endpoint

### Next Steps:
1. **Start backend:** `cd backend && npm run dev`
2. **Verify health:** Check `http://localhost:5000/api/health`
3. **Test registration:** Try signup again
4. **Check logs:** Look for timeout errors in console

---

## 🔧 Configuration

**API URL:** Set in `mobile/.env`
```
EXPO_PUBLIC_API_URL=http://192.168.0.148:5000
```

**Timeout:** 30 seconds (configurable in `mobile/src/utils/api.ts`)

**Backend Port:** 5000 (default)

---

**Status:** ✅ Timeout handling fixed, backend needs to be started

