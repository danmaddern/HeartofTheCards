import { apiClient } from '../api/client';
import type { components } from '../api/schema';

export type Cart = components['schemas']['CartEntity'];

const sessionHeader = () => ({ 'x-session-id': localStorage.getItem('sessionId') ?? '' });

export const cartService = {
  async getCart(): Promise<Cart> {
    const { data, error } = await apiClient.GET('/api/cart', {
      params: { header: sessionHeader() },
    });
    if (error) throw error;
    return data as Cart;
  },

  async addItem(body: components['schemas']['AddToCartDto']): Promise<Cart> {
    const { data, error } = await apiClient.POST('/api/cart/items', {
      params: { header: sessionHeader() },
      body,
    });
    if (error) throw error;
    return data as Cart;
  },

  async updateItem(id: string, quantity: number): Promise<Cart> {
    const { data, error } = await apiClient.PATCH('/api/cart/items/{id}', {
      params: { header: sessionHeader(), path: { id } },
      body: { quantity },
    });
    if (error) throw error;
    return data as Cart;
  },

  async removeItem(id: string): Promise<Cart> {
    const { data, error } = await apiClient.DELETE('/api/cart/items/{id}', {
      params: { header: sessionHeader(), path: { id } },
    });
    if (error) throw error;
    return data as Cart;
  },

  async clearCart(): Promise<Cart> {
    const { data, error } = await apiClient.DELETE('/api/cart', {
      params: { header: sessionHeader() },
    });
    if (error) throw error;
    return data as Cart;
  },

  async mergeCart(sessionId: string): Promise<void> {
    const { error } = await apiClient.POST('/api/cart/merge', {
      body: { sessionId } as any,
    });
    if (error) throw error;
  },
};
