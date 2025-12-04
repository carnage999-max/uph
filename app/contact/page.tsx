import ContactForm from './parts/ContactForm';
import { company } from '@/lib/data';
import HeroSlider from '@/components/HeroSlider';
import { styles } from '@/lib/constants';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Contact Us',
  description: 'Get in touch with Ultimate Property Holdings. We are here to help you find your next apartment in Maine. Call us at 207-947-1999 or send us a message.',
  url: '/contact',
});

export default function ContactPage(){
  return (
    <div className="space-y-12">
      <HeroSlider images={['/logo/uph.jpeg']} headline="Contact Us" subtext="Looking for your next apartment? Contact our team today." />
      <div className={`${styles.container} grid gap-6 lg:grid-cols-3`}>
        <div className={`lg:col-span-2 ${styles.card} ${styles.cardPad}`}>
          <ContactForm />
        </div>
        <div className={`${styles.card} ${styles.cardPad} text-sm text-gray-700`}>
          <div className="font-semibold">Office</div>
          <div className="mt-1">PO Box 52, Detroit, ME 04929</div>
          <div className="mt-1">Email: <a className="underline" href={`mailto:${company.email}`}>{company.email}</a></div>
          <div className="mt-1">Phone: <a className="underline" href="tel:12079471999">207-947-1999</a></div>
          <div className="mt-4">Hours: {company.hours}</div>
        </div>
      </div>
    </div>
  );
}
