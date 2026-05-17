import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) throw new BadRequestException('userId or sessionId required');

    const where = userId ? { userId } : { sessionId };
    let cart = await this.prisma.cart.findFirst({
      where,
      include: { items: { include: { product: { include: { category: true } } } } },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: userId ? { userId } : { sessionId },
        include: { items: { include: { product: { include: { category: true } } } } },
      });
    }

    return this.formatCart(cart);
  }

  async addToCart(dto: AddToCartDto, userId?: string) {
    const { productId, quantity, sessionId } = dto;

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (!product.isActive) throw new BadRequestException('Product is not available');
    if (product.stockQuantity < quantity) {
      throw new BadRequestException(`Only ${product.stockQuantity} items in stock`);
    }

    const where = userId ? { userId } : { sessionId };
    let cart = await this.prisma.cart.findFirst({ where });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: userId ? { userId } : { sessionId } });
    }

    const existingItem = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (product.stockQuantity < newQty) {
        throw new BadRequestException(`Only ${product.stockQuantity} items in stock`);
      }
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          unitPrice: product.price,
        },
      });
    }

    return this.getOrCreateCart(userId, sessionId);
  }

  async updateCartItem(itemId: string, dto: UpdateCartItemDto, userId?: string, sessionId?: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true },
    });
    if (!item) throw new NotFoundException('Cart item not found');

    const cartBelongs = userId
      ? item.cart.userId === userId
      : item.cart.sessionId === sessionId;
    if (!cartBelongs) throw new NotFoundException('Cart item not found');

    if (dto.quantity === 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      if (item.product.stockQuantity < dto.quantity) {
        throw new BadRequestException(`Only ${item.product.stockQuantity} items in stock`);
      }
      await this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity: dto.quantity } });
    }

    return this.getOrCreateCart(userId, sessionId);
  }

  async removeCartItem(itemId: string, userId?: string, sessionId?: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!item) throw new NotFoundException('Cart item not found');

    const cartBelongs = userId
      ? item.cart.userId === userId
      : item.cart.sessionId === sessionId;
    if (!cartBelongs) throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getOrCreateCart(userId, sessionId);
  }

  async clearCart(userId?: string, sessionId?: string) {
    const where = userId ? { userId } : { sessionId };
    const cart = await this.prisma.cart.findFirst({ where });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return this.getOrCreateCart(userId, sessionId);
  }

  async mergeCart(sessionId: string, userId: string) {
    const guestCart = await this.prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });
    if (!guestCart || guestCart.items.length === 0) return;

    let userCart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!userCart) {
      userCart = await this.prisma.cart.create({ data: { userId } });
    }

    for (const item of guestCart.items) {
      const existingItem = await this.prisma.cartItem.findUnique({
        where: { cartId_productId: { cartId: userCart.id, productId: item.productId } },
      });
      if (existingItem) {
        await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + item.quantity },
        });
      } else {
        await this.prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
        });
      }
    }

    await this.prisma.cart.delete({ where: { id: guestCart.id } });
  }

  private formatCart(cart: any) {
    const subtotal = cart.items.reduce(
      (sum: number, item: any) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );
    return {
      id: cart.id,
      userId: cart.userId,
      sessionId: cart.sessionId,
      items: cart.items,
      itemCount: cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      subtotal: subtotal.toFixed(2),
    };
  }
}
