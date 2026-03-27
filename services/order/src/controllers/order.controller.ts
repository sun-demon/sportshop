import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { AuthGuard } from '../guards/auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dtos';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(@Request() req: any, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(req.user.id, createOrderDto);
  }

  @Get('my')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user orders' })
  async getMyOrders(@Request() req: any) {
    return this.orderService.getOrdersByUser(req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders (admin only)' })
  async getAllOrders(@Request() req: any) {
    if (req.user.role !== 'admin') {
      return this.orderService.getOrdersByUser(req.user.id);
    }
    return this.orderService.getAllOrders();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order by ID' })
  async getOrder(@Param('id') id: string, @Request() req: any) {
    const order = await this.orderService.getOrder(Number(id));
    if (!order) {
      throw new Error('Order not found');
    }
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      throw new Error('Access denied');
    }
    return order;
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (admin only)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
    @Request() req: any
  ) {
    if (req.user.role !== 'admin') {
      throw new Error('Only admin can update status');
    }
    return this.orderService.updateOrderStatus(Number(id), updateStatusDto.status);
  }
}
