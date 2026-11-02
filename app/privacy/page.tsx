import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Shield } from 'lucide-react';
import { LegalPage, Section } from '@/components/layout/LegalPage';
import { CONTACT_EMAIL, OPERATOR_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy · YT Niches',
  description:
    'Privacy Policy for YT Niches (ytniches.com): what data we collect, Google AdSense and DoubleClick cookies, third-party advertising, and your rights.',
  alternates: {
    canonical: 'https://ytniches.com/privacy',
  },
};

const LAST_UPDATED = 'November 2, 2026';

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      icon={Shield}
      badge="Legal & Transparency"
      title="Privacy Policy"
      subtitle={`Effective date: ${LAST_UPDATED} · https://ytniches.com/privacy`}
    >
      <Section title="1. Who we are">
        <p>
          YT Niches (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is an independent research website at{' '}
          <strong>https://ytniches.com</strong>, run by {OPERATOR_NAME}. This policy explains what information we
          collect when you visit, how it is used, and the choices you have. Contact:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </Section>

      <Section title="2. Information we collect">
        <ul>
          <li>
            <strong>No account required.</strong> You can browse the whole site without signing up. We do not currently
            offer user accounts, so we do not store names, passwords or profile data.
          </li>
          <li>
            <strong>Server logs.</strong> Our hosting provider, Vercel, automatically records technical data such as IP
            address, browser type, device type, referring page, pages requested and time of request. These logs are used
            for security and to keep the site running.
          </li>
          <li>
            <strong>Messages you send us.</strong> If you email us or use the contact form (which opens your own email
            app), we receive your name, email address and message.
          </li>
          <li>
            <strong>Browser storage.</strong> Your theme choice (dark/light) is stored in your own browser and never sent
            to us.
          </li>
          <li>
            <strong>Advertising cookies.</strong> Google and other ad vendors may collect information through cookies, as
            described in section 4.
          </li>
        </ul>
        <p>
          The channel information on this site is about public YouTube channels and comes from publicly visible YouTube
          data, not from our visitors. Channel owners can ask us to correct or remove it (see section 8).
        </p>
      </Section>

      <Section title="3. How we use information">
        <ul>
          <li>To operate, secure and improve the website.</li>
          <li>To reply to your messages and handle correction, removal or privacy requests.</li>
          <li>To show advertising that keeps the site free (section 4).</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </Section>

      <Section title="4. Advertising: Google AdSense and third-party vendors">
        <p>
          We use, or may use, <strong>Google AdSense</strong>, an advertising service provided by Google LLC, to display
          ads on this website.
        </p>
        <ul>
          <li>
            <strong>Third-party vendors, including Google, use cookies</strong> to serve ads based on a user&apos;s prior
            visits to this website or other websites.
          </li>
          <li>
            <strong>DoubleClick DART cookie:</strong> Google&apos;s use of advertising cookies, including the DoubleClick
            DART cookie, enables it and its partners to serve ads to our users based on their visits to this site and/or
            other sites on the internet.
          </li>
          <li>
            <strong>Other ad networks:</strong> third-party vendors and ad networks may also serve ads on our site and
            use cookies, web beacons or similar technologies to collect information about your visits. Their use of this
            information is governed by their own privacy policies, and we do not have access to or control over these
            cookies.
          </li>
        </ul>
        <p><strong>Your choices:</strong></p>
        <ul>
          <li>
            Opt out of personalized advertising by Google in{' '}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.
          </li>
          <li>
            Opt out of personalized advertising by other third-party vendors at{' '}
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>
            {' '}or, in the EU/UK,{' '}
            <a href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer">www.youronlinechoices.eu</a>.
          </li>
          <li>
            Read how Google uses information from sites that use its services at{' '}
            <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">policies.google.com/technologies/partner-sites</a>.
          </li>
        </ul>
        <p>
          More detail on each cookie and how to block them is in our <Link href="/cookies">Cookie Policy</Link>.
        </p>
      </Section>

      <Section title="5. Analytics">
        <p>
          We do not currently use analytics or tracking tools beyond our hosting provider&apos;s server logs. If that
          changes, this policy will name the tool and explain what it collects.
        </p>
      </Section>

      <Section title="6. Sharing">
        <p>We share information only with service providers that run the site, and only as needed:</p>
        <ul>
          <li><strong>Vercel Inc.</strong> (hosting and server logs)</li>
          <li><strong>Google LLC</strong> (advertising through AdSense, when ads are shown)</li>
        </ul>
        <p>We may also disclose information if required by law or to protect the site and its users.</p>
      </Section>

      <Section title="7. Data retention and security">
        <p>
          Server logs are kept only as long as our hosting provider needs them for security and operations. Emails are
          kept as long as needed to deal with your request. All traffic to the site is encrypted with HTTPS.
        </p>
      </Section>

      <Section title="8. Your rights">
        <p>
          Depending on where you live (for example under the GDPR in the EU/UK or the CCPA in California), you may have
          the right to access, correct or delete personal information we hold about you, to object to its use, and to
          opt out of personalized advertising. Channel owners may also ask us to correct or remove information about their
          channel. Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will respond within 30 days.
        </p>
      </Section>

      <Section title="9. Children's privacy">
        <p>
          This site is intended for adults and is not directed at children under 13 (or under 16 in the EU). We do not
          knowingly collect personal information from children. If you believe a child has sent us information, contact
          us and we will delete it.
        </p>
      </Section>

      <Section title="10. Changes to this policy">
        <p>
          We may update this policy as the site changes, for example if we add user accounts, analytics or new ad
          partners. The effective date at the top shows the latest version.
        </p>
      </Section>
    </LegalPage>
  );
}
