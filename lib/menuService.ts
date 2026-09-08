import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { MenuItem } from '@/types';
import fallbackMenuItems from '@/data/menu';

export type NewMenuItem = Omit<MenuItem, 'id'>;

function validateMenu(menu: NewMenuItem) {
  if (!menu.name.trim() || !menu.category.trim()) throw new Error('Nama dan kategori menu wajib diisi.');
  if (!Number.isInteger(menu.price) || menu.price < 1000) throw new Error('Harga menu tidak valid.');
  if (!Number.isInteger(menu.stock) || (menu.stock ?? -1) < 0) throw new Error('Stok harus berupa angka 0 atau lebih.');
}

export async function createMenu(menu: NewMenuItem) {
  validateMenu(menu);
  if (!isFirebaseConfigured) return `local-menu-${Date.now()}`;
  const ref = await addDoc(collection(db, 'menus'), {
    ...menu,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getMenus(): Promise<MenuItem[]> {
  if (!isFirebaseConfigured) return fallbackMenuItems;

  const snapshot = await getDocs(collection(db, 'menus'));
  if (snapshot.empty) return fallbackMenuItems;

  return snapshot.docs.map((menuDoc) => {
    const data = menuDoc.data();
    return {
      id: menuDoc.id,
      name: String(data.name ?? ''),
      description: String(data.description ?? ''),
      price: Number(data.price ?? 0),
      category: String(data.category ?? 'Lainnya'),
      imageUrl: String(data.imageUrl ?? '/images/placeholder.jpg'),
      imagePublicId: typeof data.imagePublicId === 'string' ? data.imagePublicId : undefined,
      stock: Number.isInteger(data.stock) ? data.stock : 0,
    };
  });
}

export async function updateMenuStock(menuId: string, stock: number) {
  if (!Number.isInteger(stock) || stock < 0) throw new Error('Stok harus berupa angka 0 atau lebih.');
  if (!isFirebaseConfigured) return;
  await updateDoc(doc(db, 'menus', menuId), { stock, updatedAt: serverTimestamp() });
}

export async function updateMenu(menuId: string, menu: NewMenuItem) {
  validateMenu(menu);
  if (!isFirebaseConfigured) return;
  await updateDoc(doc(db, 'menus', menuId), { ...menu, updatedAt: serverTimestamp() });
}

export async function deleteMenu(menuId: string) {
  if (!isFirebaseConfigured) return;
  await deleteDoc(doc(db, 'menus', menuId));
}

export async function uploadMenuImage(file: File, menuId: string) {
  if (!file.type.startsWith('image/')) throw new Error('File harus berupa gambar.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran gambar maksimal 5 MB.');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('menuId', menuId);
  const response = await fetch('/api/admin/images', { method: 'POST', body: formData });
  const result = await response.json() as { secureUrl?: string; publicId?: string; error?: string };
  if (!response.ok || !result.secureUrl || !result.publicId) throw new Error(result.error ?? 'Gambar gagal diunggah.');
  return { imageUrl: result.secureUrl, imagePublicId: result.publicId };
}

export async function removeMenuImage(imagePublicId?: string) {
  if (!imagePublicId) return;
  const response = await fetch('/api/admin/images', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId: imagePublicId }),
  });
  if (!response.ok) {
    const result = await response.json() as { error?: string };
    throw new Error(result.error ?? 'Gambar gagal dihapus.');
  }
}