'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import OrderDetail from '@/components/OrderDetail';
import { getOrderById, updateOrderStatus } from '@/lib/orderService';
import type { Order } from '@/types';

export default function PendingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { if (id) void getOrderById(id).then(setOrder); }, [id]);
  async function completeOrder() { if (!order) return; try { await updateOrderStatus(order, 'selesai'); router.push('/admin/pending'); } catch (completeError) { setError(completeError instanceof Error ? completeError.message : 'Pesanan gagal diselesaikan.'); } }
  if (!order) return <main className="mx-auto max-w-2xl px-4 py-8">Memuat detail pesanan...</main>;
  return <main className="mx-auto max-w-2xl px-4 py-8"><button onClick={() => router.back()} className="mb-4 text-sm text-brand-primary">← Kembali ke antrean</button><OrderDetail order={order} />{error && <p role="alert" className="mt-3 text-sm text-brand-error">{error}</p>}<button onClick={() => void completeOrder()} className="mt-4 min-h-[touch-min] w-full rounded-md bg-brand-primary px-4 font-semibold text-white">Tandai pesanan selesai</button></main>;
}
