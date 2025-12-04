import PropertyCard from '@/components/PropertyCard';
import HeroSlider from '@/components/HeroSlider';
import { styles } from '@/lib/constants';
import { listProperties } from '@/lib/properties';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createMetadata({
  title: 'Properties',
  description: 'Browse our available residential apartments across Maine. Pet-friendly properties with flexible credit options and responsive management.',
  url: '/properties',
});

export default async function PropertiesPage(){
  const properties = await listProperties();
  return (
    <div className="space-y-12">
      <HeroSlider images={[]} headline="Our Properties" subtext="Browse available units and neighborhoods." />
      <div className={`${styles.container} grid gap-6 sm:grid-cols-2 lg:grid-cols-3`}>
        {properties.length === 0 ? (
          <div className={`${styles.card} ${styles.cardPad} text-sm text-gray-600`}>
            No properties are published yet. Use the admin dashboard to add your first listing.
          </div>
        ) : (
          properties.map(p => (<PropertyCard key={p.id} p={p} />))
        )}
      </div>
    </div>
  );
}
