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

export interface IProductUpdate extends Partial<IProductCreate> {}
