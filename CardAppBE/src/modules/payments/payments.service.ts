import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaypalService } from './paypal.service';
import { OrdersService } from '../orders/orders.service';
import { PaymentProvider } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private paypalService: PaypalService,
    private ordersService: OrdersService,
  ) {}

  async createPayPalOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new BadRequestException('Unauthorized');
    if (order.paymentStatus === 'PAID') throw new BadRequestException('Order already paid');

    const items = order.items.map((item) => ({
      name: item.productName.substring(0, 127),
      quantity: item.quantity.toString(),
      unit_amount: {
        currency_code: 'AUD',
        value: Number(item.unitPrice).toFixed(2),
      },
    }));

    const paypalOrderId = await this.paypalService.createOrder({
      orderId: order.id,
      items,
      subtotal: Number(order.subtotal).toFixed(2),
      shipping: Number(order.shippingCost).toFixed(2),
      total: Number(order.total).toFixed(2),
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { paypalOrderId },
    });

    return { paypalOrderId, orderId };
  }

  async capturePayPalOrder(paypalOrderId: string, orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new BadRequestException('Unauthorized');
    if (order.paymentStatus === 'PAID') throw new BadRequestException('Order already paid');

    let captureData: any;
    try {
      captureData = await this.paypalService.captureOrder(paypalOrderId);
    } catch (error: any) {
      this.logger.error('PayPal capture failed', error?.response?.data);
      await this.prisma.transaction.create({
        data: {
          orderId,
          provider: PaymentProvider.PAYPAL,
          providerTransactionId: paypalOrderId,
          amount: order.total,
          currency: 'AUD',
          status: 'FAILED',
          rawResponse: error?.response?.data || {},
        },
      });
      throw new BadRequestException('Payment capture failed');
    }

    const captureId = captureData?.purchase_units?.[0]?.payments?.captures?.[0]?.id || paypalOrderId;
    const captureStatus = captureData?.status;

    await this.prisma.transaction.create({
      data: {
        orderId,
        provider: PaymentProvider.PAYPAL,
        providerTransactionId: captureId,
        amount: order.total,
        currency: 'AUD',
        status: captureStatus,
        rawResponse: captureData,
      },
    });

    if (captureStatus === 'COMPLETED') {
      await this.ordersService.markPaid(orderId, paypalOrderId);
      return { success: true, orderId, captureId };
    }

    throw new BadRequestException(`Payment not completed. Status: ${captureStatus}`);
  }
}
