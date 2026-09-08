import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentMethodSelector from '@/components/PaymentMethodSelector';
import type { PaymentMethod } from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'QRIS', label: 'QRIS' },
  { value: 'TRANSFER_BANK', label: 'Transfer Bank' },
  { value: 'CASH', label: 'Cash' },
];

// The active-state CSS class applied exclusively to the selected button.
// From PaymentMethodSelector.tsx: isSelected → 'border-brand-secondary bg-brand-secondary/10 ...'
// inactive → 'border-gray-200 bg-white ...'
// We use 'bg-brand-secondary/10' as the discriminator because it only appears
// on the active button, while 'border-brand-secondary' also appears in the
// focus ring class on all buttons.
const ACTIVE_BG_CLASS = 'bg-brand-secondary/10';
const INACTIVE_BG_CLASS = 'bg-white';

// ---------------------------------------------------------------------------
// Requirement 3.8 — Menampilkan tiga pilihan metode pembayaran
// ---------------------------------------------------------------------------

describe('PaymentMethodSelector — rendering', () => {
  it('menampilkan tiga tombol opsi pembayaran', () => {
    render(<PaymentMethodSelector selected={null} onChange={vi.fn()} />);

    const qrisBtn = screen.getByRole('button', { name: /QRIS/i });
    const transferBtn = screen.getByRole('button', { name: /Transfer Bank/i });
    const cashBtn = screen.getByRole('button', { name: /Cash/i });

    expect(qrisBtn).toBeTruthy();
    expect(transferBtn).toBeTruthy();
    expect(cashBtn).toBeTruthy();
  });

  it('tidak ada opsi yang aktif saat selected=null', () => {
    render(<PaymentMethodSelector selected={null} onChange={vi.fn()} />);

    PAYMENT_OPTIONS.forEach(({ label }) => {
      const btn = screen.getByRole('button', { name: new RegExp(label, 'i') });
      expect(btn.getAttribute('aria-pressed')).toBe('false');
    });
  });
});

// ---------------------------------------------------------------------------
// Requirement 3.8 — Setiap opsi memanggil onChange dengan nilai yang benar
// ---------------------------------------------------------------------------

describe('PaymentMethodSelector — onChange', () => {
  it.each(PAYMENT_OPTIONS)(
    'memilih "$label" memanggil onChange dengan "$value"',
    async ({ value, label }) => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <PaymentMethodSelector selected={null} onChange={handleChange} />
      );

      await user.click(
        screen.getByRole('button', { name: new RegExp(label, 'i') })
      );

      expect(handleChange).toHaveBeenCalledOnce();
      expect(handleChange).toHaveBeenCalledWith(value);
    }
  );
});

// ---------------------------------------------------------------------------
// Requirement 3.9 — Opsi yang dipilih memiliki visual aktif; yang lain tidak
// ---------------------------------------------------------------------------

describe('PaymentMethodSelector — visual aktif', () => {
  it.each(PAYMENT_OPTIONS)(
    'opsi "$label" memiliki aria-pressed=true saat dipilih',
    ({ value, label }) => {
      render(<PaymentMethodSelector selected={value} onChange={vi.fn()} />);

      const activeBtn = screen.getByRole('button', {
        name: new RegExp(label, 'i'),
      });
      expect(activeBtn.getAttribute('aria-pressed')).toBe('true');
    }
  );

  it.each(PAYMENT_OPTIONS)(
    'hanya opsi "$label" yang aktif; opsi lain memiliki aria-pressed=false',
    ({ value, label }) => {
      render(<PaymentMethodSelector selected={value} onChange={vi.fn()} />);

      PAYMENT_OPTIONS.forEach(({ label: otherLabel, value: otherValue }) => {
        const btn = screen.getByRole('button', {
          name: new RegExp(otherLabel, 'i'),
        });
        if (otherValue === value) {
          expect(btn.getAttribute('aria-pressed')).toBe('true');
        } else {
          expect(btn.getAttribute('aria-pressed')).toBe('false');
        }
      });
    }
  );

  it.each(PAYMENT_OPTIONS)(
    'opsi "$label" memiliki class aktif (bg-brand-secondary/10) saat dipilih',
    ({ value, label }) => {
      render(<PaymentMethodSelector selected={value} onChange={vi.fn()} />);

      const activeBtn = screen.getByRole('button', {
        name: new RegExp(label, 'i'),
      });
      expect(activeBtn.className).toContain(ACTIVE_BG_CLASS);
    }
  );

  it.each(PAYMENT_OPTIONS)(
    'opsi "$label" tidak memiliki class aktif saat tidak dipilih',
    ({ value, label }) => {
      // Select a different option so this one is inactive
      const otherSelected = PAYMENT_OPTIONS.find((o) => o.value !== value)!
        .value;

      render(
        <PaymentMethodSelector selected={otherSelected} onChange={vi.fn()} />
      );

      const inactiveBtn = screen.getByRole('button', {
        name: new RegExp(label, 'i'),
      });
      expect(inactiveBtn.className).not.toContain(ACTIVE_BG_CLASS);
      expect(inactiveBtn.className).toContain(INACTIVE_BG_CLASS);
    }
  );
});
