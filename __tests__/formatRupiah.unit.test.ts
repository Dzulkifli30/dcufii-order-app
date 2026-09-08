import { describe, it, expect } from 'vitest';
import { formatRupiah } from '@/lib/formatRupiah';

// Unit tests untuk fungsi formatRupiah
// Requirements: 1.3 — harga ditampilkan dalam format Rupiah (Rp)

describe('formatRupiah', () => {
  it('memformat 18000 menjadi "Rp 18.000"', () => {
    expect(formatRupiah(18000)).toBe('Rp 18.000');
  });

  it('memformat 1000 menjadi "Rp 1.000"', () => {
    expect(formatRupiah(1000)).toBe('Rp 1.000');
  });

  it('memformat 999000 menjadi "Rp 999.000"', () => {
    expect(formatRupiah(999000)).toBe('Rp 999.000');
  });

  it('memformat harga tanpa pemisah ribuan untuk nilai < 1000', () => {
    expect(formatRupiah(500)).toBe('Rp 500');
  });

  it('memformat harga jutaan dengan pemisah yang benar', () => {
    expect(formatRupiah(1000000)).toBe('Rp 1.000.000');
  });

  it('memformat 0 menjadi "Rp 0"', () => {
    expect(formatRupiah(0)).toBe('Rp 0');
  });
});
