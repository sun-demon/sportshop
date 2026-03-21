import { IUserWithoutPassword } from './user';
import { IProduct } from './product';
import { IOrder } from './order';

// Auth API
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: IUserWithoutPassword;
  token: string;
}

// Product API
export interface ProductsResponse {
  products: IProduct[];
  total: number;
  page: number;
  limit: number;
}

// Order API
export interface OrderResponse {
  order: IOrder;
}

export interface OrdersResponse {
  orders: IOrder[];
  total: number;
}

// Error response
export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}
