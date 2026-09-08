import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmationItem from '@/components/ConfirmationItem';
import type { MenuItem, CartItem } from '@/types';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const mockItem: MenuItem = {
  id: 'MNU-001',
  name: 'Espresso',
  description: 'Kopi espresso murni',
  price: 18000,
  category: 'Minuman',
  imageUrl: '/images/espresso.jpg',
};

function makeCartItem(quantity: number, note = ''): CartItem {
  return { menuItemId: 'MNU-001', quantity, note };
}

// ---------------------------------------------------------------------------
// Perubahan kuantitas
// ---------------------------------------------------------------------------

describe('ConfirmationItem — perubahan kuantitas', () => {
  it('tombol "+" memanggil onQuantityChange dengan qty+1', () => {
    const onQuantityChange = vi.fn();
    render(
      <ConfirmationItem
        item={mockItem}
        cartItem={makeCartItem(2)}
        onQuantityChange={onQuantityChange}
        onNoteChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText('Tambah kuantitas'));

    expect(onQuantityChange).toHaveBeenCalledOnce();
    expect(onQuantityChange).toHaveBeenCalledWith(3);
  });

  it('tombol "−" memanggil onQuantityChange dengan qty-1 saat qty > 1', () => {
    const onQuantityChange = vi.fn();
    render(
      <ConfirmationItem
        item={mockItem}
        cartItem={makeCartItem(3)}
        onQuantityChange={onQuantityChange}
        onNoteChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText('Kurangi kuantitas'));

    expect(onQuantityChange).toHaveBeenCalledOnce();
    expect(onQuantityChange).toHaveBeenCalledWith(2);
  });

  it('tombol "−" saat qty=1 memanggil onQuantityChange(0)', () => {
    const onQuantityChange = vi.fn();
    render(
      <ConfirmationItem
        item={mockItem}
        cartItem={makeCartItem(1)}
        onQuantityChange={onQuantityChange}
        onNoteChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText('Kurangi kuantitas'));

    expect(onQuantityChange).toHaveBeenCalledOnce();
    expect(onQuantityChange).toHaveBeenCalledWith(0);
  });

  it('tombol "+" disabled dan tidak memanggil onQuantityChange saat qty=99', () => {
    const onQuantityChange = vi.fn();
    render(
      <ConfirmationItem
        item={mockItem}
        cartItem={makeCartItem(99)}
        onQuantityChange={onQuantityChange}
        onNoteChange={vi.fn()}
      />
    );

    const addButton = screen.getByLabelText('Tambah kuantitas');
    expect((addButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(addButton);
    expect(onQuantityChange).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Input catatan
// ---------------------------------------------------------------------------

describe('ConfirmationItem — input catatan', () => {
  it('perubahan textarea memanggil onNoteChange dengan nilai baru', () => {
    const onNoteChange = vi.fn();
    render(
      <ConfirmationItem
        item={mockItem}
        cartItem={makeCartItem(1)}
        onQuantityChange={vi.fn()}
        onNoteChange={onNoteChange}
      />
    );

    fireEvent.change(screen.getByLabelText(`Catatan untuk ${mockItem.name}`), {
      target: { value: 'Tanpa gula' },
    });

    expect(onNoteChange).toHaveBeenCalledOnce();
    expect(onNoteChange).toHaveBeenCalledWith('Tanpa gula');
  });

  it('textarea menampilkan nilai catatan yang diteruskan sebagai prop', () => {
    render(
      <ConfirmationItem
        item={mockItem}
        cartItem={makeCartItem(1, 'Extra shot')}
        onQuantityChange={vi.fn()}
        onNoteChange={vi.fn()}
      />
    );

    const textarea = screen.getByLabelText(
      `Catatan untuk ${mockItem.name}`
    ) as HTMLTextAreaElement;

    expect(textarea.value).toBe('Extra shot');
  });

  it('textarea memiliki maxLength 200', () => {
    render(
      <ConfirmationItem
        item={mockItem}
        cartItem={makeCartItem(1)}
        onQuantityChange={vi.fn()}
        onNoteChange={vi.fn()}
      />
    );

    const textarea = screen.getByLabelText(
      `Catatan untuk ${mockItem.name}`
    ) as HTMLTextAreaElement;

    expect(textarea.maxLength).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// Tampilan umum
// ---------------------------------------------------------------------------

describe('ConfirmationItem — tampilan', () => {
  it('menampilkan nama item', () => {
    render(
      <ConfirmationItem
        item={mockItem}
        cartItem={makeCartItem(2)}
        onQuantityChange={vi.fn()}
        onNoteChange={vi.fn()}
      />
    );

    expect(screen.getByText('Espresso')).toBeTruthy();
  });

  it('menampilkan kuantitas saat ini', () => {
    render(
      <ConfirmationItem
        item={mockItem}
        cartItem={makeCartItem(4)}
        onQuantityChange={vi.fn()}
        onNoteChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Kuantitas: 4')).toBeTruthy();
  });
});
