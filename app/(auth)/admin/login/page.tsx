import LoginForm from './LoginForm';
import { styles } from '@/lib/constants';
import { requireAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLoginPage(){
  const session = await requireAdminSession();
  if (session) redirect('/admin');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className={`${styles.cardAdmin} ${styles.cardAdminPad} w-full max-w-md space-y-6`}>
        <div className="space-y-2 text-center">
          <h1 className="font-montserrat text-2xl font-semibold text-gray-900">
            Admin Access
          </h1>
          <p className="text-sm text-gray-600">
            Enter your credentials to manage properties and maintenance requests.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
