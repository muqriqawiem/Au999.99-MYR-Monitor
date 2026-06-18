import type {Metadata} from 'next';
import { Inter, Barlow_Condensed } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-barlow',
});

export const metadata: Metadata = {
  title: 'Au 999.9 · Gold Monitor MYR',
  description: 'An elegant real-time gold price monitor (Au 999.9) in Malaysian Ringgit (MYR/g)',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${barlowCondensed.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
