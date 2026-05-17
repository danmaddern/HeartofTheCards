import { apiClient } from '../api/client';
import type { components } from '../api/schema';

export type Address = components['schemas']['AddressEntity'];

export const addressesService = {
  async getAll(): Promise<Address[]> {
    const { data, error } = await apiClient.GET('/api/addresses');
    if (error) throw error;
    return (data ?? []) as Address[];
  },

  async create(body: components['schemas']['CreateAddressDto']): Promise<Address> {
    const { data, error } = await apiClient.POST('/api/addresses', { body });
    if (error) throw error;
    return data as Address;
  },

  async update(id: string, body: Partial<components['schemas']['CreateAddressDto']>): Promise<Address> {
    const { data, error } = await apiClient.PATCH('/api/addresses/{id}', {
      params: { path: { id } },
      body: body as any,
    });
    if (error) throw error;
    return data as Address;
  },

  async remove(id: string): Promise<void> {
    const { error } = await apiClient.DELETE('/api/addresses/{id}', {
      params: { path: { id } },
    });
    if (error) throw error;
  },
};
