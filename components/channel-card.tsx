import Link from "next/link";
import { compact } from "@/lib/format";

export type ChannelCardData = {
  handle: string;
  title: string;
  avatar_url: string | null;
  subscribers: number | null;
  total_views: number | null;
  video_count: number | null;
  language: string | null;
  country: string | null;
};

export const CHANNEL_CARD_COLUMNS = "handle, title, avatar_url, subscribers, total_views, video_count, language, country";

export function ChannelCard({ c }: { c: ChannelCardData }) {
  return (
    <Link href={`/channel/${c.handle}`} className="block rounded-lg border p-4 transition hover:border-neutral-400">
      <div className="flex items-center gap-3">
        {c.avatar_url && (
          // eslint-disable-next-line @next/next/no-img-element -- YouTube CDN images, no need to proxy
          <img src={c.avatar_url} alt="" width={48} height={48} loading="lazy" className="size-12 rounded-full" />
        )}
        <div className="min-w-0">
          <h3 className="truncate font-medium">{c.title}</h3>
          <p className="truncate text-sm text-neutral-500">@{c.handle}{c.country ? ` · ${c.country}` : ""}</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 text-sm">
        <div><dt className="text-neutral-500">Subs</dt><dd className="font-medium">{compact(c.subscribers)}</dd></div>
        <div><dt className="text-neutral-500">Views</dt><dd className="font-medium">{compact(c.total_views)}</dd></div>
        <div><dt className="text-neutral-500">Videos</dt><dd className="font-medium">{compact(c.video_count)}</dd></div>
      </dl>
    </Link>
  );
}

export function JsonLd({ data }: { data: object }) {
  // "<" escaped so a channel title can't close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
