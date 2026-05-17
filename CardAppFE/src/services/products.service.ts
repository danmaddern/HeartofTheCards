import { apiClient } from '../api/client';
import type { components } from '../api/schema';

export type Product = components['schemas']['ProductEntity'];
export type PaginatedProducts = components['schemas']['PaginatedProductsEntity'];

export interface ProductFilters {
  brand?: 'POKEMON' | 'ONE_PIECE';
  productType?: 'BOOSTER_BOX' | 'INDIVIDUAL_CARD' | 'ACCESSORY';
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'featured';
}

export const productsService = {
  async getAll(filters: ProductFilters = {}): Promise<PaginatedProducts> {
    const { data, error } = await apiClient.GET('/api/products', { params: { query: filters as any } });
    if (error) throw error;
    return data as PaginatedProducts;
  },

  async getBySlug(slug: string): Promise<Product> {
    const { data, error } = await apiClient.GET('/api/products/{slug}', {
      params: { path: { slug } },
    });
    if (error) throw error;
    return data as Product;
  },

  async getFeatured(limit = 8): Promise<Product[]> {
    const { data, error } = await apiClient.GET('/api/products/featured', {
      params: { query: { limit: String(limit) } },
    });
    if (error) throw error;
    return (data ?? []) as Product[];
  },

  async create(body: components['schemas']['CreateProductDto']): Promise<Product> {
    const { data, error } = await apiClient.POST('/api/products', { body });
    if (error) throw error;
    return data as Product;
  },

  async update(id: string, body: components['schemas']['UpdateProductDto']): Promise<Product> {
    const { data, error } = await apiClient.PATCH('/api/products/{id}', {
      params: { path: { id } },
      body,
    });
    if (error) throw error;
    return data as Product;
  },

  async remove(id: string): Promise<void> {
    const { error } = await apiClient.DELETE('/api/products/{id}', {
      params: { path: { id } },
    });
    if (error) throw error;
  },
};
