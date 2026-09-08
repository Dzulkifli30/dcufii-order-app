'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { createMenu, deleteMenu, getMenus, removeMenuImage, updateMenu, uploadMenuImage, type NewMenuItem } from '@/lib/menuService';
import type { MenuItem } from '@/types';

const emptyForm = { name: '', category: 'Minuman', description: '', price: '', stock: '' };

export default function MenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  async function loadMenus() { setMenus(await getMenus()); }
  useEffect(() => { void loadMenus(); }, []);
  function beginEdit(menu: MenuItem) { setEditing(menu); setForm({ name: menu.name, category: menu.category, description: menu.description, price: String(menu.price), stock: String(menu.stock ?? 0) }); setMessage(''); }
  function reset() { setEditing(null); setForm(emptyForm); setFile(null); if (fileRef.current) fileRef.current.value = ''; }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setMessage('');
    const values: NewMenuItem = { name: form.name, category: form.category, description: form.description, imageUrl: editing?.imageUrl ?? '/images/placeholder.jpg', price: Number(form.price), stock: Number(form.stock) };
    try {
      const menuId = editing ? editing.id : await createMenu(values);
      if (file) {
        const uploadedImage = await uploadMenuImage(file, menuId);
        values.imageUrl = uploadedImage.imageUrl;
        values.imagePublicId = uploadedImage.imagePublicId;
      }
      if (editing) await updateMenu(editing.id, values); else if (file) await updateMenu(menuId, values);
      if (editing && file && editing.imagePublicId) await removeMenuImage(editing.imagePublicId);
      setMessage(editing ? 'Menu berhasil diubah.' : 'Menu berhasil ditambahkan.'); reset(); await loadMenus();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Menu gagal disimpan.'); }
  }
  async function remove(menu: MenuItem) { if (!window.confirm(`Hapus ${menu.name}?`)) return; try { await deleteMenu(menu.id); await removeMenuImage(menu.imagePublicId); setMessage('Menu berhasil dihapus.'); await loadMenus(); } catch (error) { setMessage(error instanceof Error ? error.message : 'Menu gagal dihapus.'); } }
  return <main className="mx-auto max-w-4xl px-4 py-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">Catalog</p><h1 className="mt-2 font-display text-3xl font-bold text-brand-primary">Daftar menu</h1><form onSubmit={(event) => void submit(event)} className="mt-6 grid gap-3 rounded-lg bg-white p-5 shadow-sm md:grid-cols-2"><h2 className="md:col-span-2 font-display text-xl font-semibold text-brand-primary">{editing ? 'Ubah menu' : 'Tambah menu'}</h2><input required placeholder="Nama menu" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="min-h-[touch-min] rounded-md border px-3" /><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="min-h-[touch-min] rounded-md border px-3"><option>Minuman</option><option>Makanan</option><option>Snack</option></select><textarea required placeholder="Deskripsi" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="min-h-[touch-min] rounded-md border px-3 md:col-span-2" /><input required type="number" min="1000" placeholder="Harga" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="min-h-[touch-min] rounded-md border px-3" /><input required type="number" min="0" placeholder="Stok" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} className="min-h-[touch-min] rounded-md border px-3" /><label className="text-sm text-gray-600 md:col-span-2">Gambar menu<input ref={fileRef} type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm" /></label><div className="flex gap-2 md:col-span-2"><button className="min-h-[touch-min] rounded-md bg-brand-primary px-4 text-white">{editing ? 'Simpan perubahan' : 'Tambah menu'}</button>{editing && <button type="button" onClick={reset} className="min-h-[touch-min] rounded-md border border-brand-secondary px-4 text-brand-primary">Batal</button>}</div>{message && <p role="status" className="md:col-span-2 text-sm text-brand-primary">{message}</p>}</form><ul className="mt-6 grid gap-3">{menus.map((menu) => <li key={menu.id} className="flex flex-wrap items-center gap-4 rounded-lg bg-white p-4 shadow-sm"><div className="relative h-16 w-16 overflow-hidden rounded-md bg-brand-surface">{menu.imageUrl && <Image src={menu.imageUrl} alt="" fill className="object-cover" sizes="64px" />}</div><div className="min-w-0 flex-1"><strong className="block text-brand-primary">{menu.name}</strong><span className="text-sm text-gray-500">{menu.category} · stok {menu.stock ?? 0}</span></div><button onClick={() => beginEdit(menu)} className="min-h-[touch-min] rounded-md border border-brand-secondary px-3 text-sm text-brand-primary">Ubah</button><button onClick={() => void remove(menu)} className="min-h-[touch-min] rounded-md border border-brand-error px-3 text-sm text-brand-error">Hapus</button></li>)}</ul></main>;
}
