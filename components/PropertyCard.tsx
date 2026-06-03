import { styles } from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';
import { Wrench } from 'lucide-react';
import type { Property } from '@/lib/types';
import LuxuryCTA from '@/components/LuxuryCTA';

export default function PropertyCard({ p }: { p: Property }) {
  const visibleUnits = p.units.filter((u) => !u.isHidden);
  const availableCount = visibleUnits.filter((u) => u.available).length;
  const rentLabel = p.rentFrom
    ? `From $${p.rentFrom.toLocaleString()}`
    : 'Contact for pricing';
  return (
    <Link
      className={`${styles.card} group block overflow-hidden`}
      href={`/properties/${p.slug}`}
    >
      <div className="relative h-56 w-full">
        <Image
          src={p.heroImageUrl}
          alt={p.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a]/80 via-transparent to-transparent" />
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
        <div className="flex items-center justify-between gap-2">
          <h3 className={styles.h3}>{p.name}</h3>
          {p.status && (
            <span className="shrink-0 rounded-full border border-[rgba(201,162,39,0.25)] px-2.5 py-0.5 text-xs font-medium text-[#c9a227]">
              {p.status}
            </span>
          )}
        </div>
        <div className={`mt-1 text-sm ${styles.muted}`}>{p.address}</div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={styles.badgeDark}>
            {availableCount > 0 ? `${availableCount} Available` : 'Join Waitlist'}
          </span>
          <span className={`text-xs ${styles.muted}`}>{rentLabel}</span>
        </div>
        <div className="mt-5 flex justify-center sm:justify-start">
          <LuxuryCTA
            as="span"
            label="View Details"
            size="sm"
            showOrnaments={false}
            className="w-full! max-w-[240px]"
          />
        </div>
      </div>
    </Link>
  );
}
