import React from 'react';

interface ErrorMessageProps {
  message: string;
}

/**
 * Komponen pesan kesalahan yang aksesibel.
 * Menampilkan teks error dengan warna brand.error dan role="alert"
 * agar pembaca layar langsung mengumumkan pesan saat muncul.
 */
export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <p
      role="alert"
      aria-live="assertive"
      className="text-brand-error text-sm mt-1"
    >
      {message}
    </p>
  );
}
