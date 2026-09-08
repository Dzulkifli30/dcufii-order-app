'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ErrorMessage from '@/components/ErrorMessage';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/admin');
  }, [loading, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(email.trim(), password);
      router.replace('/admin');
    } catch {
      setError('Email atau kata sandi tidak valid.');
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-brand-surface flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-brand-primary">Login Operasional</h1>
        <p className="mt-1 text-sm text-gray-500">Masuk untuk mengelola pesanan dan menu.</p>
        <label className="mt-6 block text-sm font-medium text-brand-primary" htmlFor="email">Email</label>
        <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 min-h-[touch-min] w-full rounded-md border border-gray-200 px-3" />
        <label className="mt-4 block text-sm font-medium text-brand-primary" htmlFor="password">Kata sandi</label>
        <input id="password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 min-h-[touch-min] w-full rounded-md border border-gray-200 px-3" />
        {error && <ErrorMessage message={error} />}
        <button disabled={submitting} className="mt-6 min-h-[touch-min] w-full rounded-md bg-brand-primary font-semibold text-white disabled:opacity-60">
          {submitting ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
    </main>
  );
}