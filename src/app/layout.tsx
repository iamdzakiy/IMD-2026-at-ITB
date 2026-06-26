import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IMD 2026 at ITB',
  description:
    'International Microorganism Day (IMD) 2026 at ITB – featuring the Olympiad of Microbiology, Science Project Competition, and National Essay Competition.',
  // ... rest of your metadata
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
