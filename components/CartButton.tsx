import { CartButtonProps } from '@/types';

export default function CartButton({ totalItems, onClick }: CartButtonProps) {
  if (totalItems === 0) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="
        flex items-center justify-center gap-2
        min-h-[touch-min] min-w-[touch-min] px-6 py-2
        bg-brand-primary text-white
        font-body font-semibold text-base
        rounded-full shadow-lg
        hover:opacity-90 active:scale-95
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2
      "
      aria-label={`Lihat keranjang, ${totalItems} item`}
    >
      <span>Lihat Keranjang</span>
      <span className="
        inline-flex items-center justify-center
        min-h-6 min-w-6 px-2
        bg-brand-secondary text-brand-primary
        font-semibold text-sm rounded-full
      ">
        {totalItems}
      </span>
    </button>
  );
}
