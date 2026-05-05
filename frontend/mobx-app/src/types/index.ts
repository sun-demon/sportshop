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
  description: string | null;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IProductCreate {
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string | null;
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

export interface AuthResponse {
  user: IUser;
  /** JWT с бэкенда */
  accessToken: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface CartItem {
  product: IProduct;
  quantity: number;
}
