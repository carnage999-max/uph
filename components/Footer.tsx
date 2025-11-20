import Link from 'next/link';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="relative z-50 bg-[#111827] text-white mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* === Brand Section === */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Image src="/logo/uph.jpeg" alt="Logo" width={50} height={50} preload />
            <span className="text-lg font-semibold">
              Ultimate Property Holdings
            </span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Premium residential apartments managed with care across Maine.
          </p>
        </div>

        {/* === Quick Links === */}
        <div>
          <h3 className="text-white text-base font-semibold mb-3">
            Quick Links
          </h3>
          <ul className="space-y-2 text-gray-300">
            {[
              { href: '/', label: 'Home' },
              { href: '/about', label: 'About' },
              { href: '/properties', label: 'Properties' },
              { href: '/maintenance', label: 'Maintenance' },
              { href: '/contact', label: 'Contact' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* === Contact & Socials === */}
        <div className="text-gray-300 space-y-3">
          <h3 className="text-white text-base font-semibold">Contact</h3>
          <p>PO Box 52, Detroit, ME 04929</p>
          <p>
            Phone:{' '}
            <a
              href="tel:12079471999"
              className="underline hover:text-white transition-colors duration-200"
            >
              207-947-1999
            </a>
          </p>

          {/* Social Media Links */}
          <div className="flex items-center gap-4 pt-2">
            <Link
              href="https://www.facebook.com/ultimatepropertyholdings/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Facebook size={18} className="text-white" />
            </Link>
            <Link
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Instagram size={18} className="text-white" />
            </Link>
          </div>
        </div>
      </div>

      {/* === Bottom Bar === */}
      <div className="border-t border-gray-700 mt-4 py-4 text-center text-gray-400 text-xs">
        © 2025 Ultimate Property Holdings LLC. All Rights Reserved.
      </div>

      
    </footer>
  );
}
