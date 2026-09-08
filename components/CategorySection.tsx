import React from 'react';
import type { MenuItem, CartItem } from '@/types';
import MenuCard from './MenuCard';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CategorySectionProps {
  category: string;
  items: MenuItem[];
  cartItems: CartItem[];
  onAdd: (menuItemId: string) => void;
  onRemove: (menuItemId: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CategorySection({
  category,
  items,
  cartItems,
  onAdd,
  onRemove,
}: CategorySectionProps) {
  /**
   * Look up how many of this item are currently in the cart.
   * Returns 0 if the item isn't in the cart yet.
   */
  function getCartQuantity(menuItemId: string): number {
    return cartItems.find((ci) => ci.menuItemId === menuItemId)?.quantity ?? 0;
  }

  return (
    <section aria-labelledby={`category-heading-${category}`} className="mb-8">
      {/* Category heading */}
      <h2
        id={`category-heading-${category}`}
        className="font-display text-brand-primary font-bold text-xl mb-4 px-1"
      >
        {category}
      </h2>

      {/* Responsive grid — 1 column on mobile, 2 columns on tablet+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            cartQuantity={getCartQuantity(item.id)}
            onAdd={() => onAdd(item.id)}
            onRemove={() => onRemove(item.id)}
          />
        ))}
      </div>
    </section>
  );
}
