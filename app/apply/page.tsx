import ApplicationForm from './parts/ApplicationForm';
import HeroSlider from '@/components/HeroSlider';
import { styles } from '@/lib/constants';
import { listProperties } from '@/lib/properties';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createMetadata({
  title: 'Apply Now',
  description: 'Apply for your next apartment at Atlas Properties. Complete our online rental application to get started.',
  url: '/apply',
});

export default async function ApplyPage(){
  const properties = await listProperties();
  return (
    <div className="space-y-12">
      <HeroSlider images={['/images/hero/howland-front.jpeg','/images/hero/pittsfield-front.jpeg','/images/hero/dexter-front.jpeg']} headline="Apply Now" subtext="Complete your rental application online to get started on your next home." />
      <div className={`${styles.container} grid gap-6 lg:grid-cols-3`}>
        <div className={`lg:col-span-2 ${styles.card} ${styles.cardPad}`}>
          <h1 className="mb-2 font-cinzel text-3xl font-bold text-[#e8e8e8]">Rental Application</h1>
          <p className="mb-6 text-sm text-[#b0b0b0]">
            Please fill out all required fields to submit your application. We'll review your application and contact you within 1-2 business days.
          </p>
          <ApplicationForm properties={properties} />
        </div>
        <div className={`${styles.card} ${styles.cardPad} text-sm text-[#d0d0d0]`}>
          <div className="mb-4 font-cinzel text-2xl font-semibold text-[#e8e8e8]">Application Process</div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <div className="font-semibold text-[#e8e8e8]">1. Submit Application</div>
              <div className="text-[#b0b0b0]">Fill out the form with your information</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <div className="font-semibold text-[#e8e8e8]">2. Review Period</div>
              <div className="text-[#b0b0b0]">We'll review your application within 1-2 business days</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <div className="font-semibold text-[#e8e8e8]">3. Contact</div>
              <div className="text-[#b0b0b0]">We'll reach out to discuss next steps</div>
            </div>
          </div>
          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="font-semibold text-[#e8e8e8]">Questions?</div>
            <div className="mt-2 text-[#b0b0b0]">
              Contact us at <a className="underline" href="tel:12079471999">207-947-1999</a> or <a className="underline" href="/contact">send us a message</a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
