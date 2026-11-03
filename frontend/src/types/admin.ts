export interface AdminPendingUser {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'PERSONAL';
  status: 'VALIDATE' | 'PENDING' | 'REFUSED';
  verified: boolean;
  registeredAt: string;
  media?: {
    id: number;
    name: string;
  } | null;
}

export interface AdminUserDetail {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'PERSONAL';
  status: 'VALIDATE' | 'PENDING' | 'REFUSED';
  verified: boolean;
  reputation: number;
  registeredAt: string;
  proofFrontUrl: string | null;
  proofBackUrl: string | null;
  media: {
    id: number;
    name: string;
    mediaType: string;
    city: string | null;
    website: string | null;
  } | null;
}
