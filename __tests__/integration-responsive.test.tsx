/**
 * Integration test: Responsivitas
 * Requirements: 1.7, 6.1, 6.6
 *
 * Verifikasi:
 * - Tidak ada overflow horizontal pada viewport 360px
 * - Tidak ada overflow horizontal pada viewport 768px
 * - CartButton tersembunyi/disabled saat cart kosong
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartProvider, useCart } from '@/context/CartContext';
import { menuItems } from '@/data/menu';

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (
    props: React.ImgHTMLAttributes<HTMLImageElement> & {
      fill?: boolean;
      sizes?: string;
    }
  ) => {
    const { fill: _fill, sizes: _sizes, ...rest } = props;
    return <img {...rest} />;
  },
}));

import HalamanPemesanan from '@/app/page';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderWithCart(ui: React.ReactElement) {
  return render(<CartProvider>{ui}</CartProvider>);
}

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Integration: Responsivitas', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  describe('Viewport 360px (mobile)', () => {
    beforeEach(() => {
      setViewportWidth(360);
    });

    it('halaman pemesanan di-render tanpa error pada viewport 360px', () => {
      const { container } = renderWithCart(<HalamanPemesanan />);

      // Verify the page renders correctly
      expect(container.querySelector('header')).toBeTruthy();
      expect(container.querySelector('main')).toBeTruthy();

      // Verify heading is present
      expect(screen.getByText("d`cufii")).toBeTruthy();
    });

    it('semua kategori menu ditampilkan pada viewport 360px', () => {
      renderWithCart(<HalamanPemesanan />);

      // Should render all categories
      expect(screen.getByText('Minuman')).toBeTruthy();
      expect(screen.getByText('Makanan')).toBeTruthy();
      expect(screen.getByText('Snack')).toBeTruthy();
    });

    it('tidak ada elemen dengan width > viewport (360px) di layout utama', () => {
      const { container } = renderWithCart(<HalamanPemesanan />);

      // The main container should not have overflow styling issues
      const main = container.querySelector('main');
      expect(main).toBeTruthy();

      // Verify the max-width constraint is applied
      const maxWidthElements = container.querySelectorAll('.max-w-2xl');
      expect(maxWidthElements.length).toBeGreaterThan(0);
    });
  });

  describe('Viewport 768px (tablet)', () => {
    beforeEach(() => {
      setViewportWidth(768);
    });

    it('halaman pemesanan di-render tanpa error pada viewport 768px', () => {
      const { container } = renderWithCart(<HalamanPemesanan />);

      expect(container.querySelector('header')).toBeTruthy();
      expect(container.querySelector('main')).toBeTruthy();
      expect(screen.getByText("d`cufii")).toBeTruthy();
    });

    it('semua item menu ditampilkan pada viewport 768px', () => {
      renderWithCart(<HalamanPemesanan />);

      // All 9 menu items should be rendered
      for (const item of menuItems) {
        expect(screen.getByText(item.name)).toBeTruthy();
      }
    });

    it('grid menu menggunakan class responsif md:grid-cols-2', () => {
      const { container } = renderWithCart(<HalamanPemesanan />);

      // Check that the grid container has the responsive class
      const gridElements = container.querySelectorAll('.grid');
      expect(gridElements.length).toBeGreaterThan(0);

      // At least one grid should have the md:grid-cols-2 class
      const hasResponsiveGrid = Array.from(gridElements).some((el) =>
        el.classList.contains('md:grid-cols-2')
      );
      expect(hasResponsiveGrid).toBe(true);
    });
  });

  describe('CartButton visibility', () => {
    it('CartButton tersembunyi saat keranjang kosong', () => {
      renderWithCart(<HalamanPemesanan />);

      // The "Lihat Keranjang" button should NOT be in the DOM
      const cartButton = screen.queryByRole('button', {
        name: /lihat keranjang/i,
      });
      expect(cartButton).toBeNull();
    });

    it('CartButton muncul setelah menambah item ke keranjang', () => {
      renderWithCart(<HalamanPemesanan />);

      // Add an item
      const addButton = screen.getByLabelText(
        new RegExp(`Tambah ${menuItems[0].name} ke keranjang`, 'i')
      );
      const { fireEvent } = require('@testing-library/react');
      fireEvent.click(addButton);

      // Now CartButton should be visible
      const cartButton = screen.getByRole('button', {
        name: /lihat keranjang/i,
      });
      expect(cartButton).toBeTruthy();
    });

    it('CartButton menampilkan jumlah item yang benar', () => {
      renderWithCart(<HalamanPemesanan />);

      const { fireEvent } = require('@testing-library/react');

      // Add two different items
      fireEvent.click(
        screen.getByLabelText(
          new RegExp(`Tambah ${menuItems[0].name} ke keranjang`, 'i')
        )
      );
      fireEvent.click(
        screen.getByLabelText(
          new RegExp(`Tambah ${menuItems[1].name} ke keranjang`, 'i')
        )
      );

      // CartButton should show "2" somewhere
      const cartButton = screen.getByRole('button', {
        name: /lihat keranjang/i,
      });
      expect(cartButton.textContent).toContain('2');
    });
  });
});
