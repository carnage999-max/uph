import HeroSlider from '@/components/HeroSlider';
import MaineMap from '@/components/MaineMap';
import { styles } from '@/lib/constants';
import { listProperties } from '@/lib/properties';
import { Building2, HeartHandshake, ShieldCheck } from 'lucide-react';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createMetadata({
  title: 'About Us',
  description: 'Learn about Atlas Properties. We modernize legacy housing across Maine with resident-first values, quality renovations, and responsive management.',
  url: '/about',
});

const leadership = [
  {
    name: 'Nathan Reardon',
    title: 'Founder & CEO',
    bio: 'Nathan launched Atlas Properties to modernize legacy housing stock across Maine. He oversees acquisitions, long-term capital strategy, and the company’s resident-first operating standards.',
    // Optional image slot for future use
  }
];

export default async function AboutPage(){
  const properties = await listProperties();
  const totalUnits = properties.reduce((sum, property)=>
    sum + property.units.filter(unit => !unit.isHidden).length, 0);
  const cities = Array.from(new Set(properties.map((property)=> property.city)));
  const propertyTypes = Array.from(new Set(properties.map((property)=> property.type)));

  return (
    <div className="space-y-16">
      <HeroSlider
        images={['/images/hero/howland-front.jpeg', '/images/hero/dexter-front.jpeg']}
        headline="About Atlas Properties"
        subtext="Long-term ownership, thoughtful reinvestment, and better living standards across Maine communities."
      />

      <section className={`${styles.container} grid gap-10 lg:grid-cols-[1.6fr_1fr]`}>
        <div className="space-y-6">
          <h1 className="font-cinzel text-4xl font-bold text-[#e8e8e8]">Our Story</h1>
          <p className={`text-base ${styles.muted}`}>
            Atlas Properties started with a single building in Howland and a clear standard: every home should
            feel stable, well-maintained, and worth staying in. Since then, we&apos;ve continued to reinvest across
            central Maine with infrastructure upgrades, cleaner interiors, and responsive management that residents
            can rely on.
          </p>
          <div className={`${styles.card} ${styles.cardPad} space-y-4`}>
            <div>
              <h2 className="font-cinzel text-2xl font-semibold text-[#e8e8e8]">Mission</h2>
              <p className="text-sm text-[#b0b0b0]">
                Deliver reliable, modern apartments that strengthen neighborhoods and provide residents with a
                consistent, positive living experience.
              </p>
            </div>
            <div>
              <h2 className="font-cinzel text-2xl font-semibold text-[#e8e8e8]">Values</h2>
              <ul className="mt-2 space-y-3 text-sm text-[#d0d0d0]">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#e5c878]" />
                  <span>Proactive Maintenance – investing ahead of issues to keep residents comfortable year-round.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#e5c878]" />
                  <span>Responsible Growth – acquiring and renovating properties that elevate each community.</span>
                </li>
                <li className="flex items-start gap-2">
                  <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-[#e5c878]" />
                  <span>Resident Partnerships – clear communication, fair policies, and respectful service.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <aside className={`${styles.card} ${styles.cardPad} space-y-4`}>
          <h2 className="font-cinzel text-2xl font-semibold text-[#e8e8e8]">At a Glance</h2>
          <dl className="space-y-3 text-sm text-[#d0d0d0]">
            <div className="flex items-center justify-between">
              <dt>Total Residences</dt>
              <dd className="font-semibold text-[#e8e8e8]">{totalUnits}+ units</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Communities Served</dt>
              <dd className="font-semibold text-[#e8e8e8]">{cities.length} Maine cities</dd>
            </div>
            <div>
              <dt className="text-[#b0b0b0]">Property Mix</dt>
              <dd className="mt-1 text-[#e8e8e8]">{propertyTypes.join(' • ')}</dd>
            </div>
            <div>
              <dt className="text-[#b0b0b0]">Community Commitment</dt>
              <dd className="mt-1 text-[#d0d0d0]">
                Sustainable upgrades, responsive maintenance, and transparent resident communication remain at the
                core of our operating model.
              </dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className={`${styles.container} space-y-8`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-cinzel text-3xl font-semibold text-[#e8e8e8]">Leadership</h2>
          <p className="max-w-xl text-sm text-[#b0b0b0]">
            A hands-on team with backgrounds in property operations, construction, and resident services keeps our
            communities running smoothly.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {leadership.map((leader)=>(
            <div key={leader.name} className={`${styles.card} ${styles.cardPad} flex h-full flex-col`}>
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(201,162,39,0.22)] bg-[rgba(201,162,39,0.08)] font-montserrat text-lg font-semibold text-[#e5c878]">
                {leader.name.split(' ').map((part)=> part[0]).join('')}
              </div>
              <div className="mt-4">
                <h3 className="font-cinzel text-xl font-semibold text-[#e8e8e8]">{leader.name}</h3>
                <p className="text-sm text-[#b0b0b0]">{leader.title}</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#d0d0d0]">{leader.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.container} space-y-8`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-cinzel text-3xl font-semibold text-[#e8e8e8]">Our Properties</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#b0b0b0]">
              We actively manage a growing mix of multi-family buildings and single-family rentals across Maine’s
              emerging corridors—prioritizing neighborhoods where we can make a long-term impact.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className={`${styles.card} ${styles.cardPad}`}>
              <div className="text-2xl font-semibold text-[#e8e8e8]">{totalUnits}</div>
              <div className="text-xs uppercase tracking-wide text-[#8f8f8f]">Total Units</div>
            </div>
            <div className={`${styles.card} ${styles.cardPad}`}>
              <div className="text-2xl font-semibold text-[#e8e8e8]">{cities.length}</div>
              <div className="text-xs uppercase tracking-wide text-[#8f8f8f]">Cities</div>
            </div>
            <div className={`${styles.card} ${styles.cardPad}`}>
              <div className="text-2xl font-semibold text-[#e8e8e8]">{propertyTypes.length}</div>
              <div className="text-xs uppercase tracking-wide text-[#8f8f8f]">Property Types</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className={`${styles.card} ${styles.cardPad}`}>
            <h3 className="font-cinzel text-2xl font-semibold text-[#e8e8e8]">Portfolio Snapshot</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#d0d0d0]">
              {properties.map((property)=>{
                const visibleUnits = property.units.filter((unit)=> !unit.isHidden);
                return (
                <li key={property.id} className="flex items-start justify-between gap-4 border-b border-white/8 pb-3 last:border-none last:pb-0">
                  <div>
                    <div className="font-semibold text-[#e8e8e8]">{property.name}</div>
                    <div className="text-xs uppercase tracking-wide text-[#8f8f8f]">{property.city}, {property.state}</div>
                  </div>
                  <div className="text-xs text-[#8f8f8f]">
                    {visibleUnits.length} units • {property.type}
                  </div>
                </li>
              );})}
            </ul>
          </div>

          <div className={`${styles.card} ${styles.cardPad} space-y-4`}>
            <h3 className="font-cinzel text-2xl font-semibold text-[#e8e8e8]">Communities Across Maine</h3>
            <p className="text-sm text-[#b0b0b0]">
              Explore the same live map from the homepage to see where Atlas Properties is currently active.
            </p>
            <div className="overflow-hidden rounded-xl border border-white/8">
              <MaineMap />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
