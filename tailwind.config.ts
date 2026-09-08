import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4A2C2A',   // cokelat kopi gelap — header, tombol aktif
          secondary: '#D4A96A', // krem karamel — aksen, border aktif
          surface: '#FDF6EC',   // krem terang — background halaman
          error: '#DC2626',     // merah — pesan error
          success: '#16A34A',   // hijau — konfirmasi
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Playfair Display', 'serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
      },
      spacing: {
        'touch-min': '44px',
      },
    },
  },
  plugins: [],
}

export default config
