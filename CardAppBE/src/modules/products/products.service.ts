import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: ProductFilterDto) {
    const { brand, productType, categoryId, search, minPrice, maxPrice, featured, page = 1, limit = 20, sort } = filters;

    const where: Prisma.ProductWhereInput = { isActive: true };

    if (brand) where.brand = brand;
    if (productType) where.productType = productType;
    if (categoryId) where.categoryId = categoryId;
    if (featured !== undefined) where.isFeatured = featured;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price = { ...where.price as object, gte: minPrice };
      if (maxPrice !== undefined) where.price = { ...where.price as object, lte: maxPrice };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'featured') orderBy = { isFeatured: 'desc' };

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data: products, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    const existing = await this.prisma.product.findFirst({
      where: { OR: [{ slug: dto.slug }, { sku: dto.sku }] },
    });
    if (existing) throw new ConflictException('Product with this slug or SKU already exists');

    return this.prisma.product.create({
      data: dto,
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findById(id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getFeatured(limit = 8) {
    return this.prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: true },
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getLowStock(threshold = 10) {
    return this.prisma.product.findMany({
      where: { isActive: true, stockQuantity: { lte: threshold } },
      include: { category: true },
      orderBy: { stockQuantity: 'asc' },
    });
  }
}
