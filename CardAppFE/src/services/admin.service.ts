import { apiClient } from '../api/client';
import type { components } from '../api/schema';

export type AdminStats = components['schemas']['AdminStatsEntity'];
export type Product = components['schemas']['ProductEntity'];

export const adminService = {
  async getDashboard(): Promise<AdminStats> {
    const { data, error } = await apiClient.GET('/api/admin/dashboard');
    if (error) throw error;
    return data as AdminStats;
  },

  async getLowStock(threshold = 10): Promise<Product[]> {
    const { data, error } = await apiClient.GET('/api/admin/low-stock', {
      params: { query: { threshold: String(threshold) } },
    });
    if (error) throw error;
    return (data ?? []) as Product[];
  },

  async getTransactions(page = 1, limit = 20) {
    const { data, error } = await apiClient.GET('/api/admin/transactions', {
      params: { query: { page: String(page), limit: String(limit) } },
    });
    if (error) throw error;
    return data;
  },
};
