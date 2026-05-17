import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalOrders,
      paidOrders,
      totalProducts,
      lowStockProducts,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { total: true },
      }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.count({ where: { isActive: true, stockQuantity: { lte: 10 } } }),
      this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
          items: true,
        },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    const statusMap = ordersByStatus.reduce(
      (acc, { status, _count }) => {
        acc[status] = _count.status;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalRevenue: (paidOrders._sum.total || 0).toFixed(2),
      totalOrders,
      totalProducts,
      lowStockProducts,
      recentOrders,
      ordersByStatus: statusMap,
    };
  }

  async getLowStockProducts(threshold = 10) {
    return this.prisma.product.findMany({
      where: { isActive: true, stockQuantity: { lte: threshold } },
      include: { category: true },
      orderBy: { stockQuantity: 'asc' },
    });
  }

  async getTransactions(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { order: { select: { orderNumber: true, userId: true } } },
      }),
      this.prisma.transaction.count(),
    ]);
    return { data: transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getSalesReport() {
    const soldItems = await this.prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      _sum: { quantity: true, totalPrice: true },
      _count: { id: true },
      orderBy: { _sum: { totalPrice: 'desc' } },
    });

    const productIds = soldItems.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, stockQuantity: true, imageUrls: true, sku: true, brand: true, category: { select: { name: true } } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    return soldItems.map((item) => {
      const product = productMap.get(item.productId);
      return {
        productId: item.productId,
        productName: item.productName,
        sku: product?.sku ?? '',
        brand: product?.brand ?? '',
        category: product?.category?.name ?? '',
        imageUrl: product?.imageUrls?.[0] ?? null,
        unitsSold: item._sum.quantity ?? 0,
        revenue: Number(item._sum.totalPrice ?? 0).toFixed(2),
        stockRemaining: product?.stockQuantity ?? 0,
      };
    });
  }

  async getInventory(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { stockQuantity: 'asc' },
        include: { category: { select: { name: true } } },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data: products, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async adjustStock(productId: string, adjustment: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const newStock = Math.max(0, product.stockQuantity + adjustment);
    return this.prisma.product.update({
      where: { id: productId },
      data: { stockQuantity: newStock },
      include: { category: true },
    });
  }

  async setStock(productId: string, quantity: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.product.update({
      where: { id: productId },
      data: { stockQuantity: Math.max(0, quantity) },
      include: { category: true },
    });
  }
}
