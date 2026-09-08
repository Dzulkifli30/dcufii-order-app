import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MenuCard from '@/components/MenuCard';
import type { MenuItem } from '@/types';

// ---------------------------------------------------------------------------
// next/image mock — jsdom does not support Next.js Image; replace with plain <img>
// ---------------------------------------------------------------------------

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; sizes?: string }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    const { fill: _fill, sizes: _sizes, ...rest } = props;
    return <img {...rest} />;
  },
}));

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const mockItem: MenuItem = {
  id: 'MNU-001',
  name: 'Espresso',
  description: 'Kopi hitam pekat dengan rasa kuat.',
  price: 18000,
  category: 'Minuman',
  imageUrl: '/images/espresso.jpg',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderMenuCard(cartQuantity: number, onAdd = vi.fn(), onRemove = vi.fn()) {
  return render(
    <MenuCard
      item={mockItem}
      cartQuantity={cartQuantity}
      onAdd={onAdd}
      onRemove={onRemove}
    />
  );
}

// ---------------------------------------------------------------------------
// Tests: cartQuantity === 0 — tampilkan tombol "+" saja
// ---------------------------------------------------------------------------

describe('MenuCard — cartQuantity === 0', () => {
  it('hanya menampilkan tombol "+" saat item belum di keranjang', () => {
    renderMenuCard(0);

    // One "+" button visible
    const addButton = screen.getByRole('button', { name: /tambah espresso ke keranjang/i });
    expect(addButton).toBeTruthy();
  });

  it('tidak menampilkan tombol "−" saat cartQuantity === 0', () => {
    renderMenuCard(0);

    const removeButton = screen.queryByRole('button', { name: /kurangi espresso/i });
    expect(removeButton).toBeNull();
  });

  it('tidak menampilkan label kuantitas saat cartQuantity === 0', () => {
    renderMenuCard(0);

    // The quantity span has aria-label "Jumlah ...: N" — should not exist
    const qtyLabel = screen.queryByLabelText(/jumlah espresso/i);
    expect(qtyLabel).toBeNull();
  });

  it('memanggil onAdd saat tombol "+" ditekan', () => {
    const onAdd = vi.fn();
    renderMenuCard(0, onAdd);

    fireEvent.click(screen.getByRole('button', { name: /tambah espresso ke keranjang/i }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Tests: cartQuantity > 0 — tampilkan kontrol [−] [qty] [+]
// ---------------------------------------------------------------------------

describe('MenuCard — cartQuantity > 0', () => {
  it('menampilkan tombol "−", label kuantitas, dan tombol "+" saat cartQuantity > 0', () => {
    renderMenuCard(3);

    expect(screen.getByRole('button', { name: /kurangi espresso/i })).toBeTruthy();
    expect(screen.getByLabelText(/jumlah espresso: 3/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /tambah espresso ke keranjang/i })).toBeTruthy();
  });

  it('menampilkan nilai kuantitas yang benar di label', () => {
    renderMenuCard(5);

    const qtyEl = screen.getByLabelText(/jumlah espresso: 5/i);
    expect(qtyEl.textContent).toBe('5');
  });

  it('memanggil onAdd saat tombol "+" ditekan', () => {
    const onAdd = vi.fn();
    renderMenuCard(2, onAdd);

    fireEvent.click(screen.getByRole('button', { name: /tambah espresso ke keranjang/i }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('memanggil onRemove saat tombol "−" ditekan', () => {
    const onRemove = vi.fn();
    renderMenuCard(2, vi.fn(), onRemove);

    fireEvent.click(screen.getByRole('button', { name: /kurangi espresso/i }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Tests: cartQuantity === 99 — tombol "+" dinonaktifkan
// ---------------------------------------------------------------------------

describe('MenuCard — cartQuantity === 99 (batas maksimum)', () => {
  it('tombol "+" dinonaktifkan saat cartQuantity === 99', () => {
    renderMenuCard(99);

    const addButton = screen.getByRole('button', { name: /tambah espresso ke keranjang/i });
    expect((addButton as HTMLButtonElement).disabled).toBe(true);
  });

  it('tombol "+" memiliki aria-disabled="true" saat cartQuantity === 99', () => {
    renderMenuCard(99);

    const addButton = screen.getByRole('button', { name: /tambah espresso ke keranjang/i });
    expect(addButton.getAttribute('aria-disabled')).toBe('true');
  });

  it('tombol "−" tetap aktif saat cartQuantity === 99', () => {
    renderMenuCard(99);

    const removeButton = screen.getByRole('button', { name: /kurangi espresso/i });
    expect((removeButton as HTMLButtonElement).disabled).toBe(false);
  });

  it('tombol "+" tidak memanggil onAdd saat disabled dan diklik', () => {
    const onAdd = vi.fn();
    renderMenuCard(99, onAdd);

    fireEvent.click(screen.getByRole('button', { name: /tambah espresso ke keranjang/i }));
    expect(onAdd).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Tests: gambar gagal dimuat — placeholder ditampilkan
// ---------------------------------------------------------------------------

describe('MenuCard — placeholder saat gambar gagal dimuat', () => {
  it('menampilkan placeholder saat onError dipicu pada gambar', () => {
    renderMenuCard(0);

    // Trigger the onError event on the img element
    const img = screen.getByAltText('Espresso');
    fireEvent.error(img);

    // After error, the img should be replaced by the placeholder div with aria-hidden
    // The placeholder contains the ☕ emoji span
    const placeholder = document.querySelector('[aria-hidden="true"]');
    expect(placeholder).toBeTruthy();
  });

  it('tidak menampilkan elemen <img> setelah gambar gagal dimuat', () => {
    renderMenuCard(0);

    const img = screen.getByAltText('Espresso');
    fireEvent.error(img);

    // The original img should no longer be in the DOM
    const imgAfterError = screen.queryByAltText('Espresso');
    expect(imgAfterError).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Tests: informasi item ditampilkan dengan benar
// ---------------------------------------------------------------------------

describe('MenuCard — konten item', () => {
  it('menampilkan nama item', () => {
    renderMenuCard(0);

    expect(screen.getByText('Espresso')).toBeTruthy();
  });

  it('menampilkan deskripsi item', () => {
    renderMenuCard(0);

    expect(screen.getByText('Kopi hitam pekat dengan rasa kuat.')).toBeTruthy();
  });

  it('menampilkan harga dalam format Rupiah', () => {
    renderMenuCard(0);

    expect(screen.getByText('Rp 18.000')).toBeTruthy();
  });
});
