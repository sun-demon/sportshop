/**
 * AuthStore — управляет состоянием авторизации в host-приложении.
 *
 * Токен хранится в localStorage, поэтому все MFE (catalog, orders)
 * читают его напрямую из localStorage и не зависят от этого стора.
 * Выход из системы очищает localStorage — MFE при следующем запросе
 * получат 401 и перенаправят пользователя обратно на /login.
 */

import { makeAutoObservable, runInAction } from 'mobx';
import client from '../api/client';
import type { AuthResponse, IUser, LoginRequest, RegisterRequest } from '../types';

export class AuthStore {
  user: IUser | null = null;
  token: string | null = localStorage.getItem('token');
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    // Если есть токен при старте — подгружаем профиль
    if (this.token) {
      this.fetchMe();
    }
  }

  get isAuthenticated(): boolean {
    return this.token !== null;
  }

  get isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  async login(data: LoginRequest): Promise<void> {
    this.isLoading = true;
    this.error = null;
    try {
      const res = await client.post<AuthResponse>('/auth/login', data);
      runInAction(() => {
        this.token = res.data.token;
        this.user  = res.data.user;
        localStorage.setItem('token', res.data.token);
      });
    } catch (err: unknown) {
      runInAction(() => {
        this.error = this.extractMessage(err) ?? 'Неверный email или пароль';
      });
      throw err;
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  async register(data: RegisterRequest): Promise<void> {
    this.isLoading = true;
    this.error = null;
    try {
      const res = await client.post<AuthResponse>('/auth/register', data);
      runInAction(() => {
        this.token = res.data.token;
        this.user  = res.data.user;
        localStorage.setItem('token', res.data.token);
      });
    } catch (err: unknown) {
      runInAction(() => {
        this.error = this.extractMessage(err) ?? 'Ошибка регистрации';
      });
      throw err;
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  async fetchMe(): Promise<void> {
    if (!this.token) return;
    try {
      const res = await client.get<IUser>('/auth/me');
      runInAction(() => { this.user = res.data; });
    } catch {
      runInAction(() => { this.logout(); });
    }
  }

  logout(): void {
    this.user  = null;
    this.token = null;
    localStorage.removeItem('token');
  }

  clearError(): void {
    this.error = null;
  }

  private extractMessage(err: unknown): string | null {
    if (
      err &&
      typeof err === 'object' &&
      'response' in err &&
      (err as { response?: { data?: { message?: string } } }).response?.data?.message
    ) {
      return (err as { response: { data: { message: string } } }).response.data.message;
    }
    return null;
  }
}

export const authStore = new AuthStore();
