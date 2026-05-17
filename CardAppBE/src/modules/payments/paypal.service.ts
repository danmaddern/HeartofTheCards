import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface PayPalOrderItem {
  name: string;
  quantity: string;
  unit_amount: { currency_code: string; value: string };
}

@Injectable()
export class PaypalService {
  private readonly logger = new Logger(PaypalService.name);
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private configService: ConfigService) {}

  private get baseUrl(): string {
    const env = this.configService.get<string>('paypal.env');
    return env === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const clientId = this.configService.get<string>('paypal.clientId');
    const clientSecret = this.configService.get<string>('paypal.clientSecret');

    if (!clientId || !clientSecret) {
      throw new BadRequestException('PayPal credentials not configured');
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await axios.post(
      `${this.baseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    this.accessToken = response.data.access_token;
    this.tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
    return this.accessToken!;
  }

  async createOrder(params: {
    orderId: string;
    items: PayPalOrderItem[];
    subtotal: string;
    shipping: string;
    total: string;
  }): Promise<string> {
    const token = await this.getAccessToken();

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: params.orderId,
          description: 'Heart of the Cards Order',
          amount: {
            currency_code: 'AUD',
            value: params.total,
            breakdown: {
              item_total: { currency_code: 'AUD', value: params.subtotal },
              shipping: { currency_code: 'AUD', value: params.shipping },
            },
          },
          items: params.items,
        },
      ],
      application_context: {
        brand_name: 'Heart of the Cards',
        locale: 'en-AU',
        user_action: 'PAY_NOW',
      },
    };

    const response = await axios.post(`${this.baseUrl}/v2/checkout/orders`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.id;
  }

  async captureOrder(paypalOrderId: string): Promise<any> {
    const token = await this.getAccessToken();

    const response = await axios.post(
      `${this.baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  }

  async getOrder(paypalOrderId: string): Promise<any> {
    const token = await this.getAccessToken();

    const response = await axios.get(`${this.baseUrl}/v2/checkout/orders/${paypalOrderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  }
}
