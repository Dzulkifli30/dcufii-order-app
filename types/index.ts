// Shared TypeScript interfaces for d`cufii Cashier App

/**
 * Represents a single menu item available at the cafe.
 */
export interface MenuItem {
  id: string;          // e.g. "MNU-001"
  name: string;
  description: string; // ≤ 100 karakter
  price: number;       // dalam Rupiah, 1000–999000
  category: string;    // e.g. "Minuman", "Makanan", "Snack"
  imageUrl: string;    // URL gambar lokal atau Cloudinary
  imagePublicId?: string;
  stock?: number;      // jumlah tersedia; item dengan stok <= 5 dianggap habis
}

/**
 * Represents a single item in the customer's cart.
 */
export interface CartItem {
  menuItemId: string;
  quantity: number;    // 1–99
  note: string;        // maks 200 karakter
}

/**
 * Payment method options available to the customer.
 */
export type PaymentMethod = 'QRIS' | 'TRANSFER_BANK' | 'CASH';

/** Status lifecycle pesanan yang diperbolehkan. */
export type OrderStatus = 'menunggu pembayaran' | 'pending' | 'selesai';

export interface OrderItemSnapshot {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  note: string;
}

export interface Order {
  id: string;
  customerName: string;
  tableNumber: number;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  items: OrderItemSnapshot[];
  status: OrderStatus;
  createdAt: unknown;
  updatedAt?: unknown;
}

export interface AuthUser {
  uid: string;
  email: string | null;
}

/**
 * The value provided by CartContext — all cart state and operations.
 */
export interface CartContextValue {
  items: CartItem[];
  addItem: (menuItemId: string) => void;
  removeItem: (menuItemId: string) => void;
  setQuantity: (menuItemId: string, qty: number) => void;
  setNote: (menuItemId: string, note: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: (menuData: MenuItem[]) => number;
}

/**
 * Local state for the confirmation page form.
 */
export interface OrderState {
  customerName: string;
  tableNumber: number | '';
  paymentMethod: PaymentMethod | null;
}

/**
 * Validation error messages keyed by form field name.
 */
export interface ValidationErrors {
  customerName?: string;
  tableNumber?: string;
  paymentMethod?: string;
}

/**
 * Props for the CartButton component.
 */
export interface CartButtonProps {
  totalItems: number;
  onClick: () => void;
}
