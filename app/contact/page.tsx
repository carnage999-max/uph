import ContactForm from './parts/ContactForm';
import { company } from '@/lib/data';
import HeroSlider from '@/components/HeroSlider';
import { styles } from '@/lib/constants';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Contact Us',
  description: 'Get in touch with Atlas Properties. We are here to help you find your next apartment in Maine. Call us at 207-947-1999 or send us a message.',
  url: '/contact',
});

export default function ContactPage(){
  return (
    <div className="space-y-12">
      <HeroSlider
        images={['/images/hero/pittsfield-front.jpeg', '/images/hero/howland-front.jpeg']}
        headline="Contact Atlas Properties"
        subtext="Questions about leasing, current availability, or support? Our team is ready to help."
      />
      <div className={`${styles.container} grid gap-6 lg:grid-cols-3`}>
        <div className={`lg:col-span-2 ${styles.card} ${styles.cardPad} space-y-4`}>
          <div>
            <h1 className="font-cinzel text-3xl font-semibold text-[#e8e8e8]">Send Us a Message</h1>
            <p className="mt-2 text-sm text-[#b0b0b0]">
              Share a few details and we&apos;ll point you to the right property, unit, or support contact.
            </p>
          </div>
          <ContactForm />
        </div>
        <div className={`${styles.card} ${styles.cardPad} space-y-4 text-sm text-[#d0d0d0]`}>
          <div>
            <div className="font-cinzel text-xl font-semibold text-[#e8e8e8]">Office</div>
            <div className="mt-2 text-[#b0b0b0]">{company.mailing}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <div className="font-semibold text-[#e8e8e8]">Direct Contact</div>
            <div className="mt-2">
              Email:{' '}
              <a className="text-[#e5c878] underline underline-offset-4" href={`mailto:${company.email}`}>
                {company.email}
              </a>
            </div>
            <div className="mt-1">
              Phone:{' '}
              <a className="text-[#e5c878] underline underline-offset-4" href="tel:12079471999">
                207-947-1999
              </a>
            </div>
          </div>
          <div className="text-[#b0b0b0]">Hours: {company.hours}</div>
        </div>
      </div>
    </div>
  );
}
