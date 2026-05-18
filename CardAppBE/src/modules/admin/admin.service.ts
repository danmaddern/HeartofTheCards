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

  async getRevenueOverTime(days: number = 30) {
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    from.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: { paymentStatus: 'PAID', createdAt: { gte: from } },
      select: { createdAt: true, total: true },
    });

    const grouped: Record<string, number> = {};
    for (const order of orders) {
      const date = order.createdAt.toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + Number(order.total);
    }

    const result: { date: string; revenue: number }[] = [];
    const cursor = new Date(from);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    while (cursor <= today) {
      const date = cursor.toISOString().split('T')[0];
      result.push({ date, revenue: Number((grouped[date] || 0).toFixed(2)) });
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
  }

  async getSalesByBrand() {
    const items = await this.prisma.orderItem.findMany({
      include: { product: { select: { brand: true } } },
    });

    const grouped: Record<string, { units: number; revenue: number }> = {};
    for (const item of items) {
      const brand = item.product?.brand ?? 'UNKNOWN';
      if (!grouped[brand]) grouped[brand] = { units: 0, revenue: 0 };
      grouped[brand].units += item.quantity;
      grouped[brand].revenue += Number(item.totalPrice);
    }

    return Object.entries(grouped).map(([brand, d]) => ({
      brand,
      units: d.units,
      revenue: Number(d.revenue.toFixed(2)),
    }));
  }

  async getSalesByProductType() {
    const items = await this.prisma.orderItem.findMany({
      include: { product: { select: { productType: true } } },
    });

    const grouped: Record<string, { units: number; revenue: number }> = {};
    for (const item of items) {
      const type = item.product?.productType ?? 'UNKNOWN';
      if (!grouped[type]) grouped[type] = { units: 0, revenue: 0 };
      grouped[type].units += item.quantity;
      grouped[type].revenue += Number(item.totalPrice);
    }

    return Object.entries(grouped).map(([type, d]) => ({
      type,
      units: d.units,
      revenue: Number(d.revenue.toFixed(2)),
    }));
  }

  async getStockOverview(brand?: string, productType?: string) {
    const where: any = { isActive: true };
    if (brand) where.brand = brand;
    if (productType) where.productType = productType;

    return this.prisma.product.findMany({
      where,
      select: { id: true, name: true, sku: true, stockQuantity: true, brand: true, productType: true },
      orderBy: { stockQuantity: 'asc' },
      take: 25,
    });
  }
}
