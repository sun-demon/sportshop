import { makeAutoObservable, runInAction } from 'mobx';
import client from '../api/client';
import type { AuthResponse, IUser, LoginRequest, RegisterRequest } from '../types';

export class AuthStore {
  user: IUser | null = null;
  token: string | null = localStorage.getItem('accessToken') ?? localStorage.getItem('token');
  refreshToken: string | null = localStorage.getItem('refreshToken');
  isLoading = false;
  /** true пока грузим /auth/me (нужно для admin-only маршрутов после F5) */
  isFetchingUser = false;
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
        const t = res.data.accessToken;
        this.token = t;
        this.refreshToken = res.data.refreshToken ?? null;
        this.user = res.data.user;
        this.userFetchedAt = Date.now();
        localStorage.setItem('accessToken', t);
        localStorage.removeItem('token');
        if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);
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
        const t = res.data.accessToken;
        this.token = t;
        this.refreshToken = res.data.refreshToken ?? null;
        this.user = res.data.user;
        this.userFetchedAt = Date.now();
        localStorage.setItem('accessToken', t);
        localStorage.removeItem('token');
        if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);
      });
    } catch (err: unknown) {
      runInAction(() => { this.error = this.extractMessage(err) ?? 'Ошибка регистрации'; });
      throw err;
    } finally { runInAction(() => { this.isLoading = false; }); }
  }

  async fetchMe(force = false) {
    if (!this.token) return;
    if (!force && this.isUserCacheValid) return;
    runInAction(() => { this.isFetchingUser = true; });
    try {
      const res = await client.get<IUser>('/auth/me');
      runInAction(() => { this.user = res.data; this.userFetchedAt = Date.now(); });
    } catch {
      runInAction(() => { this.logout(); });
    } finally {
      runInAction(() => { this.isFetchingUser = false; });
    }
  }

  async logout() {
    const refreshToken = this.refreshToken ?? localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await client.post('/auth/logout', { refreshToken });
      } catch {
        // Do not block local logout on network/API failure.
      }
    }
    this.user = null;
    this.token = null;
    this.refreshToken = null;
    this.userFetchedAt = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  async updateProfile(data: { email?: string; name?: string; password?: string }) {
    const res = await client.patch<AuthResponse>('/auth/me', data);
    runInAction(() => {
      this.user = res.data.user;
      this.token = res.data.accessToken;
      this.refreshToken = res.data.refreshToken ?? null;
      this.userFetchedAt = Date.now();
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.removeItem('token');
      if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);
      else localStorage.removeItem('refreshToken');
    });
  }

  async sendFeedback(data: { subject: string; message: string }) {
    await client.post('/auth/feedback', data);
  }

  syncFromStorage() {
    this.token = localStorage.getItem('accessToken') ?? localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
    if (!this.token) this.user = null;
  }

  clearError() { this.error = null; }

  private extractMessage(err: unknown): string | null {
    const e = err as { response?: { data?: { message?: string } } };
    return e?.response?.data?.message ?? null;
  }
}
