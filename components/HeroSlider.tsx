'use client';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { styles } from '@/lib/constants';
import LuxuryCTA from '@/components/LuxuryCTA';

export default function HeroSlider({
  images,
  headline,
  subtext,
}: {
  images: string[];
  headline: string;
  subtext: string;
}) {
  const [idx, setIdx] = useState(0);
  const imgs = useMemo(
    () =>
      images.length
        ? images
        : [
            '/images/hero/howland-front.jpeg',
            '/images/hero/pittsfield-front.jpeg',
            '/images/hero/dexter-front.jpeg',
          ],
    [images],
  );
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % imgs.length), 10000);
    return () => clearInterval(t);
  }, [imgs.length]);

  return (
    <section className={`${styles.fullBleed} overflow-hidden`}>
      <div className={`${styles.hero} overflow-hidden`}>
        {imgs.map((src, i) => (
          <div
            key={src}
            className={`${styles.heroSlide} ${i === idx ? 'opacity-100' : 'opacity-0'}`}
          >
            <Image
              src={src}
              alt={`Hero ${i + 1}`}
              fill
              className={styles.heroImg}
              priority={i === 0}
              sizes="100vw"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-linear-to-r from-[#0a0a0a]/92 via-[#0a0a0a]/72 to-[#0a0a0a]/25" />
        <div className={styles.heroOverlay}>
          <div
            className={`${styles.container} relative z-10 flex max-w-3xl flex-col gap-4 py-20 sm:py-28`}
          >
            <p className={styles.sectionLabel}>Atlas Properties</p>
            <h1 className="font-cinzel text-4xl font-bold tracking-tight text-[#e8e8e8] drop-shadow-[0_10px_30px_rgba(0,0,0,0.65)] sm:text-6xl">
              {headline}
            </h1>
            <p className="max-w-xl text-base text-[#b0b0b0] sm:text-lg">{subtext}</p>
            <div className={styles.heroCta}>
              <LuxuryCTA href="/properties" label="Explore Properties" />
              <LuxuryCTA
                href="/apply"
                label="Apply Now"
                showOrnaments={false}
                className="max-w-[320px]!"
              />
              <LuxuryCTA
                href="/contact"
                label="Contact Us"
                showOrnaments={false}
                className="max-w-[320px]!"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
