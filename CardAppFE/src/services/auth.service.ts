import { apiClient } from '../api/client';
import type { components } from '../api/schema';

export type User = components['schemas']['UserEntity'];
export type AuthResponse = components['schemas']['AuthResponseEntity'];
export type AuthTokens = components['schemas']['AuthTokensEntity'];

export const authService = {
  async register(data: components['schemas']['RegisterDto']): Promise<AuthResponse> {
    const { data: res, error } = await apiClient.POST('/api/auth/register', { body: data });
    if (error) throw error;
    return res as AuthResponse;
  },

  async login(data: components['schemas']['LoginDto']): Promise<AuthResponse> {
    const { data: res, error } = await apiClient.POST('/api/auth/login', { body: data });
    if (error) throw error;
    return res as AuthResponse;
  },

  async getMe(): Promise<User> {
    const { data: res, error } = await apiClient.GET('/api/auth/me');
    if (error) throw error;
    return res as User;
  },

  async forgotPassword(email: string): Promise<void> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw await res.json();
  },

  async resetPassword(token: string, password: string): Promise<void> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) throw await res.json();
  },
};
