import type { PaymentMethod, ValidationErrors } from '@/types';

/**
 * Validate the confirmation form.
 * Returns an errors object; an empty object means everything is valid.
 */
export function validateForm(
  customerName: string,
  tableNumber: number | '',
  paymentMethod: PaymentMethod | null
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!customerName.trim()) {
    errors.customerName = 'Nama pelanggan tidak boleh kosong.';
  }

  if (
    tableNumber === '' ||
    !Number.isInteger(tableNumber) ||
    tableNumber < 1 ||
    tableNumber > 999
  ) {
    errors.tableNumber = 'Nomor meja harus berupa angka antara 1–999.';
  }

  if (!paymentMethod) {
    errors.paymentMethod = 'Pilih metode pembayaran terlebih dahulu.';
  }

  return errors;
}
