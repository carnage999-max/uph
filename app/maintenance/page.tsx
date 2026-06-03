import HeroSlider from '@/components/HeroSlider';
import { styles } from '@/lib/constants';
import { company } from '@/lib/data';
import { AlertTriangle, FileText, PhoneCall } from 'lucide-react';
import MaintenanceRequestForm from './MaintenanceRequestForm';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Maintenance Request',
  description: 'Submit a maintenance request online. Our responsive team is here to help with plumbing, electrical, heating, appliances, and more. Emergency service available.',
  url: '/maintenance',
});

const issueTypes = [
  'Plumbing',
  'Electrical',
  'Heating & Cooling',
  'Appliance',
  'Pest Control',
  'General Maintenance',
  'Other',
];

const faqs = [
  {
    question: 'What qualifies as an emergency?',
    answer:
      'Situations involving flooding, electrical hazards, no heat during freezing temperatures, or anything that threatens safety call for the emergency line.',
  },
  {
    question: 'How quickly will someone respond?',
    answer:
      'Non-emergency requests are reviewed within one business day. Our team follows up with a clear timeline for the repair.',
  },
  {
    question: 'Do I need to be home for maintenance?',
    answer:
      'If you grant entry permission in the form, our technicians can resolve the issue during work hours without you present.',
  },
  {
    question: 'Can I submit photos or videos?',
    answer:
      'Yes. Uploading a clear photo or video helps us diagnose issues faster and arrive prepared.',
  },
];

export default function MaintenancePage(){
  return (
    <div className="space-y-12">
      <HeroSlider
        images={['/images/hero/howland-front.jpeg']}
        headline="Maintenance & Support"
        subtext="Submit maintenance requests, track progress, and get quick answers."
      />

      <section className={`${styles.container} grid gap-6 lg:grid-cols-[2fr_1fr]`}>
        <div className="space-y-10">
          <div className={`${styles.card} ${styles.cardPad} space-y-6`}>
            <header className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(201,162,39,0.22)] bg-[rgba(201,162,39,0.08)] px-3 py-1 text-xs font-semibold text-[#e5c878]">
                <FileText className="h-4 w-4" />
                Submit a Request
              </div>
              <h1 className="font-cinzel text-3xl font-semibold text-[#e8e8e8]">
                Let us know what needs attention
              </h1>
              <p className="text-sm text-[#b0b0b0]">
                Provide a few details so our maintenance team can review and schedule a fix.
              </p>
            </header>

            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-semibold">Emergency maintenance?</div>
                <p>
                  Call our 24/7 hotline at{' '}
                  <a className="underline" href={`tel:${company.phone.replace(/[^0-9]/g, '')}`}>
                    {company.phone}
                  </a>{' '}
                  for immediate assistance with safety or utility issues.
                </p>
              </div>
            </div>

            <MaintenanceRequestForm issueTypes={issueTypes} />
          </div>

          <div className={`${styles.card} ${styles.cardPad} space-y-4`}>
            <header className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-[#e5c878]" />
              <h2 className="font-cinzel text-2xl font-semibold text-[#e8e8e8]">Maintenance Status</h2>
            </header>
            <p className="text-sm text-[#b0b0b0]">
              We&apos;re rolling out tenant portal access soon. Once live, you&apos;ll be able to log in, review updates, and message the maintenance team directly.
            </p>
            <div className="rounded-2xl border border-dashed border-[rgba(201,162,39,0.2)] bg-white/4 p-4 text-sm text-[#b0b0b0]">
              <div className="font-semibold text-[#e8e8e8]">Need an update now?</div>
              <p>
                Reach our support desk at{' '}
                <a className="underline" href={`tel:${company.phone.replace(/[^0-9]/g, '')}`}>
                  {company.phone}
                </a>{' '}
                or email{' '}
                <a className="underline" href={`mailto:${company.email}`}>
                  {company.email}
                </a>.
              </p>
            </div>
          </div>
        </div>

        <aside className={`${styles.card} ${styles.cardPad} space-y-4`}>
          <h2 className="font-cinzel text-2xl font-semibold text-[#e8e8e8]">Maintenance FAQ</h2>
          <div className="space-y-4 text-sm text-[#d0d0d0]">
            {faqs.map(faq => (
              <div key={faq.question} className="rounded-xl border border-white/8 bg-white/4 p-4">
                <div className="font-semibold text-[#e8e8e8]">{faq.question}</div>
                <p className="mt-1 text-[#b0b0b0]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
