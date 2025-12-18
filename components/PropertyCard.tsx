import { styles } from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';
import { Wrench } from 'lucide-react';
import type { Property } from '@/lib/types';

export default function PropertyCard({ p }:{ p: Property }){
  const visibleUnits = p.units.filter(u => !u.isHidden);
  const availableCount = visibleUnits.filter(u=>u.available).length;
  const rentLabel = p.rentFrom ? `From $${p.rentFrom.toLocaleString()}` : 'Contact for pricing';
  return (
    <Link className={`${styles.card} overflow-hidden`} href={`/properties/${p.slug}`}>
      <div className="relative h-56 w-full">
        <Image 
          src={p.heroImageUrl} 
          alt={p.name} 
          fill 
          className="object-cover" 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        {p.underConstruction && (
          <div className="absolute top-3 right-3">
            <div className={styles.badgeUnderConstruction}>
              <Wrench className="h-3.5 w-3.5" />
              Under Construction
            </div>
          </div>
        )}
      </div>
      <div className={styles.cardPad}>
        <div className="flex items-center justify-between">
          <h3 className="font-montserrat font-semibold">{p.name}</h3>
          {p.status && (
            <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-gray-700">{p.status}</span>
          )}
        </div>
        <div className="mt-1 text-sm text-gray-600">{p.address}</div>
        <div className="mt-3 flex items-center gap-2">
          <span className={styles.badgeDark}>
            {availableCount > 0 ? `${availableCount} Available` : 'Join Waitlist'}
          </span>
          <span className="text-xs text-gray-500">{rentLabel}</span>
        </div>
        <span className={`${styles.btn} ${styles.btnPrimary} mt-4`}>View Details</span>
      </div>
    </Link>
  );
}
