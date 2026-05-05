import axios from 'axios';
import type { IUser, IProduct, IOrder } from '@sportshop/shared-types';

export type OrderStatus = IOrder['status'];

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Переменные для обновления токена
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Добавляем токен к запросам
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка 401 и обновление токена
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl: string = originalRequest?.url ?? '';
    const isAuthEndpoint =
      requestUrl.includes('/auth/login')
      || requestUrl.includes('/auth/register')
      || requestUrl.includes('/auth/refresh')
      || requestUrl.includes('/auth/logout');
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      
      try {
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth
export const login = (email: string, password: string) =>
  api.post<{ user: IUser; accessToken: string; refreshToken: string }>('/auth/login', { email, password });

export const register = (email: string, password: string, name?: string) =>
  api.post<{ user: IUser; accessToken: string; refreshToken: string }>('/auth/register', { email, password, name });

export const refreshToken = (refreshToken: string) =>
  api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken });

export const logout = (refreshToken: string) =>
  api.post('/auth/logout', { refreshToken });

export const getMe = () => api.get<IUser>('/auth/me');
export const updateMe = (data: { email?: string; name?: string; password?: string }) =>
  api.patch<{ user: IUser; accessToken: string; refreshToken: string }>('/auth/me', data);
export const sendFeedback = (data: { subject: string; message: string }) =>
  api.post<{ message: string }>('/auth/feedback', data);

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
export const getAllOrders = () => api.get<IOrder[]>('/orders');
export const getOrder = (id: number) => api.get<IOrder>(`/orders/${id}`);
export const updateOrderStatus = (id: number, status: OrderStatus) =>
  api.patch<IOrder>(`/orders/${id}/status`, { status });
