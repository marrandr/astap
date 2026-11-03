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

export interface ImageAiAnalysis {
  id: number;
  aiScore: number;
  modelUsed: string;
  analyzedAt: string;
}

export interface TextAiAnalysis {
  id: number;
  aiScore: number;
  isAiGenerated: boolean | null;
  modelUsed: string;
  analyzedAt: string;
}

export interface ArticleImage {
  id: number;
  fileUrl: string;
  analyses?: ImageAiAnalysis[];
}

export interface NewsWatchItem {
  id: number;
  providerId: string;
  title: string;
  description: string | null;
  link: string;
  sourceId: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  language: string | null;
  country: string[];
  categories: string[];
  imageUrl: string | null;
  sentiment: string | null;
  publishedAt: string | null;
  fetchedAt: string;
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
  images?: ArticleImage[];
  aiAnalyses?: TextAiAnalysis[];
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
  images: ArticleImage[];
}

export interface TopicOption {
  id: number;
  label: string;
}

export interface TopicListResponse extends Array<TopicOption> {}
