import './globals.css';
import 'leaflet/dist/leaflet.css';
import AdsBySe7enInc from '@/components/AdsBySe7enInc';
import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';
import StructuredData from '@/components/StructuredData';
import { createMetadata, siteConfig } from '@/lib/metadata';
import type { Metadata } from 'next';
import { Cinzel, Montserrat, Open_Sans } from 'next/font/google';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-open-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  ...createMetadata({}),
  metadataBase: new URL(siteConfig.url),
};

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${montserrat.variable} ${openSans.variable}`}
    >
      <head>
        <StructuredData type="organization" />
      </head>
      <body>
        <NavBar />
        <main className="">{children}</main>
        <Footer />
        <AdsBySe7enInc />
      </body>
    </html>
  );
}
