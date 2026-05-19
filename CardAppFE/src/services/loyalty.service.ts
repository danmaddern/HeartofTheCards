import { api } from '../lib/api';

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'FIXED_DISCOUNT' | 'FREE_SHIPPING';
  discountAmount: number;
}

export interface LoyaltyTransaction {
  id: string;
  type: 'EARN' | 'REDEEM' | 'ADMIN_ADJUSTMENT';
  points: number;
  balance: number;
  description: string;
  createdAt: string;
  order?: { orderNumber: string } | null;
}

export interface LoyaltyBalance {
  points: number;
  totalEarned: number;
  rewards: Reward[];
  availableRewards: Reward[];
  transactions: LoyaltyTransaction[];
}

export interface AdminUserPoints {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  loyaltyPoints: number;
  totalPointsEarned: number;
  createdAt: string;
  _count: { orders: number };
}

export const loyaltyService = {
  async getBalance(): Promise<LoyaltyBalance> {
    const { data } = await api.get('/loyalty/balance');
    return data;
  },

  async getRewards(): Promise<Reward[]> {
    const { data } = await api.get('/loyalty/rewards');
    return data;
  },

  async adminGetUsers(page = 1, limit = 20) {
    const { data } = await api.get('/loyalty/admin/users', { params: { page, limit } });
    return data as { data: AdminUserPoints[]; total: number; page: number; limit: number; totalPages: number };
  },

  async adminGetUserTransactions(userId: string) {
    const { data } = await api.get(`/loyalty/admin/users/${userId}/transactions`);
    return data as { user: AdminUserPoints; transactions: LoyaltyTransaction[] };
  },

  async adminAdjustPoints(userId: string, points: number, description: string) {
    const { data } = await api.post('/loyalty/admin/adjust', { userId, points, description });
    return data as { points: number; adjustment: number };
  },
};
