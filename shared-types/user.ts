export interface IUser {
  id: number;
  email: string;
  name?: string | null;
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface IUserWithoutPassword extends IUser {}
