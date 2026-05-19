import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private loyaltyService: LoyaltyService,
  ) {}

  private generateOrderNumber(): string {
    const prefix = 'HTC';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  async create(userId: string, dto: CreateOrderDto) {
    const address = await this.prisma.address.findUnique({ where: { id: dto.deliveryAddressId } });
    if (!address || address.userId !== userId) throw new NotFoundException('Address not found');

    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) throw new BadRequestException('Cart is empty');

    for (const item of cart.items) {
      if (!item.product.isActive) {
        throw new BadRequestException(`Product "${item.product.name}" is no longer available`);
      }
      if (item.product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${item.product.name}". Available: ${item.product.stockQuantity}`,
        );
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );

    let pointsDiscount = 0;
    let pointsUsed = 0;
    let shippingCost = subtotal >= 150 ? 0 : 9.95;

    if (dto.rewardId) {
      const reward = await this.loyaltyService.validateRewardForUser(userId, dto.rewardId);
      pointsUsed = reward.pointsCost;
      if (reward.type === 'FREE_SHIPPING') {
        shippingCost = 0;
      } else {
        pointsDiscount = reward.discountAmount;
      }
    }

    const total = Math.max(0, subtotal + shippingCost - pointsDiscount);

    const order = await this.prisma.order.create({
      data: {
        userId,
        orderNumber: this.generateOrderNumber(),
        deliveryAddressId: dto.deliveryAddressId,
        subtotal,
        shippingCost,
        pointsDiscount,
        pointsUsed,
        total,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: Number(item.unitPrice) * item.quantity,
          })),
        },
      },
      include: {
        items: true,
        deliveryAddress: true,
      },
    });

    return order;
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: { items: true, deliveryAddress: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return { data: orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        deliveryAddress: true,
        transactions: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (userId && order.userId !== userId) throw new ForbiddenException();
    return order;
  }

  async findAll(page = 1, limit = 20, status?: OrderStatus) {
    const where = status ? { status } : {};
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { items: true, deliveryAddress: true, user: { select: { email: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data: orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.order.update({ where: { id }, data: { status } });

    this.emailService.sendOrderStatusUpdate({
      to: order.user.email,
      firstName: order.user.firstName,
      orderNumber: order.orderNumber,
      status,
    }).catch(() => {});

    return updated;
  }

  async markPaid(orderId: string, paypalOrderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        deliveryAddress: true,
        user: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    const pointsEarned = this.loyaltyService.calculatePointsEarned(Number(order.subtotal));

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PAID,
          paymentStatus: PaymentStatus.PAID,
          paypalOrderId,
          pointsEarned,
        },
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      const cart = await tx.cart.findFirst({ where: { userId: order.userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      await this.loyaltyService.awardPoints(
        tx,
        order.userId,
        orderId,
        order.orderNumber,
        Number(order.subtotal),
        order.pointsUsed,
      );
    });

    this.emailService.sendOrderConfirmation({
      to: order.user.email,
      firstName: order.user.firstName,
      orderNumber: order.orderNumber,
      items: order.items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice.toString(),
      })),
      subtotal: order.subtotal.toString(),
      shippingCost: order.shippingCost.toString(),
      total: order.total.toString(),
      deliveryAddress: {
        fullName: order.deliveryAddress.fullName,
        line1: order.deliveryAddress.line1,
        suburb: order.deliveryAddress.suburb,
        state: order.deliveryAddress.state,
        postcode: order.deliveryAddress.postcode,
      },
    }).catch(() => {});

    return this.findOne(orderId);
  }
}
