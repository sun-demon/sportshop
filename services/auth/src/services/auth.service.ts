import bcrypt from 'bcrypt';
import { User as PrismaUser } from '@prisma/client';

import prisma from '../db/client';
import { IUser } from '@sportshop/shared-types';

export const toIUser = (user: PrismaUser): IUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role as 'customer' | 'admin',
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

export const createUser = async (
  email: string, 
  password: string, 
  name: string | null = null
): Promise<IUser> => {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'customer'
    }
  });

  return toIUser(user);
};

export const findUserByEmail = async (email: string): Promise<PrismaUser | null> => {
  return prisma.user.findUnique({
    where: { email }
  });
};

export const validatePassword = async (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};
