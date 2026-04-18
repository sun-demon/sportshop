import axios from 'axios';
import type { IUser, IProduct, IOrder } from '@sportshop/shared-types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Добавляем токен к запросам
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email: string, password: string) =>
  api.post<{ user: IUser; token: string }>('/auth/login', { email, password });

export const register = (email: string, password: string, name?: string) =>
  api.post<{ user: IUser; token: string }>('/auth/register', { email, password, name });

export const getMe = () => api.get<IUser>('/auth/me');

// Products
export const getProducts = () => api.get<IProduct[]>('/products');
export const getProduct = (id: number) => api.get<IProduct>(`/products/${id}`);
export const createProduct = (data: Partial<IProduct>) => api.post<IProduct>('/products', data);
export const updateProduct = (id: number, data: Partial<IProduct>) =>
  api.put<IProduct>(`/products/${id}`, data);
export const deleteProduct = (id: number) => api.delete(`/products/${id}`);

// Orders
export const createOrder = (items: { productId: number; quantity: number }[]) =>
  api.post<IOrder>('/orders', { items });
export const getMyOrders = () => api.get<IOrder[]>('/orders/my');
export const getOrder = (id: number) => api.get<IOrder>(`/orders/${id}`);
export const updateOrderStatus = (id: number, status: string) =>
  api.patch<IOrder>(`/orders/${id}/status`, { status });
