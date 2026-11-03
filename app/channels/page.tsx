import { Metadata } from 'next';
import ChannelDirectory from '@/components/channels/ChannelDirectory';
import SuggestChannel from '@/components/channels/SuggestChannel';
import { toCardChannel } from '@/lib/card-channel';
import { getChannels } from '@/lib/data';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'YouTube Channel Directory · 6,800+ Small Channels Under 250k Subs | YT Niches',
  description:
    'Filter 6,800+ small YouTube channels (under 250k subscribers) by niche, format, size and monetization. See average views, estimated RPM and their top videos.',
  alternates: { canonical: `${SITE_URL}/channels` },
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim().slice(0, 100) || '';

export default async function ChannelsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const channels = await getChannels();
  const format = first(sp.format);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'YouTube Channel Directory',
            description: 'Small YouTube channels (under 250k subscribers) with estimated RPM, revenue and top videos.',
            url: `${SITE_URL}/channels`,
            numberOfItems: channels.length,
          }),
        }}
      />
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-ink)] sm:text-4xl">YouTube Channel Directory</h1>
        <p className="mt-2 text-[15px] text-[var(--text-muted)]">
          {channels.length.toLocaleString()} small channels under 250k subscribers. Filter by niche, format, size and monetization.
        </p>
      </div>
      <ChannelDirectory
        initialChannels={channels.slice(0, 12).map(toCardChannel)}
        totalChannelsCount={channels.length}
        initialQuery={first(sp.q)}
        initialCategory={first(sp.category)}
        initialFormat={format === 'avatar' || format === 'faceless' ? format : ''}
      />
      <SuggestChannel />
    </div>
  );
}
