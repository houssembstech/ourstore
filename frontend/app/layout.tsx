import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Our Store',
  description: 'Votre boutique en ligne',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
