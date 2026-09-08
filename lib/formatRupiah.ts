/**
 * Format angka harga ke format Rupiah: Rp 18.000
 *
 * @param price - Nilai harga dalam Rupiah (bilangan bulat positif)
 * @returns String terformat, contoh: "Rp 18.000"
 */
export function formatRupiah(price: number): string {
  return 'Rp ' + price.toLocaleString('id-ID');
}
