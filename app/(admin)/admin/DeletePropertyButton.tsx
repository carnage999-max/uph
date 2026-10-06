'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { styles } from '@/lib/constants';

type Props = {
  propertyId: string;
  propertyName: string;
};

export default function DeletePropertyButton({ propertyId, propertyName }: Props){
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete(){
    if (!confirm(`Delete ${propertyName}? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, { method: 'DELETE' });
      if (!response.ok){
        const data = await response.json().catch(()=> null);
        throw new Error(data?.message || 'Failed to delete property.');
      }
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Unable to delete property.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={`${styles.adminButton} ${styles.adminButtonSecondary}`}
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? 'Removing…' : 'Remove'}
    </button>
  );
}
