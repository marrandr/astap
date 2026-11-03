import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';
import { loggedOut } from './authSlice';
import type { ArticleComment, ArticleDetail, LoginResponse, NewsWatchItem, PaginatedArticles, RegisterResponse, TopicOption, VerifyEmailResponse } from '../types/api';
import type { AdminPendingUser, AdminUserDetail } from '../types/admin';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});
export const api = createApi({
  reducerPath: 'api', baseQuery: async (args, api, extra) => {
    const result = await baseQuery(args, api, extra);
    if (result.error?.status === 401 && (api.getState() as RootState).auth.token) api.dispatch(loggedOut());
    return result;
  },
  tagTypes: ['Articles', 'Article', 'Topics', 'Watch', 'PendingUsers', 'AdminUser'],
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, { email: string; password: string }>({ query: (body) => ({ url: '/auth/login', method: 'POST', body }) }),
    getCurrentUser: build.query<{ id: number; name: string; email: string; role: string; status: string; media: { name: string; city: string | null } | null }, void>({ query: () => '/user/me' }),
    register: build.mutation<RegisterResponse, { payload: Record<string, unknown>; files?: File[] | { front?: File; back?: File } }>({
      query: ({ payload, files }) => { const body = new FormData(); Object.entries(payload).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== '') body.append(k, String(v)); });
        if (files) { const pair = Array.isArray(files) ? { front: files[0], back: files[1] } : files; if (pair.front) body.append('front', pair.front); if (pair.back) body.append('back', pair.back); }
        return { url: '/auth/register', method: 'POST', body }; },
    }),
    verifyEmail: build.mutation<VerifyEmailResponse, { email: string; code: string }>({ query: (body) => ({ url: '/auth/verify-email', method: 'POST', body }) }),
    resendVerification: build.mutation<{ message: string }, string>({ query: (email) => ({ url: '/auth/resend-verification', method: 'POST', body: { email } }) }),
    listTopics: build.query<TopicOption[], void>({ query: () => '/article/topics', providesTags: ['Topics'] }),
    createArticle: build.mutation<{ message: string; article: unknown }, { payload: { title: string; content: string; topicId: number; location?: string | null; eventDate?: string | null; coverImageUrl?: string | null; parentArticleId?: number | null; relationType?: 'SUPPORTS' | 'CONTRADICTS' | null }; files?: { coverImage?: File; images?: File[] } }>({
      query: ({ payload, files }) => { const body = new FormData(); Object.entries(payload).forEach(([k,v]) => { if (v !== undefined && v !== null) body.append(k, String(v)); }); if (files?.coverImage) body.append('coverImage', files.coverImage); files?.images?.forEach(f => body.append('images', f)); return { url: '/article', method: 'POST', body }; }, invalidatesTags: ['Articles'],
    }),
    listArticles: build.query<PaginatedArticles, { page?: number; limit?: number } | void>({ query: (params) => { const search = new URLSearchParams(); if (params?.page) search.set('page', String(params.page)); if (params?.limit) search.set('limit', String(params.limit)); return `/article${search.size ? `?${search}` : ''}`; }, providesTags: ['Articles'] }),
    getArticle: build.query<ArticleDetail, number>({ query: (id) => `/article/${id}`, providesTags: (_r,_e,id) => [{ type: 'Article', id }] }),
    getPublicWatchArticles: build.query<NewsWatchItem[], void>({ query: () => '/watch/articles', providesTags: ['Watch'] }),
    refreshPublicWatch: build.mutation<{ totalResults: number; received: number; saved: number; items: NewsWatchItem[] }, void>({ query: () => ({ url: '/watch/refresh', method: 'POST' }), invalidatesTags: ['Watch'] }),
    createComment: build.mutation<{ message: string; comment: ArticleComment }, { articleId: number; payload: { stance: 'FOR' | 'AGAINST'; content: string; justification: string } }>({ query: ({ articleId, payload }) => ({ url: `/article/${articleId}/comment`, method: 'POST', body: payload }), invalidatesTags: (_r,_e,arg) => [{ type: 'Article', id: arg.articleId }, 'Articles'] }),
    listPendingUsers: build.query<AdminPendingUser[], void>({ query: () => '/admin/users/pending', providesTags: ['PendingUsers'] }),
    getAdminUser: build.query<AdminUserDetail, number>({ query: (id) => `/admin/users/${id}`, providesTags: (_r,_e,id) => [{ type: 'AdminUser', id }] }),
    validateUser: build.mutation<{ id: number; status: string; email: string; name: string }, { id_user: number; status: 'VALIDATE' | 'REFUSED' | 'PENDING' }>({ query: (body) => ({ url: '/admin/validate', method: 'PATCH', body }), invalidatesTags: ['PendingUsers'] }),
    listAdminWatchArticles: build.query<NewsWatchItem[], void>({ query: () => '/admin/watch/articles', providesTags: ['Watch'] }),
    syncWatchArticles: build.mutation<{ totalResults: number; received: number; saved: number; items: NewsWatchItem[] }, void>({ query: () => ({ url: '/admin/watch/sync', method: 'POST' }), invalidatesTags: ['Watch'] }),
  }),
});
export const { useLoginMutation, useGetCurrentUserQuery, useRegisterMutation, useVerifyEmailMutation, useResendVerificationMutation, useListTopicsQuery, useCreateArticleMutation, useListArticlesQuery, useGetArticleQuery, useGetPublicWatchArticlesQuery, useRefreshPublicWatchMutation, useCreateCommentMutation, useListPendingUsersQuery, useGetAdminUserQuery, useValidateUserMutation, useListAdminWatchArticlesQuery, useSyncWatchArticlesMutation } = api;
