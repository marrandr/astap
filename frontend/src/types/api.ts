export interface LoginResponse {
  access_token: string;
}

export interface RegisterResponse {
  access_token: string;
  message: string;
}

export interface AuthErrorResponse {
  message?: string;
  error?: string;
}
