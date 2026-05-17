import { apiClient } from '../api/client';
import type { components } from '../api/schema';

export type Order = components['schemas']['OrderEntity'];
export type PaginatedOrders = components['schemas']['PaginatedOrdersEntity'];

export const ordersService = {
  async create(body: components['schemas']['CreateOrderDto']): Promise<Order> {
    const { data, error } = await apiClient.POST('/api/orders', { body });
    if (error) throw error;
    return data as Order;
  },

  async getMyOrders(page = 1, limit = 10): Promise<PaginatedOrders> {
    const { data, error } = await apiClient.GET('/api/orders', {
      params: { query: { page: String(page), limit: String(limit) } },
    });
    if (error) throw error;
    return data as PaginatedOrders;
  },

  async getOne(id: string): Promise<Order> {
    const { data, error } = await apiClient.GET('/api/orders/{id}', {
      params: { path: { id } },
    });
    if (error) throw error;
    return data as Order;
  },

  async getAllAdmin(page = 1, limit = 20, status?: string): Promise<PaginatedOrders> {
    const { data, error } = await apiClient.GET('/api/orders/admin/all', {
      params: { query: { page: String(page), limit: String(limit), status: status ?? '' } },
    });
    if (error) throw error;
    return data as PaginatedOrders;
  },

  async updateStatus(id: string, status: string): Promise<Order> {
    const { data, error } = await apiClient.PATCH('/api/orders/{id}/status', {
      params: { path: { id } },
      body: { status } as any,
    });
    if (error) throw error;
    return data as Order;
  },
};
