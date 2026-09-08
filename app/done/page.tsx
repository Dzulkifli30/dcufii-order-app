'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import ErrorMessage from '@/components/ErrorMessage';

export default function HalamanSelesai() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [navError, setNavError] = useState<string | null>(null);

  // ------------------------------------------------------------------
  // Handler tombol "Pesan Lagi" (Requirements 5.3, 5.4, 5.5)
  // Reset keranjang terlebih dahulu, lalu navigasi ke halaman pemesanan.
  // Jika navigasi gagal, tampilkan ErrorMessage dan biarkan tombol tetap aktif.
  // ------------------------------------------------------------------
  async function handlePesanLagi() {
    setNavError(null);
    clearCart();

    try {
      router.push('/');
    } catch {
      setNavError(
        'Navigasi ke halaman pemesanan gagal. Silakan coba lagi.'
      );
    }
  }

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col items-center justify-center gap-6 px-4">
      {/* Teks konfirmasi — rata tengah (Requirement 5.1) */}
      <p className="font-body text-brand-primary text-xl font-semibold text-center">
        Terima kasih atas pesanannya, mohon ditunggu
      </p>

      {/* Tombol "Pesan Lagi" — rata tengah, min touch target 44×44px (Requirement 5.2) */}
      <button
        type="button"
        onClick={handlePesanLagi}
        className="
          min-h-[touch-min] min-w-[touch-min]
          px-8 py-3
          bg-brand-primary text-white
          font-body font-semibold rounded-lg
          hover:opacity-90 active:opacity-80
          transition-opacity
        "
      >
        Pesan Lagi
      </button>

      {/* Pesan error jika navigasi gagal — tombol tetap aktif (Requirement 5.5) */}
      {navError && <ErrorMessage message={navError} />}
    </div>
  );
}
