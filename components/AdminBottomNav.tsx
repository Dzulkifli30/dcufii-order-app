'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Home', icon: '⌂' },
  { href: '/admin/orders', label: 'Orders', icon: '▤' },
  { href: '/admin/menu', label: 'Menu', icon: '☕' },
  { href: '/admin/profile', label: 'Profile', icon: '●' },
];

export default function AdminBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-brand-secondary/30 bg-white/95 shadow-lg backdrop-blur">
      <div className="mx-auto grid max-w-2xl grid-cols-4">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`flex min-h-[touch-min] flex-col items-center justify-center gap-1 text-xs ${active ? 'font-semibold text-brand-primary' : 'text-gray-500'}`}>
              <span className="text-lg leading-none" aria-hidden="true">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
