import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';
import Image from '@/components/MediaImage';

function getCurrentYear() {
  return new Date().getFullYear();
}

export default function Footer() {
  return (
    <footer className="relative z-50 mt-16 border-t border-[rgba(201,162,39,0.12)] bg-[#050505] text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo/atlas.png"
              alt="Atlas Properties"
              width={50}
              height={50}
              className="h-12 w-12 object-contain"
              preload
            />
            <div className="leading-tight">
              <span className="font-cinzel text-lg font-semibold text-[#e8e8e8]">
                Atlas Properties
              </span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[#9ca3af]">
            Premium residential apartments managed with care across Maine.
          </p>
        </div>

        <div>
          <h3 className="mb-3 font-cinzel text-base font-semibold text-[#e8e8e8]">
            Quick Links
          </h3>
          <ul className="space-y-2 text-[#9ca3af]">
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
                  className="transition-colors duration-200 hover:text-[#e5c878]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 text-[#9ca3af]">
          <h3 className="font-cinzel text-base font-semibold text-[#e8e8e8]">
            Contact
          </h3>
          <p>PO Box 52, Detroit, ME 04929</p>
          <p>
            Phone:{' '}
            <a
              href="tel:12079471999"
              className="underline transition-colors duration-200 hover:text-[#e5c878]"
            >
              207-947-1999
            </a>
          </p>

          <div className="flex items-center gap-4 pt-2">
            <Link
              href="https://www.facebook.com/ultimatepropertyholdings/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[rgba(201,162,39,0.2)] bg-white/5 p-2 transition-colors hover:border-[rgba(201,162,39,0.4)] hover:bg-white/10"
            >
              <Facebook size={18} className="text-[#e5c878]" />
            </Link>
            <Link
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[rgba(201,162,39,0.2)] bg-white/5 p-2 transition-colors hover:border-[rgba(201,162,39,0.4)] hover:bg-white/10"
            >
              <Instagram size={18} className="text-[#e5c878]" />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(201,162,39,0.1)] py-4 text-center text-xs text-[#6b7280]">
        © {getCurrentYear()} Atlas Properties. All Rights Reserved.
      </div>
    </footer>
  );
}
