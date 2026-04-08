import { IProduct } from "./product";
import { IUser } from "./user";

export interface IOrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number; // price at the time of the order
  product?: IProduct; // optional for extended information
}

export interface IOrder {
  id: number;
  userId: number;
  items: IOrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  user?: IUser; // optional for extended information
}

export interface IOrderCreate {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}
