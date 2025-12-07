'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { styles } from '@/lib/constants';
import Image from 'next/image';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/properties', label: 'Properties' },
  { href: '/apply', label: 'Apply', isPrimary: true },
  { href: '/maintenance', label: 'Maintenance' },
  { href: '/contact', label: 'Contact' },
];

export default function NavBar(){
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const backdropRef = useRef<HTMLDivElement | null>(null);

  useEffect(()=>{
    function onKey(e: KeyboardEvent){ if(e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', onKey);
    return ()=> document.removeEventListener('keydown', onKey);
  }, []);

  function closeIfBackDrop(e:any){
    if(e.target === backdropRef.current){ setOpen(false); }
  }

  return (
    <header className={styles.header}>
      <div className={`${styles.container} flex h-16 items-center justify-between`}>
        <Link href="/" className="flex items-center gap-3">
          {/* <div className="h-8 w-8 rounded-lg" style={{background:'#111827'}} /> */}
          <Image src="/logo/uph.jpeg" alt="Logo" width={50} height={50} preload />
          <div className="font-montserrat font-semibold">Ultimate Property Holdings</div>
        </Link>

        <nav className={styles.nav}>
          {links.map(l => (
            <Link 
              key={l.href} 
              href={l.href}
              className={
                l.isPrimary 
                  ? `${styles.btn} ${styles.btnPrimary} !px-4 !py-2 text-sm`
                  : `${styles.navLink} ${pathname === l.href ? styles.navLinkActive : ''}`
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          aria-label="Open menu"
          className={`md:hidden ${styles.btn} ${styles.btnGhost}`}
          onClick={()=>setOpen(true)}
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
              <div className="font-montserrat font-semibold">Menu</div>
              <button
                aria-label="Close menu"
                className={`${styles.btn} ${styles.btnGhost}`}
                onClick={()=>setOpen(false)}
              >
                ✕
              </button>
            </div>
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={()=>setOpen(false)}
                className={`${styles.mobileMenuLink} ${
                  pathname === l.href ? 'bg-gray-100 text-gray-900' : ''
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
