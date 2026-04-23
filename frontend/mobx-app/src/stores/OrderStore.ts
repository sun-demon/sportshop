import { makeAutoObservable, runInAction } from 'mobx';
import client from '../api/client';
import type { IOrder } from '../types';

export class OrderStore {
  myOrders: IOrder[] = [];
  allOrders: IOrder[] = [];
  isLoading = false;
  error: string | null = null;

  private myOrdersFetchedAt: number | null = null;
  private allOrdersFetchedAt: number | null = null;
  private readonly MY_CACHE_TTL = 60 * 1000;
  private readonly ALL_CACHE_TTL = 30 * 1000;

  constructor() { makeAutoObservable(this); }

  get isMyOrdersCacheValid() {
    return this.myOrders.length > 0 && this.myOrdersFetchedAt !== null && Date.now() - this.myOrdersFetchedAt < this.MY_CACHE_TTL;
  }
  get isAllOrdersCacheValid() {
    return this.allOrders.length > 0 && this.allOrdersFetchedAt !== null && Date.now() - this.allOrdersFetchedAt < this.ALL_CACHE_TTL;
  }
  get totalSpent() { return this.myOrders.reduce((sum, o) => sum + o.total, 0); }
  get deliveredCount() { return this.myOrders.filter((o) => o.status === 'delivered').length; }

  async fetchMyOrders(force = false) {
    if (!force && this.isMyOrdersCacheValid) return;
    this.isLoading = true;
    try {
      const res = await client.get<IOrder[]>('/orders/my');
      runInAction(() => { this.myOrders = res.data; this.myOrdersFetchedAt = Date.now(); });
    } catch { runInAction(() => { this.error = 'Не удалось загрузить заказы'; }); }
    finally { runInAction(() => { this.isLoading = false; }); }
  }

  async fetchAllOrders(force = false) {
    if (!force && this.isAllOrdersCacheValid) return;
    this.isLoading = true;
    try {
      const res = await client.get<IOrder[]>('/orders');
      runInAction(() => { this.allOrders = res.data; this.allOrdersFetchedAt = Date.now(); });
    } catch { runInAction(() => { this.error = 'Не удалось загрузить заказы'; }); }
    finally { runInAction(() => { this.isLoading = false; }); }
  }

  async createOrder(items: Array<{ productId: number; quantity: number }>): Promise<IOrder> {
    const res = await client.post<IOrder>('/orders', { items });
    runInAction(() => { this.myOrders.unshift(res.data); this.allOrdersFetchedAt = null; });
    return res.data;
  }

  async updateOrderStatus(id: number, status: IOrder['status']) {
    const res = await client.patch<IOrder>(`/orders/${id}/status`, { status });
    runInAction(() => {
      const idx = this.allOrders.findIndex((o) => o.id === id);
      if (idx !== -1) this.allOrders[idx] = res.data;
      const myIdx = this.myOrders.findIndex((o) => o.id === id);
      if (myIdx !== -1) this.myOrders[myIdx] = res.data;
    });
  }

  clearOrders() {
    this.myOrders = []; this.allOrders = [];
    this.myOrdersFetchedAt = null; this.allOrdersFetchedAt = null;
  }
}
