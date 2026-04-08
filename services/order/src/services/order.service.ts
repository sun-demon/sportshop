import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IOrder, IOrderCreate } from '@sportshop/shared-types';
import { Order, OrderItem } from '@prisma/client';
import axios from 'axios';

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
  private productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';

  constructor(private prisma: PrismaService) {}

  private async getProductPrice(productId: number): Promise<number> {
    try {
      const response = await axios.get(`${this.productServiceUrl}/products/${productId}`);
      return response.data.price;
    } catch (error: any) {
      console.error(`Failed to get product ${productId} price:`, error.message);
      throw new Error(`Product ${productId} not found`);
    }
  }

  async createOrder(userId: number, data: IOrderCreate): Promise<IOrder> {
    const orderWithItems = await this.prisma.$transaction(async (prisma) => {
      const order = await prisma.order.create({
        data: {
          userId,
          total: 0,
          status: 'pending',
        },
      });
      
      let total = 0;
      
      for (const item of data.items) {
        const price = await this.getProductPrice(item.productId);
        
        const orderItem = await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: price,
          },
        });
        total += price * item.quantity;
      }
      
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { total },
        include: { items: true },
      });
      
      return updatedOrder;
    });
    
    return toIOrder(orderWithItems);
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
