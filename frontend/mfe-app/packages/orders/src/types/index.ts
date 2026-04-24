export interface IUser {
  id: number;
  email: string;
  name?: string | null;
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string | null;
}

export interface CartItem {
  product: IProduct;
  quantity: number;
}

export interface IOrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product?: IProduct;
}

export interface IOrder {
  id: number;
  userId: number;
  items: IOrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  user?: IUser;
}
