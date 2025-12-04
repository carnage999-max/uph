import HeroSlider from '@/components/HeroSlider';
import { styles } from '@/lib/constants';
import { listProperties } from '@/lib/properties';
import { Building2, HeartHandshake, ShieldCheck } from 'lucide-react';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createMetadata({
  title: 'About Us',
  description: 'Learn about Ultimate Property Holdings. We modernize legacy housing across Maine with resident-first values, quality renovations, and responsive management.',
  url: '/about',
});

const leadership = [
  {
    name: 'Nathan Reardon',
    title: 'Founder & CEO',
    bio: 'Nathan launched Ultimate Property Holdings to modernize legacy housing stock across Maine. He oversees acquisitions, long-term capital strategy, and the company’s resident-first operating standards.',
    // Optional image slot for future use
  }
];

const markerPositions: Record<string, { top: string; left: string; }> = {
  'howland-6-main': { top: '32%', left: '58%' },
  'dexter-49-mill': { top: '45%', left: '52%' },
  'pittsfield-115-somerset': { top: '56%', left: '48%' },
};

export default async function AboutPage(){
  const properties = await listProperties();
  const totalUnits = properties.reduce((sum, property)=>
    sum + property.units.filter(unit => !unit.isHidden).length, 0);
  const cities = Array.from(new Set(properties.map((property)=> property.city)));
  const propertyTypes = Array.from(new Set(properties.map((property)=> property.type)));

  return (
    <div className="space-y-16">
      <HeroSlider
        images={['/logo/uph.jpeg']}
        headline="About Ultimate Property Holdings"
        subtext="Investing in vibrant Maine communities with modern, well-managed homes."
      />

      <section className={`${styles.container} grid gap-10 lg:grid-cols-[1.6fr_1fr]`}>
        <div className="space-y-6">
          <h1 className="font-montserrat text-3xl font-bold text-gray-900">Our Story</h1>
          <p className={`text-base ${styles.muted}`}>
            Ultimate Property Holdings started with a single building in Howland and a belief that quality
            housing should feel both attainable and well cared for. Today we continue to reinvest in communities
            across central Maine—upgrading mechanical systems, refreshing interiors, and partnering with local
            trades so every resident benefits from thoughtful stewardship.
          </p>
          <div className={`${styles.card} ${styles.cardPad} space-y-4`}>
            <div>
              <h2 className="font-montserrat text-xl font-semibold text-gray-900">Mission</h2>
              <p className="text-sm text-gray-700">
                Deliver reliable, modern apartments that strengthen neighborhoods and provide residents with a
                consistent, positive living experience.
              </p>
            </div>
            <div>
              <h2 className="font-montserrat text-xl font-semibold text-gray-900">Values</h2>
              <ul className="mt-2 space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#111827]" />
                  <span>Proactive Maintenance – investing ahead of issues to keep residents comfortable year-round.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#111827]" />
                  <span>Responsible Growth – acquiring and renovating properties that elevate each community.</span>
                </li>
                <li className="flex items-start gap-2">
                  <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-[#111827]" />
                  <span>Resident Partnerships – clear communication, fair policies, and respectful service.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <aside className={`${styles.card} ${styles.cardPad} space-y-4`}>
          <h2 className="font-montserrat text-xl font-semibold text-gray-900">At a Glance</h2>
          <dl className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <dt>Total Residences</dt>
              <dd className="font-semibold text-gray-900">{totalUnits}+ units</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Communities Served</dt>
              <dd className="font-semibold text-gray-900">{cities.length} Maine cities</dd>
            </div>
            <div>
              <dt className="text-gray-700">Property Mix</dt>
              <dd className="mt-1 text-gray-900">{propertyTypes.join(' • ')}</dd>
            </div>
            <div>
              <dt className="text-gray-700">Community Commitment</dt>
              <dd className="mt-1 text-gray-700">
                Sustainable upgrades, responsive maintenance, and transparent resident communication remain at the
                core of our operating model.
              </dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className={`${styles.container} space-y-8`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-montserrat text-2xl font-semibold text-gray-900">Leadership</h2>
          <p className="max-w-xl text-sm text-gray-600">
            A hands-on team with backgrounds in property operations, construction, and resident services keeps our
            communities running smoothly.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {leadership.map((leader)=>(
            <div key={leader.name} className={`${styles.card} ${styles.cardPad} flex h-full flex-col`}>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#111827]/10 font-montserrat text-lg font-semibold text-[#111827]">
                {leader.name.split(' ').map((part)=> part[0]).join('')}
              </div>
              <div className="mt-4">
                <h3 className="font-montserrat text-lg font-semibold text-gray-900">{leader.name}</h3>
                <p className="text-sm text-gray-600">{leader.title}</p>
              </div>
              <p className="mt-3 text-sm text-gray-700 leading-relaxed">{leader.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.container} space-y-8`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-montserrat text-2xl font-semibold text-gray-900">Our Properties</h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              We actively manage a growing mix of multi-family buildings and single-family rentals across Maine’s
              emerging corridors—prioritizing neighborhoods where we can make a long-term impact.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className={`${styles.card} ${styles.cardPad}`}>
              <div className="text-2xl font-semibold text-gray-900">{totalUnits}</div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Total Units</div>
            </div>
            <div className={`${styles.card} ${styles.cardPad}`}>
              <div className="text-2xl font-semibold text-gray-900">{cities.length}</div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Cities</div>
            </div>
            <div className={`${styles.card} ${styles.cardPad}`}>
              <div className="text-2xl font-semibold text-gray-900">{propertyTypes.length}</div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Property Types</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className={`${styles.card} ${styles.cardPad}`}>
            <h3 className="font-montserrat text-lg font-semibold text-gray-900">Portfolio Snapshot</h3>
            <ul className="mt-4 space-y-3 text-sm text-gray-700">
              {properties.map((property)=>{
                const visibleUnits = property.units.filter((unit)=> !unit.isHidden);
                return (
                <li key={property.id} className="flex items-start justify-between gap-4 border-b border-gray-200 pb-3 last:border-none last:pb-0">
                  <div>
                    <div className="font-semibold text-gray-900">{property.name}</div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">{property.city}, {property.state}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {visibleUnits.length} units • {property.type}
                  </div>
                </li>
              );})}
            </ul>
          </div>

          <div className={`${styles.card} ${styles.cardPad} space-y-4`}>
            <h3 className="font-montserrat text-lg font-semibold text-gray-900">Map of Active Communities</h3>
            <div className="relative h-80 overflow-hidden rounded-xl bg-linear-to-br from-sky-900 via-slate-900 to-slate-800">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.5)_0,transparent_55%),radial-gradient(circle_at_80%_30%,rgba(226,232,240,0.45)_0,transparent_50%),radial-gradient(circle_at_40%_80%,rgba(30,64,175,0.55)_0,transparent_60%)]" />
              {properties.map((property)=>{
                const marker = markerPositions[property.id] ?? { top: '50%', left: '50%' };
                return (
                <div
                  key={property.id}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
                  style={marker}
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#111827] shadow-md">
                    ●
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">
                    {property.city}
                  </span>
                </div>
              );})}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1 text-xs text-white/70 backdrop-blur">
                Marker positions approximate property locations across Maine.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
