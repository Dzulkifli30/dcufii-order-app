import { PaymentMethod } from '@/types';

interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  description: string;
}

const PAYMENT_OPTIONS: PaymentMethodOption[] = [
  {
    value: 'QRIS',
    label: 'QRIS',
    description: 'Scan kode QR untuk membayar',
  },
  {
    value: 'TRANSFER_BANK',
    label: 'Transfer Bank',
    description: 'Transfer melalui rekening bank',
  },
  {
    value: 'CASH',
    label: 'Cash',
    description: 'Bayar tunai ke kasir',
  },
];

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({
  selected,
  onChange,
}: PaymentMethodSelectorProps) {
  return (
    <div role="group" aria-labelledby="payment-method-label">
      <p id="payment-method-label" className="sr-only">
        Pilih metode pembayaran
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {PAYMENT_OPTIONS.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isSelected}
              className={[
                'flex flex-1 flex-col items-center justify-center gap-1 rounded-lg border-2 px-4 py-3',
                'min-h-[touch-min] min-w-[touch-min] transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2',
                isSelected
                  ? 'border-brand-secondary bg-brand-secondary/10 text-brand-primary'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-brand-secondary/50',
              ].join(' ')}
            >
              <span className="font-body text-sm font-semibold leading-tight">
                {option.label}
              </span>
              <span className="font-body text-xs leading-tight text-gray-500">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
