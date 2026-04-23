import { makeAutoObservable } from 'mobx';
import type { CartItem, IProduct } from '../types';

export class CartStore {
  items: CartItem[] = [];
  constructor() { makeAutoObservable(this); }

  get total() { return this.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0); }
  get count() { return this.items.reduce((sum, item) => sum + item.quantity, 0); }
  get isEmpty() { return this.items.length === 0; }

  addItem(product: IProduct) {
    const existing = this.items.find((i) => i.product.id === product.id);
    if (existing) { existing.quantity += 1; } else { this.items.push({ product, quantity: 1 }); }
  }
  removeItem(productId: number) { this.items = this.items.filter((i) => i.product.id !== productId); }
  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) { this.removeItem(productId); return; }
    const item = this.items.find((i) => i.product.id === productId);
    if (item) item.quantity = quantity;
  }
  clear() { this.items = []; }
}
