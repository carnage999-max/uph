import { styles } from '@/lib/constants';
import { requireAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminNav from './AdminNav';
import SignOutButton from './SignOutButton';

export default async function AdminLayout({ children }: { children: React.ReactNode }){
  const session = await requireAdminSession();
  if (!session) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-16 z-40 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md">
        <div className={`${styles.container} flex flex-col gap-3 py-3`}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-montserrat text-lg font-semibold text-gray-900">Admin Dashboard</span>
              <span className="text-xs text-gray-500">Signed in as {session.email}</span>
            </div>
            <SignOutButton />
          </div>
          <AdminNav />
        </div>
      </header>
      <main className="py-10">
        {children}
      </main>
    </div>
  );
}
