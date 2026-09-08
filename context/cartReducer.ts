import type { CartItem } from '@/types';

// ---------------------------------------------------------------------------
// State & Actions
// ---------------------------------------------------------------------------

export interface CartState {
  items: CartItem[];
}

export type CartAction =
  | { type: 'ADD_ITEM'; menuItemId: string }
  | { type: 'REMOVE_ITEM'; menuItemId: string }
  | { type: 'SET_QUANTITY'; menuItemId: string; qty: number }
  | { type: 'SET_NOTE'; menuItemId: string; note: string }
  | { type: 'CLEAR_CART' };

export const MAX_QUANTITY = 99;
export const MAX_NOTE_LENGTH = 200;

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.menuItemId === action.menuItemId
      );

      if (existingIndex === -1) {
        // Item belum ada di keranjang — tambahkan dengan qty=1
        return {
          items: [
            ...state.items,
            { menuItemId: action.menuItemId, quantity: 1, note: '' },
          ],
        };
      }

      // Item sudah ada — increment qty hingga max 99
      const updatedItems = state.items.map((item, index) => {
        if (index !== existingIndex) return item;
        return {
          ...item,
          quantity: Math.min(item.quantity + 1, MAX_QUANTITY),
        };
      });

      return { items: updatedItems };
    }

    case 'REMOVE_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.menuItemId === action.menuItemId
      );

      if (existingIndex === -1) return state;

      const currentQty = state.items[existingIndex].quantity;

      if (currentQty <= 1) {
        // Hapus item dari array saat qty menjadi 0
        return {
          items: state.items.filter(
            (item) => item.menuItemId !== action.menuItemId
          ),
        };
      }

      // Kurangi qty sebesar 1
      return {
        items: state.items.map((item) =>
          item.menuItemId === action.menuItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ),
      };
    }

    case 'SET_QUANTITY': {
      const { menuItemId, qty } = action;

      if (qty <= 0) {
        // Hapus item saat qty = 0 atau negatif
        return {
          items: state.items.filter((item) => item.menuItemId !== menuItemId),
        };
      }

      const clampedQty = Math.min(Math.max(qty, 1), MAX_QUANTITY);
      const exists = state.items.some((item) => item.menuItemId === menuItemId);

      if (!exists) {
        // Tambahkan item baru dengan qty yang sudah di-clamp
        return {
          items: [
            ...state.items,
            { menuItemId, quantity: clampedQty, note: '' },
          ],
        };
      }

      return {
        items: state.items.map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: clampedQty }
            : item
        ),
      };
    }

    case 'SET_NOTE': {
      const { menuItemId, note } = action;
      // Trim catatan jika melebihi 200 karakter
      const trimmedNote =
        note.length > MAX_NOTE_LENGTH ? note.slice(0, MAX_NOTE_LENGTH) : note;

      return {
        items: state.items.map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, note: trimmedNote }
            : item
        ),
      };
    }

    case 'CLEAR_CART': {
      return { items: [] };
    }

    default:
      return state;
  }
}
