import { describe, it, expect } from 'vitest';
import {
  cartReducer,
  MAX_QUANTITY,
  type CartState,
} from '@/context/cartReducer';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const emptyState: CartState = { items: [] };

function stateWithItem(
  menuItemId: string,
  quantity: number,
  note = ''
): CartState {
  return { items: [{ menuItemId, quantity, note }] };
}

// ---------------------------------------------------------------------------
// addItem
// ---------------------------------------------------------------------------

describe('addItem', () => {
  it('item yang belum ada ditambahkan dengan qty=1', () => {
    const nextState = cartReducer(emptyState, {
      type: 'ADD_ITEM',
      menuItemId: 'MNU-001',
    });

    expect(nextState.items).toHaveLength(1);
    expect(nextState.items[0]).toEqual({
      menuItemId: 'MNU-001',
      quantity: 1,
      note: '',
    });
  });

  it('item yang sudah di qty=99 tetap di qty=99 setelah addItem', () => {
    const state = stateWithItem('MNU-001', MAX_QUANTITY);
    const nextState = cartReducer(state, {
      type: 'ADD_ITEM',
      menuItemId: 'MNU-001',
    });

    expect(nextState.items).toHaveLength(1);
    expect(nextState.items[0].quantity).toBe(MAX_QUANTITY);
  });
});

// ---------------------------------------------------------------------------
// removeItem
// ---------------------------------------------------------------------------

describe('removeItem', () => {
  it('item dengan qty=2 menjadi qty=1 setelah removeItem', () => {
    const state = stateWithItem('MNU-002', 2);
    const nextState = cartReducer(state, {
      type: 'REMOVE_ITEM',
      menuItemId: 'MNU-002',
    });

    expect(nextState.items).toHaveLength(1);
    expect(nextState.items[0].quantity).toBe(1);
  });

  it('item dengan qty=1 dihapus dari array setelah removeItem', () => {
    const state = stateWithItem('MNU-002', 1);
    const nextState = cartReducer(state, {
      type: 'REMOVE_ITEM',
      menuItemId: 'MNU-002',
    });

    expect(nextState.items).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// setQuantity
// ---------------------------------------------------------------------------

describe('setQuantity', () => {
  it('setQuantity(id, 0) menghapus item dari array', () => {
    const state = stateWithItem('MNU-003', 5);
    const nextState = cartReducer(state, {
      type: 'SET_QUANTITY',
      menuItemId: 'MNU-003',
      qty: 0,
    });

    expect(nextState.items).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// clearCart
// ---------------------------------------------------------------------------

describe('clearCart', () => {
  it('clearCart menghasilkan array items kosong', () => {
    const state: CartState = {
      items: [
        { menuItemId: 'MNU-001', quantity: 3, note: '' },
        { menuItemId: 'MNU-002', quantity: 1, note: 'tanpa gula' },
      ],
    };
    const nextState = cartReducer(state, { type: 'CLEAR_CART' });

    expect(nextState.items).toEqual([]);
  });
});
