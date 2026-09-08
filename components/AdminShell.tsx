'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminBottomNav from '@/components/AdminBottomNav';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const isLogin = pathname === '/admin/login';
  const isOperational = pathname.startsWith('/admin/cashier') || pathname.startsWith('/admin/pending');

  useEffect(() => {
    if (!loading && !user && !isLogin) router.replace('/admin/login');
  }, [isLogin, loading, router, user]);

  if (isLogin) return children;
  if (loading || !user) return <main className="p-6">Memuat...</main>;

  return (
    <div className="min-h-screen bg-brand-surface pb-20">
      <header className="sticky top-0 z-30 bg-brand-primary text-white shadow-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <button onClick={() => router.push('/admin')} className="font-display text-xl font-bold">d`cufii Admin</button>
          <button onClick={() => void logout()} className="min-h-[touch-min] rounded-md border border-white/40 px-3 text-sm">Keluar</button>
        </div>
      </header>
      {children}
      {!isOperational && <AdminBottomNav />}
    </div>
  );
}
