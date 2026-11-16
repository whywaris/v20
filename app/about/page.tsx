import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Info } from 'lucide-react';
import AuthorBox from '@/components/blog/AuthorBox';
import { LegalPage, Section } from '@/components/layout/LegalPage';
import { CONTACT_EMAIL, NOT_AFFILIATED, OPERATOR_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About Us · YT Niches',
  description:
    'Who writes YT Niches, what the blog covers, how articles are researched, and our commitment to transparency.',
  alternates: { canonical: 'https://ytniches.com/about' },
};

export default function AboutPage() {
  return (
    <LegalPage icon={Info} badge="Company & Trust" title="About YT Niches">
      <Section title="Who runs YT Niches">
        <p>
          YT Niches is written and run by <strong>{OPERATOR_NAME}</strong>, an independent researcher who studies how small
          YouTube channels find an audience and turn it into income. It is a small, independent publication, not a media
          company or agency.
        </p>
        <p>{NOT_AFFILIATED}</p>
      </Section>

      <Section title="About the author">
        <AuthorBox heading="About the author" />
      </Section>

      <Section title="What we write about">
        <p>
          Most advice about choosing a YouTube niche is based on a handful of famous channels with millions of
          subscribers. Those are the worst examples to copy: they are hard to compete with and say little about what a
          new creator can realistically achieve.
        </p>
        <p>
          The <Link href="/">YT Niches blog</Link> focuses on what works for <strong>smaller channels</strong>: how to
          pick a niche that pays, which formats suit faceless creators, how to grow from zero, and how channels turn views
          into income through ads, sponsors and their own products.
        </p>
      </Section>

      <Section title="How our articles are researched">
        <ul>
          <li>
            Articles draw on publicly visible YouTube channels and videos, creator-reported benchmarks and our own
            analysis. Where we quote numbers, we say where they come from and when they were collected.
          </li>
          <li>
            <strong>RPM and earnings figures are estimates</strong>, not promises. RPM (revenue per 1,000 views) varies
            widely with audience country, video length, season and ad settings.
          </li>
          <li>Opinions and recommendations are clearly our own interpretation, not facts reported by the channels we mention.</li>
          <li>Articles are updated when the information in them changes; the date on each article shows when it was published.</li>
        </ul>
      </Section>

      <Section title="Our commitment to transparency">
        <ul>
          <li>Nothing on this site is financial advice or a promise of income (see our <Link href="/disclaimer">Earnings Disclaimer</Link>).</li>
          <li>The site is funded by advertising (Google AdSense). Ads are clearly separated from articles, and any sponsored content or affiliate links will be clearly marked.</li>
          <li>
            Creators mentioned in an article can ask us to correct or remove information at any time. Email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the article link and we will act on it within a
            few days.
          </li>
          <li>How we handle visitor data is explained in our <Link href="/privacy">Privacy Policy</Link> and <Link href="/cookies">Cookie Policy</Link>.</li>
        </ul>
      </Section>

      <Section title="Get in touch">
        <p>
          Questions, corrections, topic ideas or partnership requests: <Link href="/contact">contact us</Link> or email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </Section>
    </LegalPage>
  );
}
