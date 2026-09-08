'use client';

import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { logout } = useAuth();
  return <main className="mx-auto max-w-2xl px-4 py-8"><div className="rounded-xl bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-surface text-4xl text-brand-primary" aria-hidden="true">●</div><h1 className="mt-5 font-display text-2xl font-bold text-brand-primary">Admin d`cufii</h1><p className="mt-1 text-sm text-gray-500">Administrator</p><button onClick={() => void logout()} className="mt-8 min-h-[touch-min] w-full rounded-md bg-brand-primary px-4 font-semibold text-white">Keluar dari akun</button></div></main>;
}
