'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { MenuItem } from '@/types';
import { formatRupiah } from '@/lib/formatRupiah';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MenuCardProps {
  item: MenuItem;
  cartQuantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MenuCard({ item, cartQuantity, onAdd, onRemove }: MenuCardProps) {
  const [imgError, setImgError] = useState(false);

  const isMaxQuantity = cartQuantity >= 99 || (item.stock !== undefined && cartQuantity >= item.stock);
  const isSoldOut = item.stock !== undefined && item.stock <= 5;

  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden border border-brand-surface">
      {/* Image / Placeholder */}
      <div className="relative w-full h-40">
        {imgError ? (
          <div
            className="w-full h-full bg-brand-surface flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-brand-primary text-4xl">☕</span>
          </div>
        ) : (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 gap-1">
        <h3 className="font-display text-brand-primary font-semibold text-base leading-snug">
          {item.name}
        </h3>
        <p className="font-body text-gray-500 text-sm leading-snug line-clamp-2 flex-1">
          {item.description}
        </p>
        <p className="font-body text-brand-primary font-bold text-sm mt-1">
          {formatRupiah(item.price)}
        </p>
      </div>

      {/* Cart Controls */}
      <div className="px-3 pb-3">
        {isSoldOut ? (
          <button
            type="button"
            disabled
            aria-label={`${item.name} habis`}
            className="w-full min-h-[touch-min] rounded-xl bg-gray-200 text-gray-500 font-body font-semibold cursor-not-allowed"
          >
            Habis
          </button>
        ) : cartQuantity === 0 ? (
          /* Show "+" button only when item not in cart */
          <button
            onClick={onAdd}
            aria-label={`Tambah ${item.name} ke keranjang`}
            className="
              w-full min-h-[touch-min] flex items-center justify-center
              bg-brand-primary text-white rounded-xl
              font-body font-normal text-lg
              active:opacity-80 transition-opacity
            "
          >
            Tambahkan
          </button>
        ) : (
          /* Show [−] [qty] [+] controls when item is in cart */
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={onRemove}
              aria-label={`Kurangi ${item.name} dari keranjang`}
              className="
                min-h-[touch-min] min-w-[touch-min] px-10 flex items-center justify-center
                bg-brand-surface border border-brand-secondary text-brand-primary rounded-xl
                font-body font-bold text-xl
                active:opacity-70 transition-opacity
              "
            >
              −
            </button>

            <span
              className="font-body font-semibold text-brand-primary text-base min-w-[2rem] text-center"
              aria-live="polite"
              aria-label={`Jumlah ${item.name}: ${cartQuantity}`}
            >
              {cartQuantity}
            </span>

            <button
              onClick={onAdd}
              disabled={isMaxQuantity}
              aria-label={`Tambah ${item.name} ke keranjang`}
              aria-disabled={isMaxQuantity}
              className={`
                min-h-[touch-min] min-w-[touch-min] px-10 flex items-center justify-center
                rounded-xl font-body font-bold text-xl
                transition-opacity
                ${
                  isMaxQuantity
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-primary text-white active:opacity-70'
                }
              `}
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
