import React from 'react';
import { Metadata } from 'next';
import { Clock, Globe, Mail, MessageSquare } from 'lucide-react';
import { LegalPage, Section } from '@/components/layout/LegalPage';
import { CONTACT_EMAIL } from '@/lib/site';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us · YT Niches',
  description: `Contact YT Niches at ${CONTACT_EMAIL}. Questions, channel corrections, partnerships and privacy requests. We reply within 24–48 hours.`,
  alternates: { canonical: 'https://ytniches.com/contact' },
};

const DETAILS = [
  { icon: Mail, label: 'Email', value: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> },
  { icon: Clock, label: 'Response time', value: 'Within 24–48 hours on business days' },
  { icon: MessageSquare, label: 'Support hours', value: 'Monday to Friday' },
  { icon: Globe, label: 'Location', value: 'Online business, run remotely' },
];

export default function ContactPage() {
  return (
    <LegalPage icon={Mail} badge="Company & Trust" title="Contact Us" subtitle="We read every message.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DETAILS.map(({ icon: Icon, label, value }) => (
          <div key={label} className="glass rounded-xl border border-[var(--border-line)] p-4 flex gap-3">
            <Icon className="size-5 shrink-0 text-[var(--brand-mark)] mt-0.5" />
            <div>
              <p className="text-[12px] text-[var(--text-muted)]">{label}</p>
              <p className="text-[14px] font-semibold text-[var(--text-ink)] [&_a]:text-[var(--brand-mark)] [&_a]:underline break-all">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <ContactForm />

      <Section title="What we can help with">
        <ul>
          <li><strong>Channel corrections or removal:</strong> include the channel link and what should change.</li>
          <li><strong>Privacy requests:</strong> access or deletion of any data you sent us (see our Privacy Policy).</li>
          <li><strong>Advertising &amp; partnerships:</strong> sponsorships, data partnerships and media enquiries.</li>
          <li><strong>Bugs and feedback:</strong> anything broken or confusing on the site.</li>
        </ul>
        <p>We can&apos;t give personal financial advice or guarantee results for your channel.</p>
      </Section>
    </LegalPage>
  );
}
