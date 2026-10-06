'use client';

import Link from 'next/link';
import { Building2, LayoutDashboard, Wrench } from 'lucide-react';
import { usePathname } from 'next/navigation';

const adminLinks = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/admin/create', label: 'New Property', icon: Building2 },
];

function isActive(pathname: string, href: string){
  if (href === '/admin'){
    return pathname === href || pathname.startsWith('/admin/edit/');
  }
  return pathname.startsWith(href);
}

export default function AdminNav(){
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="flex gap-2 overflow-x-auto pb-1">
      {adminLinks.map(({ href, label, icon: Icon })=> {
        const active = isActive(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 ${
              active
                ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
