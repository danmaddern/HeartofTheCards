import { apiClient } from '../api/client';
import { apiUrl } from '../lib/apiUrl';
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

  async getRevenueOverTime(days: number): Promise<{ date: string; revenue: number }[]> {
    const res = await fetch(apiUrl(`/api/admin/charts/revenue?days=${days}`), {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async getSalesByBrand(): Promise<{ brand: string; units: number; revenue: number }[]> {
    const res = await fetch(apiUrl('/api/admin/charts/sales-by-brand'), {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async getSalesByProductType(): Promise<{ type: string; units: number; revenue: number }[]> {
    const res = await fetch(apiUrl('/api/admin/charts/sales-by-type'), {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async getStockOverview(brand?: string, productType?: string): Promise<{ id: string; name: string; sku: string; stockQuantity: number; brand: string; productType: string }[]> {
    const params = new URLSearchParams();
    if (brand) params.set('brand', brand);
    if (productType) params.set('productType', productType);
    const res = await fetch(apiUrl(`/api/admin/charts/stock?${params}`), {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
};
