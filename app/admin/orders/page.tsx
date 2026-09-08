'use client';

import { useEffect, useState } from 'react';
import { filterOrdersByStatus, getOrders } from '@/lib/orderService';
import { formatRupiah } from '@/lib/formatRupiah';
import type { Order } from '@/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { void getOrders().then((items) => setOrders(filterOrdersByStatus(items, 'selesai'))).finally(() => setLoading(false)); }, []);
  return <main className="mx-auto max-w-4xl px-4 py-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">History</p><h1 className="mt-2 font-display text-3xl font-bold text-brand-primary">Riwayat pesanan</h1>{loading ? <p className="mt-6">Memuat riwayat...</p> : orders.length === 0 ? <p className="mt-6 rounded-lg bg-white p-6">Belum ada pesanan selesai.</p> : <ul className="mt-6 grid gap-3">{orders.map((order) => <li key={order.id} className="flex items-center justify-between rounded-lg bg-white p-5 shadow-sm"><span><strong className="block text-brand-primary">{order.customerName} · Meja {order.tableNumber}</strong><span className="text-sm text-gray-500">{order.items.length} item · Selesai</span></span><strong className="text-brand-primary">{formatRupiah(order.totalPrice)}</strong></li>)}</ul>}</main>;
}
