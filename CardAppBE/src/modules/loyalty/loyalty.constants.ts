export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'FIXED_DISCOUNT' | 'FREE_SHIPPING';
  discountAmount: number;
}

export const REWARDS_CATALOG: Reward[] = [
  {
    id: 'free_shipping',
    name: 'Free Shipping',
    description: 'Get free shipping on your next order',
    pointsCost: 50,
    type: 'FREE_SHIPPING',
    discountAmount: 0,
  },
  {
    id: 'discount_5',
    name: '$5 Off',
    description: '$5 discount on your next order',
    pointsCost: 100,
    type: 'FIXED_DISCOUNT',
    discountAmount: 5,
  },
  {
    id: 'discount_15',
    name: '$15 Off',
    description: '$15 discount on your next order',
    pointsCost: 250,
    type: 'FIXED_DISCOUNT',
    discountAmount: 15,
  },
  {
    id: 'discount_35',
    name: '$35 Off',
    description: '$35 discount on your next order',
    pointsCost: 500,
    type: 'FIXED_DISCOUNT',
    discountAmount: 35,
  },
];

export const POINTS_PER_DOLLAR = 1;
