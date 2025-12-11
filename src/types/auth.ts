export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export interface AuthData {
  user: GoogleUser;
  tokens: GoogleTokens;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: GoogleUser | null;
  error: string | null;
}

// Allowed users - only these emails can access V_Command
export const ALLOWED_EMAILS = [
  'vince@vinceromanelli.com',
  'vr@vrcreativegroup.com',
];

export function isAllowedUser(email: string): boolean {
  return ALLOWED_EMAILS.includes(email.toLowerCase());
}
