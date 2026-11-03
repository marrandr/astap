import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getStoredToken, setStoredToken, clearStoredToken } from '../src/lib/auth.ts';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage(), configurable: true });
  Object.defineProperty(globalThis, 'sessionStorage', { value: memoryStorage(), configurable: true });
});

test('a login without remember me lasts only for the browser session', () => {
  setStoredToken('session-token', false);
  assert.equal(getStoredToken(), 'session-token');
  assert.equal(localStorage.getItem('astap_access_token'), null);
  assert.equal(sessionStorage.getItem('astap_access_token'), 'session-token');
});

test('a remembered login is discarded after 30 days', (context) => {
  context.mock.method(Date, 'now', () => 1_000);
  setStoredToken('remembered-token', true);
  assert.equal(getStoredToken(), 'remembered-token');
  context.mock.method(Date, 'now', () => 1_000 + 30 * 24 * 60 * 60 * 1000);
  assert.equal(getStoredToken(), null);
  assert.equal(localStorage.getItem('astap_access_token'), null);
});

test('starting a session login clears a previous persistent login', () => {
  setStoredToken('old-token', true);
  setStoredToken('new-token', false);
  assert.equal(getStoredToken(), 'new-token');
  assert.equal(localStorage.getItem('astap_access_token'), null);
});

test('logout clears both remembered and session credentials', () => {
  setStoredToken('remembered-token', true);
  sessionStorage.setItem('astap_access_token', 'session-token');
  clearStoredToken();
  assert.equal(getStoredToken(), null);
  assert.equal(sessionStorage.getItem('astap_access_token'), null);
  assert.equal(localStorage.getItem('astap_access_token'), null);
});
