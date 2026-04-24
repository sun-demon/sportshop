export interface IUser {
  id: number;
  email: string;
  name?: string | null;
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: IUser;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}
