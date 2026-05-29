import './globals.css';
import 'leaflet/dist/leaflet.css';
import AdsBySe7enInc from '@/components/AdsBySe7enInc';
import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';
import StructuredData from '@/components/StructuredData';
import { createMetadata, siteConfig } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  ...createMetadata({}),
  metadataBase: new URL(siteConfig.url),
};

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en">
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
