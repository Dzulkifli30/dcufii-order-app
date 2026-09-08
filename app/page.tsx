'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';
import CategorySection from '@/components/CategorySection';
import CartBadge from '@/components/CartBadge';
import CartButton from '@/components/CartButton';
import { getMenus } from '@/lib/menuService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Groups menu items by their category, preserving the order categories first
 * appear in the source array.
 */
function groupByCategory(allItems: MenuItem[]): Map<string, MenuItem[]> {
  return allItems.reduce((acc, item) => {
    const existing = acc.get(item.category);
    if (existing) {
      existing.push(item);
    } else {
      acc.set(item.category, [item]);
    }
    return acc;
  }, new Map<string, MenuItem[]>());
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HalamanPemesanan() {
  const router = useRouter();
  const { items: cartItems, addItem, removeItem, totalItems } = useCart();
  const [availableMenuItems, setAvailableMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  useEffect(() => {
    let active = true;
    void getMenus()
      .then((loadedMenuItems) => {
        if (active) setAvailableMenuItems(loadedMenuItems);
      })
      .finally(() => {
        if (active) setIsLoadingMenu(false);
      });
    return () => { active = false; };
  }, []);

  // Group menu items by category — static data so this only runs once
  const categorized = useMemo(() => groupByCategory(availableMenuItems), [availableMenuItems]);

  function handleGoToConfirmation() {
    router.push('/confirmation');
  }

  return (
    <div className="relative min-h-screen bg-brand-surface">
      {/* Sticky cart badge — top-right, shows total item count */}
      <CartBadge />

      {/* Page header */}
      <header className="sticky top-0 z-40 bg-brand-primary shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="font-display text-brand-surface text-2xl font-bold tracking-wide text-center">
            d`cufii
          </h1>
        </div>
      </header>

      {/* Main content — extra bottom padding so the sticky cart bar never overlaps */}
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-32">
        {isLoadingMenu ? (
          <p className="py-12 text-center text-sm text-gray-500" role="status">Memuat menu...</p>
        ) : Array.from(categorized.entries()).map(([category, categoryMenuItems]) => (
          <CategorySection
            key={category}
            category={category}
            items={categoryMenuItems}
            cartItems={cartItems}
            onAdd={addItem}
            onRemove={removeItem}
          />
        ))}
      </main>

      {/* Sticky bottom bar — shown only when cart has at least 1 item */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-brand-surface/95 backdrop-blur-sm border-t border-brand-secondary/30 shadow-lg">
          <div className="max-w-2xl mx-auto px-4 py-3 flex justify-center">
            <CartButton
              totalItems={totalItems}
              onClick={handleGoToConfirmation}
            />
          </div>
        </div>
      )}
    </div>
  );
}
