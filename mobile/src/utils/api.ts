/**
 * API utility for making network requests
 * Handles URL configuration, error handling, and logging
 */

import { log } from './log';
import { Platform } from 'react-native';

// Auto-detect local IP (fallback for physical devices)
// In production, this should come from environment variable
const DETECTED_LOCAL_IP = '192.168.0.148'; // Your current IP

// Get API base URL with fallback
export const getApiUrl = (): string => {
  // Try environment variable first (highest priority)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // For development, use detected local IP for physical devices
  // For emulator/simulator, use localhost
  // In production, this should be set via environment variable
  const isDev = __DEV__ || process.env.NODE_ENV !== 'production';
  
  if (isDev) {
    // Default to localhost for emulator, but can be overridden
    // For physical devices, should use DETECTED_LOCAL_IP
    return 'http://localhost:5000';
  }
  
  // Production fallback (should be set via env var)
  return `http://${DETECTED_LOCAL_IP}:5000`;
};

// Export for debugging
export const API_BASE_URL = getApiUrl();

/**
 * Make an API request with error handling
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const API_BASE_URL = getApiUrl();
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  log.info('[API] Making request', { 
    url, 
    method: options.method || 'GET',
    platform: Platform.OS 
  });

  // Create AbortController for timeout (declare outside try for catch block access)
  const controller = new AbortController();
  let timeoutId: NodeJS.Timeout | undefined = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    timeoutId = undefined;

    log.debug('[API] Response received', { 
      status: response.status, 
      ok: response.ok,
      statusText: response.statusText,
      url 
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      log.error('[API] Non-JSON response', undefined, { status: response.status, text, url });
      throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    log.debug('[API] Response data', { success: data.success, url });

    if (!response.ok) {
      const errorMessage = data.error || `HTTP ${response.status}: ${response.statusText}`;
      log.error('[API] Request failed', undefined, { status: response.status, error: errorMessage, url });
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error: any) {
    // Clear timeout in catch block (important for cleanup)
    if (typeof timeoutId !== 'undefined') {
      clearTimeout(timeoutId);
    }
    
    log.error('[API] Request error', error, { url, endpoint });

    // Clear timeout if request completed
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

    // Enhance error message for network issues
    const errorMessage = error.message || 'Unknown error';
    
    if (
      errorMessage.includes('Network request failed') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('TypeError: Network request failed') ||
      errorMessage.includes('timed out') ||
      errorMessage.includes('timeout')
    ) {
      const enhancedError = new Error(
        `Network Error: Unable to connect to ${API_BASE_URL}\n\n` +
        `Troubleshooting:\n` +
        `1. Ensure backend is running: cd backend && npm run dev\n` +
        `2. Check backend is on port 5000\n` +
        `3. For physical devices, set EXPO_PUBLIC_API_URL to your computer's IP\n` +
        `   Example: http://192.168.0.148:5000\n` +
        `4. Ensure phone and computer are on same Wi-Fi network`
      );
      throw enhancedError;
    }

    throw error;
  }
}

/**
 * Login API request
 */
export async function login(email: string, password: string) {
  return apiRequest<{
    success: boolean;
    data: {
      user: {
        id: number;
        email: string;
        firstName: string;
        lastName?: string;
        subscriptionTier: string;
      };
      token: string;
    };
  }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), password }),
  });
}

/**
 * Register API request
 */
export async function register(data: {
  firstName: string;
  email: string;
  password: string;
  relationshipStatus: string;
  partnerName?: string;
  birthday?: string;
}) {
  return apiRequest<{
    success: boolean;
    data: {
      user: {
        id: number;
        email: string;
        firstName: string;
        lastName?: string;
        subscriptionTier: string;
      };
      token: string;
    };
  }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Health check - verify backend is reachable
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const API_BASE_URL = getApiUrl();
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      log.info('[Health] Backend is reachable', { url: API_BASE_URL, data });
      return true;
    }
    
    log.warn('[Health] Backend returned non-OK status', { status: response.status });
    return false;
  } catch (error) {
    log.error('[Health] Backend unreachable', error, { url: getApiUrl() });
    return false;
  }
}

/**
 * Generic API helper - use this instead of direct fetch calls
 * All screens should use this function or specific helper functions above
 */
export function getApiBaseUrl(): string {
  return getApiUrl();
}

