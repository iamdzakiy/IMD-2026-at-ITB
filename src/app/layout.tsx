import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/provider/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IMD 2026 at ITB',
  description:
    'International Microorganism Day (IMD) 2026 at ITB – featuring the Olympiad of Microbiology, Science Project Competition, and National Essay Competition. Join us in exploring the microbial world and driving sustainable innovation.',
  keywords: [
    'IMD 2026',
    'International Microorganism Day',
    'ITB',
    'Microbiology Olympiad',
    'Science Project Competition',
    'National Essay Competition',
    'Microbiology',
    'Sustainability',
  ],
  openGraph: {
    title: 'IMD 2026 at ITB',
    description:
      'International Microorganism Day (IMD) 2026 at ITB – Olympiad of Microbiology, Science Project Competition, and National Essay Competition.',
    url: 'https://imd2026.vercel.app',
    siteName: 'IMD 2026 at ITB',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'IMD 2026 at ITB',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IMD 2026 at ITB',
    description:
      'International Microorganism Day (IMD) 2026 at ITB – Olympiad of Microbiology, Science Project Competition, and National Essay Competition.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
