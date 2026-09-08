'use client';

import Link from 'next/link';

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">Operational desk</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-brand-primary">Selamat datang kembali</h1>
        <p className="mt-2 text-gray-500">Pilih alur kerja yang ingin ditangani hari ini.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/cashier" className="group rounded-xl bg-brand-primary p-6 text-white shadow-sm transition-transform hover:-translate-y-1">
          <span className="text-3xl" aria-hidden="true">₽</span>
          <h2 className="mt-6 font-display text-2xl font-semibold">Kasir</h2>
          <p className="mt-2 text-sm text-white/75">Terima pembayaran dan konfirmasi pesanan tunai.</p>
          <span className="mt-6 inline-block text-sm font-semibold">Buka kasir →</span>
        </Link>
        <Link href="/admin/pending" className="group rounded-xl border border-brand-secondary bg-white p-6 text-brand-primary shadow-sm transition-transform hover:-translate-y-1">
          <span className="text-3xl" aria-hidden="true">◷</span>
          <h2 className="mt-6 font-display text-2xl font-semibold">Pesanan Pending</h2>
          <p className="mt-2 text-sm text-gray-500">Lihat pesanan yang sedang dikerjakan oleh tim.</p>
          <span className="mt-6 inline-block text-sm font-semibold">Buka antrean →</span>
        </Link>
      </div>
    </main>
  );
}