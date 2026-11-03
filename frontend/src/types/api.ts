export interface LoginResponse {
  access_token: string;
}

export interface RegisterResponse {
  message: string;
}

export interface VerifyEmailResponse {
  message: string;
  access_token?: string;
}

export interface AuthErrorResponse {
  message?: string;
  error?: string;
}

export type ArticleVerdict = 'CONFIRMED' | 'CONTRADICTED' | 'NEW' | 'IN_PROGRESS'
  | 'PARTIALLY_TRUE' | 'MISLEADING' | 'MISSING_CONTEXT';

export interface ArticleComment {
  id: number;
  content: string;
  stance: 'FOR' | 'AGAINST';
  justification: string;
  commentedAt: string;
  user: { id: number; name: string };
}

export interface ArticleSummary {
  id: number;
  title: string;
  content: string;
  location: string | null;
  eventDate: string | null;
  coverImageUrl: string | null;
  publishedAt: string;
  status: ArticleVerdict;
  relationType: 'SUPPORTS' | 'CONTRADICTS' | null;
  author: { id: number; name: string };
  topic: { id: number; label: string };
  images?: Array<{ id: number; fileUrl: string }>;
  comments?: ArticleComment[];
  commentsCount?: number;
  commentCounts?: {
    for: number;
    against: number;
  };
  _count: {
    verifications: number;
    evidences: number;
    comments: number;
  };
}

export interface PaginatedArticles {
  items: ArticleSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ArticleDetail extends Omit<ArticleSummary, '_count'> {
  author: { id: number; name: string; email: string };
  verifications: Array<{
    id: number;
    verdict: 'CONFIRMED' | 'DISPUTED';
    justification: string;
    verifiedAt: string;
    user: { id: number; name: string };
  }>;
  evidences: Array<{
    id: number;
    type: string;
    url: string | null;
    file: string | null;
    description: string | null;
    addedAt: string;
  }>;
  comments?: ArticleComment[];
  commentsCount?: number;
  commentCounts?: {
    for: number;
    against: number;
  };
  images: Array<{ id: number; fileUrl: string }>;
}

export interface TopicOption {
  id: number;
  label: string;
}

export interface TopicListResponse extends Array<TopicOption> {}
