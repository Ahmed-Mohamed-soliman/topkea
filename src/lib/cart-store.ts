'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, MIN_ORDER_BY_CATEGORY, VIP_DISCOUNT } from '@/types';

interface CartStore {
  items: CartItem[];
  isVip: boolean;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setVip: (isVip: boolean) => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getDiscount: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isVip: false,

      addItem: (product, quantity) => {
        const minOrder = MIN_ORDER_BY_CATEGORY[product.category];
        const safeQty = Math.max(quantity, minOrder);
        set((state) => {
          const existing = state.items.find(i => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + safeQty }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity: safeQty }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter(i => i.product.id !== productId) }));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          const item = state.items.find(i => i.product.id === productId);
          if (!item) return state;
          const minOrder = MIN_ORDER_BY_CATEGORY[item.product.category];
          if (quantity < minOrder) return state;
          return {
            items: state.items.map(i =>
              i.product.id === productId ? { ...i, quantity } : i
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),

      setVip: (isVip) => set({ isVip }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const price = getEffectivePrice(item.product, item.quantity);
          return sum + price * item.quantity;
        }, 0);
      },

      getDiscount: () => {
        const subtotal = get().getSubtotal();
        return get().isVip ? subtotal * VIP_DISCOUNT : 0;
      },

      getTotal: () => {
        return get().getSubtotal() - get().getDiscount();
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    { name: 'wholesale-cart' }
  )
);

export function getEffectivePrice(product: Product, quantity: number): number {
  if (!product.price_tiers?.length) return product.price;
  const tier = [...product.price_tiers]
    .sort((a, b) => b.min_qty - a.min_qty)
    .find(t => quantity >= t.min_qty);
  return tier ? tier.price : product.price;
}
