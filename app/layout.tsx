import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

// ---------------------------------------------------------------------------
// Google Fonts
// ---------------------------------------------------------------------------

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "d`cufii",
  description: 'Aplikasi kasir self-order untuk cafe d`cufii',
};

// ---------------------------------------------------------------------------
// Root Layout
// ---------------------------------------------------------------------------

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${playfairDisplay.variable} ${inter.variable}`}>
      <body className="font-body bg-brand-surface min-h-screen">
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
