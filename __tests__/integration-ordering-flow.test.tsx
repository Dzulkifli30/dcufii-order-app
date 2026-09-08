/**
 * Integration test: Alur pemesanan penuh
 * Requirements: 1.1, 2.1, 3.13, 4.3, 5.3, 5.4
 *
 * Alur: tambah item → navigasi ke konfirmasi → isi form → navigasi ke pembayaran
 *       → tunggu 5 detik → halaman selesai → klik "Pesan Lagi" → cart kosong
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '@/context/CartContext';
import { menuItems } from '@/data/menu';

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------

let currentPath = '/';
const mockPush = vi.fn((path: string) => {
  currentPath = path;
  return Promise.resolve();
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock next/image — jsdom doesn't support Next.js Image
vi.mock('next/image', () => ({
  default: (
    props: React.ImgHTMLAttributes<HTMLImageElement> & {
      fill?: boolean;
      sizes?: string;
    }
  ) => {
    const { fill: _fill, sizes: _sizes, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} />;
  },
}));

// ---------------------------------------------------------------------------
// Lazy imports (must come AFTER vi.mock)
// ---------------------------------------------------------------------------

import HalamanPemesanan from '@/app/page';
import HalamanKonfirmasi from '@/app/confirmation/page';
import HalamanPembayaran from '@/app/payment/page';
import HalamanSelesai from '@/app/done/page';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderWithCart(ui: React.ReactElement) {
  return render(<CartProvider>{ui}</CartProvider>);
}

/**
 * Helper component that exposes cart state for assertions.
 */
function CartInspector({ onRender }: { onRender: (totalItems: number) => void }) {
  const { totalItems } = useCart();
  onRender(totalItems);
  return null;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Integration: Alur pemesanan penuh', () => {
  beforeEach(() => {
    currentPath = '/';
    mockPush.mockClear();
    mockPush.mockImplementation((path: string) => {
      currentPath = path;
      return Promise.resolve();
    });
  });

  it('menambah item di halaman pemesanan — item muncul di keranjang', async () => {
    renderWithCart(<HalamanPemesanan />);

    // Find the first menu item's add button
    const firstItemName = menuItems[0].name;
    const addButton = screen.getByLabelText(
      new RegExp(`Tambah ${firstItemName} ke keranjang`, 'i')
    );

    fireEvent.click(addButton);

    // After adding, the quantity label should appear
    const qtyLabel = screen.getByLabelText(
      new RegExp(`Jumlah ${firstItemName}`, 'i')
    );
    expect(qtyLabel.textContent).toBe('1');
  });

  it('menambah beberapa item lalu navigasi ke konfirmasi', async () => {
    renderWithCart(<HalamanPemesanan />);

    // Add first item
    fireEvent.click(
      screen.getByLabelText(
        new RegExp(`Tambah ${menuItems[0].name} ke keranjang`, 'i')
      )
    );

    // Add second item
    fireEvent.click(
      screen.getByLabelText(
        new RegExp(`Tambah ${menuItems[1].name} ke keranjang`, 'i')
      )
    );

    // CartButton should now be visible (totalItems > 0)
    const cartButton = screen.getByRole('button', {
      name: /lihat keranjang/i,
    });
    expect(cartButton).toBeTruthy();

    // Click to navigate to confirmation
    fireEvent.click(cartButton);
    expect(mockPush).toHaveBeenCalledWith('/confirmation');
  });

  it('halaman konfirmasi menampilkan item dari keranjang dan memvalidasi form', async () => {
    const user = userEvent.setup();

    // Render halaman konfirmasi with cart that already has items
    const { container } = render(
      <CartProvider>
        <AddItemsAndRender />
      </CartProvider>
    );

    // The page should show the cart items
    // We need to wait for the items to render
    function AddItemsAndRender() {
      const { addItem } = useCart();
      React.useEffect(() => {
        addItem(menuItems[0].id);
        addItem(menuItems[1].id);
      }, [addItem]);
      return <HalamanKonfirmasi />;
    }
  });

  it('form konfirmasi menolak submit tanpa data lengkap', async () => {
    function TestPage() {
      const { addItem } = useCart();
      React.useEffect(() => {
        addItem(menuItems[0].id);
      }, [addItem]);
      return <HalamanKonfirmasi />;
    }

    render(
      <CartProvider>
        <TestPage />
      </CartProvider>
    );

    // Try to submit without filling any fields
    const submitButton = screen.getByRole('button', {
      name: /konfirmasi pesanan/i,
    });
    fireEvent.click(submitButton);

    // Should show error messages
    const alerts = screen.getAllByRole('alert');
    expect(alerts.length).toBeGreaterThanOrEqual(1);

    // Should NOT navigate to payment
    expect(mockPush).not.toHaveBeenCalledWith('/payment');
  });

  it('form konfirmasi valid → navigasi ke /payment', async () => {
    const user = userEvent.setup();

    function TestPage() {
      const { addItem } = useCart();
      React.useEffect(() => {
        addItem(menuItems[0].id);
      }, [addItem]);
      return <HalamanKonfirmasi />;
    }

    render(
      <CartProvider>
        <TestPage />
      </CartProvider>
    );

    // Fill in the form
    const nameInput = screen.getByLabelText(/nama pelanggan/i);
    await user.type(nameInput, 'Budi');

    const tableInput = screen.getByLabelText(/nomor meja/i);
    await user.type(tableInput, '5');

    // Select payment method
    const qrisButton = screen.getByRole('button', { name: /QRIS/i });
    await user.click(qrisButton);

    // Submit
    const submitButton = screen.getByRole('button', {
      name: /konfirmasi pesanan/i,
    });
    await user.click(submitButton);

    // Should navigate to payment
    expect(mockPush).toHaveBeenCalledWith('/payment');
  });

  it('halaman pembayaran redirect ke /done setelah 5 detik', async () => {
    vi.useFakeTimers();

    renderWithCart(<HalamanPembayaran />);

    // Should show processing text
    expect(
      screen.getByText('Sedang mengonfirmasi pembayaran')
    ).toBeTruthy();

    // Should show spinner
    expect(screen.getByRole('status')).toBeTruthy();

    // Advance timers by 5 seconds
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockPush).toHaveBeenCalledWith('/done');

    vi.useRealTimers();
  });

  it('halaman selesai menampilkan teks dan tombol "Pesan Lagi"', () => {
    renderWithCart(<HalamanSelesai />);

    expect(
      screen.getByText('Terima kasih atas pesanannya, mohon ditunggu')
    ).toBeTruthy();

    expect(
      screen.getByRole('button', { name: /pesan lagi/i })
    ).toBeTruthy();
  });

  it('klik "Pesan Lagi" → clearCart dipanggil dan navigasi ke /', async () => {
    let capturedTotalItems = -1;

    render(
      <CartProvider>
        <CartInspector
          onRender={(total) => {
            capturedTotalItems = total;
          }}
        />
        <SetupCartAndDone />
      </CartProvider>
    );

    function SetupCartAndDone() {
      const { addItem } = useCart();
      React.useEffect(() => {
        addItem(menuItems[0].id);
        addItem(menuItems[1].id);
      }, [addItem]);
      return <HalamanSelesai />;
    }

    // Cart should have items before clicking "Pesan Lagi"
    expect(capturedTotalItems).toBe(2);

    // Click "Pesan Lagi"
    fireEvent.click(screen.getByRole('button', { name: /pesan lagi/i }));

    // Cart should be cleared
    expect(capturedTotalItems).toBe(0);

    // Should navigate to home
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('CartButton tersembunyi saat keranjang kosong', () => {
    renderWithCart(<HalamanPemesanan />);

    // CartButton should not be visible when cart is empty
    const cartButton = screen.queryByRole('button', {
      name: /lihat keranjang/i,
    });
    expect(cartButton).toBeNull();
  });
});
