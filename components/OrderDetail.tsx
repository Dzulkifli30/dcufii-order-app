import type { Order } from '@/types';
import { formatRupiah } from '@/lib/formatRupiah';

export default function OrderDetail({ order }: { order: Order }) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <div className="flex flex-wrap justify-between gap-3 border-b pb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Order #{order.id.slice(0, 8)}</p>
          <h2 className="font-display text-xl font-semibold text-brand-primary">{order.customerName}</h2>
          <p className="text-sm text-gray-500">Meja {order.tableNumber} · {order.paymentMethod}</p>
        </div>
        <span className="h-fit rounded-full bg-brand-surface px-3 py-1 text-sm text-brand-primary">{order.status}</span>
      </div>
      <ul className="divide-y">
        {order.items.map((item) => (
          <li key={`${item.menuItemId}-${item.note}`} className="flex justify-between gap-3 py-3 text-sm">
            <span>{item.quantity} x {item.name}{item.note ? ` (${item.note})` : ''}</span>
            <span className="whitespace-nowrap font-medium">{formatRupiah(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between border-t pt-4 font-bold text-brand-primary">
        <span>Total</span><span>{formatRupiah(order.totalPrice)}</span>
      </div>
    </section>
  );
}
