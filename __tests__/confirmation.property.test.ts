import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateForm } from '@/lib/validateConfirmationForm';
import type { PaymentMethod } from '@/types';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Valid PaymentMethod values */
const paymentMethodArb: fc.Arbitrary<PaymentMethod> = fc.constantFrom(
  'QRIS',
  'TRANSFER_BANK',
  'CASH'
);

/**
 * paymentMethod input: valid method or null (not chosen)
 */
const paymentMethodOrNullArb: fc.Arbitrary<PaymentMethod | null> = fc.oneof(
  paymentMethodArb,
  fc.constant(null)
);

/**
 * customerName input: covers empty, whitespace-only, valid non-empty strings,
 * and very long strings.
 */
const customerNameArb: fc.Arbitrary<string> = fc.oneof(
  fc.constant(''),                                         // empty
  fc.stringMatching(/^\s+$/),                             // whitespace-only
  fc.string({ minLength: 1, maxLength: 100 }).filter(     // non-empty, non-whitespace-only
    (s) => s.trim().length > 0
  ),
  fc.string({ minLength: 101, maxLength: 200 })           // over-length (still valid if non-empty)
);

/**
 * tableNumber input: covers valid range, out-of-range integers,
 * zero, negatives, and empty string.
 */
const tableNumberArb: fc.Arbitrary<number | ''> = fc.oneof(
  fc.integer({ min: 1, max: 999 }),                        // valid range
  fc.constant('' as const),                                // empty (not filled)
  fc.constant(0),                                          // boundary: below minimum
  fc.integer({ min: 1000, max: 9999 }),                    // above maximum
  fc.integer({ min: -9999, max: -1 })                      // negative
);

// ---------------------------------------------------------------------------
// Property 5: Validasi form konfirmasi menolak input tidak lengkap
// Feature: dcufii-cashier-app, Property 5: Validasi form konfirmasi menolak input tidak lengkap
// Validates: Requirements 3.11, 3.12
// ---------------------------------------------------------------------------

describe('Property 5: Validasi form konfirmasi menolak input tidak lengkap', () => {
  it('form valid jika dan hanya jika semua field valid', () => {
    // Feature: dcufii-cashier-app, Property 5: Validasi form konfirmasi menolak input tidak lengkap
    fc.assert(
      fc.property(
        customerNameArb,
        tableNumberArb,
        paymentMethodOrNullArb,
        (customerName, tableNumber, paymentMethod) => {
          const errors = validateForm(customerName, tableNumber, paymentMethod);
          const isFormValid = Object.keys(errors).length === 0;

          const isNameValid = customerName.trim().length > 0;
          const isTableValid =
            tableNumber !== '' &&
            Number.isInteger(tableNumber) &&
            tableNumber >= 1 &&
            tableNumber <= 999;
          const isPaymentValid = paymentMethod !== null;

          const shouldBeValid = isNameValid && isTableValid && isPaymentValid;

          // The form is valid iff all three fields are valid
          expect(isFormValid).toBe(shouldBeValid);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('customerName vang kosong atau hanya spasi selalu menghasilkan error customerName', () => {
    // Feature: dcufii-cashier-app, Property 5: Validasi form konfirmasi menolak input tidak lengkap
    fc.assert(
      fc.property(
        // Names that are empty or whitespace-only
        fc.oneof(fc.constant(''), fc.stringMatching(/^\s+$/)),
        tableNumberArb,
        paymentMethodOrNullArb,
        (customerName, tableNumber, paymentMethod) => {
          const errors = validateForm(customerName, tableNumber, paymentMethod);
          expect(errors.customerName).toBeDefined();
          expect(typeof errors.customerName).toBe('string');
          expect((errors.customerName as string).length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('customerName non-empty non-whitespace tidak menghasilkan error customerName', () => {
    // Feature: dcufii-cashier-app, Property 5: Validasi form konfirmasi menolak input tidak lengkap
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
        tableNumberArb,
        paymentMethodOrNullArb,
        (customerName, tableNumber, paymentMethod) => {
          const errors = validateForm(customerName, tableNumber, paymentMethod);
          expect(errors.customerName).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('tableNumber di luar [1, 999] atau kosong selalu menghasilkan error tableNumber', () => {
    // Feature: dcufii-cashier-app, Property 5: Validasi form konfirmasi menolak input tidak lengkap
    fc.assert(
      fc.property(
        customerNameArb,
        fc.oneof(
          fc.constant('' as const),
          fc.constant(0),
          fc.integer({ min: 1000, max: 99999 }),
          fc.integer({ min: -99999, max: -1 })
        ),
        paymentMethodOrNullArb,
        (customerName, tableNumber, paymentMethod) => {
          const errors = validateForm(customerName, tableNumber, paymentMethod);
          expect(errors.tableNumber).toBeDefined();
          expect(typeof errors.tableNumber).toBe('string');
          expect((errors.tableNumber as string).length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('tableNumber dalam [1, 999] tidak menghasilkan error tableNumber', () => {
    // Feature: dcufii-cashier-app, Property 5: Validasi form konfirmasi menolak input tidak lengkap
    fc.assert(
      fc.property(
        customerNameArb,
        fc.integer({ min: 1, max: 999 }),
        paymentMethodOrNullArb,
        (customerName, tableNumber, paymentMethod) => {
          const errors = validateForm(customerName, tableNumber, paymentMethod);
          expect(errors.tableNumber).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('paymentMethod null selalu menghasilkan error paymentMethod', () => {
    // Feature: dcufii-cashier-app, Property 5: Validasi form konfirmasi menolak input tidak lengkap
    fc.assert(
      fc.property(
        customerNameArb,
        tableNumberArb,
        fc.constant(null),
        (customerName, tableNumber, paymentMethod) => {
          const errors = validateForm(customerName, tableNumber, paymentMethod);
          expect(errors.paymentMethod).toBeDefined();
          expect(typeof errors.paymentMethod).toBe('string');
          expect((errors.paymentMethod as string).length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('paymentMethod yang dipilih tidak menghasilkan error paymentMethod', () => {
    // Feature: dcufii-cashier-app, Property 5: Validasi form konfirmasi menolak input tidak lengkap
    fc.assert(
      fc.property(
        customerNameArb,
        tableNumberArb,
        paymentMethodArb,
        (customerName, tableNumber, paymentMethod) => {
          const errors = validateForm(customerName, tableNumber, paymentMethod);
          expect(errors.paymentMethod).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('input tidak valid menghasilkan error hanya pada field yang bersangkutan', () => {
    // Feature: dcufii-cashier-app, Property 5: Validasi form konfirmasi menolak input tidak lengkap
    fc.assert(
      fc.property(
        customerNameArb,
        tableNumberArb,
        paymentMethodOrNullArb,
        (customerName, tableNumber, paymentMethod) => {
          const errors = validateForm(customerName, tableNumber, paymentMethod);

          const isNameValid = customerName.trim().length > 0;
          const isTableValid =
            tableNumber !== '' &&
            Number.isInteger(tableNumber) &&
            tableNumber >= 1 &&
            tableNumber <= 999;
          const isPaymentValid = paymentMethod !== null;

          // Error presence matches field validity exactly
          if (isNameValid) {
            expect(errors.customerName).toBeUndefined();
          } else {
            expect(errors.customerName).toBeDefined();
          }

          if (isTableValid) {
            expect(errors.tableNumber).toBeUndefined();
          } else {
            expect(errors.tableNumber).toBeDefined();
          }

          if (isPaymentValid) {
            expect(errors.paymentMethod).toBeUndefined();
          } else {
            expect(errors.paymentMethod).toBeDefined();
          }
        }
      ),
      { numRuns: 200 }
    );
  });
});
