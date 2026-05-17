import type { components } from '../api/schema';

export type User = components['schemas']['UserEntity'];
export type Product = components['schemas']['ProductEntity'];
export type Category = components['schemas']['CategoryEntity'];
export type CartItem = components['schemas']['CartItemEntity'];
export type Cart = components['schemas']['CartEntity'];
export type Address = components['schemas']['AddressEntity'];
export type OrderItem = components['schemas']['OrderItemEntity'];
export type Order = components['schemas']['OrderEntity'];
export type AdminStats = components['schemas']['AdminStatsEntity'];
export type AuthTokens = components['schemas']['AuthTokensEntity'];
export type AuthResponse = components['schemas']['AuthResponseEntity'];

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
