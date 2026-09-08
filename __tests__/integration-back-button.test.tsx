/**
 * Integration test: Blokir tombol back di halaman pembayaran
 * Requirements: 4.5
 *
 * Verifikasi:
 * - window.history.pushState dipanggil saat mount
 * - Listener popstate dipasang saat mount
 * - Listener popstate memanggil pushState lagi saat dipicu
 * - Listener dihapus saat unmount
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------

const mockPush = vi.fn().mockResolvedValue(undefined);

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

import HalamanPembayaran from '@/app/payment/page';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Integration: Blokir tombol back di halaman pembayaran', () => {
  let pushStateSpy: ReturnType<typeof vi.spyOn>;
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockPush.mockClear();
    mockPush.mockResolvedValue(undefined);

    // Spy on history.pushState
    pushStateSpy = vi.spyOn(window.history, 'pushState');

    // Spy on addEventListener and removeEventListener
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.useRealTimers();
    pushStateSpy.mockRestore();
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('memanggil window.history.pushState saat komponen mount', () => {
    render(<HalamanPembayaran />);

    // pushState should be called at least once on mount
    expect(pushStateSpy).toHaveBeenCalled();

    // Verify it was called with the expected arguments
    const pushStateCalls = pushStateSpy.mock.calls;
    const mountCall = pushStateCalls.find(
      (call) => call[0] === null && call[1] === ''
    );
    expect(mountCall).toBeTruthy();
  });

  it('memasang listener popstate saat mount', () => {
    render(<HalamanPembayaran />);

    // addEventListener should be called with 'popstate'
    const popstateCalls = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'popstate'
    );
    expect(popstateCalls.length).toBeGreaterThanOrEqual(1);
  });

  it('listener popstate memanggil pushState lagi saat dipicu', () => {
    render(<HalamanPembayaran />);

    // Clear the spy to count only calls from the popstate handler
    const callCountBefore = pushStateSpy.mock.calls.length;

    // Simulate a popstate event (browser back button)
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    // pushState should have been called again
    expect(pushStateSpy.mock.calls.length).toBeGreaterThan(callCountBefore);
  });

  it('menghapus listener popstate saat komponen unmount', () => {
    const { unmount } = render(<HalamanPembayaran />);

    // Record the popstate listener that was added
    const popstateAddCalls = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'popstate'
    );
    expect(popstateAddCalls.length).toBeGreaterThanOrEqual(1);

    // Unmount the component
    unmount();

    // removeEventListener should be called with 'popstate'
    const popstateRemoveCalls = removeEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'popstate'
    );
    expect(popstateRemoveCalls.length).toBeGreaterThanOrEqual(1);
  });

  it('setelah unmount, popstate event tidak lagi memanggil pushState', async () => {
    const { unmount } = render(<HalamanPembayaran />);

    // Unmount
    unmount();

    // Clear the spy
    pushStateSpy.mockClear();

    // Simulate a popstate event after unmount
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    // pushState should NOT have been called
    expect(pushStateSpy).not.toHaveBeenCalled();
  });
});
