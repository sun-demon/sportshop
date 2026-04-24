import type { IProduct } from './types';

declare module 'orders/CartStore' {
  export class CartStore {
    items: Array<{ product: IProduct; quantity: number }>;
    get total(): number;
    get count(): number;
    get isEmpty(): boolean;
    addItem(product: IProduct): void;
    removeItem(productId: number): void;
    updateQuantity(productId: number, quantity: number): void;
    clear(): void;
  }
  export const cartStore: CartStore;
}
