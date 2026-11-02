import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Info } from 'lucide-react';
import { LegalPage, Section } from '@/components/layout/LegalPage';
import { CONTACT_EMAIL, NOT_AFFILIATED, OPERATOR_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About Us · YT Niches',
  description:
    'Who runs YT Niches, why it was built, how channel stats, RPM estimates and outlier scores are researched, and our commitment to transparency.',
  alternates: { canonical: 'https://ytniches.com/about' },
};

export default function AboutPage() {
  return (
    <LegalPage icon={Info} badge="Company & Trust" title="About YT Niches">
      <Section title="Who runs YT Niches">
        <p>
          YT Niches is built and run by <strong>{OPERATOR_NAME}</strong>, an independent researcher who studies how small
          YouTube channels find an audience and turn it into income. It is a small, independent project, not a media
          company or agency.
        </p>
        <p>{NOT_AFFILIATED}</p>
      </Section>

      <Section title="Why we built it">
        <p>
          Most advice about choosing a YouTube niche is based on a handful of famous channels with millions of
          subscribers. Those are the worst examples to copy: they are hard to compete with and say little about what a
          new creator can realistically achieve.
        </p>
        <p>
          YT Niches focuses on <strong>low-competition channels with under 250,000 subscribers</strong>. Seeing what
          works for smaller channels (their topics, formats, upload rhythm and how they make money) gives new creators a
          more honest picture of where an opportunity really is.
        </p>
      </Section>

      <Section title="How our research works">
        <ul>
          <li>
            <strong>Channel statistics</strong> (subscribers, total views, video counts, popular videos) come from
            publicly visible YouTube channel data. They are snapshots taken at the time of collection, so live numbers on
            YouTube may be higher or lower.
          </li>
          <li>
            <strong>RPM ranges and revenue figures are estimates</strong>, not real earnings. RPM (revenue per 1,000
            views) is estimated per topic from publicly reported creator benchmarks. Actual RPM varies widely with
            audience country, video length, season and ad settings. Monthly revenue figures multiply estimated views by
            that range.
          </li>
          <li>
            <strong>Outlier scores</strong> compare a video&apos;s views with the typical views of the channel that
            published it. A 10&times; outlier got about ten times the channel&apos;s usual views.
          </li>
          <li>
            <strong>Niche labels, formats and &ldquo;why it works&rdquo; notes</strong> are our own research and
            interpretation of public titles, descriptions and thumbnails. They are opinions, not facts reported by the
            channels.
          </li>
          <li>
            We exclude TV networks, broadcast media and large kids-animation channels, because they are not realistic
            models for an independent creator.
          </li>
        </ul>
        <p>
          More detail on how we read the data is in our <Link href="/blog">research articles</Link>.
        </p>
      </Section>

      <Section title="Our commitment to transparency">
        <ul>
          <li>Estimates are always labeled as estimates. Nothing on this site is financial advice or a promise of income (see our <Link href="/disclaimer">Earnings Disclaimer</Link>).</li>
          <li>If we show advertising, sponsored content or affiliate links, they will be clearly marked.</li>
          <li>
            Channel owners can ask us to correct or remove information about their channel at any time. Email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the channel link and we will act on it within a
            few days.
          </li>
          <li>How we handle visitor data is explained in our <Link href="/privacy">Privacy Policy</Link> and <Link href="/cookies">Cookie Policy</Link>.</li>
        </ul>
      </Section>

      <Section title="Get in touch">
        <p>
          Questions, corrections or partnership ideas: <Link href="/contact">contact us</Link> or email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </Section>
    </LegalPage>
  );
}
