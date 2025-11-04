# Health Check Code - Corrected Implementation

## ❌ Your Code (Issues)
```typescript
fetch(`${API_BASE_URL}/health`, { timeout: 5000 })
  .then(r => r.json())
  .then(d => console.log('✅ Backend reachable:', d))
  .catch(e => console.error('❌ Backend not reachable:', e));
```

**Issues:**
1. Wrong endpoint: `/health` should be `/api/health`
2. `timeout` option doesn't work in fetch - need to use `AbortController`
3. Should use `getApiBaseUrl()` for consistency

## ✅ Corrected Code

### Option 1: Simple Health Check (Manual)
```typescript
import { getApiBaseUrl } from '../utils/api';

const API_BASE_URL = getApiBaseUrl();

// Create AbortController for timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

fetch(`${API_BASE_URL}/api/health`, { signal: controller.signal })
  .then(r => {
    clearTimeout(timeoutId); // Clear timeout on success
    return r.json();
  })
  .then(d => {
    if (d.status === 'ok') {
      console.log('✅ Backend reachable:', d);
    } else {
      console.warn('⚠️ Backend returned non-OK status:', d);
    }
  })
  .catch(e => {
    clearTimeout(timeoutId); // Clear timeout on error
    if (e.name === 'AbortError') {
      console.error('❌ Backend not reachable: Request timed out');
    } else {
      console.error('❌ Backend not reachable:', e);
    }
  });
```

### Option 2: Using Existing Health Check Function (Recommended)
```typescript
import { checkBackendHealth } from '../utils/api';

// This function already exists and handles timeout properly!
checkBackendHealth()
  .then((isHealthy) => {
    if (isHealthy) {
      console.log('✅ Backend is reachable');
    } else {
      console.error('❌ Backend is not reachable');
    }
  })
  .catch((err) => {
    console.error('❌ Health check failed:', err);
  });
```

### Option 3: Async/Await Version (Cleaner)
```typescript
import { getApiBaseUrl } from '../utils/api';

const API_BASE_URL = getApiBaseUrl();

// Create AbortController for timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch(`${API_BASE_URL}/api/health`, { 
    signal: controller.signal 
  });
  
  clearTimeout(timeoutId);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.status === 'ok') {
    console.log('✅ Backend reachable:', data);
  } else {
    console.warn('⚠️ Backend returned non-OK status:', data);
  }
} catch (error: any) {
  clearTimeout(timeoutId);
  
  if (error.name === 'AbortError') {
    console.error('❌ Backend not reachable: Request timed out');
  } else {
    console.error('❌ Backend not reachable:', error);
  }
}
```

## Key Corrections:

1. **Endpoint:** `/api/health` (not `/health`)
   - Backend route: `app.use('/api/health', healthRoutes)`
   - Full URL: `${API_BASE_URL}/api/health`

2. **Timeout:** Use `AbortController` (not `timeout` option)
   - `fetch()` doesn't support `timeout` option directly
   - Use `AbortController` with `signal` property
   - Clear timeout in both success and error cases

3. **API Base URL:** Use `getApiBaseUrl()`
   - Ensures consistent URL configuration
   - Handles environment variables properly

4. **Response Check:** Verify `status === 'ok'`
   - Response format: `{ status: 'ok' }`

## Current Implementation:

The health check is already implemented in:
- `mobile/src/utils/api.ts` → `checkBackendHealth()` function
- `mobile/App.tsx` → Runs automatically on app startup
- Uses 30-second timeout (configurable)

**Recommendation:** Use the existing `checkBackendHealth()` function instead of writing your own!

