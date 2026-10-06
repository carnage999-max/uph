'use client';

import { useRouter } from 'next/navigation';
import { styles } from '@/lib/constants';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

export default function SignOutButton(){
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut(){
    setPending(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <button
      type="button"
      className={`${styles.adminButton} ${styles.adminButtonSecondary}`}
      onClick={handleSignOut}
      disabled={pending}
    >
      <LogOut aria-hidden="true" className="h-4 w-4" />
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
