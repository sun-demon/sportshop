import { makeAutoObservable, runInAction } from 'mobx';
import client from '../api/client';
import type { AuthResponse, IUser, LoginRequest, RegisterRequest } from '../types';

export class AuthStore {
  user: IUser | null = null;
  token: string | null = localStorage.getItem('token');
  isLoading = false;
  error: string | null = null;

  private userFetchedAt: number | null = null;
  private readonly USER_CACHE_TTL = 10 * 60 * 1000;

  constructor() { makeAutoObservable(this); }

  get isAuthenticated() { return this.token !== null; }
  get isAdmin() { return this.user?.role === 'admin'; }

  get isUserCacheValid() {
    return this.user !== null && this.userFetchedAt !== null && Date.now() - this.userFetchedAt < this.USER_CACHE_TTL;
  }

  async login(data: LoginRequest) {
    this.isLoading = true; this.error = null;
    try {
      const res = await client.post<AuthResponse>('/auth/login', data);
      runInAction(() => {
        this.token = res.data.token; this.user = res.data.user;
        this.userFetchedAt = Date.now(); localStorage.setItem('token', res.data.token);
      });
    } catch (err: unknown) {
      runInAction(() => { this.error = this.extractMessage(err) ?? 'Неверный email или пароль'; });
      throw err;
    } finally { runInAction(() => { this.isLoading = false; }); }
  }

  async register(data: RegisterRequest) {
    this.isLoading = true; this.error = null;
    try {
      const res = await client.post<AuthResponse>('/auth/register', data);
      runInAction(() => {
        this.token = res.data.token; this.user = res.data.user;
        this.userFetchedAt = Date.now(); localStorage.setItem('token', res.data.token);
      });
    } catch (err: unknown) {
      runInAction(() => { this.error = this.extractMessage(err) ?? 'Ошибка регистрации'; });
      throw err;
    } finally { runInAction(() => { this.isLoading = false; }); }
  }

  async fetchMe(force = false) {
    if (!this.token) return;
    if (!force && this.isUserCacheValid) return;
    try {
      const res = await client.get<IUser>('/auth/me');
      runInAction(() => { this.user = res.data; this.userFetchedAt = Date.now(); });
    } catch { runInAction(() => { this.logout(); }); }
  }

  logout() {
    this.user = null; this.token = null; this.userFetchedAt = null; localStorage.removeItem('token');
  }

  clearError() { this.error = null; }

  private extractMessage(err: unknown): string | null {
    const e = err as { response?: { data?: { message?: string } } };
    return e?.response?.data?.message ?? null;
  }
}
