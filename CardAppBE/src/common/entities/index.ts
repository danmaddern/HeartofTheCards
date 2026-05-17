import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty() id: string;
  @ApiProperty() email: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty({ required: false }) phone?: string;
  @ApiProperty({ enum: ['CUSTOMER', 'ADMIN'] }) role: string;
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;
}

export class AuthTokensEntity {
  @ApiProperty() accessToken: string;
  @ApiProperty() refreshToken: string;
}

export class AuthResponseEntity {
  @ApiProperty({ type: () => UserEntity }) user: UserEntity;
  @ApiProperty({ type: () => AuthTokensEntity }) tokens: AuthTokensEntity;
}

export class CategoryEntity {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiProperty({ required: false }) description?: string;
  @ApiProperty({ required: false }) imageUrl?: string;
}

export class ProductEntity {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiProperty() description: string;
  @ApiProperty({ enum: ['POKEMON', 'ONE_PIECE'] }) brand: string;
  @ApiProperty({ enum: ['BOOSTER_BOX', 'INDIVIDUAL_CARD', 'ACCESSORY'] }) productType: string;
  @ApiProperty() price: string;
  @ApiProperty({ required: false }) compareAtPrice?: string;
  @ApiProperty() stockQuantity: number;
  @ApiProperty({ type: [String] }) imageUrls: string[];
  @ApiProperty() isFeatured: boolean;
  @ApiProperty() isActive: boolean;
  @ApiProperty() sku: string;
  @ApiProperty() categoryId: string;
  @ApiProperty({ type: () => CategoryEntity, required: false }) category?: CategoryEntity;
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;
}

export class PaginatedProductsEntity {
  @ApiProperty({ type: [ProductEntity] }) data: ProductEntity[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}

export class CartItemEntity {
  @ApiProperty() id: string;
  @ApiProperty() cartId: string;
  @ApiProperty() productId: string;
  @ApiProperty() quantity: number;
  @ApiProperty() unitPrice: string;
  @ApiProperty({ type: () => ProductEntity }) product: ProductEntity;
}

export class CartEntity {
  @ApiProperty() id: string;
  @ApiProperty({ required: false }) userId?: string;
  @ApiProperty({ required: false }) sessionId?: string;
  @ApiProperty({ type: [CartItemEntity] }) items: CartItemEntity[];
  @ApiProperty() itemCount: number;
  @ApiProperty() subtotal: string;
}

export class AddressEntity {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty() fullName: string;
  @ApiProperty() line1: string;
  @ApiProperty({ required: false }) line2?: string;
  @ApiProperty() suburb: string;
  @ApiProperty() state: string;
  @ApiProperty() postcode: string;
  @ApiProperty() country: string;
  @ApiProperty() phone: string;
  @ApiProperty() isDefault: boolean;
}

export class OrderItemEntity {
  @ApiProperty() id: string;
  @ApiProperty() orderId: string;
  @ApiProperty() productId: string;
  @ApiProperty() productName: string;
  @ApiProperty() quantity: number;
  @ApiProperty() unitPrice: string;
  @ApiProperty() totalPrice: string;
}

export class OrderEntity {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty() orderNumber: string;
  @ApiProperty({ enum: ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'] })
  status: string;
  @ApiProperty({ enum: ['UNPAID', 'PAID', 'FAILED', 'REFUNDED'] }) paymentStatus: string;
  @ApiProperty() subtotal: string;
  @ApiProperty() shippingCost: string;
  @ApiProperty() total: string;
  @ApiProperty() deliveryAddressId: string;
  @ApiProperty({ type: () => AddressEntity, required: false }) deliveryAddress?: AddressEntity;
  @ApiProperty({ type: [OrderItemEntity] }) items: OrderItemEntity[];
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;
}

export class PaginatedOrdersEntity {
  @ApiProperty({ type: [OrderEntity] }) data: OrderEntity[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}

export class CreatePayPalOrderResponseEntity {
  @ApiProperty() paypalOrderId: string;
  @ApiProperty() orderId: string;
}

export class CapturePayPalOrderResponseEntity {
  @ApiProperty() success: boolean;
  @ApiProperty() orderId: string;
}

export class AdminStatsEntity {
  @ApiProperty() totalRevenue: string;
  @ApiProperty() totalOrders: number;
  @ApiProperty() totalProducts: number;
  @ApiProperty() lowStockProducts: number;
  @ApiProperty({ type: [OrderEntity] }) recentOrders: OrderEntity[];
  @ApiProperty({ type: 'object', additionalProperties: { type: 'number' } })
  ordersByStatus: Record<string, number>;
}

export class SalesReportItemEntity {
  @ApiProperty() productId: string;
  @ApiProperty() productName: string;
  @ApiProperty() sku: string;
  @ApiProperty() brand: string;
  @ApiProperty() category: string;
  @ApiProperty({ required: false, nullable: true }) imageUrl: string | null;
  @ApiProperty() unitsSold: number;
  @ApiProperty() revenue: string;
  @ApiProperty() stockRemaining: number;
}

export class PaginatedInventoryEntity {
  @ApiProperty({ type: [ProductEntity] }) data: ProductEntity[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}

export class UploadResponseEntity {
  @ApiProperty() url: string;
  @ApiProperty() filename: string;
}
