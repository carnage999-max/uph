'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Play } from 'lucide-react';
import { styles } from '@/lib/constants';
import { isVideoUrl } from '@/lib/media';
import VideoPlayer from '@/components/VideoPlayer';
import type { Property, Unit } from '@/lib/types';

type GalleryUnit = { unit: Unit; index: number };

export default function PropertyDetailClient({ property }: { property: Property }){
  const [heroIdx, setHeroIdx] = useState(0);
  const [unitGallery, setUnitGallery] = useState<GalleryUnit | null>(null);

  const visibleUnits = useMemo(
    () => property.units.filter((unit) => !unit.isHidden),
    [property.units],
  );

  const heroImages = useMemo(() => {
    const gallery = property.gallery.length ? property.gallery : [];
    return [property.heroImageUrl, ...gallery];
  }, [property.gallery, property.heroImageUrl]);

  const openUnitGallery = (unit: Unit) => {
    if (!unit.gallery.length) return;
    setUnitGallery({ unit, index: 0 });
  };

  const closeUnitGallery = () => setUnitGallery(null);

  const stepUnitImage = (delta: number) => {
    setUnitGallery((current) => {
      if (!current) return current;
      const total = current.unit.gallery.length;
      const nextIndex = (current.index + delta + total) % total;
      return { unit: current.unit, index: nextIndex };
    });
  };

  useEffect(() => {
    if (!unitGallery) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeUnitGallery();
      if (event.key === 'ArrowLeft') stepUnitImage(-1);
      if (event.key === 'ArrowRight') stepUnitImage(1);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [unitGallery]);

  return (
    <div className={`${styles.container} space-y-6 pb-12`}>
      <a href="/properties" className="text-sm underline">
        ← Back to Properties
      </a>

      <div className="relative mt-4 overflow-hidden rounded-2xl border" style={{ height: '60vh' }}>
        {isVideoUrl(heroImages[heroIdx]) ? (
          <VideoPlayer
            key={heroImages[heroIdx]}
            src={heroImages[heroIdx]}
            alt={property.name}
            fill
            className="object-cover"
            objectFit="cover"
          />
        ) : (
          <Image 
            src={heroImages[heroIdx]} 
            alt={property.name} 
            fill 
            className="object-cover" 
            sizes="100vw"
            priority={heroIdx === 0}
          />
        )}
        {heroImages.length > 1 && (
          <>
            <button
              aria-label="Previous media"
              onClick={() => setHeroIdx((idx) => (idx - 1 + heroImages.length) % heroImages.length)}
              className={`${styles.btn} ${styles.btnGhost}`}
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
            >
              ‹
            </button>
            <button
              aria-label="Next media"
              onClick={() => setHeroIdx((idx) => (idx + 1) % heroImages.length)}
              className={`${styles.btn} ${styles.btnGhost}`}
              style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}
            >
              ›
            </button>
          </>
        )}
      </div>

      {heroImages.length > 1 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {heroImages.map((src, idx) => {
            const isVideo = isVideoUrl(src);
            return (
              <button
                key={src}
                className={`relative h-20 w-full overflow-hidden rounded-xl border ${
                  idx === heroIdx ? 'ring-2 ring-gray-900' : ''
                }`}
                onClick={() => setHeroIdx(idx)}
              >
                {isVideo ? (
                  <>
                    <video
                      src={src}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="h-4 w-4 text-white fill-white" />
                    </div>
                  </>
                ) : (
                  <Image 
                    src={src} 
                    alt={`${property.name} ${idx + 1}`} 
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 640px) 33vw, 16vw"
                    loading="lazy"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h1 className="font-montserrat text-2xl font-bold">{property.name}</h1>
            <div className="text-sm text-gray-600">{property.address}</div>
            <p className={`${styles.muted} mt-3`}>{property.description}</p>
            <div className="mt-4 text-sm text-gray-700">
              {[
                property.sqftApprox ? `Approx. ${property.sqftApprox}` : null,
                property.bathsSummary || null,
              ]
                .filter(Boolean)
                .join(' • ')}
            </div>
          </div>

          {visibleUnits.length > 0 && (
            <section>
              <h3 className="font-montserrat text-lg font-semibold">Units</h3>
              <p className="mt-2 text-sm text-gray-600">
                Select a unit to browse specific interiors and finishes.
              </p>
              <div className="mt-4 grid gap-3">
                {visibleUnits.map((unit) => {
                  const cover = unit.coverImageUrl || unit.gallery[0] || property.heroImageUrl;
                  return (
                    <div
                      key={unit.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openUnitGallery(unit)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openUnitGallery(unit);
                        }
                      }}
                      className="group rounded-xl border p-4 transition hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 items-center gap-3">
                          <div className="relative h-16 w-24 overflow-hidden rounded-lg border">
                            {isVideoUrl(cover) ? (
                              <>
                                <video
                                  src={cover}
                                  className="h-full w-full object-cover"
                                  muted
                                  playsInline
                                  preload="metadata"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <Play className="h-3 w-3 text-white fill-white" />
                                </div>
                              </>
                            ) : (
                              <Image 
                                src={cover} 
                                alt={unit.label} 
                                fill 
                                className="object-cover" 
                                sizes="96px"
                                loading="lazy"
                              />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{unit.label}</div>
                            <div className="text-sm text-gray-600">
                              {unit.bedrooms} BR • {unit.bathrooms} BA • {unit.sqft} sqft
                            </div>
                            <div className="mt-1 text-xs uppercase tracking-wide text-gray-500">
                              {unit.gallery.length ? `Click to view ${unit.gallery.length} photos` : 'Gallery coming soon'}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-3 sm:items-end sm:text-right">
                          <span className={styles.badgeDark}>
                            {unit.available ? 'Available' : 'Waitlist'}
                          </span>
                          <div className="text-sm font-semibold text-gray-900">
                            {unit.rent ? `$${unit.rent.toLocaleString()}` : 'Contact'}
                          </div>
                          <a
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            href={`/contact?property=${encodeURIComponent(property.slug)}&unit=${encodeURIComponent(unit.label)}`}
                            onClick={(event) => event.stopPropagation()}
                          >
                            Send Message
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <aside className={`${styles.card} ${styles.cardPad}`}>
          <div className="font-montserrat text-lg font-semibold">Amenities</div>
          <ul className="mt-2 list-disc pl-6 text-sm text-gray-700">
            {property.amenities.map((amenity) => (
              <li key={amenity}>{amenity}</li>
            ))}
          </ul>
          <div className="mt-6 font-montserrat text-lg font-semibold">Interested?</div>
          <a
            className={`${styles.btn} ${styles.btnPrimary} mt-2 inline-flex`}
            href={`/contact?property=${encodeURIComponent(property.slug)}`}
          >
            Send a Message
          </a>
          <div className="mt-6 text-sm text-gray-600">
            Office: PO Box 52, Detroit, ME 04929
            <br />
            Phone: <a className="underline" href="tel:12079471999">207-947-1999</a>
          </div>
        </aside>
      </div>

      {unitGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-10 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
            <button
              aria-label="Close gallery"
              className="absolute right-4 top-4 text-2xl text-gray-500 transition hover:text-gray-800"
              onClick={closeUnitGallery}
            >
              ✕
            </button>

            <h3 className="font-montserrat text-xl font-semibold text-gray-900">
              {unitGallery.unit.label}
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              {unitGallery.unit.bedrooms} BR • {unitGallery.unit.bathrooms} BA • {unitGallery.unit.sqft} sqft
            </div>

            <div className="relative mt-6 h-[45vh] rounded-xl bg-black sm:h-[55vh]">
              {unitGallery.unit.gallery.length ? (
                <>
                  {isVideoUrl(unitGallery.unit.gallery[unitGallery.index]) ? (
                    <VideoPlayer
                      key={`${unitGallery.unit.id}-${unitGallery.index}-${unitGallery.unit.gallery[unitGallery.index]}`}
                      src={unitGallery.unit.gallery[unitGallery.index]}
                      alt={`${unitGallery.unit.label} media ${unitGallery.index + 1}`}
                      fill
                      className="object-contain"
                      objectFit="contain"
                    />
                  ) : (
                    <Image
                      src={unitGallery.unit.gallery[unitGallery.index]}
                      alt={`${unitGallery.unit.label} photo ${unitGallery.index + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 896px"
                      priority
                    />
                  )}
                  {unitGallery.unit.gallery.length > 1 && (
                    <>
                      <button
                        aria-label="Previous unit media"
                        onClick={() => stepUnitImage(-1)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 text-lg font-bold text-gray-800 shadow z-10"
                      >
                        ‹
                      </button>
                      <button
                        aria-label="Next unit media"
                        onClick={() => stepUnitImage(1)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 text-lg font-bold text-gray-800 shadow z-10"
                      >
                        ›
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-white/80">
                  Unit photos coming soon.
                </div>
              )}
            </div>

            {unitGallery.unit.gallery.length > 1 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {unitGallery.unit.gallery.map((thumb, idx) => {
                  const isVideo = isVideoUrl(thumb);
                  return (
                    <button
                      key={thumb}
                      className={`relative h-16 w-24 overflow-hidden rounded-lg border ${
                        idx === unitGallery.index ? 'ring-2 ring-[#111827]' : 'opacity-80'
                      }`}
                      onClick={() => setUnitGallery({ unit: unitGallery.unit, index: idx })}
                    >
                      {isVideo ? (
                        <>
                          <video
                            src={thumb}
                            className="h-full w-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="h-3 w-3 text-white fill-white" />
                          </div>
                        </>
                      ) : (
                        <Image
                          src={thumb}
                          alt={`${unitGallery.unit.label} thumbnail ${idx + 1}`}
                          fill
                          sizes="96px"
                          className="object-cover"
                          loading="lazy"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
