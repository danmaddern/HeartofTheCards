import { apiClient } from '../api/client';
import type { components } from '../api/schema';

export type CreatePayPalOrderResponse = components['schemas']['CreatePayPalOrderResponseEntity'];
export type CapturePayPalOrderResponse = components['schemas']['CapturePayPalOrderResponseEntity'];

export const paymentsService = {
  async createPayPalOrder(orderId: string): Promise<CreatePayPalOrderResponse> {
    const { data, error } = await apiClient.POST('/api/payments/paypal/create-order', {
      body: { orderId } as any,
    });
    if (error) throw error;
    return data as CreatePayPalOrderResponse;
  },

  async capturePayPalOrder(paypalOrderId: string, orderId: string): Promise<CapturePayPalOrderResponse> {
    const { data, error } = await apiClient.POST('/api/payments/paypal/capture-order', {
      body: { paypalOrderId, orderId } as any,
    });
    if (error) throw error;
    return data as CapturePayPalOrderResponse;
  },
};
