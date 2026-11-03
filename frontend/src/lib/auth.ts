import { createContext, useContext } from 'react';

const AUTH_TOKEN_KEY = 'astap_access_token';
const AUTH_EXPIRY_KEY = 'astap_access_token_expires_at';
const REMEMBER_DURATION = 30 * 24 * 60 * 60 * 1000;
const AUTH_PENDING_EMAIL_KEY = 'astap_pending_email';

export function getStoredToken(): string | null {
  const expiresAt = localStorage.getItem(AUTH_EXPIRY_KEY);
  if (expiresAt && (!Number.isFinite(Number(expiresAt)) || Date.now() >= Number(expiresAt))) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_EXPIRY_KEY);
  }
  return sessionStorage.getItem(AUTH_TOKEN_KEY) ?? localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string, remember = true) {
  clearStoredToken();
  if (remember) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_EXPIRY_KEY, String(Date.now() + REMEMBER_DURATION));
  } else {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function clearStoredToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_EXPIRY_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getPendingEmail(): string | null {
  return localStorage.getItem(AUTH_PENDING_EMAIL_KEY);
}

export function setPendingEmail(email: string) {
  localStorage.setItem(AUTH_PENDING_EMAIL_KEY, email);
}

export function clearPendingEmail() {
  localStorage.removeItem(AUTH_PENDING_EMAIL_KEY);
}

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, remember?: boolean) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
