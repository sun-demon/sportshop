import { makeAutoObservable, runInAction } from 'mobx';
import client from '../api/client';
import type { IProduct, IProductCreate } from '../types';

export class ProductStore {
  products: IProduct[] = [];
  selectedProduct: IProduct | null = null;
  isLoading = false;
  isLoadingOne = false;
  error: string | null = null;

  private listFetchedAt: number | null = null;
  private readonly LIST_CACHE_TTL = 5 * 60 * 1000;
  private productCache = new Map<number, { product: IProduct; fetchedAt: number }>();
  private readonly ITEM_CACHE_TTL = 5 * 60 * 1000;

  constructor() {
    makeAutoObservable(this);
  }

  get categories(): string[] {
    return [...new Set(this.products.map((p) => p.category))].sort();
  }

  get isListCacheValid(): boolean {
    return (
      this.products.length > 0 &&
      this.listFetchedAt !== null &&
      Date.now() - this.listFetchedAt < this.LIST_CACHE_TTL
    );
  }

  isItemCacheValid(id: number): boolean {
    const cached = this.productCache.get(id);
    return Boolean(cached && Date.now() - cached.fetchedAt < this.ITEM_CACHE_TTL);
  }

  async fetchProducts(force = false): Promise<void> {
    if (!force && this.isListCacheValid) return;
    this.isLoading = true;
    this.error = null;
    try {
      const res = await client.get<IProduct[]>('/products');
      runInAction(() => {
        this.products = res.data;
        this.listFetchedAt = Date.now();
        res.data.forEach((p) => {
          this.productCache.set(p.id, { product: p, fetchedAt: Date.now() });
        });
      });
    } catch {
      runInAction(() => { this.error = 'Не удалось загрузить товары'; });
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  async fetchProduct(id: number, force = false): Promise<void> {
    if (!force && this.isItemCacheValid(id)) {
      const cached = this.productCache.get(id)!;
      runInAction(() => { this.selectedProduct = cached.product; });
      return;
    }
    this.isLoadingOne = true;
    this.error = null;
    try {
      const res = await client.get<IProduct>(`/products/${id}`);
      runInAction(() => {
        this.selectedProduct = res.data;
        this.productCache.set(id, { product: res.data, fetchedAt: Date.now() });
      });
    } catch {
      runInAction(() => { this.error = 'Товар не найден'; });
    } finally {
      runInAction(() => { this.isLoadingOne = false; });
    }
  }

  async createProduct(data: IProductCreate): Promise<IProduct> {
    const res = await client.post<IProduct>('/products', data);
    runInAction(() => {
      this.products.push(res.data);
      this.productCache.set(res.data.id, { product: res.data, fetchedAt: Date.now() });
    });
    return res.data;
  }

  async updateProduct(id: number, data: Partial<IProductCreate>): Promise<IProduct> {
    const res = await client.put<IProduct>(`/products/${id}`, data);
    runInAction(() => {
      const idx = this.products.findIndex((p) => p.id === id);
      if (idx !== -1) this.products[idx] = res.data;
      if (this.selectedProduct?.id === id) this.selectedProduct = res.data;
      this.productCache.set(id, { product: res.data, fetchedAt: Date.now() });
    });
    return res.data;
  }

  async deleteProduct(id: number): Promise<void> {
    await client.delete(`/products/${id}`);
    runInAction(() => {
      this.products = this.products.filter((p) => p.id !== id);
      this.productCache.delete(id);
      if (this.selectedProduct?.id === id) this.selectedProduct = null;
    });
  }

  clearSelected(): void {
    this.selectedProduct = null;
  }
}

export const productStore = new ProductStore();
