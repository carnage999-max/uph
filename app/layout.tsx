import './globals.css';
import 'leaflet/dist/leaflet.css';
import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main className="">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
