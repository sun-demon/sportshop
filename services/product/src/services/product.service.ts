import { Product as PrismaProduct } from '@prisma/client';

import prisma from '../db/client';
import type { IProduct, IProductCreate } from '@sportshop/shared-types';

// Helper: Convert Prisma Product to IProduct
const toIProduct = (product: PrismaProduct): IProduct => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  stock: product.stock,
  category: product.category,
  imageUrl: product.imageUrl,
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
});

export const createProduct = async (data: IProductCreate): Promise<IProduct> => {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      stock: data.stock ?? 0,
      category: data.category,
      imageUrl: data.imageUrl ?? null,
    },
  });
  return toIProduct(product);
};

export const getProducts = async (): Promise<IProduct[]> => {
  const products = await prisma.product.findMany();
  return products.map(toIProduct);
};

export const getProduct = async (id: number): Promise<IProduct | null> => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return null;
  return toIProduct(product);
};

export const updateProduct = async (id: number, data: Partial<IProductCreate>): Promise<IProduct | null> => {
  try {
    // Filter out undefined values
    const updateData: Partial<{
      name: string;
      description: string | null;
      price: number;
      stock: number;
      category: string;
      imageUrl: string | null;
    }> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });
    return toIProduct(product);
  } catch {
    return null;
  }
};

export const deleteProduct = async (id: number): Promise<boolean> => {
  try {
    await prisma.product.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
};
