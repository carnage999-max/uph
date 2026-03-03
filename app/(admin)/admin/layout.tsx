import Link from 'next/link';
import { styles } from '@/lib/constants';
import { requireAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SignOutButton from './SignOutButton';

export default async function AdminLayout({ children }: { children: React.ReactNode }){
  const session = await requireAdminSession();
  if (!session) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className={`${styles.container} flex items-center justify-between py-4`}>
          <div className="flex flex-col">
            <span className="font-montserrat text-lg font-semibold text-gray-900">Admin Dashboard</span>
            <span className="text-xs text-gray-500">Signed in as {session.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-3 sm:flex">
              <Link href="/admin" className="text-sm font-semibold text-gray-700 hover:text-gray-900">
                Overview
              </Link>
              <Link href="/admin/maintenance" className="text-sm font-semibold text-gray-700 hover:text-gray-900">
                Maintenance
              </Link>
              <Link href="/admin/create" className="text-sm font-semibold text-gray-700 hover:text-gray-900">
                New Property
              </Link>
            </nav>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="py-10">
        {children}
      </main>
    </div>
  );
}
