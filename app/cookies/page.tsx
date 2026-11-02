import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Cookie } from 'lucide-react';
import { LegalPage, Section } from '@/components/layout/LegalPage';
import { CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Cookie Policy · YT Niches',
  description:
    'Which cookies and similar technologies YT Niches uses (essential, Google AdSense advertising, analytics) and how to manage or opt out of them.',
  alternates: { canonical: 'https://ytniches.com/cookies' },
};

const LAST_UPDATED = 'November 2, 2026';

export default function CookiePolicyPage() {
  return (
    <LegalPage icon={Cookie} badge="Legal" title="Cookie Policy" subtitle={`Last updated: ${LAST_UPDATED}`}>
      <Section title="1. What cookies are">
        <p>
          Cookies are small text files a website stores in your browser. Similar technologies, such as your
          browser&apos;s local storage, work in a similar way. This policy explains which ones YT Niches (ytniches.com)
          uses and how you can control them.
        </p>
      </Section>

      <Section title="2. Essential cookies and storage">
        <p>These are needed for the site to work and do not track you across other websites:</p>
        <ul>
          <li><strong>Theme preference</strong> (<code>yt_theme</code>, local storage): remembers whether you chose dark or light mode.</li>
          <li><strong>Admin session</strong> (<code>yt_admin</code>, cookie): set only when a site administrator logs in. Ordinary visitors never receive it.</li>
        </ul>
      </Section>

      <Section title="3. Advertising cookies (Google AdSense)">
        <p>
          We use, or may use, <strong>Google AdSense</strong> to show advertising. Google and its partners use cookies
          to serve ads and to measure their performance:
        </p>
        <ul>
          <li>
            Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website
            and other websites.
          </li>
          <li>
            Google&apos;s use of advertising cookies, including the <strong>DoubleClick (DART) cookie</strong>, enables
            it and its partners to serve ads to you based on your visits to this site and/or other sites on the internet.
          </li>
          <li>
            Other third-party ad vendors or networks may also use cookies, web beacons or similar technologies on our
            pages. We do not have access to or control over these cookies.
          </li>
        </ul>
        <p>
          Learn more in{' '}
          <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">How Google uses cookies in advertising</a>.
        </p>
      </Section>

      <Section title="4. Analytics">
        <p>
          We do not currently run any analytics or tracking scripts. Our hosting provider (Vercel) keeps standard server
          logs, such as IP address, browser type and pages requested, to keep the service secure and working. If we add
          an analytics tool, we will update this policy and name it here.
        </p>
      </Section>

      <Section title="5. How to manage or opt out">
        <ul>
          <li>
            <strong>Personalized ads from Google:</strong> turn them off in{' '}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.
          </li>
          <li>
            <strong>Other vendors:</strong> opt out of personalized advertising at{' '}
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">www.aboutads.info/choices</a>
            {' '}(US) or{' '}
            <a href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer">www.youronlinechoices.eu</a> (EU/UK).
          </li>
          <li>
            <strong>Your browser:</strong> block or delete cookies and site data in your browser settings. Blocking
            essential storage may reset your theme choice.
          </li>
          <li>
            <strong>EEA, UK and Swiss visitors:</strong> when ads run, a Google-certified consent banner will ask for your
            consent before any advertising cookies are set, and you will be able to change that choice at any time.
          </li>
        </ul>
        <p>Opting out of personalized ads does not remove ads; you will see ads that are less relevant to you.</p>
      </Section>

      <Section title="6. Changes and contact">
        <p>
          We may update this policy when our use of cookies changes; the date at the top shows the latest version.
          Questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. See also our{' '}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
