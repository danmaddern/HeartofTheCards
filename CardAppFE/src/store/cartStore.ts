import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem } from '../types';

interface CartState {
  cart: Cart | null;
  isOpen: boolean;
  sessionId: string;
  setCart: (cart: Cart) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getSessionId: () => string;
}

const getOrCreateSessionId = () => {
  let id = localStorage.getItem('sessionId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('sessionId', id);
  }
  return id;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isOpen: false,
      sessionId: getOrCreateSessionId(),

      setCart: (cart) => set({ cart }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      getSessionId: () => {
        const id = get().sessionId || getOrCreateSessionId();
        if (!get().sessionId) set({ sessionId: id });
        return id;
      },
    }),
    {
      name: 'heart-cart',
      partialize: (state) => ({ sessionId: state.sessionId }),
    },
  ),
);

export const cartItemCount = (cart: Cart | null) =>
  cart?.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) ?? 0;
