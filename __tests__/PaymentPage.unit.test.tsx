/**
 * Unit tests untuk app/payment/page.tsx
 * Requirements: 4.3, 4.4
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mock next/navigation BEFORE importing the component.
// We use a module-level mock factory so vi.fn() refs survive across tests.
// ---------------------------------------------------------------------------

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Import component AFTER mocks are set up
// ---------------------------------------------------------------------------

import HalamanPembayaran from '@/app/payment/page';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderPage() {
  return render(<HalamanPembayaran />);
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.useFakeTimers();
  mockPush.mockReset();
  mockPush.mockResolvedValue(undefined); // default: resolves successfully
  window.history.replaceState(null, '', '/payment');
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('HalamanPembayaran', () => {
  // -------------------------------------------------------------------------
  // Requirement 4.3 — redirect otomatis ke /done setelah 5 detik
  // -------------------------------------------------------------------------

  describe('Redirect otomatis ke /done setelah 5 detik (Requirement 4.3)', () => {
    it('tidak memanggil router.push sebelum 5 detik berlalu', async () => {
      renderPage();

      // Advance time to just under 5 seconds
      await act(async () => {
        vi.advanceTimersByTime(4999);
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('memanggil router.push("/done") tepat setelah 5 detik', async () => {
      renderPage();

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/done');
    });

    it('hanya memanggil router.push satu kali meskipun waktu terus berjalan', async () => {
      renderPage();

      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      expect(mockPush).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------------------------------------
  // Requirement 4.3 — cleanup timer saat unmount
  // -------------------------------------------------------------------------

  describe('Cleanup timer saat unmount', () => {
    it('tidak memanggil router.push jika komponen di-unmount sebelum 5 detik', async () => {
      const { unmount } = renderPage();

      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      unmount();

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Requirement 4.4 — tampilkan ErrorMessage jika router.push melempar error
  // -------------------------------------------------------------------------

  describe('ErrorMessage saat router.push gagal (Requirement 4.4)', () => {
    it('menampilkan pesan error jika router.push melempar exception', async () => {
      mockPush.mockRejectedValue(new Error('Navigation failed'));

      renderPage();

      // Advance past 5 seconds so the setTimeout callback fires,
      // then flush all pending microtasks (the rejected promise) inside act.
      await act(async () => {
        vi.advanceTimersByTime(5000);
        // Flush promise microtasks: the async callback inside setTimeout
        // awaits router.push(), so we need to drain the microtask queue.
        await vi.runAllTimersAsync();
        await Promise.resolve();
        await Promise.resolve();
      });

      // ErrorMessage uses role="alert"
      const alert = screen.getByRole('alert');
      expect(alert).toBeTruthy();
      expect(alert.textContent).toContain('Pengalihan ke halaman selesai gagal');
    });

    it('tidak menampilkan pesan error sebelum redirect gagal', async () => {
      renderPage();

      // Before the timer fires, no error message should exist
      const alert = screen.queryByRole('alert');
      expect(alert).toBeNull();
    });

    it('tidak menampilkan pesan error saat redirect berhasil', async () => {
      mockPush.mockResolvedValue(undefined);

      renderPage();

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      await act(async () => {
        await Promise.resolve();
      });

      const alert = screen.queryByRole('alert');
      expect(alert).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Sanity check: konten halaman dirender dengan benar
  // -------------------------------------------------------------------------

  describe('Konten halaman', () => {
    it('menampilkan teks "Sedang mengonfirmasi pembayaran"', () => {
      renderPage();
      expect(screen.getByText('Sedang mengonfirmasi pembayaran')).toBeTruthy();
    });

    it('menampilkan spinner dengan role="status"', () => {
      renderPage();
      expect(screen.getByRole('status')).toBeTruthy();
    });

    it('menunggu konfirmasi kasir untuk pembayaran tunai', async () => {
      window.history.replaceState(null, '', '/payment?method=CASH');

      renderPage();

      await act(async () => {
        await Promise.resolve();
      });

      expect(screen.getByText('Menunggu pembayaran tunai dikonfirmasi kasir')).toBeTruthy();

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
