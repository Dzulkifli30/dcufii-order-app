import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  cartReducer,
  MAX_QUANTITY,
  MAX_NOTE_LENGTH,
  type CartState,
} from '@/context/cartReducer';
import type { CartItem, MenuItem } from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive totalItems from a CartState, mirroring CartContext logic */
function totalItems(state: CartState): number {
  return state.items.reduce((sum, item) => sum + item.quantity, 0);
}

/** Derive totalPrice from a CartState + menu data, mirroring CartContext logic */
function totalPrice(state: CartState, menuData: MenuItem[]): number {
  return state.items.reduce((sum, cartItem) => {
    const menuItem = menuData.find((m) => m.id === cartItem.menuItemId);
    if (!menuItem) return sum;
    return sum + menuItem.price * cartItem.quantity;
  }, 0);
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Generate a valid menu item id */
const menuItemIdArb = fc.stringMatching(/^MNU-\d{3}$/).filter((s) => s.length > 0);

/** Generate a small set of distinct menu item ids */
const menuItemIdsArb = fc
  .uniqueArray(menuItemIdArb, { minLength: 1, maxLength: 5 })
  .filter((ids) => ids.length >= 1);

/** Generate a CartItem with valid quantity [1–99] and note (≤200 chars) */
const cartItemArb = (id: string): fc.Arbitrary<CartItem> =>
  fc.record({
    menuItemId: fc.constant(id),
    quantity: fc.integer({ min: 1, max: MAX_QUANTITY }),
    note: fc.string({ maxLength: MAX_NOTE_LENGTH }),
  });

/** Generate a CartState with 0–5 unique items */
const cartStateArb: fc.Arbitrary<CartState> = menuItemIdsArb.chain((ids) =>
  fc
    .array(
      fc.oneof(...ids.map((id) => cartItemArb(id))),
      { minLength: 0, maxLength: ids.length }
    )
    // Deduplicate by menuItemId (keep last occurrence)
    .map((items) => {
      const seen = new Map<string, CartItem>();
      for (const item of items) seen.set(item.menuItemId, item);
      return { items: Array.from(seen.values()) };
    })
);

/** Generate a MenuItem for a given id */
const menuItemArb = (id: string): fc.Arbitrary<MenuItem> =>
  fc.record({
    id: fc.constant(id),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    description: fc.string({ maxLength: 100 }),
    price: fc.integer({ min: 1000, max: 999000 }),
    category: fc.constantFrom('Minuman', 'Makanan', 'Snack'),
    imageUrl: fc.constant(`/images/${id}.jpg`),
  });

/** Generate a set of MenuItems matching a CartState */
const menuDataArb = (ids: string[]): fc.Arbitrary<MenuItem[]> =>
  fc.tuple(...ids.map((id) => menuItemArb(id))).map((items) =>
    Array.isArray(items) ? items : [items as MenuItem]
  );

// ---------------------------------------------------------------------------
// Property 1: Batas kuantitas item keranjang
// Feature: dcufii-cashier-app, Property 1: Batas kuantitas item keranjang
// Validates: Requirements 2.2, 2.3
// ---------------------------------------------------------------------------

describe('Property 1: Batas kuantitas item keranjang', () => {
  it('addItem tidak pernah menghasilkan qty di luar [1, 99]', () => {
    // Feature: dcufii-cashier-app, Property 1: Batas kuantitas item keranjang
    fc.assert(
      fc.property(cartStateArb, fc.string({ minLength: 1, maxLength: 20 }), (state, id) => {
        const nextState = cartReducer(state, { type: 'ADD_ITEM', menuItemId: id });
        for (const item of nextState.items) {
          expect(item.quantity).toBeGreaterThanOrEqual(1);
          expect(item.quantity).toBeLessThanOrEqual(MAX_QUANTITY);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('setQuantity tidak pernah menghasilkan qty di luar [1, 99] untuk item yang ada', () => {
    // Feature: dcufii-cashier-app, Property 1: Batas kuantitas item keranjang
    fc.assert(
      fc.property(
        cartStateArb,
        fc.integer({ min: 1, max: 200 }), // nilai bisa > 99 untuk menguji clamping
        (state, qty) => {
          // Only makes sense when there is at least one item to target
          if (state.items.length === 0) return;
          const id = state.items[0].menuItemId;
          const nextState = cartReducer(state, { type: 'SET_QUANTITY', menuItemId: id, qty });
          for (const item of nextState.items) {
            expect(item.quantity).toBeGreaterThanOrEqual(1);
            expect(item.quantity).toBeLessThanOrEqual(MAX_QUANTITY);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('setQuantity dengan qty baru pada item yang belum ada tidak menghasilkan qty di luar [1, 99]', () => {
    // Feature: dcufii-cashier-app, Property 1: Batas kuantitas item keranjang
    fc.assert(
      fc.property(
        cartStateArb,
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.integer({ min: 1, max: 200 }),
        (state, id, qty) => {
          const nextState = cartReducer(state, { type: 'SET_QUANTITY', menuItemId: id, qty });
          for (const item of nextState.items) {
            expect(item.quantity).toBeGreaterThanOrEqual(1);
            expect(item.quantity).toBeLessThanOrEqual(MAX_QUANTITY);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2: Hapus item saat kuantitas mencapai 0
// Feature: dcufii-cashier-app, Property 2: Hapus item saat kuantitas mencapai 0
// Validates: Requirements 2.5, 3.5
// ---------------------------------------------------------------------------

describe('Property 2: Hapus item saat kuantitas mencapai 0', () => {
  it('removeItem pada item dengan qty=1 menghapus item dari array', () => {
    // Feature: dcufii-cashier-app, Property 2: Hapus item saat kuantitas mencapai 0
    fc.assert(
      fc.property(
        cartStateArb,
        fc.string({ minLength: 1, maxLength: 10 }),
        (state, id) => {
          // Insert item with qty=1 into state
          const stateWithItem: CartState = {
            items: [
              ...state.items.filter((i) => i.menuItemId !== id),
              { menuItemId: id, quantity: 1, note: '' },
            ],
          };
          const nextState = cartReducer(stateWithItem, { type: 'REMOVE_ITEM', menuItemId: id });
          const found = nextState.items.find((i) => i.menuItemId === id);
          expect(found).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('setQuantity(id, 0) menghapus item dari array', () => {
    // Feature: dcufii-cashier-app, Property 2: Hapus item saat kuantitas mencapai 0
    fc.assert(
      fc.property(
        cartStateArb,
        fc.string({ minLength: 1, maxLength: 10 }),
        (state, id) => {
          // Ensure item exists in state
          const stateWithItem: CartState = {
            items: [
              ...state.items.filter((i) => i.menuItemId !== id),
              { menuItemId: id, quantity: 1, note: '' },
            ],
          };
          const nextState = cartReducer(stateWithItem, { type: 'SET_QUANTITY', menuItemId: id, qty: 0 });
          const found = nextState.items.find((i) => i.menuItemId === id);
          expect(found).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('setelah removeItem tidak ada item dengan qty <= 0 di array', () => {
    // Feature: dcufii-cashier-app, Property 2: Hapus item saat kuantitas mencapai 0
    fc.assert(
      fc.property(cartStateArb, fc.string({ minLength: 1, maxLength: 10 }), (state, id) => {
        const nextState = cartReducer(state, { type: 'REMOVE_ITEM', menuItemId: id });
        for (const item of nextState.items) {
          expect(item.quantity).toBeGreaterThanOrEqual(1);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 3: Total item keranjang konsisten dengan isi array
// Feature: dcufii-cashier-app, Property 3: Total item keranjang konsisten dengan isi array
// Validates: Requirements 1.6, 2.7
// ---------------------------------------------------------------------------

describe('Property 3: Total item keranjang konsisten dengan isi array', () => {
  it('totalItems setelah addItem selalu === sum semua quantity', () => {
    // Feature: dcufii-cashier-app, Property 3: Total item keranjang konsisten dengan isi array
    fc.assert(
      fc.property(cartStateArb, fc.string({ minLength: 1, maxLength: 10 }), (state, id) => {
        const nextState = cartReducer(state, { type: 'ADD_ITEM', menuItemId: id });
        const expected = nextState.items.reduce((s, i) => s + i.quantity, 0);
        expect(totalItems(nextState)).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it('totalItems setelah removeItem selalu === sum semua quantity', () => {
    // Feature: dcufii-cashier-app, Property 3: Total item keranjang konsisten dengan isi array
    fc.assert(
      fc.property(cartStateArb, fc.string({ minLength: 1, maxLength: 10 }), (state, id) => {
        const nextState = cartReducer(state, { type: 'REMOVE_ITEM', menuItemId: id });
        const expected = nextState.items.reduce((s, i) => s + i.quantity, 0);
        expect(totalItems(nextState)).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it('totalItems untuk sembarang CartState selalu === sum semua quantity', () => {
    // Feature: dcufii-cashier-app, Property 3: Total item keranjang konsisten dengan isi array
    fc.assert(
      fc.property(cartStateArb, (state) => {
        const expected = state.items.reduce((s, i) => s + i.quantity, 0);
        expect(totalItems(state)).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4: Total harga dihitung dengan benar
// Feature: dcufii-cashier-app, Property 4: Total harga dihitung dengan benar
// Validates: Requirements 3.10
// ---------------------------------------------------------------------------

describe('Property 4: Total harga dihitung dengan benar', () => {
  it('totalPrice selalu === Σ(price × qty) untuk sembarang cart dan menu data', () => {
    // Feature: dcufii-cashier-app, Property 4: Total harga dihitung dengan benar
    fc.assert(
      fc.property(
        menuItemIdsArb.chain((ids) =>
          fc.tuple(
            // CartState: use a subset of those ids
            fc
              .array(
                fc.oneof(...ids.map((id) => cartItemArb(id))),
                { minLength: 0, maxLength: ids.length }
              )
              .map((items) => {
                const seen = new Map<string, CartItem>();
                for (const item of items) seen.set(item.menuItemId, item);
                return { items: Array.from(seen.values()) } as CartState;
              }),
            // MenuItems for all ids
            menuDataArb(ids)
          )
        ),
        ([state, menuData]) => {
          const expected = state.items.reduce((sum, cartItem) => {
            const menuItem = menuData.find((m) => m.id === cartItem.menuItemId);
            if (!menuItem) return sum;
            return sum + menuItem.price * cartItem.quantity;
          }, 0);
          expect(totalPrice(state, menuData)).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('totalPrice adalah 0 untuk keranjang kosong', () => {
    // Feature: dcufii-cashier-app, Property 4: Total harga dihitung dengan benar
    fc.assert(
      fc.property(
        menuItemIdsArb.chain((ids) => menuDataArb(ids)),
        (menuData) => {
          const emptyState: CartState = { items: [] };
          expect(totalPrice(emptyState, menuData)).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7: Reset keranjang saat "Pesan Lagi"
// Feature: dcufii-cashier-app, Property 7: Reset keranjang saat "Pesan Lagi"
// Validates: Requirements 5.4
// ---------------------------------------------------------------------------

describe('Property 7: Reset keranjang saat "Pesan Lagi"', () => {
  it('setelah clearCart, totalItems selalu === 0 untuk sembarang state awal', () => {
    // Feature: dcufii-cashier-app, Property 7: Reset keranjang saat "Pesan Lagi"
    fc.assert(
      fc.property(cartStateArb, (state) => {
        const nextState = cartReducer(state, { type: 'CLEAR_CART' });
        expect(totalItems(nextState)).toBe(0);
        expect(nextState.items).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('setelah clearCart, items array selalu kosong', () => {
    // Feature: dcufii-cashier-app, Property 7: Reset keranjang saat "Pesan Lagi"
    fc.assert(
      fc.property(cartStateArb, (state) => {
        const nextState = cartReducer(state, { type: 'CLEAR_CART' });
        expect(nextState.items).toEqual([]);
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6: Input catatan tidak melebihi batas karakter
// Feature: dcufii-cashier-app, Property 6: Input catatan tidak melebihi batas karakter
// Validates: Requirements 3.7
// ---------------------------------------------------------------------------

describe('Property 6: Input catatan tidak melebihi batas karakter', () => {
  it('setNote tidak pernah menyimpan catatan dengan panjang > 200 karakter', () => {
    // Feature: dcufii-cashier-app, Property 6: Input catatan tidak melebihi batas karakter
    fc.assert(
      fc.property(
        cartStateArb,
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 0, maxLength: 400 }), // panjang sembarang, termasuk > 200
        (state, id, note) => {
          // Pastikan item dengan id tersebut ada di state
          const stateWithItem: CartState = {
            items: [
              ...state.items.filter((i) => i.menuItemId !== id),
              { menuItemId: id, quantity: 1, note: '' },
            ],
          };
          const nextState = cartReducer(stateWithItem, { type: 'SET_NOTE', menuItemId: id, note });
          const item = nextState.items.find((i) => i.menuItemId === id);
          // Item harus ada dan panjang catatan tidak boleh melebihi 200 karakter
          expect(item).toBeDefined();
          expect(item!.note.length).toBeLessThanOrEqual(MAX_NOTE_LENGTH);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('setNote mempertahankan catatan ≤200 karakter tanpa perubahan', () => {
    // Feature: dcufii-cashier-app, Property 6: Input catatan tidak melebihi batas karakter
    fc.assert(
      fc.property(
        cartStateArb,
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 0, maxLength: MAX_NOTE_LENGTH }), // tepat dalam batas
        (state, id, note) => {
          const stateWithItem: CartState = {
            items: [
              ...state.items.filter((i) => i.menuItemId !== id),
              { menuItemId: id, quantity: 1, note: '' },
            ],
          };
          const nextState = cartReducer(stateWithItem, { type: 'SET_NOTE', menuItemId: id, note });
          const item = nextState.items.find((i) => i.menuItemId === id);
          expect(item).toBeDefined();
          // Catatan yang sudah dalam batas harus disimpan apa adanya
          expect(item!.note).toBe(note);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('setNote memotong catatan >200 karakter menjadi tepat 200 karakter', () => {
    // Feature: dcufii-cashier-app, Property 6: Input catatan tidak melebihi batas karakter
    fc.assert(
      fc.property(
        cartStateArb,
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.string({ minLength: MAX_NOTE_LENGTH + 1, maxLength: 400 }), // pasti > 200
        (state, id, note) => {
          const stateWithItem: CartState = {
            items: [
              ...state.items.filter((i) => i.menuItemId !== id),
              { menuItemId: id, quantity: 1, note: '' },
            ],
          };
          const nextState = cartReducer(stateWithItem, { type: 'SET_NOTE', menuItemId: id, note });
          const item = nextState.items.find((i) => i.menuItemId === id);
          expect(item).toBeDefined();
          // Catatan harus dipotong menjadi tepat 200 karakter
          expect(item!.note.length).toBe(MAX_NOTE_LENGTH);
          // Dan harus merupakan awalan dari catatan asli
          expect(item!.note).toBe(note.slice(0, MAX_NOTE_LENGTH));
        }
      ),
      { numRuns: 100 }
    );
  });
});
