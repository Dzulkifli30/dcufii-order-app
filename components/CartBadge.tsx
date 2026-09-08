'use client';

import { useCart } from '@/context/CartContext';

/**
 * Sticky floating badge that displays the total number of items in the cart.
 * Reads cart state directly via useCart().
 * Hidden when the cart is empty.
 */
export default function CartBadge() {
  const { totalItems } = useCart();

  if (totalItems === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex items-center justify-center min-h-[touch-min] min-w-[touch-min] rounded-full bg-brand-primary text-brand-surface font-body font-semibold text-sm shadow-lg pointer-events-none"
      aria-label={`${totalItems} item di keranjang`}
      aria-live="polite"
    >
      <span className="px-3 py-1">{totalItems}</span>
    </div>
  );
}
