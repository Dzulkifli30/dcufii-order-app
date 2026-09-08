'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { menuItems as fallbackMenuItems } from '@/data/menu';
import ConfirmationItem from '@/components/ConfirmationItem';
import PaymentMethodSelector from '@/components/PaymentMethodSelector';
import ErrorMessage from '@/components/ErrorMessage';
import type { PaymentMethod, ValidationErrors } from '@/types';
import { validateForm } from '@/lib/validateConfirmationForm';
import { formatRupiah } from '@/lib/formatRupiah';
import { saveOrder } from '@/lib/orderService';
import { getMenus } from '@/lib/menuService';
// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HalamanKonfirmasi() {
  const router = useRouter();
  const { items: cartItems, setQuantity, setNote, totalPrice } = useCart();

  // Local form state
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuItems, setMenuItems] = useState(fallbackMenuItems);

  useEffect(() => {
    let active = true;
    void getMenus().then((loadedMenuItems) => {
      if (active) setMenuItems(loadedMenuItems);
    });
    return () => { active = false; };
  }, []);
  
  const total = totalPrice(menuItems);
  const isCartEmpty = cartItems.length === 0;

  // Build a lookup map: menuItemId → MenuItem for fast access
  const menuMap = new Map(menuItems.map((m) => [m.id, m]));

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  function handleTableNumberChange(raw: string) {
    if (raw === '') {
      setTableNumber('');
      return;
    }
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      setTableNumber(parsed);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // Proteksi tambahan jika user memaksa klik via enter berkali-kali
    if (isSubmitting) return;

    const validationErrors = validateForm(customerName, tableNumber, paymentMethod);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    
    // Set status loading menjadi true
    setIsSubmitting(true);
    
    try {
      const orderState = { customerName, tableNumber, paymentMethod };
      const total = totalPrice(menuItems);
      
      // Simpan data ke Firestore
      const orderId = await saveOrder(orderState, cartItems, menuItems, total);
      
      // Lanjut navigasi jika berhasil. Metode tunai diteruskan agar halaman
      // payment tetap menunggu konfirmasi kasir.
      router.push(
        paymentMethod === 'CASH'
          ? `/payment?method=CASH&orderId=${orderId}`
          : '/payment'
      );
    } catch (err) {
      setErrors({ paymentMethod: 'Gagal memproses pesanan. Coba lagi.' });
      // Matikan loading agar user bisa mencoba submit lagi
      setIsSubmitting(false);
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-brand-surface">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-brand-primary shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            aria-label="Kembali ke halaman pemesanan"
            className="flex min-h-[touch-min] min-w-[touch-min] items-center justify-center rounded-full text-brand-surface hover:bg-white/10 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="font-display text-brand-surface text-xl font-bold tracking-wide">
            Konfirmasi Pesanan
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 pb-32">
        <form onSubmit={handleSubmit} noValidate>
          {/* ----------------------------------------------------------------
              Section 1 — Cart items
          ---------------------------------------------------------------- */}
          <section aria-labelledby="section-items-heading" className="mb-6">
            <h2
              id="section-items-heading"
              className="font-display text-brand-primary text-lg font-semibold mb-3"
            >
              Pesanan Kamu
            </h2>

            {isCartEmpty ? (
              <div
                role="status"
                className="rounded-lg bg-white p-6 text-center shadow-sm"
              >
                <p className="font-body text-gray-500">
                  Keranjang kamu kosong. Tambahkan menu terlebih dahulu.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {cartItems.map((cartItem) => {
                  const menuItem = menuMap.get(cartItem.menuItemId);
                  if (!menuItem) return null;
                  return (
                    <li key={cartItem.menuItemId}>
                      <ConfirmationItem
                        item={menuItem}
                        cartItem={cartItem}
                        onQuantityChange={(qty) =>
                          setQuantity(cartItem.menuItemId, qty)
                        }
                        onNoteChange={(note) =>
                          setNote(cartItem.menuItemId, note)
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* ----------------------------------------------------------------
              Section 2 — Customer details
          ---------------------------------------------------------------- */}
          <section aria-labelledby="section-details-heading" className="mb-6">
            <h2
              id="section-details-heading"
              className="font-display text-brand-primary text-lg font-semibold mb-3"
            >
              Data Pelanggan
            </h2>

            <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm">
              {/* Customer name */}
              <div>
                <label
                  htmlFor="customerName"
                  className="font-body block text-sm font-medium text-brand-primary mb-1"
                >
                  Nama Pelanggan <span aria-hidden="true">*</span>
                </label>
                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  maxLength={100}
                  placeholder="Masukkan nama kamu"
                  autoComplete="name"
                  aria-required="true"
                  aria-describedby={
                    errors.customerName ? 'customerName-error' : undefined
                  }
                  className={[
                    'font-body min-h-[touch-min] w-full rounded-md border px-3 py-2 text-sm text-brand-primary',
                    'placeholder:text-gray-400 bg-brand-surface',
                    'focus:outline-none focus:ring-2 focus:ring-brand-secondary',
                    errors.customerName
                      ? 'border-brand-error focus:ring-brand-error'
                      : 'border-gray-200 focus:border-brand-secondary',
                  ].join(' ')}
                />
                {errors.customerName && (
                  <span id="customerName-error">
                    <ErrorMessage message={errors.customerName} />
                  </span>
                )}
              </div>

              {/* Table number */}
              <div>
                <label
                  htmlFor="tableNumber"
                  className="font-body block text-sm font-medium text-brand-primary mb-1"
                >
                  Nomor Meja <span aria-hidden="true">*</span>
                </label>
                <input
                  id="tableNumber"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={999}
                  value={tableNumber}
                  onChange={(e) => handleTableNumberChange(e.target.value)}
                  placeholder="Contoh: 5"
                  aria-required="true"
                  aria-describedby={
                    errors.tableNumber ? 'tableNumber-error' : undefined
                  }
                  className={[
                    'font-body min-h-[touch-min] w-full rounded-md border px-3 py-2 text-sm text-brand-primary',
                    'placeholder:text-gray-400 bg-brand-surface',
                    'focus:outline-none focus:ring-2 focus:ring-brand-secondary',
                    errors.tableNumber
                      ? 'border-brand-error focus:ring-brand-error'
                      : 'border-gray-200 focus:border-brand-secondary',
                  ].join(' ')}
                />
                {errors.tableNumber && (
                  <span id="tableNumber-error">
                    <ErrorMessage message={errors.tableNumber} />
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------------
              Section 3 — Payment method
          ---------------------------------------------------------------- */}
          <section aria-labelledby="section-payment-heading" className="mb-6">
            <h2
              id="section-payment-heading"
              className="font-display text-brand-primary text-lg font-semibold mb-3"
            >
              Metode Pembayaran <span aria-hidden="true">*</span>
            </h2>

            <div className="rounded-lg bg-white p-4 shadow-sm">
              <PaymentMethodSelector
                selected={paymentMethod}
                onChange={setPaymentMethod}
              />
              {errors.paymentMethod && (
                <div className="mt-2">
                  <ErrorMessage message={errors.paymentMethod} />
                </div>
              )}
            </div>
          </section>

          {/* ----------------------------------------------------------------
              Section 4 — Order summary + submit
          ---------------------------------------------------------------- */}
          <section aria-labelledby="section-summary-heading" className="mb-6">
            <h2
              id="section-summary-heading"
              className="font-display text-brand-primary text-lg font-semibold mb-3"
            >
              Ringkasan Pesanan
            </h2>

            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-gray-600">
                  Total Pembayaran
                </span>
                <span className="font-body text-lg font-bold text-brand-primary">
                  {formatRupiah(total)}
                </span>
              </div>
            </div>
          </section>

          {/* Sticky submit bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-brand-surface/95 backdrop-blur-sm border-t border-brand-secondary/30 shadow-lg">
            <div className="max-w-2xl mx-auto px-4 py-3">
              <button
                type="submit"
                disabled={isCartEmpty || isSubmitting}
                className={[
                  'font-body w-full rounded-xl px-6 py-3 text-base font-semibold transition-colors',
                  'min-h-[touch-min] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2',
                  isCartEmpty
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-primary text-brand-surface hover:bg-brand-primary/90 active:bg-brand-primary/80',
                ].join(' ')}
              >
                {isCartEmpty ? 'Keranjang Kosong' : 'Konfirmasi Pesanan'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
