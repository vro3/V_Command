import { AuthData, GoogleUser, isAllowedUser } from '../types/auth';

// LeadTrack API base URL
const API_BASE = 'https://leadtrack-api-663014504688.us-central1.run.app';

const AUTH_TOKEN_KEY = 'v_command_auth_token';

// Encrypt/decrypt helpers (simple base64 for localStorage)
function encodeToken(data: AuthData): string {
  return btoa(JSON.stringify(data));
}

function decodeToken(encoded: string): AuthData | null {
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
}

// Get stored auth data
export function getStoredAuth(): AuthData | null {
  const stored = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!stored) return null;

  const data = decodeToken(stored);
  if (!data) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return null;
  }

  // Check if token is expired
  if (data.tokens.expiry_date && Date.now() >= data.tokens.expiry_date) {
    // Token expired - we'd need refresh logic, for now clear it
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return null;
  }

  return data;
}

// Store auth data
export function storeAuth(data: AuthData): void {
  localStorage.setItem(AUTH_TOKEN_KEY, encodeToken(data));
}

// Clear auth data
export function clearAuth(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

// Get login URL from LeadTrack API
export async function getLoginUrl(): Promise<string> {
  // Tell LeadTrack API to redirect back to V_Command after OAuth
  const redirectOrigin = window.location.origin;
  const response = await fetch(`${API_BASE}/api/auth/login?redirect_origin=${encodeURIComponent(redirectOrigin)}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to get login URL');
  }

  const data = await response.json();
  return data.authUrl;
}

// Handle OAuth callback - parse token from URL
export function handleAuthCallback(): AuthData | null {
  const urlParams = new URLSearchParams(window.location.search);
  const authToken = urlParams.get('auth_token');

  if (!authToken) return null;

  try {
    // The LeadTrack API returns encrypted token, we need to handle it
    // For now, decode it (the API encrypts with AES, we'll need to handle this)
    const decoded = decodeURIComponent(authToken);

    // Parse the token - LeadTrack uses format: iv.authTag.encrypted
    // We'll need the backend to return unencrypted for V_Command or share decryption
    // For MVP, let's check if it's already JSON
    try {
      const data = JSON.parse(atob(decoded)) as AuthData;
      return data;
    } catch {
      // If it's encrypted, we need a different approach
      // Store the raw token and let backend validate
      console.log('Received encrypted token, storing raw');
      return null;
    }
  } catch (error) {
    console.error('Failed to parse auth token:', error);
    return null;
  }
}

// Validate user is allowed
export function validateUser(user: GoogleUser): boolean {
  return isAllowedUser(user.email);
}

// Check auth status with LeadTrack API
export async function checkAuthStatus(authToken: string): Promise<{ authenticated: boolean; user?: GoogleUser }> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/status`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return { authenticated: false };
    }

    const data = await response.json();
    return {
      authenticated: data.authenticated,
      user: data.user,
    };
  } catch {
    return { authenticated: false };
  }
}

// Logout
export async function logout(): Promise<void> {
  clearAuth();

  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Ignore errors on logout
  }
}

// Get API base URL for other services
export function getApiBase(): string {
  return API_BASE;
}

// Make authenticated API call
export async function authFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const auth = getStoredAuth();

  const headers = new Headers(options.headers);
  if (auth) {
    headers.set('Authorization', `Bearer ${encodeToken(auth)}`);
  }

  return fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });
}
