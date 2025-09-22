import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { RootProviders } from '../providers/RootProviders';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fantasix - Fantasy Esports para Rainbow Six Siege',
  description: 'Crea tu equipo fantasy con los mejores jugadores profesionales de R6 Siege y compite por la gloria.',
  keywords: ['fantasy', 'esports', 'rainbow six siege', 'r6', 'gaming'],
  authors: [{ name: 'Fantasix Team' }],
  openGraph: {
    title: 'Fantasix - Fantasy Esports',
    description: 'La mejor plataforma de fantasy esports para Rainbow Six Siege',
    type: 'website',
    locale: 'es_ES',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0284c7' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <RootProviders>
          {children}
        </RootProviders>
      </body>
    </html>
  );
}