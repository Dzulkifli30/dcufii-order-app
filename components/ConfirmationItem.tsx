import { MenuItem, CartItem } from '@/types';
import { formatRupiah } from '@/lib/formatRupiah';

interface ConfirmationItemProps {
  item: MenuItem;
  cartItem: CartItem;
  onQuantityChange: (qty: number) => void;
  onNoteChange: (note: string) => void;
}

/**
 * Baris item di halaman konfirmasi.
 * Menampilkan nama, harga per item, subtotal, kontrol qty, dan textarea catatan.
 */
export default function ConfirmationItem({
  item,
  cartItem,
  onQuantityChange,
  onNoteChange,
}: ConfirmationItemProps) {
  const subtotal = item.price * cartItem.quantity;

  const handleDecrement = () => {
    onQuantityChange(cartItem.quantity - 1);
  };

  const handleIncrement = () => {
    if (cartItem.quantity < 99) {
      onQuantityChange(cartItem.quantity + 1);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
      {/* Baris atas: nama + harga per item */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-body text-sm font-semibold text-brand-primary">
          {item.name}
        </span>
        <span className="font-body text-sm text-gray-500 whitespace-nowrap">
          {formatRupiah(item.price)}
        </span>
      </div>

      {/* Kontrol kuantitas + subtotal */}
      <div className="flex items-center justify-between gap-4">
        {/* Kontrol [−] [qty] [+] */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDecrement}
            aria-label="Kurangi kuantitas"
            className="flex min-h-[touch-min] min-w-[touch-min] items-center justify-center rounded-full border border-brand-secondary bg-white text-brand-primary text-lg font-bold transition-colors hover:bg-brand-surface active:bg-brand-secondary/20"
          >
            −
          </button>

          <span
            className="font-body w-8 text-center text-base font-semibold text-brand-primary"
            aria-label={`Kuantitas: ${cartItem.quantity}`}
          >
            {cartItem.quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={cartItem.quantity >= 99}
            aria-label="Tambah kuantitas"
            className="flex min-h-[touch-min] min-w-[touch-min] items-center justify-center rounded-full border border-brand-secondary bg-white text-brand-primary text-lg font-bold transition-colors hover:bg-brand-surface active:bg-brand-secondary/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>

        {/* Subtotal */}
        <span className="font-body text-sm font-semibold text-brand-primary">
          {formatRupiah(subtotal)}
        </span>
      </div>

      {/* Textarea catatan */}
      <textarea
        value={cartItem.note}
        onChange={(e) => onNoteChange(e.target.value)}
        maxLength={200}
        rows={2}
        placeholder="Catatan untuk item ini (opsional)"
        aria-label={`Catatan untuk ${item.name}`}
        className="font-body min-h-[touch-min] w-full resize-none rounded-md border border-gray-200 bg-brand-surface px-3 py-2 text-sm text-brand-primary placeholder:text-gray-400 focus:border-brand-secondary focus:outline-none focus:ring-1 focus:ring-brand-secondary"
      />

      {/* Counter karakter catatan */}
      <p className="font-body text-right text-xs text-gray-400">
        {cartItem.note.length}/200
      </p>
    </div>
  );
}
