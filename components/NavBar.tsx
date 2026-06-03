'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { styles } from '@/lib/constants';
import Image from 'next/image';
import LuxuryCTA from '@/components/LuxuryCTA';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/properties', label: 'Properties' },
  { href: '/maintenance', label: 'Maintenance' },
  { href: '/contact', label: 'Contact' },
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const backdropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function closeIfBackDrop(e: React.MouseEvent) {
    if (e.target === backdropRef.current) {
      setOpen(false);
    }
  }

  return (
    <header className={styles.header}>
      <div className={`${styles.container} flex h-16 items-center justify-between gap-4`}>
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src="/logo/atlas.png"
            alt="Atlas Properties"
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-sm object-contain"
            preload
          />
          <div className="min-w-0 leading-tight">
            <div className="font-cinzel text-sm font-semibold tracking-wide text-[#e8e8e8] sm:text-base">
              Atlas
            </div>
            <div className="font-montserrat text-[10px] font-medium uppercase tracking-[0.22em] text-[#c9a227] sm:text-xs">
              Properties
            </div>
          </div>
        </Link>

        <nav className={styles.nav}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`${styles.navLink} ${pathname === l.href ? styles.navLinkActive : ''}`}
            >
              {l.label}
            </Link>
          ))}
          <LuxuryCTA
            href="/apply"
            label="Apply"
            size="sm"
            showOrnaments={false}
            className="shrink-0"
          />
        </nav>

        <button
          aria-label="Open menu"
          className={`md:hidden ${styles.btn} ${styles.btnGhost} shrink-0`}
          onClick={() => setOpen(true)}
        >
          ☰
        </button>
      </div>

      {open && (
        <div
          ref={backdropRef}
          className={styles.mobileMenuBackdrop}
          onClick={closeIfBackDrop}
        >
          <div className={styles.mobileMenu} data-open={open}>
            <div className={`${styles.container} ${styles.mobileMenuHeader}`}>
              <div className="font-cinzel font-semibold text-[#e8e8e8]">Menu</div>
              <button
                aria-label="Close menu"
                className={`${styles.btn} ${styles.btnGhost}`}
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`${styles.mobileMenuLink} ${
                  pathname === l.href ? 'bg-white/8 text-[#e8e8e8]' : ''
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="px-4 py-4">
              <LuxuryCTA
                href="/apply"
                label="Apply Now"
                size="sm"
                showOrnaments={false}
                className="w-full!"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
