'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import OrderDetail from '@/components/OrderDetail';
import { getOrderById, updateOrderStatus } from '@/lib/orderService';
import { formatRupiah } from '@/lib/formatRupiah';
import type { Order } from '@/types';

export default function CashierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [paid, setPaid] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { if (id) void getOrderById(id).then(setOrder); }, [id]);
  const paidAmount = Number(paid) || 0;
  const change = order ? paidAmount - order.totalPrice : 0;
  async function confirmPayment() {
    if (!order || paidAmount < order.totalPrice) { setError('Nominal pembayaran masih kurang.'); return; }
    try { await updateOrderStatus(order, 'pending'); router.push('/admin/cashier'); } catch (paymentError) { setError(paymentError instanceof Error ? paymentError.message : 'Pembayaran gagal dikonfirmasi.'); }
  }
  if (!order) return <main className="mx-auto max-w-2xl px-4 py-8">Memuat detail pesanan...</main>;
  return <main className="mx-auto max-w-2xl px-4 py-8"><button onClick={() => router.back()} className="mb-4 text-sm text-brand-primary">← Kembali ke kasir</button><OrderDetail order={order} /><section className="mt-4 rounded-lg bg-white p-5 shadow-sm"><label htmlFor="paid" className="block text-sm font-semibold text-brand-primary">Uang dibayarkan</label><input id="paid" inputMode="numeric" type="number" min={order.totalPrice} value={paid} onChange={(event) => setPaid(event.target.value)} placeholder="Masukkan nominal" className="mt-2 min-h-[touch-min] w-full rounded-md border px-3 text-lg" />{paid && <p className={`mt-3 text-lg font-bold ${change >= 0 ? 'text-brand-success' : 'text-brand-error'}`}>{change >= 0 ? `Kembalian: ${formatRupiah(change)}` : `Kurang: ${formatRupiah(Math.abs(change))}`}</p>}{error && <p role="alert" className="mt-3 text-sm text-brand-error">{error}</p>}<button onClick={() => void confirmPayment()} disabled={paidAmount < order.totalPrice} className="mt-4 min-h-[touch-min] w-full rounded-md bg-brand-primary px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Konfirmasi pembayaran</button></section></main>;
}
