import { Product as PrismaProduct } from '@prisma/client';

import prisma from '../db/client';
import type { IProduct, IProductCreate } from '@sportshop/shared-types';

const CATEGORY_FALLBACK_IMAGE: Record<string, string> = {
  'Сила': '/products/assets/products/strength.png',
  'Кардио': '/products/assets/products/cardio.png',
  'Йога': '/products/assets/products/yoga.png',
  'Командные': '/products/assets/products/team-sports.png',
  'Аксессуары': '/products/assets/products/accessories.png',
  'Функционал': '/products/assets/products/functional.png',
  'Восстановление': '/products/assets/products/recovery.png',
  'Единоборства': '/products/assets/products/mma.png',
};

const DEFAULT_FALLBACK_IMAGE = '/products/assets/products/strength.png';

function normalizeImageUrl(imageUrl: string | null, category: string): string {
  if (!imageUrl) return CATEGORY_FALLBACK_IMAGE[category] ?? DEFAULT_FALLBACK_IMAGE;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  if (imageUrl.startsWith('/products/assets/')) return imageUrl;
  if (imageUrl.startsWith('/assets/')) return `/products${imageUrl}`;
  if (imageUrl.startsWith('products/')) return `/${imageUrl}`;
  if (imageUrl.startsWith('assets/')) return `/products/${imageUrl}`;
  return imageUrl;
}

// Helper: Convert Prisma Product to IProduct
const toIProduct = (product: PrismaProduct): IProduct => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  stock: product.stock,
  category: product.category,
  imageUrl: normalizeImageUrl(product.imageUrl, product.category),
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
