import { IProduct } from "./product";
import { IUser } from "./user";

export interface IOrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number; // цена на момент заказа
  product?: IProduct; // опционально для расширенной информации
}

export interface IOrder {
  id: number;
  userId: number;
  items: IOrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  user?: IUser; // опционально для расширенной информации
}

export interface IOrderCreate {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}
