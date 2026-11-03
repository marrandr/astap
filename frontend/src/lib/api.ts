import { clearStoredToken, getStoredToken } from './auth';
import type {
  PaginatedArticles,
  ArticleDetail,
  LoginResponse,
  RegisterResponse,
  VerifyEmailResponse,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
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
    // Si un token était présent et est rejeté, il est expiré : on déconnecte proprement.
    if (response.status === 401 && token) {
      clearStoredToken();
      window.location.assign('/auth/login');
    }

    const errorMessage = typeof data === 'string' ? data : data?.message || 'Une erreur est survenue';
    throw new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
  }

  return data as T;
}

export const api = {
  login: (payload: { email: string; password: string }) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }),

  register: (
    payload: Record<string, unknown>,
    files?: File[] | { front?: File; back?: File },
  ) => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });

    if (files) {
      if (Array.isArray(files)) {
        const [front, back] = files;
        if (front) formData.append('front', front);
        if (back) formData.append('back', back);
      } else {
        if (files.front) formData.append('front', files.front);
        if (files.back) formData.append('back', files.back);
      }
    }

    return request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: formData,
    });
  },

  verifyEmail: (payload: { email: string; code: string }) =>
    request<VerifyEmailResponse>('/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }),

  resendVerification: (email: string) =>
    request<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    }),

  listArticles: (params: { page?: number; limit?: number } = {}) => {
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));
    const qs = search.toString();
    return request<PaginatedArticles>(`/article${qs ? `?${qs}` : ''}`);
  },

  getArticle: (id: number) => request<ArticleDetail>(`/article/${id}`),
};
