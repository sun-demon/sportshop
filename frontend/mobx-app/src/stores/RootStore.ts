import { AuthStore } from './AuthStore';
import { CartStore } from './CartStore';
import { OrderStore } from './OrderStore';
import { ProductStore } from './ProductStore';

export class RootStore {
  auth: AuthStore;
  products: ProductStore;
  cart: CartStore;
  orders: OrderStore;

  constructor() {
    this.auth = new AuthStore();
    this.products = new ProductStore();
    this.cart = new CartStore();
    this.orders = new OrderStore();
  }
}

export const rootStore = new RootStore();
