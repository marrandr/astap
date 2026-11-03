import { getStoredToken } from './auth';
import type { AdminPendingUser, AdminUserDetail } from '../types/admin';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage = typeof data === 'string' ? data : data?.message || 'Une erreur est survenue';
    throw new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
  }

  return data as T;
}

export const adminApi = {
  listPendingUsers: () => request<AdminPendingUser[]>('/admin/users/pending'),
  getUser: (id: number) => request<AdminUserDetail>(`/admin/users/${id}`),
  validateUser: (payload: { id_user: number; status: 'VALIDATE' | 'REFUSED' | 'PENDING' }) =>
    request<{ id: number; status: string; email: string; name: string }>('/admin/validate', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
};
