import { makeAutoObservable, runInAction } from 'mobx';
import client from '../api/client';
import type { IOrder, IUser } from '../types';

export class OrderStore {
  myOrders: IOrder[] = [];
  allOrders: IOrder[] = [];
  user: IUser | null = null;
  isLoading = false;
  error: string | null = null;

  private myOrdersFetchedAt: number | null = null;
  private readonly MY_CACHE_TTL = 60 * 1000;

  constructor() {
    makeAutoObservable(this);
  }

  get isMyOrdersCacheValid(): boolean {
    return (
      this.myOrders.length > 0 &&
      this.myOrdersFetchedAt !== null &&
      Date.now() - this.myOrdersFetchedAt < this.MY_CACHE_TTL
    );
  }

  get totalSpent(): number {
    return this.myOrders.reduce((sum, o) => sum + o.total, 0);
  }

  get deliveredCount(): number {
    return this.myOrders.filter((o) => o.status === 'delivered').length;
  }

  get isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  async fetchMe(): Promise<void> {
    try {
      const res = await client.get<IUser>('/auth/me');
      runInAction(() => { this.user = res.data; });
    } catch {
      // ignore
    }
  }

  async fetchMyOrders(force = false): Promise<void> {
    if (!force && this.isMyOrdersCacheValid) return;
    this.isLoading = true;
    try {
      const res = await client.get<IOrder[]>('/orders/my');
      runInAction(() => {
        this.myOrders = res.data;
        this.myOrdersFetchedAt = Date.now();
      });
    } catch {
      runInAction(() => { this.error = 'Не удалось загрузить заказы'; });
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  async fetchAllOrders(): Promise<void> {
    this.isLoading = true;
    try {
      const res = await client.get<IOrder[]>('/orders');
      runInAction(() => { this.allOrders = res.data; });
    } catch {
      runInAction(() => { this.error = 'Не удалось загрузить заказы'; });
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  async createOrder(items: Array<{ productId: number; quantity: number }>): Promise<IOrder> {
    const res = await client.post<IOrder>('/orders', { items });
    runInAction(() => {
      this.myOrders.unshift(res.data);
    });
    return res.data;
  }

  async updateOrderStatus(id: number, status: IOrder['status']): Promise<void> {
    const res = await client.patch<IOrder>(`/orders/${id}/status`, { status });
    runInAction(() => {
      const idx = this.allOrders.findIndex((o) => o.id === id);
      if (idx !== -1) this.allOrders[idx] = res.data;
    });
  }
}

export const orderStore = new OrderStore();
