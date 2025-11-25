'use client';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { styles } from '@/lib/constants';

export default function HeroSlider({ images, headline, subtext }:{ images: string[]; headline: string; subtext: string; }){
  const [idx, setIdx] = useState(0);
  const imgs = useMemo(()=> images.length ? images : ['/images/hero/howland-front.jpeg','/images/hero/pittsfield-front.jpeg','/images/hero/dexter-front.jpeg'], [images]);
  useEffect(()=>{
    const t = setInterval(()=> setIdx(i => (i+1) % imgs.length), 5000);
    return () => clearInterval(t);
  }, [imgs.length]);

  return (
    <section className={`${styles.fullBleed} overflow-hidden`}>
      <div className={`${styles.hero} overflow-hidden`}>
        {imgs.map((src, i)=>(
          <div
            key={src}
            className={`${styles.heroSlide} ${i === idx ? 'opacity-100' : 'opacity-0'}`}
          >
            <Image
              src={src}
              alt={`Hero ${i+1}`}
              fill
              className={styles.heroImg}
              priority={i===0}
              sizes="100vw"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-linear-to-r from-[#0b1120]/80 via-[#0b1120]/60 to-transparent" />
        <div className={styles.heroOverlay}>
          <div className={`${styles.container} relative z-10 flex max-w-2xl flex-col gap-4 py-20 sm:py-28`}>
            <h1 className="font-montserrat text-4xl font-bold tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)] sm:text-6xl">
              {headline}
            </h1>
            <p className="text-base text-white/80 sm:text-lg">
              {subtext}
            </p>
            <div className={styles.heroCta}>
              <a
                href="/properties"
                className={`${styles.btn} ${styles.btnPrimary} px-6 py-4`}
              >
                View Properties
              </a>
              <a
                href="/contact"
                className={`${styles.btn} px-6 py-4 border-white/40! bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20`}
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
