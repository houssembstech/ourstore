import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  product: string;
  name: Record<string, string>;
  image: string;
  price: number;
  comparePrice?: number;
  stock: number;
  quantity: number;
  category?: { name: Record<string, string>; slug: string };
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  preferredLang?: string;
}

// ─── Cart Store ───────────────────────────────────────────────────
interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.product === newItem.product);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product === newItem.product
                  ? { ...i, quantity: Math.min(i.quantity + newItem.quantity, i.stock) }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.product !== productId) })),
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    }),
    { name: 'ourstore-cart' }
  )
);

// ─── Auth Store ────────────────────────────────────────────────────
interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isAgent: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('ourstore_token', token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('ourstore_token');
        localStorage.removeItem('ourstore_user');
        set({ user: null, token: null });
      },
      isAdmin: () => get().user?.role === 'admin',
      isAgent: () => ['admin', 'agent'].includes(get().user?.role || ''),
    }),
    { name: 'ourstore-auth' }
  )
);

// ─── UI Store ─────────────────────────────────────────────────────
interface UIStore {
  cartOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  cartOpen: false,
  searchOpen: false,
  setCartOpen: (open) => set({ cartOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  toast: null,
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3500);
  },
  hideToast: () => set({ toast: null }),
}));
