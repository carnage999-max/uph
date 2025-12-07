import ApplicationForm from './parts/ApplicationForm';
import HeroSlider from '@/components/HeroSlider';
import { styles } from '@/lib/constants';
import { listProperties } from '@/lib/properties';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createMetadata({
  title: 'Apply Now',
  description: 'Apply for your next apartment at Ultimate Property Holdings. Complete our online rental application to get started.',
  url: '/apply',
});

export default async function ApplyPage(){
  const properties = await listProperties();
  return (
    <div className="space-y-12">
      <HeroSlider images={['/images/hero/howland-front.jpeg','/images/hero/pittsfield-front.jpeg','/images/hero/dexter-front.jpeg']} headline="Apply Now" subtext="Complete your rental application online to get started on your next home." />
      <div className={`${styles.container} grid gap-6 lg:grid-cols-3`}>
        <div className={`lg:col-span-2 ${styles.card} ${styles.cardPad}`}>
          <h1 className="font-montserrat text-2xl font-bold text-gray-900 mb-2">Rental Application</h1>
          <p className="text-sm text-gray-600 mb-6">
            Please fill out all required fields to submit your application. We'll review your application and contact you within 1-2 business days.
          </p>
          <ApplicationForm properties={properties} />
        </div>
        <div className={`${styles.card} ${styles.cardPad} text-sm text-gray-700`}>
          <div className="font-semibold text-lg mb-4">Application Process</div>
          <div className="space-y-3">
            <div>
              <div className="font-semibold">1. Submit Application</div>
              <div className="text-gray-600">Fill out the form with your information</div>
            </div>
            <div>
              <div className="font-semibold">2. Review Period</div>
              <div className="text-gray-600">We'll review your application within 1-2 business days</div>
            </div>
            <div>
              <div className="font-semibold">3. Contact</div>
              <div className="text-gray-600">We'll reach out to discuss next steps</div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="font-semibold">Questions?</div>
            <div className="mt-2 text-gray-600">
              Contact us at <a className="underline" href="tel:12079471999">207-947-1999</a> or <a className="underline" href="/contact">send us a message</a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

