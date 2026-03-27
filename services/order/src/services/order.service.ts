import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IOrder, IOrderCreate } from '@sportshop/shared-types';
import { Order, OrderItem } from '@prisma/client';

type OrderWithItems = Order & { items: OrderItem[] };

const toIOrder = (order: OrderWithItems): IOrder => ({
  id: order.id,
  userId: order.userId,
  total: order.total,
  status: order.status as 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled',
  items: order.items.map(item => ({
    id: item.id,
    orderId: item.orderId,
    productId: item.productId,
    quantity: item.quantity,
    price: item.price,
  })),
  createdAt: order.createdAt.toISOString(),
  updatedAt: order.updatedAt.toISOString(),
});

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: number, data: IOrderCreate): Promise<IOrder> {
    // TODO: Calculate total from products (call product service)
    const order = await this.prisma.order.create({
      data: {
        userId,
        total: 0,
        status: 'pending',
      },
      include: { items: true },
    });
    return toIOrder(order);
  }

  async getOrdersByUser(userId: number): Promise<IOrder[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
    });
    return orders.map(toIOrder);
  }

  async getAllOrders(): Promise<IOrder[]> {
    const orders = await this.prisma.order.findMany({
      include: { items: true },
    });
    return orders.map(toIOrder);
  }

  async getOrder(id: number): Promise<IOrder | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) return null;
    return toIOrder(order);
  }

  async updateOrderStatus(id: number, status: string): Promise<IOrder | null> {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
    return toIOrder(order);
  }
}
