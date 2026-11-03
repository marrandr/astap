const AUTH_TOKEN_KEY = 'astap_access_token';
const AUTH_EXPIRY_KEY = 'astap_access_token_expires_at';
const REMEMBER_DURATION = 30 * 24 * 60 * 60 * 1000;
const AUTH_PENDING_EMAIL_KEY = 'astap_pending_email';

export function getStoredToken(): string | null {
  const localToken = localStorage.getItem(AUTH_TOKEN_KEY);
  if (localToken) {
    const expiresAt = localStorage.getItem(AUTH_EXPIRY_KEY);
    if (expiresAt && (!Number.isFinite(Number(expiresAt)) || Date.now() >= Number(expiresAt))) {
      localStorage.removeItem(AUTH_TOKEN_KEY); localStorage.removeItem(AUTH_EXPIRY_KEY);
      return sessionStorage.getItem(AUTH_TOKEN_KEY);
    }
    return localToken;
  }
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
}
export function getTokenRole(token: string | null): 'ADMIN' | 'PERSONAL' | null {
  if (!token) return null;
  try {
    const part = token.split('.')[1]; if (!part) return null;
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))) as { role?: unknown; exp?: unknown };
    if (typeof payload.exp !== 'number' || Date.now() >= payload.exp * 1000) return null;
    return payload.role === 'ADMIN' || payload.role === 'PERSONAL' ? payload.role : null;
  } catch { return null; }
}
export function setStoredToken(token: string, remember = true) {
  clearStoredToken();
  if (remember) { localStorage.setItem(AUTH_TOKEN_KEY, token); localStorage.setItem(AUTH_EXPIRY_KEY, String(Date.now() + REMEMBER_DURATION)); }
  else sessionStorage.setItem(AUTH_TOKEN_KEY, token);
}
export function clearStoredToken() { localStorage.removeItem(AUTH_TOKEN_KEY); localStorage.removeItem(AUTH_EXPIRY_KEY); sessionStorage.removeItem(AUTH_TOKEN_KEY); }
export const getPendingEmail = () => localStorage.getItem(AUTH_PENDING_EMAIL_KEY);
export const setPendingEmail = (email: string) => localStorage.setItem(AUTH_PENDING_EMAIL_KEY, email);
export const clearPendingEmail = () => localStorage.removeItem(AUTH_PENDING_EMAIL_KEY);
