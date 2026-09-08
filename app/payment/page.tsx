'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/Spinner';
import ErrorMessage from '@/components/ErrorMessage';
import { getOrderById } from '@/lib/orderService';

export default function HalamanPembayaran() {
  const router = useRouter();
  const [isCashPayment, setIsCashPayment] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [redirectError, setRedirectError] = useState<string | null>(null);
  const hasRedirected = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const method = params.get('method');
    setIsCashPayment(method === 'CASH');
    setOrderId(params.get('orderId'));
  }, []);

  // ------------------------------------------------------------------
  // Block browser back button (Requirement 4.5)
  // Push a new state on mount so the browser has a "forward" target,
  // then intercept every popstate (back/forward press) and push again
  // to keep the user on this page.
  // ------------------------------------------------------------------
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);

    function handlePopState() {
      window.history.pushState(null, '', window.location.href);
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // ------------------------------------------------------------------
  // Pembayaran tunai harus tetap menunggu konfirmasi kasir.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isCashPayment) return;

    const timer = setTimeout(async () => {
      if (hasRedirected.current) return;
      hasRedirected.current = true;

      try {
        await router.push('/done');
      } catch {
        setRedirectError(
          'Pengalihan ke halaman selesai gagal. Silakan hubungi kasir.'
        );
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isCashPayment, router]);

  useEffect(() => {
    if (!isCashPayment || !orderId || hasRedirected.current) return;

    let active = true;
    const checkPaymentStatus = async () => {
      try {
        const order = await getOrderById(orderId);
        if (!active || !order || order.status === 'menunggu pembayaran') return;

        hasRedirected.current = true;
        await router.push('/done');
      } catch {
        if (active) {
          setRedirectError(
            'Status pembayaran belum dapat diperiksa. Silakan tunggu atau hubungi kasir.'
          );
        }
      }
    };

    void checkPaymentStatus();
    const interval = window.setInterval(() => void checkPaymentStatus(), 2000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [isCashPayment, orderId, router]);

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col items-center justify-center gap-6 px-4">
      {/* Spinner — animates continuously (Requirement 4.2) */}
      <Spinner size="lg" />

      {/* Status pembayaran — tunai menunggu konfirmasi kasir */}
      <p className="font-body text-brand-primary text-lg font-medium text-center">
        {isCashPayment
          ? 'Menunggu pembayaran tunai dikonfirmasi kasir'
          : 'Sedang mengonfirmasi pembayaran'}
      </p>

      {/* Error message shown only when redirect fails (Requirement 4.4) */}
      {redirectError && <ErrorMessage message={redirectError} />}
    </div>
  );
}
