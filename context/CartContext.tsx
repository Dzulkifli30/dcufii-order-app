'use client';

import React, { createContext, useCallback, useContext, useReducer } from 'react';
import type { CartContextValue, MenuItem } from '@/types';
import { cartReducer, MAX_QUANTITY } from '@/context/cartReducer';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CartContext = createContext<CartContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem = useCallback((menuItemId: string) => {
    dispatch({ type: 'ADD_ITEM', menuItemId });
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', menuItemId });
  }, []);

  const setQuantity = useCallback((menuItemId: string, qty: number) => {
    dispatch({ type: 'SET_QUANTITY', menuItemId, qty });
  }, []);

  const setNote = useCallback((menuItemId: string, note: string) => {
    dispatch({ type: 'SET_NOTE', menuItemId, note });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  // Computed: sum of all quantities
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  // Computed: sum of (price × quantity) for each cart item
  const totalPrice = (menuData: MenuItem[]): number => {
    return state.items.reduce((sum, cartItem) => {
      const menuItem = menuData.find((m) => m.id === cartItem.menuItemId);
      if (!menuItem) return sum;
      return sum + menuItem.price * cartItem.quantity;
    }, 0);
  };

  const value: CartContextValue = {
    items: state.items,
    addItem,
    removeItem,
    setQuantity,
    setNote,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart harus digunakan di dalam CartProvider');
  }
  return context;
}

// Re-export MAX_QUANTITY for consumers that need it (e.g. MenuCard)
export { MAX_QUANTITY };
