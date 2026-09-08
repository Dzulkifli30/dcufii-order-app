'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { filterOrdersByStatus, getOrders } from '@/lib/orderService';
import { formatRupiah } from '@/lib/formatRupiah';
import type { Order } from '@/types';

export default function CashierPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { void getOrders().then((items) => setOrders(filterOrdersByStatus(items, 'menunggu pembayaran'))).finally(() => setLoading(false)); }, []);
  const pendingPayment = orders.filter((order) => order.paymentMethod === 'CASH');
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/admin" className="mb-5 inline-flex min-h-[touch-min] items-center text-sm font-semibold text-brand-primary">
        ← Kembali ke halaman utama
      </Link>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">Cashier</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-brand-primary">Pembayaran masuk</h1>
      {loading ? <p className="mt-6">Memuat pesanan...</p> : pendingPayment.length === 0 ? <p className="mt-6 rounded-lg bg-white p-6">Tidak ada pesanan yang menunggu pembayaran.</p> : (
        <ul className="mt-6 grid gap-3">
          {pendingPayment.map((order) => <li key={order.id}><Link href={`/admin/cashier/${order.id}`} className="flex items-center justify-between rounded-lg bg-white p-5 shadow-sm hover:ring-2 hover:ring-brand-secondary"><span><strong className="block text-brand-primary">{order.customerName} · Meja {order.tableNumber}</strong><span className="text-sm text-gray-500">{order.items.length} item · Tunai</span></span><strong className="text-brand-primary">{formatRupiah(order.totalPrice)}</strong></Link></li>)}
        </ul>
      )}
    </main>
  );
}
