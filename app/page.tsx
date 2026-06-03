import PropertyCard from '@/components/PropertyCard';
import HeroSlider from '@/components/HeroSlider';
import LuxuryCTA from '@/components/LuxuryCTA';
import { styles } from '@/lib/constants';
import {
  Building2,
  MapPin,
  Wrench,
  Heart,
  BadgeCheck,
  MessageCircle,
} from 'lucide-react';
import { listProperties } from '@/lib/properties';
import MaineMap from '@/components/MaineMap';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createMetadata({
  title: 'Home',
  description:
    'Premium residential apartments across Maine. Pet-friendly with $200 one-time fee, bad credit OK, and responsive ownership.',
  url: '/',
});

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h2 className={`${styles.h2} text-2xl`}>{title}</h2>
      <div className="section-divider" aria-hidden="true">
        <span className="section-divider__diamond" />
      </div>
      {description && (
        <p className={`mt-3 max-w-2xl text-sm ${styles.muted}`}>{description}</p>
      )}
    </div>
  );
}

export default async function HomePage() {
  const properties = await listProperties();
  return (
    <div className="space-y-20 pb-8">
      <HeroSlider
        images={[
          '/images/hero/howland-front.jpeg',
          '/images/hero/pittsfield-front.jpeg',
          '/images/hero/dexter-front.jpeg',
        ]}
        headline="Strength in Every Address."
        subtext="Premium residential holdings across Maine — managed with permanence, care, and responsive service."
      />

      <section className={styles.container}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              icon: Heart,
              title: 'Pet Friendly',
              copy: '$200 one-time fee',
            },
            {
              icon: BadgeCheck,
              title: 'Bad Credit OK',
              copy: 'We work with you',
            },
            {
              icon: MessageCircle,
              title: 'Responsive Owners',
              copy: 'Quick communication',
            },
          ].map(({ icon: Icon, title, copy }) => (
            <div
              key={title}
              className={`${styles.card} ${styles.cardPad} h-full text-center`}
            >
              <div className="flex justify-center">
                <span className={styles.iconCircle}>
                  <Icon className="h-6 w-6" />
                </span>
              </div>
              <h3 className={`mt-4 ${styles.h3}`}>{title}</h3>
              <p className={`mt-2 text-sm ${styles.muted}`}>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.container} space-y-8`}>
        <SectionHeading
          title="Why Choose Us"
          description="We pair modern amenities with attentive service so residents feel at home from day one."
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Building2,
              title: 'Modern, Managed Apartments',
              copy: 'Renovated interiors and thoughtful upgrades across every building.',
            },
            {
              icon: Wrench,
              title: 'Responsive Maintenance',
              copy: 'Dedicated team keeps everything running smoothly with quick turnarounds.',
            },
            {
              icon: MapPin,
              title: 'Prime Locations Across Maine',
              copy: 'Well-situated communities close to major employers and amenities.',
            },
          ].map(({ icon: Icon, title, copy }) => (
            <div
              key={title}
              className={`${styles.card} ${styles.cardPad} h-full text-center sm:text-left`}
            >
              <div className="flex justify-center sm:justify-start">
                <span className={styles.iconCircle}>
                  <Icon className="h-6 w-6" />
                </span>
              </div>
              <h3 className={`mt-4 ${styles.h3}`}>{title}</h3>
              <p className={`mt-2 text-sm ${styles.muted}`}>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.container}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading title="Featured Properties" />
          <LuxuryCTA
            href="/properties"
            label="Explore Properties"
            size="sm"
            showOrnaments={false}
            className="shrink-0 sm:mb-1"
          />
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.length === 0 ? (
            <div className={`${styles.card} ${styles.cardPad} text-sm ${styles.muted}`}>
              New listings will appear here soon. Check back shortly.
            </div>
          ) : (
            properties.map((p) => <PropertyCard key={p.id} p={p} />)
          )}
        </div>
      </section>

      <section className={`${styles.container}`}>
        <SectionHeading
          title="Our Locations in Maine"
          description="Interactive map — click pins to open the property listing."
        />
        <div className={`${styles.card} mt-6 overflow-hidden p-2 sm:p-3`}>
          <MaineMap />
        </div>
      </section>
    </div>
  );
}
